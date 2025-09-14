/**
 * Global AI Integration Composable
 * Centralizes AI feature access and state management across the application
 */

import { ref, onMounted, getCurrentInstance, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRouter, useRoute } from 'vue-router'
import { aiService } from '@/shared/services/AIService'
import { logger } from '@/shared/utils/logger'
import { useToast } from '@/composables/useToast'

export function useAIIntegration(ctx = {}) {
  const store = useAppStore()
  // Safely resolve router/route only when inside a component instance
  const vm = getCurrentInstance()
  const router = ctx.router || (vm ? useRouter() : null)
  const routeRef = ctx.routeRef || null
  const route = ctx.route || (vm ? useRoute() : null)
  const toast = useToast()

  // AI Status
  const isAIInitialized = ref(false)
  const aiInitializing = ref(false)
  const aiError = ref(null)
  const aiCapabilities = ref({
    textGeneration: false,
    imageAnalysis: false,
    voiceInput: false,
    realtimeChat: false,
    documentAnalysis: false
  })

  // AI Features State
  const aiFeatures = ref({
    resumeBuilder: { enabled: false, active: false },
    coverLetterBuilder: { enabled: false, active: false },
    portfolioGenerator: { enabled: false, active: false },
    skillsMapper: { enabled: false, active: false },
    jobSearch: { enabled: false, active: false },
    interviewPrep: { enabled: false, active: false },
    realtimeChat: { enabled: false, active: false }
  })

  // Computed Properties
  const hasAIKey = computed(() => {
    return !!(store.settings?.geminiApiKey || store.settings?.openaiApiKey)
  })

  const currentPageAIFeatures = computed(() => {
    const meta = routeRef?.value?.meta || route?.meta || {}
    return {
      isAIPowered: meta.aiPowered || false,
      isLiveFeature: meta.isLive || false,
      hasAICapabilities: meta.aiPowered && hasAIKey.value
    }
  })

  const aiStatusMessage = computed(() => {
    if (aiError.value) return `AI Error: ${aiError.value}`
    if (aiInitializing.value) return 'Initializing AI services...'
    if (!hasAIKey.value) return 'AI key required - configure in settings'
    if (isAIInitialized.value) return 'AI services ready'
    return 'AI services offline'
  })

  const aiStatusVariant = computed(() => {
    if (aiError.value) return 'error'
    if (aiInitializing.value) return 'info'
    if (!hasAIKey.value) return 'warning'
    if (isAIInitialized.value) return 'success'
    return 'secondary'
  })

  // Methods
  async function initializeAI(force = false) {
    if (aiInitializing.value && !force) return false
    
    if (!hasAIKey.value) {
      logger.warn('Cannot initialize AI: No API key configured')
      aiError.value = 'API key required'
      return false
    }

    try {
      aiInitializing.value = true
      aiError.value = null

      logger.info('Initializing AI services...')
      
      // Initialize AI service with user settings
      const geminiKey = store.settings.geminiApiKey
      const openaiKey = store.settings.openaiApiKey
      const provider = geminiKey ? 'google' : openaiKey ? 'openai' : 'google'
      const apiKey = geminiKey || openaiKey
      const model = store.settings.selectedModel || 'gemini-2.5-flash'

      if (!apiKey) {
        throw new Error('No valid API key found. Please configure your API key in settings.')
      }

      const result = await aiService.initialize({
        apiKey,
        primaryProvider: provider,
        model,
        enableContextPersistence: true,
        enableRealTime: store.settings.enableRealtimeFeatures || false,
        enableMultimodal: true,
        maxTokens: store.settings.maxTokens || 8192,
        temperature: store.settings.temperature || 0.7
      })

      if (result.success) {
        isAIInitialized.value = true
        
        // Update capabilities based on model
        aiCapabilities.value = {
          textGeneration: true,
          imageAnalysis: result.model?.capabilities?.imageInput || true,
          voiceInput: result.model?.capabilities?.audioInput || false,
          realtimeChat: result.model?.capabilities?.realtimeChat || false,
          documentAnalysis: true
        }

        // Enable AI features
        updateAIFeatureAvailability()
        
        logger.info('AI services initialized successfully', result)
        
        // Emit custom event for other components to listen
        window.dispatchEvent(new CustomEvent('ai-initialized', { 
          detail: { capabilities: aiCapabilities.value, provider } 
        }))
        
        return true
      } else {
        throw new Error(result.message || result.error || 'AI initialization failed')
      }
    } catch (error) {
      aiError.value = error.message || 'Unknown initialization error'
      isAIInitialized.value = false
      logger.error('AI initialization failed:', error)
      
      // Emit error event
      window.dispatchEvent(new CustomEvent('ai-error', { 
        detail: { error: aiError.value } 
      }))
      
      if (toast) {
        toast.error(`AI services failed to initialize: ${aiError.value}`)
      }
      return false
    } finally {
      aiInitializing.value = false
    }
  }

  function updateAIFeatureAvailability() {
    const baseAvailability = isAIInitialized.value && hasAIKey.value

    aiFeatures.value = {
      resumeBuilder: { 
        enabled: baseAvailability && aiCapabilities.value.textGeneration,
        active: route?.name === 'DocumentBuilder'
      },
      coverLetterBuilder: { 
        enabled: baseAvailability && aiCapabilities.value.textGeneration,
        active: route?.name === 'DocumentBuilder'
      },
      portfolio: { 
        enabled: baseAvailability && aiCapabilities.value.textGeneration,
        active: route?.name === 'Portfolio'
      },
      // Backward-compatibility alias for legacy name
      portfolioGenerator: {
        enabled: baseAvailability && aiCapabilities.value.textGeneration,
        active: route?.name === 'Portfolio'
      },
      skillsMapper: { 
        enabled: baseAvailability && aiCapabilities.value.textGeneration,
        active: route.name === 'SkillMapper'
      },
      jobSearch: { 
        enabled: baseAvailability && aiCapabilities.value.textGeneration,
        active: route.name === 'JobSearch'
      },
      interviewPrep: { 
        enabled: baseAvailability && (aiCapabilities.value.textGeneration || aiCapabilities.value.voiceInput),
        active: route.name === 'GamingInterview'
      },
      realtimeChat: { 
        enabled: baseAvailability && aiCapabilities.value.realtimeChat,
        active: route.name === 'RealTimeDemo'
      }
    }
  }

  async function triggerAIAction(actionType, context = {}) {
    // Backward-compatibility aliasing
    if (actionType === 'analyzematch') actionType = 'analyze_job_match'
    if (actionType === 'salaryinsights') actionType = 'salary_insights'
    if (actionType === 'aioptimize') actionType = 'enhance_content'
    
    // Validate AI is ready
    if (!isAIInitialized.value) {
      // Try to initialize first
      const initialized = await initializeAI()
      if (!initialized) {
        toast?.warning('AI services not available. Please check your API key in settings.')
        return null
      }
    }

    try {
      logger.info(`Triggering AI action: ${actionType}`, context)
      let result = null

      switch (actionType) {
        case 'generate_resume_content':
          result = await aiService.generateResumeContent(context)
          break
        
        case 'analyze_job_match':
          result = await aiService.analyzeJobMatch(context)
          break
          
        case 'generate_cover_letter':
          result = await aiService.generateCoverLetter(context)
          break
          
        case 'extract_skills':
          result = await aiService.extractSkills(context)
          break
        
        case 'analyze_resume':
          result = await aiService.analyzeResumeQuick(context)
          break
        
        case 'optimize_portfolio':
          result = await aiService.optimizePortfolio(context)
          break
        
        case 'search_jobs':
          result = await aiService.searchJobs(context)
          break
        
        case 'map_skills':
          result = await aiService.mapSkills(context)
          break
          
        case 'conduct_interview':
        case 'mock_interview':
          result = await aiService.conductMockInterview(context)
          break
          
        case 'realtime_chat':
          result = await aiService.realtimeChat(context)
          break
        
        case 'salary_insights':
          result = await aiService.salaryInsights(context)
          break
        
        case 'enhance_content':
          // Generic enhancement: route to chat with context
          result = await aiService.chat({
            message: 'Enhance the following content with clear, concise improvements.',
            context: JSON.stringify(context || {}),
            type: 'generation'
          })
          break
          
        case 'analyze_studio_fit':
          // Analyze how well user profile fits with studio culture and requirements
          result = await aiService.analyzeStudioFit(context)
          break
          
        case 'recommend_studios':
          // Get AI recommendations for studios based on user preferences
          result = await aiService.recommendStudios(context)
          break
          
        case 'semantic_job_search':
          // Perform AI-powered semantic job search
          result = await aiService.performSemanticJobSearch(context)
          break
          
        case 'enhance_job_matching':
          // Enhance job matching with AI insights
          result = await aiService.enhanceJobMatching(context)
          break

        case 'ai_optimize':
        case 'suggest_skills':
        case 'start_resume':
        case 'find_jobs':
          // Handle UI action triggers
          result = await aiService.chat({
            message: `Help me with: ${actionType.replace(/_/g, ' ')}`,
            context: JSON.stringify(context || {}),
            type: 'analysis'
          })
          break
          
        default:
          throw new Error(`Unknown AI action: ${actionType}`)
      }

      if (result) {
        logger.info(`AI action completed: ${actionType}`, result)
        
        // Emit success event for other components
        window.dispatchEvent(new CustomEvent('ai-action-completed', { 
          detail: { actionType, result, context } 
        }))
        
        return result
      } else {
        throw new Error('AI action returned no result')
      }
    } catch (error) {
      logger.error(`AI action failed (${actionType}):`, error)
      
      // Emit error event
      window.dispatchEvent(new CustomEvent('ai-action-failed', { 
        detail: { actionType, error: error.message, context } 
      }))
      
      // More user-friendly error messages
      let errorMessage = error.message
      if (error.message.includes('API key')) {
        errorMessage = 'Please configure your API key in settings'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error - please check your connection'
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'API usage limit reached - please try again later'
      }
      
      toast?.error(`AI action failed: ${errorMessage}`)
      return null
    }
  }

  function navigateToAIFeature(featureName) {
    const featureRoutes = {
      resume: '/resume',
      coverLetter: '/cover-letter',
      portfolio: '/portfolio',
      skills: '/skills',
      jobs: '/jobs',
      studios: '/studios',
      interview: '/interview',
      realtimeChat: '/demo/realtime'
    }

    const route = featureRoutes[featureName]
    if (router && route) {
      router.push(route)
    } else {
      logger.warn(`Unknown AI feature route: ${featureName}`)
    }
  }

  function getAIFeatureStatus(featureName) {
    return aiFeatures.value[featureName] || { enabled: false, active: false }
  }

  function showAISetupModal() {
    // This would trigger a modal to help users set up AI
    router.push('/settings?tab=ai')
  }

  // Watchers
  watch(() => store.settings?.geminiApiKey, (newKey) => {
    if (newKey && !isAIInitialized.value) {
      initializeAI()
    }
  })

  if (routeRef || route) {
    watch(() => (routeRef?.value?.name || route?.name), () => {
      updateAIFeatureAvailability()
    })
  }

  // Auto-initialize on mount if key is available
  onMounted(() => {
    if (hasAIKey.value) {
      initializeAI()
    }
  })

  return {
    // State
    isAIInitialized: computed(() => isAIInitialized.value),
    aiInitializing: computed(() => aiInitializing.value),
    aiError: computed(() => aiError.value),
    aiCapabilities: computed(() => aiCapabilities.value),
    aiFeatures: computed(() => aiFeatures.value),
    hasAIKey,
    currentPageAIFeatures,
    aiStatusMessage,
    aiStatusVariant,

    // Methods
    initializeAI,
    updateAIFeatureAvailability,
    triggerAIAction,
    navigateToAIFeature,
    getAIFeatureStatus,
    showAISetupModal
  }
}

// Global AI Integration Plugin
export function createAIIntegrationPlugin(deps = {}) {
  return {
    install(app) {
      // Lazy getter ensures composable executes within component instance context
      Object.defineProperty(app.config.globalProperties, '$ai', {
        get() {
          const r = deps.router || app.config.globalProperties.$router || null
          const routeRef = r && r.currentRoute ? r.currentRoute : null
          return useAIIntegration({ router: r, routeRef })
        }
      })
      // Also provide a factory for injection-based usage
      app.provide('useAIIntegration', (ctx) => useAIIntegration(ctx))
      // Remove the problematic global provide - let components inject as needed
      // app.provide('aiIntegration', useAIIntegration({ router: deps.router }))
    }
  }
}

export default useAIIntegration
