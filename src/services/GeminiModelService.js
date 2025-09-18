/**
 * Gemini Model Service - Fetches available models and their capabilities
 *
 * Uses updated Google Gen AI SDK v1.16+ to get real-time model information
 * Supports voice, video, audio, real-time multi-turn, and standard chat
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '@/shared/utils/logger'

class GeminiModelService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 60 * 60 * 1000 // 1 hour cache
  }

  /**
   * Fetch available Gemini models using Google AI Studio API
   */
  async fetchAvailableModels(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required to fetch models')
    }

    // Check cache first
    const cacheKey = `gemini_models_${apiKey.slice(-8)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      logger.info(
        `Using cached Gemini models (${cached.data.models.length} models)`
      )
      return cached.data
    }

    try {
      // Test API key validity first
      await this.testAPIKey(apiKey)

      logger.info('Fetching available Gemini models from Google AI API...')

      // Use Google AI Studio API to fetch models
      // Avoid adding unnecessary headers on GET to prevent CORS preflight in some dev envs
      const url = new URL('https://generativelanguage.googleapis.com/v1/models')
      url.searchParams.set('key', apiKey)
      const response = await fetch(url.toString())

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          throw new Error(
            'Invalid API key. Please check your Google AI Studio API key.'
          )
        } else if (response.status === 403) {
          throw new Error(
            'API key lacks permissions. Please ensure your key has access to Generative AI.'
          )
        }
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      logger.debug('Raw API response:', data)

      // Filter only Gemini models and extract relevant information
      const geminiModels = data.models
        ?.filter(model => model.name && model.name.includes('gemini'))
        ?.map(model => this.parseModelInfo(model))
        ?.sort((a, b) => a.displayName.localeCompare(b.displayName))
        ?.filter(model => model.capabilities.textGeneration) // Only include working models

      const result = {
        models: geminiModels || [],
        lastUpdated: new Date().toISOString(),
        source: 'google-ai-api',
      }

      logger.info(
        `Successfully fetched ${result.models.length} Gemini models from Google AI API`
      )

      // Cache the results
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      })

      return result
    } catch (error) {
      logger.error('Failed to fetch Gemini models from API:', error)

      // If API key is invalid, don't fall back to cached data
      if (
        error.message.includes('API key') ||
        error.message.includes('Invalid')
      ) {
        throw error // Re-throw API key errors
      }

      // For other errors, try fallback
      logger.warn('Attempting fallback to curated model list...')
      return this.getFallbackModelList()
    }
  }

  /**
   * Test API key validity with current working models
   */
  async testAPIKey(apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      // Updated with current working model names (remove deprecated models)
      const candidates = ['gemini-1.5-flash', 'gemini-1.5-pro']
      let success = false
      let lastError
      for (const m of candidates) {
        try {
          const model = genAI.getGenerativeModel({ model: m })
          const result = await model.generateContent('hello')
          const response = await result.response
          if (response && response.text()) {
            success = true
            return {
              success: true,
              message: `API key valid (tested with ${m})`,
            }
          }
        } catch (err) {
          lastError = err
          const msg = err?.message || ''
          if (
            msg.includes('API_KEY_INVALID') ||
            msg.toLowerCase().includes('expired') ||
            msg.includes('PERMISSION_DENIED')
          ) {
            break
          }
        }
      }
      if (!success) {
        throw (
          lastError || new Error('API key test failed - no response received')
        )
      }
    } catch (error) {
      const errorMessage = error.message?.includes('API_KEY_INVALID')
        ? 'Invalid API key. Please check your Google AI Studio API key.'
        : error.message?.includes('PERMISSION_DENIED')
          ? 'API key lacks permissions. Please ensure your key has access to Generative AI.'
          : error.message?.toLowerCase().includes('expired')
            ? 'API key expired. Generate a new key in Google AI Studio and update your settings.'
            : `API key test failed: ${error.message}`

      throw new Error(errorMessage)
    }
  }

  /**
   * Get fallback model list when API fails
   */
  getFallbackModelList() {
    const models = this.getCuratedModelList()
    const geminiModels = models
      ?.filter(model => model.name && model.name.includes('gemini'))
      ?.map(model => this.parseModelInfo(model))
      ?.sort((a, b) => a.displayName.localeCompare(b.displayName))

    return {
      models: geminiModels || [],
      lastUpdated: new Date().toISOString(),
      source: 'fallback-curated',
    }
  }

  /**
   * Get curated list of Gemini models for fallback
   * Updated with current Google AI API model names
   */
  getCuratedModelList() {
    return [
      {
        name: 'models/gemini-2.0-flash-exp',
        displayName: 'Gemini 2.0 Flash (Exp)',
        description:
          'Latest experimental Flash model with advanced capabilities',
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'models/gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        description: 'Fast and versatile multimodal model with 1M context',
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'models/gemini-1.5-flash-8b',
        displayName: 'Gemini 1.5 Flash 8B',
        description: 'Optimized Flash model with reduced resource requirements',
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'models/gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        description:
          'High-capability model for complex reasoning and multimodal tasks',
        inputTokenLimit: 2097152,
        outputTokenLimit: 8192,
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'models/gemini-pro',
        displayName: 'Gemini Pro (Legacy)',
        description:
          'Legacy model - consider upgrading to Gemini 1.5 Flash for better performance',
        inputTokenLimit: 32768,
        outputTokenLimit: 2048,
        supportedGenerationMethods: ['generateContent'],
        deprecated: true,
      },
    ]
  }

  /**
   * Parse model information and determine capabilities
   */
  parseModelInfo(model) {
    const name = model.name.replace('models/', '') // Extract model name from full path
    const displayName = model.displayName || name
    const description = model.description || ''

    // Determine capabilities based on model name and supported generation methods
    const capabilities = this.determineCapabilities(model)

    // Parse version and release info
    const version = this.extractVersion(name)
    const isExperimental =
      name.includes('exp') || description.toLowerCase().includes('experimental')

    return {
      id: name,
      name: name,
      displayName: displayName,
      description: description,
      version: version,
      isExperimental: isExperimental,
      capabilities: capabilities,
      inputTokenLimit: model.inputTokenLimit || 32768, // Default for most Gemini models
      outputTokenLimit: model.outputTokenLimit || 2048, // Default for most Gemini models
      supportedGenerationMethods: model.supportedGenerationMethods || [
        'generateContent',
      ],
      temperature: model.temperature || { min: 0, max: 2, default: 0.7 },
      topP: model.topP || { min: 0, max: 1, default: 0.95 },
      topK: model.topK || { min: 1, max: 100, default: 40 },
    }
  }

  /**
   * Determine model capabilities based on available information
   * Enhanced for Gemini 2.0 features including live chat, video, and multimodal support
   */
  determineCapabilities(model) {
    const capabilities = {
      textGeneration: false,
      multiTurn: false,
      imageInput: false,
      videoInput: false,
      audioInput: false,
      audioOutput: false,
      realtimeChat: false,
      liveChat: false,
      codeGeneration: false,
      jsonMode: false,
      functionCalling: false,
      streaming: false,
      multimodal: false,
    }

    const methods = model.supportedGenerationMethods || []
    const name = model.name.toLowerCase()
    const description = (model.description || '').toLowerCase()

    // Check for Gemini 2.0 models which have enhanced capabilities
    const isGemini2 = name.includes('2.0') || name.includes('gemini-2')

    // Text generation (all Gemini models support this)
    if (
      methods.includes('generateContent') ||
      methods.includes('generateText') ||
      methods.length === 0
    ) {
      capabilities.textGeneration = true
      capabilities.multiTurn = true // All modern Gemini models support multi-turn
      capabilities.streaming = true // All support streaming
    }

    // Vision capabilities (Pro Vision, Flash, 2.0 models)
    if (
      name.includes('vision') ||
      name.includes('pro') ||
      name.includes('flash') ||
      isGemini2
    ) {
      capabilities.imageInput = true
      capabilities.multimodal = true
    }

    // Video capabilities (Gemini 2.0 models)
    if (isGemini2 || name.includes('video')) {
      capabilities.videoInput = true
      capabilities.multimodal = true
    }

    // Audio capabilities (2.0 models have native audio support)
    if (
      isGemini2 ||
      name.includes('audio') ||
      description.includes('audio') ||
      name.includes('live')
    ) {
      capabilities.audioInput = true
      capabilities.audioOutput = true
      capabilities.multimodal = true
    }

    // Real-time and live chat capabilities (Gemini 2.0 Flash)
    if (isGemini2 && (name.includes('flash') || name.includes('live'))) {
      capabilities.realtimeChat = true
      capabilities.liveChat = true
    }

    // Code generation (all models except nano)
    if (!name.includes('nano')) {
      capabilities.codeGeneration = true
      capabilities.jsonMode = true
      capabilities.functionCalling = true
    }

    // Enhanced multimodal for 2.0 models
    if (isGemini2) {
      capabilities.multimodal = true
    }

    return capabilities
  }

  /**
   * Extract version information from model name
   */
  extractVersion(name) {
    // Extract version like "1.5" from "gemini-1.5-flash"
    const versionMatch = name.match(/(\d+\.?\d*)/)
    return versionMatch ? versionMatch[1] : '1.0'
  }

  /**
   * Get recommended models for different use cases
   */
  getRecommendedModels(models) {
    const recommendations = {
      general: null,
      fastResponse: null,
      vision: null,
      audio: null,
      coding: null,
    }

    for (const model of models) {
      // General purpose - Pro models
      if (
        !recommendations.general &&
        model.name.includes('pro') &&
        !model.isExperimental
      ) {
        recommendations.general = model
      }

      // Fast response - Flash models
      if (!recommendations.fastResponse && model.name.includes('flash')) {
        recommendations.fastResponse = model
      }

      // Vision - models with image capabilities
      if (!recommendations.vision && model.capabilities.imageInput) {
        recommendations.vision = model
      }

      // Audio - models with audio capabilities
      if (!recommendations.audio && model.capabilities.audioInput) {
        recommendations.audio = model
      }

      // Coding - Pro models (best for code)
      if (
        !recommendations.coding &&
        model.name.includes('pro') &&
        model.capabilities.codeGeneration
      ) {
        recommendations.coding = model
      }
    }

    return recommendations
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
    logger.debug('Gemini model cache cleared')
  }

  /**
   * Get capability description for UI display
   */
  getCapabilityDescription(capability) {
    const descriptions = {
      textGeneration: 'Generate and understand text',
      multiTurn: 'Multi-turn conversations',
      imageInput: 'Analyze images and visual content',
      videoInput: 'Process and analyze video content',
      audioInput: 'Process audio input and speech',
      audioOutput: 'Generate audio responses and speech',
      realtimeChat: 'Real-time bidirectional conversation',
      liveChat: 'Live streaming conversation mode',
      codeGeneration: 'Write and understand code',
      jsonMode: 'Structured JSON output',
      functionCalling: 'Call external functions',
      streaming: 'Real-time streaming responses',
      multimodal: 'Handle multiple input types simultaneously',
    }
    return descriptions[capability] || capability
  }

  /**
   * Get capability icon for UI display
   */
  getCapabilityIcon(capability) {
    const icons = {
      textGeneration: 'mdi-text',
      multiTurn: 'mdi-chat-outline',
      imageInput: 'mdi-image-outline',
      videoInput: 'mdi-video-outline',
      audioInput: 'mdi-microphone',
      audioOutput: 'mdi-volume-high',
      realtimeChat: 'mdi-chat-processing',
      liveChat: 'mdi-broadcast',
      codeGeneration: 'mdi-code-braces',
      jsonMode: 'mdi-code-json',
      functionCalling: 'mdi-function',
      streaming: 'mdi-lightning-bolt',
      multimodal: 'mdi-grid',
    }
    return icons[capability] || 'mdi-check-circle-outline'
  }
}

export const geminiModelService = new GeminiModelService()
export default geminiModelService
