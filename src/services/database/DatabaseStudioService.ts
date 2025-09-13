
// Guard against browser environment
if (typeof window !== "undefined") {
  console.warn(
    "DatabaseStudioService is not supported in browser environments - operations will be no-ops",
  );
}

import { studioRepository, type Studio } from "./StudioRepository";
import { databaseManager } from "./DatabaseManager";
import { logger } from "@/shared/utils/logger";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";
import { EXPANDED_GAMING_STUDIOS } from "@/shared/constants/expanded-gaming-data";

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  updated: number;
  errors: string[];
  duration: number;
}

export interface SearchResult {
  studios: Studio[];
  total: number;
  page: number;
  pageSize: number;
}

export class DatabaseStudioService {
  async init(): Promise<void> {
    await studioRepository.init();
    logger.info("DatabaseStudioService initialized");
  }

  async importAllStudios(includeStream = false): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: false,
      errors: [],
    };

    try {
      logger.info("Starting database studio import...");

      const studiosToImport: Omit<Studio, "createdAt" | "updatedAt">[] = [];

      try {
        const gamingStudios = Object.values(GAMING_STUDIOS || {});
        logger.info(`Processing ${gamingStudios.length} gaming studios...`);

        for (const studio of gamingStudios) {
          try {
            const converted = this.convertToStudio(
              studio as any,
              "gaming-studios",
            );
            studiosToImport.push(converted);
          } catch (_error) {
            const msg = (error as any)?.message || String(_error);
            result.errors.push(`Gaming studio ${studio.name}: ${msg}`);
          }
        }
      } catch (_error) {
        const msg = (error as any)?.message || String(_error);
        result.errors.push(`Failed to load gaming studios: ${msg}`);
      }

      try {
        logger.info(
        );

          try {
            studiosToImport.push(converted);
          } catch (_error) {
            const msg = (error as any)?.message || String(_error);
          }
        }
      } catch (_error) {
        const msg = (error as any)?.message || String(_error);
      }

      try {
        const expandedStudios = Object.values(EXPANDED_GAMING_STUDIOS || {});
        logger.info(
          `Processing ${expandedStudios.length} expanded gaming studios...`,
        );

        for (const studio of expandedStudios) {
          try {
            const converted = this.convertExpandedStudio(
              studio as any,
              "expanded-gaming",
            );
            studiosToImport.push(converted);
          } catch (_error) {
            const msg = (error as any)?.message || String(_error);
            result.errors.push(`Expanded studio ${studio.name}: ${msg}`);
          }
        }
      } catch (_error) {
        const msg = (error as any)?.message || String(_error);
        result.errors.push(`Failed to load expanded gaming studios: ${msg}`);
      }

      if (includeStream) {
        try {
          const steamStudios = await this.fetchSteamStudios();
          studiosToImport.push(...steamStudios);
          logger.info(`Added ${steamStudios.length} studios from Steam API`);
        } catch (_error) {
          const msg = (error as any)?.message || String(_error);
          result.errors.push(`Steam integration failed: ${msg}`);
          logger.warn("Steam integration failed:", error);
        }
      }

        logger.info(
          `Bulk importing ${studiosToImport.length} studios to database...`,
        );
        result.imported = await studioRepository.bulkUpsert(studiosToImport);
        result.total = studiosToImport.length;
      }

      result.duration = Date.now() - startTime;

      logger.info(
        `Database studio import completed: ${result.imported}/${result.total} successful in ${result.duration}ms`,
      );
      return result;
    } catch (_error) {
      logger.error("Database studio import failed:", error);
      const msg = (error as any)?.message || String(_error);
      result.errors.push(`System error: ${msg}`);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  async searchStudios(
    query: {
      name?: string;
      type?: string;
      location?: string;
      dataSource?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<SearchResult> {

    const [studios, total] = await Promise.all([
      studioRepository.search({ ...query, limit: pageSize, offset }),
      studioRepository.count(query),
    ]);

    return {
      studios,
      total,
      page,
      pageSize,
    };
  }

  async getStudio(id: string): Promise<Studio | null> {
    return studioRepository.findById(id);
  }

  async getAllStudios(): Promise<Studio[]> {
    return studioRepository.findAll();
  }

  async getStatistics() {
    const [stats, _dbStats, backupInfo] = await Promise.all([
      studioRepository.getStats(),
      studioRepository.init().then(() => studioRepository.getStats()),
      databaseManager.getBackupInfo().catch(() => ({ lastBackup: "Never" })),
    ]);

    return {
      ...stats,
      database: {
        path:
          process.env.NODE_ENV === "test"
            ? "./test-data/navi.db"
            : "userData/navi.db",
        lastBackup: backupInfo?.lastBackup || "Never",
      },
    };
  }

  async upsertStudio(
    studio: Omit<Studio, "createdAt" | "updatedAt">,
  ): Promise<Studio> {
    return studioRepository.upsert(studio);
  }

  async bulkPersistMerged(
    studios: Omit<Studio, "createdAt" | "updatedAt">[],
  ): Promise<number> {
    return studioRepository.bulkUpsert(studios);
  }

  async incrementalSteamSync(
  ): Promise<{ imported: number; totalRaw: number; duration: number }> {
    const start = Date.now();
    try {
      const { SteamDataSource } = await import(
        "@/services/ingestion/SteamDataSource"
      );
      const steamSource = new SteamDataSource();
      if (!(await steamSource.testConnection())) {
      }
      const job = {
        id: "incremental-steam-sync",
        sourceId: "steam",
        type: "incremental" as const,
        status: "running" as const,
        errors: [],
        metadata: { maxStudios: batchSize },
      };
      const raw = (await steamSource.fetchData(job)) || [];
      const converted: Omit<Studio, "createdAt" | "updatedAt">[] = [];
      for (const r of raw) {
          converted.push({
            id: this.generateId(r.name),
            name: r.name,
            description: r.description || "Gaming studio from Steam",
            location: r.location || "Unknown",
            type: "Indie",
            dataSource: ["steam"],
            confidence: r.confidence,
            priority: this.calculatePriority("steam", r),
          });
        }
      }
      const imported = converted.length
        ? await studioRepository.bulkUpsert(converted)
      return { imported, totalRaw: raw.length, duration: Date.now() - start };
    } catch (_e) {
      logger.warn("Incremental Steam sync failed", e);
    }
  }

  async deleteStudio(id: string): Promise<boolean> {
    return studioRepository.delete(id);
  }

  async clearAll(): Promise<number> {
    return studioRepository.deleteAll();
  }

  async exportStudios(): Promise<{
    studios: Studio[];
    metadata: {
      exportedAt: string;
      version: string;
      count: number;
    };
  }> {
    const studios = await studioRepository.findAll();

    return {
      studios,
      metadata: {
        exportedAt: new Date().toISOString(),
        count: studios.length,
      },
    };
  }

  private convertExpandedStudio(
    studio: any,
    source: string,
  ): Omit<Studio, "createdAt" | "updatedAt"> {
    if (!studio.name) {
      throw new Error("Studio name is required");
    }

    const id = studio.id || this.generateId(studio.name);
    const games = studio.majorGames?.map((game: any) => game.name) || [];

    return {
      id,
      name: studio.name,
      description: this.buildExpandedDescription(studio),
      size: this.mapStudioSize(studio.size, studio.employeeCount),
      type: this.mapStudioType(studio.type, studio.size),
      founded: studio.founded || new Date().getFullYear(),
      website: studio.website,
      dataSource: [source],
      priority: this.calculateExpandedPriority(studio, source),
    };
  }

  private convertToStudio(
    studio: any,
    source: string,
  ): Omit<Studio, "createdAt" | "updatedAt"> {
    if (!studio.name) {
      throw new Error("Studio name is required");
    }

    const id = studio.id || this.generateId(studio.name);

    return {
      id,
      name: studio.name,
      description: studio.description || `Gaming studio from ${source}`,
      location: studio.location || studio.headquarters || "Unknown",
      type: studio.type || "Indie",
      founded: studio.founded || new Date().getFullYear(),
      technologies: Array.isArray(studio.technologies)
        ? studio.technologies
        : [],
      website: studio.website,
      dataSource: [source],
      priority: this.calculatePriority(source, studio),
    };
  }

  private calculatePriority(source: string, studio: any): number {

    // Source-based priority
    if (source === "gaming-studios")
    else if (source === "steam")

    // Boost priority based on data completeness

  }

  private buildExpandedDescription(studio: any): string {
    const parts = [];

    if (studio.type && studio.size) {
      parts.push(
        `${this.capitalizeFirst(studio.size)} ${studio.type} gaming company`,
      );
    }

    if (studio.employeeCount) {
      parts.push(`with ${studio.employeeCount}+ employees`);
    }

      const topGames = studio.majorGames
        .map((g: any) => g.name)
        .join(", ");
      parts.push(`Known for: ${topGames}`);
    }

    }

    return parts.join(" • ") || `Gaming studio from expanded database`;
  }

  private mapStudioSize(size: string, employeeCount?: number): string {
    if (employeeCount) {
    }

    switch (size?.toLowerCase()) {
      case "indie":
      case "small":
      case "medium":
      case "large":
      case "aaa":
      default:
    }
  }

  private mapStudioType(type: string, size?: string): string {
    if (size === "aaa") return "AAA";

    switch (type?.toLowerCase()) {
      case "developer":
        return "Developer";
      case "publisher":
        return "Publisher";
      case "both":
        return "Developer/Publisher";
      case "platform":
        return "Platform";
      case "service":
        return "Service Provider";
      default:
        return "Indie";
    }
  }

  private calculateExpandedPriority(studio: any, _source: string): number {

    // Size-based priority

    // Employee count boost

    // Game portfolio

    // Company quality indicators

  }

  private capitalizeFirst(str: string): string {
  }

  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/^-+|-+$/g, "")
  }

  private async fetchSteamStudios(): Promise<
    Omit<Studio, "createdAt" | "updatedAt">[]
  > {
    try {
      const { SteamDataSource } = await import(
        "@/services/ingestion/SteamDataSource"
      );
      const steamSource = new SteamDataSource();

      const canConnect = await steamSource.testConnection();
      if (!canConnect) {
        throw new Error("Steam API not available");
      }

      const mockJob = {
        id: "database-steam-job",
        sourceId: "steam",
        type: "incremental" as const,
        status: "running" as const,
        errors: [],
      };

      const rawStudios = await steamSource.fetchData(mockJob);
      const studios: Omit<Studio, "createdAt" | "updatedAt">[] = [];

      for (const raw of rawStudios || []) {
          // Much lower threshold to get thousands of studios
          const studio: Omit<Studio, "createdAt" | "updatedAt"> = {
            id: this.generateId(raw.name),
            name: raw.name,
            description: raw.description || "Gaming studio from Steam",
            location: raw.location || "Unknown",
            type: "Indie",
            dataSource: ["steam"],
            confidence: raw.confidence,
            priority: this.calculatePriority("steam", raw),
          };
          studios.push(studio);
        }
      }

      return studios;
    } catch (_error) {
      logger.warn("Steam fetch failed:", error);
      return [];
    }
  }

  async getHealthInfo(): Promise<{
    status: "healthy" | "warning" | "error";
    checks: {
      database: boolean;
      studios: number;
      lastImport: string;
    };
  }> {
    try {
      const stats = await this.getStatistics();
      const studiosCount = stats.total;

      return {
        checks: {
          database: true,
          studios: studiosCount,
          lastImport: stats.lastUpdated,
        },
      };
    } catch (_error) {
      logger.error("Health check failed:", error);
      return {
        status: "error",
        checks: {
          database: false,
          lastImport: "Never",
        },
      };
    }
  }
}

export const databaseStudioService = new DatabaseStudioService();
