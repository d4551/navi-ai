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
import { computed } from 'vue';

import {} from "vue";

interface HeaderAction {
  key?: string;
  label?: string;
  text?: string;
  component?: string;
  variant?: string;
  size?: string;
  icon?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  props?: Record<string, any>;
  handler?: Function;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
}

interface Props {
  actions?: HeaderAction[];
  layout?: "horizontal" | "vertical" | "wrap";
  alignment?: "start" | "center" | "end" | "space-between" | "space-around";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
  compact?: boolean;
  priority?: "primary" | "secondary" | "tertiary";
}

const _props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  layout: "horizontal",
  alignment: "end",
  gap: "sm",
  responsive: true,
  compact: false,
  priority: "secondary",
});

const _emit = defineEmits<{
  actionClick: [action: HeaderAction, index: number];
}>();

// Computed classes for the container
const containerClasses = computed(() => [
  "header-actions",
  `layout-${props.layout}`,
  `align-${props.alignment}`,
  `gap-${props.gap}`,
  {
    responsive: props.responsive,
    compact: props.compact,
    [`priority-${props.priority}`]: props.priority,
  },
]);

// Get the component for an action
const getActionComponent = (action: HeaderAction) => {
  return action.component || "UnifiedButton";
};

// Get props for an action
const getActionProps = (action: HeaderAction) => {
  const baseProps = {
    variant:
      action.variant || (props.priority === "primary" ? "primary" : "outline"),
    size: action.size || (props.compact ? "sm" : "md"),
    disabled: action.disabled || false,
    loading: action.loading || false,
    leadingIcon: action.leadingIcon || action.icon,
    trailingIcon: action.trailingIcon,
  };

  // Merge with custom props
  return { ...baseProps, ...(action.props || {}) };
};

// Handle action click
const handleActionClick = (action: HeaderAction, index: number) => {
  if (action.handler) {
    action.handler(action, index);
  }
  emit("actionClick", action, index);
};
</script>

<style scoped>

.header-actions-container {
  display: flex;
  align-items: center;
}

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

.gap-xs {
}

.gap-sm {
}

.gap-md {
}

.gap-lg {
}

.gap-xl {
}

.priority-primary :deep(.btn-unified) {
}

.priority-secondary :deep(.btn-unified) {
}

.priority-tertiary :deep(.btn-unified) {
  font-size: var(--font-size-sm);
}

.compact :deep(.btn-unified) {
  font-size: var(--font-size-sm);
}

.compact.gap-sm {
}

.responsive {
  flex-wrap: wrap;
}

  .responsive.layout-horizontal {
    flex-direction: column;
    align-items: stretch;
  }

  .responsive :deep(.btn-unified) {
    justify-content: center;
  }

  .responsive.compact :deep(.btn-unified) {
  }
}

  .responsive :deep(.btn-unified:not(.btn-icon-only)) {
    font-size: var(--font-size-sm);
  }

  .responsive :deep(.btn-unified:not(.btn-icon-only) .button-content) {
    display: none;
  }

  .responsive :deep(.btn-unified) {
  }
}

.header-actions-container :deep(.save-status) {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.header-actions-container :deep(.ai-status-warning) {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-mono);
}

.header-actions-container :deep(.btn-unified) {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-normal);
}

.header-actions-container :deep(.btn-unified .button-content) {
  font-size: inherit;
}

.header-actions-container :deep(.app-icon) {
  font-size: inherit;
}

}

.header-actions-container :deep(.btn-group) {
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.header-actions-container :deep(.btn-group .btn-unified) {
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

@media (prefers-reduced-motion: reduce) {
    transition: none !important;
  }
}

@media (prefers-contrast: high) {
  .header-actions-container :deep(.save-status),
  .header-actions-container :deep(.ai-status-warning) {
  }
}
</style>
