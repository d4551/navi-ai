<template>
  <div class="background-import-manager">
    <!-- Import Status Card -->
    <div class="import-status-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title">
          <AppIcon name="mdi-cloud-sync-outline" />
          Background Import Status
        </h6>
        <div class="status-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            :disabled="importStatus.isImporting"
            :leading-icon="refreshService.refreshInterval ? 'mdi-pause' : 'mdi-play'"
            @click="toggleRefreshService"
          >
            {{ refreshService.refreshInterval ? 'Pause' : 'Start' }} Auto-Refresh
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="sm"
            :disabled="importStatus.isImporting || refreshService.isRefreshing"
            leading-icon="mdi-refresh"
            @click="performManualRefresh"
          >
            Refresh Now
          </UnifiedButton>
        </div>
      </div>

      <div class="card-body section-body">
        <!-- Current Operation -->
        <div v-if="importStatus.isImporting" class="current-operation">
          <div class="operation-info">
            <span class="operation-text">{{ importStatus.currentOperation }}</span>
            <span class="operation-progress">{{ importStatus.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${importStatus.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Status Grid -->
        <div class="status-grid">
          <div class="status-item">
            <div class="status-icon success">
              <AppIcon name="mdi-briefcase" />
            </div>
            <div class="status-content">
              <div class="status-label">Jobs Imported</div>
              <div class="status-value">{{ stats.jobsCount.toLocaleString() }}</div>
              <div class="status-time">{{ formatLastUpdate(stats.jobsLastUpdate) }}</div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon primary">
              <AppIcon name="mdi-folder-multiple-outline-image" />
            </div>
            <div class="status-content">
              <div class="status-label">Portfolio Projects</div>
              <div class="status-value">{{ stats.portfolioCount }}</div>
              <div class="status-time">{{ formatLastUpdate(stats.portfolioLastUpdate) }}</div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon warning">
              <AppIcon name="mdi-account-tie" />
            </div>
            <div class="status-content">
              <div class="status-label">Interviews</div>
              <div class="status-value">{{ stats.interviewsCount }}</div>
              <div class="status-time">{{ formatLastUpdate(stats.interviewsLastUpdate) }}</div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon info">
              <AppIcon name="mdi-domain" />
            </div>
            <div class="status-content">
              <div class="status-label">Studios</div>
              <div class="status-value">{{ stats.studiosCount }}</div>
              <div class="status-time">{{ formatLastUpdate(stats.studiosLastUpdate) }}</div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon" :class="refreshService.refreshInterval ? 'success' : 'muted'">
              <AppIcon :name="refreshService.refreshInterval ? 'mdi-autorenew' : 'mdi-pause'" />
            </div>
            <div class="status-content">
              <div class="status-label">Auto-Refresh</div>
              <div class="status-value">{{ refreshService.refreshInterval ? 'Active' : 'Paused' }}</div>
              <div class="status-time">Every {{ Math.round(refreshService.refreshFrequency / 60000) }}min</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Import Section -->
    <div class="manual-import-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title">
          <AppIcon name="mdi-upload" />
          Manual Data Import
        </h6>
      </div>

      <div class="card-body section-body">
        <div class="import-options">
          <div v-for="importType in importTypes" :key="importType.type" class="import-option">
            <div class="import-option-header">
              <div class="import-option-icon" :class="importType.colorClass">
                <AppIcon :name="importType.icon" />
              </div>
              <div class="import-option-info">
                <h6 class="import-option-title">{{ importType.title }}</h6>
                <p class="import-option-description">{{ importType.description }}</p>
              </div>
            </div>
            <div class="import-option-actions">
              <UnifiedButton variant="outline" size="sm" :disabled="importStatus.isImporting" leading-icon="mdi-file-plus" @click="selectFile(importType.type)">Select File</UnifiedButton>
              <UnifiedButton variant="outline" size="sm" :disabled="importStatus.isImporting" leading-icon="mdi-cog" @click="configureImportSource(importType.type)">Options</UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import History -->
    <div class="import-history-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title">
          <AppIcon name="mdi-history" />
          Recent Imports
        </h6>
        <UnifiedButton
          variant="outline"
          size="sm"
          :disabled="importStatus.importHistory.length === 0"
          @click="clearHistory"
        >
          <AppIcon name="mdi-trash-can-outline" />
          Clear History
        </UnifiedButton>
      </div>

      <div class="card-body section-body">
        <div v-if="importStatus.importHistory.length === 0" class="empty-state">
          <AppIcon name="mdi-history" />
          <p>No import history available</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="entry in importStatus.importHistory.slice(0, 10)"
            :key="entry.id"
            class="history-item"
          >
            <div class="history-icon" :class="entry.success ? 'success' : 'danger'">
              <AppIcon :name="entry.success ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" />
            </div>
            <div class="history-content">
              <div class="history-title">
                {{ getImportTypeTitle(entry.dataType) }}
                <span class="record-count">{{ entry.recordCount }} records</span>
              </div>
              <div class="history-details">
                <span class="history-source">{{ entry.source }}</span>
                <span class="history-time">{{ formatTimestamp(entry.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Errors Panel -->
    <div v-if="importStatus.errors.length > 0" class="errors-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title text-danger">
          <AppIcon name="mdi-alert-circle-outline" />
          Import Errors ({{ importStatus.errors.length }})
        </h6>
        <UnifiedButton
          variant="danger"
          appearance="outlined"
          size="sm"
          @click="clearErrors"
        >
          <AppIcon name="mdi-close-circle-outline" context="error" />
          Clear Errors
        </UnifiedButton>
      </div>

      <div class="card-body section-body">
        <div class="errors-list">
          <div
            v-for="(error, index) in importStatus.errors.slice(0, 5)"
            :key="index"
            class="error-item"
          >
            <div class="error-icon">
              <AppIcon name="mdi-alert-circle-outline" class="text-danger" />
            </div>
            <div class="error-content">
              <div class="error-message">{{ error.error }}</div>
              <div class="error-details">
                <span class="error-type">{{ error.dataType }}</span>
                <span class="error-time">{{ formatTimestamp(error.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Input (Hidden) -->
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      accept=".json,.csv,.txt"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import {
  importData,
  importStatus,
  backgroundRefreshService,
  BackgroundRefreshService as _BackgroundRefreshService
} from '@/services/backgroundImportService'

// Reactive state
const refreshService = reactive(backgroundRefreshService)
const fileInput = ref(null)
const selectedImportType = ref('')

// Statistics
const stats = reactive({
  jobsCount: 0,
  jobsLastUpdate: null,
  portfolioCount: 0,
  portfolioLastUpdate: null,
  interviewsCount: 0,
  interviewsLastUpdate: null,
  studiosCount: 0,
  studiosLastUpdate: null
})

// Import type configurations
const importTypes = [
  {
    type: 'resume',
    title: 'Resume Data',
    description: 'Import resume information, experience, and skills',
    icon: 'mdi-account-box-outline',
    colorClass: 'primary'
  },
  {
    type: 'jobs',
    title: 'Job Listings',
    description: 'Import job opportunities and application data',
    icon: 'mdi-briefcase-search',
    colorClass: 'success'
  },
  {
    type: 'portfolio',
    title: 'Portfolio Projects',
    description: 'Import project data, images, and documentation',
    icon: 'mdi-folder-multiple-outline-image',
    colorClass: 'info'
  },
  {
    type: 'interviews',
    title: 'Interview Records',
    description: 'Import interview feedback and performance data',
    icon: 'mdi-account-tie',
    colorClass: 'warning'
  },
  {
    type: 'studios',
    title: 'Game Studios',
    description: 'Import studio data, company info, and specializations',
    icon: 'mdi-domain',
    colorClass: 'info'
  }
]

// Methods
const toggleRefreshService = () => {
  try {
    if (refreshService.refreshInterval) {
      refreshService.stop()
      console.info('Auto-refresh paused')
    } else {
      refreshService.start()
      console.info('Auto-refresh started')
    }
  } catch (error) {
    console.error('Failed to toggle auto-refresh:', error)
  }
}

const performManualRefresh = async () => {
  try {
    await refreshService.performBackgroundRefresh()
    await updateStats()
    console.info('Manual refresh complete')
  } catch (error) {
    console.error('Manual refresh failed:', error)
  }
}

const selectFile = (importType) => {
  selectedImportType.value = importType
  console.info(`Selecting file for ${importType} import`)
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file || !selectedImportType.value) {
    return
  }

  try {
    const result = await importData(selectedImportType.value, file.path || file.name, {
      fileName: file.name,
      fileSize: file.size
    })

    if (result.success) {
      await updateStats()
      console.info(`Import ${selectedImportType.value} successful:`, result.message)
    } else {
      console.error(`Import ${selectedImportType.value} failed:`, result.error)
    }
  } catch (error) {
    console.error(`File import error for ${selectedImportType.value}:`, error)
  } finally {
    event.target.value = ''
    selectedImportType.value = ''
  }
}

const configureImportSource = async (importType) => {
  try {
    refreshService.configure({ enabledSources: [importType] })
    console.info(`Configured import source: ${importType}`)
  } catch (error) {
    console.error(`Failed to configure import source ${importType}:`, error)
  }
}

const clearHistory = () => {
  importStatus.importHistory.length = 0
  console.info('Import history cleared')
}

const clearErrors = () => {
  importStatus.errors.length = 0
  console.info('Import errors cleared')
}

const updateStats = async () => {
  try {
    // Update statistics from localStorage or IPC
    const jobsData = JSON.parse(localStorage.getItem('gemini-cv-jobs') || '[]')
    const portfolioData = JSON.parse(localStorage.getItem('gemini-cv-portfolio') || '[]')
    const interviewsData = JSON.parse(localStorage.getItem('gemini-cv-interviews') || '[]')
    const studiosData = JSON.parse(localStorage.getItem('gemini-cv-studios') || '[]')

    stats.jobsCount = Array.isArray(jobsData) ? jobsData.length : 0
    stats.portfolioCount = Array.isArray(portfolioData) ? portfolioData.length : 0
    stats.interviewsCount = Array.isArray(interviewsData) ? interviewsData.length : 0
    stats.studiosCount = Array.isArray(studiosData) ? studiosData.length : 0

    // Update timestamps
    const cache = JSON.parse(localStorage.getItem('gemini-cv-cache') || '{}')
    stats.jobsLastUpdate = cache.jobsLastUpdate || null
    stats.portfolioLastUpdate = cache.portfolioLastUpdate || null
    stats.interviewsLastUpdate = cache.interviewsLastUpdate || null
    stats.studiosLastUpdate = cache.studiosLastUpdate || null

  } catch (error) {
    console.error('Failed to update stats:', error)
  }
}

// Utility functions
const formatLastUpdate = (timestamp) => {
  if (!timestamp) {return 'Never'}

  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))

  if (diffMinutes < 1) {return 'Just now'}
  if (diffMinutes < 60) {return `${diffMinutes}m ago`}
  if (diffMinutes < 1440) {return `${Math.floor(diffMinutes / 60)}h ago`}
  return `${Math.floor(diffMinutes / 1440)}d ago`
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const getImportTypeTitle = (dataType) => {
  const type = importTypes.find(t => t.type === dataType)
  return type?.title || dataType
}

// Lifecycle
onMounted(() => {
  updateStats()

  // Update stats periodically
  const statsInterval = setInterval(updateStats, 30000)

  onBeforeUnmount(() => {
    clearInterval(statsInterval)
  })
})
</script>

<style scoped>
.background-import-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Import Status Card */
.import-status-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-actions {
  display: flex;
  gap: 0.5rem;
}

.current-operation {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--glass-elevated);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.operation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.operation-text {
  font-weight: 500;
  color: var(--text-primary);
}

.operation-progress {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}

.progress-bar {
  height: 4px;
  background: var(--glass-border);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  transition: width 0.3s ease;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--glass-surface);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
}

.status-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.status-icon.success {
  background: color-mix(in srgb, var(--color-success) 20%, transparent);
  color: var(--color-success);
}

.status-icon.primary {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--color-primary);
}

.status-icon.warning {
  background: color-mix(in srgb, var(--color-warning) 20%, transparent);
  color: var(--color-warning);
}

.status-icon.info {
  background: color-mix(in srgb, var(--color-info) 20%, transparent);
  color: var(--color-info);
}

.status-icon.muted {
  background: var(--glass-border);
  color: var(--text-muted);
}

.status-content {
  flex: 1;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.status-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.status-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Manual Import Card */
.import-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.import-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--glass-surface);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
}

.import-option:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.import-option-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.import-option-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.import-option-icon.primary {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--color-primary);
}

.import-option-icon.success {
  background: color-mix(in srgb, var(--color-success) 20%, transparent);
  color: var(--color-success);
}

.import-option-icon.info {
  background: color-mix(in srgb, var(--color-info) 20%, transparent);
  color: var(--color-info);
}

.import-option-icon.warning {
  background: color-mix(in srgb, var(--color-warning) 20%, transparent);
  color: var(--color-warning);
}

.import-option-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.import-option-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.import-option-actions {
  display: flex;
  gap: 0.5rem;
}

/* History and Errors */
.history-list,
.errors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item,
.error-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--glass-elevated);
  border-radius: 6px;
  border-left: 3px solid var(--glass-border);
}

.history-item .history-icon.success {
  border-left-color: var(--color-success);
}

.history-item .history-icon.danger,
.error-item {
  border-left-color: var(--color-danger);
}

.history-icon,
.error-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.history-content,
.error-content {
  flex: 1;
}

.history-title,
.error-message {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.record-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: normal;
}

.history-details,
.error-details {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .import-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .import-option-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Dark theme support */
[data-theme="dark"] .status-item,
[data-theme="dark"] .import-option,
[data-theme="dark"] .history-item,
[data-theme="dark"] .error-item {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}
</style>
