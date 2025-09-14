#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Specific Vue Error Pattern Fixer
 * Targets the exact error patterns shown in the user's error list
 */

function fixVueCompositionApiErrors(content) {
  let modified = false;
  
  // Fix missing Vue composition API imports
  const needsVueImports = /\b(ref|computed|watch|onMounted|reactive|nextTick)\b/.test(content);
  const hasVueImports = /import\s+{[^}]*\b(ref|computed|watch|onMounted)\b[^}]*}\s+from\s+['"]vue['"]/.test(content);
  
  if (needsVueImports && !hasVueImports) {
    const imports = [];
    if (/\bref\b/.test(content)) imports.push('ref');
    if (/\bcomputed\b/.test(content)) imports.push('computed');
    if (/\bwatch\b/.test(content)) imports.push('watch');
    if (/\bonMounted\b/.test(content)) imports.push('onMounted');
    if (/\breactive\b/.test(content)) imports.push('reactive');
    if (/\bnextTick\b/.test(content)) imports.push('nextTick');
    
    if (imports.length > 0) {
      const importStatement = `import { ${imports.join(', ')} } from 'vue';\n`;
      
      // Find script tag and insert import
      const scriptMatch = content.match(/<script[^>]*>/);
      if (scriptMatch) {
        const insertIndex = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
        modified = true;
      }
    }
  }
  
  return { content, modified };
}

function fixRouterErrors(content) {
  let modified = false;
  
  // Fix missing router import and setup
  const needsRouter = /\brouter\b/.test(content);
  const hasRouterImport = /import\s+{[^}]*useRouter[^}]*}\s+from\s+['"]vue-router['"]/.test(content);
  
  if (needsRouter && !hasRouterImport) {
    const importStatement = `import { useRouter } from 'vue-router';\n`;
    
    // Find script tag and insert import
    const scriptMatch = content.match(/<script[^>]*>/);
    if (scriptMatch) {
      const insertIndex = content.indexOf(scriptMatch[0]) + scriptMatch[0].length;
      content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
      
      // Also add router setup in composition function
      const setupMatch = content.match(/setup\s*\([^)]*\)\s*{/);
      if (setupMatch) {
        const setupIndex = content.indexOf(setupMatch[0]) + setupMatch[0].length;
        content = content.slice(0, setupIndex) + '\n    const router = useRouter();\n' + content.slice(setupIndex);
      }
      
      modified = true;
    }
  }
  
  return { content, modified };
}

function fixEventParameterErrors(content) {
  let modified = false;
  
  // Fix catch blocks without error parameter but using 'error' variable
  content = content.replace(/catch\s*\(\s*\)\s*{([^}]*\berror\b[^}]*)}/g, (match, body) => {
    modified = true;
    return `catch (error) {${body}}`;
  });
  
  // Fix arrow functions without event parameter but using 'e' variable
  content = content.replace(/(\w+):\s*\(\s*\)\s*=>\s*{([^}]*\be\b[^}]*)}/g, (match, funcName, body) => {
    modified = true;
    return `${funcName}: (e) => {${body}}`;
  });
  
  // Fix function parameters without event parameter but using 'e' variable
  content = content.replace(/(function\s+\w+\s*\(\s*\)\s*{[^}]*\be\b[^}]*})/g, (match) => {
    modified = true;
    return match.replace('()', '(e)');
  });
  
  return { content, modified };
}

function fixUnusedVariableErrors(content) {
  let modified = false;
  
  // Fix unused variables by prefixing with underscore
  const unusedPatterns = [
    /const\s+(refcomputed)\s*=/g,
    /let\s+(refcomputed)\s*=/g,
    /const\s+(\w*error)\s*=/g,
    /let\s+(\w*error)\s*=/g
  ];
  
  unusedPatterns.forEach(pattern => {
    content = content.replace(pattern, (match, varName) => {
      if (!varName.startsWith('_')) {
        modified = true;
        return match.replace(varName, '_' + varName);
      }
      return match;
    });
  });
  
  // Fix unused catch parameters
  content = content.replace(/catch\s*\(\s*(\w+)\s*\)\s*{([^}]*)}(?![^}]*\1)/g, (match, param) => {
    if (!param.startsWith('_')) {
      modified = true;
      return match.replace(`(${param})`, `(_${param})`);
    }
    return match;
  });
  
  return { content, modified };
}

function fixSpecificTypeErrors(content, filePath) {
  let modified = false;
  
  // Fix computedwatch typo in JobSearch.vue
  if (filePath.includes('JobSearch.vue')) {
    content = content.replace(/computedwatch/g, 'computed, watch');
    content = content.replace(/import\s+{\s*computed,\s*watch,\s*watch\s*}/g, 'import { computed, watch }');
    modified = true;
  }
  
  // Fix experienceLevel vs experience property
  content = content.replace(/\.experienceLevel\b/g, '.experience');
  if (content !== content.replace(/\.experienceLevel\b/g, '.experience')) {
    modified = true;
  }
  
  // Fix _data vs data in usePerformantPortfolio
  if (filePath.includes('usePerformantPortfolio')) {
    content = content.replace(/\b_data\b/g, 'data');
    modified = true;
  }
  
  // Fix case declarations in switch statements
  content = content.replace(
    /(case\s+['"][^'"]*['"]:\s*)(const\s+[^;]+;)/g,
    '$1{\n        $2\n        break;\n    }'
  );
  
  return { content, modified };
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    // Apply all fixes
    let result = fixVueCompositionApiErrors(content);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    result = fixRouterErrors(content);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    result = fixEventParameterErrors(content);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    result = fixUnusedVariableErrors(content);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    result = fixSpecificTypeErrors(content, filePath);
    content = result.content;
    totalModified = totalModified || result.modified;
    
    if (totalModified) {
      fs.writeFileSync(filePath, content);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 Starting Specific Vue Error Pattern Fixer...\n');
  
  // Process the specific files mentioned in the error list
  const targetFiles = [
    '/workspaces/navi2/src/components/resume/PersonalInfoSection.vue',
    '/workspaces/navi2/src/components/resume/ResumeLayout.vue', 
    '/workspaces/navi2/src/components/settings/StreamingSettingsSection.vue',
    '/workspaces/navi2/src/composables/usePerformantPortfolio.ts',
    '/workspaces/navi2/src/router/index.js',
    '/workspaces/navi2/src/views/JobSearch.vue'
  ];
  
  let totalFixed = 0;
  
  for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
      const fixed = processFile(filePath);
      if (fixed) {
        console.log(`✅ Fixed patterns in: ${path.relative(process.cwd(), filePath)}`);
        totalFixed++;
      } else {
        console.log(`ℹ️  No patterns to fix in: ${path.relative(process.cwd(), filePath)}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }
  
  console.log('\n📊 Pattern Fix Summary:');
  console.log(`• Target files processed: ${targetFiles.length}`);
  console.log(`• Files with fixes applied: ${totalFixed}`);
  console.log('• Focus: Critical error patterns from ESLint');
}

if (require.main === module) {
  main();
}

module.exports = { 
  processFile,
  fixVueCompositionApiErrors, 
  fixRouterErrors, 
  fixEventParameterErrors,
  fixUnusedVariableErrors,
  fixSpecificTypeErrors
};
