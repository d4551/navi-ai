// Emergency fix for WASM CSP issue
/* global WebAssembly */
console.log('🔧 Applying emergency WASM & Media CSP fix...');

// Function to apply WASM-friendly CSP
function applyWasmCSP() {
  // Remove existing CSP meta tags
  const existingCSPs = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
  existingCSPs.forEach(meta => {
    console.log('Removing existing CSP:', meta.content.substring(0, 100) + '...');
    meta.remove();
  });

  // Create WASM-friendly CSP with proper media-src
  const wasmCSP = document.createElement('meta');
  wasmCSP.setAttribute('http-equiv', 'Content-Security-Policy');
  wasmCSP.setAttribute('content', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https: blob:; " +
    "media-src 'self' blob: data:; " +
    "connect-src 'self' http: https: ws: wss: blob: https://cdn.jsdelivr.net; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "worker-src 'self' blob:;"
  );

  document.head.appendChild(wasmCSP);
  console.log('✅ Applied WASM & Media-friendly CSP');
  
  // Force reload any blocked media
  reloadBlockedMedia();
  
  // Test WASM compilation
  testWasmSupport();
}

// Function to reload any blocked media elements
function reloadBlockedMedia() {
  try {
    // Find all audio and video elements that might be blocked
    const mediaElements = document.querySelectorAll('audio, video');
    let reloadedCount = 0;
    
    mediaElements.forEach(element => {
      if (element.src && element.src.startsWith('blob:')) {
        console.log('Reloading blocked media element:', element.src.substring(0, 50) + '...');
        const originalSrc = element.src;
        element.src = '';
        setTimeout(() => {
          element.src = originalSrc;
          reloadedCount++;
        }, 100);
      }
    });
    
    if (reloadedCount > 0) {
      console.log(`✅ Reloaded ${reloadedCount} media elements`);
    } else {
      console.log('ℹ️ No blocked media elements found to reload');
    }
  } catch (error) {
    console.warn('Failed to reload media elements:', error);
  }
}

// Test if WASM can be compiled
async function testWasmSupport() {
  try {
    // Simple WASM module that adds two numbers
    const wasmCode = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
      0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
      0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61,
      0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00,
      0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
    ]);
    if (typeof globalThis.WebAssembly === 'undefined') {
      console.warn('WebAssembly not available in this environment; skipping WASM test.');
      return false;
    }
    const { WebAssembly: WASM } = globalThis;
    const module = await WASM.compile(wasmCode);
    const instance = await WASM.instantiate(module);
    const result = instance.exports.add(5, 3);
    const result = instance.exports.add(5, 3);
    
    console.log('✅ WASM test passed! 5 + 3 =', result);
    console.log('🎉 Kokoro TTS should now work without CSP errors');
    
    // Show a notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('WASM CSP Fixed!', {
        body: 'Kokoro TTS should now work without errors',
        icon: '/favicon.ico'
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ WASM test failed:', error.message);
    console.log('⚠️ You may need to refresh the page for CSP changes to take effect');
    return false;
  }
}

// Apply the fix immediately
applyWasmCSP();

// Also provide a global function to reapply if needed
window.fixWasmCSP = applyWasmCSP;

console.log('💡 If issues persist, run: window.fixWasmCSP()');
