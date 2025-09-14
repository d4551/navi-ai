/**
 * Simple Studio Service - A working studio import and storage system
 * Replaces the broken complex pipeline with something that actually works
 */

import { unifiedStorage } from "@/utils/storage";
import { logger } from "@/shared/utils/logger";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";
import { TOP_100_GAMING_STUDIOS } from "@/data/top-100-gaming-studios";

export interface SimpleStudio {
  id: string;
  name: string;
  description?: string;
  location?: string;
  size?: string;
  type?: string;
  founded?: number;
  games?: string[];
  technologies?: string[];
  website?: string;
  dataSource?: string[];
  lastUpdated: Date;
}

export class SimpleStudioService {
  
  /**
   * Import all studios from static sources + Steam data
   */
  async importAllStudios(includeLive = false): Promise<{
    success: boolean;
    total: number;
    imported: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      total: 0,
      imported: 0,
      errors: [] as string[]
    };

    try {
      logger.info('Starting simple studio import...');
      
      // 1. Import from GAMING_STUDIOS constants
      const gamingStudios = Object.values(GAMING_STUDIOS || {});
      for (const studio of gamingStudios) {
        try {
          const simple = this.convertToSimpleStudio(studio as any, 'gaming-studios');
          await this.storeStudio(simple);
          result.imported++;
        } catch (error) {
          result.errors.push(`Gaming studio ${studio.name}: ${error.message}`);
        }
      }
      
      // 2. Import from TOP_100_GAMING_STUDIOS
      for (const studio of TOP_100_GAMING_STUDIOS || []) {
        try {
          const simple = this.convertToSimpleStudio(studio as any, 'top-100');
          await this.storeStudio(simple);
          result.imported++;
        } catch (error) {
          result.errors.push(`Top 100 studio ${studio.name}: ${error.message}`);
        }
      }

      // 3. Import from Steam (if requested and working)
      if (includeLive) {
        try {
          const steamStudios = await this.fetchSteamStudios();
          for (const studio of steamStudios) {
            try {
              await this.storeStudio(studio);
              result.imported++;
            } catch (error) {
              result.errors.push(`Steam studio ${studio.name}: ${error.message}`);
            }
          }
        } catch (error) {
          result.errors.push(`Steam fetch failed: ${error.message}`);
        }
      }

      result.total = result.imported + result.errors.length;
      result.success = result.imported > 0;

      logger.info(`Simple studio import completed: ${result.imported}/${result.total} successful`);
      return result;

    } catch (error) {
      logger.error('Studio import failed:', error);
      result.errors.push(`System error: ${error.message}`);
      return result;
    }
  }

  /**
   * Convert any studio format to SimpleStudio
   */
  private convertToSimpleStudio(studio: any, source: string): SimpleStudio {
    if (!studio.id) {
      studio.id = this.generateId(studio.name);
    }

    return {
      id: studio.id,
      name: studio.name || 'Unknown Studio',
      description: studio.description || `Gaming studio from ${source}`,
      location: studio.location || studio.headquarters || 'Unknown',
      size: studio.size || 'Small (2-10)',
      type: studio.type || 'Indie',
      founded: studio.founded || new Date().getFullYear(),
      games: Array.isArray(studio.games) ? studio.games.slice(0, 10) : [],
      technologies: Array.isArray(studio.technologies) ? studio.technologies : [],
      website: studio.website,
      dataSource: [source],
      lastUpdated: new Date()
    };
  }

  /**
   * Generate a clean ID from studio name
   */
  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  }

  /**
   * Store a studio in unified storage
   */
  private async storeStudio(studio: SimpleStudio): Promise<void> {
    if (!studio.id || !studio.name) {
      throw new Error('Studio missing required fields');
    }

    // Check if already exists
    const existing = await unifiedStorage.getStudio(studio.id);
    if (existing) {
      // Update existing
      const merged = { ...existing, ...studio, lastUpdated: new Date() };
      await unifiedStorage.upsertStudio(merged);
    } else {
      // Create new
      await unifiedStorage.upsertStudio(studio);
    }
  }

  /**
   * Fetch studios from Steam API (simplified)
   */
  private async fetchSteamStudios(): Promise<SimpleStudio[]> {
    try {
      const { SteamDataSource } = await import("@/services/ingestion/SteamDataSource");
      const steamSource = new SteamDataSource();
      
      // Test connection
      const canConnect = await steamSource.testConnection();
      if (!canConnect) {
        logger.warn('Steam API not available');
        return [];
      }

      // Fetch limited data
      const mockJob = {
        id: 'simple-steam-job',
        sourceId: 'steam',
        type: 'incremental' as const,
        status: 'running' as const,
        progress: 0,
        errors: [],
        metadata: { maxStudios: 5 } // Keep it small
      };

      const rawStudios = await steamSource.fetchData(mockJob);
      
      // Convert to SimpleStudio format
      const simpleStudios: SimpleStudio[] = [];
      for (const raw of rawStudios || []) {
        if (raw.name && raw.confidence > 0.6) {
          simpleStudios.push({
            id: this.generateId(raw.name),
            name: raw.name,
            description: raw.description || 'Gaming studio from Steam',
            location: raw.location || 'Unknown',
            size: 'Medium (11-50)',
            type: 'Indie',
            founded: new Date().getFullYear(),
            games: raw.games?.map(g => g.name).slice(0, 5) || [],
            technologies: ['Unity', 'C#'],
            website: raw.websites?.[0],
            dataSource: ['steam'],
            lastUpdated: new Date()
          });
        }
      }

      logger.info(`Converted ${simpleStudios.length} studios from Steam`);
      return simpleStudios;

    } catch (error) {
      logger.warn('Steam fetch failed:', error);
      return [];
    }
  }

  /**
   * Get all stored studios
   */
  async getAllStudios(): Promise<SimpleStudio[]> {
    try {
      return await unifiedStorage.getAllStudios() || [];
    } catch (error) {
      logger.error('Failed to get all studios:', error);
      return [];
    }
  }

  /**
   * Get studio statistics
   */
  async getStatistics(): Promise<{
    total: number;
    bySource: Record<string, number>;
    byType: Record<string, number>;
    lastUpdated: string;
  }> {
    const studios = await this.getAllStudios();
    
    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    for (const studio of studios) {
      // Count by source
      if (studio.dataSource) {
        for (const source of studio.dataSource) {
          bySource[source] = (bySource[source] || 0) + 1;
        }
      }
      
      // Count by type
      const type = studio.type || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      total: studios.length,
      bySource,
      byType,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear all studios (for testing)
   */
  async clearAll(): Promise<void> {
    try {
      await unifiedStorage.clear();
      logger.info('All studios cleared');
    } catch (error) {
      logger.error('Failed to clear studios:', error);
    }
  }
}

export const simpleStudioService = new SimpleStudioService();