#!/usr/bin/env node
/**
 * Codemod: Map legacy card header/body to section helpers and add section-card to glass-card wrappers.
 *
 * - Adds `section-card` to any class attribute that contains `glass-card` (idempotent)
 * - Adds `section-header` to any class attribute that contains `card-header` (idempotent)
 * - Adds `section-body` to any class attribute that contains `card-body` (idempotent)
 *
 * Usage:
 *   node scripts/codemods/card-to-section-helpers.cjs --dry   # preview changes
 *   node scripts/codemods/card-to-section-helpers.cjs --apply # write changes
 */

const fs = require('fs');
const path = require('path');

const argDirIdx = process.argv.indexOf('--dir');
const ROOT = argDirIdx > -1 && process.argv[argDirIdx + 1]
  ? path.resolve(process.cwd(), process.argv[argDirIdx + 1])
  : path.resolve(process.cwd(), 'src');
const APPLY = process.argv.includes('--apply');
const DRY = process.argv.includes('--dry') || !APPLY;

/** Recursively collect .vue files under a directory */
function collectVueFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectVueFiles(p));
    else if (entry.isFile() && p.endsWith('.vue')) out.push(p);
  }
  return out;
}

function transform(content) {
  let changed = false;
  let next = content;

  // Add section-card to glass-card wrappers
  next = next.replace(/class=("|')(.*?)\1/g, (m, q, classes) => {
    let cls = classes;
    if (/\bglass-card\b/.test(cls) && !/\bsection-card\b/.test(cls)) {
      cls = cls.replace(/\bglass-card\b/, 'glass-card section-card');
      changed = true;
    }
    // Add section-header to card-header
    if (/\bcard-header\b/.test(cls) && !/\bsection-header\b/.test(cls)) {
      cls = cls.replace(/\bcard-header\b/, 'card-header section-header');
      changed = true;
    }
    // Add section-body to card-body
    if (/\bcard-body\b/.test(cls) && !/\bsection-body\b/.test(cls)) {
      cls = cls.replace(/\bcard-body\b/, 'card-body section-body');
      changed = true;
    }
    return `class=${q}${cls}${q}`;
  });

  return { changed, next };
}

function run() {
  if (!fs.existsSync(ROOT)) {
    console.error(`[codemod] Directory not found: ${ROOT}`);
    process.exit(DRY ? 0 : 1);
  }
  const files = collectVueFiles(ROOT);
  let modified = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const { changed, next } = transform(src);
    if (changed) {
      modified += 1;
      if (DRY) {
        console.log(`[DRY] would modify: ${path.relative(process.cwd(), file)}`);
      } else {
        fs.writeFileSync(file, next, 'utf8');
        console.log(`[APPLY] modified: ${path.relative(process.cwd(), file)}`);
      }
    }
  }
  console.log(`\n${DRY ? '[DRY]' : '[APPLY]'} Completed. Files ${DRY ? 'to modify' : 'modified'}: ${modified}`);
}

run();
