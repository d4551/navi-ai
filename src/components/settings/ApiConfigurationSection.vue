<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="settings-card glass-card section-card mb-4" role="region" aria-labelledby="ai-config-title">
    <div class="card-header section-header card-header--dense">
      <h5 id="ai-config-title" class="mb-0">
        <KeyIconComponent class="me-2 icon-sm" />API Configuration
      </h5>
    </div>
    <div class="card-body section-body card-body--dense">
      <form novalidate @submit.prevent="$emit('save-settings')">
        <!-- API Key Section -->
        <div class="api-key-section mb-4 p-3 border rounded-3 glass-input">
          <div class="d-flex align-items-center mb-3">
            <KeyIconComponent class="me-2 text-primary" />
            <h6 class="mb-0 text-primary fw-bold">API Configuration</h6>
          </div>

          <div class="mb-3">
            <label for="gemini-api-key" class="form-label fw-medium">Gemini API Key *</label>
            <div class="input-group">
              <input
                id="gemini-api-key"
                :value="settings.geminiApiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="form-control glass-input"
                placeholder="Enter your Gemini API key"
                autocomplete="off"
                :aria-describedby="showApiKey ? 'api-key-help api-key-visible' : 'api-key-help'"
                @input="updateSetting('geminiApiKey', $event.target.value)"
              />
              <IconButton
                :aria-label="showApiKey ? 'Hide API key' : 'Show API key'"
                variant="outline"
                size="sm"
                :icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                @click="$emit('toggle-api-key-visibility')"
              />
            </div>
            <div v-if="showApiKey" id="api-key-visible" class="visually-hidden">
              API key is currently visible
            </div>
            <div id="api-key-help" class="form-text api-key-hint">
              <span class="hint-prefix" aria-hidden="true"><KeyIconComponent class="me-1 icon-xs" /></span>
              <span class="hint-text">Get your API key from
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener"
                  class="external-link"
                  aria-label="Open Google AI Studio API key page in a new tab"
                >Google AI Studio<span class="visually-hidden">
                  (opens in new tab)</span></a></span>
            </div>
          </div>

          <!-- Test & Connect Actions -->
          <div class="d-flex gap-2 flex-wrap align-items-center">
            <UnifiedButton
              type="button"
              variant="glass"
              size="sm"
              :disabled="!settings.geminiApiKey || testing"
              leading-icon="mdi-flask"
              @click="$emit('test-api-key')"
            >
              <span v-if="testing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              {{ testing ? 'Testing...' : 'Test API Key' }}
            </UnifiedButton>
            <UnifiedButton
              type="button"
              variant="primary"
              size="sm"
              :disabled="!settings.geminiApiKey || connecting"
              leading-icon="mdi-connection"
              @click="$emit('connect-api-key')"
            >
              <span v-if="connecting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              {{ connecting ? 'Connecting...' : 'Connect' }}
            </UnifiedButton>
            <div
              v-if="apiTestResult"
              :class="['alert mb-0 ms-2 flex-grow-1', apiTestResult.success ? 'alert-success' : 'alert-danger']"
              role="alert"
            >
              <small>{{ safeMessage(apiTestResult.message) }}</small>
            </div>
          </div>
        </div>

        <!-- AI Model Section -->
        <div class="ai-model-section mb-4 p-3 border rounded-3 glass-input">
          <div class="d-flex align-items-center mb-3">
            <CpuIconComponent class="me-2 text-primary" />
            <h6 class="mb-0 text-primary fw-bold">AI Model Selection</h6>
          </div>

          <div class="mb-3">
            <label for="ai-model" class="form-label fw-medium">Select Model</label>
            <div class="d-flex align-items-center gap-2">
              <select
                id="ai-model"
                :value="settings.selectedModel"
                class="form-select glass-input"
                :disabled="loadingModels || !settings.geminiApiKey"
                aria-describedby="model-help"
                @change="updateSetting('selectedModel', $event.target.value)"
              >
                <optgroup
                  v-if="availableModels.some((m) => m.isRecommended)"
                  label="⭐ Recommended"
                >
                  <option
                    v-for="m in availableModels.filter(
                      (model) => model.isRecommended,
                    )"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ safeDisplayName(m.displayName) }} -
                    {{ safeTokenLimit(m.inputTokenLimit) }}K in /
                    {{ safeTokenLimit(m.outputTokenLimit) }}K out
                  </option>
                </optgroup>
                <optgroup
                  v-if="
                    availableModels.some(
                      (m) => m.category === 'experimental',
                    )
                  "
                  label="🧪 Experimental"
                >
                  <option
                    v-for="m in availableModels.filter(
                      (model) => model.category === 'experimental',
                    )"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ safeDisplayName(m.displayName) }} -
                    {{ safeTokenLimit(m.inputTokenLimit) }}K in /
                    {{ safeTokenLimit(m.outputTokenLimit) }}K out
                  </option>
                </optgroup>
                <optgroup
                  v-if="
                    availableModels.some(
                      (m) =>
                        !m.isRecommended && m.category !== 'experimental',
                    )
                  "
                  label="📝 Other Models"
                >
                  <option
                    v-for="m in availableModels.filter(
                      (model) =>
                        !model.isRecommended &&
                        model.category !== 'experimental',
                    )"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ safeDisplayName(m.displayName) }} -
                    {{ safeTokenLimit(m.inputTokenLimit) }}K in /
                    {{ safeTokenLimit(m.outputTokenLimit) }}K out
                  </option>
                </optgroup>
              </select>
              <span
                v-if="loadingModels"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              />
              <UnifiedButton
                type="button"
                variant="glass"
                size="sm"
                :disabled="loadingModels || !settings.geminiApiKey"
                leading-icon="mdi-refresh"
                @click="$emit('load-models')"
              >
                Refresh
              </UnifiedButton>
            </div>
            <div id="model-help" class="form-text hint-chip" role="note">
              <CpuIconComponent />
              <span>Models are fetched from Gemini based on your API key</span>
            </div>
          </div>

          <!-- Selected Model Information -->
          <div
            v-if="selectedModelInfo"
            class="model-info-card card border-0 glass-subtle"
          >
            <div class="card-body section-body p-3">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-primary rounded-pill">{{
                  safeDisplayName(selectedModelInfo.displayName)
                }}</span>
                <span
                  v-if="selectedModelInfo.isRecommended"
                  class="badge bg-success rounded-pill"
                ><AppIcon name="mdi-star" color="warning" context="achievement" aria-hidden="true" /> Recommended</span>
                <span
                  v-if="selectedModelInfo.category === 'experimental'"
                  class="badge bg-warning rounded-pill"
                ><AppIcon name="mdi-test-tube" size="small" /> Experimental</span>
              </div>
              <p class="card-text small mb-2">
                {{ safeMessage(selectedModelInfo.description) }}
              </p>
              <div class="row g-2 small text-muted">
                <div class="col-6">
                  <strong>Input:</strong>
                  {{ safeTokenLimit(selectedModelInfo.inputTokenLimit) }}K tokens
                </div>
                <div class="col-6">
                  <strong>Output:</strong>
                  {{ safeTokenLimit(selectedModelInfo.outputTokenLimit) }}K tokens
                </div>
                <div v-if="selectedModelInfo.capabilities" class="col-6">
                  <strong>Score:</strong>
                  {{ safeMessage(selectedModelInfo.capabilities.score) }}/100
                </div>
                <div v-if="selectedModelInfo.pricing" class="col-6">
                  <strong>Cost:</strong> ${{ safeMessage(selectedModelInfo.pricing.input) }}/1M in
                </div>
              </div>
              <div
                v-if="selectedModelInfo.capabilities?.features?.length"
                class="mt-2"
              >
                <span
                  v-for="feature in selectedModelInfo.capabilities
                    .features"
                  :key="feature"
                  class="badge bg-light text-dark me-1 mb-1"
                >
                  {{ safeMessage(feature.replace("-", " ")) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Voice & Audio Configuration -->
        <div class="voice-audio-section mb-4 p-3 border rounded-3 glass-input">
          <div class="d-flex align-items-center mb-3">
            <SoundwaveIconComponent class="me-2 text-primary" />
            <h6 class="mb-0 text-primary fw-bold">Voice & Audio Settings</h6>
          </div>

          <!-- Voice Mode Toggle -->
          <div class="mb-3 p-3 border rounded-3 glass-subtle">
            <div class="form-check form-switch mb-2">
              <input
                id="voice-mode"
                v-model="settings.voiceMode"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label fw-medium" for="voice-mode">
                Voice Mode (auto‑play assistant responses)
              </label>
            </div>
            <div class="form-text hint-chip" role="note">
              <SoundwaveIconComponent />
              <span>Requires browser speech synthesis support</span>
            </div>
          </div>

          <!-- TTS & STT Selection -->
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <div class="p-3 border rounded-3 glass-subtle">
                <label class="form-label fw-medium mb-2">Text-to-Speech Engine</label>
                <div class="d-flex flex-column gap-2">
                  <div class="form-check">
                    <input
                      id="tts-system"
                      v-model="settings.ttsProvider"
                      class="form-check-input"
                      type="radio"
                      value="system"
                    />
                    <label class="form-check-label" for="tts-system">
                      <strong>System TTS</strong>
                      <br /><small class="text-muted">Fast, reliable browser voices</small>
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      id="tts-gemini"
                      v-model="settings.ttsProvider"
                      class="form-check-input"
                      type="radio"
                      value="gemini"
                      :disabled="!settings.geminiApiKey"
                    />
                    <label class="form-check-label" for="tts-gemini">
                      <strong>Navi AI Real-time</strong>
                      <br /><small class="text-muted">Natural AI voice (requires API key)</small>
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      id="tts-kokoro"
                      v-model="settings.ttsProvider"
                      class="form-check-input"
                      type="radio"
                      value="kokoro"
                    />
                    <label class="form-check-label" for="tts-kokoro">
                      <strong>Kokoro TTS</strong>
                      <br /><small class="text-muted">Local neural voice models (offline)</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="p-3 border rounded-3 glass-subtle">
                <label class="form-label fw-medium mb-2">Speech-to-Text Engine</label>
                <div class="d-flex flex-column gap-2">
                  <div class="form-check">
                    <input
                      id="stt-system"
                      v-model="settings.sttProvider"
                      class="form-check-input"
                      type="radio"
                      value="system"
                    />
                    <label class="form-check-label" for="stt-system">
                      <strong>System STT</strong>
                      <br /><small class="text-muted">Built‑in browser recognition</small>
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      id="stt-gemini"
                      v-model="settings.sttProvider"
                      class="form-check-input"
                      type="radio"
                      value="gemini"
                      :disabled="!settings.geminiApiKey"
                    />
                    <label class="form-check-label" for="stt-gemini">
                      <strong>Navi AI Realtime</strong>
                      <br /><small class="text-muted">Cloud transcription (requires API key)</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Audio Device Configuration -->
          <div class="row g-3">
            <div class="col-lg-6">
              <label for="microphone-device" class="form-label fw-medium">Microphone Device</label>
              <div class="input-group">
                <select
                  id="microphone-device"
                  v-model="settings.selectedMicId"
                  class="form-select glass-input"
                  :disabled="!audioDevices.length"
                  aria-describedby="microphone-help"
                >
                  <option value="">System Default</option>
                  <option
                    v-for="device in audioDevices"
                    :key="device.deviceId"
                    :value="device.deviceId"
                  >
                    {{
                      device.label ||
                        `Microphone ${device.deviceId.slice(0, 8)}...`
                    }}
                  </option>
                </select>
                <IconButton
                  :disabled="loadingDevices"
                  aria-label="Refresh microphone list"
                  variant="outline"
                  size="sm"
                  icon="mdi-refresh"
                  @click="$emit('load-audio-devices')"
                />
              </div>
              <div
                id="microphone-help"
                class="form-text hint-chip"
                role="note"
              >
                <MicIconComponent />
                <span>Select your preferred microphone for voice input and
                  interview recordings.</span>
              </div>
            </div>

            <div class="col-lg-6">
              <label for="voice-lang" class="form-label fw-medium">Speech Recognition Language</label>
              <select
                id="voice-lang"
                v-model="settings.voiceLang"
                class="form-select glass-input"
                aria-describedby="voice-lang-help"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="en-CA">English (CA)</option>
                <option value="en-AU">English (AU)</option>
              </select>
              <div id="voice-lang-help" class="form-text">
                Used for speech recognition in chat.
              </div>
            </div>

            <div
              v-show="settings.ttsProvider === 'system' || settings.ttsProvider === 'kokoro'"
              class="col-12"
            >
              <label for="tts-voice" class="form-label fw-medium">
                {{ settings.ttsProvider === 'kokoro' ? 'Kokoro Voice' : 'System Voice' }}
              </label>
              <select
                id="tts-voice"
                v-model="settings.ttsVoice"
                class="form-select glass-input"
                :disabled="!voices.length"
                aria-describedby="voice-tts-help"
              >
                <option value="">System Default</option>
                <option
                  v-for="v in voices"
                  :key="v.name + v.lang"
                  :value="v.name"
                >
                  {{ v.name }} ({{ v.lang }})
                </option>
              </select>
              <div id="voice-tts-help" class="form-text">
                Used for spoken responses. {{ settings.ttsProvider === 'kokoro' ? 'Kokoro uses system voices for speech synthesis.' : 'Populated from your system voices.' }}
              </div>
            </div>
          </div>

          <!-- Advanced Voice Settings -->
          <div class="mt-3">
            <div class="row g-3">
              <div class="col-sm-6">
                <div class="form-check form-switch">
                  <input
                    id="voice-handsfree"
                    v-model="settings.voiceHandsFree"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" for="voice-handsfree">
                    Hands‑free mode (auto‑listen after responses)
                  </label>
                </div>
                <div class="form-text">
                  When enabled, chat will re‑arm the mic after NAVI
                  finishes speaking.
                </div>
              </div>

              <div class="col-sm-6">
                <div class="form-check form-switch">
                  <input
                    id="chat-cues-muted-audio"
                    v-model="settings.chatCuesMuted"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" for="chat-cues-muted-audio">
                    Mute chat cues (vibration/sound)
                  </label>
                </div>
                <div class="form-text hint-chip" role="note">
                  <SlashIconComponent />
                  <span>Independent of notifications; respects reduced-motion
                    preference</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  KeyIconComponent,
  VisibilityIconComponent,
  VisibilityOffIconComponent,
  SoundwaveIconComponent,
  MicIconComponent,
  RefreshIconComponent,
  SlashIconComponent,
  CpuIconComponent,
  PlugIconComponent,
  CheckCircleIconComponent,
  CloseIconComponent
} from './SettingsIcons.js'

  export default {
    name: 'ApiConfigurationSection',
    components: {
      KeyIconComponent,
      VisibilityIconComponent,
      VisibilityOffIconComponent,
      SoundwaveIconComponent,
      MicIconComponent,
      RefreshIconComponent,
      SlashIconComponent,
      CpuIconComponent,
      PlugIconComponent,
      CheckCircleIconComponent,
      CloseIconComponent,
      AppIcon,
      UnifiedButton: () => import('@/components/ui/UnifiedButton.vue'),
      IconButton: () => import('@/components/ui/IconButton.vue')
    },
    props: {
      settings: {
        type: Object,
        required: true
      },
      showApiKey: {
        type: Boolean,
        default: false
      },
      testing: {
        type: Boolean,
        default: false
      },
      apiTestResult: {
        type: Object,
        default: null
      },
      availableModels: {
        type: Array,
        default: () => []
      },
      selectedModelInfo: {
        type: Object,
        default: null
      },
      loadingModels: {
        type: Boolean,
        default: false
      },
      connecting: {
        type: Boolean,
        default: false
      },
      voices: {
        type: Array,
        default: () => []
      },
      audioDevices: {
        type: Array,
        default: () => []
      },
      loadingDevices: {
        type: Boolean,
        default: false
      }
    },
    emits: [
      'toggle-api-key-visibility',
      'test-api-key',
      'connect-api-key',
      'load-models',
      'load-audio-devices',
      'save-settings',
      'update:settings'
    ],
    methods: {
      updateSetting(key, value) {
        const updatedSettings = { ...this.settings, [key]: value }
        this.$emit('update:settings', updatedSettings)
        this.$emit('save-settings')
      },
      safeDisplayName(name) {
        if (typeof name === 'string') return name
        if (name && typeof name.then === 'function') return 'Loading...'
        return String(name)
      },
      safeTokenLimit(limit) {
        if (typeof limit === 'number') return (limit / 1000).toFixed(0)
        return '?'
      },
      safeMessage(msg) {
        if (typeof msg === 'string') return msg
        if (msg && typeof msg.then === 'function') return 'Loading...'
        return String(msg)
      }
    }
  }
</script>

<style scoped>
/* Section styling */
.api-key-section,
.ai-model-section,
.voice-audio-section {
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  transition: all 0.3s ease;
}

.api-key-section:hover,
.ai-model-section:hover,
.voice-audio-section:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.08));
  border-color: var(--glass-border-hover, rgba(255, 255, 255, 0.2));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Model info card styling */
.model-info-card {
  background: var(--studio-card-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--studio-card-border);
  margin-top: 1rem;
}

.model-info-card.card {
  background: var(--studio-card-bg);
  border: 1px solid var(--studio-card-border);
  border-radius: var(--studio-card-radius);
}

.model-info-card .card-body {
  padding: 1rem;
}

/* Form control improvements */
.glass-input {
  background: var(--input-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--input-border, rgba(255, 255, 255, 0.1));
  color: var(--text-primary);
}

.glass-input:focus {
  background: var(--input-bg-focus, rgba(255, 255, 255, 0.08));
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--color-primary-500) 25%, transparent);
}

/* Remove custom button styling - let UnifiedButton handle glassmorphic design */

/* Use unified badge; keep default sizing from design system */

/* Responsive improvements */
@media (max-width: 768px) {
  .api-key-section,
  .ai-model-section,
  .voice-audio-section {
    margin-bottom: 1rem;
    padding: 1rem;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    align-items: stretch !important;
  }

  .d-flex.gap-2 .btn {
    margin-bottom: 0.5rem;
  }
}

/* Hint chip styling */
.hint-chip { display:inline-flex; align-items:center; gap: var(--spacing-1-5); padding: var(--spacing-1) var(--spacing-2); border-radius: var(--radius-full); border: 1px solid var(--glass-border); background: var(--glass-bg); color: var(--text-secondary); font-size: var(--badge-font-size); font-weight: var(--badge-font-weight); margin-top: var(--spacing-1); }
.hint-chip svg { width: 1rem; height: 1rem; opacity: 0.7; }

/* Form text improvements */
.form-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Icon improvements */
.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-xs {
  width: 1rem;
  height: 1rem;
}
</style>
