/**
 * Canonical AI Facade (Renderer Import Surface)
 * Unified interface for all AI operations in the application.
 * All renderer code should import from here going forward.
 */
import { aiService } from '@/shared/services/AIService'
import { logger } from '@/shared/utils/logger'
import type { AIProvider } from '@/shared/types/ai'

// Track active real-time sessions and configuration
let currentSessions: Map<string, string> = new Map()
let currentProvider: AIProvider = 'gemini' as AIProvider
let isInitialized = false

export interface AIConfiguration {
  provider?: AIProvider
  model?: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
  systemInstructions?: string
}

export interface GenerationOptions {
  temperature?: number
  maxTokens?: number
  topK?: number
  topP?: number
  systemInstructions?: string
  provider?: AIProvider
  model?: string
}

export interface StreamHandlers {
  onChunk?: (chunk: string) => void
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
}

export const ai = {
  async init(config: AIConfiguration = {}) {
    try {
      logger.info('Initializing canonical AI service', config)

      await aiService.initialize({
        provider: config.provider || currentProvider,
        model: config.model,
        apiKey: config.apiKey,
        ...config,
      })

      if (config.provider) {
        currentProvider = config.provider
      }

      isInitialized = true
      return aiService
    } catch (error) {
      logger.error('Failed to initialize AI service', error)
      throw error
    }
  },

  async generateText(message: string, options: GenerationOptions = {}) {
    if (!isInitialized) {
      try {
        await this.init({ provider: options.provider })
      } catch (error) {
        logger.error('AI service initialization failed', error)
        throw error // Let the specific initialization error bubble up
      }
    }

    try {
      return await aiService.chat({
        message,
        type: 'chat',
        provider: options.provider || currentProvider,
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        systemInstructions: options.systemInstructions,
        ...options,
      })
    } catch (error) {
      logger.error('Text generation failed', error)
      throw error // Let the specific error bubble up instead of generic message
    }
  },

  async stream(
    message: string,
    handlers: StreamHandlers = {},
    options: GenerationOptions = {}
  ) {
    if (!isInitialized) {
      try {
        await this.init({ provider: options.provider })
      } catch (error) {
        logger.error('AI service initialization failed', error)
        const initError = new Error(
          'AI service not available - please configure your API key in settings'
        )
        handlers.onError?.(initError)
        throw initError
      }
    }

    try {
      return await aiService.chatStream({
        message,
        type: 'chat',
        provider: options.provider || currentProvider,
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        systemInstructions: options.systemInstructions,
        onChunk: handlers.onChunk,
        onComplete: handlers.onComplete,
        onError: handlers.onError,
        ...options,
      })
    } catch (error) {
      logger.error('Streaming failed', error)
      handlers.onError?.(error)
      throw error
    }
  },

  async analyzeImage(
    imageData: string | ArrayBuffer,
    prompt: string,
    options: GenerationOptions = {}
  ) {
    if (!isInitialized) {
      try {
        await this.init({ provider: options.provider })
      } catch (error) {
        logger.error('AI service initialization failed', error)
        throw new Error(
          'AI service not available - please configure your API key in settings'
        )
      }
    }

    try {
      return await aiService.chat({
        message: prompt,
        type: 'multimodal',
        imageData,
        provider: options.provider || currentProvider,
        ...options,
      })
    } catch (error) {
      logger.error('Image analysis failed', error)
      throw error
    }
  },

  async processAudio(
    audioData: ArrayBuffer,
    prompt: string,
    options: GenerationOptions = {}
  ) {
    if (!isInitialized) {
      try {
        await this.init({ provider: options.provider })
      } catch (error) {
        logger.error('AI service initialization failed', error)
        throw new Error(
          'AI service not available - please configure your API key in settings'
        )
      }
    }

    try {
      return await aiService.chat({
        message: prompt,
        type: 'audio',
        audioData,
        provider: options.provider || currentProvider,
        ...options,
      })
    } catch (error) {
      logger.error('Audio processing failed', error)
      throw error
    }
  },

  getStatus() {
    return {
      initialized: isInitialized,
      provider: currentProvider,
      activeSessions: currentSessions.size,
      availableProviders: ['gemini', 'openai', 'claude', 'grok'],
    }
  },

  async startRealTime(options: GenerationOptions = {}) {
    if (!isInitialized) {
      try {
        await this.init({ provider: options.provider })
      } catch (error) {
        logger.error('AI service initialization failed', error)
        throw new Error(
          'AI service not available - please configure your API key in settings'
        )
      }
    }

    try {
      const sessionId = `realtime-${Date.now()}`
      const sessionKey = await aiService.startRealTimeSession({
        sessionId,
        provider: options.provider || currentProvider,
        ...options,
      })

      currentSessions.set(sessionId, sessionKey)
      return sessionId
    } catch (error) {
      logger.error('Failed to start real-time session', error)
      throw error
    }
  },

  async stopRealTime(sessionId?: string) {
    try {
      if (sessionId && currentSessions.has(sessionId)) {
        const sessionKey = currentSessions.get(sessionId)!
        await aiService.stopRealTimeSession(sessionKey)
        currentSessions.delete(sessionId)
        return true
      } else if (!sessionId && currentSessions.size > 0) {
        // Stop all sessions
        for (const [id, key] of currentSessions.entries()) {
          await aiService.stopRealTimeSession(key)
          currentSessions.delete(id)
        }
        return true
      }
      return false
    } catch (error) {
      logger.error('Failed to stop real-time session', error)
      return false
    }
  },

  async switchProvider(
    provider: AIProvider,
    config?: Partial<AIConfiguration>
  ) {
    try {
      currentProvider = provider
      await this.init({ provider, ...config })
      logger.info(`Switched to provider: ${provider}`)
    } catch (_error) {
      logger.error(`Failed to switch to provider: ${provider}`, error)
      throw error
    }
  },

  async getModels(provider?: AIProvider) {
    const targetProvider = provider || currentProvider
    try {
      return await aiService.getModels(targetProvider)
    } catch (error) {
      logger.error(
        `Failed to get models for provider: ${targetProvider}`,
        error
      )
      throw error
    }
  },
}

export type CanonicalAI = typeof ai
