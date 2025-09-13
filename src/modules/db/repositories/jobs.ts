// Job Repository - Database operations for job management
// Centralized job data persistence and queries

import { unifiedStorage } from "@/utils/storage";
import type { Job, ExperienceLevel, JobType } from "../../../shared/types/jobs";

interface JobSearchRequest {
  query?: string;
  location?: string;
  remote?: boolean;
  jobType?: JobType | string;
  experience?: ExperienceLevel | string;
  salary?: { min?: number; max?: number };
}

export class JobRepository {
  private static readonly STORE_KEY = "jobs";
  private static readonly SAVED_JOBS_KEY = "savedJobs";
  private static readonly APPLICATIONS_KEY = "applications";

  static async getAll(): Promise<Job[]> {
    const jobs = await unifiedStorage.get(this.STORE_KEY);
    return Array.isArray(jobs) ? jobs : [];
  }

  static async getById(id: string): Promise<Job | null> {
    const jobs = await this.getAll();
    return jobs.find((job) => job.id === id) || null;
  }

  static async create(job: Job): Promise<Job> {
    const jobs = await this.getAll();
    const newJob: Job = {
      ...job,
      id:
        job.id ||
        ((typeof globalThis !== "undefined" &&
        (globalThis as any).crypto?.randomUUID
          ? (globalThis as any).crypto.randomUUID()
          : `job_${Date.now()}_${Math.random().toString(36).slice(2)}`) as string),
    };

    jobs.push(newJob);
    await unifiedStorage.set(this.STORE_KEY, jobs);
    return newJob;
  }

  static async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    const jobs = await this.getAll();
    const jobIndex = jobs.findIndex((job) => job.id === id);

    if (jobIndex === -1) return null;

    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
    };

    await unifiedStorage.set(this.STORE_KEY, jobs);
    return jobs[jobIndex];
  }

  static async delete(id: string): Promise<boolean> {
    const jobs = await this.getAll();
    const filteredJobs = jobs.filter((job) => job.id !== id);

    if (filteredJobs.length === jobs.length) return false;

    await unifiedStorage.set(this.STORE_KEY, filteredJobs);
    return true;
  }

  static async search(criteria: JobSearchRequest): Promise<Job[]> {
    const allJobs = await this.getAll();
    let filtered = [...allJobs];

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (criteria.location) {
      const location = criteria.location.toLowerCase();
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(location),
      );
    }

    if (criteria.remote !== undefined) {
      filtered = filtered.filter((job) => job.remote === criteria.remote);
    }

    if (criteria.jobType) {
      filtered = filtered.filter((job) => job.type === criteria.jobType);
    }

    if (criteria.experience) {
      filtered = filtered.filter(
        (job) => job.experienceLevel === criteria.experience,
      );
    }

    if (criteria.salary) {
      filtered = filtered.filter((job) => {
        if (!job.salary || typeof job.salary === "string") return true;

        const salaryRange = job.salary;
        if (criteria.salary!.min && salaryRange.min < criteria.salary!.min)
          return false;
        if (criteria.salary!.max && salaryRange.max > criteria.salary!.max)
          return false;

        return true;
      });
    }

    return filtered;
  }

  // Saved jobs management
  static async getSavedJobs(): Promise<string[]> {
    const saved = await unifiedStorage.get(this.SAVED_JOBS_KEY);
    return Array.isArray(saved) ? saved : [];
  }

  static async saveJob(jobId: string): Promise<void> {
    const saved = await this.getSavedJobs();
    if (!saved.includes(jobId)) {
      saved.push(jobId);
      await unifiedStorage.set(this.SAVED_JOBS_KEY, saved);
    }
  }

  static async unsaveJob(jobId: string): Promise<void> {
    const saved = await this.getSavedJobs();
    const filtered = saved.filter((id) => id !== jobId);
    await unifiedStorage.set(this.SAVED_JOBS_KEY, filtered);
  }

  static async isSaved(jobId: string): Promise<boolean> {
    const saved = await this.getSavedJobs();
    return saved.includes(jobId);
  }

  // Job applications management
  static async getApplications(): Promise<
    Array<{ jobId: string; appliedAt: Date; status: string }>
  > {
    const applications = await unifiedStorage.get(this.APPLICATIONS_KEY);
    return Array.isArray(applications) ? applications : [];
  }

  static async applyToJob(jobId: string): Promise<void> {
    const applications = await this.getApplications();
    const existing = applications.find((app) => app.jobId === jobId);

    if (!existing) {
      applications.push({
        jobId,
        appliedAt: new Date(),
        status: "applied",
      });
      await unifiedStorage.set(this.APPLICATIONS_KEY, applications);
    }
  }

  static async updateApplicationStatus(
    jobId: string,
    status: string,
  ): Promise<void> {
    const applications = await this.getApplications();
    const application = applications.find((app) => app.jobId === jobId);

    if (application) {
      application.status = status;
      await unifiedStorage.set(this.APPLICATIONS_KEY, applications);
    }
  }
}
