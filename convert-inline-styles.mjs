#!/usr/bin/env node

/**
 * Convert inline styles to Tailwind utility classes
 * Focuses on CSS custom properties that map to Tailwind tokens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of CSS custom properties to Tailwind classes
const customPropToTailwind = {
  'var(--spacing-lg)': 'p-6',
  'var(--spacing-md)': 'p-4',
  'var(--spacing-sm)': 'p-2',
  'var(--color-background)': 'bg-background',
  'var(--color-surface)': 'bg-surface',
  'var(--color-on-surface)': 'text-text-primary',
  'var(--color-gray-600)': 'text-text-secondary',
  'var(--color-gray-200)': 'border-gray-200',
  'var(--font-family-primary)': 'font-sans',
  'var(--font-weight-medium)': 'font-medium',
  'var(--font-weight-semibold)': 'font-semibold',
};

// Common inline style patterns to Tailwind
const inlinePatterns = [
  // Complex multi-property styles
  {
    pattern: /:style="\{\s*padding:\s*'var\(--spacing-lg\)',?\s*backgroundColor:\s*'var\(--color-background\)'\s*\}"/g,
    replacement: 'class="p-6 bg-background"'
  },
  {
    pattern: /:style="\{\s*backgroundColor:\s*'var\(--color-surface\)',?\s*borderBottom:\s*'1px solid var\(--color-gray-200\)',?\s*padding:\s*'var\(--spacing-lg\)',?\s*fontFamily:\s*'var\(--font-family-primary\)'\s*\}"/g,
    replacement: 'class="bg-surface border-b border-gray-200 p-6 font-sans"'
  },
  {
    pattern: /:style="\{\s*color:\s*'var\(--color-on-surface\)',?\s*fontFamily:\s*'var\(--font-family-primary\)',?\s*fontWeight:\s*'var\(--font-weight-medium\)'\s*\}"/g,
    replacement: 'class="text-text-primary font-sans font-medium"'
  },
  // Single property styles
  {
    pattern: /:style="\{\s*color:\s*'var\(--color-gray-600\)'\s*\}"/g,
    replacement: 'class="text-text-secondary"'
  },
  {
    pattern: /:style="\{\s*color:\s*'var\(--color-on-surface\)'\s*\}"/g,
    replacement: 'class="text-text-primary"'
  },
  {
    pattern: /:style="\{\s*padding:\s*'var\(--spacing-lg\)'\s*\}"/g,
    replacement: 'class="p-6"'
  },
  {
    pattern: /:style="\{\s*backgroundColor:\s*'var\(--color-surface\)'\s*\}"/g,
    replacement: 'class="bg-surface"'
  },
  {
    pattern: /:style="\{\s*fontFamily:\s*'var\(--font-family-primary\)'\s*\}"/g,
    replacement: 'class="font-sans"'
  },
  {
    pattern: /:style="\{\s*fontWeight:\s*'var\(--font-weight-medium\)'\s*\}"/g,
    replacement: 'class="font-medium"'
  },
  {
    pattern: /:style="\{\s*fontSize:\s*'var\(--font-size-sm\)'\s*\}"/g,
    replacement: 'class="text-sm"'
  },
  // Background image patterns (leave dynamic, but clean up simple ones)
  {
    pattern: /style="background-image:\s*none;?"/g,
    replacement: 'class="bg-none"'
  },
  // Computed styles with simple patterns
  {
    pattern: /style="([^"]*width:\s*\d+px[^"]*)"/g,
    replacement: (match, styles) => {
      // Extract width and convert to Tailwind
      const widthMatch = styles.match(/width:\s*(\d+)px/);
      if (widthMatch) {
        const width = parseInt(widthMatch[1]);
        if (width <= 16) return 'class="w-4"';
        if (width <= 20) return 'class="w-5"';
        if (width <= 24) return 'class="w-6"';
        if (width <= 32) return 'class="w-8"';
        if (width <= 48) return 'class="w-12"';
        if (width <= 64) return 'class="w-16"';
        if (width <= 96) return 'class="w-24"';
        return `class="w-[${width}px]"`;
      }
      return match;
    }
  }
];

// Dynamic style patterns that should use Tailwind arbitrary values
const dynamicPatterns = [
  {
    pattern: /:style="`width: \$\{([^}]+)\}%`"/g,
    replacement: ':class="`w-[${$1}%]`"'
  }
];

function convertFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply pattern replacements
  inlinePatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Apply dynamic patterns
  dynamicPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Remove empty style attributes
  const emptyStylePattern = /\s*:?style="\{\s*\}"/g;
  if (emptyStylePattern.test(content)) {
    content = content.replace(emptyStylePattern, '');
    modified = true;
  }

  // Merge adjacent class attributes
  content = content.replace(/class="([^"]*)"(\s+)class="([^"]*)"/g, 'class="$1 $3"');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
  
  return modified;
}

function processDirectory(dir, extensions = ['.vue']) {
  const files = fs.readdirSync(dir);
  let totalModified = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      totalModified += processDirectory(fullPath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      if (convertFile(fullPath)) {
        totalModified++;
      }
    }
  }
  
  return totalModified;
}

function main() {
  const projectRoot = process.cwd();
  const srcDir = path.join(projectRoot, 'src');
  
  console.log('🚀 Converting inline styles to Tailwind classes...\n');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }
  
  const modified = processDirectory(srcDir);
  
  console.log(`\n✨ Conversion complete! Modified ${modified} files.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}