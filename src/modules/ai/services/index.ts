// Centralized AI Services
// Unified interface for all AI operations with error handling and retries


import { generateSmartContent, isAIClientReady } from "@/modules/ai";
import { useAppStore } from "@/stores/app";

// AI Service Types
export interface AIRequest {
  contentType: string;
  userInput: string;
  context?: Record<string, any>;
  options?: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    latency: number;
    tokens?: number;
    model?: string;
  };
}

// Centralized AI service class
export class AIService {
  private static instance: AIService;
  private retryAttempts = 3;
  private retryDelay = 1000;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Check if AI is ready
  async isReady(): Promise<boolean> {
    try {
      return await isAIClientReady();
    } catch (_error) {
      console.error("AI readiness check failed:", error);
      return false;
    }
  }

  // Generate content with retry logic
  async generateContent(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        if (!(await this.isReady())) {
          throw new Error("AI service not ready");
        }

        const result = await generateSmartContent(
          request.contentType,
          request.userInput,
          request.context || {},
          request.options || {},
        );

        return {
          success: true,
          data: result,
          metadata: {
            latency: Date.now() - startTime,
            model: "auto",
          },
        };
      } catch (_error) {
        console.warn(`AI generation attempt ${attempt} failed:`, error);

        if (attempt === this.retryAttempts) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown AI error",
            metadata: {
              latency: Date.now() - startTime,
            },
          };
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempt),
        );
      }
    }

    return {
      success: false,
      error: "Max retry attempts exceeded",
      metadata: {
        latency: Date.now() - startTime,
      },
    };
  }

  // Specialized methods for common AI operations
  async generateResumeContent(
    content: string,
    context: any = {},
  ): Promise<AIResponse> {
    // Enrich context with user profile snapshot
    try {
      const store = useAppStore();
      const pi = store?.user?.personalInfo || {};
      context = {
        ...context,
        personalInfo: {
          name: pi.name,
          email: pi.email,
          phone: pi.phone,
          location: pi.location,
          website: pi.website,
          linkedIn: pi.linkedIn,
          github: pi.github,
          portfolio: pi.portfolio,
          currentRole: pi.currentRole,
          currentCompany: pi.currentCompany,
          yearsExperience: pi.yearsExperience,
        },
      };
    } catch {}

    return this.generateContent({
      contentType: "resume",
      userInput: content,
      context,
    });
  }

  async generateCoverLetter(
    jobDescription: string,
    resumeData: any,
  ): Promise<AIResponse> {
    // Include personal info snapshot for personalization
    let enrichedContext: any = { resumeData };
    try {
      const store = useAppStore();
      const pi = store?.user?.personalInfo || {};
      enrichedContext = {
        ...enrichedContext,
        personalInfo: {
          name: pi.name,
          email: pi.email,
          phone: pi.phone,
          location: pi.location,
          website: pi.website,
          linkedIn: pi.linkedIn,
          github: pi.github,
          portfolio: pi.portfolio,
          currentRole: pi.currentRole,
          currentCompany: pi.currentCompany,
          yearsExperience: pi.yearsExperience,
        },
      };
    } catch {}

    return this.generateContent({
      contentType: "cover-letter",
      userInput: jobDescription,
      context: enrichedContext,
    });
  }

  async matchJobs(resumeData: any, jobCriteria: any): Promise<AIResponse> {
    // Provide a richer candidate profile for matching
    let enrichedCriteria: any = { jobCriteria };
    try {
      const store = useAppStore();
      const pi = store?.user?.personalInfo || {};
      enrichedCriteria = {
        ...enrichedCriteria,
        candidateProfile: {
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
        },
      };
    } catch {}

    return this.generateContent({
      contentType: "job-matching",
      userInput: JSON.stringify(resumeData),
      context: enrichedCriteria,
    });
  }

  async interviewPrep(jobTitle: string, company: string): Promise<AIResponse> {
    return this.generateContent({
      contentType: "interview-prep",
      userInput: `${jobTitle} at ${company}`,
      context: {},
    });
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();


export const generateWithRetry = (request: AIRequest) =>
  aiService.generateContent(request);
export const isAIServiceReady = () => aiService.isReady();
