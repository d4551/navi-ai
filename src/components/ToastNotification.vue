<template>
  <teleport to="body">
    <transition-group name="toast" tag="div" class="toast-container" appear>
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="[
          `toast-${toast.type}`,
          {
            'toast-dismissible': toast.dismissible,
            'toast-paused': toast.paused,
          },
        ]"
        role="alert"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <AppIcon :name="getIcon(toast.type)" />
          </div>
          <div class="toast-message">
            <div v-if="toast.title" class="toast-title">
              {{ toast.title }}
            </div>
            <div class="toast-text">
              {{ toast.message }}
            </div>
            <div
              v-if="toast.actions && toast.actions.length"
              class="toast-actions"
            >
              <button
                v-for="(action, idx) in toast.actions"
                :key="idx"
                class="toast-action-btn"
                type="button"
                @click="runAction(toast, action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
          <button
            v-if="toast.dismissible !== false"
            class="toast-close"
            aria-label="Close notification"
            @click="dismissToast(toast.id)"
          >
            <AppIcon name="mdi-close" />
          </button>
        </div>
        <div
          v-if="toast.duration > 0"
          class="toast-progress"
          :class="{ paused: toast.paused }"
          :style="{ animationDuration: `${toast.duration}ms` }"
        />
      </div>
    </transition-group>
  </teleport>
</template>

<script>
import { ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { reportError } from "@/utils/error";
import { useToast } from "@/composables/useToast";

export default {
  name: "ToastNotification",
  components: { AppIcon },
  setup() {
    // Use the canonical toast system for UI-level operations
    const { raw: toastInstance } = useToast();
    const toasts = ref([]);

    const dismissToast = (id) => {
      toastInstance.dismiss(id);
    };

    const pauseToast = (id) => {
      toastInstance.pauseToast?.(id);
      const toast = toasts.value.find((t) => t.id === id);
      if (toast) toast.paused = true;
    };

    const resumeToast = (id) => {
      toastInstance.resumeToast?.(id);
      const toast = toasts.value.find((t) => t.id === id);
      if (toast) toast.paused = false;
    };

    const runAction = (toast, action) => {
      try {
        action?.handler?.();
      } catch (e) {
        reportError("toast.action", e, { level: "warn" });
      }
      if (action?.dismiss !== false) {
        dismissToast(toast.id);
      }
    };

    const getIcon = (type) => {
      const icons = {
        success: "mdi mdi-check-circle-outline",
        error: "mdi mdi-alert-circle-outline",
        warning: "mdi mdi-alert",
        info: "mdi mdi-information",
      };
      return icons[type] || icons.info;
    };

    return {
      toasts,
      dismissToast,
      pauseToast,
      resumeToast,
      getIcon,
      runAction,
    };
  },
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 400px;
  pointer-events: none;
}

.toast-item {
  background: var(--glass-elevated-light);
  border-radius: var(--border-radius-lg);
  box-shadow:
    var(--glass-shadow-elevated),
    0 0 0 1px var(--glass-border-light);
  overflow: hidden;
  pointer-events: auto;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 1.1)) saturate(160%);
  -webkit-backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 1.1))
    saturate(160%);
  position: relative;
}
.toast-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 20%, var(--gaming-glow), transparent 60%),
    radial-gradient(circle at 85% 80%, var(--gaming-glow), transparent 65%);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.8;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}

.toast-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 2px;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-actions {
  margin-top: var(--spacing-xs);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.toast-action-btn {
  background: var(--bg-tertiary, rgba(0, 0, 0, 0.06));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  color: var(--text-primary);
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  line-height: 1.2;
  transition: all 0.15s ease;
}

.toast-action-btn:hover {
  background: var(--bg-secondary, rgba(0, 0, 0, 0.12));
}

.toast-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.toast-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  color: var(--text-muted);
  transition: all var(--transition-fast);
  font-size: 1.1rem;
}

.toast-close:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.toast-progress {
  height: 3px;
  background: currentColor;
  animation: toastProgress linear forwards;
  transform-origin: left;
}

.toast-progress.paused {
  animation-play-state: paused;
  opacity: 0.6;
}

@keyframes toastProgress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-success {
  color: var(--color-success);
  border-left-color: var(--color-success);
}

.toast-error {
  color: var(--color-danger);
  border-left-color: var(--color-danger);
}

.toast-warning {
  color: var(--color-warning);
  border-left-color: var(--color-warning);
}

.toast-info {
  color: var(--color-info);
  border-left-color: var(--color-info);
}

[data-theme="dark"] :deep(.toast-item),
:root:not([data-theme]) :deep(.toast-item) {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
  box-shadow:
    var(--glass-shadow-elevated-dark),
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none !important;
    animation: none !important;
  }

  .toast-item::before {
    animation: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .toast-item {
    background: var(--bg-primary) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  [data-theme="dark"] .toast-item {
    background: var(--dark-bg-primary) !important;
  }

  .toast-item::before {
  }
}

.toast-enter-active {
}

.toast-leave-active {
}

.toast-enter-from {
}

.toast-leave-to {
}

.toast-move {
}

  .toast-container {
    max-width: none;
  }

  .toast-content {
    padding: var(--spacing-sm);
  }

  .toast-title {
  }

  .toast-text {
  }
}

[data-theme="dark"] .toast-item,
:root:not([data-theme]) .toast-item {
  background: var(--bg-primary);
  border-color: currentColor;
}

[data-theme="dark"] .toast-title,
:root:not([data-theme]) .toast-title {
  color: var(--text-primary);
}

[data-theme="dark"] .toast-text,
:root:not([data-theme]) .toast-text {
  color: var(--text-secondary);
}

[data-theme="dark"] .toast-close,
:root:not([data-theme]) .toast-close {
  color: var(--text-muted);
}

[data-theme="dark"] .toast-close:hover,
:root:not([data-theme]) .toast-close:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (prefers-contrast: high) {
  .toast-item {
    border-style: solid;
  }
}
</style>
