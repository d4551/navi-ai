#!/usr/bin/env node

/**
 * Automated Props Error Fixer
 * Fixes "props is not defined" errors in Vue components
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const SCAN_DIRS = [
  path.join(__dirname, '../src/components'),
  path.join(__dirname, '../src/views'),
];

function fixPropsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let newContent = content;

    // Skip if already uses _props or doesn't have script setup
    if (!content.includes('script setup') || content.includes('_props') || content.includes('withDefaults(defineProps')) {
      return { success: false, reason: 'Not applicable or already fixed' };
    }

    // Pattern 1: Find defineProps usage and ensure consistent variable naming
    const definePropsPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:withDefaults\s*\(\s*)?defineProps/g;
    let propsVarName = null;
    let match = definePropsPattern.exec(content);

    if (match) {
      propsVarName = match[1];
    }

    // If no defineProps found, check if it's a composition API component that uses props directly
    if (!propsVarName) {
      // Look for setup function with props parameter
      const setupFunctionPattern = /setup\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[,\)]/;
      const setupMatch = setupFunctionPattern.exec(content);
      if (setupMatch) {
        propsVarName = setupMatch[1];
      }
    }

    // If still no props variable found, check for _props (common pattern)
    if (!propsVarName && content.includes('_props')) {
      propsVarName = '_props';
    }

    // Default to _props if we can't determine the variable name
    if (!propsVarName) {
      propsVarName = '_props';
    }

    // Pattern 2: Fix direct props. references
    const propsReferencePattern = /\bprops\./g;
    if (propsReferencePattern.test(content)) {
      newContent = newContent.replace(propsReferencePattern, `${propsVarName}.`);
      hasChanges = true;
    }

    // Pattern 3: Fix props in computed, watch, etc.
    const propsInExpressionPattern = /(\(\s*)props(\s*[,\)])/g;
    if (propsInExpressionPattern.test(newContent)) {
      newContent = newContent.replace(propsInExpressionPattern, `$1${propsVarName}$2`);
      hasChanges = true;
    }

    // Pattern 4: Fix destructured props
    const destructuredPropsPattern = /const\s*\{\s*([^}]+)\s*\}\s*=\s*props/g;
    if (destructuredPropsPattern.test(newContent)) {
      newContent = newContent.replace(destructuredPropsPattern, `const { $1 } = ${propsVarName}`);
      hasChanges = true;
    }

    // Pattern 5: Fix watch(() => props.something) patterns
    const watchPropsPattern = /watch\s*\(\s*\(\s*\)\s*=>\s*props\./g;
    if (watchPropsPattern.test(newContent)) {
      newContent = newContent.replace(watchPropsPattern, `watch(() => ${propsVarName}.`);
      hasChanges = true;
    }

    // Pattern 6: Fix computed(() => props.something) patterns
    const computedPropsPattern = /computed\s*\(\s*\(\s*\)\s*=>\s*props\./g;
    if (computedPropsPattern.test(newContent)) {
      newContent = newContent.replace(computedPropsPattern, `computed(() => ${propsVarName}.`);
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return { success: true, reason: `Fixed props references to use ${propsVarName}`, propsVar: propsVarName };
    }

    return { success: false, reason: 'No props references found to fix' };

  } catch (error) {
    return { success: false, reason: `Error: ${error.message}` };
  }
}

function findVueFiles(dir) {
  const files = [];

  function scanDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.vue')) {
        files.push(itemPath);
      }
    }
  }

  scanDir(dir);
  return files;
}

function getPropsErrors() {
  try {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('npm run lint:check 2>&1', (error, stdout) => {
        const lines = stdout.split('\n');
        const propsErrors = lines.filter(line =>
          line.includes("'props' is not defined") ||
          line.includes("no-undef")
        );

        const errorFiles = new Set();
        for (const line of propsErrors) {
          const match = line.match(/^([^:]+):/);
          if (match) {
            errorFiles.add(match[1]);
          }
        }

        resolve(Array.from(errorFiles));
      });
    });
  } catch {
    return Promise.resolve([]);
  }
}

async function main() {
  console.log('🔧 Starting automated props error fixing...\n');

  // Get files with props errors
  const errorFiles = await getPropsErrors();
  console.log(`📋 Found ${errorFiles.length} files with potential props errors\n`);

  // Get all Vue files
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...findVueFiles(dir));
  }

  // Prioritize files with known errors
  const filesToProcess = errorFiles.length > 0 ? errorFiles : allFiles.slice(0, 20); // Limit for safety

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of filesToProcess) {
    try {
      const result = fixPropsInFile(file);
      const relativePath = path.relative(process.cwd(), file);

      if (result.success) {
        console.log(`✅ ${relativePath} - ${result.reason}`);
        fixed++;
      } else {
        console.log(`⏭️  ${relativePath} - ${result.reason}`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ ${file} - Error: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Props Fixing Summary:`);
  console.log(`   Fixed: ${fixed} files`);
  console.log(`   Skipped: ${skipped} files`);
  console.log(`   Errors: ${errors} files`);
  console.log(`   Total processed: ${filesToProcess.length} files`);

  if (fixed > 0) {
    console.log(`\n🎉 Fixed props errors in ${fixed} files!`);
    console.log('\n📝 Next steps:');
    console.log('1. Run npm run lint:check to verify fixes');
    console.log('2. Test affected components');
    console.log('3. Commit the changes');
  } else {
    console.log('\n💡 No props errors found to fix automatically.');
  }

  // Show remaining props errors
  console.log('\n🔍 Checking for remaining props errors...');
  const remainingErrors = await getPropsErrors();
  if (remainingErrors.length > 0) {
    console.log(`⚠️  ${remainingErrors.length} files still have props errors (may need manual fixing):`);
    remainingErrors.forEach(file => {
      console.log(`   📄 ${path.relative(process.cwd(), file)}`);
    });
  } else {
    console.log('✅ No remaining props errors detected!');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixPropsInFile, getPropsErrors };