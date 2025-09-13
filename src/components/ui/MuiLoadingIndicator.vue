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
import { computed } from "vue";

export default {
  name: "MuiLoadingIndicator",
  props: {
    type: {
      type: String,
      default: "circular",
      validator: (value) =>
        ["circular", "linear", "skeleton", "dots", "pulse"].includes(value),
    },
    variant: {
      type: String,
      default: "text",
      validator: (value) => ["text", "rectangular", "circular"].includes(value),
    },
    color: {
      type: String,
      default: "primary",
      validator: (value) =>
        [
          "primary",
          "secondary",
          "success",
          "warning",
          "error",
          "info",
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
      validator: (value) => value >= 0 && value <= 100,
    },
    determinate: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "",
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
      default: "",
    },
  },
  emits: ["backdrop-click"],
  setup(props, { emit }) {
    const loadingClasses = computed(() => [
      "mui-loading",
      {
        "mui-loading-overlay": props.overlay,
        "mui-loading-center": props.center,
        "mui-loading-fullscreen": props.fullscreen,
      },
    ]);

    const progressStyle = computed(() => {
      if (props.determinate) {
        const circumference = 2 * Math.PI * 20.2;
        const offset = circumference - (props.progress / 100) * circumference;
        return {
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transition: "stroke-dashoffset 0.3s ease-in-out",
        };
      }
      return {};
    });

    const linearProgressStyle = computed(() => {
      if (props.determinate) {
        return {
          transform: `translateX(-${100 - props.progress}%)`,
        };
      }
      return {};
    });

    const handleBackdropClick = () => {
      emit("backdrop-click");
    };

    return {
      loadingClasses,
      progressStyle,
      linearProgressStyle,
      handleBackdropClick,
    };
  },
};
</script>

<style scoped>
.mui-loading {
  font-family: "Electrolize", "Roboto", sans-serif;
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

.mui-circular-progress {
}

.mui-circular-progress-track {
}

.mui-circular-progress-bar {
}

.mui-circular-primary .mui-circular-progress-bar {
}

.mui-circular-secondary .mui-circular-progress-bar {
}

.mui-circular-success .mui-circular-progress-bar {
}

.mui-circular-warning .mui-circular-progress-bar {
}

.mui-circular-error .mui-circular-progress-bar {
}

.mui-circular-info .mui-circular-progress-bar {
}

.mui-linear-progress {
  overflow: hidden;
  position: relative;
}

.mui-linear-progress-bar {
  position: relative;
}

.mui-linear-progress-primary .mui-linear-progress-primary,
.mui-linear-progress-primary .mui-linear-progress-secondary {
}

.mui-linear-progress-secondary .mui-linear-progress-primary,
.mui-linear-progress-secondary .mui-linear-progress-secondary {
}

.mui-linear-progress-success .mui-linear-progress-primary,
.mui-linear-progress-success .mui-linear-progress-secondary {
}

.mui-linear-progress-warning .mui-linear-progress-primary,
.mui-linear-progress-warning .mui-linear-progress-secondary {
}

.mui-linear-progress-error .mui-linear-progress-primary,
.mui-linear-progress-error .mui-linear-progress-secondary {
}

.mui-linear-progress-info .mui-linear-progress-primary,
.mui-linear-progress-info .mui-linear-progress-secondary {
}

.mui-linear-progress-primary {
  position: absolute;
    infinite;
}

.mui-linear-progress-secondary {
  position: absolute;
}

.mui-skeleton {
  position: relative;
  overflow: hidden;
}

.mui-skeleton-rectangular {
}

.mui-skeleton-circular {
}

.mui-skeleton-wave {
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
}

[data-theme="dark"] .mui-skeleton {
}

[data-theme="dark"] .mui-skeleton-wave {
  background: linear-gradient(
    transparent,
    transparent
  );
}

.mui-dots-loading {
  display: flex;
  align-items: center;
}

.mui-dot {
}

.mui-pulse-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mui-pulse-circle {
}

.mui-loading-text {
  text-align: center;
}

[data-theme="dark"] .mui-loading-text {
}

@keyframes mui-rotate {
  }
  }
}

@keyframes mui-dash {
  }
  }
  }
}

  }
  }
  }
}

  }
  }
  }
}

@keyframes mui-skeleton-wave {
  }
  }
  }
}

@keyframes mui-dot-bounce {
  }
  }
}

@keyframes mui-pulse {
  }
  }
  }
}

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
  }

  .mui-linear-progress-primary {
  }

  .mui-skeleton-wave {
    display: none;
  }
}
</style>
