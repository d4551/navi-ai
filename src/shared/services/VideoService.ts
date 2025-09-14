
import { logger } from "@/shared/utils/logger";

export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: "videoinput";
}

export interface VideoConstraints {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: "user" | "environment";
}

export interface ScreenShareOptions {
  audio?: boolean;
  video?: boolean;
  displaySurface?: "monitor" | "window" | "browser";
}

export class VideoService {
  private static instance: VideoService;

  private videoStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private isStreaming = false;
  private isScreenSharing = false;

  // Device management
  private availableCameras: VideoDevice[] = [];
  private selectedCameraId: string | null = null;

  // Google AI streaming
  private aiStreamActive = false;
  private streamCallback: ((frame: ImageData) => void) | null = null;

  private constructor() {}

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Non-invasive initialization: do not request camera permission on load
      // Enumerate devices without prompting (labels may be empty until granted)
      await this.enumerateDevices();
      logger.info("Video service initialized (non-invasive)");
    } catch (_error) {
      logger.error("Failed to initialize video service:", error);
      throw error;
    }
  }

  async enumerateDevices(): Promise<VideoDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          kind: device.kind as "videoinput",
        }));

      logger.debug(`Found ${this.availableCameras.length} video devices`);
      return this.availableCameras;
    } catch (_error) {
      logger.error("Failed to enumerate video devices:", error);
      return [];
    }
  }

  async startCamera(constraints: VideoConstraints = {}): Promise<MediaStream> {
    try {
      const videoConstraints: MediaTrackConstraints = {
        deviceId: constraints.deviceId
          ? { exact: constraints.deviceId }
          : undefined,
        facingMode: constraints.facingMode,
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      this.selectedCameraId = constraints.deviceId || null;
      this.isStreaming = true;

      logger.info("Camera started successfully");
      return this.videoStream;
    } catch (_error) {
      logger.error("Failed to start camera:", error);
      throw error;
    }
  }

  async startScreenShare(
    options: ScreenShareOptions = {},
  ): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          displaySurface: options.displaySurface || "monitor",
        } as any,
        audio: options.audio || false,
      };

      this.screenStream =
        await navigator.mediaDevices.getDisplayMedia(constraints);
      this.isScreenSharing = true;

      // Handle screen share stop event
        this.stopScreenShare();
      });

      logger.info("Screen sharing started successfully");
      return this.screenStream;
    } catch (_error) {
      logger.error("Failed to start screen sharing:", error);
      throw error;
    }
  }

  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
      this.isStreaming = false;
      logger.info("Camera stopped");
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
      this.isScreenSharing = false;
      logger.info("Screen sharing stopped");
    }
  }

  captureFrame(videoElement?: HTMLVideoElement): ImageData | null {
    const video = videoElement || this.videoElement;
    if (!video || !this.canvasElement) return null;

    const canvas = this.canvasElement;
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

  }

  async startAIStreaming(
    callback: (frame: ImageData) => void,
  ): Promise<void> {
    if (this.aiStreamActive) {
      throw new Error("AI streaming already active");
    }

    this.streamCallback = callback;
    this.aiStreamActive = true;

    const streamFrame = () => {
      if (!this.aiStreamActive) return;

      const frame = this.captureFrame();
      if (frame && this.streamCallback) {
        this.streamCallback(frame);
      }

      if (this.aiStreamActive) {
      }
    };

    streamFrame();
    logger.info(`AI streaming started at ${fps} FPS`);
  }

  stopAIStreaming(): void {
    this.aiStreamActive = false;
    this.streamCallback = null;
    logger.info("AI streaming stopped");
  }

  setVideoElement(videoElement: HTMLVideoElement): void {
    this.videoElement = videoElement;
  }

  setCanvasElement(canvasElement: HTMLCanvasElement): void {
    this.canvasElement = canvasElement;
  }

  getVideoStream(): MediaStream | null {
    return this.videoStream;
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  isCameraActive(): boolean {
    return this.isStreaming;
  }

  isScreenShareActive(): boolean {
    return this.isScreenSharing;
  }

  getAvailableCameras(): VideoDevice[] {
    return this.availableCameras;
  }

  getSelectedCameraId(): string | null {
    return this.selectedCameraId;
  }

  setSelectedCamera(deviceId: string): void {
    this.selectedCameraId = deviceId;
  }

  cleanup(): void {
    this.stopCamera();
    this.stopScreenShare();
    this.stopAIStreaming();
    this.videoElement = null;
    this.canvasElement = null;
    logger.info("Video service cleaned up");
  }
}

export const videoService = VideoService.getInstance();
