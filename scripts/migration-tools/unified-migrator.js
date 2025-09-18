#!/usr/bin/env node

import { TailwindDarkModeMigrator } from './tailwind-dark-mode-migrator.js'
import { EmojiToHeroiconsMigrator } from './emoji-to-heroicons-migrator.js'
import fs from 'fs'
import path from 'path'

class UnifiedMigrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || false
    this.projectRoot = options.projectRoot || process.cwd()
    this.skipTailwind = options.skipTailwind || false
    this.skipIcons = options.skipIcons || false
    this.backupDir = options.backupDir || 'backups'

    this.results = {
      tailwind: null,
      icons: null,
      summary: null,
    }
  }

  log(message, level = 'info') {
    const prefix =
      level === 'error'
        ? '❌'
        : level === 'warn'
          ? '⚠️'
          : level === 'success'
            ? '✅'
            : 'ℹ️'
    console.log(`${prefix} ${message}`)
  }

  async createProjectBackup() {
    if (this.dryRun) {
      this.log('Dry run mode - skipping project backup')
      return
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(
      this.projectRoot,
      'migration-backups',
      `backup-${timestamp}`
    )

    this.log(`Creating full project backup at: ${backupPath}`)

    try {
      // Create backup directory structure
      fs.mkdirSync(backupPath, { recursive: true })

      // Copy package.json and other config files
      const configFiles = [
        'package.json',
        'tailwind.config.js',
        'vite.config.js',
        'tsconfig.json',
      ]

      for (const file of configFiles) {
        const filePath = path.join(this.projectRoot, file)
        if (fs.existsSync(filePath)) {
          fs.copyFileSync(filePath, path.join(backupPath, file))
        }
      }

      this.log(`Project backup created successfully`)
    } catch (error) {
      this.log(`Failed to create project backup: ${error.message}`, 'error')
      throw error
    }
  }

  async updateTailwindConfig() {
    const configPath = path.join(this.projectRoot, 'tailwind.config.js')

    if (!fs.existsSync(configPath)) {
      this.log('No tailwind.config.js found - skipping config update')
      return
    }

    try {
      let config = fs.readFileSync(configPath, 'utf8')

      // Ensure dark mode is properly configured
      if (!config.includes('darkMode:')) {
        const modeConfig = `  darkMode: 'class',\n`
        config = config.replace(
          /export default {/,
          `export default {\n${modeConfig}`
        )

        if (!this.dryRun) {
          fs.writeFileSync(configPath, config)
        }

        this.log('Updated Tailwind config with dark mode support')
      }
    } catch (error) {
      this.log(`Failed to update Tailwind config: ${error.message}`, 'warn')
    }
  }

  async updateMainJs() {
    const mainJsPath = path.join(this.projectRoot, 'src/main.js')

    if (!fs.existsSync(mainJsPath)) {
      this.log('No src/main.js found - skipping theme store integration')
      return
    }

    try {
      let mainJs = fs.readFileSync(mainJsPath, 'utf8')

      // Add theme store initialization if not present
      if (!mainJs.includes('useThemeStore')) {
        const themeInit = `
// Initialize theme store
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();
themeStore.initialize();
`

        // Find a good place to insert the theme initialization
        const mountIndex = mainJs.lastIndexOf('app.mount')
        if (mountIndex !== -1) {
          mainJs =
            mainJs.slice(0, mountIndex) +
            themeInit +
            '\n' +
            mainJs.slice(mountIndex)

          if (!this.dryRun) {
            fs.writeFileSync(mainJsPath, mainJs)
          }

          this.log('Added theme store initialization to main.js')
        }
      }
    } catch (error) {
      this.log(`Failed to update main.js: ${error.message}`, 'warn')
    }
  }

  async createThemeToggleComponent() {
    const componentPath = path.join(
      this.projectRoot,
      'src/components/ui/ThemeToggle.vue'
    )

    if (fs.existsSync(componentPath)) {
      this.log('ThemeToggle component already exists - skipping creation')
      return
    }

    const themeToggleComponent = `<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <SunIcon v-if="isDark" class="w-5 h-5 text-yellow-500" />
    <MoonIcon v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" />
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline';

const themeStore = useThemeStore();

const isDark = computed(() => themeStore.effectiveTheme === 'dark');

const toggleTheme = () => {
  themeStore.toggleDarkMode();
};
</script>`

    if (!this.dryRun) {
      const componentDir = path.dirname(componentPath)
      fs.mkdirSync(componentDir, { recursive: true })
      fs.writeFileSync(componentPath, themeToggleComponent)
    }

    this.log('Created ThemeToggle component')
  }

  async runTailwindMigration() {
    if (this.skipTailwind) {
      this.log('Skipping Tailwind dark mode migration')
      return null
    }

    this.log('🎨 Starting Tailwind dark mode migration...')

    const migrator = new TailwindDarkModeMigrator({
      dryRun: this.dryRun,
      verbose: this.verbose,
      projectRoot: this.projectRoot,
      backupDir: this.backupDir,
    })

    const result = await migrator.migrate()
    this.results.tailwind = result

    if (this.verbose && result.changes.length > 0) {
      console.log('\n' + migrator.generateReport())
    }

    return result
  }

  async runIconMigration() {
    if (this.skipIcons) {
      this.log('Skipping emoji/icon migration')
      return null
    }

    this.log('🎭 Starting emoji/icon to Heroicons migration...')

    const migrator = new EmojiToHeroiconsMigrator({
      dryRun: this.dryRun,
      verbose: this.verbose,
      projectRoot: this.projectRoot,
      backupDir: this.backupDir,
    })

    const result = await migrator.migrate()
    this.results.icons = result

    if (this.verbose && result.changes.length > 0) {
      console.log('\n' + migrator.generateReport())
    }

    return result
  }

  generateSummaryReport() {
    let report = '# 🚀 NAVI UI Modernization Complete!\n\n'

    report += '## Summary\n\n'

    if (this.results.tailwind) {
      const t = this.results.tailwind
      report += `### 🎨 Tailwind Dark Mode Migration\n`
      report += `- Files processed: ${t.processedFiles}\n`
      report += `- Files modified: ${t.modifiedFiles}\n`
      report += `- Total changes: ${t.changes.length}\n\n`
    }

    if (this.results.icons) {
      const i = this.results.icons
      report += `### 🎭 Icon Migration\n`
      report += `- Files processed: ${i.processedFiles}\n`
      report += `- Files modified: ${i.modifiedFiles}\n`
      report += `- Total changes: ${i.changes.length}\n\n`
    }

    report += '## Next Steps\n\n'
    report += '1. ✅ Pinia store for theme management is now configured\n'
    report += '2. ✅ Tailwind dark mode classes have been added\n'
    report += '3. ✅ Emojis and text have been replaced with Heroicons\n'
    report += '4. ✅ Theme toggle component has been created\n\n'

    report += '### Manual Steps\n\n'
    report +=
      '- Import and use the `ThemeToggle` component in your header/navigation\n'
    report += '- Test the dark mode toggle functionality\n'
    report += '- Review the migration changes and adjust styling as needed\n'
    report += '- Update any custom components to use the new theme system\n\n'

    if (this.dryRun) {
      report +=
        '**Note: This was a dry run. No files were actually modified.**\n'
    }

    return report
  }

  async migrate() {
    this.log('🚀 Starting NAVI UI Modernization...')

    try {
      // Create backup
      await this.createProjectBackup()

      // Update configurations
      await this.updateTailwindConfig()

      // Run migrations
      await this.runTailwindMigration()
      await this.runIconMigration()

      // Create supporting files
      await this.updateMainJs()
      await this.createThemeToggleComponent()

      // Generate summary
      this.results.summary = this.generateSummaryReport()

      this.log('🎉 Migration completed successfully!', 'success')
      console.log('\n' + this.results.summary)

      return this.results
    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error')
      throw error
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    skipTailwind: args.includes('--skip-tailwind'),
    skipIcons: args.includes('--skip-icons'),
    backupDir:
      args.find(arg => arg.startsWith('--backup-dir='))?.split('=')[1] ||
      'backups',
  }

  console.log('🚀 NAVI UI Modernization Tool')
  console.log('===============================\n')

  if (options.dryRun) {
    console.log('🧪 Running in DRY RUN mode - no files will be modified\n')
  }

  const migrator = new UnifiedMigrator(options)

  migrator
    .migrate()
    .then(() => {
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

export { UnifiedMigrator }
