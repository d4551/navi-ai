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
      <span class="theme-label">{{
        theme?.getThemeDisplayName?.() || "System"
      }}</span>
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
      <span
        class="device-badge"
        :class="`device-${responsive.deviceType.value}`"
      >
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
import { computed } from 'vue';

import { computed } from "vue";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import { useResponsive } from "@/composables/useResponsive";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

interface Props {
  showDeviceInfo?: boolean;
  compact?: boolean;
  showDensity?: boolean;
}

const { showDeviceInfo = false, showDensity = false } = defineProps<Props>();

// Use the unified theme system
const _theme = useUnifiedTheme();
const responsive = useResponsive();
const ui = useUnifiedUI();

const themeToggleLabel = computed(() => {
  const current = theme?.getThemeDisplayName?.() || "System";
  const mode = theme?.themeMode?.value || "system";
  const next = mode === "light" ? "Dark" : mode === "dark" ? "System" : "Light";
  return `Switch from ${current} to ${next} theme`;
});

const densityLabel = computed(() => {
  const d = ui.density.value;
  return d === "compact"
    ? "Compact"
    : d === "comfortable"
      ? "Comfortable"
      : "Normal";
});

const densityToggleLabel = computed(
  () => `Cycle density (current: ${densityLabel.value})`,
);

const densityIcon = computed(() => {
  const d = ui.density.value;
  return d === "compact"
    ? "mdi-format-line-weight"
    : d === "comfortable"
      ? "mdi-format-line-spacing"
      : "mdi-equal";
});
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

[data-theme="dark"] .theme-toggle-container button,
.dark-theme .theme-toggle-container button {
  color: var(--text-primary);
}

[data-theme="dark"] .theme-toggle-container button:hover,
.dark-theme .theme-toggle-container button:hover {
}

[data-theme="dark"] .theme-label,
.dark-theme .theme-label {
  color: var(--text-primary);
}

.theme-gaming .theme-toggle-container button {
  background: linear-gradient(
  );
}

.theme-gaming .theme-toggle-container button:hover {
  box-shadow: var(--shadow-glow-gaming);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .theme-toggle-container button {
    color: var(--text-primary);
  }

  :root:not([data-theme="light"]) .theme-toggle-container button:hover {
  }
}

.theme-toggle-container button {
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
}

.theme-toggle-container button::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
}

.theme-toggle-container button:hover::before {
}

  .theme-label {
    display: none;
  }

  .device-info {
    display: none;
  }
}
</style>
