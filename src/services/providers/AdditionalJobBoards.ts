
import type { JobProvider, JobFilters } from "./JobProviderInterface";
import type { Job, JobType } from "@/shared/types/jobs";
import { logger } from "@/shared/utils/logger";

export class AngelListProvider implements JobProvider {
  name = "angellist";
  displayName = "AngelList";
  description = "Startup and tech company jobs";
  enabled = true;
  requiresAuth = false;
  baseUrl = "https://wellfound.com/api";

  config = {
    categories: ["startup", "tech", "gaming"],
    regions: ["us", "global"],
    icon: "mdi-rocket-launch",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.title || "developer",
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      return this.generateMockJobs(filters);
    } catch (error) {
      logger.error("AngelList fetch failed:", error, "AdditionalJobBoards");
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        title: `Senior ${filters.title || "Developer"}`,
        company: "GameTech Startup",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description:
          "Join our innovative gaming startup and build the future of interactive entertainment.",
        tags: ["Startup", "Gaming", "Equity"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: `${filters.title || "Game"} Product Manager`,
        company: "VR Innovations Inc",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description:
          "Lead product development for cutting-edge VR gaming experiences.",
        tags: ["Product", "VR", "Remote"],
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
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class CrunchBoardProvider implements JobProvider {
  name = "crunchboard";
  displayName = "CrunchBoard";
  description = "TechCrunch's tech startup job board";
  enabled = true;
  requiresAuth = false;
  baseUrl = "https://crunchboard.com";

  config = {
    categories: ["startup", "tech"],
    regions: ["us", "global"],
    icon: "mdi-newspaper",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.title || "developer",
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      return this.generateMockJobs(filters);
    } catch (error) {
      logger.error("CrunchBoard fetch failed:", error, "AdditionalJobBoards");
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        title: `Lead ${filters.title || "Developer"}`,
        company: "TechCrunch Featured Startup",
        location: "New York, NY",
        type: "full-time" as const,
        remote: true,
        description: "Join a high-growth startup featured on TechCrunch.",
        tags: ["Leadership", "Startup", "High Growth"],
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
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class HackerNewsProvider implements JobProvider {
  name = "hackernews";
  displayName = "HackerNews Jobs";
  description = "HackerNews Who's Hiring monthly posts";
  enabled = true;
  requiresAuth = false;
  baseUrl = "https://hacker-news.firebaseio.com";

  config = {
    categories: ["tech", "startup"],
    regions: ["global"],
    icon: "mdi-newspaper-variant",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.title || "developer",
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      return this.generateMockJobs(filters);
    } catch (error) {
      logger.error("HackerNews fetch failed:", error, "AdditionalJobBoards");
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        title: `Full Stack ${filters.title || "Developer"}`,
        company: "YC Startup",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description:
          "Join our Y Combinator startup building the future of tech.",
        tags: ["YC", "Full Stack", "Remote"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: `${filters.title || "Game"} Backend Engineer`,
        company: "Gaming Startup",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description: "Build scalable backend systems for multiplayer games.",
        tags: ["Backend", "Gaming", "Scalability"],
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
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class LinkedInJobsProvider implements JobProvider {
  name = "linkedin";
  displayName = "LinkedIn Jobs";
  description = "Professional networking platform jobs";
  enabled = true;
  requiresAuth = true;
  baseUrl = "https://api.linkedin.com";

  config = {
    categories: ["professional", "tech", "gaming"],
    regions: ["global"],
    icon: "mdi-linkedin",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.title || "developer",
      location: filters.location,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Note: Real LinkedIn API requires OAuth and company approval
      return this.generateMockJobs(filters);
    } catch (error) {
      logger.error("LinkedIn fetch failed:", error, "AdditionalJobBoards");
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        title: `Senior ${filters.title || "Developer"}`,
        company: "Meta",
        location: "Menlo Park, CA",
        type: "full-time" as const,
        remote: false,
        description: "Join Meta's Reality Labs and build the metaverse.",
        tags: ["Meta", "VR", "Metaverse"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: `${filters.title || "Game"} Engine Programmer`,
        company: "Epic Games",
        location: "Cary, NC",
        type: "full-time" as const,
        remote: true,
        description: "Work on Unreal Engine and Fortnite at Epic Games.",
        tags: ["Epic", "Unreal", "AAA"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: `${filters.title || "Software"} Engineer`,
        company: "Google",
        location: "Mountain View, CA",
        type: "full-time" as const,
        remote: true,
        description: "Build products that impact billions of users.",
        tags: ["Google", "Scale", "Impact"],
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
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

export class TechJobsForGoodProvider implements JobProvider {
  name = "techjobsforgood";
  displayName = "Tech Jobs for Good";
  description =
    "Mission-driven tech jobs at nonprofits and social impact companies";
  enabled = true;
  requiresAuth = false;
  baseUrl = "https://techjobsforgood.com";

  config = {
    categories: ["nonprofit", "social-impact", "tech"],
    regions: ["us", "global"],
    icon: "mdi-heart",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      limit: filters.limit || this.config.maxResults,
      query: filters.title || "developer",
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(data)) return [];
    return data.map((job) => this.normalizeJob(job));
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      return this.generateMockJobs(filters);
    } catch (error) {
      logger.error(
        "TechJobsForGood fetch failed:",
        error,
        "AdditionalJobBoards",
      );
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        title: `${filters.title || "Software"} Engineer`,
        company: "Code for America",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description: "Use technology to make government work for people.",
        tags: ["Social Impact", "Government", "Civic Tech"],
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
      salary: job.salary,
      tags: job.tags || [],
      postedDate: job.postedDate || new Date(),
      source: this.displayName,
    };
  }
}

// Export all providers
  return [
    new AngelListProvider(),
    new CrunchBoardProvider(),
    new HackerNewsProvider(),
    new LinkedInJobsProvider(),
    new TechJobsForGoodProvider(),
  ];
}
