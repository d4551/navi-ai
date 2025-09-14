/** @type {import('tailwindcss').Config} */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Attempt to include optional Tailwind plugins if installed
const optionalPlugins = []
try { optionalPlugins.push(require('@tailwindcss/forms')) } catch {}
try { optionalPlugins.push(require('@tailwindcss/typography')) } catch {}
try { optionalPlugins.push(require('@tailwindcss/aspect-ratio')) } catch {}

export default {
  // Respect both class and data-attribute dark mode toggles
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    // Keep existing base styles from your design system
    preflight: false,
  },
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
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
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      colors: {
        // Bridge Tailwind color tokens to existing CSS variables
        primary: {
          50: 'rgb(var(--color-gaming-50) / <alpha-value>)',
          100: 'rgb(var(--color-gaming-100) / <alpha-value>)',
          200: 'rgb(var(--color-gaming-200) / <alpha-value>)',
          300: 'rgb(var(--color-gaming-300) / <alpha-value>)',
          400: 'rgb(var(--color-gaming-400) / <alpha-value>)',
          500: 'rgb(var(--color-gaming-500) / <alpha-value>)',
          600: 'rgb(var(--color-gaming-600) / <alpha-value>)',
          700: 'rgb(var(--color-gaming-700) / <alpha-value>)',
          800: 'rgb(var(--color-gaming-800) / <alpha-value>)',
          900: 'rgb(var(--color-gaming-900) / <alpha-value>)',
        },
        // Glassmorphic colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          heavy: 'rgba(255, 255, 255, 0.3)',
          dark: 'rgba(0, 0, 0, 0.1)',
          'dark-medium': 'rgba(0, 0, 0, 0.2)',
          'dark-heavy': 'rgba(0, 0, 0, 0.3)',
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
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: optionalPlugins,
}
