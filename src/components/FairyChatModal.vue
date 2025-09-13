<template>
  <Teleport to="body">
    <div v-if="open" class="fairy-modal-overlay" @click.self="close">
      <div
        :class="[
          'fairy-bubble',
          sizeClass || 'fairy-lg',
          'enhanced-gaming-card',
          'bubble-elevated',
          { 'compact-ui': isCompact },
        ]"
        role="dialog"
        aria-modal="true"
        aria-label="NAVI Assistant Chat"
      >
        <div
          class="fairy-chat-interface glass-panel glass-panel--compact"
          :class="{ 'compact-ui': isCompact }"
        >
          <!-- Welcome Animation -->
          <transition name="welcome-fade">
            <div v-if="showWelcome" class="welcome-animation">
              <div class="welcome-text">NAVI</div>
              <div class="welcome-sparkles">✨</div>
            </div>
          </transition>
          <!-- Header -->
          <div class="chat-header modern-header" role="heading" aria-level="2">
            <div class="header-shimmer"></div>
            <div class="header-info">
              <div class="header-avatar">
                <AppIcon name="mdi-shimmer" />
                <div class="avatar-glow"></div>
              </div>
              <div class="header-details">
                <h3 class="title-text">NAVI Assistant</h3>
                <div class="header-status">
                  <span
                    class="status-dot animated-dot"
                    aria-hidden="true"
                  ></span>
                  <span class="status-text">{{ statusText }} • AI Powered</span>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <IconButton
                variant="glass"
                size="sm"
                icon="mdi-cog"
                aria-label="Open voice settings"
                title="Voice & TTS Settings"
                class="modern-header-btn"
                @click="showTTSModal = true"
              />
              <IconButton
                variant="ghost"
                size="sm"
                icon="mdi-close"
                aria-label="Close chat"
                title="Close Chat"
                class="modern-header-btn"
                @click="close"
              />
            </div>
          </div>

          <!-- Messages -->
          <div
            ref="logRef"
            class="chat-messages enhanced-messages"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <a
              href="#fairy-chat-input"
              class="visually-hidden-focusable skip-to-input"
            >Skip to message input</a>

            <!-- Animated Message Bubbles -->
            <transition-group
              name="message-slide"
              tag="div"
              class="messages-container"
            >
              <div
                v-for="(msg, index) in normalizedMessages"
                :key="msg.id"
                class="chat-message enhanced-message"
                :class="{
                  'message-ai': msg.type === 'ai',
                  'message-user': msg.type === 'user',
                  'message-system': msg.type === 'system',
                  'message-latest': index === normalizedMessages.length - 1,
                }"
                role="article"
                :aria-label="msgLabel(msg)"
                :style="{ '--message-index': index }"
              >
                <div class="message-container">
                  <div
                    class="message-avatar enhanced-avatar"
                    :class="`avatar-${msg.type}`"
                  >
                    <div class="avatar-glow"></div>
                    <AppIcon
                      :name="
                        msg.type === 'user'
                          ? 'mdi-account'
                          : msg.type === 'ai'
                            ? 'mdi-robot'
                            : 'mdi-information'
                      "
                    />
                    <div v-if="msg.type === 'ai'" class="avatar-sparkle">
                      ✨
                    </div>
                  </div>

                  <div class="message-bubble" :class="`bubble-${msg.type}`">
                    <div class="bubble-content">
                      <div class="message-text">{{ msg.content }}</div>
                      <div class="message-footer">
                        <div class="message-timestamp">
                          {{ formatTime(msg.timestamp) }}
                        </div>
                        <div class="message-actions">
                          <IconButton
                            variant="ghost"
                            size="xs"
                            icon="mdi-content-copy"
                            aria-label="Copy message"
                            title="Copy message text"
                            class="copy-btn enhanced-action"
                            @click="copy(msg.content)"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="bubble-tail" :class="`tail-${msg.type}`"></div>
                  </div>
                </div>
              </div>
            </transition-group>

            <!-- Typing Indicator -->
            <transition name="typing-fade">
              <div v-if="isThinking" class="typing-indicator">
                <div class="message-container">
                  <div class="message-avatar enhanced-avatar avatar-ai">
                    <div class="avatar-glow"></div>
                    <AppIcon name="mdi-robot" />
                    <div class="avatar-sparkle">✨</div>
                  </div>

                  <div class="message-bubble bubble-ai typing-bubble">
                    <div class="bubble-content">
                      <div class="typing-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                      </div>
                      <div class="typing-text">NAVI is thinking...</div>
                    </div>
                    <div class="bubble-tail tail-ai"></div>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Quick Replies -->
            <div
              v-if="shouldShowSuggestions && quickReplies.length > 0"
              class="quick-replies modern-suggestions"
              role="group"
              aria-label="Quick suggestions"
            >
              <button
                v-for="reply in quickReplies"
                :key="reply.id"
                class="quick-reply modern-chip"
                :aria-label="`Send: ${reply.text}`"
                @click="sendSuggestion(reply.text)"
              >
                <span class="reply-emoji">{{ reply.emoji }}</span>
                <span class="reply-text">{{ reply.text }}</span>
              </button>
            </div>

            <!-- AI Suggestion Chips -->
            <div
              v-if="shouldShowSuggestions && aiSuggestions.length > 0"
              class="ai-suggestions-container"
              role="group"
              aria-label="AI suggestions"
            >
              <div class="suggestions-header">
                <AppIcon name="mdi-lightbulb-outline" />
                <span class="suggestions-title">Suggested follow-ups</span>
              </div>
              <div class="suggestions-chips">
                <button
                  v-for="suggestion in aiSuggestions"
                  :key="suggestion.id"
                  class="suggestion-chip"
                  :aria-label="`Send suggestion: ${suggestion.text}`"
                  @click="sendSuggestion(suggestion.text)"
                >
                  <AppIcon :name="suggestion.icon" class="suggestion-icon" />
                  <span class="suggestion-text">{{ suggestion.text }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div
            class="chat-input-container enhanced-input-container glass-footer"
            role="group"
            aria-label="Chat input controls"
          >
            <!-- Floating Multimodal Controls -->
            <div class="multimodal-controls enhanced-controls">
              <div class="control-group voice-controls">
                <IconButton
                  :variant="ttsEnabled ? 'glass' : 'ghost'"
                  size="sm"
                  :icon="ttsEnabled ? 'mdi-volume-high' : 'mdi-volume-off'"
                  :aria-pressed="ttsEnabled ? 'true' : 'false'"
                  title="Toggle text-to-speech"
                  class="enhanced-control-btn"
                  @click="toggleTTS"
                />
                <IconButton
                  :variant="listening ? 'gaming' : 'ghost'"
                  size="sm"
                  :icon="
                    listening ? 'mdi-microphone' : 'mdi-microphone-outline'
                  "
                  :aria-pressed="listening ? 'true' : 'false'"
                  title="Voice input"
                  class="enhanced-control-btn pulse-on-active"
                  @click="toggleListening"
                />
              </div>

              <div class="control-group media-controls">
                <IconButton
                  :variant="video ? 'primary' : 'ghost'"
                  size="sm"
                  :icon="video ? 'mdi-video' : 'mdi-video-outline'"
                  :aria-pressed="video ? 'true' : 'false'"
                  title="Video streaming"
                  class="enhanced-control-btn"
                  @click="toggleVideo"
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon="mdi-camera"
                  title="Capture screenshot"
                  class="enhanced-control-btn"
                  @click="captureScreenshot"
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon="mdi-attachment"
                  title="Upload file"
                  class="enhanced-control-btn"
                  @click="uploadFile"
                />
              </div>

              <div class="control-group ai-controls">
                <IconButton
                  variant="outline"
                  size="sm"
                  icon="mdi-robot"
                  title="AI quick actions"
                  class="enhanced-control-btn ai-glow"
                  @click="showQuickActions"
                />
              </div>
            </div>

            <!-- Enhanced Text Input -->
            <div class="text-input-group enhanced-input-group">
              <div class="input-wrapper">
                <textarea
                  id="fairy-chat-input"
                  ref="inputRef"
                  v-model.trim="draft"
                  class="fairy-input enhanced-textarea glass-input fairy-textarea"
                  rows="1"
                  placeholder="Ask NAVI anything..."
                  aria-label="Message input"
                  autocomplete="off"
                  enterkeyhint="send"
                  @input="autoResize"
                  @keydown.enter.prevent="send"
                  @focus="onInputFocus"
                  @blur="onInputBlur"
                />
                <div class="input-glow"></div>
                <div v-if="draft.length > 0" class="character-count">
                  {{ draft.length }}/1000
                </div>
              </div>

              <UnifiedButton
                variant="gaming"
                icon-only
                icon="mdi-send"
                :disabled="!draft"
                aria-label="Send message"
                title="Send message (Enter)"
                class="send-btn-unified enhanced-send-btn"
                @click="send"
              >
                <div class="send-ripple"></div>
              </UnifiedButton>
            </div>

            <!-- Quick Actions Menu -->
            <div
              v-if="showQuickActionsMenu"
              class="quick-actions-menu glass-surface"
              role="menu"
              aria-label="Quick AI actions"
            >
              <div class="quick-actions-grid">
                <button
                  v-for="quickAction in quickActions"
                  :key="quickAction.label"
                  class="quick-action-item"
                  role="menuitem"
                  :aria-label="quickAction.label"
                  @click="executeQuickAction(quickAction.action)"
                >
                  <AppIcon :name="quickAction.icon" />
                  <span>{{ quickAction.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- TTS/Voice Settings Modal -->
  <Teleport to="body">
    <div
      v-if="showTTSModal"
      class="fairy-modal-overlay"
      @click.self="showTTSModal = false"
    >
      <div
        class="fairy-bubble enhanced-gaming-card"
        role="dialog"
        aria-modal="true"
        aria-label="Voice & TTS Settings"
      >
        <div class="chat-header" role="heading" aria-level="2">
          <div class="chat-title">
            <AppIcon name="mdi-cog" />
            <span class="title-text">Voice & TTS Settings</span>
          </div>
          <div class="chat-actions">
            <div class="action-buttons">
              <IconButton
                variant="ghost"
                size="sm"
                icon="mdi-close"
                aria-label="Close settings"
                title="Close Settings"
                @click="showTTSModal = false"
              />
            </div>
          </div>
        </div>
        <div class="tts-settings-content" style="padding: 16px">
          <div class="settings-row">
            <label for="tts-provider-select-modal">TTS Provider</label>
            <select
              id="tts-provider-select-modal"
              v-model="ttsProvider"
              class="tts-provider-select"
            >
              <option value="system">System TTS</option>
              <option value="gemini">Google AI (Gemini)</option>
              <option value="kokoro">Kokoro TTS</option>
            </select>
          </div>
          <div class="settings-row">
            <label>Speech Rate</label>
            <input
              v-model.number="ttsRate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="tts-slider"
              aria-label="Speech rate"
            />
            <span class="setting-value">{{ ttsRate }}x</span>
          </div>
          <div class="settings-row">
            <label>Voice Volume</label>
            <input
              v-model.number="ttsVolume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="tts-slider"
              aria-label="Voice volume"
            />
            <span class="setting-value">{{ Math.round(ttsVolume * 100) }}%</span>
          </div>
          <div class="settings-row" style="justify-content: flex-end">
            <UnifiedButton variant="primary" @click="showTTSModal = false">
              Done
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted, Teleport } from 'vue';
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import { useToast } from "@/composables/useToast";

const _props = defineProps({
  open: { type: Boolean, default: false },
  messages: { type: Array, default: () => [] },
  size: { type: String, default: "lg" }, // 'md' | 'lg' | 'xl'
});
const _emit = defineEmits(["update:open", "send"]);

const ttsEnabled = ref(false);
const listening = ref(false);
const video = ref(false);
const draft = ref("");
const inputRef = ref(null);
const logRef = ref(null);
const showTTSModal = ref(false);
const ttsProvider = ref("system");
const ttsRate = ref(0.9);
const ttsVolume = ref(0.8);

// AI Suggestions state
const aiSuggestions = ref([]);
const shouldShowSuggestions = ref(true);

// Enhanced UI state
const isThinking = ref(false);
const inputFocused = ref(false);
const showWelcome = ref(false);

// Quick replies data
const quickReplies = ref([
  { id: 1, emoji: "📝", text: "Build Resume" },
  { id: 2, emoji: "🔍", text: "Find Jobs" },
  { id: 3, emoji: "💼", text: "Interview Tips" },
  { id: 4, emoji: "🎮", text: "Gaming Skills" },
]);

const open = computed(() => props.open);
const sizeClass = computed(() =>
  props.size && ["md", "lg", "xl"].includes(props.size)
    ? `fairy-${props.size}`
    : "fairy-lg",
);
const status = computed(() => "idle");
const statusText = computed(() => "Ready");
const ui = useUnifiedUI();
const isCompact = computed(() => ui.density.value === "compact");
const {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
} = useToast();

const normalizedMessages = computed(() =>
  props.messages.map((m) => ({
    id: m.id ?? `${m.type}-${m.timestamp ?? Date.now()}`,
    type: m.type ?? "ai",
    content: String(m.content ?? ""),
    timestamp: m.timestamp ?? Date.now(),
  })),
);

function msgLabel(msg) {
  return msg.type === "user"
    ? "User message"
    : msg.type === "ai"
      ? "Assistant message"
      : "System message";
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function autoResize() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}

async function send() {
  if (!draft.value) return;

  // Show thinking indicator
  isThinking.value = true;

  emit("send", draft.value);
  draft.value = "";

  await nextTick();
  autoResize();
  scrollToBottom();

  // Hide thinking indicator after a delay (this would normally be controlled by AI response)
  setTimeout(() => {
    isThinking.value = false;
  }, 2000);
}

function copy(text) {
  try {
    navigator.clipboard?.writeText?.(text);
    toastSuccess("Message copied to clipboard");
  } catch {
    toastError("Failed to copy message");
  }
}

// Enhanced input interactions
function onInputFocus() {
  inputFocused.value = true;
}

function onInputBlur() {
  inputFocused.value = false;
}


function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value;
  toastInfo(
    ttsEnabled.value ? "Text-to-speech enabled" : "Text-to-speech disabled",
  );
}

// Voice recognition state
const recognition = ref(null);
const isRecognitionSupported = ref(false);

// Initialize speech recognition on mount
onMounted(() => {
  if (window.webkitSpeechRecognition || window.SpeechRecognition) {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    recognition.value = new SpeechRecognition();
    isRecognitionSupported.value = true;

    recognition.value.continuous = false;
    recognition.value.interimResults = false;
    recognition.value.lang = "en-US";

    recognition.value.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      draft.value = transcript;
      toastSuccess(`Voice input: "${transcript}"`);
      autoResize();
    };

    recognition.value.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      listening.value = false;
      if (event.error === "no-speech") {
        toastError("No speech detected. Please try again.");
      } else if (event.error === "network") {
        toastError("Network error. Please check your connection.");
      } else {
        toastError("Voice recognition failed. Please try again.");
      }
    };

    recognition.value.onend = () => {
      listening.value = false;
    };
  }
});

function toggleListening() {
  if (!isRecognitionSupported.value) {
    toastError("Voice recognition is not supported in this browser");
    return;
  }

  listening.value = !listening.value;

  if (listening.value) {
    try {
      recognition.value.start();
      toastInfo("Voice input activated - speak now");
    } catch (_error) {
      console.error("Failed to start speech recognition:", error);
      listening.value = false;
      toastError("Failed to start voice input");
    }
  } else {
    try {
      recognition.value.stop();
      toastInfo("Voice input deactivated");
    } catch (_error) {
      console.error("Failed to stop speech recognition:", error);
    }
  }
}

// Video streaming state
const videoStream = ref(null);
const isVideoSupported = ref(true);

function toggleVideo() {
  video.value = !video.value;

  if (video.value) {
    startVideoStream();
  } else {
    stopVideoStream();
  }
}

async function startVideoStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
      audio: false,
    });

    videoStream.value = stream;
    toastSuccess("Video streaming enabled");

    // Note: In a real implementation, you would send this stream to your AI service

  } catch (_error) {
    console.error("Failed to start video stream:", error);
    video.value = false;

    if (error.name === "NotAllowedError") {
      toastError("Camera access denied. Please allow camera permissions.");
    } else if (error.name === "NotFoundError") {
      toastError("No camera found on this device.");
    } else if (error.name === "NotReadableError") {
      toastError("Camera is already in use by another application.");
    } else {
      toastError("Failed to access camera. Please try again.");
    }
  }
}

function stopVideoStream() {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach((track) => track.stop());
    videoStream.value = null;
  }
  toastInfo("Video streaming disabled");
}

// Cleanup video stream on unmount
onUnmounted(() => {
  if (videoStream.value) {
    stopVideoStream();
  }
});

async function captureScreenshot() {
  if (videoStream.value) {
    try {
      // Create video element to capture frame from stream
      const video = document.createElement("video");
      video.srcObject = videoStream.value;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
      });

      // Create canvas to capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      // Convert to blob and create download link
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `screenshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toastSuccess("Screenshot captured and saved");
      }, "image/png");
    } catch (_error) {
      console.error("Screenshot capture failed:", error);
      toastError("Failed to capture screenshot");
    }
  } else {
    // Fallback: use screen capture API if available
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      await new Promise((resolve) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `screen-capture-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toastSuccess("Screen capture saved");
      }, "image/png");

      // Stop the screen capture stream
      stream.getTracks().forEach((track) => track.stop());
    } catch (_error) {
      console.error("Screen capture failed:", error);
      toastError("Screen capture not available or denied");
    }
  }
}

function uploadFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,text/*,.pdf,.doc,.docx,.txt,.md";
  input.multiple = false;

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;


    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("File size must be less than 10MB");
      return;
    }

    try {
      toastInfo(`Uploading ${file.name}...`);

      // For images, show preview and analyze
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (_e) => {
          const imageData = e.target.result;
          // In a real implementation, you would send this to your AI service for analysis
          emit("send", `[Uploaded image: ${file.name}]`);
          toastSuccess(`Image uploaded: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }

      // For text files, read content
      else if (
        file.type.startsWith("text/") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt")
      ) {
        const reader = new FileReader();
        reader.onload = (_e) => {
          const content = e.target.result;
          // Truncate long content for display
          const truncatedContent =
            content.length > 500 ? content.substring(0, 500) + "..." : content;
          emit(
            "send",
            `[Uploaded text file: ${file.name}]\n\nContent:\n${truncatedContent}`,
          );
          toastSuccess(`Text file uploaded: ${file.name}`);
        };
        reader.readAsText(file);
      }

      // For other files, just show name and type
      else {
        emit("send", `[Uploaded file: ${file.name} (${file.type})]`);
        toastSuccess(`File uploaded: ${file.name}`);
      }
    } catch (_error) {
      console.error("File upload failed:", error);
      toastError(`Failed to upload ${file.name}`);
    }
  };

  input.click();
}

// Quick actions state
const showQuickActionsMenu = ref(false);

const quickActions = [
  {
    icon: "mdi-briefcase-search",
    label: "Find Jobs",
    action: () =>
      emit("send", "Help me find gaming jobs that match my profile"),
  },
  {
    icon: "mdi-file-document-edit",
    label: "Review Resume",
    action: () =>
      emit("send", "Please review my resume and suggest improvements"),
  },
  {
    icon: "mdi-school",
    label: "Skill Analysis",
    action: () =>
      emit(
        "send",
        "Analyze my skills and suggest areas for growth in game development",
      ),
  },
  {
    icon: "mdi-lightbulb",
    label: "Career Advice",
    action: () =>
      emit(
        "send",
        "Give me career advice for advancing in the gaming industry",
      ),
  },
  {
    icon: "mdi-chat-question",
    label: "Interview Prep",
    action: () =>
      emit("send", "Help me prepare for a game developer interview"),
  },
  {
    icon: "mdi-rocket",
    label: "Project Ideas",
    action: () =>
      emit(
        "send",
        "Suggest some game development project ideas to build my portfolio",
      ),
  },
];

function showQuickActions() {
  showQuickActionsMenu.value = !showQuickActionsMenu.value;
}

function executeQuickAction(action) {
  action();
  showQuickActionsMenu.value = false;
  toastSuccess("Quick action executed");
}


function generateContextualSuggestions(lastMessage) {
  const suggestions = [];

  if (!lastMessage || lastMessage.type !== "ai") return [];

  const content = lastMessage.content.toLowerCase();

  // Context-based suggestions based on AI response content
  if (content.includes("resume") || content.includes("cv")) {
    suggestions.push(
      {
        id: "resume-review",
        text: "Review my resume",
        icon: "mdi-file-document-edit",
      },
      {
        id: "resume-tailor",
        text: "Tailor for specific job",
        icon: "mdi-target",
      },
      {
        id: "resume-skills",
        text: "Improve skills section",
        icon: "mdi-star-plus",
      },
    );
  }

  if (
    content.includes("job") ||
    content.includes("career") ||
    content.includes("position")
  ) {
    suggestions.push(
      {
        id: "job-search",
        text: "Find similar jobs",
        icon: "mdi-briefcase-search",
      },
      { id: "job-match", text: "Check job match", icon: "mdi-percent" },
      { id: "salary-info", text: "Salary information", icon: "mdi-cash" },
    );
  }

  if (
    content.includes("skill") ||
    content.includes("learn") ||
    content.includes("improve")
  ) {
    suggestions.push(
      { id: "skill-gap", text: "Analyze skill gaps", icon: "mdi-chart-line" },
      { id: "learning-path", text: "Create learning path", icon: "mdi-school" },
      { id: "project-ideas", text: "Suggest projects", icon: "mdi-lightbulb" },
    );
  }

  if (content.includes("interview") || content.includes("preparation")) {
    suggestions.push(
      {
        id: "practice-questions",
        text: "Practice questions",
        icon: "mdi-help-circle",
      },
      {
        id: "mock-interview",
        text: "Start mock interview",
        icon: "mdi-account-voice",
      },
      { id: "company-research", text: "Research company", icon: "mdi-magnify" },
    );
  }

  if (content.includes("portfolio") || content.includes("project")) {
    suggestions.push(
      {
        id: "portfolio-review",
        text: "Review portfolio",
        icon: "mdi-folder-open",
      },
      { id: "showcase-tips", text: "Showcase tips", icon: "mdi-star" },
      { id: "github-optimize", text: "Optimize GitHub", icon: "mdi-github" },
    );
  }

  // Default suggestions if no specific context
  if (suggestions.length === 0) {
    suggestions.push(
      { id: "explore-more", text: "Tell me more", icon: "mdi-information" },
      { id: "ask-different", text: "Ask differently", icon: "mdi-refresh" },
      {
        id: "get-examples",
        text: "Show examples",
        icon: "mdi-format-list-bulleted",
      },
    );
  }

  return suggestions.slice(0, 4);
}

function sendSuggestion(suggestionText) {
  emit("send", suggestionText);
  aiSuggestions.value = [];
  toastSuccess("Suggestion sent");
}

function updateSuggestionsBasedOnLastMessage() {
  if (normalizedMessages.value.length === 0) return;

  const lastMessage =
    normalizedMessages.value[normalizedMessages.value.length - 1];
  if (lastMessage.type === "ai") {
    // Generate suggestions after a short delay to allow message to render
    setTimeout(() => {
      aiSuggestions.value = generateContextualSuggestions(lastMessage);
    }, 500);
  } else if (lastMessage.type === "user") {
    // Hide suggestions when user sends a message
    aiSuggestions.value = [];
  }
}

function scrollToBottom() {
  try {
    const el = logRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  } catch {}
}

function close() {
  emit("update:open", false);
}

watch(
  () => props.open,
  (v) => {
    if (v) nextTick(scrollToBottom);
  },
);
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      updateSuggestionsBasedOnLastMessage();
      scrollToBottom();
    });
  },
  { deep: true },
);
onMounted(() => nextTick(scrollToBottom));
// Close on Escape
onMounted(() => {
  const onKey = (_e) => {
    if (e.key === "Escape") close();
  };
  window.addEventListener("keydown", onKey);
  onUnmounted(() => window.removeEventListener("keydown", onKey));
});

// Initialize from global app-settings (shared with assistant)
onMounted(() => {
  try {
    const appSettings = JSON.parse(
      localStorage.getItem("app-settings") || "{}",
    );
    ttsProvider.value = appSettings.ttsProvider || "system";
    ttsRate.value = appSettings.speechRate ?? 0.9;
    ttsVolume.value = appSettings.speechVolume ?? 0.8;
  } catch {}
});

// Persist voice settings so all chats share them
watch([ttsProvider, ttsRate, ttsVolume], ([p, r, v]) => {
  try {
    const appSettings = JSON.parse(
      localStorage.getItem("app-settings") || "{}",
    );
    appSettings.ttsProvider = p;
    appSettings.speechRate = r;
    appSettings.speechVolume = v;
    localStorage.setItem("app-settings", JSON.stringify(appSettings));
  } catch {}
});

// Welcome animation when chat opens
watch(open, (newVal) => {
  if (newVal) {
    // Show welcome animation for new or empty sessions
    if (normalizedMessages.value.length === 0) {
      showWelcome.value = true;
      setTimeout(() => {
        showWelcome.value = false;
      }, 2000);
    }

    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus();
        autoResize();
      }
      scrollToBottom();
    });
  }
});
</script>

<style scoped>
.fairy-modal-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes overlayFadeIn {
  from {
  }
  to {
  }
}


.modern-header {
  background: linear-gradient(
  );
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-shimmer {
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
}

@keyframes shimmer {
  }
  }
}

.header-info {
  display: flex;
  align-items: center;
}

.header-avatar {
  background: linear-gradient(
  );
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: white;
  position: relative;
}

@keyframes headerPulse {
  }
  }
}

.header-avatar .avatar-glow {
  position: absolute;
  background: linear-gradient(
  );
  border-radius: var(--radius-xl);
}

@keyframes glowPulse {
  }
  }
}

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: white;
}

.header-status {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
}

.animated-dot {
}

@keyframes statusPulse {
  }
  }
}

.modern-header-btn {
  color: white !important;
  transition: all var(--duration-fast);
}

.modern-header-btn:hover {
}

.quick-replies {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.quick-replies::-webkit-scrollbar {
  display: none;
}

.modern-chip {
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.modern-chip::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-fast);
}

.modern-chip:hover {
  color: white;
}

.modern-chip:hover::before {
}

.reply-emoji,
.reply-text {
  position: relative;
}

.bubble-ai {
  background: var(--glass-bg);
  color: var(--text-primary);
  border-radius: var(--radius-xl);
}

.bubble-user {
  background: linear-gradient(
  );
  border: none;
  color: white;
  border-radius: var(--radius-xl);
}

.enhanced-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
}

.enhanced-control-btn {
  background: var(--surface-elevated) !important;
  border-radius: var(--radius-lg) !important;
  color: var(--text-secondary) !important;
  transition: all var(--duration-fast);
  position: relative;
}

.enhanced-control-btn:hover {
  color: white !important;
}

.enhanced-control-btn.pulse-on-active {
  color: white !important;
}

.enhanced-control-btn.pulse-on-active::after {
  content: "";
  position: absolute;
  border-radius: var(--radius-lg);
}

@keyframes controlGlow {
  }
  }
}

.enhanced-send-btn {
  background: linear-gradient(
  ) !important;
  border: none !important;
  border-radius: var(--radius-full) !important;
  color: white !important;
  transition: all var(--duration-fast);
  position: relative;
}

.enhanced-send-btn:hover {
}

.enhanced-send-btn:disabled {
  cursor: not-allowed;
}

.fairy-bubble {
  background: var(--glass-bg);
  position: relative;
  overflow: hidden;
}

@keyframes slideUp {
  from {
  }
  to {
  }
}

.fairy-bubble::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  -webkit-mask:
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@keyframes borderGlow {
  }
  }
}

.welcome-animation {
  position: absolute;
  background: linear-gradient(
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.welcome-text {
  font-weight: var(--font-weight-bold);
}

.welcome-sparkles {
  font-size: var(--font-size-xl);
}

@keyframes welcomeGlow {
  }
  }
}

@keyframes sparkleRotate {
  from {
  }
  to {
  }
}

.welcome-fade-enter-active,
.welcome-fade-leave-active {
}

.welcome-fade-enter-from {
}

.welcome-fade-leave-to {
}

.enhanced-messages {
  position: relative;
  overflow-y: auto;
  scrollbar-width: thin;
}

.enhanced-messages::-webkit-scrollbar {
}

.enhanced-messages::-webkit-scrollbar-track {
  background: transparent;
}

.enhanced-messages::-webkit-scrollbar-thumb {
}

.messages-container {
  display: flex;
  flex-direction: column;
}

.enhanced-message {
  animation-fill-mode: both;
}

@keyframes messageSlideIn {
  from {
  }
  to {
  }
}

.message-container {
  display: flex;
  align-items: flex-end;
  position: relative;
}

.message-user .message-container {
  flex-direction: row-reverse;
}

.enhanced-avatar {
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all var(--duration-fast);
}

.avatar-glow {
  position: absolute;
  border-radius: var(--radius-full);
  transition: opacity var(--duration-fast);
}

.enhanced-avatar:hover .avatar-glow {
}

.avatar-ai {
  background: linear-gradient(
  );
  color: white;
}

.avatar-ai .avatar-glow {
  background: linear-gradient(
  );
}

.avatar-user {
  background: linear-gradient(
  );
  color: white;
}

.avatar-user .avatar-glow {
  background: linear-gradient(
  );
}

.avatar-sparkle {
  position: absolute;
}

@keyframes sparkle {
  }
  }
}

.message-bubble {
  border-radius: var(--radius-xl);
  position: relative;
  transition: all var(--duration-fast);
}

@keyframes bubbleIn {
  from {
  }
  to {
  }
}

.bubble-ai {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.bubble-user {
  background: linear-gradient(
  );
  color: white;
}

.bubble-content {
  position: relative;
}

.message-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
}

.message-actions {
  display: flex;
}

.enhanced-action {
  transition: opacity var(--duration-fast);
}

.message-bubble:hover .enhanced-action {
}

.bubble-tail {
  position: absolute;
}

.tail-ai {
}

.tail-user {
}

.typing-indicator {
}

.typing-bubble {
}

.typing-dots {
  display: flex;
}

.typing-dots .dot {
}

}

}

@keyframes typingDot {
  }
  }
}

.typing-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-style: italic;
}

.message-slide-enter-active,
.message-slide-leave-active {
}

.message-slide-enter-from {
}

.message-slide-leave-to {
}

.typing-fade-enter-active,
.typing-fade-leave-active {
}

.typing-fade-enter-from,
.typing-fade-leave-to {
}

.enhanced-input-container {
  background: var(--glass-bg);
  position: relative;
}

.enhanced-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
}

.control-group {
  display: flex;
}

.enhanced-control-btn {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.enhanced-control-btn:hover {
}

.pulse-on-active {
}

.ai-glow {
}

.enhanced-input-group {
  display: flex;
  align-items: flex-end;
}

.input-wrapper {
  position: relative;
}

.enhanced-textarea {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  resize: none;
  transition: all var(--duration-fast);
  position: relative;
}

.enhanced-textarea:focus {
  outline: none;
}

.input-glow {
  position: absolute;
  border-radius: var(--radius-xl);
  background: linear-gradient(
  );
  transition: opacity var(--duration-fast);
  pointer-events: none;
}

.enhanced-textarea:focus + .input-glow {
}

.character-count {
  position: absolute;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  pointer-events: none;
}

.enhanced-send-btn {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.enhanced-send-btn:hover {
}

.send-ripple {
  position: absolute;
  background: radial-gradient(
    circle,
  );
  pointer-events: none;
}

.enhanced-send-btn:active .send-ripple {
}

@media (max-width: var(--breakpoint-md)) {
  .message-bubble {
  }

  .enhanced-controls {
    flex-direction: column;
  }

  .control-group {
    justify-content: center;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .enhanced-avatar {
  }

  .message-bubble {
  }

  .bubble-content {
  }
}

.fairy-bubble {
  height: auto;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.fairy-bubble::before {
  content: "";
  position: absolute;
  pointer-events: none;
}

@keyframes bubbleSlideIn {
  from {
  }
  to {
  }
}

.fairy-chat-interface {
  display: flex;
  flex-direction: column;
  background: var(--surface-base);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
}

.chat-header::before {
  content: "";
  position: absolute;
  background: var(--gradient-primary-subtle);
  pointer-events: none;
}

.chat-title {
  display: flex;
  align-items: center;
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.chat-actions {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.chat-status {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-dot {
  background: var(--color-success);
}

@keyframes pulse {
  }
  }
}

.chat-messages {
  overflow-y: auto;
  background: var(--surface-base);
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

.chat-message {
  display: flex;
  align-items: flex-start;
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

.message-avatar {
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
}

.message-user .message-avatar {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
}

.message-ai .message-avatar {
  background: var(--color-gaming-bg);
  border-color: var(--color-gaming-border);
}

.message-content {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-sm);
}

.message-user .message-content {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
}

.message-ai .message-content {
  background: var(--glass-bg-light);
}

.message-system .message-content {
  background: var(--surface-muted);
  border-color: var(--border-muted);
  text-align: center;
  font-style: italic;
  color: var(--text-secondary);
}

.message-text {
  font-family: var(--font-primary);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-timestamp {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.chat-input-container {
  --chat-input-offset: calc(
  );
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  display: flex;
  flex-direction: column;
  position: relative;
}
.chat-input-container:focus-within {
  border-top-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}
.chat-input-container::before {
  content: "";
  position: absolute;
  pointer-events: none;
}
[data-theme="dark"] .chat-input-container::before {
  background: linear-gradient(
    to bottom,
    transparent
  );
}

.multimodal-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.text-input-group {
  display: grid;
  align-items: end;
}

.fairy-textarea {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  resize: none;
  transition: all var(--duration-fast) var(--easing-ease);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
}

.fairy-textarea:focus {
  outline: none;
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-focus);
  background: var(--glass-bg-light);
}

.fairy-textarea::placeholder {
  color: var(--text-placeholder);
}

.send-btn-unified {
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--easing-ease);
}

.send-btn-unified:disabled {
  cursor: not-allowed;
}

.tts-settings-content {
  display: flex;
  flex-direction: column;
}

.settings-row {
  display: flex;
  align-items: center;
  font-family: var(--font-primary);
}

.settings-row label {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.tts-provider-select,
.tts-slider {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-family: var(--font-primary);
}

.setting-value {
  text-align: right;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

  .fairy-bubble {
    max-width: none;
  }

  .fairy-bubble::before {
  }

  .fairy-chat-interface {
  }

  .chat-header {
  }

  .chat-messages {
  }

  .chat-input-container {
  }

  .multimodal-controls {
  }

  .text-input-group {
  }

  .message-content {
  }

  .message-user .message-content {
  }

  .message-ai .message-content {
  }
}

  .chat-header {
  }

  .chat-messages {
  }

  .chat-input-container {
  }

  .multimodal-controls {
    justify-content: center;
  }

  .settings-row {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-row label {
    flex: none;
  }
}

[data-theme="dark"] .fairy-bubble {
}

[data-theme="dark"] .chat-header {
}

[data-theme="dark"] .chat-messages {
}

[data-theme="dark"] .message-content {
}

.theme-gaming .fairy-bubble {
  background: linear-gradient(
  );
}

.theme-gaming .chat-header {
  background: linear-gradient(
  );
}

.theme-gaming .message-ai .message-content {
  background: linear-gradient(
  );
}

@media (prefers-reduced-motion: reduce) {
  }
}

@media (prefers-contrast: high) {
  .fairy-bubble,
  .message-content,
  .fairy-textarea {
  }

  .chat-status {
  }

  .status-dot {
  }
}

.fairy-modal-overlay:focus-within {
  outline: none;
}

.visually-hidden-focusable:not(:focus) {
  position: absolute !important;
  overflow: hidden !important;
  white-space: nowrap !important;
}

.chat-messages {
  contain: layout style paint;
  will-change: scroll-position;
}

.chat-message {
  contain: layout style;
}

.fairy-bubble {
  contain: layout;
}

.ai-suggestions-container {
  background: var(--glass-bg-light);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-sm);
}

@keyframes suggestionsSlideIn {
  from {
  }
  to {
  }
}

.suggestions-header {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.suggestions-title {
  font-family: var(--font-primary);
}

.suggestions-chips {
  display: flex;
  flex-wrap: wrap;
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-xs);
}

.suggestion-chip:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  color: var(--color-primary-text);
  box-shadow: var(--shadow-md);
}

.suggestion-chip:active {
  box-shadow: var(--shadow-xs);
}

.suggestion-chip:focus {
  outline: none;
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-focus);
}

.suggestion-icon {
}

.suggestion-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-gaming .ai-suggestions-container {
  background: linear-gradient(
  );
}

.theme-gaming .suggestion-chip:hover {
  background: linear-gradient(
  );
}

[data-theme="dark"] .ai-suggestions-container {
}

[data-theme="dark"] .suggestion-chip {
}

[data-theme="dark"] .suggestion-chip:hover {
}

  .suggestions-chips {
  }

  .suggestion-chip {
    font-size: var(--font-size-xs);
  }

  .suggestion-icon {
  }

  .suggestion-text {
  }

  .ai-suggestions-container {
  }

  .suggestions-header {
  }
}

@media (prefers-contrast: high) {
  .suggestion-chip {
  }

  .ai-suggestions-container {
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-suggestions-container {
    animation: none;
  }

  .suggestion-chip:hover {
    transform: none;
  }
}
</style>
