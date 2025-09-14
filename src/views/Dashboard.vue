<template>
  <StandardPageLayout
    title="Gaming Career Dashboard"
    subtitle="Your command center for gaming industry success"
    title-icon="mdi-view-dashboard"
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="md" priority="secondary">
        <SearchInput 
          placeholder="Search jobs, studios, skills..."
          class="header-search"
          variant="ghost"
        />
        <UnifiedButton
          variant="ghost"
          size="md"
          leading-icon="mdi-microphone"
          tooltip="Voice Commands"
          aria-label="Voice Commands"
        />
        <PushToTalkButton />
        <ToastNotification />
      </HeaderActions>
    </template>

    <!-- Main Dashboard Content -->
    <div class="container-xl space-y-8">
      <!-- Enhanced Gamification Section -->
      <section class="mb-8">
        <div class="glass-strong p-6 rounded-lg">
          <div class="flex items-center justify-between gap-6 flex-wrap">
            <div class="level-info">
              <div class="level-badge">🏆</div>
              <div class="level-text">
                <div class="level-number">Level {{ userLevel }}</div>
                <div class="level-title">{{ levelTitle }}</div>
              </div>
            </div>
            
            <div class="xp-bar">
              <div class="xp-bar-bg">
                <div class="xp-bar-fill" :style="{ width: xpPercentage + '%' }"></div>
              </div>
              <div class="xp-text">{{ currentXP }} / {{ requiredXP }} XP</div>
            </div>

            <div class="streak-counter">
              <span class="streak-icon">🔥</span>
              <span>{{ streakDays }} Day Streak</span>
            </div>

            <div class="hud-actions">
              <UnifiedButton variant="gaming" size="sm" leading-icon="mdi-target" @click="showQuests = true">
                Daily Quests
              </UnifiedButton>
              <UnifiedButton variant="gaming" size="sm" leading-icon="mdi-trophy" @click="showAchievements = true">
                Achievements
              </UnifiedButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions Grid -->
      <section>
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-glass-enhanced mb-2">Quick Actions</h2>
          <p class="text-glass-enhanced opacity-80">Jump into your gaming career tools</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UnifiedCard variant="glass" class="action-card neon-interactive">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="mdi-file-document-edit" class="action-icon" />
              </div>
              <div class="action-text">
                <h3>Resume Builder</h3>
                <p>AI-powered resume optimization for gaming roles</p>
              </div>
              <UnifiedButton
                variant="primary"
                size="sm"
                class="action-button"
                @click="navigateTo('/documents')"
              >
                Build Resume
              </UnifiedButton>
            </div>
          </UnifiedCard>

          <UnifiedCard variant="glass" class="action-card neon-interactive">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="mdi-briefcase-search" class="action-icon" />
              </div>
              <div class="action-text">
                <h3>Job Search</h3>
                <p>Find gaming industry opportunities worldwide</p>
              </div>
              <UnifiedButton
                variant="primary"
                size="sm"
                class="action-button"
                @click="navigateTo('/jobs')"
              >
                Search Jobs
              </UnifiedButton>
            </div>
          </UnifiedCard>

          <UnifiedCard variant="glass" class="action-card neon-interactive">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="mdi-domain" class="action-icon" />
              </div>
              <div class="action-text">
                <h3>Studios Explorer</h3>
                <p>Discover gaming companies and their culture</p>
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

          <UnifiedCard variant="glass" class="action-card neon-interactive">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="mdi-account-voice" class="action-icon" />
              </div>
              <div class="action-text">
                <h3>AI Interview</h3>
                <p>Practice interviews with AI-powered scenarios</p>
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
      <section>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Real-Time Chat Panel -->
          <UnifiedCard variant="glass" class="content-panel chat-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="mdi-message-text" class="panel-icon" />
                <div>
                  <h3 class="panel-title">AI Assistant</h3>
                  <p class="panel-subtitle">Get instant help and guidance</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-fullscreen"
                tooltip="Expand Chat"
                aria-label="Expand Chat"
              />
            </div>
            <div class="panel-content">
              <RealTimeChat />
            </div>
          </UnifiedCard>

          <!-- Skills Overview Panel -->
          <UnifiedCard variant="glass" class="content-panel skills-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="mdi-star-outline" class="panel-icon" />
                <div>
                  <h3 class="panel-title">Gaming Skills</h3>
                  <p class="panel-subtitle">Your technical expertise</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-plus"
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
          <UnifiedCard variant="glass" class="content-panel jobs-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="mdi-briefcase-clock" class="panel-icon" />
                <div>
                  <h3 class="panel-title">Live Job Opportunities</h3>
                  <p class="panel-subtitle">Fresh gaming industry positions</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-refresh"
                tooltip="Refresh Jobs"
                aria-label="Refresh Jobs"
                @click="refreshData"
              />
            </div>
            <div class="panel-content">
              <div v-if="isLoading" class="loading-state">
                <AppIcon name="mdi-loading" class="loading-icon" spin />
                <p>Loading live jobs...</p>
              </div>
              <div v-else-if="liveJobs.length === 0" class="empty-state">
                <AppIcon name="mdi-briefcase-off" class="empty-icon" />
                <p>No live jobs found</p>
              </div>
              <div v-else class="jobs-list">
                <div v-for="job in liveJobs" :key="job.id" class="job-item">
                  <div class="job-info">
                    <h4 class="job-title">{{ job.title }}</h4>
                    <p class="job-company">{{ job.company }}</p>
                    <div class="job-meta">
                      <UiBadge :label="job.location" variant="neutral" size="xs" />
                      <UiBadge :label="job.remote ? 'Remote' : 'On-site'" variant="neutral" size="xs" />
                    </div>
                  </div>
                  <div class="job-actions">
                    <UnifiedButton
                      variant="ghost"
                      size="xs"
                      leading-icon="mdi-open-in-new"
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
          <UnifiedCard variant="glass" class="content-panel insights-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="mdi-brain" class="panel-icon" />
                <div>
                  <h3 class="panel-title">AI Career Insights</h3>
                  <p class="panel-subtitle">Personalized recommendations</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-sparkles"
                tooltip="Generate Insights"
                aria-label="Generate Insights"
                @click="fetchLiveData"
              />
            </div>
            <div class="panel-content">
              <div v-if="isLoading" class="loading-state">
                <AppIcon name="mdi-loading" class="loading-icon" spin />
                <p>Analyzing career data...</p>
              </div>
              <div v-else-if="careerInsights" class="insights-content">
                <div class="insight-item">
                  <AppIcon name="mdi-trending-up" class="insight-icon" />
                  <div class="insight-details">
                    <p class="insight-text">{{ careerInsights.marketTrends }}</p>
                  </div>
                </div>
                <div class="insight-item">
                  <AppIcon name="mdi-star" class="insight-icon" />
                  <div class="insight-details">
                    <p class="insight-text">Top skills: {{ careerInsights.inDemandSkills?.slice(0, 3).join(', ') }}</p>
                  </div>
                </div>
                <div class="insight-item">
                  <AppIcon name="mdi-cash" class="insight-icon" />
                  <div class="insight-details">
                    <p class="insight-text">{{ careerInsights.salaryInsights }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <AppIcon name="mdi-robot-excited" class="empty-icon" />
                <p>Get AI-powered career insights</p>
              </div>
            </div>
          </UnifiedCard>

          <!-- Activity Timeline Panel -->
          <UnifiedCard variant="glass" class="content-panel activity-panel">
            <div class="panel-header">
              <div class="panel-title-wrapper">
                <AppIcon name="mdi-timeline-clock-outline" class="panel-icon" />
                <div>
                  <h3 class="panel-title">Recent Activity</h3>
                  <p class="panel-subtitle">Your latest career actions</p>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-refresh"
                tooltip="Refresh Activity"
                aria-label="Refresh Activity"
              />
            </div>
            <div class="panel-content">
              <div class="activity-timeline">
                <div class="activity-item">
                  <div class="activity-icon-wrapper">
                    <AppIcon name="mdi-file-document-outline" class="activity-icon" />
                  </div>
                  <div class="activity-details">
                    <p class="activity-description">Resume updated with new Unity experience</p>
                    <span class="activity-timestamp">2 hours ago</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon-wrapper">
                    <AppIcon name="mdi-send-outline" class="activity-icon" />
                  </div>
                  <div class="activity-details">
                    <p class="activity-description">Applied to 3 Game Developer positions</p>
                    <span class="activity-timestamp">1 day ago</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon-wrapper">
                    <AppIcon name="mdi-trophy-outline" class="activity-icon" />
                  </div>
                  <div class="activity-details">
                    <p class="activity-description">Achievement unlocked: Portfolio Master</p>
                    <span class="activity-timestamp">3 days ago</span>
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
      <div class="quest-modal glass-surface">
        <div class="modal-header">
          <h2>Daily Quests</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-close" @click="showQuests = false" />
        </div>
        <div class="quest-list">
          <div v-for="quest in dailyQuests" :key="quest.id" class="quest-item">
            <div class="quest-info">
              <div class="quest-title">{{ quest.title }}</div>
              <div class="quest-description">{{ quest.description }}</div>
              <div class="quest-reward">Reward: {{ quest.xpReward }} XP</div>
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
      <div class="achievements-modal glass-surface">
        <div class="modal-header">
          <h2>Achievements</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-close" @click="showAchievements = false" />
        </div>
        <div class="achievements-grid">
          <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item" :class="{ unlocked: achievement.unlocked }">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-title">{{ achievement.title }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import HeaderActions from '@/components/ui/HeaderActions.vue'
import UnifiedCard from '@/components/UnifiedCard.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import SearchInput from '@/components/SearchInput.vue'
import PushToTalkButton from '@/components/PushToTalkButton.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import RealTimeChat from '@/components/RealTimeChat.vue'
import CompactGamifyHUD from '@/components/CompactGamifyHUD.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UiChip from '@/components/ui/UiChip.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { GAME_ENGINES, CONTENT_TOOLS, SKILL_CATEGORIES } from '@/shared/constants/skills'
// import GAMING_STUDIOS from '@/data/gaming-studios' // Commented out for future use
import { searchJobsRefactored } from '@/services/JobAPIService'
import { useAIAnalytics } from '@/composables/useAIAnalytics'

defineOptions({ name: 'Dashboard' })

const router = useRouter()
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
    icon: '🚀',
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
    icon: '🏆',
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
    icon: '⭐',
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
  router.push(path)
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
    
  } catch (error) {
    console.error('Failed to fetch live data:', error)
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
  console.log('Dashboard mounted - Gaming Career Platform')
  fetchLiveData()
  
  // Set up periodic refresh every 5 minutes
  const refreshInterval = setInterval(fetchLiveData, 5 * 60 * 1000)
  
  return () => clearInterval(refreshInterval)
})
</script>

  <style scoped>
/* ===== GAMING CAREER DASHBOARD STYLES ===== */
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
  min-width: 320px;
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
  color: var(--text-primary);
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
  color: var(--text-primary);
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
  color: var(--text-primary);
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

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
}

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
  color: white;
}

.action-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
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

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.panel-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

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
  color: var(--text-primary);
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
  color: var(--text-primary);
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
  color: var(--text-primary);
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
    flex-direction: row;
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
