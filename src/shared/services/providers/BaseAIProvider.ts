import {
  AIProvider,
  ModalityType,
  ProviderConfig,
  MultiModalRequest,
  MultiModalResponse,
  HealthMetrics,
  ModelInfo,
  StreamCallbacks,
} from "@/shared/types/ai";
import { logger } from "@/shared/utils/logger";

export default abstract class BaseAIProvider {
  protected config: ProviderConfig | null = null;
  protected currentModel: string | null = null;

  constructor(
    public readonly provider: AIProvider,
    private readonly supportedModalities: ModalityType[],
  ) {}

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
  }

  async checkHealth(): Promise<HealthMetrics> {
    const start = Date.now();
    const healthy = !!this.config?.apiKey;
    return {
      provider: this.provider,
      responseTime: Date.now() - start,
      lastCheck: Date.now(),
      status: healthy ? "healthy" : "down",
    };
  }

  canHandle(request: MultiModalRequest): boolean {
    return request.modalities.every((m) =>
      this.supportedModalities.includes(m),
    );
  }

    const start = Date.now();
    const id = `${this.provider}_${Date.now()}`;

    if (!this.config?.apiKey) {
      const error = `${this.provider} API key missing`;
      logger.error(error, { request }, this.provider);
      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || "default",
        success: false,
        content: {},
        usage: {
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start,
        },
        error,
      };
    }

    try {
      // Only OpenAI is implemented in the base class
      // All other providers should override this method
      if (this.provider === AIProvider.OPENAI) {
      }

      logger.error(error);
      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || "default",
        success: false,
        content: {},
        usage: {
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start,
        },
        error,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || "default",
        success: false,
        content: {},
        usage: {
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start,
        },
        error: error.message,
      };
    }
  }

    request: MultiModalRequest,
    id: string,
    start: number,
  ): Promise<MultiModalResponse> {
    const textInput = request.content.find(
      (c) => c.type === ModalityType.TEXT,
    )?.data;
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config!.apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: String(textInput || "") }],
        max_tokens: request.options?.maxTokens,
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg);
    }

    const data = await response.json();
    return {
      id,
      requestId: request.id,
      provider: this.provider,
      model: data.model || this.currentModel || "default",
      success: true,
      content: { text },
      usage: {
      },
      timing: {
        startedAt: start,
        completedAt: Date.now(),
        totalTime: Date.now() - start,
        processingTime: Date.now() - start,
      },
    };
  }

  stream(request: MultiModalRequest, callbacks: StreamCallbacks) {
    const session = {
      id: `${this.provider}_${Date.now()}`,
      provider: this.provider,
      modality: ModalityType.TEXT,
      startTime: Date.now(),
    };

    callbacks.onStart?.(session);

    if (!this.config?.apiKey) {
      const err = new Error(`${this.provider} API key missing`);
      logger.error(err.message);
      callbacks.onError?.(err);
      return null;
    }

    // Only OpenAI is implemented in the base class
    // All other providers should override this method
    if (this.provider === AIProvider.OPENAI) {
      return this.streamOpenAI(request, callbacks, session);
    }

    // This should not happen if providers properly override stream()
    const error = new Error(
      `Provider ${this.provider} must override the stream() method`,
    );
    logger.error(`[${this.provider}] ${error.message}`);
    callbacks.onError?.(error);
    return null;
  }

  private streamOpenAI(
    request: MultiModalRequest,
    callbacks: StreamCallbacks,
    session: any,
  ) {
    const controller = new AbortController();
    (async () => {
      try {
        const textInput = request.content.find(
          (c) => c.type === ModalityType.TEXT,
        )?.data;
        const response = await fetch(
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config!.apiKey}`,
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: String(textInput || "") }],
              stream: true,
              max_tokens: request.options?.maxTokens,
            }),
          },
        );

        if (!response.ok || !response.body) {
          throw new Error(await response.text());
        }

        const reader = response.body.getReader();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            if (data === "[DONE]") {
              reader.cancel();
              break;
            }
            try {
              const json = JSON.parse(data);
              if (chunk) {
                fullText += chunk;
                session.chunkCount++;
                callbacks.onChunk?.(chunk);
              }
            } catch (e) {
              logger.debug("Failed to parse stream chunk", e);
            }
          }
        }

        callbacks.onComplete?.({
          id: session.id,
          requestId: request.id,
          provider: this.provider,
          model: this.currentModel || "default",
          success: true,
          content: { text: fullText },
          usage: {
          },
          timing: {
            startedAt: session.startTime,
            completedAt: Date.now(),
            totalTime: Date.now() - session.startTime,
            processingTime: Date.now() - session.startTime,
          },
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${this.provider}] stream error`, error);
        callbacks.onError?.(error);
      }
    })();

    return controller;
  }

  getModels(): ModelInfo[] {
    return this.config?.models || [];
  }

  async switchModel(modelId: string): Promise<boolean> {
    if (this.config?.models.find((m) => m.id === modelId)) {
      this.currentModel = modelId;
      return true;
    }
    return false;
  }
}
