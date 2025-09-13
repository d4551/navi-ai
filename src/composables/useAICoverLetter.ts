
import { ref, type ComputedRef, computed, watch } from "vue";
import { aiCoverLetterService } from "@/services/AICoverLetterService";
import { useToast } from "@/composables/useToast";
import { logger } from "@/shared/utils/logger";

// Types
interface CompanyResearch {
  company: string;
  overview?: string;
  culture?: string[];
  projects?: string[];
  position?: string;
  talkingPoints?: string[];
  hooks?: string[];
  researched_at: string;
  isFallback?: boolean;
}

interface ReviewResults {
  score: number;
  categoryScores?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  atsCompliance?: boolean;
  revisionPriority?: string[];
  reviewed_at: string;
  isFallback?: boolean;
}

interface ImprovementResults {
  originalText: string;
  improvedText: string;
  changes?: string[];
  improvements?: string[];
  keywordBoosts?: string[];
  improved_at: string;
}

interface CoverLetterVariation {
  id: string;
  fullText: string;
  approach: string;
  generated_at: string;
}

interface GenerationHistoryEntry {
  content: string;
  approach: string;
  timestamp: string;
  score?: number | null;
  improvements?: string[];
  variationId?: string;
}

interface UseAICoverLetterOptions {
  tone?: string;
  length?: string;
  focusAreas?: string[];
  companyInfo?: string;
  approach?: string;
}

interface UseAICoverLetterReturn {
  // State
  isGenerating: ComputedRef<boolean>;
  isResearching: ComputedRef<boolean>;
  isReviewing: ComputedRef<boolean>;
  isImproving: ComputedRef<boolean>;
  isGeneratingVariations: ComputedRef<boolean>;
  isProcessing: ComputedRef<boolean>;

  // Content
  generatedContent: ComputedRef<string>;
  companyResearch: ComputedRef<CompanyResearch | null>;
  reviewResults: ComputedRef<ReviewResults | null>;
  improvementResults: ComputedRef<ImprovementResults | null>;
  variations: ComputedRef<CoverLetterVariation[]>;

  // Insights
  keyPoints: ComputedRef<string[]>;
  personalizations: ComputedRef<string[]>;
  suggestions: ComputedRef<Record<string, any>>;
  error: ComputedRef<string | null>;

  // History
  generationHistory: ComputedRef<GenerationHistoryEntry[]>;

  // Computed
  hasGeneratedContent: ComputedRef<boolean>;
  hasCompanyResearch: ComputedRef<boolean>;
  hasReview: ComputedRef<boolean>;
  reviewScore: ComputedRef<number>;
  reviewGrade: ComputedRef<{ grade: string; color: string; label: string }>;
  improvementSummary: ComputedRef<{
    changesCount: number;
    improvements: string[];
    keywordBoosts: string[];
  } | null>;

  // Methods
  generateFromJobDescription: (
    jobDescription: string,
    userProfile?: any,
    options?: UseAICoverLetterOptions,
  ) => Promise<{
    success: boolean;
    content?: string;
    keyPoints?: string[];
    personalizations?: string[];
    error?: string;
    isFallback?: boolean;
  }>;
  researchCompany: (
    companyName: string,
    jobTitle?: string,
    additionalContext?: string,
  ) => Promise<{
    success: boolean;
    research?: CompanyResearch;
    error?: string;
  }>;
  reviewCoverLetter: (
    coverLetterText: string,
    jobDescription?: string,
    userProfile?: any,
  ) => Promise<{
    success: boolean;
    score?: number;
    review?: ReviewResults;
    error?: string;
  }>;
  improveCoverLetter: (
    coverLetterText: string,
    improvementFocus?: string[],
    jobDescription?: string,
    userProfile?: any,
  ) => Promise<{
    success: boolean;
    improvedText?: string;
    changes?: string[];
    improvements?: string[];
    error?: string;
  }>;
  generateVariations: (
    baseContent: string,
    jobDescription?: string,
    userProfile?: any,
    count?: number,
  ) => Promise<{
    success: boolean;
    variations?: CoverLetterVariation[];
    error?: string;
  }>;
  selectVariation: (variationId: string) => {
    success: boolean;
    content?: string;
    error?: string;
  };
  clearAll: () => void;
  clearReview: () => void;
  clearVariations: () => void;
}

  // Reactive state
  const isGenerating = ref(false);
  const isResearching = ref(false);
  const isReviewing = ref(false);
  const isImproving = ref(false);
  const isGeneratingVariations = ref(false);

  const generatedContent = ref("");
  const companyResearch = ref<CompanyResearch | null>(null);
  const reviewResults = ref<ReviewResults | null>(null);
  const improvementResults = ref<ImprovementResults | null>(null);
  const variations = ref<CoverLetterVariation[]>([]);

  const keyPoints = ref<string[]>([]);
  const personalizations = ref<string[]>([]);
  const suggestions = ref<Record<string, any>>({});
  const error = ref<string | null>(null);

  // Generation history for comparison
  const generationHistory = ref<GenerationHistoryEntry[]>([]);

  const { toast } = useToast();

  // Computed properties
  const hasGeneratedContent = computed(() => !!generatedContent.value);

  const hasCompanyResearch = computed(() => !!companyResearch.value);

  const hasReview = computed(() => !!reviewResults.value);

  const isProcessing = computed(
    () =>
      isGenerating.value ||
      isResearching.value ||
      isReviewing.value ||
      isImproving.value ||
      isGeneratingVariations.value,
  );


  const reviewGrade = computed(() => {
    const score = reviewScore.value;
      return { grade: "A", color: "success", label: "Excellent" };
      return { grade: "C", color: "warning", label: "Needs Work" };
    return { grade: "D", color: "danger", label: "Poor" };
  });

  const improvementSummary = computed(() => {
    if (!improvementResults.value) return null;

    return {
      improvements: improvementResults.value.improvements || [],
      keywordBoosts: improvementResults.value.keywordBoosts || [],
    };
  });

  // Methods
    jobDescription: string,
    userProfile: any = {},
    options: UseAICoverLetterOptions = {},
  ) {
    if (isProcessing.value) {
      return { success: false, error: "Another operation is in progress" };
    }

    try {
      isGenerating.value = true;
      error.value = null;

      logger.info("Starting AI cover letter generation");

      const result = await aiCoverLetterService.generateFromJobDescription(
        jobDescription,
        userProfile,
        {
          tone: options.tone || "professional",
          length: options.length || "medium",
          focusAreas: options.focusAreas || [
            "skills_match",
            "gaming_passion",
            "company_culture",
          ],
          companyInfo: options.companyInfo || "",
          ...options,
        },
      );

      if (result.success) {
        generatedContent.value = result.coverLetter.fullText;
        keyPoints.value = result.keyPoints;
        personalizations.value = result.personalizations;
        suggestions.value = result.suggestions || {};

        // Add to history
        addToGenerationHistory({
          content: result.coverLetter.fullText,
          approach: options.approach || "standard",
          timestamp: new Date().toISOString(),
          score: null,
        });

        toast.success("Cover letter generated successfully!");
        logger.info("Cover letter generation completed");

        return {
          success: true,
          content: result.coverLetter.fullText,
          keyPoints: result.keyPoints,
          personalizations: result.personalizations,
        };
      } else {
        error.value = result.error ?? null;

        if (result.fallback) {
          generatedContent.value = result.fallback.coverLetter.fullText;
          keyPoints.value = result.fallback.keyPoints;
          toast.warning("Using fallback content due to AI service issue");

          return {
            success: true,
            content: result.fallback.coverLetter.fullText,
            keyPoints: result.fallback.keyPoints,
            isFallback: true,
          };
        }

        toast.error(`Generation failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Cover letter generation failed:", err);
      toast.error("Failed to generate cover letter");
      return { success: false, error: err.message };
    } finally {
      isGenerating.value = false;
    }
  }

    companyName: string,
    jobTitle = "",
    additionalContext = "",
  ) {
    if (isProcessing.value) {
      return { success: false, error: "Another operation is in progress" };
    }

    try {
      isResearching.value = true;
      error.value = null;

      logger.info(`Starting company research for: ${companyName}`);

      const result = await aiCoverLetterService.researchCompany(
        companyName,
        jobTitle,
        additionalContext,
      );

      if (result.success) {
        companyResearch.value = {
          company: companyName,
          overview: result.companyOverview,
          culture: result.culture,
          projects: result.projects,
          position: result.position,
          talkingPoints: result.talkingPoints,
          hooks: result.hooks,
          researched_at: new Date().toISOString(),
        };

        toast.success(`Company research completed for ${companyName}`);
        logger.info("Company research completed successfully");

        return {
          success: true,
          research: companyResearch.value,
        };
      } else {
        error.value = result.error ?? null;

        if (result.fallback) {
          companyResearch.value = {
            company: companyName,
            ...result.fallback,
            isFallback: true,
            researched_at: new Date().toISOString(),
          };
          toast.warning(
            "Using basic company information due to research limitations",
          );
        } else {
          toast.error(`Research failed: ${result.error}`);
        }

        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Company research failed:", err);
      toast.error("Failed to research company");
      return { success: false, error: err.message };
    } finally {
      isResearching.value = false;
    }
  }

    coverLetterText: string,
    jobDescription = "",
    userProfile: any = {},
  ) {
    if (isProcessing.value || !coverLetterText?.trim()) {
      return {
        success: false,
        error: "No content to review or operation in progress",
      };
    }

    try {
      isReviewing.value = true;
      error.value = null;

      logger.info("Starting cover letter review");

      const result = await aiCoverLetterService.reviewCoverLetter(
        coverLetterText,
        jobDescription,
        userProfile,
      );

      if (result.success) {
        reviewResults.value = {
          score: result.score,
          categoryScores: result.categoryScores,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          atsCompliance: result.atsCompliance,
          revisionPriority: result.revisionPriority,
          reviewed_at: new Date().toISOString(),
        };

        // Update history with score if this is the current content
        if (
        ) {
        }

        const gradeInfo = reviewGrade.value;
        toast.success(
        );

        return {
          success: true,
          score: result.score,
          review: reviewResults.value,
        };
      } else {
        error.value = result.error ?? null;

        if (result.fallback) {
          reviewResults.value = {
            ...result.fallback,
            isFallback: true,
            reviewed_at: new Date().toISOString(),
          };
          toast.warning("Using basic review due to AI service limitations");
        } else {
          toast.error(`Review failed: ${result.error}`);
        }

        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Cover letter review failed:", err);
      toast.error("Failed to review cover letter");
      return { success: false, error: err.message };
    } finally {
      isReviewing.value = false;
    }
  }

    coverLetterText: string,
    improvementFocus: string[] = [],
    jobDescription = "",
    userProfile: any = {},
  ) {
    if (isProcessing.value || !coverLetterText?.trim()) {
      return {
        success: false,
        error: "No content to improve or operation in progress",
      };
    }

    try {
      isImproving.value = true;
      error.value = null;

      logger.info("Starting cover letter improvement");

      const result = await aiCoverLetterService.improveCoverLetter(
        coverLetterText,
        improvementFocus,
        jobDescription,
        userProfile,
      );

      if (result.success) {
        improvementResults.value = {
          originalText: coverLetterText,
          improvedText: result.improvedText,
          changes: result.changes,
          improvements: result.improvements,
          keywordBoosts: result.keywordBoosts,
          improved_at: new Date().toISOString(),
        };

        // Update the generated content with improved version
        generatedContent.value = result.improvedText;

        // Add improved version to history
        addToGenerationHistory({
          content: result.improvedText,
          approach: "improved",
          timestamp: new Date().toISOString(),
          improvements: result.improvements,
        });

        // Clear previous review since content changed
        reviewResults.value = null;

        toast.success(
        );
        logger.info("Cover letter improvement completed");

        return {
          success: true,
          improvedText: result.improvedText,
          changes: result.changes,
          improvements: result.improvements,
        };
      } else {
        error.value = result.error ?? null;
        toast.error(`Improvement failed: ${result.error || "Unknown error"}`);
        return { success: false, error: result.error || "Unknown error" };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Cover letter improvement failed:", err);
      toast.error("Failed to improve cover letter");
      return { success: false, error: err.message };
    } finally {
      isImproving.value = false;
    }
  }

    baseContent: string,
    jobDescription = "",
    userProfile: any = {},
  ) {
    if (isProcessing.value || !baseContent?.trim()) {
      return {
        success: false,
        error: "No base content or operation in progress",
      };
    }

    try {
      isGeneratingVariations.value = true;
      error.value = null;

      logger.info(`Generating ${count} cover letter variations`);

      const result = await aiCoverLetterService.generateVariations(
        baseContent,
        jobDescription,
        userProfile,
        count,
      );

      if (result.success) {
        variations.value = result.variations.map(
          (variation: any, index: number) => ({
            ...variation,
            generated_at: new Date().toISOString(),
          }),
        );

        toast.success(`Generated ${result.variations.length} variations`);
        logger.info(
          `Generated ${result.variations.length} cover letter variations`,
        );

        return {
          success: true,
          variations: variations.value,
        };
      } else {
        error.value = result.error ?? null;
        toast.error(`Variation generation failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error.value = err.message;
      logger.error("Cover letter variation generation failed:", err);
      toast.error("Failed to generate variations");
      return { success: false, error: err.message };
    } finally {
      isGeneratingVariations.value = false;
    }
  }

    const variation = variations.value.find((v) => v.id === variationId);
    if (variation) {
      generatedContent.value = variation.fullText;

      addToGenerationHistory({
        content: variation.fullText,
        approach: variation.approach,
        timestamp: new Date().toISOString(),
        variationId,
      });

      // Clear review since content changed
      reviewResults.value = null;

      toast.success(`Selected ${variation.approach} variation`);
      return { success: true, content: variation.fullText };
    }

    return { success: false, error: "Variation not found" };
  }

    generationHistory.value.unshift(entry);
    }
  }

    generatedContent.value = "";
    companyResearch.value = null;
    reviewResults.value = null;
    improvementResults.value = null;
    variations.value = [];
    keyPoints.value = [];
    personalizations.value = [];
    suggestions.value = {};
    error.value = null;
  }

    reviewResults.value = null;
  }

    variations.value = [];
  }

  // Watch for content changes to clear dependent data
  watch(generatedContent, (newContent, oldContent) => {
    if (newContent !== oldContent && oldContent) {
      // Content changed, clear review results
      reviewResults.value = null;
    }
  });

  return {
    // State
    isGenerating: computed(() => isGenerating.value),
    isResearching: computed(() => isResearching.value),
    isReviewing: computed(() => isReviewing.value),
    isImproving: computed(() => isImproving.value),
    isGeneratingVariations: computed(() => isGeneratingVariations.value),
    isProcessing,

    // Content
    generatedContent: computed(() => generatedContent.value),
    companyResearch: computed(() => companyResearch.value),
    reviewResults: computed(() => reviewResults.value),
    improvementResults: computed(() => improvementResults.value),
    variations: computed(() => variations.value),

    // Insights
    keyPoints: computed(() => keyPoints.value),
    personalizations: computed(() => personalizations.value),
    suggestions: computed(() => suggestions.value),
    error: computed(() => error.value),

    // History
    generationHistory: computed(() => generationHistory.value),

    // Computed
    hasGeneratedContent,
    hasCompanyResearch,
    hasReview,
    reviewScore,
    reviewGrade,
    improvementSummary,

    // Methods
    generateFromJobDescription,
    researchCompany,
    reviewCoverLetter,
    improveCoverLetter,
    generateVariations,
    selectVariation,
    clearAll,
    clearReview,
    clearVariations,
  };
}

// Export types for external use
export type {
  UseAICoverLetterReturn,
  UseAICoverLetterOptions,
  CompanyResearch,
  ReviewResults,
  ImprovementResults,
  CoverLetterVariation,
};
