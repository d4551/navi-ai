<template>
  <StandardPageLayout
    title="Gaming Career Dashboard"
    subtitle="Your command center for gaming industry success"
    title-icon="mdi-view-dashboard"
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <!-- Skip Navigation Links -->
    <div class="skip-links">
      <a href="#gamification-section" class="skip-link">Skip to progress overview</a>
      <a href="#quick-actions" class="skip-link">Skip to quick actions</a>
      <a href="#live-jobs" class="skip-link">Skip to job listings</a>
      <a href="#career-insights" class="skip-link">Skip to career insights</a>
    </div>
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="lg" priority="secondary">
        <SearchInput
          placeholder="Search jobs, studios, skills..."
          class="header-search"
          variant="ghost"
        />
        <PushToTalkButton />
      </HeaderActions>
    </template>

    <!-- Main Dashboard Content -->
    <div class="content-wrapper">
      <!-- Enhanced Gamification Section -->
      <section id="gamification-section" class="section-glass gamification-hero" aria-labelledby="gamification-heading">
        <!-- Skeleton Loading for Gamification Section -->
        <LoadingSkeletons
          v-if="isLoading"
          variant="document"
          :show="true"
        />

        <div v-else class="card-gaming enhanced-gamification">
          <div class="gamification-header">
            <div class="level-display">
              <div class="level-badge">
                <AppIcon name="trophy" size="large" class="text-neon" />
                <div class="level-glow"></div>
              </div>
              <div class="level-info">
                <span class="level-number">{{ userLevel }}</span>
                <h1 class="level-title">{{ levelTitle }}</h1>
                <div class="xp-summary">
                  <span class="xp-current">{{ currentXP }}</span>
                  <span class="xp-separator">/</span>
                  <span class="xp-required">{{ requiredXP }}</span>
                  <span class="xp-label">XP</span>
                </div>
              </div>
            </div>

            <div class="streak-display">
              <div class="streak-flame">
                <AppIcon name="fire" class="text-neon-red animate-pulse" />
              </div>
              <div class="streak-info">
                <span class="streak-number">{{ streakDays }}</span>
                <span class="streak-label">Day Streak</span>
              </div>
            </div>
          </div>

          <div class="gamification-progress">
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Progress to Next Level</span>
                <span class="progress-percentage">{{ Math.round(xpPercentage) }}%</span>
              </div>
              <div class="xp-bar-container">
                <div class="xp-bar-bg">
                  <div class="xp-bar-fill" :style="{ width: xpPercentage + '%' }">
                    <div class="xp-bar-shine"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="hud-actions">
              <UnifiedButton variant="gaming" size="sm" leading-icon="EyeIcon" @click="showQuests = true">
                Daily Quests
              </UnifiedButton>
              <UnifiedButton variant="gaming" size="sm" leading-icon="TrophyIcon" @click="showAchievements = true">
                Achievements
              </UnifiedButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions Grid -->
      <section aria-labelledby="quick-actions">
        <div class="mb-6">
          <h2 id="quick-actions" class="section-title">Quick Actions</h2>
          <p class="section-subtitle">Jump into your gaming career tools</p>
        </div>

        <!-- Skeleton Loading for Quick Actions Grid -->
        <LoadingSkeletons
          v-if="isLoading"
          variant="grid"
          :grid-item-count="4"
          :show="true"
        />

        <div v-else class="enhanced-action-grid">
          <UnifiedCard variant="glass" class="action-card resume-action">
            <div class="action-content">
              <div class="action-header">
                <div class="action-icon-wrapper">
                  <AppIcon name="DocumentTextIcon" class="action-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="action-badge">AI-Powered</div>
              </div>
              <div class="action-body">
                <h3 class="action-title">Resume Builder</h3>
                <p class="action-description">Create professional resumes tailored for gaming industry roles with AI assistance</p>
                <div class="action-features">
                  <span class="feature-tag">ATS-Optimized</span>
                  <span class="feature-tag">Gaming Focus</span>
                </div>
              </div>
              <div class="action-footer">
                <UnifiedButton
                  variant="primary"
                  size="md"
                  class="action-button"
                  @click="navigateTo('/documents')"
                >
                  Build Resume
                  <AppIcon name="ArrowRightIcon" class="ml-2" />
                </UnifiedButton>
              </div>
            </div>
          </UnifiedCard>

          <UnifiedCard variant="glass" class="action-card jobs-action">
            <div class="action-content">
              <div class="action-header">
                <div class="action-icon-wrapper">
                  <AppIcon name="MagnifyingGlassIcon" class="action-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="action-badge">Live Feed</div>
              </div>
              <div class="action-body">
                <h3 class="action-title">Job Search</h3>
                <p class="action-description">Discover gaming industry opportunities from top studios worldwide</p>
                <div class="action-features">
                  <span class="feature-tag">{{ stats.totalJobs }}+ Jobs</span>
                  <span class="feature-tag">Real-time</span>
                </div>
              </div>
              <div class="action-footer">
                <UnifiedButton
                  variant="primary"
                  size="md"
                  class="action-button"
                  @click="navigateTo('/jobs')"
                >
                  Search Jobs
                  <AppIcon name="ArrowRightIcon" class="ml-2" />
                </UnifiedButton>
              </div>
            </div>
          </UnifiedCard>

          <UnifiedCard variant="glass" class="glass-card glass-interactive neon-purple focus:ring-neon">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="BuildingOfficeIcon" class="action-icon" />
              </div>
              <div class="action-text">
                <h3 class="text-glass-primary">Studios Explorer</h3>
                <p class="text-glass-secondary">Discover gaming companies and their culture</p>
              </div>
              <UnifiedButton
                variant="primary"
                size="sm"
                class="action-button"
                @click="navigateTo('/studios')"
              >
                Explore Studios
              </UnifiedButton>
            </div>
          </UnifiedCard>

          <UnifiedCard variant="glass" class="glass-card glass-interactive neon-orange focus:ring-neon">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="SpeakerWaveIcon" class="action-icon" />
              </div>
              <div class="action-text">
                <h3 class="text-glass-primary">AI Interview</h3>
                <p class="text-glass-secondary">Practice interviews with AI-powered scenarios</p>
              </div>
              <UnifiedButton
                variant="primary"
                size="sm"
                class="action-button"
                @click="navigateTo('/interview')"
              >
                Start Practice
              </UnifiedButton>
            </div>
          </UnifiedCard>
        </div>
      </section>

      <!-- Content Dashboard Grid -->
      <section class="dashboard-grid-section">
        <div class="dashboard-grid">
          <!-- Real-Time Chat Panel -->
          <UnifiedCard variant="glass" class="glass-card content-panel chat-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="ChatBubbleLeftRightIcon" class="panel-icon" />
                <div>
                  <h3 class="text-base font-semibold text-glass-primary">AI Assistant</h3>
                  <p class="text-sm text-glass-secondary">Get instant help and guidance</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="ArrowsPointingOutIcon"
                tooltip="Expand Chat"
                aria-label="Expand Chat"
              />
            </div>
            <div class="panel-content">
              <RealTimeChat v-if="RealTimeChat" />
              <div v-else class="chat-fallback">
                <AppIcon name="mdi-chat-outline" class="text-gray-400 dark:text-glass-secondary" />
                <span class="text-sm text-glass-secondary">Real-Time Chat unavailable</span>
              </div>
            </div>
          </UnifiedCard>

          <!-- Skills Overview Panel -->
          <UnifiedCard variant="glass" class="glass-card content-panel skills-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="StarIcon" class="panel-icon" />
                <div>
                  <h3 class="text-base font-semibold text-glass-primary">Gaming Skills</h3>
                  <p class="text-sm text-glass-secondary">Your technical expertise</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="PlusIcon"
                tooltip="Add Skill"
                aria-label="Add Skill"
              />
            </div>
            <div class="panel-content">
              <div class="skills-grid">
                <UiChip
                  v-for="skill in topSkills"
                  :key="skill"
                  :label="skill"
                  variant="gaming"
                  size="sm"
                />
              </div>
              <UnifiedButton
                variant="outline"
                size="sm"
                class="view-all-button"
                @click="navigateTo('/skills')"
              >
                Manage All Skills
              </UnifiedButton>
            </div>
          </UnifiedCard>

          <!-- Live Jobs Panel -->
          <UnifiedCard variant="glass" class="glass-card content-panel jobs-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="ClockIcon" class="panel-icon" />
                <div>
                  <h3 class="text-base font-semibold text-glass-primary">Live Job Opportunities</h3>
                  <p class="text-sm text-glass-secondary">Fresh gaming industry positions</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="ArrowPathIcon"
                tooltip="Refresh Jobs"
                aria-label="Refresh Jobs"
                @click="refreshData"
              />
            </div>
            <div class="panel-content">
              <!-- Enhanced Loading State with Skeleton -->
              <LoadingSkeletons
                v-if="isLoading"
                variant="document"
                :show="true"
              />
              <div v-else-if="liveJobs.length === 0" class="empty-state">
                <AppIcon name="BriefcaseIcon" class="empty-icon text-gray-400 dark:text-glass-secondary" />
                <p class="text-sm text-glass-secondary">No live jobs found</p>
              </div>
              <div v-else class="jobs-list">
                <div v-for="job in liveJobs" :key="job.id" class="job-item">
                  <div class="job-info">
                    <h4 class="text-sm font-semibold text-glass-primary">{{ job.title }}</h4>
                    <p class="text-xs text-glass-secondary">{{ job.company }}</p>
                    <div class="job-meta">
                      <UiBadge :label="job.location" variant="neutral" size="xs" />
                      <UiBadge :label="job.remote ? 'Remote' : 'On-site'" variant="neutral" size="xs" />
                    </div>
                  </div>
                  <div class="job-actions">
                    <UnifiedButton
                      variant="ghost"
                      size="xs"
                      leading-icon="ArrowTopRightOnSquareIcon"
                      tooltip="View Job"
                      aria-label="View Job"
                    />
                  </div>
                </div>
              </div>
              <UnifiedButton
                variant="outline"
                size="sm"
                class="view-all-button"
                @click="navigateTo('/jobs')"
              >
                View All Jobs
              </UnifiedButton>
            </div>
          </UnifiedCard>

          <!-- AI Insights Panel -->
          <UnifiedCard variant="glass" class="glass-card content-panel insights-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="CpuChipIcon" class="panel-icon" />
                <div>
                  <h3 class="text-base font-semibold text-glass-primary">AI Career Insights</h3>
                  <p class="text-sm text-glass-secondary">Personalized recommendations</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="SparklesIcon"
                tooltip="Generate Insights"
                aria-label="Generate Insights"
                @click="fetchLiveData"
              />
            </div>
            <div class="panel-content">
              <!-- Enhanced Loading State with Skeleton -->
              <LoadingSkeletons
                v-if="isLoading"
                variant="document"
                :show="true"
              />
              <div v-else-if="careerInsights" class="insights-content">
                <div class="insight-item">
                  <AppIcon name="ArrowTrendingUpIcon" class="insight-icon" />
                  <div class="insight-details">
                    <p class="text-sm text-glass-primary">{{ careerInsights.marketTrends }}</p>
                  </div>
                </div>
                <div class="insight-item">
                  <AppIcon name="StarIcon" class="insight-icon" />
                  <div class="insight-details">
                    <p class="text-sm text-glass-primary">Top skills: {{ careerInsights.inDemandSkills?.slice(0, 3).join(', ') }}</p>
                  </div>
                </div>
                <div class="insight-item">
                  <AppIcon name="CurrencyDollarIcon" class="insight-icon" />
                  <div class="insight-details">
                    <p class="text-sm text-glass-primary">{{ careerInsights.salaryInsights }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <AppIcon name="CpuChipIcon" class="empty-icon text-gray-400 dark:text-glass-secondary" />
                <p class="text-glass-secondary">Get AI-powered career insights</p>
              </div>
            </div>
          </UnifiedCard>

          <!-- Activity Timeline Panel -->
          <UnifiedCard variant="glass" class="glass-card content-panel activity-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="ClockIcon" class="panel-icon" />
                <div>
                  <h3 class="text-base font-semibold text-glass-primary">Recent Activity</h3>
                  <p class="text-sm text-glass-secondary">Your latest career actions</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="ArrowPathIcon"
                tooltip="Refresh Activity"
                aria-label="Refresh Activity"
              />
            </div>
            <div class="panel-content">
              <div class="activity-timeline">
                <div class="activity-item">
                  <div class="activity-icon-wrapper">
                    <AppIcon name="DocumentIcon" class="activity-icon" />
                  </div>
                  <div class="activity-details">
                    <p class="text-sm text-glass-primary">Resume updated with new Unity experience</p>
                    <span class="text-xs text-glass-secondary">2 hours ago</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon-wrapper">
                    <AppIcon name="mdi-send-outline" class="activity-icon" />
                  </div>
                  <div class="activity-details">
                    <p class="text-sm text-glass-primary">Applied to 3 Game Developer positions</p>
                    <span class="text-xs text-glass-secondary">1 day ago</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon-wrapper">
                    <AppIcon name="TrophyIcon" class="activity-icon" />
                  </div>
                  <div class="activity-details">
                    <p class="text-sm text-glass-primary">Achievement unlocked: Portfolio Master</p>
                    <span class="text-xs text-glass-secondary">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </UnifiedCard>
        </div>
      </section>
    </div>

    <!-- Gaming Dashboard Modals -->
    <!-- Daily Quests Modal -->
    <div v-if="showQuests" class="modal-overlay" @click.self="showQuests = false">
      <div class="quest-modal glass-modal">
        <div class="modal-header">
          <h2 class="heading-glass">Daily Quests</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="XMarkIcon" @click="showQuests = false" />
        </div>
        <div class="quest-list">
          <div v-for="quest in dailyQuests" :key="quest.id" class="quest-item">
            <div class="quest-info">
              <div class="quest-title text-glass-primary">{{ quest.title }}</div>
              <div class="quest-description text-glass-secondary">{{ quest.description }}</div>
              <div class="quest-reward text-neon-blue">Reward: {{ quest.xpReward }} XP</div>
            </div>
            <div class="quest-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (quest.progress / quest.total * 100) + '%' }"></div>
              </div>
              <span class="progress-text">{{ quest.progress }}/{{ quest.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Modal -->
    <div v-if="showAchievements" class="modal-overlay" @click.self="showAchievements = false">
      <div class="achievements-modal glass-modal">
        <div class="modal-header">
          <h2 class="heading-glass">Achievements</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="XMarkIcon" @click="showAchievements = false" />
        </div>
        <div class="achievements-grid">
          <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item" :class="{ unlocked: achievement.unlocked }">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-title text-glass-primary">{{ achievement.title }}</div>
              <div class="achievement-description text-glass-secondary">{{ achievement.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import HeaderActions from '@/components/ui/HeaderActions.vue'
import UnifiedCard from '@/components/UnifiedCard.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import SearchInput from '@/components/SearchInput.vue'
import PushToTalkButton from '@/components/PushToTalkButton.vue'
import RealTimeChat from '@/components/RealTimeChat.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UiChip from '@/components/ui/UiChip.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import LoadingSkeletons from '@/components/LoadingSkeletons.vue'
import { GAME_ENGINES, CONTENT_TOOLS, SKILL_CATEGORIES } from '@/shared/constants/skills'
import { logger } from '@/shared/utils/logger'
// import GAMING_STUDIOS from '@/data/gaming-studios' // Commented out for future use
import { searchJobsRefactored } from '@/services/JobAPIService'
import { useAIAnalytics } from '@/composables/useAIAnalytics'

defineOptions({ name: 'Dashboard' })

const _router = useRouter()
const { getCareerInsights } = useAIAnalytics()

// Gamification system state
const userLevel = ref(1)
const levelTitle = computed(() => {
  if (userLevel.value < 5) return 'Rookie Developer'
  if (userLevel.value < 10) return 'Junior Game Dev'
  if (userLevel.value < 20) return 'Senior Game Dev'
  return 'Game Dev Master'
})
const currentXP = ref(350)
const requiredXP = ref(1000)
const xpPercentage = computed(() => (currentXP.value / requiredXP.value) * 100)
const streakDays = ref(3)

// Modal states
const showQuests = ref(false)
const showAchievements = ref(false)

// Daily Quests
const dailyQuests = ref([
  {
    id: '1',
    title: 'Complete Your Profile',
    description: 'Add skills and experience to your profile',
    progress: 2,
    total: 5,
    xpReward: 50
  },
  {
    id: '2',
    title: 'Apply to Gaming Jobs',
    description: 'Submit applications to gaming positions',
    progress: 1,
    total: 3,
    xpReward: 75
  },
  {
    id: '3',
    title: 'Network Building',
    description: 'Connect with industry professionals',
    progress: 0,
    total: 2,
    xpReward: 100
  }
])

// Achievements
const achievements = ref([
  {
    id: '1',
    title: 'First Steps',
    description: 'Created your first resume',
    icon: 'RocketLaunchIcon',
    unlocked: true
  },
  {
    id: '2',
    title: 'Job Hunter',
    description: 'Applied to 10 positions',
    icon: '🎯',
    unlocked: true
  },
  {
    id: '3',
    title: 'Portfolio Master',
    description: 'Completed your portfolio',
    icon: 'TrophyIcon',
    unlocked: true
  },
  {
    id: '4',
    title: 'Network Builder',
    description: 'Connected with 25 professionals',
    icon: '🤝',
    unlocked: false
  },
  {
    id: '5',
    title: 'Interview Ace',
    description: 'Completed 5 AI interview sessions',
    icon: 'StarIcon',
    unlocked: false
  }
])

// Reactive data
const topSkills = computed(() => [
  ...GAME_ENGINES.slice(0, 3),
  ...CONTENT_TOOLS.slice(0, 3),
  ...SKILL_CATEGORIES.slice(0, 2)
])

// Commented out for future use
// const topStudios = computed(() => 
//   GAMING_STUDIOS.slice(0, 4).map(studio => ({
//     id: studio.id,
//     name: studio.name,
//     description: studio.description,
//     type: studio.employeeCount,
//     size: studio.location
//   }))
// )

// Live data state
const liveJobs = ref([])
const careerInsights = ref(null)
const isLoading = ref(true)
const stats = ref({
  totalJobs: 0,
  newJobsToday: 0,
  matchingJobs: 0
})

// Navigation helper
const navigateTo = (path) => {
  _router.push(path)
}

// Fetch live data
const fetchLiveData = async () => {
  try {
    isLoading.value = true
    
    // Fetch gaming jobs
    const jobResults = await searchJobsRefactored({
      title: 'game developer',
      remote: true,
      limit: 5
    })
    
    liveJobs.value = jobResults.jobs.slice(0, 3)
    stats.value.totalJobs = jobResults.totalResults
    stats.value.matchingJobs = jobResults.jobs.length

    // Get AI insights
    careerInsights.value = await getCareerInsights()
    
    // Simulate new jobs today (in real app, this would come from API)
    stats.value.newJobsToday = Math.floor(Math.random() * 50) + 10
    
  } catch (_error) {
    logger.error('Failed to fetch live data:', _error)
  } finally {
    isLoading.value = false
  }
}

// Refresh data
const refreshData = () => {
  fetchLiveData()
}

// Lifecycle
onMounted(() => {
  logger.info('Dashboard mounted - Gaming Career Platform')
  fetchLiveData()
  
  // Set up periodic refresh every 5 minutes
  const refreshInterval = setInterval(fetchLiveData, 5 * 60 * 1000)
  
  return () => clearInterval(refreshInterval)
})
</script>

  <style scoped>
/* ===== GAMING CAREER DASHBOARD STYLES ===== */

/* Content Wrapper - Fix layout alignment */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6, 2rem);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* Dashboard Container */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 2rem);
}

/* Gamification Section */
.gamification-section {
  width: 100%;
}

.gamification-card {
  padding: var(--spacing-lg, 1.5rem);
  border-radius: var(--radius-lg, 12px);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
}

.gamification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md, 1rem);
  gap: var(--spacing-md, 1rem);
}

.gamification-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 1rem);
}

/* Dashboard Grid */
.dashboard-grid-section {
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl, 2rem);
  align-items: start;
}

/* Panel Improvements */
.content-panel {
  height: fit-content;
  min-height: 300px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md, 1rem);
  border-bottom: 1px solid var(--glass-border);
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
}

.panel-icon {
  font-size: 1.25rem;
  color: var(--color-primary);
}

/* removed: panel-title/panel-subtitle now handled inline via Tailwind utilities */

.panel-content {
  padding: var(--spacing-md, 1rem);
  min-height: 200px;
}

/* Chat Fallback */
.chat-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
  gap: var(--spacing-sm, 0.75rem);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg, 1.5rem);
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .gamification-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
    gap: var(--spacing-sm, 0.75rem);
  }

  .hud-actions {
    justify-content: center;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--spacing-md, 1rem);
    gap: var(--spacing-lg, 1.5rem);
  }

  .gamification-card {
    padding: var(--spacing-md, 1rem);
  }

  .content-panel {
    min-height: 250px;
  }

  .dashboard-grid {
    gap: var(--spacing-md, 1rem);
  }

  .header-search {
    min-width: 200px;
  }
}

.dashboard-view {
  min-height: 100vh;
  background: var(--background-primary);
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  width: 100%;
}

/* Header Actions */
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-search {
  min-width: 300px;
  max-width: 400px;
  flex: 1;
}

/* Enhanced Gamification Section */
.gamification-section {
  margin-bottom: var(--spacing-8);
}

/* Gamification HUD now uses .glass-strong utility class */

/* HUD content now uses utility classes */

.level-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.level-badge {
  font-size: 2rem;
  animation: pulse-glow 2s infinite alternate;
}

.level-text {
  display: flex;
  flex-direction: column;
}

.level-number {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--neon-primary);
  font-family: var(--font-gaming);
}

.level-title {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.xp-bar {
  flex: 1;
  max-width: 200px;
  min-width: 150px;
}

.xp-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(var(--surface-rgb), 0.3);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-1);
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-cyber));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(var(--neon-primary-rgb), 0.5);
}

.xp-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
}

.streak-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background: rgba(var(--neon-primary-rgb), 0.1);
  border: 1px solid var(--neon-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.streak-icon {
  font-size: 1.2rem;
}

.hud-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.quest-modal,
.achievements-modal {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary-600);
  font-family: var(--font-gaming);
  font-size: var(--font-size-xl);
}

/* Quest Styles */
.quest-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.quest-item {
  background: rgba(var(--surface-rgb), 0.6);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.quest-info {
  flex: 1;
}

.quest-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.quest-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
}

.quest-reward {
  font-size: var(--font-size-xs);
  color: var(--neon-primary);
  font-weight: var(--font-weight-medium);
}

.quest-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  min-width: 80px;
}

.progress-bar {
  width: 60px;
  height: 4px;
  background: rgba(var(--surface-rgb), 0.3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--neon-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Achievement Styles */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.achievement-item {
  background: rgba(var(--surface-rgb), 0.6);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  text-align: center;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  border-color: var(--neon-primary);
  background: rgba(var(--neon-primary-rgb), 0.1);
}

.achievement-item:not(.unlocked) {
  opacity: 0.6;
}

.achievement-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-2);
}

.achievement-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.achievement-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Dashboard Sections */
.dashboard-section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

/* removed empty overrides to allow Tailwind plugin mappings to style these globally */

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(var(--neon-primary-rgb), 0.2);
}

.action-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.action-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--neon-primary), var(--neon-cyber));
  margin-bottom: 0.5rem;
  box-shadow: 0 0 20px rgba(var(--neon-primary-rgb), 0.3);
}

.action-icon {
  font-size: 1.75rem;
  color: var(--text-inverse);
}

.action-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin: 0;
}

.action-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
}

.action-button {
  margin-top: auto;
  width: 100%;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.content-panel {
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 400px;
}

/* Panel Headers */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--surface-secondary);
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-icon {
  font-size: 1.25rem;
  color: var(--neon-cyber);
}

/* removed duplicate legacy panel-title/panel-subtitle definitions */

.panel-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

/* Skills Panel */
.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-all-button {
  margin-top: auto;
  align-self: flex-start;
}

/* Jobs Panel */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  flex: 1;
}

.job-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: var(--surface-tertiary);
  border-radius: 8px;
  gap: 0.75rem;
}

.job-info {
  flex: 1;
  min-width: 0;
}

.job-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-company {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.job-actions {
  display: flex;
  align-items: center;
}

/* Insights Panel */
.insights-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-tertiary);
  border-radius: 8px;
}

.insight-icon {
  font-size: 1.25rem;
  color: var(--neon-primary);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.insight-details {
  flex: 1;
}

.insight-text {
  font-size: 0.875rem;
  color: var(--text-primary-600);
  line-height: 1.4;
  margin: 0;
}

/* Activity Timeline */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-tertiary);
  border-radius: 8px;
}

.activity-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--surface-secondary);
  flex-shrink: 0;
}

.activity-icon {
  font-size: 1rem;
  color: var(--neon-cyber);
}

.activity-details {
  flex: 1;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-primary-600);
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.activity-timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  flex: 1;
}

.loading-icon,
.empty-icon {
  font-size: 2rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.loading-icon.spin {
  animation: spin 1s linear infinite;
}

.loading-state p,
.empty-state p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 5px rgba(var(--neon-primary-rgb), 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(var(--neon-primary-rgb), 0.6);
    transform: scale(1.05);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hud-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-4);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: var(--spacing-4);
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-content {
    flex-direction: flex flex-wrap;
    text-align: left;
  }
  
  .action-icon-wrapper {
    width: 48px;
    height: 48px;
  }
  
  .hud-content {
    gap: var(--spacing-3);
  }
  
  .level-badge {
    font-size: 1.5rem;
  }
}

/* Enhanced hover effects with RGB neon */
.action-card:hover .action-icon-wrapper {
  box-shadow: 0 0 30px rgba(var(--neon-primary-rgb), 0.5);
}

.quest-item:hover,
.achievement-item.unlocked:hover {
  border-color: var(--neon-primary);
  box-shadow: 0 0 15px rgba(var(--neon-primary-rgb), 0.2);
}
</style>
