<template>
  <Teleport to="body" class="font-sans ">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-glass-md md:p-glass-lg bg-overlay backdrop-blur-sm transition-all duration-300"
      :class="{ 'opacity-100 visible': modelValue, 'opacity-0 invisible': !modelValue }"
      @click="handleBackdropClick"
      @keydown.escape="handleEscapeKey"
    >
      <div
        ref="modalRef"
        class="glass-modal flex flex-col max-h-[calc(100vh-2rem)] w-full transition-all duration-300 ease-out transform relative"
        :class="[
          sizeClasses,
          {
            'max-w-none max-h-none w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] rounded-md': fullscreen,
            'mx-auto': centered,
            'overflow-hidden': !scrollable
          },
          modelValue ? 'scale-100 translate-y-0' : 'scale-90 -translate-y-5'
        ]"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="hasDescription ? descriptionId : undefined"
        tabindex="-1"
        @click.stop
      >
        <!-- Modal Header -->
        <div v-if="hasHeader" class="flex items-center justify-between flex-shrink-0 p-glass-lg border-b border-glass bg-glass-bg-hover rounded-t-lg">
          <div class="flex-1 min-w-0">
            <h2 v-if="title" :id="titleId" class="flex items-center gap-glass-md m-0 text-lg font-semibold text-glass-primary">
              <i v-if="icon" :class="['text-xl text-primary-500', icon]" aria-hidden="true"></i>
              {{ title }}
            </h2>
            <slot name="title"></slot>
          </div>

          <div class="flex items-center gap-glass-md flex-shrink-0">
            <slot name="header-actions"></slot>
            <button
              v-if="closable"
              type="button"
              class="glass-modal-close-btn flex items-center justify-center min-w-11 min-h-11 p-glass-sm text-secondary cursor-pointer rounded-md transition-all duration-200"
              :aria-label="closeLabel"
              @click="handleClose"
            >
              <AppIcon name="XMarkIcon-circle-outline" />
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div
          class="flex-1 p-glass-lg overflow-hidden flex flex-col"
          :class="{
            'overflow-y-auto': scrollable,
            'rounded-t-lg': !hasHeader,
            'rounded-b-lg': !hasFooter,
            'rounded-lg': !hasHeader && !hasFooter
          }"
        >
          <div v-if="hasDescription" :id="descriptionId" class="mb-4 text-sm text-secondary">
            {{ description }}
          </div>

          <!-- Content Guardrails -->
          <div class="flex-1 overflow-hidden flex flex-col">
            <slot></slot>
          </div>
        </div>

        <!-- Modal Footer -->
        <div v-if="hasFooter" class="flex-shrink-0 p-glass-lg border-t border-glass bg-glass-bg-hover rounded-b-lg">
          <slot name="footer">
            <div class="flex items-center justify-end gap-glass-md md:flex-row flex-col-reverse">
              <UnifiedButton
                v-if="cancelable"
                type="button"
                variant="outline"
                class="md:w-auto w-full"
                @click="handleCancel"
              >
                {{ cancelLabel }}
              </UnifiedButton>
              <UnifiedButton
                v-if="confirmable"
                type="button"
                variant="primary"
                :disabled="confirmDisabled"
                :loading="confirmLoading"
                class="md:w-auto w-full"
                @click="handleConfirm"
              >
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
import { XMarkIcon } from '@heroicons/vue/24/outline'

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

    // Size classes for modal container
    const sizeClasses = computed(() => {
      const sizeMap = {
        xs: 'max-w-sm',
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl'
      };
      return sizeMap[props.size] || 'max-w-lg';
    });

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
      sizeClasses,
      handleClose,
      handleCancel,
      handleConfirm,
      handleBackdropClick,
      handleEscapeKey
    };
  }
};
</script>

