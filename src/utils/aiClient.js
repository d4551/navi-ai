/**
 * ENHANCED AI CLIENT - Google AI Studio Integration
 *
 * Modern AI client with fallback support for both Electron IPC and web environments
 * Uses Google AI Studio APIs via @ai-sdk/google for optimal performance
 *
 * APIs: https://ai.google.dev/aistudio | https://ai.google.dev/
 */

import {
  canonicalAIClient,
  ensureApiKey,
  getStreamClient,
  resetAIService,
  reinitializeIfModelChanged,
} from '@/shared/services/CanonicalAIClient'

import { aiService } from '@/shared/services/AIService'

// For backward compatibility, use the canonical client for both environments
const modernAI = canonicalAIClient

// Choose the best AI client based on environment
function getBestAIClient() {
  // In Electron, prefer the canonical IPC client for security
  if (typeof window !== 'undefined' && window.api?.ai) {
    return canonicalAIClient
  }

  // In web environment, use modern AI SDK client
  return modernAI
}

// Check if the selected AI client is ready to use
function isAIClientReady() {
  const client = getBestAIClient()

  try {
    // For canonical client (Electron)
    if (client === canonicalAIClient) {
      return client.isReady?.value || false
    }

    // For modern client (Web) - check both isReady computed and initialized state
    if (client.isReady) {
      if (typeof client.isReady.value !== 'undefined') {
        return client.isReady.value
      }
      // If isReady is a function, call it
      if (typeof client.isReady === 'function') {
        return client.isReady()
      }
    }

    // Direct check for initialized property
    if (typeof client.initialized !== 'undefined') {
      return client.initialized === true
    }

    // Fallback check
    return client.model && client.initialized !== false
  } catch (error) {
    console.warn('Error checking AI client ready state:', error)
    return false
  }
}

// Global AI initialization helper
async function ensureAIInitialized() {
  // Check if canonical AI service is ready
  if (await aiService.isReady()) {
    return true
  }

  try {
    // Try to get API key from localStorage or app settings
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    const apiKey =
      appSettings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || null

    if (apiKey) {
      console.log('Auto-initializing AI service with available API key')
      const result = await aiService.initialize({
        apiKey,
        model: appSettings.selectedModel || 'gemini-2.5-flash',
        primaryProvider: 'google',
      })

      if (!result.success) {
        throw new Error(result.message || 'AI initialization failed')
      }
      return true
    } else {
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
  } catch (initError) {
    console.warn('Failed to auto-initialize AI service:', initError)
    throw new Error(
      'AI service not initialized. Please configure your API key first.'
    )
  }
}

// Enhanced wrappers that use the best available client
async function generateContent(prompt, systemInstructions = '', options = {}) {
  // Ensure AI is initialized using the canonical service
  await ensureAIInitialized()

  try {
    // Use the canonical AI service for generation
    const response = await aiService.chat({
      message: prompt,
      context: systemInstructions,
      type: 'chat',
      options,
    })

    return response.content
  } catch (error) {
    console.error('generateContent failed:', error)

    // Fallback to direct client if canonical service fails
    const client = getBestAIClient()

    // Auto-initialize client if needed
    if (!isAIClientReady()) {
      try {
        const appSettings = JSON.parse(
          localStorage.getItem('app-settings') || '{}'
        )
        const apiKey =
          appSettings.geminiApiKey ||
          import.meta.env.VITE_GEMINI_API_KEY ||
          null

        if (apiKey) {
          await client.initialize(apiKey)
        } else {
          throw new Error(
            'AI service not initialized. Please configure your API key first.'
          )
        }
      } catch (initError) {
        console.warn('Failed to auto-initialize AI client:', initError)
        throw new Error(
          'AI service not initialized. Please configure your API key first.'
        )
      }
    }

    try {
      return await client.generateText(prompt, systemInstructions, options)
    } catch (fallbackError) {
      console.error('Fallback client also failed:', fallbackError)
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
  }
}

async function generateSmartContent(
  contentType,
  userInput,
  context = {},
  options = {}
) {
  // Ensure AI is initialized
  await ensureAIInitialized()

  try {
    // Use canonical AI service for smart content generation
    const response = await aiService.chat({
      message: userInput,
      context: `Content type: ${contentType}. Additional context: ${JSON.stringify(context)}`,
      type: 'generation',
      options,
    })

    return response.content
  } catch (error) {
    console.error('generateSmartContent failed with canonical service:', error)

    // Fallback to direct client
    const client = getBestAIClient()
    try {
      return await client.generateSmartContent(
        contentType,
        userInput,
        context,
        options
      )
    } catch (fallbackError) {
      console.error('Fallback client also failed:', fallbackError)
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
  }
}

async function getContextualSuggestions(
  componentType,
  currentData = {},
  userProfile = {},
  options = {}
) {
  const client = getBestAIClient()
  try {
    return await client.getContextualSuggestions(
      componentType,
      currentData,
      userProfile,
      options
    )
  } catch (error) {
    console.error('getContextualSuggestions failed:', error)
    if (error.message.includes('not initialized')) {
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
    throw error
  }
}

// Stream text using modern AI SDK when available
async function streamText(prompt, options = {}) {
  const client = getBestAIClient()

  try {
    // Use modern streaming if available
    if (client.streamText) {
      return await client.streamText(prompt, options)
    }

    // Fallback to non-streaming for older clients
    const result = await client.generateText(prompt, options)
    return {
      textStream: async function* () {
        yield result.text || result
      },
    }
  } catch (error) {
    console.error('streamText failed:', error)
    if (error.message.includes('not initialized')) {
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
    throw error
  }
}

// Initialize AI with API key (enhanced for modern client)
// Dedup guards to avoid repeated initialization spam
let __aiInitSignature = null
let __aiInitPromise = null

async function initializeAI(apiKey, model = 'gemini-2.5-flash') {
  const client = getBestAIClient()

  const signature = `${(apiKey || '').trim()}::${(model || '').trim()}`
  try {
    // Skip if already initialized with same config
    if (client?.isReady?.value && __aiInitSignature === signature) {
      return { success: true, model }
    }
    // Coalesce concurrent init attempts
    if (__aiInitPromise && __aiInitSignature === signature) {
      return await __aiInitPromise
    }
  } catch {}

  // For modern AI client (web environment)
  if (client.initialize) {
    try {
      __aiInitSignature = signature
      __aiInitPromise = client.initialize(apiKey, model)
      const result = await __aiInitPromise
      __aiInitPromise = null
      if (result?.success === false) {
        throw new Error(
          result?.error ||
            'AI service not initialized. Please configure your API key first.'
        )
      }
      return result
    } catch (error) {
      __aiInitPromise = null
      console.error('Modern AI client initialization failed:', error)
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
  }

  // For canonical client (Electron IPC)
  if (client === canonicalAIClient) {
    try {
      __aiInitSignature = signature
      __aiInitPromise = canonicalAIClient.initialize(apiKey, model)
      const result = await __aiInitPromise
      __aiInitPromise = null
      if (result?.success === false) {
        throw new Error(
          result?.error ||
            'AI service not initialized. Please configure your API key first.'
        )
      }
      return result
    } catch (error) {
      __aiInitPromise = null
      console.error('Canonical AI client initialization failed:', error)
      throw new Error(
        'AI service not initialized. Please configure your API key first.'
      )
    }
  }

  // Fallback initialization for canonical client compatibility
  try {
    __aiInitSignature = signature
    __aiInitPromise = ensureApiKey(apiKey)
    const res = await __aiInitPromise
    __aiInitPromise = null
    return res
  } catch (error) {
    __aiInitPromise = null
    console.error('AI client fallback initialization failed:', error)
    throw new Error(
      'AI service not initialized. Please configure your API key first.'
    )
  }
}

// Use the canonical client's getAIClient function for full compatibility
export { getAIClient }

// Enhanced exports with modern AI capabilities
export {
  generateContent,
  generateSmartContent,
  getContextualSuggestions,
  streamText,
  initializeAI,
  getBestAIClient,
  isAIClientReady,
  ensureAIInitialized,
  ensureApiKey,
  resetAIService,
  reinitializeIfModelChanged,
  getStreamClient,
}

// Default export for convenience - returns the best available AI client
export default getBestAIClient
// Provide a stable getter locally to avoid named export mismatch during HMR
function getAIClient() {
  return canonicalAIClient
}
