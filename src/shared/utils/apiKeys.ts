import { unifiedStorage } from "@/utils/storage";

  try {
    const raw = localStorage.getItem("app-settings");
    if (raw) {
      const settings = JSON.parse(raw);
      if (
        settings &&
        typeof settings.geminiApiKey === "string" &&
      ) {
        return settings.geminiApiKey.trim();
      }
    }
  } catch {}

  try {
    const prefs = await unifiedStorage.getPreferences?.();
    const key = (prefs && (prefs.geminiApiKey || prefs.data?.geminiApiKey)) as
      | string
      | undefined;
      return key.trim();
    }
  } catch {}

  try {
    const saved = await unifiedStorage.get?.("navicv-data");
    const key = saved?.settings?.geminiApiKey;
      return key.trim();
    }
  } catch {}

  try {
    const secure = (window as any)?.api?.secureStore;
    if (secure?.get) {
      const res = await secure.get("geminiApiKey");
      const key = (res && (res.data ?? res.value)) || null;
        return key.trim();
      }
    }
  } catch {}

  try {
    const envKey =
      (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
      (globalThis as any)?.process?.env?.VITE_GEMINI_API_KEY;
      return envKey.trim();
    }
  } catch {}

  return null;
}

  const key = await resolveGeminiApiKey();
  if (!key) throw new Error("API key is required");
  return key;
}

  // For now, try to get Google Cloud specific key first, then fallback to Gemini key
  try {
    const raw = localStorage.getItem("app-settings");
    if (raw) {
      const settings = JSON.parse(raw);
      if (
        settings &&
        typeof settings.googleCloudApiKey === "string" &&
      ) {
        return settings.googleCloudApiKey.trim();
      }
    }
  } catch {}

  // Fallback to Gemini key resolution for backward compatibility
  return resolveGeminiApiKey();
}

  apiKey: string,
  service: "gemini" | "google-cloud",
): { valid: boolean; message: string } {
  if (!apiKey || typeof apiKey !== "string") {
    return { valid: false, message: "API key is required" };
  }

  const trimmed = apiKey.trim();
    return { valid: false, message: "API key cannot be empty" };
  }

  // Basic format validation for Google API keys
  if (!trimmed.startsWith("AIzaSy")) {
    return {
      valid: false,
      message: 'Google API keys should start with "AIzaSy"',
    };
  }

    return { valid: false, message: "API key length appears invalid" };
  }

  // Check for common issues
  if (
    trimmed.includes(" ") ||
    trimmed.includes("\n") ||
    trimmed.includes("\t")
  ) {
    return {
      valid: false,
      message: "API key contains invalid whitespace characters",
    };
  }

  return { valid: true, message: "API key format appears valid" };
}

  apiKey: string,
  service: "gemini" | "google-cloud",
): Promise<{ success: boolean; message: string; details?: any }> {
  const formatCheck = validateApiKeyFormat(apiKey, service);
  if (!formatCheck.valid) {
    return { success: false, message: formatCheck.message };
  }

  try {
    if (service === "gemini") {
      return await testGeminiApiKey(apiKey);
    } else if (service === "google-cloud") {
      return await testGoogleCloudApiKey(apiKey);
    }

    return { success: false, message: "Unknown service type" };
  } catch (error: any) {
    return {
      success: false,
      message: `API test failed: ${error.message}`,
      details: error,
    };
  }
}

  apiKey: string,
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const response = await fetch(
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Gemini API key is valid and working",
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `Gemini API error (${response.status}): ${response.statusText}`,
        details: { status: response.status, error: errorText },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Network error testing Gemini API: ${error.message}`,
      details: error,
    };
  }
}

  apiKey: string,
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Test with a simple voices list request
    const response = await fetch(
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Google Cloud TTS API key is valid and working",
      };
    } else {
      const errorText = await response.text();
      let message = `Google Cloud TTS API error (${response.status}): ${response.statusText}`;

        message +=
          "\nPossible issues:\n• Text-to-Speech API not enabled\n• Insufficient permissions\n• Using wrong API key type";
      }

      return {
        success: false,
        message,
        details: { status: response.status, error: errorText },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Network error testing Google Cloud TTS API: ${error.message}`,
      details: error,
    };
  }
}
