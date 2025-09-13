
import { databaseManager } from "@/services/database/DatabaseManager";
import { DatabaseJobService } from "@/services/database/DatabaseJobService";
import { DatabaseStudioService } from "@/services/database/DatabaseStudioService";
import { canonicalAIClient } from "@/shared/services/CanonicalAIClient";
import { logger } from "@/shared/utils/logger";
import { generateUUID } from "@/shared/utils/crypto";

// Types for unified service
export interface ServiceInitOptions {
  dbPath?: string;
  aiProvider?: "google" | "openai" | "anthropic";
  enableBackgroundSync?: boolean;
}

export interface UnifiedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange?: string;
  remote: boolean;
  type: "full-time" | "part-time" | "contract" | "internship";
  source: string;
  sourceUrl?: string;
  postedAt: Date;
  aiScore?: number;
  aiAnalysis?: {
    skillMatch: number;
    experienceMatch: number;
    cultureFit: number;
    recommendations: string[];
  };
}

export interface UnifiedStudio {
  id: string;
  name: string;
  description: string;
  location: string;
  size: string;
  type: string;
  founded?: number;
  games: string[];
  technologies: string[];
  website?: string;
  jobOpenings?: number;
  aiInsights?: {
    cultureFit: number;
    careerOpportunities: string[];
    recommendations: string[];
  };
}

export interface UnifiedUser {
  id: string;
  profile: {
    name: string;
    email: string;
    location: string;
    experience: any[];
    skills: any[];
    preferences: any;
  };
  aiData: {
    skillAssessments: any[];
    careerRecommendations: any[];
    interviewPrep: any[];
  };
  activity: {
    jobSearches: any[];
    applications: any[];
    interviews: any[];
  };
}

class UnifiedService {
  private static instance: UnifiedService;
  private initialized = false;
  private dbConnected = false;
  private aiReady = false;

  private constructor() {}

  static getInstance(): UnifiedService {
    if (!UnifiedService.instance) {
      UnifiedService.instance = new UnifiedService();
    }
    return UnifiedService.instance;
  }

  async initialize(options: ServiceInitOptions = {}): Promise<void> {
    if (this.initialized) {
      logger.info("UnifiedService already initialized");
      return;
    }

    try {
      logger.info("Initializing UnifiedService...");

      // Initialize database
      await this.initializeDatabase();

      // Initialize AI services
      await this.initializeAI(options.aiProvider);

      // Initialize job and studio services
      await this.initializeJobServices();
      await this.initializeStudioServices();

      this.initialized = true;
    } catch (_error) {
      logger.error("Failed to initialize UnifiedService:", error);
      throw error;
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await databaseManager.init();
      this.dbConnected = true;
    } catch (_error) {
      logger.error("Database initialization failed:", error);
      throw new Error("Database initialization failed");
    }
  }

  private async initializeAI(provider?: string): Promise<void> {
    try {
      // Try to initialize AI client
      const isReady = await canonicalAIClient.isReady?.value;
      if (isReady) {
        this.aiReady = true;
      } else {
        logger.warn(
        );
      }
    } catch (_error) {
      logger.warn("AI initialization failed:", error);
      // Don't throw - AI is optional
    }
  }

  private async initializeJobServices(): Promise<void> {
    try {
      // Job services use the database manager, so just verify it's working
      const stats = await databaseManager.getStats();
    } catch (_error) {
      logger.error("Job services initialization failed:", error);
      throw error;
    }
  }

  private async initializeStudioServices(): Promise<void> {
    try {
      // Studio services use the database manager, so just verify it's working
      const stats = await databaseManager.getStats();
      logger.info(
      );
    } catch (_error) {
      logger.error("Studio services initialization failed:", error);
      throw error;
    }
  }

  async searchJobs(query: {
    keywords?: string;
    location?: string;
    remote?: boolean;
    type?: string;
    userProfile?: any;
  }): Promise<UnifiedJob[]> {
    this.ensureInitialized();

    try {
      // Get jobs from database
      const jobService = new DatabaseJobService();
      const jobs = await jobService.searchJobs({
        query: query.keywords || "",
        location: query.location,
        remote: query.remote,
        type: query.type as any,
      });

      // If AI is available and user profile provided, add AI scoring
      if (this.aiReady && query.userProfile) {
        return await this.addAIJobScoring(jobs, query.userProfile);
      }

      // Convert to unified format
      return jobs.map((job) => this.convertToUnifiedJob(job));
    } catch (_error) {
      logger.error("Job search failed:", error);
      throw error;
    }
  }

  async searchStudios(query: {
    name?: string;
    location?: string;
    size?: string;
    type?: string;
    userProfile?: any;
  }): Promise<UnifiedStudio[]> {
    this.ensureInitialized();

    try {
      // Get studios from database
      const studioService = new DatabaseStudioService();
      const studios = await studioService.searchStudios({
        query: query.name || "",
        location: query.location,
        size: query.size,
        type: query.type,
      });

      // If AI is available and user profile provided, add AI insights
      if (this.aiReady && query.userProfile) {
        return await this.addAIStudioInsights(studios, query.userProfile);
      }

      // Convert to unified format
      return studios.map((studio) => this.convertToUnifiedStudio(studio));
    } catch (_error) {
      logger.error("Studio search failed:", error);
      throw error;
    }
  }

  async getJobRecommendations(
    userProfile: any,
  ): Promise<UnifiedJob[]> {
    this.ensureInitialized();

    if (!this.aiReady) {
      logger.warn(
        "AI not available for recommendations, returning recent jobs",
      );
      return this.searchJobs({ userProfile });
    }

    try {
      // Use AI to analyze user profile and recommend jobs
      const recommendations = await canonicalAIClient.generateText(
        "You are a gaming industry career advisor. Provide job search recommendations in JSON format.",
      );

      // Parse AI recommendations and search for matching jobs
      const aiCriteria = JSON.parse(recommendations);
      return this.searchJobs({
        keywords: aiCriteria.keywords?.join(" "),
        location: aiCriteria.preferredLocation,
        remote: aiCriteria.remote,
        userProfile,
      });
    } catch (_error) {
      logger.error("AI job recommendations failed:", error);
      // Fallback to basic search
      return this.searchJobs({ userProfile });
    }
  }

  async getStudioRecommendations(
    userProfile: any,
  ): Promise<UnifiedStudio[]> {
    this.ensureInitialized();

    if (!this.aiReady) {
      logger.warn(
        "AI not available for recommendations, returning top studios",
      );
      return this.searchStudios({ userProfile });
    }

    try {
      // Use AI to analyze user profile and recommend studios
      const recommendations = await canonicalAIClient.generateText(
        "You are a gaming industry career advisor. Provide studio recommendations with reasoning.",
      );

      // Get all studios and let AI score them
      const allStudios = await this.searchStudios({ userProfile });
    } catch (_error) {
      logger.error("AI studio recommendations failed:", error);
      // Fallback to basic search
      return this.searchStudios({ userProfile });
    }
  }

  async getServiceStats(): Promise<{
    database: {
      connected: boolean;
      jobs: number;
      studios: number;
      size: string;
    };
    ai: { ready: boolean; provider?: string };
    services: { initialized: boolean };
  }> {
    const stats = {
      ai: { ready: this.aiReady },
      services: { initialized: this.initialized },
    };

    if (this.dbConnected) {
      try {
        const dbStats = await databaseManager.getStats();
        stats.database = {
          connected: true,
          jobs: dbStats.jobs,
          studios: dbStats.studios,
          size: dbStats.dbSize,
        };
      } catch (_error) {
        logger.error("Failed to get database stats:", error);
      }
    }

    return stats;
  }

  // Helper methods

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "UnifiedService not initialized. Call initialize() first.",
      );
    }
  }

  private async addAIJobScoring(
    jobs: any[],
    userProfile: any,
  ): Promise<UnifiedJob[]> {
    try {
      const scoredJobs = await Promise.all(
        jobs.map(async (job) => {
          try {
            const scoreResponse = await canonicalAIClient.generateText(
              `Score this job for the user profile:
            );

            const aiAnalysis = JSON.parse(scoreResponse);
            return {
              ...this.convertToUnifiedJob(job),
              aiScore:
                (aiAnalysis.skillMatch +
                  aiAnalysis.experienceMatch +
                  aiAnalysis.cultureFit) /
              aiAnalysis,
            };
          } catch {
            return this.convertToUnifiedJob(job);
          }
        }),
      );

      // Sort by AI score if available
    } catch (_error) {
      logger.error("AI job scoring failed:", error);
      return jobs.map((job) => this.convertToUnifiedJob(job));
    }
  }

  private async addAIStudioInsights(
    studios: any[],
    userProfile: any,
  ): Promise<UnifiedStudio[]> {
    try {
      const studioInsights = await Promise.all(
        studios.map(async (studio) => {
          try {
            const insightResponse = await canonicalAIClient.generateText(
              `Analyze studio fit for user:
            );

            const aiInsights = JSON.parse(insightResponse);
            return {
              ...this.convertToUnifiedStudio(studio),
              aiInsights,
            };
          } catch {
            return this.convertToUnifiedStudio(studio);
          }
        }),
      );

      return studioInsights;
    } catch (_error) {
      logger.error("AI studio insights failed:", error);
      return studios.map((studio) => this.convertToUnifiedStudio(studio));
    }
  }

  private convertToUnifiedJob(job: any): UnifiedJob {
    return {
      id: job.id || generateUUID(),
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      description: job.description || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements
        : typeof job.requirements === "string"
          ? JSON.parse(job.requirements || "[]")
          : [],
      salaryRange: job.salary_range || job.salaryRange,
      remote: Boolean(job.remote),
      type: job.type || "full-time",
      source: job.source || "database",
      sourceUrl: job.source_url || job.sourceUrl,
      postedAt: job.posted_at ? new Date(job.posted_at) : new Date(),
    };
  }

  private convertToUnifiedStudio(studio: any): UnifiedStudio {
    return {
      id: studio.id || generateUUID(),
      name: studio.name || "",
      description: studio.description || "",
      location: studio.location || "",
      size: studio.size || "",
      type: studio.type || "",
      founded: studio.founded,
      games: Array.isArray(studio.games)
        ? studio.games
        : typeof studio.games === "string"
          ? JSON.parse(studio.games || "[]")
          : [],
      technologies: Array.isArray(studio.technologies)
        ? studio.technologies
        : typeof studio.technologies === "string"
          ? JSON.parse(studio.technologies || "[]")
          : [],
      website: studio.website,
    };
  }
}

// Export singleton instance
export const unifiedService = UnifiedService.getInstance();
export default unifiedService;
