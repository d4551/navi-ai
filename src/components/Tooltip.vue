<template>
  <div
    class="tooltip-wrapper font-sans"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />
    <div
      v-if="visible"
      class="tooltip-content"
      :class="[`tooltip-${position}`, { 'tooltip-dark': dark }]"
      role="tooltip"
      :aria-describedby="tooltipId"
    >
      <slot name="content">
        {{ text }}
      </slot>
      <div class="tooltip-arrow" :class="`arrow-${position}`" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'

defineOptions({ name: "AppTooltip" });

const _props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "top",
    validator: (value) => ["top", "bottom", "left", "right"].includes(value),
  },
  dark: {
    type: Boolean,
    default: false,
  },
  delay: {
    type: Number,
    default: 300,
  },
});

const visible = ref(false);
const timeoutId = ref(null);

const tooltipId = computed(
  () => `tooltip-${Math.random().toString(36).substr(2, 9)}`,
);

const showTooltip = () => {
  clearTimeout(timeoutId.value);
  timeoutId.value = setTimeout(() => {
    visible.value = true;
  }, _props.delay);
};

const hideTooltip = () => {
  clearTimeout(timeoutId.value);
  visible.value = false;
};
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  position: absolute;
  z-index: var(--z-tooltip);
  padding: var(--space-2) var(--space-3);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow-glass-lg);
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  opacity: 0;
  animation: tooltipFadeIn var(--transition-fast) ease-out forwards;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-family: var(--font-family-ui);
  letter-spacing: 0.02em;
}

.tooltip-dark {
  background: var(--glass-bg);
  border-color: var(--glass-border-hover);
  box-shadow:
    var(--glass-shadow-glass-lg),
    0 0 20px rgba(var(--neon-blue), 0.1);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(var(--space-1));
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Positioning utilities using unified spacing */
.tooltip-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--space-2);
}

.tooltip-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--space-2);
}

.tooltip-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: var(--space-2);
}

.tooltip-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--space-2);
}

/* Glassmorphic arrow with subtle neon highlight */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  filter: drop-shadow(0 0 2px rgba(var(--neon-blue), 0.2));
}

.arrow-top {
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-l: 6px solid transparent;
  border-r: 6px solid transparent;
  border-t: 6px solid var(--glass-border);
}

.arrow-bottom {
  bottom: 100%;
  left: 50%;
  margin-left: -6px;
  border-l: 6px solid transparent;
  border-r: 6px solid transparent;
  border-b: 6px solid var(--glass-border);
}

.arrow-left {
  top: 50%;
  left: 100%;
  margin-top: -6px;
  border-t: 6px solid transparent;
  border-b: 6px solid transparent;
  border-l: 6px solid var(--glass-border);
}

.arrow-right {
  top: 50%;
  right: 100%;
  margin-top: -6px;
  border-t: 6px solid transparent;
  border-b: 6px solid transparent;
  border-r: 6px solid var(--glass-border);
}

/* Dark variant arrows with enhanced neon effect */
.tooltip-dark .arrow-top {
  border-t-color: var(--glass-border-hover);
  filter: drop-shadow(0 0 4px rgba(var(--neon-blue), 0.3));
}

.tooltip-dark .arrow-bottom {
  border-b-color: var(--glass-border-hover);
  filter: drop-shadow(0 0 4px rgba(var(--neon-blue), 0.3));
}

.tooltip-dark .arrow-left {
  border-l-color: var(--glass-border-hover);
  filter: drop-shadow(0 0 4px rgba(var(--neon-blue), 0.3));
}

.tooltip-dark .arrow-right {
  border-r-color: var(--glass-border-hover);
  filter: drop-shadow(0 0 4px rgba(var(--neon-blue), 0.3));
}

/* Responsive design using unified breakpoints */
@media (max-width: 768px) {
  .tooltip-content {
    font-size: var(--font-size-xs);
    padding: var(--space-1) var(--space-2);
    max-width: var(--w-xs);
    white-space: normal;
  }
}

/* Rich content helpers with unified theme integration */
.tooltip-content .rich {
  white-space: normal;
  max-width: var(--w-sm);
  line-height: var(--line-height-normal);
}

.tooltip-content .tooltip-title {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-1);
  display: block;
  color: var(--text-primary-600);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tooltip-content .badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.tooltip-content .cap-badge {
  background: rgba(var(--neon-blue), 0.15);
  color: rgb(var(--neon-blue));
  border: 1px solid rgba(var(--neon-blue), 0.3);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-shadow: 0 0 2px rgba(var(--neon-blue), 0.5);
}

.tooltip-content .tooltip-footer {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-2);
  opacity: 0.9;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
</style>
