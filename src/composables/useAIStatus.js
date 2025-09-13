
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/app";
import { aiService } from "@/shared/services/AIService";
import { logger } from "@/shared/utils/logger";

  const store = useAppStore();

  // Status states
  const isOnline = ref(false);
  const isConnecting = ref(false);
  const lastError = ref(null);
  const lastCheck = ref(null);
  const responseTime = ref(null);
  const providerStatus = ref("unknown");

  // Health check interval
  let healthCheckInterval = null;

  // Computed status
  const statusIndicator = computed(() => {
    if (isConnecting.value)
      return { color: "warning", text: "Connecting...", icon: "mdi-loading" };
    if (lastError.value)
      return { color: "error", text: "Error", icon: "mdi-alert-circle" };
    if (isOnline.value)
      return { color: "success", text: "Online", icon: "mdi-check-circle" };
    return { color: "secondary", text: "Offline", icon: "mdi-close-circle" };
  });

  const statusMessage = computed(() => {
    if (isConnecting.value) return "Connecting to AI services...";
    if (lastError.value) return `Error: ${lastError.value}`;
    if (isOnline.value) {
      const rt = responseTime.value ? ` (${responseTime.value}ms)` : "";
      return `AI services online${rt}`;
    }
    return "AI services offline";
  });

  const healthScore = computed(() => {
  });

  // Methods
    try {
      isConnecting.value = true;
      lastError.value = null;

      const startTime = Date.now();
      const isHealthy = await aiService.healthCheck();
      const endTime = Date.now();

      responseTime.value = endTime - startTime;
      isOnline.value = isHealthy;
      lastCheck.value = new Date();

      // Get provider status
      const stats = aiService.getStats();
      providerStatus.value = stats.primaryProvider || "unknown";

      logger.debug("AI health check completed", {
        healthy: isHealthy,
        responseTime: responseTime.value,
        provider: providerStatus.value,
      });
    } catch (error) {
      logger.error("AI health check failed:", error);
      lastError.value = error.message || "Health check failed";
      isOnline.value = false;
      responseTime.value = null;
    } finally {
      isConnecting.value = false;
    }
  }

    stopMonitoring();

    // Initial check
    checkHealth();

    // Periodic checks
    healthCheckInterval = setInterval(checkHealth, intervalMs);

    logger.info("AI status monitoring started");
  }

    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
      logger.info("AI status monitoring stopped");
    }
  }

    isOnline.value = false;
    isConnecting.value = false;
    lastError.value = null;
    lastCheck.value = null;
    responseTime.value = null;
    providerStatus.value = "unknown";
  }

  // Event listeners for AI events
    logger.info("AI initialized event received", event.detail);
    checkHealth();
  }

    logger.warn("AI error event received", event.detail);
    lastError.value = event.detail.error;
    isOnline.value = false;
  }

    // Update last successful interaction time
    lastCheck.value = new Date();
    if (!isOnline.value) {
      isOnline.value = true;
      lastError.value = null;
    }
  }

    logger.warn("AI action failed event received", event.detail);
    lastError.value = event.detail.error;
    // Don't set offline immediately for single failures
    if (
      lastError.value.includes("API key") ||
      lastError.value.includes("quota")
    ) {
      isOnline.value = false;
    }
  }

  // Lifecycle
  onMounted(() => {
    // Listen for AI events
    window.addEventListener("ai-initialized", handleAIInitialized);
    window.addEventListener("ai-error", handleAIError);
    window.addEventListener("ai-action-completed", handleAIActionCompleted);
    window.addEventListener("ai-action-failed", handleAIActionFailed);

    // Start monitoring if AI key is available
    if (store.settings?.geminiApiKey || store.settings?.openaiApiKey) {
      startMonitoring();
    }
  });

  onUnmounted(() => {
    stopMonitoring();

    // Remove event listeners
    window.removeEventListener("ai-initialized", handleAIInitialized);
    window.removeEventListener("ai-error", handleAIError);
    window.removeEventListener("ai-action-completed", handleAIActionCompleted);
    window.removeEventListener("ai-action-failed", handleAIActionFailed);
  });

  return {
    // State
    isOnline: computed(() => isOnline.value),
    isConnecting: computed(() => isConnecting.value),
    lastError: computed(() => lastError.value),
    lastCheck: computed(() => lastCheck.value),
    responseTime: computed(() => responseTime.value),
    providerStatus: computed(() => providerStatus.value),

    // Computed
    statusIndicator,
    statusMessage,
    healthScore,

    // Methods
    checkHealth,
    startMonitoring,
    stopMonitoring,
    reset,
  };
}

export default useAIStatus;
