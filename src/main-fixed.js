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
    logger.debug("All gaming fonts loaded successfully");
  } else {
    logger.warn("Some fonts failed to load, using fallbacks");
    generateFontClasses(); // Still generate classes with fallbacks
  }
});

// Initialize animation fallbacks early to prevent errors
try {
  createAnimationFallback();
} catch (_error) {
  logger.debug("Animation fallback init failed (non-critical)", error);
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(i18n);

// Initialize runtime MDI aliasing to handle legacy classes
try {
  initMdiAliasRuntime();
} catch (_error) {
  logger.debug("MDI alias runtime init failed (non-critical)", error);
}

// Register global directives
try {
  app.directive("glass-scroll", glassScrollNav);
} catch (_error) {
  logger.debug("Glass scroll directive registration failed (non-critical)", error);
}

app.use(createAIIntegrationPlugin({ router }));

// Make UI config globally available
app.config.globalProperties.$uiConfig = UI_CONFIG;

// Initialize store + theme early for proper first paint
setActivePinia(pinia);
const store = useAppStore();
try {
  store.loadFromStorage();
} catch (_error) {
  logger.warn("Failed to load saved state:", error);
}

// Helper: preload common AI prompts and show a subtle toast
async function preloadPromptsAndNotify() {
  if (window.preloadAI?.preloadCommonPrompts) {
    await window.preloadAI.preloadCommonPrompts();
    store.showNotification?.({
      type: "success",
      message: "AI prompts preloaded",
      duration: 2500,
    });
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
} catch (_error) {
  logger.debug("Browser compatibility check failed (non-critical):", error);
}

// Run database migrations to latest schema version (non-blocking)
(async () => {
  try {
    await migrationManager.migrateToLatest();
    logger.info("Database migrations completed successfully");
  } catch (_error) {
    logger.error("Database migration failed:", error);
  }
})();

// Set initial language
try {
  const lang = store.settings?.language;
  if (lang) {
    setLanguage(lang);
  }
} catch (_error) {
  logger.debug("Language initialization failed (non-critical):", error);
}

// Centralized AI initialization function
let lastAIInitSignature = null;

async function initializeAIService(apiKey, model = "gemini-2.5-flash", source = "unknown") {
  const signature = `${apiKey}::${model}`;
  
  // Avoid duplicate initialization
  if (lastAIInitSignature === signature) {
    logger.debug("AI service already initialized with same configuration");
    return;
  }

  try {
    const { initializeAI } = await import("@/shared/services/AIService");
    
    const result = await initializeAI({
      apiKey,
      model,
      primaryProvider: "google",
    });

    if (result.success) {
      lastAIInitSignature = signature;
      store.updateAiStatus({
        initialized: true,
        model: result.model || model,
        lastError: null,
      });
      logger.info(`AI service initialized successfully (source: ${source})`);
      
      // Preload prompts after successful initialization
      preloadPromptsAndNotify().catch(error => {
        logger.debug("Prompt preload failed (non-critical):", error);
      });
    } else {
      throw new Error(result.message || "AI initialization failed");
    }
  } catch (_error) {
    store.updateAiStatus({
      initialized: false,
      lastError: error.message,
    });
    logger.warn(`Failed to initialize AI service (source: ${source}):`, error.message);
  }
}

// Initialize AI service on startup
(async () => {
  // Try settings first
  if (store.settings?.geminiApiKey) {
    await initializeAIService(
      store.settings.geminiApiKey,
      store.settings.selectedModel || "gemini-2.5-flash",
      "settings"
    );
  } 
  // Fall back to environment variable
  else if (import.meta.env.VITE_GEMINI_API_KEY) {
    await initializeAIService(
      import.meta.env.VITE_GEMINI_API_KEY,
      "gemini-2.5-flash",
      "environment"
    );
  }
})();

// Sync voice routing preferences from store
(async () => {
  try {
    const { setVoiceRoutingPreferences } = await import("./utils/voice");
    setVoiceRoutingPreferences({
      ttsProvider: store.settings?.ttsProvider,
      sttProvider: store.settings?.sttProvider,
      micDeviceId: store.settings?.selectedMicId,
      speakerDeviceId: store.settings?.selectedSpeakerId,
      lang: store.settings?.voiceLang,
    });
  } catch (_error) {
    logger.debug("Failed to sync voice routing prefs (non-critical)", error);
  }
})();

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
} catch (_error) {
  logger.debug("Density class application failed (non-critical):", error);
}

// Start/stop NProgress for long-running app operations
let appNPDelayTimer = null;
let appNPStarted = false;

watch(
  () => {
    const loading = store.loading || {};
    return Object.keys(loading).some((key) => loading[key]);
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
        } catch (_error) {
          logger.debug("NProgress start failed:", error);
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
        } catch (_error) {
          logger.debug("NProgress done failed:", error);
        }
        appNPStarted = false;
      }
    }
  },
  { immediate: false }
);

// Initialize status panels
setTimeout(() => {
  try {
    initStatusPanels(document);
  } catch (_error) {
    logger.debug("Status panels init failed (non-critical):", error);
  }
}, TIMEOUTS.QUICK);

// React to settings changes
store.$subscribe((_mutation, state) => {
  // Sync voice routing preferences
  import("./utils/voice")
    .then(({ setVoiceRoutingPreferences }) => {
      setVoiceRoutingPreferences({
        ttsProvider: state.settings?.ttsProvider,
        sttProvider: state.settings?.sttProvider,
        micDeviceId: state.settings?.selectedMicId,
        speakerDeviceId: state.settings?.selectedSpeakerId,
        lang: state.settings?.voiceLang,
      });
    })
    .catch(error => {
      logger.debug("Voice routing sync failed (non-critical):", error);
    });

  // Update language
  if (state.settings?.language) {
    try {
      setLanguage(state.settings.language);
    } catch (_error) {
      logger.debug("Language update failed (non-critical):", error);
    }
  }

  // Re-initialize AI service when API key or model changes
  const newKey = state.settings?.geminiApiKey?.trim?.() || "";
  const newModel = state.settings?.selectedModel || "gemini-2.5-flash";
  
  if (newKey) {
    initializeAIService(newKey, newModel, "settings-change").catch(error => {
      logger.debug("AI re-initialization failed:", error);
    });
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
const resumeAudio = async () => {
  try {
    await resumeAllAudioContexts();
  } catch (_error) {
    logger.debug("Audio context resume failed (non-critical):", error);
  }
};

window.addEventListener("pointerdown", resumeAudio, { once: true });
window.addEventListener("keydown", resumeAudio, { once: true });
window.addEventListener("touchstart", resumeAudio, { once: true });

// Initialize Easter eggs
setTimeout(() => {
  try {
    if (samMaxEasterEggs && !samMaxEasterEggs.initialized) {
      samMaxEasterEggs.initialize();
      logger.debug("Sam & Max easter eggs initialized successfully");
    }
  } catch (_error) {
    logger.debug("Sam & Max easter eggs initialization failed (non-critical):", error);
  }
}, 1500);

// Mark app as ready
performanceMonitor.markEnd("app-initialization");

// Log initial performance metrics after a delay
if (import.meta.env.DEV) {
  setTimeout(() => {
    const perfSummary = performanceMonitor.getSummary?.();
    if (perfSummary) {
      logger.debug("Performance summary:", perfSummary);
    }
    
    const memStatus = memoryMonitor.getStatus();
    if (memStatus) {
      logger.debug("Memory status:", memStatus);
    }
  }, TIMEOUTS.XLONG);
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  performanceMonitor.cleanup();
  memoryMonitor.cleanup();
});