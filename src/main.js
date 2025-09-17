import { createApp, watch } from "vue";
import { createPinia, setActivePinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "@fontsource/fira-code/variable.css"; // Fira Code variable font
import "./assets/tailwind.css";

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

// Initialize comprehensive font system early
initializeGamingFonts().then((allLoaded) => {
  if (allLoaded) {
    generateFontClasses();
    logger.debug("All gaming fonts loaded successfully");
  } else {
    logger.warn("Some fonts failed to load, using fallbacks");
    generateFontClasses(); // Still generate classes with fallbacks
  }
});

// Unified global theme & styles (single entrypoint)
import "@/styles/main.css";

// TailwindPlus Elements for advanced UI components
import "@tailwindplus/elements";



import { samMaxEasterEggs } from "./utils/samMaxEasterEggs";

// Unified theme management
import { useAppStore } from "./stores/app";

// Optional effects - early initialization of animation fallbacks
import { createAnimationFallback } from "./utils/effects";

// Initialize animation fallbacks early to prevent errors
try {
  createAnimationFallback();
} catch (_e) {
  logger.debug("Animation fallback init failed (non-critical)", _e);
}

// Import performance monitoring
import { performanceMonitor, memoryMonitor } from "./utils/performance";
import { resumeAllAudioContexts } from "@/shared/services/utils";
import { logger } from "./shared/utils/logger";

// Service Worker registration for PWA functionality
import { serviceWorkerManager } from "./utils/serviceWorker";
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
} catch {}

// Register global directives
try {
  app.directive("glass-scroll", glassScrollNav);
} catch {}

// AI Integration Plugin
import { createAIIntegrationPlugin } from "./composables/useAIIntegration.js";
app.use(createAIIntegrationPlugin({ router }));

// Make UI config globally available
app.config.globalProperties.$uiConfig = UI_CONFIG;

// Initialize store + theme early for proper first paint
setActivePinia(pinia);
const store = useAppStore();
try {
  store.loadFromStorage();
} catch (_e) {
  logger.warn("Failed to load saved state:", _e);
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
} catch (_e) {
  logger.debug("Browser compatibility check failed (non-critical):", _e);
}

// Run database migrations to latest schema version (non-blocking)
(async () => {
  try {
    await migrationManager.migrateToLatest();
    logger.info("Database migrations completed successfully");
  } catch (_e) {
    logger.error("Database migration failed:", _e);
  }
})();


try {
  const lang = store.settings?.language || undefined;
  if (lang) {
    setLanguage(lang);
  }
} catch {}

// Initialize AI service if API key is available
try {
  if (store.settings?.geminiApiKey) {
    // Use the canonical AI service for initialization
    import("@/shared/services/AIService")
      .then(async ({ initializeAI: initializeAIService }) => {
        if (initializeAIService) {
          try {
            const result = await initializeAIService({
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
            } else {
              throw new Error(result.message || "AI initialization failed");
            }
          } catch (_error) {
            store.updateAiStatus({
              initialized: false,
              lastError: _error.message,
            });
            logger.warn("Failed to auto-initialize AI service:", _error.message);
          }
        }
      })
      .catch((_e) => {
        logger.debug("AI service import failed (non-critical):", _e);
      });
  } else {
    // Try to initialize with environment variable as fallback
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) {
      import("@/shared/services/AIService")
        .then(async ({ initializeAI: initializeAIService }) => {
          try {
            const result = await initializeAIService({
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
            }
          } catch (_error) {
            logger.debug(
              "Environment API key initialization failed:",
              _error.message,
            );
          }
        })
        .catch((_e) => {
          logger.debug("AI service import failed (non-critical):", _e);
        });
    }
  }
} catch (_e) {
  logger.debug("AI service auto-initialization failed (non-critical):", _e);
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
    .catch((_e) => {
      logger.debug("Failed to sync voice routing prefs (non-critical)", _e);
    });
} catch (_e) {
  logger.debug("Voice routing import failed (non-critical)", _e);
}
// Initialize unified theme system
import("./shared/composables/useUnifiedTheme")
  .then(({ initializeUnifiedThemeGlobal }) => {
    initializeUnifiedThemeGlobal();
    logger.info("🎨 Unified theme system initialized successfully");
  })
  .catch((_e) => {
    logger.debug("Unified theme initialization failed (non-critical):", _e);
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
} catch {}

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
          } catch (_e) {
            logger.debug("App NProgress start failed:", _e);
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
          } catch (_e) {
            logger.debug("App NProgress done failed:", _e);
          }
          appNPStarted = false;
        }
      }
    },
    { immediate: false },
  );
} catch (_e) {
  logger.debug("NProgress watch setup failed:", _e);
}

// Theme initialization is handled by the unified theme system

// Initialize any externally injected status panels (safe, noop if none)
try {
  setTimeout(() => initStatusPanels(document), TIMEOUTS.QUICK);
} catch {}

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
  } catch {}


  try {
    if (state.settings?.language) {
      setLanguage(state.settings.language);
    }
  } catch {}

  // Re-initialize AI service when API key or model changes (dedup identical calls)
  try {
    const newKey = state.settings?.geminiApiKey?.trim?.() || "";
    const newModel = state.settings?.selectedModel || "gemini-2.5-flash";
    window.__lastAiSig = window.__lastAiSig || null;
    const sig = `${newKey}::${newModel}`;
    if (newKey && window.__lastAiSig !== sig) {
      import("./modules/ai")
        .then(async ({ initializeAI: initializeAIClient }) => {
          if (initializeAIClient) {
            try {
              await initializeAIClient(newKey, newModel);
              window.__lastAiSig = sig;
              store.updateAiStatus?.({
                initialized: true,
                model: newModel,
                lastError: null,
              });
              logger.debug("AI service re-initialized after settings change");
            } catch (_error) {
              store.updateAiStatus?.({
                initialized: false,
                lastError: _error.message,
              });
              logger.warn("Failed to re-initialize AI service:", _error.message);
            }
          }
        })
        .catch((_e) => {
          logger.debug("AI client re-initialization failed (non-critical):", _e);
        });
    }
  } catch (_e) {
    logger.debug("AI service re-initialization failed (non-critical):", _e);
  }
});

// Global error handler
app.config.errorHandler = (_error, _instance, info) => {
  logger.error("Global error:", _error);
  logger.error("Component info:", info);

  // Record error for performance monitoring
  performanceMonitor.recordMetric("error", 1, {
    message: _error.message,
    stack: _error.stack,
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

// Initialize Service Worker for PWA functionality
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    serviceWorkerManager.register().then(registered => {
      if (registered) {
        logger.info('Service Worker registered successfully');
        // Register background sync for jobs and profile data
        serviceWorkerManager.registerBackgroundSync('background-sync-jobs');
        serviceWorkerManager.registerBackgroundSync('background-sync-profile');
      }
    });
  });

  // Listen for service worker events
  window.addEventListener('sw-update-available', () => {
    logger.info('App update available');
    // Show update notification (could integrate with toast system)
    if (window.confirm('A new version of NAVI is available. Refresh to update?')) {
      window.location.reload();
    }
  });

  window.addEventListener('app-offline', () => {
    logger.info('App is offline - some features may be limited');
    // Could show offline indicator in header
  });

  window.addEventListener('app-online', () => {
    logger.info('App is back online');
    // Could hide offline indicator
  });
}

// Enable audio output after first user gesture (avoids autoplay policy blocks)
try {
  const resume = async () => {
    try {
      await resumeAllAudioContexts();
    } catch {}
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("keydown", resume);
    window.removeEventListener("touchstart", resume);
  };
  window.addEventListener("pointerdown", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
  window.addEventListener("touchstart", resume, { once: true });
} catch {}


setTimeout(() => {
  try {
    if (samMaxEasterEggs && !samMaxEasterEggs.initialized) {
      samMaxEasterEggs.initialize();
      logger.debug("Sam & Max easter eggs initialized successfully");
    }
  } catch (_e) {
    logger.debug(
        "Sam & Max easter eggs initialization failed (non-critical):",
        _e,
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
