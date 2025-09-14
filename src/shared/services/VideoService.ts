/**
 * Video Service - Handles camera and screen capture for Google AI integration
 * Provides real-time video streaming capabilities with Google Generative AI
 */

import { logger } from '@/shared/utils/logger';

export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
}

export interface VideoConstraints {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: 'user' | 'environment';
}

export interface ScreenShareOptions {
  audio?: boolean;
  video?: boolean;
  displaySurface?: 'monitor' | 'window' | 'browser';
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

  /**
   * Initialize video service and enumerate devices
   */
  async initialize(): Promise<void> {
    try {
      // Non-invasive initialization: do not request camera permission on load
      // Enumerate devices without prompting (labels may be empty until granted)
      await this.enumerateDevices();
      logger.info('Video service initialized (non-invasive)');
    } catch (error) {
      logger.error('Failed to initialize video service:', error);
      throw error;
    }
  }

  /**
   * Enumerate available video devices
   */
  async enumerateDevices(): Promise<VideoDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(-4)}`,
          kind: device.kind as 'videoinput'
        }));

      logger.debug(`Found ${this.availableCameras.length} video devices`);
      return this.availableCameras;
    } catch (error) {
      logger.error('Failed to enumerate video devices:', error);
      return [];
    }
  }

  /**
   * Start camera capture
   */
  async startCamera(constraints: VideoConstraints = {}): Promise<MediaStream> {
    try {
      const videoConstraints: MediaTrackConstraints = {
        deviceId: constraints.deviceId ? { exact: constraints.deviceId } : undefined,
        width: { ideal: constraints.width || 1280 },
        height: { ideal: constraints.height || 720 },
        frameRate: { ideal: constraints.frameRate || 30 },
        facingMode: constraints.facingMode
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      this.selectedCameraId = constraints.deviceId || null;
      this.isStreaming = true;

      logger.info('Camera started successfully');
      return this.videoStream;
    } catch (error) {
      logger.error('Failed to start camera:', error);
      throw error;
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(options: ScreenShareOptions = {}): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          displaySurface: options.displaySurface || 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } as any,
        audio: options.audio || false
      };

      this.screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      this.isScreenSharing = true;

      // Handle screen share stop event
      this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

      logger.info('Screen sharing started successfully');
      return this.screenStream;
    } catch (error) {
      logger.error('Failed to start screen sharing:', error);
      throw error;
    }
  }

  /**
   * Stop camera capture
   */
  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
      this.isStreaming = false;
      logger.info('Camera stopped');
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
      this.isScreenSharing = false;
      logger.info('Screen sharing stopped');
    }
  }

  /**
   * Capture current frame as ImageData for AI processing
   */
  captureFrame(videoElement?: HTMLVideoElement): ImageData | null {
    const video = videoElement || this.videoElement;
    if (!video || !this.canvasElement) return null;

    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Start real-time streaming to Google AI
   */
  async startAIStreaming(callback: (frame: ImageData) => void, fps: number = 10): Promise<void> {
    if (this.aiStreamActive) {
      throw new Error('AI streaming already active');
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
        setTimeout(streamFrame, 1000 / fps);
      }
    };

    streamFrame();
    logger.info(`AI streaming started at ${fps} FPS`);
  }

  /**
   * Stop AI streaming
   */
  stopAIStreaming(): void {
    this.aiStreamActive = false;
    this.streamCallback = null;
    logger.info('AI streaming stopped');
  }

  /**
   * Set video element for frame capture
   */
  setVideoElement(videoElement: HTMLVideoElement): void {
    this.videoElement = videoElement;
  }

  /**
   * Set canvas element for frame processing
   */
  setCanvasElement(canvasElement: HTMLCanvasElement): void {
    this.canvasElement = canvasElement;
  }

  /**
   * Get current camera stream
   */
  getVideoStream(): MediaStream | null {
    return this.videoStream;
  }

  /**
   * Get current screen share stream
   */
  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  /**
   * Check if camera is streaming
   */
  isCameraActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Check if screen sharing is active
   */
  isScreenShareActive(): boolean {
    return this.isScreenSharing;
  }

  /**
   * Get available cameras
   */
  getAvailableCameras(): VideoDevice[] {
    return this.availableCameras;
  }

  /**
   * Get selected camera ID
   */
  getSelectedCameraId(): string | null {
    return this.selectedCameraId;
  }

  /**
   * Set selected camera
   */
  setSelectedCamera(deviceId: string): void {
    this.selectedCameraId = deviceId;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stopCamera();
    this.stopScreenShare();
    this.stopAIStreaming();
    this.videoElement = null;
    this.canvasElement = null;
    logger.info('Video service cleaned up');
  }
}

export const videoService = VideoService.getInstance();
