
import { logger } from "@/shared/utils/logger";
import type { AudioProcessingConfig } from "@/shared/types/multimodal-live";

interface AudioStreamEvents {
  "recording-start": () => void;
  "recording-stop": () => void;
  "volume-change": (volume: number) => void;
  "device-change": (devices: MediaDeviceInfo[]) => void;
  "permission-denied": () => void;
  error: (error: Error) => void;
}

interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  volume: number;
  devices: MediaDeviceInfo[];
  selectedDeviceId?: string;
}

export class AudioStreamingService extends EventEmitter<AudioStreamEvents> {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private workletNode: AudioWorkletNode | null = null;

  private config: AudioProcessingConfig;
  private state: AudioRecordingState = {
    isRecording: false,
    isPaused: false,
    devices: [],
  };

  private volumeUpdateInterval: number | null = null;
  private workletSupported = false;

  constructor(config: Partial<AudioProcessingConfig> = {}) {
    super();

    this.config = {
      mimeType: "audio/pcm",
      ...config,
    };

    this.checkWorkletSupported();
    this.setupDeviceMonitoring();
  }

  async initialize(): Promise<void> {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Clean up test stream
      stream.getTracks().forEach((track) => track.stop());

      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
      });

      // Note: AudioContext will be resumed when recording starts
      // This prevents the "AudioContext was not allowed to start" warning

      // Load worklet if supported
      if (this.workletSupported) {
        await this.loadAudioWorklet();
      }

      // Get available devices
      await this.updateDeviceList();

      logger.info("[AudioStreamingService] Initialized successfully");
    } catch (_error) {
      logger.error("[AudioStreamingService] Initialization failed:", error);

      if (
        (typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name: string }).name === "NotAllowedError") ||
        (error as { name: string }).name === "PermissionDeniedError"
      ) {
        this.emit("permission-denied");
      }

      const errorMessage =
        error instanceof Error ? error.message : String(_error);
      throw new Error(`Audio initialization failed: ${errorMessage}`);
    }
  }

  async startRecording(deviceId?: string): Promise<void> {
    if (this.state.isRecording) {
      return;
    }

    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      // Resume AudioContext if suspended (requires user gesture)
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Get media stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId || this.state.selectedDeviceId,
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio nodes
      this.sourceNode = this.audioContext!.createMediaStreamSource(
        this.mediaStream,
      );
      this.analyserNode = this.audioContext!.createAnalyser();

      // Use worklet if available, otherwise fallback to script processor
      if (this.workletSupported && this.workletNode) {
        this.sourceNode.connect(this.analyserNode);
        this.analyserNode.connect(this.workletNode);
        this.workletNode.connect(this.audioContext!.destination);

        // Handle worklet messages
        this.workletNode.port.onmessage = (event) => {
          if (event.data.type === "audioData") {
            this.handleAudioData(event.data.audioData);
          }
        };
      } else {
        // Fallback to ScriptProcessorNode
        this.processorNode = this.audioContext!.createScriptProcessor(
          this.config.bufferSize,
          this.config.channels,
          this.config.channels,
        );

        this.processorNode.onaudioprocess = (event) => {
        };

        this.sourceNode.connect(this.analyserNode);
        this.analyserNode.connect(this.processorNode);
        this.processorNode.connect(this.audioContext!.destination);
      }

      // Start recording
      this.state.isRecording = true;
      this.state.isPaused = false;
      this.recordingStartTime = Date.now();
      this.audioBuffer = [];

      // Start volume monitoring
      this.startVolumeMonitoring();

      this.emit("recording-start");
      logger.info("[AudioStreamingService] Recording started");
    } catch (_error) {
      logger.error("[AudioStreamingService] Failed to start recording:", error);
      this.emit("error", error as Error);
      throw error;
    }
  }

  stopRecording(): void {
    if (!this.state.isRecording) {
      return;
    }

    try {
      // Stop all tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }

      // Disconnect nodes
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }

      if (this.processorNode) {
        this.processorNode.disconnect();
        this.processorNode = null;
      }

      if (this.workletNode) {
        this.workletNode.disconnect();
      }

      if (this.analyserNode) {
        this.analyserNode.disconnect();
        this.analyserNode = null;
      }

      // Stop volume monitoring
      this.stopVolumeMonitoring();

      // Update state
      this.state.isRecording = false;
      this.state.isPaused = false;

      this.emit("recording-stop");
      logger.info("[AudioStreamingService] Recording stopped");
    } catch (_error) {
      logger.error("[AudioStreamingService] Failed to stop recording:", error);
      this.emit("error", error as Error);
    }
  }

  togglePause(): void {
    if (!this.state.isRecording) {
      return;
    }

    this.state.isPaused = !this.state.isPaused;

    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.state.isPaused;
      });
    }

    logger.info(
      `[AudioStreamingService] Recording ${this.state.isPaused ? "paused" : "resumed"}`,
    );
  }

  getState(): AudioRecordingState {
    return { ...this.state };
  }

  async getDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audioinput");
    } catch (_error) {
      logger.error("[AudioStreamingService] Failed to get devices:", error);
      return [];
    }
  }

  setDevice(deviceId: string): void {
    this.state.selectedDeviceId = deviceId;

    // Restart recording with new device if currently recording
    if (this.state.isRecording) {
      this.stopRecording();
    }
  }

      return "";
    }

    // Combine all audio chunks
    const totalLength = this.audioBuffer.reduce(
      (sum, chunk) => sum + chunk.length,
    );

    this.audioBuffer.forEach((_chunk) => {
      combinedBuffer.set(_chunk, offset);
      offset += chunk.length;
    });

      );
    }

    let binary = "";
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));

    return btoa(binary);
  }

  destroy(): void {
    this.stopRecording();

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.volumeUpdateInterval) {
      clearInterval(this.volumeUpdateInterval);
      this.volumeUpdateInterval = null;
    }

    this.removeAllListeners();
    logger.info("[AudioStreamingService] Destroyed");
  }

  private checkWorkletSupported(): void {
    this.workletSupported =
      "AudioWorklet" in window && "AudioWorkletNode" in window;
    logger.info(
      `[AudioStreamingService] Audio Worklets ${this.workletSupported ? "supported" : "not supported"}`,
    );
  }

  private async loadAudioWorklet(): Promise<void> {
    if (!this.audioContext || !this.workletSupported) {
      return;
    }

    try {
      // Create worklet source code
      const workletCode = `
        class AudioRecorderProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
              this.port.postMessage({
                type: 'audioData',
              });
            }
            return true;
          }
        }
        registerProcessor('audio-recorder-worklet', AudioRecorderProcessor);
      `;

      const blob = new Blob([workletCode], { type: "application/javascript" });
      const workletUrl = URL.createObjectURL(blob);

      await this.audioContext.audioWorklet.addModule(workletUrl);

      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        "audio-recorder-worklet",
        {
          channelCount: this.config.channels,
        },
      );

      URL.revokeObjectURL(workletUrl);
      logger.info("[AudioStreamingService] Audio worklet loaded");
    } catch (_error) {
      logger.warn(
        "[AudioStreamingService] Failed to load worklet, using fallback:",
        error,
      );
      this.workletSupported = false;
    }
  }

    if (!this.state.isRecording || this.state.isPaused) {
      return;
    }

    // Store audio data

    // Update duration
    this.state.duration = Date.now() - this.recordingStartTime;

    // Emit audio data for real-time processing
    this.emit("audio-data", audioData, this.config.sampleRate);
  }

  private startVolumeMonitoring(): void {
    if (!this.analyserNode) {
      return;
    }

    const bufferLength = this.analyserNode.frequencyBinCount;

    this.volumeUpdateInterval = window.setInterval(() => {
      if (!this.analyserNode || !this.state.isRecording) {
        return;
      }

      this.analyserNode.getByteFrequencyData(dataArray);

      // Calculate RMS volume
      }

      const rms = Math.sqrt(sum / bufferLength);

      this.emit("volume-change", this.state.volume);
  }

  private stopVolumeMonitoring(): void {
    if (this.volumeUpdateInterval) {
      clearInterval(this.volumeUpdateInterval);
      this.volumeUpdateInterval = null;
    }
  }

  private setupDeviceMonitoring(): void {
    if (
      navigator.mediaDevices &&
      navigator.mediaDevices.ondevicechange !== undefined
    ) {
      navigator.mediaDevices.ondevicechange = () => {
        this.updateDeviceList();
      };
    }
  }

  private async updateDeviceList(): Promise<void> {
    try {
      this.state.devices = await this.getDevices();
      this.emit("device-change", this.state.devices);
    } catch (_error) {
      logger.error(
        "[AudioStreamingService] Failed to update device list:",
        error,
      );
    }
  }
}
