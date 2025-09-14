#!/usr/bin/env node
/**
 * Codemod: Normalize legacy 'mdi mdi-*' icon strings to 'mdi-*'
 *
 * What it updates:
 * - Vue attributes like icon/leading-icon/trailing-icon/start-icon/end-icon and Vuetify props (prepend-icon/append-icon)
 * - Bound attributes like :icon="'mdi mdi-foo'"
 * - JS/TS object fields: icon, leadingIcon, trailingIcon, startIcon, endIcon
 *
 * What it DOES NOT change:
 * - class="mdi mdi-foo" on <i> tags or any class attributes (handled by a separate codemod)
 *
 * Usage:
 *   node scripts/codemods/mdi-string-normalize.cjs --dry   # preview
 *   node scripts/codemods/mdi-string-normalize.cjs --apply # write changes
 */
const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '../../src')
const apply = process.argv.includes('--apply')
const dry = process.argv.includes('--dry') || !apply

const exts = new Set(['.vue', '.js', '.ts', '.cjs', '.mjs'])
const files = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      walk(p)
    } else if (e.isFile() && exts.has(path.extname(p))) {
      files.push(p)
    }
  }
}

// Regex patterns
// 1) HTML attributes (unbound): icon="mdi mdi-foo"
const rxHtmlAttr = /(\b(?:icon|leading-icon|trailing-icon|start-icon|end-icon|prepend-icon|append-icon)\s*=\s*["'])mdi\s+mdi-([a-z0-9-]+)(["'])/gi

// 2) HTML bound attributes: :icon="'mdi mdi-foo'" or :icon="\"mdi mdi-foo\""
const rxHtmlBoundAttr = /(\b:?(?:icon|leading-icon|trailing-icon|start-icon|end-icon|prepend-icon|append-icon)\s*=\s*"[^"']*)(['"])mdi\s+mdi-([a-z0-9-]+)\2([^"']*")/gi

// 3) JS object fields: icon: 'mdi mdi-foo' or "icon": "mdi mdi-foo"
const rxJsField = /(\b(?:icon|leadingIcon|trailingIcon|startIcon|endIcon)\s*:\s*["'])mdi\s+mdi-([a-z0-9-]+)(["'])/g

// 4) Generic assignments in Vue SFC script blocks for kebab-case keys in objects (e.g., { 'leading-icon': 'mdi mdi-foo' })
const rxJsKebabField = /(\b['"](?:icon|leading-icon|trailing-icon|start-icon|end-icon|prepend-icon|append-icon)['"]\s*:\s*["'])mdi\s+mdi-([a-z0-9-]+)(["'])/g

function transform(source) {
  let out = source
  let changed = false

  const replaceHtmlAttr = (match, pre, name, post) => {
    changed = true
    return `${pre}mdi-${name}${post}`
  }

  const replaceHtmlBoundAttr = (match, pre, quote, name, post) => {
    changed = true
    return `${pre}${quote}mdi-${name}${quote}${post}`
  }

  const replaceJsField = (match, pre, name, post) => {
    changed = true
    return `${pre}mdi-${name}${post}`
  }

  out = out.replace(rxHtmlAttr, replaceHtmlAttr)
  out = out.replace(rxHtmlBoundAttr, replaceHtmlBoundAttr)
  out = out.replace(rxJsField, replaceJsField)
  out = out.replace(rxJsKebabField, replaceJsField)

  return { out, changed }
}

walk(rootDir)

let updated = 0
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const { out, changed } = transform(src)
  if (changed) {
    if (dry) {
      console.log(`[DRY] Would update: ${path.relative(process.cwd(), file)}`)
    } else {
      fs.writeFileSync(file, out, 'utf8')
      console.log(`Updated: ${path.relative(process.cwd(), file)}`)
    }
    updated++
  }
}

console.log(`\nMDI string normalization complete. Files scanned: ${files.length}. Files with changes: ${updated}. Mode: ${apply ? 'APPLY' : 'DRY'}`)
