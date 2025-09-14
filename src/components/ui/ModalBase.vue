<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal-backdrop"
      :class="{ 'modal-backdrop-visible': modelValue }"
      @click="handleBackdropClick"
      @keydown.escape="handleEscapeKey"
    >
      <div
        ref="modalRef"
        class="modal-container"
        :class="[ `modal-size-${size}`,
                  {
                    'modal-fullscreen': fullscreen,
                    'modal-centered': centered,
                    'modal-scrollable': scrollable
                  }
        ]"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="hasDescription ? descriptionId : undefined"
        tabindex="-1"
        @click.stop
      >
        <!-- Modal Header -->
        <div v-if="hasHeader" class="modal-header">
          <div class="modal-title-section">
            <h2 v-if="title" :id="titleId" class="modal-title">
              <i v-if="icon" :class="['modal-icon', icon]" aria-hidden="true"></i>
              {{ title }}
            </h2>
            <slot name="title"></slot>
          </div>

          <div class="modal-header-actions">
            <slot name="header-actions"></slot>
            <button
              v-if="closable"
              type="button"
              class="modal-close-btn"
              :aria-label="closeLabel"
              @click="handleClose"
            >
              <AppIcon name="mdi-close-circle-outline" />
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div
          class="modal-body"
          :class="{ 'modal-body-scrollable': scrollable,
                    'modal-body-no-header': !hasHeader,
                    'modal-body-no-footer': !hasFooter
          }"
        >
          <div v-if="hasDescription" :id="descriptionId" class="modal-description">
            {{ description }}
          </div>

          <!-- Content Guardrails -->
          <div class="modal-content-wrapper">
            <slot></slot>
          </div>
        </div>

        <!-- Modal Footer -->
        <div v-if="hasFooter" class="modal-footer">
          <slot name="footer">
            <div class="modal-footer-actions d-flex gap-2">
              <UnifiedButton
                v-if="cancelable"
                type="button"
                variant="outline"
                @click="handleCancel"
              >
                {{ cancelLabel }}
              </UnifiedButton>
              <UnifiedButton
                v-if="confirmable"
                type="button"
                variant="primary"
                :disabled="confirmDisabled"
                :class="{ 'btn-loading': confirmLoading }"
                @click="handleConfirm"
              >
                <span v-if="confirmLoading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                {{ confirmLabel }}
              </UnifiedButton>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed, onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

export default {
  name: 'ModalBase',
  components: {
    AppIcon,
    UnifiedButton
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    centered: {
      type: Boolean,
      default: true
    },
    scrollable: {
      type: Boolean,
      default: true
    },
    closable: {
      type: Boolean,
      default: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    cancelable: {
      type: Boolean,
      default: false
    },
    confirmable: {
      type: Boolean,
      default: false
    },
    cancelLabel: {
      type: String,
      default: 'Cancel'
    },
    confirmLabel: {
      type: String,
      default: 'Confirm'
    },
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    closeLabel: {
      type: String,
      default: 'Close modal'
    },
    preventBodyScroll: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'close', 'cancel', 'confirm', 'opened', 'closed'],
  setup(props, { emit, slots }) {
    const modalRef = ref(null);
    let previousActiveElement = null;

    const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);
    const descriptionId = computed(() => `modal-desc-${Math.random().toString(36).substr(2, 9)}`);

    const hasHeader = computed(() =>
      props.title || slots.title || props.closable || slots['header-actions']
    );

    const hasFooter = computed(() =>
      slots.footer || props.cancelable || props.confirmable
    );

    const hasDescription = computed(() => !!props.description);

    // Focus management
    const focusModal = async () => {
      await nextTick();
      if (modalRef.value) {
        previousActiveElement = document.activeElement;
        modalRef.value.focus();
      }
    };

    const restoreFocus = () => {
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
        previousActiveElement = null;
      }
    };

    // Modal state management
    watch(() => props.modelValue, async (newValue) => {
      if (newValue) {
        await focusModal();
        if (props.preventBodyScroll) {
          document.body.style.overflow = 'hidden';
        }
        emit('opened');
      } else {
        restoreFocus();
        if (props.preventBodyScroll) {
          document.body.style.overflow = '';
        }
        emit('closed');
      }
    });

    // Event handlers
    const handleClose = () => {
      emit('update:modelValue', false);
      emit('close');
    };

    const handleCancel = () => {
      emit('update:modelValue', false);
      emit('cancel');
    };

    const handleConfirm = () => {
      emit('confirm');
    };

    const handleBackdropClick = () => {
      if (props.closeOnBackdrop) {
        handleClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (props.closeOnEscape && event.key === 'Escape') {
        handleClose();
      }
    };

    // Cleanup on unmount
    onUnmounted(() => {
      if (props.preventBodyScroll) {
        document.body.style.overflow = '';
      }
      restoreFocus();
    });

    return {
      modalRef,
      titleId,
      descriptionId,
      hasHeader,
      hasFooter,
      hasDescription,
      handleClose,
      handleCancel,
      handleConfirm,
      handleBackdropClick,
      handleEscapeKey
    };
  }
};
</script>

<style scoped>
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-backdrop);
  z-index: var(--z-modal, 1050);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-backdrop-visible {
  opacity: 1;
  visibility: visible;
}

/* Modal Container */
.modal-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  transform: scale(0.9) translateY(-20px);
  transition: all var(--transition-smooth);
  position: relative;
  width: 100%;
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
}

.modal-backdrop-visible .modal-container {
  transform: scale(1) translateY(0);
}

/* Modal Sizes */
.modal-size-xs { max-width: 300px; }
.modal-size-sm { max-width: 400px; }
.modal-size-md { max-width: 500px; }
.modal-size-lg { max-width: 700px; }
.modal-size-xl { max-width: 900px; }
.modal-size-2xl { max-width: 1200px; }

.modal-fullscreen {
  max-width: none;
  max-height: none;
  width: calc(100vw - 2rem);
  height: calc(100vh - 2rem);
  border-radius: var(--border-radius-md);
}

.modal-centered {
  margin: auto;
}

/* Modal Header */
.modal-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  position: relative;
}

.modal-title-section {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.modal-icon {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--min-target-size);
  min-height: var(--min-target-size);
}

.modal-close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-close-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Modal Body */
.modal-body {
  padding: var(--spacing-lg);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body-scrollable {
  overflow-y: auto;
}

.modal-body-no-header {
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.modal-body-no-footer {
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

.modal-body-no-header.modal-body-no-footer {
  border-radius: var(--border-radius-lg);
}

.modal-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

/* Content Guardrails - Prevent overflow and ensure accessibility */
.modal-content-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content-wrapper > * {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Modal Footer */
.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
  flex-shrink: 0;
}

.modal-footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: var(--bg-primary-dark);
    border-color: var(--border-color-dark);
    box-shadow: var(--shadow-lg-dark);
  }

  .modal-header,
  .modal-footer {
    background: var(--bg-secondary-dark);
    border-color: var(--border-color-dark);
  }

  .modal-close-btn:hover {
    background: var(--bg-tertiary-dark);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-backdrop {
    padding: var(--spacing-md);
  }

  .modal-container {
    max-height: calc(100vh - 1rem);
  }

  .modal-fullscreen {
    width: calc(100vw - 1rem);
    height: calc(100vh - 1rem);
  }

  .modal-size-xs,
  .modal-size-sm,
  .modal-size-md,
  .modal-size-lg,
  .modal-size-xl,
  .modal-size-2xl {
    max-width: none;
    width: 100%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-md);
  }

  .modal-footer-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .modal-footer-actions > * {
    width: 100%;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .modal-container {
    border-width: 2px;
  }

  .modal-header,
  .modal-footer {
    border-width: 2px 0;
  }

  .modal-close-btn {
    border: 2px solid transparent;
  }

  .modal-close-btn:focus-visible {
    border-color: var(--color-focus-ring);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal-container {
    transition: none;
  }

  .modal-backdrop {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .modal-container {
    transform: none;
  }
}

/* Loading States */
.btn-loading {
  pointer-events: none;
  opacity: 0.7;
}

/* Focus Trap Support */
.modal-container:focus {
  outline: none;
}

/* Prevent content overflow */
.modal-body *:last-child {
  margin-bottom: 0;
}

/* Table responsiveness in modals */
.modal-body table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .modal-body table {
    font-size: 0.875rem;
  }
}
</style>
