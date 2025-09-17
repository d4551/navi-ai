<template>
  <div class="step-tabs font-sans">
    <GlassNavTabs
      :tabs="tabs"
      :active-tab="activeTabLocal"
      :aria-label="ariaLabel"
      @update:active-tab="onUpdateActive"
    />

    <div
      v-if="showProgress"
      class="progress progress-thin mb-3"
      role="progressbar"
      :aria-valuenow="stepProgress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${ariaLabel} completion`"
    >
      <div
        class="progress-bar bg-primary-500"
        :style="`width:${stepProgress}%`"
      ></div>
    </div>
    <div v-if="showProgress" class="visually-hidden" aria-live="polite">
      {{ Math.round(stepProgress) }}% complete.
    </div>

    <div v-if="showControls" class="flex justify-between items-center mt-2">
      <UnifiedButton
        variant="outline"
        size="md"
        type="button"
        :disabled="stepIndex === 0"
        leading-icon="ArrowLeftIcon"
        @click="prevStep"
      >
        Previous
      </UnifiedButton>

      <div class="text-secondary small">
        Step {{ stepIndex + 1 }} of {{ stepsCount }}
      </div>

      <UnifiedButton
        v-if="stepIndex < stepsCount - 1"
        variant="primary"
        size="md"
        type="button"
        trailing-icon="ArrowRightIcon"
        @click="nextStep"
      >
        Next
      </UnifiedButton>
      <UnifiedButton
        v-else
        variant="success"
        size="md"
        type="button"
        @click="goToStep(0)"
      >
        Review Again
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

import { computed, toRefs, ref, watch, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import GlassNavTabs from '@/components/GlassNavTabs.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    // [{ key, label, shortLabel?, icon? }]
  },
  activeTab: {
    type: String,
    required: true,
  },
  // Optional: function to evaluate per-step completion
  // (idx, key) => boolean
  isComplete: {
    type: Function,
    default: null,
  },
  showProgress: {
    type: Boolean,
    default: true,
  },
  showControls: {
    type: Boolean,
    default: true,
  },
  ariaLabel: {
    type: String,
    default: 'Step navigation',
  },
})

const emit = defineEmits(['update:activeTab', 'next', 'prev', 'change'])

const { tabs, activeTab } = toRefs(props)
const activeTabLocal = ref(activeTab.value)

watch(activeTab, v => {
  activeTabLocal.value = v
})

const stepsCount = computed(() => tabs.value.length)
const stepIndex = computed(() =>
  Math.max(
    0,
    tabs.value.findIndex(t => t.key === activeTabLocal.value)
  )
)

const stepProgress = computed(() => {
  if (!props.isComplete) {
    return 0
  }
  try {
    const completed = tabs.value.reduce(
      (n, t, i) => n + (props.isComplete(i, t.key) ? 1 : 0),
      0
    )
    return Math.round((completed / Math.max(1, tabs.value.length)) * 100)
  } catch {
    return 0
  }
})

function goToStep(idx) {
  if (idx < 0 || idx >= stepsCount.value) {
    return
  }
  const key = tabs.value[idx]?.key
  if (!key) {
    return
  }
  activeTabLocal.value = key
  emit('update:activeTab', key)
  emit('change', { index: idx, key })
}

function nextStep() {
  emit('next')
  goToStep(Math.min(stepIndex.value + 1, stepsCount.value - 1))
}

function prevStep() {
  emit('prev')
  goToStep(Math.max(stepIndex.value - 1, 0))
}

function onUpdateActive(key) {
  activeTabLocal.value = key
  emit('update:activeTab', key)
  const idx = tabs.value.findIndex(t => t.key === key)
  emit('change', { index: idx, key })
}

defineExpose({ goToStep, nextStep, prevStep })
</script>

<style scoped>
.progress-thin {
  /* Backward compat: map to design-system modifier */
  height: var(--spacing-1-5);
}
</style>
