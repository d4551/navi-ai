<template>
  <div :class="containerClasses" :data-layout="variant">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'fluid' | 'page' | 'section' | 'narrow' | 'wide' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  center?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'page',
  padding: 'md',
  responsive: true,
  center: false,
})

const containerClasses = computed(() => {
  const classes = []

  // Base container class
  switch (props.variant) {
    case 'fluid':
      classes.push('container-fluid')
      break
    case 'narrow':
      classes.push('container-narrow')
      break
    case 'wide':
      classes.push('container-wide')
      break
    case 'full':
      classes.push('container-full')
      break
    case 'section':
      classes.push('container-section')
      break
    default:
      classes.push('container-page')
  }

  // Padding modifier
  if (props.padding === 'none') {
    classes.push('container--no-padding')
  } else if (props.padding !== 'md') {
    classes.push(`container--${props.padding}-padding`)
  }

  // Center content
  if (props.center) {
    classes.push('text-center')
  }

  // Responsive behavior
  if (props.responsive) {
    classes.push('container--responsive')
  }

  return classes
})
</script>

<style scoped>
.container--responsive {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

/* Custom padding modifiers for precise control */
.container--xs-padding {
  padding: var(--spacing-xs) !important;
}
.container--2xl-padding {
  padding: var(--spacing-2xl) !important;
}

/* Responsive padding adjustments */
@media (max-width: 767px) {
  .container--responsive.container--xl-padding,
  .container--responsive.container--2xl-padding {
    padding: var(--spacing-lg) !important;
  }

  .container--responsive.container--lg-padding {
    padding: var(--spacing-md) !important;
  }
}

/* Dark theme optimizations */
[data-theme='dark'] .container--responsive {
  background: var(--surface-base);
}

/* High contrast improvements */
@media (prefers-contrast: high) {
  .container--responsive {
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-sm);
  }
}
</style>
