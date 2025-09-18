<template>
  <div
    class="modern-ai-config font-sans"
    role="region"
    aria-labelledby="ai-config-title"
  >
    <!-- Main Header -->
    <div class="main-header">
      <h1>API Configuration</h1>
      <p>
        Configure your AI models and voice settings for the ultimate experience
      </p>
    </div>

    <!-- Settings Card -->
    <div class="settings-card">
      <!-- API Key Section -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">KeyIcon</div>
          <div class="section-title">
            <h3>API Configuration</h3>
            <p>Connect your Gemini API for AI-powered features</p>
          </div>
          <div :class="['status', settings.geminiApiKey ? 'connected' : '']">
            <span class="status-dot"></span>
            <span>{{
              settings.geminiApiKey ? 'Connected' : 'Not Connected'
            }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Gemini API Key *</label>
          <div class="input-group">
            <input
              id="gemini-api-key"
              v-model="localSettings.geminiApiKey"
              :type="showApiKey ? 'text' : 'password'"
              class="form-input"
              placeholder="Enter your Gemini API key"
              autocomplete="off"
              @input="onApiKeyChange"
            />
            <button
              type="button"
              class="btn btn-icon"
              :aria-label="showApiKey ? 'Hide API key' : 'Show API key'"
              @click="toggleApiKeyVisibility"
            >
              {{ showApiKey ? '🙈' : 'EyeIcon' }}
            </button>
          </div>
          <div class="help-text">
            <span>KeyIcon</span>
            <span
              >Get your API key from
              <a href="https://aistudio.google.com/apikey" target="_blank"
                >Google AI Studio</a
              ></span
            >
          </div>
        </div>

        <div class="button-group">
          <button
            type="button"
            class="btn btn-success"
            :disabled="!settings.geminiApiKey || testing"
            @click="testApiKey"
          >
            <span v-if="testing" class="spinner">⟳</span>
            <span v-else>✓</span>
            <span>{{ testing ? 'Testing...' : 'Test Connection' }}</span>
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="!settings.geminiApiKey || connecting"
            @click="connectApiKey"
          >
            <span v-if="connecting" class="spinner">⟳</span>
            <span v-else>ArrowPathIcon</span>
            <span>{{ connecting ? 'Connecting...' : 'Refresh Models' }}</span>
          </button>
        </div>

        <div
          v-if="apiTestResult"
          :class="[
            'status-message',
            apiTestResult.success ? 'success' : 'error',
          ]"
        >
          {{ apiTestResult.message }}
        </div>
      </div>

      <!-- AI Model Section -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">🤖</div>
          <div class="section-title">
            <h3>AI Model Selection</h3>
            <p>Choose the perfect model for your needs</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Model</label>
          <select
            id="ai-model"
            v-model="localSettings.selectedModel"
            class="form-select"
            :disabled="loadingModels || !settings.geminiApiKey"
            @change="onModelChange"
          >
            <optgroup label="Latest Models">
              <option
                v-for="model in latestModels"
                :key="model.id"
                :value="model.id"
                :title="getModelTooltip(model)"
              >
                {{ model.displayName }} - {{ getModelLimits(model) }}
              </option>
            </optgroup>
            <optgroup v-if="otherModels.length" label="Other Models">
              <option
                v-for="model in otherModels"
                :key="model.id"
                :value="model.id"
                :title="getModelTooltip(model)"
              >
                {{ model.displayName }} - {{ getModelLimits(model) }}
              </option>
            </optgroup>
          </select>
        </div>

        <div v-if="selectedModelInfo" class="model-card">
          <span class="model-badge">{{ selectedModelInfo.displayName }}</span>
          <p class="model-description">
            {{
              selectedModelInfo.description ||
              'Advanced AI model with extended context'
            }}
          </p>
          <div class="model-stats">
            <div class="stat">
              <div class="stat-value">
                {{ formatTokens(selectedModelInfo.inputTokenLimit) }}
              </div>
              <div class="stat-label">Input Tokens</div>
            </div>
            <div class="stat">
              <div class="stat-value">
                {{ formatTokens(selectedModelInfo.outputTokenLimit) }}
              </div>
              <div class="stat-label">Output Tokens</div>
            </div>
            <div class="stat">
              <div class="stat-value">
                {{ getPerformanceScore(selectedModelInfo) }}/100
              </div>
              <div class="stat-label">Performance</div>
            </div>
          </div>
          <div v-if="selectedModelInfo.capabilities" class="model-capabilities">
            <div class="capability-badges">
              <span
                v-if="selectedModelInfo.capabilities.multiTurn"
                class="capability-badge"
                >💬 Chat</span
              >
              <span
                v-if="selectedModelInfo.capabilities.imageInput"
                class="capability-badge"
                >EyeIcon Vision</span
              >
              <span
                v-if="selectedModelInfo.capabilities.videoInput"
                class="capability-badge"
                >🎥 Video</span
              >
              <span
                v-if="selectedModelInfo.capabilities.audioInput"
                class="capability-badge"
                >MicrophoneIcon Audio In</span
              >
              <span
                v-if="selectedModelInfo.capabilities.audioOutput"
                class="capability-badge"
                >SpeakerWaveIcon Audio Out</span
              >
              <span
                v-if="selectedModelInfo.capabilities.realtimeChat"
                class="capability-badge"
                >BoltIcon Real-time</span
              >
              <span
                v-if="selectedModelInfo.capabilities.codeGeneration"
                class="capability-badge"
                >👨‍💻 Code</span
              >
              <span
                v-if="selectedModelInfo.capabilities.streaming"
                class="capability-badge"
                >🌊 Streaming</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Voice & Audio Section -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">🎙️</div>
          <div class="section-title">
            <h3>Voice & Audio Settings</h3>
            <p>Configure speech synthesis and recognition</p>
          </div>
        </div>

        <div class="toggle-group">
          <div class="toggle-item">
            <div class="toggle-label">
              <strong>Voice Mode</strong>
              <small>Auto-play assistant responses</small>
            </div>
            <label class="toggle-switch">
              <input
                v-model="localSettings.voiceEnabled"
                type="checkbox"
                @change="onVoiceToggle"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-label">
              <strong>Hands-free Mode</strong>
              <small>Auto-listen after responses</small>
            </div>
            <label class="toggle-switch">
              <input
                v-model="localSettings.handsFreeMode"
                type="checkbox"
                @change="onHandsFreeToggle"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-label">
              <strong>Mute Chat Cues</strong>
              <small>Disable vibration and sounds</small>
            </div>
            <label class="toggle-switch">
              <input
                v-model="localSettings.muteChatCues"
                type="checkbox"
                @change="onMuteCuesToggle"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="voice-engines-grid">
          <div>
            <label class="form-label">Text-to-Speech Engine</label>
            <div class="radio-group">
              <label
                class="radio-item"
                :class="{ active: localSettings.ttsProvider === 'system' }"
              >
                <input
                  v-model="localSettings.ttsProvider"
                  type="radio"
                  value="system"
                  @change="onTTSChange"
                />
                <div class="radio-content">
                  <strong>System TTS</strong>
                  <small>Fast, reliable browser voices</small>
                </div>
              </label>
              <label
                class="radio-item"
                :class="{ active: localSettings.ttsProvider === 'navi' }"
              >
                <input
                  v-model="localSettings.ttsProvider"
                  type="radio"
                  value="navi"
                  :disabled="!settings.geminiApiKey"
                  @change="onTTSChange"
                />
                <div class="radio-content">
                  <strong>NAVI AI Real-time</strong>
                  <small>Natural AI voice (requires API)</small>
                </div>
              </label>
              <label
                class="radio-item"
                :class="{ active: localSettings.ttsProvider === 'kokoro' }"
              >
                <input
                  v-model="localSettings.ttsProvider"
                  type="radio"
                  value="kokoro"
                  @change="onTTSChange"
                />
                <div class="radio-content">
                  <strong>Kokoro TTS</strong>
                  <small>Local neural models (offline)</small>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="form-label">Speech-to-Text Engine</label>
            <div class="radio-group">
              <label
                class="radio-item"
                :class="{ active: localSettings.sttProvider === 'system' }"
              >
                <input
                  v-model="localSettings.sttProvider"
                  type="radio"
                  value="system"
                  @change="onSTTChange"
                />
                <div class="radio-content">
                  <strong>System STT</strong>
                  <small>Built-in browser recognition</small>
                </div>
              </label>
              <label
                class="radio-item"
                :class="{ active: localSettings.sttProvider === 'navi' }"
              >
                <input
                  v-model="localSettings.sttProvider"
                  type="radio"
                  value="navi"
                  :disabled="!settings.geminiApiKey"
                  @change="onSTTChange"
                />
                <div class="radio-content">
                  <strong>NAVI AI Realtime</strong>
                  <small>Cloud transcription (requires API)</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="device-settings-grid">
          <div class="form-group">
            <label class="form-label">Microphone Device</label>
            <select
              v-model="localSettings.microphoneDevice"
              class="form-select"
              @change="onMicrophoneChange"
            >
              <option value="default">System Default</option>
              <option value="usb">USB Microphone</option>
              <option value="builtin">Built-in Microphone</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Recognition Language</label>
            <select
              v-model="localSettings.recognitionLanguage"
              class="form-select"
              @change="onLanguageChange"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-CA">English (CA)</option>
              <option value="en-AU">English (AU)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  EyeIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  KeyIcon,
  BoltIcon,
} from '@heroicons/vue/24/outline'

import { computed, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'

export default {
  name: 'UnifiedAIConfiguration',
  props: {
    settings: {
      type: Object,
      required: true,
    },
    showApiKey: {
      type: Boolean,
      default: false,
    },
    testing: {
      type: Boolean,
      default: false,
    },
    connecting: {
      type: Boolean,
      default: false,
    },
    loadingModels: {
      type: Boolean,
      default: false,
    },
    apiTestResult: {
      type: Object,
      default: null,
    },
  },
  emits: [
    'update:settings',
    'toggle-api-key-visibility',
    'test-api-key',
    'connect-api-key',
    'load-models',
    'save-settings',
  ],
  setup(props, { emit }) {
    const store = useAppStore()

    const localSettings = reactive({
      geminiApiKey: props.settings.geminiApiKey || '',
      selectedModel: props.settings.selectedModel || 'gemini-2.5-flash',
      ttsProvider: props.settings.ttsProvider || 'system',
      sttProvider: props.settings.sttProvider || 'system',
      voiceEnabled: props.settings.voiceEnabled ?? true,
      handsFreeMode: props.settings.handsFreeMode ?? false,
      muteChatCues: props.settings.muteChatCues ?? false,
      microphoneDevice: props.settings.microphoneDevice || 'default',
      recognitionLanguage: props.settings.recognitionLanguage || 'en-US',
    })

    // Watch for changes and emit updates
    watch(
      localSettings,
      newSettings => {
        emit('update:settings', { ...props.settings, ...newSettings })
      },
      { deep: true }
    )

    // Watch for external settings changes
    watch(
      () => props.settings,
      newSettings => {
        Object.assign(localSettings, newSettings)
      },
      { deep: true }
    )

    const availableModels = computed(() => {
      const models = store.availableModels
      return Array.isArray(models) ? models : []
    })

    const selectedModelInfo = computed(() => {
      const info = store.selectedModelInfo
      if (info && typeof info === 'object' && !('then' in info)) return info
      return null
    })

    const latestModels = computed(() => {
      return availableModels.value.filter(
        m => m.name.includes('2.5') || m.name.includes('2.0')
      )
    })

    const otherModels = computed(() => {
      return availableModels.value.filter(
        m => !m.name.includes('2.5') && !m.name.includes('2.0')
      )
    })

    return {
      localSettings,
      availableModels,
      selectedModelInfo,
      latestModels,
      otherModels,
    }
  },
  methods: {
    toggleApiKeyVisibility() {
      this.$emit('toggle-api-key-visibility')
    },

    testApiKey() {
      this.$emit('test-api-key')
    },

    connectApiKey() {
      this.$emit('connect-api-key')
    },

    onApiKeyChange() {
      this.$emit('save-settings')
    },

    onModelChange() {
      this.$emit('load-models')
      this.$emit('save-settings')
    },

    onTTSChange() {
      this.$emit('save-settings')
    },

    onSTTChange() {
      this.$emit('save-settings')
    },

    onVoiceToggle() {
      this.$emit('save-settings')
    },

    onHandsFreeToggle() {
      this.$emit('save-settings')
    },

    onMuteCuesToggle() {
      this.$emit('save-settings')
    },

    onMicrophoneChange() {
      this.$emit('save-settings')
    },

    onLanguageChange() {
      this.$emit('save-settings')
    },

    getModelLimits(model) {
      const inputK = Math.floor(model.inputTokenLimit / 1000)
      const outputK = Math.floor(model.outputTokenLimit / 1000)
      return `${inputK}K in / ${outputK}K out`
    },

    getModelTooltip(model) {
      const capabilities = []
      if (model.capabilities) {
        const caps = model.capabilities
        if (caps.multiTurn) capabilities.push('Chat')
        if (caps.imageInput) capabilities.push('Vision')
        if (caps.videoInput) capabilities.push('Video')
        if (caps.audioInput || caps.audioOutput) capabilities.push('Audio')
        if (caps.realtimeChat) capabilities.push('Real-time')
        if (caps.codeGeneration) capabilities.push('Code')
      }

      return `${model.displayName}\n${model.description || ''}\nCapabilities: ${capabilities.join(', ')}`
    },

    formatTokens(tokens) {
      if (!tokens || tokens === 'Unknown') return 'See docs'
      if (tokens >= 1000000) return `${Math.floor(tokens / 1000000)}M`
      if (tokens >= 1000) return `${Math.floor(tokens / 1000)}K`
      return tokens.toString()
    },

    getPerformanceScore(model) {
      // Simple heuristic for performance score
      if (model.name.includes('2.5')) return 95
      if (model.name.includes('2.0')) return 90
      if (model.name.includes('1.5')) return 85
      return 80
    },
  },
}
</script>

<style scoped>
/* Modern AI Configuration Styles */
.modern-ai-config {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --secondary: #22d3ee;
  --accent: #f43f5e;
  --success: #10b981;
  --warning: #f59e0b;
  --dark: #0f172a;
  --dark-secondary: #1e293b;
  --dark-tertiary: #334155;
  --light: #f8fafc;
  --text-primary-600: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-secondary: #64748b;
  --glass: rgba(30, 41, 59, 0.9);
  --glass-light: rgba(148, 163, 184, 0.1);
  --border: rgba(148, 163, 184, 0.2);
  --glow: rgba(99, 102, 241, 0.3);

  font-family:
    -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  color: var(--text-primary-600);
  position: relative;
}

/* Animated background particles */
.modern-ai-config::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(99, 102, 241, 0.1) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 60%,
      rgba(34, 211, 238, 0.08) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 40% 80%,
      rgba(244, 63, 94, 0.06) 0%,
      transparent 40%
    );
  animation: floatBackground 30s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes floatBackground {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-20px, -20px) scale(1.02);
  }
  66% {
    transform: translate(20px, 10px) scale(0.98);
  }
}

/* Main header */
.main-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.main-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    var(--primary-light),
    var(--secondary),
    var(--accent)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: gradientShift 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.main-header p {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

/* Settings card */
.settings-card {
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.settings-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--primary-light),
    transparent
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Section styling */
.section {
  padding: 2rem;
  border-b: 1px solid var(--border);
  position: relative;
}

.section:last-child {
  border-b: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 10px 20px var(--glow);
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.section-title {
  flex: 1;
}

.section-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: 0.25rem;
}

.section-title p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Form controls */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary-600);
  font-size: 0.875rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--dark-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary-600);
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--glow);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

/* Input with button group */
.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .form-input {
  flex: 1;
}

/* Button group */
.button-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px var(--glow);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--dark-secondary);
  border: 1px solid var(--primary);
  color: var(--primary);
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, var(--success), #059669);
}

.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Status indicator */
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--dark-secondary);
  border-radius: 20px;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
}

.status.connected .status-dot {
  background: var(--success);
  animation: statusGlow 2s ease-in-out infinite;
}

@keyframes statusGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--success);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.2);
  }
}

/* Status message */
.status-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.status-message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.status-message.error {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #f43f5e;
}

/* Model info card */
.model-card {
  background: var(--dark-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.model-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--primary),
    var(--secondary),
    var(--accent)
  );
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s;
}

.model-card:hover::after {
  transform: scaleX(1);
}

.model-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 20px;
  font-size: 0.875rem;
  color: white;
  margin-bottom: 0.75rem;
}

.model-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.model-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-light);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Model capabilities */
.capability-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.capability-badge {
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--primary-light);
}

/* Toggle switches */
.toggle-group {
  background: var(--dark-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-item:last-child {
  margin-bottom: 0;
}

.toggle-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toggle-label strong {
  color: var(--text-primary-600);
  font-size: 0.9375rem;
}

.toggle-label small {
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--dark-tertiary);
  transition: 0.4s;
  border-radius: 26px;
}

.toggle-slider::before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
}

input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

/* Voice engines grid */
.voice-engines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Device settings grid */
.device-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* Radio buttons */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--dark-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.radio-item:hover,
.radio-item.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.radio-item input[type='radio'] {
  margin-top: 0.25rem;
  accent-color: var(--primary);
}

.radio-content {
  flex: 1;
}

.radio-content strong {
  display: block;
  color: var(--text-primary-600);
  margin-bottom: 0.25rem;
}

.radio-content small {
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

/* Help text */
.help-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  border-l: 3px solid var(--primary);
  border-radius: 0 8px 8px 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.help-text a {
  color: var(--primary-light);
  text-decoration: none;
  font-weight: 500;
}

.help-text a:hover {
  text-decoration: underline;
}

/* Spinner animation */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-header h1 {
    font-size: 1.75rem;
  }

  .section {
    padding: 1.5rem;
  }

  .voice-engines-grid,
  .device-settings-grid {
    grid-template-columns: 1fr;
  }

  .model-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .button-group {
    flex-direction: column;
  }
}

/* Dark theme compatibility */
@media (prefers-color-scheme: dark) {
  .modern-ai-config {
    --text-primary-600: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-secondary: #64748b;
  }
}
</style>
