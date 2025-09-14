#!/usr/bin/env tsx


import { studioDataManager } from "@/modules/studio/StudioDataManager";
import { logger } from "@/shared/utils/logger";

  try {
    console.log("[GAME] Starting studio import process...");

    // Force reimport to include new data
    const result = await studioDataManager.importAllStudios(true);

    console.log("[STATS] Import Results:");
    console.log(`[TARGET] Total Successful: ${result.summary.totalSuccessful}`);

      console.log("\n[WARNING]  Errors encountered:");
      result.errors.forEach((_error, index) => {
      });
    }

    // Get statistics
    const stats = await studioDataManager.getStudioStatistics();
    console.log("\n[STATS] Studio Database Statistics:");
    console.log(`Total Studios: ${stats.total}`);
    console.log("By Size:", stats.bySize);
    console.log("By Region:", stats.byRegion);
    console.log("By Category:", stats.byCategory);
  } catch (_error) {
  }
}

// Run the import
importStudios()
  .then(() => {
    console.log("[SUCCESS] Studio import completed!");
  })
  .catch((_error) => {
  });
