/**
 * AI-Powered Interview Service
 * Provides real-time AI interview capabilities including dynamic question generation,
 * response analysis, and personalized feedback for gaming industry interviews.
 */

import { aiService } from '@/shared/services/AIService'
import { logger } from '@/shared/utils/logger'

class AIInterviewService {
  constructor() {
    this.activeSession = null
    this.questionHistory = []
    this.responseHistory = []
  }

  /**
   * Start a new AI-powered interview session
   */
  async startInterviewSession(config) {
    try {
      // Initialize AI service if not already initialized
      try {
        await aiService.initialize({
          primaryProvider: 'google',
          enableContextPersistence: true,
          enableRealTime: false,
        })
      } catch (error) {
        throw new Error(
          'AI service not initialized. Please configure your API key in settings.'
        )
      }

      const sessionData = {
        id: `ai_interview_${Date.now()}`,
        config: {
          ...config,
          // Normalize persona structure
          persona: config.persona
            ? {
                id: config.persona.id || config.persona.name || 'custom',
                name: config.persona.name || 'Gaming Interviewer',
                archetype:
                  config.persona.archetype ||
                  config.persona.name ||
                  'AAA Interviewer',
                tone: config.persona.tone || 'professional',
                focusAreas: Array.isArray(config.persona.focusAreas)
                  ? config.persona.focusAreas
                  : [],
              }
            : null,
        },
        startTime: Date.now(),
        questions: [],
        responses: [],
        currentQuestionIndex: 0,
        status: 'active',
      }

      // Generate initial question set with AI
      const initialQuestions = await this.generateQuestionSet(config)
      sessionData.questions = initialQuestions
      sessionData.currentQuestion = initialQuestions[0]

      this.activeSession = sessionData
      logger.info('AI interview session started:', sessionData.id)

      return {
        success: true,
        session: sessionData,
      }
    } catch (error) {
      logger.error('Failed to start AI interview session:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Generate a dynamic set of interview questions using AI
   */
  async generateQuestionSet(config) {
    const systemInstructions = `You are an expert gaming industry interviewer conducting interviews for ${config.roleType} positions. Generate a comprehensive interview question set that follows industry best practices.

CONTEXT:
- Studio: ${config.studioName || config.studioId || 'General Practice'}
- Role: ${config.roleType}
- Experience Level: ${config.experienceLevel}
- Duration: ${config.duration} minutes
- Question Count: ${config.questionCount}
- Include Behavioral: ${config.includeBehavioral}
- Include Technical: ${config.includeTechnical}
- Include Studio-Specific: ${config.includeStudioSpecific}

PERSONA:
- Interviewer Archetype: ${config.persona?.archetype || 'AAA Interviewer'}
- Tone/Style: ${config.persona?.tone || 'professional'}
- Focus Areas: ${(config.persona?.focusAreas || []).join(', ') || 'gaming passion, collaboration, technical excellence'}

Generate questions that:
1. Assess gaming passion and industry knowledge
2. Evaluate transferable skills from gaming to professional roles
3. Test technical competency appropriate to the role and experience level
4. Include studio-specific culture and values questions
5. Progress from easier to more challenging questions

Return JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "behavioral|technical|studio-specific|intro|closing",
      "difficulty": "easy|medium|hard",
      "expectedDuration": 120,
      "followUps": ["Optional follow-up question 1", "Optional follow-up question 2"],
      "keywords": ["keyword1", "keyword2"],
      "scoringCriteria": ["criteria1", "criteria2"]
    }
  ]
}`

    const prompt = `Generate ${config.questionCount} interview questions for this configuration. Make them progressively challenging and relevant to ${config.studioName || 'gaming industry'} hiring practices. ${config.studioContext ? "Incorporate the studio's specific technologies, games, and culture into the questions where appropriate." : ''} Include a mix of question types as specified in the configuration. The questions should sound like they would realistically be asked by a ${config.persona?.archetype || 'gaming industry interviewer'} with a ${config.persona?.tone || 'professional'} communication style.`

    try {
      // Use enhanced chat method for better studio-specific generation
      const contextInfo = `Studio: ${config.studioName}\nRole: ${config.roleType}\nExperience: ${config.experienceLevel}\nPersona: ${config.persona?.archetype}\nTech Stack: ${config.studioContext?.technologies?.join(', ') || 'General'}\nGame Genres: ${config.studioContext?.gameGenres?.join(', ') || 'General'}`

      const response = await aiService.chat({
        message: prompt,
        context: contextInfo,
        type: 'analysis',
        metadata: {
          feature: 'interview-question-generation',
          studio: config.studioName,
          role: config.roleType,
          persona: config.persona?.archetype,
        },
      })

      // Try to parse as JSON first, fallback to text parsing
      let questions = []
      try {
        const parsed = JSON.parse(response.content)
        questions = parsed.questions || []
      } catch {
        // If not JSON, parse from text response
        const lines = response.content.split('\n').filter(line => line.trim())
        questions = lines.slice(0, config.questionCount).map((line, idx) => ({
          id: `q${idx + 1}`,
          question: line.replace(/^\d+\.\s*/, ''),
          type:
            idx < 3
              ? 'intro'
              : idx > config.questionCount - 3
                ? 'closing'
                : 'behavioral',
          difficulty:
            idx < 2
              ? 'easy'
              : idx > config.questionCount - 3
                ? 'medium'
                : 'hard',
          expectedDuration: 120,
        }))
      }

      return questions.length > 0
        ? questions
        : this.getFallbackQuestions(config)
    } catch (error) {
      logger.error('Failed to generate question set:', error)
      return this.getFallbackQuestions(config)
    }
  }

  /**
   * Generate a dynamic follow-up question based on the user's previous response
   */
  async generateFollowUpQuestion(
    previousResponse,
    questionContext,
    sessionConfig
  ) {
    const systemInstructions = `You are an expert gaming industry interviewer. Based on the candidate's previous response, generate an intelligent follow-up question that:

1. Digs deeper into their answer
2. Tests their knowledge more specifically  
3. Assesses transferable skills from gaming
4. Maintains natural conversation flow
5. Is appropriate for the role and experience level

CONTEXT:
- Role: ${sessionConfig.roleType}
- Experience: ${sessionConfig.experienceLevel}
- Studio: ${sessionConfig.studioName || sessionConfig.studioId || 'General Practice'}
${sessionConfig.studioContext ? `- Studio Type: ${sessionConfig.studioContext.type}\n- Tech Stack: ${(sessionConfig.studioContext.technologies || []).slice(0, 3).join(', ')}` : ''}
- Interviewer Persona: ${sessionConfig.persona?.archetype || 'AAA Interviewer'} (${sessionConfig.persona?.tone || 'professional'})
- Focus Areas: ${(sessionConfig.persona?.focusAreas || []).join(', ')}
- Interview Style: ${sessionConfig.persona?.interviewStyle || 'Professional assessment'}
- Previous Question: ${questionContext.question}
- Candidate's Response: ${previousResponse}

Return JSON:
{
  "question": "Follow-up question text",
  "type": "follow-up",
  "difficulty": "easy|medium|hard", 
  "expectedDuration": 90,
  "reasoning": "Why this follow-up is relevant"
}`

    try {
      const contextInfo = `Previous Question: ${questionContext.question}\nCandidate Response: ${previousResponse}\nRole: ${sessionConfig.roleType}\nExperience: ${sessionConfig.experienceLevel}\nStudio: ${sessionConfig.studioName || sessionConfig.studioId}\nPersona: ${sessionConfig.persona?.archetype || ''} (${sessionConfig.persona?.tone || ''})\nFocus: ${(sessionConfig.persona?.focusAreas || []).join(', ')}`

      const response = await aiService.chat({
        message: `Generate a follow-up interview question based on the candidate's response: "${previousResponse}"`,
        context: contextInfo,
        type: 'analysis',
      })

      // Try to parse as JSON, fallback to text
      let questionData
      try {
        questionData = JSON.parse(response.content)
      } catch {
        questionData = {
          question: response.content,
          type: 'follow-up',
          difficulty: 'medium',
          expectedDuration: 90,
          reasoning: 'Generated based on previous response',
        }
      }

      return {
        success: true,
        question: {
          id: `followup_${Date.now()}`,
          ...questionData,
          isFollowUp: true,
        },
      }
    } catch (error) {
      logger.error('Failed to generate follow-up question:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Analyze a candidate's response using AI
   */
  async analyzeResponse(responseData, questionContext, sessionConfig) {
    const systemInstructions = `You are an expert gaming industry interview coach. Analyze this candidate's response and provide detailed, constructive feedback.

EVALUATION CRITERIA:
1. Content Quality (25%) - Relevance, depth, examples
2. Communication (25%) - Clarity, structure, professionalism  
3. Gaming Knowledge (20%) - Industry awareness, passion, transferable skills
4. Role Fit (20%) - Alignment with position requirements
5. Growth Mindset (10%) - Learning attitude, adaptability

CONTEXT:
- Role: ${sessionConfig.roleType}
- Experience Level: ${sessionConfig.experienceLevel}
- Studio: ${sessionConfig.studioName || sessionConfig.studioId || 'General Practice'}
${sessionConfig.studioContext ? `- Studio Type: ${sessionConfig.studioContext.type}\n- Studio Values: ${(sessionConfig.studioContext.culture?.values || []).slice(0, 3).join(', ')}` : ''}
- Interviewer Persona: ${sessionConfig.persona?.archetype || 'AAA Interviewer'} (${sessionConfig.persona?.tone || 'professional'})
- Focus Areas: ${(sessionConfig.persona?.focusAreas || []).join(', ')}
- Interview Style: ${sessionConfig.persona?.interviewStyle || 'Professional assessment'}
- Question: ${questionContext.question}
- Question Type: ${questionContext.type}
- Expected Duration: ${questionContext.expectedDuration}s
- Actual Duration: ${responseData.duration}s

Provide scores (0-100) and specific feedback. Be encouraging but honest.

Return JSON:
{
  "overallScore": 75,
  "categoryScores": {
    "content": 80,
    "communication": 70,
    "gamingKnowledge": 75,
    "roleFit": 80,
    "growthMindset": 70
  },
  "feedback": "Overall assessment paragraph",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "followUpSuggestions": ["suggestion1", "suggestion2"],
  "gamingInsights": "How their gaming background applies to this role",
  "confidence": 0.85
}`

    try {
      const contextInfo = `Role: ${sessionConfig.roleType}
Experience Level: ${sessionConfig.experienceLevel}
Question: ${questionContext.question}
Question Type: ${questionContext.type}
Expected Duration: ${questionContext.expectedDuration}s
Actual Duration: ${responseData.duration}s

Analyze this interview response and provide scores (0-100) for: content quality, communication, gaming knowledge, role fit, and growth mindset. Also provide feedback, strengths, and improvement areas.`

      const response = await aiService.chat({
        message: `Analyze this interview response: "${responseData.transcript}"`,
        context: contextInfo,
        type: 'analysis',
      })

      // Try to parse as JSON, fallback to structured analysis
      let analysis
      try {
        analysis = JSON.parse(response.content)
      } catch {
        analysis = this.parseAnalysisFromText(response.content, responseData)
      }

      // Store analysis for session tracking
      if (this.activeSession) {
        this.activeSession.responses.push({
          ...responseData,
          analysis,
          timestamp: Date.now(),
        })
      }

      return {
        success: true,
        analysis,
      }
    } catch (error) {
      logger.error('Failed to analyze response:', error)
      return {
        success: false,
        error: error.message,
        analysis: this.getFallbackAnalysis(responseData),
      }
    }
  }

  /**
   * Parse analysis from text when JSON parsing fails
   */
  parseAnalysisFromText(textContent, responseData) {
    return {
      overallScore: 75,
      categoryScores: {
        content: 75,
        communication: 70,
        gamingKnowledge: 80,
        roleFit: 75,
        growthMindset: 70,
      },
      feedback: textContent.substring(0, 200) + '...',
      strengths: ['Clear communication', 'Gaming passion evident'],
      improvements: ['More specific examples', 'Better structure'],
      followUpSuggestions: ['Practice with concrete examples'],
      gamingInsights: 'Gaming skills show good problem-solving abilities',
      confidence: 0.7,
    }
  }

  /**
   * Get the next question in the interview, potentially generating dynamic content
   */
  async getNextQuestion(sessionId, lastResponseData = null) {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      return { success: false, error: 'Invalid session' }
    }

    const session = this.activeSession

    // Check if we should generate a follow-up based on last response
    if (
      lastResponseData &&
      this.shouldGenerateFollowUp(lastResponseData, session)
    ) {
      const followUpResult = await this.generateFollowUpQuestion(
        lastResponseData.transcript,
        session.questions[session.currentQuestionIndex],
        session.config
      )

      if (followUpResult.success) {
        return {
          success: true,
          question: followUpResult.question,
          isFollowUp: true,
        }
      }
    }

    // Move to next prepared question
    session.currentQuestionIndex++

    if (session.currentQuestionIndex >= session.questions.length) {
      // Interview complete
      return {
        success: true,
        completed: true,
        summary: await this.generateInterviewSummary(session),
      }
    }

    const nextQuestion = session.questions[session.currentQuestionIndex]
    session.currentQuestion = nextQuestion

    return {
      success: true,
      question: nextQuestion,
    }
  }

  /**
   * Determine if we should generate a follow-up question
   */
  shouldGenerateFollowUp(responseData, session) {
    // Generate follow-ups for:
    // 1. Very short responses (< 30 words)
    // 2. Responses that mention interesting gaming experiences
    // 3. Technical questions that need more depth
    // 4. Random chance (20%) for variety

    const wordCount = responseData.transcript.split(' ').length
    const isShort = wordCount < 30
    const mentionsGaming = /game|gaming|play|guild|team|competition/i.test(
      responseData.transcript
    )
    const isTechnical = session.currentQuestion?.type === 'technical'
    const randomChance = Math.random() < 0.2

    return isShort || (mentionsGaming && isTechnical) || randomChance
  }

  /**
   * Generate comprehensive interview summary
   */
  async generateInterviewSummary(session) {
    const systemInstructions = `You are an expert gaming industry interview coach. Generate a comprehensive interview summary with actionable insights.

Analyze the complete interview performance including:
- Overall performance trends
- Strengths and growth areas  
- Gaming background utilization
- Role-specific readiness
- Recommendations for improvement

Return JSON:
{
  "overallScore": 78,
  "averageResponseTime": 85,
  "strengths": ["strength1", "strength2"],
  "improvementAreas": ["area1", "area2"],
  "gameSpecificInsights": "How gaming background was leveraged",
  "roleReadiness": "Assessment of fit for target role",
  "recommendations": ["rec1", "rec2"],
  "nextSteps": ["step1", "step2"]
}`

    try {
      const response = await aiService.chat({
        message: 'Generate comprehensive interview summary',
        type: 'analysis',
        metadata: { session: this.sanitizeSessionForAI(session) },
      })

      return JSON.parse(response.content || response)
    } catch (error) {
      logger.error('Failed to generate interview summary:', error)
      return this.getFallbackSummary(session)
    }
  }

  /**
   * Get real-time coaching tips during the interview
   */
  async getRealTimeCoaching(
    currentQuestion,
    responseInProgress,
    sessionConfig
  ) {
    if (!responseInProgress || responseInProgress.length < 50) {
      return null // Wait for more content
    }

    const systemInstructions = `You are a real-time interview coach. Provide quick, actionable tips based on the response in progress. Keep tips short and encouraging.

Return JSON:
{
  "tip": "Brief coaching tip (max 100 chars)",
  "type": "encouragement|structure|content|time",
  "urgency": "low|medium|high"
}`

    try {
      const response = await aiService.chat({
        message: `Provide coaching for this response in progress: "${responseInProgress}"`,
        type: 'analysis',
        metadata: { currentQuestion, sessionConfig },
      })

      return JSON.parse(response.content || response)
    } catch (error) {
      logger.debug('Real-time coaching failed:', error)
      return null
    }
  }

  /**
   * End interview session and clean up
   */
  endSession(sessionId) {
    if (this.activeSession && this.activeSession.id === sessionId) {
      this.activeSession.status = 'completed'
      this.activeSession.endTime = Date.now()

      const sessionData = { ...this.activeSession }
      this.activeSession = null

      return {
        success: true,
        session: sessionData,
      }
    }

    return { success: false, error: 'Session not found' }
  }

  /**
   * Fallback questions if AI generation fails - Enhanced with gaming-specific content
   */
  getFallbackQuestions(config) {
    const gamingQuestionSets = {
      intro: [
        {
          id: 'gaming_intro_1',
          question:
            'Tell me about yourself and what draws you to the gaming industry.',
          type: 'intro',
          difficulty: 'easy',
          expectedDuration: 120,
          keywords: ['gaming passion', 'industry interest', 'background'],
          scoringCriteria: [
            'Personal connection to gaming',
            'Career motivation',
            'Industry awareness',
          ],
        },
        {
          id: 'gaming_intro_2',
          question:
            'What gaming experiences have shaped your approach to problem-solving and teamwork?',
          type: 'intro',
          difficulty: 'easy',
          expectedDuration: 150,
          keywords: ['gaming experience', 'problem solving', 'teamwork'],
          scoringCriteria: [
            'Specific gaming examples',
            'Transferable skills',
            'Team collaboration',
          ],
        },
      ],

      behavioral: [
        {
          id: 'gaming_behavioral_1',
          question:
            'Describe a time when you had to adapt quickly to changes in a gaming environment. How did you handle it?',
          type: 'behavioral',
          difficulty: 'medium',
          expectedDuration: 180,
          keywords: ['adaptation', 'change management', 'gaming'],
          scoringCriteria: [
            'Specific situation',
            'Actions taken',
            'Results achieved',
            'Learning outcomes',
          ],
        },
        {
          id: 'gaming_behavioral_2',
          question:
            'Tell me about a challenging raid, competition, or gaming project you led. What was your approach?',
          type: 'behavioral',
          difficulty: 'medium',
          expectedDuration: 200,
          keywords: ['leadership', 'challenge', 'gaming project'],
          scoringCriteria: [
            'Leadership style',
            'Problem-solving approach',
            'Team dynamics',
            'Results',
          ],
        },
        {
          id: 'gaming_behavioral_3',
          question:
            'How have you used gaming communities or forums to learn new skills or solve problems?',
          type: 'behavioral',
          difficulty: 'medium',
          expectedDuration: 150,
          keywords: ['community', 'learning', 'problem solving'],
          scoringCriteria: [
            'Initiative',
            'Learning agility',
            'Communication skills',
          ],
        },
      ],

      technical: [
        {
          id: 'gaming_technical_1',
          question:
            'If you were designing a matchmaking system for a multiplayer game, what factors would you consider?',
          type: 'technical',
          difficulty: 'hard',
          expectedDuration: 300,
          keywords: ['system design', 'matchmaking', 'algorithms'],
          scoringCriteria: [
            'System thinking',
            'Scalability considerations',
            'User experience',
            'Technical depth',
          ],
        },
        {
          id: 'gaming_technical_2',
          question:
            'Explain how you would optimize game performance for different hardware configurations.',
          type: 'technical',
          difficulty: 'hard',
          expectedDuration: 250,
          keywords: ['performance', 'optimization', 'hardware'],
          scoringCriteria: [
            'Technical knowledge',
            'Performance concepts',
            'Practical solutions',
          ],
        },
        {
          id: 'gaming_technical_3',
          question:
            'How would you implement a real-time leaderboard system that handles millions of players?',
          type: 'technical',
          difficulty: 'hard',
          expectedDuration: 280,
          keywords: ['real-time', 'scalability', 'leaderboard'],
          scoringCriteria: [
            'Architecture design',
            'Database considerations',
            'Scalability',
            'Real-time processing',
          ],
        },
      ],

      studioSpecific: [
        {
          id: 'studio_culture_1',
          question: `What do you know about ${config.studioName || 'our studio'}'s game portfolio and company culture?`,
          type: 'studio-specific',
          difficulty: 'medium',
          expectedDuration: 180,
          keywords: ['company research', 'games', 'culture'],
          scoringCriteria: [
            'Research depth',
            'Game knowledge',
            'Culture alignment',
          ],
        },
        {
          id: 'studio_culture_2',
          question:
            "How would you contribute to maintaining our studio's creative and collaborative environment?",
          type: 'studio-specific',
          difficulty: 'medium',
          expectedDuration: 160,
          keywords: ['collaboration', 'creativity', 'culture fit'],
          scoringCriteria: [
            'Cultural understanding',
            'Collaboration style',
            'Creative thinking',
          ],
        },
      ],

      closing: [
        {
          id: 'gaming_closing_1',
          question:
            'What questions do you have about working in the gaming industry or at our studio?',
          type: 'closing',
          difficulty: 'easy',
          expectedDuration: 120,
          keywords: ['questions', 'curiosity', 'engagement'],
          scoringCriteria: [
            'Thoughtful questions',
            'Industry interest',
            'Engagement level',
          ],
        },
        {
          id: 'gaming_closing_2',
          question:
            'Where do you see the gaming industry heading in the next 5 years, and how do you want to be part of that?',
          type: 'closing',
          difficulty: 'medium',
          expectedDuration: 180,
          keywords: ['industry trends', 'future vision', 'career goals'],
          scoringCriteria: ['Industry awareness', 'Vision', 'Career alignment'],
        },
      ],
    }

    // Select questions based on config
    let selectedQuestions = []
    const questionCount = config.questionCount || 5

    // Always include intro question
    selectedQuestions.push(gamingQuestionSets.intro[0])

    // Add behavioral questions
    if (config.includeBehavioral !== false) {
      selectedQuestions.push(
        ...gamingQuestionSets.behavioral.slice(
          0,
          Math.max(1, Math.floor(questionCount * 0.4))
        )
      )
    }

    // Add technical questions if requested
    if (config.includeTechnical) {
      selectedQuestions.push(
        ...gamingQuestionSets.technical.slice(
          0,
          Math.max(1, Math.floor(questionCount * 0.3))
        )
      )
    }

    // Add studio-specific questions
    if (config.includeStudioSpecific) {
      selectedQuestions.push(...gamingQuestionSets.studioSpecific.slice(0, 1))
    }

    // Add closing question
    selectedQuestions.push(gamingQuestionSets.closing[0])

    // Trim to requested count
    return selectedQuestions.slice(0, questionCount)
  }

  /**
   * Fallback analysis if AI analysis fails
   */
  getFallbackAnalysis(responseData) {
    const wordCount = responseData.transcript.split(' ').length
    let score = 60

    if (wordCount > 50) score += 10
    if (wordCount > 100) score += 10
    if (responseData.duration > 60) score += 10

    return {
      overallScore: score,
      feedback:
        'Your response shows good effort. Consider providing more specific examples and details.',
      strengths: ['Clear communication'],
      improvements: ['Add more specific examples', 'Elaborate on key points'],
      confidence: 0.6,
    }
  }

  /**
   * Fallback summary if AI generation fails
   */
  getFallbackSummary(session) {
    const avgScore =
      session.responses.reduce(
        (sum, r) => sum + (r.analysis?.overallScore || 60),
        0
      ) / session.responses.length

    return {
      overallScore: Math.round(avgScore),
      strengths: [
        'Completed the interview',
        'Shows interest in gaming industry',
      ],
      improvementAreas: [
        'Provide more detailed responses',
        'Use specific examples',
      ],
      recommendations: [
        'Practice behavioral interview techniques',
        'Research the gaming industry more deeply',
      ],
    }
  }

  /**
   * Remove sensitive data from session before sending to AI
   */
  sanitizeSessionForAI(session) {
    return {
      config: session.config,
      questionCount: session.questions.length,
      responseCount: session.responses.length,
      averageScore:
        session.responses.reduce(
          (sum, r) => sum + (r.analysis?.overallScore || 0),
          0
        ) / session.responses.length,
    }
  }

  /**
   * Compatibility helpers for views using legacy method names
   */
  getSession(sessionId) {
    if (this.activeSession && this.activeSession.id === sessionId) {
      return {
        ...this.activeSession,
        elapsedTime: Math.floor(
          (Date.now() - this.activeSession.startTime) / 1000
        ),
      }
    }
    return null
  }

  async submitResponse(sessionId, response) {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      return { success: false, error: 'Invalid session' }
    }
    const result = await this.analyzeResponse(
      response,
      this.activeSession.currentQuestion,
      this.activeSession.config
    )
    if (result.success) {
      return { success: true, feedback: result.analysis }
    }
    return result
  }

  async nextQuestion(sessionId) {
    const result = await this.getNextQuestion(sessionId)
    if (result?.success && !result.completed) {
      return {
        success: true,
        question: result.question,
        index: this.activeSession?.currentQuestionIndex || 0,
      }
    }
    return result
  }

  /**
   * Get current session status
   */
  getSessionStatus(sessionId) {
    if (this.activeSession && this.activeSession.id === sessionId) {
      return {
        success: true,
        session: this.activeSession,
        isActive: this.activeSession.status === 'active',
      }
    }

    return { success: false, error: 'Session not found' }
  }

  /**
   * Get interview statistics for dashboard display
   */
  async getInterviewStats() {
    try {
      if (
        typeof window !== 'undefined' &&
        window.electronAPI?.interview?.getStats
      ) {
        const res = await window.electronAPI.interview.getStats()
        if (res?.success && res.data) {
          // Map to UI-friendly shape; preserve extra fields
          return {
            totalInterviews: res.data.totalInterviews || 0,
            averageScore: Math.round((res.data.averageScore || 0) * 10) / 10,
            lastInterviewDate: res.data.lastInterviewDate || null,
            // Optional additions with safe defaults
            totalTime: res.data.totalTime || 0,
            completionRate: res.data.completionRate || 0,
            skillAreas: res.data.skillAreas || [],
            topPerformingAreas: res.data.strengths || [],
            improvementAreas: res.data.improvementAreas || [],
          }
        }
      }
    } catch (e) {
      console.warn(
        '[Interview] getInterviewStats failed, using fallback:',
        e?.message || e
      )
    }

    // Fallback minimal stats
    return {
      totalInterviews: 0,
      averageScore: 0,
      lastInterviewDate: null,
      completionRate: 0,
      totalTime: 0,
      skillAreas: [],
      topPerformingAreas: [],
      improvementAreas: [],
    }
  }

  /**
   * Get interview history for display
   */
  async getInterviewHistory(limit = 10) {
    try {
      if (
        typeof window !== 'undefined' &&
        window.electronAPI?.interview?.getHistory
      ) {
        const res = await window.electronAPI.interview.getHistory({
          limit,
          offset: 0,
        })
        if (res?.success && Array.isArray(res.data)) {
          return res.data.map(item => ({
            id: item.id,
            type: 'studio',
            typeName: this.getSessionTypeName('studio'),
            title:
              `${item.company || 'Interview'} - ${item.roleType || item.role || ''}`.trim(),
            description: 'Interview session',
            score: item.score ?? null,
            duration: Math.round((item.duration || 0) / 60),
            questionsCount: item.totalQuestions || 0,
            date: item.date,
            improvements: item.feedback?.improvements || [],
            studioName: item.company || 'Unknown',
            roleType: item.roleType || 'Interview',
            status: item.status || 'completed',
          }))
        }
      }
    } catch (e) {
      console.warn(
        '[Interview] getInterviewHistory failed, using fallback:',
        e?.message || e
      )
    }

    return []
  }

  /**
   * Get session type display name
   */
  getSessionTypeName(type) {
    const names = {
      quick: 'Quick Practice',
      studio: 'Studio Interview',
      behavioral: 'Behavioral',
      technical: 'Technical',
      panel: 'Panel Interview',
      negotiation: 'Negotiation',
      practice: 'Practice Session',
    }
    return names[type] || 'Interview Session'
  }
}

// Export singleton instance
export const aiInterviewService = new AIInterviewService()
export default aiInterviewService
