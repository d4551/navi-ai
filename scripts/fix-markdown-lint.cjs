#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Fix Markdown Lint Issues Script
 * Automatically fixes common markdown lint issues like:
 * - MD022: Missing blank lines around headings
 * - MD026: Trailing punctuation in headings
 * - MD032: Missing blank lines around lists
 * - MD031: Missing blank lines around fenced code blocks
 * - MD040: Missing language specification for fenced code blocks
 * - MD009: Trailing spaces
 * - MD036: Emphasis used instead of heading
 */

function fixMarkdownFile(filePath) {
  console.log(`📝 Fixing markdown file: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    return false
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let originalContent = content
  let fixCount = 0

  // MD009: Remove trailing spaces
  const beforeTrailing = content
  content = content.replace(/[ \t]+$/gm, '')
  if (content !== beforeTrailing) {
    fixCount++
    console.log('  ✅ Fixed trailing spaces (MD009)')
  }

  // MD026: Remove trailing punctuation from headings
  const beforePunctuation = content
  content = content.replace(/^(#{1,6}\s+.*?)[:!?.,;]+\s*$/gm, '$1')
  if (content !== beforePunctuation) {
    fixCount++
    console.log('  ✅ Fixed trailing punctuation in headings (MD026)')
  }

  // MD040: Add language to fenced code blocks without language
  const beforeCodeBlocks = content
  content = content.replace(/^```\s*$/gm, '```text')
  if (content !== beforeCodeBlocks) {
    fixCount++
    console.log('  ✅ Added language to fenced code blocks (MD040)')
  }

  // Split into lines for more complex fixes
  let lines = content.split('\n')

  // MD022: Add blank lines around headings
  // MD032: Add blank lines around lists
  // MD031: Add blank lines around fenced code blocks
  let newLines = []
  let modified = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prevLine = i > 0 ? lines[i - 1] : ''
    const nextLine = i < lines.length - 1 ? lines[i + 1] : ''

    // Check if current line is a heading
    const isHeading = /^#{1,6}\s/.test(line)

    // Check if current line is a list item
    const isList = /^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line)

    // Check if current line is a fenced code block start/end
    const isCodeFence = /^```/.test(line)

    // Add blank line before heading if needed (MD022)
    if (
      isHeading &&
      prevLine &&
      prevLine.trim() !== '' &&
      !prevLine.startsWith('#')
    ) {
      newLines.push('')
      modified = true
    }

    // Add blank line before list if needed (MD032)
    if (
      isList &&
      prevLine &&
      prevLine.trim() !== '' &&
      !(/^[\s]*[-*+]\s/.test(prevLine) || /^[\s]*\d+\.\s/.test(prevLine))
    ) {
      newLines.push('')
      modified = true
    }

    // Add blank line before code fence if needed (MD031)
    if (isCodeFence && prevLine && prevLine.trim() !== '') {
      newLines.push('')
      modified = true
    }

    newLines.push(line)

    // Add blank line after heading if needed (MD022)
    if (
      isHeading &&
      nextLine &&
      nextLine.trim() !== '' &&
      !nextLine.startsWith('#')
    ) {
      newLines.push('')
      modified = true
    }

    // Add blank line after list if needed (MD032)
    if (
      isList &&
      nextLine &&
      nextLine.trim() !== '' &&
      !(/^[\s]*[-*+]\s/.test(nextLine) || /^[\s]*\d+\.\s/.test(nextLine))
    ) {
      newLines.push('')
      modified = true
    }

    // Add blank line after code fence if needed (MD031)
    if (
      isCodeFence &&
      nextLine &&
      nextLine.trim() !== '' &&
      !nextLine.startsWith('```')
    ) {
      newLines.push('')
      modified = true
    }
  }

  if (modified) {
    content = newLines.join('\n')
    fixCount++
    console.log(
      '  ✅ Added blank lines around headings/lists/code blocks (MD022/MD032/MD031)'
    )
  }

  // MD036: Convert emphasis to proper headings if they're standalone
  const beforeEmphasis = content
  content = content.replace(/^\*\*(.*?)\*\*\s*$/gm, (match, text) => {
    // Convert emphasis to heading if it looks like a heading
    if (text.length < 50 && !text.includes('.') && !text.includes(',')) {
      return `### ${text}`
    }
    return match
  })
  if (content !== beforeEmphasis) {
    fixCount++
    console.log('  ✅ Fixed emphasis used as headings (MD036)')
  }

  // Remove excessive blank lines (more than 2 consecutive)
  content = content.replace(/\n{3,}/g, '\n\n')

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(
      `✅ Fixed ${fixCount} markdown issues in ${path.basename(filePath)}`
    )
    return true
  } else {
    console.log(`✅ No markdown issues found in ${path.basename(filePath)}`)
    return false
  }
}

// Main execution
const targetFile = process.argv[2] || '/workspaces/navi2/ESLINT_FIX_COMPLETE.md'

console.log('🎯 Markdown Lint Fixer')
console.log('=======================')

const result = fixMarkdownFile(targetFile)

if (result) {
  console.log('\n🎉 Markdown file successfully fixed!')
  console.log('\n📋 Recommended: Run a markdown linter to verify fixes')
} else {
  console.log('\n📝 Markdown file was already clean or no changes needed')
}
