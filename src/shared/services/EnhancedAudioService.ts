
import { ref, computed } from "vue";
import { logger } from "@/shared/utils/logger";
import { audioService } from "./AudioService";

export interface AudioFeedback {
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
  duration?: number;
}

export interface VoiceActivity {
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
  confidence?: number;
  lastActivity: number;
}

class EnhancedAudioService {
  private static instance: EnhancedAudioService;

  // Reactive state for UI components
  public readonly feedback = ref<AudioFeedback[]>([]);
  public readonly activity = ref<VoiceActivity>({
    isListening: false,
    isSpeaking: false,
  });

  // Audio visualization
  private visualizationInterval: number | null = null;
  private speechTimeoutId: number | null = null;

  // Enhanced error recovery

  static getInstance(): EnhancedAudioService {
    if (!EnhancedAudioService.instance) {
      EnhancedAudioService.instance = new EnhancedAudioService();
    }
    return EnhancedAudioService.instance;
  }

  private constructor() {
    this.setupActivityMonitoring();
  }

  async startListening(
    options: {
      continuous?: boolean;
      interimResults?: boolean;
      timeout?: number;
      onResult?: (text: string, isFinal: boolean) => void;
      onError?: (error: string) => void;
    } = {},
  ): Promise<void> {
    try {
      // Check if we're in cooldown after recent error
      const now = Date.now();
      if (now - this.lastErrorTime < this.errorCooldown) {
        throw new Error("Please wait before trying again");
      }

      this.activity.value.isListening = true;
      this.activity.value.lastActivity = now;

      this.addFeedback({
        type: "info",
        message: "Listening...",
        timestamp: now,
      });

      // Use the existing audio service but add enhanced feedback
      await audioService.startRecording({
        deviceId: await this.getBestMicrophone(),
        echoCancellation: true,
        noiseSuppression: true,
      });

      // Setup automatic timeout if specified
      if (options.timeout) {
        this.speechTimeoutId = window.setTimeout(() => {
          this.stopListening("Listening timeout");
        }, options.timeout);
      }

    } catch (error) {
      this.handleAudioError(error as Error, "Failed to start listening");
      options.onError?.(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  async stopListening(reason?: string): Promise<void> {
    try {
      this.activity.value.isListening = false;

      if (this.speechTimeoutId) {
        clearTimeout(this.speechTimeoutId);
        this.speechTimeoutId = null;
      }

      await audioService.stopRecording();

      this.addFeedback({
        type: "success",
        message: reason || "Listening stopped",
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleAudioError(error as Error, "Failed to stop listening");
    }
  }

  async speak(
    text: string,
    options: {
      voice?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      priority?: "low" | "normal" | "high";
    } = {},
  ): Promise<void> {
    try {
      this.activity.value.isSpeaking = true;
      this.activity.value.lastActivity = Date.now();

      this.addFeedback({
        type: "info",
        message: "Speaking...",
        timestamp: Date.now(),
      });

      // Use enhanced voice selection
      const selectedVoice = await this.selectBestVoice(options.voice);

      // Enhanced TTS options
      const ttsOptions = {
        voice: selectedVoice,
        lang: "en-US",
      };

      await audioService.speak(text, ttsOptions);

      this.activity.value.isSpeaking = false;
      this.addFeedback({
        type: "success",
        message: "Speech completed",
        timestamp: Date.now(),
      });
    } catch (error) {
      this.activity.value.isSpeaking = false;
      this.handleAudioError(error as Error, "Failed to speak text");
    }
  }

  private async getBestMicrophone(): Promise<string | undefined> {
    try {
      const devices = await audioService.getAvailableDevices();
      const microphones = devices.filter((d) => d.kind === "audioinput");

      // Prefer USB or professional microphones
      const preferredMic = microphones.find(
        (mic) =>
          mic.label.toLowerCase().includes("usb") ||
          mic.label.toLowerCase().includes("yeti") ||
          mic.label.toLowerCase().includes("blue") ||
          mic.label.toLowerCase().includes("professional"),
      );

    } catch (error) {
      logger.warn("Could not get best microphone:", error);
      return undefined;
    }
  }

  private async selectBestVoice(
    preferredVoice?: string,
  ): Promise<string | undefined> {
    try {
      const voices = await audioService.getAvailableVoices();

      if (preferredVoice) {
        const exact = voices.find((v) => v.name === preferredVoice);
        if (exact) return exact.name;
      }

      // Prefer high-quality English voices
      const qualityVoices = voices.filter(
        (voice) =>
          voice.lang.startsWith("en") &&
          (voice.name.includes("Enhanced") ||
            voice.name.includes("Premium") ||
            voice.name.includes("Neural") ||
            voice.name.includes("Natural")),
      );

      return (
        voices.find((v) => v.lang.startsWith("en"))?.name
      );
    } catch (error) {
      logger.warn("Could not select best voice:", error);
      return undefined;
    }
  }

  private handleAudioError(error: Error, context: string): void {
    this.lastErrorTime = Date.now();

    let userMessage = context;

    // Provide specific guidance based on error type
    if (error.message.includes("permission")) {
      userMessage =
        "Microphone permission required. Please allow access and try again.";
    } else if (error.message.includes("NotFound")) {
      userMessage = "No microphone found. Please check your audio devices.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("connection")
    ) {
      userMessage =
        "Connection issue. Please check your internet and try again.";
    } else if (error.message.includes("timeout")) {
      userMessage = "Operation timed out. Please try again.";
    }

    this.addFeedback({
      type: "error",
      message: userMessage,
      timestamp: Date.now(),
    });

    logger.error(`${context}:`, error);

    // Implement retry logic for transient errors
    if (
      this.retryCount < this.maxRetries &&
      !error.message.includes("permission")
    ) {
      this.retryCount++;
      setTimeout(() => {
        this.addFeedback({
          type: "info",
          message: `Retrying... (${this.retryCount}/${this.maxRetries})`,
          timestamp: Date.now(),
        });
    }
  }

  private addFeedback(feedback: AudioFeedback): void {
    this.feedback.value.push(feedback);

    // Auto-remove feedback after duration
    setTimeout(() => {
      const index = this.feedback.value.indexOf(feedback);
      }
    }, duration);
  }

  private setupActivityMonitoring(): void {
    // Monitor volume levels for visual feedback
    this.visualizationInterval = window.setInterval(() => {
      if (this.activity.value.isListening) {
        // Get volume level from audio service
        audioService
          .getVolumeLevel()
          .then((volume) => {
            this.activity.value.volume = volume;
          })
          .catch(() => {
            // Fallback to simulated volume for demo
          });
      } else {
      }
  }

  dispose(): void {
    if (this.visualizationInterval) {
      clearInterval(this.visualizationInterval);
    }
    if (this.speechTimeoutId) {
      clearTimeout(this.speechTimeoutId);
    }
  }

  // Computed properties for UI components
  get isActive(): boolean {
    return this.activity.value.isListening || this.activity.value.isSpeaking;
  }

  get hasRecentActivity(): boolean {
  }

  get currentFeedback(): AudioFeedback | null {
  }
}

export const enhancedAudioService = EnhancedAudioService.getInstance();
