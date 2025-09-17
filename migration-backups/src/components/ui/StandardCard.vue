<template>
  <div :class="cardClasses" class="standard-card">
    <div v-if="$slots.title" class="card-title">
      <slot name="title" />
    </div>
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnifiedUI } from '@/composables/useUnifiedUI'

interface Props {
  variant?: 'default' | 'gaming' | 'glass' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  interactive: false,
})

const { getCardClasses } = useUnifiedUI()

const cardClasses = computed(() => {
  const baseClasses = getCardClasses(props.variant)
  return [
    ...baseClasses,
    `standard-card--${props.variant}`,
    `standard-card--${props.size}`,
    { 'standard-card--interactive': props.interactive },
  ]
})
</script>

<style scoped>
/* Base card styling using unified design system */
.standard-card {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-out);
  overflow: hidden;
}

/* Variant styles */
.standard-card--gaming {
  background:
    linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.1),
      rgba(139, 69, 19, 0.05),
      rgba(0, 255, 136, 0.05)
    ),
    var(--surface-base);
  border-color: var(--color-gaming-200);
  backdrop-filter: var(--glass-backdrop-blur);
}

.standard-card--glass {
  background: var(--glass-surface);
  border-color: var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
}

.standard-card--elevated {
  box-shadow: var(--shadow-lg);
  transform: translateY(0);
}

.standard-card--elevated:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

/* Size variants */
.standard-card--sm .card-title {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.standard-card--sm .card-content {
  padding: var(--spacing-md);
}

.standard-card--md .card-title {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
}

.standard-card--md .card-content {
  padding: var(--spacing-lg);
}

.standard-card--lg .card-title {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.standard-card--lg .card-content {
  padding: var(--spacing-xl);
}

/* Interactive state */
.standard-card--interactive {
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.standard-card--interactive:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.standard-card--interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Card title */
.card-title {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background: var(--surface-elevated);
  margin: 0;
}

.standard-card--gaming .card-title {
  border-bottom-color: var(--color-gaming-200);
  color: var(--text-primary);
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(0, 255, 136, 0.02)),
    var(--surface-elevated);
}

.standard-card--glass .card-title {
  border-bottom-color: var(--glass-border);
  background: var(--glass-surface-elevated);
  backdrop-filter: var(--glass-backdrop-blur);
}

/* Card content */
.card-content {
  padding: var(--spacing-lg);
  color: var(--text-primary);
}

/* Dark theme support */
[data-theme='dark'] .standard-card {
  background: var(--surface-base);
  border-color: var(--border-base);
}

[data-theme='dark'] .standard-card--gaming {
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(0, 255, 136, 0.08)),
    var(--surface-base);
  border-color: var(--color-gaming-300);
}

[data-theme='dark'] .card-title {
  background: var(--surface-elevated);
  border-bottom-color: var(--border-base);
  color: var(--text-primary);
}

/* Responsive design */
@media (max-width: 768px) {
  .standard-card--lg .card-title,
  .standard-card--lg .card-content {
    padding: var(--spacing-md);
  }

  .standard-card--md .card-title,
  .standard-card--md .card-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .standard-card {
    border-radius: var(--radius-md);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .standard-card,
  .standard-card--interactive,
  .standard-card--elevated {
    transition: none;
  }
}

/* High contrast support */
@media (prefers-contrast: high) {
  .standard-card {
    border-width: 2px;
  }

  .card-title {
    border-bottom-width: 2px;
  }
}
</style>
