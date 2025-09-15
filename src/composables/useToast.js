import { useToast as useVueToastification } from "vue-toastification";
import { logger } from "@/shared/utils/logger";

// Enhanced toast composable with consistent styling and logging
export function useToast() {
  const toast = useVueToastification();

  // Default toast options
  const defaultOptions = {
    timeout: 4000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
  };

  // Success toast
  const success = (message, options = {}) => {
    logger.info("Toast success:", message);
    return toast.success(message, {
      ...defaultOptions,
      ...options,
    });
  };

  // Error toast
  const _error = (message, options = {}) => {
    logger.error("Toast error:", message);
    return toast.error(message, {
      ...defaultOptions,
      timeout: 6000, // Longer timeout for errors
      ...options,
    });
  };

  // Warning toast
  const warning = (message, options = {}) => {
    logger.warn("Toast warning:", message);
    return toast.warning(message, {
      ...defaultOptions,
      timeout: 5000,
      ...options,
    });
  };

  // Info toast
  const info = (message, options = {}) => {
    logger.info("Toast info:", message);
    return toast.info(message, {
      ...defaultOptions,
      ...options,
    });
  };

  // Loading toast (returns a function to update/dismiss)
  const loading = (message = "Loading...", options = {}) => {
    const id = toast.info(message, {
      ...defaultOptions,
      timeout: false, // Don't auto-dismiss
      hideProgressBar: true,
      closeOnClick: false,
      draggable: false,
      ...options,
    });

    return {
      update: (newMessage) => {
        toast.update(id, {
          content: newMessage,
          options: {
            ...defaultOptions,
            timeout: false,
            hideProgressBar: true,
            closeOnClick: false,
            draggable: false,
          },
        });
      },
      dismiss: () => toast.dismiss(id),
      success: (successMessage) => {
        toast.dismiss(id);
        success(successMessage);
      },
      error: (errorMessage) => {
        toast.dismiss(id);
        error(errorMessage);
      },
    };
  };

  // Progress toast
  const progress = (message, initialProgress = 0, options = {}) => {
    const id = toast.info(`${message} (${initialProgress}%)`, {
      ...defaultOptions,
      timeout: false,
      hideProgressBar: false,
      closeOnClick: false,
      draggable: false,
      ...options,
    });

    return {
      update: (progress, newMessage = message) => {
        toast.update(id, {
          content: `${newMessage} (${Math.round(progress)}%)`,
          options: {
            ...defaultOptions,
            timeout: false,
            hideProgressBar: false,
            closeOnClick: false,
            draggable: false,
          },
        });
      },
      complete: (completeMessage) => {
        toast.dismiss(id);
        success(completeMessage);
      },
      fail: (errorMessage) => {
        toast.dismiss(id);
        error(errorMessage);
      },
      dismiss: () => toast.dismiss(id),
    };
  };

  // Clear all toasts
  const clear = () => {
    toast.clear();
  };

  // API response handlers
  const handleApiResponse = (
    _response,
    successMessage,
    errorMessage = "Operation failed",
  ) => {
    if (response && response.success !== false) {
      success(successMessage);
      return true;
    } else {
      const message = response?.message || response?.error || errorMessage;
      error(message);
      return false;
    }
  };

  // Promise handlers
  const handlePromise = (promise, messages = {}) => {
    const {
      loading: loadingMsg = "Processing...",
      success: successMsg = "Operation completed successfully",
      error: errorMsg = "Operation failed",
    } = messages;

    const loadingToast = loading(loadingMsg);

    return promise
      .then((_result) => {
        loadingToast.success(successMsg);
        return result;
      })
      .catch((_error) => {
        const message = error?.message || error?.error || errorMsg;
        loadingToast.error(message);
        throw error;
      });
  };

  // Batch operations
  const batch = (operations, messages = {}) => {
    const {
      loading: loadingMsg = "Processing operations...",
      success: successMsg = "All operations completed",
      error: errorMsg = "Some operations failed",
    } = messages;

    const progressToast = progress(loadingMsg, 0);
    const total = operations.length;
    let completed = 0;
    const results = [];
    const errors = [];

    return Promise.allSettled(
      operations.map(async (operation, index) => {
        try {
          const result = await operation();
          completed++;
          progressToast.update((completed / total) * 100);
          results.push({ index, result });
          return result;
        } catch (_error) {
          completed++;
          progressToast.update((completed / total) * 100);
          errors.push({ index, error });
          throw error;
        }
      }),
    ).then((allResults) => {
      if (errors.length === 0) {
        progressToast.complete(successMsg);
      } else if (errors.length === total) {
        progressToast.fail(errorMsg);
      } else {
        progressToast.fail(`${errors.length} of ${total} operations failed`);
      }

      return { results, errors, allResults };
    });
  };

  // Confirmation toast (requires user action)
  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      const id = toast.warning(message, {
        ...defaultOptions,
        timeout: false,
        closeButton: false,
        draggable: false,
        onClick: () => {
          toast.dismiss(id);
          resolve(true);
        },
        ...options,
      });

      // Auto-dismiss after a reasonable timeout and resolve with false
      setTimeout(() => {
        toast.dismiss(id);
        resolve(false);
      }, 10000); // 10 seconds
    });
  };

  return {
    // Basic toasts
    success,
    error: _error,
    warning,
    info,

    // Advanced toasts
    loading,
    progress,
    confirm,

    // Utilities
    clear,
    handleApiResponse,
    handlePromise,
    batch,

    // Raw toast instance (for advanced use)
    raw: toast,
  };
}

export default useToast;
