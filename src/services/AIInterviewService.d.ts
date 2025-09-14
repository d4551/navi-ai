declare module '@/services/AIInterviewService' {
  export interface StartInterviewConfig {
    type?: 'studio' | 'practice' | string
    studioId?: string
    studioName?: string
    roleType: string
    experienceLevel: string
    duration: number
    questionCount: number
    includeBehavioral?: boolean
    includeTechnical?: boolean
    includeStudioSpecific?: boolean
    persona?: {
      id?: string
      name?: string
      archetype?: string
      tone?: string
      focusAreas?: string[]
    } | null
  }

  export interface InterviewSessionResult {
    success: boolean
    session: { id: string; [key: string]: any }
    error?: string
  }

  export const aiInterviewService: {
    startInterviewSession: (_config: StartInterviewConfig) => Promise<InterviewSessionResult>
    getInterviewStats?: () => Promise<any>
    getInterviewHistory?: (_limit?: number) => Promise<any>
  }

  const _default: typeof aiInterviewService
  export default _default
}
