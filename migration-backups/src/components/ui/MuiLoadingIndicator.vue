<template>
  <div :class="loadingClasses">
    <div class="mui-loading-container">
      <!-- Circular Progress -->
      <svg
        v-if="type === 'circular'"
        :class="['mui-circular-progress', `mui-circular-${color}`]"
        :width="size"
        :height="size"
        viewBox="22 22 44 44"
        role="progressbar"
        :aria-label="ariaLabel || 'Loading content'"
      >
        <circle
          class="mui-circular-progress-track"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          stroke-width="3.6"
        />
        <circle
          class="mui-circular-progress-bar"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          stroke-width="3.6"
          stroke-linecap="round"
          :style="progressStyle"
        />
      </svg>

      <!-- Linear Progress -->
      <div
        v-else-if="type === 'linear'"
        :class="['mui-linear-progress', `mui-linear-${color}`]"
        role="progressbar"
        :aria-label="ariaLabel || 'Loading content'"
        :aria-valuenow="determinate ? progress : undefined"
        :aria-valuemin="determinate ? 0 : undefined"
        :aria-valuemax="determinate ? 100 : undefined"
      >
        <div class="mui-linear-progress-bar">
          <div
            class="mui-linear-progress-primary"
            :style="linearProgressStyle"
          ></div>
          <div v-if="!determinate" class="mui-linear-progress-secondary"></div>
        </div>
      </div>

      <!-- Skeleton Loading -->
      <div
        v-else-if="type === 'skeleton'"
        :class="['mui-skeleton', `mui-skeleton-${variant}`]"
      >
        <div class="mui-skeleton-wave"></div>
      </div>

      <!-- Dots Loading -->
      <div v-else-if="type === 'dots'" class="mui-dots-loading">
        <div
          v-for="n in 3"
          :key="n"
          class="mui-dot"
          :style="{ animationDelay: `${(n - 1) * 0.2}s` }"
        ></div>
      </div>

      <!-- Pulse Loading -->
      <div v-else-if="type === 'pulse'" class="mui-pulse-loading">
        <div class="mui-pulse-circle"></div>
      </div>

      <!-- Loading text -->
      <div v-if="text" class="mui-loading-text">
        {{ text }}
      </div>
    </div>

    <!-- Backdrop for overlay loading -->
    <div
      v-if="overlay"
      class="mui-loading-backdrop"
      @click="handleBackdropClick"
    ></div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'MuiLoadingIndicator',
  props: {
    type: {
      type: String,
      default: 'circular',
      validator: value =>
        ['circular', 'linear', 'skeleton', 'dots', 'pulse'].includes(value),
    },
    variant: {
      type: String,
      default: 'text',
      validator: value => ['text', 'rectangular', 'circular'].includes(value),
    },
    color: {
      type: String,
      default: 'primary',
      validator: value =>
        [
          'primary',
          'secondary',
          'success',
          'warning',
          'error',
          'info',
        ].includes(value),
    },
    size: {
      type: [Number, String],
      default: 40,
    },
    thickness: {
      type: Number,
      default: 3.6,
    },
    progress: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 100,
    },
    determinate: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
    overlay: {
      type: Boolean,
      default: false,
    },
    center: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    ariaLabel: {
      type: String,
      default: '',
    },
  },
  emits: ['backdrop-click'],
  setup(props, { emit }) {
    const loadingClasses = computed(() => [
      'mui-loading',
      {
        'mui-loading-overlay': props.overlay,
        'mui-loading-center': props.center,
        'mui-loading-fullscreen': props.fullscreen,
      },
    ])

    const progressStyle = computed(() => {
      if (props.determinate) {
        const circumference = 2 * Math.PI * 20.2
        const offset = circumference - (props.progress / 100) * circumference
        return {
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transition: 'stroke-dashoffset 0.3s ease-in-out',
        }
      }
      return {}
    })

    const linearProgressStyle = computed(() => {
      if (props.determinate) {
        return {
          transform: `translateX(-${100 - props.progress}%)`,
        }
      }
      return {}
    })

    const handleBackdropClick = () => {
      emit('backdrop-click')
    }

    return {
      loadingClasses,
      progressStyle,
      linearProgressStyle,
      handleBackdropClick,
    }
  },
}
</script>

<style scoped>
.mui-loading {
  font-family: 'Electrolize', 'Roboto', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mui-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mui-loading-center {
  position: absolute; /* Use .center-absolute class from design system */
}

.mui-loading-fullscreen {
  width: 100vw;
  height: 100vh;
}

.mui-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.mui-loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-surface, rgba(0, 0, 0, 0.3));
  backdrop-filter: blur(4px);
}

/* Circular Progress */
.mui-circular-progress {
  animation: mui-rotate 1.4s linear infinite;
}

.mui-circular-progress-track {
  stroke: var(--glass-border, rgba(0, 0, 0, 0.1));
  opacity: 0.3;
}

.mui-circular-progress-bar {
  stroke-dasharray: 80px, 200px;
  stroke-dashoffset: 0px;
  animation: mui-dash 1.4s ease-in-out infinite;
}

.mui-circular-primary .mui-circular-progress-bar {
  stroke: var(--color-primary, #6366f1);
}

.mui-circular-secondary .mui-circular-progress-bar {
  stroke: var(--color-secondary, #06d6a0);
}

.mui-circular-success .mui-circular-progress-bar {
  stroke: var(--color-success, #10b981);
}

.mui-circular-warning .mui-circular-progress-bar {
  stroke: var(--color-warning, #f59e0b);
}

.mui-circular-error .mui-circular-progress-bar {
  stroke: var(--color-danger, #ef4444);
}

.mui-circular-info .mui-circular-progress-bar {
  stroke: var(--color-info, #06b6d4);
}

/* Linear Progress */
.mui-linear-progress {
  height: 4px;
  width: 100%;
  min-width: 200px;
  border-radius: 2px;
  background-color: var(--glass-border, rgba(0, 0, 0, 0.1));
  overflow: hidden;
  position: relative;
}

.mui-linear-progress-bar {
  height: 100%;
  position: relative;
}

.mui-linear-progress-primary .mui-linear-progress-primary,
.mui-linear-progress-primary .mui-linear-progress-secondary {
  background-color: var(--color-primary, #6366f1);
}

.mui-linear-progress-secondary .mui-linear-progress-primary,
.mui-linear-progress-secondary .mui-linear-progress-secondary {
  background-color: var(--color-secondary, #06d6a0);
}

.mui-linear-progress-success .mui-linear-progress-primary,
.mui-linear-progress-success .mui-linear-progress-secondary {
  background-color: var(--color-success, #10b981);
}

.mui-linear-progress-warning .mui-linear-progress-primary,
.mui-linear-progress-warning .mui-linear-progress-secondary {
  background-color: var(--color-warning, #f59e0b);
}

.mui-linear-progress-error .mui-linear-progress-primary,
.mui-linear-progress-error .mui-linear-progress-secondary {
  background-color: var(--color-danger, #ef4444);
}

.mui-linear-progress-info .mui-linear-progress-primary,
.mui-linear-progress-info .mui-linear-progress-secondary {
  background-color: var(--color-info, #06b6d4);
}

.mui-linear-progress-primary {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  transform: translateX(-100%);
  animation: mui-indeterminate1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395)
    infinite;
}

.mui-linear-progress-secondary {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  transform: translateX(-100%);
  animation: mui-indeterminate2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
  animation-delay: 1.15s;
}

/* Skeleton Loading */
.mui-skeleton {
  background-color: var(--glass-surface, rgba(0, 0, 0, 0.11));
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 1.2em;
}

.mui-skeleton-rectangular {
  border-radius: 0;
  height: 100px;
}

.mui-skeleton-circular {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.mui-skeleton-wave {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--glass-elevated, rgba(255, 255, 255, 0.4)),
    transparent
  );
  animation: mui-skeleton-wave 1.6s linear infinite;
}

[data-theme='dark'] .mui-skeleton {
  background-color: var(--glass-surface, rgba(255, 255, 255, 0.13));
}

[data-theme='dark'] .mui-skeleton-wave {
  background: linear-gradient(
    90deg,
    transparent,
    var(--glass-elevated, rgba(255, 255, 255, 0.08)),
    transparent
  );
}

/* Dots Loading */
.mui-dots-loading {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mui-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary, #6366f1);
  animation: mui-dot-bounce 1.4s infinite ease-in-out both;
}

/* Pulse Loading */
.mui-pulse-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mui-pulse-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary, #6366f1);
  animation: mui-pulse 1.5s infinite;
}

/* Loading Text */
.mui-loading-text {
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
  font-size: 0.875rem;
  margin-top: 8px;
  text-align: center;
  letter-spacing: 0.5px;
}

[data-theme='dark'] .mui-loading-text {
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

/* Animations */
@keyframes mui-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes mui-dash {
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0px;
  }
  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
}

@keyframes mui-indeterminate1 {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes mui-indeterminate2 {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}

@keyframes mui-skeleton-wave {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes mui-dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes mui-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .mui-circular-progress,
  .mui-linear-progress-primary,
  .mui-linear-progress-secondary,
  .mui-skeleton-wave,
  .mui-dot,
  .mui-pulse-circle {
    animation: none;
  }

  .mui-circular-progress-bar {
    stroke-dasharray: 80px, 200px;
    stroke-dashoffset: -40px;
  }

  .mui-linear-progress-primary {
    transform: translateX(-50%);
  }

  .mui-skeleton-wave {
    display: none;
  }
}
</style>
