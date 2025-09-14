#!/usr/bin/env node

/**
 * Master ESLint Fix Script
 * Runs all ESLint warning fixes in the correct order
 */

const { execSync } = require('child_process');
const path = require('path');

// Import our custom fixers
const VuePropFixer = require('./fix-vue-props.cjs');
const UnusedVariableCleaner = require('./cleanup-unused-vars.cjs');

class MasterESLintFixer {
  constructor() {
    this.scriptsDir = __dirname;
  }

  // Run a command and capture output
  runCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        cwd: path.dirname(this.scriptsDir),
        stdio: 'pipe'
      });
      console.log('✅ Success');
      return output;
    } catch (error) {
      console.log('⚠️  Some issues remain, continuing...');
      return error.stdout || '';
    }
  }

  // Get current lint warning count
  getLintWarningCount() {
    try {
      const output = execSync('npm run lint', { 
        encoding: 'utf8',
        cwd: path.dirname(this.scriptsDir),
        stdio: 'pipe'
      });
      
      const warnings = output.match(/warning/g);
      const errors = output.match(/error/g);
      
      return {
        warnings: warnings ? warnings.length : 0,
        errors: errors ? errors.length : 0
      };
    } catch (error) {
      const output = error.stdout || '';
      const warnings = output.match(/warning/g);
      const errors = output.match(/error/g);
      
      return {
        warnings: warnings ? warnings.length : 0,
        errors: errors ? errors.length : 0
      };
    }
  }

  // Main execution
  async run() {
    console.log('🚀 Master ESLint Fix System Starting...\n');
    console.log('=' .repeat(50));

    // Get initial state
    console.log('📊 Getting initial lint status...');
    const initialStats = this.getLintWarningCount();
    console.log(`Initial state: ${initialStats.errors} errors, ${initialStats.warnings} warnings`);

    // Step 1: Fix Vue props
    console.log('\n📋 Step 1: Fixing Vue.js prop defaults...');
    const propFixer = new VuePropFixer();
    propFixer.run();

    // Step 2: Clean unused variables
    console.log('\n🧹 Step 2: Cleaning unused variables...');
    const variableCleaner = new UnusedVariableCleaner();
    variableCleaner.run();

    // Step 3: Fix missing imports
    this.runCommand(
      'node scripts/fix-missing-imports.cjs', 
      'Step 3: Running import fixes'
    );

    // Step 4: Fix Vue composition API errors
    this.runCommand(
      'node scripts/fix-vue-errors.cjs', 
      'Step 4: Running Vue error fixes'
    );

    // Step 5: Run ESLint auto-fix
    this.runCommand(
      'npm run lint', 
      'Step 5: Running ESLint auto-fix'
    );

    // Step 6: Manual specific fixes
    console.log('\n🔧 Step 6: Applying specific manual fixes...');
    await this.applySpecificFixes();

    // Step 7: Final ESLint run
    this.runCommand(
      'npm run lint', 
      'Step 5: Final ESLint validation'
    );

    // Get final state
    console.log('\n📊 Getting final lint status...');
    const finalStats = this.getLintWarningCount();
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 RESULTS SUMMARY:');
    console.log(`Initial: ${initialStats.errors} errors, ${initialStats.warnings} warnings`);
    console.log(`Final:   ${finalStats.errors} errors, ${finalStats.warnings} warnings`);
    console.log(`Errors reduced by:   ${initialStats.errors - finalStats.errors}`);
    console.log(`Warnings reduced by: ${initialStats.warnings - finalStats.warnings}`);
    
    if (finalStats.errors === 0 && finalStats.warnings < 50) {
      console.log('\n🎉 ESLint cleanup completed successfully!');
    } else if (finalStats.errors === 0) {
      console.log('\n✅ All errors fixed! Some warnings remain.');
    } else {
      console.log('\n⚠️  Some errors still need manual attention.');
    }

    console.log('\n💡 Tip: Run "npm run lint" to see remaining issues.');
  }

  // Apply specific manual fixes for common patterns
  async applySpecificFixes() {
    const fs = require('fs');
    
    // Fix global variable definitions
    const globalVarFixes = [
      {
        file: 'src/shared/services/UnifiedDataService.ts',
        fixes: [
          { search: 'CryptoKey', replace: '/* global CryptoKey */' },
          { search: 'CompressionStream', replace: '/* global CompressionStream */' },
          { search: 'DecompressionStream', replace: '/* global DecompressionStream */' },
          { search: 'TextEncoder', replace: '/* global TextEncoder */' },
          { search: 'DOMException', replace: '/* global DOMException */' }
        ]
      }
    ];

    for (const { file, fixes } of globalVarFixes) {
      const filePath = path.join(path.dirname(this.scriptsDir), file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const { search, replace } of fixes) {
          if (content.includes(search) && !content.includes(replace)) {
            content = `${replace}\n${content}`;
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  ✅ Fixed globals in ${file}`);
        }
      }
    }

    // Remove duplicate keys in objects
    const duplicateKeyFixes = [
      {
        file: 'src/composables/useXPSystem.js',
        pattern: /(\s+icon:\s*'[^']*',?\s*\n.*icon:\s*'[^']*',?)/g,
        replacement: ''
      }
    ];

    for (const { file, pattern, replacement } of duplicateKeyFixes) {
      const filePath = path.join(path.dirname(this.scriptsDir), file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(pattern, replacement);
        
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`  ✅ Fixed duplicate keys in ${file}`);
        }
      }
    }

    console.log('  ✅ Specific fixes applied');
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new MasterESLintFixer();
  fixer.run().catch(console.error);
}

module.exports = MasterESLintFixer;
