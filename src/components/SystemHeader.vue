<template>
  <header class="system-header v-app-bar font-sans" role="banner">
    <!-- Top Status Bar -->
    <div class="status-bar">
      <div class="status-bar-content">
        <div class="station-info">
          <AppIcon :name="icon || 'mdi-application-brackets'" class="station-icon" />
          <span class="station-label">{{ title }}</span>
          <span class="station-id">{{ stationId }}</span>
        </div>

        <div class="system-status">
          <div class="status-indicator" :class="systemStatusClass">
            <AppIcon :name="systemStatusIcon" class="status-icon" />
            <span class="status-text">{{ systemStatusText }}</span>
          </div>
        </div>

        <div class="quick-actions">
          <!-- Provider Health Status Pill -->
          <div 
            v-if="providerHealth" 
            class="provider-health-pill"
            :class="providerHealthStatusClass"
            :title="providerHealthStatusText"
            :aria-label="providerHealthStatusText"
          >
            <AppIcon :name="providerHealthIcon" />
            <span class="provider-status-text">
              {{ Object.values(providerHealth).filter(Boolean).length }}/{{ Object.keys(providerHealth).length }}
            </span>
          </div>

          <!-- Theme toggle removed by guideline; managed in Settings -->
          <IconButton class="quick-btn" variant="glass" size="sm" icon="ArrowPathIcon" title="Refresh System" aria-label="Refresh System" @click="refreshSystem" />
          <IconButton class="quick-btn" variant="glass" size="sm" icon="mdi-cog-outline" title="System Settings" aria-label="System Settings" @click="openSettings" />
        </div>
      </div>
    </div>

    <!-- Simplified Header Row (glasmorphic, light/dark) -->
    <div class="main-header simple">
      <div class="header-flex flex-wrap">
        <div class="left">
          <h1 class="system-title">
            <AppIcon :name="icon" class="title-icon" />
            {{ title }}
          </h1>
          <p v-if="subtitle" class="system-subtitle">{{ subtitle }}</p>
        </div>
        <div class="center">
          <div 
            v-if="providerHealth" 
            class="provider-health-pill"
            :class="providerHealthStatusClass"
            :title="providerHealthStatusText"
            :aria-label="providerHealthStatusText"
          >
            <AppIcon :name="providerHealthIcon" />
            <span class="provider-status-text">
              {{ Object.values(providerHealth).filter(Boolean).length }}/{{ Object.keys(providerHealth).length }}
            </span>
          </div>
        </div>
        <div class="right">
          <div class="status-indicator" :class="systemStatusClass">
            <AppIcon :name="systemStatusIcon" class="status-icon" />
            <span class="status-text">{{ systemStatusText }}</span>
          </div>
          <IconButton class="quick-btn" variant="glass" size="sm" icon="ArrowPathIcon" title="Refresh System" aria-label="Refresh System" @click="refreshSystem" />
          <IconButton class="quick-btn" variant="glass" size="sm" icon="mdi-cog-outline" title="System Settings" aria-label="System Settings" @click="openSettings" />
        </div>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

import { computed, defineEmits, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
// import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { logger } from '@/shared/utils/logger'
import AppIcon from '@/components/ui/AppIcon.vue'
import IconButton from '@/components/ui/IconButton.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  stationId: { type: String, default: 'GS-001' },
  online: { type: Boolean, default: false },
  actions: { type: Array, default: () => [] },
  icon: { type: String, default: 'mdi-cog' },
  providerHealth: { type: Object, default: null } // Provider health status from JobSearch
})

// Define emits for parent communication
const emit = defineEmits(['refresh','settings-open'])

// Setup router and store
const router = useRouter()
const store = useAppStore()

// Computed properties

const systemStatusClass = computed(() => {
  return props.online ? 'online' : 'offline'
})

// Theme toggle is managed in Settings; removed here for simplicity

const systemStatusIcon = computed(() => {
  return props.online ? 'CheckIcon-circle-outline' : 'XMarkIcon-circle-outline'
})

const systemStatusText = computed(() => {
  return props.online ? 'System Online' : 'System Offline'
})

// Provider health status computeds
const providerHealthStatusClass = computed(() => {
  if (!props.providerHealth) return 'provider-status-unknown'
  
  const totalProviders = Object.keys(props.providerHealth).length
  const activeProviders = Object.values(props.providerHealth).filter(Boolean).length
  const healthPercentage = totalProviders > 0 ? (activeProviders / totalProviders) * 100 : 0
  
  if (healthPercentage === 100) return 'provider-status-healthy'
  if (healthPercentage >= 50) return 'provider-status-degraded'
  return 'provider-status-down'
})

const providerHealthStatusText = computed(() => {
  if (!props.providerHealth) return 'Provider status unknown'
  
  const totalProviders = Object.keys(props.providerHealth).length
  const activeProviders = Object.values(props.providerHealth).filter(Boolean).length
  const healthPercentage = totalProviders > 0 ? (activeProviders / totalProviders) * 100 : 0
  
  if (healthPercentage === 100) return 'All providers operational'
  if (healthPercentage >= 50) return `${activeProviders}/${totalProviders} providers up`
  return 'Providers experiencing issues'
})

const providerHealthIcon = computed(() => {
  if (!props.providerHealth) return 'QuestionMarkCircleIcon-circle'
  
  const totalProviders = Object.keys(props.providerHealth).length
  const activeProviders = Object.values(props.providerHealth).filter(Boolean).length
  const healthPercentage = totalProviders > 0 ? (activeProviders / totalProviders) * 100 : 0
  
  if (healthPercentage === 100) return 'CheckIcon-circle-outline'
  if (healthPercentage >= 50) return 'mdi-alert-circle-outline'
  return 'XMarkIcon-circle-outline'
})

// Methods (store already declared above; toggleTheme defined earlier)

const refreshSystem = async () => {
  try {
    logger.info('SystemHeader: Refreshing system...')
    emit('refresh')
    
    // Refresh services status
    if (store.refreshSystemStatus) {
      await store.refreshSystemStatus()
    }
    
    // Force page reload can be handled by parent if needed
  } catch (error) {
    logger.error('SystemHeader: Failed to refresh system', error)
  }
}

const openSettings = () => {
  try {
    logger.info('SystemHeader: Opening settings')
    emit('settings-open')
    
    // Navigate to settings route if available
    if (router.hasRoute('settings')) {
      router.push('/settings')
    } else {
      // Open settings modal or trigger parent handler
      emit('settings-open')
    }
  } catch (error) {
    logger.error('SystemHeader: Failed to open settings', error)
  }
}

// Removed device setup and configuration panel for simplified header
</script>

<style scoped>
.status-bar {
  padding: var(--spacing-sm) var(--spacing-md);
  border-b: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.6);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
}

.status-bar .status-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.station-info { display: inline-flex; align-items: center; gap: var(--spacing-sm); }
.station-icon { font-size: 1.1rem; color: var(--color-primary-500); }
.station-label { font-weight: 600; color: var(--text-primary-600); }
.station-id { font-size: 0.8rem; color: var(--text-secondary); }

.system-status .status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.45);
  color: var(--text-primary-600);
}
.status-indicator.online { border-color: color-mix(in srgb, var(--color-success) 35%, transparent); }
.status-indicator.offline { border-color: color-mix(in srgb, var(--color-danger) 35%, transparent); }
.status-icon { opacity: 0.9; }

.quick-actions { display: inline-flex; align-items: center; gap: var(--spacing-sm); }
.quick-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.5);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}
.quick-btn:hover { background: rgba(var(--surface-glass-rgb, 255,255,255), 0.65); }

.main-header.simple { padding: var(--spacing-md); }
.main-header .header-flex flex-wrap { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--spacing-md); }
.system-title { display: flex; align-items: center; gap: var(--spacing-sm); margin: 0; }
.title-icon { color: var(--color-primary-500); }
.system-subtitle { margin: 4px 0 0; color: var(--text-secondary); font-size: 0.9rem; }
.system-header {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  margin-bottom: var(--spacing-lg);
  padding: 0;
  transition: all var(--duration-normal) var(--easing-ease-out);
  font-family: var(--font-primary);
}

/* Enhanced Dark Theme Support */
[data-theme="dark"] .system-header,
.dark-theme .system-header {
  background: rgba(15, 15, 15, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
}

/* System preference support */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .system-header {
    background: rgba(15, 15, 15, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}

.container-fluid.px-3 {
  padding-left: var(--spacing-lg) !important;
  padding-right: var(--spacing-lg) !important;
  padding-top: var(--spacing-md) !important;
  padding-bottom: var(--spacing-md) !important;
}

.sys-header-flex flex-wrap {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--spacing-lg);
  align-items: center;
}

.sys-left {
  min-width: 0;
}

.sys-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.sys-subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.sys-middle {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.status-panel {
  background: var(--bg-secondary-500);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  min-width: 400px;
  box-shadow: var(--shadow-sm);
}

[data-theme="dark"] .status-panel,
:root:not([data-theme]) .status-panel {
  background: var(--dark-bg-secondary-500);
  border-color: var(--glass-border-dark);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-b: 1px solid var(--glass-border);
}

.status-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.overall-health {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.health-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.health-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.status-indicators {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-primary-500);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--glass-border);
}

[data-theme="dark"] .status-item,
:root:not([data-theme]) .status-item {
  background: var(--dark-bg-primary-500);
  border-color: var(--glass-border-dark);
}

.service-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary-600);
}

.service-status {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.service-status.offline {
  color: var(--color-danger);
}

.service-status.online {
  color: var(--color-success);
}

.service-status.warning {
  color: var(--color-warning);
}

.status-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-xs);
  border-t: 1px solid var(--glass-border);
  font-size: 0.75rem;
}

.settings-link a {
  color: var(--color-primary);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.settings-link a:hover {
  color: var(--color-primary-alt);
  text-decoration: none;
}

.sys-right {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

/* Theme status chip styles removed */

.sys-action.btn {
  min-height: 36px;
  font-weight: 500;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.sys-action.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glass);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .sys-header-flex flex-wrap {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .sys-middle {
    order: -1;
    width: 100%;
  }

  .status-panel {
    min-width: auto;
    width: 100%;
  }

  .status-indicators {
    grid-template-columns: 1fr;
  }

  .status-footer {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-start;
  }
}

/* Provider Health Status Pill */
.provider-health-pill {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  transition: all var(--transition-fast);
}

.provider-health-pill .mdi {
  font-size: 0.875rem;
}

.provider-status-text {
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Health Status Colors */
.provider-status-healthy {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  color: #16a34a;
}

.provider-status-degraded {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #d97706;
}

.provider-status-down {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.provider-status-unknown {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.3);
  color: #6b7280;
}

/* Dark theme support for provider health pill */
[data-theme="dark"] .provider-status-healthy,
:root:not([data-theme]) .provider-status-healthy {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

[data-theme="dark"] .provider-status-degraded,
:root:not([data-theme]) .provider-status-degraded {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}

[data-theme="dark"] .provider-status-down,
:root:not([data-theme]) .provider-status-down {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

[data-theme="dark"] .provider-status-unknown,
:root:not([data-theme]) .provider-status-unknown {
  background: rgba(156, 163, 175, 0.2);
  border-color: rgba(156, 163, 175, 0.4);
  color: #9ca3af;
}

@media (max-width: 768px) {
  .container-fluid.px-3 {
    padding-left: var(--spacing-md) !important;
    padding-right: var(--spacing-md) !important;
  }

  .sys-title {
    font-size: 1.5rem;
  }

  .status-panel {
    padding: var(--spacing-sm);
  }

  .sys-right {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .sys-action.btn {
    min-height: 32px;
    font-size: 0.875rem;
  }

  .provider-health-pill {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
  }

  .provider-health-pill .mdi {
    font-size: 0.8rem;
  }
}
</style>
