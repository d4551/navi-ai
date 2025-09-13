
import { BaseJobProvider } from "./JobProviderInterface";
import { logger } from "@/shared/utils/logger";
import type { Job, JobFilters } from "@/shared/types/jobs";
import type { CompanyBoardConfig } from "./JobProviderInterface";

export class CompanyBoardProvider extends BaseJobProvider {
  name: string;
  baseUrl: string;
  rateLimit: number;
  enabled: boolean;
  priority: number;
  config: CompanyBoardConfig;

    super();
    this.config = config;
    this.name = `${config.name} (${config.type})`;
    this.priority = priority;
    this.enabled = true;

    // Set base URL based on platform type
    switch (config.type) {
      case "greenhouse":
        break;
      case "lever":
        break;
      case "recruitee":
        this.baseUrl = `https://api.recruitee.com/c/${config.token}/offers`;
        break;
      case "workable":
        break;
      case "ashby":
        this.baseUrl = `https://api.ashbyhq.com/posting-api/job-board/${config.token}`;
        break;
      case "smartrecruiters":
        // Public SmartRecruiters postings API
        break;
      case "teamtailor":
        // Requires API key; headers will be added in request
        break;
      case "workday": {
        // Generic Workday CXS endpoint; token can be 'tenant' or 'tenant/site'
        const parts = String(config.token).split("/");
        break;
      }
      default:
        throw new Error(`Unsupported ATS type: ${config.type}`);
    }
  }

  async verifyAvailability(): Promise<boolean> {
    try {
      const resp = await this.httpClient.get(this.baseUrl, {
        validateStatus: () => true,
      });
    } catch {
      return false;
    }
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const params = this.buildParams(filters);
    try {
      const response = await this.makeRequest(params);
      return this.parseResponse(response.data);
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.message || "";

      // Handle common API issues silently
        // Invalid or retired board token - log as info only
        logger.info(
          `Company board not accessible: ${this.config.name} (${this.config.type}:${this.config.token}) - Status: ${status}`,
          undefined,
          "CompanyBoardProvider",
        );
        return [];
      }

      // Handle CORS errors (common in browser environments)
      if (
        message.includes("CORS") ||
        message.includes("Access-Control-Allow-Origin") ||
        error?.code === "ERR_FAILED"
      ) {
        logger.info(
          `CORS error accessing ${this.config.name} - may require server-side proxy`,
          undefined,
          "CompanyBoardProvider",
        );
        return [];
      }

      // Handle network timeout or connection issues
      if (
        message.includes("timeout") ||
        message.includes("ECONNREFUSED") ||
        message.includes("net::ERR_FAILED")
      ) {
        logger.info(
          `Network error accessing ${this.config.name} - service may be temporarily unavailable`,
          undefined,
          "CompanyBoardProvider",
        );
        return [];
      }

      // Only surface unexpected errors
      logger.error(
        `Unexpected error from ${this.config.name}: ${message}`,
        undefined,
        "CompanyBoardProvider",
      );
      return [];
    }
  }

  buildParams(_filters: JobFilters): Record<string, any> {
    // Most ATS platforms don't support advanced filtering
    // We'll filter client-side after fetching
    return {};
  }

  parseResponse(data: any): Job[] {
    switch (this.config.type) {
      case "greenhouse":
        return this.parseGreenhouseJobs(data);
      case "lever":
        return this.parseLeverJobs(data);
      case "recruitee":
        return this.parseRecruiteeJobs(data);
      case "workable":
        return this.parseWorkableJobs(data);
      case "ashby":
        return this.parseAshbyJobs(data);
      case "smartrecruiters":
        return this.parseSmartRecruitersJobs(data);
      case "teamtailor":
        return this.parseTeamtailorJobs(data);
      case "workday":
        return this.parseWorkdayJobs(data);
      default:
        return [];
    }
  }

  protected async makeRequest(params: Record<string, any>): Promise<any> {
    // Override for Teamtailor headers
    if (this.config.type === "teamtailor") {
      // Teamtailor requires Authorization and X-Api-Version
      const headers: Record<string, string> = {
      };
      if (this.apiKey) {
        headers["Authorization"] = `Token token=${this.apiKey}`;
      }
      return this.httpClient.get(this.baseUrl, { params, headers });
    }
    return super.makeRequest(params);
  }

  private parseGreenhouseJobs(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any) => ({
      id: `greenhouse-${job.id}`,
      title: job.title,
      company: job.company?.name || this.config.name,
      location: job.location?.name || "Not specified",
      remote: job.location?.name?.toLowerCase().includes("remote") || false,
      salary: undefined, // Greenhouse doesn't expose salary in public API
      description: job.content || "",
      requirements: this.parseRequirements(job.content || ""),
      technologies: this.extractTechnologies(job.content || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.updated_at || new Date().toISOString(),
      featured: false,
      source: `Greenhouse (${this.config.name})`,
    }));
  }

  private parseLeverJobs(data: any): Job[] {
    if (!Array.isArray(data)) return [];

    return data.map((job: any) => ({
      id: `lever-${job.id}`,
      title: job.text,
      company: job.company || this.config.name,
      location: job.categories?.location || "Not specified",
      remote:
        job.categories?.location?.toLowerCase().includes("remote") || false,
      salary: this.parseSalary(job.salaryDescription),
      description: job.description || job.descriptionPlain || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "mid",
      type: job.type || "full-time",
      postedDate: job.createdAt || new Date().toISOString(),
      featured: false,
      source: `Lever (${this.config.name})`,
    }));
  }

  private parseRecruiteeJobs(data: any): Job[] {
    if (!data?.offers || !Array.isArray(data.offers)) return [];

    return data.offers.map((job: any) => ({
      id: `recruitee-${job.id}`,
      title: job.title,
      company: job.company_name || this.config.name,
      location: job.location || "Not specified",
      remote: job.remote || false,
      salary: undefined,
      description: job.description || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.created_at || new Date().toISOString(),
      featured: false,
      source: `Recruitee (${this.config.name})`,
    }));
  }

  private parseWorkableJobs(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any) => ({
      id: `workable-${job.shortcode}`,
      title: job.title,
      company: job.company?.name || this.config.name,
      location: job.location?.city || "Not specified",
      remote: job.remote || false,
      salary: undefined,
      description: job.description || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.createdAt || new Date().toISOString(),
      featured: false,
      source: `Workable (${this.config.name})`,
    }));
  }

  private parseAshbyJobs(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any) => ({
      id: `ashby-${job.id}`,
      title: job.title,
      company: job.companyName || this.config.name,
      location: job.location || "Not specified",
      remote: job.location?.toLowerCase().includes("remote") || false,
      salary: job.salaryRange
        ? {
            min: job.salaryRange.min,
            max: job.salaryRange.max,
            currency: job.salaryRange.currency,
          }
        : undefined,
      description: job.description || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.postedDate || new Date().toISOString(),
      featured: false,
      source: `Ashby (${this.config.name})`,
    }));
  }

  private parseSmartRecruitersJobs(data: any): Job[] {
    // SmartRecruiters responses typically include a 'content' array
    const items = Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
        ? data
        : [];
    return items.map((item: any) => {
      const title = item?.name || item?.title || "Unknown Position";
      const company = this.config.name;
      const loc =
        item?.location?.city || item?.primaryLocation?.city || "Not specified";
      const country =
        item?.location?.country || item?.primaryLocation?.country || "";
      const location = country ? `${loc}, ${country}` : loc;
      const description =
        item?.jobAd?.sections?.jobDescription?.text ||
        item?.jobAd?.sections?.requirements?.text ||
        "";
      return {
        id: `smartrecruiters-${id}`,
        title,
        company,
        location,
        remote: /remote/i.test(location),
        salary: undefined,
        description,
        requirements: this.parseRequirements(description),
        technologies: this.extractTechnologies(description),
        experienceLevel: "mid",
        type: "full-time",
        postedDate:
          item?.releasedDate || item?.updatedOn || new Date().toISOString(),
        featured: false,
        source: `SmartRecruiters (${this.config.name})`,
      } as Job;
    });
  }

  private parseTeamtailorJobs(data: any): Job[] {
    // Teamtailor API returns JSON: { data: [{ id, attributes: { title, description, ... } }], included: [...] }
    const items = Array.isArray(data?.data) ? data.data : [];
    return items.map((entry: any) => {
      const attr = entry?.attributes || {};
      const title = attr.title || "Unknown Position";
      const description = attr.body || attr.description || "";
      return {
        title,
        company: this.config.name,
        location: loc,
        remote: /remote/i.test(loc),
        salary: undefined,
        description,
        requirements: this.parseRequirements(description),
        technologies: this.extractTechnologies(description),
        experienceLevel: "mid",
        type: "full-time",
        postedDate: attr?.created_at || new Date().toISOString(),
        featured: false,
        source: `Teamtailor (${this.config.name})`,
      } as Job;
    });
  }

  private parseWorkdayJobs(data: any): Job[] {
    // Workday CXS job list structure varies; attempt to parse common patterns
    const postings = Array.isArray(data?.jobPostings)
      ? data.jobPostings
      : Array.isArray(data?.items)
        ? data.items
        : [];
    return postings.map((p: any) => {
      const title = p.title || p?.descriptor || "Unknown Position";
      return {
        id: `workday-${id}`,
        title,
        company: this.config.name,
        location: loc,
        remote: /remote/i.test(loc),
        salary: undefined,
        description: p.summary || "",
        requirements: [],
        technologies: [],
        experienceLevel: "mid",
        type: "full-time",
        postedDate: p.postedOn || new Date().toISOString(),
        featured: false,
        source: `Workday (${this.config.name})`,
      } as Job;
    });
  }

  public parseSalary(
    salaryDescription?: string,
  ): { min: number; max: number; currency: string } | undefined {
    if (!salaryDescription || typeof salaryDescription !== "string") {
      return undefined;
    }

    const text = salaryDescription.toLowerCase().trim();

    // Common salary patterns
    const patterns = [
    ];

    let currency = "USD";
    if (text.includes("£")) currency = "GBP";
    else if (text.includes("€")) currency = "EUR";

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let min: number, max: number;

          // Range format

          // Handle K notation
        } else {
          // Single value (up to/starting at)
            : value;

          if (text.includes("up to")) {
            max = finalValue;
          } else if (text.includes("starting")) {
            min = finalValue;
          } else {
            min = max = finalValue;
          }
        }

        return { min, max, currency };
      }
    }

    return undefined;
  }
}

  configs: CompanyBoardConfig[],
): CompanyBoardProvider[] {
  return configs.map(
  );
}

// Default company board configurations (can be loaded from env or config file)
export const DEFAULT_COMPANY_BOARDS: CompanyBoardConfig[] = [
  // Add popular gaming companies here
  // Example: { name: 'Valve', token: 'valve', type: 'greenhouse' }
];
