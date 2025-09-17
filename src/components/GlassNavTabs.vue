<template>
  <nav
    ref="navRef"
    class="nav glass-nav glass-surface rounded-lg font-sans"
    :class="{ 'nav-tabs nav-fill': !gridLayout,
              'nav-grid': gridLayout,
              'is-dragging': isDragging
    }"
    role="tablist"
    :aria-label="ariaLabel"
    @keydown.left.prevent="onArrow(-1)"
    @keydown.right.prevent="onArrow(1)"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @mouseleave="onPointerUp"
    @scroll="updateArrows"
  >
    <!-- Left scroll arrow -->
    <button
      v-if="showLeft"
      class="nav-scroll-arrow left"
      type="button"
      aria-label="Scroll left"
      @click.stop="scrollBy(-1)"
    >
      <AppIcon name="ChevronLeftIcon" />
    </button>
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="nav-link neon-accent rounded-sm"
      :class="{ active: activeTab === tab.key }"
      type="button"
      role="tab"
      :aria-controls="`${tab.key}-panel`"
      :aria-selected="activeTab === tab.key"
      :tabindex="activeTab === tab.key ? 0 : -1"
      @click="$emit('update:activeTab', tab.key)"
      @keydown.enter.prevent="$emit('update:activeTab', tab.key)"
      @keydown.space.prevent="$emit('update:activeTab', tab.key)"
    >
      <template v-if="tab.icon">
        <!-- Always render via AppIcon to normalize emoji/MDI and aliases -->
        <AppIcon :name="tab.icon" :class="gridLayout ? '' : 'mr-2'" />
      </template>
      <span v-if="gridLayout">{{ tab.label }}</span>
      <template v-else>
        <span class="hidden d-sm-inline">{{ tab.label }}</span>
        <span v-if="tab.shortLabel" class="d-sm-none">{{ tab.shortLabel }}</span>
      </template>
      <span v-if="tab.count !== undefined" class="tab-count badge bg-blue-500-subtle" aria-hidden="true">{{ tab.count }}</span>
      <span v-else-if="tab.badge || tab.dirty" class="tab-dot" aria-hidden="true"></span>
    </button>

    <!-- Right scroll arrow -->
    <button
      v-if="showRight"
      class="nav-scroll-arrow right"
      type="button"
      aria-label="Scroll right"
      @click.stop="scrollBy(1)"
    >
      <AppIcon name="ChevronRightIcon" />
    </button>

    <!-- Edge fade indicators -->
    <div v-show="showLeft" class="edge-fade left" aria-hidden="true"></div>
    <div v-show="showRight" class="edge-fade right" aria-hidden="true"></div>
  </nav>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

import { onMounted, onBeforeUnmount, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(tab =>
        typeof tab.key === 'string' &&
        typeof tab.label === 'string'
      )
    }
  },
  activeTab: {
    type: String,
    required: true
  },
  ariaLabel: {
    type: String,
    default: 'Navigation tabs'
  },
  gridLayout: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:activeTab'])

// Scroll/drag state
const navRef = ref<HTMLElement | null>(null)
const showLeft = ref(false)
const showRight = ref(false)
const isDragging = ref(false)
let startX = 0
let startScrollLeft = 0

function updateArrows() {
  const el = navRef.value
  if (!el) return
  const maxScroll = el.scrollWidth - el.clientWidth
  showLeft.value = el.scrollLeft > 2
  showRight.value = el.scrollLeft < maxScroll - 2
}

function onPointerDown(e: Event) {
  // Ignore if clicking an interactive child (a button already)
  const pointerEvent = e as any
  if ((e.target as HTMLElement)?.closest('.nav-link') || (e.target as HTMLElement)?.closest('.nav-scroll-arrow')) return
  const el = navRef.value
  if (!el) return
  isDragging.value = true
  startX = pointerEvent.clientX
  startScrollLeft = el.scrollLeft
  try { el.setPointerCapture(pointerEvent.pointerId) } catch {}
}

function onPointerMove(e: Event) {
  if (!isDragging.value) return
  const el = navRef.value
  if (!el) return
  const pointerEvent = e as any
  const dx = pointerEvent.clientX - startX
  el.scrollLeft = startScrollLeft - dx
  updateArrows()
}

function onPointerUp(e?: Event) {
  if (!isDragging.value) return
  const el = navRef.value
  isDragging.value = false
  const pointerEvent = e as any
  try { if (el && e) el.releasePointerCapture(pointerEvent.pointerId) } catch {}
}

function scrollBy(dir: number) {
  const el = navRef.value
  if (!el) return
  const amount = Math.max(120, Math.round(el.clientWidth * 0.6)) * dir
  el.scrollBy({ left: amount, behavior: 'smooth' })
  // Schedule an update after scroll animation starts
  setTimeout(updateArrows, 50)
}

function onResize() { updateArrows() }

onMounted(() => {
  updateArrows()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

function isEmoji(icon) {
  // Retained for compatibility; AppIcon handles both cases now
  return false
}

function onArrow(delta) {
  try {
    const keys = (Array.isArray(props.tabs) ? props.tabs : []).map(t => t.key)
    const idx = Math.max(0, keys.indexOf(props.activeTab))
    const next = (idx + delta + keys.length) % keys.length
    const key = keys[next]
    if (key) {
      // emit update for parent
      // using dispatch through DOM is unnecessary
      // rely on direct emit via exposed API
      // @ts-ignore - runtime emit available
      emit('update:activeTab', key)
    }
  } catch {}
}
</script>

<style scoped>
.glass-nav {
  padding: var(--spacing-sm, 0.75rem);
  margin-bottom: var(--spacing-lg, 1.5rem);
  position: relative;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky, 10);
  overflow-x: auto;
  display: flex; /* Ensure horizontal layout */
  flex-direction: flex flex-wrap;
  flex-wrap: nowrap;
  gap: var(--spacing-sm, 0.5rem);
  -webkit-overflow-scrolling: touch;
}

.glass-nav.is-dragging { cursor: grabbing; }
.glass-nav.is-dragging .nav-link { pointer-events: none; }

/* Subtle top glint for sticky bar */
.glass-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary-500) 20%, transparent), transparent);
  opacity: 0.28;
  pointer-events: none;
}

.glass-nav .nav-link {
  background: transparent;
  border: none;
  color: var(--text-primary-600, #374151);
  padding: var(--spacing-sm, 0.75rem) calc(var(--spacing-lg, 1.25rem) + 20px) var(--spacing-sm, 0.75rem) var(--spacing-lg, 1.25rem);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  overflow: visible;
  cursor: pointer;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  white-space: nowrap;
  text-decoration: none;
  border: 2px solid transparent;
}

/* Guard against Bootstrap nav-fill causing wrap to new lines */
.glass-nav.nav-fill .nav-link,
.glass-nav.nav-tabs .nav-link {
  flex: 0 0 auto;
}

.glass-nav .nav-link:hover {
  transform: translateY(-1px);
}

.glass-nav .nav-link.active {
  background: linear-gradient(135deg, var(--color-primary, #6366f1), #7c3aed);
  color: var(--text-on-primary, #ffffff);
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(99, 102, 241, 0.3);
  font-weight: 700;
}

.glass-nav .nav-link.active:hover {
  transform: translateY(-1px);
}

/* Scroll arrows */
.nav-scroll-arrow {
  position: sticky; /* sticks within scrollable container */
  align-self: center;
  top: 0; /* ensure same stacking inside sticky bar */
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--glass-bg) 85%, transparent);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: var(--text-primary-600);
  flex: 0 0 auto;
  z-index: 2;
}
.nav-scroll-arrow.left { left: 0; margin-right: var(--spacing-xs); }
.nav-scroll-arrow.right { right: 0; margin-left: var(--spacing-xs); }
.nav-scroll-arrow:hover { transform: scale(1.05); }
.nav-scroll-arrow:active { transform: scale(0.98); }

/* Edge fade indicators */
.edge-fade {
  position: sticky;
  top: 0;
  width: 24px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
.edge-fade.left { left: 0; background: linear-gradient(90deg, rgba(0,0,0,0.08), transparent); }
.edge-fade.right { right: 0; background: linear-gradient(270deg, rgba(0,0,0,0.08), transparent); }

[data-theme="dark"] .edge-fade.left { background: linear-gradient(90deg, rgba(255,255,255,0.06), transparent); }
[data-theme="dark"] .edge-fade.right { background: linear-gradient(270deg, rgba(255,255,255,0.06), transparent); }

/* Grid layout styles */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-sm, 0.5rem);
  padding: var(--spacing-md, 1rem);
}

.nav-grid .nav-link {
  margin: 0;
  min-height: 60px;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xs, 0.5rem);
}

.nav-grid .nav-link .icon-md {
  margin-bottom: var(--spacing-xs, 0.25rem);
  margin-right: 0;
  font-size: 1.25rem;
}

.nav-grid .nav-link span {
  font-size: 0.75rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.tab-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-warning-500, #f59e0b);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.6);
  z-index: 1;
}

.tab-count {
  position: absolute;
  top: 4px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  background: var(--color-info-500);
  color: white;
}

/* Ensure proper spacing for nav links with badges on mobile */
@media (max-width: 640px) {
  .glass-nav .nav-link:has(.tab-dot, .tab-count) {
    padding-right: calc(var(--spacing-md, 1rem) + 24px);
  }
  
  .tab-dot {
    right: 6px;
  }
  
  .tab-count {
    right: 4px;
  }
}

/* Enhanced badge visibility on active tabs */
.glass-nav .nav-link.active .tab-dot {
  background: var(--color-success-500, #10b981);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.9);
}

.glass-nav .nav-link.active .tab-count {
  background: var(--color-primary-600, #4f46e5);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.icon-md {
  font-size: 1.125rem;
}

/* Dark theme support */

[data-theme="dark"] .glass-nav .nav-link {
  color: var(--text-primary-600, #f9fafb);
}

[data-theme="dark"] .glass-nav .nav-link.active {
  background: linear-gradient(135deg, var(--color-primary, #6366f1), #8b5cf6);
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5), 0 2px 4px rgba(99, 102, 241, 0.4);
}

/* Animation preferences */
@media (prefers-reduced-motion: reduce) {
  .glass-nav .nav-link {
    transition: none;
  }

  .glass-nav .nav-link:hover {
    transform: none;
  }
}

/* Transparency preferences */
@media (prefers-reduced-transparency: reduce) {
  .glass-nav {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--bg-secondary-500, #f4f4f5);
    border-color: var(--border-color, #e4e4e7);
  }
  [data-theme="dark"] .glass-nav {
    background: var(--bg-secondary-500);
  }
}
</style>
