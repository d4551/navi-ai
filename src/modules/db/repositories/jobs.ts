// Job Repository - Database operations for job management
// Centralized job data persistence and queries

import { unifiedStorage } from '@/utils/storage';
import { cacheService } from '@/shared/services/CacheService';
import { logger } from '@/shared/utils/logger';
import type { Job, ExperienceLevel, JobType } from '@/shared/types/jobs';

interface JobSearchRequest {
  query?: string
  location?: string
  remote?: boolean
  jobType?: JobType | string
  experience?: ExperienceLevel | string
  salary?: { min?: number; max?: number }
}

export class JobRepository {
  private static readonly STORE_KEY = 'jobs';
  private static readonly SAVED_JOBS_KEY = 'savedJobs';
  private static readonly APPLICATIONS_KEY = 'applications';
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private static jobsIndex = new Map<string, Job>();
  private static titleIndex = new Map<string, Job[]>();
  private static companyIndex = new Map<string, Job[]>();

  static async getAll(): Promise<Job[]> {
    const cacheKey = 'jobs:all';
    const cached = await cacheService.get<Job[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const jobs = await unifiedStorage.get(this.STORE_KEY);
    const result = Array.isArray(jobs) ? jobs : [];

    // Cache the result
    await cacheService.set(cacheKey, result, {
      ttl: this.CACHE_TTL,
      persistent: true,
      tags: ['jobs']
    });

    // Build indexes for faster queries
    this.buildIndexes(result);

    return result;
  }

  static async getById(id: string): Promise<Job | null> {
    const cacheKey = `job:${id}`;
    const cached = await cacheService.get<Job | null>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    // Check index first
    if (this.jobsIndex.has(id)) {
      const job = this.jobsIndex.get(id)!;
      await cacheService.set(cacheKey, job, { ttl: this.CACHE_TTL });
      return job;
    }

    const jobs = await this.getAll();
    const job = jobs.find(job => job.id === id) || null;

    await cacheService.set(cacheKey, job, { ttl: this.CACHE_TTL });
    return job;
  }

  static async create(job: Job): Promise<Job> {
    const jobs = await this.getAll();
    const newJob: Job = {
      ...job,
      id: job.id || (((typeof globalThis !== 'undefined' && (globalThis as any).crypto?.randomUUID) ? (globalThis as any).crypto.randomUUID() : `job_${Date.now()}_${Math.random().toString(36).slice(2)}`) as string)
    };
    
    jobs.push(newJob);
    await unifiedStorage.set(this.STORE_KEY, jobs);
    return newJob;
  }

  static async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    const jobs = await this.getAll();
    const jobIndex = jobs.findIndex(job => job.id === id);
    
    if (jobIndex === -1) return null;
    
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates
    };
    
    await unifiedStorage.set(this.STORE_KEY, jobs);
    return jobs[jobIndex];
  }

  static async delete(id: string): Promise<boolean> {
    const jobs = await this.getAll();
    const filteredJobs = jobs.filter(job => job.id !== id);
    
    if (filteredJobs.length === jobs.length) return false;
    
    await unifiedStorage.set(this.STORE_KEY, filteredJobs);
    return true;
  }

  static async search(criteria: JobSearchRequest): Promise<Job[]> {
    const cacheKey = `jobs:search:${JSON.stringify(criteria)}`;
    const cached = await cacheService.get<Job[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const allJobs = await this.getAll();
    let filtered = [...allJobs];

    // Use indexes for common queries
    if (criteria.query && this.titleIndex.size > 0) {
      const queryLower = criteria.query.toLowerCase();
      const titleMatches = new Set<string>();
      const companyMatches = new Set<string>();

      // Search title index
      for (const [title, jobs] of this.titleIndex) {
        if (title.includes(queryLower)) {
          jobs.forEach(job => titleMatches.add(job.id!));
        }
      }

      // Search company index
      for (const [company, jobs] of this.companyIndex) {
        if (company.includes(queryLower)) {
          jobs.forEach(job => companyMatches.add(job.id!));
        }
      }

      // Filter using index results if we have matches
      if (titleMatches.size > 0 || companyMatches.size > 0) {
        filtered = filtered.filter(job =>
          titleMatches.has(job.id!) ||
          companyMatches.has(job.id!) ||
          job.description?.toLowerCase().includes(queryLower) ||
          job.tags?.some(tag => tag.toLowerCase().includes(queryLower))
        );
      }
    }

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (criteria.location) {
      const location = criteria.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(location)
      );
    }

    if (criteria.remote !== undefined) {
      filtered = filtered.filter(job => job.remote === criteria.remote);
    }

    if (criteria.jobType) {
      filtered = filtered.filter(job => job.type === criteria.jobType);
    }

    if (criteria.experience) {
      filtered = filtered.filter(job => job.experienceLevel === criteria.experience);
    }

    if (criteria.salary) {
      filtered = filtered.filter(job => {
        if (!job.salary || typeof job.salary === 'string') return true;
        
        const salaryRange = job.salary;
        if (criteria.salary!.min && salaryRange.min < criteria.salary!.min) return false;
        if (criteria.salary!.max && salaryRange.max > criteria.salary!.max) return false;
        
        return true;
      });
    }

    // Cache search results for 5 minutes
    await cacheService.set(cacheKey, filtered, {
      ttl: 5 * 60 * 1000,
      tags: ['jobs', 'search']
    });

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
    const filtered = saved.filter(id => id !== jobId);
    await unifiedStorage.set(this.SAVED_JOBS_KEY, filtered);
  }

  static async isSaved(jobId: string): Promise<boolean> {
    const saved = await this.getSavedJobs();
    return saved.includes(jobId);
  }

  // Job applications management
  static async getApplications(): Promise<Array<{jobId: string, appliedAt: Date, status: string}>> {
    const applications = await unifiedStorage.get(this.APPLICATIONS_KEY);
    return Array.isArray(applications) ? applications : [];
  }

  static async applyToJob(jobId: string): Promise<void> {
    const applications = await this.getApplications();
    const existing = applications.find(app => app.jobId === jobId);
    
    if (!existing) {
      applications.push({
        jobId,
        appliedAt: new Date(),
        status: 'applied'
      });
      await unifiedStorage.set(this.APPLICATIONS_KEY, applications);
    }
  }

  static async updateApplicationStatus(jobId: string, status: string): Promise<void> {
    const applications = await this.getApplications();
    const application = applications.find(app => app.jobId === jobId);

    if (application) {
      application.status = status;
      await unifiedStorage.set(this.APPLICATIONS_KEY, applications);

      // Invalidate related caches
      await cacheService.invalidateByTags(['applications']);
    }
  }

  // Build indexes for faster queries
  private static buildIndexes(jobs: Job[]): void {
    this.jobsIndex.clear();
    this.titleIndex.clear();
    this.companyIndex.clear();

    for (const job of jobs) {
      if (!job.id) continue;

      // ID index
      this.jobsIndex.set(job.id, job);

      // Title index
      if (job.title) {
        const titleKey = job.title.toLowerCase();
        if (!this.titleIndex.has(titleKey)) {
          this.titleIndex.set(titleKey, []);
        }
        this.titleIndex.get(titleKey)!.push(job);
      }

      // Company index
      if (job.company) {
        const companyKey = job.company.toLowerCase();
        if (!this.companyIndex.has(companyKey)) {
          this.companyIndex.set(companyKey, []);
        }
        this.companyIndex.get(companyKey)!.push(job);
      }
    }

    logger.info(`Built indexes for ${this.jobsIndex.size} jobs`);
  }

  // Clear all caches
  static async clearCache(): Promise<void> {
    await cacheService.invalidateByTags(['jobs']);
    this.jobsIndex.clear();
    this.titleIndex.clear();
    this.companyIndex.clear();
    logger.info('Job caches cleared');
  }

  // Get popular job titles for autocomplete
  static async getPopularTitles(limit: number = 10): Promise<string[]> {
    const cacheKey = `jobs:popular-titles:${limit}`;
    const cached = await cacheService.get<string[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const jobs = await this.getAll();
    const titleCounts = new Map<string, number>();

    jobs.forEach(job => {
      if (job.title) {
        const title = job.title.trim();
        titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
      }
    });

    const popular = Array.from(titleCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);

    await cacheService.set(cacheKey, popular, {
      ttl: 60 * 60 * 1000, // 1 hour
      tags: ['jobs', 'suggestions']
    });

    return popular;
  }
}
