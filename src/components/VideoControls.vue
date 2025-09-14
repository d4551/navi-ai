<template>
  <div
    class="video-controls glass-surface p-4 rounded-lg"
    role="region"
    aria-label="Video and Screen Sharing Controls"
  >
    <!-- Video Preview -->
    <div
      v-if="showPreview && (isCameraActive || isScreenActive)"
      class="video-preview mb-4"
    >
      <div class="video-container position-relative">
        <video
          ref="videoElement"
          :srcObject="currentStream"
          autoplay
          muted
          playsinline
          class="video-preview-element rounded"
          :class="{ 'screen-share': isScreenActive }"
        ></video>

        <!-- Enhanced RGB Streaming Indicator -->
        <div v-if="isStreaming" class="streaming-indicator-rgb">
          <div class="recording-dot-rgb"></div>
          <span class="streaming-text">Live AI Streaming</span>
          <div class="streaming-wave"></div>
        </div>

        <!-- Enhanced Glassmorphic Controls Overlay -->
        <div class="video-controls-overlay-rgb">
          <div class="controls-container">
            <button
              v-if="isCameraActive"
              class="control-btn-rgb ui-icon-btn"
              :disabled="availableCameras.length <= 1"
              title="Switch Camera"
              @click="switchCamera"
            >
              <AppIcon name="mdi-camera-switch" />
              <div class="btn-glow"></div>
            </button>

            <button
              class="control-btn-rgb ui-icon-btn"
              :class="{ muted: isMuted }"
              :title="isMuted ? 'Unmute' : 'Mute'"
              @click="toggleMute"
            >
              <AppIcon
                :name="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
              />
              <div class="btn-glow"></div>
            </button>

            <button
              v-if="isCameraActive || isScreenActive"
              class="control-btn-rgb ai-control ui-icon-btn"
              :class="{ active: isStreaming }"
              :disabled="!apiKey"
              :title="isStreaming ? 'Stop AI Analysis' : 'Start AI Analysis'"
              @click="toggleAIStreaming"
            >
              <AppIcon :name="isStreaming ? 'mdi-brain' : 'mdi-brain'" />
              <div class="btn-glow ai-glow"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Device Selection -->
    <div v-if="showDeviceSelection" class="device-selection-section mb-4">
      <h3 class="h6 mb-3 text-muted d-flex align-items-center gap-2">
        <AppIcon name="mdi-video-settings" class="text-primary" />
        Video Device Settings
      </h3>

      <div class="row g-3">
        <!-- Camera Selection -->
        <div class="col-12">
          <label class="form-label small fw-medium" for="camera-select">
            <AppIcon name="mdi-camera" />
            Camera
          </label>
          <select
            id="camera-select"
            v-model="selectedCameraId"
            class="form-select form-select-sm"
            :disabled="isCameraActive"
            aria-describedby="camera-help"
            @change="updateCameraSelection"
          >
            <option value="">Default Camera</option>
            <option
              v-for="camera in availableCameras"
              :key="camera.deviceId"
              :value="camera.deviceId"
            >
              {{ camera.label }}
            </option>
          </select>
          <div id="camera-help" class="form-text small">
            Select your preferred camera for video input
          </div>
        </div>
      </div>
    </div>

    <!-- Main Controls -->
    <div class="main-controls">
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <!-- Camera Toggle -->
        <UnifiedButton
          variant="primary"
          size="sm"
          :disabled="isStreaming || isVideoLocked"
          :aria-pressed="isCameraActive.toString()"
          :title="
            isCameraActive
              ? isVideoLocked
                ? 'Camera Locked'
                : 'Stop Camera'
              : 'Start Camera'
          "
          :leading-icon="isCameraActive ? 'mdi-video-off' : 'mdi-video'"
          @click="toggleCamera"
        >
          {{ isCameraActive ? "Stop Camera" : "Start Camera" }}
        </UnifiedButton>

        <!-- Screen Share Toggle -->
        <UnifiedButton
          variant="success"
          size="sm"
          :disabled="isStreaming || isScreenLocked"
          :aria-pressed="isScreenActive.toString()"
          :title="
            isScreenActive
              ? isScreenLocked
                ? 'Screen Share Locked'
                : 'Stop Screen Share'
              : 'Start Screen Share'
          "
          :leading-icon="isScreenActive ? 'mdi-monitor-off' : 'mdi-monitor'"
          @click="toggleScreenShare"
        >
          {{ isScreenActive ? "Stop Sharing" : "Share Screen" }}
        </UnifiedButton>

        <!-- AI Streaming Toggle -->
        <UnifiedButton
          v-if="isCameraActive || isScreenActive"
          variant="warning"
          size="sm"
          :disabled="!apiKey"
          :aria-pressed="isStreaming.toString()"
          :title="isStreaming ? 'Stop AI Streaming' : 'Start AI Streaming'"
          leading-icon="mdi-brain"
          @click="toggleAIStreaming"
        >
          {{ isStreaming ? "Stop AI" : "Start AI" }}
        </UnifiedButton>

        <!-- Settings Toggle -->
        <IconButton
          variant="outline"
          size="sm"
          icon="mdi-cog"
          title="Device Settings"
          :aria-pressed="showDeviceSelection.toString()"
          @click="showDeviceSelection = !showDeviceSelection"
        />
        <!-- Lock Buttons -->
        <IconButton
          variant="outline"
          size="sm"
          :icon="isVideoLocked ? 'mdi-lock' : 'mdi-lock-open-outline'"
          :title="isVideoLocked ? 'Unlock Camera' : 'Lock Camera'"
          @click="isVideoLocked ? unlockVideo() : lockVideo('User locked')"
        />
        <IconButton
          variant="outline"
          size="sm"
          :icon="isScreenLocked ? 'mdi-monitor-lock' : 'mdi-monitor-eye'"
          :title="isScreenLocked ? 'Unlock Screen Share' : 'Lock Screen Share'"
          @click="isScreenLocked ? unlockScreen() : lockScreen('User locked')"
        />
      </div>

      <!-- Status Messages -->
      <div v-if="statusMessage" class="mt-3">
        <div :class="['alert small py-2 px-3 mb-0', statusType]">
          <AppIcon :name="statusIcon" class="me-1" />
          {{ statusMessage }}
        </div>
      </div>

      <!-- AI Response Display -->
      <div v-if="aiResponse" class="mt-3">
        <div class="ai-response-card glass-card section-card p-3">
          <div class="d-flex align-items-start gap-2">
            <AppIcon name="mdi-brain" class="text-primary mt-1" />
            <div class="flex-grow-1">
              <h6 class="mb-2 text-primary">AI Analysis</h6>
              <p class="mb-0 small">{{ aiResponse }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';

import { refcomputed, watch, onUnmounted } from "vue";
import { videoService } from "@/shared/services/VideoService";
import { googleAIStreamingService } from "@/shared/services/GoogleAIStreamingService";
import { useAppStore } from "@/stores/app";
import { logger } from "@/shared/utils/logger";
import { useMediaLock } from "@/composables/useMediaLock";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import IconButton from "@/components/ui/IconButton.vue";

export default {
  name: "VideoControls",
  components: {
    AppIcon,
  },
  props: {
    apiKey: {
      type: String,
      default: null,
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
    autoStart: {
      type: Boolean,
      default: false,
    },
    streamingSettings: {
      type: Object,
      default: null,
    },
  },
  emits: ["stream-started", "stream-stopped", "ai-response", "error"],
  setup(_props, { emit }) {
    const store = useAppStore();

    // Reactive state
    const videoElement = ref(null);
    const showDeviceSelection = ref(false);
    const selectedCameraId = ref("");
    const availableCameras = ref([]);
    const isMuted = ref(false);
    const statusMessage = ref("");
    const statusType = ref("alert-info");
    const statusIcon = ref("mdi-information");
    const aiResponse = ref("");

    // Computed properties
    const isCameraActive = computed(() => videoService.isCameraActive());
    const isScreenActive = computed(() => videoService.isScreenShareActive());
    const isStreaming = computed(() => googleAIStreamingService.isActive());
    const currentStream = computed(() => {
      if (isScreenActive.value) return videoService.getScreenStream();
      if (isCameraActive.value) return videoService.getVideoStream();
      return null;
    });

    // Media lock state
    const {
      videoLocked,
      screenLocked,
      lockVideo,
      unlockVideo,
      lockScreen,
      unlockScreen,
    } = useMediaLock();
    const isVideoLocked = computed(() => videoLocked.value);
    const isScreenLocked = computed(() => screenLocked.value);

    // Initialize on mount
    onMounted(async () => {
      try {
        await videoService.initialize();
        await refreshDevices();

        if (props.apiKey) {
          await googleAIStreamingService.initialize(props.apiKey);
        }

        if (props.autoStart) {
          await toggleCamera();
        }
      } catch (_error) {
        handleError("Failed to initialize video controls", error);
      }
    });

    // Cleanup on unmount
    onUnmounted(() => {
      stopAllStreams();
      videoService.cleanup();
    });

    // Watch for API key changes
    watch(
      () => props.apiKey,
      async (newKey) => {
        if (newKey) {
          try {
            await googleAIStreamingService.initialize(newKey);
            showStatus("AI service initialized", "success");
          } catch (_error) {
            handleError("Failed to initialize AI service", error);
          }
        }
      },
    );

    // Watch for streaming settings changes
    watch(
      () => props.streamingSettings,
      (newSettings) => {
        if (newSettings) {
          googleAIStreamingService.updateSettings(newSettings);
        }
      },
      { deep: true, immediate: true },
    );

    // Methods
    const refreshDevices = async () => {
      try {
        availableCameras.value = await videoService.enumerateDevices();
      } catch (_error) {
        logger.error("Failed to refresh devices:", error);
      }
    };

    const updateCameraSelection = () => {
      videoService.setSelectedCamera(selectedCameraId.value);
    };

    const toggleCamera = async () => {
      try {
        if (isCameraActive.value) {
          videoService.stopCamera();
          showStatus("Camera stopped", "info");
          unlockVideo();
        } else {
          const stream = await videoService.startCamera({
            deviceId: selectedCameraId.value || undefined,
          });

          if (videoElement.value) {
            videoElement.value.srcObject = stream;
          }

          showStatus("Camera started", "success");
          lockVideo("Active session");
        }
      } catch (_error) {
        handleError("Failed to toggle camera", error);
      }
    };

    const toggleScreenShare = async () => {
      try {
        if (isScreenActive.value) {
          videoService.stopScreenShare();
          showStatus("Screen sharing stopped", "info");
          unlockScreen();
        } else {
          const stream = await videoService.startScreenShare();

          if (videoElement.value) {
            videoElement.value.srcObject = stream;
          }

          showStatus("Screen sharing started", "success");
          lockScreen("Active sharing");
        }
      } catch (_error) {
        handleError("Failed to toggle screen sharing", error);
      }
    };

    const toggleAIStreaming = async () => {
      try {
        if (isStreaming.value) {
          googleAIStreamingService.stopStreaming();
          emit("stream-stopped");
          showStatus("AI streaming stopped", "info");
        } else {
          const callbacks = {
            onStart: () => {
              emit("stream-started");
              showStatus("AI streaming started", "success");
            },
            onResponse: (_response) => {
              aiResponse.value = response;
              emit("ai-response", response);
            },
            onError: (_error) => {
              handleError("AI streaming error", error);
            },
            onEnd: () => {
              emit("stream-stopped");
              showStatus("AI streaming ended", "info");
            },
          };

          if (isScreenActive.value) {
            await googleAIStreamingService.startScreenStreaming({}, callbacks);
          } else if (isCameraActive.value) {
            await googleAIStreamingService.startVideoStreaming({}, callbacks);
          } else {
            throw new Error("No video source active");
          }
        }
      } catch (_error) {
        handleError("Failed to toggle AI streaming", error);
      }
    };

    const switchCamera = async () => {
      // Find next camera
      const currentIndex = availableCameras.value.findIndex(
        (camera) => camera.deviceId === selectedCameraId.value,
      );
      const nextIndex = (currentIndex + 1) % availableCameras.value.length;
      const nextCamera = availableCameras.value[nextIndex];

      selectedCameraId.value = nextCamera.deviceId;
      updateCameraSelection();

      // Restart camera with new device
      if (isCameraActive.value) {
        videoService.stopCamera();
        setTimeout(() => toggleCamera(), 100);
      }
    };

    const toggleMute = () => {
      if (currentStream.value) {
        const audioTracks = currentStream.value.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = isMuted.value;
        });
        isMuted.value = !isMuted.value;
      }
    };

    const stopAllStreams = () => {
      googleAIStreamingService.stopStreaming();
      videoService.stopCamera();
      videoService.stopScreenShare();
    };

    const showStatus = (message, type = "info") => {
      statusMessage.value = message;
      statusType.value = `alert-${type}`;
      statusIcon.value = getStatusIcon(type);


      setTimeout(() => {
        statusMessage.value = "";
      }, 5000);
    };

    const getStatusIcon = (type) => {
      switch (type) {
        case "success":
          return "mdi mdi-check-circle-outline";
        case "warning":
          return "mdi mdi-alert-circle-outline";
        case "error":
          return "mdi mdi-alert-circle-outline";
        default:
          return "mdi mdi-information";
      }
    };

    const handleError = (message, error) => {
      logger.error(message, error);
      showStatus(`${message}: ${error.message}`, "error");
      emit("error", error);
    };

    return {
      videoElement,
      showDeviceSelection,
      selectedCameraId,
      availableCameras,
      isMuted,
      statusMessage,
      statusType,
      statusIcon,
      aiResponse,
      isCameraActive,
      isScreenActive,
      isStreaming,
      currentStream,
      isVideoLocked,
      isScreenLocked,
      toggleCamera,
      toggleScreenShare,
      toggleAIStreaming,
      switchCamera,
      toggleMute,
      updateCameraSelection,
      lockVideo,
      unlockVideo,
      lockScreen,
      unlockScreen,
    };
  },
};
</script>

<style scoped>
.video-preview-element {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 20px;
  background:
    linear-gradient(145deg, var(--surface-elevated), var(--surface-base))
      padding-box,
    linear-gradient(
        45deg,
        var(--color-success-400),
        var(--color-info-400),
        var(--color-primary-400)
      )
      border-box;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.video-preview-element.screen-share {
  max-height: 400px;
}

.streaming-indicator-rgb {
  position: absolute;
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  box-shadow:
}

.recording-dot-rgb {
  background: linear-gradient(
  );
}

.streaming-text {
  color: var(--text-on-primary);
}

.streaming-wave {
  background: linear-gradient(
  );
}

@keyframes rgbPulse {
  }
  }
}

@keyframes streamWave {
  }
  }
  }
}

.video-controls-overlay-rgb {
  position: absolute;
}

.controls-container {
  background: linear-gradient(
  );
  display: flex;
  justify-content: center;
  box-shadow:
}

.control-btn-rgb {
  position: relative;
  border: none;
  background: linear-gradient(
  );
  color: var(--text-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  box-shadow:
}

.control-btn-rgb:hover {
  background: linear-gradient(
  );
  box-shadow:
}

.control-btn-rgb:active {
}

.control-btn-rgb.muted {
  background: linear-gradient(
  );
  box-shadow:
}

.control-btn-rgb.ai-control.active {
  background: linear-gradient(
  );
  box-shadow:
}

.btn-glow {
  position: absolute;
  background: linear-gradient(
  );
  border-radius: inherit;
}

.control-btn-rgb:hover .btn-glow {
}

.ai-glow {
  background: linear-gradient(
  );
}

@keyframes aiPulse {
    box-shadow:
  }
    box-shadow:
  }
}

@keyframes rgbRotate {
  }
  }
}

.btn .mdi-lock {
}
.btn .mdi-monitor-lock {
}

.video-container:hover .video-controls-overlay-rgb {
}

.ai-response-card {
  background: var(--glass-surface);
}

  .video-preview-element {
  }

  .video-preview-element.screen-share {
  }

  .main-controls .btn {
  }

  .main-controls .btn span {
    display: none;
  }
}
</style>
