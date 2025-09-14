
import {
  MultimodalLiveClient,
  LiveConfig,
  ServerContent,
  ToolCall,
  ClientContentMessage,
} from "./multimodal-live-client";
import { AudioStreamer } from "./audio-streamer";
import { audioContext } from "./utils";
import { logger } from "@/shared/utils/logger";

export interface MultimodalConnectionOptions {
  url?: string;
  apiKey: string;
}

export interface MultimodalCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onAudio?: (_data: ArrayBuffer) => void;
  onContent?: (_content: ServerContent) => void;
  onToolCall?: (_toolCall: ToolCall) => void;
  onError?: (_error: Error) => void;
}

export class MultimodalLiveService {
  private static instance: MultimodalLiveService;

  private client: MultimodalLiveClient | null = null;
  private audioStreamer: AudioStreamer | null = null;
  private isConnected = false;
  private isStreaming = false;
  private currentConfig: LiveConfig;
  private apiKey: string = "";
  private callbacks: MultimodalCallbacks = {};

  private constructor() {
    this.currentConfig = {
      generationConfig: {
        responseModalities: ["TEXT", "AUDIO"],
      },
    };
  }

  static getInstance(): MultimodalLiveService {
    if (!MultimodalLiveService.instance) {
      MultimodalLiveService.instance = new MultimodalLiveService();
    }
    return MultimodalLiveService.instance;
  }

  async initialize(options: MultimodalConnectionOptions): Promise<void> {
    try {
      this.apiKey = options.apiKey;
      this.client = new MultimodalLiveClient({
        url: options.url,
        apiKey: options.apiKey,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Defer audio streamer initialization until playback or streaming starts

      logger.info("Multimodal Live Service initialized successfully");
    } catch (_error) {
      logger.error("Failed to initialize Multimodal Live Service:", error);
      throw error;
    }
  }

  private async initializeAudioStreamer(): Promise<void> {
    try {
      if (!this.audioStreamer) {
        const audioCtx = await audioContext({ id: "multimodal-audio-out" });
        this.audioStreamer = new AudioStreamer(audioCtx);
      }
    } catch (_error) {
      logger.error("Failed to initialize audio streamer:", error);
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    // Connection events
    this.client.on("open", () => {
      this.isConnected = true;
      logger.info("Multimodal Live API connected");
      this.callbacks.onConnected?.();
    });

    this.client.on("close", (_event: any) => {
      this.isConnected = false;
      this.isStreaming = false;
      logger.info("Multimodal Live API disconnected");
      this.callbacks.onDisconnected?.();
    });

    // Audio events
    this.client.on("audio", (data: ArrayBuffer) => {
      if (this.audioStreamer && this.isStreaming) {
      }
      this.callbacks.onAudio?.(_data);
    });

    // Content events
    this.client.on("content", (content: ServerContent) => {
      // Type guard to check if content has modelTurn
      if (
        "modelTurn" in content &&
        content.modelTurn?.parts.some((part: any) => part.text)
      ) {
        this.client?.emit("textcontent", content);
      }
      this.callbacks.onContent?.(content);
    });

    // Tool events
    this.client.on("toolcall", (toolCall: ToolCall) => {
      this.callbacks.onToolCall?.(toolCall);
    });

    // Error events
    this.client.on("log", (log) => {
      if (log.type.includes("error")) {
        const _error = new Error(log.message);
        logger.error("Multimodal client error:", error);
        this.callbacks.onError?.(_error);
      }
    });
  }

  async connect(config?: Partial<LiveConfig>): Promise<void> {
    if (!this.client) {
      throw new Error(
        "Multimodal Live Service not initialized. Call initialize() first.",
      );
    }

    if (this.isConnected) {
      logger.warn("Already connected to Multimodal Live API");
      return;
    }

    try {
      // Update config if provided
      if (_config) {
        this.currentConfig = { ...this.currentConfig, ...config };
      }

      await this.client.connect(this.currentConfig);
      this.isConnected = true;
      logger.info("Connected to Multimodal Live API");
    } catch (_error) {
      logger.error("Failed to connect to Multimodal Live API:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.disconnect();
      this.isConnected = false;
      this.isStreaming = false;
      logger.info("Disconnected from Multimodal Live API");
    } catch (_error) {
      logger.error("Error disconnecting from Multimodal Live API:", error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error("Not connected to Multimodal Live API");
    }

    try {
      const clientContentMessage: ClientContentMessage = {
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          turnComplete: true,
        },
      };

      this.client.send(clientContentMessage);
      logger.debug("Message sent to Multimodal Live API:", message);
    } catch (_error) {
      logger.error("Failed to send message:", error);
      throw error;
    }
  }

  async sendAudioStream(audioStream: MediaStream): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error("Not connected to Multimodal Live API");
    }

    try {
      // Set up audio processing from the stream
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(audioStream);

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;

        }

        );

        this.client?.sendRealtimeInput([
          {
            mimeType: "audio/pcm",
          },
        ]);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      this.isStreaming = true;
      logger.info("Audio stream connected to Multimodal Live API");
    } catch (_error) {
      logger.error("Failed to send audio stream:", error);
      throw error;
    }
  }

  async startStream(): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error("Not connected to Multimodal Live API");
    }

    try {
      // Lazily initialize audio streamer on first start
      if (!this.audioStreamer) {
        await this.initializeAudioStreamer();
      }
      if (this.audioStreamer && !this.audioStreamer.isActive()) {
        await this.audioStreamer.start();
      }
      this.isStreaming = true;
      logger.info("Audio streaming started");
    } catch (_error) {
      logger.error("Failed to start audio stream:", error);
      throw error;
    }
  }

  stopStream(): void {
    this.isStreaming = false;
    if (this.audioStreamer && this.audioStreamer.isActive()) {
      this.audioStreamer.stop();
    }
    logger.info("Audio streaming stopped");
  }

  updateConfig(config: Partial<LiveConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
    logger.debug("Multimodal Live configuration updated:", config);
  }

  setCallbacks(callbacks: MultimodalCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  getStatus(): {
    isConnected: boolean;
    isStreaming: boolean;
    apiKey: string | null;
    config: LiveConfig;
  } {
    return {
      isConnected: this.isConnected,
      isStreaming: this.isStreaming,
      apiKey: this.apiKey || null,
      config: this.currentConfig,
    };
  }

  async cleanup(): Promise<void> {
    try {
      await this.disconnect();
      this.audioStreamer?.stop();
      this.audioStreamer = null;
      this.client = null;
      this.callbacks = {};
      logger.info("Multimodal Live Service cleaned up");
    } catch (_error) {
      logger.error("Error during Multimodal Live Service cleanup:", error);
    }
  }

  async sendImage(imageData: string, prompt?: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error("Not connected to Multimodal Live API");
    }

    try {
      const message = {
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [
                { text: prompt || "Analyze this image" },
                {
                  inlineData: {
                    data: imageData,
                    mimeType: "image/jpeg",
                  },
                },
              ],
            },
          ],
          turnComplete: true,
        },
      };

      this.client.send(message);
      logger.debug("Image sent to Multimodal Live API");
    } catch (_error) {
      logger.error("Failed to send image:", error);
      throw error;
    }
  }

  async handlePushToTalk(action: "start" | "stop"): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error("Not connected to Multimodal Live API");
    }

    try {
      if (action === "start") {
        // Start capturing audio
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        await this.sendAudioStream(stream);
        logger.info("Push-to-talk started");
      } else {
        // Stop capturing audio
        this.stopStream();
        logger.info("Push-to-talk stopped");
      }
    } catch (_error) {
      logger.error("Push-to-talk error:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    details: {
      connected: boolean;
      streaming: boolean;
      lastResponse?: Date;
      error?: string;
    };
  }> {
    try {
      if (!this.isConnected) {
        return {
          status: "unhealthy",
          details: {
            connected: false,
            streaming: false,
            error: "Not connected to Multimodal Live API",
          },
        };
      }

      // Send a simple test message
      await this.sendMessage("Health check");

      return {
        status: "healthy",
        details: {
          connected: this.isConnected,
          streaming: this.isStreaming,
          lastResponse: new Date(),
        },
      };
    } catch (_error) {
      logger.error("Health check failed:", error);
      return {
        status: "degraded",
        details: {
          connected: this.isConnected,
          streaming: this.isStreaming,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }


    while (attempts < maxAttempts) {
      try {

        await this.disconnect();
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.connect();

        logger.info("Reconnected successfully");
        return;
      } catch (_error) {
        attempts++;

        if (attempts >= maxAttempts) {
          logger.error("Max reconnection attempts reached");
          throw new Error(`Failed to reconnect after ${maxAttempts} attempts`);
        }

        logger.warn(
          `Reconnection attempt ${attempts} failed, retrying in ${delay}ms`,
        );
      }
    }
  }
}

export default MultimodalLiveService;
