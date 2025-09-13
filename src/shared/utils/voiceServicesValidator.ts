
import { logger } from "@/shared/utils/logger";

export interface VoiceServicesCapabilities {
  webSocket: boolean;
  audioContext: boolean;
  getUserMedia: boolean;
  getDisplayMedia: boolean;
  webRTC: boolean;
  mediaRecorder: boolean;
  fullSupport: boolean;
}

export interface VoiceServicesErrors {
  missing: string[];
  warnings: string[];
}

  const capabilities = {
    webSocket: typeof WebSocket !== "undefined",
    audioContext:
      typeof AudioContext !== "undefined" ||
      typeof (window as any).webkitAudioContext !== "undefined",
    getUserMedia: !!(
      navigator.mediaDevices?.getUserMedia || (navigator as any).getUserMedia
    ),
    getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
    webRTC: !!(
      window.RTCPeerConnection || (window as any).webkitRTCPeerConnection
    ),
    mediaRecorder: typeof MediaRecorder !== "undefined",
    fullSupport: false,
  };

  capabilities.fullSupport =
    capabilities.webSocket &&
    capabilities.audioContext &&
    capabilities.getUserMedia;

  return capabilities;
}

  const capabilities = checkVoiceServicesCapabilities();
  const errors: VoiceServicesErrors = {
    missing: [],
    warnings: [],
  };

  if (!capabilities.webSocket) {
    errors.missing.push("WebSocket API not available");
  }

  if (!capabilities.audioContext) {
    errors.missing.push("AudioContext API not available");
  }

  if (!capabilities.getUserMedia) {
    errors.missing.push(
      "getUserMedia API not available - microphone access not supported",
    );
  }

  if (!capabilities.getDisplayMedia) {
    errors.warnings.push(
      "getDisplayMedia API not available - screen capture not supported",
    );
  }

  if (!capabilities.webRTC) {
    errors.warnings.push("WebRTC not available - some features may be limited");
  }

  if (!capabilities.mediaRecorder) {
    errors.warnings.push(
      "MediaRecorder API not available - recording features limited",
    );
  }

  return errors;
}

  success: boolean;
  error?: string;
  requiresUserGesture?: boolean;
}> {
  try {
    let audioContext: AudioContext;

    if (typeof AudioContext !== "undefined") {
      audioContext = new AudioContext();
    } else if (typeof (window as any).webkitAudioContext !== "undefined") {
      audioContext = new (window as any).webkitAudioContext();
    } else {
      return { success: false, error: "AudioContext not supported" };
    }

    // Check if AudioContext is available (don't try to resume without user gesture)
    if (audioContext.state === "suspended") {
      // This is expected behavior - AudioContext requires user interaction
      // We'll consider this as supported but requiring user gesture
      await audioContext.close();
      return { success: true, requiresUserGesture: true };
    }

    // Clean up
    if (audioContext.state !== "closed") {
      await audioContext.close();
    }

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown audio context error",
    };
  }
}

  success: boolean;
  error?: string;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // Clean up immediately
    stream.getTracks().forEach((track) => track.stop());

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Microphone access denied",
    };
  }
}

  success: boolean;
  error?: string;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
    });

    // Clean up immediately
    stream.getTracks().forEach((track) => track.stop());

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Camera access denied",
    };
  }
}

  success: boolean;
  error?: string;
}> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    // Clean up immediately
    stream.getTracks().forEach((track) => track.stop());

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Screen sharing access denied",
    };
  }
}

  options: { invasive?: boolean } = {},
): Promise<{
  capabilities: VoiceServicesCapabilities;
  errors: VoiceServicesErrors;
  tests: {
    audioContext: { success: boolean; error?: string };
    microphone: { success: boolean; error?: string };
    camera: { success: boolean; error?: string };
    screenShare: { success: boolean; error?: string };
  };
}> {
  logger.info("[SEARCH] Running voice services diagnostics...");

  const capabilities = checkVoiceServicesCapabilities();
  const errors = getVoiceServicesErrors();

  const audioContextTest = await testAudioContext();
  // Only perform permission-requesting tests when explicitly asked
  const invasive = options?.invasive === true;
  const microphoneTest = invasive
    ? await testMicrophoneAccess()
    : { success: false, error: "skipped (non-invasive)" };
  const cameraTest = invasive
    ? await testCameraAccess()
    : { success: false, error: "skipped (non-invasive)" };
  const screenShareTest = invasive
    ? await testScreenShareAccess()
    : { success: false, error: "skipped (non-invasive)" };

  const results = {
    capabilities,
    errors,
    tests: {
      audioContext: audioContextTest,
      microphone: microphoneTest,
      camera: cameraTest,
      screenShare: screenShareTest,
    },
  };

  // Log results
  logger.info("Voice Services Diagnostics Results:", {
    fullSupport: capabilities.fullSupport,
    missingFeatures: errors.missing.length,
    warnings: errors.warnings.length,
  });

    logger.error("Missing required features:", errors.missing);
  }

    logger.warn("Optional features not available:", errors.warnings);
  }

  return results;
}

  capabilities: VoiceServicesCapabilities,
): string {
  if (capabilities.fullSupport) {
  }

  const missing = [];
  if (!capabilities.webSocket) missing.push("WebSocket");
  if (!capabilities.audioContext) missing.push("AudioContext");
  if (!capabilities.getUserMedia) missing.push("Microphone");

    return "[WARNING] Voice services supported with some limitations";
  }

}
