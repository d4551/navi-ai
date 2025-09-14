// Utility functions for multimodal live API
import { logger } from '@/shared/utils/logger';

// Keep track of created AudioContexts so we can resume them after a user gesture
const __audioContexts: AudioContext[] = [];

/**
 * Simple audio context creation utility
 */
export async function audioContext(options?: { id?: string }): Promise<AudioContext | undefined> {
  try {
    // Check for AudioContext support
    if (typeof AudioContext !== 'undefined') {
      const ctx = new AudioContext();
      try { __audioContexts.push(ctx) } catch {}
      return ctx;
    } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
      const ctx = new (window as any).webkitAudioContext();
      try { __audioContexts.push(ctx) } catch {}
      return ctx;
    } else {
      logger.warn('AudioContext not supported in this environment');
      return undefined;
    }
  } catch (error) {
    logger.error('Failed to create audio context:', error);
    return undefined;
  }
}

/**
 * Resume all known AudioContexts (called on first user gesture)
 */
export async function resumeAllAudioContexts(): Promise<void> {
  try {
    const tasks: Promise<any>[] = []
    for (const ctx of __audioContexts) {
      if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        tasks.push(ctx.resume().catch(() => undefined))
      }
    }
    await Promise.all(tasks)
    if (tasks.length) {
      logger.info(`Resumed ${tasks.length} audio context(s) after user gesture`)
    }
  } catch (e) {
    logger.debug('resumeAllAudioContexts failed (non-critical):', e)
  }
}

/**
 * Convert blob to JSON
 */
export async function blobToJSON(blob: Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          resolve(JSON.parse(reader.result));
        } else {
          reject(new Error('Failed to read blob as text'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsText(blob);
  });
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if running in browser environment
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Check WebRTC support
 */
export const isWebRTCSupported = isBrowser && !!(
  window.RTCPeerConnection ||
  (window as any).webkitRTCPeerConnection ||
  (window as any).mozRTCPeerConnection
);

/**
 * Check WebSocket support
 */
export const isWebSocketSupported = typeof WebSocket !== 'undefined';

/**
 * Check getUserMedia support
 */
export const isGetUserMediaSupported = isBrowser && !!(
  navigator.mediaDevices?.getUserMedia ||
  (navigator as any).webkitGetUserMedia ||
  (navigator as any).mozGetUserMedia ||
  (navigator as any).msGetUserMedia
);

/**
 * Check MediaRecorder support
 */
export const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined';
