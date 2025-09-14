
import {
  canonicalAIClient,
  ensureApiKey,
  getStreamClient,
  resetAIService,
  reinitializeIfModelChanged,
} from "@/shared/services/CanonicalAIClient";

import { aiService } from "@/shared/services/AIService";
import GeminiService from "@/utils/gemini";

// Lazy fallback instance for non-canonical environments
let __geminiFallback = null;

// Choose the best AI client based on environment
  // Prefer the canonical client which is shared across the app
  return canonicalAIClient;
}

// Check if the selected AI client is ready to use
  const client = getBestAIClient();

  try {
    // Prefer explicit method when present
      return !!client.isReady();
    }

    // Some callers treat isReady like a ref with .value
    if (
      client?.isReady &&
      typeof client.isReady === "object" &&
      "value" in client.isReady
    ) {
      return !!client.isReady.value;
    }

    // Ask unified service if available
      const stats = aiService.getStats();
      if (stats && typeof stats.initialized === "boolean")
        return stats.initialized;
    }

    if (typeof client?.initialized !== "undefined") return !!client.initialized;
  } catch (_error) {
    console.warn("Error checking AI client ready state:", error);
  }
  return false;
}

// Global AI initialization helper
  // Check via service stats if available
  try {
      const stats = aiService.getStats();
      if (stats?.initialized) return true;
    }
  } catch {}

  try {
    // Resolve API key from settings/localStorage/env
    const appSettings = JSON.parse(
      localStorage.getItem("app-settings") || "{}",
    );
    const apiKey =
      appSettings.geminiApiKey ||
      localStorage.getItem("gemini_api_key") ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      null;

    if (!apiKey) {
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }

    const result = await aiService.initialize({
      apiKey,
      primaryProvider: "google",
    });

    if (!result?.success) {
      throw new Error(result?.message || "AI initialization failed");
    }
    return true;
  } catch (initError) {
    console.warn("Failed to auto-initialize AI service:", initError);

    // Minimal web fallback for non-canonical environments
    try {
      const appSettings = JSON.parse(
        localStorage.getItem("app-settings") || "{}",
      );
      const apiKey =
        appSettings.geminiApiKey ||
        localStorage.getItem("gemini_api_key") ||
        import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw initError;
      if (!__geminiFallback) __geminiFallback = new GeminiService(apiKey);
      __geminiFallback.validateApiKey();
      return true;
    } catch {
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
  }
}

// Enhanced wrappers that use the best available client
  // Ensure AI is initialized using the canonical service
  await ensureAIInitialized();

  try {
    // Use the canonical AI service for generation
    const response = await aiService.chat({
      message: prompt,
      context: systemInstructions,
      type: "chat",
      options,
    });

    return response.content;
  } catch (_error) {
    console.error("generateContent failed:", error);

    // Fallback to direct client if canonical service fails
    const client = getBestAIClient() || __geminiFallback;

    // Auto-initialize client if needed
    if (!isAIClientReady()) {
      try {
        const appSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );
        const apiKey =
          appSettings.geminiApiKey ||
          import.meta.env.VITE_GEMINI_API_KEY ||
          null;

        if (apiKey) {
          await client.initialize(apiKey);
        } else {
          throw new Error(
            "AI service not initialized. Please configure your API key first.",
          );
        }
      } catch (initError) {
        console.warn("Failed to auto-initialize AI client:", initError);
        throw new Error(
          "AI service not initialized. Please configure your API key first.",
        );
      }
    }

    try {
        return await client.generateText(prompt, systemInstructions, options);
      }
        return await client.generateContent(
          prompt,
          systemInstructions,
          options,
        );
      }
      throw new Error("No compatible AI generation method available");
    } catch (fallbackError) {
      console.error("Fallback client also failed:", fallbackError);
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
  }
}

  contentType,
  userInput,
  context = {},
  options = {},
) {
  // Ensure AI is initialized
  await ensureAIInitialized();

  try {
    // Use canonical AI service for smart content generation
    const response = await aiService.chat({
      message: userInput,
      context: `Content type: ${contentType}. Additional context: ${JSON.stringify(_context)}`,
      type: "generation",
      options,
    });

    return response.content;
  } catch (_error) {
    console.error("generateSmartContent failed with canonical service:", error);

    // Fallback to direct client
    const client = getBestAIClient();
    try {
      return await client.generateSmartContent(
        contentType,
        userInput,
        context,
        options,
      );
    } catch (fallbackError) {
      console.error("Fallback client also failed:", fallbackError);
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
  }
}

  componentType,
  currentData = {},
  userProfile = {},
  options = {},
) {
  const client = getBestAIClient();
  try {
    return await client.getContextualSuggestions(
      componentType,
      currentData,
      userProfile,
      options,
    );
  } catch (_error) {
    console.error("getContextualSuggestions failed:", error);
    if (error.message.includes("not initialized")) {
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
    throw error;
  }
}

// Stream text using modern AI SDK when available
  const client = getBestAIClient() || __geminiFallback;

  try {
    // If a direct stream API is available (non-canonical), use it
    if (
      client &&
      client !== canonicalAIClient
    ) {
      return await client.streamText(prompt, options);
    }

    // Adapt CanonicalAIClient.streamText(requestWithCallbacks) to an async iterator
    if (
      client === canonicalAIClient &&
    ) {
      const chunks = [];
      let done = false;
      let notify = null;

      const iterator = {
        async next() {
          if (chunks.length) return { value: chunks.shift(), done: false };
          if (done) return { value: undefined, done: true };
          return new Promise((resolve) => {
            notify = resolve;
          });
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };

      client.streamText({
        prompt,
        options,
        onChunk: (c) => {
          if (!c) return;
          chunks.push(c);
          if (notify) {
            const n = notify;
            notify = null;
            n({ value: chunks.shift(), done: false });
          }
        },
        onComplete: () => {
          done = true;
          if (notify) {
            const n = notify;
            notify = null;
            n({ value: undefined, done: true });
          }
        },
        onError: () => {
          done = true;
          if (notify) {
            const n = notify;
            notify = null;
            n({ value: undefined, done: true });
          }
        },
      });

      return { textStream: iterator };
    }

    // Fallback to single-shot generation
    let result;
      result = await client.generateText(prompt, options);
      result = await client.generateContent(prompt, "", options);
    } else {
      throw new Error("No compatible AI generation method available");
    }

    return {
        yield result?.text || result;
      },
    };
  } catch (_error) {
    console.error("streamText failed:", error);
    if (error?.message?.includes("not initialized")) {
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
    throw error;
  }
}

// Initialize AI with API key (enhanced for modern client)
// Dedup guards to avoid repeated initialization spam
let __aiInitSignature = null;
let __aiInitPromise = null;

  const client = getBestAIClient();

  const signature = `${(apiKey || "").trim()}::${(model || "").trim()}`;
  try {
    // Skip if already initialized with same config
    const ready =
        ? client.isReady()
        : client?.isReady?.value === true;
    if (ready && __aiInitSignature === signature) {
      return { success: true, model };
    }
    // Coalesce concurrent init attempts
    if (__aiInitPromise && __aiInitSignature === signature) {
      return await __aiInitPromise;
    }
  } catch {}

  // For modern AI client (web environment)
  if (client.initialize) {
    try {
      __aiInitSignature = signature;
      __aiInitPromise = client.initialize(apiKey, model);
      const result = await __aiInitPromise;
      __aiInitPromise = null;
      if (result?.success === false) {
        throw new Error(
          result?.error ||
            "AI service not initialized. Please configure your API key first.",
        );
      }
      return result;
    } catch (_error) {
      __aiInitPromise = null;
      console.error("Modern AI client initialization failed:", error);
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
  }

  // For canonical client (Electron IPC)
  if (client === canonicalAIClient) {
    try {
      __aiInitSignature = signature;
      __aiInitPromise = canonicalAIClient.initialize(apiKey, model);
      const result = await __aiInitPromise;
      __aiInitPromise = null;
      if (result?.success === false) {
        throw new Error(
          result?.error ||
            "AI service not initialized. Please configure your API key first.",
        );
      }
      return result;
    } catch (_error) {
      __aiInitPromise = null;
      console.error("Canonical AI client initialization failed:", error);
      throw new Error(
        "AI service not initialized. Please configure your API key first.",
      );
    }
  }

  // Fallback initialization for canonical client compatibility
  try {
    __aiInitSignature = signature;
    __aiInitPromise = ensureApiKey(apiKey);
    const res = await __aiInitPromise;
    __aiInitPromise = null;
    return res;
  } catch (_error) {
    __aiInitPromise = null;
    console.error("AI client fallback initialization failed:", error);
    throw new Error(
      "AI service not initialized. Please configure your API key first.",
    );
  }
}

export { getAIClient };

// Enhanced exports with modern AI capabilities
export {
  generateContent,
  generateSmartContent,
  getContextualSuggestions,
  streamText,
  initializeAI,
  getBestAIClient,
  isAIClientReady,
  ensureAIInitialized,
  ensureApiKey,
  resetAIService,
  reinitializeIfModelChanged,
  getStreamClient,
};

// Default export for convenience - returns the best available AI client
export default getBestAIClient;
// Provide a stable getter locally to avoid named export mismatch during HMR
  return canonicalAIClient;
}
