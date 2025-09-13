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
import { computed } from "vue";
import { useUnifiedUI } from "@/composables/useUnifiedUI";

interface Props {
  variant?: "default" | "gaming" | "glass" | "elevated";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  interactive: false,
});

const { getCardClasses } = useUnifiedUI();

const cardClasses = computed(() => {
  const baseClasses = getCardClasses(props.variant);
  return [
    ...baseClasses,
    `standard-card--${props.variant}`,
    `standard-card--${props.size}`,
    { "standard-card--interactive": props.interactive },
  ];
});
</script>

<style scoped>
.standard-card {
  background: var(--surface-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-out);
  overflow: hidden;
}

.standard-card--gaming {
  background:
    linear-gradient(
    ),
    var(--surface-base);
  backdrop-filter: var(--glass-backdrop-blur);
}

.standard-card--glass {
  background: var(--glass-surface);
  border-color: var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
}

.standard-card--elevated {
  box-shadow: var(--shadow-lg);
}

.standard-card--elevated:hover {
  box-shadow: var(--shadow-xl);
}

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

.standard-card--interactive {
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.standard-card--interactive:hover {
  box-shadow: var(--shadow-md);
}

.standard-card--interactive:active {
  box-shadow: var(--shadow-sm);
}

.card-title {
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background: var(--surface-elevated);
}

.standard-card--gaming .card-title {
  color: var(--text-primary);
  background:
    var(--surface-elevated);
}

.standard-card--glass .card-title {
  border-bottom-color: var(--glass-border);
  background: var(--glass-surface-elevated);
  backdrop-filter: var(--glass-backdrop-blur);
}

.card-content {
  padding: var(--spacing-lg);
  color: var(--text-primary);
}

[data-theme="dark"] .standard-card {
  background: var(--surface-base);
  border-color: var(--border-base);
}

[data-theme="dark"] .standard-card--gaming {
  background:
    var(--surface-base);
}

[data-theme="dark"] .card-title {
  background: var(--surface-elevated);
  border-bottom-color: var(--border-base);
  color: var(--text-primary);
}

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

@media (prefers-reduced-motion: reduce) {
  .standard-card,
  .standard-card--interactive,
  .standard-card--elevated {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .standard-card {
  }

  .card-title {
  }
}
</style>
