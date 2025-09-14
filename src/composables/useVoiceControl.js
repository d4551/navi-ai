import { refcomputed, onUnmounted } from "vue";
import { getVoiceService } from "@/utils/voice";

// Encapsulates voice UI state + toggle logic

export function useVoiceControl({ store, toast } = {}) {
  const voiceService = getVoiceService();
  const isVoiceListening = ref(false);
  const isVoiceSpeaking = ref(false);

  const isVoiceSupported = computed(() => {
    try {
      return !!voiceService && voiceService.isSupported;
    } catch {
      return false;
    }
  });

  const isVoiceActive = computed(
    () =>
      isVoiceListening.value ||
      isVoiceSpeaking.value ||
      !!store?.settings?.voiceMode,
  );

  const voiceIcon = computed(() => {
    if (isVoiceListening.value) {
      return "mdi-microphone";
    }
    if (isVoiceSpeaking.value) {
      return "mdi-volume-high";
    }
    if (store?.settings?.voiceMode) {
      return "mdi-microphone";
    }
    return "mdi-microphone-off";
  });

  const voiceControlAria = computed(() => {
    if (isVoiceListening.value) {
      return "Voice listening - Click to stop";
    }
    if (isVoiceSpeaking.value) {
      return "Voice speaking - Click to stop";
    }
    if (store?.settings?.voiceMode) {
      return "Voice mode active - Click to disable";
    }
    return "Voice mode inactive - Click to enable";
  });

  const toggleVoiceMode = () => {
    // Allow enabling setting even if unsupported (e.g., Electron no mic)
    if (!isVoiceSupported.value) {
      const newVoiceMode = !store?.settings?.voiceMode;
      store?.updateSettings?.({ voiceMode: newVoiceMode });
      if (toast) {
        toast(
          newVoiceMode
            ? "Voice mode enabled (no microphone support)"
            : "Voice mode disabled",
        );
      }
      return;
    }

    if (isVoiceListening.value) {
      try {
        voiceService.stopRecording();
      } catch {}
      isVoiceListening.value = false;
    } else if (isVoiceSpeaking.value) {
      try {
        voiceService.stopSpeaking();
      } catch {}
      isVoiceSpeaking.value = false;
    } else {
      const newVoiceMode = !store?.settings?.voiceMode;
      store?.updateSettings?.({ voiceMode: newVoiceMode });
      if (toast) {
        toast(newVoiceMode ? "Voice mode enabled" : "Voice mode disabled");
      }
    }
  };

  let voiceListenStartHandler,
    voiceListenStopHandler,
    voiceSpeakStartHandler,
    voiceSpeakStopHandler;

  onMounted(() => {
    // Voice activity tracking via custom events
    voiceListenStartHandler = () => {
      isVoiceListening.value = true;
    };
    voiceListenStopHandler = () => {
      isVoiceListening.value = false;
    };
    voiceSpeakStartHandler = () => {
      isVoiceSpeaking.value = true;
    };
    voiceSpeakStopHandler = () => {
      isVoiceSpeaking.value = false;
    };
    window.addEventListener("voice-listening-start", voiceListenStartHandler);
    window.addEventListener("voice-listening-stop", voiceListenStopHandler);
    window.addEventListener("voice-speaking-start", voiceSpeakStartHandler);
    window.addEventListener("voice-speaking-stop", voiceSpeakStopHandler);
  });

  onUnmounted(() => {
    try {
      window.removeEventListener(
        "voice-listening-start",
        voiceListenStartHandler,
      );
    } catch {}
    try {
      window.removeEventListener(
        "voice-listening-stop",
        voiceListenStopHandler,
      );
    } catch {}
    try {
      window.removeEventListener(
        "voice-speaking-start",
        voiceSpeakStartHandler,
      );
    } catch {}
    try {
      window.removeEventListener("voice-speaking-stop", voiceSpeakStopHandler);
    } catch {}
  });

  return {
    isVoiceSupported,
    isVoiceActive,
    voiceIcon,
    voiceControlAria,
    toggleVoiceMode,
    isVoiceListening,
    isVoiceSpeaking,
  };
}
