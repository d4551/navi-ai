import { defineProps } from 'vue'
<template>
  <span
    :class="[ 'status-badge',
              `status-badge-${variant}`,
              `status-badge-${size}`,
              { 'status-badge-pill': pill }
    ]"
    :role="role"
    :aria-label="ariaLabel || $slots.default?.[0]?.text || ''"
    class="font-sans"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'secondary',
    validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  },
  pill: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: null
  },
  ariaLabel: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  transition: all 0.15s ease-in-out;
}

/* Variants */
.status-badge-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.status-badge-secondary {
  background: var(--glass-elevated);
  color: var(--text-primary-600);
  border-color: var(--glass-border);
}

.status-badge-success {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.status-badge-danger {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

.status-badge-warning {
  background: var(--color-warning);
  color: var(--text-on-warning, white);
  border-color: var(--color-warning);
}

.status-badge-info {
  background: var(--color-info);
  color: var(--text-on-info, white);
  border-color: var(--color-info);
}

.status-badge-light {
  background: var(--bg-tertiary);
  color: var(--text-primary-600);
  border-color: var(--bg-tertiary);
}

.status-badge-dark {
  background: var(--text-primary-600);
  color: white;
  border-color: var(--text-primary-600);
}

/* Sizes */
.status-badge-sm {
  padding: 0.25em 0.5em;
  font-size: 0.65rem;
}

.status-badge-md {
  padding: 0.35em 0.65em;
  font-size: 0.75rem;
}

.status-badge-lg {
  padding: 0.5em 0.8em;
  font-size: 0.875rem;
}

/* Pill style */
.status-badge-pill {
  border-radius: 10rem;
}

/* Dark theme support */
[data-theme="dark"] .status-badge-secondary {
  background: var(--dark-glass-elevated);
  border-color: var(--dark-glass-border);
  color: var(--dark-text-primary-600);
}

[data-theme="dark"] .status-badge-light {
  background: var(--dark-bg-tertiary);
  color: var(--dark-text-primary-600);
}

/* Focus and hover states for accessibility */
.status-badge:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .status-badge {
    border-width: 2px;
  }

  .status-badge-primary,
  .status-badge-success,
  .status-badge-danger,
  .status-badge-warning,
  .status-badge-info {
    border-style: solid;
    background: transparent;
    color: var(--text-primary-600);
  }

  .status-badge-primary {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .status-badge-success {
    border-color: var(--color-success);
    color: var(--color-success);
  }

  .status-badge-danger {
    border-color: var(--color-danger);
    color: var(--color-danger);
  }

  .status-badge-warning {
    border-color: var(--color-warning);
    color: var(--color-warning);
  }

  .status-badge-info {
    border-color: var(--color-info);
    color: var(--color-info);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .status-badge {
    transition: none;
  }
}

/* Print styles */
@media print {
  .status-badge {
    background: transparent !important;
    border: 1px solid var(--text-primary-600) !important;
    color: var(--text-primary-600) !important;
  }
}
</style>
