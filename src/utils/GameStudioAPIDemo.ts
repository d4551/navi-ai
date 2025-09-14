
import { StudioDataIntegrator } from "./StudioDataIntegrator";
import { EnhancedPublicAPIDataSource } from "../services/ingestion/EnhancedPublicAPIDataSource";
import { logger } from "../shared/utils/logger";

// Example demonstrating all the API queries you provided
export class GameStudioAPIDemo {
  private apiSource: EnhancedPublicAPIDataSource;
  private integrator?: StudioDataIntegrator;

  constructor(githubToken?: string, dbPath?: string) {
    this.apiSource = new EnhancedPublicAPIDataSource(githubToken);

    if (dbPath) {
      this.integrator = new StudioDataIntegrator(dbPath, githubToken);
    }
  }

  async demonstrateWikidataQueries() {
    console.log("\n[SEARCH] Demonstrating Wikidata SPARQL Queries...");

    // This uses the enhanced Wikidata queries internally
    const mockJob = {
      id: "demo-wikidata",
      sourceId: "wikidata",
      type: "full_sync" as const,
      status: "running" as const,
      errors: [],
    };

    try {
      const studios = await this.apiSource.fetchData(mockJob);
      const wikidataStudios = studios.filter((s) => s.sourceId === "wikidata");

      console.log(
      );

          name: sample.name,
          location: sample.location,
          metadata: {
            foundedDate: sample.metadata?.foundedDate,
            employeeCount: sample.metadata?.employeeCount,
          },
        });
      }
    } catch (_error) {
    }
  }

  async demonstrateGitHubQueries() {

    try {
      // Test GitHub connectivity
      const isConnected = await this.apiSource.testConnection();

      const mockJob = {
        id: "demo-github",
        sourceId: "github",
        type: "full_sync" as const,
        status: "running" as const,
        errors: [],
      };

      const studios = await this.apiSource.fetchData(mockJob);
      const githubStudios = studios.filter((s) => s.sourceId === "github");


          name: sample.name,
          repos: sample.metadata?.publicRepos,
          gameProjects: sample.metadata?.gameProjects,
          followers: sample.metadata?.followers,
        });
      }
    } catch (_error) {
    }
  }

  async demonstrateWikipediaQueries() {

    try {
      const mockJob = {
        id: "demo-wikipedia",
        sourceId: "wikipedia",
        type: "full_sync" as const,
        status: "running" as const,
        errors: [],
      };

      const studios = await this.apiSource.fetchData(mockJob);
      const wikipediaStudios = studios.filter(
        (s) => s.sourceId === "wikipedia",
      );

      console.log(
      );

          name: sample.name,
          hasDescription:
          hasThumbnail: !!sample.metadata?.thumbnail,
        });
      }
    } catch (_error) {
    }
  }

  async demonstrateDBpediaQueries() {

    try {
      const mockJob = {
        id: "demo-dbpedia",
        sourceId: "dbpedia",
        type: "full_sync" as const,
        status: "running" as const,
        errors: [],
      };

      const studios = await this.apiSource.fetchData(mockJob);
      const dbpediaStudios = studios.filter((s) => s.sourceId === "dbpedia");


          name: sample.name,
          foundedDate: sample.metadata?.foundedDate,
        });
      }
    } catch (_error) {
    }
  }

  async demonstrateDataAggregation() {

    try {
      const mockJob = {
        id: "demo-aggregation",
        sourceId: "enhanced-public-apis",
        type: "full_sync" as const,
        status: "running" as const,
        errors: [],
      };

      const studios = await this.apiSource.fetchData(mockJob);

      // Analyze the aggregated data
      const sourceBreakdown = studios.reduce(
        (acc, studio) => {
          const sources = studio.metadata?.sources || [studio.sourceId];
          sources.forEach((source: string) => {
          });
          return acc;
        },
        {} as Record<string, number>,
      );

      const multiSourceStudios = studios.filter(
      );


      console.log("\n   [STATS] Aggregation Results:");
      console.log(
      );
      console.log(
      );

      Object.entries(sourceBreakdown).forEach(([source, count]) => {
        console.log(`      ${source}: ${count}`);
      });

      // Show examples of data quality
        console.log("\n   [STAR] Sample multi-source studio:");
        console.log(`      Name: ${sample.name}`);
        console.log(`      Sources: ${sample.metadata?.sources?.join(", ")}`);
        console.log(`      Confidence: ${sample.confidence}`);
      }
    } catch (_error) {
    }
  }

  async demonstrateDatabaseIntegration() {
    if (!this.integrator) {
      console.log(
        "\n[WARNING]  Database integration skipped (no database path provided)",
      );
      return;
    }


    try {
      // Fetch and store a small batch

      console.log(`      New studios: ${result.new}`);
      console.log(`      Updated studios: ${result.updated}`);
      console.log(`      Total processed: ${result.total}`);

      // Show database statistics
      const stats = this.integrator.getStudioStats();
      console.log(`      Total in database: ${stats.total}`);
      console.log(`      Average confidence: ${stats.avgConfidence}`);
      console.log(`      High confidence count: ${stats.highConfidence}`);

      const searchResults = this.integrator.searchStudios("game");
      console.log(
        `\n   [SEARCH] Search for "game": ${searchResults.length} results`,
      );

      }
    } catch (_error) {
    } finally {
      this.integrator.close();
    }
  }


    // Show the source information
    const sourceInfo = this.apiSource.getSourceInfo();
    console.log(`      ID: ${sourceInfo.id}`);
    console.log(`      Name: ${sourceInfo.name}`);
    console.log(`      Estimated Count: ${sourceInfo.estimatedStudioCount}`);
    console.log(`      Data Quality: ${sourceInfo.dataQuality}`);

    console.log("\n   [STAR] Features:");
    sourceInfo.features?.forEach((feature) => {
      console.log(`      • ${feature}`);
    });

    sourceInfo.sources?.forEach((source) => {
      console.log(`      • ${source}`);
    });
  }

  async runFullDemo() {
    console.log("[GAME] Enhanced Gaming Studio API Demonstration");
    console.log("==========================================");

    try {
      await this.demonstrateWikidataQueries();
      await this.demonstrateGitHubQueries();
      await this.demonstrateWikipediaQueries();
      await this.demonstrateDBpediaQueries();
      await this.demonstrateDataAggregation();
      await this.demonstrateDatabaseIntegration();

      console.log("\n[SUCCESS] Demo completed successfully!");
    } catch (_error) {
      throw error;
    }
  }
}

// Run the demo if called directly
  githubToken?: string,
  dbPath?: string,
) {
  const demo = new GameStudioAPIDemo(githubToken, dbPath);
  return demo.runFullDemo();
}

// CLI interface
if (typeof globalThis !== "undefined" && (globalThis as any).process?.argv) {
  const githubToken = process.env.GITHUB_TOKEN;
  const dbPath = process.env.DB_PATH || "./data/navi.db";

  runEnhancedAPIDemo(githubToken, dbPath)
    .then(() => {
      logger.info("Enhanced API demo completed");
    })
    .catch((_error) => {
      logger.error("Enhanced API demo failed:", error);
    });
}

export default GameStudioAPIDemo;
