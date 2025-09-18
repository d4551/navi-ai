<template>
  <div v-if="showFeedback" class="audio-feedback-overlay">
    <!-- Voice Activity Indicator -->
    <div class="voice-activity-indicator" :class="activityClasses">
      <div class="activity-visual">
        <div class="volume-bars">
          <div
            v-for="bar in 5"
            :key="bar"
            class="volume-bar"
            :style="{
              height: getBarHeight(bar),
              animationDelay: `${bar * 0.1}s`,
            }"
          />
        </div>
        <div class="activity-icon">
          <AppIcon
            :name="activityIcon"
            :class="{ pulse: enhancedAudio.isActive }"
          />
        </div>
      </div>

      <!-- Status Text -->
      <div class="activity-status">
        <span class="status-text">{{ statusText }}</span>
        <div v-if="confidence" class="confidence-indicator">
          <div class="confidence-bar">
            <div class="confidence-fill" :style="{ width: `${confidence}%` }" />
          </div>
          <span class="confidence-text">{{ confidence }}% confidence</span>
        </div>
      </div>
    </div>

    <!-- Feedback Messages -->
    <Transition name="feedback-slide" appear>
      <div
        v-if="currentFeedback"
        class="feedback-message"
        :class="`feedback-${currentFeedback.type}`"
      >
        <AppIcon :name="getFeedbackIcon(currentFeedback.type)" />
        <span>{{ currentFeedback.message }}</span>
        <button
          class="feedback-dismiss"
          aria-label="Dismiss"
          @click="dismissFeedback"
        >
          <AppIcon name="XMarkIcon" />
        </button>
      </div>
    </Transition>

    <!-- Voice Commands Hint -->
    <div v-if="showVoiceHints && enhancedAudio.isActive" class="voice-hints">
      <div class="hints-title">Try saying:</div>
      <div class="hints-list">
        <span v-for="hint in voiceHints" :key="hint" class="voice-hint">
          "{{ hint }}"
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

import { computed, ref, watch } from 'vue'
import { enhancedAudioService } from '@/shared/services/EnhancedAudioService'
import AppIcon from '@/components/ui/AppIcon.vue'

interface Props {
  showVoiceHints?: boolean
  enableVisualFeedback?: boolean
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'center'
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showVoiceHints: false,
  enableVisualFeedback: true,
  position: 'top-right',
  compact: false,
})

const enhancedAudio = enhancedAudioService
const confidence = ref<number | undefined>()

// Voice command hints based on current context
const voiceHints = computed(() => [
  'Start recording',
  'Stop listening',
  'Search for jobs',
  'Open settings',
  'Show my portfolio',
])

const showFeedback = computed(
  () =>
    props.enableVisualFeedback &&
    (enhancedAudio.isActive ||
      currentFeedback.value ||
      enhancedAudio.hasRecentActivity)
)

const currentFeedback = computed(() => enhancedAudio.currentFeedback)

const activityClasses = computed(() => ({
  'is-listening': enhancedAudio.activity.value.isListening,
  'is-speaking': enhancedAudio.activity.value.isSpeaking,
  'has-activity': enhancedAudio.isActive,
  compact: props.compact,
  [`position-${props.position}`]: true,
}))

const activityIcon = computed(() => {
  if (enhancedAudio.activity.value.isListening) return 'MicrophoneIcon'
  if (enhancedAudio.activity.value.isSpeaking) return 'SpeakerWaveIcon'
  return 'MicrophoneIcon-off'
})

const statusText = computed(() => {
  if (enhancedAudio.activity.value.isListening) return 'Listening...'
  if (enhancedAudio.activity.value.isSpeaking) return 'Speaking...'
  if (enhancedAudio.hasRecentActivity) return 'Voice ready'
  return 'Voice inactive'
})

// Generate volume bar heights based on activity
function getBarHeight(barIndex: number): string {
  const volume = enhancedAudio.activity.value.volume
  const threshold = (barIndex - 1) / 5

  if (!enhancedAudio.activity.value.isListening) {
    return '4px'
  }

  if (volume > threshold) {
    const intensity = Math.min(1, (volume - threshold) * 5)
    return `${4 + intensity * 20}px`
  }

  return '4px'
}

function getFeedbackIcon(type: string): string {
  switch (type) {
    case 'success':
      return 'CheckIcon-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'InformationCircleIconrmation'
    default:
      return 'InformationCircleIconrmation'
  }
}

function dismissFeedback() {
  const current = currentFeedback.value
  if (current) {
    const index = enhancedAudio.feedback.value.indexOf(current)
    if (index > -1) {
      enhancedAudio.feedback.value.splice(index, 1)
    }
  }
}

// Watch for changes in speech recognition confidence
watch(
  () => enhancedAudio.activity.value,
  activity => {
    // Update confidence from speech recognition if available
    confidence.value = activity.confidence
  },
  { deep: true }
)
</script>

<style scoped>
.audio-feedback-overlay {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  font-family: var(--font-mono);
}

.voice-activity-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
  pointer-events: auto;
}

.voice-activity-indicator.position-top-right {
  top: 20px;
  right: 20px;
}

.voice-activity-indicator.position-top-left {
  top: 20px;
  left: 20px;
}

.voice-activity-indicator.position-bottom-right {
  bottom: 20px;
  right: 20px;
}

.voice-activity-indicator.position-bottom-left {
  bottom: 20px;
  left: 20px;
}

.voice-activity-indicator.position-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.voice-activity-indicator.compact {
  padding: 8px 12px;
  gap: 8px;
}

.voice-activity-indicator.has-activity {
  border-color: rgb(var(--color-primary-rgb), 0.3);
  box-shadow:
    var(--glass-shadow),
    0 0 20px rgba(var(--color-primary-rgb), 0.2);
}

.voice-activity-indicator.is-listening {
  border-color: rgb(var(--color-success-rgb), 0.5);
  animation: pulse-listening 2s infinite;
}

.voice-activity-indicator.is-speaking {
  border-color: rgb(var(--color-info-rgb), 0.5);
  animation: pulse-speaking 1.5s infinite;
}

.activity-visual {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 20px;
}

.volume-bar {
  width: 3px;
  background: var(--color-primary-500);
  border-radius: 2px;
  transition: height 0.1s ease;
  opacity: 0.7;
}

.voice-activity-indicator.is-listening .volume-bar {
  animation: volume-pulse 0.6s infinite alternate;
}

.activity-icon {
  color: var(--color-primary-500);
  font-size: 18px;
}

.activity-icon.pulse {
  animation: icon-pulse 2s infinite;
}

.activity-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary-600);
}

.confidence-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.confidence-bar {
  width: 60px;
  height: 4px;
  background: var(--glass-border);
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-warning-500),
    var(--color-success-500)
  );
  transition: width 0.3s ease;
}

.confidence-text {
  font-size: 11px;
  color: var(--text-secondary);
}

.feedback-message {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: var(--glass-shadow);
  font-size: 14px;
  font-weight: 500;
  max-width: 300px;
  pointer-events: auto;
}

.feedback-message.feedback-success {
  border-color: rgb(var(--color-success-rgb), 0.3);
  color: var(--color-success-700);
}

.feedback-message.feedback-error {
  border-color: rgb(var(--color-error-rgb), 0.3);
  color: var(--color-error-700);
}

.feedback-message.feedback-warning {
  border-color: rgb(var(--color-warning-rgb), 0.3);
  color: var(--color-warning-700);
}

.feedback-message.feedback-info {
  border-color: rgb(var(--color-info-rgb), 0.3);
  color: var(--color-info-700);
}

.feedback-dismiss {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.feedback-dismiss:hover {
  background: var(--glass-hover-bg);
}

.voice-hints {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--glass-shadow);
  max-width: 250px;
  pointer-events: auto;
}

.hints-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.hints-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.voice-hint {
  font-size: 11px;
  color: var(--text-tertiary);
  font-style: italic;
  padding: 2px 6px;
  background: var(--glass-hover-bg);
  border-radius: 4px;
}

/* Animations */
@keyframes pulse-listening {
  0%,
  100% {
    box-shadow:
      var(--glass-shadow),
      0 0 0 0 rgba(var(--color-success-rgb), 0.7);
  }
  50% {
    box-shadow:
      var(--glass-shadow),
      0 0 0 8px rgba(var(--color-success-rgb), 0);
  }
}

@keyframes pulse-speaking {
  0%,
  100% {
    box-shadow:
      var(--glass-shadow),
      0 0 0 0 rgba(var(--color-info-rgb), 0.7);
  }
  50% {
    box-shadow:
      var(--glass-shadow),
      0 0 0 6px rgba(var(--color-info-rgb), 0);
  }
}

@keyframes volume-pulse {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Transitions */
.feedback-slide-enter-active,
.feedback-slide-leave-active {
  transition: all 0.3s ease;
}

.feedback-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.feedback-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .voice-activity-indicator {
    padding: 8px 12px;
    font-size: 12px;
  }

  .feedback-message {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .voice-hints {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
