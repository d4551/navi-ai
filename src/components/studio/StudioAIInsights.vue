<template>
  <section class="modal-section ai-insights-section font-sans">
    <h3 class="section-title">
      <AppIcon name="CpuChipIcon" />
      AI Insights
    </h3>
    <div class="ai-insights-card">
      <div class="flex justify-between items-center mb-2">
        <div class="text-secondary">Get strengths, risks, and suggested roles</div>
        <UnifiedButton color="glass" :loading="loading" leading-icon="SparklesIcon" :disabled="loading || !studio" @click="$emit('analyze')">
          {{ loading ? 'Analyzing...' : 'Analyze with AI' }}
        </UnifiedButton>
      </div>
      <div v-if="studio && insights" class="ai-insights-body">
        <div class="insight-block">
          <div class="insight-title">Strengths</div>
          <ul class="insight-list">
            <li v-for="(s, i) in insights.strengths" :key="'s'+i">{{ s }}</li>
          </ul>
        </div>
        <div class="insight-block">
          <div class="insight-title">Risks</div>
          <ul class="insight-list">
            <li v-for="(r, i) in insights.risks" :key="'r'+i">{{ r }}</li>
          </ul>
        </div>
        <div class="insight-block">
          <div class="insight-title">Suggested Roles</div>
          <div class="insight-tags">
            <span v-for="(role, i) in insights.roles" :key="'role'+i" class="insight-tag">{{ role }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-secondary">Run analysis to see AI insights for this studio.</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CpuChipIcon, SparklesIcon } from '@heroicons/vue/24/outline'

import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
defineProps<{
  studio: any | null
  insights: { strengths: string[]; risks: string[]; roles: string[] } | null
  loading: boolean
}>()
defineEmits(['analyze'])
</script>

<style scoped>
.ai-insights-card { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px; }
.insight-block { margin-top: 8px; }
.insight-title { font-weight: 600; margin-bottom: 4px; }
.insight-list { margin: 0; padding-left: 18px; }
.insight-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.insight-tag { background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover); border: 1px solid var(--glass-border); padding: 2px 8px; border-radius: 999px; font-size: 0.85rem; }
</style>
