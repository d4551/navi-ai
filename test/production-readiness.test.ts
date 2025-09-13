/**
 * Production Readiness Test
 * 
 * Tests the production readiness improvements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productionConfig } from '@/utils/productionConfig';
import { productionSecurity } from '@/utils/productionSecurity';
import { errorHandler } from '@/utils/errorHandler';
import { productionValidator } from '@/utils/productionValidator';

describe('Production Readiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Production Configuration', () => {
    it('should detect environment correctly', () => {
      const config = productionConfig.getConfig();
      expect(config).toBeDefined();
      expect(typeof config.isProduction).toBe('boolean');
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(config.isProduction).toBe(!config.isDevelopment);
    });

    it('should have appropriate settings for environment', () => {
      const config = productionConfig.getConfig();
      
      if (config.isProduction) {
        expect(config.enableDebugFeatures).toBe(false);
        expect(config.enableEasterEggs).toBe(false);
        expect(config.logLevel).toMatch(/^(warn|error)$/);
      } else {
        expect(config.enableDebugFeatures).toBe(true);
        expect(config.logLevel).toBe('debug');
      }
    });

    it('should provide utility methods', () => {
      expect(typeof productionConfig.isProduction).toBe('function');
      expect(typeof productionConfig.isDevelopment).toBe('function');
      expect(typeof productionConfig.shouldEnableDebugFeatures).toBe('function');
      expect(typeof productionConfig.ifProduction).toBe('function');
      expect(typeof productionConfig.ifDevelopment).toBe('function');
    });
  });

  describe('Production Security', () => {
    it('should validate API keys', () => {
      const validKey = 'AIzaSyBKJ7YsZQ4H6LfJtQo_1234567890ABCDEF';
      const invalidKey = 'short';
      const testKey = 'test-key-invalid';

      const validResult = productionSecurity.validateApiKey(validKey);
      const invalidResult = productionSecurity.validateApiKey(invalidKey);
      const testResult = productionSecurity.validateApiKey(testKey);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.reason).toContain('at least');
      
      // In production, test keys should be rejected
      if (productionConfig.isProduction()) {
        expect(testResult.valid).toBe(false);
        expect(testResult.reason).toContain('Test/placeholder');
      }
    });

    it('should provide secure storage methods', () => {
      expect(typeof productionSecurity.secureStore).toBe('function');
      expect(typeof productionSecurity.secureRetrieve).toBe('function');
      expect(typeof productionSecurity.secureRemove).toBe('function');
    });

    it('should sanitize data for logging', () => {
      const sensitiveData = {
        apiKey: 'secret-key-123456789',
        user: 'testuser',
        normalField: 'normal-value',
      };

      const sanitized = productionSecurity.sanitizeForLogging(sensitiveData);
      
      expect(sanitized.apiKey).not.toBe(sensitiveData.apiKey);
      expect(sanitized.apiKey).toContain('***');
      expect(sanitized.normalField).toBe(sensitiveData.normalField);
    });

    it('should validate environment security', () => {
      const validation = productionSecurity.validateEnvironmentSecurity();
      
      expect(validation).toBeDefined();
      expect(typeof validation.secure).toBe('boolean');
      expect(Array.isArray(validation.warnings)).toBe(true);
      expect(Array.isArray(validation.recommendations)).toBe(true);
    });
  });

  describe('Error Handler', () => {
    it('should handle errors properly', () => {
      const testError = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test' };

      // Should not throw when handling errors
      expect(() => {
        errorHandler.handleError(testError, context);
      }).not.toThrow();

      expect(() => {
        errorHandler.handleWarning(testError, context);
      }).not.toThrow();

      expect(() => {
        errorHandler.handleCriticalError(testError, context);
      }).not.toThrow();
    });

    it('should provide wrapped functions', () => {
      const testFn = vi.fn(() => 'success');
      const errorFn = vi.fn(() => {
        throw new Error('Test error');
      });

      const wrappedTestFn = errorHandler.wrapFunction(testFn);
      const safeFn = errorHandler.safeFn(errorFn, {}, 'default');

      expect(wrappedTestFn()).toBe('success');
      expect(safeFn()).toBe('default');
      expect(testFn).toHaveBeenCalled();
      expect(errorFn).toHaveBeenCalled();
    });

    it('should handle async functions', async () => {
      const asyncTestFn = vi.fn(async () => 'async-success');
      const asyncErrorFn = vi.fn(async () => {
        throw new Error('Async error');
      });

      const wrappedAsyncFn = errorHandler.wrapFunction(asyncTestFn);
      const safeAsyncFn = errorHandler.safeFn(asyncErrorFn, {}, 'async-default');

      await expect(wrappedAsyncFn()).resolves.toBe('async-success');
      await expect(safeAsyncFn()).resolves.toBe('async-default');
    });
  });

  describe('Production Validator', () => {
    it('should validate production readiness', async () => {
      const report = await productionValidator.validateProductionReadiness();

      expect(report).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(typeof report.overall.passed).toBe('boolean');
      expect(typeof report.overall.score).toBe('number');
      expect(report.overall.score).toBeGreaterThanOrEqual(0);
      expect(report.overall.score).toBeLessThanOrEqual(100);

      expect(report.categories).toBeDefined();
      expect(report.categories.security).toBeDefined();
      expect(report.categories.performance).toBeDefined();
      expect(report.categories.logging).toBeDefined();
      expect(report.categories.errorHandling).toBeDefined();
      expect(report.categories.configuration).toBeDefined();

      expect(report.summary).toBeDefined();
      expect(typeof report.summary.critical).toBe('number');
      expect(typeof report.summary.warnings).toBe('number');
      expect(typeof report.summary.passed).toBe('number');
    });

    it('should generate a readable report', async () => {
      const report = await productionValidator.validateProductionReadiness();
      const textReport = productionValidator.generateReport(report);

      expect(typeof textReport).toBe('string');
      expect(textReport.length).toBeGreaterThan(0);
      expect(textReport).toContain('PRODUCTION READINESS REPORT');
      expect(textReport).toContain('Overall Score');
    });
  });

  describe('Integration', () => {
    it('should work together correctly', () => {
      // Test that all utilities can be imported and used together
      expect(productionConfig).toBeDefined();
      expect(productionSecurity).toBeDefined();
      expect(errorHandler).toBeDefined();
      expect(productionValidator).toBeDefined();

      // Test configuration affects security validation
      const securityValidation = productionSecurity.validateEnvironmentSecurity();
      const isProduction = productionConfig.isProduction();

      if (isProduction && productionConfig.shouldEnableDebugFeatures()) {
        expect(securityValidation.warnings.length).toBeGreaterThan(0);
      }
    });

    it('should handle errors gracefully in production utilities', () => {
      // All production utilities should handle errors gracefully
      expect(() => productionConfig.getConfig()).not.toThrow();
      expect(() => productionSecurity.validateEnvironmentSecurity()).not.toThrow();
      expect(() => errorHandler.handleError(new Error('test'))).not.toThrow();
    });
  });
});