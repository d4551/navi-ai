#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Advanced Vue Import and Error Fixer
 * Handles complex cases like undefined variables, missing imports, and composition API issues
 */

function fixPersonalInfoSection(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Fix props.* usage in template (should be direct access in template)
  let newContent = content.replace(/props\./g, '')

  // Fix 'e' parameter in event handlers
  newContent = newContent.replace(
    /catch\s*\(\s*\)\s*{([^}]*\be\b[^}]*)}/g,
    'catch (e) {$1}'
  )

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent)
    modified = true
  }

  return modified
}

function fixResumeLayout(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  let newContent = content

  // Add Vue composition imports if missing
  if (!content.includes('import { ref, computed, onMounted }')) {
    const scriptIndex = content.indexOf('<script')
    if (scriptIndex !== -1) {
      const scriptEndIndex = content.indexOf('>', scriptIndex) + 1
      newContent =
        content.slice(0, scriptEndIndex) +
        "\nimport { ref, computed, onMounted } from 'vue';\n" +
        content.slice(scriptEndIndex)
      modified = true
    }
  }

  // Fix unused variable 'refcomputed'
  newContent = newContent.replace(
    /const\s+refcomputed\s*=.*?;/g,
    '// const _refcomputed = ...; // Unused variable removed'
  )

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent)
    modified = true
  }

  return modified
}

function fixStreamingSettings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  let newContent = content

  // Add Vue composition imports
  if (!content.includes('import { ref, computed, onMounted }')) {
    const scriptIndex = content.indexOf('<script')
    if (scriptIndex !== -1) {
      const scriptEndIndex = content.indexOf('>', scriptIndex) + 1
      newContent =
        content.slice(0, scriptEndIndex) +
        "\nimport { ref, computed, onMounted } from 'vue';\n" +
        content.slice(scriptEndIndex)
      modified = true
    }
  }

  // Fix catch blocks with proper error parameter
  newContent = newContent.replace(
    /catch\s*\(\s*\)\s*{([^}]*\berror\b[^}]*)}/g,
    'catch (error) {$1}'
  )

  // Fix unused error variables
  newContent = newContent.replace(
    /catch\s*\(\s*(\w+)\s*\)\s*{([^}]*?)console\.log\([^)]*\1[^)]*\)/g,
    'catch (_$1) {$2console.error(_$1)'
  )

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent)
    modified = true
  }

  return modified
}

function fixJobSearchView(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  let newContent = content

  // Fix import issues
  const missingImports = [
    "import { ref, computed, watch, onMounted } from 'vue';",
    "import { useRouter } from 'vue-router';",
    "import type { NormalizedStudio } from '@/types/studio';",
    "import { JobRepository } from '@/services/JobRepository';",
    "import type { JobSearchResult } from '@/types/job';",
    "import { GAMING_STUDIOS } from '@/data/gaming-studios';",
    "import { normalizeStudio, buildNormalizedStudios, seedStudiosIfEmpty } from '@/utils/studio-utils';",
    "import { fuzzyMatchStudios, buildTokenIndex } from '@/utils/search-utils';",
    "import { searchJobsUnified } from '@/services/job-search';",
  ]

  // Add imports after script tag
  const scriptIndex = content.indexOf('<script')
  if (scriptIndex !== -1) {
    const scriptEndIndex = content.indexOf('>', scriptIndex) + 1
    newContent =
      content.slice(0, scriptEndIndex) +
      '\n' +
      missingImports.join('\n') +
      '\n' +
      content.slice(scriptEndIndex)
    modified = true
  }

  // Fix computedwatch typo
  newContent = newContent.replace(/computedwatch/g, 'computed, watch')

  // Fix experience vs experienceLevel
  newContent = newContent.replace(/\.experienceLevel/g, '.experience')

  // Fix undefined currentJobs
  newContent = newContent.replace(
    /\bcurrentJobs\b/g,
    'searchResults.value || []'
  )

  // Fix router usage
  if (!newContent.includes('const router = useRouter()')) {
    const setupMatch = newContent.match(/setup\s*\([^)]*\)\s*{/)
    if (setupMatch) {
      const insertIndex =
        newContent.indexOf(setupMatch[0]) + setupMatch[0].length
      newContent =
        newContent.slice(0, insertIndex) +
        '\n    const router = useRouter();\n' +
        newContent.slice(insertIndex)
      modified = true
    }
  }

  // Fix case declarations in switch statements
  newContent = newContent.replace(
    /(case\s+['"][^'"]*['"]:\s*)(const\s+)/g,
    '$1{\n        $2'
  )
  newContent = newContent.replace(
    /(case\s+['"][^'"]*['"]:\s*{\s*const\s+[^}]*;\s*break;\s*})/g,
    '$1\n    }'
  )

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent)
    modified = true
  }

  return modified
}

function fixRouterIndex(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  let newContent = content

  // Add router import if missing
  if (!content.includes('createRouter')) {
    newContent =
      "import { createRouter, createWebHistory } from 'vue-router';\n" + content
    modified = true
  }

  // Fix undefined router references
  if (!newContent.includes('const router =')) {
    // Find the end of imports and add router creation
    const lastImport = newContent.lastIndexOf('import ')
    if (lastImport !== -1) {
      const lineEnd = newContent.indexOf('\n', lastImport)
      newContent =
        newContent.slice(0, lineEnd + 1) +
        '\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [\n    // routes will be defined here\n  ]\n});\n' +
        newContent.slice(lineEnd + 1)
      modified = true
    }
  }

  // Fix event parameter issues
  newContent = newContent.replace(/=>\s*{([^}]*\be\b[^}]*)}/g, '(e) => {$1}')

  // Fix unused _e parameters
  newContent = newContent.replace(/catch\s*\(\s*_e\s*\)/g, 'catch (_error)')

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent)
    modified = true
  }

  return modified
}

function fixPerformantPortfolio(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Fix _data vs data issue
  let newContent = content.replace(/\b_data\b/g, 'data')

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent)
    modified = true
  }

  return modified
}

function main() {
  console.log('🔧 Starting Advanced Vue Import and Error Fixer...\n')

  const fixes = [
    {
      file: '/workspaces/navi2/src/components/resume/PersonalInfoSection.vue',
      fixer: fixPersonalInfoSection,
      name: 'PersonalInfoSection',
    },
    {
      file: '/workspaces/navi2/src/components/resume/ResumeLayout.vue',
      fixer: fixResumeLayout,
      name: 'ResumeLayout',
    },
    {
      file: '/workspaces/navi2/src/components/settings/StreamingSettingsSection.vue',
      fixer: fixStreamingSettings,
      name: 'StreamingSettingsSection',
    },
    {
      file: '/workspaces/navi2/src/views/JobSearch.vue',
      fixer: fixJobSearchView,
      name: 'JobSearch',
    },
    {
      file: '/workspaces/navi2/src/router/index.js',
      fixer: fixRouterIndex,
      name: 'Router Index',
    },
    {
      file: '/workspaces/navi2/src/composables/usePerformantPortfolio.ts',
      fixer: fixPerformantPortfolio,
      name: 'PerformantPortfolio',
    },
  ]

  let totalFixed = 0

  for (const { file, fixer, name } of fixes) {
    try {
      if (fs.existsSync(file)) {
        const wasFixed = fixer(file)
        if (wasFixed) {
          console.log(`✅ Fixed ${name}: ${path.relative(process.cwd(), file)}`)
          totalFixed++
        } else {
          console.log(`ℹ️  No changes needed for ${name}`)
        }
      } else {
        console.log(`⚠️  File not found: ${file}`)
      }
    } catch (error) {
      console.error(`❌ Error fixing ${name}:`, error.message)
    }
  }

  console.log('\n📊 Advanced Fix Summary:')
  console.log(`• Files processed: ${fixes.length}`)
  console.log(`• Files modified: ${totalFixed}`)
  console.log('• Target files: Critical error sources')
}

if (require.main === module) {
  main()
}

module.exports = {
  fixPersonalInfoSection,
  fixResumeLayout,
  fixStreamingSettings,
  fixJobSearchView,
  fixRouterIndex,
  fixPerformantPortfolio,
}
