#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Duplicate Import Cleaner
 * Fixes duplicate import statements caused by multiple fix runs
 */

function cleanDuplicateImports(content) {
  let modified = false;
  
  // Find all Vue imports and merge them
  const vueImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]vue['"];?/g;
  const vueImports = [];
  let match;
  
  // Collect all vue imports
  while ((match = vueImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(imp => imp.trim()).filter(imp => imp.length > 0);
    vueImports.push(...imports);
  }
  
  if (vueImports.length > 1) {
    // Remove duplicates
    const uniqueImports = [...new Set(vueImports)];
    
    // Remove all existing vue imports
    content = content.replace(vueImportRegex, '');
    
    // Add single consolidated import
    const consolidatedImport = `import { ${uniqueImports.join(', ')} } from 'vue';\n`;
    
    // Find script tag and insert
    const scriptMatch = content.match(/<script[^>]*>/);
    if (scriptMatch) {
      const insertIndex = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
      content = content.slice(0, insertIndex) + '\n' + consolidatedImport + content.slice(insertIndex);
      modified = true;
    }
  }
  
  // Clean up multiple vue-router imports
  const routerImportRegex = /import\s+{\s*([^}]*useRouter[^}]*)\s*}\s+from\s+['"]vue-router['"];?/g;
  const routerImports = [];
  
  while ((match = routerImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(imp => imp.trim()).filter(imp => imp.length > 0);
    routerImports.push(...imports);
  }
  
  if (routerImports.length > 1) {
    const uniqueRouterImports = [...new Set(routerImports)];
    content = content.replace(routerImportRegex, '');
    
    const consolidatedRouterImport = `import { ${uniqueRouterImports.join(', ')} } from 'vue-router';\n`;
    
    // Insert after vue import or at script start
    const vueImportIndex = content.indexOf("from 'vue';");
    if (vueImportIndex !== -1) {
      const lineEnd = content.indexOf('\n', vueImportIndex);
      content = content.slice(0, lineEnd + 1) + consolidatedRouterImport + content.slice(lineEnd + 1);
    } else {
      const scriptMatch = content.match(/<script[^>]*>/);
      if (scriptMatch) {
        const insertIndex = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + consolidatedRouterImport + content.slice(insertIndex);
      }
    }
    modified = true;
  }
  
  // Remove empty lines between imports
  content = content.replace(/(\nimport[^\n]*\n)\n+(\nimport)/g, '$1$2');
  
  return { content, modified };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = cleanDuplicateImports(content);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function findVueFiles(dir) {
  const files = [];
  
  function scanDirectory(directory) {
    const entries = fs.readdirSync(directory);
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && /\.vue$/.test(entry)) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

function main() {
  console.log('🧹 Starting Duplicate Import Cleaner...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = findVueFiles(srcDir);
  
  let totalFixed = 0;
  
  for (const file of files) {
    const fixed = processFile(file);
    if (fixed) {
      console.log(`✅ Cleaned imports in: ${path.relative(process.cwd(), file)}`);
      totalFixed++;
    }
  }
  
  console.log('\n📊 Cleanup Summary:');
  console.log(`• Vue files processed: ${files.length}`);
  console.log(`• Files with duplicates cleaned: ${totalFixed}`);
}

if (require.main === module) {
  main();
}

module.exports = { processFile, cleanDuplicateImports };
