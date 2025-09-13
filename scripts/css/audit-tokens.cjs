#!/usr/bin/env node

/**
 * CSS Token Audit
 * - Scans src/styles/*.css for CSS custom properties (variables)
 * - Reports duplicates and conflicts across files
 *
 * Usage: node scripts/css/audit-tokens.cjs > CSS_TOKEN_AUDIT.json
 */

const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src', 'styles');
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.css'))
  : [];

const tokenMap = new Map(); // name -> [{file, value, line}]

for (const file of files) {
  const full = path.join(dir, file);
  const text = fs.readFileSync(full, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const m = line.match(/(--[a-zA-Z0-9\-]+)\s*:\s*([^;]+);/);
    if (m) {
      const name = m[1].trim();
      const value = m[2].trim();
      if (!tokenMap.has(name)) tokenMap.set(name, []);
      tokenMap.get(name).push({ file, value, line: idx + 1 });
    }
  });
}

const duplicates = [];
for (const [name, defs] of tokenMap.entries()) {
  if (defs.length > 1) {
    const distinctVals = Array.from(new Set(defs.map((d) => d.value)));
    duplicates.push({ name, count: defs.length, distinctValues: distinctVals, definitions: defs });
  }
}

const report = {
  summary: {
    files: files.length,
    tokens: tokenMap.size,
    duplicates: duplicates.length,
  },
  duplicates: duplicates.sort((a, b) => b.count - a.count),
};

process.stdout.write(JSON.stringify(report, null, 2));

