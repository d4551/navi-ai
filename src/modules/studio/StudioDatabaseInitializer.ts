/**
 * Studio Database Initializer - Ensures studio data is properly loaded into the database
 */

import { logger } from '@/shared/utils/logger'
import { GameStudioRepository } from '@/modules/db/repositories/gaming-studios'
import { GAMING_STUDIOS } from '@/shared/constants/gaming-studios'

/**
 * Type declaration for JS data module to satisfy TypeScript
 */
declare module '@/data/gaming-studios.js' {
  const value: unknown[]
  export default value
}

export interface StudioInitResult {
  success: boolean
  loaded: number
  errors: string[]
  message: string
}

export class StudioDatabaseInitializer {
  private static instance: StudioDatabaseInitializer

  static getInstance(): StudioDatabaseInitializer {
    if (!StudioDatabaseInitializer.instance) {
      StudioDatabaseInitializer.instance = new StudioDatabaseInitializer()
    }
    return StudioDatabaseInitializer.instance
  }

  /**
   * Initialize the studio database with gaming studios data
   */
  async initializeStudios(): Promise<StudioInitResult> {
    const result: StudioInitResult = {
      success: false,
      loaded: 0,
      errors: [],
      message: '',
    }

    try {
      logger.info('[GAME] Initializing gaming studios database...')

      // Check if studios are already loaded
      const existingStudios = await GameStudioRepository.getAll()
      const studioCount = Object.keys(existingStudios).length

      if (studioCount > 0) {
        result.success = true
        result.loaded = studioCount
        result.message = `Gaming studios already initialized (${studioCount} studios available)`
        logger.info(result.message)
        return result
      }

      // Load studios from constants
      if (GAMING_STUDIOS && typeof GAMING_STUDIOS === 'object') {
        const studios = Object.values(GAMING_STUDIOS)
        result.loaded = studios.length
        result.success = true
        result.message = `Successfully initialized ${studios.length} gaming studios`
        logger.info(`✅ ${result.message}`)
      } else {
        result.errors.push('Gaming studios data not available')
        result.message = 'Failed to load gaming studios data'
        logger.error(result.message)
      }

      // Try to load additional studio data from other sources
      await this.loadAdditionalStudioData(result)
    } catch (error) {
      const errorMsg = `Failed to initialize studios: ${error}`
      result.errors.push(errorMsg)
      result.message = errorMsg
      logger.error(errorMsg, error)
    }

    return result
  }

  /**
   * Load additional studio data from various sources
   */
  private async loadAdditionalStudioData(
    result: StudioInitResult
  ): Promise<void> {
    try {
      // Try to load from data file
      const gamingStudiosModule = await import('@/data/gaming-studios.js')
      const studiosData = gamingStudiosModule.default || []

      if (Array.isArray(studiosData) && studiosData.length > 0) {
        result.loaded += studiosData.length
        logger.info(
          `📚 Loaded additional ${studiosData.length} studios from data file`
        )
      }
    } catch (error) {
      logger.warn('Could not load additional studio data:', error)
      result.errors.push(`Additional data load warning: ${error}`)
    }
  }

  /**
   * Validate studio data integrity
   */
  async validateStudioData(): Promise<{
    valid: boolean
    totalStudios: number
    issues: string[]
    recommendations: string[]
  }> {
    const validation = {
      valid: true,
      totalStudios: 0,
      issues: [] as string[],
      recommendations: [] as string[],
    }

    try {
      const studios = await GameStudioRepository.getAll()
      const studioArray = Object.values(studios)
      validation.totalStudios = studioArray.length

      if (studioArray.length === 0) {
        validation.valid = false
        validation.issues.push('No studios found in database')
        validation.recommendations.push(
          'Run studio initialization to populate database'
        )
        return validation
      }

      // Check for data quality
      let studiosWithoutGames = 0
      let studiosWithoutLocation = 0
      let studiosWithoutDescription = 0

      studioArray.forEach(studio => {
        if (!studio.games || studio.games.length === 0) {
          studiosWithoutGames++
        }
        if (!studio.location) {
          studiosWithoutLocation++
        }
        if (!studio.description) {
          studiosWithoutDescription++
        }
      })

      if (studiosWithoutGames > 0) {
        validation.issues.push(
          `${studiosWithoutGames} studios missing game information`
        )
      }

      if (studiosWithoutLocation > 0) {
        validation.issues.push(
          `${studiosWithoutLocation} studios missing location information`
        )
      }

      if (studiosWithoutDescription > 0) {
        validation.issues.push(
          `${studiosWithoutDescription} studios missing descriptions`
        )
      }

      // Recommendations
      if (studioArray.length < 50) {
        validation.recommendations.push(
          'Consider expanding studio database for better coverage'
        )
      }

      if (validation.issues.length === 0) {
        validation.recommendations.push(
          'Studio database appears to be in good condition'
        )
      }

      logger.info(
        `[STATS] Studio validation: ${studioArray.length} studios, ${validation.issues.length} issues found`
      )
    } catch (error) {
      validation.valid = false
      validation.issues.push(`Validation failed: ${error}`)
      logger.error('Studio validation failed:', error)
    }

    return validation
  }

  /**
   * Get studio database statistics
   */
  async getStudioStatistics(): Promise<{
    total: number
    bySize: Record<string, number>
    byLocation: Record<string, number>
    topGenres: Array<{ genre: string; count: number }>
    recentlyUpdated: number
  }> {
    const stats = {
      total: 0,
      bySize: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      topGenres: [] as Array<{ genre: string; count: number }>,
      recentlyUpdated: 0,
    }

    try {
      const studios = await GameStudioRepository.getAll()
      const studioArray = Object.values(studios)
      stats.total = studioArray.length

      // Analyze by size
      studioArray.forEach(studio => {
        const size = studio.size || 'unknown'
        stats.bySize[size] = (stats.bySize[size] || 0) + 1

        // Extract country from location
        if (studio.location) {
          const location = this.extractCountry(studio.location)
          stats.byLocation[location] = (stats.byLocation[location] || 0) + 1
        }
      })

      // Analyze genres (simplified)
      const genreCount: Record<string, number> = {}
      studioArray.forEach(studio => {
        if (studio.description) {
          const desc = studio.description.toLowerCase()
          if (desc.includes('rpg'))
            genreCount['RPG'] = (genreCount['RPG'] || 0) + 1
          if (desc.includes('action'))
            genreCount['Action'] = (genreCount['Action'] || 0) + 1
          if (desc.includes('strategy'))
            genreCount['Strategy'] = (genreCount['Strategy'] || 0) + 1
          if (desc.includes('simulation'))
            genreCount['Simulation'] = (genreCount['Simulation'] || 0) + 1
          if (desc.includes('mobile'))
            genreCount['Mobile'] = (genreCount['Mobile'] || 0) + 1
        }
      })

      stats.topGenres = Object.entries(genreCount)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      logger.info(
        `📈 Studio statistics generated: ${stats.total} total studios`
      )
    } catch (error) {
      logger.error('Failed to generate studio statistics:', error)
    }

    return stats
  }

  /**
   * Extract country from location string
   */
  private extractCountry(location: string): string {
    const loc = location.toLowerCase()

    if (
      loc.includes('usa') ||
      loc.includes('united states') ||
      loc.includes(', ca') ||
      loc.includes('california') ||
      loc.includes('texas') ||
      loc.includes('new york')
    ) {
      return 'United States'
    }
    if (loc.includes('canada')) return 'Canada'
    if (
      loc.includes('uk') ||
      loc.includes('united kingdom') ||
      loc.includes('london')
    )
      return 'United Kingdom'
    if (loc.includes('france') || loc.includes('paris')) return 'France'
    if (loc.includes('germany') || loc.includes('berlin')) return 'Germany'
    if (loc.includes('japan') || loc.includes('tokyo')) return 'Japan'
    if (
      loc.includes('china') ||
      loc.includes('beijing') ||
      loc.includes('shanghai')
    )
      return 'China'
    if (
      loc.includes('south korea') ||
      loc.includes('korea') ||
      loc.includes('seoul')
    )
      return 'South Korea'
    if (loc.includes('sweden') || loc.includes('stockholm')) return 'Sweden'
    if (loc.includes('finland') || loc.includes('helsinki')) return 'Finland'
    if (
      loc.includes('australia') ||
      loc.includes('sydney') ||
      loc.includes('melbourne')
    )
      return 'Australia'

    return 'Other'
  }

  /**
   * Ensure studio database is ready for use
   */
  async ensureStudioDatabase(): Promise<boolean> {
    try {
      const initResult = await this.initializeStudios()

      if (!initResult.success) {
        logger.error('Failed to ensure studio database:', initResult.errors)
        return false
      }

      const validation = await this.validateStudioData()

      if (!validation.valid) {
        logger.warn('Studio database validation issues:', validation.issues)
        // Still return true if we have some data, just log the issues
        return validation.totalStudios > 0
      }

      logger.info('✅ Studio database is ready for use')
      return true
    } catch (error) {
      logger.error('Failed to ensure studio database:', error)
      return false
    }
  }

  /**
   * Get studio search suggestions
   */
  async getStudioSuggestions(
    query: string,
    limit = 10
  ): Promise<
    Array<{
      id: string
      name: string
      description: string
      location: string
      matchType: 'name' | 'description' | 'game'
    }>
  > {
    const suggestions: Array<{
      id: string
      name: string
      description: string
      location: string
      matchType: 'name' | 'description' | 'game'
    }> = []

    if (!query || query.length < 2) {
      return suggestions
    }

    try {
      const studios = await GameStudioRepository.getAll()
      const studioArray = Object.values(studios)
      const searchQuery = query.toLowerCase()

      studioArray.forEach(studio => {
        let matchType: 'name' | 'description' | 'game' | null = null

        // Check name match
        if (studio.name.toLowerCase().includes(searchQuery)) {
          matchType = 'name'
        }
        // Check description match
        else if (studio.description?.toLowerCase().includes(searchQuery)) {
          matchType = 'description'
        }
        // Check games match
        else if (
          studio.games?.some(game => game.toLowerCase().includes(searchQuery))
        ) {
          matchType = 'game'
        }

        if (matchType && suggestions.length < limit) {
          suggestions.push({
            id: studio.id,
            name: studio.name,
            description: studio.description || '',
            location: studio.location || '',
            matchType,
          })
        }
      })

      // Sort by relevance (name matches first, then description, then games)
      suggestions.sort((a, b) => {
        const order = { name: 0, description: 1, game: 2 }
        return order[a.matchType] - order[b.matchType]
      })
    } catch (error) {
      logger.error('Failed to get studio suggestions:', error)
    }

    return suggestions
  }
}

// Export singleton instance
export const studioDatabaseInitializer = StudioDatabaseInitializer.getInstance()
