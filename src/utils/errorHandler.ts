/**
 * Enhanced Error Handling Utilities
 * Provides comprehensive error handling and recovery mechanisms
 */

import { logger } from '@/shared/utils/logger'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  timestamp?: string
  userAgent?: string
  url?: string
  [key: string]: any
}

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: Error, attempt: number) => boolean
}

export interface FallbackOptions<T> {
  fallbackValue?: T
  fallbackFunction?: () => T | Promise<T>
  showUserMessage?: boolean
  userMessage?: string
}

export class EnhancedError extends Error {
  public readonly code: string
  public readonly severity: 'low' | 'medium' | 'high' | 'critical'
  public readonly category: string
  public readonly context: ErrorContext
  public readonly recoverable: boolean
  public readonly timestamp: string

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    category: string = 'general',
    context: ErrorContext = {},
    recoverable: boolean = true
  ) {
    super(message)
    this.name = 'EnhancedError'
    this.code = code
    this.severity = severity
    this.category = category
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    }
    this.recoverable = recoverable
    this.timestamp = this.context.timestamp!

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnhancedError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorListeners: Map<string, Array<(error: EnhancedError) => void>> =
    new Map()
  private globalRetryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    retryCondition: (error: Error, attempt: number) => {
      // Don't retry on authentication errors
      if (
        error.message.includes('unauthorized') ||
        error.message.includes('forbidden')
      ) {
        return false
      }
      // Don't retry on validation errors
      if (
        error.message.includes('validation') ||
        error.message.includes('invalid')
      ) {
        return false
      }
      // Retry on network errors, timeouts, and temporary failures
      return attempt <= 3
    },
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Enhanced error wrapping
  wrap(error: unknown, context: ErrorContext = {}): EnhancedError {
    if (error instanceof EnhancedError) {
      return error
    }

    if (error instanceof Error) {
      // Categorize common errors
      let category = 'general'
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
      let code = 'UNKNOWN_ERROR'
      let recoverable = true

      const message = error.message.toLowerCase()

      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('timeout')
      ) {
        category = 'network'
        code = 'NETWORK_ERROR'
        severity = 'medium'
      } else if (
        message.includes('unauthorized') ||
        message.includes('forbidden')
      ) {
        category = 'auth'
        code = 'AUTH_ERROR'
        severity = 'high'
        recoverable = false
      } else if (
        message.includes('validation') ||
        message.includes('invalid')
      ) {
        category = 'validation'
        code = 'VALIDATION_ERROR'
        severity = 'low'
        recoverable = false
      } else if (
        message.includes('chunk') ||
        message.includes('module') ||
        message.includes('import')
      ) {
        category = 'resource'
        code = 'RESOURCE_ERROR'
        severity = 'high'
      } else if (message.includes('memory') || message.includes('quota')) {
        category = 'performance'
        code = 'PERFORMANCE_ERROR'
        severity = 'critical'
      }

      return new EnhancedError(
        error.message,
        code,
        severity,
        category,
        { ...context, originalStack: error.stack },
        recoverable
      )
    }

    // Handle non-Error objects
    const errorMessage =
      typeof error === 'string' ? error : JSON.stringify(error)
    return new EnhancedError(
      errorMessage,
      'UNKNOWN_ERROR',
      'medium',
      'general',
      context,
      true
    )
  }

  // Retry with exponential backoff
  async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    context: ErrorContext = {}
  ): Promise<T> {
    const config = { ...this.globalRetryOptions, ...options }
    let lastError: Error

    for (let attempt = 1; attempt <= config.maxRetries!; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const enhancedError = this.wrap(lastError, { ...context, attempt })

        logger.warn(`Retry attempt ${attempt} failed:`, enhancedError)

        // Check if we should retry
        if (
          attempt === config.maxRetries ||
          !config.retryCondition!(lastError, attempt)
        ) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay! * Math.pow(config.backoffFactor!, attempt - 1),
          config.maxDelay!
        )

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw this.wrap(lastError!, { ...context, finalAttempt: true })
  }

  // Safe execution with fallback
  async safeExecute<T>(
    operation: () => Promise<T>,
    fallbackOptions: FallbackOptions<T> = {},
    context: ErrorContext = {}
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const enhancedError = this.wrap(error, context)
      logger.error('Safe execution failed:', enhancedError)

      this.notifyListeners(enhancedError)

      // Show user message if requested
      if (fallbackOptions.showUserMessage) {
        const message =
          fallbackOptions.userMessage || 'An error occurred. Please try again.'
        this.showUserNotification(message, enhancedError.severity)
      }

      // Return fallback value or execute fallback function
      if (fallbackOptions.fallbackFunction) {
        try {
          return await fallbackOptions.fallbackFunction()
        } catch (fallbackError) {
          logger.error('Fallback function failed:', fallbackError)
        }
      }

      if (fallbackOptions.fallbackValue !== undefined) {
        return fallbackOptions.fallbackValue
      }

      throw enhancedError
    }
  }

  // Register error listeners
  on(category: string, listener: (error: EnhancedError) => void): () => void {
    if (!this.errorListeners.has(category)) {
      this.errorListeners.set(category, [])
    }
    this.errorListeners.get(category)!.push(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.errorListeners.get(category)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  // Notify error listeners
  private notifyListeners(error: EnhancedError): void {
    const listeners = this.errorListeners.get(error.category) || []
    listeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        logger.error('Error listener failed:', listenerError)
      }
    })

    // Notify global listeners
    const globalListeners = this.errorListeners.get('*') || []
    globalListeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        logger.error('Global error listener failed:', listenerError)
      }
    })
  }

  // Show user notification (integrate with your toast/notification system)
  private showUserNotification(message: string, severity: string): void {
    // This would integrate with your notification system
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.show(message, severity)
    } else {
      console.warn('User notification:', message, severity)
    }
  }

  // Report error to external service
  async reportError(
    error: EnhancedError,
    additionalContext: Record<string, any> = {}
  ): Promise<void> {
    try {
      const errorReport = {
        ...error.toJSON(),
        additionalContext,
        reportedAt: new Date().toISOString(),
      }

      // Send to error reporting service (Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && window.errorReporting) {
        await window.errorReporting.captureException(errorReport)
      }

      logger.info('Error reported successfully:', errorReport)
    } catch (reportError) {
      logger.error('Failed to report error:', reportError)
    }
  }

  // Get error statistics
  getErrorStats(): Record<string, any> {
    // This would integrate with your analytics/monitoring system
    return {
      totalErrors: 0, // Would track actual counts
      errorsByCategory: {},
      errorsBySeverity: {},
      lastError: null,
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Global error handler setup
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    const error = errorHandler.wrap(event.reason, {
      type: 'unhandledrejection',
      component: 'global',
    })
    logger.error('Unhandled promise rejection:', error)
    errorHandler.reportError(error)
  })

  // Handle global errors
  window.addEventListener('error', event => {
    const error = errorHandler.wrap(event.error || event.message, {
      type: 'globalerror',
      component: 'global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
    logger.error('Global error:', error)
    errorHandler.reportError(error)
  })
}

// Convenience functions
export const retry = errorHandler.retry.bind(errorHandler)
export const safeExecute = errorHandler.safeExecute.bind(errorHandler)
export const wrapError = errorHandler.wrap.bind(errorHandler)
export const reportError = errorHandler.reportError.bind(errorHandler)
