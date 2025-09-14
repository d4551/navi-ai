
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { logger } from "@/shared/utils/logger";

interface AccessibilityState {
  highContrastEnabled: boolean;
  reducedMotionEnabled: boolean;
  largeTextEnabled: boolean;
  keyboardNavigationActive: boolean;
  screenReaderActive: boolean;
  focusVisible: boolean;
  colorBlindnessMode: ColorBlindnessType;
}

type ColorBlindnessType =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

type FocusableElement = HTMLElement | null;

  // Reactive state
  const state = ref<AccessibilityState>({
    highContrastEnabled: false,
    reducedMotionEnabled: false,
    largeTextEnabled: false,
    keyboardNavigationActive: false,
    screenReaderActive: false,
    focusVisible: false,
    colorBlindnessMode: "none",
  });

  // Focus management
  const __focusStack = ref<HTMLElement[]>([]);
  const trapFocusElement = ref<HTMLElement | null>(null);
  const lastActiveElement = ref<HTMLElement | null>(null);

  // Keyboard navigation
  const keyboardListeners = new Map<string, (event: KeyboardEvent) => void>();

  const initialize = () => {
    detectUserPreferences();
    setupGlobalKeyboardListeners();
    injectAccessibilityStyles();
    setupFocusManagement();

    logger.info("[Accessibility] Initialized with preferences", state.value);
  };

  const detectUserPreferences = () => {
    // High contrast mode detection
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      state.value.highContrastEnabled = true;
    }

    // Reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.value.reducedMotionEnabled = true;
    }

    // Large text preference
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) {
      state.value.largeTextEnabled = true;
    }

    // Screen reader detection (basic heuristic)
    const hasScreenReader =
      window.navigator.userAgent.includes("NVDA") ||
      window.navigator.userAgent.includes("JAWS") ||

    if (hasScreenReader) {
      state.value.screenReaderActive = true;
    }

    // Load saved preferences
    loadUserPreferences();
  };

  const loadUserPreferences = () => {
    try {
      const saved = localStorage.getItem("accessibility-preferences");
      if (saved) {
        const preferences = JSON.parse(saved);
        Object.assign(state.value, preferences);
      }
    } catch (_error) {
      logger.error("[Accessibility] Failed to load preferences:", error);
    }
  };

  const saveUserPreferences = () => {
    try {
      localStorage.setItem(
        "accessibility-preferences",
        JSON.stringify(state.value),
      );
    } catch (_error) {
      logger.error("[Accessibility] Failed to save preferences:", error);
    }
  };

  const setupGlobalKeyboardListeners = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect keyboard navigation
      if (event.key === "Tab") {
        state.value.keyboardNavigationActive = true;
        state.value.focusVisible = true;
      }

      // Global keyboard shortcuts
      handleGlobalKeyboardShortcuts(event);

      // Focus trap handling
      if (trapFocusElement.value) {
        handleFocusTrap(event);
      }
    };

    const handleMouseDown = () => {
      // Reset focus visibility on mouse interaction
      state.value.focusVisible = false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  };

  const handleGlobalKeyboardShortcuts = (event: KeyboardEvent) => {
    // Skip links (Alt + S)
    if (event.altKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      focusSkipLink();
    }

    // Main content (Alt + M)
    if (event.altKey && event.key.toLowerCase() === "m") {
      event.preventDefault();
      focusMainContent();
    }

    // Navigation (Alt + N)
    if (event.altKey && event.key.toLowerCase() === "n") {
      event.preventDefault();
      focusNavigation();
    }

    // Search (Alt + F or Ctrl/Cmd + K)
    if (
      (event.altKey && event.key.toLowerCase() === "f") ||
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")
    ) {
      event.preventDefault();
      focusSearch();
    }

    // Toggle high contrast (Alt + Shift + H)
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === "h") {
      event.preventDefault();
      toggleHighContrast();
    }
  };

  const handleFocusTrap = (event: KeyboardEvent) => {
    if (!trapFocusElement.value || event.key !== "Tab") return;

    const focusableElements = getFocusableElements(trapFocusElement.value);


    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      "[contenteditable]",
    ].join(", ");

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(
      (element) => {
        return (
          element instanceof HTMLElement &&
          !element.hasAttribute("inert") &&
        );
      },
    ) as HTMLElement[];
  };

  const setupFocusManagement = () => {
    // Store the last focused element when page loads
    if (document.activeElement instanceof HTMLElement) {
      lastActiveElement.value = document.activeElement;
    }
  };

  const focusElement = (
    element: HTMLElement | string,
    options?: FocusOptions,
  ) => {
    const target =
      typeof element === "string"
        ? (document.querySelector(element) as HTMLElement)
        : element;

    if (target) {
      target.focus(_options);
      return true;
    }
    return false;
  };

  const focusSkipLink = () => {
  };

  const focusMainContent = () => {
  };

  const focusNavigation = () => {
  };

  const focusSearch = () => {
    focusElement('input[type="search"], [role="search"] input, .search-input');
  };

  const trapFocus = (element: HTMLElement) => {
    if (trapFocusElement.value) {
      releaseFocusTrap();
    }

    trapFocusElement.value = element;
    lastActiveElement.value = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = getFocusableElements(element);
    }

    logger.debug("[Accessibility] Focus trapped in element", element);
  };

  const releaseFocusTrap = () => {
    if (!trapFocusElement.value) return;

    trapFocusElement.value = null;

    // Restore focus to last active element
    if (lastActiveElement.value) {
      lastActiveElement.value.focus();
      lastActiveElement.value = null;
    }

    logger.debug("[Accessibility] Focus trap released");
  };

  const toggleHighContrast = () => {
    state.value.highContrastEnabled = !state.value.highContrastEnabled;
    applyHighContrastMode();
    saveUserPreferences();
    announceToScreenReader(
      `High contrast mode ${state.value.highContrastEnabled ? "enabled" : "disabled"}`,
    );
  };

  const toggleReducedMotion = () => {
    state.value.reducedMotionEnabled = !state.value.reducedMotionEnabled;
    applyReducedMotion();
    saveUserPreferences();
    announceToScreenReader(
      `Reduced motion ${state.value.reducedMotionEnabled ? "enabled" : "disabled"}`,
    );
  };

  const toggleLargeText = () => {
    state.value.largeTextEnabled = !state.value.largeTextEnabled;
    applyLargeText();
    saveUserPreferences();
    announceToScreenReader(
      `Large text ${state.value.largeTextEnabled ? "enabled" : "disabled"}`,
    );
  };

  const setColorBlindnessMode = (mode: ColorBlindnessType) => {
    state.value.colorBlindnessMode = mode;
    applyColorBlindnessMode();
    saveUserPreferences();
    announceToScreenReader(`Color blindness mode set to ${mode}`);
  };

  const applyHighContrastMode = () => {
    document.documentElement.classList.toggle(
      "high-contrast",
      state.value.highContrastEnabled,
    );
  };

  const applyReducedMotion = () => {
    document.documentElement.classList.toggle(
      "reduced-motion",
      state.value.reducedMotionEnabled,
    );
  };

  const applyLargeText = () => {
    document.documentElement.classList.toggle(
      "large-text",
      state.value.largeTextEnabled,
    );
  };

  const applyColorBlindnessMode = () => {
    // Remove existing colorblind classes
    document.documentElement.classList.remove(
      "protanopia",
      "deuteranopia",
      "tritanopia",
      "achromatopsia",
    );

    if (state.value.colorBlindnessMode !== "none") {
      document.documentElement.classList.add(state.value.colorBlindnessMode);
    }
  };

  const injectAccessibilityStyles = () => {
    const styleId = "accessibility-styles";
    if (document.getElementById(styleId)) return;

    const styles = `
      .high-contrast {
      }

        scroll-behavior: auto !important;
      }

      .large-text {
      }

      .large-text .v-btn {
      }

      .large-text .v-text-field input {
      }

      }

      .protanopia {
      }

      .deuteranopia {
      }

      .tritanopia {
      }

      .achromatopsia {
      }


      .sr-only {
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Add SVG filters for color blindness simulation
    injectColorBlindnessFilters();
  };

  const injectColorBlindnessFilters = () => {
    svg.style.position = "absolute";

    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
        </filter>
        <filter id="deuteranopia-filter">
        </filter>
        <filter id="tritanopia-filter">
        </filter>
      </defs>
    `;

    document.body.appendChild(svg);
  };

  const announceToScreenReader = (
    message: string,
    priority: "polite" | "assertive" = "polite",
  ) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.setAttribute("class", "sr-only");
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove the announcement after it's been read
    setTimeout(() => {
      document.body.removeChild(announcement);
  };

  const addKeyboardShortcut = (
    key: string,
    handler: (event: KeyboardEvent) => void,
    options?: {
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    },
  ) => {
    const shortcutKey = `${key}-${JSON.stringify(options || {})}`;
    keyboardListeners.set(shortcutKey, handler);
  };

  const removeKeyboardShortcut = (key: string, options?: any) => {
    const shortcutKey = `${key}-${JSON.stringify(options || {})}`;
    keyboardListeners.delete(shortcutKey);
  };

  // Computed properties
  const accessibilityClasses = computed(() => ({
    "high-contrast": state.value.highContrastEnabled,
    "reduced-motion": state.value.reducedMotionEnabled,
    "large-text": state.value.largeTextEnabled,
    "keyboard-navigation": state.value.keyboardNavigationActive,
    "screen-reader-active": state.value.screenReaderActive,
    [`colorblind-${state.value.colorBlindnessMode}`]:
      state.value.colorBlindnessMode !== "none",
  }));

  const isAccessibilityModeActive = computed(
    () =>
      state.value.highContrastEnabled ||
      state.value.reducedMotionEnabled ||
      state.value.largeTextEnabled ||
      state.value.colorBlindnessMode !== "none",
  );

  // Watchers for applying changes
  watch(() => state.value.highContrastEnabled, applyHighContrastMode);
  watch(() => state.value.reducedMotionEnabled, applyReducedMotion);
  watch(() => state.value.largeTextEnabled, applyLargeText);
  watch(() => state.value.colorBlindnessMode, applyColorBlindnessMode);

  // Lifecycle
  onMounted(initialize);

  let keyboardCleanup: (() => void) | null = null;

  onMounted(() => {
    keyboardCleanup = setupGlobalKeyboardListeners();
  });

  onUnmounted(() => {
    if (keyboardCleanup) {
      keyboardCleanup();
    }
    releaseFocusTrap();
  });

  return {
    // State
    state: readonly(state),
    accessibilityClasses,
    isAccessibilityModeActive,

    // Focus management
    focusElement,
    focusMainContent,
    focusNavigation,
    focusSearch,
    trapFocus,
    releaseFocusTrap,

    // Accessibility toggles
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    setColorBlindnessMode,

    // Utilities
    announceToScreenReader,
    addKeyboardShortcut,
    removeKeyboardShortcut,
    getFocusableElements,
    saveUserPreferences,
    loadUserPreferences,
  };
}
