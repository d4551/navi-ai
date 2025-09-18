<template>
  <header :class="headerClasses" role="banner" :aria-labelledby="titleId">
    <!-- Glass backdrop effect with improved glassmorphic styling -->
    <div class="glass-strong header-backdrop"></div>

    <!-- Optional breadcrumbs with glassmorphic styling -->
    <nav
      v-if="showBreadcrumbs && breadcrumbs.length"
      class="header-breadcrumbs glass p-2 rounded-lg mx-4"
      aria-label="Breadcrumb"
    >
      <ol class="breadcrumb-list flex items-center gap-2">
        <li class="breadcrumb-item">
          <router-link
            to="/"
            class="breadcrumb-link home-link neon-interactive p-1 rounded"
          >
            <AppIcon name="mdi-home-outline" />
          </router-link>
        </li>
        <li
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          class="breadcrumb-item flex items-center gap-2"
        >
          <AppIcon
            name="mdi-chevron-right"
            class="breadcrumb-separator text-glass-enhanced"
          />
          <router-link
            v-if="crumb.route"
            :to="crumb.route"
            class="breadcrumb-link neon-interactive p-1 rounded text-glass-enhanced"
          >
            {{ crumb.title }}
          </router-link>
          <span
            v-else
            class="breadcrumb-current font-medium text-glass-enhanced"
            >{{ crumb.title }}</span
          >
        </li>
      </ol>
    </nav>

    <div
      class="header-container container-xl px-4 flex items-center justify-between gap-6"
    >
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
      <div v-if="showAiStatus" class="header-ai-status glass p-3 rounded-lg">
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
      <div
        v-if="showGamificationButton"
        class="header-gamify flex items-center gap-3"
      >
        <Tooltip :text="''" position="bottom" :dark="isDark">
          <template #content>
            <div class="rich">
              <span class="tooltip-title"
                >Level {{ userLevel.level }} — {{ userLevel.title }}</span
              >
              <div class="badges">
                <span class="cap-badge">{{ userLevel.currentXP }} XP</span>
                <span class="cap-badge"
                  >{{ achievementsCount }} Achievements</span
                >
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
import { ref, computed, useSlots, defineEmits, defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Provide a multi-word component name for lint/devtools
// Requires Vue 3.3+ defineOptions macro
// If not available, we can switch to <script> with export default { name: 'AppHeader' }
defineOptions({ name: 'AppHeader' })
import { useAppStore } from '@/stores/app'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import AppIcon from '@/components/ui/AppIcon.vue'
import GamificationModal from '@/components/GamificationModal.vue'
import Tooltip from '@/components/Tooltip.vue'
import GamificationService from '@/utils/gamification'

// Emits
const emit = defineEmits(['detail-click'])

// Props
const _props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'compact', 'hero', 'chat'].includes(value),
  },
  titleTag: {
    type: String,
    default: 'h1',
    validator: value => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(value),
  },
  actions: {
    type: Array,
    default: () => [],
  },
  actionsAlign: {
    type: String,
    default: 'end',
    validator: v => ['start', 'end', 'center', 'between'].includes(v),
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
})

// Store access and composables
const store = useAppStore()
const route = useRoute()
const theme = useUnifiedTheme()

// Local UI state
const showGamifyModal = ref(false)

// Gamification badge (achievements count)
const achievementsCount = computed(() => {
  try {
    return Array.isArray(store.user?.achievements)
      ? store.user.achievements.length
      : 0
  } catch {
    return 0
  }
})

// Header tooltip theme and level details
const isDark = computed(() => {
  try {
    return Boolean(theme?.isDark?.value)
  } catch {
    return false
  }
})
const g = new GamificationService(store)
const userLevel = computed(() => {
  try {
    return g.getLevelInfo(store.user?.xp || 0)
  } catch {
    return { level: 1, title: 'Rookie', currentXP: 0 }
  }
})

// Responsive detection
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

// Computed properties
const titleId = computed(
  () => `${props.title.toLowerCase().replace(/\s+/g, '-')}-title`
)

const slots = useSlots()
const hasActions = computed(
  () => (props.actions?.length || 0) > 0 || !!slots.actions
)

// Enhanced AI status computation
const aiConnected = computed(() => {
  const hasApiKey = !!store?.settings?.geminiApiKey
  const isOnline = store?.isOnline
  const isInitialized = store?.aiStatus?.initialized || false

  return hasApiKey && isOnline && isInitialized
})

const getAIIcon = computed(() => {
  if (store.loading?.ai) return 'mdi-loading mdi-spin'
  if (!store.isOnline) return 'mdi-wifi-off'
  if (!store.settings?.geminiApiKey) return 'mdi-key-outline'
  if (aiConnected.value) return 'mdi-robot-excited'
  return 'mdi-robot-off'
})

const getAIStatusText = computed(() => {
  if (store.loading?.ai) return 'Connecting...'
  if (!store.isOnline) return 'Offline'
  if (!store.settings?.geminiApiKey) return 'API Key Required'
  if (aiConnected.value) return 'Connected'
  return 'Disconnected'
})

const getAIStatusLabel = computed(() => {
  return aiConnected.value
    ? 'AI services are ready'
    : 'AI services not available'
})

const getAIStatusTitle = computed(() => {
  if (aiConnected.value) return 'Connected - All systems operational'
  if (!store.isOnline) return 'Offline - Check your internet connection'
  if (!store.settings?.geminiApiKey)
    return 'API Key Required - Add a key in settings'
  return 'Disconnected - Check API key and connection'
})

// Enhanced breadcrumb generation
const showBreadcrumbs = computed(
  () => props.showBreadcrumbs !== false && route.path !== '/'
)
const breadcrumbs = computed(() => {
  if (!showBreadcrumbs.value) return []

  const pathSegments = route.path.split('/').filter(Boolean)
  const breadcrumbItems = []

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += '/' + segment
    const isLast = index === pathSegments.length - 1

    // Convert kebab-case to Title Case
    const title = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbItems.push({
      title,
      route: isLast ? null : currentPath,
    })
  })

  return breadcrumbItems
})

const headerClasses = computed(() => [
  'unified-header',
  `header--${props.variant}`,
  'header-responsive',
  {
    'header--centered': props.centered,
    'header--with-actions': hasActions.value,
    'header--with-ai-status': props.showAiStatus,
    'header--with-breadcrumbs': showBreadcrumbs.value,
    'header--mobile': isMobile.value,
    'header--loading': store.loading?.page,
  },
  {
    [`color-scheme-${theme.colorScheme.value}`]: true,
    [`theme-mode-${theme.themeMode.value}`]: true,
    'is-dark': theme.isDark.value,
    'is-light': theme.isLight.value,
  },
])

const titleClasses = computed(() => [
  'header-title',
  {
    'with-icon': !!props.icon,
  },
])

const subtitleClasses = computed(() => ['header-subtitle'])

const actionsAlignClass = computed(() => {
  switch (props.actionsAlign) {
    case 'start':
      return 'justify-start'
    case 'center':
      return 'justify-center'
    case 'between':
      return 'justify-between'
    default:
      return 'justify-end'
  }
})

// Back-compat: support both action.onClick and action.action
function handleActionClick(action, evt) {
  try {
    const fn = action?.onClick || action?.action
    if (typeof fn === 'function') {
      fn(evt)
    }
  } catch (_e) {
    // Swallow; layout component should not throw
    console.debug('Header action handler error:', e)
  }
}

// Simplified header: removed interactive detail chips and badge animations
</script>

<style scoped>
/* Unified Header Styles - Single Source of Truth */
.unified-header {
  font-family: var(--font-primary);
  margin-bottom: var(--spacing-lg);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-backdrop-blur);
  padding: var(--spacing-lg);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: sticky;
  top: 0;
  z-index: var(--z-navigation);
}

.header-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md, 1rem);
  width: 100%;
}

.header-gamify {
  display: flex;
  align-items: center;
}

.gamify-toggle-btn {
  margin-right: var(--spacing-sm);
}

/* Title Section */
.header-title-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
}

.header-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 0.25rem);
}

.header-title {
  font-family: var(--font-primary, 'Electrolize', monospace);
  font-weight: var(--font-weight-bold, 700);
  font-size: var(--font-size-xl, 2rem);
  background: linear-gradient(
    135deg,
    var(--color-primary-500),
    var(--color-gaming-500),
    var(--color-cyber-500)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
  letter-spacing: 0.02em;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.header-title.with-icon {
  align-items: center;
}

.header-icon {
  font-size: 1.2em;
  color: var(--color-primary, #667eea);
  flex-shrink: 0;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.07);
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.25);
  }
}

.header-subtitle {
  font-family: var(--font-primary, 'Electrolize', monospace);
  font-size: var(--font-size-md, 1rem);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--duration-normal) var(--easing-ease-out);
}

/* Actions Section */
.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm, 0.5rem);
  margin-left: auto;
}

.header-actions-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 0.5rem);
  justify-content: flex-end;
}
/* Alignment helpers (controlled by actionsAlign prop) */
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

/* Variant Styles */
.header--compact {
  margin-bottom: var(--spacing-md, 1rem);
}

.header--compact .header-title {
  font-size: var(--font-size-lg, 1.5rem);
}

.header--compact .header-subtitle {
  font-size: var(--font-size-sm, 0.875rem);
}

.header--hero {
  margin-bottom: var(--spacing-xl, 2rem);
  padding: var(--spacing-lg, 1.5rem) 0;
}

.header--hero .header-title {
  font-size: var(--font-size-xxl, 2.5rem);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
  animation: heroGlow 3s ease-in-out infinite alternate;
}

@keyframes heroGlow {
  0% {
    filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
  }
}

.header--hero .header-subtitle {
  font-size: var(--font-size-lg, 1.25rem);
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md, 1rem);
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
    font-size: var(--font-size-lg, 1.5rem);
  }

  .header--hero .header-title {
    font-size: var(--font-size-xl, 2rem);
  }

  /* Simplified: removed stacked layout and detail controls */
}

/* AI Status Indicator Styles */
.header-ai-status {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
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
  border: 1px solid transparent;
  backdrop-filter: var(--glass-backdrop-blur);
  position: relative;
  overflow: hidden;
}

/* AI Ready State */
.ai-status-indicator.ai-ready {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.1),
    rgba(16, 185, 129, 0.15)
  );
  border-color: rgba(34, 197, 94, 0.3);
  color: var(--color-success);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}

.ai-status-indicator.ai-ready .ai-status-icon {
  color: var(--color-success);
  filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
}

.ai-status-indicator.ai-ready:hover {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.15),
    rgba(16, 185, 129, 0.2)
  );
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}

/* AI Disconnected State */
.ai-status-indicator.ai-disconnected {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1),
    rgba(220, 38, 38, 0.15)
  );
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--color-error);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}

.ai-status-indicator.ai-disconnected .ai-status-icon {
  color: var(--color-error);
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
}

.ai-status-indicator.ai-disconnected:hover {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.15),
    rgba(220, 38, 38, 0.2)
  );
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

/* AI Status Icon */
.ai-status-icon {
  font-size: 1.1em;
  transition: all var(--transition-smooth);
  flex-shrink: 0;
}

/* AI Status Text */
.ai-status-text {
  font-weight: 600;
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* AI Status Pulse Animation (only for ready state) */
.ai-status-pulse {
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius-lg);
  background: radial-gradient(
    circle,
    rgba(34, 197, 94, 0.1) 0%,
    transparent 70%
  );
  animation: aiPulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes aiPulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* Dark Theme Support for AI Status */
[data-theme='dark'] .ai-status-indicator.ai-ready {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.15),
    rgba(16, 185, 129, 0.2)
  );
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

[data-theme='dark'] .ai-status-indicator.ai-disconnected {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.15),
    rgba(220, 38, 38, 0.2)
  );
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

[data-theme='dark'] .ai-status-pulse {
  background: radial-gradient(
    circle,
    rgba(34, 197, 94, 0.15) 0%,
    transparent 70%
  );
}

/* Responsive AI Status */
@media (max-width: 768px) {
  .header-ai-status {
    margin-right: var(--spacing-sm);
  }

  .ai-status-indicator {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }

  .ai-status-text {
    display: none; /* Hide text on mobile, show only icon */
  }

  .ai-status-icon {
    font-size: 1.2em;
  }
}

/* Focus states for accessibility */
.ai-status-indicator:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ai-status-pulse {
    animation: none;
  }

  .ai-status-indicator,
  .ai-status-icon {
    transition: none;
  }
}

/* Dark Theme Support - Unified Variables */

/* Chat variant tweaks */
.header--chat {
  margin-bottom: var(--spacing-md);
}
.header--chat .header-subtitle {
  font-size: 0.9rem;
  line-clamp: 1;
  -webkit-line-clamp: 1;
}

/* High Contrast Support */
.high-contrast .header-title {
  font-weight: var(--font-weight-bold, 700);
  border-bottom: 2px solid currentColor;
  padding-bottom: var(--spacing-xs, 0.25rem);
}

/* Reduced Motion Support */

/* === ENHANCED THEME SUPPORT === */
/* Light Theme Specific Styles */
:root[data-theme='light'] .unified-header,
.light-theme .unified-header {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:root[data-theme='light'] .header-title,
.light-theme .header-title {
  background: linear-gradient(135deg, #4f46e5, #00ff88, #00d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Dark Theme Specific Styles */
:root[data-theme='dark'] .unified-header,
.dark-theme .unified-header,
[data-theme='dark'] .unified-header {
  background: rgba(15, 15, 15, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
}

:root[data-theme='dark'] .header-title,
.dark-theme .header-title,
[data-theme='dark'] .header-title {
  background: linear-gradient(135deg, #6366f1, #00ff88, #00d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: brightness(1.1);
}

:root[data-theme='dark'] .header-subtitle,
.dark-theme .header-subtitle,
[data-theme='dark'] .header-subtitle {
  color: var(--text-secondary);
  opacity: 0.9;
}

:root[data-theme='dark'] .ai-status-indicator,
.dark-theme .ai-status-indicator,
[data-theme='dark'] .ai-status-indicator {
  background: rgba(15, 15, 15, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}

/* System Theme Support */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .unified-header {
    background: rgba(15, 15, 15, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  :root:not([data-theme='light']) .header-title {
    background: linear-gradient(135deg, #6366f1, #00ff88, #00d9ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: brightness(1.1);
  }
}

/* Enhanced hover states for both themes */
.unified-header:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

:root[data-theme='dark'] .unified-header:hover,
.dark-theme .unified-header:hover,
[data-theme='dark'] .unified-header:hover {
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(99, 102, 241, 0.1);
}

/* Gaming theme enhancements */
.theme-gaming .unified-header {
  border-color: var(--border-gaming);
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.05),
    rgba(0, 217, 255, 0.03)
  );
}

.theme-gaming .header-title {
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

/* Enhanced breadcrumb styles */
.header-breadcrumbs {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-subtle);
  opacity: 0.8;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
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
  color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.breadcrumb-link.home-link {
  padding: var(--spacing-xs);
}

.breadcrumb-separator {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.breadcrumb-current {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* Enhanced AI status with better icons and animations */
.ai-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.ai-glow {
  position: absolute;
  inset: -2px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent);
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.ai-glow.active {
  opacity: 1;
  animation: aiGlow 2s ease-in-out infinite;
}

.ai-status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.ai-model-text {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 400;
  opacity: 0.8;
  line-height: 1;
}

@keyframes aiGlow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Enhanced loading states */
.header--loading {
  pointer-events: none;
  opacity: 0.7;
}

.header--loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary-500),
    var(--color-secondary-500),
    var(--color-primary-500)
  );
  background-size: 200% 100%;
  animation: loading-bar 2s linear infinite;
}

@keyframes loading-bar {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Enhanced mobile responsiveness */
@media (max-width: 480px) {
  .header-breadcrumbs {
    display: none;
  }

  .ai-status-indicator {
    min-width: 44px;
    padding: var(--spacing-sm);
    border-radius: 50%;
  }

  .ai-status-content {
    display: none;
  }
}

/* High contrast and accessibility improvements */
@media (prefers-contrast: high) {
  .breadcrumb-link {
    border: 1px solid transparent;
  }

  .breadcrumb-link:hover {
    border-color: var(--color-primary-500);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-glow,
  .ai-status-pulse,
  .header--loading::after {
    animation: none;
  }
}

/* Focus improvements for better accessibility */
.breadcrumb-link:focus {
  outline: 2px solid var(--color-primary-400);
  outline-offset: 2px;
}

.ai-status-indicator:focus {
  outline: 2px solid var(--color-primary-400);
  outline-offset: 2px;
}
</style>
