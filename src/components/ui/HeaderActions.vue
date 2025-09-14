<template>
  <div class="header-actions-container" :class="containerClasses">
    <slot>
      <!-- Default action items if no slot content provided -->
      <template v-for="(action, index) in actions" :key="action.key || index">
        <component
          :is="getActionComponent(action)"
          v-bind="getActionProps(action)"
          @click="handleActionClick(action, index)"
        >
          {{ action.label || action.text }}
        </component>
      </template>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HeaderAction {
  key?: string
  label?: string
  text?: string
  component?: string
  variant?: string
  size?: string
  icon?: string
  leadingIcon?: string
  trailingIcon?: string
  props?: Record<string, any>
  handler?: Function
  disabled?: boolean
  loading?: boolean
  visible?: boolean
}

interface Props {
  actions?: HeaderAction[]
  layout?: 'horizontal' | 'vertical' | 'wrap'
  alignment?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  compact?: boolean
  priority?: 'primary' | 'secondary' | 'tertiary'
}

const _props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  layout: 'horizontal',
  alignment: 'end',
  gap: 'sm',
  responsive: true,
  compact: false,
  priority: 'secondary'
})

const emit = defineEmits<{
  actionClick: [action: HeaderAction, index: number]
}>()

// Computed classes for the container
const containerClasses = computed(() => [
  'header-actions',
  `layout-${props.layout}`,
  `align-${props.alignment}`,
  `gap-${props.gap}`,
  {
    'responsive': props.responsive,
    'compact': props.compact,
    [`priority-${props.priority}`]: props.priority
  }
])

// Get the component for an action
const getActionComponent = (action: HeaderAction) => {
  return action.component || 'UnifiedButton'
}

// Get props for an action
const getActionProps = (action: HeaderAction) => {
  const baseProps = {
    variant: action.variant || (props.priority === 'primary' ? 'primary' : 'outline'),
    size: action.size || (props.compact ? 'sm' : 'md'),
    disabled: action.disabled || false,
    loading: action.loading || false,
    leadingIcon: action.leadingIcon || action.icon,
    trailingIcon: action.trailingIcon
  }

  // Merge with custom props
  return { ...baseProps, ...(action.props || {}) }
}

// Handle action click
const handleActionClick = (action: HeaderAction, index: number) => {
  if (action.handler) {
    action.handler(action, index)
  }
  emit('actionClick', action, index)
}
</script>

<style scoped>
/* ===== HEADER ACTIONS CONTAINER ===== */

.header-actions-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Layout Variants */
.layout-horizontal {
  flex-direction: row;
}

.layout-vertical {
  flex-direction: column;
}

.layout-wrap {
  flex-direction: row;
  flex-wrap: wrap;
}

/* Alignment Variants */
.align-start {
  justify-content: flex-start;
}

.align-center {
  justify-content: center;
}

.align-end {
  justify-content: flex-end;
}

.align-space-between {
  justify-content: space-between;
}

.align-space-around {
  justify-content: space-around;
}

/* Gap Variants */
.gap-xs {
  gap: var(--spacing-1);
}

.gap-sm {
  gap: var(--spacing-2);
}

.gap-md {
  gap: var(--spacing-3);
}

.gap-lg {
  gap: var(--spacing-4);
}

.gap-xl {
  gap: var(--spacing-5);
}

/* Priority Variants */
.priority-primary :deep(.btn-unified) {
  min-height: 40px;
  padding: var(--spacing-2) var(--spacing-4);
}

.priority-secondary :deep(.btn-unified) {
  min-height: 36px;
  padding: var(--spacing-2) var(--spacing-3);
}

.priority-tertiary :deep(.btn-unified) {
  min-height: 32px;
  padding: var(--spacing-1-5) var(--spacing-3);
  font-size: var(--font-size-sm);
}

/* Compact Mode */
.compact :deep(.btn-unified) {
  min-height: 32px;
  padding: var(--spacing-1-5) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.compact.gap-sm {
  gap: var(--spacing-1-5);
}

/* Responsive Behavior */
.responsive {
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .responsive.layout-horizontal {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
  
  .responsive :deep(.btn-unified) {
    width: 100%;
    justify-content: center;
  }
  
  .responsive.compact :deep(.btn-unified) {
    min-height: 40px;
    padding: var(--spacing-2) var(--spacing-3);
  }
}

@media (max-width: 480px) {
  .responsive :deep(.btn-unified:not(.btn-icon-only)) {
    font-size: var(--font-size-sm);
  }
  
  /* Hide text on very small screens, show only icons */
  .responsive :deep(.btn-unified:not(.btn-icon-only) .button-content) {
    display: none;
  }
  
  .responsive :deep(.btn-unified) {
    aspect-ratio: 1;
    padding: var(--spacing-2);
  }
}

/* Status Indicators */
.header-actions-container :deep(.save-status) {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1-5) var(--spacing-2);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}

.header-actions-container :deep(.ai-status-warning) {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1-5) var(--spacing-2);
  background: color-mix(in srgb, var(--color-warning-500) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning-500) 20%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-warning-600);
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}

/* Typography Consistency */
.header-actions-container :deep(.btn-unified) {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-normal);
}

.header-actions-container :deep(.btn-unified .button-content) {
  font-size: inherit;
}

/* Icon Consistency */
.header-actions-container :deep(.app-icon) {
  width: 1em;
  height: 1em;
  font-size: inherit;
}

/* Ensure proper flexbox inheritance */
.header-actions-container > * {
  flex-shrink: 0;
}

/* Button grouping */
.header-actions-container :deep(.btn-group) {
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.header-actions-container :deep(.btn-group .btn-unified) {
  border-radius: 0;
  border-right: 1px solid var(--glass-border);
  margin: 0;
}

.header-actions-container :deep(.btn-group .btn-unified:first-child) {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.header-actions-container :deep(.btn-group .btn-unified:last-child) {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
  border-right: none;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .header-actions-container * {
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .header-actions-container :deep(.save-status),
  .header-actions-container :deep(.ai-status-warning) {
    border-width: 2px;
    font-weight: 600;
  }
}
</style>
