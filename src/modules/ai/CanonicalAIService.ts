import { GoogleGenerativeAI, HarmBlockThreshold } from "@google/generative-ai";
import { logger } from "@/shared/utils/logger";

export interface AIConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  azureEndpoint?: string;
  primaryProvider: "google" | "openai" | "azure";
  enableContextPersistence: boolean;
  enableRealTime: boolean;
  enableMultimodal: boolean;
  maxTokens: number;
  temperature: number;
  safetySettings?: any;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: Record<string, number>;
  model?: string;
  timestamp: Date;
}

export interface StreamingResponse {
  success: boolean;
  stream?: ReadableStream;
  error?: string;
}

export interface MultimodalInput {
  text?: string;
  images?: Array<{ data?: string; mimeType: string }>;
  audio?: { data?: string; mimeType: string };
}

export class CanonicalAIService {
  private config: AIConfig | null = null;
  private client: GoogleGenerativeAI | null = null;
  private conversationHistory = new Map<string, Array<{ role: string; content: string }>>();
  private ready = false;

  get isReady() {
    return this.ready;
  }

  get currentConfig() {
    if (!this.config) return null;
    const { geminiApiKey, ...rest } = this.config;
    return { ...rest, geminiApiKey: geminiApiKey ? "[REDACTED]" : undefined } as any;
  }

  async initialize(config: Partial<AIConfig>): Promise<void> {
    const defaults: AIConfig = {
      primaryProvider: "google",
      enableContextPersistence: true,
      enableRealTime: true,
      enableMultimodal: true,
      maxTokens: 8192,
      temperature: 0.7,
      safetySettings: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    } as any;
    this.config = { ...defaults, ...config } as AIConfig;

    if (this.config.primaryProvider === "google" && !this.config.geminiApiKey) {
      throw new Error("AI initialization failed: Missing API key");
    }
    try {
      if (this.config.geminiApiKey) {
        this.client = new GoogleGenerativeAI(this.config.geminiApiKey);
      }
      this.ready = true;
    } catch (e: any) {
      logger.error("AI initialization failed:", e);
      throw new Error(`AI initialization failed: ${e?.message || e}`);
    }
  }

  private buildPrompt(prompt: string, options: { systemPrompt?: string; conversationId?: string } = {}) {
    let p = options.systemPrompt ? `${options.systemPrompt}\n\nUser: ${prompt}` : prompt;
    if (options.conversationId && this.config?.enableContextPersistence) {
      const history = this.conversationHistory.get(options.conversationId) || [];
      const ctx = history.map((m) => `${m.role}: ${m.content}`).join("\n");
      p = `${ctx}\nUser: ${prompt}`;
    }
    return p;
  }

  async generateText(
    prompt: string,
    options: { systemPrompt?: string; conversationId?: string } = {},
  ): Promise<AIResponse> {
    if (!this.ready || !this.client) throw new Error("AI Service not initialized");
    try {
      const model = this.client.getGenerativeModel({});
      const fullPrompt = this.buildPrompt(prompt, options);
      const result: any = await model.generateContent(fullPrompt);
      const text: string = result?.response?.text?.() ?? "";

      if (options.conversationId && this.config?.enableContextPersistence) {
        const history = this.conversationHistory.get(options.conversationId) || [];
        history.push({ role: "user", content: prompt });
        history.push({ role: "assistant", content: text });
        this.conversationHistory.set(options.conversationId, history);
      }

      return { success: true, content: text, timestamp: new Date() };
    } catch (e: any) {
      logger.error("AI text generation failed:", e);
      return { success: false, error: e?.message || String(_e), timestamp: new Date() };
    }
  }

  async generateMultimodal(input: MultimodalInput): Promise<AIResponse> {
    if (!this.ready || !this.client) throw new Error("AI Service not initialized");
    try {
      const model = this.client.getGenerativeModel({});
      const parts: any[] = [];
      if (input.text) parts.push({ text: input.text });
      (input.images || []).forEach((img) => parts.push({ inlineData: { data: img.data || "", mimeType: img.mimeType } }));
      if (input.audio) parts.push({ inlineData: { data: input.audio.data || "", mimeType: input.audio.mimeType } });
      const result: any = await model.generateContent(parts);
      const text: string = result?.response?.text?.() ?? "";
      return { success: true, content: text, timestamp: new Date() };
    } catch (e: any) {
      logger.error("AI multimodal generation failed:", e);
      return { success: false, error: e?.message || String(_e), timestamp: new Date() };
    }
  }

  async generateStream(prompt: string): Promise<StreamingResponse> {
    if (!this.ready || !this.client) throw new Error("AI Service not initialized");
    try {
      const model = this.client.getGenerativeModel({});
      const result: any = await model.generateContentStream(prompt);
      const stream = new ReadableStream({
        start(controller) {
          (async () => {
            try {
              for await (const chunk of result.stream) {
                controller.enqueue(chunk.text());
              }
              controller.close();
            } catch (_err) {
              controller.error(err);
            }
          })();
        },
      });
      return { success: true, stream };
    } catch (e: any) {
      logger.error("AI streaming failed:", e);
      return { success: false, error: e?.message || String(_e) };
    }
  }

  async startRealTimeSession(sessionId: string, options: { enableAudio?: boolean; enableVideo?: boolean; onConnect?: () => void } = {}): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    if (!this.config?.enableRealTime) return { success: false, error: "Real-time features not enabled" };
    this.conversationHistory.set(sessionId, []);
    try {
      if (options.enableAudio || options.enableVideo) {
        await this.initializeMediaCapabilities(_options);
      }
      options.onConnect?.();
    } catch (_e) {
      logger.warn('Media capabilities init failed', e as any);
    }
    return { success: true, sessionId };
  }

  async sendRealTimeMessage(sessionId: string, message: string): Promise<AIResponse> {
    return this.generateText(message, { conversationId: sessionId });
  }

  async processAudio(_audioData: ArrayBuffer): Promise<{ success: boolean; transcript?: string; response?: string; error?: string }> {
    if (!this.ready) return { success: false, error: "AI Service not initialized" };
    return { success: true, transcript: "", response: "Mock AI response" } as any;
  }

  clearConversationHistory(conversationId?: string): void {
    if (conversationId) this.conversationHistory.delete(conversationId);
    else this.conversationHistory.clear();
  }
}

export const canonicalAI = new CanonicalAIService();


