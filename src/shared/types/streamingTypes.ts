
export interface VideoSettings {
  enabled: boolean;
  selectedCameraId: string;
  frameRate: number;
  autoStart: boolean;
  showPreview: boolean;
}

export interface ScreenSettings {
  enabled: boolean;
  shareAudio: boolean;
  frameRate: number;
  cursor: "show" | "hide" | "motion";
}

export interface AIStreamingSettings {
  enabled: boolean;
  model: string;
  fps: number;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  analysisType: "continuous" | "on-demand" | "interval";
  analysisInterval: number; // seconds for interval mode
  saveResponses: boolean;
}

export interface StreamingSettings {
  video: VideoSettings;
  screen: ScreenSettings;
  aiStreaming: AIStreamingSettings;
}

// Default streaming settings
export const DEFAULT_STREAMING_SETTINGS: StreamingSettings = {
  video: {
    enabled: false,
    selectedCameraId: "",
    autoStart: false,
    showPreview: true,
  },
  screen: {
    enabled: false,
    shareAudio: false,
    cursor: "show",
  },
  aiStreaming: {
    enabled: false,
    systemPrompt:
      "You are a helpful AI assistant analyzing live video feed. Describe what you see and provide relevant insights.",
    analysisType: "continuous",
    saveResponses: true,
  },
};

// Video device interface
export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: string;
}

// Streaming status interface
export interface StreamingStatus {
  isCameraActive: boolean;
  isScreenActive: boolean;
  isAIStreaming: boolean;
  currentModel?: string;
  fps?: number;
  error?: string;
}

// AI response interface
export interface AIStreamingResponse {
  timestamp: string;
  type: "video" | "screen";
  response: string;
  confidence?: number;
  model: string;
}
