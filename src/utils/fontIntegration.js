// Font Integration Utility - Ensures Electrolize font loads properly across all components
// Provides fallback mechanisms and font loading verification

export const FONTS = {
  primary: 'Electrolize',
  secondary: 'Inter',
  gaming: 'Orbitron',
  mono: 'Fira Code',
  code: 'Fira Code',
  fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  monoFallback: '"Fira Code", "JetBrains Mono", "SF Mono", Monaco, "Inconsolata", "Roboto Mono", "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace'
};

// Font stack builder
export const createFontStack = (primary = FONTS.primary, fallback = FONTS.fallback) => {
  return `"${primary}", ${fallback}`;
};

// Check if a font is loaded
export const isFontLoaded = (fontFamily) => {
  if (typeof window === 'undefined' || !window.document || !window.document.fonts) {
    return false;
  }
  
  try {
    return window.document.fonts.check(`16px "${fontFamily}"`);
  } catch (_e) {
    console.warn(`Font check failed for ${fontFamily}:`, e);
    return false;
  }
};

// Load font with verification
export const loadFont = async (fontFamily, fontUrl) => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if already loaded
  if (isFontLoaded(fontFamily)) {
    return true;
  }

  try {
    // Load via FontFace API if available
    if (window.FontFace && fontUrl) {
      const font = new window.FontFace(fontFamily, `url(${fontUrl})`);
      await font.load();
      window.document.fonts.add(font);
      return true;
    }

    // Fallback to link injection (skip if already loaded in index.html to prevent CORB)
    if (fontUrl && !document.querySelector(`link[href*="${fontFamily.toLowerCase()}"]`) && !document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous'; // Add crossorigin for CORS compliance
      // Font loaded successfully (could emit event if needed)
      link.onerror = () => console.warn(`Failed to load font ${fontFamily}`);
      document.head.appendChild(link);
      
      // Wait for font to be available
      return new Promise((resolve) => {
        const checkFont = setInterval(() => {
          if (isFontLoaded(fontFamily)) {
            clearInterval(checkFont);
            resolve(true);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkFont);
          resolve(false);
        }, 5000);
      });
    }

    return false;
  } catch (_error) {
    console.warn(`Error loading font ${fontFamily}:`, error);
    return false;
  }
};

// Initialize all gaming fonts
export const initializeGamingFonts = async () => {
  // Mark initialization to avoid duplicate runs
  try {
    if (typeof window !== 'undefined') {
      window.__gamingFontsInit = true;
    }
  } catch {}

  const fontsToLoad = [FONTS.primary, FONTS.secondary, FONTS.gaming, FONTS.mono, FONTS.code];
  const loadPromises = [];
  
  // Check each font and create load promises
  fontsToLoad.forEach(fontName => {
    if (!isFontLoaded(fontName)) {
      const promise = new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 20; // Reduced to 2 seconds for faster fallback
        
        const checkFont = setInterval(() => {
          attempts++;
          if (isFontLoaded(fontName)) {
            clearInterval(checkFont);
            // Font loaded successfully
            resolve(true);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkFont);
            console.warn(`${fontName} font failed to load within timeout, using fallback`);
            resolve(false);
          }
        }, 100);
        
        // Also try to preload the font if not available
        if (document.fonts && document.fonts.load) {
          document.fonts.load(`16px "${fontName}"`).catch(() => {
            // Font failed to preload, but we'll continue with the interval check
          });
        }
      });
      loadPromises.push(promise);
    }
  });
  
  try {
    // Wait for all fonts to load or timeout (with shorter timeout)
    const results = await Promise.allSettled(loadPromises.map(p => 
      Promise.race([
        p,
        new Promise(resolve => setTimeout(() => resolve(false), 2000)) // 2s total timeout
      ])
    ));
    const allLoaded = results.every(result => result.status === 'fulfilled' && result.value === true);
    
    // Set up CSS custom properties for all font stacks
    document.documentElement.style.setProperty('--font-primary', `"${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback}`);
    document.documentElement.style.setProperty('--font-secondary', `"${FONTS.secondary}", "${FONTS.primary}", ${FONTS.fallback}`);
    document.documentElement.style.setProperty('--font-gaming', `"${FONTS.gaming}", "${FONTS.primary}", ${FONTS.fallback}`);
    document.documentElement.style.setProperty('--font-mono', `"${FONTS.mono}", ${FONTS.monoFallback}`);
    document.documentElement.style.setProperty('--font-code', `"${FONTS.code}", ${FONTS.monoFallback}`);
    document.documentElement.style.setProperty('--font-display', `"${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback}`);
    
    // Add font-loaded class for CSS targeting
    document.documentElement.classList.add('fonts-loaded');
    
    // Log font loading results
    const loadedFonts = fontsToLoad.filter(font => isFontLoaded(font))
    const failedFonts = fontsToLoad.filter(font => !isFontLoaded(font))
    
    if (failedFonts.length > 0) {
      // Some fonts failed to load, using fallbacks
      console.warn('Some fonts failed to load:', { failed: failedFonts, loaded: loadedFonts });
    } else {
      // All gaming fonts loaded successfully
    }

    // Emit custom event for components to update
    window.dispatchEvent(new CustomEvent('gaming-fonts-loaded', { 
      detail: { 
        allLoaded,
        loadedFonts,
        failedFonts
      }
    }));
    
    return allLoaded;
  } catch (error) {
    console.warn('Error initializing gaming fonts:', error);
    return false;
  }
};

// Legacy function for backward compatibility
export const initializeElectrolizeFont = initializeGamingFonts;

// Font verification utility for components
export const useElectrolizeFont = () => {
  const fontStack = createFontStack();
  const isLoaded = isFontLoaded(FONTS.primary);
  
  return {
    fontFamily: fontStack,
    isLoaded,
    primaryFont: FONTS.primary,
    fallbackFont: FONTS.fallback,
    verify: () => isFontLoaded(FONTS.primary)
  };
};

// CSS utility class generator
export const generateFontClasses = () => {
  const styles = document.createElement('style');
  styles.id = 'gaming-font-utilities';
  styles.textContent = `
    /* Gaming Font Stack Classes */
    .font-primary, .electrolize-font {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .font-secondary {
      font-family: "${FONTS.secondary}", "${FONTS.primary}", ${FONTS.fallback} !important;
    }
    
    .font-gaming {
      font-family: "${FONTS.gaming}", "${FONTS.primary}", ${FONTS.fallback} !important;
    }
    
    .font-mono {
      font-family: "${FONTS.mono}", ${FONTS.monoFallback} !important;
    }
    
    /* Component-specific font applications */
    .electrolize-headings h1, .electrolize-headings h2, .electrolize-headings h3,
    .electrolize-headings h4, .electrolize-headings h5, .electrolize-headings h6 {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .electrolize-buttons button, .electrolize-buttons .btn,
    .gaming-buttons button, .gaming-buttons .btn {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .electrolize-inputs input, .electrolize-inputs textarea, .electrolize-inputs select {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    /* Gaming-specific elements */
    .xp-system, .achievement, .gaming-card, .gaming-nav,
    .level-indicator, .progress-indicator {
      font-family: "${FONTS.gaming}", "${FONTS.primary}", ${FONTS.fallback} !important;
    }
    
    /* Code and monospace elements */
    .code-block, .terminal, .console, .debug-info {
      font-family: "${FONTS.mono}", ${FONTS.monoFallback} !important;
    }
    
    /* Ensure all UI framework components use gaming fonts */
    .mui-btn, .mui-textfield, .mui-card, .mui-loading-text,
    .v-btn, .v-text-field, .v-card, .v-app-bar,
    .unified-btn, .unified-card, .unified-input {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    /* Font loading states */
    .fonts-loaded .font-loading-hidden {
      visibility: visible;
    }
    
    .font-loading-hidden {
      visibility: hidden;
    }
    
    /* Font display optimization */
    @font-face {
      font-family: '${FONTS.primary}';
      font-display: swap;
    }
    
    @font-face {
      font-family: '${FONTS.secondary}';
      font-display: swap;
    }
    
    @font-face {
      font-family: '${FONTS.gaming}';
      font-display: swap;
    }
    
    @font-face {
      font-family: '${FONTS.mono}';
      font-display: swap;
    }
  `;
  
  // Remove existing styles if they exist
  const existing = document.getElementById('gaming-font-utilities');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(styles);
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Skip if already initialized by application bootstrap
  if (window.__gamingFontsInit) {
    // Ensure classes exist at least once
    if (!document.getElementById('gaming-font-utilities')) {
      try { generateFontClasses(); } catch {}
    }
  } else {
    // Use document.fonts ready API if available for better timing
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        generateFontClasses();
        initializeElectrolizeFont();
      }).catch(() => {
        // Fallback if fonts.ready fails
        setTimeout(() => {
          generateFontClasses();
          initializeElectrolizeFont();
        }, 1000);
      });
    } else {
      // Fallback for browsers without document.fonts.ready
      // Listen for DOM ready to ensure proper initialization
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            generateFontClasses();
            initializeElectrolizeFont();
          }, 500);
        });
      } else {
        setTimeout(() => {
          generateFontClasses();
          initializeElectrolizeFont();
        }, 500);
      }
    }
  }
}

export default {
  FONTS,
  createFontStack,
  isFontLoaded,
  loadFont,
  initializeElectrolizeFont,
  useElectrolizeFont,
  generateFontClasses
};
