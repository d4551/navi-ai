<template>
  <div
    class="navigation-item"
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
      class="nav-item-link"
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
        class="nav-tooltip"
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
import { ref, nextTick } from "vue";
import { getMdiAlias } from "@/utils/iconAliases";
import AppIcon from "@/components/ui/AppIcon.vue";

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
});

// Emits
const emit = defineEmits(["navigate", "focus", "blur"]);

// Enhanced interaction state
const showTooltip = ref(false);
const tooltipRef = ref(null);
const tooltipStyle = ref({});
const isFocused = ref(false);
const isPressed = ref(false);

let hoverTimeout = null;
let pressTimeout = null;

// Enhanced interaction handlers
function handleClick(event) {
  if (props.item.disabled) {
    event.preventDefault();
    return;
  }

  // Add click animation
  isPressed.value = true;
  clearTimeout(pressTimeout);
  pressTimeout = setTimeout(() => {
    isPressed.value = false;
  }, 150);

  // Don't prevent default - let router-link handle navigation
  emit("navigate", props.item);
}

function handleEnterKey(event) {
  if (props.item.disabled) return;
  handleClick(event);
}

function handleSpaceKey(event) {
  if (props.item.disabled) return;
  handleClick(event);
}

function onFocus(event) {
  isFocused.value = true;
  emit("focus", props.item);

  // Show tooltip on focus for collapsed navigation
  if (props.isCollapsed) {
    showTooltip.value = true;
    nextTick(() => {
      updateTooltipPosition(event.currentTarget);
    });
  }
}

function onBlur() {
  isFocused.value = false;
  showTooltip.value = false;
  emit("blur", props.item);
}

// Show tooltip on hover (collapsed only)
function onMouseEnter(event) {
  if (!props.isCollapsed || isFocused.value) return;

  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(async () => {
    showTooltip.value = true;
    await nextTick();
    updateTooltipPosition(event.currentTarget);
  }, 150); // Reduced delay for better UX
}

// Hide tooltip on mouse leave
function onMouseLeave() {
  if (isFocused.value) return; // Keep tooltip visible when focused
  clearTimeout(hoverTimeout);
  showTooltip.value = false;
}

// Update tooltip position
function updateTooltipPosition(element) {
  if (!tooltipRef.value) return;

  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();

  // Position to the right of the sidebar with proper spacing
  const left = rect.right + 12;
  const top = rect.top + rect.height / 2 - tooltipRect.height / 2;

  // Ensure tooltip stays within viewport bounds
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const tooltipHeight = tooltipRect.height;
  const tooltipWidth = tooltipRect.width;

  // Adjust vertical position to stay within viewport
  const maxTop = viewportHeight - tooltipHeight - 16;
  const minTop = 16;
  const adjustedTop = Math.max(minTop, Math.min(top, maxTop));

  // Adjust horizontal position if tooltip would go off-screen
  let adjustedLeft = left;
  if (left + tooltipWidth > viewportWidth - 16) {
    adjustedLeft = rect.left - tooltipWidth - 12;
  }

  tooltipStyle.value = {
    left: `${adjustedLeft}px`,
    top: `${adjustedTop}px`,
    zIndex: "1000",
  };
}

// Normalize dynamic icon names via alias map
function normalizeIcon(name) {
  const n = typeof name === "string" ? name : "";
  const resolved = getMdiAlias(n);
  return resolved || n;
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
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
  font-family: var(--font-primary);
  min-height: 48px;
}

.nav-item-link::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  border-radius: var(--radius-md);
  transition: width var(--duration-fast) var(--easing-ease-out);
}

.nav-item-link:hover {
  color: var(--text-primary);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-sm);
}

.nav-item-link:hover::before {
}

.nav-item-link:focus-visible {
  outline: none;
  box-shadow:
}

.navigation-item.active .nav-item-link {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  -webkit-backdrop-filter: var(--glass-backdrop-blur)
    var(--glass-backdrop-saturate);
}

.navigation-item.active .nav-item-link::before {
}

.nav-item-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
}

.nav-icon {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.nav-icon-glass {
  position: absolute;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.navigation-item.active .nav-icon-glass,
.nav-item-link:hover .nav-icon-glass {
}

.navigation-item.active .nav-icon {
}

.nav-item-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: var(--spacing-xs);
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.collapsed .nav-item-content {
  pointer-events: none;
}

.nav-item-title {
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-item-description {
  color: var(--text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item-badge {
  display: inline-flex;
  align-items: center;
  transition: opacity var(--transition-normal);
  justify-self: end;
}

.collapsed .nav-item-badge {
  pointer-events: none;
}

.nav-item-badge .badge {
  white-space: nowrap;
}


.nav-item-indicator {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
}

.indicator-dot {
}

.navigation-item.collapsed .nav-item-link {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

.navigation-item.collapsed .nav-item-icon {
}

.nav-tooltip {
  position: fixed;
  pointer-events: none;
}

@keyframes tooltipIn {
  from {
  }
  to {
  }
}

.tooltip-content {
  box-shadow:
  position: relative;
  overflow: hidden;
}

.tooltip-content::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  pointer-events: none;
}

.tooltip-title {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.tooltip-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.tooltip-badge {
  display: inline-block;
}

.tooltip-arrow {
  position: absolute;
  border-style: solid;
  border-color: transparent var(--border-color) transparent transparent;
}

.tooltip-arrow::after {
  content: "";
  position: absolute;
  border-style: solid;
  border-color: transparent var(--glass-surface) transparent transparent;
}

.nav-item-link {
  cursor: pointer;
}

.navigation-item.collapsed .nav-item-link:hover {
  transform: none;
}

@keyframes pulse {
  }
  }
}

[data-theme="dark"] .nav-item-link,
.dark-theme .nav-item-link {
  color: var(--text-secondary);
  background: transparent;
}

[data-theme="dark"] .nav-item-link:hover,
.dark-theme .nav-item-link:hover {
  color: var(--text-primary);
}

[data-theme="dark"] .navigation-item.active .nav-item-link,
.dark-theme .navigation-item.active .nav-item-link {
  background: var(--glass-bg);
}

[data-theme="dark"] .nav-item-link::before,
.dark-theme .nav-item-link::before {
}

[data-theme="dark"] .nav-icon-glass,
.dark-theme .nav-icon-glass {
  border-color: var(--glass-border);
}

[data-theme="dark"] .navigation-item.active .nav-icon,
.dark-theme .navigation-item.active .nav-icon {
}

[data-theme="dark"] .badge-text,
.dark-theme .badge-text {
  color: white;
}

[data-theme="dark"] .indicator-dot,
.dark-theme .indicator-dot {
}

[data-theme="dark"] .tooltip-content,
.dark-theme .tooltip-content {
}

[data-theme="dark"] .tooltip-arrow,
.dark-theme .tooltip-arrow {
}

[data-theme="dark"] .tooltip-arrow::after,
.dark-theme .tooltip-arrow::after {
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .nav-item-link:hover {
  }

  :root:not([data-theme="light"]) .navigation-item.active .nav-item-link {
    background: var(--glass-bg);
  }

  :root:not([data-theme="light"]) .tooltip-content {
  }
}

.navigation-item.active .nav-item-link {
  position: relative;
  overflow: hidden;
}

  content: "";
  position: absolute;
  background: linear-gradient(
  );
  pointer-events: none;
}

@keyframes glassShine {
  }
  }
  }
  }
  }
}

.navigation-item.active .nav-icon-glass {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
  box-shadow:
}

.navigation-item.active
  .nav-icon-glass::after {
  content: "";
  position: absolute;
  background: radial-gradient(
  );
  pointer-events: none;
}

@keyframes glassAurora {
  }
  }
  }
}

@media (prefers-reduced-motion: reduce) {
  .navigation-item.active .nav-item-link::after {
    animation: none;
  }
  .navigation-item.active .nav-icon-glass::after {
    animation: none;
  }
}

.theme-gaming .nav-item-link:hover {
  background: linear-gradient(
  );
}

.theme-gaming .navigation-item.active .nav-item-link {
  background:
    var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  -webkit-backdrop-filter: var(--glass-backdrop-blur)
    var(--glass-backdrop-saturate);
}

.theme-gaming .nav-item-link::before {
  background: linear-gradient(
  );
}

.navigation-item.nav-item-focused .nav-item-link {
  border-radius: var(--border-radius-md);
}

.navigation-item.nav-item-pressed .nav-item-link {
  transition: transform var(--transition-fast);
}

.navigation-item.nav-item-disabled .nav-item-link {
  cursor: not-allowed;
  pointer-events: none;
}


@media (prefers-reduced-motion: reduce) {
  .navigation-item.nav-item-pressed .nav-item-link {
    transition: none;
  }
}

.navigation-item.nav-item-focused .nav-icon {
}

.navigation-item.nav-item-focused .nav-icon-glass {
}

.navigation-item.requires-ai.loading .nav-icon {
}

@keyframes spin {
  from {
  }
  to {
  }
}
</style>
