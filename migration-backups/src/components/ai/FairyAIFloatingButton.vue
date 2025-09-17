<template>
  <div
    class="fairy-floating-button"
    :class="{ 'fairy-active': active, 'fairy-pulsing': !active }"
  >
    <button
      class="fairy-btn btn-rgb ui-btn ui-size-md"
      :aria-label="
        active ? 'Fairy AI is active' : 'Activate Fairy AI Assistant'
      "
      :title="
        active ? 'Fairy AI Chat Active' : 'Click to start AI conversation'
      "
      @click="$emit('activate')"
    >
      <div class="fairy-icon-container">
        <AppIcon
          :name="active ? 'mdi-chat-processing' : 'mdi-chat-outline'"
          class="fairy-icon"
        />
        <div class="fairy-glow"></div>
      </div>

      <!-- Activity indicator -->
      <div v-if="active" class="activity-ring"></div>

      <!-- Notification dot -->
      <div v-if="hasNotification" class="notification-dot"></div>
    </button>

    <!-- Quick tooltip -->
    <div
      class="fairy-tooltip glass-surface"
      :class="{ 'tooltip-visible': showTooltip }"
    >
      <p class="tooltip-text">{{ tooltipText }}</p>
      <div class="tooltip-arrow"></div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

import {
  ref,
  onMounted,
  computed,
  onUnmounted,
  defineEmits,
  defineProps,
} from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  hasNotification: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['activate'])

const showTooltip = ref(false)
const tooltipTimeout = ref(null)

const tooltipText = computed(() => {
  if (props.active) {
    return 'Fairy AI is ready to help!'
  }
  return 'Click to start AI conversation'
})

// Show tooltip on first load
onMounted(() => {
  setTimeout(() => {
    showTooltip.value = true

    // Auto-hide after 3 seconds
    tooltipTimeout.value = setTimeout(() => {
      showTooltip.value = false
    }, 3000)
  }, 1000)
})

onUnmounted(() => {
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
  }
})
</script>

<style scoped>
.fairy-floating-button {
  position: fixed;
  bottom: var(--spacing-10); /* Use design system variable */
  right: var(--spacing-8); /* Use design system variable */
  z-index: var(--z-navigation); /* Use design system variable */
}

.fairy-btn {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full); /* Use design system variable */
  border: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
  background: var(--glass-surface-elevated); /* Use design system variable */
  backdrop-filter: var(
    --glass-backdrop-blur-medium
  ); /* Use design system variable */
  border: 2px solid var(--glass-border-accent); /* Use design system variable */
  box-shadow:
    var(--glass-shadow-md), var(--glass-glow-primary); /* Use design system variables */
  overflow: hidden;
}

.fairy-btn:hover {
  transform: scale(1.1);
  box-shadow:
    var(--glass-shadow-lg), var(--glass-glow-primary); /* Use design system variables */
}

.fairy-btn:active {
  transform: scale(0.95);
}

.fairy-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fairy-icon {
  font-size: var(--font-size-2xl); /* Use design system variable */
  color: var(--color-primary-500); /* Use design system variable */
  transition: all var(--duration-fast) var(--easing-ease-out); /* Use design system variables */
  position: relative;
  z-index: 2;
}

.fairy-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(
    circle,
    var(--color-primary-500) 0%,
    transparent 70%
  ); /* Use design system variable */
  border-radius: var(--radius-full); /* Use design system variable */
  opacity: 0;
  transition: opacity var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
  animation: pulseGlow 2s ease-in-out infinite;
}

.fairy-active .fairy-glow {
  opacity: 0.5;
  animation: vibrantGlow 2s ease-in-out infinite alternate;
}

.fairy-active .fairy-btn {
  border-color: var(--color-gaming-500); /* Use design system variable */
  box-shadow:
    var(--glass-shadow-md),
    var(--glass-glow-gaming),
    0 0 60px rgba(0, 255, 127, 0.3); /* Keep specific glow for gaming */
  background: radial-gradient(
    circle at center,
    rgba(0, 255, 127, 0.1) 0%,
    var(--glass-bg-strong) 70%
  ); /* Use design system variable */
}

.fairy-active .fairy-icon {
  color: var(--color-gaming-500); /* Use design system variable */
  text-shadow: 0 0 10px rgba(0, 255, 127, 0.8);
}

.fairy-pulsing .fairy-btn {
  animation: gentlePulse 3s ease-in-out infinite;
}

.activity-ring {
  position: absolute;
  inset: -12px;
  border: 3px solid transparent;
  border-radius: var(--radius-full); /* Use design system variable */
  background: conic-gradient(
    from 0deg,
    var(--color-gaming-500) 0deg,
    var(--color-gaming-500) 60deg,
    var(--color-gaming-400) 120deg,
    var(--color-gaming-500) 180deg,
    var(--color-gaming-600) 240deg,
    var(--color-gaming-500) 360deg
  ); /* Use design system variables */
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    white calc(100% - 3px)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    white calc(100% - 3px)
  );
  animation: vibrantRingSpin 1.5s linear infinite;
  box-shadow:
    var(--glass-glow-gaming),
    inset 0 0 10px rgba(0, 255, 127, 0.3);
}

.notification-dot {
  position: absolute;
  top: var(--spacing-2); /* Use design system variable */
  right: var(--spacing-2); /* Use design system variable */
  width: 12px;
  height: 12px;
  background: var(--color-error-500); /* Use design system variable */
  border: 2px solid var(--surface-base); /* Use design system variable */
  border-radius: var(--radius-full); /* Use design system variable */
  animation: notificationPulse 1.5s ease-in-out infinite;
}

/* Tooltip */
.fairy-tooltip {
  position: absolute;
  bottom: calc(100% + var(--spacing-4)); /* Use design system variable */
  right: 0;
  padding: var(--spacing-3) var(--spacing-4); /* Use design system variables */
  border-radius: var(--radius-md); /* Use design system variable */
  min-width: 200px;
  opacity: 0;
  transform: translateY(var(--spacing-2)); /* Use design system variable */
  transition: all var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
  pointer-events: none;
  background: var(--glass-surface); /* Use design system variable */
  border: 1px solid var(--glass-border); /* Use design system variable */
  box-shadow: var(--glass-shadow-md); /* Use design system variable */
  backdrop-filter: var(
    --glass-backdrop-blur-light
  ); /* Use design system variable */
}

.tooltip-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.tooltip-text {
  margin: 0;
  font-size: var(--font-size-sm); /* Use design system variable */
  color: var(--text-primary); /* Use design system variable */
  text-align: center;
}

.tooltip-arrow {
  position: absolute;
  top: 100%;
  right: var(--spacing-5); /* Use design system variable */
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--glass-surface); /* Use design system variable */
}

/* Animations */
@keyframes gentlePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      var(--glass-shadow-md), var(--glass-glow-primary); /* Use design system variables */
  }
  50% {
    transform: scale(1.05);
    box-shadow:
      var(--glass-shadow-lg), var(--glass-glow-primary); /* Use design system variables */
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.2);
  }
}

@keyframes vibrantGlow {
  0% {
    opacity: 0.3;
    transform: scale(1);
    background: radial-gradient(
      circle,
      rgba(0, 255, 127, 0.4) 0%,
      transparent 70%
    );
  }
  100% {
    opacity: 0.7;
    transform: scale(1.4);
    background: radial-gradient(
      circle,
      rgba(0, 255, 127, 0.6) 0%,
      rgba(50, 255, 150, 0.3) 40%,
      transparent 70%
    );
  }
}

@keyframes vibrantRingSpin {
  0% {
    transform: rotate(0deg);
    filter: hue-rotate(0deg);
  }
  25% {
    filter: hue-rotate(15deg);
  }
  50% {
    filter: hue-rotate(-10deg);
  }
  75% {
    filter: hue-rotate(20deg);
  }
  100% {
    transform: rotate(360deg);
    filter: hue-rotate(0deg);
  }
}

@keyframes notificationPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .fairy-floating-button {
    bottom: var(--spacing-8); /* Use design system variable */
    right: var(--spacing-4); /* Use design system variable */
  }

  .fairy-btn {
    width: 56px;
    height: 56px;
  }

  .fairy-icon {
    font-size: var(--font-size-xl); /* Use design system variable */
  }

  .fairy-tooltip {
    right: calc(-1 * var(--spacing-12)); /* Use design system variable */
    min-width: 160px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .fairy-btn,
  .fairy-glow,
  .activity-ring,
  .notification-dot {
    animation: none !important;
  }

  .fairy-btn:hover {
    transform: none;
  }
}
</style>
