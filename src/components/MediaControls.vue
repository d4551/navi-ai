<template>
  <div class="media-controls glass-surface" :class="{ 'streaming': isStreaming }" class="font-sans">
    <div class="controls-header">
      <h3 class="controls-title">
        <AppIcon name="VideoCameraIcon-outline" class="rgb-icon" />
        Media Hub
      </h3>
      <div class="status-indicator" :class="{ 'active': isStreaming }">
        <div v-if="isStreaming" class="pulse-ring"></div>
        <div class="status-dot"></div>
        <span class="status-text">
          {{ isStreaming ? `${activeType} Active` : 'Inactive' }}
        </span>
      </div>
    </div>

    <!-- Device Selection / Quality Row -->
    <div class="device-flex flex-wrap glass-surface-sm">
      <div class="device-group">
        <label class="form-label">Camera</label>
        <select v-model="selectedCameraId" class="form-select glass-input">
          <option v-for="d in videoInputs" :key="d.deviceId" :value="d.deviceId">{{ d.label || 'Camera' }}</option>
        </select>
      </div>
      <div class="device-group">
        <label class="form-label">Microphone</label>
        <select v-model="selectedMicId" class="form-select glass-input">
          <option v-for="d in audioInputs" :key="d.deviceId" :value="d.deviceId">{{ d.label || 'Microphone' }}</option>
        </select>
      </div>
      <div class="device-group">
        <label class="form-label">Quality</label>
        <div class="quality-chips">
          <span v-for="p in qualityPresets" :key="p.key" class="quality-chip" :class="{ active: selectedQuality === p.key }" @click="selectedQuality = p.key">{{ p.label }}</span>
        </div>
      </div>
    </div>

    <div class="controls-grid">
      <!-- Webcam Controls -->
      <div class="control-section glass-surface-sm">
        <div class="control-header">
          <div class="control-title">
            <AppIcon name="CameraIcon" color="primary" />
            <span>Webcam</span>
          </div>
          <div class="control-badge" :class="{ 'active': webcam.isStreaming.value }">
            {{ webcam.isStreaming.value ? 'Active' : 'Inactive' }}
          </div>
        </div>
        <UnifiedButton
          :variant="webcam.isStreaming.value ? 'danger' : 'gaming'"
          :loading="loading && loadingType === 'webcam'"
          :leading-icon="webcam.isStreaming.value ? 'CameraIcon-off' : 'CameraIcon'"
          @click="toggleWebcam"
        >
          {{ webcam.isStreaming.value ? 'Stop Webcam' : 'Start Webcam' }}
        </UnifiedButton>
        <div v-if="webcam.isStreaming.value" class="preview-area">
          <video ref="webcamPreview" autoplay muted class="preview-video"></video>
        </div>
      </div>

      <!-- Screen Capture Controls -->
      <div class="control-section glass-surface-sm">
        <div class="control-header">
          <div class="control-title">
            <AppIcon name="ComputerDesktopIcon" class="rgb-text-accent" />
            <span>Screen Share</span>
          </div>
          <div class="control-badge" :class="{ 'active': screenCapture.isStreaming.value }">
            {{ screenCapture.isStreaming.value ? 'Active' : 'Inactive' }}
          </div>
        </div>
        <UnifiedButton
          :variant="screenCapture.isStreaming.value ? 'danger' : 'glass'"
          :loading="loading && loadingType === 'screen'"
          :leading-icon="screenCapture.isStreaming.value ? 'mdi-monitor-off' : 'mdi-monitor-screenshot'"
          @click="toggleScreenCapture"
        >
          {{ screenCapture.isStreaming ? 'Stop Sharing' : 'Share Screen' }}
        </UnifiedButton>
        <div v-if="screenCapture.isStreaming" class="preview-area">
          <video ref="screenPreview" autoplay muted class="preview-video"></video>
        </div>
      </div>
    </div>

    <!-- Audio Controls -->
    <div class="audio-controls glass-surface-sm">
      <div class="audio-header">
        <div class="control-title">
          <AppIcon name="MicrophoneIcon" />
          <span>Microphone</span>
        </div>
        <UnifiedButton
          :variant="isMicrophoneEnabled ? 'warning' : 'glass'"
          :disabled="!isStreaming"
          :leading-icon="isMicrophoneEnabled ? 'MicrophoneIcon' : 'MicrophoneIcon-off'"
          @click="toggleMicrophone"
        >
          {{ isMicrophoneEnabled ? 'Mute' : 'Unmute' }}
        </UnifiedButton>
      </div>
      <div v-if="isStreaming" class="audio-visualizer">
        <div class="visualizer-bars">
          <div v-for="n in 12" :key="n" class="bar" :style="{ animationDelay: `${n * 0.1}s` }"></div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-section glass-surface-sm">
      <div class="error-header">
        <AppIcon name="ExclamationCircleIcon" class="rgb-text-red" />
        <span>Error</span>
      </div>
      <p class="error-message">{{ error }}</p>
      <UnifiedButton variant="glass" size="sm" leading-icon="XMarkIcon" @click="clearError">Dismiss</UnifiedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CameraIcon, ComputerDesktopIcon, ExclamationCircleIcon, MicrophoneIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useMediaStreamMux } from '@/composables/useMediaStreamMux'
import { useAppStore } from '@/stores/app'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Define emits
const emit = defineEmits<{
  'stream-started': [stream: MediaStream, type?: 'webcam' | 'screen']
  'stream-stopped': []
  'error': [message: string]
}>()

const {
  activeType,
  isStreaming,
  webcam,
  screenCapture,
  startWebcam,
  startScreenCapture,
  toggleMicrophone,
  isMicrophoneEnabled,
} = useMediaStreamMux()

const loading = ref(false)
const loadingType = ref<'webcam' | 'screen' | null>(null)
const error = ref<string | null>(null)
const webcamPreview = ref<HTMLVideoElement>()
const screenPreview = ref<HTMLVideoElement>()

// Devices
const videoInputs = ref<MediaDeviceInfo[]>([])
const audioInputs = ref<MediaDeviceInfo[]>([])
const selectedCameraId = ref<string>('')
const selectedMicId = ref<string>('')
type QualityKey = 'sd' | 'hd' | 'fhd' | 'uhd'
const qualityPresets: { key: QualityKey; label: string; constraints: MediaTrackConstraints }[] = [
  { key: 'sd', label: '480p', constraints: { width: { ideal: 640 }, height: { ideal: 480 } } },
  { key: 'hd', label: '720p', constraints: { width: { ideal: 1280 }, height: { ideal: 720 } } },
  { key: 'fhd', label: '1080p', constraints: { width: { ideal: 1920 }, height: { ideal: 1080 } } },
  { key: 'uhd', label: '4K', constraints: { width: { ideal: 3840 }, height: { ideal: 2160 } } },
]
const selectedQuality = ref<QualityKey>('hd')

const store = useAppStore()

async function enumerateDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    videoInputs.value = devices.filter(d => d.kind === 'videoinput')
    audioInputs.value = devices.filter(d => d.kind === 'audioinput')
    if (!selectedCameraId.value && videoInputs.value[0]) selectedCameraId.value = videoInputs.value[0].deviceId
    if (!selectedMicId.value && audioInputs.value[0]) selectedMicId.value = audioInputs.value[0].deviceId
  } catch (e) {
    // ignore
  }
}

const toggleWebcam = async () => {
  try {
    loading.value = true
    loadingType.value = 'webcam'
    error.value = null

    if (webcam.isStreaming.value) {
      webcam.stop()
      emit('stream-stopped')
    } else {
      const preset = qualityPresets.find(p => p.key === selectedQuality.value)
      const video: MediaTrackConstraints = {
        ...(preset?.constraints || {}),
        ...(selectedCameraId.value ? { deviceId: { exact: selectedCameraId.value } } : {})
      }
      const audio: MediaTrackConstraints = selectedMicId.value ? { deviceId: { exact: selectedMicId.value } } : {}
      await startWebcam({ video, audio })
      if (webcam.stream?.value) {
        emit('stream-started', webcam.stream.value as any, 'webcam')
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to access webcam'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    loading.value = false
    loadingType.value = null
  }
}

const toggleScreenCapture = async () => {
  try {
    loading.value = true
    loadingType.value = 'screen'
    error.value = null

    if (screenCapture.isStreaming.value) {
      screenCapture.stop()
      emit('stream-stopped')
    } else {
      const audioOpt = !!store.settings?.streaming?.screen?.shareAudio
      await startScreenCapture({ audio: audioOpt })
      if (screenCapture.stream?.value) {
        emit('stream-started', screenCapture.stream.value as any, 'screen')
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to capture screen'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    loading.value = false
    loadingType.value = null
  }
}

const clearError = () => {
  error.value = null
}

// Watch for stream changes and update video elements
watch(() => webcam.stream.value, () => {
  nextTick(() => {
    if (webcamPreview.value && webcam.stream?.value) {
      webcamPreview.value.srcObject = webcam.stream.value as any
    }
  })
})

watch(() => screenCapture.stream.value, () => {
  nextTick(() => {
    if (screenPreview.value && screenCapture.stream?.value) {
      screenPreview.value.srcObject = screenCapture.stream.value as any
    }
  })
})

onMounted(() => {
  enumerateDevices()
  try { navigator.mediaDevices.addEventListener?.('devicechange', enumerateDevices) } catch {}
  // Initialize selections from store
  try {
    const s = store.settings
    if (s?.selectedMicId) selectedMicId.value = s.selectedMicId
    if (s?.streaming?.video?.selectedCameraId) selectedCameraId.value = s.streaming.video.selectedCameraId
    const res = s?.streaming?.video?.resolution || '720p'
    selectedQuality.value = res === '1080p' ? 'fhd' : res === '4k' ? 'uhd' : 'hd'
  } catch {}
})

onUnmounted(() => {
  try { navigator.mediaDevices.removeEventListener?.('devicechange', enumerateDevices) } catch {}
})

// Persist selections to store
watch(selectedMicId, (v) => {
  try { store.updateSettings({ selectedMicId: v }) } catch {}
})
watch(selectedCameraId, (v) => {
  try { store.updateSettings({ streaming: { video: { selectedCameraId: v } } as any }) } catch {}
})
watch(selectedQuality, (v) => {
  const resolution = v === 'fhd' ? '1080p' : v === 'uhd' ? '4k' : '720p'
  try { store.updateSettings({ streaming: { video: { resolution } } as any }) } catch {}
})

// Expose controls for parent usage
function getCurrentConstraints(): { video: MediaTrackConstraints; audio: MediaTrackConstraints } {
  const preset = qualityPresets.find(p => p.key === selectedQuality.value)
  const video: MediaTrackConstraints = {
    ...(preset?.constraints || {}),
    ...(selectedCameraId.value ? { deviceId: { exact: selectedCameraId.value } } : {})
  }
  const audio: MediaTrackConstraints = selectedMicId.value ? { deviceId: { exact: selectedMicId.value } } : {}
  return { video, audio }
}

async function startCamera() {
  if (webcam.isStreaming.value) return
  const c = getCurrentConstraints()
  await startWebcam(c)
}

async function shareScreen() {
  if (screenCapture.isStreaming.value) return
  const audioOpt = !!store.settings?.streaming?.screen?.shareAudio
  await startScreenCapture({ audio: audioOpt })
}

function stopAllStreams() {
  try {
    screenCapture.stop()
    webcam.stop()
  } catch {}
}

defineExpose({
  startCamera,
  shareScreen,
  stopAll: stopAllStreams,
  isStreaming,
})
</script>

<style scoped>
/* Media Controls - Canonical RGB Glass Theme */
.media-controls {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--grid-gap);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.device-flex flex-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.device-group .form-label { margin-bottom: 6px; display:block; color: var(--text-secondary); }
.quality-chips { display:flex; gap: var(--spacing-2); flex-wrap: wrap; }
.quality-chip { padding: 6px 10px; border-radius: 999px; background: var(--glass-bg); border: 1px solid var(--glass-border); cursor: pointer; font-size: 0.85rem; }
.quality-chip.active { background: var(--glass-elevated); border-color: var(--color-primary-400); }

.media-controls.streaming::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--rgb-primary), var(--rgb-accent), var(--rgb-secondary));
  animation: rgbFlow 3s linear infinite;
  z-index: 1;
}

/* Header Section */
.controls-header {
  text-align: center;
  margin-bottom: var(--grid-gap);
  padding-bottom: 1rem;
  border-b: 1px solid var(--glass-border);
}

.controls-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
}

.pulse-ring {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--rgb-green);
  border-radius: 50%;
  animation: rgbPulse 2s ease-in-out infinite;
  left: -8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--rgb-red);
  transition: all var(--transition-normal);
  box-shadow: 0 0 8px currentColor;
}

.status-indicator.active .status-dot {
  background: var(--rgb-green);
}

.status-text {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status-indicator.active .status-text {
  color: var(--rgb-green);
}

/* Controls Grid */
.controls-grid {
  @apply portfolio-grid;
  gap: var(--grid-gap);
  margin-bottom: var(--grid-gap);
}

.control-section {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.control-section:hover {
  transform: translateY(-2px);
  box-shadow: var(--rgb-primary-glow);
}

.control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.control-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-primary-600);
}

.control-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  transition: all var(--transition-normal);
}

.control-badge.active {
  background: var(--rgb-green);
  color: var(--rgb-white);
  box-shadow: var(--rgb-green-glow);
}

.control-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: var(--radius-md);
  color: var(--control-fg);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--color-primary-500) 18%, transparent));
  border-color: var(--control-border);
}

.control-btn.active {
  background: var(--control-active-bg);
  color: var(--control-active-fg);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, var(--control-border));
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-t: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
}

/* Preview Area */
.preview-area {
  margin-top: 1rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
}

.preview-video {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

/* Audio Controls */
.audio-controls {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  margin-top: var(--grid-gap);
}

.audio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.audio-btn {
  padding: 0.5rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary-600);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.audio-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--rgb-accent-glow);
  border-color: var(--rgb-accent);
}

.audio-btn.active {
  background: var(--rgb-accent);
  color: var(--rgb-white);
  border-color: var(--rgb-accent);
  box-shadow: var(--rgb-accent-glow);
}

.audio-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audio-visualizer {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.visualizer-bars {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 3px;
  height: 40px;
}

.bar {
  width: 4px;
  height: 6px;
  background: linear-gradient(to top, var(--rgb-primary), var(--rgb-accent));
  border-radius: var(--radius-sm);
  animation: audioVisualize 1.5s ease-in-out infinite alternate;
  box-shadow: 0 0 4px var(--rgb-primary);
}

/* Error Section */
.error-section {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  border-l: 4px solid var(--rgb-red);
  margin-top: var(--grid-gap);
  background: linear-gradient(135deg, transparent, rgba(var(--rgb-red-raw), 0.05));
}

.error-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--rgb-red);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.error-dismiss-btn {
  padding: 0.5rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary-600);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.875rem;
}

.error-dismiss-btn:hover {
  background: var(--glass-bg-hover);
  transform: translateY(-1px);
}

/* Animations */
@keyframes rgbFlow {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 0%; }
  100% { background-position: 0% 0%; }
}

@keyframes rgbPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes audioVisualize {
  0% {
    height: 6px;
    box-shadow: 0 0 4px var(--rgb-primary);
  }
  100% {
    height: calc(20px + (var(--i, 0) * 3px));
    box-shadow: 0 0 8px var(--rgb-accent);
  }
}

.bar:nth-child(1) { --i: 3; }
.bar:nth-child(2) { --i: 7; }
.bar:nth-child(3) { --i: 2; }
.bar:nth-child(4) { --i: 9; }
.bar:nth-child(5) { --i: 5; }
.bar:nth-child(6) { --i: 8; }
.bar:nth-child(7) { --i: 4; }
.bar:nth-child(8) { --i: 6; }
.bar:nth-child(9) { --i: 1; }
.bar:nth-child(10) { --i: 10; }
.bar:nth-child(11) { --i: 3; }
.bar:nth-child(12) { --i: 7; }

/* Mobile Responsive */
@media (max-width: 768px) {
  .media-controls {
    padding: 1rem;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .control-section {
    padding: 1rem;
  }
  
  .preview-video {
    height: 120px;
  }
  
  .audio-controls {
    padding: 1rem;
  }
  
  .visualizer-bars {
    height: 32px;
  }
  
  .control-title {
    font-size: 1.25rem;
  }
}

/* Tablet */
@media (max-width: 1024px) and (min-width: 769px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
