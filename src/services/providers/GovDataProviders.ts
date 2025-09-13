
import axios from "axios";
import { BaseJobProvider } from "./JobProviderInterface";
import type { Job, JobFilters } from "@/shared/types/jobs";

export class CareerOneStopProvider extends BaseJobProvider {
  name = "CareerOneStop (US DOL)";
  enabled = !!process.env.VITE_CAREERONESTOP_API_KEY;
  apiKey = process.env.VITE_CAREERONESTOP_API_KEY;

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      userId: "your_user_id", // Would need to be configured
      keyword: filters.title || "developer",
      location: filters.location || "",
      sort: "relevance",
    };
  }

  parseResponse(data: any): Job[] {
    if (!data?.Jobs || !Array.isArray(data.Jobs)) return [];

    return data.Jobs.map((job: any) => ({
      id: `careeronestop-${job.JobId}`,
      title: job.JobTitle,
      company: job.CompanyName || "Not specified",
      location: job.Location || "Not specified",
      remote: job.IsRemote || false,
      salary: job.Salary ? { min: job.Salary, max: job.Salary } : undefined,
      description: job.Description || "",
      requirements: this.parseRequirements(job.Description || ""),
      technologies: this.extractTechnologies(job.Description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.PostedDate || new Date().toISOString(),
      featured: false,
      source: "CareerOneStop",
    }));
  }
}

export class NHSJobsProvider extends BaseJobProvider {
  name = "NHS Jobs (UK)";
  enabled = false; // Disabled due to CORS restrictions

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      keyword: filters.title || "",
      location: filters.location || "",
    };
  }

  async makeRequest(params: Record<string, any>): Promise<any> {
    const response = await this.httpClient.get(this.baseUrl, {
      params,
      responseType: "text",
    });
    return { data: this.xmlParser.parse(response.data) };
  }

  parseResponse(data: any): Job[] {
    const jobs = data?.Jobs?.Job;
    if (!jobs) return [];
    if (!Array.isArray(jobs)) return [jobs].map(this.parseNHSJob.bind(this));

    return jobs.map(this.parseNHSJob.bind(this));
  }

  private parseNHSJob(job: any): Job {
    return {
      id: `nhs-${job.JobId}`,
      title: job.JobTitle,
      company: "NHS",
      location: job.Location || "UK",
      remote: false,
      description: job.JobDescription || "",
      requirements: this.parseRequirements(job.JobDescription || ""),
      technologies: this.extractTechnologies(job.JobDescription || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.PostedDate || new Date().toISOString(),
      featured: false,
      source: "NHS Jobs",
    };
  }
}

export class UKApprenticeshipsProvider extends BaseJobProvider {
  name = "UK Apprenticeships (DfE)";
  baseUrl = "https://api.apprenticeships.education.gov.uk/vacancies";
  enabled = false; // Disabled due to CORS restrictions

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      searchTerm: filters.title || "",
    };
  }

  parseResponse(data: any): Job[] {
    if (!data?.results || !Array.isArray(data.results)) return [];

    return data.results.map((job: any) => ({
      id: `dfe-${job.vacancyReference}`,
      title: job.apprenticeshipTitle,
      company: job.employerName || "Not specified",
      location: job.town || "UK",
      remote: false,
      description: job.description || "",
      requirements: this.parseRequirements(job.description || ""),
      technologies: this.extractTechnologies(job.description || ""),
      experienceLevel: "entry",
      type: "apprenticeship",
      postedDate: job.postedDate || new Date().toISOString(),
      featured: false,
      source: "UK Apprenticeships",
    }));
  }
}

export class NYCJobsProvider extends BaseJobProvider {
  name = "NYC Government Jobs";
  enabled = false; // Disabled due to CORS restrictions

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      $where: filters.title
        ? `business_title like '%${filters.title}%'`
        : undefined,
    };
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(_data)) return [];

    return data.map((job: any) => ({
      id: `nyc-${job.job_id}`,
      title: job.business_title,
      company: "City of New York",
      location: "New York, NY",
      remote: job.work_location?.toLowerCase().includes("remote") || false,
      salary:
        job.salary_range_from && job.salary_range_to
          ? {
              min: Number(job.salary_range_from),
              max: Number(job.salary_range_to),
            }
          : undefined,
      description: job.job_description || "",
      requirements: this.parseRequirements(job.job_description || ""),
      technologies: this.extractTechnologies(job.job_description || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.posting_date || new Date().toISOString(),
      featured: false,
      source: "NYC Government Jobs",
    }));
  }
}

export class DOLSeasonalJobsProvider extends BaseJobProvider {
  name = "U.S. DOL SeasonalJobs";
  baseUrl = "https://seasonaljobs.dol.gov/feeds";
  enabled = false; // Disabled due to CORS restrictions

  buildParams(_filters: JobFilters): Record<string, any> {
    return {};
  }

  async makeRequest(_params: Record<string, any>): Promise<any> {
    // This is a feed endpoint, might need different handling
      responseType: "text",
    });
    return { data: this.xmlParser.parse(response.data) };
  }

  parseResponse(data: any): Job[] {
    const jobs = data?.Jobs?.Job;
    if (!jobs) return [];
    if (!Array.isArray(jobs)) return [jobs].map(this.parseDOLJob.bind(this));

    return jobs.map(this.parseDOLJob.bind(this));
  }

  private parseDOLJob(job: any): Job {
    return {
      id: `dol-${job.JobId}`,
      title: job.JobTitle,
      company: job.EmployerName || "Not specified",
      location: job.WorksiteAddress || "USA",
      remote: false,
      salary:
        job.BasicRateFrom && job.BasicRateTo
          ? {
              min: Number(job.BasicRateFrom),
              max: Number(job.BasicRateTo),
            }
          : undefined,
      description: job.JobDescription || "",
      requirements: this.parseRequirements(job.JobDescription || ""),
      technologies: this.extractTechnologies(job.JobDescription || ""),
      experienceLevel: "entry",
      type: "contract",
      postedDate: job.DatePosted || new Date().toISOString(),
      featured: false,
      source: "DOL Seasonal Jobs",
    };
  }
}

export class BundesagenturProvider extends BaseJobProvider {
  name = "Bundesagentur für Arbeit (DE)";
  baseUrl =
  enabled = false; // Disabled due to CORS restrictions

  protected httpClient = axios.create({
    headers: {
      "X-API-Key": "jobboerse-jobsuche",
    },
  });

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      was: filters.title || "",
      wo: filters.location || "",
    };
  }

  parseResponse(data: any): Job[] {
    if (!data?.stellenangebote || !Array.isArray(data.stellenangebote))
      return [];

    return data.stellenangebote.map((job: any) => ({
      id: `bundesagentur-${job.stellenangebotsId}`,
      title: job.stellenangebotsTitel,
      company: job.arbeitgeberName || "Not specified",
      location: job.arbeitsort?.ort || "Germany",
      remote: job.homeoffice || false,
      salary:
        job.gehalt?.von && job.gehalt?.bis
          ? {
              min: job.gehalt.von,
              max: job.gehalt.bis,
            }
          : undefined,
      description: job.beschreibung || "",
      requirements: this.parseRequirements(job.beschreibung || ""),
      technologies: this.extractTechnologies(job.beschreibung || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.angebotsdatum || new Date().toISOString(),
      featured: false,
      source: "Bundesagentur für Arbeit",
    }));
  }
}

export class WorkNetProvider extends BaseJobProvider {
  name = "WorkNet (South Korea)";
  baseUrl = "http://openapi.work.go.kr/opi/opi/opi.do";
  enabled = !!process.env.VITE_WORKNET_API_KEY;
  apiKey = process.env.VITE_WORKNET_API_KEY;

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      authKey: this.apiKey,
      returnType: "XML",
      callTp: "L",
      srchType: "job",
      keyword: filters.title || "",
      region: filters.location || "",
    };
  }

  async makeRequest(params: Record<string, any>): Promise<any> {
    const response = await this.httpClient.get(this.baseUrl, {
      params,
      responseType: "text",
    });
    return { data: this.xmlParser.parse(response.data) };
  }

  parseResponse(data: any): Job[] {
    const jobs = data?.WantedList?.Wanted;
    if (!jobs) return [];
    if (!Array.isArray(jobs))
      return [jobs].map(this.parseWorkNetJob.bind(this));

    return jobs.map(this.parseWorkNetJob.bind(this));
  }

  private parseWorkNetJob(job: any): Job {
    return {
      id: `worknet-${job.wantedAuthNo}`,
      title: job.wantedTitle,
      company: job.company || "Not specified",
      location: job.region || "South Korea",
      remote: false,
      description: job.jobCont || "",
      requirements: this.parseRequirements(job.jobCont || ""),
      technologies: this.extractTechnologies(job.jobCont || ""),
      experienceLevel: "mid",
      type: "full-time",
      postedDate: job.regDt || new Date().toISOString(),
      featured: false,
      source: "WorkNet",
    };
  }
}
