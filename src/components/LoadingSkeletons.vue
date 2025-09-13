<template>
  <div
    v-if="show"
    class="loading-skeletons"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label="Loading content"
  >
    <!-- Document Header Skeleton -->
    <ContentLoader
      v-if="variant === 'document' || variant === 'all'"
      :height="160"
      :width="1200"
      v-bind="skeletonProps"
      class="w-100 mb-3"
    >
      <rect x="16" y="14" rx="8" ry="8" width="65%" height="18" />
      <rect x="16" y="42" rx="6" ry="6" width="45%" height="12" />
      <rect x="16" y="68" rx="10" ry="10" width="96%" height="60" />
    </ContentLoader>

    <!-- Document Content Skeleton -->
    <ContentLoader
      v-if="variant === 'document' || variant === 'all'"
      :height="160"
      :width="1200"
      v-bind="skeletonProps"
      class="w-100 mb-3"
    >
      <rect x="16" y="14" rx="8" ry="8" width="55%" height="18" />
      <rect x="16" y="42" rx="6" ry="6" width="35%" height="12" />
      <rect x="16" y="68" rx="10" ry="10" width="96%" height="60" />
    </ContentLoader>

    <!-- Form Fields Skeleton -->
    <template v-if="variant === 'form' || variant === 'all'">
      <ContentLoader
        v-for="n in formFieldCount"
        :key="`form-${n}`"
        :height="80"
        :width="1200"
        v-bind="skeletonProps"
        class="w-100 mb-3"
      >
        <rect x="16" y="8" rx="4" ry="4" width="25%" height="14" />
        <rect x="16" y="32" rx="8" ry="8" width="90%" height="32" />
      </ContentLoader>
    </template>

    <!-- Card Grid Skeleton -->
    <div v-if="variant === 'grid' || variant === 'all'" class="row g-3 mb-3">
      <div
        v-for="n in gridItemCount"
        :key="`grid-${n}`"
        class="col-12 col-sm-6 col-lg-4"
      >
        <ContentLoader
          :height="200"
          :width="400"
          v-bind="skeletonProps"
          class="w-100"
        >
          <rect x="16" y="16" rx="8" ry="8" width="80%" height="16" />
          <rect x="16" y="44" rx="6" ry="6" width="60%" height="12" />
          <rect x="16" y="72" rx="12" ry="12" width="95%" height="80" />
          <rect x="16" y="168" rx="6" ry="6" width="40%" height="12" />
        </ContentLoader>
      </div>
    </div>

    <!-- Compact Variant: smaller cards and rows -->
    <div v-if="variant === 'compact'" class="mb-3">
      <div class="row g-2 mb-2">
        <div
          v-for="n in Math.max(3, Math.ceil(gridItemCount / 2))"
          :key="`compact-card-${n}`"
          class="col-6 col-md-4 col-lg-3"
        >
          <ContentLoader :height="120" :width="320" v-bind="skeletonProps" class="w-100">
            <rect x="12" y="12" rx="8" ry="8" width="70%" height="12" />
            <rect x="12" y="32" rx="6" ry="6" width="50%" height="10" />
            <rect x="12" y="52" rx="10" ry="10" width="92%" height="48" />
          </ContentLoader>
        </div>
      </div>
      <div>
        <ContentLoader
          v-for="n in Math.min(4, tableRowCount)"
          :key="`compact-row-${n}`"
          :height="44"
          :width="800"
          v-bind="skeletonProps"
          class="w-100 mb-2"
        >
          <rect x="12" y="14" rx="6" ry="6" width="25%" height="12" />
          <rect x="40%" y="14" rx="6" ry="6" width="20%" height="12" />
          <rect x="70%" y="14" rx="6" ry="6" width="15%" height="12" />
        </ContentLoader>
      </div>
    </div>

    <!-- Table Rows Skeleton -->
    <template v-if="variant === 'table' || variant === 'all'">
      <ContentLoader
        v-for="n in tableRowCount"
        :key="`table-${n}`"
        :height="60"
        :width="1200"
        v-bind="skeletonProps"
        class="w-100 mb-2"
      >
        <rect x="16" y="16" rx="6" ry="6" width="20%" height="14" />
        <rect x="25%" y="16" rx="6" ry="6" width="30%" height="14" />
        <rect x="60%" y="16" rx="6" ry="6" width="15%" height="14" />
        <rect x="80%" y="16" rx="6" ry="6" width="15%" height="14" />
      </ContentLoader>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from "vue";
import { ContentLoader } from "vue-content-loader";

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: "document",
    validator: (value) =>
      ["document", "form", "grid", "table", "compact", "all"].includes(value),
  },
  tone: {
    type: String,
    default: "neutral",
    validator: (value) => ["neutral", "accent"].includes(value),
  },
  formFieldCount: {
    type: Number,
    default: 3,
  },
  gridItemCount: {
    type: Number,
    default: 6,
  },
  tableRowCount: {
    type: Number,
    default: 5,
  },
});

// Respect user's motion preferences
const prefersReducedMotion = ref(false);
const skeletonProps = computed(() => {
  const tone = props.tone || "neutral";
  const neutral = {
    primaryColor: "var(--surface-container, var(--skeleton-primary))",
    secondaryColor: "var(--surface-elevated, var(--skeleton-secondary))",
  };
  const accent = {
    primaryColor: "rgba(var(--color-gaming-neon-rgb), 0.08)",
    secondaryColor: "rgba(var(--color-gaming-neon-rgb), 0.16)",
  };
  const colors = tone === "accent" ? accent : neutral;
  return {
    speed: 1.2,
    animate: !prefersReducedMotion.value,
    ...colors,
  };
});

let mediaQuery;
let onChange;
onMounted(() => {
  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = mediaQuery.matches;
  onChange = (e) => {
    prefersReducedMotion.value = e.matches;
  };
  try {
    mediaQuery.addEventListener("change", onChange);
  } catch (_) {
    // Safari fallback
    mediaQuery.addListener(onChange);
  }
});

onUnmounted(() => {
  if (mediaQuery && onChange) {
    try {
      mediaQuery.removeEventListener("change", onChange);
    } catch (_) {
      mediaQuery.removeListener(onChange);
    }
  }
});
</script>

<style scoped>
.loading-skeletons {
  min-height: 200px;
}

:deep(.vue-content-loader) {
}

[data-theme="dark"] :deep(.vue-content-loader) {
}
</style>
