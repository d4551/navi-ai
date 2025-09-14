
import { logger } from "@/shared/utils/logger";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";

export interface WorkingStudio {
  id: string;
  name: string;
  description: string;
  location: string;
  size: string;
  type: string;
  founded: number;
  games: string[];
  technologies: string[];
  website?: string;
  dataSource: string[];
  lastUpdated: string;
}

export class WorkingStudioDatabase {
  private studios: Map<string, WorkingStudio> = new Map();
  private initialized = false;
  private readonly STORAGE_KEY = "navi-studios-db";

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load from localStorage
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          for (const [id, studio] of Object.entries(_data)) {
            this.studios.set(id, studio as WorkingStudio);
          }
          logger.info(`Loaded ${this.studios.size} studios from localStorage`);
        }
      }

      this.initialized = true;
    } catch (_error) {
      logger.warn("Failed to load from localStorage, starting fresh:", error);
      this.initialized = true;
    }
  }

  private async persist(): Promise<void> {
    try {
      if (typeof localStorage !== "undefined") {
        const data = Object.fromEntries(this.studios.entries());
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(_data));
      }
    } catch (_error) {
      logger.warn("Failed to persist to localStorage:", error);
    }
  }

  async importAllStudios(includeLive = false): Promise<{
    success: boolean;
    total: number;
    imported: number;
    errors: string[];
  }> {
    await this.init();

    const result = {
      success: false,
      errors: [] as string[],
    };

    try {
      logger.info("Starting working studio import...");

      // Clear existing (fresh import)
      this.studios.clear();

      const gamingStudios = Object.values(GAMING_STUDIOS || {});
      for (const studio of gamingStudios) {
        try {
          const working = this.convertToWorkingStudio(
            studio as any,
            "gaming-studios",
          );
          this.studios.set(working.id, working);
          result.imported++;
        } catch (_error) {
          result.errors.push(`Gaming studio ${studio.name}: ${error.message}`);
        }
      }

      logger.info(`Imported ${result.imported} gaming studios`);

        try {
          this.studios.set(working.id, working);
          result.imported++;
        } catch (_error) {
        }
      }

      logger.info(`Total imported: ${result.imported} studios`);

      if (includeLive) {
        try {
          const steamStudios = await this.fetchFromSteam();
          for (const studio of steamStudios) {
            this.studios.set(studio.id, studio);
            result.imported++;
          }
          logger.info(`Added ${steamStudios.length} studios from Steam`);
        } catch (_error) {
          result.errors.push(`Steam integration failed: ${error.message}`);
          logger.warn("Steam integration failed:", error);
        }
      }

      // Save to storage
      await this.persist();

      result.total = result.imported + result.errors.length;

      logger.info(
        `Working studio import completed: ${result.imported} successful, ${result.errors.length} errors`,
      );
      return result;
    } catch (_error) {
      logger.error("Studio import failed:", error);
      result.errors.push(`System error: ${error.message}`);
      return result;
    }
  }

  private convertToWorkingStudio(studio: any, source: string): WorkingStudio {
    const name = studio.name;
    if (!name) {
      throw new Error("Studio name is required");
    }

    const id = studio.id || this.generateId(name);

    return {
      id,
      name,
      description: studio.description || `Gaming studio from ${source}`,
      location: studio.location || studio.headquarters || "Unknown",
      type: studio.type || "Indie",
      founded: studio.founded || new Date().getFullYear(),
      technologies: Array.isArray(studio.technologies)
        ? studio.technologies
        : [],
      website: studio.website,
      dataSource: [source],
      lastUpdated: new Date().toISOString(),
    };
  }

  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/^-+|-+$/g, "")
  }

  private async fetchFromSteam(): Promise<WorkingStudio[]> {
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
        id: "working-steam-job",
        sourceId: "steam",
        type: "incremental" as const,
        status: "running" as const,
        errors: [],
      };

      const rawStudios = await steamSource.fetchData(mockJob);
      const workingStudios: WorkingStudio[] = [];

      for (const raw of rawStudios || []) {
          const working: WorkingStudio = {
            id: this.generateId(raw.name),
            name: raw.name,
            description: raw.description || "Gaming studio from Steam",
            location: raw.location || "Unknown",
            type: "Indie",
            dataSource: ["steam"],
            lastUpdated: new Date().toISOString(),
          };
          workingStudios.push(working);
        }
      }

      return workingStudios;
    } catch (_error) {
      logger.warn("Steam fetch failed in WorkingStudioDatabase:", error);
      return [];
    }
  }

  async getAllStudios(): Promise<WorkingStudio[]> {
    await this.init();
    return Array.from(this.studios.values());
  }

  async getStudio(id: string): Promise<WorkingStudio | null> {
    await this.init();
    return this.studios.get(id) || null;
  }

  async getStatistics(): Promise<{
    total: number;
    bySource: Record<string, number>;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
    lastImport: string;
  }> {
    await this.init();

    const studios = Array.from(this.studios.values());
    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byLocation: Record<string, number> = {};

    for (const studio of studios) {
      // By source
      for (const source of studio.dataSource) {
      }

      // By type

      // By location (region)
      const region = this.getRegion(studio.location);
    }

    return {
      total: studios.length,
      bySource,
      byType,
      byLocation,
      lastImport:
          ? Math.max(
              ...studios.map((s) => new Date(s.lastUpdated).getTime()),
            ).toString()
          : "Never",
    };
  }

  private getRegion(location: string): string {
    const loc = location.toLowerCase();
    if (
      loc.includes("ca") ||
      loc.includes("usa") ||
      loc.includes("seattle") ||
      loc.includes("san francisco") ||
      loc.includes("los angeles")
    ) {
      return "North America";
    } else if (
      loc.includes("uk") ||
      loc.includes("germany") ||
      loc.includes("france") ||
      loc.includes("poland")
    ) {
      return "Europe";
    } else if (
      loc.includes("japan") ||
      loc.includes("china") ||
      loc.includes("korea")
    ) {
      return "Asia";
    }
    return "Other";
  }

  async searchStudios(query: string): Promise<WorkingStudio[]> {
    await this.init();

    if (!query) return Array.from(this.studios.values());

    const q = query.toLowerCase();
    return Array.from(this.studios.values()).filter(
      (studio) =>
        studio.name.toLowerCase().includes(q) ||
        studio.description.toLowerCase().includes(q) ||
        studio.games.some((game) => game.toLowerCase().includes(q)) ||
        studio.technologies.some((tech) => tech.toLowerCase().includes(q)),
    );
  }

  async clear(): Promise<void> {
    this.studios.clear();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    logger.info("Working studio database cleared");
  }

  async exportDatabase(): Promise<{
    studios: WorkingStudio[];
    metadata: {
      exportedAt: string;
      version: string;
      count: number;
    };
  }> {
    await this.init();

    return {
      studios: Array.from(this.studios.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        count: this.studios.size,
      },
    };
  }
}

export const workingStudioDatabase = new WorkingStudioDatabase();
