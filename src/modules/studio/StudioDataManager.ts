
import { unifiedStorage } from "@/utils/storage";
import { GameStudioRepository } from "@/modules/db/repositories/gaming-studios";
import { logger } from "@/shared/utils/logger";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";
import type { GameStudio as _GameStudio } from "@/shared/types/jobs"; // Used for repository operations

// Optional external data source that may be bundled at build-time
declare const GAMING_STUDIOS_DATA: any[] | undefined;

export interface StudioImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: Array<{
    studio: string;
    error: string;
  }>;
  summary: {
    totalAttempted: number;
    totalSuccessful: number;
    duplicatesFound: number;
    dataQualityIssues: number;
  };
}

export interface StudioValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export class StudioDataManager {
  private static instance: StudioDataManager;
  private readonly DATA_VERSION_KEY = "studio_data_version";
  private readonly LAST_IMPORT_KEY = "studio_last_import";

  static getInstance(): StudioDataManager {
    if (!StudioDataManager.instance) {
      StudioDataManager.instance = new StudioDataManager();
    }
    return StudioDataManager.instance;
  }

  async importAllStudios(forceReimport = false): Promise<StudioImportResult> {
    const result: StudioImportResult = {
      success: false,
      errors: [],
      summary: {
      },
    };

    try {
      logger.info("Starting studio data import process...");

      // Check if import is needed
      if (!forceReimport && (await this.isImportUpToDate())) {
        logger.info("Studio data is up to date, skipping import");
        result.success = true;
        return result;
      }

      // Combine data from multiple sources
      const allStudioData = await this.consolidateStudioData();
      result.summary.totalAttempted = allStudioData.length;

      logger.info(
        `Importing ${allStudioData.length} studios from consolidated sources`,
      );

      // Process studios in batches to prevent memory issues
        const batch = allStudioData.slice(i, i + this.IMPORT_BATCH_SIZE);
        const batchResult = await this.processBatch(batch);

        result.imported += batchResult.imported;
        result.updated += batchResult.updated;
        result.errors.push(...batchResult.errors);
        result.summary.duplicatesFound += batchResult.duplicates;
        result.summary.dataQualityIssues += batchResult.qualityIssues;
      }

      result.summary.totalSuccessful = result.imported + result.updated;
      result.success =

      // Update import metadata
      await this.updateImportMetadata();

      // Generate import report
      await this.generateImportReport(_result);

      logger.info(
        `Studio import completed: ${result.summary.totalSuccessful}/${result.summary.totalAttempted} successful`,
      );
    } catch (_error) {
      logger.error("Studio import failed:", error);
      result.errors.push({
        studio: "SYSTEM",
        error: error instanceof Error ? error.message : String(_error),
      });
    }

    return result;
  }

  private async consolidateStudioData(): Promise<any[]> {
    const consolidated = new Map<string, any>();

    try {
      if (GAMING_STUDIOS && typeof GAMING_STUDIOS === "object") {
        Object.values(GAMING_STUDIOS).forEach((studio) => {
          if (studio?.id) {
            consolidated.set(studio.id, {
              ...studio,
              dataSource: ["constants"],
            });
          }
        });
      }

      if (
        typeof GAMING_STUDIOS_DATA !== "undefined" &&
        Array.isArray(GAMING_STUDIOS_DATA)
      ) {
        GAMING_STUDIOS_DATA.forEach((studio: any) => {
          if (studio?.id) {
            const existing = consolidated.get(studio.id);
            if (existing) {
              // Merge data, preferring more complete information
              consolidated.set(
                studio.id,
                this.mergeStudioData(existing, {
                  ...studio,
                  dataSource: [...(existing.dataSource || []), "data-file"],
                }),
              );
            } else {
              consolidated.set(studio.id, {
                ...studio,
                dataSource: ["data-file"],
              });
            }
          }
        });
      }

        const existing = consolidated.get(studio.id);
        if (existing) {
          // Merge data, preferring more complete information
          consolidated.set(
            studio.id,
            this.mergeStudioData(existing, {
              ...studio,
            }),
          );
        } else {
          consolidated.set(studio.id, {
            ...studio,
          });
        }
      });

      await this.addExternalStudioData(consolidated);
    } catch (_error) {
      logger.error("Error consolidating studio data:", error);
    }

    return Array.from(consolidated.values());
  }

  private mergeStudioData(existing: any, incoming: any): any {
    return {
      ...existing,
      ...incoming,
      // Merge arrays, removing duplicates
      games: [
        ...new Set([...(existing.games || []), ...(incoming.games || [])]),
      ],
      technologies: [
        ...new Set([
          ...(existing.technologies || []),
          ...(incoming.technologies || []),
        ]),
      ],
      specialties: [
        ...new Set([
          ...(existing.specialties || []),
          ...(incoming.specialties || []),
        ]),
      ],
      aliases: [
        ...new Set([...(existing.aliases || []), ...(incoming.aliases || [])]),
      ],
      dataSource: [
        ...new Set([
          ...(existing.dataSource || []),
          ...(incoming.dataSource || []),
        ]),
      ],
      // Use the most recent or higher priority data for scalars
      lastUpdated: new Date(),
    };
  }

  private async addExternalStudioData(
    consolidated: Map<string, any>,
  ): Promise<void> {
    try {
      // Check for cached external data
      const cachedExternal = await unifiedStorage.get("external_studio_data");
      if (cachedExternal && Array.isArray(cachedExternal)) {
        cachedExternal.forEach((studio) => {
          if (studio?.id) {
            const existing = consolidated.get(studio.id);
            if (existing) {
              consolidated.set(
                studio.id,
                this.mergeStudioData(existing, {
                  ...studio,
                  dataSource: [...(existing.dataSource || []), "external-api"],
                }),
              );
            } else {
              consolidated.set(studio.id, {
                ...studio,
                dataSource: ["external-api"],
              });
            }
          }
        });
      }
    } catch (_error) {
      logger.warn("Failed to load external studio data:", error);
    }
  }

  private async processBatch(batch: any[]): Promise<{
    imported: number;
    updated: number;
    errors: Array<{ studio: string; error: string }>;
    duplicates: number;
    qualityIssues: number;
  }> {
    const result: {
      imported: number;
      updated: number;
      errors: Array<{ studio: string; error: string }>;
      duplicates: number;
      qualityIssues: number;
    } = {
      errors: [],
    };

    for (const studioData of batch) {
      try {
        // Validate studio data
        const validation = this.validateStudioData(studioData);
        if (!validation.valid) {
          result.errors.push({
            studio: studioData.name || studioData.id || "Unknown",
            error: `Validation failed: ${validation.errors.join(", ")}`,
          });
          result.qualityIssues++;
          continue;
        }

          result.qualityIssues++;
          logger.warn(
            `Studio ${studioData.name} has data quality issues:`,
            validation.warnings,
          );
        }

        // Normalize studio data
        const normalizedStudio = this.normalizeStudioData(studioData);

        // Check if studio already exists
        const existing = await GameStudioRepository.getById(
          normalizedStudio.id,
        );
        const allStudios = await GameStudioRepository.getAll();

        if (existing) {
          // Update existing studio with new data
          const merged = this.mergeStudioData(existing, normalizedStudio);
          allStudios[normalizedStudio.id] = merged;
          await GameStudioRepository.importData({
            studios: allStudios,
            favorites: [],
          });
          result.updated++;
          result.duplicates++;
        } else {
          // Create new studio
          allStudios[normalizedStudio.id] = normalizedStudio;
          await GameStudioRepository.importData({
            studios: allStudios,
            favorites: [],
          });
          result.imported++;
        }
      } catch (_error) {
        result.errors.push({
          studio: studioData.name || studioData.id || "Unknown",
          error: error instanceof Error ? error.message : String(_error),
        });
        logger.error(`Failed to process studio ${studioData.name}:`, error);
      }
    }

    return result;
  }

  private validateStudioData(studio: any): StudioValidationResult {
    const result: StudioValidationResult = {
      valid: true,
      warnings: [],
      errors: [],
      suggestions: [],
    };

    // Required fields
    if (!studio.id) {
      result.errors.push("Missing studio ID");
      result.valid = false;
    }

    if (!studio.name) {
      result.errors.push("Missing studio name");
      result.valid = false;
    }

    // Recommended fields
    if (!studio.description) {
      result.warnings.push("Missing description");
    }

    if (!studio.location && !studio.headquarters) {
      result.warnings.push("Missing location information");
    }

      result.warnings.push("No games listed");
    }

    if (!studio.founded) {
      result.warnings.push("Missing founding date");
    }

    // Data quality checks
      result.errors.push("Studio name too short");
      result.valid = false;
    }

    if (studio.employeeCount && !/\d+/.test(studio.employeeCount)) {
      result.warnings.push("Employee count format unclear");
    }

    if (studio.website && !studio.website.startsWith("http")) {
      result.suggestions.push("Website URL should include protocol (https://)");
    }

    return result;
  }

  private normalizeStudioData(studio: any): any {
    return {
      id: studio.id,
      name: studio.name?.trim(),
      description: studio.description?.trim(),
      headquarters: studio.headquarters || studio.location,
      location: studio.location || studio.headquarters,
      founded: studio.founded,
      employeeCount: studio.employeeCount || studio.size,
      size: this.normalizeStudioSize(studio.employeeCount || studio.size),
      website: this.normalizeWebsite(studio.website),
      stockTicker: studio.stockTicker,
      parentCompany: studio.parentCompany,
      publiclyTraded: !!studio.stockTicker,

      // Arrays
      games: Array.isArray(studio.games) ? studio.games.filter(Boolean) : [],
      technologies: Array.isArray(studio.technologies)
        ? studio.technologies.filter(Boolean)
        : studio.techStack || [],
      specialties: Array.isArray(studio.specialties)
        ? studio.specialties.filter(Boolean)
        : [],
      aliases: Array.isArray(studio.aliases)
        ? studio.aliases.filter(Boolean)
        : [],

      // Metadata
      dataSource: Array.isArray(studio.dataSource)
        ? studio.dataSource
        : ["import"],
      lastUpdated: new Date(),

      // Additional fields
      logoPath: studio.logoPath || studio.logo,
      industry: studio.industry || "Game Development",
      culture: studio.culture,
      careerOpportunities: studio.careerOpportunities,
      benefits: studio.benefits,
      averageSalary: studio.averageSalary,
      glassdoorRating: studio.glassdoorRating,

      // Computed fields
      category: this.computeStudioCategory(studio),
      genres: this.extractGenres(studio),
      platforms: this.extractPlatforms(studio),
    };
  }

  private normalizeStudioSize(sizeInput: string | number): string {
    if (!sizeInput) return "unknown";

    const sizeStr = sizeInput.toString().toLowerCase();
    const num = parseInt(sizeStr.replace(/[^\d]/g, ""));


    // Fallback to text analysis
      return "enterprise";
    if (sizeStr.includes("indie") || sizeStr.includes("independent"))
      return "indie";

    return "unknown";
  }

  private normalizeWebsite(url: string): string {
    if (!url) return "";

    let normalized = url.trim();
    if (!normalized.startsWith("http")) {
      normalized = "https://" + normalized;
    }

    return normalized;
  }

  private computeStudioCategory(studio: any): string {
    const size = this.normalizeStudioSize(studio.employeeCount || studio.size);
    const hasPublisher = !!studio.parentCompany;

    if (size === "enterprise") return "AAA Publisher";
    if (size === "large" && hasPublisher) return "AAA Studio";
    if (size === "large") return "Independent Large";
    if (size === "medium") return "Growing Studio";
    if (size === "small") return "Small Studio";
    return "Indie Developer";
  }

  private extractGenres(studio: any): string[] {
    const genres = new Set<string>();
    const content = [
      studio.description || "",
      studio.specialties?.join(" ") || "",
      studio.games?.join(" ") || "",
    ]
      .join(" ")
      .toLowerCase();

    const genrePatterns = {
      RPG: /rpg|role.?playing|dragon|fantasy|magic/,
      Action: /action|fighting|combat|shooter|fps/,
      Simulation: /simulation|sim|life|city|farming/,
      Sports: /sports|fifa|nba|nfl|racing|tennis/,
      Puzzle: /puzzle|match|brain|logic|tetris/,
      Horror: /horror|scary|zombie|survival|resident/,
      Adventure: /adventure|exploration|journey/,
      Platform: /platform|mario|sonic|jump/,
      Racing: /racing|drive|car|need.?speed/,
      MOBA: /moba|league|dota|heroes/,
      "Battle Royale": /battle.?royale|fortnite|apex|pubg/,
      MMO: /mmo|massive|world.?warcraft|online/,
    };

    Object.entries(genrePatterns).forEach(([genre, pattern]) => {
      if (pattern.test(content)) {
        genres.add(genre);
      }
    });

    return Array.from(genres);
  }

  private extractPlatforms(studio: any): string[] {
    const platforms = new Set<string>();
    const content = [
      studio.description || "",
      studio.specialties?.join(" ") || "",
      studio.games?.join(" ") || "",
    ]
      .join(" ")
      .toLowerCase();

    const platformPatterns = {
      PC: /pc|steam|windows|linux|mac/,
      Mobile: /mobile|ios|android|phone|tablet/,
      VR: /vr|virtual.?reality|oculus|vive/,
    };

    Object.entries(platformPatterns).forEach(([platform, pattern]) => {
      if (pattern.test(content)) {
        platforms.add(platform);
      }
    });

    return Array.from(platforms);
  }

  private async isImportUpToDate(): Promise<boolean> {
    try {
      const lastImport = await unifiedStorage.get(this.LAST_IMPORT_KEY);
      if (!lastImport) return false;

      const lastImportDate = new Date(lastImport);

      return lastImportDate > oneDayAgo;
    } catch {
      return false;
    }
  }

  private async updateImportMetadata(): Promise<void> {
    try {
      await unifiedStorage.set(this.LAST_IMPORT_KEY, new Date().toISOString());
      await unifiedStorage.set(this.DATA_VERSION_KEY, {
        importedAt: new Date().toISOString(),
        source: "StudioDataManager",
      });
    } catch (_error) {
      logger.warn("Failed to update import metadata:", error);
    }
  }

  private async generateImportReport(
    result: StudioImportResult,
  ): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      result,
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    };

    try {
      const reports = (await unifiedStorage.get("studio_import_reports")) || [];
      reports.unshift(report);
      await unifiedStorage.set("studio_import_reports", reports);
    } catch (_error) {
      logger.warn("Failed to save import report:", error);
    }
  }

  async getImportHistory(): Promise<any[]> {
    try {
      return (await unifiedStorage.get("studio_import_reports")) || [];
    } catch {
      return [];
    }
  }

  async getStudioStatistics(): Promise<{
    total: number;
    bySize: Record<string, number>;
    byRegion: Record<string, number>;
    byCategory: Record<string, number>;
    lastImport: string | null;
  }> {
    try {
      const studios = await GameStudioRepository.getAll();
      const studioArray = Object.values(studios);

      const bySize: Record<string, number> = {};
      const byRegion: Record<string, number> = {};
      const byCategory: Record<string, number> = {};

      studioArray.forEach((studio) => {
        // Size distribution
        const size = studio.size || "unknown";

        // Region distribution
        const region = this.extractRegion(studio.location || "");

        // Category distribution
        const category = (studio as any).category || "unknown";
      });

      const lastImport = await unifiedStorage.get(this.LAST_IMPORT_KEY);

      return {
        total: studioArray.length,
        bySize,
        byRegion,
        byCategory,
        lastImport,
      };
    } catch (_error) {
      logger.error("Failed to get studio statistics:", error);
      return {
        bySize: {},
        byRegion: {},
        byCategory: {},
        lastImport: null,
      };
    }
  }

  private extractRegion(location: string): string {
    if (!location) return "Unknown";

    const loc = location.toLowerCase();

    if (
      loc.includes("usa") ||
      loc.includes("united states") ||
      loc.includes(", ca") ||
      loc.includes("california") ||
      loc.includes("texas") ||
      loc.includes("new york")
    ) {
      return "North America";
    }

    if (
      loc.includes("canada") ||
      loc.includes("toronto") ||
      loc.includes("montreal")
    ) {
      return "North America";
    }

    if (
      loc.includes("uk") ||
      loc.includes("london") ||
      loc.includes("france") ||
      loc.includes("germany") ||
      loc.includes("sweden") ||
      loc.includes("finland")
    ) {
      return "Europe";
    }

    if (
      loc.includes("japan") ||
      loc.includes("tokyo") ||
      loc.includes("china") ||
      loc.includes("korea") ||
      loc.includes("singapore")
    ) {
      return "Asia";
    }

    if (loc.includes("australia") || loc.includes("new zealand")) {
      return "Oceania";
    }

    return "Other";
  }

  async validateDatabaseIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
    duplicates: Array<{ id: string; name: string; count: number }>;
    missingData: Array<{ id: string; name: string; missing: string[] }>;
  }> {
    const result: {
      valid: boolean;
      issues: string[];
      duplicates: Array<{ id: string; name: string; count: number }>;
      missingData: Array<{ id: string; name: string; missing: string[] }>;
    } = {
      valid: true,
      issues: [],
      duplicates: [],
      missingData: [],
    };

    try {
      const studios = await GameStudioRepository.getAll();
      const studioArray = Object.values(studios);

      // Check for duplicates
      const nameMap = new Map<string, string[]>();
      studioArray.forEach((studio) => {
        const name = studio.name.toLowerCase();
        if (!nameMap.has(name)) {
          nameMap.set(name, []);
        }
        nameMap.get(name)!.push(studio.id);
      });

      nameMap.forEach((ids, name) => {
          result.duplicates.push({
            id: ids.join(", "),
            name,
            count: ids.length,
          });
          result.valid = false;
        }
      });

      // Check for missing essential data
      studioArray.forEach((studio) => {
        const missing: string[] = [];

        if (!studio.description) missing.push("description");
        if (!studio.location) missing.push("location");
        if (!studio.founded) missing.push("founding date");

          result.missingData.push({
            id: studio.id,
            name: studio.name,
            missing,
          });
        }
      });

        result.issues.push(
          `Found ${result.duplicates.length} duplicate studio names`,
        );
      }

        result.issues.push(
          `Found ${result.missingData.length} studios with missing data`,
        );
      }
    } catch (_error) {
      result.valid = false;
      result.issues.push(
        `Database validation failed: ${error instanceof Error ? error.message : String(_error)}`,
      );
    }

    return result;
  }

  async exportDatabase(): Promise<{
    studios: any[];
    metadata: {
      exportedAt: string;
      version: string;
      count: number;
    };
  }> {
    try {
      const studios = await GameStudioRepository.getAll();
      const studioArray = Object.values(studios);

      return {
        studios: studioArray,
        metadata: {
          exportedAt: new Date().toISOString(),
          count: studioArray.length,
        },
      };
    } catch (_error) {
      logger.error("Failed to export database:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const studioDataManager = StudioDataManager.getInstance();
