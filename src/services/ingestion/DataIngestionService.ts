
import { logger } from "@/shared/utils/logger";
import type { GameStudio, TeamSize } from "@/shared/types/jobs";

export interface DataSource {
  id: string;
  name: string;
  priority: number; // Higher = more trusted
  rateLimit: { requests: number; window: number }; // requests per window (ms)
  enabled: boolean;
}

export interface IngestionJob {
  id: string;
  sourceId: string;
  type: "full_sync" | "incremental" | "single_entity";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  totalItems?: number;
  processedItems?: number;
  errors: IngestionError[];
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface IngestionError {
  id: string;
  message: string;
  entityId?: string;
  entityName?: string;
  severity: "warning" | "error" | "critical";
  timestamp: Date;
  retryCount: number;
  resolved: boolean;
}

export interface RawStudioData {
  sourceId: string;
  sourceEntityId: string;
  name: string;
  description?: string;
  websites?: string[];
  games?: Array<{
    name: string;
    releaseDate?: string;
    platforms?: string[];
    genres?: string[];
  }>;
  location?: string;
  logo?: string;
  // Additional fields may vary by source
  metadata: Record<string, any>;
  lastUpdated: Date;
}

export interface ConflictResolution {
  entityId: string;
  conflicts: Array<{
    field: string;
    sources: Array<{ sourceId: string; value: any; confidence: number }>;
    resolution: "auto" | "manual" | "pending";
    resolvedValue?: any;
    resolvedBy?: string;
    resolvedAt?: Date;
  }>;
}

export class DataIngestionService {
  private sources: Map<string, DataSource> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private activeJobs: Map<string, IngestionJob> = new Map();

  constructor() {
    this.initializeDataSources().catch((err) =>
      logger.error(
        "Failed to initialize data sources",
        err,
        "DataIngestionService",
      ),
    );
  }

  private async initializeDataSources() {
    const { getEnabledDataSources } = await import("@/config/data-sources");
    const enabledSources = getEnabledDataSources();

    enabledSources.forEach((_config) => {
      const source: DataSource = {
        id: config.id,
        name: config.name,
        priority: config.priority,
        rateLimit: {
          requests: config.rateLimit.requests,
          window: config.rateLimit.windowMs,
        },
        enabled: config.enabled,
      };

      this.sources.set(source.id, source);
      this.rateLimiters.set(source.id, new RateLimiter(source.rateLimit));
    });
  }

  async startIngestionJob(
    sourceId: string,
    type: IngestionJob["type"],
    options: {
      entityIds?: string[];
      fullSync?: boolean;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<string> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Unknown data source: ${sourceId}`);
    }

    if (!source.enabled) {
      throw new Error(`Data source ${sourceId} is not enabled`);
    }

    const jobId = crypto.randomUUID();
    const job: IngestionJob = {
      id: jobId,
      sourceId,
      type,
      status: "pending",
      errors: [],
      metadata: options.metadata || {},
    };

    this.activeJobs.set(jobId, job);

    // Start job asynchronously
      logger.error(`Ingestion job ${jobId} failed:`, error);
      job.status = "failed";
      job.errors.push({
        id: crypto.randomUUID(),
        message: error.message,
        severity: "critical",
        timestamp: new Date(),
        resolved: false,
      });
    });

    logger.info(`Started ingestion job ${jobId} for source ${sourceId}`);
    return jobId;
  }

    job.status = "running";
    job.startedAt = new Date();

    try {
      const sourceService = await this.getSourceService(job.sourceId);
      const rawData = await sourceService.fetchData(job);

      job.totalItems = rawData.length;

      for (const data of rawData) {
        try {
          await this.processRawData(_data);
          job.processedItems++;
          job.progress = Math.floor(
          );
        } catch (error: any) {
          job.errors.push({
            id: crypto.randomUUID(),
            message: error.message,
            entityId: data.sourceEntityId,
            entityName: data.name,
            severity: "error",
            timestamp: new Date(),
            resolved: false,
          });
        }

        // Check rate limits
        await this.rateLimiters.get(job.sourceId)?.wait();
      }

      job.status = "completed";
    } catch (error: any) {
      job.status = "failed";
      job.errors.push({
        id: crypto.randomUUID(),
        message: `Job execution failed: ${error.message}`,
        severity: "critical",
        timestamp: new Date(),
        resolved: false,
      });
    } finally {
      job.completedAt = new Date();
    }
  }

  private async processRawData(rawData: RawStudioData): Promise<void> {
    // Normalize the raw data
    const normalized = await this.normalizeRawData(rawData);

    // Check for existing studios (conflict detection)
    const conflicts = await this.detectConflicts(normalized);

      // Handle conflicts based on resolution strategy
      await this.handleConflicts(normalized, conflicts);
    } else {
      // No conflicts, safe to import
      await this.importStudio(normalized);
    }
  }

  private async normalizeRawData(rawData: RawStudioData): Promise<GameStudio> {
    // Convert raw data to our studio format
    return {
      id: this.generateStudioId(rawData.name),
      name: this.cleanStudioName(rawData.name),
      location: this.normalizeLocation(rawData.location || ""),
      size: this.inferStudioSize(rawData),
      type: this.inferStudioType(rawData),
      founded: this.extractFoundedYear(rawData),
      description: rawData.description || "",
      games: rawData.games?.map((g) => g.name) || [],
      technologies: this.inferTechnologies(rawData),
      culture: {
        values: [],
        workStyle: "Unknown",
        benefits: [],
        diversity: true,
        remoteFirst: false,
      },
      logo: rawData.logo,
      benefits: [],
    };
  }

  private async detectConflicts(
    _studio: GameStudio,
  ): Promise<ConflictResolution[]> {
    // Implementation would check against existing studios
    // Using fuzzy matching on name, website, games, etc.
    return [];
  }

  private async handleConflicts(
    studio: GameStudio,
    conflicts: ConflictResolution[],
  ): Promise<void> {
    // Implement conflict resolution strategies
    logger.warn(
      `Conflicts detected for studio ${studio.name}:`,
      conflicts.length,
    );
  }

  private async importStudio(studio: GameStudio): Promise<void> {
    // Store the studio data where StudioDataManager can find it
    const { unifiedStorage } = await import("@/utils/storage");

    // Get existing steam data
    const existingSteamData =
      (await unifiedStorage.get("steam_studio_data")) || [];

    // Add new studio to the collection
    const updatedSteamData = [...existingSteamData];
    const existingIndex = updatedSteamData.findIndex((s) => s.id === studio.id);

      updatedSteamData[existingIndex] = studio;
    } else {
      updatedSteamData.push(studio);
    }

    // Store back to storage
    await unifiedStorage.set("steam_studio_data", updatedSteamData);

    logger.info(`Successfully imported studio: ${studio.name}`);
  }

  // Utility methods
  private generateStudioId(name: string): string {
    return name
      .toLowerCase()
      .replace(/^-+|-+$/g, "")
  }

  private cleanStudioName(name: string): string {
    return name
      .replace(/\s+(inc\.?|llc\.?|ltd\.?|corp\.?|corporation)$/i, "")
      .trim();
  }

  private normalizeLocation(location: string): string {
    // Simple location normalization
  }

  private inferStudioSize(data: RawStudioData): TeamSize {
  }

  private inferStudioType(data: RawStudioData): GameStudio["type"] {
    const games = data.games || [];
    const name = data.name.toLowerCase();

    if (
      name.includes("mobile") ||
      games.some((g) =>
        g.platforms?.some(
          (p) =>
            p.toLowerCase().includes("mobile") ||
            p.includes("ios") ||
            p.includes("android"),
        ),
      )
    ) {
      return "Mobile";
    }

    if (
      name.includes("vr") ||
      name.includes("virtual reality") ||
      games.some((g) =>
        g.platforms?.some((p) => p.toLowerCase().includes("vr")),
      )
    ) {
      return "VR/AR";
    }

    return "Indie";
  }

  private extractFoundedYear(data: RawStudioData): number {
    // Try to extract founded year from various sources
    const currentYear = new Date().getFullYear();
    const oldestGame = data.games?.reduce((oldest, game) => {
      const year = game.releaseDate
        ? new Date(game.releaseDate).getFullYear()
        : currentYear;
      return year < oldest ? year : oldest;
    }, currentYear);

    return oldestGame || currentYear;
  }

  private inferTechnologies(data: RawStudioData): string[] {
    const techs: string[] = [];
    const games = data.games || [];

    // Infer from platforms
    if (games.some((g) => g.platforms?.some((p) => p.includes("PC")))) {
      techs.push("C++", "DirectX");
    }
    if (games.some((g) => g.platforms?.some((p) => p.includes("Mobile")))) {
    }
    if (games.some((g) => g.platforms?.some((p) => p.includes("Console")))) {
      techs.push("C++", "PlayStation SDK", "Xbox SDK");
    }

    return Array.from(new Set(techs));
  }

  private async getSourceService(sourceId: string) {
    // Factory method to get the appropriate source service
    switch (sourceId) {
      case "steam": {
        const { SteamDataSource } = await import("./SteamDataSource");
        return new SteamDataSource();
      }
      case "public-apis": {
        const { PublicAPIDataSource } = await import("./PublicAPIDataSource");
        return new PublicAPIDataSource();
      }
      case "igdb": {
        const { IGDBDataSource } = await import("./IGDBDataSource");
        return new IGDBDataSource();
      }
      default:
        throw new Error(`No service implementation for source: ${sourceId}`);
    }
  }

  // Public API methods
  getJob(jobId: string): IngestionJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  getAllJobs(): IngestionJob[] {
    return Array.from(this.activeJobs.values());
  }

  getDataSources(): DataSource[] {
    return Array.from(this.sources.values());
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (job && job.status === "running") {
      job.status = "cancelled";
      return true;
    }
    return false;
  }
}

class RateLimiter {
  private requests: Array<{ timestamp: number }> = [];

  // eslint-disable-next-line no-unused-vars
  constructor(private config: { requests: number; window: number }) {}

  async wait(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < this.config.window,
    );

    if (this.requests.length >= this.config.requests) {
      const waitTime = this.config.window - (now - oldestRequest.timestamp);

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.requests.push({ timestamp: now });
  }
}

export const dataIngestionService = new DataIngestionService();
export default dataIngestionService;
