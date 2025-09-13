<template>
  <div :class="inlineClasses" :data-layout="variant">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  gap?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  reverse?: boolean;
  responsive?: boolean;
  variant?: "default" | "toolbar" | "breadcrumb" | "tag-list";
  stackOnMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gap: "sm",
  align: "center",
  justify: "start",
  wrap: false,
  reverse: false,
  responsive: true,
  variant: "default",
  stackOnMobile: false,
});

const inlineClasses = computed(() => {
  const classes = ["layout-inline"];

  // Gap size
  classes.push(`layout-inline--${props.gap}`);

  // Alignment
  if (props.align !== "center") {
    classes.push(`layout-inline--align-${props.align}`);
  }

  // Justification
  if (props.justify !== "start") {
    classes.push(`layout-inline--${props.justify}`);
  }

  // Wrap behavior
  if (props.wrap) {
    classes.push("layout-inline--wrap");
  } else {
    classes.push("layout-inline--nowrap");
  }

  // Reverse order
  if (props.reverse) {
    classes.push("layout-inline--reverse");
  }

  // Responsive behavior
  if (props.responsive) {
    classes.push("layout-inline--responsive");
  }

  // Stack on mobile
  if (props.stackOnMobile) {
    classes.push("layout-inline--mobile-stack");
  }

  // Variant styling
  if (props.variant !== "default") {
    classes.push(`layout-inline--${props.variant}`);
  }

  return classes;
});
</script>

<style scoped>
.layout-inline--align-start {
  align-items: flex-start;
}
.layout-inline--align-center {
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

.layout-inline--reverse {
  flex-direction: row-reverse;
}

.layout-inline--toolbar {
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.layout-inline--breadcrumb {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

  content: "/";
  color: var(--text-tertiary);
  font-weight: var(--font-weight-normal);
}

.layout-inline--tag-list {
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

}

.layout-inline--responsive {
  transition: gap var(--duration-normal) var(--easing-ease-out);
}

  .layout-inline--responsive.layout-inline--lg {
    gap: var(--spacing-md);
  }

  .layout-inline--responsive.layout-inline--toolbar {
    padding: var(--spacing-xs) var(--spacing-sm);
    flex-wrap: wrap;
  }

  .layout-inline--mobile-stack {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .layout-inline--mobile-stack.layout-inline--reverse {
    flex-direction: column-reverse;
  }
}

[data-theme="dark"] .layout-inline--toolbar {
  background: var(--surface-elevated);
  border-color: var(--border-base);
}

}

}

[data-theme="dark"] .layout-inline--breadcrumb {
  color: var(--text-secondary);
}

  color: var(--text-tertiary);
}

.theme-gaming .layout-inline--toolbar {
  background:
    var(--surface-elevated);
}

}

}

[data-theme="dark"].theme-gaming .layout-inline--toolbar {
  background:
    var(--surface-elevated);
}

}

.layout-inline--toolbar:focus-within {
}

@media (prefers-contrast: high) {
  .layout-inline--toolbar {
  }

  }

    font-weight: var(--font-weight-bold);
  }
}
</style>
