#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const files = [
  '/workspaces/navi-ai/src/components/ui/UnifiedButton.vue',
  '/workspaces/navi-ai/src/styles/enhanced-glass-utilities.css',
]

files.forEach(file => {
  try {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`)
      return
    }

    const content = fs.readFileSync(file, 'utf-8')

    // Remove all @apply statements that use custom CSS variables/classes
    let fixed = content
      // Remove @apply statements with custom variables and classes
      .replace(/@apply[^;]*glass-[^;]*;?/g, '')
      .replace(/@apply[^;]*neon-[^;]*;?/g, '')
      .replace(/@apply[^;]*bg-bg-[^;]*;?/g, '')
      .replace(/@apply[^;]*text-error-[^;]*;?/g, '')
      .replace(/@apply[^;]*border-error-[^;]*;?/g, '')
      .replace(/@apply[^;]*btn-glass[^;]*;?/g, '')
      .replace(/@apply[^;]*shadow-glow-[^;]*;?/g, '')
      .replace(/@apply[^;]*ring-neon[^;]*;?/g, '')
      .replace(/@apply[^;]*border-neon[^;]*;?/g, '')
      .replace(/@apply[^;]*text-neon[^;]*;?/g, '')
      .replace(/@apply[^;]*from-neon[^;]*;?/g, '')
      .replace(/@apply[^;]*to-neon[^;]*;?/g, '')
      // Clean up empty lines and empty rulesets
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/{\s*\n\s*}/g, '{ /* removed custom styles */ }')

    if (fixed !== content) {
      fs.writeFileSync(file, fixed)
      console.log(`Fixed CSS @apply statements in ${path.basename(file)}`)
    } else {
      console.log(`No changes needed in ${path.basename(file)}`)
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message)
  }
})
