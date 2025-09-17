/**
 * 🤖 CANONICAL AI SERVICE
 * Single source of truth for all AI functionality
 * Consolidates text, multimodal, streaming, and real-time features
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'
import { logger } from '@/shared/utils/logger'

export interface AIConfig {
  geminiApiKey?: string
  openaiApiKey?: string
  azureEndpoint?: string
  primaryProvider: 'google' | 'openai' | 'azure'
  enableContextPersistence: boolean
  enableRealTime: boolean
  enableMultimodal: boolean
  maxTokens: number
  temperature: number
  safetySettings?: HarmBlockThreshold
}

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
  timestamp: Date
}

export interface StreamingResponse {
  success: boolean
  stream?: ReadableStream
  error?: string
  onChunk?: (chunk: string) => void
  onComplete?: (fullContent: string) => void
  onError?: (error: Error) => void
}

export interface MultimodalInput {
  text?: string
  images?: Array<{
    data: string // base64
    mimeType: string
  }>
  audio?: {
    data: string // base64
    mimeType: string
  }
}

class CanonicalAIService {
  private config: AIConfig | null = null
  private geminiClient: GoogleGenerativeAI | null = null
  private conversationHistory = new Map<string, any[]>()
  private isInitialized = false

  async initialize(config: Partial<AIConfig>): Promise<void> {
    this.config = {
      primaryProvider: 'google',
      enableContextPersistence: true,
      enableRealTime: false,
      enableMultimodal: true,
      maxTokens: 8192,
      temperature: 0.7,
      safetySettings: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      ...config,
    }

    try {
      if (
        this.config.geminiApiKey &&
        this.config.primaryProvider === 'google'
      ) {
        this.geminiClient = new GoogleGenerativeAI(this.config.geminiApiKey)
        logger.info('🤖 Navi AI initialized')
      }

      this.isInitialized = true
      logger.info('[✓] Canonical AI Service initialized')
    } catch (error) {
      logger.error('[✗] AI Service initialization failed:', error)
      throw new Error(`AI initialization failed: ${error.message}`)
    }
  }

  async generateText(
    prompt: string,
    options: {
      model?: string
      systemPrompt?: string
      conversationId?: string
      streaming?: boolean
    } = {}
  ): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized')
    }

    const __startTime = Date.now()

    try {
      const model = this.geminiClient?.getGenerativeModel({
        model: options.model || 'gemini-2.5-flash',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: this.config!.safetySettings!,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: this.config!.safetySettings!,
          },
        ],
        generationConfig: {
          maxOutputTokens: this.config!.maxTokens,
          temperature: this.config!.temperature,
        },
      })

      if (!model) {
        throw new Error('AI model not available')
      }

      // Build conversation context
      let fullPrompt = prompt
      if (options.systemPrompt) {
        fullPrompt = `${options.systemPrompt}\n\nUser: ${prompt}`
      }

      if (options.conversationId && this.config!.enableContextPersistence) {
        const history =
          this.conversationHistory.get(options.conversationId) || []
        if (history.length > 0) {
          const contextPrompt = history
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n')
          fullPrompt = `${contextPrompt}\nUser: ${prompt}`
        }
      }

      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      // Store in conversation history
      if (options.conversationId && this.config!.enableContextPersistence) {
        const history =
          this.conversationHistory.get(options.conversationId) || []
        history.push({ role: 'user', content: prompt })
        history.push({ role: 'assistant', content: text })

        // Keep only last 20 exchanges
        if (history.length > 40) {
          history.splice(0, history.length - 40)
        }

        this.conversationHistory.set(options.conversationId, history)
      }

      return {
        success: true,
        content: text,
        model: options.model || 'gemini-1.5-pro',
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0,
        },
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('AI text generation failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  async generateMultimodal(
    input: MultimodalInput,
    options: {
      model?: string
      conversationId?: string
    } = {}
  ): Promise<AIResponse> {
    if (!this.config?.enableMultimodal) {
      throw new Error('Multimodal features not enabled')
    }

    try {
      // Gemini 1.5 Pro supports multimodal (images/audio). '-vision' is deprecated.
      const model = this.geminiClient?.getGenerativeModel({
        model: options.model || 'gemini-1.5-pro',
      })

      if (!model) {
        throw new Error('Multimodal model not available')
      }

      const parts: any[] = []

      if (input.text) {
        parts.push({ text: input.text })
      }

      if (input.images) {
        input.images.forEach(image => {
          parts.push({
            inlineData: {
              data: image.data,
              mimeType: image.mimeType,
            },
          })
        })
      }

      if (input.audio) {
        parts.push({
          inlineData: {
            data: input.audio.data,
            mimeType: input.audio.mimeType,
          },
        })
      }

      const result = await model.generateContent(parts)
      const response = await result.response
      const text = response.text()

      return {
        success: true,
        content: text,
        model: options.model || 'gemini-1.5-pro',
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('AI multimodal generation failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  async generateStream(
    prompt: string,
    options: {
      model?: string
      systemPrompt?: string
      conversationId?: string
    } = {}
  ): Promise<StreamingResponse> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized')
    }

    try {
      const model = this.geminiClient?.getGenerativeModel({
        model: options.model || 'gemini-2.5-flash',
      })

      if (!model) {
        throw new Error('AI model not available')
      }

      let fullPrompt = prompt
      if (options.systemPrompt) {
        fullPrompt = `${options.systemPrompt}\n\nUser: ${prompt}`
      }

      const result = await model.generateContentStream(fullPrompt)
      let fullContent = ''

      const stream = new ReadableStream({
        start(controller) {
          ;(async () => {
            try {
              for await (const chunk of result.stream) {
                const chunkText = chunk.text()
                fullContent += chunkText

                controller.enqueue(chunkText)
              }
              controller.close()
            } catch (error) {
              controller.error(error)
            }
          })()
        },
      })

      return {
        success: true,
        stream,
      }
    } catch (error) {
      logger.error('AI streaming failed:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Enhanced real-time conversation methods
  async startRealTimeSession(
    sessionId: string,
    options: {
      onMessage?: (message: string) => void
      onError?: (error: Error) => void
      onConnect?: () => void
      onDisconnect?: () => void
      enableAudio?: boolean
      enableVideo?: boolean
    } = {}
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    if (!this.config?.enableRealTime) {
      return { success: false, error: 'Real-time features not enabled' }
    }

    try {
      logger.info(`🎤 Starting enhanced real-time session: ${sessionId}`)

      // Initialize real-time session with enhanced capabilities
      const sessionData = {
        id: sessionId,
        startTime: Date.now(),
        isActive: true,
        options,
        messageCount: 0,
        lastActivity: Date.now(),
      }

      // Store session for management
      this.conversationHistory.set(sessionId, [])

      // Set up session monitoring
      const sessionMonitor = setInterval(() => {
        const currentTime = Date.now()
        if (currentTime - sessionData.lastActivity > 300000) {
          // 5 minutes timeout
          logger.info(`⏰ Session ${sessionId} timed out due to inactivity`)
          this.stopRealTimeSession(sessionId)
          clearInterval(sessionMonitor)
        }
      }, 60000) // Check every minute

      // Initialize audio/video capabilities if requested
      if (options.enableAudio || options.enableVideo) {
        try {
          await this.initializeMediaCapabilities(sessionId, options)
        } catch (mediaError) {
          logger.warn(
            `Media capabilities initialization warning for session ${sessionId}:`,
            mediaError
          )
          // Continue without media - don't fail the session
        }
      }

      options.onConnect?.()

      return {
        success: true,
        sessionId,
      }
    } catch (error) {
      logger.error('Real-time session failed:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Helper method to initialize media capabilities
  private async initializeMediaCapabilities(
    sessionId: string,
    options: {
      enableAudio?: boolean
      enableVideo?: boolean
    }
  ): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices not available in this environment')
    }

    const constraints: MediaStreamConstraints = {}

    if (options.enableAudio) {
      constraints.audio = {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      }
    }

    if (options.enableVideo) {
      constraints.video = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      }
    }

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    logger.info(`📹 Media capabilities initialized for session ${sessionId}`)

    // Store media stream for session (in real implementation, this would be properly managed)
    // For now, we'll just validate the capability
    mediaStream.getTracks().forEach(track => track.stop())
  }

  async stopRealTimeSession(sessionId: string): Promise<void> {
    logger.info(`🛑 Stopping real-time session: ${sessionId}`)
    // Clean up session data
    this.clearConversationHistory(sessionId)
  }

  async sendRealTimeMessage(
    sessionId: string,
    message: string
  ): Promise<AIResponse> {
    return this.generateText(message, {
      conversationId: sessionId,
      streaming: true,
    })
  }

  clearConversationHistory(conversationId?: string): void {
    if (conversationId) {
      this.conversationHistory.delete(conversationId)
    } else {
      this.conversationHistory.clear()
    }
  }

  // Audio processing for push-to-talk
  async processAudio(
    audioData: ArrayBuffer,
    options: {
      format?: 'wav' | 'mp3' | 'webm'
      transcribeOnly?: boolean
      systemPrompt?: string
    } = {}
  ): Promise<{
    success: boolean
    transcript?: string
    response?: string
    error?: string
  }> {
    if (!this.isInitialized) {
      return { success: false, error: 'AI Service not initialized' }
    }

    try {
      // Convert audio to base64
      const audioBase64 = btoa(
        String.fromCharCode(...new Uint8Array(audioData))
      )
      const mimeType = `audio/${options.format || 'wav'}`

      // Use Gemini's built-in audio processing capabilities
      const model = this.geminiClient?.getGenerativeModel({
        model: 'gemini-1.5-pro', // Pro model supports audio input
      })

      if (!model) {
        return { success: false, error: 'Audio processing model not available' }
      }

      const prompt = options.transcribeOnly
        ? 'Please transcribe the audio content accurately.'
        : options.systemPrompt ||
          'Please transcribe this audio and provide a helpful response.'

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: audioBase64,
            mimeType,
          },
        },
      ])

      const response = await result.response
      const text = response.text()

      if (options.transcribeOnly) {
        return {
          success: true,
          transcript: text,
        }
      }

      // For full processing, try to separate transcript from response
      const lines = text.split('\n')
      const transcript = lines[0] || text.substring(0, text.length / 2)
      const aiResponse = lines.length > 1 ? lines.slice(1).join('\n') : text

      return {
        success: true,
        transcript: transcript.trim(),
        response: aiResponse.trim(),
      }
    } catch (error) {
      logger.error('Audio processing failed:', error)
      return {
        success: false,
        error: `Audio processing error: ${error.message}`,
      }
    }
  }

  // Health check with comprehensive testing
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: any
  }> {
    if (!this.isInitialized) {
      return {
        status: 'unhealthy',
        details: { error: 'Service not initialized' },
      }
    }

    const testResults = {
      basicGeneration: false,
      streamingCapability: false,
      multimodalCapability: false,
      contextPersistence: false,
      errors: [] as string[],
    }

    try {
      // Test 1: Basic text generation
      const testResult = await this.generateText('Hello', {
        model: 'gemini-1.5-flash',
      })
      testResults.basicGeneration = testResult.success
      if (!testResult.success) {
        testResults.errors.push(`Basic generation: ${testResult.error}`)
      }

      // Test 2: Streaming capability
      if (testResult.success) {
        try {
          const streamResult = await this.generateStream('Test streaming')
          testResults.streamingCapability = streamResult.success
          if (!streamResult.success) {
            testResults.errors.push(`Streaming: ${streamResult.error}`)
          }
        } catch (error) {
          testResults.errors.push(`Streaming test: ${error.message}`)
        }
      }

      // Test 3: Multimodal if enabled
      if (this.config?.enableMultimodal) {
        try {
          const multimodalResult = await this.generateMultimodal({
            text: 'Hello',
          })
          testResults.multimodalCapability = multimodalResult.success
          if (!multimodalResult.success) {
            testResults.errors.push(`Multimodal: ${multimodalResult.error}`)
          }
        } catch (error) {
          testResults.errors.push(`Multimodal test: ${error.message}`)
        }
      } else {
        testResults.multimodalCapability = true // Not enabled, so pass
      }

      // Test 4: Context persistence
      if (this.config?.enableContextPersistence) {
        try {
          const contextId = `health-check-${Date.now()}`
          await this.generateText('Remember this number: 42', {
            conversationId: contextId,
          })
          const contextResult = await this.generateText(
            'What number should I remember?',
            { conversationId: contextId }
          )
          testResults.contextPersistence =
            contextResult.success &&
            contextResult.content?.toLowerCase().includes('42')
          if (!testResults.contextPersistence) {
            testResults.errors.push(
              'Context persistence: Failed to maintain conversation context'
            )
          }
          // Clean up test context
          this.clearConversationHistory(contextId)
        } catch (error) {
          testResults.errors.push(`Context test: ${error.message}`)
        }
      } else {
        testResults.contextPersistence = true // Not enabled, so pass
      }

      // Determine overall status
      const allPassed =
        testResults.basicGeneration &&
        testResults.streamingCapability &&
        testResults.multimodalCapability &&
        testResults.contextPersistence
      const somePassed = testResults.basicGeneration

      return {
        status: allPassed ? 'healthy' : somePassed ? 'degraded' : 'unhealthy',
        details: {
          provider: this.config?.primaryProvider,
          multimodal: this.config?.enableMultimodal,
          realTime: this.config?.enableRealTime,
          contextPersistence: this.config?.enableContextPersistence,
          lastTest: new Date().toISOString(),
          tests: testResults,
          summary: `${Object.values(testResults).filter(v => v === true).length - 1}/${Object.keys(testResults).length - 1} tests passed`,
        },
      }
    } catch (error) {
      testResults.errors.push(`Health check: ${error.message}`)
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          tests: testResults,
          lastTest: new Date().toISOString(),
        },
      }
    }
  }

  // Configuration getters
  get isReady(): boolean {
    return this.isInitialized && !!this.config
  }

  get currentConfig(): Partial<AIConfig> | null {
    return this.config ? { ...this.config, geminiApiKey: '[REDACTED]' } : null
  }
}

// Export singleton instance
export const canonicalAI = new CanonicalAIService()
export default canonicalAI
