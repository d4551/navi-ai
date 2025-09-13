
import { refactoredJobAPIService } from "./RefactoredJobAPIService";
import { logger } from "@/shared/utils/logger";
import type { JobProvider } from "./providers/JobProviderInterface";

export interface JobSourceInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  requiresAuth: boolean;
  apiKey?: string;
  rateLimit: string;
  regions: string[];
  categories: string[];
  features: string[];
  color: string;
  icon: string;
  status: "operational" | "degraded" | "down" | "unknown";
  gamingFocus?: number;
  priority: number;
}

class JobSourceManager {
  private sources: JobSourceInfo[] = [];
  private lastRefresh: Date | null = null;

  getAllSources(): JobSourceInfo[] {
    if (this.shouldRefresh()) {
      this.refreshSources();
    }
    return [...this.sources];
  }

  getSourcesBy(criteria: {
    enabled?: boolean;
    requiresAuth?: boolean;
    gamingFocus?: number;
    regions?: string[];
    categories?: string[];
  }): JobSourceInfo[] {
    return this.sources.filter((source) => {
      if (
        criteria.enabled !== undefined &&
        source.enabled !== criteria.enabled
      ) {
        return false;
      }

      if (
        criteria.requiresAuth !== undefined &&
        source.requiresAuth !== criteria.requiresAuth
      ) {
        return false;
      }

      if (
        criteria.gamingFocus !== undefined &&
      ) {
        return false;
      }

        const hasRegion = criteria.regions.some((region) =>
          source.regions.some((sourceRegion) =>
            sourceRegion.toLowerCase().includes(region.toLowerCase()),
          ),
        );
        if (!hasRegion) return false;
      }

        const hasCategory = criteria.categories.some((category) =>
          source.categories.some((sourceCategory) =>
            sourceCategory.toLowerCase().includes(category.toLowerCase()),
          ),
        );
        if (!hasCategory) return false;
      }

      return true;
    });
  }

  updateSourceConfig(
    sourceId: string,
    config: Partial<JobSourceInfo>,
  ): boolean {
    const sourceIndex = this.sources.findIndex((s) => s.id === sourceId);

    this.sources[sourceIndex] = { ...this.sources[sourceIndex], ...config };

    // Convert JobSourceInfo config to JobProvider config format
    const providerConfig: Partial<JobProvider> = {
      enabled: config.enabled,
      apiKey: config.apiKey,
      displayName: config.displayName,
      description: config.description,
      requiresAuth: config.requiresAuth,
    };

    // Update the provider in the API service
    return refactoredJobAPIService.updateProviderConfig(
      sourceId,
      providerConfig,
    );
  }

  async testSource(
    sourceId: string,
  ): Promise<{ success: boolean; message: string; jobCount?: number }> {
    try {
      const provider = refactoredJobAPIService.getProvider(sourceId);
      if (!provider) {
        return { success: false, message: "Provider not found" };
      }

      // Test with a simple query
      const testJobs = await provider.fetchJobs({ title: "developer" });

      // Update source status
      this.updateSourceStatus(sourceId, "operational");

      return {
        success: true,
        message: "Connection successful",
        jobCount: testJobs.length,
      };
    } catch (error) {
      this.updateSourceStatus(sourceId, "down");
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  refreshSources(): void {
    try {
      const providers = refactoredJobAPIService.getAllProviders();
      this.sources = providers.map((provider) =>
        this.providerToSourceInfo(provider),
      );
      this.lastRefresh = new Date();

      logger.info(
        `Refreshed ${this.sources.length} job sources`,
        undefined,
        "JobSourceManager",
      );
    } catch (error) {
      logger.error("Failed to refresh job sources:", error, "JobSourceManager");
    }
  }

  forceRefresh(): void {
    this.lastRefresh = null;
    this.refreshSources();
  }

  getSourceStats() {
    const stats = {
      total: this.sources.length,
      enabled: this.sources.filter((s) => s.enabled).length,
      public: this.sources.filter((s) => !s.requiresAuth).length,
      operational: this.sources.filter((s) => s.status === "operational")
        .length,
      regions: [...new Set(this.sources.flatMap((s) => s.regions))].length,
      categories: [...new Set(this.sources.flatMap((s) => s.categories))]
        .length,
    };

    return stats;
  }

  private shouldRefresh(): boolean {
    if (!this.lastRefresh) return true;
    return Date.now() - this.lastRefresh.getTime() > this.refreshInterval;
  }

  private providerToSourceInfo(provider: JobProvider): JobSourceInfo {
    return {
      id: provider.name,
      name: provider.name,
      displayName: provider.displayName || provider.name,
      description: provider.description || "Job board provider",
      enabled: provider.enabled,
      requiresAuth: provider.requiresAuth || false,
      apiKey: provider.apiKey,
      rateLimit: this.formatRateLimit(provider.rateLimit),
      regions: provider.config?.regions || ["global"],
      categories: provider.config?.categories || ["general"],
      features: provider.config?.categories || ["general"],
      icon: provider.config?.icon || "mdi-briefcase",
      status: "unknown",
    };
  }

  private formatRateLimit(
    rateLimit: number | { requests: number; period: number } | any,
  ): string {
    if (!rateLimit) return "Unlimited";
    if (typeof rateLimit === "string") return rateLimit;
    if (typeof rateLimit === "number") return `${rateLimit}/hour`;
    if (rateLimit.requests && rateLimit.period) {
      return `${rateLimit.requests}/${hours}h`;
    }
    return "Limited";
  }

  private updateSourceStatus(
    sourceId: string,
    status: JobSourceInfo["status"],
  ): void {
    const source = this.sources.find((s) => s.id === sourceId);
    if (source) {
      source.status = status;
    }
  }
}

// Export singleton instance
export const jobSourceManager = new JobSourceManager();

// Initialize on first import
jobSourceManager.refreshSources();
