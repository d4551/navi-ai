/**
 * Database Job Service - Production job system with SQLite database
 * Handles job data persistence and retrieval from multiple sources
 * NOTE: This is a Node.js-only module and should not run in browsers
 */

// Guard against browser environment
if (typeof window !== 'undefined') {
  console.warn(
    'DatabaseJobService is not supported in browser environments - operations will be no-ops'
  )
}

import { jobRepository, type Job } from './JobRepository'
import { logger } from '@/shared/utils/logger'
import { databaseManager } from './DatabaseManager'

export interface ImportResult {
  success: boolean
  total: number
  imported: number
  updated: number
  errors: string[]
  duration: number
}

export interface SearchResult {
  jobs: Job[]
  total: number
  page: number
  pageSize: number
}

export class DatabaseJobService {
  /**
   * Initialize the service and database
   */
  async init(): Promise<void> {
    await jobRepository.init()
    logger.info('DatabaseJobService initialized')
  }

  /**
   * Import jobs from real job API sources
   */
  async importAllJobs(): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: false,
      total: 0,
      imported: 0,
      updated: 0,
      errors: [],
      duration: 0,
    }

    try {
      logger.info('Starting database job import from real APIs...')

      // Import the real job API service
      const { searchJobsRefactored } = await import('../JobAPIService')
      const jobsToImport: Omit<Job, 'createdAt' | 'updatedAt'>[] = []

      // Fetch real jobs from different gaming-focused searches
      const searchQueries = [
        { query: 'game developer', location: 'San Francisco' },
        { query: 'unity developer', location: 'Los Angeles' },
        { query: 'game designer', location: 'Seattle' },
        { query: 'technical artist', location: 'Austin' },
        { query: 'gameplay programmer', location: 'Montreal' },
        { query: 'game producer', location: 'Vancouver' },
        { query: 'QA tester', location: 'Remote' },
        { query: 'sound designer', location: 'London' },
        { query: 'DevOps engineer', location: 'Berlin' },
        { query: 'UI UX designer', location: 'Tokyo' },
        // Gaming company specific searches
        { query: 'Epic Games', companyFilter: 'Epic Games' },
        { query: 'Riot Games', companyFilter: 'Riot Games' },
        { query: 'Blizzard', companyFilter: 'Blizzard Entertainment' },
        { query: 'Ubisoft', companyFilter: 'Ubisoft' },
        { query: 'Valve', companyFilter: 'Valve Corporation' },
        // General gaming industry searches
        { query: 'gaming', remote: true },
        { query: 'video game', remote: false },
        { query: 'game engine', location: 'California' },
        { query: 'indie game', location: 'New York' },
        { query: 'AAA game', location: 'Washington' },
      ]

      logger.info(
        `Fetching jobs from ${searchQueries.length} different search queries...`
      )

      for (const searchQuery of searchQueries) {
        try {
          const jobSearchResult = await searchJobsRefactored({
            query: searchQuery.query,
            location: searchQuery.location,
            remote: searchQuery.remote,
            companyFilter: searchQuery.companyFilter,
            limit: 50, // Get up to 50 jobs per query for scaling
          })

          logger.info(
            `Found ${jobSearchResult.jobs.length} jobs for query: ${searchQuery.query}`
          )

          // Convert API jobs to our database format
          for (const apiJob of jobSearchResult.jobs) {
            try {
              const dbJob: Omit<Job, 'createdAt' | 'updatedAt'> = {
                id:
                  apiJob.id ||
                  `${apiJob.company.replace(/[^a-z0-9]/gi, '-')}-${apiJob.title.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`,
                title: apiJob.title,
                company: apiJob.company,
                location: apiJob.location || 'Not specified',
                description: apiJob.description || 'No description available',
                requirements: Array.isArray(apiJob.requirements)
                  ? apiJob.requirements
                  : [],
                salary_range: apiJob.salary || apiJob.salary_range,
                remote: apiJob.remote || false,
                type: apiJob.type || 'full-time',
                source: apiJob.source || 'job-api',
                source_url: apiJob.url || apiJob.source_url,
                posted_at:
                  apiJob.posted_at ||
                  apiJob.datePosted ||
                  new Date().toISOString(),
                scraped_at: new Date().toISOString(),
              }

              jobsToImport.push(dbJob)
            } catch (conversionError) {
              result.errors.push(
                `Failed to convert job ${apiJob.title} at ${apiJob.company}: ${conversionError.message}`
              )
            }
          }

          // Add small delay between API calls to be respectful
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (searchError) {
          result.errors.push(
            `Search failed for query "${searchQuery.query}": ${searchError.message}`
          )
          logger.warn(
            `Search failed for query "${searchQuery.query}":`,
            searchError
          )
        }
      }

      logger.info(
        `Collected ${jobsToImport.length} real job postings from APIs`
      )

      // Remove duplicates based on company + title + location
      const uniqueJobs = new Map<string, Omit<Job, 'createdAt' | 'updatedAt'>>()
      for (const job of jobsToImport) {
        const key = `${job.company.toLowerCase()}-${job.title.toLowerCase()}-${job.location.toLowerCase()}`
        if (!uniqueJobs.has(key)) {
          uniqueJobs.set(key, job)
        }
      }

      const finalJobs = Array.from(uniqueJobs.values())
      logger.info(
        `After deduplication: ${finalJobs.length} unique jobs to import`
      )

      if (finalJobs.length > 0) {
        logger.info(
          `Bulk importing ${finalJobs.length} jobs to SQLite database...`
        )
        result.imported = await jobRepository.bulkUpsert(finalJobs)
        result.total = finalJobs.length
      }

      result.success = result.imported > 0
      result.duration = Date.now() - startTime

      logger.info(
        `Database job import completed: ${result.imported}/${result.total} successful in ${result.duration}ms`
      )
      return result
    } catch (error) {
      logger.error('Database job import failed:', error)
      result.errors.push(`System error: ${error.message}`)
      result.duration = Date.now() - startTime
      return result
    }
  }

  /**
   * Search jobs with pagination
   */
  async searchJobs(
    query: {
      title?: string
      company?: string
      location?: string
      remote?: boolean
      type?: string
      source?: string
      page?: number
      pageSize?: number
    } = {}
  ): Promise<SearchResult> {
    const page = query.page || 1
    const pageSize = query.pageSize || 50
    const offset = (page - 1) * pageSize

    const [jobs, total] = await Promise.all([
      jobRepository.search({ ...query, limit: pageSize, offset }),
      jobRepository.count(query),
    ])

    return {
      jobs,
      total,
      page,
      pageSize,
    }
  }

  /**
   * Get job by ID
   */
  async getJob(id: string): Promise<Job | null> {
    return jobRepository.findById(id)
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    return jobRepository.findAll()
  }

  /**
   * Get job statistics
   */
  async getStatistics() {
    const [stats, backupInfo] = await Promise.all([
      jobRepository.getStats(),
      databaseManager.getBackupInfo().catch(() => ({ lastBackup: 'Never' })),
    ])

    return {
      ...stats,
      database: {
        path:
          process.env.NODE_ENV === 'test'
            ? './test-data/navi.db'
            : 'userData/navi.db',
        lastBackup: backupInfo?.lastBackup || 'Never',
      },
    }
  }

  /**
   * Create or update a job
   */
  async upsertJob(job: Omit<Job, 'createdAt' | 'updatedAt'>): Promise<Job> {
    return jobRepository.upsert(job)
  }

  /**
   * Delete job
   */
  async deleteJob(id: string): Promise<boolean> {
    return jobRepository.delete(id)
  }

  /**
   * Clear all jobs
   */
  async clearAll(): Promise<number> {
    return jobRepository.deleteAll()
  }

  /**
   * Export jobs to JSON
   */
  async exportJobs(): Promise<{
    jobs: Job[]
    metadata: {
      exportedAt: string
      version: string
      count: number
    }
  }> {
    const jobs = await jobRepository.findAll()

    return {
      jobs,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        count: jobs.length,
      },
    }
  }

  /**
   * Get database health info
   */
  async getHealthInfo(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    checks: {
      database: boolean
      jobs: number
      lastImport: string
    }
  }> {
    try {
      const stats = await this.getStatistics()
      const jobsCount = stats.total

      return {
        status: jobsCount > 0 ? 'healthy' : 'warning',
        checks: {
          database: true,
          jobs: jobsCount,
          lastImport: stats.lastUpdated,
        },
      }
    } catch (error) {
      logger.error('Health check failed:', error)
      return {
        status: 'error',
        checks: {
          database: false,
          jobs: 0,
          lastImport: 'Never',
        },
      }
    }
  }
}

export const databaseJobService = new DatabaseJobService()
