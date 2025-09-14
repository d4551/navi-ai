#!/usr/bin/env node

/**
 * Fix Absolute Positioning Script
 * Identifies and helps fix non-overlay absolute positioning in Vue components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Whitelist of files/selectors that are allowed to use absolute positioning
const ALLOWED_ABSOLUTE_PATTERNS = [
  '.modal',
  '.tooltip',
  '.popover',
  '.toast',
  '.notification',
  '.dropdown',
  '.overlay',
  '.backdrop',
  '.floating',
  '.glass-modal',
  '.mobile-overlay',
  '.zelda',
  '::before',
  '::after',
  'position: fixed', // Fixed is different from absolute
];

const DESIGN_TOKEN_REPLACEMENTS = {
  // Common spacing values to replace with tokens
  '1rem': 'var(--spacing-md)',
  '0.5rem': 'var(--spacing-sm)', 
  '2rem': 'var(--spacing-xl)',
  '1.5rem': 'var(--spacing-lg)',
  '0.25rem': 'var(--spacing-xs)',
  '8px': 'var(--spacing-xs)',
  '16px': 'var(--spacing-md)', 
  '24px': 'var(--spacing-lg)',
  '32px': 'var(--spacing-xl)',
  
  // Colors to replace with tokens
  '#fff': 'var(--color-white)',
  '#000': 'var(--color-black)',
  'rgba(255, 255, 255': 'rgba(var(--color-white-rgb)',
  'rgba(0, 0, 0': 'rgba(var(--color-black-rgb)',
  
  // Border radius
  '8px': 'var(--radius-md)',
  '4px': 'var(--radius-sm)',
  '16px': 'var(--radius-lg)',
  '50%': 'var(--radius-full)',
};

async function findAbsolutePositioningIssues() {
  const vueFiles = glob.sync('src/**/*.vue', { cwd: process.cwd() });
  const issues = [];

  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    let inStyleBlock = false;
    let currentSelector = '';
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // Track if we're in a style block
      if (trimmedLine.includes('<style')) {
        inStyleBlock = true;
        return;
      }
      if (trimmedLine.includes('</style>')) {
        inStyleBlock = false;
        return;
      }
      
      if (!inStyleBlock) return;
      
      // Track current CSS selector
      if (trimmedLine.endsWith('{') && !trimmedLine.includes(':')) {
        currentSelector = trimmedLine.replace('{', '').trim();
      }
      
      // Check for position: absolute
      if (trimmedLine.includes('position:') && trimmedLine.includes('absolute')) {
        const isAllowed = ALLOWED_ABSOLUTE_PATTERNS.some(pattern => 
          currentSelector.includes(pattern) || trimmedLine.includes(pattern)
        );
        
        if (!isAllowed) {
          issues.push({
            file,
            line: lineNum,
            selector: currentSelector,
            content: trimmedLine,
            type: 'absolute-positioning'
          });
        }
      }
      
      // Check for hard-coded values that should use tokens
      for (const [hardcoded, token] of Object.entries(DESIGN_TOKEN_REPLACEMENTS)) {
        if (trimmedLine.includes(hardcoded) && !trimmedLine.includes('var(--')) {
          // Skip if it's already using a token or in a comment
          if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) continue;
          
          issues.push({
            file,
            line: lineNum,
            selector: currentSelector,
            content: trimmedLine,
            type: 'hardcoded-value',
            suggestion: trimmedLine.replace(hardcoded, token)
          });
        }
      }
    });
  }
  
  return issues;
}

function generateReport(issues) {
  const report = {
    summary: {
      total: issues.length,
      byType: {},
      byFile: {}
    },
    issues: issues
  };
  
  // Group by type
  issues.forEach(issue => {
    report.summary.byType[issue.type] = (report.summary.byType[issue.type] || 0) + 1;
    report.summary.byFile[issue.file] = (report.summary.byFile[issue.file] || 0) + 1;
  });
  
  return report;
}

function printReport(report) {
  console.log('\n🔍 UI/UX Layout & Style Analysis Report\n');
  console.log(`Total issues found: ${report.summary.total}\n`);
  
  console.log('📊 Issues by type:');
  Object.entries(report.summary.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('\n📁 Files with most issues:');
  Object.entries(report.summary.byFile)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count]) => {
      console.log(`  ${file}: ${count} issues`);
    });
    
  console.log('\n🚨 Critical absolute positioning issues:');
  report.issues
    .filter(issue => issue.type === 'absolute-positioning')
    .slice(0, 10)
    .forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.selector}`);
      console.log(`    ${issue.content}`);
    });
}

async function main() {
  try {
    console.log('🔍 Analyzing Vue components for layout and styling issues...');
    const issues = await findAbsolutePositioningIssues();
    const report = generateReport(issues);
    
    printReport(report);
    
    // Save detailed report to file
    fs.writeFileSync(
      path.join(process.cwd(), 'LAYOUT_ANALYSIS_REPORT.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Detailed report saved to LAYOUT_ANALYSIS_REPORT.json');
    
    if (report.summary.total > 0) {
      console.log('\n✅ Next steps:');
      console.log('1. Review absolute positioning usage in the listed files');
      console.log('2. Replace with flexbox/grid layout primitives');
      console.log('3. Use design system tokens instead of hardcoded values');
      console.log('4. Test responsive behavior after changes');
      
      process.exit(1);
    } else {
      console.log('\n🎉 No layout issues found! All components follow the design system.');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing components:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findAbsolutePositioningIssues, generateReport };