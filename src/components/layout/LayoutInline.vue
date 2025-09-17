<template>
  <div :class="inlineClasses" :data-layout="variant" class="font-sans">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  wrap?: boolean
  reverse?: boolean
  responsive?: boolean
  variant?: 'default' | 'toolbar' | 'breadcrumb' | 'tag-list'
  stackOnMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gap: 'sm',
  align: 'center',
  justify: 'start',
  wrap: false,
  reverse: false,
  responsive: true,
  variant: 'default',
  stackOnMobile: false,
})

const inlineClasses = computed(() => {
  const classes = ['layout-inline']

  // Gap size
  classes.push(`layout-inline--${props.gap}`)

  // Alignment
  if (props.align !== 'center') {
    classes.push(`layout-inline--align-${props.align}`)
  }

  // Justification
  if (props.justify !== 'start') {
    classes.push(`layout-inline--${props.justify}`)
  }

  // Wrap behavior
  if (props.wrap) {
    classes.push('layout-inline--wrap')
  } else {
    classes.push('layout-inline--nowrap')
  }

  // Reverse order
  if (props.reverse) {
    classes.push('layout-inline--reverse')
  }

  // Responsive behavior
  if (props.responsive) {
    classes.push('layout-inline--responsive')
  }

  // Stack on mobile
  if (props.stackOnMobile) {
    classes.push('layout-inline--mobile-stack')
  }

  // Variant styling
  if (props.variant !== 'default') {
    classes.push(`layout-inline--${props.variant}`)
  }

  return classes
})
</script>

<style scoped>
/* Alignment utilities */
.layout-inline--align-start {
  align-items: flex-start;
}
.layout-inline--items-center {
  align-items: center;
}
.layout-inline--align-end {
  align-items: flex-end;
}
.layout-inline--align-baseline {
  align-items: baseline;
}
.layout-inline--align-stretch {
  align-items: stretch;
}

/* Reverse order */
.layout-inline--reverse {
  flex-direction: flex flex-wrap-reverse;
}

/* Variant styling */
.layout-inline--toolbar {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  min-height: 44px; /* Accessibility minimum touch target */
  box-shadow: var(--shadow-sm);
}

.layout-inline--breadcrumb {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.layout-inline--breadcrumb > :deep(* + *::before) {
  content: '/';
  color: var(--text-tertiary);
  margin: 0 var(--spacing-xs);
  font-weight: var(--font-weight-normal);
}

.layout-inline--tag-list {
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.layout-inline--tag-list > :deep(*) {
  background: var(--color-primary-alpha-10);
  color: var(--color-primary-700);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.layout-inline--tag-list > :deep(*:hover) {
  background: var(--color-primary-alpha-20);
  transform: translateY(-1px);
}

/* Responsive behavior */
.layout-inline--responsive {
  transition: gap var(--duration-normal) var(--easing-ease-out);
}

@media (max-width: 767px) {
  .layout-inline--responsive.layout-inline--lg {
    gap: var(--spacing-md);
  }

  .layout-inline--responsive.layout-inline--toolbar {
    padding: var(--spacing-xs) var(--spacing-sm);
    flex-wrap: wrap;
    min-height: 40px;
  }

  /* Mobile stacking behavior */
  .layout-inline--mobile-stack {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .layout-inline--mobile-stack.layout-inline--reverse {
    flex-direction: column-reverse;
  }
}

/* Dark theme optimizations */
[data-theme='dark'] .layout-inline--toolbar {
  background: var(--surface-elevated);
  border-color: var(--border-base);
}

[data-theme='dark'] .layout-inline--tag-list > :deep(*) {
  background: var(--color-primary-alpha-20);
  color: var(--color-primary-300);
}

[data-theme='dark'] .layout-inline--tag-list > :deep(*:hover) {
  background: var(--color-primary-alpha-20);
  color: var(--color-primary-200);
}

[data-theme='dark'] .layout-inline--breadcrumb {
  color: var(--text-secondary);
}

[data-theme='dark'] .layout-inline--breadcrumb > :deep(* + *::before) {
  color: var(--text-tertiary);
}

/* Gaming theme enhancements */
.theme-gaming .layout-inline--toolbar {
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(0, 255, 136, 0.02)),
    var(--surface-elevated);
  border-color: var(--color-gaming-200);
}

.theme-gaming .layout-inline--tag-list > :deep(*) {
  background: var(--color-gaming-alpha-10);
  color: var(--color-gaming-700);
}

.theme-gaming .layout-inline--tag-list > :deep(*:hover) {
  background: var(--color-gaming-alpha-20);
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.2);
}

[data-theme='dark'].theme-gaming .layout-inline--toolbar {
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(0, 255, 136, 0.05)),
    var(--surface-elevated);
  border-color: var(--color-gaming-300);
}

[data-theme='dark'].theme-gaming .layout-inline--tag-list > :deep(*) {
  background: var(--color-gaming-alpha-20);
  color: var(--color-gaming-300);
}

/* Accessibility improvements */
.layout-inline--toolbar:focus-within {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* High contrast support */
@media (prefers-contrast: high) {
  .layout-inline--toolbar {
    border-width: 2px;
  }

  .layout-inline--tag-list > :deep(*) {
    border: 1px solid var(--color-primary-600);
  }

  .layout-inline--breadcrumb > :deep(* + *::before) {
    font-weight: var(--font-weight-bold);
  }
}
</style>
