/**
 * Job Repository - Database operations for jobs using SQLite
 * Provides persistent storage for job data
 * NOTE: This is a Node.js-only module and should not run in browsers
 */

// Guard against browser environment
if (typeof window !== 'undefined') {
  console.warn(
    'JobRepository is not supported in browser environments - operations will be no-ops'
  )
}

import { databaseManager, type DatabaseJob } from './DatabaseManager'
import { logger } from '@/shared/utils/logger'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  salary_range?: string
  remote: boolean
  type: string
  source: string
  source_url?: string
  posted_at: string
  scraped_at: string
  createdAt: Date
  updatedAt: Date
}

export interface JobSearchOptions {
  title?: string
  company?: string
  location?: string
  remote?: boolean
  type?: string
  source?: string
  limit?: number
  offset?: number
}

export interface JobStats {
  total: number
  byType: Record<string, number>
  byLocation: Record<string, number>
  bySource: Record<string, number>
  byCompany: Record<string, number>
  lastUpdated: string
}

export class DatabaseJobRepository {
  /**
   * Initialize repository (ensures database is ready)
   */
  async init(): Promise<void> {
    await databaseManager.init()
  }

  /**
   * Create or update a job
   */
  async upsert(job: Omit<Job, 'createdAt' | 'updatedAt'>): Promise<Job> {
    const db = databaseManager.getDb()
    const now = new Date().toISOString()

    const dbJob: Omit<DatabaseJob, 'created_at' | 'updated_at'> = {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: JSON.stringify(job.requirements),
      salary_range: job.salary_range,
      remote: job.remote,
      type: job.type,
      source: job.source,
      source_url: job.source_url,
      posted_at: job.posted_at,
      scraped_at: job.scraped_at,
    }

    // Check if job exists
    const existing = db.prepare('SELECT id FROM jobs WHERE id = ?').get(job.id)

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE jobs SET 
          title = ?, company = ?, location = ?, description = ?, 
          requirements = ?, salary_range = ?, remote = ?, type = ?, 
          source = ?, source_url = ?, posted_at = ?, scraped_at = ?, updated_at = ?
        WHERE id = ?
      `)

      updateStmt.run(
        dbJob.title,
        dbJob.company,
        dbJob.location,
        dbJob.description,
        dbJob.requirements,
        dbJob.salary_range,
        dbJob.remote ? 1 : 0,
        dbJob.type,
        dbJob.source,
        dbJob.source_url,
        dbJob.posted_at,
        dbJob.scraped_at,
        now,
        job.id
      )

      logger.debug(`Updated job: ${job.title}`)
    } else {
      // Insert new
      const insertStmt = db.prepare(`
        INSERT INTO jobs (
          id, title, company, location, description, requirements, 
          salary_range, remote, type, source, source_url, posted_at, 
          scraped_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      insertStmt.run(
        dbJob.id,
        dbJob.title,
        dbJob.company,
        dbJob.location,
        dbJob.description,
        dbJob.requirements,
        dbJob.salary_range,
        dbJob.remote ? 1 : 0,
        dbJob.type,
        dbJob.source,
        dbJob.source_url,
        dbJob.posted_at,
        dbJob.scraped_at,
        now,
        now
      )

      logger.debug(`Created job: ${job.title}`)
    }

    // Return the created/updated job
    return this.findById(job.id)!
  }

  /**
   * Bulk upsert jobs (more efficient for large imports)
   */
  async bulkUpsert(
    jobs: Omit<Job, 'createdAt' | 'updatedAt'>[]
  ): Promise<number> {
    const db = databaseManager.getDb()
    const now = new Date().toISOString()

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO jobs (
        id, title, company, location, description, requirements, 
        salary_range, remote, type, source, source_url, posted_at, 
        scraped_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(
      (jobs: Omit<Job, 'createdAt' | 'updatedAt'>[]) => {
        let insertedCount = 0

        for (const job of jobs) {
          try {
            insertStmt.run(
              job.id,
              job.title,
              job.company,
              job.location,
              job.description,
              JSON.stringify(job.requirements),
              job.salary_range,
              job.remote ? 1 : 0,
              job.type,
              job.source,
              job.source_url,
              job.posted_at,
              job.scraped_at,
              now,
              now
            )
            insertedCount++
          } catch (error) {
            logger.warn(`Failed to upsert job ${job.title}:`, error)
          }
        }

        return insertedCount
      }
    )

    const result = transaction(jobs)
    logger.info(`Bulk upserted ${result}/${jobs.length} jobs`)
    return result
  }

  /**
   * Find job by ID
   */
  async findById(id: string): Promise<Job | null> {
    const db = databaseManager.getDb()
    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?')
    const row = stmt.get(id) as DatabaseJob | undefined

    return row ? this.mapFromDb(row) : null
  }

  /**
   * Search jobs
   */
  async search(options: JobSearchOptions = {}): Promise<Job[]> {
    const db = databaseManager.getDb()
    let query = 'SELECT * FROM jobs WHERE 1=1'
    const params: any[] = []

    if (options.title) {
      query += ' AND (title LIKE ? OR description LIKE ?)'
      params.push(`%${options.title}%`, `%${options.title}%`)
    }

    if (options.company) {
      query += ' AND company LIKE ?'
      params.push(`%${options.company}%`)
    }

    if (options.location) {
      query += ' AND location LIKE ?'
      params.push(`%${options.location}%`)
    }

    if (options.remote !== undefined) {
      query += ' AND remote = ?'
      params.push(options.remote ? 1 : 0)
    }

    if (options.type) {
      query += ' AND type = ?'
      params.push(options.type)
    }

    if (options.source) {
      query += ' AND source LIKE ?'
      params.push(`%${options.source}%`)
    }

    query += ' ORDER BY posted_at DESC, created_at DESC'

    if (options.limit) {
      query += ' LIMIT ?'
      params.push(options.limit)

      if (options.offset) {
        query += ' OFFSET ?'
        params.push(options.offset)
      }
    }

    const stmt = db.prepare(query)
    const rows = stmt.all(...params) as DatabaseJob[]

    return rows.map(row => this.mapFromDb(row))
  }

  /**
   * Get all jobs
   */
  async findAll(): Promise<Job[]> {
    return this.search()
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<JobStats> {
    const db = databaseManager.getDb()

    const total = db.prepare('SELECT COUNT(*) as count FROM jobs').get() as {
      count: number
    }

    const byType = db
      .prepare('SELECT type, COUNT(*) as count FROM jobs GROUP BY type')
      .all() as { type: string; count: number }[]
    const byLocation = db
      .prepare('SELECT location, COUNT(*) as count FROM jobs GROUP BY location')
      .all() as { location: string; count: number }[]
    const bySource = db
      .prepare('SELECT source, COUNT(*) as count FROM jobs GROUP BY source')
      .all() as { source: string; count: number }[]
    const byCompany = db
      .prepare(
        'SELECT company, COUNT(*) as count FROM jobs GROUP BY company ORDER BY count DESC LIMIT 20'
      )
      .all() as { company: string; count: number }[]

    const lastUpdated = db
      .prepare('SELECT MAX(updated_at) as last_updated FROM jobs')
      .get() as { last_updated: string }

    return {
      total: total.count,
      byType: Object.fromEntries(byType.map(row => [row.type, row.count])),
      byLocation: Object.fromEntries(
        byLocation.map(row => [row.location, row.count])
      ),
      bySource: Object.fromEntries(
        bySource.map(row => [row.source, row.count])
      ),
      byCompany: Object.fromEntries(
        byCompany.map(row => [row.company, row.count])
      ),
      lastUpdated: lastUpdated.last_updated || 'Never',
    }
  }

  /**
   * Delete job by ID
   */
  async delete(id: string): Promise<boolean> {
    const db = databaseManager.getDb()
    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?')
    const result = stmt.run(id)

    const deleted = result.changes > 0
    if (deleted) {
      logger.info(`Deleted job: ${id}`)
    }

    return deleted
  }

  /**
   * Delete all jobs
   */
  async deleteAll(): Promise<number> {
    const db = databaseManager.getDb()
    const stmt = db.prepare('DELETE FROM jobs')
    const result = stmt.run()

    logger.info(`Deleted ${result.changes} jobs`)
    return result.changes
  }

  /**
   * Get jobs by source
   */
  async findBySource(source: string): Promise<Job[]> {
    return this.search({ source })
  }

  /**
   * Count jobs
   */
  async count(options: JobSearchOptions = {}): Promise<number> {
    const db = databaseManager.getDb()
    let query = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1'
    const params: any[] = []

    if (options.title) {
      query += ' AND (title LIKE ? OR description LIKE ?)'
      params.push(`%${options.title}%`, `%${options.title}%`)
    }

    if (options.company) {
      query += ' AND company LIKE ?'
      params.push(`%${options.company}%`)
    }

    if (options.location) {
      query += ' AND location LIKE ?'
      params.push(`%${options.location}%`)
    }

    if (options.remote !== undefined) {
      query += ' AND remote = ?'
      params.push(options.remote ? 1 : 0)
    }

    if (options.type) {
      query += ' AND type = ?'
      params.push(options.type)
    }

    if (options.source) {
      query += ' AND source LIKE ?'
      params.push(`%${options.source}%`)
    }

    const stmt = db.prepare(query)
    const result = stmt.get(...params) as { count: number }

    return result.count
  }

  /**
   * Map database row to Job object
   */
  private mapFromDb(row: DatabaseJob): Job {
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      description: row.description,
      requirements: JSON.parse(row.requirements || '[]'),
      salary_range: row.salary_range,
      remote: row.remote === 1,
      type: row.type,
      source: row.source,
      source_url: row.source_url,
      posted_at: row.posted_at,
      scraped_at: row.scraped_at,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}

export const jobRepository = new JobRepository()
