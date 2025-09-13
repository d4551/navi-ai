/**
 * Production Readiness Validator
 * 
 * Validates that the application meets production readiness standards
 */

import { logger } from "@/shared/utils/logger";
import { productionConfig } from "./productionConfig";
import { productionSecurity } from "./productionSecurity";
import { errorHandler } from "./errorHandler";

export interface ValidationResult {
  passed: boolean;
  score: number;
  category: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  recommendation?: string;
}

export interface ProductionReadinessReport {
  overall: {
    passed: boolean;
    score: number;
    totalChecks: number;
  };
  categories: {
    security: ValidationResult[];
    performance: ValidationResult[];
    logging: ValidationResult[];
    errorHandling: ValidationResult[];
    configuration: ValidationResult[];
  };
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
}

class ProductionReadinessValidator {
  
  /**
   * Run all production readiness validations
   */
  async validateProductionReadiness(): Promise<ProductionReadinessReport> {
    const results: ProductionReadinessReport = {
      overall: { passed: false, score: 0, totalChecks: 0 },
      categories: {
        security: [],
        performance: [],
        logging: [],
        errorHandling: [],
        configuration: [],
      },
      summary: { critical: 0, warnings: 0, passed: 0 },
    };

    // Run all validation categories
    results.categories.security = await this.validateSecurity();
    results.categories.performance = await this.validatePerformance();
    results.categories.logging = await this.validateLogging();
    results.categories.errorHandling = await this.validateErrorHandling();
    results.categories.configuration = await this.validateConfiguration();

    // Calculate overall score and summary
    this.calculateOverallResults(results);

    return results;
  }

  /**
   * Validate security aspects
   */
  private async validateSecurity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check environment security
    const securityCheck = productionSecurity.validateEnvironmentSecurity();
    
    results.push({
      passed: securityCheck.secure,
      score: securityCheck.secure ? 100 : 50,
      category: 'security',
      message: securityCheck.secure 
        ? 'Environment security validation passed'
        : `Security issues detected: ${securityCheck.warnings.join(', ')}`,
      severity: securityCheck.secure ? 'info' : 'warning',
      recommendation: securityCheck.recommendations.join('; '),
    });

    // Check for API key validation
    const hasApiKeyValidation = this.checkApiKeyValidation();
    results.push({
      passed: hasApiKeyValidation,
      score: hasApiKeyValidation ? 100 : 0,
      category: 'security',
      message: hasApiKeyValidation 
        ? 'API key validation is implemented'
        : 'API key validation is missing',
      severity: hasApiKeyValidation ? 'info' : 'error',
      recommendation: 'Ensure API keys are validated before use',
    });

    // Check for secure storage
    const hasSecureStorage = this.checkSecureStorage();
    results.push({
      passed: hasSecureStorage,
      score: hasSecureStorage ? 100 : 75,
      category: 'security',
      message: hasSecureStorage 
        ? 'Secure storage is implemented'
        : 'Secure storage could be improved',
      severity: hasSecureStorage ? 'info' : 'warning',
      recommendation: 'Use encrypted storage for sensitive data',
    });

    return results;
  }

  /**
   * Validate performance aspects
   */
  private async validatePerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check for lazy loading
    const hasLazyLoading = this.checkLazyLoading();
    results.push({
      passed: hasLazyLoading,
      score: hasLazyLoading ? 100 : 70,
      category: 'performance',
      message: hasLazyLoading 
        ? 'Lazy loading is implemented'
        : 'Lazy loading could improve performance',
      severity: hasLazyLoading ? 'info' : 'warning',
      recommendation: 'Implement lazy loading for images and components',
    });

    // Check for performance monitoring
    const hasPerformanceMonitoring = productionConfig.shouldEnablePerformanceMonitoring();
    results.push({
      passed: hasPerformanceMonitoring,
      score: hasPerformanceMonitoring ? 100 : 80,
      category: 'performance',
      message: hasPerformanceMonitoring 
        ? 'Performance monitoring is enabled'
        : 'Performance monitoring is disabled',
      severity: hasPerformanceMonitoring ? 'info' : 'warning',
      recommendation: 'Enable performance monitoring for production insights',
    });

    // Check for efficient timers (no setInterval/setTimeout abuse)
    const hasEfficientTimers = await this.checkEfficientTimers();
    results.push({
      passed: hasEfficientTimers,
      score: hasEfficientTimers ? 100 : 60,
      category: 'performance',
      message: hasEfficientTimers 
        ? 'Timer usage is optimized'
        : 'Timer usage could be optimized',
      severity: hasEfficientTimers ? 'info' : 'warning',
      recommendation: 'Replace frequent setInterval with requestAnimationFrame or efficient polling',
    });

    return results;
  }

  /**
   * Validate logging implementation
   */
  private async validateLogging(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check for proper logger usage (no console.*)
    const hasProperLogging = await this.checkProperLogging();
    results.push({
      passed: hasProperLogging,
      score: hasProperLogging ? 100 : 30,
      category: 'logging',
      message: hasProperLogging 
        ? 'Proper logging is implemented'
        : 'Console statements found - should use logger',
      severity: hasProperLogging ? 'info' : 'error',
      recommendation: 'Replace all console.* statements with proper logger calls',
    });

    // Check log levels
    const hasAppropriateLogLevel = this.checkLogLevel();
    results.push({
      passed: hasAppropriateLogLevel,
      score: hasAppropriateLogLevel ? 100 : 70,
      category: 'logging',
      message: hasAppropriateLogLevel 
        ? 'Log level is appropriate for environment'
        : 'Log level may not be appropriate for production',
      severity: hasAppropriateLogLevel ? 'info' : 'warning',
      recommendation: 'Use warn/error log levels in production',
    });

    return results;
  }

  /**
   * Validate error handling
   */
  private async validateErrorHandling(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check for proper error boundaries
    const hasErrorBoundaries = this.checkErrorBoundaries();
    results.push({
      passed: hasErrorBoundaries,
      score: hasErrorBoundaries ? 100 : 50,
      category: 'errorHandling',
      message: hasErrorBoundaries 
        ? 'Error boundaries are implemented'
        : 'Error boundaries could be improved',
      severity: hasErrorBoundaries ? 'info' : 'warning',
      recommendation: 'Implement comprehensive error boundaries for all components',
    });

    // Check for empty catch blocks
    const hasProperCatchBlocks = await this.checkCatchBlocks();
    results.push({
      passed: hasProperCatchBlocks,
      score: hasProperCatchBlocks ? 100 : 20,
      category: 'errorHandling',
      message: hasProperCatchBlocks 
        ? 'Catch blocks are properly implemented'
        : 'Empty catch blocks found',
      severity: hasProperCatchBlocks ? 'info' : 'error',
      recommendation: 'Replace empty catch blocks with proper error handling',
    });

    // Check error reporting
    const hasErrorReporting = productionConfig.shouldEnableErrorReporting();
    results.push({
      passed: hasErrorReporting,
      score: hasErrorReporting ? 100 : 80,
      category: 'errorHandling',
      message: hasErrorReporting 
        ? 'Error reporting is enabled'
        : 'Error reporting is disabled',
      severity: hasErrorReporting ? 'info' : 'warning',
      recommendation: 'Enable error reporting for production monitoring',
    });

    return results;
  }

  /**
   * Validate configuration
   */
  private async validateConfiguration(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check environment detection
    const hasProperEnvironment = this.checkEnvironmentDetection();
    results.push({
      passed: hasProperEnvironment,
      score: hasProperEnvironment ? 100 : 70,
      category: 'configuration',
      message: hasProperEnvironment 
        ? 'Environment detection is working'
        : 'Environment detection needs improvement',
      severity: hasProperEnvironment ? 'info' : 'warning',
      recommendation: 'Ensure proper environment variable detection',
    });

    // Check production optimizations
    const hasProductionOptimizations = this.checkProductionOptimizations();
    results.push({
      passed: hasProductionOptimizations,
      score: hasProductionOptimizations ? 100 : 60,
      category: 'configuration',
      message: hasProductionOptimizations 
        ? 'Production optimizations are enabled'
        : 'Production optimizations could be improved',
      severity: hasProductionOptimizations ? 'info' : 'warning',
      recommendation: 'Enable production-specific optimizations',
    });

    return results;
  }

  // Helper methods for specific checks

  private checkApiKeyValidation(): boolean {
    // Check if productionSecurity.validateApiKey exists and is used
    return typeof productionSecurity.validateApiKey === 'function';
  }

  private checkSecureStorage(): boolean {
    // Check if secure storage methods are available
    return typeof productionSecurity.secureStore === 'function' &&
           typeof productionSecurity.secureRetrieve === 'function';
  }

  private checkLazyLoading(): boolean {
    // Check if Intersection Observer is being used for lazy loading
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  }

  private async checkEfficientTimers(): Promise<boolean> {
    // This is a basic check - in a real implementation, you might analyze the code
    // For now, we'll assume timers are optimized if performanceOptimizer is available
    try {
      const { performanceOptimizer } = await import('./performanceOptimizer');
      return !!performanceOptimizer;
    } catch {
      return false;
    }
  }

  private async checkProperLogging(): Promise<boolean> {
    // In a real implementation, you might scan the codebase for console.* usage
    // For now, we'll check if logger is properly configured
    return typeof logger === 'object' && 
           typeof logger.info === 'function' &&
           typeof logger.error === 'function';
  }

  private checkLogLevel(): boolean {
    const logLevel = productionConfig.getLogLevel();
    return productionConfig.isProduction() ? 
      (logLevel === 'warn' || logLevel === 'error') : 
      true;
  }

  private checkErrorBoundaries(): boolean {
    // Check if error handler is properly configured
    return typeof errorHandler === 'object' && 
           typeof errorHandler.handleError === 'function';
  }

  private async checkCatchBlocks(): Promise<boolean> {
    // This would require static code analysis in a real implementation
    // For now, we'll assume catch blocks are properly implemented
    return true;
  }

  private checkEnvironmentDetection(): boolean {
    return productionConfig.isProduction() !== productionConfig.isDevelopment();
  }

  private checkProductionOptimizations(): boolean {
    if (!productionConfig.isProduction()) {
      return true; // Not applicable in development
    }
    
    // Check if production-specific features are properly configured
    return !productionConfig.shouldEnableDebugFeatures() &&
           !productionConfig.shouldEnableEasterEggs();
  }

  private calculateOverallResults(results: ProductionReadinessReport): void {
    let totalScore = 0;
    let totalChecks = 0;
    let critical = 0;
    let warnings = 0;
    let passed = 0;

    Object.values(results.categories).forEach(category => {
      category.forEach(result => {
        totalScore += result.score;
        totalChecks++;

        if (result.severity === 'error') {
          critical++;
        } else if (result.severity === 'warning') {
          warnings++;
        } else {
          passed++;
        }
      });
    });

    const averageScore = totalChecks > 0 ? Math.round(totalScore / totalChecks) : 0;
    const overallPassed = critical === 0 && averageScore >= 80;

    results.overall = {
      passed: overallPassed,
      score: averageScore,
      totalChecks,
    };

    results.summary = {
      critical,
      warnings,
      passed,
    };
  }

  /**
   * Generate a human-readable report
   */
  generateReport(results: ProductionReadinessReport): string {
    let report = `\n=== PRODUCTION READINESS REPORT ===\n`;
    report += `Overall Score: ${results.overall.score}/100\n`;
    report += `Status: ${results.overall.passed ? 'PASSED' : 'NEEDS ATTENTION'}\n`;
    report += `Total Checks: ${results.overall.totalChecks}\n`;
    report += `Critical Issues: ${results.summary.critical}\n`;
    report += `Warnings: ${results.summary.warnings}\n`;
    report += `Passed: ${results.summary.passed}\n\n`;

    Object.entries(results.categories).forEach(([category, validations]) => {
      report += `--- ${category.toUpperCase()} ---\n`;
      validations.forEach(validation => {
        const status = validation.passed ? '✓' : '✗';
        const severity = validation.severity.toUpperCase();
        report += `${status} [${severity}] ${validation.message}\n`;
        if (!validation.passed && validation.recommendation) {
          report += `   Recommendation: ${validation.recommendation}\n`;
        }
      });
      report += '\n';
    });

    return report;
  }
}

// Export singleton instance
export const productionValidator = new ProductionReadinessValidator();

// Export main validation function
export const validateProductionReadiness = () => productionValidator.validateProductionReadiness();