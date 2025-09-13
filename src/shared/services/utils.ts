
import { logger } from "@/shared/utils/logger";

// Keep track of created AudioContexts so we can resume them after a user gesture
const __audioContexts: AudioContext[] = [];

export async function getAudioContext(options?: {
  id?: string;
}): Promise<AudioContext | undefined> {
  try {
    // Check for AudioContext support
    if (typeof AudioContext !== "undefined") {
      const ctx = new AudioContext();
      try {
        __audioContexts.push(ctx);
      } catch {}
      return ctx;
    } else if (typeof (window as any).webkitAudioContext !== "undefined") {
      const ctx = new (window as any).webkitAudioContext();
      try {
        __audioContexts.push(ctx);
      } catch {}
      return ctx;
    } else {
      logger.warn("AudioContext not supported in this environment");
      return undefined;
    }
  } catch (_error) {
    logger.error("Failed to create audio context:", error);
    return undefined;
  }
}

export async function resumeAllAudioContexts(): Promise<void> {
  try {
    const tasks: Promise<any>[] = [];
    for (const ctx of __audioContexts) {
      if (
        ctx &&
        ctx.state === "suspended"
      ) {
        tasks.push(ctx.resume().catch(() => undefined));
      }
    }
    await Promise.all(tasks);
    if (tasks.length) {
      logger.info(
        `Resumed ${tasks.length} audio context(s) after user gesture`,
      );
    }
  } catch (e) {
    logger.debug("resumeAllAudioContexts failed (non-critical):", e);
  }
}

export async function readBlobAsJSON(blob: Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === "string") {
          resolve(JSON.parse(reader.result));
        } else {
          reject(new Error("Failed to read blob as text"));
        }
      } catch (_error) {
        reject(_error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsText(blob);
  });
}

    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

export const isWebRTCSupported =
  isBrowser &&
  !!(
    window.RTCPeerConnection ||
    (window as any).webkitRTCPeerConnection ||
    (window as any).mozRTCPeerConnection
  );

export const isWebSocketSupported = typeof WebSocket !== "undefined";

export const isGetUserMediaSupported =
  isBrowser &&
  !!(
    navigator.mediaDevices?.getUserMedia ||
    (navigator as any).webkitGetUserMedia ||
    (navigator as any).mozGetUserMedia ||
    (navigator as any).msGetUserMedia
  );

export const isMediaRecorderSupported = typeof MediaRecorder !== "undefined";
