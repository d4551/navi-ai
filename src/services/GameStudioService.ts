/**
 * GameStudioService - Business logic layer for gaming company operations
 * Interfaces between UI components and StudioRepository
 */

import { StudioRepository } from '@/modules/db/repositories/studios';
import type { GameStudio, GameGenre, StudioType, Platform } from '@/shared/types/jobs';
import { logger } from '@/shared/utils/logger';

export interface GameStudioFilters {
  type?: StudioType;
  location?: string;
  size?: string;
  technologies?: string[];
  remoteWork?: boolean;
  hasGames?: boolean;
  genres?: GameGenre[];
  platforms?: Platform[];
}

export interface StudioSearchResult {
  studios: GameStudio[];
  total: number;
  filters: GameStudioFilters;
  facets: {
    types: Array<{ type: StudioType; count: number }>;
    locations: Array<{ location: string; count: number }>;
    sizes: Array<{ size: string; count: number }>;
    technologies: Array<{ technology: string; count: number }>;
  };
}

export class GameStudioService {
  searchStudios(arg0: string) {
    throw new Error('Method not implemented.');
  }
  private static instance: GameStudioService;

  private constructor() {}

  static getInstance(): GameStudioService {
    if (!GameStudioService.instance) {
      GameStudioService.instance = new GameStudioService();
    }
    return GameStudioService.instance;
  }

  // Get all studios with optional filtering and pagination
  async getStudios(
    filters?: GameStudioFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<StudioSearchResult> {
    try {
      let studios = Object.values(await StudioRepository.getAll());

      // Apply filters
      if (filters) {
        studios = await this.applyFilters(studios, filters);
      }

      // Calculate facets
      const facets = await this.calculateFacets(studios);

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStudios = studios.slice(startIndex, endIndex);

      return {
        studios: paginatedStudios,
        total: studios.length,
        filters: filters || {},
        facets
      };
    } catch (error) {
      logger.error('Error getting studios:', error);
      return {
        studios: [],
        total: 0,
        filters: filters || {},
        facets: {
          types: [],
          locations: [],
          sizes: [],
          technologies: []
        }
      };
    }
  }

  // Get a single studio by ID
  async getStudioById(id: string): Promise<GameStudio | null> {
    try {
      return await StudioRepository.getById(id);
    } catch (error) {
      logger.error('Error getting studio by ID:', error);
      return null;
    }
  }

  // Find studio by company name (for job/company matching)
  async findByCompanyName(companyName: string): Promise<GameStudio | null> {
    try {
      const studio = await StudioRepository.findByCompanyName(companyName);

      if (!studio) {
        // Try fuzzy matching for better UX
        const allStudios = Object.values(await StudioRepository.getAll());
        return this.fuzzyMatchStudio(companyName, allStudios);
      }

      return studio;
    } catch (error) {
      logger.error('Error finding studio by company name:', error);
      return null;
    }
  }

  // Get favorite studios
  async getFavoriteStudios(): Promise<GameStudio[]> {
    try {
      const favoriteIds = await StudioRepository.getFavorites();
      const favorites: GameStudio[] = [];

      for (const id of favoriteIds) {
        const studio = await StudioRepository.getById(id);
        if (studio) {
          favorites.push(studio);
        }
      }

      return favorites;
    } catch (error) {
      logger.error('Error getting favorite studios:', error);
      return [];
    }
  }

  // Toggle favorite status
  async toggleFavorite(studioId: string): Promise<boolean> {
    try {
      const isFavorite = await StudioRepository.isFavorite(studioId);

      if (isFavorite) {
        await StudioRepository.removeFavorite(studioId);
        return false;
      } else {
        await StudioRepository.addFavorite(studioId);
        return true;
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // Check if a studio is favorited
  async isStudioFavorite(studioId: string): Promise<boolean> {
    try {
      return await StudioRepository.isFavorite(studioId);
    } catch (error) {
      logger.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Get studio suggestions for autocomplete
  async getSuggestions(query: string, limit: number = 10): Promise<GameStudio[]> {
    try {
      if (!query.trim()) {
        // Return recently viewed or popular studios if no query
        return await this.getPopularStudios(limit);
      }

      return await StudioRepository.getSuggestions(query, limit);
    } catch (error) {
      logger.error('Error getting suggestions:', error);
      return [];
    }
  }

  // Advanced search with full criteria support
  async advancedSearch(criteria: {
    query?: string;
    filters?: GameStudioFilters;
    sortBy?: 'name' | 'size' | 'founded' | 'rating';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<StudioSearchResult> {
    try {
      const {
        query = '',
        filters = {},
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 20
      } = criteria;

      // Get initial results
      let results = Object.values(await StudioRepository.getAll());

      // Apply text search
      if (query) {
        results = results.filter(studio =>
          studio.name.toLowerCase().includes(query.toLowerCase()) ||
          (studio.description && studio.description.toLowerCase().includes(query.toLowerCase())) ||
          studio.technologies.some(tech => tech.toLowerCase().includes(query.toLowerCase())) ||
          studio.games.some(game => game.toLowerCase().includes(query.toLowerCase()))
        );
      }

      // Apply filters
      results = await this.applyFilters(results, filters);

      // Apply sorting
      results = this.sortStudios(results, sortBy, sortOrder);

      // Calculate facets
      const facets = await this.calculateFacets(results);

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);

      return {
        studios: paginatedResults,
        total: results.length,
        filters,
        facets
      };
    } catch (error) {
      logger.error('Error in advanced search:', error);
      throw error;
    }
  }

  // Get studios by category (enterprise, large, medium, small, indie)
  async getStudiosByCategory(category: string): Promise<GameStudio[]> {
    try {
      return await StudioRepository.getByCategory(category);
    } catch (error) {
      logger.error('Error getting studios by category:', error);
      return [];
    }
  }

  // Get studios by region
  async getStudiosByRegion(region: string): Promise<GameStudio[]> {
    try {
      return await StudioRepository.getByRegion(region);
    } catch (error) {
      logger.error('Error getting studios by region:', error);
      return [];
    }
  }

  // Get popular/recommended studios
  async getPopularStudios(limit: number = 10): Promise<GameStudio[]> {
    try {
      const allStudios = Object.values(await StudioRepository.getAll());

      // Sort by size and founded date (established large studios tend to be more popular)
      return allStudios
        .sort((a, b) => {
          // Primary sort: larger studios first
          const sizeA = this.extractStudioSize(a);
          const sizeB = this.extractStudioSize(b);
          if (sizeA !== sizeB) return sizeB - sizeA;

          // Secondary sort: older/more established first
          return (a.founded || 2025) - (b.founded || 2025);
        })
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting popular studios:', error);
      return [];
    }
  }

  // Get recently founded studios (trending)
  async getRecentStudios(limit: number = 10): Promise<GameStudio[]> {
    try {
      const allStudios = Object.values(await StudioRepository.getAll());

      return allStudios
        .filter(studio => studio.founded && studio.founded >= 2015)
        .sort((a, b) => (b.founded || 0) - (a.founded || 0))
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting recent studios:', error);
      return [];
    }
  }

  // Get studio statistics
  async getStudioStats(): Promise<{
    totalStudios: number;
    byType: Record<string, number>;
    byRegion: Record<string, number>;
    avgStudiosPerTechnology: number;
    mostCommonTechnologies: Array<{ tech: string; count: number }>;
    totalOpenPositions: number;
    averageSalary: number;
    growthRate: number;
  }> {
    try {
      const studios = Object.values(await StudioRepository.getAll());

      // Count by type
      const byType: Record<string, number> = {};
      studios.forEach(studio => {
        byType[studio.type] = (byType[studio.type] || 0) + 1;
      });

      // Count by region
      const byRegion: Record<string, number> = {};
      studios.forEach(studio => {
        const region = this.categorizeRegion(studio.location);
        byRegion[region] = (byRegion[region] || 0) + 1;
      });

      // Most common technologies
      const techCounts: Record<string, number> = {};
      studios.forEach(studio => {
        studio.technologies.forEach(tech => {
          techCounts[tech] = (techCounts[tech] || 0) + 1;
        });
      });

      const mostCommonTechnologies = Object.entries(techCounts)
        .map(([tech, count]) => ({ tech, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const avgStudiosPerTechnology =
        mostCommonTechnologies.length > 0
          ? studios.length / Math.max(1, mostCommonTechnologies[0].count)
          : 0;

      // Aggregate additional analytics
      const totalOpenPositions = studios.reduce(
        (sum, studio) => sum + (studio.openPositions || 0),
        0
      );

      const salarySamples = studios
        .filter(s => s.averageSalary)
        .map(s => (s.averageSalary!.min + s.averageSalary!.max) / 2);
      const averageSalary =
        salarySamples.length > 0
          ? salarySamples.reduce((a, b) => a + b, 0) / salarySamples.length
          : 0;

      const currentYear = new Date().getFullYear();
      const recentStudios = studios.filter(
        s => s.founded && s.founded >= currentYear - 1
      ).length;
      const growthRate = studios.length
        ? (recentStudios / studios.length) * 100
        : 0;

      return {
        totalStudios: studios.length,
        byType,
        byRegion,
        avgStudiosPerTechnology,
        mostCommonTechnologies,
        totalOpenPositions,
        averageSalary,
        growthRate
      };
    } catch (error) {
      logger.error('Error calculating studio stats:', error);
      return {
        totalStudios: 0,
        byType: {},
        byRegion: {},
        avgStudiosPerTechnology: 0,
        mostCommonTechnologies: [],
        totalOpenPositions: 0,
        averageSalary: 0,
        growthRate: 0
      };
    }
  }

  // Private helper methods

  private async applyFilters(studios: GameStudio[], filters: GameStudioFilters): Promise<GameStudio[]> {
    let filtered = [...studios];

    if (filters.type) {
      filtered = filtered.filter(studio => studio.type === filters.type);
    }

    if (filters.location) {
      const locationQuery = filters.location.toLowerCase();
      filtered = filtered.filter(studio =>
        studio.location.toLowerCase().includes(locationQuery)
      );
    }

    if (filters.size) {
      filtered = filtered.filter(studio => studio.size === filters.size);
    }

    if (filters.technologies && filters.technologies.length > 0) {
      filtered = filtered.filter(studio =>
        filters.technologies!.every(tech =>
          studio.technologies.some(studioTech =>
            studioTech.toLowerCase().includes(tech.toLowerCase())
          )
        )
      );
    }

    if (filters.remoteWork !== undefined) {
      filtered = filtered.filter(studio => !!studio.culture.remoteFirst === filters.remoteWork);
    }

    if (filters.hasGames) {
      filtered = filtered.filter(studio => studio.games.length > 0);
    }

    if (filters.genres && filters.genres.length > 0) {
      filtered = filtered.filter(studio => {
        const studioGenres = this.extractStudioGenres(studio);
        return filters.genres!.some(genre => studioGenres.includes(genre));
      });
    }

    return filtered;
  }

  private sortStudios(studios: GameStudio[], sortBy: string, sortOrder: 'asc' | 'desc'): GameStudio[] {
    return studios.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = this.extractStudioSize(a) - this.extractStudioSize(b);
          break;
        case 'founded':
          comparison = (a.founded || 2025) - (b.founded || 2025);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        default:
          return 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private async calculateFacets(studios: GameStudio[]): Promise<StudioSearchResult['facets']> {
    const types: Array<{ type: StudioType; count: number }> = [];
    const locations: Array<{ location: string; count: number }> = [];
    const sizes: Array<{ size: string; count: number }> = [];
    const technologies: Array<{ technology: string; count: number }> = [];

    // Count types
    const typeCounts: Record<string, number> = {};
    studios.forEach(studio => {
      typeCounts[studio.type] = (typeCounts[studio.type] || 0) + 1;
    });
    Object.entries(typeCounts).forEach(([type, count]) => {
      types.push({ type: type as StudioType, count });
    });

    // Count locations
    const locationCounts: Record<string, number> = {};
    studios.forEach(studio => {
      locationCounts[studio.location] = (locationCounts[studio.location] || 0) + 1;
    });
    Object.entries(locationCounts).forEach(([location, count]) => {
      locations.push({ location, count });
    });

    // Count sizes
    const sizeCounts: Record<string, number> = {};
    studios.forEach(studio => {
      sizeCounts[studio.size] = (sizeCounts[studio.size] || 0) + 1;
    });
    Object.entries(sizeCounts).forEach(([size, count]) => {
      sizes.push({ size, count });
    });

    // Count technologies
    const techCounts: Record<string, number> = {};
    studios.forEach(studio => {
      studio.technologies.forEach(tech => {
        techCounts[tech] = (techCounts[tech] || 0) + 1;
      });
    });
    Object.entries(techCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20) // Top 20 technologies
      .forEach(([technology, count]) => {
        technologies.push({ technology, count });
      });

    return { types, locations, sizes, technologies };
  }

  private fuzzyMatchStudio(companyName: string, studios: GameStudio[]): GameStudio | null {
    // Simple fuzzy matching for company names
    const normalized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const studio of studios) {
      const studioNormalized = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if company name contains studio name or vice versa
      if (normalized.includes(studioNormalized) || studioNormalized.includes(normalized)) {
        return studio;
      }

      // Check for common abbreviations
      if (this.isAbbreviationMatch(companyName, studio.name)) {
        return studio;
      }
    }

    return null;
  }

  private isAbbreviationMatch(name1: string, name2: string): boolean {
    // Common abbreviations like "AC" for "Activision", "BBB" for "Blizzard" etc.
    const words1 = name1.split(/\s+/).filter(word => word.length > 0);
    const words2 = name2.split(/\s+/).filter(word => word.length > 0);

    // If one is very short and the other contains similar letters, might be abbreviation
    if (words1.length === 1 && words2.length > 1 && words1[0].length <= 3) {
      const abbreviation = words1[0].toLowerCase();
      const fullName = words2.slice(0, 3).join('').toLowerCase();
      return fullName.includes(abbreviation);
    }

    return false;
  }

  private extractStudioGenres(studio: GameStudio): string[] {
    const genres: string[] = [];
    const desc = (studio.description || '').toLowerCase();
    const games = studio.games.join(' ').toLowerCase();

    if (desc.includes('rpg') || games.includes('rpg')) genres.push('RPG');
    if (desc.includes('action') || games.includes('action')) genres.push('Action');
    if (desc.includes('strategy') || games.includes('strategy')) genres.push('Strategy');
    if (desc.includes('shooter') || games.includes('shooter')) genres.push('Shooter');
    if (desc.includes('simulation') || games.includes('simulation')) genres.push('Simulation');
    if (desc.includes('puzzle') || games.includes('puzzle')) genres.push('Puzzle');
    if (desc.includes('racing') || games.includes('racing')) genres.push('Racing');
    if (desc.includes('sports') || games.includes('sports')) genres.push('Sports');

    return genres;
  }

  private extractStudioSize(studio: GameStudio): number {
    const sizeStr = studio.size.toLowerCase();
    const match = sizeStr.match(/(\d+)/);
    if (match) return parseInt(match[1]);
    if (sizeStr.includes('enterprise')) return 5000;
    if (sizeStr.includes('large')) return 2000;
    if (sizeStr.includes('medium')) return 200;
    if (sizeStr.includes('small')) return 50;
    if (sizeStr.includes('indie')) return 10;
    return 0;
  }

  private categorizeRegion(location: string): string {
    // Simple region categorization - could be enhanced with better location data
    const loc = location.toLowerCase();

    if (loc.includes('california') || loc.includes('san francisco') || loc.includes('los angeles') ||
        loc.includes('new york') || loc.includes('seattle') || loc.includes('boston')) {
      return 'North America';
    }

    if (loc.includes('london') || loc.includes('uk') || loc.includes('manchester') ||
        loc.includes('germany') || loc.includes('berlin') || loc.includes('paris') ||
        loc.includes('france') || loc.includes('amsterdam') || loc.includes('helsinki') ||
        loc.includes('stockholm') || loc.includes('warsaw')) {
      return 'Europe';
    }

    if (loc.includes('tokyo') || loc.includes('japan') || loc.includes('shanghai') ||
        loc.includes('china') || loc.includes('korea') || loc.includes('seoul')) {
      return 'Asia-Pacific';
    }

    return 'Other';
  }
}

// Export singleton instance
export const gameStudioService = GameStudioService.getInstance();
