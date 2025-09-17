/**
 * Logger utility - CommonJS version for Electron main process
 */

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'info'
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    }
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level]
  }

  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
}

const logger = new Logger()

module.exports = { logger }
