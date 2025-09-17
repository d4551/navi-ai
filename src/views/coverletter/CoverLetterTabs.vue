<!--
  CANONICAL Cover Letter Tab Navigation
  Matches the design and structure of Resume Builder tabs
-->
<template>
  <nav
    ref="navRef"
    class="nav nav-tabs nav-fill glass-nav cover-letter-tabs"
    role="tablist"
    aria-label="Cover letter builder sections"
    class="font-sans"
    @scroll="updateArrows"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @mouseleave="onPointerUp"
  >
    <!-- Left scroll arrow -->
    <button
      v-if="showLeft"
      class="nav-scroll-arrow left"
      type="button"
      aria-label="Scroll left"
      @click.stop="scrollBy(-1)"
    >
      <i class="mdi mdi-chevron-left" aria-hidden="true"></i>
    </button>
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="nav-link"
      :class="{ active: activeTab === tab.id }"
      type="button"
      role="tab"
      :aria-controls="`${tab.id}-panel`"
      :aria-selected="activeTab === tab.id"
      :tabindex="activeTab === tab.id ? 0 : -1"
      @click="setActiveTab(tab.id)"
      @keydown="onTabKeydown($event, tab.id)"
    >
      <i :class="tab.icon" class="mr-2 icon-md" aria-hidden="true"></i>
      <span class="hidden d-sm-inline">{{ tab.label }}</span>
      <span class="d-sm-none">{{ tab.shortLabel }}</span>
      <span
        v-if="tab.badge"
        class="badge badge-compact ml-2"
        :class="getBadgeClass(tab.id)"
        :aria-label="`${tab.badge} items in ${tab.label}`"
      >
        {{ tab.badge }}
      </span>
    </button>

    <!-- Right scroll arrow -->
    <button
      v-if="showRight"
      class="nav-scroll-arrow right"
      type="button"
      aria-label="Scroll right"
      @click.stop="scrollBy(1)"
    >
      <i class="mdi mdi-chevron-right" aria-hidden="true"></i>
    </button>

    <!-- Edge fades -->
    <div v-show="showLeft" class="edge-fade left" aria-hidden="true"></div>
    <div v-show="showRight" class="edge-fade right" aria-hidden="true"></div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/// <reference lib="dom" />
import { onMounted, onBeforeUnmount, ref } from 'vue'

// Props
interface Tab {
  id: string
  label: string
  shortLabel: string
  icon: string
  badge?: number
}

const props = defineProps<{
  activeTab: string
  tabs: Tab[]
  completionData?: Record<string, number>
}>()

// Emits
const emit = defineEmits<{
  'update:activeTab': [tabId: string]
}>()

// Methods
const setActiveTab = (tabId: string) => {
  emit('update:activeTab', tabId)
}

const getBadgeClass = (tabId: string) => {
  const completion = props.completionData?.[tabId] || 0

  if (completion >= 100) return 'bg-success-500'
  if (completion >= 75) return 'bg-warning-500'
  if (completion >= 50) return 'bg-blue-500'
  return 'bg-secondary-500'
}

const onTabKeydown = (event: KeyboardEvent, tabId: string) => {
  const currentIndex = props.tabs.findIndex(tab => tab.id === tabId)
  let targetIndex = currentIndex

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      targetIndex = currentIndex > 0 ? currentIndex - 1 : props.tabs.length - 1
      break
    case 'ArrowRight':
      event.preventDefault()
      targetIndex = currentIndex < props.tabs.length - 1 ? currentIndex + 1 : 0
      break
    case 'Home':
      event.preventDefault()
      targetIndex = 0
      break
    case 'End':
      event.preventDefault()
      targetIndex = props.tabs.length - 1
      break
    default:
      return
  }

  if (targetIndex !== currentIndex) {
    setActiveTab(props.tabs[targetIndex].id)

    // Focus the new tab
    const targetEl = event.target as HTMLElement | null
    const container = targetEl?.closest('.nav')
    const links = container?.querySelectorAll('.nav-link')
    const newTab = links && (links[targetIndex] as HTMLElement | undefined)
    newTab?.focus()
  }
}

// Scroll arrows + drag-to-scroll
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
  const pointerE = e as any // Cast to access pointer properties
  if (
    (e.target as HTMLElement)?.closest('.nav-link') ||
    (e.target as HTMLElement)?.closest('.nav-scroll-arrow')
  )
    return
  const el = navRef.value
  if (!el) return
  isDragging.value = true
  startX = pointerE.clientX
  startScrollLeft = el.scrollLeft
  try {
    el.setPointerCapture(pointerE.pointerId)
  } catch {}
}

function onPointerMove(e: Event) {
  const pointerE = e as any // Cast to access pointer properties
  if (!isDragging.value) return
  const el = navRef.value
  if (!el) return
  const dx = pointerE.clientX - startX
  el.scrollLeft = startScrollLeft - dx
  updateArrows()
}

function onPointerUp(e?: Event) {
  const pointerE = e as any // Cast to access pointer properties
  if (!isDragging.value) return
  const el = navRef.value
  isDragging.value = false
  try {
    if (el && e) el.releasePointerCapture(pointerE.pointerId)
  } catch {}
}

function scrollBy(dir: number) {
  const el = navRef.value
  if (!el) return
  const amount = Math.max(120, Math.round(el.clientWidth * 0.6)) * dir
  el.scrollBy({ left: amount, behavior: 'smooth' })
  setTimeout(updateArrows, 50)
}

function onResize() {
  updateArrows()
}

onMounted(() => {
  updateArrows()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped lang="scss">
.cover-letter-tabs {
  border-b: 1px solid var(--glass-border);
  background: var(--glass-elevated);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  margin-bottom: 0;
  padding: 0;
  position: relative;
  overflow-x: auto;

  .nav-link {
    border: none;
    border-b: 3px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 500;
    padding: var(--spacing-md) var(--spacing-lg);
    transition: all var(--transition-smooth);
    position: relative;
    min-height: var(--minimum-target);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);

    &:hover {
      background: rgba(var(--primary-rgb), 0.05);
      color: var(--color-primary);
      border-b-color: rgba(var(--primary-rgb), 0.3);
    }

    &.active {
      background: rgba(var(--primary-rgb), 0.08);
      color: var(--color-primary);
      border-b-color: var(--color-primary);
      font-weight: 600;
    }

    &:focus-visible {
      outline: var(--focus-ring-size) solid var(--color-focus-ring);
      outline-offset: -2px;
      z-index: 1;
    }

    .badge {
      font-size: var(--font-size-xs);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius-sm);
      font-weight: 600;
    }
  }
}

// Dark theme support
[data-theme='dark'] .cover-letter-tabs {
  background: var(--glass-elevated-dark);
  border-b-color: var(--glass-border-dark);

  .nav-link {
    color: var(--text-secondary);

    &:hover {
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--color-primary);
    }

    &.active {
      background: rgba(var(--primary-rgb), 0.15);
      color: var(--color-primary);
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .cover-letter-tabs {
    .nav-link {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);

      .icon-md {
        font-size: var(--font-size-lg);
      }
    }
  }
}

// Animation for tab switching
.nav-link {
  &::before {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-primary);
    transform: scaleX(0);
    transition: transform var(--transition-smooth);
  }

  &.active::before {
    transform: scaleX(1);
  }
}

/* Scroll arrows and edge fades (match GlassNavTabs style) */
.nav-scroll-arrow {
  position: sticky;
  align-self: center;
  top: 0;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: var(--text-primary-600);
  flex: 0 0 auto;
  z-index: 2;
}
.nav-scroll-arrow.left {
  left: 0;
  margin-right: var(--spacing-xs);
}
.nav-scroll-arrow.right {
  right: 0;
  margin-left: var(--spacing-xs);
}
.nav-scroll-arrow:hover {
  transform: scale(1.05);
}
.nav-scroll-arrow:active {
  transform: scale(0.98);
}

.edge-fade {
  position: sticky;
  top: 0;
  width: 24px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
.edge-fade.left {
  left: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.08), transparent);
}
.edge-fade.right {
  right: 0;
  background: linear-gradient(270deg, rgba(0, 0, 0, 0.08), transparent);
}
[data-theme='dark'] .edge-fade.left {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.06), transparent);
}
[data-theme='dark'] .edge-fade.right {
  background: linear-gradient(270deg, rgba(255, 255, 255, 0.06), transparent);
}
</style>
