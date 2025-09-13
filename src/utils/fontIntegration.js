import { logger } from "@/shared/utils/logger";
import { productionConfig } from "./productionConfig";

// Font Integration Utility - Ensures Electrolize font loads properly across all components
// Provides fallback mechanisms and font loading verification

export const FONTS = {
  primary: "Electrolize",
  secondary: "Inter",
  gaming: "Orbitron",
  mono: "JetBrains Mono",
  fallback:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  monoFallback:
    '"Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", monospace',
};

// Font stack builder
export const createFontStack = (
  primary = FONTS.primary,
  fallback = FONTS.fallback,
) => {
  return `"${primary}", ${fallback}`;
};

// Check if a font is loaded
export const isFontLoaded = (fontFamily) => {
  if (
    typeof window === "undefined" ||
    !window.document ||
    !window.document.fonts
  ) {
    return false;
  }

  try {
    return window.document.fonts.check(`16px "${fontFamily}"`);
  } catch (e) {
    logger.warn(`Font check failed for ${fontFamily}`, e);
    return false;
  }
};

// Load font with verification
export const loadFont = async (fontFamily, fontUrl) => {
  if (typeof window === "undefined") {
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
    if (
      fontUrl &&
      !document.querySelector(`link[href*="${fontFamily.toLowerCase()}"]`) &&
      !document.querySelector('link[href*="fonts.googleapis.com"]')
    ) {
      const link = document.createElement("link");
      link.href = fontUrl;
      link.rel = "stylesheet";
      link.crossOrigin = "anonymous"; // Add crossorigin for CORS compliance
      // Font loaded successfully (could emit event if needed)
      link.onerror = () => logger.warn(`Failed to load font ${fontFamily}`);
      document.head.appendChild(link);

      // Wait for font to be available using Font Loading API or fallback to polling
      return new Promise((resolve) => {
        // Try using modern Font Loading API first
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (isFontLoaded(fontFamily)) {
              resolve(true);
            } else {
              // Fallback to polling with production-optimized intervals
              pollForFont(fontFamily, resolve);
            }
          });
        } else {
          // Fallback to polling for older browsers
          pollForFont(fontFamily, resolve);
        }
      });
    }

    return false;
  } catch (error) {
    logger.warn(`Error loading font ${fontFamily}`, error);
    return false;
  }
};

// Helper method for efficient font polling
const pollForFont = (fontFamily, resolve) => {
  let attempts = 0;
  const maxAttempts = productionConfig.isProduction() ? 25 : 50; // 2.5s or 5s max
  const interval = productionConfig.isProduction() ? 200 : 100; // Less frequent in production

  const checkFont = () => {
    if (isFontLoaded(fontFamily) || attempts >= maxAttempts) {
      resolve(isFontLoaded(fontFamily));
      return;
    }
    attempts++;
    setTimeout(checkFont, interval);
  };

  checkFont();
};

// Initialize all gaming fonts
export const initializeGamingFonts = async () => {
  // Mark initialization to avoid duplicate runs
  try {
    if (typeof window !== "undefined") {
      window.__gamingFontsInit = true;
    }
  } catch {}

  const fontsToLoad = [
    FONTS.primary,
    FONTS.secondary,
    FONTS.gaming,
    FONTS.mono,
  ];
  const loadPromises = [];

  // Check each font and create load promises
  fontsToLoad.forEach((fontName) => {
    if (!isFontLoaded(fontName)) {
      const promise = new Promise((resolve) => {
        // Use the efficient polling helper instead of setInterval
        pollForFont(fontName, (loaded) => {
          if (!loaded) {
            logger.warn(`${fontName} font failed to load within timeout, using fallback`);
          }
          resolve(loaded);
        });

        // Also try to preload the font if not available
        if (document.fonts && document.fonts.load) {
          document.fonts.load(`16px "${fontName}"`).catch(() => {
            // Font failed to preload, but we'll continue with the polling check
            logger.debug(`Font preload failed for ${fontName}, continuing with fallback`);
          });
        }
      });
      loadPromises.push(promise);
    }
  });

  try {
    // Wait for all fonts to load or timeout (with shorter timeout)
    const results = await Promise.allSettled(
      loadPromises.map((p) =>
        Promise.race([
          p,
          new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
        ]),
      ),
    );
    const allLoaded = results.every(
      (result) => result.status === "fulfilled" && result.value === true,
    );

    // Set up CSS custom properties for all font stacks
    document.documentElement.style.setProperty(
      "--font-primary",
      `"${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback}`,
    );
    document.documentElement.style.setProperty(
      "--font-secondary",
      `"${FONTS.secondary}", "${FONTS.primary}", ${FONTS.fallback}`,
    );
    document.documentElement.style.setProperty(
      "--font-gaming",
      `"${FONTS.gaming}", "${FONTS.primary}", ${FONTS.fallback}`,
    );
    document.documentElement.style.setProperty(
      "--font-mono",
      `"${FONTS.mono}", ${FONTS.monoFallback}`,
    );
    document.documentElement.style.setProperty(
      "--font-display",
      `"${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback}`,
    );

    // Add font-loaded class for CSS targeting
    document.documentElement.classList.add("fonts-loaded");

    // Log font loading results
    const loadedFonts = fontsToLoad.filter((font) => isFontLoaded(font));
    const failedFonts = fontsToLoad.filter((font) => !isFontLoaded(font));

    if (failedFonts.length > 0) {
      // Some fonts failed to load, using fallbacks
      console.warn("Some fonts failed to load:", {
        failed: failedFonts,
        loaded: loadedFonts,
      });
    } else {
      // All gaming fonts loaded successfully
    }

    // Emit custom event for components to update
    window.dispatchEvent(
      new CustomEvent("gaming-fonts-loaded", {
        detail: {
          allLoaded,
          loadedFonts,
          failedFonts,
        },
      }),
    );

    return allLoaded;
  } catch (error) {
    console.warn("Error initializing gaming fonts:", error);
    return false;
  }
};


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
    verify: () => isFontLoaded(FONTS.primary),
  };
};

// CSS utility class generator
export const generateFontClasses = () => {
  const styles = document.createElement("style");
  styles.id = "gaming-font-utilities";
  styles.textContent = `
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
    
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .electrolize-buttons button, .electrolize-buttons .btn,
    .gaming-buttons button, .gaming-buttons .btn {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .electrolize-inputs input, .electrolize-inputs textarea, .electrolize-inputs select {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .xp-system, .achievement, .gaming-card, .gaming-nav,
    .level-indicator, .progress-indicator {
      font-family: "${FONTS.gaming}", "${FONTS.primary}", ${FONTS.fallback} !important;
    }
    
    .code-block, .terminal, .console, .debug-info {
      font-family: "${FONTS.mono}", ${FONTS.monoFallback} !important;
    }
    
    .mui-btn, .mui-textfield, .mui-card, .mui-loading-text,
    .v-btn, .v-text-field, .v-card, .v-app-bar,
    .unified-btn, .unified-card, .unified-input {
      font-family: "${FONTS.primary}", "${FONTS.secondary}", ${FONTS.fallback} !important;
    }
    
    .fonts-loaded .font-loading-hidden {
      visibility: visible;
    }
    
    .font-loading-hidden {
      visibility: hidden;
    }
    
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
  const existing = document.getElementById("gaming-font-utilities");
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(styles);
};

// Auto-initialize on import
if (typeof window !== "undefined") {
  // Skip if already initialized by application bootstrap
  if (window.__gamingFontsInit) {
    // Ensure classes exist at least once
    if (!document.getElementById("gaming-font-utilities")) {
      try {
        generateFontClasses();
      } catch {}
    }
  } else {
    // Use document.fonts ready API if available for better timing
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => {
          generateFontClasses();
          initializeElectrolizeFont();
        })
        .catch(() => {
          // Fallback if fonts.ready fails - use requestAnimationFrame for better timing
          const initializeFonts = () => {
            generateFontClasses();
            initializeElectrolizeFont();
          };
          
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(initializeFonts);
          } else {
            setTimeout(initializeFonts, 0);
          }
        });
    } else {
      // Fallback for browsers without document.fonts.ready
      // Listen for DOM ready to ensure proper initialization
      const initializeFonts = () => {
        generateFontClasses();
        initializeElectrolizeFont();
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(initializeFonts);
          } else {
            setTimeout(initializeFonts, 0);
          }
        });
      } else {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(initializeFonts);
        } else {
          setTimeout(initializeFonts, 0);
        }
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
  generateFontClasses,
};
