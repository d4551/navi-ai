/**
 * Canonical Studio Service - Single source of truth for gaming studio operations
 * Resolves field mismatches between legacy/normalized studio shapes and provides
 * a consistent search interface backed by our unified storage database.
 */

import { StudioRepository } from '@/modules/db/repositories/studios'
// Use interview GameStudio shape which matches our GAMING_STUDIOS constants and normalized storage
import type { GameStudio } from '@/shared/types/interview'
export type { GameStudio } from '@/shared/types/interview'
// Keep these enums loosely typed for filters (we allow category fallback as type)
export type StudioType =
  | 'AAA'
  | 'Indie'
  | 'Mobile'
  | 'VR/AR'
  | 'Platform'
  | 'Esports'
  | 'Unknown'
export type GameGenre =
  | 'Action'
  | 'RPG'
  | 'Strategy'
  | 'Puzzle'
  | 'Simulation'
  | 'Sports'
  | 'Racing'
  | 'Shooter'
  | 'Platformer'
  | 'Horror'
  | 'MMORPG'
  | 'MOBA'
  | 'Battle Royale'
  | 'Roguelike'
  | 'Sandbox'
export type Platform =
  | 'PC'
  | 'Console'
  | 'Mobile'
  | 'VR'
  | 'AR'
  | 'Web'
  | 'Switch'
  | 'PlayStation'
  | 'Xbox'
  | 'Steam'
import { logger } from '@/shared/utils/logger'

export interface StudioFilters {
  type?: StudioType
  location?: string
  size?: string
  technologies?: string[]
  remoteWork?: boolean
  hasGames?: boolean
  genres?: GameGenre[]
  platforms?: Platform[]
}

export interface StudioSearchResult {
  studios: GameStudio[]
  total: number
  filtered: number
  facets: {
    types: Record<string, number>
    locations: Record<string, number>
    sizes: Record<string, number>
    genres: Record<string, number>
  }
}

class CanonicalStudioService {
  private repository = StudioRepository
  private cache = new Map()
  private readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  async initialize(): Promise<void> {
    try {
      await this.repository.ensureInitialized()
      logger.info('[GAME] Studio Service initialized')
    } catch (error) {
      logger.error('Failed to initialize Studio Service:', error)
      throw error
    }
  }

  async searchStudios(
    filters: StudioFilters = {}
  ): Promise<StudioSearchResult> {
    const cacheKey = JSON.stringify(filters)
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const all = await this.repository.getAll()
      // Repository returns an array of normalized/legacy studio objects; ensure array copy
      let studios = [...all] as unknown as GameStudio[]

      // Apply filters
      if (filters.type) {
        const t = String(filters.type).toLowerCase()
        studios = studios.filter(studio => {
          const type = (studio as any).type
            ? String((studio as any).type).toLowerCase()
            : ''
          const category = (studio as any).category
            ? String((studio as any).category).toLowerCase()
            : ''
          return type === t || category === t
        })
      }

      if (filters.location) {
        const location = filters.location.toLowerCase()
        studios = studios.filter(studio => {
          const hq = (studio as any).headquarters
            ? String((studio as any).headquarters).toLowerCase()
            : ''
          const loc = (studio as any).location
            ? String((studio as any).location).toLowerCase()
            : ''
          return hq.includes(location) || loc.includes(location)
        })
      }

      if (filters.size) {
        studios = studios.filter(
          studio =>
            String((studio as any).size || '').toLowerCase() ===
            String(filters.size).toLowerCase()
        )
      }

      if (filters.remoteWork !== undefined) {
        studios = studios.filter(studio => {
          const rw = (studio as any).remoteWork
          const remoteFirst = (studio as any).culture?.remoteFirst
          return (
            (typeof rw === 'boolean' ? rw : undefined) === filters.remoteWork ||
            (typeof remoteFirst === 'boolean' ? remoteFirst : undefined) ===
              filters.remoteWork
          )
        })
      }

      if (filters.technologies?.length) {
        studios = studios.filter(studio =>
          filters.technologies!.some(tech =>
            (studio as any).technologies?.some((studioTech: string) =>
              String(studioTech)
                .toLowerCase()
                .includes(String(tech).toLowerCase())
            )
          )
        )
      }

      if (filters.genres?.length) {
        studios = studios.filter(studio => {
          const genres: string[] = (studio as any).gameGenres || []
          return filters.genres!.some(g => genres.includes(g as any))
        })
      }

      const result: StudioSearchResult = {
        studios,
        total: all.length,
        filtered: studios.length,
        facets: this.calculateFacets(studios),
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      })

      return result
    } catch (error) {
      logger.error('Studio search failed:', error)
      throw error
    }
  }

  async getStudioById(id: string): Promise<GameStudio | null> {
    return await this.repository.getById(id)
  }

  async findStudioByName(name: string): Promise<GameStudio | null> {
    return await this.repository.findByCompanyName(name)
  }

  async getFavoriteStudios(): Promise<GameStudio[]> {
    const favoriteIds = await this.repository.getFavorites()
    const studios = []

    for (const id of favoriteIds) {
      const studio = await this.repository.getById(id)
      if (studio) studios.push(studio)
    }

    return studios
  }

  async toggleFavorite(studioId: string): Promise<boolean> {
    const isFavorite = await this.repository.isFavorite(studioId)

    if (isFavorite) {
      await this.repository.removeFavorite(studioId)
      return false
    } else {
      await this.repository.addFavorite(studioId)
      return true
    }
  }

  async isFavorite(studioId: string): Promise<boolean> {
    return await this.repository.isFavorite(studioId)
  }

  async getSuggestions(query: string, limit = 10): Promise<GameStudio[]> {
    return await this.repository.getSuggestions(query, limit)
  }

  async getStudiosByCategory(category: string): Promise<GameStudio[]> {
    return await this.repository.getByCategory(category)
  }

  async getStudiosByRegion(region: string): Promise<GameStudio[]> {
    return await this.repository.getByRegion(region)
  }

  private calculateFacets(studios: GameStudio[]) {
    const facets = {
      types: {} as Record<string, number>,
      locations: {} as Record<string, number>,
      sizes: {} as Record<string, number>,
      genres: {} as Record<string, number>,
    }

    studios.forEach(studio => {
      const type = (studio as any).type || (studio as any).category
      if (type) {
        facets.types[type] = (facets.types[type] || 0) + 1
      }

      const loc = (studio as any).location || (studio as any).headquarters
      if (loc) {
        facets.locations[loc] = (facets.locations[loc] || 0) + 1
      }

      const size = (studio as any).size
      if (size) {
        facets.sizes[size] = (facets.sizes[size] || 0) + 1
      }

      ;((studio as any).gameGenres || []).forEach((genre: string) => {
        facets.genres[genre] = (facets.genres[genre] || 0) + 1
      })
    })

    return facets
  }

  clearCache(): void {
    this.cache.clear()
  }

  // --- Open knowledge ingestion (Wikidata/Wikipedia/DBpedia/GitHub) ---
  // Lightweight inbound type (avoid import dependency)
  async ingestOpenData(
    openStudios: Array<{
      name: string
      website?: string
      founded?: any
      country?: string
      headquarters?: string
      summary?: string
      employees?: any
      sources?: string[]
    }>
  ): Promise<{ created: number; updated: number; total: number }> {
    try {
      if (!Array.isArray(openStudios) || openStudios.length === 0) {
        return { created: 0, updated: 0, total: 0 }
      }

      // Load current studios once
      const current = await this.repository.getAll()
      const indexByKey = new Map<string, any>()
      for (const s of current) {
        indexByKey.set(this.normalizeName((s as any).name), s)
      }

      let created = 0
      let updated = 0

      for (const inbound of openStudios) {
        const key = this.normalizeName(inbound.name)
        if (!key) continue

        const existing = indexByKey.get(key)
        if (existing) {
          // Merge minimal enrichment (do not override non-empty fields)
          const updates: any = {}
          if (!existing.description && inbound.summary)
            updates.description = inbound.summary
          if (!existing.headquarters && inbound.headquarters)
            updates.headquarters = inbound.headquarters
          if (!existing.location && inbound.country)
            updates.location = inbound.country
          if (!existing.size && inbound.employees)
            updates.size = String(inbound.employees)
          if (
            (!existing.websites || (existing.websites as any).length === 0) &&
            inbound.website
          )
            updates.websites = [inbound.website]
          if (!existing.founded && inbound.founded)
            updates.founded = inbound.founded

          if (Object.keys(updates).length > 0) {
            try {
              await this.repository.update(existing.id, updates)
              updated++
            } catch (e) {
              logger.warn(
                'Studio update failed (ingest):',
                (existing as any).name,
                e
              )
            }
          }
        } else {
          // Create minimal studio record
          const record: any = {
            name: inbound.name,
            description: inbound.summary || '',
            location: inbound.country || inbound.headquarters || '',
            headquarters: inbound.headquarters || '',
            websites: inbound.website ? [inbound.website] : [],
            size: inbound.employees ? String(inbound.employees) : '',
            founded: inbound.founded || undefined,
            aliases: [],
            locations: [],
            reputation: {},
            hiringData: {},
            dataSource: Array.isArray(inbound.sources)
              ? inbound.sources
              : ['open-knowledge'],
          }
          try {
            await this.repository.create(record)
            created++
          } catch (e) {
            logger.warn('Studio create failed (ingest):', inbound.name, e)
          }
        }
      }

      // Clear service cache so new searches reflect updates
      this.clearCache()
      return { created, updated, total: openStudios.length }
    } catch (error) {
      logger.error('Ingest open data failed:', error)
      return { created: 0, updated: 0, total: 0 }
    }
  }

  private normalizeName(name: string): string {
    return String(name || '')
      .toLowerCase()
      .replace(
        /\s+(inc|llc|ltd|limited|corporation|corp|co|studio|studios|games|gaming|entertainment)\.?$/gi,
        ''
      )
      .replace(/[^\w\s]/g, '')
      .trim()
  }
}

// Export singleton instance
export const studioService = new CanonicalStudioService()
export default studioService
