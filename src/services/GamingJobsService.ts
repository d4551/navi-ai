
import { ref, computed } from "vue";
import type { Job, JobFilters } from "@/shared/types/jobs";
import { searchJobsRefactored, searchJobsUnified } from "./JobAPIService";
import { logger } from "@/shared/utils/logger";

export interface GamingJobFilters extends JobFilters {
  // Gaming-specific filters
  gameEngines?: string[];
  studioTypes?: string[];
  gameGenres?: string[];
  platforms?: string[];
  roleCategories?: string[];
  experienceLevel?: string;
  workStyle?: "remote" | "hybrid" | "onsite" | "any";
  salaryRange?: { min?: number; max?: number };

  // AI-powered filters
  skillsMatch?: boolean;
  cultureFit?: boolean;
  careerGrowth?: boolean;
  diversityFocused?: boolean;

  // Special filters
  featured?: boolean;
  topCompaniesOnly?: boolean;
  urgentHiring?: boolean;
}

export interface GamingJobSearchResult {
  jobs: Job[];
  totalResults: number;
  analytics: GamingJobAnalytics;
  recommendations: JobRecommendation[];
  trends: MarketTrend[];
  sources: string[];
  processingTime: number;
  errors: string[];
}

export interface GamingJobAnalytics {
  averageSalary: number;
  salaryTrends: { period: string; value: number }[];
  topSkills: { skill: string; demand: number; growth: string }[];
  topCompanies: { company: string; openings: number; trend: string }[];
  locationHotspots: { location: string; count: number; avgSalary: number }[];
  experienceDistribution: { level: string; percentage: number }[];
  remoteVsOnsite: { remote: number; hybrid: number; onsite: number };
}

export interface JobRecommendation {
  job: Job;
  matchScore: number;
  reasons: string[];
  skillGaps: string[];
  careerImpact: "high" | "medium" | "low";
}

export interface MarketTrend {
  category: string;
  trend: "rising" | "stable" | "declining";
  change: number;
  insight: string;
}

export interface GamingJobAlert {
  id: string;
  name: string;
  filters: GamingJobFilters;
  frequency: "daily" | "weekly" | "instant";
  enabled: boolean;
  lastTriggered?: Date;
  matchCount: number;
  createdAt: Date;
}

class GamingJobsService {
  private cache = new Map<string, { data: any; expiry: number }>();

  // Gaming-specific keywords for filtering
  private readonly GAMING_KEYWORDS = [
    "game",
    "gaming",
    "unity",
    "unreal",
    "gamedev",
    "studio",
    "gameplay",
    "level design",
    "character",
    "animation",
    "shader",
    "rendering",
    "multiplayer",
    "mobile game",
    "console",
    "pc gaming",
    "esports",
    "vr",
    "ar",
    "game engine",
    "game design",
    "game art",
    "game audio",
    "qa testing",
    "game producer",
    "technical artist",
    "gameplay programmer",
    "game writer",
    "narrative",
    "monetization",
    "live ops",
    "user acquisition",
  ];

  private readonly GAMING_COMPANIES = [
    "Epic Games",
    "Riot Games",
    "Blizzard",
    "Activision",
    "Electronic Arts",
    "EA",
    "Ubisoft",
    "Valve",
    "Steam",
    "Nintendo",
    "Sony Interactive",
    "PlayStation",
    "Xbox",
    "Microsoft Gaming",
    "Bungie",
    "Bethesda",
    "CD Projekt",
    "Square Enix",
    "Bandai Namco",
    "Capcom",
    "Konami",
    "Take-Two",
    "Rockstar",
    "Indie",
    "Studio",
  ];

  async searchGamingJobs(
    filters: GamingJobFilters = {},
  ): Promise<GamingJobSearchResult> {
    const startTime = Date.now();

    try {
      // Convert gaming filters to standard job filters
      const jobFilters = this.convertToJobFilters(filters);

      // Get jobs from the API
      const result = await searchJobsRefactored(jobFilters);

      // Filter and enhance for gaming industry
      const gamingJobs = this.filterGamingJobs(result.jobs, filters);
      const enhancedJobs = await this.enhanceJobsWithAI(gamingJobs, filters);

      // Generate analytics and insights
      const analytics = this.generateAnalytics(enhancedJobs);
      const recommendations = await this.generateRecommendations(
        enhancedJobs,
        filters,
      );
      const trends = this.generateMarketTrends(enhancedJobs, analytics);

      return {
        jobs: enhancedJobs,
        totalResults: enhancedJobs.length,
        analytics,
        recommendations,
        trends,
        sources: result.sources,
        processingTime: Date.now() - startTime,
        errors: result.errors,
      };
    } catch (_error) {
      logger.error("Gaming job search failed:", error);
      return {
        jobs: [],
        analytics: this.getEmptyAnalytics(),
        recommendations: [],
        trends: [],
        sources: [],
        processingTime: Date.now() - startTime,
        errors: [error.message],
      };
    }
  }

  private convertToJobFilters(gamingFilters: GamingJobFilters): JobFilters {
    const keywords = [];

    // Add gaming-specific keywords based on filters
    if (gamingFilters.roleCategories?.length) {
      keywords.push(...gamingFilters.roleCategories);
    }

    if (gamingFilters.gameEngines?.length) {
      keywords.push(...gamingFilters.gameEngines);
    }

    if (gamingFilters.gameGenres?.length) {
      keywords.push(...gamingFilters.gameGenres);
    }

    // Always include basic gaming keywords
    keywords.push("game", "gaming", "studio");

    return {
      keywords: keywords.join(" "),
      location: gamingFilters.location,
      remote: gamingFilters.workStyle === "remote",
      hybrid: gamingFilters.workStyle === "hybrid",
      experienceLevel: gamingFilters.experienceLevel,
      salaryMin: gamingFilters.salaryRange?.min,
      salaryMax: gamingFilters.salaryRange?.max,
      companySize: gamingFilters.studioTypes,
      skills: gamingFilters.gameEngines || [],
    };
  }

  private filterGamingJobs(jobs: Job[], filters: GamingJobFilters): Job[] {
    return jobs.filter((job) => {
      // Check if job is gaming-related
      if (!this.isGamingJob(job)) return false;

      // Apply gaming-specific filters
      if (
        filters.gameEngines?.length &&
        !this.matchesGameEngines(job, filters.gameEngines)
      ) {
        return false;
      }

      if (
        filters.studioTypes?.length &&
        !this.matchesStudioType(job, filters.studioTypes)
      ) {
        return false;
      }

      if (
        filters.gameGenres?.length &&
        !this.matchesGenres(job, filters.gameGenres)
      ) {
        return false;
      }

      if (
        filters.platforms?.length &&
        !this.matchesPlatforms(job, filters.platforms)
      ) {
        return false;
      }

      if (filters.featured && !job.featured) {
        return false;
      }

      if (filters.urgentHiring && !this.isUrgentHiring(job)) {
        return false;
      }

      return true;
    });
  }

  private isGamingJob(job: Job): boolean {
    const searchText =
      `${job.title} ${job.description || ""} ${job.company}`.toLowerCase();

    // Check for gaming keywords
    const hasGamingKeywords = this.GAMING_KEYWORDS.some((keyword) =>
      searchText.includes(keyword.toLowerCase()),
    );

    // Check for gaming companies
    const isGamingCompany = this.GAMING_COMPANIES.some((company) =>
      job.company.toLowerCase().includes(company.toLowerCase()),
    );

    return hasGamingKeywords || isGamingCompany;
  }

  private matchesGameEngines(job: Job, engines: string[]): boolean {
    const searchText =
      `${job.title} ${job.description || ""} ${job.technologies?.join(" ") || ""}`.toLowerCase();
    return engines.some((engine) => searchText.includes(engine.toLowerCase()));
  }

  private matchesStudioType(job: Job, types: string[]): boolean {
    // Simple heuristic based on company name and job description
    const searchText = `${job.company} ${job.description || ""}`.toLowerCase();

    return types.some((type) => {
      switch (type) {
        case "aaa":
            searchText.includes(company.toLowerCase()),
          );
        case "indie":
          return (
            searchText.includes("indie") || searchText.includes("independent")
          );
        case "mobile":
          return (
            searchText.includes("mobile") ||
            searchText.includes("ios") ||
            searchText.includes("android")
          );
        case "startup":
          return (
            searchText.includes("startup") || searchText.includes("early stage")
          );
        default:
          return false;
      }
    });
  }

  private matchesGenres(job: Job, genres: string[]): boolean {
    const searchText = `${job.title} ${job.description || ""}`.toLowerCase();
    return genres.some((genre) => searchText.includes(genre.toLowerCase()));
  }

  private matchesPlatforms(job: Job, platforms: string[]): boolean {
    const searchText = `${job.title} ${job.description || ""}`.toLowerCase();
    return platforms.some((platform) =>
      searchText.includes(platform.toLowerCase()),
    );
  }

  private isUrgentHiring(job: Job): boolean {
    const searchText = `${job.title} ${job.description || ""}`.toLowerCase();
    return (
      searchText.includes("urgent") ||
      searchText.includes("immediate") ||
      searchText.includes("asap") ||
      searchText.includes("start immediately")
    );
  }

  private async enhanceJobsWithAI(
    jobs: Job[],
    filters: GamingJobFilters,
  ): Promise<Job[]> {
    return jobs.map((job) => ({
      ...job,
      // Add AI match score based on user preferences
      matchScore: this.calculateMatchScore(job, filters),
      // Enhance with gaming-specific data
      studioType: this.detectStudioType(job),
      gameGenres: this.detectGameGenres(job),
      platforms: this.detectPlatforms(job),
      // Add application insights
      applicationUrl: job.applicationUrl || job.url,
      featured: job.featured || this.isFeaturedJob(job),
    }));
  }

  private calculateMatchScore(job: Job, filters: GamingJobFilters): number {

    // Experience level match
    if (
      filters.experienceLevel &&
      job.experienceLevel === filters.experienceLevel
    ) {
    }

    // Work style preference
    if (filters.workStyle === "onsite" && !job.remote && !job.hybrid)

    // Technology match
    if (filters.gameEngines?.length && job.technologies?.length) {
      const matches = filters.gameEngines.filter((engine) =>
        job.technologies.some((tech) =>
          tech.toLowerCase().includes(engine.toLowerCase()),
        ),
      );
    }

    // Salary match
    if (filters.salaryRange && typeof job.salary === "object") {
      const jobSalary = job.salary as any;
    }

  }

  private detectStudioType(job: Job): string {
    const company = job.company.toLowerCase();

    if (
        company.includes(c.toLowerCase()),
      )
    ) {
      return "aaa";
    }
    if (company.includes("indie") || company.includes("independent")) {
      return "indie";
    }
    if (
      company.includes("mobile") ||
      job.title.toLowerCase().includes("mobile")
    ) {
      return "mobile";
    }

    return "other";
  }

  private detectGameGenres(job: Job): string[] {
    const searchText = `${job.title} ${job.description || ""}`.toLowerCase();
    const genres = [];

    if (searchText.includes("fps") || searchText.includes("shooter"))
      genres.push("fps");
    if (searchText.includes("rpg") || searchText.includes("role playing"))
      genres.push("rpg");
    if (searchText.includes("strategy") || searchText.includes("rts"))
      genres.push("strategy");
    if (searchText.includes("mmo") || searchText.includes("multiplayer"))
      genres.push("mmo");
    if (searchText.includes("puzzle")) genres.push("puzzle");
    if (searchText.includes("platform") || searchText.includes("platformer"))
      genres.push("platformer");
    if (searchText.includes("racing")) genres.push("racing");
    if (searchText.includes("sports")) genres.push("sports");

    return genres;
  }

  private detectPlatforms(job: Job): string[] {
    const searchText = `${job.title} ${job.description || ""}`.toLowerCase();
    const platforms = [];

    if (searchText.includes("pc") || searchText.includes("steam"))
      platforms.push("pc");
    if (
      searchText.includes("console") ||
      searchText.includes("xbox") ||
      searchText.includes("playstation")
    )
      platforms.push("console");
    if (
      searchText.includes("mobile") ||
      searchText.includes("ios") ||
      searchText.includes("android")
    )
      platforms.push("mobile");
    if (searchText.includes("vr") || searchText.includes("virtual reality"))
      platforms.push("vr");
    if (searchText.includes("web") || searchText.includes("browser"))
      platforms.push("web");

    return platforms;
  }

  private isFeaturedJob(job: Job): boolean {
    // Mark jobs as featured based on company reputation or urgency
      job.company.toLowerCase().includes(company.toLowerCase()),
    );

    const isRecentlyPosted =

    return isTopCompany || isRecentlyPosted;
  }

  private generateAnalytics(jobs: Job[]): GamingJobAnalytics {
    const salaries = jobs
      .map((job) =>
      )

    const averageSalary = salaries.length
      ? salaries.reduce((a, b) => a + b) / salaries.length

    // Count skills
    const skillCounts = new Map<string, number>();
    jobs.forEach((job) => {
      job.technologies?.forEach((skill) => {
      });
    });

    const topSkills = Array.from(skillCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([skill, count]) => {
        // Calculate growth based on skill popularity and market trends
        const popularSkills = [
          "Unity",
          "Unreal",
          "C++",
          "JavaScript",
          "Python",
          "Blender",
          "Maya",
        ];
        const emergingSkills = [
          "Rust",
          "WebAssembly",
          "AR",
          "VR",
          "Machine Learning",
          "AI",
          "Blockchain",
        ];


        if (
          popularSkills.some((s) =>
            skill.toLowerCase().includes(s.toLowerCase()),
          )
        ) {
        }

        if (
          emergingSkills.some((s) =>
            skill.toLowerCase().includes(s.toLowerCase()),
          )
        ) {
        }

        if (
          decliningSkills.some((s) =>
            skill.toLowerCase().includes(s.toLowerCase()),
          )
        ) {
        }


        return {
          skill,
          demand: count,
          growth: growthStr,
        };
      });

    // Count companies
    const companyCounts = new Map<string, number>();
    jobs.forEach((job) => {
    });

    const topCompanies = Array.from(companyCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([company, count]) => {
        // Calculate trend based on company size and market position
        const majorCompanies = [
          "Epic Games",
          "Riot Games",
          "Blizzard",
          "Electronic Arts",
          "Ubisoft",
          "Valve",
        ];
        const growingCompanies = [
          "Discord",
          "Roblox",
          "Unity Technologies",
          "Supercell",
          "King",
        ];
        const consolidatingCompanies = ["Activision", "Bethesda"]; // Companies in transition

        let trend = "stable";

        if (
          majorCompanies.some((c) =>
            company.toLowerCase().includes(c.toLowerCase()),
          )
        ) {
        } else if (
          growingCompanies.some((c) =>
            company.toLowerCase().includes(c.toLowerCase()),
          )
        ) {
        } else if (
          consolidatingCompanies.some((c) =>
            company.toLowerCase().includes(c.toLowerCase()),
          )
        ) {
          trend = "growing"; // High job count suggests growth
        } else {
        }

        return {
          company,
          openings: count,
          trend,
        };
      });

    // Location analysis
    const locationCounts = new Map<
      string,
      { count: number; salaries: number[] }
    >();
    jobs.forEach((job) => {
      const location = job.location || "Remote";
      const existing = locationCounts.get(location) || {
        salaries: [],
      };
      existing.count++;
      if (typeof job.salary === "object" && (job.salary as any).min) {
        existing.salaries.push((job.salary as any).min);
      }
      locationCounts.set(location, existing);
    });

    const locationHotspots = Array.from(locationCounts.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([location, data]) => ({
        location,
        count: data.count,
        avgSalary: data.salaries.length
          ? data.salaries.reduce((a, b) => a + b) / data.salaries.length
      }));

    // Experience distribution
    const expCounts = new Map<string, number>();
    jobs.forEach((job) => {
      const level = job.experienceLevel || "not-specified";
    });

    const experienceDistribution = Array.from(expCounts.entries()).map(
      ([level, count]) => ({
        level,
      }),
    );

    // Work style distribution
    const remoteCount = jobs.filter((j) => j.remote).length;
    const hybridCount = jobs.filter((j) => j.hybrid).length;
    const onsiteCount = jobs.length - remoteCount - hybridCount;

    return {
      averageSalary,
      salaryTrends: [
        { period: "Current", value: Math.round(averageSalary) },
        {
          period: "Last Month",
        {
        {
        {
      ],
      topSkills,
      topCompanies,
      locationHotspots,
      experienceDistribution,
      remoteVsOnsite: {
      },
    };
  }

  private async generateRecommendations(
    jobs: Job[],
    filters: GamingJobFilters,
  ): Promise<JobRecommendation[]> {
    return jobs
      .map((job) => ({
        job,
        reasons: this.getMatchReasons(job, filters),
        skillGaps: this.getSkillGaps(job, filters),
        careerImpact: this.assessCareerImpact(job),
      }));
  }

  private getMatchReasons(job: Job, filters: GamingJobFilters): string[] {
    const reasons = [];

    if (filters.workStyle === "remote" && job.remote) {
      reasons.push("Matches your remote work preference");
    }

    if (filters.experienceLevel === job.experienceLevel) {
      reasons.push(`Perfect match for ${job.experienceLevel} level`);
    }

    if (job.featured) {
      reasons.push("Featured opportunity from top gaming company");
    }

    if (typeof job.salary === "object" && filters.salaryRange) {
      const salary = job.salary as any;
        reasons.push("Salary meets your expectations");
      }
    }

    return reasons;
  }

  private getSkillGaps(job: Job, filters: GamingJobFilters): string[] {
    const gaps: string[] = [];
    const userSkills = new Set([
      ...(filters.technologies || []),
      ...(filters.gameEngines || []),
      ...(filters.platforms || []),
      ...(filters.gameGenres || []),
    ]);

    // Check required technologies
    if (job.technologies) {
      for (const tech of job.technologies) {
        const normalizedTech = tech.toLowerCase();
        const hasSkill = [...userSkills].some(
          (skill) =>
            skill.toLowerCase().includes(normalizedTech) ||
            normalizedTech.includes(skill.toLowerCase()),
        );

        if (!hasSkill) {
          gaps.push(tech);
        }
      }
    }

    // Check game engine requirements from job description
    const gameEngines = [
      "Unity",
      "Unreal Engine",
      "Unreal",
      "Godot",
      "CryEngine",
      "Frostbite",
    ];
    const jobDescription = (job.description || "").toLowerCase();

    for (const engine of gameEngines) {
      const engineLower = engine.toLowerCase();
      if (
        jobDescription.includes(engineLower) &&
        !userSkills.has(engineLower) &&
        !userSkills.has(engine)
      ) {
        gaps.push(`${engine} experience`);
      }
    }

    // Check programming language requirements
    const programmingLanguages = [
      "C++",
      "Python",
      "JavaScript",
      "Java",
      "Rust",
      "Go",
    ];
    for (const lang of programmingLanguages) {
      const langLower = lang.toLowerCase();
      if (
        jobDescription.includes(langLower) &&
        !userSkills.has(langLower) &&
        !userSkills.has(lang)
      ) {
        gaps.push(`${lang} programming`);
      }
    }

    // Check platform-specific skills
    if (job.platforms) {
      for (const platform of job.platforms) {
        const platformLower = platform.toLowerCase();
        const hasPlatformSkill = [...userSkills].some((skill) =>
          skill.toLowerCase().includes(platformLower),
        );

        if (!hasPlatformSkill) {
          gaps.push(`${platform} development`);
        }
      }
    }

    // Check experience level gaps
    if (job.experienceLevel && filters.experienceLevel) {
      const jobLevel = this.getExperienceLevelNumber(job.experienceLevel);
      const userLevel = this.getExperienceLevelNumber(filters.experienceLevel);

      if (jobLevel > userLevel) {
        gaps.push(`${yearsDiff}+ years additional experience`);
      }
    }

    // Check domain-specific knowledge
    const specializations = [
      "AI/ML",
      "Graphics",
      "Networking",
      "Backend",
      "Frontend",
      "DevOps",
      "QA",
      "UI/UX",
    ];
    for (const spec of specializations) {
      if (
        jobDescription.includes(spec.toLowerCase()) &&
        !userSkills.has(spec.toLowerCase())
      ) {
        gaps.push(`${spec} specialization`);
      }
    }

  }

  private getExperienceLevelNumber(level: string): number {
    const normalizedLevel = level.toLowerCase();
    if (normalizedLevel.includes("entry") || normalizedLevel.includes("junior"))
    if (
      normalizedLevel.includes("mid") ||
      normalizedLevel.includes("intermediate")
    )
    if (
      normalizedLevel.includes("lead") ||
      normalizedLevel.includes("principal")
    )
    if (
      normalizedLevel.includes("staff") ||
      normalizedLevel.includes("architect")
    )
  }

  private assessCareerImpact(job: Job): "high" | "medium" | "low" {
    // Assess career impact based on company, role, and growth potential
      job.company.toLowerCase().includes(company.toLowerCase()),
    );

    const isLeadRole =
      job.title.toLowerCase().includes("lead") ||
      job.title.toLowerCase().includes("senior") ||
      job.title.toLowerCase().includes("principal");

    if (isTopCompany && isLeadRole) return "high";
    if (isTopCompany || isLeadRole) return "medium";
    return "low";
  }

  private generateMarketTrends(
    jobs: Job[],
    analytics: GamingJobAnalytics,
  ): MarketTrend[] {
    const trends: MarketTrend[] = [];

    // Remote work trend
    const remotePercentage = analytics.remoteVsOnsite.remote;
    trends.push({
      category: "Remote Work",
      trend:
          ? "rising"
            ? "stable"
            : "declining",
      change: remotePercentage,
      insight: `${remotePercentage}% of gaming jobs now offer remote work options`,
    });

    // AI/ML integration trend
    const aiJobs = jobs.filter(
      (job) =>
        (job.title + job.description).toLowerCase().includes("ai") ||
        (job.title + job.description)
          .toLowerCase()
          .includes("machine learning") ||
        (job.title + job.description)
          .toLowerCase()
          .includes("artificial intelligence"),
    ).length;

      trends.push({
        category: "AI Integration",
        trend: "rising",
        change: aiPercentage,
        insight: `${aiPercentage}% of gaming jobs now require AI/ML knowledge`,
      });
    }

    // Game engine trends
    const unityJobs = jobs.filter((job) =>
      (job.title + job.description).toLowerCase().includes("unity"),
    ).length;
    const unrealJobs = jobs.filter((job) =>
      (job.title + job.description).toLowerCase().includes("unreal"),
    ).length;

    if (unityJobs > unrealJobs) {
      trends.push({
        category: "Unity Development",
        trend: "stable",
        insight: "Unity remains the dominant game engine in job postings",
      });
      trends.push({
        category: "Unreal Engine",
        trend: "rising",
        insight: "Unreal Engine demand is increasing in the gaming industry",
      });
    }

    // Mobile gaming trend
    const mobileJobs = jobs.filter(
      (job) =>
        (job.title + job.description).toLowerCase().includes("mobile") ||
        (job.title + job.description).toLowerCase().includes("ios") ||
        (job.title + job.description).toLowerCase().includes("android"),
    ).length;

      trends.push({
        category: "Mobile Gaming",
        change: mobilePercentage,
        insight: `Mobile gaming represents ${mobilePercentage}% of current job openings`,
      });
    }

    // VR/AR trend
    const vrJobs = jobs.filter(
      (job) =>
        (job.title + job.description).toLowerCase().includes("vr") ||
        (job.title + job.description).toLowerCase().includes("ar") ||
        (job.title + job.description)
          .toLowerCase()
          .includes("virtual reality") ||
        (job.title + job.description)
          .toLowerCase()
          .includes("augmented reality"),
    ).length;

      trends.push({
        category: "VR/AR Gaming",
        trend: "rising",
        change: vrPercentage,
        insight: `VR/AR opportunities are growing, representing ${vrPercentage}% of listings`,
      });
    }

    // Salary trend
    const highSalaryJobs = jobs.filter((job) => {
      if (typeof job.salary === "object" && job.salary) {
        const salary = job.salary as any;
      }
      return false;
    }).length;
    const highSalaryPercentage = Math.round(
    );

      trends.push({
        category: "High-Paying Roles",
        change: highSalaryPercentage,
      });
    }

  }

  private getEmptyAnalytics(): GamingJobAnalytics {
    return {
      salaryTrends: [],
      topSkills: [],
      topCompanies: [],
      locationHotspots: [],
      experienceDistribution: [],
    };
  }

  async createJobAlert(
    name: string,
    filters: GamingJobFilters,
  ): Promise<GamingJobAlert> {
    const alert: GamingJobAlert = {
      id: Date.now().toString(),
      name,
      filters,
      frequency: "daily",
      enabled: true,
      createdAt: new Date(),
    };

    // Save to localStorage for now (in production, save to backend)
    const existingAlerts = this.getJobAlerts();
    existingAlerts.push(alert);
    localStorage.setItem("gaming_job_alerts", JSON.stringify(existingAlerts));

    return alert;
  }

  getJobAlerts(): GamingJobAlert[] {
    try {
      const alerts = localStorage.getItem("gaming_job_alerts");
      return alerts ? JSON.parse(alerts) : [];
    } catch {
      return [];
    }
  }

  async deleteJobAlert(alertId: string): Promise<void> {
    const alerts = this.getJobAlerts().filter((alert) => alert.id !== alertId);
    localStorage.setItem("gaming_job_alerts", JSON.stringify(alerts));
  }

  getSavedJobs(): Job[] {
    try {
      const saved = localStorage.getItem("saved_gaming_jobs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveJob(job: Job): void {
    const savedJobs = this.getSavedJobs();
    if (!savedJobs.find((saved) => saved.id === job.id)) {
      savedJobs.push(job);
      localStorage.setItem("saved_gaming_jobs", JSON.stringify(savedJobs));
    }
  }

  unsaveJob(jobId: string): void {
    const savedJobs = this.getSavedJobs().filter((job) => job.id !== jobId);
    localStorage.setItem("saved_gaming_jobs", JSON.stringify(savedJobs));
  }

  isJobSaved(jobId: string): boolean {
    return this.getSavedJobs().some((job) => job.id === jobId);
  }
}

// Singleton instance
export const gamingJobsService = new GamingJobsService();
export default gamingJobsService;
