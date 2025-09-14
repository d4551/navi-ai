import { createApp, watch } from "vue";
import { createPinia, setActivePinia } from "pinia";
import App from "./App.vue";

// Add ripple utility import (auto-inits)
import "./utils/ripple.js";

import "./utils/ai-systems-check.js";

// Browser compatibility check
import {
  checkAICompatibility,
  checkMultimediaCompatibility,
  createCompatibilityErrorMessage,
  logBrowserCompatibility,
} from "./utils/browserCompatibility";

// Centralized UI Configuration
import UI_CONFIG from "./config/ui-config.js";

// Vuetify plugin (configured to use Material Design tokens)
import vuetify from "./plugins/vuetify";

// Import unified font system with proper integration
import {
  initializeGamingFonts,
  generateFontClasses,
} from "./utils/fontIntegration";

// Optional effects - early initialization of animation fallbacks
import { createAnimationFallback } from "./utils/effects";

// Import performance monitoring
import { performanceMonitor, memoryMonitor } from "./utils/performance";
import { resumeAllAudioContexts } from "@/shared/services/utils";
import { logger } from "./shared/utils/logger";
import { TIMEOUTS } from "./utils/config";
import NProgress from "nprogress";
// Material MUI CSS replaced by master-theme.css
import { initStatusPanels } from "@/utils/statusPanel";
import { initMdiAliasRuntime } from "@/utils/mdiAliasRuntime";

// Router
import router from "./router";
// Global directive: glass scroll nav
import glassScrollNav from "./directives/glassScrollNav";
import i18n, { setLanguage } from "@/utils/i18n";
// DB migrations
import migrationManager from "@/modules/db/migrations/index";

import { samMaxEasterEggs } from "./utils/samMaxEasterEggs";

// Unified theme management
import { useAppStore } from "./stores/app";

// AI Integration Plugin
import { createAIIntegrationPlugin } from "./composables/aiIntegration.js";

// Unified global theme & styles (single entrypoint)
import "@/styles/index.css";

// Initialize comprehensive font system early
initializeGamingFonts().then((allLoaded) => {
  if (allLoaded) {
    generateFontClasses();
    console.debug("All gaming fonts loaded successfully");
  } else {
    console.warn("Some fonts failed to load, using fallbacks");
    generateFontClasses(); // Still generate classes with fallbacks
  }
});

// Initialize animation fallbacks early to prevent errors
try {
  createAnimationFallback();
} catch {
  console.debug("Animation fallback init failed (non-critical)", error);
}

// Route performance monitoring is now configured inside src/router/index.js

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(i18n);

// Initialize runtime MDI aliasing to handle legacy classes
try {
  initMdiAliasRuntime();
} catch {
  // Silent fail
}

// Register global directives
try {
  app.directive("glass-scroll", glassScrollNav);
} catch {
  // Silent fail
}

app.use(createAIIntegrationPlugin({ router }));

// Make UI config globally available
app.config.globalProperties.$uiConfig = UI_CONFIG;

// Initialize store + theme early for proper first paint
setActivePinia(pinia);
const store = useAppStore();
try {
  store.loadFromStorage();
} catch {
  logger.warn("Failed to load saved state:", error);
}

// Helper: preload common AI prompts and show a subtle toast
async function preloadPromptsAndNotify() {
  try {
    const p = window.preloadAI?.preloadCommonPrompts?.();
    if (p && typeof p.then === "function") {
      await p;
    }
    try {
      store.showNotification?.({
        type: "success",
        message: "AI prompts preloaded",
        duration: 2500,
      });
    } catch {
      // Silent fail
    }
  } catch {
    // Silent fail
  }
}

// Browser compatibility check
try {
  const aiCompat = checkAICompatibility();
  const mmCompat = checkMultimediaCompatibility();

  if (!aiCompat.isCompatible) {
    const message = createCompatibilityErrorMessage(aiCompat.missingFeatures);
    logger.error("Browser compatibility issues found:", message);

    // Show user notification if possible
    if (store.showNotification) {
      store.showNotification({
        type: "warning",
        message: "Browser Compatibility Warning: " + message,
        duration: 8000,
      });
    }
  } else if (aiCompat.warnings.length > 0) {
    logger.warn("AI feature warnings:", aiCompat.warnings);
  }

  if (mmCompat.supportLevel === "none") {
    logger.warn("Multimedia features are not supported in this browser");
  } else if (mmCompat.supportLevel === "minimal") {
    logger.warn("Limited multimedia support detected");
  }

  // Log full compatibility info in development
  if (import.meta.env.DEV) {
    logBrowserCompatibility();
  }
} catch {
  logger.debug("Browser compatibility check failed (non-critical):", error);
}

// Run database migrations to latest schema version (non-blocking)
(async () => {
  try {
    await migrationManager.migrateToLatest();
    logger.info("Database migrations completed successfully");
  } catch {
    logger.error("Database migration failed:", error);
  }
})();

try {
  const lang = store.settings?.language || undefined;
  if (lang) {
    setLanguage(lang);
  }
} catch {
  // Silent fail
}

// Initialize AI service if API key is available
try {
  if (store.settings?.geminiApiKey) {
    // Use the canonical AI service for initialization
    import("@/shared/services/AIService")
      .then(async ({ initializeAI }) => {
        if (initializeAI) {
          try {
            const result = await initializeAI({
              apiKey: store.settings.geminiApiKey,
              model: store.settings.selectedModel || "gemini-2.5-flash",
              primaryProvider: "google",
            });
            if (result.success) {
              store.updateAiStatus({
                initialized: true,
                model:
                  result.model ||
                  store.settings.selectedModel ||
                  "gemini-2.5-flash",
                lastError: null,
              });
              logger.info("AI service automatically initialized on startup");
              try { 
                preloadPromptsAndNotify(); 
              } catch {
                // Silent fail
              }
            } else {
              throw new Error(result.message || "AI initialization failed");
            }
          } catch {
            store.updateAiStatus({
              initialized: false,
              lastError: error.message,
            });
            logger.warn("Failed to auto-initialize AI service:", error.message);
          }
        }
      })
      .catch((_error) => {
        logger.debug("AI service import failed (non-critical):", error);
      });
  } else {
    // Try to initialize with environment variable as fallback
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) {
      import("@/shared/services/AIService")
        .then(async ({ initializeAI }) => {
          try {
            const result = await initializeAI({
              apiKey: envKey,
              model: "gemini-2.5-flash",
              primaryProvider: "google",
            });
            if (result.success) {
              store.updateAiStatus({
                initialized: true,
                model: result.model || "gemini-2.5-flash",
                lastError: null,
              });
              logger.info("AI service initialized with environment API key");
              try { 
                preloadPromptsAndNotify(); 
              } catch {
                // Silent fail
              }
            }
          } catch {
            logger.debug(
              "Environment API key initialization failed:",
              error.message,
            );
          }
        })
        .catch((_error) => {
          logger.debug("AI service import failed (non-critical):", error);
        });
    }
  }
} catch {
  logger.debug("AI service auto-initialization failed (non-critical):", error);
}

// Sync voice routing preferences from store (avoid top-level await for build targets)
try {
  import("./utils/voice")
    .then(({ setVoiceRoutingPreferences }) =>
      setVoiceRoutingPreferences({
        ttsProvider: store.settings?.ttsProvider,
        sttProvider: store.settings?.sttProvider,
        micDeviceId: store.settings?.selectedMicId,
        speakerDeviceId: store.settings?.selectedSpeakerId,
        lang: store.settings?.voiceLang,
      }),
    )
    .catch((_error) => {
      logger.debug("Failed to sync voice routing prefs (non-critical)", error);
    });
} catch {
  logger.debug("Voice routing import failed (non-critical)", error);
}

// Initialize unified theme system
import("./shared/composables/useUnifiedTheme")
  .then(({ initializeUnifiedThemeGlobal }) => {
    initializeUnifiedThemeGlobal();
    logger.info("🎨 Unified theme system initialized successfully");
  })
  .catch((_error) => {
    logger.debug("Unified theme initialization failed (non-critical):", error);
  });

// Apply comfortable density by default if no density class is set
try {
  const root = document.documentElement;
  if (
    !root.classList.contains("density-compact") &&
    !root.classList.contains("density-comfortable")
  ) {
    root.classList.add("density-comfortable");
  }
} catch {
  // Silent fail
}

// Theme change handling is now managed by the unified theme system
// The unified system automatically handles theme persistence and system preference changes

// Start/stop NProgress for long-running app operations (any loading flag), debounced
let appNPDelayTimer = null;
let appNPStarted = false;
try {
  watch(
    () => {
      const l = store.loading || {};
      return Object.keys(l).some((k) => !!l[k]);
    },
    (busy) => {
      if (busy) {
        if (appNPDelayTimer) {
          clearTimeout(appNPDelayTimer);
        }
        appNPDelayTimer = setTimeout(() => {
          try {
            NProgress.start();
            appNPStarted = true;
          } catch {
            logger.debug("App NProgress start failed:", error);
          }
        }, TIMEOUTS.QUICK);
      } else {
        if (appNPDelayTimer) {
          clearTimeout(appNPDelayTimer);
          appNPDelayTimer = null;
        }
        if (appNPStarted) {
          try {
            NProgress.done();
          } catch {
            logger.debug("App NProgress done failed:", error);
          }
          appNPStarted = false;
        }
      }
    },
    { immediate: false },
  );
} catch {
  logger.debug("NProgress watch setup failed:", error);
}

// Theme initialization is handled by the unified theme system

// Initialize any externally injected status panels (safe, noop if none)
try {
  setTimeout(() => initStatusPanels(document), TIMEOUTS.QUICK);
} catch {
  // Silent fail
}

// React to settings changes
store.$subscribe((_mutation, state) => {
  // Theme changes are now handled automatically by the unified theme system
  // Sync voice routing preferences
  try {
    import("./utils/voice").then(({ setVoiceRoutingPreferences }) =>
      setVoiceRoutingPreferences({
        ttsProvider: state.settings?.ttsProvider,
        sttProvider: state.settings?.sttProvider,
        micDeviceId: state.settings?.selectedMicId,
        speakerDeviceId: state.settings?.selectedSpeakerId,
        lang: state.settings?.voiceLang,
      }),
    );
  } catch {
    // Silent fail
  }

  try {
    if (state.settings?.language) {
      setLanguage(state.settings.language);
    }
  } catch {
    // Silent fail
  }

  // Re-initialize AI service when API key or model changes (dedup identical calls)
  try {
    const newKey = state.settings?.geminiApiKey?.trim?.() || "";
    const newModel = state.settings?.selectedModel || "gemini-2.5-flash";
    window.__lastAiSig = window.__lastAiSig || null;
    const sig = `${newKey}::${newModel}`;
    if (newKey && window.__lastAiSig !== sig) {
      import("./modules/ai/index")
        .then(async ({ initializeAI }) => {
          if (initializeAI) {
            try {
              await initializeAI(newKey, newModel);
              window.__lastAiSig = sig;
              store.updateAiStatus?.({
                initialized: true,
                model: newModel,
                lastError: null,
              });
              logger.debug("AI service re-initialized after settings change");
              try { 
                preloadPromptsAndNotify(); 
              } catch {
                // Silent fail
              }
            } catch {
              store.updateAiStatus?.({
                initialized: false,
                lastError: error.message,
              });
              logger.warn("Failed to re-initialize AI service:", error.message);
            }
          }
        })
        .catch((_error) => {
          logger.debug("AI client re-initialization failed (non-critical):", error);
        });
    }
  } catch {
    logger.debug("AI service re-initialization failed (non-critical):", error);
  }
});

// Global error handler
app.config.errorHandler = (_error, _instance, info) => {
  logger.error("Global error:", error);
  logger.error("Component info:", info);

  // Record error for performance monitoring
  performanceMonitor.recordMetric("error", 1, {
    message: error.message,
    stack: error.stack,
    componentInfo: info,
    route: router.currentRoute.value.name,
  });

  // Log to external service if available
  if (window.errorTracker) {
    window.errorTracker.captureException(_error, {
      extra: { info, route: router.currentRoute.value.name },
    });
  }
};

// Performance monitoring for page load
performanceMonitor.markStart("app-initialization");

app.mount("#app");

// Enable audio output after first user gesture (avoids autoplay policy blocks)
try {
  const resume = async () => {
    try {
      await resumeAllAudioContexts();
    } catch {
      // Silent fail
    }
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("keydown", resume);
    window.removeEventListener("touchstart", resume);
  };
  window.addEventListener("pointerdown", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
  window.addEventListener("touchstart", resume, { once: true });
} catch {
  // Silent fail
}

setTimeout(() => {
  try {
    if (samMaxEasterEggs && !samMaxEasterEggs.initialized) {
      samMaxEasterEggs.initialize();
      logger.debug("Sam & Max easter eggs initialized successfully");
    }
  } catch {
    logger.debug(
      "Sam & Max easter eggs initialization failed (non-critical):",
      error,
    );
  }
}, 1500);

// Mark app as ready
performanceMonitor.markEnd("app-initialization");

// Log initial performance metrics after a delay
setTimeout(() => {
  if (import.meta.env.DEV) {
    const pm = performanceMonitor.getSummary?.() || null;
    if (pm) {
      logger.debug("Perf summary:", pm);
    }
    const status = memoryMonitor.getStatus();
    if (status) {
      logger.debug("Memory status:", status);
    }
  }
}, TIMEOUTS.XLONG);

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  performanceMonitor.cleanup();
  memoryMonitor.cleanup();
});
