/* eslint-env node */
/**
 * CommonJS Logger for Electron Main Process
 * Simplified version of the unified logger for main process compatibility
 */

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.seenMessages = new Set();
  }

  debug(message, data, context) {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
    }
  }

  info(message, data, context) {
    this.log('info', message, data, context);
  }

  warn(message, data, context) {
    this.log('warn', message, data, context);
  }

  error(message, data, context) {
    this.log('error', message, data, context);
  }

  once(key, level = 'warn', message, data, context) {
    const uniqueKey = String(key);
    if (this.seenMessages.has(uniqueKey)) {
      return;
    }
    this.seenMessages.add(uniqueKey);
    this[level](message, data, context);
  }

  log(level, message, data, context) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    const logMessage = `[${level.toUpperCase()}] ${timestamp} ${contextStr}${message}`;

    // Format data for better console display
    let formattedData = data;
    if (data && typeof data === 'object') {
      try {
        formattedData = JSON.stringify(data, null, 2);
      } catch {
        formattedData = String(data);
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
  }
}

const logger = new Logger();

module.exports = { logger };
