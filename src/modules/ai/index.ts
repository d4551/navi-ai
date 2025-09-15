// Canonical AI module entrypoint
// Centralizes AI service calls and provides unified interface

// TypeScript note: aiClient is implemented in JS; we re-export with loose typing for compatibility.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export * from '@/utils/aiClient'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { default as aiClient } from '@/utils/aiClient'

// Re-export core AI service APIs with explicit names to avoid collisions with client helpers
export {
  aiService as coreAIService,
  chatWithAI,
  streamChatWithAI,
  startRealTimeAI,
  stopRealTimeAI,
  realtimeChat,
  initializeAI as initializeAIService
} from '@/shared/services/AIService'

// AI Service Layer - Centralized AI operations
export * from './prompts';
export * from './types';

// Legacy compatibility - export local service as backup
export { aiService as legacyAIService } from './services';

