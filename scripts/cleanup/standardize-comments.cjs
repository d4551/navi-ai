#!/usr/bin/env node

/**
 * Comment Standardizer
 * - Removes non-technical / promotional / emoji-heavy comments from source files
 * - Preserves TODO/FIXME/technical notes
 *
 * Usage:
 *   node scripts/cleanup/standardize-comments.cjs --dry   # preview
 *   node scripts/cleanup/standardize-comments.cjs --apply # write changes
 */

const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry') || !process.argv.includes('--apply')

const ROOT = process.cwd()
const GLOB_DIRS = ['src']
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue'])

// Phrases/markers considered non-technical; extend as needed
const NON_TECH_PHRASES = [
  'Hey! Listen',
  'Hyrule',
  'Zelda',
  'Breath-of-the-Hired',
  'Happy Mask Salesman',
  'gamified',
  'Easter Egg',
  'Sam & Max',
  'fun',
  'vibe',
  'cute',
  'magical',
]

// Quick emoji matcher (covers most common unicode emoji ranges)
const EMOJI_RX = /[\p{Emoji}\p{Extended_Pictographic}]/u

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (
        e.name === 'node_modules' ||
        e.name === 'dist' ||
        e.name.startsWith('.')
      )
        continue
      walk(p, out)
    } else if (EXTS.has(path.extname(e.name))) {
      out.push(p)
    }
  }
  return out
}

function sanitizeComments(code, file) {
  // Handle JS/TS/Vue by trimming line/block comments with non-technical phrases or emojis
  const lines = code.split(/\r?\n/)
  let changed = false
  const bannedRx = new RegExp(
    NON_TECH_PHRASES.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(
      '|'
    ),
    'i'
  )

  // Simple state for block comments
  let inBlock = false
  const out = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const trimmed = line.trim()

    // Start/end of block comments
    if (!inBlock && trimmed.startsWith('/*')) inBlock = true
    if (inBlock) {
      // If this block comment contains banned markers or emojis, drop the line
      if (bannedRx.test(line) || EMOJI_RX.test(line)) {
        changed = true
        continue
      }
      out.push(line)
      if (trimmed.endsWith('*/') || trimmed.includes('*/')) inBlock = false
      continue
    }

    // Line comments
    const idx = line.indexOf('//')
    if (idx !== -1) {
      const before = line.slice(0, idx)
      const comment = line.slice(idx + 2)
      const isTodo = /\b(TODO|FIXME|NOTE)\b/i.test(comment)
      if (!isTodo && (bannedRx.test(comment) || EMOJI_RX.test(comment))) {
        // Drop the comment but keep code before
        line = before.replace(/\s+$/, '')
        changed = true
      }
      out.push(line)
      continue
    }

    out.push(line)
  }

  const newCode = out.join('\n')
  return { newCode, changed }
}

function run() {
  let total = 0
  let modified = 0
  for (const base of GLOB_DIRS) {
    const abs = path.join(ROOT, base)
    if (!fs.existsSync(abs)) continue
    const files = walk(abs)
    for (const f of files) {
      total++
      const code = fs.readFileSync(f, 'utf8')
      const { newCode, changed } = sanitizeComments(code, f)
      if (changed) {
        modified++
        if (DRY) {
          console.log(
            `[DRY] Would clean non-technical comments: ${path.relative(ROOT, f)}`
          )
        } else {
          fs.writeFileSync(f, newCode, 'utf8')
          console.log(`[FIXED] Cleaned comments: ${path.relative(ROOT, f)}`)
        }
      }
    }
  }
  console.log(
    `\nProcessed ${total} files. ${modified} ${DRY ? 'would be ' : ''}modified.`
  )
}

run()
