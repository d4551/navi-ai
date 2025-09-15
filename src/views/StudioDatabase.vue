<template>
  <StandardPageLayout page-type="gaming" content-spacing="normal" max-width="xl" class="font-sans ">
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="md" priority="primary">
        <!-- AI Intelligence -->
        <UnifiedButton 
          variant="gaming" 
          icon-only 
          icon="CpuChipIcon" 
          tooltip="AI Studio Intelligence" 
          :loading="aiAnalyzing" 
          @click="runAIAnalysis" 
        />
        
        <!-- Watchlist -->
        <UnifiedButton 
          variant="glass" 
          leading-icon="HeartIcon" 
          @click="viewFavorites"
        >
          Watchlist ({{ favoriteStudios.length }})
        </UnifiedButton>

        <!-- Data Management Actions -->
        <div class="action-group">
          <UnifiedButton 
            variant="outline" 
            leading-icon="CircleStackIcon-arrow-up" 
            :loading="importing" 
            @click="runFullImport"
          >
            Import
          </UnifiedButton>
          
          <UnifiedButton 
            variant="outline" 
            leading-icon="ArrowPathIcon" 
            :loading="syncingSteam" 
            @click="runIncrementalSteamSync"
          >
            Sync Steam
          </UnifiedButton>
          
          <UnifiedButton 
            variant="cyber" 
            leading-icon="CircleStackIcon-search" 
            :loading="openDataLoading" 
            @click="runOpenDataScan"
          >
            Scan Data
          </UnifiedButton>
        </div>

        <!-- Export Actions -->
        <div ref="exportDropdownRef" class="dropdown-container">
          <UnifiedButton 
            variant="outline" 
            leading-icon="ArrowUpTrayIcon" 
            trailing-icon="ChevronDownIcon"
            @click="toggleExportDropdown"
          >
            Export
          </UnifiedButton>
          <div v-if="showExportDropdown" class="export-dropdown glass-surface">
            <button class="export-option" @click="exportData">
              <AppIcon name="DocumentIcon-code" />
              <span>Export JSON</span>
            </button>
            <button class="export-option" @click="exportDedupedCSV">
              <AppIcon name="DocumentIcon-delimited" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </HeaderActions>
    </template>
    <!-- Enhanced Studio Intelligence Dashboard -->
    <section class="studio-intelligence-dashboard">
      <div class="dashboard-card">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <div class="header-title">
            <div class="header-icon">
              <AppIcon name="CircleStackIcon" />
            </div>
            <div class="header-text">
              <h1>Studio Intelligence Overview</h1>
              <div class="header-subtitle">Real-time monitoring and analytics</div>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn" title="Refresh data" @click="refreshMetrics">
              <AppIcon name="ArrowPathIcon" />
            </button>
            <button class="action-btn" title="Settings" @click="configureMetrics">
              <AppIcon name="CogIcon" />
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div
            v-for="metric in enhancedMetrics"
            :key="metric.key"
            :data-metric="metric.key"
            class="metric-card"
            :class="[metric.statusClass, { 'interactive': metric.clickable }]"
            @click="metric.clickable ? handleMetricClick(metric.key) : null"
          >
            <div v-if="metric.key === 'tracked'" class="live-indicator"></div>
            
            <div class="metric-header">
              <div class="metric-icon-wrapper">
                <AppIcon :name="metric.icon" />
              </div>
              <div v-if="metric.toggle" class="metric-toggle">
                <input 
                  :id="`toggle-${metric.key}`" 
                  v-model="metric.enabled"
                  type="checkbox" 
                  class="toggle-input"
                  @change="handleToggleChange(metric.key, $event)"
                >
                <label :for="`toggle-${metric.key}`" class="toggle-label"></label>
              </div>
            </div>
            
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-change" :class="metric.changeClass">
              <AppIcon :name="metric.changeIcon" />
              <span>{{ metric.changeText }}</span>
            </div>
            
            <div class="chart-preview"></div>
            <div class="loading-bar"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Studio Sub Navigation (normalized) -->
    <StudioSubNav
      :database-count="databaseCount"
      :analytics-count="analyticsCount"
      :network-count="networkCount"
    />

    <!-- Enhanced Search & Filter System -->
    <section v-if="activeTab === 'database'" class="search-command-center glass-surface unified-container enhanced-glass-panel">
      <div class="command-grid">
        <!-- Primary Search -->
        <div class="search-primary">
          <div class="search-input-container">
            <AppIcon name="MagnifyingGlassIcon" class="search-input-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input glass-input enhanced-input"
              placeholder="Search studios by name, location, technology, or game titles..."
              @input="(e: Event) => debouncedSearch((e.target as HTMLInputElement).value)"
            />
          </div>
          <div class="quick-actions">
            <UnifiedButton variant="gaming" :loading="aiSearching" leading-icon="CpuChipIcon" @click="aiSearchSuggestion">
              AI Suggest
            </UnifiedButton>
            <UnifiedButton variant="cyber" leading-icon="FunnelIcon" @click="clearAllFilters">
              Clear All
            </UnifiedButton>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="filter-matrix">
          <div class="filter-flex flex-wrap">
            <div class="filter-group">
              <label class="filter-label">Studio Type</label>
              <select v-model="filters.type" class="filter-select glass-input" @change="applyFilters">
                <option value="">All Types</option>
                <option value="AAA">AAA Studios</option>
                <option value="Indie">Independent</option>
                <option value="Mobile">Mobile-First</option>
                <option value="Publisher">Publishers</option>
                <option value="Platform">Platform Holders</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Location</label>
              <div class="input-wrapper">
                <AppIcon name="MapPinIcon" class="input-icon" />
                <input
                  v-model="filters.location"
                  type="text"
                  class="filter-input glass-input"
                  placeholder="City, State, Country..."
                  @input="(e: Event) => debouncedFilter((e.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Studio Size</label>
              <select v-model="filters.size" class="filter-select glass-input" @change="applyFilters">
                <option value="">All Sizes</option>
                <option value="Startup">Startup (1-50)</option>
                <option value="Mid-size">Mid-size (51-500)</option>
                <option value="Large">Large (500+)</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Technologies</label>
              <div class="tech-chips">
                <button
                  v-for="tech in popularTechnologies"
                  :key="tech"
                  class="tech-chip"
                  :class="{ active: selectedTechnologies.includes(tech) }"
                  @click="toggleTechnology(tech)"
                >
                  {{ tech }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Min Confidence</label>
              <select v-model.number="confidenceThreshold" class="filter-select glass-input" @change="applyFilters">
                <option :value="0">Any</option>
                <option :value="30">30+</option>
                <option :value="50">50+</option>
                <option :value="70">70+</option>
                <option :value="85">85+</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Sources</label>
              <div class="tech-chips">
                <button
                  v-for="src in availableSources"
                  :key="src"
                  class="tech-chip"
                  :class="{ active: selectedSources.includes(src) }"
                  @click="toggleSource(src)"
                >
                  {{ src }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-toggles">
            <label class="toggle-filter">
              <input v-model="filters.remoteWork" type="checkbox" @change="applyFilters" />
              <span class="toggle-indicator"></span>
              Remote-Friendly
            </label>
            <label class="toggle-filter">
              <input v-model="filters.publiclyTraded" type="checkbox" @change="applyFilters" />
              <span class="toggle-indicator"></span>
              Publicly Traded
            </label>
            <label class="toggle-filter">
              <input v-model="showOnlyFavorites" type="checkbox" @change="applyFilters" />
              <span class="toggle-indicator"></span>
              Watchlist Only
            </label>
          </div>
        </div>

        <!-- Quick Filters & Sort -->
        <div class="quick-controls">
          <div class="quick-filters">
            <button
              v-for="preset in quickFilters"
              :key="preset.key"
              class="quick-filter-btn"
              :class="{ active: activeQuickFilter === preset.key }"
              @click="applyQuickFilter(preset)"
            >
              <AppIcon :name="preset.icon" />
              {{ preset.label }}
            </button>
          </div>

          <div class="sort-controls">
            <label class="sort-label">Sort by:</label>
            <select v-model="sortBy" class="sort-select glass-input" @change="applySorting">
              <option value="name">Name</option>
              <option value="size">Company Size</option>
              <option value="founded">Founded Year</option>
              <option value="location">Location</option>
              <option value="confidence">Confidence</option>
              <option value="sources">Source Count</option>
              <option value="aiScore" :disabled="!aiScores || Object.keys(aiScores).length === 0">AI Match Score</option>
            </select>
            <button class="sort-direction" @click="toggleSortDirection">
              <AppIcon :name="sortDirection === 'asc' ? 'ArrowUpIcon' : 'ArrowDownIcon'" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Header -->
    <section v-if="activeTab === 'database'" class="unified-container">
      <div class="glass p-glass-md gap-glass-md rounded-lg">
        <div class="section-header">
          <div class="results-count">
            <strong>{{ filteredStudios.length }}</strong> studios found
            <span v-if="filteredStudios.length !== totalStudios">of {{ totalStudios }} total</span>
          </div>

          <!-- SR-only live announcer for results updates -->
          <div class="sr-only" role="status" aria-live="polite">
            {{ filteredStudios.length }} studios visible of {{ totalStudios }} total
          </div>

          <div class="results-actions header-actions-group">
            <ViewToggle
              v-model="viewMode"
              :options="[
                { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
                { value: 'list', icon: 'mdi-view-list', label: 'List view' },
                { value: 'table', icon: 'TableCellsIcon', label: 'Table view' }
              ]"
            />

            <UnifiedButton v-if="selectedStudios.length > 0" color="gaming" @click="compareStudios">
              Compare Selected ({{ selectedStudios.length }})
            </UnifiedButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Studio Results -->
    <section v-if="activeTab === 'database'" class="studio-results unified-container">
      <div v-if="!paginatedStudios.length && filteredStudios.length === 0" class="empty-state glass p-glass-lg gap-glass-md rounded-lg">
        <div class="section-header">
          <div>No studios match your filters</div>
        </div>
        <div class="section-body flex items-center gap-glass-sm">
          <UnifiedButton color="glass" appearance="outlined" leading-icon="FunnelIcon" @click="clearAllFilters">
            Clear Filters
          </UnifiedButton>
          <UnifiedButton color="gaming" :loading="aiSearching" leading-icon="CpuChipIcon" @click="aiSearchSuggestion">
            AI Suggest
          </UnifiedButton>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="studios-grid">
        <StudioCard
          v-for="studio in paginatedStudios"
          :key="studio.id"
          :studio="studio"
          :is-favorite="favoriteStudios.includes(studio.id)"
          :ai-score="aiScores?.[studio.id]"
          :is-selected="selectedStudios.includes(studio.id)"
          @toggle-favorite="toggleFavorite"
          @toggle-selection="toggleSelection"
          @view-details="viewStudioDetails"
          @view-jobs="viewStudioJobs"
          @quick-apply="quickApplyToStudio"
        />
      </div>

      <!-- List View -->
      <div v-else-if="viewMode === 'list'" class="studios-list">
        <StudioListItem
          v-for="studio in paginatedStudios"
          :key="studio.id"
          :studio="studio"
          :is-favorite="favoriteStudios.includes(studio.id)"
          :ai-score="aiScores?.[studio.id]"
          :is-selected="selectedStudios.includes(studio.id)"
          @toggle-favorite="toggleFavorite"
          @toggle-selection="toggleSelection"
          @view-details="viewStudioDetails"
          @view-jobs="viewStudioJobs"
        />
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table'" class="studios-table-container">
        <StudioTable
          :studios="paginatedStudios"
          :favorite-studios="favoriteStudios"
          :ai-scores="aiScores"
          :selected-studios="selectedStudios"
          @toggle-favorite="toggleFavorite"
          @toggle-selection="toggleSelection"
          @view-details="viewStudioDetails"
          @sort="handleTableSort"
        />
      </div>
    </section>

    <!-- Pagination -->
    <section v-if="activeTab === 'database' && totalPages > 1" class="pagination-section">
      <div class="pagination-controls">
        <UnifiedButton 
          :disabled="currentPage === 1"
          color="glass" 
          appearance="outlined"
          leading-icon="ChevronLeftIcon"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </UnifiedButton>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <UnifiedButton 
          :disabled="currentPage === totalPages"
          color="glass" 
          appearance="outlined"
          trailing-icon="ChevronRightIcon"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </UnifiedButton>
      </div>
    </section>

    <!-- Studio Detail Modal -->
    <StudioDetailModal
      v-if="activeTab === 'database' && selectedStudioDetail"
      :studio="selectedStudioDetail"
      :is-favorite="favoriteStudios.includes(selectedStudioDetail.id)"
      @close="selectedStudioDetail = null"
      @toggle-favorite="toggleFavorite"
      @view-jobs="viewStudioJobs"
      @start-interview="startStudioInterview"
    />

    <!-- Studio Comparison Modal -->
    <StudioComparisonModal
      v-if="activeTab === 'database' && showComparison"
      :studios="studiosToCompare"
      @close="showComparison = false"
    />

    <!-- Import / Sync Progress Modal -->
    <div v-if="showProgressModal" class="progress-modal-overlay">
      <div class="progress-modal glass-surface">
        <header class="progress-header">
          <h3>{{ progressTitle }}</h3>
          <button class="close-btn" :disabled="importing || syncingSteam" @click="closeProgressModal">✕</button>
        </header>
        <div class="progress-body">
          <div v-for="stage in orderedStages" :key="stage.key" class="stage" :class="['stage', stage.status]">
            <div class="stage-main">
              <strong>{{ stage.label }}</strong>
              <span class="status" :data-status="stage.status">
                <template v-if="stage.status === 'pending'">Pending</template>
                <template v-else-if="stage.status === 'running'">Running…</template>
                <template v-else-if="stage.status === 'done'">✔ Done ({{ formatMs(stage.durationMs) }})</template>
                <template v-else-if="stage.status === 'error'">
                  ⚠ Error
                  <UnifiedButton size="xs" variant="outline" leading-icon="mdi-reload" @click="retryStage(stage.key)">
                    Retry
                  </UnifiedButton>
                </template>
              </span>
            </div>
            <div v-if="stage.countText" class="counts">{{ stage.countText }}</div>
          </div>
        </div>
        <footer class="progress-footer">
          <div class="elapsed">Elapsed: {{ formatMs(totalElapsedMs) }}</div>
          <UnifiedButton variant="outline" :disabled="importing || syncingSteam" leading-icon="CheckIcon" @click="closeProgressModal">
            Close
          </UnifiedButton>
        </footer>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ArrowPathIcon, ArrowUpTrayIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CircleStackIcon, CogIcon, CpuChipIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { HeartIcon, MapPinIcon } from '@heroicons/vue/24/solid'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
// import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { studioService } from '@/modules/studios/StudioService'
import { aiService } from '@/shared/services/AIService'
import { useToast } from '@/composables/useToast'

// Components
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StudioCard from '@/components/studio/StudioCard.vue'
import StudioListItem from '@/components/studio/StudioListItem.vue' 
import StudioTable from '@/components/studio/StudioTable.vue'
import StudioDetailModal from '@/components/studio/StudioDetailModal.vue'
import StudioComparisonModal from '@/components/studio/StudioComparisonModal.vue'
import ViewToggle from '@/components/ui/ViewToggle.vue'
import StudioSubNav from '@/components/studio/StudioSubNav.vue'
// import { defineAsyncComponent } from 'vue'

// Lazy-load analytics and networking pages into tabs
// Lazy tabs (currently not mounted directly here; kept for future enhancement)
// const TabStudioAnalytics = defineAsyncComponent(() => import('@/views/StudioAnalytics.vue'))
// const TabStudioNetworking = defineAsyncComponent(() => import('@/views/StudioNetworking.vue'))

const router = useRouter()
const store = useAppStore()
// const theme = useUnifiedTheme() // not currently used
const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

// const themeName = computed(() => theme?.colorScheme?.value || 'light') // not used yet

// State
const activeTab = ref<'database' | 'analytics' | 'network'>('database')
const searchQuery = ref('')
const allStudios = ref<any[]>([])
const filteredStudios = ref<any[]>([])
const selectedStudios = ref<string[]>([])
const favoriteStudios = ref<string[]>([])
const aiScores = ref<Record<string, number>>({})
const selectedStudioDetail = ref<any | null>(null)
const showComparison = ref(false)
const showExportDropdown = ref(false)
const exportButton = ref(null)

// View & Pagination
const viewMode = ref<'grid' | 'list' | 'table'>('grid')
const currentPage = ref(1)
const itemsPerPage = ref(24)

// Loading states
const loading = ref(false)
const aiAnalyzing = ref(false)
const aiSearching = ref(false)
const openDataLoading = ref(false)
const importing = ref(false)
const syncingSteam = ref(false)
const showProgressModal = ref(false)
const progressStages = ref<Record<string, any>>({
  static: { key: 'static', label: 'Static + Steam Import', status: 'pending', startedAt: 0, durationMs: 0, countText: '' },
  open: { key: 'open', label: 'Open Data Enrichment', status: 'pending', startedAt: 0, durationMs: 0, countText: '' },
  dedupe: { key: 'dedupe', label: 'Deduplication & Merge', status: 'pending', startedAt: 0, durationMs: 0, countText: '' },
  persist: { key: 'persist', label: 'Persistence', status: 'pending', startedAt: 0, durationMs: 0, countText: '' }
})
const progressTitle = ref('Studio Import')
const runStartedAt = ref(0)
const confidenceThreshold = ref(0)
let backgroundSyncTimer: any = null

const orderedStages = computed(() => [
  progressStages.value.static,
  progressStages.value.open,
  progressStages.value.dedupe,
  progressStages.value.persist
])

const totalElapsedMs = computed(() => runStartedAt.value ? Date.now() - runStartedAt.value : 0)

// Filters
const filters = ref({
  type: '',
  location: '',
  size: '',
  remoteWork: false,
  publiclyTraded: false
})

const selectedTechnologies = ref<string[]>([])
const showOnlyFavorites = ref(false)
const activeQuickFilter = ref<string | null>(null)
const selectedSources = ref<string[]>([])
const availableSources = ['steam','wikidata','wikipedia','dbpedia','static']

// Sorting
const sortBy = ref('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Popular technologies for quick filtering
const popularTechnologies = [
  'Unity', 'Unreal Engine', 'C++', 'C#', 'Python', 'JavaScript', 'React', 
  'AWS', 'Docker', 'Kubernetes', 'iOS', 'Android'
]

// Quick filter presets
const quickFilters = [
  { key: 'aaa', label: 'AAA Studios', icon: 'mdi-office-building', filters: { type: 'AAA' } },
  { key: 'indie', label: 'Indie Studios', icon: 'DevicePhoneMobileIcon-variant', filters: { type: 'Indie' } },
  { key: 'remote', label: 'Remote-Friendly', icon: 'mdi-web', filters: { remoteWork: true } },
  { key: 'mobile', label: 'Mobile Games', icon: 'mdi-cellphone', filters: { type: 'Mobile' } },
  { key: 'public', label: 'Public Companies', icon: 'ChartBarIcon-bar', filters: { publiclyTraded: true } },
  { key: 'california', label: 'California', icon: 'mdi-weather-sunny', filters: { location: 'California' } }
]

// Computed
const totalStudios = computed(() => allStudios.value.length)
const totalPages = computed(() => Math.ceil(filteredStudios.value.length / itemsPerPage.value))
const paginatedStudios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStudios.value.slice(start, end)
})

const studiosToCompare = computed(() => 
  allStudios.value.filter(s => selectedStudios.value.includes(s.id))
)

// Enhanced metrics with toggles and interaction
const metricSettings = ref({
  tracked: { enabled: true, visible: true },
  visible: { enabled: true, visible: true },
  watchlist: { enabled: true, visible: true },
  selected: { enabled: true, visible: true }
})

const enhancedMetrics = computed(() => [
  {
    key: 'tracked',
    value: totalStudios.value,
    label: 'Tracked Studios',
    icon: 'CircleStackIcon',
    statusClass: 'status-primary',
    clickable: true,
    highlighted: false,
    changeText: '+12 this week',
    changeIcon: 'mdi-trending-up',
    changeClass: 'positive',
    toggle: true,
    enabled: metricSettings.value.tracked.enabled
  },
  {
    key: 'visible',
    value: filteredStudios.value.length,
    label: 'Visible Results',
    icon: 'EyeIcon',
    statusClass: 'status-info',
    clickable: true,
    highlighted: filteredStudios.value.length !== totalStudios.value,
    changeText: `${Math.round((filteredStudios.value.length / totalStudios.value) * 100)}% of total`,
    changeIcon: 'FunnelIcon-variant',
    changeClass: 'neutral',
    toggle: true,
    enabled: metricSettings.value.visible.enabled
  },
  {
    key: 'watchlist',
    value: favoriteStudios.value.length,
    label: 'Watchlist Items',
    icon: 'HeartIcon',
    statusClass: 'status-success',
    clickable: true,
    highlighted: favoriteStudios.value.length > 0,
    changeText: '+3 recently added',
    changeIcon: 'PlusIcon',
    changeClass: 'positive',
    toggle: true,
    enabled: metricSettings.value.watchlist.enabled
  },
  {
    key: 'selected',
    value: selectedStudios.value.length,
    label: 'Selected for Compare',
    icon: 'CheckIconbox-marked-circle',
    statusClass: selectedStudios.value.length > 0 ? 'status-warning' : 'status-muted',
    clickable: selectedStudios.value.length > 0,
    highlighted: selectedStudios.value.length >= 2,
    changeText: selectedStudios.value.length >= 2 ? 'Ready to compare' : 'Select 2+ to compare',
    changeIcon: selectedStudios.value.length >= 2 ? 'CheckIcon' : 'InformationCircleIconrmation',
    changeClass: selectedStudios.value.length >= 2 ? 'positive' : 'neutral',
    toggle: false,
    enabled: true
  }
])

// Enhanced metrics provide all necessary data - legacy headerStats removed

// Tab badge counts
const databaseCount = computed(() => filteredStudios.value.length)
const analyticsCount = computed(() => Object.keys(aiScores.value || {}).length)
const networkCount = computed(() => favoriteStudios.value.length)

const visiblePages = computed(() => {
  const range = 5
  const start = Math.max(1, currentPage.value - Math.floor(range / 2))
  const end = Math.min(totalPages.value, start + range - 1)
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
async function loadStudios() {
  loading.value = true
  try {
    await studioService.initialize()
    const result = await studioService.searchStudios({})
    allStudios.value = result.studios
    filteredStudios.value = [...allStudios.value]
    await loadFavorites()
  } catch (e) {
    toastError('Failed to load studio database')
    console.error('Studio loading error:', e)
  } finally {
    loading.value = false
  }
}

async function loadFavorites() {
  try {
    const favorites = await studioService.getFavoriteStudios()
    favoriteStudios.value = favorites.map(f => f.id)
  } catch (e) {
    console.error('Failed to load favorites:', e)
  }
}

function applyFilters() {
  let filtered = [...allStudios.value]

  // Text search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(studio => {
      const searchableText = [
        studio.name,
        studio.description,
        studio.headquarters,
        studio.location,
        ...(studio.games || []),
        ...(studio.technologies || []),
        ...(studio.commonRoles || [])
      ].join(' ').toLowerCase()
      
      return searchableText.includes(query)
    })
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(studio => {
      const studioType = (studio as any).type || (studio as any).category
      return studioType === filters.value.type
    })
  }

  // Location filter
  if (filters.value.location) {
    const location = filters.value.location.toLowerCase()
    filtered = filtered.filter(studio => {
      const studioLocation = (studio.headquarters || studio.location || '').toLowerCase()
      return studioLocation.includes(location)
    })
  }

  // Size filter
  if (filters.value.size) {
    filtered = filtered.filter(studio => studio.size === filters.value.size)
  }

  // Technology filter
  if (selectedTechnologies.value.length > 0) {
    filtered = filtered.filter(studio => {
      const studioTech = studio.technologies || []
      return selectedTechnologies.value.some(tech => 
  studioTech.some((stTech: string) => stTech.toLowerCase().includes(tech.toLowerCase()))
      )
    })
  }

  // Remote work filter
  if (filters.value.remoteWork) {
    filtered = filtered.filter(studio => studio.culture?.remoteFirst === true)
  }

  // Public company filter
  if (filters.value.publiclyTraded) {
    filtered = filtered.filter(studio => studio.publiclyTraded === true)
  }

  // Favorites only
  if (showOnlyFavorites.value) {
    filtered = filtered.filter(studio => favoriteStudios.value.includes(studio.id))
  }

  // Confidence threshold
  if (confidenceThreshold.value > 0) {
    filtered = filtered.filter(studio => (studio.confidence || 0) >= confidenceThreshold.value)
  }

  // Sources filter
  if (selectedSources.value.length > 0) {
    filtered = filtered.filter(studio => {
      const raw = (studio as any).sources || (studio as any).sourceRefs || (studio as any).source || []
      const srcArr = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split(/[,;\s]+/) : [])
      return selectedSources.value.some(s => srcArr.map(r => String(r).toLowerCase()).includes(s.toLowerCase()))
    })
  }

  filteredStudios.value = filtered
  applySorting()
  currentPage.value = 1
}

function applySorting() {
  filteredStudios.value.sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy.value) {
      case 'name':
        aValue = a.name || ''
        bValue = b.name || ''
        break
      case 'size':
        // Convert size to numeric for sorting
        aValue = getSizeNumeric(a.size)
        bValue = getSizeNumeric(b.size)
        break
      case 'founded':
        aValue = a.founded || 0
        bValue = b.founded || 0
        break
      case 'location':
        aValue = a.headquarters || a.location || ''
        bValue = b.headquarters || b.location || ''
        break
      case 'aiScore':
        aValue = aiScores.value[a.id] || 0
        bValue = aiScores.value[b.id] || 0
        break
      case 'confidence':
        aValue = a.confidence || 0
        bValue = b.confidence || 0
        break
      case 'sources':
        aValue = (a.sources?.length) || (a.sourceRefs?.length) || 0
        bValue = (b.sources?.length) || (b.sourceRefs?.length) || 0
        break
      default:
        aValue = a.name || ''
        bValue = b.name || ''
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase())
      return sortDirection.value === 'asc' ? comparison : -comparison
    }

    const comparison = aValue - bValue
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
}

function getSizeNumeric(size: string): number {
  if (!size) return 0
  const sizeStr = size.toLowerCase()
  if (sizeStr.includes('startup') || sizeStr.includes('1-50')) return 1
  if (sizeStr.includes('mid') || sizeStr.includes('51-500')) return 2
  if (sizeStr.includes('large') || sizeStr.includes('500+')) return 3
  return 0
}

// Debounced search
let searchTimeout: any = null
function debouncedSearch(value: string) {
  searchQuery.value = value
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

let filterTimeout: any = null
function debouncedFilter(value: string) {
  filters.value.location = value
  if (filterTimeout) clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

function applyQuickFilter(preset: any) {
  if (activeQuickFilter.value === preset.key) {
    // Deactivate if already active
    activeQuickFilter.value = null
    clearAllFilters()
    return
  }

  activeQuickFilter.value = preset.key
  Object.assign(filters.value, preset.filters)
  applyFilters()
}

// Enhanced metrics interaction handlers with animations
function handleMetricClick(metricKey: string) {
  // Add visual feedback animation
  const metricCard = document.querySelector(`[data-metric="${metricKey}"]`)
  if (metricCard) {
    metricCard.style.transform = 'scale(0.98)'
    setTimeout(() => {
      metricCard.style.transform = ''
    }, 200)
  }
  
  switch (metricKey) {
    case 'tracked':
      // Focus on all tracked studios
      clearAllFilters()
      break
    case 'visible':
      // Show current filter summary
      showFilterSummary()
      break
    case 'watchlist':
      // Filter to show only watchlist items
      showWatchlistOnly()
      break
    case 'selected':
      if (selectedStudios.value.length >= 2) {
        compareStudios()
      }
      break
  }
}

function handleToggleChange(metricKey: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  metricSettings.value[metricKey].enabled = checked
  
  // Animate value change
  const metricCard = event.target.closest('.metric-card')
  const valueElement = metricCard?.querySelector('.metric-value')
  if (valueElement) {
    valueElement.style.transform = 'scale(0.9)'
    setTimeout(() => {
      valueElement.style.transform = 'scale(1)'
    }, 200)
  }
  
  // Show loading animation
  const loadingBar = metricCard?.querySelector('.loading-bar')
  if (loadingBar) {
    loadingBar.style.opacity = '1'
    setTimeout(() => {
      loadingBar.style.opacity = '0'
    }, 2000)
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('studio-metric-settings', JSON.stringify(metricSettings.value))
  } catch (e) {
    console.warn('Failed to save metric settings:', e)
  }
}

function refreshMetrics() {
  // Add refresh button animation
  const refreshBtn = document.querySelector('.action-btn [name="ArrowPathIcon"]')
  if (refreshBtn) {
    refreshBtn.style.animation = 'spin 1s linear'
    setTimeout(() => {
      refreshBtn.style.animation = ''
    }, 1000)
  }
  
  // Update all metric values with animation
  document.querySelectorAll('.metric-value').forEach(value => {
    value.style.opacity = '0.5'
    setTimeout(() => {
      value.style.opacity = '1'
    }, 500)
  })
  
  // Trigger refresh of studio data and metrics
  loadStudios()
}

function configureMetrics() {
  // Open metric configuration modal (placeholder)
  console.log('Configure metrics modal would open here')
}

function showFilterSummary() {
  // Show current active filters in a modal/toast
  const activeFilters = []
  if (filters.value.type) activeFilters.push(`Type: ${filters.value.type}`)
  if (filters.value.location) activeFilters.push(`Location: ${filters.value.location}`)
  if (filters.value.technologies?.length) activeFilters.push(`Tech: ${filters.value.technologies.join(', ')}`)
  
  if (activeFilters.length > 0) {
    // You could show a toast or modal here
    console.log('Active filters:', activeFilters.join(', '))
  }
}

function showWatchlistOnly() {
  // Clear other filters and show only watchlist items
  clearAllFilters()
  // Set a watchlist-only filter
  viewMode.value = 'grid' // Ensure good view for favorites
}

function clearAllFilters() {
  searchQuery.value = ''
  filters.value = {
    type: '',
    location: '',
    size: '',
    remoteWork: false,
    publiclyTraded: false
  }
  selectedTechnologies.value = []
  showOnlyFavorites.value = false
  activeQuickFilter.value = null
  applyFilters()
}

function toggleTechnology(tech: string) {
  const index = selectedTechnologies.value.indexOf(tech)
  if (index > -1) {
    selectedTechnologies.value.splice(index, 1)
  } else {
    selectedTechnologies.value.push(tech)
  }
  applyFilters()
}

function toggleSource(src: string) {
  const idx = selectedSources.value.indexOf(src)
  if (idx > -1) selectedSources.value.splice(idx,1)
  else selectedSources.value.push(src)
  applyFilters()
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  applySorting()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function handleTableSort(column: string) {
  if (sortBy.value === column) {
    toggleSortDirection()
  } else {
    sortBy.value = column
    sortDirection.value = 'asc'
    applySorting()
  }
}

// Studio actions
async function toggleFavorite(studioId: string) {
  try {
    const isFavorite = await studioService.toggleFavorite(studioId)
    if (isFavorite) {
      if (!favoriteStudios.value.includes(studioId)) {
        favoriteStudios.value.push(studioId)
      }
    } else {
      const index = favoriteStudios.value.indexOf(studioId)
      if (index > -1) {
        favoriteStudios.value.splice(index, 1)
      }
    }
    
    if (showOnlyFavorites.value) {
      applyFilters()
    }
  } catch {
    toastError('Failed to update watchlist')
  }
}

function toggleSelection(studioId: string) {
  const index = selectedStudios.value.indexOf(studioId)
  if (index > -1) {
    selectedStudios.value.splice(index, 1)
  } else {
    selectedStudios.value.push(studioId)
  }
}

function viewStudioDetails(studio: any) {
  selectedStudioDetail.value = studio
}

function viewStudioJobs(studio: any) {
  router.push({
    path: '/jobs',
    query: { studio: studio.name }
  })
}

function viewFavorites() {
  showOnlyFavorites.value = !showOnlyFavorites.value
  applyFilters()
}

function compareStudios() {
  if (selectedStudios.value.length < 2) {
    toastInfo('Select at least 2 studios to compare')
    return
  }
  showComparison.value = true
}

async function quickApplyToStudio(studio: any) {
  router.push({
    path: '/interview-prep',
    query: { studio: studio.id }
  })
}

function startStudioInterview(studio: any) {
  router.push({
    path: '/interview-prep',
    query: { studio: studio.id, mode: 'interview' }
  })
}

// Tabs helper (removed unused setTab function to satisfy linter)

// AI Features
async function aiSearchSuggestion() {
  if (!searchQuery.value.trim()) {
    toastInfo('Enter some search terms first')
    return
  }

  aiSearching.value = true
  try {
    await aiService.initialize({ primaryProvider: 'google', enableContextPersistence: false })
    
    const suggestions = await aiService.chat({
      message: `Given the search query "${searchQuery.value}", suggest related gaming studios, technologies, locations, or roles that might be relevant. Return a JSON array of suggestion strings.`,
      type: 'analysis',
      metadata: { feature: 'studio-search-suggestions' }
    })

    // Parse AI suggestions and show them
    try {
      const parsed = JSON.parse(suggestions.content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const suggestion = parsed[0]
        searchQuery.value = suggestion
        debouncedSearch(suggestion)
        toastSuccess(`AI suggestion applied: "${suggestion}"`)
      }
    } catch {
      // Fallback to enhancing current search
      toastInfo('AI analyzing your search query...')
    }
  } catch {
    toastError('AI search assistance failed')
  } finally {
    aiSearching.value = false
  }
}

async function runAIAnalysis() {
  aiAnalyzing.value = true
  try {
    await aiService.initialize({ primaryProvider: 'google', enableContextPersistence: false })
    
    const userProfile = {
      skills: store.user?.skills || [],
      experience: store.user?.personalInfo?.experience || 'mid',
      interests: store.user?.gamingExperience?.interests || []
    }

    for (const studio of filteredStudios.value.slice(0, 20)) { // Limit to avoid rate limits
      try {
        const analysis = await aiService.chat({
          message: `Analyze how well this gaming studio matches the user profile. Studio: ${JSON.stringify(studio)}. User: ${JSON.stringify(userProfile)}. Return a match score 0-100.`,
          type: 'analysis',
          metadata: { feature: 'studio-ai-scoring' }
        })

        const scoreMatch = analysis.content.match(/(\d+)/)
        if (scoreMatch) {
          aiScores.value[studio.id] = parseInt(scoreMatch[1])
        }
      } catch (error) {
        console.warn(`AI scoring failed for ${studio.name}:`, error)
      }
    }

    applySorting()
    toastSuccess(`AI analysis complete! ${Object.keys(aiScores.value).length} studios scored`)
  } catch {
    toastError('AI analysis failed')
  } finally {
    aiAnalyzing.value = false
  }
}

function toggleExportDropdown() {
  showExportDropdown.value = !showExportDropdown.value
}

function exportData() {
  const exportData = {
    studios: filteredStudios.value,
    filters: filters.value,
    favorites: favoriteStudios.value,
    aiScores: aiScores.value,
    exportedAt: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gaming-studios-intel-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  showExportDropdown.value = false
  toastSuccess('Studio intelligence exported')
}

function exportDedupedCSV() {
  try {
    const rows = allStudios.value
    const headers = ['id','name','location','size','founded','confidence','sources','technologies']
    const escape = (v:any) => {
      if (v === null || v === undefined) return ''
      const s = Array.isArray(v) ? v.join('|') : String(v)
      return '"' + s.replace(/"/g,'""') + '"'
    }
    const lines = [headers.join(',')]
    for (const s of rows) {
      const sources = (s.sources || s.sourceRefs || []).join('|')
      lines.push([
        escape(s.id),
        escape(s.name),
        escape(s.headquarters || s.location || ''),
        escape(s.size || ''),
        escape(s.founded || ''),
        escape(s.confidence || ''),
        escape(sources),
        escape((s.technologies || []).join('|'))
      ].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studios-deduped-${Date.now()}.csv`
    a.click(); URL.revokeObjectURL(url)
    showExportDropdown.value = false
    toastSuccess('CSV exported')
  } catch (e) {
    console.error(e)
    toastError('CSV export failed')
  }
}

// Open knowledge aggregation (Wikidata/Wikipedia/DBpedia/GitHub)
async function runOpenDataScan() {
  openDataLoading.value = true
  try {
    const { OpenKnowledgeStudioAggregator } = await import('@/services/ingestion/OpenKnowledgeStudioAggregator')
    const aggregator = new OpenKnowledgeStudioAggregator()
    const result = await aggregator.aggregateAll({ include: ['wikidata','wikipedia','dbpedia'] })
    // Persist into our repository via service
    const ingest = await studioService.ingestOpenData(result.studios)
    await loadStudios()
    toastSuccess(`Open data merged: ${ingest.created} new • ${ingest.updated} updated`)
  } catch (e:any) {
    console.error(e)
    toastError('Open data scan failed')
  } finally {
    openDataLoading.value = false
  }
}

// Full import: static + (Steam if available) + open data enrichment + de-dup pass
async function runFullImport() {
  importing.value = true
  progressTitle.value = 'Studio Import'
  showProgressModal.value = true
  runStartedAt.value = Date.now()
  resetStages()
  try {
    let staticImported: any = null
    // Attempt to use DatabaseStudioService (Node/electron env)
    try {
      const { databaseStudioService } = await import('@/services/database/DatabaseStudioService')
      markStageRunning('static')
      await databaseStudioService.init()
      staticImported = await databaseStudioService.importAllStudios(true)
      if (staticImported) {
        progressStages.value.static.countText = `${staticImported.imported || 0} imported`
      }
      markStageDone('static')
  } catch {
      console.warn('[Studios] DatabaseStudioService not available in this environment, skipping static/steam import')
      markStageError('static')
    }

    // Open data enrichment
    let enrichment: any = null
    try {
      const { OpenKnowledgeStudioAggregator } = await import('@/services/ingestion/OpenKnowledgeStudioAggregator')
      const aggregator = new OpenKnowledgeStudioAggregator()
      markStageRunning('open')
      const result = await aggregator.aggregateAll({ include: ['wikidata','wikipedia'] })
      enrichment = await studioService.ingestOpenData(result.studios)
      progressStages.value.open.countText = `${enrichment.created} new • ${enrichment.updated} updated`
      markStageDone('open')
    } catch (e) {
      console.warn('[Studios] Open knowledge enrichment failed', e)
      markStageError('open')
    }

    // Reload data then perform light client-side de-dup (normalized name keep richest record)
    markStageRunning('dedupe')
    await loadStudios()
    await dedupeAndPersist()
    markStageDone('dedupe')
    toastSuccess(`Import complete${staticImported?.imported ? ` • ${staticImported.imported} base` : ''}${enrichment ? ` • +${enrichment.created}/${enrichment.updated} enriched` : ''}`)
  } catch (e) {
    console.error(e)
    toastError('Full import failed')
  } finally {
    importing.value = false
    // If all stages done close automatically after short delay
    markStageDone('persist') // ensure persist marked if not
    setTimeout(() => {
      if (!importing.value && !syncingSteam.value) {
        showProgressModal.value = false
      }
    }, 1200)
  }
}

async function dedupeAndPersist() {
  try {
    const { dedupeStudios } = await import('@/utils/studio-dedupe')
    const deduped = dedupeStudios(allStudios.value)
    allStudios.value = deduped
    applyFilters()
    markStageRunning('persist')
    try {
      const { databaseStudioService } = await import('@/services/database/DatabaseStudioService')
      await databaseStudioService.init()
      const persistResult: any = await databaseStudioService.bulkPersistMerged(deduped as any)
      if (persistResult && typeof persistResult === 'object') {
        progressStages.value.persist.countText = `${persistResult.created || 0} new • ${persistResult.updated || 0} updated`
      } else if (typeof persistResult === 'number') {
        progressStages.value.persist.countText = `${persistResult} persisted`
      }
      markStageDone('persist')
    } catch (e) {
      console.warn('[Studios] Persistence skipped/unavailable', e)
      markStageError('persist')
    }
  } catch (e) {
    console.error('Deduplication failed', e)
    markStageError('dedupe')
  }
}

async function runIncrementalSteamSync() {
  syncingSteam.value = true
  progressTitle.value = 'Incremental Steam Sync'
  showProgressModal.value = true
  runStartedAt.value = Date.now()
  resetStages(['static','dedupe','persist'])
  markStageRunning('static')
  try {
    const { databaseStudioService } = await import('@/services/database/DatabaseStudioService')
    await databaseStudioService.init()
    const res = await databaseStudioService.incrementalSteamSync(120)
  progressStages.value.static.countText = `${res?.imported || 0} imported` + (res?.totalRaw ? ` / ${res.totalRaw} raw` : '')
    markStageDone('static')
    await loadStudios()
    markStageRunning('dedupe')
    await dedupeAndPersist()
    markStageDone('dedupe')
    toastSuccess('Incremental Steam sync complete')
  } catch (e) {
    console.error('Incremental Steam sync failed', e)
    markStageError('static')
    toastError('Steam sync failed')
  } finally {
    syncingSteam.value = false
    setTimeout(() => {
      if (!importing.value && !syncingSteam.value) showProgressModal.value = false
    }, 1200)
  }
}

function resetStages(onlyKeys?: string[]) {
  const keys = onlyKeys || Object.keys(progressStages.value)
  for (const k of keys) {
    if (!progressStages.value[k]) continue
    progressStages.value[k] = { ...progressStages.value[k], status: 'pending', startedAt: 0, durationMs: 0, countText: '' }
  }
}
function markStageRunning(key: string) {
  const s = progressStages.value[key]; if (!s) return
  s.status = 'running'; s.startedAt = Date.now();
}
function markStageDone(key: string) {
  const s = progressStages.value[key]; if (!s) return
  if (s.status === 'running') {
    s.durationMs = Date.now() - s.startedAt
  }
  s.status = 'done'
}
function markStageError(key: string) {
  const s = progressStages.value[key]; if (!s) return
  if (s.status === 'running') {
    s.durationMs = Date.now() - s.startedAt
  }
  s.status = 'error'
}
function retryStage(key: string) {
  if (key === 'static') {
    if (progressTitle.value.includes('Incremental')) {
      runIncrementalSteamSync()
    } else {
      runFullImport()
    }
    return
  }
  if (key === 'open') {
    runOpenDataScan(); return
  }
  if (key === 'dedupe' || key === 'persist') {
    dedupeAndPersist(); return
  }
}
function closeProgressModal() {
  showProgressModal.value = false
}
function formatMs(ms: number) {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  const s = (ms/1000)
  if (s < 60) return `${s.toFixed(1)}s`
  const m = Math.floor(s/60)
  const rem = (s % 60).toFixed(0)
  return `${m}m ${rem}s`
}

// Click outside handler for export dropdown
function handleClickOutside(event: Event) {
  if (exportButton.value && event.target && !exportButton.value.$el.contains(event.target as Element)) {
    showExportDropdown.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize active tab from route query or persisted state
  try {
    const queryTab = (router.currentRoute.value.query?.tab as string) || ''
    const saved = localStorage.getItem('navi-studios-active-tab') || ''
    const t = (queryTab || saved || 'database') as string
    if (["database","analytics","network"].includes(t)) {
      activeTab.value = t as any
    }
  } catch {}

  await loadStudios()
  
  // Add click outside listener for export dropdown
  document.addEventListener('click', handleClickOutside)
  
  // Background incremental sync every 30 minutes (if DB service available)
  try {
    const { databaseStudioService } = await import('@/services/database/DatabaseStudioService')
    await databaseStudioService.init()
    backgroundSyncTimer = setInterval(() => {
      if (!importing.value && !syncingSteam.value) {
        runIncrementalSteamSync()
      }
    }, 30 * 60 * 1000)
  } catch {
    // ignore if not available in this environment
  }
})

onUnmounted(() => {
  if (backgroundSyncTimer) clearInterval(backgroundSyncTimer)
  document.removeEventListener('click', handleClickOutside)
})

// Watchers
watch([sortBy, sortDirection], () => {
  applySorting()
})
watch(confidenceThreshold, () => applyFilters())
</script>

<style scoped>
/* Progress Modal */
.progress-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,10,25,0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}
.progress-modal {
  width: min(520px, 90vw);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 40px -10px rgba(0,0,0,0.5);
}
.progress-header { display: flex; align-items: center; justify-content: space-between; }
.progress-header h3 { margin: 0; font-size: 1.125rem; }
.close-btn { background: transparent; border: none; cursor: pointer; font-size: 1rem; color: var(--text-secondary); }
.close-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.progress-body { display: flex; flex-direction: column; gap: var(--spacing-3); }
.stage { padding: var(--spacing-3) var(--spacing-4); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); background: var(--glass-bg); display: flex; flex-direction: column; gap: var(--spacing-1); }
.stage.running { animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.25);} 50% { box-shadow: 0 0 0 4px rgba(99,102,241,0);} }
.stage-main { display: flex; justify-content: space-between; align-items: center; }
.counts { font-size: 0.75rem; opacity: 0.85; letter-spacing: 0.5px; }
.status[data-status='error'] { color: var(--color-danger-500); }
.status[data-status='done'] { color: var(--color-success-500); }
.progress-footer { display: flex; align-items: center; justify-content: space-between; }
.elapsed { font-size: 0.75rem; opacity: 0.7; }
.studio-database {
  min-height: 100vh;
  background: var(--surface-base);
}

.detective-workspace {
  position: relative;
}

.detective-workspace::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.search-command-center {
  padding: var(--spacing-6);
  margin: var(--spacing-4) 0;
  border-radius: var(--radius-xl);
  background: var(--glass-surface);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}

.command-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.search-primary {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-end;
}

.search-field-enhanced {
  flex: 1;
}

.quick-actions {
  display: flex;
  gap: var(--spacing-2);
}

.filter-matrix {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.filter-flex flex-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-card-min-xs), 1fr));
  gap: var(--spacing-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary-600);
  font-size: 0.875rem;
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary-600);
}

.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.tech-chip {
  padding: var(--spacing-1) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  color: var(--text-primary-600);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tech-chip:hover {
  border-color: var(--color-primary-400);
}

.tech-chip.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.filter-toggles {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  flex-wrap: wrap;
}

.toggle-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  font-size: 0.875rem;
}

.toggle-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid var(--glass-border);
  border-radius: 3px;
  background: var(--glass-bg);
  position: relative;
}

.toggle-filter input:checked + .toggle-indicator {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.toggle-filter input:checked + .toggle-indicator::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.toggle-filter input {
  display: none;
}

.quick-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.quick-filters {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  color: var(--text-primary-600);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-filter-btn:hover {
  border-color: var(--color-primary-400);
  background: var(--color-primary-50);
}

.quick-filter-btn.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.sort-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.sort-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  min-width: 120px;
}

.sort-direction {
  padding: var(--spacing-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-header {
  padding: var(--spacing-4) var(--spacing-6);
  margin: var(--spacing-4) 0;
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
}

.results-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.results-count {
  font-size: 1.125rem;
  color: var(--text-primary-600);
}

.results-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

/* Screen-reader only utility */
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

.view-toggles {
  display: flex;
  gap: var(--spacing-1);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-1);
  border: 1px solid var(--glass-border);
}

.view-toggle {
  padding: var(--spacing-2);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.view-toggle:hover {
  background: var(--glass-surface);
  color: var(--text-primary-600);
}

.view-toggle.active {
  background: var(--color-primary-500);
  color: white;
}

/* Local tab styling removed; replaced with shared GlassNavTabs via StudioSubNav */

.studio-results {
  margin: var(--spacing-6) 0;
}

.studios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-card-min-lg), 1fr));
  gap: var(--spacing-5);
}

.studios-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.studios-table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.empty-state { text-align: left; }

.pagination-section {
  margin: var(--spacing-8) 0 var(--spacing-4);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-4);
}

.page-numbers {
  display: flex;
  gap: var(--spacing-1);
}

.page-number {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-400);
}

.page-number.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .search-primary {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-flex flex-wrap {
    grid-template-columns: 1fr;
  }

  .quick-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .studios-grid {
    grid-template-columns: repeat(auto-fill, minmax(var(--grid-card-min-sm), 1fr));
  }
}

@media (max-width: 768px) {
  .search-command-center {
    padding: var(--spacing-4);
  }

  .quick-filters {
    justify-content: center;
  }

  .results-meta {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .studios-grid {
    grid-template-columns: 1fr;
  }

  .pagination-controls {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .filter-select,
[data-theme="dark"] .sort-select {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme="dark"] .tech-chip {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme="dark"] .toggle-indicator {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

/* Enhanced Search Input Styling */
.search-input-container {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) var(--spacing-10);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.search-input-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

/* Input Wrapper for Location Filter */
.input-wrapper {
  position: relative;
}

.filter-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-8);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  font-size: 0.875rem;
}

.input-icon {
  position: absolute;
  left: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
  font-size: 0.875rem;
}

/* Studio Intelligence Dashboard */
.studio-intelligence-dashboard {
  margin-bottom: var(--spacing-8);
}

/* Main Dashboard Card */
.dashboard-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--glass-border);
  box-shadow: 
    0 20px 60px color-mix(in srgb, black 15%, transparent),
    inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  overflow: hidden;
}

/* Dashboard Header */
.dashboard-header {
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 8%, transparent) 0%, 
    color-mix(in srgb, var(--color-gaming-500) 8%, transparent) 100%);
  padding: var(--spacing-7) var(--spacing-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-b: 1px solid var(--glass-border);
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-2xl);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.header-text h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
}

.header-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal);
  color: var(--text-secondary);
  font-size: var(--font-size-xl);
}

.action-btn:hover {
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
  padding: var(--spacing-8);
}

/* Metric Card */
.metric-card {
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  position: relative;
  transition: all var(--duration-normal);
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.metric-card:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px color-mix(in srgb, black 8%, transparent);
}

.metric-card:hover::before {
  opacity: 1;
}

.metric-card.primary::before {
  background: linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
}

.metric-card.success::before {
  background: linear-gradient(90deg, var(--color-success-500) 0%, var(--color-success-400) 100%);
}

.metric-card.info::before {
  background: linear-gradient(90deg, var(--color-info-500) 0%, var(--color-info-400) 100%);
}

.metric-card.muted::before,
.metric-card.status-muted::before {
  background: linear-gradient(90deg, var(--text-tertiary) 0%, var(--text-secondary) 100%);
}

/* Status class mappings */
.metric-card.status-primary::before {
  background: linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
}

.metric-card.status-info::before {
  background: linear-gradient(90deg, var(--color-info-500) 0%, var(--color-info-400) 100%);
}

.metric-card.status-success::before {
  background: linear-gradient(135deg, 
    var(--color-success-500) 0%, 
    var(--color-success-400) 35%, 
    rgba(46, 204, 113, 0.8) 100%);
  box-shadow: 0 2px 12px rgba(46, 204, 113, 0.3);
}

.metric-card.status-warning::before {
  background: linear-gradient(90deg, var(--color-warning-500) 0%, var(--color-warning-400) 100%);
}

/* Metric Header */
.metric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-5);
}

.metric-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  position: relative;
  overflow: hidden;
}

.metric-card.primary .metric-icon-wrapper,
.metric-card.status-primary .metric-icon-wrapper {
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-500);
}

.metric-card.success .metric-icon-wrapper,
.metric-card.status-success .metric-icon-wrapper {
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-success-500) 15%, transparent) 0%,
    color-mix(in srgb, var(--color-success-400) 10%, transparent) 100%);
  color: var(--color-success-500);
  border: 1px solid color-mix(in srgb, var(--color-success-500) 20%, transparent);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.metric-card.status-success .metric-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  transition: left 0.6s ease;
}

.metric-card.status-success.interactive:hover .metric-icon-wrapper::before {
  left: 100%;
}

.metric-card.info .metric-icon-wrapper,
.metric-card.status-info .metric-icon-wrapper {
  background: color-mix(in srgb, var(--color-info-500) 10%, transparent);
  color: var(--color-info-500);
}

.metric-card.muted .metric-icon-wrapper,
.metric-card.status-muted .metric-icon-wrapper {
  background: color-mix(in srgb, var(--text-tertiary) 10%, transparent);
  color: var(--text-tertiary);
}

.metric-card.status-warning .metric-icon-wrapper {
  background: color-mix(in srgb, var(--color-warning-500) 10%, transparent);
  color: var(--color-warning-500);
}

/* Toggle Switch */
.metric-toggle {
  position: relative;
  width: 48px;
  height: 26px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-border);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all var(--duration-normal);
  border-radius: 26px;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: all var(--duration-normal);
  border-radius: 50%;
  box-shadow: 0 2px 4px color-mix(in srgb, black 20%, transparent);
}

.toggle-input:checked + .toggle-label {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
}

.toggle-input:checked + .toggle-label:before {
  transform: translateX(22px);
}

/* Metric Content */
.metric-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-2);
  line-height: 1;
  transition: all var(--duration-normal);
}

.metric-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
}

/* Metric Change */
.metric-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--glass-border);
}

.metric-change.positive {
  background: color-mix(in srgb, var(--color-success-500) 8%, transparent);
  color: var(--color-success-500);
  border-color: color-mix(in srgb, var(--color-success-500) 20%, transparent);
}

.metric-change.negative {
  background: color-mix(in srgb, var(--color-error-500) 8%, transparent);
  color: var(--color-error-500);
  border-color: color-mix(in srgb, var(--color-error-500) 20%, transparent);
}

.metric-change.neutral {
  background: color-mix(in srgb, var(--text-tertiary) 8%, transparent);
  color: var(--text-secondary);
  border-color: color-mix(in srgb, var(--text-tertiary) 20%, transparent);
}

/* Interactive Hover Effect */
.metric-card.interactive {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.metric-card.interactive::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.metric-card.interactive:hover::after {
  opacity: 1;
}

.metric-card.interactive:hover .metric-value {
  color: var(--color-primary-500);
  transform: scale(1.05);
  text-shadow: 0 0 8px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

/* Enhanced success card styling */
.metric-card.status-success.interactive {
  border: 2px solid color-mix(in srgb, var(--color-success-500) 20%, var(--glass-border));
  background: radial-gradient(circle at top right, 
    color-mix(in srgb, var(--color-success-500) 3%, var(--glass-bg)) 0%,
    var(--glass-bg) 70%);
}

.metric-card.status-success.interactive:hover {
  border-color: var(--color-success-500);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 
    0 16px 40px color-mix(in srgb, var(--color-success-500) 15%, transparent),
    0 8px 24px color-mix(in srgb, black 10%, transparent),
    inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
}

.metric-card.status-success.interactive:hover .metric-value {
  color: var(--color-success-400);
  text-shadow: 
    0 0 12px color-mix(in srgb, var(--color-success-500) 40%, transparent),
    0 0 24px color-mix(in srgb, var(--color-success-400) 20%, transparent);
}

.metric-card.status-success.interactive:active {
  transform: translateY(-2px) scale(1.01);
  transition: transform 0.1s ease;
}

/* Pulse animation for interactive success cards */
@keyframes success-pulse {
  0%, 100% {
    box-shadow: 
      0 0 0 0 color-mix(in srgb, var(--color-success-500) 25%, transparent),
      0 16px 40px color-mix(in srgb, var(--color-success-500) 15%, transparent);
  }
  50% {
    box-shadow: 
      0 0 0 8px color-mix(in srgb, var(--color-success-500) 0%, transparent),
      0 16px 40px color-mix(in srgb, var(--color-success-500) 15%, transparent);
  }
}

.metric-card.status-success.interactive:focus-within {
  animation: success-pulse 2s infinite;
  border-color: var(--color-success-500);
}

/* Pulse Animation for Live Data */
.live-indicator {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  width: 8px;
  height: 8px;
  background: var(--color-success-500);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-success-500) 40%, transparent);
  }
  70% {
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-success-500) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-success-500) 0%, transparent);
  }
}

/* Chart Preview Area */
.chart-preview {
  height: 60px;
  margin-top: var(--spacing-4);
  background: linear-gradient(to right, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent) 0%, 
    color-mix(in srgb, var(--color-primary-500) 5%, transparent) 50%, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent) 100%);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.chart-preview::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary-500);
  transform: translateY(-50%);
  opacity: 0.3;
}

/* Loading Animation */
.loading-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent, 
    var(--color-primary-500), 
    transparent);
  animation: loading 2s linear infinite;
  opacity: 0;
  transition: opacity var(--duration-normal);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  overflow: hidden;
}

.metric-card:hover .loading-bar {
  opacity: 1;
}

/* Enhanced loading bar for success status */
.metric-card.status-success .loading-bar {
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--color-success-500) 25%,
    var(--color-success-400) 50%,
    var(--color-success-500) 75%,
    transparent 100%);
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-success-500) 40%, transparent);
  height: 4px;
}

.metric-card.status-success.interactive:hover .loading-bar {
  background: linear-gradient(90deg, 
    transparent 0%,
    var(--color-success-400) 20%,
    var(--color-success-300) 40%,
    rgba(52, 211, 153, 0.9) 60%,
    var(--color-success-400) 80%,
    transparent 100%);
  box-shadow: 
    0 0 12px color-mix(in srgb, var(--color-success-500) 60%, transparent),
    0 0 24px color-mix(in srgb, var(--color-success-400) 30%, transparent);
  animation: success-loading 1.5s ease-in-out infinite;
}

@keyframes success-loading {
  0% {
    transform: translateX(-100%) scaleX(0.8);
    opacity: 0.6;
  }
  50% {
    transform: translateX(0%) scaleX(1.2);
    opacity: 1;
  }
  100% {
    transform: translateX(100%) scaleX(0.8);
    opacity: 0.6;
  }
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Responsive Design */
/* Dashboard responsive enhancements */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
    padding: var(--spacing-5) var(--spacing-6);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    padding: var(--spacing-5);
    gap: var(--spacing-4);
  }

  .metric-value {
    font-size: var(--font-size-3xl);
  }
  
  .header-text h1 {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    border-radius: var(--radius-xl);
    margin: var(--spacing-2);
  }
  
  .dashboard-header {
    padding: var(--spacing-4) var(--spacing-5);
  }
  
  .metrics-grid {
    padding: var(--spacing-4);
  }
  
  .metric-card {
    padding: var(--spacing-4);
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}

/* Enhanced Performance Optimizations */
.metric-card {
  contain: layout style paint;
}

.dashboard-card {
  contain: layout style;
}

/* Spin animation for refresh button */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Dark theme optimizations */
@media (prefers-color-scheme: dark) {
  .metric-card {
    box-shadow: 
      0 12px 32px color-mix(in srgb, black 12%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 3%, transparent);
  }
  
  .dashboard-card {
    box-shadow: 
      0 20px 60px color-mix(in srgb, black 25%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 3%, transparent);
  }
}

/* Live data simulation enhancements */
.live-indicator.pulsing {
  animation-duration: 1s;
}

/* Focus and accessibility improvements */
.action-btn:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.toggle-label:focus-within {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.metric-card:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

/* Header Action Groups */
.header-action-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal);
}

.header-action-group:hover {
  border-color: var(--glass-border-hover);
  background: var(--glass-hover-bg);
}

/* Primary Actions Group */
.primary-actions {
  border-color: color-mix(in srgb, var(--color-primary-500) 20%, var(--glass-border));
}

/* Data Actions Group */
.data-actions {
  border-color: color-mix(in srgb, var(--color-info-500) 20%, var(--glass-border));
}

/* Export Actions Group */
.export-actions {
  border-color: color-mix(in srgb, var(--color-secondary-500) 20%, var(--glass-border));
}

/* Export Dropdown */
.dropdown-container {
  position: relative;
}

.export-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  min-width: 160px;
  padding: var(--spacing-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 
    0 12px 32px color-mix(in srgb, black 15%, transparent),
    0 4px 16px color-mix(in srgb, black 8%, transparent);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.export-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  text-align: left;
  width: 100%;
}

.export-option:hover {
  background: var(--glass-hover-bg);
  color: var(--color-primary-500);
}

.export-option:active {
  transform: scale(0.98);
}

/* Responsive Header Actions */
@media (max-width: 1024px) {
  .header-action-group {
    flex-wrap: wrap;
  }
  
  .data-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-actions .unified-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header-action-group {
    margin-bottom: var(--spacing-2);
    width: 100%;
    justify-content: center;
  }
  
  .primary-actions,
  .data-actions,
  .export-actions {
    width: 100%;
    justify-content: center;
  }
  
  .export-dropdown {
    left: 0;
    right: auto;
    width: 100%;
  }
}

/* Enhanced Header Layout Animation */
.header-action-group {
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .action-btn,
  .toggle-label,
  .loading-bar,
  .live-indicator,
  .header-action-group {
    transition: none;
    animation: none;
  }
  
  .metric-card:hover {
    transform: none;
  }
  
  .action-btn:hover {
    transform: none;
  }
  
  .header-action-group:hover {
    transform: none;
  }
}
</style>
