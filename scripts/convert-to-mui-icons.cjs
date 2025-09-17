#!/usr/bin/env node

/**
 * Script to convert all MDI icons to MUI icons using the AppIcon component
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Mapping of MDI classes to AppIcon names
const MDI_TO_ICON_NAME = {
  'mdi-gamepad-variant': '🎮',
  'mdi-target': '🎯',
  'mdi-trophy': '🏆',
  'mdi-chart-line': '📊',
  'mdi-diamond-stone': '💎',
  'mdi-star': '⭐',
  'mdi-rocket': '🚀',
  'mdi-briefcase': '💼',
  'mdi-file-document-edit': '📝',
  'mdi-palette': '🎨',
  'mdi-wrench': '🔧',
  'mdi-cog': '⚙️',
  'mdi-cellphone': '📱',
  'mdi-laptop': '💻',
  'mdi-star-outline': '🌟',
  'mdi-shimmer': '✨',
  'mdi-party-popper': '🎉',
  'mdi-lightbulb': '💡',
  'mdi-lightning-bolt': '⚡',
  'mdi-fire': '🔥',
  'mdi-microphone': '🎤',
  'mdi-volume-high': '🔊',
  'mdi-phone': '📞',
  'mdi-chat': '💬',
  'mdi-camera': '📸',
  'mdi-video': '🎥',
  'mdi-video-box': '📹',
  'mdi-television': '📺',
  'mdi-account-voice': '🗣️',
  'mdi-thought-bubble': '💭',
  'mdi-file-document': '📄',
  'mdi-folder': '📁',
  'mdi-clipboard-text': '📋',
  'mdi-book': '📖',
  'mdi-map-marker': '📍',
  'mdi-account': '👤',
  'mdi-account-group': '👥',
  'mdi-account-edit': '👩‍💻',
  'mdi-wizard-hat': '🧙‍♂️',
  'mdi-face-woman-shimmer': '🧚‍♀️',
  'mdi-check-circle': '✅',
  'mdi-close-circle': '❌',
  'mdi-check': '✓',
  'mdi-lock': '🔒',
  'mdi-magnify': '🔍',
  'mdi-robot': '🤖',
  'mdi-weather-night': '🌙',
  'mdi-weather-sunny': '☀️',
  'mdi-tent': '🎪',
  'mdi-drama-masks': '🎭',
  'mdi-dice-6': '🎲',
  'mdi-cards-playing-outline': '🃏',
  'mdi-dog-service': '🐕‍🦺',
  'mdi-rabbit': '🐰',
  'mdi-pirate': '🏴‍☠️',
  'mdi-octopus': '🐙',
  'mdi-motorbike': '🏍️',
  'mdi-car-emergency': '🚔',
  'mdi-home': '🏠',
  'mdi-medal': '🏅',
  'mdi-trending-up': '📈',
  'mdi-trending-down': '📉',
  'mdi-cash': '💰',
  'mdi-cash-minus': '💸',
  'mdi-balloon': '🎈',
  'mdi-gift': '🎁',
  'mdi-bug': '🐛',
  'mdi-test-tube': '🧪',
  'mdi-egg-easter': '🥚',
  'mdi-cup': '🥤',
  // Additional common icons
  'mdi-briefcase-search': '💼',
  'mdi-eye-outline': '👁️',
  'mdi-wand': '🪄',
  'mdi-open-in-new': '🔗',
  'mdi-file-pdf-box': '📄',
  'mdi-language-html5': '🌐',
  'mdi-content-copy': '📋',
  'mdi-file-document-outline': '📄',
  'mdi-lightbulb-outline': '💡',
  'mdi-email-outline': '📧',
  'mdi-settings': '⚙️',
  'mdi-help-circle': '❓',
  'mdi-close': '❌',
  'mdi-menu': '☰',
}

function convertFileContent(content, filePath) {
  let updatedContent = content
  let hasChanges = false
  let needsImport = false

  // Pattern 1: <i class="mdi mdi-iconname"></i> -> <AppIcon name="emoji" />
  updatedContent = updatedContent.replace(
    /<i\s+class="mdi\s+(mdi-[^"]+)"[^>]*><\/i>/g,
    (match, iconClass) => {
      const emoji = MDI_TO_ICON_NAME[iconClass]
      if (emoji) {
        hasChanges = true
        needsImport = true
        return `<AppIcon name="${emoji}" />`
      }
      return match
    }
  )

  // Pattern 2: <i class="mdi mdi-iconname [other classes]" [attributes]></i>
  updatedContent = updatedContent.replace(
    /<i\s+class="([^"]*\bmdi\s+(mdi-[a-z-]+)[^"]*)"([^>]*?)><\/i>/g,
    (match, fullClass, iconClass, attributes) => {
      const emoji = MDI_TO_ICON_NAME[iconClass]
      if (emoji) {
        hasChanges = true
        needsImport = true

        // Extract size, color, and other relevant attributes
        const sizeMatch = fullClass.match(/icon-(xs|sm|md|lg|xl)/)
        const colorMatch = fullClass.match(
          /text-(primary|secondary|success|warning|error|info)/
        )

        let props = [`name="${emoji}"`]

        if (sizeMatch) {
          const sizeMap = {
            xs: 'x-small',
            sm: 'small',
            md: 'default',
            lg: 'large',
            xl: 'x-large',
          }
          props.push(`size="${sizeMap[sizeMatch[1]] || 'default'}"`)
        }

        if (colorMatch) {
          props.push(`color="${colorMatch[1]}"`)
        }

        // Keep other attributes
        if (attributes.trim()) {
          props.push(attributes.trim())
        }

        return `<AppIcon ${props.join(' ')} />`
      }
      return match
    }
  )

  // Pattern 3: v-icon with mdi- in content
  updatedContent = updatedContent.replace(
    /<v-icon([^>]*)>\s*(mdi-[a-z-]+)\s*<\/v-icon>/g,
    (match, attributes, iconClass) => {
      const emoji = MDI_TO_ICON_NAME[iconClass]
      if (emoji) {
        hasChanges = true
        needsImport = true
        return `<AppIcon name="${emoji}"${attributes} />`
      }
      return match
    }
  )

  // Add import statement if needed
  if (needsImport && !content.includes('AppIcon')) {
    // Find the script tag and add import
    const scriptMatch = updatedContent.match(/<script[^>]*>/)
    if (scriptMatch) {
      const existingImports = updatedContent.match(
        /import\s+.*from\s+['"][^'"]*['"]/
      )
      if (existingImports) {
        // Add after existing imports
        const lastImportIndex = updatedContent.lastIndexOf('import')
        const lineEnd = updatedContent.indexOf('\\n', lastImportIndex)
        updatedContent =
          updatedContent.slice(0, lineEnd) +
          "\\nimport AppIcon from '@/components/ui/AppIcon.vue'" +
          updatedContent.slice(lineEnd)
      } else {
        // Add after script tag
        const scriptEndIndex = scriptMatch.index + scriptMatch[0].length
        updatedContent =
          updatedContent.slice(0, scriptEndIndex) +
          "\\nimport AppIcon from '@/components/ui/AppIcon.vue'\\n" +
          updatedContent.slice(scriptEndIndex)
      }

      // Add to components section
      if (updatedContent.includes('components: {')) {
        updatedContent = updatedContent.replace(
          /components:\s*{([^}]*)}/,
          (match, components) => {
            if (!components.includes('AppIcon')) {
              return `components: {${components.trim() ? components + ',' : ''}\\n    AppIcon\\n  }`
            }
            return match
          }
        )
      } else if (updatedContent.includes('export default {')) {
        updatedContent = updatedContent.replace(
          'export default {',
          'export default {\\n  components: {\\n    AppIcon\\n  },'
        )
      }
    }
  }

  return { content: updatedContent, hasChanges }
}

async function convertFiles() {
  console.log('🔄 Converting MDI icons to MUI icons via AppIcon component...')

  const vueFiles = await glob('src/**/*.vue', {
    ignore: ['node_modules/**', 'dist/**'],
  })

  let totalFiles = 0
  let modifiedFiles = 0

  for (const file of vueFiles) {
    totalFiles++
    const filePath = path.resolve(file)
    const originalContent = fs.readFileSync(filePath, 'utf8')

    const { content: newContent, hasChanges } = convertFileContent(
      originalContent,
      filePath
    )

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent)
      modifiedFiles++
      console.log(`✅ Updated ${file}`)
    }
  }

  console.log(`\\n📊 Conversion complete!`)
  console.log(`📁 Total files scanned: ${totalFiles}`)
  console.log(`✏️  Files modified: ${modifiedFiles}`)

  if (modifiedFiles > 0) {
    console.log('\\n🚀 Next steps:')
    console.log('1. Review the changes')
    console.log('2. Test the application')
    console.log('3. Run npm run build to ensure everything works')
  }
}

// Run the conversion
convertFiles().catch(console.error)
