// Studio Repository - Database operations for gaming studio data
// Centralized studio information and normalization

import { unifiedStorage } from '@/utils/storage';
import { GAMING_STUDIOS } from '@/shared/constants/gaming-studios'
import type { NormalizedStudio } from '../../api/schemas';

export interface StudioData extends NormalizedStudio {
  aliases: string[];
  parentCompany?: string;
  subsidiaries?: string[];
  locations: Array<{
    city: string;
    country: string;
    type: 'headquarters' | 'office' | 'studio';
  }>;
  financials?: {
    revenue?: number;
    employees?: number;
    stockSymbol?: string;
  };
  reputation: {
    glassdoorRating?: number;
    employeeReviews?: number;
    gameRatings?: Array<{
      game: string;
      rating: number;
      platform: string;
    }>;
  };
  hiringData?: {
    openPositions?: number;
    recentHires?: number;
    averageSalary?: Record<string, number>;
    benefits?: string[];
  };
  lastUpdated: Date;
  dataSource: string[];
}

export class StudioRepository {
  private static readonly STORE_KEY = 'gameStudios';
  private static readonly ALIASES_KEY = 'studioAliases';
  private static readonly NORMALIZATION_KEY = 'studioNormalization';

  static async ensureInitialized(): Promise<void> {
    try {
      const current = await this.getAll();
      if (current && current.length > 0) return;

      // Seed from GAMING_STUDIOS if IDB store is empty
      const seed = Object.values(GAMING_STUDIOS || {}) as any[];
      if (seed.length === 0) return;

      for (const s of seed) {
        try {
          await (unifiedStorage as any).upsertStudio?.(s);
        } catch {}
      }
    } catch {}
  }

  static async getAll(): Promise<StudioData[]> {
    // Prefer normalized studios persisted in IndexedDB (canonical path)
    try {
      const idbStudios = await (unifiedStorage as any).getAllStudios?.();
      if (Array.isArray(idbStudios) && idbStudios.length > 0) {
        return idbStudios as StudioData[];
      }
    } catch {}

    // Fallback to legacy local storage key
    const legacy = await unifiedStorage.get(this.STORE_KEY);
    return Array.isArray(legacy) ? legacy : [];
  }

  static async getById(id: string): Promise<StudioData | null> {
    const studios = await this.getAll();
    return studios.find(studio => studio.id === id) || null;
  }

  static async getByName(name: string): Promise<StudioData | null> {
    const studios = await this.getAll();
    const normalizedName = name.toLowerCase().trim();
    
    return studios.find(studio => 
      studio.name.toLowerCase() === normalizedName ||
      studio.aliases.some(alias => alias.toLowerCase() === normalizedName)
    ) || null;
  }

  /**
   * Backwards-compatible helper used by GameStudioService.
   * Attempts to resolve a studio by a company name string using
   * exact name, alias map and a loose contains match.
   */
  static async findByCompanyName(companyName: string): Promise<StudioData | null> {
    try {
      if (!companyName || typeof companyName !== 'string') return null;
      // 1) Exact or alias match
      const direct = await this.getByName(companyName);
      if (direct) return direct;

      // 2) Alias map lookup
      const aliasId = await this.getStudioIdByAlias(companyName);
      if (aliasId) {
        const byAlias = await this.getById(aliasId);
        if (byAlias) return byAlias;
      }

      // 3) Loose normalized contains match (strip common suffixes)
      const norm = companyName
        .toLowerCase()
        .replace(/[,\.]/g, ' ')
        .replace(/\b(inc|llc|ltd|corp(oration)?|studios?|games?|entertainment|interactive)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const studios = await this.getAll();
      const loose = studios.find(s => {
        const name = (s.name || '').toLowerCase();
        if (name.includes(norm)) return true;
        return (s.aliases || []).some(a => (a || '').toLowerCase().includes(norm));
      });
      return loose || null;
    } catch {
      return null;
    }
  }

  static async create(studioData: Omit<StudioData, 'id' | 'lastUpdated'>): Promise<StudioData> {
    const studios = await this.getAll();
    
    // Generate ID using crypto or fallback  
    const getCrypto = () => {
      if (typeof crypto !== 'undefined') {
        return crypto;
      }
      if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto;
      }
      // Fallback for environments without crypto
      return {
        randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
      };
    };
    
    const newStudio: StudioData = {
      ...studioData,
      id: getCrypto().randomUUID(),
      lastUpdated: new Date()
    };
    
    studios.push(newStudio);
    await unifiedStorage.set(this.STORE_KEY, studios);
    await this.updateAliasMapping(newStudio);
    
    return newStudio;
  }

  static async update(id: string, updates: Partial<StudioData>): Promise<StudioData | null> {
    const studios = await this.getAll();
    const studioIndex = studios.findIndex(studio => studio.id === id);
    
    if (studioIndex === -1) return null;
    
    const updatedStudio: StudioData = {
      ...studios[studioIndex],
      ...updates,
      lastUpdated: new Date()
    };
    
    studios[studioIndex] = updatedStudio;
    await unifiedStorage.set(this.STORE_KEY, studios);
    await this.updateAliasMapping(updatedStudio);
    
    return updatedStudio;
  }

  static async delete(id: string): Promise<boolean> {
    const studios = await this.getAll();
    const filteredStudios = studios.filter(studio => studio.id !== id);
    
    if (filteredStudios.length === studios.length) return false;
    
    await unifiedStorage.set(this.STORE_KEY, filteredStudios);
    await this.rebuildAliasMapping();
    
    return true;
  }

  // Search and filtering
  static async search(criteria: {
    query?: string;
    location?: string;
    size?: string;
    publiclyTraded?: boolean;
    hasOpenings?: boolean;
  }): Promise<StudioData[]> {
    const allStudios = await this.getAll();
    let filtered = [...allStudios];

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filtered = filtered.filter(studio =>
        studio.name.toLowerCase().includes(query) ||
        studio.aliases.some(alias => alias.toLowerCase().includes(query)) ||
        studio.games?.some(game => game.toLowerCase().includes(query)) ||
        studio.description?.toLowerCase().includes(query)
      );
    }

    if (criteria.location) {
      const location = criteria.location.toLowerCase();
      filtered = filtered.filter(studio =>
        studio.headquarters?.toLowerCase().includes(location) ||
        studio.locations.some(loc => 
          loc.city.toLowerCase().includes(location) ||
          loc.country.toLowerCase().includes(location)
        )
      );
    }

    if (criteria.size) {
      filtered = filtered.filter(studio => studio.size === criteria.size);
    }

    if (criteria.publiclyTraded !== undefined) {
      filtered = filtered.filter(studio => studio.publiclyTraded === criteria.publiclyTraded);
    }

    if (criteria.hasOpenings) {
      filtered = filtered.filter(studio => 
        studio.hiringData?.openPositions && studio.hiringData.openPositions > 0
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Lightweight suggestions by fuzzy name/alias match
   */
  static async getSuggestions(query: string, limit: number = 10): Promise<StudioData[]> {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const studios = await this.getAll();

    // Score by name/alias contains + Levenshtein distance for ties
    const scored = studios.map((s) => {
      const name = s.name.toLowerCase();
      const aliases = (s.aliases || []).map(a => a.toLowerCase());
      const inName = name.includes(q);
      const inAlias = aliases.some(a => a.includes(q));
      if (!inName && !inAlias) return null as any;
      const pos = inName ? name.indexOf(q) : aliases.map(a => a.indexOf(q)).reduce((m,v) => (m<0?v:Math.min(m,v)), -1);
      const distance = this.levenshteinDistance(q, inName ? name.slice(pos, pos + q.length) : q);
      // Higher score is better
      const score = 100 - (pos >= 0 ? pos : 50) - (distance * 10);
      return { s, score, distance };
    }).filter(Boolean) as Array<{ s: StudioData; score: number; distance: number }>;

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.s.name.localeCompare(b.s.name);
    });

    return scored.slice(0, limit).map(x => x.s);
  }

  /**
   * Get studios by category/type (matches either `type` or `category` fields)
   */
  static async getByCategory(category: string): Promise<StudioData[]> {
    const studios = await this.getAll();
    const c = String(category || '').toLowerCase();
    return studios.filter(s =>
      String((s as any).type || '').toLowerCase() === c ||
      String((s as any).category || '').toLowerCase() === c
    );
  }

  /**
   * Get studios by region string (falls back to headquarters substring match)
   */
  static async getByRegion(region: string): Promise<StudioData[]> {
    const studios = await this.getAll();
    const r = String(region || '').toLowerCase();
    return studios.filter(s =>
      String((s as any).region || '').toLowerCase().includes(r) ||
      String((s as any).headquarters || '').toLowerCase().includes(r)
    );
  }

  // Normalization utilities
  static async normalizeStudioName(name: string): Promise<{
    normalized: boolean;
    studioId?: string;
    suggestions: Array<{
      id: string;
      name: string;
      confidence: number;
    }>;
  }> {
    const cleanName = name.trim().toLowerCase();
    const exact = await this.getByName(cleanName);
    
    if (exact) {
      return {
        normalized: true,
        studioId: exact.id,
        suggestions: []
      };
    }

    // Find similar studios using fuzzy matching
    const allStudios = await this.getAll();
    const suggestions = allStudios
      .map(studio => ({
        id: studio.id,
        name: studio.name,
        confidence: this.calculateNameSimilarity(cleanName, studio.name.toLowerCase())
      }))
      .filter(suggestion => suggestion.confidence > 0.6)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return {
      normalized: false,
      suggestions
    };
  }

  private static calculateNameSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Alias management
  private static async updateAliasMapping(studio: StudioData): Promise<void> {
    const aliasMap = await unifiedStorage.get(this.ALIASES_KEY) || {};
    
    // Add all aliases for this studio
    [studio.name, ...studio.aliases].forEach(name => {
      aliasMap[name.toLowerCase()] = studio.id;
    });
    
    await unifiedStorage.set(this.ALIASES_KEY, aliasMap);
  }

  private static async rebuildAliasMapping(): Promise<void> {
    const studios = await this.getAll();
    const aliasMap: Record<string, string> = {};
    
    studios.forEach(studio => {
      [studio.name, ...studio.aliases].forEach(name => {
        aliasMap[name.toLowerCase()] = studio.id;
      });
    });
    
    await unifiedStorage.set(this.ALIASES_KEY, aliasMap);
  }

  static async getStudioIdByAlias(alias: string): Promise<string | null> {
    const aliasMap = await unifiedStorage.get(this.ALIASES_KEY) || {};
    return aliasMap[alias.toLowerCase()] || null;
  }

  // Analytics and insights
  static async getStudioInsights(): Promise<{
    totalStudios: number;
    topStudios: Array<{ name: string; gameCount: number }>;
    locationDistribution: Record<string, number>;
    sizeDistribution: Record<string, number>;
    publicVsPrivate: { public: number; private: number };
  }> {
    const studios = await this.getAll();
    
    const topStudios = studios
      .map(studio => ({
        name: studio.name,
        gameCount: studio.games?.length || 0
      }))
      .sort((a, b) => b.gameCount - a.gameCount)
      .slice(0, 10);

    const locationDistribution: Record<string, number> = {};
    const sizeDistribution: Record<string, number> = {};
    let publicCount = 0;
    let privateCount = 0;

    studios.forEach(studio => {
      if (studio.headquarters) {
        locationDistribution[studio.headquarters] = 
          (locationDistribution[studio.headquarters] || 0) + 1;
      }
      
      if (studio.size) {
        sizeDistribution[studio.size] = 
          (sizeDistribution[studio.size] || 0) + 1;
      }
      
      if (studio.publiclyTraded) {
        publicCount++;
      } else {
        privateCount++;
      }
    });

    return {
      totalStudios: studios.length,
      topStudios,
      locationDistribution,
      sizeDistribution,
      publicVsPrivate: { public: publicCount, private: privateCount }
    };
  }

  // Data enrichment
  static async enrichStudioData(studioId: string, enrichmentData: Partial<StudioData>): Promise<StudioData | null> {
    const studio = await this.getById(studioId);
    if (!studio) return null;

    // Merge enrichment data, preserving arrays and objects
    const enriched: StudioData = {
      ...studio,
      ...enrichmentData,
      games: [...(studio.games || []), ...(enrichmentData.games || [])].filter((game, index, arr) => 
        arr.indexOf(game) === index
      ),
      technologies: [...(studio.technologies || []), ...(enrichmentData.technologies || [])].filter((tech, index, arr) => 
        arr.indexOf(tech) === index
      ),
      aliases: [...studio.aliases, ...(enrichmentData.aliases || [])].filter((alias, index, arr) => 
        arr.indexOf(alias) === index
      ),
      dataSource: [...studio.dataSource, ...(enrichmentData.dataSource || [])].filter((source, index, arr) => 
        arr.indexOf(source) === index
      ),
      lastUpdated: new Date()
    };

    return this.update(studioId, enriched);
  }

  // Favorites management
  private static readonly FAVORITES_KEY = 'studioFavorites';

  static async getFavorites(): Promise<string[]> {
    const favorites = await unifiedStorage.get(this.FAVORITES_KEY);
    return Array.isArray(favorites) ? favorites : [];
  }

  static async addFavorite(studioId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(studioId)) {
      favorites.push(studioId);
      await unifiedStorage.set(this.FAVORITES_KEY, favorites);
    }
  }

  static async removeFavorite(studioId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const updated = favorites.filter(id => id !== studioId);
    await unifiedStorage.set(this.FAVORITES_KEY, updated);
  }

  static async isFavorite(studioId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(studioId);
  }
}
