import { ComputedRef } from 'vue'

export interface CompanyResearch {
  company: string
  overview: any
  culture: any
  projects: any
  position: any
  talkingPoints: any
  hooks: any
  researched_at: string
  isFallback?: boolean
}

export interface ReviewResults {
  score: number
  categoryScores: any
  strengths: any
  weaknesses: any
  suggestions: any
  atsCompliance: any
  revisionPriority: any
  reviewed_at: string
  isFallback?: boolean
}

export interface ImprovementResults {
  originalText: string
  improvedText: string
  changes: any[]
  improvements: any[]
  keywordBoosts: any[]
  improved_at: string
}

export interface Variation {
  id: string
  fullText: string
  approach: string
  generated_at: string
}

export interface GenerationHistoryEntry {
  content: string
  approach: string
  timestamp: string
  score?: number
  improvements?: any[]
  variationId?: string
}

export interface ReviewGrade {
  grade: string
  color: string
  label: string
}

export interface ImprovementSummary {
  changesCount: number
  improvements: any[]
  keywordBoosts: any[]
}

export interface UseAICoverLetterReturn {
  // State
  isGenerating: ComputedRef<boolean>
  isResearching: ComputedRef<boolean>
  isReviewing: ComputedRef<boolean>
  isImproving: ComputedRef<boolean>
  isGeneratingVariations: ComputedRef<boolean>
  isProcessing: ComputedRef<boolean>
  
  // Content
  generatedContent: ComputedRef<string>
  companyResearch: ComputedRef<CompanyResearch | null>
  reviewResults: ComputedRef<ReviewResults | null>
  improvementResults: ComputedRef<ImprovementResults | null>
  variations: ComputedRef<Variation[]>
  
  // Insights
  keyPoints: ComputedRef<any[]>
  personalizations: ComputedRef<any[]>
  suggestions: ComputedRef<any>
  error: ComputedRef<string | null>
  
  // History
  generationHistory: ComputedRef<GenerationHistoryEntry[]>
  
  // Computed
  hasGeneratedContent: ComputedRef<boolean>
  hasCompanyResearch: ComputedRef<boolean>
  hasReview: ComputedRef<boolean>
  reviewScore: ComputedRef<number>
  reviewGrade: ComputedRef<ReviewGrade>
  improvementSummary: ComputedRef<ImprovementSummary | null>
  
  // Methods
  generateFromJobDescription: (
    jobDescription: string,
    userProfile: any,
    options?: any
  ) => Promise<{ success: boolean; content?: string; keyPoints?: any[]; personalizations?: any[]; error?: string; isFallback?: boolean }>
  
  researchCompany: (
    companyName: string,
    jobTitle?: string,
    additionalContext?: string
  ) => Promise<{ success: boolean; research?: CompanyResearch; error?: string }>
  
  reviewCoverLetter: (
    coverLetterText: string,
    jobDescription: string,
    userProfile: any
  ) => Promise<{ success: boolean; score?: number; review?: ReviewResults; error?: string }>
  
  improveCoverLetter: (
    coverLetterText: string,
    improvementFocus?: any[],
    jobDescription?: string,
    userProfile?: any
  ) => Promise<{ success: boolean; improvedText?: string; changes?: any[]; improvements?: any[]; error?: string }>
  
  generateVariations: (
    baseContent: string,
    jobDescription: string,
    userProfile: any,
    count?: number
  ) => Promise<{ success: boolean; variations?: Variation[]; error?: string }>
  
  selectVariation: (variationId: string) => { success: boolean; content?: string; error?: string }
  
  clearAll: () => void
  clearReview: () => void
  clearVariations: () => void
}

export declare function useAICoverLetter(): UseAICoverLetterReturn