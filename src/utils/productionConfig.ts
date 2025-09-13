/**
 * Production Configuration Utility
 * 
 * Centralizes production-ready settings and feature flags
 * to ensure debugging code and development features are properly handled.
 */

import { logger } from "@/shared/utils/logger";

interface ProductionConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  enableDebugFeatures: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  enableConsoleLogging: boolean;
  enableAnimations: boolean;
  enableEasterEggs: boolean;
  apiTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class ProductionConfigManager {
  private config: ProductionConfig;

  constructor() {
    this.config = this.initializeConfig();
  }

  private initializeConfig(): ProductionConfig {
    // Determine environment
    const isProduction = 
      typeof process !== 'undefined' 
        ? process.env.NODE_ENV === 'production'
        : import.meta.env.PROD;
    
    const isDevelopment = !isProduction;

    // Get environment variables with fallbacks
    const enableDebugFeatures = isDevelopment && 
      this.getEnvBool('VITE_ENABLE_DEBUG_FEATURES', isDevelopment);
    
    const enablePerformanceMonitoring = 
      this.getEnvBool('VITE_ENABLE_PERFORMANCE_MONITORING', true);
    
    const enableErrorReporting = 
      this.getEnvBool('VITE_ENABLE_ERROR_REPORTING', isProduction);

    const enableConsoleLogging = 
      this.getEnvBool('VITE_ENABLE_CONSOLE_LOGGING', isDevelopment);

    const enableAnimations = 
      this.getEnvBool('VITE_ENABLE_ANIMATIONS', true);

    const enableEasterEggs = 
      this.getEnvBool('VITE_ENABLE_EASTER_EGGS', isDevelopment);

    const apiTimeout = this.getEnvNumber('VITE_API_TIMEOUT', 30000);

    const logLevel = this.getEnvString('VITE_LOG_LEVEL', 
      isProduction ? 'warn' : 'debug') as ProductionConfig['logLevel'];

    return {
      isProduction,
      isDevelopment,
      enableDebugFeatures,
      enablePerformanceMonitoring,
      enableErrorReporting,
      enableConsoleLogging,
      enableAnimations,
      enableEasterEggs,
      apiTimeout,
      logLevel,
    };
  }

  private getEnvBool(key: string, defaultValue: boolean): boolean {
    const value = this.getEnvString(key);
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    const value = this.getEnvString(key);
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getEnvString(key: string, defaultValue = ''): string {
    // Check process.env first (Node.js environment)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    
    // Check import.meta.env (Vite environment)
    if (typeof import.meta !== 'undefined' && 
        (import.meta as any).env && 
        (import.meta as any).env[key]) {
      return (import.meta as any).env[key] as string;
    }
    
    return defaultValue;
  }

  /**
   * Get the current production configuration
   */
  getConfig(): Readonly<ProductionConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.config.isProduction;
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Check if debug features should be enabled
   */
  shouldEnableDebugFeatures(): boolean {
    return this.config.enableDebugFeatures;
  }

  /**
   * Check if performance monitoring should be enabled
   */
  shouldEnablePerformanceMonitoring(): boolean {
    return this.config.enablePerformanceMonitoring;
  }

  /**
   * Check if error reporting should be enabled
   */
  shouldEnableErrorReporting(): boolean {
    return this.config.enableErrorReporting;
  }

  /**
   * Check if console logging should be enabled
   */
  shouldEnableConsoleLogging(): boolean {
    return this.config.enableConsoleLogging;
  }

  /**
   * Check if animations should be enabled
   */
  shouldEnableAnimations(): boolean {
    return this.config.enableAnimations;
  }

  /**
   * Check if easter eggs should be enabled
   */
  shouldEnableEasterEggs(): boolean {
    return this.config.enableEasterEggs;
  }

  /**
   * Get API timeout setting
   */
  getApiTimeout(): number {
    return this.config.apiTimeout;
  }

  /**
   * Get log level setting
   */
  getLogLevel(): ProductionConfig['logLevel'] {
    return this.config.logLevel;
  }

  /**
   * Log the current configuration (development only)
   */
  logConfig(): void {
    if (this.isDevelopment()) {
      logger.info('Production Configuration', this.config);
    }
  }

  /**
   * Conditionally execute code based on environment
   */
  ifProduction<T>(productionCode: () => T): T | undefined {
    if (this.isProduction()) {
      return productionCode();
    }
    return undefined;
  }

  /**
   * Conditionally execute code based on environment
   */
  ifDevelopment<T>(developmentCode: () => T): T | undefined {
    if (this.isDevelopment()) {
      return developmentCode();
    }
    return undefined;
  }

  /**
   * Execute different code based on environment
   */
  switchEnvironment<T>(
    productionCode: () => T,
    developmentCode: () => T,
  ): T {
    return this.isProduction() ? productionCode() : developmentCode();
  }
}

// Export singleton instance
export const productionConfig = new ProductionConfigManager();

// Export types for use in other modules
export type { ProductionConfig };

// Export convenience functions
export const {
  isProduction,
  isDevelopment,
  shouldEnableDebugFeatures,
  shouldEnablePerformanceMonitoring,
  shouldEnableErrorReporting,
  shouldEnableConsoleLogging,
  shouldEnableAnimations,
  shouldEnableEasterEggs,
  getApiTimeout,
  getLogLevel,
  ifProduction,
  ifDevelopment,
  switchEnvironment,
} = productionConfig;

// Initialize logging of configuration in development
if (productionConfig.isDevelopment()) {
  setTimeout(() => productionConfig.logConfig(), 100);
}