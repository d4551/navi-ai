<template>
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="loading-modal-title"
    @keydown.esc.prevent.stop="emitClose"
  >
    <div ref="modalEl" class="modal">
      <header class="modal__header">
        <h2 id="loading-modal-title" class="modal__title">{{ title }}</h2>
      </header>
      <div class="modal__body">
        <p class="modal__message">{{ message }}</p>
        <div v-if="showProgress" class="progress">
          <div
            class="progress__bar"
            :style="{ width: computedProgress + '%' }"
          />
        </div>
        <div v-else class="spinner" aria-label="Loading" />
      </div>
      <footer class="modal__footer">
        <UnifiedButton variant="ghost" @click="emitClose">Cancel</UnifiedButton>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

interface Props {
  title: string;
  message: string;
  progress?: number | null;
  autoCloseOnComplete?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (_e: "close"): void }>();

const modalEl = ref<HTMLElement | null>(null);

const computedProgress = computed(() => {
});

const showProgress = computed(
  () => props.progress != null && !isNaN(props.progress),
);

  emit("close");
}

  if (!modalEl.value) return;
  if (!modalEl.value.contains(document.activeElement)) {
    const focusable = modalEl.value.querySelector<HTMLElement>(
    );
    focusable?.focus();
  }
}

onMounted(() => {
  document.addEventListener("focus", trapFocus, true);
  // initial focus
  setTimeout(() => {
    const first = modalEl.value?.querySelector<HTMLElement>("button");
    first?.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener("focus", trapFocus, true);
});

watch(
  () => computedProgress.value,
  (val) => {
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--backdrop-blur-base);
  z-index: var(--z-modal);
}

.modal {
  background: var(--modal-background);
  color: var(--text-primary);
  border-radius: var(--radius-modal);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal__body {
}

.modal__message {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  font-size: var(--font-size-sm);
}

.progress {
  background: var(--border-base);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.progress__bar {
  background: var(--gradient-accent-primary);
  transition: width var(--duration-slow) var(--easing-ease-out);
}

.spinner {
  border-radius: var(--radius-full);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
}


@keyframes spin {
  to {
  }
}
</style>
