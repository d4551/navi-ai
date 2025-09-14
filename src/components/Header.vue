<template>
  <header :class="headerClasses" role="banner" :aria-labelledby="titleId">
    <!-- Glass backdrop effect -->
    <div class="header-backdrop"></div>

    <!-- Optional breadcrumbs -->
    <nav
      v-if="showBreadcrumbs && breadcrumbs.length"
      class="header-breadcrumbs"
      aria-label="Breadcrumb"
    >
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <router-link to="/" class="breadcrumb-link home-link">
            <AppIcon name="mdi-home-outline" />
          </router-link>
        </li>
        <li
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          class="breadcrumb-item"
        >
          <AppIcon name="mdi-chevron-right" class="breadcrumb-separator" />
          <router-link
            v-if="crumb.route"
            :to="crumb.route"
            class="breadcrumb-link"
          >
            {{ crumb.title }}
          </router-link>
          <span v-else class="breadcrumb-current">{{ crumb.title }}</span>
        </li>
      </ol>
    </nav>

    <div class="header-container">
      <!-- Main Title Section -->
      <div class="header-title-section">
        <div class="header-title-wrapper">
          <component :is="titleTag" :id="titleId" :class="titleClasses">
            <!-- Inline icon when not stacked -->
            <AppIcon
              v-if="icon"
              :name="icon"
              class="header-icon"
              aria-hidden="true"
            />
            {{ title }}
          </component>

          <p
            v-if="subtitle"
            :class="subtitleClasses"
            :aria-describedby="titleId"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Enhanced AI Status Indicator -->
      <div v-if="showAiStatus" class="header-ai-status">
        <div
          class="ai-status-indicator"
          :class="{
            'ai-ready': aiConnected,
            'ai-disconnected': !aiConnected,
            'ai-loading': store.loading?.ai,
          }"
          :aria-label="getAIStatusLabel"
          :title="getAIStatusTitle"
        >
          <div class="ai-icon-wrapper">
            <AppIcon
              :name="getAIIcon"
              class="ai-status-icon"
              aria-hidden="true"
            />
            <div class="ai-glow" :class="{ active: aiConnected }"></div>
          </div>
          <div class="ai-status-content">
            <span class="ai-status-text">{{ getAIStatusText }}</span>
            <span
              v-if="aiConnected && store.settings?.selectedModel"
              class="ai-model-text"
            >
              {{ store.settings.selectedModel }}
            </span>
          </div>
          <div v-if="aiConnected" class="ai-status-pulse"></div>
        </div>
      </div>

      <!-- Gamification Quick Access -->
      <div v-if="showGamificationButton" class="header-gamify">
        <Tooltip :text="''" position="bottom" :dark="isDark">
          <template #content>
            <div class="rich">
              <span class="tooltip-title">Level {{ userLevel.level }} — {{ userLevel.title }}</span>
              <div class="badges">
                <span class="cap-badge">{{ userLevel.currentXP }} XP</span>
                <span class="cap-badge">{{ achievementsCount }} Achievements</span>
              </div>
            </div>
          </template>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon="mdi-trophy"
            :icon-only="true"
            :bare="true"
            :ripple="false"
            :badge="achievementsCount > 0 ? String(achievementsCount) : ''"
            class="gamify-toggle-btn"
            aria-label="Open achievements and challenges"
            title="Achievements"
            @click="showGamifyModal = true"
          />
        </Tooltip>
      </div>

      <!-- Actions Section -->
      <div v-if="hasActions" class="header-actions">
        <slot name="actions">
          <div class="header-actions-wrapper" :class="actionsAlignClass">
            <UnifiedButton
              v-for="(action, index) in actions"
              :key="`action-${index}`"
              v-bind="action"
              :size="action.size || 'sm'"
              :variant="action.variant || 'primary'"
              :disabled="action.requiresAi && !aiConnected"
              :loading="action.loading"
              @click="handleActionClick(action, $event)"
            />
          </div>
        </slot>
      </div>

      <!-- Custom Content Slot -->
      <div v-if="$slots.default" class="header-content">
        <slot></slot>
      </div>
    </div>
  </header>
  <teleport to="body">
    <GamificationModal
      v-if="showGamifyModal"
      @close="showGamifyModal = false"
    />
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Provide a multi-word component name for lint/devtools

// If not available, we can switch to <script> with export default { name: 'AppHeader' }
defineOptions({ name: "AppHeader" });
import {computed, useSlots, defineEmits, defineProps } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import AppIcon from "@/components/ui/AppIcon.vue";
import GamificationModal from "@/components/GamificationModal.vue";
import Tooltip from "@/components/Tooltip.vue";
import GamificationService from "@/utils/gamification";

// Emits
const _emit = defineEmits(["detail-click"]);

// Props
const _props = defineProps({
  title: {
    type: String,
    required: true,,
    default: ''
  
  },
  subtitle: {
    type: String,
    default: null,,
    default: '',
    default: ''
  
  
  },
  icon: {
    type: String,
    default: null,,
    default: ''
  
  },
  variant: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "compact", "hero", "chat"].includes(value),
  },
  titleTag: {
    type: String,
    default: "h1",
    validator: (value) => ["h1", "h2", "h3", "h4", "h5", "h6"].includes(value),
  },
  actions: {
    type: Array,
    default: () => [],,
    default: () => []
  
  },
  actionsAlign: {
    type: String,
    default: "end",
    validator: (v) => ["start", "end", "center", "between"].includes(v),
  },
  showAiStatus: {
    type: Boolean,
    default: false,
  },
  showGamificationButton: {
    type: Boolean,
    default: true,
  },
  centered: {
    type: Boolean,
    default: false,
  },
  stacked: {
    type: Boolean,
    default: false,
  },
  details: {
    type: Array,
    default: () => [],
  },
  detailsWithIcons: {
    type: Array,
    default: () => [],
  },
  showBreadcrumbs: {
    type: Boolean,
    default: true,
  },
});

// Store access and composables
const store = useAppStore();
const route = useRoute();
const _theme = useUnifiedTheme();

// Local UI state
const showGamifyModal = ref(false);

// Gamification badge (achievements count)
const achievementsCount = computed(() => {
  try {
    return Array.isArray(store.user?.achievements)
      ? store.user.achievements.length
      : 0;
  } catch {
    return 0;
  }
});

// Header tooltip theme and level details
const isDark = computed(() => {
  try {
    return Boolean(theme?.isDark?.value);
  } catch {
    return false;
  }
});
const g = new GamificationService(store);
const userLevel = computed(() => {
  try {
    return g.getLevelInfo(store.user?.xp || 0);
  } catch {
    return { level: 1, title: "Rookie", currentXP: 0 };
  }
});

// Responsive detection
const isMobile = computed(() => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
});

// Computed properties
const titleId = computed(
  () => `${props.title.toLowerCase().replace(/\s+/g, "-")}-title`,
);

const slots = useSlots();
const hasActions = computed(
  () => (props.actions?.length || 0) > 0 || !!slots.actions,
);

// Enhanced AI status computation
const aiConnected = computed(() => {
  const hasApiKey = !!store?.settings?.geminiApiKey;
  const isOnline = store?.isOnline;
  const isInitialized = store?.aiStatus?.initialized || false;

  return hasApiKey && isOnline && isInitialized;
});

const getAIIcon = computed(() => {
  if (store.loading?.ai) return "mdi-loading mdi-spin";
  if (!store.isOnline) return "mdi-wifi-off";
  if (!store.settings?.geminiApiKey) return "mdi-key-outline";
  if (aiConnected.value) return "mdi-robot-excited";
  return "mdi-robot-off";
});

const getAIStatusText = computed(() => {
  if (store.loading?.ai) return "Connecting...";
  if (!store.isOnline) return "Offline";
  if (!store.settings?.geminiApiKey) return "API Key Required";
  if (aiConnected.value) return "Connected";
  return "Disconnected";
});

const getAIStatusLabel = computed(() => {
  return aiConnected.value
    ? "AI services are ready"
    : "AI services not available";
});

const getAIStatusTitle = computed(() => {
  if (aiConnected.value) return "Connected - All systems operational";
  if (!store.isOnline) return "Offline - Check your internet connection";
  if (!store.settings?.geminiApiKey)
    return "API Key Required - Add a key in settings";
  return "Disconnected - Check API key and connection";
});

// Enhanced breadcrumb generation
const showBreadcrumbs = computed(
  () => props.showBreadcrumbs !== false && route.path !== "/",
);
const breadcrumbs = computed(() => {
  if (!showBreadcrumbs.value) return [];

  const pathSegments = route.path.split("/").filter(Boolean);
  const breadcrumbItems = [];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += "/" + segment;
    const isLast = index === pathSegments.length - 1;

    // Convert kebab-case to Title Case
    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbItems.push({
      title,
      route: isLast ? null : currentPath,
    });
  });

  return breadcrumbItems;
});

const headerClasses = computed(() => [
  "unified-header",
  `header--${props.variant}`,
  "header-responsive",
  {
    "header--centered": props.centered,
    "header--with-actions": hasActions.value,
    "header--with-ai-status": props.showAiStatus,
    "header--with-breadcrumbs": showBreadcrumbs.value,
    "header--mobile": isMobile.value,
    "header--loading": store.loading?.page,
  },
  {
    [`color-scheme-${theme.colorScheme.value}`]: true,
    [`theme-mode-${theme.themeMode.value}`]: true,
    "is-dark": theme.isDark.value,
    "is-light": theme.isLight.value,
  },
]);

const titleClasses = computed(() => [
  "header-title",
  {
    "with-icon": !!props.icon,
  },
]);

const subtitleClasses = computed(() => ["header-subtitle"]);

const actionsAlignClass = computed(() => {
  switch (props.actionsAlign) {
    case "start":
      return "justify-start";
    case "center":
      return "justify-center";
    case "between":
      return "justify-between";
    default:
      return "justify-end";
  }
});

// Back-compat: support both action.onClick and action.action
function handleActionClick(action, evt) {
  try {
    const fn = action?.onClick || action?.action;
    if (typeof fn === "function") {
      fn(evt);
    }
  } catch (_e) {
    // Swallow; layout component should not throw
    console.debug("Header action handler error:", e);
  }
}

// Simplified header: removed interactive detail chips and badge animations
</script>

<style scoped>
.unified-header {
  font-family: var(--font-primary);
  margin-bottom: var(--spacing-lg);
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-backdrop-blur);
  padding: var(--spacing-lg);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: sticky;
  z-index: var(--z-navigation);
}

.header-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.header-gamify {
  display: flex;
  align-items: center;
}

.gamify-toggle-btn {
  margin-right: var(--spacing-sm);
}

.header-title-section {
  display: flex;
  flex-direction: column;
}

.header-title-wrapper {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-family: var(--font-primary, "Electrolize", monospace);
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.header-title.with-icon {
  align-items: center;
}

.header-icon {
}

@keyframes badgePulse {
  }
  }
}

.header-subtitle {
  font-family: var(--font-primary, "Electrolize", monospace);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--duration-normal) var(--easing-ease-out);
}

.header-actions {
  display: flex;
  align-items: flex-start;
  margin-left: auto;
}

.header-actions-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.header-actions-wrapper.justify-start {
  justify-content: flex-start;
}
.header-actions-wrapper.justify-end {
  justify-content: flex-end;
}
.header-actions-wrapper.justify-center {
  justify-content: center;
}
.header-actions-wrapper.justify-between {
  justify-content: space-between;
}

.header--compact {
}

.header--compact .header-title {
}

.header--compact .header-subtitle {
}

.header--hero {
}

.header--hero .header-title {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes heroGlow {
  }
  }
}

.header--hero .header-subtitle {
}

.header--centered {
  text-align: center;
}

.header--centered .header-container {
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.header--centered .header-title-section {
  align-items: center;
  text-align: center;
}

  .header-container {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    align-self: stretch;
  }

  .header-actions-wrapper {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .header--centered .header-container {
    align-items: center;
  }

  .header-title {
  }

  .header--hero .header-title {
  }

}

.header-ai-status {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-md);
}

.ai-status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-smooth) var(--easing-ease-out);
  backdrop-filter: var(--glass-backdrop-blur);
  position: relative;
  overflow: hidden;
}

.ai-status-indicator.ai-ready {
  background: linear-gradient(
  );
  color: var(--color-success);
}

.ai-status-indicator.ai-ready .ai-status-icon {
  color: var(--color-success);
}

.ai-status-indicator.ai-ready:hover {
  background: linear-gradient(
  );
}

.ai-status-indicator.ai-disconnected {
  background: linear-gradient(
  );
  color: var(--color-error);
}

.ai-status-indicator.ai-disconnected .ai-status-icon {
  color: var(--color-error);
}

.ai-status-indicator.ai-disconnected:hover {
  background: linear-gradient(
  );
}

.ai-status-icon {
  transition: all var(--transition-smooth);
}

.ai-status-text {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  white-space: nowrap;
}

.ai-status-pulse {
  position: absolute;
  border-radius: var(--border-radius-lg);
  background: radial-gradient(
    circle,
  );
  pointer-events: none;
}

@keyframes aiPulse {
  }
  }
}

[data-theme="dark"] .ai-status-indicator.ai-ready {
  background: linear-gradient(
  );
}

[data-theme="dark"] .ai-status-indicator.ai-disconnected {
  background: linear-gradient(
  );
}

[data-theme="dark"] .ai-status-pulse {
  background: radial-gradient(
    circle,
  );
}

  .header-ai-status {
    margin-right: var(--spacing-sm);
  }

  .ai-status-indicator {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }

  .ai-status-text {
  }

  .ai-status-icon {
  }
}

.ai-status-indicator:focus-visible {
}

@media (prefers-reduced-motion: reduce) {
  .ai-status-pulse {
    animation: none;
  }

  .ai-status-indicator,
  .ai-status-icon {
    transition: none;
  }
}


.header--chat {
  margin-bottom: var(--spacing-md);
}
.header--chat .header-subtitle {
}

.high-contrast .header-title {
}


:root[data-theme="light"] .unified-header,
.light-theme .unified-header {
}

:root[data-theme="light"] .header-title,
.light-theme .header-title {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root[data-theme="dark"] .unified-header,
.dark-theme .unified-header,
[data-theme="dark"] .unified-header {
}

:root[data-theme="dark"] .header-title,
.dark-theme .header-title,
[data-theme="dark"] .header-title {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root[data-theme="dark"] .header-subtitle,
.dark-theme .header-subtitle,
[data-theme="dark"] .header-subtitle {
  color: var(--text-secondary);
}

:root[data-theme="dark"] .ai-status-indicator,
.dark-theme .ai-status-indicator,
[data-theme="dark"] .ai-status-indicator {
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .unified-header {
  }

  :root:not([data-theme="light"]) .header-title {
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.unified-header:hover {
  box-shadow: var(--shadow-lg);
}

:root[data-theme="dark"] .unified-header:hover,
.dark-theme .unified-header:hover,
[data-theme="dark"] .unified-header:hover {
  box-shadow:
}

.theme-gaming .unified-header {
  border-color: var(--border-gaming);
  background: linear-gradient(
  );
}

.theme-gaming .header-title {
}

.header-breadcrumbs {
  margin-bottom: var(--spacing-md);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  gap: var(--spacing-xs);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-link:hover {
}

.breadcrumb-link.home-link {
  padding: var(--spacing-xs);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.ai-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-glow {
  position: absolute;
  transition: opacity var(--transition-normal);
}

.ai-glow.active {
}

.ai-status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.ai-model-text {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

@keyframes aiGlow {
  }
  }
}

.header--loading {
  pointer-events: none;
}

.header--loading::after {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

@keyframes loading-bar {
  }
  }
}

  .header-breadcrumbs {
    display: none;
  }

  .ai-status-indicator {
    padding: var(--spacing-sm);
  }

  .ai-status-content {
    display: none;
  }
}

@media (prefers-contrast: high) {
  .breadcrumb-link {
  }

  .breadcrumb-link:hover {
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-glow,
  .ai-status-pulse,
  .header--loading::after {
    animation: none;
  }
}

.breadcrumb-link:focus {
}

.ai-status-indicator:focus {
}
</style>
