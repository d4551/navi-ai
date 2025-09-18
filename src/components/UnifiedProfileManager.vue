<!--
Unified Profile Manager Component

This component demonstrates how the unified profile system works across different contexts.
It shows how profile data entered once is automatically synchronized across:
- Job search preferences
- AI training context  
- Studio matching criteria
- Portfolio generation
- Resume building
- Settings and preferences
-->
<template>
  <div class="unified-profile-manager font-sans">
    <!-- Profile Status Header -->
    <div class="profile-status-header glass-card mb-4">
      <div class="flex items-center justify-between">
        <div class="profile-status-info">
          <h5 class="mb-1">
            <AppIcon name="UserIcon" />
            Unified Profile System
          </h5>
          <p class="text-secondary small mb-0">
            Edit once, sync everywhere - your profile data automatically updates
            across all features
          </p>
        </div>

        <div class="sync-status-indicators flex gap-glass-md">
          <!-- Profile Completeness -->
          <div
            class="sync-indicator"
            :class="{
              'text-success-600': completeness >= 80,
              'text-warning-600': completeness < 80,
            }"
          >
            <div class="indicator-icon">
              <AppIcon v-if="completeness >= 80" name="UserIcon-check" />
              <AppIcon v-else name="UserIcon-alert" />
            </div>
            <div class="indicator-text">
              <div class="text-xs font-weight-bold">
                {{ Math.round(completeness) }}%
              </div>
              <div class="text-xs text-secondary">Complete</div>
            </div>
          </div>

          <!-- Sync Status -->
          <div class="sync-indicator" :class="getSyncStatusClass()">
            <div class="indicator-icon">
              <AppIcon v-if="isLoading" name="ArrowPathIcon" class="mdi-spin" />
              <AppIcon
                v-else-if="syncStatus === 'success'"
                name="ArrowPathIcon"
              />
              <AppIcon
                v-else-if="syncStatus === 'error'"
                name="mdi-sync-alert"
              />
              <AppIcon v-else name="mdi-sync-off" />
            </div>
            <div class="indicator-text">
              <div class="text-xs font-weight-bold">
                {{ getSyncStatusText() }}
              </div>
              <div class="text-xs text-secondary">
                {{ lastSync ? `${getRelativeTime(lastSync)}` : 'Never' }}
              </div>
            </div>
          </div>

          <!-- System Count -->
          <div class="sync-indicator text-blue-600">
            <div class="indicator-icon">
              <AppIcon name="Squares2X2Icon" />
            </div>
            <div class="indicator-text">
              <div class="text-xs font-weight-bold">6</div>
              <div class="text-xs text-secondary">Systems</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="profile-quick-actions mt-3 flex gap-glass-sm">
        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="ArrowPathIcon"
          :disabled="isLoading"
          @click="forceSync"
        >
          Force Sync
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="EyeIcon"
          @click="showSyncDetails = !showSyncDetails"
        >
          {{ showSyncDetails ? 'Hide' : 'Show' }} Sync Details
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="CogIcon"
          @click="showSettings = !showSettings"
        >
          Settings
        </UnifiedButton>
      </div>
    </div>

    <!-- Sync Details Panel -->
    <div v-if="showSyncDetails" class="sync-details-panel glass-card mb-4">
      <h6 class="mb-3">
        <AppIcon name="InformationCircleIcon" class="mr-2" />
        Cross-System Integration Status
      </h6>

      <div class="flex flex-wrap g-3">
        <!-- Job Search System -->
        <div class="flex-1-md-6 flex-1-lg-4">
          <div class="system-status-card" :class="getSystemStatusClass('jobs')">
            <div class="system-header">
              <div class="system-icon">
                <AppIcon name="MagnifyingGlassIcon" />
              </div>
              <div class="system-info">
                <h6 class="mb-0">Job Search</h6>
                <small class="text-secondary">Matching & Discovery</small>
              </div>
            </div>
            <div class="system-data">
              <div class="data-item">
                <span class="label">Skills:</span>
                <span class="value"
                  >{{ skills?.technical?.length || 0 }} technical</span
                >
              </div>
              <div class="data-item">
                <span class="label">Experience:</span>
                <span class="value">{{ experience?.length || 0 }} roles</span>
              </div>
              <div class="data-item">
                <span class="label">Location:</span>
                <span class="value">{{
                  personalInfo?.location || 'Not set'
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Training System -->
        <div class="flex-1-md-6 flex-1-lg-4">
          <div class="system-status-card" :class="getSystemStatusClass('ai')">
            <div class="system-header">
              <div class="system-icon">
                <AppIcon name="CpuChipIcon" />
              </div>
              <div class="system-info">
                <h6 class="mb-0">AI Training</h6>
                <small class="text-secondary">Personalization</small>
              </div>
            </div>
            <div class="system-data">
              <div class="data-item">
                <span class="label">Context:</span>
                <span class="value">{{ getAIContextSize() }} data points</span>
              </div>
              <div class="data-item">
                <span class="label">Gaming XP:</span>
                <span class="value"
                  >{{ getGamingExperienceSize() }} entries</span
                >
              </div>
              <div class="data-item">
                <span class="label">Goals:</span>
                <span class="value"
                  >{{ careerGoals?.targetRoles?.length || 0 }} roles</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Studio Matching System -->
        <div class="flex-1-md-6 flex-1-lg-4">
          <div
            class="system-status-card"
            :class="getSystemStatusClass('studios')"
          >
            <div class="system-header">
              <div class="system-icon">
                <AppIcon name="PuzzlePieceIcon" />
              </div>
              <div class="system-info">
                <h6 class="mb-0">Studio Matching</h6>
                <small class="text-secondary">Gaming Industry</small>
              </div>
            </div>
            <div class="system-data">
              <div class="data-item">
                <span class="label">Portfolio:</span>
                <span class="value">{{ portfolio?.length || 0 }} items</span>
              </div>
              <div class="data-item">
                <span class="label">Gaming Skills:</span>
                <span class="value"
                  >{{ skills?.gaming?.length || 0 }} skills</span
                >
              </div>
              <div class="data-item">
                <span class="label">Achievements:</span>
                <span class="value">{{ getAchievementsCount() }} total</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Portfolio System -->
        <div class="flex-1-md-6 flex-1-lg-4">
          <div
            class="system-status-card"
            :class="getSystemStatusClass('portfolio')"
          >
            <div class="system-header">
              <div class="system-icon">
                <AppIcon name="FolderIcon-multiple-outline" />
              </div>
              <div class="system-info">
                <h6 class="mb-0">Portfolio</h6>
                <small class="text-secondary">Showcase</small>
              </div>
            </div>
            <div class="system-data">
              <div class="data-item">
                <span class="label">Projects:</span>
                <span class="value">{{ getPortfolioProjects() }} projects</span>
              </div>
              <div class="data-item">
                <span class="label">Media:</span>
                <span class="value">{{ getPortfolioMedia() }} files</span>
              </div>
              <div class="data-item">
                <span class="label">Updated:</span>
                <span class="value">{{ getPortfolioLastUpdate() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Resume System -->
        <div class="flex-1-md-6 flex-1-lg-4">
          <div
            class="system-status-card"
            :class="getSystemStatusClass('resume')"
          >
            <div class="system-header">
              <div class="system-icon">
                <AppIcon name="DocumentIcon" />
              </div>
              <div class="system-info">
                <h6 class="mb-0">Resume Builder</h6>
                <small class="text-secondary">Documents</small>
              </div>
            </div>
            <div class="system-data">
              <div class="data-item">
                <span class="label">Sections:</span>
                <span class="value">{{ getResumeSections() }} complete</span>
              </div>
              <div class="data-item">
                <span class="label">Certs:</span>
                <span class="value"
                  >{{ profile?.certifications?.length || 0 }} items</span
                >
              </div>
              <div class="data-item">
                <span class="label">Languages:</span>
                <span class="value"
                  >{{ skills?.languages?.length || 0 }} known</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Settings System -->
        <div class="flex-1-md-6 flex-1-lg-4">
          <div
            class="system-status-card"
            :class="getSystemStatusClass('settings')"
          >
            <div class="system-header">
              <div class="system-icon">
                <AppIcon name="CogIcon" />
              </div>
              <div class="system-info">
                <h6 class="mb-0">Settings</h6>
                <small class="text-secondary">Preferences</small>
              </div>
            </div>
            <div class="system-data">
              <div class="data-item">
                <span class="label">Privacy:</span>
                <span class="value">{{ getPrivacyStatus() }}</span>
              </div>
              <div class="data-item">
                <span class="label">Consent:</span>
                <span class="value">{{
                  profile?.meta?.dataConsent ? 'Given' : 'Required'
                }}</span>
              </div>
              <div class="data-item">
                <span class="label">API Keys:</span>
                <span class="value">{{ getAPIKeysStatus() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="settings-panel glass-card">
      <h6 class="mb-3">
        <AppIcon name="mdi-cog-outline" class="mr-2" />
        Profile Sync Settings
      </h6>

      <div class="settings-options">
        <div class="form-check form-switch mb-3">
          <input
            id="auto-sync-toggle"
            v-model="autoSyncEnabled"
            class="form-check-input"
            type="checkbox"
            @change="toggleAutoSync"
          />
          <label class="form-check-label" for="auto-sync-toggle">
            <strong>Auto-sync profile changes</strong>
            <br />
            <small class="text-secondary">
              Automatically update all systems when profile data changes
            </small>
          </label>
        </div>

        <div class="form-check form-switch mb-3">
          <input
            id="real-time-sync"
            v-model="realTimeSyncEnabled"
            class="form-check-input"
            type="checkbox"
            :disabled="!autoSyncEnabled"
          />
          <label class="form-check-label" for="real-time-sync">
            <strong>Real-time synchronization</strong>
            <br />
            <small class="text-secondary">
              Sync changes immediately instead of batching
            </small>
          </label>
        </div>

        <div class="sync-history mt-4">
          <h6 class="mb-2">Recent Sync Events</h6>
          <div class="sync-events-list">
            <div
              v-for="event in recentSyncEvents"
              :key="event.timestamp"
              class="sync-event-item"
            >
              <div class="event-icon">
                <i :class="getEventIcon(event.type)"></i>
              </div>
              <div class="event-details">
                <div class="event-title">{{ getEventTitle(event.type) }}</div>
                <div class="event-meta">
                  <span class="event-time">{{
                    getRelativeTime(event.timestamp)
                  }}</span>
                  <span class="event-systems"
                    >• {{ event.affectedSystems.length }} systems</span
                  >
                </div>
              </div>
              <div class="event-status">
                <AppIcon name="CheckCircleIcon" class="text-success-600" />
                <AppIcon
                  name="ExclamationCircleIcon"
                  class="text-warning-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CogIcon,
  CpuChipIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  EyeIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

import { computed, ref, watch, onMounted } from 'vue'
import { useUnifiedProfile } from '@/composables/useUnifiedProfile'
import { profileSyncService } from '@/services/ProfileSyncService'
import { useAppStore } from '@/stores/app'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Unified profile system
const unifiedProfile = useUnifiedProfile()

// Component state
const showSyncDetails = ref(false)
const showSettings = ref(false)
const autoSyncEnabled = ref(true)
const realTimeSyncEnabled = ref(false)
const recentSyncEvents = ref([])

// Profile data
const profile = computed(() => unifiedProfile.profile.value)
const personalInfo = computed(() => unifiedProfile.personalInfo.value)
const skills = computed(() => unifiedProfile.skills.value)
const experience = computed(() => unifiedProfile.experience.value)
const education = computed(() => unifiedProfile.education.value)
const gamingExperience = computed(() => unifiedProfile.gamingExperience.value)
const careerGoals = computed(() => unifiedProfile.careerGoals.value)
const portfolio = computed(() => unifiedProfile.portfolio.value)

// Profile status
const completeness = computed(() => unifiedProfile.completeness.value || 0)
const isLoading = computed(() => unifiedProfile.isLoading.value)
const syncStatus = computed(() => unifiedProfile.state.syncStatus)
const lastSync = computed(() => unifiedProfile.lastSync.value)

// Sync control
const forceSync = async () => {
  await unifiedProfile.forceSync()
}

const toggleAutoSync = () => {
  if (autoSyncEnabled.value) {
    unifiedProfile.enableAutoSync()
  } else {
    unifiedProfile.disableAutoSync()
    realTimeSyncEnabled.value = false
  }
}

// Status helpers
const getSyncStatusClass = () => {
  switch (syncStatus.value) {
    case 'success':
      return 'text-success-600'
    case 'error':
      return 'text-error-600'
    case 'syncing':
      return 'text-primary-600'
    default:
      return 'text-secondary'
  }
}

const getSyncStatusText = () => {
  switch (syncStatus.value) {
    case 'success':
      return 'Synced'
    case 'error':
      return 'Error'
    case 'syncing':
      return 'Syncing...'
    default:
      return 'Idle'
  }
}

const getSystemStatusClass = systemId => {
  const contextData = unifiedProfile.state.contextData[systemId]
  if (contextData?.lastSync) {
    return 'system-active'
  }
  return 'system-inactive'
}

const getRelativeTime = date => {
  if (!date) return 'Never'
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Data helpers
const getAIContextSize = () => {
  let count = 0
  count += skills.value?.technical?.length || 0
  count += skills.value?.gaming?.length || 0
  count += experience.value?.length || 0
  count += Object.keys(gamingExperience.value || {}).length
  return count
}

const getGamingExperienceSize = () => {
  if (!gamingExperience.value) return 0
  return Object.values(gamingExperience.value).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  )
}

const getAchievementsCount = () => {
  let count = 0
  count += profile.value?.achievements?.length || 0
  count += gamingExperience.value?.achievements?.length || 0
  return count
}

const getPortfolioProjects = () => {
  return portfolio.value?.filter(item => item.type === 'project')?.length || 0
}

const getPortfolioMedia = () => {
  return portfolio.value?.filter(item => item.media)?.length || 0
}

const getPortfolioLastUpdate = () => {
  if (!portfolio.value?.length) return 'Never'
  const latest = portfolio.value.reduce((latest, item) => {
    const itemDate = new Date(item.updatedAt || item.createdAt || 0)
    return itemDate > latest ? itemDate : latest
  }, new Date(0))
  return getRelativeTime(latest)
}

const getResumeSections = () => {
  let count = 0
  if (personalInfo.value?.name) count++
  if (experience.value?.length) count++
  if (education.value?.length) count++
  if (skills.value?.technical?.length) count++
  return count
}

const getPrivacyStatus = () => {
  const settings = profile.value?.meta?.privacySettings
  if (!settings) return 'Not configured'

  const enabled = Object.values(settings).filter(Boolean).length
  const total = Object.keys(settings).length

  return `${enabled}/${total} enabled`
}

const getAPIKeysStatus = () => {
  const appStore = useAppStore()
  const hasGeminiKey =
    appStore.settings.geminiApiKey &&
    appStore.settings.geminiApiKey.trim().length > 0

  if (hasGeminiKey) {
    return 'Configured'
  } else {
    return 'Not Configured'
  }
}

const getEventIcon = type => {
  const iconMap = {
    'profile-updated': 'UserIcon-edit',
    'section-changed': 'mdi-pencil',
    'batch-update': 'mdi-update',
    'import-complete': 'mdi-import',
  }
  return iconMap[type] || 'mdi-sync'
}

const getEventTitle = type => {
  const titleMap = {
    'profile-updated': 'Profile Updated',
    'section-changed': 'Section Changed',
    'batch-update': 'Batch Update',
    'import-complete': 'Import Complete',
  }
  return titleMap[type] || 'Sync Event'
}

// Setup sync event listening
onMounted(() => {
  // Load recent sync events
  recentSyncEvents.value = profileSyncService
    .getSyncHistory()
    .slice(0, 5)
    .map(event => ({
      ...event,
      success:
        event.success !== undefined
          ? event.success
          : event.error === undefined || event.error === null,
    }))

  // Listen for new sync events
  profileSyncService.on('sync-complete', eventData => {
    recentSyncEvents.value.unshift({
      ...eventData.event,
      success: true,
      timestamp: new Date(),
    })

    if (recentSyncEvents.value.length > 10) {
      recentSyncEvents.value = recentSyncEvents.value.slice(0, 10)
    }
  })

  profileSyncService.on('sync-error', eventData => {
    recentSyncEvents.value.unshift({
      ...eventData.event,
      success: false,
      error: eventData.error,
      timestamp: new Date(),
    })

    if (recentSyncEvents.value.length > 10) {
      recentSyncEvents.value = recentSyncEvents.value.slice(0, 10)
    }
  })
})
</script>

<style scoped>
.unified-profile-manager {
  max-width: 100%;
  margin: 0 auto;
}

.profile-status-header {
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
}

.sync-status-indicators {
  display: flex;
  gap: var(--spacing-md);
}

.sync-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.05);
}

.indicator-icon i {
  font-size: 1.25rem;
}

.indicator-text {
  text-align: center;
}

.system-status-card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.system-status-card.system-active {
  border-color: var(--color-success);
  background: rgba(34, 197, 94, 0.05);
}

.system-status-card.system-inactive {
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.05);
}

.system-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.system-icon i {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.system-data {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.data-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.data-item .label {
  color: var(--text-secondary);
}

.data-item .value {
  font-weight: var(--font-weight-medium);
}

.sync-events-list {
  max-height: 200px;
  overflow-y: auto;
}

.sync-event-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.02);
}

.event-icon i {
  font-size: 1rem;
  color: var(--color-primary);
}

.event-details {
  flex: 1;
}

.event-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.event-meta {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.event-status i {
  font-size: 1rem;
}

.settings-panel {
  padding: var(--spacing-lg);
}

.form-check-label {
  cursor: pointer;
}
</style>
