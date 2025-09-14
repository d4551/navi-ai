import { computed } from 'vue'
import { getIconForEmoji, createIconComponent, hasReplaceableEmojis } from '@/utils/iconMapping'

/**
 * Vue composable for handling emoji to icon conversion
 */
export function useIconReplacement() {
  
  /**
   * Convert emoji to Material Design Icon
   * @param {string} emoji - Emoji to convert
   * @param {string} fallback - Fallback icon
   * @returns {string} MDI icon name
   */
  const getIcon = (emoji, fallback = 'mdi-help-circle') => {
    return getIconForEmoji(emoji, fallback)
  }

  /**
   * Create reactive icon component props
   * @param {import('vue').Ref<string>} emojiRef - Reactive emoji reference
   * @param {Object} options - Icon options
   * @returns {import('vue').ComputedRef} Reactive icon props
   */
  const createReactiveIcon = (emojiRef, options = {}) => {
    return computed(() => createIconComponent(emojiRef.value, options))
  }

  /**
   * Replace emojis in reactive text
   * @param {import('vue').Ref<string>} textRef - Reactive text reference
   * @returns {import('vue').ComputedRef} Text with replaced emojis
   */
  const replaceEmojisReactive = (textRef) => {
    return computed(() => {
      if (!textRef.value) return ''
      
      let result = textRef.value
      
      // Replace common emojis with icon components
      result = result.replace(/🎮/g, '<v-icon>mdi-gamepad-variant</v-icon>')
      result = result.replace(/🎯/g, '<v-icon>mdi-target</v-icon>')
      result = result.replace(/🏆/g, '<v-icon>mdi-trophy</v-icon>')
      result = result.replace(/📊/g, '<v-icon>mdi-chart-line</v-icon>')
      result = result.replace(/⭐/g, '<v-icon>mdi-star</v-icon>')
      result = result.replace(/🚀/g, '<v-icon>mdi-rocket</v-icon>')
      result = result.replace(/💼/g, '<v-icon>mdi-briefcase</v-icon>')
      result = result.replace(/📝/g, '<v-icon>mdi-file-document-outline-edit</v-icon>')
      result = result.replace(/🎨/g, '<v-icon>mdi-palette</v-icon>')
      result = result.replace(/🔧/g, '<v-icon>mdi-wrench</v-icon>')
      result = result.replace(/⚙️/g, '<v-icon>mdi-cog</v-icon>')
      result = result.replace(/📱/g, '<v-icon>mdi-cellphone</v-icon>')
      result = result.replace(/💻/g, '<v-icon>mdi-laptop</v-icon>')
      result = result.replace(/✨/g, '<v-icon>mdi-shimmer</v-icon>')
      result = result.replace(/🎉/g, '<v-icon>mdi-party-popper</v-icon>')
      result = result.replace(/💡/g, '<v-icon>mdi-lightbulb</v-icon>')
      result = result.replace(/⚡/g, '<v-icon>mdi-lightning-bolt</v-icon>')
      result = result.replace(/🔥/g, '<v-icon>mdi-fire</v-icon>')
      result = result.replace(/🎤/g, '<v-icon>mdi-microphone</v-icon>')
      result = result.replace(/🔊/g, '<v-icon>mdi-volume-high</v-icon>')
      result = result.replace(/📞/g, '<v-icon>mdi-phone</v-icon>')
      result = result.replace(/💬/g, '<v-icon>mdi-chat</v-icon>')
      result = result.replace(/📸/g, '<v-icon>mdi-camera</v-icon>')
      result = result.replace(/🎥/g, '<v-icon>mdi-video</v-icon>')
      result = result.replace(/👤/g, '<v-icon>mdi-account</v-icon>')
      result = result.replace(/👥/g, '<v-icon>mdi-account-group</v-icon>')
      result = result.replace(/✅/g, '<v-icon>mdi-check-circle-outline</v-icon>')
      result = result.replace(/❌/g, '<v-icon>mdi-close-circle-outline</v-icon>')
      result = result.replace(/✓/g, '<v-icon>mdi-check</v-icon>')
      result = result.replace(/🔒/g, '<v-icon>mdi-lock</v-icon>')
      result = result.replace(/🔍/g, '<v-icon>mdi-magnify</v-icon>')
      result = result.replace(/🤖/g, '<v-icon>mdi-robot</v-icon>')
      result = result.replace(/🌙/g, '<v-icon>mdi-weather-night</v-icon>')
      result = result.replace(/☀️/g, '<v-icon>mdi-weather-sunny</v-icon>')
      result = result.replace(/🐛/g, '<v-icon>mdi-bug</v-icon>')
      result = result.replace(/📖/g, '<v-icon>mdi-book</v-icon>')
      result = result.replace(/📄/g, '<v-icon>mdi-file-document-outline</v-icon>')
      result = result.replace(/📁/g, '<v-icon>mdi-folder</v-icon>')
      result = result.replace(/📋/g, '<v-icon>mdi-clipboard-text</v-icon>')
      result = result.replace(/🧪/g, '<v-icon>mdi-test-tube</v-icon>')
      
      return result
    })
  }

  /**
   * Check if text contains replaceable emojis
   * @param {string} text - Text to check
   * @returns {boolean} True if contains emojis
   */
  const containsEmojis = (text) => {
    return hasReplaceableEmojis(text)
  }

  /**
   * Get icon size class based on context
   * @param {string} context - Usage context (small, medium, large, etc.)
   * @returns {string} Icon size
   */
  const getIconSize = (context = 'default') => {
    const sizeMap = {
      'small': 'small',
      'medium': 'default', 
      'large': 'large',
      'x-large': 'x-large',
      'button': 'small',
      'header': 'large',
      'card': 'default',
      'list': 'small'
    }
    
    return sizeMap[context] || 'default'
  }

  /**
   * Get icon color based on context
   * @param {string} context - Usage context
   * @returns {string} Icon color
   */
  const getIconColor = (context = 'default') => {
    const colorMap = {
      'primary': 'primary',
      'secondary': 'secondary',
      'success': 'success',
      'warning': 'warning',
      'error': 'error',
      'info': 'info',
      'muted': 'grey',
      'gaming': 'purple',
      'achievement': 'amber'
    }
    
    return colorMap[context] || undefined
  }

  return {
    getIcon,
    createReactiveIcon,
    replaceEmojisReactive,
    containsEmojis,
    getIconSize,
    getIconColor
  }
}

export default useIconReplacement
