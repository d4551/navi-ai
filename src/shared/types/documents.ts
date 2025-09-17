// Canonical document editing shared types (resume & cover letter)
export interface DocumentSaveMeta {
  lastSaved: string | null
  status: 'idle' | 'saving' | 'error' | 'dirty'
  error?: string
}

export interface AIGenerationState {
  generating: boolean
  improving: boolean
  reviewing: boolean
  lastGenerationTs?: string
}

export interface ResumeData {
  personalInfo: Record<string, any>
  experience: any[]
  education: any[]
  skills: string[]
  projects?: any[]
  templates?: any
}

export interface CoverLetterData {
  jobInfo: Record<string, any>
  personalInfo: Record<string, any>
  companyResearch?: Record<string, any>
  sections: Record<string, string>
  template?: string
}

export type DocumentKind = 'resume' | 'coverLetter'

export interface DocumentAction {
  key: string
  icon?: string
  text?: string
  label?: string
  variant?: string
  requiresApiKey?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}
