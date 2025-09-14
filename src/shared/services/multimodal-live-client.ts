// Based on Google's Multimodal Live API Client
import { Content, GenerativeContentBlob, Part } from "@google/generative-ai";
import { EventEmitter } from "eventemitter3";

// --- Type Definitions ---
export type StreamingLog = {
  date: Date;
  type: string;
  message: any;
  count?: number;
};

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
  };
  tools?: any[];
}

export interface MultimodalLiveAPIClientConnection {
  url?: string;
  apiKey: string;
}

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

export type RealtimeInputMessage = {
  realtimeInput: {
    mediaChunks: {
      mimeType: string;
      data: string;
    }[];
  };
};

export type ToolResponseMessage = {
  toolResponse: any;
};

export type LiveOutgoingMessage =
    | SetupMessage
    | ClientContentMessage
    | RealtimeInputMessage
    | ToolResponseMessage;

export type LiveIncomingMessage =
    | ServerContentMessage
    | ToolCallMessage
    | ToolCallCancellationMessage
    | SetupCompleteMessage;

export type ServerContent = Interrupted | TurnComplete | ModelTurn;

export interface Interrupted {
  interrupted: {};
}

export interface TurnComplete {
  turnComplete: {};
}

export interface ModelTurn{
  modelTurn: {
    parts: Part[]
  }
}

export interface ServerContentMessage {
  serverContent: ServerContent;
}

export interface ToolCallMessage {
  toolCall: ToolCall;
}

export interface ToolCallCancellationMessage{
  toolCallCancellation: ToolCallCancellation;
}

export interface ToolCall {
  functionCalls: FunctionCall[];
}

export type FunctionCall = {
  id: string;
  name: string;
  args: string;
}

export interface ToolCallCancellation{
  ids: string[]
}

// Type Guards
export function isSetupCompleteMessage(msg: any): msg is SetupCompleteMessage {
  return typeof msg === 'object' && msg !== null && typeof msg.setupComplete === 'object' && msg.setupComplete !== null;
}

export function isServerContentMessage(msg: any): msg is ServerContentMessage {
  return typeof msg === 'object' && msg !== null && typeof msg.serverContent === 'object' && msg.serverContent !==null;
}

export function isClientContentMessage(msg: any): msg is ClientContentMessage {
  return typeof msg === 'object' && msg !== null && typeof msg.clientContent === 'object' && msg.clientContent !== null;
}

export function isToolResponseMessage(msg: any): msg is ToolResponseMessage {
  return typeof msg === 'object' && msg !== null && typeof msg.toolResponse === 'object' && msg.toolResponse !== null;
}

export function isToolCallMessage(msg: any): msg is ToolCallMessage {
  return typeof msg === 'object' && msg !== null && typeof msg.toolCall === 'object' && msg.toolCall !== null;
}

export function isToolCallCancellationMessage(msg: any): msg is ToolCallCancellationMessage {
  return typeof msg === 'object' && msg !== null && typeof msg.toolCallCancellation === 'object' && msg.toolCallCancellation !==null;
}

export function isInterrupted(content: ServerContent): content is Interrupted {
  return typeof content === 'object' && content !== null && typeof (content as any).interrupted === 'object' && (content as any).interrupted !== null;
}

export function isTurnComplete(content: ServerContent): content is TurnComplete {
  return typeof content === 'object' && content !== null &&  typeof (content as any).turnComplete === 'object'  && (content as any).turnComplete !== null;
}

export function isModelTurn(content: ServerContent): content is ModelTurn {
  return typeof content === 'object' && content !== null && typeof (content as any).modelTurn === 'object' && (content as any).modelTurn !== null;
}

// Event Types
interface MultimodalLiveClientEventTypes {
  open: () => void;
  log: (_log: StreamingLog) => void;
  close: (_event: Event) => void;
  audio: (_data: ArrayBuffer) => void;
  content: (_data: ServerContent) => void;
  textcontent: (_data: ServerContent) => void;
  interrupted: () => void;
  setupcomplete: () => void;
  turncomplete: () => void;
  toolcall: (_toolCall: ToolCall) => void;
  toolcallcancellation: (_toolcallCancellation: ToolCallCancellation) => void;
}

export class MultimodalLiveClient extends EventEmitter<MultimodalLiveClientEventTypes> {
  public ws: WebSocket | null = null;
  protected config: LiveConfig | null = null;
  public url: string = "";

  public getConfig() {
    return { ...this.config };
  }

  constructor({ url, apiKey }: MultimodalLiveAPIClientConnection) {
    super();
    url =
        url ||
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
    url += `?key=${apiKey}`;
    this.url = url;
  }

  // Unified log method
  log(log: StreamingLog) {
    this.emit("log", log);
  }

  async connect(config: LiveConfig): Promise<boolean> {
    // Ensure generationConfig and responseModalities are set correctly
    if (!config.generationConfig) {
      config.generationConfig = {};
    }
    if (!config.generationConfig.responseModalities) {
      config.generationConfig.responseModalities = ["TEXT", "AUDIO"];
    } else if (!Array.isArray(config.generationConfig.responseModalities)) {
      config.generationConfig.responseModalities = [config.generationConfig.responseModalities];
    }

    this.config = config;
    const ws = new WebSocket(this.url);
    this.ws = ws;

    return new Promise((resolve, reject) => {
      const onError = (_ev: Event) => {
        this.disconnect();
        const message = `Could not connect to "${this.url}"`;
        this.log({type: `server.error`, message, date: new Date()});
        reject(new Error(message));
      };
      ws.addEventListener("error", onError);

      ws.addEventListener("open", () => {
        if (!this.config) {
          reject(new Error("Invalid config sent to `connect(_config)`"));
          return;
        }
        this.log({type: `client.open`, message: `connected to socket`, date: new Date()});
        this.emit("open");

        const setupMessage: SetupMessage = {
          setup: this.config,
        };
        this._sendDirect(setupMessage);
        this.log({type: "client.send", message: "setup", date: new Date()});

        ws.removeEventListener("error", onError);

        ws.addEventListener("message", (ev: any) => {
          const processMessage = async () => {
            try {
              const raw = ev?.data ?? ev;
              let message: any = null;
              if (typeof raw === 'string') {
                message = JSON.parse(raw);
              } else if (raw instanceof Blob) {
                const text = await raw.text();
                message = JSON.parse(text);
              } else if (raw instanceof ArrayBuffer) {
                const text = new TextDecoder().decode(new Uint8Array(raw));
                message = JSON.parse(text);
              } else if (typeof raw === 'object') {
                // Some environments may already deliver parsed objects
                message = raw;
              }
              this.log({type: "server.message", message: message, date: new Date()});
            
            // Handle different message types
            if (isSetupCompleteMessage(message)) {
              this.emit("setupcomplete");
            } else if (isServerContentMessage(message)) {
              const serverContent = message.serverContent;
              this.emit("content", serverContent);
              
              if (isInterrupted(serverContent)) {
                this.emit("interrupted");
              } else if (isTurnComplete(serverContent)) {
                this.emit("turncomplete");
              } else if (isModelTurn(serverContent)) {
                // Check for audio data in model turn
                for (const part of serverContent.modelTurn.parts) {
                  if (part.inlineData && part.inlineData.mimeType === 'audio/pcm') {
                    // Convert base64 audio data to ArrayBuffer
                    const binaryString = atob(part.inlineData.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    this.emit("audio", bytes.buffer);
                  }
                }
              }
              } else if (isToolCallMessage(message)) {
                this.emit("toolcall", message.toolCall);
              } else if (isToolCallCancellationMessage(message)) {
                this.emit("toolcallcancellation", message.toolCallCancellation);
              }
            } catch (error) {
              this.log({type: "server.error", message: `Failed to parse message: ${error}`, date: new Date()});
            }
          };
          // Fire and forget; errors are logged internally
          processMessage();
        });

        ws.addEventListener("close", (ev: any) => {
          this.disconnect();
          let reason = ev.reason || "No reason provided";
          this.log({type: `server.close`, message: `disconnected ${reason ? `with reason: ${reason}` : ``}`,date: new Date()});
          this.emit("close", ev);
        });
        resolve(true);
      });
    });
  }

  disconnect(ws?: WebSocket) {
    if ((!ws || this.ws === ws) && this.ws) {
      this.ws.close();
      this.ws = null;
      this.log({type: "client.close", message: `Disconnected`, date: new Date()});
      return true;
    }
    return false;
  }

  sendRealtimeInput(chunks: GenerativeContentBlob[]) {
    const data: RealtimeInputMessage = {
      realtimeInput: {
        mediaChunks: chunks
      }
    };
    this._sendDirect(data);
    this.log({type: `client.realtimeInput`, message: `media chunks: ${chunks.length}`, date: new Date()});
  }

  send(clientContentMessage: ClientContentMessage) {
    this._sendDirect(clientContentMessage);
    this.log({type: `client.send`, message: clientContentMessage, date: new Date()});
  }

  _sendDirect(request: object) {
    if (!this.ws) {
      throw new Error("WebSocket is not connected");
    }
    const str = JSON.stringify(request);
    this.ws.send(str);
  }
}
