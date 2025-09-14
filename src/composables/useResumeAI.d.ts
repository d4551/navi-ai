import type { Ref } from 'vue'

export interface ResumePersonalInfo {
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  summary: string
  targetRole?: string
}

export interface ResumeExperienceItem {
  title: string
  company?: string
  description?: string
  [key: string]: any
}

export interface ResumeSkills {
  technical: string[]
  soft: string[]
}

export interface ResumeData {
  personalInfo: ResumePersonalInfo
  additionalExperience: any[]
  experience: ResumeExperienceItem[]
  education: any[]
  skills: ResumeSkills
  portfolio: Array<{ title: string; description: string; url: string; type: string }>
}

export interface UseResumeAIOptions {
  store: any
  toast?: (_msg: string) => void
}

export interface UseResumeAIReturn {
  skillSuggestions: Ref<string[]>
  resumeScore: Ref<any>
  autoFillSuggestions: Ref<Record<string, any>>
  getSkillSuggestions: (_skills: ResumeSkills, _additionalExperience: any[], _targetRole?: string) => Promise<void>
  scoreResume: (_resumeData: any, _targetRole?: string) => Promise<void>
  optimizeSection: (_sectionType: string, _sectionContent: any, _targetRole?: string) => Promise<string | null>
  getAutoFill: (_fieldType: string, _userContext: any, _currentValue?: string) => Promise<void>
}

export function useResumeAI(_options: UseResumeAIOptions): UseResumeAIReturn
