#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes dependencies and suggests optimizations
 */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Potentially heavy dependencies that might not be needed
const HEAVY_DEPS = [
  'cytoscape',      // Graph visualization - likely large
  'chart.js',       // Charting - could be replaced with lighter alternative
  'ethers',         // Ethereum library - may not be needed
  'marked',         // Markdown parser - could use lighter alternative
  'natural',        // NLP library - very heavy
  'compromise',     // Another NLP library - overlaps with natural
  'highlight.js',   // Syntax highlighting - could be code-split
  'html2canvas',    // HTML to canvas - could be lazy-loaded
  'jszip',          // ZIP functionality - could be lazy-loaded
  'pdf-lib',        // PDF generation - could be lazy-loaded
  'pdfjs-dist',     // PDF viewing - very heavy, could be lazy-loaded
  'qrcode',         // QR code generation - could be lazy-loaded
  'write-excel-file', // Excel export - could be lazy-loaded
];

// Dependencies that might have lighter alternatives
const ALTERNATIVE_SUGGESTIONS = {
  'marked': 'markdown-it-lite or micromark',
  'chart.js': 'lightweight charts like Chart.js alternatives',
  'natural': 'compromise (already included) or lighter NLP lib',
  'lodash-es': 'individual lodash functions or native JS',
  'dayjs': 'native Date methods for simple cases',
  'date-fns': 'dayjs (smaller, already included)',
  'axios': 'native fetch API',
  'uuid': '@paralleldrive/cuid2 (already included)',
};

// Dependencies that should be lazy-loaded
const LAZY_LOAD_CANDIDATES = [
  'pdf-lib',
  'pdfjs-dist',
  'html2canvas',
  'jszip',
  'qrcode',
  'write-excel-file',
  'cytoscape',
  'highlight.js',
];

function analyzeBundle() {
  console.log('🔍 Analyzing bundle dependencies...\n');

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const totalDeps = Object.keys(deps).length;

  console.log(`📦 Total dependencies: ${totalDeps}`);
  console.log(`📦 Production dependencies: ${Object.keys(pkg.dependencies).length}`);
  console.log(`📦 Development dependencies: ${Object.keys(pkg.devDependencies).length}\n`);

  // Check for heavy dependencies
  console.log('🔍 Heavy dependencies found:');
  const foundHeavy = [];
  for (const dep of HEAVY_DEPS) {
    if (deps[dep]) {
      foundHeavy.push(dep);
      console.log(`   ⚠️  ${dep} (${deps[dep]}) - Consider lazy loading or alternatives`);
    }
  }

  if (foundHeavy.length === 0) {
    console.log('   ✅ No obviously heavy dependencies found');
  }

  console.log('\n💡 Suggested optimizations:');

  // Alternative suggestions
  console.log('\n🔄 Dependencies with lighter alternatives:');
  for (const [dep, alternative] of Object.entries(ALTERNATIVE_SUGGESTIONS)) {
    if (deps[dep]) {
      console.log(`   📎 ${dep} → ${alternative}`);
    }
  }

  // Lazy loading suggestions
  console.log('\n⏰ Candidates for lazy loading:');
  for (const dep of LAZY_LOAD_CANDIDATES) {
    if (deps[dep]) {
      console.log(`   🔗 ${dep} - Load only when needed`);
    }
  }

  // Duplicate functionality detection
  console.log('\n🔍 Potential duplicate functionality:');

  // Date libraries
  const dateLibs = ['dayjs', 'date-fns', 'moment'].filter(lib => deps[lib]);
  if (dateLibs.length > 1) {
    console.log(`   📅 Multiple date libraries: ${dateLibs.join(', ')} - Consider using just one`);
  }

  // HTTP clients
  const httpLibs = ['axios', 'fetch'].filter(lib => deps[lib]);
  if (httpLibs.length > 1) {
    console.log(`   🌐 Multiple HTTP clients: ${httpLibs.join(', ')} - Consider using fetch API`);
  }

  // UUID libraries
  const uuidLibs = ['uuid', 'nanoid', '@paralleldrive/cuid2'].filter(lib => deps[lib]);
  if (uuidLibs.length > 1) {
    console.log(`   🆔 Multiple ID generators: ${uuidLibs.join(', ')} - Consider using just one`);
  }

  // Suggestions
  console.log('\n📋 Optimization recommendations:');
  console.log('   1. 🚀 Enable tree-shaking in Vite config');
  console.log('   2. 📦 Lazy load heavy dependencies');
  console.log('   3. 🔄 Replace heavy libraries with lighter alternatives');
  console.log('   4. 🗑️  Remove unused dependencies');
  console.log('   5. 📱 Code-split by route/feature');
  console.log('   6. 🎯 Use dynamic imports for optional features');

  return {
    totalDeps,
    heavyDeps: foundHeavy,
    alternatives: Object.keys(ALTERNATIVE_SUGGESTIONS).filter(dep => deps[dep]),
    lazyLoadCandidates: LAZY_LOAD_CANDIDATES.filter(dep => deps[dep]),
  };
}

function generateOptimizationPlan(analysis) {
  console.log('\n📝 Detailed Optimization Plan:\n');

  if (analysis.heavyDeps.length > 0) {
    console.log('🎯 Priority 1 - Heavy Dependencies:');
    analysis.heavyDeps.forEach((dep, i) => {
      console.log(`   ${i + 1}. Remove or lazy-load ${dep}`);
    });
    console.log('');
  }

  if (analysis.lazyLoadCandidates.length > 0) {
    console.log('⏰ Priority 2 - Lazy Loading:');
    analysis.lazyLoadCandidates.forEach((dep, i) => {
      console.log(`   ${i + 1}. Lazy load ${dep}`);
    });
    console.log('');
  }

  if (analysis.alternatives.length > 0) {
    console.log('🔄 Priority 3 - Alternatives:');
    analysis.alternatives.forEach((dep, i) => {
      console.log(`   ${i + 1}. Replace ${dep} with ${ALTERNATIVE_SUGGESTIONS[dep]}`);
    });
    console.log('');
  }

  console.log('🛠️ Implementation Steps:');
  console.log('   1. Run bundle analyzer: npm run build:analyze');
  console.log('   2. Configure Vite for better tree-shaking');
  console.log('   3. Implement dynamic imports for heavy features');
  console.log('   4. Remove unused dependencies one by one');
  console.log('   5. Test that features still work after each change');
}

if (require.main === module) {
  const analysis = analyzeBundle();
  generateOptimizationPlan(analysis);
}

module.exports = { analyzeBundle, HEAVY_DEPS, ALTERNATIVE_SUGGESTIONS };