import { ref, readonly, computed } from "vue";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";

// Enhanced breakpoint definitions (matching modern device standards)
const BREAKPOINTS = {
} as const;

// Global reactive state

  // Enhanced current breakpoint detection
  const currentBreakpoint = computed<Breakpoint>(() => {
    const width = windowWidth.value;
    if (width >= BREAKPOINTS.xxxl) return "xxxl";
    if (width >= BREAKPOINTS.xxl) return "xxl";
    if (width >= BREAKPOINTS.xl) return "xl";
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "xs";
  });

  // Device type detection
  const deviceType = computed<DeviceType>(() => {
    const width = windowWidth.value;
    if (width < BREAKPOINTS.md) return "mobile";
    if (width < BREAKPOINTS.lg) return "tablet";
    return "desktop";
  });

  // Specific device checks
  const isMobile = computed(() => deviceType.value === "mobile");
  const isTablet = computed(() => deviceType.value === "tablet");
  const isDesktop = computed(() => deviceType.value === "desktop");

  // Enhanced granular breakpoint checks
  const isXs = computed(() => windowWidth.value < BREAKPOINTS.sm);
  const isSm = computed(
    () =>
      windowWidth.value >= BREAKPOINTS.sm && windowWidth.value < BREAKPOINTS.md,
  );
  const isMd = computed(
    () =>
      windowWidth.value >= BREAKPOINTS.md && windowWidth.value < BREAKPOINTS.lg,
  );
  const isLg = computed(
    () =>
      windowWidth.value >= BREAKPOINTS.lg && windowWidth.value < BREAKPOINTS.xl,
  );
  const isXl = computed(
    () =>
      windowWidth.value >= BREAKPOINTS.xl &&
      windowWidth.value < BREAKPOINTS.xxl,
  );
  const isXxl = computed(
    () =>
      windowWidth.value >= BREAKPOINTS.xxl &&
      windowWidth.value < BREAKPOINTS.xxxl,
  );
  const isXxxl = computed(() => windowWidth.value >= BREAKPOINTS.xxxl);

  // Ultra-wide display detection
  const isUltraWide = computed(
    () =>
  );

  // Responsive range checks
  const isSmallMobile = computed(() => windowWidth.value < BREAKPOINTS.mobile);
  const isMobileUp = computed(() => windowWidth.value >= BREAKPOINTS.mobile);
  const isTabletUp = computed(() => windowWidth.value >= BREAKPOINTS.md);
  const isDesktopUp = computed(() => windowWidth.value >= BREAKPOINTS.lg);

  // Enhanced responsive classes for components
  const deviceClasses = computed(() => ({
    // Device type classes
    "device-mobile": isMobile.value,
    "device-tablet": isTablet.value,
    "device-desktop": isDesktop.value,
    [`device-${deviceType.value}`]: true,

    // Breakpoint classes
    [`breakpoint-${currentBreakpoint.value}`]: true,
    "breakpoint-xs": isXs.value,
    "breakpoint-sm": isSm.value,
    "breakpoint-md": isMd.value,
    "breakpoint-lg": isLg.value,
    "breakpoint-xl": isXl.value,
    "breakpoint-xxl": isXxl.value,
    "breakpoint-xxxl": isXxxl.value,

    // Range classes
    "small-mobile": isSmallMobile.value,
    "mobile-up": isMobileUp.value,
    "tablet-up": isTabletUp.value,
    "desktop-up": isDesktopUp.value,

    // Special display classes
    "ultra-wide": isUltraWide.value,

    // Screen ratio classes
    landscape: screenInfo.value.isLandscape,
    portrait: screenInfo.value.isPortrait,
  }));

  // Screen size helpers
  const screenInfo = computed(() => ({
    width: windowWidth.value,
    height: windowHeight.value,
    aspectRatio: windowWidth.value / windowHeight.value,
    isLandscape: windowWidth.value > windowHeight.value,
    isPortrait: windowWidth.value <= windowHeight.value,
    deviceType: deviceType.value,
    breakpoint: currentBreakpoint.value,
  }));

  // Responsive grid columns calculation
  const getGridColumns = (config: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  }) => {
  };

  // Responsive spacing calculation
  const getResponsiveSpacing = (config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
  };

  // Responsive font size calculation
  const getResponsiveFontSize = (config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
  };

  // Check if screen matches breakpoint
  const matchesBreakpoint = (breakpoint: Breakpoint | "mobile"): boolean => {
    if (breakpoint === "mobile") return windowWidth.value < BREAKPOINTS.md;
    return currentBreakpoint.value === breakpoint;
  };

  // Check if screen is at least breakpoint
  const isBreakpointUp = (breakpoint: Breakpoint | "mobile"): boolean => {
    if (breakpoint === "mobile") return windowWidth.value >= BREAKPOINTS.mobile;
    return windowWidth.value >= BREAKPOINTS[breakpoint];
  };

  // Check if screen is below breakpoint
  const isBreakpointDown = (breakpoint: Breakpoint | "mobile"): boolean => {
    if (breakpoint === "mobile") return windowWidth.value < BREAKPOINTS.mobile;
    return windowWidth.value < BREAKPOINTS[breakpoint];
  };

  // Update window dimensions
  const updateDimensions = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  };

  // Debounced resize handler
  let resizeTimeout: ReturnType<typeof setTimeout>;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
  };

  // Initialize responsive system
  const initializeResponsive = () => {
    if (typeof window !== "undefined") {
      updateDimensions();
      window.addEventListener("resize", handleResize);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    }
  };

  // Responsive CSS helpers
  const getResponsiveCSS = () => ({
    containerPadding: getResponsiveSpacing({
    }),
    fontSize: getResponsiveFontSize({
    }),
  });

  // Media query helpers for programmatic use
  const createMediaQuery = (query: string) => {
    if (typeof window === "undefined")
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    return window.matchMedia(query);
  };

  const watchBreakpoint = (
    breakpoint: Breakpoint | "mobile",
    callback: (matches: boolean) => void,
  ) => {
    const query =
      breakpoint === "mobile"
        : `(min-width: ${BREAKPOINTS[breakpoint]}px)`;

    const mediaQuery = createMediaQuery(query);
    const handler = (e: Event) => callback((e as MediaQueryListEvent).matches);

    // MediaQueryList in modern browsers supports addEventListener
    mediaQuery.addEventListener("change", handler as EventListener);
    callback(mediaQuery.matches); // Initial call

    return () =>
      mediaQuery.removeEventListener("change", handler as EventListener);
  };

  return {
    // State
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    currentBreakpoint,
    deviceType,
    screenInfo,

    // Device checks
    isMobile,
    isTablet,
    isDesktop,

    // Breakpoint checks
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,

    // Range checks
    isSmallMobile,
    isMobileUp,
    isTabletUp,
    isDesktopUp,

    // CSS classes
    deviceClasses,

    // Utilities
    getGridColumns,
    getResponsiveSpacing,
    getResponsiveFontSize,
    getResponsiveCSS,
    matchesBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    watchBreakpoint,

    // Lifecycle
    initializeResponsive,
    cleanup,
  };
}

// Auto-initialize responsive system
let isInitialized = false;
  if (!isInitialized && typeof window !== "undefined") {
    isInitialized = true;
    const { initializeResponsive } = useResponsive();
    initializeResponsive();
  }
}
