<template>
  <div class="theme-toggle-container">
    <!-- Theme Toggle Button -->
    <UnifiedButton
      variant="outline"
      size="sm"
      :aria-label="themeToggleLabel"
      :title="themeToggleLabel"
      :leading-icon="theme?.getThemeIcon?.() || 'mdi-monitor'"
      @click="theme?.cycleTheme?.()"
    >
      <span class="theme-label">{{ theme?.getThemeDisplayName?.() || 'System' }}</span>
    </UnifiedButton>

    <!-- Optional Density Toggle -->
    <UnifiedButton
      v-if="showDensity"
      variant="outline"
      size="sm"
      :aria-label="densityToggleLabel"
      :title="densityToggleLabel"
      :leading-icon="densityIcon"
      @click="ui.cycleDensity()"
    >
      <span class="theme-label">{{ densityLabel }}</span>
    </UnifiedButton>

    <!-- Device Info (dev mode only) -->
    <div v-if="showDeviceInfo" class="device-info">
      <span class="device-badge" :class="`device-${responsive.deviceType.value}`">
        {{ responsive.deviceType.value }}
      </span>
      <span class="breakpoint-badge">
        {{ responsive.currentBreakpoint.value }}
      </span>
      <span class="dimensions">
        {{ responsive.windowWidth.value }}x{{ responsive.windowHeight.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { useResponsive } from '@/composables/useResponsive'
import { useUnifiedUI } from '@/composables/useUnifiedUI'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Props {
  showDeviceInfo?: boolean
  compact?: boolean
  showDensity?: boolean
}

const { showDeviceInfo = false, showDensity = false } = defineProps<Props>()

// Use the unified theme system
const theme = useUnifiedTheme()
const responsive = useResponsive()
const ui = useUnifiedUI()

const themeToggleLabel = computed(() => {
  const current = theme?.getThemeDisplayName?.() || 'System'
  const mode = theme?.themeMode?.value || 'system'
  const next = mode === 'light' ? 'Dark' : mode === 'dark' ? 'System' : 'Light'
  return `Switch from ${current} to ${next} theme`
})

const densityLabel = computed(() => {
  const d = ui.density.value
  return d === 'compact' ? 'Compact' : d === 'comfortable' ? 'Comfortable' : 'Normal'
})

const densityToggleLabel = computed(() => `Cycle density (current: ${densityLabel.value})`)

const densityIcon = computed(() => {
  const d = ui.density.value
  return d === 'compact' ? 'mdi-format-line-weight' : d === 'comfortable' ? 'mdi-format-line-spacing' : 'mdi-equal'
})
</script>

<style scoped>
.theme-toggle-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-primary);
}

.theme-toggle-container button {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  transition: all var(--duration-normal) var(--easing-ease-out);
  backdrop-filter: var(--glass-backdrop-blur);
}

.theme-label {
  margin-left: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-normal) var(--easing-ease-out);
}

.device-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-left: var(--spacing-sm);
}

.device-badge {
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
}

.device-badge.device-mobile {
  background: var(--warning-gradient-bg);
  color: var(--color-warning);
}

.device-badge.device-tablet {
  background: var(--info-gradient-bg);
  color: var(--color-info);
}

.device-badge.device-desktop {
  background: var(--success-gradient-bg);
  color: var(--color-success);
}

.breakpoint-badge {
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  background: var(--primary-gradient-bg);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.dimensions {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
}

/* Enhanced Dark Theme Support */
[data-theme="dark"] .theme-toggle-container button,
.dark-theme .theme-toggle-container button {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

[data-theme="dark"] .theme-toggle-container button:hover,
.dark-theme .theme-toggle-container button:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

[data-theme="dark"] .theme-label,
.dark-theme .theme-label {
  color: var(--text-primary);
}

/* Gaming theme enhancement */
.theme-gaming .theme-toggle-container button {
  border: 1px solid var(--border-gaming);
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 217, 255, 0.03));
}

.theme-gaming .theme-toggle-container button:hover {
  box-shadow: var(--shadow-glow-gaming);
}

/* System theme support */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .theme-toggle-container button {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
  
  :root:not([data-theme="light"]) .theme-toggle-container button:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

/* Theme transition animation */
.theme-toggle-container button {
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
}

.theme-toggle-container button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s var(--easing-ease-out);
}

.theme-toggle-container button:hover::before {
  transform: translateX(100%);
}

/* Hide labels on very small screens */
@media (max-width: 480px) {
  .theme-label {
    display: none;
  }
  
  .device-info {
    display: none;
  }
}
</style>
