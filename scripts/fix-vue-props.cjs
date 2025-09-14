#!/usr/bin/env node

/**
 * Vue.js Prop Default Fixer
 * Specifically fixes missing prop defaults and required prop issues
 */

const fs = require('fs');
const path = require('path');

class VuePropFixer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.fixCount = 0;
  }

  // Get all Vue files
  getVueFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        files.push(...this.getVueFiles(fullPath));
      } else if (item.endsWith('.vue')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Fix prop definitions
  fixProps(content) {
    let modified = false;

    // Prop configurations that need defaults
    const propConfigs = [
      { name: 'title', default: "''" },
      { name: 'subtitle', default: "''" },
      { name: 'icon', default: "''" },
      { name: 'titleIcon', default: "''" },
      { name: 'backgroundColor', default: "''" },
      { name: 'textColor', default: "''" },
      { name: 'statusBadge', default: 'null' },
      { name: 'heroStats', default: '() => []' },
      { name: 'headerContext', default: '() => ({})' },
      { name: 'stats', default: '() => ({})' },
      { name: 'actions', default: '() => []' },
      { name: 'matchData', default: '() => ({})' },
      { name: 'salaryData', default: '() => ({})' },
      { name: 'insightsData', default: '() => ({})' },
      { name: 'matchReasons', default: '() => []' },
      { name: 'userAvatar', default: "''" },
      { name: 'action', default: "''" },
      { name: 'context', default: '() => ({})' },
      { name: 'customHandler', default: 'null' },
      { name: 'loadingText', default: "''" },
      { name: 'successText', default: "''" },
      { name: 'errorText', default: "''" },
      { name: 'tooltip', default: "''" }
    ];

    for (const { name, default: defaultValue } of propConfigs) {
      // Pattern to match prop without default
      const regex = new RegExp(
        `(\\s*${name}:\\s*\\{[^}]*type:[^}]*?)(?!.*default:)(\\s*\\})`,
        'gi'
      );
      
      const newContent = content.replace(regex, `$1,\n    default: ${defaultValue}\n  $2`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        this.fixCount++;
      }
    }

    // Fix 'show' prop that should be optional
    const showRegex = /(show:\s*\{\s*type:\s*Boolean,?\s*default:\s*(false|true))(\s*\})/gi;
    const showReplacement = '$1,\n    required: false$3';
    
    const showFixed = content.replace(showRegex, showReplacement);
    if (showFixed !== content) {
      content = showFixed;
      modified = true;
      this.fixCount++;
    }

    return { content, modified };
  }

  // Process a single Vue file
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.fixProps(content);
      
      if (result.modified) {
        fs.writeFileSync(filePath, result.content, 'utf8');
        console.log(`✅ Fixed props in: ${path.relative(this.srcDir, filePath)}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  // Main execution
  run() {
    console.log('🔧 Fixing Vue.js prop defaults...\n');
    
    const files = this.getVueFiles(this.srcDir);
    let processedFiles = 0;

    for (const file of files) {
      if (this.processFile(file)) {
        processedFiles++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`• Total fixes applied: ${this.fixCount}`);
    console.log(`• Files modified: ${processedFiles}/${files.length}`);
    console.log('\n✨ Prop fixing completed!');
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new VuePropFixer();
  fixer.run();
}

module.exports = VuePropFixer;
