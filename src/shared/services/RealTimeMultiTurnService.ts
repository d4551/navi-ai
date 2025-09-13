
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/shared/utils/logger";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface MultiTurnSession {
  id: string;
  type: "audio" | "video" | "screen" | "multimodal";
  isActive: boolean;
  startTime: Date;
  messageCount: number;
  lastActivity: Date;
}

export interface RealTimeMessage {
  id: string;
  timestamp: Date;
  role: "user" | "assistant";
  content: string;
  type: "text" | "audio" | "video" | "screen";
  audioData?: ArrayBuffer;
  duration?: number;
}

export interface RealTimeCallbacks {
  onMessage?: (message: RealTimeMessage) => void;
  onTranscription?: (text: string, isFinal: boolean) => void;
  onAudioResponse?: (audioData: ArrayBuffer) => void;
  onSessionStart?: (session: MultiTurnSession) => void;
  onSessionEnd?: (session: MultiTurnSession) => void;
  onError?: (error: Error) => void;
  onVolumeLevel?: (level: number) => void;
}

export interface RealTimeConfig {
  model?: string;
  audioSampleRate?: number;
  videoFps?: number;
  enableAudioInput?: boolean;
  enableAudioOutput?: boolean;
  enableVideo?: boolean;
  enableScreen?: boolean;
  systemPrompt?: string;
  conversationMemory?: number; // Number of previous messages to keep in context
  pushToTalk?: boolean;
  voiceActivation?: {
    enabled: boolean;
    threshold: number;
    silenceTimeout: number;
  };
}

export class RealTimeMultiTurnService {
  private static instance: RealTimeMultiTurnService;

  private genAI: GoogleGenerativeAI | null = null;
  private currentSession: MultiTurnSession | null = null;
  private conversation: RealTimeMessage[] = [];
  private isInitialized = false;
  private callbacks: RealTimeCallbacks = {};
  private config: RealTimeConfig = {};

  // Audio processing
  private audioContext: AudioContext | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isListening = false;
  private speechRecognition: SpeechRecognition | null = null;

  // Video/Screen processing
  private videoStreamActive = false;
  private screenStreamActive = false;
  private frameProcessingInterval: number | null = null;

  // Voice activation
  private silenceTimer: number | null = null;
  private isUserSpeaking = false;

  private constructor() {}

  static getInstance(): RealTimeMultiTurnService {
    if (!RealTimeMultiTurnService.instance) {
      RealTimeMultiTurnService.instance = new RealTimeMultiTurnService();
    }
    return RealTimeMultiTurnService.instance;
  }

  async initialize(apiKey: string, config: RealTimeConfig = {}): Promise<void> {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.config = {
        enableAudioInput: true,
        enableAudioOutput: true,
        enableVideo: false,
        enableScreen: false,
        pushToTalk: false,
        systemPrompt:
          "You are NAVI, an AI assistant for gaming career transitions. You can see, hear, and respond naturally in real-time conversations.",
        voiceActivation: {
          enabled: true,
        },
        ...config,
      };

      // Initialize speech recognition if supported
      if (
        "webkitSpeechRecognition" in window ||
        "SpeechRecognition" in window
      ) {
        const SpeechRecognition =
          (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        this.speechRecognition = new SpeechRecognition();
        this.setupSpeechRecognition();
      }

      // Initialize audio context
      this.audioContext = new AudioContext();

      this.isInitialized = true;
      logger.info("Real-Time Multi-Turn Service initialized");
    } catch (error) {
      logger.error("Failed to initialize Real-Time Multi-Turn Service:", error);
      throw error;
    }
  }

  async startSession(
    type: MultiTurnSession["type"],
    callbacks: RealTimeCallbacks = {},
  ): Promise<MultiTurnSession> {
    if (!this.isInitialized) {
      throw new Error("Service not initialized");
    }

    // Stop any existing session
    if (this.currentSession?.isActive) {
      await this.stopSession();
    }

    // Create new session
    this.currentSession = {
      id: `session-${Date.now()}`,
      type,
      isActive: true,
      startTime: new Date(),
      lastActivity: new Date(),
    };

    this.callbacks = callbacks;
    this.conversation = [];

    try {
      // Start appropriate media streams based on session type
      switch (type) {
        case "audio":
          await this.startAudioSession();
          break;
        case "video":
          await this.startVideoSession();
          break;
        case "screen":
          await this.startScreenSession();
          break;
        case "multimodal":
          await this.startMultimodalSession();
          break;
      }

      // Start listening for user input
      await this.startListening();

      this.callbacks.onSessionStart?.(this.currentSession);
      logger.info(`Started ${type} session:`, this.currentSession.id);

      return this.currentSession;
    } catch (error) {
      this.currentSession.isActive = false;
      logger.error("Failed to start session:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async stopSession(): Promise<void> {
    if (!this.currentSession?.isActive) return;

    try {
      // Stop listening
      await this.stopListening();

      // Stop media streams
      this.stopAudioCapture();
      this.stopVideoCapture();
      this.stopScreenCapture();

      // Clear timers
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      if (this.frameProcessingInterval) {
        clearInterval(this.frameProcessingInterval);
        this.frameProcessingInterval = null;
      }

      const stoppedSession = { ...this.currentSession };
      this.currentSession!.isActive = false;

      this.callbacks.onSessionEnd?.(stoppedSession);
      logger.info(`Session ${stoppedSession.id} ended`);
    } catch (error) {
      logger.error("Error stopping session:", error);
      this.callbacks.onError?.(error as Error);
    }
  }

  async sendMessage(
    content: string,
    type: "text" | "audio" = "text",
  ): Promise<void> {
    if (!this.currentSession?.isActive) {
      throw new Error("No active session");
    }

    try {
      // Create user message
      const userMessage: RealTimeMessage = {
        id: `msg-${Date.now()}`,
        timestamp: new Date(),
        role: "user",
        content,
        type,
      };

      this.addMessage(userMessage);

      // Generate AI response with conversation context
      const response = await this.generateResponse(content);

      // Create assistant message
      const assistantMessage: RealTimeMessage = {
        id: `msg-${Date.now()}-ai`,
        timestamp: new Date(),
        role: "assistant",
        content: response,
        type: "text",
      };

      this.addMessage(assistantMessage);

      // Handle audio output if enabled
      if (this.config.enableAudioOutput && response) {
        await this.generateAudioResponse(response);
      }
    } catch (error) {
      logger.error("Error sending message:", error);
      this.callbacks.onError?.(error as Error);
    }
  }

  async sendAudioData(audioData: ArrayBuffer): Promise<void> {
    if (!this.currentSession?.isActive) return;

    try {

      // Use Gemini's audio processing capabilities
      const model = this.genAI?.getGenerativeModel({
      });

      if (model) {
        const result = await model.generateContent([
          "Transcribe this audio and respond naturally:",
          {
            inlineData: {
              mimeType: "audio/wav",
            },
          },
        ]);

        const response = result.response.text();

        // Extract transcription and response
        const lines = response.split("\n");

        // Handle transcription
        if (transcription) {
          this.callbacks.onTranscription?.(transcription, true);

          const userMessage: RealTimeMessage = {
            id: `audio-${Date.now()}`,
            timestamp: new Date(),
            role: "user",
            content: transcription,
            type: "audio",
            audioData,
          };

          this.addMessage(userMessage);
        }

        // Handle AI response
        if (aiResponse) {
          const assistantMessage: RealTimeMessage = {
            id: `ai-${Date.now()}`,
            timestamp: new Date(),
            role: "assistant",
            content: aiResponse,
            type: "text",
          };

          this.addMessage(assistantMessage);

          // Generate audio response if enabled
          if (this.config.enableAudioOutput) {
            await this.generateAudioResponse(aiResponse);
          }
        }
      }
    } catch (error) {
      logger.error("Error processing audio data:", error);
      this.callbacks.onError?.(error as Error);
    }
  }

  async sendImageData(imageData: string, prompt?: string): Promise<void> {
    if (!this.currentSession?.isActive) return;

    try {
      const model = this.genAI?.getGenerativeModel({
      });

      if (model) {
        const analysisPrompt =
          prompt || "Analyze this image and respond naturally:";

        const result = await model.generateContent([
          analysisPrompt,
          {
            inlineData: {
              data: imageData,
              mimeType: "image/jpeg",
            },
          },
        ]);

        const response = result.response.text();

        const assistantMessage: RealTimeMessage = {
          id: `vision-${Date.now()}`,
          timestamp: new Date(),
          role: "assistant",
          content: response,
          type: "video",
        };

        this.addMessage(assistantMessage);

        // Generate audio response if enabled
        if (this.config.enableAudioOutput) {
          await this.generateAudioResponse(response);
        }
      }
    } catch (error) {
      logger.error("Error processing image data:", error);
      this.callbacks.onError?.(error as Error);
    }
  }

  getCurrentSession(): MultiTurnSession | null {
    return this.currentSession;
  }

  getConversationHistory(): RealTimeMessage[] {
    return [...this.conversation];
  }

  clearConversation(): void {
    this.conversation = [];
    logger.info("Conversation history cleared");
  }


  private async startAudioSession(): Promise<void> {
    if (!this.config.enableAudioInput) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.audioSampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      await this.setupAudioProcessing(stream);
      logger.info("Audio session started");
    } catch (error) {
      logger.error("Failed to start audio session:", error);
      throw error;
    }
  }

  private async startVideoSession(): Promise<void> {
    if (!this.config.enableVideo) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate: { ideal: this.config.videoFps },
        },
      });

      this.setupVideoProcessing(stream);
      this.videoStreamActive = true;
      logger.info("Video session started");
    } catch (error) {
      logger.error("Failed to start video session:", error);
      throw error;
    }
  }

  private async startScreenSession(): Promise<void> {
    if (!this.config.enableScreen) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      this.setupScreenProcessing(stream);
      this.screenStreamActive = true;
      logger.info("Screen session started");
    } catch (error) {
      logger.error("Failed to start screen session:", error);
      throw error;
    }
  }

  private async startMultimodalSession(): Promise<void> {
    // Start all supported modalities
    const promises = [];

    if (this.config.enableAudioInput) {
      promises.push(this.startAudioSession());
    }

    if (this.config.enableVideo) {
      promises.push(this.startVideoSession());
    }

    if (this.config.enableScreen) {
      promises.push(this.startScreenSession());
    }

    await Promise.all(promises);
    logger.info("Multimodal session started");
  }

  private async setupAudioProcessing(stream: MediaStream): Promise<void> {
    if (!this.audioContext) return;

    const source = this.audioContext.createMediaStreamSource(stream);

    this.processorNode.onaudioprocess = (event) => {
      if (!this.isListening) return;

      const inputBuffer = event.inputBuffer;

      // Calculate audio level for UI feedback
      }
      const rms = Math.sqrt(sum / inputData.length);

      this.callbacks.onVolumeLevel?.(level);

      // Voice activation detection
      if (this.config.voiceActivation?.enabled) {
        this.handleVoiceActivation(level);
      }

      // Process audio if above threshold or push-to-talk is active
      if (this.shouldProcessAudio(level)) {
        this.processAudioFrame(inputData);
      }
    };

    source.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
  }

  private setupVideoProcessing(stream: MediaStream): void {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    // Process frames at specified FPS

    this.frameProcessingInterval = window.setInterval(async () => {
      if (!this.videoStreamActive) return;

      try {
        const canvas = document.createElement("canvas");



        await this.sendImageData(
          "What do you see in this video frame?",
        );
      } catch (error) {
        logger.debug("Frame processing error:", error);
      }
    }, frameInterval);
  }

  private setupScreenProcessing(stream: MediaStream): void {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    // Process screen captures less frequently
    this.frameProcessingInterval = window.setInterval(async () => {
      if (!this.screenStreamActive) return;

      try {
        const canvas = document.createElement("canvas");



        await this.sendImageData(
          "Analyze what's on the screen and provide insights:",
        );
      } catch (error) {
        logger.debug("Screen processing error:", error);
      }
  }

  private setupSpeechRecognition(): void {
    if (!this.speechRecognition) return;

    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = "en-US";

    this.speechRecognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const isFinal = result.isFinal;

        this.callbacks.onTranscription?.(transcript, isFinal);

        if (isFinal) {
          this.sendMessage(transcript, "audio");
        }
      }
    };

    this.speechRecognition.onerror = (event) => {
      logger.error("Speech recognition error:", event.error);
      this.callbacks.onError?.(
        new Error(`Speech recognition error: ${event.error}`),
      );
    };

    this.speechRecognition.onend = () => {
      // Auto-restart if session is still active
      if (this.currentSession?.isActive && this.isListening) {
        setTimeout(() => {
          this.speechRecognition?.start();
      }
    };
  }

  private async startListening(): Promise<void> {
    this.isListening = true;

    // Start speech recognition if available and not using audio processing
    if (this.speechRecognition && !this.config.enableAudioInput) {
      try {
        this.speechRecognition.start();
      } catch {
        logger.warn("Speech recognition already active");
      }
    }
  }

  private async stopListening(): Promise<void> {
    this.isListening = false;

    // Stop speech recognition
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

  private handleVoiceActivation(level: number): void {

    if (level > threshold) {
      // User is speaking
      if (!this.isUserSpeaking) {
        this.isUserSpeaking = true;
        logger.debug("Voice activation: User started speaking");
      }

      // Clear silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    } else if (this.isUserSpeaking) {
      // Start silence timer
      if (!this.silenceTimer) {
        this.silenceTimer = window.setTimeout(() => {
          this.isUserSpeaking = false;
          logger.debug("Voice activation: User stopped speaking");
        }, silenceTimeout);
      }
    }
  }

  private shouldProcessAudio(level: number): boolean {
    if (this.config.pushToTalk) {
      // Would need push-to-talk state management
      return false;
    }

    if (this.config.voiceActivation?.enabled) {
      return this.isUserSpeaking;
    }

  }

    // Convert to ArrayBuffer for processing
    const view = new DataView(buffer);

    }

    // Send for processing (throttled to avoid too many calls)
      this.sendAudioData(buffer);
    }
  }

  private async generateResponse(input: string): Promise<string> {
    try {
      const model = this.genAI?.getGenerativeModel({
      });

      if (!model) throw new Error("AI model not available");

      // Build context from recent conversation
      const contextMessages = this.conversation
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = this.config.systemPrompt
        ? `${this.config.systemPrompt}\n\nConversation:\n${contextMessages}\nUser: ${input}\nAssistant:`
        : `${contextMessages}\nUser: ${input}\nAssistant:`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error("Error generating response:", error);
      return "I apologize, but I encountered an error processing your request.";
    }
  }

  private async generateAudioResponse(text: string): Promise<void> {
    try {
      // Use browser's speech synthesis for audio output
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);

        // Convert to ArrayBuffer for callback
        utterance.onstart = () => {
          // Create mock audio data
          this.callbacks.onAudioResponse?.(audioData);
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      logger.error("Error generating audio response:", error);
    }
  }

  private addMessage(message: RealTimeMessage): void {
    this.conversation.push(message);

    if (this.currentSession) {
      this.currentSession.messageCount++;
      this.currentSession.lastActivity = new Date();
    }

    this.callbacks.onMessage?.(message);
  }

  private stopAudioCapture(): void {
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
  }

  private stopVideoCapture(): void {
    this.videoStreamActive = false;
  }

  private stopScreenCapture(): void {
    this.screenStreamActive = false;
  }

    let binary = "";
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async cleanup(): Promise<void> {
    await this.stopSession();

    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.conversation = [];
    this.callbacks = {};
    this.isInitialized = false;

    logger.info("Real-Time Multi-Turn Service cleaned up");
  }
}

// Export singleton instance
export const realTimeMultiTurnService = RealTimeMultiTurnService.getInstance();
