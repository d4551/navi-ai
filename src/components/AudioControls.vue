<template>
  <div
    class="audio-controls noir-glass-surface p-4 rounded-lg"
    :class="{ 'recording-active': isRecording,
              'fairy-ai-active': fairyAIMode 
    }"
    role="region"
    aria-label="NAVI Audio System - Voice Input and Output Controls"
  >
    <!-- Enhanced Device Selection Section -->
    <div v-if="showDeviceSelection" class="device-selection-section mb-4">
      <h3 class="h6 mb-3 text-muted d-flex align-items-center gap-2">
        <AppIcon name="mdi-microphone-settings" class="text-primary" />
        Audio Device Settings
      </h3>

      <div class="row g-3">
        <!-- Microphone Selection -->
        <div class="col-md-6">
          <label class="form-label small fw-medium" for="mic-select">
            <AppIcon name="mdi-microphone" />
            Microphone
          </label>
          <select
            id="mic-select"
            v-model="selectedMicId"
            class="unified-input ui-input"
            :disabled="isRecording"
            aria-describedby="mic-help"
            @change="updateDevicePreferences"
          >
            <option value="">Default Microphone</option>
            <option
              v-for="device in audioInputs"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Microphone ${device.deviceId.slice(-4)}` }}
            </option>
          </select>
          <div id="mic-help" class="form-text small">
            Select your preferred microphone for voice input
          </div>
        </div>

        <!-- Speaker Selection -->
        <div class="col-md-6">
          <label class="form-label small fw-medium" for="speaker-select">
            <AppIcon name="mdi-volume-high" />
            Speaker
          </label>
          <select
            id="speaker-select"
            v-model="selectedSpeakerId"
            class="unified-input ui-input"
            aria-describedby="speaker-help"
            @change="updateDevicePreferences"
          >
            <option value="">Default Speaker</option>
            <option
              v-for="device in audioOutputs"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Speaker ${device.deviceId.slice(-4)}` }}
            </option>
          </select>
          <div id="speaker-help" class="form-text small">
            Select your preferred speaker for AI responses
          </div>
        </div>
      </div>
    </div>

    <!-- Canonical Push-to-Talk Control -->
    <div class="push-to-talk-section">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="h6 mb-0 text-muted d-flex align-items-center gap-2">
          <AppIcon name="mdi-microphone-variant" class="text-primary" />
          Voice Input Controls
        </h3>
      </div>

      <PushToTalkButton
        :max-recording-time="maxRecordingDuration"
        :show-transcript="false"
        :show-response="false"
        :auto-send="false"
        :show-device-selector="true"
        @recording-start="$emit('recordingStart')"
        @recording-stop="handlePTTStop"
      >
        <template #device-selector="{ microphoneDevices, selectedMicId, setSelectedMic }">
          <div class="ptt-device-select mt-2">
            <label class="form-label small fw-medium mb-1" for="ptt-mic-select">
              <AppIcon name="mdi-microphone" />
              Microphone (PTT)
            </label>
            <select
              id="ptt-mic-select"
              class="unified-input ui-input"
              :value="selectedMicId"
              :disabled="isRecording"
              @change="setSelectedMic(($event.target && $event.target.value) || '')"
            >
              <option value="">System Default</option>
              <option
                v-for="d in microphoneDevices"
                :key="d.deviceId"
                :value="d.deviceId"
              >
                {{ d.label || `Microphone ${d.deviceId.slice(0, 8)}...` }}
              </option>
            </select>
          </div>
        </template>
      </PushToTalkButton>
    </div>

    <!-- Playback Controls -->
    <div v-if="audioData || isPlaying" class="playback-section mt-3">
      <div class="d-flex align-items-center gap-2">
        <UnifiedButton
          variant="success"
          size="sm"
          :disabled="!audioData || isPlaying"
          aria-label="Play recorded audio"
          leading-icon="mdi-play"
          @click="playAudio"
        >
          Play
        </UnifiedButton>

        <UnifiedButton
          variant="danger"
          size="sm"
          :disabled="!isPlaying"
          aria-label="Stop playing audio"
          leading-icon="mdi-stop"
          @click="stopAudio"
        >
          Stop
        </UnifiedButton>

        <!-- Playback Progress -->
        <div v-if="isPlaying || playbackDuration > 0" class="playback-progress flex-grow-1">
          <div class="progress progress--xs">
            <div
              class="progress-bar"
              :style="{ width: `${playbackProgress}%` }"
              role="progressbar"
              :aria-valuenow="playbackProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <small class="text-muted">{{ formatTime(playbackCurrentTime) }} / {{ formatTime(playbackDuration) }}</small>
        </div>
      </div>
    </div>

    <!-- Permission Request -->
    <div v-if="!hasPermission" class="permission-section">
      <div class="alert alert-warning d-flex align-items-center">
        <AppIcon name="mdi-microphone-off" class="me-2" />
        <div>
          <strong>Microphone access required</strong>
          <p class="mb-0 small">Please grant microphone permission to use voice features.</p>
        </div>
        <UnifiedButton variant="outline" size="sm" class="ms-auto" @click="requestPermission">
          Grant Permission
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { audioService as _audioService } from '@/shared/services/AudioService';
import { logger } from '@/shared/utils/logger';
import PushToTalkButton from '@/components/PushToTalkButton.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

export default {
  name: 'AudioControls',
  components: { 
    PushToTalkButton,
    AppIcon,
    UnifiedButton
  },
  props: {
    showDeviceSelection: {
      type: Boolean,
      default: true
    },
    enablePushToTalk: {
      type: Boolean,
      default: true
    },
    maxRecordingDuration: {
      type: Number,
      default: 300 // 5 minutes
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'compact', 'enhanced'].includes(value)
    },
    continuousMode: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'recordingStart',
    'recordingStop',
    'recordingData',
    'playbackStart',
    'playbackEnd',
    'deviceChanged',
    'permissionChanged',
    'modeChanged'
  ],
  setup(_props, { emit }) {
    // Device management
    const audioInputs = ref([]);
    const audioOutputs = ref([]);
    const selectedMicId = ref('');
    const selectedSpeakerId = ref('');

    // Permission state
    const hasPermission = ref(false);

    // Recording state
    const isRecording = ref(false);
    const recordingStatus = ref('');
    const recordingDuration = ref(0);
    const audioLevel = ref(0);
    const audioData = ref(null);

    // Playback state
    const isPlaying = ref(false);
    const playbackDuration = ref(0);
    const playbackCurrentTime = ref(0);
    const playbackProgress = computed(() => {
      if (playbackDuration.value === 0) {return 0;}
      return (playbackCurrentTime.value / playbackDuration.value) * 100;
    });

    // Internal state
    let currentAudio = null;
    let recordingTimer = null;
    const pushToTalkMode = ref(true);

    // Initialize component
    onMounted(async () => {
      await initializeAudioDevices();
      // Non-invasive permission check on mount (no prompts)
      await checkPermissions();
    });

    onUnmounted(() => {
      cleanup();
    });

    // Device management
    async function initializeAudioDevices() {
      try {
        let devices = [];
        if (navigator.mediaDevices?.enumerateDevices) {
          devices = await navigator.mediaDevices.enumerateDevices();
        } else if (window.api?.media?.getDevices) {
          // Avoid prompting via main process; only call after permission is granted
          const settings = await window.api?.app?.getSettings?.().catch(() => null);
          const granted = hasPermission.value || Boolean(settings?.microphoneGranted);
          if (granted) {
            devices = await window.api.media.getDevices();
          }
        }

        audioInputs.value = (devices || []).filter((d) => d.kind === 'audioinput');
        audioOutputs.value = (devices || []).filter((d) => d.kind === 'audiooutput');

        // Set default devices
        const settings = await (window.api?.app?.getSettings?.() || Promise.resolve(null)).catch(() => null);
        if (settings) {
          selectedMicId.value = settings.selectedMicId || '';
          selectedSpeakerId.value = settings.selectedSpeakerId || '';
        }
      } catch (error) {
        logger.error('Failed to get audio devices:', error);
      }
    }

    async function checkPermissions() {
      try {
        // Non-invasive: use Permissions API or device labels heuristic; never prompt
        let granted = false;
        const permAPI = navigator.permissions;
        if (permAPI && typeof permAPI.query === 'function') {
          try {
            const status = await permAPI.query({ name: 'microphone' });
            granted = status.state === 'granted';
          } catch {/* some browsers do not support querying microphone */}
        }

        if (!granted && navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          granted = devices.some(d => d.kind === 'audioinput' && typeof d.label === 'string' && d.label.trim().length > 0);
        }

        hasPermission.value = granted;
        emit('permissionChanged', granted);
      } catch (error) {
        logger.error('Permission check failed:', error);
        hasPermission.value = false;
      }
    }

    async function requestPermission() {
      try {
        // First try browser API for immediate feedback
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        hasPermission.value = true;
        emit('permissionChanged', true);

        // Also notify main process
        if (window.api?.media) {
          await window.api.media.requestPermissions({ audio: true });
        }
      } catch (error) {
        logger.error('Permission request failed:', error);
        hasPermission.value = false;
        emit('permissionChanged', false);
      }
    }

    async function updateDevicePreferences() {
      emit('deviceChanged', {
        micId: selectedMicId.value,
        speakerId: selectedSpeakerId.value
      });

      // Save to settings
      if (window.api?.app?.updateSettings) {
        await window.api.app.updateSettings({
          selectedMicId: selectedMicId.value,
          selectedSpeakerId: selectedSpeakerId.value
        });
      }
    }

    // Enhanced recording mode management
    const setPushToTalkMode = (enabled) => {
      pushToTalkMode.value = enabled;
      emit('modeChanged', { pushToTalk: enabled });
    };

    const _getRecordingAriaLabel = () => {
      if (!hasPermission.value) {return 'Microphone permission required';}
      if (isRecording.value) {
        return pushToTalkMode.value ? 'Recording - release to stop' : 'Recording - click to stop';
      }
      return pushToTalkMode.value ? 'Hold to record' : 'Click to start recording';
    };

    const _getRecordingButtonText = () => {
      if (!hasPermission.value) {return 'Permission Required';}
      if (isRecording.value) {return 'Recording...';}
      return pushToTalkMode.value ? 'Hold to Record' : 'Click to Record';
    };

    // Recording logic handled by canonical PushToTalkButton

    // Enhanced event handlers
    const handleRecordingStart = () => {
      isRecording.value = true;
      recordingStatus.value = 'Recording...';
      startRecordingTimer();
      emit('recordingStart');
      logger.debug('AudioControls: Recording started');
    };

    const handleRecordingStop = () => {
      isRecording.value = false;
      recordingStatus.value = 'Processing...';
      stopRecordingTimer();
      audioLevel.value = 0;
      emit('recordingStop', { 
        duration: recordingDuration.value, 
        audioData: audioData.value 
      });
      logger.debug('AudioControls: Recording stopped', { duration: recordingDuration.value });
    };

    const _handleRecordingClick = async () => {
      if (!hasPermission.value) {
        await requestPermission();
        return;
      }

      if (pushToTalkMode.value) {
        // In push-to-talk mode, this is handled by the PTT button
        return;
      }

      if (isRecording.value) {
        handleRecordingStop();
      } else {
        handleRecordingStart();
      }
    };

    // Timer functions
    const startRecordingTimer = () => {
      recordingDuration.value = 0;
      recordingTimer = setInterval(() => {
        recordingDuration.value += 1;
        if (recordingDuration.value >= props.maxRecordingDuration) {
          handleRecordingStop();
        }
      }, 1000);
    };

    const stopRecordingTimer = () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
    };

    // Handle Stop from canonical PTT to capture audio blob for playback
    const handlePTTStop = async (blob) => {
      try {
        if (blob) {
          audioData.value = blob;
          emit('recordingData', blob);
          emit('recordingStop', { duration: recordingDuration.value, audioData: blob });
        }
        // Reset timers/state maintained by legacy code
        isRecording.value = false;
        recordingDuration.value = 0;
        audioLevel.value = 0;
        recordingStatus.value = '';
      } catch (e) {
        logger.error('handlePTTStop failed:', e);
      }
    };

    // --

    // Playback functions
    async function playAudio() {
      if (!audioData.value || isPlaying.value) {return;}

      try {
        // Stop current audio if playing
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }

        const url = URL.createObjectURL(audioData.value);
        currentAudio = new window.Audio(url);
        try {
          const svc = await import('@/shared/services/AudioService');
          await svc.applyOutputDevice(currentAudio);
        } catch {/* ignore */}

        currentAudio.ontimeupdate = () => {
          playbackCurrentTime.value = currentAudio.currentTime;
        };

        currentAudio.onloadedmetadata = () => {
          playbackDuration.value = currentAudio.duration;
        };

        currentAudio.onended = () => {
          isPlaying.value = false;
          playbackCurrentTime.value = 0;
          emit('playbackEnd');
          URL.revokeObjectURL(url);
        };

        await currentAudio.play();
        isPlaying.value = true;
        emit('playbackStart');

      } catch (error) {
        logger.error('Failed to play audio:', error);
      }
    }

    function stopAudio() {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        isPlaying.value = false;
        playbackCurrentTime.value = 0;
        emit('playbackEnd');
      }
    }

    // Utility functions
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function cleanup() {
      // AudioService handles stream/context lifecycle
      audioLevel.value = 0;
    }

    return {
      // Device management
      audioInputs,
      audioOutputs,
      selectedMicId,
      selectedSpeakerId,
      updateDevicePreferences,

      // Permission
      hasPermission,
      requestPermission,

      // Recording (PTT-based)
      isRecording,
      recordingStatus,
      recordingDuration,
      audioLevel,
      audioData,

      // Playback
      isPlaying,
      playbackDuration,
      playbackCurrentTime,
      playbackProgress,
      playAudio,
      stopAudio,
      handlePTTStop,

      // Enhanced features
      pushToTalkMode,
      setPushToTalkMode,
      // Legacy getters removed
      // removed legacy handlers

      // Utility
      formatTime
    };
  }
};
</script>

<style scoped>
.audio-controls {
  background: rgba(5, 5, 15, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid transparent;
  border-image: linear-gradient(135deg, #00ff87 0%, #60efff 50%, #ff0080 100%) 1;
  box-shadow: 
    0 4px 20px rgba(0, 255, 135, 0.1),
    0 2px 10px rgba(96, 239, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: #f0f8ff;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.audio-controls.fairy-ai-active {
  border-image: linear-gradient(135deg, #60efff 0%, #00ff87 50%, #60efff 100%) 1;
  box-shadow: 
    0 8px 32px rgba(96, 239, 255, 0.3),
    0 4px 16px rgba(0, 255, 135, 0.2),
    0 0 24px rgba(96, 239, 255, 0.4),
    inset 0 1px 0 rgba(96, 239, 255, 0.2);
  animation: fairyGlow 2s ease-in-out infinite alternate;
}

@keyframes fairyGlow {
  0% { 
    box-shadow: 
      0 8px 32px rgba(96, 239, 255, 0.2),
      0 4px 16px rgba(0, 255, 135, 0.15),
      0 0 24px rgba(96, 239, 255, 0.3);
  }
  100% {
    box-shadow: 
      0 12px 40px rgba(96, 239, 255, 0.4),
      0 6px 20px rgba(0, 255, 135, 0.25),
      0 0 32px rgba(96, 239, 255, 0.5);
  }
}

.playback-progress {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Removed legacy recording button visuals in favor of canonical PTT */

/* Accessibility improvements */
.recording-btn:focus {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .audio-controls {
    background: var(--bg-secondary-dark);
    border-color: var(--border-color-dark);
  }

  .meter-container {
    background: var(--bg-tertiary-dark);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .recording-section .d-flex {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  /* No legacy recording button meter on mobile */
}
</style>
