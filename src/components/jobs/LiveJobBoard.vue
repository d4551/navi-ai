<!--
Live Job Board Component

Displays live jobs from multiple API sources with:
- Real-time job fetching from APIs
- Profile-based personalization
- Advanced filtering and search
- Gaming industry focus
- Auto-refresh and caching
-->
<template>
  <div class="live-job-board font-sans">
    <!-- Header with Live Stats -->
    <div class="job-board-header glass-card section-card mb-4">
      <div class="section-header flex justify-between items-center">
        <div class="header-info">
          <h2 class="mb-1">
            <AppIcon name="MagnifyingGlassIcon" class="text-primary-600 mr-2" />
            Live Job Board
            <span v-if="isSearching" class="loading-indicator ml-2">
              <AppIcon name="ArrowPathIcon" class="mdi-spin" />
            </span>
          </h2>
          <p class="text-secondary mb-0">
            Real-time opportunities from {{ providerCount }} job sources
            <span v-if="lastUpdated" class="ml-2">
              • Updated {{ getRelativeTime(lastUpdated) }}
            </span>
          </p>
        </div>
        
        <div class="header-stats flex gap-glass-md">
          <div class="stat-card">
            <div class="stat-number">{{ totalJobs.toLocaleString() }}</div>
            <div class="stat-label">Total Jobs</div>
          </div>
          <div class="stat-card gaming">
            <div class="stat-number">{{ gamingJobsCount }}</div>
            <div class="stat-label">Gaming</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ topMatches.length }}</div>
            <div class="stat-label">Top Matches</div>
          </div>
          <div v-if="averageSalary > 0" class="stat-card">
            <div class="stat-number">${{ Math.round(averageSalary / 1000) }}K</div>
            <div class="stat-label">Avg Salary</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters-section glass-card section-card mb-4">
      <div class="search-header section-header">
        <h5 class="mb-0">
          <AppIcon name="AdjustmentsHorizontalIcon" class="mr-2" />
          Search & Filter Jobs
        </h5>
        <div v-if="profileSuggestions.length" class="search-suggestions">
          <span class="text-secondary small mr-2">Quick searches:</span>
          <UnifiedButton
            v-for="suggestion in profileSuggestions"
            :key="suggestion"
            variant="outline"
            size="chip"
            class="mr-2 mb-1"
            @click="setQuickSearch(suggestion)"
          >
            {{ suggestion }}
          </UnifiedButton>
        </div>
      </div>
      <div class="search-form section-body">
        <div class="filters-grid settings-grid">
          <!-- Search -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="MagnifyingGlassIcon" class="mr-1" />
              Search Jobs
            </label>
            <input
              v-model="searchForm.query"
              type="text"
              class="form-control filter-input"
              placeholder="Job title, skills, company..."
              @keyup.enter="searchJobs"
            >
          </div>

          <!-- Location -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="MapPinIcon" class="mr-1" />
              Location
            </label>
            <select v-model="searchForm.location" class="form-select filter-input">
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="San Francisco, CA">San Francisco</option>
              <option value="New York, NY">New York</option>
              <option value="London, UK">London</option>
              <option value="Berlin, DE">Berlin</option>
              <option value="Toronto, CA">Toronto</option>
            </select>
          </div>

          <!-- Job Type -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="BriefcaseIcon" class="mr-1" />
              Type
            </label>
            <select v-model="searchForm.type" class="form-select filter-input">
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <!-- Posted -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="CalendarIcon" class="mr-1" />
              Posted
            </label>
            <select v-model="searchForm.datePosted" class="form-select filter-input">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <!-- Action -->
          <div class="filter-actions">
            <UnifiedButton
              variant="primary"
              size="sm"
              leading-icon="MagnifyingGlassIcon"
              :disabled="isSearching"
              @click="searchJobs"
            >
              {{ isSearching ? 'Searching...' : 'Search' }}
            </UnifiedButton>
          </div>
        </div>
        
        <!-- Collapsible Filter Sections -->
        <div class="mt-3">
          <!-- Quick Filters -->
          <div class="filter-section">
            <div
              class="filter-section-header"
              role="button"
              tabindex="0"
              :aria-expanded="showQuickFilters ? 'true' : 'false'"
              @click="showQuickFilters = !showQuickFilters"
              @keydown.enter.prevent="showQuickFilters = !showQuickFilters"
              @keydown.space.prevent="showQuickFilters = !showQuickFilters"
            >
              <div class="header-left">
                <AppIcon name="BoltIcon" />
                <span>Quick Filters</span>
              </div>
              <div class="header-actions">
                <UnifiedButton variant="outline" size="chip" leading-icon="XMarkIcon-circle-outline" @click.stop="clearAllQuickFilters">Clear</UnifiedButton>
                <AppIcon class="toggle-icon" :name="showQuickFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
              </div>
            </div>
            <div v-show="showQuickFilters" class="filter-section-body">
              <div class="filter-toggles flex gap-glass-sm flex-wrap items-center">
                <div class="quick-chips flex gap-glass-sm flex-wrap me-auto">
                  <span class="chip-label text-secondary">Quick:</span>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.seniority==='junior' }" @click="quickFilters.seniority = quickFilters.seniority==='junior' ? '' : 'junior'">Junior</UnifiedButton>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.seniority==='mid' }" @click="quickFilters.seniority = quickFilters.seniority==='mid' ? '' : 'mid'">Mid</UnifiedButton>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.seniority==='senior' }" @click="quickFilters.seniority = quickFilters.seniority==='senior' ? '' : 'senior'">Senior</UnifiedButton>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.seniority==='lead' }" @click="quickFilters.seniority = quickFilters.seniority==='lead' ? '' : 'lead'">Lead+</UnifiedButton>
                  <span class="chip-sep">|</span>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.jobType==='full-time' }" @click="quickFilters.jobType = quickFilters.jobType==='full-time' ? '' : 'full-time'">Full‑time</UnifiedButton>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.jobType==='contract' }" @click="quickFilters.jobType = quickFilters.jobType==='contract' ? '' : 'contract'">Contract</UnifiedButton>
                  <span class="chip-sep">|</span>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.salaryMin===100000 }" @click="quickFilters.salaryMin = quickFilters.salaryMin===100000 ? 0 : 100000">≥ $100k</UnifiedButton>
                  <UnifiedButton size="chip" variant="outline" :class="{ active: quickFilters.salaryMin===150000 }" @click="quickFilters.salaryMin = quickFilters.salaryMin===150000 ? 0 : 150000">≥ $150k</UnifiedButton>
                </div>

                <UnifiedButton size="sm" :variant="searchForm.gamingOnly ? 'gaming' : 'outline'" leading-icon="PuzzlePieceIcon" @click="toggleGamingFilter">Gaming Only</UnifiedButton>
                
                <UnifiedButton size="sm" :variant="searchForm.savedJobsOnly ? 'success' : 'outline'" leading-icon="BookmarkIcon" @click="toggleSavedJobsFilter">Saved ({{ savedJobs.length }})</UnifiedButton>
                
                <UnifiedButton size="sm" :variant="searchForm.remote ? 'info' : 'outline'" leading-icon="HomeIcon" @click="toggleRemoteFilter">Remote</UnifiedButton>

                <UnifiedButton v-if="hiddenJobIds.size" size="sm" variant="warning" appearance="outlined" leading-icon="EyeIcon" @click="clearHiddenJobs">Clear Hidden ({{ hiddenJobIds.size }})</UnifiedButton>
              </div>
            </div>
          </div>

          <!-- Advanced Filters -->
          <div class="filter-section mt-2">
            <div
              class="filter-section-header"
              role="button"
              tabindex="0"
              :aria-expanded="showAdvancedFilters ? 'true' : 'false'"
              @click="showAdvancedFilters = !showAdvancedFilters"
              @keydown.enter.prevent="showAdvancedFilters = !showAdvancedFilters"
              @keydown.space.prevent="showAdvancedFilters = !showAdvancedFilters"
            >
              <div class="header-left">
                <AppIcon name="mdi-tune" />
                <span>Advanced Filters</span>
              </div>
              <div class="header-actions">
                <AppIcon class="toggle-icon" :name="showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
              </div>
            </div>
            <div v-show="showAdvancedFilters" class="filter-section-body">
              <div class="flex flex-wrap g-3 items-end">
                <div class="flex-1-md-4">
                  <label class="form-label">
                    <AppIcon name="CurrencyDollarIcon" class="mr-1" />
                    Minimum Salary
                  </label>
                  <input
                    v-model.number="quickFilters.salaryMin"
                    type="range"
                    min="0"
                    max="200000"
                    step="25000"
                    class="form-range"
                  />
                  <div class="small text-secondary mt-1">≥ ${{ Math.round(quickFilters.salaryMin/1000) }}k</div>
                </div>

                <div class="flex-1-md-4">
                  <label class="form-label">
                    <AppIcon name="BuildingOfficeIcon" class="mr-1" /> Company contains
                  </label>
                  <input v-model.trim="advancedFilters.companyIncludes" type="text" class="form-control" placeholder="e.g. Ubisoft" @keyup.enter="searchJobs" />
                </div>

                <div class="flex-1-md-4 flex gap-glass-md flex-wrap">
                  <div class="form-check">
                    <input id="onlySalary" v-model="advancedFilters.onlyWithSalary" class="form-check-input" type="checkbox" />
                    <label for="onlySalary" class="form-check-label">
                      <AppIcon name="mdi-currency-usd" class="mr-1" /> Only with salary
                    </label>
                  </div>
                  <div class="form-check">
                    <input id="noIntern" v-model="advancedFilters.excludeInternships" class="form-check-input" type="checkbox" />
                    <label for="noIntern" class="form-check-label">
                      <AppIcon name="AcademicCapIcon" class="mr-1" /> Exclude internships
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-2 flex gap-glass-sm flex-wrap">
                <UnifiedButton size="sm" variant="outline" leading-icon="FunnelIcon-off" @click="clearFilters">Clear All</UnifiedButton>
                <UnifiedButton size="sm" variant="outline" :disabled="refreshing" :loading="refreshing" leading-icon="ArrowPathIcon" @click="refreshJobs">Refresh</UnifiedButton>
                <UnifiedButton size="sm" variant="success" :disabled="!searchForm.query" leading-icon="mdi-bell-plus" @click="createJobAlert">Create Alert</UnifiedButton>
                <UnifiedButton 
                  size="sm" 
                  variant="ghost" 
                  :leading-icon="showProviderStatus ? 'mdi-api-off' : 'mdi-api'"
                  @click="showProviderStatus = !showProviderStatus"
                >
                  {{ showProviderStatus ? 'Hide' : 'Show' }} API Status
                </UnifiedButton>
              </div>

              <!-- Provider Status (inline) -->
              <div v-if="showProviderStatus" class="provider-status-inline mt-3 p-glass-md glass-bg-glass-bg dark:bg-glass-bg-hover border rounded">
                <div class="flex items-center mb-2">
                  <AppIcon name="mdi-api" class="mr-2" />
                  <h6 class="mb-0">Live Job Sources</h6>
                  <span class="badge bg-primary-500 ml-2">{{ Object.keys(providerStatus).length }} providers</span>
                </div>
                <div class="flex flex-wrap g-2">
                  <div
                    v-for="(status, provider) in providerStatus"
                    :key="provider"
                    class="flex-1-md-3 flex-1-sm-6"
                  >
                    <div class="provider-card-compact" :class="{ active: status.enabled }">
                      <div class="provider-name">{{ provider }}</div>
                      <div class="provider-status">
                        <span :class="status.enabled ? 'text-success-600' : 'text-secondary'">
                          {{ status.enabled ? 'Active' : 'Inactive' }}
                        </span>
                        <span class="text-secondary ml-1 small">
                          ({{ status.rateLimitRemaining }} left)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Job Alerts Section -->
    <div v-if="jobAlerts.length > 0 || showJobAlerts" class="job-alerts-section mb-4">
      <div class="glass-card section-card">
        <div class="section-header flex justify-between items-center">
          <h6 class="mb-0">
            <AppIcon name="BellIcon" class="mr-2" />
            Job Alerts ({{ jobAlerts.length }})
            <span v-if="realTimeStats.newJobsToday" class="badge bg-primary-500 ml-2">
              {{ realTimeStats.newJobsToday }} new today
            </span>
          </h6>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="showJobAlerts = !showJobAlerts"
          >
            {{ showJobAlerts ? 'Hide' : 'Show' }} Alerts
          </button>
        </div>
        
        <div v-if="showJobAlerts" class="section-body">
          <div v-if="jobAlerts.length === 0" class="text-secondary text-center py-3">
            No job alerts created yet. Create your first alert using the search form above.
          </div>
          
          <div v-else class="alerts-list">
            <div
              v-for="alert in jobAlerts"
              :key="alert.id"
              class="alert-item flex justify-between items-center p-glass-md mb-2 glass-list-item"
              :class="{ 'alert-disabled': !alert.enabled }"
            >
              <div class="alert-info">
                <div class="alert-name font-weight-medium">{{ alert.name }}</div>
                <div class="alert-meta text-secondary small">
                  <span>{{ alert.totalMatches }} matches</span>
                  <span class="mx-2">•</span>
                  <span>Last checked {{ getRelativeTime(alert.lastChecked) }}</span>
                  <span v-if="alert.newMatches > 0" class="mx-2">•</span>
                  <span v-if="alert.newMatches > 0" class="text-success-600">
                    {{ alert.newMatches }} new
                  </span>
                </div>
              </div>
              
              <div class="alert-actions flex gap-glass-xs">
                <button
                  class="btn btn-sm"
                  :class="alert.enabled ? 'btn-success' : 'btn-outline-secondary'"
                  @click="toggleJobAlert(alert.id)"
                >
                  <AppIcon :name="alert.enabled ? 'mdi-bell' : 'mdi-bell-off'" />
                </button>
                
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteJobAlert(alert.id)"
                >
                  <AppIcon name="TrashIcon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Job Notifications -->
    <div v-if="newJobNotifications.length > 0" class="job-notifications mb-4">
      <div class="glass-card section-card">
        <h6 class="mb-3">
          <AppIcon name="mdi-bell-ring" class="text-primary-600 mr-2" />
          New Job Notifications
        </h6>
        
        <div class="notifications-list">
          <div
            v-for="notification in newJobNotifications.slice(0, 5)"
            :key="notification.id"
            class="notification-item p-glass-md mb-2"
            :class="{ 'notification-unread': !notification.read }"
            @click="markNotificationRead(notification.id)"
          >
            <div class="notification-content">
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time text-secondary small">
                {{ getRelativeTime(notification.timestamp) }}
              </div>
            </div>
            
            <div class="notification-actions">
              <UnifiedButton
                variant="outline"
                size="sm"
                @click="viewJobDetails(notification.job)"
              >
                View Job
              </UnifiedButton>
            </div>
          </div>
        </div>
        
        <div v-if="newJobNotifications.length > 5" class="text-center mt-2">
          <button class="btn btn-sm btn-link">
            Show {{ newJobNotifications.length - 5 }} more notifications
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger">
      <AppIcon name="ExclamationCircleIcon" class="mr-2" />
      {{ _error }}
      <button class="btn btn-sm btn-outline-danger ml-2" @click="searchJobs">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !isSearching && displayJobs.length === 0" class="empty-state glass-card section-card text-center">
      <div class="empty-icon mb-3">
        <AppIcon name="MagnifyingGlassIcon" style="font-size: 4rem; opacity: 0.3;" />
      </div>
      <h4 class="mb-2">No jobs found</h4>
      <p class="text-secondary mb-3">
        Try adjusting your search criteria or clearing filters
      </p>
      <div class="flex gap-glass-sm justify-center">
        <UnifiedButton variant="outline" @click="clearFilters">
          Clear Filters
        </UnifiedButton>
        <UnifiedButton variant="primary" @click="autoSearchFromProfile">
          Search Based on Profile
        </UnifiedButton>
      </div>
    </div>

    <!-- Job Results -->
    <div v-else class="job-results">
      <!-- Loading State -->
      <div v-if="isLoading" class="glass-card section-card mb-3 text-center py-5">
        <div class="spinner-border text-primary-600 mr-2" role="status"></div>
        <span class="text-secondary">Loading jobs from {{ providerCount }} sources...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-card section-card mb-3">
        <div class="alert alert-danger mb-0" role="alert">
          <AppIcon name="ExclamationCircleIcon" class="mr-2" />
          Error loading jobs: {{ error }}
          <UnifiedButton variant="outline" size="sm" class="ml-2" @click="refreshJobs">
            Try Again
          </UnifiedButton>
        </div>
      </div>

      <!-- Results Header -->
      <div v-else class="glass-card section-card mb-3">
        <div class="section-header flex justify-between items-center">
          <div class="results-summary">
            <h5 class="mb-0">
              {{ displayJobs.length }} jobs found
              <span v-if="visibleJobs.length !== displayJobs.length" class="text-secondary">
                (showing {{ (currentPage - 1) * resultsPerPage + 1 }}-{{ Math.min(currentPage * resultsPerPage, displayJobs.length) }})
              </span>
              <span v-if="isSearching" class="spinner-border spinner-border-sm ml-2" role="status"></span>
            </h5>
            <small class="text-secondary">
              Sorted by relevance {{ gamingJobsCount > 0 ? `• ${gamingJobsCount} gaming-related` : '' }}
              • Updated {{ getRelativeTime(lastUpdated) }}
            </small>
          </div>
          <div class="results-actions header-actions-group">
            <select v-model="sortBy" class="form-select sort-select" aria-label="Sort results">
              <option value="relevance">Sort by Relevance</option>
              <option value="date">Newest First</option>
              <option value="salary">Highest Salary</option>
              <option value="company">Company A-Z</option>
            </select>
            <ViewToggle
              v-model="viewMode" :options="[
                { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
                { value: 'list', icon: 'mdi-view-list', label: 'List view' }
              ]"
            />
          </div>
        </div>
      </div>
      
      <!-- Active filters (quick) -->
      <div v-if="activeQuickFilters.length" class="active-filters mb-2">
        <span v-for="f in activeQuickFilters" :key="f.key" class="filter-pill">
          <AppIcon :name="f.icon" />
          {{ f.label }}
          <button class="clear-filter" aria-label="Clear filter" @click="clearQuickFilter(f.key)">×</button>
        </span>
        <button class="btn btn-xs btn-outline-secondary ml-2" @click="clearAllQuickFilters">Clear all</button>
      </div>

      <!-- Job Results Grid -->
      <JobResultsGrid
        :jobs="visibleJobs"
        :loading="isLoading || isSearching"
        :saved-jobs="savedJobs"
        :show-metrics="true"
        :enable-a-i-insights="true"
        @apply="handleJobApply"
        @save="handleJobSave"
        @view-job="viewJobDetails"
        @add-to-compare="handleAddToCompare"
        @share-job="handleShareJob"
        @report-job="handleReportJob"
      />

      <!-- Pagination Component -->
      <JobPagination
        v-if="displayJobs.length > 0"
        :current-page="currentPage"
        :total-items="displayJobs.length"
        :items-per-page="resultsPerPage"
        :per-page-options="[10, 25, 50, 100]"
        @update:current-page="currentPage = $event"
        @update:items-per-page="handleItemsPerPageChange"
      />
    </div>

    <!-- Job Details Modal -->
    <div v-if="selectedJob" class="modal fade show block" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedJob.title }}</h5>
            <UnifiedButton variant="ghost" size="sm" icon-only :icon="'XMarkIcon'" aria-label="Close" @click="selectedJob = null"></UnifiedButton>
          </div>
          <div class="modal-body">
            <JobDetailsView :job="selectedJob" />
          </div>
          <div class="modal-footer">
            <UnifiedButton variant="secondary" @click="selectedJob = null">Close</UnifiedButton>
            <UnifiedButton
              variant="gaming"
              :loading="aiAnalyzing"
              leading-icon="CpuChipIcon"
              @click="analyzeSelectedJob()"
            >
              {{ aiAnalyzing ? 'Analyzing...' : 'Analyze with AI' }}
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              :href="selectedJob.url"
              target="_blank"
              trailing-icon="ArrowTopRightOnSquareIcon"
            >
              Apply for Job
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AIJobAnalysisModal
    v-if="selectedJob"
    v-model:show="showAIAnalysis"
    :job="selectedJob"
    :match-data="aiMatchData"
    :salary-data="aiSalaryData"
    :insights-data="aiInsightsData"
    :mode="aiMode"
    @analyze="(_job, nextMode) => analyzeSelectedJob(nextMode)"
  />
</template>

<script setup>
import { AcademicCapIcon, AdjustmentsHorizontalIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon, BellIcon, BriefcaseIcon, BuildingOfficeIcon, CalendarIcon, CpuChipIcon, CurrencyDollarIcon, ExclamationCircleIcon, EyeIcon, HomeIcon, MagnifyingGlassIcon, PuzzlePieceIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { MapPinIcon } from '@heroicons/vue/24/solid'

import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useJobBoard } from '@/composables/useJobBoard'
import { useUnifiedProfile } from '@/composables/useUnifiedProfile'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import ViewToggle from '@/components/ui/ViewToggle.vue'
import JobDetailsView from '@/components/jobs/JobDetailsView.vue'
import JobResultsGrid from '@/components/jobs/JobResultsGrid.vue'
import AIJobAnalysisModal from '@/components/jobs/AIJobAnalysisModal.vue'
import JobPagination from '@/components/jobs/JobPagination.vue'
import { aiJobService } from '@/services/AIJobService'
import { useAppStore } from '@/stores/app'
import { usePageAssistantContext } from '@/composables/usePageAssistantContext'

// Job board integration
const jobBoard = useJobBoard()
const unifiedProfile = useUnifiedProfile()

// Component state
const selectedJob = ref(null)
const sortBy = ref('relevance')
const refreshing = ref(false)
const showProviderStatus = ref(false)

// Router for navigation
const router = useRouter()

// Enhanced state for new features
const expandedInsights = ref(null)
const comparisonJobs = ref([])
const showJobComparison = ref(false)
const selectedJobIds = ref(new Set())
const jobNotifications = ref(new Map())
const loadingStates = ref(new Map())

// Enhanced AI Insights Functions
const getAIInsights = (job) => {
  if (!job) return null
  
  const profile = unifiedProfile.jobSearchProfile.value
  const insights = []
  
  // Career Alignment Insight
  const careerAlignment = calculateCareerAlignment(job, profile)
  insights.push({
    type: 'career',
    title: 'Career Alignment',
    description: `${careerAlignment.score}% match - ${careerAlignment.reasons.join(', ') || 'Based on your profile'}`,
    icon: 'CursorArrowRaysIcon',
    level: careerAlignment.level,
    score: careerAlignment.score
  })
  
  // Skill Gap Analysis
  const skillGaps = identifySkillGaps(job, profile)
  if (skillGaps.missing.length > 0) {
    insights.push({
      type: 'skills',
      title: 'Skill Development',
      description: `Consider developing: ${skillGaps.missing.slice(0, 3).join(', ')}${skillGaps.missing.length > 3 ? ` and ${skillGaps.missing.length - 3} more` : ''}`,
      icon: 'mdi-school',
      missing: skillGaps.missing,
      critical: skillGaps.critical,
      action: {
        label: 'View Learning Resources',
        icon: 'mdi-book-open-variant',
        route: '/skill-mapper'
      }
    })
  } else {
    insights.push({
      type: 'skills',
      title: 'Skills Match',
      description: 'Your skills align well with this role!',
      icon: 'CheckIcon-circle',
      level: 'excellent'
    })
  }
  
  // Recommendations
  const recommendations = generateRecommendations(job, profile)
  if (recommendations.length > 0) {
    const topRec = recommendations[0]
    insights.push({
      type: 'recommendation',
      title: topRec.title,
      description: topRec.description,
      icon: topRec.type === 'skill' ? 'LightBulbIcon' : topRec.type === 'portfolio' ? 'mdi-briefcase' : 'UserIcon-group',
      priority: topRec.priority,
      action: topRec.action ? {
        label: topRec.action,
        icon: 'ArrowRightIcon'
      } : null
    })
  }
  
  // Market Comparison
  const marketComparison = getMarketComparison(job)
  insights.push({
    type: 'market',
    title: 'Market Position',
    description: marketComparison.description || 'Competitive position in the job market',
    icon: 'ChartBarIcon-line',
    trend: marketComparison.trend
  })
  
  // Growth Potential for Gaming Roles
  const growthPotential = assessGrowthPotential(job)
  if (growthPotential.score > 60) {
    insights.push({
      type: 'growth',
      title: 'Growth Potential',
      description: growthPotential.reasons.join(', ') || 'Good growth opportunities',
      icon: 'mdi-trending-up',
      score: growthPotential.score,
      action: {
        label: 'Start Interview Prep',
        icon: 'MicrophoneIcon',
        route: '/interview-prep'
      }
    })
  }
  
  return insights
}

const calculateCareerAlignment = (job, profile) => {
  let score = 0
  let reasons = []
  
  // Check title alignment
  if (profile.desiredRoles?.some(role => 
    job.title.toLowerCase().includes(role.toLowerCase())
  )) {
    score += 30
    reasons.push('Title matches your desired roles')
  }
  
  // Check industry alignment (gaming focus)
  if ((job.gamingRelevance || 0) > 0.3 && profile.targetIndustries?.includes('gaming')) {
    score += 25
    reasons.push('Gaming industry alignment')
  }
  
  // Check skill alignment
  const skillMatch = calculateSkillAlignment(job, profile)
  score += skillMatch * 25
  if (skillMatch > 0.7) {
    reasons.push('Strong skill alignment')
  }
  
  // Check location preference
  if (job.remote && profile.workPreferences?.remote) {
    score += 10
    reasons.push('Remote work preference match')
  }
  
  // Check experience level
  if (job.experienceLevel === profile.experienceLevel) {
    score += 10
    reasons.push('Experience level match')
  }
  
  return {
    score: Math.min(score, 100),
    level: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor',
    reasons
  }
}

const identifySkillGaps = (job, profile) => {
  const requiredSkills = job.tags || []
  const userSkills = Array.isArray(profile.skills) ? profile.skills : []
  const userSkillsLower = userSkills.map(s => s.toLowerCase())
  
  const missingSkills = requiredSkills.filter(skill => 
    !userSkillsLower.includes(skill.toLowerCase())
  )
  
  // Enhanced critical skills for gaming industry
  const gamingCriticalSkills = [
    'unity', 'unreal', 'c++', 'c#', 'python', 'lua', 'glsl', 'hlsl',
    'maya', 'blender', '3ds max', 'substance', 'zbrush', 'photoshop',
    'perforce', 'git', 'jenkins', 'jira', 'confluence',
    'gameplay programming', 'graphics programming', 'engine programming',
    'level design', 'game design', 'narrative design', 'ui/ux design',
    'technical art', 'vfx', 'animation', 'rigging', 'lighting',
    'audio programming', 'wwise', 'fmod', 'procedural generation',
    'multiplayer', 'networking', 'server architecture', 'aws', 'azure',
    'playfab', 'steamworks', 'console development', 'mobile development'
  ]
  
  const webCriticalSkills = ['javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'express']
  
  const criticalSkills = missingSkills.filter(skill => {
    const skillLower = skill.toLowerCase()
    return gamingCriticalSkills.includes(skillLower) || webCriticalSkills.includes(skillLower)
  })
  
  // Categorize missing skills
  const categorizedSkills = {
    programming: [],
    tools: [],
    design: [],
    technical: [],
    other: []
  }
  
  missingSkills.forEach(skill => {
    const skillLower = skill.toLowerCase()
    if (['unity', 'unreal', 'c++', 'c#', 'python', 'javascript', 'lua', 'gameplay programming', 'graphics programming'].some(s => skillLower.includes(s))) {
      categorizedSkills.programming.push(skill)
    } else if (['maya', 'blender', 'substance', 'zbrush', 'photoshop', 'perforce', 'git', 'jenkins'].some(s => skillLower.includes(s))) {
      categorizedSkills.tools.push(skill)
    } else if (['game design', 'level design', 'ui/ux', 'narrative design', 'technical art'].some(s => skillLower.includes(s))) {
      categorizedSkills.design.push(skill)
    } else if (['multiplayer', 'networking', 'aws', 'azure', 'console development'].some(s => skillLower.includes(s))) {
      categorizedSkills.technical.push(skill)
    } else {
      categorizedSkills.other.push(skill)
    }
  })
  
  return {
    missing: missingSkills.slice(0, 5),
    critical: criticalSkills,
    categorized: categorizedSkills,
    total: missingSkills.length,
    matchPercentage: Math.round(((requiredSkills.length - missingSkills.length) / Math.max(requiredSkills.length, 1)) * 100),
    impact: criticalSkills.length > 0 ? 'high' : missingSkills.length > 3 ? 'medium' : 'low'
  }
}

const generateRecommendations = (job, profile) => {
  const recommendations = []
  
  // Resume tailoring
  if (job.tags?.length > 0) {
    recommendations.push({
      type: 'resume',
      title: 'Tailor your resume',
      description: `Highlight experience with ${job.tags.slice(0, 3).join(', ')} to better match this role`,
      priority: 'high',
      action: 'Open Resume Builder'
    })
  }
  
  // Portfolio enhancement
  if ((job.gamingRelevance || 0) > 0.3) {
    recommendations.push({
      type: 'portfolio',
      title: 'Showcase gaming projects',
      description: 'Add relevant gaming projects to strengthen your portfolio for this role',
      priority: 'medium',
      action: 'Update Portfolio'
    })
  }
  
  // Skill development
  const skillGaps = identifySkillGaps(job, profile)
  if (skillGaps.critical.length > 0) {
    recommendations.push({
      type: 'skill',
      title: 'Develop critical skills',
      description: `Consider learning ${skillGaps.critical[0]} to qualify for similar roles`,
      priority: 'high',
      action: 'Find Resources'
    })
  }
  
  // Networking
  recommendations.push({
    type: 'network',
    title: 'Connect with the company',
    description: `Research ${job.company} employees on LinkedIn for networking opportunities`,
    priority: 'medium',
    action: 'View Company'
  })
  
  return recommendations
}

const getMarketComparison = (job) => {
  // Mock market data - in real app would fetch from API
  const similarJobs = filteredJobs.value.filter(j => 
    j.id !== job.id && 
    j.title.toLowerCase().includes(job.title.split(' ')[0].toLowerCase())
  )
  
  const salaryComparison = job.salary ? {
    position: 'competitive', // above/below/competitive
    percentile: 75,
    range: `$${parseInt(job.salary.replace(/\D/g, '')) * 0.9}k - $${parseInt(job.salary.replace(/\D/g, '')) * 1.1}k`
  } : null
  
  return {
    similarJobsCount: similarJobs.length,
    salaryComparison,
    demand: similarJobs.length > 10 ? 'high' : similarJobs.length > 5 ? 'medium' : 'low',
    growthTrend: 'positive' // positive/negative/stable
  }
}

const assessGrowthPotential = (job) => {
  let score = 50
  const factors = []
  
  // Gaming industry growth
  if ((job.gamingRelevance || 0) > 0.3) {
    score += 20
    factors.push('Gaming industry growth')
  }
  
  // Remote opportunities
  if (job.remote) {
    score += 10
    factors.push('Remote work flexibility')
  }
  
  // Tech stack relevance
  const modernTech = ['react', 'vue', 'typescript', 'python', 'unity', 'unreal']
  const hasModernTech = job.tags?.some(tag => 
    modernTech.includes(tag.toLowerCase())
  )
  if (hasModernTech) {
    score += 15
    factors.push('Modern technology stack')
  }
  
  return {
    score: Math.min(score, 100),
    level: score > 80 ? 'high' : score > 60 ? 'medium' : 'low',
    factors,
    timeframe: '2-3 years'
  }
}

const generateSkillSuggestions = (missingSkills) => {
  return missingSkills.slice(0, 3).map(skill => ({
    skill,
    resources: [
      { type: 'course', name: `${skill} Fundamentals`, provider: 'Online Course', url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}` },
      { type: 'practice', name: `${skill} Projects`, provider: 'GitHub', url: `https://github.com/search?q=${encodeURIComponent(skill)}+language:javascript` },
      { type: 'certification', name: `${skill} Certification`, provider: 'Industry', url: `https://www.google.com/search?q=${encodeURIComponent(skill)}+certification` }
    ]
  }))
}

// Add method to actually use the generated suggestions
const openLearningResource = (resource) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  }
}

// Job alert functionality
const createJobAlert = () => {
  if (!searchForm.value.query?.trim()) {
    alert('Please enter a search query to create an alert')
    return
  }
  
  const alert = {
    id: Date.now().toString(),
    query: searchForm.value.query,
    filters: { ...advancedFilters.value, ...quickFilters.value },
    created: new Date().toISOString(),
    active: true,
    lastNotified: null,
    jobsFound: 0
  }
  
  jobAlerts.value.push(alert)
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem('job_alerts', JSON.stringify(jobAlerts.value))
    alert('Job alert created successfully!')
  } catch {
    console.error('Failed to save job alert:', error)
  }
}

// autoSearchFromProfile is provided by the composable

const toggleInsights = (jobId) => {
  expandedInsights.value = expandedInsights.value === jobId ? null : jobId
}

const handleInsightAction = (action, job) => {
  switch (action) {
    case 'Open Resume Builder':
      router.push('/document-builder')
      break
    case 'Update Portfolio':
      router.push('/portfolio')
      break
    case 'Find Resources':
      // Open learning resources modal
      break
    case 'View Company':
      window.open(`https://linkedin.com/company/${job.company.toLowerCase().replace(/\s+/g, '-')}`, '_blank')
      break
  }
}

// Job Comparison Functions
const isInComparison = (jobId) => {
  return comparisonJobs.value.some(j => j.id === jobId)
}

const toggleComparison = (job) => {
  const index = comparisonJobs.value.findIndex(j => j.id === job.id)
  if (index >= 0) {
    comparisonJobs.value.splice(index, 1)
  } else if (comparisonJobs.value.length < 3) {
    comparisonJobs.value.push(job)
  }
  
  if (comparisonJobs.value.length >= 2) {
    showJobComparison.value = true
  }
}

const removeFromComparison = (jobId) => {
  comparisonJobs.value = comparisonJobs.value.filter(j => j.id !== jobId)
  if (comparisonJobs.value.length < 2) {
    showJobComparison.value = false
  }
}

const clearComparison = () => {
  comparisonJobs.value = []
  showJobComparison.value = false
}

const compareJobs = (jobs) => {
  return {
    salaries: jobs.map(j => j.salary || 'Not specified'),
    locations: jobs.map(j => j.location),
    types: jobs.map(j => j.type || 'Not specified'),
    skills: {
      common: getCommonSkills(jobs),
      unique: getUniqueSkills(jobs)
    },
    benefits: jobs.map(j => j.benefits || []),
    companies: jobs.map(j => ({
      name: j.company,
      size: j.companySize || 'Unknown',
      industry: j.industry || 'Unknown'
    }))
  }
}

const getCommonSkills = (jobs) => {
  const allSkills = jobs.flatMap(j => j.tags || [])
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(skillCounts)
    .filter(([, count]) => count === jobs.length)
    .map(([skill]) => skill)
}

const getUniqueSkills = (jobs) => {
  return jobs.map(job => ({
    jobId: job.id,
    skills: (job.tags || []).filter(tag => 
      !jobs.some(otherJob => 
        otherJob.id !== job.id && (otherJob.tags || []).includes(tag)
      )
    )
  }))
}

// Bulk Operations Functions
const toggleJobSelection = (jobId) => {
  if (selectedJobIds.value.has(jobId)) {
    selectedJobIds.value.delete(jobId)
  } else {
    selectedJobIds.value.add(jobId)
  }
  selectedJobIds.value = new Set(selectedJobIds.value) // Trigger reactivity
}

const bulkSaveJobs = async () => {
  const jobs = Array.from(selectedJobIds.value)
    .map(id => filteredJobs.value.find(j => j.id === id))
    .filter(Boolean)
  
  try {
    for (const job of jobs) {
      await saveJob(job)
    }
    selectedJobIds.value.clear()
  } catch {
    console.error('Bulk save failed:', error)
  }
}

const bulkCompareJobs = () => {
  const jobs = Array.from(selectedJobIds.value)
    .map(id => filteredJobs.value.find(j => j.id === id))
    .filter(Boolean)
    .slice(0, 3) // Limit to 3 jobs
  
  comparisonJobs.value = jobs
  showJobComparison.value = true
  selectedJobIds.value.clear()
}

const bulkExportJobs = () => {
  const jobs = Array.from(selectedJobIds.value)
    .map(id => filteredJobs.value.find(j => j.id === id))
    .filter(Boolean)
  
  const exportData = jobs.map(job => ({
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    type: job.type,
    url: job.url,
    tags: job.tags?.join(', '),
    description: job.description
  }))
  
  const csv = convertToCSV(exportData)
  downloadCSV(csv, 'selected_jobs.csv')
  selectedJobIds.value.clear()
}

const convertToCSV = (data) => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => 
      JSON.stringify(row[header] || '')
    ).join(','))
  ].join('\n')
  
  return csv
}

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Quick Actions Functions
const quickApply = async (job) => {
  if (!canQuickApply(job)) return
  
  loadingStates.value.set(job.id, 'applying')
  
  try {
    // In a real app, this would submit application via API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Track application
    const applications = JSON.parse(localStorage.getItem('job_applications') || '[]')
    applications.push({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      status: 'submitted'
    })
    localStorage.setItem('job_applications', JSON.stringify(applications))
    
    // Show success notification
    jobNotifications.value.set(job.id, {
      type: 'success',
      message: 'Application submitted successfully!',
      timestamp: Date.now()
    })
    
    // Auto-clear notification
    setTimeout(() => {
      jobNotifications.value.delete(job.id)
    }, 5000)
    
  } catch {
    jobNotifications.value.set(job.id, {
      type: 'error',
      message: 'Failed to submit application. Please try the direct link.',
      timestamp: Date.now()
    })
  } finally {
    loadingStates.value.delete(job.id)
  }
}

const canQuickApply = (job) => {
  // Check if job supports quick apply (mock logic)
  const quickApplyProviders = ['greenhouse', 'lever', 'workday']
  return quickApplyProviders.some(provider => 
    job.url?.includes(provider) || job.provider === provider
  )
}

const shareJob = async (job) => {
  const shareData = {
    title: `${job.title} at ${job.company}`,
    text: `Check out this ${job.title} position at ${job.company}`,
    url: job.url
  }
  
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(job.url)
      jobNotifications.value.set(job.id, {
        type: 'success',
        message: 'Job link copied to clipboard!',
        timestamp: Date.now()
      })
      
      setTimeout(() => {
        jobNotifications.value.delete(job.id)
      }, 3000)
    }
  } catch (error) {
    console.error('Share failed:', error)
  }
}

// Real-time Updates Functions
const updateJobStatus = (jobId, status) => {
  const job = filteredJobs.value.find(j => j.id === jobId)
  if (job) {
    job.status = status
    job.lastUpdated = new Date().toISOString()
  }
}

const addJobNotification = (jobId, notification) => {
  jobNotifications.value.set(jobId, notification)
  
  // Auto-clear after delay
  setTimeout(() => {
    jobNotifications.value.delete(jobId)
  }, notification.duration || 5000)
}

// Helper Functions
const calculateSkillAlignment = (job, profile) => {
  const jobSkills = (job.tags || []).map(s => s.toLowerCase())
  const userSkills = Array.isArray(profile.skills) 
    ? profile.skills.map(s => s.toLowerCase())
    : []
  
  if (jobSkills.length === 0) return 0
  
  const matchedSkills = jobSkills.filter(skill => userSkills.includes(skill))
  return matchedSkills.length / jobSkills.length
}

const getCompanyInitials = (companyName) => {
  return companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const onLogoError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

const formatJobType = (type) => {
  const types = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'freelance': 'Freelance',
    'intern': 'Internship',
    'temporary': 'Temporary'
  }
  return types[type?.toLowerCase()] || type
}

const getRelativeTime = (dateString) => {
  if (!dateString) return 'Recently'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return 'Yesterday'
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  
  return date.toLocaleDateString()
}

const truncateDescription = (description, maxLength = 150) => {
  if (!description || description.length <= maxLength) return description
  return description.substring(0, maxLength).trim() + '...'
}

const getJobFreshness = (job) => { // Fixed function access
  if (!job?.posted) return null
  
  const posted = new Date(job.posted)
  const now = new Date()
  const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60))
  
  if (diffInHours < 2) {
    return { type: 'hot', label: 'Just Posted', icon: 'FireIcon' }
  } else if (diffInHours < 24) {
    return { type: 'fresh', label: 'New Today', icon: 'StarIcon' }
  } else if (diffInHours < 72) {
    return { type: 'recent', label: 'Recent', icon: 'ClockIcon-outline' }
  }
  
  return null
}

// Enhanced Gaming Skills Helper Functions
const getSkillMatchPercentage = (job) => {
  const requiredSkills = job.tags || []
  const matchedSkills = requiredSkills.filter(skill => isUserSkill(skill))
  return Math.round((matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100)
}

const getSkillMatchLevel = (job) => {
  const percentage = getSkillMatchPercentage(job)
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'poor'
}

const isCriticalGamingSkill = (skill) => {
  const criticalSkills = [
    'unity', 'unreal', 'c++', 'c#', 'python', 'lua', 'glsl', 'hlsl',
    'maya', 'blender', '3ds max', 'substance', 'zbrush', 
    'gameplay programming', 'graphics programming', 'engine programming',
    'level design', 'game design', 'narrative design', 'technical art'
  ]
  return criticalSkills.some(critical => skill.toLowerCase().includes(critical))
}

const isProgrammingSkill = (skill) => {
  const programmingSkills = ['c++', 'c#', 'python', 'javascript', 'lua', 'java', 'kotlin', 'swift', 'programming']
  return programmingSkills.some(prog => skill.toLowerCase().includes(prog))
}

const isDesignSkill = (skill) => {
  const designSkills = ['design', 'art', 'ui', 'ux', 'photoshop', 'maya', 'blender', 'zbrush', 'substance']
  return designSkills.some(design => skill.toLowerCase().includes(design))
}

const getSkillIcon = (skill) => {
  const skillLower = skill.toLowerCase()
  if (skillLower.includes('unity')) return 'mdi-unity'
  if (skillLower.includes('unreal')) return 'mdi-unreal'
  if (skillLower.includes('c++') || skillLower.includes('c#')) return 'mdi-language-cpp'
  if (skillLower.includes('python')) return 'mdi-language-python'
  if (skillLower.includes('javascript')) return 'mdi-language-javascript'
  if (skillLower.includes('design')) return 'SwatchIcon'
  if (skillLower.includes('art')) return 'PaintBrushIcon'
  if (skillLower.includes('programming')) return 'mdi-code-braces'
  if (skillLower.includes('maya') || skillLower.includes('blender')) return 'mdi-cube-outline'
  if (skillLower.includes('multiplayer') || skillLower.includes('network')) return 'mdi-lan'
  return 'mdi-cog'
}

const getSkillTooltip = (skill) => {
  if (isUserSkill(skill)) return `✓ You have this skill! Great match for this role.`
  if (isCriticalGamingSkill(skill)) return `StarIcon Critical gaming skill - high priority for this role`
  return `Consider learning ${skill} to improve your match for this role`
}

const hasSkillGaps = (job) => {
  const profile = unifiedProfile.jobSearchProfile.value
  const skillGaps = identifySkillGaps(job, profile)
  return skillGaps.missing.length > 0
}

const getCriticalSkillGaps = (job) => {
  const profile = unifiedProfile.jobSearchProfile.value
  const skillGaps = identifySkillGaps(job, profile)
  return skillGaps.critical || []
}

const navigateToSkillMapper = (job) => {
  // Store job context for skill mapper
  localStorage.setItem('skillMapperContext', JSON.stringify({
    jobTitle: job.title,
    requiredSkills: job.tags,
    company: job.company
  }))
  router.push('/skill-mapper')
}

const startInterviewPrep = (job) => {
  // Store job context for interview prep
  localStorage.setItem('interviewPrepContext', JSON.stringify({
    jobTitle: job.title,
    company: job.company,
    skills: job.tags,
    description: job.description
  }))
  router.push('/interview-prep')
}

const isUserSkill = (skill) => {
  const profile = unifiedProfile.jobSearchProfile.value
  const userSkills = Array.isArray(profile.skills) ? profile.skills.map(s => s.toLowerCase()) : []
  return userSkills.includes(skill.toLowerCase())
}

const extractSalaryNumber = (salaryString) => {
  if (!salaryString) return 0
  const numbers = salaryString.match(/[\d,]+/g)
  if (!numbers) return 0
  return parseInt(numbers[0].replace(/,/g, '')) || 0
}

const getMatchScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 60) return 'score-fair'
  return 'score-low'
}

// AI Analysis modal state
const showAIAnalysis = ref(false)
const aiAnalyzing = ref(false)
const aiMatchData = ref(null)
const aiSalaryData = ref(null)
const aiInsightsData = ref(null)
const aiMode = ref('match')
const appStore = useAppStore()
const { setPageContext, clearPageContext } = usePageAssistantContext()

// Real-time job service state
const jobAlerts = ref([])
const newJobNotifications = ref([])
const realTimeStats = ref({})
const showJobAlerts = ref(false)

// Search form
const searchForm = ref({
  query: '',
  location: '',
  type: '',
  datePosted: 'all',
  gamingOnly: false,
  savedJobsOnly: false,
  remote: false
})

// Computed properties
const {
  jobs: _jobs,
  filteredJobs,
  savedJobs,
  totalJobs,
  gamingJobsCount,
  averageSalary,
  topMatches,
  profileSuggestions,
  isLoading,
  isSearching,
  error,
  lastUpdated,
  searchJobs: performSearch,
  autoSearchFromProfile,
  saveJob,
  unsaveJob,
  isJobSaved,
  getProviderStatus
} = jobBoard

  const providerStatus = computed(() => getProviderStatus())
  const providerCount = computed(() => Object.keys(providerStatus.value).filter(p => providerStatus.value[p].enabled).length)
  
  // Collapsible sections
  const showQuickFilters = ref(true)
  const showAdvancedFilters = ref(false)

const sortedJobs = computed(() => {
  const jobs = [...filteredJobs.value]
  
  switch (sortBy.value) {
    case 'date':
      return jobs.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate) : new Date(0)
        const dateB = b.postedDate ? new Date(b.postedDate) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
    case 'salary':
      return jobs.sort((a, b) => {
        const salaryA = extractSalaryNumber(a.salary)
        const salaryB = extractSalaryNumber(b.salary)
        return salaryB - salaryA
      })
    case 'company':
      return jobs.sort((a, b) => a.company.localeCompare(b.company))
    default: // relevance
      return jobs // Already sorted by relevance in useJobBoard
  }
})

// Quick filters (local-only refinement without extra API calls)
const quickFilters = ref({
  seniority: '', // 'junior' | 'mid' | 'senior' | 'lead'
  jobType: '',   // 'full-time' | 'contract' | 'part-time' | 'internship'
  salaryMin: 0
})

// View + pagination state
const viewMode = ref('grid') // 'grid' | 'list'
const resultsPerPage = ref(25)
const currentPage = ref(1)

// Advanced local-only refinements
const advancedFilters = ref({
  onlyWithSalary: false,
  excludeInternships: false,
  companyIncludes: ''
})

const activeQuickFilters = computed(() => {
  const items = []
  if (quickFilters.value.seniority) items.push({ key: 'seniority', label: capitalize(quickFilters.value.seniority), icon: 'UserIcon-badge' })
  if (quickFilters.value.jobType) items.push({ key: 'jobType', label: formatJobType(quickFilters.value.jobType), icon: 'mdi-briefcase' })
  if (quickFilters.value.salaryMin) items.push({ key: 'salaryMin', label: `≥ $${quickFilters.value.salaryMin/1000}k`, icon: 'mdi-cash' })
  return items
})

const capitalize = (s = '') => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const clearQuickFilter = (key) => { quickFilters.value[key] = key === 'salaryMin' ? 0 : '' }
const clearAllQuickFilters = () => { quickFilters.value = { seniority: '', jobType: '', salaryMin: 0 } }

// Hidden jobs (persist locally)
const hiddenJobIds = ref(new Set())
const HIDDEN_KEY = 'navi_hidden_jobs'

onMounted(() => {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY)
    if (raw) hiddenJobIds.value = new Set(JSON.parse(raw))
  } catch {}
})

// Build and push page assistant context for this view
function pushAssistantContext() {
  const ctx = {
    page: 'jobs',
    searchQuery: searchForm.value.query || '',
    location: searchForm.value.location || '',
    type: searchForm.value.type || '',
    datePosted: searchForm.value.datePosted || 'all',
    gamingOnly: !!searchForm.value.gamingOnly,
    savedJobsOnly: !!searchForm.value.savedJobsOnly,
    remote: !!searchForm.value.remote,
    quickFilters: { ...quickFilters },
    advancedFilters: { ...advancedFilters },
    viewMode: viewMode.value,
    resultsPerPage: resultsPerPage.value,
    totals: {
      totalJobs: totalJobs.value,
      gamingJobs: gamingJobsCount.value,
      topMatches: topMatches.value.length,
      providersActive: providerCount.value,
    },
    selectedJob: selectedJob.value ? {
      id: selectedJob.value.id,
      title: selectedJob.value.title,
      company: selectedJob.value.company,
      location: selectedJob.value.location,
    } : null,
  }
  setPageContext(ctx)
}

onMounted(pushAssistantContext)
watch([
  () => searchForm.value.query,
  () => searchForm.value.location,
  () => searchForm.value.type,
  () => searchForm.value.datePosted,
  () => searchForm.value.gamingOnly,
  () => searchForm.value.savedJobsOnly,
  () => searchForm.value.remote,
  () => quickFilters.value.seniority,
  () => quickFilters.value.jobType,
  () => quickFilters.value.salaryMin,
  () => advancedFilters.value.companyIncludes,
  () => advancedFilters.value.onlyWithSalary,
  () => advancedFilters.value.excludeInternships,
  viewMode,
  resultsPerPage,
  selectedJob,
], pushAssistantContext, { deep: false })

onUnmounted(() => { clearPageContext() })

watch(hiddenJobIds, (set) => {
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(set))) } catch {}
}, { deep: true })

const hideJob = (id) => { hiddenJobIds.value.add(id) }
const clearHiddenJobs = () => { hiddenJobIds.value.clear() }

// Final display list after local filters
const displayJobs = computed(() => {
  let list = sortedJobs.value.filter(j => !hiddenJobIds.value.has(j.id))

  // Saved-only refinement if composable didn’t apply it
  if (searchForm.value.savedJobsOnly) list = list.filter(j => isJobSaved(j.id))

  // Quick filters
  if (quickFilters.value.jobType) {
    const jt = quickFilters.value.jobType
    list = list.filter(j => (j.type || '').toLowerCase().includes(jt))
  }
  if (quickFilters.value.seniority) {
    const s = quickFilters.value.seniority
    const pat = s === 'junior' ? /(junior|entry|level\s*1)/i
              : s === 'mid' ? /(mid|intermediate|level\s*2)/i
              : s === 'senior' ? /(senior|sr\.|lead|principal|staff|level\s*[34])/i
              : /(lead|principal|staff)/i
    list = list.filter(j => pat.test(j.title || '') || pat.test(j.description || ''))
  }
  if (quickFilters.value.salaryMin) {
    list = list.filter(j => extractSalaryNumber(j.salary) >= quickFilters.value.salaryMin)
  }

  // Advanced refinements
  if (advancedFilters.value.onlyWithSalary) {
    list = list.filter(j => !!extractSalaryNumber(j.salary))
  }
  if (advancedFilters.value.excludeInternships) {
    list = list.filter(j => !/(intern|internship)/i.test(`${j.title || ''} ${j.type || ''}`))
  }
  if (advancedFilters.value.companyIncludes?.trim()) {
    const q = advancedFilters.value.companyIncludes.trim().toLowerCase()
    list = list.filter(j => (j.company || '').toLowerCase().includes(q))
  }

  return list
})

// Visible page slice with pagination
const visibleJobs = computed(() => {
  const start = (currentPage.value - 1) * resultsPerPage.value
  const end = start + resultsPerPage.value
  return displayJobs.value.slice(start, end)
})

// Methods
const searchJobs = async () => {
  const base = { ...searchForm.value }
  if (!base.query && !base.location) {
    base.query = 'game'
  }
  await performSearch(base)
}

const setQuickSearch = (suggestion) => {
  searchForm.value.query = suggestion
  searchJobs()
}

const toggleGamingFilter = () => {
  searchForm.value.gamingOnly = !searchForm.value.gamingOnly
  searchJobs()
}

const toggleSavedJobsFilter = () => {
  searchForm.value.savedJobsOnly = !searchForm.value.savedJobsOnly
  searchJobs()
}

const toggleRemoteFilter = () => {
  searchForm.value.remote = !searchForm.value.remote
  searchJobs()
}

const clearFilters = () => {
  searchForm.value = {
    query: '',
    location: '',
    type: '',
    datePosted: 'all',
    gamingOnly: false,
    savedJobsOnly: false,
    remote: false
  }
  searchJobs()
}

const refreshJobs = async () => {
  refreshing.value = true
  try {
    // Force refresh with current search parameters
    await searchJobs()
    console.log('Jobs refreshed:', {
      total: totalJobs.value,
      filtered: filteredJobs.value.length,
      providers: Object.keys(providerStatus.value).length
    })
  } finally {
    refreshing.value = false
  }
}

// Auto-search on mount to populate initial data
const initializeJobSearch = async () => {
  // If we have profile data, use it for initial search
  if (unifiedProfile.jobSearchProfile.value) {
    await autoSearchFromProfile()
  } else {
    // Otherwise do a general gaming industry search
    searchForm.value.query = 'game developer'
    searchForm.value.gamingOnly = true
    await performSearch()
  }
}

const toggleSaveJob = async (job) => {
  if (isJobSaved(job.id)) {
    await unsaveJob(job.id)
  } else {
    await saveJob(job)
  }
}

const viewJobDetails = (job) => {
  selectedJob.value = job
}

// Event handlers for JobResultsGrid
const handleJobApply = async (job) => {
  // Existing applyToJob logic or new implementation
  console.log('Applying to job:', job.title)
  // You can add actual apply logic here
}

const handleJobSave = (job) => {
  // Use existing save functionality
  toggleSaveJob(job)
}

const handleAddToCompare = (job) => {
  // Use existing comparison functionality
  toggleComparison(job)
}

const handleShareJob = async (job) => {
  // Use existing share functionality
  await shareJob(job)
}

const handleReportJob = (job) => {
  console.log('Reporting job:', job.title)
  // Add report functionality here
}

// Trigger AI analysis for the currently selected job
const analyzeSelectedJob = async (mode = 'match') => {
  if (!selectedJob.value) return
  // Require API key for AI features
  if (!appStore.settings?.geminiApiKey) {
    alert('Add your Gemini API key in Settings to enable AI analysis.')
    return
  }
  aiMode.value = mode
  aiAnalyzing.value = true
  try {
    // Analyze match (uses heuristics and profile)
    const matches = await aiJobService.analyzeJobMatches([selectedJob.value])
    aiMatchData.value = matches && matches[0] ? matches[0] : null

    // Predict salary and gather insights
    aiSalaryData.value = await aiJobService.predictSalary(selectedJob.value)
    aiInsightsData.value = await aiJobService.analyzeJobInsights(selectedJob.value)

    showAIAnalysis.value = true
  } catch (e) {
    console.warn('AI analysis failed:', e)
    alert('AI analysis failed. Please try again later.')
  } finally {
    aiAnalyzing.value = false
  }
}

const handleItemsPerPageChange = (newSize) => {
  resultsPerPage.value = newSize
  currentPage.value = 1 // Reset to first page when changing page size
}

const loadMoreJobs = () => {
  // For backwards compatibility - just go to next page
  if (currentPage.value * resultsPerPage.value < displayJobs.value.length) {
    currentPage.value += 1
  }
}

// Persist view/paging preferences
const PREFS_KEY = 'navi_job_results_prefs'

onMounted(async () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      const prefs = JSON.parse(raw)
      if (prefs && (prefs.viewMode === 'grid' || prefs.viewMode === 'list')) {
        viewMode.value = prefs.viewMode
      }
      const size = parseInt(prefs?.resultsPerPage, 10)
      if (!Number.isNaN(size) && size > 0) {
        resultsPerPage.value = size
      }
      const page = parseInt(prefs?.currentPage, 10)
      if (!Number.isNaN(page) && page > 0) {
        currentPage.value = page
      }
    }
  } catch {}

  // Initialize job search to populate data
  await initializeJobSearch()
})

watch([viewMode, resultsPerPage, currentPage], ([mode, size, page]) => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ viewMode: mode, resultsPerPage: size, currentPage: page })) } catch {}
})

// Persist collapsible panel UI state (independent key to avoid overwrites)
const FILTER_UI_KEY = 'navi_job_filters_ui'

onMounted(() => {
  try {
    const raw = localStorage.getItem(FILTER_UI_KEY)
    if (raw) {
      const ui = JSON.parse(raw)
      if (typeof ui?.showQuickFilters === 'boolean') showQuickFilters.value = ui.showQuickFilters
      if (typeof ui?.showAdvancedFilters === 'boolean') showAdvancedFilters.value = ui.showAdvancedFilters
    }
  } catch {}
})

watch([showQuickFilters, showAdvancedFilters], ([q, a]) => {
  try { localStorage.setItem(FILTER_UI_KEY, JSON.stringify({ showQuickFilters: q, showAdvancedFilters: a })) } catch {}
})

// Debounced search on query change
const debouncedSearch = useDebounceFn(() => searchJobs(), 400)
watch(() => searchForm.value.query, () => debouncedSearch())

// Reset to first page when search criteria change
watch([
  () => searchForm.value.query,
  () => searchForm.value.location,
  () => searchForm.value.type,
  () => searchForm.value.datePosted,
  () => searchForm.value.gamingOnly,
  () => searchForm.value.savedJobsOnly,
  () => searchForm.value.remote,
  () => quickFilters.value.seniority,
  () => quickFilters.value.jobType,
  () => quickFilters.value.salaryMin,
  () => advancedFilters.value.companyIncludes,
  () => advancedFilters.value.onlyWithSalary,
  () => advancedFilters.value.excludeInternships
], () => {
  currentPage.value = 1 // Reset to first page when filters change
})

// Highlight search matches in text
const escapeHtml = (s = '') => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const highlight = (text = '') => {
  const q = (searchForm.value.query || '').trim()
  if (!q) return escapeHtml(text)
  const words = Array.from(new Set(q.split(/\s+/).filter(Boolean))).slice(0, 6)
  if (!words.length) return escapeHtml(text)
  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return escapeHtml(text).replace(pattern, '<mark>$1</mark>')
}

// Export utility functions for child components to use
defineExpose({
  getAIInsights,
  generateSkillSuggestions,
  openLearningResource,
  createJobAlert,
  toggleInsights,
  handleInsightAction,
  isInComparison,
  toggleComparison,
  removeFromComparison,
  clearComparison,
  compareJobs,
  toggleJobSelection,
  bulkSaveJobs,
  bulkCompareJobs,
  bulkExportJobs,
  quickApply,
  updateJobStatus,
  addJobNotification,
  getCompanyInitials,
  onLogoError,
  truncateDescription,
  getJobFreshness,
  getSkillMatchLevel,
  isProgrammingSkill,
  isDesignSkill,
  getSkillIcon,
  getSkillTooltip,
  hasSkillGaps,
  getCriticalSkillGaps,
  navigateToSkillMapper,
  startInterviewPrep,
  getMatchScoreClass,
  hideJob,
  visibleJobs,
  loadMoreJobs,
  highlight
})

</script>

<style scoped>
/* Compact Provider Status Styling */
.provider-status-inline {
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.provider-card-compact {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  padding: var(--spacing-2);
  transition: all var(--duration-fast) var(--easing-ease);
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.provider-card-compact.active {
  border-color: var(--color-success-300);
  background: var(--color-success-50);
}

.provider-card-compact .provider-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: 2px;
}

.provider-card-compact .provider-status {
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* Empty State Styling */
.empty-icon {
  font-size: 3rem;
  color: var(--text-tertiary);
  opacity: 0.6;
}

/* Compact, responsive filter grid */
.filters-grid {
  display: grid;
  gap: var(--spacing-2);
  align-items: end;
}

.filter-item .form-label.small { margin-bottom: 4px; font-size: 0.85rem; color: var(--text-secondary); }
.filter-input { min-height: 38px; padding: 8px 10px; }

.filter-actions :deep(.unified-button),
.filter-actions :deep(button),
.filter-actions .btn { width: 100%; }

@media (max-width: 1024px) {
  .filter-actions { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .filter-actions { grid-column: 1 / -1; }
}

/* Collapsible filter sections */
.filter-section {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-sm);
}

.filter-section + .filter-section { margin-top: var(--spacing-2); }

.filter-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}

.filter-section-header .header-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.filter-section-header:hover {
  background: var(--glass-hover-bg);
}

.filter-section-header .toggle-icon { opacity: 0.7; }

.filter-section-body { padding: 10px 12px 12px; }

/* Results toolbar + compact sort */
.results-toolbar {
  display: grid;
  gap: var(--spacing-2);
  align-items: end;
}

.results-actions { display: flex; gap: var(--spacing-2); align-items: center; }
.sort-select { min-width: 210px; min-height: 34px; padding: 6px 10px; }
.per-page-select { min-width: 140px; min-height: 34px; padding: 6px 10px; }
.view-toggle { display: inline-flex; gap: 6px; }
.view-toggle .btn { min-height: 34px; display: inline-flex; align-items: center; gap: 6px; }

@media (max-width: 640px) {
  .results-actions { justify-content: flex-start; }
  .sort-select, .per-page-select { min-width: 100%; }
}

/* Compact active filters */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary-600);
  font-size: 12px;
}

/* List view forces single column */
.job-grid.list-view { grid-template-columns: 1fr !important; }

.filter-pill .clear-filter {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.live-job-board {
  max-width: 100%;
  margin: 0 auto;
}

.glass-card {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.job-board-header {
  position: relative;
  overflow: hidden;
}

.header-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--surface-elevated) 70%, transparent);
  min-width: 80px;
}

.stat-card.gaming {
  background: rgba(0, 255, 136, 0.1);
  color: var(--color-gaming-400);
}

.stat-number {
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xs);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-suggestions {
  margin-top: var(--spacing-sm);
}

.job-grid {
  display: grid;
  gap: var(--spacing-md);
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: var(--glass-surface-strong, var(--surface-elevated));
  border: 1px solid var(--border-base);
  font-size: var(--font-size-sm);
}

.filter-pill .clear-filter {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.quick-chips .chip {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-base);
  background: var(--surface-elevated);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.quick-chips .chip.active {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
}

.quick-chips .chip-label { align-self: center; }
.quick-chips .chip-sep { opacity: 0.5; align-self: center; }

/* Enhanced Job Card Styling */
.enhanced-job-card {
  position: relative;
  transition: all var(--duration-normal) var(--easing-ease);
  cursor: pointer;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
}

.enhanced-job-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-primary-subtle);
  opacity: 0.4;
  pointer-events: none;
}

.enhanced-job-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-2xl);
  border-color: var(--glass-border-highlight);
}

.enhanced-job-card.gaming-job {
  border-l: 4px solid var(--color-gaming);
  background: linear-gradient(135deg, 
    var(--glass-bg) 0%, 
    rgba(0, 255, 136, 0.03) 100%
  );
}

.enhanced-job-card.gaming-job:hover {
  box-shadow: 
    var(--shadow-2xl),
    0 0 20px rgba(0, 255, 136, 0.1);
}

.enhanced-job-card.saved-job {
  border-r: 4px solid var(--color-primary);
  background: linear-gradient(135deg, 
    var(--glass-bg) 0%, 
    rgba(59, 130, 246, 0.03) 100%
  );
}

.enhanced-job-card.top-match {
  border-t: 3px solid var(--color-success);
  background: linear-gradient(135deg, 
    var(--glass-bg) 0%, 
    rgba(34, 197, 94, 0.03) 100%
  );
}

/* Enhanced Job Header */
.enhanced-job-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

/* Priority Indicators */
.priority-indicators {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  min-height: 20px;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  transition: all var(--duration-fast) var(--easing-ease);
}

.priority-badge.top-match {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success-border);
}

.priority-badge.gaming {
  background: var(--color-gaming-bg);
  color: var(--color-gaming);
  border-color: var(--color-gaming-border);
}

.priority-badge.remote {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-color: var(--color-info-border);
}

/* Header Main Content */
.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.header-left {
  display: flex;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

/* Company Logo Section */
.company-logo-section {
  flex-shrink: 0;
}

.company-logo-wrapper,
.company-logo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
}

.company-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--text-primary-600);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
}

/* Job Title Section */
.job-title-section {
  flex: 1;
  min-width: 0;
}

.enhanced-job-title {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  color: var(--text-primary-600);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--spacing-2) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-company-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.enhanced-company-name {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-primary);
}

.job-location-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-start;
}

.action-group {
  display: flex;
  gap: var(--spacing-1);
}

.primary-actions {
  gap: var(--spacing-2);
}

.apply-btn {
  min-width: 80px;
}

/* Enhanced Job Content */
.enhanced-job-content {
  margin-bottom: var(--spacing-4);
}

/* Job Metrics */
.job-metrics {
  display: grid;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.metric-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-highlight);
}

.metric-card .app-icon {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.metric-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.salary-metric .app-icon {
  color: var(--color-success);
}

.type-metric .app-icon {
  color: var(--color-info);
}

.date-metric .app-icon {
  color: var(--color-warning);
}

/* Job Description */
.job-description-section {
  margin-bottom: var(--spacing-4);
}

.enhanced-job-description {
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced Skills Section */
.enhanced-skills-section {
  margin-bottom: var(--spacing-4);
}

.skills-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.skills-title {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skills-header .app-icon {
  color: var(--color-info);
  font-size: var(--font-size-base);
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.enhanced-skill-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  color: var(--text-primary-600);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease);
  white-space: nowrap;
}

.enhanced-skill-tag:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-highlight);
  transform: translateY(-1px);
}

.enhanced-skill-tag.user-skill {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success-border);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.2);
}

.skill-match-icon {
  font-size: var(--font-size-xs);
  color: var(--color-success);
}

.more-skills-indicator {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--surface-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-style: italic;
}

/* Enhanced Job Footer */
.enhanced-job-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-3);
  border-t: 1px solid var(--glass-border);
  margin-top: var(--spacing-3);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.source-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.source-info .app-icon {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.source-label {
  font-weight: var(--font-weight-medium);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

/* Match Score */
.match-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.score-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 2px solid;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  transition: all var(--duration-fast) var(--easing-ease);
}

.score-indicator.score-excellent {
  background: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success);
}

.score-indicator.score-good {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.score-indicator.score-fair {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.score-indicator.score-low {
  background: var(--color-error-bg);
  border-color: var(--color-error);
  color: var(--color-error);
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Highlight mark */
:deep(mark) {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  padding: 1px 3px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary-border);
}

.company-name {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.logo-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: var(--border-radius-sm);
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-item.remote {
  color: var(--color-info-600);
  font-weight: var(--font-weight-medium);
}

.meta-item.salary {
  color: var(--color-success-600);
  font-weight: var(--font-weight-medium);
}

.job-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin: 0;
}

.job-tags .badge { font-size: var(--font-size-xs); padding: 2px 8px; }

.job-footer {
  border-t: 1px solid var(--border-subtle);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.badge.bg-gaming {
  background-color: var(--color-gaming-500) !important;
  color: var(--text-inverse);
}

.provider-card {
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
}

.provider-card.active {
  border-color: var(--color-success-500);
  background: rgba(34, 197, 94, 0.1);
}

.provider-name {
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.provider-status {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.empty-state {
  padding: var(--spacing-xl);
}

.empty-icon {
  opacity: 0.3;
}

.loading-indicator {
  display: inline-flex;
  align-items: center;
}

/* Enhanced Responsive Design */

/* Large screens (1200px+) */
@media (min-width: 1200px) {
  .job-grid {
    gap: var(--spacing-5);
  }
  
  .enhanced-job-card {
    padding: var(--spacing-6);
  }
  
  /* Grid utility handles responsive behavior */
}

/* Medium screens (768px - 1199px) */
@media (max-width: 1199px) and (min-width: 768px) {
  .job-grid {
    gap: var(--spacing-4);
  }
  
  .header-main {
    gap: var(--spacing-3);
  }
  
  .header-actions {
    gap: var(--spacing-2);
  }
  
  .action-group.secondary-actions {
    flex-direction: column;
    gap: var(--spacing-1);
  }
}

/* Small screens (481px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .job-grid {
    gap: var(--spacing-3);
  }
  
  .enhanced-job-card {
    padding: var(--spacing-4);
  }
  
  .header-main {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .header-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--spacing-2);
  }
  
  .action-group {
    display: flex;
    flex-wrap: wrap;
  }
  
  .job-metrics {
    gap: var(--spacing-2);
  }
  
  .metric-card {
    padding: var(--spacing-2);
  }
  
  .enhanced-job-footer {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: flex-start;
  }
  
  .header-stats {
    gap: var(--spacing-2);
  }
}

/* Extra small screens (480px and below) */
@media (max-width: 480px) {
  .job-grid {
    gap: var(--spacing-2);
  }
  
  .enhanced-job-card {
    padding: var(--spacing-3);
    border-radius: var(--radius-lg);
  }
  
  .priority-indicators {
    gap: var(--spacing-1);
  }
  
  .priority-badge {
    font-size: var(--font-size-2xs);
    padding: 2px var(--spacing-1);
  }
  
  .company-logo-wrapper,
  .company-logo-placeholder {
    width: 40px;
    height: 40px;
  }
  
  .enhanced-job-title {
    font-size: var(--font-size-lg);
  }
  
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: stretch;
  }
  
  .action-group.primary-actions {
    order: 1;
  }
  
  .action-group.secondary-actions {
    order: 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .apply-btn {
    width: 100%;
    justify-content: center;
  }
  
  .job-metrics {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
  
  .metric-card {
    padding: var(--spacing-2);
    gap: var(--spacing-2);
  }
  
  .skills-tags {
    gap: var(--spacing-1);
  }
  
  .enhanced-skill-tag {
    font-size: var(--font-size-2xs);
    padding: 2px var(--spacing-2);
  }
  
  .enhanced-job-footer {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: center;
    text-align: center;
  }
  
  .score-indicator {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-2xs);
  }
  
  .header-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
  
  .stat-card {
    padding: var(--spacing-2);
    min-width: auto;
  }
  
  .job-board-header .section-header {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .enhanced-job-card {
    transition: none;
  }
  
  .enhanced-job-card:hover {
    transform: none;
  }
  
  .enhanced-skill-tag:hover {
    transform: none;
  }
  
  .metric-card:hover {
    background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
    border-color: var(--glass-border);
  }
  
  /* Larger touch targets */
  .priority-badge {
    min-height: 32px;
    padding: var(--spacing-1) var(--spacing-3);
  }
  
  .enhanced-skill-tag {
    min-height: 28px;
    padding: var(--spacing-1) var(--spacing-3);
  }
}

/* Dark theme responsive adjustments */
@media (max-width: 768px) {
  [data-theme="dark"] .enhanced-job-card {
    background: rgba(15, 15, 15, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  [data-theme="dark"] .metric-card {
    background: rgba(20, 20, 20, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  [data-theme="dark"] .enhanced-skill-tag {
    background: rgba(25, 25, 25, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Gaming theme responsive enhancements */
@media (max-width: 768px) {
  .theme-gaming .enhanced-job-card.gaming-job {
    background: linear-gradient(135deg, 
      rgba(15, 15, 15, 0.95) 0%, 
      rgba(20, 35, 25, 0.95) 100%
    );
    border-l-color: rgba(0, 255, 136, 0.6);
  }
  
  .theme-gaming .priority-badge.gaming {
    background: rgba(0, 255, 136, 0.15);
    border-color: rgba(0, 255, 136, 0.3);
  }
}

/* List view responsive adjustments */
@media (max-width: 768px) {
  .job-grid.list-view .enhanced-job-card {
    padding: var(--spacing-3);
  }
  
  .job-grid.list-view .header-main {
    gap: var(--spacing-2);
  }
  
  .job-grid.list-view .job-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-1);
  }
  
  .job-grid.list-view .metric-card {
    flex: 1;
    min-width: 100px;
  }
}

/* Job Alerts & Notifications */
.alert-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-subtle);
  transition: all var(--transition-fast);
}

.alert-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-primary-300);
}

.alert-item.alert-disabled {
  opacity: 0.6;
  background: rgba(128, 128, 128, 0.1);
}

.alert-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.alert-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.notification-item {
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(59, 130, 246, 0.2);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  justify-content: between;
  align-items: center;
}

.notification-item:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.notification-item.notification-unread {
  border-l: 4px solid var(--color-primary-500);
  font-weight: var(--font-weight-medium);
}

.notification-content {
  flex: 1;
}

.notification-message {
  color: var(--text-primary-600);
  margin-bottom: 4px;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.notification-actions {
  margin-left: var(--spacing-md);
}

/* Advanced Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* Apply animations with staggered timing */
.enhanced-job-card {
  animation: fadeInUp 0.6s ease-out;
}

.enhanced-job-card:nth-child(odd) {
  animation-delay: 0.1s;
}

.enhanced-job-card:nth-child(even) {
  animation-delay: 0.2s;
}

.priority-badge {
  animation: slideInRight 0.4s ease-out 0.3s both;
}

.metric-card {
  animation: scaleIn 0.5s ease-out;
}

.enhanced-skill-tag {
  animation: fadeInUp 0.4s ease-out;
  animation-delay: calc(0.05s * var(--index, 0));
}

.score-indicator {
  animation: pulse 2s infinite;
}

/* Performance Optimizations */
.enhanced-job-card {
  contain: layout style paint;
  will-change: transform, box-shadow;
}

.job-grid {
  contain: layout;
}

.metric-card {
  contain: layout style;
}

.enhanced-skill-tag {
  contain: layout style;
}

/* Advanced Accessibility Features */
.enhanced-job-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 
    var(--shadow-2xl),
    0 0 0 4px var(--color-primary-bg);
}

.priority-badge[aria-label]::after {
  content: attr(aria-label);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--surface-overlay);
  color: var(--text-primary-600);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--easing-ease);
  z-index: var(--z-tooltip);
}

.priority-badge:hover::after,
.priority-badge:focus::after {
  opacity: 1;
}

/* Screen reader improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .enhanced-job-card {
    border-width: 2px;
  }
  
  .priority-badge {
    border-width: 2px;
    font-weight: var(--font-weight-bold);
  }
  
  .enhanced-skill-tag {
    border-width: 2px;
  }
  
  .score-indicator {
    border-width: 3px;
    font-weight: var(--font-weight-black);
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .enhanced-job-card,
  .priority-badge,
  .metric-card,
  .enhanced-skill-tag {
    animation: none;
    transition-duration: 0.01ms;
  }
  
  .enhanced-job-card:hover {
    transform: none;
  }
  
  .score-indicator {
    animation: none;
  }
}

/* Print styles */
@media print {
  .enhanced-job-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #000;
    background: white;
    color: var(--text-primary-600);
  }
  
  .priority-badge {
    background: white;
    border: 1px solid #000;
    color: var(--text-primary-600);
  }
  
  .header-actions {
    display: none;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .glass-card {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .enhanced-job-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .enhanced-job-card:focus-visible {
  outline-color: rgba(59, 130, 246, 0.8);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.3),
    0 0 0 4px rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .alert-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .alert-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .notification-item {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

[data-theme="dark"] .notification-item:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

/* Enhanced Job Cards - New Advanced Features */
.enhanced-job-card {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease);
}

.enhanced-job-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary-subtle);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.enhanced-job-card.top-match::before {
  opacity: 1;
  background: var(--gradient-gaming);
}

.enhanced-job-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-xl);
}

/* Priority Indicators */
.priority-indicators {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.priority-badge.top-match {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 193, 7, 0.15));
  color: var(--color-warning-700);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.priority-badge.gaming {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 217, 255, 0.15));
  color: var(--color-success-700);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.priority-badge.remote {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15));
  color: var(--color-primary-700);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Enhanced Job Header */
.enhanced-job-header {
  margin-bottom: var(--spacing-4);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  flex: 1;
}

.company-logo-section {
  position: relative;
  flex-shrink: 0;
}

.company-logo-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
}

.company-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-border);
}

.job-title-section {
  flex: 1;
  min-width: 0;
}

.enhanced-job-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
  line-height: var(--line-height-tight);
  transition: color var(--duration-fast) var(--easing-ease);
}

.enhanced-job-title:hover {
  color: var(--color-primary-600);
}

.job-company-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.enhanced-company-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.job-location-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-start;
  flex-shrink: 0;
}

.action-group {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.primary-actions .apply-btn {
  min-width: 80px;
}

.secondary-actions {
  opacity: 0.7;
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.enhanced-job-card:hover .secondary-actions {
  opacity: 1;
}

/* Enhanced Job Content */
.enhanced-job-content {
  margin-bottom: var(--spacing-4);
}

/* Job Metrics Cards */
.job-metrics {
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  flex-wrap: wrap;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  min-width: 120px;
  transition: all var(--duration-fast) var(--easing-ease);
}

.metric-card:hover {
  background: var(--glass-bg-strong);
  border-color: var(--glass-border-highlight);
}

.metric-card .app-icon {
  color: var(--color-primary-500);
  font-size: var(--font-size-lg);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.metric-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

.salary-metric .app-icon {
  color: var(--color-success-500);
}

.type-metric .app-icon {
  color: var(--color-info-500);
}

.date-metric .app-icon {
  color: var(--color-warning-500);
}

/* Job Description */
.job-description-section {
  margin-bottom: var(--spacing-3);
}

.enhanced-job-description {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Enhanced Skills Section */
.enhanced-skills-section {
  border-t: 1px solid var(--border-subtle);
  padding-top: var(--spacing-3);
}

.skills-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.skills-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.enhanced-skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--surface-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease);
}

.enhanced-skill-tag.user-skill {
  background: var(--color-success-bg);
  color: var(--color-success-700);
  border-color: var(--color-success-border);
  font-weight: var(--font-weight-semibold);
}

.enhanced-skill-tag.user-skill::before {
  content: '✓';
  margin-right: 4px;
  font-size: 10px;
}

.enhanced-skill-tag:hover {
  background: var(--surface-elevated);
  border-color: var(--border-strong);
}

.enhanced-skill-tag.user-skill:hover {
  background: var(--color-success-100);
  border-color: var(--color-success-300);
}

/* AI Insights Panel */
.ai-insights-panel {
  margin-top: var(--spacing-4);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  overflow: hidden;
}

.ai-insights-header {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--gradient-primary-subtle);
  border-b: 1px solid var(--glass-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--duration-fast) var(--easing-ease);
}

.ai-insights-header:hover {
  background: var(--gradient-primary);
}

.ai-insights-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

.ai-insights-content {
  padding: var(--spacing-4);
}

.insights-sections {
  display: grid;
  gap: var(--spacing-4);
}

.insight-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.insight-section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.alignment-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.score-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  border: 3px solid;
}

.score-circle.excellent {
  background: var(--color-success-50);
  border-color: var(--color-success-500);
  color: var(--color-success-700);
}

.score-circle.good {
  background: var(--color-info-50);
  border-color: var(--color-info-500);
  color: var(--color-info-700);
}

.score-circle.fair {
  background: var(--color-warning-50);
  border-color: var(--color-warning-500);
  color: var(--color-warning-700);
}

.score-circle.poor {
  background: var(--color-error-50);
  border-color: var(--color-error-500);
  color: var(--color-error-700);
}

.score-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.score-details li {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.score-details li::before {
  content: '•';
  color: var(--color-success-500);
  font-weight: bold;
}

.skill-gaps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.missing-skills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.missing-skill {
  padding: 2px 6px;
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-200);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.recommendation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--surface-subtle);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.recommendation-item:hover {
  background: var(--surface-elevated);
  border-color: var(--border-strong);
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  margin-bottom: 2px;
}

.recommendation-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.recommendation-priority {
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.recommendation-priority.high {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.recommendation-priority.medium {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

/* Job Comparison Modal */
.job-comparison-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.comparison-content {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-b: 2px solid var(--border-base);
}

.comparison-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  margin: 0;
}

.comparison-jobs {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.comparison-job-card {
  flex: 1;
  min-width: 200px;
  padding: var(--spacing-3);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  position: relative;
}

.comparison-job-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.comparison-job-company {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2);
}

.remove-from-comparison {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
}

.comparison-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.comparison-section {
  background: var(--surface-subtle);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}

.comparison-section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.comparison-grid {
  display: grid;
  gap: var(--spacing-3);
}

.comparison-item {
  padding: var(--spacing-2);
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
}

.comparison-item-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.comparison-item-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
}

/* Bulk Operations Panel */
.bulk-operations-panel {
  position: sticky;
  top: var(--spacing-4);
  z-index: 100;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  margin-bottom: var(--spacing-4);
  backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-glass-lg);
}

.bulk-operations-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
}

.bulk-operations-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.selected-count {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.bulk-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

/* Job Notifications */
.job-notification {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  z-index: 10;
  animation: slideInRight 0.3s ease-out;
}

.job-notification.success {
  background: var(--color-success-100);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-300);
}

.job-notification.error {
  background: var(--color-error-100);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-300);
}

/* Loading States */
.job-card-loading {
  opacity: 0.6;
  pointer-events: none;
  position: relative;
}

.job-card-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  animation: shimmer 1.5s infinite;
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .header-actions {
    justify-content: flex-end;
    width: 100%;
  }
  
  .job-metrics {
    flex-direction: column;
  }
  
  .comparison-content {
    padding: var(--spacing-4);
  }
  
  .comparison-jobs {
    flex-direction: column;
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .bulk-operations-header {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: flex-start;
  }
  
  .bulk-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .priority-indicators {
    flex-wrap: wrap;
  }
  
  .header-left {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .job-company-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
  
  .secondary-actions {
    opacity: 1; /* Always visible on mobile */
  }
  
  .ai-insights-content {
    padding: var(--spacing-3);
  }
  
  .job-notification {
    position: fixed;
    top: var(--spacing-4);
    right: var(--spacing-4);
    left: var(--spacing-4);
  }
}

/* Dark Theme Adjustments */
[data-theme="dark"] .enhanced-job-card {
  background: rgba(255, 255, 255, 0.02);
}

[data-theme="dark"] .enhanced-job-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .metric-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .ai-insights-panel {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .comparison-content {
  background: var(--surface-base);
}

[data-theme="dark"] .bulk-operations-panel {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Gaming Theme Enhancements */
.theme-gaming .enhanced-job-card.gaming-job {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.03), rgba(0, 217, 255, 0.03));
  border-color: rgba(0, 255, 136, 0.2);
}

.theme-gaming .enhanced-job-card.gaming-job:hover {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 217, 255, 0.08));
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 
    var(--shadow-glass-xl),
    0 0 20px rgba(0, 255, 136, 0.1);
}

/* High Contrast Accessibility */
@media (prefers-contrast: high) {
  .enhanced-job-card,
  .metric-card,
  .ai-insights-panel,
  .comparison-content,
  .bulk-operations-panel {
    border-width: 2px;
  }
  
  .priority-badge {
    border-width: 2px;
  }
  
  .enhanced-skill-tag {
    border-width: 2px;
  }
}

/* Reduced Motion Accessibility */
@media (prefers-reduced-motion: reduce) {
  .enhanced-job-card,
  .metric-card,
  .ai-insights-header,
  .recommendation-item {
    transition: none;
  }
  
  .enhanced-job-card:hover {
    transform: none;
  }
  
  .job-notification {
    animation: none;
  }
  
  .job-card-loading::after {
    animation: none;
  }
}

/* Focus States for Accessibility */
.enhanced-job-card:focus {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
}

.ai-insights-header:focus {
  outline: 3px solid var(--color-primary-500);
  outline-offset: -3px;
}

.comparison-job-card:focus {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
}
</style>
