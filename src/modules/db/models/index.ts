/**
 * DATABASE MODELS
 * ===============
 *
 * Centralized data models for all persistent entities
 * These models are used by queries, repositories, and services
 */

// Core data models for database entities
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  version?: number
}

export interface UserProfile extends BaseEntity {
  name: string
  email: string
  phone?: string
  location?: string
  title?: string
  bio?: string
  avatar?: string
  preferences?: UserPreferences
  stats?: UserStats
}

export interface UserStats {
  level: number
  experience: number
  skillsAssessed: number
  jobsApplied: number
  interviewsCompleted: number
  achievementsUnlocked: number
  streakDays: number
  lastActivity: Date
}

export interface Resume extends BaseEntity {
  userId: string
  title: string
  content: ResumeContent
  template: string
  isPublic: boolean
}

export interface ResumeContent {
  personalInfo: {
    name: string
    email: string
    phone?: string
    location?: string
    website?: string
    linkedin?: string
    github?: string
  }
  summary?: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillItem[]
  projects: ProjectItem[]
  achievements: AchievementItem[]
}

export interface ExperienceItem {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
  technologies: string[]
  isCurrent: boolean
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  gpa?: string
  description?: string
}

export interface SkillItem {
  id: string
  name: string
  category: 'technical' | 'soft' | 'gaming' | 'leadership'
  level: number // 0-100
  verified: boolean
  endorsements: number
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  github?: string
  featured: boolean
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  date: string
  category: 'gaming' | 'professional' | 'education' | 'volunteer'
}

export interface CoverLetter extends BaseEntity {
  userId: string
  resumeId?: string
  jobId?: string
  title: string
  content: string
  company: string
  jobTitle: string
  isPublic: boolean
}

export interface Portfolio extends BaseEntity {
  userId: string
  title: string
  description: string
  items: PortfolioItem[]
  template: string
  isPublic: boolean
  url?: string
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  type: 'project' | 'achievement' | 'certification' | 'publication'
  content: PortfolioItemContent
  media?: string[]
  tags: string[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioItemContent {
  summary: string
  details?: string
  technologies?: string[]
  url?: string
  github?: string
  achievements?: string[]
  metrics?: Record<string, number>
}

export interface JobSearch extends BaseEntity {
  userId: string
  criteria: JobSearchCriteria
  results: JobSearchResult[]
  isActive: boolean
}

export interface JobSearchCriteria {
  keywords: string[]
  location: string
  remote: boolean
  salary?: {
    min: number
    max: number
    currency: string
  }
  experienceLevel: string[]
  companySize?: string[]
  industries: string[]
  gamingFocus: boolean
}

export interface JobSearchResult {
  jobId: string
  title: string
  company: string
  location: string
  matchScore: number
  applied: boolean
  saved: boolean
  notes?: string
  appliedAt?: Date
}

export interface InterviewSession extends BaseEntity {
  userId: string
  jobId?: string
  type: 'mock' | 'practice' | 'real'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  questions: InterviewQuestion[]
  responses: InterviewResponse[]
  feedback?: InterviewFeedback
  scheduledAt?: Date
  completedAt?: Date
}

export interface InterviewQuestion {
  id: string
  question: string
  type: 'technical' | 'behavioral' | 'gaming-specific'
  difficulty: 'easy' | 'medium' | 'hard'
  expectedDuration: number // in seconds
  hints?: string[]
}

export interface InterviewResponse {
  questionId: string
  response: string
  audioUrl?: string
  duration: number
  transcribed: boolean
  score?: number
  feedback?: string
}

export interface InterviewFeedback {
  overallScore: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  generatedAt: Date
}

export interface UserPreferences extends BaseEntity {
  userId: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  ai: AISettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  jobAlerts: boolean
  interviewReminders: boolean
  achievements: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections'
  dataSharing: boolean
  analytics: boolean
  allowAnalytics: boolean
}

export interface AISettings {
  model: string
  temperature: number
  autoSave: boolean
  provider: 'google' | 'openai' | 'anthropic'
}

// Utility functions for model validation
export const validateUserProfile = (profile: Partial<UserProfile>): boolean => {
  return !!(profile.name && profile.email)
}

export const validateResume = (resume: Partial<Resume>): boolean => {
  return !!(resume.title && resume.content && resume.userId)
}

export const validateCoverLetter = (letter: Partial<CoverLetter>): boolean => {
  return !!(
    letter.title &&
    letter.content &&
    letter.company &&
    letter.jobTitle &&
    letter.userId
  )
}

export const validatePortfolio = (portfolio: Partial<Portfolio>): boolean => {
  return !!(portfolio.title && portfolio.description && portfolio.userId)
}

export const validateJobSearch = (jobSearch: Partial<JobSearch>): boolean => {
  return !!(jobSearch.userId && jobSearch.criteria)
}

export const validateInterviewSession = (
  session: Partial<InterviewSession>
): boolean => {
  return !!(session.userId && session.type)
}

export const validateUserPreferences = (
  preferences: Partial<UserPreferences>
): boolean => {
  return !!preferences.userId
}

// Additional utility types
export type ValidationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Safe crypto implementation for both browser and Node.js
const getCrypto = () => {
  if (typeof crypto !== 'undefined') {
    return crypto
  }
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto
  }
  // Fallback for environments without crypto
  return {
    randomUUID: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }),
  }
}

// Model creation helpers
export const createBaseEntity = (): Pick<
  BaseEntity,
  'id' | 'createdAt' | 'updatedAt' | 'version'
> => ({
  id: getCrypto().randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
})

// Default values for complex models
export const createDefaultUserPreferences = (
  userId: string
): UserPreferences => ({
  ...createBaseEntity(),
  userId,
  theme: 'auto',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    jobAlerts: true,
    interviewReminders: true,
    achievements: true,
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false,
    analytics: false,
    allowAnalytics: false,
  },
  ai: {
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    autoSave: true,
    provider: 'google',
  },
})

export const createDefaultUserStats = (): UserStats => ({
  level: 1,
  experience: 0,
  skillsAssessed: 0,
  jobsApplied: 0,
  interviewsCompleted: 0,
  achievementsUnlocked: 0,
  streakDays: 0,
  lastActivity: new Date(),
})
