#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Import Fixer
 * Fixes missing imports for Vue composables, types, and utilities
 */


const TYPE_IMPORTS = {
    'NormalizedStudio': "import type { NormalizedStudio } from '@/types/studio';",
    'JobRepository': "import { JobRepository } from '@/services/JobRepository';",
    'JobSearchResult': "import type { JobSearchResult } from '@/types/job';",
    'GAMING_STUDIOS': "import { GAMING_STUDIOS } from '@/data/gaming-studios';",
    'normalizeStudio': "import { normalizeStudio } from '@/utils/studio-utils';",
    'fuzzyMatchStudios': "import { fuzzyMatchStudios } from '@/utils/search-utils';",
    'buildNormalizedStudios': "import { buildNormalizedStudios } from '@/utils/studio-utils';",
    'buildTokenIndex': "import { buildTokenIndex } from '@/utils/search-utils';",
    'seedStudiosIfEmpty': "import { seedStudiosIfEmpty } from '@/utils/studio-utils';",
    'searchJobsUnified': "import { searchJobsUnified } from '@/services/job-search';",
    'currentJobs': "// currentJobs should be defined as reactive data"
};

function fixVueCompositionImports(content) {
    let modified = false;
    const lines = content.split('\n');
    const scriptStartIndex = lines.findIndex(line => line.includes('<script'));
    const scriptEndIndex = lines.findIndex(line => line.includes('</script>'));
    
    if (scriptStartIndex === -1 || scriptEndIndex === -1) {
        return { content, modified };
    }

    const scriptContent = lines.slice(scriptStartIndex + 1, scriptEndIndex).join('\n');
    const hasSetupFunction = /export\s+default\s+{[^}]*setup\s*\(/m.test(scriptContent);
    
    // Check what imports are needed
    const neededImports = new Set();
    const neededTypes = new Set();
    
    // Check for Vue composition API usage
    if (/\b(ref|computed|watch|onMounted|nextTick|reactive)\b/.test(scriptContent)) {
        const vueImports = [];
        if (/\bref\b/.test(scriptContent)) vueImports.push('ref');
        if (/\bcomputed\b/.test(scriptContent)) vueImports.push('computed');
        if (/\bwatch\b/.test(scriptContent)) vueImports.push('watch');
        if (/\bonMounted\b/.test(scriptContent)) vueImports.push('onMounted');
        if (/\bnextTick\b/.test(scriptContent)) vueImports.push('nextTick');
        if (/\breactive\b/.test(scriptContent)) vueImports.push('reactive');
        
        if (vueImports.length > 0) {
            neededImports.add(`import { ${vueImports.join(', ')} } from 'vue';`);
        }
    }
    
    // Check for router usage
    if (/\brouter\b/.test(scriptContent) && !hasSetupFunction) {
        neededImports.add("import { useRouter } from 'vue-router';");
    }
    
    // Check for type imports
    Object.keys(TYPE_IMPORTS).forEach(type => {
        if (new RegExp(`\\b${type}\\b`).test(scriptContent)) {
            neededTypes.add(TYPE_IMPORTS[type]);
        }
    });
    
    // Add imports if needed
    if (neededImports.size > 0 || neededTypes.size > 0) {
        const importLines = [...neededTypes, ...neededImports];
        const insertIndex = scriptStartIndex + 1;
        
        // Insert imports
        lines.splice(insertIndex, 0, ...importLines, '');
        modified = true;
    }
    
    // Fix router usage in composition API
    if (/\brouter\b/.test(scriptContent) && !hasSetupFunction) {
        const setupIndex = lines.findIndex((line, index) => 
            index > scriptStartIndex && 
            index < scriptEndIndex && 
            /setup\s*\(/.test(line)
        );
        
        if (setupIndex !== -1) {
            // Find the opening brace of setup function
            let braceIndex = setupIndex;
            while (braceIndex < lines.length && !lines[braceIndex].includes('{')) {
                braceIndex++;
            }
            
            if (braceIndex < lines.length) {
                lines.splice(braceIndex + 1, 0, '    const router = useRouter();', '');
                modified = true;
            }
        }
    }
    
    return { content: lines.join('\n'), modified };
}

function fixCatchBlocks(content) {
    let modified = false;
    
    // Fix catch blocks without error parameter
    const catchRegex = /catch\s*\(\s*\)\s*{([^}]*\berror\b[^}]*)}/g;
    if (catchRegex.test(content)) {
        content = content.replace(catchRegex, 'catch (error) {$1}');
        modified = true;
    }
    
    // Fix unused error parameters
    content = content.replace(/catch\s*\(\s*(\w+)\s*\)\s*{([^}]*?)console\.log\([^)]*\1[^)]*\)/g, 
        'catch ($1) {$2console.error($1)');
    
    return { content, modified };
}

function fixEventParameters(content) {
    let modified = false;
    
    // Fix arrow functions without event parameter
    const eventRegex = /(\w+):\s*\(\s*\)\s*=>\s*{([^}]*\be\b[^}]*)}/g;
    if (eventRegex.test(content)) {
        content = content.replace(eventRegex, '$1: (e) => {$2}');
        modified = true;
    }
    
    return { content, modified };
}

function fixUnusedVariables(content) {
    let modified = false;
    
    // Fix unused variables by prefixing with underscore
    const unusedPatterns = [
        { pattern: /const\s+(\w+)\s*=.*?catch\s*\(\s*(\w+)\s*\)/g, replacement: 'const $1 = ... catch (_$2)' },
        { pattern: /let\s+(\w+)\s*=.*?catch\s*\(\s*(\w+)\s*\)/g, replacement: 'let $1 = ... catch (_$2)' }
    ];
    
    unusedPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            modified = true;
        }
    });
    
    return { content, modified };
}

function fixSpecificIssues(content, filePath) {
    let modified = false;
    
    // Fix specific file issues
    if (filePath.includes('PersonalInfoSection.vue')) {
        // Fix props access in template
        if (content.includes('props.')) {
            content = content.replace(/props\./g, '');
            modified = true;
        }
    }
    
    if (filePath.includes('usePerformantPortfolio.ts')) {
        // Fix _data vs data issue
        content = content.replace(/\b_data\b/g, 'data');
        modified = true;
    }
    
    if (filePath.includes('router/index.js')) {
        // Fix router variable access
        if (!content.includes('const router =')) {
            content = content.replace(/^(import.*?\n)/m, '$1\nconst router = createRouter({\n  // router config\n});\n');
            modified = true;
        }
    }
    
    if (filePath.includes('JobSearch.vue')) {
        // Fix computedwatch typo
        content = content.replace(/computedwatch/g, 'computed, watch');
        
        // Fix experience vs experienceLevel
        content = content.replace(/\.experienceLevel/g, '.experience');
        
        modified = true;
    }
    
    return { content, modified };
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let result = { content, modified: false };
        
        // Apply all fixes
        result = fixVueCompositionImports(result.content);
        
        const catchResult = fixCatchBlocks(result.content);
        result.content = catchResult.content;
        result.modified = result.modified || catchResult.modified;
        
        const eventResult = fixEventParameters(result.content);
        result.content = eventResult.content;
        result.modified = result.modified || eventResult.modified;
        
        const unusedResult = fixUnusedVariables(result.content);
        result.content = unusedResult.content;
        result.modified = result.modified || unusedResult.modified;
        
        const specificResult = fixSpecificIssues(result.content, filePath);
        result.content = specificResult.content;
        result.modified = result.modified || specificResult.modified;
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content);
            console.log(`✅ Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
            return 1;
        }
        
        return 0;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error?.message || error);
        return 0;
    }
}

function findVueAndTsFiles(dir) {
    const files = [];
    
    function scanDirectory(directory) {
        const entries = fs.readdirSync(directory);
        
        for (const entry of entries) {
            const fullPath = path.join(directory, entry);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
                scanDirectory(fullPath);
            } else if (stat.isFile() && /\.(vue|ts|js)$/.test(entry)) {
                files.push(fullPath);
            }
        }
    }
    
    scanDirectory(dir);
    return files;
}

function main() {
    console.log('🔧 Starting Import Fixer...\n');
    
    const srcDir = path.join(process.cwd(), 'src');
    const files = findVueAndTsFiles(srcDir);
    
    let totalFixed = 0;
    
    for (const file of files) {
        totalFixed += processFile(file);
    }
    
    console.log('\n📊 Import Fix Summary:');
    console.log(`• Total files processed: ${files.length}`);
    console.log(`• Files modified: ${totalFixed}`);
    console.log(`• Remaining files: ${files.length - totalFixed}`);
}

if (require.main === module) {
    main();
}

module.exports = { processFile, fixVueCompositionImports, fixCatchBlocks };
