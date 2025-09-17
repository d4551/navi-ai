<!--
  CANONICAL Push-to-Talk Button Component
  Enhanced with proper microphone integration and AI service connection
-->
<template>
  <div
    class="push-to-talk-container"
    :class="{ recording: isRecording, speaking: isSpeaking, error: hasError }"
  >
    <!-- Main Push-to-Talk Button -->
    <button
      ref="pttButton"
      class="btn push-to-talk-btn"
      :class="buttonClasses"
      :disabled="!isAvailable || isSpeaking"
      :aria-label="ariaLabel"
      :aria-pressed="isRecording.toString()"
      @mousedown="startRecording"
      @mouseup="stopRecording"
      @mouseleave="stopRecording"
      @touchstart="startRecording"
      @touchend="stopRecording"
      @keydown.space.prevent="handleSpaceKey"
      @keyup.space.prevent="handleSpaceKeyUp"
    >
      <!-- Icon -->
      <AppIcon :name="iconClass" aria-hidden="true" />

      <!-- Text -->
      <span class="btn-text ms-2">{{ buttonText }}</span>

      <!-- Recording indicator -->
      <div v-if="isRecording" class="recording-pulse" aria-hidden="true"></div>
    </button>

    <!-- Voice Level Meter (when recording) -->
    <div v-if="isRecording" class="voice-meter-container mt-2">
      <div class="voice-meter">
        <div
          class="voice-level-fill"
          :style="{ width: `${voiceLevel}%` }"
          :aria-label="`Voice level: ${Math.round(voiceLevel)}%`"
        ></div>
      </div>
      <span class="recording-time">{{ formatTime(recordingTime) }}</span>
      <span class="max-time text-muted"
        >/ {{ formatTime(maxRecordingTime) }}</span
      >
    </div>

    <!-- Transcript Display -->
    <div
      v-if="(transcript || interimTranscript) && showTranscript"
      class="transcript-display mt-3"
    >
      <div class="transcript-content">
        <div v-if="transcript" class="final-transcript">{{ transcript }}</div>
        <div v-if="interimTranscript" class="interim-transcript">
          {{ interimTranscript }}
          <span class="cursor-blink">|</span>
        </div>
      </div>
    </div>

    <!-- AI Response Display -->
    <div v-if="aiResponse && showResponse" class="ai-response mt-3">
      <div
        class="response-header d-flex align-items-center justify-content-between"
      >
        <span class="response-label">AI Response:</span>
        <button
          v-if="!isSpeaking && aiResponse"
          class="btn btn-sm btn-outline-primary ui-btn ui-size-md"
          :disabled="!speechSynthesisAvailable"
          @click="speakResponse"
        >
          <AppIcon name="mdi-volume-high" />
          Speak
        </button>
      </div>
      <div class="response-content p-3 border rounded">
        <div class="streaming-text" :class="{ typing: isStreaming }">
          {{ displayedResponse }}
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-display mt-2" role="alert">
      <AppIcon name="mdi-alert-circle-outline" class="me-2" />
      {{ _error }}
    </div>

    <!-- Optional Device Selector (slot-first, prop fallback) -->
    <slot
      v-if="showDeviceSelector"
      name="device-selector"
      :microphone-devices="microphoneDevices"
      :selected-mic-id="selectedMicId"
      :set-selected-mic="setSelectedMic"
    >
      <div class="ptt-device-select mt-2">
        <label class="form-label small mb-1" for="ptt-mic-select">
          <AppIcon name="mdi-microphone" />
          Microphone
        </label>
        <select
          id="ptt-mic-select"
          v-model="selectedMicId"
          class="form-select form-select-sm"
          :disabled="isRecording"
          @change="setSelectedMic(selectedMicId)"
        >
          <option value="">Default Microphone</option>
          <option
            v-for="d in microphoneDevices"
            :key="d.deviceId"
            :value="d.deviceId"
          >
            {{ d.label || `Microphone ${d.deviceId.slice(-4)}` }}
          </option>
        </select>
      </div>
    </slot>
  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  ref,
  onMounted,
  readonly,
  computed,
  onBeforeUnmount,
  defineEmits,
  defineProps,
  defineExpose,
  watch,
} from 'vue'
import { useAppStore } from '@/stores/app'
import { audioService } from '@/shared/services/AudioService'
import { getBestAIClient, initializeAI } from '@/modules/ai'
import { logger } from '@/shared/utils/logger'
import { canonicalAIClient } from '@/shared/services/CanonicalAIClient'
import { speak as speakViaService } from '@/utils/voice'

// Props
const props = defineProps({
  maxRecordingTime: {
    type: Number,
    default: 30, // seconds
  },
  showTranscript: {
    type: Boolean,
    default: true,
  },
  showResponse: {
    type: Boolean,
    default: true,
  },
  showDeviceSelector: {
    type: Boolean,
    default: false,
  },
  autoSend: {
    type: Boolean,
    default: true,
  },
  systemPrompt: {
    type: String,
    default:
      'You are NAVI, a helpful AI career assistant. Provide concise, practical responses.',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits([
  'recordingStart',
  'recordingStop',
  'transcript',
  'response',
  'error',
])

// State
const isRecording = ref(false)
const isSpeaking = ref(false)
const isStreaming = ref(false)
const hasError = ref(false)
const error = ref('')
const transcript = ref('')
const interimTranscript = ref('')
const aiResponse = ref('')
const displayedResponse = ref('')
const voiceLevel = ref(0)
const recordingTime = ref(0)
const isAvailable = ref(false)
const speechSynthesisAvailable = ref(false)
const store = useAppStore()

// Optional device selection state (only used when showDeviceSelector is true)
const microphoneDevices = ref([])
const selectedMicId = ref('')

// Media references
let mediaRecorder = null
const audioStream = null
let audioContext = null
let analyser = null
let microphone = null
let recordingTimer = null
let recordingStartTime = null
let speechRecognition = null
let speechSynthesis = null

// Computed properties
const buttonClasses = computed(() => ({
  'btn-danger': isRecording.value,
  'btn-outline-primary': !isRecording.value && !hasError.value,
  'btn-outline-danger': hasError.value && !isRecording.value,
  disabled: !isAvailable.value || isSpeaking.value || props.disabled,
}))

const iconClass = computed(() => {
  if (hasError.value) {
    return 'mdi-microphone-off'
  }
  if (isRecording.value) {
    return 'mdi-stop-circle'
  }
  return 'mdi-microphone'
})

const buttonText = computed(() => {
  if (!isAvailable.value) {
    return 'Not Available'
  }
  if (hasError.value) {
    return 'Microphone Error'
  }
  if (isRecording.value) {
    return 'Recording...'
  }
  return 'Push to Talk'
})

const ariaLabel = computed(() => {
  if (isRecording.value) {
    return 'Stop recording (release to stop)'
  }
  return 'Start recording (hold to record)'
})

// Initialize component
onMounted(async () => {
  await initializeAudio()
  initializeSpeechRecognition()
  initializeSpeechSynthesis()
  if (props.showDeviceSelector) {
    try {
      const svc = await import('@/shared/services/AudioService')
      const devices = await svc.audioService.getAvailableDevices()
      microphoneDevices.value = devices.filter(d => d.kind === 'audioinput')
      const preferred = svc.audioService.getPreferredDevices?.().input || ''
      selectedMicId.value = typeof preferred === 'string' ? preferred : ''
    } catch {}
  }
})

onBeforeUnmount(() => {
  cleanup()
})

// React to language changes in settings
watch(
  () => store.settings?.voiceLang,
  lang => {
    try {
      if (speechRecognition) {
        speechRecognition.lang = lang || 'en-US'
      }
    } catch {}
  }
)

// Audio initialization
async function initializeAudio() {
  try {
    // Non-invasive availability check; do not prompt for permissions on mount
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      throw new Error('Media recording not supported')
    }
    isAvailable.value = true
    logger.info('Audio recording capabilities available')
  } catch (err) {
    logger.error('Audio initialization failed:', err)
    setError(`Microphone not available: ${err.message}`)
  }
}

// Speech recognition initialization
function initializeSpeechRecognition() {
  try {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      logger.warn('Speech recognition not supported')
      return
    }

    speechRecognition = new SpeechRecognition()
    speechRecognition.continuous = true
    speechRecognition.interimResults = true
    // Use settings-driven language, fallback to en-US
    speechRecognition.lang = store.settings?.voiceLang || 'en-US'

    speechRecognition.onresult = event => {
      let finalTranscript = ''
      let interimTranscriptText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment
        } else {
          interimTranscriptText += transcriptSegment
        }
      }

      if (finalTranscript) {
        transcript.value = finalTranscript
        emit('transcript', finalTranscript)

        if (props.autoSend && finalTranscript.trim()) {
          processTranscript(finalTranscript)
        }
      }

      interimTranscript.value = interimTranscriptText
    }

    speechRecognition.onerror = event => {
      logger.error('Speech recognition error:', event.error)
      setError(`Speech recognition error: ${event.error}`)
    }

    logger.info('Speech recognition initialized')
  } catch (err) {
    logger.error('Speech recognition initialization failed:', err)
  }
}

// Speech synthesis initialization
function initializeSpeechSynthesis() {
  if ('speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis
    speechSynthesisAvailable.value = true
    logger.info('Speech synthesis initialized')
  } else {
    logger.warn('Speech synthesis not supported')
  }
}

// Recording functions
async function startRecording() {
  if (
    !isAvailable.value ||
    isRecording.value ||
    isSpeaking.value ||
    props.disabled
  ) {
    return
  }

  try {
    // Clear previous state
    clearError()
    transcript.value = ''
    interimTranscript.value = ''
    aiResponse.value = ''
    displayedResponse.value = ''

    // Use canonical AudioService for recording & volume
    audioService.setVolumeCallback(v => {
      voiceLevel.value = Math.round(v * 100)
    })
    await audioService.startRecording({
      deviceId: selectedMicId.value || undefined,
    })

    // Start system speech recognition only if provider is system
    if (
      speechRecognition &&
      (store.settings?.sttProvider || 'system') === 'system'
    ) {
      speechRecognition.start()
    }

    recordingStartTime = Date.now()
    isRecording.value = true

    // Start recording timer
    recordingTimer = setInterval(() => {
      recordingTime.value = (Date.now() - recordingStartTime) / 1000

      // Auto-stop if max time reached
      if (recordingTime.value >= props.maxRecordingTime) {
        stopRecording()
      }
    }, 100)

    emit('recordingStart')
    logger.info('Recording started')
  } catch (err) {
    logger.error('Failed to start recording:', err)
    setError(`Failed to start recording: ${err.message}`)
  }
}

async function stopRecording() {
  if (!isRecording.value) {
    return
  }

  try {
    isRecording.value = false

    // Clear timer
    if (recordingTimer) {
      clearInterval(recordingTimer)
      recordingTimer = null
    }

    // Stop system speech recognition
    if (
      speechRecognition &&
      (store.settings?.sttProvider || 'system') === 'system'
    ) {
      speechRecognition.stop()
    }

    // Stop recording via canonical service and fetch blob
    const blob = await audioService.stopRecording()

    // If Gemini STT selected, transcribe via IPC when available, otherwise fallback to CanonicalAIClient
    if ((store.settings?.sttProvider || 'system') === 'gemini' && blob) {
      try {
        const base64 = await blobToBase64(blob)
        const mimeType = blob.type || 'audio/webm;codecs=opus'
        const language = store.settings?.voiceLang || 'en-US'
        let text = ''

        // Prefer Electron IPC when available
        try {
          const result = await window.api?.audio?.sttTranscribe?.({
            provider: 'gemini',
            language,
            mimeType,
            audioData: base64,
          })
          if (result?.success && result.transcript) {
            text = result.transcript
          }
        } catch {
          /* fall through to SDK */
        }

        // Fallback: use SDK via CanonicalAIClient
        if (!text) {
          try {
            // Ensure client is initialized
            const key = store.settings?.geminiApiKey || ''
            if (key && !canonicalAIClient.isReady()) {
              await canonicalAIClient.initialize(key)
            }
            const res = await canonicalAIClient.transcribeAudio({
              base64,
              mimeType,
              language,
            })
            text = res?.text || ''
          } catch (sdkErr) {
            logger.error('CanonicalAIClient.transcribeAudio failed', sdkErr)
          }
        }

        if (text) {
          transcript.value = text
          emit('transcript', text)
          if (props.autoSend) {
            processTranscript(text)
          }
        }
      } catch (e) {
        logger.error('Gemini STT failed', e)
      }
    }

    recordingTime.value = 0
    voiceLevel.value = 0

    emit('recordingStop', blob || null)
    logger.info('Recording stopped')
  } catch (err) {
    logger.error('Failed to stop recording:', err)
    setError(`Failed to stop recording: ${err.message}`)
  }
}

// MediaRecorder setup (kept local for future use; not registered globally)
// Internal (currently unused) — keep minimal for future use
function setupMediaRecorder() {
  const options = {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
  }

  // Fallback for Safari
  if (!window.MediaRecorder?.isTypeSupported?.(options.mimeType)) {
    options.mimeType = 'audio/mp4'
  }

  mediaRecorder = new (window.MediaRecorder ||
    function () {
      return {}
    })(audioStream, options)

  const audioChunks = []

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      audioChunks.push(event.data)
    }
  }

  mediaRecorder.onstop = async () => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: options.mimeType })
      logger.info(`Recorded audio blob: ${audioBlob.size} bytes`)
      // Could send to main process for STT processing if needed
    }
  }
}

// AI Processing
async function processTranscript(text) {
  if (!text.trim()) {
    return
  }

  try {
    isStreaming.value = true
    const aiClient = getBestAIClient()

    // Initialize AI if needed
    const apiKey = store.settings?.geminiApiKey
    if (apiKey && (!aiClient.isReady || !aiClient.isReady.value)) {
      await initializeAI(apiKey)
    }

    // Use modern streaming if available
    if (aiClient.streamText) {
      const stream = await aiClient.streamText(text, {
        systemPrompt: props.systemPrompt,
        temperature: 0.7,
        maxTokens: 512,
      })

      // Process stream chunks
      for await (const chunk of stream.textStream) {
        aiResponse.value += chunk
        typeWriterEffect(_chunk)
      }

      isStreaming.value = false
      emit('response', aiResponse.value)
      logger.info('AI streaming response completed')

      // Cleanup stream
      if (stream.cleanup) {
        stream.cleanup()
      }
    } else {
      // Fallback to non-streaming
      const result = await aiClient.generateText(text, props.systemPrompt, {
        temperature: 0.7,
        maxTokens: 512,
      })

      aiResponse.value = result.text || result
      typeWriterEffect(aiResponse.value)
      isStreaming.value = false
      emit('response', aiResponse.value)
      logger.info('AI response completed')
    }

    // Store controller for potential cancellation
    // controller.cancel() if needed
  } catch (_err) {
    isStreaming.value = false
    logger.error('Failed to process transcript:', err)
    setError(`Failed to process speech: ${err.message}`)
  }
}

// Typewriter effect for AI response
function typeWriterEffect(newText) {
  // Simple immediate display for now, could add typing animation
  displayedResponse.value = aiResponse.value
}

// Helpers
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result
      const base64 = String(dataUrl).split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Text-to-speech
async function speakResponse() {
  if (!aiResponse.value || isSpeaking.value) {
    return
  }
  try {
    isSpeaking.value = true
    await speakViaService(aiResponse.value, {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8,
    })
    isSpeaking.value = false
  } catch (_err) {
    isSpeaking.value = false
    logger.error('Failed to start speech synthesis:', err)
    setError(`Failed to speak response: ${err.message}`)
  }
}

// Keyboard event handlers
function handleSpaceKey(event) {
  if (!event.repeat) {
    startRecording()
  }
}

function handleSpaceKeyUp() {
  stopRecording()
}

// Utility functions
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function setError(message) {
  error.value = message
  hasError.value = true
  emit('error', message)
}

function clearError() {
  error.value = ''
  hasError.value = false
}

function cleanup() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }

  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop())
  }

  if (audioContext) {
    audioContext.close()
  }

  if (speechRecognition) {
    speechRecognition.stop()
  }

  try {
    window.speechSynthesis?.cancel?.()
  } catch {}
}

function setSelectedMic(id) {
  selectedMicId.value = id || ''
  try {
    audioService.setPreferredInputDevice(id || undefined)
  } catch {}
}

// Expose methods for parent components
defineExpose({
  startRecording,
  stopRecording,
  speakResponse,
  isRecording: readonly(isRecording),
  isSpeaking: readonly(isSpeaking),
  transcript: readonly(transcript),
  aiResponse: readonly(aiResponse),
  setSelectedMic,
  selectedMicId,
  microphoneDevices,
})
</script>

<style scoped>
.push-to-talk-container {
  position: relative;
}

.push-to-talk-btn {
  position: relative;
  min-width: 150px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.push-to-talk-btn:not(.disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.push-to-talk-btn:not(.disabled):active {
  transform: translateY(0);
}

.push-to-talk-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recording-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: color-mix(in srgb, var(--color-danger) 30%, transparent);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.voice-meter-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-meter {
  flex: 1;
  height: 6px;
  background: var(--glass-surface);
  border-radius: 3px;
  overflow: hidden;
}

.voice-level-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-success) 0%,
    var(--color-warning) 70%,
    var(--color-danger) 100%
  );
  transition: width 0.1s ease;
  border-radius: 3px;
}

.recording-time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--color-danger);
}

.max-time {
  font-size: 0.875em;
}

.transcript-display {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
}

.final-transcript {
  color: var(--text-primary);
  font-weight: 500;
}

.interim-transcript {
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 4px;
}

.cursor-blink {
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

.ai-response {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
}

.response-header {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--glass-elevated);
  border-bottom: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  font-weight: 600;
  font-size: 0.875em;
}

.response-content {
  background: var(--glass-surface);
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  margin: 0;
}

.streaming-text.typing::after {
  content: '|';
  animation: blink 1s infinite;
  margin-left: 2px;
}

.error-display {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: color-mix(in srgb, var(--color-danger) 15%, transparent);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--border-radius-sm);
  font-size: 0.875em;
}

.ptt-device-select {
  max-width: 360px;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .push-to-talk-btn {
    min-width: 120px;
  }

  .btn-text {
    display: none;
  }
}

/* Focus styles for accessibility */
.push-to-talk-btn:focus {
  outline: var(--focus-ring-size) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
</style>
