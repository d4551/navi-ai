
// import { ref, reactive } from 'vue'
import { logger } from "@/shared/utils/logger";
import {
  cleanAndStructureStudioData,
  validateStudioData,
  enrichStudioData,
} from "./studioDataCleaner.js";

// Import status tracking
export const importStatus = {
  isImporting: false,
  currentOperation: "",
  lastUpdate: null,
  errors: [],
  importHistory: [],
};

// Data normalization schemas
const NORMALIZATION_SCHEMAS = {
  resume: {
    requiredFields: ["name", "email"],
    optionalFields: [
      "phone",
      "location",
      "summary",
      "experience",
      "education",
      "skills",
    ],
    transform: (_data) => ({
      ...data,
      id: data.id || generateId(),
      updatedAt: new Date().toISOString(),
      source: "import",
    }),
  },
  jobs: {
    requiredFields: ["title", "company"],
    optionalFields: [
      "location",
      "remote",
      "salary",
      "description",
      "requirements",
    ],
    transform: (_data) => ({
      ...data,
      id: data.id || generateId(),
      normalized: true,
      importedAt: new Date().toISOString(),
      matchScore: calculateJobMatchScore(_data),
    }),
  },
  portfolio: {
    requiredFields: ["name", "type"],
    optionalFields: ["description", "technologies", "images", "url", "github"],
    transform: (_data) => ({
      ...data,
      id: data.id || generateId(),
      featured: data.featured || false,
      createdAt: data.createdAt || new Date().toISOString(),
    }),
  },
  interviews: {
    requiredFields: ["date", "company"],
    optionalFields: ["position", "interviewer", "feedback", "outcome", "notes"],
    transform: (_data) => ({
      ...data,
      id: data.id || generateId(),
      status: data.status || "completed",
      analyzedAt: new Date().toISOString(),
    }),
  },
  studios: {
    requiredFields: ["name", "location"],
    optionalFields: [
      "companyInfo",
      "specializations",
      "technologies",
      "projects",
      "jobPostings",
      "contact",
      "socialMedia",
    ],
    transform: async (_data) => {
      // Use studio data cleaner for comprehensive processing
      const cleanedData = cleanAndStructureStudioData(_data);
      const enrichedData = await enrichStudioData(cleanedData);
      const validatedData = validateStudioData(enrichedData);

      return {
        ...validatedData,
        id: validatedData.id || generateId(),
        importedAt: new Date().toISOString(),
      };
    },
  },
};

  try {

    // Validate data type
    if (!NORMALIZATION_SCHEMAS[dataType]) {
      const supportedTypes = Object.keys(NORMALIZATION_SCHEMAS).join(", ");
      throw new Error(
        `Unsupported data type: '${dataType}'. Supported types: ${supportedTypes}`,
      );
    }

    // Get raw data
    let rawData;
    if (typeof source === "string") {
      // File path - use IPC to read file
      rawData = await window.electronAPI?.fs?.readFile(source);
      if (!rawData) {
        throw new Error(
          `Failed to read file '${source}' via IPC. Check file permissions and path.`,
        );
      }
    } else {
      // Direct data object
      rawData = source;
    }


    // Parse data if it's a string
    let parsedData = rawData;
    if (typeof rawData === "string") {
      try {
        parsedData = JSON.parse(rawData);
      } catch (_e) {
        // Try CSV parsing for job data
        if (dataType === "jobs") {
          parsedData = parseCSV(rawData);
        } else {
          throw new Error(
            `Invalid data format for file '${source}'. Supported formats: JSON, CSV. Detected format could not be parsed.`,
          );
        }
      }
    }


    // Normalize data
    const normalizedData = await normalizeData(dataType, parsedData, options);


    // Validate normalized data
    const validatedData = validateData(dataType, normalizedData);


    // Store data using IPC
    const result = await storeImportedData(dataType, validatedData, options);


    // Add to import history
    importStatus.importHistory.unshift({
      id: generateId(),
      dataType,
      timestamp: new Date().toISOString(),
      source: typeof source === "string" ? source : "direct",
      success: true,
    });

    return {
      success: true,
      data: result,
    };
  } catch (_error) {
    logger.error("Import error:", error, "BackgroundImportService");
    importStatus.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      dataType,
      source,
    });


    return {
      success: false,
      error: error.message,
    };
  } finally {
    setTimeout(() => {
      importStatus.isImporting = false;
      importStatus.currentOperation = "";
  }
}

export class BackgroundRefreshService {
  constructor() {
    this.refreshInterval = null;
    this.enabledSources = new Set(["jobs", "portfolio", "studios"]);
    this.isRefreshing = false;
  }

  start() {
    if (this.refreshInterval) return;

    // Starting background refresh service
    this.refreshInterval = setInterval(() => {
      this.performBackgroundRefresh();
    }, this.refreshFrequency);

    // Initial refresh
  }

  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      // Stopped background refresh service
    }
  }

  async performBackgroundRefresh() {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    // Performing background refresh

    try {
      // Refresh job listings
      if (this.enabledSources.has("jobs")) {
        await this.refreshJobListings();
      }

      // Refresh portfolio analytics
      if (this.enabledSources.has("portfolio")) {
        await this.refreshPortfolioAnalytics();
      }

      // Refresh studio data
      if (this.enabledSources.has("studios")) {
        await this.refreshStudioData();
      }

      // Update local cache
      await this.updateLocalCache();

      // Background refresh completed
    } catch (_error) {
      logger.error(
        "Background refresh failed:",
        error,
        "BackgroundRefreshService",
      );
    } finally {
      this.isRefreshing = false;
    }
  }

  async refreshJobListings() {
    try {
      // Get fresh job data from enabled sources
      const jobSources = ["arbeitnow", "remoteok", "jobicy"]; // Free APIs
      const freshJobs = [];

      for (const source of jobSources) {
        try {
          const jobs = await fetchJobsFromSource(source);
          freshJobs.push(...jobs);
        } catch (_error) {
          logger.warn(
            `Failed to refresh jobs from ${source}:`,
            error,
            "BackgroundRefreshService",
          );
        }
      }

        // Import fresh jobs
        await importData("jobs", freshJobs, {
          merge: true,
          source: "background-refresh",
        });

        // Job listings refreshed
      }
    } catch (_error) {
      logger.error("Job refresh error:", error, "BackgroundRefreshService");
    }
  }

  async refreshPortfolioAnalytics() {
    try {
      // Get portfolio projects and update analytics
      const portfolioData = await window.electronAPI?.portfolio?.getAll?.();

        const analyticsUpdates = await Promise.all(
          portfolioData.map(async (project) => ({
            ...project,
            lastAnalyzed: new Date().toISOString(),
            githubStars: project.github
              ? await fetchGithubStars(project.github)
              : null,
          })),
        );

        await importData("portfolio", analyticsUpdates, {
          merge: true,
          updateOnly: true,
        });

        // Analytics updated
      }
    } catch (_error) {
      logger.error(
        "Portfolio analytics refresh error:",
        error,
        "BackgroundRefreshService",
      );
    }
  }

  async refreshStudioData() {
    try {
      // Get existing studio data and refresh analytics
      const studioData = await window.electronAPI?.studios?.getAll?.();

        const refreshedStudios = [];

        for (const studio of studioData) {
          try {
            // Re-enrich with fresh data (social media metrics, job postings, etc.)
            const enrichedStudio = await enrichStudioData(studio);
            refreshedStudios.push(enrichedStudio);
          } catch (_error) {
            logger.warn(
              `Failed to refresh studio data for ${studio.name}:`,
              error,
              "BackgroundRefreshService",
            );
            refreshedStudios.push(studio); // Keep original if refresh fails
          }
        }

          await importData("studios", refreshedStudios, {
            merge: true,
            updateOnly: true,
          });

          // Studio data refreshed
        }
      }
    } catch (_error) {
      console.error("Studio data refresh error:", error);
    }
  }

  async updateLocalCache() {
    try {
      // Update application cache with fresh data
      const cacheData = {
        jobsCount: await getDataCount("jobs"),
        portfolioCount: await getDataCount("portfolio"),
        studiosCount: await getDataCount("studios"),
        lastRefresh: new Date().toISOString(),
      };

      localStorage.setItem("gemini-cv-cache", JSON.stringify(cacheData));
    } catch (_error) {
      console.error("Cache update error:", error);
    }
  }

  configure(options = {}) {
    if (options.frequency) {
      this.refreshFrequency = options.frequency;
      if (this.refreshInterval) {
        this.stop();
        this.start();
      }
    }

    if (options.enabledSources) {
      this.enabledSources = new Set(options.enabledSources);
    }
  }
}

// Create singleton instance
export const backgroundRefreshService = new BackgroundRefreshService();

  importStatus.isImporting = true;
  importStatus.currentOperation = operation;
  importStatus.progress = progress;
  importStatus.lastUpdate = new Date().toISOString();
}

  const schema = NORMALIZATION_SCHEMAS[dataType];

  // Handle async transformations (like studios)
  if (dataType === "studios") {
    if (Array.isArray(_data)) {
      const results = [];
      for (const item of data) {
        results.push(await schema.transform(item));
      }
      return results;
    } else {
      return await schema.transform(_data);
    }
  }

  // Standard synchronous transformations
  if (Array.isArray(_data)) {
    return data.map((item) => schema.transform(item));
  } else {
    return schema.transform(_data);
  }
}

  const schema = NORMALIZATION_SCHEMAS[dataType];

  const validate = (item) => {
    // Check required fields
    for (const field of schema.requiredFields) {
      if (!item[field]) {
        const itemDescription = item.id ? `item ${item.id}` : "item";
        throw new Error(
          `Missing required field '${field}' in ${itemDescription}. Required fields: ${schema.requiredFields.join(", ")}`,
        );
      }
    }
    return item;
  };

  if (Array.isArray(_data)) {
    return data.map(validate);
  } else {
    return validate(_data);
  }
}


  while (attempts < maxAttempts) {
    try {
      // Use IPC to store data
      const result = await window.electronAPI?.portfolio?.import?.(_data);

      if (!result?.success) {
        const errorDetails = result?.error || "Unknown error";
        throw new Error(
          `IPC storage failed: ${errorDetails}. Unable to save normalized data to persistent storage.`,
        );
      }

      logger.info(
      );
      return result.data;
    } catch (_error) {
      attempts++;

      if (attempts >= maxAttempts) {
        logger.warn(
          `IPC storage failed after ${maxAttempts} attempts, falling back to localStorage:`,
          error,
          "BackgroundImportService",
        );

        try {
          // Enhanced localStorage fallback with validation
          const storageKey = `gemini-cv-${dataType}`;
          const existingData = JSON.parse(
            localStorage.getItem(storageKey) || "[]",
          );

          // Validate existing data before merging
          if (!Array.isArray(existingData)) {
            logger.warn(
              "Existing localStorage data is not an array, resetting",
            );
            localStorage.setItem(storageKey, JSON.stringify([]));
          }

          let finalData;
          if (options.merge && Array.isArray(existingData)) {
            finalData = mergeData(
              existingData,
              Array.isArray(_data) ? data : [data],
            );
          } else {
            finalData = Array.isArray(_data) ? data : [data];
          }

          // Validate data size before storing
          const dataSize = JSON.stringify(finalData).length;
            throw new Error(
              `Data too large for localStorage: ${dataSize} bytes`,
            );
          }

          localStorage.setItem(storageKey, JSON.stringify(finalData));
          logger.info(
            `Stored ${finalData.length} ${dataType} items in localStorage as fallback`,
          );
          return finalData;
        } catch (storageError) {
          logger.error("localStorage fallback also failed:", storageError);
          throw new Error(
            `Both IPC and localStorage storage failed: ${error.message} / ${storageError.message}`,
          );
        }
      } else {
        // Wait before retry
        logger.info(
        );
      }
    }
  }
}

  if (!Array.isArray(existing) || !Array.isArray(incoming)) {
    logger.warn(
      "Invalid data types for merge operation, falling back to incoming data",
    );
    return Array.isArray(incoming) ? incoming : [incoming].filter(Boolean);
  }

  const merged = [...existing];

  for (const item of incoming) {
    if (!item || typeof item !== "object") {
      logger.warn("Skipping invalid item in merge:", item);
      continue;
    }

    // Try multiple matching strategies for better deduplication

    if (item.id) {
      existingIndex = merged.findIndex((_e) => e.id === item.id);
    }

      existingIndex = merged.findIndex((_e) => e.email === item.email);
    }

      existingIndex = merged.findIndex((_e) => e.name === item.name);
    }

      existingIndex = merged.findIndex((_e) => e.url === item.url);
    }

      // Update existing with merge strategy
      const existing = merged[existingIndex];
      merged[existingIndex] = {
        ...existing,
        ...item,
        // Preserve creation date but update modification time
        createdAt: existing.createdAt || item.createdAt,
        updatedAt: new Date().toISOString(),
        // Merge arrays if they exist
        ...(existing.tags && item.tags
          ? { tags: [...new Set([...existing.tags, ...item.tags])] }
          : {}),
        ...(existing.skills && item.skills
          ? { skills: [...new Set([...existing.skills, ...item.skills])] }
          : {}),
        ...(existing.specializations && item.specializations
          ? {
              specializations: [
                ...new Set([
                  ...existing.specializations,
                  ...item.specializations,
                ]),
              ],
            }
          : {}),
      };
    } else {
      // Add new item with timestamp
      merged.push({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Sort by updatedAt descending to show most recent first
  return merged.sort((a, b) => {
    return bTime - aTime;
  });
}

}

  // Simple scoring based on keywords
  const gamingKeywords = ["game", "gaming", "unity", "unreal", "gamedev"];
  const title = (job.title || "").toLowerCase();
  const description = (job.description || "").toLowerCase();

  gamingKeywords.forEach((keyword) => {
  });

}

  // Simplified job fetching - would integrate with actual job service
  return [];
}

  try {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      const [, owner, repo] = match;
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );
      const data = await response.json();
    }
  } catch (_error) {
    logger.warn(
      "Failed to fetch GitHub stars:",
      error,
      "BackgroundImportService",
    );
  }
  return null;
}

  try {
    const data = JSON.parse(
      localStorage.getItem(`gemini-cv-${dataType}`) || "[]",
    );
  } catch {
  }
}

  const lines = csvString.split("\n").filter((line) => line.trim());

  const data = [];

    const values = lines[i].split(",").map((v) => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    data.push(row);
  }

  return data;
}

export { updateImportStatus, normalizeData, validateData, generateId };
