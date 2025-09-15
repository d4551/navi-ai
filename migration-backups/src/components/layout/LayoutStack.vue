<template>
  <div :class="stackClasses" :data-layout="variant">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  variant?: 'default' | 'card' | 'section'
  responsive?: boolean
  reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gap: 'md',
  align: 'stretch',
  justify: 'start',
  variant: 'default',
  responsive: true,
  reverse: false
})

const stackClasses = computed(() => {
  const classes = ['layout-stack']

  // Gap size
  classes.push(`layout-stack--${props.gap}`)

  // Alignment
  if (props.align !== 'stretch') {
    classes.push(`layout-stack--${props.align}`)
  }

  // Justification for when flex-direction changes
  if (props.justify !== 'start') {
    classes.push(`layout-stack--justify-${props.justify}`)
  }

  // Variant styling
  if (props.variant !== 'default') {
    classes.push(`layout-stack--${props.variant}`)
  }

  // Responsive behavior
  if (props.responsive) {
    classes.push('layout-stack--responsive')
  }

  // Reverse order
  if (props.reverse) {
    classes.push('layout-stack--reverse')
  }

  return classes
})
</script>

<style scoped>
/* Additional justify content utilities for stacks */
.layout-stack--justify-start { justify-content: flex-start; }
.layout-stack--justify-center { justify-content: center; }
.layout-stack--justify-end { justify-content: flex-end; }
.layout-stack--justify-between { justify-content: space-between; }
.layout-stack--justify-around { justify-content: space-around; }

/* Variant styling */
.layout-stack--card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.layout-stack--card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.layout-stack--section {
  padding: var(--spacing-xl) 0;
  border-bottom: 1px solid var(--border-base);
}

.layout-stack--section:last-child {
  border-bottom: none;
}

/* Reverse order */
.layout-stack--reverse {
  flex-direction: column-reverse;
}

/* Responsive behavior */
.layout-stack--responsive {
  transition: gap var(--duration-normal) var(--easing-ease-out);
}

@media (max-width: 767px) {
  .layout-stack--responsive.layout-stack--xl,
  .layout-stack--responsive.layout-stack--2xl {
    gap: var(--spacing-lg);
  }
  
  .layout-stack--responsive.layout-stack--lg {
    gap: var(--spacing-md);
  }

  .layout-stack--responsive.layout-stack--card {
    padding: var(--spacing-md);
    margin: var(--spacing-sm);
  }
}

/* Dark theme optimizations */
[data-theme="dark"] .layout-stack--card {
  background: var(--surface-elevated);
  border-color: var(--border-base);
}

/* Gaming theme enhancements */
.theme-gaming .layout-stack--card {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.05), 
    rgba(0, 255, 136, 0.02)
  ), var(--surface-elevated);
  border-color: var(--color-gaming-200);
}

[data-theme="dark"].theme-gaming .layout-stack--card {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1), 
    rgba(0, 255, 136, 0.05)
  ), var(--surface-elevated);
  border-color: var(--color-gaming-300);
}
</style>