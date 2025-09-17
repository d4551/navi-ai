/**
 * AI Interview Composable
 * Vue 3 composable for managing AI-powered interview sessions with real-time features
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { aiInterviewService } from '@/services/AIInterviewService'
import { useToast } from '@/composables/useToast'
import { logger } from '@/shared/utils/logger'

export function useAIInterview() {
  // Reactive state
  const currentSession = ref(null)
  const currentQuestion = ref(null)
  const currentAnalysis = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const realTimeCoaching = ref(null)

  // Session tracking
  const sessionStats = ref({
    questionsAnswered: 0,
    averageScore: 0,
    timeElapsed: 0,
    totalResponses: 0,
  })

  const toast = useToast()

  // Real-time coaching timer
  let coachingTimer = null

  // Computed properties
  const isSessionActive = computed(
    () => currentSession.value && currentSession.value.status === 'active'
  )

  const hasNextQuestion = computed(() => {
    if (!currentSession.value) return false
    return (
      currentSession.value.currentQuestionIndex <
      currentSession.value.questions.length - 1
    )
  })

  const progressPercentage = computed(() => {
    if (!currentSession.value) return 0
    const total = currentSession.value.questions.length
    const current = currentSession.value.currentQuestionIndex + 1
    return Math.round((current / total) * 100)
  })

  const sessionSummary = computed(() => {
    if (!currentSession.value || !currentSession.value.responses) return null

    const responses = currentSession.value.responses
    if (responses.length === 0) return null

    const scores = responses
      .map(r => r.analysis?.overallScore || 0)
      .filter(s => s > 0)
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    return {
      questionsAnswered: responses.length,
      averageScore: Math.round(avgScore),
      timeElapsed: currentSession.value.endTime
        ? Math.round(
            (currentSession.value.endTime - currentSession.value.startTime) /
              1000
          )
        : 0,
      totalQuestions: currentSession.value.questions.length,
    }
  })

  // Methods
  async function startInterview(config) {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      logger.info('Starting AI interview with config:', config)

      const result = await aiInterviewService.startInterviewSession(config)

      if (result.success) {
        currentSession.value = result.session
        currentQuestion.value = result.session.currentQuestion

        // Initialize session stats
        sessionStats.value = {
          questionsAnswered: 0,
          averageScore: 0,
          timeElapsed: 0,
          totalResponses: 0,
        }

        toast.success('AI interview started successfully!')
        logger.info('AI interview session started:', result.session.id)
        return { success: true, session: result.session }
      } else {
        error.value = result.error
        toast.error(`Failed to start interview: ${result.error}`)
        return { success: false, error: result.error }
      }
    } catch (err) {
      error.value = err.message
      logger.error('Error starting AI interview:', err)
      toast.error('Failed to start AI interview')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function submitResponse(responseData) {
    if (!currentSession.value || isLoading.value) {
      return { success: false, error: 'No active session' }
    }

    try {
      isLoading.value = true
      error.value = null

      // Analyze the response with AI
      const analysisResult = await aiInterviewService.analyzeResponse(
        responseData,
        currentQuestion.value,
        currentSession.value.config
      )

      if (analysisResult.success) {
        currentAnalysis.value = analysisResult.analysis

        // Update session stats
        sessionStats.value.questionsAnswered += 1
        sessionStats.value.totalResponses += 1

        if (analysisResult.analysis.overallScore) {
          const currentAvg = sessionStats.value.averageScore
          const responseCount = sessionStats.value.totalResponses
          sessionStats.value.averageScore = Math.round(
            (currentAvg * (responseCount - 1) +
              analysisResult.analysis.overallScore) /
              responseCount
          )
        }

        logger.info(
          'Response analyzed successfully:',
          analysisResult.analysis.overallScore
        )
        return { success: true, analysis: analysisResult.analysis }
      } else {
        error.value = analysisResult.error
        return { success: false, error: analysisResult.error }
      }
    } catch (err) {
      error.value = err.message
      logger.error('Error analyzing response:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function nextQuestion(lastResponseData = null) {
    if (!currentSession.value || isLoading.value) {
      return { success: false, error: 'No active session' }
    }

    try {
      isLoading.value = true
      error.value = null

      const result = await aiInterviewService.getNextQuestion(
        currentSession.value.id,
        lastResponseData
      )

      if (result.success) {
        if (result.completed) {
          // Interview completed
          currentSession.value.status = 'completed'
          currentSession.value.endTime = Date.now()
          currentSession.value.summary = result.summary

          toast.success('Interview completed!')
          logger.info('Interview completed successfully')
          return { success: true, completed: true, summary: result.summary }
        } else {
          // Next question
          currentQuestion.value = result.question

          if (!result.isFollowUp) {
            currentSession.value.currentQuestionIndex += 1
          }

          // Clear previous analysis for new question
          currentAnalysis.value = null
          realTimeCoaching.value = null

          logger.info('Moved to next question:', result.question.id)
          return {
            success: true,
            question: result.question,
            isFollowUp: result.isFollowUp,
          }
        }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      error.value = err.message
      logger.error('Error getting next question:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function getRealTimeCoaching(responseInProgress) {
    if (
      !currentSession.value ||
      !currentQuestion.value ||
      !responseInProgress
    ) {
      return
    }

    try {
      const coaching = await aiInterviewService.getRealTimeCoaching(
        currentQuestion.value,
        responseInProgress,
        currentSession.value.config
      )

      if (coaching && coaching.tip) {
        realTimeCoaching.value = coaching

        // Auto-hide low urgency tips after 10 seconds
        if (coaching.urgency === 'low') {
          setTimeout(() => {
            if (realTimeCoaching.value === coaching) {
              realTimeCoaching.value = null
            }
          }, 10000)
        }
      }
    } catch (err) {
      logger.debug('Real-time coaching failed:', err)
      // Don't show errors for optional coaching feature
    }
  }

  function startRealTimeCoaching(responseText, interval = 15000) {
    if (coachingTimer) {
      clearInterval(coachingTimer)
    }

    coachingTimer = setInterval(() => {
      if (responseText && responseText.length > 50) {
        getRealTimeCoaching(responseText)
      }
    }, interval)
  }

  function stopRealTimeCoaching() {
    if (coachingTimer) {
      clearInterval(coachingTimer)
      coachingTimer = null
    }
    realTimeCoaching.value = null
  }

  function pauseInterview() {
    if (currentSession.value) {
      currentSession.value.status = 'paused'
      stopRealTimeCoaching()
    }
  }

  function resumeInterview() {
    if (currentSession.value) {
      currentSession.value.status = 'active'
    }
  }

  function endInterview() {
    if (!currentSession.value)
      return { success: false, error: 'No active session' }

    const result = aiInterviewService.endSession(currentSession.value.id)

    if (result.success) {
      currentSession.value = result.session
      currentQuestion.value = null
      currentAnalysis.value = null
      stopRealTimeCoaching()

      toast.success('Interview ended')
      logger.info('Interview session ended')
    }

    return result
  }

  function dismissAnalysis() {
    currentAnalysis.value = null
  }

  function dismissCoaching() {
    realTimeCoaching.value = null
  }

  function getSessionData() {
    return {
      session: currentSession.value,
      question: currentQuestion.value,
      analysis: currentAnalysis.value,
      stats: sessionStats.value,
      coaching: realTimeCoaching.value,
      isActive: isSessionActive.value,
      hasNext: hasNextQuestion.value,
      progress: progressPercentage.value,
      summary: sessionSummary.value,
    }
  }

  function resetSession() {
    currentSession.value = null
    currentQuestion.value = null
    currentAnalysis.value = null
    realTimeCoaching.value = null
    error.value = null
    sessionStats.value = {
      questionsAnswered: 0,
      averageScore: 0,
      timeElapsed: 0,
      totalResponses: 0,
    }
    stopRealTimeCoaching()
  }

  // Watch for response changes to trigger real-time coaching
  watch(
    () => realTimeCoaching.value,
    newCoaching => {
      if (newCoaching && newCoaching.urgency === 'high') {
        toast.info(newCoaching.tip, {
          duration: 8000,
          position: 'top-right',
        })
      }
    }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stopRealTimeCoaching()
  })

  return {
    // State
    currentSession: computed(() => currentSession.value),
    currentQuestion: computed(() => currentQuestion.value),
    currentAnalysis: computed(() => currentAnalysis.value),
    realTimeCoaching: computed(() => realTimeCoaching.value),
    sessionStats: computed(() => sessionStats.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    isSessionActive,
    hasNextQuestion,
    progressPercentage,
    sessionSummary,

    // Methods
    startInterview,
    submitResponse,
    nextQuestion,
    pauseInterview,
    resumeInterview,
    endInterview,
    getRealTimeCoaching,
    startRealTimeCoaching,
    stopRealTimeCoaching,
    dismissAnalysis,
    dismissCoaching,
    getSessionData,
    resetSession,
  }
}
