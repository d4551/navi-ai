/**
 * Vue composable for gaming studio operations
 * Provides reactive interface to GameStudioService for UI components
 */

import { ref, readonly, computed } from 'vue'
import { gameStudioService } from '@/services/GameStudioService'
import { logger } from '@/shared/utils/logger'

export function useGameStudios() {
  const studios = ref([])
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const facets = ref(null)
  const favorites = ref([])
  const isInitialized = ref(false)

  const loadStudios = async (filters = {}, page = 1, limit = 20) => {
    try {
      loading.value = true
      error.value = null

      const result = await gameStudioService.getStudios(filters, page, limit)

      studios.value = result.studios
      total.value = result.total
      facets.value = result.facets

      logger.info(
        `Loaded ${result.studios.length} studios of ${result.total} total`
      )
    } catch (err) {
      error.value = err.message || 'Failed to load studios'
      logger.error('Failed to load studios:', err)
    } finally {
      loading.value = false
    }
  }

  const searchStudios = async (query, limit = 10) => {
    try {
      loading.value = true
      error.value = null

      const suggestions = await gameStudioService.getSuggestions(query, limit)
      studios.value = suggestions

      logger.info(
        `Found ${suggestions.length} studio suggestions for query: ${query}`
      )
    } catch (err) {
      error.value = err.message || 'Failed to search studios'
      logger.error('Failed to search studios:', err)
    } finally {
      loading.value = false
    }
  }

  const loadFavorites = async () => {
    try {
      favorites.value = await gameStudioService.getFavoriteStudios()
      logger.info(`Loaded ${favorites.value.length} favorite studios`)
    } catch (err) {
      logger.error('Failed to load favorite studios:', err)
    }
  }

  const toggleFavorite = async studioId => {
    try {
      const isNowFavorite = await gameStudioService.toggleFavorite(studioId)

      // Update local favorites cache
      if (isNowFavorite) {
        const studio = await gameStudioService.getStudioById(studioId)
        if (studio) {
          favorites.value.push(studio)
        }
      } else {
        const index = favorites.value.findIndex(fav => fav.id === studioId)
        if (index > -1) {
          favorites.value.splice(index, 1)
        }
      }

      return isNowFavorite
    } catch (err) {
      logger.error('Failed to toggle favorite:', err)
      throw err
    }
  }

  const isStudioFavorite = async studioId => {
    try {
      return await gameStudioService.isStudioFavorite(studioId)
    } catch (err) {
      logger.error('Failed to check favorite status:', err)
      return false
    }
  }

  const findStudioByCompany = async companyName => {
    try {
      loading.value = true
      error.value = null

      const studio = await gameStudioService.findByCompanyName(companyName)
      return studio
    } catch (err) {
      error.value = err.message || 'Failed to find studio'
      logger.error('Failed to find studio by company name:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const getStudiosByCategory = async category => {
    try {
      loading.value = true
      error.value = null

      const result = await gameStudioService.getStudiosByCategory(category)
      return result
    } catch (err) {
      error.value = err.message || 'Failed to load studios by category'
      logger.error('Failed to load studios by category:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const getPopularStudios = async (limit = 10) => {
    try {
      loading.value = true
      error.value = null

      const result = await gameStudioService.getPopularStudios(limit)
      return result
    } catch (err) {
      error.value = err.message || 'Failed to load popular studios'
      logger.error('Failed to load popular studios:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const advancedSearch = async criteria => {
    try {
      loading.value = true
      error.value = null

      const result = await gameStudioService.advancedSearch(criteria)

      studios.value = result.studios
      total.value = result.total
      facets.value = result.facets

      return result
    } catch (err) {
      error.value = err.message || 'Failed to perform advanced search'
      logger.error('Failed to perform advanced search:', err)
      return {
        studios: [],
        total: 0,
        filters: criteria?.filters || {},
        facets: {
          types: [],
          locations: [],
          sizes: [],
          technologies: [],
        },
      }
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const hasStudios = computed(() => studios.value.length > 0)
  const hasError = computed(() => error.value !== null)
  const hasFavorites = computed(() => favorites.value.length > 0)

  const getStudioById = studioId => {
    return studios.value.find(studio => studio.id === studioId) || null
  }

  const getStudiosByType = type => {
    return studios.value.filter(studio => studio.type === type)
  }

  const getStudiosByTechnology = technology => {
    return studios.value.filter(studio =>
      studio.technologies.some(tech =>
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    )
  }

  const getFilteredStudios = filterFn => {
    return computed(() => studios.value.filter(filterFn))
  }

  const clearError = () => {
    error.value = null
  }

  const clearData = () => {
    studios.value = []
    total.value = 0
    facets.value = null
    error.value = null
  }

  // Initialize with popular studios on first access
  const initialize = async () => {
    if (isInitialized.value) return

    try {
      await loadFavorites()
      await loadStudios({}, 1, 10) // Load first page of all studios as initial data
      isInitialized.value = true
    } catch (err) {
      logger.error('Failed to initialize game studios:', err)
    }
  }

  // Reactive studio statistics
  const studioStats = computed(() => {
    const stats = {
      total: studios.value.length,
      byType: {},
      bySize: {},
      byRegion: {},
      avgRating: 0,
      totalRating: 0,
      ratedStudios: 0,
    }

    studios.value.forEach(studio => {
      // Count by type
      stats.byType[studio.type] = (stats.byType[studio.type] || 0) + 1

      // Count by size
      stats.bySize[studio.size] = (stats.bySize[studio.size] || 0) + 1

      // Rating stats
      if (studio.rating) {
        stats.totalRating += studio.rating
        stats.ratedStudios++
      }
    })

    if (stats.ratedStudios > 0) {
      stats.avgRating = stats.totalRating / stats.ratedStudios
    }

    return stats
  })

  return {
    // Data
    studios: readonly(studios),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    facets: readonly(facets),
    favorites: readonly(favorites),

    // Computed
    hasStudios,
    hasError,
    hasFavorites,
    studioStats,

    // Methods
    initialize,
    loadStudios,
    searchStudios,
    loadFavorites,
    toggleFavorite,
    isStudioFavorite,
    findStudioByCompany,
    getStudiosByCategory,
    getPopularStudios,
    advancedSearch,
    getStudioById,
    getStudiosByType,
    getStudiosByTechnology,
    getFilteredStudios,
    clearError,
    clearData,
  }
}
