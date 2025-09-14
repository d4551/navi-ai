<template>
  <div
    class="tooltip-wrapper"
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
  }, props.delay);
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
  z-index: 9999;
  padding: 8px 12px;
  background-color: var(--text-primary);
  color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  animation: tooltipFadeIn 0.2s ease-out forwards;
  backdrop-filter: blur(8px);
}

.tooltip-dark {
  background-color: var(--glass-surface-dark);
  color: var(--text-primary);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tooltip-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.tooltip-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.tooltip-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.tooltip-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.arrow-top {
  top: 100%;
  left: 50%;
  margin-left: -4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--text-primary);
}

.arrow-bottom {
  bottom: 100%;
  left: 50%;
  margin-left: -4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid var(--text-primary);
}

.arrow-left {
  top: 50%;
  left: 100%;
  margin-top: -4px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 4px solid var(--text-primary);
}

.arrow-right {
  top: 50%;
  right: 100%;
  margin-top: -4px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-right: 4px solid var(--text-primary);
}

.tooltip-dark .arrow-top {
  border-top-color: var(--glass-surface-dark);
}

.tooltip-dark .arrow-bottom {
  border-bottom-color: var(--glass-surface-dark);
}

.tooltip-dark .arrow-left {
  border-left-color: var(--glass-surface-dark);
}

.tooltip-dark .arrow-right {
  border-right-color: var(--glass-surface-dark);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tooltip-content {
    font-size: 0.8rem;
    padding: 6px 10px;
    max-width: 200px;
    white-space: normal;
  }
}

/* Rich content helpers */
.tooltip-content .rich { white-space: normal; max-width: 320px; }
.tooltip-content .tooltip-title { font-weight: 700; margin-bottom: 6px; display: block; }
.tooltip-content .badges { display: flex; flex-wrap: wrap; gap: 6px; }
.tooltip-content .cap-badge { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 999px; padding: 2px 8px; font-size: 0.75rem; font-weight: 600; }
.tooltip-content .tooltip-footer { display:flex; align-items:center; gap:6px; margin-top: 8px; opacity: 0.9; font-size: 0.75rem; }
</style>
