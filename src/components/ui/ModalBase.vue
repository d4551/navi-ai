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
        :class="[
          `modal-size-${size}`,
          {
            'modal-fullscreen': fullscreen,
            'modal-centered': centered,
            'modal-scrollable': scrollable,
          },
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
              <i
                v-if="icon"
                :class="['modal-icon', icon]"
                aria-hidden="true"
              ></i>
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
          :class="{
            'modal-body-scrollable': scrollable,
            'modal-body-no-header': !hasHeader,
            'modal-body-no-footer': !hasFooter,
          }"
        >
          <div
            v-if="hasDescription"
            :id="descriptionId"
            class="modal-description"
          >
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
                <span
                  v-if="confirmLoading"
                  class="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                ></span>
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
import { computed, onMounted, ref, watch, onUnmounted, nextTick } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

export default {
  name: "ModalBase",
  components: {
    AppIcon,
    UnifiedButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: "md",
      validator: (value) =>
        ["xs", "sm", "md", "lg", "xl", "2xl"].includes(value),
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    centered: {
      type: Boolean,
      default: true,
    },
    scrollable: {
      type: Boolean,
      default: true,
    },
    closable: {
      type: Boolean,
      default: true,
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true,
    },
    closeOnEscape: {
      type: Boolean,
      default: true,
    },
    cancelable: {
      type: Boolean,
      default: false,
    },
    confirmable: {
      type: Boolean,
      default: false,
    },
    cancelLabel: {
      type: String,
      default: "Cancel",
    },
    confirmLabel: {
      type: String,
      default: "Confirm",
    },
    confirmDisabled: {
      type: Boolean,
      default: false,
    },
    confirmLoading: {
      type: Boolean,
      default: false,
    },
    closeLabel: {
      type: String,
      default: "Close modal",
    },
    preventBodyScroll: {
      type: Boolean,
      default: true,
    },
  },
  emits: [
    "update:modelValue",
    "close",
    "cancel",
    "confirm",
    "opened",
    "closed",
  ],
  setup(props, { emit, slots }) {
    const modalRef = ref(null);
    let previousActiveElement = null;

    const titleId = computed(
      () => `modal-title-${Math.random().toString(36).substr(2, 9)}`,
    );
    const descriptionId = computed(
      () => `modal-desc-${Math.random().toString(36).substr(2, 9)}`,
    );

    const hasHeader = computed(
      () =>
        props.title || slots.title || props.closable || slots["header-actions"],
    );

    const hasFooter = computed(
      () => slots.footer || props.cancelable || props.confirmable,
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
    watch(
      () => props.modelValue,
      async (newValue) => {
        if (newValue) {
          await focusModal();
          if (props.preventBodyScroll) {
            document.body.style.overflow = "hidden";
          }
          emit("opened");
        } else {
          restoreFocus();
          if (props.preventBodyScroll) {
            document.body.style.overflow = "";
          }
          emit("closed");
        }
      },
    );

    // Event handlers
    const handleClose = () => {
      emit("update:modelValue", false);
      emit("close");
    };

    const handleCancel = () => {
      emit("update:modelValue", false);
      emit("cancel");
    };

    const handleConfirm = () => {
      emit("confirm");
    };

    const handleBackdropClick = () => {
      if (props.closeOnBackdrop) {
        handleClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (props.closeOnEscape && event.key === "Escape") {
        handleClose();
      }
    };

    // Cleanup on unmount
    onUnmounted(() => {
      if (props.preventBodyScroll) {
        document.body.style.overflow = "";
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
      handleEscapeKey,
    };
  },
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  visibility: hidden;
  transition: all var(--transition-normal);
}

.modal-backdrop-visible {
  visibility: visible;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-smooth);
  position: relative;
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
}

.modal-backdrop-visible .modal-container {
}

.modal-size-xs {
}
.modal-size-sm {
}
.modal-size-md {
}
.modal-size-lg {
}
.modal-size-xl {
}
}

.modal-fullscreen {
  max-width: none;
  max-height: none;
  border-radius: var(--border-radius-md);
}

.modal-centered {
  margin: auto;
}

.modal-header {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  position: relative;
}

.modal-title-section {
}

.modal-title {
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
}

.modal-body {
  padding: var(--spacing-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body-scrollable {
  overflow-y: auto;
}

.modal-body-no-header {
}

.modal-body-no-footer {
}

.modal-body-no-header.modal-body-no-footer {
  border-radius: var(--border-radius-lg);
}

.modal-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.modal-content-wrapper {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

  word-wrap: break-word;
  overflow-wrap: break-word;
}

.modal-footer {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
}

.modal-footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

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

  .modal-backdrop {
    padding: var(--spacing-md);
  }

  .modal-container {
  }

  .modal-fullscreen {
  }

  .modal-size-xs,
  .modal-size-sm,
  .modal-size-md,
  .modal-size-lg,
  .modal-size-xl,
    max-width: none;
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

  }
}

@media (prefers-contrast: high) {
  .modal-container {
  }

  .modal-header,
  .modal-footer {
  }

  .modal-close-btn {
  }

  .modal-close-btn:focus-visible {
    border-color: var(--color-focus-ring);
  }
}

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

.btn-loading {
  pointer-events: none;
}

.modal-container:focus {
  outline: none;
}

}

.modal-body table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

  .modal-body table {
  }
}
</style>
