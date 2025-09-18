/**
 * USE AI COMPOSABLE
 * =================
 *
 * Vue 3 composable for AI interactions with multimodal support
 * Provides reactive state and easy-to-use methods for AI features
 */

import {
  reactive,
  readonly,
  computed,
  onUnmounted,
  getCurrentInstance,
} from 'vue'
import { ai } from '@/shared/ai/canonical'
import { AIProvider } from '@/shared/types/ai'
import type {
  AIClientConfig,
  AIRequest,
  StreamingAIRequest,
} from '@/shared/services/CanonicalAIClient'
import type { StreamingLog } from '@/shared/types/multimodal-live'
import { logger } from '@/shared/utils/logger'

interface UseAIState {
  isInitialized: boolean
  isConnected: boolean
  isRecording: boolean
  isProcessing: boolean
  error: string | null
  logs: StreamingLog[]
  currentResponse: string
  audioVolume: number
  devices: MediaDeviceInfo[]
}

export function useAI(initialConfig?: Partial<AIClientConfig>) {
  // Reactive state
  const state = reactive<UseAIState>({
    isInitialized: false,
    isConnected: false,
    isRecording: false,
    isProcessing: false,
    error: null,
    logs: [],
    currentResponse: '',
    audioVolume: 0,
    devices: [],
  })

  // AI client instance - using canonical AI service
  let aiInitialized = false

  // Event handlers for cleanup
  const eventHandlers = new Map<string, Function>()

  /**
   * Initialize AI client with configuration
   */
  const initialize = async (config?: AIClientConfig) => {
    try {
      state.error = null
      state.isProcessing = true

      const finalConfig = config || {
        apiKey: (import.meta as any).env?.VITE_GOOGLE_AI_API_KEY || '',
        model: 'gemini-2.5-flash',
        enableMultimodal: true,
        ...initialConfig,
      }

      if (!finalConfig.apiKey) {
        throw new Error('Google AI API key is required')
      }

      await ai.init({
        provider: AIProvider.GEMINI,
        model: finalConfig.model,
        apiKey: finalConfig.apiKey,
      })

      aiInitialized = true
      state.isInitialized = true

      logger.info('[useAI] Initialized successfully')
    } catch (error: any) {
      state.error = error.message
      logger.error('[useAI] Initialization failed:', error)
      throw error
    } finally {
      state.isProcessing = false
    }
  }

  /**
   * Generate text using AI
   */
  const generateText = async (request: AIRequest | string): Promise<string> => {
    if (!aiInitialized) {
      throw new Error('AI client not initialized')
    }

    try {
      state.error = null
      state.isProcessing = true
      state.currentResponse = ''

      const message =
        typeof request === 'string' ? request : (request as any).message || ''
      const result = await ai.generateText(message)
      state.currentResponse =
        typeof result === 'string' ? result : result.content || ''
      return state.currentResponse
    } catch (error: any) {
      state.error = error.message
      logger.error('[useAI] Text generation failed:', error)
      throw error
    } finally {
      state.isProcessing = false
    }
  }

  /**
   * Stream text with real-time updates
   */
  const streamText = async (
    request: StreamingAIRequest,
    onChunk?: (_chunk: string) => void
  ): Promise<string> => {
    if (!aiInitialized) {
      throw new Error('AI client not initialized')
    }

    try {
      state.error = null
      state.isProcessing = true
      state.currentResponse = ''

      const message =
        typeof request === 'string' ? request : (request as any).message || ''
      await ai.stream(message, {
        onChunk: (chunk: string) => {
          state.currentResponse += chunk
          onChunk?.(_chunk)
        },
        onError: (error: Error) => {
          state.error = error.message
        },
      })

      return state.currentResponse
    } catch (error: any) {
      state.error = error.message
      logger.error('[useAI] Streaming failed:', error)
      throw error
    } finally {
      state.isProcessing = false
    }
  }

  /**
   * Start multimodal session with voice
   */
  const startMultimodalSession = async (_config?: any) => {
    if (!aiInitialized) {
      throw new Error('AI client not initialized')
    }

    try {
      state.error = null
      // Start real-time session using canonical AI
      const _sessionId = await ai.startRealTime()
      state.isConnected = true

      logger.info('[useAI] Real-time session started')
    } catch (error: any) {
      state.error = error.message
      throw error
    }
  }

  /**
   * Start audio recording (push-to-talk)
   */
  const startRecording = async () => {
    if (!aiInitialized) {
      throw new Error('AI client not initialized')
    }

    try {
      state.error = null
      // Note: Audio recording not implemented in canonical AI facade yet
      state.isRecording = true
      logger.warn('[useAI] Audio recording not implemented')
    } catch (error: any) {
      state.error = error.message
      throw error
    }
  }

  /**
   * Stop audio recording
   */
  const stopRecording = () => {
    state.isRecording = false
  }

  /**
   * Send text message in multimodal session
   */
  const sendMessage = (_message: string) => {
    if (!state.isConnected) {
      throw new Error('Multimodal session not connected')
    }

    try {
      // Note: Real-time messaging not fully implemented in canonical AI facade yet
      logger.warn('[useAI] Real-time messaging not implemented')
      state.currentResponse = ''
    } catch (_error: any) {
      state.error = _error.message
      throw _error
    }
  }

  /**
   * Get available audio devices
   */
  const getAudioDevices = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      state.devices = devices.filter(device => device.kind === 'audioinput')
      return state.devices
    } catch {
      state.error = 'Failed to get audio devices'
      return []
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    state.error = null
  }

  /**
   * Reset all state
   */
  const reset = () => {
    state.isConnected = false
    state.isRecording = false
    state.isProcessing = false
    state.error = null
    state.currentResponse = ''
    state.logs = []
    state.audioVolume = 0
  }

  /**
   * Setup multimodal event handlers
   */
  const _setupMultimodalHandlers = () => {
    // Note: Event handlers not implemented in canonical AI facade yet
    logger.warn('[useAI] Multimodal event handlers not implemented')
  }

  /**
   * Computed properties
   */
  const canRecord = computed(() => state.isInitialized && !state.isProcessing)

  const canSendMessage = computed(
    () => state.isInitialized && state.isConnected && !state.isProcessing
  )

  const hasError = computed(() => state.error !== null)

  const isActive = computed(() => state.isRecording || state.isProcessing)

  /**
   * Cleanup on unmount - only register if we're in a component instance
   */
  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      // Remove event handlers
      eventHandlers.forEach((_handler, _event) => {
        // Note: Event cleanup not implemented in canonical AI facade yet
      })
      eventHandlers.clear()

      // Cleanup AI resources
      ai.stopRealTime()
    })
  }

  return {
    // State
    state: readonly(state),

    // Computed
    canRecord,
    canSendMessage,
    hasError,
    isActive,

    // Methods
    initialize,
    generateText,
    streamText,
    startMultimodalSession,
    startRecording,
    stopRecording,
    sendMessage,
    getAudioDevices,
    clearError,
    reset,
  }
}

// Type helper for the composable return
export type UseAIReturn = ReturnType<typeof useAI>
