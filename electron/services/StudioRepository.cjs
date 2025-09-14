/**
 * Studio Repository - CommonJS version for Electron main process
 * Database operations for gaming studios
 * Uses SQLite for reliable, persistent storage
 * NOTE: This is a Node.js-only module and should not run in browsers
 */

// Guard against browser environment
if (typeof window !== 'undefined') {
  console.warn('StudioRepository is not supported in browser environments');
}

const { databaseManager } = require('./DatabaseManager.cjs');
const { logger } = require('../shared/utils/logger.cjs');

class StudioRepository {

  /**
   * Initialize repository (ensures database is ready)
   */
  async init() {
    await databaseManager.init();
  }

  /**
   * Create or update a studio
   */
  async upsert(studio) {
    const db = databaseManager.getDb();
    const now = new Date().toISOString();

    const dbStudio = {
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
      priority: studio.priority
    };

    // Check if studio exists
    const existing = db.prepare('SELECT id FROM studios WHERE id = ?').get(studio.id);

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE studios SET
          name = ?, description = ?, location = ?, size = ?, type = ?,
          founded = ?, games = ?, technologies = ?, website = ?,
          data_source = ?, confidence = ?, priority = ?, updated_at = ?
        WHERE id = ?
      `);

      updateStmt.run(
        dbStudio.name, dbStudio.description, dbStudio.location, dbStudio.size,
        dbStudio.type, dbStudio.founded, dbStudio.games, dbStudio.technologies,
        dbStudio.website, dbStudio.data_source, dbStudio.confidence,
        dbStudio.priority, now, studio.id
      );

      logger.debug(`Updated studio: ${studio.name}`);
    } else {
      // Insert new
      const insertStmt = db.prepare(`
        INSERT INTO studios (
          id, name, description, location, size, type, founded, games,
          technologies, website, data_source, confidence, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        dbStudio.id, dbStudio.name, dbStudio.description, dbStudio.location,
        dbStudio.size, dbStudio.type, dbStudio.founded, dbStudio.games,
        dbStudio.technologies, dbStudio.website, dbStudio.data_source,
        dbStudio.confidence, dbStudio.priority, now, now
      );

      logger.debug(`Created studio: ${studio.name}`);
    }

    // Return the created/updated studio
    return this.findById(studio.id);
  }

  /**
   * Bulk upsert studios (more efficient for large imports)
   */
  async bulkUpsert(studios) {
    const db = databaseManager.getDb();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO studios (
        id, name, description, location, size, type, founded, games,
        technologies, website, data_source, confidence, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((studios) => {
      let insertedCount = 0;

      for (const studio of studios) {
        try {
          insertStmt.run(
            studio.id, studio.name, studio.description, studio.location,
            studio.size, studio.type, studio.founded, JSON.stringify(studio.games),
            JSON.stringify(studio.technologies), studio.website,
            JSON.stringify(studio.dataSource), studio.confidence || 1.0,
            studio.priority, now, now
          );
          insertedCount++;
        } catch (error) {
          logger.warn(`Failed to upsert studio ${studio.name}:`, error);
        }
      }

      return insertedCount;
    });

    const result = transaction(studios);
    logger.info(`Bulk upserted ${result}/${studios.length} studios`);
    return result;
  }

  /**
   * Find studio by ID
   */
  async findById(id) {
    const db = databaseManager.getDb();
    const stmt = db.prepare('SELECT * FROM studios WHERE id = ?');
    const row = stmt.get(id);

    return row ? this.mapFromDb(row) : null;
  }

  /**
   * Search studios
   */
  async search(options = {}) {
    const db = databaseManager.getDb();
    let query = 'SELECT * FROM studios WHERE 1=1';
    const params = [];

    if (options.name) {
      query += ' AND name LIKE ?';
      params.push(`%${options.name}%`);
    }

    if (options.type) {
      query += ' AND type = ?';
      params.push(options.type);
    }

    if (options.size) {
      query += ' AND size = ?';
      params.push(options.size);
    }

    if (options.location) {
      query += ' AND location LIKE ?';
      params.push(`%${options.location}%`);
    }

    if (options.dataSource) {
      query += ' AND data_source LIKE ?';
      params.push(`%${options.dataSource}%`);
    }

    if (Array.isArray(options.technologies) && options.technologies.length) {
      for (const tech of options.technologies) {
        query += ' AND technologies LIKE ?';
        params.push(`%${tech}%`);
      }
    }

    query += ' ORDER BY priority DESC, name ASC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);

      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map(row => this.mapFromDb(row));
  }

  /**
   * Get all studios
   */
  async findAll() {
    return this.search();
  }

  /**
   * Get studio statistics
   */
  async getStats() {
    const db = databaseManager.getDb();

    const total = db.prepare('SELECT COUNT(*) as count FROM studios').get();

    const byType = db.prepare('SELECT type, COUNT(*) as count FROM studios GROUP BY type').all();
    const byLocation = db.prepare('SELECT location, COUNT(*) as count FROM studios GROUP BY location').all();

    // For data sources, we need to parse JSON
    const studios = await this.findAll();
    const bySource = {};

    for (const studio of studios) {
      for (const source of studio.dataSource) {
        bySource[source] = (bySource[source] || 0) + 1;
      }
    }

    const lastUpdated = db.prepare('SELECT MAX(updated_at) as last_updated FROM studios').get();

    return {
      total: total.count,
      byType: Object.fromEntries(byType.map(row => [row.type, row.count])),
      byLocation: Object.fromEntries(byLocation.map(row => [row.location, row.count])),
      bySource,
      lastUpdated: lastUpdated.last_updated || 'Never'
    };
  }

  /**
   * Delete studio by ID
   */
  async delete(id) {
    const db = databaseManager.getDb();
    const stmt = db.prepare('DELETE FROM studios WHERE id = ?');
    const result = stmt.run(id);

    const deleted = result.changes > 0;
    if (deleted) {
      logger.info(`Deleted studio: ${id}`);
    }

    return deleted;
  }

  /**
   * Delete all studios
   */
  async deleteAll() {
    const db = databaseManager.getDb();
    const stmt = db.prepare('DELETE FROM studios');
    const result = stmt.run();

    logger.info(`Deleted ${result.changes} studios`);
    return result.changes;
  }

  /**
   * Get studios by data source
   */
  async findByDataSource(source) {
    return this.search({ dataSource: source });
  }

  /**
   * Count studios
   */
  async count(options = {}) {
    const db = databaseManager.getDb();
    let query = 'SELECT COUNT(*) as count FROM studios WHERE 1=1';
    const params = [];

    if (options.name) {
      query += ' AND name LIKE ?';
      params.push(`%${options.name}%`);
    }

    if (options.type) {
      query += ' AND type = ?';
      params.push(options.type);
    }

    if (options.size) {
      query += ' AND size = ?';
      params.push(options.size);
    }

    if (options.location) {
      query += ' AND location LIKE ?';
      params.push(`%${options.location}%`);
    }

    if (options.dataSource) {
      query += ' AND data_source LIKE ?';
      params.push(`%${options.dataSource}%`);
    }

    if (Array.isArray(options.technologies) && options.technologies.length) {
      for (const tech of options.technologies) {
        query += ' AND technologies LIKE ?';
        params.push(`%${tech}%`);
      }
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);

    return result.count;
  }

  /**
   * Map database row to Studio object
   */
  mapFromDb(row) {
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
      updatedAt: new Date(row.updated_at)
    };
  }
}

const studioRepository = new StudioRepository();

module.exports = { studioRepository };
