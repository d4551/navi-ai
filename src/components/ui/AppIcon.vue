<template>
  <span
    :class="[rootClasses, $attrs.class]"
    :style="[computedStyle, $attrs.style]"
    v-bind="$attrs"
  >
    <i :class="['mdi', resolvedMdi]" aria-hidden="true"></i>
  </span>
</template>

<script>
import { computed } from 'vue';
import { getMdiAlias } from "@/utils/iconAliases";

export default {
  name: "AppIcon",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true,
    },

    size: {
      type: [String, Number],
      default: "default",
      validator: (value) => {
        const validSizes = [
          "x-small",
          "small",
          "default",
          "large",
          "x-large",
          "inherit",
        ];
        return validSizes.includes(value) || !isNaN(value);
      },
    },

    color: {
      type: String,
      default: undefined,
    },

    context: {
      type: String,
      default: "default",
      validator: (value) => {
        const validContexts = [
          "default",
          "button",
          "header",
          "card",
          "list",
          "navigation",
          "achievement",
          "gaming",
          "success",
          "warning",
          "error",
          "info",
        ];
        return validContexts.includes(value);
      },
    },

    variant: {
      type: String,
      default: undefined,
      validator: (value) => {
        const validVariants = [
          "filled",
          "outlined",
          "rounded",
          "sharp",
          "two-tone",
        ];
        return !value || validVariants.includes(value);
      },
    },

    interactive: {
      type: Boolean,
      default: false,
    },
  },

  setup(_props) {
    // Emoji/alias mapping to MDI icons
    const EMOJI_ALIASES = {
      "✓": "mdi-check",
    };

    const resolveToMdi = (name) => {
      if (!name) return "mdi-shape";
      let n = String(name).trim();
      if (n.startsWith("mdi-")) return getMdiAlias(n) || n;
      // Map common emojis/symbols
      if (EMOJI_ALIASES[n]) return EMOJI_ALIASES[n];
      // Fallbacks for common ascii symbols
      if (n === "x" || n === "X") return "mdi-close";
      if (n.toLowerCase() === "ok") return "mdi-check";
      // Generic fallback icon
      return "mdi-shape";
    };

    const resolvedMdi = computed(() => resolveToMdi(props.name));

    const computedSize = computed(() => {
      if (props.size !== "default") {
        return props.size;
      }

      // Context-based sizing
      const contextSizes = {
        button: "small",
        header: "large",
        card: "default",
        list: "small",
        navigation: "default",
        achievement: "large",
      };

      return contextSizes[props.context] || "default";
    });

    const computedStyle = computed(() => {
      const styles = {};

      // Handle sizing
      const size = computedSize.value;
      const sizeMap = {
      };

      if (size === "inherit") {
        // Defer sizing to CSS; avoid inline styles
      } else if (sizeMap[size]) {
        styles.fontSize = sizeMap[size];
        styles.width = sizeMap[size];
        styles.height = sizeMap[size];
      } else if (!isNaN(size)) {
        styles.fontSize = `${size}px`;
        styles.width = `${size}px`;
        styles.height = `${size}px`;
      }

      // Handle coloring (theme-aware via CSS vars)
      const themeColors = {
      };

      if (props.color) {
        styles.color = themeColors[props.color] || props.color;
      } else if (props.context && themeColors[props.context]) {
        styles.color = themeColors[props.context];
      }

      return styles;
    });

    const computedClasses = computed(() => {
      const classes = [];

      if (props.variant) {
        classes.push(`icon-${props.variant}`);
      }

      if (props.interactive) {
        classes.push("icon-interactive");
      }

      if (props.context && props.context !== "default") {
        classes.push(`icon-context-${props.context}`);
      }

      return classes.join(" ");
    });

    const rootClasses = computed(() =>
      ["mui-icon", computedClasses.value].filter(Boolean).join(" "),
    );

    return {
      resolvedMdi,
      computedSize,
      computedStyle,
      computedClasses,
      rootClasses,
    };
  },
};
</script>

<style scoped>
.mui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  fill: currentColor;
}

.icon-interactive {
  cursor: pointer;
}

.icon-interactive:hover {
}

.icon-context-achievement {
  filter: drop-shadow(
  );
}
.icon-context-gaming {
  filter: drop-shadow(
  );
}
.icon-context-success {
  filter: drop-shadow(
  );
}

.icon-context-warning {
}

.icon-context-error {
}

.icon-context-info {
}

.icon-outlined {
  fill: none;
  stroke: currentColor;
}

.icon-rounded {
}

.icon-filled {
  fill: currentColor;
}

.icon-sharp svg {
}

.icon-two-tone svg {
}

@keyframes icon-pulse {
  }
  }
  }
}

.icon-context-achievement:hover {
}

.icon-context-gaming:hover {
}
</style>
