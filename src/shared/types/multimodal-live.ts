
import { Content, GenerativeContentBlob, Part } from "@google/generative-ai";

// Core streaming log entry
export interface StreamingLog {
  date: Date;
  type: string;
  message: any;
  count?: number;
}

// Voice configuration for speech synthesis
export interface VoiceConfig {
  prebuiltVoiceConfig?: {
    voiceName?: string;
  };
}

export interface SpeechConfig {
  voiceConfig?: VoiceConfig;
}

// Main configuration for multimodal live sessions
export interface LiveConfig {
  model: string;
  systemInstruction?: Content;
  generationConfig?: {
    temperature?: number | null;
    topP?: number | null;
    topK?: number | null;
    candidateCount?: number | null;
    maxOutputTokens?: number | null;
    stopSequences?: string[] | null;
    responseModalities?: ("TEXT" | "AUDIO")[];
    speechConfig?: SpeechConfig;
  };
  tools?: any[];
}

// WebSocket message types - Outgoing
export interface SetupMessage {
  setup: LiveConfig;
}

export interface SetupCompleteMessage {
  setupComplete: {};
}

export interface BidiGenerateContentClientContent {
  clientContent: {
    turns: Content[];
    turnComplete?: boolean;
  };
}

export type ClientContentMessage = BidiGenerateContentClientContent;

export interface RealtimeInputMessage {
  realtimeInput: {
    mediaChunks: {
      mimeType: string;
    }[];
  };
}

export interface ToolResponseMessage {
  toolResponse: any;
}

export type LiveOutgoingMessage =
  | SetupMessage
  | ClientContentMessage
  | RealtimeInputMessage
  | ToolResponseMessage;

// WebSocket message types - Incoming
export interface ServerContentMessage {
  serverContent: ServerContent;
}

export interface ToolCallMessage {
  toolCall: {
      name: string;
      id: string;
      args: any;
    }>;
  };
}

export interface ToolCallCancellationMessage {
  toolCallCancellation: {
    ids: string[];
  };
}

export type LiveIncomingMessage =
  | ServerContentMessage
  | ToolCallMessage
  | ToolCallCancellationMessage
  | SetupCompleteMessage;

// Server content types
export interface Interrupted {
  interrupted: {};
}

export interface TurnComplete {
  turnComplete: {};
}

export interface ModelTurn {
  modelTurn: {
    parts: Part[];
  };
}

export type ServerContent = Interrupted | TurnComplete | ModelTurn;

// Audio processing types
export interface AudioProcessingConfig {
  sampleRate: number;
  bufferSize: number;
  channels: number;
  mimeType: string;
}

export interface AudioStreamConfig {
  sampleRate: number;
  bufferSize: number;
  initialBufferTime: number;
  maxQueueSize: number;
}

// Event types for the multimodal client
export interface MultimodalClientEvents {
  open: () => void;
  close: (code: number, reason: string) => void;
  content: (content: ServerContent) => void;
  toolcall: (toolCall: ToolCallMessage["toolCall"]) => void;
  toolcallcancellation: (
    cancellation: ToolCallCancellationMessage["toolCallCancellation"],
  ) => void;
  interrupted: () => void;
  setupcomplete: () => void;
  turncomplete: () => void;
  log: (log: StreamingLog) => void;
  error: (error: Error) => void;
  // Additional events used by the service
  volume: (volume: number) => void;
  connected: () => void;
  disconnect: () => void;
  textContent: (content: ServerContent) => void;
  volumechange: (volume: number) => void;
}

// Client configuration for Vue composable
export interface MultimodalClientConfig {
  apiKey: string;
  baseUrl?: string;
  debug?: boolean;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  audioConfig?: AudioProcessingConfig;
  streamConfig?: AudioStreamConfig;
}
