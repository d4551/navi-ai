#!/usr/bin/env node
/* eslint-env node */
/* global require, process */
/**
 * Enhanced Cross-platform UI Setup Script
 * - Installs Tailwind, PostCSS, Autoprefixer, Pinia, Heroicons, Fira Code
 * - Initializes Tailwind config with proper content paths
 * - Sets up PostCSS configuration
 * - Creates comprehensive layout components
 * - Sets up Pinia store with TypeScript support detection
 * - Adds dark mode support throughout
 * - Creates utility functions and composables
 * - Safe to run multiple times (idempotent)
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

// ============== Utility Functions ==============

function run(cmd, options = {}) {
  console.log(`$ ${cmd}`)
  try {
    execSync(cmd, { stdio: 'inherit', ...options })
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`❌ Command failed: ${cmd}`)
      throw error
    }
  }
}

function fileExists(p) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

function ensureDir(dir) {
  if (!dirExists(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 Created directory: ${dir}`)
  }
}

function writeFileIfNotExists(filePath, content) {
  if (!fileExists(filePath)) {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, content)
    console.log(`✅ Created file: ${filePath}`)
    return true
  }
  return false
}

function isTypeScriptProject() {
  return fileExists('tsconfig.json') || fileExists('tsconfig.app.json')
}

function isViteProject() {
  return fileExists('vite.config.js') || fileExists('vite.config.ts')
}

// ============== Package Manager Detection ==============

function detectPackageManager() {
  // Check for lockfiles
  if (fileExists('pnpm-lock.yaml')) return 'pnpm'
  if (fileExists('yarn.lock')) return 'yarn'
  if (fileExists('bun.lockb')) return 'bun'
  if (fileExists('package-lock.json')) return 'npm'

  // Check environment variables
  const userAgent = process.env.npm_config_user_agent || ''
  if (userAgent.includes('pnpm')) return 'pnpm'
  if (userAgent.includes('yarn')) return 'yarn'
  if (userAgent.includes('bun')) return 'bun'

  return 'npm'
}

function pmInstall(packages, isDev = false) {
  const pm = detectPackageManager()
  const devFlag = isDev ? (pm === 'bun' ? '-d' : '-D') : ''

  const commands = {
    pnpm: `pnpm add ${devFlag} ${packages}`,
    yarn: `yarn add ${devFlag} ${packages}`,
    bun: `bun add ${devFlag} ${packages}`,
    npm: `npm install ${isDev ? '--save-dev' : '--save'} ${packages}`,
  }

  return run(commands[pm])
}

function pmExec(command) {
  const pm = detectPackageManager()
  const executors = {
    pnpm: 'pnpm dlx',
    yarn: 'yarn dlx',
    bun: 'bunx',
    npm: 'npx --yes',
  }

  return `${executors[pm]} ${command}`
}

// ============== Dependency Management ==============

function ensureDeps() {
  console.log('🔄 Checking and installing dependencies...')

  const pkgPath = path.resolve(process.cwd(), 'package.json')
  if (!fileExists(pkgPath)) {
    console.error(
      '❌ package.json not found. Please run this script in your project root.'
    )
    process.exit(1)
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const isTS = isTypeScriptProject()

  // Runtime dependencies
  const runtime = [
    'pinia',
    '@heroicons/vue',
    '@fontsource/fira-code',
    '@vueuse/core',
  ]

  // Development dependencies
  const dev = [
    'tailwindcss',
    'postcss',
    'autoprefixer',
    '@tailwindcss/forms',
    '@tailwindcss/typography',
    '@tailwindcss/aspect-ratio',
    '@tailwindcss/container-queries',
  ]

  // Add TypeScript types if needed
  if (isTS) {
    dev.push('@types/node')
  }

  const installed = { ...pkg.dependencies, ...pkg.devDependencies }
  const needRuntime = runtime.filter(d => !installed[d])
  const needDev = dev.filter(d => !installed[d])

  if (needRuntime.length) {
    console.log(`📦 Installing runtime dependencies: ${needRuntime.join(', ')}`)
    pmInstall(needRuntime.join(' '), false)
  }

  if (needDev.length) {
    console.log(`🛠️ Installing dev dependencies: ${needDev.join(', ')}`)
    pmInstall(needDev.join(' '), true)
  }
}

// ============== Tailwind Configuration ==============

function ensureTailwindInit() {
  console.log('🔄 Checking Tailwind configuration...')

  const configs = [
    'tailwind.config.js',
    'tailwind.config.cjs',
    'tailwind.config.mjs',
  ]
  const existingConfig = configs.find(c => fileExists(c))

  if (!existingConfig) {
    console.log('🔧 Initializing Tailwind configuration')

    try {
      run(pmExec('tailwindcss init -p'))
    } catch (err) {
      console.log('⚠️ Failed to run tailwindcss init, creating fallback config')
      createFallbackTailwindConfig()
    }
  }
}

function createFallbackTailwindConfig() {
  const isVite = isViteProject()
  const configContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}'
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
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
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
}`

  fs.writeFileSync('tailwind.config.cjs', configContent)
  console.log('✅ Created fallback tailwind.config.cjs')
}

function enhanceTailwindConfig() {
  const configs = [
    'tailwind.config.js',
    'tailwind.config.cjs',
    'tailwind.config.mjs',
  ]
  const configPath = configs.find(c => fileExists(c))

  if (!configPath) return

  console.log(`🔧 Enhancing Tailwind config: ${configPath}`)
  let content = fs.readFileSync(configPath, 'utf8')
  let modified = false

  // Ensure darkMode is properly configured
  if (!content.includes('darkMode')) {
    content = content.replace(
      /(module\.exports\s*=\s*\{|export\s+default\s*\{)/,
      `$1\n  darkMode: ['class', '[data-theme="dark"]'],`
    )
    modified = true
  }

  // Ensure plugins are included
  const plugins = ['@tailwindcss/typography', '@tailwindcss/forms']
  plugins.forEach(plugin => {
    if (!content.includes(plugin)) {
      if (content.includes('plugins:')) {
        content = content.replace(
          /plugins:\s*\[([^\]]*)\]/,
          `plugins: [$1${$1 ? ',' : ''} require('${plugin}')]`
        )
      } else {
        content = content.replace(
          /(module\.exports\s*=\s*\{|export\s+default\s*\{)/,
          `$1\n  plugins: [require('${plugin}')],`
        )
      }
      modified = true
    }
  })

  if (modified) {
    fs.writeFileSync(configPath, content)
    console.log('✅ Enhanced Tailwind configuration')
  }
}

// ============== PostCSS Configuration ==============

function ensurePostcss() {
  console.log('🔄 Checking PostCSS configuration...')

  const configs = [
    'postcss.config.js',
    'postcss.config.cjs',
    'postcss.config.mjs',
  ]
  const existingConfig = configs.find(c => fileExists(c))

  if (!existingConfig) {
    const content = `module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}`

    fs.writeFileSync('postcss.config.cjs', content)
    console.log('✅ Created PostCSS configuration')
  }
}

// ============== Global CSS Setup ==============

function ensureGlobalCss() {
  console.log('🔄 Setting up global CSS...')

  const srcDir = path.resolve('src')
  const stylesDir = path.join(srcDir, 'styles')
  ensureDir(stylesDir)

  const globalCss = path.join(stylesDir, 'global.css')
  const cssContent = `/* Tailwind Directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Font Imports */
@import '@fontsource/fira-code/400.css';
@import '@fontsource/fira-code/500.css';
@import '@fontsource/fira-code/700.css';

/* CSS Variables */
@layer base {
  :root {
    /* Colors */
    --color-primary: 59 130 246;
    --color-secondary: 99 102 241;
    --color-success: 34 197 94;
    --color-warning: 251 146 60;
    --color-error: 239 68 68;
    
    /* Spacing */
    --space-xs: 0.125rem;
    --space-sm: 0.25rem;
    --space-md: 0.5rem;
    --space-lg: 1rem;
    --space-xl: 1.5rem;
    --space-2xl: 2rem;
    --space-3xl: 3rem;
    
    /* Layout */
    --header-height: 4rem;
    --footer-height: 3.75rem;
    --sidebar-width: 16rem;
    --sidebar-collapsed-width: 4rem;
    
    /* Container widths */
    --container-xs: 475px;
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1536px;
    
    /* Form elements */
    --input-height: 2.5rem;
    --input-height-sm: 2rem;
    --input-height-lg: 3rem;
    
    /* Border radius */
    --radius-sm: 0.125rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-full: 9999px;
    
    /* Transitions */
    --transition-fast: 150ms;
    --transition-base: 250ms;
    --transition-slow: 350ms;
    
    /* Z-index scale */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
  }
  
  /* Dark mode variables */
  [data-theme="dark"] {
    --color-primary: 96 165 250;
    --color-secondary: 167 139 250;
  }
}

/* Base Styles */
@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }
  
  body {
    @apply min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500 dark:bg-gray-500;
  }
}

/* Component Classes */
@layer components {
  /* Layout containers */
  .container-xs { @apply max-w-[475px] mx-auto px-4; }
  .container-sm { @apply max-w-screen-sm mx-auto px-4; }
  .container-md { @apply max-w-screen-md mx-auto px-4; }
  .container-lg { @apply max-w-screen-lg mx-auto px-4; }
  .container-xl { @apply max-w-screen-xl mx-auto px-4; }
  .container-2xl { @apply max-w-screen-2xl mx-auto px-4; }
  
  /* Buttons */
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 font-medium rounded-md;
    @apply transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-sm { @apply text-sm px-3 py-1.5; }
  .btn-lg { @apply text-lg px-6 py-3; }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
    @apply dark:bg-blue-500 dark:hover:bg-blue-600;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
    @apply dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600;
  }
  
  .btn-ghost {
    @apply bg-transparent hover:bg-gray-100 focus:ring-gray-500;
    @apply dark:hover:bg-gray-800;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  
  /* Form inputs */
  .form-input {
    @apply block w-full rounded-md border-gray-300 shadow-sm;
    @apply focus:border-blue-500 focus:ring-blue-500;
    @apply dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100;
  }
  
  .form-label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
  }
  
  .form-error {
    @apply text-sm text-red-600 dark:text-red-400 mt-1;
  }
  
  /* Cards */
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
    @apply dark:bg-gray-800;
  }
  
  .card-bordered {
    @apply border border-gray-200 dark:border-gray-700;
  }
  
  /* Badges */
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-primary {
    @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
  }
  
  .badge-success {
    @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
  }
  
  .badge-warning {
    @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
  }
  
  .badge-danger {
    @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
  }
  
  /* Animations */
  .animate-fade-in {
    animation: fadeIn var(--transition-base) ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp var(--transition-fast) ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
}

/* Utility Classes */
@layer utilities {
  /* Text truncation */
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .truncate-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Aspect ratios */
  .aspect-21-9 {
    aspect-ratio: 21 / 9;
  }
  
  /* Custom focus styles */
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
  }
}`

  writeFileIfNotExists(globalCss, cssContent)
  console.log('✅ Created comprehensive global CSS')
}

// ============== Icon Components ==============

function ensureIconComponents() {
  console.log('🔄 Setting up icon components...')

  const componentsDir = path.resolve('src/components')
  ensureDir(componentsDir)

  const isTS = isTypeScriptProject()
  const ext = isTS ? '.vue' : '.vue' // Could use .tsx for TS

  // Enhanced HeroIcon component
  const heroIconContent = `<template>
  <component 
    :is="iconComponent" 
    v-bind="$attrs"
    :class="iconClasses"
  />
</template>

<script${isTS ? ' lang="ts"' : ''}>
import { computed, defineComponent } from 'vue'
import * as OutlineIcons from '@heroicons/vue/24/outline'
import * as SolidIcons from '@heroicons/vue/24/solid'
${isTS ? "import type { Component } from 'vue'" : ''}

export default defineComponent({
  name: 'HeroIcon',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'outline',
      validator: (value${isTS ? ': string' : ''}) => ['outline', 'solid'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value${isTS ? ': string' : ''}) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    }
  },
  setup(props) {
    const iconComponent = computed(()${isTS ? ': Component | undefined' : ''} => {
      const iconName = normalizeIconName(props.name)
      const icons = props.variant === 'solid' ? SolidIcons : OutlineIcons
      return icons[iconName] || OutlineIcons.QuestionMarkCircleIcon
    })
    
    const iconClasses = computed(() => {
      const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
      }
      return sizes[props.size] || sizes.md
    })
    
    function normalizeIconName(name${isTS ? ': string' : ''})${isTS ? ': string' : ''} {
      // Convert kebab-case to PascalCase and append 'Icon'
      const cleaned = name
        .replace(/[^a-z0-9\\-]/gi, '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('') + 'Icon'
      return cleaned
    }
    
    return {
      iconComponent,
      iconClasses
    }
  }
})
</script>`

  writeFileIfNotExists(
    path.join(componentsDir, `HeroIcon${ext}`),
    heroIconContent
  )

  // Icon utilities
  const utilsDir = path.resolve('src/utils')
  ensureDir(utilsDir)

  const iconMapContent = `/**
 * Icon name mapping utilities
 */

// Map common icon names to Heroicons
const iconMap${isTS ? ': Record<string, string>' : ''} = {
  // Common aliases
  'search': 'magnifying-glass',
  'settings': 'cog-6-tooth',
  'config': 'cog-6-tooth',
  'delete': 'trash',
  'remove': 'trash',
  'home': 'home',
  'dashboard': 'squares-2x2',
  'notification': 'bell',
  'notifications': 'bell',
  'alert': 'exclamation-triangle',
  'warning': 'exclamation-triangle',
  'error': 'x-circle',
  'success': 'check-circle',
  'info': 'information-circle',
  'user': 'user',
  'users': 'users',
  'profile': 'user-circle',
  'logout': 'arrow-right-on-rectangle',
  'login': 'arrow-left-on-rectangle',
  'menu': 'bars-3',
  'close': 'x-mark',
  'add': 'plus',
  'edit': 'pencil',
  'save': 'check',
  'cancel': 'x-mark',
  'download': 'arrow-down-tray',
  'upload': 'arrow-up-tray',
  'copy': 'document-duplicate',
  'paste': 'clipboard',
  'email': 'envelope',
  'phone': 'phone',
  'calendar': 'calendar',
  'clock': 'clock',
  'time': 'clock',
  'location': 'map-pin',
  'map': 'map',
  'link': 'link',
  'external': 'arrow-top-right-on-square',
  'refresh': 'arrow-path',
  'filter': 'funnel',
  'sort': 'bars-arrow-down',
  'grid': 'squares-2x2',
  'list': 'list-bullet',
  'eye': 'eye',
  'eye-off': 'eye-slash',
  'lock': 'lock-closed',
  'unlock': 'lock-open',
  'key': 'key',
  'shield': 'shield-check',
  'star': 'star',
  'heart': 'heart',
  'bookmark': 'bookmark',
  'flag': 'flag',
  'folder': 'folder',
  'file': 'document',
  'photo': 'photo',
  'camera': 'camera',
  'video': 'video-camera',
  'mic': 'microphone',
  'volume': 'speaker-wave',
  'wifi': 'wifi',
  'bluetooth': 'signal',
  'battery': 'battery-100',
  'sun': 'sun',
  'moon': 'moon',
  'cloud': 'cloud',
  'database': 'circle-stack',
  'server': 'server',
  'cpu': 'cpu-chip',
  'tag': 'tag',
  'cart': 'shopping-cart',
  'credit-card': 'credit-card',
  'gift': 'gift',
  'truck': 'truck',
  'plane': 'paper-airplane',
  'chat': 'chat-bubble-left-right',
  'message': 'chat-bubble-left',
  'question': 'question-mark-circle',
  'help': 'question-mark-circle',
  'print': 'printer',
  'qr': 'qr-code',
  'barcode': 'bars-3-bottom-left',
  'chart': 'chart-bar',
  'graph': 'chart-line',
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',
  'fire': 'fire',
  'lightning': 'bolt',
  'play': 'play',
  'pause': 'pause',
  'stop': 'stop',
  'forward': 'forward',
  'backward': 'backward',
  'next': 'chevron-right',
  'previous': 'chevron-left',
  'up': 'chevron-up',
  'down': 'chevron-down',
}

export function mapIconName(name${isTS ? ': string' : ''})${isTS ? ': string' : ''} {
  if (!name) return 'question-mark-circle'
  
  const normalized = name.toLowerCase().trim()
  return iconMap[normalized] || normalized
}

export function getIconList()${isTS ? ': string[]' : ''} {
  return Object.keys(iconMap)
}

export default mapIconName`

  writeFileIfNotExists(
    path.join(utilsDir, isTS ? 'iconMap.ts' : 'iconMap.js'),
    iconMapContent
  )
}

// ============== Layout Components ==============

function ensureLayoutComponents() {
  console.log('🔄 Setting up layout components...')

  const layoutDir = path.resolve('src/components/layout')
  ensureDir(layoutDir)

  const isTS = isTypeScriptProject()

  // Main Layout
  writeFileIfNotExists(
    path.join(layoutDir, 'AppLayout.vue'),
    `<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <AppHeader 
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @toggle-theme="toggleTheme"
    />
    
    <div class="flex flex-1">
      <AppSidebar 
        v-if="showSidebar" 
        :open="sidebarOpen"
        @close="sidebarOpen = false"
      />
      
      <main class="flex-1 p-6 overflow-auto">
        <div :class="containerClass">
          <slot></slot>
        </div>
      </main>
    </div>
    
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script${isTS ? ' lang="ts"' : ''}>
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'

export default defineComponent({
  name: 'AppLayout',
  components: {
    AppHeader,
    AppSidebar,
    AppFooter
  },
  props: {
    showSidebar: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    containerSize: {
      type: String,
      default: 'lg',
      validator: (value${isTS ? ': string' : ''}) => ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value)
    }
  },
  setup(props) {
    const settings = useSettingsStore()
    const sidebarOpen = ref(true)
    
    const containerClass = computed(() => {
      if (props.containerSize === 'full') return 'w-full'
      return \`container-\${props.containerSize}\`
    })
    
    function toggleTheme() {
      settings.toggleTheme()
    }
    
    onMounted(() => {
      // Apply saved theme
      if (settings.isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.documentElement.classList.add('dark')
      }
    })
    
    return {
      sidebarOpen,
      containerClass,
      toggleTheme
    }
  }
})
</script>`
  )

  // Header Component
  writeFileIfNotExists(
    path.join(layoutDir, 'AppHeader.vue'),
    `<template>
  <header class="h-[var(--header-height)] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[var(--z-sticky)]">
    <div class="h-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-full">
        <!-- Left section -->
        <div class="flex items-center">
          <button
            @click="$emit('toggle-sidebar')"
            class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus-visible-ring"
          >
            <HeroIcon name="bars-3" size="md" />
          </button>
          
          <div class="ml-4 flex items-center">
            <img 
              v-if="logo" 
              :src="logo" 
              alt="Logo" 
              class="h-8 w-auto"
            >
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ appName }}
            </h1>
          </div>
        </div>
        
        <!-- Center section (search) -->
        <div class="hidden md:block flex-1 max-w-lg mx-4">
          <div class="relative">
            <input
              type="search"
              placeholder="Search..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
            <HeroIcon 
              name="magnifying-glass" 
              size="sm"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
        
        <!-- Right section -->
        <div class="flex items-center space-x-2">
          <!-- Theme toggle -->
          <button
            @click="$emit('toggle-theme')"
            class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus-visible-ring"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <HeroIcon :name="isDark ? 'sun' : 'moon'" size="sm" />
          </button>
          
          <!-- Notifications -->
          <button
            class="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus-visible-ring"
          >
            <HeroIcon name="bell" size="sm" />
            <span 
              v-if="notificationCount > 0"
              class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"
            ></span>
          </button>
          
          <!-- User menu -->
          <div class="relative ml-3">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus-visible-ring"
            >
              <HeroIcon name="user-circle" size="md" />
            </button>
            
            <!-- Dropdown menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Profile
                  </a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Settings
                  </a>
                  <hr class="my-1 border-gray-200 dark:border-gray-600">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Sign out
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script${isTS ? ' lang="ts"' : ''}>
import { ref, computed, defineComponent } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import HeroIcon from '../HeroIcon.vue'

export default defineComponent({
  name: 'AppHeader',
  components: {
    HeroIcon
  },
  props: {
    appName: {
      type: String,
      default: 'My App'
    },
    logo: {
      type: String,
      default: ''
    },
    notificationCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['toggle-sidebar', 'toggle-theme'],
  setup() {
    const settings = useSettingsStore()
    const userMenuOpen = ref(false)
    
    const isDark = computed(() => settings.isDarkTheme)
    
    return {
      userMenuOpen,
      isDark
    }
  }
})
</script>`
  )

  // Sidebar Component
  writeFileIfNotExists(
    path.join(layoutDir, 'AppSidebar.vue'),
    `<template>
  <aside
    :class="[
      'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
      'transition-all duration-300 ease-in-out',
      open ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]',
      'h-[calc(100vh-var(--header-height))] overflow-y-auto'
    ]"
  >
    <nav class="p-4">
      <ul class="space-y-1">
        <li v-for="item in navigation" :key="item.name">
          <a
            :href="item.href"
            :class="[
              'flex items-center px-3 py-2 rounded-md transition-colors',
              'text-sm font-medium',
              item.current
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
            ]"
            :title="!open ? item.name : undefined"
          >
            <HeroIcon 
              :name="item.icon" 
              size="sm"
              :class="[
                'flex-shrink-0',
                item.current ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400',
                open ? 'mr-3' : ''
              ]"
            />
            <span v-if="open" class="truncate">{{ item.name }}</span>
          </a>
        </li>
      </ul>
      
      <!-- Divider -->
      <div class="my-4 border-t border-gray-200 dark:border-gray-700"></div>
      
      <!-- Secondary navigation -->
      <ul class="space-y-1">
        <li v-for="item in secondaryNavigation" :key="item.name">
          <a
            :href="item.href"
            :class="[
              'flex items-center px-3 py-2 rounded-md transition-colors',
              'text-sm font-medium',
              'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
            ]"
            :title="!open ? item.name : undefined"
          >
            <HeroIcon 
              :name="item.icon" 
              size="sm"
              :class="[
                'flex-shrink-0 text-gray-400',
                open ? 'mr-3' : ''
              ]"
            />
            <span v-if="open" class="truncate">{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script${isTS ? ' lang="ts"' : ''}>
import { defineComponent } from 'vue'
import HeroIcon from '../HeroIcon.vue'

export default defineComponent({
  name: 'AppSidebar',
  components: {
    HeroIcon
  },
  props: {
    open: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup() {
    const navigation = [
      { name: 'Dashboard', href: '#', icon: 'home', current: true },
      { name: 'Team', href: '#', icon: 'users', current: false },
      { name: 'Projects', href: '#', icon: 'folder', current: false },
      { name: 'Calendar', href: '#', icon: 'calendar', current: false },
      { name: 'Documents', href: '#', icon: 'document', current: false },
      { name: 'Reports', href: '#', icon: 'chart-bar', current: false },
    ]
    
    const secondaryNavigation = [
      { name: 'Settings', href: '#', icon: 'cog-6-tooth' },
      { name: 'Help', href: '#', icon: 'question-mark-circle' },
      { name: 'Privacy', href: '#', icon: 'shield-check' },
    ]
    
    return {
      navigation,
      secondaryNavigation
    }
  }
})
</script>`
  )

  // Footer Component
  writeFileIfNotExists(
    path.join(layoutDir, 'AppFooter.vue'),
    `<template>
  <footer class="h-[var(--footer-height)] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="h-full px-4 sm:px-6 lg:px-8">
      <div class="h-full flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          © {{ currentYear }} {{ companyName }}. All rights reserved.
        </div>
        
        <nav class="flex space-x-4">
          <a 
            v-for="link in footerLinks" 
            :key="link.name"
            :href="link.href"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {{ link.name }}
          </a>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script${isTS ? ' lang="ts"' : ''}>
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'AppFooter',
  props: {
    companyName: {
      type: String,
      default: 'Your Company'
    }
  },
  setup() {
    const currentYear = computed(() => new Date().getFullYear())
    
    const footerLinks = [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Contact', href: '#' },
    ]
    
    return {
      currentYear,
      footerLinks
    }
  }
})
</script>`
  )
}

// ============== Pinia Store Setup ==============

function ensurePiniaSetup() {
  console.log('🔄 Setting up Pinia stores...')

  const storesDir = path.resolve('src/stores')
  ensureDir(storesDir)

  const isTS = isTypeScriptProject()
  const ext = isTS ? '.ts' : '.js'

  // Main store index
  writeFileIfNotExists(
    path.join(storesDir, `index${ext}`),
    `import { createPinia${isTS ? ', type Pinia' : ''} } from 'pinia'
${isTS ? "import type { App } from 'vue'" : ''}

export const pinia = createPinia()

export function setupPinia(app${isTS ? ': App' : ''})${isTS ? ': Pinia' : ''} {
  app.use(pinia)
  return pinia
}

// Export all stores
export { useUserStore } from './user'
export { useSettingsStore } from './settings'
export { useNotificationStore } from './notification'`
  )

  // User store
  writeFileIfNotExists(
    path.join(storesDir, `user${ext}`),
    `import { defineStore } from 'pinia'
${isTS ? "import type { Ref } from 'vue'" : ''}
import { ref, computed } from 'vue'

${
  isTS
    ? `interface User {
  id: number
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
}`
    : ''
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref${isTS ? '<User | null>' : ''}(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref${isTS ? '<string | null>' : ''}(null)
  
  // Getters
  const userName = computed(() => user.value?.name || 'Guest')
  const userRole = computed(() => user.value?.role || 'user')
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  // Actions
  async function login(credentials${isTS ? ': { email: string; password: string }' : ''}) {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      const response = await mockLogin(credentials)
      user.value = response.user
      isAuthenticated.value = true
      return response
    } catch (err) {
      error.value = err${isTS ? ' instanceof Error ? err' : ''}.message${isTS ? " : 'Login failed'" : ''}
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    user.value = null
    isAuthenticated.value = false
    // TODO: Call logout API
  }
  
  async function fetchProfile() {
    loading.value = true
    try {
      // TODO: Replace with actual API call
      const response = await mockFetchProfile()
      user.value = response
      isAuthenticated.value = true
    } catch (err) {
      error.value = err${isTS ? ' instanceof Error ? err' : ''}.message${isTS ? " : 'Failed to fetch profile'" : ''}
    } finally {
      loading.value = false
    }
  }
  
  function updateProfile(data${isTS ? ': Partial<User>' : ''}) {
    if (user.value) {
      user.value = { ...user.value, ...data }
    }
  }
  
  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    // Getters
    userName,
    userRole,
    isAdmin,
    // Actions
    login,
    logout,
    fetchProfile,
    updateProfile
  }
})

// Mock functions (replace with real API calls)
function mockLogin(credentials${isTS ? ': { email: string; password: string }' : ''}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: 1,
          email: credentials.email,
          name: 'John Doe',
          role: 'admin'
        }
      })
    }, 500)
  })
}

function mockFetchProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        role: 'admin'
      })
    }, 500)
  })
}`
  )

  // Settings store
  writeFileIfNotExists(
    path.join(storesDir, `settings${ext}`),
    `import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const theme = ref${isTS ? "<'light' | 'dark'>" : ''}('light')
  const sidebarCollapsed = ref(false)
  const language = ref('en')
  const notifications = ref({
    email: true,
    push: true,
    desktop: false
  })
  
  // Getters
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isLightTheme = computed(() => theme.value === 'light')
  
  // Actions
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme()
  }
  
  function setTheme(newTheme${isTS ? ": 'light' | 'dark'" : ''}) {
    theme.value = newTheme
    applyTheme()
  }
  
  function applyTheme() {
    const root = document.documentElement
    if (theme.value === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme.value)
  }
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function setLanguage(lang${isTS ? ': string' : ''}) {
    language.value = lang
    // TODO: Update i18n locale
  }
  
  function updateNotificationSettings(settings${isTS ? ': Partial<typeof notifications.value>' : ''}) {
    notifications.value = { ...notifications.value, ...settings }
  }
  
  // Initialize theme from localStorage
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')${isTS ? ' as "light" | "dark" | null' : ''}
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      theme.value = savedTheme
      applyTheme()
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme.value = 'dark'
        applyTheme()
      }
    }
  }
  
  // Watch for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === null) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme()
      }
    })
  }
  
  return {
    // State
    theme,
    sidebarCollapsed,
    language,
    notifications,
    // Getters
    isDarkTheme,
    isLightTheme,
    // Actions
    toggleTheme,
    setTheme,
    applyTheme,
    toggleSidebar,
    setLanguage,
    updateNotificationSettings,
    initializeTheme
  }
})`
  )

  // Notification store
  writeFileIfNotExists(
    path.join(storesDir, `notification${ext}`),
    `import { defineStore } from 'pinia'
import { ref } from 'vue'

${
  isTS
    ? `export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}`
    : ''
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref${isTS ? '<Notification[]>' : ''}([])
  let notificationId = 0
  
  // Actions
  function addNotification(notification${isTS ? ': Omit<Notification, "id">' : ''}) {
    const id = \`notification-\${++notificationId}\`
    const newNotification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto-remove after duration unless persistent
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  function removeNotification(id${isTS ? ': string' : ''}) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function clearNotifications() {
    notifications.value = []
  }
  
  // Helper methods for different types
  function success(title${isTS ? ': string' : ''}, message${isTS ? '?: string' : ''}) {
    return addNotification({ type: 'success', title, message })
  }
  
  function error(title${isTS ? ': string' : ''}, message${isTS ? '?: string' : ''}) {
    return addNotification({ type: 'error', title, message, duration: 10000 })
  }
  
  function warning(title${isTS ? ': string' : ''}, message${isTS ? '?: string' : ''}) {
    return addNotification({ type: 'warning', title, message })
  }
  
  function info(title${isTS ? ': string' : ''}, message${isTS ? '?: string' : ''}) {
    return addNotification({ type: 'info', title, message })
  }
  
  return {
    // State
    notifications,
    // Actions
    addNotification,
    removeNotification,
    clearNotifications,
    // Helper methods
    success,
    error,
    warning,
    info
  }
})`
  )
}

// ============== Composables ==============

function ensureComposables() {
  console.log('🔄 Setting up Vue composables...')

  const composablesDir = path.resolve('src/composables')
  ensureDir(composablesDir)

  const isTS = isTypeScriptProject()
  const ext = isTS ? '.ts' : '.js'

  // Dark mode composable
  writeFileIfNotExists(
    path.join(composablesDir, `useDarkMode${ext}`),
    `import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useDarkMode() {
  const settings = useSettingsStore()
  
  return {
    isDark: settings.isDarkTheme,
    toggle: () => settings.toggleTheme(),
    setDark: (value${isTS ? ': boolean' : ''}) => settings.setTheme(value ? 'dark' : 'light')
  }
}`
  )

  // Breakpoint composable
  writeFileIfNotExists(
    path.join(composablesDir, `useBreakpoint${ext}`),
    `import { ref, computed, onMounted, onUnmounted } from 'vue'

const screens = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useBreakpoint() {
  const windowWidth = ref(window.innerWidth)
  
  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }
  
  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })
  
  const breakpoint = computed(() => {
    if (windowWidth.value < screens.sm) return 'xs'
    if (windowWidth.value < screens.md) return 'sm'
    if (windowWidth.value < screens.lg) return 'md'
    if (windowWidth.value < screens.xl) return 'lg'
    if (windowWidth.value < screens['2xl']) return 'xl'
    return '2xl'
  })
  
  const isMobile = computed(() => windowWidth.value < screens.md)
  const isTablet = computed(() => windowWidth.value >= screens.md && windowWidth.value < screens.lg)
  const isDesktop = computed(() => windowWidth.value >= screens.lg)
  
  const isSmaller = (size${isTS ? ': keyof typeof screens' : ''}) => windowWidth.value < screens[size]
  const isLarger = (size${isTS ? ': keyof typeof screens' : ''}) => windowWidth.value >= screens[size]
  
  return {
    windowWidth,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmaller,
    isLarger
  }
}`
  )
}

// ============== Package Scripts ==============

function ensurePackageScripts() {
  console.log('🔄 Setting up package.json scripts...')

  const pkgPath = path.resolve('package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

  pkg.scripts = pkg.scripts || {}

  let modified = false
  const tailwindConfig =
    ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.mjs'].find(
      c => fileExists(c)
    ) || 'tailwind.config.cjs'

  const scripts = {
    'css:build': `tailwindcss -c ${tailwindConfig} -i ./src/styles/global.css -o ./dist/styles/global.css --minify`,
    'css:watch': `tailwindcss -c ${tailwindConfig} -i ./src/styles/global.css -o ./dist/styles/global.css --watch`,
    'css:dev': `tailwindcss -c ${tailwindConfig} -i ./src/styles/global.css -o ./dist/styles/global.css --watch`,
  }

  for (const [name, command] of Object.entries(scripts)) {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = command
      modified = true
    }
  }

  // Ensure dist directory exists
  ensureDir(path.resolve('dist/styles'))

  if (modified) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    console.log('✅ Updated package.json scripts')
  }
}

// ============== Main Function ==============

function main() {
  console.log('🚀 Starting enhanced UI setup...\n')

  try {
    // Check if we're in a valid project
    if (!fileExists('package.json')) {
      console.error(
        '❌ No package.json found. Please run this script in your project root.'
      )
      process.exit(1)
    }

    // Run setup steps
    ensureDeps()
    ensureTailwindInit()
    enhanceTailwindConfig()
    ensurePostcss()
    ensureGlobalCss()
    ensureIconComponents()
    ensureLayoutComponents()
    ensurePiniaSetup()
    ensureComposables()
    ensurePackageScripts()

    console.log('\n✨ UI setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('  1. Import global CSS in your main.js/main.ts:')
    console.log('     import "./styles/global.css"')
    console.log('  2. Set up Pinia in your main.js/main.ts:')
    console.log('     import { setupPinia } from "./stores"')
    console.log('     setupPinia(app)')
    console.log('  3. Run CSS build:')
    console.log(`     ${detectPackageManager()} run css:watch`)
    console.log('  4. Use the layout components in your App.vue')
    console.log('\n🎉 Happy coding!')
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
