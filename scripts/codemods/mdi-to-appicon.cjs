#!/usr/bin/env node
/**
 * Codemod: Replace <i class="mdi mdi-foo [extra]"> with <AppIcon name="mdi-foo" class="[extra]" />
 * - Static class attributes and a few common :class patterns are supported.
 * - Only converts files that already support AppIcon safely:
 *    - Files using <script setup> (we'll inject import), or
 *    - Files that already contain <AppIcon> or an AppIcon import.
 *
 * Usage:
 *   node scripts/codemods/mdi-to-appicon.cjs --dry   # preview
 *   node scripts/codemods/mdi-to-appicon.cjs --apply # write changes
 */
const fs = require('fs')
const path = require('path')

// Accept optional directory arguments; default to src
const inputDirs = process.argv.filter((a) => !a.startsWith('--'))
  .slice(2) // skip node and script path
  .map((p) => path.resolve(process.cwd(), p))
const roots = inputDirs.length ? inputDirs : [path.resolve(__dirname, '../../src')]
const apply = process.argv.includes('--apply')
const dry = process.argv.includes('--dry') || !apply

const vueFiles = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.isFile() && p.endsWith('.vue')) vueFiles.push(p)
  }
}

function ensureAppIconImport(source) {
  const hasImport = /import\s+AppIcon\s+from\s+['"]@\/components\/ui\/AppIcon\.vue['"];?/.test(source)
  const usesAppIconTag = /<AppIcon\b/.test(source)
  if (hasImport || !usesAppIconTag) return source

  const scriptSetupIdx = source.indexOf('<script setup')
  if (scriptSetupIdx === -1) return source
  const scriptOpenEnd = source.indexOf('>', scriptSetupIdx)
  if (scriptOpenEnd === -1) return source
  const insertPos = scriptOpenEnd + 1
  const importLine = "\nimport AppIcon from '@/components/ui/AppIcon.vue'\n"
  return source.slice(0, insertPos) + importLine + source.slice(insertPos)
}

function fileSupportsAppIcon(source) {
  const hasImport = /import\s+AppIcon\s+from\s+['"]@\/components\/ui\/AppIcon\.vue['"];?/.test(source)
  const usesTag = /<AppIcon\b/.test(source)
  const hasScriptSetup = source.includes('<script setup')
  return hasImport || usesTag || hasScriptSetup
}

function transformFile(file) {
  let src = fs.readFileSync(file, 'utf8')
  if (!fileSupportsAppIcon(src)) {
    // Skip to avoid breaking non-setup SFCs without AppIcon registration
    return
  }

  let changed = false

  // Static: <i class="... mdi mdi-foo ..."></i>
  const rx = /<i([^>]*?)class="([^"]*\bmdi\b[^"]*)"([^>]*)><\/i>/g
  src = src.replace(rx, (match, pre, classContent, post) => {
    const classes = classContent.trim().split(/\s+/)
    const iconClass = classes.find((c) => c.startsWith('mdi-') && c !== 'mdi')
    if (!iconClass) return match
    const extra = classes.filter((c) => c !== 'mdi' && c !== iconClass).join(' ')
    let extraClasses = extra
    const preClass = pre.match(/class="([^"]*)"/)
    if (preClass) extraClasses = (extraClasses + ' ' + preClass[1]).trim()
    const postClass = post.match(/class="([^"]*)"/)
    if (postClass) extraClasses = (extraClasses + ' ' + postClass[1]).trim()
    const titleAttr = (pre + post).match(/title="([^"]*)"/)
    const ariaAttr = (pre + post).match(/aria-label="([^"]*)"/)
    const title = titleAttr ? ` title="${titleAttr[1]}"` : ''
    const aria = ariaAttr ? ` aria-label="${ariaAttr[1]}"` : ''
    const classAttr = extraClasses ? ` class="${extraClasses}"` : ''
    changed = true
    return `<AppIcon name="${iconClass}"${classAttr}${title}${aria} />`
  })

  // :class="'mdi mdi-foo'" or :class="\"mdi mdi-foo\""
  const rxBindSimple = /<i([^>]*?):class="(['"])mdi\s+mdi-([a-z0-9-]+)\2"([^>]*)><\/i>/gi
  src = src.replace(rxBindSimple, (_m, pre, _q, icon, post) => {
    let extraClasses = ''
    const preClass = pre.match(/class="([^"]*)"/)
    if (preClass) extraClasses = (extraClasses + ' ' + preClass[1]).trim()
    const postClass = post.match(/class="([^"]*)"/)
    if (postClass) extraClasses = (extraClasses + ' ' + postClass[1]).trim()
    const titleAttr = (pre + post).match(/title="([^"]*)"/)
    const ariaAttr = (pre + post).match(/aria-label="([^"]*)"/)
    const title = titleAttr ? ` title="${titleAttr[1]}"` : ''
    const aria = ariaAttr ? ` aria-label="${ariaAttr[1]}"` : ''
    const classAttr = extraClasses ? ` class="${extraClasses}"` : ''
    changed = true
    return `<AppIcon name="mdi-${icon}"${classAttr}${title}${aria} />`
  })

  // :class="['mdi','mdi-foo']"
  const rxBindArray = /<i([^>]*?):class="\s*\[\s*'mdi'\s*,\s*'mdi-([a-z0-9-]+)'\s*\]\s*"([^>]*)><\/i>/gi
  src = src.replace(rxBindArray, (_m, pre, icon, post) => {
    let extraClasses = ''
    const preClass = pre.match(/class="([^"]*)"/)
    if (preClass) extraClasses = (extraClasses + ' ' + preClass[1]).trim()
    const postClass = post.match(/class="([^"]*)"/)
    if (postClass) extraClasses = (extraClasses + ' ' + postClass[1]).trim()
    const classAttr = extraClasses ? ` class="${extraClasses}"` : ''
    changed = true
    return `<AppIcon name="mdi-${icon}"${classAttr} />`
  })

  // :class="`mdi mdi-foo`"
  const rxTpl = /<i([^>]*?):class="`mdi\s+mdi-([a-z0-9-]+)`"([^>]*)><\/i>/gi
  src = src.replace(rxTpl, (_m, pre, icon, post) => {
    let extraClasses = ''
    const preClass = pre.match(/class="([^"]*)"/)
    if (preClass) extraClasses = (extraClasses + ' ' + preClass[1]).trim()
    const postClass = post.match(/class="([^"]*)"/)
    if (postClass) extraClasses = (extraClasses + ' ' + postClass[1]).trim()
    const classAttr = extraClasses ? ` class="${extraClasses}"` : ''
    changed = true
    return `<AppIcon name="mdi-${icon}"${classAttr} />`
  })

  // Generic bound expression: class contains 'mdi' AND :class="EXPR"
  // Example: <i class="mdi other" :class="flow.status ? 'mdi-stop' : 'mdi-play'"></i>
  // Converts to: <AppIcon :name="flow.status ? 'mdi-stop' : 'mdi-play'" class="other" />
  const rxGenericExpr = /<i([^>]*?)class="([^"]*\bmdi\b[^"]*)"([^>]*?):class="([^"]+)"([^>]*)><\/i>/gi
  src = src.replace(rxGenericExpr, (_m, pre, classContent, mid, expr, post) => {
    // Extract static classes excluding 'mdi'
    const classes = classContent.trim().split(/\s+/)
    const extra = classes.filter((c) => c && c !== 'mdi' && !c.startsWith('mdi-')).join(' ')
    let extraClasses = extra
    const preClass = pre.match(/class="([^"]*)"/)
    if (preClass) extraClasses = (extraClasses + ' ' + preClass[1]).trim()
    const midClass = mid.match(/class="([^"]*)"/)
    if (midClass) extraClasses = (extraClasses + ' ' + midClass[1]).trim()
    const postClass = post.match(/class="([^"]*)"/)
    if (postClass) extraClasses = (extraClasses + ' ' + postClass[1]).trim()
    const titleAttr = (pre + mid + post).match(/title="([^"]*)"/)
    const ariaAttr = (pre + mid + post).match(/aria-label="([^"]*)"/)
    const title = titleAttr ? ` title="${titleAttr[1]}"` : ''
    const aria = ariaAttr ? ` aria-label="${ariaAttr[1]}"` : ''
    const classAttr = extraClasses ? ` class="${extraClasses}"` : ''
    changed = true
    return `<AppIcon :name="${expr}"${classAttr}${title}${aria} />`
  })

  // Flipped order: :class appears before static class containing 'mdi'
  // Example: <i :class="expr" class="mdi other"></i>
  const rxGenericExprFlip = /<i([^>]*?):class="([^"]+)"([^>]*?)class="([^"]*\bmdi\b[^"]*)"([^>]*)><\/i>/gi
  src = src.replace(rxGenericExprFlip, (_m, pre, expr, mid, classContent, post) => {
    const classes = classContent.trim().split(/\s+/)
    const extra = classes.filter((c) => c && c !== 'mdi' && !c.startsWith('mdi-')).join(' ')
    let extraClasses = extra
    const preClass = pre.match(/class="([^"]*)"/)
    if (preClass) extraClasses = (extraClasses + ' ' + preClass[1]).trim()
    const midClass = mid.match(/class="([^"]*)"/)
    if (midClass) extraClasses = (extraClasses + ' ' + midClass[1]).trim()
    const postClass = post.match(/class="([^"]*)"/)
    if (postClass) extraClasses = (extraClasses + ' ' + postClass[1]).trim()
    const titleAttr = (pre + mid + post).match(/title="([^"]*)"/)
    const ariaAttr = (pre + mid + post).match(/aria-label="([^"]*)"/)
    const title = titleAttr ? ` title="${titleAttr[1]}"` : ''
    const aria = ariaAttr ? ` aria-label="${ariaAttr[1]}"` : ''
    const classAttr = extraClasses ? ` class="${extraClasses}"` : ''
    changed = true
    return `<AppIcon :name="${expr}"${classAttr}${title}${aria} />`
  })

  if (changed) {
    src = ensureAppIconImport(src)
    if (dry) console.log(`[DRY] Would update: ${path.relative(process.cwd(), file)}`)
    else {
      fs.writeFileSync(file, src, 'utf8')
      console.log(`Updated: ${path.relative(process.cwd(), file)}`)
    }
  }
}

roots.forEach(walk)
vueFiles.forEach(transformFile)
console.log(`\nMDI codemod complete. Files scanned: ${vueFiles.length}. Mode: ${apply ? 'APPLY' : 'DRY'}`)

