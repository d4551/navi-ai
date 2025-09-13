
// Node.js globals for demo execution
declare const require: any;
declare const module: any;

import { studioDataManager } from "@/modules/studio/StudioDataManager";
import { dataIngestionService } from "@/services/ingestion/DataIngestionService";
import { getDataSourceStats } from "@/config/data-sources";

  console.log("=== Steam Integration Demo ===\n");

  const stats = getDataSourceStats();
  console.log(`   Total sources: ${stats.total}`);
  console.log(`   Enabled sources: ${stats.enabled}`);
  console.log(`   Available sources: ${stats.available}`);
  console.log("   Source details:");
  stats.sources.forEach((source) => {
    const status = source.enabled
      ? source.available
        : "[WARNING] Needs API Key"
    console.log(
      `     - ${source.name} (Priority ${source.priority}): ${status}`,
    );
  });
  console.log();

  try {
    const { SteamDataSource } = await import(
      "@/services/ingestion/SteamDataSource"
    );
    const steamSource = new SteamDataSource();
    const canConnect = await steamSource.testConnection();
    console.log(
    );

    if (canConnect) {
      const sourceInfo = steamSource.getSourceInfo();
      console.log(`   Estimated studios: ${sourceInfo.estimatedStudioCount}`);
      console.log(`   Data quality: ${sourceInfo.dataQuality}`);
    }
  } catch (error) {
    console.log(`   Steam API test failed: ${error}`);
  }
  console.log();

  const currentStats = await studioDataManager.getStudioStatistics();
  console.log(`   Total studios: ${currentStats.total}`);
  console.log(`   Last import: ${currentStats.lastImport || "Never"}`);
  console.log(`   Size distribution:`);
  Object.entries(currentStats.bySize).forEach(([size, count]) => {
    console.log(`     - ${size}: ${count} studios`);
  });
  console.log();

  console.log("   Note: This will attempt to fetch real data from Steam API");

  try {
    const result = await studioDataManager.importAllStudios(true);
    console.log(
    );
    console.log(
      `   Studios processed: ${result.summary.totalSuccessful}/${result.summary.totalAttempted}`,
    );
    console.log(`   Imported: ${result.imported}, Updated: ${result.updated}`);

      console.log(`   Errors: ${result.errors.length}`);
        console.log(`     - ${error.studio}: ${error.error}`);
      });
    }
  } catch (error) {
    console.log(`   Import failed: ${error}`);
  }
  console.log();

  const updatedStats = await studioDataManager.getStudioStatistics();
  console.log(`   Total studios after import: ${updatedStats.total}`);
  console.log(
    `   Change: ${updatedStats.total > currentStats.total ? "+" : ""}${updatedStats.total - currentStats.total}`,
  );
  console.log();

  const jobs = dataIngestionService.getAllJobs();
    console.log("   No active jobs");
  } else {
    jobs.forEach((job) => {
      console.log(`     Source: ${job.sourceId}`);
      console.log(`     Status: ${job.status}`);
      console.log(`     Progress: ${job.progress}%`);
        console.log(`     Errors: ${job.errors.length}`);
      }
    });
  }
  console.log();

  const validation = await studioDataManager.validateDatabaseIntegrity();
    console.log(`   Duplicates found: ${validation.duplicates.length}`);
  }
    console.log(
      `   Studios with missing data: ${validation.missingData.length}`,
    );
  }
  console.log();

  console.log("=== Demo Complete ===");
}

if (require.main === module) {
  runSteamIntegrationDemo().catch(console.error);
}
