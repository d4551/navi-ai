/**
 * Steam API Data Source
 * Fetches gaming studio data from Steam's public APIs
 */

import { logger } from "@/shared/utils/logger";
import type { RawStudioData, IngestionJob } from "./DataIngestionService";

export interface SteamApp {
  appid: number;
  name: string;
}

export interface SteamAppDetails {
  success: boolean;
  data?: {
    name: string;
    type: string;
    developers?: string[];
    publishers?: string[];
    release_date?: {
      coming_soon: boolean;
      date: string;
    };
    genres?: Array<{ description: string }>;
    categories?: Array<{ description: string }>;
    platforms?: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    short_description?: string;
    header_image?: string;
    website?: string;
  };
}

export class SteamDataSource {
  private readonly baseUrl = "https://api.steampowered.com";
  private readonly storeBaseUrl = "https://store.steampowered.com/api";

  constructor() {
    // Steam store API doesn't require an API key for basic operations
  }

  async fetchData(job: IngestionJob): Promise<RawStudioData[]> {
    logger.info("Starting Steam data ingestion");

    try {
      const apps = await this.fetchAppList();
      const studioData = new Map<string, RawStudioData>();

      // Scale up to fetch thousands of studios - use much higher limits
      const maxApps = job.metadata?.maxStudios ? Math.min(job.metadata.maxStudios * 10, 5000) : 5000;
      const limitedApps = apps.slice(0, maxApps);
      
      // Process apps in smaller batches to handle rate limiting better
      const batchSize = 20; // Smaller batches to reduce rate limiting
      for (let i = 0; i < limitedApps.length; i += batchSize) {
        const batch = limitedApps.slice(i, i + batchSize);

        for (const app of batch) {
          try {
            const details = await this.fetchAppDetails(app.appid);
            if (details?.success && details.data?.developers) {
              this.processAppForStudios(details.data, studioData);
            }
          } catch (error) {
            logger.warn(`Failed to fetch details for app ${app.appid}:`, error);
          }

          // Longer delay to handle Steam rate limiting better
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        // Update job progress
        const progress = Math.floor(((i + batchSize) / limitedApps.length) * 100);
        job.progress = Math.min(progress, 100);

        logger.info(`Steam ingestion progress: ${job.progress}% (${studioData.size} studios found)`);
        
        // Longer delay between batches to avoid overwhelming Steam's API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return Array.from(studioData.values());
    } catch (error) {
      logger.error("Steam data ingestion failed:", error);
      throw error;
    }
  }

  private async fetchAppList(): Promise<SteamApp[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ISteamApps/GetAppList/v0002/`,
      );
      if (!response.ok) {
        throw new Error(
          `Steam API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const apps = data.applist?.apps || [];

      // Filter out non-game apps and focus on actual games with better filtering
      return apps
        .filter(
          (app: SteamApp) =>
            app.name &&
            app.name.length > 2 && // Avoid single-character or very short names
            !app.name.toLowerCase().includes("demo") &&
            !app.name.toLowerCase().includes("soundtrack") &&
            !app.name.toLowerCase().includes("dlc") &&
            !app.name.toLowerCase().includes("trailer") &&
            !app.name.toLowerCase().includes("dedicated server") &&
            !app.name.toLowerCase().includes("sdk") &&
            !app.name.toLowerCase().includes("development kit") &&
            // Focus on apps that are more likely to be actual games
            !/^(steam|valve|source|dedicated|server|client)$/i.test(app.name),
        )
        // Sort by appid to get older, more established games first (they're more likely to have proper data)
        .sort((a: SteamApp, b: SteamApp) => a.appid - b.appid)
        .slice(0, 10000); // Scale up to get thousands of apps
    } catch (error) {
      logger.error("Failed to fetch Steam app list:", error);
      throw error;
    }
  }

  private async fetchAppDetails(
    appid: number,
  ): Promise<SteamAppDetails | null> {
    try {
      // Remove filters to get full data including developers/publishers
      const response = await fetch(
        `${this.storeBaseUrl}/appdetails?appids=${appid}`,
      );

      if (!response.ok) {
        // Handle rate limiting more gracefully
        if (response.status === 429) {
          logger.warn(`Steam API rate limited for app ${appid}, skipping`);
          return null;
        }
        throw new Error(`Steam store API error: ${response.status}`);
      }

      const data = await response.json();
      return data[appid] || null;
    } catch (error) {
      logger.warn(`Failed to fetch Steam app details for ${appid}:`, error);
      return null;
    }
  }

  private processAppForStudios(
    appData: SteamAppDetails["data"],
    studioMap: Map<string, RawStudioData>,
  ) {
    if (!appData?.developers?.length) return;

    const developers = appData.developers;
    const game = {
      name: appData.name,
      releaseDate: appData.release_date?.date,
      platforms: this.extractPlatforms(appData),
      genres: appData.genres?.map((g) => g.description) || [],
    };

    developers.forEach((developerName) => {
      const cleanName = this.cleanStudioName(developerName);
      if (!cleanName || cleanName.length < 2) return;

      const studioId = this.generateStudioId(cleanName);
      let studioData = studioMap.get(studioId);

      if (!studioData) {
        studioData = {
          sourceId: "steam",
          sourceEntityId: studioId,
          name: cleanName,
          description: `Game developer known for ${game.name}`,
          websites: appData.website ? [appData.website] : [],
          games: [],
          location: "Unknown", // Steam doesn't provide location data
          logo: appData.header_image,
          metadata: {
            steamDeveloper: true,
            firstSeenAppId: appData.name,
          },
          lastUpdated: new Date(),
          confidence: this.calculateConfidence(cleanName, [game]),
        };
        studioMap.set(studioId, studioData);
      }

      // Add the game to the studio's portfolio
      const existingGame = studioData.games?.find((g) => g.name === game.name);
      if (!existingGame) {
        studioData.games = studioData.games || [];
        studioData.games.push(game);

        // Update confidence based on number of games
        studioData.confidence = this.calculateConfidence(
          cleanName,
          studioData.games,
        );
      }
    });
  }

  private extractPlatforms(appData: SteamAppDetails["data"]): string[] {
    const platforms: string[] = [];

    if (appData?.platforms?.windows) platforms.push("Windows");
    if (appData?.platforms?.mac) platforms.push("macOS");
    if (appData?.platforms?.linux) platforms.push("Linux");

    return platforms;
  }

  private cleanStudioName(name: string): string {
    return name
      .trim()
      .replace(/^(The\s+)/i, "")
      .replace(
        /\s+(Games?|Studios?|Entertainment|Interactive|Inc\.?|LLC\.?|Ltd\.?|Corporation|Corp\.?)$/i,
        "",
      )
      .replace(/[^\w\s&-]/g, "")
      .trim();
  }

  private generateStudioId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
  }

  private calculateConfidence(
    studioName: string,
    games: Array<{ name: string }>,
  ): number {
    let confidence = 0.5; // Base confidence for Steam data

    // Boost confidence based on number of games (more games = more likely to be real studio)
    const gameCount = games.length;
    if (gameCount >= 10) confidence += 0.3;
    else if (gameCount >= 5) confidence += 0.2;
    else if (gameCount >= 2) confidence += 0.1;

    // Penalize very generic names
    const genericNames = [
      "games",
      "studio",
      "entertainment",
      "interactive",
      "dev",
      "team",
    ];
    const nameWords = studioName.toLowerCase().split(/\s+/);
    if (nameWords.length === 1 && genericNames.includes(nameWords[0])) {
      confidence -= 0.3;
    }

    // Penalize single-character or very short names
    if (studioName.length < 3) {
      confidence -= 0.4;
    }

    // Boost confidence for well-known studio patterns
    if (/\b(games|studios?|entertainment|interactive)\b/i.test(studioName)) {
      confidence += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ISteamApps/GetAppList/v0002/`,
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  getSourceInfo() {
    return {
      id: "steam",
      name: "Steam API",
      description: "Gaming platform data from Steam",
      requiresApiKey: false, // Public API endpoints
      supportsRealTimeSync: false,
      estimatedStudioCount: "50,000+",
      dataQuality: "Medium", // Limited business info, good game data
    };
  }
}
