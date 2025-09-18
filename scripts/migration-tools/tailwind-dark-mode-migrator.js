#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mapping of light mode classes to dark mode equivalents
const DARK_MODE_MAPPINGS = {
  // Background colors
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  'bg-gray-300': 'bg-gray-300 dark:bg-gray-600',
  'bg-gray-800': 'bg-gray-800 dark:bg-gray-200',
  'bg-gray-900': 'bg-gray-900 dark:bg-white',

  // Text colors
  'text-black': 'text-black dark:text-white',
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'text-gray-400': 'text-gray-400 dark:text-gray-500',
  'text-gray-300': 'text-gray-300 dark:text-gray-600',
  'text-gray-200': 'text-gray-200 dark:text-gray-700',
  'text-gray-100': 'text-gray-100 dark:text-gray-800',
  'text-white': 'text-white dark:text-black',

  // Border colors
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'border-gray-400': 'border-gray-400 dark:border-gray-500',
  'border-gray-500': 'border-gray-500 dark:border-gray-400',
  'border-gray-600': 'border-gray-600 dark:border-gray-300',
  'border-gray-700': 'border-gray-700 dark:border-gray-200',

  // Ring colors
  'ring-gray-200': 'ring-gray-200 dark:ring-gray-700',
  'ring-gray-300': 'ring-gray-300 dark:ring-gray-600',

  // Divide colors
  'divide-gray-200': 'divide-gray-200 dark:divide-gray-700',
  'divide-gray-300': 'divide-gray-300 dark:divide-gray-600',

  // Placeholder colors
  'placeholder-gray-400': 'placeholder-gray-400 dark:placeholder-gray-500',
  'placeholder-gray-500': 'placeholder-gray-500 dark:placeholder-gray-400',

  // Shadow - lighter in dark mode
  'shadow-lg': 'shadow-lg dark:shadow-gray-800/25',
  'shadow-xl': 'shadow-xl dark:shadow-gray-800/25',
  'shadow-2xl': 'shadow-2xl dark:shadow-gray-800/25',

  // Glass morphism adjustments
  'glass-bg': 'glass-bg dark:bg-black/20',
  'glass-surface': 'glass-surface dark:bg-black/30',
}

// Custom class patterns that need special handling
const CUSTOM_PATTERNS = [
  {
    pattern: /glass-bg-light/g,
    replacement: 'glass-bg-light dark:bg-black/10',
  },
  {
    pattern: /text-glass-primary/g,
    replacement: 'text-glass-primary dark:text-white',
  },
  {
    pattern: /text-glass-secondary/g,
    replacement: 'text-glass-secondary dark:text-gray-300',
  },
]

class TailwindDarkModeMigrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
    this.backupDir = options.backupDir || 'backups'
    this.projectRoot = options.projectRoot || process.cwd()
    this.changes = []
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️'
      console.log(`${prefix} ${message}`)
    }
  }

  async findVueFiles() {
    const patterns = [
      'src/**/*.vue',
      'src/**/*.html',
      'src/**/*.jsx',
      'src/**/*.tsx',
    ]

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

  migrateClassString(classString) {
    let migrated = classString
    let hasChanges = false

    // Apply direct mappings
    for (const [lightClass, darkClass] of Object.entries(DARK_MODE_MAPPINGS)) {
      // Skip if already has dark: variant
      if (
        migrated.includes(`dark:${lightClass.split('-').slice(1).join('-')}`)
      ) {
        continue
      }

      const regex = new RegExp(`\\b${lightClass}\\b`, 'g')
      if (regex.test(migrated)) {
        migrated = migrated.replace(regex, darkClass)
        hasChanges = true
      }
    }

    // Apply custom patterns
    for (const { pattern, replacement } of CUSTOM_PATTERNS) {
      if (pattern.test(migrated)) {
        migrated = migrated.replace(pattern, replacement)
        hasChanges = true
      }
    }

    return { migrated, hasChanges }
  }

  migrateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    let modifiedContent = content
    let fileHasChanges = false

    // Pattern to match class attributes in Vue/HTML
    const classPatterns = [
      /class="([^"]*?)"/g,
      /class='([^']*?)'/g,
      /:class="([^"]*?)"/g,
      /:class='([^']*?)'/g,
      /className="([^"]*?)"/g,
      /className='([^']*?)'/g,
    ]

    for (const pattern of classPatterns) {
      modifiedContent = modifiedContent.replace(
        pattern,
        (match, classString) => {
          const { migrated, hasChanges } = this.migrateClassString(classString)

          if (hasChanges) {
            fileHasChanges = true
            this.changes.push({
              file: path.relative(this.projectRoot, filePath),
              original: classString,
              migrated: migrated,
            })
          }

          return match.replace(classString, migrated)
        }
      )
    }

    if (fileHasChanges) {
      this.log(`Migrating: ${path.relative(this.projectRoot, filePath)}`)

      if (!this.dryRun) {
        this.createBackup(filePath)
        fs.writeFileSync(filePath, modifiedContent)
      }
    }

    return fileHasChanges
  }

  async migrate() {
    this.log('🚀 Starting Tailwind dark mode migration...')

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

    let report = '# Tailwind Dark Mode Migration Report\n\n'
    report += `Total changes: ${this.changes.length}\n\n`

    const changesByFile = this.changes.reduce((acc, change) => {
      if (!acc[change.file]) acc[change.file] = []
      acc[change.file].push(change)
      return acc
    }, {})

    for (const [file, changes] of Object.entries(changesByFile)) {
      report += `## ${file}\n\n`
      for (const change of changes) {
        report += `- \`${change.original}\` → \`${change.migrated}\`\n`
      }
      report += '\n'
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

  const migrator = new TailwindDarkModeMigrator(options)

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

export { TailwindDarkModeMigrator }
