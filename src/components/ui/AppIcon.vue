<template>
  <span :class="[rootClasses, $attrs.class]" :style="[computedStyle, $attrs.style]" v-bind="$attrs" class="font-sans">
    <!-- Heroicons -->
    <component
      :is="heroiconComponent"
      v-if="isHeroicon"
      :class="heroiconClasses"
      aria-hidden="true"
    />
    <!-- MDI Icons -->
    <i v-else :class="['mdi', resolvedMdi]" aria-hidden="true"></i>
  </span>
</template>

<script>
import { computed, shallowRef } from 'vue'
import { getMdiAlias } from '@/utils/iconAliases'

// Heroicons imports - organized by category
import {
  // Navigation & Actions
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  Bars3Icon,

  // Communication & Media
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  CameraIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,

  // Business & Work
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  FolderIcon,

  // Tech & Gaming
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  LightBulbIcon,

  // Status & Feedback
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,

  // Search & Discovery
  MagnifyingGlassIcon,
  EyeIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,

  // Social & Sharing
  ShareIcon,
  LinkIcon,
  GlobeAltIcon,

  // Data & Analytics
  ChartBarIcon,
  PresentationChartLineIcon,

  // Location & Maps
  MapPinIcon,
  HomeIcon,

  // UI Elements
  PaintBrushIcon,
  SwatchIcon,
  RectangleStackIcon,
  WindowIcon,

  // Tools & Utilities
  ClockIcon,
  CalendarIcon,
  TagIcon,
  BookmarkIcon,
  ArchiveBoxIcon,
  TrashIcon,
  PencilIcon,
  WifiIcon,
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  LockOpenIcon,

  // Arrows & Directions
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,

  // Media Controls
  ForwardIcon,
  BackwardIcon,
  SpeakerXMarkIcon,

  // Financial
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,

  // Educational
  BookOpenIcon,
  PuzzlePieceIcon,
  BeakerIcon,

  // Weather & Nature
  SunIcon,
  MoonIcon,
  CloudIcon,

} from '@heroicons/vue/24/outline'

import {
  // Solid variants for filled states
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  LightBulbIcon as LightBulbIconSolid,
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,

} from '@heroicons/vue/24/solid'

export default {
  name: 'AppIcon',
  inheritAttrs: false,
  props: {
    /**
     * Icon name or emoji to display
     * Can be Material Design Icon name (mdi-*) or emoji
     */
    name: {
      type: String,
      required: true
    },
    
    /**
     * Icon size - can be predefined or custom
     */
    size: {
      type: [String, Number],
      default: 'default',
      validator: (value) => {
        const validSizes = ['x-small', 'small', 'default', 'large', 'x-large', 'inherit']
        return validSizes.includes(value) || !isNaN(value)
      }
    },
    
    /**
     * Icon color - can be theme color or custom
     */
    color: {
      type: String,
      default: undefined
    },
    
    /**
     * Context for automatic sizing and coloring
     */
    context: {
      type: String,
      default: 'default',
      validator: (value) => {
        const validContexts = [
          'default', 'button', 'header', 'card', 'list', 'navigation',
          'achievement', 'gaming', 'success', 'warning', 'error', 'info'
        ]
        return validContexts.includes(value)
      }
    },
    
    /**
     * Additional CSS classes
     */
    variant: {
      type: String,
      default: undefined,
      validator: (value) => {
        const validVariants = ['filled', 'outlined', 'rounded', 'sharp', 'two-tone']
        return !value || validVariants.includes(value)
      }
    },
    
    /**
     * Make icon interactive (hover effects, etc.)
     */
    interactive: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    // Heroicons mapping - modern icon system
    const HEROICON_MAP = {
      // Navigation & Actions
      'arrow-left': ArrowLeftIcon,
      'arrow-right': ArrowRightIcon,
      'arrow-up': ArrowUpIcon,
      'arrow-down': ArrowDownIcon,
      'chevron-left': ChevronLeftIcon,
      'chevron-right': ChevronRightIcon,
      'chevron-up': ChevronUpIcon,
      'chevron-down': ChevronDownIcon,
      'close': XMarkIcon,
      'x': XMarkIcon,
      'plus': PlusIcon,
      'minus': MinusIcon,
      'check': CheckIcon,
      'dots-horizontal': EllipsisHorizontalIcon,
      'menu': Bars3Icon,

      // Communication & Media
      'chat': ChatBubbleLeftRightIcon,
      'phone': PhoneIcon,
      'email': EnvelopeIcon,
      'envelope': EnvelopeIcon,
      'microphone': MicrophoneIcon,
      'mic': MicrophoneIcon,
      'speaker': SpeakerWaveIcon,
      'volume': SpeakerWaveIcon,
      'video': VideoCameraIcon,
      'camera': CameraIcon,
      'play': PlayIcon,
      'pause': PauseIcon,
      'stop': StopIcon,

      // Business & Work
      'briefcase': BriefcaseIcon,
      'office': BuildingOfficeIcon,
      'building': BuildingOfficeIcon,
      'user': UserIcon,
      'account': UserIcon,
      'users': UsersIcon,
      'group': UsersIcon,
      'graduation': AcademicCapIcon,
      'school': AcademicCapIcon,
      'document': DocumentIcon,
      'file': DocumentIcon,
      'document-text': DocumentTextIcon,
      'file-text': DocumentTextIcon,
      'clipboard': ClipboardDocumentIcon,
      'folder': FolderIcon,

      // Tech & Gaming
      'computer': ComputerDesktopIcon,
      'desktop': ComputerDesktopIcon,
      'laptop': ComputerDesktopIcon,
      'phone-mobile': DevicePhoneMobileIcon,
      'mobile': DevicePhoneMobileIcon,
      'cellphone': DevicePhoneMobileIcon,
      'settings': CogIcon,
      'cog': CogIcon,
      'tools': WrenchScrewdriverIcon,
      'wrench': WrenchScrewdriverIcon,
      'bolt': BoltIcon,
      'flash': BoltIcon,
      'lightning': BoltIcon,
      'lightbulb': LightBulbIcon,
      'idea': LightBulbIcon,

      // Status & Feedback
      'check-circle': CheckCircleIcon,
      'success': CheckCircleIcon,
      'x-circle': XCircleIcon,
      'error': XCircleIcon,
      'alert': ExclamationTriangleIcon,
      'warning': ExclamationTriangleIcon,
      'info': InformationCircleIcon,
      'information': InformationCircleIcon,
      'heart': HeartIcon,
      'favorite': HeartIcon,
      'star': StarIcon,
      'trophy': TrophyIcon,
      'achievement': TrophyIcon,
      'fire': FireIcon,

      // Search & Discovery
      'search': MagnifyingGlassIcon,
      'magnify': MagnifyingGlassIcon,
      'eye': EyeIcon,
      'view': EyeIcon,
      'filter': FunnelIcon,
      'adjustments': AdjustmentsHorizontalIcon,

      // Social & Sharing
      'share': ShareIcon,
      'link': LinkIcon,
      'web': GlobeAltIcon,
      'globe': GlobeAltIcon,
      'website': GlobeAltIcon,

      // Data & Analytics
      'chart-bar': ChartBarIcon,
      'bar-chart': ChartBarIcon,
      'chart-line': ChartBarIcon,
      'line-chart': ChartBarIcon,
      'analytics': PresentationChartLineIcon,
      'presentation': PresentationChartLineIcon,

      // Location & Maps
      'map-pin': MapPinIcon,
      'location': MapPinIcon,
      'marker': MapPinIcon,
      'home': HomeIcon,

      // UI Elements
      'paint': PaintBrushIcon,
      'brush': PaintBrushIcon,
      'palette': SwatchIcon,
      'color': SwatchIcon,
      'stack': RectangleStackIcon,
      'layers': RectangleStackIcon,
      'window': WindowIcon,

      // Tools & Utilities
      'clock': ClockIcon,
      'time': ClockIcon,
      'calendar': CalendarIcon,
      'date': CalendarIcon,
      'tag': TagIcon,
      'bookmark': BookmarkIcon,
      'archive': ArchiveBoxIcon,
      'trash': TrashIcon,
      'delete': TrashIcon,
      'pencil': PencilIcon,
      'edit': PencilIcon,
      'wifi': WifiIcon,
      'signal': WifiIcon,
      'battery': ShieldCheckIcon,
      'shield': ShieldCheckIcon,
      'security': ShieldCheckIcon,
      'key': KeyIcon,
      'lock': LockClosedIcon,
      'unlock': LockOpenIcon,

      // Arrows & Directions
      'refresh': ArrowPathIcon,
      'reload': ArrowPathIcon,
      'undo': ArrowUturnLeftIcon,
      'redo': ArrowUturnRightIcon,

      // Media Controls
      'forward': ForwardIcon,
      'next': ForwardIcon,
      'backward': BackwardIcon,
      'previous': BackwardIcon,
      'mute': SpeakerXMarkIcon,

      // Financial
      'dollar': CurrencyDollarIcon,
      'money': CurrencyDollarIcon,
      'credit-card': CreditCardIcon,
      'card': CreditCardIcon,
      'cash': BanknotesIcon,

      // Educational
      'book': BookOpenIcon,
      'read': BookOpenIcon,
      'puzzle': PuzzlePieceIcon,
      'experiment': BeakerIcon,
      'lab': BeakerIcon,

      // Weather & Nature
      'sun': SunIcon,
      'light-mode': SunIcon,
      'moon': MoonIcon,
      'dark-mode': MoonIcon,
      'cloud': CloudIcon,

      // Gaming & Entertainment (using robot as gamepad substitute)
      'gamepad': ComputerDesktopIcon,
      'gaming': ComputerDesktopIcon,
      'robot': ComputerDesktopIcon,
    }

    // MDI to Heroicon migration mapping
    const MDI_TO_HEROICON = {
      'XMarkIcon': 'close',
      'CheckIcon': 'check',
      'mdi-alert-circle': 'alert',
      'mdi-briefcase': 'briefcase',
      'mdi-office-building': 'office',
      'mdi-magnify': 'search',
      'UserIcon': 'user',
      'TrophyIcon': 'trophy',
      'mdi-chevron-right': 'chevron-right',
      'mdi-chevron-left': 'chevron-left',
      'mdi-chevron-up': 'chevron-up',
      'mdi-chevron-down': 'chevron-down',
      'DevicePhoneMobileIcon-variant': 'gaming',
      'mdi-robot': 'robot',
      'PhoneIcon': 'phone',
      'mdi-email': 'email',
      'mdi-web': 'web',
      'LinkIconedin': 'link',
      'mdi-github': 'link',
      'CameraIcon-plus': 'camera',
      'XMarkIcon-circle-outline': 'x-circle',
      'HomeIcon': 'home',
      'mdi-cog': 'settings',
      'LightBulbIcon': 'lightbulb',
      'StarIcon': 'star',
      'HeartIcon': 'heart',
      'FireIcon': 'fire',
      'BoltIcon': 'bolt',
      'ChartBarIcon-line': 'chart-line',
      'ChartBarIcon-bar': 'chart-bar',
      'FolderIcon': 'folder',
      'DocumentIcon-document-outline': 'document-text',
      'mdi-clipboard-text-outline': 'clipboard',
      'EyeIcon': 'eye',
      'mdi-auto-fix': 'tools',
      'LinkIcon-variant': 'link',
      'CursorArrowRaysIcon': 'bullseye',
      'mdi-school': 'graduation',
      'mdi-laptop': 'laptop',
      'mdi-cellphone': 'mobile',
      'MicrophoneIcon': 'mic',
      'SpeakerWaveIcon': 'volume',
      'VideoCameraIcon': 'video',
      'mdi-television': 'video',
      'mdi-hammer-wrench': 'tools',
      'SwatchIcon': 'palette',
      'mdi-bullhorn': 'speaker',
      'UserIcon-group': 'group',
      'UserIcon-voice': 'mic',
      'QuestionMarkCircleIcon-circle-outline': 'info',
      'mdi-flask': 'experiment',
      'CameraIcon': 'camera',
      'mdi-cog-outline': 'settings',
      'mdi-map-marker': 'location',
      'PlusIcon': 'plus',
      'mdi-minus': 'minus',
      'PlayIcon': 'play',
      'PauseIcon': 'pause',
      'StopIcon': 'stop',
    }

    // Emoji/alias mapping to Heroicons (updated for modern icons)
    const EMOJI_ALIASES = {
      'DocumentIcon': 'document',
      'PhoneIcon': 'phone',
      'MapPinIcon': 'location',
      '🤖': 'robot',
      '💼': 'briefcase',
      '🎓': 'graduation',
      'BoltIcon': 'bolt',
      'EyeIcon': 'eye',
      'MagnifyingGlassIcon': 'search',
      'SparklesIcon': 'tools',
      'LinkIcon': 'link',
      '🎯': 'target',
      'LightBulbIcon': 'lightbulb',
      '📈': 'chart-line',
      'FireIcon': 'fire',
      '✓': 'check',
      'CheckIcon': 'check-circle',
      'XMarkIcon': 'x-circle',
      '🧪': 'experiment',
      'ClipboardDocumentIcon': 'clipboard',
      '📸': 'camera',
      '⚙️': 'settings',
      'SwatchIcon': 'palette',
      'QuestionMarkCircleIcon': 'info',
      'UsersIcon': 'group',
      'HomeIcon': 'home',
      '💻': 'laptop',
      'VideoCameraIcon': 'video',
      '📁': 'folder',
      '📺': 'video',
      '🎥': 'video',
      '📊': 'chart-bar',
      'StarIcon': 'star',
      'TrophyIcon': 'trophy',
      '🗣️': 'mic',
      'DevicePhoneMobileIcon': 'gaming',
      'SpeakerWaveIcon': 'volume',
      'MicrophoneIcon': 'mic',
      '🛠️': 'tools',
      '📱': 'mobile',
      '📣': 'speaker',
    }

    // Determine if the icon should use Heroicons or fallback to MDI
    const isHeroicon = computed(() => {
      const name = String(props.name || '').trim()

      // Check if it's a direct Heroicon name
      if (HEROICON_MAP[name]) return true

      // Check if it's an MDI icon that maps to Heroicon
      if (name.startsWith('mdi-') && MDI_TO_HEROICON[name]) return true

      // Check if it's an emoji that maps to Heroicon
      if (EMOJI_ALIASES[name]) return true

      return false
    })

    const resolveIconName = (name) => {
      if (!name) return null
      const n = String(name).trim()

      // Direct Heroicon name
      if (HEROICON_MAP[n]) return n

      // MDI to Heroicon mapping
      if (n.startsWith('mdi-') && MDI_TO_HEROICON[n]) {
        return MDI_TO_HEROICON[n]
      }

      // Emoji to Heroicon mapping
      if (EMOJI_ALIASES[n]) return EMOJI_ALIASES[n]

      return null
    }

    const heroiconComponent = computed(() => {
      if (!isHeroicon.value) return null

      const iconName = resolveIconName(props.name)
      if (!iconName) return null

      const component = HEROICON_MAP[iconName]
      return component || null
    })

    const heroiconClasses = computed(() => {
      const classes = []

      // Apply context-based styling
      if (props.context && props.context !== 'default') {
        classes.push(`icon-context-${props.context}`)
      }

      if (props.variant) {
        classes.push(`icon-${props.variant}`)
      }

      if (props.interactive) {
        classes.push('icon-interactive')
      }

      return classes.join(' ')
    })

    const resolveToMdi = (name) => {
      if (!name) return 'mdi-shape'
      let n = String(name).trim()
      if (n.startsWith('mdi-')) return getMdiAlias(n) || n
      // Map common emojis/symbols
      if (EMOJI_ALIASES[n]) return EMOJI_ALIASES[n]
      // Fallbacks for common ascii symbols
      if (n === 'x' || n === 'X') return 'XMarkIcon'
      if (n.toLowerCase() === 'ok') return 'CheckIcon'
      // Generic fallback icon
      return 'mdi-shape'
    }

    const resolvedMdi = computed(() => resolveToMdi(props.name))
    
    const computedSize = computed(() => {
      if (props.size !== 'default') {
        return props.size
      }
      
      // Context-based sizing
      const contextSizes = {
        'button': 'small',
        'header': 'large',
        'card': 'default',
        'list': 'small',
        'navigation': 'default',
        'achievement': 'large'
      }
      
      return contextSizes[props.context] || 'default'
    })
    
    const computedStyle = computed(() => {
      const styles = {}
      
      // Handle sizing
      const size = computedSize.value
      const sizeMap = {
        'x-small': '16px',
        'small': '20px',
        'default': '24px',
        'large': '32px',
        'x-large': '40px'
      }
      
      if (size === 'inherit') {
        // Defer sizing to CSS; avoid inline styles
      } else if (sizeMap[size]) {
        styles.fontSize = sizeMap[size]
        styles.width = sizeMap[size]
        styles.height = sizeMap[size]
      } else if (!isNaN(size)) {
        styles.fontSize = `${size}px`
        styles.width = `${size}px`
        styles.height = `${size}px`
      }
      
      // Handle coloring (theme-aware via CSS vars)
      const themeColors = {
        'achievement': 'var(--color-warning-500)',
        'gaming': 'var(--color-primary-500)',
        'success': 'var(--color-success-500)',
        'warning': 'var(--color-warning-500)',
        'error': 'var(--color-danger-500)',
        'info': 'var(--color-info-500)'
      }

      if (props.color) {
        styles.color = themeColors[props.color] || props.color
      } else if (props.context && themeColors[props.context]) {
        styles.color = themeColors[props.context]
      }
      
      return styles
    })
    
    const computedClasses = computed(() => {
      const classes = []
      
      if (props.variant) {
        classes.push(`icon-${props.variant}`)
      }
      
      if (props.interactive) {
        classes.push('icon-interactive')
      }
      
      if (props.context && props.context !== 'default') {
        classes.push(`icon-context-${props.context}`)
      }
      
      return classes.join(' ')
    })
    
    const rootClasses = computed(() => ['mui-icon', computedClasses.value].filter(Boolean).join(' '))
    
    return {
      resolvedMdi,
      computedSize,
      computedStyle,
      computedClasses,
      rootClasses,
      isHeroicon,
      heroiconComponent,
      heroiconClasses
    }
  }
}
</script>

<style scoped>
.mui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  fill: currentColor;
}

.icon-interactive {
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-interactive:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.icon-context-achievement { filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-warning-500) 40%, transparent)); }
.icon-context-gaming { filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-primary-500) 40%, transparent)); }
.icon-context-success { filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-success-500) 40%, transparent)); }

.icon-context-warning {
  filter: drop-shadow(0 0 4px rgba(255, 152, 0, 0.4));
}

.icon-context-error {
  filter: drop-shadow(0 0 4px rgba(244, 67, 54, 0.4));
}

.icon-context-info {
  filter: drop-shadow(0 0 4px rgba(33, 150, 243, 0.4));
}

.icon-outlined {
  stroke-width: 2;
  fill: none;
  stroke: currentColor;
}

.icon-rounded {
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.12);
  padding: 4px;
}

.icon-filled {
  fill: currentColor;
}

.icon-sharp svg {
  border-radius: 0;
}

.icon-two-tone svg {
  opacity: 0.6;
}

/* Animation effects */
@keyframes icon-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.icon-context-achievement:hover {
  animation: icon-pulse 0.6s ease-in-out;
}

.icon-context-gaming:hover {
  animation: icon-pulse 0.6s ease-in-out;
}
</style>
