<template>
  <nav
    ref="navRef"
    class="nav glass-nav glass-surface rounded-lg"
    :class="{
      'nav-tabs nav-fill': !gridLayout,
      'nav-grid': gridLayout,
      'is-dragging': isDragging,
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
      <AppIcon name="mdi-chevron-left" />
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
        <AppIcon :name="tab.icon" :class="gridLayout ? '' : 'me-2'" />
      </template>
      <span v-if="gridLayout">{{ tab.label }}</span>
      <template v-else>
        <span class="d-none d-sm-inline">{{ tab.label }}</span>
        <span v-if="tab.shortLabel" class="d-sm-none">{{
          tab.shortLabel
        }}</span>
      </template>
      <span
        v-if="tab.count !== undefined"
        class="tab-count badge bg-info-subtle"
        aria-hidden="true"
      >{{ tab.count }}</span>
      <span
        v-else-if="tab.badge || tab.dirty"
        class="tab-dot"
        aria-hidden="true"
      ></span>
    </button>

    <!-- Right scroll arrow -->
    <button
      v-if="showRight"
      class="nav-scroll-arrow right"
      type="button"
      aria-label="Scroll right"
      @click.stop="scrollBy(1)"
    >
      <AppIcon name="mdi-chevron-right" />
    </button>

    <!-- Edge fade indicators -->
    <div v-show="showLeft" class="edge-fade left" aria-hidden="true"></div>
    <div v-show="showRight" class="edge-fade right" aria-hidden="true"></div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import {onBeforeUnmount, ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
const _props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(
        (tab) => typeof tab.key === "string" && typeof tab.label === "string",
      );
    },
  },
  activeTab: {
    type: String,
    required: true,
  },
  ariaLabel: {
    type: String,
    default: "Navigation tabs",
  },
  gridLayout: {
    type: Boolean,
    default: false,
  },
});

const _emit = defineEmits(["update:activeTab"]);

// Scroll/drag state
const navRef = ref<HTMLElement | null>(null);
const showLeft = ref(false);
const showRight = ref(false);
const isDragging = ref(false);
let startX = 0;
let startScrollLeft = 0;

function updateArrows() {
  const el = navRef.value;
  if (!el) return;
  const maxScroll = el.scrollWidth - el.clientWidth;
  showLeft.value = el.scrollLeft > 2;
  showRight.value = el.scrollLeft < maxScroll - 2;
}

function onPointerDown(e: Event) {
  // Ignore if clicking an interactive child (a button already)
  const pointerEvent = e as any;
  if (
    (e.target as HTMLElement)?.closest(".nav-link") ||
    (e.target as HTMLElement)?.closest(".nav-scroll-arrow")
  )
    return;
  const el = navRef.value;
  if (!el) return;
  isDragging.value = true;
  startX = pointerEvent.clientX;
  startScrollLeft = el.scrollLeft;
  try {
    el.setPointerCapture(pointerEvent.pointerId);
  } catch {}
}

function onPointerMove(e: Event) {
  if (!isDragging.value) return;
  const el = navRef.value;
  if (!el) return;
  const pointerEvent = e as any;
  const dx = pointerEvent.clientX - startX;
  el.scrollLeft = startScrollLeft - dx;
  updateArrows();
}

function onPointerUp(e?: Event) {
  if (!isDragging.value) return;
  const el = navRef.value;
  isDragging.value = false;
  const pointerEvent = e as any;
  try {
    if (el && e) el.releasePointerCapture(pointerEvent.pointerId);
  } catch {}
}

function scrollBy(dir: number) {
  const el = navRef.value;
  if (!el) return;
  const amount = Math.max(120, Math.round(el.clientWidth * 0.6)) * dir;
  el.scrollBy({ left: amount, behavior: "smooth" });
  // Schedule an update after scroll animation starts
  setTimeout(updateArrows, 50);
}

function onResize() {
  updateArrows();
}

onMounted(() => {
  updateArrows();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

function isEmoji(icon) {
  // Retained for compatibility; AppIcon handles both cases now
  return false;
}

function onArrow(delta) {
  try {
    const keys = (Array.isArray(props.tabs) ? props.tabs : []).map(
      (t) => t.key,
    );
    const idx = Math.max(0, keys.indexOf(props.activeTab));
    const next = (idx + delta + keys.length) % keys.length;
    const key = keys[next];
    if (key) {
      // emit update for parent
      // using dispatch through DOM is unnecessary
      // rely on direct emit via exposed API
      // @ts-ignore - runtime emit available
      emit("update:activeTab", key);
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
  flex-direction: row;
  flex-wrap: nowrap;
  gap: var(--spacing-sm, 0.5rem);
  -webkit-overflow-scrolling: touch;
}

.glass-nav.is-dragging {
  cursor: grabbing;
}
.glass-nav.is-dragging .nav-link {
  pointer-events: none;
}

.glass-nav::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

.glass-nav .nav-link {
  background: transparent;
  border: none;
  position: relative;
  overflow: visible;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  text-decoration: none;
}

.glass-nav.nav-fill .nav-link,
.glass-nav.nav-tabs .nav-link {
}

.glass-nav .nav-link:hover {
}

.glass-nav .nav-link.active {
  box-shadow:
}

.glass-nav .nav-link.active:hover {
}

.nav-scroll-arrow {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  color: var(--text-primary);
}
.nav-scroll-arrow.left {
  margin-right: var(--spacing-xs);
}
.nav-scroll-arrow.right {
  margin-left: var(--spacing-xs);
}
.nav-scroll-arrow:hover {
}
.nav-scroll-arrow:active {
}

.edge-fade {
  position: sticky;
  pointer-events: none;
}
.edge-fade.left {
}
.edge-fade.right {
}

[data-theme="dark"] .edge-fade.left {
}
[data-theme="dark"] .edge-fade.right {
}

.nav-grid {
  display: grid;
}

.nav-grid .nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.nav-grid .nav-link .icon-md {
}

.nav-grid .nav-link span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-dot {
  position: absolute;
}

.tab-count {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

  .glass-nav .nav-link:has(.tab-dot, .tab-count) {
  }

  .tab-dot {
  }

  .tab-count {
  }
}

.glass-nav .nav-link.active .tab-dot {
}

.glass-nav .nav-link.active .tab-count {
}

.icon-md {
}


[data-theme="dark"] .glass-nav .nav-link {
}

[data-theme="dark"] .glass-nav .nav-link.active {
  box-shadow:
}

@media (prefers-reduced-motion: reduce) {
  .glass-nav .nav-link {
    transition: none;
  }

  .glass-nav .nav-link:hover {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass-nav {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  [data-theme="dark"] .glass-nav {
    background: var(--bg-secondary);
  }
}
</style>
