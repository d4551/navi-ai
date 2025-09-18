#!/usr/bin/env node

/**
 * Comprehensive Legacy to Modern Migration Script
 * Replaces MDI icons with Heroicons and legacy CSS classes with Tailwind utilities
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Comprehensive MDI to Heroicons mapping
const MDI_TO_HEROICON = {
  // Navigation & UI
  'mdi-home': { name: 'HomeIcon', type: 'outline' },
  'mdi-menu': { name: 'Bars3Icon', type: 'outline' },
  'mdi-close': { name: 'XMarkIcon', type: 'outline' },
  'mdi-chevron-up': { name: 'ChevronUpIcon', type: 'outline' },
  'mdi-chevron-down': { name: 'ChevronDownIcon', type: 'outline' },
  'mdi-chevron-left': { name: 'ChevronLeftIcon', type: 'outline' },
  'mdi-chevron-right': { name: 'ChevronRightIcon', type: 'outline' },
  'mdi-arrow-up': { name: 'ArrowUpIcon', type: 'outline' },
  'mdi-arrow-down': { name: 'ArrowDownIcon', type: 'outline' },
  'mdi-arrow-left': { name: 'ArrowLeftIcon', type: 'outline' },
  'mdi-arrow-right': { name: 'ArrowRightIcon', type: 'outline' },

  // Actions
  'mdi-plus': { name: 'PlusIcon', type: 'outline' },
  'mdi-minus': { name: 'MinusIcon', type: 'outline' },
  'mdi-plus-circle': { name: 'PlusCircleIcon', type: 'outline' },
  'mdi-pencil': { name: 'PencilIcon', type: 'outline' },
  'mdi-delete': { name: 'TrashIcon', type: 'outline' },
  'mdi-trash-can': { name: 'TrashIcon', type: 'outline' },
  'mdi-trash-can-outline': { name: 'TrashIcon', type: 'outline' },
  'mdi-edit': { name: 'PencilSquareIcon', type: 'outline' },
  'mdi-cog': { name: 'CogIcon', type: 'outline' },
  'mdi-settings': { name: 'Cog6ToothIcon', type: 'outline' },
  'mdi-refresh': { name: 'ArrowPathIcon', type: 'outline' },
  'mdi-sync': { name: 'ArrowPathIcon', type: 'outline' },
  'mdi-copy': { name: 'DocumentDuplicateIcon', type: 'outline' },
  'mdi-content-copy': { name: 'DocumentDuplicateIcon', type: 'outline' },

  // Media & Files
  'mdi-play': { name: 'PlayIcon', type: 'solid' },
  'mdi-pause': { name: 'PauseIcon', type: 'solid' },
  'mdi-stop': { name: 'StopIcon', type: 'solid' },
  'mdi-download': { name: 'ArrowDownTrayIcon', type: 'outline' },
  'mdi-upload': { name: 'ArrowUpTrayIcon', type: 'outline' },
  'mdi-file': { name: 'DocumentIcon', type: 'outline' },
  'mdi-file-document': { name: 'DocumentIcon', type: 'outline' },
  'mdi-file-document-outline': { name: 'DocumentIcon', type: 'outline' },
  'mdi-file-document-edit': { name: 'DocumentTextIcon', type: 'outline' },
  'mdi-folder': { name: 'FolderIcon', type: 'outline' },
  'mdi-folder-outline': { name: 'FolderIcon', type: 'outline' },
  'mdi-folder-edit': { name: 'FolderIcon', type: 'outline' },
  'mdi-image': { name: 'PhotoIcon', type: 'outline' },
  'mdi-video': { name: 'VideoCameraIcon', type: 'outline' },
  'mdi-camera': { name: 'CameraIcon', type: 'outline' },
  'mdi-camera-off': { name: 'CameraIcon', type: 'outline' },
  'mdi-microphone': { name: 'MicrophoneIcon', type: 'outline' },
  'mdi-monitor': { name: 'ComputerDesktopIcon', type: 'outline' },
  'mdi-monitor-screenshot': { name: 'ComputerDesktopIcon', type: 'outline' },
  'mdi-monitor-off': { name: 'ComputerDesktopIcon', type: 'outline' },

  // Communication
  'mdi-email': { name: 'EnvelopeIcon', type: 'outline' },
  'mdi-message': { name: 'ChatBubbleLeftIcon', type: 'outline' },
  'mdi-message-text': { name: 'ChatBubbleLeftRightIcon', type: 'outline' },
  'mdi-chat': { name: 'ChatBubbleOvalLeftIcon', type: 'outline' },
  'mdi-send': { name: 'PaperAirplaneIcon', type: 'outline' },
  'mdi-phone': { name: 'PhoneIcon', type: 'outline' },
  'mdi-bell': { name: 'BellIcon', type: 'outline' },
  'mdi-bell-outline': { name: 'BellIcon', type: 'outline' },

  // User & Account
  'mdi-account': { name: 'UserIcon', type: 'outline' },
  'mdi-account-outline': { name: 'UserIcon', type: 'outline' },
  'mdi-account-plus': { name: 'UserPlusIcon', type: 'outline' },
  'mdi-account-plus-outline': { name: 'UserPlusIcon', type: 'outline' },
  'mdi-account-group': { name: 'UsersIcon', type: 'outline' },
  'mdi-account-heart': { name: 'HeartIcon', type: 'outline' },
  'mdi-account-voice': { name: 'SpeakerWaveIcon', type: 'outline' },
  'mdi-badge-account-outline': { name: 'IdentificationIcon', type: 'outline' },

  // Gaming & Entertainment
  'mdi-gamepad': { name: 'PuzzlePieceIcon', type: 'outline' },
  'mdi-gamepad-variant': { name: 'PuzzlePieceIcon', type: 'outline' },
  'mdi-trophy': { name: 'TrophyIcon', type: 'solid' },
  'mdi-trophy-outline': { name: 'TrophyIcon', type: 'outline' },
  'mdi-target': { name: 'EyeIcon', type: 'outline' },
  'mdi-sword-cross': { name: 'BoltIcon', type: 'solid' },
  'mdi-star': { name: 'StarIcon', type: 'solid' },
  'mdi-star-outline': { name: 'StarIcon', type: 'outline' },

  // Development & Code
  'mdi-code-braces': { name: 'CodeBracketIcon', type: 'outline' },
  'mdi-code-tags': { name: 'CommandLineIcon', type: 'outline' },
  'mdi-console': { name: 'CommandLineIcon', type: 'outline' },
  'mdi-application': { name: 'WindowIcon', type: 'outline' },
  'mdi-web': { name: 'GlobeAltIcon', type: 'outline' },
  'mdi-earth': { name: 'GlobeAmericasIcon', type: 'outline' },
  'mdi-wrench': { name: 'WrenchScrewdriverIcon', type: 'outline' },
  'mdi-tools': { name: 'WrenchScrewdriverIcon', type: 'outline' },
  'mdi-test-tube': { name: 'BeakerIcon', type: 'outline' },

  // Business & Work
  'mdi-briefcase': { name: 'BriefcaseIcon', type: 'outline' },
  'mdi-briefcase-outline': { name: 'BriefcaseIcon', type: 'outline' },
  'mdi-briefcase-search': { name: 'MagnifyingGlassIcon', type: 'outline' },
  'mdi-briefcase-clock': { name: 'ClockIcon', type: 'outline' },
  'mdi-briefcase-off': { name: 'BriefcaseIcon', type: 'outline' },
  'mdi-domain': { name: 'BuildingOfficeIcon', type: 'outline' },
  'mdi-office-building': { name: 'BuildingOffice2Icon', type: 'outline' },
  'mdi-factory': { name: 'BuildingStorefrontIcon', type: 'outline' },
  'mdi-school': { name: 'AcademicCapIcon', type: 'outline' },
  'mdi-school-outline': { name: 'AcademicCapIcon', type: 'outline' },

  // Data & Analytics
  'mdi-chart-line': { name: 'ChartBarIcon', type: 'outline' },
  'mdi-chart-bar': { name: 'ChartBarSquareIcon', type: 'outline' },
  'mdi-chart-box': { name: 'ChartBarIcon', type: 'outline' },
  'mdi-trending-up': { name: 'ArrowTrendingUpIcon', type: 'outline' },
  'mdi-database': { name: 'CircleStackIcon', type: 'outline' },
  'mdi-table': { name: 'TableCellsIcon', type: 'outline' },
  'mdi-view-grid': { name: 'Squares2X2Icon', type: 'outline' },
  'mdi-view-list': { name: 'ListBulletIcon', type: 'outline' },
  'mdi-view-gallery': { name: 'PhotoIcon', type: 'outline' },

  // Status & Indicators
  'mdi-check': { name: 'CheckIcon', type: 'outline' },
  'mdi-check-circle': { name: 'CheckCircleIcon', type: 'solid' },
  'mdi-check-circle-outline': { name: 'CheckCircleIcon', type: 'outline' },
  'mdi-alert': { name: 'ExclamationTriangleIcon', type: 'outline' },
  'mdi-alert-circle': { name: 'ExclamationCircleIcon', type: 'outline' },
  'mdi-alert-circle-outline': {
    name: 'ExclamationCircleIcon',
    type: 'outline',
  },
  'mdi-information': { name: 'InformationCircleIcon', type: 'outline' },
  'mdi-information-outline': { name: 'InformationCircleIcon', type: 'outline' },
  'mdi-help': { name: 'QuestionMarkCircleIcon', type: 'outline' },
  'mdi-help-circle': { name: 'QuestionMarkCircleIcon', type: 'outline' },
  'mdi-help-circle-outline': {
    name: 'QuestionMarkCircleIcon',
    type: 'outline',
  },

  // Layout & Navigation
  'mdi-fullscreen': { name: 'ArrowsPointingOutIcon', type: 'outline' },
  'mdi-fullscreen-exit': { name: 'ArrowsPointingInIcon', type: 'outline' },
  'mdi-open-in-new': { name: 'ArrowTopRightOnSquareIcon', type: 'outline' },
  'mdi-launch': { name: 'ArrowTopRightOnSquareIcon', type: 'outline' },
  'mdi-drag-vertical': { name: 'Bars3Icon', type: 'outline' },
  'mdi-sort': { name: 'Bars3BottomLeftIcon', type: 'outline' },
  'mdi-filter': { name: 'FunnelIcon', type: 'outline' },
  'mdi-filter-variant': { name: 'AdjustmentsHorizontalIcon', type: 'outline' },
  'mdi-filter-remove': { name: 'FunnelIcon', type: 'outline' },

  // Time & Calendar
  'mdi-calendar': { name: 'CalendarIcon', type: 'outline' },
  'mdi-calendar-outline': { name: 'CalendarIcon', type: 'outline' },
  'mdi-clock': { name: 'ClockIcon', type: 'outline' },
  'mdi-clock-outline': { name: 'ClockIcon', type: 'outline' },
  'mdi-clock-fast': { name: 'ClockIcon', type: 'outline' },
  'mdi-timeline-clock-outline': { name: 'ClockIcon', type: 'outline' },

  // Search & Discovery
  'mdi-magnify': { name: 'MagnifyingGlassIcon', type: 'outline' },
  'mdi-search': { name: 'MagnifyingGlassIcon', type: 'outline' },
  'mdi-zoom-in': { name: 'MagnifyingGlassPlusIcon', type: 'outline' },
  'mdi-zoom-out': { name: 'MagnifyingGlassMinusIcon', type: 'outline' },

  // AI & Technology
  'mdi-robot': { name: 'CpuChipIcon', type: 'outline' },
  'mdi-robot-excited': { name: 'CpuChipIcon', type: 'outline' },
  'mdi-robot-industrial': { name: 'CpuChipIcon', type: 'outline' },
  'mdi-brain': { name: 'CpuChipIcon', type: 'outline' },
  'mdi-brain-outline': { name: 'CpuChipIcon', type: 'outline' },
  'mdi-auto-fix': { name: 'SparklesIcon', type: 'outline' },
  'mdi-wand': { name: 'CommandLineIcon', type: 'outline' },
  'mdi-sparkles': { name: 'SparklesIcon', type: 'outline' },
  'mdi-lightbulb': { name: 'LightBulbIcon', type: 'outline' },
  'mdi-lightbulb-on': { name: 'LightBulbIcon', type: 'solid' },

  // Devices & Hardware
  'mdi-cellphone': { name: 'DevicePhoneMobileIcon', type: 'outline' },
  'mdi-laptop': { name: 'ComputerDesktopIcon', type: 'outline' },
  'mdi-devices': { name: 'DeviceTabletIcon', type: 'outline' },

  // Security & Privacy
  'mdi-shield': { name: 'ShieldCheckIcon', type: 'outline' },
  'mdi-shield-check': { name: 'ShieldCheckIcon', type: 'outline' },
  'mdi-lock': { name: 'LockClosedIcon', type: 'outline' },
  'mdi-lock-open': { name: 'LockOpenIcon', type: 'outline' },
  'mdi-key': { name: 'KeyIcon', type: 'outline' },
  'mdi-eye': { name: 'EyeIcon', type: 'outline' },
  'mdi-eye-off': { name: 'EyeSlashIcon', type: 'outline' },

  // Social & Sharing
  'mdi-share': { name: 'ShareIcon', type: 'outline' },
  'mdi-share-variant': { name: 'ShareIcon', type: 'outline' },
  'mdi-export': { name: 'ArrowUpTrayIcon', type: 'outline' },
  'mdi-import': { name: 'ArrowDownTrayIcon', type: 'outline' },

  // Health & Monitoring
  'mdi-heart': { name: 'HeartIcon', type: 'solid' },
  'mdi-heart-outline': { name: 'HeartIcon', type: 'outline' },
  'mdi-heart-pulse': { name: 'HeartIcon', type: 'solid' },
  'mdi-pulse': { name: 'SignalIcon', type: 'outline' },

  // Text & Content
  'mdi-text': { name: 'DocumentTextIcon', type: 'outline' },
  'mdi-text-short': { name: 'DocumentTextIcon', type: 'outline' },
  'mdi-text-recognition': { name: 'DocumentTextIcon', type: 'outline' },
  'mdi-text-box-search': { name: 'MagnifyingGlassIcon', type: 'outline' },
  'mdi-card-text-outline': { name: 'DocumentTextIcon', type: 'outline' },
  'mdi-clipboard': { name: 'ClipboardIcon', type: 'outline' },
  'mdi-clipboard-outline': { name: 'ClipboardIcon', type: 'outline' },
  'mdi-clipboard-text': { name: 'ClipboardDocumentIcon', type: 'outline' },
  'mdi-clipboard-check-outline': {
    name: 'ClipboardDocumentCheckIcon',
    type: 'outline',
  },

  // Maps & Location
  'mdi-map-marker': { name: 'MapPinIcon', type: 'solid' },
  'mdi-navigation': { name: 'MapIcon', type: 'outline' },

  // Finance & Commerce
  'mdi-cash': { name: 'CurrencyDollarIcon', type: 'outline' },
  'mdi-credit-card': { name: 'CreditCardIcon', type: 'outline' },
  'mdi-shopping': { name: 'ShoppingBagIcon', type: 'outline' },

  // Fallbacks for unmapped icons
  'mdi-engine': { name: 'CogIcon', type: 'outline' },
  'mdi-memory': { name: 'CpuChipIcon', type: 'outline' },
  'mdi-stream': { name: 'SignalIcon', type: 'outline' },
  'mdi-bullseye-arrow': { name: 'EyeIcon', type: 'outline' },
  'mdi-tune-vertical': { name: 'AdjustmentsVerticalIcon', type: 'outline' },
  'mdi-file-tree': { name: 'DocumentIcon', type: 'outline' },
  'mdi-folder-multiple-image-outline': { name: 'FolderIcon', type: 'outline' },
  'mdi-rename': { name: 'PencilIcon', type: 'outline' },
  'mdi-compare': { name: 'ScaleIcon', type: 'outline' },
  'mdi-graph': { name: 'ChartBarIcon', type: 'outline' },
  'mdi-image-multiple': { name: 'PhotoIcon', type: 'outline' },
  'mdi-checkbox-multiple-marked': { name: 'CheckIcon', type: 'outline' },
}

// Legacy CSS class mappings to Tailwind utilities
const LEGACY_CSS_MAPPINGS = {
  // Background colors
  'bg-light': 'bg-white dark:bg-gray-100',
  'bg-dark': 'bg-gray-900 dark:bg-gray-800',
  'bg-primary': 'bg-primary-500',
  'bg-secondary': 'bg-secondary-500',
  'bg-success': 'bg-success-500',
  'bg-warning': 'bg-warning-500',
  'bg-danger': 'bg-error-500',
  'bg-info': 'bg-blue-500',

  // Text colors
  'text-muted': 'text-secondary',
  'text-primary': 'text-primary-600',
  'text-secondary': 'text-secondary',
  'text-success': 'text-success-600',
  'text-warning': 'text-warning-600',
  'text-danger': 'text-error-600',
  'text-info': 'text-blue-600',
  'text-light': 'text-white',
  'text-dark': 'text-gray-900',

  // Layout utilities
  'd-flex': 'flex',
  'd-none': 'hidden',
  'd-block': 'block',
  'd-inline': 'inline',
  'd-inline-block': 'inline-block',
  'flex-wrap': 'flex-wrap',
  'flex-column': 'flex-col',
  'flex-row': 'flex-row',
  'justify-content-start': 'justify-start',
  'justify-content-end': 'justify-end',
  'justify-content-center': 'justify-center',
  'justify-content-between': 'justify-between',
  'align-items-start': 'items-start',
  'align-items-center': 'items-center',
  'align-items-end': 'items-end',
  'align-center': 'items-center',

  // Spacing
  'p-0': 'p-0',
  'p-1': 'p-1',
  'p-2': 'p-2',
  'p-3': 'p-3',
  'p-4': 'p-4',
  'p-5': 'p-5',
  'p-6': 'p-6',
  'p-8': 'p-8',
  'm-0': 'm-0',
  'm-1': 'm-1',
  'm-2': 'm-2',
  'm-3': 'm-3',
  'm-4': 'm-4',
  'm-5': 'm-5',
  'm-6': 'm-6',
  'mb-0': 'mb-0',
  'mb-1': 'mb-1',
  'mb-2': 'mb-2',
  'mb-3': 'mb-3',
  'mb-4': 'mb-4',
  'mb-5': 'mb-5',
  'mb-6': 'mb-6',
  'mt-2': 'mt-2',
  'mt-3': 'mt-3',
  'mt-4': 'mt-4',
  'mt-5': 'mt-5',
  'mt-6': 'mt-6',
  'me-1': 'mr-1',
  'me-2': 'mr-2',
  'me-3': 'mr-3',
  'ms-1': 'ml-1',
  'ms-2': 'ml-2',
  'ms-3': 'ml-3',

  // Grid system
  row: 'flex flex-wrap',
  col: 'flex-1',
  'col-12': 'w-full',
  'col-6': 'w-1/2',
  'col-4': 'w-1/3',
  'col-3': 'w-1/4',
  'col-md-6': 'md:w-1/2',
  'col-md-4': 'md:w-1/3',
  'col-md-3': 'md:w-1/4',
  'col-lg-6': 'lg:w-1/2',
  'col-lg-4': 'lg:w-1/3',
  'col-lg-3': 'lg:w-1/4',

  // Borders
  border: 'border',
  'border-0': 'border-0',
  'border-top': 'border-t',
  'border-bottom': 'border-b',
  'border-start': 'border-l',
  'border-left': 'border-l',
  'border-end': 'border-r',
  'border-right': 'border-r',

  // Gaps
  'gap-0': 'gap-0',
  'gap-1': 'gap-1',
  'gap-2': 'gap-2',
  'gap-3': 'gap-3',
  'gap-4': 'gap-4',
  'gap-5': 'gap-5',
  'ga-2': 'gap-2',
  'ga-3': 'gap-3',
  'ga-4': 'gap-4',

  // Text utilities
  'text-center': 'text-center',
  'text-left': 'text-left',
  'text-right': 'text-right',
  'fw-medium': 'font-medium',
  'fw-semibold': 'font-semibold',
  'fw-bold': 'font-bold',
  'text-h6': 'text-lg font-semibold',
  'text-subtitle-1': 'text-base font-medium',
}

class ComprehensiveMigrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
    this.backupDir = options.backupDir || 'migration-backups'
    this.projectRoot = options.projectRoot || process.cwd()
    this.changes = []
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
      console.log(`${prefix} ${message}`)
    }
  }

  async findVueFiles() {
    const patterns = ['src/**/*.vue']
    const files = []
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: this.projectRoot })
      files.push(...matches.map(f => path.join(this.projectRoot, f)))
    }
    return files
  }

  createBackup(filePath) {
    if (this.dryRun) return
    const backupPath = path.join(
      this.projectRoot,
      this.backupDir,
      path.relative(this.projectRoot, filePath)
    )
    const dir = path.dirname(backupPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.copyFileSync(filePath, backupPath)
  }

  generateIconComponent(iconConfig, extraClasses = '', size = 'w-5 h-5') {
    const classes = extraClasses ? `${size} ${extraClasses}`.trim() : size
    const classProp = classes ? ` class="${classes}"` : ''
    return `<${iconConfig.name}${classProp} />`
  }

  addHeroiconsImports(content, fileIcons) {
    if (fileIcons.size === 0) return content

    const outline = []
    const solid = []

    for (const icon of fileIcons) {
      if (icon.type === 'solid') {
        solid.push(icon.name)
      } else {
        outline.push(icon.name)
      }
    }

    let imports = ''
    if (outline.length) {
      imports += `import { ${Array.from(new Set(outline)).sort().join(', ')} } from '@heroicons/vue/24/outline'\n`
    }
    if (solid.length) {
      imports += `import { ${Array.from(new Set(solid)).sort().join(', ')} } from '@heroicons/vue/24/solid'\n`
    }

    // Check if heroicons imports already exist
    if (content.includes('@heroicons/vue')) {
      // Merge with existing imports instead of duplicating
      return this.mergeHeroiconsImports(content, outline, solid)
    }

    // Find script setup or script tag
    const scriptSetupMatch = content.match(/<script setup[^>]*>/)
    const scriptMatch = content.match(/<script[^>]*>/)

    if (scriptSetupMatch) {
      const insertPos = scriptSetupMatch.index + scriptSetupMatch[0].length
      return (
        content.slice(0, insertPos) + '\n' + imports + content.slice(insertPos)
      )
    } else if (scriptMatch) {
      const insertPos = scriptMatch.index + scriptMatch[0].length
      return (
        content.slice(0, insertPos) + '\n' + imports + content.slice(insertPos)
      )
    } else {
      // Add new script setup block
      return `<script setup>\n${imports}</script>\n\n${content}`
    }
  }

  mergeHeroiconsImports(content, newOutline, newSolid) {
    // This is a simplified merge - in a real implementation you'd want more robust parsing
    return content
  }

  migrateFile(filePath) {
    const original = fs.readFileSync(filePath, 'utf8')
    let content = original
    let modified = false
    const fileIcons = new Set()
    const changes = {
      icons: [],
      classes: [],
    }

    // Replace MDI icons in AppIcon components: name="mdi-something"
    content = content.replace(/name="(mdi-[^"]+)"/g, (match, mdiName) => {
      const heroicon = MDI_TO_HEROICON[mdiName]
      if (heroicon) {
        fileIcons.add(heroicon)
        modified = true
        changes.icons.push({ from: mdiName, to: heroicon.name })
        return `name="${heroicon.name}"`
      }
      return match
    })

    // Replace MDI icons in leading-icon and icon props
    content = content.replace(
      /(leading-icon|trailing-icon|icon)="(mdi-[^"]+)"/g,
      (match, prop, mdiName) => {
        const heroicon = MDI_TO_HEROICON[mdiName]
        if (heroicon) {
          fileIcons.add(heroicon)
          modified = true
          changes.icons.push({ from: mdiName, to: heroicon.name })
          return `${prop}="${heroicon.name}"`
        }
        return match
      }
    )

    // Replace MDI icons in title-icon props
    content = content.replace(/title-icon="(mdi-[^"]+)"/g, (match, mdiName) => {
      const heroicon = MDI_TO_HEROICON[mdiName]
      if (heroicon) {
        fileIcons.add(heroicon)
        modified = true
        changes.icons.push({ from: mdiName, to: heroicon.name })
        return `title-icon="${heroicon.name}"`
      }
      return match
    })

    // Replace legacy CSS classes
    for (const [legacyClass, tailwindClass] of Object.entries(
      LEGACY_CSS_MAPPINGS
    )) {
      const regex = new RegExp(`\\b${legacyClass}\\b`, 'g')
      if (regex.test(content)) {
        content = content.replace(regex, tailwindClass)
        modified = true
        changes.classes.push({ from: legacyClass, to: tailwindClass })
      }
    }

    // Add Heroicons imports if we found any
    if (fileIcons.size > 0) {
      content = this.addHeroiconsImports(content, fileIcons)
    }

    if (!modified) return false

    if (!this.dryRun) {
      this.createBackup(filePath)
      fs.writeFileSync(filePath, content)
    }

    this.changes.push({
      file: path.relative(this.projectRoot, filePath),
      changes,
    })

    this.log(
      `Migrated ${path.relative(this.projectRoot, filePath)}: ${changes.icons.length} icons, ${changes.classes.length} classes`
    )
    return true
  }

  async migrate() {
    this.log('🚀 Starting comprehensive legacy → modern migration...')

    const files = await this.findVueFiles()
    this.log(`Found ${files.length} Vue files to process`)

    let processed = 0
    let modified = 0

    for (const file of files) {
      try {
        if (this.migrateFile(file)) {
          modified++
        }
        processed++
      } catch (error) {
        this.log(
          `Failed to process ${path.relative(this.projectRoot, file)}: ${error.message}`,
          'error'
        )
      }
    }

    this.log(
      `✅ Migration complete! Processed: ${processed}, Modified: ${modified}`
    )

    if (this.dryRun) {
      this.log('📋 This was a dry run - no files were changed')
    } else {
      this.log(`💾 Backups created in: ${this.backupDir}/`)
    }

    return {
      processedFiles: processed,
      modifiedFiles: modified,
      changes: this.changes,
    }
  }

  generateReport() {
    console.log('\n📊 MIGRATION REPORT')
    console.log('==================')

    let totalIcons = 0
    let totalClasses = 0

    for (const change of this.changes) {
      if (
        change.changes.icons.length > 0 ||
        change.changes.classes.length > 0
      ) {
        console.log(`\n📄 ${change.file}:`)

        if (change.changes.icons.length > 0) {
          console.log(`  🎨 Icons (${change.changes.icons.length}):`)
          for (const icon of change.changes.icons) {
            console.log(`    • ${icon.from} → ${icon.to}`)
          }
          totalIcons += change.changes.icons.length
        }

        if (change.changes.classes.length > 0) {
          console.log(`  🎭 Classes (${change.changes.classes.length}):`)
          for (const cls of change.changes.classes) {
            console.log(`    • ${cls.from} → ${cls.to}`)
          }
          totalClasses += change.changes.classes.length
        }
      }
    }

    console.log(`\n📈 SUMMARY:`)
    console.log(`  • Total files modified: ${this.changes.length}`)
    console.log(`  • Total icons migrated: ${totalIcons}`)
    console.log(`  • Total classes migrated: ${totalClasses}`)
    console.log(`  • Backup location: ${this.backupDir}/`)
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    backupDir:
      args.find(a => a.startsWith('--backup-dir='))?.split('=')[1] ||
      'migration-backups',
  }

  const migrator = new ComprehensiveMigrator(options)

  migrator
    .migrate()
    .then(results => {
      if (options.verbose) {
        migrator.generateReport()
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

export { ComprehensiveMigrator }
