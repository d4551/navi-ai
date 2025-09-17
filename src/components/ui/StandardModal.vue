<template>
  <Teleport to="body" class="font-sans">
    <div
      v-if="modelValue"
      class="standard-modal-overlay"
      :class="overlayClass"
      @click="onOverlayClick"
    >
      <div
        ref="modalRef"
        class="standard-modal"
        :class="modalClass"
        role="dialog"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        aria-modal="true"
        @click.stop
      >
        <!-- Modal Header -->
        <header v-if="$slots.header || title" class="standard-modal__header">
          <slot name="header">
            <div class="standard-modal__title-section">
              <h2 :id="ariaLabelledby" class="standard-modal__title">
                <AppIcon
                  v-if="icon"
                  :name="icon"
                  class="standard-modal__title-icon"
                />
                {{ title }}
              </h2>
              <p v-if="subtitle" class="standard-modal__subtitle">
                {{ subtitle }}
              </p>
            </div>
          </slot>

          <button
            v-if="closable"
            class="standard-modal__close"
            type="button"
            aria-label="Close modal"
            @click="close"
          >
            <AppIcon name="XMarkIcon" />
          </button>
        </header>

        <!-- Modal Body -->
        <main class="standard-modal__body" :class="bodyClass">
          <slot />
        </main>

        <!-- Modal Footer -->
        <footer
          v-if="$slots.footer || showDefaultActions"
          class="standard-modal__footer"
        >
          <slot name="footer">
            <div v-if="showDefaultActions" class="standard-modal__actions">
              <UnifiedButton
                v-if="showCancel"
                variant="outline-secondary"
                @click="cancel"
              >
                {{ cancelText }}
              </UnifiedButton>
              <UnifiedButton
                v-if="showConfirm"
                :variant="confirmVariant"
                :loading="loading"
                @click="confirm"
              >
                {{ confirmText }}
              </UnifiedButton>
            </div>
          </slot>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AppIcon from './AppIcon.vue'
import UnifiedButton from './UnifiedButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnOverlay?: boolean
  persistent?: boolean
  loading?: boolean

  // Action buttons
  showDefaultActions?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmVariant?: string

  // Styling
  variant?: 'default' | 'glass' | 'minimal' | 'elevated'
  centered?: boolean
  scrollable?: boolean

  // Accessibility
  ariaLabelledby?: string
  ariaDescribedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  persistent: false,
  loading: false,
  showDefaultActions: false,
  showCancel: true,
  showConfirm: true,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmVariant: 'primary',
  variant: 'default',
  centered: true,
  scrollable: true,
  ariaLabelledby: 'modal-title',
  ariaDescribedby: 'modal-body',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  cancel: []
  confirm: []
  opened: []
  closed: []
}>()

const modalRef = ref<HTMLElement>()

// Computed classes
const overlayClass = computed(() => [
  'standard-modal-overlay',
  `standard-modal-overlay--${props.variant}`,
  {
    'standard-modal-overlay--centered': props.centered,
  },
])

const modalClass = computed(() => [
  'standard-modal',
  `standard-modal--${props.size}`,
  `standard-modal--${props.variant}`,
  {
    'standard-modal--scrollable': props.scrollable,
  },
])

const bodyClass = computed(() => [
  'standard-modal__body',
  {
    'standard-modal__body--scrollable': props.scrollable,
  },
])

// Modal actions
const close = () => {
  if (props.persistent && props.loading) return
  emit('update:modelValue', false)
  emit('close')
}

const cancel = () => {
  if (props.loading) return
  emit('cancel')
  close()
}

const confirm = () => {
  if (props.loading) return
  emit('confirm')
}

const onOverlayClick = () => {
  if (props.closeOnOverlay && !props.persistent) {
    close()
  }
}

// Keyboard handling
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable && !props.persistent) {
    close()
  }
}

// Focus management
const focusModal = () => {
  nextTick(() => {
    modalRef.value?.focus()
  })
}

const trapFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return

  const focusableElements = modalRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (!focusableElements || focusableElements.length === 0) return

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}

// Watchers and lifecycle
watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('keydown', trapFocus)
      focusModal()
      emit('opened')
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keydown', trapFocus)
      emit('closed')
    }
  }
)

onMounted(() => {
  if (props.modelValue) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keydown', trapFocus)
    focusModal()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keydown', trapFocus)
})
</script>

<style scoped>
.standard-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  animation: modal-overlay-enter 0.2s ease-out;
}

.standard-modal-overlay--centered {
  align-items: center;
  justify-content: center;
}

.standard-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  border-radius: 8px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modal-enter 0.2s ease-out;
  outline: none;
}

/* Size variants */
.standard-modal--xs {
  max-width: 320px;
  width: 100%;
}
.standard-modal--sm {
  max-width: 384px;
  width: 100%;
}
.standard-modal--md {
  max-width: 512px;
  width: 100%;
}
.standard-modal--lg {
  max-width: 768px;
  width: 100%;
}
.standard-modal--xl {
  max-width: 1024px;
  width: 100%;
}
.standard-modal--full {
  width: calc(100% - 2rem);
  height: calc(100% - 2rem);
  max-width: none;
  max-height: none;
}

/* Style variants */
.standard-modal--default {
  background: white;
  border: 1px solid #e5e7eb;
}

.standard-modal--glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.standard-modal--minimal {
  background: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.standard-modal--elevated {
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Modal sections */
.standard-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}

.standard-modal__title-section {
  flex: 1;
  min-width: 0;
}

.standard-modal__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.standard-modal__title-icon {
  font-size: 1.5rem;
  color: #6366f1;
}

.standard-modal__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.standard-modal__close {
  padding: 0.5rem;
  margin: -0.5rem -0.5rem 0 0;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
}

.standard-modal__close:hover {
  color: #374151;
  background: #f3f4f6;
}

.standard-modal__close:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.standard-modal__body {
  flex: 1;
  padding: 1.5rem;
  min-height: 0;
}

.standard-modal__body--scrollable {
  overflow-y: auto;
}

.standard-modal__footer {
  padding: 0 1.5rem 1.5rem;
  border-t: 1px solid #e5e7eb;
  margin-top: auto;
}

.standard-modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .standard-modal--default,
  .standard-modal--minimal,
  .standard-modal--elevated {
    background: #1f2937;
    border-color: #374151;
  }

  .standard-modal--glass {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(55, 65, 81, 0.2);
  }

  .standard-modal__title {
    color: #f9fafb;
  }

  .standard-modal__subtitle {
    color: #9ca3af;
  }

  .standard-modal__close {
    color: #9ca3af;
  }

  .standard-modal__close:hover {
    color: #d1d5db;
    background: #374151;
  }

  .standard-modal__footer {
    border-color: #374151;
  }
}

/* Animations */
@keyframes modal-overlay-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-2rem);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .standard-modal-overlay {
    padding: 0.5rem;
  }

  .standard-modal--xs,
  .standard-modal--sm,
  .standard-modal--md,
  .standard-modal--lg,
  .standard-modal--xl {
    width: 100%;
    max-width: none;
  }

  .standard-modal__header {
    padding: 1rem 1rem 0;
  }

  .standard-modal__body {
    padding: 1rem;
  }

  .standard-modal__footer {
    padding: 0 1rem 1rem;
  }

  .standard-modal__actions {
    flex-direction: column-reverse;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .standard-modal {
    border: 2px solid currentColor;
  }

  .standard-modal__close:focus {
    outline: 3px solid;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .standard-modal-overlay,
  .standard-modal {
    animation: none;
  }
}
</style>
