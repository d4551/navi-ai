/**
 * Comprehensive AI Services Test Suite
 * 
 * Tests all AI service functionality including:
 * - CanonicalAIService initialization and configuration
 * - Text generation and streaming
 * - Multimodal capabilities (text, image, audio)
 * - Real-time session management
 * - Error handling and resilience
 * - Health checks and monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { canonicalAI, CanonicalAIService, AIConfig, AIResponse } from '@/modules/ai/CanonicalAIService';
import { LiveMultimediaAIService, MultimediaAIConfig } from '@/shared/services/LiveMultimediaAIService';
import { MultimodalLiveService } from '@/shared/services/MultimodalLiveService';

// Mock the logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock Google Generative AI SDK
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();
const mockGetGenerativeModel = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
  },
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}));

// Mock media APIs for real-time testing
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([
        { stop: vi.fn() },
        { stop: vi.fn() }
      ])
    }),
    getDisplayMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([
        { stop: vi.fn() }
      ])
    })
  },
  writable: true
});

describe('CanonicalAIService', () => {
  let aiService: CanonicalAIService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up mock model with proper responses
    const mockModel = {
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream,
      startChat: vi.fn().mockReturnValue({
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue('Mock AI response')
          }
        })
      })
    };
    
    mockGetGenerativeModel.mockReturnValue(mockModel);
    
    // Default successful response
    mockGenerateContent.mockResolvedValue({
      response: {
        text: vi.fn().mockReturnValue('Mock AI response')
      }
    });

    // Create fresh instance for each test
    aiService = new (CanonicalAIService as any)();
  });

  afterEach(() => {
    aiService.clearConversationHistory();
  });

  describe('Initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config: Partial<AIConfig> = {
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google',
        enableMultimodal: true,
        enableRealTime: true
      };

      await aiService.initialize(config);
      
      expect(aiService.isReady).toBe(true);
      expect(aiService.currentConfig).toMatchObject({
        primaryProvider: 'google',
        enableMultimodal: true,
        enableRealTime: true,
        geminiApiKey: '[REDACTED]'
      });
    });

    it('should fail initialization without API key', async () => {
      const config: Partial<AIConfig> = {
        primaryProvider: 'google'
      };

      await expect(aiService.initialize(config)).rejects.toThrow('AI initialization failed');
    });

    it('should use default configuration values', async () => {
      const config: Partial<AIConfig> = {
        geminiApiKey: 'test-api-key'
      };

      await aiService.initialize(config);
      
      const currentConfig = aiService.currentConfig;
      expect(currentConfig?.primaryProvider).toBe('google');
      expect(currentConfig?.enableContextPersistence).toBe(true);
      expect(currentConfig?.maxTokens).toBe(8192);
      expect(currentConfig?.temperature).toBe(0.7);
    });
  });

  describe('Text Generation', () => {
    beforeEach(async () => {
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google'
      });
    });

    it('should generate text successfully', async () => {
      const response = await aiService.generateText('Hello, AI!');
      
      expect(response.success).toBe(true);
      expect(response.content).toBe('Mock AI response');
      expect(response.timestamp).toBeInstanceOf(Date);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle generation errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));
      
      const response = await aiService.generateText('Hello, AI!');
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('API Error');
    });

    it('should maintain conversation context when enabled', async () => {
      const conversationId = 'test-conversation';
      
      await aiService.generateText('My name is Alice', { conversationId });
      await aiService.generateText('What is my name?', { conversationId });
      
      // Should have made 2 calls with accumulated context
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      
      // Check that context was maintained
      const secondCall = mockGenerateContent.mock.calls[1][0];
      expect(secondCall).toContain('Alice');
      expect(secondCall).toContain('What is my name?');
    });

    it('should apply system prompts correctly', async () => {
      await aiService.generateText('Hello', {
        systemPrompt: 'You are a helpful assistant.'
      });
      
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs).toContain('You are a helpful assistant.');
      expect(callArgs).toContain('Hello');
    });
  });

  describe('Streaming Generation', () => {
    beforeEach(async () => {
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google'
      });
    });

    it('should start streaming successfully', async () => {
      // Mock stream response
      const mockChunk = { text: () => 'chunk1' };
      const mockStream = {
        stream: [mockChunk]
      };
      mockGenerateContentStream.mockResolvedValue(mockStream);

      const response = await aiService.generateStream('Test streaming');
      
      expect(response.success).toBe(true);
      expect(response.stream).toBeInstanceOf(ReadableStream);
    });

    it('should handle streaming errors', async () => {
      mockGenerateContentStream.mockRejectedValue(new Error('Streaming failed'));
      
      const response = await aiService.generateStream('Test streaming');
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Streaming failed');
    });
  });

  describe('Multimodal Capabilities', () => {
    beforeEach(async () => {
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google',
        enableMultimodal: true
      });
    });

    it('should process text and image input', async () => {
      const input = {
        text: 'What do you see in this image?',
        images: [{
          data: 'base64imagedata',
          mimeType: 'image/jpeg'
        }]
      };

      const response = await aiService.generateMultimodal(input);
      
      expect(response.success).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalledWith([
        { text: 'What do you see in this image?' },
        {
          inlineData: {
            data: 'base64imagedata',
            mimeType: 'image/jpeg'
          }
        }
      ]);
    });

    it('should process audio input', async () => {
      const input = {
        text: 'Transcribe this audio',
        audio: {
          data: 'base64audiodata',
          mimeType: 'audio/wav'
        }
      };

      const response = await aiService.generateMultimodal(input);
      
      expect(response.success).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalledWith([
        { text: 'Transcribe this audio' },
        {
          inlineData: {
            data: 'base64audiodata',
            mimeType: 'audio/wav'
          }
        }
      ]);
    });

    it('should fail when multimodal is disabled', async () => {
      // Reinitialize with multimodal disabled
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        enableMultimodal: false
      });

      const input = { text: 'Hello' };
      
      await expect(aiService.generateMultimodal(input))
        .rejects.toThrow('Multimodal features not enabled');
    });
  });

  describe('Audio Processing', () => {
    beforeEach(async () => {
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google'
      });
    });

    it('should process audio for transcription only', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue('This is the transcribed text.')
        }
      });

      const audioData = new ArrayBuffer(1024);
      const result = await aiService.processAudio(audioData, {
        format: 'wav',
        transcribeOnly: true
      });
      
      expect(result.success).toBe(true);
      expect(result.transcript).toBe('This is the transcribed text.');
      expect(result.response).toBeUndefined();
    });

    it('should process audio with AI response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue('Transcribed text\nAI response to the transcription')
        }
      });

      const audioData = new ArrayBuffer(1024);
      const result = await aiService.processAudio(audioData, {
        format: 'wav',
        transcribeOnly: false,
        systemPrompt: 'Please transcribe and respond helpfully'
      });
      
      expect(result.success).toBe(true);
      expect(result.transcript).toBe('Transcribed text');
      expect(result.response).toBe('AI response to the transcription');
    });

    it('should handle audio processing errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Audio processing failed'));

      const audioData = new ArrayBuffer(1024);
      const result = await aiService.processAudio(audioData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Audio processing failed');
    });
  });

  describe('Real-time Sessions', () => {
    beforeEach(async () => {
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google',
        enableRealTime: true
      });
    });

    it('should start real-time session successfully', async () => {
      const sessionId = 'test-session';
      const mockOnConnect = vi.fn();
      
      const result = await aiService.startRealTimeSession(sessionId, {
        onConnect: mockOnConnect
      });
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(mockOnConnect).toHaveBeenCalled();
    });

    it('should initialize media capabilities when requested', async () => {
      const sessionId = 'media-session';
      
      const result = await aiService.startRealTimeSession(sessionId, {
        enableAudio: true,
        enableVideo: true
      });
      
      expect(result.success).toBe(true);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
    });

    it('should handle media capability errors gracefully', async () => {
      const mockError = new Error('Media access denied');
      (navigator.mediaDevices.getUserMedia as any).mockRejectedValue(mockError);

      const sessionId = 'error-session';
      const result = await aiService.startRealTimeSession(sessionId, {
        enableAudio: true
      });
      
      // Should still succeed even if media capabilities fail
      expect(result.success).toBe(true);
    });

    it('should fail when real-time features are disabled', async () => {
      // Reinitialize with real-time disabled
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        enableRealTime: false
      });

      const result = await aiService.startRealTimeSession('test-session');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Real-time features not enabled');
    });

    it('should send real-time messages', async () => {
      const sessionId = 'message-session';
      await aiService.startRealTimeSession(sessionId);
      
      const response = await aiService.sendRealTimeMessage(sessionId, 'Hello in real-time');
      
      expect(response.success).toBe(true);
      expect(response.content).toBe('Mock AI response');
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await aiService.initialize({
        geminiApiKey: 'test-api-key',
        primaryProvider: 'google',
        enableMultimodal: true,
        enableRealTime: true,
        enableContextPersistence: true
      });
    });

    it('should report healthy status when all tests pass', async () => {
      // Mock successful responses for all health check tests
      mockGenerateContent
        .mockResolvedValueOnce({
          response: { text: vi.fn().mockReturnValue('Hello response') }
        })
        .mockResolvedValueOnce({
          response: { text: vi.fn().mockReturnValue('Multimodal response') }
        })
        .mockResolvedValueOnce({
          response: { text: vi.fn().mockReturnValue('Remember 42') }
        })
        .mockResolvedValueOnce({
          response: { text: vi.fn().mockReturnValue('The number is 42') }
        });

      mockGenerateContentStream.mockResolvedValue({
        stream: [{ text: () => 'streaming works' }]
      });

      const health = await aiService.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.details.tests.basicGeneration).toBe(true);
      expect(health.details.tests.streamingCapability).toBe(true);
      expect(health.details.tests.multimodalCapability).toBe(true);
      expect(health.details.tests.contextPersistence).toBe(true);
      expect(health.details.summary).toContain('4/4 tests passed');
    });

    it('should report degraded status when some tests fail', async () => {
      // Mock basic generation success but streaming failure
      mockGenerateContent.mockResolvedValue({
        response: { text: vi.fn().mockReturnValue('Hello response') }
      });
      mockGenerateContentStream.mockRejectedValue(new Error('Streaming not available'));

      const health = await aiService.healthCheck();
      
      expect(health.status).toBe('degraded');
      expect(health.details.tests.basicGeneration).toBe(true);
      expect(health.details.tests.streamingCapability).toBe(false);
      expect(health.details.tests.errors).toContain('Streaming test: Streaming not available');
    });

    it('should report unhealthy when not initialized', async () => {
      const uninitializedService = new (CanonicalAIService as any)();
      
      const health = await uninitializedService.healthCheck();
      
      expect(health.status).toBe('unhealthy');
      expect(health.details.error).toBe('Service not initialized');
    });
  });

  describe('Configuration Management', () => {
    it('should track initialization state correctly', () => {
      expect(aiService.isReady).toBe(false);
    });

    it('should clear conversation history', async () => {
      await aiService.initialize({ geminiApiKey: 'test-key' });
      
      const conversationId = 'test-conversation';
      await aiService.generateText('Hello', { conversationId });
      
      aiService.clearConversationHistory(conversationId);
      
      // Next message shouldn't have context
      await aiService.generateText('What did I say?', { conversationId });
      const secondCall = mockGenerateContent.mock.calls[1][0];
      expect(secondCall).not.toContain('Hello');
    });

    it('should redact API keys in config output', async () => {
      await aiService.initialize({
        geminiApiKey: 'secret-api-key',
        primaryProvider: 'google'
      });
      
      const config = aiService.currentConfig;
      expect(config?.geminiApiKey).toBe('[REDACTED]');
    });
  });
});

describe('LiveMultimediaAIService', () => {
  let service: LiveMultimediaAIService;

  beforeEach(() => {
    service = LiveMultimediaAIService.getInstance();
  });

  describe('Initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config: MultimediaAIConfig = {
        apiKey: 'test-api-key',
        enableAudio: true,
        enableVideo: true,
        enableScreenshot: true
      };

      await expect(service.initialize(config)).resolves.not.toThrow();
    });

    it('should fail with invalid API key', async () => {
      const config: MultimediaAIConfig = {
        apiKey: '',
        enableAudio: true,
        enableVideo: false,
        enableScreenshot: false
      };

      await expect(service.initialize(config))
        .rejects.toThrow('API key is required');
    });
  });

  describe('Audio Streaming', () => {
    beforeEach(async () => {
      await service.initialize({
        apiKey: 'test-api-key',
        enableAudio: true,
        enableVideo: false,
        enableScreenshot: false
      });
    });

    it('should start audio streaming', async () => {
      await expect(service.startAudioStreaming()).resolves.not.toThrow();
      expect(service.getStreamingState().isAudioStreaming).toBe(true);
    });

    it('should stop audio streaming', async () => {
      await service.startAudioStreaming();
      service.stopAudioStreaming();
      expect(service.getStreamingState().isAudioStreaming).toBe(false);
    });

    it('should throw error when audio not enabled', async () => {
      // Reinitialize with audio disabled
      await service.initialize({
        apiKey: 'test-api-key',
        enableAudio: false,
        enableVideo: false,
        enableScreenshot: false
      });

      await expect(service.startAudioStreaming())
        .rejects.toThrow('Audio streaming not enabled');
    });
  });
});

describe('Integration Tests', () => {
  it('should work together - CanonicalAI and LiveMultimedia', async () => {
    // Test that the services can work together
    const canonicalService = new (CanonicalAIService as any)();
    const multimediaService = LiveMultimediaAIService.getInstance();

    await canonicalService.initialize({
      geminiApiKey: 'test-api-key',
      enableMultimodal: true,
      enableRealTime: true
    });

    await multimediaService.initialize({
      apiKey: 'test-api-key',
      enableAudio: true,
      enableVideo: false,
      enableScreenshot: false
    });

    expect(canonicalService.isReady).toBe(true);
    expect(multimediaService).toBeDefined();
  });
});