// Centralized AI Types
// Single source of truth for all AI-related type definitions

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
    timestamp?: Date;
  };
}

export interface AIContext {
  userProfile?: any;
  jobData?: any;
  resumeData?: any;
  companyInfo?: any;
  gamingExperience?: any;
  targetRole?: string;
  targetIndustry?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: "google" | "openai" | "anthropic" | "local";
  capabilities: string[];
  contextWindow: number;
  costPerToken?: number;
}

export interface AIConfig {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retries: number;
}

export interface AIStreamChunk {
  text: string;
  isComplete: boolean;
  metadata?: {
    tokensUsed?: number;
    finishReason?: string;
  };
}

export interface AIConversation {
  id: string;
  messages: AIConversationMessage[];
  context: AIContext;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    latency?: number;
  };
}

// Content type enums
export type AIContentType =
  | "resume"
  | "cover-letter"
  | "job-matching"
  | "interview-prep"
  | "portfolio"
  | "skill-analysis"
  | "career-advice";

// Error types
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class AIRetryError extends AIError {
  constructor(
    message: string,
    public attempts: number,
  ) {
    super(message, "RETRY_EXHAUSTED", { attempts });
    this.name = "AIRetryError";
  }
}

export class AIInitializationError extends AIError {
  constructor(message: string) {
    super(message, "INITIALIZATION_FAILED");
    this.name = "AIInitializationError";
  }
}

// Utility types
export type AIResult<T = any> =
  | {
      success: true;
      data: T;
      metadata: AIResponse["metadata"];
    }
  | {
      success: false;
      error: string;
      metadata: AIResponse["metadata"];
    };

export type AIStreamResult = AsyncIterable<AIStreamChunk>;

// Gemini model info (single source of truth)
// Canonical GeminiModelInfo lives in '@/shared/types/ai'.
// Re-export here to maintain backwards compatibility with existing imports.
export type { GeminiModelInfo } from "@/shared/types/ai";
