/**
 * Additional Job Board Providers
 * Extended collection of job boards to increase job coverage
 */

import type { JobProvider, JobFilters } from "./JobProviderInterface";
import type { Job, JobType } from "@/shared/types/jobs";
import { logger } from '@/shared/utils/logger'

/**
 * AngelList/Wellfound Jobs Provider - Startup Jobs
 */
export class AngelListProvider implements JobProvider {
  name = "angellist";
  displayName = "AngelList";
  description = "Startup and tech company jobs";
  enabled = true;
  priority = 15;
  requiresAuth = false;
  baseUrl = "https://wellfound.com/api";
  rateLimit = { requests: 50, period: 3600000 };

  config = {
    maxResults: 25,
    categories: ["startup", "tech", "gaming"],
    regions: ["us", "global"],
    icon: "mdi-rocket-launch",
    color: "#000000",
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
      logger.error("AngelList fetch failed:", error, 'AdditionalJobBoards')
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        id: `angellist-${Date.now()}-1`,
        title: `Senior ${filters.title || "Developer"}`,
        company: "GameTech Startup",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description: "Join our innovative gaming startup and build the future of interactive entertainment.",
        salary: "$120,000 - $180,000",
        tags: ["Startup", "Gaming", "Equity"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        id: `angellist-${Date.now()}-2`,
        title: `${filters.title || "Game"} Product Manager`,
        company: "VR Innovations Inc",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description: "Lead product development for cutting-edge VR gaming experiences.",
        salary: "$100,000 - $150,000",
        tags: ["Product", "VR", "Remote"],
        postedDate: new Date(),
        source: this.displayName,
      }
    ];

    return jobs.slice(0, filters.limit || this.config.maxResults);
  }

  private normalizeJob(job: any): Job {
    return {
      id: `angellist-${job.id || Math.random().toString(36)}`,
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

/**
 * CrunchBoard Provider - TechCrunch Job Board
 */
export class CrunchBoardProvider implements JobProvider {
  name = "crunchboard";
  displayName = "CrunchBoard";
  description = "TechCrunch's tech startup job board";
  enabled = true;
  priority = 18;
  requiresAuth = false;
  baseUrl = "https://crunchboard.com";
  rateLimit = { requests: 30, period: 3600000 };

  config = {
    maxResults: 20,
    categories: ["startup", "tech"],
    regions: ["us", "global"],
    icon: "mdi-newspaper",
    color: "#0F7B0F",
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
      logger.error("CrunchBoard fetch failed:", error, 'AdditionalJobBoards')
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        id: `crunchboard-${Date.now()}-1`,
        title: `Lead ${filters.title || "Developer"}`,
        company: "TechCrunch Featured Startup",
        location: "New York, NY",
        type: "full-time" as const,
        remote: true,
        description: "Join a high-growth startup featured on TechCrunch.",
        salary: "$140,000 - $200,000",
        tags: ["Leadership", "Startup", "High Growth"],
        postedDate: new Date(),
        source: this.displayName,
      }
    ];

    return jobs.slice(0, filters.limit || this.config.maxResults);
  }

  private normalizeJob(job: any): Job {
    return {
      id: `crunchboard-${job.id || Math.random().toString(36)}`,
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

/**
 * HackerNews Who's Hiring Provider
 */
export class HackerNewsProvider implements JobProvider {
  name = "hackernews";
  displayName = "HackerNews Jobs";
  description = "HackerNews Who's Hiring monthly posts";
  enabled = true;
  priority = 22;
  requiresAuth = false;
  baseUrl = "https://hacker-news.firebaseio.com";
  rateLimit = { requests: 100, period: 3600000 };

  config = {
    maxResults: 30,
    categories: ["tech", "startup"],
    regions: ["global"],
    icon: "mdi-newspaper-variant",
    color: "#FF6600",
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
      logger.error("HackerNews fetch failed:", error, 'AdditionalJobBoards')
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        id: `hn-${Date.now()}-1`,
        title: `Full Stack ${filters.title || "Developer"}`,
        company: "YC Startup",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description: "Join our Y Combinator startup building the future of tech.",
        salary: "$130,000 - $180,000",
        tags: ["YC", "Full Stack", "Remote"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        id: `hn-${Date.now()}-2`,
        title: `${filters.title || "Game"} Backend Engineer`,
        company: "Gaming Startup",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description: "Build scalable backend systems for multiplayer games.",
        salary: "$110,000 - $160,000",
        tags: ["Backend", "Gaming", "Scalability"],
        postedDate: new Date(),
        source: this.displayName,
      }
    ];

    return jobs.slice(0, filters.limit || this.config.maxResults);
  }

  private normalizeJob(job: any): Job {
    return {
      id: `hn-${job.id || Math.random().toString(36)}`,
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

/**
 * LinkedIn Jobs Provider (Limited access)
 */
export class LinkedInJobsProvider implements JobProvider {
  name = "linkedin";
  displayName = "LinkedIn Jobs";
  description = "Professional networking platform jobs";
  enabled = true;
  priority = 8; // High priority
  requiresAuth = true;
  baseUrl = "https://api.linkedin.com";
  rateLimit = { requests: 20, period: 3600000 };

  config = {
    maxResults: 25,
    categories: ["professional", "tech", "gaming"],
    regions: ["global"],
    icon: "mdi-linkedin",
    color: "#0077B5",
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
      logger.error("LinkedIn fetch failed:", error, 'AdditionalJobBoards')
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        id: `linkedin-${Date.now()}-1`,
        title: `Senior ${filters.title || "Developer"}`,
        company: "Meta",
        location: "Menlo Park, CA",
        type: "full-time" as const,
        remote: false,
        description: "Join Meta's Reality Labs and build the metaverse.",
        salary: "$180,000 - $250,000",
        tags: ["Meta", "VR", "Metaverse"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        id: `linkedin-${Date.now()}-2`,
        title: `${filters.title || "Game"} Engine Programmer`,
        company: "Epic Games",
        location: "Cary, NC",
        type: "full-time" as const,
        remote: true,
        description: "Work on Unreal Engine and Fortnite at Epic Games.",
        salary: "$160,000 - $220,000",
        tags: ["Epic", "Unreal", "AAA"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        id: `linkedin-${Date.now()}-3`,
        title: `${filters.title || "Software"} Engineer`,
        company: "Google",
        location: "Mountain View, CA",
        type: "full-time" as const,
        remote: true,
        description: "Build products that impact billions of users.",
        salary: "$170,000 - $240,000",
        tags: ["Google", "Scale", "Impact"],
        postedDate: new Date(),
        source: this.displayName,
      }
    ];

    return jobs.slice(0, filters.limit || this.config.maxResults);
  }

  private normalizeJob(job: any): Job {
    return {
      id: `linkedin-${job.id || Math.random().toString(36)}`,
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

/**
 * Tech Jobs for Good Provider - Mission-driven tech jobs
 */
export class TechJobsForGoodProvider implements JobProvider {
  name = "techjobsforgood";
  displayName = "Tech Jobs for Good";
  description = "Mission-driven tech jobs at nonprofits and social impact companies";
  enabled = true;
  priority = 35;
  requiresAuth = false;
  baseUrl = "https://techjobsforgood.com";
  rateLimit = { requests: 40, period: 3600000 };

  config = {
    maxResults: 20,
    categories: ["nonprofit", "social-impact", "tech"],
    regions: ["us", "global"],
    icon: "mdi-heart",
    color: "#4CAF50",
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
      logger.error("TechJobsForGood fetch failed:", error, 'AdditionalJobBoards')
      return [];
    }
  }

  private generateMockJobs(filters: JobFilters): Job[] {
    const jobs = [
      {
        id: `tjfg-${Date.now()}-1`,
        title: `${filters.title || "Software"} Engineer`,
        company: "Code for America",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description: "Use technology to make government work for people.",
        salary: "$90,000 - $130,000",
        tags: ["Social Impact", "Government", "Civic Tech"],
        postedDate: new Date(),
        source: this.displayName,
      }
    ];

    return jobs.slice(0, filters.limit || this.config.maxResults);
  }

  private normalizeJob(job: any): Job {
    return {
      id: `tjfg-${job.id || Math.random().toString(36)}`,
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
export function createAdditionalJobBoards(): JobProvider[] {
  return [
    new AngelListProvider(),
    new CrunchBoardProvider(),
    new HackerNewsProvider(),
    new LinkedInJobsProvider(),
    new TechJobsForGoodProvider(),
  ];
}
