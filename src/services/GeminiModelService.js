
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/shared/utils/logger";

class GeminiModelService {
  constructor() {
    this.cache = new Map();
  }

  async fetchAvailableModels(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required to fetch models");
    }

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      logger.info(
        `Using cached Gemini models (${cached.data.models.length} models)`,
      );
      return cached.data;
    }

    try {
      // Test API key validity first
      await this.testAPIKey(apiKey);

      logger.info("Fetching available Gemini models from Google AI API...");

      // Use Google AI Studio API to fetch models
      // Avoid adding unnecessary headers on GET to prevent CORS preflight in some dev envs
      const url = new URL(
      );
      url.searchParams.set("key", apiKey);
      const response = await fetch(url.toString());

      if (!response.ok) {
          throw new Error(
            "Invalid API key. Please check your Google AI Studio API key.",
          );
          throw new Error(
            "API key lacks permissions. Please ensure your key has access to Generative AI.",
          );
        }
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      logger.debug("Raw API response:", data);

      // Filter only Gemini models and extract relevant information
      const geminiModels = data.models
        ?.filter((model) => model.name && model.name.includes("gemini"))
        ?.map((model) => this.parseModelInfo(model))
        ?.sort((a, b) => a.displayName.localeCompare(b.displayName))
        ?.filter((model) => model.capabilities.textGeneration); // Only include working models

      const result = {
        models: geminiModels || [],
        lastUpdated: new Date().toISOString(),
        source: "google-ai-api",
      };

      logger.info(
        `Successfully fetched ${result.models.length} Gemini models from Google AI API`,
      );

      // Cache the results
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      logger.error("Failed to fetch Gemini models from API:", error);

      // If API key is invalid, don't fall back to cached data
      if (
        error.message.includes("API key") ||
        error.message.includes("Invalid")
      ) {
        throw error; // Re-throw API key errors
      }

      // For other errors, try fallback
      logger.warn("Attempting fallback to curated model list...");
      return this.getFallbackModelList();
    }
  }

  async testAPIKey(apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Updated with current working model names (remove deprecated models)
      let success = false;
      let lastError;
      for (const m of candidates) {
        try {
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.generateContent("hello");
          const response = await result.response;
          if (response && response.text()) {
            success = true;
            return {
              success: true,
              message: `API key valid (tested with ${m})`,
            };
          }
        } catch (err) {
          lastError = err;
          const msg = err?.message || "";
          if (
            msg.includes("API_KEY_INVALID") ||
            msg.toLowerCase().includes("expired") ||
            msg.includes("PERMISSION_DENIED")
          ) {
            break;
          }
        }
      }
      if (!success) {
        throw (
          lastError || new Error("API key test failed - no response received")
        );
      }
    } catch (error) {
      const errorMessage = error.message?.includes("API_KEY_INVALID")
        ? "Invalid API key. Please check your Google AI Studio API key."
        : error.message?.includes("PERMISSION_DENIED")
          ? "API key lacks permissions. Please ensure your key has access to Generative AI."
          : error.message?.toLowerCase().includes("expired")
            ? "API key expired. Generate a new key in Google AI Studio and update your settings."
            : `API key test failed: ${error.message}`;

      throw new Error(errorMessage);
    }
  }

  getFallbackModelList() {
    const models = this.getCuratedModelList();
    const geminiModels = models
      ?.filter((model) => model.name && model.name.includes("gemini"))
      ?.map((model) => this.parseModelInfo(model))
      ?.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      models: geminiModels || [],
      lastUpdated: new Date().toISOString(),
      source: "fallback-curated",
    };
  }

  getCuratedModelList() {
    return [
      {
        description:
          "Latest experimental Flash model with advanced capabilities",
        supportedGenerationMethods: ["generateContent"],
      },
      {
        supportedGenerationMethods: ["generateContent"],
      },
      {
        description: "Optimized Flash model with reduced resource requirements",
        supportedGenerationMethods: ["generateContent"],
      },
      {
        description:
          "High-capability model for complex reasoning and multimodal tasks",
        supportedGenerationMethods: ["generateContent"],
      },
      {
        name: "models/gemini-pro",
        displayName: "Gemini Pro (Legacy)",
        description:
        supportedGenerationMethods: ["generateContent"],
        deprecated: true,
      },
    ];
  }

  parseModelInfo(model) {
    const name = model.name.replace("models/", ""); // Extract model name from full path
    const displayName = model.displayName || name;
    const description = model.description || "";

    // Determine capabilities based on model name and supported generation methods
    const capabilities = this.determineCapabilities(model);

    // Parse version and release info
    const version = this.extractVersion(name);
    const isExperimental =
      name.includes("exp") ||
      description.toLowerCase().includes("experimental");

    return {
      id: name,
      name: name,
      displayName: displayName,
      description: description,
      version: version,
      isExperimental: isExperimental,
      capabilities: capabilities,
      supportedGenerationMethods: model.supportedGenerationMethods || [
        "generateContent",
      ],
    };
  }

  determineCapabilities(model) {
    const capabilities = {
      textGeneration: false,
      multiTurn: false,
      imageInput: false,
      videoInput: false,
      audioInput: false,
      audioOutput: false,
      realtimeChat: false,
      liveChat: false,
      codeGeneration: false,
      jsonMode: false,
      streaming: false,
      multimodal: false,
    };

    const methods = model.supportedGenerationMethods || [];
    const name = model.name.toLowerCase();
    const description = (model.description || "").toLowerCase();


    // Text generation (all Gemini models support this)
    if (
      methods.includes("generateContent") ||
      methods.includes("generateText") ||
    ) {
      capabilities.textGeneration = true;
      capabilities.multiTurn = true; // All modern Gemini models support multi-turn
      capabilities.streaming = true; // All support streaming
    }

    if (
      name.includes("vision") ||
      name.includes("pro") ||
      name.includes("flash") ||
    ) {
      capabilities.imageInput = true;
      capabilities.multimodal = true;
    }

      capabilities.videoInput = true;
      capabilities.multimodal = true;
    }

    if (
      name.includes("audio") ||
      description.includes("audio") ||
      name.includes("live")
    ) {
      capabilities.audioInput = true;
      capabilities.audioOutput = true;
      capabilities.multimodal = true;
    }

      capabilities.realtimeChat = true;
      capabilities.liveChat = true;
    }

    // Code generation (all models except nano)
    if (!name.includes("nano")) {
      capabilities.codeGeneration = true;
      capabilities.jsonMode = true;
    }

      capabilities.multimodal = true;
    }

    return capabilities;
  }

  extractVersion(name) {
  }

  getRecommendedModels(models) {
    const recommendations = {
      general: null,
      fastResponse: null,
      vision: null,
      audio: null,
      coding: null,
    };

    for (const model of models) {
      // General purpose - Pro models
      if (
        !recommendations.general &&
        model.name.includes("pro") &&
        !model.isExperimental
      ) {
        recommendations.general = model;
      }

      // Fast response - Flash models
      if (!recommendations.fastResponse && model.name.includes("flash")) {
        recommendations.fastResponse = model;
      }

      // Vision - models with image capabilities
      if (!recommendations.vision && model.capabilities.imageInput) {
        recommendations.vision = model;
      }

      // Audio - models with audio capabilities
      if (!recommendations.audio && model.capabilities.audioInput) {
        recommendations.audio = model;
      }

      // Coding - Pro models (best for code)
      if (
        !recommendations.coding &&
        model.name.includes("pro") &&
        model.capabilities.codeGeneration
      ) {
        recommendations.coding = model;
      }
    }

    return recommendations;
  }

  clearCache() {
    this.cache.clear();
    logger.debug("Gemini model cache cleared");
  }

  getCapabilityDescription(capability) {
    const descriptions = {
      textGeneration: "Generate and understand text",
      multiTurn: "Multi-turn conversations",
      imageInput: "Analyze images and visual content",
      videoInput: "Process and analyze video content",
      audioInput: "Process audio input and speech",
      audioOutput: "Generate audio responses and speech",
      realtimeChat: "Real-time bidirectional conversation",
      liveChat: "Live streaming conversation mode",
      codeGeneration: "Write and understand code",
      jsonMode: "Structured JSON output",
      streaming: "Real-time streaming responses",
      multimodal: "Handle multiple input types simultaneously",
    };
    return descriptions[capability] || capability;
  }

  getCapabilityIcon(capability) {
    const icons = {
      textGeneration: "mdi-text",
      multiTurn: "mdi-chat-outline",
      imageInput: "mdi-image-outline",
      videoInput: "mdi-video-outline",
      audioInput: "mdi-microphone",
      audioOutput: "mdi-volume-high",
      realtimeChat: "mdi-chat-processing",
      liveChat: "mdi-broadcast",
      codeGeneration: "mdi-code-braces",
      jsonMode: "mdi-code-json",
      streaming: "mdi-lightning-bolt",
      multimodal: "mdi-grid",
    };
    return icons[capability] || "mdi-check-circle-outline";
  }
}

export const geminiModelService = new GeminiModelService();
export default geminiModelService;
