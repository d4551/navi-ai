import { logger } from "@/shared/utils/logger";

let routing = {
  ttsProvider: "system",
  sttProvider: "system",
  micDeviceId: "",
  speakerDeviceId: "",
  lang: "en-US",
};

let qualityPrefs = {
  preferredQuality: "balanced",
  adaptiveQuality: true,
  cacheEnabled: true,
  prioritizeLatency: false,
  maxCacheSize: 50,
};

export function setVoiceRoutingPreferences(prefs = {}) {
  routing = { ...routing, ...prefs };
}

export function getVoiceQualityPreferences() {
  return { ...qualityPrefs };
}

export function setVoiceQualityPreferences(prefs = {}) {
  qualityPrefs = { ...qualityPrefs, ...prefs };
}

export function getVoiceService() {
  return {
    speak,
    stopSpeaking,
  };
}

export function speak(text, { voice, rate = 1 } = {}) {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text || "");
      if (voice) utter.voice = voice;
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
      return true;
    }
  } catch (_e) {
    logger.warn("speak() failed", e);
  }
  return false;
}

export function stopSpeaking() {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      return true;
    }
  } catch {}
  return false;
}
