// Canonical AI module entrypoint
// Centralizes AI service calls and provides unified interface

export * from '@/utils/aiClient'
export { default as aiClient } from '@/utils/aiClient'

// Use the canonical AI service as the main service
export * from '@/shared/services/AIService'
export { aiService, initializeAI } from '@/shared/services/AIService'

// AI Service Layer - Centralized AI operations
export * from './prompts';
export * from './types';

// Legacy compatibility - export local service as backup
export { aiService as legacyAIService } from './services';

