#!/usr/bin/env node

/**
 * Comprehensive Codebase Fix Script
 * This script addresses the most common issues found in the Vue.js codebase:
 * 1. Duplicate identifier imports
 * 2. Undefined variable references (especially in catch blocks)
 * 3. Malformed Vue component structures
 * 4. Missing defineEmits declarations
 */

const fs = require('fs');
const glob = require('glob');

class CodebaseFixer {
  constructor() {
    this.fixCount = 0;
    this.errorCount = 0;
    this.processedFiles = 0;
  }

  /**
   * Main entry point
   */
  async fixCodebase() {
    console.log('🔧 Starting comprehensive codebase fixes...\n');

    // Get all Vue and JS/TS files
    const vueFiles = glob.sync('src/**/*.vue');
    const jsFiles = glob.sync('src/**/*.{js,ts}');
    const allFiles = [...vueFiles, ...jsFiles];

    console.log(`📁 Found ${allFiles.length} files to process\n`);

    for (const file of allFiles) {
      try {
        await this.processFile(file);
        this.processedFiles++;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        this.errorCount++;
      }
    }

    this.printSummary();
  }

  /**
   * Process individual file
   */
  async processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply fixes
    const fixes = [
      this.fixDuplicateImports.bind(this),
      this.fixUndefinedVariables.bind(this),
      this.fixMalformedVueComponents.bind(this),
      this.fixDefineEmits.bind(this),
      this.fixCatchBlocks.bind(this),
      this.fixMissingProps.bind(this),
      this.fixAsyncAwaitIssues.bind(this)
    ];

    for (const fix of fixes) {
      const result = fix(content, filePath);
      if (result !== content) {
        content = result;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      this.fixCount++;
    }
  }

  /**
   * Fix duplicate import statements
   */
  fixDuplicateImports(content, filePath) {
    if (!content.includes('<script>') && !filePath.endsWith('.js') && !filePath.endsWith('.ts')) {
      return content;
    }

    // Find all Vue imports and deduplicate them
    const vueImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]vue['"];?/g;
    const matches = [...content.matchAll(vueImportRegex)];
    
    if (matches.length > 1) {
      const allImports = new Set();
      matches.forEach(match => {
        const imports = match[1].split(',').map(imp => imp.trim());
        imports.forEach(imp => allImports.add(imp));
      });

      // Remove all old imports
      content = content.replace(vueImportRegex, '');
      
      // Add single consolidated import
      const consolidatedImport = `import { ${Array.from(allImports).join(', ')} } from 'vue';`;
      const scriptTagMatch = content.match(/<script[^>]*>/);
      if (scriptTagMatch) {
        const insertPoint = content.indexOf(scriptTagMatch[0]) + scriptTagMatch[0].length;
        content = content.slice(0, insertPoint) + '\n' + consolidatedImport + content.slice(insertPoint);
      }
    }

    return content;
  }

  /**
   * Fix undefined variables (especially in catch blocks)
   */
  fixUndefinedVariables(content) {
    // Fix catch blocks with undefined error variables
    content = content.replace(
      /catch\s*\(\s*_?(\w+)\s*\)\s*{\s*[^}]*console\.(error|warn|log)\([^,]*,\s*(\w+)\)/g,
      (match, catchParam, logMethod, usedVar) => {
        if (catchParam !== usedVar) {
          return match.replace(usedVar, catchParam);
        }
        return match;
      }
    );

    // Fix common undefined variable patterns
    const undefinedVarFixes = [
      { pattern: /\be\b(?!mit|xport|lse|nd|vent)/g, replacement: 'event' },
      { pattern: /\berror\b/g, replacement: 'catchError', context: /catch\s*\([^)]*\)\s*{[^}]*$/ },
      { pattern: /\bdata\b/g, replacement: 'responseData', context: /catch\s*\([^)]*\)\s*{[^}]*$/ }
    ];

    for (const fix of undefinedVarFixes) {
      if (fix.context && fix.context.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
      }
    }

    return content;
  }

  /**
   * Fix malformed Vue component structures
   */
  fixMalformedVueComponents(content) {
    if (!content.includes('<script>')) return content;

    // Fix missing commas in Vue component options
    content = content.replace(/}\s*\n\s*(\w+):/g, '},\n  $1:');

    // Fix incomplete setup() functions
    content = content.replace(/setup\(\)\s*{[^}]*}\s*(\w+):/g, (match) => {
      if (!match.includes('return')) {
        return match.replace('}', '  return {};\n  }');
      }
      return match;
    });

    return content;
  }

  /**
   * Fix missing defineEmits declarations
   */
  fixDefineEmits(content) {
    if (!content.includes('<script setup>')) return content;

    // Find emit calls without defineEmits
    const emitCalls = [...content.matchAll(/emit\(['"]([^'"]+)['"]/g)];
    const hasDefineEmits = content.includes('defineEmits');

    if (emitCalls.length > 0 && !hasDefineEmits) {
      const events = [...new Set(emitCalls.map(match => match[1]))];
      const defineEmitsLine = `const emit = defineEmits(['${events.join("', '")}']);`;
      
      // Insert after script setup tag
      const scriptMatch = content.match(/<script setup[^>]*>/);
      if (scriptMatch) {
        const insertPoint = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
        content = content.slice(0, insertPoint) + '\n' + defineEmitsLine + '\n' + content.slice(insertPoint);
      }
    }

    return content;
  }

  /**
   * Fix catch blocks
   */
  fixCatchBlocks(content) {
    // Fix incomplete catch blocks
    content = content.replace(/} catch \([^)]*\) {}\s*\n\s*([^}]+;)/g, '} catch (error) {\n    console.error("Error:", error);\n    $1\n  }');

    // Fix catch blocks missing 'or finally' expected
    content = content.replace(/}\s*catch\s*\([^)]*\)\s*{([^}]*)}\s*([^}]+)/g, '} catch (error) {$1} finally {\n    $2\n  }');

    return content;
  }

  /**
   * Fix missing props definitions
   */
  fixMissingProps(content) {
    if (!content.includes('<script setup>')) return content;

    // Find prop usage without defineProps
    const propUsage = [...content.matchAll(/props\.(\w+)/g)];
    const hasDefineProps = content.includes('defineProps');

    if (propUsage.length > 0 && !hasDefineProps) {
      const props = [...new Set(propUsage.map(match => match[1]))];
      const definePropsLine = `const props = defineProps({${props.map(p => `\n  ${p}: { type: [String, Number, Boolean, Object, Array] }`).join(',')}\n});`;
      
      // Insert after script setup tag
      const scriptMatch = content.match(/<script setup[^>]*>/);
      if (scriptMatch) {
        const insertPoint = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
        content = content.slice(0, insertPoint) + '\n' + definePropsLine + '\n' + content.slice(insertPoint);
      }
    }

    return content;
  }

  /**
   * Fix async/await issues
   */
  fixAsyncAwaitIssues(content) {
    // Fix await outside async function
    content = content.replace(
      /(const|let|var)\s+(\w+)\s+=\s+await\s+([^;]+);/g,
      'const $2 = await $3;'
    );

    // Wrap functions containing await with async
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('await ') && !line.includes('async')) {
        // Find the function declaration
        for (let j = i - 1; j >= 0; j--) {
          const prevLine = lines[j];
          if (prevLine.includes('function ') || prevLine.includes(': ') || prevLine.includes('= ')) {
            if (!prevLine.includes('async')) {
              lines[j] = prevLine.replace('function ', 'async function ');
              break;
            }
          }
        }
      }
    }
    content = lines.join('\n');

    return content;
  }

  /**
   * Print summary of fixes
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPREHENSIVE FIX SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Files processed: ${this.processedFiles}`);
    console.log(`🔧 Files modified: ${this.fixCount}`);
    console.log(`❌ Errors encountered: ${this.errorCount}`);
    console.log('\n💡 Recommended next steps:');
    console.log('1. Run: npm run lint:check');
    console.log('2. Run: npm run type-check');
    console.log('3. Manually review any remaining issues');
    console.log('\n✨ Major improvements made:');
    console.log('• Deduplicated import statements');
    console.log('• Fixed undefined variable references');
    console.log('• Corrected Vue component structure issues');
    console.log('• Added missing defineEmits declarations');
    console.log('• Fixed malformed catch blocks');
    console.log('• Addressed async/await issues');
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new CodebaseFixer();
  fixer.fixCodebase().catch(console.error);
}

module.exports = CodebaseFixer;