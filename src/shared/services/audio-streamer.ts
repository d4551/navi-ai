// Audio Streamer for handling real-time audio output
import { logger } from '@/shared/utils/logger';

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private inputNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private workletNodes: Map<string, AudioWorkletNode> = new Map();
  private isStreaming = false;
  private readonly bufferSize = 1024;

  constructor(audioContext?: AudioContext) {
    if (audioContext) {
      this.audioContext = audioContext;
    }
  }

  /**
   * Add a worklet to the audio processing chain
   */
  async addWorklet<T>(
    name: string,
    workletClass: any,
    processorFunction?: (event: any) => void
  ): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Create worklet node
      const workletNode = new AudioWorkletNode(this.audioContext, name);

      // Set up message handling
      if (processorFunction) {
        workletNode.port.onmessage = (event) => processorFunction(event);
      }

      this.workletNodes.set(name, workletNode);

      // Connect to audio destination
      workletNode.connect(this.audioContext.destination);

      logger.debug(`Audio worklet ${name} added to streamer`);
    } catch (error) {
      logger.error(`Failed to add audio worklet ${name}:`, error);
    }
  }

  /**
   * Add PCM audio data to the stream
   */
  async addPCM16(audioData: Uint8Array): Promise<void> {
    if (!this.audioContext || !this.isStreaming) return;

    try {
      // Create audio buffer from PCM data
      const audioBuffer = this.audioContext.createBuffer(1, audioData.length / 2, 16000);
      const channelData = audioBuffer.getChannelData(0);

      // Convert 16-bit PCM to float32
      for (let i = 0; i < audioData.length; i += 2) {
        const sample = (audioData[i] | (audioData[i + 1] << 8)) / 32768;
        channelData[i / 2] = sample;
      }

      // Play the audio buffer
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode || this.audioContext.destination);
      source.start();

      logger.debug(`Added PCM audio chunk: ${audioData.length} bytes`);
    } catch (error) {
      logger.error('Failed to add PCM audio data:', error);
    }
  }

  /**
   * Start streaming
   */
  async start(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('No audio context available');
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Set up gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
      this.gainNode.connect(this.audioContext.destination);

      this.isStreaming = true;
      logger.info('Audio streamer started');
    } catch (error) {
      logger.error('Failed to start audio streamer:', error);
      throw error;
    }
  }

  /**
   * Stop streaming and clean up
   */
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
    logger.info('Audio streamer stopped');
  }

  /**
   * Set volume level
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext?.currentTime || 0);
    }
  }

  /**
   * Get current streaming status
   */
  isActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    this.stop();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
        this.audioContext = null;
      } catch (error) {
        logger.error('Failed to close audio context:', error);
      }
    }

    logger.info('Audio streamer cleaned up');
  }
}

export default AudioStreamer;
