
import { ref, computed, type ComputedRef } from "vue";
import {
  jobPostingAnalysisService,
  type JobPostingAnalysis,
  type JobPostingExtractionResult,
} from "@/services/JobPostingAnalysisService";
import {
  aiResumeTargetingService,
  type ResumeTailoringResult,
  type ResumeOptimizationOptions,
} from "@/services/AIResumeTargetingService";
import { useAICoverLetter } from "./useAICoverLetter";
import { useToast } from "./useToast";
import { logger } from "@/shared/utils/logger";

export interface JobTailoringState {
  jobAnalysis: JobPostingAnalysis | null;
  resumeTailoring: ResumeTailoringResult | null;
  recommendations: any;
  isAnalyzingJob: boolean;
  isTailoringResume: boolean;
  error: string | null;
}

export interface UseJobTailoredResumeReturn {
  // State
  state: ComputedRef<JobTailoringState>;

  // Job Analysis
  jobAnalysis: ComputedRef<JobPostingAnalysis | null>;
  hasJobAnalysis: ComputedRef<boolean>;

  // Resume Tailoring
  tailoredResume: ComputedRef<ResumeTailoringResult | null>;
  hasTailoredResume: ComputedRef<boolean>;

  // Loading States
  isAnalyzingJob: ComputedRef<boolean>;
  isTailoringResume: ComputedRef<boolean>;
  isProcessing: ComputedRef<boolean>;

  // Error State
  error: ComputedRef<string | null>;

  // Computed Insights
  matchScore: ComputedRef<number>;
  keywordCoverage: ComputedRef<number>;
  atsScore: ComputedRef<number>;
  improvementAreas: ComputedRef<string[]>;

  // Methods
  analyzeJobFromText: (
    jobText: string,
  ) => Promise<{
    success: boolean;
    analysis?: JobPostingAnalysis;
    error?: string;
  }>;
  analyzeJobFromUrl: (
    url: string,
  ) => Promise<{
    success: boolean;
    analysis?: JobPostingAnalysis;
    error?: string;
  }>;
  tailorResumeToJob: (
    resume: any,
    options?: Partial<ResumeOptimizationOptions>,
  ) => Promise<{
    success: boolean;
    tailoring?: ResumeTailoringResult;
    error?: string;
  }>;
  generateTailoredCoverLetter: (
    userProfile?: any,
    options?: any,
  ) => Promise<{ success: boolean; coverLetter?: string; error?: string }>;
  getJobRequirements: () => {
    required: string[];
    preferred: string[];
    skills: string[];
  };
  getMissingKeywords: (currentResume: any) => string[];
  exportTailoredDocuments: () => Promise<{
    resume: any;
    coverLetter: string;
    analysis: any;
  }>;

  // Actions
  clearAnalysis: () => void;
  clearTailoring: () => void;
  clearAll: () => void;
}

  // State
  const jobAnalysis = ref<JobPostingAnalysis | null>(null);
  const resumeTailoring = ref<ResumeTailoringResult | null>(null);
  const recommendations = ref<any>(null);
  const isAnalyzingJob = ref(false);
  const isTailoringResume = ref(false);
  const error = ref<string | null>(null);

  const coverLetterComposable = useAICoverLetter();
  const { toast } = useToast();

  // Computed state
  const state = computed(() => ({
    jobAnalysis: jobAnalysis.value,
    resumeTailoring: resumeTailoring.value,
    recommendations: recommendations.value,
    isAnalyzingJob: isAnalyzingJob.value,
    isTailoringResume: isTailoringResume.value,
    error: error.value,
  }));

  const hasJobAnalysis = computed(() => !!jobAnalysis.value);
  const hasTailoredResume = computed(
    () =>
      !!resumeTailoring.value?.success &&
      !!resumeTailoring.value.tailoredResume,
  );
  const isProcessing = computed(
    () => isAnalyzingJob.value || isTailoringResume.value,
  );

  // Computed insights
  const matchScore = computed(() => {
  });

  const keywordCoverage = computed(() => {
  });

  const atsScore = computed(() => {
  });

  const improvementAreas = computed(() => {
    if (!resumeTailoring.value?.matchAnalysis?.gapAnalysis) return [];
    return resumeTailoring.value.matchAnalysis.gapAnalysis;
  });

  // Methods
    if (!jobText?.trim()) {
      return { success: false, error: "Job posting text is required" };
    }

    try {
      isAnalyzingJob.value = true;
      error.value = null;

      logger.info("Starting job posting analysis from text");

      const result =
        await jobPostingAnalysisService.analyzeJobPostingText(jobText);

      if (result.success && result.analysis) {
        jobAnalysis.value = result.analysis;

        toast.success(
          `Job analysis completed for ${result.analysis.jobTitle} at ${result.analysis.company}`,
        );
        logger.info("Job posting analysis completed successfully");

        return {
          success: true,
          analysis: result.analysis,
        };
      } else {
        error.value = result.error || "Failed to analyze job posting";
        toast.error(`Job analysis failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Job posting analysis failed:", err);
      toast.error("Failed to analyze job posting");
      return { success: false, error: err.message };
    } finally {
      isAnalyzingJob.value = false;
    }
  }

    if (!url?.trim()) {
      return { success: false, error: "Job posting URL is required" };
    }

    try {
      isAnalyzingJob.value = true;
      error.value = null;

      logger.info(`Starting job posting analysis from URL: ${url}`);

      const result = await jobPostingAnalysisService.analyzeFromUrl(url);

      if (result.success && result.analysis) {
        jobAnalysis.value = result.analysis;

        toast.success(`Job analysis completed for ${result.analysis.jobTitle}`);
        logger.info("Job posting URL analysis completed successfully");

        return {
          success: true,
          analysis: result.analysis,
        };
      } else {
        error.value =
          result.error || "Failed to extract and analyze job posting from URL";
        toast.error(`URL analysis failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Job posting URL analysis failed:", err);
      toast.error("Failed to analyze job posting from URL");
      return { success: false, error: err.message };
    } finally {
      isAnalyzingJob.value = false;
    }
  }

    resume: any,
    options: Partial<ResumeOptimizationOptions> = {},
  ) {
    if (!jobAnalysis.value) {
      return {
        success: false,
        error: "Job analysis is required before tailoring resume",
      };
    }

    if (!resume) {
      return { success: false, error: "Resume data is required" };
    }

    try {
      isTailoringResume.value = true;
      error.value = null;

      logger.info(
        `Starting resume tailoring for ${jobAnalysis.value.jobTitle}`,
      );

      const result = await aiResumeTargetingService.tailorResumeToJob(
        resume,
        jobAnalysis.value,
        options,
      );

      if (result.success) {
        resumeTailoring.value = result;


        toast.success(
          `Resume tailored successfully! Score: ${score}%, Keyword Coverage: ${coverage}%`,
        );
        logger.info("Resume tailoring completed successfully");

        // Generate additional recommendations if needed
        if (jobAnalysis.value && resume) {
          recommendations.value =
            await jobPostingAnalysisService.generateTailoringRecommendations(
              jobAnalysis.value,
              { resume },
              resume,
            );
        }

        return {
          success: true,
          tailoring: result,
        };
      } else {
        error.value = result.error || "Failed to tailor resume";
        toast.error(`Resume tailoring failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Resume tailoring failed:", err);
      toast.error("Failed to tailor resume");
      return { success: false, error: err.message };
    } finally {
      isTailoringResume.value = false;
    }
  }

    userProfile: any = {},
    options: any = {},
  ) {
    if (!jobAnalysis.value) {
      return {
        success: false,
        error: "Job analysis is required before generating cover letter",
      };
    }

    try {
      logger.info("Generating tailored cover letter");

      // Create job description text for cover letter service
      const jobDescription = `
Company: ${jobAnalysis.value.company}
Position: ${jobAnalysis.value.jobTitle}
Location: ${jobAnalysis.value.location || "Not specified"}

Key Skills Required: ${jobAnalysis.value.keySkills.join(", ")}
Experience Level: ${jobAnalysis.value.experienceLevel}

Requirements:
${jobAnalysis.value.requirements.map((req) => `- ${req.requirement}`).join("\n")}

Company Values: ${jobAnalysis.value.companyValues.join(", ")}
Growth Opportunities: ${jobAnalysis.value.growthOpportunities.join(", ")}
`;

      const result = await coverLetterComposable.generateFromJobDescription(
        jobDescription,
        userProfile,
        {
          tone: options.tone || "professional",
          length: options.length || "medium",
          focusAreas: options.focusAreas || [
            "skills_match",
            "experience_relevance",
            "company_culture",
          ],
          companyInfo: `${jobAnalysis.value.company} - ${jobAnalysis.value.companyValues.join(", ")}`,
          ...options,
        },
      );

      return {
        success: result.success,
        coverLetter: result.content,
        error: result.error,
      };
    } catch (err: any) {
      logger.error("Tailored cover letter generation failed:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  }

    if (!jobAnalysis.value) {
      return { required: [], preferred: [], skills: [] };
    }

    const requirements = jobAnalysis.value.requirements;
    return {
      required: requirements
        .filter((req) => req.priority === "required")
        .map((req) => req.requirement),
      preferred: requirements
        .filter((req) => req.priority === "preferred")
        .map((req) => req.requirement),
      skills: jobAnalysis.value.keySkills,
    };
  }

    if (!jobAnalysis.value || !currentResume) return [];

    const resumeText = JSON.stringify(currentResume).toLowerCase();
    return jobAnalysis.value.atsKeywords.filter(
      (keyword) => !resumeText.includes(keyword.toLowerCase()),
    );
  }

    if (!jobAnalysis.value || !resumeTailoring.value) {
      throw new Error("Job analysis and resume tailoring are required");
    }

    const exportData = {
      resume: resumeTailoring.value.tailoredResume,
      coverLetter: coverLetterComposable.generatedContent.value,
      analysis: {
        jobAnalysis: jobAnalysis.value,
        matchAnalysis: resumeTailoring.value.matchAnalysis,
        recommendations: recommendations.value,
        scores: {
          overallMatch: matchScore.value,
          keywordCoverage: keywordCoverage.value,
          atsCompliance: atsScore.value,
        },
      },
    };

    return exportData;
  }

    jobAnalysis.value = null;
    error.value = null;
  }

    resumeTailoring.value = null;
    recommendations.value = null;
  }

    clearAnalysis();
    clearTailoring();
    coverLetterComposable.clearAll();
  }

  return {
    // State
    state,
    jobAnalysis: computed(() => jobAnalysis.value),
    hasJobAnalysis,
    tailoredResume: computed(() => resumeTailoring.value),
    hasTailoredResume,

    // Loading
    isAnalyzingJob: computed(() => isAnalyzingJob.value),
    isTailoringResume: computed(() => isTailoringResume.value),
    isProcessing,

    // Error
    error: computed(() => error.value),

    // Insights
    matchScore,
    keywordCoverage,
    atsScore,
    improvementAreas,

    // Methods
    analyzeJobFromText,
    analyzeJobFromUrl,
    tailorResumeToJob,
    generateTailoredCoverLetter,
    getJobRequirements,
    getMissingKeywords,
    exportTailoredDocuments,

    // Actions
    clearAnalysis,
    clearTailoring,
    clearAll,
  };
}
