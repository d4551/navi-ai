#!/usr/bin/env node

/**
 * Update Absolute Positioning Script
 * =================================
 * Finds and updates absolute positioned elements to use design system utilities
 * Created: September 7, 2025
 */

import fs from 'fs'
import { glob } from 'glob'

// Design system mapping for common positioning patterns
const POSITION_MAPPINGS = {
  // Top positioning
  'top: 0': 'top-0',
  'top: 4px': 'top-1',
  'top: 8px': 'top-2',
  'top: 12px': 'top-3',
  'top: 16px': 'top-4',
  'top: 20px': 'top-5',
  'top: 24px': 'top-6',
  'top: 32px': 'top-8',
  'top: 40px': 'top-10',
  'top: 48px': 'top-12',
  'top: 64px': 'top-16',
  'top: 80px': 'top-20',
  'top: 96px': 'top-24',
  'top: 50%': 'top-1\\/2',
  'top: 100%': 'top-full',
  'top: auto': 'top-auto',

  // Negative top values
  'top: -4px': 'top-neg-1',
  'top: -8px': 'top-neg-2',
  'top: -12px': 'top-neg-3',
  'top: -16px': 'top-neg-4',
  'top: -20px': 'top-neg-5',
  'top: -24px': 'top-neg-6',
  'top: -32px': 'top-neg-8',
  'top: -40px': 'top-neg-10',
  'top: -48px': 'top-neg-12',
  'top: -64px': 'top-neg-16',
  'top: -80px': 'top-neg-20',
  'top: -96px': 'top-neg-24',

  // Right positioning
  'right: 0': 'right-0',
  'right: 4px': 'right-1',
  'right: 8px': 'right-2',
  'right: 12px': 'right-3',
  'right: 16px': 'right-4',
  'right: 20px': 'right-5',
  'right: 24px': 'right-6',
  'right: 32px': 'right-8',
  'right: 40px': 'right-10',
  'right: 48px': 'right-12',
  'right: 64px': 'right-16',
  'right: 80px': 'right-20',
  'right: 96px': 'right-24',
  'right: 50%': 'right-1\\/2',
  'right: 100%': 'right-full',
  'right: auto': 'right-auto',

  // Bottom positioning
  'bottom: 0': 'bottom-0',
  'bottom: 4px': 'bottom-1',
  'bottom: 8px': 'bottom-2',
  'bottom: 12px': 'bottom-3',
  'bottom: 16px': 'bottom-4',
  'bottom: 20px': 'bottom-5',
  'bottom: 24px': 'bottom-6',
  'bottom: 32px': 'bottom-8',
  'bottom: 40px': 'bottom-10',
  'bottom: 48px': 'bottom-12',
  'bottom: 64px': 'bottom-16',
  'bottom: 80px': 'bottom-20',
  'bottom: 96px': 'bottom-24',
  'bottom: 50%': 'bottom-1\\/2',
  'bottom: 100%': 'bottom-full',
  'bottom: auto': 'bottom-auto',

  // Left positioning
  'left: 0': 'left-0',
  'left: 4px': 'left-1',
  'left: 8px': 'left-2',
  'left: 12px': 'left-3',
  'left: 16px': 'left-4',
  'left: 20px': 'left-5',
  'left: 24px': 'left-6',
  'left: 32px': 'left-8',
  'left: 40px': 'left-10',
  'left: 48px': 'left-12',
  'left: 64px': 'left-16',
  'left: 80px': 'left-20',
  'left: 96px': 'left-24',
  'left: 50%': 'left-1\\/2',
  'left: 100%': 'left-full',
  'left: auto': 'left-auto',
  'left: -10000px': 'left-neg-24', // Common off-screen pattern

  // Negative left values
  'left: -4px': 'left-neg-1',
  'left: -8px': 'left-neg-2',
  'left: -12px': 'left-neg-3',
  'left: -16px': 'left-neg-4',
  'left: -20px': 'left-neg-5',
  'left: -24px': 'left-neg-6',
  'left: -32px': 'left-neg-8',
  'left: -40px': 'left-neg-10',
  'left: -48px': 'left-neg-12',
  'left: -64px': 'left-neg-16',
  'left: -80px': 'left-neg-20',
  'left: -96px': 'left-neg-24',

  // Z-index mapping
  'z-index: 0': 'z-0',
  'z-index: 10': 'z-10',
  'z-index: 20': 'z-20',
  'z-index: 30': 'z-30',
  'z-index: 35': 'z-35',
  'z-index: 40': 'z-40',
  'z-index: 50': 'z-50',
  'z-index: 60': 'z-60',
  'z-index: 70': 'z-70',
  'z-index: 80': 'z-80',
  'z-index: 90': 'z-90',
  'z-index: 100': 'z-100',
  'z-index: 9999': 'z-emergency',

  // Position types
  'position: static': 'position-static',
  'position: relative': 'position-relative',
  'position: absolute': 'position-absolute',
  'position: fixed': 'position-fixed',
  'position: sticky': 'position-sticky',
}

// Patterns for common CSS variable substitutions
const VARIABLE_MAPPINGS = {
  'var(--spacing-1)': 'var(--spacing-1)',
  'var(--spacing-2)': 'var(--spacing-2)',
  'var(--spacing-3)': 'var(--spacing-3)',
  'var(--spacing-4)': 'var(--spacing-4)',
  'var(--spacing-5)': 'var(--spacing-5)',
  'var(--spacing-6)': 'var(--spacing-6)',
  'var(--spacing-8)': 'var(--spacing-8)',
  'var(--spacing-10)': 'var(--spacing-10)',
  'var(--spacing-12)': 'var(--spacing-12)',
  'var(--spacing-16)': 'var(--spacing-16)',
  'var(--spacing-20)': 'var(--spacing-20)',
  'var(--spacing-24)': 'var(--spacing-24)',
  'var(--spacing-neg-1)': 'var(--spacing-neg-1)',
  'var(--spacing-neg-2)': 'var(--spacing-neg-2)',
  'var(--spacing-neg-3)': 'var(--spacing-neg-3)',
  'var(--spacing-neg-4)': 'var(--spacing-neg-4)',
  'var(--spacing-neg-5)': 'var(--spacing-neg-5)',
  'var(--spacing-neg-6)': 'var(--spacing-neg-6)',
  'var(--spacing-neg-8)': 'var(--spacing-neg-8)',
  'var(--spacing-neg-10)': 'var(--spacing-neg-10)',
  'var(--spacing-neg-12)': 'var(--spacing-neg-12)',
  'var(--spacing-neg-16)': 'var(--spacing-neg-16)',
  'var(--spacing-neg-20)': 'var(--spacing-neg-20)',
  'var(--spacing-neg-24)': 'var(--spacing-neg-24)',
  'var(--z-dropdown)': 'var(--z-dropdown)',
  'var(--z-sticky)': 'var(--z-sticky)',
  'var(--z-navigation)': 'var(--z-navigation)',
  'var(--z-navigation-hover)': 'var(--z-navigation-hover)',
  'var(--z-overlay)': 'var(--z-overlay)',
  'var(--z-modal)': 'var(--z-modal)',
  'var(--z-popover)': 'var(--z-popover)',
  'var(--z-tooltip)': 'var(--z-tooltip)',
  'var(--z-toast)': 'var(--z-toast)',
  'var(--z-loading)': 'var(--z-loading)',
  'var(--z-skip-link)': 'var(--z-skip-link)',
  'var(--z-emergency)': 'var(--z-emergency)',
}

// Special pattern recognizers
const PATTERN_RECOGNIZERS = [
  {
    name: 'Skip Link Pattern',
    regex:
      /position:\s*absolute;\s*top:\s*var\(--spacing-neg-10\);\s*left:\s*var\(--spacing-2\);/g,
    replacement:
      'position: absolute; /* Use .skip-link class from design system */',
    classToAdd: 'skip-link',
  },
  {
    name: 'Center Absolute Pattern',
    regex:
      /position:\s*absolute;\s*top:\s*50%;\s*left:\s*50%;\s*transform:\s*translate\(-50%,\s*-50%\);/g,
    replacement:
      'position: absolute; /* Use .center-absolute class from design system */',
    classToAdd: 'center-absolute',
  },
  {
    name: 'Center Fixed Pattern',
    regex:
      /position:\s*fixed;\s*top:\s*50%;\s*left:\s*50%;\s*transform:\s*translate\(-50%,\s*-50%\);/g,
    replacement:
      'position: fixed; /* Use .center-fixed class from design system */',
    classToAdd: 'center-fixed',
  },
  {
    name: 'Full Overlay Pattern',
    regex:
      /position:\s*absolute;\s*top:\s*0;\s*left:\s*0;\s*width:\s*100%;\s*height:\s*100%;/g,
    replacement:
      'position: absolute; /* Use .overlay-full class from design system */',
    classToAdd: 'overlay-full',
  },
  {
    name: 'Fixed Full Overlay Pattern',
    regex:
      /position:\s*fixed;\s*top:\s*0;\s*left:\s*0;\s*width:\s*100vw;\s*height:\s*100vh;/g,
    replacement:
      'position: fixed; /* Use .overlay-fixed-full class from design system */',
    classToAdd: 'overlay-fixed-full',
  },
  {
    name: 'Corner Top Right Pattern',
    regex:
      /position:\s*absolute;\s*top:\s*var\(--spacing-4\);\s*right:\s*var\(--spacing-4\);/g,
    replacement:
      'position: absolute; /* Use .corner-top-right class from design system */',
    classToAdd: 'corner-top-right',
  },
  {
    name: 'Corner Bottom Right Pattern',
    regex:
      /position:\s*absolute;\s*bottom:\s*var\(--spacing-4\);\s*right:\s*var\(--spacing-4\);/g,
    replacement:
      'position: absolute; /* Use .corner-bottom-right class from design system */',
    classToAdd: 'corner-bottom-right',
  },
  {
    name: 'FAB Pattern',
    regex:
      /position:\s*fixed;\s*bottom:\s*var\(--spacing-6\);\s*right:\s*var\(--spacing-6\);/g,
    replacement: 'position: fixed; /* Use .fab class from design system */',
    classToAdd: 'fab',
  },
]

// Function to find Vue/JS files
function findFiles() {
  const patterns = [
    'src/**/*.vue',
    'src/**/*.js',
    'src/**/*.ts',
    'src/**/*.css',
  ]

  let files = []
  patterns.forEach(pattern => {
    files = files.concat(glob.sync(pattern, { cwd: process.cwd() }))
  })

  return files
}

// Function to analyze and update a file
function updateFile() {
  console.log(`\n📄 Analyzing: ${filePath}`)

  const content = fs.readFileSync(filePath, 'utf8')
  let updatedContent = content
  let changes = []

  // First, check for pattern matches
  PATTERN_RECOGNIZERS.forEach(pattern => {
    const matches = content.match(pattern.regex)
    if (matches) {
      console.log(`  ✨ Found ${pattern.name}`)
      updatedContent = updatedContent.replace(
        pattern.regex,
        pattern.replacement
      )
      changes.push({
        type: 'pattern',
        pattern: pattern.name,
        classToAdd: pattern.classToAdd,
      })
    }
  })

  // Then check for individual CSS property mappings
  Object.entries(POSITION_MAPPINGS).forEach(([cssProperty, utilityClass]) => {
    const regex = new RegExp(
      cssProperty.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'),
      'g'
    )
    const matches = content.match(regex)
    if (matches) {
      console.log(`  🔄 Found: ${cssProperty} -> ${utilityClass}`)
      // Don't replace directly, just note it for manual review
      changes.push({
        type: 'property',
        original: cssProperty,
        utility: utilityClass,
      })
    }
  })

  // Check for CSS variables that could be utility classes
  Object.entries(VARIABLE_MAPPINGS).forEach(([cssVar, _]) => {
    const regex = new RegExp(
      cssVar.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'),
      'g'
    )
    const matches = content.match(regex)
    if (matches) {
      console.log(`  ✅ Already using design system variable: ${cssVar}`)
    }
  })

  // Look for absolute/fixed positioning that could be improved
  const absoluteRegex = /position:\\s*(absolute|fixed);/g
  const absoluteMatches = content.match(absoluteRegex)
  if (absoluteMatches) {
    console.log(
      `  ⚠️  Found ${absoluteMatches.length} absolute/fixed positioning instances`
    )
    changes.push({
      type: 'positioning',
      count: absoluteMatches.length,
    })
  }

  // Write updated content if changes were made
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent)
    console.log(`  💾 Updated file with pattern replacements`)
  }

  return changes
}

// Function to generate recommendations
function generateRecommendations(allChanges) {
  console.log(`\n📋 POSITIONING UPDATE RECOMMENDATIONS`)
  console.log(`${'='.repeat(50)}\n`)

  const patternChanges = allChanges.filter(c => c.type === 'pattern')
  const propertyChanges = allChanges.filter(c => c.type === 'property')
  const positioningIssues = allChanges.filter(c => c.type === 'positioning')

  if (patternChanges.length > 0) {
    console.log(`✨ PATTERN REPLACEMENTS MADE:`)
    patternChanges.forEach(change => {
      console.log(`   - Applied ${change.pattern} -> .${change.classToAdd}`)
    })
    console.log()
  }

  if (propertyChanges.length > 0) {
    console.log(`🔄 PROPERTIES THAT CAN BE UTILITY CLASSES:`)
    propertyChanges.forEach(change => {
      console.log(`   - ${change.original} -> .${change.utility}`)
    })
    console.log()
  }

  if (positioningIssues.length > 0) {
    console.log(`⚠️  POSITIONING INSTANCES TO REVIEW:`)
    positioningIssues.forEach(change => {
      console.log(
        `   - ${change.count} absolute/fixed positioning instances found`
      )
    })
    console.log()
  }

  console.log(`📝 MANUAL REVIEW STEPS:`)
  console.log(`   1. Review files with positioning instances`)
  console.log(
    `   2. Replace CSS properties with utility classes where appropriate`
  )
  console.log(
    `   3. Use semantic classes (.skip-link, .fab, .center-absolute) for common patterns`
  )
  console.log(`   4. Ensure z-index values use design system variables`)
  console.log(`   5. Test positioning on different screen sizes`)
  console.log()

  console.log(`🎨 DESIGN SYSTEM UTILITIES AVAILABLE:`)
  console.log(
    `   - Position utilities: .position-absolute, .position-fixed, .position-sticky`
  )
  console.log(`   - Positioning: .top-0 to .top-24, .left-0 to .left-24, etc.`)
  console.log(`   - Negative positions: .top-neg-1 to .top-neg-24, etc.`)
  console.log(`   - Z-index: .z-0 to .z-emergency`)
  console.log(
    `   - Semantic patterns: .skip-link, .fab, .center-absolute, .overlay-full`
  )
  console.log(`   - Responsive adjustments included for mobile/tablet`)
}

// Main execution
function main() {
  console.log(`🚀 NAVI Absolute Positioning Update Script`)
  console.log(`${'='.repeat(50)}`)

  const files = findFiles()
  console.log(`📁 Found ${files.length} files to analyze`)

  let allChanges = []

  files.forEach(file => {
    try {
      const changes = updateFile(file)
      allChanges = allChanges.concat(changes)
    } catch (error) {
      console.log(`  ❌ Error processing ${file}: ${error.message}`)
    }
  })

  generateRecommendations(allChanges)

  console.log(`\n✅ Positioning update analysis complete!`)
  console.log(
    `📋 Review the recommendations above and manually apply remaining changes.`
  )
}

// Run the script
main()

export { updateFile, POSITION_MAPPINGS, PATTERN_RECOGNIZERS }
