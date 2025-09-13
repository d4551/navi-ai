
import { refreadonly, computed, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { logger } from "@/shared/utils/logger";
import { useDynamicScaling } from "./useDynamicScaling";

// Theme Types
export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  // Primary brand colors (gaming-focused)
  primary: {
  };
  // Secondary accent colors
  secondary: {
  };
  // Semantic colors
  success: {
  };
  warning: {
  };
  error: {
  };
  // Neutral grays
  gray: {
  };
  // Surface colors
  background: string;
  surface: string;
  "surface-variant": string;
  "on-background": string;
  "on-surface": string;
  "on-surface-variant": string;
}

export interface ThemeDesignTokens {
  colors: ThemeColors;
  typography: {
    fontFamily: {
      ui: string;
      mono: string;
      display: string;
      primary?: string;
      secondary?: string;
      gaming?: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Gaming-optimized color palettes
const GAMING_COLORS: Record<ColorScheme, ThemeColors> = {
  light: {
    primary: {
    },
    secondary: {
    },
    success: {
    },
    warning: {
    },
    error: {
    },
    gray: {
    },
  },
  dark: {
    primary: {
    },
    secondary: {
    },
    success: {
    },
    warning: {
    },
    error: {
    },
    gray: {
    },
  },
};

// Design tokens for consistent styling
const DESIGN_TOKENS: Omit<ThemeDesignTokens, "colors"> = {
  typography: {
    fontFamily: {
      primary:
        "'Electrolize', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      secondary:
        "'Inter', 'Electrolize', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace",
      gaming: "'Orbitron', 'Electrolize', system-ui, sans-serif",
      display: "'Electrolize', 'Inter', system-ui, sans-serif",
      ui: "'Electrolize', 'Inter', system-ui, -apple-system, sans-serif",
    },
    fontSize: {
    },
    fontWeight: {
    },
    lineHeight: {
    },
    letterSpacing: {
    },
  },
  spacing: {
  },
  borderRadius: {
  },
  shadows: {
  },
  transitions: {
  },
};

// Composable state
const themeMode = useStorage<ThemeMode>("navi-theme-mode", "system");
const systemPreference = ref<ColorScheme>("light");

// Create unified theme composable
  // Initialize dynamic scaling
  const scaling = useDynamicScaling({
    enableFontScaling: true,
    enablePerformanceOptimization: true,
  });

  // Computed active color scheme
  const colorScheme = computed<ColorScheme>(() => {
    return themeMode.value === "system"
      ? systemPreference.value
      : (themeMode.value as ColorScheme);
  });

  // Current theme tokens
  const _theme = computed<ThemeDesignTokens>(() => ({
    colors: GAMING_COLORS[colorScheme.value],
    ...DESIGN_TOKENS,
  }));

  // Convenience computed properties
  const isDark = computed(() => colorScheme.value === "dark");
  const isLight = computed(() => colorScheme.value === "light");
  const isSystem = computed(() => themeMode.value === "system");

  // System preference detection
  const updateSystemPreference = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      systemPreference.value = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode;
    logger.info(`Theme mode changed to: ${mode}`);
  };

  const toggleTheme = () => {
    if (themeMode.value === "light") {
      setThemeMode("dark");
    } else if (themeMode.value === "dark") {
      setThemeMode("system");
    } else {
      setThemeMode("light");
    }
  };

  // CSS custom properties injection
  const injectCSSCustomProperties = () => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const colors = theme.value.colors;
    const tokens = theme.value;

    // Inject color variables
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--color-${key}`, value);
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value as Record<string, string>).forEach(
          ([shade, color]) => {
            root.style.setProperty(`--color-${key}-${shade}`, color);
          },
        );
      }
    });

    // Inject typography variables with scaling support
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--font-family-${key}`, value);
    });

    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      // Apply scaling to font sizes
      const scaledValue = scaling.getScaledValue(parseFloat(value));
      root.style.setProperty(`--font-size-${key}`, `${scaledValue}rem`);
      root.style.setProperty(`--font-size-${key}-base`, value); // Keep original for reference
    });

    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    // Inject spacing variables with scaling support
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      const scaledValue = scaling.getScaledValue(parseFloat(value));
      root.style.setProperty(`--spacing-${key}`, `${scaledValue}rem`);
      root.style.setProperty(`--spacing-${key}-base`, value); // Keep original for reference
    });

    // Inject border radius variables
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // Inject shadow variables
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Inject transition variables (adjust for performance)
    Object.entries(tokens.transitions).forEach(([key, value]) => {
      const adjustedTransition = scaling.shouldOptimizeAnimations.value
        ? "none"
        : value;
      root.style.setProperty(`--transition-${key}`, adjustedTransition);
    });

    // Set color scheme attributes for native styling
    root.setAttribute("data-theme", colorScheme.value);
    root.setAttribute("data-color-scheme", colorScheme.value);

    // Add theme transition class for smooth theme changes
    root.classList.add("theme-transitioning");
    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 150);

  const getColor = (colorPath: string): string => {
    const keys = colorPath.split(".");
    let value: any = theme.value.colors;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

  };

  const getContrastColor = (backgroundColor: string): string => {
    // Simple contrast calculation for text readability
    const rgb = backgroundColor.match(/\d+/g);

    const brightness =
  };

  // Generate component-specific theme classes
  const getThemeClasses = (componentName: string): string[] => {
    const classes = [`${componentName}--${colorScheme.value}`];

    if (isDark.value) {
      classes.push(`${componentName}--dark`);
    }

    return classes;
  };

  // Initialize theme system (safe for global context)
  const initializeTheme = () => {
    updateSystemPreference();
    injectCSSCustomProperties();

    // Listen for system preference changes
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateSystemPreference);
    }

    logger.info("Unified theme system initialized", {
      mode: themeMode.value,
      colorScheme: colorScheme.value,
      systemPreference: systemPreference.value,
    });
  };

  const initializeThemeGlobal = () => {
    // Initialize scaling outside of component context
    const scalingResult = useDynamicScaling({
      enableFontScaling: true,
      enablePerformanceOptimization: true,
    });

    updateSystemPreference();
    injectCSSCustomProperties();

    // Listen for system preference changes
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        updateSystemPreference();
        injectCSSCustomProperties();
      });
    }

    logger.info("Unified theme system initialized globally", {
      mode: themeMode.value,
      colorScheme: colorScheme.value,
      systemPreference: systemPreference.value,
    });

    return scalingResult;
  };

  // UI Helper Methods
  const getThemeIcon = (): string => {
    if (isSystem.value) {
      return "mdi-theme-light-dark";
    } else if (isDark.value) {
      return "mdi-moon-waning-crescent";
    } else {
      return "mdi-white-balance-sunny";
    }
  };

  const getThemeDisplayName = (): string => {
    if (isSystem.value) {
      return "System";
    } else if (isDark.value) {
      return "Dark";
    } else {
      return "Light";
    }
  };

  const cycleTheme = (): void => {
    if (themeMode.value === "light") {
      setThemeMode("dark");
    } else if (themeMode.value === "dark") {
      setThemeMode("system");
    } else {
      setThemeMode("light");
    }
  };

  // Current theme for backward compatibility
  const currentTheme = computed(() => colorScheme.value);

  // Watch for changes and update CSS variables
  watch(colorScheme, injectCSSCustomProperties, { immediate: false });

  // Initialize on mount
  onMounted(initializeTheme);

  return {
    // State
    themeMode: readonly(themeMode),
    colorScheme: readonly(colorScheme),
    systemPreference: readonly(systemPreference),
    theme: readonly(theme),

    // Computed
    isDark: readonly(isDark),
    isLight: readonly(isLight),
    isSystem: readonly(isSystem),
    currentTheme: readonly(currentTheme),

    // Actions
    setThemeMode,
    toggleTheme,
    cycleTheme,
    initializeTheme,
    initializeThemeGlobal,

    // UI Helpers
    getThemeIcon,
    getThemeDisplayName,

    // Utilities
    getColor,
    getContrastColor,
    getThemeClasses,
    injectCSSCustomProperties,

    // Scaling utilities
    scaling,

    // Constants for external use
    GAMING_COLORS,
    DESIGN_TOKENS,
  };
}

// Export for global use
export default useUnifiedTheme;

  // Detect system preference without reactive refs
  let currentSystemPreference: ColorScheme = "light";
  if (typeof window !== "undefined" && window.matchMedia) {
    currentSystemPreference = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
  }

  // Apply theme variables directly
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    const colors = GAMING_COLORS[currentSystemPreference];
    const tokens = DESIGN_TOKENS;

    // Inject color variables
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--color-${key}`, value);
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value as Record<string, string>).forEach(
          ([shade, color]) => {
            root.style.setProperty(`--color-${key}-${shade}`, color);
          },
        );
      }
    });

    // Inject typography variables
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--font-family-${key}`, value);
    });

    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Set color scheme attributes
    root.setAttribute("data-theme", currentSystemPreference);
    root.setAttribute("data-color-scheme", currentSystemPreference);
  }

  logger.info("Unified theme system initialized globally (safe mode)", {
    scheme: currentSystemPreference,
  });
}

  const { theme, getColor, getContrastColor, isDark, isLight } =
    useUnifiedTheme();

  return {
    theme,
    getColor,
    getContrastColor,
    isDark,
    isLight,
  };
}

// CSS-in-JS helper for styled components
  const colors = GAMING_COLORS[colorScheme];

  return {
    colors,
    ...DESIGN_TOKENS,
    utils: {
      text: (variant: "primary" | "secondary" | "muted" = "primary") => {
        const variants = {
          primary: colors["on-background"],
        };
        return variants[variant];
      },
    },
  };
}
