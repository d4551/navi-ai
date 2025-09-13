<!--
VOICE CONTROLS COMPONENT
========================

Advanced voice interaction controls with push-to-talk, volume monitoring,
and device selection. Features WCAG 2.2 compliance and Material Design.
-->

<template>
  <div class="voice-controls" :class="{ 'voice-controls--active': isActive }">
    <!-- Device Selection -->
    <div v-if="showDeviceSelector" class="voice-controls__devices">
      <v-select
        v-model="selectedDevice"
        :items="deviceOptions"
        item-title="label"
        item-value="deviceId"
        label="Audio Input Device"
        variant="outlined"
        density="comfortable"
        hide-details
        :disabled="isRecording"
        @update:model-value="handleDeviceChange"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-microphone" size="small" />
        </template>
      </v-select>
    </div>

    <!-- Voice Control Panel -->
    <div class="voice-controls__panel">
      <!-- Volume Meter -->
      <div
        v-if="showVolumeMeter && isRecording"
        class="voice-controls__volume"
        :aria-label="`Audio level: ${Math.round(audioVolume)}%`"
        role="progressbar"
        :aria-valuenow="Math.round(audioVolume)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="volume-meter">
          <div
            class="volume-meter__fill"
            :style="{
              width: `${Math.min(100, audioVolume)}%`,
              backgroundColor: getVolumeMeterColor(audioVolume),
            }"
          />
        </div>
        <span class="volume-meter__label sr-only">
          Volume: {{ Math.round(audioVolume) }}%
        </span>
      </div>

      <!-- Push-to-Talk Button -->
      <UnifiedButton
        ref="pushToTalkBtn"
        :class="[
          'voice-controls__ptt-btn',
          {
            'voice-controls__ptt-btn--recording': isRecording,
            'voice-controls__ptt-btn--processing': isProcessing,
            'voice-controls__ptt-btn--error': hasError,
          },
        ]"
        :disabled="!canRecord || isProcessing"
        :loading="isProcessing"
        size="lg"
        :appearance="isRecording ? 'outlined' : 'contained'"
        :color="getButtonColor()"
        :aria-label="getButtonAriaLabel()"
        :aria-pressed="isRecording"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @keydown="handleKeyDown"
        @keyup="handleKeyUp"
      >
        <!-- Button Icon -->
        <AppIcon :name="getButtonIcon()" :class="{ rotating: isProcessing }" />

        <!-- Recording Indicator -->
        <div
          v-if="isRecording"
          class="voice-controls__recording-indicator"
          aria-hidden="true"
        />
      </UnifiedButton>

      <!-- Status Text -->
      <div class="voice-controls__status">
        <p
          class="status-text"
          :class="{
            'status-text--recording': isRecording,
            'status-text--error': hasError,
            'status-text--processing': isProcessing,
          }"
          role="status"
          aria-live="polite"
        >
          {{ getStatusText() }}
        </p>

        <!-- Recording Duration -->
        <p
          v-if="isRecording && recordingDuration > 0"
          class="recording-duration"
          aria-live="off"
        >
          {{ formatDuration(recordingDuration) }}
        </p>
      </div>
    </div>

    <!-- Error Message -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="voice-controls__error mt-2"
      @click:close="$emit('clear-error')"
    >
      <template #prepend>
        <v-icon icon="mdi-microphone-off" />
      </template>
      <span>{{ error }}</span>
      <template #append>
        <UnifiedButton
          variant="ghost"
          size="sm"
          @click="$emit('retry-permission')"
        >
          Retry
        </UnifiedButton>
      </template>
    </v-alert>

    <!-- Keyboard Instructions -->
    <div v-if="showInstructions" class="voice-controls__instructions">
      <UiChip classes="chip chip-compact">
        <AppIcon name="mdi-keyboard" class="me-1" />
        Hold Space to talk
      </UiChip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import UiChip from "@/components/ui/UiChip.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Props
interface Props {
  isRecording?: boolean;
  isProcessing?: boolean;
  canRecord?: boolean;
  hasError?: boolean;
  error?: string | null;
  audioVolume?: number;
  devices?: MediaDeviceInfo[];
  selectedDevice?: string;
  recordingDuration?: number;
  showDeviceSelector?: boolean;
  showVolumeMeter?: boolean;
  showInstructions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isRecording: false,
  isProcessing: false,
  canRecord: true,
  hasError: false,
  error: null,
  audioVolume: 0,
  devices: () => [],
  selectedDevice: "",
  recordingDuration: 0,
  showDeviceSelector: true,
  showVolumeMeter: true,
  showInstructions: true,
});

// Emits
const emit = defineEmits<{
  "start-recording": [];
  "stop-recording": [];
  "device-change": [deviceId: string];
  "clear-error": [];
  "retry-permission": [];
}>();

// Refs
const pushToTalkBtn = ref<HTMLElement>();

// State
const isMouseDown = ref(false);
const isTouchDown = ref(false);
const isKeyDown = ref(false);

// Computed
const isActive = computed(() => props.isRecording || props.isProcessing);

const deviceOptions = computed(() =>
  props.devices.map((device) => ({
    deviceId: device.deviceId,
    label: device.label || `Microphone ${device.deviceId.slice(0, 8)}...`,
    value: device.deviceId,
  })),
);

// Methods
const getButtonColor = () => {
  if (props.hasError) return "error";
  if (props.isRecording) return "success";
  if (props.isProcessing) return "primary";
  return "surface-variant";
};

const getButtonIcon = () => {
  if (props.hasError) return "mdi-microphone-off";
  if (props.isProcessing) return "mdi-loading";
  if (props.isRecording) return "mdi-stop";
  return "mdi-microphone";
};

const getButtonAriaLabel = () => {
  if (props.hasError) return "Microphone error - retry";
  if (props.isProcessing) return "Processing audio...";
  if (props.isRecording) return "Stop recording";
  return "Start recording - hold to speak";
};

const getStatusText = () => {
  if (props.hasError) return "Microphone access required";
  if (props.isProcessing) return "Processing...";
  if (props.isRecording) return "Listening...";
  return "Hold to speak";
};

const getVolumeMeterColor = (volume: number) => {
  if (volume < 20) return "rgb(var(--v-theme-success))";
  if (volume < 50) return "rgb(var(--v-theme-warning))";
  return "rgb(var(--v-theme-error))";
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${remainingSeconds}s`;
};

// Event Handlers
const startRecording = () => {
  if (props.canRecord && !props.isProcessing) {
    emit("start-recording");
  }
};

const stopRecording = () => {
  if (props.isRecording) {
    emit("stop-recording");
  }
};

// Mouse/Touch Handlers
const handleMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  isMouseDown.value = true;
  startRecording();
};

const handleMouseUp = () => {
  isMouseDown.value = false;
  stopRecording();
};

const handleMouseLeave = () => {
  if (isMouseDown.value) {
    isMouseDown.value = false;
    stopRecording();
  }
};

const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault();
  isTouchDown.value = true;
  startRecording();
};

const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  isTouchDown.value = false;
  stopRecording();
};

// Keyboard Handlers
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    isKeyDown.value = true;
    startRecording();
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.code === "Space") {
    event.preventDefault();
    isKeyDown.value = false;
    stopRecording();
  }
};

// Global keyboard handler for space bar
const handleGlobalKeyDown = (event: KeyboardEvent) => {
  if (
    event.code === "Space" &&
    document.activeElement === pushToTalkBtn.value &&
    !event.repeat
  ) {
    handleKeyDown(event);
  }
};

const handleGlobalKeyUp = (event: KeyboardEvent) => {
  if (
    event.code === "Space" &&
    document.activeElement === pushToTalkBtn.value
  ) {
    handleKeyUp(event);
  }
};

const handleDeviceChange = (deviceId: string) => {
  emit("device-change", deviceId);
};

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleGlobalKeyDown);
  document.addEventListener("keyup", handleGlobalKeyUp);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleGlobalKeyDown);
  document.removeEventListener("keyup", handleGlobalKeyUp);
});

// Watch for recording state changes
watch(
  () => props.isRecording,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      // Provide haptic feedback if available
      if ("vibrate" in navigator && newVal) {
        navigator.vibrate(50);
      }
    }
  },
);
</script>

<style scoped>
.voice-controls {
  @apply flex flex-col gap-4 p-4 rounded-lg;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-controls--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.12);
}

.voice-controls__panel {
  @apply flex flex-col items-center gap-3;
}

.voice-controls__volume {
  @apply w-full;
}

.volume-meter {
  @apply w-full h-1 bg-surface-variant rounded-full overflow-hidden;
  position: relative;
}

.volume-meter__fill {
  @apply h-full rounded-full transition-all duration-150;
  min-width: 2px;
}

.volume-meter__label {
  @apply text-xs text-on-surface-variant mt-1;
}

.voice-controls__ptt-btn {
  @apply relative;
  min-width: 80px !important;
  min-height: 80px !important;
  border-radius: 50% !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-controls__ptt-btn--recording {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(var(--v-theme-success), 0.4);
  animation: pulse 2s infinite;
}

.voice-controls__ptt-btn--processing {
  cursor: wait;
}

.voice-controls__ptt-btn--error {
  box-shadow: 0 0 20px rgba(var(--v-theme-error), 0.4);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(var(--v-theme-success), 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(var(--v-theme-success), 0.6);
  }
}

.voice-controls__recording-indicator {
  @apply absolute top-2 right-2 w-3 h-3 bg-error rounded-full;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.voice-controls__status {
  @apply text-center;
}

.status-text {
  @apply text-sm font-medium text-on-surface;
  transition: color 0.2s ease;
}

.status-text--recording {
  @apply text-success;
}

.status-text--error {
  @apply text-error;
}

.status-text--processing {
  @apply text-primary;
}

.recording-duration {
  @apply text-xs text-on-surface-variant mt-1;
  font-variant-numeric: tabular-nums;
}

.voice-controls__instructions {
  @apply flex justify-center;
}

.voice-controls__error {
  @apply mt-2;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
}

@media (prefers-contrast: high) {
  .voice-controls {
  }

  .voice-controls--active {
  }
}

@media (prefers-reduced-motion: reduce) {
  .voice-controls,
  .voice-controls__ptt-btn,
  .volume-meter__fill,
  .status-text {
    transition: none;
  }

  .voice-controls__ptt-btn--recording {
    animation: none;
    transform: none;
  }

  .voice-controls__recording-indicator {
    animation: none;
  }

  .rotating {
    animation: none;
  }
}

.voice-controls__ptt-btn:focus-visible {
}
</style>
