
import { realTimeMultiTurnService } from "./RealTimeMultiTurnService";
import { databaseService, ChatHistory, ChatMessage } from "./DatabaseService";
import { canonicalAIClient } from "./CanonicalAIClient";
import { jobPostingAnalysisService } from "@/services/JobPostingAnalysisService";
import { aiResumeTargetingService } from "@/services/AIResumeTargetingService";
import { enhancedSkillExtractor } from "@/shared/services/EnhancedSkillExtractor";
import { aiJobService } from "@/services/AIJobService";
import { semanticSearchService } from "@/shared/services/SemanticSearchService";
import { resolveGeminiApiKey } from "@/shared/utils/apiKeys";

// AI Service Configuration
export interface AIServiceConfig {
  primaryProvider: "google" | "openai" | "anthropic";
  fallbackProviders: Array<"google" | "openai" | "anthropic">;
  maxRetries: number;
  timeoutMs: number;
  enableContextPersistence: boolean;
  maxContextLength: number;
  enableRealTime: boolean;
  // Optional, accepted during initialize() to wire real client
  apiKey?: string;
  model?: string;
}

// Request Types
export interface AIRequest {
  message: string;
  context?: string;
  userId?: string;
  sessionId?: string;
  type?: "chat" | "completion" | "analysis" | "generation";
  metadata?: Record<string, any>;
}

export interface AIStreamRequest extends AIRequest {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

export interface RealTimeRequest extends AIRequest {
  mode: "audio" | "video" | "screen" | "multimodal";
  mediaStream?: MediaStream;
  onResponse?: (response: string) => void;
  onMediaData?: (data: any) => void;
}

// Response Types
export interface AIResponse {
  content: string;
  provider: string;
  timestamp: Date;
  tokensUsed?: number;
  confidence?: number;
  metadata?: Record<string, any>;
  conversationId?: string;
}

export interface AIStreamResponse extends AIResponse {
  isStreaming: boolean;
  chunks: string[];
}

// Button configuration for UI components
export type AIButtonType = "chat" | "completion" | "analysis" | "generation";

export interface AIButtonConfig {
  label: string;
  icon: string;
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "xs" | "sm" | "md" | "lg";
  loadingText: string;
  tooltip?: string;
  requiresAuth?: boolean;
  disabled?: boolean;
  successText?: string;
  errorText?: string;
}

// AI Service Implementation
export class AIService {
  private static instance: AIService;
  private config: AIServiceConfig;
  private realTimeService: typeof realTimeMultiTurnService;
  private initialized = false;

  // Predefined button configurations for UI components
  private readonly BUTTON_CONFIGS: Record<AIButtonType, AIButtonConfig> = {
    chat: {
      label: "Ask AI",
      icon: "mdi-robot",
      variant: "primary",
      size: "md",
      loadingText: "Thinking...",
      requiresAuth: false,
    },
    completion: {
      label: "Complete",
      icon: "mdi-auto-fix",
      variant: "secondary",
      size: "md",
      loadingText: "Completing...",
      requiresAuth: false,
    },
    analysis: {
      label: "Analyze",
      icon: "mdi-chart-bar",
      variant: "outline",
      size: "md",
      loadingText: "Analyzing...",
      requiresAuth: false,
    },
    generation: {
      label: "Generate",
      icon: "mdi-auto-fix",
      variant: "primary",
      size: "md",
      loadingText: "Generating...",
      requiresAuth: false,
    },
  };

  private constructor() {
    this.config = {
      primaryProvider: "google",
      fallbackProviders: ["openai", "anthropic"],
      enableContextPersistence: true,
      enableRealTime: true,
    };

    this.realTimeService = realTimeMultiTurnService;
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(
    config?: Partial<AIServiceConfig>,
  ): Promise<{
    success: boolean;
    message?: string;
    model?: any;
    provider?: string;
  }> {
    if (this.initialized) {
      return {
        success: true,
        message: "AI service already initialized",
        provider: this.config.primaryProvider,
      };
    }

    if (_config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Use the centralized API key resolver for better reliability
      const resolvedKey = await resolveGeminiApiKey();

      // Allow config to override resolved key
      const key = (config as any)?.apiKey || resolvedKey;

      if (!key) {
        throw new Error(
          "No Gemini API key found. Please configure your API key in Settings.",
        );
      }

      try {
        // Initialize canonical AI client with resolved API key
        await canonicalAIClient.initialize(key, model);
      } catch (_e) {
        console.error("Canonical AI client initialization failed:", e);
        throw new Error(
          `API key validation failed: ${e instanceof Error ? e.message : "Invalid API key"}`,
        );
      }

      this.initialized = true;

      return {
        success: true,
        message: "AI services initialized successfully",
        provider: this.config.primaryProvider,
        model: {
          capabilities: {
            imageInput: true,
            audioInput: this.config.enableRealTime,
            realtimeChat: this.config.enableRealTime,
            textGeneration: true,
          },
        },
      };
    } catch (_error) {
      // Log initialization failures as they are critical for service operation
      console.error("AI service initialization failed:", error);

      // Enhanced error handling with specific error types
      let errorMessage = "AI service initialization failed";
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage =
            "Invalid or missing API key. Please check your configuration.";
        } else if (error.message.includes("network")) {
          errorMessage =
            "Network error during AI service initialization. Please check your connection.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Rate limit exceeded. Please wait and try again.";
        } else {
          errorMessage = `AI service initialization failed: ${error.message}`;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error("AI service not initialized. Call initialize() first.");
    }

    let lastError: Error | null = null;

    // Load conversation context if enabled
    let contextMessages: ChatMessage[] = [];
    if (this.config.enableContextPersistence && request.sessionId) {
      contextMessages = await this.loadConversationContext(request.sessionId);
    }

    // Build full context
    const fullContext = this.buildContext(contextMessages, request.context);
    const contextualRequest = {
      ...request,
      message: fullContext + "\n\nUser: " + request.message,
    };

    // Try primary provider first
    try {
      const response = await this.callProvider(
        this.config.primaryProvider,
        contextualRequest,
      );

      // Save to conversation history
      if (
        this.config.enableContextPersistence &&
        request.userId &&
        request.sessionId
      ) {
        await this.saveToHistory(request, response);
      }

      return response;
    } catch (_error) {
      lastError = error as Error;
      // Log provider failures for debugging fallback behavior
      console.warn(
        `Primary provider ${this.config.primaryProvider} failed:`,
        error,
      );
    }

    // Try fallback providers
    for (const provider of this.config.fallbackProviders) {
      try {
        const response = await this.callProvider(provider, contextualRequest);

        // Save to conversation history
        if (
          this.config.enableContextPersistence &&
          request.userId &&
          request.sessionId
        ) {
          await this.saveToHistory(request, response);
        }

        return response;
      } catch (_error) {
        lastError = error as Error;
        // Log fallback failures for debugging
        console.warn(`Fallback provider ${provider} failed:`, error);
      }
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message || "Unknown error"}`,
    );
  }

  async generateResumeContent(context: any): Promise<AIResponse> {
    const resumeData =
      context?.resumeContent || context?.resume || context?.userInfo || "";
    const message = `Generate professional, concise resume content. Focus on measurable achievements and game industry relevance.`;
    const ctx =
      typeof resumeData === "string"
        ? resumeData
        : JSON.stringify(resumeData);
    return this.chat({ message, context: ctx, type: "generation" });
  }

  async analyzeJobMatch(context: any): Promise<AIResponse> {
    // If array of jobs provided, run structured matching
    if (Array.isArray(context && (context.jobs || context.jobList))) {
      const jobs = context.jobs || context.jobList;
      const matches = await aiJobService.analyzeJobMatches(jobs);
      return {
        content: "Job matches computed",
        provider: this.config.primaryProvider,
        timestamp: new Date(),
        metadata: { matches },
      };
    }

    // If single job object provided
    if (context?.job) {
      const matches = await aiJobService.analyzeJobMatches([context.job]);
      return {
        content: "Job match analysis completed",
        provider: this.config.primaryProvider,
        timestamp: new Date(),
      };
    }

    // If description or url provided, use posting analysis
    if (context?.url) {
      const result = await jobPostingAnalysisService.analyzeFromUrl(
        context.url,
      );
      return {
        content: result.analysis
          ? `Analysis for ${result.analysis.jobTitle} at ${result.analysis.company}`
          : result.error || "Analysis failed",
        provider: this.config.primaryProvider,
        timestamp: new Date(),
        metadata: result as any,
      };
    }
    if (context?.jobDescription || context?.jobText || context?.description) {
      const text =
        context.jobDescription || context.jobText || context.description;
      const result =
        await jobPostingAnalysisService.analyzeJobPostingText(text);
      return {
        content: result.analysis
          ? `Analysis for ${result.analysis.jobTitle} at ${result.analysis.company}`
          : result.error || "Analysis failed",
        provider: this.config.primaryProvider,
        timestamp: new Date(),
        metadata: result as any,
      };
    }

    // Fallback to generic chat
    return this.chat({
      message: "Analyze this job match",
      context: JSON.stringify(context ?? {}),
      type: "analysis",
    });
  }

  async extractSkills(context: any): Promise<AIResponse> {
    const text =
      context?.content || context?.text || context?.experienceText || "";
    const result = await enhancedSkillExtractor.extractSkills(String(text));
    return {
      content: `Found ${result.totalSkillsFound} skills`,
      provider: this.config.primaryProvider,
      timestamp: new Date(),
      metadata: { result },
    } as any;
  }

  async conductMockInterview(context: any): Promise<AIResponse> {
    const jobDescription =
      context?.jobDescription || context?.description || "";
    const difficulty = context?.difficulty || "mid";
    return this.generateInterviewQuestions(jobDescription, difficulty);
  }

  async analyzeStudioFit(context: any): Promise<AIResponse> {
    const studioName =
      context?.studioName ||
      context?.studio ||
      context?.company ||
      "Unknown Studio";
    const games = context?.games || [];
    const role = context?.targetRole || context?.role || "Game Developer";
    return this.analyzeGamingStudio(studioName, games, role);
  }

  async recommendStudios(context: any): Promise<AIResponse> {
    const skills = context?.skills || [];
    const experience = context?.gamingExperience || {};
    const preferences = context?.preferences || {};
    return this.getGamingJobRecommendations(skills, experience, preferences);
  }

  async performSemanticJobSearch(context: any): Promise<AIResponse> {
    const query = context?.query || context?.keywords || "";
    const results = await semanticSearchService.semanticSearch(
      String(query || ""),
    );
    return {
      content: `Found ${results.length} relevant results`,
      provider: this.config.primaryProvider,
      timestamp: new Date(),
      metadata: { results },
    } as any;
  }

  async enhanceJobMatching(context: any): Promise<AIResponse> {
    // If job and resume provided, use resume targeting service pipeline
    if (context?.jobAnalysis) {
      const tailored = await aiResumeTargetingService.tailorResumeToJob(
        context?.currentResume || {},
        context.jobAnalysis,
      );
      return {
        content: tailored.success
          ? "Resume tailoring completed"
          : tailored.error || "Resume tailoring failed",
        provider: this.config.primaryProvider,
        timestamp: new Date(),
        metadata: tailored as any,
      };
    }

    // Otherwise respond with generic guidance
    return this.chat({
      message:
        "Provide specific recommendations to enhance job matching for this user profile and preferences.",
      context: JSON.stringify(context ?? {}),
      type: "analysis",
    });
  }

  async salaryInsights(context: any): Promise<AIResponse> {
    try {
      const job = context?.job || context?.posting || null;
      if (!job) {
        return {
          content: "No job provided for salary insights",
          provider: this.config.primaryProvider,
          timestamp: new Date(),
          metadata: {},
        };
      }
      const prediction = await aiJobService.predictSalary(job);
      const { min, max, currency } = prediction.estimatedSalary;
      const content = `Estimated salary: ${currency} ${min.toLocaleString()} - ${max.toLocaleString()} (confidence ${Math.round(prediction.confidence)}%)`;
      return {
        content,
        provider: this.config.primaryProvider,
        timestamp: new Date(),
        metadata: { prediction },
      };
    } catch (error: any) {
      return {
        content: "Failed to get salary insights",
        provider: this.config.primaryProvider,
        timestamp: new Date(),
        metadata: { error: error?.message || String(_error) },
      };
    }
  }

  // Additional helpers to support UI actions
  async analyzeResumeQuick(context: any): Promise<AIResponse> {
    const resume =
      context?.resume || context?.resumeContent || context?.text || "";
    const message =
      "Analyze this resume and provide strengths, gaps, and top improvements as bullet points.";
    return this.chat({
      message,
      context: JSON.stringify(context),
      type: "analysis",
    });
  }

  async optimizePortfolio(context: any): Promise<AIResponse> {
    const portfolio = context?.portfolio || context?.items || [];
    const message =
      "Provide concrete suggestions to improve this game portfolio for hiring managers.";
    return this.chat({
      message,
      type: "analysis",
    });
  }

  async searchJobs(context: any): Promise<AIResponse> {
    const query =
      context?.query ||
      context?.keywords ||
      (Array.isArray(context?.skills) ? context.skills.join(" ") : "");
    const studiosFirst = await semanticSearchService.semanticSearch(
      String(query || ""),
    );
    return {
      content: studiosFirst.length
        ? `Found ${studiosFirst.length} potential matches`
        : "No matches found",
      provider: this.config.primaryProvider,
      timestamp: new Date(),
      metadata: { results: studiosFirst },
    };
  }

  async mapSkills(context: any): Promise<AIResponse> {
    const text = context?.content || context?.text || "";
    const result = await enhancedSkillExtractor.extractSkills(String(text));
    return {
      content: `Identified ${result.totalSkillsFound} skills`,
      provider: this.config.primaryProvider,
      timestamp: new Date(),
      metadata: { result },
    };
  }

  async realtimeChat(params: {
    message: string;
    context?: string;
    sessionId?: string;
    onChunk?: (c: string) => void;
  }): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error("AI service not initialized. Call initialize() first.");
    }
    const { message, context, sessionId, onChunk } = params || ({} as any);
    if (!message || !message.trim()) {
      throw new Error("No message provided for realtimeChat");
    }
    try {
      if (onChunk) {
        // Streamed response
        let full = "";
        await this.chatStream({
          message,
          context,
          sessionId,
          type: "chat",
          onChunk: (_chunk) => {
            full += chunk;
            onChunk?.(_chunk);
          },
        });
        return {
          content: full,
          provider: this.config.primaryProvider,
          timestamp: new Date(),
          conversationId: sessionId,
        };
      }
      // Non-streaming
      const res = await this.chat({
        message,
        context,
        sessionId,
        type: "chat",
      });
      return res;
    } catch (error: any) {
      console.error("realtimeChat failed:", error);
      throw new Error(error?.message || "realtimeChat failed");
    }
  }

  async isReady(): Promise<boolean> {
    return this.initialized;
  }

  getButtonConfig(type: AIButtonType): AIButtonConfig {
    return { ...this.BUTTON_CONFIGS[type] };
  }

  async chatStream(request: AIStreamRequest): Promise<AIStreamResponse> {
    if (!this.initialized) {
      throw new Error("AI service not initialized. Call initialize() first.");
    }

    // Load conversation context if enabled
    let contextMessages: ChatMessage[] = [];
    if (this.config.enableContextPersistence && request.sessionId) {
      contextMessages = await this.loadConversationContext(request.sessionId);
    }

    // Build full context
    const fullContext = this.buildContext(contextMessages, request.context);
    const contextualRequest = {
      ...request,
      message: fullContext + "\n\nUser: " + request.message,
    };

    try {
      // Use canonicalAIClient for streaming text generation
      const chunks: string[] = [];
      let fullContent = "";

      await canonicalAIClient.streamText(
        {
          prompt: contextualRequest.message,
          systemInstructions: contextualRequest.context || "",
          options: {
          },
        },
        {
          onChunk: (chunk: string) => {
            chunks.push(_chunk);
            fullContent += chunk;
            request.onChunk?.(_chunk);
          },
          onComplete: (complete: any) => {
            fullContent = complete;
            request.onComplete?.(complete);
          },
          onError: (error: Error) => {
            request.onError?.(_error);
          },
        },
      );

      const streamResponse: AIStreamResponse = {
        content: fullContent,
        provider: "google",
        timestamp: new Date(),
        isStreaming: true,
        chunks,
        conversationId: request.sessionId,
      };

      // Save to conversation history
      if (
        this.config.enableContextPersistence &&
        request.userId &&
        request.sessionId
      ) {
        await this.saveToHistory(request, streamResponse);
      }

      return streamResponse;
    } catch (_error) {
      // Log streaming failures as they affect user experience
      console.error("Streaming failed:", error);
      throw new Error(`AI streaming failed: ${(error as Error).message}`);
    }
  }

  async startRealTimeSession(request: RealTimeRequest): Promise<string> {
    if (!this.initialized) {
      throw new Error("AI service not initialized. Call initialize() first.");
    }

    if (!this.config.enableRealTime) {
      throw new Error("Real-time features are disabled");
    }

    try {
      const session = await this.realTimeService.startSession(request.mode, {
        onMessage: (message: any) => {
          request.onResponse?.(message.content);
        },
        onError: (error: Error) => {
          // Log real-time session errors as they affect user experience
          console.error("Real-time session error:", error);
        },
        onAudioResponse: (audioData: ArrayBuffer) => {
          request.onMediaData?.(audioData);
        },
      });

      const sessionId = session.id;

      // Send initial message if provided
      if (request.message) {
        await this.realTimeService.sendMessage(request.message);
      }

      return sessionId;
    } catch (_error) {
      // Log real-time session failures as they are critical
      console.error("Real-time session failed:", error);
      throw new Error(`Real-time session failed: ${(error as Error).message}`);
    }
  }

  async stopRealTimeSession(_sessionId: string): Promise<void> {
    try {
      await this.realTimeService.stopSession();
    } catch (_error) {
      // Log cleanup failures for debugging
      console.error("Failed to stop real-time session:", error);
    }
  }


  async analyzeResume(
    resumeContent: string,
    jobDescription?: string,
  ): Promise<AIResponse> {
    const context = jobDescription
      ? `Analyze this resume against the job description: ${jobDescription}`
      : "Analyze this resume and provide feedback on strengths, weaknesses, and suggestions for improvement.";

    return this.chat({
      message: resumeContent,
      context,
      type: "analysis",
    });
  }

  async parseResume(resumeText: string): Promise<any> {
    if (!resumeText || typeof resumeText !== "string") {
      throw new Error("Invalid resume text");
    }

    const prompt = `Parse the following resume text into a clean JSON object.
Only return JSON. If a field is missing, use sensible defaults or empty arrays.

Resume Text:\n${resumeText}\n
Return JSON with this structure:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "experience": [
    { "title": "", "company": "", "startDate": "", "endDate": "", "description": "" }
  ],
  "education": [
    { "degree": "", "institution": "", "year": "", "gpa": "" }
  ],
  "skills": [ { "name": "" } ],
  "projects": [],
  "achievements": [],
  "certifications": []
}`;

    const response = await this.chat({
      message: prompt,
      type: "analysis",
    });

    if (!jsonMatch) {
      throw new Error("Failed to parse resume: no JSON returned");
    }
    // Normalize a bit to match UI expectations
    parsed.skills = Array.isArray(parsed.skills)
      ? parsed.skills.map((s: any) => (typeof s === "string" ? { name: s } : s))
      : [];
    return parsed;
  }

  async tailorDocuments(
    resumeData: any,
    coverLetterData: any,
    jobDescription: string,
  ): Promise<{ resume: any; coverLetter: any }> {
    if (!jobDescription?.trim()) {
      throw new Error("Job description is required");
    }

    // Analyze job
    const analysis =
      await jobPostingAnalysisService.analyzeJobPostingText(jobDescription);
    if (!analysis.success || !analysis.analysis) {
      throw new Error(analysis.error || "Failed to analyze job description");
    }

    // Tailor resume
    const tailoring = await aiResumeTargetingService.tailorResumeToJob(
      resumeData,
      analysis.analysis,
      {
        focusAreas: [
          "ats_optimization",
          "keyword_density",
          "skill_highlighting",
        ],
        aggressiveness: "moderate",
      },
    );

    const tailoredResume =
      tailoring.success && tailoring.tailoredResume
        ? this.applyTailoredSectionsToResume(
            resumeData,
            tailoring.tailoredResume.sections,
          )
        : resumeData;

    // Generate a fresh cover letter body from tailored resume and job
    const resumeText = JSON.stringify(tailoredResume);
    const clResp = await this.generateCoverLetter(resumeText, jobDescription);
    const updatedCover = {
      ...coverLetterData,
      content: {
        ...(coverLetterData?.content || {}),
        body: clResp.content || (coverLetterData?.content?.body ?? ""),
      },
    };

    return { resume: tailoredResume, coverLetter: updatedCover };
  }

  // Helper: merge tailored sections back into our simple resumeData shape
  private applyTailoredSectionsToResume(current: any, sections: any[]): any {
    const next = { ...current };
    for (const sec of sections || []) {
      switch (sec.type) {
        case "summary":
          next.summary =
            sec.tailoredContent?.text || sec.tailoredContent || next.summary;
          break;
        case "skills":
          if (Array.isArray(sec.tailoredContent)) {
            next.skills = sec.tailoredContent.map((s: any) =>
              typeof s === "string" ? { name: s } : s,
            );
          }
          break;
        case "experience":
          if (Array.isArray(sec.tailoredContent)) {
            next.experience = sec.tailoredContent;
          }
          break;
        default:
          break;
      }
    }
    return next;
  }

  async generateCoverLetter(
    resumeOrContext: any,
    maybeJobDescription?: string,
    maybeCompanyInfo?: string,
  ): Promise<AIResponse> {
    let resumeContent: string;
    let jobDescription: string;
    let companyInfo: string | undefined;

    if (
      typeof resumeOrContext === "object" &&
      resumeOrContext !== null &&
      typeof maybeJobDescription === "undefined"
    ) {
      resumeContent = String(
        resumeOrContext?.resumeContent || resumeOrContext?.resume || "",
      );
      jobDescription = String(
        resumeOrContext?.jobDescription || resumeOrContext?.job || "",
      );
      companyInfo = resumeOrContext?.companyInfo || resumeOrContext?.company;
    } else {
      resumeContent = String(resumeOrContext ?? "");
      jobDescription = String(maybeJobDescription ?? "");
      companyInfo = maybeCompanyInfo;
    }

    // Pull personal info snapshot if available
    let personalInfo = "";
    try {
      // dynamic import to avoid circulars in some build targets
      const { useAppStore } = await import("@/stores/app");
      const store = useAppStore();
      const pi = store?.user?.personalInfo || {};
      personalInfo = `\nCandidate Info: ${JSON.stringify({
        name: pi.name,
        location: pi.location,
        currentRole: pi.currentRole,
        currentCompany: pi.currentCompany,
        yearsExperience: pi.yearsExperience,
        links: {
          linkedIn: pi.linkedIn,
          github: pi.github,
          portfolio: pi.portfolio,
        },
      })}`;
    } catch {}

    const context = `Generate a professional cover letter based on:
Resume: ${resumeContent}
Job Description: ${jobDescription}
${companyInfo ? `Company Info: ${companyInfo}` : ""}${personalInfo}

Make it personalized, professional, and highlight relevant skills.`;

    return this.chat({
      message: "Generate a cover letter",
      context,
      type: "generation",
    });
  }

  async generateInterviewQuestions(
    jobDescription: string,
    difficulty: "junior" | "mid" | "senior" = "mid",
  ): Promise<AIResponse> {
    const context = `Generate ${difficulty}-level interview questions for this job:
${jobDescription}


    return this.chat({
      message: "Generate interview questions",
      context,
      type: "generation",
    });
  }

  async analyzeGamingSkills(
    gameTitle: string,
    gameAchievements: string[],
    targetJobRole: string,
  ): Promise<AIResponse> {
    const context = `Analyze how gaming skills from "${gameTitle}" relate to "${targetJobRole}":
Achievements: ${gameAchievements.join(", ")}

Identify transferable skills, leadership qualities, problem-solving abilities, and professional relevance.`;

    return this.chat({
      message: "Analyze gaming skills for job relevance",
      context,
      type: "analysis",
    });
  }


  async getGamingJobRecommendations(
    userSkills: string[],
    gamingExperience: Record<string, any>,
    preferences: Record<string, any>,
  ): Promise<AIResponse> {
    const context = `Gaming Professional Profile:
Skills: ${userSkills.join(", ")}
Gaming Experience: ${JSON.stringify(gamingExperience)}
Studio Preferences: ${JSON.stringify(preferences)}

You are NAVI, an AI career assistant for gaming professionals. Analyze this profile and recommend:

Focus on gaming industry insights, studio culture fit, and career progression.`;

    return this.chat({
      message: "Recommend gaming career opportunities and growth paths",
      context,
      type: "analysis",
    });
  }

  async analyzeGamingStudio(
    studioName: string,
    games: string[],
    targetRole: string,
  ): Promise<AIResponse> {
    const context = `Gaming Studio Analysis:
Studio: ${studioName}
Notable Games: ${games.join(", ")}
Target Role: ${targetRole}

Analyze the gaming studio's culture, tech stack, and provide insights for someone applying to this role. Include:

    return this.chat({
      message: "Analyze this gaming studio and provide career insights",
      context,
      type: "analysis",
    });
  }

  async analyzeGamingResume(
    resumeContent: string,
    targetStudio?: string,
  ): Promise<AIResponse> {
    const context = `Gaming Resume Analysis:
${targetStudio ? `Target Studio: ${targetStudio}` : ""}

Resume Content:
${resumeContent}

As NAVI, an AI career assistant for gaming professionals, provide:

Focus on gaming industry standards and what gaming studios look for.`;

    return this.chat({
      message:
        "Analyze this gaming resume and provide improvement recommendations",
      context,
      type: "analysis",
    });
  }

  async prepareGamingInterview(
    studioName: string,
    role: string,
    userBackground: Record<string, any>,
  ): Promise<AIResponse> {
    const context = `Gaming Interview Preparation:
Studio: ${studioName}
Role: ${role}
Candidate Background: ${JSON.stringify(userBackground)}

As NAVI, prepare this gaming professional for their interview. Include:

Make it specific to gaming industry interviews and this particular studio.`;

    return this.chat({
      message: "Help me prepare for this gaming industry interview",
      context,
      type: "analysis",
    });
  }

  async generateGamingCoverLetter(
    jobDescription: string,
    userProfile: Record<string, any>,
    studioInfo?: Record<string, any>,
  ): Promise<AIResponse> {
    const context = `Gaming Cover Letter Generation:
Job Description: ${jobDescription}
User Profile: ${JSON.stringify(userProfile)}
${studioInfo ? `Studio Info: ${JSON.stringify(studioInfo)}` : ""}

Create a compelling cover letter for this gaming industry position. Include:

Keep it professional but show gaming enthusiasm and industry understanding.`;

    return this.chat({
      message: "Generate a gaming industry cover letter",
      context,
      type: "generation",
    });
  }

  async getJobRecommendations(
    userSkills: string[],
    preferences: Record<string, any>,
  ): Promise<AIResponse> {
    // Redirect to gaming-focused method for consistency
    return this.getGamingJobRecommendations(userSkills, {}, preferences);
  }


  private async callProvider(
    provider: string,
    request: AIRequest,
  ): Promise<AIResponse> {
    switch (provider) {
      case "google":
        try {
          const response = await Promise.race([
            canonicalAIClient.generateText(
              request.message,
              request.context || "",
              {
                timeout: this.config.timeoutMs,
              },
            ),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Request timeout")),
                this.config.timeoutMs,
              ),
            ),
          ]);

          return {
            content: response,
            provider: "google",
            timestamp: new Date(),
            tokensUsed: this.estimateTokens(request.message + response),
            conversationId: request.sessionId,
          };
        } catch (_error) {
          throw new Error(`Google AI failed: ${(error as Error).message}`);
        }

      case "openai":
        return await this.callOpenAIProvider(request);

      case "anthropic":
        return await this.callAnthropicProvider(request);

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async loadConversationContext(
    sessionId: string,
  ): Promise<ChatMessage[]> {
    try {
      const chatHistory =
        await databaseService.findChatHistoryBySession(sessionId);
      const allMessages: ChatMessage[] = [];

      chatHistory.forEach((session) => {
        allMessages.push(...session.messages);
      });

      // Sort by timestamp and limit to max context length
      allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Estimate token usage and trim if necessary
      const contextMessages: ChatMessage[] = [];

        const messageTokens = this.estimateTokens(allMessages[i].content);
        if (totalTokens + messageTokens > this.config.maxContextLength) {
          break;
        }
        totalTokens += messageTokens;
        contextMessages.unshift(allMessages[i]);
      }

      return contextMessages;
    } catch (_error) {
      // Log context loading failures for debugging
      console.warn("Failed to load conversation context:", error);
      return [];
    }
  }

  private buildContext(
    messages: ChatMessage[],
    additionalContext?: string,
  ): string {
    let context = "";

    if (additionalContext) {
      context += `Context: ${additionalContext}\n\n`;
    }

      context += "Previous conversation:\n";
      messages.forEach((message) => {
        context += `${message.role}: ${message.content}\n`;
      });
      context += "\n";
    }

    return context;
  }

  private async saveToHistory(
    request: AIRequest,
    response: AIResponse,
  ): Promise<void> {
    try {
      if (!request.userId || !request.sessionId) return;

      const userMessage: ChatMessage = {
        id: this.generateId(),
        role: "user",
        content: request.message,
        timestamp: new Date(),
        metadata: request.metadata,
      };

      const assistantMessage: ChatMessage = {
        id: this.generateId(),
        role: "assistant",
        content: response.content,
        timestamp: response.timestamp,
        metadata: {
          provider: response.provider,
          tokensUsed: response.tokensUsed,
          confidence: response.confidence,
          ...response.metadata,
        },
      };

      const chatHistory: ChatHistory = {
        id: this.generateId(),
        userId: request.userId,
        sessionId: request.sessionId,
        type: request.type === "chat" ? "text" : "text", // Default to text for now
        messages: [userMessage, assistantMessage],
        context: request.context,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await databaseService.saveChatHistory(chatHistory);
    } catch (_error) {
      // Log history saving failures for debugging
      console.warn("Failed to save conversation history:", error);
    }
  }

  private estimateTokens(text: string): number {
  }

  private generateId(): string {
  }

  private async callOpenAIProvider(request: AIRequest): Promise<AIResponse> {
    try {
      // Check for OpenAI API key
      const apiKey =
        (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) ||
        localStorage.getItem("openai_api_key");
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const response = await fetch(
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: request.message,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API responded with ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        provider: "openai",
        timestamp: new Date(),
        tokensUsed: data.usage?.total_tokens,
        conversationId: request.sessionId,
        metadata: {
        },
      };
    } catch (_error) {
      throw new Error(`OpenAI provider failed: ${(error as Error).message}`);
    }
  }

  private async callAnthropicProvider(request: AIRequest): Promise<AIResponse> {
    try {
      // Check for Anthropic API key
      const apiKey =
        (typeof process !== "undefined" && process.env?.ANTHROPIC_API_KEY) ||
        localStorage.getItem("anthropic_api_key");
      if (!apiKey) {
        throw new Error("Anthropic API key not configured");
      }

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: request.message,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Anthropic API responded with ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        provider: "anthropic",
        timestamp: new Date(),
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        conversationId: request.sessionId,
        metadata: {
          stopReason: data.stop_reason,
        },
      };
    } catch (_error) {
      throw new Error(`Anthropic provider failed: ${(error as Error).message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized) return false;

      const testResponse = await this.chat({
        message: "Hello, this is a health check.",
        type: "chat",
      });

    } catch (_error) {
      // Log health check failures for debugging
      console.error("AI service health check failed:", error);
      return false;
    }
  }

  getStats(): Record<string, any> {
    return {
      initialized: this.initialized,
      primaryProvider: this.config.primaryProvider,
      realTimeEnabled: this.config.enableRealTime,
      contextPersistenceEnabled: this.config.enableContextPersistence,
    };
  }

  async shutdown(): Promise<void> {
    try {
      await this.realTimeService.stopSession();
      this.initialized = false;
      // AI service shut down successfully
    } catch (_error) {
      // Log shutdown errors for debugging
      console.error("Error shutting down AI service:", error);
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

  config?: Partial<AIServiceConfig>,
): Promise<{
  success: boolean;
  message?: string;
  model?: any;
  provider?: string;
}> {
  return aiService.initialize(_config);
}

  return aiService.chat(request);
}

  request: AIStreamRequest,
): Promise<AIStreamResponse> {
  return aiService.chatStream(request);
}

  request: RealTimeRequest,
): Promise<string> {
  return aiService.startRealTimeSession(request);
}

  return aiService.stopRealTimeSession(sessionId);
}

  message: string;
  context?: string;
  sessionId?: string;
  onChunk?: (c: string) => void;
}) {
  return aiService.realtimeChat(params as any);
}
