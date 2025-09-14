/**
 * MULTI-MODAL AI MANAGER
 * Advanced multi-provider, multi-modal AI orchestration system
 */

import { reactive, computed } from 'vue'
import { logger } from '@/shared/utils/logger'
import {
  AIProvider,
  ModalityType,
  RequestType,
  MultiModalRequest,
  MultiModalResponse,
  ProviderConfig,
  AIManagerState,
  ProviderStatus,
  AIManagerConfig,
  ModelInfo,
  StreamCallbacks,
  ConcurrentProcess,
  HealthMetrics,
  PerformanceReport
} from '@/shared/types/ai'

// Concrete provider implementations
import GeminiProvider from './providers/GeminiProvider'
import OpenAIProvider from './providers/OpenAIProvider'
import ClaudeProvider from './providers/ClaudeProvider'
import GrokProvider from './providers/GrokProvider'
import DalleProvider from './providers/DalleProvider'

interface AIManagerEvent {
  type: string
  data: any
}

// Event emitter for reactive updates
class EventEmitter {
  private listeners = new Map<string, Array<(data: any) => void>>()

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data: any) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }
}

class MultiModalAIManager {
  private static instance: MultiModalAIManager
  private eventEmitter = new EventEmitter()
  private providers = new Map<AIProvider, any>()
  private healthCheckInterval: NodeJS.Timeout | null = null

  // Reactive state
  private state: AIManagerState = reactive({
    isInitialized: false,
    providers: new Map<AIProvider, ProviderStatus>(),
    currentRequests: new Map<string, MultiModalRequest>(),
    performanceData: [],
    defaultModality: ModalityType.TEXT,
    loadBalancing: true
  })

  // Configuration
  private config: AIManagerConfig = {
    providers: [],
    enableLoadBalancing: true,
    enableConcurrentExecution: true,
    enableFallback: true,
    healthCheckInterval: 30000, // 30 seconds
    defaultTimeout: 60000, // 60 seconds
    maxRetries: 3
  }

  static getInstance(config?: Partial<AIManagerConfig>): MultiModalAIManager {
    if (!MultiModalAIManager.instance) {
      MultiModalAIManager.instance = new MultiModalAIManager(config)
    }
    return MultiModalAIManager.instance
  }

  private constructor(config?: Partial<AIManagerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.initializeProviders()
    this.startHealthChecks()
  }

  // Computed properties
  get isReady() {
    return computed(() => this.state.isInitialized && this.getHealthyProviders().length > 0)
  }

  get activeProviders() {
    return computed(() => Array.from(this.state.providers.values()))
  }

  get currentLoad() {
    return computed(() => {
      let totalRequests = 0
      let healthyProviders = 0
      this.state.providers.forEach(status => {
        totalRequests += status.activeRequests
        if (status.health === 'healthy') healthyProviders++
      })
      return { totalRequests, healthyProviders }
    })
  }

  get performanceMetrics() {
    return computed(() => this.generatePerformanceReport())
  }

  // Initialization
  private initializeProviders() {
    // Register provider implementations
    this.providers.set(AIProvider.GEMINI, new GeminiProvider())
    this.providers.set(AIProvider.OPENAI, new OpenAIProvider())
    this.providers.set(AIProvider.CLAUDE, new ClaudeProvider())
    this.providers.set(AIProvider.GROK, new GrokProvider())
    this.providers.set(AIProvider.DALLE, new DalleProvider())

    // Initialize provider statuses
    this.providers.forEach((_, provider) => {
      this.state.providers.set(provider, {
        provider,
        initialized: false,
        health: 'down',
        lastHealthCheck: 0,
        activeRequests: 0,
        totalRequests: 0,
        errorCount: 0
      })
    })
  }

  async initialize(config ?: ProviderConfig[]): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Initializing MultiModal AI Manager...')

      if (config) {
        this.config.providers = config
      }

      // Initialize configured providers
      const initPromises = this.config.providers.map(async (providerConfig) => {
        const provider = this.providers.get(providerConfig.provider)
        if (provider) {
          try {
            await provider.initialize(providerConfig)
            this.updateProviderStatus(providerConfig.provider, {
              initialized: true,
              health: 'healthy'
            })
            logger.info(`Initialized provider: ${providerConfig.provider}`)
          } catch (error) {
            logger.error(`Failed to initialize provider ${providerConfig.provider}:`, error)
            this.updateProviderStatus(providerConfig.provider, {
              initialized: false,
              health: 'down',
              errorCount: (this.state.providers.get(providerConfig.provider)?.errorCount || 0) + 1
            })
          }
        }
      })

      await Promise.allSettled(initPromises)

      // Check if we have at least one healthy provider
      const healthyProviders = this.getHealthyProviders()

      if (healthyProviders.length === 0) {
        throw new Error('No AI providers could be initialized. Please check your API keys.')
      }

      this.state.isInitialized = true
      logger.info(`MultiModal AI Manager initialized with ${healthyProviders.length} providers`)

      return {
        success: true,
        message: `Successfully initialized ${healthyProviders.length} AI providers`
      }

    } catch (error) {
      logger.error('Failed to initialize MultiModal AI Manager:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown initialization error'
      }
    }
  }

  // Core execution methods
  async executeRequest(request: MultiModalRequest): Promise<MultiModalResponse> {
    const startTime = Date.now()
    this.state.currentRequests.set(request.id, request)

    try {
      this.eventEmitter.emit('request_started', request)

      // Determine execution strategy
      if (request.options.concurrentExecution && request.providers.length > 1) {
        return await this.executeConcurrent(request)
      } else {
        return await this.executeSequential(request)
      }

    } catch (error) {
      const errorResponse = this.createErrorResponse(request, error)
      this.updateMetrics(request, startTime, errorResponse)
      return errorResponse
    } finally {
      this.state.currentRequests.delete(request.id)
      this.eventEmitter.emit('request_completed', { requestId: request.id, timing: Date.now() - startTime })
    }
  }

  // Sequential execution (single provider)
  private async executeSequential(request: MultiModalRequest): Promise<MultiModalResponse> {
    const provider = this.selectProvider(request)

    if (!provider) {
      throw new Error('No suitable provider available')
    }

    this.incrementProviderRequests(request.providers[0])
    const result = await this.providers.get(request.providers[0])!.execute(request)
    this.decrementProviderRequests(request.providers[0])

    return result
  }

  // Concurrent execution (multiple providers)
  private async executeConcurrent(request: MultiModalRequest): Promise<MultiModalResponse> {
    const concurrentProcess: ConcurrentProcess = {
      id: `concurrent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      request,
      processes: request.providers.map(provider => ({
        id: `process_${Math.random().toString(36).substr(2, 9)}`,
        provider,
        status: 'pending' as const,
        timing: { startedAt: 0, completedAt: 0, totalTime: 0, processingTime: 0 }
      })),
      coordinator: {
        strategy: 'parallel',
        combiner: this.combineResults.bind(this),
        timeout: this.config.defaultTimeout
      }
    }

    // Execute all providers in parallel
    const promises = concurrentProcess.processes.map(async (process) => {
      try {
        process.status = 'running'
        process.timing.startedAt = Date.now()

        this.incrementProviderRequests(process.provider)
        const result = await this.providers.get(process.provider)!.execute(request)
        process.result = result
        process.status = 'completed'
        process.timing.completedAt = Date.now()
        process.timing.totalTime = process.timing.completedAt - process.timing.startedAt
        process.timing.processingTime = process.timing.totalTime

        this.decrementProviderRequests(process.provider)
        return result

      } catch (error) {
        process.status = 'failed'
        process.timing.completedAt = Date.now()
        process.timing.totalTime = process.timing.completedAt - process.timing.startedAt
        this.decrementProviderRequests(process.provider)
        throw error
      }
    })

    // Wait for first success or all failures
    try {
      const firstResult = await Promise.race(promises)
      return firstResult
    } catch (error) {
      if (error instanceof AggregateError) {
        throw new Error(`All concurrent executions failed: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }
  }

  // Provider selection with load balancing
  private selectProvider(request: MultiModalRequest): AIProvider | null {
    const availableProviders = request.providers.filter(provider =>
      this.isProviderHealthy(provider) && this.canHandleRequest(provider, request)
    )

    if (availableProviders.length === 0) {
      return null
    }

    if (!this.config.enableLoadBalancing || availableProviders.length === 1) {
      return availableProviders[0]
    }

    // Load balancing: select provider with least active requests
    return availableProviders.reduce((selected, current) => {
      const selectedLoad = this.state.providers.get(selected)?.activeRequests || 0
      const currentLoad = this.state.providers.get(current)?.activeRequests || 0
      return currentLoad < selectedLoad ? current : selected
    })
  }

  // Check if provider can handle request
  private canHandleRequest(provider: AIProvider, request: MultiModalRequest): boolean {
    const providerImpl = this.providers.get(provider)
    return providerImpl ? providerImpl.canHandle(request) : false
  }

  // Streaming execution
  streamRequest(request: MultiModalRequest, callbacks: StreamCallbacks): any {
    const provider = this.selectProvider(request)

    if (!provider) {
      callbacks.onError?.(new Error('No suitable provider available for streaming'))
      return null
    }

    const providerImpl = this.providers.get(provider)
    if (providerImpl && providerImpl.stream) {
      this.incrementProviderRequests(provider)
      return providerImpl.stream(request, {
        ...callbacks,
        onError: (error: Error) => {
          this.decrementProviderRequests(provider)
          callbacks.onError?.(error)
        }
      })
    } else {
      callbacks.onError?.(new Error('Selected provider does not support streaming'))
      return null
    }
  }

  // Model management
  getAvailableModels(): ModelInfo[] {
    const allModels: ModelInfo[] = [];

    this.providers.forEach(provider => {
      if (provider.getModels) {
        allModels.push(...provider.getModels())
      }
    })

    return allModels
  }

  async switchModel(provider: AIProvider, modelId: string): Promise<boolean> {
    const providerImpl = this.providers.get(provider)
    if (providerImpl && this.isProviderHealthy(provider)) {
      return await providerImpl.switchModel(modelId)
    }
    return false
  }

  // Health and monitoring
  private isProviderHealthy(provider: AIProvider): boolean {
    const status = this.state.providers.get(provider)
    return status ? status.health === 'healthy' && status.initialized : false
  }

  private getHealthyProviders(): AIProvider[] {
    return Array.from(this.state.providers.entries())
      .filter(([, status]) => status.health === 'healthy' && status.initialized)
      .map(([provider]) => provider)
  }

  // Health checks
  private async startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheckInterval)
  }

  private async performHealthChecks() {
    const healthChecks = Array.from(this.providers.entries()).map(async ([provider, impl]) => {
      try {
        const health = await impl.checkHealth()
        this.updateProviderHealth(provider, health)
      } catch (error) {
        this.updateProviderHealth(provider, {
          status: 'down',
          responseTime: 0,
          errorRate: 1
        })
      }
    })

    await Promise.allSettled(healthChecks)
    this.eventEmitter.emit('health_check_completed', this.getHealthOverview())
  }

  // Helper methods
  private updateProviderStatus(provider: AIProvider, updates: Partial<ProviderStatus>) {
    const current = this.state.providers.get(provider)
    if (current) {
      this.state.providers.set(provider, { ...current, ...updates })
    }
  }

  private updateProviderHealth(provider: AIProvider, health: HealthMetrics) {
    const current = this.state.providers.get(provider)
    if (current) {
      this.state.providers.set(provider, {
        ...current,
        health: health.status,
        lastHealthCheck: Date.now()
      })
    }
  }

  private incrementProviderRequests(provider: AIProvider) {
    const current = this.state.providers.get(provider)
    if (current) {
      this.state.providers.set(provider, {
        ...current,
        activeRequests: current.activeRequests + 1,
        totalRequests: current.totalRequests + 1
      })
    }
  }

  private decrementProviderRequests(provider: AIProvider) {
    const current = this.state.providers.get(provider)
    if (current) {
      this.state.providers.set(provider, {
        ...current,
        activeRequests: Math.max(0, current.activeRequests - 1)
      })
    }
  }

  private updateMetrics(request: MultiModalRequest, startTime: number, response: MultiModalResponse) {
    const duration = Date.now() - startTime

    // Add performance data for analysis
    this.state.performanceData.push({
      model: response.model,
      taskType: request.type,
      samples: 1,
      averageSpeed: duration,
      averageCost: response.usage.cost,
      qualityScore: response.success ? 1 : 0,
      uptime: response.success ? 100 : 0
    })

    // Keep only recent data (last 100 entries)
    if (this.state.performanceData.length > 100) {
      this.state.performanceData = this.state.performanceData.slice(-100)
    }
  }

  private createErrorResponse(request: MultiModalRequest, error: any): MultiModalResponse {
    return {
      id: `error_${Date.now()}`,
      requestId: request.id,
      provider: request.providers[0] || AIProvider.GEMINI,
      model: 'unknown',
      success: false,
      content: {},
      usage: { inputTokens: 0, outputTokens: 0, imagesGenerated: 0, audioDuration: 0, videoDuration: 0, cost: 0 },
      timing: { startedAt: 0, completedAt: Date.now(), totalTime: 0, processingTime: 0 },
      error: error instanceof Error ? error.message : String(error)
    }
  }

  private combineResults(results: MultiModalResponse[]): MultiModalResponse {
    // For now, return the first successful result
    // In a production system, this could implement more sophisticated combining logic
    const successfulResults = results.filter(r => r.success)
    return successfulResults.length > 0 ? successfulResults[0] : results[0]
  }

  private generatePerformanceReport(): PerformanceReport[] {
    return this.state.performanceData
  }

  private getHealthOverview() {
    const healthy = this.getHealthyProviders().length
    const total = this.providers.size
    return { healthy, total, percentage: total > 0 ? (healthy / total) * 100 : 0 }
  }

  // Event handling
  on(event: string, callback: (data: any) => void) {
    this.eventEmitter.on(event, callback)
  }

  off(event: string, callback: (data: any) => void) {
    this.eventEmitter.off(event, callback)
  }

  // Cleanup
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    // Shutdown all providers
    this.providers.forEach(provider => {
      if (provider.shutdown) {
        provider.shutdown()
      }
    })

    this.state.isInitialized = false
    logger.info('MultiModal AI Manager destroyed')
  }
}

// Export singleton instance
export const multiModalAIManager = MultiModalAIManager.getInstance()

// Compatibility wrapper for existing code
export function useMultiModalAI() {
  return {
    isReady: multiModalAIManager.isReady,
    activeProviders: multiModalAIManager.activeProviders,
    currentLoad: multiModalAIManager.currentLoad,
    executeRequest: (request: MultiModalRequest) => multiModalAIManager.executeRequest(request),
    streamRequest: (request: MultiModalRequest, callbacks: StreamCallbacks) => multiModalAIManager.streamRequest(request, callbacks),
    getAvailableModels: () => multiModalAIManager.getAvailableModels(),
    switchModel: (provider: AIProvider, modelId: string) => multiModalAIManager.switchModel(provider, modelId),
    on: (event: string, callback: any) => multiModalAIManager.on(event, callback),
    off: (event: string, callback: any) => multiModalAIManager.off(event, callback),
    initialize: (config: ProviderConfig[]) => multiModalAIManager.initialize(config),
    performanceMetrics: multiModalAIManager.performanceMetrics,
    destroy: () => multiModalAIManager.destroy()
  }
}
