#!/usr/bin/env node

/**
 * NAVI UNIFIED SYSTEM BUILDER
 * ===========================
 * Production-grade tool to standardize all components with:
 * - Pure black/white glassmorphic theming with Tailwind
 * - Fira Code font integration
 * - Heroicons replacement for legacy icons
 * - Pinia state management wiring
 * - Consistent layout and spacing
 * - RGB neon highlights on interactive states
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Configuration for the unified system
const SYSTEM_CONFIG = {
  theme: {
    pure: {
      white: '#ffffff',
      black: '#000000'
    },
    neon: {
      blue: 'rgb(0, 204, 255)',
      green: 'rgb(0, 255, 153)',
      red: 'rgb(255, 0, 102)',
      purple: 'rgb(153, 0, 255)',
      pink: 'rgb(255, 51, 204)',
      cyan: 'rgb(51, 255, 255)',
      orange: 'rgb(255, 165, 0)',
      yellow: 'rgb(255, 255, 0)'
    },
    glass: {
      backgroundLight: 'rgba(255, 255, 255, 0.08)',
      backgroundDark: 'rgba(255, 255, 255, 0.03)',
      borderLight: 'rgba(255, 255, 255, 0.25)',
      borderDark: 'rgba(255, 255, 255, 0.08)',
      blur: 'blur(12px)'
    }
  },
  fonts: {
    primary: "'Electrolize', 'Inter', system-ui, sans-serif",
    mono: "'Fira Code', 'JetBrains Mono', monospace",
    gaming: "'Orbitron', 'Electrolize', system-ui, sans-serif"
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.625rem'
  }
};

// Legacy icon mappings to Heroicons
const ICON_MAPPINGS = {
  'mdi-home': 'HomeIcon',
  'mdi-user': 'UserIcon',
  'mdi-settings': 'CogIcon',
  'mdi-search': 'MagnifyingGlassIcon',
  'mdi-plus': 'PlusIcon',
  'mdi-edit': 'PencilIcon',
  'mdi-delete': 'TrashIcon',
  'mdi-close': 'XMarkIcon',
  'mdi-check': 'CheckIcon',
  'mdi-arrow-left': 'ArrowLeftIcon',
  'mdi-arrow-right': 'ArrowRightIcon',
  'mdi-arrow-up': 'ArrowUpIcon',
  'mdi-arrow-down': 'ArrowDownIcon',
  'mdi-download': 'ArrowDownTrayIcon',
  'mdi-upload': 'ArrowUpTrayIcon',
  'mdi-file': 'DocumentIcon',
  'mdi-folder': 'FolderIcon',
  'mdi-eye': 'EyeIcon',
  'mdi-eye-off': 'EyeSlashIcon',
  'mdi-heart': 'HeartIcon',
  'mdi-star': 'StarIcon',
  'mdi-bookmark': 'BookmarkIcon',
  'mdi-share': 'ShareIcon',
  'mdi-copy': 'ClipboardDocumentIcon',
  'mdi-link': 'LinkIcon',
  'mdi-mail': 'EnvelopeIcon',
  'mdi-phone': 'PhoneIcon',
  'mdi-location': 'MapPinIcon',
  'mdi-calendar': 'CalendarIcon',
  'mdi-clock': 'ClockIcon',
  'mdi-warning': 'ExclamationTriangleIcon',
  'mdi-error': 'XCircleIcon',
  'mdi-success': 'CheckCircleIcon',
  'mdi-info': 'InformationCircleIcon',
  'mdi-help': 'QuestionMarkCircleIcon',
  'mdi-menu': 'Bars3Icon',
  'mdi-dots-vertical': 'EllipsisVerticalIcon',
  'mdi-dots-horizontal': 'EllipsisHorizontalIcon',
  'mdi-refresh': 'ArrowPathIcon',
  'mdi-loading': 'ArrowPathIcon',
  'mdi-play': 'PlayIcon',
  'mdi-pause': 'PauseIcon',
  'mdi-stop': 'StopIcon',
  'mdi-volume-high': 'SpeakerWaveIcon',
  'mdi-volume-off': 'SpeakerXMarkIcon',
  'mdi-microphone': 'MicrophoneIcon',
  'mdi-microphone-off': 'MicrophoneIcon',
  'mdi-video': 'VideoCameraIcon',
  'mdi-video-off': 'VideoCameraSlashIcon',
  'mdi-camera': 'CameraIcon',
  'mdi-image': 'PhotoIcon',
  'mdi-attachment': 'PaperClipIcon',
  'mdi-tag': 'TagIcon',
  'mdi-filter': 'FunnelIcon',
  'mdi-sort': 'BarsArrowUpIcon',
  'mdi-grid': 'Squares2X2Icon',
  'mdi-list': 'ListBulletIcon',
  'mdi-card': 'RectangleStackIcon',
  'mdi-table': 'TableCellsIcon',
  'mdi-chart': 'ChartBarIcon',
  'mdi-graph': 'PresentationChartLineIcon',
  'mdi-database': 'CircleStackIcon',
  'mdi-server': 'ServerIcon',
  'mdi-cloud': 'CloudIcon',
  'mdi-wifi': 'WifiIcon',
  'mdi-bluetooth': 'DevicePhoneMobileIcon',
  'mdi-usb': 'UsbIcon',
  'mdi-battery': 'BatteryIcon',
  'mdi-power': 'PowerIcon',
  'mdi-lightbulb': 'LightBulbIcon',
  'mdi-brightness-6': 'SunIcon',
  'mdi-weather-night': 'MoonIcon',
  'mdi-palette': 'SwatchIcon',
  'mdi-format-color-fill': 'PaintBrushIcon',
  'mdi-brush': 'PaintBrushIcon',
  'mdi-fullscreen': 'ArrowsPointingOutIcon',
  'mdi-fullscreen-exit': 'ArrowsPointingInIcon',
  'mdi-zoom-in': 'MagnifyingGlassPlusIcon',
  'mdi-zoom-out': 'MagnifyingGlassMinusIcon',
  'mdi-lock': 'LockClosedIcon',
  'mdi-lock-open': 'LockOpenIcon',
  'mdi-key': 'KeyIcon',
  'mdi-shield': 'ShieldCheckIcon',
  'mdi-account': 'UserIcon',
  'mdi-account-group': 'UsersIcon',
  'mdi-account-plus': 'UserPlusIcon',
  'mdi-account-minus': 'UserMinusIcon',
  'mdi-login': 'ArrowRightOnRectangleIcon',
  'mdi-logout': 'ArrowLeftOnRectangleIcon',
  'mdi-signup': 'UserPlusIcon',
  'mdi-gamepad': 'DevicePhoneMobileIcon',
  'mdi-controller': 'DevicePhoneMobileIcon',
  'mdi-trophy': 'TrophyIcon',
  'mdi-medal': 'TrophyIcon',
  'mdi-target': 'CursorArrowRaysIcon',
  'mdi-crosshairs': 'CursorArrowRaysIcon',
  'mdi-sword': 'BoltIcon',
  'mdi-magic': 'SparklesIcon',
  'mdi-wand': 'SparklesIcon',
  'mdi-rocket': 'RocketLaunchIcon',
  'mdi-fire': 'FireIcon',
  'mdi-lightning': 'BoltIcon',
  'mdi-flash': 'BoltIcon',
  'mdi-zap': 'BoltIcon',
  // Emojis to Heroicons
  '⚡': 'BoltIcon',
  '🔥': 'FireIcon',
  '🎮': 'DevicePhoneMobileIcon',
  '🏆': 'TrophyIcon',
  '⭐': 'StarIcon',
  '❤️': 'HeartIcon',
  '👤': 'UserIcon',
  '👥': 'UsersIcon',
  '🔒': 'LockClosedIcon',
  '🔓': 'LockOpenIcon',
  '🔑': 'KeyIcon',
  '🏠': 'HomeIcon',
  '📧': 'EnvelopeIcon',
  '📞': 'PhoneIcon',
  '📍': 'MapPinIcon',
  '📅': 'CalendarIcon',
  '⏰': 'ClockIcon',
  '⚠️': 'ExclamationTriangleIcon',
  '❌': 'XMarkIcon',
  '✅': 'CheckIcon',
  '❓': 'QuestionMarkCircleIcon',
  '💡': 'LightBulbIcon',
  '🌙': 'MoonIcon',
  '☀️': 'SunIcon',
  '🎨': 'SwatchIcon',
  '🖌️': 'PaintBrushIcon',
  '📂': 'FolderIcon',
  '📄': 'DocumentIcon',
  '👁️': 'EyeIcon',
  '🔍': 'MagnifyingGlassIcon',
  '➕': 'PlusIcon',
  '✏️': 'PencilIcon',
  '🗑️': 'TrashIcon',
  '📤': 'ArrowUpTrayIcon',
  '📥': 'ArrowDownTrayIcon',
  '🔗': 'LinkIcon',
  '📋': 'ClipboardDocumentIcon',
  '🔄': 'ArrowPathIcon',
  '▶️': 'PlayIcon',
  '⏸️': 'PauseIcon',
  '⏹️': 'StopIcon',
  '🔊': 'SpeakerWaveIcon',
  '🔇': 'SpeakerXMarkIcon',
  '🎤': 'MicrophoneIcon',
  '📹': 'VideoCameraIcon',
  '📷': 'CameraIcon',
  '🖼️': 'PhotoIcon',
  '📎': 'PaperClipIcon',
  '🏷️': 'TagIcon',
  '🚀': 'RocketLaunchIcon',
  '✨': 'SparklesIcon'
};

// Component patterns for standardization
const COMPONENT_PATTERNS = {
  vueComponent: {
    template: {
      wrapper: `<div class="glass-card transition-all duration-300 hover:shadow-glass-lg">`,
      header: `<header class="flex items-center justify-between p-6 border-b border-glass-border">`,
      content: `<main class="p-6 space-y-4">`,
      footer: `<footer class="flex items-center justify-end p-6 border-t border-glass-border space-x-3">`
    },
    script: {
      imports: [
        "import { ref, computed, onMounted } from 'vue'",
        "import { useAppStore, useThemeStore } from '@/stores'",
        "import { logger } from '@/shared/utils/logger'"
      ],
      setup: `const appStore = useAppStore()
const themeStore = useThemeStore()
const loading = ref(false)
const error = ref(null)`
    }
  },
  button: {
    primary: `bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-neon-blue hover:shadow-glow-neon-blue text-glass-primary font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50`,
    secondary: `bg-transparent hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover text-glass-secondary font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50`,
    danger: `bg-glass-bg hover:bg-glass-bg-hover border border-error-500 hover:border-error-600 hover:shadow-glow-neon-red text-error-500 hover:text-error-600 font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-opacity-50`
  },
  input: {
    base: `w-full bg-glass-bg border border-glass-border rounded-md px-3 py-2 text-glass-primary placeholder-glass-secondary focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon transition-all duration-200`
  },
  card: {
    base: `glass-card bg-glass-bg backdrop-blur-sm border border-glass-border rounded-lg shadow-glass transition-all duration-300 hover:shadow-glass-lg hover:border-glass-border-hover`
  }
};

/**
 * Scan directory for Vue components
 */
async function scanComponents(dir) {
  const components = [];

  async function scan(currentDir) {
    try {
      const items = await fs.readdir(currentDir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);

        if (item.isDirectory()) {
          await scan(fullPath);
        } else if (item.name.endsWith('.vue')) {
          components.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${currentDir}:`, error.message);
    }
  }

  await scan(dir);
  return components;
}

/**
 * Process a Vue component file
 */
async function processComponent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let modified = content;
    let hasChanges = false;

    // Replace legacy icons with Heroicons
    for (const [legacy, heroicon] of Object.entries(ICON_MAPPINGS)) {
      const patterns = [
        // MDI class usage
        new RegExp(`class="([^"]*\\s)?${legacy.replace('-', '\\-')}(\\s[^"]*)?\"`, 'g'),
        new RegExp(`class='([^']*\\s)?${legacy.replace('-', '\\-')}(\\s[^']*)?'`, 'g'),
        // Direct icon references
        new RegExp(`"${legacy.replace('-', '\\-')}"`, 'g'),
        new RegExp(`'${legacy.replace('-', '\\-')}'`, 'g'),
        // Emoji replacements
        new RegExp(legacy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      ];

      patterns.forEach(pattern => {
        if (pattern.test(modified)) {
          modified = modified.replace(pattern, (match) => {
            hasChanges = true;
            if (match.includes('class=')) {
              // For class replacements, we need to handle the component import separately
              return match.replace(legacy, `heroicon-${heroicon.toLowerCase()}`);
            } else {
              return match.replace(legacy, heroicon);
            }
          });
        }
      });
    }

    // Add Heroicons imports if icons were replaced
    if (hasChanges && !modified.includes('@heroicons/vue')) {
      const scriptMatch = modified.match(/<script[^>]*>/);
      if (scriptMatch) {
        const heroiconsUsed = new Set();

        // Extract which heroicons are used
        for (const [legacy, heroicon] of Object.entries(ICON_MAPPINGS)) {
          if (modified.includes(heroicon) || modified.includes(`heroicon-${heroicon.toLowerCase()}`)) {
            heroiconsUsed.add(heroicon);
          }
        }

        if (heroiconsUsed.size > 0) {
          const importStatement = `import { ${Array.from(heroiconsUsed).join(', ')} } from '@heroicons/vue/24/outline'\n`;
          modified = modified.replace(scriptMatch[0], `${scriptMatch[0]}\n${importStatement}`);
        }
      }
    }

    // Standardize Tailwind classes for glassmorphic design
    const glassClassReplacements = {
      // Background classes
      'bg-white': 'bg-glass-bg',
      'bg-gray-50': 'bg-glass-bg',
      'bg-gray-100': 'bg-glass-bg-hover',
      'bg-black': 'bg-glass-bg dark:bg-glass-bg',
      'bg-gray-900': 'bg-glass-bg dark:bg-glass-bg',

      // Border classes
      'border-gray-200': 'border-glass-border',
      'border-gray-300': 'border-glass-border-hover',
      'border-gray-700': 'border-glass-border dark:border-glass-border',
      'border-gray-600': 'border-glass-border-hover dark:border-glass-border-hover',

      // Text classes
      'text-gray-900': 'text-glass-primary',
      'text-gray-800': 'text-glass-primary',
      'text-gray-600': 'text-glass-secondary',
      'text-gray-500': 'text-glass-secondary',
      'text-white': 'text-glass-primary dark:text-glass-primary',
      'text-gray-100': 'text-glass-primary dark:text-glass-primary',
      'text-gray-300': 'text-glass-secondary dark:text-glass-secondary',

      // Shadow classes
      'shadow-md': 'shadow-glass',
      'shadow-lg': 'shadow-glass-lg',
      'shadow-xl': 'shadow-glass-xl',

      // Hover states with neon accents
      'hover:bg-blue-50': 'hover:bg-glass-bg-hover hover:border-neon-blue hover:shadow-glow-neon-blue',
      'hover:bg-gray-50': 'hover:bg-glass-bg-hover',
      'hover:bg-gray-100': 'hover:bg-glass-bg-active',
      'hover:text-blue-600': 'hover:text-neon-blue',
      'hover:border-blue-500': 'hover:border-neon-blue'
    };

    for (const [oldClass, newClass] of Object.entries(glassClassReplacements)) {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      if (regex.test(modified)) {
        modified = modified.replace(regex, newClass);
        hasChanges = true;
      }
    }

    // Ensure Pinia store usage
    if (modified.includes('$store') && !modified.includes('useAppStore')) {
      const scriptMatch = modified.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (scriptMatch) {
        let scriptContent = scriptMatch[1];

        // Add store imports
        if (!scriptContent.includes('useAppStore')) {
          scriptContent = `import { useAppStore } from '@/stores/app'\n${scriptContent}`;
          hasChanges = true;
        }

        // Replace $store usage with composable
        scriptContent = scriptContent.replace(/\$store/g, 'useAppStore()');

        modified = modified.replace(scriptMatch[0], `<script${scriptMatch[0].match(/^<script([^>]*)>/)[1]}>${scriptContent}</script>`);
      }
    }

    // Add consistent font classes
    if (!modified.includes('font-sans') && !modified.includes('font-mono') && !modified.includes('font-gaming')) {
      // Add default font to root element
      const templateMatch = modified.match(/<template>([\s\S]*?)<\/template>/);
      if (templateMatch) {
        let templateContent = templateMatch[1];
        // Find the root element and add font class
        const rootElementMatch = templateContent.match(/^(\s*)<(\w+)([^>]*?)>/);
        if (rootElementMatch && !rootElementMatch[3].includes('font-')) {
          const newRoot = `${rootElementMatch[1]}<${rootElementMatch[2]}${rootElementMatch[3]} class="font-sans${rootElementMatch[3].includes('class=') ? '' : ' '}">`;
          templateContent = templateContent.replace(rootElementMatch[0], newRoot);
          modified = modified.replace(templateMatch[0], `<template>${templateContent}</template>`);
          hasChanges = true;
        }
      }
    }

    // Add consistent spacing and layout
    const spacingReplacements = {
      'p-1': 'p-glass-xs',
      'p-2': 'p-glass-sm',
      'p-3': 'p-glass-md',
      'p-4': 'p-glass-md',
      'p-6': 'p-glass-lg',
      'p-8': 'p-glass-xl',
      'm-1': 'm-glass-xs',
      'm-2': 'm-glass-sm',
      'm-3': 'm-glass-md',
      'm-4': 'm-glass-md',
      'm-6': 'm-glass-lg',
      'm-8': 'm-glass-xl',
      'gap-1': 'gap-glass-xs',
      'gap-2': 'gap-glass-sm',
      'gap-3': 'gap-glass-md',
      'gap-4': 'gap-glass-md',
      'gap-6': 'gap-glass-lg',
      'gap-8': 'gap-glass-xl'
    };

    for (const [oldSpacing, newSpacing] of Object.entries(spacingReplacements)) {
      const regex = new RegExp(`\\b${oldSpacing}\\b`, 'g');
      if (regex.test(modified)) {
        modified = modified.replace(regex, newSpacing);
        hasChanges = true;
      }
    }

    return { content: modified, hasChanges, filePath };
  } catch (error) {
    console.error(`Error processing component ${filePath}:`, error.message);
    return { content: null, hasChanges: false, filePath, error: error.message };
  }
}

/**
 * Create a comprehensive theme utilities file
 */
async function createThemeUtilities() {
  const utilsContent = `/**
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
    glassCard: 'glass-card bg-glass-bg backdrop-blur-sm border border-glass-border rounded-lg shadow-glass transition-all duration-300 hover:shadow-glass-lg hover:border-glass-border-hover',

    // Button classes
    btnPrimary: 'bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-neon-blue hover:shadow-glow-neon-blue text-glass-primary font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50',
    btnSecondary: 'bg-transparent hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover text-glass-secondary font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50',
    btnDanger: 'bg-glass-bg hover:bg-glass-bg-hover border border-error-500 hover:border-error-600 hover:shadow-glow-neon-red text-error-500 hover:text-error-600 font-medium px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-opacity-50',

    // Input classes
    input: 'w-full bg-glass-bg border border-glass-border rounded-md px-3 py-2 text-glass-primary placeholder-glass-secondary focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon transition-all duration-200',

    // Text classes
    textPrimary: 'text-glass-primary font-sans',
    textSecondary: 'text-glass-secondary font-sans',
    textMuted: 'text-glass-secondary opacity-70 font-sans',
    textCode: 'font-mono text-glass-primary bg-glass-bg px-2 py-1 rounded text-sm',

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
    spaceXl: 'space-y-8'
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
    yellow: 'rgb(255, 255, 0)'
  }))

  // Dynamic neon glow classes
  const getNeonGlow = (color = 'blue') => \`neon-glow-\${color}\`

  // Responsive breakpoint utilities
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }

  // Glass effect utilities
  const glassEffects = computed(() => ({
    light: 'backdrop-blur-sm bg-glass-light border border-glass-border',
    medium: 'backdrop-blur-md bg-glass-medium border border-glass-border',
    heavy: 'backdrop-blur-lg bg-glass-heavy border border-glass-border-hover',
    interactive: 'backdrop-blur-md bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover transition-all duration-200'
  }))

  // Font utilities
  const fonts = computed(() => ({
    primary: 'font-sans', // Electrolize + Inter
    mono: 'font-mono',    // Fira Code
    gaming: 'font-gaming', // Orbitron
    display: 'font-display' // Electrolize
  }))

  return {
    themeClasses,
    neonColors,
    getNeonGlow,
    breakpoints,
    glassEffects,
    fonts,
    appStore,
    themeStore
  }
}

/**
 * Generate dynamic CSS classes
 */
export function generateThemeCSS() {
  return {
    // Glass morphism CSS
    glassmorphism: \`
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
    \`,

    // Neon glow effects
    neonGlows: \`
      .neon-blue { color: rgb(0, 204, 255); text-shadow: 0 0 5px rgba(0, 204, 255, 0.5); }
      .neon-green { color: rgb(0, 255, 153); text-shadow: 0 0 5px rgba(0, 255, 153, 0.5); }
      .neon-red { color: rgb(255, 0, 102); text-shadow: 0 0 5px rgba(255, 0, 102, 0.5); }
      .neon-purple { color: rgb(153, 0, 255); text-shadow: 0 0 5px rgba(153, 0, 255, 0.5); }
    \`,

    // Font face declarations
    fonts: \`
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
    \`
  }
}

/**
 * Utility class generator
 */
export function createUtilityClasses() {
  return {
    spacing: Object.fromEntries(
      Object.entries(${JSON.stringify(SYSTEM_CONFIG.spacing)}).map(([key, value]) => [
        \`glass-\${key}\`,
        \`padding: \${value}; margin: \${value};\`
      ])
    ),

    borderRadius: Object.fromEntries(
      Object.entries(${JSON.stringify(SYSTEM_CONFIG.borderRadius)}).map(([key, value]) => [
        \`rounded-glass-\${key}\`,
        \`border-radius: \${value};\`
      ])
    )
  }
}

/**
 * Export all utilities
 */
export default {
  useThemeUtils,
  generateThemeCSS,
  createUtilityClasses,
  SYSTEM_CONFIG: ${JSON.stringify(SYSTEM_CONFIG, null, 2)}
}
`;

  const utilsPath = path.join(SRC_DIR, 'composables', 'useThemeUtils.js');
  await fs.mkdir(path.dirname(utilsPath), { recursive: true });
  await fs.writeFile(utilsPath, utilsContent);
  console.log('✅ Created unified theme utilities');
}

/**
 * Create enhanced Pinia store connector
 */
async function createStoreConnector() {
  const connectorContent = `/**
 * PINIA STORE CONNECTOR
 * ====================
 * Unified store access and reactive state management
 */

import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'

/**
 * Unified store composable
 */
export function useStores() {
  // App store
  const appStore = useAppStore()
  const {
    user,
    settings,
    loading,
    errors,
    aiStatus,
    meta,
    isConfigured,
    hasPortfolio,
    profileCompleteness
  } = storeToRefs(appStore)

  // Theme store
  const themeStore = useThemeStore()
  const {
    config: themeConfig,
    effectiveTheme,
    currentPalette,
    themeClasses
  } = storeToRefs(themeStore)

  return {
    // App store
    appStore,
    user,
    settings,
    loading,
    errors,
    aiStatus,
    meta,
    isConfigured,
    hasPortfolio,
    profileCompleteness,

    // Theme store
    themeStore,
    themeConfig,
    effectiveTheme,
    currentPalette,
    themeClasses,

    // Combined utilities
    isLoading: (key) => loading.value[key] || false,
    hasError: (key) => key ? errors.value[key] : Object.values(errors.value).some(Boolean),
    isDarkMode: () => effectiveTheme.value === 'dark',
    isLightMode: () => effectiveTheme.value === 'light'
  }
}

/**
 * Reactive loading state management
 */
export function useLoadingState(initialKeys = []) {
  const { appStore, loading } = useStores()

  const setLoading = (key, value = true) => {
    appStore.setLoading(key, value)
  }

  const clearLoading = (key) => {
    appStore.setLoading(key, false)
  }

  const clearAllLoading = () => {
    Object.keys(loading.value).forEach(key => {
      appStore.setLoading(key, false)
    })
  }

  // Initialize any default loading states
  initialKeys.forEach(key => setLoading(key, false))

  return {
    loading,
    setLoading,
    clearLoading,
    clearAllLoading,
    isAnyLoading: () => Object.values(loading.value).some(Boolean)
  }
}

/**
 * Error state management
 */
export function useErrorState() {
  const { appStore, errors } = useStores()

  const setError = (type, message) => {
    appStore.setError(type, message)
  }

  const clearError = (type) => {
    appStore.clearError(type)
  }

  const clearAllErrors = () => {
    appStore.clearError()
  }

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasAnyError: () => Object.values(errors.value).some(Boolean)
  }
}

/**
 * Theme management utilities
 */
export function useThemeManager() {
  const { themeStore, effectiveTheme, themeConfig } = useStores()

  const toggleTheme = () => {
    themeStore.toggleDarkMode()
  }

  const setTheme = (mode) => {
    themeStore.setMode(mode)
  }

  const updateThemeConfig = (config) => {
    Object.entries(config).forEach(([key, value]) => {
      if (typeof themeStore[\`set\${key.charAt(0).toUpperCase() + key.slice(1)}\`] === 'function') {
        themeStore[\`set\${key.charAt(0).toUpperCase() + key.slice(1)}\`](value)
      }
    })
  }

  return {
    effectiveTheme,
    themeConfig,
    toggleTheme,
    setTheme,
    updateThemeConfig,
    isDark: () => effectiveTheme.value === 'dark',
    isLight: () => effectiveTheme.value === 'light'
  }
}

export default {
  useStores,
  useLoadingState,
  useErrorState,
  useThemeManager
}
`;

  const connectorPath = path.join(SRC_DIR, 'composables', 'useStores.js');
  await fs.mkdir(path.dirname(connectorPath), { recursive: true });
  await fs.writeFile(connectorPath, connectorContent);
  console.log('✅ Created Pinia store connector');
}

/**
 * Create a standardized component template
 */
async function createComponentTemplate() {
  const templateContent = `<template>
  <div class="glass-card font-sans">
    <!-- Header Section -->
    <header v-if="showHeader" class="flex items-center justify-between p-glass-lg border-b border-glass-border">
      <div class="flex items-center space-x-glass-sm">
        <component
          v-if="headerIcon"
          :is="headerIcon"
          class="w-5 h-5 text-glass-primary"
        />
        <h2 class="text-lg font-medium text-glass-primary">
          {{ headerTitle }}
        </h2>
      </div>

      <div v-if="$slots.headerActions" class="flex items-center space-x-glass-sm">
        <slot name="headerActions" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-glass-lg space-y-glass-md">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-glass-xl">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-neon-blue border-opacity-25 border-t-neon-blue"></div>
        <span class="ml-3 text-glass-secondary">{{ loadingText }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-error-50 border border-error-200 rounded-md p-glass-md">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="w-5 h-5 text-error-500 mr-2" />
          <span class="text-error-700 font-medium">{{ errorTitle }}</span>
        </div>
        <p class="text-error-600 text-sm mt-1">{{ error }}</p>
        <button
          v-if="showRetry"
          @click="$emit('retry')"
          class="mt-3 text-sm font-medium text-error-600 hover:text-error-700 underline"
        >
          Try Again
        </button>
      </div>

      <!-- Content Slot -->
      <div v-else>
        <slot />
      </div>
    </main>

    <!-- Footer Section -->
    <footer v-if="showFooter || $slots.footer" class="flex items-center justify-end p-glass-lg border-t border-glass-border space-x-glass-sm">
      <slot name="footer">
        <button
          v-if="showCancelButton"
          @click="$emit('cancel')"
          :class="themeClasses.btnSecondary"
        >
          {{ cancelText }}
        </button>
        <button
          v-if="showSaveButton"
          @click="$emit('save')"
          :class="themeClasses.btnPrimary"
          :disabled="loading"
        >
          {{ saveText }}
        </button>
      </slot>
    </footer>
  </div>
</template>

<script>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useThemeUtils } from '@/composables/useThemeUtils'
import { useStores } from '@/composables/useStores'

export default {
  name: 'StandardComponent',
  components: {
    ExclamationTriangleIcon
  },
  props: {
    // Header props
    showHeader: {
      type: Boolean,
      default: true
    },
    headerTitle: {
      type: String,
      default: ''
    },
    headerIcon: {
      type: [String, Object],
      default: null
    },

    // State props
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    error: {
      type: String,
      default: null
    },
    errorTitle: {
      type: String,
      default: 'Error'
    },
    showRetry: {
      type: Boolean,
      default: true
    },

    // Footer props
    showFooter: {
      type: Boolean,
      default: false
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    showSaveButton: {
      type: Boolean,
      default: false
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    saveText: {
      type: String,
      default: 'Save'
    }
  },
  emits: ['cancel', 'save', 'retry'],
  setup() {
    const { themeClasses } = useThemeUtils()
    const stores = useStores()

    return {
      themeClasses,
      stores
    }
  }
}
</script>
`;

  const templatePath = path.join(SRC_DIR, 'components', 'ui', 'StandardComponent.vue');
  await fs.mkdir(path.dirname(templatePath), { recursive: true });
  await fs.writeFile(templatePath, templateContent);
  console.log('✅ Created standardized component template');
}

/**
 * Create enhanced CSS utilities
 */
async function createEnhancedCSS() {
  const enhancedCSS = `/**
 * ENHANCED UNIFIED UTILITIES
 * =========================
 * Additional utility classes for the unified system
 */

/* Glass Morphism Utilities */
.glass-surface {
  @apply bg-glass-bg backdrop-blur-sm border border-glass-border;
}

.glass-surface-hover {
  @apply hover:bg-glass-bg-hover hover:border-glass-border-hover transition-all duration-200;
}

.glass-surface-active {
  @apply active:bg-glass-bg-active transform active:scale-95 transition-transform duration-75;
}

/* Neon Interactive States */
.neon-focus {
  @apply focus:outline-none focus:ring-2 focus:ring-neon focus:ring-opacity-50 focus:border-neon;
}

.neon-hover-blue {
  @apply hover:text-neon-blue hover:border-neon-blue hover:shadow-glow-neon-blue;
}

.neon-hover-green {
  @apply hover:text-neon-green hover:border-neon-green hover:shadow-glow-neon-green;
}

.neon-hover-red {
  @apply hover:text-neon-red hover:border-neon-red hover:shadow-glow-neon-red;
}

.neon-hover-purple {
  @apply hover:text-neon-purple hover:border-neon-purple hover:shadow-glow-neon-purple;
}

/* Typography Utilities */
.text-display {
  @apply font-display text-glass-primary font-bold tracking-wide;
}

.text-body {
  @apply font-sans text-glass-secondary leading-relaxed;
}

.text-code {
  @apply font-mono text-sm bg-glass-bg px-2 py-1 rounded border border-glass-border;
}

.text-neon-gradient {
  @apply bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent;
}

/* Layout Utilities */
.container-glass {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.section-glass {
  @apply glass-card p-glass-lg space-y-glass-md;
}

.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-glass-md;
}

.flex-center-glass {
  @apply flex items-center justify-center min-h-screen bg-bg-primary;
}

/* Button Variants */
.btn-glass {
  @apply glass-surface glass-surface-hover glass-surface-active neon-focus;
  @apply px-4 py-2 rounded-md font-medium transition-all duration-200;
}

.btn-glass-primary {
  @apply btn-glass text-glass-primary border-glass-border;
  @apply hover:border-neon-blue hover:shadow-glow-neon-blue;
}

.btn-glass-secondary {
  @apply btn-glass text-glass-secondary bg-transparent;
}

.btn-glass-danger {
  @apply btn-glass text-error-500 border-error-500;
  @apply hover:border-error-600 hover:shadow-glow-neon-red;
}

.btn-glass-success {
  @apply btn-glass text-success-500 border-success-500;
  @apply hover:border-success-600 hover:shadow-glow-neon-green;
}

/* Form Utilities */
.input-glass {
  @apply w-full glass-surface neon-focus rounded-md px-3 py-2;
  @apply text-glass-primary placeholder-glass-secondary;
}

.label-glass {
  @apply block text-sm font-medium text-glass-primary mb-2;
}

.fieldset-glass {
  @apply space-y-glass-sm p-glass-md border border-glass-border rounded-lg;
}

/* Card Utilities */
.card-glass {
  @apply glass-card glass-surface-hover rounded-lg shadow-glass;
}

.card-glass-header {
  @apply flex items-center justify-between p-glass-lg border-b border-glass-border;
}

.card-glass-body {
  @apply p-glass-lg space-y-glass-md;
}

.card-glass-footer {
  @apply flex items-center justify-end p-glass-lg border-t border-glass-border space-x-glass-sm;
}

/* Animation Utilities */
.animate-glass-in {
  @apply animate-fade-in;
}

.animate-glass-out {
  @apply animate-fade-out;
}

.animate-neon-pulse {
  animation: neonPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes neonPulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 204, 255, 0.3), 0 0 10px rgba(0, 204, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 10px rgba(0, 204, 255, 0.6), 0 0 20px rgba(0, 204, 255, 0.3);
  }
}

/* Responsive Utilities */
.responsive-text {
  @apply text-sm md:text-base lg:text-lg;
}

.responsive-spacing {
  @apply p-4 md:p-6 lg:p-8;
}

.responsive-grid-dense {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 lg:gap-4;
}

/* Accessibility Utilities */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
  clip: rect(0, 0, 0, 0);
}

.focus-visible-only {
  @apply focus:outline-none;
}

.focus-visible-only:focus-visible {
  @apply ring-2 ring-neon ring-opacity-50 outline-none;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .glass-surface {
    @apply border-2;
  }

  .text-glass-primary {
    @apply font-semibold;
  }

  .btn-glass {
    @apply border-2;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .glass-surface-hover,
  .glass-surface-active,
  .btn-glass,
  .animate-glass-in,
  .animate-glass-out,
  .animate-neon-pulse {
    @apply transition-none animate-none;
  }
}

/* Dark Mode Specific Adjustments */
.dark .glass-surface {
  @apply backdrop-blur-md;
}

.dark .text-glass-primary {
  @apply text-white;
}

.dark .text-glass-secondary {
  @apply text-gray-300;
}

/* Print Styles */
@media print {
  .glass-surface,
  .card-glass {
    @apply bg-white border border-gray-300 shadow-none;
  }

  .text-glass-primary,
  .text-glass-secondary {
    @apply text-black;
  }

  .neon-glow-blue,
  .neon-glow-green,
  .neon-glow-red,
  .neon-glow-purple {
    @apply shadow-none;
  }
}
`;

  const cssPath = path.join(SRC_DIR, 'styles', 'enhanced-glass-utilities.css');
  await fs.mkdir(path.dirname(cssPath), { recursive: true });
  await fs.writeFile(cssPath, enhancedCSS);
  console.log('✅ Created enhanced CSS utilities');
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  console.log('🚀 Starting NAVI Unified System Builder...\n');

  try {
    // Create enhanced utilities and templates
    await createThemeUtilities();
    await createStoreConnector();
    await createComponentTemplate();
    await createEnhancedCSS();

    // Scan and process all Vue components
    console.log('📦 Scanning Vue components...');
    const components = await scanComponents(path.join(SRC_DIR, 'components'));
    const views = await scanComponents(path.join(SRC_DIR, 'views'));
    const allComponents = [...components, ...views];

    console.log(`Found ${allComponents.length} components to process\n`);

    let processedCount = 0;
    let modifiedCount = 0;
    let errorCount = 0;

    // Process components with progress indicator
    for (const componentPath of allComponents) {
      const relativePath = path.relative(ROOT_DIR, componentPath);
      process.stdout.write(`Processing: ${relativePath}...`);

      const result = await processComponent(componentPath);

      if (result.error) {
        console.log(` ❌ Error: ${result.error}`);
        errorCount++;
      } else if (result.hasChanges) {
        await fs.writeFile(componentPath, result.content);
        console.log(` ✅ Updated`);
        modifiedCount++;
      } else {
        console.log(` ⭕ No changes needed`);
      }

      processedCount++;
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   • Total components: ${processedCount}`);
    console.log(`   • Modified: ${modifiedCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • No changes: ${processedCount - modifiedCount - errorCount}`);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n🎉 NAVI Unified System Builder completed in ${duration}s`);
    console.log(`\n✨ Your application now features:`);
    console.log(`   • Pure black/white glassmorphic design with Tailwind`);
    console.log(`   • Fira Code font integration`);
    console.log(`   • Heroicons replacing legacy icons`);
    console.log(`   • Centralized Pinia state management`);
    console.log(`   • Consistent spacing and layout`);
    console.log(`   • RGB neon highlights on interactive states`);
    console.log(`   • Production-grade component patterns`);

  } catch (error) {
    console.error(`\n❌ Build failed:`, error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default {
  main,
  processComponent,
  scanComponents,
  SYSTEM_CONFIG,
  ICON_MAPPINGS,
  COMPONENT_PATTERNS
};