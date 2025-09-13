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
              {{ micTestActive ? "Stop Test" : "Test Mic" }}
            </UnifiedButton>
            <div v-if="micTestActive" class="volume-meter">
              <div class="volume-bar">
                <div
                  class="volume-fill"
                  :style="{ width: `${Math.min(micTestLevel * 100, 100)}%` }"
                ></div>
              </div>
              <span class="volume-label">{{ Math.round(micTestLevel * 100) }}%</span>
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
              isListening ? "Listening..." : "Ready to listen"
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
              message.role === "user" ? "You" : persona.name
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
              <label>Conversation Memory:
                {{ chatConfig.conversationMemory }} messages</label>
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
        <div class="error-message">{{ error }}</div>
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
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { ref, onMounted, reactive, watch, nextTick, computed } from "vue";
import {
  useRealTimeChat,
  useRealTimeSupport,
} from "@/composables/useRealTimeChat";
import {
  audioService,
  setPreferredInputDevice,
  setPreferredOutputDevice,
} from "@/shared/services/AudioService";
import { videoService } from "@/shared/services/VideoService";
import { resolveGeminiApiKey } from "@/shared/utils/apiKeys";
import type {
  MultiTurnSession,
  RealTimeMessage,
  RealTimeConfig,
} from "@/shared/services/RealTimeMultiTurnService";

type SessionType = MultiTurnSession["type"];
interface Props {
  apiKey?: string;
  initialSessionType?: SessionType;
  persona?: string;
  // Optional config from parent. If provided, merge into local config on mount/changes
  config?: Partial<RealTimeConfig> | null;
}

const props = withDefaults(defineProps<Props>(), {
  apiKey: "",
  initialSessionType: "audio",
  persona: "navi",
  config: null,
});

const emit = defineEmits<{
  "session-start": [];
  "session-end": [];
  message: [message: RealTimeMessage];
  error: [error: unknown];
}>();

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
} = useRealTimeChat();

useRealTimeSupport(); // ensure feature detection runs (values available if needed later)

const selectedSessionType = ref<SessionType>(props.initialSessionType);
const textInput = ref<string>("");
const showConfig = ref<boolean>(false);
const messagesContainer = ref<{
  scrollTop: number;
  scrollHeight: number;
} | null>(null);
const localVideoEl = ref<HTMLVideoElement | null>(null);
const screenVideoEl = ref<HTMLVideoElement | null>(null);
const messageInput = ref<HTMLElement | null>(null);
const controlsCollapsed = ref(false);
const showImageModalState = ref(false);
const currentModalImage = ref("");

// Devices
const micDevices = ref<{ deviceId: string; label: string }[]>([]);
const speakerDevices = ref<{ deviceId: string; label: string }[]>([]);
const cameraDevices = ref<{ deviceId: string; label: string }[]>([]);
const selectedMicId = ref<string>("");
const selectedSpkId = ref<string>("");
const selectedCamId = ref<string>("");
// Mic test (out-of-session)
const micTestActive = ref<boolean>(false);
const micTestLevel = ref<number>(0);

// Quick actions for input
const quickActions = [
  { id: "help", label: "Help me with...", text: "Can you help me with " },
  { id: "explain", label: "Explain this", text: "Please explain " },
  { id: "summarize", label: "Summarize", text: "Can you summarize " },
  { id: "analyze", label: "Analyze", text: "Please analyze " },
];

const chatConfig = reactive<RealTimeConfig>({
  model: "gemini-2.5-flash",
  enableAudioInput: true,
  enableAudioOutput: true,
  pushToTalk: false,
  voiceActivation: { enabled: true, threshold: 0.1, silenceTimeout: 1500 },
  conversationMemory: 10,
});

// AI Personas
const personas = {
  navi: {
    name: "NAVI",
    description: "Gaming Career Expert",
    systemPrompt:
      "You are NAVI, an AI assistant specializing in gaming career transitions. You provide expert guidance on breaking into the video game industry, portfolio building, and career development with a friendly but professional tone.",
  },
  coach: {
    name: "Career Coach",
    description: "Professional Guide",
    systemPrompt:
      "You are a professional career coach with extensive experience across multiple industries. You provide structured, actionable advice with a supportive and encouraging approach.",
  },
  mentor: {
    name: "Tech Mentor",
    description: "Industry Insider",
    systemPrompt:
      "You are a senior tech industry mentor with deep knowledge of software development, emerging technologies, and industry trends. You share insights with wisdom and practical experience.",
  },
  friend: {
    name: "Casual Friend",
    description: "Relaxed Chat",
    systemPrompt:
      "You are a casual, friendly companion for relaxed conversations. You communicate in a warm, approachable way while still being helpful and knowledgeable.",
  },
};

const persona = computed(
  () => personas[props.persona as keyof typeof personas] || personas.navi,
);

const voiceActivationEnabled = computed<boolean>({
  get() {
    return Boolean(chatConfig.voiceActivation?.enabled);
  },
  set(v: boolean) {
    if (!chatConfig.voiceActivation) {
      chatConfig.voiceActivation = {
        enabled: v,
        threshold: 0.1,
        silenceTimeout: 1500,
      };
    } else {
      chatConfig.voiceActivation.enabled = v;
    }
  },
});

// Enhanced status methods
const getStatusClass = () => {
  if (isProcessing.value) return "status-processing";
  if (isSessionActive.value) return "status-active";
  if (canStartSession.value) return "status-ready";
  return "status-initializing";
};

const getStatusText = () => {
  if (isProcessing.value) return "Processing...";
  if (isSessionActive.value) return "Live Session";
  if (canStartSession.value) return "Ready to Start";
  return "Initializing...";
};

// Merge parent-provided config if present
function applyParentConfig() {
  if (props.config && typeof props.config === "object") {
    Object.assign(chatConfig, props.config);
  }
}

// Enhanced input handling
function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSendText();
  }
}

function autoResizeTextarea() {
  if (messageInput.value) {
    messageInput.value.style.height = "auto";
    messageInput.value.style.height = messageInput.value.scrollHeight + "px";
  }
}

function insertQuickAction(text: string) {
  textInput.value = text;
  if (messageInput.value) {
    messageInput.value.focus();
  }
}


function showImageModal(imageData: string) {
  currentModalImage.value = imageData;
  showImageModalState.value = true;
}

function closeImageModal() {
  showImageModalState.value = false;
  currentModalImage.value = "";
}

async function initializeService() {
  try {
    // Avoid re-initialization
    if (isInitialized.value) return;
    // Merge any parent-provided config before init
    applyParentConfig();
    // Prefer prop apiKey; otherwise resolve from unified sources
    let key = props.apiKey;
    if (!key) {
      key = (await resolveGeminiApiKey()) || "";
    }
    if (!key) {
      throw new Error("API key is required");
    }
    await initialize(key, chatConfig);
  } catch (e) {
    emit("error", e);
  }
}

async function enumerateDevices() {
  try {
    const audio = await audioService.getAvailableDevices();
    micDevices.value = audio.filter((d) => d.kind === "audioinput");
    speakerDevices.value = audio.filter((d) => d.kind === "audiooutput");
    const cams = await videoService.enumerateDevices();
    cameraDevices.value = cams;
    // Set defaults if not chosen
    if (!selectedMicId.value && micDevices.value[0])
      selectedMicId.value = micDevices.value[0].deviceId;
    if (!selectedSpkId.value && speakerDevices.value[0])
      selectedSpkId.value = speakerDevices.value[0].deviceId;
    if (!selectedCamId.value && cameraDevices.value[0])
      selectedCamId.value = cameraDevices.value[0].deviceId;
  } catch {
  }
}

  try {
    setPreferredInputDevice(selectedMicId.value);
  } catch {}
  // If a session is active, restart input monitoring for the new device
  try {
    if (isSessionActive.value) {
      audioService.stopMonitoring();
      const id = selectedMicId.value || undefined;
      audioService.startMonitoring(id as any, (lvl) => {
        volumeLevel.value = lvl;
      });
    }
    // If mic test active, restart monitoring for the new device
    if (micTestActive.value) {
      audioService.stopMonitoring();
        micTestLevel.value = lvl;
      });
    }
  } catch {
  }
}

  try {
    await setPreferredOutputDevice(selectedSpkId.value);
  } catch {}
}

  try {
    videoService.setSelectedCamera(selectedCamId.value);
  } catch {}
}

  try {
    // Stop mic test monitoring if active
    if (micTestActive.value) {
      try {
        audioService.stopMonitoring();
      } catch {}
      micTestActive.value = false;
    }
    await startSession(selectedSessionType.value);
    emit("session-start");
  } catch (e) {
    emit("error", e);
  }
}

  try {
    await stopSession();
    emit("session-end");
  } catch (e) {
    emit("error", e);
  }
}

  if (!textInput.value.trim()) return;
  try {
    await sendMessage(textInput.value);
    textInput.value = "";
  } catch (e) {
    emit("error", e);
  }
}

  updateServiceConfig(chatConfig);
}

  try {
    if (micTestActive.value) {
      audioService.stopMonitoring();
      micTestActive.value = false;
      return;
    }
    const id = selectedMicId.value || undefined;
    await audioService.startMonitoring(id as any, (lvl) => {
      micTestLevel.value = lvl;
    });
    micTestActive.value = true;
  } catch {
  }
}

  const map: Record<RealTimeMessage["type"], string> = {
    text: "mdi-text",
    audio: "mdi-microphone",
    video: "mdi-video",
    screen: "mdi-monitor-share",
  };
  return map[type] ?? "mdi-help";
}

  return new Date(ts).toLocaleTimeString();
}

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

  if (val == null) return "";
  if (typeof val === "string") {
    // Enhanced formatting with markdown-like support
    return val
      .replace(/\n/g, "<br>");
  }
  if (typeof val === "object") {
    const anyVal = val as any;
    if (typeof anyVal.content === "string")
      return formatContent(anyVal.content);
    if (typeof anyVal.text === "string") return formatContent(anyVal.text);
    try {
    } catch {
      return String(val);
    }
  }
  return String(val);
}

watch(messages, scrollToBottom, { deep: true });
watch(
  () => props.apiKey,
  async () => {
    // If apiKey prop changes and service not yet initialized, try init
    if (!isInitialized.value) {
      await initializeService();
    }
  },
);

watch(
  () => props.config,
  () => {
    // Re-apply config and propagate to service when parent config changes
    applyParentConfig();
    updateServiceConfig(chatConfig);
  },
);

onMounted(() => {
  initializeService();
});

// Attach streams to previews when session active
watch([isSessionActive, selectedSessionType], () => {
  try {
    if (!isSessionActive.value) return;
    const v = videoService.getVideoStream();
    const s = videoService.getScreenStream();
    if (localVideoEl.value && v) {
      (localVideoEl.value as any).srcObject = v;
    }
    if (screenVideoEl.value && s) {
      (screenVideoEl.value as any).srcObject = s;
    }
  } catch {
  }
});

// Enumerate devices initially
onMounted(() => {
  enumerateDevices();
});
</script>

<style scoped>
.enhanced-realtime-chat {
  display: flex;
  flex-direction: column;
  background: linear-gradient(
  );
  overflow: hidden;
  position: relative;
}

.real-time-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
}

.device-selectors {
  display: flex;
  align-items: center;
}
.device-select {
  background: var(--glass-bg);
  color: var(--text-color);
}

.real-time-header::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

.session-info {
  display: flex;
  align-items: center;
}

.session-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  background: var(--muted-color);
}

.status-dot.status-ready {
  background: var(--success-color);
}

.status-dot.status-active {
  background: var(--primary-color);
}

.status-dot.status-processing {
  background: var(--warning-color);
}

@keyframes pulse {
  }
  }
}

.session-stats {
  display: flex;
  color: var(--muted-color);
}

.session-controls {
  display: flex;
  align-items: center;
}

.session-type-select {
  background: var(--glass-bg);
  color: var(--text-color);
}

.volume-indicator {
  display: flex;
  align-items: center;
  background: var(--surface-color);
}

.volume-bar {
  background: var(--muted-color);
  overflow: hidden;
}

.volume-level {
  background: var(--primary-color);
}

.volume-label {
  color: var(--muted-color);
}

.transcription-container {
  background: var(--info-bg);
}

.transcription-text {
  display: flex;
  align-items: center;
  font-style: italic;
  color: var(--info-color);
}

.messages-container {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
}

.message-item {
  display: flex;
  flex-direction: column;
}

.message-user {
  align-self: flex-end;
  background: var(--primary-bg);
}

.message-assistant {
  align-self: flex-start;
  background: var(--glass-bg);
}

.message-assistant.processing {
}

.message-header {
  display: flex;
  align-items: center;
  color: var(--muted-color);
}

.message-role {
}

.message-type {
  display: flex;
  align-items: center;
}

.message-content {
  color: var(--text-color);
}

.frame-thumbnail {
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  background: var(--muted-color);
}

}

}

@keyframes typing {
  }
  }
}

.text-input-container {
  background: linear-gradient(
    to top,
    var(--glass-bg)
  );
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
}

.media-previews {
  display: grid;
  background: var(--surface-color);
}
.preview-tile {
  background: var(--glass-bg);
  overflow: hidden;
}
.preview-title {
  color: var(--text-color);
  display: flex;
  align-items: center;
}
.preview-video {
  object-fit: cover;
}

.input-group {
  display: flex;
}

.input-group input {
}

.config-panel {
  background: var(--surface-color);
}

.config-toggle {
  background: transparent;
  border: none;
  color: var(--text-color);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.config-toggle:hover {
  background: var(--hover-color);
}

.config-content {
}

.form-group {
}

.form-group:last-child {
}

.form-group label {
  display: block;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-control,
.form-check-input {
  background: var(--glass-bg);
  color: var(--text-color);
}

.alert {
  display: flex;
  align-items: center;
}

.alert-danger {
  background: var(--danger-bg);
  color: var(--danger-color);
}

.btn-close {
  background: none;
  border: none;
  color: inherit;
  margin-left: auto;
  cursor: pointer;
}

.session-active {
}

.session-active .real-time-header {
}


.control-panel {
}

.control-panel.collapsed .controls-content {
  overflow: hidden;
}

.controls-toggle {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  justify-content: center;
}

.controls-toggle:hover {
}

.controls-content {
}

.status-section {
}

.status-initializing {
  background: var(--warning-color);
}

.status-ready {
  background: var(--success-color);
}

.status-active {
}

.status-processing {
}

@keyframes statusPulse {
  }
  }
}

.status-info {
}

.status-text {
  color: var(--text-primary);
}

.session-duration {
  color: var(--text-secondary);
}

.device-section {
}

  color: var(--text-primary);
}

.device-grid {
  display: grid;
}

.device-group {
  display: flex;
  flex-direction: column;
}

.device-group label {
  color: var(--text-secondary);
}

.modern-select {
  color: var(--text-primary);
}

.modern-select:focus {
  outline: none;
}

.modern-select.large {
}

.enhanced-messages-container {
  overflow-y: auto;
  background: linear-gradient(
    to bottom,
  );
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

.enhanced-messages-container::-webkit-scrollbar {
}

.enhanced-messages-container::-webkit-scrollbar-track {
}

.enhanced-messages-container::-webkit-scrollbar-thumb {
}

.enhanced-message {
  display: flex;
  animation-fill-mode: forwards;
}

@keyframes messageSlideIn {
  from {
  }
  to {
  }
}

.message-user {
  flex-direction: row-reverse;
}

.message-user .message-body {
  background: linear-gradient(
  );
}

.message-assistant .message-body {
}

.message-assistant.processing .message-body {
}

.message-avatar {
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar.user {
  background: linear-gradient(
  );
  color: white;
}

.avatar.assistant {
  background: linear-gradient(
  );
  color: white;
}

.message-body {
  position: relative;
}

.message-sender {
  color: var(--text-primary);
}

.message-meta {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
}

.message-type {
  display: flex;
  align-items: center;
}

.enhanced-typing-indicator {
  display: flex;
  align-items: center;
}

.typing-dots {
  display: flex;
  align-items: center;
}

.typing-dots span {
}

}

}

@keyframes typingBounce {
  }
  }
}

.typing-text {
  color: var(--text-secondary);
  font-style: italic;
}

.enhanced-input-area {
  background: linear-gradient(
    to top,
  );
}

.input-container {
}

.input-wrapper {
  display: flex;
  align-items: end;
}

.input-wrapper:focus-within {
}

.message-input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  resize: none;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  align-items: center;
}

.input-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.input-action-btn:hover:not(:disabled) {
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
}

.quick-action {
  color: var(--text-secondary);
  cursor: pointer;
}

.quick-action:hover {
}

.transcription-banner {
  position: relative;
  background: linear-gradient(
  );
}

@keyframes transcriptionSlide {
  from {
  }
  to {
  }
}

.transcription-content {
  display: flex;
  align-items: center;
}

.transcription-icon {
}

.transcription-icon.pulsing {
}

@keyframes iconPulse {
  }
  }
}

.transcription-text {
  font-style: italic;
  color: var(--text-primary);
}

.transcription-indicator {
  background: var(--danger-color);
  color: white;
  text-transform: uppercase;
}

@keyframes liveBlink {
  }
  }
}

.media-section {
}

.media-previews {
  display: grid;
}

.preview-card {
  overflow: hidden;
}

.preview-card:hover {
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-header span {
  color: var(--text-primary);
}

.preview-controls {
  display: flex;
}

.preview-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.preview-btn:hover {
}

.preview-video {
  object-fit: cover;
}

.audio-section {
}

.audio-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.volume-display {
  display: flex;
  align-items: center;
}

.mic-icon {
  color: var(--text-secondary);
}

.mic-icon.active {
}

.volume-bars {
  display: flex;
  align-items: end;
}

.volume-bar {
}

.volume-bar.active {
}

@keyframes volumePulse {
  }
  }
  }
}

.listening-status {
  color: var(--text-secondary);
}

.listening-status.active {
}

.enhanced-error-display {
  position: absolute;
}

@keyframes errorSlideUp {
  from {
  }
  to {
  }
}

.error-content {
  display: flex;
  align-items: center;
  background: var(--danger-color);
  color: white;
}

.error-icon {
}

.error-message {
}

.error-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.error-close:hover {
}

.message-actions {
  display: flex;
}

.message-body:hover .message-actions {
}

.action-btn {
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
}

.action-btn:hover {
}

  .enhanced-realtime-chat {
  }

  .enhanced-messages-container {
  }

  .enhanced-message {
  }

  .message-body {
  }

  .avatar {
  }

  .enhanced-input-area {
  }

  .input-wrapper {
  }
}

  .enhanced-message {
  }

  .message-body {
  }

  .avatar {
  }
}

.enhanced-realtime-chat.session-active {
}

.image-modal {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-filter);
  overflow: hidden;
}

.modal-content img {
  object-fit: contain;
}

.modal-close {
  position: absolute;
  border: none;
  color: white;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.modal-close:hover {
}

.modal-close:active {
}
</style>
