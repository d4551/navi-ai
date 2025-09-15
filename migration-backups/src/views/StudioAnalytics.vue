<template>
  <StandardPageLayout 
    page-type="gaming" 
    :title="'Studio Analytics'"
    :subtitle="'Intelligence dashboard for gaming industry insights'"
    :hero-stats="headerStats"
    max-width="xl"
  >
    <!-- Enhanced Header Actions -->
    <template #header-actions>
      <div class="header-controls">
        <UnifiedButton 
          variant="ghost" 
          size="sm" 
          leading-icon="mdi-filter-variant" 
          :class="{ 'is-active': showFilters }"
          @click="showFilters = !showFilters"
        >
          Filters
        </UnifiedButton>
        <UnifiedButton 
          variant="glass" 
          leading-icon="mdi-refresh" 
          :loading="isRefreshing"
          @click="refreshData"
        >
          Refresh
        </UnifiedButton>
        <UnifiedButton 
          variant="gaming" 
          leading-icon="mdi-download" 
          @click="exportAnalytics"
        >
          Export
        </UnifiedButton>
      </div>
    </template>

    <StudioSubNav 
      :database-count="analytics.totalStudios"
      :analytics-count="filteredStudios.length"
    />

    <!-- Interactive Filters Panel -->
    <Transition name="filter-panel">
      <section v-if="showFilters" class="unified-container mt-4">
        <div class="glass p-4 gap-4 rounded-lg filters-panel">
          <div class="filters-header">
            <h3 class="filters-title">
              <AppIcon name="mdi-filter-variant" />
              Analytics Filters
            </h3>
            <UnifiedButton variant="ghost" size="sm" @click="resetFilters">Reset</UnifiedButton>
          </div>
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Studio Size</label>
              <select v-model="filters.studioSize" class="glass-input">
                <option value="">All Sizes</option>
                <option value="small">Small (1-50)</option>
                <option value="medium">Medium (51-500)</option>
                <option value="large">Large (500+)</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Threat Level</label>
              <select v-model="filters.threatLevel" class="glass-input">
                <option value="">All Levels</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Region</label>
              <select v-model="filters.region" class="glass-input">
                <option value="">All Regions</option>
                <option value="north-america">North America</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Search Studios</label>
              <div class="search-input-wrapper">
                <AppIcon name="mdi-magnify" class="search-icon" />
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="glass-input search-input" 
                  placeholder="Search by name..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- Enhanced Overview Stats -->
    <section class="unified-container">
      <div class="analytics-stats-section">
        <div class="stats-grid">
          <div class="glass p-4 gap-4 rounded-lg stat-card neon-interactive" @click="focusMetric('studios')">
            <div class="stat-header">
              <AppIcon name="mdi-domain" class="stat-icon rgb-text-primary" />
              <div class="stat-info">
                <span class="stat-label">Total Studios</span>
                <span class="stat-subtitle">Active worldwide</span>
              </div>
            </div>
            <div class="stat-value animated-counter">{{ animatedStudios.toLocaleString() }}</div>
            <div class="stat-change positive">
              <div class="change-indicator">
                <AppIcon name="mdi-trending-up" />
                <span>+{{ analytics.growthRate }}%</span>
              </div>
              <span class="change-period">this year</span>
            </div>
            <div class="stat-sparkline">
              <div v-for="n in 12" :key="n" class="sparkline-bar" :style="{ height: `${Math.random() * 60 + 20}%` }"></div>
            </div>
          </div>

          <div class="glass p-4 gap-4 rounded-lg stat-card neon-interactive" @click="focusMetric('salary')">
            <div class="stat-header">
              <AppIcon name="mdi-currency-usd" class="stat-icon rgb-text-success" />
              <div class="stat-info">
                <span class="stat-label">Avg Salary</span>
                <span class="stat-subtitle">Industry median</span>
              </div>
            </div>
            <div class="stat-value animated-counter">${{ animatedSalary }}K</div>
            <div class="stat-change positive">
              <div class="change-indicator">
                <AppIcon name="mdi-trending-up" />
                <span>+12%</span>
              </div>
              <span class="change-period">vs last year</span>
            </div>
            <div class="salary-range-bar">
              <div class="range-segment" data-range="Junior"></div>
              <div class="range-segment" data-range="Mid"></div>
              <div class="range-segment active" data-range="Senior"></div>
            </div>
          </div>

          <div class="glass p-4 gap-4 rounded-lg stat-card neon-interactive" @click="focusMetric('jobs')">
            <div class="stat-header">
              <AppIcon name="mdi-briefcase" class="stat-icon rgb-text-warning" />
              <div class="stat-info">
                <span class="stat-label">Open Jobs</span>
                <span class="stat-subtitle">Currently available</span>
              </div>
            </div>
            <div class="stat-value animated-counter">{{ animatedJobs.toLocaleString() }}</div>
            <div class="stat-change neutral">
              <div class="change-indicator">
                <AppIcon name="mdi-trending-neutral" />
                <span>+3%</span>
              </div>
              <span class="change-period">vs last month</span>
            </div>
            <div class="job-categories">
              <div class="category-dot" data-category="Developer"></div>
              <div class="category-dot" data-category="Designer"></div>
              <div class="category-dot" data-category="Producer"></div>
              <div class="category-dot" data-category="Artist"></div>
            </div>
          </div>

          <div class="glass p-4 gap-4 rounded-lg stat-card neon-interactive" @click="focusMetric('market')">
            <div class="stat-header">
              <AppIcon name="mdi-chart-line" class="stat-icon rgb-text-info" />
              <div class="stat-info">
                <span class="stat-label">Market Cap</span>
                <span class="stat-subtitle">Gaming industry</span>
              </div>
            </div>
            <div class="stat-value animated-counter">$284B</div>
            <div class="stat-change positive">
              <div class="change-indicator">
                <AppIcon name="mdi-trending-up" />
                <span>+18%</span>
              </div>
              <span class="change-period">growth</span>
            </div>
            <div class="market-segments">
              <div class="segment mobile" title="Mobile: 45%"></div>
              <div class="segment pc" title="PC: 30%"></div>
              <div class="segment console" title="Console: 25%"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Analytics Dashboard -->
    <section class="unified-container">
      <div class="dashboard-section">
        <div class="dashboard-grid">
          <!-- Market Intelligence -->
          <div class="glass p-4 gap-4 rounded-lg analytics-panel">
            <div class="section-header">
              <h3 class="section-title">
                <AppIcon name="mdi-chart-box" />
                Market Intelligence
              </h3>
            </div>
            <div class="section-body">
              <div class="chart-container">
                <canvas ref="marketChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Salary Intelligence -->
          <div class="glass p-4 gap-4 rounded-lg analytics-panel">
            <div class="section-header">
              <h3 class="section-title">
                <AppIcon name="mdi-currency-usd" />
                Salary Intelligence
              </h3>
            </div>
            <div class="section-body">
              <div class="salary-breakdown">
                <div v-for="salary in salaryData" :key="salary.role" class="salary-item">
                  <div class="salary-info">
                    <span class="role-name">{{ salary.role }}</span>
                    <span class="salary-range">${{ salary.min }}K - ${{ salary.max }}K</span>
                  </div>
                  <div class="salary-progress">
                    <div class="progress-track">
                      <div 
                        class="progress-fill" 
                        :style="{ width: `${salary.percentage}%` }"
                      ></div>
                    </div>
                    <span class="percentage">{{ salary.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Studio Rankings -->
          <div class="glass p-4 gap-4 rounded-lg analytics-panel full-width">
            <div class="section-header">
              <h3 class="section-title">
                <AppIcon name="mdi-trophy" />
                Top Gaming Studios
                <span class="results-count">({{ filteredStudios.length }} studios)</span>
              </h3>
              <div class="section-controls">
                <select v-model="sortBy" class="sort-select glass-input">
                  <option value="rank">Sort by Rank</option>
                  <option value="employees">Sort by Size</option>
                  <option value="jobs">Sort by Open Jobs</option>
                  <option value="games">Sort by Games</option>
                </select>
                <UnifiedButton 
                  variant="ghost" 
                  size="sm" 
                  trailing-icon="mdi-arrow-right"
                  @click="expandStudios = !expandStudios"
                >
                  {{ expandStudios ? 'Show Less' : 'View All' }}
                </UnifiedButton>
              </div>
            </div>
            <div class="section-body">
              <Transition name="loading-fade">
                <div v-if="isLoadingStudios" class="loading-skeleton">
                  <div v-for="n in 5" :key="n" class="skeleton-item">
                    <div class="skeleton-rank"></div>
                    <div class="skeleton-content">
                      <div class="skeleton-name"></div>
                      <div class="skeleton-metrics"></div>
                    </div>
                    <div class="skeleton-status"></div>
                  </div>
                </div>
                <div v-else class="rankings-list">
                  <TransitionGroup name="studio-item" tag="div">
                    <div 
                      v-for="(studio, index) in displayedStudios" 
                      :key="studio.id" 
                      class="ranking-item interactive-item"
                      :class="{ 'is-selected': selectedStudio?.id === studio.id }"
                      role="button"
                      tabindex="0"
                      :aria-label="`Select ${studio.name} studio details`"
                      @click="selectStudio(studio)"
                      @keydown.enter="selectStudio(studio)"
                      @keydown.space.prevent="selectStudio(studio)"
                    >
                      <div class="rank-badge">
                        <span class="rank-number">{{ index + 1 }}</span>
                        <div class="rank-change" :class="studio.rankChange > 0 ? 'positive' : 'negative'">
                          <AppIcon :name="studio.rankChange > 0 ? 'mdi-trending-up' : 'mdi-trending-down'" />
                        </div>
                      </div>
                      <div class="studio-details">
                        <div class="studio-header">
                          <div class="studio-name">{{ studio.name }}</div>
                          <div class="studio-location">{{ studio.location }}</div>
                        </div>
                        <div class="studio-metrics">
                          <div class="metric-item">
                            <AppIcon name="mdi-account-group" />
                            <span class="metric-value">{{ studio.employeeCount.toLocaleString() }}+</span>
                            <span class="metric-label">employees</span>
                          </div>
                          <div class="metric-item">
                            <AppIcon name="mdi-gamepad-variant" />
                            <span class="metric-value">{{ studio.gameCount }}</span>
                            <span class="metric-label">games</span>
                          </div>
                          <div class="metric-item">
                            <AppIcon name="mdi-briefcase" />
                            <span class="metric-value">{{ studio.openJobs }}</span>
                            <span class="metric-label">positions</span>
                          </div>
                        </div>
                        <div class="studio-progress">
                          <div class="progress-track">
                            <div 
                              class="progress-fill" 
                              :style="{ width: `${studio.marketShare}%` }"
                            ></div>
                          </div>
                          <span class="progress-label">{{ studio.marketShare }}% market share</span>
                        </div>
                      </div>
                      <div class="studio-status">
                        <div class="threat-indicator" :class="getThreatClass(studio.threatLevel)">
                          <AppIcon :name="getThreatIcon(studio.threatLevel)" />
                          {{ studio.threatLevel }}
                        </div>
                        <div class="studio-actions">
                          <UnifiedButton variant="ghost" size="xs" leading-icon="mdi-eye">Details</UnifiedButton>
                        </div>
                      </div>
                    </div>
                  </TransitionGroup>
                
                  <!-- Show More Button -->
                  <div v-if="!expandStudios && filteredStudios.length > 5" class="show-more-section">
                    <UnifiedButton 
                      variant="glass" 
                      trailing-icon="mdi-chevron-down"
                      @click="expandStudios = true"
                    >
                      Show {{ filteredStudios.length - 5 }} More Studios
                    </UnifiedButton>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Technology Trends -->
          <div class="glass p-4 gap-4 rounded-lg analytics-panel">
            <div class="section-header">
              <h3 class="section-title">
                <AppIcon name="mdi-code-tags" />
                Technology Trends
              </h3>
            </div>
            <div class="section-body">
              <div class="tech-list">
                <div v-for="tech in trendingTech" :key="tech.name" class="tech-item">
                  <div class="tech-info">
                    <span class="tech-name">{{ tech.name }}</span>
                    <span class="tech-percentage">{{ tech.popularity }}%</span>
                  </div>
                  <div class="tech-progress">
                    <div class="progress-track">
                      <div 
                        class="progress-fill tech-progress-fill" 
                        :style="{ width: `${tech.popularity}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Regional Intelligence -->
          <div class="glass p-4 gap-4 rounded-lg analytics-panel">
            <div class="section-header">
              <h3 class="section-title">
                <AppIcon name="mdi-map-marker" />
                Regional Distribution
              </h3>
            </div>
            <div class="section-body">
              <div class="region-list">
                <div v-for="region in regionData" :key="region.name" class="region-item">
                  <div class="region-info">
                    <span class="region-name">{{ region.name }}</span>
                    <span class="studio-count">{{ region.count }} studios</span>
                  </div>
                  <div class="region-indicator" :style="{ opacity: region.count / 150 }">
                    <AppIcon name="mdi-circle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Chart from 'chart.js/auto'
import type { Chart as ChartJS } from 'chart.js'
import { getChartTheme } from '@/utils/charts.js'
import { GameStudioService } from '@/services/GameStudioService'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import AppIcon from '@/components/ui/AppIcon.vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import StudioSubNav from '@/components/studio/StudioSubNav.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const theme = (() => { try { return useUnifiedTheme() } catch { return undefined as any } })()

// Enhanced state management
const isRefreshing = ref(false)
const isLoadingStudios = ref(false)
const showFilters = ref(false)
const expandStudios = ref(false)
const selectedStudio = ref<any>(null)
const sortBy = ref('rank')
const searchQuery = ref('')

// Filters state
const filters = ref({
  studioSize: '',
  threatLevel: '',
  region: ''
})

// Analytics data with animations
const analytics = ref({
  totalStudios: 1247,
  growthRate: 8.2,
  avgSalary: 98,
  openJobs: 12890
})

// Animated counters
const animatedStudios = ref(0)
const animatedSalary = ref(0)
const animatedJobs = ref(0)

const marketChart = ref<HTMLCanvasElement | null>(null)
let marketChartInstance: ChartJS | null = null

// Enhanced computed properties
const headerStats = computed(() => [
  { label: `${analytics.value.totalStudios} studios`, icon: 'mdi-domain', color: 'primary' },
  { label: `$${analytics.value.avgSalary}K avg salary`, icon: 'mdi-currency-usd', color: 'success' },
  { label: `${analytics.value.openJobs.toLocaleString()} open jobs`, icon: 'mdi-briefcase', color: 'warning' },
  { label: `+${analytics.value.growthRate}% growth`, icon: 'mdi-trending-up', color: 'info' }
])

// Filtered and sorted studios
const filteredStudios = computed(() => {
  let studios = [...topStudios.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    studios = studios.filter(studio => 
      studio.name.toLowerCase().includes(query)
    )
  }
  
  // Apply filters
  if (filters.value.studioSize) {
    studios = studios.filter(studio => {
      const size = studio.employeeCount
      switch (filters.value.studioSize) {
        case 'small': return size <= 50
        case 'medium': return size > 50 && size <= 500
        case 'large': return size > 500
        default: return true
      }
    })
  }
  
  if (filters.value.threatLevel) {
    studios = studios.filter(studio => studio.threatLevel === filters.value.threatLevel)
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'employees':
      studios.sort((a, b) => b.employeeCount - a.employeeCount)
      break
    case 'jobs':
      studios.sort((a, b) => b.openJobs - a.openJobs)
      break
    case 'games':
      studios.sort((a, b) => b.gameCount - a.gameCount)
      break
    default: // rank
      break
  }
  
  return studios
})

const displayedStudios = computed(() => {
  return expandStudios.value ? filteredStudios.value : filteredStudios.value.slice(0, 5)
})

// Salary data with proper structure
const salaryData = ref([
  { role: 'Game Developer', min: 75, max: 120, percentage: 75 },
  { role: 'Game Designer', min: 65, max: 105, percentage: 68 },
  { role: 'Technical Artist', min: 80, max: 130, percentage: 82 },
  { role: 'Producer', min: 90, max: 150, percentage: 88 }
])

const topStudios = ref([
  {
    id: '1',
    name: 'Epic Games',
    location: 'Cary, NC',
    employeeCount: 1000,
    gameCount: 15,
    openJobs: 45,
    threatLevel: 'HIGH',
    marketShare: 12,
    rankChange: 2
  },
  {
    id: '2', 
    name: 'Riot Games',
    location: 'Los Angeles, CA',
    employeeCount: 2500,
    gameCount: 8,
    openJobs: 67,
    threatLevel: 'HIGH',
    marketShare: 18,
    rankChange: -1
  },
  {
    id: '3',
    name: 'Valve Corporation',
    location: 'Seattle, WA',
    employeeCount: 400,
    gameCount: 25,
    openJobs: 12,
    threatLevel: 'MEDIUM',
    marketShare: 8,
    rankChange: 1
  },
  {
    id: '4',
    name: 'Blizzard Entertainment',
    location: 'Irvine, CA',
    employeeCount: 4700,
    gameCount: 22,
    openJobs: 89,
    threatLevel: 'HIGH',
    marketShare: 15,
    rankChange: -2
  },
  {
    id: '5',
    name: 'Ubisoft',
    location: 'Montreal, QC',
    employeeCount: 3200,
    gameCount: 35,
    openJobs: 78,
    threatLevel: 'MEDIUM',
    marketShare: 10,
    rankChange: 3
  },
  {
    id: '6',
    name: 'EA Sports',
    location: 'Orlando, FL',
    employeeCount: 2800,
    gameCount: 12,
    openJobs: 54,
    threatLevel: 'HIGH',
    marketShare: 14,
    rankChange: 0
  },
  {
    id: '7',
    name: 'Activision',
    location: 'Santa Monica, CA',
    employeeCount: 9800,
    gameCount: 18,
    openJobs: 123,
    threatLevel: 'HIGH',
    marketShare: 22,
    rankChange: 1
  },
  {
    id: '8',
    name: 'Nintendo EPD',
    location: 'Kyoto, Japan',
    employeeCount: 5400,
    gameCount: 45,
    openJobs: 34,
    threatLevel: 'MEDIUM',
    marketShare: 16,
    rankChange: -1
  }
])

const trendingTech = ref([
  { name: 'Unreal Engine 5', popularity: 85 },
  { name: 'Unity 3D', popularity: 92 },
  { name: 'C++', popularity: 78 },
  { name: 'C#', popularity: 81 },
  { name: 'Python', popularity: 67 },
  { name: 'JavaScript', popularity: 59 },
  { name: 'Blender', popularity: 72 },
  { name: 'Maya', popularity: 65 }
])

const regionData = ref([
  { name: 'San Francisco Bay Area', count: 127 },
  { name: 'Los Angeles', count: 89 },
  { name: 'Seattle', count: 76 },
  { name: 'Austin', count: 54 },
  { name: 'Montreal', count: 43 },
  { name: 'London', count: 38 }
])

// Enhanced helper functions
const getThreatClass = (threatLevel: string) => {
  return `threat-${threatLevel.toLowerCase()}`
}

const getThreatIcon = (threatLevel: string) => {
  switch (threatLevel) {
    case 'HIGH': return 'mdi-alert-circle'
    case 'MEDIUM': return 'mdi-alert'
    case 'LOW': return 'mdi-check-circle'
    default: return 'mdi-help-circle'
  }
}

const selectStudio = (studio: any) => {
  selectedStudio.value = selectedStudio.value?.id === studio.id ? null : studio
}

const resetFilters = () => {
  filters.value = {
    studioSize: '',
    threatLevel: '',
    region: ''
  }
  searchQuery.value = ''
}

const focusMetric = (metric: string) => {
  // Add visual focus effect or navigate to detailed view
  console.log('Focusing on metric:', metric)
}

// Animation functions
const animateCounter = (from: number, to: number, setter: (_value: number) => void, duration = 1000) => {
  const startTime = Date.now()
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const current = from + (to - from) * easeOutQuart(progress)
    setter(Math.floor(current))
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

const refreshData = async () => {
  isRefreshing.value = true
  isLoadingStudios.value = true
  
  try {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const studioService = GameStudioService.getInstance()
    const stats = await studioService.getStudioStats()
    
    analytics.value = {
      totalStudios: stats.totalStudios,
      growthRate: Math.round(stats.growthRate * 10) / 10,
      avgSalary: Math.round(stats.averageSalary / 1000),
      openJobs: stats.totalOpenPositions
    }
    
    // Animate counters
    animateCounter(0, analytics.value.totalStudios, (val) => animatedStudios.value = val)
    animateCounter(0, analytics.value.avgSalary, (val) => animatedSalary.value = val)
    animateCounter(0, analytics.value.openJobs, (val) => animatedJobs.value = val)
    
  } catch (error) {
    console.warn('Failed to refresh data:', error)
  } finally {
    isRefreshing.value = false
    isLoadingStudios.value = false
  }
}

const exportAnalytics = () => {
  const data = {
    analytics: analytics.value,
    topStudios: topStudios.value,
    salaryData: salaryData.value,
    trendingTech: trendingTech.value,
    regionData: regionData.value,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'studio-analytics-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

// Enhanced initialization
onMounted(async () => {
  // Initialize animated counters with staggered delays
  setTimeout(() => {
    animateCounter(0, analytics.value.totalStudios, (val) => animatedStudios.value = val, 1200)
  }, 200)
  
  setTimeout(() => {
    animateCounter(0, analytics.value.avgSalary, (val) => animatedSalary.value = val, 1000)
  }, 400)
  
  setTimeout(() => {
    animateCounter(0, analytics.value.openJobs, (val) => animatedJobs.value = val, 1400)
  }, 600)

  try {
    // Load initial data without refresh animation
    const studioService = GameStudioService.getInstance()
    const stats = await studioService.getStudioStats()
    
    analytics.value = {
      totalStudios: stats.totalStudios || analytics.value.totalStudios,
      growthRate: Math.round((stats.growthRate || analytics.value.growthRate) * 10) / 10,
      avgSalary: Math.round((stats.averageSalary || analytics.value.avgSalary * 1000) / 1000),
      openJobs: stats.totalOpenPositions || analytics.value.openJobs
    }
  } catch (error) {
    console.warn('Failed to load analytics data:', error)
  }

  // Enhanced chart initialization
  if (marketChart.value) {
    const chartTheme = theme ? getChartTheme(theme.colorScheme?.value || 'dark') : {
      backgroundColor: ['rgba(0, 255, 136, 0.2)'],
      borderColor: ['rgba(0, 255, 136, 0.8)'],
      textColor: 'var(--text-primary)',
      gridColor: 'var(--glass-border)'
    }

    marketChartInstance = new Chart(marketChart.value, {
      type: 'doughnut',
      data: {
        labels: ['AAA Studios', 'Indie Studios', 'Mobile Studios', 'VR Studios', 'AR Studios'],
        datasets: [
          {
            data: [42, 28, 18, 8, 4],
            backgroundColor: [
              'rgba(0, 255, 136, 0.8)',
              'rgba(0, 217, 255, 0.8)',
              'rgba(255, 0, 204, 0.8)',
              'rgba(255, 195, 0, 0.8)',
              'rgba(138, 43, 226, 0.8)'
            ],
            borderColor: [
              'rgba(0, 255, 136, 1)',
              'rgba(0, 217, 255, 1)',
              'rgba(255, 0, 204, 1)',
              'rgba(255, 195, 0, 1)',
              'rgba(138, 43, 226, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: chartTheme.textColor,
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 'normal'
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    })
  }
})

onUnmounted(() => {
  marketChartInstance?.destroy()
})
</script>

<style scoped>
/* Studio Analytics - Enhanced UX/UI Design */

/* Enhanced Header Controls */
.header-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-controls .unified-button.is-active {
  background: var(--glass-hover-bg);
  border-color: var(--neon-cyber);
  color: var(--neon-cyber);
}

/* Interactive Filters Panel */
.filter-panel-enter-active,
.filter-panel-leave-active {
  transition: all var(--duration-slow) var(--easing-ease-out);
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.filters-panel {
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-4);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-5);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.glass-input {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--duration-fast) var(--easing-ease-out);
  backdrop-filter: blur(8px);
}

.glass-input:focus {
  outline: none;
  border-color: var(--neon-cyber);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--neon-cyber) 20%, transparent);
  background: var(--glass-hover-bg);
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  pointer-events: none;
}

.search-input {
  padding-left: var(--spacing-10);
}

/* Enhanced Overview Stats */
.analytics-stats-section {
  margin-top: var(--spacing-6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-2);
}

.stat-card {
  padding: var(--spacing-6);
  transition: all var(--duration-normal) var(--easing-ease-out);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.interactive-card:hover {
  transform: translateY(-2px);
  border-color: var(--neon-primary);
  box-shadow: 
    var(--glass-shadow-elevated),
    0 0 24px color-mix(in srgb, var(--neon-primary) 20%, transparent);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  color: var(--text-primary);
  line-height: var(--line-height-none);
  margin-bottom: var(--spacing-3);
  letter-spacing: -0.02em;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.stat-change.positive { color: var(--color-success-400); }
.stat-change.negative { color: var(--color-error-400); }
.stat-change.neutral { color: var(--text-secondary); }

/* Dashboard Grid */
.dashboard-section {
  margin-top: var(--spacing-8);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: var(--spacing-6);
  align-items: start;
}

.analytics-panel {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.analytics-panel.full-width {
  grid-column: 1 / -1;
}

/* Section Structure */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 2px solid var(--glass-border);
  background: linear-gradient(90deg, 
    color-mix(in srgb, var(--glass-bg) 95%, transparent) 0%,
    var(--glass-bg) 100%);
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: var(--spacing-6);
  right: var(--spacing-6);
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%,
    var(--neon-primary) 50%,
    transparent 100%);
  opacity: 0.3;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.section-body {
  padding: var(--spacing-6);
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Chart Container */
.chart-container {
  position: relative;
  height: 300px;
  padding: var(--spacing-2);
}

/* Salary Breakdown */
.salary-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.salary-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.salary-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.salary-range {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.salary-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.progress-track {
  flex: 1;
  height: 6px;
  background: var(--glass-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-cyber));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--easing-ease-out);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.2) 0%, 
    transparent 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  border-radius: inherit;
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-shine {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.percentage {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

/* Studio Rankings */
.rankings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.ranking-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: var(--spacing-5);
  align-items: center;
  padding: var(--spacing-5);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-ease-out);
  min-height: 80px;
}

.ranking-item:hover {
  background: var(--glass-hover-bg);
  border-color: var(--border-strong);
  transform: translateX(4px);
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  color: var(--neon-primary);
  background: color-mix(in srgb, var(--neon-primary) 15%, transparent);
  border: 2px solid color-mix(in srgb, var(--neon-primary) 40%, transparent);
  border-radius: var(--radius-full);
  position: relative;
}

.studio-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.studio-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.studio-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.metric {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.studio-status {
  display: flex;
  align-items: center;
}

.threat-indicator {
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.threat-high {
  background: color-mix(in srgb, var(--color-error-500) 15%, transparent);
  color: var(--color-error-400);
  border: 1px solid color-mix(in srgb, var(--color-error-500) 30%, transparent);
}

.threat-medium {
  background: color-mix(in srgb, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-400);
  border: 1px solid color-mix(in srgb, var(--color-warning-500) 30%, transparent);
}

.threat-low {
  background: color-mix(in srgb, var(--color-success-500) 15%, transparent);
  color: var(--color-success-400);
  border: 1px solid color-mix(in srgb, var(--color-success-500) 30%, transparent);
}

/* Technology Trends */
.tech-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.tech-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.tech-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.tech-percentage {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--neon-cyber);
}

.tech-progress {
  width: 100%;
}

.tech-progress-fill {
  background: linear-gradient(90deg, var(--neon-cyber), var(--neon-magenta));
}

/* Regional Distribution */
.region-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.region-item:hover {
  background: var(--glass-hover-bg);
  border-color: var(--border-strong);
}

.region-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
}

.region-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.studio-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.region-indicator {
  color: var(--neon-primary);
  transition: opacity var(--duration-fast) var(--easing-ease-out);
}

/* Enhanced stat visualizations */
.stat-sparkline {
  display: flex;
  align-items: end;
  gap: var(--spacing-0-5);
  height: 20px;
  margin-top: var(--spacing-2);
}

.sparkline-bar {
  width: 4px;
  background: linear-gradient(to top, var(--neon-primary), var(--neon-cyber));
  border-radius: 2px;
  transition: height var(--duration-slow) var(--easing-ease-out);
  opacity: 0.7;
}

.salary-range-bar {
  display: flex;
  gap: var(--spacing-0-5);
  margin-top: var(--spacing-2);
}

.range-segment {
  flex: 1;
  height: 6px;
  background: var(--glass-border);
  border-radius: var(--radius-sm);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.range-segment.active {
  background: linear-gradient(90deg, var(--neon-primary), var(--color-success-400));
}

.job-categories {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.category-dot:nth-child(1) { background: var(--neon-primary); }
.category-dot:nth-child(2) { background: var(--neon-cyber); }
.category-dot:nth-child(3) { background: var(--neon-magenta); }
.category-dot:nth-child(4) { background: var(--color-warning-400); }

.market-segments {
  display: flex;
  gap: 1px;
  height: 8px;
  margin-top: var(--spacing-2);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.segment {
  height: 100%;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.segment.mobile { flex: 45; background: var(--neon-primary); }
.segment.pc { flex: 30; background: var(--neon-cyber); }
.segment.console { flex: 25; background: var(--neon-magenta); }

/* Enhanced Section Headers */
.results-count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
}

.section-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.sort-select {
  min-width: 150px;
}

/* Loading States & Skeletons */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.skeleton-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: var(--spacing-5);
  align-items: center;
  padding: var(--spacing-5);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  animation: skeleton-pulse 1.8s ease-in-out infinite;
  min-height: 80px;
  position: relative;
  overflow: hidden;
}

.skeleton-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 100%);
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-rank,
.skeleton-status {
  background: var(--glass-border);
  border-radius: var(--radius-md);
}

.skeleton-rank {
  width: 40px;
  height: 40px;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-name {
  width: 60%;
  height: 20px;
  background: var(--glass-border);
  border-radius: var(--radius-sm);
}

.skeleton-metrics {
  width: 80%;
  height: 14px;
  background: var(--glass-border);
  border-radius: var(--radius-sm);
}

.skeleton-status {
  width: 60px;
  height: 24px;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes skeleton-shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Enhanced Studio Items */
.studio-item-enter-active,
.studio-item-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.studio-item-enter-from,
.studio-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.studio-item-move {
  transition: transform var(--duration-normal) var(--easing-ease-out);
}

.interactive-item {
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.interactive-item:hover {
  background: var(--glass-hover-bg);
  border-color: var(--border-strong);
  transform: translateX(4px);
}

.interactive-item.is-selected {
  background: color-mix(in srgb, var(--neon-cyber) 10%, var(--glass-bg));
  border-color: var(--neon-cyber);
}

.interactive-item:focus-visible {
  outline: 2px solid var(--neon-primary);
  outline-offset: 2px;
  border-color: var(--neon-primary);
}

.interactive-card:focus-visible {
  outline: 2px solid var(--neon-primary);
  outline-offset: 2px;
  border-color: var(--neon-primary);
}

.rank-change {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: var(--font-size-xs);
}

.rank-change.positive {
  background: color-mix(in srgb, var(--color-success-400) 20%, transparent);
  color: var(--color-success-400);
}

.rank-change.negative {
  background: color-mix(in srgb, var(--color-error-400) 20%, transparent);
  color: var(--color-error-400);
}

.studio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2);
}

.studio-location {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-medium);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.metric-value {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.studio-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.progress-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  white-space: nowrap;
}

.studio-actions {
  margin-top: var(--spacing-2);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--easing-ease-out);
}

.interactive-item:hover .studio-actions {
  opacity: 1;
}

.show-more-section {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--glass-border);
}

/* Counter animations */
.animated-counter {
  font-variant-numeric: tabular-nums;
}

/* Enhanced Responsive Design */
@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: var(--spacing-5);
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-5);
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-4);
  }
  
  .filters-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  
  .analytics-panel {
    min-height: 350px;
  }
}

@media (max-width: 768px) {
  .header-controls {
    flex-wrap: wrap;
    gap: var(--spacing-2);
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .section-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
  
  .ranking-item {
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto auto;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
  }
  
  .studio-status {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: var(--spacing-3);
  }
  
  .studio-metrics {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .studio-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .analytics-panel {
    min-height: 300px;
  }
  
  .analytics-stats-section {
    margin-top: var(--spacing-4);
  }
  
  .dashboard-section {
    margin-top: var(--spacing-6);
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: var(--font-size-2xl);
  }
  
  .section-body {
    padding: var(--spacing-4);
  }
  
  .ranking-item {
    grid-template-columns: 1fr;
    text-align: left;
    padding: var(--spacing-4);
    min-height: auto;
  }
  
  .rank-badge {
    justify-self: start;
    width: 36px;
    height: 36px;
    font-size: var(--font-size-lg);
  }
  
  .filters-panel {
    padding: var(--spacing-4);
  }
  
  .show-more-section {
    margin-top: var(--spacing-3);
  }
  
  .stat-card {
    min-height: 140px;
    padding: var(--spacing-5);
  }
  
  .analytics-stats-section {
    margin-top: var(--spacing-3);
  }
  
  .dashboard-section {
    margin-top: var(--spacing-5);
  }
}

/* Dark mode specific enhancements */
@media (prefers-color-scheme: dark) {
  .skeleton-item {
    background: color-mix(in srgb, var(--glass-bg) 80%, transparent);
  }
  
  .sparkline-bar {
    opacity: 0.8;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .glass-input {
    border-width: 2px;
  }
  
  .interactive-card:hover {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .interactive-card:hover {
    transform: none;
  }
  
  .studio-item-enter-active,
  .studio-item-leave-active,
  .filter-panel-enter-active,
  .filter-panel-leave-active {
    transition: none;
  }
  
  .sparkline-bar,
  .range-segment,
  .category-dot,
  .segment {
    transition: none;
  }
}
</style>
