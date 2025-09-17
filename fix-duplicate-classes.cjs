#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all Vue files with duplicate class attributes
const vueFiles = execSync('find src -name "*.vue" -exec grep -l \'class="[^"]*".*class="[^"]*"\' {} \\;', { encoding: 'utf-8' })
  .split('\n')
  .filter(file => file.trim());

console.log(`Found ${vueFiles.length} Vue files with duplicate class attributes`);

vueFiles.forEach((file, index) => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Fix duplicate class attributes by combining them
    // Handle multiple patterns of duplicates
    let fixed = content;
    
    // Pattern 1: class="..." ... class="font-sans"
    fixed = fixed.replace(
      /(\s+class="[^"]*")((?:[^>]*?))\s+class="font-sans"/g,
      (match, firstClass, middle) => {
        const firstClassValue = firstClass.match(/class="([^"]*)"/)[1];
        return `${firstClass.replace(/class="([^"]*)"/, `class="$1 font-sans"`)}${middle}`;
      }
    );
    
    // Pattern 2: class="..." class="..."
    fixed = fixed.replace(
      /(\s+class="[^"]*")\s+class="([^"]*)"/g,
      (match, firstClass, secondClass) => {
        const firstClassValue = firstClass.match(/class="([^"]*)"/)[1];
        return firstClass.replace(/class="([^"]*)"/, `class="$1 ${secondClass}"`);
      }
    );
    
    // Pattern 3: Any other duplicate class patterns
    fixed = fixed.replace(
      /(\s+class="[^"]*")([^>]*)\s+class="([^"]*)"/g,
      (match, firstClass, middle, thirdClass) => {
        const firstClassValue = firstClass.match(/class="([^"]*)"/)[1];
        return `${firstClass.replace(/class="([^"]*)"/, `class="$1 ${thirdClass}"`)}${middle}`;
      }
    );
    
    if (fixed !== content) {
      fs.writeFileSync(file, fixed);
      console.log(`${index + 1}/${vueFiles.length}: Fixed ${file}`);
    } else {
      console.log(`${index + 1}/${vueFiles.length}: No changes needed in ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Done fixing duplicate class attributes!');