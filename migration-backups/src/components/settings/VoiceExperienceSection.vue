<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    class="settings-card mb-4"
    role="region"
    aria-labelledby="voice-experience-title"
  >
    <div class="card-header section-header card-header--dense">
      <h5 id="voice-experience-title" class="mb-0">
        <SoundwaveIconComponent class="me-2 icon-sm" />Voice Experience
      </h5>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- Voice Mode Toggle -->
      <div class="voice-mode-section mb-4 p-3 border rounded-3 glass-input">
        <div class="d-flex align-items-center mb-3">
          <SoundwaveIconComponent class="me-2 text-primary" />
          <h6 class="mb-0 text-primary fw-bold">Voice Interaction</h6>
        </div>

        <div class="form-check form-switch mb-2">
          <input
            id="voice-mode"
            v-model="localSettings.voiceMode"
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

      <!-- Advanced Voice Settings -->
      <div class="advanced-voice-section p-3 border rounded-3 glass-input">
        <div class="d-flex align-items-center mb-3">
          <SettingsIconComponent class="me-2 text-primary" />
          <h6 class="mb-0 text-primary fw-bold">Advanced Voice Settings</h6>
        </div>

        <!-- TTS Provider Selection -->
        <div class="mb-3">
          <label for="tts-provider" class="form-label fw-medium"
            >Text-to-Speech Provider</label
          >
          <select
            id="tts-provider"
            v-model="localSettings.ttsProvider"
            class="form-select glass-input"
          >
            <option value="system">System TTS (Browser Default)</option>
            <option value="gemini">Google AI (Gemini)</option>
            <option value="google-cloud">Google Cloud TTS</option>
            <option value="kokoro">Kokoro TTS (Neural Voice)</option>
          </select>
          <div class="form-text">
            <span v-if="localSettings.ttsProvider === 'system'">
              Uses your browser's built-in text-to-speech engine (fast and
              reliable)
            </span>
            <span v-else-if="localSettings.ttsProvider === 'gemini'">
              Uses Google AI Gemini for natural-sounding speech (requires API
              key)
              <div
                v-if="!localSettings.geminiApiKey"
                class="alert alert-warning mt-2 mb-0"
              >
                <ExclamationTriangleIcon class="h-4 w-4 inline-block mr-1" />
                <strong>API Key Required:</strong> Please set your Gemini API
                key in the AI & API section above to use Google AI TTS.
              </div>
            </span>
            <span v-else-if="localSettings.ttsProvider === 'google-cloud'">
              Uses Google Cloud Text-to-Speech API for professional-quality
              voices (requires separate Google Cloud API key)
              <div
                v-if="
                  !localSettings.googleCloudApiKey &&
                  !localSettings.geminiApiKey
                "
                class="alert alert-warning mt-2 mb-0"
              >
                <ExclamationTriangleIcon class="h-4 w-4 inline-block mr-1" />
                <strong>API Key Required:</strong> Google Cloud TTS requires a
                Google Cloud API key with Text-to-Speech permissions, not a
                Gemini API key.
              </div>
            </span>
            <span v-else-if="localSettings.ttsProvider === 'kokoro'">
              Uses Kokoro TTS with locally downloaded models for high-quality
              neural voice synthesis (no internet required)
            </span>
          </div>

          <!-- Provider Health Status -->
          <div
            v-if="providerHealth && Object.keys(providerHealth).length > 0"
            class="mt-3"
          >
            <label class="form-label fw-medium">Provider Health Status</label>
            <div class="provider-health-grid">
              <div
                v-for="(health, provider) in providerHealth"
                :key="provider"
                class="health-indicator"
                :class="`health-${health.status}`"
              >
                <div class="health-provider">
                  {{ formatProviderName(provider) }}
                </div>
                <div class="health-score">{{ health.healthScore }}%</div>
                <div class="health-status">{{ health.status }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kokoro Model Selection (only shown when Kokoro is selected) -->
        <div v-if="localSettings.ttsProvider === 'kokoro'" class="mb-3">
          <label for="kokoro-model" class="form-label fw-medium"
            >Kokoro Voice Model</label
          >
          <select
            id="kokoro-model"
            v-model="localSettings.kokoroModel"
            class="form-select glass-input"
          >
            <option value="default">Default Voice</option>
            <option value="female-1">Female Voice 1</option>
            <option value="female-2">Female Voice 2</option>
            <option value="male-1">Male Voice 1</option>
            <option value="male-2">Male Voice 2</option>
            <option value="custom">Custom Model</option>
          </select>
          <div class="form-text">
            Select which locally downloaded Kokoro model to use for voice
            synthesis. Models are stored in
            <code>/public/local-models/kokoro/</code>
          </div>
        </div>

        <!-- Advanced Quality Settings -->
        <div class="mb-3">
          <label class="form-label fw-medium">Voice Quality Settings</label>
          <div class="row g-3">
            <div class="col-sm-6">
              <label for="voice-quality" class="form-label"
                >Quality Level</label
              >
              <select
                id="voice-quality"
                v-model="qualitySettings.preferredQuality"
                class="form-select glass-input form-select-sm"
                @change="updateQualitySettings"
              >
                <option value="fast">Fast (Lower latency)</option>
                <option value="balanced">Balanced (Recommended)</option>
                <option value="high">High (Best quality)</option>
              </select>
            </div>
            <div class="col-sm-6">
              <div class="form-check form-switch mt-4">
                <input
                  id="adaptive-quality"
                  v-model="qualitySettings.adaptiveQuality"
                  class="form-check-input"
                  type="checkbox"
                  @change="updateQualitySettings"
                />
                <label class="form-check-label" for="adaptive-quality">
                  Adaptive Quality
                </label>
              </div>
            </div>
          </div>
          <div class="form-text">
            Adaptive quality automatically adjusts based on network performance
            and provider health.
          </div>
        </div>

        <!-- TTS Testing Panel -->
        <div class="tts-testing-panel p-3 border rounded-3 glass-input">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="mb-0 text-primary fw-bold">
              Voice Testing & Diagnostics
            </h6>
            <UnifiedButton
              v-if="!isRunningDiagnostics"
              variant="outline"
              size="sm"
              leading-icon="mdi-medical-bag"
              @click="runFullDiagnostics"
            >
              Run Diagnostics
            </UnifiedButton>
            <div v-else class="d-flex align-items-center text-primary">
              <div
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></div>
              <span class="small">Running diagnostics...</span>
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-sm-8">
              <input
                v-model="testMessage"
                type="text"
                class="form-control glass-input form-control-sm"
                placeholder="Enter test message..."
                @keyup.enter="testCurrentProvider"
              />
            </div>
            <div class="col-sm-4">
              <UnifiedButton
                variant="primary"
                size="sm"
                leading-icon="mdi-play"
                :disabled="isTesting || !testMessage.trim()"
                @click="testCurrentProvider"
              >
                {{ isTesting ? 'Testing...' : 'Test Voice' }}
              </UnifiedButton>
            </div>
          </div>

          <!-- Live Monitoring Toggle -->
          <div class="form-check form-switch mb-3">
            <input
              id="live-monitoring"
              v-model="liveMonitoring"
              class="form-check-input"
              type="checkbox"
              @change="toggleLiveMonitoring"
            />
            <label class="form-check-label" for="live-monitoring">
              Live Performance Monitoring
            </label>
          </div>

          <!-- Test Results -->
          <div v-if="testResults.length > 0" class="test-results">
            <label class="form-label fw-medium">Recent Test Results</label>
            <div class="test-results-list">
              <div
                v-for="result in testResults.slice(-3)"
                :key="result.id"
                class="test-result-item"
                :class="{ success: result.success, error: !result.success }"
              >
                <div class="result-header">
                  <span class="result-provider">{{
                    formatProviderName(result.provider)
                  }}</span>
                  <span class="result-time">{{
                    formatTime(result.timestamp)
                  }}</span>
                </div>
                <div class="result-message">{{ result.message }}</div>
                <div v-if="result.duration" class="result-duration">
                  {{ result.duration }}ms
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-sm-6">
            <div class="form-check form-switch">
              <input
                id="voice-handsfree"
                v-model="localSettings.voiceHandsFree"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="voice-handsfree">
                Hands‑free mode (auto‑listen after responses)
              </label>
            </div>
            <div class="form-text">
              When enabled, chat will re‑arm the mic after NAVI finishes
              speaking.
            </div>
          </div>

          <div class="col-sm-6">
            <div class="form-check form-switch">
              <input
                id="chat-cues-muted-audio"
                v-model="localSettings.chatCuesMuted"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="chat-cues-muted-audio">
                Mute chat cues (vibration/sound)
              </label>
            </div>
            <div class="form-text hint-chip" role="note">
              <SlashIconComponent />
              <span
                >Independent of notifications; respects reduced-motion
                preference</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  SoundwaveIconComponent,
  SettingsIconComponent,
  SlashIconComponent,
} from './SettingsIcons.js'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import {
  getVoiceService,
  getVoiceQualityPreferences,
  setVoiceQualityPreferences,
} from '@/utils/voice'

export default {
  name: 'VoiceExperienceSection',
  components: {
    SoundwaveIconComponent,
    SettingsIconComponent,
    SlashIconComponent,
    ExclamationTriangleIcon,
    UnifiedButton,
  },
  props: {
    voiceSettings: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['save', 'update:voiceSettings'],
  setup(props, { emit }) {
    const voiceService = getVoiceService()

    // Create a computed property that handles v-model properly
    const localSettings = computed({
      get() {
        return {
          voiceMode: false,
          ttsProvider: 'system',
          kokoroModel: 'default',
          voiceHandsFree: false,
          chatCuesMuted: false,
          ...props.voiceSettings,
        }
      },
      set(value) {
        emit('save', value)
        emit('update:voiceSettings', value)
      },
    })

    // Enhanced functionality state
    const qualitySettings = ref(getVoiceQualityPreferences())
    const providerHealth = ref({})
    const testMessage = ref(
      'This is a test of the voice synthesis system. Quality and responsiveness are being evaluated.'
    )
    const testResults = ref([])
    const isTesting = ref(false)
    const isRunningDiagnostics = ref(false)
    const liveMonitoring = ref(false)

    // Provider health monitoring
    const updateProviderHealth = () => {
      try {
        providerHealth.value = voiceService.getProviderHealth()
      } catch (error) {
        // Failed to get provider health - this is expected if service is not configured
        providerHealth.value[provider] = {
          status: 'error',
          message: 'Service unavailable',
        }
      }
    }

    // Quality settings management
    const updateQualitySettings = () => {
      setVoiceQualityPreferences(qualitySettings.value)
    }

    // Provider testing
    const testCurrentProvider = async () => {
      if (!testMessage.value.trim() || isTesting.value) return

      isTesting.value = true
      const startTime = Date.now()
      const provider = localSettings.value.ttsProvider

      try {
        await voiceService.speak(testMessage.value, {
          provider,
          ...localSettings.value,
        })

        const duration = Date.now() - startTime
        const result = {
          id: Date.now(),
          provider,
          success: true,
          message: 'Voice test completed successfully',
          duration,
          timestamp: Date.now(),
        }

        testResults.value.push(result)
      } catch (error) {
        const result = {
          id: Date.now(),
          provider,
          success: false,
          message: error.message,
          timestamp: Date.now(),
        }

        testResults.value.push(result)
      } finally {
        isTesting.value = false
        updateProviderHealth()
      }
    }

    // Full diagnostics
    const runFullDiagnostics = async () => {
      isRunningDiagnostics.value = true

      try {
        const diagnosticsReport = await voiceService.getDiagnosticsReport()
        // Diagnostics completed successfully - report available in dev console if needed
        updateProviderHealth()
      } catch (error) {
        // Diagnostics failed - provider may not be available
        providerHealth.value = {
          status: 'error',
          message: 'Diagnostics failed',
        }
      } finally {
        isRunningDiagnostics.value = false
      }
    }

    // Live monitoring
    const toggleLiveMonitoring = () => {
      if (liveMonitoring.value) {
        voiceService.startMonitoring(data => {
          updateProviderHealth()
          // Monitoring data available - processing in background
        }, 15000)
      } else {
        voiceService.stopMonitoring()
      }
    }

    // Utility functions
    const formatProviderName = provider => {
      const names = {
        system: 'System TTS',
        gemini: 'Gemini AI',
        'google-cloud': 'Google Cloud',
        kokoro: 'Kokoro TTS',
      }
      return names[provider] || provider
    }

    const formatTime = timestamp => {
      return new Date(timestamp).toLocaleTimeString()
    }

    // Lifecycle
    onMounted(() => {
      updateProviderHealth()

      onUnmounted(() => {
        if (liveMonitoring.value) {
          voiceService.stopMonitoring()
        }
      })
    })

    return {
      localSettings,
      qualitySettings,
      providerHealth,
      testMessage,
      testResults,
      isTesting,
      isRunningDiagnostics,
      liveMonitoring,
      updateQualitySettings,
      testCurrentProvider,
      runFullDiagnostics,
      toggleLiveMonitoring,
      formatProviderName,
      formatTime,
    }
  },
}
</script>

<style scoped>
/* Provider Health Grid */
.provider-health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.health-indicator {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-base);
  background: var(--surface-elevated);
  text-align: center;
  transition: all 0.3s ease;
}

.health-indicator.health-healthy {
  border-color: var(--color-success-300);
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.1) 0%,
    rgba(34, 197, 94, 0.05) 100%
  );
}

.health-indicator.health-degraded {
  border-color: var(--color-warning-300);
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1) 0%,
    rgba(249, 115, 22, 0.05) 100%
  );
}

.health-indicator.health-failed {
  border-color: var(--color-danger-300);
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1) 0%,
    rgba(239, 68, 68, 0.05) 100%
  );
}

.health-indicator.health-unknown {
  border-color: var(--color-gray-300);
  background: linear-gradient(
    135deg,
    rgba(107, 114, 128, 0.1) 0%,
    rgba(107, 114, 128, 0.05) 100%
  );
}

.health-provider {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.health-score {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.health-healthy .health-score {
  color: var(--color-success-600);
}

.health-degraded .health-score {
  color: var(--color-warning-600);
}

.health-failed .health-score {
  color: var(--color-danger-600);
}

.health-unknown .health-score {
  color: var(--color-gray-600);
}

.health-status {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.health-healthy .health-status {
  color: var(--color-success-700);
}

.health-degraded .health-status {
  color: var(--color-warning-700);
}

.health-failed .health-status {
  color: var(--color-danger-700);
}

.health-unknown .health-status {
  color: var(--color-gray-700);
}

/* TTS Testing Panel */
.tts-testing-panel {
  background: var(--surface-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Test Results */
.test-results {
  margin-top: 1rem;
}

.test-results-list {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary-400) var(--surface-elevated);
}

.test-result-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  background: var(--surface-elevated);
  transition: all 0.3s ease;
}

.test-result-item.success {
  border-left-color: var(--color-success-500);
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.05) 0%,
    rgba(34, 197, 94, 0.02) 100%
  );
}

.test-result-item.error {
  border-left-color: var(--color-danger-500);
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.05) 0%,
    rgba(239, 68, 68, 0.02) 100%
  );
}

.test-result-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.result-provider {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.result-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.result-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.result-duration {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-weight: 600;
}

.success .result-duration {
  color: var(--color-success-600);
}

/* Responsive Design */
@media (max-width: 768px) {
  .provider-health-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .test-result-item {
    padding: 0.5rem;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* Loading States */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.125em;
}

/* Enhanced Glass Effect */
.glass-input:focus-within {
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}
</style>
