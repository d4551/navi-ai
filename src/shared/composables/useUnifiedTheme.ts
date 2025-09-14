/**
 * UNIFIED THEME SYSTEM - SINGLE SOURCE OF TRUTH
 * =============================================
 * 
 * Consolidates all theme-related functionality from:
 * - useTheme.js + useTheme.ts (duplicated composables)
 * - modules/ui/theme/index.ts (theme constants)
 * 
 * Features:
 * - Dark/light mode switching with system preference detection
 * - Gaming-focused design tokens optimized for desktop
 * - Consistent color palette with accessibility compliance (WCAG 2.2 AA)
 * - Typography system using Electrolize font
 * - Component styling utilities
 * - Theme persistence across sessions
 */

import { ref, onMounted, readonly, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { logger } from '@/shared/utils/logger'
import { useDynamicScaling } from './useDynamicScaling'

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorScheme = 'light' | 'dark'

export interface ThemeColors {
  // Primary brand colors (gaming-focused)
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  // Secondary accent colors
  secondary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  // Semantic colors
  success: {
    50: string
    500: string
    600: string
    700: string
  }
  warning: {
    50: string
    500: string
    600: string
    700: string
  }
  error: {
    50: string
    500: string
    600: string
    700: string
  }
  // Neutral grays
  gray: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  // Surface colors
  background: string
  surface: string
  'surface-variant': string
  'on-background': string
  'on-surface': string
  'on-surface-variant': string
}

export interface ThemeDesignTokens {
  colors: ThemeColors
  typography: {
    fontFamily: {
      ui: string
      mono: string
      display: string
      primary?: string
      secondary?: string
      gaming?: string
    }
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
    letterSpacing: {
      tight: string
      normal: string
      wide: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  transitions: {
    fast: string
    normal: string
    slow: string
  }
}

// Gaming-optimized color palettes
const GAMING_COLORS: Record<ColorScheme, ThemeColors> = {
  light: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81'
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#0a0a0b'
    },
    background: '#ffffff',
    surface: '#ffffff',
    'surface-variant': 'rgba(255, 255, 255, 0.85)',
    'on-background': '#111827',
    'on-surface': '#111827',
    'on-surface-variant': '#4b5563'
  },
  dark: {
    primary: {
      50: '#1e1b4b',
      100: '#312e81',
      200: '#3730a3',
      300: '#4338ca',
      400: '#4f46e5',
      500: '#6366f1',
      600: '#818cf8',
      700: '#a5b4fc',
      800: '#c7d2fe',
      900: '#e0e7ff'
    },
    secondary: {
      50: '#0c1821',
      100: '#0c4a6e',
      200: '#075985',
      300: '#0369a1',
      400: '#0284c7',
      500: '#0ea5e9',
      600: '#38bdf8',
      700: '#7dd3fc',
      800: '#bae6fd',
      900: '#e0f2fe'
    },
    success: {
      50: '#14532d',
      500: '#22c55e',
      600: '#4ade80',
      700: '#86efac'
    },
    warning: {
      50: '#451a03',
      500: '#f59e0b',
      600: '#fbbf24',
      700: '#fcd34d'
    },
    error: {
      50: '#450a0a',
      500: '#ef4444',
      600: '#f87171',
      700: '#fca5a5'
    },
    gray: {
      50: '#0a0a0b',
      100: '#111827',
      200: '#1f2937',
      300: '#374151',
      400: '#4b5563',
      500: '#6b7280',
      600: '#9ca3af',
      700: '#d1d5db',
      800: '#e5e7eb',
      900: '#f3f4f6',
      950: '#f9fafb'
    },
    background: '#000000',
    surface: '#000000',
    'surface-variant': 'rgba(0, 0, 0, 0.85)',
    'on-background': '#f9fafb',
    'on-surface': '#f9fafb',
    'on-surface-variant': '#d1d5db'
  }
}

// Design tokens for consistent styling
const DESIGN_TOKENS: Omit<ThemeDesignTokens, 'colors'> = {
  typography: {
    fontFamily: {
      primary: "'Electrolize', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      secondary: "'Inter', 'Electrolize', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace",
      gaming: "'Orbitron', 'Electrolize', system-ui, sans-serif",
      display: "'Electrolize', 'Inter', system-ui, sans-serif",
      ui: "'Electrolize', 'Inter', system-ui, -apple-system, sans-serif"
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
      '4xl': '2.5rem'   // 40px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem'     // 96px
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  transitions: {
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

// Composable state
const themeMode = useStorage<ThemeMode>('navi-theme-mode', 'system')
const systemPreference = ref<ColorScheme>('light')

// Create unified theme composable
export function useUnifiedTheme() {
  // Initialize dynamic scaling
  const scaling = useDynamicScaling({
    enableFontScaling: true,
    enablePerformanceOptimization: true
  })
  
  // Computed active color scheme
  const colorScheme = computed<ColorScheme>(() => {
    return themeMode.value === 'system' ? systemPreference.value : themeMode.value as ColorScheme
  })

  // Current theme tokens
  const theme = computed<ThemeDesignTokens>(() => ({
    colors: GAMING_COLORS[colorScheme.value],
    ...DESIGN_TOKENS
  }))

  // Convenience computed properties
  const isDark = computed(() => colorScheme.value === 'dark')
  const isLight = computed(() => colorScheme.value === 'light')
  const isSystem = computed(() => themeMode.value === 'system')

  // System preference detection
  const updateSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      systemPreference.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  }

  // Theme switching functions
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    logger.info(`Theme mode changed to: ${mode}`)
  }

  const toggleTheme = () => {
    if (themeMode.value === 'light') {
      setThemeMode('dark')
    } else if (themeMode.value === 'dark') {
      setThemeMode('system')
    } else {
      setThemeMode('light')
    }
  }

  // CSS custom properties injection
  const injectCSSCustomProperties = () => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const colors = theme.value.colors
    const tokens = theme.value

    // Inject color variables
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value)
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value as Record<string, string>).forEach(([shade, color]) => {
          root.style.setProperty(`--color-${key}-${shade}`, color)
        })
      }
    })

    // Inject typography variables with scaling support
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--font-family-${key}`, value)
    })

    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      // Apply scaling to font sizes
      const scaledValue = scaling.getScaledValue(parseFloat(value))
      root.style.setProperty(`--font-size-${key}`, `${scaledValue}rem`)
      root.style.setProperty(`--font-size-${key}-base`, value) // Keep original for reference
    })

    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString())
    })

    // Inject spacing variables with scaling support
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      const scaledValue = scaling.getScaledValue(parseFloat(value))
      root.style.setProperty(`--spacing-${key}`, `${scaledValue}rem`)
      root.style.setProperty(`--spacing-${key}-base`, value) // Keep original for reference
    })

    // Inject border radius variables
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value)
    })

    // Inject shadow variables
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

    // Inject transition variables (adjust for performance)
    Object.entries(tokens.transitions).forEach(([key, value]) => {
      const adjustedTransition = scaling.shouldOptimizeAnimations.value 
        ? value.replace(/0\.3s|0\.5s/g, '0.15s') // Faster transitions for performance
        : value
      root.style.setProperty(`--transition-${key}`, adjustedTransition)
    })

    // Set glassmorphic theme variables
    root.style.setProperty('--glass-bg', colorScheme.value === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)')
    root.style.setProperty('--glass-border', colorScheme.value === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--glass-shadow', colorScheme.value === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)')

    // Set color scheme attributes for native styling
    root.setAttribute('data-theme', colorScheme.value)
    root.setAttribute('data-color-scheme', colorScheme.value)

    // Add theme transition class for smooth theme changes
    root.classList.add('theme-transitioning')
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 300)
  }

  // Utility functions for component styling
  const getColor = (colorPath: string): string => {
    const keys = colorPath.split('.')
    let value: any = theme.value.colors

    for (const key of keys) {
      value = value?.[key]
      if (value === undefined) break
    }

    return value || '#000000'
  }

  const getContrastColor = (backgroundColor: string): string => {
    // Simple contrast calculation for text readability
    const rgb = backgroundColor.match(/\d+/g)
    if (!rgb) return isDark.value ? '#ffffff' : '#000000'

    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  // Generate component-specific theme classes
  const getThemeClasses = (componentName: string): string[] => {
    const classes = [`${componentName}--${colorScheme.value}`]
    
    if (isDark.value) {
      classes.push(`${componentName}--dark`)
    }
    
    return classes
  }

  // Initialize theme system (safe for global context)
  const initializeTheme = () => {
    updateSystemPreference()
    injectCSSCustomProperties()

    // Listen for system preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateSystemPreference)
    }

    logger.info('Unified theme system initialized', {
      mode: themeMode.value,
      colorScheme: colorScheme.value,
      systemPreference: systemPreference.value
    })
  }

  // Safe initialization function for global context
  const initializeThemeGlobal = () => {
    // Initialize scaling outside of component context
    const scalingResult = useDynamicScaling({
      enableFontScaling: true,
      enablePerformanceOptimization: true
    })
    
    updateSystemPreference()
    injectCSSCustomProperties()

    // Listen for system preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        updateSystemPreference()
        injectCSSCustomProperties()
      })
    }

    logger.info('Unified theme system initialized globally', {
      mode: themeMode.value,
      colorScheme: colorScheme.value,
      systemPreference: systemPreference.value
    })

    return scalingResult
  }

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
    if (themeMode.value === 'light') {
      setThemeMode('dark');
    } else if (themeMode.value === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  // Current theme for backward compatibility
  const currentTheme = computed(() => colorScheme.value);

  // Watch for changes and update CSS variables
  watch(colorScheme, injectCSSCustomProperties, { immediate: false })

  // Initialize on mount
  onMounted(initializeTheme)

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
    DESIGN_TOKENS
  }
}

// Export for global use
export default useUnifiedTheme

// Safe global initialization function
export function initializeUnifiedThemeGlobal() {
  // Detect system preference without reactive refs
  let currentSystemPreference: ColorScheme = 'light'
  if (typeof window !== 'undefined' && window.matchMedia) {
    currentSystemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  // Apply theme variables directly
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    const colors = GAMING_COLORS[currentSystemPreference]
    const tokens = DESIGN_TOKENS

    // Inject color variables
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value)
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value as Record<string, string>).forEach(([shade, color]) => {
          root.style.setProperty(`--color-${key}-${shade}`, color)
        })
      }
    })

    // Inject typography variables
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--font-family-${key}`, value)
    })

    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value)
    })

    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })

    // Set color scheme attributes
    root.setAttribute('data-theme', currentSystemPreference)
    root.setAttribute('data-color-scheme', currentSystemPreference)
  }
  
  logger.info('Unified theme system initialized globally (safe mode)', { scheme: currentSystemPreference })
}

// Utility function for non-Vue contexts
export function createThemeUtils() {
  const { theme, getColor, getContrastColor, isDark, isLight } = useUnifiedTheme()
  
  return {
    theme,
    getColor,
    getContrastColor,
    isDark,
    isLight
  }
}

// CSS-in-JS helper for styled components
export function createThemeCSS(colorScheme: ColorScheme = 'light') {
  const colors = GAMING_COLORS[colorScheme]
  
  return {
    colors,
    ...DESIGN_TOKENS,
    utils: {
      surface: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '17, 24, 39' : '249, 250, 251'}, ${opacity})`,
      primary: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
      text: (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
        const variants = {
          primary: colors['on-background'],
          secondary: colors.gray[colorScheme === 'dark' ? '300' : '600'],
          muted: colors.gray[colorScheme === 'dark' ? '400' : '500']
        }
        return variants[variant]
      }
    }
  }
}
