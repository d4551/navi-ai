/**
 * SearchService - Comprehensive search functionality for gaming studios and roles
 * Provides advanced filtering, autocomplete, and search capabilities
 */

import {
  GAMING_STUDIOS,
  ROLE_TYPES,
  ROLE_CATEGORIES,
  STUDIO_CATEGORIES,
  TECHNOLOGY_TAGS
} from '../constants/gaming-studios';
import { roleDataService, type RoleDetail } from './RoleDataService';
import type { 
  GameStudio, 
  SearchFilters, 
  SearchQuery, 
  SearchResult, 
  AutocompleteOption,
  RoleInfo 
} from '../types/interview';
import { semanticSearchService } from './SemanticSearchService';

export class SearchService {
  private studios: GameStudio[];
  private roles: string[];
  private searchIndex: Map<string, string[]>;
  private roleCache: Map<string, RoleDetail>;

  constructor() {
    this.studios = Object.values(GAMING_STUDIOS);
    this.roles = [...ROLE_TYPES];
    this.searchIndex = this.buildSearchIndex();
    this.roleCache = new Map();
  }

  /**
   * Build search index for fast text-based searches
   */
  private buildSearchIndex(): Map<string, string[]> {
    const index = new Map<string, string[]>();
    
    // Index studios
    this.studios.forEach(studio => {
      const searchTerms = [
        studio.name.toLowerCase(),
        studio.description.toLowerCase(),
        ...studio.games.map(game => game.toLowerCase()),
        ...studio.technologies.map(tech => tech.toLowerCase()),
        ...studio.commonRoles.map(role => role.toLowerCase()),
        studio.headquarters.toLowerCase(),
        ...studio.culture.values.map(value => value.toLowerCase())
      ];
      
      index.set(studio.id, searchTerms);
    });

    return index;
  }

  /**
   * Perform advanced search with filters
   */
  search(query: SearchQuery): SearchResult {
    let filteredStudios = this.studios;

    // Apply text search
    if (query.query && query.query.trim()) {
      const searchTerm = query.query.toLowerCase().trim();
      filteredStudios = filteredStudios.filter(studio => {
        const terms = this.searchIndex.get(studio.id) || [];
        return terms.some(term => term.includes(searchTerm));
      });
    }

    // Apply filters
    filteredStudios = this.applyFilters(filteredStudios, query.filters);

    // Apply sorting
    if (query.sortBy) {
      filteredStudios = this.sortResults(filteredStudios, query.sortBy, query.sortOrder || 'asc');
    }

    // Filter roles based on selected studios
    const relevantRoles = this.getRelevantRoles(filteredStudios, query.filters);

    return {
      studios: filteredStudios,
      roles: relevantRoles,
      totalCount: filteredStudios.length,
      appliedFilters: query.filters
    };
  }

  /**
   * Apply search filters to studio list
   */
  private applyFilters(studios: GameStudio[], filters: SearchFilters): GameStudio[] {
    return studios.filter(studio => {
      // Studio categories filter
      if (filters.studioCategories?.length) {
        const studioCategory = this.getStudioCategory(studio.id);
        if (!filters.studioCategories.includes(studioCategory)) {
          return false;
        }
      }

      // Technologies filter
      if (filters.technologies?.length) {
        const hasMatchingTech = filters.technologies.some(tech =>
          studio.technologies.some(studioTech =>
            studioTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) {
          return false;
        }
      }

      // Role categories filter
      if (filters.roleCategories?.length) {
        const hasMatchingRole = filters.roleCategories.some(category => {
          const categoryRoles = ROLE_CATEGORIES[category as keyof typeof ROLE_CATEGORIES] || [];
          return categoryRoles.some(role =>
            studio.commonRoles.includes(role)
          );
        });
        if (!hasMatchingRole) {
          return false;
        }
      }

      // Company size filter
      if (filters.companySizes?.length) {
        const studioSize = this.getCompanySize(studio.size);
        if (!filters.companySizes.includes(studioSize)) {
          return false;
        }
      }

      // Founded year filter
      if (filters.founded) {
        if (filters.founded.min && studio.founded < filters.founded.min) {
          return false;
        }
        if (filters.founded.max && studio.founded > filters.founded.max) {
          return false;
        }
      }

      // Publicly traded filter
      if (filters.publiclyTraded !== undefined) {
        if (studio.publiclyTraded !== filters.publiclyTraded) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort search results
   */
  private sortResults(studios: GameStudio[], sortBy: string, sortOrder: 'asc' | 'desc'): GameStudio[] {
    return studios.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'founded':
          comparison = a.founded - b.founded;
          break;
        case 'size': {
          const sizeA = this.getEmployeeCount(a.size);
          const sizeB = this.getEmployeeCount(b.size);
          comparison = sizeA - sizeB;
          break;
        }
        case 'relevance':
          // For relevance, we could implement a scoring system
          // For now, default to name sorting
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get relevant roles from filtered studios
   */
  private getRelevantRoles(studios: GameStudio[], filters: SearchFilters): string[] {
    const roleSet = new Set<string>();
    
    studios.forEach(studio => {
      studio.commonRoles.forEach(role => roleSet.add(role));
    });

    let roles = Array.from(roleSet);

    // Apply role category filter if specified
    if (filters.roleCategories?.length) {
      const allowedRoles = new Set<string>();
      filters.roleCategories.forEach(category => {
        const categoryRoles = ROLE_CATEGORIES[category as keyof typeof ROLE_CATEGORIES] || [];
        categoryRoles.forEach(role => allowedRoles.add(role));
      });
      roles = roles.filter(role => allowedRoles.has(role));
    }

    return roles.sort();
  }

  /**
   * Get autocomplete suggestions with semantic search fallback
   */
  async getAutocompleteOptions(query: string, maxResults: number = 10): Promise<AutocompleteOption[]> {
    const lowerQuery = query.toLowerCase();
    const options: AutocompleteOption[] = [];

    // First, try traditional keyword matching
    // Studio suggestions
    this.studios.forEach(studio => {
      if (studio.name.toLowerCase().includes(lowerQuery)) {
        options.push({
          value: studio.id,
          label: studio.name,
          category: 'studio',
          description: studio.description
        });
      }
    });

    // Role suggestions
    this.roles.forEach(role => {
      if (role.toLowerCase().includes(lowerQuery)) {
        const category = this.getRoleCategory(role);
        options.push({
          value: role,
          label: role,
          category: 'role',
          description: `${category} role`
        });
      }
    });

    // Technology suggestions
    TECHNOLOGY_TAGS.forEach(tech => {
      if (tech.toLowerCase().includes(lowerQuery)) {
        options.push({
          value: tech,
          label: tech,
          category: 'technology',
          description: 'Technology/Tool'
        });
      }
    });

    // If we don't have enough results, enhance with semantic search
    if (options.length < maxResults && query.length > 2) {
      try {
        const semanticSuggestions = await semanticSearchService.getSemanticSuggestions(
          query,
          maxResults - options.length
        );
        
        // Add semantic suggestions that aren't already in the results
        semanticSuggestions.forEach(suggestion => {
          const exists = options.some(option => 
            option.value === suggestion.value && option.category === suggestion.category
          );
          if (!exists) {
            options.push(suggestion);
          }
        });
      } catch (error) {
        console.warn('Semantic search failed, falling back to keyword search:', error);
      }
    }

    // Sort by relevance (exact matches first, then contains)
    options.sort((a, b) => {
      const aExact = a.label.toLowerCase() === lowerQuery;
      const bExact = b.label.toLowerCase() === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.label.localeCompare(b.label);
    });

    return options.slice(0, maxResults);
  }

  /**
   * Synchronous version for backward compatibility
   */
  getAutocompleteOptionsSync(query: string, maxResults: number = 10): AutocompleteOption[] {
    const lowerQuery = query.toLowerCase();
    const options: AutocompleteOption[] = [];

    // Studio suggestions
    this.studios.forEach(studio => {
      if (studio.name.toLowerCase().includes(lowerQuery)) {
        options.push({
          value: studio.id,
          label: studio.name,
          category: 'studio',
          description: studio.description
        });
      }
    });

    // Role suggestions
    this.roles.forEach(role => {
      if (role.toLowerCase().includes(lowerQuery)) {
        const category = this.getRoleCategory(role);
        options.push({
          value: role,
          label: role,
          category: 'role',
          description: `${category} role`
        });
      }
    });

    // Technology suggestions
    TECHNOLOGY_TAGS.forEach(tech => {
      if (tech.toLowerCase().includes(lowerQuery)) {
        options.push({
          value: tech,
          label: tech,
          category: 'technology',
          description: 'Technology/Tool'
        });
      }
    });

    // Sort by relevance (exact matches first, then contains)
    options.sort((a, b) => {
      const aExact = a.label.toLowerCase() === lowerQuery;
      const bExact = b.label.toLowerCase() === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.label.localeCompare(b.label);
    });

    return options.slice(0, maxResults);
  }

  /**
   * Get detailed role information
   */
  async getRoleInfo(roleName: string): Promise<RoleInfo | null> {
    if (!this.roles.includes(roleName)) {
      return null;
    }

    const category = this.getRoleCategory(roleName);

    const demandLevel = await this.getRoleDemand(roleName);
    return {
      name: roleName,
      category,
      description: await this.getRoleDescription(roleName),
      requiredSkills: await this.getRoleSkills(roleName),
      preferredSkills: this.getPreferredSkills(roleName),
      ...(demandLevel ? { demandLevel } : {}),
      careerPath: this.getCareerPath(roleName)
    };
  }

  /**
   * Get studios that commonly hire for a specific role
   */
  getStudiosForRole(roleName: string): GameStudio[] {
    return this.studios.filter(studio => 
      studio.commonRoles.includes(roleName)
    );
  }

  /**
   * Get role category for a given role
   */
  public getRoleCategory(roleName: string): string {
    for (const [category, roles] of Object.entries(ROLE_CATEGORIES)) {
      if ((roles as readonly string[]).includes(roleName)) {
        return category;
      }
    }
    return 'Other';
  }

  /**
   * Get studio category for a given studio ID
   */
  private getStudioCategory(studioId: string): string {
    for (const [category, studioIds] of Object.entries(STUDIO_CATEGORIES)) {
      if ((studioIds as readonly string[]).includes(studioId)) {
        return category;
      }
    }
    return 'Other';
  }

  /**
   * Map company size string to category
   */
  private getCompanySize(sizeString: string): string {
    const sizeNum = this.getEmployeeCount(sizeString);
    
    if (sizeNum <= 10) return 'Startup (1-10)';
    if (sizeNum <= 50) return 'Small (11-50)';
    if (sizeNum <= 200) return 'Medium (51-200)';
    if (sizeNum <= 1000) return 'Large (201-1000)';
    return 'Enterprise (1000+)';
  }

  /**
   * Extract employee count from size string
   */
  private getEmployeeCount(sizeString: string): number {
    const match = sizeString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Fetch role details with caching and error handling
   */
  private async fetchRoleData(roleName: string): Promise<RoleDetail | null> {
    const key = roleName.toLowerCase();
    const cached = this.roleCache.get(key);
    if (cached) return cached;

    try {
      const role = await roleDataService.getRole(roleName);
      if (role) this.roleCache.set(key, role);
      return role;
    } catch (error) {
      console.warn('Role data fetch failed:', error);
      return this.roleCache.get(key) || null;
    }
  }

  /**
   * Get basic role description
   */
  private async getRoleDescription(roleName: string): Promise<string> {
    const role = await this.fetchRoleData(roleName);
    return role?.description ?? '';
  }

  /**
   * Get required skills for a role
   */
  private async getRoleSkills(roleName: string): Promise<string[]> {
    const role = await this.fetchRoleData(roleName);
    return role?.requiredSkills ?? [];
  }

  /**
   * Get preferred skills for a role
   */
  private getPreferredSkills(roleName: string): string[] {
    const category = this.getRoleCategory(roleName);
    const preferredMap: Record<string, string[]> = {
      'Engineering': ['Unity', 'Unreal Engine', 'Git', 'Agile'],
      'Design': ['Figma', 'User Research', 'Analytics', 'A/B Testing'],
      'Art': ['Maya', 'Photoshop', 'Substance', 'Blender'],
      // Add more as needed
    };
    
    return preferredMap[category] || [];
  }

  /**
   * Get role demand level
   */
  private async getRoleDemand(roleName: string): Promise<'low' | 'medium' | 'high' | null> {
    const role = await this.fetchRoleData(roleName);
    return role?.demandLevel ?? null;
  }

  /**
   * Get career path for a role
   */
  private getCareerPath(roleName: string): string[] {
    const pathMap: Record<string, string[]> = {
      'Software Engineer': ['Junior Developer', 'Software Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager'],
      'Game Designer': ['Assistant Designer', 'Game Designer', 'Senior Designer', 'Lead Designer', 'Design Director'],
      // Add more as needed
    };
    
    return pathMap[roleName] || [roleName];
  }

  /**
   * Perform semantic search across all content
   */
  async semanticSearch(query: string, options: any = {}): Promise<any[]> {
    try {
      const results = await semanticSearchService.semanticSearch(query, {
        threshold: options.threshold || 0.1,
        maxResults: options.maxResults || 20,
        filters: options.filters,
        boostFactors: options.boostFactors
      });

      return results.map(result => ({
        ...result.item.metadata,
        type: result.item.type,
        similarity: result.similarity,
        relevanceBoost: result.relevanceBoost,
        matchedTerms: result.matchedTerms
      }));
    } catch (error) {
      console.warn('Semantic search failed:', error);
      return [];
    }
  }

  /**
   * Find similar studios or roles
   */
  async findSimilar(itemId: string, itemType: 'studio' | 'role' | 'technology', maxResults: number = 5): Promise<any[]> {
    try {
      const results = await semanticSearchService.findSimilar(itemId, itemType, maxResults);
      
      return results.map(result => ({
        ...result.item.metadata,
        type: result.item.type,
        similarity: result.similarity
      }));
    } catch (error) {
      console.warn('Find similar failed:', error);
      return [];
    }
  }

  /**
   * Get intelligent search suggestions based on context
   */
  async getIntelligentSuggestions(context: {
    userRole?: string;
    userSkills?: string[];
    userLocation?: string;
    preferredStudioTypes?: string[];
  }): Promise<AutocompleteOption[]> {
    const suggestions: AutocompleteOption[] = [];

    try {
      // Build context-aware query
      const contextQuery = [
        context.userRole,
        ...(context.userSkills || []),
        context.userLocation,
        ...(context.preferredStudioTypes || [])
      ].filter(Boolean).join(' ');

      if (contextQuery.trim()) {
        const semanticResults = await semanticSearchService.semanticSearch(contextQuery, {
          threshold: 0.05,
          maxResults: 10
        });

        semanticResults.forEach(result => {
          const { item } = result;
          let label = '';
          let description = '';

          if (item.type === 'studio') {
            const studio = item.metadata as GameStudio;
            label = studio.name;
            description = `${studio.size} • ${studio.headquarters} • ${studio.category}`;
          } else if (item.type === 'role') {
            label = item.metadata.name;
            description = `${item.metadata.category} role`;
          }

          suggestions.push({
            value: item.id,
            label,
            category: item.type,
            description
          });
        });
      }
    } catch (error) {
      console.warn('Intelligent suggestions failed:', error);
    }

    return suggestions;
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics() {
    const traditionalAnalytics = {
      totalStudios: this.studios.length,
      totalRoles: this.roles.length,
      totalTechnologies: TECHNOLOGY_TAGS.length
    };

    const semanticAnalytics = semanticSearchService.getSearchAnalytics();

    return {
      ...traditionalAnalytics,
      semantic: semanticAnalytics
    };
  }
}

// Singleton instance
export const searchService = new SearchService();