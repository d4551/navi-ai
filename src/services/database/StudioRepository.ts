/**
 * Studio Repository - Database operations for gaming studios
 * Uses SQLite for reliable, persistent storage
 * NOTE: This is a Node.js-only module and should not run in browsers
 */

// Guard against browser environment
if (typeof window !== 'undefined') {
  console.warn('StudioRepository is not supported in browser environments')
}

import { databaseManager, type DatabaseStudio } from './DatabaseManager'
import { logger } from '@/shared/utils/logger'

export interface Studio {
  id: string
  name: string
  description: string
  location: string
  size: string
  type: string
  founded: number
  games: string[]
  technologies: string[]
  website?: string
  dataSource: string[]
  confidence?: number
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface StudioSearchOptions {
  name?: string
  type?: string
  location?: string
  dataSource?: string
  limit?: number
  offset?: number
}

export interface StudioStats {
  total: number
  byType: Record<string, number>
  byLocation: Record<string, number>
  bySource: Record<string, number>
  lastUpdated: string
}

export class StudioRepository {
  /**
   * Initialize repository (ensures database is ready)
   */
  async init(): Promise<void> {
    await databaseManager.init()
  }

  /**
   * Create or update a studio
   */
  async upsert(
    studio: Omit<Studio, 'createdAt' | 'updatedAt'>
  ): Promise<Studio> {
    const db = databaseManager.getDb()
    const now = new Date().toISOString()

    const dbStudio: Omit<DatabaseStudio, 'created_at' | 'updated_at'> = {
      id: studio.id,
      name: studio.name,
      description: studio.description,
      location: studio.location,
      size: studio.size,
      type: studio.type,
      founded: studio.founded,
      games: JSON.stringify(studio.games),
      technologies: JSON.stringify(studio.technologies),
      website: studio.website,
      data_source: JSON.stringify(studio.dataSource),
      confidence: studio.confidence || 1.0,
      priority: studio.priority,
    }

    // Check if studio exists
    const existing = db
      .prepare('SELECT id FROM studios WHERE id = ?')
      .get(studio.id)

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE studios SET 
          name = ?, description = ?, location = ?, size = ?, type = ?, 
          founded = ?, games = ?, technologies = ?, website = ?, 
          data_source = ?, confidence = ?, priority = ?, updated_at = ?
        WHERE id = ?
      `)

      updateStmt.run(
        dbStudio.name,
        dbStudio.description,
        dbStudio.location,
        dbStudio.size,
        dbStudio.type,
        dbStudio.founded,
        dbStudio.games,
        dbStudio.technologies,
        dbStudio.website,
        dbStudio.data_source,
        dbStudio.confidence,
        dbStudio.priority,
        now,
        studio.id
      )

      logger.debug(`Updated studio: ${studio.name}`)
    } else {
      // Insert new
      const insertStmt = db.prepare(`
        INSERT INTO studios (
          id, name, description, location, size, type, founded, games, 
          technologies, website, data_source, confidence, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      insertStmt.run(
        dbStudio.id,
        dbStudio.name,
        dbStudio.description,
        dbStudio.location,
        dbStudio.size,
        dbStudio.type,
        dbStudio.founded,
        dbStudio.games,
        dbStudio.technologies,
        dbStudio.website,
        dbStudio.data_source,
        dbStudio.confidence,
        dbStudio.priority,
        now,
        now
      )

      logger.debug(`Created studio: ${studio.name}`)
    }

    // Return the created/updated studio
    return this.findById(studio.id)!
  }

  /**
   * Bulk upsert studios (more efficient for large imports)
   */
  async bulkUpsert(
    studios: Omit<Studio, 'createdAt' | 'updatedAt'>[]
  ): Promise<number> {
    const db = databaseManager.getDb()
    const now = new Date().toISOString()

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO studios (
        id, name, description, location, size, type, founded, games,
        technologies, website, data_source, confidence, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(
      (studios: Omit<Studio, 'createdAt' | 'updatedAt'>[]) => {
        let insertedCount = 0

        for (const studio of studios) {
          try {
            insertStmt.run(
              studio.id,
              studio.name,
              studio.description,
              studio.location,
              studio.size,
              studio.type,
              studio.founded,
              JSON.stringify(studio.games),
              JSON.stringify(studio.technologies),
              studio.website,
              JSON.stringify(studio.dataSource),
              studio.confidence || 1.0,
              studio.priority,
              now,
              now
            )
            insertedCount++
          } catch (error) {
            logger.warn(`Failed to upsert studio ${studio.name}:`, error)
          }
        }

        return insertedCount
      }
    )

    const result = transaction(studios)
    logger.info(`Bulk upserted ${result}/${studios.length} studios`)
    return result
  }

  /**
   * Find studio by ID
   */
  async findById(id: string): Promise<Studio | null> {
    const db = databaseManager.getDb()
    const stmt = db.prepare('SELECT * FROM studios WHERE id = ?')
    const row = stmt.get(id) as DatabaseStudio | undefined

    return row ? this.mapFromDb(row) : null
  }

  /**
   * Search studios
   */
  async search(options: StudioSearchOptions = {}): Promise<Studio[]> {
    const db = databaseManager.getDb()
    let query = 'SELECT * FROM studios WHERE 1=1'
    const params: any[] = []

    if (options.name) {
      query += ' AND name LIKE ?'
      params.push(`%${options.name}%`)
    }

    if (options.type) {
      query += ' AND type = ?'
      params.push(options.type)
    }

    if (options.location) {
      query += ' AND location LIKE ?'
      params.push(`%${options.location}%`)
    }

    if (options.dataSource) {
      query += ' AND data_source LIKE ?'
      params.push(`%${options.dataSource}%`)
    }

    query += ' ORDER BY priority DESC, name ASC'

    if (options.limit) {
      query += ' LIMIT ?'
      params.push(options.limit)

      if (options.offset) {
        query += ' OFFSET ?'
        params.push(options.offset)
      }
    }

    const stmt = db.prepare(query)
    const rows = stmt.all(...params) as DatabaseStudio[]

    return rows.map(row => this.mapFromDb(row))
  }

  /**
   * Get all studios
   */
  async findAll(): Promise<Studio[]> {
    return this.search()
  }

  /**
   * Get studio statistics
   */
  async getStats(): Promise<StudioStats> {
    const db = databaseManager.getDb()

    const total = db.prepare('SELECT COUNT(*) as count FROM studios').get() as {
      count: number
    }

    const byType = db
      .prepare('SELECT type, COUNT(*) as count FROM studios GROUP BY type')
      .all() as { type: string; count: number }[]
    const byLocation = db
      .prepare(
        'SELECT location, COUNT(*) as count FROM studios GROUP BY location'
      )
      .all() as { location: string; count: number }[]

    // For data sources, we need to parse JSON
    const studios = await this.findAll()
    const bySource: Record<string, number> = {}

    for (const studio of studios) {
      for (const source of studio.dataSource) {
        bySource[source] = (bySource[source] || 0) + 1
      }
    }

    const lastUpdated = db
      .prepare('SELECT MAX(updated_at) as last_updated FROM studios')
      .get() as { last_updated: string }

    return {
      total: total.count,
      byType: Object.fromEntries(byType.map(row => [row.type, row.count])),
      byLocation: Object.fromEntries(
        byLocation.map(row => [row.location, row.count])
      ),
      bySource,
      lastUpdated: lastUpdated.last_updated || 'Never',
    }
  }

  /**
   * Delete studio by ID
   */
  async delete(id: string): Promise<boolean> {
    const db = databaseManager.getDb()
    const stmt = db.prepare('DELETE FROM studios WHERE id = ?')
    const result = stmt.run(id)

    const deleted = result.changes > 0
    if (deleted) {
      logger.info(`Deleted studio: ${id}`)
    }

    return deleted
  }

  /**
   * Delete all studios
   */
  async deleteAll(): Promise<number> {
    const db = databaseManager.getDb()
    const stmt = db.prepare('DELETE FROM studios')
    const result = stmt.run()

    logger.info(`Deleted ${result.changes} studios`)
    return result.changes
  }

  /**
   * Get studios by data source
   */
  async findByDataSource(source: string): Promise<Studio[]> {
    return this.search({ dataSource: source })
  }

  /**
   * Count studios
   */
  async count(options: StudioSearchOptions = {}): Promise<number> {
    const db = databaseManager.getDb()
    let query = 'SELECT COUNT(*) as count FROM studios WHERE 1=1'
    const params: any[] = []

    if (options.name) {
      query += ' AND name LIKE ?'
      params.push(`%${options.name}%`)
    }

    if (options.type) {
      query += ' AND type = ?'
      params.push(options.type)
    }

    if (options.location) {
      query += ' AND location LIKE ?'
      params.push(`%${options.location}%`)
    }

    if (options.dataSource) {
      query += ' AND data_source LIKE ?'
      params.push(`%${options.dataSource}%`)
    }

    const stmt = db.prepare(query)
    const result = stmt.get(...params) as { count: number }

    return result.count
  }

  /**
   * Map database row to Studio object
   */
  private mapFromDb(row: DatabaseStudio): Studio {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      location: row.location,
      size: row.size,
      type: row.type,
      founded: row.founded,
      games: JSON.parse(row.games || '[]'),
      technologies: JSON.parse(row.technologies || '[]'),
      website: row.website,
      dataSource: JSON.parse(row.data_source || '[]'),
      confidence: row.confidence,
      priority: row.priority,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}

export const studioRepository = new StudioRepository()
