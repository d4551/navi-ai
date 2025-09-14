import {computed, watch } from "vue";
import { logger } from "@/shared/utils/logger";

// Reactive voice settings store
const voiceSettings = ref({
  // TTS Settings
  ttsProvider: "system", // 'system' | 'gemini' | 'kokoro'
  ttsEnabled: false,
  ttsVoice: "",

  // STT Settings
  sttProvider: "system", // 'system' | 'gemini'
  sttEnabled: false,
  voiceLang: "en-US",

  // Device Settings
  selectedMicId: "",
  selectedSpeakerId: "",

  // Feature Settings
  voiceMode: false,
  voiceHandsFree: false,
  chatCuesMuted: false,

  // Kokoro-specific
  kokoroModel: "default",
  kokoroVoice: "af_heart",

  // Gemini-specific
  geminiVoice: "",
  geminiApiKey: "",
});

// Settings persistence
const VOICE_SETTINGS_KEY = "navi_voice_settings";
const APP_SETTINGS_KEY = "app-settings";

// Load settings from localStorage
  try {
    // Load from main app settings for compatibility
    const appSettings = JSON.parse(
      localStorage.getItem(APP_SETTINGS_KEY) || "{}",
    );

    // Update reactive settings
    voiceSettings.value = {
      // TTS Settings
      ttsProvider: appSettings.ttsProvider || "system",
      ttsEnabled: appSettings.voiceMode || false,
      ttsVoice: appSettings.ttsVoice || "",

      // STT Settings
      sttProvider: appSettings.sttProvider || "system",
      sttEnabled: appSettings.voiceMode || false,
      voiceLang: appSettings.voiceLang || appSettings.language || "en-US",

      // Device Settings
      selectedMicId: appSettings.selectedMicId || "",
      selectedSpeakerId: appSettings.selectedSpeakerId || "",

      // Feature Settings
      voiceMode: appSettings.voiceMode || false,
      voiceHandsFree: appSettings.voiceHandsFree || false,
      chatCuesMuted: appSettings.chatCuesMuted || false,

      // Kokoro-specific
      kokoroModel: appSettings.kokoroModel || "default",
      kokoroVoice: appSettings.kokoroVoice || "af_heart",

      // Gemini-specific
      geminiVoice: appSettings.geminiVoice || "",
      geminiApiKey: appSettings.geminiApiKey || "",
    };

    logger.debug("Voice settings loaded:", voiceSettings.value);
    return true;
  } catch (_error) {
    logger.error("Failed to load voice settings:", error);
    return false;
  }
}

// Save settings to localStorage
  try {
    // Save to main app settings for compatibility
    const appSettings = JSON.parse(
      localStorage.getItem(APP_SETTINGS_KEY) || "{}",
    );

    // Update app settings with voice settings
    Object.assign(appSettings, {
      // TTS Settings
      ttsProvider: voiceSettings.value.ttsProvider,
      speechRate: voiceSettings.value.speechRate,
      speechPitch: voiceSettings.value.speechPitch,
      speechVolume: voiceSettings.value.speechVolume,
      ttsVoice: voiceSettings.value.ttsVoice,

      // STT Settings
      sttProvider: voiceSettings.value.sttProvider,
      voiceLang: voiceSettings.value.voiceLang,

      // Device Settings
      selectedMicId: voiceSettings.value.selectedMicId,
      selectedSpeakerId: voiceSettings.value.selectedSpeakerId,

      // Feature Settings
      voiceMode: voiceSettings.value.voiceMode,
      voiceHandsFree: voiceSettings.value.voiceHandsFree,
      chatCuesMuted: voiceSettings.value.chatCuesMuted,

      // Kokoro-specific
      kokoroModel: voiceSettings.value.kokoroModel,
      kokoroVoice: voiceSettings.value.kokoroVoice,

      // Gemini-specific
      geminiVoice: voiceSettings.value.geminiVoice,
      geminiApiKey: voiceSettings.value.geminiApiKey,
    });

    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(appSettings));

    // Also save to dedicated voice settings for backup
    localStorage.setItem(
      VOICE_SETTINGS_KEY,
      JSON.stringify(voiceSettings.value),
    );

    logger.debug("Voice settings saved");
    return true;
  } catch (_error) {
    logger.error("Failed to save voice settings:", error);
    return false;
  }
}

// Watch for changes and auto-save
watch(
  voiceSettings,
  () => {
    saveVoiceSettings();
  },
  { deep: true },
);

// Computed properties
const isGeminiAvailable = computed(() => {
  return !!(
    voiceSettings.value.geminiApiKey && voiceSettings.value.geminiApiKey.trim()
  );
});

const canUseGeminiTTS = computed(() => {
  return (
    voiceSettings.value.ttsProvider === "gemini" && isGeminiAvailable.value
  );
});

const canUseGeminiSTT = computed(() => {
  return (
    voiceSettings.value.sttProvider === "gemini" && isGeminiAvailable.value
  );
});

const effectiveTTSProvider = computed(() => {
  // Auto-fallback to system if Gemini is selected but no API key
  if (
    voiceSettings.value.ttsProvider === "gemini" &&
    !isGeminiAvailable.value
  ) {
    return "system";
  }
  return voiceSettings.value.ttsProvider;
});

const effectiveSTTProvider = computed(() => {
  // Auto-fallback to system if Gemini is selected but no API key
  if (
    voiceSettings.value.sttProvider === "gemini" &&
    !isGeminiAvailable.value
  ) {
    return "system";
  }
  return voiceSettings.value.sttProvider;
});

// Voice provider validation
  const validProviders = ["system", "gemini", "kokoro"];
  if (!validProviders.includes(provider)) {
    logger.warn(`Invalid TTS provider: ${provider}, using system instead`);
    return "system";
  }

  if (provider === "gemini" && !isGeminiAvailable.value) {
    logger.warn(
      "Gemini TTS selected but no API key available, using system instead",
    );
    return "system";
  }

  return provider;
}

  const validProviders = ["system", "gemini"];
  if (!validProviders.includes(provider)) {
    logger.warn(`Invalid STT provider: ${provider}, using system instead`);
    return "system";
  }

  if (provider === "gemini" && !isGeminiAvailable.value) {
    logger.warn(
      "Gemini STT selected but no API key available, using system instead",
    );
    return "system";
  }

  return provider;
}

  const validated = validateTTSProvider(provider);
  voiceSettings.value.ttsProvider = validated;

  // Auto-enable voice mode if switching to a premium provider
  if (validated !== "system" && !voiceSettings.value.voiceMode) {
    voiceSettings.value.voiceMode = true;
  }

  logger.info(`TTS provider updated to: ${validated}`);
}

  const validated = validateSTTProvider(provider);
  voiceSettings.value.sttProvider = validated;

  logger.info(`STT provider updated to: ${validated}`);
}

  if (typeof settings.rate === "number") {
    voiceSettings.value.speechRate = Math.max(
    );
  }

  if (typeof settings.pitch === "number") {
    voiceSettings.value.speechPitch = Math.max(
    );
  }

  if (typeof settings.volume === "number") {
    voiceSettings.value.speechVolume = Math.max(
    );
  }

  logger.debug("Speech settings updated:", {
    rate: voiceSettings.value.speechRate,
    pitch: voiceSettings.value.speechPitch,
    volume: voiceSettings.value.speechVolume,
  });
}

  if (devices.micId) {
    voiceSettings.value.selectedMicId = devices.micId;
  }

  if (devices.speakerId) {
    voiceSettings.value.selectedSpeakerId = devices.speakerId;
  }

  logger.debug("Device settings updated:", {
    mic: voiceSettings.value.selectedMicId,
    speaker: voiceSettings.value.selectedSpeakerId,
  });
}

// Voice mode management
  voiceSettings.value.voiceMode = true;
  voiceSettings.value.ttsEnabled = true;
  voiceSettings.value.sttEnabled = true;

  logger.info("Voice mode enabled");
}

  voiceSettings.value.voiceMode = false;
  voiceSettings.value.ttsEnabled = false;
  voiceSettings.value.sttEnabled = false;

  logger.info("Voice mode disabled");
}

  if (voiceSettings.value.voiceMode) {
    disableVoiceMode();
  } else {
    enableVoiceMode();
  }
}

  const provider = effectiveTTSProvider.value;

  switch (provider) {
    case "system":
      return {
        name: "System TTS",
        description: "Built-in browser text-to-speech",
        features: ["Fast", "Reliable", "No setup required"],
        limitations: ["Limited voice quality", "Browser dependent"],
      };
    case "gemini":
      return {
        name: "Google AI (Gemini)",
        description: "AI-powered natural speech synthesis",
        features: ["High quality", "Natural voices", "Multiple languages"],
        limitations: ["Requires API key", "Internet connection required"],
        available: isGeminiAvailable.value,
      };
    case "kokoro":
      return {
        name: "Kokoro TTS",
        description: "Local neural voice synthesis",
        features: ["High quality", "No internet required", "Privacy focused"],
        limitations: ["Large model files", "Limited voices"],
      };
    default:
      return {
        name: "Unknown",
        description: "Unknown TTS provider",
        features: [],
        limitations: ["Provider not recognized"],
      };
  }
}

  const provider = effectiveSTTProvider.value;

  switch (provider) {
    case "system":
      return {
        name: "System STT",
        description: "Built-in browser speech recognition",
        features: ["Fast", "Real-time", "No setup required"],
        limitations: ["Accuracy varies", "Browser dependent"],
      };
    case "gemini":
      return {
        name: "Google AI (Gemini)",
        description: "AI-powered speech recognition",
        features: ["High accuracy", "Multiple languages", "Context aware"],
        limitations: ["Requires API key", "Internet connection required"],
        available: isGeminiAvailable.value,
      };
    default:
      return {
        name: "Unknown",
        description: "Unknown STT provider",
        features: [],
        limitations: ["Provider not recognized"],
      };
  }
}

  voiceSettings.value = {
    ttsProvider: "system",
    ttsEnabled: false,
    ttsVoice: "",
    sttProvider: "system",
    sttEnabled: false,
    voiceLang: "en-US",
    selectedMicId: "",
    selectedSpeakerId: "",
    voiceMode: false,
    voiceHandsFree: false,
    chatCuesMuted: false,
    kokoroModel: "default",
    kokoroVoice: "af_heart",
    geminiVoice: "",
    geminiApiKey: voiceSettings.value.geminiApiKey, // Keep API key
  };

  logger.info("Voice settings reset to defaults");
}

  let fixed = false;

  // Fix invalid TTS provider
  const validTTSProviders = ["system", "gemini", "kokoro"];
  if (!validTTSProviders.includes(voiceSettings.value.ttsProvider)) {
    voiceSettings.value.ttsProvider = "system";
    fixed = true;
  }

  // Fix Gemini without API key
  if (
    voiceSettings.value.ttsProvider === "gemini" &&
    !isGeminiAvailable.value
  ) {
    voiceSettings.value.ttsProvider = "system";
    fixed = true;
  }

  // Fix invalid STT provider
  const validSTTProviders = ["system", "gemini"];
  if (!validSTTProviders.includes(voiceSettings.value.sttProvider)) {
    voiceSettings.value.sttProvider = "system";
    fixed = true;
  }

  // Fix Gemini STT without API key
  if (
    voiceSettings.value.sttProvider === "gemini" &&
    !isGeminiAvailable.value
  ) {
    voiceSettings.value.sttProvider = "system";
    fixed = true;
  }

  // Fix invalid speech settings
  if (
    typeof voiceSettings.value.speechRate !== "number" ||
  ) {
    fixed = true;
  }

  if (
    typeof voiceSettings.value.speechPitch !== "number" ||
  ) {
    fixed = true;
  }

  if (
    typeof voiceSettings.value.speechVolume !== "number" ||
  ) {
    fixed = true;
  }

  if (fixed) {
    logger.info("Fixed invalid voice settings");
  }

  return fixed;
}

// Initialize voice settings on import
loadVoiceSettings();
fixInvalidSettings();

  return {
    // Reactive state
    voiceSettings,

    // Computed properties
    isGeminiAvailable,
    canUseGeminiTTS,
    canUseGeminiSTT,
    effectiveTTSProvider,
    effectiveSTTProvider,

    // Settings management
    loadVoiceSettings,
    saveVoiceSettings,

    updateTTSProvider,
    updateSTTProvider,
    updateSpeechSettings,
    updateDeviceSettings,

    // Voice mode
    enableVoiceMode,
    disableVoiceMode,
    toggleVoiceMode,

    // Provider info
    getTTSProviderInfo,
    getSTTProviderInfo,

    // Validation
    validateTTSProvider,
    validateSTTProvider,

    resetToDefaults,
    fixInvalidSettings,
  };
}

export default useVoiceConfig;
