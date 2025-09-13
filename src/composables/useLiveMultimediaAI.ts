
import { ref, reactive, onUnmounted } from "vue";
import LiveMultimediaAIService, {
  type MultimediaAIConfig,
  type MediaAnalysisResult,
  type LiveCallbacks,
} from "@/shared/services/LiveMultimediaAIService";
import { useToast } from "@/composables/useToast";
import { logger } from "@/shared/utils/logger";

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
  role: "user" | "assistant" | "system";
  content: string;
  type: "text" | "audio" | "video" | "image";
  hasMedia: boolean;
  mediaType?: string;
  metadata?: Record<string, any>;
}

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
  const currentTranscription = ref("");
  const currentVideoAnalysis = ref("");
  const isInitialized = ref(false);

    try {
      state.isProcessing = true;
      state.lastError = null;

      // Set up callbacks
      const callbacks: LiveCallbacks = {
        onConnectionChange: (connected) => {
          state.isConnected = connected;
          if (connected) {
            addSystemMessage(
              "Multimodal AI services connected. Voice, video, and screenshot analysis ready!",
            );
          } else {
            addSystemMessage("Connection to AI services lost. Retrying...");
          }
        },

        onAudioTranscription: (text, isFinal) => {
          currentTranscription.value = text;
          if (isFinal && text.trim()) {
            addUserMessage(text, "audio");
            currentTranscription.value = "";
          }
        },

        onVideoAnalysis: (analysis) => {
          currentVideoAnalysis.value = analysis;
          // Only add significant video analysis to conversation
            addSystemMessage(`Video AI: ${analysis}`, "video");
          }
        },

        onScreenshotAnalysis: (analysis, screenshot) => {
          addAssistantMessage(analysis);
          toast.success("Screenshot analyzed successfully");
        },

        onResponse: (result: MediaAnalysisResult) => {
          addAssistantMessage(
            result.content,
            result.type as any,
            result.metadata,
          );
        },

        onError: (error) => {
          state.lastError = error.message;
          logger.error("Multimedia AI error:", error);
          toast.error(`AI Error: ${error.message}`);
        },
      };

      service.setCallbacks(callbacks);
      await service.initialize(config);

      isInitialized.value = true;
      state.isProcessing = false;
      return true;
    } catch (error) {
      state.lastError =
        error instanceof Error ? error.message : "Unknown error";
      state.isProcessing = false;
      logger.error("Failed to initialize multimedia AI:", error);
      toast.error("Failed to initialize AI services. Check your API key.");
      return false;
    }
  }

    if (!isInitialized.value) {
      toast.warning("AI services not initialized");
      return false;
    }

    try {
      await service.startAudioStreaming();
      state.isAudioStreaming = true;
      return true;
    } catch (error) {
      logger.error("Failed to start audio streaming:", error);
      toast.error("Failed to start voice input. Check microphone permissions.");
      return false;
    }
  }

    service.stopAudioStreaming();
    state.isAudioStreaming = false;
    addSystemMessage("Voice input stopped");
  }

    if (state.isAudioStreaming) {
      stopAudioStreaming();
      return true;
    } else {
      return await startAudioStreaming();
    }
  }

    width?: number;
    height?: number;
    frameRate?: number;
  }): Promise<boolean> {
    if (!isInitialized.value) {
      toast.warning("AI services not initialized");
      return false;
    }

    try {
      await service.startVideoStreaming(options);
      state.isVideoStreaming = true;
      return true;
    } catch (error) {
      logger.error("Failed to start video streaming:", error);
      toast.error("Failed to start camera. Check camera permissions.");
      return false;
    }
  }

    service.stopVideoStreaming();
    state.isVideoStreaming = false;
    currentVideoAnalysis.value = "";
    addSystemMessage("Video analysis stopped");
  }

    if (state.isVideoStreaming) {
      stopVideoStreaming();
    } else {
      await startVideoStreaming();
    }
  }

    prompt?: string,
  ): Promise<MediaAnalysisResult | null> {
    if (!isInitialized.value) {
      toast.warning("AI services not initialized");
      return null;
    }

    try {
      state.isProcessing = true;

      const result = await service.captureAndAnalyzeScreen(prompt);
      state.isProcessing = false;

      return result;
    } catch (error) {
      state.isProcessing = false;
      logger.error("Failed to capture screenshot:", error);
      toast.error(
        "Screenshot capture failed. Check screen sharing permissions.",
      );
      return null;
    }
  }

    if (!isInitialized.value) {
      toast.warning("AI services not initialized");
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
      logger.error("Failed to send message:", error);
      toast.error("Failed to send message to AI");
    }
  }

    content: string,
    type: "text" | "audio" | "video" | "image" = "text",
    metadata?: Record<string, any>,
  ): void {
    const message: ConversationMessage = {
      timestamp: new Date(),
      role: "user",
      content,
      type,
      hasMedia: type !== "text",
      mediaType: type,
      metadata,
    };
    conversationHistory.value.push(message);
  }

    content: string,
    type: "text" | "audio" | "video" | "image" = "text",
    metadata?: Record<string, any>,
  ): void {
    const message: ConversationMessage = {
      timestamp: new Date(),
      role: "assistant",
      content,
      type,
      hasMedia: type !== "text",
      mediaType: type,
      metadata,
    };
    conversationHistory.value.push(message);
  }

    content: string,
    type: "text" | "audio" | "video" | "image" = "text",
    metadata?: Record<string, any>,
  ): void {
    const message: ConversationMessage = {
      timestamp: new Date(),
      role: "system",
      content,
      type,
      hasMedia: type !== "text",
      mediaType: type,
      metadata,
    };
    conversationHistory.value.push(message);
  }

    conversationHistory.value = [];
    service.clearHistory();
    toast.info("Conversation cleared");
  }

    return service.getStreamingState();
  }

    return isInitialized.value && state.isConnected;
  }

    try {
      await service.cleanup();
    } catch (error) {
      logger.error("Cleanup error:", error);
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
