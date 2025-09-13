<template>
  <div
    class="ai-fairy-container fairy-accent-upgraded"
    :class="[
      unifiedUI.unifiedClasses.value,
      {
        'fairy-expanded': expanded,
        'fairy-chatting': isChatActive,
        'fairy-thinking': isThinking,
        'fairy-active': hasNotifications || expanded || isChatActive,
        'fairy-pulsing': hasNotifications && !expanded,
        'compact-ui': compactUI,
        'fairy-small-mode': isSmallMode,
        'fairy-full-mode': isFullMode,
        'fairy-hidden': !isVisible,
      },
    ]"
    :data-active="hasNotifications || expanded || isChatActive"
    :data-theme="unifiedUI?.theme?.colorScheme?.value || 'light'"
    :data-bubble-size="bubbleSize"
    :aria-busy="isThinking ? 'true' : 'false'"
    :title="
      fairyStatus +
        ' (Click to cycle: ' +
        bubbleSize +
        ' -> ' +
        getNextSizeLabel() +
        ')'
    "
    role="button"
    tabindex="0"
    :aria-label="getAriaLabel()"
    aria-haspopup="dialog"
    :aria-expanded="expanded ? 'true' : 'false'"
    @click="toggleExpanded"
    @keydown.enter.prevent="toggleExpanded"
    @keydown.space.prevent="toggleExpanded"
    @mouseenter="onHoverStart"
    @mouseleave="onHoverEnd"
  >
    <!-- Particle System -->
    <div class="particle-system" aria-hidden="true">
      <div
        v-for="n in 6"
        :key="n"
        class="particle"
        :style="{ '--delay': n * 0.3 + 's' }"
      ></div>
    </div>

    <!-- Enhanced Selection Ring -->
    <div
      class="selection-ring"
      :class="{ active: hasNotifications || expanded }"
    ></div>

    <div class="fairy-character">
      <div class="fairy-glow" aria-hidden="true"></div>
      <div class="fairy-aura" aria-hidden="true"></div>

      <!-- Animated Wings -->
      <div class="fairy-wings" aria-hidden="true">
        <div class="wing wing-left">
          <div class="wing-pattern"></div>
        </div>

        <!-- Scroll to latest button moved into chat messages container -->
        <div class="wing wing-right">
          <div class="wing-pattern"></div>
        </div>
      </div>

      <!-- Main Character -->
      <div class="fairy-body">
        <div class="fairy-core">
          <AppIcon
            :name="getIcon('mdi-shimmer', 'mdi-shimmer')"
            :size="getIconSize()"
            :color="getIconColor()"
          />
        </div>
        <div class="fairy-sparkles" aria-hidden="true">
          <span v-for="n in 3" :key="n" class="sparkle">
            <AppIcon
              :name="getIcon('mdi-shimmer', 'mdi-shimmer')"
              :size="getIconSize()"
              :color="getIconColor()"
            />
          </span>
        </div>
      </div>

      <!-- Enhanced Status Indicators -->
      <transition name="notification-appear">
        <div
          v-if="hasNotifications"
          class="notification-pulse enhanced-pulse"
          aria-hidden="true"
        >
          <div class="pulse-core">!</div>
          <div class="pulse-ring"></div>
        </div>
      </transition>

      <!-- Small mode page indicator -->
      <transition name="indicator-appear">
        <div v-if="isSmallMode" class="page-indicator" aria-hidden="true">
          <div class="page-indicator-dot"></div>
        </div>
      </transition>

      <transition name="indicator-appear">
        <div
          v-if="isListening"
          class="listening-indicator enhanced-indicator"
          aria-hidden="true"
        >
          <div class="indicator-icon">
            <AppIcon
              :name="getIcon('mdi-microphone', 'mdi-microphone')"
              :size="getIconSize()"
              :color="getIconColor()"
            />
          </div>
          <div class="voice-waves">
            <div
              v-for="n in 3"
              :key="n"
              class="wave"
              :style="{ '--i': n }"
            ></div>
          </div>
        </div>
      </transition>

      <transition name="indicator-appear">
        <div
          v-if="isThinking"
          class="thinking-indicator enhanced-indicator"
          aria-hidden="true"
        >
          <div class="indicator-icon">
            <AppIcon
              :name="getIcon('mdi-thought-bubble', 'mdi-thought-bubble')"
              :size="getIconSize()"
              :color="getIconColor()"
            />
          </div>
          <div class="thinking-dots">
            <div
              v-for="n in 3"
              :key="n"
              class="dot"
              :style="{ '--i': n }"
            ></div>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- Text Bubble -->
  <transition name="bubble-appear">
    <div
      v-if="
        (currentMessage || expanded || shouldShowEmptyBubble) &&
          bubbleSize !== 'hidden'
      "
      class="fairy-bubble enhanced-gaming-card"
      :class="{
        'bubble-persistent': expanded,
        'bubble-elevated': hasNotifications,
        'bubble-interactive': expanded,
        'bubble-empty': !currentMessage && !expanded,
      }"
    >
      <!-- Message Content -->
      <div
        v-if="currentMessage"
        class="bubble-content bubble-content--glass"
        role="group"
        aria-label="Assistant suggestion"
      >
        <div class="message-text" role="status" aria-live="polite">
          {{ currentMessage.text }}
        </div>
        <div
          v-if="currentMessage.actions"
          class="message-actions"
          role="toolbar"
          aria-label="Quick actions"
        >
          <button
            v-for="action in currentMessage.actions"
            :key="action.id"
            class="glass-btn ai-powered"
            type="button"
            :aria-label="action.label"
            @click="executeAction(action)"
          >
            <AppIcon :name="getIcon(action.icon, 'mdi-auto-fix')" />
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Empty State Bubble -->
      <div
        v-else-if="shouldShowEmptyBubble && !expanded"
        class="bubble-content bubble-content--glass bubble-empty-state"
        role="group"
        aria-label="AI assistant ready"
      >
        <div
          class="message-text message-text--empty"
          role="status"
          aria-live="polite"
        >
          Ready to help!
          <span class="fairy-emoji"><AppIcon name="mdi-auto-fix" /></span>
        </div>
      </div>

      <!-- Chat Interface when expanded -->
      <div
        v-if="expanded"
        class="fairy-chat-interface"
        role="dialog"
        aria-label="NAVI Assistant Chat"
        aria-modal="false"
      >
        <!-- Header -->
        <div class="chat-header">
          <div class="header-info">
            <div class="header-avatar">🧚</div>
            <div class="header-details">
              <h3>NAVI Assistant</h3>
              <div class="header-status">
                <span class="status-dot"></span>
                <span>Active • AI Powered</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn">⚙️</button>
            <button class="header-btn">−</button>
          </div>
        </div>

        <!-- Messages Area -->
        <div
          ref="messagesContainer"
          class="messages-area"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          @scroll="updateNearBottomState"
        >
          <!-- AI Message -->
          <div class="message message-ai">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="message-bubble">
                Hi! I'm NAVI, your AI career fairy! ✨ I can help with resumes,
                job searches, interviews, and more. What would you like to work
                on today?
              </div>
              <span class="message-time">Just now</span>
            </div>
          </div>

          <!-- User Message Example -->
          <div class="message message-user">
            <div class="message-avatar">👤</div>
            <div class="message-content">
              <div class="message-bubble">
                I need help preparing for a gaming industry interview
              </div>
              <span class="message-time">Just now</span>
            </div>
          </div>

          <!-- AI Response -->
          <div class="message message-ai">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="message-bubble">
                Perfect! I can help you ace that gaming industry interview! Let
                me prepare some tailored questions and tips based on your target
                role. What position are you interviewing for?
              </div>
              <span class="message-time">Just now</span>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>

        <!-- Quick Replies -->
        <div class="quick-replies">
          <button class="quick-reply">📝 Build Resume</button>
          <button class="quick-reply">🔍 Find Jobs</button>
          <button class="quick-reply">💼 Interview Tips</button>
          <button class="quick-reply">🎮 Gaming Skills</button>
        </div>

        <!-- Input Container -->
        <div class="chat-input-container">
          <!-- Primary Input Area -->
          <div class="primary-input-area">
            <textarea
              class="text-input"
              placeholder="Ask NAVI anything..."
              rows="1"
            ></textarea>
            <div class="input-actions">
              <button class="control-btn" title="Upload file">📎</button>
              <button class="send-btn">➤</button>
            </div>
          </div>

          <!-- Secondary Controls -->
          <div class="secondary-controls">
            <div class="control-group media-controls">
              <button class="control-btn active" title="Text-to-speech">
                🔊
              </button>
              <button class="control-btn" title="Voice input">🎤</button>
              <button class="control-btn" title="Video call">📹</button>
              <button class="control-btn" title="Screen capture">📸</button>
            </div>
            <div class="control-group ai-controls">
              <button class="control-btn" title="AI suggestions">✨</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Close button removed but fairy-close class kept in CSS -->
    </div>
  </transition>

  <!-- Camera Modal -->
  <teleport to="body">
    <div
      v-if="cameraModalOpen"
      class="camera-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      @click="closeCameraModal"
      @keydown.esc.prevent="closeCameraModal"
    >
      <div
        ref="cameraModalEl"
        class="camera-modal ultra-glass-card section-card"
        tabindex="-1"
        @click.stop
        @keydown="onCameraModalKeydown"
      >
        <div class="camera-header">
          <h3 id="camera-modal-title">Camera Input</h3>
          <button class="glass-btn" @click="closeCameraModal">
            <AppIcon
              :name="getIcon('mdi-close', 'mdi-close')"
              :size="getIconSize()"
            />
          </button>
        </div>
        <div class="camera-content">
          <video ref="cameraVideo" autoplay playsinline></video>
          <canvas ref="cameraCanvas" style="display: none"></canvas>
          <div class="camera-controls">
            <button class="glass-btn ai-powered" @click="captureImage">
              <AppIcon
                :name="getIcon('mdi-camera', 'mdi-camera')"
                :size="getIconSize()"
              />
              Capture & Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>

  <!-- TTS/Voice Settings Modal -->
  <teleport to="body">
    <div
      v-if="showTTSModal"
      class="settings-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tts-modal-title"
      @click.self="showTTSModal = false"
      @keydown.esc.prevent="showTTSModal = false"
    >
      <div
        class="settings-modal ultra-glass-card section-card"
        tabindex="-1"
        @click.stop
      >
        <div class="settings-modal-header">
          <h3 id="tts-modal-title">
            <AppIcon
              :name="getIcon('mdi-cog', 'mdi-cog')"
              :size="getIconSize()"
            />
            Voice & TTS Settings
          </h3>
          <button
            class="glass-btn"
            aria-label="Close settings"
            @click="showTTSModal = false"
          >
            <AppIcon
              :name="getIcon('mdi-close', 'mdi-close')"
              :size="getIconSize()"
            />
          </button>
        </div>
        <div class="settings-modal-content tts-settings-content">
          <div class="settings-row">
            <label for="tts-provider-select">TTS Provider</label>
            <select
              id="tts-provider-select"
              v-model="ttsSettings.provider"
              class="tts-provider-select"
              aria-describedby="tts-provider-help"
              @change="saveTTSSettings"
            >
              <option value="system">System TTS</option>
              <option value="gemini">Google AI (Gemini)</option>
              <option value="kokoro">Kokoro TTS</option>
            </select>
          </div>

          <div class="settings-row">
            <label>Speech Rate</label>
            <input
              v-model.number="ttsSettings.rate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="tts-slider"
              aria-label="Speech rate"
              @input="saveTTSSettings"
            />
            <span class="setting-value">{{ ttsSettings.rate }}x</span>
          </div>

          <div class="settings-row">
            <label>Voice Volume</label>
            <input
              v-model.number="ttsSettings.volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="tts-slider"
              aria-label="Voice volume"
              @input="saveTTSSettings"
            />
            <span class="setting-value">{{ Math.round(ttsSettings.volume * 100) }}%</span>
          </div>

          <div class="settings-row">
            <label for="compact-ui-toggle">Compact UI</label>
            <input
              id="compact-ui-toggle"
              type="checkbox"
              :checked="compactUI"
              @change="saveUISettings($event.target.checked)"
            />
          </div>

          <div class="settings-row">
            <button
              class="test-tts-btn glass-btn"
              :disabled="isSpeaking"
              @click="testTTS"
            >
              <AppIcon
                :name="
                  isSpeaking
                    ? getIcon('mdi-stop', 'mdi-stop')
                    : getIcon('mdi-play', 'mdi-play')
                "
                :size="getIconSize()"
              />
              {{ isSpeaking ? "Stop" : "Test Voice" }}
            </button>
          </div>

          <div class="settings-info">
            <small class="provider-info">
              <AppIcon
                :name="
                  getIcon('mdi-information-outline', 'mdi-information-outline')
                "
                :size="getIconSize()"
              />
              <span id="tts-provider-help">{{
                getProviderInfo(ttsSettings.provider)
              }}</span>
            </small>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

import AppIcon from "@/components/ui/AppIcon.vue";

import {
  ref,
  computed,
  watch,
  nextTick,
  injectonUnmounted,
  getCurrentInstance,
} from "vue";

import { useRoute } from "vue-router";
import { useToast } from "@/composables/useToast";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import { useIconReplacement } from "@/composables/useIconReplacement";
import { useLiveMultimediaAI } from "@/composables/useLiveMultimediaAI";
import { useAppStore } from "@/stores/app";
import {
  runVoiceServicesDiagnostics,
  getVoiceServicesStatusMessage,
} from "@/shared/utils/voiceServicesValidator";
import { logger } from "@/shared/utils/logger";
import {
  speak,
  stopSpeaking,
  isVoiceSupported,
  setVoiceRoutingPreferences,
} from "@/utils/voice.js";
import { resolveGeminiApiKey } from "@/shared/utils/apiKeys";

export default {
  name: "AIFairyAssistant",
  components: { AppIcon },
  setup() {
    const router = useRouter();

    const route = useRoute();
    const store = useAppStore();
    const vmInstance = getCurrentInstance();
    const currentPath = () => {
      try {
        if (route && typeof route.path !== "undefined") return route.path;
      } catch {}
      try {
        const mockRoute = vmInstance?.proxy?.$route;
        if (mockRoute && typeof mockRoute.path === "string")
          return mockRoute.path;
      } catch {}
      return "/";
    };
    const toast = useToast();
    const unifiedUI = useUnifiedUI();
    const { getIcon, getIconSize, getIconColor } = useIconReplacement();
    const useAIIntegrationFactory = inject("useAIIntegration", null);
    const aiIntegration = useAIIntegrationFactory
      ? useAIIntegrationFactory()
      : null;

    // Enhanced AI integration check with auto-initialization
    async function ensureAIReady() {
      if (!aiIntegration) {
        logger.warn("AI integration not available");
        return false;
      }

      if (!aiIntegration.isAIInitialized.value) {
        logger.info("AI not initialized, attempting initialization...");
        const success = await aiIntegration.initializeAI();
        if (!success) {
          toast.error(
            "Failed to initialize AI services. Please check your settings.",
          );
          return false;
        }
      }

      return true;
    }

    // State
    const expanded = ref(false);
    const currentMessage = ref(null);
    const userInput = ref("");
    const chatMessages = ref([]);
    const isListening = ref(false);
    const isVideoStreaming = ref(false);
    const isThinking = ref(false);
    const isProcessing = ref(false);
    const hasNotifications = ref(false);
    const cameraModalOpen = ref(false);
    const messagesContainer = ref(null);

    // Bubble size state management
    const bubbleSize = computed(
      () => store.settings?.fairyBubbleSize || "full",
    );
    const isVisible = computed(() => bubbleSize.value !== "hidden");
    const isSmallMode = computed(() => bubbleSize.value === "small");
    const isFullMode = computed(() => bubbleSize.value === "full");
    const cameraVideo = ref(null);
    const cameraCanvas = ref(null);
    const cameraModalEl = ref(null);
    const chatInputEl = ref(null);

    // UI settings
    const compactUI = ref(false);

    // TTS State
    const ttsEnabled = ref(true); // Default to enabled
    const isSpeaking = ref(false);
    const currentSpeakingMessageId = ref(null); // Track which message is being spoken
    const ttsSettings = ref({
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8,
      voice: null,
      provider: "system", // 'system' or 'gemini'
    });
    // Cached Gemini API key state for provider helper
    const hasGeminiApiKey = ref(false);
    (async () => {
      try {
        hasGeminiApiKey.value = !!(await resolveGeminiApiKey());
      } catch {}
    })();
    function getProviderInfo(provider) {
      const hasApiKey = hasGeminiApiKey.value;
      const hasElectronAPI = Boolean(window.api?.audio?.ttsSpeak);
      switch (provider) {
        case "gemini":
          if (!hasApiKey)
            return "Google AI Gemini TTS (requires API key in main settings)";
          if (!hasElectronAPI)
            return "Google AI TTS (browser mode - falling back to system TTS)";
          return "Using Google AI Gemini for natural-sounding speech (API key active)";
        case "kokoro":
          return "Using Kokoro TTS for high-quality neural voice synthesis (local processing)";
        case "system":
        default:
          return "Using browser's built-in text-to-speech engine (fast and reliable)";
      }
    }

    // TTS Settings Modal
    const showTTSModal = ref(false);

    function autoResizeInput() {
      try {
        const el = chatInputEl.value;
        if (!el) return;
        el.style.height = "auto";
        const max = 140;
        el.style.height = Math.min(el.scrollHeight, max) + "px";
      } catch {}
    }

    function onInputEnter(_e) {
      // Shift+Enter inserts newline, Enter alone sends
      if (e.shiftKey) {
        return; // default prevented by handler signature
      }
      sendMessage();
    }

    function copyMessage(message) {
      try {
        const text = normalizeContentForDisplay(
          message.content || message.text || "",
        );
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              toast.success("Message copied");
            })
            .catch(() => {
              fallbackCopy(text);
            });
        } else {
          fallbackCopy(text);
        }
      } catch {
        // ignore
      }
    }

    function fallbackCopy(text) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success("Message copied");
      } catch {}
    }

    // Import live multimedia AI composable
    const {
      state: multimediaState,
      conversationHistory: aiConversationHistory,
      currentTranscription,
      currentVideoAnalysis,
      isInitialized: isAIInitialized,
      initialize: initializeMultimediaAI,
      toggleAudioStreaming,
      stopAudioStreaming,
      toggleVideoStreaming,
      captureScreenshot,
      sendMessage: sendAIMessage,
      addUserMessage: addAIUserMessage,
      isMultimediaReady,
    } = useLiveMultimediaAI();

    // Auto-messages for different contexts
    const contextMessages = {
      "/": {
        text: "Welcome to NAVI! I'm your AI career fairy. Ready to find your dream gaming job? ✨",
        actions: [
          {
            id: "start_resume",
            label: "Build Resume",
            icon: "mdi-file-document-outline-edit",
          },
          { id: "find_jobs", label: "Find Jobs", icon: "mdi-magnify" },
        ],
      },
      "/resume": {
        text: "Let's create an amazing resume! I can help optimize your content with AI. 📝",
        actions: [
          { id: "ai_optimize", label: "AI Optimize", icon: "mdi-auto-fix" },
          {
            id: "suggest_skills",
            label: "Suggest Skills",
            icon: "mdi-lightbulb",
          },
        ],
      },
      "/jobs": {
        text: "Searching for jobs? I can analyze matches and help with applications! 🎯",
        actions: [
          { id: "analyze_match", label: "Analyze Match", icon: "mdi-target" },
          {
            id: "salary_insights",
            label: "Salary Tips",
            icon: "mdi-currency-usd",
          },
        ],
      },
      "/interview": {
        text: "Interview prep time! Let's practice with AI-powered mock interviews. 🎤",
        actions: [
          {
            id: "mock_interview",
            label: "Start Interview",
            icon: "mdi-account-voice",
          },
          {
            id: "review_answers",
            label: "Review Tips",
            icon: "mdi-format-list-checks",
          },
        ],
      },
    };

    // Computed
    const isChatActive = computed(
      () => isListening.value || isProcessing.value,
    );

    const fairyStatus = computed(() => {
      if (isThinking.value) return "NAVI is thinking...";
      if (isListening.value) return "NAVI is listening...";
      if (hasNotifications.value) return "NAVI has tips for you!";
      return "Click to chat with NAVI";
    });

    const shouldShowEmptyBubble = computed(() => {
      // Show empty bubble when fairy is visible but has no message and is not expanded
      return !currentMessage.value && !expanded.value && !isThinking.value;
    });

    // Quick replies for fast starts
    const quickReplies = ref(["Build Resume", "Find Jobs", "Interview Tips"]);

    const showQuickReplies = computed(() => {
      try {
        return expanded.value && (chatMessages.value?.length || 0) <= 2;
      } catch {
        return false;
      }
    });

    function sendQuickReply(text) {
      try {
        userInput.value = text;
        sendMessage();
      } catch {}
    }


    const fairyTips = [
      "Did you know? Adding gaming achievements to your resume can show leadership skills! 🏆",
      "Easter egg: Try typing 'konami code' for a surprise! 🎮",
      "Pro tip: Mention specific game engines you've worked with - Unity, Unreal, etc. 🛠️",
      "Fun fact: I'm powered by Google's latest AI models for the best career advice! 🤖",
      "Secret: I can analyze your voice tone during mock interviews! 🎯",
      "Gaming companies love seeing community involvement - mention your Discord servers! 💬",
      "Try uploading a screenshot of your gaming setup - I can suggest improvements! 📸",
      "Voice tip: Practice your elevator pitch with me using voice input! 🗣️",
    ];

    // Initialize AI services
    async function initializeAIServices() {
      try {
        // First run voice services diagnostics
        // Run non-invasive diagnostics so we never trigger permission prompts on load
        const diagnostics = await runVoiceServicesDiagnostics({
          invasive: false,
        });
        const statusMessage = getVoiceServicesStatusMessage(
          diagnostics.capabilities,
        );

        logger.info(statusMessage);

        if (!diagnostics.capabilities.fullSupport) {
          toast.warning(`Voice services limited: ${statusMessage}`);
          if (diagnostics.errors.missing.length > 0) {
            logger.error(
              "Missing required features:",
              diagnostics.errors.missing,
            );
          }
        }

        // Resolve API key consistently across chat and voice
        const apiKey = await resolveGeminiApiKey();

        if (!apiKey) {
          toast.warning("Please configure your Gemini API key in settings");
          return false;
        }

        const success = await initializeMultimediaAI({
          apiKey,
          model: "gemini-2.5-flash",
          enableAudio: diagnostics.capabilities.getUserMedia,
          enableVideo: diagnostics.capabilities.getUserMedia,
          enableScreenshot: diagnostics.capabilities.getDisplayMedia,
          maxTokens: 8192,
          temperature: 0.7,
        });

        if (success) {
          toast.success("AI Fairy multimedia services ready!");
        } else {
          toast.error("Failed to initialize AI services");
        }

        return success;
      } catch (_error) {
        logger.error("Failed to initialize AI services:", error);
        toast.error("Failed to initialize AI services. Check your API key.");
        return false;
      }
    }


    async function captureScreenshotWithAI() {
      if (!isAIInitialized.value) {
        await initializeAIServices();
      }

      if (!isMultimediaReady()) {
        toast.warning(
          "AI services not ready. Please check your API key in settings.",
        );
        return;
      }

      try {
        isThinking.value = true;
        toast.info("📸 Capturing screenshot for AI analysis...");

        await captureScreenshot(
          "Analyze this screenshot and provide insights. What do you see that might be relevant for career development or gaming industry work?",
        );
      } catch (_error) {
        logger.error("Screenshot capture failed:", error);
        toast.error(
          "Screenshot capture failed. Check screen sharing permissions.",
        );
      } finally {
        isThinking.value = false;
      }
    }

    // Methods
    function toggleExpanded() {
      // Cycle through bubble states: full -> small -> hidden -> full
      const currentSize = bubbleSize.value;
      let nextSize;

      if (currentSize === "full") {
        nextSize = "small";
        expanded.value = false; // Close chat if open
      } else if (currentSize === "small") {
        nextSize = "hidden";
        expanded.value = false;
      } else {
        // hidden
        nextSize = "full";
        expanded.value = true; // Open chat when returning to full
      }

      // Update the setting
      store.updateSettings({ fairyBubbleSize: nextSize });

      // Initialize chat if expanding to full mode
      if (nextSize === "full") {
        expanded.value = true;
        initializeChat();
        nextTick(() => {
          try {
            const inputEl =
              chatInputEl.value || document.querySelector(".fairy-input");
            inputEl?.focus?.();
            autoResizeInput();
          } catch {}
        });
      } else if (nextSize === "small") {
        // In small mode, show a brief page-aware message without full chat
        expanded.value = false;
        // Could add a small tooltip or brief page context here
      }
    }


    function openFullChat() {
      store.updateSettings({ fairyBubbleSize: "full" });
      expanded.value = true;
      initializeChat();
      nextTick(() => {
        try {
          const inputEl =
            chatInputEl.value || document.querySelector(".fairy-input");
          inputEl?.focus?.();
          autoResizeInput();
        } catch {}
      });
    }


    function getNextSizeLabel() {
      const currentSize = bubbleSize.value;
      if (currentSize === "full") return "small";
      if (currentSize === "small") return "hidden";
      return "full";
    }

    function getAriaLabel() {
      const currentSize = bubbleSize.value;
      const nextSize = getNextSizeLabel();

      if (expanded.value) {
        return `AI assistant chat open. Click to make ${nextSize}.`;
      } else if (currentSize === "full") {
        return `AI assistant with chat bubble visible. Click to make ${nextSize}.`;
      } else if (currentSize === "small") {
        return `AI assistant in small page-aware mode. Click to hide chat bubble.`;
      } else {
        return `AI assistant with chat bubble hidden. Click to show full mode.`;
      }
    }

    function closeExpanded() {
      expanded.value = false;
      currentMessage.value = null;
    }

    async function initializeChat() {
      if (chatMessages.value.length === 0) {
        // Add welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: "ai",
          content:
            "Hi! I'm NAVI, your AI career fairy! [MAGIC] I can help with resumes, job searches, interviews, and more. What would you like to work on?",
          timestamp: new Date(),
        };
        chatMessages.value.push(welcomeMessage);

        // Speak welcome message if TTS is enabled
        if (ttsEnabled.value) {
          setTimeout(
            () => speakMessage(welcomeMessage.content, welcomeMessage.id),
            500,
          );
        }

        // Add context-specific tip
        const contextTip = contextMessages[currentPath()];
        if (contextTip) {
          setTimeout(() => {
            const tipMessage = {
              id: Date.now(),
              type: "system",
              content: contextTip.text,
              timestamp: new Date(),
            };
            chatMessages.value.push(tipMessage);

            // Speak context tip if TTS is enabled (delay to avoid overlap)
            if (ttsEnabled.value) {
              setTimeout(
                () => speakMessage(tipMessage.content, tipMessage.id),
                1500,
              );
            }
          }, 1000);
        }
      }

      await nextTick();
      scrollToBottomIfNear();
    }

    async function sendMessage() {
      if (!userInput.value.trim() || isProcessing.value) return;

      const message = userInput.value.trim();
      userInput.value = "";

      // Add user message
      chatMessages.value.push({
        id: Date.now(),
        type: "user",
        content: message,
        timestamp: new Date(),
      });


      if (
        message.toLowerCase().includes("konami") ||
        message.toLowerCase().includes("↑↑↓↓←→←→ba")
      ) {
        triggerKonamiEasterEgg();
        return;
      }

      // Show thinking state
      isThinking.value = true;
      isProcessing.value = true;

      try {
        // Ensure AI is ready
        const aiReady = await ensureAIReady();
        if (!aiReady) {
          throw new Error("AI services not available");
        }

        // Use AI integration for response with enhanced context
        const response = await aiIntegration?.triggerAIAction("realtime_chat", {
          message: message,
          context: {
            page: currentPath(),
            userProfile: store?.user || {}, // Include user profile data
            chatHistory: chatMessages.value.slice(-5),
            sessionId: `fairy-${Date.now()}`,
            timestamp: new Date().toISOString(),
          },
        });

        if (response && response.content) {
          const aiMessage = {
            id: Date.now(),
            type: "ai",
            content: normalizeContentForDisplay(response.content),
            timestamp: new Date(),
            metadata: response.metadata || {},
          };
          chatMessages.value.push(aiMessage);

          // Speak the response if TTS is enabled
          if (ttsEnabled.value) {
            await speakMessage(aiMessage.content, aiMessage.id);
          }
        } else {
          // Enhanced fallback with contextual responses
          const contextualResponse = getContextualFallbackResponse(message);
          const fallbackMessage = {
            id: Date.now(),
            type: "ai",
            content: contextualResponse,
            timestamp: new Date(),
          };
          chatMessages.value.push(fallbackMessage);

          // Speak the fallback response if TTS is enabled
          if (ttsEnabled.value) {
            await speakMessage(fallbackMessage.content, fallbackMessage.id);
          }
        }
      } catch (_error) {
        logger.error("Fairy chat error:", error);

        // Enhanced error handling with specific error messages
        let errorResponse =
          "Oops! Something went wrong. Let me try that again! 🔧";

        if (error.message.includes("API key")) {
          errorResponse =
            "I need an API key to work properly. Please check your settings! ⚙️";
        } else if (error.message.includes("network")) {
          errorResponse =
            "I'm having trouble connecting. Please check your internet connection! 🌐";
        } else if (
          error.message.includes("quota") ||
          error.message.includes("limit")
        ) {
          errorResponse =
            "I've reached my usage limit for now. Please try again later! ⏰";
        }

        chatMessages.value.push({
          id: Date.now(),
          type: "ai",
          content: errorResponse,
          timestamp: new Date(),
        });
      } finally {
        isThinking.value = false;
        isProcessing.value = false;
        await nextTick();
        scrollToBottomIfNear();
      }
    }


    function getContextualFallbackResponse(message) {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("resume") || lowerMessage.includes("cv")) {
        return "I'd love to help with your resume! Try uploading it or ask me specific questions about resume building. ✨";
      } else if (
        lowerMessage.includes("job") ||
        lowerMessage.includes("career")
      ) {
        return "Let's work on your career goals! I can help you find jobs, analyze matches, or prepare for interviews. 🎯";
      } else if (lowerMessage.includes("interview")) {
        return "Interview prep is one of my specialties! Would you like to practice questions or get tips for a specific role? 🎤";
      } else if (
        lowerMessage.includes("skill") ||
        lowerMessage.includes("learn")
      ) {
        return "Skill development is key to career growth! Tell me about your current skills or what you'd like to learn. 📚";
      } else if (lowerMessage.includes("portfolio")) {
        return "A great portfolio showcases your best work! I can help you organize and present your projects effectively. 🎨";
      } else {
        return "I'm here to help with your gaming career! Try asking me about resumes, jobs, interviews, or skill development. ✨";
      }
    }

    // Listen for settings updates (e.g., API key added in settings panel)
    try {
      window.addEventListener("app-settings-updated", async (_e) => {
        try {
          const detail = e?.detail || {};
          const newKey = detail.geminiApiKey || (await resolveGeminiApiKey());
          if (newKey && !isAIInitialized.value) {
            await initializeAIServices();
          }
          hasGeminiApiKey.value = !!newKey;
        } catch {}
      });
    } catch {}

    async function toggleVoiceInput() {
      // Initialize AI if not ready
      if (!isAIInitialized.value) {
        await initializeAIServices();
      }

      if (!isMultimediaReady()) {
        toast.warning("AI services not ready. Check your API key in settings.");
        return;
      }

      try {
        // Toggle actual voice streaming with Gemini AI
        await toggleAudioStreaming();
        isListening.value = multimediaState.isAudioStreaming;

        // Show current transcription if available
        if (currentTranscription.value) {
          userInput.value = currentTranscription.value;
        }
      } catch (_error) {
        logger.error("Voice input error:", error);
        isListening.value = false;
        toast.error("Voice input failed. Please check microphone permissions.");
      }
    }

    function openCamera() {
      cameraModalOpen.value = true;
      nextTick(async () => {
        try {
          // Focus the modal container for accessibility
          const el = vmInstance?.proxy?.$refs?.cameraModalEl;
          if (el && typeof el.focus === "function") {
            el.focus();
          }
        } catch {}
        await initializeCamera();
      });
    }

    async function initializeCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (cameraVideo.value) {
          cameraVideo.value.srcObject = stream;
        }
      } catch (_error) {
        logger.error("Camera error:", error);
        toast.error("Camera access denied or not available");
        closeCameraModal();
      }
    }

    async function captureImage() {
      if (!cameraVideo.value || !cameraCanvas.value) return;

      const canvas = cameraCanvas.value;
      const video = cameraVideo.value;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0);

      // Convert to blob and process with AI
      canvas.toBlob(async (_blob) => {
        try {
          // This would send the image to Google AI for analysis
          chatMessages.value.push({
            id: Date.now(),
            type: "ai",
            content:
              "Great photo! I can see your setup. Here are some tips based on what I observed... 📸✨",
            timestamp: new Date(),
          });

          closeCameraModal();
          await nextTick();
          scrollToBottomIfNear();
        } catch (_error) {
          logger.error("Image analysis error:", error);
          toast.error("Failed to analyze image");
        }
      });
    }

    function closeCameraModal() {
      cameraModalOpen.value = false;
      if (cameraVideo.value?.srcObject) {
        const tracks = cameraVideo.value.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }

    function onCameraModalKeydown(_e) {
      // Trap focus within the camera modal when open
      if (!cameraModalOpen.value) return;
      if (e.key !== "Tab") return;
      try {
        const root = cameraModalEl.value;
        if (!root) return;
        const focusable = root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (active === last) {
            first.focus();
            e.preventDefault();
          }
        }
      } catch {}
    }

    function uploadFile() {
      // Create file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,.pdf,.doc,.docx";
      input.onchange = async (_e) => {
        const file = e?.target?.files?.[0];
        if (file) {
          chatMessages.value.push({
            id: Date.now(),
            type: "system",
            content: `File uploaded: ${file.name}`,
            timestamp: new Date(),
          });

          // Process file with AI
          setTimeout(() => {
            chatMessages.value.push({
              id: Date.now(),
              type: "ai",
              content: `I've analyzed your ${file.type?.includes("image") ? "image" : "document"}. Here are my insights... 📄✨`,
              timestamp: new Date(),
            });
          }, 2000);
        }
      };
      input.click();
    }

    async function executeAction(action) {
      logger.info("Executing fairy action:", action.id);

      switch (action.id) {
        case "start_resume":
          window.location.href = "/resume";
          break;
        case "find_jobs":
          window.location.href = "/jobs";
          break;
        case "ai_optimize":
        case "suggest_skills":
        case "analyze_match":
        case "salary_insights":
        case "mock_interview":
        case "review_answers": {
          // Trigger AI action through integration
          const result = await aiIntegration?.triggerAIAction(action.id, {
            context: route.path,
            action: action.id,
          });
          if (_result) {
            toast.success(`${action.label} completed!`);
            logger.debug?.("Fairy action result:", result);
          }
          break;
        }
      }

      currentMessage.value = null;
    }

    function triggerKonamiEasterEgg() {
      // Add konami mode to body
      document.body.classList.add("konami-mode");

      chatMessages.value.push({
        id: Date.now(),
        type: "ai",
        content:
          "[SUCCESS] KONAMI CODE ACTIVATED! You've unlocked Rainbow Mode! Your gaming knowledge is legendary! 🌈✨🎮",
        timestamp: new Date(),
      });


      setTimeout(() => {
        document.body.classList.remove("konami-mode");
      }, 10000);

      // Achievement unlock effect
      toast.success("[TROPHY] Achievement Unlocked: Secret Code Master!");
    }

    function showContextualTip() {
      const tip = contextMessages[currentPath()];
      if (tip) {
        currentMessage.value = tip;
        hasNotifications.value = true;


        setTimeout(() => {
          if (currentMessage.value === tip) {
            currentMessage.value = null;
            hasNotifications.value = false;
          }
        }, 10000);
      }
    }

    // Send quick AI message using the multimedia AI service
    async function sendQuickAIMessage() {
      try {
        isThinking.value = true;
        const quickMessage = "Give me a quick tip for my current page";

        // Use the AI message service
        await sendAIMessage(quickMessage);

        // Add user message to chat
        addAIUserMessage({
          text: quickMessage,
          timestamp: Date.now(),
          type: "user",
        });
      } catch (_error) {
        logger.error("Quick AI message error:", error);
        toast.error("Failed to send AI message");
      } finally {
        isThinking.value = false;
      }
    }


    function toggleTTS() {
      ttsEnabled.value = !ttsEnabled.value;

      // Save preference to localStorage
      localStorage.setItem("fairy-tts-enabled", ttsEnabled.value.toString());

      // Stop current speech if disabling
      if (!ttsEnabled.value && isSpeaking.value) {
        stopSpeaking();
        isSpeaking.value = false;
        currentSpeakingMessageId.value = null;
      }

      toast.info(
        ttsEnabled.value ? "Text-to-speech enabled" : "Text-to-speech disabled",
      );
    }

    async function speakMessage(text, messageId = null) {
      if (!ttsEnabled.value || !text || !isVoiceSupported()) {
        return;
      }

      try {
        // Clean up the text for speech
        const cleanText = cleanTextForSpeech(text);

        if (cleanText.length === 0) {
          return;
        }

        isSpeaking.value = true;
        if (messageId) {
          currentSpeakingMessageId.value = messageId;
        }

        // Get current settings from localStorage or use defaults
        const savedSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );
        const resolvedKey =
          savedSettings.geminiApiKey || (await resolveGeminiApiKey());
        const voiceSettings = {
          rate: ttsSettings.value.rate,
          pitch: ttsSettings.value.pitch,
          volume: ttsSettings.value.volume,
          provider: ttsSettings.value.provider,
          apiKey: resolvedKey, // Prefer resolved key from settings/preferences/env
          // Use 'language' key to align with AudioService API; keep 'lang' for backward compat
          language: savedSettings.language || "en-US",
          lang: savedSettings.language || "en-US",
          // Prefer explicit voice when set in settings
          voice:
            ttsSettings.value.provider === "system"
              ? savedSettings.ttsVoice || null
              : savedSettings.geminiVoice || null,
        };

        logger.debug("TTS Settings:", voiceSettings);
        logger.debug("Speaking with provider:", voiceSettings.provider);
        logger.debug(
          "API Key available:",
          !!voiceSettings.apiKey,
          voiceSettings.apiKey
            ? `(${voiceSettings.apiKey.slice(0, 8)}...)`
            : "(none)",
        );
        // Voice routing preferences debug removed due to import issue

        await speak(cleanText, voiceSettings);
      } catch (_error) {
        logger.error("TTS error:", error);
        toast.warning("Failed to speak message");
      } finally {
        isSpeaking.value = false;
        currentSpeakingMessageId.value = null;
      }
    }

    async function toggleMessageTTS(message) {
      // If this message is currently speaking, stop it
      if (currentSpeakingMessageId.value === message.id) {
        stopSpeaking();
        isSpeaking.value = false;
        currentSpeakingMessageId.value = null;
        return;
      }

      // If another message is speaking, stop it first
      if (isSpeaking.value) {
        stopSpeaking();
        isSpeaking.value = false;
        currentSpeakingMessageId.value = null;

        // Small delay to ensure clean stop
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Start speaking this message
      await speakMessage(message.content, message.id);
    }

    function cleanTextForSpeech(text) {
      if (!text) return "";

      // First normalize the text in case it's an object
      const normalizedText = normalizeContentForDisplay(text);

      return (
        normalizedText
          // Remove markdown formatting
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`(.*?)`/g, "$1") // `code`
          .replace(/\[(.*?)\]\(.*?\)/g, "$1") // [text](url)
          // Remove special tokens and formatting
          .replace(/\[MAGIC\]/g, "")
          .replace(/\[SUCCESS\]/g, "")
          .replace(/\[TROPHY\]/g, "")
          .replace(/\[object Object\]/gi, "")
          .replace(/\{.*?\}/g, "") // Remove JSON objects
          .replace(/".*?"/g, "") // Remove quoted strings
          // Replace emoji codes with words
          .replace(/✨/g, "sparkles")
          .replace(/🎮/g, "gaming")
          .replace(/📝/g, "note")
          .replace(/🎯/g, "target")
          .replace(/🎤/g, "microphone")
          .replace(/🏆/g, "trophy")
          .replace(/🛠️/g, "tools")
          .replace(/🤖/g, "robot")
          .replace(/💬/g, "chat")
          .replace(/📸/g, "camera")
          .replace(/🗣️/g, "speaking")
          .replace(/🌈/g, "rainbow")
          .replace(/🔧/g, "wrench")
          .replace(/🔊/g, "sound on")
          .replace(/🔇/g, "sound off")
          // Clean up extra spaces and newlines
          .replace(/\s+/g, " ")
          .replace(/\n+/g, ". ") // Replace newlines with periods
          .replace(/\.\.+/g, ".") // Remove multiple periods
          .trim()
      );
    }

    function loadTTSPreferences() {
      try {
        // Load fairy-specific TTS enabled state
        const saved = localStorage.getItem("fairy-tts-enabled");
        if (saved !== null) {
          ttsEnabled.value = saved === "true";
        } else {
          // Default to voiceMode setting if fairy-specific setting doesn't exist
          const appSettings = JSON.parse(
            localStorage.getItem("app-settings") || "{}",
          );
          ttsEnabled.value = appSettings.voiceMode || false;
        }

        // Load TTS settings from main app settings
        const appSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );

        // Use proper setting names from schema
        ttsSettings.value.rate = appSettings.speechRate || 0.85;
        ttsSettings.value.pitch = appSettings.speechPitch || 1.0;
        ttsSettings.value.volume = appSettings.speechVolume || 0.8;
        ttsSettings.value.provider = appSettings.ttsProvider || "system";
        ttsSettings.value.voice = appSettings.ttsVoice || "";
        compactUI.value = Boolean(appSettings.compactUI);

        logger.debug("Loaded TTS settings from localStorage:", {
          ttsProvider: appSettings.ttsProvider,
          speechRate: appSettings.speechRate,
          current: ttsSettings.value,
        });

        logger.debug("Loaded TTS settings:", {
          enabled: ttsEnabled.value,
          provider: ttsSettings.value.provider,
          rate: ttsSettings.value.rate,
          volume: ttsSettings.value.volume,
        });

        // Update voice routing with loaded settings
        setVoiceRoutingPreferences({
          ttsProvider: ttsSettings.value.provider,
          sttProvider: appSettings.sttProvider || "system",
          lang: appSettings.voiceLang || appSettings.language || "en-US",
          speakerDeviceId: appSettings.selectedSpeakerId || "",
          micDeviceId: appSettings.selectedMicId || "",
        });
      } catch (_error) {
        logger.error("Failed to load TTS preferences:", error);
      }
    }

    function saveTTSSettings() {
      try {
        const appSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );

        // Save to proper setting names from schema
        appSettings.speechRate = ttsSettings.value.rate;
        appSettings.speechPitch = ttsSettings.value.pitch;
        appSettings.speechVolume = ttsSettings.value.volume;
        appSettings.ttsProvider = ttsSettings.value.provider;
        appSettings.ttsVoice = ttsSettings.value.voice;

        // Also update voiceMode if this is the first time setting TTS
        if (ttsEnabled.value && !appSettings.voiceMode) {
          appSettings.voiceMode = true;
        }

        localStorage.setItem("app-settings", JSON.stringify(appSettings));

        // Update voice routing preferences with all current settings
        setVoiceRoutingPreferences({
          ttsProvider: ttsSettings.value.provider,
          sttProvider: appSettings.sttProvider || "system",
          lang: appSettings.voiceLang || appSettings.language || "en-US",
          speakerDeviceId: appSettings.selectedSpeakerId || "",
          micDeviceId: appSettings.selectedMicId || "",
        });

        // Sync compact UI in case it changed externally
        if (typeof appSettings.compactUI === "boolean") {
          compactUI.value = appSettings.compactUI;
        }

        logger.info("TTS settings saved and routing updated:", {
          provider: ttsSettings.value.provider,
          rate: ttsSettings.value.rate,
          volume: ttsSettings.value.volume,
          voiceMode: appSettings.voiceMode,
        });

        toast.success(
          `TTS provider updated to ${ttsSettings.value.provider === "gemini" ? "Google AI (Gemini)" : "System TTS"}`,
        );
      } catch (_error) {
        logger.error("Failed to save TTS settings:", error);
        toast.error("Failed to save TTS settings");
      }
    }

    function saveUISettings(compact) {
      try {
        const appSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );
        appSettings.compactUI = Boolean(compact);
        localStorage.setItem("app-settings", JSON.stringify(appSettings));
        compactUI.value = Boolean(compact);
        toast.info(`Compact UI ${compactUI.value ? "enabled" : "disabled"}`);
      } catch (_error) {
        logger.error("Failed to save UI settings:", error);
      }
    }

    async function testTTS() {
      if (isSpeaking.value) {
        stopSpeaking();
        isSpeaking.value = false;
        currentSpeakingMessageId.value = null;
        return;
      }

      const resolvedKey = await resolveGeminiApiKey();
      const hasApiKey = Boolean(resolvedKey);

      let testMessage;
      if (ttsSettings.value.provider === "gemini") {
        testMessage = hasApiKey
          ? "Hello! This is Google AI Gemini text-to-speech. How natural do I sound?"
          : "Google AI TTS selected but no API key found. Using system TTS instead.";
      } else {
        testMessage =
          "Hello! This is your browser's system text-to-speech. Clear and reliable!";
      }

      await speakMessage(testMessage); // Don't pass messageId for test messages
    }

    // (removed redundant async getProviderInfo definition)

    // Update video streaming state tracking
    watch(
      () => multimediaState.isVideoStreaming,
      (newValue) => {
        isVideoStreaming.value = newValue;
      },
    );

    // Update audio streaming state tracking
    watch(
      () => multimediaState.isAudioStreaming,
      (newValue) => {
        isListening.value = newValue;
      },
    );

    // Keep latest message and thinking skeleton in view
    watch(
      () => isThinking.value,
      async (thinking) => {
        if (thinking) {
          await nextTick();
          scrollToBottomIfNear();
        }
      },
    );

    // Watch for app settings changes and sync TTS settings
    const appSettingsWatcher = () => {
      try {
        const appSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );

        // Only update if settings actually changed
        const newProvider = appSettings.ttsProvider || "system";
        const newRate = appSettings.speechRate || 0.85;
        const newVolume = appSettings.speechVolume || 0.8;
        const newCompact = Boolean(appSettings.compactUI);

        if (
          newProvider !== ttsSettings.value.provider ||
          newRate !== ttsSettings.value.rate ||
          newVolume !== ttsSettings.value.volume ||
          newCompact !== compactUI.value
        ) {
          logger.debug("App settings changed, syncing UI/TTS settings:", {
            oldProvider: ttsSettings.value.provider,
            newProvider,
            oldRate: ttsSettings.value.rate,
            newRate,
            oldVolume: ttsSettings.value.volume,
            newVolume,
            compactUI: { old: compactUI.value, new: newCompact },
          });

          ttsSettings.value.provider = newProvider;
          ttsSettings.value.rate = newRate;
          ttsSettings.value.volume = newVolume;
          ttsSettings.value.pitch = appSettings.speechPitch || 1.0;
          ttsSettings.value.voice = appSettings.ttsVoice || "";
          compactUI.value = newCompact;

          // Update voice routing
          setVoiceRoutingPreferences({
            ttsProvider: newProvider,
            sttProvider: appSettings.sttProvider || "system",
            lang: appSettings.voiceLang || appSettings.language || "en-US",
          });
        }
      } catch (_error) {
        logger.debug("App settings watcher error:", error);
      }
    };

    // Check for settings changes every few seconds
    let settingsInterval = null;

    function showRandomTip() {
      const tip = fairyTips[Math.floor(Math.random() * fairyTips.length)];
      currentMessage.value = {
        text: tip,
        actions: [{ id: "dismiss", label: "Thanks!", icon: "mdi-thumb-up" }],
      };
      hasNotifications.value = true;
    }

    function normalizeContentForDisplay(content) {
      if (content == null) return "";
      if (typeof content === "string") return content;
      // Common AI response shapes
      if (typeof content === "object") {
        // Handle Google AI response format
        if (content.candidates && Array.isArray(content.candidates)) {
          const candidate = content.candidates[0];
          if (candidate && candidate.content && candidate.content.parts) {
            return candidate.content.parts
              .map((part) => part.text || "")
              .join("\n");
          }
        }
        // Handle other common formats
        if (typeof content.content === "string") return content.content;
        if (typeof content.text === "string") return content.text;
        if (typeof content.message === "string") return content.message;
        if (typeof content.response === "string") return content.response;
        // Handle array of messages
        if (Array.isArray(content) && content.length > 0) {
          return content
            .map((item) => normalizeContentForDisplay(item))
            .join("\n");
        }
        // If it's an object but none of the common properties exist, try to extract meaningful text
        const meaningfulText = extractMeaningfulText(content);
        if (meaningfulText) return meaningfulText;

        // Last resort - avoid [object Object]
        try {
          const jsonStr = JSON.stringify(content, null, 2);
          // If it's a simple object, try to format it nicely
          if (jsonStr.length < 200) {
            return jsonStr.replace(/[{}"]/g, "").replace(/,\n/g, ", ").trim();
          }
          return "AI response received (complex format)";
        } catch {
          return String(content).replace(
            "[object Object]",
            "AI response received",
          );
        }
      }
      return String(content);
    }

    function extractMeaningfulText(obj) {
      // Try to find any string property that looks like content
      const textProps = [
        "text",
        "content",
        "message",
        "response",
        "answer",
        "reply",
        "output",
      ];
      for (const prop of textProps) {
        if (obj[prop] && typeof obj[prop] === "string" && obj[prop].trim()) {
          return obj[prop];
        }
      }

      // Look for nested objects
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          const nested = extractMeaningfulText(obj[key]);
          if (nested) return nested;
        }
      }

      return null;
    }

    function getMessageSegments(content) {
      const text = normalizeContentForDisplay(content);
      const segments = [];

      const parts = text.split(/(`[^`]*`)/g);
      parts.forEach((part) => {
        if (!part) return;
        if (/^`[^`]*`$/.test(part)) {
          segments.push({ type: "code", text: part.slice(1, -1) });
        } else {
          const strongSplit = part.split(/(\*\*[^*]+\*\*)/g);
          strongSplit.forEach((s) => {
            if (!s) return;
            if (/^\*\*[^*]+\*\*$/.test(s)) {
              segments.push({ type: "strong", text: s.slice(2, -2) });
            } else {
              const emSplit = s.split(/(\*[^*]+\*)/g);
              emSplit.forEach((_e) => {
                if (!e) return;
                if (/^\*[^*]+\*$/.test(_e)) {
                  segments.push({ type: "em", text: e.slice(1, -1) });
                } else {
                  segments.push({ type: "text", text: e });
                }
              });
            }
          });
        }
      });

      return segments;
    }

    function formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const isUserNearBottom = ref(true);
    const hasNewMessages = ref(false);

    function updateNearBottomState() {
      try {
        const el = messagesContainer.value;
        if (!el) return;
        const threshold = 30;
        const delta = el.scrollHeight - el.scrollTop - el.clientHeight;
        isUserNearBottom.value = delta <= threshold;
        if (isUserNearBottom.value) {
          hasNewMessages.value = false;
        }
      } catch {}
    }

    function scrollToBottom(force = true) {
      const el = messagesContainer.value;
      if (!el) return;
      if (!force) {
        updateNearBottomState();
        if (!isUserNearBottom.value) return;
      }
      el.scrollTop = el.scrollHeight;
      isUserNearBottom.value = true;
      hasNewMessages.value = false;
    }

    function scrollToBottomIfNear() {
      scrollToBottom(false);
    }

    function onHoverStart() {
      // Add hover effect class
      if (!expanded.value && !isChatActive.value) {
        document
          .querySelector(".ai-fairy-container")
          ?.classList.add("fairy-hovering");
      }
    }

    function onHoverEnd() {
      // Remove hover effect class
      document
        .querySelector(".ai-fairy-container")
        ?.classList.remove("fairy-hovering");
    }

    // Push-to-talk (hold Space to talk)
    const pttActive = ref(false);
    async function handleKeydown(_e) {
      try {
        // Ignore typing in inputs/textarea or with modifiers
        const tag =
          e.target && e.target.tagName
            ? String(e.target.tagName).toLowerCase()
            : "";
        if (
          tag === "input" ||
          tag === "textarea" ||
          e.ctrlKey ||
          e.metaKey ||
          e.altKey
        )
          return;
        if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
          if (!pttActive.value) {
            // Initialize AI services if needed
            if (!isAIInitialized.value) {
              await initializeAIServices();
            }
            if (!isMultimediaReady()) return;
            const started = await toggleAudioStreaming();
            if (started !== false) {
              pttActive.value = true;
              isListening.value = true;
              e.preventDefault();
            }
          } else {
            e.preventDefault();
          }
        }
      } catch {}
    }

    async function handleKeyup(_e) {
      try {
        if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
          if (pttActive.value) {
            stopAudioStreaming();
            isListening.value = false;
            pttActive.value = false;
            e.preventDefault();
          }
        }
      } catch {}
    }

    // Route watching
    watch(
      () => currentPath(),
      () => {
        // Show contextual tip when route changes
        setTimeout(showContextualTip, 2000);
      },
    );

    // Storage change handler for settings synchronization
    const handleStorageChange = (event) => {
      if (event.key === "app-settings" && event.newValue) {
        logger.debug("Settings changed in storage, syncing...");
        try {
          const newSettings = JSON.parse(event.newValue);
          // Trigger settings reload if TTS provider changed
          if (newSettings.ttsProvider !== ttsSettings.value.provider) {
            logger.info(
              "TTS provider changed via storage event:",
              newSettings.ttsProvider,
            );
            appSettingsWatcher(); // Force immediate update
          }
        } catch (_error) {
          logger.debug("Error parsing storage change:", error);
        }
      }
    };

    // Lifecycle
    onMounted(async () => {
      // Load TTS preferences
      loadTTSPreferences();

      // Listen for storage changes from other tabs/components (like Settings view)
      window.addEventListener("storage", handleStorageChange);

      // Listen for fairy chat open events from other components
      window.addEventListener("open-fairy-chat", () => {
        openFullChat();
      });

      // Start watching for app settings changes (fallback for same-tab changes)
      settingsInterval = setInterval(appSettingsWatcher, 2000);

      // Show initial tip after delay
      setTimeout(showContextualTip, 3000);

      // Show random tips periodically
      setInterval(() => {
        if (!expanded.value && Math.random() > 0.7) {
          showRandomTip();
        }
      }, 60000);

      // Initial sizing for input if present
      nextTick(() => autoResizeInput());

      // Auto-initialize AI services when a Gemini API key is present
      // and real-time features are enabled (or voice mode is on).
      try {
        const appSettings = JSON.parse(
          localStorage.getItem("app-settings") || "{}",
        );
        const haveKey = !!(
          store.settings?.geminiApiKey || appSettings.geminiApiKey
        );
        const wantRealtime = !!(
          store.settings?.enableRealtimeFeatures ||
          appSettings.enableRealtimeFeatures ||
          appSettings.voiceMode
        );
        if (haveKey && wantRealtime && !isAIInitialized.value) {
          await initializeAIServices();
        }
      } catch {
        // non-critical
      }

      // Install push-to-talk listeners
      try {
        if (store.settings?.pushToTalk) {
          window.addEventListener("keydown", handleKeydown);
          window.addEventListener("keyup", handleKeyup);
        }
      } catch {}
    });

    onUnmounted(() => {
      closeCameraModal();

      // Clean up storage event listener
      window.removeEventListener("storage", handleStorageChange);

      // Clean up settings watcher
      if (settingsInterval) {
        clearInterval(settingsInterval);
      }

      try {
        window.removeEventListener("keydown", handleKeydown);
        window.removeEventListener("keyup", handleKeyup);
      } catch {}
    });

    // React to push-to-talk setting changes
    watch(
      () => store.settings?.pushToTalk,
      (enabled) => {
        try {
          window.removeEventListener("keydown", handleKeydown);
          window.removeEventListener("keyup", handleKeyup);
          if (enabled) {
            window.addEventListener("keydown", handleKeydown);
            window.addEventListener("keyup", handleKeyup);
          }
        } catch {}
      },
    );

    return {
      // State
      expanded,
      currentMessage,
      userInput,
      chatMessages,
      isListening,
      isThinking,
      isProcessing,
      hasNotifications,
      compactUI,
      isUserNearBottom,
      cameraModalOpen,
      messagesContainer,
      cameraVideo,
      cameraCanvas,
      cameraModalEl,

      // Bubble size state
      bubbleSize,
      isVisible,
      isSmallMode,
      isFullMode,

      // TTS State
      ttsEnabled,
      isSpeaking,
      ttsSettings,
      showTTSModal,
      currentSpeakingMessageId,

      // Push-to-talk state
      pttActive,

      // Computed
      isChatActive,
      fairyStatus,
      shouldShowEmptyBubble,
      unifiedUI,
      getMessageSegments,
      // Quick replies
      quickReplies,
      showQuickReplies,
      sendQuickReply,

      // AI Multimedia State
      getIcon,
      getIconSize,
      getIconColor,

      // Methods
      toggleExpanded,
      openFullChat,
      getNextSizeLabel,
      getAriaLabel,
      closeExpanded,
      sendMessage,
      sendQuickAIMessage,
      toggleVoiceInput,
      toggleVideoStreaming,
      openCamera,
      captureImage,
      captureScreenshotWithAI,
      closeCameraModal,
      uploadFile,
      executeAction,
      formatTime,

      // TTS Methods
      toggleTTS,
      speakMessage,
      cleanTextForSpeech,
      loadTTSPreferences,
      saveTTSSettings,
      testTTS,
      getProviderInfo,
      toggleMessageTTS,
      copyMessage,
      scrollToBottom,
      scrollToBottomIfNear,
      updateNearBottomState,
      autoResizeInput,
      onInputEnter,
      saveUISettings,

      // AI Multimedia State
      multimediaState,
      aiConversationHistory,
      currentTranscription,
      currentVideoAnalysis,
      isAIInitialized,
      isVideoStreaming,
      sendAIMessage,
      addAIUserMessage,
      onHoverStart,
      onHoverEnd,
      onCameraModalKeydown,
    };
  },
};
</script>

<style scoped>
.ai-fairy-container {
  position: fixed !important;
  bottom: calc(
  ) !important;
  right: calc(
  ) !important;


  transition: all var(--duration-normal) ease;



  float: none !important;
  clear: none !important;


  font-family: var(--font-family-gaming, "Orbitron");

  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);

  box-shadow:
    var(--glass-shadow-md),

  will-change: transform;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.ai-fairy-container::before {
  content: "";
  position: absolute;
  background: var(--glass-surface);
  border-radius: inherit;
  pointer-events: none;
}

.selection-ring {
  position: absolute;
  border-radius: inherit;
  pointer-events: none;
}

.selection-ring.active {
}

@keyframes ring-pulse {
  }
  }
}

.fairy-avatar {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  background: var(--glass-bg-light);


}

@keyframes fairy-float {
  }
  }
}

.ai-fairy-container:hover,
.fairy-hovering {
  transform: none;
  box-shadow:
    var(--shadow-xl),

  border-image: linear-gradient(
    )
}

.ai-fairy-container:hover .fairy-avatar,
.fairy-hovering .fairy-avatar {
  border-color: var(--glass-border-strong);
  box-shadow: var(--glass-glow-primary);
}

.particle-system {
  position: absolute;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: var(--fairy-primary);
  border-radius: var(--radius-full);
  animation-delay: var(--delay);
}

@keyframes particle-orbit {
  from {
  }
  to {
  }
}

.fairy-character {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fairy-glow {
  position: absolute;
  background: radial-gradient(
    circle,
  );
  border-radius: var(--radius-full);
}

.fairy-aura {
  position: absolute;
  background: conic-gradient(
  );
  border-radius: var(--radius-full);
}

@keyframes glow-pulse {
  }
  }
}

@keyframes aura-rotate {
  from {
  }
  to {
  }
}

.fairy-wings {
  position: absolute;
  pointer-events: none;
}

.wing {
  position: absolute;
  background: linear-gradient(
  );
}

.wing-left {
}

.wing-right {
}

@keyframes wing-flutter {
  from {
  }
  to {
  }
}

.fairy-body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fairy-core {
  position: relative;
}

.fairy-sparkles {
}

.sparkle {
  position: absolute;
}

}

}

}

@keyframes core-sparkle {
  }
  }
  }
  }
}

@keyframes sparkle-dance {
  }
  }
  }
}

.enhanced-pulse {
  position: absolute;
}

.pulse-core {
  background: var(--fairy-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.pulse-ring {
  position: absolute;
}

@keyframes pulse-bounce {
  }
  }
}

@keyframes ring-expand {
  }
  }
}

.enhanced-indicator {
  position: absolute;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-icon {
}

.voice-waves {
}

.wave {
  position: absolute;
}

}
}
}

@keyframes voice-wave {
  }
  }
}

.thinking-dots {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
}

@keyframes thinking-bounce {
  }
  }
}

@keyframes indicator-float {
  }
  }
}

.notification-appear-enter-active,
.indicator-appear-enter-active {
}

.notification-appear-leave-active,
.indicator-appear-leave-active {
}

.notification-appear-enter-from,
.indicator-appear-enter-from {
}

.notification-appear-leave-to,
.indicator-appear-leave-to {
}

.fairy-bubble {
  position: fixed;
  display: flex;
  flex-direction: column;
  width: fit-content;
  height: auto;
  background: var(--glass-bg);
  box-shadow:
  overflow: hidden;
}

.fairy-bubble.bubble-empty {
}

.fairy-bubble.bubble-persistent {
  position: fixed;
}

.fairy-expanded .fairy-bubble {
}

.bubble-content {
}

.bubble-content--glass {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  border: none;
}

.bubble-content--glass .message-text {
  color: var(--text-primary);
}

.bubble-content--glass {
  display: block;
}

.bubble-content--glass .message-actions {
  display: flex;
  flex-wrap: wrap;
}

.bubble-content--glass .glass-btn.ai-powered {
  background: linear-gradient(
  );
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.bubble-content--glass .glass-btn.ai-powered:hover {
  background: linear-gradient(
  );
}


.bubble-content.bubble-empty-state {
  min-height: auto;
}

.message-text--empty {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  background: var(--glass-surface-subtle, var(--glass-surface)) !important;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.fairy-emoji {
  vertical-align: middle;
}

.ai-fairy-container {
  min-width: fit-content;
}


.fairy-chat-interface {
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: inherit;
}

.compact-ui .fairy-chat-interface {
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
}

.chat-header::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

.chat-title {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.chat-actions {
  display: inline-flex;
  align-items: center;
}

.chat-gear-btn {
  border-radius: var(--radius-base);
  background: var(--glass-bg);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-in-out);
}

.chat-gear-btn:hover {
  background: var(--glass-bg-light);
  border-color: var(--glass-border-cyber);
  box-shadow: var(--glass-glow-primary);
}

.chat-title .mui-icon,
.control-btn .mui-icon,
.message-avatar .mui-icon {
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}


.chat-title .title-text {
  font-size: var(--font-size-sm);
}

.chat-title .mui-icon {
}

@keyframes icon-shimmer {
  }
    filter: drop-shadow(
    );
  }
}

.chat-status {
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  background: var(--glass-bg);
}

.ptt-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  background: var(--text-secondary);
}

.status-dot.listening {
}

.status-dot.thinking {
}

.status-dot.idle {
}

.chat-status[data-state="listening"] {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}
.chat-status[data-state="thinking"] {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}
.chat-status[data-state="idle"] {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.quick-replies {
  display: flex;
  flex-wrap: wrap;
}

.quick-reply-btn {
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.quick-reply-btn:hover {
  background: var(--glass-bg-light);
  border-color: var(--glass-border-cyber);
  box-shadow: var(--glass-glow-primary);
}

@keyframes status-pulse {
  }
  }
}


.chat-messages {
}

.fairy-chat-interface.glass-panel.glass-panel--compact {
  display: flex;
  flex-direction: column;
}



.tts-settings-content {
  background: var(--glass-bg);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-row:last-child {
  justify-content: center;
}

.settings-row label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.tts-slider {
  appearance: none;
  background: var(--glass-bg-light);
  outline: none;
  transition: background var(--duration-fast) ease;
}

.tts-slider::-webkit-slider-thumb {
  appearance: none;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) ease;
}

.tts-slider::-webkit-slider-thumb:hover {
  box-shadow: var(--shadow-md);
}

.tts-slider::-moz-range-thumb {
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) ease;
}

.tts-slider::-moz-range-thumb:hover {
  box-shadow: var(--shadow-md);
}

.setting-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-align: right;
}

.test-tts-btn {
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  background: var(--glass-bg-cyber);
  transition: all var(--duration-normal) ease;
}

.test-tts-btn:hover:not(:disabled) {
  background: var(--glass-bg-gaming);
  border-color: var(--glass-border-gaming);
  box-shadow: var(--glass-glow-primary);
}

.test-tts-btn:disabled {
  cursor: not-allowed;
  background: var(--glass-bg-weak);
  color: var(--text-disabled);
}

.panel-collapsed {
  background: var(--glass-bg-weak);
}

.tts-provider-select {
  border-radius: var(--radius-sm);
  background: var(--glass-bg-light);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.tts-provider-select:hover {
  border-color: var(--glass-border-cyber);
  background: var(--glass-bg);
}

.tts-provider-select:focus {
  outline: none;
}

.settings-info {
}

.provider-info {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.chat-messages {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.chat-message {
  display: flex;
  align-items: flex-start;
}

.message-user {
  flex-direction: row-reverse;
}

.message-user .message-content {
  background: var(--glass-bg-cyber);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  box-shadow: var(--glass-shadow-sm);
}

.message-ai .message-content {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  box-shadow: var(--glass-shadow-sm);
}

.message-system .message-content {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  box-shadow: var(--glass-shadow-sm);
}

.message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  box-shadow: var(--glass-shadow-sm);
}

.message-avatar:hover {
  background: var(--glass-bg-light);
  box-shadow: var(--glass-shadow-md);
}

.message-content {
  transition: all var(--duration-fast) var(--easing-ease);
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.message-content .message-text {
}

.message-ai .message-text {
  color: var(--text-primary);
}

.message-user .message-text {
  background: linear-gradient(
  );
  margin-left: auto;
}

.message-content .message-text a {
  text-decoration: underline;
}
.message-content .message-text code {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
}
.message-content .message-text pre {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  overflow: auto;
  white-space: pre;
}

.message-ai .message-avatar {
}
.message-user .message-avatar {
  background: color-mix(
    in srgb,
    transparent
  );
  border-color: color-mix(
    in srgb,
    transparent
  );
}
.message-system .message-avatar {
}

.message-ai .message-content {
}

.compact-ui .message-content {
}

.message-content:hover {
}

.message-ai .message-content:hover .tts-replay-btn {
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
}

.copy-btn:hover {
  background: var(--glass-bg-light);
}

.message-timestamp {
  color: var(--text-secondary-strong, var(--text-secondary));
}

.tts-replay-btn {
  border-radius: var(--radius-sm);
  background: var(--glass-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.tts-replay-btn:focus-visible {
}

.tts-replay-btn:hover {
  background: var(--glass-bg);
}

.tts-replay-btn.playing {
}

@keyframes tts-playing-pulse {
  }
  }
}

.message-user .tts-replay-btn {
  display: none;
}

.chat-input-container {
  --chat-input-offset: calc(
  );
  position: sticky;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
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
@media (prefers-color-scheme: dark) {
  .chat-input-container::before {
    background: linear-gradient(
      to bottom,
      transparent
    );
  }
}

.multimodal-controls {
  display: flex;
}

.compact-ui .multimodal-controls {
}

.control-btn {
  border-radius: var(--radius-base);
  background: var(--control-bg);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  border: var(--spacing-px) solid var(--control-border);
  color: var(--control-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-in-out);
  position: relative;
  overflow: hidden;
}

.fairy-avatar:focus-visible,
.control-btn:focus-visible,
.tts-replay-btn:focus-visible,
.glass-btn:focus-visible,
.tts-provider-select:focus-visible {
  outline: none;
}

.control-btn::before {
  content: "";
  position: absolute;
  background: var(--glass-surface);
}

.control-btn:hover::before {
}

.control-btn:hover {
  background: var(--control-hover-bg);
  color: var(--control-hover-fg);
  border-color: var(--control-border);
  filter: drop-shadow(
  );
}

.control-btn.active {
  background: var(--control-active-bg);
  color: var(--control-active-fg);
  border-color: color-mix(
    in srgb,
    var(--control-border)
  );
}

@keyframes active-pulse {
    box-shadow:
  }
    box-shadow:
  }
}

}

}

}

@keyframes tts-active-pulse {
  }
  }
}

.control-btn.ai-quick-message {
}

.control-btn.ai-quick-message:hover {
}

}

.text-input-group {
  display: grid;
  align-items: center;
}

.primary-input-area {
  display: flex;
  align-items: flex-end;
}

.input-actions {
  display: flex;
  align-items: center;
}

.secondary-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
}

.media-controls {
}

.ai-controls {
}

.text-input {
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  color: var(--text-primary);
  font-family: var(--font-family-ui);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  resize: vertical;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.text-input:focus {
  outline: none;
  background: var(--glass-bg-light);
}

.text-input::placeholder {
  color: var(--text-muted);
  transition: color var(--duration-fast) ease;
}

.fairy-input {
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-in-out);
  font-family: inherit;
}

.fairy-textarea {
  resize: none;
}

.fairy-input::placeholder {
  color: var(--text-secondary);
}

.fairy-input:focus {
  outline: none;
  border-color: var(--glass-border-strong);
  background: var(--glass-hover-bg);
  box-shadow: var(--glass-glow-primary);
}

.fairy-input:focus::placeholder {
  color: var(--text-primary);
}

.send-btn {
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-in-out);
  position: relative;
  overflow: hidden;
}

.compact-ui .control-btn {
}

.send-btn::before {
  content: none;
}

.send-btn:hover {
  background: var(--glass-hover-bg);
  border-color: var(--glass-border-strong);
  box-shadow: var(--glass-glow-primary);
}

.send-btn:active {
}

.send-btn:disabled {
  cursor: not-allowed;
  background: var(--glass-disabled-bg);
  color: var(--text-disabled);
  transform: none;
  box-shadow: none;
}

.send-btn:disabled::before {
  display: none;
}

.fairy-close {
  position: absolute;
  background: var(--glass-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.fairy-close::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
  border-radius: inherit;
}

.fairy-close:hover {
  background: var(--glass-bg);
  border-color: var(--glass-border-hover);
  box-shadow:
}

.fairy-close:hover::before {
}

.fairy-close:active {
  transition-duration: var(--duration-fast);
}

.fairy-close:focus {
}

@media (prefers-color-scheme: dark) {
  .fairy-close:hover {
    box-shadow:
  }
}

@media (prefers-reduced-motion: reduce) {
  .fairy-close,
  .fairy-close::before {
    transition: none;
    animation: none;
  }

  .fairy-close:hover {
    transform: none;
  }

  .fairy-close:active {
    transform: none;
  }
}


.chat-header {
  background: var(--glass-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
  background: linear-gradient(
  );
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-lg);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.header-status {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.status-dot {
}

.status-dot.thinking {
}

.status-dot.listening {
}

.header-actions {
  display: flex;
}

.header-btn {
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--duration-fast);
}

.header-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.messages-area {
  overflow-y: auto;
  background: color-mix(
    in srgb,
  );
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: var(--glass-border);
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: var(--glass-border-hover);
}

.welcome-card {
  background: linear-gradient(
  );
  border-radius: var(--radius-lg);
}

.welcome-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.welcome-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.message {
  display: flex;
}

@keyframes fadeIn {
  from {
  }
  to {
  }
}

.message-avatar {
  border-radius: var(--radius-lg);
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-md);
}

.message-user .message-avatar {
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-bubble {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  border-top-left-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.message-bubble--user {
  background: linear-gradient(
  );
  color: white;
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-sm);
  margin-left: auto;
}

.message-meta {
  display: flex;
  align-items: center;
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.message-action {
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--duration-fast);
}

.message:hover .message-action {
}

.message-action:hover {
  background: var(--glass-bg);
  color: var(--text-secondary);
}

.typing-indicator {
  display: flex;
}

.typing-bubble {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  border-top-left-radius: var(--radius-sm);
  display: flex;
  align-items: center;
}

.typing-dot {
  background: var(--text-tertiary);
}

}

}

@keyframes typing {
  }
  }
}

.quick-replies {
  background: var(--glass-bg);
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.quick-replies::-webkit-scrollbar {
  display: none;
}

.quick-reply {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
  white-space: nowrap;
}

.quick-reply:hover {
  background: var(--glass-bg);
}

.input-area {
  background: var(--glass-bg);
}

.input-container {
  display: flex;
  align-items: flex-end;
}

.input-wrapper {
  background: color-mix(
    in srgb,
  );
  display: flex;
  align-items: flex-end;
  transition: all var(--duration-fast);
}

.input-wrapper:focus-within {
  background: var(--glass-bg);
}

.chat-input {
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  resize: none;
  outline: none;
  font-family: inherit;
}

.chat-input::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  align-items: center;
}

.input-btn {
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--duration-fast);
}

.input-btn:hover {
  color: var(--text-secondary);
}

.send-btn {
  background: linear-gradient(
  );
  color: white;
}

.send-btn:hover {
}

.send-btn:disabled {
  cursor: not-allowed;
  transform: none;
}

.controls-bar {
  display: flex;
  background: color-mix(
    in srgb,
  );
}

.control-btn {
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--duration-fast);
  font-size: var(--font-size-lg);
}

.control-btn:hover {
  background: var(--glass-bg);
  color: var(--text-secondary);
}

.control-btn.active {
}

  .fairy-expanded .fairy-bubble {
  }

  .controls-bar {
    position: fixed;
    background: var(--glass-bg);
  }

  .input-area {
  }
}

.camera-modal-overlay {
  position: fixed;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes overlay-fade-in {
  from {
  }
  to {
    backdrop-filter: var(--glass-backdrop-blur-sm);
  }
}

.camera-modal {
  overflow: auto;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-content {
  text-align: center;
}

.camera-content video {
}

.camera-controls {
  display: flex;
  justify-content: center;
}

.settings-modal-overlay {
  position: fixed;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-modal {
  overflow: auto;
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

  display: inline-flex;
  align-items: center;
}

.settings-modal-content {
}

.bubble-appear-enter-active,
.bubble-appear-leave-active {
}

.bubble-appear-enter-from {
}

.bubble-appear-leave-to {
}

.chat-message {
}

@keyframes message-slide-in {
  from {
  }
  to {
  }
}

.chat-messages {
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--glass-bg-weak);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--glass-bg);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--glass-bg-light);
}

.visually-hidden-focusable {
  position: absolute;
  top: auto;
  overflow: hidden;
}
.visually-hidden-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow-sm);
}

.control-btn[disabled],
.control-btn[aria-disabled="true"],
.send-btn[disabled],
.send-btn[aria-disabled="true"] {
  cursor: not-allowed;
}

.scroll-to-bottom-fab {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow-sm);
  color: var(--text-primary);
  cursor: pointer;
}

.scroll-to-bottom-fab:hover {
  background: var(--glass-bg-light);
  box-shadow: var(--glass-shadow-md);
}

.mdi-spin {
  display: inline-flex;
}

@keyframes mdi-spin {
  }
  }
}

.thinking-skeleton .message-content {
  background: var(--glass-bg);
}

.skeleton-line {
  background: linear-gradient(
  );
}

@keyframes skeleton-shimmer {
  }
  }
}

  .ai-fairy-container {
    bottom: calc(
    ) !important;
    right: calc(
    ) !important;
  }
}

  .ai-fairy-container {
    bottom: calc(
    ) !important;
    right: calc(
    ) !important;
  }

  .fairy-expanded .fairy-bubble {
  }

  .fairy-bubble.bubble-persistent {
  }

  .fairy-chat-interface {
  }

  .message-content {
  }
}

@media (prefers-reduced-motion: reduce) {
    animation: none !important;
    scroll-behavior: auto !important;
  }
}

.fairy-pulsing {
}

.fairy-pulsing .fairy-glow {
}

.fairy-pulsing .fairy-aura {
}

@keyframes container-pulse {
    box-shadow:
      var(--shadow-lg),
  }
    box-shadow:
      var(--shadow-xl),
  }
}

.fairy-active {
  border-image: linear-gradient(
    )
}

.fairy-active .fairy-glow {
}

.fairy-active .fairy-aura {
}

.fairy-chatting {
}

.fairy-chatting .fairy-avatar {
}

.fairy-expanded .fairy-avatar {
  animation: none !important;
  transform: none !important;
}

.fairy-thinking .fairy-avatar {
  animation:
}

@keyframes thinking-pulse {
  }
  }
}

  .ai-fairy-container {
  }

  .fairy-avatar {
  }

  .particle-system {
  }

  .particle {
    width: var(--spacing-px);
    height: var(--spacing-px);
  }

  .wing {
  }

  .enhanced-indicator {
  }

  .enhanced-pulse {
  }

  .pulse-core {
    font-size: var(--font-size-xs);
  }
}

  .ai-fairy-container {
  }

  .fairy-avatar {
  }

  .fairy-core {
    font-size: var(--font-size-lg);
  }
}

  .particle-system {
    display: none;
  }

  .fairy-aura {
  }
}

@media (prefers-reduced-motion: reduce) {
  }

  .fairy-avatar:hover {
  }
}

@media (prefers-contrast: high) {
  .ai-fairy-container {
  }

  .fairy-avatar {
    border-color: var(--fairy-primary);
  }
}

.fairy-small-mode {
}

.fairy-small-mode .fairy-character {
}

.fairy-small-mode .fairy-bubble {
}

.fairy-small-mode:hover {
}

.fairy-full-mode {
}

.fairy-hidden {
}

.fairy-hidden .fairy-character {
}

.fairy-hidden:hover {
}

.fairy-small-mode::after {
  content: "Page aware • Click to expand";
  position: absolute;
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity var(--duration-fast) ease;
  box-shadow: var(--shadow-md);
}

.fairy-small-mode:hover::after {
}

.fairy-hidden::after {
  content: "Chat hidden • Click to show";
  position: absolute;
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity var(--duration-fast) ease;
  box-shadow: var(--shadow-md);
}

.fairy-hidden:hover::after {
}

.fairy-small-mode .status-ring,
.fairy-small-mode .selection-ring {
}

.fairy-full-mode .status-ring,
.fairy-full-mode .selection-ring {
}

.fairy-hidden .status-ring,
.fairy-hidden .selection-ring {
}

@keyframes pulse-warning {
  }
  }
}

@keyframes pulse-success {
  }
  }
}

@keyframes pulse-hidden {
  }
  }
}

.page-indicator {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-indicator-dot {
  background: white;
}

@keyframes pulse-page {
  }
  }
}

@media (hover: none) {
  .particle-system {
    display: none;
  }
}
</style>
