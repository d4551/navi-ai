/**
 * Database Manager - SQLite database setup and management for NAVI
 * Provides persistent, reliable storage for studios, jobs, and user data
 *
 * Implementation notes:
 * - Avoids static imports of Node-only modules so the web bundle doesn’t try to load them.
 * - Dynamically loads better-sqlite3 in Node/Electron and falls back to a browser stub otherwise.
 */
import { logger } from '@/shared/utils/logger'

export interface DatabaseStudio {
  id: string
  name: string
  description: string
  location: string
  size: string
  type: string
  founded: number
  games: string // JSON string
  technologies: string // JSON string
  website?: string
  data_source: string // JSON string
  confidence?: number
  priority: number
  created_at: string
  updated_at: string
}

export interface DatabaseJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string // JSON string
  salary_range?: string
  remote: boolean
  type: string // full-time, contract, etc.
  source: string
  source_url?: string
  posted_at: string
  scraped_at: string
  created_at: string
  updated_at: string
}

export interface DatabaseUser {
  id: string
  personal_info: string // JSON string
  experience: string // JSON string
  education: string // JSON string
  skills: string // JSON string
  gaming_experience: string // JSON string
  career_goals: string // JSON string
  portfolio: string // JSON string
  ai_data: string // JSON string
  settings: string // JSON string
  created_at: string
  updated_at: string
}

export class DatabaseManager {
  private db: any = null
  private dbPath: string | null = null
  private BetterSqlite: any | null = null

  constructor() {}

  private isElectron(): boolean {
    // Check if we're running in Electron environment
    return (
      typeof window !== 'undefined' &&
      window.process &&
      window.process.type === 'renderer'
    )
  }

  private async getDbPathEnsured(): Promise<string> {
    if (!this.dbPath) {
      this.dbPath = await this.resolveDbPath()
    }
    return this.dbPath
  }

  private async getMetaPath(): Promise<string> {
    if (!this.isElectron()) {
      throw new Error('getMetaPath() is only available in Electron environment')
    }
    const pathMod = await import('path')
    const dbPath = await this.getDbPathEnsured()
    const dir = pathMod.dirname(dbPath)
    return pathMod.join(dir, 'navi-backup-meta.json')
  }

  private async writeBackupMeta(meta: {
    lastBackup: string
    lastBackupPath?: string
  }): Promise<void> {
    if (!this.isElectron()) {
      logger.info('Skipping backup meta write in browser environment')
      return
    }
    try {
      const fs = await import('fs')
      const metaPath = await this.getMetaPath()
      await fs.promises.writeFile(
        metaPath,
        JSON.stringify(meta, null, 2),
        'utf8'
      )
    } catch (e) {
      logger.warn('Failed to write backup meta:', e)
    }
  }

  async getBackupInfo(): Promise<{
    lastBackup: string
    lastBackupPath?: string
  }> {
    try {
      const fs = await import('fs')
      const metaPath = await this.getMetaPath()
      if (fs.existsSync(metaPath)) {
        const raw = await fs.promises.readFile(metaPath, 'utf8')
        const json = JSON.parse(raw || '{}')
        if (json && typeof json.lastBackup === 'string') {
          return {
            lastBackup: json.lastBackup,
            lastBackupPath: json.lastBackupPath,
          }
        }
      }
    } catch (e) {
      logger.warn('Failed to read backup meta:', e)
    }
    return { lastBackup: 'Never' }
  }

  private async resolveDbPath(): Promise<string> {
    // Browser environment - use IndexedDB or fallback path
    if (typeof window !== 'undefined') {
      return 'navi-browser.db' // Simple filename for browser storage
    }

    try {
      const isElectron =
        typeof process !== 'undefined' && (process as any).versions?.electron
      if (isElectron) {
        const electron: any = await import(/* @vite-ignore */ 'electron')
        const electronApp = electron.app || electron.remote?.app
        const userDataPath = electronApp?.getPath
          ? electronApp.getPath('userData')
          : './data'
        const pathMod = await import('path')
        return (
          pathMod.default?.join(userDataPath, 'navi.db') ||
          pathMod.join(userDataPath, 'navi.db')
        )
      }
    } catch {
      // Fallthrough
    }

    // Node.js environment
    const base = process?.env?.NODE_ENV === 'test' ? './test-data' : './data'
    const pathMod = await import('path')
    return (
      pathMod.default?.join(base, 'navi.db') || pathMod.join(base, 'navi.db')
    )
  }

  private async loadDriver(): Promise<any> {
    if (this.BetterSqlite) return this.BetterSqlite
    try {
      if (typeof window === 'undefined') {
        const mod: any = await import(/* @vite-ignore */ 'better-sqlite3')
        this.BetterSqlite = mod.default ?? mod
      } else {
        const mod: any = await import('@/stubs/better-sqlite3.js')
        this.BetterSqlite = mod.default ?? mod
      }
    } catch {
      const mod: any = await import('@/stubs/better-sqlite3.js')
      this.BetterSqlite = mod.default ?? mod
    }
    return this.BetterSqlite
  }

  /**
   * Initialize the database connection and create tables
   */
  async init(): Promise<void> {
    try {
      this.dbPath = await this.resolveDbPath()
      logger.info(`Initializing SQLite database at: ${this.dbPath}`)

      // Ensure directory exists (only in Electron environment)
      if (this.isElectron()) {
        const fs = await import('fs')
        const pathMod = await import('path')
        const dir = pathMod.dirname(this.dbPath)

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
          logger.info(`Created database directory: ${dir}`)
        }
      } else {
        // In browser environment, we'll use a different approach or skip directory creation
        logger.info(
          `Browser environment detected, skipping directory creation for: ${this.dbPath}`
        )
      }

      const Driver = await this.loadDriver()
      this.db = new Driver(this.dbPath)
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('foreign_keys = ON')

      await this.createTables()
      await this.runMigrations()

      logger.info('Database initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize database:', error)
      throw error
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
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
    `

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
    `

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
    `

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
    `

    if (!this.db) throw new Error('Database not initialized')

    this.db.exec(createStudiosTable)
    this.db.exec(createJobsTable)
    this.db.exec(createUsersTable)
    this.db.exec(createIndexes)

    logger.info('Database tables created')
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    // Create migrations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Check and run migrations
    const migrations = [
      {
        name: '001_initial_schema',
        sql: '', // Already handled in createTables
      },
      {
        name: '002_add_studio_confidence',
        sql: `
          ALTER TABLE studios ADD COLUMN confidence REAL DEFAULT 1.0;
          ALTER TABLE studios ADD COLUMN priority INTEGER DEFAULT 1;
        `,
      },
    ]

    const executedMigrations = this.db
      .prepare('SELECT name FROM migrations')
      .all()
      .map((row: any) => row.name)

    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.name)) {
        try {
          if (migration.sql.trim()) {
            this.db.exec(migration.sql)
          }
          this.db
            .prepare('INSERT INTO migrations (name) VALUES (?)')
            .run(migration.name)
          logger.info(`Executed migration: ${migration.name}`)
        } catch (error) {
          // Some migrations might fail if columns already exist, that's ok
          logger.warn(`Migration ${migration.name} failed:`, error)
        }
      }
    }
  }

  /**
   * Get database connection
   */
  getDb(): any {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.')
    }
    return this.db
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      logger.info('Database connection closed')
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    studios: number
    jobs: number
    dbSize: string
    lastUpdated: string
  }> {
    if (!this.db) throw new Error('Database not initialized')

    const studioCount = this.db
      .prepare('SELECT COUNT(*) as count FROM studios')
      .get() as { count: number }
    const jobCount = this.db
      .prepare('SELECT COUNT(*) as count FROM jobs')
      .get() as { count: number }

    // Get database file size (only in Electron environment)
    let dbSize = '0 MB'
    if (this.isElectron()) {
      try {
        const fs = await import('fs')
        const stats = fs.statSync(this.dbPath as string)
        dbSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`
      } catch (error) {
        logger.warn('Could not get database size:', error)
      }
    } else {
      // In browser environment, we can't access file system statistics
      dbSize = 'N/A (Browser)'
    }

    const lastStudioUpdate = this.db
      .prepare('SELECT MAX(updated_at) as last_updated FROM studios')
      .get() as { last_updated: string }

    return {
      studios: studioCount.count,
      jobs: jobCount.count,
      dbSize,
      lastUpdated: lastStudioUpdate.last_updated || 'Never',
    }
  }

  /**
   * Backup database
   */
  async backup(backupPath: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    if (!this.isElectron()) {
      throw new Error(
        'Database backup is only available in Electron environment'
      )
    }

    const fs = await import('fs')
    await fs.promises.copyFile(this.dbPath as string, backupPath)
    logger.info(`Database backed up to: ${backupPath}`)

    // Persist last backup info for UI statistics
    await this.writeBackupMeta({
      lastBackup: new Date().toISOString(),
      lastBackupPath: backupPath,
    })
  }

  /**
   * Vacuum database (cleanup and optimize)
   */
  vacuum(): void {
    if (!this.db) throw new Error('Database not initialized')

    this.db.exec('VACUUM')
    logger.info('Database vacuumed')
  }
}

// Singleton instance
export const databaseManager = new DatabaseManager()
