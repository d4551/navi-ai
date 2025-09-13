/**
 * Kokoro Package API Discovery
 * Find out what the actual API structure is
 */

console.log('🔍 Discovering Kokoro package API...');

async function discoverKokoroAPI() {
  try {
    console.log('📦 Importing kokoro-js...');
    
    const kokoroModule = await import('kokoro-js');
    console.log('✅ Module imported successfully!');
    
    console.log('📋 Module exports:');
    console.log('- Keys:', Object.keys(kokoroModule));
    console.log('- Default export:', typeof kokoroModule.default);
    
    // Check if it's a default export
    if (kokoroModule.default) {
      console.log('📦 Checking default export...');
      const DefaultKokoro = kokoroModule.default;
      console.log('- Default export type:', typeof DefaultKokoro);
      console.log('- Default export constructor:', DefaultKokoro.constructor.name);
      
      if (typeof DefaultKokoro === 'function') {
        console.log('🔧 Trying to instantiate default export...');
        try {
          const instance = new DefaultKokoro();
          console.log('✅ Default export instantiated successfully!');
          console.log('- Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
        } catch (error) {
          console.log('❌ Could not instantiate default export:', error.message);
        }
      }
    }
    
    // Check named exports
    const namedExports = Object.keys(kokoroModule).filter(key => key !== 'default');
    if (namedExports.length > 0) {
      console.log('📦 Named exports:', namedExports);
      
      for (const exportName of namedExports) {
        const exportedItem = kokoroModule[exportName];
        console.log(`- ${exportName}:`, typeof exportedItem);
        
        if (typeof exportedItem === 'function') {
          console.log(`  🔧 Trying to instantiate ${exportName}...`);
          try {
            const instance = new exportedItem();
            console.log(`  ✅ ${exportName} instantiated successfully!`);
            console.log(`  - Instance methods:`, Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
          } catch (error) {
            console.log(`  ❌ Could not instantiate ${exportName}:`, error.message);
            
            // Try calling as function
            try {
              const result = exportedItem();
              console.log(`  📞 Called ${exportName} as function:`, typeof result);
            } catch (funcError) {
              console.log(`  ❌ Could not call ${exportName} as function:`, funcError.message);
            }
          }
        }
      }
    }
    
    // Check if the module has static methods
    for (const key of Object.keys(kokoroModule)) {
      const item = kokoroModule[key];
      if (typeof item === 'object' && item !== null) {
        console.log(`📦 Object export ${key}:`, Object.keys(item));
      }
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

// Also check the package.json to understand the API
async function checkPackageInfo() {
  try {
    console.log('📄 Checking package info...');
    const fs = await import('fs');
    const packagePath = './node_modules/kokoro-js/package.json';
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log('📋 Package info:');
      console.log('- Name:', packageJson.name);
      console.log('- Version:', packageJson.version);
      console.log('- Main:', packageJson.main);
      console.log('- Module:', packageJson.module);
      console.log('- Types:', packageJson.types);
      console.log('- Description:', packageJson.description);
      
      if (packageJson.exports) {
        console.log('- Exports:', packageJson.exports);
      }
    } else {
      console.log('❌ Package.json not found');
    }
  } catch (error) {
    console.warn('⚠️ Could not read package info:', error.message);
  }
}

console.log('🚀 Starting API discovery...');
checkPackageInfo()
  .then(() => discoverKokoroAPI())
  .then(() => {
    console.log('🎉 API discovery completed!');
  })
  .catch(error => {
    console.error('💥 Discovery failed:', error);
  });
