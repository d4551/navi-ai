/**
 * Type definitions for GeminiModelService
 */

import type { GeminiModelInfo } from '@/shared/types/ai'
export type { GeminiModelInfo }

export interface FetchModelsResult {
  models?: GeminiModelInfo[]
  lastUpdated?: string
  source?: string
}

export interface APIKeyTestResult {
  success: boolean
  message?: string
  error?: string
}

export interface ModelCapabilities {
  textGeneration?: boolean
  multiTurn?: boolean
  imageInput?: boolean
  videoInput?: boolean
  audioInput?: boolean
  audioOutput?: boolean
  realtimeChat?: boolean
  liveChat?: boolean
  codeGeneration?: boolean
  jsonMode?: boolean
  functionCalling?: boolean
  streaming?: boolean
  multimodal?: boolean
}

declare class GeminiModelService {
  constructor()

  /**
   * Fetch available Gemini models using Google AI Studio API
   */
  fetchAvailableModels(apiKey: string): Promise<FetchModelsResult>

  /**
   * Test API key validity
   */
  testAPIKey(apiKey: string): Promise<APIKeyTestResult>

  /**
   * Get curated fallback list of Gemini models
   */
  getCuratedModelList(): GeminiModelInfo[]

  /**
   * Get fallback model list when API is unavailable
   */
  getFallbackModelList(): FetchModelsResult

  /**
   * Parse model information and determine capabilities
   */
  parseModelInfo(model: any): GeminiModelInfo

  /**
   * Determine capabilities based on model name and supported methods
   */
  determineCapabilities(model: any): string[]

  /**
   * Extract version information from model name
   */
  extractVersion(name: string): string

  /**
   * Get human-readable description for a capability
   */
  getCapabilityDescription(capability: string): string

  /**
   * Get capability icon for UI display
   */
  getCapabilityIcon(capability: string): string
}

declare const geminiModelService: GeminiModelService
export default geminiModelService
export { geminiModelService }
