<template>
  <span :class="[rootClasses, $attrs.class]" :style="[computedStyle, $attrs.style]" v-bind="$attrs">
    <i :class="['mdi', resolvedMdi]" aria-hidden="true"></i>
  </span>
</template>

<script>
import { computed } from 'vue'
import { getMdiAlias } from '@/utils/iconAliases'

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
    // Emoji/alias mapping to MDI icons
    const EMOJI_ALIASES = {
      '📄': 'mdi-file-document-outline',
      '📞': 'mdi-phone',
      '📍': 'mdi-map-marker',
      '🤖': 'mdi-robot',
      '💼': 'mdi-briefcase',
      '🎓': 'mdi-school',
      '⚡': 'mdi-flash',
      '👁️': 'mdi-eye',
      '🔍': 'mdi-magnify',
      '✨': 'mdi-auto-fix',
      '🔗': 'mdi-link-variant',
      '🎯': 'mdi-target',
      '💡': 'mdi-lightbulb',
      '📈': 'mdi-chart-line',
      '🔥': 'mdi-fire',
      '✓': 'mdi-check',
      '✅': 'mdi-check-circle-outline',
      '❌': 'mdi-close-circle-outline',
      '🧪': 'mdi-flask',
      '📋': 'mdi-clipboard-text-outline',
      '📸': 'mdi-camera',
      '⚙️': 'mdi-cog-outline',
      '🎨': 'mdi-palette',
      '❓': 'mdi-help-circle-outline',
      '👥': 'mdi-account-group',
      '🏠': 'mdi-home',
      '💻': 'mdi-laptop',
      '📹': 'mdi-video',
      '📁': 'mdi-folder',
      '📺': 'mdi-television',
      '🎥': 'mdi-video',
      '📊': 'mdi-chart-bar',
      '⭐': 'mdi-star',
      '🏆': 'mdi-trophy',
      '🗣️': 'mdi-account-voice',
      '🎮': 'mdi-gamepad-variant',
      '🔊': 'mdi-volume-high',
      '🎤': 'mdi-microphone',
      '🛠️': 'mdi-hammer-wrench',
      '📱': 'mdi-cellphone',
      '📣': 'mdi-bullhorn',
    }

    const resolveToMdi = (name) => {
      if (!name) return 'mdi-shape'
      let n = String(name).trim()
      if (n.startsWith('mdi-')) return getMdiAlias(n) || n
      // Map common emojis/symbols
      if (EMOJI_ALIASES[n]) return EMOJI_ALIASES[n]
      // Fallbacks for common ascii symbols
      if (n === 'x' || n === 'X') return 'mdi-close'
      if (n.toLowerCase() === 'ok') return 'mdi-check'
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
      rootClasses
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
