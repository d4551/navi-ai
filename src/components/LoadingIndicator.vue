<template>
  <div v-if="show" class="loading-overlay" :class="{ fullscreen: fullscreen }" class="font-sans">
    <div class="loading-content glass-strong p-glass-lg rounded-xl text-center">
      <div class="spinner-container">
        <div class="spinner" :class="size" />
        <div class="spinner-glow" :class="size" />
      </div>

      <div v-if="message" class="loading-message text-glass-enhanced font-medium mt-4">
        {{ message }}
      </div>

      <div v-if="progress !== null" class="progress-container">
        <div class="progress">
          <div
            class="progress-bar"
            :style="{ width: `${progress}%` }"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
        <small class="text-secondary">{{ progress }}%</small>
      </div>

      <div v-if="showCancel" class="mt-3">
        <UnifiedButton variant="outline" size="sm" @click="$emit('cancel')">Cancel</UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script>
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
export default {
  name: "LoadingIndicator",
  components: { UnifiedButton },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "Loading...",
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "medium",
      validator: (value) => ["small", "medium", "large"].includes(value),
    },
    progress: {
      type: Number,
      default: null,
    },
    showCancel: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["cancel"],
};
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: inherit;
}

.loading-overlay.fullscreen {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.loading-content {
  text-align: center;
  padding: 2rem;
  max-width: 300px;
}

.spinner-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
  border-style: solid;
  border-color: var(--color-primary) transparent transparent transparent;
}

.spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.spinner.medium {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.spinner.large {
  width: 56px;
  height: 56px;
  border-width: 5px;
}

.spinner-glow {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  border: 2px solid var(--color-primary);
  opacity: 0.3;
}

.spinner-glow.small {
  width: 24px;
  height: 24px;
}

.spinner-glow.medium {
  width: 40px;
  height: 40px;
}

.spinner-glow.large {
  width: 56px;
  height: 56px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

.loading-message {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-weight: 500;
}

.progress-container {
  width: 200px;
  margin: 0 auto;
}

.progress {
  height: 8px;
  border-radius: 4px;
  background-color: var(--bg-tertiary);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background-color: rgba(26, 26, 26, 0.9);
  }

  .loading-overlay.fullscreen {
    background-color: rgba(26, 26, 26, 0.95);
  }

  .loading-message {
    color: var(--text-primary-600);
  }

  .progress {
    background-color: var(--bg-tertiary);
  }

  .text-secondary {
    color: var(--text-secondary) !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    border-color: var(--color-primary);
  }

  .spinner-glow {
    animation: none;
    opacity: 0.2;
  }

  .progress-bar {
    transition: none;
  }
}
</style>
