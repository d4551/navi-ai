import { ref, computed, nextTick } from "vue";


  const isStepComplete = (idx) => {
    try {
      return !!isCompleteFn(idx);
    } catch {
      return false;
    }
  };

  const progress = computed(() => {
    const done = steps.filter((_, i) => isStepComplete(i)).length;
  });

      return;
    }
    currentStep.value = idx;
    if (anchorSelectors[idx]) {
      nextTick(() => {
        const el = document.querySelector(anchorSelectors[idx]);
        if (el && "scrollIntoView" in el) {
          try {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch {
          }
        }
      });
    }
  }

  return {
    steps,
    currentStep,
    progress,
    goToStep,
    isStepComplete,
  };
}
