<template>
  <div :class="gridClasses" :data-layout="variant">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { computed } from "vue";

interface Props {
  cols?: 1 | 2 | 3 | 4 | 6 | "auto" | "auto-sm" | "auto-lg";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
  variant?: "default" | "card-grid" | "feature-grid";
  minItemWidth?: string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

const _props = withDefaults(defineProps<Props>(), {
  cols: 3,
  gap: "md",
  responsive: true,
  variant: "default",
  minItemWidth: "250px",
  align: "stretch",
  justify: "start",
});

const gridClasses = computed(() => {
  const classes = ["layout-grid"];

  // Column configuration
  if (typeof props.cols === "number") {
    classes.push(`layout-grid--${props.cols}col`);
  } else {
    classes.push(`layout-grid--${props.cols}`);
  }

  // Gap size
  classes.push(`layout-grid--${props.gap}`);

  // Variant styling
  if (props.variant !== "default") {
    classes.push(`layout-grid--${props.variant}`);
  }

  // Responsive behavior
  if (props.responsive) {
    classes.push("layout-grid--responsive");
  }

  // Alignment
  if (props.align !== "stretch") {
    classes.push(`layout-grid--align-${props.align}`);
  }

  if (props.justify !== "start") {
    classes.push(`layout-grid--justify-${props.justify}`);
  }

  return classes;
});

// Computed style for custom min-width
const gridStyle = computed(() => {
  if (props.cols === "auto" && props.minItemWidth !== "250px") {
    return {
      gridTemplateColumns: `repeat(auto-fit, minmax(${props.minItemWidth}, 1fr))`,
    };
  }
  return {};
});
</script>

<template>
  <div :class="gridClasses" :style="gridStyle" :data-layout="variant">
    <slot />
  </div>
</template>

<style scoped>
.layout-grid--align-start {
  align-items: start;
}
.layout-grid--align-center {
  align-items: center;
}
.layout-grid--align-end {
  align-items: end;
}
.layout-grid--align-stretch {
  align-items: stretch;
}

.layout-grid--justify-start {
  justify-items: start;
}
.layout-grid--justify-center {
  justify-items: center;
}
.layout-grid--justify-end {
  justify-items: end;
}
.layout-grid--justify-stretch {
  justify-items: stretch;
}

.layout-grid--card-grid {
  padding: var(--spacing-lg);
}

  background: var(--surface-elevated);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

  box-shadow: var(--shadow-md);
}

.layout-grid--feature-grid {
}

  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.layout-grid--responsive {
  transition: gap var(--duration-normal) var(--easing-ease-out);
}

  }

  .layout-grid--responsive.layout-grid--card-grid {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

    padding: var(--spacing-md);
  }
}

  }
}

  }
}

  background: var(--surface-elevated);
  border-color: var(--border-base);
}

  background:
    var(--surface-elevated);
}

  background:
    var(--surface-elevated);
}

  position: relative;
  overflow: hidden;
}

  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

}
</style>
