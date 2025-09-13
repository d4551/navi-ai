import { logger } from "@/shared/utils/logger";

export interface MultimediaAIConfig {
  apiKey: string;
  model?: string;
  enableAudio: boolean;
  enableVideo: boolean;
  enableScreenshot: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface MediaAnalysisResult {
  id: string;
  timestamp: Date;
  type: "audio" | "video" | "image" | "text";
  content: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export class LiveMultimediaAIService {
  private static instance: LiveMultimediaAIService;
  private config: MultimediaAIConfig | null = null;
  private isAudioStreaming = false;
  private isVideoStreaming = false;

  static getInstance(): LiveMultimediaAIService {
    if (!this.instance) this.instance = new LiveMultimediaAIService();
    return this.instance;
  }

  async initialize(config: MultimediaAIConfig): Promise<void> {
    if (!config?.apiKey || typeof config.apiKey !== "string" || !config.apiKey.length) {
      throw new Error("API key is required");
    }
    this.config = config;
  }

  getStreamingState() {
    return { isAudioStreaming: this.isAudioStreaming, isVideoStreaming: this.isVideoStreaming };
  }

  async startAudioStreaming(): Promise<void> {
    if (!this.config?.enableAudio) throw new Error("Audio streaming not enabled");
    this.isAudioStreaming = true;
  }

  stopAudioStreaming(): void {
    this.isAudioStreaming = false;
  }
}

export default LiveMultimediaAIService;
