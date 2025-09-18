<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="developer-settings-section">
    <div class="settings-card glass-card section-card">
      <div class="card-header section-header">
        <h5 class="card-title mb-0">
          <AppIcon name="mdi-code-braces" class="me-2" />
          Developer Settings
        </h5>
      </div>
      <div class="card-body section-body">
        <div class="alert alert-warning mb-4">
          <AppIcon name="mdi-alert" class="me-2" />
          <strong>Warning:</strong> These settings are for advanced users and
          developers. Changing these settings may affect app performance or
          stability.
        </div>

        <div class="row g-4">
          <!-- Left Column: Debug Options -->
          <div class="col-md-6">
            <div class="settings-group">
              <h6 class="settings-group-title">Debug Options</h6>

              <!-- Debug Mode -->
              <div class="form-check form-switch mb-3">
                <input
                  id="debugMode"
                  v-model="localSettings.debugMode"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="debugMode">
                  Enable Debug Mode
                </label>
                <small class="form-text text-muted">
                  Shows additional debug information and logs
                </small>
              </div>

              <!-- Verbose Logging -->
              <div class="form-check form-switch mb-3">
                <input
                  id="verboseLogging"
                  v-model="localSettings.verboseLogging"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="verboseLogging">
                  Verbose Logging
                </label>
                <small class="form-text text-muted">
                  Enables detailed console logging for troubleshooting
                </small>
              </div>

              <!-- Performance Monitoring -->
              <div class="form-check form-switch mb-3">
                <input
                  id="performanceMonitoring"
                  v-model="localSettings.performanceMonitoring"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="performanceMonitoring">
                  Performance Monitoring
                </label>
                <small class="form-text text-muted">
                  Tracks component render times and API response times
                </small>
              </div>

              <!-- Show Component Outlines -->
              <div class="form-check form-switch mb-3">
                <input
                  id="showComponentOutlines"
                  v-model="localSettings.showComponentOutlines"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="showComponentOutlines">
                  Show Component Outlines
                </label>
                <small class="form-text text-muted">
                  Displays visual outlines around Vue components
                </small>
              </div>
            </div>

            <!-- Experimental Features -->
            <div class="settings-group mt-4">
              <h6 class="settings-group-title">
                <AppIcon name="mdi-flask" class="me-1" />
                Experimental Features
              </h6>

              <div class="form-check form-switch mb-3">
                <input
                  id="experimentalFeatures"
                  v-model="localSettings.experimentalFeatures"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="experimentalFeatures">
                  Enable Experimental Features
                </label>
                <small class="form-text text-muted">
                  Access to beta features and new functionalities
                </small>
              </div>

              <div class="form-check form-switch mb-3">
                <input
                  id="betaUIComponents"
                  v-model="localSettings.betaUIComponents"
                  class="form-check-input"
                  type="checkbox"
                  :disabled="!localSettings.experimentalFeatures"
                />
                <label class="form-check-label" for="betaUIComponents">
                  Beta UI Components
                </label>
                <small class="form-text text-muted">
                  Use new experimental UI components
                </small>
              </div>
            </div>
          </div>

          <!-- Right Column: Advanced Options -->
          <div class="col-md-6">
            <div class="settings-group">
              <h6 class="settings-group-title">Advanced Options</h6>

              <!-- API Timeout -->
              <div class="mb-3">
                <label for="apiTimeout" class="form-label"
                  >API Request Timeout (seconds)</label
                >
                <input
                  id="apiTimeout"
                  v-model.number="localSettings.apiTimeout"
                  type="number"
                  class="form-control glass-input"
                  min="5"
                  max="120"
                  step="5"
                />
                <small class="form-text text-muted">
                  Maximum time to wait for API responses
                </small>
              </div>

              <!-- Memory Management -->
              <div class="mb-3">
                <label for="memoryLimit" class="form-label"
                  >Memory Limit (MB)</label
                >
                <input
                  id="memoryLimit"
                  v-model.number="localSettings.memoryLimit"
                  type="number"
                  class="form-control glass-input"
                  min="256"
                  max="2048"
                  step="128"
                />
                <small class="form-text text-muted">
                  Maximum memory usage before cleanup
                </small>
              </div>

              <!-- Cache Duration -->
              <div class="mb-3">
                <label for="cacheDuration" class="form-label"
                  >Cache Duration (minutes)</label
                >
                <input
                  id="cacheDuration"
                  v-model.number="localSettings.cacheDuration"
                  type="number"
                  class="form-control glass-input"
                  min="1"
                  max="1440"
                  step="5"
                />
                <small class="form-text text-muted">
                  How long to cache API responses and computed data
                </small>
              </div>

              <!-- Max Concurrent Requests -->
              <div class="mb-3">
                <label for="maxConcurrentRequests" class="form-label"
                  >Max Concurrent Requests</label
                >
                <input
                  id="maxConcurrentRequests"
                  v-model.number="localSettings.maxConcurrentRequests"
                  type="number"
                  class="form-control glass-input"
                  min="1"
                  max="10"
                  step="1"
                />
                <small class="form-text text-muted">
                  Maximum simultaneous API requests
                </small>
              </div>
            </div>

            <!-- System Information -->
            <div class="settings-group mt-4">
              <h6 class="settings-group-title">
                <AppIcon name="mdi-information" class="me-1" />
                System Information
              </h6>

              <div class="system-info-grid">
                <div class="info-item">
                  <span class="info-label">App Version:</span>
                  <span class="info-value">{{ appVersion }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Vue Version:</span>
                  <span class="info-value">{{ vueVersion }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Build:</span>
                  <span class="info-value">{{ buildInfo }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Environment:</span>
                  <span class="info-value">{{ environment }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">User Agent:</span>
                  <span class="info-value small">{{ userAgent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="settings-actions mt-4">
          <div class="d-flex flex-wrap gap-2 justify-content-between">
            <div class="action-group">
              <UnifiedButton
                type="button"
                variant="primary"
                :disabled="saving"
                leading-icon="mdi-content-save"
                @click="saveSettings"
              >
                {{ saving ? 'Saving...' : 'Save Settings' }}
              </UnifiedButton>
            </div>

            <div class="action-group">
              <UnifiedButton
                type="button"
                variant="outline"
                class="me-2"
                leading-icon="mdi-download"
                @click="exportDebugInfo"
                >Export Debug Info</UnifiedButton
              >

              <UnifiedButton
                type="button"
                variant="outline"
                leading-icon="mdi-restore"
                @click="resetToDefaults"
                >Reset Defaults</UnifiedButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Toggle Integration -->
    <div class="settings-card glass-card section-card mt-4">
      <div class="card-header section-header">
        <h5 class="card-title mb-0">
          <AppIcon name="mdi-palette" />
          Theme & Appearance
        </h5>
      </div>
      <div class="card-body section-body">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h6>Quick Theme Toggle</h6>
            <p class="text-muted small mb-0">
              Switch between light, dark, and system themes
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <ThemeToggle :show-device-info="localSettings.debugMode" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useToast } from '@/composables/useToast'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { version } from 'vue'
import { getAppVersion } from '@/utils/version'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const _props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  appVersion: {
    type: String,
    default: getAppVersion(),
  },
})

const emit = defineEmits([
  'save',
  'reset-all',
  'export-debug',
  'update:settings',
])

const toast = useToast()
const saving = ref(false)

// Local settings with developer-specific defaults
const localSettings = ref({
  debugMode: false,
  verboseLogging: false,
  performanceMonitoring: false,
  showComponentOutlines: false,
  experimentalFeatures: false,
  betaUIComponents: false,
  apiTimeout: 30,
  memoryLimit: 512,
  cacheDuration: 15,
  maxConcurrentRequests: 3,
  ...props.settings,
})

// System information
const vueVersion = computed(() => version)
const buildInfo = computed(() => import.meta.env.MODE || 'development')
const environment = computed(() => import.meta.env.NODE_ENV || 'development')
const userAgent = computed(() => navigator.userAgent)

// Watch for changes and emit to parent
watch(
  localSettings,
  newSettings => {
    emit('update:settings', newSettings)
  },
  { deep: true }
)

// Apply debug styles when component outlines are enabled
watch(
  () => localSettings.value.showComponentOutlines,
  enabled => {
    const style = document.getElementById('debug-component-outlines')

    if (enabled && !style) {
      const debugStyle = document.createElement('style')
      debugStyle.id = 'debug-component-outlines'
      debugStyle.textContent = `
      .vue-component {
        outline: 1px solid rgba(255, 0, 0, 0.3) !important;
        outline-offset: -1px;
      }
      .vue-component:hover {
        outline-color: rgba(255, 0, 0, 0.6) !important;
      }
    `
      document.head.appendChild(debugStyle)

      // Add debug class to all components
      document.querySelectorAll('[data-v-*]').forEach(el => {
        el.classList.add('vue-component')
      })
    } else if (!enabled && style) {
      style.remove()
      document.querySelectorAll('.vue-component').forEach(el => {
        el.classList.remove('vue-component')
      })
    }
  }
)

const saveSettings = async () => {
  saving.value = true
  try {
    emit('save')
    toast.success('Developer settings saved successfully!')
  } catch (error) {
    toast.error('Failed to save developer settings')
    console.error('Save settings error:', error)
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  if (
    confirm(
      'Reset all developer settings to default values? This cannot be undone.'
    )
  ) {
    localSettings.value = {
      debugMode: false,
      verboseLogging: false,
      performanceMonitoring: false,
      showComponentOutlines: false,
      experimentalFeatures: false,
      betaUIComponents: false,
      apiTimeout: 30,
      memoryLimit: 512,
      cacheDuration: 15,
      maxConcurrentRequests: 3,
    }
    toast.success('Developer settings reset to defaults')
  }
}

const exportDebugInfo = () => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    appVersion: props.appVersion,
    vueVersion: vueVersion.value,
    build: buildInfo.value,
    environment: environment.value,
    userAgent: userAgent.value,
    settings: localSettings.value,
    performance: performance.getEntriesByType
      ? {
          navigation: performance.getEntriesByType('navigation'),
          memory: performance.memory || null,
        }
      : null,
    localStorage: {
      keys: Object.keys(localStorage),
      size: JSON.stringify(localStorage).length,
    },
  }

  const blob = new Blob([JSON.stringify(debugInfo, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `navicv-debug-${new Date().toISOString().slice(0, 19)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  toast.success('Debug information exported successfully')
  emit('export-debug', debugInfo)
}

onMounted(() => {
  // Sync with parent settings
  Object.assign(localSettings.value, props.settings)
})
</script>

<style scoped>
.developer-settings-section .settings-card {
  margin-bottom: 0;
}

.settings-group {
  padding: 0;
}

.settings-group-title {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.system-info-grid {
  display: grid;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-smooth);
}

.info-item:hover {
  background: var(--glass-elevated);
}

.info-label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 100px;
}

.info-value {
  color: var(--text-secondary);
  text-align: right;
  word-break: break-all;
}

.settings-actions {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Enhanced form styles for developer settings */
.form-control.glass-input[type='number'] {
  max-width: 150px;
}

.form-check-input:disabled + .form-check-label {
  opacity: 0.6;
}

.alert-warning {
  background: var(--glass-surface);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: var(--text-primary);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Theme toggle integration */
.theme-toggle-container {
  display: inline-flex;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-group {
    width: 100%;
    justify-content: center;
  }

  .settings-actions .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-label {
    min-width: auto;
  }

  .info-value {
    text-align: left;
    font-size: 0.9rem;
  }
}

/* Debug mode specific styles */
.vue-component {
  position: relative;
}

.vue-component::after {
  content: attr(class);
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  white-space: nowrap;
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.vue-component:hover::after {
  opacity: 1;
}
</style>
