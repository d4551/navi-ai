/**
 * AI-UI Integration Service - Enhanced Real-time Interface
 * 
 * Provides seamless integration between AI services and UI components
 * with real-time updates, error handling, and user experience enhancements
 */

import { reactive, computed } from 'vue';
import { aiService, AIRequest, AIResponse } from '@/shared/services/AIService';
import { MultimodalLiveService } from '@/shared/services/MultimodalLiveService';
import LiveMultimediaAIService from '@/shared/services/LiveMultimediaAIService';
import { logger } from '@/shared/utils/logger';

export interface AIOperationState {
  isLoading: boolean;
  error: string | null;
  progress: number;
  operation: string | null;
  canCancel: boolean;
}

export interface RealTimeUIState {
  isConnected: boolean;
  isStreaming: boolean;
  audioLevel: number;
  transcription: string;
  interimTranscription: string;
  videoActive: boolean;
  lastResponse: Date | null;
  sessionId: string | null;
}

export interface AIUIIntegrationConfig {
  enableRealtimeIndicators: boolean;
  enableProgressTracking: boolean;
  enableErrorRecovery: boolean;
  autoReconnect: boolean;
  maxRetries: number;
  uiUpdateThrottle: number;
}

class AIUIIntegrationService {
  private static instance: AIUIIntegrationService;

  // Reactive state for UI components
  private operationState = reactive<AIOperationState>({
    isLoading: false,
    error: null,
    progress: 0,
    operation: null,
    canCancel: false,
  });

  private realTimeState = reactive<RealTimeUIState>({
    isConnected: false,
    isStreaming: false,
    audioLevel: 0,
    transcription: '',
    interimTranscription: '',
    videoActive: false,
    lastResponse: null,
    sessionId: null,
  });

  private config: AIUIIntegrationConfig = {
    enableRealtimeIndicators: true,
    enableProgressTracking: true,
    enableErrorRecovery: true,
    autoReconnect: true,
    maxRetries: 3,
    uiUpdateThrottle: 100, // ms
  };

  // Active operation management
  private activeOperations = new Map<string, AbortController>();
  private retryCount = new Map<string, number>();
  private updateTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupErrorRecovery();
    this.setupRealtimeUpdates();
  }

  static getInstance(): AIUIIntegrationService {
    if (!AIUIIntegrationService.instance) {
      AIUIIntegrationService.instance = new AIUIIntegrationService();
    }
    return AIUIIntegrationService.instance;
  }

  /**
   * Get reactive state for UI components
   */
  getOperationState() {
    return readonly(this.operationState);
  }

  getRealTimeState() {
    return readonly(this.realTimeState);
  }

  /**
   * Enhanced AI request with UI integration
   */
  async performAIOperation<T = any>(
    operation: string,
    request: AIRequest | (() => Promise<T>),
    options: {
      showProgress?: boolean;
      canCancel?: boolean;
      successMessage?: string;
      errorMessage?: string;
  onProgress?: (_progress: number) => void;
  onSuccess?: (_result: T) => void;
  onError?: (_error: Error) => void;
    } = {}
  ): Promise<T> {
    const operationId = `${operation}-${Date.now()}`;
    const abortController = new AbortController();

    try {
      // Setup operation state
      this.operationState.isLoading = true;
      this.operationState.error = null;
      this.operationState.progress = 0;
      this.operationState.operation = operation;
      this.operationState.canCancel = options.canCancel ?? false;

      if (options.canCancel) {
        this.activeOperations.set(operationId, abortController);
      }

      // Track progress if enabled
      if (options.showProgress && this.config.enableProgressTracking) {
        this.simulateProgress(options.onProgress);
      }

      let result: T;

      // Execute the operation
      if (typeof request === 'function') {
        result = await request();
      } else {
        // Standard AI request
        result = await aiService.chat(request) as T;
      }

      // Update UI state on success
      this.operationState.progress = 100;
      this.operationState.isLoading = false;

      if (options.successMessage) {
        this.showSuccessNotification(options.successMessage);
      }

      options.onSuccess?.(result);
      return result;

    } catch (error) {
      const errorObj = error as Error;
      
      // Handle operation cancellation
      if (abortController.signal.aborted) {
        this.operationState.error = 'Operation cancelled';
        this.operationState.isLoading = false;
        throw new Error('Operation cancelled by user');
      }

      // Error recovery if enabled
      if (this.config.enableErrorRecovery) {
        const recovered = await this.attemptErrorRecovery(operationId, operation, request, options);
        if (recovered) {
          return recovered;
        }
      }

      // Update error state
      this.operationState.error = options.errorMessage || errorObj.message;
      this.operationState.isLoading = false;
      
      logger.error(`AI operation ${operation} failed:`, error);
      options.onError?.(errorObj);
      
      throw error;

    } finally {
      // Cleanup
      this.activeOperations.delete(operationId);
      this.retryCount.delete(operationId);
      
      setTimeout(() => {
        if (this.operationState.operation === operation) {
          this.operationState.operation = null;
          this.operationState.error = null;
          this.operationState.progress = 0;
        }
      }, 3000);
    }
  }

  /**
   * Cancel active AI operation
   */
  cancelOperation(operationId?: string): void {
    if (operationId) {
      const controller = this.activeOperations.get(operationId);
      controller?.abort();
    } else {
      // Cancel all active operations
      this.activeOperations.forEach(controller => controller.abort());
      this.activeOperations.clear();
    }

    this.operationState.isLoading = false;
    this.operationState.operation = null;
  }

  /**
   * Initialize real-time AI features with UI integration
   */
  async initializeRealTime(apiKey: string, options: {
    enableAudio?: boolean;
    enableVideo?: boolean;
    enableScreenshot?: boolean;
  onConnectionChange?: (_connected: boolean) => void;
  onTranscription?: (_text: string, _isFinal: boolean) => void;
  onVideoAnalysis?: (_analysis: string) => void;
  onResponse?: (_response: any) => void;
  } = {}): Promise<void> {
    try {
      this.operationState.isLoading = true;
      this.operationState.operation = 'Initializing real-time AI';

      const multimediaService = LiveMultimediaAIService.getInstance();
      
      // Setup callbacks for UI updates
      multimediaService.setCallbacks({
        onConnectionChange: (connected) => {
          this.realTimeState.isConnected = connected;
          options.onConnectionChange?.(connected);
          
          if (connected) {
            this.showSuccessNotification('Real-time AI connected');
          } else {
            this.showErrorNotification('Real-time AI disconnected');
          }
        },
        
        onAudioTranscription: (text, isFinal) => {
          if (isFinal) {
            this.realTimeState.transcription = text;
            this.realTimeState.interimTranscription = '';
          } else {
            this.realTimeState.interimTranscription = text;
          }
          options.onTranscription?.(text, isFinal);
        },
        
        onVideoAnalysis: (analysis) => {
          this.realTimeState.lastResponse = new Date();
          options.onVideoAnalysis?.(analysis);
        },
        
        onResponse: (response) => {
          this.realTimeState.lastResponse = new Date();
          options.onResponse?.(response);
        },
        
        onError: (error) => {
          this.operationState.error = error.message;
          logger.error('Real-time AI error:', error);
          
          if (this.config.autoReconnect) {
            this.scheduleReconnect();
          }
        }
      });

      // Initialize the service
      await multimediaService.initialize({
        apiKey,
        enableAudio: options.enableAudio ?? true,
        enableVideo: options.enableVideo ?? false,
        enableScreenshot: options.enableScreenshot ?? false,
      });

      this.realTimeState.sessionId = `session-${Date.now()}`;
      this.operationState.isLoading = false;
      
      logger.info('Real-time AI initialized successfully');

    } catch (error) {
      this.operationState.error = `Failed to initialize real-time AI: ${(error as Error).message}`;
      this.operationState.isLoading = false;
      throw error;
    }
  }

  /**
   * Start real-time audio streaming with UI feedback
   */
  async startAudioStreaming(): Promise<void> {
    try {
      const service = LiveMultimediaAIService.getInstance();
      await service.startAudioStreaming();
      
      this.realTimeState.isStreaming = true;
      this.startAudioLevelMonitoring();
      
      this.showSuccessNotification('Audio streaming started');

    } catch (error) {
      this.showErrorNotification(`Failed to start audio: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Stop audio streaming
   */
  stopAudioStreaming(): void {
    const service = LiveMultimediaAIService.getInstance();
    service.stopAudioStreaming();
    
    this.realTimeState.isStreaming = false;
    this.realTimeState.audioLevel = 0;
    
    this.showInfoNotification('Audio streaming stopped');
  }

  /**
   * Start video streaming with UI feedback
   */
  async startVideoStreaming(): Promise<void> {
    try {
      const service = LiveMultimediaAIService.getInstance();
      await service.startVideoStreaming();
      
      this.realTimeState.videoActive = true;
      this.showSuccessNotification('Video streaming started');

    } catch (error) {
      this.showErrorNotification(`Failed to start video: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Stop video streaming
   */
  stopVideoStreaming(): void {
    const service = LiveMultimediaAIService.getInstance();
    service.stopVideoStreaming();
    
    this.realTimeState.videoActive = false;
    this.showInfoNotification('Video streaming stopped');
  }

  /**
   * Capture and analyze screen with progress feedback
   */
  async captureScreen(prompt?: string): Promise<any> {
    return this.performAIOperation(
      'screen-capture',
      async () => {
        const service = LiveMultimediaAIService.getInstance();
        return await service.captureAndAnalyzeScreen(prompt);
      },
      {
        showProgress: true,
        successMessage: 'Screenshot analyzed successfully',
        errorMessage: 'Failed to capture and analyze screen',
      }
    );
  }

  /**
   * Enhanced streaming chat with real-time UI updates
   */
  async streamingChat(
    message: string,
    options: {
      sessionId?: string;
  onChunk?: (_chunk: string) => void;
  onComplete?: (_response: string) => void;
      showTypingIndicator?: boolean;
    } = {}
  ): Promise<AIResponse> {
    return this.performAIOperation(
      'streaming-chat',
      async () => {
        let fullResponse = '';
        
        if (options.showTypingIndicator) {
          this.showTypingIndicator(true);
        }

        const response = await aiService.realtimeChat({
          message,
          sessionId: options.sessionId || this.realTimeState.sessionId || 'default',
          onChunk: (chunk: string) => {
            fullResponse += chunk;
            options.onChunk?.(chunk);
          },
        });

        if (options.showTypingIndicator) {
          this.showTypingIndicator(false);
        }

        options.onComplete?.(fullResponse);
        return response;
      },
      {
        canCancel: true,
        showProgress: false,
      }
    );
  }

  /**
   * Batch AI operations with progress tracking
   */
  async performBatchOperations<T>(
    operations: Array<{
      name: string;
      operation: () => Promise<T>;
    }>,
    options: {
  onProgress?: (_completed: number, _total: number, _currentOperation: string) => void;
  onOperationComplete?: (_result: T, _operationName: string) => void;
    } = {}
  ): Promise<T[]> {
    this.operationState.isLoading = true;
    this.operationState.operation = 'Batch operations';
    this.operationState.progress = 0;

    const results: T[] = [];
    
    try {
      for (let i = 0; i < operations.length; i++) {
        const { name, operation } = operations[i];
        
        this.operationState.operation = `Processing: ${name}`;
        
        const result = await operation();
        results.push(result);
        
        const progress = ((i + 1) / operations.length) * 100;
        this.operationState.progress = progress;
        
        options.onProgress?.(i + 1, operations.length, name);
        options.onOperationComplete?.(result, name);
      }

      this.operationState.isLoading = false;
      return results;

    } catch (error) {
      this.operationState.isLoading = false;
      this.operationState.error = `Batch operation failed: ${(error as Error).message}`;
      throw error;
    }
  }

  /**
   * Get AI service health status with UI indicators
   */
  async getHealthStatus(): Promise<{
    aiService: boolean;
    realTimeService: boolean;
    multimodalService: boolean;
    overall: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const results: {
      aiService: boolean;
      realTimeService: boolean;
      multimodalService: boolean;
      overall: 'healthy' | 'degraded' | 'unhealthy';
      details: Record<string, any>;
    } = {
      aiService: false,
      realTimeService: false,
      multimodalService: false,
      overall: 'unhealthy',
      details: {},
    };

    try {
      // Check main AI service
      results.aiService = await aiService.healthCheck();
      
      // Check multimodal live service
      const multimodalService = MultimodalLiveService.getInstance();
      const healthCheck = await multimodalService.healthCheck();
      results.multimodalService = healthCheck.status === 'healthy';
      
      // Check multimedia service
      const multimediaService = LiveMultimediaAIService.getInstance();
      results.realTimeService = multimediaService.isServiceConnected();

      // Determine overall status
      if (results.aiService && results.realTimeService && results.multimodalService) {
        results.overall = 'healthy';
      } else if (results.aiService) {
        results.overall = 'degraded';
      } else {
        results.overall = 'unhealthy';
      }

      results.details = {
        lastCheck: new Date(),
        connectedServices: [
          results.aiService && 'AI Service',
          results.realTimeService && 'Real-time Service',
          results.multimodalService && 'Multimodal Service',
        ].filter(Boolean),
      };

    } catch (error) {
      logger.error('Health check failed:', error);
      results.details.error = (error as Error).message;
    }

    return results;
  }

  /**
   * Private helper methods
   */
  
  private async attemptErrorRecovery<T = any>(
    operationId: string,
    operation: string,
    request: AIRequest | (() => Promise<T>),
    _options: any
  ): Promise<T | null> {
    const currentRetries = this.retryCount.get(operationId) || 0;
    
    if (currentRetries >= this.config.maxRetries) {
      return null;
    }

    this.retryCount.set(operationId, currentRetries + 1);
    
    // Show retry notification
    this.showInfoNotification(`Retrying ${operation}... (${currentRetries + 1}/${this.config.maxRetries})`);
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetries) * 1000));

    try {
      // Retry the operation
      if (typeof request === 'function') {
        return await request();
      } else {
        return await aiService.chat(request) as T;
      }
    } catch {
      // If retry also fails, return null to continue with normal error handling
      return null;
    }
  }

  private simulateProgress(_onProgress?: (_progress: number) => void): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(interval);
        return;
      }
      
      this.operationState.progress = Math.min(progress, 90);
      _onProgress?.(this.operationState.progress);
    }, 200);
  }

  private startAudioLevelMonitoring(): void {
    // Simplified audio level simulation
    const updateLevel = () => {
      if (this.realTimeState.isStreaming) {
        this.realTimeState.audioLevel = Math.random() * 100;
        setTimeout(updateLevel, 100);
      }
    };
    
    updateLevel();
  }

  private scheduleReconnect(): void {
    setTimeout(async () => {
      try {
        const service = LiveMultimediaAIService.getInstance();
        await service.cleanup();
        // Re-initialization would need to be handled by the component
        this.showInfoNotification('Attempting to reconnect...');
      } catch (error) {
        logger.error('Auto-reconnect failed:', error);
      }
    }, 5000);
  }

  private setupErrorRecovery(): void {
    // Global error handler for AI operations
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('AI') || event.reason?.message?.includes('Gemini')) {
        this.operationState.error = 'AI service encountered an unexpected error';
        logger.error('Unhandled AI error:', event.reason);
      }
    });
  }

  private setupRealtimeUpdates(): void {
    if (this.config.enableRealtimeIndicators) {
      // Throttled UI updates
      this.updateTimer = setInterval(() => {
        // Update connection indicators, audio levels, etc.
        // This would trigger UI reactivity updates
      }, this.config.uiUpdateThrottle);
    }
  }

  private showSuccessNotification(message: string): void {
    // Integration point for toast notifications
    console.info(`✅ ${message}`);
    // In a real app, this would show a toast notification
  }

  private showErrorNotification(message: string): void {
    console.error(`❌ ${message}`);
    // In a real app, this would show an error toast
  }

  private showInfoNotification(message: string): void {
    console.info(`ℹ️ ${message}`);
    // In a real app, this would show an info toast
  }

  private showTypingIndicator(show: boolean): void {
    // Update UI to show/hide typing indicator
    logger.debug(`Typing indicator: ${show ? 'shown' : 'hidden'}`);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Cancel all active operations
    this.cancelOperation();

    // Clear timers
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    // Reset state
    this.operationState.isLoading = false;
    this.operationState.error = null;
    this.operationState.operation = null;
    this.operationState.progress = 0;

    this.realTimeState.isConnected = false;
    this.realTimeState.isStreaming = false;
    this.realTimeState.videoActive = false;

    // Cleanup services
    const multimediaService = LiveMultimediaAIService.getInstance();
    await multimediaService.cleanup();

    logger.info('AI-UI Integration Service cleaned up');
  }
}

// Vue composable for easy integration
export function useAIUI() {
  const service = AIUIIntegrationService.getInstance();

  return {
    // Reactive state
    operationState: service.getOperationState(),
    realTimeState: service.getRealTimeState(),

    // Operations
    performAIOperation: service.performAIOperation.bind(service),
    cancelOperation: service.cancelOperation.bind(service),
    performBatchOperations: service.performBatchOperations.bind(service),

    // Real-time features
    initializeRealTime: service.initializeRealTime.bind(service),
    startAudioStreaming: service.startAudioStreaming.bind(service),
    stopAudioStreaming: service.stopAudioStreaming.bind(service),
    startVideoStreaming: service.startVideoStreaming.bind(service),
    stopVideoStreaming: service.stopVideoStreaming.bind(service),
    captureScreen: service.captureScreen.bind(service),
    streamingChat: service.streamingChat.bind(service),

    // Health and monitoring
    getHealthStatus: service.getHealthStatus.bind(service),
    cleanup: service.cleanup.bind(service),

    // Computed helpers
    isAIReady: computed(() => !service.getOperationState().isLoading && !service.getOperationState().error),
    isRealTimeActive: computed(() => service.getRealTimeState().isConnected),
    currentOperation: computed(() => service.getOperationState().operation),
    hasError: computed(() => !!service.getOperationState().error),
  };
}

// Helper function for Vue components
function readonly<T extends object>(obj: T): Readonly<T> {
  return obj as Readonly<T>;
}

export default AIUIIntegrationService;