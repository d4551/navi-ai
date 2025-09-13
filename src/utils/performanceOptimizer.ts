/**
 * Production Performance Optimizer
 * 
 * Optimizes the application for production by conditionally disabling
 * expensive development features and improving runtime performance
 */

import { logger } from "@/shared/utils/logger";
import { productionConfig } from "./productionConfig";

export interface PerformanceSettings {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableAssetPreloading: boolean;
  enableServiceWorker: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
  enableRequestDeduplication: boolean;
  enablePerformanceMetrics: boolean;
}

class ProductionPerformanceOptimizer {
  private settings: PerformanceSettings;
  private requestCache = new Map<string, Promise<any>>();
  private pendingRequests = new Set<string>();

  constructor() {
    this.settings = this.initializeSettings();
    this.initializeOptimizations();
  }

  private initializeSettings(): PerformanceSettings {
    return {
      enableLazyLoading: productionConfig.isProduction(),
      enableImageOptimization: productionConfig.isProduction(),
      enableAssetPreloading: productionConfig.isProduction(),
      enableServiceWorker: productionConfig.isProduction(),
      maxConcurrentRequests: productionConfig.isProduction() ? 6 : 10,
      requestTimeout: productionConfig.getApiTimeout(),
      enableRequestDeduplication: true,
      enablePerformanceMetrics: productionConfig.shouldEnablePerformanceMonitoring(),
    };
  }

  private initializeOptimizations(): void {
    if (productionConfig.isProduction()) {
      this.setupLazyLoading();
      this.setupImageOptimization();
      this.setupAssetPreloading();
      this.setupServiceWorker();
    }

    if (this.settings.enablePerformanceMetrics) {
      this.setupPerformanceMetrics();
    }
  }

  /**
   * Setup lazy loading for images and components
   */
  private setupLazyLoading(): void {
    // Lazy load images using Intersection Observer
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe images with data-src attribute
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach((img) => {
          imageObserver.observe(img);
        });
      });
    }
  }

  /**
   * Setup image optimization
   */
  private setupImageOptimization(): void {
    // Add modern image format support detection
    const supportsWebP = this.checkWebPSupport();
    const supportsAVIF = this.checkAVIFSupport();

    if (supportsAVIF || supportsWebP) {
      logger.info(`Image optimization enabled. AVIF: ${supportsAVIF}, WebP: ${supportsWebP}`);
    }
  }

  /**
   * Setup critical asset preloading
   */
  private setupAssetPreloading(): void {
    const criticalAssets = [
      '/fonts/inter-variable.woff2',
      '/fonts/roboto-variable.woff2',
    ];

    criticalAssets.forEach((asset) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = asset.endsWith('.woff2') ? 'font' : 'script';
      if (asset.endsWith('.woff2')) {
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  /**
   * Setup service worker for caching
   */
  private setupServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            logger.info('Service worker registered', { scope: registration.scope });
          })
          .catch((error) => {
            logger.warn('Service worker registration failed', error);
          });
      });
    }
  }

  /**
   * Setup performance metrics collection
   */
  private setupPerformanceMetrics(): void {
    // Collect Core Web Vitals
    if (typeof PerformanceObserver !== 'undefined') {
      this.setupCoreWebVitals();
    }

    // Monitor resource loading
    this.setupResourceMonitoring();
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  private setupCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      logger.debug('LCP', { value: lastEntry.startTime });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        logger.debug('FID', { value: fid });
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      logger.debug('CLS', { value: clsValue });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Setup resource loading monitoring
   */
  private setupResourceMonitoring(): void {
    // Monitor slow resources
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) { // Resources taking more than 1 second
          logger.warn('Slow resource detected', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType,
          });
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  /**
   * Optimized fetch wrapper with deduplication and timeout
   */
  async optimizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const cacheKey = `${url}:${JSON.stringify(options)}`;

    // Request deduplication
    if (this.settings.enableRequestDeduplication && this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!;
    }

    // Rate limiting
    if (this.pendingRequests.size >= this.settings.maxConcurrentRequests) {
      await this.waitForAvailableSlot();
    }

    this.pendingRequests.add(cacheKey);

    // Create request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.settings.requestTimeout);

    const requestPromise = fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
      this.pendingRequests.delete(cacheKey);
      this.requestCache.delete(cacheKey);
    });

    // Cache the promise
    if (this.settings.enableRequestDeduplication) {
      this.requestCache.set(cacheKey, requestPromise);
      // Auto-cleanup cache after 30 seconds
      setTimeout(() => this.requestCache.delete(cacheKey), 30000);
    }

    return requestPromise;
  }

  /**
   * Wait for an available request slot
   */
  private async waitForAvailableSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.pendingRequests.size < this.settings.maxConcurrentRequests) {
          resolve();
        } else {
          setTimeout(checkSlot, 10);
        }
      };
      checkSlot();
    });
  }

  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): T {
    let timeout: NodeJS.Timeout | null = null;
    
    return ((...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
      
      if (callNow) {
        func(...args);
      }
    }) as T;
  }

  /**
   * Throttle function for performance optimization
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  /**
   * Check WebP support
   */
  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  }

  /**
   * Check AVIF support
   */
  private checkAVIFSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').startsWith('data:image/avif');
    } catch {
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.requestCache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get performance settings
   */
  getSettings(): Readonly<PerformanceSettings> {
    return Object.freeze({ ...this.settings });
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      cachedRequests: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      maxConcurrentRequests: this.settings.maxConcurrentRequests,
    };
  }
}

// Export singleton instance
export const performanceOptimizer = new ProductionPerformanceOptimizer();

// Export convenience functions
export const {
  optimizedFetch,
  debounce,
  throttle,
} = performanceOptimizer;

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceOptimizer.cleanup();
  });
}