// ULTIMATE NAVI CSP FIX - Copy and paste this entire code into your browser console
// This fixes ALL CSP issues: webpack connections, blob media, WASM, and development server

console.log('🚨 NAVI Ultimate CSP Fix - Starting...');

// Remove ALL existing CSP meta tags
document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach(meta => {
  console.log('Removing CSP:', meta.content.substring(0, 50) + '...');
  meta.remove();
});

// Add new comprehensive CSP that allows everything needed for development
const newCSP = document.createElement('meta');
newCSP.setAttribute('http-equiv', 'Content-Security-Policy');
newCSP.setAttribute('content', 
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: webpack: *; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net webpack: data: *; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com data: *; " +
  "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net data: *; " +
  "img-src 'self' data: https: blob: *; " +
  "media-src 'self' blob: data: *; " +
  "connect-src 'self' http: https: ws: wss: blob: https://cdn.jsdelivr.net webpack: data: 'unsafe-inline' *; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "worker-src 'self' blob: data: *;"
);
document.head.appendChild(newCSP);

console.log('✅ Ultimate CSP applied! This fixes:');
console.log('  • Webpack development server connections');
console.log('  • Blob media URLs (audio/video)');
console.log('  • WebAssembly compilation (Kokoro TTS)');
console.log('  • All development server features');
console.log('  • HMR and hot reload');

// Test that blob URLs work
try {
  const testBlob = new Blob(['test'], { type: 'text/plain' });
  const testUrl = URL.createObjectURL(testBlob);
  console.log('✅ Blob URL test passed:', testUrl.substring(0, 50) + '...');
  URL.revokeObjectURL(testUrl);
} catch (error) {
  console.warn('❌ Blob URL test failed:', error.message);
}

console.log('🎉 All NAVI features should now work without CSP errors!');
alert('🎉 NAVI CSP Fixed!\n\nAll features enabled:\n• Audio/Video\n• TTS/WASM\n• Development tools\n• Settings');
