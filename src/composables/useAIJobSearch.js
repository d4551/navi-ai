/**
 * AI Job Search Composable
 * Vue 3 composable for AI-powered job search with semantic matching and intelligent insights
 * Integrates AI, studio data, and job matching for comprehensive results
 */

import { ref, onMounted, computed } from 'vue'
import { aiJobMatchingService } from '@/services/AIJobMatchingService'
import { useToast } from '@/composables/useToast'
import { logger } from '@/shared/utils/logger'

export function useAIJobSearch(userProfile = {}) {
  // Reactive state
  const isSearching = ref(false)
  const searchResults = ref([])
  const enrichedJobs = ref([]) // Jobs enriched with studio data
  const searchInsights = ref([])
  const searchAnalysis = ref(null)
  const lastSearchQuery = ref('')
  const searchError = ref(null)
  const marketSummary = ref(null)
  const personalizedTips = ref([])

  // Search history
  const searchHistory = ref([])
  const savedSearches = ref([])

  // Real-time suggestions
  const searchSuggestions = ref([])
  const quickSuggestions = ref([
    'Remote Unity developer',
    'Senior game designer AAA',
    'Community manager esports',
    'Mobile game producer',
    'VR/AR technical artist',
    'Gameplay programmer',
    'UX designer gaming',
    'DevOps engineer games',
  ])

  const toast = useToast()

  // Computed properties
  const hasSearchResults = computed(() => searchResults.value.length > 0)

  const hasInsights = computed(() => searchInsights.value.length > 0)

  const searchProgress = computed(() => {
    if (!isSearching.value) return 0
    // Simulate progress based on search duration
    return Math.min(90, (Date.now() % 10000) / 100)
  })

  const topMatches = computed(() =>
    searchResults.value.filter(job => job.overallScore > 0.8).slice(0, 5)
  )

  const searchStats = computed(() => {
    if (!searchResults.value.length) return null

    const scores = searchResults.value.map(job => job.overallScore || 0)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

    return {
      total: searchResults.value.length,
      highMatch: scores.filter(s => s > 0.8).length,
      mediumMatch: scores.filter(s => s > 0.6 && s <= 0.8).length,
      lowMatch: scores.filter(s => s <= 0.6).length,
      averageScore: Math.round(avgScore * 100),
    }
  })

  // Methods
  async function performAISearch(searchForm, options = {}) {
    if (isSearching.value || !searchForm.query?.trim()) {
      return { success: false, error: 'Invalid search or search in progress' }
    }

    try {
      isSearching.value = true
      searchError.value = null
      lastSearchQuery.value = searchForm.query

      logger.info('Starting AI-powered job search:', searchForm.query)

      // Step 1: Semantic search analysis
      const analysisResult = await aiJobMatchingService.performSemanticSearch(
        searchForm.query,
        userProfile,
        {
          location: searchForm.location,
          experience: searchForm.experience,
          type: searchForm.type,
          remote: searchForm.remote,
          salaryMin: searchForm.salaryMin,
          salaryMax: searchForm.salaryMax,
          ...options,
        }
      )

      if (analysisResult.success) {
        searchAnalysis.value = analysisResult.analysis
        searchSuggestions.value = analysisResult.suggestions || []
        updateSearchInsights(analysisResult.insights || [])

        logger.info('Search analysis completed successfully')
      } else {
        logger.warn(
          'Search analysis failed, using fallback:',
          analysisResult.error
        )
        searchAnalysis.value = analysisResult.fallback
      }

      // Step 2: Generate personalized insights
      const insightsResult =
        await aiJobMatchingService.generateJobSearchInsights(
          searchForm.query,
          userProfile,
          marketSummary.value || {}
        )

      if (insightsResult.success) {
        searchInsights.value = insightsResult.insights
        marketSummary.value = insightsResult.marketSummary
        personalizedTips.value = insightsResult.recommendations?.immediate || []

        logger.info('Job search insights generated successfully')
      }

      // Step 3: Mock job search (integrate with actual job APIs here)
      const mockJobs = generateMockJobs(searchAnalysis.value, 15)

      // Step 4: AI-powered job matching and ranking
      const matchingResult = await aiJobMatchingService.matchJobsToProfile(
        mockJobs,
        userProfile,
        { query: searchForm.query, analysis: searchAnalysis.value }
      )

      if (matchingResult.success) {
        // Process job matching results
        searchResults.value = matchingResult.matches.map((match, index) => ({
          ...mockJobs.find(job => job.id === match.jobId),
          ...match,
          rank: index + 1,
        }))

        // Store enriched jobs with studio data
        if (matchingResult.enrichedJobs) {
          enrichedJobs.value = matchingResult.enrichedJobs
          logger.info(
            `Jobs enriched with studio data: ${enrichedJobs.value.filter(j => j.studioData).length}/${enrichedJobs.value.length}`
          )
        }

        logger.info(
          `AI job matching completed: ${matchingResult.matches.length} jobs ranked`
        )
      } else {
        searchResults.value = mockJobs
        logger.warn('Job matching failed, using unranked results')
      }

      // Add to search history
      addToSearchHistory(searchForm)

      toast.success(`Found ${searchResults.value.length} AI-matched positions`)

      return {
        success: true,
        results: searchResults.value,
        insights: searchInsights.value,
        analysis: searchAnalysis.value,
      }
    } catch (error) {
      searchError.value = error.message
      logger.error('AI job search failed:', error)
      toast.error('Search failed. Please try again.')

      return { success: false, error: error.message }
    } finally {
      isSearching.value = false
    }
  }

  async function getSearchSuggestions(partialQuery) {
    if (!partialQuery || partialQuery.length < 3) {
      return quickSuggestions.value
    }

    try {
      // Simple suggestion generation based on gaming keywords
      const gamingTerms = [
        'game designer',
        'unity developer',
        'unreal engineer',
        'community manager',
        'esports coordinator',
        'mobile producer',
        'technical artist',
        'qa lead',
        'gameplay programmer',
        'ui/ux designer',
        'devops engineer',
        'data analyst',
      ]

      const filtered = gamingTerms
        .filter(term => term.toLowerCase().includes(partialQuery.toLowerCase()))
        .slice(0, 5)

      return [
        ...filtered,
        ...quickSuggestions.value.slice(0, 8 - filtered.length),
      ]
    } catch (error) {
      logger.error('Failed to get search suggestions:', error)
      return quickSuggestions.value
    }
  }

  async function analyzeSalaryRange(jobTitle, location, salaryRange) {
    try {
      const result = await aiJobMatchingService.analyzeSalaryCompetitiveness(
        jobTitle,
        location,
        salaryRange,
        userProfile
      )

      if (result.success) {
        return {
          success: true,
          competitiveness: result.analysis.competitiveness,
          percentile: result.analysis.marketPercentile,
          insights: result.insights,
          tips: result.negotiationTips,
        }
      }

      return result
    } catch (error) {
      logger.error('Salary analysis failed:', error)
      return { success: false, error: error.message }
    }
  }

  async function getPersonalizedRecommendations() {
    try {
      const result = await aiJobMatchingService.getPersonalizedRecommendations(
        userProfile,
        searchHistory.value,
        { query: lastSearchQuery.value }
      )

      if (result.success) {
        personalizedTips.value = result.recommendations
        return {
          success: true,
          tips: result.recommendations,
          strengths: result.strengths,
          improvements: result.improvements,
          skillGaps: result.skillGaps,
        }
      }

      return result
    } catch (error) {
      logger.error('Failed to get personalized recommendations:', error)
      return { success: false, error: error.message }
    }
  }

  function updateSearchInsights(newInsights) {
    // Merge new insights with existing ones, avoiding duplicates
    const existingIds = new Set(searchInsights.value.map(insight => insight.id))
    const uniqueNewInsights = newInsights.filter(
      insight => !existingIds.has(insight.id)
    )

    searchInsights.value = [
      ...searchInsights.value,
      ...uniqueNewInsights,
    ].slice(0, 6)
  }

  function handleInsightAction(insight) {
    logger.info('Handling insight action:', insight.action?.type)

    switch (insight.action?.type) {
      case 'update_search':
        // Trigger search form update
        return { action: 'updateSearch', data: insight.action.data }

      case 'expand_skills':
        // Suggest skills to add to profile
        return { action: 'expandSkills', data: insight.action.data }

      case 'adjust_salary':
        // Suggest salary range adjustment
        return { action: 'adjustSalary', data: insight.action.data }

      case 'change_location':
        // Suggest location changes
        return { action: 'changeLocation', data: insight.action.data }

      default:
        return { action: 'info', message: insight.description }
    }
  }

  function saveSearch(searchForm, name = null) {
    const searchToSave = {
      id: Date.now().toString(),
      name: name || `Search ${savedSearches.value.length + 1}`,
      query: searchForm.query,
      filters: {
        location: searchForm.location,
        experience: searchForm.experience,
        type: searchForm.type,
        remote: searchForm.remote,
        salaryMin: searchForm.salaryMin,
        salaryMax: searchForm.salaryMax,
      },
      createdAt: new Date().toISOString(),
      resultsCount: searchResults.value.length,
    }

    savedSearches.value.push(searchToSave)

    // Store in localStorage for persistence
    try {
      localStorage.setItem('aiJobSearches', JSON.stringify(savedSearches.value))
      toast.success('Search saved successfully')
    } catch (error) {
      logger.error('Failed to save search:', error)
      toast.error('Failed to save search')
    }

    return searchToSave
  }

  function loadSavedSearch(searchId) {
    const saved = savedSearches.value.find(search => search.id === searchId)
    if (saved) {
      return {
        query: saved.query,
        ...saved.filters,
      }
    }
    return null
  }

  function deleteSavedSearch(searchId) {
    const index = savedSearches.value.findIndex(
      search => search.id === searchId
    )
    if (index >= 0) {
      savedSearches.value.splice(index, 1)

      try {
        localStorage.setItem(
          'aiJobSearches',
          JSON.stringify(savedSearches.value)
        )
        toast.success('Search deleted')
      } catch (error) {
        logger.error('Failed to delete search:', error)
      }
    }
  }

  function addToSearchHistory(searchForm) {
    const historyItem = {
      id: Date.now().toString(),
      query: searchForm.query,
      timestamp: new Date().toISOString(),
      resultsCount: searchResults.value.length,
    }

    searchHistory.value.unshift(historyItem)
    // Keep only last 20 searches
    searchHistory.value = searchHistory.value.slice(0, 20)
  }

  function clearSearchResults() {
    searchResults.value = []
    searchInsights.value = []
    searchAnalysis.value = null
    searchError.value = null
  }

  // Utility functions
  function generateMockJobs(analysis, count = 10) {
    // This would be replaced with actual job API integration
    const mockJobs = []
    const companies = [
      'Epic Games',
      'Riot Games',
      'Blizzard',
      'Valve',
      'CD Projekt',
      'Ubisoft',
      'EA',
      'Unity Technologies',
    ]
    const roles = analysis?.searchAnalysis?.extractedRoles || [
      'Game Developer',
      'Game Designer',
      'Producer',
    ]

    for (let i = 0; i < count; i++) {
      mockJobs.push({
        id: `job_${i + 1}`,
        title:
          roles[i % roles.length] +
          (i > roles.length - 1 ? ` ${Math.floor(i / roles.length) + 1}` : ''),
        company: companies[i % companies.length],
        location: [
          'San Francisco, CA',
          'Los Angeles, CA',
          'Remote',
          'Austin, TX',
          'Seattle, WA',
        ][i % 5],
        remote: Math.random() > 0.4,
        salary: {
          min: 70000 + i * 5000,
          max: 100000 + i * 8000,
        },
        description: `Join our team as a ${roles[i % roles.length]} and help create amazing gaming experiences. Work with cutting-edge technology and passionate developers.`,
        requirements: analysis?.searchAnalysis?.keySkills?.slice(0, 3) || [
          'Gaming passion',
          'Team collaboration',
        ],
        postedDate: new Date(Date.now() - i * 86400000).toISOString(),
        featured: i < 3,
      })
    }

    return mockJobs
  }

  function loadSavedSearches() {
    try {
      const saved = localStorage.getItem('aiJobSearches')
      if (saved) {
        savedSearches.value = JSON.parse(saved)
      }
    } catch (error) {
      logger.error('Failed to load saved searches:', error)
    }
  }

  // Initialize
  onMounted(() => {
    loadSavedSearches()
  })

  return {
    // State
    isSearching: computed(() => isSearching.value),
    searchResults: computed(() => searchResults.value),
    enrichedJobs: computed(() => enrichedJobs.value), // Jobs with studio data
    searchInsights: computed(() => searchInsights.value),
    searchAnalysis: computed(() => searchAnalysis.value),
    searchError: computed(() => searchError.value),
    marketSummary: computed(() => marketSummary.value),
    personalizedTips: computed(() => personalizedTips.value),

    // History and saved searches
    searchHistory: computed(() => searchHistory.value),
    savedSearches: computed(() => savedSearches.value),

    // Suggestions
    searchSuggestions: computed(() => searchSuggestions.value),
    quickSuggestions: computed(() => quickSuggestions.value),

    // Computed
    hasSearchResults,
    hasInsights,
    searchProgress,
    topMatches,
    searchStats,

    // Methods
    performAISearch,
    getSearchSuggestions,
    analyzeSalaryRange,
    getPersonalizedRecommendations,
    handleInsightAction,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    clearSearchResults,
  }
}
