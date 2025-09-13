
import { logger } from "@/shared/utils/logger";
import { GameStudioRepository } from "@/modules/db/repositories/gaming-studios";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";

declare module "@/data/gaming-studios.js" {
  const value: unknown[];
  export default value;
}

export interface StudioInitResult {
  success: boolean;
  loaded: number;
  errors: string[];
  message: string;
}

export class StudioDatabaseInitializer {
  private static instance: StudioDatabaseInitializer;

  static getInstance(): StudioDatabaseInitializer {
    if (!StudioDatabaseInitializer.instance) {
      StudioDatabaseInitializer.instance = new StudioDatabaseInitializer();
    }
    return StudioDatabaseInitializer.instance;
  }

  async initializeStudios(): Promise<StudioInitResult> {
    const result: StudioInitResult = {
      success: false,
      errors: [],
      message: "",
    };

    try {
      logger.info("[GAME] Initializing gaming studios database...");

      // Check if studios are already loaded
      const existingStudios = await GameStudioRepository.getAll();
      const studioCount = Object.keys(existingStudios).length;

      if (studioCount > 0) {
        result.success = true;
        result.loaded = studioCount;
        result.message = `Gaming studios already initialized (${studioCount} studios available)`;
        logger.info(result.message);
        return result;
      }

      // Load studios from constants
      if (GAMING_STUDIOS && typeof GAMING_STUDIOS === "object") {
        const studios = Object.values(GAMING_STUDIOS);
        result.loaded = studios.length;
        result.success = true;
        result.message = `Successfully initialized ${studios.length} gaming studios`;
      } else {
        result.errors.push("Gaming studios data not available");
        result.message = "Failed to load gaming studios data";
        logger.error(result.message);
      }

      // Try to load additional studio data from other sources
      await this.loadAdditionalStudioData(_result);
    } catch (_error) {
      const errorMsg = `Failed to initialize studios: ${_error}`;
      result.errors.push(errorMsg);
      result.message = errorMsg;
      logger.error(errorMsg, error);
    }

    return result;
  }

  private async loadAdditionalStudioData(
    result: StudioInitResult,
  ): Promise<void> {
    try {
      // Try to load from data file
      const gamingStudiosModule = await import("@/data/gaming-studios.js");
      const studiosData = gamingStudiosModule.default || [];

      if (studiosData.length > 0) {
        result.loaded += studiosData.length;
        logger.info(
          `Loaded ${studiosData.length} additional studios from data file`
        );
      }
    } catch (_error) {
      logger.warn("Could not load additional studio data:", error);
      result.errors.push(`Additional data load warning: ${_error}`);
    }
  }

  async validateStudioData(): Promise<{
    valid: boolean;
    totalStudios: number;
    issues: string[];
    recommendations: string[];
  }> {
    const validation = {
      valid: true,
      issues: [] as string[],
      recommendations: [] as string[],
    };

    try {
      const studios = await GameStudioRepository.getAll();
      const studioArray = Object.values(studios);
      validation.totalStudios = studioArray.length;

        validation.valid = false;
        validation.issues.push("No studios found in database");
        validation.recommendations.push(
          "Run studio initialization to populate database",
        );
        return validation;
      }

      // Check for data quality

      studioArray.forEach((studio) => {
          studiosWithoutGames++;
        }
        if (!studio.location) {
          studiosWithoutLocation++;
        }
        if (!studio.description) {
          studiosWithoutDescription++;
        }
      });

        validation.issues.push(
          `${studiosWithoutGames} studios missing game information`,
        );
      }

        validation.issues.push(
          `${studiosWithoutLocation} studios missing location information`,
        );
      }

        validation.issues.push(
          `${studiosWithoutDescription} studios missing descriptions`,
        );
      }

      // Recommendations
        validation.recommendations.push(
          "Consider expanding studio database for better coverage",
        );
      }

        validation.recommendations.push(
          "Studio database appears to be in good condition",
        );
      }

      logger.info(
        `[STATS] Studio validation: ${studioArray.length} studios, ${validation.issues.length} issues found`,
      );
    } catch (_error) {
      validation.valid = false;
      validation.issues.push(`Validation failed: ${_error}`);
      logger.error("Studio validation failed:", error);
    }

    return validation;
  }

  async getStudioStatistics(): Promise<{
    total: number;
    bySize: Record<string, number>;
    byLocation: Record<string, number>;
    topGenres: Array<{ genre: string; count: number }>;
    recentlyUpdated: number;
  }> {
    const stats = {
      bySize: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      topGenres: [] as Array<{ genre: string; count: number }>,
    };

    try {
      const studios = await GameStudioRepository.getAll();
      const studioArray = Object.values(studios);
      stats.total = studioArray.length;

      // Analyze by size
      studioArray.forEach((studio) => {
        const size = studio.size || "unknown";

        // Extract country from location
        if (studio.location) {
          const location = this.extractCountry(studio.location);
        }
      });

      // Analyze genres (simplified)
      const genreCount: Record<string, number> = {};
      studioArray.forEach((studio) => {
        if (studio.description) {
          const desc = studio.description.toLowerCase();
          if (desc.includes("rpg"))
          if (desc.includes("action"))
          if (desc.includes("strategy"))
          if (desc.includes("simulation"))
          if (desc.includes("mobile"))
        }
      });

      stats.topGenres = Object.entries(genreCount)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)

      logger.info(
      );
    } catch (_error) {
      logger.error("Failed to generate studio statistics:", error);
    }

    return stats;
  }

  private extractCountry(location: string): string {
    const loc = location.toLowerCase();

    if (
      loc.includes("usa") ||
      loc.includes("united states") ||
      loc.includes(", ca") ||
      loc.includes("california") ||
      loc.includes("texas") ||
      loc.includes("new york")
    ) {
      return "United States";
    }
    if (loc.includes("canada")) return "Canada";
    if (
      loc.includes("uk") ||
      loc.includes("united kingdom") ||
      loc.includes("london")
    )
      return "United Kingdom";
    if (loc.includes("france") || loc.includes("paris")) return "France";
    if (loc.includes("germany") || loc.includes("berlin")) return "Germany";
    if (loc.includes("japan") || loc.includes("tokyo")) return "Japan";
    if (
      loc.includes("china") ||
      loc.includes("beijing") ||
      loc.includes("shanghai")
    )
      return "China";
    if (
      loc.includes("south korea") ||
      loc.includes("korea") ||
      loc.includes("seoul")
    )
      return "South Korea";
    if (loc.includes("sweden") || loc.includes("stockholm")) return "Sweden";
    if (loc.includes("finland") || loc.includes("helsinki")) return "Finland";
    if (
      loc.includes("australia") ||
      loc.includes("sydney") ||
      loc.includes("melbourne")
    )
      return "Australia";

    return "Other";
  }

  async ensureStudioDatabase(): Promise<boolean> {
    try {
      const initResult = await this.initializeStudios();

      if (!initResult.success) {
        logger.error("Failed to ensure studio database:", initResult.errors);
        return false;
      }

      const validation = await this.validateStudioData();

      if (!validation.valid) {
        logger.warn("Studio database validation issues:", validation.issues);
        // Still return true if we have some data, just log the issues
      }

      return true;
    } catch (_error) {
      logger.error("Failed to ensure studio database:", error);
      return false;
    }
  }

  async getStudioSuggestions(
    query: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      location: string;
      matchType: "name" | "description" | "game";
    }>
  > {
    const suggestions: Array<{
      id: string;
      name: string;
      description: string;
      location: string;
      matchType: "name" | "description" | "game";
    }> = [];

      return suggestions;
    }

    try {
      const studios = await GameStudioRepository.getAll();
      const studioArray = Object.values(studios);
      const searchQuery = query.toLowerCase();

      studioArray.forEach((studio) => {
        let matchType: "name" | "description" | "game" | null = null;

        // Check name match
        if (studio.name.toLowerCase().includes(searchQuery)) {
          matchType = "name";
        }
        // Check description match
        else if (studio.description?.toLowerCase().includes(searchQuery)) {
          matchType = "description";
        }
        // Check games match
        else if (
          studio.games?.some((game) => game.toLowerCase().includes(searchQuery))
        ) {
          matchType = "game";
        }

        if (matchType && suggestions.length < limit) {
          suggestions.push({
            id: studio.id,
            name: studio.name,
            description: studio.description || "",
            location: studio.location || "",
            matchType,
          });
        }
      });

      // Sort by relevance (name matches first, then description, then games)
      suggestions.sort((a, b) => {
        return order[a.matchType] - order[b.matchType];
      });
    } catch (_error) {
      logger.error("Failed to get studio suggestions:", error);
    }

    return suggestions;
  }
}

// Export singleton instance
export const studioDatabaseInitializer =
  StudioDatabaseInitializer.getInstance();
