<template>
  <div class="provider-health-dashboard font-sans">
    <div class="dashboard-header">
      <h3 class="dashboard-title">
        <AppIcon name="HeartIcon" class="title-icon" />
        Provider Health Dashboard
      </h3>
      <div class="health-summary">
        <div class="summary-stat" :class="{ 'status-good': summary.failedProviders === 0 }">
          <span class="stat-value">{{ summary.healthyProviders }}/{{ summary.totalProviders }}</span>
          <span class="stat-label">Healthy</span>
        </div>
        <div class="summary-stat">
          <span class="stat-value">{{ Math.round(summary.averageResponseTime) }}ms</span>
          <span class="stat-label">Avg Response</span>
        </div>
        <div class="summary-stat">
          <span class="stat-value">{{ formatLastCheck(summary.lastCheckTime) }}</span>
          <span class="stat-label">Last Check</span>
        </div>
      </div>
    </div>

    <div class="provider-grid">
      <div 
        v-for="provider in healthReports" 
        :key="`${provider.providerType}:${provider.providerName}`"
        class="provider-card"
        :class="[`status-${provider.metrics.status}`, { 'disabled': !provider.isEnabled }]"
      >
        <div class="provider-header">
          <div class="provider-info">
            <AppIcon 
              :name="getProviderIcon(provider.providerType)" 
              class="provider-icon"
            />
            <div>
              <h4 class="provider-name">{{ provider.providerName }}</h4>
              <span class="provider-type">{{ provider.providerType }}</span>
            </div>
          </div>
          <div class="status-indicator" :class="`status-${provider.metrics.status}`">
            <span class="status-dot"></span>
            <span class="status-text">{{ provider.metrics.status }}</span>
          </div>
        </div>

        <div class="provider-metrics">
          <div class="metric">
            <span class="metric-label">Response Time</span>
            <span class="metric-value">{{ Math.round(provider.metrics.averageResponseTime) }}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">Success Rate</span>
            <span class="metric-value">
              {{ provider.metrics.totalChecks > 0 ? 
                Math.round((1 - provider.metrics.errorCount / provider.metrics.totalChecks) * 100) : 100 }}%
            </span>
          </div>
          <div class="metric">
            <span class="metric-label">Consecutive Failures</span>
            <span class="metric-value" :class="{ 'error': provider.metrics.consecutiveFailures > 0 }">
              {{ provider.metrics.consecutiveFailures }}
            </span>
          </div>
          <div class="metric">
            <span class="metric-label">Last Check</span>
            <span class="metric-value">{{ formatLastCheck(provider.metrics.lastCheck) }}</span>
          </div>
        </div>

        <div v-if="provider.lastError" class="error-details">
          <AppIcon name="ExclamationCircleIcon" class="error-icon" />
          <span class="error-text">{{ provider.lastError }}</span>
        </div>

        <div class="provider-actions">
          <UnifiedButton
            size="sm"
            variant="ghost"
            :disabled="!provider.isEnabled"
            @click="resetProvider(provider)"
          >
            <AppIcon name="ArrowPathIcon" />
            Reset
          </UnifiedButton>
          <UnifiedButton
            size="sm"
            :variant="provider.isEnabled ? 'ghost' : 'primary'"
            @click="toggleProvider(provider)"
          >
            <AppIcon :name="provider.isEnabled ? 'PauseIcon' : 'PlayIcon'" />
            {{ provider.isEnabled ? 'Disable' : 'Enable' }}
          </UnifiedButton>
        </div>
      </div>
    </div>

    <div class="dashboard-actions">
      <UnifiedButton variant="ghost" @click="refreshHealth">
        <AppIcon name="ArrowPathIcon" />
        Refresh All
      </UnifiedButton>
      <UnifiedButton variant="ghost" @click="cleanupOldData">
        <AppIcon name="mdi-broom" />
        Cleanup Old Data
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'

import { ref, onMounted, computed } from 'vue'
import { providerHealthDashboard } from '@/services/ProviderHealthDashboard'
import { refactoredJobAPIService } from '@/services/RefactoredJobAPIService'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const healthReports = ref([])
const loading = ref(false)

const summary = computed(() => providerHealthDashboard.getHealthSummary())

const getProviderIcon = (type) => {
  const icons = {
    greenhouse: 'mdi-greenhouse',
    lever: 'mdi-lever',
    smartrecruiters: 'mdi-brain',
    workday: 'CalendarIcon-today',
    government: 'mdi-bank',
    gaming: 'DevicePhoneMobileIcon-variant',
    opensource: 'mdi-github'
  }
  return icons[type] || 'mdi-web'
}

const formatLastCheck = (timestamp) => {
  if (!timestamp) return 'Never'
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const loadHealthData = () => {
  healthReports.value = providerHealthDashboard.getProviderHealthReport()
}

const resetProvider = (provider) => {
  const key = `${provider.providerType}:${provider.providerName}`
  providerHealthDashboard.resetProviderHealth(key)
  loadHealthData()
}

const toggleProvider = (provider) => {
  // This would integrate with the job service to enable/disable providers
  console.log('Toggle provider:', provider.providerName)
  // Implementation depends on the specific provider management system
}

const refreshHealth = async () => {
  loading.value = true
  try {
    // This would trigger a health check on all providers
    // Implementation depends on the specific job service
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate check
    loadHealthData()
  } finally {
    loading.value = false
  }
}

const cleanupOldData = () => {
  providerHealthDashboard.cleanupOldData()
  loadHealthData()
}

onMounted(() => {
  loadHealthData()
  // Refresh data every 30 seconds
  setInterval(loadHealthData, 30000)
})
</script>

<style scoped>
.provider-health-dashboard {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-b: 1px solid rgb(255 255 255 / 0.1);
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.title-icon {
  color: rgb(34 197 94);
}

.health-summary {
  display: flex;
  gap: 2rem;
}

.summary-stat {
  text-align: center;
}

.summary-stat.status-good .stat-value {
  color: rgb(34 197 94);
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(156 163 175);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: rgb(107 114 128);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.provider-card {
  background: rgb(31 41 55 / 0.5);
  border: 1px solid rgb(75 85 99 / 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.provider-card:hover {
  border-color: rgb(99 102 241 / 0.5);
  box-shadow: 0 0 20px rgb(99 102 241 / 0.1);
}

.provider-card.status-healthy {
  border-l: 4px solid rgb(34 197 94);
}

.provider-card.status-degraded {
  border-l: 4px solid rgb(251 191 36);
}

.provider-card.status-failed {
  border-l: 4px solid rgb(239 68 68);
}

.provider-card.disabled {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.provider-icon {
  width: 2rem;
  height: 2rem;
  color: rgb(99 102 241);
}

.provider-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgb(243 244 246);
}

.provider-type {
  font-size: 0.75rem;
  color: rgb(156 163 175);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-indicator.status-healthy {
  background: rgb(34 197 94 / 0.1);
  color: rgb(34 197 94);
}

.status-indicator.status-degraded {
  background: rgb(251 191 36 / 0.1);
  color: rgb(251 191 36);
}

.status-indicator.status-failed {
  background: rgb(239 68 68 / 0.1);
  color: rgb(239 68 68);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}

.provider-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: rgb(156 163 175);
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(243 244 246);
}

.metric-value.error {
  color: rgb(239 68 68);
}

.error-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgb(239 68 68 / 0.1);
  border: 1px solid rgb(239 68 68 / 0.2);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.error-icon {
  color: rgb(239 68 68);
  flex-shrink: 0;
}

.error-text {
  font-size: 0.75rem;
  color: rgb(254 202 202);
}

.provider-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-t: 1px solid rgb(75 85 99 / 0.3);
}
</style>