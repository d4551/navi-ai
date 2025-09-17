/** @type {import('tailwindcss').Config} */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Attempt to include optional Tailwind plugins if installed
const optionalPlugins = []
try { optionalPlugins.push(require('@tailwindcss/forms')) } catch {}
try { optionalPlugins.push(require('@tailwindcss/typography')) } catch {}
try { optionalPlugins.push(require('@tailwindcss/aspect-ratio')) } catch {}

export default {
  important: true,
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    // Keep existing base styles from your design system
    preflight: false,
  },
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      ringColor: {
        neon: 'rgba(var(--neon-blue), 0.3)',
      },
      fontFamily: {
        // Align with app font system; Electrolize first, then Inter
        sans: [
          'Electrolize',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Electrolize',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        gaming: [
          'Orbitron',
          'Electrolize',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          "'Fira Code Variable'",
          "'Fira Code'",
          "ui-monospace",
          "SFMono-Regular",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        code: [
          'Fira Code',
          'JetBrains Mono',
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        // Pure white/black base colors
        'pure-white': '#ffffff',
        'pure-black': '#000000',

        // Bridge Tailwind color tokens to existing CSS variables
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--color-secondary-50) / <alpha-value>)',
          100: 'rgb(var(--color-secondary-100) / <alpha-value>)',
          200: 'rgb(var(--color-secondary-200) / <alpha-value>)',
          300: 'rgb(var(--color-secondary-300) / <alpha-value>)',
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
          700: 'rgb(var(--color-secondary-700) / <alpha-value>)',
          800: 'rgb(var(--color-secondary-800) / <alpha-value>)',
          900: 'rgb(var(--color-secondary-900) / <alpha-value>)',
        },
        success: {
          50: 'rgb(var(--color-success-50) / <alpha-value>)',
          500: 'rgb(var(--color-success-500) / <alpha-value>)',
          600: 'rgb(var(--color-success-600) / <alpha-value>)',
          700: 'rgb(var(--color-success-700) / <alpha-value>)',
        },
        warning: {
          50: 'rgb(var(--color-warning-50) / <alpha-value>)',
          500: 'rgb(var(--color-warning-500) / <alpha-value>)',
          600: 'rgb(var(--color-warning-600) / <alpha-value>)',
          700: 'rgb(var(--color-warning-700) / <alpha-value>)',
        },
        error: {
          50: 'rgb(var(--color-error-50) / <alpha-value>)',
          500: 'rgb(var(--color-error-500) / <alpha-value>)',
          600: 'rgb(var(--color-error-600) / <alpha-value>)',
          700: 'rgb(var(--color-error-700) / <alpha-value>)',
        },
        gray: {
          50: 'rgb(var(--color-gray-50) / <alpha-value>)',
          100: 'rgb(var(--color-gray-100) / <alpha-value>)',
          200: 'rgb(var(--color-gray-200) / <alpha-value>)',
          300: 'rgb(var(--color-gray-300) / <alpha-value>)',
          400: 'rgb(var(--color-gray-400) / <alpha-value>)',
          500: 'rgb(var(--color-gray-500) / <alpha-value>)',
          600: 'rgb(var(--color-gray-600) / <alpha-value>)',
          700: 'rgb(var(--color-gray-700) / <alpha-value>)',
          800: 'rgb(var(--color-gray-800) / <alpha-value>)',
          900: 'rgb(var(--color-gray-900) / <alpha-value>)',
          950: 'rgb(var(--color-gray-950) / <alpha-value>)',
        },

        // RGB Neon colors
        neon: {
          red: 'rgb(var(--neon-red))',
          blue: 'rgb(var(--neon-blue))',
          green: 'rgb(var(--neon-green))',
          purple: 'rgb(var(--neon-purple))',
          pink: 'rgb(var(--neon-pink))',
          cyan: 'rgb(var(--neon-cyan))',
          orange: 'rgb(var(--neon-orange))',
          yellow: 'rgb(var(--neon-yellow))',
          lime: 'rgb(var(--neon-lime))',
          teal: 'rgb(var(--neon-teal))',
        },

        // Semantic theme-aware colors
        background: 'var(--bg-primary)',
        surface: 'var(--color-surface)',
        'surface-variant': 'var(--color-surface-variant)',
        'on-background': 'var(--color-on-background)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',

        // Enhanced text color system that adapts to theme
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        'text-high-contrast': 'var(--text-primary)',
        'text-medium-contrast': 'var(--text-secondary)',
        'text-low-contrast': 'var(--text-tertiary)',

        // Background system that adapts to theme
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',

        // Glassmorphic colors
        glass: {
          bg: 'var(--glass-bg)',
          'bg-hover': 'var(--glass-bg-hover)',
          'bg-active': 'var(--glass-bg-active)',
          border: 'var(--glass-border)',
          'border-hover': 'var(--glass-border-hover)',
          shadow: 'var(--glass-shadow)',
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.05)',
          'dark-medium': 'rgba(0, 0, 0, 0.08)',
          'dark-heavy': 'rgba(0, 0, 0, 0.12)',
        },
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
        // Enhanced glassmorphic spacing
        'glass-xs': '0.25rem',
        'glass-sm': '0.5rem',
        'glass-md': '1rem',
        'glass-lg': '1.5rem',
        'glass-xl': '2rem',
        'glass-2xl': '3rem',
        'glass-3xl': '4rem',
        'glass-4xl': '6rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'modal-in': 'modalIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.6' },
        },
        modalIn: {
          '0%': { transform: 'scale(0.9) translateY(-10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'glass-md': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'glass-xl': '0 16px 64px rgba(0, 0, 0, 0.2)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-neon-blue': '0 0 20px rgba(var(--neon-blue), 0.3), 0 0 40px rgba(var(--neon-blue), 0.1)',
        'glow-neon-red': '0 0 20px rgba(var(--neon-red), 0.3), 0 0 40px rgba(var(--neon-red), 0.1)',
        'glow-neon-green': '0 0 20px rgba(var(--neon-green), 0.3), 0 0 40px rgba(var(--neon-green), 0.1)',
        'glow-neon-purple': '0 0 20px rgba(var(--neon-purple), 0.3), 0 0 40px rgba(var(--neon-purple), 0.1)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [
    ...optionalPlugins,
    function({ addUtilities, addComponents, theme }) {
      // Glassmorphic utility classes
      addUtilities({
        '.glass': {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: theme('borderRadius.md'),
          boxShadow: 'var(--glass-shadow)',
          transition: 'all 0.3s ease',
        },
        '.glass-bg-light': {
          background: 'var(--glass-bg-light)',
        },
        '.glass-bg-active': {
          background: 'var(--glass-bg-active)',
        },
        '.glass-interactive': {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
        '.glass-surface': {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid var(--glass-border)',
        },
        '.glass-sm': {
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          borderRadius: theme('borderRadius.sm'),
          boxShadow: theme('boxShadow.glass-sm'),
        },
        '.glass-lg': {
          backdropFilter: 'blur(30px)',
          '-webkit-backdrop-filter': 'blur(30px)',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.glass-lg'),
        },
        '.glass-xl': {
          backdropFilter: 'blur(40px)',
          '-webkit-backdrop-filter': 'blur(40px)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.glass-xl'),
        },
        '.glass:hover': {
          background: 'var(--glass-bg-hover)',
          borderColor: 'var(--glass-border-hover)',
          boxShadow: theme('boxShadow.glass-lg'),
        },
        '.glass:active': {
          background: 'var(--glass-bg-active)',
          transform: 'translateY(1px)',
        },
      })

      // Neon glow utilities
      addUtilities({
        '.neon-glow-blue': {
          boxShadow: '0 0 20px rgba(var(--neon-blue), 0.4), 0 0 40px rgba(var(--neon-blue), 0.2)',
        },
        '.neon-glow-red': {
          boxShadow: '0 0 20px rgba(var(--neon-red), 0.4), 0 0 40px rgba(var(--neon-red), 0.2)',
        },
        '.neon-glow-green': {
          boxShadow: '0 0 20px rgba(var(--neon-green), 0.4), 0 0 40px rgba(var(--neon-green), 0.2)',
        },
        '.neon-glow-purple': {
          boxShadow: '0 0 20px rgba(var(--neon-purple), 0.4), 0 0 40px rgba(var(--neon-purple), 0.2)',
        },
        '.neon-glow-pink': {
          boxShadow: '0 0 20px rgba(var(--neon-pink), 0.4), 0 0 40px rgba(var(--neon-pink), 0.2)',
        },
        '.neon-glow-cyan': {
          boxShadow: '0 0 20px rgba(var(--neon-cyan), 0.4), 0 0 40px rgba(var(--neon-cyan), 0.2)',
        },
      })

      // Multi-column dense layout utilities
      addUtilities({
        '.dense-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme('spacing.4'),
          padding: theme('spacing.4'),
        },
        '.dense-grid-sm': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: theme('spacing.3'),
          padding: theme('spacing.3'),
        },
        '.dense-grid-lg': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: theme('spacing.6'),
          padding: theme('spacing.6'),
        },
        '.dense-masonry': {
          columns: '3',
          columnGap: theme('spacing.4'),
          breakInside: 'avoid',
        },
        '.portfolio-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme('spacing.6'),
          padding: theme('spacing.4'),
        },
        '@media (max-width: 768px)': {
          '.dense-masonry': {
            columns: '2',
          },
        },
        '@media (max-width: 480px)': {
          '.dense-masonry': {
            columns: '1',
          },
        },
      })

      // Enhanced text accessibility utilities
      addUtilities({
        '.text-glass-primary': {
          color: 'var(--text-primary)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2)',
        },
        '.text-glass-secondary': {
          color: 'var(--text-secondary)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2)',
        },
        '.text-glass-readable': {
          color: 'var(--text-primary)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          fontWeight: theme('fontWeight.medium'),
        },
        '.text-glass-contrast': {
          background: 'rgba(0, 0, 0, 0.1)',
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          borderRadius: theme('borderRadius.sm'),
          backdropFilter: 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
        },
        '.text-backdrop': {
          background: 'rgba(0, 0, 0, 0.1)',
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          borderRadius: theme('borderRadius.sm'),
          backdropFilter: 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
        },
        '.text-neon': {
          color: 'rgb(var(--neon-blue))',
          textShadow: '0 0 5px rgba(var(--neon-blue), 0.5), 0 0 10px rgba(var(--neon-blue), 0.3)',
        },
        '.text-neon-green': {
          color: 'rgb(var(--neon-green))',
          textShadow: '0 0 5px rgba(var(--neon-green), 0.5), 0 0 10px rgba(var(--neon-green), 0.3)',
        },
        '.text-neon-red': {
          color: 'rgb(var(--neon-red))',
          textShadow: '0 0 5px rgba(var(--neon-red), 0.5), 0 0 10px rgba(var(--neon-red), 0.3)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, rgb(var(--neon-blue)), rgb(var(--neon-purple)))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      })

      // Theme-aware page layouts
      addComponents({
        '.page-container': {
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
        '.content-wrapper': {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme('spacing.6'),
          '@media (max-width: 768px)': {
            padding: theme('spacing.4'),
          },
        },
        '.section-glass': {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          margin: `${theme('spacing.4')} 0`,
          boxShadow: theme('boxShadow.glass-md'),
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'var(--glass-bg-hover)',
            borderColor: 'var(--glass-border-hover)',
            boxShadow: theme('boxShadow.glass-lg'),
          },
        },
      })

      // Glass card components
      addComponents({
        '.glass-card': {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: theme('borderRadius.md'),
          boxShadow: theme('boxShadow.glass-md'),
          padding: theme('spacing.6'),
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'var(--glass-bg-hover)',
            borderColor: 'var(--glass-border-hover)',
            boxShadow: theme('boxShadow.glass-lg'),
            transform: 'translateY(-2px)',
          },
        },
        '.glass-card-sm': {
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.sm'),
          boxShadow: theme('boxShadow.glass-sm'),
        },
        '.glass-card-lg': {
          padding: theme('spacing.8'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.glass-lg'),
        },
      })

      // Legacy typography aliases mapped to Tailwind theme tokens
      // Ensures pages use Tailwind-driven sizes/weights/colors instead of legacy CSS
      const fontSizeEntry = (key) => {
        const v = theme(`fontSize.${key}`)
        if (Array.isArray(v)) {
          return { fontSize: v[0], ...(v[1] || {}) }
        }
        return { fontSize: v }
      }
      const titleStyles = (sizeKey, weight = '700') => ({
        ...fontSizeEntry(sizeKey),
        fontWeight: weight,
        color: 'var(--text-primary)'
      })
      const textStyles = (sizeKey, weight = '400') => ({
        ...fontSizeEntry(sizeKey),
        fontWeight: weight,
        color: 'var(--text-secondary)'
      })

      const displayFonts = theme('fontFamily.display')
      const fontFamilyValue = Array.isArray(displayFonts)
        ? displayFonts.join(', ')
        : (displayFonts || 'inherit')

      addComponents({
        '.section-title': titleStyles('2xl', '700'),
        '.section-subtitle': { ...textStyles('sm', '500'), color: 'var(--text-secondary)' },
        '.panel-title': titleStyles('lg', '600'),
        '.panel-subtitle': { ...textStyles('sm', '400'), color: 'var(--text-secondary)' },
        '.card-title': titleStyles('lg', '600'),
        '.action-title': titleStyles('base', '600'),
        '.progress-title': titleStyles('base', '600'),
        '.logo-title': {
          ...titleStyles('3xl', '800'),
          letterSpacing: theme('letterSpacing.wide') || '0.025em',
          fontFamily: fontFamilyValue,
        },
        '.logo-subtitle': { ...textStyles('sm', '500'), color: 'var(--text-muted)' },
        '.body-text': textStyles('base', '400'),
        '.muted-text': { ...textStyles('sm', '400'), color: 'var(--text-muted)' },
        '.text-primary': { color: 'var(--text-primary)' },
        '.text-secondary': { color: 'var(--text-secondary)' },
        '.text-tertiary': { color: 'var(--text-tertiary)' },
        '.text-muted': { color: 'var(--text-muted)' },
      })
    }
  ],
}
