import { logger } from "@/shared/utils/logger";


class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      userInteractions: [],
      errors: [],
    };

    this.observers = new Set();
    this.lastClsWarning = null; // For debouncing CLS warnings
    this.setupPerformanceObserver();
  }

  setupPerformanceObserver() {
    // Skip performance monitoring if not supported or if explicitly disabled
    if (
      typeof window === "undefined" ||
      window.DISABLE_PERFORMANCE_MONITORING
    ) {
      console.debug("Performance monitoring disabled or not supported");
      return;
    }

    if (typeof PerformanceObserver !== "undefined") {
      try {
        // Largest Contentful Paint (LCP)
        let pendingLcp = 0;
        const finalizeLcp = () => {
          if (pendingLcp > 0) {
            this.recordMetric("lcp", Math.round(pendingLcp));
          }
        };

        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry && typeof lastEntry.startTime === "number") {
            pendingLcp = lastEntry.startTime;
          }
        });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            this.recordMetric("fid", entry.processingStart - entry.startTime);
          });
        });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              // Log detailed CLS information for debugging
              if (entry.value > 0.1) {
                console.debug("CLS Entry details:", {
                  value: entry.value,
                  startTime: entry.startTime,
                  sources:
                    entry.sources?.map((source) => ({
                      node: source.node?.tagName || "unknown",
                      previousRect: source.previousRect,
                      currentRect: source.currentRect,
                    })) || [],
                });
              }
              this.recordMetric("cls", entry.value);
            }
          });
        });

        try {
          // Check if entryTypes are supported before observing
          const supportedEntryTypes =
            PerformanceObserver.supportedEntryTypes || [];

          if (supportedEntryTypes.includes("largest-contentful-paint")) {
            lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
            this.observers.add(lcpObserver);
            // Finalize on page hide to avoid late, inflated readings
            document.addEventListener(
              "visibilitychange",
              () => {
                if (document.visibilityState === "hidden") {
                  finalizeLcp();
                }
              },
              { once: true },
            );
            window.addEventListener("pagehide", finalizeLcp, { once: true });
          }

          if (supportedEntryTypes.includes("first-input")) {
            fidObserver.observe({ entryTypes: ["first-input"] });
            this.observers.add(fidObserver);
          }

          if (supportedEntryTypes.includes("layout-shift")) {
            clsObserver.observe({ entryTypes: ["layout-shift"] });
            this.observers.add(clsObserver);
          }

          // If no entry types are supported, warn once
          if (
            !["largest-contentful-paint", "first-input", "layout-shift"].some(
              (type) => supportedEntryTypes.includes(type),
            )
          ) {
            logger.warn("No supported performance entry types found");
          }
        } catch (_error) {
          logger.warn("Performance Observer not fully supported:", error);
        }
      } catch (_error) {
        console.warn("Failed to setup performance monitoring:", error);
      }
    } else {
      logger.warn(
        "PerformanceObserver API not available; performance metrics will be skipped",
      );
    }
  }

  // Record a performance metric
  recordMetric(type, value, metadata = {}) {
    const metric = {
      type,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
      metadata,
    };

    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }

    this.metrics[type].push(metric);

    // Limit stored metrics to prevent memory issues
    if (this.metrics[type].length > 100) {
      this.metrics[type] = this.metrics[type].slice(-50);
    }

    // Log significant performance issues
    this.checkThresholds(type, value);
  }

  // Check performance thresholds and warn
  checkThresholds(type, value) {
    const thresholds = {
      lcp: 2500, // 2.5 seconds
      fid: 100,  // 100 milliseconds
      cls: 0.1   // 0.1 cumulative layout shift
    };

    // Add debouncing for CLS to avoid excessive warnings
    if (type === "cls") {
      const now = Date.now();
      if (this.lastClsWarning && now - this.lastClsWarning < 1000) {
        return;
      }
      this.lastClsWarning = now;
    }

    if (thresholds[type] && value > thresholds[type]) {
      logger.warn(`Performance threshold exceeded for ${type}:`, {
        value,
        threshold: thresholds[type],
        url: window.location.pathname,
      });
    }
  }

  // Mark the start of an operation
  markStart(operationName) {
    performance.mark(`${operationName}-start`);
    return operationName;
  }

  // Mark the end of an operation and record duration
  markEnd(operationName, metadata = {}) {
    performance.mark(`${operationName}-end`);

    try {
      // Check if start mark exists before trying to measure
      const startMarks = performance.getEntriesByName(
        `${operationName}-start`,
        "mark",
      );
        // Start mark doesn't exist, skip measurement but don't warn
      }

      performance.measure(
        operationName,
        `${operationName}-start`,
        `${operationName}-end`,
      );

      this.recordMetric("operation", measure.duration, {
        name: operationName,
        ...metadata,
      });

      // Clean up marks
      performance.clearMarks(`${operationName}-start`);
      performance.clearMarks(`${operationName}-end`);
      performance.clearMeasures(operationName);

      return measure.duration;
    } catch (_error) {
      // Only log actual unexpected errors, not missing marks
      if (!error.message.includes("does not exist")) {
        logger.warn("Failed to measure operation:", operationName, error);
      }
    }
  }

  // Record API call performance
  recordApiCall(url, duration, success, errorType = null) {
    this.recordMetric("apiCall", duration, {
      url,
      success,
      errorType,
    });
  }

  // Record user interaction performance
  recordUserInteraction(action, duration, metadata = {}) {
    this.recordMetric("interaction", duration, {
      action,
      ...metadata,
    });
  }

  // Get performance summary
  getSummary() {
    const summary = {};

    Object.keys(this.metrics).forEach((type) => {
      const metrics = this.metrics[type];
        const values = metrics.map((m) => m.value);
        summary[type] = {
          count: metrics.length,
          median: this.calculateMedian(values),
          max: Math.max(...values),
          min: Math.min(...values),
        };
      }
    });

    return summary;
  }

  // Calculate median
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
      : sorted[mid];
  }

  // Calculate percentile
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[index];
  }

  // Export data for analysis
  exportData() {
    return {
      metrics: this.metrics,
      summary: this.getSummary(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (_error) {
        logger.warn("Failed to disconnect observer:", error);
      }
    });
    this.observers.clear();
  }
}

class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Monitor memory usage periodically
    this.intervalId = setInterval(() => {
      this.measureMemory();
  }

  measureMemory() {
    if ("memory" in performance) {
      const memory = performance.memory;
      const measurement = {
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };

      this.measurements.push(measurement);

      }

      // Check for memory leaks
      this.checkMemoryLeaks();
    }
  }

  checkMemoryLeaks() {
      return;
    }

    const trend = this.calculateTrend(recent.map((m) => m.usedJSHeapSize));

    // If memory usage is consistently increasing
      logger.warn("Potential memory leak detected:", {
        trend,
        measurements: recent,
      });
    }
  }

  calculateTrend(values) {
    }

    const n = values.length;

    return slope / (sumY / n); // Normalize by average
  }

  getStatus() {
    if (!this.measurements.length) {
      return null;
    }

    const usagePercentage =

    return {
      usagePercentage: Math.round(usagePercentage),
      measurementCount: this.measurements.length,
    };
  }

  cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

const performanceMonitor = new PerformanceMonitor();
const memoryMonitor = new MemoryMonitor();

export { PerformanceMonitor, MemoryMonitor, performanceMonitor, memoryMonitor };

if (typeof window !== "undefined") {
  window.performanceMonitor = performanceMonitor;
  window.memoryMonitor = memoryMonitor;
}
