/**
 * Database Studio Service - CommonJS version for Electron main process
 * Combines existing data sources with proper database persistence
 * NOTE: This is a Node.js-only module and should not run in browsers
 */

// Guard against browser environment
if (typeof window !== 'undefined') {
  console.warn(
    'DatabaseStudioService is not supported in browser environments - operations will be no-ops'
  )
}

const { studioRepository } = require('./StudioRepository.cjs')
const { databaseManager } = require('./DatabaseManager.cjs')
const { logger } = require('../shared/utils/logger.cjs')
const GAMING_STUDIOS = require('../shared/constants/gaming-studios.cjs')
const TOP_100_GAMING_STUDIOS = require('../data/top-100-gaming-studios.cjs')
const EXPANDED_GAMING_STUDIOS = require('../shared/constants/expanded-gaming-data.cjs')

class DatabaseStudioService {
  /**
   * Initialize the service and database
   */
  async init() {
    await studioRepository.init()
    logger.info('DatabaseStudioService initialized')
  }

  /**
   * Import all studios from static sources + Steam integration
   */
  async importAllStudios(includeStream = false) {
    const startTime = Date.now()
    const result = {
      success: false,
      total: 0,
      imported: 0,
      updated: 0,
      errors: [],
      duration: 0,
    }

    try {
      logger.info('Starting database studio import...')

      const studiosToImport = []

      // 1. Import from GAMING_STUDIOS constants
      try {
        const gamingStudios = Object.values(GAMING_STUDIOS || {})
        logger.info(`Processing ${gamingStudios.length} gaming studios...`)

        for (const studio of gamingStudios) {
          try {
            const converted = this.convertToStudio(studio, 'gaming-studios')
            studiosToImport.push(converted)
          } catch (error) {
            result.errors.push(`Gaming studio ${studio.name}: ${error.message}`)
          }
        }
      } catch (error) {
        result.errors.push(`Failed to load gaming studios: ${error.message}`)
      }

      // 2. Import from TOP_100_GAMING_STUDIOS
      try {
        logger.info(
          `Processing ${TOP_100_GAMING_STUDIOS.length} top 100 studios...`
        )

        for (const studio of TOP_100_GAMING_STUDIOS || []) {
          try {
            const converted = this.convertToStudio(studio, 'top-100')
            studiosToImport.push(converted)
          } catch (error) {
            result.errors.push(
              `Top 100 studio ${studio.name}: ${error.message}`
            )
          }
        }
      } catch (error) {
        result.errors.push(`Failed to load top 100 studios: ${error.message}`)
      }

      // 3. Import from EXPANDED_GAMING_STUDIOS (comprehensive database)
      try {
        const expandedStudios = Object.values(EXPANDED_GAMING_STUDIOS || {})
        logger.info(
          `Processing ${expandedStudios.length} expanded gaming studios...`
        )

        for (const studio of expandedStudios) {
          try {
            const converted = this.convertExpandedStudio(
              studio,
              'expanded-gaming'
            )
            studiosToImport.push(converted)
          } catch (error) {
            result.errors.push(
              `Expanded studio ${studio.name}: ${error.message}`
            )
          }
        }
      } catch (error) {
        result.errors.push(
          `Failed to load expanded gaming studios: ${error.message}`
        )
      }

      // 4. Steam integration (enabled only if requested due to long processing time)
      if (includeStream) {
        try {
          const steamStudios = await this.fetchSteamStudios()
          studiosToImport.push(...steamStudios)
          logger.info(`Added ${steamStudios.length} studios from Steam API`)
        } catch (error) {
          result.errors.push(`Steam integration failed: ${error.message}`)
          logger.warn('Steam integration failed:', error)
        }
      }

      // 4. Bulk import to database
      if (studiosToImport.length > 0) {
        logger.info(
          `Bulk importing ${studiosToImport.length} studios to database...`
        )
        result.imported = await studioRepository.bulkUpsert(studiosToImport)
        result.total = studiosToImport.length
      }

      result.success = result.imported > 0
      result.duration = Date.now() - startTime

      logger.info(
        `Database studio import completed: ${result.imported}/${result.total} successful in ${result.duration}ms`
      )
      return result
    } catch (error) {
      logger.error('Database studio import failed:', error)
      result.errors.push(`System error: ${error.message}`)
      result.duration = Date.now() - startTime
      return result
    }
  }

  /**
   * Search studios with pagination
   */
  async searchStudios(query = {}) {
    const page = query.page || 1
    const pageSize = query.pageSize || 50
    const offset = (page - 1) * pageSize

    const [studios, total] = await Promise.all([
      studioRepository.search({ ...query, limit: pageSize, offset }),
      studioRepository.count(query),
    ])

    return {
      studios,
      total,
      page,
      pageSize,
    }
  }

  /**
   * Get studio by ID
   */
  async getStudio(id) {
    return studioRepository.findById(id)
  }

  /**
   * Get all studios
   */
  async getAllStudios() {
    return studioRepository.findAll()
  }

  /**
   * Get studio statistics
   */
  async getStatistics() {
    const [stats, dbStats, backupInfo] = await Promise.all([
      studioRepository.getStats(),
      studioRepository.init().then(() => studioRepository.getStats()),
      databaseManager.getBackupInfo().catch(() => ({ lastBackup: 'Never' })),
    ])

    return {
      ...stats,
      database: {
        path:
          process.env.NODE_ENV === 'test'
            ? './test-data/navi.db'
            : 'userData/navi.db',
        lastBackup: (backupInfo && backupInfo.lastBackup) || 'Never',
      },
    }
  }

  /**
   * Create or update a studio
   */
  async upsertStudio(studio) {
    return studioRepository.upsert(studio)
  }

  /**
   * Delete studio
   */
  async deleteStudio(id) {
    return studioRepository.delete(id)
  }

  /**
   * Clear all studios
   */
  async clearAll() {
    return studioRepository.deleteAll()
  }

  /**
   * Export studios to JSON
   */
  async exportStudios() {
    const studios = await studioRepository.findAll()

    return {
      studios,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        count: studios.length,
      },
    }
  }

  /**
   * Convert expanded gaming studio format to our Studio interface
   */
  convertExpandedStudio(studio, source) {
    if (!studio.name) {
      throw new Error('Studio name is required')
    }

    const id = studio.id || this.generateId(studio.name)
    const games = studio.majorGames?.map(game => game.name) || []

    return {
      id,
      name: studio.name,
      description: this.buildExpandedDescription(studio),
      location: studio.headquarters || studio.locations?.[0] || 'Unknown',
      size: this.mapStudioSize(studio.size, studio.employeeCount),
      type: this.mapStudioType(studio.type, studio.size),
      founded: studio.founded || new Date().getFullYear(),
      games: games.slice(0, 15), // Limit to 15 games
      technologies: studio.technologies?.slice(0, 20) || [], // Limit to 20 technologies
      website: studio.website,
      dataSource: [source],
      confidence: 1.0, // High confidence for curated data
      priority: this.calculateExpandedPriority(studio, source),
    }
  }

  /**
   * Convert any studio format to our Studio interface
   */
  convertToStudio(studio, source) {
    if (!studio.name) {
      throw new Error('Studio name is required')
    }

    const id = studio.id || this.generateId(studio.name)

    return {
      id,
      name: studio.name,
      description: studio.description || `Gaming studio from ${source}`,
      location: studio.location || studio.headquarters || 'Unknown',
      size: studio.size || 'Medium (11-50)',
      type: studio.type || 'Indie',
      founded: studio.founded || new Date().getFullYear(),
      games: Array.isArray(studio.games) ? studio.games.slice(0, 15) : [],
      technologies: Array.isArray(studio.technologies)
        ? studio.technologies
        : [],
      website: studio.website,
      dataSource: [source],
      confidence: studio.confidence || 1.0,
      priority: this.calculatePriority(source, studio),
    }
  }

  /**
   * Calculate studio priority based on source and data quality
   */
  calculatePriority(source, studio) {
    let priority = 1

    // Source-based priority
    if (source === 'gaming-studios')
      priority = 10 // Highest - manually curated
    else if (source === 'top-100')
      priority = 8 // High - comprehensive list
    else if (source === 'steam')
      priority = 6 // Medium - automated but verified
    else if (source === 'external') priority = 4 // Lower - third party

    // Boost priority based on data completeness
    if (studio.description && studio.description.length > 50) priority += 1
    if (studio.games && studio.games.length > 5) priority += 1
    if (studio.technologies && studio.technologies.length > 3) priority += 1
    if (studio.website) priority += 1

    return Math.min(priority, 15) // Cap at 15
  }

  /**
   * Build rich description from expanded studio data
   */
  buildExpandedDescription(studio) {
    const parts = []

    if (studio.type && studio.size) {
      parts.push(
        `${this.capitalizeFirst(studio.size)} ${studio.type} gaming company`
      )
    }

    if (studio.employeeCount) {
      parts.push(`with ${studio.employeeCount}+ employees`)
    }

    if (studio.majorGames?.length > 0) {
      const topGames = studio.majorGames
        .slice(0, 3)
        .map(g => g.name)
        .join(', ')
      parts.push(`Known for: ${topGames}`)
    }

    if (studio.workCulture?.length > 0) {
      parts.push(`Culture: ${studio.workCulture.slice(0, 2).join(', ')}`)
    }

    return parts.join(' • ') || `Gaming studio from expanded database`
  }

  /**
   * Map studio size from expanded format
   */
  mapStudioSize(size, employeeCount) {
    if (employeeCount) {
      if (employeeCount <= 10) return 'Small (1-10)'
      if (employeeCount <= 50) return 'Medium (11-50)'
      if (employeeCount <= 250) return 'Large (51-250)'
      if (employeeCount <= 1000) return 'Enterprise (251-1000)'
      return 'Enterprise (1000+)'
    }

    switch (size?.toLowerCase()) {
      case 'indie':
        return 'Small (1-10)'
      case 'small':
        return 'Medium (11-50)'
      case 'medium':
        return 'Large (51-250)'
      case 'large':
        return 'Enterprise (251-1000)'
      case 'aaa':
        return 'Enterprise (1000+)'
      default:
        return 'Medium (11-50)'
    }
  }

  /**
   * Map studio type from expanded format
   */
  mapStudioType(type, size) {
    if (size === 'aaa') return 'AAA'

    switch (type?.toLowerCase()) {
      case 'developer':
        return 'Developer'
      case 'publisher':
        return 'Publisher'
      case 'both':
        return 'Developer/Publisher'
      case 'platform':
        return 'Platform'
      case 'service':
        return 'Service Provider'
      default:
        return 'Indie'
    }
  }

  /**
   * Calculate priority for expanded studios
   */
  calculateExpandedPriority(studio, source) {
    let priority = 12 // High base priority for expanded data

    // Size-based priority
    if (studio.size === 'aaa') priority += 3
    else if (studio.size === 'large') priority += 2
    else if (studio.size === 'medium') priority += 1

    // Employee count boost
    if (studio.employeeCount > 1000) priority += 2
    else if (studio.employeeCount > 100) priority += 1

    // Game portfolio
    if (studio.majorGames?.length > 10) priority += 2
    else if (studio.majorGames?.length > 5) priority += 1

    // Company quality indicators
    if (studio.glassdoorRating > 4.0) priority += 1
    if (studio.workLifeBalance > 7) priority += 1
    if (studio.diversityPrograms?.length > 0) priority += 1

    return Math.min(priority, 20) // Cap at 20
  }

  /**
   * Capitalize first letter
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Generate clean ID from name
   */
  generateId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)
  }

  /**
   * Fetch studios from Steam API (if available)
   */
  async fetchSteamStudios() {
    try {
      const {
        SteamDataSource,
      } = require('../services/ingestion/SteamDataSource.cjs')
      const steamSource = new SteamDataSource()

      const canConnect = await steamSource.testConnection()
      if (!canConnect) {
        throw new Error('Steam API not available')
      }

      const mockJob = {
        id: 'database-steam-job',
        sourceId: 'steam',
        type: 'incremental',
        status: 'running',
        progress: 0,
        errors: [],
        metadata: { maxStudios: 500 }, // Request thousands of studios for scaling
      }

      const rawStudios = await steamSource.fetchData(mockJob)
      const studios = []

      for (const raw of rawStudios || []) {
        if (raw.name && raw.confidence > 0.15) {
          // Much lower threshold to get thousands of studios
          const studio = {
            id: this.generateId(raw.name),
            name: raw.name,
            description: raw.description || 'Gaming studio from Steam',
            location: raw.location || 'Unknown',
            size: 'Medium (11-50)',
            type: 'Indie',
            founded: new Date().getFullYear() - 3,
            games: raw.games?.map(g => g.name).slice(0, 8) || [],
            technologies: ['Unity', 'C#', 'Steam SDK'],
            website: raw.websites?.[0],
            dataSource: ['steam'],
            confidence: raw.confidence,
            priority: this.calculatePriority('steam', raw),
          }
          studios.push(studio)
        }
      }

      return studios
    } catch (error) {
      logger.warn('Steam fetch failed:', error)
      return []
    }
  }

  /**
   * Get database health info
   */
  async getHealthInfo() {
    try {
      const stats = await this.getStatistics()
      const studiosCount = stats.total

      return {
        status: studiosCount > 0 ? 'healthy' : 'warning',
        checks: {
          database: true,
          studios: studiosCount,
          lastImport: stats.lastUpdated,
        },
      }
    } catch (error) {
      logger.error('Health check failed:', error)
      return {
        status: 'error',
        checks: {
          database: false,
          studios: 0,
          lastImport: 'Never',
        },
      }
    }
  }
}

module.exports = { DatabaseStudioService }
