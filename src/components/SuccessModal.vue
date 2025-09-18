<template>
  <div
    class="modal-overlay font-sans"
    role="dialog"
    aria-modal="true"
    aria-labelledby="success-modal-title"
    @click.self="emitClose"
    @keydown.esc.prevent.stop="emitClose"
  >
    <div ref="modalEl" class="modal" role="document">
      <header class="modal__header">
        <h2 id="success-modal-title" class="modal__title">{{ title }}</h2>
      </header>
      <div class="modal__body">
        <p class="modal__message">{{ message }}</p>
        <slot name="extra" />
        <div class="icon-check" aria-hidden="true">
          <AppIcon name="CheckIcon" size="small" color="success" />
        </div>
      </div>
      <footer class="modal__footer">
        <UnifiedButton variant="glass" @click="emitClose">Close</UnifiedButton>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from '@heroicons/vue/24/outline'

import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Props {
  title: string
  message: string
  autoCloseMs?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (_e: 'close'): void }>()

const modalEl = ref<HTMLElement | null>(null)
let timeoutId: number | null = null

function emitClose() {
  emit('close')
}

function trapFocus(_e: Event) {
  if (!modalEl.value) return
  if (!modalEl.value.contains(document.activeElement)) {
    const focusable = modalEl.value.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }
}

onMounted(() => {
  document.addEventListener('focus', trapFocus, true)
  setTimeout(
    () => modalEl.value?.querySelector<HTMLElement>('button')?.focus(),
    0
  )
  if (props.autoCloseMs && props.autoCloseMs > 0) {
    timeoutId = window.setTimeout(() => emitClose(), props.autoCloseMs)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('focus', trapFocus, true)
  if (timeoutId != null) window.clearTimeout(timeoutId)
})
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
  color: var(--text-primary-600);
  border: 1px solid var(--modal-border);
  border-radius: var(--radius-modal);
  width: min(420px, 92%);
  box-shadow: var(--shadow-glass-xl);
  padding: var(--spacing-4) var(--spacing-5);
  display: flex;
  flex-direction: column;
}

.modal__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

.modal__body {
  margin-top: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.modal__message {
  line-height: var(--line-height-normal);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.icon-check {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--gradient-accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: var(--font-weight-semibold);
  align-self: center;
  color: var(--text-inverse);
  box-shadow: var(--shadow-glass-lg);
}

.modal__footer {
  margin-top: var(--spacing-4);
  display: flex;
  justify-content: flex-end;
}

/* Buttons inherit global glass styling via UnifiedButton */
</style>
