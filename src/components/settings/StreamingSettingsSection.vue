<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="streaming-settings glass-card section-card">
    <div class="card-header section-header">
      <h5 class="mb-0 d-flex align-items-center gap-2">
        <AppIcon name="mdi-video-settings" class="text-primary" />
        Video & Screen Streaming Settings
      </h5>
    </div>

    <div class="card-body section-body">
      <!-- Video Settings Section -->
      <div class="settings-subsection mb-4">
        <h6 class="text-primary mb-3 d-flex align-items-center gap-2">
          <AppIcon name="mdi-camera" />
          Video Settings
        </h6>

        <div class="row g-3">
          <div class="col-12">
            <div class="form-check form-switch">
              <input
                id="video-enabled"
                v-model="localSettings.streaming.video.enabled"
                class="form-check-input"
                type="checkbox"
                @change="updateSettings"
              />
              <label class="form-check-label" for="video-enabled">
                Enable Video Streaming
              </label>
            </div>
          </div>

          <div v-if="localSettings.streaming.video.enabled" class="col-12">
            <div class="row g-3">
              <!-- Camera Selection -->
              <div class="col-md-6">
                <label class="form-label" for="camera-select">
                  <AppIcon name="mdi-camera" />
                  Camera Device
                </label>
                <select
                  id="camera-select"
                  v-model="localSettings.streaming.video.selectedCameraId"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option value="">Default Camera</option>
                  <option
                    v-for="device in videoDevices"
                    :key="device.deviceId"
                    :value="device.deviceId"
                  >
                    {{ device.label }}
                  </option>
                </select>
              </div>

              <!-- Resolution -->
              <div class="col-md-6">
                <label class="form-label" for="video-resolution">
                  <AppIcon name="mdi-monitor" class="me-1" />
                  Video Resolution
                </label>
                <select
                  id="video-resolution"
                  v-model="localSettings.streaming.video.resolution"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>

              <!-- Frame Rate -->
              <div class="col-md-6">
                <label class="form-label" for="video-fps">
                  Frame Rate: {{ localSettings.streaming.video.frameRate }} FPS
                </label>
                <input
                  id="video-fps"
                  v-model.number="localSettings.streaming.video.frameRate"
                  type="range"
                  class="form-range"
                  min="5"
                  max="60"
                  step="5"
                  @input="updateSettings"
                />
                <div class="d-flex justify-content-between small text-muted">
                  <span>5 FPS</span>
                  <span>60 FPS</span>
                </div>
              </div>

              <!-- Video Options -->
              <div class="col-md-6">
                <div class="form-check">
                  <input
                    id="video-auto-start"
                    v-model="localSettings.streaming.video.autoStart"
                    class="form-check-input"
                    type="checkbox"
                    @change="updateSettings"
                  />
                  <label class="form-check-label" for="video-auto-start">
                    Auto-start camera on page load
                  </label>
                </div>

                <div class="form-check">
                  <input
                    id="video-show-preview"
                    v-model="localSettings.streaming.video.showPreview"
                    class="form-check-input"
                    type="checkbox"
                    @change="updateSettings"
                  />
                  <label class="form-check-label" for="video-show-preview">
                    Show video preview
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Screen Sharing Settings Section -->
      <div class="settings-subsection mb-4">
        <h6 class="text-success mb-3 d-flex align-items-center gap-2">
          <AppIcon name="mdi-monitor" />
          Screen Sharing Settings
        </h6>

        <div class="row g-3">
          <div class="col-12">
            <div class="form-check form-switch">
              <input
                id="screen-enabled"
                v-model="localSettings.streaming.screen.enabled"
                class="form-check-input"
                type="checkbox"
                @change="updateSettings"
              />
              <label class="form-check-label" for="screen-enabled">
                Enable Screen Sharing
              </label>
            </div>
          </div>

          <div v-if="localSettings.streaming.screen.enabled" class="col-12">
            <div class="row g-3">
              <!-- Screen Resolution -->
              <div class="col-md-4">
                <label class="form-label" for="screen-resolution">
                  Screen Resolution
                </label>
                <select
                  id="screen-resolution"
                  v-model="localSettings.streaming.screen.resolution"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>

              <!-- Frame Rate -->
              <div class="col-md-4">
                <label class="form-label" for="screen-fps">
                  Frame Rate: {{ localSettings.streaming.screen.frameRate }} FPS
                </label>
                <input
                  id="screen-fps"
                  v-model.number="localSettings.streaming.screen.frameRate"
                  type="range"
                  class="form-range"
                  min="5"
                  max="30"
                  step="1"
                  @input="updateSettings"
                />
                <div class="d-flex justify-content-between small text-muted">
                  <span>5 FPS</span>
                  <span>30 FPS</span>
                </div>
              </div>

              <!-- Cursor Setting -->
              <div class="col-md-4">
                <label class="form-label" for="cursor-setting">
                  Cursor Display
                </label>
                <select
                  id="cursor-setting"
                  v-model="localSettings.streaming.screen.cursor"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option value="show">Always Show</option>
                  <option value="hide">Always Hide</option>
                  <option value="motion">Show on Motion</option>
                </select>
              </div>

              <!-- Screen Options -->
              <div class="col-12">
                <div class="form-check">
                  <input
                    id="screen-share-audio"
                    v-model="localSettings.streaming.screen.shareAudio"
                    class="form-check-input"
                    type="checkbox"
                    @change="updateSettings"
                  />
                  <label class="form-check-label" for="screen-share-audio">
                    Share system audio
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Streaming Settings Section -->
      <div class="settings-subsection mb-4">
        <h6 class="text-warning mb-3 d-flex align-items-center gap-2">
          <AppIcon name="mdi-brain" />
          AI Streaming Settings
        </h6>

        <div class="row g-3">
          <div class="col-12">
            <div class="form-check form-switch">
              <input
                id="ai-enabled"
                v-model="localSettings.streaming.aiStreaming.enabled"
                class="form-check-input"
                type="checkbox"
                :disabled="!apiKey"
                @change="updateSettings"
              />
              <label class="form-check-label" for="ai-enabled">
                Enable AI Analysis
                <small v-if="!apiKey" class="text-muted d-block">
                  (Configure AI API key in AI Settings first)
                </small>
              </label>
            </div>
          </div>

          <div
            v-if="localSettings.streaming.aiStreaming.enabled && apiKey"
            class="col-12"
          >
            <div class="row g-3">
              <!-- AI Model -->
              <div class="col-md-6">
                <label class="form-label" for="ai-model"> AI Model </label>
                <select
                  id="ai-model"
                  v-model="localSettings.streaming.aiStreaming.model"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option
                    v-for="model in availableModels"
                    :key="model.id"
                    :value="model.id"
                  >
                    {{ model.displayName || model.id }}
                  </option>
                </select>
              </div>

              <!-- Analysis Type -->
              <div class="col-md-6">
                <label class="form-label" for="analysis-type">
                  Analysis Type
                </label>
                <select
                  id="analysis-type"
                  v-model="localSettings.streaming.aiStreaming.analysisType"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option value="continuous">Continuous</option>
                  <option value="on-demand">On Demand</option>
                  <option value="interval">Interval Based</option>
                </select>
              </div>

              <!-- Analysis FPS -->
              <div class="col-md-4">
                <label class="form-label" for="ai-fps">
                  Analysis Rate:
                  {{ localSettings.streaming.aiStreaming.fps }} FPS
                </label>
                <input
                  id="ai-fps"
                  v-model.number="localSettings.streaming.aiStreaming.fps"
                  type="range"
                  class="form-range"
                  min="1"
                  max="30"
                  step="1"
                  @input="updateSettings"
                />
                <div class="d-flex justify-content-between small text-muted">
                  <span>1 FPS</span>
                  <span>30 FPS</span>
                </div>
              </div>

              <!-- Analysis Interval (for interval mode) -->
              <div
                v-if="
                  localSettings.streaming.aiStreaming.analysisType ===
                    'interval'
                "
                class="col-md-4"
              >
                <label class="form-label" for="analysis-interval">
                  Interval:
                  {{ localSettings.streaming.aiStreaming.analysisInterval }}s
                </label>
                <input
                  id="analysis-interval"
                  v-model.number="
                    localSettings.streaming.aiStreaming.analysisInterval
                  "
                  type="range"
                  class="form-range"
                  min="5"
                  max="300"
                  step="5"
                  @input="updateSettings"
                />
                <div class="d-flex justify-content-between small text-muted">
                  <span>5s</span>
                  <span>5min</span>
                </div>
              </div>

              <!-- AI Temperature -->
              <div class="col-md-4">
                <label class="form-label" for="ai-temperature">
                  Creativity:
                  {{ localSettings.streaming.aiStreaming.temperature }}
                </label>
                <input
                  id="ai-temperature"
                  v-model.number="
                    localSettings.streaming.aiStreaming.temperature
                  "
                  type="range"
                  class="form-range"
                  min="0"
                  max="2"
                  step="0.1"
                  @input="updateSettings"
                />
                <div class="d-flex justify-content-between small text-muted">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <!-- Max Tokens -->
              <div class="col-md-6">
                <label class="form-label" for="max-tokens">
                  Max Response Length
                </label>
                <select
                  id="max-tokens"
                  v-model.number="localSettings.streaming.aiStreaming.maxTokens"
                  class="form-select"
                  @change="updateSettings"
                >
                  <option :value="100">Brief (100 tokens)</option>
                  <option :value="500">Short (500 tokens)</option>
                  <option :value="1000">Medium (1000 tokens)</option>
                  <option :value="2000">Long (2000 tokens)</option>
                  <option :value="4000">Very Long (4000 tokens)</option>
                </select>
              </div>

              <!-- Save Responses -->
              <div class="col-md-6">
                <div class="form-check mt-4">
                  <input
                    id="save-responses"
                    v-model="localSettings.streaming.aiStreaming.saveResponses"
                    class="form-check-input"
                    type="checkbox"
                    @change="updateSettings"
                  />
                  <label class="form-check-label" for="save-responses">
                    Save AI responses for review
                  </label>
                </div>
              </div>

              <!-- Start realtime on record start -->
              <div class="col-md-6">
                <div class="form-check mt-4">
                  <input
                    id="realtime-on-record"
                    v-model="
                      localSettings.streaming.aiStreaming.startRealtimeOnRecord
                    "
                    class="form-check-input"
                    type="checkbox"
                    @change="updateSettings"
                  />
                  <label class="form-check-label" for="realtime-on-record">
                    Start realtime when recording begins
                  </label>
                </div>
              </div>

              <!-- Start realtime on screen start -->
              <div class="col-md-6">
                <div class="form-check mt-4">
                  <input
                    id="realtime-on-screen"
                    v-model="
                      localSettings.streaming.aiStreaming
                        .startRealtimeOnScreenStart
                    "
                    class="form-check-input"
                    type="checkbox"
                    @change="updateSettings"
                  />
                  <label class="form-check-label" for="realtime-on-screen">
                    Start realtime when screen sharing begins
                  </label>
                </div>
              </div>

              <!-- System Prompt -->
              <div class="col-12">
                <label class="form-label" for="system-prompt">
                  AI System Prompt
                </label>
                <textarea
                  id="system-prompt"
                  v-model="localSettings.streaming.aiStreaming.systemPrompt"
                  class="form-control glass-input"
                  rows="3"
                  placeholder="Describe how the AI should analyze your video stream..."
                  @input="debounceUpdateSettings"
                ></textarea>
                <div class="form-text">
                  This prompt guides how the AI analyzes your video stream. Be
                  specific about what you want it to focus on.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2 justify-content-end">
        <UnifiedButton
          variant="outline"
          leading-icon="mdi-restore"
          @click="resetToDefaults"
        >
          Reset Defaults
        </UnifiedButton>
        <UnifiedButton
          v-if="!autoSave"
          variant="primary"
          :disabled="saving"
          leading-icon="mdi-content-save"
          @click="saveSettings"
        >
          <span v-if="saving">Saving…</span>
          <span v-else>Save Settings</span>
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { useAppStore } from "@/stores/app";
import { DEFAULT_SETTINGS } from "@/shared/schemas/settingsSchema";
import { videoService } from "@/shared/services/VideoService";
import { logger } from "@/shared/utils/logger";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

export default {
  name: "StreamingSettingsSection",
  components: {
    AppIcon,
    UnifiedButton,
  },
  props: {
    settings: {
      type: Object,
      required: true,
    },
    saving: {
      type: Boolean,
      default: false,
    },
    apiKey: {
      type: String,
      default: "",
    },
  },
  emits: ["update:settings", "save"],
  setup(props, { emit }) {
    const store = useAppStore();
    // Local reactive copy of settings
    const localSettings = ref({ ...props.settings });
    const videoDevices = ref([]);

    // Computed properties
    const autoSave = computed(() => props.settings.autoSave);
    const availableModels = computed(() => store.availableModels);

    // Initialize video devices
    onMounted(async () => {
      try {
        await videoService.initialize();
        videoDevices.value = await videoService.enumerateDevices();
      } catch (error) {
        logger.error("Failed to initialize video devices:", error);
      }
    });

    // Watch for external settings changes
    watch(
      () => props.settings,
      (newSettings) => {
        localSettings.value = { ...newSettings };
      },
      { deep: true },
    );

    // Debounced update for text inputs
    let updateTimeout;
    const debounceUpdateSettings = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateSettings, 500);
    };

    // Update settings
    const updateSettings = () => {
      emit("update:settings", { ...localSettings.value });
    };

    // Save settings manually
    const saveSettings = () => {
      emit("save");
    };

    // Reset to defaults
    const resetToDefaults = () => {
      if (
        confirm(
          "Reset all streaming settings to defaults? This cannot be undone.",
        )
      ) {
        localSettings.value.streaming = { ...DEFAULT_SETTINGS.streaming };
        updateSettings();
      }
    };

    return {
      localSettings,
      videoDevices,
      autoSave,
      availableModels,
      updateSettings,
      debounceUpdateSettings,
      saveSettings,
      resetToDefaults,
    };
  },
};
</script>

<style scoped>
.settings-subsection {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.settings-subsection:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.form-range {
  margin-bottom: 0.5rem;
}

.form-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.card-header h5 {
  color: var(--text-primary);
}

.settings-subsection h6 {
  font-weight: 600;
}

  }

    flex-direction: column;
  }

  }
}
</style>
