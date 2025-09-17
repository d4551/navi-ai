/**
 * ACCESSIBILITY COMPOSABLE - WCAG 2.2 AA COMPLIANT
 * =================================================
 *
 * Comprehensive accessibility utilities for the gaming job platform
 * Features: Focus management, keyboard navigation, screen reader support,
 * high contrast mode, reduced motion support, and color accessibility
 */

import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { logger } from '@/shared/utils/logger'

interface AccessibilityState {
  highContrastEnabled: boolean
  reducedMotionEnabled: boolean
  largeTextEnabled: boolean
  keyboardNavigationActive: boolean
  screenReaderActive: boolean
  focusVisible: boolean
  colorBlindnessMode: ColorBlindnessType
}

type ColorBlindnessType =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'

type FocusableElement = HTMLElement | null

export function useAccessibility() {
  // Reactive state
  const state = ref<AccessibilityState>({
    highContrastEnabled: false,
    reducedMotionEnabled: false,
    largeTextEnabled: false,
    keyboardNavigationActive: false,
    screenReaderActive: false,
    focusVisible: false,
    colorBlindnessMode: 'none',
  })

  // Focus management
  const __focusStack = ref<HTMLElement[]>([])
  const trapFocusElement = ref<HTMLElement | null>(null)
  const lastActiveElement = ref<HTMLElement | null>(null)

  // Keyboard navigation
  const keyboardListeners = new Map<string, (event: KeyboardEvent) => void>()

  /**
   * Initialize accessibility features
   */
  const initialize = () => {
    detectUserPreferences()
    setupGlobalKeyboardListeners()
    injectAccessibilityStyles()
    setupFocusManagement()

    logger.info('[Accessibility] Initialized with preferences', state.value)
  }

  /**
   * Detect user accessibility preferences from system/browser
   */
  const detectUserPreferences = () => {
    // High contrast mode detection
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      state.value.highContrastEnabled = true
    }

    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.value.reducedMotionEnabled = true
    }

    // Large text preference
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) {
      state.value.largeTextEnabled = true
    }

    // Screen reader detection (basic heuristic)
    const hasScreenReader =
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis?.getVoices().length > 0

    if (hasScreenReader) {
      state.value.screenReaderActive = true
    }

    // Load saved preferences
    loadUserPreferences()
  }

  /**
   * Load saved accessibility preferences
   */
  const loadUserPreferences = () => {
    try {
      const saved = localStorage.getItem('accessibility-preferences')
      if (saved) {
        const preferences = JSON.parse(saved)
        Object.assign(state.value, preferences)
      }
    } catch (error) {
      logger.error('[Accessibility] Failed to load preferences:', error)
    }
  }

  /**
   * Save accessibility preferences
   */
  const saveUserPreferences = () => {
    try {
      localStorage.setItem(
        'accessibility-preferences',
        JSON.stringify(state.value)
      )
    } catch (error) {
      logger.error('[Accessibility] Failed to save preferences:', error)
    }
  }

  /**
   * Setup global keyboard event listeners
   */
  const setupGlobalKeyboardListeners = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect keyboard navigation
      if (event.key === 'Tab') {
        state.value.keyboardNavigationActive = true
        state.value.focusVisible = true
      }

      // Global keyboard shortcuts
      handleGlobalKeyboardShortcuts(event)

      // Focus trap handling
      if (trapFocusElement.value) {
        handleFocusTrap(event)
      }
    }

    const handleMouseDown = () => {
      // Reset focus visibility on mouse interaction
      state.value.focusVisible = false
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // Cleanup function will be called in onUnmounted
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }

  /**
   * Handle global keyboard shortcuts
   */
  const handleGlobalKeyboardShortcuts = (event: KeyboardEvent) => {
    // Skip links (Alt + S)
    if (event.altKey && event.key.toLowerCase() === 's') {
      event.preventDefault()
      focusSkipLink()
    }

    // Main content (Alt + M)
    if (event.altKey && event.key.toLowerCase() === 'm') {
      event.preventDefault()
      focusMainContent()
    }

    // Navigation (Alt + N)
    if (event.altKey && event.key.toLowerCase() === 'n') {
      event.preventDefault()
      focusNavigation()
    }

    // Search (Alt + F or Ctrl/Cmd + K)
    if (
      (event.altKey && event.key.toLowerCase() === 'f') ||
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')
    ) {
      event.preventDefault()
      focusSearch()
    }

    // Toggle high contrast (Alt + Shift + H)
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'h') {
      event.preventDefault()
      toggleHighContrast()
    }
  }

  /**
   * Focus trap implementation for modals/dialogs
   */
  const handleFocusTrap = (event: KeyboardEvent) => {
    if (!trapFocusElement.value || event.key !== 'Tab') return

    const focusableElements = getFocusableElements(trapFocusElement.value)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Get all focusable elements within a container
   */
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(
      element => {
        return (
          element instanceof HTMLElement &&
          !element.hasAttribute('inert') &&
          element.offsetWidth > 0 &&
          element.offsetHeight > 0
        )
      }
    ) as HTMLElement[]
  }

  /**
   * Focus management utilities
   */
  const setupFocusManagement = () => {
    // Store the last focused element when page loads
    if (document.activeElement instanceof HTMLElement) {
      lastActiveElement.value = document.activeElement
    }
  }

  /**
   * Focus management functions
   */
  const focusElement = (
    element: HTMLElement | string,
    options?: FocusOptions
  ) => {
    const target =
      typeof element === 'string'
        ? (document.querySelector(element) as HTMLElement)
        : element

    if (target) {
      target.focus(_options)
      return true
    }
    return false
  }

  const focusSkipLink = () => {
    focusElement('#skip-to-main', { preventScroll: false })
  }

  const focusMainContent = () => {
    focusElement('main, [role="main"], #main-content')
  }

  const focusNavigation = () => {
    focusElement('nav, [role="navigation"], #main-nav')
  }

  const focusSearch = () => {
    focusElement('input[type="search"], [role="search"] input, .search-input')
  }

  /**
   * Focus trap management
   */
  const trapFocus = (element: HTMLElement) => {
    if (trapFocusElement.value) {
      releaseFocusTrap()
    }

    trapFocusElement.value = element
    lastActiveElement.value = document.activeElement as HTMLElement

    // Focus first focusable element
    const focusableElements = getFocusableElements(element)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    logger.debug('[Accessibility] Focus trapped in element', element)
  }

  const releaseFocusTrap = () => {
    if (!trapFocusElement.value) return

    trapFocusElement.value = null

    // Restore focus to last active element
    if (lastActiveElement.value) {
      lastActiveElement.value.focus()
      lastActiveElement.value = null
    }

    logger.debug('[Accessibility] Focus trap released')
  }

  /**
   * Accessibility preference toggles
   */
  const toggleHighContrast = () => {
    state.value.highContrastEnabled = !state.value.highContrastEnabled
    applyHighContrastMode()
    saveUserPreferences()
    announceToScreenReader(
      `High contrast mode ${state.value.highContrastEnabled ? 'enabled' : 'disabled'}`
    )
  }

  const toggleReducedMotion = () => {
    state.value.reducedMotionEnabled = !state.value.reducedMotionEnabled
    applyReducedMotion()
    saveUserPreferences()
    announceToScreenReader(
      `Reduced motion ${state.value.reducedMotionEnabled ? 'enabled' : 'disabled'}`
    )
  }

  const toggleLargeText = () => {
    state.value.largeTextEnabled = !state.value.largeTextEnabled
    applyLargeText()
    saveUserPreferences()
    announceToScreenReader(
      `Large text ${state.value.largeTextEnabled ? 'enabled' : 'disabled'}`
    )
  }

  const setColorBlindnessMode = (mode: ColorBlindnessType) => {
    state.value.colorBlindnessMode = mode
    applyColorBlindnessMode()
    saveUserPreferences()
    announceToScreenReader(`Color blindness mode set to ${mode}`)
  }

  /**
   * Apply accessibility modes
   */
  const applyHighContrastMode = () => {
    document.documentElement.classList.toggle(
      'high-contrast',
      state.value.highContrastEnabled
    )
  }

  const applyReducedMotion = () => {
    document.documentElement.classList.toggle(
      'reduced-motion',
      state.value.reducedMotionEnabled
    )
  }

  const applyLargeText = () => {
    document.documentElement.classList.toggle(
      'large-text',
      state.value.largeTextEnabled
    )
  }

  const applyColorBlindnessMode = () => {
    // Remove existing colorblind classes
    document.documentElement.classList.remove(
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'achromatopsia'
    )

    if (state.value.colorBlindnessMode !== 'none') {
      document.documentElement.classList.add(state.value.colorBlindnessMode)
    }
  }

  /**
   * Inject accessibility-specific styles
   */
  const injectAccessibilityStyles = () => {
    const styleId = 'accessibility-styles'
    if (document.getElementById(styleId)) return

    const styles = `
      /* High Contrast Mode */
      .high-contrast {
        --color-background: 0, 0, 0;
        --color-surface: 255, 255, 255;
        --color-primary: 255, 255, 0;
        --color-on-background: 255, 255, 255;
        --color-on-surface: 0, 0, 0;
        --color-outline: 255, 255, 255;
        filter: contrast(1.5);
      }

      /* Reduced Motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      /* Large Text */
      .large-text {
        font-size: 120% !important;
        line-height: 1.6 !important;
      }

      .large-text .v-btn {
        min-height: 48px !important;
      }

      .large-text .v-text-field input {
        font-size: 1.2em !important;
      }

      /* Focus Visibility */
      .keyboard-navigation *:focus {
        outline: 3px solid rgb(var(--color-primary)) !important;
        outline-offset: 2px !important;
      }

      /* Color Blindness Filters */
      .protanopia {
        filter: url('#protanopia-filter');
      }

      .deuteranopia {
        filter: url('#deuteranopia-filter');
      }

      .tritanopia {
        filter: url('#tritanopia-filter');
      }

      .achromatopsia {
        filter: grayscale(100%);
      }

      /* Skip Links removed */

      /* Screen Reader Only */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `

    const styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.textContent = styles
    document.head.appendChild(styleElement)

    // Add SVG filters for color blindness simulation
    injectColorBlindnessFilters()
  }

  /**
   * Inject SVG filters for color blindness simulation
   */
  const injectColorBlindnessFilters = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'

    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                               0.558, 0.442, 0,     0, 0
                                               0,     0.242, 0.758, 0, 0
                                               0,     0,     0,     1, 0"/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0,   0, 0
                                               0.7,   0.3,   0,   0, 0
                                               0,     0.3,   0.7, 0, 0
                                               0,     0,     0,   1, 0"/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95, 0.05,  0,     0, 0
                                               0,    0.433, 0.567, 0, 0
                                               0,    0.475, 0.525, 0, 0
                                               0,    0,     0,     1, 0"/>
        </filter>
      </defs>
    `

    document.body.appendChild(svg)
  }

  /**
   * Screen reader announcements
   */
  const announceToScreenReader = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.setAttribute('class', 'sr-only')
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove the announcement after it's been read
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  /**
   * Keyboard shortcut management
   */
  const addKeyboardShortcut = (
    key: string,
    handler: (event: KeyboardEvent) => void,
    options?: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean }
  ) => {
    const shortcutKey = `${key}-${JSON.stringify(options || {})}`
    keyboardListeners.set(shortcutKey, handler)
  }

  const removeKeyboardShortcut = (key: string, options?: any) => {
    const shortcutKey = `${key}-${JSON.stringify(options || {})}`
    keyboardListeners.delete(shortcutKey)
  }

  // Computed properties
  const accessibilityClasses = computed(() => ({
    'high-contrast': state.value.highContrastEnabled,
    'reduced-motion': state.value.reducedMotionEnabled,
    'large-text': state.value.largeTextEnabled,
    'keyboard-navigation': state.value.keyboardNavigationActive,
    'screen-reader-active': state.value.screenReaderActive,
    [`colorblind-${state.value.colorBlindnessMode}`]:
      state.value.colorBlindnessMode !== 'none',
  }))

  const isAccessibilityModeActive = computed(
    () =>
      state.value.highContrastEnabled ||
      state.value.reducedMotionEnabled ||
      state.value.largeTextEnabled ||
      state.value.colorBlindnessMode !== 'none'
  )

  // Watchers for applying changes
  watch(() => state.value.highContrastEnabled, applyHighContrastMode)
  watch(() => state.value.reducedMotionEnabled, applyReducedMotion)
  watch(() => state.value.largeTextEnabled, applyLargeText)
  watch(() => state.value.colorBlindnessMode, applyColorBlindnessMode)

  // Lifecycle
  onMounted(initialize)

  let keyboardCleanup: (() => void) | null = null

  onMounted(() => {
    keyboardCleanup = setupGlobalKeyboardListeners()
  })

  onUnmounted(() => {
    if (keyboardCleanup) {
      keyboardCleanup()
    }
    releaseFocusTrap()
  })

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
  }
}
