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
    <div class="dashboard-content">
      <!-- Enhanced Gamification Section -->
      <section class="dashboard-section gamification-section">
        <div class="gamification-hud">
          <div class="hud-content">
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
      <section class="dashboard-section quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
          <p class="section-subtitle">Jump into your gaming career tools</p>
        </div>
        
        <div class="quick-actions-grid">
          <Card variant="glass" class="action-card">
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
          </Card>

          <Card variant="glass" class="action-card">
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
          </Card>

          <Card variant="glass" class="action-card">
            <div class="action-content">
              <div class="action-icon-wrapper">
                <AppIcon name="mdi-domain" class="action-icon" />
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
          </Card>

          <Card variant="glass" class="action-card">
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
          </Card>
        </div>
      </section>

      <!-- Content Dashboard Grid -->
      <section class="dashboard-section content-section">
        <div class="content-grid">
          <!-- Real-Time Chat Panel -->
          <Card variant="glass" class="content-panel chat-panel">
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
          </Card>

          <!-- Skills Overview Panel -->
          <Card variant="glass" class="content-panel skills-panel">
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
          </Card>

          <!-- Live Jobs Panel -->
          <Card variant="glass" class="content-panel jobs-panel">
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
          </Card>

          <!-- AI Insights Panel -->
          <Card variant="glass" class="content-panel insights-panel">
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
          </Card>

          <!-- Activity Timeline Panel -->
          <Card variant="glass" class="content-panel activity-panel">
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
          </Card>
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
import { GAMING_STUDIOS } from '@/data/gaming-studios';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { computedref } from 'vue'
import { useRouter } from 'vue-router'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import HeaderActions from '@/components/ui/HeaderActions.vue'
import Card from '@/components/Card.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import SearchInput from '@/components/SearchInput.vue'
import PushToTalkButton from '@/components/PushToTalkButton.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import RealTimeChat from '@/components/RealTimeChat.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UiChip from '@/components/ui/UiChip.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { GAME_ENGINES, CONTENT_TOOLS, SKILL_CATEGORIES } from '@/shared/constants/skills'
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
    
  } catch (_error) {
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
  

  const refreshInterval = setInterval(fetchLiveData, 5 * 60 * 1000)
  
  return () => clearInterval(refreshInterval)
})
</script>

  <style scoped>
.dashboard-view {
  background: var(--background-primary);
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  padding: var(--spacing-lg);
  max-width: var(--page-container-max-width);
}

.header-actions-group {
  display: flex;
  align-items: center;
}

.header-search {
}

.gamification-section {
}

.gamification-hud {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--radius-lg);
}

.hud-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.level-info {
  display: flex;
  align-items: center;
}

.level-badge {
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
}

.xp-bar-bg {
  border-radius: var(--radius-full);
  overflow: hidden;
}

.xp-bar-fill {
  border-radius: var(--radius-full);
}

.xp-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
}

.streak-counter {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.streak-icon {
}

.hud-actions {
  display: flex;
  flex-wrap: wrap;
}

.modal-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.quest-modal,
.achievements-modal {
  border-radius: var(--radius-lg);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

  color: var(--text-primary);
  font-family: var(--font-gaming);
  font-size: var(--font-size-xl);
}

.quest-list {
  display: flex;
  flex-direction: column;
}

.quest-item {
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-info {
}

.quest-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.quest-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
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
}

.progress-bar {
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  background: var(--neon-primary);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.achievements-grid {
  display: grid;
}

.achievement-item {
  border-radius: var(--radius-md);
  text-align: center;
}

.achievement-item.unlocked {
  border-color: var(--neon-primary);
}

.achievement-item:not(.unlocked) {
}

.achievement-icon {
}

.achievement-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.achievement-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.dashboard-section {
}

.section-header {
}

.section-title {
  color: var(--text-primary);
}

.section-subtitle {
  color: var(--text-secondary);
}

.quick-actions-grid {
  display: grid;
  align-items: stretch;
}

.action-card {
  position: relative;
  cursor: pointer;
}

.action-card:hover {
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.action-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  color: white;
}

  color: var(--text-primary);
}

.action-text p {
  color: var(--text-secondary);
}

.action-button {
  margin-top: auto;
}

.content-grid {
  display: grid;
  align-items: stretch;
}

.content-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-secondary);
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
}

.panel-icon {
  color: var(--neon-cyber);
}

.panel-title {
  color: var(--text-primary);
}

.panel-subtitle {
  color: var(--text-secondary);
}

.panel-content {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
}

.view-all-button {
  margin-top: auto;
  align-self: flex-start;
}

.jobs-list {
  display: flex;
  flex-direction: column;
}

.job-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--surface-tertiary);
}

.job-info {
}

.job-title {
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-company {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
}

.job-actions {
  display: flex;
  align-items: center;
}

.insights-content {
  display: flex;
  flex-direction: column;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  background: var(--surface-tertiary);
}

.insight-icon {
  color: var(--neon-primary);
}

.insight-details {
}

.insight-text {
  color: var(--text-primary);
}

.activity-timeline {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  background: var(--surface-tertiary);
}

.activity-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-secondary);
}

.activity-icon {
  color: var(--neon-cyber);
}

.activity-details {
}

.activity-description {
  color: var(--text-primary);
}

.activity-timestamp {
  color: var(--text-secondary);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-icon,
.empty-icon {
  color: var(--text-secondary);
}

.loading-icon.spin {
}

.loading-state p,
.empty-state p {
  color: var(--text-secondary);
}

@keyframes pulse-glow {
  }
  }
}

@keyframes spin {
}


    grid-auto-rows: auto;
  }

  .dashboard-content {
  }
  
  .quick-actions-grid {
  }
  
  .action-content {
    flex-direction: row;
    text-align: left;
  }
  
  .action-icon-wrapper {
  }
  
  .hud-content {
  }
  
  .level-badge {
  }
}

.action-card:hover .action-icon-wrapper {
}

.quest-item:hover,
.achievement-item.unlocked:hover {
  border-color: var(--neon-primary);
}
</style>
