/**
 * Streaming Settings Types
 * Defines types for video and screen streaming configuration
 */

export interface VideoSettings {
  enabled: boolean;
  selectedCameraId: string;
  resolution: '720p' | '1080p' | '4k';
  frameRate: number;
  autoStart: boolean;
  showPreview: boolean;
}

export interface ScreenSettings {
  enabled: boolean;
  shareAudio: boolean;
  resolution: '720p' | '1080p' | '4k';
  frameRate: number;
  cursor: 'show' | 'hide' | 'motion';
}

export interface AIStreamingSettings {
  enabled: boolean;
  model: string;
  fps: number;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  analysisType: 'continuous' | 'on-demand' | 'interval';
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
    selectedCameraId: '',
    resolution: '720p',
    frameRate: 30,
    autoStart: false,
    showPreview: true,
  },
  screen: {
    enabled: false,
    shareAudio: false,
    resolution: '1080p',
    frameRate: 10,
    cursor: 'show',
  },
  aiStreaming: {
    enabled: false,
    model: 'gemini-1.5-flash',
    fps: 5,
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI assistant analyzing live video feed. Describe what you see and provide relevant insights.',
    analysisType: 'continuous',
    analysisInterval: 10,
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
  type: 'video' | 'screen';
  response: string;
  confidence?: number;
  model: string;
}