<template>
  <div class="unified-container studio-subnav" class="font-sans">
    <GlassNavTabs
      :tabs="tabs"
      :active-tab="activeKey"
      aria-label="Studios navigation"
      @update:active-tab="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { UserIcon, ChartBarIcon, CircleStackIcon } from '@heroicons/vue/24/outline'

import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GlassNavTabs from '@/components/GlassNavTabs.vue'

const props = defineProps<{ 
  databaseCount?: number
  analyticsCount?: number
  networkCount?: number
}>()

const router = useRouter()
const route = useRoute()

const tabs = computed(() => [
  { key: 'database', label: 'Database', shortLabel: 'DB', icon: 'CircleStackIcon', count: props.databaseCount },
  { key: 'analytics', label: 'Analytics', shortLabel: 'Stats', icon: 'ChartBarIcon-line', count: props.analyticsCount },
  { key: 'network', label: 'Network', shortLabel: 'Net', icon: 'UserIcon-network', count: props.networkCount },
])

const activeKey = computed(() => {
  const p = String(route.path || '')
  if (p.includes('/studios/network')) return 'network'
  if (p.includes('/studios/analytics')) return 'analytics'
  return 'database'
})

function onChange(key: string) {
  if (key === activeKey.value) return
  try { localStorage.setItem('navi-studios-active-tab', key) } catch {}
  if (key === 'database') router.push('/studios')
  else if (key === 'analytics') router.push('/studios/analytics')
  else if (key === 'network') router.push('/studios/network')
}

onMounted(() => {
  try { localStorage.setItem('navi-studios-active-tab', activeKey.value) } catch {}
})

watch(() => route.path, () => {
  try { localStorage.setItem('navi-studios-active-tab', activeKey.value) } catch {}
})
</script>

<style scoped>
.studio-subnav { margin-top: var(--spacing-4); }
</style>
