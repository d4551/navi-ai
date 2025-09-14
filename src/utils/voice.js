/**
 * Canonical Voice Shim
 * - Proxies to shared/services/AudioService (single source of truth)
 * - Adds provider-aware routing hooks for Gemini STT/TTS via Live API
 */
import { logger } from "@/shared/utils/logger";
import { audioService } from "@/shared/services/AudioService";
import { resolveGeminiApiKey, resolveGoogleCloudApiKey } from "@/shared/utils/apiKeys";

const routing = {
  ttsProvider: "system", // 'system' | 'gemini' | 'kokoro' | 'google-cloud'
  sttProvider: "system", // 'system' | 'gemini'
  micDeviceId: "",
  speakerDeviceId: "",
  lang: "en-US",
};

// Provider health tracking and smart fallback system
const providerHealth = {
  gemini: { 
    status: 'unknown', // 'healthy' | 'degraded' | 'failed' | 'unknown'
    lastError: null,
    lastSuccess: null,
    consecutiveFailures: 0,
    lastTestTime: null,
    healthScore: 100
  },
  'google-cloud': {
    status: 'unknown',
    lastError: null,
    lastSuccess: null,
    consecutiveFailures: 0,
    lastTestTime: null,
    healthScore: 100
  },
  kokoro: {
    status: 'unknown',
    lastError: null,
    lastSuccess: null,
    consecutiveFailures: 0,
    lastTestTime: null,
    healthScore: 100
  },
  system: {
    status: 'healthy', // System TTS is always considered available
    lastError: null,
    lastSuccess: Date.now(),
    consecutiveFailures: 0,
    lastTestTime: Date.now(),
    healthScore: 100
  }
};

// Smart fallback chains based on user preference and health
const fallbackChains = {
  gemini: ['gemini', 'kokoro', 'system'],
  'google-cloud': ['google-cloud', 'kokoro', 'system'],
  kokoro: ['kokoro', 'system'],
  system: ['system']
};

// Cache for recent API responses to improve performance
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Voice quality preferences and adaptive settings
const qualityPreferences = {
  preferredQuality: 'balanced', // 'fast' | 'balanced' | 'high'
  adaptiveQuality: true, // Automatically adjust based on connection/performance
  cacheEnabled: true,
  maxCacheSize: 100,
  prioritizeLatency: false, // For real-time applications
  fallbackOnError: true,
  retryAttempts: 2,
  timeoutMs: 10000
};

// Quality-based provider configurations
const qualityConfigs = {
  fast: {
    gemini: { temperature: 0.1, maxOutputTokens: 150 },
    'google-cloud': { speakingRate: 1.2, audioEncoding: 'OGG_OPUS' },
    kokoro: { speed: 1.1 },
    system: { rate: 1.1 }
  },
  balanced: {
    gemini: { temperature: 0.3, maxOutputTokens: 250 },
    'google-cloud': { speakingRate: 1.0, audioEncoding: 'MP3' },
    kokoro: { speed: 1.0 },
    system: { rate: 1.0 }
  },
  high: {
    gemini: { temperature: 0.2, maxOutputTokens: 400 },
    'google-cloud': { speakingRate: 0.9, audioEncoding: 'LINEAR16' },
    kokoro: { speed: 0.95 },
    system: { rate: 0.9 }
  }
};

function updateProviderHealth(provider, success, error = null) {
  const health = providerHealth[provider];
  if (!health) return;

  const now = Date.now();
  
  if (success) {
    health.status = 'healthy';
    health.lastSuccess = now;
    health.consecutiveFailures = 0;
    health.healthScore = Math.min(100, health.healthScore + 10);
    health.lastError = null;
  } else {
    health.lastError = error;
    health.consecutiveFailures++;
    health.healthScore = Math.max(0, health.healthScore - 20);
    
    if (health.consecutiveFailures >= 3) {
      health.status = 'failed';
    } else if (health.consecutiveFailures >= 1) {
      health.status = 'degraded';
    }
  }
  
  health.lastTestTime = now;
  logger.debug(`Provider ${provider} health updated:`, health);
}

function getHealthyProviders() {
  return Object.entries(providerHealth)
    .filter(([_, health]) => health.status === 'healthy' || health.status === 'degraded')
    .sort((a, b) => b[1].healthScore - a[1].healthScore)
    .map(([provider, _]) => provider);
}

function shouldUseCache(text, provider) {
  if (!qualityPreferences.cacheEnabled) return null;
  
  const cacheKey = generateCacheKey(text, provider);
  const cached = responseCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    logger.debug('Using cached TTS response for:', cacheKey.substring(0, 50) + '...');
    cached.hits = (cached.hits || 0) + 1;
    return cached.response;
  }
  
  return null;
}

function setCacheEntry(text, provider, response) {
  if (!qualityPreferences.cacheEnabled) return;
  
  const cacheKey = generateCacheKey(text, provider);
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    hits: 0,
    provider,
    textLength: text.length
  });
  
  // Smart cache cleanup based on usage and age
  if (responseCache.size > qualityPreferences.maxCacheSize) {
    cleanupCache();
  }
}

function generateCacheKey(text, provider) {
  // Create a more sophisticated cache key including quality settings
  const quality = qualityPreferences.preferredQuality;
  const textHash = text.substring(0, 150).replace(/\s+/g, ' ').trim();
  return `${provider}:${quality}:${textHash}`;
}

function cleanupCache() {
  const entries = Array.from(responseCache.entries());
  
  // Sort by usage (hits) and age, keeping most useful entries
  entries.sort((a, b) => {
    const scoreA = (a[1].hits || 0) - (Date.now() - a[1].timestamp) / (1000 * 60); // Decay score over time
    const scoreB = (b[1].hits || 0) - (Date.now() - b[1].timestamp) / (1000 * 60);
    return scoreB - scoreA;
  });
  
  // Keep top 70% of entries
  const keepCount = Math.floor(qualityPreferences.maxCacheSize * 0.7);
  responseCache.clear();
  
  entries.slice(0, keepCount).forEach(([key, value]) => {
    responseCache.set(key, value);
  });
  
  logger.debug(`Cache cleanup completed. Kept ${keepCount} entries out of ${entries.length}`);
}

function getQualityConfig(provider, quality = null) {
  const targetQuality = quality || qualityPreferences.preferredQuality;
  return qualityConfigs[targetQuality]?.[provider] || qualityConfigs.balanced[provider] || {};
}

function adaptQualityBasedOnPerformance(provider) {
  if (!qualityPreferences.adaptiveQuality) return qualityPreferences.preferredQuality;
  
  const health = providerHealth[provider];
  if (!health) return qualityPreferences.preferredQuality;
  
  // Adapt quality based on provider health and performance
  if (health.healthScore < 50 || health.consecutiveFailures > 0) {
    return 'fast'; // Use faster, more reliable settings
  } else if (health.healthScore > 90 && health.consecutiveFailures === 0) {
    return qualityPreferences.prioritizeLatency ? 'fast' : 'high';
  }
  
  return 'balanced';
}

export function setVoiceRoutingPreferences(prefs = {}) {
  Object.assign(routing, prefs);
}

export function getVoiceRoutingPreferences() {
  return { ...routing };
}

export function setVoiceQualityPreferences(prefs = {}) {
  Object.assign(qualityPreferences, prefs);
  logger.debug('Voice quality preferences updated:', qualityPreferences);
}

export function getVoiceQualityPreferences() {
  return { ...qualityPreferences };
}

export function clearVoiceCache() {
  responseCache.clear();
  logger.info('Voice cache cleared');
}

// Gemini Live API TTS implementation
async function speakViaGeminiLive(text, options) {
  try {
    logger.debug('speakViaGeminiLive called with:', { text: text.substring(0, 50) + '...', hasApiKey: !!options.apiKey });
    
    // Dynamically import the MultimodalLiveService
    const { MultimodalLiveService } = await import('@/shared/services/MultimodalLiveService');
    const liveService = MultimodalLiveService.getInstance();
    
    // Initialize if needed and connect
    const status = liveService.getStatus();
    logger.debug('MultimodalLiveService status:', status);
    
    if (!status.isConnected) {
      logger.debug('Initializing and connecting to Gemini Live API...');
      await liveService.initialize({
        apiKey: options.apiKey
      });
      
      // Configure for TTS-optimized interaction
      const voiceHint = (options.voice || options.voiceId || options.geminiVoice || '').toString().trim();
      const ttsConfig = {
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: ["AUDIO"], // Only audio response
          temperature: 0.3, // Lower temperature for consistent TTS
          topP: 0.9,
          maxOutputTokens: 250, // Increased for longer text
        },
        systemInstruction: {
          parts: [{
            text: "You are a text-to-speech system. Read the user's message aloud naturally and clearly. Do not add any additional commentary or responses." + (voiceHint ? ` Use the following voice style if possible: ${voiceHint}.` : '')
          }]
        }
      };
      
      // Add connection retry logic
      let connectionAttempts = 0;
      const maxConnectionAttempts = 3;
      
      while (connectionAttempts < maxConnectionAttempts) {
        try {
          await liveService.connect(ttsConfig);
          logger.debug('Connection established with TTS configuration');
          break;
        } catch (error) {
          connectionAttempts++;
          logger.warn(`Connection attempt ${connectionAttempts} failed:`, error.message);
          
          if (connectionAttempts >= maxConnectionAttempts) {
            throw new Error(`Failed to connect to Gemini Live API after ${maxConnectionAttempts} attempts: ${error.message}`);
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, connectionAttempts - 1), 5000);
          logger.debug(`Retrying connection in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Set up audio handling
    return new Promise((resolve, reject) => {
      let audioReceived = false;
      
      // Set up callbacks for this TTS request
      const callbacks = {
        onAudio: (audioData) => {
          logger.debug('Received audio from Gemini Live API, size:', audioData.byteLength);
          audioReceived = true;
          
          try {
            // Validate audio data
            if (!audioData || audioData.byteLength === 0) {
              logger.error('Received empty audio data');
              reject(new Error('Empty audio data received'));
              return;
            }
            
            // Create audio from ArrayBuffer with better error handling
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            logger.debug('Created AudioContext, decoding audio...');
            
            audioContext.decodeAudioData(audioData.slice())
              .then(audioBuffer => {
                logger.debug('Audio decoded successfully, playing...');
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                
                // Add playback monitoring
                source.onended = () => {
                  logger.debug('Audio playback completed successfully');
                  resolve();
                };
                
                source.onerror = (error) => {
                  logger.error('Audio playback error:', error);
                  reject(new Error('Audio playback failed'));
                };
                
                source.start();
              })
              .catch(error => {
                logger.error('Audio decoding failed:', error);
                reject(new Error(`Audio decoding failed: ${error.message}`));
              });
          } catch (error) {
            logger.error('Audio processing failed:', error);
            reject(new Error(`Audio processing failed: ${error.message}`));
          }
        },
        onError: (error) => {
          logger.error('Gemini Live API error:', error);
          reject(error);
        }
      };
      
      // Set callbacks and send message
      logger.debug('Setting callbacks and sending message to Gemini Live API...');
      liveService.setCallbacks(callbacks);
      
      // Dynamic timeout based on text length and complexity
      const estimateAudioDuration = (text) => {
        // Average speaking rate is ~150 words per minute
        const wordCount = text.split(/\s+/).length;
        const estimatedSpeechTimeMs = (wordCount / 150) * 60 * 1000;
        // Reduced buffer time for faster timeouts (minimum 3 seconds, max 8 seconds)
        const bufferTime = Math.max(3000, Math.min(8000, estimatedSpeechTimeMs * 1.5));
        return bufferTime;
      };
      
      const timeoutDuration = estimateAudioDuration(text);
      logger.debug(`Setting dynamic timeout: ${timeoutDuration}ms for text length: ${text.length} chars`);
      
      liveService.sendMessage(text)
        .then(() => {
          logger.debug('Text sent to Gemini Live API for TTS successfully');
          // Dynamic timeout based on text complexity
          setTimeout(() => {
            if (!audioReceived) {
              logger.warn(`No audio response received within ${timeoutDuration}ms timeout`);
              reject(new Error(`No audio response received within ${timeoutDuration}ms timeout`));
            }
          }, timeoutDuration);
        })
        .catch(error => {
          logger.error('Failed to send message to Gemini Live API:', error);
          reject(error);
        });
    });
    
  } catch (error) {
    logger.debug('Failed to use Gemini Live API:', error);
    throw error;
  }
}

// Google Cloud TTS using REST API (browser compatible)
async function speakViaGoogleCloudTTS(text, options) {
  try {
    logger.debug('speakViaGoogleCloudTTS called with:', { text: text.substring(0, 50) + '...', hasApiKey: !!options.apiKey });
    
    // Use REST API approach for browser compatibility
    // The @google-cloud/text-to-speech package doesn't work in browsers
    return await speakViaGoogleCloudTTSRest(text, options);
    
  } catch (error) {
    logger.error('Google Cloud TTS failed:', error);
    throw error;
  }
}

// Google Cloud TTS REST API implementation
async function speakViaGoogleCloudTTSRest(text, options) {
  try {
    if (!options.apiKey) {
      throw new Error('Google Cloud TTS API key is required');
    }

    // Check if this looks like a Gemini API key being used incorrectly
    if (options.apiKey.startsWith('AIzaSyC')) {
      const warning = 'CONFIGURATION ERROR: You are using a Gemini API key for Google Cloud TTS.\n' +
                     'Gemini API keys (AIzaSy...) cannot access Google Cloud TTS service.\n' +
                     'You need a separate Google Cloud API key with Text-to-Speech API enabled.\n' +
                     'Falling back to browser TTS instead.';
      logger.warn(warning);
      
      // Don't waste time trying the API call - it will always fail
      throw new Error('Invalid API key type: Gemini API key cannot be used for Google Cloud TTS. Please configure a Google Cloud API key instead.');
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${options.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: options.language || 'en-US',
          name: options.voice || 'en-US-Journey-F',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.rate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volume || 0.0,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Google Cloud TTS API error response:', errorText);
      
      if (response.status === 403) {
        let errorMessage = 'Google Cloud TTS API access denied (403). Possible issues:\n';
        errorMessage += '1. API key is not valid for Google Cloud TTS service\n';
        errorMessage += '2. Text-to-Speech API is not enabled in your Google Cloud project\n';
        errorMessage += '3. API key lacks proper permissions\n';
        errorMessage += '4. You may be using a Gemini API key instead of a Google Cloud API key\n';
        errorMessage += '\nNote: Gemini API keys and Google Cloud API keys are different services with different authentication.';
        throw new Error(errorMessage);
      }
      
      throw new Error(`Google Cloud TTS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error('No audio content received from Google Cloud TTS');
    }

    // Convert base64 audio to blob and play
    const audioBytes = atob(data.audioContent);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }
    
    const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().catch(reject);
    });
    
  } catch (error) {
    logger.error('Google Cloud TTS REST API failed:', error);
    throw error;
  }
}

// Kokoro TTS implementation using kokoro-js package with local model files
async function speakViaKokoro(text, options) {
  try {
    logger.debug('speakViaKokoro called with:', { text: text.substring(0, 50) + '...', options });
    
    const { KokoroTTS } = await import('kokoro-js');
    
    // Use local model files instead of downloading from Hugging Face
    const localModelPath = '/local-models/kokoro'; // Path relative to public directory
    logger.debug('Using local Kokoro model from:', localModelPath);
    
    // Initialize Kokoro TTS with local model files
    const kokoro = await KokoroTTS.from_pretrained(localModelPath, {
      dtype: "q8", // Use quantized model for better performance
      device: "wasm", // Use WebAssembly for browser compatibility
      local_files_only: true, // Ensure it only uses local files
    });
    logger.debug('Kokoro TTS instance created successfully from local files');
    
    // Get available voices from the voices property
    const voicesData = kokoro.voices;
    const availableVoices = voicesData ? Object.keys(voicesData) : [];
    const requestedVoice = options.voice || options.kokoroVoice || 'af_heart'; // Default to heart voice (A grade)
    const voice = availableVoices.includes(requestedVoice) ? requestedVoice : 'af_heart';
    
    if (voice !== requestedVoice) {
      logger.warn(`Requested voice '${requestedVoice}' not available, using '${voice}' instead`);
      logger.debug('Available voices:', availableVoices.slice(0, 10)); // Log first 10 for debugging
    }
    
    logger.debug(`Generating audio with voice: ${voice}`);
    
    // Generate audio using Kokoro
    const audioBuffer = await kokoro.generate(text, {
      voice: voice,
      speed: options.rate || 1.0,
      // Note: Kokoro may not support all options like pitch/volume adjustments
    });
    
    if (!audioBuffer) {
      throw new Error('No audio generated by Kokoro TTS');
    }

    logger.debug('Audio generated by Kokoro, playing...');
    
    // Create blob from audio buffer and play
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        logger.debug('Kokoro TTS playback completed');
        resolve();
      };
      
      audio.onerror = (_error) => {
        URL.revokeObjectURL(audioUrl);
        logger.error('Kokoro TTS playback error:', _error);
        reject(new Error('Kokoro audio playback failed'));
      };
      
      audio.volume = options.volume || 1.0;
      audio.play().catch(error => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Failed to play Kokoro TTS audio: ${error.message}`));
      });
    });

  } catch (error) {
    logger.debug('Failed to use Kokoro TTS with local model:', error);
    // Fallback to online model if local fails
    logger.debug('Falling back to online Kokoro model...');
    try {
      const { KokoroTTS } = await import('kokoro-js');
      const kokoro = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8",
        device: "wasm",
      });
      
      const audioBuffer = await kokoro.generate(text, {
        voice: options.voice || options.kokoroVoice || 'af_heart',
        speed: options.rate || 1.0,
      });
      
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (_error) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Kokoro audio playback failed'));
        };
        audio.volume = options.volume || 1.0;
        audio.play().catch(error => reject(new Error(`Failed to play audio: ${error.message}`)));
      });
    } catch (fallbackError) {
      logger.error('Both local and online Kokoro TTS failed:', fallbackError);
      throw new Error(`Kokoro TTS failed: ${fallbackError.message}`);
    }
  }
}

// Backward compatible API
export function getVoiceService() {
  // Return an object with the old shape but backed by audioService
  return {
    isSupported: !!(window?.speechSynthesis && navigator?.mediaDevices),
    startRecording(options = {}) {
      const deviceId = options.deviceId || routing.micDeviceId || undefined;
      return audioService.startRecording({ deviceId });
    },
    stopRecording() {
      return audioService.stopRecording();
    },
    async speak(text, options = {}) {
      const requestedProvider = options.provider || routing.ttsProvider || "system";
      const speakOpts = {
        rate: options.rate ?? 0.9,
        pitch: options.pitch ?? 1.0,
        volume: options.volume ?? 0.9,
        language: options.lang || routing.lang || "en-US",
        voiceId: options.voice || options.geminiVoice || undefined,
      };
      
      logger.debug('Voice.js - speak() called with requested provider:', requestedProvider);
      
      // Check cache first for performance
      const cachedResponse = shouldUseCache(text, requestedProvider);
      if (cachedResponse) {
        try {
          await cachedResponse;
          return;
        } catch (error) {
          logger.debug('Cached response failed, proceeding with fresh request');
        }
      }
      
      // Get the appropriate fallback chain
      const fallbackChain = fallbackChains[requestedProvider] || ['system'];
      const healthyProviders = getHealthyProviders();
      
      // Optimize fallback chain based on provider health
      const optimizedChain = fallbackChain.filter(provider => {
        if (provider === 'system') return true; // Always include system as final fallback
        return healthyProviders.includes(provider) || provider === requestedProvider;
      });
      
      logger.debug('Optimized fallback chain:', optimizedChain);
      
      // Try each provider in the fallback chain
      for (let i = 0; i < optimizedChain.length; i++) {
        const provider = optimizedChain[i];
        
        try {
          logger.debug(`Attempting TTS with provider: ${provider} (${i + 1}/${optimizedChain.length})`);
          
          // Resolve API key for this provider
          if (provider === 'gemini' && !options.apiKey) {
            const autoKey = await resolveGeminiApiKey();
            if (autoKey) options.apiKey = autoKey;
          } else if (provider === 'google-cloud' && !options.apiKey) {
            const autoKey = await resolveGoogleCloudApiKey();
            if (autoKey) options.apiKey = autoKey;
          }
          
          const result = await this.speakWithProvider(text, provider, { ...options, ...speakOpts });
          
          // Success! Update health and cache result
          updateProviderHealth(provider, true);
          setCacheEntry(text, provider, Promise.resolve(result));
          
          // If we succeeded with a fallback provider, notify user
          if (provider !== requestedProvider && i > 0) {
            const message = `Used ${provider} TTS instead of ${requestedProvider} (better performance)`;
            logger.info(message);
            try {
              if (window.toast?.info) window.toast.info(message, { duration: 3000 });
            } catch {}
          }
          
          return result;
          
        } catch (error) {
          logger.warn(`Provider ${provider} failed:`, error.message);
          updateProviderHealth(provider, false, error);
          
          // Show user-friendly error message for specific cases
          if (error.message.includes('Gemini API key cannot be used for Google Cloud TTS')) {
            try {
              if (window.toast?.warning) {
                window.toast.warning('🔑 API Key Configuration Issue: Using Gemini key for Google Cloud TTS. Falling back to browser TTS.', { duration: 5000 });
              }
            } catch {}
          }
          
          // If this is the last provider in chain, throw the error
          if (i === optimizedChain.length - 1) {
            let message = `All TTS providers failed.`;
            if (provider === 'google-cloud' && error.message.includes('Invalid API key type')) {
              message += ` Tip: You need a Google Cloud API key (not Gemini) with Text-to-Speech API enabled.`;
            }
            message += ` Last error: ${error.message}`;
            logger.error(message);
            throw new Error(message);
          }
          
          // Continue to next provider
          const nextProvider = optimizedChain[i + 1];
          logger.debug(`Falling back from ${provider} to ${nextProvider}...`);
        }
      }
    },
    
    // Separated provider-specific logic for better error handling
    async speakWithProvider(text, provider, options) {
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for TTS');
      }

      // Apply adaptive quality configuration
      const adaptiveQuality = adaptQualityBasedOnPerformance(provider);
      const qualityConfig = getQualityConfig(provider, adaptiveQuality);
      const enhancedOptions = { ...options, ...qualityConfig };
      
      logger.debug(`Using ${adaptiveQuality} quality for ${provider}:`, qualityConfig);

      // Add timeout wrapper for all providers
      const timeout = qualityPreferences.timeoutMs;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`TTS timeout after ${timeout}ms`)), timeout)
      );

      try {
        let ttsPromise;
        
        if (provider === "kokoro") {
          ttsPromise = speakViaKokoro(text, enhancedOptions);
        } else if (provider === "google-cloud") {
          if (!enhancedOptions.apiKey) {
            throw new Error('Google Cloud TTS requires an API key');
          }
          ttsPromise = speakViaGoogleCloudTTS(text, enhancedOptions);
        } else if (provider === "gemini") {
          if (!enhancedOptions.apiKey) {
            throw new Error('Gemini TTS requires an API key');
          }
          ttsPromise = speakViaGeminiLive(text, enhancedOptions);
        } else if (provider === "system") {
          ttsPromise = audioService.speak(text, enhancedOptions);
        } else {
          throw new Error(`Unknown TTS provider: ${provider}`);
        }

        return await Promise.race([ttsPromise, timeoutPromise]);
        
      } catch (error) {
        // Enhanced error reporting
        const enhancedError = new Error(`${provider} TTS failed: ${error.message}`);
        enhancedError.provider = provider;
        enhancedError.quality = adaptiveQuality;
        enhancedError.originalError = error;
        throw enhancedError;
      }
    },

    // Get provider health information for diagnostics
    getProviderHealth() {
      return { ...providerHealth };
    },

    // Clear provider health (for testing or reset)
    resetProviderHealth() {
      Object.keys(providerHealth).forEach(provider => {
        if (provider !== 'system') {
          providerHealth[provider] = {
            status: 'unknown',
            lastError: null,
            lastSuccess: null,
            consecutiveFailures: 0,
            lastTestTime: null,
            healthScore: 100
          };
        }
      });
      logger.info('Provider health metrics reset');
    },

    // Manual health check for a specific provider
    async testProviderHealth(provider, options = {}) {
      const testText = options.testText || "Testing voice synthesis quality and connectivity.";
      
      try {
        await this.speakWithProvider(testText, provider, options);
        updateProviderHealth(provider, true);
        return { success: true, message: `${provider} TTS is working correctly` };
      } catch (error) {
        updateProviderHealth(provider, false, error);
        return { success: false, message: `${provider} TTS failed: ${error.message}` };
      }
    },

    // Comprehensive diagnostics report
    async getDiagnosticsReport() {
      const report = {
        timestamp: new Date().toISOString(),
        routing: { ...routing },
        qualityPreferences: { ...qualityPreferences },
        providerHealth: { ...providerHealth },
        cache: {
          size: responseCache.size,
          maxSize: qualityPreferences.maxCacheSize,
          enabled: qualityPreferences.cacheEnabled
        },
        capabilities: {
          webAudioSupported: !!(window.AudioContext || window.webkitAudioContext),
          speechSynthesisSupported: !!window.speechSynthesis,
          fetchSupported: !!window.fetch,
          webAssemblySupported: !!window.WebAssembly
        },
        providers: {}
      };

      // Test each provider availability
      for (const provider of Object.keys(providerHealth)) {
        try {
          const testResult = await this.testProviderHealth(provider, { 
            testText: "Quick test",
            timeout: 3000 
          });
          report.providers[provider] = {
            available: testResult.success,
            message: testResult.message,
            health: { ...providerHealth[provider] }
          };
        } catch (error) {
          report.providers[provider] = {
            available: false,
            message: error.message,
            health: { ...providerHealth[provider] }
          };
        }
      }

      return report;
    },

    // Performance metrics and monitoring
    getPerformanceMetrics() {
      const metrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cacheHits: 0,
        averageLatency: 0,
        providerUsage: {}
      };

      // Calculate metrics from provider health data
      Object.entries(providerHealth).forEach(([provider, health]) => {
        metrics.providerUsage[provider] = {
          healthScore: health.healthScore,
          consecutiveFailures: health.consecutiveFailures,
          lastSuccess: health.lastSuccess,
          lastError: health.lastError,
          status: health.status
        };
      });

      // Calculate cache efficiency
      let totalHits = 0;
      responseCache.forEach(entry => {
        totalHits += entry.hits || 0;
      });
      metrics.cacheHits = totalHits;

      return metrics;
    },

    // Real-time monitoring setup
    startMonitoring(callback, interval = 30000) {
      if (this._monitoringInterval) {
        clearInterval(this._monitoringInterval);
      }

      this._monitoringInterval = setInterval(async () => {
        try {
          const metrics = this.getPerformanceMetrics();
          const healthStatus = Object.entries(providerHealth).reduce((status, [provider, health]) => {
            status[provider] = health.status;
            return status;
          }, {});

          callback({
            timestamp: Date.now(),
            metrics,
            healthStatus,
            cacheSize: responseCache.size,
            activeProvider: routing.ttsProvider
          });
        } catch (error) {
          logger.error('Monitoring error:', error);
        }
      }, interval);

      logger.info('TTS monitoring started');
      return this._monitoringInterval;
    },

    stopMonitoring() {
      if (this._monitoringInterval) {
        clearInterval(this._monitoringInterval);
        this._monitoringInterval = null;
        logger.info('TTS monitoring stopped');
      }
    },

    // Export configuration for backup/restore
    exportConfiguration() {
      return {
        routing: { ...routing },
        qualityPreferences: { ...qualityPreferences },
        timestamp: Date.now(),
        version: '1.0'
      };
    },

    // Import configuration from backup
    importConfiguration(config) {
      if (config.version === '1.0') {
        Object.assign(routing, config.routing || {});
        Object.assign(qualityPreferences, config.qualityPreferences || {});
        logger.info('TTS configuration imported successfully');
        return true;
      } else {
        logger.warn('Unsupported configuration version:', config.version);
        return false;
      }
    },
    stopSpeaking() {
      return audioService.stopSpeaking();
    },
    getVoices() {
      try {
        return audioService.getAvailableVoices?.() || [];
      } catch {
        return [];
      }
    },
    isSpeaking() {
      return audioService.isSpeaking?.() || false;
    },
    destroy() {
      try {
        audioService.stopSpeaking();
      } catch {}
    },
  };
}

export function speak(text, options = {}) {
  return getVoiceService().speak(text, options);
}

export function startRecording(options = {}) {
  return getVoiceService().startRecording(options);
}

export function stopRecording() {
  return getVoiceService().stopRecording();
}

export function isVoiceSupported() {
  return getVoiceService().isSupported;
}

export function stopSpeaking() {
  return getVoiceService().stopSpeaking();
}

// Helper function for development/debugging - converts base64 to blob
function _base64ToBlob(base64, mimeType) {
  try {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType || 'audio/mp3' });
  } catch (e) {
    logger.debug('base64ToBlob failed', e);
    return new Blob();
  }
}
