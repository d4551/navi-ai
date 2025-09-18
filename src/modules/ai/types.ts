// AI Types Module
// TypeScript type definitions for AI module

export interface AIContext {
  type: 'resume' | 'cover_letter' | 'job_search' | 'interview' | 'portfolio'
  content?: string
  targetJob?: JobTarget
  userProfile?: UserProfile
  metadata?: Record<string, any>
}

export interface JobTarget {
  title: string
  company?: string
  description?: string
  requirements?: string[]
  keywords?: string[]
  industry?: string
  level?: 'entry' | 'mid' | 'senior' | 'lead'
}

export interface UserProfile {
  name?: string
  email?: string
  skills?: string[]
  experience?: ExperienceEntry[]
  education?: EducationEntry[]
  projects?: ProjectEntry[]
  preferences?: UserPreferences
}

export interface ExperienceEntry {
  id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
  highlights?: string[]
  technologies?: string[]
}

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  startDate: string
  endDate?: string
  current: boolean
  gpa?: number
  relevantCourses?: string[]
}

export interface ProjectEntry {
  id: string
  title: string
  description: string
  technologies?: string[]
  url?: string
  images?: string[]
  achievements?: string[]
  type: 'personal' | 'professional' | 'academic' | 'open_source'
}

export interface UserPreferences {
  industries?: string[]
  jobTypes?: string[]
  locations?: string[]
  remoteWork?: boolean
  salaryRange?: [number, number]
  careerLevel?: string
}

export interface AIAnalysisResult {
  score: number
  suggestions: AISuggestion[]
  insights: AIInsight[]
  keywords: string[]
  improvements: string[]
  strengths: string[]
}

export interface AISuggestion {
  id: string
  type: 'content' | 'structure' | 'keyword' | 'formatting'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  originalText?: string
  suggestedText?: string
  location?: string
  reasoning: string
}

export interface AIInsight {
  type:
    | 'keyword_gap'
    | 'ats_optimization'
    | 'content_quality'
    | 'structure'
    | 'market_fit'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
}

export interface AIInterviewPrep {
  questions: InterviewQuestion[]
  persona: StudioPersona
  focusAreas: string[]
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface InterviewQuestion {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'situational' | 'cultural'
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  expectedAnswer?: string
  keyPoints?: string[]
  followUpQuestions?: string[]
}

export interface StudioPersona {
  id: string
  name: string
  company: string
  role: string
  personality: string[]
  focusAreas: string[]
  interviewStyle: string
  commonQuestions: string[]
}

export interface AIJobMatch {
  jobId: string
  matchScore: number
  reasons: string[]
  missingSkills: string[]
  strongMatches: string[]
  recommendations: string[]
  applicationStrategy?: string
}

export interface AIServiceCapabilities {
  textGeneration: boolean
  imageAnalysis: boolean
  voiceInput: boolean
  realtimeChat: boolean
  documentAnalysis: boolean
}

export interface AIServiceConfig {
  apiKey?: string
  model: string
  temperature: number
  maxTokens: number
  timeout: number
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    tokensUsed?: number
    processingTime?: number
    model?: string
  }
}

export type AIFeature =
  | 'resume_enhancement'
  | 'cover_letter_generation'
  | 'job_matching'
  | 'interview_preparation'
  | 'portfolio_optimization'
  | 'skill_analysis'
  | 'market_insights'
