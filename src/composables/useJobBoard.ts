/**
 * Job Board Composable
 *
 * Provides reactive job board functionality with live API integration
 * Integrates with unified profile system for personalized job matching
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUnifiedProfile } from '@/composables/useUnifiedProfile'
import { canonicalJobService } from '@/services/jobs'
import type { Job, JobFilters } from '@/shared/types/jobs'
import { logger } from '@/shared/utils/logger'
import { unifiedStorage } from '@/utils/storage'

export interface JobBoardState {
  isLoading: boolean
  isSearching: boolean
  error: string | null
  lastUpdated: Date | null
  totalJobs: number
  sources: string[]
}

export interface JobSearchFilters extends JobFilters {
  gamingOnly?: boolean
  savedJobsOnly?: boolean
  matchingScore?: number
  datePosted?: 'today' | 'week' | 'month' | 'all'
}

export function useJobBoard() {
  // State
  const state = ref<JobBoardState>({
    isLoading: false,
    isSearching: false,
    error: null,
    lastUpdated: null,
    totalJobs: 0,
    sources: [],
  })

  const jobs = ref<Job[]>([])
  const filteredJobs = ref<Job[]>([])
  const savedJobs = ref<Job[]>([])
  const currentFilters = ref<JobSearchFilters>({})

  // Services
  const unifiedProfile = useUnifiedProfile()
  const refactoredJobService = canonicalJobService

  // Profile-based suggestions
  const profileSuggestions = computed(() => {
    const profile = unifiedProfile.jobSearchProfile.value
    if (!profile) return []

    const suggestions = []

    // Add preferred roles
    if (profile.preferredRoles?.length) {
      suggestions.push(...profile.preferredRoles.slice(0, 3))
    }

    // Add skill-based searches
    if (profile.skills?.technical?.length) {
      const topSkills = profile.skills.technical.slice(0, 2)
      suggestions.push(`${topSkills.join(' ')} developer`)
    }

    // Add gaming-specific suggestions
    if (profile.skills?.gaming?.length) {
      suggestions.push(`${profile.skills.gaming[0]} developer`)
    }

    return suggestions.filter(Boolean).slice(0, 5)
  })

  // Computed properties
  const totalJobs = computed(() => filteredJobs.value.length)
  const gamingJobsCount = computed(
    () =>
      filteredJobs.value.filter(job => (job.gamingRelevance || 0) > 0.3).length
  )
  const averageSalary = computed(() => {
    const jobsWithSalary = filteredJobs.value.filter(job => job.salary)
    if (jobsWithSalary.length === 0) return 0

    const salaries = jobsWithSalary
      .map(job => extractSalaryNumber(job.salary))
      .filter(salary => salary > 0)

    return salaries.length > 0
      ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length
      : 0
  })

  const topMatches = computed(() => {
    const profile = unifiedProfile.jobSearchProfile.value
    if (!profile) return []

    return filteredJobs.value
      .map(job => ({
        ...job,
        matchScore: calculateJobMatchScore(job, profile),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
  })

  // Search functionality
  const searchJobs = async (filters: JobSearchFilters = {}) => {
    try {
      state.value.isSearching = true
      state.value.error = null
      currentFilters.value = { ...filters }

      logger.info('Starting job search with filters:', filters)

      // Canonical path: provider registry only
      const refactoredResults = await searchRefactoredJobs(filters)
      let allJobs: Job[] = []
      if (refactoredResults.jobs.length > 0) {
        allJobs.push(...refactoredResults.jobs)
        state.value.sources.push(...refactoredResults.sources)
        logger.info(
          `Added ${refactoredResults.jobs.length} jobs from provider registry`
        )
      }

      // Remove duplicates based on title and company
      allJobs = deduplicateJobs(allJobs)

      jobs.value = allJobs
      state.value.totalJobs = allJobs.length
      state.value.lastUpdated = new Date()

      // Apply additional filtering
      applyFilters(filters)

      logger.info(
        `Job search completed: ${allJobs.length} total jobs, ${filteredJobs.value.length} after filtering`
      )
    } catch (error) {
      logger.error('Job search failed:', error)
      state.value.error =
        error instanceof Error ? error.message : 'Job search failed'
    } finally {
      state.value.isSearching = false
    }
  }

  const searchRefactoredJobs = async (filters: JobSearchFilters) => {
    try {
      return await refactoredJobService.searchJobs(filters)
    } catch (error) {
      logger.warn('Refactored service search failed:', error)
      return {
        jobs: [],
        sources: [],
        totalFound: 0,
        errors: [error.message],
        processingTime: 0,
      }
    }
  }

  const applyFilters = (filters: JobSearchFilters) => {
    let filtered = [...jobs.value]

    // Gaming filter
    if (filters.gamingOnly) {
      filtered = filtered.filter(job => (job.gamingRelevance || 0) > 0.3)
    }

    // Saved jobs filter
    if (filters.savedJobsOnly) {
      const savedJobIds = savedJobs.value.map(job => job.id)
      filtered = filtered.filter(job => savedJobIds.includes(job.id))
    }

    // Date posted filter
    if (filters.datePosted && filters.datePosted !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()

      switch (filters.datePosted) {
        case 'today':
          cutoffDate.setDate(now.getDate() - 1)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(
        job => job.postedDate && new Date(job.postedDate) >= cutoffDate
      )
    }

    // Matching score filter
    if (filters.matchingScore && unifiedProfile.jobSearchProfile.value) {
      filtered = filtered.filter(job => {
        const score = calculateJobMatchScore(
          job,
          unifiedProfile.jobSearchProfile.value!
        )
        return score >= (filters.matchingScore || 0)
      })
    }

    // Sort by relevance (gaming relevance + match score + recency)
    filtered.sort((a, b) => {
      const profile = unifiedProfile.jobSearchProfile.value

      let scoreA = (a.gamingRelevance || 0) * 0.3
      let scoreB = (b.gamingRelevance || 0) * 0.3

      if (profile) {
        scoreA += calculateJobMatchScore(a, profile) * 0.5
        scoreB += calculateJobMatchScore(b, profile) * 0.5
      }

      // Add recency bonus
      const daysSinceA = a.postedDate
        ? (Date.now() - new Date(a.postedDate).getTime()) /
          (1000 * 60 * 60 * 24)
        : 30
      const daysSinceB = b.postedDate
        ? (Date.now() - new Date(b.postedDate).getTime()) /
          (1000 * 60 * 60 * 24)
        : 30

      scoreA += Math.max(0, (7 - daysSinceA) / 7) * 0.2 // Recent posts get bonus
      scoreB += Math.max(0, (7 - daysSinceB) / 7) * 0.2

      return scoreB - scoreA
    })

    filteredJobs.value = filtered
  }

  // Job management
  const saveJob = async (job: Job) => {
    if (savedJobs.value.find(saved => saved.id === job.id)) return

    savedJobs.value.push(job)
    await persistSavedJobs()
    logger.info(`Saved job: ${job.title} at ${job.company}`)
  }

  const unsaveJob = async (jobId: string) => {
    const index = savedJobs.value.findIndex(job => job.id === jobId)
    if (index > -1) {
      const job = savedJobs.value[index]
      savedJobs.value.splice(index, 1)
      await persistSavedJobs()
      logger.info(`Unsaved job: ${job.title} at ${job.company}`)
    }
  }

  const isJobSaved = (jobId: string) => {
    return savedJobs.value.some(job => job.id === jobId)
  }

  // Auto search based on profile
  const autoSearchFromProfile = async () => {
    const profile = unifiedProfile.jobSearchProfile.value
    if (!profile) return

    const filters: JobSearchFilters = {
      location: profile.location || undefined,
      remote: profile.remotePreference || undefined,
    }

    // Use preferred roles or skills for search query
    if (profile.preferredRoles?.length) {
      filters.query = profile.preferredRoles[0]
    } else if (profile.skills?.technical?.length) {
      filters.query = `${profile.skills.technical[0]} developer`
    }

    await searchJobs(filters)
  }

  // Real-time updates
  let autoRefreshInterval: NodeJS.Timeout | null = null

  const startAutoRefresh = (intervalMinutes = 30) => {
    // Clear any existing interval
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }

    autoRefreshInterval = setInterval(
      async () => {
        if (
          currentFilters.value.query ||
          Object.keys(currentFilters.value).length > 0
        ) {
          logger.info('Auto-refreshing job search')
          await searchJobs(currentFilters.value)
        }
      },
      intervalMinutes * 60 * 1000
    )
  }

  // Cleanup function for auto-refresh
  onUnmounted(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }
  })

  // Utility functions
  const deduplicateJobs = (jobs: Job[]): Job[] => {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const extractSalaryNumber = (salaryString?: string): number => {
    if (!salaryString) return 0

    const numbers = salaryString.match(/[\d,]+/g)
    if (!numbers) return 0

    const amount = parseInt(numbers[0].replace(/,/g, ''))
    return isNaN(amount) ? 0 : amount
  }

  const calculateJobMatchScore = (job: Job, profile: any): number => {
    let score = 0
    const maxScore = 5

    // Skills match
    if (profile.skills?.technical?.length && job.tags?.length) {
      const skillMatches = profile.skills.technical.filter((skill: string) =>
        job.tags.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
      ).length
      score += (skillMatches / Math.max(profile.skills.technical.length, 1)) * 2
    }

    // Location match
    if (profile.location && job.location) {
      if (job.remote && profile.remotePreference) {
        score += 1
      } else if (
        job.location.toLowerCase().includes(profile.location.toLowerCase())
      ) {
        score += 1
      }
    }

    // Experience level match (basic heuristic)
    if (profile.experience?.length) {
      const totalYears = profile.experience.reduce((sum: number, exp: any) => {
        const years = exp.endDate
          ? (new Date(exp.endDate) - new Date(exp.startDate)) /
            (1000 * 60 * 60 * 24 * 365)
          : (new Date() - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365)
        return sum + years
      }, 0)

      const jobTitle = job.title.toLowerCase()
      if (
        totalYears > 5 &&
        (jobTitle.includes('senior') || jobTitle.includes('lead'))
      ) {
        score += 1
      } else if (
        totalYears > 2 &&
        totalYears <= 5 &&
        !jobTitle.includes('senior')
      ) {
        score += 1
      } else if (totalYears <= 2 && jobTitle.includes('junior')) {
        score += 1
      }
    }

    // Gaming relevance bonus
    if (job.gamingRelevance && job.gamingRelevance > 0.5) {
      score += 1
    }

    return Math.min(score, maxScore) / maxScore // Normalize to 0-1
  }

  // Persistence
  const loadSavedJobs = async () => {
    try {
      const saved = await unifiedStorage.getItem('saved-jobs')
      if (saved && Array.isArray(saved)) {
        savedJobs.value = saved
      }
    } catch (error) {
      logger.warn('Failed to load saved jobs:', error)
    }
  }

  const persistSavedJobs = async () => {
    try {
      await unifiedStorage.setItem('saved-jobs', savedJobs.value)
    } catch (error) {
      logger.warn('Failed to persist saved jobs:', error)
    }
  }

  // Provider management
  const getProviderStatus = async () => {
    try {
      return refactoredJobService.getProviderStatus()
    } catch (e) {
      logger.warn('Provider status unavailable:', e)
      return []
    }
  }

  const refreshProviders = () => {
    try {
      refactoredJobService.clearCache()
    } catch (e) {
      logger.warn('Provider cache clear failed (non-critical):', e)
    }
  }

  // Profile sync integration
  watch(
    () => unifiedProfile.jobSearchProfile.value,
    async newProfile => {
      if (newProfile && !jobs.value.length) {
        // Auto-search when profile is available and no jobs loaded
        await autoSearchFromProfile()
      } else if (newProfile && jobs.value.length) {
        // Re-apply filters with new profile data
        applyFilters(currentFilters.value)
      }
    },
    { deep: true }
  )

  // Initialization
  onMounted(async () => {
    await loadSavedJobs()
    // Start auto-refresh if enabled
    startAutoRefresh(30) // Every 30 minutes
    // Auto-search with profile when available
    if (unifiedProfile.jobSearchProfile.value) {
      await autoSearchFromProfile()
    }
    // Fallback: ensure we load live jobs even without a profile
    setTimeout(async () => {
      if (!jobs.value.length && !state.value.isSearching) {
        try {
          await searchJobs({ query: 'game', remote: true })
        } catch {}
      }
    }, 300)
  })

  return {
    // State
    state,
    jobs,
    filteredJobs,
    savedJobs,
    currentFilters,

    // Computed
    totalJobs,
    gamingJobsCount,
    averageSalary,
    topMatches,
    profileSuggestions,

    // Actions
    searchJobs,
    autoSearchFromProfile,
    saveJob,
    unsaveJob,
    isJobSaved,

    // Utilities
    getProviderStatus,
    refreshProviders,

    // Loading states
    isLoading: computed(() => state.value.isLoading),
    isSearching: computed(() => state.value.isSearching),
    error: computed(() => state.value.error),
    lastUpdated: computed(() => state.value.lastUpdated),
  }
}

export default useJobBoard
