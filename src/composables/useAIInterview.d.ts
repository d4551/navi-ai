declare module '@/composables/useAIInterview' {
  interface AIInterviewHook {
    currentSession: any
    currentQuestion: any
    currentAnalysis: any
    isLoading: boolean
    isSessionActive: boolean
    startInterview: (...args: any[]) => any
    submitResponse: (...args: any[]) => any
    nextQuestion: (...args: any[]) => any
    pauseInterview: (...args: any[]) => any
    resumeInterview: (...args: any[]) => any
    endInterview: (...args: any[]) => any
    progressPercentage: any
  }

  export function useAIInterview(): AIInterviewHook
}
