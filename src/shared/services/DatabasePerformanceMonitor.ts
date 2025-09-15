/**
 * DATABASE PERFORMANCE MONITOR
 * ============================
 *
 * Monitors database operations and provides performance insights
 * - Query execution timing
 * - Cache hit/miss ratios
 * - Memory usage tracking
 * - Slow query detection
 * - Performance recommendations
 */

import { logger } from '@/shared/utils/logger';
import { cacheService } from './CacheService';

export interface QueryMetrics {
  operation: string;
  table: string;
  duration: number;
  cacheHit: boolean;
  recordCount?: number;
  timestamp: number;
}

export interface PerformanceStats {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  cacheHitRate: number;
  memoryUsage: number;
  recommendations: string[];
}

class DatabasePerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private maxMetricsHistory = 1000;
  private slowQueryThreshold = 100; // ms

  /**
   * Record a database operation
   */
  recordQuery(
    operation: string,
    table: string,
    duration: number,
    cacheHit: boolean = false,
    recordCount?: number
  ): void {
    const metric: QueryMetrics = {
      operation,
      table,
      duration,
      cacheHit,
      recordCount,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn(`Slow query detected: ${operation} on ${table} took ${duration}ms`);
    }
  }

  /**
   * Execute and monitor a database operation
   */
  async monitorQuery<T>(
    operation: string,
    table: string,
    queryFn: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> {
    const startTime = performance.now();
    let cacheHit = false;

    try {
      // Check cache first if cacheKey provided
      if (cacheKey) {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached !== null) {
          cacheHit = true;
          const duration = performance.now() - startTime;
          this.recordQuery(operation, table, duration, true);
          return cached;
        }
      }

      // Execute the query
      const result = await queryFn();
      const duration = performance.now() - startTime;

      // Record metrics
      const recordCount = Array.isArray(result) ? result.length : undefined;
      this.recordQuery(operation, table, duration, false, recordCount);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordQuery(operation, table, duration, false);
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 5 * 60 * 1000); // Last 5 minutes

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        recommendations: []
      };
    }

    const totalQueries = recentMetrics.length;
    const averageQueryTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries;
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = (cacheHits / totalQueries) * 100;

    // Estimate memory usage
    const memoryUsage = this.estimateMemoryUsage();

    // Generate recommendations
    const recommendations = this.generateRecommendations(recentMetrics, cacheHitRate, slowQueries / totalQueries);

    return {
      totalQueries,
      averageQueryTime: Math.round(averageQueryTime * 100) / 100,
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      memoryUsage,
      recommendations
    };
  }

  /**
   * Get slow queries analysis
   */
  getSlowQueries(limit: number = 10): QueryMetrics[] {
    return this.metrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get query performance by table
   */
  getPerformanceByTable(): Record<string, {
    queries: number;
    averageTime: number;
    cacheHitRate: number;
  }> {
    const tableStats: Record<string, {
      queries: number;
      totalTime: number;
      cacheHits: number;
    }> = {};

    this.metrics.forEach(metric => {
      if (!tableStats[metric.table]) {
        tableStats[metric.table] = {
          queries: 0,
          totalTime: 0,
          cacheHits: 0
        };
      }

      const stats = tableStats[metric.table];
      stats.queries++;
      stats.totalTime += metric.duration;
      if (metric.cacheHit) stats.cacheHits++;
    });

    // Convert to final format
    const result: Record<string, any> = {};
    for (const [table, stats] of Object.entries(tableStats)) {
      result[table] = {
        queries: stats.queries,
        averageTime: Math.round((stats.totalTime / stats.queries) * 100) / 100,
        cacheHitRate: Math.round((stats.cacheHits / stats.queries) * 100 * 100) / 100
      };
    }

    return result;
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
    logger.info('Database performance metrics cleared');
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }

  private estimateMemoryUsage(): number {
    // Rough estimation based on cache service and metrics
    const cacheStats = cacheService.getStats();
    const metricsSize = this.metrics.length * 200; // Rough bytes per metric
    return cacheStats.totalSize + metricsSize;
  }

  private generateRecommendations(
    metrics: QueryMetrics[],
    cacheHitRate: number,
    slowQueryRate: number
  ): string[] {
    const recommendations: string[] = [];

    // Cache recommendations
    if (cacheHitRate < 50) {
      recommendations.push('Consider enabling more aggressive caching for frequently accessed data');
    }

    if (cacheHitRate < 20) {
      recommendations.push('Cache hit rate is very low - review caching strategy');
    }

    // Performance recommendations
    if (slowQueryRate > 0.1) {
      recommendations.push('High number of slow queries detected - consider query optimization');
    }

    // Table-specific recommendations
    const tableStats = this.getPerformanceByTable();
    for (const [table, stats] of Object.entries(tableStats)) {
      if (stats.averageTime > 50 && stats.cacheHitRate < 30) {
        recommendations.push(`Consider adding indexes or improving caching for '${table}' queries`);
      }
    }

    // Query pattern recommendations
    const searchQueries = metrics.filter(m => m.operation.includes('search')).length;
    const totalQueries = metrics.length;
    if (searchQueries / totalQueries > 0.5) {
      recommendations.push('High search query volume - consider implementing search indexes');
    }

    // Memory recommendations
    const memoryUsage = this.estimateMemoryUsage();
    if (memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('High memory usage detected - consider cache cleanup or optimization');
    }

    return recommendations.length > 0 ? recommendations : ['Database performance looks good'];
  }

  /**
   * Start performance monitoring interval
   */
  startMonitoring(intervalMs: number = 60000): void {
    setInterval(() => {
      const stats = this.getStats();
      if (stats.totalQueries > 0) {
        logger.info('Database Performance Stats:', {
          totalQueries: stats.totalQueries,
          averageQueryTime: stats.averageQueryTime,
          cacheHitRate: stats.cacheHitRate,
          slowQueries: stats.slowQueries
        });

        // Log recommendations if any issues detected
        if (stats.slowQueries > 0 || stats.cacheHitRate < 50) {
          stats.recommendations.forEach(rec => logger.warn(`DB Recommendation: ${rec}`));
        }
      }
    }, intervalMs);
  }
}

// Export singleton instance
export const dbPerformanceMonitor = new DatabasePerformanceMonitor();

// Auto-start monitoring in development
if (import.meta.env?.MODE === 'development') {
  dbPerformanceMonitor.startMonitoring(30000); // Every 30 seconds in dev
}