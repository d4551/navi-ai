// Gaming Studios Repository - Database operations for gaming company management
// Centralized gaming companies data persistence and queries

import { unifiedStorage } from '@/utils/storage';
import { GAMING_STUDIOS } from '@/shared/constants/gaming-studios';
import { cacheService } from '@/shared/services/CacheService';
import { logger } from '@/shared/utils/logger';
import type { GameStudio, GameGenre, Platform, StudioType } from '@/shared/types/jobs';

interface GameStudioSearchCriteria {
  name?: string;
  location?: string;
  type?: StudioType;
  genres?: GameGenre[];
  platforms?: Platform[];
  size?: string;
  technologies?: string[];
  category?: string;
  region?: string;
  remoteWork?: boolean;
}

// Static data for gaming studios with enhanced search capabilities
export class GameStudioRepository {
  private static readonly STORE_KEY = 'gamingStudios';
  private static readonly FAVORITES_KEY = 'favoriteStudios';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes for queries
  private static initialized = false;
  private static studiosIndex = new Map<string, GameStudio>();
  private static nameIndex = new Map<string, GameStudio[]>();

  private static async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const existing = await unifiedStorage.get(this.STORE_KEY);
    if (!existing || Object.keys(existing).length < Object.keys(GAMING_STUDIOS).length) {
      await unifiedStorage.set(this.STORE_KEY, GAMING_STUDIOS);
    }
    this.initialized = true;
  }

  static async getAll(): Promise<Record<string, GameStudio>> {
    const cacheKey = `studios:all`;
    const cached = await cacheService.get<Record<string, GameStudio>>(cacheKey);

    if (cached) {
      return cached;
    }

    await this.ensureInitialized();
    const studios = await unifiedStorage.get(this.STORE_KEY) || {};

    // Cache the result
    await cacheService.set(cacheKey, studios, {
      ttl: this.CACHE_TTL,
      persistent: true,
      tags: ['studios']
    });

    // Build indexes for faster queries
    this.buildIndexes(studios);

    return studios;
  }

  static async getById(id: string): Promise<GameStudio | null> {
    const cacheKey = `studio:${id}`;
    const cached = await cacheService.get<GameStudio | null>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    // Check index first
    if (this.studiosIndex.has(id)) {
      const studio = this.studiosIndex.get(id)!;
      await cacheService.set(cacheKey, studio, { ttl: this.CACHE_TTL });
      return studio;
    }

    const studios = await this.getAll();
    const studio = studios[id] || null;

    await cacheService.set(cacheKey, studio, { ttl: this.CACHE_TTL });
    return studio;
  }

  static async findByCompanyName(companyName: string): Promise<GameStudio | null> {
    const cacheKey = `studio:name:${companyName.toLowerCase()}`;
    const cached = await cacheService.get<GameStudio | null>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const normalizedName = companyName.toLowerCase().trim();

    // Check name index first
    if (this.nameIndex.has(normalizedName)) {
      const matches = this.nameIndex.get(normalizedName)!;
      const result = matches[0] || null;
      await cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL });
      return result;
    }

    // Fallback to full search
    const studios = await this.getAll();
    for (const studio of Object.values(studios)) {
      if (studio.name.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(studio.name.toLowerCase().split(' ')[0])) {
        await cacheService.set(cacheKey, studio, { ttl: this.CACHE_TTL });
        return studio;
      }
    }

    await cacheService.set(cacheKey, null, { ttl: this.CACHE_TTL });
    return null;
  }

  static async search(criteria: GameStudioSearchCriteria): Promise<GameStudio[]> {
    const cacheKey = `studios:search:${JSON.stringify(criteria)}`;
    const cached = await cacheService.get<GameStudio[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const allStudios = Object.values(await this.getAll());
    let filtered = [...allStudios];

    if (criteria.name) {
      const nameQuery = criteria.name.toLowerCase();
      filtered = filtered.filter(studio =>
        studio.name.toLowerCase().includes(nameQuery) ||
        (studio.description && studio.description.toLowerCase().includes(nameQuery)) ||
        studio.technologies.some(tech => tech.toLowerCase().includes(nameQuery))
      );
    }

    if (criteria.location) {
      const locationQuery = criteria.location.toLowerCase();
      filtered = filtered.filter(studio =>
        studio.location.toLowerCase().includes(locationQuery)
      );
    }

    if (criteria.type) {
      filtered = filtered.filter(studio => studio.type === criteria.type);
    }

    if (criteria.genres && criteria.genres.length > 0) {
      // For genre filtering - could be extended based on games data
      filtered = filtered.filter(studio => {
        const studioGenres = this.getStudioGenres(studio);
        return criteria.genres!.some(genre => studioGenres.includes(genre));
      });
    }

    if (criteria.platforms && criteria.platforms.length > 0) {
      // For platform filtering - could be extended based on games data
      filtered = filtered.filter(studio => {
        const studioPlatforms = this.getStudioPlatforms(studio);
        return criteria.platforms!.some(platform => studioPlatforms.includes(platform));
      });
    }

    if (criteria.size) {
      filtered = filtered.filter(studio => studio.size === criteria.size);
    }

    if (criteria.technologies && criteria.technologies.length > 0) {
      filtered = filtered.filter(studio =>
        criteria.technologies!.every(tech =>
          studio.technologies.some(studioTech =>
            studioTech.toLowerCase().includes(tech.toLowerCase())
          )
        )
      );
    }

    // Cache search results for 5 minutes
    await cacheService.set(cacheKey, filtered, {
      ttl: 5 * 60 * 1000,
      tags: ['studios', 'search']
    });

    return filtered;
  }

  private static getStudioGenres(studio: GameStudio): string[] {
    // Extract genres from description and games
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

  private static getStudioPlatforms(studio: GameStudio): string[] {
    const platforms: string[] = [];
    const desc = (studio.description || '').toLowerCase();
    const games = studio.games.join(' ').toLowerCase();

    if (desc.includes('pc') || games.includes('pc')) platforms.push('PC');
    if (desc.includes('console') || games.includes('console') || games.includes('playstation') || games.includes('xbox') || games.includes('switch')) platforms.push('Console');
    if (desc.includes('mobile') || games.includes('mobile')) platforms.push('Mobile');
    if (desc.includes('vr') || games.includes('vr')) platforms.push('VR');
    if (desc.includes('ar') || games.includes('ar')) platforms.push('AR');
    if (desc.includes('web') || games.includes('web')) platforms.push('Web');

    return platforms;
  }

  // Favorites management
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
    const filtered = favorites.filter(id => id !== studioId);
    await unifiedStorage.set(this.FAVORITES_KEY, filtered);
  }

  static async isFavorite(studioId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(studioId);
  }

  // Get studio suggestions for autocomplete with caching
  static async getSuggestions(query: string, limit: number = 10): Promise<GameStudio[]> {
    const cacheKey = `studios:suggestions:${query}:${limit}`;
    const cached = await cacheService.get<GameStudio[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const allStudios = Object.values(await this.getAll());
    const queryLower = query.toLowerCase();

    // Optimized search with scoring
    const scored = allStudios.map(studio => {
      let score = 0;
      const name = studio.name.toLowerCase();

      if (name.startsWith(queryLower)) score += 10;
      else if (name.includes(queryLower)) score += 5;

      if (studio.technologies.some(tech => tech.toLowerCase().includes(queryLower))) {
        score += 2;
      }

      return { studio, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.studio);

    await cacheService.set(cacheKey, scored, {
      ttl: 10 * 60 * 1000, // 10 minutes
      tags: ['studios', 'suggestions']
    });

    return scored;
  }

  // Get studios by category
  static async getByCategory(category: string): Promise<GameStudio[]> {
    const allStudios = Object.values(await this.getAll());
    return allStudios.filter(studio =>
      this.getStudioCategory(studio) === category.toLowerCase()
    );
  }

  private static getStudioCategory(studio: GameStudio): string {
    const size = studio.size.toLowerCase();
    if (size.includes('5000') || size.includes('enterprise')) return 'enterprise';
    if (size.includes('2000') || size.includes('large')) return 'large';
    if (size.includes('200') || size.includes('medium')) return 'medium';
    if (size.includes('50') || size.includes('small')) return 'small';
    return 'indie';
  }

  // Get regional studios
  static async getByRegion(region: string): Promise<GameStudio[]> {
    const allStudios = Object.values(await this.getAll());
    const normalizedRegion = region.toLowerCase();

    return allStudios.filter(studio => {
      const location = studio.location.toLowerCase();
      if (normalizedRegion === 'north america' && location.includes('ca') || location.includes('usa')) return true;
      if (normalizedRegion === 'europe' && (location.includes('uk') || location.includes('germany') || location.includes('france'))) return true;
      if (normalizedRegion === 'asia' && (location.includes('japan') || location.includes('china'))) return true;
      return false;
    });
  }

  // Advanced filtering for complex queries
  static async getStudiosByAdvancedFilters(filters: {
    minSize?: number;
    maxSize?: number;
    hasRemoteWork?: boolean;
    technologies?: string[];
    foundedAfter?: number;
    foundedBefore?: number;
    genres?: string[];
  }): Promise<GameStudio[]> {
    let studios = Object.values(await this.getAll());

    if (filters.minSize !== undefined) {
      studios = studios.filter(studio => this.extractStudioSize(studio) >= filters.minSize!);
    }

    if (filters.maxSize !== undefined) {
      studios = studios.filter(studio => this.extractStudioSize(studio) <= filters.maxSize!);
    }

    if (filters.hasRemoteWork !== undefined) {
      studios = studios.filter(studio => (studio as any).remoteWork === filters.hasRemoteWork);
    }

    if (filters.technologies && filters.technologies.length > 0) {
      studios = studios.filter(studio =>
        filters.technologies!.every(tech =>
          studio.technologies.some(studioTech =>
            studioTech.toLowerCase() === tech.toLowerCase()
          )
        )
      );
    }

    if (filters.foundedAfter !== undefined) {
      studios = studios.filter(studio => studio.founded && studio.founded >= filters.foundedAfter!);
    }

    if (filters.foundedBefore !== undefined) {
      studios = studios.filter(studio => studio.founded && studio.founded <= filters.foundedBefore!);
    }

    if (filters.genres && filters.genres.length > 0) {
      studios = studios.filter(studio => {
        const studioGenres = this.getStudioGenres(studio);
        return filters.genres!.some(genre => studioGenres.includes(genre));
      });
    }

    return studios;
  }

  private static extractStudioSize(studio: GameStudio): number {
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

  // Build indexes for faster queries
  private static buildIndexes(studios: Record<string, GameStudio>): void {
    this.studiosIndex.clear();
    this.nameIndex.clear();

    for (const [id, studio] of Object.entries(studios)) {
      // ID index
      this.studiosIndex.set(id, studio);

      // Name index
      const nameKey = studio.name.toLowerCase();
      if (!this.nameIndex.has(nameKey)) {
        this.nameIndex.set(nameKey, []);
      }
      this.nameIndex.get(nameKey)!.push(studio);
    }

    logger.info(`Built indexes for ${this.studiosIndex.size} studios`);
  }

  // Clear all caches
  static async clearCache(): Promise<void> {
    await cacheService.invalidateByTags(['studios']);
    this.studiosIndex.clear();
    this.nameIndex.clear();
    logger.info('Studio caches cleared');
  }

  // Export data for backup or migration
  static async exportData(): Promise<{
    studios: Record<string, GameStudio>,
    favorites: string[]
  }> {
    const studios = await this.getAll();
    const favorites = await this.getFavorites();

    return {
      studios,
      favorites
    };
  }

  // Import data for migration or restore
  static async importData(data: { studios: Record<string, GameStudio>, favorites: string[] }): Promise<void> {
    if (data.studios) {
      await unifiedStorage.set(this.STORE_KEY, data.studios);
    }
    if (data.favorites) {
      await unifiedStorage.set(this.FAVORITES_KEY, data.favorites);
    }
  }
}
