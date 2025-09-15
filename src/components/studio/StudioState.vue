<template>
  <div class="font-sans ">
    <div v-if="loading" class="loading-grid">
      <div v-for="i in skeletonCount" :key="i" class="studio-card-skeleton glass-card section-card">
        <div class="skeleton-header">
          <div class="skeleton-logo"></div>
          <div class="skeleton-info">
            <div class="skeleton-line skeleton-name"></div>
            <div class="skeleton-line skeleton-location"></div>
          </div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>
    <div v-else-if="showEmpty" class="empty-state glass-card section-card">
      <AppIcon name="mdi-domain-off" class="empty-icon" />
      <h3>{{ emptyTitle }}</h3>
      <p>{{ emptySubtitle }}</p>
      <UnifiedButton color="glass" appearance="contained" @click="$emit('clear')">
        {{ emptyActionLabel }}
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
withDefaults(defineProps<{
  loading?: boolean
  showEmpty?: boolean
  skeletonCount?: number
  emptyTitle?: string
  emptySubtitle?: string
  emptyActionLabel?: string
}>(), {
  loading: false,
  showEmpty: false,
  skeletonCount: 6,
  emptyTitle: 'No Studios Found',
  emptySubtitle: 'Try adjusting your search criteria',
  emptyActionLabel: 'Clear Investigation'
})
defineEmits(['clear'])
</script>

<style scoped>
/* Uses parent page styles for classes referenced here */
</style>
