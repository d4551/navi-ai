<template>
  <div :class="gridClasses" :data-layout="variant">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  cols?: 1 | 2 | 3 | 4 | 6 | 'auto' | 'auto-sm' | 'auto-lg'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  variant?: 'default' | 'card-grid' | 'feature-grid'
  minItemWidth?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const props = withDefaults(defineProps<Props>(), {
  cols: 3,
  gap: 'md',
  responsive: true,
  variant: 'default',
  minItemWidth: '250px',
  align: 'stretch',
  justify: 'start'
})

const gridClasses = computed(() => {
  const classes = ['layout-grid']

  // Column configuration
  if (typeof props.cols === 'number') {
    classes.push(`layout-grid--${props.cols}col`)
  } else {
    classes.push(`layout-grid--${props.cols}`)
  }

  // Gap size
  classes.push(`layout-grid--${props.gap}`)

  // Variant styling
  if (props.variant !== 'default') {
    classes.push(`layout-grid--${props.variant}`)
  }

  // Responsive behavior
  if (props.responsive) {
    classes.push('layout-grid--responsive')
  }

  // Alignment
  if (props.align !== 'stretch') {
    classes.push(`layout-grid--align-${props.align}`)
  }

  if (props.justify !== 'start') {
    classes.push(`layout-grid--justify-${props.justify}`)
  }

  return classes
})

// Computed style for custom min-width
const gridStyle = computed(() => {
  if (props.cols === 'auto' && props.minItemWidth !== '250px') {
    return {
      gridTemplateColumns: `repeat(auto-fit, minmax(${props.minItemWidth}, 1fr))`
    }
  }
  return {}
})
</script>

<template>
  <div :class="gridClasses" :style="gridStyle" :data-layout="variant">
    <slot />
  </div>
</template>

<style scoped>
/* Alignment utilities for grid */
.layout-grid--align-start { align-items: start; }
.layout-grid--align-center { align-items: center; }
.layout-grid--align-end { align-items: end; }
.layout-grid--align-stretch { align-items: stretch; }

.layout-grid--justify-start { justify-items: start; }
.layout-grid--justify-center { justify-items: center; }
.layout-grid--justify-end { justify-items: end; }
.layout-grid--justify-stretch { justify-items: stretch; }

/* Variant styling */
.layout-grid--card-grid {
  padding: var(--spacing-lg);
}

.layout-grid--card-grid > :deep(*) {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.layout-grid--card-grid > :deep(*:hover) {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.layout-grid--feature-grid {
  padding: var(--spacing-xl) 0;
}

.layout-grid--feature-grid > :deep(*) {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* Responsive grid behavior */
.layout-grid--responsive {
  transition: gap var(--duration-normal) var(--easing-ease-out);
}

/* Mobile breakpoints - inherited from layout-utilities.css */
@media (max-width: 479px) {
  .layout-grid--responsive.layout-grid--2col,
  .layout-grid--responsive.layout-grid--3col,
  .layout-grid--responsive.layout-grid--4col,
  .layout-grid--responsive.layout-grid--6col {
    grid-template-columns: 1fr;
  }
  
  .layout-grid--responsive.layout-grid--card-grid {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .layout-grid--responsive.layout-grid--card-grid > :deep(*) {
    padding: var(--spacing-md);
  }
}

/* Large mobile */
@media (min-width: 480px) and (max-width: 639px) {
  .layout-grid--responsive.layout-grid--3col,
  .layout-grid--responsive.layout-grid--4col,
  .layout-grid--responsive.layout-grid--6col {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet */
@media (min-width: 640px) and (max-width: 767px) {
  .layout-grid--responsive.layout-grid--4col,
  .layout-grid--responsive.layout-grid--6col {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Dark theme optimizations */
[data-theme="dark"] .layout-grid--card-grid > :deep(*) {
  background: var(--surface-elevated);
  border-color: var(--border-base);
}

/* Gaming theme enhancements */
.theme-gaming .layout-grid--card-grid > :deep(*) {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.05), 
    rgba(0, 255, 136, 0.02)
  ), var(--surface-elevated);
  border-color: var(--color-gaming-200);
}

[data-theme="dark"].theme-gaming .layout-grid--card-grid > :deep(*) {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1), 
    rgba(0, 255, 136, 0.05)
  ), var(--surface-elevated);
  border-color: var(--color-gaming-300);
}

/* Feature grid specific enhancements */
.layout-grid--feature-grid > :deep(*) {
  position: relative;
  overflow: hidden;
}

.layout-grid--feature-grid > :deep(*::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-gaming-500));
  opacity: 0;
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.layout-grid--feature-grid > :deep(*:hover::before) {
  opacity: 1;
}
</style>