
import type { AudioDevice } from "./ai";

// Re-export AudioDevice for backward compatibility
export type { AudioDevice };

export interface GameStudio {
  id: string;
  name: string;
  logo: string;
  description: string;
  culture: {
    values: string[];
    workStyle: string;
    environment: string;
  };
  games: string[];
  technologies: string[];
  commonRoles: string[];
  interviewStyle: string;
  headquarters: string;
  size: string;
  founded: number;
  publiclyTraded: boolean;
  category?:
    | "AAA"
    | "Indie"
    | "Mobile"
    | "VR/AR"
    | "Platform"
    | "Esports"
    | "International";
  region?: string;
  remoteWork?: boolean;
  companySize?: "Startup" | "Small" | "Medium" | "Large" | "Enterprise";
  // Enhanced details for modals
  history?: string;
  recentNews?: string[];
  benefits?: string[];
  workLifeBalance?: string;
  careerGrowth?: string;
  salaryRange?: {
    junior?: string;
    mid?: string;
    senior?: string;
  };
  // External aggregated stats (CheapShark, RAWG, Steam, etc.)
  externalStats?: {
    cheapestGamePriceUsd?: number;
    cheapestGameTitle?: string;
    dealsCount?: number;
    topPublishers?: string[];
    rawgPublisherId?: number;
    steamAppSample?: { appId: number; name: string }[];
    lastUpdated?: string; // ISO timestamp
    sources?: string[]; // which APIs contributed
  };
}

export interface InterviewConfig {
  roleType: string;
  roleCategory?: string;
  experienceLevel: string;
  focusAreas: string[];
  duration: number;
  questionCount: number;
  includeTechnical: boolean;
  includeBehavioral: boolean;
  includeStudioSpecific: boolean;
  enableVoiceMode?: boolean;
  enableRealTimeAnalysis?: boolean;
  technologies?: string[];
  studioCategories?: string[];
}

export interface InterviewQuestion {
  id: string;
  type: "behavioral" | "technical" | "studio-specific" | "intro" | "closing";
  question: string;
  followUps: string[];
  expectedDuration: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  studioSpecific?: boolean;
  roleSpecific?: string[];
}

export interface InterviewerPersona {
  name: string;
  role: string;
  studioName: string;
  background: string;
  style: string;
  experience: string;
  avatar?: string;
}

export interface InterviewSession {
  id: string;
  studioId: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  currentQuestion?: InterviewQuestion;
  totalQuestions: number;
  startTime: number;
  endTime?: number;
  status: "preparing" | "active" | "paused" | "completed" | "cancelled";
  responses: InterviewResponse[];
  finalAnalysis?: InterviewAnalysis;
  interviewerPersona?: InterviewerPersona;
}

export interface InterviewResponse {
  questionId: string;
  transcript: string;
  audioBlob?: Blob;
  duration: number;
  timestamp: number;
  confidence: number;
  aiAnalysis?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

// AudioDevice moved to ai.ts to avoid duplication

export interface VoiceSettings {
  microphoneId?: string;
  speakerId?: string;
  voiceId?: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

export interface AIAnalysisRequest {
  sessionId: string;
  question: string;
  response: string;
  roleType: string;
  studioContext: GameStudio;
}

export interface InterviewAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  feedback?: string;
}

export interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  strongestAreas: string[];
  improvementAreas: string[];
  totalTimeSpent: number;
  favoriteStudios: string[];
  recentSessions: InterviewSession[];
}

// IPC Event types for secure communication
export interface IPCEvents {
  "interview-start": { config: InterviewConfig; studioId: string };
  "interview-pause": { sessionId: string };
  "interview-resume": { sessionId: string };
  "interview-complete": { sessionId: string };
  "interview-cancel": { sessionId: string };
  "question-next": { sessionId: string };
  "response-submit": { sessionId: string; response: InterviewResponse };
  "ai-analyze": AIAnalysisRequest;
  "stats-get": void;
  "history-get": { limit?: number };
  "audio-start-recording": { deviceId?: string };
  "audio-stop-recording": void;
  "audio-play": { audioData: ArrayBuffer };
  "audio-stop": void;
}

export interface SearchFilters {
  roleCategories?: string[];
  technologies?: string[];
  studioCategories?: string[];
  experienceLevels?: string[];
  regions?: string[];
  companySizes?: string[];
  publiclyTraded?: boolean;
  remoteWork?: boolean;
  founded?: { min?: number; max?: number };
}

export interface SearchQuery {
  query?: string;
  filters: SearchFilters;
  sortBy?: "name" | "founded" | "size" | "relevance";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult {
  studios: GameStudio[];
  roles: string[];
  totalCount: number;
  appliedFilters: SearchFilters;
}

export interface AutocompleteOption {
  value: string;
  label: string;
  category: "studio" | "role" | "technology" | "location" | "skill";
  description?: string;
}

// Enhanced role information
export interface RoleInfo {
  name: string;
  category: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  averageSalary?: { min: number; max: number; currency: string };
  demandLevel?: "low" | "medium" | "high";
  careerPath: string[];
}

// Studio comparison interface
export interface StudioComparison {
  studios: GameStudio[];
  comparisonFields: string[];
}
