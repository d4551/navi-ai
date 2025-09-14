<!--
  CANONICAL Audio Device Selector Component
  Provides device selection and permission handling for microphone and speakers
-->
<template>
  <div class="audio-device-selector">
    <!-- Device Selection Controls -->
    <div class="device-controls">
      <div class="row g-3">
        <!-- Microphone Selection -->
        <div class="col-md-6">
          <label for="microphone-select" class="form-label d-flex align-items-center">
            <AppIcon name="mdi-microphone" />
            Microphone
          </label>
          <select
            id="microphone-select"
            v-model="selectedMicrophoneId"
            class="form-select"
            :disabled="!permissionsGranted || disabled || isLocked"
            @change="onMicrophoneChange"
          >
            <option value="">
              {{ microphoneDevices.length > 0 ? 'Default Microphone' : 'No microphones found' }}
            </option>
            <option
              v-for="device in microphoneDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Microphone ${device.deviceId.slice(0, 8)}...` }}
            </option>
          </select>

          <!-- Microphone Level Indicator -->
          <div v-if="selectedMicrophoneId && microphoneLevel > 0" class="mic-level-container mt-2">
            <div class="mic-level-label">Input Level:</div>
            <div class="mic-level-bar">
              <div
                class="mic-level-fill"
                :style="{ width: `${microphoneLevel}%` }"
                :class="{ 'level-high': microphoneLevel > 80 }"
              ></div>
            </div>
            <div class="mic-level-value">{{ Math.round(microphoneLevel) }}%</div>
          </div>
        </div>

        <!-- Speaker Selection -->
        <div class="col-md-6">
          <label for="speaker-select" class="form-label d-flex align-items-center">
            <AppIcon name="mdi-volume-high" />
            Speaker
          </label>
          <select
            id="speaker-select"
            v-model="selectedSpeakerId"
            class="form-select"
            :disabled="!speakerSelectionSupported || disabled || isLocked"
            @change="onSpeakerChange"
          >
            <option value="">
              {{ speakerDevices.length > 0 ? 'Default Speaker' : 'System default' }}
            </option>
            <option
              v-for="device in speakerDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Speaker ${device.deviceId.slice(0, 8)}...` }}
            </option>
          </select>

          <!-- Speaker Test Button -->
          <div class="mt-2">
            <UnifiedButton
              size="sm"
              variant="outline-secondary"
              :disabled="!permissionsGranted || isTestingAudio || disabled"
              :icon="isTestingAudio ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-volume-source'"
              @click="testSpeaker"
            >
              {{ isTestingAudio ? 'Testing...' : 'Test Speaker' }}
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Permission Controls -->
    <div v-if="!permissionsGranted" class="permission-controls mt-3">
      <div class="alert alert-info d-flex align-items-start">
        <AppIcon name="mdi-information-outline" class="me-2 mt-1" />
        <div>
          <div class="fw-semibold">Microphone Permission Required</div>
          <p class="mb-2">
            To use voice features, please grant microphone permissions.
          </p>
          <UnifiedButton
            size="sm"
            variant="primary"
            :disabled="isRequestingPermissions"
            :icon="isRequestingPermissions ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-microphone'"
            @click="requestPermissions"
          >
            {{ isRequestingPermissions ? 'Requesting...' : 'Grant Permissions' }}
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Device Refresh / Lock -->
    <div class="device-refresh mt-3 d-flex flex-wrap gap-2 align-items-center">
      <UnifiedButton
        size="sm"
        variant="outline-secondary"
        :disabled="isRefreshing || disabled"
        :icon="isRefreshing ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-refresh'"
        @click="refreshDevices"
      >
        Refresh Devices
      </UnifiedButton>
      <UnifiedButton
        v-if="lockable"
        size="sm"
        :variant="isLocked ? 'warning' : 'outline-secondary'"
        :icon="isLocked ? 'mdi mdi-lock' : 'mdi mdi-lock-open-outline'"
        @click="isLocked ? unlockAudio() : lockAudio('Active session')"
      >
        {{ isLocked ? 'Unlock Audio Devices' : 'Lock Audio Devices' }}
      </UnifiedButton>
      <span v-if="isLocked" class="badge bg-warning-subtle text-warning-emphasis small">Locked</span>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-display mt-3" role="alert">
      <div class="alert alert-danger d-flex align-items-start">
        <AppIcon name="mdi-alert-circle-outline" class="me-2 mt-1" />
        <div>
          <div class="fw-semibold">Audio Device Error</div>
          <p class="mb-0">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, readonly, computed, watch, onBeforeUnmount, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { logger } from '@/shared/utils/logger';
import { audioService } from '@/shared/services/AudioService';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import { useMediaLock } from '@/composables/useMediaLock';

// Props
const props = defineProps({
  disabled: { type: Boolean, default: false },
  autoRefresh: { type: Boolean, default: true },
  showTestControls: { type: Boolean, default: true },
  lockable: { type: Boolean, default: true }
});
// Media lock integration
const { audioLocked, lockAudio, unlockAudio } = useMediaLock();
const isLocked = computed(() => audioLocked.value);

// Hotplug and refresh management
let refreshTimerId = null;
let deviceChangeListenerAttached = false;

const onDeviceChange = async () => {
  try {
    if (permissionsGranted.value) {
      await refreshDevices();
    }
  } catch (e) {
    logger.warn('Device change refresh failed:', e);
  }
};

// Emits
const emit = defineEmits([
  'microphoneSelected',
  'speakerSelected',
  'permissionsChanged',
  'devicesChanged',
  'error'
]);

// State
const permissionsGranted = ref(false);
const isRequestingPermissions = ref(false);
const isRefreshing = ref(false);
const isTestingAudio = ref(false);
const microphoneDevices = ref([]);
const speakerDevices = ref([]);
const selectedMicrophoneId = ref('');
const selectedSpeakerId = ref('');
const microphoneLevel = ref(0);
const error = ref('');

// Audio monitoring via AudioService

// Computed
const speakerSelectionSupported = computed(() => {
  // Speaker selection is limited in browsers
  // Chrome supports it, Firefox and Safari have limited support
  try {
    const AudioCtor = typeof window !== 'undefined' ? window.HTMLAudioElement : undefined;
    return !!(AudioCtor && AudioCtor.prototype && 'setSinkId' in AudioCtor.prototype);
  } catch (_error) {
    return false;
  }
});

 // Initialize on mount
onMounted(async () => {
  await checkPermissions();
  if (permissionsGranted.value) {
    await refreshDevices();
  }

  // Listen for device hotplug events
  try {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);
      deviceChangeListenerAttached = true;
    }
  } catch (e) {
    logger.warn('Unable to attach devicechange listener:', e);
  }

  // Auto-refresh devices periodically (fallback)
  if (props.autoRefresh && !refreshTimerId) {
    refreshTimerId = setInterval(() => {
      if (permissionsGranted.value) {
        refreshDevices();
      }
    }, 30000); // Every 30 seconds
  }
});

onBeforeUnmount(() => {
  cleanup();
});

// Watch for device changes
watch([selectedMicrophoneId, selectedSpeakerId], () => {
  if (selectedMicrophoneId.value) {
    startMicrophoneMonitoring();
  } else {
    stopMicrophoneMonitoring();
  }
});

// Permission handling
async function checkPermissions() {
  try {
    // Non-invasive check: do not prompt on mount
    let granted = false;
    const permAPI = navigator.permissions;
    if (permAPI && typeof permAPI.query === 'function') {
      try {
        const status = await permAPI.query({ name: 'microphone' });
        granted = status.state === 'granted';
      } catch {/* ignore unsupported */}
    }
    if (!granted && navigator.mediaDevices?.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      granted = devices.some(d => d.kind === 'audioinput' && typeof d.label === 'string' && d.label.trim().length > 0);
    }
    permissionsGranted.value = granted;
    emit('permissionsChanged', granted);
  } catch (err) {
    logger.error('Permission check failed:', err);
    setError(`Permission check failed: ${err.message}`);
  }
}

async function requestPermissions() {
  if (isRequestingPermissions.value) {return;}

  isRequestingPermissions.value = true;
  clearError();

  try {
    const granted = await audioService.requestMicrophonePermission();
    permissionsGranted.value = granted;
    emit('permissionsChanged', granted);
    if (granted) {
      await refreshDevices();
      logger.info('Microphone permissions granted');
    }
  } catch (err) {
    logger.error('Permission request failed:', err);
    setError(`Permission denied: ${err.message}`);
    permissionsGranted.value = false;
    emit('permissionsChanged', false);
  } finally {
    isRequestingPermissions.value = false;
  }
}

// Device enumeration
async function refreshDevices() {
  if (isRefreshing.value || !permissionsGranted.value) {return;}

  isRefreshing.value = true;
  clearError();

  try {
    const devices = await audioService.getAvailableDevices();
    microphoneDevices.value = devices.filter(d => d.kind === 'audioinput');
    speakerDevices.value = devices.filter(d => d.kind === 'audiooutput');

    // Emit devices changed event
    emit('devicesChanged', {
      microphones: microphoneDevices.value,
      speakers: speakerDevices.value
    });

    logger.info(`Found ${microphoneDevices.value.length} microphones, ${speakerDevices.value.length} speakers`);
  } catch (err) {
    logger.error('Device enumeration failed:', err);
    setError(`Failed to get audio devices: ${err.message}`);
  } finally {
    isRefreshing.value = false;
  }
}

// Device selection handlers
function onMicrophoneChange() {
  emit('microphoneSelected', {
    deviceId: selectedMicrophoneId.value,
    device: microphoneDevices.value.find(d => d.deviceId === selectedMicrophoneId.value)
  });
  try { audioService.setPreferredInputDevice(selectedMicrophoneId.value || undefined); } catch {}

  if (selectedMicrophoneId.value) {
    startMicrophoneMonitoring();
  } else {
    stopMicrophoneMonitoring();
  }
}

function onSpeakerChange() {
  emit('speakerSelected', {
    deviceId: selectedSpeakerId.value,
    device: speakerDevices.value.find(d => d.deviceId === selectedSpeakerId.value)
  });
  try { audioService.setPreferredOutputDevice(selectedSpeakerId.value || undefined); } catch { /* noop */ }
}

// Microphone monitoring
async function startMicrophoneMonitoring() {
  if (!selectedMicrophoneId.value || !permissionsGranted.value) {return;}
  try {
    await audioService.startMonitoring(selectedMicrophoneId.value, (lvl) => {
      microphoneLevel.value = Math.round(lvl * 100);
    });
    logger.info('Microphone monitoring started');
  } catch (err) {
    logger.error('Failed to start microphone monitoring:', err);
    setError(`Microphone monitoring failed: ${err.message}`);
  }
}

function stopMicrophoneMonitoring() {
  try { audioService.stopMonitoring(); } catch {}
  microphoneLevel.value = 0;
}

// Speaker testing
async function testSpeaker() {
  if (isTestingAudio.value) {return;}

  isTestingAudio.value = true;
  clearError();

  try {
    // Generate a simple test tone
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure test tone
    oscillator.frequency.value = 440; // A4 note
    oscillator.type = 'sine';

    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);

    // Play for 0.5 seconds
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // If speaker selection is supported, try to use selected speaker
    if (speakerSelectionSupported.value && selectedSpeakerId.value) {
      try {
        await audioContext.destination.setSinkId(selectedSpeakerId.value);
        logger.info(`Test audio routed to speaker: ${selectedSpeakerId.value}`);
      } catch (err) {
        logger.warn('Failed to route to selected speaker:', err);
        // Continue with default speaker
      }
    }

    // Clean up after test
    setTimeout(() => {
      isTestingAudio.value = false;
      audioContext.close();
    }, 600);

    logger.info('Speaker test completed');
  } catch (err) {
    logger.error('Speaker test failed:', err);
    setError(`Speaker test failed: ${err.message}`);
    isTestingAudio.value = false;
  }
}

// Utility functions
function setError(message) {
  error.value = message;
  emit('error', message);
}

function clearError() {
  error.value = '';
}

function cleanup() {
  stopMicrophoneMonitoring();
  try {
    if (refreshTimerId) {
      clearInterval(refreshTimerId);
      refreshTimerId = null;
    }
  } catch {}
  try {
    if (deviceChangeListenerAttached && typeof navigator !== 'undefined' && navigator.mediaDevices?.removeEventListener) {
      navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange);
      deviceChangeListenerAttached = false;
    }
  } catch {}
}

// Expose methods and state
defineExpose({
  refreshDevices,
  requestPermissions,
  testSpeaker,
  microphoneDevices: readonly(microphoneDevices),
  speakerDevices: readonly(speakerDevices),
  permissionsGranted: readonly(permissionsGranted),
  selectedMicrophoneId,
  selectedSpeakerId,
  isLocked
});
</script>

<style scoped>
.audio-device-selector {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
}

.device-controls .form-label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.mic-level-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.mic-level-label {
  flex-shrink: 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.mic-level-bar {
  flex: 1;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.mic-level-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745 0%, #ffc107 50%, #fd7e14 85%, #dc3545 100%);
  border-radius: 2px;
  transition: width 0.15s ease;
}

.mic-level-fill.level-high {
  background: #dc3545;
  animation: level-warning 0.5s ease-in-out infinite alternate;
}

@keyframes level-warning {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

.mic-level-value {
  flex-shrink: 0;
  min-width: 35px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
  color: #6c757d;
}

.permission-controls .alert {
  margin-bottom: 0;
}

.device-refresh {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  text-align: left;
}

.badge.small { font-size: 0.65rem; }

.error-display .alert {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .device-controls .row > .col-md-6 {
    margin-bottom: 1rem;
  }

  .device-controls .row > .col-md-6:last-child {
    margin-bottom: 0;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .audio-device-selector {
    background: #343a40;
    border-color: var(--border-base);
    color: var(--text-on-primary);
  }

  .device-controls .form-label {
    color: var(--text-muted);
  }

  .mic-level-label,
  .mic-level-value {
    color: var(--text-muted);
  }

  .mic-level-bar {
    background: #495057;
  }

  .device-refresh {
    border-top-color: var(--border-base);
  }
}
</style>
