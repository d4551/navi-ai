<template>
  <div v-if="show" class="loading-skeletons" role="status" aria-live="polite">
    <!-- Document Header Skeleton -->
    <ContentLoader
      v-if="variant === 'document' || variant === 'all'"
      :height="160"
      :width="1200"
      :speed="1.2"
      primary-color="var(--skeleton-primary)"
      secondary-color="var(--skeleton-secondary)"
      :animate="!prefersReducedMotion"
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
      :speed="1.2"
      primary-color="var(--skeleton-primary)"
      secondary-color="var(--skeleton-secondary)"
      :animate="!prefersReducedMotion"
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
        :speed="1.2"
        primary-color="var(--skeleton-primary)"
        secondary-color="var(--skeleton-secondary)"
        :animate="!prefersReducedMotion"
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
          :speed="1.2"
          primary-color="var(--skeleton-primary)"
          secondary-color="var(--skeleton-secondary)"
          :animate="!prefersReducedMotion"
          class="w-100"
        >
          <rect x="16" y="16" rx="8" ry="8" width="80%" height="16" />
          <rect x="16" y="44" rx="6" ry="6" width="60%" height="12" />
          <rect x="16" y="72" rx="12" ry="12" width="95%" height="80" />
          <rect x="16" y="168" rx="6" ry="6" width="40%" height="12" />
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
        :speed="1.2"
        primary-color="var(--skeleton-primary)"
        secondary-color="var(--skeleton-secondary)"
        :animate="!prefersReducedMotion"
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
import { onMounted, ref, defineProps } from 'vue'
import { ContentLoader } from 'vue-content-loader'

defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: 'document',
    validator: value =>
      ['document', 'form', 'grid', 'table', 'all'].includes(value),
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
})

// Respect user's motion preferences
const prefersReducedMotion = ref(false)

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches

  mediaQuery.addEventListener('change', e => {
    prefersReducedMotion.value = e.matches
  })
})
</script>

<style scoped>
.loading-skeletons {
  min-height: 200px;
}

/* Ensure skeleton colors respect theme */
:deep(.vue-content-loader) {
  --skeleton-primary: var(--bg-tertiary, #e4e4e7);
  --skeleton-secondary: var(--bg-secondary, #f4f4f5);
}

[data-theme='dark'] :deep(.vue-content-loader) {
  --skeleton-primary: var(--bg-secondary);
  --skeleton-secondary: var(--bg-tertiary);
}
</style>
