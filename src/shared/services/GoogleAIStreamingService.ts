/**
 * Google AI Streaming Service - Real-time video and screen sharing with Google Generative AI
 * Handles live media streaming to Gemini models for real-time analysis and interaction.
 *
 * @deprecated This service is superseded by the consolidated AIService. Import from `@/shared/ai/canonical`
 * for all renderer use cases. This module remains only for backward compatibility.
 */

import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
} from '@google/generative-ai'
// Minimal fallback so TS doesn't error in non-DOM build contexts (runtime still needs browser)
type SafeImageData = any
import { logger } from '@/shared/utils/logger'
import { videoService } from './VideoService'
import type { StreamingSettings } from '@/shared/types/streamingTypes'

export interface StreamingOptions {
  model?: string
  fps?: number
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface StreamingCallbacks {
  onResponse?: (_response: string) => void
  onError?: (_error: Error) => void
  onStart?: () => void
  onEnd?: () => void
  onConversationUpdate?: (_history: ConversationMessage[]) => void
  onTranscription?: (_text: string, _isFinal: boolean) => void
}

export interface ConversationMessage {
  id: string
  timestamp: Date
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'image' | 'audio'
  metadata?: {
    frameData?: string
    audioData?: ArrayBuffer
    confidence?: number
  }
}

export class GoogleAIStreamingService {
  private static instance: GoogleAIStreamingService

  private genAI: GoogleGenerativeAI | null = null
  private currentSession: ChatSession | null = null
  private currentModel: GenerativeModel | null = null
  private isStreaming = false
  private apiKey: string | null = null
  private streamingSettings: StreamingSettings | null = null

  // Multi-turn conversation support
  private conversationHistory: ConversationMessage[] = []
  private maxHistoryLength = 20
  private isMultiTurnEnabled = true

  private constructor() {}

  static getInstance(): GoogleAIStreamingService {
    if (!GoogleAIStreamingService.instance) {
      GoogleAIStreamingService.instance = new GoogleAIStreamingService()
    }
    return GoogleAIStreamingService.instance
  }

  /**
   * Update streaming settings
   */
  updateSettings(settings: StreamingSettings): void {
    this.streamingSettings = settings
    logger.debug('Streaming settings updated', settings)
  }

  /**
   * Get current streaming settings
   */
  getSettings(): StreamingSettings | null {
    return this.streamingSettings
  }

  /**
   * Add message to conversation history
   */
  private addToConversation(
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): ConversationMessage {
    const fullMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...message,
    }

    this.conversationHistory.push(fullMessage)

    // Limit history length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(
        -this.maxHistoryLength
      )
    }

    return fullMessage
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory]
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = []
  }

  /**
   * Set multi-turn mode
   */
  setMultiTurnEnabled(enabled: boolean): void {
    this.isMultiTurnEnabled = enabled
    if (!enabled) {
      this.clearConversationHistory()
    }
  }

  /**
   * Build chat history for AI context
   */
  private buildChatHistory(): any[] {
    if (!this.isMultiTurnEnabled) return []

    return this.conversationHistory
      .filter(msg => msg.type === 'text' || msg.type === 'image')
      .map(msg => ({
        role: msg.role,
        parts:
          msg.type === 'image' && msg.metadata?.frameData
            ? [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: msg.metadata.frameData,
                  },
                },
                { text: msg.content },
              ]
            : [{ text: msg.content }],
      }))
  }

  /**
   * Initialize with API key
   */
  async initialize(apiKey: string): Promise<void> {
    if (!apiKey) {
      throw new Error('API key is required')
    }

    try {
      this.apiKey = apiKey
      this.genAI = new GoogleGenerativeAI(apiKey)

      // Test the connection by attempting a lightweight generation against fallback list
      const testModels = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
      ]
      let initialized = false
      let lastError: any = null

      for (const m of testModels) {
        try {
          const testModel = this.genAI.getGenerativeModel({ model: m })
          await testModel.generateContent('ping')
          logger.info(
            `Google AI Streaming Service initialized with test model: ${m}`
          )
          initialized = true
          break
        } catch (_err) {
          lastError = err
          // Continue trying other models unless it's clearly an API key issue
          const msg = (err as Error)?.message || ''
          if (
            msg.includes('API_KEY_INVALID') ||
            msg.includes('API key expired') ||
            msg.includes('PERMISSION_DENIED')
          ) {
            break // No point in trying others
          }
        }
      }

      if (!initialized) {
        throw (
          lastError ||
          new Error('Failed to validate API key with any test model')
        )
      }
      logger.info(
        'Google AI Streaming Service initialized and tested successfully'
      )
    } catch (error) {
      this.genAI = null
      this.apiKey = null
      const rawMessage = error instanceof Error ? error.message : String(_error)
      let helpfulMessage = rawMessage
      if (
        rawMessage.includes('API_KEY_INVALID') ||
        rawMessage.toLowerCase().includes('expired')
      ) {
        helpfulMessage =
          'Gemini API key is invalid or expired. Generate a new key at https://aistudio.google.com/app/apikey and update it in Settings or set VITE_GEMINI_API_KEY in your .env.local file.'
      } else if (rawMessage.includes('PERMISSION_DENIED')) {
        helpfulMessage =
          'API key lacks required permissions. Check API restrictions in Google AI Studio (HTTP referrers / app restrictions).'
      }
      logger.error('Failed to initialize Google AI service:', {
        rawMessage,
        helpfulMessage,
      })
      throw new Error(`Failed to initialize Google AI: ${helpfulMessage}`)
    }
  }
  /**
   * Start real-time video streaming session
   */
  async startVideoStreaming(
    options: StreamingOptions = {},
    callbacks: StreamingCallbacks = {}
  ): Promise<void> {
    if (!this.genAI) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    if (this.isStreaming) {
      throw new Error('Streaming session already active')
    }

    // Use settings if available, otherwise fall back to options or defaults
    const aiSettings = this.streamingSettings?.aiStreaming

    const {
      model = aiSettings?.model || 'gemini-2.5-flash',
      fps = aiSettings?.fps || 10,
      maxTokens = aiSettings?.maxTokens || 1000,
      temperature = aiSettings?.temperature || 0.7,
      systemPrompt = aiSettings?.systemPrompt ||
        'You are a helpful AI assistant analyzing live video feed. Describe what you see and provide relevant insights.',
    } = options

    try {
      // Initialize video service if not already done
      await videoService.initialize()

      // Start camera
      const stream = await videoService.startCamera()
      this.isStreaming = true

      // Create video element for frame capture
      const videoElement = document.createElement('video')
      videoElement.srcObject = stream
      videoElement.muted = true
      videoElement.play()

      // Create canvas for frame processing
      const canvasElement = document.createElement('canvas')
      videoService.setVideoElement(videoElement)
      videoService.setCanvasElement(canvasElement)

      // Initialize Gemini model for streaming
      this.currentModel = this.genAI!.getGenerativeModel({
        model: model,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
      })

      // Start chat session with conversation history
      const chatHistory = this.buildChatHistory()
      this.currentSession = this.currentModel.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          ...chatHistory,
        ],
      })

      callbacks.onStart?.()

      // Start frame streaming to AI
      await videoService.startAIStreaming(async (frame: SafeImageData) => {
        try {
          if (!this.currentSession) {
            throw new Error('Chat session not initialized')
          }

          // Convert frame to base64 for AI processing
          const base64Frame = this.imageDataToBase64(frame)

          const framePrompt =
            'Analyze this frame and continue our conversation about what you see.'

          // Add user message to conversation history
          this.addToConversation({
            role: 'user',
            content: framePrompt,
            type: 'image',
            metadata: { frameData: base64Frame },
          })

          const result = await this.currentSession.sendMessage([
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Frame,
              },
            },
            {
              text: framePrompt,
            },
          ])

          const response = result.response.text()

          // Add AI response to conversation history
          this.addToConversation({
            role: 'assistant',
            content: response,
            type: 'text',
          })

          callbacks.onResponse?.(_response)
          callbacks.onConversationUpdate?.(this.conversationHistory)
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown error processing frame'
          logger.error('Error processing video frame:', {
            error: errorMessage,
            frame: frame.width + 'x' + frame.height,
          })

          // Don't stop streaming for individual frame errors, but notify callback
          callbacks.onError?.(
            new Error(`Frame processing failed: ${errorMessage}`)
          )
        }
      }, fps)

      logger.info(`Video streaming started with ${model} at ${fps} FPS`)
    } catch (error) {
      this.isStreaming = false
      logger.error('Failed to start video streaming:', error)
      callbacks.onError?.(error as Error)
      throw error
    }
  }

  /**
   * Start screen sharing streaming session
   */
  async startScreenStreaming(
    options: StreamingOptions = {},
    callbacks: StreamingCallbacks = {}
  ): Promise<void> {
    if (!this.genAI) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    if (this.isStreaming) {
      throw new Error('Streaming session already active')
    }

    // Use settings if available, otherwise fall back to options or defaults
    const aiSettings = this.streamingSettings?.aiStreaming

    const {
      model = aiSettings?.model || 'gemini-2.5-flash',
      fps = aiSettings?.fps || 5, // Lower FPS for screen sharing
      maxTokens = aiSettings?.maxTokens || 1000,
      temperature = aiSettings?.temperature || 0.7,
      systemPrompt = aiSettings?.systemPrompt ||
        'You are analyzing a screen share. Describe what you see on the screen and provide insights about the content and user activity.',
    } = options

    try {
      // Initialize video service if not already done
      await videoService.initialize()

      // Start screen sharing
      const stream = await videoService.startScreenShare()
      this.isStreaming = true

      // Create video element for frame capture
      const videoElement = document.createElement('video')
      videoElement.srcObject = stream
      videoElement.muted = true
      videoElement.play()

      // Create canvas for frame processing
      const canvasElement = document.createElement('canvas')
      videoService.setVideoElement(videoElement)
      videoService.setCanvasElement(canvasElement)

      // Initialize Gemini model for streaming
      this.currentModel = this.genAI!.getGenerativeModel({
        model: model,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
      })

      // Start chat session with conversation history
      const chatHistory = this.buildChatHistory()
      this.currentSession = this.currentModel.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          ...chatHistory,
        ],
      })

      callbacks.onStart?.()

      // Start frame streaming to AI
      await videoService.startAIStreaming(async (frame: SafeImageData) => {
        try {
          if (!this.currentSession) {
            throw new Error('Chat session not initialized')
          }

          // Convert frame to base64 for AI processing
          const base64Frame = this.imageDataToBase64(frame)

          const screenPrompt =
            'Analyze this screen frame and continue our conversation about what you see.'

          // Add user message to conversation history
          this.addToConversation({
            role: 'user',
            content: screenPrompt,
            type: 'image',
            metadata: { frameData: base64Frame },
          })

          const result = await this.currentSession.sendMessage([
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Frame,
              },
            },
            {
              text: screenPrompt,
            },
          ])

          const response = result.response.text()

          // Add AI response to conversation history
          this.addToConversation({
            role: 'assistant',
            content: response,
            type: 'text',
          })

          callbacks.onResponse?.(_response)
          callbacks.onConversationUpdate?.(this.conversationHistory)
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown error processing screen frame'
          logger.error('Error processing screen frame:', {
            error: errorMessage,
            frame: frame.width + 'x' + frame.height,
          })

          // Don't stop streaming for individual frame errors, but notify callback
          callbacks.onError?.(
            new Error(`Screen frame processing failed: ${errorMessage}`)
          )
        }
      }, fps)

      logger.info(`Screen streaming started with ${model} at ${fps} FPS`)
    } catch (error) {
      this.isStreaming = false
      logger.error('Failed to start screen streaming:', error)
      callbacks.onError?.(error as Error)
      throw error
    }
  }

  /**
   * Stop current streaming session
   */
  stopStreaming(): void {
    try {
      if (this.isStreaming) {
        videoService.stopAIStreaming()
        videoService.stopCamera()
        videoService.stopScreenShare()
        this.currentSession = null
        this.currentModel = null
        this.isStreaming = false
        logger.info('Streaming session stopped')
      }
    } catch (error) {
      logger.error('Error stopping streaming session:', error)
      // Force cleanup even if there were errors
      this.currentSession = null
      this.currentModel = null
      this.isStreaming = false
    }
  }

  /**
   * Send text message during streaming session
   */
  async sendMessage(
    text: string,
    callbacks?: StreamingCallbacks
  ): Promise<string> {
    if (!this.currentSession) {
      throw new Error('No active streaming session')
    }

    if (!text?.trim()) {
      throw new Error('Message text is required')
    }

    try {
      // Add user message to conversation history
      this.addToConversation({
        role: 'user',
        content: text,
        type: 'text',
      })

      const result = await this.currentSession.sendMessage(text)
      const response = result.response.text()

      if (!response) {
        throw new Error('Empty response from AI service')
      }

      // Add AI response to conversation history
      this.addToConversation({
        role: 'assistant',
        content: response,
        type: 'text',
      })

      // Notify callbacks if provided
      callbacks?.onResponse?.(_response)
      callbacks?.onConversationUpdate?.(this.conversationHistory)

      return response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error sending message'
      logger.error('Error sending message:', {
        error: errorMessage,
        messageLength: text.length,
      })
      throw new Error(`Failed to send message: ${errorMessage}`)
    }
  }

  /**
   * Convert ImageData to base64 string for AI processing
   */
  private imageDataToBase64(imageData: SafeImageData): string {
    // Create a temporary canvas to convert ImageData to JPEG
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)

    // Convert to JPEG with reasonable quality
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
  }

  /**
   * Check if streaming is active
   */
  isActive(): boolean {
    return this.isStreaming
  }

  /**
   * Get current streaming status
   */
  getStatus(): {
    isStreaming: boolean
    isCameraActive: boolean
    isScreenActive: boolean
    isInitialized: boolean
    hasApiKey: boolean
  } {
    return {
      isStreaming: this.isStreaming,
      isCameraActive: videoService.isCameraActive(),
      isScreenActive: videoService.isScreenShareActive(),
      isInitialized: !!this.genAI,
      hasApiKey: !!this.apiKey,
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopStreaming()
    this.genAI = null
    logger.info('Google AI Streaming Service cleaned up')
  }

  /**
   * Process a single video frame with optional prompt.
   * Accepts base64 JPEG data (no prefix) or ImageData. Returns plain text response.
   */
  async processVideoFrame(
    frame: string | SafeImageData,
    options: { prompt?: string; includeContext?: boolean; model?: string } = {}
  ): Promise<{ content: string; confidence?: number }> {
    try {
      // Ensure SDK initialized
      if (!this.genAI) {
        // Attempt best-effort initialization from env/localStorage to avoid hard failures
        const envKey =
          ((typeof import.meta !== 'undefined' &&
            (import.meta as any)?.env?.VITE_GEMINI_API_KEY) as
            | string
            | undefined) ||
          ((typeof process !== 'undefined' &&
            (process as any)?.env?.VITE_GEMINI_API_KEY) as
            | string
            | undefined) ||
          (typeof localStorage !== 'undefined'
            ? (localStorage.getItem('gemini_api_key') as string | null)
            : null)
        if (envKey) {
          await this.initialize(envKey as string)
        } else {
          throw new Error('Google AI not initialized and no API key available')
        }
      }

      const prompt =
        options.prompt || 'Analyze this frame and describe what you see.'
      const modelId = options.model || 'gemini-2.5-flash'
      const base64 =
        typeof frame === 'string' ? frame : this.imageDataToBase64(frame)

      // If an active session exists and includeContext requested, use it for continuity
      if (this.currentSession && options.includeContext) {
        const result = await this.currentSession.sendMessage([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64,
            },
          },
          { text: prompt },
        ])
        const text = result?.response?.text?.() || ''
        return { content: text }
      }

      // One-off call
      const model = this.genAI!.getGenerativeModel({ model: modelId })
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64,
          },
        },
        { text: prompt },
      ])
      const text = result?.response?.text?.() || ''
      return { content: text }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error('processVideoFrame failed:', msg)
      throw error
    }
  }
}

export const googleAIStreamingService = GoogleAIStreamingService.getInstance()
