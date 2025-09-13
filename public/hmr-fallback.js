// HMR Fallback for Codespaces
// This script handles WebSocket connection failures gracefully

(function() {
  'use strict';
  
  // Detect if we're in a Codespaces environment
  const isCodespaces = window.location.hostname.includes('.app.github.dev');
  
  if (!isCodespaces) return;
  
  // Override console.error to filter out WebSocket connection errors
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Filter out WebSocket connection errors that are expected in Codespaces
    if (message.includes('WebSocket connection') && 
        (message.includes('failed') || message.includes('closed'))) {
      // Silently ignore WebSocket connection errors
      return;
    }
    
    // Allow all other errors through
    originalError.apply(console, args);
  };
  
  // Add a fallback refresh mechanism for development
  let lastModified = 0;
  
  function checkForUpdates() {
    // Use a more reliable endpoint for checking updates
    const checkUrl = '/favicon.ico?t=' + Date.now();
    
    fetch(checkUrl, { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors' // This helps with CORS issues
    })
    .then(response => {
      if (response.ok || response.type === 'opaque') {
        const modified = response.headers.get('last-modified') || new Date().toISOString();
        const current = new Date(modified).getTime();
        
        if (lastModified && current > lastModified) {
          // Show a subtle notification about updates
          if (!document.querySelector('.dev-update-notice')) {
            const notice = document.createElement('div');
            notice.className = 'dev-update-notice';
            notice.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #1e293b;
              color: white;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 14px;
              z-index: 10000;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: opacity 0.3s ease;
            `;
            notice.innerHTML = '🔄 Updates available - Click to refresh';
            notice.onclick = () => window.location.reload();
            document.body.appendChild(notice);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
              if (notice.parentNode) {
                notice.style.opacity = '0';
                setTimeout(() => notice.remove(), 300);
              }
            }, 5000);
          }
        }
        
        lastModified = current;
      }
    })
    .catch(() => {
      // Silently ignore fetch errors - this is expected in some environments
    });
  }  // Check for updates every 10 seconds in development
  if (window.location.port === '5173' || window.location.hostname.includes('5173')) {
    setInterval(checkForUpdates, 10000);
    checkForUpdates(); // Initial check
  }
})();