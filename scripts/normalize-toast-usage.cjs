#!/usr/bin/env node
// Normalize toast usage across the repo
// - Replace `import { useToast } from "vue-toast-notification"` with our composable
// - Replace `const toast = useToast()` with `const { toast } = useToast()`

const fs = require('fs');
const path = require('path');

const exts = new Set(['.js', '.ts', '.vue']);

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'coverage') continue;
      yield* walk(p);
    } else if (exts.has(path.extname(e.name))) {
      yield p;
    }
  }
}

function normalize(file) {
  let text = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace direct 3rd-party imports with our composable
  const importRe = /import\s+\{\s*useToast\s*\}\s+from\s+["']vue-toast-notification["'];?/g;
  if (importRe.test(text)) {
    text = text.replace(importRe, 'import { useToast } from "@/composables/useToast";');
    changed = true;
  }

  // Replace `const toast = useToast();` with destructured version
  // Avoid replacing if already destructured on same line
  const callRe = /(const\s+)(toast)(\s*=\s*useToast\s*\(\s*\)\s*;)/g;
  if (callRe.test(text)) {
    text = text.replace(callRe, '$1{ toast }$3');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Updated:', file);
  }
}

const root = path.resolve(__dirname, '..');
for (const file of walk(path.join(root, 'src'))) {
  normalize(file);
}

console.log('Toast normalization complete.');

