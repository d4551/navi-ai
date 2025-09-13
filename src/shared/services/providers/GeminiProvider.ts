import BaseAIProvider from "./BaseAIProvider";
import {
  AIProvider,
  ModalityType,
  MultiModalRequest,
  MultiModalResponse,
  StreamCallbacks,
} from "@/shared/types/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/shared/utils/logger";

export default class GeminiProvider extends BaseAIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    super(AIProvider.GEMINI, [
      ModalityType.TEXT,
      ModalityType.IMAGE,
      ModalityType.AUDIO,
      ModalityType.VIDEO,
    ]);
  }

  async initialize(config: any): Promise<void> {
    await super.initialize(config);

    if (!config.apiKey) {
      throw new Error("Gemini API key is required");
    }

    try {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.currentModel || "gemini-2.0-flash-exp",
      });
      logger.info("Gemini provider initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Gemini provider:", error);
      throw error;
    }
  }

  async execute(request: MultiModalRequest): Promise<MultiModalResponse> {
    const start = Date.now();
    const id = `${this.provider}_${Date.now()}`;
    if (!this.genAI || !this.model) {
      throw new Error("Gemini provider not initialized");
    }

    try {
      // Extract text content
      const textContent = request.content.find(
        (c) => c.type === ModalityType.TEXT,
      );
      const prompt = textContent?.data || "";

      // Check for image content
      const imageContent = request.content.find(
        (c) => c.type === ModalityType.IMAGE,
      );

      let parts = [];

      if (prompt) {
        parts.push({ text: prompt });
      }

      if (imageContent) {

        const imageData = imageContent.data;
        if (typeof imageData === "string" && imageData.startsWith("data:")) {

          const [mimeType, base64Data] = imageData
            .substring(5)
            .split(";base64,");
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }

      if (parts.length === 0) {
        throw new Error("No valid content found in request");
      }

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || "gemini-2.0-flash-exp",
        success: true,
        content: { text },
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
          imagesGenerated: 0,
          audioDuration: 0,
          videoDuration: 0,
          cost: 0, // Calculate based on pricing if needed
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start,
        },
      };
    } catch (error) {
      logger.error("Gemini execution error:", error);
      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || "gemini-2.0-flash-exp",
        success: false,
        content: {},
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          imagesGenerated: 0,
          audioDuration: 0,
          videoDuration: 0,
          cost: 0,
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start,
        },
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  stream(request: MultiModalRequest, callbacks: StreamCallbacks) {
    const session = {
      id: `${this.provider}_${Date.now()}`,
      provider: this.provider,
      modality: ModalityType.TEXT,
      startTime: Date.now(),
      chunkCount: 0,
    };

    callbacks.onStart?.(session);
    if (!this.genAI || !this.model) {
      const error = new Error("Gemini provider not initialized");
      callbacks.onError?.(error);
      return null;
    }

    const controller = new AbortController();

    (async () => {
      try {
        // Extract text content
        const textContent = request.content.find(
          (c) => c.type === ModalityType.TEXT,
        );
        const prompt = textContent?.data || "";

        // Check for image content
        const imageContent = request.content.find(
          (c) => c.type === ModalityType.IMAGE,
        );

        let parts = [];

        if (prompt) {
          parts.push({ text: prompt });
        }

        if (imageContent) {
          const imageData = imageContent.data;
          if (typeof imageData === "string" && imageData.startsWith("data:")) {
            const [mimeType, base64Data] = imageData
              .substring(5)
              .split(";base64,");
            parts.push({
              inlineData: {
                mimeType,
                data: base64Data,
              },
            });
          }
        }

        if (parts.length === 0) {
          throw new Error("No valid content found in request");
        }

        const result = await this.model.generateContentStream(parts);
        let fullText = "";

        for await (const chunk of result.stream) {
          if (controller.signal.aborted) {
            break;
          }

          const chunkText = chunk.text();
          if (chunkText) {
            fullText += chunkText;
            session.chunkCount++;
            callbacks.onChunk?.(chunkText);
          }
        }

        const finalResponse = await result.response;

        callbacks.onComplete?.({
          id: session.id,
          requestId: request.id,
          provider: this.provider,
          model: this.currentModel || "gemini-2.0-flash-exp",
          success: true,
          content: { text: fullText },
          usage: {
            inputTokens: finalResponse.usageMetadata?.promptTokenCount || 0,
            outputTokens:
              finalResponse.usageMetadata?.candidatesTokenCount || 0,
            imagesGenerated: 0,
            audioDuration: 0,
            videoDuration: 0,
            cost: 0,
          },
          timing: {
            startedAt: session.startTime,
            completedAt: Date.now(),
            totalTime: Date.now() - session.startTime,
            processingTime: Date.now() - session.startTime,
          },
        });
      } catch (error) {
        logger.error("Gemini streaming error:", error);
        callbacks.onError?.(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    })();

    return controller;
  }
}
