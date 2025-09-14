
import {
  ref,
  readonly,
  reactive,
  computed,
  onUnmounted,
  getCurrentInstance,
} from "vue";
import { logger } from "@/shared/utils/logger";
import LiveMultimediaAIService, {
  type MultimediaAIConfig,
  type MediaAnalysisResult,
} from "@/shared/services/LiveMultimediaAIService";
import { audioService } from "@/shared/services/AudioService";

// Local replicas to keep component imports stable while unifying backend
export type RealTimeMessage = {
  id: string;
  timestamp: Date;
  role: "user" | "assistant" | "system";
  content: string;
  type: "text" | "audio" | "video" | "screen";
  audioData?: ArrayBuffer;
  imageData?: string;
  duration?: number;
};

export type RealTimeConfig = {
  model?: string;
  enableAudioInput?: boolean;
  enableAudioOutput?: boolean;
  enableVideo?: boolean;
  enableScreen?: boolean;
  conversationMemory?: number;
  pushToTalk?: boolean;
  voiceActivation?: {
    enabled: boolean;
    threshold: number;
    silenceTimeout: number;
  };
};

export type MultiTurnSession = {
  id: string;
  type: "audio" | "video" | "screen" | "multimodal";
  isActive: boolean;
  startTime: Date;
  messageCount: number;
  lastActivity: Date;
};

  // Reactive state
  const isInitialized = ref(false);
  const isSessionActive = ref(false);
  const currentSession = ref<MultiTurnSession | null>(null);
  const messages = ref<RealTimeMessage[]>([]);
  const isListening = ref(false);
  const isProcessing = ref(false);
  const transcription = ref("");
  const _error = ref<string | null>(null);

  // Session stats
  const sessionStats = reactive({
    lastActivity: null as Date | null,
  });

  // Computed properties
  const canStartSession = computed(
    () => isInitialized.value && !isSessionActive.value,
  );

  const sessionDurationFormatted = computed(() => {
    return '0:00'; // Placeholder implementation
  });

  // Session duration timer
  let durationTimer: number | null = null;

  const initialize = async (
    apiKey: string,
    initialConfig: Partial<RealTimeConfig> = {},
  ) => {
    try {
      const mergedConfig = { ...config, ...initialConfig };
      const service = LiveMultimediaAIService.getInstance();

      // Wire callbacks once
      service.setCallbacks({
        onConnectionChange: (connected) => {
          // noop: we keep only local flags from streaming state
          if (!connected) {
            isSessionActive.value = false;
          }
        },
        onAudioTranscription: (text, isFinal) => {
          transcription.value = text;
          if (isFinal && text.trim()) {
            // add user message from voice
            const msg: RealTimeMessage = {
              id: `user-${Date.now()}`,
              timestamp: new Date(),
              role: "user",
              content: text,
              type: "audio",
            };
            messages.value.push(msg);
          }
        },
        onResponse: (res: MediaAnalysisResult) => {
          const msg: RealTimeMessage = {
            id: res.id,
            timestamp: res.timestamp,
            role: "assistant",
            content: res.content,
            type: (res.type as any) || "text",
          };
          messages.value.push(msg);
          sessionStats.messageCount++;
          sessionStats.lastActivity = res.timestamp;
        },
        onError: (_e) => {
          const em = e instanceof Error ? e.message : String(_e);
          error.value = em;
          logger.error("Live multimedia error:", e);
        },
      });

      const mmConfig: MultimediaAIConfig = {
        apiKey,
        enableAudio: mergedConfig.enableAudioInput !== false,
        enableVideo: !!mergedConfig.enableVideo,
        enableScreenshot: true,
      };
      await service.initialize(mmConfig);
      isInitialized.value = true;
      error.value = null;
      logger.info("Real-time chat initialized (LiveMultimedia backend)");
    } catch (_err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize";
      error.value = errorMessage;
      logger.error("Failed to initialize real-time chat:", err);
      throw err;
    }
  }

    if (!isInitialized.value) {
      throw new Error("Service not initialized");
    }

    try {
      isProcessing.value = true;
      const service = LiveMultimediaAIService.getInstance();

      // Create synthetic session
      const session: MultiTurnSession = {
        id: `session-${Date.now()}`,
        type,
        isActive: true,
        startTime: new Date(),
        lastActivity: new Date(),
      };

      // Start streams based on type
      if (type === "audio" || type === "multimodal") {
        await service.startAudioStreaming();
        isListening.value = true;
        // Start mic level monitoring for volume meter
        try {
          const pref = audioService.getPreferredDevices?.();
          const inputId = (pref && pref.input) || undefined;
          await audioService.startMonitoring(
            typeof inputId === "string" ? inputId : undefined,
            (lvl) => {
              volumeLevel.value = lvl;
            },
          );
        } catch {
        }
      }
      if (type === "video" || type === "multimodal") {
        await service.startVideoStreaming();
      }

      currentSession.value = session;
      isSessionActive.value = true;
      startDurationTimer();
      error.value = null;
      logger.info("Session started:", session.id);
    } catch (_err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start session";
      error.value = errorMessage;
      logger.error("Failed to start session:", err);
      throw err;
    } finally {
      isProcessing.value = false;
    }
  }

    if (!isSessionActive.value) return;

    try {
      isProcessing.value = true;
      const service = LiveMultimediaAIService.getInstance();
      service.stopAudioStreaming();
      service.stopVideoStreaming();
      try {
        audioService.stopMonitoring();
      } catch {}
      isSessionActive.value = false;
      isListening.value = false;
      currentSession.value = null;

      if (durationTimer) {
        clearInterval(durationTimer);
        durationTimer = null;
      }
      logger.info("Session stopped");
    } catch (_err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop session";
      error.value = errorMessage;
      logger.error("Failed to stop session:", err);
    } finally {
      isProcessing.value = false;
    }
  }

    if (!isSessionActive.value || !text.trim()) return;

    try {
      isProcessing.value = true;
      const service = LiveMultimediaAIService.getInstance();
      // push user message immediately
      const userMsg: RealTimeMessage = {
        id: `user-${Date.now()}`,
        timestamp: new Date(),
        role: "user",
        content: text.trim(),
        type: "text",
      };
      messages.value.push(userMsg);
      const res = await service.sendMessage(text.trim());
      // assistant response is added via callback; ensure stats update if needed
      sessionStats.lastActivity = res.timestamp;
    } catch (_err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      error.value = errorMessage;
      logger.error("Failed to send message:", err);
    } finally {
      isProcessing.value = false;
    }
  }

    messages.value = [];
  }

    // No-op passthrough for now; LiveMultimedia service uses initialize-time config
    Object.assign({}, newConfig);
  }

    // Return local config mirror (best effort)
    return { ...config } as any;
  }

  // Event handlers
    messages.value.push(message);
    sessionStats.messageCount++;
    sessionStats.lastActivity = message.timestamp;
  }

  }

  }
  }

    error.value = err.message;
    logger.error("Real-time chat error:", err);
  }

    volumeLevel.value = level;
  }

    if (durationTimer) clearInterval(durationTimer);

    durationTimer = window.setInterval(() => {
      if (isSessionActive.value && currentSession.value) {
        sessionStats.sessionDuration = Math.floor(
        );
      }
  }

  // Cleanup on unmount - only register if we're in a component instance
  const instance = getCurrentInstance();
  if (instance) {
    onUnmounted(() => {
      if (isSessionActive.value) {
        stopSession();
      }
      if (durationTimer) {
        clearInterval(durationTimer);
      }
    });
  }

  return {
    // State
    isInitialized: readonly(isInitialized),
    isSessionActive: readonly(isSessionActive),
    currentSession: readonly(currentSession),
    messages: readonly(messages),
    isListening: readonly(isListening),
    isProcessing: readonly(isProcessing),
    volumeLevel: readonly(volumeLevel),
    transcription: readonly(transcription),
    error: readonly(_error),
    sessionStats: readonly(sessionStats),

    // Computed
    canStartSession,
    sessionDurationFormatted,

    // Methods
    initialize,
    startSession,
    stopSession,
    sendMessage,
    clearMessages,
    updateConfig,
    getConfig,
  };
}

  const isAudioSupported = computed(
    () =>
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices,
  );

  const isVideoSupported = computed(
    () =>
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices,
  );

  const isScreenShareSupported = computed(
    () =>
      "mediaDevices" in navigator &&
      "getDisplayMedia" in navigator.mediaDevices,
  );

  const isSpeechRecognitionSupported = computed(
    () => "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
  );

  const isSpeechSynthesisSupported = computed(
    () => "speechSynthesis" in window,
  );

  const allFeaturesSupported = computed(
    () =>
      isAudioSupported.value &&
      isVideoSupported.value &&
      isScreenShareSupported.value &&
      isSpeechRecognitionSupported.value &&
      isSpeechSynthesisSupported.value,
  );

  return {
    isAudioSupported,
    isVideoSupported,
    isScreenShareSupported,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    allFeaturesSupported,
  };
}
