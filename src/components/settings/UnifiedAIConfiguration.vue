<template>
  <div class="modern-ai-config" role="region" aria-labelledby="ai-config-title">
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
          <div class="section-icon">🔑</div>
          <div class="section-title">
            <h3>API Configuration</h3>
            <p>Connect your Gemini API for AI-powered features</p>
          </div>
          <div :class="['status', settings.geminiApiKey ? 'connected' : '']">
            <span class="status-dot"></span>
            <span>{{
              settings.geminiApiKey ? "Connected" : "Not Connected"
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
              {{ showApiKey ? "🙈" : "👁️" }}
            </button>
          </div>
          <div class="help-text">
            <span>🔑</span>
            <span>Get your API key from
              <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a></span>
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
            <span>{{ testing ? "Testing..." : "Test Connection" }}</span>
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="!settings.geminiApiKey || connecting"
            @click="connectApiKey"
          >
            <span v-if="connecting" class="spinner">⟳</span>
            <span v-else>🔄</span>
            <span>{{ connecting ? "Connecting..." : "Refresh Models" }}</span>
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
                "Advanced AI model with extended context"
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
              >💬 Chat</span>
              <span
                v-if="selectedModelInfo.capabilities.imageInput"
                class="capability-badge"
              >👁️ Vision</span>
              <span
                v-if="selectedModelInfo.capabilities.videoInput"
                class="capability-badge"
              >🎥 Video</span>
              <span
                v-if="selectedModelInfo.capabilities.audioInput"
                class="capability-badge"
              >🎤 Audio In</span>
              <span
                v-if="selectedModelInfo.capabilities.audioOutput"
                class="capability-badge"
              >🔊 Audio Out</span>
              <span
                v-if="selectedModelInfo.capabilities.realtimeChat"
                class="capability-badge"
              >⚡ Real-time</span>
              <span
                v-if="selectedModelInfo.capabilities.codeGeneration"
                class="capability-badge"
              >👨‍💻 Code</span>
              <span
                v-if="selectedModelInfo.capabilities.streaming"
                class="capability-badge"
              >🌊 Streaming</span>
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
import { computed, reactive, watch } from "vue";
import { useAppStore } from "@/stores/app";

export default {
  name: "UnifiedAIConfiguration",
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
    "update:settings",
    "toggle-api-key-visibility",
    "test-api-key",
    "connect-api-key",
    "load-models",
    "save-settings",
  ],
  setup(props, { emit }) {
    const store = useAppStore();

    const localSettings = reactive({
      geminiApiKey: props.settings.geminiApiKey || "",
      selectedModel: props.settings.selectedModel || "gemini-2.5-flash",
      ttsProvider: props.settings.ttsProvider || "system",
      sttProvider: props.settings.sttProvider || "system",
      voiceEnabled: props.settings.voiceEnabled ?? true,
      handsFreeMode: props.settings.handsFreeMode ?? false,
      muteChatCues: props.settings.muteChatCues ?? false,
      microphoneDevice: props.settings.microphoneDevice || "default",
      recognitionLanguage: props.settings.recognitionLanguage || "en-US",
    });

    // Watch for changes and emit updates
    watch(
      localSettings,
      (newSettings) => {
        emit("update:settings", { ...props.settings, ...newSettings });
      },
      { deep: true },
    );

    // Watch for external settings changes
    watch(
      () => props.settings,
      (newSettings) => {
        Object.assign(localSettings, newSettings);
      },
      { deep: true },
    );

    const availableModels = computed(() => {
      const models = store.availableModels;
      return Array.isArray(models) ? models : [];
    });

    const selectedModelInfo = computed(() => {
      const info = store.selectedModelInfo;
      if (info && typeof info === "object" && !("then" in info)) return info;
      return null;
    });

    const latestModels = computed(() => {
      return availableModels.value.filter(
        (m) => m.name.includes("2.5") || m.name.includes("2.0"),
      );
    });

    const otherModels = computed(() => {
      return availableModels.value.filter(
        (m) => !m.name.includes("2.5") && !m.name.includes("2.0"),
      );
    });

    return {
      localSettings,
      availableModels,
      selectedModelInfo,
      latestModels,
      otherModels,
    };
  },
  methods: {
    toggleApiKeyVisibility() {
      this.$emit("toggle-api-key-visibility");
    },

    testApiKey() {
      this.$emit("test-api-key");
    },

    connectApiKey() {
      this.$emit("connect-api-key");
    },

    onApiKeyChange() {
      this.$emit("save-settings");
    },

    onModelChange() {
      this.$emit("load-models");
      this.$emit("save-settings");
    },

    onTTSChange() {
      this.$emit("save-settings");
    },

    onSTTChange() {
      this.$emit("save-settings");
    },

    onVoiceToggle() {
      this.$emit("save-settings");
    },

    onHandsFreeToggle() {
      this.$emit("save-settings");
    },

    onMuteCuesToggle() {
      this.$emit("save-settings");
    },

    onMicrophoneChange() {
      this.$emit("save-settings");
    },

    onLanguageChange() {
      this.$emit("save-settings");
    },

    getModelLimits(model) {
      const inputK = Math.floor(model.inputTokenLimit / 1000);
      const outputK = Math.floor(model.outputTokenLimit / 1000);
      return `${inputK}K in / ${outputK}K out`;
    },

    getModelTooltip(model) {
      const capabilities = [];
      if (model.capabilities) {
        const caps = model.capabilities;
        if (caps.multiTurn) capabilities.push("Chat");
        if (caps.imageInput) capabilities.push("Vision");
        if (caps.videoInput) capabilities.push("Video");
        if (caps.audioInput || caps.audioOutput) capabilities.push("Audio");
        if (caps.realtimeChat) capabilities.push("Real-time");
        if (caps.codeGeneration) capabilities.push("Code");
      }

      return `${model.displayName}\n${model.description || ""}\nCapabilities: ${capabilities.join(", ")}`;
    },

    formatTokens(tokens) {
      if (!tokens || tokens === "Unknown") return "See docs";
      if (tokens >= 1000000) return `${Math.floor(tokens / 1000000)}M`;
      if (tokens >= 1000) return `${Math.floor(tokens / 1000)}K`;
      return tokens.toString();
    },

    getPerformanceScore(model) {
      // Simple heuristic for performance score
      if (model.name.includes("2.5")) return 95;
      if (model.name.includes("2.0")) return 90;
      if (model.name.includes("1.5")) return 85;
      return 80;
    },
  },
};
</script>

<style scoped>
.modern-ai-config {

  font-family:
    -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
  color: var(--text-primary);
  position: relative;
}

.modern-ai-config::before {
  content: "";
  position: fixed;
  background:
    radial-gradient(
    ),
    radial-gradient(
    ),
    radial-gradient(
    );
  pointer-events: none;
}

@keyframes floatBackground {
  }
  }
  }
}

.main-header {
  text-align: center;
  position: relative;
}

  background: linear-gradient(
    var(--primary-light),
    var(--secondary),
    var(--accent)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes gradientShift {
  }
  }
  }
}

.main-header p {
  color: var(--text-secondary);
}

.settings-card {
  background: var(--glass);
  overflow: hidden;
  position: relative;
}

.settings-card::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    var(--primary-light),
    transparent
  );
}

@keyframes shimmer {
  }
  }
}

.section {
  position: relative;
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

@keyframes iconPulse {
  }
  }
}

.section-title {
}

  color: var(--text-primary);
}

.section-title p {
  color: var(--text-secondary);
}

.form-group {
}

.form-label {
  display: block;
  color: var(--text-primary);
}

.form-input,
.form-select {
  background: var(--dark-secondary);
  color: var(--text-primary);
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.input-group {
  display: flex;
}

.input-group .form-input {
}

.button-group {
  display: flex;
}

.btn {
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  transition:
}

.btn:active::before {
}

.btn:hover {
}

.btn:disabled {
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--dark-secondary);
  color: var(--primary);
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.btn-success {
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status {
  display: inline-flex;
  align-items: center;
  background: var(--dark-secondary);
}

.status-dot {
  background: var(--text-muted);
}

.status.connected .status-dot {
  background: var(--success);
}

@keyframes statusGlow {
  }
  }
}

.status-message {
}

.status-message.success {
}

.status-message.error {
}

.model-card {
  background: var(--dark-secondary);
  position: relative;
  overflow: hidden;
}

.model-card::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    var(--primary),
    var(--secondary),
    var(--accent)
  );
  transform-origin: left;
}

.model-card:hover::after {
}

.model-badge {
  display: inline-block;
  color: white;
}

.model-description {
  color: var(--text-secondary);
}

.model-stats {
  display: grid;
}

.stat {
  text-align: center;
}

.stat-value {
  color: var(--primary-light);
}

.stat-label {
  color: var(--text-secondary);
}

.capability-badges {
  display: flex;
  flex-wrap: wrap;
}

.capability-badge {
  color: var(--primary-light);
}

.toggle-group {
  background: var(--dark-secondary);
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-item:last-child {
}

.toggle-label {
  display: flex;
  flex-direction: column;
}

.toggle-label strong {
  color: var(--text-primary);
}

.toggle-label small {
  color: var(--text-secondary);
}

.toggle-switch {
  position: relative;
}

.toggle-switch input {
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  background: var(--dark-tertiary);
}

.toggle-slider::before {
  position: absolute;
  content: "";
  background: white;
}

input:checked + .toggle-slider {
}

input:checked + .toggle-slider::before {
}

.voice-engines-grid {
  display: grid;
}

.device-settings-grid {
  display: grid;
}

.radio-group {
  display: flex;
  flex-direction: column;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  background: var(--dark-secondary);
  cursor: pointer;
}

.radio-item:hover,
.radio-item.active {
  border-color: var(--primary);
}

.radio-item input[type="radio"] {
  accent-color: var(--primary);
}

.radio-content {
}

.radio-content strong {
  display: block;
  color: var(--text-primary);
}

.radio-content small {
  color: var(--text-secondary);
}

.help-text {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.help-text a {
  color: var(--primary-light);
  text-decoration: none;
}

.help-text a:hover {
  text-decoration: underline;
}

.spinner {
}

@keyframes spin {
  from {
  }
  to {
  }
}

  }

  .section {
  }

  .voice-engines-grid,
  .device-settings-grid {
  }

  .model-stats {
  }

  .button-group {
    flex-direction: column;
  }
}

@media (prefers-color-scheme: dark) {
  .modern-ai-config {
  }
}
</style>
