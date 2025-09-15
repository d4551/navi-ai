<!-- 
  Enhanced AI Integration Demo Component
  
  Demonstrates the tight integration of all AI services with real-time capabilities,
  UI integration, error handling, and comprehensive functionality
-->

<template>
  <div class="ai-integration-demo">
    <!-- Service Status Dashboard -->
    <div class="status-dashboard">
      <h2>AI Services Status</h2>
      <div class="status-grid">
        <div class="status-card" :class="{ 'healthy': healthStatus.aiService }">
          <h3>Core AI Service</h3>
          <span class="status-indicator">{{ healthStatus.aiService ? '✅' : '❌' }}</span>
          <p>{{ isAIReady ? 'Ready' : 'Disconnected' }}</p>
        </div>
        
        <div class="status-card" :class="{ 'healthy': healthStatus.realTimeService }">
          <h3>Real-time Service</h3>
          <span class="status-indicator">{{ healthStatus.realTimeService ? '✅' : '❌' }}</span>
          <p>{{ isRealTimeActive ? 'Active' : 'Inactive' }}</p>
        </div>
        
        <div class="status-card" :class="{ 'healthy': healthStatus.multimodalService }">
          <h3>Multimodal Service</h3>
          <span class="status-indicator">{{ healthStatus.multimodalService ? '✅' : '❌' }}</span>
          <p>{{ realTimeState.isConnected ? 'Connected' : 'Disconnected' }}</p>
        </div>
      </div>
      
      <div v-if="healthStatus.overall !== 'healthy'" class="health-warning">
        ⚠️ System Status: {{ healthStatus.overall }}
        <button class="reconnect-btn" @click="reconnectServices">
          Reconnect Services
        </button>
      </div>
    </div>

    <!-- Operation Status -->
    <div v-if="operationState.isLoading || operationState.error" class="operation-status">
      <div v-if="operationState.isLoading" class="loading-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${operationState.progress}%` }"></div>
        </div>
        <p>{{ operationState.operation }}...</p>
        <p class="progress-text">{{ operationState.progress.toFixed(0) }}% complete</p>
        
        <button 
          v-if="operationState.canCancel" 
          class="cancel-btn"
          @click="cancelOperation"
        >
          Cancel
        </button>
      </div>
      
      <div v-if="operationState.error" class="error-container">
        <h3>❌ Error</h3>
        <p>{{ operationState.error }}</p>
        <button class="clear-error-btn" @click="clearError">Clear</button>
      </div>
    </div>

    <!-- Real-time Audio/Video Controls -->
    <div class="realtime-controls">
      <h2>Real-time AI Interaction</h2>
      
      <div class="media-controls">
        <button 
          :class="{ 'active': realTimeState.isStreaming }"
          :disabled="!isRealTimeActive"
          class="media-btn audio-btn"
          @click="toggleAudio"
        >
          <span class="icon">🎤</span>
          {{ realTimeState.isStreaming ? 'Stop Audio' : 'Start Audio' }}
        </button>
        
        <button 
          :class="{ 'active': realTimeState.videoActive }"
          :disabled="!isRealTimeActive"
          class="media-btn video-btn"
          @click="toggleVideo"
        >
          <span class="icon">📹</span>
          {{ realTimeState.videoActive ? 'Stop Video' : 'Start Video' }}
        </button>
        
        <button 
          :disabled="!isRealTimeActive"
          class="media-btn screen-btn"
          @click="captureScreen"
        >
          <span class="icon">📸</span>
          Capture Screen
        </button>
      </div>

      <!-- Audio Level Indicator -->
      <div v-if="realTimeState.isStreaming" class="audio-level">
        <label>Audio Level:</label>
        <div class="level-bar">
          <div 
            class="level-fill" 
            :style="{ width: `${realTimeState.audioLevel}%` }"
          ></div>
        </div>
      </div>

      <!-- Live Transcription -->
      <div v-if="realTimeState.transcription || realTimeState.interimTranscription" class="transcription">
        <h3>Live Transcription</h3>
        <p class="final-transcript">{{ realTimeState.transcription }}</p>
        <p class="interim-transcript">{{ realTimeState.interimTranscription }}</p>
      </div>
    </div>

    <!-- Enhanced Chat Interface -->
    <div class="chat-interface">
      <h2>Enhanced AI Chat</h2>
      
      <div class="chat-options">
        <select v-model="selectedChatType" class="chat-type-select">
          <option value="general">General Chat</option>
          <option value="resume">Resume Analysis</option>
          <option value="cover_letter">Cover Letter</option>
          <option value="job_analysis">Job Analysis</option>
          <option value="interview_prep">Interview Prep</option>
          <option value="portfolio">Portfolio Review</option>
        </select>
        
        <label class="checkbox-label">
          <input v-model="useSmartPrompting" type="checkbox">
          Smart Prompting
        </label>
        
        <label class="checkbox-label">
          <input v-model="enableStreaming" type="checkbox">
          Real-time Streaming
        </label>
      </div>

      <div ref="chatContainer" class="chat-messages">
        <div 
          v-for="message in chatMessages" 
          :key="message.id"
          :class="['message', message.role]"
        >
          <div class="message-header">
            <span class="role">{{ message.role }}</span>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
        
        <div v-if="isTyping" class="message assistant typing">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <textarea 
          v-model="currentMessage"
          placeholder="Type your message or speak using the microphone..."
          class="message-input"
          :disabled="operationState.isLoading"
          @keydown.enter.prevent="sendMessage"
        ></textarea>
        
        <button 
          :disabled="!currentMessage.trim() || operationState.isLoading"
          class="send-btn"
          @click="sendMessage"
        >
          Send
        </button>
      </div>
    </div>

    <!-- Results Display -->
    <div v-if="results.length > 0" class="results-display">
      <h2>Recent Results</h2>
      
      <div class="results-grid">
        <div 
          v-for="result in results.slice(-5)" 
          :key="result.id"
          class="result-card"
        >
          <h3>{{ result.type }}</h3>
          <p class="result-content">{{ result.content.substring(0, 200) }}...</p>
          <div class="result-meta">
            <span>{{ formatTime(result.timestamp) }}</span>
            <span>{{ result.latency }}ms</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useAIUI } from '@/shared/services/AIUIIntegrationService';
import { logger } from '@/shared/utils/logger';

// Reactive state from AI UI Integration Service
const {
  operationState,
  realTimeState,
  performAIOperation,
  cancelOperation,
  initializeRealTime,
  startAudioStreaming,
  stopAudioStreaming,
  startVideoStreaming,
  stopVideoStreaming,
  captureScreen,
  streamingChat,
  getHealthStatus,
  cleanup,
  isAIReady,
  isRealTimeActive,
} = useAIUI();

// Component state
const selectedChatType = ref<'general' | 'resume' | 'cover_letter' | 'job_analysis' | 'interview_prep' | 'portfolio'>('general');
const useSmartPrompting = ref(true);
const enableStreaming = ref(true);
const currentMessage = ref('');
const isTyping = ref(false);
const chatContainer = ref<HTMLElement>();

// Health status
const healthStatus = ref({
  aiService: false,
  realTimeService: false,
  multimodalService: false,
  overall: 'unhealthy' as 'healthy' | 'degraded' | 'unhealthy',
});

// Chat messages
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const chatMessages = ref<ChatMessage[]>([]);

// Results storage
interface AIResult {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  latency?: number;
}

const results = ref<AIResult[]>([]);

// Methods
const initializeServices = async () => {
  try {
    // Initialize with demo API key (in real app, get from settings)
    await initializeRealTime('demo-api-key', {
      enableAudio: true,
      enableVideo: false,
      enableScreenshot: true,
      onConnectionChange: (connected) => {
        logger.debug('Connection changed:', connected);
      },
      onTranscription: (text, isFinal) => {
        if (isFinal && text.trim()) {
          currentMessage.value = text;
        }
      },
      onVideoAnalysis: (analysis) => {
        addChatMessage('assistant', `Video Analysis: ${analysis}`);
      },
      onResponse: (response) => {
        logger.debug('AI Response:', response);
      }
    });

    updateHealthStatus();
  } catch (error) {
    console.error('Service initialization failed:', error);
  }
};

const updateHealthStatus = async () => {
  try {
    const status = await getHealthStatus();
    healthStatus.value = status;
  } catch (error) {
    console.error('Health status update failed:', error);
  }
};

const reconnectServices = async () => {
  try {
    await cleanup();
    await initializeServices();
  } catch (error) {
    console.error('Reconnection failed:', error);
  }
};

const clearError = () => {
  // Error will be cleared by the service after timeout
};

const toggleAudio = async () => {
  try {
    if (realTimeState.isStreaming) {
      stopAudioStreaming();
    } else {
      await startAudioStreaming();
    }
  } catch (error) {
    console.error('Audio toggle failed:', error);
  }
};

const toggleVideo = async () => {
  try {
    if (realTimeState.videoActive) {
      stopVideoStreaming();
    } else {
      await startVideoStreaming();
    }
  } catch (error) {
    console.error('Video toggle failed:', error);
  }
};

const sendMessage = async () => {
  if (!currentMessage.value.trim()) return;

  const userMessage = currentMessage.value.trim();
  
  // Add user message to chat
  addChatMessage('user', userMessage);
  currentMessage.value = '';
  
  try {
    isTyping.value = true;
    
    if (enableStreaming.value) {
      // Use streaming chat with real-time updates
      let assistantMessage = '';
      
      await streamingChat(userMessage, {
        sessionId: 'demo-session',
        onChunk: (chunk) => {
          assistantMessage += chunk;
          updateLastAssistantMessage(assistantMessage);
        },
        onComplete: (_response) => {
          isTyping.value = false;
          addResult('chat', response, Date.now());
        },
        showTypingIndicator: true
      });
    } else {
      // Use regular AI operation
      const response = await performAIOperation(
        'chat-response',
        { message: userMessage, type: 'chat' },
        { showProgress: false }
      );
      
      addChatMessage('assistant', response.content);
      addResult('chat', response.content, 0);
    }
  } catch (error) {
    console.error('Message sending failed:', error);
    addChatMessage('assistant', `Sorry, I encountered an error: ${(error as Error).message}`);
  } finally {
    isTyping.value = false;
  }
};

const addChatMessage = (role: 'user' | 'assistant', content: string) => {
  chatMessages.value.push({
    id: `${role}-${Date.now()}`,
    role,
    content,
    timestamp: new Date()
  });
  
  nextTick(() => {
    chatContainer.value?.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  });
};

const updateLastAssistantMessage = (content: string) => {
  const lastMessage = chatMessages.value[chatMessages.value.length - 1];
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.content = content;
  } else {
    addChatMessage('assistant', content);
  }
};

const addResult = (type: string, content: string, latency: number) => {
  results.value.push({
    id: `result-${Date.now()}`,
    type,
    content,
    timestamp: new Date(),
    latency
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  initializeServices();
  
  // Update health status periodically
  const healthCheckInterval = setInterval(updateHealthStatus, 30000);
  
  onUnmounted(() => {
    clearInterval(healthCheckInterval);
    cleanup();
  });
});
</script>

<style scoped>
.ai-integration-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
}

.status-dashboard h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.status-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-card.healthy {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.3);
}

.status-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.status-indicator {
  font-size: 24px;
  float: right;
}

.health-warning {
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reconnect-btn, .cancel-btn, .clear-error-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
}

.operation-status {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.error-container {
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 16px;
  color: #c62828;
}

.realtime-controls, .chat-interface, .results-display {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.media-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.media-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audio-btn {
  background: #e3f2fd;
  color: #1565c0;
}

.audio-btn.active {
  background: #1565c0;
  color: white;
}

.video-btn {
  background: #f3e5f5;
  color: #7b1fa2;
}

.video-btn.active {
  background: #7b1fa2;
  color: white;
}

.screen-btn {
  background: #e8f5e8;
  color: #2e7d32;
}

.audio-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
  transition: width 0.1s ease;
}

.transcription {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.final-transcript {
  font-weight: 500;
  margin-bottom: 8px;
}

.interim-transcript {
  color: #666;
  font-style: italic;
}

.chat-options {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.chat-type-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.message {
  margin-bottom: 16px;
}

.message.user {
  text-align: right;
}

.message.user .message-content {
  background: #2196f3;
  color: white;
  display: inline-block;
  padding: 8px 12px;
  border-radius: 18px 18px 4px 18px;
  max-width: 70%;
}

.message.assistant .message-content {
  background: #f0f0f0;
  display: inline-block;
  padding: 8px 12px;
  border-radius: 18px 18px 18px 4px;
  max-width: 70%;
}

.message-header {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  min-height: 60px;
}

.send-btn {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.result-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.result-content {
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.result-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

/* Responsive design */
@media (max-width: 768px) {
  .ai-integration-demo {
    padding: 12px;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .media-controls {
    flex-direction: column;
  }
  
  .chat-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>