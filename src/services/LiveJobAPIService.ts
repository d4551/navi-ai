
import type { Job, JobFilters } from "@/shared/types/jobs";
import { logger } from "@/shared/utils/logger";

export interface JobAPIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  rateLimit: {
    requests: number;
    period: number; // milliseconds
  };
  priority: number;
  enabled: boolean;
}

export interface LiveJobAPIResponse {
  jobs: Job[];
  totalResults: number;
  source: string;
  fetchTime: Date;
  nextPage?: string;
  rateLimitRemaining?: number;
}

export class LiveJobAPIService {
  private providers: Map<string, JobAPIConfig> = new Map();
  private requestCounts: Map<string, { count: number; resetTime: number }> =
    new Map();
  private cache: Map<string, { data: LiveJobAPIResponse; expiry: number }> =
    new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Adzuna Jobs API - Free tier with real job data
    this.addProvider({
      name: "adzuna",
      apiKey: process.env.VITE_ADZUNA_API_KEY,
      headers: {
        // Do not set User-Agent in browser; Adzuna API typically requires app_id/app_key params anyway
      },
      enabled: !!process.env.VITE_ADZUNA_API_KEY,
    });

    // JSearch API (RapidAPI) - Aggregates multiple job boards
    this.addProvider({
      name: "jsearch",
      baseUrl: "https://jsearch.p.rapidapi.com",
      apiKey: process.env.VITE_RAPIDAPI_KEY,
      headers: {
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.VITE_RAPIDAPI_KEY || "",
      },
      enabled: !!process.env.VITE_RAPIDAPI_KEY,
    });

    // Reed.co.uk API - UK Jobs
    this.addProvider({
      name: "reed",
      apiKey: process.env.VITE_REED_API_KEY,
      headers: {
        Authorization: `Basic ${btoa((process.env.VITE_REED_API_KEY || "") + ":")}`,
      },
      enabled: !!process.env.VITE_REED_API_KEY,
    });

    // RemoteOK API - Remote jobs (no auth required)
    this.addProvider({
      name: "remoteok",
      baseUrl: (import.meta as any).env?.DEV
        ? "/proxy/remoteok/api"
        : "https://remoteok.io/api",
      enabled: true,
    });

    // Arbeitnow API - European tech jobs (no auth)
    this.addProvider({
      name: "arbeitnow",
      baseUrl: "https://www.arbeitnow.com/api/job-board-api",
      enabled: true,
    });

    // Remotive API - Remote jobs (no auth)
    this.addProvider({
      name: "remotive",
      baseUrl: "https://remotive.com/api/remote-jobs",
      enabled: true,
    });

    logger.info(`Initialized ${this.providers.size} live job API providers`, {
      enabled: Array.from(this.providers.values()).filter((p) => p.enabled)
        .length,
      providers: Array.from(this.providers.keys()),
    });
  }

  addProvider(config: JobAPIConfig) {
    this.providers.set(config.name, config);
  }

  async searchJobs(filters: JobFilters): Promise<LiveJobAPIResponse> {
    const cacheKey = this.generateCacheKey(filters);

    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      logger.debug("Returning cached job results", { cacheKey });
      return cached;
    }

    const enabledProviders = Array.from(this.providers.values())
      .filter((p) => p.enabled && this.canMakeRequest(p.name))
      .sort((a, b) => b.priority - a.priority);

      logger.warn("No available job API providers");
      return {
        jobs: [],
        source: "none",
        fetchTime: new Date(),
      };
    }

    // Try providers in priority order
    for (const provider of enabledProviders) {
      try {
        const result = await this.fetchFromProvider(provider, filters);

          this.setCached(cacheKey, result);
          this.updateRateLimit(provider.name);
          logger.info(
            `Fetched ${result.jobs.length} jobs from ${provider.name}`,
          );
          return result;
        }
      } catch (_error) {
        logger.error(`Failed to fetch from ${provider.name}:`, error);
        continue;
      }
    }

    // Fallback: return empty results
    return {
      jobs: [],
      source: "fallback",
      fetchTime: new Date(),
    };
  }

  private async fetchFromProvider(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const startTime = Date.now();

    switch (provider.name) {
      case "jsearch":
        return await this.fetchFromJSearch(provider, filters);
      case "adzuna":
        return await this.fetchFromAdzuna(provider, filters);
      case "reed":
        return await this.fetchFromReed(provider, filters);
      case "remoteok":
        return await this.fetchFromRemoteOK(provider, filters);
      case "arbeitnow":
        return await this.fetchFromArbeitnow(provider, filters);
      case "remotive":
        return await this.fetchFromRemotive(provider, filters);
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }

  private async fetchFromJSearch(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams({
      query: filters.query || filters.title || "software developer",
      date_posted: "week",
    });

    if (filters.location && filters.location !== "remote") {
      params.set("location", filters.location);
    }

    if (filters.remote) {
      params.set("remote_jobs_only", "true");
    }

    const url = `${provider.baseUrl}/search?${params}`;

    const response = await fetch(url, {
      headers: provider.headers || {},
    });

    if (!response.ok) {
      throw new Error(
        `JSearch API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const jobs: Job[] = (data.data || []).map((job: any) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      location:
        job.job_city && job.job_state
          ? `${job.job_city}, ${job.job_state}`
          : job.job_country,
      type: this.normalizeJobType(job.job_employment_type),
      remote: job.job_is_remote === true,
      description: job.job_description,
      url: job.job_apply_link,
      salary: this.formatSalary(
        job.job_salary_currency,
        job.job_min_salary,
        job.job_max_salary,
      ),
      postedDate: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc)
        : new Date(),
      source: "JSearch",
      tags: this.extractTags(job.job_title, job.job_description),
      gamingRelevance: this.calculateGamingRelevance(
        job.job_title,
        job.job_description,
      ),
    }));

    return {
      jobs,
      totalResults: data.num_results || jobs.length,
      source: provider.name,
      fetchTime: new Date(),
      rateLimitRemaining: response.headers.get("x-ratelimit-remaining")
        ? parseInt(response.headers.get("x-ratelimit-remaining")!)
        : undefined,
    };
  }

  private async fetchFromAdzuna(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    // Adzuna requires app_id and app_key
    const appId = process.env.VITE_ADZUNA_APP_ID;
    if (!appId || !provider.apiKey) {
      throw new Error("Adzuna API credentials not configured");
    }

    const country = "us"; // Could be made configurable
    const params = new URLSearchParams({
      app_id: appId,
      app_key: provider.apiKey,
      what: filters.query || filters.title || "software developer",
      content_type: "application/json",
    });

    if (filters.location && filters.location !== "remote") {
      params.set("where", filters.location);
    }


    const response = await fetch(url, {
      headers: provider.headers || {},
    });

    if (!response.ok) {
      throw new Error(
        `Adzuna API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const jobs: Job[] = (data.results || []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || "Unknown Location",
      type: this.normalizeJobType(job.contract_type),
      remote:
        job.location?.display_name?.toLowerCase().includes("remote") || false,
      description: job.description,
      url: job.redirect_url,
      salary:
        job.salary_min && job.salary_max
          ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}`
          : undefined,
      postedDate: job.created ? new Date(job.created) : new Date(),
      source: "Adzuna",
      tags: this.extractTags(job.title, job.description),
      gamingRelevance: this.calculateGamingRelevance(
        job.title,
        job.description,
      ),
    }));

    return {
      jobs,
      totalResults: data.count || jobs.length,
      source: provider.name,
      fetchTime: new Date(),
    };
  }

  private async fetchFromReed(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams({
      keywords: filters.query || filters.title || "software developer",
    });

    if (filters.location && filters.location !== "remote") {
      params.set("locationName", filters.location);
    }

    const url = `${provider.baseUrl}?${params}`;

    const response = await fetch(url, {
      headers: provider.headers || {},
    });

    if (!response.ok) {
      throw new Error(
        `Reed API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const jobs: Job[] = (data.results || []).map((job: any) => ({
      id: `reed-${job.jobId}`,
      title: job.jobTitle,
      company: job.employerName,
      location: job.locationName,
      type: this.normalizeJobType(job.jobType),
      remote: job.locationName?.toLowerCase().includes("remote") || false,
      description: job.jobDescription,
      url: job.jobUrl,
      salary:
        job.minimumSalary && job.maximumSalary
          ? `£${job.minimumSalary} - £${job.maximumSalary}`
          : undefined,
      postedDate: job.date ? new Date(job.date) : new Date(),
      source: "Reed.co.uk",
      tags: this.extractTags(job.jobTitle, job.jobDescription),
      gamingRelevance: this.calculateGamingRelevance(
        job.jobTitle,
        job.jobDescription,
      ),
    }));

    return {
      jobs,
      totalResults: data.totalResults || jobs.length,
      source: provider.name,
      fetchTime: new Date(),
    };
  }

  private async fetchFromRemoteOK(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const response = await fetch(provider.baseUrl);

    if (!response.ok) {
      throw new Error(
        `RemoteOK API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // RemoteOK returns array with first item being metadata

    let filteredJobs = jobsData;

    // Apply filters
    if (filters.query || filters.title) {
      const searchTerm = (filters.query || filters.title || "").toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job: any) =>
          job.position?.toLowerCase().includes(searchTerm) ||
          job.description?.toLowerCase().includes(searchTerm) ||
          job.company?.toLowerCase().includes(searchTerm),
      );
    }

      id: `remoteok-${job.id}`,
      title: job.position,
      company: job.company,
      location: "Remote",
      type: "full-time" as const,
      remote: true,
      description: job.description,
      url: job.url || `https://remoteok.io/remote-jobs/${job.id}`,
      salary:
        job.salary_min && job.salary_max
          ? `$${job.salary_min} - $${job.salary_max}`
          : undefined,
      source: "RemoteOK",
      tags: job.tags || this.extractTags(job.position, job.description),
      gamingRelevance: this.calculateGamingRelevance(
        job.position,
        job.description,
      ),
    }));

    return {
      jobs,
      totalResults: filteredJobs.length,
      source: provider.name,
      fetchTime: new Date(),
    };
  }

  private async fetchFromRemotive(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams();
    const search = filters.query || filters.title;
    if (search) params.set("search", search);
    params.set("category", "software-dev");

    const url = params.toString()
      ? `${provider.baseUrl}?${params}`
      : provider.baseUrl;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Remotive API error: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    const jobs: Job[] = (data.jobs || []).map((job: any) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      type: this.normalizeJobType(job.job_type),
      remote: true,
      description: job.description,
      url: job.url || job.job_url,
      salary: job.salary,
      postedDate: job.publication_date
        ? new Date(job.publication_date)
        : new Date(),
      source: "Remotive",
      tags: Array.isArray(job.tags) ? job.tags : [],
      gamingRelevance: this.calculateGamingRelevance(
        job.title,
        job.description,
      ),
    }));

    let resultJobs = jobs;
    if (filters.location && filters.location !== "remote") {
      const q = filters.location.toLowerCase();
      resultJobs = resultJobs.filter((j) =>
        (j.location || "").toLowerCase().includes(q),
      );
    }

    return {
      jobs: resultJobs,
      totalResults: resultJobs.length,
      source: provider.name,
      fetchTime: new Date(),
    };
  }

  private async fetchFromArbeitnow(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams();

    if (filters.query || filters.title) {
      params.set("query", filters.query || filters.title || "");
    }

    const url = `${provider.baseUrl}${params.toString() ? `?${params}` : ""}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Arbeitnow API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const jobs: Job[] = (data.data || []).map((job: any) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || "Europe",
      remote: job.remote === true,
      description: job.description,
      url: job.url,
      postedDate: job.created_at ? new Date(job.created_at) : new Date(),
      source: "Arbeitnow",
      tags: job.tags || this.extractTags(job.title, job.description),
      gamingRelevance: this.calculateGamingRelevance(
        job.title,
        job.description,
      ),
    }));

    return {
      jobs,
      totalResults: jobs.length,
      source: provider.name,
      fetchTime: new Date(),
    };
  }

  private async fetchFromFindwork(
    provider: JobAPIConfig,
    filters: JobFilters,
  ): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams({
      source: "findwork",
      search: filters.query || filters.title || "developer",
    });

    if (filters.location && filters.location !== "remote") {
      params.set("location", filters.location);
    }

    const url = `${provider.baseUrl}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `FindWork API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const jobs: Job[] = (data.results || []).map((job: any) => ({
      id: `findwork-${job.id}`,
      title: job.role,
      company: job.company_name,
      location: job.location,
      type: this.normalizeJobType(job.employment_type),
      remote:
        job.remote === true || job.location?.toLowerCase().includes("remote"),
      description: job.text,
      url: job.url,
      postedDate: job.date_posted ? new Date(job.date_posted) : new Date(),
      source: "FindWork",
      tags: this.extractTags(job.role, job.text),
      gamingRelevance: this.calculateGamingRelevance(job.role, job.text),
    }));

    return {
      jobs,
      totalResults: jobs.length,
      source: provider.name,
      fetchTime: new Date(),
    };
  }

  private normalizeJobType(
    type: string,
  ): "full-time" | "part-time" | "contract" | "internship" {
    if (!type) return "full-time";

    const t = type.toLowerCase();
    if (t.includes("part")) return "part-time";
    if (
      t.includes("contract") ||
      t.includes("freelance") ||
      t.includes("temporary")
    )
      return "contract";
    if (t.includes("intern")) return "internship";
    return "full-time";
  }

  private formatSalary(
    currency?: string,
    min?: number,
    max?: number,
  ): string | undefined {
    if (!min && !max) return undefined;

    const symbol =
      currency === "USD"
        ? "$"
        : currency === "GBP"
          ? "£"
          : currency === "EUR"
            ? "€"
            : "$";

    if (min && max) {
      return `${symbol}${Math.round(min)} - ${symbol}${Math.round(max)}`;
    } else if (min) {
      return `${symbol}${Math.round(min)}+`;
    } else if (max) {
      return `Up to ${symbol}${Math.round(max)}`;
    }

    return undefined;
  }

  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const commonTags = [
      "javascript",
      "typescript",
      "react",
      "vue",
      "angular",
      "node",
      "python",
      "java",
      "php",
      "ruby",
      "go",
      "rust",
      "aws",
      "docker",
      "kubernetes",
      "mongodb",
      "postgresql",
      "unity",
      "unreal",
      "game",
      "gaming",
      "esports",
      "ai",
      "ml",
    ];

    return commonTags.filter((tag) => text.includes(tag));
  }

  private calculateGamingRelevance(title: string, description: string): number {
    const text = `${title} ${description}`.toLowerCase();
    const gamingKeywords = [
      "game",
      "gaming",
      "unity",
      "unreal",
      "esports",
      "steam",
      "xbox",
      "playstation",
      "nintendo",
      "mobile game",
      "indie game",
      "aaa",
      "multiplayer",
      "mmorpg",
    ];

    gamingKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
      }
    });

  }

  private canMakeRequest(providerName: string): boolean {
    const provider = this.providers.get(providerName);
    if (!provider) return false;

    const rateLimitData = this.requestCounts.get(providerName);
    if (!rateLimitData) return true;

    const now = Date.now();

    // Reset if period has passed
    if (now >= rateLimitData.resetTime) {
      this.requestCounts.delete(providerName);
      return true;
    }

    // Check if we're under the limit
    return rateLimitData.count < provider.rateLimit.requests;
  }

  private updateRateLimit(providerName: string): void {
    const provider = this.providers.get(providerName);
    if (!provider) return;

    const now = Date.now();
    const existing = this.requestCounts.get(providerName);

    if (!existing || now >= existing.resetTime) {
      this.requestCounts.set(providerName, {
        resetTime: now + provider.rateLimit.period,
      });
    } else {
    }
  }

  private generateCacheKey(filters: JobFilters): string {
    const key = {
      query: filters.query,
      title: filters.title,
      location: filters.location,
      remote: filters.remote,
      limit: filters.limit,
    };
    const json = JSON.stringify(key);
    try {
        // @ts-ignore - unescape is deprecated but fine for this narrow use
      }
    } catch {
      // Fall through to plain string key
    }
    // Fallback: use plain JSON as key (still deterministic)
    return `jobs-${json}`;
  }

  private getCached(key: string): LiveJobAPIResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCached(key: string, data: LiveJobAPIResponse): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });

    // Clean up old entries
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Public methods for managing providers
  getProviders(): JobAPIConfig[] {
    return Array.from(this.providers.values());
  }

  enableProvider(name: string): void {
    const provider = this.providers.get(name);
    if (provider) {
      provider.enabled = true;
      logger.info(`Enabled job provider: ${name}`);
    }
  }

  disableProvider(name: string): void {
    const provider = this.providers.get(name);
    if (provider) {
      provider.enabled = false;
      logger.info(`Disabled job provider: ${name}`);
    }
  }

  getProviderStatus(): Record<
    string,
    { enabled: boolean; rateLimitRemaining: number }
  > {
    const status: Record<
      string,
      { enabled: boolean; rateLimitRemaining: number }
    > = {};

    for (const [name, provider] of this.providers) {
      const rateLimitData = this.requestCounts.get(name);
      const remaining = rateLimitData
        : provider.rateLimit.requests;

      status[name] = {
        enabled: provider.enabled,
        rateLimitRemaining: remaining,
      };
    }

    return status;
  }

  clearCache(): void {
    this.cache.clear();
    logger.info("Cleared job API cache");
  }
}

// Export singleton instance
export const liveJobAPIService = new LiveJobAPIService();
export default liveJobAPIService;
