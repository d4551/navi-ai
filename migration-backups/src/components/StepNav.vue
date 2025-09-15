<template>
  <nav class="resume-step-tabs mb-3" :aria-label="ariaLabel">
    <button
      v-for="(s, idx) in steps"
      :key="s.key || idx"
      class="step-tab"
      :class="{ active: current === idx, complete: isComplete(idx) }"
      type="button"
      :aria-current="current === idx ? 'step' : undefined"
      :aria-label="(s.label || s.shortLabel) + (isComplete(idx) ? ' (complete)' : '')"
      @click="$emit('update:current', idx)"
    >
      <span class="step-index">{{ idx + 1 }}</span>
      <span class="step-label d-none d-sm-inline">{{ s.shortLabel || s.label }}</span>
    </button>
  </nav>
  <div
    v-if="showProgress"
    class="progress progress-thin mb-3"
    role="progressbar"
    :aria-valuenow="progress"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="progressAriaLabel"
  >
    <div class="progress-bar bg-primary" :style="`width:${progress}%`"></div>
  </div>
  <div class="visually-hidden" aria-live="polite">
    Step {{ current + 1 }} of {{ steps.length }}. {{ progress }}% complete.
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'StepNav',
  props: {
    steps: { type: Array, required: true },
    current: { type: Number, default: 0 },
    completed: { type: Function, default: () => () => false },
    showProgress: { type: Boolean, default: true },
    progress: { type: Number, default: 0 },
    ariaLabel: { type: String, default: 'Step navigation' }
  },
  emits: ['update:current'],
  computed: {
    progressAriaLabel(){return `${this.ariaLabel} completion`;},
  },
  methods: {
    isComplete(idx){
      if (typeof this.completed === 'function') return this.completed(idx)
      return false
    }
  }
}
</script>

<style scoped>
/* Reuse existing styling expectations; rely on parent global styles for .resume-step-tabs/.step-tab if present */
</style>