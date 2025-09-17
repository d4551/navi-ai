/**
 * Emoji to Material Design Icon mapping utility
 * This provides consistent icon replacement throughout the application
 */

export const EMOJI_TO_ICON_MAP = {
  // Gaming & Career
  '🎮': 'mdi-gamepad-variant',
  '🎯': 'mdi-target',
  '🏆': 'mdi-trophy',
  '📊': 'mdi-chart-line',
  '💎': 'mdi-diamond-stone',
  '⭐': 'mdi-star',
  '🚀': 'mdi-rocket',
  '💼': 'mdi-briefcase',
  '📝': 'mdi-file-document-edit-outline',
  '🎨': 'mdi-palette',

  // Technical & System
  '🔧': 'mdi-wrench',
  '⚙️': 'mdi-cog',
  '📱': 'mdi-cellphone',
  '💻': 'mdi-laptop',
  '🌟': 'mdi-star-outline',
  '✨': 'mdi-shimmer',
  '🎉': 'mdi-party-popper',
  '💡': 'mdi-lightbulb',
  '⚡': 'mdi-lightning-bolt',
  '🌈': 'mdi-palette',
  '🔥': 'mdi-fire',

  // Communication & Media
  '🎤': 'mdi-microphone',
  '🔊': 'mdi-volume-high',
  '📞': 'mdi-phone',
  '💬': 'mdi-chat',
  '📸': 'mdi-camera',
  '🎥': 'mdi-video',
  '📹': 'mdi-video-box',
  '📺': 'mdi-television',
  '🗣️': 'mdi-account-voice',
  '💭': 'mdi-thought-bubble',

  // Files & Documents
  '📄': 'mdi-file-document-outline',
  '📁': 'mdi-folder',
  '📋': 'mdi-clipboard-text',
  '📖': 'mdi-book',
  '📍': 'mdi-map-marker',

  // People & Users
  '👤': 'mdi-account',
  '👥': 'mdi-account-group',
  '👩‍💻': 'mdi-account-edit',
  '👨‍💻': 'mdi-account-edit',
  '🧙‍♂️': 'mdi-wizard-hat',
  '🧚‍♀️': 'mdi-face-woman-shimmer',

  // Status & Actions
  '✅': 'mdi-check-circle-outline',
  '❌': 'mdi-close-circle-outline',
  '✓': 'mdi-check',
  '🔒': 'mdi-lock',
  '🔍': 'mdi-magnify',
  '🤖': 'mdi-robot',

  // Theme & UI
  '🌙': 'mdi-weather-night',
  '☀️': 'mdi-weather-sunny',
  '🎪': 'mdi-tent',
  '🎭': 'mdi-drama-masks',
  '🎲': 'mdi-dice-6',
  '🃏': 'mdi-cards-playing-outline',

  // Gaming Specific
  '🐕‍🦺': 'mdi-dog-service', // Sam
  '🐰': 'mdi-rabbit', // Max
  '🏴‍☠️': 'mdi-pirate',
  '🐙': 'mdi-octopus',
  '🏍️': 'mdi-motorbike',
  '🚔': 'mdi-car-emergency',
  '🏠': 'mdi-home',

  // Achievements & Progress
  '🏅': 'mdi-medal',
  '📈': 'mdi-trending-up',
  '📉': 'mdi-trending-down',
  '💰': 'mdi-cash',
  '💸': 'mdi-cash-minus',
  '🎈': 'mdi-balloon',
  '🎁': 'mdi-gift',

  // Bugs & Development
  '🐛': 'mdi-bug',
  '🧪': 'mdi-test-tube',

  // Easter Eggs
  '🥚': 'mdi-egg-easter',
  '🥤': 'mdi-cup',
}

/**
 * Get Material Design Icon for emoji
 * @param {string} emoji - The emoji to convert
 * @param {string} fallback - Fallback icon if emoji not found
 * @returns {string} Material Design Icon name
 */
export function getIconForEmoji(emoji, fallback = 'mdi-help-circle') {
  return EMOJI_TO_ICON_MAP[emoji] || fallback
}

/**
 * Replace emoji with v-icon component
 * @param {string} emoji - The emoji to replace
 * @param {Object} options - Additional options
 * @returns {Object} Vue component props
 */
export function createIconComponent(emoji, options = {}) {
  const {
    size = 'default',
    color = 'default',
    fallback = 'mdi-help-circle',
  } = options

  return {
    icon: getIconForEmoji(emoji, fallback),
    size,
    color,
  }
}

/**
 * Batch replace emojis in text with icon names
 * @param {string} text - Text containing emojis
 * @returns {string} Text with emojis replaced by icon names
 */
export function replaceEmojisInText(text) {
  let result = text

  Object.entries(EMOJI_TO_ICON_MAP).forEach(([emoji, icon]) => {
    const regex = new RegExp(emoji, 'g')
    result = result.replace(regex, `[${icon}]`)
  })

  return result
}

/**
 * Check if a string contains emojis that can be replaced
 * @param {string} text - Text to check
 * @returns {boolean} True if contains replaceable emojis
 */
export function hasReplaceableEmojis(text) {
  return Object.keys(EMOJI_TO_ICON_MAP).some(emoji => text.includes(emoji))
}

/**
 * Get all emojis used in text
 * @param {string} text - Text to analyze
 * @returns {Array} Array of emojis found
 */
export function extractEmojis(text) {
  return Object.keys(EMOJI_TO_ICON_MAP).filter(emoji => text.includes(emoji))
}

export default {
  EMOJI_TO_ICON_MAP,
  getIconForEmoji,
  createIconComponent,
  replaceEmojisInText,
  hasReplaceableEmojis,
  extractEmojis,
}
