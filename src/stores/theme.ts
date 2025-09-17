import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import { logger } from '@/shared/utils/logger'

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  accentColor: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  density: 'compact' | 'comfortable' | 'spacious'
  glassEffect: boolean
  animations: boolean
  fontSize: 'sm' | 'base' | 'lg'
  fontFamily: 'sans' | 'mono' | 'gaming'
  contrast: 'normal' | 'high'
  reducedMotion: boolean
}

export interface ColorPalette {
  primary: Record<string, string>
  secondary: Record<string, string>
  accent: Record<string, string>
  neutral: Record<string, string>
  success: Record<string, string>
  warning: Record<string, string>
  error: Record<string, string>
}

export const useThemeStore = defineStore('theme', () => {
  // Theme configuration state
  const config = ref<ThemeConfig>({
    mode: 'auto',
    primaryColor: 'blue',
    accentColor: 'purple',
    borderRadius: 'md',
    density: 'comfortable',
    glassEffect: true,
    animations: true,
    fontSize: 'base',
    fontFamily: 'sans',
    contrast: 'normal',
    reducedMotion: false,
  })

  // Color palettes for different themes
  const colorPalettes = ref<Record<string, ColorPalette>>({
    blue: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      accent: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      neutral: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
      },
      success: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
      },
      warning: {
        50: '#fffbeb',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
      },
      error: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
      },
    },
  })

  // System theme detection
  const systemTheme = ref<'light' | 'dark'>('light')

  // Update system theme based on media query
  const updateSystemTheme = () => {
    systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'
  }

  // Computed effective theme
  const effectiveTheme = computed(() => {
    return config.value.mode === 'auto' ? systemTheme.value : config.value.mode
  })

  // Theme CSS classes
  const themeClasses = computed(() => {
    const classes = []

    // Dark/light mode
    if (effectiveTheme.value === 'dark') {
      classes.push('dark')
    }

    // Density
    classes.push(`density-${config.value.density}`)

    // Border radius
    classes.push(`radius-${config.value.borderRadius}`)

    // Glass effect
    if (config.value.glassEffect) {
      classes.push('glass-enabled')
    }

    // Animations
    if (!config.value.animations) {
      classes.push('reduced-motion')
    }

    return classes
  })

  // Current color palette
  const currentPalette = computed(() => {
    return (
      colorPalettes.value[config.value.primaryColor] || colorPalettes.value.blue
    )
  })

  // Apply theme to document
  const applyTheme = async () => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    root.classList.remove(
      'density-compact',
      'density-comfortable',
      'density-spacious'
    )
    root.classList.remove(
      'radius-none',
      'radius-sm',
      'radius-md',
      'radius-lg',
      'radius-xl'
    )
    root.classList.remove('glass-enabled', 'reduced-motion')
    root.classList.remove('font-sm', 'font-base', 'font-lg')
    root.classList.remove('font-sans', 'font-mono', 'font-gaming')
    root.classList.remove('contrast-normal', 'contrast-high')

    // Add new theme classes
    themeClasses.value.forEach(cls => root.classList.add(cls))

    // Apply color palette as CSS custom properties
    const palette = currentPalette.value

    // Primary colors
    Object.entries(palette.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value)
    })

    // Secondary colors
    Object.entries(palette.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value)
    })

    // Accent colors
    Object.entries(palette.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value)
    })

    // Neutral colors
    Object.entries(palette.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value)
    })

    // Semantic colors
    Object.entries(palette.success).forEach(([key, value]) => {
      root.style.setProperty(`--color-success-${key}`, value)
    })
    Object.entries(palette.warning).forEach(([key, value]) => {
      root.style.setProperty(`--color-warning-${key}`, value)
    })
    Object.entries(palette.error).forEach(([key, value]) => {
      root.style.setProperty(`--color-error-${key}`, value)
    })

    // Font system properties
    root.style.setProperty('--font-family-primary', getFontFamily())
    root.style.setProperty('--font-size-scale', getFontSizeScale())

    // Glass effect properties
    if (config.value.glassEffect) {
      root.style.setProperty(
        '--glass-bg',
        effectiveTheme.value === 'dark'
          ? 'rgba(0, 0, 0, 0.2)'
          : 'rgba(255, 255, 255, 0.2)'
      )
      root.style.setProperty(
        '--glass-border',
        effectiveTheme.value === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)'
      )
      root.style.setProperty(
        '--glass-shadow',
        effectiveTheme.value === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)'
      )
    }

    // Density spacing
    const densityScale = getDensityScale()
    root.style.setProperty('--spacing-scale', densityScale.toString())

    // Border radius
    const radiusValue = getBorderRadiusValue()
    root.style.setProperty('--border-radius-base', radiusValue)

    // Trigger a re-render to ensure all components pick up the new theme
    await nextTick()

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent('theme-changed', {
        detail: {
          theme: effectiveTheme.value,
          config: config.value,
        },
      })
    )
  }

  // Helper functions
  const getFontFamily = () => {
    switch (config.value.fontFamily) {
      case 'mono':
        return 'var(--font-family-mono)'
      case 'gaming':
        return 'var(--font-family-gaming)'
      default:
        return 'var(--font-family-sans)'
    }
  }

  const getFontSizeScale = () => {
    switch (config.value.fontSize) {
      case 'sm':
        return '0.875'
      case 'lg':
        return '1.125'
      default:
        return '1'
    }
  }

  const getDensityScale = () => {
    switch (config.value.density) {
      case 'compact':
        return 0.75
      case 'spacious':
        return 1.25
      default:
        return 1
    }
  }

  const getBorderRadiusValue = () => {
    switch (config.value.borderRadius) {
      case 'none':
        return '0px'
      case 'sm':
        return '2px'
      case 'lg':
        return '8px'
      case 'xl':
        return '12px'
      default:
        return '6px'
    }
  }

  // Set theme mode
  const setMode = (mode: ThemeConfig['mode']) => {
    config.value.mode = mode
    saveToStorage()
  }

  // Set density
  const setDensity = (density: ThemeConfig['density']) => {
    config.value.density = density
    saveToStorage()
  }

  // Set font size
  const setFontSize = (fontSize: ThemeConfig['fontSize']) => {
    config.value.fontSize = fontSize
    saveToStorage()
  }

  // Set font family
  const setFontFamily = (fontFamily: ThemeConfig['fontFamily']) => {
    config.value.fontFamily = fontFamily
    saveToStorage()
  }

  // Toggle glass effect
  const toggleGlassEffect = () => {
    config.value.glassEffect = !config.value.glassEffect
    saveToStorage()
  }

  // Set primary color
  const setPrimaryColor = (color: string) => {
    config.value.primaryColor = color
    saveToStorage()
  }

  // Set border radius
  const setBorderRadius = (radius: ThemeConfig['borderRadius']) => {
    config.value.borderRadius = radius
    saveToStorage()
  }

  // Toggle animations
  const toggleAnimations = () => {
    config.value.animations = !config.value.animations
    saveToStorage()
  }

  // Set contrast mode
  const setContrast = (contrast: ThemeConfig['contrast']) => {
    config.value.contrast = contrast
    saveToStorage()
  }

  // Toggle reduced motion
  const toggleReducedMotion = () => {
    config.value.reducedMotion = !config.value.reducedMotion
    saveToStorage()
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (config.value.mode === 'auto') {
      config.value.mode = effectiveTheme.value === 'dark' ? 'light' : 'dark'
    } else {
      config.value.mode = config.value.mode === 'dark' ? 'light' : 'dark'
    }
    saveToStorage()
  }

  // Save theme to storage
  const saveToStorage = () => {
    try {
      localStorage.setItem('navi-theme-config', JSON.stringify(config.value))
    } catch (error) {
      logger.warn('Failed to save theme to storage:', error)
    }
  }

  // Load theme from storage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('navi-theme-config')
      if (stored) {
        const parsed = JSON.parse(stored)
        config.value = { ...config.value, ...parsed }
      }
    } catch (error) {
      logger.warn('Failed to load theme from storage:', error)
    }
  }

  // Initialize theme system
  const initialize = () => {
    // Load saved theme
    loadFromStorage()

    // Set up system theme detection
    updateSystemTheme()
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateSystemTheme)

    // Apply initial theme
    applyTheme()

    // Watch for config changes and apply them
    watch(config, applyTheme, { deep: true })
    watch(effectiveTheme, applyTheme)
  }

  return {
    config,
    systemTheme,
    effectiveTheme,
    themeClasses,
    currentPalette,
    setMode,
    setDensity,
    setFontSize,
    setFontFamily,
    setBorderRadius,
    setPrimaryColor,
    setContrast,
    toggleDarkMode,
    toggleGlassEffect,
    toggleAnimations,
    toggleReducedMotion,
    saveToStorage,
    loadFromStorage,
    initialize,
  }
})
