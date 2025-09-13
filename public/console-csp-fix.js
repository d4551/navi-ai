// IMMEDIATE CSP FIX FOR BLOB MEDIA
// Run this in your browser console on the NAVI app

console.log('🚨 Emergency CSP Fix for Blob Media');

// Remove all existing CSP meta tags
document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach(meta => {
  console.log('Removing CSP:', meta.content.substring(0, 80) + '...');
  meta.remove();
});

// Add new CSP with proper media-src
const newCSP = document.createElement('meta');
newCSP.setAttribute('http-equiv', 'Content-Security-Policy');
newCSP.setAttribute('content', 
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

document.head.appendChild(newCSP);

console.log('✅ Applied new CSP with media-src support');
console.log('🎉 Blob URLs should now work! Try your audio features again.');

// Test blob URL creation
try {
  const testBlob = new Blob(['test'], { type: 'text/plain' });
  const testUrl = URL.createObjectURL(testBlob);
  console.log('✅ Blob URL test successful:', testUrl.substring(0, 50) + '...');
  URL.revokeObjectURL(testUrl);
} catch (error) {
  console.error('❌ Blob URL test failed:', error);
}
