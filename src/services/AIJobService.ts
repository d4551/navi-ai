
import {computed } from "vue";
import type { Job, JobFilters } from "@/shared/types/jobs";
import { useAppStore } from "@/stores/app";
import { getActivePinia } from "pinia";
import { logger } from "@/shared/utils/logger";

export interface AIJobMatch {
  job: Job;
  matchScore: number;
  matchReasons: string[];
  salaryFit: "below" | "match" | "above";
  skillAlignment: number;
  experienceAlignment: number;
  locationPreference: number;
  cultureScore?: number;
}

export interface JobMarketInsight {
  skill: string;
  demand: "high" | "medium" | "low";
  trend: "rising" | "stable" | "declining";
  averageSalary: number;
  projectedGrowth: number;
  relatedSkills: string[];
}

export interface SalaryPrediction {
  estimatedSalary: { min: number; max: number; currency: string };
  confidence: number;
  factors: string[];
  marketData: {
  };
}

export interface AIJobInsights {
  jobComplexity: "entry" | "intermediate" | "advanced" | "expert";
  requiredSkills: string[];
  nicetohaveSkills: string[];
  careerProgression: string[];
  industryGrowth: "declining" | "stable" | "growing" | "booming";
  burnoutRisk: "low" | "medium" | "high";
  learningCurve: "gentle" | "moderate" | "steep";
}

export class AIJobService {
  private userProfile = ref<any>({});
  private modelCache = new Map<string, any>();

  constructor() {
    // Do not access Pinia or stores at module init time.
    // Profile will be hydrated lazily on first use once Pinia is active.
  }

  private tryHydrateProfile() {
    try {
      // Ensure there is an active Pinia (set via app.use(pinia) and setActivePinia)
      if (!getActivePinia()) return;
      const store = useAppStore();
      this.userProfile.value = {
        skills: store.user?.skills || [],
        preferences: (store.user as any)?.preferences || {},
        salaryRange: (store.user as any)?.salaryExpectation || {},
        location: (store.user as any)?.location || "",
        workStyle: (store.user as any)?.workStyle || "hybrid",
        careerGoals: (store.user as any)?.careerGoals || [],
      };
    } catch (_e) {
    }
  }

  async analyzeJobMatches(jobs: Job[]): Promise<AIJobMatch[]> {
    try {
      // Lazy hydration in case this service was imported before Pinia initialization
      this.tryHydrateProfile();
      const matches: AIJobMatch[] = [];

      for (const job of jobs) {
        const match = await this.calculateJobMatch(job);
        matches.push(match);
      }

      // Sort by match score and return
      return matches.sort((a, b) => b.matchScore - a.matchScore);
    } catch (_error) {
      logger.error("AI job matching failed:", error);
      return jobs.map((job) => ({
        job,
        matchReasons: ["Basic compatibility check"],
        salaryFit: "match" as const,
      }));
    }
  }

  async generateRecommendations(
    jobs: Job[],
  ): Promise<AIJobMatch[]> {
    this.tryHydrateProfile();
    const matches = await this.analyzeJobMatches(jobs);
    const recommendations = matches
      .filter((match) => this.passesRecommendationFilters(match))
    return recommendations;
  }

  private async calculateJobMatch(job: Job): Promise<AIJobMatch> {
    const profile = this.userProfile.value;
    const matchReasons: string[] = [];
    let weights = {
    };

    // Skill alignment analysis
    const skillScore = this.calculateSkillAlignment(job, profile.skills);
      matchReasons.push(
        `Strong skill match (${Math.round(skillScore)}% alignment)`,
      );
    }

    // Experience alignment
    const experienceScore = this.calculateExperienceAlignment(
      job,
      profile.experience,
    );
      matchReasons.push("Experience level perfectly matches");
      matchReasons.push("Experience level may be challenging");
    }

    // Salary analysis
    const salaryFit = this.analyzeSalaryFit(job, profile.salaryRange);
    const salaryScore = this.calculateSalaryScore(salaryFit);
    matchReasons.push(`Salary ${salaryFit} expectations`);

    // Location preference
    const locationScore = this.calculateLocationAlignment(job, profile);
      matchReasons.push("Perfect location match");
    }

    // Culture and company fit (AI-powered analysis)
    const cultureScore = await this.analyzeCultureFit(job, profile);

    return {
      job,
      matchReasons,
      salaryFit,
      skillAlignment: skillScore,
      experienceAlignment: experienceScore,
      locationPreference: locationScore,
      cultureScore,
    };
  }

  private calculateSkillAlignment(job: Job, userSkills: string[]): number {

    const jobSkills = [
      ...(job.requirements || []),
      ...(job.technologies || []),
      ...this.extractSkillsFromDescription(job.description || ""),
    ].map((skill) => skill.toLowerCase());

    const userSkillsLower = userSkills.map((skill) => skill.toLowerCase());


    jobSkills.forEach((jobSkill) => {
      const weight = this.getSkillImportance(jobSkill);
      totalWeight += weight;

      if (
        userSkillsLower.some(
          (userSkill) =>
            userSkill.includes(jobSkill) ||
            jobSkill.includes(userSkill) ||
            this.areRelatedSkills(userSkill, jobSkill),
        )
      ) {
        matchCount += weight;
      }
    });

  }

  private calculateExperienceAlignment(
    job: Job,
    userExperience: number,
  ): number {
    const jobLevel = job.experienceLevel || "mid";
    const requiredYears = this.getExperienceYears(jobLevel);

    if (
    ) {
    } else if (
    ) {
    } else if (userExperience < requiredYears) {
    } else {
    }
  }

  private analyzeSalaryFit(
    job: Job,
    userSalaryRange: any,
  ): "below" | "match" | "above" {
    if (!job.salary || !userSalaryRange?.min) return "match";

    const jobSalary =
      typeof job.salary === "object"
        : parseInt(String(job.salary).replace(/\D/g, ""));

    const userExpected =

    return "match";
  }

  private calculateSalaryScore(salaryFit: "below" | "match" | "above"): number {
    switch (salaryFit) {
      case "match":
      case "above":
      case "below":
    }
  }

  private calculateLocationAlignment(job: Job, profile: any): number {

    // Geographic matching
    if (profile.location && job.location) {
      const userLocation = profile.location.toLowerCase();
      const jobLocation = job.location.toLowerCase();

      if (
        jobLocation.includes(userLocation) ||
        userLocation.includes(jobLocation)
      ) {
      }
    }

  }

  private async analyzeCultureFit(job: Job, profile: any): Promise<number> {
    try {
      // AI-powered culture analysis based on job description and company
      const cultureKeywords = {
        collaborative: ["team", "collaboration", "agile", "scrum"],
        innovative: [
          "innovation",
          "cutting-edge",
          "research",
          "new technology",
        ],
        fastPaced: ["fast-paced", "startup", "dynamic", "rapid growth"],
        stable: ["established", "mature", "stable", "enterprise"],
        creative: ["creative", "design", "artistic", "visual"],
      };

      const description = (job.description || "").toLowerCase();
      const cultureScores: Record<string, number> = {};

      Object.entries(cultureKeywords).forEach(([culture, keywords]) => {
        const score =
          (keywords.reduce((acc, keyword) => {

        cultureScores[culture] = score;
      });

      // Match against user preferences (mock implementation)
      const userPreferences = profile.preferences?.culture || [
        "collaborative",
        "innovative",
      ];
      const alignmentScore =
        userPreferences.reduce((acc: number, pref: string) => {

    } catch (_error) {
    }
  }

  async predictSalary(job: Job): Promise<SalaryPrediction> {
    try {
      const cacheKey = `salary_${job.title}_${job.location}_${job.experienceLevel}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;

      // AI-powered salary prediction
      const baseSalary = this.calculateBaseSalary(job);
      const adjustments = this.calculateSalaryAdjustments(job);

      const prediction: SalaryPrediction = {
        estimatedSalary: {
          currency: "USD",
        },
        confidence: this.calculatePredictionConfidence(job),
        factors: this.getSalaryFactors(job, adjustments),
        marketData: {
        },
      };

      this.setCachedResult(cacheKey, prediction);
      return prediction;
    } catch (_error) {
      logger.error("Salary prediction failed:", error);
      return {
        factors: ["Limited data available"],
        marketData: {
        },
      };
    }
  }

  async analyzeJobInsights(job: Job): Promise<AIJobInsights> {
    try {
      const description = job.description || "";
      const requirements = job.requirements || [];
      const technologies = job.technologies || [];

      return {
        jobComplexity: this.analyzeJobComplexity(job),
        requiredSkills: this.extractRequiredSkills(requirements, description),
        nicetohaveSkills: this.extractNiceToHaveSkills(description),
        careerProgression: this.analyzeCareerProgression(job.title),
        industryGrowth: this.analyzeIndustryGrowth(job.company, technologies),
        remoteCompatibility: this.analyzeRemoteCompatibility(job, description),
        burnoutRisk: this.analyzeBurnoutRisk(description, job.type),
        learningCurve: this.analyzeLearningCurve(technologies, requirements),
      };
    } catch (_error) {
      logger.error("Job insights analysis failed:", error);
      return {
        jobComplexity: "intermediate",
        requiredSkills: job.requirements || [],
        nicetohaveSkills: [],
        careerProgression: [
          "Senior Developer",
          "Lead Developer",
          "Engineering Manager",
        ],
        industryGrowth: "stable",
        burnoutRisk: "medium",
        learningCurve: "moderate",
      };
    }
  }

  async getMarketInsights(skills: string[]): Promise<JobMarketInsight[]> {
    try {
      const insights: JobMarketInsight[] = [];

      for (const skill of skills) {
        const insight = await this.analyzeSkillMarket(skill);
        insights.push(insight);
      }

      return insights.sort((a, b) => b.averageSalary - a.averageSalary);
    } catch (_error) {
      logger.error("Market insights failed:", error);
      return [];
    }
  }

  // Helper methods
  private extractSkillsFromDescription(description: string): string[] {
    const skillPatterns = [
      /\b(Unity|Unreal Engine|Blender|Maya|Photoshop|Figma|Git|Docker|Kubernetes)\b/gi,
      /\b(AWS|Azure|GCP|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b/gi,
    ];

    const skills = new Set<string>();
    skillPatterns.forEach((pattern) => {
      const matches = description.match(pattern);
      if (matches) {
        matches.forEach((match) => skills.add(match));
      }
    });

    return Array.from(skills);
  }

  private getSkillImportance(skill: string): number {
    const highImportance = [
      "react",
      "vue",
      "angular",
      "unity",
      "unreal",
      "python",
      "javascript",
    ];
    const mediumImportance = ["git", "sql", "mongodb", "docker", "aws"];

    const skillLower = skill.toLowerCase();
  }

    const relatedSkills = {
      react: ["jsx", "redux", "nextjs"],
      vue: ["vuex", "nuxt"],
      python: ["django", "flask", "fastapi"],
    };


    return Object.entries(relatedSkills).some(
      ([key, related]) =>
    );
  }

  private getExperienceYears(level: string): number {
    switch (level.toLowerCase()) {
      case "entry":
      case "junior":
      case "mid":
      case "intermediate":
      case "senior":
      case "lead":
      case "principal":
      default:
    }
  }

  private calculateBaseSalary(job: Job): number {
    const baseSalaries = {
    };

    const jobTitle = job.title.toLowerCase();
    const baseSalary =
      Object.entries(baseSalaries).find(([title]) =>
        jobTitle.includes(title),

    // Experience level multiplier
    const experienceMultiplier = {
    };

    const multiplier =
      experienceMultiplier[
        job.experienceLevel as keyof typeof experienceMultiplier
  }

  private calculateSalaryAdjustments(job: Job): { min: number; max: number } {

    // Location adjustments
    const highCostAreas = [
      "san francisco",
      "new york",
      "seattle",
      "los angeles",
    ];
    if (
      highCostAreas.some((area) => job.location?.toLowerCase().includes(area))
    ) {
    }

    // Company size adjustments (heuristic based on company name)
    const bigTech = [
      "google",
      "microsoft",
      "apple",
      "amazon",
      "meta",
      "netflix",
      "epic games",
    ];
    if (
      bigTech.some((company) => job.company?.toLowerCase().includes(company))
    ) {
    }

    // Remote work adjustment
    if (job.remote) {
    }

    return { min: minAdjust, max: maxAdjust };
  }

  private calculatePredictionConfidence(job: Job): number {


  }

  private getSalaryFactors(job: Job, adjustments: any): string[] {
    const factors = [];

      factors.push("High-cost location premium");
    }
    if (job.remote) {
      factors.push("Remote work flexibility");
    }
    if (job.experienceLevel === "senior" || job.experienceLevel === "lead") {
      factors.push("Senior-level position");
    }
    if (
      job.requirements?.some(
        (req) =>
          req.toLowerCase().includes("ai") ||
          req.toLowerCase().includes("machine learning"),
      )
    ) {
      factors.push("High-demand AI/ML skills");
    }

    return factors;
  }

  private analyzeJobComplexity(
    job: Job,
  ): "entry" | "intermediate" | "advanced" | "expert" {
    const requirements = job.requirements || [];
    const technologies = job.technologies || [];
    const description = job.description || "";


    // Count advanced technologies
    const advancedTech = [
      "ai",
      "machine learning",
      "blockchain",
      "kubernetes",
      "microservices",
    ];
    complexity +=
      advancedTech.filter(
        (tech) =>
          description.toLowerCase().includes(tech) ||
          technologies.some((t) => t.toLowerCase().includes(tech)),

    // Count requirements
    complexity += requirements.length;

    // Experience level factor

    return "entry";
  }

  private extractRequiredSkills(
    requirements: string[],
    description: string,
  ): string[] {
    const allText = (requirements.join(" ") + " " + description).toLowerCase();
    const requiredIndicators = [
      "required",
      "must have",
      "essential",
      "mandatory",
    ];

    const skills = this.extractSkillsFromDescription(allText);
    return skills.filter((skill) =>
      requiredIndicators.some(
        (indicator) =>
          allText.includes(`${indicator}${skill.toLowerCase()}`) ||
          allText.includes(`${skill.toLowerCase()}${indicator}`),
      ),
    );
  }

  private extractNiceToHaveSkills(description: string): string[] {
    const niceToHaveIndicators = [
      "nice to have",
      "preferred",
      "bonus",
      "plus",
      "advantage",
    ];
    const descLower = description.toLowerCase();

    return this.extractSkillsFromDescription(description).filter((skill) =>
      niceToHaveIndicators.some(
        (indicator) =>
          descLower.includes(`${indicator}${skill.toLowerCase()}`) ||
          descLower.includes(`${skill.toLowerCase()}${indicator}`),
      ),
    );
  }

  private analyzeCareerProgression(title: string): string[] {
    const progressionPaths = {
      developer: [
        "Senior Developer",
        "Lead Developer",
        "Engineering Manager",
        "CTO",
      ],
      designer: [
        "Senior Designer",
        "Design Lead",
        "Design Manager",
        "Head of Design",
      ],
      analyst: [
        "Senior Analyst",
        "Lead Analyst",
        "Analytics Manager",
        "Head of Analytics",
      ],
    };

    const titleLower = title.toLowerCase();
    const path = Object.entries(progressionPaths).find(([key]) =>
      titleLower.includes(key),

    return path;
  }

  private analyzeIndustryGrowth(
    company: string,
    technologies: string[],
  ): "declining" | "stable" | "growing" | "booming" {
    const boomingTech = [
      "ai",
      "machine learning",
      "vr",
      "ar",
      "blockchain",
      "quantum",
    ];
    const growingTech = ["react", "vue", "python", "kubernetes", "cloud"];

    const techText = technologies.join(" ").toLowerCase();

    if (boomingTech.some((tech) => techText.includes(tech))) return "booming";
    if (growingTech.some((tech) => techText.includes(tech))) return "growing";
    if (company?.toLowerCase().includes("startup")) return "growing";

    return "stable";
  }

  private analyzeRemoteCompatibility(job: Job, description: string): number {

    const remoteIndicators = [
      "remote",
      "distributed",
      "work from home",
      "wfh",
      "flexible",
    ];
    const localIndicators = [
      "onsite",
      "office",
      "in-person",
      "laboratory",
      "manufacturing",
    ];

    const descLower = description.toLowerCase();
    const remoteScore = remoteIndicators.reduce(
    );
    const localScore = localIndicators.reduce(
    );

  }

  private analyzeBurnoutRisk(
    description: string,
    jobType?: string,
  ): "low" | "medium" | "high" {
    const highRiskIndicators = [
      "fast-paced",
      "high-pressure",
      "tight deadlines",
      "overtime",
      "crunch",
    ];
    const lowRiskIndicators = [
      "work-life balance",
      "flexible hours",
      "wellness",
      "sustainable",
    ];

    const descLower = description.toLowerCase();
    const highRisk = highRiskIndicators.some((indicator) =>
      descLower.includes(indicator),
    );
    const lowRisk = lowRiskIndicators.some((indicator) =>
      descLower.includes(indicator),
    );

    if (highRisk && !lowRisk) return "high";
    if (lowRisk && !highRisk) return "low";
    return "medium";
  }

  private analyzeLearningCurve(
    technologies: string[],
    requirements: string[],
  ): "gentle" | "moderate" | "steep" {
    const advancedTech = [
      "machine learning",
      "ai",
      "blockchain",
      "quantum",
      "webgl",
      "webassembly",
    ];
    const moderateTech = [
      "react",
      "vue",
      "angular",
      "docker",
      "kubernetes",
      "aws",
    ];

    const allTech = [...technologies, ...requirements].map((t) =>
      t.toLowerCase(),
    );
    const hasAdvanced = advancedTech.some((tech) =>
      allTech.some((t) => t.includes(tech)),
    );
    const hasModerate = moderateTech.some((tech) =>
      allTech.some((t) => t.includes(tech)),
    );

    if (hasAdvanced) return "steep";
    if (hasModerate) return "moderate";
    return "gentle";
  }

  private async analyzeSkillMarket(skill: string): Promise<JobMarketInsight> {
    // Mock implementation - in production, this would use real market data APIs
    const marketData = {
    };

    const skillLower = skill.toLowerCase();
    const data = Object.entries(marketData).find(
      ([key]) => skillLower.includes(key) || key.includes(skillLower),

    return {
      skill,
      demand: data.demand as any,
      trend: data.trend as any,
      averageSalary: data.salary,
      projectedGrowth: data.growth,
      relatedSkills: this.getRelatedSkills(skill),
    };
  }

  private getRelatedSkills(skill: string): string[] {
    const relatedSkillsMap = {
      react: ["JavaScript", "TypeScript", "Redux", "Next.js"],
      python: ["Django", "FastAPI", "Data Science", "Machine Learning"],
      ai: ["Machine Learning", "TensorFlow", "PyTorch", "Python"],
      vue: ["JavaScript", "TypeScript", "Nuxt.js", "Vuex"],
    };

    const skillLower = skill.toLowerCase();
    return (
      Object.entries(relatedSkillsMap).find(
        ([key]) => skillLower.includes(key) || key.includes(skillLower),
    );
  }

  private passesRecommendationFilters(match: AIJobMatch): boolean {
    // Filter out jobs that might not be good recommendations
    return true;
  }

  private getCachedResult(key: string): any {
    const cached = this.modelCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.modelCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const aiJobService = new AIJobService();
