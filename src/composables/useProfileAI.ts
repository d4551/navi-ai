
import { ref, computed } from "vue";
import { useAIService } from "@/composables/useAIService";
import { useUnifiedProfile } from "@/composables/useUnifiedProfile";
import { useAppStore } from "@/stores/app";
import { logger } from "@/shared/utils/logger";

export interface ProfileAIOptions {
  includeGamingExperience?: boolean;
  focusOnTargetRole?: boolean;
  usePersonalityInsights?: boolean;
  optimizeForATS?: boolean;
}

export interface ProfileAIResult {
  success: boolean;
  data?: any;
  suggestions?: string[];
  error?: string;
  confidence?: number;
}

  const aiService = useAIService();
  const unifiedProfile = useUnifiedProfile();
  const store = useAppStore();

  const isProcessing = ref(false);
  const lastResult = ref<ProfileAIResult | null>(null);

  // Check if profile-enhanced AI is ready
  const isReady = computed(() => {
    return (
      aiService.isLoading.value === false &&
      unifiedProfile.profile.value !== null &&
      unifiedProfile.isValid.value
    );
  });

  const profileCompleteness = computed(() => unifiedProfile.completeness.value);

  const generateResumeWithProfile = async (
    jobDescription?: string,
    options: ProfileAIOptions = {},
  ): Promise<ProfileAIResult> => {
    if (!isReady.value) {
      return { success: false, error: "Profile or AI service not ready" };
    }

    try {
      isProcessing.value = true;

      const resumeProfile = unifiedProfile.getContextualProfile("resume");
      const aiTrainingProfile = unifiedProfile.getContextualProfile(
        "ai",
        "training",
      );

      const prompt = buildResumePrompt(
        resumeProfile,
        aiTrainingProfile,
        jobDescription,
        options,
      );
      const aiResult = await aiService.analyzeWithAI(prompt, {
      });

      if (!aiResult) {
        return { success: false, error: "AI service returned no result" };
      }

      const result: ProfileAIResult = {
        success: true,
        data: parseResumeResponse(aiResult),
        confidence: calculateConfidence(resumeProfile, options),
      };

      lastResult.value = result;
      return result;
    } catch (error: any) {
      logger.error("Profile-enhanced resume generation failed:", error);
      const result: ProfileAIResult = {
        success: false,
        error: error.message || "Unknown error occurred",
      };
      lastResult.value = result;
      return result;
    } finally {
      isProcessing.value = false;
    }
  };

  const generateCoverLetterWithProfile = async (
    jobDescription: string,
    companyInfo?: any,
    options: ProfileAIOptions = {},
  ): Promise<ProfileAIResult> => {
    if (!isReady.value) {
      return { success: false, error: "Profile or AI service not ready" };
    }

    try {
      isProcessing.value = true;

      const jobProfile = unifiedProfile.getContextualProfile("jobs");
      const aiTrainingProfile = unifiedProfile.getContextualProfile(
        "ai",
        "training",
      );

      const prompt = buildCoverLetterPrompt(
        jobProfile,
        aiTrainingProfile,
        jobDescription,
        companyInfo,
        options,
      );

      const aiResult = await aiService.analyzeWithAI(prompt, {
      });

      if (!aiResult) {
        return { success: false, error: "AI service returned no result" };
      }

      const result: ProfileAIResult = {
        success: true,
        data: parseCoverLetterResponse(aiResult),
        confidence: calculateConfidence(jobProfile, options),
      };

      lastResult.value = result;
      return result;
    } catch (error: any) {
      logger.error("Profile-enhanced cover letter generation failed:", error);
      const result: ProfileAIResult = {
        success: false,
        error: error.message || "Unknown error occurred",
      };
      lastResult.value = result;
      return result;
    } finally {
      isProcessing.value = false;
    }
  };

  const analyzeJobCompatibility = async (
    jobDescription: string,
  ): Promise<ProfileAIResult> => {
    if (!isReady.value) {
      return { success: false, error: "Profile or AI service not ready" };
    }

    try {
      isProcessing.value = true;

      const studioProfile = unifiedProfile.getContextualProfile("studios");
      const jobProfile = unifiedProfile.getContextualProfile("jobs");

      const prompt = buildCompatibilityPrompt(
        studioProfile,
        jobProfile,
        jobDescription,
      );
      const aiResult = await aiService.analyzeWithAI(prompt, {
      });

      if (!aiResult) {
        return { success: false, error: "AI service returned no result" };
      }

      const result: ProfileAIResult = {
        success: true,
        data: parseCompatibilityResponse(aiResult),
      };

      lastResult.value = result;
      return result;
    } catch (error: any) {
      logger.error("Job compatibility analysis failed:", error);
      const result: ProfileAIResult = {
        success: false,
        error: error.message || "Unknown error occurred",
      };
      lastResult.value = result;
      return result;
    } finally {
      isProcessing.value = false;
    }
  };

  const getPersonalizedSuggestions = async (
    documentType: "resume" | "cover-letter",
    currentContent: any,
  ): Promise<ProfileAIResult> => {
    if (!isReady.value) {
      return { success: false, error: "Profile or AI service not ready" };
    }

    try {
      isProcessing.value = true;

      const contextProfile = unifiedProfile.getContextualProfile(
        documentType === "resume" ? "resume" : "jobs",
      );

      const prompt = buildSuggestionsPrompt(
        documentType,
        currentContent,
        contextProfile,
      );
      const aiResult = await aiService.analyzeWithAI(prompt, {
      });

      if (!aiResult) {
        return { success: false, error: "AI service returned no result" };
      }

      const result: ProfileAIResult = {
        success: true,
        suggestions: parseSuggestionsResponse(aiResult),
        confidence: calculateSuggestionConfidence(
          contextProfile,
          currentContent,
        ),
      };

      lastResult.value = result;
      return result;
    } catch (error: any) {
      logger.error("Personalized suggestions generation failed:", error);
      const result: ProfileAIResult = {
        success: false,
        error: error.message || "Unknown error occurred",
      };
      lastResult.value = result;
      return result;
    } finally {
      isProcessing.value = false;
    }
  };

  const buildResumePrompt = (
    resumeProfile: any,
    aiProfile: any,
    jobDescription?: string,
    options: ProfileAIOptions = {},
  ): string => {
    const personalInfo = resumeProfile?.personalInfo || {};
    const experience = resumeProfile?.experience || [];
    const skills = resumeProfile?.skills || {};

    let prompt = `As an expert resume writer for the gaming industry, enhance this resume:

CURRENT DATA:
Name: ${personalInfo.name || "Not provided"}
Email: ${personalInfo.email || "Not provided"}
Current Role: ${personalInfo.currentRole || "Not provided"}
Summary: ${personalInfo.summary || "Not provided"}

Experience (${experience.length} entries):

Skills:
- Technical: ${skills.technical?.join(", ") || "None listed"}
- Soft: ${skills.soft?.join(", ") || "None listed"}
- Gaming: ${skills.gaming?.join(", ") || "None listed"}
`;

    if (options.includeGamingExperience && aiProfile?.gamingBackground) {
      prompt += `\nGAMING BACKGROUND:
- Competitive Gaming: ${aiProfile.gamingBackground.competitiveGaming?.join(", ") || "None"}
- Team Leadership: ${aiProfile.gamingBackground.teamLeadership?.join(", ") || "None"}
- Achievements: ${aiProfile.gamingBackground.achievements?.join(", ") || "None"}
`;
    }

    if (jobDescription && options.optimizeForATS) {
    }

    prompt += `\nINSTRUCTIONS:

Return ONLY valid JSON with this structure:
{
  "personalInfo": {"name": "", "email": "", "summary": ""},
  "experience": [{"company": "", "title": "", "description": "", "startDate": "", "endDate": ""}],
  "skills": {"technical": [], "soft": [], "gaming": []},
}`;

    return prompt;
  };

  const buildCoverLetterPrompt = (
    jobProfile: any,
    aiProfile: any,
    jobDescription: string,
    companyInfo?: any,
    options: ProfileAIOptions = {},
  ): string => {
    let prompt = `As an expert cover letter writer for the gaming industry, create a compelling cover letter using this profile:

Profile: ${JSON.stringify(jobProfile)}
Job Description: ${jobDescription}
`;

    if (companyInfo) {
      prompt += `Company Information: ${JSON.stringify(companyInfo)}\n`;
    }

    if (options.includeGamingExperience && aiProfile?.gamingBackground) {
      prompt += `Gaming Experience: ${JSON.stringify(aiProfile.gamingBackground)}\n`;
    }

    prompt += `\nCreate a personalized, engaging cover letter that demonstrates passion for gaming and relevant experience. Return as JSON with: opening, body, closing.`;

    return prompt;
  };

  const buildCompatibilityPrompt = (
    studioProfile: any,
    jobProfile: any,
    jobDescription: string,
  ): string => {
    return `Analyze job compatibility between this profile and job description:

Profile: ${JSON.stringify({ ...studioProfile, ...jobProfile })}
Job Description: ${jobDescription}

Provide analysis including:
- Missing skills/requirements
- Strength areas
- Improvement recommendations

Return as JSON with: skillMatch, experienceMatch, missingSkills, strengths, recommendations.`;
  };

  const buildSuggestionsPrompt = (
    documentType: string,
    currentContent: any,
    contextProfile: any,
  ): string => {
    return `Review this ${documentType} and suggest improvements using the profile context:

Current Content: ${JSON.stringify(currentContent)}
Profile Context: ${JSON.stringify(contextProfile)}

- Content optimization
- Keyword integration  
- Gaming industry relevance
- Professional presentation

Return as array of suggestion strings.`;
  };

  // Response parsers
  const parseResumeResponse = (response: string): any => {
    try {
      return JSON.parse(response);
    } catch {
      // Fallback parsing for non-JSON responses
      return { raw: response };
    }
  };

  const parseCoverLetterResponse = (response: string): any => {
    try {
      return JSON.parse(response);
    } catch {
      return { raw: response };
    }
  };

  const parseCompatibilityResponse = (response: string): any => {
    try {
      return JSON.parse(response);
    } catch {
      return { analysis: response };
    }
  };

  const parseSuggestionsResponse = (response: string): string[] => {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [response];
    } catch {
      return response.split("\n").filter((line) => line.trim());
    }
  };

  // Confidence calculation helpers
  const calculateConfidence = (
    profile: any,
    options: ProfileAIOptions,
  ): number => {


  };

  const calculateSuggestionConfidence = (
    profile: any,
    currentContent: any,
  ): number => {


  };

  return {
    // State
    isProcessing,
    isReady,
    lastResult,
    profileCompleteness,

    // Core methods
    generateResumeWithProfile,
    generateCoverLetterWithProfile,
    analyzeJobCompatibility,
    getPersonalizedSuggestions,

    // Utilities
    refreshProfile: unifiedProfile.forceSync,
  };
}

export default useProfileAI;
