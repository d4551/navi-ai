#!/usr/bin/env node

/**
 * Find Unused Dependencies Script
 * Scans the codebase to find potentially unused dependencies
 */

const fs = require('fs')
const path = require('path')

const packagePath = path.join(__dirname, '../package.json')
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

// Directories to scan
const SCAN_DIRS = [
  path.join(__dirname, '../src'),
  path.join(__dirname, '../scripts'),
  path.join(__dirname, '../electron'),
]

// Known false positives - dependencies that might not appear in imports
const FALSE_POSITIVES = new Set([
  'better-sqlite3', // Used in electron main process
  'electron', // Used in electron main process
  'electron-builder', // Build tool
  'electron-store', // Used in electron
  'vite', // Build tool
  'typescript', // Build tool
  'eslint', // Linting
  'prettier', // Formatting
  'postcss', // CSS processing
  'tailwindcss', // CSS framework
  'autoprefixer', // CSS processing
  'sass-embedded', // SCSS processing
  'stylelint', // CSS linting
  'vitest', // Testing
  'jsdom', // Testing environment
  'husky', // Git hooks
  'lint-staged', // Git hooks
  'concurrently', // Scripts
  'wait-on', // Scripts
  'cross-env', // Scripts
  'tsx', // Script runner
  '@types/', // Type definitions (prefix)
  'vue-tsc', // Vue TypeScript
  'modern-normalize', // CSS reset
])

// Scan files for import statements
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const imports = new Set()

    // Match various import patterns
    const patterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g, // import ... from '...'
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // import('...')
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // require('...')
      /from\s+['"]([^'"]+)['"]/g, // from '...'
    ]

    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1]

        // Skip relative imports
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          continue
        }

        // Extract package name (handle scoped packages)
        let packageName
        if (importPath.startsWith('@')) {
          packageName = importPath.split('/').slice(0, 2).join('/')
        } else {
          packageName = importPath.split('/')[0]
        }

        imports.add(packageName)
      }
    })

    return imports
  } catch (error) {
    console.warn(`Failed to scan ${filePath}:`, error.message)
    return new Set()
  }
}

// Recursively scan directory
function scanDirectory(dir) {
  const allImports = new Set()

  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return

    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const itemPath = path.join(currentDir, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        // Skip node_modules and dist directories
        if (!['node_modules', 'dist', 'dist-electron', '.git'].includes(item)) {
          walkDir(itemPath)
        }
      } else if (item.match(/\.(js|ts|vue|jsx|tsx|cjs|mjs)$/)) {
        const fileImports = scanFile(itemPath)
        fileImports.forEach(imp => allImports.add(imp))
      }
    }
  }

  walkDir(dir)
  return allImports
}

function findUnusedDependencies() {
  console.log('🔍 Scanning for unused dependencies...\n')

  // Get all dependencies
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  const depNames = Object.keys(allDeps)

  console.log(`📦 Total dependencies to check: ${depNames.length}`)

  // Scan all directories for imports
  let allImports = new Set()
  for (const dir of SCAN_DIRS) {
    const dirImports = scanDirectory(dir)
    dirImports.forEach(imp => allImports.add(imp))
  }

  console.log(`📁 Found ${allImports.size} unique imports in codebase\n`)

  // Find potentially unused dependencies
  const unused = []
  const used = []

  for (const dep of depNames) {
    const isUsed =
      allImports.has(dep) ||
      FALSE_POSITIVES.has(dep) ||
      [...FALSE_POSITIVES].some(fp => dep.startsWith(fp))

    if (isUsed) {
      used.push(dep)
    } else {
      unused.push(dep)
    }
  }

  // Results
  console.log(`✅ Used dependencies (${used.length}):`)
  used.sort().forEach(dep => {
    console.log(`   📦 ${dep}`)
  })

  console.log(`\n⚠️  Potentially unused dependencies (${unused.length}):`)
  if (unused.length > 0) {
    unused.sort().forEach(dep => {
      console.log(`   🗑️  ${dep} (${allDeps[dep]})`)
    })

    console.log('\n📝 To remove unused dependencies:')
    const prodUnused = unused.filter(dep => pkg.dependencies[dep])
    const devUnused = unused.filter(dep => pkg.devDependencies[dep])

    if (prodUnused.length > 0) {
      console.log(`   npm uninstall ${prodUnused.join(' ')}`)
    }
    if (devUnused.length > 0) {
      console.log(`   npm uninstall --save-dev ${devUnused.join(' ')}`)
    }

    console.log(
      '\n⚠️  WARNING: Please verify these are actually unused before removing!'
    )
    console.log('   Some dependencies might be:')
    console.log('   - Used in configuration files')
    console.log('   - Used by other tools')
    console.log('   - Required at runtime but not imported')
    console.log('   - Used in HTML files or templates')
  } else {
    console.log('   🎉 No unused dependencies found!')
  }

  return { used, unused, total: depNames.length }
}

function generateReport() {
  const result = findUnusedDependencies()

  console.log('\n📊 Summary:')
  console.log(`   Used: ${result.used.length}`)
  console.log(`   Potentially unused: ${result.unused.length}`)
  console.log(`   Total: ${result.total}`)
  console.log(
    `   Usage rate: ${Math.round((result.used.length / result.total) * 100)}%`
  )

  if (result.unused.length > 0) {
    console.log(
      `\n💾 Potential bundle size savings: Review and remove unused deps`
    )
  }
}

if (require.main === module) {
  generateReport()
}

module.exports = { findUnusedDependencies, FALSE_POSITIVES }
