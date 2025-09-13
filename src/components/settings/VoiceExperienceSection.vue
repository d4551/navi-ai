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
          <label for="tts-provider" class="form-label fw-medium">Text-to-Speech Provider</label>
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
                <i class="bi bi-exclamation-triangle"></i>
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
                <i class="bi bi-exclamation-triangle"></i>
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
          <label for="kokoro-model" class="form-label fw-medium">Kokoro Voice Model</label>
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
              <label for="voice-quality" class="form-label">Quality Level</label>
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
                {{ isTesting ? "Testing..." : "Test Voice" }}
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
              <span>Independent of notifications; respects reduced-motion
                preference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

import { computed, refonUnmounted } from "vue";
import {
  SoundwaveIconComponent,
  SettingsIconComponent,
  SlashIconComponent,
} from "./SettingsIcons.js";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import {
  getVoiceService,
  getVoiceQualityPreferences,
  setVoiceQualityPreferences,
} from "@/utils/voice";

export default {
  name: "VoiceExperienceSection",
  components: {
    SoundwaveIconComponent,
    SettingsIconComponent,
    SlashIconComponent,
    UnifiedButton,
  },
  props: {
    voiceSettings: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["save", "update:voiceSettings"],
  setup(_props, { emit }) {
    const voiceService = getVoiceService();

    // Create a computed property that handles v-model properly
    const localSettings = computed({
      get() {
        return {
          voiceMode: false,
          ttsProvider: "system",
          kokoroModel: "default",
          voiceHandsFree: false,
          chatCuesMuted: false,
          ...props.voiceSettings,
        };
      },
      set(value) {
        emit("save", value);
        emit("update:voiceSettings", value);
      },
    });


    const qualitySettings = ref(getVoiceQualityPreferences());
    const providerHealth = ref({});
    const testMessage = ref(
      "This is a test of the voice synthesis system. Quality and responsiveness are being evaluated.",
    );
    const testResults = ref([]);
    const isTesting = ref(false);
    const isRunningDiagnostics = ref(false);
    const liveMonitoring = ref(false);

    // Provider health monitoring
    const updateProviderHealth = () => {
      try {
        providerHealth.value = voiceService.getProviderHealth();
      } catch {
        // Failed to get provider health - this is expected if service is not configured
        const currentProvider = localSettings.value.ttsProvider || "system";
        providerHealth.value[currentProvider] = {
          status: "error",
          message: "Service unavailable",
        };
      }
    };

    // Quality settings management
    const updateQualitySettings = () => {
      setVoiceQualityPreferences(qualitySettings.value);
    };

    // Provider testing
    const testCurrentProvider = async () => {
      if (!testMessage.value.trim() || isTesting.value) return;

      isTesting.value = true;
      const startTime = Date.now();
      const provider = localSettings.value.ttsProvider;

      try {
        await voiceService.speak(testMessage.value, {
          provider,
          ...localSettings.value,
        });

        const duration = Date.now() - startTime;
        const result = {
          id: Date.now(),
          provider,
          success: true,
          message: "Voice test completed successfully",
          duration,
          timestamp: Date.now(),
        };

        testResults.value.push(_result);
      } catch (_error) {
        const result = {
          id: Date.now(),
          provider,
          success: false,
          message: error.message,
          timestamp: Date.now(),
        };

        testResults.value.push(_result);
      } finally {
        isTesting.value = false;
        updateProviderHealth();
      }
    };

    // Full diagnostics
    const runFullDiagnostics = async () => {
      isRunningDiagnostics.value = true;

      try {
        await voiceService.getDiagnosticsReport();
        // Diagnostics completed successfully - report available in dev console if needed
        updateProviderHealth();
      } catch {
        // Diagnostics failed - provider may not be available
        providerHealth.value = {
          status: "error",
          message: "Diagnostics failed",
        };
      } finally {
        isRunningDiagnostics.value = false;
      }
    };

    // Live monitoring
    const toggleLiveMonitoring = () => {
      if (liveMonitoring.value) {
        voiceService.startMonitoring((_data) => {
          updateProviderHealth();
          // Monitoring data available - processing in background
        }, 15000);
      } else {
        voiceService.stopMonitoring();
      }
    };


    const formatProviderName = (provider) => {
      const names = {
        system: "System TTS",
        gemini: "Gemini AI",
        "google-cloud": "Google Cloud",
        kokoro: "Kokoro TTS",
      };
      return names[provider] || provider;
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };

    // Lifecycle
    onMounted(() => {
      updateProviderHealth();

      onUnmounted(() => {
        if (liveMonitoring.value) {
          voiceService.stopMonitoring();
        }
      });
    });

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
    };
  },
};
</script>

<style scoped>
.provider-health-grid {
  display: grid;
}

.health-indicator {
  background: var(--surface-elevated);
  text-align: center;
}

.health-indicator.health-healthy {
  background: linear-gradient(
  );
}

.health-indicator.health-degraded {
  background: linear-gradient(
  );
}

.health-indicator.health-failed {
  background: linear-gradient(
  );
}

.health-indicator.health-unknown {
  background: linear-gradient(
  );
}

.health-provider {
  color: var(--text-primary);
}

.health-score {
}

.health-healthy .health-score {
}

.health-degraded .health-score {
}

.health-failed .health-score {
}

.health-unknown .health-score {
}

.health-status {
  text-transform: uppercase;
}

.health-healthy .health-status {
}

.health-degraded .health-status {
}

.health-failed .health-status {
}

.health-unknown .health-status {
}

.tts-testing-panel {
  background: var(--surface-glass);
}

.test-results {
}

.test-results-list {
  overflow-y: auto;
  scrollbar-width: thin;
}

.test-result-item {
  background: var(--surface-elevated);
}

.test-result-item.success {
  background: linear-gradient(
  );
}

.test-result-item.error {
  background: linear-gradient(
  );
}

.test-result-item:hover {
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-provider {
  color: var(--text-primary);
}

.result-time {
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.result-message {
  color: var(--text-secondary);
}

.result-duration {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.success .result-duration {
}

  .provider-health-grid {
  }

  .test-result-item {
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.spinner-border-sm {
}

.glass-input:focus-within {
}
</style>
