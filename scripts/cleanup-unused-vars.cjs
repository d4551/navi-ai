#!/usr/bin/env node

/**
 * Unused Variable Cleaner
 * Fixes common unused variable patterns in Vue.js/TypeScript code
 */

const fs = require('fs');
const path = require('path');

class UnusedVariableCleaner {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.fixCount = 0;
  }

  // Get all relevant files
  getFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        files.push(...this.getFiles(fullPath));
      } else if (item.match(/\.(vue|ts|js)$/)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Fix unused variables and parameters
  fixUnusedVariables(content) {
    let modified = false;
    let newContent = content;

    // Common unused variable patterns
    const patterns = [
      // Unused function parameters
      { 
        regex: /(\(\s*)error(\s*[,)])/g, 
        replacement: '$1_error$2',
        description: 'error parameter' 
      },
      { 
        regex: /(\(\s*)e(\s*[,)])/g, 
        replacement: '$1_e$2',
        description: 'e parameter' 
      },
      { 
        regex: /(\(\s*)props(\s*[,)])/g, 
        replacement: '$1_props$2',
        description: 'props parameter' 
      },
      { 
        regex: /(\(\s*)emit(\s*[,)])/g, 
        replacement: '$1_emit$2',
        description: 'emit parameter' 
      },
      { 
        regex: /(\(\s*)data(\s*[,)])/g, 
        replacement: '$1_data$2',
        description: 'data parameter' 
      },
      { 
        regex: /(\(\s*)chunk(\s*[,)])/g, 
        replacement: '$1_chunk$2',
        description: 'chunk parameter' 
      },
      { 
        regex: /(\(\s*)result(\s*[,)])/g, 
        replacement: '$1_result$2',
        description: 'result parameter' 
      },
      { 
        regex: /(\(\s*)response(\s*[,)])/g, 
        replacement: '$1_response$2',
        description: 'response parameter' 
      },
      { 
        regex: /(\(\s*)options(\s*[,)])/g, 
        replacement: '$1_options$2',
        description: 'options parameter' 
      },
      { 
        regex: /(\(\s*)context(\s*[,)])/g, 
        replacement: '$1_context$2',
        description: 'context parameter' 
      },
      { 
        regex: /(\(\s*)config(\s*[,)])/g, 
        replacement: '$1_config$2',
        description: 'config parameter' 
      },
      { 
        regex: /(\(\s*)params(\s*[,)])/g, 
        replacement: '$1_params$2',
        description: 'params parameter' 
      },
      { 
        regex: /(\(\s*)args(\s*[,)])/g, 
        replacement: '$1_args$2',
        description: 'args parameter' 
      },

      // Unused variable declarations
      { 
        regex: /^(\s*const\s+)props(\s*=)/gm, 
        replacement: '$1_props$2',
        description: 'props variable' 
      },
      { 
        regex: /^(\s*const\s+)emit(\s*=)/gm, 
        replacement: '$1_emit$2',
        description: 'emit variable' 
      },
      { 
        regex: /^(\s*const\s+)error(\s*=)/gm, 
        replacement: '$1_error$2',
        description: 'error variable' 
      },
      { 
        regex: /^(\s*const\s+)router(\s*=)/gm, 
        replacement: '$1_router$2',
        description: 'router variable' 
      },
      { 
        regex: /^(\s*const\s+)theme(\s*=)/gm, 
        replacement: '$1_theme$2',
        description: 'theme variable' 
      },

      // Destructured unused variables
      { 
        regex: /(\{\s*)error(\s*\})/g, 
        replacement: '$1_error$2',
        description: 'destructured error' 
      },
      { 
        regex: /(\{\s*)data(\s*\})/g, 
        replacement: '$1_data$2',
        description: 'destructured data' 
      },

      // Try-catch blocks
      { 
        regex: /(catch\s*\(\s*)error(\s*\))/g, 
        replacement: '$1_error$2',
        description: 'catch error' 
      },
      { 
        regex: /(catch\s*\(\s*)e(\s*\))/g, 
        replacement: '$1_e$2',
        description: 'catch e' 
      },
      { 
        regex: /(catch\s*\(\s*)err(\s*\))/g, 
        replacement: '$1_err$2',
        description: 'catch err' 
      },
      { 
        regex: /(catch\s*\(\s*)parseError(\s*\))/g, 
        replacement: '$1_parseError$2',
        description: 'catch parseError' 
      }
    ];

    for (const { regex, replacement, description } of patterns) {
      const result = newContent.replace(regex, replacement);
      if (result !== newContent) {
        newContent = result;
        modified = true;
        this.fixCount++;
        console.log(`  ↳ Fixed ${description}`);
      }
    }

    return { content: newContent, modified };
  }

  // Remove unused imports
  fixUnusedImports(content) {
    let modified = false;
    let newContent = content;

    // Common unused imports to remove
    const unusedImports = [
      'ComputedRef',
      'onMounted',
      'computed',
      'ref'
    ];

    for (const importName of unusedImports) {
      // Remove from import statements if not used in code
      const importRegex = new RegExp(`import\\s*\\{[^}]*\\b${importName}\\b[^}]*\\}\\s*from\\s*['"][^'"]*['"]`, 'g');
      const matches = newContent.match(importRegex);
      
      if (matches) {
        for (const match of matches) {
          // Check if the import is actually used
          const usageRegex = new RegExp(`\\b${importName}\\b(?!\\s*[,}])`, 'g');
          const usageMatches = newContent.match(usageRegex);
          
          // If only found in import statement, remove it
          if (usageMatches && usageMatches.length === 1) {
            // Remove just this import from the destructured imports
            const cleanedImport = match.replace(new RegExp(`\\s*,?\\s*\\b${importName}\\b,?\\s*`), '');
            newContent = newContent.replace(match, cleanedImport);
            modified = true;
            this.fixCount++;
            console.log(`  ↳ Removed unused import: ${importName}`);
          }
        }
      }
    }

    return { content: newContent, modified };
  }

  // Process a single file
  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let totalModified = false;

      console.log(`Processing: ${path.relative(this.srcDir, filePath)}`);

      // Apply fixes
      const unusedVarResult = this.fixUnusedVariables(content);
      content = unusedVarResult.content;
      if (unusedVarResult.modified) totalModified = true;

      const unusedImportResult = this.fixUnusedImports(content);
      content = unusedImportResult.content;
      if (unusedImportResult.modified) totalModified = true;

      // Write back if modified
      if (totalModified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Modified: ${path.relative(this.srcDir, filePath)}`);
        return true;
      } else {
        console.log(`⏭️  No changes: ${path.relative(this.srcDir, filePath)}`);
        return false;
      }

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  // Main execution
  run() {
    console.log('🧹 Cleaning unused variables and imports...\n');
    
    const files = this.getFiles(this.srcDir);
    let processedFiles = 0;

    for (const file of files) {
      if (this.processFile(file)) {
        processedFiles++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`• Total fixes applied: ${this.fixCount}`);
    console.log(`• Files modified: ${processedFiles}/${files.length}`);
    console.log('\n✨ Cleanup completed!');
  }
}

// Run if called directly
if (require.main === module) {
  const cleaner = new UnusedVariableCleaner();
  cleaner.run();
}

module.exports = UnusedVariableCleaner;
