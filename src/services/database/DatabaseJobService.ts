
// Guard against browser environment
if (typeof window !== "undefined") {
  console.warn(
    "DatabaseJobService is not supported in browser environments - operations will be no-ops",
  );
}

import { jobRepository, type Job } from "./JobRepository";
import { logger } from "@/shared/utils/logger";
import { databaseManager } from "./DatabaseManager";

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  updated: number;
  errors: string[];
  duration: number;
}

export interface SearchResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export class DatabaseJobService {
  async init(): Promise<void> {
    await jobRepository.init();
    logger.info("DatabaseJobService initialized");
  }

  async importAllJobs(): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: false,
      errors: [],
    };

    try {
      logger.info("Starting database job import from real APIs...");

      // Import the real job API service
      const { searchJobsRefactored } = await import("../JobAPIService");
      const jobsToImport: Omit<Job, "createdAt" | "updatedAt">[] = [];

      // Fetch real jobs from different gaming-focused searches
      const searchQueries = [
        { query: "game developer", location: "San Francisco" },
        { query: "unity developer", location: "Los Angeles" },
        { query: "game designer", location: "Seattle" },
        { query: "technical artist", location: "Austin" },
        { query: "gameplay programmer", location: "Montreal" },
        { query: "game producer", location: "Vancouver" },
        { query: "QA tester", location: "Remote" },
        { query: "sound designer", location: "London" },
        { query: "DevOps engineer", location: "Berlin" },
        { query: "UI UX designer", location: "Tokyo" },
        // Gaming company specific searches
        { query: "Epic Games", companyFilter: "Epic Games" },
        { query: "Riot Games", companyFilter: "Riot Games" },
        { query: "Blizzard", companyFilter: "Blizzard Entertainment" },
        { query: "Ubisoft", companyFilter: "Ubisoft" },
        { query: "Valve", companyFilter: "Valve Corporation" },
        // General gaming industry searches
        { query: "gaming", remote: true },
        { query: "video game", remote: false },
        { query: "game engine", location: "California" },
        { query: "indie game", location: "New York" },
        { query: "AAA game", location: "Washington" },
      ];

      logger.info(
        `Fetching jobs from ${searchQueries.length} different search queries...`,
      );

      for (const searchQuery of searchQueries) {
        try {
          const jobSearchResult = await searchJobsRefactored({
            query: searchQuery.query,
            location: searchQuery.location,
            remote: searchQuery.remote,
            companyFilter: searchQuery.companyFilter,
          });

          logger.info(
            `Found ${jobSearchResult.jobs.length} jobs for query: ${searchQuery.query}`,
          );

          // Convert API jobs to our database format
          for (const apiJob of jobSearchResult.jobs) {
            try {
              const dbJob: Omit<Job, "createdAt" | "updatedAt"> = {
                id:
                  apiJob.id ||
                title: apiJob.title,
                company: apiJob.company,
                location: apiJob.location || "Not specified",
                description: apiJob.description || "No description available",
                requirements: Array.isArray(apiJob.requirements)
                  ? apiJob.requirements
                  : [],
                salary_range: apiJob.salary || apiJob.salary_range,
                remote: apiJob.remote || false,
                type: apiJob.type || "full-time",
                source: apiJob.source || "job-api",
                source_url: apiJob.url || apiJob.source_url,
                posted_at:
                  apiJob.posted_at ||
                  apiJob.datePosted ||
                  new Date().toISOString(),
                scraped_at: new Date().toISOString(),
              };

              jobsToImport.push(dbJob);
            } catch (conversionError) {
              result.errors.push(
                `Failed to convert job ${apiJob.title} at ${apiJob.company}: ${conversionError.message}`,
              );
            }
          }

          // Add small delay between API calls to be respectful
        } catch (searchError) {
          result.errors.push(
            `Search failed for query "${searchQuery.query}": ${searchError.message}`,
          );
          logger.warn(
            `Search failed for query "${searchQuery.query}":`,
            searchError,
          );
        }
      }

      logger.info(
        `Collected ${jobsToImport.length} real job postings from APIs`,
      );

      // Remove duplicates based on company + title + location
      const uniqueJobs = new Map<
        string,
        Omit<Job, "createdAt" | "updatedAt">
      >();
      for (const job of jobsToImport) {
        const key = `${job.company.toLowerCase()}-${job.title.toLowerCase()}-${job.location.toLowerCase()}`;
        if (!uniqueJobs.has(key)) {
          uniqueJobs.set(key, job);
        }
      }

      const finalJobs = Array.from(uniqueJobs.values());
      logger.info(
        `After deduplication: ${finalJobs.length} unique jobs to import`,
      );

        logger.info(
          `Bulk importing ${finalJobs.length} jobs to SQLite database...`,
        );
        result.imported = await jobRepository.bulkUpsert(finalJobs);
        result.total = finalJobs.length;
      }

      result.duration = Date.now() - startTime;

      logger.info(
        `Database job import completed: ${result.imported}/${result.total} successful in ${result.duration}ms`,
      );
      return result;
    } catch (_error) {
      logger.error("Database job import failed:", error);
      result.errors.push(`System error: ${error.message}`);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  async searchJobs(
    query: {
      title?: string;
      company?: string;
      location?: string;
      remote?: boolean;
      type?: string;
      source?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<SearchResult> {

    const [jobs, total] = await Promise.all([
      jobRepository.search({ ...query, limit: pageSize, offset }),
      jobRepository.count(query),
    ]);

    return {
      jobs,
      total,
      page,
      pageSize,
    };
  }

  async getJob(id: string): Promise<Job | null> {
    return jobRepository.findById(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return jobRepository.findAll();
  }

  async getStatistics() {
    const [stats, backupInfo] = await Promise.all([
      jobRepository.getStats(),
      databaseManager.getBackupInfo().catch(() => ({ lastBackup: "Never" })),
    ]);

    return {
      ...stats,
      database: {
        path:
          process.env.NODE_ENV === "test"
            ? "./test-data/navi.db"
            : "userData/navi.db",
        lastBackup: backupInfo?.lastBackup || "Never",
      },
    };
  }

  async upsertJob(job: Omit<Job, "createdAt" | "updatedAt">): Promise<Job> {
    return jobRepository.upsert(job);
  }

  async deleteJob(id: string): Promise<boolean> {
    return jobRepository.delete(id);
  }

  async clearAll(): Promise<number> {
    return jobRepository.deleteAll();
  }

  async exportJobs(): Promise<{
    jobs: Job[];
    metadata: {
      exportedAt: string;
      version: string;
      count: number;
    };
  }> {
    const jobs = await jobRepository.findAll();

    return {
      jobs,
      metadata: {
        exportedAt: new Date().toISOString(),
        count: jobs.length,
      },
    };
  }

  async getHealthInfo(): Promise<{
    status: "healthy" | "warning" | "error";
    checks: {
      database: boolean;
      jobs: number;
      lastImport: string;
    };
  }> {
    try {
      const stats = await this.getStatistics();
      const jobsCount = stats.total;

      return {
        checks: {
          database: true,
          jobs: jobsCount,
          lastImport: stats.lastUpdated,
        },
      };
    } catch (_error) {
      logger.error("Health check failed:", error);
      return {
        status: "error",
        checks: {
          database: false,
          lastImport: "Never",
        },
      };
    }
  }
}

export const databaseJobService = new DatabaseJobService();
