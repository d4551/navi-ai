/**
 * Composable for Live Multimedia AI Integration
 * 
 * Provides reactive interface to the LiveMultimediaAIService
 * for use in Vue components like AI Fairy Assistant
 */

import { ref, reactive, onUnmounted } from 'vue';
import LiveMultimediaAIService, { 
  type MultimediaAIConfig, 
  type MediaAnalysisResult, 
  type LiveCallbacks 
} from '@/shared/services/LiveMultimediaAIService';
import { useToast } from '@/composables/useToast';
import { logger } from '@/shared/utils/logger';

export interface MultimediaState {
  isConnected: boolean;
  isAudioStreaming: boolean;
  isVideoStreaming: boolean;
  isProcessing: boolean;
  lastError: string | null;
}

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'audio' | 'video' | 'image';
  hasMedia: boolean;
  mediaType?: string;
  metadata?: Record<string, any>;
}

export function useLiveMultimediaAI() {
  const toast = useToast();
  const service = LiveMultimediaAIService.getInstance();

  // Reactive state
  const state = reactive<MultimediaState>({
    isConnected: false,
    isAudioStreaming: false,
    isVideoStreaming: false,
    isProcessing: false,
    lastError: null,
  });

  const conversationHistory = ref<ConversationMessage[]>([]);
  const currentTranscription = ref('');
  const currentVideoAnalysis = ref('');
  const isInitialized = ref(false);

  /**
   * Initialize the multimedia AI service
   */
  async function initialize(config: MultimediaAIConfig): Promise<boolean> {
    try {
      state.isProcessing = true;
      state.lastError = null;

      // Set up callbacks
      const callbacks: LiveCallbacks = {
        onConnectionChange: (connected) => {
          state.isConnected = connected;
          if (connected) {
            toast.success('🤖 AI Fairy connected to multimodal services');
            addSystemMessage('Multimodal AI services connected. Voice, video, and screenshot analysis ready!');
          } else {
            toast.warning('🔌 AI connection lost');
            addSystemMessage('Connection to AI services lost. Retrying...');
          }
        },

        onAudioTranscription: (text, isFinal) => {
          currentTranscription.value = text;
          if (isFinal && text.trim()) {
            addUserMessage(text, 'audio');
            currentTranscription.value = '';
          }
        },

        onVideoAnalysis: (analysis) => {
          currentVideoAnalysis.value = analysis;
          // Only add significant video analysis to conversation
          if (analysis && analysis.length > 50) {
            addSystemMessage(`Video AI: ${analysis}`, 'video');
          }
        },

        onScreenshotAnalysis: (analysis, screenshot) => {
          addUserMessage('📸 Screenshot captured', 'image', { screenshot });
          addAssistantMessage(analysis);
          toast.success('Screenshot analyzed successfully');
        },

        onResponse: (result: MediaAnalysisResult) => {
          addAssistantMessage(result.content, result.type as any, result.metadata);
        },

        onError: (error) => {
          state.lastError = error.message;
          logger.error('Multimedia AI error:', error);
          toast.error(`AI Error: ${error.message}`);
        }
      };

      service.setCallbacks(callbacks);
      await service.initialize(config);

      isInitialized.value = true;
      state.isProcessing = false;
      return true;

    } catch (error) {
      state.lastError = error instanceof Error ? error.message : 'Unknown error';
      state.isProcessing = false;
      logger.error('Failed to initialize multimedia AI:', error);
      toast.error('Failed to initialize AI services. Check your API key.');
      return false;
    }
  }

  /**
   * Start live audio streaming and transcription
   */
  async function startAudioStreaming(): Promise<boolean> {
    if (!isInitialized.value) {
      toast.warning('AI services not initialized');
      return false;
    }

    try {
      await service.startAudioStreaming();
      state.isAudioStreaming = true;
      toast.info('🎤 Voice input activated - speak now!');
      addSystemMessage('🎤 Voice input activated. Start speaking...');
      return true;
    } catch (error) {
      logger.error('Failed to start audio streaming:', error);
      toast.error('Failed to start voice input. Check microphone permissions.');
      return false;
    }
  }

  /**
   * Stop audio streaming
   */
  function stopAudioStreaming(): void {
    service.stopAudioStreaming();
    state.isAudioStreaming = false;
    toast.info('🎤 Voice input stopped');
    addSystemMessage('Voice input stopped');
  }

  /**
   * Toggle audio streaming
   */
  async function toggleAudioStreaming(): Promise<boolean> {
    if (state.isAudioStreaming) {
      stopAudioStreaming();
      return true;
    } else {
      return await startAudioStreaming();
    }
  }

  /**
   * Start live video streaming and analysis
   */
  async function startVideoStreaming(options?: {
    width?: number;
    height?: number;
    frameRate?: number;
  }): Promise<boolean> {
    if (!isInitialized.value) {
      toast.warning('AI services not initialized');
      return false;
    }

    try {
      await service.startVideoStreaming(options);
      state.isVideoStreaming = true;
      toast.info('📹 Video AI analysis activated');
      addSystemMessage('📹 Camera activated. AI is analyzing your video...');
      return true;
    } catch (error) {
      logger.error('Failed to start video streaming:', error);
      toast.error('Failed to start camera. Check camera permissions.');
      return false;
    }
  }

  /**
   * Stop video streaming
   */
  function stopVideoStreaming(): void {
    service.stopVideoStreaming();
    state.isVideoStreaming = false;
    currentVideoAnalysis.value = '';
    toast.info('📹 Video analysis stopped');
    addSystemMessage('Video analysis stopped');
  }

  /**
   * Toggle video streaming
   */
  async function toggleVideoStreaming(): Promise<void> {
    if (state.isVideoStreaming) {
      stopVideoStreaming();
    } else {
      await startVideoStreaming();
    }
  }

  /**
   * Capture and analyze screenshot
   */
  async function captureScreenshot(prompt?: string): Promise<MediaAnalysisResult | null> {
    if (!isInitialized.value) {
      toast.warning('AI services not initialized');
      return null;
    }

    try {
      state.isProcessing = true;
      toast.info('📸 Capturing screenshot...');
      
      const result = await service.captureAndAnalyzeScreen(prompt);
      state.isProcessing = false;
      
      return result;
    } catch (error) {
      state.isProcessing = false;
      logger.error('Failed to capture screenshot:', error);
      toast.error('Screenshot capture failed. Check screen sharing permissions.');
      return null;
    }
  }

  /**
   * Send text message with multimedia context
   */
  async function sendMessage(message: string): Promise<void> {
    if (!isInitialized.value) {
      toast.warning('AI services not initialized');
      return;
    }

    try {
      state.isProcessing = true;
      addUserMessage(message);
      
      const result = await service.sendMessage(message);
      state.isProcessing = false;
      
      // Response is automatically added via callback
    } catch (error) {
      state.isProcessing = false;
      logger.error('Failed to send message:', error);
      toast.error('Failed to send message to AI');
      addSystemMessage('❌ Failed to send message. Please try again.');
    }
  }

  /**
   * Add user message to conversation
   */
  function addUserMessage(
    content: string, 
    type: 'text' | 'audio' | 'video' | 'image' = 'text',
    metadata?: Record<string, any>
  ): void {
    const message: ConversationMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      role: 'user',
      content,
      type,
      hasMedia: type !== 'text',
      mediaType: type,
      metadata,
    };
    conversationHistory.value.push(message);
  }

  /**
   * Add assistant message to conversation
   */
  function addAssistantMessage(
    content: string,
    type: 'text' | 'audio' | 'video' | 'image' = 'text',
    metadata?: Record<string, any>
  ): void {
    const message: ConversationMessage = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      role: 'assistant',
      content,
      type,
      hasMedia: type !== 'text',
      mediaType: type,
      metadata,
    };
    conversationHistory.value.push(message);
  }

  /**
   * Add system message to conversation
   */
  function addSystemMessage(
    content: string,
    type: 'text' | 'audio' | 'video' | 'image' = 'text',
    metadata?: Record<string, any>
  ): void {
    const message: ConversationMessage = {
      id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      role: 'system',
      content,
      type,
      hasMedia: type !== 'text',
      mediaType: type,
      metadata,
    };
    conversationHistory.value.push(message);
  }

  /**
   * Clear conversation history
   */
  function clearConversation(): void {
    conversationHistory.value = [];
    service.clearHistory();
    toast.info('Conversation cleared');
  }

  /**
   * Get streaming states
   */
  function getStreamingState() {
    return service.getStreamingState();
  }

  /**
   * Check if service is ready for multimedia
   */
  function isMultimediaReady(): boolean {
    return isInitialized.value && state.isConnected;
  }

  /**
   * Cleanup on component unmount
   */
  async function cleanup(): Promise<void> {
    try {
      await service.cleanup();
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }

  // Cleanup when component unmounts
  onUnmounted(cleanup);

  return {
    // State
    state,
    conversationHistory,
    currentTranscription,
    currentVideoAnalysis,
    isInitialized,

    // Methods
    initialize,
    startAudioStreaming,
    stopAudioStreaming,
    toggleAudioStreaming,
    startVideoStreaming,
    stopVideoStreaming,
    toggleVideoStreaming,
    captureScreenshot,
    sendMessage,
    addUserMessage,
    addAssistantMessage,
    addSystemMessage,
    clearConversation,
    getStreamingState,
    isMultimediaReady,
    cleanup,
  };
}