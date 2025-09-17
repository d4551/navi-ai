#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mapping of emojis and common text to Heroicons
const EMOJI_TO_HEROICON_MAPPINGS = {
  // Gaming and entertainment
  '🎮': { name: 'DevicePhoneMobileIcon', type: 'outline', alt: 'gaming' },
  '🎯': { name: 'TargetIcon', type: 'outline', alt: 'target' },
  '🏆': { name: 'TrophyIcon', type: 'solid', alt: 'trophy' },
  '⚡': { name: 'BoltIcon', type: 'solid', alt: 'energy' },
  '🚀': { name: 'RocketLaunchIcon', type: 'outline', alt: 'launch' },
  '⭐': { name: 'StarIcon', type: 'solid', alt: 'star' },
  '✨': { name: 'SparklesIcon', type: 'outline', alt: 'sparkles' },
  '🎨': { name: 'PaintBrushIcon', type: 'outline', alt: 'art' },
  '🎪': {
    name: 'BuildingStorefrontIcon',
    type: 'outline',
    alt: 'entertainment',
  },
  '🌟': { name: 'StarIcon', type: 'solid', alt: 'featured' },
  '🔥': { name: 'FireIcon', type: 'solid', alt: 'hot' },
  '💎': { name: 'GemIcon', type: 'solid', alt: 'premium' },
  '🎊': { name: 'SparklesIcon', type: 'outline', alt: 'celebration' },
  '🎈': { name: 'GiftIcon', type: 'outline', alt: 'party' },
  '🎁': { name: 'GiftIcon', type: 'solid', alt: 'gift' },

  // Technology and work
  '💻': { name: 'ComputerDesktopIcon', type: 'outline', alt: 'computer' },
  '📱': { name: 'DevicePhoneMobileIcon', type: 'outline', alt: 'mobile' },
  '⚙️': { name: 'CogIcon', type: 'outline', alt: 'settings' },
  '🔧': { name: 'WrenchScrewdriverIcon', type: 'outline', alt: 'tools' },
  '🔨': { name: 'WrenchScrewdriverIcon', type: 'outline', alt: 'build' },
  '💡': { name: 'LightBulbIcon', type: 'outline', alt: 'idea' },
  '🔮': { name: 'GlobeAltIcon', type: 'outline', alt: 'future' },
  '📊': { name: 'ChartBarIcon', type: 'outline', alt: 'analytics' },
  '📈': { name: 'ArrowTrendingUpIcon', type: 'outline', alt: 'growth' },
  '📉': { name: 'ArrowTrendingDownIcon', type: 'outline', alt: 'decline' },

  // Communication and social
  '💬': { name: 'ChatBubbleLeftRightIcon', type: 'outline', alt: 'chat' },
  '💭': { name: 'ChatBubbleOvalLeftIcon', type: 'outline', alt: 'thought' },
  '📧': { name: 'EnvelopeIcon', type: 'outline', alt: 'email' },
  '📞': { name: 'PhoneIcon', type: 'outline', alt: 'phone' },
  '🔔': { name: 'BellIcon', type: 'outline', alt: 'notification' },
  '🔕': { name: 'BellSlashIcon', type: 'outline', alt: 'muted' },

  // Navigation and actions
  '➡️': { name: 'ArrowRightIcon', type: 'outline', alt: 'next' },
  '⬅️': { name: 'ArrowLeftIcon', type: 'outline', alt: 'back' },
  '⬆️': { name: 'ArrowUpIcon', type: 'outline', alt: 'up' },
  '⬇️': { name: 'ArrowDownIcon', type: 'outline', alt: 'down' },
  '✅': { name: 'CheckIcon', type: 'solid', alt: 'success' },
  '❌': { name: 'XMarkIcon', type: 'solid', alt: 'error' },
  '⚠️': { name: 'ExclamationTriangleIcon', type: 'solid', alt: 'warning' },
  ℹ️: { name: 'InformationCircleIcon', type: 'outline', alt: 'info' },
  '❓': { name: 'QuestionMarkCircleIcon', type: 'outline', alt: 'question' },
  '❗': { name: 'ExclamationCircleIcon', type: 'solid', alt: 'important' },

  // Files and documents
  '📄': { name: 'DocumentIcon', type: 'outline', alt: 'document' },
  '📁': { name: 'FolderIcon', type: 'outline', alt: 'folder' },
  '📋': { name: 'ClipboardIcon', type: 'outline', alt: 'clipboard' },
  '📝': { name: 'PencilIcon', type: 'outline', alt: 'edit' },
  '🗂️': { name: 'ArchiveBoxIcon', type: 'outline', alt: 'archive' },

  // User and people
  '👤': { name: 'UserIcon', type: 'outline', alt: 'user' },
  '👥': { name: 'UsersIcon', type: 'outline', alt: 'users' },
  '👑': { name: 'CrownIcon', type: 'solid', alt: 'crown' },

  // Time and calendar
  '⏰': { name: 'ClockIcon', type: 'outline', alt: 'time' },
  '📅': { name: 'CalendarIcon', type: 'outline', alt: 'calendar' },
  '⏳': { name: 'ClockIcon', type: 'outline', alt: 'waiting' },

  // Security and privacy
  '🔒': { name: 'LockClosedIcon', type: 'outline', alt: 'locked' },
  '🔓': { name: 'LockOpenIcon', type: 'outline', alt: 'unlocked' },
  '🔑': { name: 'KeyIcon', type: 'outline', alt: 'key' },
  '👁️': { name: 'EyeIcon', type: 'outline', alt: 'view' },
  '🙈': { name: 'EyeSlashIcon', type: 'outline', alt: 'hidden' },

  // Money and business
  '💰': { name: 'CurrencyDollarIcon', type: 'outline', alt: 'money' },
  '💳': { name: 'CreditCardIcon', type: 'outline', alt: 'payment' },
  '📈': { name: 'ArrowTrendingUpIcon', type: 'outline', alt: 'profit' },
  '🏢': { name: 'BuildingOfficeIcon', type: 'outline', alt: 'company' },

  // Common text patterns to icons
  Settings: { name: 'CogIcon', type: 'outline', alt: 'settings' },
  Profile: { name: 'UserIcon', type: 'outline', alt: 'profile' },
  Dashboard: { name: 'HomeIcon', type: 'outline', alt: 'dashboard' },
  Search: { name: 'MagnifyingGlassIcon', type: 'outline', alt: 'search' },
  Filter: { name: 'FunnelIcon', type: 'outline', alt: 'filter' },
  Sort: { name: 'BarsArrowUpIcon', type: 'outline', alt: 'sort' },
  Download: { name: 'ArrowDownTrayIcon', type: 'outline', alt: 'download' },
  Upload: { name: 'ArrowUpTrayIcon', type: 'outline', alt: 'upload' },
  Edit: { name: 'PencilIcon', type: 'outline', alt: 'edit' },
  Delete: { name: 'TrashIcon', type: 'outline', alt: 'delete' },
  Add: { name: 'PlusIcon', type: 'outline', alt: 'add' },
  Remove: { name: 'MinusIcon', type: 'outline', alt: 'remove' },
  Close: { name: 'XMarkIcon', type: 'outline', alt: 'close' },
  Menu: { name: 'Bars3Icon', type: 'outline', alt: 'menu' },
  Home: { name: 'HomeIcon', type: 'outline', alt: 'home' },
  Back: { name: 'ArrowLeftIcon', type: 'outline', alt: 'back' },
  Next: { name: 'ArrowRightIcon', type: 'outline', alt: 'next' },
  Previous: { name: 'ArrowLeftIcon', type: 'outline', alt: 'previous' },
  Save: { name: 'CheckIcon', type: 'outline', alt: 'save' },
  Cancel: { name: 'XMarkIcon', type: 'outline', alt: 'cancel' },
  Submit: { name: 'PaperAirplaneIcon', type: 'outline', alt: 'submit' },
  Send: { name: 'PaperAirplaneIcon', type: 'outline', alt: 'send' },
  Copy: { name: 'DocumentDuplicateIcon', type: 'outline', alt: 'copy' },
  Share: { name: 'ShareIcon', type: 'outline', alt: 'share' },
  Print: { name: 'PrinterIcon', type: 'outline', alt: 'print' },
  Refresh: { name: 'ArrowPathIcon', type: 'outline', alt: 'refresh' },
  Reload: { name: 'ArrowPathIcon', type: 'outline', alt: 'reload' },
  Sync: { name: 'ArrowPathIcon', type: 'outline', alt: 'sync' },
  Logout: { name: 'ArrowRightOnRectangleIcon', type: 'outline', alt: 'logout' },
  Login: { name: 'ArrowLeftOnRectangleIcon', type: 'outline', alt: 'login' },
  Help: { name: 'QuestionMarkCircleIcon', type: 'outline', alt: 'help' },
  Info: { name: 'InformationCircleIcon', type: 'outline', alt: 'info' },
  Warning: { name: 'ExclamationTriangleIcon', type: 'outline', alt: 'warning' },
  Error: { name: 'ExclamationCircleIcon', type: 'outline', alt: 'error' },
  Success: { name: 'CheckCircleIcon', type: 'solid', alt: 'success' },
}

class EmojiToHeroiconsMigrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
    this.backupDir = options.backupDir || 'backups'
    this.projectRoot = options.projectRoot || process.cwd()
    this.changes = []
    this.importedIcons = new Set()
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️'
      console.log(`${prefix} ${message}`)
    }
  }

  async findVueFiles() {
    const patterns = ['src/**/*.vue', 'src/**/*.jsx', 'src/**/*.tsx']

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

    const backupDir = path.dirname(backupPath)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    fs.copyFileSync(filePath, backupPath)
    this.log(`Backup created: ${backupPath}`)
  }

  generateIconComponent(iconConfig, props = '') {
    const { name, type, alt } = iconConfig
    this.importedIcons.add({ name, type })

    const sizeClasses = props.includes('class=') ? '' : ' class="w-5 h-5"'
    return `<${name}${sizeClasses}${props ? ' ' + props : ''} aria-label="${alt}" />`
  }

  migrateContent(content) {
    let modifiedContent = content
    let hasChanges = false
    const fileIcons = new Set()

    // Replace emojis in text content and attributes
    for (const [emoji, iconConfig] of Object.entries(
      EMOJI_TO_HEROICON_MAPPINGS
    )) {
      const emojiRegex = new RegExp(
        emoji.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&'),
        'g'
      )

      if (emojiRegex.test(modifiedContent)) {
        const iconComponent = this.generateIconComponent(iconConfig)
        modifiedContent = modifiedContent.replace(emojiRegex, iconComponent)
        fileIcons.add(iconConfig)
        hasChanges = true

        this.changes.push({
          type: 'emoji',
          original: emoji,
          replacement: iconComponent,
        })
      }
    }

    // Replace text patterns (more selective)
    for (const [text, iconConfig] of Object.entries(
      EMOJI_TO_HEROICON_MAPPINGS
    )) {
      if (text.length < 3) continue // Skip short patterns

      // Only replace standalone text, not parts of words
      const textRegex = new RegExp(`\\b${text}\\b(?=\\s*</)`, 'g')

      if (textRegex.test(modifiedContent)) {
        const iconComponent = this.generateIconComponent(iconConfig)
        modifiedContent = modifiedContent.replace(textRegex, iconComponent)
        fileIcons.add(iconConfig)
        hasChanges = true

        this.changes.push({
          type: 'text',
          original: text,
          replacement: iconComponent,
        })
      }
    }

    return { modifiedContent, hasChanges, fileIcons }
  }

  generateImports(fileIcons) {
    const outlineIcons = []
    const solidIcons = []

    for (const icon of fileIcons) {
      if (icon.type === 'outline') {
        outlineIcons.push(icon.name)
      } else {
        solidIcons.push(icon.name)
      }
    }

    let imports = ''
    if (outlineIcons.length > 0) {
      imports += `import { ${outlineIcons.join(', ')} } from '@heroicons/vue/24/outline';\n`
    }
    if (solidIcons.length > 0) {
      imports += `import { ${solidIcons.join(', ')} } from '@heroicons/vue/24/solid';\n`
    }

    return imports
  }

  addImportsToVueFile(content, imports) {
    if (!imports) return content

    // Find the script setup section or regular script section
    const scriptSetupMatch = content.match(/<script setup[^>]*>/)
    const scriptMatch = content.match(/<script[^>]*>/)

    if (scriptSetupMatch) {
      // Add imports right after <script setup>
      const insertIndex = scriptSetupMatch.index + scriptSetupMatch[0].length
      return (
        content.slice(0, insertIndex) +
        '\n' +
        imports +
        content.slice(insertIndex)
      )
    } else if (scriptMatch) {
      // Add imports at the beginning of the script section
      const insertIndex = scriptMatch.index + scriptMatch[0].length
      return (
        content.slice(0, insertIndex) +
        '\n' +
        imports +
        content.slice(insertIndex)
      )
    } else {
      // No script section found, add a new script setup section
      const templateIndex = content.indexOf('<template>')
      if (templateIndex !== -1) {
        return `<script setup>\n${imports}</script>\n\n` + content
      }
    }

    return content
  }

  migrateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const { modifiedContent, hasChanges, fileIcons } =
      this.migrateContent(content)

    if (hasChanges) {
      this.log(`Migrating: ${path.relative(this.projectRoot, filePath)}`)

      let finalContent = modifiedContent

      // Add imports if this is a Vue file
      if (filePath.endsWith('.vue') && fileIcons.size > 0) {
        const imports = this.generateImports(fileIcons)
        finalContent = this.addImportsToVueFile(finalContent, imports)
      }

      if (!this.dryRun) {
        this.createBackup(filePath)
        fs.writeFileSync(filePath, finalContent)
      }
    }

    return hasChanges
  }

  async migrate() {
    this.log('🎨 Starting emoji/text to Heroicons migration...')

    const files = await this.findVueFiles()
    this.log(`Found ${files.length} files to process`)

    let processedFiles = 0
    let modifiedFiles = 0

    for (const file of files) {
      try {
        const hasChanges = this.migrateFile(file)
        processedFiles++
        if (hasChanges) modifiedFiles++
      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`, 'error')
      }
    }

    this.log(`✅ Migration complete!`)
    this.log(`📁 Processed: ${processedFiles} files`)
    this.log(`🔄 Modified: ${modifiedFiles} files`)
    this.log(`🎨 Total changes: ${this.changes.length}`)
    this.log(`📦 Unique icons used: ${this.importedIcons.size}`)

    if (this.dryRun) {
      this.log('🧪 Dry run mode - no files were actually modified')
    }

    return {
      processedFiles,
      modifiedFiles,
      changes: this.changes,
    }
  }

  generateReport() {
    if (this.changes.length === 0) {
      return 'No changes were made.'
    }

    let report = '# Emoji/Text to Heroicons Migration Report\n\n'
    report += `Total changes: ${this.changes.length}\n\n`

    const emojiChanges = this.changes.filter(c => c.type === 'emoji')
    const textChanges = this.changes.filter(c => c.type === 'text')

    if (emojiChanges.length > 0) {
      report += '## Emoji Replacements\n\n'
      for (const change of emojiChanges) {
        report += `- ${change.original} → \`${change.replacement}\`\n`
      }
      report += '\n'
    }

    if (textChanges.length > 0) {
      report += '## Text Replacements\n\n'
      for (const change of textChanges) {
        report += `- "${change.original}" → \`${change.replacement}\`\n`
      }
      report += '\n'
    }

    report += '## Icons Used\n\n'
    for (const icon of this.importedIcons) {
      report += `- ${icon.name} (${icon.type})\n`
    }

    return report
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    backupDir:
      args.find(arg => arg.startsWith('--backup-dir='))?.split('=')[1] ||
      'backups',
  }

  const migrator = new EmojiToHeroiconsMigrator(options)

  migrator
    .migrate()
    .then(result => {
      if (options.verbose) {
        console.log('\n' + migrator.generateReport())
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

export { EmojiToHeroiconsMigrator }
