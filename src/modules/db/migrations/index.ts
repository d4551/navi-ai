// Database Migrations
// Schema migrations and data transformations

export interface Migration {
  id: string
  name: string
  version: number
  up: () => Promise<void>
  down?: () => Promise<void>
  description: string
}

import { unifiedStorage } from '@/utils/storage'

export class MigrationManager {
  private static instance: MigrationManager
  private migrations: Migration[] = []
  private currentVersion = 0
  private readonly STORAGE_KEY = 'db_migration_version'

  static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager()
    }
    return MigrationManager.instance
  }

  register(migration: Migration): void {
    this.migrations.push(migration)
    this.migrations.sort((a, b) => a.version - b.version)
  }

  async migrateToVersion(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion()

    if (targetVersion > currentVersion) {
      // Upgrade
      for (const migration of this.migrations) {
        if (migration.version > currentVersion && migration.version <= targetVersion) {
          // Running database migration
          console.info(`Running migration: ${migration.name}`)
          await migration.up()
          await this.setCurrentVersion(migration.version)
        }
      }
    } else if (targetVersion < currentVersion) {
      // Downgrade
      for (const migration of this.migrations.slice().reverse()) {
        if (migration.version <= currentVersion && migration.version > targetVersion) {
          if (migration.down) {
            // Rolling back database migration
            console.info(`Rolling back migration: ${migration.name}`)
            await migration.down()
            await this.setCurrentVersion(migration.version - 1)
          }
        }
      }
    }
  }

  async migrateToLatest(): Promise<void> {
    const latestVersion = Math.max(...this.migrations.map(m => m.version))
    await this.migrateToVersion(latestVersion)
  }

  private async getCurrentVersion(): Promise<number> {
    try {
      // Try persisted value first
      const stored = await (unifiedStorage as any).get?.(this.STORAGE_KEY)
      if (stored && typeof stored.version === 'number') {
        this.currentVersion = stored.version
        return stored.version
      }
    } catch {
      // noop — fall back to in-memory version
    }
    return this.currentVersion
  }

  private async setCurrentVersion(version: number): Promise<void> {
    this.currentVersion = version
    try {
      // Persist version for future runs
      await (unifiedStorage as any).set?.(this.STORAGE_KEY, {
        id: this.STORAGE_KEY,
        version,
        migratedAt: new Date().toISOString()
      })
    } catch {
      // noop — persistence optional
    }
  }
}

// Predefined migrations
export const migrations: Migration[] = [
  {
    id: '001-initial-schema',
    name: 'Initial Schema Setup',
    version: 1,
    description: 'Create initial database schema for users, resumes, and portfolios',
    up: async () => {
      // Migration logic would go here
      // Creating initial schema
    }
  },
  {
    id: '002-add-cover-letters',
    name: 'Add Cover Letters',
    version: 2,
    description: 'Add cover letter support to the database schema',
    up: async () => {
      // Adding cover letter schema
    },
    down: async () => {
      // Removing cover letter schema
    }
  },
  {
    id: '003-add-job-search',
    name: 'Add Job Search',
    version: 3,
    description: 'Add job search and application tracking',
    up: async () => {
      // Adding job search schema
    }
  },
  {
    id: '004-add-interviews',
    name: 'Add Interview Sessions',
    version: 4,
    description: 'Add interview session tracking and feedback',
    up: async () => {
      // Adding interview schema
    }
  },
  {
    id: '005-add-preferences',
    name: 'Add User Preferences',
    version: 5,
    description: 'Add user preferences and settings',
    up: async () => {
      // Adding preferences schema
    }
  }
]

// Import studio data migration
import { studioDataMigration } from './006-studio-data';
import { runEnhancedPortfolioMigration } from './enhancedPortfolio';

// Enhanced portfolio migration
const enhancedPortfolioMigration: Migration = {
  id: '007-enhanced-portfolio',
  name: 'Enhanced Portfolio System',
  version: 7,
  description: 'Upgrade portfolio system with templates, sharing, analytics, and AI features',
  up: async () => {
    await runEnhancedPortfolioMigration()
  }
}

// Register all migrations
const migrationManager = MigrationManager.getInstance()
migrations.forEach(migration => migrationManager.register(migration))
migrationManager.register(studioDataMigration)
migrationManager.register(enhancedPortfolioMigration)

export { migrationManager }
export default migrationManager
