/**
 * IGDB Data Source - Integration with Internet Game Database
 * Provides comprehensive gaming industry and studio data
 */

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
  private baseUrl = "https://api.igdb.com/v4";
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
        companies.map(company => this.convertCompanyToStudio(company))
      );

      logger.info(`Fetched ${studioData.length} studios from IGDB`);
      return studioData.filter(studio => studio !== null) as RawStudioData[];

    } catch (error) {
      logger.error("IGDB data fetch failed:", error);
      
      // Fallback to mock data
      logger.info("Falling back to mock IGDB data");
      return this.getMockData();
    }
  }

  private async fetchCompanies(limit = 100): Promise<IGDBCompany[]> {
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
      limit 50;
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
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async convertCompanyToStudio(company: IGDBCompany): Promise<RawStudioData | null> {
    try {
      // Fetch games for this company to get more detailed information
      const games = await this.fetchGamesForCompany(company.id);

      // Extract website URL
      const primaryWebsite = company.websites?.find(w => w.category === 1)?.url || // Official website
                            company.websites?.[0]?.url;

      // Convert games to our format
      const gameData = games.map(game => ({
        name: game.name,
        releaseDate: game.first_release_date ? 
          new Date(game.first_release_date * 1000).toISOString() : undefined,
        platforms: game.platforms?.map(p => p.name) || [],
        genres: game.genres?.map(g => g.name) || []
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
          developedGames: company.developed?.length || 0,
          publishedGames: company.published?.length || 0,
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
      1: "United States",
      2: "Canada", 
      3: "United Kingdom",
      4: "France",
      5: "Germany",
      6: "Japan",
      7: "Australia",
      8: "Sweden",
      9: "Finland",
      10: "Denmark",
      // Add more as needed
    };

    return countryCode ? countries[countryCode] || "Unknown" : "Unknown";
  }

  private calculateConfidence(company: IGDBCompany, games: IGDBGame[]): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on available data
    if (company.description) confidence += 0.1;
    if (company.logo?.url) confidence += 0.1;
    if (company.websites && company.websites.length > 0) confidence += 0.1;
    if (games.length > 0) confidence += 0.2;
    if (games.length > 5) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private getMockData(): RawStudioData[] {
    // Provide comprehensive mock data for development/testing
    return [
      {
        sourceId: "igdb",
        sourceEntityId: "mock-1",
        name: "Supercell",
        description: "Mobile game developer known for Clash of Clans, Clash Royale, and Hay Day",
        websites: ["https://supercell.com"],
        games: [
          {
            name: "Clash of Clans",
            releaseDate: "2012-08-02T00:00:00.000Z",
            platforms: ["iOS", "Android"],
            genres: ["Strategy", "Mobile"]
          },
          {
            name: "Clash Royale", 
            releaseDate: "2016-03-02T00:00:00.000Z",
            platforms: ["iOS", "Android"],
            genres: ["Strategy", "Card Game", "Mobile"]
          },
          {
            name: "Hay Day",
            releaseDate: "2012-06-21T00:00:00.000Z", 
            platforms: ["iOS", "Android"],
            genres: ["Simulation", "Mobile"]
          }
        ],
        location: "Helsinki, Finland",
        logo: "https://supercell.com/images/logo.png",
        metadata: {
          igdbId: 1,
          developedGames: 5,
          publishedGames: 5,
          createdAt: 1234567890,
          updatedAt: 1634567890
        },
        lastUpdated: new Date(),
        confidence: 0.9
      },
      {
        sourceId: "igdb",
        sourceEntityId: "mock-2", 
        name: "Mojang Studios",
        description: "Swedish video game developer best known for creating Minecraft",
        websites: ["https://mojang.com"],
        games: [
          {
            name: "Minecraft",
            releaseDate: "2011-11-18T00:00:00.000Z",
            platforms: ["PC", "Mobile", "Console", "Switch"],
            genres: ["Sandbox", "Survival", "Creative"]
          },
          {
            name: "Minecraft Dungeons",
            releaseDate: "2020-05-26T00:00:00.000Z",
            platforms: ["PC", "Console", "Switch"],
            genres: ["Action RPG", "Dungeon Crawler"]
          }
        ],
        location: "Stockholm, Sweden",
        logo: "https://mojang.com/images/logo.png",
        metadata: {
          igdbId: 2,
          developedGames: 3,
          publishedGames: 3,
          createdAt: 1234567890,
          updatedAt: 1634567890
        },
        lastUpdated: new Date(),
        confidence: 0.95
      },
      {
        sourceId: "igdb",
        sourceEntityId: "mock-3",
        name: "Respawn Entertainment", 
        description: "American video game developer founded by former Infinity Ward employees",
        websites: ["https://respawn.com"],
        games: [
          {
            name: "Titanfall",
            releaseDate: "2014-03-11T00:00:00.000Z",
            platforms: ["PC", "Xbox"],
            genres: ["FPS", "Mech", "Multiplayer"]
          },
          {
            name: "Titanfall 2",
            releaseDate: "2016-10-28T00:00:00.000Z", 
            platforms: ["PC", "Xbox", "PlayStation"],
            genres: ["FPS", "Mech", "Campaign"]
          },
          {
            name: "Apex Legends",
            releaseDate: "2019-02-04T00:00:00.000Z",
            platforms: ["PC", "Console", "Mobile"],
            genres: ["Battle Royale", "FPS", "Free-to-Play"]
          }
        ],
        location: "Los Angeles, California",
        logo: "https://respawn.com/images/logo.png",
        metadata: {
          igdbId: 3,
          developedGames: 4,
          publishedGames: 4,
          createdAt: 1234567890,
          updatedAt: 1634567890
        },
        lastUpdated: new Date(),
        confidence: 0.88
      }
    ];
  }
}