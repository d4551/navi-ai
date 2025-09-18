#!/usr/bin/env node

/**
 * Vuetify Migration Script
 *
 * This script helps migrate custom components to Vuetify components
 * while maintaining backward compatibility.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  COMPONENT_MAPPINGS,
  PROP_MAPPINGS,
  VARIANT_MAPPINGS,
  generateMigrationReport,
  getMigrationSuggestions,
} from '../src/utils/componentMigration.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  excludeDirs: ['node_modules', '.git', 'dist', 'coverage'],
  fileExtensions: ['.vue', '.js', '.ts'],
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  help: process.argv.includes('--help'),
}

// Help text
const HELP_TEXT = `
Vuetify Migration Script

Usage: node scripts/migrate-to-vuetify.js [options]

Options:
  --dry-run     Show what would be changed without making changes
  --verbose     Show detailed output
  --help        Show this help message

Examples:
  node scripts/migrate-to-vuetify.js --dry-run
  node scripts/migrate-to-vuetify.js --verbose
`

// Main migration function
async function migrateToVuetify() {
  if (CONFIG.help) {
    console.log(HELP_TEXT)
    return
  }

  console.log('🚀 Starting Vuetify migration...')
  console.log(`📁 Scanning directory: ${CONFIG.srcDir}`)

  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified')
  }

  const files = await findFiles(CONFIG.srcDir)
  console.log(`📄 Found ${files.length} files to process`)

  let totalChanges = 0
  const migrationReport = {
    files: [],
    totalComponents: 0,
    totalChanges: 0,
  }

  for (const file of files) {
    try {
      const result = await processFile(file)
      if (result.changes > 0) {
        totalChanges += result.changes
        migrationReport.files.push(result)
        migrationReport.totalComponents += result.components.length
        migrationReport.totalChanges += result.changes
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message)
    }
  }

  // Generate summary report
  generateSummaryReport(migrationReport)

  if (CONFIG.dryRun && totalChanges > 0) {
    console.log('\n💡 To apply these changes, run without --dry-run')
  } else if (totalChanges > 0) {
    console.log(
      `\n✅ Migration completed! ${totalChanges} changes made across ${migrationReport.files.length} files`
    )
  } else {
    console.log(
      '\n✨ No migration needed - all components are already using Vuetify!'
    )
  }
}

// Find all files to process
async function findFiles(dir) {
  const files = []

  async function scanDirectory(currentDir) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (!CONFIG.excludeDirs.includes(entry.name)) {
          await scanDirectory(fullPath)
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (CONFIG.fileExtensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  await scanDirectory(dir)
  return files
}

// Process a single file
async function processFile(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8')
  const report = generateMigrationReport(content)

  if (!report.needsMigration) {
    return { file: filePath, changes: 0, components: [] }
  }

  let newContent = content
  let changes = 0
  const components = []

  // Process each component that needs migration
  for (const component of report.components) {
    const suggestions = getMigrationSuggestions(component.name, {})

    // Update component usage
    const componentRegex = new RegExp(`<${component.name}\\b`, 'g')
    const componentMatches = newContent.match(componentRegex)

    if (componentMatches) {
      newContent = newContent.replace(
        componentRegex,
        `<${suggestions.component}`
      )
      changes += componentMatches.length

      components.push({
        name: component.name,
        vuetifyComponent: suggestions.component,
        count: componentMatches.length,
      })

      if (CONFIG.verbose) {
        console.log(
          `  📝 ${component.name} → ${suggestions.component} (${componentMatches.length} occurrences)`
        )
      }
    }
  }

  // Update import statements
  for (const importPath of report.imports) {
    if (
      importPath.includes('@/components/ui/') ||
      importPath.includes('@/components/Card')
    ) {
      // Update import to use Vuetify components
      const newImportPath = '@/components/vuetify'
      const importRegex = new RegExp(
        `from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        'g'
      )

      if (newContent.match(importRegex)) {
        newContent = newContent.replace(importRegex, `from '${newImportPath}'`)
        changes++

        if (CONFIG.verbose) {
          console.log(`  📦 Updated import: ${importPath} → ${newImportPath}`)
        }
      }
    }
  }

  // Write the updated file if not in dry run mode
  if (!CONFIG.dryRun && changes > 0) {
    await fs.promises.writeFile(filePath, newContent, 'utf8')
  }

  return {
    file: filePath,
    changes,
    components,
    originalContent: content,
    newContent: changes > 0 ? newContent : null,
  }
}

// Generate summary report
function generateSummaryReport(report) {
  console.log('\n📊 Migration Summary')
  console.log('==================')
  console.log(`Files processed: ${report.files.length}`)
  console.log(`Total components migrated: ${report.totalComponents}`)
  console.log(`Total changes made: ${report.totalChanges}`)

  if (report.files.length > 0) {
    console.log('\n📋 Files with changes:')
    report.files.forEach(file => {
      console.log(`  ${file.file}`)
      file.components.forEach(comp => {
        console.log(
          `    - ${comp.name} → ${comp.vuetifyComponent} (${comp.count} occurrences)`
        )
      })
    })
  }

  console.log('\n🎯 Next Steps:')
  console.log('1. Test the migrated components')
  console.log('2. Update any custom styling if needed')
  console.log('3. Remove unused custom components')
  console.log('4. Update documentation')
}

// Run the migration
migrateToVuetify().catch(console.error)
