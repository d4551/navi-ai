/**
 * Unified UI Configuration
 * Centralizes all UI-related settings, themes, and component configurations
 */

export const UI_CONFIG = {
  // Theme settings
  themes: {
    light: {
      name: 'Light',
      icon: 'weather-sunny',
      colors: {
        primary: '#1a73e8',
        background: '#fafafa',
        surface: 'rgba(255, 255, 255, 0.95)',
        text: '#1c1b1f'
      }
    },
    dark: {
      name: 'Dark',
      icon: 'weather-night',
      colors: {
        primary: '#8ab4f8',
        background: '#0f0f0f',
        surface: 'rgba(30, 30, 30, 0.95)',
        text: '#e8eaed'
      }
    },
    auto: {
      name: 'System',
      icon: 'theme-light-dark',
      colors: {} // Will be determined by system preference
    }
  },

  // Breakpoints (Material Design 3)
  breakpoints: {
    mobile: 600,
    tablet: 905,
    desktop: 1240,
    wide: 1440
  },

  // Spacing scale (Material Design 3)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    xxl: '1.5rem',   // 24px
    xxxl: '2rem'     // 32px
  },

  // Typography scale
  typography: {
    display: {
      large: { size: '3.5rem', lineHeight: 1.2, weight: 400 },
      medium: { size: '2.8125rem', lineHeight: 1.2, weight: 400 },
      small: { size: '2rem', lineHeight: 1.2, weight: 400 }
    },
    headline: {
      large: { size: '2rem', lineHeight: 1.25, weight: 400 },
      medium: { size: '1.75rem', lineHeight: 1.25, weight: 400 },
      small: { size: '1.5rem', lineHeight: 1.25, weight: 400 }
    },
    title: {
      large: { size: '1.375rem', lineHeight: 1.25, weight: 400 },
      medium: { size: '1rem', lineHeight: 1.5, weight: 500 },
      small: { size: '0.875rem', lineHeight: 1.5, weight: 500 }
    },
    body: {
      large: { size: '1rem', lineHeight: 1.5, weight: 400 },
      medium: { size: '0.875rem', lineHeight: 1.5, weight: 400 },
      small: { size: '0.75rem', lineHeight: 1.5, weight: 400 }
    },
    label: {
      large: { size: '0.875rem', lineHeight: 1.5, weight: 500 },
      medium: { size: '0.75rem', lineHeight: 1.5, weight: 500 },
      small: { size: '0.6875rem', lineHeight: 1.5, weight: 500 }
    }
  },

  // Component configurations
  components: {
    button: {
      sizes: {
        xs: { height: '1.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
        sm: { height: '2rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
        md: { height: '2.5rem', padding: '0.5rem 1rem', fontSize: '1rem' },
        lg: { height: '3rem', padding: '0.625rem 1.25rem', fontSize: '1.125rem' },
        xl: { height: '3.5rem', padding: '0.75rem 1.5rem', fontSize: '1.25rem' }
      },
      variants: {
        primary: { bg: 'primary', text: 'on-primary' },
        secondary: { bg: 'secondary', text: 'on-secondary' },
        danger: { bg: 'error', text: 'on-error' },
        success: { bg: 'success', text: 'on-success' }
      }
    },

    card: {
      padding: '1rem',
      borderRadius: '0.5rem',
      elevation: {
        none: 'none',
        low: '0 1px 3px rgba(0,0,0,0.12)',
        medium: '0 4px 6px rgba(0,0,0,0.16)',
        high: '0 10px 25px rgba(0,0,0,0.19)'
      }
    },

    input: {
      height: '2.5rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid var(--md-sys-color-outline)'
    }
  },

  // Animation settings
  animations: {
    duration: {
      short1: '50ms',
      short2: '100ms',
      short3: '150ms',
      short4: '200ms',
      medium1: '250ms',
      medium2: '300ms',
      medium3: '350ms',
      medium4: '400ms',
      long1: '450ms',
      long2: '500ms',
      long3: '550ms',
      long4: '600ms'
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.3, 0, 1, 1)'
    }
  },

  // Icon settings
  icons: {
    defaultLibrary: 'mui', // 'mui' or 'bootstrap'
    sizes: {
      xs: '0.75rem',
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
      xl: '2rem'
    }
  },

  // Layout settings
  layout: {
    maxWidth: {
      narrow: '640px',
      default: '1024px',
      wide: '1280px',
      ultra: '1536px'
    },
    sidebar: {
      collapsedWidth: '4rem',
      expandedWidth: '16rem'
    }
  }
}

// Helper functions for accessing configuration
export const getThemeConfig = (theme) => UI_CONFIG.themes[theme] || UI_CONFIG.themes.light
export const getBreakpoint = (size) => UI_CONFIG.breakpoints[size] || UI_CONFIG.breakpoints.mobile
export const getSpacing = (size) => UI_CONFIG.spacing[size] || UI_CONFIG.spacing.md
export const getTypography = (category, size) => UI_CONFIG.typography[category]?.[size] || UI_CONFIG.typography.body.medium
export const getComponentConfig = (component, variant) => UI_CONFIG.components[component]?.[variant] || {}
export const getAnimation = (type, name) => UI_CONFIG.animations[type]?.[name] || UI_CONFIG.animations.duration.medium2
export const getIconSize = (size) => UI_CONFIG.icons.sizes[size] || UI_CONFIG.icons.sizes.sm
export const getLayoutMaxWidth = (width) => UI_CONFIG.layout.maxWidth[width] || UI_CONFIG.layout.maxWidth.default

// Export default configuration
export default UI_CONFIG
