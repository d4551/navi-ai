<template>
  <div class="activity-timeline" class="font-sans">
    <div class="timeline-header">
      <AppIcon name="ClockIcon" aria-hidden="true" />
      <span>Recent Activity</span>
    </div>
    <div v-if="!items.length" class="empty">
      <AppIcon name="InformationCircleIcon" aria-hidden="true" />
      <span>No recent activity</span>
    </div>
    <ul v-else class="timeline-list">
      <li v-for="(a, idx) in items" :key="idx" class="timeline-item">
        <div class="dot" />
        <div class="content">
          <div class="title">{{ a.title || a.type || 'Activity' }}</div>
          <div class="meta">{{ a.date || a.when || '' }}</div>
          <div v-if="a.description" class="desc">{{ a.description }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ClockIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
const props = withDefaults(defineProps<{ activities?: any[] }>(), { activities: () => [] })
const items = props.activities || []
</script>

<style scoped>
.activity-timeline { 
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
}
.timeline-header { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; margin-bottom: 0.75rem; }
.empty { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); }
.timeline-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.timeline-item { display: grid; grid-template-columns: 16px 1fr; gap: 0.75rem; align-items: start; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary-500); margin-top: 6px; }
.content .title { font-weight: 600; }
.content .meta { font-size: 0.75rem; color: var(--text-secondary); }
.content .desc { font-size: 0.875rem; color: var(--text-secondary); }
</style>
