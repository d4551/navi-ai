
import { unifiedStorage } from "@/utils/storage";
import { logger } from "@/shared/utils/logger";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";

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
  async importAllStudios(includeLive = false): Promise<{
    success: boolean;
    total: number;
    imported: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      errors: [] as string[],
    };

    try {
      logger.info("Starting simple studio import...");

      const gamingStudios = Object.values(GAMING_STUDIOS || {});
      for (const studio of gamingStudios) {
        try {
          const simple = this.convertToSimpleStudio(
            studio as any,
            "gaming-studios",
          );
          await this.storeStudio(simple);
          result.imported++;
        } catch (_error) {
          result.errors.push(`Gaming studio ${studio.name}: ${error.message}`);
        }
      }

        try {
          await this.storeStudio(simple);
          result.imported++;
        } catch (_error) {
        }
      }

      if (includeLive) {
        try {
          const steamStudios = await this.fetchSteamStudios();
          for (const studio of steamStudios) {
            try {
              await this.storeStudio(studio);
              result.imported++;
            } catch (_error) {
              result.errors.push(
                `Steam studio ${studio.name}: ${error.message}`,
              );
            }
          }
        } catch (_error) {
          result.errors.push(`Steam fetch failed: ${error.message}`);
        }
      }

      result.total = result.imported + result.errors.length;

      logger.info(
        `Simple studio import completed: ${result.imported}/${result.total} successful`,
      );
      return result;
    } catch (_error) {
      logger.error("Studio import failed:", error);
      result.errors.push(`System error: ${error.message}`);
      return result;
    }
  }

  private convertToSimpleStudio(studio: any, source: string): SimpleStudio {
    if (!studio.id) {
      studio.id = this.generateId(studio.name);
    }

    return {
      id: studio.id,
      name: studio.name || "Unknown Studio",
      description: studio.description || `Gaming studio from ${source}`,
      location: studio.location || studio.headquarters || "Unknown",
      type: studio.type || "Indie",
      founded: studio.founded || new Date().getFullYear(),
      technologies: Array.isArray(studio.technologies)
        ? studio.technologies
        : [],
      website: studio.website,
      dataSource: [source],
      lastUpdated: new Date(),
    };
  }

  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/^-+|-+$/g, "")
  }

  private async storeStudio(studio: SimpleStudio): Promise<void> {
    if (!studio.id || !studio.name) {
      throw new Error("Studio missing required fields");
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

  private async fetchSteamStudios(): Promise<SimpleStudio[]> {
    try {
      const { SteamDataSource } = await import(
        "@/services/ingestion/SteamDataSource"
      );
      const steamSource = new SteamDataSource();

      // Test connection
      const canConnect = await steamSource.testConnection();
      if (!canConnect) {
        logger.warn("Steam API not available");
        return [];
      }

      // Fetch limited data
      const mockJob = {
        id: "simple-steam-job",
        sourceId: "steam",
        type: "incremental" as const,
        status: "running" as const,
        errors: [],
      };

      const rawStudios = await steamSource.fetchData(mockJob);

      // Convert to SimpleStudio format
      const simpleStudios: SimpleStudio[] = [];
      for (const raw of rawStudios || []) {
          simpleStudios.push({
            id: this.generateId(raw.name),
            name: raw.name,
            description: raw.description || "Gaming studio from Steam",
            location: raw.location || "Unknown",
            type: "Indie",
            founded: new Date().getFullYear(),
            dataSource: ["steam"],
            lastUpdated: new Date(),
          });
        }
      }

      logger.info(`Converted ${simpleStudios.length} studios from Steam`);
      return simpleStudios;
    } catch (_error) {
      logger.warn("Steam fetch failed:", error);
      return [];
    }
  }

  async getAllStudios(): Promise<SimpleStudio[]> {
    try {
      return (await unifiedStorage.getAllStudios()) || [];
    } catch (_error) {
      logger.error("Failed to get all studios:", error);
      return [];
    }
  }

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
        }
      }

      // Count by type
      const type = studio.type || "Unknown";
    }

    return {
      total: studios.length,
      bySource,
      byType,
      lastUpdated: new Date().toISOString(),
    };
  }

  async clearAll(): Promise<void> {
    try {
      await unifiedStorage.clear();
      logger.info("All studios cleared");
    } catch (_error) {
      logger.error("Failed to clear studios:", error);
    }
  }
}

export const simpleStudioService = new SimpleStudioService();
