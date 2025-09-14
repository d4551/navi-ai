  private readonly dbpediaEndpoint = "https://dbpedia.org/sparql";ate readonly githubEndpoint = "https://api.github.com";
  private readonly dbpediaEndpoint = "https://dbpedia.org/sparql";s multiple public APIs for comprehensive studio data collection

import { logger } from "@/shared/utils/logger";
import type { RawStudioData, IngestionJob } from "./DataIngestionService";

export interface WikidataStudio {
  studio: { value: string };
  studioLabel: { value: string };
  foundedDate?: { value: string };
  countryLabel?: { value: string };
  website?: { value: string };
  description?: { value: string };
}

export interface GitHubOrg {
  login: string;
  id: number;
  url: string;
  type: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface WikipediaPage {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: {
    source: string;
  };
}

export interface DBpediaStudio {
  company: { value: string };
  name: { value: string };
  founded?: { value: string };
  location?: { value: string };
  website?: { value: string };
}

// OpenCorporates interface removed - API requires authentication

export class PublicAPIDataSource {
  private readonly wikidataEndpoint = "https://query.wikidata.org/sparql";
  private readonly githubEndpoint = "https://api.github.com";
  private readonly wikipediaEndpoint = "https://en.wikipedia.org/w/api.php";
  private readonly dbpediaEndpoint = "https://dbpedia.org/sparql";

  constructor() {
    logger.info("PublicAPIDataSource initialized");
  }

  async fetchData(job: IngestionJob): Promise<RawStudioData[]> {
    logger.info("Starting public API data ingestion");

    const allStudios = new Map<string, RawStudioData>();

    try {
      logger.info("Fetching game studios from Wikidata...");
      const wikidataStudios = await this.fetchFromWikidata(maxStudiosPerSource);
      this.mergeStudios(wikidataStudios, allStudios, "wikidata");

      logger.info("Fetching game studios from GitHub...");
      const githubStudios = await this.fetchFromGitHub(maxStudiosPerSource);
      this.mergeStudios(githubStudios, allStudios, "github");

      logger.info("Fetching game studios from Wikipedia...");
      const wikipediaStudios =
        await this.fetchFromWikipedia(maxStudiosPerSource);
      this.mergeStudios(wikipediaStudios, allStudios, "wikipedia");

      logger.info("Fetching game studios from DBpedia...");
      const dbpediaStudios = await this.fetchFromDBpedia(maxStudiosPerSource);
      this.mergeStudios(dbpediaStudios, allStudios, "dbpedia");

      logger.info(
        `Public API ingestion completed: ${allStudios.size} studios found`,
      );
      return Array.from(allStudios.values());
    } catch (_error) {
      logger.error("Public API data ingestion failed:", error);
      throw error;
    }
  }

  private async fetchFromWikidata(limit: number): Promise<RawStudioData[]> {
    try {
      const sparqlQuery = `
        SELECT ?studio ?studioLabel ?foundedDate ?countryLabel ?website ?description WHERE {
          OPTIONAL { ?studio schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        }
        LIMIT ${limit}
      `;

      const url = `${this.wikidataEndpoint}?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Wikidata API error: ${response.status}`);
      }

      const data = await response.json();
      const studios: RawStudioData[] = [];

      for (const binding of data.results?.bindings || []) {
        const studio: RawStudioData = {
          sourceId: "wikidata",
          sourceEntityId: binding.studio.value,
          name: binding.studioLabel.value,
          description:
            binding.description?.value ||
            `Game development studio from Wikidata`,
          location: binding.countryLabel?.value || "Unknown",
          websites: binding.website?.value ? [binding.website.value] : [],
          metadata: {
            wikidataUri: binding.studio.value,
            foundedDate: binding.foundedDate?.value,
          },
          lastUpdated: new Date(),
        };

          studios.push(studio);
        }
      }

      logger.info(`Fetched ${studios.length} studios from Wikidata`);
      return studios;
    } catch (_error) {
      logger.warn("Failed to fetch from Wikidata:", error);
      return [];
    }
  }

  private async fetchFromGitHub(limit: number): Promise<RawStudioData[]> {
    try {
      // Search for gaming organizations
      const queries = [
        "game+studio",
        "game+development",
        "gamedev",
        "indie+games",
      ];
      const studios: RawStudioData[] = [];

      for (const query of queries) {
        if (studios.length >= limit) break;

        const response = await fetch(url);

        if (!response.ok) {
            logger.warn("GitHub API rate limited, skipping");
            break;
          }
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        for (const org of data.items || []) {
          if (studios.length >= limit) break;

          try {
            // Get detailed organization info
            const orgResponse = await fetch(
              `${this.githubEndpoint}/orgs/${org.login}`,
            );

            if (orgResponse.ok) {
              const orgData: GitHubOrg = await orgResponse.json();

              const studio: RawStudioData = {
                sourceId: "github",
                sourceEntityId: orgData.login,
                name: orgData.name || orgData.login,
                description:
                  orgData.bio || `Game development organization on GitHub`,
                location: orgData.location || "Unknown",
                websites: orgData.blog ? [orgData.blog] : [],
                metadata: {
                  githubLogin: orgData.login,
                  githubUrl: orgData.url,
                  publicRepos: orgData.public_repos,
                  followers: orgData.followers,
                  createdAt: orgData.created_at,
                },
                lastUpdated: new Date(),
              };

              studios.push(studio);
            }

          } catch (_error) {
            logger.warn(`Failed to fetch GitHub org ${org.login}:`, error);
          }
        }

        // Delay between query types
      }

      logger.info(`Fetched ${studios.length} studios from GitHub`);
      return studios;
    } catch (_error) {
      logger.warn("Failed to fetch from GitHub:", error);
      return [];
    }
  }

  private async fetchFromWikipedia(limit: number): Promise<RawStudioData[]> {
    try {
      const searchQueries = [
        "game studio",
        "video game developer",
        "indie game developer",
      ];
      const studios: RawStudioData[] = [];

      for (const query of searchQueries) {
        if (studios.length >= limit) break;

        // Search for pages
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          throw new Error(
            `Wikipedia search API error: ${searchResponse.status}`,
          );
        }

        const searchData = await searchResponse.json();

        for (const page of searchData.query?.search || []) {
          if (studios.length >= limit) break;

          try {
            // Get page summary
            const summaryResponse = await fetch(summaryUrl);

            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json();

              // Filter for game-related pages
              if (
                summaryData.extract &&
                (summaryData.extract.toLowerCase().includes("game") ||
                  summaryData.extract.toLowerCase().includes("developer"))
              ) {
                const studio: RawStudioData = {
                  sourceId: "wikipedia",
                  sourceEntityId: summaryData.title,
                  name: summaryData.title,
                  description:
                    summaryData.extract ||
                    `Game development studio from Wikipedia`,
                  location: "Unknown",
                  websites: [],
                  metadata: {
                    wikipediaTitle: summaryData.title,
                    wikipediaPageId: summaryData.pageid,
                    thumbnail: summaryData.thumbnail?.source,
                  },
                  lastUpdated: new Date(),
                };

                studios.push(studio);
              }
            }

          } catch (_error) {
            logger.warn(`Failed to fetch Wikipedia page ${page.title}:`, error);
          }
        }

        // Delay between search queries
      }

      logger.info(`Fetched ${studios.length} studios from Wikipedia`);
      return studios;
    } catch (_error) {
      logger.warn("Failed to fetch from Wikipedia:", error);
      return [];
    }
  }

  private async fetchFromDBpedia(limit: number): Promise<RawStudioData[]> {
    try {
      const sparqlQuery = `
        SELECT ?company ?name ?founded ?location ?website WHERE {
          ?company a dbo:VideoGameDeveloper ;
                   rdfs:label ?name .
          OPTIONAL { ?company dbo:foundingDate ?founded }
          OPTIONAL { ?company dbo:location ?location }
          OPTIONAL { ?company foaf:homepage ?website }
          FILTER (lang(?name) = 'en')
        }
        LIMIT ${limit}
      `;

      const url = `${this.dbpediaEndpoint}?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`DBpedia API error: ${response.status}`);
      }

      const data = await response.json();
      const studios: RawStudioData[] = [];

      for (const binding of data.results?.bindings || []) {
        const studio: RawStudioData = {
          sourceId: "dbpedia",
          sourceEntityId: binding.company.value,
          name: binding.name.value,
          description: `Game development studio from DBpedia`,
          location: binding.location?.value || "Unknown",
          websites: binding.website?.value ? [binding.website.value] : [],
          metadata: {
            dbpediaUri: binding.company.value,
            foundedDate: binding.founded?.value,
          },
          lastUpdated: new Date(),
        };

          studios.push(studio);
        }
      }

      logger.info(`Fetched ${studios.length} studios from DBpedia`);
      return studios;
    } catch (_error) {
      logger.warn("Failed to fetch from DBpedia:", error);
      return [];
    }
  }

  private mergeStudios(
    newStudios: RawStudioData[],
    existingStudios: Map<string, RawStudioData>,
    sourceId: string,
  ) {
    for (const studio of newStudios) {
      const key = this.generateStudioKey(studio.name);
      const existing = existingStudios.get(key);

      if (existing) {
        // Merge data from multiple sources
        existing.websites = [
          ...new Set([
            ...(existing.websites || []),
            ...(studio.websites || []),
          ]),
        ];
        existing.metadata = { ...existing.metadata, ...studio.metadata };
        existing.confidence = Math.max(existing.confidence, studio.confidence);

        // Update description if the new one is more informative
        if (
          studio.description &&
        ) {
          existing.description = studio.description;
        }

        // Add source to the list
        if (!existing.metadata.sources) {
          existing.metadata.sources = [existing.sourceId];
        }
        if (!existing.metadata.sources.includes(sourceId)) {
          existing.metadata.sources.push(sourceId);
        }
      } else {
        studio.metadata = studio.metadata || {};
        studio.metadata.sources = [sourceId];
        existingStudios.set(key, studio);
      }
    }
  }

  private generateStudioKey(name: string): string {
    return name
      .toLowerCase()
      .replace(/^-+|-+$/g, "")
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test Wikidata endpoint
      const response = await fetch(
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  getSourceInfo() {
    return {
      id: "public-apis",
      name: "Public API Sources",
      description: "Multiple public APIs for comprehensive studio data",
      requiresApiKey: false,
      supportsRealTimeSync: false,
      dataQuality: "High",
      sources: [
        "Wikidata - Structured knowledge base",
        "GitHub - Development organizations",
        "Wikipedia - Encyclopedia articles",
        "DBpedia - Structured Wikipedia data",
      ],
    };
  }
}
