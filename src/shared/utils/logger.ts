/**
 * Unified logging utility for NAVI
 * Provides consistent logging across renderer and main processes
 */

import * as Sentry from '@sentry/browser';
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: number;
  context?: string;
}

// Allow optional electron preload API typing in renderer
declare global {
  interface Window {
    api?: any;
  }
}

class Logger {
  private isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  private seenMessages = new Set<string>();
  private reportingEnabled =
    (typeof process !== 'undefined' && (process.env.VITE_ENABLE_SENTRY ?? process.env.ENABLE_SENTRY)) !== 'false';

  constructor() {
    const dsn = typeof process !== 'undefined' && (process.env.VITE_SENTRY_DSN ?? process.env.SENTRY_DSN);
    if (this.reportingEnabled && dsn) {
      Sentry.init({ dsn });
    } else {
      this.reportingEnabled = false;
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
    }
  }

  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  /**
   * Log a message only once per unique key to prevent duplicate warnings
   * @param key Unique identifier for the message
   * @param level Log level ('debug', 'info', 'warn', 'error')
   * @param message Log message
   * @param data Optional data to log
   * @param context Optional context string
   */
  once(key: string, level: LogEntry['level'] = 'warn', message: string, data?: any, context?: string): void {
    const uniqueKey = String(key);
    if (this.seenMessages.has(uniqueKey)) {
      return;
    }
    this.seenMessages.add(uniqueKey);
    this[level](message, data, context);
  }

  private log(level: LogEntry['level'], message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: Date.now(),
      context
    };

    // Console output with appropriate styling
    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = new Date(entry.timestamp).toISOString();
    const contextStr = context ? `[${context}] ` : '';
    
    const logMessage = `${prefix} ${timestamp} ${contextStr}${message}`;

    // Format data for better console display
    let formattedData: any = data;
    // Preserve real Error objects so console shows stack/details
    if (data instanceof Error) {
      formattedData = data;
    } else if (data && typeof data === 'object') {
      // Safely stringify objects (handle circular refs and nested Errors)
      try {
        const seen = new WeakSet();
        formattedData = JSON.stringify(
          _data,
          (key, value) => {
            if (value instanceof Error) {
              return { name: value.name, message: value.message, stack: value.stack };
            }
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return '[Circular]';
              seen.add(value);
            }
            return value;
          },
          2,
        );
      } catch (_e) {
        formattedData = String(_data);
      }
    }

    switch (level) {
      case 'debug':
        console.debug(logMessage, formattedData || '');
        break;
      case 'info':
        console.info(logMessage, formattedData || '');
        break;
      case 'warn':
        console.warn(logMessage, formattedData || '');
        break;
      case 'error':
        console.error(logMessage, formattedData || '');
        break;
    }

    // In production, you might want to send to a logging service
    if (!this.isDevelopment && level === 'error') {
      this.reportError(entry);
    }
  }

  setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
  }

  private reportError(entry: LogEntry): void {
    if (!this.reportingEnabled) {
      return;
    }
    try {
      Sentry.withScope(scope => {
        const sentryLevel = (entry.level === 'warn' ? 'warning' : entry.level) as Sentry.SeverityLevel;
        scope.setLevel(sentryLevel);
        if (entry.context) scope.setTag('context', entry.context);
        if (entry.data) scope.setContext('data', entry.data);
        const error =
          entry.data instanceof Error ? entry.data : new Error(entry.message);
        Sentry.captureException(_error);
      });
      if (typeof window !== 'undefined' && window.api?.app?.reportError) {
        window.api.app.reportError(entry);
      }
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }
}

export const logger = new Logger();
