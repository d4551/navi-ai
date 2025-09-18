/**
 * UNIFIED THEME UTILITIES
 * =======================
 * Comprehensive utilities for consistent theming across the application
 */

import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'

/**
 * Composable for unified theme utilities
 */
export function useThemeUtils() {
  const appStore = useAppStore()
  const themeStore = useThemeStore()

  // Theme-aware classes
  const themeClasses = computed(() => ({
    // Glass card classes
    glassCard:
      'glass-card bg-glass-bg backdrop-blur-sm border border-glass-border rounded-lg shadow-glass transition-all duration-300 hover:shadow-glass-lg hover:border-glass-border-hover',

    // Button classes
    btnPrimary:
      'bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-neon-blue hover:shadow-glow-neon-blue text-glass-primary font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50',
    btnSecondary:
      'bg-transparent hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover text-glass-secondary font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50',
    btnDanger:
      'bg-glass-bg hover:bg-glass-bg-hover border border-error-500 hover:border-error-600 hover:shadow-glow-neon-red text-error-500 hover:text-error-600 font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-opacity-50',

    // Input classes
    input:
      'w-full bg-glass-bg border border-glass-border rounded-md px-3 py-2 text-glass-primary placeholder-glass-secondary focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon transition-all duration-200',

    // Text classes
    textPrimary: 'text-glass-primary font-sans',
    textSecondary: 'text-glass-secondary font-sans',
    textMuted: 'text-glass-secondary opacity-70 font-sans',
    textCode:
      'font-mono text-glass-primary bg-glass-bg px-2 py-1 rounded text-sm',

    // Layout classes
    pageContainer: 'min-h-screen bg-bg-primary font-sans',
    contentWrapper: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6',
    section: 'glass-card p-6 space-y-4',

    // Grid classes
    gridCols1: 'grid grid-cols-1 gap-4',
    gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',

    // Flex classes
    flexRow: 'flex items-center space-x-2',
    flexCol: 'flex flex-col space-y-2',
    flexBetween: 'flex items-center justify-between',
    flexCenter: 'flex items-center justify-center',

    // Spacing classes
    spaceXs: 'space-y-2',
    spaceSm: 'space-y-3',
    spaceMd: 'space-y-4',
    spaceLg: 'space-y-6',
    spaceXl: 'space-y-8',
  }))

  // Neon color utilities
  const neonColors = computed(() => ({
    blue: 'rgb(0, 204, 255)',
    green: 'rgb(0, 255, 153)',
    red: 'rgb(255, 0, 102)',
    purple: 'rgb(153, 0, 255)',
    pink: 'rgb(255, 51, 204)',
    cyan: 'rgb(51, 255, 255)',
    orange: 'rgb(255, 165, 0)',
    yellow: 'rgb(255, 255, 0)',
  }))

  // Dynamic neon glow classes
  const getNeonGlow = (color = 'blue') => `neon-glow-${color}`

  // Responsive breakpoint utilities
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }

  // Glass effect utilities
  const glassEffects = computed(() => ({
    light: 'backdrop-blur-sm bg-glass-light border border-glass-border',
    medium: 'backdrop-blur-md bg-glass-medium border border-glass-border',
    heavy: 'backdrop-blur-lg bg-glass-heavy border border-glass-border-hover',
    interactive:
      'backdrop-blur-md bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover transition-all duration-200',
  }))

  // Font utilities
  const fonts = computed(() => ({
    primary: 'font-sans', // Electrolize + Inter
    mono: 'font-mono', // Fira Code
    gaming: 'font-gaming', // Orbitron
    display: 'font-display', // Electrolize
  }))

  return {
    themeClasses,
    neonColors,
    getNeonGlow,
    breakpoints,
    glassEffects,
    fonts,
    appStore,
    themeStore,
  }
}

/**
 * Generate dynamic CSS classes
 */
export function generateThemeCSS() {
  return {
    // Glass morphism CSS
    glassmorphism: `
      .glass-morphism {
        background: var(--glass-bg);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid var(--glass-border);
        box-shadow: var(--glass-shadow);
      }

      .glass-morphism:hover {
        background: var(--glass-bg-hover);
        border-color: var(--glass-border-hover);
        box-shadow: var(--glass-shadow-lg);
      }
    `,

    // Neon glow effects
    neonGlows: `
      .neon-blue { color: rgb(0, 204, 255); text-shadow: 0 0 5px rgba(0, 204, 255, 0.5); }
      .neon-green { color: rgb(0, 255, 153); text-shadow: 0 0 5px rgba(0, 255, 153, 0.5); }
      .neon-red { color: rgb(255, 0, 102); text-shadow: 0 0 5px rgba(255, 0, 102, 0.5); }
      .neon-purple { color: rgb(153, 0, 255); text-shadow: 0 0 5px rgba(153, 0, 255, 0.5); }
    `,

    // Font face declarations
    fonts: `
      @import '@fontsource/electrolize/400.css';
      @import '@fontsource/electrolize/500.css';
      @import '@fontsource/electrolize/700.css';
      @import '@fontsource/fira-code/400.css';
      @import '@fontsource/fira-code/500.css';
      @import '@fontsource/fira-code/700.css';
      @import '@fontsource/inter/400.css';
      @import '@fontsource/inter/500.css';
      @import '@fontsource/inter/700.css';
      @import '@fontsource/orbitron/400.css';
      @import '@fontsource/orbitron/700.css';
    `,
  }
}

/**
 * Utility class generator
 */
export function createUtilityClasses() {
  return {
    spacing: Object.fromEntries(
      Object.entries({
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      }).map(([key, value]) => [
        `glass-${key}`,
        `padding: ${value}; margin: ${value};`,
      ])
    ),

    borderRadius: Object.fromEntries(
      Object.entries({
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.625rem',
      }).map(([key, value]) => [
        `rounded-glass-${key}`,
        `border-radius: ${value};`,
      ])
    ),
  }
}

/**
 * Export all utilities
 */
export default {
  useThemeUtils,
  generateThemeCSS,
  createUtilityClasses,
  SYSTEM_CONFIG: {
    theme: {
      pure: {
        white: '#ffffff',
        black: '#000000',
      },
      neon: {
        blue: 'rgb(0, 204, 255)',
        green: 'rgb(0, 255, 153)',
        red: 'rgb(255, 0, 102)',
        purple: 'rgb(153, 0, 255)',
        pink: 'rgb(255, 51, 204)',
        cyan: 'rgb(51, 255, 255)',
        orange: 'rgb(255, 165, 0)',
        yellow: 'rgb(255, 255, 0)',
      },
      glass: {
        backgroundLight: 'rgba(255, 255, 255, 0.08)',
        backgroundDark: 'rgba(255, 255, 255, 0.03)',
        borderLight: 'rgba(255, 255, 255, 0.25)',
        borderDark: 'rgba(255, 255, 255, 0.08)',
        blur: 'blur(12px)',
      },
    },
    fonts: {
      primary: "'Electrolize', 'Inter', system-ui, sans-serif",
      mono: "'Fira Code', 'JetBrains Mono', monospace",
      gaming: "'Orbitron', 'Electrolize', system-ui, sans-serif",
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.625rem',
    },
  },
}
