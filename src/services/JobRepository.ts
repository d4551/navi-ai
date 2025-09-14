
import type { Job, JobApplication, JobFilters } from "@/shared/types/jobs";
import { logger } from "@/shared/utils/logger";

export class JobRepository {
  private static readonly STORAGE_KEYS = {
    JOBS: "jobRepository.jobs",
    APPLICATIONS: "jobRepository.applications",
    SAVED_JOBS: "jobRepository.savedJobs",
  };

  static async saveJob(jobId: string): Promise<void> {
    try {
      const savedJobs = this.getSavedJobIds();
      if (!savedJobs.includes(jobId)) {
        savedJobs.push(jobId);
        localStorage.setItem(
          this.STORAGE_KEYS.SAVED_JOBS,
          JSON.stringify(savedJobs),
        );
      }
    } catch (_error) {
      logger.error("Failed to save job:", error, "JobRepository");
      throw new Error("Failed to save job");
    }
  }

  static async unsaveJob(jobId: string): Promise<void> {
    try {
      const savedJobs = this.getSavedJobIds();
      const filtered = savedJobs.filter((id) => id !== jobId);
      localStorage.setItem(
        this.STORAGE_KEYS.SAVED_JOBS,
        JSON.stringify(filtered),
      );
    } catch (_error) {
      logger.error("Failed to unsave job:", error, "JobRepository");
      throw new Error("Failed to unsave job");
    }
  }

  static getSavedJobs(): string[] {
    return this.getSavedJobIds();
  }

  static isJobSaved(jobId: string): boolean {
    return this.getSavedJobIds().includes(jobId);
  }

  static async create(job: Job): Promise<Job> {
    try {
      const jobs = this.getAllJobs();
      const existingIndex = jobs.findIndex((j) => j.id === job.id);

        jobs[existingIndex] = { ...jobs[existingIndex], ...job };
      } else {
        jobs.push(job);
      }

      localStorage.setItem(this.STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      return job;
    } catch (_error) {
      logger.error("Failed to create job:", error, "JobRepository");
      throw new Error("Failed to create job");
    }
  }

  static getAll(): Job[] {
    return this.getAllJobs();
  }

  static async searchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      let jobs = this.getAllJobs();

      if (filters.title) {
        const query = filters.title.toLowerCase();
        jobs = jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.description?.toLowerCase().includes(query),
        );
      }

      if (filters.location) {
        jobs = jobs.filter((job) =>
          job.location.toLowerCase().includes(filters.location!.toLowerCase()),
        );
      }

      if (filters.jobType) {
        jobs = jobs.filter((job) => job.type === filters.jobType);
      }

      if (filters.experienceLevel) {
        jobs = jobs.filter(
          (job) => job.experienceLevel === filters.experienceLevel,
        );
      }

      if (filters.remote !== undefined) {
        jobs = jobs.filter((job) => job.remote === filters.remote);
      }

      return jobs;
    } catch (_error) {
      logger.error("Failed to search jobs:", error, "JobRepository");
      return [];
    }
  }

  static async saveApplication(application: JobApplication): Promise<void> {
    try {
      const applications = this.getAllApplications();
      const existingIndex = applications.findIndex(
        (app) => app.id === application.id,
      );

        applications[existingIndex] = {
          ...applications[existingIndex],
          ...application,
        };
      } else {
        applications.push(application);
      }

      localStorage.setItem(
        this.STORAGE_KEYS.APPLICATIONS,
        JSON.stringify(applications),
      );
    } catch (_error) {
      logger.error("Failed to save application:", error, "JobRepository");
      throw new Error("Failed to save application");
    }
  }

  static getAllApplications(): JobApplication[] {
    return this.getAllApplicationsPrivate();
  }

  private static getSavedJobIds(): string[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.SAVED_JOBS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private static getAllJobs(): Job[] {
    try {
      const jobs = localStorage.getItem(this.STORAGE_KEYS.JOBS);
      return jobs ? JSON.parse(jobs) : [];
    } catch {
      return [];
    }
  }

  private static getAllApplicationsPrivate(): JobApplication[] {
    try {
      const applications = localStorage.getItem(this.STORAGE_KEYS.APPLICATIONS);
      return applications ? JSON.parse(applications) : [];
    } catch {
      return [];
    }
  }
}
