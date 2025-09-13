
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { logger } from "@/shared/utils/logger";
import { MultimodalLiveClient } from "./MultimodalLiveClient";
import { AudioStreamingService } from "./AudioStreamingService";
import { RealTimeMultiTurnService } from "./RealTimeMultiTurnService";
import { MultimodalLiveService } from "./MultimodalLiveService";
import type {
  MultimodalClientConfig,
  StreamingLog,
  AudioProcessingConfig,
} from "@/shared/types/multimodal-live";

export interface AIClientConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  generationConfig?: any;
  safetySettings?: any;
  systemInstructions?: string;
  // Multimodal options
  enableMultimodal?: boolean;
  multimodalConfig?: Partial<MultimodalClientConfig>;
  audioConfig?: Partial<AudioProcessingConfig>;
}

export interface AIRequest {
  prompt: string;
  systemInstructions?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    generationConfig?: any;
    multimodal?: boolean;
    audio?: boolean;
  };
}

export interface StreamingAIRequest extends AIRequest {
  onChunk?: (_chunk: string) => void;
  onComplete?: (_fullResponse: string) => void;
  onError?: (_error: Error) => void;
}

export interface AIResponse {
  text: string;
  usageMetadata?: any;
  latencyMs?: number;
  stream?: boolean;
  conversationId?: string;
}

export interface StreamingAIResponse extends AIResponse {
  chunks: string[];
  logs?: StreamingLog[];
}

export class CanonicalAIClient {
  private static instance: CanonicalAIClient;
  private genAI: GoogleGenerativeAI | null = null;
  private currentSession: ChatSession | null = null;
  private initialized: boolean = false;

  // Multimodal capabilities
  private multimodalClient: MultimodalLiveClient | null = null;
  private audioService: AudioStreamingService | null = null;
  private isMultimodalEnabled: boolean = false;
  private currentConfig: AIClientConfig | null = null;

  private constructor() {}

  static getInstance(): CanonicalAIClient {
    if (!CanonicalAIClient.instance) {
      CanonicalAIClient.instance = new CanonicalAIClient();
    }
    return CanonicalAIClient.instance;
  }

  async initialize(_config: AIClientConfig): Promise<boolean>;
  async initialize(_apiKey: string, _model?: string): Promise<boolean>;
  async initialize(
    configOrApiKey: AIClientConfig | string,
  ): Promise<boolean> {
    try {
      // Support both (apiKey, model) and ({ apiKey, model, ... }) signatures
      const apiKey =
        typeof configOrApiKey === "string"
          ? configOrApiKey
          : configOrApiKey.apiKey;
      const modelToUse =
        typeof configOrApiKey === "string"
          ? model
          : configOrApiKey.model || model;

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.currentModel = modelToUse;
      this.currentSession = null;
      this.currentConfig =
        typeof configOrApiKey === "string"
          ? { apiKey, model: modelToUse }
          : configOrApiKey;

      // Test the configuration by preparing a model
      const testModel = this.genAI.getGenerativeModel({ model: modelToUse });
      if (!testModel) {
        throw new Error(`Failed to initialize model: ${modelToUse}`);
      }

      this.initialized = true;
      logger.info(`CanonicalAIClient initialized with model: ${modelToUse}`);
      return true;
    } catch (error: any) {
      this.genAI = null;
      this.initialized = false;
      const readableError = this.parseError(error);
      logger.error("Failed to initialize CanonicalAIClient:", readableError);
      throw new Error(`AI initialization failed: ${readableError.message}`);
    }
  }

  async generateText(_request: AIRequest): Promise<string>;
  async generateText(
    _prompt: string,
    _systemInstructions?: string,
    _options?: any,
  ): Promise<string>;
  async generateText(
    requestOrPrompt: AIRequest | string,
    systemInstructions?: string,
    options?: any,
  ): Promise<string> {
    if (!this.initialized || !this.genAI) {
      throw new Error("AI client not initialized. Call initialize() first.");
    }

    const startTime = Date.now();

    try {
      // Handle overloaded parameters
      let request: AIRequest;
      if (typeof requestOrPrompt === "string") {
        request = {
          prompt: requestOrPrompt,
          systemInstructions,
          options,
        };
      } else {
        request = requestOrPrompt;
      }

      const model = this.genAI.getGenerativeModel({
        model: this.currentModel,
        generationConfig: {
          ...request.options?.generationConfig,
        },
      });

      let prompt = request.prompt;
      if (request.systemInstructions) {
        prompt = `${request.systemInstructions}\n\n${request.prompt}`;
      }

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const latencyMs = Date.now() - startTime;
      logger.debug("Text generation completed", {
        latencyMs,
        model: this.currentModel,
      });

      return text;
    } catch (error: any) {
      const readableError = this.parseError(error);
      logger.error("Text generation failed:", readableError);
      throw new Error(`AI generation failed: ${readableError.message}`);
    }
  }

  async streamText(
    request: StreamingAIRequest,
    callbacks?: {
      onChunk?: (_chunk: string) => void;
      onComplete?: (_response: string) => void;
      onError?: (_error: Error) => void;
    },
  ): Promise<string> {
    if (!this.initialized || !this.genAI) {
      throw new Error("AI client not initialized. Call initialize() first.");
    }

    const startTime = Date.now();
    let fullResponse = "";

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.currentModel,
        generationConfig: {
          ...request.options?.generationConfig,
        },
      });

      let prompt = request.prompt;
      if (request.systemInstructions) {
        prompt = `${request.systemInstructions}\n\n${request.prompt}`;
      }

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        callbacks?.onChunk?.(chunkText);
        request.onChunk?.(chunkText);
      }

      const latencyMs = Date.now() - startTime;
      logger.debug("Streaming completed", {
        latencyMs,
        chunks: fullResponse.split("").length,
        model: this.currentModel,
      });

      callbacks?.onComplete?.(fullResponse);
      request.onComplete?.(fullResponse);

      return fullResponse;
    } catch (error: any) {
      const readableError = this.parseError(error);
      logger.error("Streaming failed:", readableError);
      callbacks?.onError?.(readableError);
      request.onError?.(readableError);
      throw readableError;
    }
  }

  async startChat(
    systemInstructions?: string,
    history: any[] = [],
  ): Promise<ChatSession> {
    if (!this.initialized || !this.genAI) {
      throw new Error("AI client not initialized. Call initialize() first.");
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.currentModel,
        systemInstruction: systemInstructions,
      });

      this.currentSession = model.startChat({
        history: history,
      });

      logger.info("Chat session started");
      return this.currentSession;
    } catch (error: any) {
      const readableError = this.parseError(error);
      logger.error("Failed to start chat session:", readableError);
      throw readableError;
    }
  }

  async sendMessageInChat(message: string): Promise<string> {
    if (!this.currentSession) {
      throw new Error("No active chat session. Call startChat() first.");
    }

    try {
      const result = await this.currentSession.sendMessage(message);
      const response = result.response.text();
      logger.debug("Chat message sent and responded");
      return response;
    } catch (error: any) {
      const readableError = this.parseError(error);
      logger.error("Chat message failed:", readableError);
      throw readableError;
    }
  }

  async generateSmartContent(
    contentType: string,
    userInput: string,
    context: Record<string, any> = {},
    options?: any,
  ): Promise<string> {
    const systemPrompt = this.buildSmartPrompt(contentType, context);
    return this.generateText(userInput, systemPrompt, options);
  }

  async getContextualSuggestions(
    componentType: string,
    currentData: Record<string, any> = {},
    userProfile: Record<string, any> = {},
    options?: any,
  ): Promise<string[]> {


Return suggestions as a JSON array of strings, each suggestion being specific and actionable.`;

    const response = await this.generateText(prompt, "", options);

    try {
      return JSON.parse(response);
    } catch {
      // Fallback: parse as text and split by lines
      return response
        .split("\n")
        .filter((line) => line.trim())
    }
  }

  async transcribeAudio(options: {
    mimeType: string;
    language?: string;
  }): Promise<{ text: string; confidence?: number }> {
    if (!this.initialized || !this.genAI) {
      throw new Error("AI client not initialized. Call initialize() first.");
    }

    try {
      const model = this.genAI.getGenerativeModel({
      });

      const prompt = `Please transcribe this audio. ${options.language ? `Language: ${options.language}` : ""}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: options.mimeType,
          },
        },
      ]);

      const transcript = result.response.text();

      return {
        text: transcript,
      };
    } catch (error: any) {
      const readableError = this.parseError(error);
      logger.error("Audio transcription failed:", readableError);
      throw readableError;
    }
  }

  async analyzeImage(options: {
    mimeType: string;
    prompt?: string;
  }): Promise<string> {
    if (!this.initialized || !this.genAI) {
      throw new Error("AI client not initialized. Call initialize() first.");
    }

    try {
      const model = this.genAI.getGenerativeModel({
      });

      const prompt = options.prompt || "Describe this image in detail.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: options.mimeType,
          },
        },
      ]);

      return result.response.text();
    } catch (error: any) {
      const readableError = this.parseError(error);
      logger.error("Image analysis failed:", readableError);
      throw readableError;
    }
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  setModel(model: string): void {
    if (!this.genAI) {
      throw new Error("AI client not initialized. Call initialize() first.");
    }

    // Validate model exists
    const validModels = [
    ];
    if (!validModels.includes(model)) {
      throw new Error(
        `Invalid model: ${model}. Valid models: ${validModels.join(", ")}`,
      );
    }

    this.currentModel = model;
    this.currentSession = null; // Reset session when changing model
    logger.info(`Model changed to: ${model}`);
  }

  isReady(): boolean {
    return this.initialized && !!this.genAI;
  }

  cleanup(): void {
    this.currentSession = null;
    this.genAI = null;
    this.initialized = false;
    logger.info("CanonicalAIClient cleaned up");
  }


  async initializeWithRealTime(
    config: AIClientConfig & {
      enableRealTime?: boolean;
      realTimeConfig?: any;
    },
  ): Promise<boolean> {
    // Initialize core client
    const success = await this.initialize(config);

    if (!success || !config.enableRealTime) {
      return success;
    }

    try {
      // Initialize real-time multi-turn service if enabled
      const realTimeService = RealTimeMultiTurnService.getInstance();
      await realTimeService.initialize(config.apiKey, {
        model: this.currentModel,
        enableAudioInput: true,
        enableAudioOutput: true,
        enableVideo: false,
        systemPrompt: config.systemInstructions,
        ...config.realTimeConfig,
      });

      // Initialize multimodal live service for advanced real-time features
      const multimodalService = MultimodalLiveService.getInstance();
      await multimodalService.initialize({
        apiKey: config.apiKey,
      });

      this.isMultimodalEnabled = true;
      logger.info("Real-time capabilities initialized successfully");

      return true;
    } catch (error) {
      logger.error("Failed to initialize real-time capabilities:", error);
      return success;
    }
  }

  async generateEnhancedResponse(
    prompt: string,
    options: {
      type?:
        | "resume"
        | "cover_letter"
        | "job_analysis"
        | "interview_prep"
        | "portfolio"
        | "general";
      context?: Record<string, any>;
      useSmartPrompting?: boolean;
      maxRetries?: number;
      fallbackModel?: string;
    } = {},
  ): Promise<AIResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

      try {
        let enhancedPrompt = prompt;

        if (options.useSmartPrompting && options.type) {
          const systemPrompt = this.buildSmartPrompt(
            options.type,
            options.context || {},
          );
          enhancedPrompt = `${systemPrompt}\n\n${prompt}`;
        }

        const model =
            ? options.fallbackModel
            : this.currentModel;

        // Temporarily switch model for fallback
        const originalModel = this.currentModel;
        if (model !== originalModel) {
          this.currentModel = model;
        }

        const response = await this.generateText({
          prompt: enhancedPrompt,
          options: {
          },
        });

        // Restore original model
        if (model !== originalModel) {
          this.currentModel = originalModel;
        }

        return {
          text: response,
          latencyMs: Date.now() - startTime,
          stream: false,
          conversationId: this.currentSession
            ? `chat-${Date.now()}`
            : undefined,
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          error,
        );

        if (attempt < retries) {
          // Wait before retry with exponential backoff
          await new Promise((resolve) =>
          );
        }
      }
    }

    throw (
      lastError || new Error("Enhanced generation failed after all retries")
    );
  }

  async processMultimodal(
    input: {
      text?: string;
      audio?: ArrayBuffer;
      video?: MediaStream;
    },
    options: {
      onProgress?: (stage: string, progress: number) => void;
      enableRealTimeResponse?: boolean;
      context?: string;
    } = {},
  ): Promise<
    AIResponse & {
      processedInputs: string[];
      capabilities: string[];
    }
  > {
    if (!this.initialized) {
      throw new Error("AI client not initialized");
    }

    const results: string[] = [];
    const processedInputs: string[] = [];
    const capabilities: string[] = ["text"];

    try {

      // Process text input
      if (input.text) {
        processedInputs.push("text");
        results.push(`Text: ${input.text}`);
      }

      // Process image input
      if (input.image) {
        const imageResponse = await this.analyzeImage(
          input.image,
          input.text || "Analyze this image",
        );
        results.push(`Image Analysis: ${imageResponse}`);
        processedInputs.push("image");
        capabilities.push("vision");
      }

      // Process audio input using real-time service
      if (input.audio && this.isMultimodalEnabled) {
        try {
          const realTimeService = RealTimeMultiTurnService.getInstance();
          await realTimeService.sendAudioData(input.audio);
          processedInputs.push("audio");
          capabilities.push("audio");
        } catch (error) {
          logger.warn(
            "Audio processing failed, continuing without audio:",
            error,
          );
        }
      }

      // Process video stream using multimodal service
      if (input.video && this.isMultimodalEnabled) {
        try {
          const multimodalService = MultimodalLiveService.getInstance();
          // This would need additional implementation for video frame capture
          processedInputs.push("video");
          capabilities.push("video");
        } catch (error) {
          logger.warn(
            "Video processing failed, continuing without video:",
            error,
          );
        }
      }


      // Generate final response with all processed inputs
      const combinedInput = results.join("\n\n");
      const finalResponse = await this.generateEnhancedResponse(combinedInput, {
        type: "general",
        context: { multimodal: true, inputs: processedInputs },
        useSmartPrompting: true,
      });


      return {
        ...finalResponse,
        processedInputs,
        capabilities,
      };
    } catch (error) {
      logger.error("Multimodal processing failed:", error);
      throw error;
    }
  }

  async startEnhancedStreaming(
    prompt: string,
    callbacks: {
      onChunk?: (chunk: string) => void;
      onComplete?: (response: string) => void;
      onError?: (error: Error) => void;
      onAudioResponse?: (audioData: ArrayBuffer) => void;
      onTranscription?: (text: string, isFinal: boolean) => void;
    },
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error("AI client not initialized");
    }

    try {
      // If real-time is enabled, use enhanced streaming
      if (this.isMultimodalEnabled) {
        const realTimeService = RealTimeMultiTurnService.getInstance();

        // Set up real-time callbacks
        const session = await realTimeService.startSession("multimodal", {
          onMessage: (message) => {
            if (message.role === "assistant") {
              callbacks.onChunk?.(message.content);
            }
          },
          onTranscription: callbacks.onTranscription,
          onAudioResponse: callbacks.onAudioResponse,
          onError: callbacks.onError,
        });

        // Send the message through real-time service
        await realTimeService.sendMessage(prompt);

        return session.id;
      } else {
        // Fallback to regular streaming
        return await this.streamText({
          prompt,
          onChunk: callbacks.onChunk,
          onComplete: callbacks.onComplete,
          onError: callbacks.onError,
        });
      }
    } catch (error) {
      logger.error("Enhanced streaming failed:", error);
      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  getEnhancedStatus(): {
    initialized: boolean;
    model: string;
    hasSession: boolean;
    realTimeEnabled: boolean;
    multimodalEnabled: boolean;
    capabilities: string[];
    lastActivity?: Date;
  } {
    const capabilities = ["text"];

    if (this.isMultimodalEnabled) {
      capabilities.push("multimodal", "real-time");

      const realTimeService = RealTimeMultiTurnService.getInstance();
      if (realTimeService.isReady()) {
        capabilities.push("audio", "streaming");
      }

      const multimodalService = MultimodalLiveService.getInstance();
      const status = multimodalService.getStatus();
      if (status.isConnected) {
        capabilities.push("live-connection");
      }
    }

    return {
      initialized: this.initialized,
      model: this.currentModel,
      hasSession: !!this.currentSession,
      realTimeEnabled: this.isMultimodalEnabled,
      multimodalEnabled: this.isMultimodalEnabled,
      capabilities,
      lastActivity: new Date(),
    };
  }

  async enhancedCleanup(): Promise<void> {
    try {
      // Cleanup real-time services
      if (this.isMultimodalEnabled) {
        const realTimeService = RealTimeMultiTurnService.getInstance();
        await realTimeService.cleanup();

        const multimodalService = MultimodalLiveService.getInstance();
        await multimodalService.cleanup();
      }

      // Cleanup core client
      this.cleanup();

      this.isMultimodalEnabled = false;
      this.currentConfig = null;

      logger.info("Enhanced cleanup completed");
    } catch (error) {
      logger.error("Enhanced cleanup error:", error);
      // Continue with basic cleanup even if enhanced cleanup fails
      this.cleanup();
    }
  }

  private parseError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "string") {
      return new Error(error);
    }

    // Handle Google AI API specific errors
    if (error?.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(
        `Google AI API Error: ${apiError.message || apiError.code || "Unknown error"}`,
      );
    }

    if (error?.statusText) {
      return new Error(`HTTP Error: ${error.status} ${error.statusText}`);
    }

    return new Error("Unknown AI error occurred");
  }

  private buildSmartPrompt(
    contentType: string,
    context: Record<string, any>,
  ): string {
    const basePrompts: Record<string, string> = {
      resume:
        "You are an expert resume writer specializing in game development careers. Create professional, ATS-friendly content.",
      cover_letter:
        "You are a professional cover letter writer with expertise in game industry applications. Write compelling, personalized content.",
      job_analysis:
        "You are a career advisor specializing in game development roles. Provide insightful analysis and actionable advice.",
      interview_prep:
        "You are an interview coach for game development positions. Provide practical, role-specific preparation advice.",
      portfolio:
        "You are a portfolio consultant for game developers. Help create compelling project descriptions and presentations.",
      general:
        "You are a helpful AI assistant specializing in game development career guidance.",
    };

    const basePrompt = basePrompts[contentType] || basePrompts.general;

      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join("\n");
      return `${basePrompt}\n\nContext:\n${contextStr}`;
    }

    return basePrompt;
  }

  getSupportedModels(): string[] {
    return [
    ];
  }
}

// Export singleton instance
export const canonicalAIClient = CanonicalAIClient.getInstance();

  return canonicalAIClient;
}

  apiKey: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await canonicalAIClient.initialize(apiKey);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

  canonicalAIClient.cleanup();
}

  newModel: string,
): Promise<boolean> {
  if (
    canonicalAIClient.getCurrentModel() !== newModel &&
    canonicalAIClient.isReady()
  ) {
    canonicalAIClient.setModel(newModel);
    return true;
  }
  return canonicalAIClient.isReady();
}

  return canonicalAIClient;
}

// Default export
export default canonicalAIClient;
