/**
 * Gaming Jobs Composable
 * Vue 3 composable for gaming industry job search with AI enhancements
 */

import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  getCurrentInstance,
  readonly,
} from 'vue'
import type { Job } from '@/shared/types/jobs'
import {
  gamingJobsService,
  type GamingJobFilters,
  type GamingJobSearchResult,
  type GamingJobAlert,
  type JobRecommendation,
} from '@/services/GamingJobsService'
import { useToast } from '@/composables/useToast'
import { logger } from '@/shared/utils/logger'
import { debounce } from 'lodash-es'

export interface UseGamingJobsOptions {
  autoSearch?: boolean
  defaultFilters?: Partial<GamingJobFilters>
  pageSize?: number
}

export function useGamingJobs(options: UseGamingJobsOptions = {}) {
  const { autoSearch = false, defaultFilters = {}, pageSize = 12 } = options

  // State
  const isLoading = ref(false)
  const isSearching = ref(false)
  const searchResults = ref<GamingJobSearchResult>({
    jobs: [],
    totalResults: 0,
    analytics: {
      averageSalary: 0,
      salaryTrends: [],
      topSkills: [],
      topCompanies: [],
      locationHotspots: [],
      experienceDistribution: [],
      remoteVsOnsite: { remote: 0, hybrid: 0, onsite: 0 },
    },
    recommendations: [],
    trends: [],
    sources: [],
    processingTime: 0,
    errors: [],
  })

  const currentPage = ref(1)
  const searchQuery = ref('')
  const searchError = ref<string | null>(null)

  // Filters
  const filters = reactive<GamingJobFilters>({
    location: '',
    workStyle: 'any',
    experienceLevel: '',
    gameEngines: [],
    studioTypes: [],
    gameGenres: [],
    platforms: [],
    roleCategories: [],
    salaryRange: {},
    featured: false,
    recentOnly: false,
    topCompaniesOnly: false,
    urgentHiring: false,
    skillsMatch: false,
    cultureFit: false,
    careerGrowth: false,
    diversityFocused: false,
    ...defaultFilters,
  })

  // Job management
  const savedJobs = ref<Job[]>([])
  const jobAlerts = ref<GamingJobAlert[]>([])
  const appliedJobs = ref<Set<string>>(new Set())

  // UI state
  const viewMode = ref<'grid' | 'list'>('grid')
  const sortBy = ref('relevance')
  const showAdvancedFilters = ref(false)
  const showSavedJobs = ref(false)
  const showAnalytics = ref(false)

  // Toast notifications
  const { showToast } = useToast()

  // Computed properties
  const hasResults = computed(() => searchResults.value.jobs.length > 0)
  const hasError = computed(
    () => searchError.value !== null || searchResults.value.errors.length > 0
  )
  const totalPages = computed(() =>
    Math.ceil(searchResults.value.jobs.length / pageSize)
  )

  const paginatedJobs = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return searchResults.value.jobs.slice(start, end)
  })

  const hasActiveFilters = computed(() => {
    return (
      filters.experienceLevel ||
      filters.workStyle !== 'any' ||
      filters.gameEngines.length > 0 ||
      filters.studioTypes.length > 0 ||
      filters.gameGenres.length > 0 ||
      filters.platforms.length > 0 ||
      filters.roleCategories.length > 0 ||
      filters.salaryRange.min ||
      filters.salaryRange.max ||
      filters.featured ||
      filters.recentOnly ||
      filters.topCompaniesOnly ||
      filters.urgentHiring
    )
  })

  const searchSuggestions = computed(() => {
    if (!searchQuery.value) return []

    const query = searchQuery.value.toLowerCase()
    const suggestions = [
      'Unity Developer',
      'Unreal Engine Developer',
      'Game Designer',
      'Technical Artist',
      'Gameplay Programmer',
      'Mobile Game Developer',
      'VR Developer',
      'Game Producer',
      'QA Engineer',
      'Community Manager',
    ]

    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query))
      .slice(0, 5)
  })

  const topRecommendations = computed(() =>
    searchResults.value.recommendations.slice(0, 3)
  )

  const marketInsights = computed(() => ({
    averageSalary: searchResults.value.analytics.averageSalary,
    topSkills: searchResults.value.analytics.topSkills.slice(0, 5),
    remotePercentage: searchResults.value.analytics.remoteVsOnsite.remote,
    trends: searchResults.value.trends,
  }))

  // Studio count based on search results analytics
  const studioCount = computed(
    () => searchResults.value.analytics.topCompanies?.length || 150
  )

  // Gaming jobs is just an alias for the search results jobs
  const gamingJobs = computed(() => searchResults.value.jobs)

  // Methods
  const searchJobs = async (resetPage = true) => {
    if (resetPage) currentPage.value = 1

    isSearching.value = true
    searchError.value = null

    try {
      const searchFilters = {
        ...filters,
        keywords: searchQuery.value,
      }

      logger.debug('Searching gaming jobs with filters:', searchFilters)

      const result = await gamingJobsService.searchGamingJobs(searchFilters)
      searchResults.value = result

      if (result.errors.length > 0) {
        logger.warn('Search completed with errors:', result.errors)
        showToast('Search completed with some issues', 'warning')
      } else {
        logger.info(`Found ${result.totalResults} gaming jobs`)
      }
    } catch (error) {
      logger.error('Gaming job search failed:', error)
      searchError.value = error.message || 'Search failed'
      showToast('Failed to search jobs', 'error')
    } finally {
      isSearching.value = false
    }
  }

  const debouncedSearch = debounce(searchJobs, 500)

  const clearSearch = () => {
    searchQuery.value = ''
    searchJobs()
  }

  const resetFilters = () => {
    Object.assign(filters, {
      location: '',
      workStyle: 'any',
      experienceLevel: '',
      gameEngines: [],
      studioTypes: [],
      gameGenres: [],
      platforms: [],
      roleCategories: [],
      salaryRange: {},
      featured: false,
      recentOnly: false,
      topCompaniesOnly: false,
      urgentHiring: false,
      skillsMatch: false,
      cultureFit: false,
      careerGrowth: false,
      diversityFocused: false,
    })
    searchJobs()
  }

  const applySuggestion = (suggestion: string) => {
    searchQuery.value = suggestion
    searchJobs()
  }

  const setViewMode = (mode: 'grid' | 'list') => {
    viewMode.value = mode
    localStorage.setItem('gaming-jobs-view-mode', mode)
  }

  const setSortBy = (sort: string) => {
    sortBy.value = sort

    // Sort the current results
    const jobs = [...searchResults.value.jobs]
    switch (sort) {
      case 'date':
        jobs.sort(
          (a, b) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        )
        break
      case 'salary-high':
        jobs.sort((a, b) => {
          const salaryA =
            typeof a.salary === 'object' ? (a.salary as any).max || 0 : 0
          const salaryB =
            typeof b.salary === 'object' ? (b.salary as any).max || 0 : 0
          return salaryB - salaryA
        })
        break
      case 'salary-low':
        jobs.sort((a, b) => {
          const salaryA =
            typeof a.salary === 'object' ? (a.salary as any).min || 0 : 0
          const salaryB =
            typeof b.salary === 'object' ? (b.salary as any).min || 0 : 0
          return salaryA - salaryB
        })
        break
      case 'company':
        jobs.sort((a, b) => a.company.localeCompare(b.company))
        break
      case 'match':
        jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        break
      default: // relevance
        jobs.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (b.matchScore || 0) - (a.matchScore || 0)
        })
    }

    searchResults.value.jobs = jobs
    currentPage.value = 1
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Job management
  const saveJob = (job: Job) => {
    try {
      gamingJobsService.saveJob(job)
      savedJobs.value = gamingJobsService.getSavedJobs()
      showToast(`${job.title} saved!`, 'success')
    } catch (error) {
      logger.error('Failed to save job:', error)
      showToast('Failed to save job', 'error')
    }
  }

  const unsaveJob = (job: Job) => {
    try {
      gamingJobsService.unsaveJob(job.id)
      savedJobs.value = gamingJobsService.getSavedJobs()
      showToast(`${job.title} removed from saved jobs`, 'info')
    } catch (error) {
      logger.error('Failed to unsave job:', error)
      showToast('Failed to unsave job', 'error')
    }
  }

  const isJobSaved = (jobId: string): boolean => {
    return savedJobs.value.some(job => job.id === jobId)
  }

  const applyToJob = (job: Job) => {
    appliedJobs.value.add(job.id)

    // Track application in analytics
    logger.info('Job application started:', {
      jobId: job.id,
      company: job.company,
    })

    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank')
    } else if (job.url) {
      window.open(job.url, '_blank')
    } else {
      showToast('Application link not available', 'warning')
      return
    }

    showToast(`Application opened for ${job.title}`, 'success')
  }

  const hasAppliedToJob = (jobId: string): boolean => {
    return appliedJobs.value.has(jobId)
  }

  // Job alerts
  const createJobAlert = async (name: string) => {
    try {
      const alert = await gamingJobsService.createJobAlert(name, filters)
      jobAlerts.value = gamingJobsService.getJobAlerts()
      showToast(`Job alert "${name}" created!`, 'success')
      return alert
    } catch (error) {
      logger.error('Failed to create job alert:', error)
      showToast('Failed to create job alert', 'error')
      throw error
    }
  }

  const deleteJobAlert = async (alertId: string) => {
    try {
      await gamingJobsService.deleteJobAlert(alertId)
      jobAlerts.value = gamingJobsService.getJobAlerts()
      showToast('Job alert deleted', 'info')
    } catch (error) {
      logger.error('Failed to delete job alert:', error)
      showToast('Failed to delete job alert', 'error')
    }
  }

  // Export functionality
  const exportJobs = (jobsToExport: Job[]) => {
    try {
      const csvData = jobsToExport.map(job => ({
        Title: job.title,
        Company: job.company,
        Location: job.location,
        'Work Style': job.remote ? 'Remote' : job.hybrid ? 'Hybrid' : 'On-site',
        'Experience Level': job.experienceLevel || 'Not specified',
        'Job Type': job.type,
        Technologies: job.technologies?.join(', ') || '',
        'Match Score': job.matchScore ? `${job.matchScore}%` : '',
        'Posted Date': new Date(job.postedDate).toLocaleDateString(),
        URL: job.applicationUrl || job.url || '',
      }))

      const csvHeaders = Object.keys(csvData[0])
      const csvRows = csvData.map(row =>
        csvHeaders.map(header => `"${row[header] || ''}"`).join(',')
      )
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `gaming-jobs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Exported ${jobsToExport.length} jobs to CSV`, 'success')
    } catch (error) {
      logger.error('Failed to export jobs:', error)
      showToast('Failed to export jobs', 'error')
    }
  }

  const exportSavedJobs = () => exportJobs(savedJobs.value)
  const exportSearchResults = () => exportJobs(searchResults.value.jobs)

  // Watchers
  watch(searchQuery, () => {
    if (searchQuery.value) {
      debouncedSearch()
    }
  })

  watch(
    [filters],
    () => {
      debouncedSearch()
    },
    { deep: true }
  )

  // Lifecycle - only register if we're in a component instance
  const instance = getCurrentInstance()
  if (instance) {
    onMounted(() => {
      // Load saved state
      const savedViewMode = localStorage.getItem('gaming-jobs-view-mode')
      if (savedViewMode === 'list' || savedViewMode === 'grid') {
        viewMode.value = savedViewMode
      }

      // Load saved jobs and alerts
      savedJobs.value = gamingJobsService.getSavedJobs()
      jobAlerts.value = gamingJobsService.getJobAlerts()

      // Auto-search if enabled
      if (autoSearch) {
        searchJobs()
      }
    })
  } else if (autoSearch) {
    // If not in component context but autoSearch is enabled, do it immediately
    searchJobs()
  }

  // Return reactive state and methods
  return {
    // State
    isLoading,
    isSearching,
    searchResults: readonly(searchResults),
    currentPage,
    searchQuery,
    searchError,
    filters,
    savedJobs: readonly(savedJobs),
    jobAlerts: readonly(jobAlerts),
    appliedJobs: readonly(appliedJobs),

    // UI State
    viewMode,
    sortBy,
    showAdvancedFilters,
    showSavedJobs,
    showAnalytics,

    // Computed
    hasResults,
    hasError,
    totalPages,
    paginatedJobs,
    hasActiveFilters,
    searchSuggestions,
    topRecommendations,
    marketInsights,
    studioCount,
    gamingJobs,

    // Methods
    searchJobs,
    searchGamingJobs: searchJobs, // Alias for consistency
    clearSearch,
    resetFilters,
    applySuggestion,
    setViewMode,
    setSortBy,
    goToPage,

    // Job Management
    saveJob,
    unsaveJob,
    isJobSaved,
    applyToJob,
    hasAppliedToJob,

    // Job Alerts
    createJobAlert,
    deleteJobAlert,

    // Export
    exportJobs,
    exportSavedJobs,
    exportSearchResults,
  }
}
