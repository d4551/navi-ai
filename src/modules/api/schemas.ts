// API Schemas Module
// Centralized schema definitions for all API endpoints

// Job Search Schemas
export interface JobSearchRequest {
  query?: string;
  location?: string;
  remote?: boolean;
  jobType?: "full-time" | "part-time" | "contract" | "internship";
  experience?: "entry" | "mid" | "senior" | "lead";
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  sources?: string[];
  limit?: number;
  offset?: number;
}

export interface JobSearchResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  sources: string[];
  searchTime: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  hybrid?: boolean;
  jobType: "full-time" | "part-time" | "contract" | "internship";
  experience?: string;
  salary?: string | SalaryRange;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  source: string;
  sourceUrl?: string;
  applicationUrl?: string;
  postedDate: Date;
  expiryDate?: Date;
  matchScore?: number;
  gamingStudio?: NormalizedStudio;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency?: string;
  frequency?: "yearly" | "monthly" | "hourly";
}

// Resume Schemas
export interface ResumeExportRequest {
  format: "pdf" | "docx" | "html" | "json";
  template?: string;
  sections?: string[];
}

export interface ResumeExportResponse {
  format: string;
  data: string | ArrayBuffer;
  filename: string;
  contentType: string;
}

// Portfolio Schemas
export interface PortfolioExportRequest {
  format: "pdf" | "html" | "json";
  projects?: string[];
  includeImages?: boolean;
}

export interface PortfolioExportResponse {
  format: string;
  data: string | ArrayBuffer;
  filename: string;
  contentType: string;
}

// AI Model Schemas
export interface AIModelRequest {
  provider: "gemini" | "openai" | "anthropic";
  model: string;
  prompt: string;
  context?: Record<string, any>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
  };
}

export interface AIModelResponse {
  provider: string;
  model: string;
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  processingTime: number;
}

// Job Matching Schemas
export interface JobMatchRequest {
  job: Job;
  query: string;
  userProfile: Record<string, any>;
}

export interface JobMatchResponse {
  score: number;
  reasoning: string;
  keyMatches: string[];
  gaps: string[];
  recommendations: string[];
}

// Resume Scoring Schemas
export interface ResumeScoreRequest {
  resume: Record<string, any>;
  jobDescription: string;
  jobRequirements?: string[];
}

export interface ResumeScoreResponse {
  overallScore: number;
  categoryScores: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

// Cover Letter Generation Schemas
export interface CoverLetterRequest {
  job: Job;
  resume: Record<string, any>;
  tone?: "professional" | "casual" | "enthusiastic";
  length?: "short" | "medium" | "long";
  customPoints?: string[];
}

export interface CoverLetterResponse {
  content: string;
  subject?: string;
  keyPoints: string[];
  personalizations: string[];
}

// Interview Preparation Schemas
export interface InterviewPrepRequest {
  job: Job;
  resume: Record<string, any>;
  interviewType?: "phone" | "video" | "in-person" | "technical";
  focus?: "behavioral" | "technical" | "mixed";
}

export interface InterviewPrepResponse {
  commonQuestions: {
    question: string;
    suggestedAnswer: string;
    keyPoints: string[];
  }[];
  technicalTopics?: string[];
  companyResearch: {
    keyFacts: string[];
    recentNews?: string[];
    culture: string[];
  };
  questionsToAsk: string[];
}

// Provider Health Schemas
export interface ProviderHealthRequest {
  providers?: string[];
  timeout?: number;
}

export interface ProviderHealthResponse {
  [providerName: string]: {
    healthy: boolean;
    responseTime?: number;
    error?: string;
    lastChecked: Date;
  };
}

// Studio/Company Schemas
export interface NormalizedStudio {
  id: string;
  name: string;
  normalized: boolean;
  logo?: string;
  logoFallback?: string;
  logoColor?: string;
  headquarters?: string;
  size?: string;
  founded?: number;
  publiclyTraded?: boolean;
  description?: string;
  culture?: {
    workLifeBalance?: number;
    diversity?: number;
    innovation?: number;
    growthOpportunity?: number;
  };
  games?: string[];
  technologies?: string[];
  commonRoles?: string[];
  interviewStyle?: string;
}

// Error Schemas
export interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    version: string;
    requestId: string;
    processingTime: number;
  };
}
