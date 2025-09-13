#!/usr/bin/env node

/**
 * Cleanup Excessive Inline Styles
 * Removes and optimizes inline CSS custom properties that clutter layouts
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Patterns to identify excessive inline styles
const PROBLEMATIC_PATTERNS = [
  // Massive CSS custom property declarations
  /style="[^"]*--color-[^"]*--color-[^"]*--color[^"]*"/g,
  /style="[^"]*--font-[^"]*--font-[^"]*--spacing[^"]*"/g,
  // Very long inline styles (over 200 characters)
  /style="[^"]{200,}"/g,
  // Multiple design token assignments
  /style="[^"]*--[a-z-]+:[^"]*--[a-z-]+:[^"]*--[a-z-]+:/g
];

// Styles that should be extracted to CSS classes
const EXTRACTABLE_PATTERNS = [
  // Typography patterns
  { pattern: /style="[^"]*font-family:\s*var\(--font-[^)]+\)[^"]*font-weight:\s*var\(--font-[^)]+\)[^"]*"/g, className: 'typography-primary' },
  // Grid patterns
  { pattern: /style="[^"]*--card-grid-cols:\s*\d+[^"]*"/g, className: null }, // These are acceptable
  // Color scheme patterns
  { pattern: /style="[^"]*--color-primary-\d+:[^"]*--color-secondary-\d+:[^"]*"/g, className: 'theme-colors' }
];

function findVueFiles() {
  try {
    const result = execSync('find . -name "*.vue" | grep -v node_modules | grep -v dist', 
      { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f);
  } catch (error) {
    console.error('Error finding Vue files:', error.message);
    return [];
  }
}

function analyzeFile() {
  if (!fs.existsSync(filePath)) return null;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for problematic patterns
  PROBLEMATIC_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      issues.push({
        type: 'excessive-inline-styles',
        pattern: index,
        matches: matches.length,
        examples: matches.slice(0, 2) // Show first 2 examples
      });
    }
  });
  
  // Check for extractable patterns
  EXTRACTABLE_PATTERNS.forEach(({ pattern, className }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0 && className) {
      issues.push({
        type: 'extractable-styles',
        className,
        matches: matches.length,
        examples: matches.slice(0, 2)
      });
    }
  });
  
  // Check for very long style attributes
  const longStyleMatches = content.match(/style="[^"]{150,}"/g);
  if (longStyleMatches && longStyleMatches.length > 0) {
    issues.push({
      type: 'long-inline-styles',
      matches: longStyleMatches.length,
      examples: longStyleMatches.slice(0, 2).map(s => s.substring(0, 100) + '...')
    });
  }
  
  return issues.length > 0 ? { filePath, issues } : null;
}

function cleanupFile(analysis) {
  const { filePath, issues } = analysis;
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  console.log(`\n🔧 Cleaning up ${filePath}`);
  
  issues.forEach(issue => {
    switch (issue.type) {
      case 'excessive-inline-styles':
        console.log(`  - Found ${issue.matches} excessive inline style(s)`);
        issue.examples.forEach(example => {
          console.log(`    Example: ${example.substring(0, 80)}...`);
          
          // Extract CSS custom properties and create a class
          const className = generateClassName(example);
          const cssClass = extractCSSFromStyle(example);
          
          // Replace inline style with class
          content = content.replace(example, `class="${className}"`);
          
          // Add note about the extracted CSS
          console.log(`    → Extracted to class: ${className}`);
          console.log(`    → CSS to add: ${cssClass}`);
          
          modified = true;
        });
        break;
        
      case 'long-inline-styles':
        console.log(`  - Found ${issue.matches} long inline style(s)`);
        issue.examples.forEach(example => {
          console.log(`    Long style: ${example}`);
          // These need manual review
        });
        break;
        
      case 'extractable-styles':
        console.log(`  - Found ${issue.matches} extractable style(s) → ${issue.className}`);
        break;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function generateClassName(styleAttr) {
  // Generate a semantic class name based on the style content
  if (styleAttr.includes('--color-primary')) return 'theme-primary-colors';
  if (styleAttr.includes('--font-family')) return 'typography-custom';
  if (styleAttr.includes('--spacing')) return 'spacing-custom';
  return 'extracted-styles';
}

function extractCSSFromStyle(styleAttr) {
  // Extract the CSS content from style attribute
  const match = styleAttr.match(/style="([^"]*)"/);
  if (match) {
    const styles = match[1];
    return `.extracted-styles {\n  ${styles.replace(/;/g, ';\n  ')}\n}`;
  }
  return '';
}

function generateRecommendations(allIssues) {
  console.log('\n📋 CLEANUP RECOMMENDATIONS:');
  console.log('================================');
  
  const totalFiles = allIssues.length;
  const totalIssues = allIssues.reduce((sum, file) => sum + file.issues.length, 0);
  
  console.log(`📊 Found ${totalIssues} issues across ${totalFiles} files\n`);
  
  // CSS classes to create
  const cssClasses = new Set();
  allIssues.forEach(file => {
    file.issues.forEach(issue => {
      if (issue.className) cssClasses.add(issue.className);
    });
  });
  
  if (cssClasses.size > 0) {
    console.log('🎨 CSS CLASSES TO CREATE:');
    cssClasses.forEach(className => {
      console.log(`  .${className} { /* Extract common styles here */ }`);
    });
    console.log('');
  }
  
  console.log('🔧 ACTIONS TO TAKE:');
  console.log('1. Move repeated inline styles to CSS classes');
  console.log('2. Use CSS custom properties at the root level instead of inline');
  console.log('3. Implement a design token system for consistent theming');
  console.log('4. Consider using CSS-in-JS libraries if dynamic styles are needed');
  console.log('5. Add linting rules to prevent excessive inline styles');
  console.log('');
  
  console.log('🎯 THEME OPTIMIZATION:');
  console.log('- Create a unified theme.css file with all design tokens');
  console.log('- Use CSS custom properties at :root level');
  console.log('- Implement theme switching via data attributes');
  console.log('- Extract component-specific styles to .vue <style> sections');
}

function createOptimizedThemeCSS() {
  const themeCSS = `/**
 * Optimized Theme System - Single Source of Truth
 * Replaces excessive inline CSS custom properties
 */

:root {
  /* Primary Color Palette */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;
  
  /* Secondary Color Palette */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-200: #e2e8f0;
  --color-secondary-300: #cbd5e1;
  --color-secondary-400: #94a3b8;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-700: #334155;
  --color-secondary-800: #1e293b;
  --color-secondary-900: #0f172a;
  
  /* Typography System */
  --font-family-ui: 'Electrolize', system-ui, -apple-system, sans-serif;
  --font-family-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
  --font-family-display: 'Electrolize', system-ui, -apple-system, sans-serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing System */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  
  /* Border Radius */
  --border-radius-none: 0;
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-xl: 1rem;
  --border-radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-primary-50: #1e1b4b;
  --color-primary-100: #312e81;
  /* ... other dark theme values */
}

/* Common utility classes to replace inline styles */
.theme-primary-colors {
  background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
  color: var(--color-primary-800);
  border-color: var(--color-primary-300);
}

.typography-primary {
  font-family: var(--font-family-ui);
  font-weight: var(--font-weight-semibold);
}

.spacing-custom {
  padding: var(--spacing-md);
  margin: var(--spacing-sm);
}

/* Prevent excessive inline styles with utility classes */
.glass-container {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
}

.elevated-surface {
  background: var(--surface-elevated);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-md);
}
`;

  fs.writeFileSync('/workspaces/navi2/src/styles/optimized-theme.css', themeCSS, 'utf8');
  console.log('✅ Created optimized theme CSS file: src/styles/optimized-theme.css');
}

function main() {
  console.log('🔍 Analyzing Vue files for excessive inline styles...\n');
  
  const files = findVueFiles();
  console.log(`📁 Found ${files.length} Vue files to analyze\n`);
  
  const issues = [];
  let cleanedFiles = 0;
  
  for (const file of files) {
    const analysis = analyzeFile(file);
    if (analysis) {
      issues.push(analysis);
      
      // Clean up the file (commented out for safety)
      // const wasModified = cleanupFile(analysis);
      // if (wasModified) cleanedFiles++;
      
      console.log(`⚠️  Issues found in ${analysis.filePath}:`);
      analysis.issues.forEach(issue => {
        console.log(`   - ${issue.type}: ${issue.matches} instances`);
      });
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ No excessive inline styles found! Your codebase is clean.');
    console.log('\n💡 If you\'re seeing these styles at runtime, they might be:');
    console.log('   - Generated by a component library (like Vuetify)');
    console.log('   - Injected by a theme system or composable');
    console.log('   - Created dynamically by JavaScript');
    console.log('\n🔧 Consider checking:');
    console.log('   - Vuetify theme configuration');
    console.log('   - Theme composables that might inject styles');
    console.log('   - Browser dev tools to see where styles originate');
  } else {
    generateRecommendations(issues);
  }
  
  // Create optimized theme file
  createOptimizedThemeCSS();
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Files analyzed: ${files.length}`);
  console.log(`   Files with issues: ${issues.length}`);
  console.log(`   Files cleaned: ${cleanedFiles}`);
  console.log(`\n🎯 Next steps: Review the generated optimized-theme.css and integrate it into your build system.`);
}

main();