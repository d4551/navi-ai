
import { ref, computed } from "vue";
import { useAppStore } from "@/stores/app";
import { useAIIntegration } from "@/composables/aiIntegration.js";
import { useToast } from "@/composables/useToast";

  const store = useAppStore();
  const ai = useAIIntegration();
  const toast = useToast();

  // Loading states for different AI actions
  const loadingStates = ref({
    generate: false,
    analyze: false,
    enhance: false,
    optimize: false,
    research: false,
    extract: false,
    review: false,
    interview: false,
    custom: false,
  });

  // AI Button Configurations by Page
  const pageConfigurations = {
    dashboard: [
      {
        action: "analyze_resume",
        icon: "mdi-brain",
        text: "AI Resume Analysis",
        tooltip: "Get AI-powered insights on your resume",
        variant: "primary",
        position: "header",
      },
      {
        action: "search_jobs",
        icon: "mdi-briefcase-search",
        text: "Smart Job Search",
        tooltip: "Find matching jobs with AI",
        variant: "secondary",
        position: "quick-actions",
      },
    ],

    resumeBuilder: [
      {
        action: "generate_resume_content",
        icon: "mdi-auto-fix",
        text: "AI Generate",
        tooltip: "Generate resume content with AI",
        variant: "primary",
        position: "toolbar",
        context: () => ({ resumeContent: store.resumeData }),
      },
      {
        action: "analyze_resume",
        icon: "mdi-magnify",
        text: "AI Review",
        tooltip: "Get AI feedback on your resume",
        variant: "outline",
        position: "toolbar",
        context: () => ({ resumeContent: store.resumeData }),
      },
      {
        action: "extract_skills",
        icon: "mdi-brain",
        text: "Extract Skills",
        tooltip: "Extract skills from experience",
        variant: "secondary",
        position: "skills-section",
        context: () => ({
          content: store.resumeData?.experience
            ?.map((exp) => exp.description)
            .join("\n"),
        }),
      },
      {
        action: "enhance_content",
        icon: "mdi-star-outline",
        text: "Enhance",
        tooltip: "Improve content with AI suggestions",
        variant: "ghost",
        position: "section-actions",
        context: () => ({ content: "" }), // Will be populated by component
      },
    ],

    coverLetterBuilder: [
      {
        action: "generate_cover_letter",
        icon: "mdi-auto-fix",
        text: "AI Generate",
        tooltip: "Generate personalized cover letter",
        variant: "primary",
        position: "toolbar",
        context: () => ({
          resumeContent: store.resumeData,
          jobDescription: store.coverLetterData?.jobInfo?.description,
          companyInfo: store.coverLetterData?.jobInfo?.company,
        }),
      },
      {
        action: "research_company",
        icon: "mdi-domain",
        text: "Research Company",
        tooltip: "Get AI insights about the company",
        variant: "outline",
        position: "job-info-section",
        context: () => ({
          companyName: store.coverLetterData?.jobInfo?.company,
        }),
      },
      {
        action: "enhance_content",
        icon: "mdi-star-outline",
        text: "Enhance",
        tooltip: "Improve cover letter content",
        variant: "secondary",
        position: "content-section",
        context: () => ({
          content: store.coverLetterData?.content?.body,
        }),
      },
    ],

    portfolioGenerator: [
      {
        action: "optimize_portfolio",
        icon: "mdi-auto-fix",
        text: "AI Optimize",
        tooltip: "Optimize portfolio for gaming industry",
        variant: "gaming",
        position: "toolbar",
        context: () => ({
          portfolioContent: store.portfolioData,
          targetRole: store.user?.targetRole,
        }),
      },
      {
        action: "enhance_content",
        icon: "mdi-palette",
        text: "AI Enhance",
        tooltip: "Enhance portfolio projects with AI",
        variant: "primary",
        position: "project-sections",
        context: () => ({ content: "" }),
      },
    ],

    skillMapper: [
      {
        action: "map_skills",
        icon: "mdi-brain",
        text: "AI Map Skills",
        tooltip: "Map gaming skills to career opportunities",
        variant: "primary",
        position: "toolbar",
        context: () => ({
          gameTitle: "",
          achievements: [],
          targetRole: store.user?.targetRole,
        }),
      },
      {
        action: "analyze_job_match",
        icon: "mdi-target",
        text: "Analyze Match",
        tooltip: "Analyze skill-job compatibility",
        variant: "secondary",
        position: "results-section",
        context: () => ({
          skills: store.user?.skills || [],
          job: "",
        }),
      },
    ],

    jobSearch: [
      {
        action: "search_jobs",
        icon: "mdi-briefcase-search",
        text: "AI Job Search",
        tooltip: "Find personalized job recommendations",
        variant: "primary",
        position: "search-bar",
        context: () => ({
          skills: store.user?.skills || [],
          gamingExperience: store.user?.gamingExperience || {},
          preferences: store.user?.jobPreferences || {},
        }),
      },
      {
        action: "analyze_job_match",
        icon: "mdi-brain",
        text: "AI Match Analysis",
        tooltip: "Analyze job compatibility",
        variant: "outline",
        position: "job-cards",
        context: () => ({
          resume: store.resumeData,
          job: "", // Will be populated by component
        }),
      },
    ],

    gamingInterview: [
      {
        action: "conduct_interview",
        icon: "mdi-microphone",
        text: "Start AI Interview",
        tooltip: "Practice with AI interviewer",
        variant: "gaming",
        position: "main-action",
        context: () => ({
          jobDescription: store.interviewData?.jobDescription,
          difficulty: store.interviewData?.difficulty || "mid",
        }),
      },
      {
        action: "prepare_interview",
        icon: "mdi-school",
        text: "AI Prep",
        tooltip: "Get AI preparation tips",
        variant: "primary",
        position: "sidebar",
        context: () => ({
          studioName: store.interviewData?.company,
          role: store.interviewData?.role,
          userBackground: store.user,
        }),
      },
    ],

    settings: [
      {
        action: "custom",
        icon: "mdi-brain",
        text: "Test AI Connection",
        tooltip: "Test your AI configuration",
        variant: "primary",
        position: "ai-section",
        context: () => ({
          message: "Hello, this is a test message.",
          type: "chat",
        }),
      },
    ],
  };

  // Get buttons for current page
  const getButtonsForPage = (page) => {
    return pageConfigurations[page] || [];
  };

  // Get buttons by position
  const getButtonsByPosition = (page, position) => {
    const buttons = getButtonsForPage(page);
    return buttons.filter((btn) => btn.position === position);
  };

    const action = actionConfig.action;

    if (loadingStates.value[action] || loadingStates.value.custom) {
      return null;
    }

    try {
      // Set loading state
      if (Object.prototype.hasOwnProperty.call(loadingStates.value, action)) {
        loadingStates.value[action] = true;
      } else {
        loadingStates.value.custom = true;
      }

      // Build context
      const context = {
        ...(actionConfig.context ? actionConfig.context() : {}),
        ...customContext,
      };

      const result = await ai.triggerAIAction(action, context);

      if (result) {
        toast.success(
          `AI ${action.replace(/_/g, " ")} completed successfully!`,
        );
        return result;
      } else {
        throw new Error("AI action returned no result");
      }
    } catch (error) {
      console.error(`AI action failed (${action}):`, error);
      toast.error(`AI ${action.replace(/_/g, " ")} failed: ${error.message}`);
      return null;
    } finally {
      // Clear loading state
      if (Object.prototype.hasOwnProperty.call(loadingStates.value, action)) {
        loadingStates.value[action] = false;
      } else {
        loadingStates.value.custom = false;
      }
    }
  };

  // Quick action shortcuts
  const quickActions = {
    generateResumeContent: (context = {}) =>
        action: "generate_resume_content",
        context: () => context,
      }),

    analyzeCoverLetter: (context = {}) =>

    searchJobs: (context = {}) =>

    mapSkills: (context = {}) =>

    startInterview: (context = {}) =>
  };

  // Button states
  const buttonStates = computed(() => ({
    hasAPIKey: !!(store.settings?.geminiApiKey || store.settings?.openaiApiKey),
    aiInitialized: ai.isAIInitialized.value,
    aiInitializing: ai.aiInitializing.value,
    loadingStates: loadingStates.value,
  }));

  // Create button props for components
  const createButtonProps = (config, additionalContext = {}) => ({
    action: config.action,
    variant: config.variant || "primary",
    size: config.size || "md",
    icon: config.icon,
    text: config.text,
    tooltip: config.tooltip,
    loading: loadingStates.value[config.action] || loadingStates.value.custom,
    context: {
      ...(config.context ? config.context() : {}),
      ...additionalContext,
    },
    onSuccess: (result) => {
      // AI action completed successfully
      return result;
    },
    onError: (error) => {
      console.error(`AI ${config.action} failed:`, error);
    },
  });

  // Initialize AI if needed
  const ensureAIReady = async () => {
    if (!buttonStates.value.hasAPIKey) {
      toast.warning(
        "Please configure your AI API key in Settings to use AI features.",
      );
      return false;
    }

    if (
      !buttonStates.value.aiInitialized &&
      !buttonStates.value.aiInitializing
    ) {
      await ai.initializeAI();
    }

    return buttonStates.value.aiInitialized;
  };

  return {
    // State
    loadingStates: computed(() => loadingStates.value),
    buttonStates,

    // Page configurations
    getButtonsForPage,
    getButtonsByPosition,

    // Actions
    quickActions,
    ensureAIReady,

    // Utilities
    createButtonProps,

    // Convenience methods for common patterns
    addAIButtonToSection: (sectionRef, buttonConfig) => {
      // Helper to dynamically add AI buttons to sections
      if (sectionRef?.value) {
        return createButtonProps(buttonConfig);
      }
      return null;
    },
  };
}

export default useAIButtons;
