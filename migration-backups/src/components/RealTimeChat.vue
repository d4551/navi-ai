<template>
  <div
    class="enhanced-realtime-chat"
    :class="{ 'session-active': isSessionActive }"
  >
    <!-- Enhanced Control Panel -->
    <div class="control-panel" :class="{ collapsed: controlsCollapsed }">
      <button
        class="controls-toggle"
        @click="controlsCollapsed = !controlsCollapsed"
      >
        <AppIcon
          :name="controlsCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
        />
        <span v-if="!controlsCollapsed">Hide Controls</span>
        <span v-else>Show Controls</span>
      </button>

      <div class="controls-content">
        <!-- Status Display -->
        <div class="status-section">
          <div class="session-indicator">
            <div class="status-dot" :class="getStatusClass()"></div>
            <div class="status-info">
              <div class="status-text">{{ getStatusText() }}</div>
              <div v-if="isSessionActive" class="session-duration">
                {{ sessionDurationFormatted }}
              </div>
            </div>
          </div>
        </div>
        <!-- Device Configuration -->
        <div v-if="!isSessionActive" class="device-section">
          <h4>Device Setup</h4>
          <div class="device-grid">
            <div class="device-group">
              <label>Microphone</label>
              <select
                v-model="selectedMicId"
                class="modern-select"
                @change="applyAudioInput"
              >
                <option
                  v-for="d in micDevices"
                  :key="d.deviceId"
                  :value="d.deviceId"
                >
                  {{ d.label }}
                </option>
              </select>
            </div>
            <div class="device-group">
              <label>Speaker</label>
              <select
                v-model="selectedSpkId"
                class="modern-select"
                @change="applyAudioOutput"
              >
                <option
                  v-for="d in speakerDevices"
                  :key="d.deviceId"
                  :value="d.deviceId"
                >
                  {{ d.label }}
                </option>
              </select>
            </div>
            <div
              v-if="
                selectedSessionType === 'video' ||
                selectedSessionType === 'multimodal'
              "
              class="device-group"
            >
              <label>Camera</label>
              <select
                v-model="selectedCamId"
                class="modern-select"
                @change="applyCamera"
              >
                <option
                  v-for="d in cameraDevices"
                  :key="d.deviceId"
                  :value="d.deviceId"
                >
                  {{ d.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Mic Test -->
          <div class="mic-test-section">
            <UnifiedButton
              variant="ghost"
              size="sm"
              :leading-icon="
                micTestActive ? 'mdi-microphone-off' : 'mdi-microphone'
              "
              @click="toggleMicTest"
            >
              {{ micTestActive ? 'Stop Test' : 'Test Mic' }}
            </UnifiedButton>
            <div v-if="micTestActive" class="volume-meter">
              <div class="volume-bar">
                <div
                  class="volume-fill"
                  :style="{ width: `${Math.min(micTestLevel * 100, 100)}%` }"
                ></div>
              </div>
              <span class="volume-label"
                >{{ Math.round(micTestLevel * 100) }}%</span
              >
            </div>
          </div>
        </div>

        <!-- Session Type Selection -->
        <div class="session-type-section">
          <h4>Session Mode</h4>
          <select
            v-model="selectedSessionType"
            :disabled="isSessionActive"
            class="modern-select large"
            @change="updateConfig"
          >
            <option value="audio">🎤 Audio Only</option>
            <option value="video">📹 Video + Audio</option>
            <option value="screen">🖥️ Screen Share</option>
            <option value="multimodal">🧠 Multimodal</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <UnifiedButton
            v-if="!isSessionActive"
            variant="primary"
            size="lg"
            leading-icon="mdi-play-circle"
            :disabled="!canStartSession || isProcessing"
            :loading="isProcessing"
            @click="handleStartSession"
          >
            Start
            {{
              selectedSessionType.charAt(0).toUpperCase() +
              selectedSessionType.slice(1)
            }}
          </UnifiedButton>
          <UnifiedButton
            v-else
            variant="danger"
            size="lg"
            leading-icon="mdi-stop-circle"
            :disabled="isProcessing"
            :loading="isProcessing"
            @click="handleStopSession"
          >
            End Session
          </UnifiedButton>
        </div>
      </div>
    </div>
    <!-- Enhanced Media Previews -->
    <div v-if="isSessionActive" class="media-section">
      <div class="media-previews">
        <div
          v-if="
            selectedSessionType === 'video' ||
            selectedSessionType === 'multimodal'
          "
          class="preview-card"
        >
          <div class="preview-header">
            <AppIcon name="mdi-video" />
            <span>Camera Feed</span>
            <div class="preview-controls">
              <button class="preview-btn" title="Toggle camera">
                <AppIcon name="mdi-video" />
              </button>
            </div>
          </div>
          <video
            ref="localVideoEl"
            class="preview-video"
            autoplay
            muted
            playsinline
          ></video>
        </div>

        <div
          v-if="
            selectedSessionType === 'screen' ||
            selectedSessionType === 'multimodal'
          "
          class="preview-card"
        >
          <div class="preview-header">
            <AppIcon name="mdi-monitor-share" />
            <span>Screen Share</span>
            <div class="preview-controls">
              <button class="preview-btn" title="Stop sharing">
                <AppIcon name="mdi-stop" />
              </button>
            </div>
          </div>
          <video
            ref="screenVideoEl"
            class="preview-video"
            autoplay
            muted
            playsinline
          ></video>
        </div>
      </div>

      <!-- Audio Visualizer -->
      <div
        v-if="
          selectedSessionType === 'audio' ||
          selectedSessionType === 'video' ||
          selectedSessionType === 'multimodal'
        "
        class="audio-section"
      >
        <div class="audio-visualizer">
          <div class="volume-display">
            <AppIcon
              name="mdi-microphone"
              class="mic-icon"
              :class="{ active: isListening }"
            />
            <div class="volume-bars">
              <div
                v-for="i in 20"
                :key="i"
                class="volume-bar"
                :class="{ active: i <= volumeLevel * 20 }"
                :style="{ animationDelay: `${i * 0.1}s` }"
              ></div>
            </div>
          </div>
          <div class="listening-status">
            <span :class="{ active: isListening }">{{
              isListening ? 'Listening...' : 'Ready to listen'
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Transcription -->
    <div v-if="transcription && isSessionActive" class="transcription-banner">
      <div class="transcription-content">
        <AppIcon name="mdi-microphone" class="transcription-icon pulsing" />
        <div class="transcription-text">{{ transcription }}</div>
        <div class="transcription-indicator">Live</div>
      </div>
    </div>
    <!-- Enhanced Messages Area -->
    <div ref="messagesContainer" class="enhanced-messages-container">
      <div
        v-for="(message, index) in messages"
        :key="message.id"
        class="enhanced-message"
        :class="`message-${message.role}`"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="message-avatar">
          <div class="avatar" :class="message.role">
            <AppIcon
              :name="message.role === 'user' ? 'mdi-account' : 'mdi-robot'"
            />
          </div>
        </div>

        <div class="message-body">
          <div class="message-header">
            <span class="message-sender">{{
              message.role === 'user' ? 'You' : persona.name
            }}</span>
            <div class="message-meta">
              <span class="message-type">
                <AppIcon
                  :name="getMessageTypeIcon(message.type)"
                  size="small"
                />
                {{ message.type }}
              </span>
              <span class="message-time">{{
                formatTime(message.timestamp)
              }}</span>
            </div>
          </div>

          <div class="message-content">
            <div v-if="message.imageData" class="message-media">
              <img
                :src="`data:image/jpeg;base64,${message.imageData}`"
                alt="Media content"
                class="media-thumbnail"
                @click="showImageModal(message.imageData)"
              />
              <div class="media-overlay">
                <AppIcon name="mdi-magnify" />
              </div>
            </div>
            <div
              class="message-text"
              v-html="formatContent(message.content)"
            ></div>
          </div>

          <!-- Message Actions -->
          <div class="message-actions">
            <button class="action-btn" title="Copy message">
              <AppIcon name="mdi-content-copy" size="small" />
            </button>
            <button
              v-if="message.role === 'assistant'"
              class="action-btn"
              title="Regenerate response"
            >
              <AppIcon name="mdi-refresh" size="small" />
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="isProcessing"
        class="enhanced-message message-assistant processing"
      >
        <div class="message-avatar">
          <div class="avatar assistant">
            <AppIcon name="mdi-robot" />
          </div>
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-sender">{{ persona.name }}</span>
            <div class="message-meta">
              <span class="message-type">
                <AppIcon name="mdi-brain" size="small" />
                thinking
              </span>
            </div>
          </div>
          <div class="message-content">
            <div class="enhanced-typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="typing-text">{{ persona.name }} is thinking...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Enhanced Input Area -->
    <div v-if="isSessionActive" class="enhanced-input-area">
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            ref="messageInput"
            v-model="textInput"
            class="message-input"
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            :disabled="isProcessing"
            rows="1"
            @keydown="handleKeydown"
            @input="autoResizeTextarea"
          ></textarea>

          <div class="input-actions">
            <button
              class="input-action-btn"
              title="Attach file"
              :disabled="isProcessing"
            >
              <AppIcon name="mdi-attachment" />
            </button>
            <button
              class="input-action-btn"
              title="Voice message"
              :disabled="isProcessing"
            >
              <AppIcon name="mdi-microphone" />
            </button>
            <UnifiedButton
              variant="primary"
              size="md"
              icon-only
              :icon="isProcessing ? 'mdi-loading' : 'mdi-send'"
              :disabled="!textInput.trim() || isProcessing"
              :loading="isProcessing"
              class="send-btn"
              @click="handleSendText"
            />
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="quick-action"
            @click="insertQuickAction(action.text)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
    <!-- Advanced Settings Panel -->
    <div class="settings-panel" :class="{ expanded: showConfig }">
      <button class="settings-toggle" @click="showConfig = !showConfig">
        <AppIcon name="mdi-tune" />
        <span>Advanced Settings</span>
        <AppIcon
          :name="showConfig ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="chevron"
        />
      </button>

      <div class="settings-content">
        <div class="settings-grid">
          <!-- AI Model Selection -->
          <div class="setting-group">
            <h4>AI Model</h4>
            <select
              v-model="chatConfig.model"
              class="modern-select"
              @change="updateConfig"
            >
              <option value="gemini-2.5-flash">
                Gemini 2.5 Flash (Recommended)
              </option>
              <option value="gemini-2.0-flash-exp">
                Gemini 2.0 Flash (Experimental)
              </option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>

          <!-- Voice Settings -->
          <div class="setting-group">
            <h4>Voice Controls</h4>
            <div class="setting-item">
              <label class="setting-label">
                <input
                  v-model="voiceActivationEnabled"
                  type="checkbox"
                  class="setting-checkbox"
                  @change="updateConfig"
                />
                <span class="checkmark"></span>
                Voice Activation
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input
                  v-model="chatConfig.pushToTalk"
                  type="checkbox"
                  class="setting-checkbox"
                  @change="updateConfig"
                />
                <span class="checkmark"></span>
                Push to Talk (Space)
              </label>
            </div>
          </div>

          <!-- Memory Settings -->
          <div class="setting-group">
            <h4>Memory</h4>
            <div class="setting-item">
              <label
                >Conversation Memory:
                {{ chatConfig.conversationMemory }} messages</label
              >
              <input
                v-model.number="chatConfig.conversationMemory"
                type="range"
                min="5"
                max="50"
                class="setting-range"
                @input="updateConfig"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Error Display -->
    <div v-if="error" class="enhanced-error-display">
      <div class="error-content">
        <AppIcon name="mdi-alert-circle" class="error-icon" />
        <div class="error-message">{{ _error }}</div>
        <button class="error-close" @click="error = null">
          <AppIcon name="mdi-close" />
        </button>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModalState"
      class="image-modal"
      @click="closeImageModal"
    >
      <div class="modal-content" @click.stop>
        <img
          :src="`data:image/jpeg;base64,${currentModalImage}`"
          alt="Full size image"
        />
        <button class="modal-close" @click="closeImageModal">
          <AppIcon name="mdi-close" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import { ref, onMounted, reactive, watch, nextTick, computed } from 'vue'
import {
  useRealTimeChat,
  useRealTimeSupport,
} from '@/composables/useRealTimeChat'
import {
  audioService,
  setPreferredInputDevice,
  setPreferredOutputDevice,
} from '@/shared/services/AudioService'
import { videoService } from '@/shared/services/VideoService'
import { resolveGeminiApiKey } from '@/shared/utils/apiKeys'
import type {
  MultiTurnSession,
  RealTimeMessage,
  RealTimeConfig,
} from '@/shared/services/RealTimeMultiTurnService'

type SessionType = MultiTurnSession['type']
interface Props {
  apiKey?: string
  initialSessionType?: SessionType
  persona?: string
  // Optional config from parent. If provided, merge into local config on mount/changes
  config?: Partial<RealTimeConfig> | null
}

const props = withDefaults(defineProps<Props>(), {
  apiKey: '',
  initialSessionType: 'audio',
  persona: 'navi',
  config: null,
})

const emit = defineEmits<{
  'session-start': []
  'session-end': []
  message: [message: RealTimeMessage]
  error: [error: unknown]
}>()

const {
  isInitialized,
  isSessionActive,
  messages,
  isListening,
  isProcessing,
  volumeLevel,
  transcription,
  error,
  sessionStats,
  canStartSession,
  sessionDurationFormatted,
  initialize,
  startSession,
  stopSession,
  sendMessage,
  updateConfig: updateServiceConfig,
} = useRealTimeChat()

useRealTimeSupport() // ensure feature detection runs (values available if needed later)

const selectedSessionType = ref<SessionType>(props.initialSessionType)
const textInput = ref<string>('')
const showConfig = ref<boolean>(false)
const messagesContainer = ref<{
  scrollTop: number
  scrollHeight: number
} | null>(null)
const localVideoEl = ref<HTMLVideoElement | null>(null)
const screenVideoEl = ref<HTMLVideoElement | null>(null)
const messageInput = ref<HTMLElement | null>(null)
const controlsCollapsed = ref(false)
const showImageModalState = ref(false)
const currentModalImage = ref('')

// Devices
const micDevices = ref<{ deviceId: string; label: string }[]>([])
const speakerDevices = ref<{ deviceId: string; label: string }[]>([])
const cameraDevices = ref<{ deviceId: string; label: string }[]>([])
const selectedMicId = ref<string>('')
const selectedSpkId = ref<string>('')
const selectedCamId = ref<string>('')
// Mic test (out-of-session)
const micTestActive = ref<boolean>(false)
const micTestLevel = ref<number>(0)

// Quick actions for input
const quickActions = [
  { id: 'help', label: 'Help me with...', text: 'Can you help me with ' },
  { id: 'explain', label: 'Explain this', text: 'Please explain ' },
  { id: 'summarize', label: 'Summarize', text: 'Can you summarize ' },
  { id: 'analyze', label: 'Analyze', text: 'Please analyze ' },
]

const chatConfig = reactive<RealTimeConfig>({
  model: 'gemini-2.5-flash',
  enableAudioInput: true,
  enableAudioOutput: true,
  pushToTalk: false,
  voiceActivation: { enabled: true, threshold: 0.1, silenceTimeout: 1500 },
  conversationMemory: 10,
})

// AI Personas
const personas = {
  navi: {
    name: 'NAVI',
    description: 'Gaming Career Expert',
    systemPrompt:
      'You are NAVI, an AI assistant specializing in gaming career transitions. You provide expert guidance on breaking into the video game industry, portfolio building, and career development with a friendly but professional tone.',
  },
  coach: {
    name: 'Career Coach',
    description: 'Professional Guide',
    systemPrompt:
      'You are a professional career coach with extensive experience across multiple industries. You provide structured, actionable advice with a supportive and encouraging approach.',
  },
  mentor: {
    name: 'Tech Mentor',
    description: 'Industry Insider',
    systemPrompt:
      'You are a senior tech industry mentor with deep knowledge of software development, emerging technologies, and industry trends. You share insights with wisdom and practical experience.',
  },
  friend: {
    name: 'Casual Friend',
    description: 'Relaxed Chat',
    systemPrompt:
      'You are a casual, friendly companion for relaxed conversations. You communicate in a warm, approachable way while still being helpful and knowledgeable.',
  },
}

const persona = computed(
  () => personas[props.persona as keyof typeof personas] || personas.navi
)

const voiceActivationEnabled = computed<boolean>({
  get() {
    return Boolean(chatConfig.voiceActivation?.enabled)
  },
  set(v: boolean) {
    if (!chatConfig.voiceActivation) {
      chatConfig.voiceActivation = {
        enabled: v,
        threshold: 0.1,
        silenceTimeout: 1500,
      }
    } else {
      chatConfig.voiceActivation.enabled = v
    }
  },
})

// Enhanced status methods
const getStatusClass = () => {
  if (isProcessing.value) return 'status-processing'
  if (isSessionActive.value) return 'status-active'
  if (canStartSession.value) return 'status-ready'
  return 'status-initializing'
}

const getStatusText = () => {
  if (isProcessing.value) return 'Processing...'
  if (isSessionActive.value) return 'Live Session'
  if (canStartSession.value) return 'Ready to Start'
  return 'Initializing...'
}

// Merge parent-provided config if present
function applyParentConfig() {
  if (props.config && typeof props.config === 'object') {
    Object.assign(chatConfig, props.config)
  }
}

// Enhanced input handling
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendText()
  }
}

function autoResizeTextarea() {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

function insertQuickAction(text: string) {
  textInput.value = text
  if (messageInput.value) {
    messageInput.value.focus()
  }
}

// Image modal functions
function showImageModal(imageData: string) {
  currentModalImage.value = imageData
  showImageModalState.value = true
}

function closeImageModal() {
  showImageModalState.value = false
  currentModalImage.value = ''
}

async function initializeService() {
  try {
    // Avoid re-initialization
    if (isInitialized.value) return
    // Merge any parent-provided config before init
    applyParentConfig()
    // Prefer prop apiKey; otherwise resolve from unified sources
    let key = props.apiKey
    if (!key) {
      key = (await resolveGeminiApiKey()) || ''
    }
    if (!key) {
      throw new Error('API key is required')
    }
    await initialize(key, chatConfig)
  } catch (e) {
    emit('error', e)
  }
}

async function enumerateDevices() {
  try {
    const audio = await audioService.getAvailableDevices()
    micDevices.value = audio.filter(d => d.kind === 'audioinput')
    speakerDevices.value = audio.filter(d => d.kind === 'audiooutput')
    const cams = await videoService.enumerateDevices()
    cameraDevices.value = cams
    // Set defaults if not chosen
    if (!selectedMicId.value && micDevices.value[0])
      selectedMicId.value = micDevices.value[0].deviceId
    if (!selectedSpkId.value && speakerDevices.value[0])
      selectedSpkId.value = speakerDevices.value[0].deviceId
    if (!selectedCamId.value && cameraDevices.value[0])
      selectedCamId.value = cameraDevices.value[0].deviceId
  } catch {
    /* ignore */
  }
}

function applyAudioInput() {
  try {
    setPreferredInputDevice(selectedMicId.value)
  } catch {}
  // If a session is active, restart input monitoring for the new device
  try {
    if (isSessionActive.value) {
      audioService.stopMonitoring()
      const id = selectedMicId.value || undefined
      audioService.startMonitoring(id as any, lvl => {
        volumeLevel.value = lvl
      })
    }
    // If mic test active, restart monitoring for the new device
    if (micTestActive.value) {
      audioService.stopMonitoring()
      const id2 = selectedMicId.value || undefined
      audioService.startMonitoring(id2 as any, lvl => {
        micTestLevel.value = lvl
      })
    }
  } catch {
    /* ignore */
  }
}

async function applyAudioOutput() {
  try {
    await setPreferredOutputDevice(selectedSpkId.value)
  } catch {}
}

function applyCamera() {
  try {
    videoService.setSelectedCamera(selectedCamId.value)
  } catch {}
}

async function handleStartSession() {
  try {
    // Stop mic test monitoring if active
    if (micTestActive.value) {
      try {
        audioService.stopMonitoring()
      } catch {}
      micTestActive.value = false
      micTestLevel.value = 0
    }
    await startSession(selectedSessionType.value)
    emit('session-start')
  } catch (e) {
    emit('error', e)
  }
}

async function handleStopSession() {
  try {
    await stopSession()
    emit('session-end')
  } catch (e) {
    emit('error', e)
  }
}

async function handleSendText() {
  if (!textInput.value.trim()) return
  try {
    await sendMessage(textInput.value)
    textInput.value = ''
  } catch (e) {
    emit('error', e)
  }
}

function updateConfig() {
  updateServiceConfig(chatConfig)
}

async function toggleMicTest() {
  try {
    if (micTestActive.value) {
      audioService.stopMonitoring()
      micTestActive.value = false
      micTestLevel.value = 0
      return
    }
    const id = selectedMicId.value || undefined
    await audioService.startMonitoring(id as any, lvl => {
      micTestLevel.value = lvl
    })
    micTestActive.value = true
  } catch {
    /* ignore */
  }
}

function getMessageTypeIcon(type: RealTimeMessage['type']): string {
  const map: Record<RealTimeMessage['type'], string> = {
    text: 'mdi-text',
    audio: 'mdi-microphone',
    video: 'mdi-video',
    screen: 'mdi-monitor-share',
  }
  return map[type] ?? 'mdi-help'
}

function formatTime(ts: Date | string | number) {
  return new Date(ts).toLocaleTimeString()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatContent(val: unknown) {
  if (val == null) return ''
  if (typeof val === 'string') {
    // Enhanced formatting with markdown-like support
    return val
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }
  if (typeof val === 'object') {
    const anyVal = val as any
    if (typeof anyVal.content === 'string') return formatContent(anyVal.content)
    if (typeof anyVal.text === 'string') return formatContent(anyVal.text)
    try {
      return JSON.stringify(val, null, 2)
    } catch {
      return String(val)
    }
  }
  return String(val)
}

watch(messages, scrollToBottom, { deep: true })
watch(
  () => props.apiKey,
  async () => {
    // If apiKey prop changes and service not yet initialized, try init
    if (!isInitialized.value) {
      await initializeService()
    }
  }
)

watch(
  () => props.config,
  () => {
    // Re-apply config and propagate to service when parent config changes
    applyParentConfig()
    updateServiceConfig(chatConfig)
  }
)

onMounted(() => {
  initializeService()
})

// Attach streams to previews when session active
watch([isSessionActive, selectedSessionType], () => {
  try {
    if (!isSessionActive.value) return
    const v = videoService.getVideoStream()
    const s = videoService.getScreenStream()
    if (localVideoEl.value && v) {
      ;(localVideoEl.value as any).srcObject = v
    }
    if (screenVideoEl.value && s) {
      ;(screenVideoEl.value as any).srcObject = s
    }
  } catch {
    /* ignore */
  }
})

// Enumerate devices initially
onMounted(() => {
  enumerateDevices()
})
</script>

<style scoped>
/* Enhanced Real-Time Chat Styles */
.enhanced-realtime-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(var(--glass-bg-rgb), 0.95) 0%,
    rgba(var(--surface-color-rgb), 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(var(--border-color-rgb), 0.3);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  position: relative;
}

.real-time-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3, 1rem) var(--spacing-4, 1.25rem);
  background: var(--glass-surface);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
  top: 0;
  z-index: 2;
}

.device-selectors {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.device-select {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-color);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

/* Subtle top glint line */
.real-time-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-primary-500) 20%, transparent),
    transparent
  );
  opacity: 0.28;
  pointer-events: none;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.session-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--muted-color);
  transition: background-color 0.3s ease;
}

.status-dot.status-ready {
  background: var(--success-color);
}

.status-dot.status-active {
  background: var(--primary-color);
  animation: pulse 2s infinite;
}

.status-dot.status-processing {
  background: var(--warning-color);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.session-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--muted-color);
}

.session-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.session-type-select {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--glass-bg);
  color: var(--text-color);
}

.volume-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
}

.volume-bar {
  flex: 1;
  height: 4px;
  background: var(--muted-color);
  border-radius: 2px;
  overflow: hidden;
}

.volume-level {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.1s ease;
}

.volume-label {
  font-size: 0.875rem;
  color: var(--muted-color);
  min-width: 80px;
}

.transcription-container {
  padding: 0.75rem 1rem;
  background: var(--info-bg);
  border-bottom: 1px solid var(--border-color);
}

.transcription-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-style: italic;
  color: var(--info-color);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-3, 1rem);
  gap: var(--spacing-3, 1rem);
  display: flex;
  flex-direction: column;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg, 12px);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
}

.message-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
}

.message-user {
  align-self: flex-end;
  background: var(--primary-bg);
  border: 1px solid var(--primary-color);
}

.message-assistant {
  align-self: flex-start;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.message-assistant.processing {
  opacity: 0.7;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted-color);
}

.message-role {
  font-weight: 600;
}

.message-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.message-content {
  color: var(--text-color);
}

.frame-thumbnail {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted-color);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.text-input-container {
  padding: var(--spacing-4, 1rem);
  border-top: 1px solid var(--glass-border);
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--glass-bg) 80%, transparent),
    var(--glass-bg)
  );
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
}

.media-previews {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--glass-border);
  background: var(--surface-color);
}
.preview-tile {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  overflow: hidden;
}
.preview-title {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: var(--text-color);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.preview-video {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #000;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group input {
  flex: 1;
}

.config-panel {
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
}

.config-toggle {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.config-toggle:hover {
  background: var(--hover-color);
}

.config-content {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-control,
.form-check-input {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-color);
}

.alert {
  margin: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-danger {
  background: var(--danger-bg);
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
}

.btn-close {
  background: none;
  border: none;
  color: inherit;
  margin-left: auto;
  cursor: pointer;
}

/* Session active state */
.session-active {
  border: 2px solid var(--primary-color);
}

.session-active .real-time-header {
  background: linear-gradient(135deg, var(--primary-bg), var(--glass-bg));
}

/* Modern Enhanced Styles for RealTimeChat */

/* Control Panel */
.control-panel {
  background: rgba(var(--surface-color-rgb), 0.7);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(var(--border-color-rgb), 0.2);
  padding: 1rem;
  transition: all 0.3s ease;
}

.control-panel.collapsed .controls-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0;
}

.controls-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.controls-toggle:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-500);
}

.controls-content {
  max-height: 1000px;
  opacity: 1;
  transition: all 0.3s ease;
  padding-top: 1rem;
}

/* Status Section */
.status-section {
  margin-bottom: 1.5rem;
}

.status-initializing {
  background: var(--warning-color);
  opacity: 0.7;
}

.status-ready {
  background: var(--success-color);
}

.status-active {
  background: var(--color-primary-500);
  animation: statusPulse 2s infinite;
}

.status-processing {
  background: var(--color-secondary-500);
  animation: statusPulse 1s infinite;
}

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.status-info {
  flex: 1;
}

.status-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.session-duration {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Device Configuration */
.device-section {
  margin-bottom: 1.5rem;
}

.device-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.device-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.device-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.modern-select {
  padding: 0.75rem 1rem;
  background: rgba(var(--surface-color-rgb), 0.7);
  border: 1px solid rgba(var(--border-color-rgb), 0.3);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.modern-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.modern-select.large {
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
}

/* Enhanced Messages Container */
.enhanced-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(
    to bottom,
    rgba(var(--surface-color-rgb), 0.1) 0%,
    rgba(var(--surface-color-rgb), 0.05) 100%
  );
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scroll-behavior: smooth;
}

.enhanced-messages-container::-webkit-scrollbar {
  width: 6px;
}

.enhanced-messages-container::-webkit-scrollbar-track {
  background: rgba(var(--muted-color-rgb), 0.1);
  border-radius: 3px;
}

.enhanced-messages-container::-webkit-scrollbar-thumb {
  background: var(--color-primary-300);
  border-radius: 3px;
}

/* Enhanced Messages */
.enhanced-message {
  display: flex;
  gap: 1rem;
  animation: messageSlideIn 0.4s ease;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  flex-direction: row-reverse;
}

.message-user .message-body {
  background: linear-gradient(
    135deg,
    var(--color-primary-100) 0%,
    var(--color-primary-50) 100%
  );
  border: 1px solid var(--color-primary-300);
  border-radius: 18px 4px 18px 18px;
}

.message-assistant .message-body {
  background: rgba(var(--surface-color-rgb), 0.7);
  border: 1px solid rgba(var(--border-color-rgb), 0.3);
  border-radius: 4px 18px 18px 18px;
}

.message-assistant.processing .message-body {
  background: var(--color-secondary-50);
  border-color: var(--color-secondary-200);
}

/* Message Avatar */
.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.avatar.user {
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-400) 100%
  );
  color: white;
}

.avatar.assistant {
  background: linear-gradient(
    135deg,
    var(--color-secondary-500) 0%,
    var(--color-accent-500) 100%
  );
  color: white;
  border-color: var(--color-secondary-300);
}

/* Message Body */
.message-body {
  flex: 1;
  padding: 1rem 1.25rem;
  backdrop-filter: blur(10px);
  max-width: 70%;
  position: relative;
}

.message-sender {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.message-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(var(--muted-color-rgb), 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

/* Enhanced Typing Indicator */
.enhanced-typing-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-secondary-500);
  animation: typingBounce 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.typing-text {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
}

/* Enhanced Input Area */
.enhanced-input-area {
  padding: 1.5rem;
  background: linear-gradient(
    to top,
    rgba(var(--surface-color-rgb), 0.9) 0%,
    rgba(var(--surface-color-rgb), 0.7) 100%
  );
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(var(--border-color-rgb), 0.2);
}

.input-container {
  max-width: 100%;
  margin: 0 auto;
}

.input-wrapper {
  display: flex;
  align-items: end;
  gap: 1rem;
  background: rgba(var(--glass-bg-rgb), 0.8);
  border: 2px solid rgba(var(--border-color-rgb), 0.3);
  border-radius: 20px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.message-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.input-action-btn:hover:not(:disabled) {
  background: var(--color-primary-100);
  color: var(--color-primary-500);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.quick-action {
  background: rgba(var(--surface-color-rgb), 0.7);
  border: 1px solid rgba(var(--border-color-rgb), 0.3);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.quick-action:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
  color: var(--color-primary-500);
  transform: translateY(-1px);
}

/* Live Transcription */
.transcription-banner {
  position: relative;
  background: linear-gradient(
    135deg,
    var(--color-primary-100) 0%,
    var(--color-secondary-50) 100%
  );
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-left: 4px solid var(--color-primary-500);
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
  animation: transcriptionSlide 0.3s ease;
}

@keyframes transcriptionSlide {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.transcription-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.transcription-icon {
  color: var(--color-primary-500);
  font-size: 1.25rem;
}

.transcription-icon.pulsing {
  animation: iconPulse 1.5s infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.transcription-text {
  flex: 1;
  font-style: italic;
  color: var(--text-primary);
}

.transcription-indicator {
  background: var(--danger-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  animation: liveBlink 2s infinite;
}

@keyframes liveBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Media Previews */
.media-section {
  padding: 1rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb), 0.1);
}

.media-previews {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-card {
  background: rgba(var(--surface-color-rgb), 0.5);
  border: 1px solid rgba(var(--border-color-rgb), 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(var(--glass-bg-rgb), 0.7);
  border-bottom: 1px solid rgba(var(--border-color-rgb), 0.2);
}

.preview-header span {
  font-weight: 500;
  color: var(--text-primary);
  margin-left: 0.5rem;
}

.preview-controls {
  display: flex;
  gap: 0.5rem;
}

.preview-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-500);
}

.preview-video {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #000;
}

/* Audio Visualizer */
.audio-section {
  padding: 1rem;
  background: rgba(var(--glass-bg-rgb), 0.3);
  border-radius: 12px;
  border: 1px solid rgba(var(--border-color-rgb), 0.2);
}

.audio-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.volume-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mic-icon {
  font-size: 1.5rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.mic-icon.active {
  color: var(--color-primary-500);
  filter: drop-shadow(0 0 8px var(--color-primary-400));
}

.volume-bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 30px;
}

.volume-bar {
  width: 3px;
  background: rgba(var(--muted-color-rgb), 0.3);
  border-radius: 2px;
  transition: all 0.2s ease;
  height: 8px;
}

.volume-bar.active {
  background: var(--color-primary-500);
  height: 24px;
  animation: volumePulse 0.3s ease;
}

@keyframes volumePulse {
  0% {
    height: 8px;
  }
  50% {
    height: 30px;
  }
  100% {
    height: 24px;
  }
}

.listening-status {
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.listening-status.active {
  color: var(--color-primary-500);
  font-weight: 500;
}

/* Error Display */
.enhanced-error-display {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: errorSlideUp 0.3s ease;
}

@keyframes errorSlideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--danger-color);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(var(--danger-color-rgb), 0.3);
  max-width: 400px;
}

.error-icon {
  font-size: 1.25rem;
}

.error-message {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Message Actions */
.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.message-body:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(var(--muted-color-rgb), 0.1);
  border: none;
  color: var(--text-tertiary);
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-500);
}

/* Responsive Design */
@media (max-width: 768px) {
  .enhanced-realtime-chat {
    border-radius: 12px;
  }

  .enhanced-messages-container {
    padding: 1rem;
  }

  .enhanced-message {
    gap: 0.75rem;
  }

  .message-body {
    max-width: 85%;
    padding: 0.75rem 1rem;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .enhanced-input-area {
    padding: 1rem;
  }

  .input-wrapper {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .enhanced-message {
    gap: 0.5rem;
  }

  .message-body {
    max-width: 90%;
    padding: 0.625rem 0.875rem;
  }

  .avatar {
    width: 28px;
    height: 28px;
    font-size: 0.875rem;
  }
}

/* Session Active State */
.enhanced-realtime-chat.session-active {
  border-color: var(--color-primary-500);
  box-shadow: 0 20px 60px var(--color-primary-100);
}

/* Image Modal Styles */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.modal-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-close {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  padding: var(--spacing-2);
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  transition: all var(--duration-fast) var(--easing-ease-out);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.modal-close:active {
  transform: scale(0.95);
}
</style>
