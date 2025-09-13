/* eslint-env node */
/* global fetch, AbortController, setTimeout, clearTimeout */
/**
 * CANONICAL MAIN PROCESS AI SERVICE
 * Secure Google AI Studio SDK integration for NAVI
 * Single source of truth for all AI operations
 */

const { GoogleGenAI } = require('@google/genai');
const { logger } = require('../../src/shared/utils/logger.cjs');

class MainAIService {
  constructor() {
    this._client = null;
    this._model = null;
    this._modelId = null;
    this._apiKey = null;
    this._metrics = {
      requests: 0,
      tokensIn: 0,
      tokensOut: 0,
      lastLatencyMs: 0,
      errors: 0,
      averageLatency: 0,
      successRate: 0
    };
    this._streamCancellations = new Set();
    
    // Enhanced caching
    this._cache = {
      models: { data: null, timestamp: null, ttl: 5 * 60 * 1000 }, // 5 minutes
      responses: new Map() // LRU cache for responses
    };
    this._maxCacheSize = 50;
    
    // Performance monitoring
    this._performanceMetrics = {
      requestLatencies: [],
      errorTypes: new Map(),
      hourlyStats: new Map()
    };
    
    // Cache statistics
    this._cacheStats = {
      total: 0,
      hits: 0
    };
  }

  async initialize(apiKey, modelId = 'gemini-1.5-flash') {
    try {
      if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
        throw new Error('Invalid API key format');
      }

      // Initialize Google Gen AI client (js-genai)
      this._client = new GoogleGenAI({ apiKey });
      this._apiKey = apiKey;
      this._modelId = modelId;

      // With @google/genai, we pass model and config per request
      this._model = true;

      this._initTimestamp = Date.now();
      logger.info(`AI service initialized with model: ${modelId}`);
      return { success: true, model: modelId, timestamp: this._initTimestamp };
    } catch (error) {
      logger.error('AI service initialization failed:', error);
      this._client = null;
      this._model = null;
      this._modelId = null;
      throw new Error(`AI initialization failed: ${error.message}`);
    }
  }

  ensureReady() {
    if (!this._model || !this._client) {
      throw new Error('AI service not initialized. Please configure your API key first.');
    }
  }

  async generateText(prompt, { systemInstructions, options = {} } = {}) {
    this.ensureReady();
    
    const startTime = Date.now();
    const contents = systemInstructions && systemInstructions.trim()
      ? `${systemInstructions.trim()}\n---\n${prompt}`
      : prompt;

    const shouldRetry = (err) => {
      const msg = (err?.message || '').toLowerCase();
      return (
        /rate|quota|busy|timeout|temporarily|503|502|429/.test(msg) ||
        (err?.status && [429, 500, 502, 503, 504].includes(err.status))
      );
    };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      try {
        const result = await this._client.models.generateContent({
          model: this._modelId,
          contents,
          config: {
            temperature: options.temperature ?? 0.9,
            topK: options.topK ?? 32,
            topP: options.topP ?? 1,
            maxOutputTokens: options.maxTokens ?? 8192,
          },
        });
        return this.processNewResponse(result, startTime);
      } catch (error) {
        this._metrics.errors++;
        if (attempt < maxAttempts - 1 && shouldRetry(error)) {
          const backoff = 300 * Math.pow(2, attempt); // 300ms, 600ms
          await sleep(backoff);
          attempt++;
          continue;
        }
        console.error('[AI] Generation failed:', error);
        logger.error('AI text generation failed:', error);
        throw this.handleAPIError(error);
      }
    }
  }

  async *streamText(prompt, { systemInstructions, options = {} } = {}) {
    this.ensureReady();
    
    const startTime = Date.now();
    const requestId = `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const contents = systemInstructions && systemInstructions.trim()
      ? `${systemInstructions.trim()}\n---\n${prompt}`
      : prompt;
    
    try {
      const result = await this._client.models.generateContentStream({
        model: this._modelId,
        contents,
        config: {
          temperature: options.temperature ?? 0.9,
          topK: options.topK ?? 32,
          topP: options.topP ?? 1,
          maxOutputTokens: options.maxTokens ?? 8192,
        }
      });
      let totalText = '';

      for await (const chunk of result.stream) {
        // Check for cancellation
        if (this._streamCancellations.has(requestId)) {
          this._streamCancellations.delete(requestId);
          logger.info(`AI stream ${requestId} cancelled`);
          return { cancelled: true };
        }

        const chunkText = chunk.text();
        if (chunkText) {
          totalText += chunkText;
          yield { 
            chunk: chunkText, 
            aggregate: totalText,
            requestId 
          };
        }
      }

      // Update metrics
      const latencyMs = Date.now() - startTime;
      this._metrics.requests++;
      this._metrics.lastLatencyMs = latencyMs;

      // Get final response for usage metadata
      const finalResponse = await result.response;
      const usage = finalResponse?.usage || finalResponse?.usageMetadata;
      if (usage) {
        this._metrics.tokensIn += usage.promptTokenCount || usage.inputTokens || 0;
        this._metrics.tokensOut += usage.candidatesTokenCount || usage.outputTokens || 0;
      }

      console.log(`[AI] Stream completed in ${latencyMs}ms`);
      logger.info(`AI stream completed in ${latencyMs}ms`);
      return { 
        done: true, 
        latencyMs,
        usageMetadata: finalResponse.usageMetadata 
      };
    } catch (error) {
      this._metrics.errors++;
      logger.error('AI streaming failed:', error);
      throw this.handleAPIError(error);
    }
  }

  cancelStream(requestId) {
    this._streamCancellations.add(requestId);
    logger.info(`AI stream cancellation requested: ${requestId}`);
  }

  async listModels() {
    this.ensureReady();
    
    // Check cache first
    const now = Date.now();
    this._cacheStats.total++;
    
    if (this._cache.models.data && 
        this._cache.models.timestamp && 
        (now - this._cache.models.timestamp) < this._cache.models.ttl) {
      this._cacheStats.hits++;
      logger.debug('AI returning cached models');
      return { success: true, data: this._cache.models.data, cached: true };
    }
    
    try {
      const apiKey = this._apiKey;
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(url, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'NAVI-Desktop/1.0.0'
        }
      });
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const json = await res.json();
      const models = Array.isArray(json.models) ? json.models : [];
      
      const mapped = models
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => {
          const id = (m.name || '').replace(/^models\//, '');
          return {
            id,
            displayName: m.displayName || id,
            description: m.description || '',
            category: 'text',
            isRecommended: /1\.5-(flash|pro)/.test(id),
            inputTokenLimit: m.inputTokenLimit || m.input_token_limit || 0,
            outputTokenLimit: m.outputTokenLimit || m.output_token_limit || 0,
            capabilities: {
              features: (m.supportedGenerationMethods || []),
              score: /pro/.test(id) ? 90 : /flash-8b/.test(id) ? 70 : 80,
              supportsVision: (m.supportedGenerationMethods || []).includes('generateContentStream'),
              supportsAudio: this._determineAudioSupport(id, m),
              supportsRealtimeVoice: this._determineRealtimeVoiceSupport(id, m)
            },
            voiceSupport: this._getVoiceCapabilities(id, m),
            pricing: this._getModelPricing(id),
            lastUpdated: new Date().toISOString()
          };
        })
        .sort((a, b) => b.capabilities.score - a.capabilities.score);

      // Cache the results
      this._cache.models = {
        data: mapped,
        timestamp: now,
        ttl: this._cache.models.ttl
      };
      
      console.log(`[AI] Fetched ${mapped.length} models, cached for ${this._cache.models.ttl/1000}s`);
      logger.info(`AI fetched ${mapped.length} models, cached for ${this._cache.models.ttl/1000}s`);
      return { success: true, data: mapped, cached: false };
    } catch (error) {
      this._recordError('listModels', error);
      logger.error('AI failed to list models:', error);
      
      // Return enhanced fallback with better model info including voice capabilities
      const fallbackModels = [
        { 
          id: 'gemini-1.5-flash', 
          displayName: 'Gemini 1.5 Flash', 
          description: 'Fast, efficient model for everyday tasks', 
          isRecommended: true, 
          category: 'text', 
          inputTokenLimit: 1000000, 
          outputTokenLimit: 8192,
          capabilities: { 
            features: ['generateContent', 'multimodal'], 
            score: 80, 
            supportsVision: true,
            supportsAudio: false,
            supportsRealtimeVoice: false
          },
          pricing: { inputCostPer1M: 0.075, outputCostPer1M: 0.30 },
          voiceSupport: {
            tts: false,
            stt: false,
            realtime: false,
            note: 'Text generation only'
          }
        },
        { 
          id: 'gemini-1.5-pro', 
          displayName: 'Gemini 1.5 Pro', 
          description: 'Most capable model for complex reasoning', 
          isRecommended: true, 
          category: 'text', 
          inputTokenLimit: 2000000, 
          outputTokenLimit: 8192,
          capabilities: { 
            features: ['generateContent', 'multimodal'], 
            score: 90, 
            supportsVision: true,
            supportsAudio: false,
            supportsRealtimeVoice: false
          },
          pricing: { inputCostPer1M: 1.25, outputCostPer1M: 5.00 },
          voiceSupport: {
            tts: false,
            stt: false,
            realtime: false,
            note: 'Text generation only'
          }
        }
      ];
      
      return { success: true, data: fallbackModels, cached: false, fallback: true };
    }
  }

  _getModelPricing(modelId) {
    const pricing = {
      'gemini-1.5-flash': { inputCostPer1M: 0.075, outputCostPer1M: 0.30 },
      'gemini-1.5-flash-8b': { inputCostPer1M: 0.0375, outputCostPer1M: 0.15 },
      'gemini-1.5-pro': { inputCostPer1M: 1.25, outputCostPer1M: 5.00 },
      'gemini-1.0-pro': { inputCostPer1M: 0.50, outputCostPer1M: 1.50 }
    };
    
    return pricing[modelId] || null;
  }

  _determineAudioSupport(modelId, modelData) {
    // Current Gemini models (as of 2024) don't have native audio input/output
    // Future models may support this - check supportedGenerationMethods
    const audioMethods = ['generateAudioContent', 'processAudio'];
    const methods = modelData.supportedGenerationMethods || [];
    return methods.some(method => audioMethods.includes(method));
  }

  _determineRealtimeVoiceSupport(modelId, modelData) {
    // Real-time voice would require specific WebRTC or streaming audio support
    // This is different from simple audio processing
    const realtimeMethods = ['streamAudio', 'realtimeVoice', 'liveAudio'];
    const methods = modelData.supportedGenerationMethods || [];
    return methods.some(method => realtimeMethods.includes(method));
  }

  _getVoiceCapabilities(modelId, modelData) {
    const hasAudio = this._determineAudioSupport(modelId, modelData);
    const hasRealtime = this._determineRealtimeVoiceSupport(modelId, modelData);
    
    return {
      tts: hasAudio, // Text-to-Speech capability
      stt: hasAudio, // Speech-to-Text capability  
      realtime: hasRealtime, // Real-time voice conversation
      note: hasRealtime 
        ? 'Supports real-time voice interaction' 
        : hasAudio 
          ? 'Supports audio processing'
          : 'Text generation only'
    };
  }

  async getStatus() {
    return {
      initialized: !!this._model,
      model: this._modelId,
      metrics: this.getMetrics()
    };
  }

  getMetrics() {
    const totalRequests = this._metrics.requests;
    const successfulRequests = totalRequests - this._metrics.errors;
    
    return {
      ...this._metrics,
      model: this._modelId,
      averageLatency: this._performanceMetrics.requestLatencies.length > 0 
        ? Math.round(this._performanceMetrics.requestLatencies.reduce((a, b) => a + b, 0) / this._performanceMetrics.requestLatencies.length)
        : 0,
      errorRate: totalRequests > 0 
        ? `${((this._metrics.errors / totalRequests) * 100).toFixed(1)}%`
        : '0%',
      successRate: totalRequests > 0 
        ? `${((successfulRequests / totalRequests) * 100).toFixed(1)}%`
        : '0%',
      uptime: Date.now() - (this._initTimestamp || Date.now()),
      cacheHitRate: this._getCacheHitRate(),
      topErrorTypes: Array.from(this._performanceMetrics.errorTypes.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    };
  }

  _getCacheHitRate() {
    const total = this._cacheStats?.total || 0;
    const hits = this._cacheStats?.hits || 0;
    return total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : '0%';
  }

  _recordError(operation, error) {
    const errorType = this._categorizeError(error);
    const currentCount = this._performanceMetrics.errorTypes.get(errorType) || 0;
    this._performanceMetrics.errorTypes.set(errorType, currentCount + 1);
    
    logger.error(`AI ${operation} error (${errorType}):`, error.message);
  }

  _categorizeError(error) {
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      return 'authentication';
    }
    if (error.message?.includes('RATE_LIMIT') || error.message?.includes('429')) {
      return 'rate_limit';
    }
    if (error.message?.includes('timeout') || error.name === 'AbortError') {
      return 'timeout';
    }
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('network')) {
      return 'network';
    }
    if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
      return 'safety_filter';
    }
    return 'unknown';
  }

  _recordLatency(latencyMs) {
    this._performanceMetrics.requestLatencies.push(latencyMs);
    
    // Keep only last 100 latency measurements
    if (this._performanceMetrics.requestLatencies.length > 100) {
      this._performanceMetrics.requestLatencies.shift();
    }
  }

  /**
   * Transcribe audio using Gemini by sending inline audio data with an instruction.
   * @param {Object} opts
   * @param {string} opts.base64 - Base64-encoded audio data
   * @param {string} opts.mimeType - e.g., 'audio/webm;codecs=opus', 'audio/mp3'
   * @param {string} [opts.language] - BCP‑47 tag like 'en-US'
   */
  async transcribeAudio({ base64, mimeType, language }) {
    this.ensureReady();
    if (!base64 || !mimeType) {
      throw new Error('Missing audio data or mimeType for transcription');
    }
    const instruction = language
      ? `Transcribe the following audio to ${language}. Return only the transcript text.`
      : 'Transcribe the following audio. Return only the transcript text.';
    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: instruction },
          { inlineData: { mimeType, data: base64 } },
        ]
      }]
    };
    const result = await this._client.models.generateContent({
      model: this._modelId,
      ...request
    });
    const text = result?.text || result?.response?.text?.() || '';
    return { text };
  }

  async generateSpeech({ text, voice, rate }) {
    this.ensureReady();
    // This is a placeholder for a real TTS service.
    // In a real implementation, you would call a service like Google's Text-to-Speech API.
    logger.info(`Generating speech for text: "${text}" with voice: ${voice} at rate: ${rate}`);
    return {
      audioContent: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAA' // Placeholder for base64 audio
    };
  }

  // Process response and update metrics (@google/genai response shape)
  processNewResponse(result, startTime) {
    const text = result?.text || result?.response?.text?.() || '';
    const usage = result?.usage || result?.response?.usageMetadata || null;
    const latencyMs = Date.now() - startTime;
    
    // Update metrics
    this._metrics.requests++;
    this._metrics.lastLatencyMs = latencyMs;
    this._recordLatency(latencyMs);
    
    if (usage) {
      this._metrics.tokensIn += usage.promptTokenCount || usage.inputTokens || 0;
      this._metrics.tokensOut += usage.candidatesTokenCount || usage.outputTokens || 0;
    }

    // Update success rate
    const totalRequests = this._metrics.requests;
    const successfulRequests = totalRequests - this._metrics.errors;
    this._metrics.successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    console.log(`[AI] Generated ${text.length} characters in ${latencyMs}ms (avg: ${this.getMetrics().averageLatency}ms)`);
    logger.info(`AI generated ${text.length} characters in ${latencyMs}ms (avg: ${this.getMetrics().averageLatency}ms)`);

    return {
      text,
      usageMetadata: usage,
      latencyMs,
      finishReason: undefined,
      safetyRatings: undefined,
      modelUsed: this._modelId
    };
  }

  // Enhanced error handling with specific error types
  handleAPIError(error) {
    // API key errors
    if (error.message?.includes('API_KEY_INVALID') ||
        error.message?.includes('invalid api key') ||
        (error.status >= 401 && error.status <= 403)) {
      return new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }

    // Rate limiting errors
    if (error.message?.includes('RATE_LIMIT') ||
        error.message?.includes('quota') ||
        error.status === 429) {
      return new Error('API rate limit exceeded. Please wait a moment before trying again.');
    }

    // Network errors
    if (error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        !error.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    // Model errors
    if (error.message?.includes('model') && error.status === 404) {
      return new Error(`Model ${this._modelId} not found. Please select a different model.`);
    }

    // Safety filter errors
    if (error.message?.includes('SAFETY') ||
        error.message?.includes('blocked')) {
      return new Error('Content was blocked by safety filters. Please modify your request.');
    }

    // Generic API errors
    if (error.status >= 400 && error.status < 500) {
      return new Error(`Invalid request: ${error.message}`);
    }

    if (error.status >= 500) {
      return new Error('AI service temporarily unavailable. Please try again later.');
    }

    // Return original error if we can't categorize it
    return error instanceof Error ? error : new Error(String(error));
  }

  // Reset service state
  reset() {
    this._client = null;
    this._model = null;
    this._modelId = null;
    this._streamCancellations.clear();
    this._metrics = {
      requests: 0,
      tokensIn: 0,
      tokensOut: 0,
      lastLatencyMs: 0,
      errors: 0
    };
    console.log('[AI] Service reset');
    logger.info('AI service reset');
  }
}

module.exports = { MainAIService };
