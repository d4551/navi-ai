// Audio Streamer for handling real-time audio output
/// <reference types="vite/client" />
import { logger } from "@/shared/utils/logger";

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private inputNode: any | null = null;
  private gainNode: any | null = null;
  private workletNodes: Map<string, AudioWorkletNode> = new Map();
  private isStreaming = false;
  private readonly bufferSize = 1024;

  constructor(audioContext?: AudioContext) {
    if (audioContext) {
      this.audioContext = audioContext;
    }
  }

  async addWorklet(
    name: string,
    workletClass: any,
  ): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Create worklet node
      const workletNode = new AudioWorkletNode(this.audioContext, name);

      // Set up message handling
      }

      this.workletNodes.set(name, workletNode);

      // Connect to audio destination
      workletNode.connect(this.audioContext.destination);

      logger.debug(`Audio worklet ${name} added to streamer`);
    } catch (_error) {
      logger.error(`Failed to add audio worklet ${name}:`, error);
    }
  }

    if (!this.audioContext || !this.isStreaming) return;

    try {
      // Create audio buffer from PCM data
      const audioBuffer = this.audioContext.createBuffer(
      );

      }

      // Play the audio buffer
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode || this.audioContext.destination);
      source.start();

      logger.debug(`Added PCM audio chunk: ${audioData.length} bytes`);
    } catch (_error) {
      logger.error("Failed to add PCM audio data:", error);
    }
  }

  async start(): Promise<void> {
    if (!this.audioContext) {
      throw new Error("No audio context available");
    }

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Set up gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      this.isStreaming = true;
      logger.info("Audio streamer started");
    } catch (_error) {
      logger.error("Failed to start audio streamer:", error);
      throw error;
    }
  }

  stop(): void {
    if (this.inputNode) {
      this.inputNode.stop();
      this.inputNode = null;
    }

    // Disconnect worklet nodes
    for (const [, workletNode] of this.workletNodes) {
      workletNode.disconnect();
    }

    // Disconnect gain node
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    this.workletNodes.clear();
    this.isStreaming = false;
    logger.info("Audio streamer stopped");
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(
        volume,
      );
    }
  }

  isActive(): boolean {
    return this.isStreaming;
  }

  async cleanup(): Promise<void> {
    this.stop();

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
        this.audioContext = null;
      } catch (_error) {
        logger.error("Failed to close audio context:", error);
      }
    }

    logger.info("Audio streamer cleaned up");
  }
}

export default AudioStreamer;
