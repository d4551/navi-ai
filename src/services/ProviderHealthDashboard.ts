
import { logger } from "@/shared/utils/logger";

export interface ProviderHealthMetric {
  lastCheck: number;
  status: "healthy" | "degraded" | "failed";
  consecutiveFailures: number;
  averageResponseTime: number;
  lastSuccessfulCheck: number;
  errorCount: number;
  totalChecks: number;
}

export interface ProviderHealthReport {
  providerName: string;
  providerType: string;
  metrics: ProviderHealthMetric;
  isEnabled: boolean;
  lastError?: string;
}

export class ProviderHealthDashboard {
  private static instance: ProviderHealthDashboard;
  private readonly HEALTH_STORAGE_KEY = "navi-provider-health";

  static getInstance(): ProviderHealthDashboard {
    if (!ProviderHealthDashboard.instance) {
      ProviderHealthDashboard.instance = new ProviderHealthDashboard();
    }
    return ProviderHealthDashboard.instance;
  }

  getProviderHealthReport(): ProviderHealthReport[] {
    try {
      const healthData = this.loadHealthData();
      const reports: ProviderHealthReport[] = [];

      for (const [providerKey, metrics] of Object.entries(healthData)) {
        const [type, name] = providerKey.split(":");

        reports.push({
          providerName: name || type,
          providerType: type,
          metrics: {
            ...metrics,
            // Ensure all required fields exist
            status: metrics.status || "healthy",
          },
          isEnabled: this.isProviderEnabled(providerKey),
          lastError: metrics.lastError,
        });
      }

      // Sort by health status (failed first, then by last check time)
      return reports.sort((a, b) => {
        if (a.metrics.status === "failed" && b.metrics.status !== "failed")
        if (b.metrics.status === "failed" && a.metrics.status !== "failed")
        return b.metrics.lastCheck - a.metrics.lastCheck;
      });
    } catch (error) {
      logger.error("Failed to generate provider health report:", error);
      return [];
    }
  }

  updateProviderHealth(
    providerKey: string,
    result: {
      success: boolean;
      responseTime: number;
      error?: string;
    },
  ): void {
    try {
      const healthData = this.loadHealthData();
      const current = healthData[providerKey] || this.createEmptyMetric();

      const now = Date.now();
      current.lastCheck = now;

      if (result.success) {
        current.lastSuccessfulCheck = now;

        // Update average response time (rolling average)
        current.averageResponseTime =
            ? result.responseTime
      } else {
        current.status =

        if (result.error) {
          current.lastError = result.error;
        }
      }

      healthData[providerKey] = current;
      this.saveHealthData(healthData);
    } catch (error) {
      logger.error("Failed to update provider health:", error);
    }
  }

  getHealthSummary(): {
    totalProviders: number;
    healthyProviders: number;
    degradedProviders: number;
    failedProviders: number;
    averageResponseTime: number;
    lastCheckTime: number;
  } {
    const reports = this.getProviderHealthReport();

    return {
      totalProviders: reports.length,
      healthyProviders: reports.filter((r) => r.metrics.status === "healthy")
        .length,
      degradedProviders: reports.filter((r) => r.metrics.status === "degraded")
        .length,
      failedProviders: reports.filter((r) => r.metrics.status === "failed")
        .length,
      averageResponseTime:
    };
  }

  cleanupOldData(): void {
    try {
      const healthData = this.loadHealthData();
      const cutoffTime =

      let cleaned = false;
      for (const [key, metrics] of Object.entries(healthData)) {
        if (
          metrics.lastCheck < cutoffTime &&
        ) {
          delete healthData[key];
          cleaned = true;
        }
      }

      if (cleaned) {
        this.saveHealthData(healthData);
        logger.info("Cleaned up old provider health data");
      }
    } catch (error) {
      logger.warn("Failed to cleanup old health data:", error);
    }
  }

  resetProviderHealth(providerKey: string): void {
    try {
      const healthData = this.loadHealthData();
      healthData[providerKey] = this.createEmptyMetric();
      this.saveHealthData(healthData);
      logger.info(`Reset health metrics for provider: ${providerKey}`);
    } catch (error) {
      logger.error("Failed to reset provider health:", error);
    }
  }

  private loadHealthData(): Record<string, ProviderHealthMetric> {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const data = window.localStorage.getItem(this.HEALTH_STORAGE_KEY);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      logger.warn("Failed to load health data:", error);
    }
    return {};
  }

  private saveHealthData(data: Record<string, ProviderHealthMetric>): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          this.HEALTH_STORAGE_KEY,
          JSON.stringify(data),
        );
      }
    } catch (error) {
      logger.warn("Failed to save health data:", error);
    }
  }

  private isProviderEnabled(providerKey: string): boolean {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const disabledData = window.localStorage.getItem(
          "navi-disabled-company-boards",
        );
        if (disabledData) {
          const disabled = JSON.parse(disabledData);
          const [type, token] = providerKey.split(":");
          return !disabled.some(
            (d: any) => d.type === type && d.token === token,
          );
        }
      }
    } catch (error) {
      logger.warn("Failed to check provider enabled status:", error);
    }
    return true;
  }

  private createEmptyMetric(): ProviderHealthMetric {
    return {
      status: "healthy",
    };
  }
}

export const providerHealthDashboard = ProviderHealthDashboard.getInstance();
