/**
 * Production-Ready Error Handler
 * 
 * Centralizes error handling and reporting for production environments
 */

import { logger } from "@/shared/utils/logger";
import { productionConfig } from "./productionConfig";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  timestamp: number;
  environment: {
    isProduction: boolean;
    userAgent: string;
    url: string;
  };
}

class ProductionErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 100;

  /**
   * Handle an error with proper logging and reporting
   */
  handleError(
    error: Error,
    context: ErrorContext = {},
    level: 'warn' | 'error' = 'error'
  ): void {
    const errorReport = this.createErrorReport(error, context);
    
    // Log the error appropriately
    if (level === 'error') {
      logger.error(
        `${context.component ? `[${context.component}] ` : ''}${error.message}`,
        {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          context,
        }
      );
    } else {
      logger.warn(
        `${context.component ? `[${context.component}] ` : ''}${error.message}`,
        {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          context,
        }
      );
    }

    // Add to error queue for batch reporting
    this.addToErrorQueue(errorReport);

    // Report immediately if critical error in production
    if (productionConfig.isProduction() && level === 'error') {
      this.reportError(errorReport);
    }
  }

  /**
   * Handle a non-critical error (warning level)
   */
  handleWarning(
    error: Error | string,
    context: ErrorContext = {}
  ): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.handleError(errorObj, context, 'warn');
  }

  /**
   * Handle a critical error that should always be reported
   */
  handleCriticalError(
    error: Error,
    context: ErrorContext = {}
  ): void {
    this.handleError(error, { ...context, critical: true }, 'error');
  }

  /**
   * Create a standardized error report
   */
  private createErrorReport(error: Error, context: ErrorContext): ErrorReport {
    return {
      error,
      context,
      timestamp: Date.now(),
      environment: {
        isProduction: productionConfig.isProduction(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };
  }

  /**
   * Add error to queue for batch reporting
   */
  private addToErrorQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Maintain queue size limit
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Report error to external service
   */
  private async reportError(errorReport: ErrorReport): Promise<void> {
    if (!productionConfig.shouldEnableErrorReporting()) {
      return;
    }

    try {
      // Use existing error tracker if available
      if (typeof window !== 'undefined' && (window as any).errorTracker) {
        (window as any).errorTracker.captureException(errorReport.error, {
          extra: errorReport.context,
          tags: {
            component: errorReport.context.component,
            action: errorReport.context.action,
          },
        });
      }

      // Use Electron IPC if available
      if (typeof window !== 'undefined' && (window as any).api?.app?.reportError) {
        (window as any).api.app.reportError({
          level: 'error',
          message: errorReport.error.message,
          data: errorReport.error,
          context: errorReport.context.component,
        });
      }
    } catch (reportingError) {
      logger.error("Failed to report error to external service", reportingError);
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    queueSize: number;
    recentErrors: number;
    errorsByType: Record<string, number>;
  } {
    const now = Date.now();
    const recentThreshold = 5 * 60 * 1000; // 5 minutes
    
    const recentErrors = this.errorQueue.filter(
      report => now - report.timestamp < recentThreshold
    ).length;

    const errorsByType = this.errorQueue.reduce((acc, report) => {
      const type = report.error.name || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      queueSize: this.errorQueue.length,
      recentErrors,
      errorsByType,
    };
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Create a wrapped function that handles errors automatically
   */
  wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context: ErrorContext = {}
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.handleError(error, context);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), context);
        throw error;
      }
    }) as T;
  }

  /**
   * Create a safe function that handles errors without rethrowing
   */
  safeFn<T extends (...args: any[]) => any>(
    fn: T,
    context: ErrorContext = {},
    defaultReturn?: ReturnType<T>
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.handleWarning(error instanceof Error ? error : new Error(String(error)), context);
            return defaultReturn;
          });
        }
        
        return result;
      } catch (error) {
        this.handleWarning(error instanceof Error ? error : new Error(String(error)), context);
        return defaultReturn;
      }
    }) as T;
  }
}

// Export singleton instance
export const errorHandler = new ProductionErrorHandler();

// Export convenience functions
export const {
  handleError,
  handleWarning,
  handleCriticalError,
  wrapFunction,
  safeFn,
} = errorHandler;