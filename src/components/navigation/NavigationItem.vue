<template>
  <div
    class="navigation-item text-glass-secondary font-sans"
    :class="{
      active: item.isActive?.value,
      collapsed: isCollapsed,
      'has-badge': item.badge,
      'nav-item-focused': isFocused,
      'nav-item-pressed': isPressed,
      'nav-item-disabled': item.disabled,
      'requires-ai': item.requiresAI,
    }"
  >
    <router-link
      :to="item.route"
      class="nav-item-link glass-interactive neon-blue focus:ring-neon"
      :aria-label="item.description"
      :aria-disabled="item.disabled || undefined"
      :aria-current="item.isActive?.value ? 'page' : undefined"
      :title="isCollapsed ? item.title : undefined"
      :tabindex="item.disabled ? -1 : 0"
      @click="handleClick"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter.prevent="handleEnterKey"
      @keydown.space.prevent="handleSpaceKey"
    >
      <div class="nav-item-icon">
        <div class="nav-icon-glass" aria-hidden="true"></div>
        <AppIcon
          :name="normalizeIcon(item.icon)"
          class="nav-icon"
          size="inherit"
        />
      </div>

      <div v-if="!isCollapsed" class="nav-item-content">
        <span class="nav-item-title">{{ item.title }}</span>
        <span v-if="item.description" class="nav-item-description">{{
          item.description
        }}</span>
      </div>

      <div v-if="item.badge && !isCollapsed" class="nav-item-badge">
        <span class="badge badge-compact stats-chip">{{ item.badge }}</span>
      </div>

      <!-- Collapsed tooltip indicator -->
      <div v-if="isCollapsed && item.badge" class="nav-item-indicator">
        <div class="indicator-dot"></div>
      </div>
    </router-link>

    <!-- Hover tooltip for collapsed state -->
    <Teleport to="body">
      <div
        v-if="showTooltip && isCollapsed"
        ref="tooltipRef"
        class="nav-tooltip bg-glass-bg dark:bg-glass-bg dark:bg-glass-bg-hover text-glass-primary dark:text-glass-primary dark:text-glass-primary"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div class="tooltip-title">{{ item.title }}</div>
          <div v-if="item.description" class="tooltip-description">
            {{ item.description }}
          </div>
          <div v-if="item.badge" class="tooltip-badge">
            <span class="badge badge-compact stats-chip">{{ item.badge }}</span>
          </div>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { getMdiAlias } from '@/utils/iconAliases'
import AppIcon from '@/components/ui/AppIcon.vue'

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['navigate', 'focus', 'blur'])

// Enhanced interaction state
const showTooltip = ref(false)
const tooltipRef = ref(null)
const tooltipStyle = ref({})
const isFocused = ref(false)
const isPressed = ref(false)

let hoverTimeout = null
let pressTimeout = null

// Enhanced interaction handlers
function handleClick(event) {
  if (props.item.disabled) {
    event.preventDefault()
    return
  }

  // Add click animation
  isPressed.value = true
  clearTimeout(pressTimeout)
  pressTimeout = setTimeout(() => {
    isPressed.value = false
  }, 150)

  // Don't prevent default - let router-link handle navigation
  emit('navigate', props.item)
}

function handleEnterKey(event) {
  if (props.item.disabled) return
  handleClick(event)
}

function handleSpaceKey(event) {
  if (props.item.disabled) return
  handleClick(event)
}

function onFocus(event) {
  isFocused.value = true
  emit('focus', props.item)

  // Show tooltip on focus for collapsed navigation
  if (props.isCollapsed) {
    showTooltip.value = true
    nextTick(() => {
      updateTooltipPosition(event.currentTarget)
    })
  }
}

function onBlur() {
  isFocused.value = false
  showTooltip.value = false
  emit('blur', props.item)
}

// Show tooltip on hover (collapsed only)
function onMouseEnter(event) {
  if (!props.isCollapsed || isFocused.value) return

  clearTimeout(hoverTimeout)
  hoverTimeout = setTimeout(async () => {
    showTooltip.value = true
    await nextTick()
    updateTooltipPosition(event.currentTarget)
  }, 150) // Reduced delay for better UX
}

// Hide tooltip on mouse leave
function onMouseLeave() {
  if (isFocused.value) return // Keep tooltip visible when focused
  clearTimeout(hoverTimeout)
  showTooltip.value = false
}

// Update tooltip position
function updateTooltipPosition(element) {
  if (!tooltipRef.value) return

  const rect = element.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()

  // Position to the right of the sidebar with proper spacing
  const left = rect.right + 12
  const top = rect.top + rect.height / 2 - tooltipRect.height / 2

  // Ensure tooltip stays within viewport bounds
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const tooltipHeight = tooltipRect.height
  const tooltipWidth = tooltipRect.width

  // Adjust vertical position to stay within viewport
  const maxTop = viewportHeight - tooltipHeight - 16
  const minTop = 16
  const adjustedTop = Math.max(minTop, Math.min(top, maxTop))

  // Adjust horizontal position if tooltip would go off-screen
  let adjustedLeft = left
  if (left + tooltipWidth > viewportWidth - 16) {
    adjustedLeft = rect.left - tooltipWidth - 12
  }

  tooltipStyle.value = {
    left: `${adjustedLeft}px`,
    top: `${adjustedTop}px`,
    zIndex: '1000',
  }
}

// Normalize dynamic icon names via alias map
function normalizeIcon(name) {
  const n = typeof name === 'string' ? name : ''
  const resolved = getMdiAlias(n)
  return resolved || n
}
</script>

<style scoped>
.navigation-item {
  position: relative;
  margin-bottom: var(--spacing-xs);
}

.nav-item-link {
  display: grid;
  grid-template-columns: var(--nav-icon-size, 24px) 1fr auto;
  align-items: center;
  column-gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary-600);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
  font-family: var(--font-primary);
  min-height: 48px;
}

.nav-item-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  /* Neon accent rail */
  background: var(--color-primary-500);
  border-radius: var(--radius-md);
  transition: width var(--duration-fast) var(--easing-ease-out);
  z-index: 0;
}

.nav-item-link:hover {
  color: var(--text-primary-600);
  background: var(--surface-elevated);
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
}

.nav-item-link:hover::before {
  width: 3px;
}

.nav-item-link:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--focus-ring-width)
      color-mix(in srgb, var(--neon-focus-ring) 70%, transparent),
    0 0 18px color-mix(in srgb, var(--neon-focus-ring) 35%, transparent);
}

.navigation-item.active .nav-item-link {
  color: var(--color-primary-500);
  /* Glassmorphic active background with subtle tint */
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  -webkit-backdrop-filter: var(--glass-backdrop-blur)
    var(--glass-backdrop-saturate);
  box-shadow: 0 8px 24px
    color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.navigation-item.active .nav-item-link::before {
  width: 3px;
}

/* Icon */
.nav-item-icon {
  position: relative;
  width: var(--nav-icon-size, 24px);
  height: var(--nav-icon-size, 24px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
  justify-self: start;
}

.nav-icon {
  font-size: var(--nav-icon-font, 18px);
  transition: all var(--duration-normal) var(--easing-ease-out);
  z-index: 2;
}

.nav-icon-glass {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255, 255, 255), 0.5);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: scale(0.9);
  transition: all var(--duration-normal) var(--easing-ease-out);
  z-index: 1;
}

.navigation-item.active .nav-icon-glass,
.nav-item-link:hover .nav-icon-glass {
  opacity: 1;
  transform: scale(1);
}

.navigation-item.active .nav-icon {
  color: var(--color-primary-500);
}

/* Content */
.nav-item-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  min-width: 0; /* prevent grid overflow in comfortable density */
  gap: var(--spacing-xs);
  z-index: 1;
  opacity: 1;
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.collapsed .nav-item-content {
  opacity: 0;
  pointer-events: none;
}

.nav-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-item-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.2;
  opacity: 0.8;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

/* Badge */
.nav-item-badge {
  display: inline-flex;
  align-items: center;
  z-index: 1;
  opacity: 1;
  transition: opacity var(--transition-normal);
  justify-self: end;
}

.collapsed .nav-item-badge {
  opacity: 0;
  pointer-events: none;
}

.nav-item-badge .badge {
  white-space: nowrap;
}

/* Local badge-text removed; using unified .badge */

/* Collapsed indicator */
.nav-item-indicator {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 2;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary-500);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Collapsed state adjustments */
.navigation-item.collapsed .nav-item-link {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

.navigation-item.collapsed .nav-item-icon {
  margin: 0;
}

/* Tooltip */
.nav-tooltip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  animation: tooltipIn 0.3s ease-out forwards;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: translateX(-12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.tooltip-content {
  background: var(--glass-surface, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: var(--border-radius-lg, 12px);
  padding: var(--spacing-md, 16px);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 var(--glass-border);
  min-width: 200px;
  max-width: 300px;
  position: relative;
  overflow: hidden;
}

.tooltip-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 99, 102, 241), 0.02),
    transparent 50%,
    rgba(var(--color-secondary-rgb, 147, 51, 234), 0.01)
  );
  pointer-events: none;
}

.tooltip-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-xs);
}

.tooltip-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--spacing-xs);
}

.tooltip-badge {
  display: inline-block;
}

.tooltip-arrow {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 6px 6px 0;
  border-color: transparent var(--border-color) transparent transparent;
}

.tooltip-arrow::after {
  content: '';
  position: absolute;
  left: 1px;
  top: -6px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 6px 6px 0;
  border-color: transparent var(--glass-surface) transparent transparent;
}

/* Hover events */
.nav-item-link {
  cursor: pointer;
}

.navigation-item.collapsed .nav-item-link:hover {
  transform: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* === ENHANCED THEME SUPPORT === */
/* Dark Theme Styles */
[data-theme='dark'] .nav-item-link,
.dark-theme .nav-item-link {
  color: var(--text-secondary);
  background: transparent;
}

[data-theme='dark'] .nav-item-link:hover,
.dark-theme .nav-item-link:hover {
  background: var(--glass-bg);
  color: var(--text-primary-600);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-theme='dark'] .navigation-item.active .nav-item-link,
.dark-theme .navigation-item.active .nav-item-link {
  /* Preserve glassmorphism in dark mode */
  background: var(--glass-bg);
  border: 1px solid
    color-mix(in srgb, var(--color-primary-400) 18%, var(--glass-border));
  color: var(--color-primary-400);
  box-shadow: 0 10px 28px
    color-mix(in srgb, var(--color-primary-400) 16%, transparent);
}

[data-theme='dark'] .nav-item-link::before,
.dark-theme .nav-item-link::before {
  background: var(--color-primary-400);
}

[data-theme='dark'] .nav-icon-glass,
.dark-theme .nav-icon-glass {
  border-color: var(--glass-border);
  background: rgba(20, 20, 20, 0.5);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .navigation-item.active .nav-icon,
.dark-theme .navigation-item.active .nav-icon {
  color: var(--color-primary-400);
}

[data-theme='dark'] .badge-text,
.dark-theme .badge-text {
  background: var(--color-primary-500);
  color: var(--text-inverse);
}

[data-theme='dark'] .indicator-dot,
.dark-theme .indicator-dot {
  background: var(--color-primary-400);
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
}

/* Dark theme tooltip */
[data-theme='dark'] .tooltip-content,
.dark-theme .tooltip-content {
  background: rgba(15, 15, 15, 0.95);
  border-color: var(--glass-border);
  backdrop-filter: blur(20px) saturate(180%);
}

[data-theme='dark'] .tooltip-arrow,
.dark-theme .tooltip-arrow {
  border-color: transparent var(--glass-border) transparent transparent;
}

[data-theme='dark'] .tooltip-arrow::after,
.dark-theme .tooltip-arrow::after {
  border-color: transparent rgba(15, 15, 15, 0.95) transparent transparent;
}

/* System theme preference support */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .nav-item-link:hover {
    background: var(--glass-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  :root:not([data-theme='light']) .navigation-item.active .nav-item-link {
    background: var(--glass-bg);
    border: 1px solid
      color-mix(in srgb, var(--color-primary-500) 16%, var(--glass-border));
    color: var(--color-primary-500);
    box-shadow: 0 10px 28px
      color-mix(in srgb, var(--color-primary-500) 14%, transparent);
  }

  :root:not([data-theme='light']) .tooltip-content {
    background: rgba(15, 15, 15, 0.95);
    border-color: var(--glass-border);
  }
}

/* Enhanced active states — glassmorphic sheen */
.navigation-item.active .nav-item-link {
  position: relative;
  overflow: hidden;
}

.navigation-item.active .nav-item-link[href*='/demo/realtime']::after {
  content: '';
  position: absolute;
  inset: -20%;
  background: linear-gradient(
    120deg,
    transparent 20%,
    color-mix(in srgb, white 20%, transparent) 40%,
    color-mix(in srgb, var(--color-primary-500) 12%, transparent) 50%,
    color-mix(in srgb, white 18%, transparent) 60%,
    transparent 80%
  );
  filter: blur(6px) saturate(140%);
  transform: translateX(-120%);
  animation: glassShine 3.6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glassShine {
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  50% {
    transform: translateX(0%);
    opacity: 0.9;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* Icon glass — subtle aurora when active */
.navigation-item.active .nav-icon-glass {
  background: rgba(var(--surface-glass-rgb, 255, 255, 255), 0.55);
  border-color: color-mix(
    in srgb,
    var(--color-primary-500) 20%,
    var(--glass-border)
  );
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.navigation-item.active
  .nav-item-link[href*='/demo/realtime']
  .nav-icon-glass::after {
  content: '';
  position: absolute;
  inset: -30%;
  background: radial-gradient(
    60% 60% at 30% 30%,
    color-mix(in srgb, var(--color-primary-500) 20%, transparent),
    transparent 70%
  );
  opacity: 0.35;
  filter: blur(8px) saturate(160%);
  animation: glassAurora 5.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glassAurora {
  0% {
    transform: translate(-6%, -6%) scale(1);
    opacity: 0.25;
  }
  50% {
    transform: translate(6%, 6%) scale(1.05);
    opacity: 0.45;
  }
  100% {
    transform: translate(-6%, -6%) scale(1);
    opacity: 0.25;
  }
}

/* Respect user motion preference */
@media (prefers-reduced-motion: reduce) {
  .navigation-item.active .nav-item-link::after {
    animation: none;
    opacity: 0;
  }
  .navigation-item.active .nav-icon-glass::after {
    animation: none;
    opacity: 0;
  }
}

/* Gaming theme enhancements */
.theme-gaming .nav-item-link:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.05),
    rgba(0, 217, 255, 0.03)
  );
  border: 1px solid rgba(0, 255, 136, 0.1);
}

.theme-gaming .navigation-item.active .nav-item-link {
  background:
    linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 217, 255, 0.05)),
    var(--glass-bg);
  border: 1px solid rgba(0, 255, 136, 0.28);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  -webkit-backdrop-filter: var(--glass-backdrop-blur)
    var(--glass-backdrop-saturate);
}

.theme-gaming .nav-item-link::before {
  background: linear-gradient(
    180deg,
    var(--color-gaming-500),
    var(--color-cyber-500)
  );
}

/* ===== ENHANCED INTERACTION STATES ===== */
/* Enhanced focus states */
.navigation-item.nav-item-focused .nav-item-link {
  outline: 2px solid var(--color-primary-400);
  outline-offset: 2px;
  border-radius: var(--border-radius-md);
}

/* Press animation */
.navigation-item.nav-item-pressed .nav-item-link {
  transform: translateX(2px) scale(0.98);
  transition: transform var(--transition-fast);
}

/* Disabled state */
.navigation-item.nav-item-disabled .nav-item-link {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* AI requirement indicator removed for cleaner layout */

/* Respect user motion preference */
@media (prefers-reduced-motion: reduce) {
  .navigation-item.nav-item-pressed .nav-item-link {
    transition: none;
  }
}

/* Enhanced focus styles for keyboard navigation */
.navigation-item.nav-item-focused .nav-icon {
  color: var(--color-primary-500);
  transform: scale(1.1);
}

.navigation-item.nav-item-focused .nav-icon-glass {
  opacity: 0.2;
  transform: scale(1.1);
}

/* Loading state for items that require AI */
.navigation-item.requires-ai.loading .nav-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
