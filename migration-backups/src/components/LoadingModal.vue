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
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Props {
  title: string
  message: string
  /** Optional progress (0-100). If undefined shows spinner */
  progress?: number | null
  /** Auto close when reaches 100 */
  autoCloseOnComplete?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (_e: 'close'): void }>()

const modalEl = ref<HTMLElement | null>(null)

const computedProgress = computed(() => {
  if (props.progress == null || isNaN(props.progress)) return 0
  return Math.min(100, Math.max(0, props.progress))
})

const showProgress = computed(
  () => props.progress != null && !isNaN(props.progress)
)

function emitClose() {
  emit('close')
}

function trapFocus(_e: Event) {
  if (!modalEl.value) return
  if (!modalEl.value.contains(document.activeElement)) {
    const focusable = modalEl.value.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }
}

onMounted(() => {
  document.addEventListener('focus', trapFocus, true)
  // initial focus
  setTimeout(() => {
    const first = modalEl.value?.querySelector<HTMLElement>('button')
    first?.focus()
  }, 0)
})

onBeforeUnmount(() => {
  document.removeEventListener('focus', trapFocus, true)
})

watch(
  () => computedProgress.value,
  val => {
    if (props.autoCloseOnComplete && val >= 100) emitClose()
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
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
  border: 1px solid var(--modal-border);
  border-radius: var(--radius-modal);
  width: min(420px, 92%);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4) var(--spacing-5);
}

.modal__title {
  font-size: var(--font-size-lg);
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal__body {
  margin-top: var(--spacing-2);
}

.modal__message {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  font-size: var(--font-size-sm);
}

.progress {
  margin-top: var(--spacing-4);
  height: 8px;
  background: var(--border-base);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: var(--gradient-accent-primary);
  transition: width var(--duration-slow) var(--easing-ease-out);
}

.spinner {
  margin: var(--spacing-4) auto 0;
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-base);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

.modal__footer {
  margin-top: var(--spacing-4);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
}

/* Buttons inherit global glass styling via UnifiedButton */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
