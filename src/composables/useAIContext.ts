import {
  reactive,
  readonly,
  computed,
  onUnmounted,
  getCurrentInstance,
} from 'vue'
import { logger } from '@/shared/utils/logger'

// Types for AI Context System
interface AIContextAction {
  id: string
  type: 'suggestion' | 'correction' | 'enhancement' | 'analysis' | 'generation'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  context: Record<string, any>
  suggested: boolean
  createdAt: Date
  appliedAt?: Date
  dismissed?: boolean
}

interface AITargetEntity {
  type:
    | 'resume'
    | 'cover-letter'
    | 'job'
    | 'profile'
    | 'interview'
    | 'portfolio'
  id: string
  data: Record<string, any>
  metadata: Record<string, any>
}

interface AIProcessingContext {
  entityId: string
  entityType:
    | 'resume'
    | 'cover-letter'
    | 'job'
    | 'profile'
    | 'interview'
    | 'portfolio'
  userId: string | null
  sessionId: string
  targetJob?: {
    title: string
    company: string
    description: string
  }
  userProfile?: Record<string, any>
  userSettings?: Record<string, any>
  previousActions: string[]
  entities: AITargetEntity[]
  timestamp: Date
}

interface AIContextState {
  currentContext: AIProcessingContext | null
  actions: AIContextAction[]
  isProcessing: boolean
  lastAnalysis: any | null
  suggestions: AIContextAction[]
  error: string | null
  sessionStats: {
    totalActions: number
    appliedActions: number
    dismissedActions: number
    averageResponseTime: number
  }
}

interface AIContextOptions {
  autoGenerate?: boolean
  contextAware?: boolean
  realTimeUpdates?: boolean
  cacheSuggestions?: boolean
  enableNotifications?: boolean
}

// Reactive AI Context State
const state = reactive<AIContextState>({
  currentContext: null,
  actions: [],
  isProcessing: false,
  lastAnalysis: null,
  suggestions: [],
  error: null,
  sessionStats: {
    totalActions: 0,
    appliedActions: 0,
    dismissedActions: 0,
    averageResponseTime: 0,
  },
})

// Context observers - components can subscribe to changes
const observers = new Set<(context: AIProcessingContext) => void>()
let pollingInterval: number | null = null

export function useAIContext(options: AIContextOptions = {}) {
  const {
    autoGenerate = true,
    contextAware: _contextAware = true,
    realTimeUpdates = false,
    cacheSuggestions: _cacheSuggestions = true,
    enableNotifications = false,
  } = options

  // Initialize context for an entity
  const initializeContext = async (
    entityType: string,
    entityId: string,
    targetJob?: any
  ): Promise<void> => {
    try {
      const context: AIProcessingContext = {
        entityId,
        entityType: entityType as any,
        userId: null, // Would be set from auth
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        targetJob: targetJob
          ? {
              title: targetJob.title,
              company: targetJob.company,
              description: targetJob.description,
            }
          : undefined,
        entities: [],
        previousActions: [],
        timestamp: new Date(),
      }

      state.currentContext = context
      state.error = null
      notifyObservers()

      // Generate initial suggestions if auto-enabled
      if (autoGenerate) {
        await generateInitialSuggestions(context)
      }

      // Start real-time updates if enabled
      if (realTimeUpdates) {
        startContextPolling()
      }

      logger.info('AI Context initialized:', context)
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error)
      logger.error('Failed to initialize AI context:', error)
      throw error
    }
  }

  // Update context data
  const updateContextData = async (
    data: Partial<Record<string, any>>,
    entityId?: string
  ): Promise<void> => {
    if (!state.currentContext) {
      throw new Error('No active AI context')
    }

    const targetEntityId = entityId || state.currentContext.entityId
    const targetEntity = state.currentContext.entities.find(
      e => e.id === targetEntityId
    )

    if (targetEntity) {
      Object.assign(targetEntity.data, data)
      targetEntity.metadata.lastUpdated = new Date()

      if (autoGenerate) {
        await generateContextActions(state.currentContext)
      }
    }

    notifyObservers()
  }

  // Generate contextually relevant AI suggestions
  const generateContextActions = async (
    context: AIProcessingContext
  ): Promise<AIContextAction[]> => {
    const startTime = Date.now()

    try {
      state.isProcessing = true
      const newActions: AIContextAction[] = []

      // Resume-specific suggestions
      if (context.entityType === 'resume') {
        newActions.push(...(await generateResumeSuggestions(context)))
      }

      // Cover letter suggestions
      else if (context.entityType === 'cover-letter') {
        newActions.push(...(await generateCoverLetterSuggestions(context)))
      }

      // Job-specific suggestions
      else if (context.entityType === 'job') {
        newActions.push(...(await generateJobSuggestions(context)))
      }

      // Interview preparation suggestions
      else if (context.entityType === 'interview') {
        newActions.push(...(await generateInterviewSuggestions(context)))
      }

      // Add to state and calculate response time
      const responseTime = Date.now() - startTime
      const filteredActions = newActions.filter(
        action => !state.actions.some(existing => existing.id === action.id)
      )

      state.actions.push(...filteredActions)
      state.sessionStats.totalActions += filteredActions.length
      state.sessionStats.averageResponseTime =
        calculateAverageResponseTime(responseTime)

      if (enableNotifications && filteredActions.length > 0) {
        notifyNewActions(filteredActions)
      }

      return filteredActions
    } catch (error) {
      logger.error('Failed to generate context actions:', error)
      throw error
    } finally {
      state.isProcessing = false
    }
  }

  // Generate resume-specific suggestions
  const generateResumeSuggestions = async (
    context: AIProcessingContext
  ): Promise<AIContextAction[]> => {
    const actions: AIContextAction[] = []
    const resumeData = context.entities.find(e => e.type === 'resume')?.data

    if (!resumeData) return actions

    // Keyword optimization suggestion
    if (context.targetJob?.description) {
      const missingKeywords = await analyzeKeywordGaps(
        resumeData,
        context.targetJob.description
      )
      if (missingKeywords.length > 0) {
        actions.push({
          id: `keyword_opt_${Date.now()}`,
          type: 'enhancement',
          title: 'Optimize Keywords',
          description: `${missingKeywords.length} key terms missing from your resume. Add: ${missingKeywords.slice(0, 5).join(', ')}`,
          priority: 'high',
          context: { missingKeywords },
          suggested: true,
          createdAt: new Date(),
        })
      }
    }

    // Experience quantification suggestion
    const unquantifiedExperience = analyzeExperienceQuantification(resumeData)
    if (unquantifiedExperience.length > 0) {
      actions.push({
        id: `quantify_exp_${Date.now()}`,
        type: 'enhancement',
        title: 'Quantify Achievements',
        description: `${unquantifiedExperience.length} experience points lack metrics. Add specific numbers to demonstrate impact.`,
        priority: 'medium',
        context: { unquantifiedExperience },
        suggested: true,
        createdAt: new Date(),
      })
    }

    // ATS compatibility suggestion
    const atsScore = await calculateATSScore(resumeData)
    if (atsScore < 75) {
      actions.push({
        id: `ats_opt_${Date.now()}`,
        type: 'enhancement',
        title: 'Improve ATS Compatibility',
        description: `Resume ATS score: ${atsScore}/100. Consider using standard fonts and clear section headings.`,
        priority: 'high',
        context: { atsScore },
        suggested: true,
        createdAt: new Date(),
      })
    }

    // Skill gaps analysis
    if (context.targetJob) {
      const skillGaps = await identifySkillGaps(resumeData, context.targetJob)
      if (skillGaps.length > 0) {
        actions.push({
          id: `skill_gaps_${Date.now()}`,
          type: 'analysis',
          title: 'Address Skill Gaps',
          description: `${skillGaps.length} potential skill gaps identified. Review technical requirements.`,
          priority: 'medium',
          context: { skillGaps },
          suggested: true,
          createdAt: new Date(),
        })
      }
    }

    return actions
  }

  // Generate cover letter suggestions
  const generateCoverLetterSuggestions = async (
    context: AIProcessingContext
  ): Promise<AIContextAction[]> => {
    const actions: AIContextAction[] = []
    const coverLetterData = context.entities.find(
      e => e.type === 'cover-letter'
    )?.data

    if (!coverLetterData || !context.targetJob) return actions

    // Personalization suggestion
    const personalizationScore = await analyzePersonalization(
      coverLetterData,
      context.targetJob
    )
    if (personalizationScore < 60) {
      actions.push({
        id: `personalize_${Date.now()}`,
        type: 'enhancement',
        title: 'Personalize Letter',
        description:
          'Add more specific references to the company and role to increase impact.',
        priority: 'high',
        context: { personalizationScore },
        suggested: true,
        createdAt: new Date(),
      })
    }

    // Story enhancement suggestion
    if (!analyzeStorytelling(coverLetterData)) {
      actions.push({
        id: `story_telling_${Date.now()}`,
        type: 'enhancement',
        title: 'Tell Your Story',
        description:
          'Consider adding a compelling narrative that connects your experience to this role.',
        priority: 'medium',
        context: {},
        suggested: true,
        createdAt: new Date(),
      })
    }

    return actions
  }

  // Generate job-specific suggestions
  const generateJobSuggestions = async (
    context: AIProcessingContext
  ): Promise<AIContextAction[]> => {
    const actions: AIContextAction[] = []
    const jobData = context.entities.find(e => e.type === 'job')?.data

    if (!jobData) return actions

    // Salary research suggestion
    if (!jobData.salaryRange || jobData.salaryRange === 'Not disclosed') {
      actions.push({
        id: `salary_research_${Date.now()}`,
        type: 'analysis',
        title: 'Research Salary Range',
        description:
          'Consider researching typical salary ranges for this role and location.',
        priority: 'low',
        context: {},
        suggested: true,
        createdAt: new Date(),
      })
    }

    // Company culture analysis suggestion
    if (!jobData.companyCulture) {
      actions.push({
        id: `company_culture_${Date.now()}`,
        type: 'analysis',
        title: 'Analyze Company Culture',
        description:
          'Review company LinkedIn, Glassdoor, and website to understand culture.',
        priority: 'medium',
        context: {},
        suggested: true,
        createdAt: new Date(),
      })
    }

    return actions
  }

  // Generate interview suggestions
  const generateInterviewSuggestions = async (
    context: AIProcessingContext
  ): Promise<AIContextAction[]> => {
    const actions: AIContextAction[] = []
    const interviewData = context.entities.find(
      e => e.type === 'interview'
    )?.data
    const jobData = context.entities.find(e => e.type === 'job')?.data

    if (!interviewData || !jobData) return actions

    // Preparation suggestion based on job
    if (jobData.description) {
      const preparationGaps = await analyzeInterviewPreparation(
        interviewData,
        jobData
      )
      if (preparationGaps.length > 0) {
        actions.push({
          id: `interview_prep_${Date.now()}`,
          type: 'analysis',
          title: 'Improve Interview Preparation',
          description: `${preparationGaps.length} areas need preparation based on job requirements.`,
          priority: 'high',
          context: { preparationGaps },
          suggested: true,
          createdAt: new Date(),
        })
      }
    }

    return actions
  }

  // Generate initial suggestions on context initialization
  const generateInitialSuggestions = async (
    context: AIProcessingContext
  ): Promise<void> => {
    try {
      const initialActions = await generateContextActions(context)
      state.suggestions = initialActions.filter(action => action.suggested)
    } catch (error) {
      logger.error('Failed to generate initial suggestions:', error)
    }
  }

  // Apply an AI suggestion
  const applySuggestion = async (
    actionId: string,
    data?: any
  ): Promise<void> => {
    const action = state.actions.find(a => a.id === actionId)
    if (!action) {
      throw new Error('Action not found')
    }

    try {
      state.isProcessing = true
      action.appliedAt = new Date()
      action.dismissed = false
      state.sessionStats.appliedActions++

      // Execute the action based on type
      switch (action.type) {
        case 'enhancement':
          await executeEnhancement(action, data)
          break
        case 'correction':
          await executeCorrection(action, data)
          break
        case 'analysis':
          await executeAnalysis(action, data)
          break
        default:
          logger.warn('Unknown action type:', action.type)
      }

      // Remove from suggestions list
      state.suggestions = state.suggestions.filter(s => s.id !== actionId)

      // Generate follow-up suggestions
      if (state.currentContext && autoGenerate) {
        await generateContextActions(state.currentContext)
      }
    } catch (error) {
      logger.error('Failed to apply suggestion:', error)
      throw error
    } finally {
      state.isProcessing = false
    }
  }

  // Dismiss a suggestion
  const dismissSuggestion = (actionId: string): void => {
    const action = state.actions.find(a => a.id === actionId)
    if (action) {
      action.dismissed = true
      state.sessionStats.dismissedActions++
      state.suggestions = state.suggestions.filter(s => s.id !== actionId)
    }
  }

  // Execute enhancement action
  const executeEnhancement = async (
    action: AIContextAction,
    data?: any
  ): Promise<void> => {
    // Implement enhancement logic based on action context
    logger.info('Executing enhancement:', action.id, data)
  }

  // Execute correction action
  const executeCorrection = async (
    action: AIContextAction,
    data?: any
  ): Promise<void> => {
    // Implement correction logic based on action context
    logger.info('Executing correction:', action.id, data)
  }

  // Execute analysis action
  const executeAnalysis = async (
    action: AIContextAction,
    data?: any
  ): Promise<void> => {
    // Implement analysis logic based on action context
    logger.info('Executing analysis:', action.id, data)
  }

  // Analysis helper functions
  const analyzeKeywordGaps = async (
    resumeData: any,
    jobDescription: string
  ): Promise<string[]> => {
    // Simple keyword analysis implementation
    const resumeText = JSON.stringify(resumeData).toLowerCase()
    const jobText = jobDescription.toLowerCase()

    // Basic keyword extraction from job description
    const commonKeywords = [
      'javascript',
      'python',
      'react',
      'vue',
      'node',
      'typescript',
      'unity',
      'game',
      'developer',
    ]
    return commonKeywords.filter(
      keyword => jobText.includes(keyword) && !resumeText.includes(keyword)
    )
  }

  const analyzeExperienceQuantification = (resumeData: any): string[] => {
    // Check for quantified achievements
    if (resumeData.experience) {
      const experiences = resumeData.experience
        .map((exp: any) =>
          Array.isArray(exp.achievements) ? exp.achievements : []
        )
        .flat() as string[]

      return experiences.filter(
        (achievement: string) =>
          !/\d+%|\d+ \w+|\$\d+|\d+ users|\d+ projects/i.test(achievement)
      )
    }
    return []
  }

  const calculateATSScore = async (resumeData: any): Promise<number> => {
    // Simple ATS scoring algorithm
    let score = 50

    // Check for standard sections
    if (resumeData.experience?.length > 0) score += 10
    if (resumeData.skills?.length > 0) score += 10
    if (resumeData.education?.length > 0) score += 10
    if (resumeData.summary) score += 10

    // Check for keywords
    const resumeText = JSON.stringify(resumeData).toLowerCase()
    const standardKeywords = [
      'experience',
      'skills',
      'education',
      'projects',
      'summary',
    ]
    const keywordMatches = standardKeywords.filter(kw =>
      resumeText.includes(kw)
    ).length
    score += keywordMatches * 4

    return Math.min(score, 100)
  }

  const identifySkillGaps = async (
    resumeData: any,
    jobData: any
  ): Promise<string[]> => {
    if (!jobData.required_skills) return []

    const resumeSkills = new Set<string>(
      ((resumeData.skills || []) as any[])
        .map((s: any) =>
          typeof s === 'string' ? s.toLowerCase() : s?.name?.toLowerCase()
        )
        .filter(Boolean) as string[]
    )

    const requiredSkills = new Set<string>(
      ((jobData.required_skills || []) as any[])
        .map((s: any) =>
          typeof s === 'string' ? s.toLowerCase() : s?.name?.toLowerCase()
        )
        .filter(Boolean) as string[]
    )

    return Array.from(requiredSkills).filter(skill => !resumeSkills.has(skill))
  }

  const analyzePersonalization = async (
    coverLetter: any,
    jobData: any
  ): Promise<number> => {
    const letterText = JSON.stringify(coverLetter).toLowerCase()
    const companyName = jobData.company?.toLowerCase() || ''
    const jobTitle = jobData.title?.toLowerCase() || ''

    let score = 0
    if (letterText.includes(companyName)) score += 30
    if (letterText.includes(jobTitle)) score += 30
    if (letterText.includes(companyName) && letterText.includes(jobTitle))
      score += 40

    return score
  }

  const analyzeStorytelling = (coverLetter: any): boolean => {
    const letterText = JSON.stringify(coverLetter).toLowerCase()
    return /\bwhen\b|\bthrough\b|\blearned\b|\bachieved\b|\bgrew\b/i.test(
      letterText
    )
  }

  const analyzeInterviewPreparation = async (
    interviewData: any,
    jobData: any
  ): Promise<string[]> => {
    const gaps: string[] = []
    const interviewQuestions = interviewData.questions || []
    const jobSkills = jobData.required_skills || []

    jobSkills.forEach((skill: string) => {
      const hasRelevantQuestion = interviewQuestions.some(
        (q: any) =>
          typeof q.question === 'string' &&
          q.question.toLowerCase().includes(skill.toLowerCase())
      )
      if (!hasRelevantQuestion) {
        gaps.push(`Preparation needed for ${skill}`)
      }
    })

    return gaps
  }

  const calculateAverageResponseTime = (responseTime: number): number => {
    if (state.sessionStats.totalActions === 1) {
      return responseTime
    }
    return (
      (state.sessionStats.averageResponseTime *
        (state.sessionStats.totalActions - 1) +
        responseTime) /
      state.sessionStats.totalActions
    )
  }

  // Observer management
  const subscribe = (
    observer: (context: AIProcessingContext) => void
  ): (() => void) => {
    observers.add(observer)
    return () => observers.delete(observer)
  }

  const notifyObservers = (): void => {
    if (state.currentContext) {
      observers.forEach(observer => observer(state.currentContext!))
    }
  }

  const notifyNewActions = (actions: AIContextAction[]): void => {
    // Would emit notifications to user interface
    logger.info('New AI actions available:', actions.length)
  }

  // Context polling for real-time updates
  const startContextPolling = (): void => {
    if (pollingInterval) return

    pollingInterval = window.setInterval(() => {
      if (!state.currentContext || state.isProcessing) return

      // Check for context updates every 30 seconds
      const now = new Date()
      const timeSinceLastUpdate =
        now.getTime() - state.currentContext.timestamp.getTime()

      if (timeSinceLastUpdate > 30000) {
        // 30 seconds
        state.currentContext.timestamp = now
        if (autoGenerate) {
          generateContextActions(state.currentContext).catch(error =>
            logger.error('Context polling error:', error)
          )
        }
      }
    }, 30000)
  }

  const stopContextPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Cleanup on unmount
  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      stopContextPolling()
      observers.clear()
    })
  }

  // Computed properties
  const activeSuggestions = computed(() =>
    state.suggestions.filter(s => !s.appliedAt && !s.dismissed)
  )

  const recentActions = computed(() =>
    state.actions
      .filter(a => a.appliedAt)
      .sort(
        (a, b) => (b.appliedAt?.getTime() || 0) - (a.appliedAt?.getTime() || 0)
      )
  )

  const contextStats = computed(() => ({
    totalSuggestions: state.suggestions.length,
    appliedActions: state.sessionStats.appliedActions,
    dismissedActions: state.sessionStats.dismissedActions,
    engagementRate:
      state.sessionStats.totalActions > 0
        ? (state.sessionStats.appliedActions /
            state.sessionStats.totalActions) *
          100
        : 0,
  }))

  return {
    // State
    state: readonly(state),
    activeSuggestions,
    recentActions,
    contextStats,

    // Methods
    initializeContext,
    updateContextData,
    applySuggestion,
    dismissSuggestion,
    subscribe,

    // Utilities
    startContextPolling,
    stopContextPolling,
    reset: () => {
      state.currentContext = null
      state.actions = []
      state.error = null
      state.sessionStats = {
        totalActions: 0,
        appliedActions: 0,
        dismissedActions: 0,
        averageResponseTime: 0,
      }
    },
  }
}

export type {
  AIContextAction,
  AITargetEntity,
  AIProcessingContext,
  AIContextState,
}
