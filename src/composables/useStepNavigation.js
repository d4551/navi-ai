import { ref, computed, nextTick } from 'vue'

/**
 * Generic step navigation composable used for wizard / numbered step flows.
 * @param {Array<{ key?: string, label: string }>} steps - ordered list of steps.
 * @param {(index:number)=>boolean} isCompleteFn - function returning completion status for a step index.
 * @param {Array<string>} [anchorSelectors] - optional list of CSS selectors/IDs to scroll to per step.
 */
export function useStepNavigation(steps, isCompleteFn, anchorSelectors = []) {
  const currentStep = ref(0)

  const isStepComplete = idx => {
    try {
      return !!isCompleteFn(idx)
    } catch {
      return false
    }
  }

  const progress = computed(() => {
    const done = steps.filter((_, i) => isStepComplete(i)).length
    return Math.round((done / steps.length) * 100)
  })

  function goToStep(idx) {
    if (idx < 0 || idx >= steps.length) {
      return
    }
    currentStep.value = idx
    if (anchorSelectors[idx]) {
      nextTick(() => {
        const el = document.querySelector(anchorSelectors[idx])
        if (el && 'scrollIntoView' in el) {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } catch {
            /* no-op */
          }
        }
      })
    }
  }

  return {
    steps,
    currentStep,
    progress,
    goToStep,
    isStepComplete,
  }
}
