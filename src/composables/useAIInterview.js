
import { ref, computed, watch, onUnmounted } from "vue";
import { aiInterviewService } from "@/services/AIInterviewService";
import { useToast } from "@/composables/useToast";
import { logger } from "@/shared/utils/logger";

  // Reactive state
  const currentSession = ref(null);
  const currentQuestion = ref(null);
  const currentAnalysis = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const realTimeCoaching = ref(null);

  // Session tracking
  const sessionStats = ref({
  });

  const toast = useToast();

  // Real-time coaching timer
  let coachingTimer = null;

  // Computed properties
  const isSessionActive = computed(
    () => currentSession.value && currentSession.value.status === "active",
  );

  const hasNextQuestion = computed(() => {
    if (!currentSession.value) return false;
    return (
      currentSession.value.currentQuestionIndex <
    );
  });

  const progressPercentage = computed(() => {
    const total = currentSession.value.questions.length;
  });

  const sessionSummary = computed(() => {
    if (!currentSession.value || !currentSession.value.responses) return null;

    const responses = currentSession.value.responses;

    const scores = responses
    const avgScore =

    return {
      questionsAnswered: responses.length,
      averageScore: Math.round(avgScore),
      timeElapsed: currentSession.value.endTime
        ? Math.round(
            (currentSession.value.endTime - currentSession.value.startTime) /
          )
      totalQuestions: currentSession.value.questions.length,
    };
  });

  // Methods
    if (isLoading.value) return;

    try {
      isLoading.value = true;
      error.value = null;

      logger.info("Starting AI interview with config:", config);

      const result = await aiInterviewService.startInterviewSession(config);

      if (result.success) {
        currentSession.value = result.session;
        currentQuestion.value = result.session.currentQuestion;

        // Initialize session stats
        sessionStats.value = {
        };

        toast.success("AI interview started successfully!");
        logger.info("AI interview session started:", result.session.id);
        return { success: true, session: result.session };
      } else {
        error.value = result.error;
        toast.error(`Failed to start interview: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (err) {
      error.value = err.message;
      logger.error("Error starting AI interview:", err);
      toast.error("Failed to start AI interview");
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

    if (!currentSession.value || isLoading.value) {
      return { success: false, error: "No active session" };
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Analyze the response with AI
      const analysisResult = await aiInterviewService.analyzeResponse(
        responseData,
        currentQuestion.value,
        currentSession.value.config,
      );

      if (analysisResult.success) {
        currentAnalysis.value = analysisResult.analysis;

        // Update session stats

        if (analysisResult.analysis.overallScore) {
          const currentAvg = sessionStats.value.averageScore;
          const responseCount = sessionStats.value.totalResponses;
          sessionStats.value.averageScore = Math.round(
              analysisResult.analysis.overallScore) /
              responseCount,
          );
        }

        logger.info(
          "Response analyzed successfully:",
          analysisResult.analysis.overallScore,
        );
        return { success: true, analysis: analysisResult.analysis };
      } else {
        error.value = analysisResult.error;
        return { success: false, error: analysisResult.error };
      }
    } catch (err) {
      error.value = err.message;
      logger.error("Error analyzing response:", err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

    if (!currentSession.value || isLoading.value) {
      return { success: false, error: "No active session" };
    }

    try {
      isLoading.value = true;
      error.value = null;

      const result = await aiInterviewService.getNextQuestion(
        currentSession.value.id,
        lastResponseData,
      );

      if (result.success) {
        if (result.completed) {
          // Interview completed
          currentSession.value.status = "completed";
          currentSession.value.endTime = Date.now();
          currentSession.value.summary = result.summary;

          toast.success("Interview completed!");
          logger.info("Interview completed successfully");
          return { success: true, completed: true, summary: result.summary };
        } else {
          // Next question
          currentQuestion.value = result.question;

          if (!result.isFollowUp) {
          }

          // Clear previous analysis for new question
          currentAnalysis.value = null;
          realTimeCoaching.value = null;

          logger.info("Moved to next question:", result.question.id);
          return {
            success: true,
            question: result.question,
            isFollowUp: result.isFollowUp,
          };
        }
      } else {
        error.value = result.error;
        return { success: false, error: result.error };
      }
    } catch (err) {
      error.value = err.message;
      logger.error("Error getting next question:", err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

    if (
      !currentSession.value ||
      !currentQuestion.value ||
      !responseInProgress
    ) {
      return;
    }

    try {
      const coaching = await aiInterviewService.getRealTimeCoaching(
        currentQuestion.value,
        responseInProgress,
        currentSession.value.config,
      );

      if (coaching && coaching.tip) {
        realTimeCoaching.value = coaching;

        if (coaching.urgency === "low") {
          setTimeout(() => {
            if (realTimeCoaching.value === coaching) {
              realTimeCoaching.value = null;
            }
        }
      }
    } catch (err) {
      logger.debug("Real-time coaching failed:", err);
      // Don't show errors for optional coaching feature
    }
  }

    if (coachingTimer) {
      clearInterval(coachingTimer);
    }

    coachingTimer = setInterval(() => {
        getRealTimeCoaching(responseText);
      }
    }, interval);
  }

    if (coachingTimer) {
      clearInterval(coachingTimer);
      coachingTimer = null;
    }
    realTimeCoaching.value = null;
  }

    if (currentSession.value) {
      currentSession.value.status = "paused";
      stopRealTimeCoaching();
    }
  }

    if (currentSession.value) {
      currentSession.value.status = "active";
    }
  }

    if (!currentSession.value)
      return { success: false, error: "No active session" };

    const result = aiInterviewService.endSession(currentSession.value.id);

    if (result.success) {
      currentSession.value = result.session;
      currentQuestion.value = null;
      currentAnalysis.value = null;
      stopRealTimeCoaching();

      toast.success("Interview ended");
      logger.info("Interview session ended");
    }

    return result;
  }

    currentAnalysis.value = null;
  }

    realTimeCoaching.value = null;
  }

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
    };
  }

    currentSession.value = null;
    currentQuestion.value = null;
    currentAnalysis.value = null;
    realTimeCoaching.value = null;
    error.value = null;
    sessionStats.value = {
    };
    stopRealTimeCoaching();
  }

  // Watch for response changes to trigger real-time coaching
  watch(
    () => realTimeCoaching.value,
    (newCoaching) => {
      if (newCoaching && newCoaching.urgency === "high") {
        toast.info(newCoaching.tip, {
          position: "top-right",
        });
      }
    },
  );

  // Cleanup on unmount
  onUnmounted(() => {
    stopRealTimeCoaching();
  });

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
  };
}
