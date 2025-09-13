
import { logger } from "@/shared/utils/logger";
import type { RawStudioData, IngestionJob } from "./DataIngestionService";

export interface IGDBCompany {
  id: number;
  name: string;
  description?: string;
  country?: number;
  logo?: {
    url: string;
  };
  websites?: Array<{
    category: number;
    url: string;
  }>;
  developed?: number[];
  published?: number[];
  created_at: number;
  updated_at: number;
}

export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  genres?: Array<{ id: number; name: string }>;
  platforms?: Array<{ id: number; name: string }>;
  first_release_date?: number;
  involved_companies?: Array<{
    company: IGDBCompany;
    developer: boolean;
    publisher: boolean;
  }>;
}

export class IGDBDataSource {
  private clientId: string;
  private accessToken: string;

  constructor() {
    // Get IGDB credentials from environment or config
    this.clientId = this.getConfig("IGDB_CLIENT_ID");
    this.accessToken = this.getConfig("IGDB_ACCESS_TOKEN");
  }

  private getConfig(key: string): string {
    // Check multiple sources for config
    if (typeof process !== "undefined" && process.env?.[key]) {
      return process.env[key];
    }

    if (typeof window !== "undefined") {
      const envVars = (window as any).__ENV__ || {};
      if (envVars[key]) {
        return envVars[key];
      }
    }

    // Check localStorage for development
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(`igdb_${key.toLowerCase()}`);
      if (stored) {
        return stored;
      }
    }

    logger.warn(`IGDB ${key} not configured, using mock data`);
    return "";
  }

  async fetchData(job: IngestionJob): Promise<RawStudioData[]> {
    try {
      if (!this.clientId || !this.accessToken) {
        logger.info("IGDB credentials not configured, using mock data");
        return this.getMockData();
      }

      logger.info(`Starting IGDB data fetch for job ${job.id}`);

      // Fetch companies (game studios) from IGDB
      const companies = await this.fetchCompanies();

      // Convert to our format
      const studioData = await Promise.all(
        companies.map((company) => this.convertCompanyToStudio(company)),
      );

      logger.info(`Fetched ${studioData.length} studios from IGDB`);
      return studioData.filter((studio) => studio !== null) as RawStudioData[];
    } catch (error) {
      logger.error("IGDB data fetch failed:", error);

      // Fallback to mock data
      logger.info("Falling back to mock IGDB data");
      return this.getMockData();
    }
  }

    const query = `
      fields id, name, description, country, logo.url, websites.category, websites.url, developed, published, created_at, updated_at;
      where developed != null | published != null;
      limit ${limit};
      sort created_at desc;
    `;

    const response = await this.makeIGDBRequest("companies", query);
    return response as IGDBCompany[];
  }

  private async fetchGamesForCompany(companyId: number): Promise<IGDBGame[]> {
    const query = `
      fields id, name, summary, genres.name, platforms.name, first_release_date, involved_companies.company, involved_companies.developer, involved_companies.publisher;
      where involved_companies.company = ${companyId};
      sort first_release_date desc;
    `;

    try {
      const response = await this.makeIGDBRequest("games", query);
      return response as IGDBGame[];
    } catch (error) {
      logger.warn(`Failed to fetch games for company ${companyId}:`, error);
      return [];
    }
  }

  private async makeIGDBRequest(endpoint: string, query: string): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Client-ID": this.clientId,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(
        `IGDB API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  private async convertCompanyToStudio(
    company: IGDBCompany,
  ): Promise<RawStudioData | null> {
    try {
      // Fetch games for this company to get more detailed information
      const games = await this.fetchGamesForCompany(company.id);

      // Extract website URL
      const primaryWebsite =

      // Convert games to our format
      const gameData = games.map((game) => ({
        name: game.name,
        releaseDate: game.first_release_date
          : undefined,
        platforms: game.platforms?.map((p) => p.name) || [],
        genres: game.genres?.map((g) => g.name) || [],
      }));

      const studio: RawStudioData = {
        sourceId: "igdb",
        sourceEntityId: company.id.toString(),
        name: company.name,
        description: company.description,
        websites: primaryWebsite ? [primaryWebsite] : [],
        games: gameData,
        location: this.getCountryName(company.country),
        logo: company.logo?.url,
        metadata: {
          igdbId: company.id,
          createdAt: company.created_at,
          updatedAt: company.updated_at,
        },
        lastUpdated: new Date(),
        confidence: this.calculateConfidence(company, games),
      };

      return studio;
    } catch (error) {
      logger.error(`Failed to convert company ${company.name}:`, error);
      return null;
    }
  }

  private getCountryName(countryCode?: number): string {
    // IGDB country codes mapping (simplified)
    const countries: Record<number, string> = {
      // Add more as needed
    };

    return countryCode ? countries[countryCode] || "Unknown" : "Unknown";
  }

  private calculateConfidence(company: IGDBCompany, games: IGDBGame[]): number {

    // Increase confidence based on available data

  }

  private getMockData(): RawStudioData[] {
    // Provide comprehensive mock data for development/testing
    return [
      {
        sourceId: "igdb",
        name: "Supercell",
        description:
          "Mobile game developer known for Clash of Clans, Clash Royale, and Hay Day",
        websites: ["https://supercell.com"],
        games: [
          {
            name: "Clash of Clans",
            platforms: ["iOS", "Android"],
            genres: ["Strategy", "Mobile"],
          },
          {
            name: "Clash Royale",
            platforms: ["iOS", "Android"],
            genres: ["Strategy", "Card Game", "Mobile"],
          },
          {
            name: "Hay Day",
            platforms: ["iOS", "Android"],
            genres: ["Simulation", "Mobile"],
          },
        ],
        location: "Helsinki, Finland",
        logo: "https://supercell.com/images/logo.png",
        metadata: {
        },
        lastUpdated: new Date(),
      },
      {
        sourceId: "igdb",
        name: "Mojang Studios",
        description:
          "Swedish video game developer best known for creating Minecraft",
        websites: ["https://mojang.com"],
        games: [
          {
            name: "Minecraft",
            platforms: ["PC", "Mobile", "Console", "Switch"],
            genres: ["Sandbox", "Survival", "Creative"],
          },
          {
            name: "Minecraft Dungeons",
            platforms: ["PC", "Console", "Switch"],
            genres: ["Action RPG", "Dungeon Crawler"],
          },
        ],
        location: "Stockholm, Sweden",
        logo: "https://mojang.com/images/logo.png",
        metadata: {
        },
        lastUpdated: new Date(),
      },
      {
        sourceId: "igdb",
        name: "Respawn Entertainment",
        description:
          "American video game developer founded by former Infinity Ward employees",
        websites: ["https://respawn.com"],
        games: [
          {
            name: "Titanfall",
            platforms: ["PC", "Xbox"],
            genres: ["FPS", "Mech", "Multiplayer"],
          },
          {
            platforms: ["PC", "Xbox", "PlayStation"],
            genres: ["FPS", "Mech", "Campaign"],
          },
          {
            name: "Apex Legends",
            platforms: ["PC", "Console", "Mobile"],
            genres: ["Battle Royale", "FPS", "Free-to-Play"],
          },
        ],
        location: "Los Angeles, California",
        logo: "https://respawn.com/images/logo.png",
        metadata: {
        },
        lastUpdated: new Date(),
      },
    ];
  }
}
