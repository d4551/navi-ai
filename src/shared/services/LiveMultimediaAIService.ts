/**
 * Live Multimedia AI Service - Real-time integration with Gemini AI
 * 
 * Provides live audio, video, and screenshot analysis using Google Gemini AI SDK
 * This connects the UI components to actual AI streaming functionality
 */

import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";
import { MultimodalLiveService } from "./MultimodalLiveService";
import { logger } from "@/shared/utils/logger";

export interface MultimediaAIConfig {
  apiKey: string;
  model?: string;
  enableAudio: boolean;
  enableVideo: boolean;
  enableScreenshot: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface MediaAnalysisResult {
  id: string;
  timestamp: Date;
  type: 'audio' | 'video' | 'image' | 'text';
  content: string;
  confidence?: number;
  metadata?: {
    mediaType?: string;
    duration?: number;
    dimensions?: { width: number; height: number };
    transcription?: string;
  };
}

export interface LiveCallbacks {
  onAudioTranscription?: (_text: string, _isFinal: boolean) => void;
  onVideoAnalysis?: (_analysis: string, _frame?: string) => void;
  onScreenshotAnalysis?: (_analysis: string, _screenshot?: string) => void;
  onResponse?: (_response: MediaAnalysisResult) => void;
  onError?: (_error: Error) => void;
  onConnectionChange?: (_connected: boolean) => void;
}

class LiveMultimediaAIService {
  private static instance: LiveMultimediaAIService;
  
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private chatSession: ChatSession | null = null;
  private multimodalService: MultimodalLiveService | null = null;
  
  private config: MultimediaAIConfig | null = null;
  private callbacks: LiveCallbacks = {};
  private isConnected = false;
  
  // Media streaming states
  private audioStream: MediaStream | null = null;
  private videoStream: MediaStream | null = null;
  private isAudioStreaming = false;
  private isVideoStreaming = false;
  
  // Conversation context
  private conversationHistory: MediaAnalysisResult[] = [];
  private maxHistoryLength = 50;

  private constructor() {}

  static getInstance(): LiveMultimediaAIService {
    if (!LiveMultimediaAIService.instance) {
      LiveMultimediaAIService.instance = new LiveMultimediaAIService();
    }
    return LiveMultimediaAIService.instance;
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(config: MultimediaAIConfig): Promise<void> {
    try {
      if (!config?.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
        const err = new Error('API key is required');
        this.callbacks.onError?.(err);
        throw err;
      }
      this.config = config;
      
      // Initialize Google Generative AI
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: config.model || "gemini-2.5-flash",
        generationConfig: {
          maxOutputTokens: config.maxTokens || 8192,
          temperature: config.temperature || 0.7,
        },
      });
      
      // Initialize multimodal live service for real-time streaming
      if (config.enableAudio || config.enableVideo) {
        this.multimodalService = MultimodalLiveService.getInstance();
        await this.multimodalService.initialize({
          apiKey: config.apiKey,
        });
        this.setupMultimodalCallbacks();
      }

      // Start chat session for context continuity
      this.chatSession = this.model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: config.maxTokens || 8192,
          temperature: config.temperature || 0.7,
        },
      });

      this.isConnected = true;
      this.callbacks.onConnectionChange?.(true);
      
      logger.info("✅ Live Multimedia AI Service initialized successfully");
    } catch (error) {
  logger.error("❌ Failed to initialize Live Multimedia AI Service:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Set up callbacks for multimodal service events
   */
  private setupMultimodalCallbacks(): void {
    if (!this.multimodalService) return;

    this.multimodalService.setCallbacks({
      onConnected: () => {
        this.isConnected = true;
        this.callbacks.onConnectionChange?.(true);
      },
      onDisconnected: () => {
        this.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
      },
      // Forward raw audio (PCM) responses as a response event with type 'audio'
      onAudio: (data: ArrayBuffer) => {
        const result: MediaAnalysisResult = {
          id: `audio-${Date.now()}`,
          timestamp: new Date(),
          type: 'audio',
          content: '',
          metadata: { mediaType: 'audio/pcm', duration: undefined }
        };
        this.addToHistory(result);
        this.callbacks.onResponse?.(result);
      },
      // Extract any text parts produced by the model and emit as assistant responses
      onContent: (content) => {
        try {
          if ((content as any)?.modelTurn?.parts) {
            const parts = (content as any).modelTurn.parts as any[];
            const text = parts
              .filter((p: any) => typeof p?.text === 'string' && p.text.trim().length > 0)
              .map((p: any) => p.text)
              .join(' ');
            if (text && text.trim()) {
              const result: MediaAnalysisResult = {
                id: `ai-${Date.now()}`,
                timestamp: new Date(),
                type: 'text',
                content: text,
                metadata: { mediaType: 'ai-response' }
              };
              this.addToHistory(result);
              this.callbacks.onResponse?.(result);
              // Also surface as a final transcription when in audio mode
              this.callbacks.onAudioTranscription?.(text, true);
            }
          }
        } catch (err) {
          logger.debug('onContent parse error:', err);
        }
      },
      onError: (error) => {
        logger.error("Multimodal service error:", error);
        this.callbacks.onError?.(error);
      }
    });
  }

  /**
   * Start live audio streaming and transcription
   */
  async startAudioStreaming(): Promise<void> {
    if (!this.config?.enableAudio) {
      throw new Error("Audio streaming not enabled in configuration");
    }

    try {
      // Get audio stream from microphone
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Start audio processing with multimodal service
      if (this.multimodalService) {
        await this.multimodalService.connect();
        await this.multimodalService.startStream();
        this.multimodalService.sendAudioStream(this.audioStream);
      }

      this.isAudioStreaming = true;
      logger.info("🎤 Audio streaming started");

      // Transcription and content callbacks are already wired in setupMultimodalCallbacks

    } catch (error) {
      logger.error("Failed to start audio streaming:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop audio streaming
   */
  stopAudioStreaming(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    if (this.multimodalService) {
      this.multimodalService.stopStream();
    }

    this.isAudioStreaming = false;
    logger.info("🎤 Audio streaming stopped");
  }

  /**
   * Start live video streaming and analysis
   */
  async startVideoStreaming(options: { 
    width?: number; 
    height?: number; 
    frameRate?: number; 
  } = {}): Promise<void> {
    if (!this.config?.enableVideo) {
      throw new Error("Video streaming not enabled in configuration");
    }

    try {
      // Get video stream from camera
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: options.width || 1280 },
          height: { ideal: options.height || 720 },
          frameRate: { ideal: options.frameRate || 30 },
        }
      });

      this.isVideoStreaming = true;
      logger.info("📹 Video streaming started");

      // Start real-time video analysis
      this.setupVideoAnalysis();

    } catch (error) {
      logger.error("Failed to start video streaming:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop video streaming
   */
  stopVideoStreaming(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    this.isVideoStreaming = false;
    logger.info("📹 Video streaming stopped");
  }

  /**
   * Capture and analyze screenshot
   */
  async captureAndAnalyzeScreen(prompt?: string): Promise<MediaAnalysisResult> {
    if (!this.config?.enableScreenshot) {
      throw new Error("Screenshot analysis not enabled in configuration");
    }

    try {
      // Capture screen using getDisplayMedia
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise(resolve => video.addEventListener('loadeddata', resolve));

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);

      // Stop screen sharing immediately
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = imageData.split(',')[1];

      // Analyze with Gemini AI
      const analysisPrompt = prompt || "Analyze this screenshot and describe what you see in detail. Focus on any code, interfaces, or important visual elements.";
      
      const result = await this.model?.generateContent([
        analysisPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const analysisResult: MediaAnalysisResult = {
        id: `screenshot-${Date.now()}`,
        timestamp: new Date(),
        type: 'image',
        content: result?.response.text() || 'Unable to analyze screenshot',
        metadata: {
          mediaType: 'screenshot',
          dimensions: { width: canvas.width, height: canvas.height }
        }
      };

      this.addToHistory(analysisResult);
      this.callbacks.onScreenshotAnalysis?.(analysisResult.content, imageData);
      this.callbacks.onResponse?.(analysisResult);

      logger.info("📸 Screenshot captured and analyzed");
      return analysisResult;

    } catch (error) {
      logger.error("Failed to capture and analyze screen:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Send text message with multimedia context
   */
  async sendMessage(message: string): Promise<MediaAnalysisResult> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    try {
      // Include recent multimedia context in the prompt
      const contextualPrompt = this.buildContextualPrompt(message);
      
      const result = await this.chatSession.sendMessage(contextualPrompt);
      const response = result.response.text();

      const messageResult: MediaAnalysisResult = {
        id: `message-${Date.now()}`,
        timestamp: new Date(),
        type: 'text',
        content: response,
        metadata: { mediaType: 'chat-response' }
      };

      this.addToHistory(messageResult);
      this.callbacks.onResponse?.(messageResult);

      return messageResult;

    } catch (error) {
      logger.error("Failed to send message:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Set up real-time audio transcription
   */
  private setupAudioTranscription(): void {
    if (!this.multimodalService) return;

    // Set up transcription callbacks
    this.multimodalService.setCallbacks({
      onConnected: () => {
        this.isConnected = true;
        this.callbacks.onConnectionChange?.(true);
      },
      onDisconnected: () => {
        this.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
      },
      onContent: (content) => {
        // Extract text from multimodal content for transcription
        if ('modelTurn' in content && content.modelTurn?.parts) {
          const textParts = content.modelTurn.parts
            .filter((part: any) => part.text)
            .map((part: any) => part.text)
            .join(' ');

          if (textParts.trim()) {
            // This is transcribed text from the audio
            this.callbacks.onAudioTranscription?.(textParts, true);
          }
        }
      },
      onError: (error) => {
        logger.error("Audio transcription error:", error);
        this.callbacks.onError?.(error);
      }
    });

    logger.info("🎧 Audio transcription setup completed");
  }

  /**
   * Set up real-time video analysis
   */
  private setupVideoAnalysis(): void {
    if (!this.videoStream) return;

    // Analyze video frames at regular intervals
    const analyzeFrame = async () => {
      if (!this.isVideoStreaming || !this.videoStream) return;

      try {
        // Create video element and canvas for frame capture
        const video = document.createElement('video');
        video.srcObject = this.videoStream;
        video.play();

        // Wait a bit for the video to start
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        const base64Data = imageData.split(',')[1];

        // Send for analysis (throttled to avoid too many requests)
        if (Math.random() < 0.1) { // Only analyze ~10% of frames
          const result = await this.model?.generateContent([
            "Briefly describe what you see in this video frame. Focus on important changes or activities.",
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
              }
            }
          ]);

          const analysis = result?.response.text() || '';
          if (analysis) {
            this.callbacks.onVideoAnalysis?.(analysis, imageData);
          }
        }

      } catch (error) {
        logger.debug("Frame analysis error (this is normal):", error);
      }

      // Continue analyzing if still streaming
      if (this.isVideoStreaming) {
        setTimeout(analyzeFrame, 2000); // Analyze every 2 seconds
      }
    };

    // Start frame analysis
    setTimeout(analyzeFrame, 1000);
    logger.info("📹 Video analysis setup completed");
  }

  /**
   * Build contextual prompt including recent multimedia interactions
   */
  private buildContextualPrompt(message: string): string {
    const recentHistory = this.conversationHistory
      .slice(-5) // Last 5 interactions
      .map(item => `[${item.type.toUpperCase()}] ${item.content.substring(0, 200)}`)
      .join('\n');

    if (recentHistory) {
      return `Recent context:\n${recentHistory}\n\nCurrent message: ${message}`;
    }

    return message;
  }

  /**
   * Add result to conversation history
   */
  private addToHistory(result: MediaAnalysisResult): void {
    this.conversationHistory.push(result);
    
    // Keep history manageable
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Set callbacks for events
   */
  setCallbacks(callbacks: LiveCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current connection status
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get streaming states
   */
  getStreamingState(): {
    audio: boolean;
    video: boolean;
    connected: boolean;
  } {
    return {
      audio: this.isAudioStreaming,
      video: this.isVideoStreaming,
      connected: this.isConnected,
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): MediaAnalysisResult[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    this.stopAudioStreaming();
    this.stopVideoStreaming();
    
    if (this.multimodalService) {
      await this.multimodalService.disconnect();
    }
    
    this.isConnected = false;
    this.callbacks.onConnectionChange?.(false);
    
    logger.info("🧹 Live Multimedia AI Service cleaned up");
  }
}

export default LiveMultimediaAIService;
