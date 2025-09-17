<template>
  <div class="system-status-indicator font-sans">
    <!-- Quick Status Badge -->
    <button
      class="status-badge"
      :class="{
        'status-healthy': status === 'healthy',
        'status-degraded': status === 'degraded',
        'status-critical': status === 'critical',
        'status-checking': isChecking,
      }"
      :aria-expanded="showDetails"
      aria-label="System Status"
      @click="toggleDetails"
    >
      <AppIcon
        :name="statusIcon"
        :class="{ 'mdi-spin': status === 'checking' }"
      />
      <span class="status-text">{{ statusText }}</span>
      <AppIcon
        name="ChevronDownIcon"
        class="expand-icon"
        :class="{ expanded: showDetails }"
      />
    </button>

    <!-- Detailed Status Panel -->
    <transition name="slide-down">
      <div v-if="showDetails" class="status-details glass-card section-card">
        <div class="status-header">
          <h4 class="status-title">
            <AppIcon name="mdi-monitor-dashboard" />
            System Health Monitor
          </h4>
          <div class="status-actions">
            <button
              class="btn btn-sm btn-outline-primary ui-btn ui-size-md"
              :disabled="isChecking"
              @click="runHealthCheck"
            >
              <AppIcon
                :name="isChecking ? 'ArrowPathIcon' : 'ArrowPathIcon'"
                :class="{ 'mdi-spin': isChecking }"
              />
              {{ isChecking ? 'Checking...' : 'Refresh' }}
            </button>
            <button
              class="btn btn-sm btn-primary ui-btn ui-size-md"
              :disabled="isRunningFullTest"
              @click="runFullTest"
            >
              <AppIcon
                :name="isRunningFullTest ? 'ArrowPathIcon' : 'mdi-test-tube'"
                :class="{ 'mdi-spin': isRunningFullTest }"
              />
              {{ isRunningFullTest ? 'Testing...' : 'Full Test' }}
            </button>
          </div>
        </div>

        <!-- System Components Status -->
        <div v-if="healthReport" class="components-grid">
          <div
            v-for="component in componentStatus"
            :key="component.name"
            class="component-status"
            :class="`status-${component.status}`"
          >
            <div class="component-header">
              <AppIcon :name="component.icon" />
              <span class="component-name">{{ component.name }}</span>
              <div class="component-badge" :class="`badge-${component.status}`">
                {{ component.status }}
              </div>
            </div>
            <div class="component-details">
              <div v-if="component.metric" class="component-metric">
                {{ component.metric }}
              </div>
              <div v-if="component.tests" class="component-tests">
                <span class="test-count"
                  >{{ component.tests.passed }}/{{
                    component.tests.total
                  }}</span
                >
                <span class="test-label">tests passed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div v-if="performanceMetrics" class="performance-section">
          <h5 class="section-title">
            <AppIcon name="mdi-speedometer" />
            Performance Metrics
          </h5>
          <div class="metrics-grid">
            <div v-if="performanceMetrics.memory" class="metric-item">
              <div class="metric-label">Memory Usage</div>
              <div class="metric-value">
                {{ performanceMetrics.memory.used }}MB /
                {{ performanceMetrics.memory.total }}MB
              </div>
            </div>
            <div v-if="performanceMetrics.timing" class="metric-item">
              <div class="metric-label">Page Load</div>
              <div class="metric-value">
                {{ performanceMetrics.timing.pageLoad }}ms
              </div>
            </div>
            <div v-if="performanceMetrics.connection" class="metric-item">
              <div class="metric-label">Connection</div>
              <div class="metric-value">
                {{ performanceMetrics.connection.type }}
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Test Results -->
        <div
          v-if="healthReport && healthReport.results.length > 0"
          class="test-results-section"
        >
          <h5 class="section-title">
            <AppIcon name="mdi-clipboard-check" />
            Recent Test Results
          </h5>
          <div class="test-results-list">
            <div
              v-for="result in recentTestResults"
              :key="`${result.component}-${result.test}-${result.timestamp}`"
              class="test-result-item"
              :class="`result-${result.status}`"
            >
              <div class="result-header">
                <AppIcon :name="getTestResultIcon(result.status)" />
                <span class="result-component">{{ result.component }}</span>
                <span class="result-test">{{ result.test }}</span>
                <span class="result-duration">{{ result.duration }}ms</span>
              </div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

import { ref, onMounted, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { systemIntegrationTest } from '@/utils/SystemIntegrationTest'
import type { SystemHealthReport } from '@/utils/SystemIntegrationTest'

// Component state
const showDetails = ref(false)
const isChecking = ref(false)
const isRunningFullTest = ref(false)
const status = ref<'healthy' | 'degraded' | 'critical' | 'checking'>('checking')
const statusMessage = ref('Initializing...')
const healthReport = ref<SystemHealthReport | null>(null)
const performanceMetrics = ref<any>(null)

// Computed properties
const statusIcon = computed(() => {
  switch (status.value) {
    case 'healthy':
      return 'CheckIcon-circle-outline'
    case 'degraded':
      return 'mdi-alert-circle-outline'
    case 'critical':
      return 'XMarkIcon-circle-outline'
    case 'checking':
      return 'ArrowPathIcon'
    default:
      return 'QuestionMarkCircleIcon-circle'
  }
})

const statusText = computed(() => {
  switch (status.value) {
    case 'healthy':
      return 'All Systems Operational'
    case 'degraded':
      return 'Minor Issues Detected'
    case 'critical':
      return 'Critical Issues'
    case 'checking':
      return 'Checking...'
    default:
      return 'Unknown Status'
  }
})

const componentStatus = computed(() => {
  if (!healthReport.value) return []

  const components = [
    'AI Service',
    'Database',
    'Storage',
    'Gaming Studios',
    'Media Streaming',
    'Theme System',
    'Gamification',
  ]

  return components.map(componentName => {
    const componentResults = healthReport.value!.results.filter(
      r => r.component === componentName
    )
    const passedTests = componentResults.filter(
      r => r.status === 'passed'
    ).length
    const failedTests = componentResults.filter(
      r => r.status === 'failed'
    ).length
    const totalTests = componentResults.length

    let componentStatus: 'healthy' | 'degraded' | 'critical'
    if (failedTests === 0) {
      componentStatus = 'healthy'
    } else if (failedTests <= totalTests * 0.5) {
      componentStatus = 'degraded'
    } else {
      componentStatus = 'critical'
    }

    return {
      name: componentName,
      status: componentStatus,
      icon: getComponentIcon(componentName),
      tests: totalTests > 0 ? { passed: passedTests, total: totalTests } : null,
      metric: getComponentMetric(componentName, componentResults),
    }
  })
})

const recentTestResults = computed(() => {
  if (!healthReport.value) return []
  return [...healthReport.value.results]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 8)
})

// Methods
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const runHealthCheck = async () => {
  isChecking.value = true
  status.value = 'checking'

  try {
    const result = await systemIntegrationTest.runQuickHealthCheck()
    status.value = result.status
    statusMessage.value = result.message

    // Update performance metrics
    performanceMetrics.value = systemIntegrationTest.getPerformanceMetrics()
  } catch (error) {
    status.value = 'critical'
    statusMessage.value = `Health check failed: ${error}`
  } finally {
    isChecking.value = false
  }
}

const runFullTest = async () => {
  isRunningFullTest.value = true
  status.value = 'checking'

  try {
    healthReport.value = await systemIntegrationTest.runFullSystemTest()
    status.value = healthReport.value.overallStatus
    statusMessage.value = `Full test complete: ${healthReport.value.passedTests}/${healthReport.value.totalTests} passed`

    // Update performance metrics
    performanceMetrics.value = systemIntegrationTest.getPerformanceMetrics()
  } catch (error) {
    status.value = 'critical'
    statusMessage.value = `Full test failed: ${error}`
  } finally {
    isRunningFullTest.value = false
  }
}

const getComponentIcon = (componentName: string): string => {
  const iconMap: Record<string, string> = {
    'AI Service': 'mdi-robot',
    Database: 'CircleStackIcon',
    Storage: 'mdi-harddisk',
    'Gaming Studios': 'DevicePhoneMobileIcon-variant',
    'Media Streaming': 'VideoCameraIcon',
    'Theme System': 'SwatchIcon',
    Gamification: 'TrophyIcon',
  }
  return iconMap[componentName] || 'mdi-cog'
}

const getComponentMetric = (
  componentName: string,
  results: any[]
): string | null => {
  // Add specific metrics for different components
  switch (componentName) {
    case 'Gaming Studios': {
      const studioResult = results.find(r => r.test === 'Data retrieval')
      return studioResult?.message.includes('Retrieved')
        ? studioResult.message
        : null
    }
    case 'AI Service':
      return results.length > 0 ? `${results.length} services tested` : null
    default:
      return null
  }
}

const getTestResultIcon = (testStatus: string): string => {
  switch (testStatus) {
    case 'passed':
      return 'CheckIcon'
    case 'failed':
      return 'XMarkIcon'
    case 'warning':
      return 'mdi-alert'
    default:
      return 'QuestionMarkCircleIcon'
  }
}

// Lifecycle
onMounted(async () => {
  // Run initial health check
  await runHealthCheck()
})
</script>

<style scoped>
.system-status-indicator {
  position: relative;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--surface-glass);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-healthy {
  background: linear-gradient(
    135deg,
    var(--color-success-50),
    var(--color-success-100)
  );
  border-color: var(--color-success-300);
  color: var(--color-success-700);
}

.status-degraded {
  background: linear-gradient(
    135deg,
    var(--color-warning-50),
    var(--color-warning-100)
  );
  border-color: var(--color-warning-300);
  color: var(--color-warning-700);
}

.status-critical {
  background: linear-gradient(
    135deg,
    var(--color-error-50),
    var(--color-error-100)
  );
  border-color: var(--color-error-300);
  color: var(--color-error-700);
}

.status-checking {
  background: linear-gradient(
    135deg,
    var(--color-primary-50),
    var(--color-primary-100)
  );
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.expand-icon {
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.status-details {
  position: absolute;
  top: 100%;
  right: 0;
  width: 450px;
  max-width: 90vw;
  margin-top: var(--spacing-2);
  padding: var(--spacing-lg);
  z-index: 1000;
  border: 1px solid var(--border-base);
  backdrop-filter: var(--backdrop-blur-base);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.status-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.status-actions {
  display: flex;
  gap: var(--spacing-2);
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-lg);
}

.component-status {
  padding: var(--spacing-3);
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  border-l: 3px solid var(--border-base);
}

.component-status.status-healthy {
  border-l-color: var(--color-success-500);
}

.component-status.status-degraded {
  border-l-color: var(--color-warning-500);
}

.component-status.status-critical {
  border-l-color: var(--color-error-500);
}

.component-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.component-name {
  flex: 1;
  font-weight: 500;
  font-size: 0.875rem;
}

.component-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-healthy {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-degraded {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-critical {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.component-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  font-size: 1rem;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-lg);
}

.metric-item {
  padding: var(--spacing-3);
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-1);
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
}

.test-results-list {
  max-height: 200px;
  overflow-y: auto;
}

.test-result-item {
  padding: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  background: var(--surface-base);
  border-radius: var(--radius-sm);
  border-l: 2px solid var(--border-base);
}

.test-result-item.result-passed {
  border-l-color: var(--color-success-500);
}

.test-result-item.result-failed {
  border-l-color: var(--color-error-500);
}

.test-result-item.result-warning {
  border-l-color: var(--color-warning-500);
}

.result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
  font-size: 0.75rem;
  font-weight: 500;
}

.result-component {
  color: var(--text-primary-600);
}

.result-test {
  color: var(--text-secondary);
  flex: 1;
}

.result-duration {
  color: var(--text-tertiary);
}

.result-message {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding-left: calc(var(--spacing-2) + 16px); /* Icon width + gap */
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dark mode adjustments */
[data-theme='dark'] .status-details {
  background: var(--surface-glass);
  border-color: var(--border-glass);
}

[data-theme='dark'] .component-status,
[data-theme='dark'] .metric-item,
[data-theme='dark'] .test-result-item {
  background: var(--surface-glass);
}

/* Responsive design */
@media (max-width: 768px) {
  .status-details {
    width: 350px;
    right: -50px;
  }

  .components-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
