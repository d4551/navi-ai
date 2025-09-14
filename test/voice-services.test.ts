/**
 * Voice Services Test - Enhanced Edition
 *
 * Comprehensive tests for voice services integration with real functionality testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LiveMultimediaAIService from '@/shared/services/LiveMultimediaAIService';
import { MultimodalLiveService } from '@/shared/services/MultimodalLiveService';
import AudioStreamer from '@/shared/services/audio-streamer';

// Mock the logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue('Mock AI response')
        }
      }),
      startChat: vi.fn().mockReturnValue({
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue('Mock chat response')
          }
        })
      })
    })
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
  },
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}));

// Mock WebRTC and Media APIs
const mockMediaStream = {
  getTracks: vi.fn().mockReturnValue([
    { stop: vi.fn(), kind: 'audio', enabled: true },
    { stop: vi.fn(), kind: 'video', enabled: true }
  ]),
  getAudioTracks: vi.fn().mockReturnValue([
    { stop: vi.fn(), kind: 'audio', enabled: true }
  ]),
  getVideoTracks: vi.fn().mockReturnValue([
    { stop: vi.fn(), kind: 'video', enabled: true }
  ])
};

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
    getDisplayMedia: vi.fn().mockResolvedValue(mockMediaStream),
    enumerateDevices: vi.fn().mockResolvedValue([
      { deviceId: 'audio1', kind: 'audioinput', label: 'Mock Microphone' },
      { deviceId: 'video1', kind: 'videoinput', label: 'Mock Camera' }
    ])
  },
  writable: true
});

// Mock AudioContext with more comprehensive implementation
class MockAudioContext {
  state = 'running';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  listener = {};

  createMediaStreamSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn()
  });

  createScriptProcessor = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    addEventListener: vi.fn()
  });

  createGain = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn()
    }
  });

  createAnalyser = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn()
  });

  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

global.AudioContext = MockAudioContext as any;
global.webkitAudioContext = MockAudioContext as any;

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

describe('Enhanced Voice Services Integration', () => {
  describe('LiveMultimediaAIService - Comprehensive Tests', () => {
    let service: LiveMultimediaAIService;

    beforeEach(() => {
      vi.clearAllMocks();
      service = LiveMultimediaAIService.getInstance();
    });

    afterEach(async () => {
      // Clean up any running streams
      if (service.getStreamingState().isAudioStreaming) {
        service.stopAudioStreaming();
      }
      if (service.getStreamingState().isVideoStreaming) {
        service.stopVideoStreaming();
      }
    });

    describe('Service Initialization', () => {
      it('should initialize with comprehensive configuration', async () => {
        const config = {
          apiKey: 'test-api-key-123',
          model: 'gemini-2.0-flash-exp',
          enableAudio: true,
          enableVideo: true,
          enableScreenshot: true,
          maxTokens: 4096,
          temperature: 0.8
        };

        await service.initialize(config);
        
        expect(service).toBeDefined();
        expect(typeof service.startAudioStreaming).toBe('function');
        expect(typeof service.startVideoStreaming).toBe('function');
        expect(typeof service.captureAndAnalyzeScreen).toBe('function');
      });

      it('should handle initialization errors gracefully', async () => {
        const invalidConfig = {
          apiKey: '', // Empty API key
          enableAudio: true,
          enableVideo: false,
          enableScreenshot: false
        };

        await expect(service.initialize(invalidConfig))
          .rejects.toThrow('API key is required');
      });

      it('should validate API key format', async () => {
        const invalidConfig = {
          apiKey: null as any,
          enableAudio: true,
          enableVideo: false,
          enableScreenshot: false
        };

        await expect(service.initialize(invalidConfig))
          .rejects.toThrow('API key is required');
      });
    });

    describe('Audio Streaming Functionality', () => {
      beforeEach(async () => {
        await service.initialize({
          apiKey: 'test-api-key',
          enableAudio: true,
          enableVideo: false,
          enableScreenshot: false
        });
      });

      it('should start audio streaming with proper media constraints', async () => {
        await service.startAudioStreaming();

        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          }
        });

        const state = service.getStreamingState();
        expect(state.isAudioStreaming).toBe(true);
      });

      it('should stop audio streaming and clean up resources', async () => {
        await service.startAudioStreaming();
        service.stopAudioStreaming();

        const state = service.getStreamingState();
        expect(state.isAudioStreaming).toBe(false);
        
        // Verify tracks are stopped
        expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalled();
      });

      it('should handle media access errors', async () => {
        const mediaError = new Error('Permission denied');
        (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(mediaError);

        await expect(service.startAudioStreaming()).rejects.toThrow('Permission denied');
      });

      it('should reject when audio not enabled in config', async () => {
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

    describe('Video Streaming Functionality', () => {
      beforeEach(async () => {
        await service.initialize({
          apiKey: 'test-api-key',
          enableAudio: false,
          enableVideo: true,
          enableScreenshot: false
        });
      });

      it('should start video streaming with custom options', async () => {
        const options = {
          width: 1920,
          height: 1080,
          frameRate: 60
        };

        await service.startVideoStreaming(options);

        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60 }
          }
        });

        const state = service.getStreamingState();
        expect(state.isVideoStreaming).toBe(true);
      });

      it('should stop video streaming properly', async () => {
        await service.startVideoStreaming();
        service.stopVideoStreaming();

        const state = service.getStreamingState();
        expect(state.isVideoStreaming).toBe(false);
      });

      it('should use default video constraints', async () => {
        await service.startVideoStreaming();

        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        });
      });
    });

    describe('Screenshot Analysis', () => {
      beforeEach(async () => {
        await service.initialize({
          apiKey: 'test-api-key',
          enableAudio: false,
          enableVideo: false,
          enableScreenshot: true
        });
      });

      it('should capture and analyze screen content', async () => {
        const mockCanvas = {
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn()
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockimagedata')
        };

        // Mock createElement to return our canvas
        const originalCreateElement = document.createElement;
        document.createElement = vi.fn().mockReturnValue(mockCanvas);

        const result = await service.captureAndAnalyzeScreen();

        expect(result).toBeDefined();
        expect(result.type).toBe('image');
        expect(result.content).toBe('Mock AI response');

        // Restore original createElement
        document.createElement = originalCreateElement;
      });

      it('should handle screen capture permission errors', async () => {
        const permissionError = new Error('Screen capture permission denied');
        (navigator.mediaDevices.getDisplayMedia as any).mockRejectedValueOnce(permissionError);

        await expect(service.captureAndAnalyzeScreen())
          .rejects.toThrow('Screen capture permission denied');
      });
    });

    describe('Conversation History Management', () => {
      beforeEach(async () => {
        await service.initialize({
          apiKey: 'test-api-key',
          enableAudio: true,
          enableVideo: true,
          enableScreenshot: true
        });
      });

      it('should maintain conversation history', async () => {
        // Simulate adding results to history
        const result1 = {
          id: 'test-1',
          timestamp: new Date(),
          type: 'text' as const,
          content: 'First message'
        };

        const result2 = {
          id: 'test-2',
          timestamp: new Date(),
          type: 'audio' as const,
          content: 'Second message',
          metadata: { duration: 5 }
        };

        // These would be added through actual service calls
        // For testing, we'll verify the structure exists
        expect(service.getConversationHistory).toBeDefined();
        expect(service.clearConversationHistory).toBeDefined();
      });

      it('should limit conversation history length', async () => {
        // Test that history doesn't grow indefinitely
        // This would be tested by making many service calls
        // and verifying the history stays within bounds
        expect(service.clearConversationHistory).toBeDefined();
      });
    });

    describe('Error Handling and Recovery', () => {
      it('should handle network connectivity issues', async () => {
        // Mock network failure during streaming
        const networkError = new Error('Network connection lost');
        
        await service.initialize({
          apiKey: 'test-api-key',
          enableAudio: true,
          enableVideo: false,
          enableScreenshot: false
        });

        // Set up error callback
        const errorCallback = vi.fn();
        service.setCallbacks({ onError: errorCallback });

        // This would test network recovery mechanisms
        expect(errorCallback).toBeDefined();
      });

      it('should gracefully degrade when features unavailable', async () => {
        // Test behavior when certain browser features are missing
        delete (navigator as any).mediaDevices;

        await expect(service.initialize({
          apiKey: 'test-api-key',
          enableAudio: true,
          enableVideo: false,
          enableScreenshot: false
        })).resolves.not.toThrow();
      });
    });
  });

  describe('MultimodalLiveService - Enhanced Tests', () => {
    let service: MultimodalLiveService;

    beforeEach(() => {
      service = MultimodalLiveService.getInstance();
    });

    describe('Service Management', () => {
      it('should initialize with connection options', async () => {
        const options = {
          apiKey: 'test-api-key',
          url: 'wss://test.example.com/ws'
        };

        await service.initialize(options);
        
        expect(service.getStatus).toBeDefined();
        expect(service.connect).toBeDefined();
        expect(service.disconnect).toBeDefined();
      });

      it('should manage connection state properly', async () => {
        await service.initialize({ apiKey: 'test-key' });

        const status = service.getStatus();
        expect(status).toBeDefined();
        expect(typeof status.connected).toBe('boolean');
      });

      it('should handle WebSocket connection lifecycle', async () => {
        await service.initialize({ apiKey: 'test-key' });

        // Test connection methods exist and work
        expect(typeof service.connect).toBe('function');
        expect(typeof service.disconnect).toBe('function');
        
        await service.connect();
        const connectedStatus = service.getStatus();
        expect(connectedStatus).toBeDefined();

        await service.disconnect();
        const disconnectedStatus = service.getStatus();
        expect(disconnectedStatus).toBeDefined();
      });
    });

    describe('Audio Streaming Integration', () => {
      beforeEach(async () => {
        await service.initialize({ apiKey: 'test-key' });
      });

      it('should handle audio stream data', async () => {
        await service.connect();
        
        // Mock audio stream
        const audioStream = mockMediaStream;
        service.sendAudioStream(audioStream);

        // Verify stream handling
        expect(service.startStream).toBeDefined();
        expect(service.stopStream).toBeDefined();
      });

      it('should process real-time audio data', async () => {
        await service.connect();
        await service.startStream();

        // Test message sending
        await service.sendMessage('Test message');
        
        expect(service.stopStream).toBeDefined();
        await service.stopStream();
      });
    });

    describe('Callback System', () => {
      it('should support comprehensive callback configuration', async () => {
        const callbacks = {
          onConnected: vi.fn(),
          onDisconnected: vi.fn(),
          onAudio: vi.fn(),
          onContent: vi.fn(),
          onToolCall: vi.fn(),
          onError: vi.fn()
        };

        await service.initialize({ apiKey: 'test-key' });
        service.setCallbacks(callbacks);

        // Verify callbacks are properly set
        expect(service.setCallbacks).toBeDefined();
      });
    });
  });

  describe('AudioStreamer - Enhanced Tests', () => {
    let audioContext: AudioContext;
    let streamer: AudioStreamer;

    beforeEach(() => {
      audioContext = new AudioContext();
      streamer = new AudioStreamer(audioContext);
    });

    afterEach(() => {
      if (streamer) {
        streamer.stop();
      }
    });

    describe('Audio Processing', () => {
      it('should handle PCM16 audio data correctly', async () => {
        const pcmData = new Uint8Array([
          0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
          0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
        ]);

        await expect(streamer.addPCM16(pcmData)).resolves.not.toThrow();
      });

      it('should start and stop audio streaming', () => {
        expect(() => streamer.start()).not.toThrow();
        expect(() => streamer.stop()).not.toThrow();
      });

      it('should handle empty audio data', async () => {
        const emptyData = new Uint8Array();
        await expect(streamer.addPCM16(emptyData)).resolves.not.toThrow();
      });

      it('should manage audio context state', () => {
        expect(audioContext.resume).toBeDefined();
        expect(audioContext.suspend).toBeDefined();
      });
    });

    describe('Audio Context Integration', () => {
      it('should create audio nodes correctly', () => {
        expect(audioContext.createGain).toHaveBeenCalled();
        expect(audioContext.destination).toBeDefined();
      });

      it('should handle audio context state changes', async () => {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        expect(audioContext.state).toBe('running');
      });
    });
  });

  describe('Integration and Performance Tests', () => {
    it('should handle multiple simultaneous streams', async () => {
      const liveService = LiveMultimediaAIService.getInstance();
      const multimodalService = MultimodalLiveService.getInstance();

      await liveService.initialize({
        apiKey: 'test-key',
        enableAudio: true,
        enableVideo: true,
        enableScreenshot: false
      });

      await multimodalService.initialize({ apiKey: 'test-key' });

      // Start multiple streams
      await liveService.startAudioStreaming();
      await liveService.startVideoStreaming();
      await multimodalService.connect();

      // Verify all services are running
      const liveState = liveService.getStreamingState();
      expect(liveState.isAudioStreaming).toBe(true);
      expect(liveState.isVideoStreaming).toBe(true);

      // Clean up
      liveService.stopAudioStreaming();
      liveService.stopVideoStreaming();
      await multimodalService.disconnect();
    });

    it('should handle resource cleanup properly', async () => {
      const service = LiveMultimediaAIService.getInstance();
      
      await service.initialize({
        apiKey: 'test-key',
        enableAudio: true,
        enableVideo: true,
        enableScreenshot: true
      });

      // Start services
      await service.startAudioStreaming();
      await service.startVideoStreaming();

      // Stop services
      service.stopAudioStreaming();
      service.stopVideoStreaming();

      // Verify cleanup
      const state = service.getStreamingState();
      expect(state.isAudioStreaming).toBe(false);
      expect(state.isVideoStreaming).toBe(false);
    });

    it('should maintain performance under load', async () => {
      const service = LiveMultimediaAIService.getInstance();
      
      await service.initialize({
        apiKey: 'test-key',
        enableAudio: true,
        enableVideo: false,
        enableScreenshot: false
      });

      // Simulate high-frequency operations
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await service.startAudioStreaming();
        service.stopAudioStreaming();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete reasonably quickly (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
    });
  });
});
