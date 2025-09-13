
import { BaseJobProvider } from "./JobProviderInterface";
import type { Job, JobFilters } from "@/shared/types/jobs";

export class CareerjetProvider extends BaseJobProvider {
  name = "Careerjet";
  baseUrl = "https://public-api.careerjet.net/search";
  enabled = !!process.env.VITE_CAREERJET_API_KEY;
  apiKey = process.env.VITE_CAREERJET_API_KEY;

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      api_key: this.apiKey,
      keywords: filters.title || "",
      location: filters.location || "",
      sort: "relevance",
    };
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any) => ({
      id: `careerjet-${job.id}`,
      title: job.title,
      company: job.company || "Not specified",
      location: job.locations || "Not specified",
      remote: job.description?.toLowerCase().includes("remote") || false,
      description: job.description || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.date || new Date().toISOString(),
      featured: false,
      source: "Careerjet",
    }));
  }
}

export class JoobleProvider extends BaseJobProvider {
  name = "Jooble";
  enabled = !!process.env.VITE_JOOBLE_API_KEY;
  apiKey = process.env.VITE_JOOBLE_API_KEY;

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      api_key: this.apiKey,
      keywords: filters.title || "",
      location: filters.location || "",
    };
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any) => ({
      id: `jooble-${job.id}`,
      title: job.title,
      company: job.company || "Not specified",
      location: job.location || "Not specified",
      remote: job.type?.toLowerCase().includes("remote") || false,
      description: job.snippet || "",
      requirements: this.parseRequirements(job.snippet || ""),
      technologies: this.extractTechnologies(job.snippet || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.updated || new Date().toISOString(),
      featured: false,
      source: "Jooble",
    }));
  }
}

export class ReedProvider extends BaseJobProvider {
  name = "Reed.co.uk";
  enabled = !!process.env.VITE_REED_API_KEY;
  apiKey = process.env.VITE_REED_API_KEY;

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      keywords: filters.title || "",
      location: filters.location || "",
    };
  }

  protected async makeRequest(params: Record<string, any>): Promise<any> {
    return this.httpClient.get(this.baseUrl, {
      params,
      headers: {
        Authorization: `Basic ${btoa(`${this.apiKey}:`)}`,
      },
    });
  }

  parseResponse(data: any): Job[] {
    if (!data?.results || !Array.isArray(data.results)) return [];

    return data.results.map((job: any) => ({
      id: `reed-${job.jobId}`,
      title: job.jobTitle,
      company: job.employerName || "Not specified",
      location: job.locationName || "UK",
      remote: job.isWorkFromHome || false,
      salary:
        job.minimumSalary && job.maximumSalary
          ? {
              min: job.minimumSalary,
              max: job.maximumSalary,
            }
          : undefined,
      description: job.jobDescription || "",
      requirements: this.parseRequirements(job.jobDescription || ""),
      technologies: this.extractTechnologies(job.jobDescription || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.date || new Date().toISOString(),
      featured: false,
      source: "Reed.co.uk",
    }));
  }
}

export class JujuProvider extends BaseJobProvider {
  name = "Juju Publisher API";
  baseUrl = "https://api.juju.com/publisher";
  enabled = !!process.env.VITE_JUJU_PUBLISHER_ID;
  apiKey = process.env.VITE_JUJU_PUBLISHER_ID;

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      publisher: this.apiKey,
      k: filters.title || "",
      l: filters.location || "",
    };
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: any) => ({
      id: `juju-${job.id}`,
      title: job.title,
      company: job.company || "Not specified",
      location: job.location || "Not specified",
      remote: job.remote || false,
      description: job.description || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.date || new Date().toISOString(),
      featured: false,
      source: "Juju",
    }));
  }
}

  return [
    new CareerjetProvider(),
    new JoobleProvider(),
    new ReedProvider(),
    new JujuProvider(),
  ];
}
