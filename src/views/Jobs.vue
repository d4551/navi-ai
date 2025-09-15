<template>
  <StandardPageLayout 
    title="Gaming Job Central"
    subtitle="Discover video game industry roles with AI‑powered matching and studio intelligence"
    title-icon="PuzzlePieceIcon"
    page-type="gaming"
    max-width="full"
    content-spacing="normal"
    :hero-stats="jobBoardStats"
    class="font-sans "
  >
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="md" priority="primary">
        <!-- Primary Action Buttons -->
        <UnifiedButton
          variant="primary"
          size="md"
          leading-icon="MagnifyingGlassIcon"
          @click="showAdvancedSearch = true"
        >
          Advanced Search
        </UnifiedButton>
        
        <UnifiedButton
          variant="gaming"
          size="md"
          leading-icon="PuzzlePieceIcon"
          :class="{ active: filters.gamingOnly }"
          @click="toggleGamingFilter"
        >
          Gaming Jobs Only
        </UnifiedButton>

        <UnifiedButton
          variant="glass"
          size="md"
          leading-icon="BookmarkIcon-outline"
          :badge="savedJobs.length"
          @click="showSavedJobs = !showSavedJobs"
        >
          Saved
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          size="md"
          leading-icon="BellIcon"
          :badge="jobAlerts.length"
          @click="showJobAlertsModal = true"
        >
          Job Alerts
        </UnifiedButton>
      </HeaderActions>

      <!-- Gaming XP HUD -->
      <div class="mt-3">
        <CompactGamifyHUD />
      </div>
    </template>

    <!-- AI-Powered Search Hub -->
    <section class="mb-6">
      <div class="glass-strong p-glass-lg rounded-xl">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-glass-md">
            <AppIcon name="CpuChipIcon" class="text-2xl text-neon-blue" />
            <h2 class="text-xl font-bold text-glass-enhanced">AI Game Career Intelligence</h2>
          </div>
          <div class="flex items-center gap-glass-md">
            <div class="glass px-3 py-1 rounded-lg text-sm text-glass-enhanced">{{ totalJobs }} Active Positions</div>
            <div class="glass px-3 py-1 rounded-lg text-sm text-glass-enhanced">{{ studioCount }}+ Studios</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-glass-md">
          <UnifiedButton
            variant="primary"
            size="lg"
            leading-icon="MagnifyingGlassIcon"
            class="search-action-btn"
            @click="showSearchModal = true"
          >
            <div class="action-content">
              <span class="action-title">Quick Job Hunt</span>
              <span class="action-subtitle">Search with filters</span>
            </div>
          </UnifiedButton>
          
          <UnifiedButton
            variant="cyber"
            size="lg"
            leading-icon="CpuChipIcon"
            :loading="aiLoading"
            class="search-action-btn"
            @click="aiRecommendJobs"
          >
            <div class="action-content">
              <span class="action-title">AI Job Matching</span>
              <span class="action-subtitle">Personalized recommendations</span>
            </div>
          </UnifiedButton>
          
          <UnifiedButton
            variant="glass"
            size="lg"
            leading-icon="EyeIcon"
            class="search-action-btn"
            @click="showSmartSearchDialog = true"
          >
            <div class="action-content">
              <span class="action-title">Smart Search</span>
              <span class="action-subtitle">Natural language queries</span>
            </div>
          </UnifiedButton>

          <UnifiedButton
            variant="gaming"
            size="lg"
            leading-icon="BuildingOffice2Icon"
            class="search-action-btn"
            @click="openStudioExplorer"
          >
            <div class="action-content">
              <span class="action-title">Studio Explorer</span>
              <span class="action-subtitle">Browse by company</span>
            </div>
          </UnifiedButton>
        </div>
      </div>
    </section>

    <!-- Advanced Search and Filter Section -->
    <section class="mb-6">
      <div class="glass p-glass-lg rounded-lg">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-glass-md">
            <AppIcon name="AdjustmentsHorizontalIcon" class="text-xl text-neon-green" />
            <h2 class="text-lg font-semibold text-glass-enhanced">Search & Filter Gaming Jobs</h2>
          </div>
          <UnifiedButton
            variant="ghost"
            size="sm"
            :leading-icon="showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced
          </UnifiedButton>
        </div>
        
        <div class="search-form">
          <!-- Primary Search Row -->
          <div class="search-flex flex-wrap">
            <div class="search-input-container">
              <AppIcon name="MagnifyingGlassIcon" class="search-icon" />
              <input
                v-model="searchFilters.keywords"
                type="text"
                placeholder="Job title, skills, company..."
                class="search-input"
                @keydown.enter="applyFilters"
              />
              <UnifiedButton
                v-if="searchFilters.keywords"
                variant="ghost"
                size="sm"
                trailing-icon="XMarkIcon"
                class="clear-search-btn"
                @click="searchFilters.keywords = ''"
              />
            </div>

            <div class="quick-filters">
              <select v-model="searchFilters.location" class="filter-select glass-select">
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="us">United States</option>
                <option value="europe">Europe</option>
                <option value="canada">Canada</option>
                <option value="asia">Asia</option>
              </select>

              <select v-model="searchFilters.jobType" class="filter-select glass-select">
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>

              <select v-model="searchFilters.posted" class="filter-select glass-select">
                <option value="">All Time</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>

            <div class="search-actions">
              <UnifiedButton
                variant="secondary"
                size="md"
                @click="clearFilters"
              >
                Clear
              </UnifiedButton>
              <UnifiedButton
                variant="primary"
                size="md"
                leading-icon="MagnifyingGlassIcon"
                @click="applyFilters"
              >
                Search
              </UnifiedButton>
            </div>
          </div>

          <!-- Gaming-Specific Filters (Advanced) -->
          <div v-show="showAdvancedFilters" class="advanced-filters">
            <div class="filter-section">
              <h4 class="filter-section-title">
                <AppIcon name="PuzzlePieceIcon" />
                Gaming Industry Filters
              </h4>
              
              <div class="filter-grid">
                <div class="filter-group">
                  <label>Game Engines</label>
                  <select v-model="gamingFilters.gameEngines" multiple class="filter-select glass-select">
                    <option v-for="engine in gameEngineOptions" :key="engine" :value="engine">
                      {{ engine }}
                    </option>
                  </select>
                </div>
                
                <div class="filter-group">
                  <label>Studio Types</label>
                  <select v-model="gamingFilters.studioTypes" multiple class="filter-select glass-select">
                    <option v-for="type in studioTypeOptions" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>
                
                <div class="filter-group">
                  <label>Platforms</label>
                  <select v-model="gamingFilters.platforms" multiple class="filter-select glass-select">
                    <option v-for="platform in platformOptions" :key="platform" :value="platform">
                      {{ platform }}
                    </option>
                  </select>
                </div>
                
                <div class="filter-group">
                  <label>Role Categories</label>
                  <select v-model="gamingFilters.roleCategories" multiple class="filter-select glass-select">
                    <option v-for="category in roleCategoryOptions" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI-Powered Top Matches Section -->
    <div v-if="topMatches.length > 0" class="content-section">
      <div class="top-matches-card glass p-glass-md gap-glass-md m-glass-md rounded-lg">
        <div class="matches-header">
          <div class="matches-info">
            <div class="matches-icon-group">
              <AppIcon name="StarIcon" class="matches-icon" />
              <div class="matches-text">
                <h3>Top AI Matches for You</h3>
                <p>{{ topMatches.length }} high-match opportunities (60%+ compatibility)</p>
              </div>
            </div>
          </div>
          <UnifiedButton
            v-if="!aiLoading && jobResults.length > 0"
            variant="outline"
            size="md"
            leading-icon="CpuChipIcon"
            :loading="aiLoading"
            @click="aiRecommendJobs"
          >
            Refresh Analysis
          </UnifiedButton>
        </div>
        
        <div class="top-matches-grid">
          <div v-for="job in topMatches.slice(0, 6)" :key="job.id" class="top-match-card">
            <div class="match-card-header">
              <div class="job-info">
                <h4>{{ job.title }}</h4>
                <p>{{ job.company }} • {{ job.location }}</p>
              </div>
              <div class="match-score" :class="`match-${getMatchScoreLevel(job.matchScore)}`">
                {{ job.matchScore }}%
              </div>
            </div>
            <div class="match-card-meta">
              <div class="job-tags">
                <span class="job-tag">{{ formatJobType(job.type) }}</span>
                <span v-if="job.salary" class="job-tag salary-tag">{{ formatSalary(job.salary) }}</span>
              </div>
              <UnifiedButton
                variant="primary"
                size="sm"
                @click="viewJobDetails(job)"
              >
                View Details
              </UnifiedButton>
            </div>
          </div>
        </div>
        
        <div v-if="topMatches.length > 6" class="view-all-matches">
          <UnifiedButton
            variant="outline"
            size="md"
            @click="scrollToJobsTable"
          >
            View All {{ topMatches.length }} Top Matches
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- AI Analysis CTA (when no analysis has been run) -->
    <div v-else-if="filteredJobs.length > 0 && !hasRunAIAnalysis" class="content-section">
      <div class="ai-cta-card glass p-glass-md gap-glass-md m-glass-md rounded-lg">
        <div class="ai-cta-content">
          <AppIcon name="CpuChipIcon" class="ai-cta-icon" />
          <h2>Get AI-Powered Job Recommendations</h2>
          <p>Let our advanced AI analyze {{ filteredJobs.length }} jobs and find your best matches based on your skills, experience, and gaming industry preferences.</p>
          <UnifiedButton
            variant="gaming"
            size="xl"
            leading-icon="SparklesIcon"
            :loading="aiLoading"
            class="ai-analyze-btn"
            @click="aiRecommendJobs"
          >
            Analyze Jobs with AI
          </UnifiedButton>
          <div class="ai-features">
            <span class="feature-badge">
              <AppIcon name="CheckCircleIcon" />
              Smart Matching Algorithm
            </span>
            <span class="feature-badge">
              <AppIcon name="CpuChipIcon" />
              Gaming Industry Focused
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Job Results Section -->
    <div class="content-section">
      <div class="results-card glass p-glass-md gap-glass-md m-glass-md rounded-lg">
        <div class="results-header">
          <div class="results-info">
            <h2>Gaming Job Opportunities</h2>
            <p>Curated from multiple gaming industry sources</p>
          </div>
          <div class="results-controls">
            <div class="results-count">
              {{ filteredJobs.length }} Results
            </div>
            <ViewToggle
              v-model="viewMode"
              :options="[
                { value: 'table', icon: 'TableCellsIcon', label: 'Table view' },
                { value: 'cards', icon: 'mdi-view-grid', label: 'Cards view' },
              ]"
            />
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="sort-bar">
          <div class="sort-controls">
            <label>Sort by:</label>
            <select v-model="sortBy" class="sort-select glass-select" @change="applySorting">
              <option value="relevance">Relevance</option>
              <option value="date">Date Posted</option>
              <option value="salary">Salary</option>
              <option value="company">Company</option>
              <option value="aiScore">AI Match Score</option>
            </select>
          </div>

          <UnifiedButton
            variant="outline"
            size="sm"
            :loading="refreshing"
            leading-icon="ArrowPathIcon"
            @click="refreshJobs"
          >
            Refresh
          </UnifiedButton>
        </div>

        <!-- Job Display -->
        <div class="job-display-container">
          <!-- Table View -->
          <div v-if="viewMode === 'table'" class="jobs-table-container">
            <JobResultsList
              :jobs="paginatedJobs"
              :loading="loading"
              :selected-jobs="selectedJobs"
              @job-selected="handleJobSelected"
              @job-applied="handleJobApplied"
              @job-saved="handleJobSaved"
            />
          </div>
          
          <!-- Cards View -->
          <div v-else class="job-cards-container">
            <JobResultsGrid
              :jobs="paginatedJobs"
              :loading="loading"
              @job-selected="handleJobSelected"
              @job-applied="handleJobApplied"
              @job-saved="handleJobSaved"
            />
          </div>

          <!-- Empty State -->
          <div v-if="!loading && filteredJobs.length === 0" class="empty-state">
            <AppIcon name="MagnifyingGlassIcon" class="empty-icon" />
            <h3>No gaming jobs found</h3>
            <p>Try adjusting your filters or check out our studio database for more opportunities.</p>
            <div class="empty-actions">
              <UnifiedButton
                variant="primary"
                size="md"
                @click="clearFilters"
              >
                Clear Filters
              </UnifiedButton>
              <UnifiedButton
                variant="outline"
                size="md"
                @click="openStudioExplorer"
              >
                Explore Studios
              </UnifiedButton>
            </div>
          </div>

          <!-- Pagination -->
          <JobPagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="filteredJobs.length"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- Live Data Sources Status -->
    <div class="content-section">
      <div class="data-sources-card glass p-glass-md gap-glass-md m-glass-md rounded-lg">
        <div class="sources-header">
          <h5>Live Gaming Job Sources</h5>
          <UnifiedButton
            variant="outline"
            size="sm"
            :loading="verifying"
            leading-icon="mdi-connection"
            @click="runDataVerification"
          >
            {{ verifying ? 'Checking...' : 'Verify Sources' }}
          </UnifiedButton>
        </div>

        <div v-if="dataSourcesStatus" class="sources-grid">
          <div v-for="source in dataSourcesStatus" :key="source.name" class="source-card">
            <div class="source-header">
              <div class="source-info">
                <AppIcon :name="source.icon" class="source-icon" />
                <span class="source-name">{{ source.name }}</span>
              </div>
              <div class="source-status" :class="source.status">
                {{ source.status === 'active' ? '🟢' : '🔴' }}
              </div>
            </div>
            <div class="source-stats">
              <span class="job-count">{{ source.jobCount }} jobs</span>
              <span class="last-updated">{{ formatLastUpdated(source.lastUpdated) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals & Overlays -->
    <AIJobSearchInterface
      v-model:show="showSearchModal"
      @search-submitted="handleAISearch"
    />
    
    <JobDetailsModal
      v-model:show="showJobDetailsModal"
      :job="selectedJob"
      @job-applied="handleJobApplied"
      @job-saved="handleJobSaved"
    />

    <GameJobFilters
      v-model:show="showAdvancedSearch"
      v-model:filters="filters"
      advanced-mode
      @filter-applied="applyFilters"
    />

    <JobAlertsModal
      v-model:show="showJobAlertsModal"
      :alerts="jobAlerts"
      @alert-created="handleAlertCreated"
      @alert-deleted="handleAlertDeleted"
    />
  </StandardPageLayout>
</template>

<script setup>
import { AdjustmentsHorizontalIcon, ArrowPathIcon, BellIcon, BuildingOffice2Icon, CpuChipIcon, EyeIcon, MagnifyingGlassIcon, PuzzlePieceIcon, SparklesIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, StarIcon } from '@heroicons/vue/24/solid'

import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import HeaderActions from '@/components/ui/HeaderActions.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ViewToggle from '@/components/ui/ViewToggle.vue'
import CompactGamifyHUD from '@/components/CompactGamifyHUD.vue'
import GameJobFilters from '@/components/GameJobFilters.vue'
import JobResultsGrid from '@/components/jobs/JobResultsGrid.vue'
import JobResultsList from '@/components/jobs/JobResultsList.vue'
import JobPagination from '@/components/jobs/JobPagination.vue'
import AIJobSearchInterface from '@/components/jobs/AIJobSearchInterface.vue'
import JobDetailsModal from '@/components/jobs/JobDetailsModal.vue'
import JobAlertsModal from '@/components/jobs/JobAlertsModal.vue'

// Composables
import { useJobs } from '@/composables/useJobs'
import { useGamingJobs } from '@/composables/useGamingJobs'
import { useJobBoard } from '@/composables/useJobBoard'
import { useAIJobSearch } from '@/composables/useAIJobSearch.js'
import { useAppStore } from '@/stores/app'

// Services
import { verifyAggregation, verifyDirectOpenEndpoints } from '@/services/IngestionVerifier'
import { toastService } from '@/shared/services/toastService'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// Core state
const loading = ref(false)
const refreshing = ref(false)
const verifying = ref(false)
const aiLoading = ref(false)

// Search & Filters
const searchQuery = ref('')
const searchFilters = ref({
  keywords: '',
  location: '',
  jobType: '',
  posted: '',
})
const gamingFilters = ref({
  gameEngines: [],
  studioTypes: [],
  platforms: [],
  roleCategories: []
})
const filters = ref({
  gamingOnly: route.query.filter === 'gaming' || true,
  location: '',
  level: '',
  salary: '',
  skills: [],
  company: '',
  jobType: '',
  remote: false
})
const showAdvancedFilters = ref(false)
const sortBy = ref('relevance')
const viewMode = ref('cards')

// Jobs data
const jobs = ref([])
const jobResults = ref([])
const topMatches = ref([])
const savedJobs = ref([])
const jobAlerts = ref([])
const selectedJob = ref(null)
const selectedJobs = ref([])
const hasRunAIAnalysis = ref(false)

// Gaming industry filter options
const gameEngineOptions = ref([
  'Unity', 'Unreal Engine', 'Godot', 'GameMaker Studio', 
  'Construct 3', 'RPG Maker', 'CryEngine', 'Source Engine',
  'Frostbite', 'id Tech', 'Custom Engine'
])

const studioTypeOptions = ref([
  'AAA Studio', 'Indie Developer', 'Mobile Games', 
  'VR/AR Studio', 'Publishing House', 'Platform Holder',
  'Middleware Provider', 'Game Services', 'Esports'
])

const platformOptions = ref([
  'PC', 'PlayStation', 'Xbox', 'Nintendo Switch',
  'Mobile (iOS)', 'Mobile (Android)', 'VR', 'AR',
  'Web/Browser', 'Cloud Gaming'
])

const roleCategoryOptions = ref([
  'Engineering', 'Design', 'Art & Animation', 'Production',
  'Audio', 'QA & Testing', 'Data & Analytics', 'Marketing',
  'Community Management', 'Business Development'
])

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Modals
const showSearchModal = ref(false)
const showJobDetailsModal = ref(false)
const showAdvancedSearch = ref(false)
const showJobAlertsModal = ref(false)
const showSavedJobs = ref(false)

// Data sources status
const dataSourcesStatus = ref([])

// Composables initialization
const {
  jobs: composableJobs,
  loading: jobsLoading,
  searchJobs,
  refreshJobs: refreshJobsData
} = useJobs()

const {
  gamingJobs,
  studioCount,
  searchGamingJobs
} = useGamingJobs()

const {
  performAISearch,
  getAIRecommendations
} = useAIJobSearch()

// Computed
const totalJobs = computed(() => jobs.value.length)

const jobBoardStats = computed(() => [
  { label: 'Active Jobs', value: totalJobs.value, icon: 'mdi-briefcase' },
  { label: 'Gaming Studios', value: studioCount.value, icon: 'mdi-office-building' },
  { label: 'Saved Jobs', value: savedJobs.value.length, icon: 'BookmarkIcon' },
  { label: 'Job Alerts', value: jobAlerts.value.length, icon: 'mdi-bell' }
])

const filteredJobs = computed(() => {
  let result = [...jobs.value]

  // Apply search filters
  if (searchFilters.value.keywords.trim()) {
    const query = searchFilters.value.keywords.toLowerCase()
    result = result.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company?.name?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.skills?.some(skill => skill.toLowerCase().includes(query))
    )
  }

  // Apply location filter
  if (searchFilters.value.location) {
    result = result.filter(job => {
      if (searchFilters.value.location === 'remote') {
        return job.remote || job.location?.toLowerCase().includes('remote')
      }
      return job.location?.toLowerCase().includes(searchFilters.value.location.toLowerCase())
    })
  }

  // Apply job type filter
  if (searchFilters.value.jobType) {
    result = result.filter(job => 
      job.type?.toLowerCase() === searchFilters.value.jobType.toLowerCase()
    )
  }

  // Apply posted date filter
  if (searchFilters.value.posted) {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (searchFilters.value.posted) {
      case '24h':
        cutoffDate.setDate(now.getDate() - 1)
        break
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
    }
    
    result = result.filter(job => 
      new Date(job.datePosted) >= cutoffDate
    )
  }

  // Apply gaming-specific filters
  if (gamingFilters.value.gameEngines.length > 0) {
    result = result.filter(job =>
      gamingFilters.value.gameEngines.some(engine =>
        job.requirements?.toLowerCase().includes(engine.toLowerCase()) ||
        job.description?.toLowerCase().includes(engine.toLowerCase())
      )
    )
  }

  if (gamingFilters.value.studioTypes.length > 0) {
    result = result.filter(job =>
      gamingFilters.value.studioTypes.some(type =>
        job.company?.type?.includes(type) ||
        job.tags?.includes(type)
      )
    )
  }

  // Always prioritize gaming jobs
  if (filters.value.gamingOnly) {
    result = result.filter(job => job.isGaming || job.category === 'gaming')
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(b.datePosted) - new Date(a.datePosted)
      case 'salary':
        return (b.salaryMax || 0) - (a.salaryMax || 0)
      case 'company':
        return (a.company?.name || '').localeCompare(b.company?.name || '')
      case 'aiScore':
        return (b.aiScore || b.matchScore || 0) - (a.aiScore || a.matchScore || 0)
      default:
        return (b.relevanceScore || 0) - (a.relevanceScore || 0)
    }
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredJobs.value.length / itemsPerPage.value))

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredJobs.value.slice(start, end)
})

// Methods
const performSearch = async () => {
  loading.value = true
  try {
    const searchParams = {
      query: searchFilters.value.keywords,
      location: searchFilters.value.location,
      jobType: searchFilters.value.jobType,
      posted: searchFilters.value.posted,
      gamingFilters: gamingFilters.value,
      gamingFocus: true
    }
    
    const results = await searchJobs(searchParams)
    jobs.value = results
    jobResults.value = results
    currentPage.value = 1
  } catch (error) {
    toastService.error('Search failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const applyFilters = async () => {
  await performSearch()
}

const clearFilters = () => {
  searchFilters.value = {
    keywords: '',
    location: '',
    jobType: '',
    posted: '',
  }
  gamingFilters.value = {
    gameEngines: [],
    studioTypes: [],
    platforms: [],
    roleCategories: []
  }
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  performSearch()
}

const toggleGamingFilter = () => {
  filters.value.gamingOnly = !filters.value.gamingOnly
  applyFilters()
}

const applySorting = () => {
  // Sorting is handled by computed property
}

const refreshJobs = async () => {
  refreshing.value = true
  try {
    await refreshJobsData()
    jobs.value = composableJobs.value
    toastService.success('Jobs refreshed successfully')
  } catch (error) {
    toastService.error('Failed to refresh jobs: ' + error.message)
  } finally {
    refreshing.value = false
  }
}

const aiRecommendJobs = async () => {
  aiLoading.value = true
  try {
    const recommendations = await getAIRecommendations({
      profile: appStore.profile,
      preferences: { ...filters.value, ...searchFilters.value },
      gamingFilters: gamingFilters.value,
      gamingFocus: true
    })
    
    // Separate high-match jobs (60%+) from regular results
    const highMatches = recommendations.filter(job => (job.matchScore || job.aiScore || 0) >= 60)
    topMatches.value = highMatches.sort((a, b) => (b.matchScore || b.aiScore || 0) - (a.matchScore || a.aiScore || 0))
    
    jobs.value = recommendations
    jobResults.value = recommendations
    hasRunAIAnalysis.value = true
    toastService.success(`Found ${recommendations.length} AI-matched positions (${highMatches.length} high matches)`)
  } catch (error) {
    toastService.error('AI recommendations failed: ' + error.message)
  } finally {
    aiLoading.value = false
  }
}

const handleAISearch = async (searchData) => {
  loading.value = true
  try {
    const results = await performAISearch(searchData)
    jobs.value = results
    jobResults.value = results
    showSearchModal.value = false
    toastService.success(`Found ${results.length} AI-matched positions`)
  } catch (error) {
    toastService.error('AI search failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const showJobDetails = (job) => {
  selectedJob.value = job
  showJobDetailsModal.value = true
}

const viewJobDetails = (job) => {
  showJobDetails(job)
}

const handleJobSelected = (job) => {
  showJobDetails(job)
}

const handleJobApplied = (job) => {
  toastService.success(`Application started for ${job.title}`)
  // Track application in analytics
}

const handleJobSaved = (job) => {
  const index = savedJobs.value.findIndex(saved => saved.id === job.id)
  if (index === -1) {
    savedJobs.value.push(job)
    toastService.success('Job saved!')
  } else {
    savedJobs.value.splice(index, 1)
    toastService.info('Job removed from saved')
  }
}

const handleAddToCompare = (job) => {
  toastService.info('Job added to comparison (feature coming soon)')
}

const handlePageChange = (page) => {
  currentPage.value = page
  nextTick(() => {
    document.querySelector('.job-display-container')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  })
}

const scrollToJobsTable = () => {
  nextTick(() => {
    document.querySelector('.results-card')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  })
}

const openStudioExplorer = () => {
  router.push('/studios')
}

const openStudioModal = (job) => {
  // Open studio details modal for the job's company
  const studioInfo = getMatchingStudio(job.company)
  if (studioInfo) {
    // Implement studio modal logic
    toastService.info(`Studio info for ${job.company} (feature coming soon)`)
  }
}

const getMatchingStudio = (companyName) => {
  // This would integrate with the gaming studios database
  return null // Placeholder
}

// Utility methods
const formatJobType = (type) => {
  if (!type) return 'Not specified'
  return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
}

const formatSalary = (salary) => {
  if (!salary) return null
  if (typeof salary === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary)
  }
  return salary
}

const getMatchScoreLevel = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'low'
}

const getMatchChipColor = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'primary'
  if (score >= 60) return 'warning'
  return 'secondary'
}

const runDataVerification = async () => {
  verifying.value = true
  try {
    const [sources, endpoints] = await Promise.all([
      verifyAggregation('game'),
      verifyDirectOpenEndpoints('game')
    ])
    
    // Transform verification results into status objects
    dataSourcesStatus.value = endpoints.map(endpoint => ({
      name: endpoint.provider,
      icon: getProviderIcon(endpoint.provider),
      status: endpoint.ok ? 'active' : 'inactive',
      jobCount: endpoint.count || 0,
      lastUpdated: new Date()
    }))
    
    toastService.success('Data sources verified')
  } catch (error) {
    toastService.error('Verification failed: ' + error.message)
  } finally {
    verifying.value = false
  }
}

const getProviderIcon = (provider) => {
  const iconMap = {
    'Greenhouse': 'mdi-leaf',
    'Lever': 'mdi-office-building',
    'SmartRecruiters': 'mdi-brain',
    'Workday': 'CalendarIcon',
    'GitHub': 'mdi-github',
    'AngelList': 'RocketLaunchIcon'
  }
  return iconMap[provider] || 'mdi-briefcase'
}

const formatLastUpdated = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return `${Math.floor(minutes / 1440)}d ago`
}

const handleAlertCreated = (alert) => {
  jobAlerts.value.push(alert)
  toastService.success('Job alert created')
}

const handleAlertDeleted = (alertId) => {
  const index = jobAlerts.value.findIndex(alert => alert.id === alertId)
  if (index !== -1) {
    jobAlerts.value.splice(index, 1)
    toastService.info('Job alert deleted')
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    // Initialize with gaming jobs if filter is active
    if (filters.value.gamingOnly) {
      jobs.value = await searchGamingJobs()
    } else {
      jobs.value = composableJobs.value
    }
    
    // Load saved jobs and alerts from storage
    const stored = localStorage.getItem('navi-job-data')
    if (stored) {
      const data = JSON.parse(stored)
      savedJobs.value = data.savedJobs || []
      jobAlerts.value = data.jobAlerts || []
    }
  } catch (error) {
    toastService.error('Failed to load jobs: ' + error.message)
  } finally {
    loading.value = false
  }
})

// Watch for route changes
watch(() => route.query.filter, (newFilter) => {
  if (newFilter === 'gaming') {
    filters.value.gamingOnly = true
    applyFilters()
  }
})

// Save data on changes
watch([savedJobs, jobAlerts], () => {
  localStorage.setItem('navi-job-data', JSON.stringify({
    savedJobs: savedJobs.value,
    jobAlerts: jobAlerts.value
  }))
}, { deep: true })
</script>

<style scoped>
/* Gaming-focused glassmorphic styling */
.search-hub-card {
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, 
    var(--color-primary-50) 0%,
    var(--color-gaming-50) 100%);
  border: 1px solid var(--color-gaming-200);
  backdrop-filter: blur(20px);
}

.search-hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.hub-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.hub-title h3 {
  margin: 0;
  background: linear-gradient(45deg, var(--color-gaming-400), var(--color-primary-400));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.hub-icon {
  font-size: 1.5rem;
  color: var(--color-gaming-400);
}

.hub-stats {
  display: flex;
  gap: var(--spacing-3);
}

.stat-badge {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.gaming-stat {
  background: var(--color-gaming-100);
  color: var(--color-gaming-300);
  border-color: rgba(var(--color-gaming-500-rgb), 0.3);
}

.studio-stat {
  background: var(--color-primary-100);
  color: var(--color-primary-300);
  border-color: rgba(var(--color-primary-500-rgb), 0.3);
}

.search-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.search-action-btn {
  height: auto !important;
  padding: var(--spacing-4) var(--spacing-5);
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-1);
}

.action-title {
  font-weight: 600;
  font-size: 1rem;
}

.action-subtitle {
  font-size: 0.875rem;
  opacity: 0.7;
}

.search-filter-bar {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(var(--surface-rgb), 0.8);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  padding: 0 var(--spacing-3);
  transition: all 0.2s ease;
}

.search-input-container:focus-within {
  border-color: var(--color-gaming-400);
  box-shadow: 0 0 0 3px var(--color-gaming-100);
}

.search-icon {
  color: var(--text-secondary);
  margin-right: var(--spacing-3);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-3) 0;
  font-size: 1rem;
  color: var(--text-primary-600);
}

.search-input:focus {
  outline: none;
}

.clear-search-btn {
  margin-left: var(--spacing-2);
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.view-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-toggle :deep(.unified-button) {
  border-radius: 0;
  border: none;
}

.view-toggle :deep(.unified-button.active) {
  background: var(--color-gaming-500);
  color: white;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
  gap: var(--spacing-4);
}

.results-info h4 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-primary-600);
}

.results-meta {
  display: flex;
  gap: var(--spacing-3);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.results-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
}

.sort-controls label {
  color: var(--text-secondary);
  margin: 0;
}

.sort-select {
  background: var(--glass p-glass-md gap-glass-md m-glass-md rounded-lg);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--text-primary-600);
  font-size: 0.875rem;
}

.job-results-container {
  min-height: 400px;
}

.data-sources-card {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
}

.sources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.sources-header h5 {
  margin: 0;
  color: var(--text-primary-600);
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-3);
}

.source-card {
  background: rgba(var(--surface-rgb), 0.6);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  transition: all 0.2s ease;
}

.source-card:hover {
  border-color: var(--color-gaming-400);
  transform: translateY(-1px);
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.source-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.source-icon {
  font-size: 1rem;
  color: var(--color-gaming-400);
}

.source-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.source-status {
  font-size: 0.75rem;
}

.source-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.job-count {
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .results-actions {
    justify-content: space-between;
  }
  
  .sources-grid {
    grid-template-columns: 1fr;
  }
}

/* Gaming theme enhancements with RGB neon accents */
:deep(.unified-button.active) {
  background: var(--neon-primary);
  color: var(--surface-base);
  box-shadow: 0 0 20px rgba(var(--neon-primary-rgb), 0.4);
}

:deep(.glass p-glass-md gap-glass-md m-glass-md rounded-lg) {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
}

/* Enhanced hover effects with RGB neon accents */
.search-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--neon-primary-rgb), 0.2);
}

.top-match-card:hover {
  box-shadow: 0 8px 25px rgba(var(--neon-primary-rgb), 0.15);
}

.source-card.active {
  border-color: var(--color-success-400);
  background: rgba(var(--color-success-500-rgb), 0.05);
}

/* Focus states with RGB neon */
.search-input:focus,
.filter-select:focus,
.sort-select:focus {
  box-shadow: 0 0 0 2px rgba(var(--neon-primary-rgb), 0.2);
}

/* Animation for active elements */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(var(--neon-primary-rgb), 0.3); }
  50% { box-shadow: 0 0 20px rgba(var(--neon-primary-rgb), 0.6), 0 0 30px rgba(var(--neon-primary-rgb), 0.3); }
}

.ai-analyze-btn:hover {
  animation: pulse-glow 2s infinite;
}
</style>
