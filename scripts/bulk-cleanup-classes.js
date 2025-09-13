#!/usr/bin/env node

/**
 * Bulk cleanup of conflicting CSS classes
 * Removes redundant Vuetify classes from all Vue files
 */

import fs from 'fs';
import { execSync } from 'child_process';

const CLEANUP_PATTERNS = [
  // Remove redundant Vuetify classes
  { from: /\sv-card\s+v-sheet\s+elevation-2/g, to: '' },
  { from: /\sv-card\s+v-sheet\s+elevation-1/g, to: '' },
  { from: /\sv-card\s+v-sheet\s+elevation-3/g, to: '' },
  { from: /\sv-card\s+v-sheet\s+elevation-4/g, to: '' },
  
  // Clean up spacing in class attributes
  { from: /class="([^"]*?)\s+\s+([^"]*?)"/g, to: 'class="$1 $2"' },
  { from: /class="\s+([^"]*?)"/g, to: 'class="$1"' },
  { from: /class="([^"]*?)\s+"/g, to: 'class="$1"' },
];

function findAllVueFiles() {
  try {
    const result = execSync('find . -name "*.vue" | grep -v node_modules', { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f && fs.existsSync(f));
  } catch (error) {
    console.error('Error finding Vue files:', error.message);
    return [];
  }
}

function cleanupFile() {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;

  // Apply all cleanup patterns
  for (const pattern of CLEANUP_PATTERNS) {
    const newContent = content.replace(pattern.from, pattern.to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🧹 Starting bulk cleanup of CSS classes...\n');
  
  const files = findAllVueFiles();
  console.log(`📁 Found ${files.length} Vue files to process\n`);
  
  let cleanedCount = 0;
  
  for (const file of files) {
    try {
      if (cleanupFile(file)) {
        cleanedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📊 Files processed: ${files.length}`);
  console.log(`🔧 Files modified: ${cleanedCount}`);
  
  if (cleanedCount > 0) {
    console.log('\n✨ All redundant Vuetify classes have been removed!');
    console.log('Your layout should now be clean and consistent.');
  } else {
    console.log('\n💚 No files needed cleanup - your codebase is already clean!');
  }
}

main();