
import type { JobProvider, JobFilters } from "./JobProviderInterface";
import type { Job } from "@/shared/types/jobs";
import { liveJobAPIService } from "../LiveJobAPIService";

export class LiveAPIMetaProvider implements JobProvider {
  name = "live-api";
  displayName = "Live API Aggregator";
  description = "Aggregates multiple live job APIs (RemoteOK, Remotive, etc.)";
  enabled = true;
  // Keep priority low-numbered so it participates early, but after gaming-specific tweaks if any
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "internal:live-aggregator";

  config = {
    icon: "mdi-rocket-launch",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    // Live service already accepts canonical filters; pass through
    return { ...filters };
  }

  parseResponse(data: any): Job[] {
    // Not directly used; fetchJobs returns normalized jobs already
    return Array.isArray(_data) ? (data as Job[]) : [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const res = await liveJobAPIService.searchJobs(filters);
    // Cap result size for fairness among providers
  }
}

  return new LiveAPIMetaProvider();
}
