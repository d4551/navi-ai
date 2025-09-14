import { computedwatch } from "vue";
import { useStorage } from "@vueuse/core";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import { useResponsive, autoInitializeResponsive } from "./useResponsive";
import { logger } from "@/shared/utils/logger";

  // Get theme and responsive composables
  const _theme = useUnifiedTheme();
  const responsive = useResponsive();

  // Combined CSS classes for comprehensive styling
  const unifiedClasses = computed(() => {
    try {
      // Get current values with safe fallbacks
      const colorScheme = theme?.colorScheme?.value || "light";
      const themeMode = theme?.themeMode?.value || "light";
      const deviceType = responsive?.deviceType?.value || "desktop";
      const isDark = Boolean(theme?.isDark?.value);
      const isLight = Boolean(theme?.isLight?.value);
      const isMobile = Boolean(responsive?.isMobile?.value);
      const isTablet = Boolean(responsive?.isTablet?.value);
      const isDesktop = Boolean(responsive?.isDesktop?.value);

      return {
        // Theme state classes
        [`color-scheme-${colorScheme}`]: true,
        [`theme-mode-${themeMode}`]: true,
        "is-dark": isDark,
        "is-light": isLight,
        // Device classes
        [`device-${deviceType}`]: true,
        "is-mobile": isMobile,
        "is-tablet": isTablet,
        "is-desktop": isDesktop,
        // Combined state classes
        [`${colorScheme}-${deviceType}`]: true,
        [`theme-${colorScheme}-device-${deviceType}`]: true,
        // Responsive theme combinations
        "dark-mobile": isDark && isMobile,
        "dark-tablet": isDark && isTablet,
        "dark-desktop": isDark && isDesktop,
        "light-mobile": isLight && isMobile,
        "light-tablet": isLight && isTablet,
        "light-desktop": isLight && isDesktop,
      };
    } catch (_err) {
      logger?.warn?.(
        "unifiedClasses computation failed – returning empty object",
        err,
      );
      return {
        "color-scheme-light": true,
        "device-desktop": true,
        "is-light": true,
        "is-desktop": true,
      };
    }
  });

  // Unified configuration object for components
  const uiConfig = computed(() => ({
    // Theme info
    theme: {
      mode: theme.themeMode.value,
      colorScheme: theme.colorScheme.value,
      isDark: theme.isDark.value,
      isLight: theme.isLight.value,
      isSystem: theme.isSystem.value,
    },

    // Device info
    device: {
      type: responsive?.deviceType.value || "desktop",
      isMobile: responsive?.isMobile.value || false,
      isTablet: responsive?.isTablet.value || false,
      isDesktop: responsive?.isDesktop.value || false,
      breakpoint: responsive?.currentBreakpoint.value || "md",
    },

    // Combined flags for conditional logic
    flags: {
      isDarkMobile: theme.isDark.value && (responsive?.isMobile.value || false),
      isDarkTablet: theme.isDark.value && (responsive?.isTablet.value || false),
      isDarkDesktop:
        theme.isDark.value && (responsive?.isDesktop.value || false),
      isLightMobile:
        theme.isLight.value && (responsive?.isMobile.value || false),
      isLightTablet:
        theme.isLight.value && (responsive?.isTablet.value || false),
      isLightDesktop:
        theme.isLight.value && (responsive?.isDesktop.value || false),
      isSmallScreen: responsive?.isSmallMobile.value || false,
      needsCompactUI:
        responsive?.isMobile.value ||
        false ||
        ((responsive?.isTablet.value || false) && theme.isDark.value),
    },
  }));

  // Density management (global)
  const density = useStorage<"compact" | "normal" | "comfortable">(
    "ui-density",
    "normal",
  );

  const applyDensityClass = (value: "compact" | "normal" | "comfortable") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove(
      "density-compact",
      "density-comfortable",
      "compact-ui",
    );
    if (value === "compact") {
      root.classList.add("density-compact");
      // Also expose a generic compact class for components that key off it
      root.classList.add("compact-ui");
    }
    if (value === "comfortable") root.classList.add("density-comfortable");
  };

  const setDensity = (value: "compact" | "normal" | "comfortable") => {
    density.value = value;
    applyDensityClass(value);
  };

  const cycleDensity = () => {
    const order: Array<"compact" | "normal" | "comfortable"> = [
      "compact",
      "normal",
      "comfortable",
    ];
    const idx = order.indexOf(density.value);
    setDensity(next);
  };

  onMounted(() => applyDensityClass(density.value));
  watch(density, (v) => applyDensityClass(v));

  // Responsive styling helpers based on theme
  const getThemedResponsiveStyle = (styleConfig: {
    mobile?: { light?: any; dark?: any; default?: any };
    tablet?: { light?: any; dark?: any; default?: any };
    desktop?: { light?: any; dark?: any; default?: any };
  }) => {
    const deviceConfig =
      styleConfig[responsive?.deviceType?.value || "desktop"] || {};
    const themeStyle = deviceConfig[theme.colorScheme.value];
    const defaultStyle = deviceConfig.default;

    return themeStyle || defaultStyle || {};
  };

  // Component sizing based on device and theme
  const getComponentSize = (config: {
    mobile?: { light?: string; dark?: string; default?: string };
    tablet?: { light?: string; dark?: string; default?: string };
    desktop?: { light?: string; dark?: string; default?: string };
  }) => {
    const deviceConfig =
      config[responsive?.deviceType?.value || "desktop"] || {};
    return (
      deviceConfig[theme.colorScheme.value] ||
      deviceConfig.default ||
      (responsive?.isMobile?.value || false
        ? "sm"
        : responsive?.isTablet?.value || false
          ? "md"
          : "lg")
    );
  };

  // Grid configuration based on device and theme
  const getGridConfig = (baseConfig: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  }) => {
    // Fallback for responsive methods that might not exist
    const deviceType = responsive?.deviceType?.value || "desktop";

    // Adjust for dark theme on smaller screens (might need more compact layout)
    if (
      theme.isDark.value &&
      (responsive?.isMobile?.value || false) &&
      columns > 2
    ) {
      columns = Math.max(1, columns - 1);
    }

    return columns;
  };

  // Spacing configuration based on device and theme
  const getSpacing = (config?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
    const deviceType = responsive?.deviceType?.value || "desktop";

    // Slightly reduce spacing in dark mode on mobile for better density
    if (theme.isDark.value && (responsive?.isMobile?.value || false)) {
      const numValue = parseFloat(baseSpacing);
      const unit = baseSpacing.replace(numValue.toString(), "");
    }

    return baseSpacing;
  };

  // Font size with theme consideration
  const getFontSize = (config?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
    const deviceType = responsive?.deviceType?.value || "desktop";

    // Slightly increase font size in dark mode for better readability
    if (theme.isDark.value) {
      const numValue = parseFloat(baseSize);
      const unit = baseSize.replace(numValue.toString(), "");
    }

    return baseSize;
  };

  // Card/container styling based on context
  const getCardClasses = (
    variant: "default" | "elevated" | "subtle" | "bordered" = "default",
  ) => {
    const baseClasses = ["unified-card"];

    // Theme-based classes
    baseClasses.push(theme.isDark.value ? "card-dark" : "card-light");

    // Device-based classes
    baseClasses.push(`card-${responsive.deviceType.value}`);

    // Variant classes
    baseClasses.push(`card-${variant}`);

    // Combined state classes
    if (theme.isDark.value && responsive.isMobile.value) {
      baseClasses.push("card-dark-mobile");
    }

    return baseClasses;
  };

  // Button styling based on context
  const getButtonClasses = (
    variant: "primary" | "secondary" | "danger" | "success" = "primary",
    size?: "sm" | "md" | "lg",
  ) => {
    const autoSize =
      size ||
      getComponentSize({
        mobile: { default: "sm" },
        tablet: { default: "md" },
        desktop: { default: "lg" },
      });

    const colorScheme = theme?.colorScheme?.value || "light";
    const deviceType = responsive?.deviceType?.value || "desktop";
    const isDark = Boolean(theme?.isDark?.value);
    const isMobile = Boolean(responsive?.isMobile?.value);

    return [
      "unified-btn",
      `btn-${variant}`,
      `btn-${autoSize}`,
      `btn-${colorScheme}`,
      `btn-${deviceType}`,
      isDark && isMobile ? "btn-dark-mobile" : null,
    ].filter(Boolean);
  };

  // Input styling based on context
  const getInputClasses = (
    variant: "default" | "search" | "textarea" = "default",
  ) => {
    const colorScheme = theme?.colorScheme?.value || "light";
    const deviceType = responsive?.deviceType?.value || "desktop";
    const isMobile = Boolean(responsive?.isMobile?.value);

    return [
      "unified-input",
      `input-${variant}`,
      `input-${colorScheme}`,
      `input-${deviceType}`,
      isMobile ? "input-mobile-optimized" : null,
    ].filter(Boolean);
  };

  // Responsive classes helper (for backward compatibility)
  const getResponsiveClasses = (additionalClasses: string[] = []) => {
    return [
      `responsive-${responsive.deviceType.value}`,
      `breakpoint-${responsive.currentBreakpoint.value}`,
      responsive.isMobile.value ? "is-mobile" : null,
      responsive.isTablet.value ? "is-tablet" : null,
      responsive.isDesktop.value ? "is-desktop" : null,
      ...additionalClasses,
    ].filter(Boolean);
  };

  // Initialize both systems
  const initialize = () => {
    theme.initializeTheme();
    responsive.initializeResponsive();
  };

  return {
    // Individual systems
    theme,
    responsive,

    // Unified state
    unifiedClasses,
    uiConfig,

    // Styling helpers
    getThemedResponsiveStyle,
    getComponentSize,
    getGridConfig,
    getSpacing,
    getFontSize,

    // Component helpers
    getCardClasses,
    getButtonClasses,
    getInputClasses,
    getResponsiveClasses,

    // Initialization
    initialize,

    // Density API
    density,
    setDensity,
    cycleDensity,
  };
}

// Auto-initialize unified UI system
let isInitialized = false;
  if (!isInitialized && typeof window !== "undefined") {
    isInitialized = true;
    try {
      // Initialize theme and responsive systems directly
      const themeComposable = useUnifiedTheme();
      const responsiveComposable = useResponsive();

      themeComposable.initializeTheme();
      responsiveComposable.initializeResponsive();

      logger?.info?.("Unified UI system initialized successfully");
    } catch (_err) {
      logger?.warn?.("autoInitializeUnifiedUI failed", err);
    }
  }
}

// Export for backward compatibility with unified theme system
export { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
