<template>
  <div v-if="hasError" class="error-boundary min-h-screen flex items-center justify-center p-4">
    <div class="container-md">
      <div class="flex justify-center">
        <div class="w-full max-w-md">
          <div class="glass-strong p-6 rounded-xl neon-red">
            <div class="text-center mb-4">
              <div class="flex items-center justify-center gap-2 mb-2">
                <AppIcon name="mdi-alert" class="text-neon-red text-2xl" />
                <h2 class="text-xl font-bold text-glass-enhanced">Something went wrong</h2>
              </div>
            </div>
            <div class="text-center text-glass-enhanced">
              <p class="mb-3">
                We encountered an unexpected error. This has been logged and our
                team will investigate.
              </p>

              <div v-if="showDetails" class="glass p-3 rounded-lg mt-4 text-left">
                <h6 class="font-medium text-glass-enhanced mb-2">Error Details:</h6>
                <pre class="text-sm font-mono text-glass-enhanced overflow-auto">{{ errorDetails }}</pre>
              </div>

              <div class="flex gap-3 flex-wrap justify-center mt-6">
                <UnifiedButton
                  data-test="retry-button"
                  variant="primary"
                  icon="mdi-refresh"
                  @click="retry"
                >
                  Try Again
                </UnifiedButton>

                <UnifiedButton
                  data-test="go-home-button"
                  variant="outline-secondary"
                  icon="mdi-home"
                  @click="goHome"
                >
                  Go to Dashboard
                </UnifiedButton>

                <UnifiedButton
                  data-test="toggle-details-button"
                  variant="outline-info"
                  :icon="showDetails ? 'mdi mdi-eye-off-outline' : 'mdi mdi-information-outline'"
                  @click="showDetails = !showDetails"
                >
                  {{ showDetails ? 'Hide' : 'Show' }} Details
                </UnifiedButton>

                <UnifiedButton
                  data-test="report-bug-button"
                  variant="outline-warning"
                  icon="mdi-bug"
                  @click="reportBug"
                >
                  Report Issue
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <slot />
  </div>
</template>

<script>
import { ref, onErrorCaptured, computed } from "vue";
import { useRouter, useRoute } from 'vue-router';
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from '@/components/ui/AppIcon.vue';
import { buildSupportMailto } from "@/utils/config";
import { logger } from "@/shared/utils/logger";
import { performanceMonitor } from "@/utils/performance";

export default {
  name: "ErrorBoundary",
  components: { UnifiedButton, AppIcon },
  props: {
    fallbackText: {
      type: String,
      default: "Something went wrong"
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    showReport: {
      type: Boolean,
      default: true
    },
    maxRetries: {
      type: Number,
      default: 3
    }
  },
  setup(_props) {
    const router = useRouter?.() || null;
    const route = useRoute?.() || null;

    const hasError = ref(false);
    const errorDetails = ref("");
    const showDetails = ref(false);
    const retryCount = ref(0);
    const errorSeverity = ref('medium');
    const errorCategory = ref('unknown');
    const recoveryStrategies = ref([]);

    // Categorize error for better user experience
    const categorizeError = (error, info) => {
      const errorMessage = error?.message?.toLowerCase() || '';
      const _errorStack = error?.stack?.toLowerCase() || '';
      const componentInfo = info?.toLowerCase() || '';

      // Network/API errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch') ||
          errorMessage.includes('api') || errorMessage.includes('timeout')) {
        errorCategory.value = 'network';
        recoveryStrategies.value = ['retry', 'check-connection', 'refresh'];
        errorSeverity.value = 'medium';
      }
      // Authentication errors
      else if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') ||
               errorMessage.includes('forbidden') || errorMessage.includes('login')) {
        errorCategory.value = 'auth';
        recoveryStrategies.value = ['login', 'refresh-token'];
        errorSeverity.value = 'high';
      }
      // Resource errors
      else if (errorMessage.includes('chunk') || errorMessage.includes('module') ||
               errorMessage.includes('import') || errorMessage.includes('script')) {
        errorCategory.value = 'resource';
        recoveryStrategies.value = ['reload', 'clear-cache'];
        errorSeverity.value = 'high';
      }
      // Memory/performance errors
      else if (errorMessage.includes('memory') || errorMessage.includes('quota') ||
               errorMessage.includes('performance')) {
        errorCategory.value = 'performance';
        recoveryStrategies.value = ['reload', 'clear-data'];
        errorSeverity.value = 'medium';
      }
      // Data validation errors
      else if (errorMessage.includes('validation') || errorMessage.includes('invalid') ||
               errorMessage.includes('schema') || componentInfo.includes('form')) {
        errorCategory.value = 'validation';
        recoveryStrategies.value = ['form-check', 'reset-form'];
        errorSeverity.value = 'low';
      }
      // Generic errors
      else {
        errorCategory.value = 'generic';
        recoveryStrategies.value = ['retry', 'reload'];
        errorSeverity.value = 'medium';
      }
    };

    onErrorCaptured((_error, instance, info) => {
      // Performance tracking
      performanceMonitor.recordMetric("error", 1, {
        message: _error.message,
        component: instance?.$options?.name || 'unknown',
        route: route?.name || 'unknown',
        severity: errorSeverity.value,
        category: errorCategory.value
      });

      logger.error("Error caught by boundary:", {
        error: _error.message,
        stack: _error.stack,
        component: instance?.$options?.name,
        info,
        route: route?.name || 'unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Categorize the error
      categorizeError(_error, info);

      hasError.value = true;
      errorDetails.value = `${_error.message}\n\nStack trace:\n${_error.stack}\n\nComponent info: ${info}`;

      // Enhanced error logging with context
      if (window.errorTracker) {
        window.errorTracker.captureException(_error, {
          extra: {
            info,
            component: instance?.$options?.name,
            route: route?.name || 'unknown',
            category: errorCategory.value,
            severity: errorSeverity.value,
            retryCount: retryCount.value
          },
          tags: {
            component: instance?.$options?.name,
            route: route?.name || 'unknown',
            category: errorCategory.value,
            severity: errorSeverity.value
          }
        });
      }

      return false; // Prevent error from propagating
    });

    const retry = async () => {
      retryCount.value++;

      if (retryCount.value > _props.maxRetries) {
        logger.warn(`Max retries (${_props.maxRetries}) reached for error boundary`);
        return;
      }

      logger.info(`Retry attempt ${retryCount.value} for error boundary`);

      // For different error categories, use different retry strategies
      try {
        if (errorCategory.value === 'resource') {
          // For resource errors, try to reload the page
          window.location.reload();
        } else if (errorCategory.value === 'network') {
          // For network errors, wait a bit then reset
          await new Promise(resolve => setTimeout(resolve, 2000));
          hasError.value = false;
          errorDetails.value = "";
          showDetails.value = false;
        } else if (errorCategory.value === 'auth') {
          // For auth errors, redirect to login
          router?.push?.("/login") || (window.location.href = "/login");
        } else {
          // Generic retry - reset component state
          hasError.value = false;
          errorDetails.value = "";
          showDetails.value = false;

          // Force component re-render after a short delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          router.go(0);
        }
      } catch (retryError) {
        logger.error("Retry failed:", retryError);
        // If retry fails, at least reset the error state
        hasError.value = false;
        errorDetails.value = "";
        showDetails.value = false;
      }
    };

    const goHome = () => {
      hasError.value = false;
      errorDetails.value = "";
      showDetails.value = false;
      router?.push?.("/") || (window.location.href = "/");
    };

    const reportBug = () => {
      const bugReport = {
        error: errorDetails.value,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Create a simple issue report
      const mailtoLink = buildSupportMailto(
        "Issue Report",
        `Issue Report:\n\n${JSON.stringify(bugReport, null, 2)}\n\nDescribe what you were doing when this error occurred:`,
      );

      window.open(mailtoLink);
    };

    return {
      hasError,
      errorDetails,
      showDetails,
      retry,
      goHome,
      reportBug,
      retryCount,
      errorSeverity,
      errorCategory,
      recoveryStrategies,
    };
  },
};
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-md);
}

pre {
  max-height: 220px;
  overflow-y: auto;
  background: var(--bg-primary);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  font-family: var(--font-family-primary);
  font-size: 0.8rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: var(--shadow-sm);
}

pre:focus {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn {
  margin-bottom: 0.5rem;
}

@media (max-width: 576px) {
  .d-flex.gap-2 {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}

@media (prefers-color-scheme: dark) {
  pre {
    background: var(--dark-bg-secondary);
    border-color: var(--dark-bg-tertiary);
  }
}
</style>
