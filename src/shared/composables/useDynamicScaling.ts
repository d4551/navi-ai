
import {computedonUnmounted, watch, readonly } from "vue";
import { useThrottleFn } from "@vueuse/core";
import { logger } from "@/shared/utils/logger";

export interface ScalingConfig {
  // Base viewport dimensions for scaling calculations
  baseWidth: number;
  baseHeight: number;

  // Scaling constraints
  minScale: number;
  maxScale: number;

  // Responsive breakpoints
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  // Font scaling options
  enableFontScaling: boolean;
  fontScaleRatio: number;

  // Performance options
  throttleMs: number;
  enablePerformanceOptimization: boolean;
}

const DEFAULT_CONFIG: ScalingConfig = {
  breakpoints: {
  },
  enableFontScaling: true,
  enablePerformanceOptimization: true,
};

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Reactive state
  const isResizing = ref(false);

  // Computed scaling values
  const scaleRatio = computed(() => {

    // Calculate scale based on viewport dimensions
    const widthScale = viewportWidth.value / finalConfig.baseWidth;
    const heightScale = viewportHeight.value / finalConfig.baseHeight;

    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(widthScale, heightScale);

    // Apply constraints
    return Math.min(
      Math.max(scale, finalConfig.minScale),
      finalConfig.maxScale,
    );
  });

  const currentBreakpoint = computed(() => {
    const width = viewportWidth.value;
    const bp = finalConfig.breakpoints;

    if (width >= bp.xl) return "xl";
    if (width >= bp.lg) return "lg";
    if (width >= bp.md) return "md";
    if (width >= bp.sm) return "sm";
    return "xs";
  });

  const isMobile = computed(() =>
    ["xs", "sm"].includes(currentBreakpoint.value),
  );
  const isTablet = computed(() => currentBreakpoint.value === "md");
  const isDesktop = computed(() =>
  );

  const scaledFontSize = computed(() => {


  });

  const cssCustomProperties = computed(() => ({
    "--viewport-width": `${viewportWidth.value}px`,
    "--viewport-height": `${viewportHeight.value}px`,
    "--scale-ratio": scaleRatio.value.toString(),
    "--scaled-font-size": scaledFontSize.value,
    "--current-breakpoint": currentBreakpoint.value,
    "--device-pixel-ratio": devicePixelRatio.value.toString(),
  }));

  // Performance optimization flags
  const shouldOptimizeAnimations = computed(() => {
    return (
      finalConfig.enablePerformanceOptimization &&
      (isResizing.value ||
        viewportWidth.value < finalConfig.breakpoints.md ||
    );
  });

  const shouldReduceEffects = computed(() => {
    return (
      finalConfig.enablePerformanceOptimization &&
      (viewportWidth.value < finalConfig.breakpoints.sm ||
    );
  });

  // Update viewport dimensions
  const updateDimensions = () => {
    if (typeof window === "undefined") return;

    viewportWidth.value = window.innerWidth;
    viewportHeight.value = window.innerHeight;

    // Log viewport updates less frequently to reduce spam
    const logKey = "__navi_viewport_log_time";
    const now = Date.now();

      // Only log once per second max
      (window as any)[logKey] = now;
      logger.debug("Viewport updated:", {
        width: viewportWidth.value,
        height: viewportHeight.value,
        ratio: devicePixelRatio.value,
        breakpoint: currentBreakpoint.value,
        scale: scaleRatio.value,
      });
    }
  }; // Throttled resize handler
  const throttledUpdateDimensions = useThrottleFn(() => {
    isResizing.value = true;
    updateDimensions();

    // Reset resizing flag after a delay
    setTimeout(() => {
      isResizing.value = false;
  }, finalConfig.throttleMs);

  // Apply CSS custom properties to document root
  const applyCSSProperties = () => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const properties = cssCustomProperties.value;

    Object.entries(properties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add breakpoint classes for CSS targeting
    root.classList.add(currentBreakpoint.value);

    // Add device type classes
    root.classList.toggle("mobile", isMobile.value);
    root.classList.toggle("tablet", isTablet.value);
    root.classList.toggle("desktop", isDesktop.value);

    // Add performance optimization classes
    root.classList.toggle(
      "optimize-animations",
      shouldOptimizeAnimations.value,
    );
    root.classList.toggle("reduce-effects", shouldReduceEffects.value);
  };

  const getScaledValue = (baseValue: number): number => {
  };

  const getResponsiveValue = <T>(
    values: Partial<Record<keyof ScalingConfig["breakpoints"], T>>,
  ): T | undefined => {
    const bp = currentBreakpoint.value as keyof ScalingConfig["breakpoints"];

    // Try exact match first
    if (values[bp]) return values[bp];

    // Fallback to smaller breakpoints
    const fallbackOrder: (keyof ScalingConfig["breakpoints"])[] = [
      "xl",
      "lg",
      "md",
      "sm",
      "xs",
    ];
    const currentIndex = fallbackOrder.indexOf(bp);

      const fallback = fallbackOrder[i];
      if (values[fallback]) return values[fallback];
    }

    return undefined;
  };

  const isBreakpointUp = (
    breakpoint: keyof ScalingConfig["breakpoints"],
  ): boolean => {
    return viewportWidth.value >= finalConfig.breakpoints[breakpoint];
  };

  const isBreakpointDown = (
    breakpoint: keyof ScalingConfig["breakpoints"],
  ): boolean => {
    return viewportWidth.value < finalConfig.breakpoints[breakpoint];
  };

  const getOptimalImageSize = (baseWidth: number, baseHeight: number) => {
    const scaledWidth = Math.round(
    );
    const scaledHeight = Math.round(
    );

    return {
      width: scaledWidth,
      height: scaledHeight,
      src: `${baseWidth}x${baseHeight}`,
      srcSet: [
      ].join(", "),
    };
  };

  // Watch for changes and apply CSS properties
  watch(cssCustomProperties, applyCSSProperties, { immediate: false });

  // Lifecycle
  onMounted(() => {
    updateDimensions();
    applyCSSProperties();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", throttledUpdateDimensions);
      window.addEventListener("orientationchange", throttledUpdateDimensions);

      // Listen for pixel ratio changes (zoom, external monitor)
      if (window.matchMedia) {
        mediaQuery.addEventListener("change", updateDimensions);
      }
    }

    // Log only once per session to prevent spam
    if (!(window as any).__navi_scaling_logged) {
      (window as any).__navi_scaling_logged = true;
      logger.info("Dynamic scaling initialized", {
        config: finalConfig,
        initial: {
          width: viewportWidth.value,
          height: viewportHeight.value,
          breakpoint: currentBreakpoint.value,
          scale: scaleRatio.value,
        },
      });
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", throttledUpdateDimensions);
      window.removeEventListener(
        "orientationchange",
        throttledUpdateDimensions,
      );
    }
  });

  return {
    // State
    viewportWidth: readonly(viewportWidth),
    viewportHeight: readonly(viewportHeight),
    devicePixelRatio: readonly(devicePixelRatio),
    isResizing: readonly(isResizing),

    // Computed
    scaleRatio: readonly(scaleRatio),
    currentBreakpoint: readonly(currentBreakpoint),
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    scaledFontSize: readonly(scaledFontSize),
    cssCustomProperties: readonly(cssCustomProperties),
    shouldOptimizeAnimations: readonly(shouldOptimizeAnimations),
    shouldReduceEffects: readonly(shouldReduceEffects),

    // Methods
    updateDimensions,
    applyCSSProperties,
    getScaledValue,
    getResponsiveValue,
    isBreakpointUp,
    isBreakpointDown,
    getOptimalImageSize,

    // Config
    config: finalConfig,
  };
}

// Global instance for app-wide scaling
let globalScalingInstance: ReturnType<typeof useDynamicScaling> | null = null;

  if (!globalScalingInstance) {
    globalScalingInstance = useDynamicScaling(_config);
  }
  return globalScalingInstance;
}

export default useDynamicScaling;
