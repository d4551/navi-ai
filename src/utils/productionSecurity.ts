/**
 * Production Security Utilities
 * 
 * Provides secure handling of API keys and sensitive data in production
 */

import { logger } from "@/shared/utils/logger";
import { productionConfig } from "./productionConfig";

export interface SecureStorageOptions {
  encrypt?: boolean;
  expiry?: number; // in milliseconds
  validateOnRetrieve?: boolean;
}

class ProductionSecurity {
  private readonly apiKeyPattern = /^[\w\-_.~]+$/;
  private readonly minApiKeyLength = 32;

  /**
   * Validate an API key format
   */
  validateApiKey(apiKey: string): { valid: boolean; reason?: string } {
    if (!apiKey || typeof apiKey !== 'string') {
      return { valid: false, reason: 'API key is required and must be a string' };
    }

    if (apiKey.length < this.minApiKeyLength) {
      return { valid: false, reason: `API key must be at least ${this.minApiKeyLength} characters` };
    }

    if (!this.apiKeyPattern.test(apiKey)) {
      return { valid: false, reason: 'API key contains invalid characters' };
    }

    // Don't allow obvious test/placeholder keys in production
    if (productionConfig.isProduction()) {
      const testPatterns = [
        /^test/i,
        /^demo/i,
        /^placeholder/i,
        /^example/i,
        /^abc123/i,
        /^your.?key/i,
      ];

      for (const pattern of testPatterns) {
        if (pattern.test(apiKey)) {
          return { valid: false, reason: 'Test/placeholder API keys are not allowed in production' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Safely store sensitive data
   */
  secureStore(key: string, value: string, options: SecureStorageOptions = {}): void {
    try {
      const data = {
        value: options.encrypt ? this.simpleEncrypt(value) : value,
        encrypted: !!options.encrypt,
        timestamp: Date.now(),
        expiry: options.expiry ? Date.now() + options.expiry : null,
      };

      localStorage.setItem(key, JSON.stringify(data));
      
      if (productionConfig.isDevelopment()) {
        logger.debug(`Stored secure data for key: ${key}`);
      }
    } catch (error) {
      logger.error("Failed to store secure data", { key, error });
      throw new Error("Failed to store secure data");
    }
  }

  /**
   * Safely retrieve sensitive data
   */
  secureRetrieve(key: string, options: SecureStorageOptions = {}): string | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);
      
      // Check expiry
      if (data.expiry && Date.now() > data.expiry) {
        this.secureRemove(key);
        return null;
      }

      const value = data.encrypted ? this.simpleDecrypt(data.value) : data.value;

      // Validate on retrieve if requested
      if (options.validateOnRetrieve && key.includes('api')) {
        const validation = this.validateApiKey(value);
        if (!validation.valid) {
          logger.warn(`Invalid API key retrieved: ${validation.reason}`);
          this.secureRemove(key);
          return null;
        }
      }

      return value;
    } catch (error) {
      logger.error("Failed to retrieve secure data", { key, error });
      this.secureRemove(key); // Remove corrupted data
      return null;
    }
  }

  /**
   * Safely remove sensitive data
   */
  secureRemove(key: string): void {
    try {
      localStorage.removeItem(key);
      if (productionConfig.isDevelopment()) {
        logger.debug(`Removed secure data for key: ${key}`);
      }
    } catch (error) {
      logger.error("Failed to remove secure data", { key, error });
    }
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   */
  sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return this.sanitizeString(String(data));
    }

    const sanitized: any = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (this.isSensitiveKey(lowerKey)) {
        sanitized[key] = this.maskSensitiveValue(String(value));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = this.sanitizeString(String(value));
      }
    }

    return sanitized;
  }

  /**
   * Check if a key contains sensitive information
   */
  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      'key',
      'token',
      'password',
      'secret',
      'auth',
      'credential',
      'api',
    ];

    return sensitivePatterns.some(pattern => key.includes(pattern));
  }

  /**
   * Mask sensitive values for logging
   */
  private maskSensitiveValue(value: string): string {
    if (!value || value.length < 8) {
      return '***';
    }
    
    const start = value.slice(0, 4);
    const end = value.slice(-4);
    const middle = '*'.repeat(Math.max(4, value.length - 8));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Sanitize strings for logging
   */
  private sanitizeString(str: string): string {
    // Remove potentially sensitive patterns
    return str
      .replace(/\b[A-Za-z0-9]{32,}\b/g, (match) => this.maskSensitiveValue(match))
      .replace(/\bemail=\S+/gi, 'email=***')
      .replace(/\buser=\S+/gi, 'user=***');
  }

  /**
   * Simple encryption for local storage (not cryptographically secure)
   */
  private simpleEncrypt(text: string): string {
    // This is a simple obfuscation, not real encryption
    // In a real production app, use a proper encryption library
    const key = 'navi-ai-secure-key';
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    
    return btoa(result);
  }

  /**
   * Simple decryption for local storage
   */
  private simpleDecrypt(encrypted: string): string {
    try {
      const text = atob(encrypted);
      const key = 'navi-ai-secure-key';
      let result = '';
      
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(char ^ keyChar);
      }
      
      return result;
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a secure session ID
   */
  generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 32;
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Clear all sensitive data from storage
   */
  clearAllSensitiveData(): void {
    const sensitiveKeys = [
      'gemini_api_key',
      'app-settings',
      'ai-session',
      'user-session',
    ];

    for (const key of sensitiveKeys) {
      this.secureRemove(key);
    }

    logger.info("Cleared all sensitive data from storage");
  }

  /**
   * Validate environment security settings
   */
  validateEnvironmentSecurity(): {
    secure: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (productionConfig.isProduction()) {
      // Check for development features enabled in production
      if (productionConfig.shouldEnableDebugFeatures()) {
        warnings.push('Debug features are enabled in production');
        recommendations.push('Disable debug features in production by setting VITE_ENABLE_DEBUG_FEATURES=false');
      }

      // Check for insecure protocols
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        warnings.push('Application is served over HTTP in production');
        recommendations.push('Use HTTPS in production for secure API key transmission');
      }

      // Check console logging
      if (productionConfig.shouldEnableConsoleLogging()) {
        warnings.push('Console logging is enabled in production');
        recommendations.push('Disable console logging in production to prevent information leakage');
      }
    }

    const secure = warnings.length === 0;

    return { secure, warnings, recommendations };
  }
}

// Export singleton instance
export const productionSecurity = new ProductionSecurity();

// Export convenience functions
export const {
  validateApiKey,
  secureStore,
  secureRetrieve,
  secureRemove,
  sanitizeForLogging,
  generateSessionId,
  clearAllSensitiveData,
  validateEnvironmentSecurity,
} = productionSecurity;