
import type { JobProvider, JobFilters } from "./JobProviderInterface";
import type { Job, JobType } from "@/shared/types/jobs";
import { logger } from "@/shared/utils/logger";

export class RemoteOKProvider implements JobProvider {
  name = "remoteok";
  displayName = "RemoteOK";
  description = "Remote-first job board with global opportunities";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = (import.meta as any).env?.DEV
    ? "/proxy/remoteok/api"
    : "https://remoteok.io/api";

  config = {
    categories: ["tech", "design", "marketing", "sales", "customer"],
    regions: ["global", "remote"],
    icon: "mdi-home-outline",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];

    // RemoteOK returns array with first item being metadata

    return jobs.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const response = await fetch(`${this.baseUrl}`);

      if (!response.ok) {
        throw new Error(`RemoteOK API error: ${response.status}`);
      }

      const data = await response.json();

      // RemoteOK returns array with first item being metadata

      return jobs
        .filter((job) => this.matchesFilters(job, filters))
        .map((job) => this.normalizeJob(job));
    } catch (_error) {
      logger.error("RemoteOK fetch failed:", error, "OpenSourceJobProviders");
      return [];
    }
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.query || filters.title) {
      const searchText =
        `${job.position} ${job.description || ""} ${job.company}`.toLowerCase();
      const queryText = (filters.query || filters.title || "").toLowerCase();
      if (!searchText.includes(queryText)) {
        return false;
      }
    }

    if (filters.location && filters.location !== "remote") {
      const jobLocation = (job.location || "").toLowerCase();
      if (!jobLocation.includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private normalizeJob(job: any): Job {
    return {
      title: job.position || "Unknown Position",
      company: job.company || "Unknown Company",
      location: "Remote",
      type: "full-time" as const,
      remote: true,
      description: job.description || "",
      url:
        job.url || job.apply_url || `https://remoteok.io/remote-jobs/${job.id}`,
      salary:
        job.salary_min && job.salary_max
          ? `$${job.salary_min} - $${job.salary_max}`
          : undefined,
      tags: job.tags || [],
      postedDate: job.date ? new Date(job.date) : new Date(),
      source: this.displayName,
      companyLogo: job.company_logo || undefined,
    };
  }
}

export class RemotiveProvider implements JobProvider {
  name = "remotive";
  displayName = "Remotive";
  description = "Remote jobs across many categories (open API)";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://remotive.com/api/remote-jobs";

  config = {
    categories: ["software-dev", "design", "product", "marketing"],
    regions: ["global", "remote"],
    icon: "mdi-domain",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    const params: Record<string, any> = {};
    if (filters.query || filters.title)
      params["search"] = filters.query || filters.title;
    // Prefer software-dev for tech/gaming roles
    params["category"] = "software-dev";
    return params;
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];
    return data.jobs.map((j: any) => this.normalizeJob(j));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const params = new URLSearchParams();
      const built = this.buildParams(filters);
      Object.entries(built).forEach(
        ([k, v]) => v != null && params.append(k, String(v)),
      );
      const url = params.toString()
        ? `${this.baseUrl}?${params}`
        : this.baseUrl;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Remotive API error: ${res.status}`);
      const data = await res.json();
      const jobs = (data.jobs || [])
        .filter((job: any) => this.matchesFilters(job, filters))
        .map((job: any) => this.normalizeJob(job));
      return jobs;
    } catch (_e) {
      logger.error("Remotive fetch failed:", e, "OpenSourceJobProviders");
      return [];
    }
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.query || filters.title) {
      const q = (filters.query || filters.title || "").toLowerCase();
      const text =
        `${job.title} ${job.company_name} ${job.description}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (filters.location && filters.location !== "remote") {
      const loc = (job.candidate_required_location || "").toLowerCase();
      if (!loc.includes(filters.location.toLowerCase())) return false;
    }
    return true;
  }

  private normalizeJob(job: any): Job {
    const desc = job.description || "";
    return {
      title: job.title || "Unknown Position",
      company: job.company_name || "Unknown Company",
      location: job.candidate_required_location || "Remote",
      type: (job.job_type?.toLowerCase?.() || "full-time") as Job["type"],
      remote: true,
      description: desc,
      url: job.url || job.job_url || "",
      salary: job.salary || undefined,
      tags: Array.isArray(job.tags) ? job.tags : [],
      postedDate: job.publication_date
        ? new Date(job.publication_date)
        : new Date(),
      source: this.displayName,
      gamingRelevance: this.calculateGamingRelevance(job.title, desc),
    };
  }

  private calculateGamingRelevance(title: string, description: string): number {
    const text = `${title}\n${description}`.toLowerCase();
    const keywords = [
      "game",
      "unity",
      "unreal",
      "godot",
      "blender",
      "shader",
      "level design",
    ];
    keywords.forEach((k) => {
    });
  }
}

export class WeWorkRemotelyProvider implements JobProvider {
  name = "weworkremotely";
  displayName = "WeWorkRemotely";
  description = "Remote programming jobs (RSS feed)";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://weworkremotely.com/categories/remote-programming-jobs.rss";

  config = {
    categories: ["programming"],
    regions: ["global", "remote"],
    icon: "mdi-briefcase",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {};
  }

  parseResponse(data: any): Job[] {
    // data is expected to be XML string; we can't parse without xml parser in this class
    // This provider uses fetchJobs() custom path below (not BaseJobProvider) to parse XML
    return [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const res = await fetch(this.baseUrl);
      if (!res.ok) throw new Error(`WWR RSS error: ${res.status}`);
      const xml = await res.text();

      // Lightweight RSS parse
      const items = this.extractRssItems(xml);
      const jobs = items
        .map((item) => this.normalizeJob(item))
        .filter(Boolean) as Job[];

      // Apply simple filters
      let out = jobs;
      const q = (filters.query || filters.title || "").toLowerCase();
      if (q) {
        out = out.filter((j) =>
          `${j.title} ${j.company} ${j.description}`.toLowerCase().includes(q),
        );
      }
      if (filters.location && filters.location !== "remote") {
        out = out.filter((j) =>
          (j.location || "")
            .toLowerCase()
            .includes(filters.location!.toLowerCase()),
        );
      }

    } catch (_e) {
      logger.error("WWR fetch failed:", e, "OpenSourceJobProviders");
      return [];
    }
  }

  private extractRssItems(xml: string): any[] {
    try {
      // Minimal RSS extraction: split by <item>
      const items: any[] = [];
      for (const part of parts) {
        const title = this.extractTag(block, "title");
        const link = this.extractTag(block, "link");
        const description = this.extractTag(block, "description");
        const pubDate = this.extractTag(block, "pubDate");
        items.push({ title, link, description, pubDate });
      }
      return items;
    } catch {
      return [];
    }
  }

  private extractTag(block: string, tag: string): string {
    const m = block.match(re);
  }

  private normalizeJob(item: any): Job | null {
    if (!item?.title || !item?.link) return null;
    // Heuristic: WWR titles often include "Company – Role" or "Role at Company"
    const raw = item.title.replace(/\n/g, " ").trim();
    let company = "Unknown Company";
    let title = raw;
    if (raw.includes("–")) {
      const [c, t] = raw.split("–").map((s: string) => s.trim());
      if (c && t) {
        company = c;
        title = t;
      }
    } else if (raw.toLowerCase().includes(" at ")) {
      const [t, c] = raw.split(/\s+at\s+/i);
      if (c && t) {
        company = c.trim();
        title = t.trim();
      }
    }

    const desc = item.description || "";
    return {
      id: `wwr-${btoa(item.link).replace(/=+$/, "")}`,
      title,
      company,
      location: "Remote",
      type: "full-time",
      remote: true,
      description: desc,
      url: item.link,
      salary: undefined,
      tags: this.extractTags(title, desc),
      postedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: this.displayName,
    };
  }

  private extractTags(title: string, description: string): string[] {
    const text = `${title}\n${description}`.toLowerCase();
    const tags = [
      "unity",
      "unreal",
      "godot",
      "javascript",
      "typescript",
      "react",
      "c++",
    ];
    return tags.filter((t) => text.includes(t));
  }
}

export class WellfoundProvider implements JobProvider {
  name = "wellfound";
  displayName = "Wellfound (AngelList)";
  description = "Startup and tech company jobs";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://angel.co";

  config = {
    categories: ["tech", "startup", "engineering", "design"],
    regions: ["us", "global"],
    icon: "mdi-rocket-launch",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Use a mock implementation since AngelList requires complex authentication
      // In production, this would integrate with their actual API
      return this.generateMockJobs(filters);
    } catch (_error) {
      logger.error("Wellfound fetch failed:", error, "OpenSourceJobProviders");
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const mockJobs = [
      {
        title: `${filters.query || filters.title || "Senior"} Software Engineer`,
        company: "TechStartup Inc",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description:
          "Join our growing startup to build the future of technology.",
        url: "https://wellfound.com/company/techstartup/jobs",
        tags: ["React", "Node.js", "TypeScript"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Product Designer",
        company: "DesignCo Startup",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description:
          "Design beautiful user experiences for our innovative platform.",
        url: "https://wellfound.com/company/designco/jobs",
        tags: ["Figma", "React", "Design Systems"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class GitHubJobsProvider implements JobProvider {
  name = "github";
  displayName = "GitHub Jobs";
  description = "Developer and tech jobs (Mock implementation)";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://jobs.github.com";

  config = {
    categories: ["programming", "development", "engineering"],
    regions: ["global"],
    icon: "mdi-github",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
      location: filters.location,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation since GitHub Jobs is discontinued
      return this.generateMockJobs(filters);
    } catch (_error) {
      logger.error(
        "GitHub Jobs fetch failed:",
        error,
        "OpenSourceJobProviders",
      );
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const gamingTechJobs = [
      {
        title: `${filters.query || filters.title || "Game"} Developer`,
        company: "Indie Game Studio",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: false,
        description: "Build amazing games with cutting-edge technology.",
        url: "https://github.com/jobs/game-developer",
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Unity Developer",
        company: "VR Gaming Company",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description: "Create immersive VR gaming experiences.",
        url: "https://github.com/jobs/unity-developer",
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class ArbeitsNowProvider implements JobProvider {
  name = "arbeitnow";
  displayName = "ArbeitsNow";
  description = "European job board with tech focus";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://www.arbeitnow.com/api/job-board-api";

  config = {
    categories: ["tech", "engineering", "design", "marketing"],
    regions: ["europe", "germany", "netherlands"],
    icon: "mdi-briefcase",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    const params = new URLSearchParams();

    if (filters.query || filters.title) {
      params.append("search", filters.query || filters.title || "");
    }

    return Object.fromEntries(_params);
  }

  parseResponse(data: any): Job[] {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data.map((job: any) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const params = new URLSearchParams();

      if (filters.query || filters.title) {
        params.append("search", filters.query || filters.title || "");
      }

      const url = params.toString()
        ? `${this.baseUrl}?${params}`
        : this.baseUrl;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`ArbeitsNow API error: ${response.status}`);
      }

      const data = await response.json();

      return (data.data || [])
        .filter((job: any) => job && typeof job === "object")
        .map((job: any) => this.normalizeJob(job));
    } catch (_error) {
      logger.error("ArbeitsNow fetch failed:", error, "OpenSourceJobProviders");
      return [];
    }
  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title,
      company: job.company_name,
      location: job.location,
      type: this.mapJobType(job.job_types),
      remote: job.remote || false,
      description: job.description,
      url: job.url,
      tags: job.tags,
      postedDate: new Date(job.created_at),
      source: this.displayName,
    };
  }

  private mapJobType(types: string[]): JobType {
    if (!types || !Array.isArray(types)) return "full-time";
    if (type?.includes("part")) return "part-time";
    if (type?.includes("contract")) return "contract";
    return "full-time";
  }
}

export class DiceProvider implements JobProvider {
  name = "dice";
  displayName = "Dice";
  description = "Technology job board";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://www.dice.com";

  config = {
    categories: ["tech", "programming", "engineering"],
    regions: ["us", "canada"],
    icon: "mdi-dice-multiple",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
      location: filters.location,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation - would integrate with Dice API in production
      return this.generateMockJobs(filters);
    } catch (_error) {
      logger.error("Dice fetch failed:", error, "OpenSourceJobProviders");
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const techGamingJobs = [
      {
        title: `Senior ${filters.query || filters.title || "Unity"} Developer`,
        company: "Gaming Tech Corp",
        location: "Austin, TX",
        type: "full-time" as const,
        remote: false,
        description:
          "Lead game development projects using cutting-edge technology.",
        url: "https://dice.com/jobs/unity-developer",
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Game Engine Programmer",
        company: "AAA Game Studio",
        location: "Los Angeles, CA",
        type: "full-time" as const,
        remote: false,
        description: "Optimize and maintain our proprietary game engine.",
        url: "https://dice.com/jobs/game-engine-programmer",
        tags: ["C++", "Game Engine", "Graphics"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class StackOverflowJobsProvider implements JobProvider {
  name = "stackoverflow";
  displayName = "Stack Overflow Jobs";
  description = "Developer jobs (Mock implementation)";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://stackoverflow.com/jobs";

  config = {
    categories: ["programming", "development"],
    regions: ["global"],
    icon: "mdi-stack-overflow",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation since Stack Overflow Jobs is discontinued
      return this.generateMockJobs(filters);
    } catch (_error) {
      logger.error(
        "Stack Overflow Jobs fetch failed:",
        error,
        "OpenSourceJobProviders",
      );
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const devGamingJobs = [
      {
        title: `${filters.query || filters.title || "Full Stack"} Game Developer`,
        company: "Indie Dev Studio",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description: "Build full-stack solutions for our gaming platform.",
        url: "https://stackoverflow.com/jobs/game-developer",
        tags: ["JavaScript", "React", "Node.js"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class FlexJobsProvider implements JobProvider {
  name = "flexjobs";
  displayName = "FlexJobs";
  description = "Flexible and remote work opportunities";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://www.flexjobs.com";

  config = {
    categories: ["remote", "freelance", "part-time"],
    regions: ["global"],
    icon: "mdi-clock-outline",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation - would integrate with FlexJobs API in production
      return this.generateMockJobs(filters);
    } catch (_error) {
      console.error("FlexJobs fetch failed:", error);
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const flexJobs = [
      {
        title: `Remote ${filters.query || filters.title || "Game"} Designer`,
        company: "Flex Game Studio",
        location: "Remote",
        type: "part-time" as const,
        remote: true,
        description: "Design engaging game mechanics on a flexible schedule.",
        url: "https://flexjobs.com/jobs/remote-game-designer",
        tags: ["Game Design", "Remote", "Flexible"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Freelance Game Artist",
        company: "Creative Games Co",
        location: "Remote",
        type: "freelance" as const,
        remote: true,
        description: "Create stunning game art on a project basis.",
        url: "https://flexjobs.com/jobs/freelance-game-artist",
        tags: ["Art", "Game Development", "Freelance"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "part-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class ZipRecruiterProvider implements JobProvider {
  name = "ziprecruiter";
  displayName = "ZipRecruiter";
  description = "One-click apply job board";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://www.ziprecruiter.com";

  config = {
    categories: ["general", "tech", "gaming"],
    regions: ["us"],
    icon: "mdi-briefcase-search",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation - would integrate with ZipRecruiter API in production
      return this.generateMockJobs(filters);
    } catch (_error) {
      console.error("ZipRecruiter fetch failed:", error);
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const zipJobs = [
      {
        title: `${filters.query || filters.title || "Game"} QA Tester`,
        company: "Quality Games Inc",
        location: "Seattle, WA",
        type: "full-time" as const,
        remote: false,
        description: "Test and ensure quality of our latest game releases.",
        url: "https://ziprecruiter.com/jobs/game-qa-tester",
        tags: ["QA", "Testing", "Gaming"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Community Manager - Gaming",
        company: "Social Games Studio",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description: "Manage our gaming community and social media presence.",
        url: "https://ziprecruiter.com/jobs/community-manager-gaming",
        tags: ["Community", "Social Media", "Gaming"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class SimplyHiredProvider implements JobProvider {
  name = "simplyhired";
  displayName = "SimplyHired";
  description = "Job search aggregator";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://www.simplyhired.com";

  config = {
    categories: ["general", "tech"],
    regions: ["us", "canada"],
    icon: "mdi-magnify",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation - would integrate with SimplyHired API in production
      return this.generateMockJobs(filters);
    } catch (_error) {
      console.error("SimplyHired fetch failed:", error);
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const simplyJobs = [
      {
        title: `${filters.query || filters.title || "Game"} Audio Engineer`,
        company: "Sound Games Studio",
        location: "Nashville, TN",
        type: "full-time" as const,
        remote: false,
        description: "Create immersive audio experiences for our games.",
        url: "https://simplyhired.com/jobs/game-audio-engineer",
        tags: ["Audio", "Sound Design", "Gaming"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class MonsterProvider implements JobProvider {
  name = "monster";
  displayName = "Monster";
  description = "Traditional job search platform";
  enabled = true;
  requiresAuth = false;
  apiKey?: string;
  baseUrl = "https://www.monster.com";

  config = {
    categories: ["general", "tech", "gaming"],
    regions: ["us", "global"],
    icon: "mdi-briefcase",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.query || filters.title,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Mock implementation - would integrate with Monster API in production
      return this.generateMockJobs(filters);
    } catch (_error) {
      console.error("Monster fetch failed:", error);
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const monsterJobs = [
      {
        title: `${filters.query || filters.title || "Game"} Producer`,
        company: "AAA Games Corp",
        location: "Los Angeles, CA",
        type: "full-time" as const,
        remote: false,
        description: "Manage game development projects from concept to launch.",
        url: "https://monster.com/jobs/game-producer",
        tags: ["Project Management", "Gaming", "Production"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

  }

  private normalizeJob(job: any): Job {
    return {
      title: job.title || "Unknown Position",
      company: job.company || "Unknown Company",
      location: job.location || "Unknown",
      type: (job.type as JobType) || "full-time",
      remote: job.remote || false,
      description: job.description || "",
      url: job.url || "",
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

// Export all providers as a registry
export const openSourceProviders: JobProvider[] = [
  // Live, open JSON APIs only
  new RemoteOKProvider(),
  new RemotiveProvider(),
  new ArbeitsNowProvider(),
  // RSS-based live provider
  new WeWorkRemotelyProvider(),
];

  return openSourceProviders;
}

export default openSourceProviders;
