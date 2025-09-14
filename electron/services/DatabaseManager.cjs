/**
 * Database Manager - CommonJS version for Electron main process
 * SQLite database setup and management for NAVI
 */

// Guard against browser environment
if (typeof window !== 'undefined') {
  console.warn('DatabaseManager is not supported in browser environments');
}

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { logger } = require('../shared/utils/logger.cjs');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  async _ensureDbPath() {
    if (!this.dbPath) {
      this.dbPath = await this.resolveDbPath();
    }
    return this.dbPath;
  }

  _getMetaPath() {
    const dbPath = this.dbPath || path.join(process.env.NODE_ENV === 'test' ? './test-data' : './data', 'navi.db');
    const dir = path.dirname(dbPath);
    return path.join(dir, 'navi-backup-meta.json');
  }

  async getBackupInfo() {
    try {
      await this._ensureDbPath();
      const metaPath = this._getMetaPath();
      if (fs.existsSync(metaPath)) {
        const raw = fs.readFileSync(metaPath, 'utf8');
        const json = JSON.parse(raw || '{}');
        if (json && typeof json.lastBackup === 'string') {
          return { lastBackup: json.lastBackup, lastBackupPath: json.lastBackupPath };
        }
      }
    } catch (e) {
      logger.warn('Failed to read backup meta:', e);
    }
    return { lastBackup: 'Never' };
  }

  _writeBackupMeta(meta) {
    try {
      const metaPath = this._getMetaPath();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
    } catch (e) {
      logger.warn('Failed to write backup meta:', e);
    }
  }

  async resolveDbPath() {
    try {
      const { app } = require('electron');
      const userDataPath = app.getPath('userData');
      return path.join(userDataPath, 'navi.db');
    } catch (error) {
      // Fallback for non-Electron environments
      const base = process.env.NODE_ENV === 'test' ? './test-data' : './data';
      return path.join(base, 'navi.db');
    }
  }

  /**
   * Initialize the database connection and create tables
   */
  async init() {
    try {
      this.dbPath = await this.resolveDbPath();
      logger.info(`Initializing SQLite database at: ${this.dbPath}`);

      // Ensure directory exists
      const dir = path.dirname(this.dbPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created database directory: ${dir}`);
      }

      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      await this.createTables();
      await this.runMigrations();

      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    const createStudiosTable = `
      CREATE TABLE IF NOT EXISTS studios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        size TEXT,
        type TEXT,
        founded INTEGER,
        games TEXT DEFAULT '[]', -- JSON array
        technologies TEXT DEFAULT '[]', -- JSON array
        website TEXT,
        data_source TEXT DEFAULT '[]', -- JSON array
        confidence REAL DEFAULT 1.0,
        priority INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        description TEXT,
        requirements TEXT DEFAULT '[]', -- JSON array
        salary_range TEXT,
        remote BOOLEAN DEFAULT FALSE,
        type TEXT DEFAULT 'full-time',
        source TEXT NOT NULL,
        source_url TEXT,
        posted_at TEXT,
        scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT 'default-user',
        personal_info TEXT DEFAULT '{}', -- JSON object
        experience TEXT DEFAULT '[]', -- JSON array
        education TEXT DEFAULT '[]', -- JSON array
        skills TEXT DEFAULT '{}', -- JSON object
        gaming_experience TEXT DEFAULT '{}', -- JSON object
        career_goals TEXT DEFAULT '{}', -- JSON object
        portfolio TEXT DEFAULT '[]', -- JSON array
        ai_data TEXT DEFAULT '{}', -- JSON object
        settings TEXT DEFAULT '{}', -- JSON object
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_studios_name ON studios(name);
      CREATE INDEX IF NOT EXISTS idx_studios_type ON studios(type);
      CREATE INDEX IF NOT EXISTS idx_studios_location ON studios(location);
      CREATE INDEX IF NOT EXISTS idx_studios_data_source ON studios(data_source);
      CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
      CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
      CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
      CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
      CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
    `;

    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(createStudiosTable);
    this.db.exec(createJobsTable);
    this.db.exec(createUsersTable);
    this.db.exec(createIndexes);

    logger.info('Database tables created');
  }

  /**
   * Run database migrations
   */
  async runMigrations() {
    if (!this.db) throw new Error('Database not initialized');

    // Create migrations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check and run migrations
    const migrations = [
      {
        name: '001_initial_schema',
        sql: '' // Already handled in createTables
      },
      {
        name: '002_add_studio_confidence',
        sql: `
          ALTER TABLE studios ADD COLUMN confidence REAL DEFAULT 1.0;
          ALTER TABLE studios ADD COLUMN priority INTEGER DEFAULT 1;
        `
      }
    ];

    const executedMigrations = this.db.prepare(
      'SELECT name FROM migrations'
    ).all().map((row) => row.name);

    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.name)) {
        try {
          if (migration.sql.trim()) {
            this.db.exec(migration.sql);
          }
          this.db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
          logger.info(`Executed migration: ${migration.name}`);
        } catch (error) {
          // Some migrations might fail if columns already exist, that's ok
          logger.warn(`Migration ${migration.name} failed:`, error);
        }
      }
    }
  }

  /**
   * Get database connection
   */
  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.info('Database connection closed');
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.db) throw new Error('Database not initialized');

    const studioCount = this.db.prepare('SELECT COUNT(*) as count FROM studios').get();
    const jobCount = this.db.prepare('SELECT COUNT(*) as count FROM jobs').get();

    // Get database file size
    let dbSize = '0 MB';
    try {
      const stats = fs.statSync(this.dbPath);
      dbSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
    } catch (error) {
      logger.warn('Could not get database size:', error);
    }

    const lastStudioUpdate = this.db.prepare('SELECT MAX(updated_at) as last_updated FROM studios').get();

    return {
      studios: studioCount.count,
      jobs: jobCount.count,
      dbSize,
      lastUpdated: lastStudioUpdate.last_updated || 'Never'
    };
  }

  async backup(backupPath) {
    if (!this.db) throw new Error('Database not initialized');
    fs.copyFileSync(this.dbPath, backupPath);
    logger.info(`Database backed up to: ${backupPath}`);
    this._writeBackupMeta({ lastBackup: new Date().toISOString(), lastBackupPath: backupPath });
  }
}

const databaseManager = new DatabaseManager();

module.exports = { databaseManager };
