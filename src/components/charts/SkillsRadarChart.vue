<template>
  <div class="skills-radar-chart font-sans">
    <div class="chart-header">
      <AppIcon name="mdi-radar" aria-hidden="true" />
      <span>Skills Radar</span>
    </div>

    <div v-if="normalizedSkills.length === 0" class="empty-state">
      <AppIcon name="mdi-alert-circle-outline-outline" aria-hidden="true" />
      <span>No skills to display</span>
    </div>

    <div v-else class="chart-container">
      <Radar :data="chartData" :options="chartOptions" />
    </div>
  </div>
  
  <!-- Provide simple bars fallback for environments where canvas is blocked -->
  <noscript>
    <div class="bars">
    <div v-for="s in normalizedSkills" :key="s.label" class="bar-flex flex-wrap">
    <div class="bar-label">{{ s.label }}</div>
    <div class="bar-track">
    <div class="bar-fill" :style="{ width: `${s.value}%` }"></div>
    </div>
    <div class="bar-value">{{ s.value }}%</div>
    </div>
    </div>
  </noscript>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { Radar } from 'vue-chartjs'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

type SkillInput = string | { label?: string; name?: string; skill?: string; value?: number }

const props = withDefaults(defineProps<{ skills?: SkillInput[] }>(), {
  skills: () => []
})

// Normalize input to { label, value } in [0..100]
const normalizedSkills = computed(() => {
  const source = Array.isArray(props.skills) ? props.skills : []
  const mapped = source.map((s: SkillInput) => {
    if (typeof s === 'string') return { label: s, value: 100 }
    const label = s.label || s.name || s.skill || 'Skill'
    let value = Number(s.value ?? 100)
    if (Number.isNaN(value)) value = 100
    value = Math.max(0, Math.min(100, Math.round(value)))
    return { label, value }
  })
  return mapped
    .sort((a, b) => (b.value - a.value))
    .slice(0, 12)
})

function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return val || fallback
}

const chartData = computed(() => {
  const labels = normalizedSkills.value.map(s => s.label)
  const data = normalizedSkills.value.map(s => s.value)
  const primary = cssVar('--color-primary-500', 'rgba(59,130,246,1)')
  const primaryTrans = cssVar('--color-primary-500', '59,130,246') // try to parse rgb if available
  const bg = primary.includes(',') ? `rgba(${primaryTrans},0.2)` : 'rgba(59,130,246,0.2)'
  return {
    labels,
    datasets: [
      {
        label: 'Skill Level',
        data,
        backgroundColor: bg,
        borderColor: primary,
        borderWidth: 2,
        pointBackgroundColor: primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: primary,
        fill: true,
        tension: 0.2
      }
    ]
  }
})

const chartOptions = computed(() => {
  const text = cssVar('--text-primary-600', '#e5e7eb')
  const grid = cssVar('--border-glass', 'rgba(255,255,255,0.1)')
  const ticks = cssVar('--text-secondary', '#9ca3af')
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: text, boxWidth: 12 }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.r || ctx.parsed} %`
        }
      }
    },
    elements: {
      line: { borderJoinStyle: 'round' }
    },
    scales: {
      r: {
        angleLines: { color: grid },
        grid: { color: grid },
        pointLabels: { color: text, font: { size: 12 }},
        ticks: { color: ticks, backdropColor: 'transparent', showLabelBackdrop: false, stepSize: 20, max: 100, beginAtZero: true }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  } as const
})
</script>

<style scoped>
.skills-radar-chart {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
}
.chart-container { position: relative; height: 320px; }
.chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.empty-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  padding: 0.5rem 0;
}
.bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bar-flex flex-wrap {
  display: grid;
  grid-template-columns: 1fr 3fr auto;
  gap: 0.5rem;
  align-items: center;
}
.bar-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.bar-track {
  position: relative;
  height: 8px;
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border-radius: 999px;
  overflow: hidden;
}
.bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--color-primary-500);
  border-radius: 999px;
}
.bar-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
