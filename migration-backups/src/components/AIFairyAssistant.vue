<template>
  <div
    class="ai-fairy-container fairy-accent-upgraded"
    :class="[
      unifiedUI?.unifiedClasses?.value || '',
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
    :title="fairyStatus + ' (Click to cycle: ' + bubbleSize + ' -> ' + getNextSizeLabel() + ')'"
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
          <AppIcon :name="getIcon('mdi-shimmer','mdi-shimmer')" :size="getIconSize()" :color="getIconColor()" />
        </div>
        <div class="fairy-sparkles" aria-hidden="true">
          <span v-for="n in 3" :key="n" class="sparkle">
            <AppIcon :name="getIcon('mdi-shimmer','mdi-shimmer')" :size="getIconSize()" :color="getIconColor()" />
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
        <div
          v-if="isSmallMode"
          class="page-indicator"
          aria-hidden="true"
        >
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
            <AppIcon :name="getIcon('mdi-microphone','mdi-microphone')" :size="getIconSize()" :color="getIconColor()" />
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
            <AppIcon :name="getIcon('mdi-thought-bubble','mdi-thought-bubble')" :size="getIconSize()" :color="getIconColor()" />
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
      v-if="(currentMessage || expanded || shouldShowEmptyBubble) && bubbleSize !== 'hidden'"
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
        <div class="message-text" role="status" aria-live="polite">{{ currentMessage.text }}</div>
        <div v-if="currentMessage.actions" class="message-actions" role="toolbar" aria-label="Quick actions">
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
        <div class="message-text message-text--empty" role="status" aria-live="polite">
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
                Hi! I'm NAVI, your AI career fairy! ✨ I can help with resumes, job searches, interviews, and more. What would you like to work on today?
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
                Perfect! I can help you ace that gaming industry interview! Let me prepare some tailored questions and tips based on your target role. What position are you interviewing for?
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
            <textarea class="text-input" placeholder="Ask NAVI anything..." rows="1"></textarea>
            <div class="input-actions">
              <button class="control-btn" title="Upload file">📎</button>
              <button class="send-btn">➤</button>
            </div>
          </div>
          
          <!-- Secondary Controls -->
          <div class="secondary-controls">
            <div class="control-group media-controls">
              <button class="control-btn active" title="Text-to-speech">🔊</button>
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
            <AppIcon :name="getIcon('mdi-close','mdi-close')" :size="getIconSize()" />
          </button>
        </div>
        <div class="camera-content">
          <video ref="cameraVideo" autoplay playsinline></video>
          <canvas ref="cameraCanvas" style="display: none"></canvas>
          <div class="camera-controls">
            <button class="glass-btn ai-powered" @click="captureImage">
              <AppIcon :name="getIcon('mdi-camera','mdi-camera')" :size="getIconSize()" />
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
      <div class="settings-modal ultra-glass-card section-card" tabindex="-1" @click.stop>
        <div class="settings-modal-header">
          <h3 id="tts-modal-title">
            <AppIcon :name="getIcon('mdi-cog','mdi-cog')" :size="getIconSize()" />
            Voice & TTS Settings
          </h3>
          <button class="glass-btn" aria-label="Close settings" @click="showTTSModal = false">
            <AppIcon :name="getIcon('mdi-close','mdi-close')" :size="getIconSize()" />
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
            >
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
            >
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
            <button class="test-tts-btn glass-btn" :disabled="isSpeaking" @click="testTTS">
              <AppIcon :name="isSpeaking ? getIcon('mdi-stop','mdi-stop') : getIcon('mdi-play','mdi-play')" :size="getIconSize()" />
              {{ isSpeaking ? 'Stop' : 'Test Voice' }}
            </button>
          </div>

          <div class="settings-info">
            <small class="provider-info">
              <AppIcon :name="getIcon('mdi-information-outline','mdi-information-outline')" :size="getIconSize()" />
              <span id="tts-provider-help">{{ getProviderInfo(ttsSettings.provider) }}</span>
            </small>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue';

import {
  ref,
  computed,
  watch,
  nextTick,
  inject,
  onMounted,
  onUnmounted,
  getCurrentInstance,
} from "vue";

import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import { useIconReplacement } from "@/composables/useIconReplacement";
import { useLiveMultimediaAI } from "@/composables/useLiveMultimediaAI";
import { useAppStore } from "@/stores/app";
import { runVoiceServicesDiagnostics, getVoiceServicesStatusMessage } from "@/shared/utils/voiceServicesValidator";
import { logger } from "@/shared/utils/logger";
import { speak, stopSpeaking, isVoiceSupported, setVoiceRoutingPreferences } from "@/utils/voice.js";
import { resolveGeminiApiKey } from "@/shared/utils/apiKeys";

export default {
  name: "AIFairyAssistant",
  components: { AppIcon },
  setup() {
    const _router = useRouter?.() || null;

    const route = useRoute?.() || null;
    const store = useAppStore();
    const vmInstance = getCurrentInstance();
    const currentPath = () => {
      try {
        if (route && typeof route.path !== 'undefined') return route.path;
      } catch {}
      try {
        const mockRoute = vmInstance?.proxy?.$route;
        if (mockRoute && typeof mockRoute.path === 'string') return mockRoute.path;
      } catch {}
      return '/';
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
        logger.warn('AI integration not available')
        return false
      }
      
      if (!aiIntegration.isAIInitialized.value) {
        logger.info('AI not initialized, attempting initialization...')
        const success = await aiIntegration.initializeAI()
        if (!success) {
          toast.error('Failed to initialize AI services. Please check your settings.')
          return false
        }
      }
      
      return true
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
    const bubbleSize = computed(() => store.settings?.fairyBubbleSize || 'full');
    const isVisible = computed(() => bubbleSize.value !== 'hidden');
    const isSmallMode = computed(() => bubbleSize.value === 'small');
    const isFullMode = computed(() => bubbleSize.value === 'full');
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
      provider: 'system' // 'system' or 'gemini'
    });
    // Cached Gemini API key state for provider helper
    const hasGeminiApiKey = ref(false);
    (async () => { try { hasGeminiApiKey.value = !!(await resolveGeminiApiKey()); } catch {} })();
    function getProviderInfo(provider) {
      const hasApiKey = hasGeminiApiKey.value;
      const hasElectronAPI = Boolean(window.api?.audio?.ttsSpeak);
      switch (provider) {
        case 'gemini':
          if (!hasApiKey) return 'Google AI Gemini TTS (requires API key in main settings)';
          if (!hasElectronAPI) return 'Google AI TTS (browser mode - falling back to system TTS)';
          return 'Using Google AI Gemini for natural-sounding speech (API key active)';
        case 'kokoro':
          return 'Using Kokoro TTS for high-quality neural voice synthesis (local processing)';
        case 'system':
        default:
          return 'Using browser\'s built-in text-to-speech engine (fast and reliable)';
      }
    }
    
    // TTS Settings Modal
    const showTTSModal = ref(false);

    function autoResizeInput() {
      try {
        const el = chatInputEl.value;
        if (!el) return;
        el.style.height = 'auto';
        const max = 140; // ~5 lines
        el.style.height = Math.min(el.scrollHeight, max) + 'px';
      } catch {}
    }

    function onInputEnter(e) {
      // Shift+Enter inserts newline, Enter alone sends
      if (e.shiftKey) {
        return; // default prevented by handler signature
      }
      sendMessage();
    }

    function copyMessage(message) {
      try {
        const text = normalizeContentForDisplay(message.content || message.text || '');
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            toast.success('Message copied');
          }).catch(() => {
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
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast.success('Message copied');
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
          { id: "review_answers", label: "Review Tips", icon: "mdi-format-list-checks" },
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
    const quickReplies = ref([
      'Build Resume',
      'Find Jobs',
      'Interview Tips',
    ])

    const showQuickReplies = computed(() => {
      try {
        return expanded.value && (chatMessages.value?.length || 0) <= 2
      } catch { return false }
    })

    function sendQuickReply(text) {
      try {
        userInput.value = text
        sendMessage()
      } catch {}
    }

    // Random fairy tips and easter eggs
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
        const diagnostics = await runVoiceServicesDiagnostics({ invasive: false });
        const statusMessage = getVoiceServicesStatusMessage(diagnostics.capabilities);
        
        logger.info(statusMessage);
        
        if (!diagnostics.capabilities.fullSupport) {
          toast.warning(`Voice services limited: ${statusMessage}`);
          if (diagnostics.errors.missing.length > 0) {
            logger.error('Missing required features:', diagnostics.errors.missing);
          }
        }

  // Resolve API key consistently across chat and voice
  const apiKey = await resolveGeminiApiKey();
        
        if (!apiKey) {
          toast.warning('Please configure your Gemini API key in settings');
          return false;
        }

        const success = await initializeMultimediaAI({
          apiKey,
          model: 'gemini-2.5-flash',
          enableAudio: diagnostics.capabilities.getUserMedia,
          enableVideo: diagnostics.capabilities.getUserMedia,
          enableScreenshot: diagnostics.capabilities.getDisplayMedia,
          maxTokens: 8192,
          temperature: 0.7,
        });

        if (success) {
          toast.success('AI Fairy multimedia services ready!');
        } else {
          toast.error('Failed to initialize AI services');
        }
        
        return success;
      } catch (error) {
        logger.error('Failed to initialize AI services:', error);
        toast.error('Failed to initialize AI services. Check your API key.');
        return false;
      }
    }

    // Add screenshot capture function
    async function captureScreenshotWithAI() {
      if (!isAIInitialized.value) {
        await initializeAIServices();
      }

      if (!isMultimediaReady()) {
        toast.warning("AI services not ready. Please check your API key in settings.");
        return;
      }

      try {
        isThinking.value = true;
        toast.info("📸 Capturing screenshot for AI analysis...");
        
        await captureScreenshot("Analyze this screenshot and provide insights. What do you see that might be relevant for career development or gaming industry work?");
      } catch (error) {
        logger.error("Screenshot capture failed:", error);
        toast.error("Screenshot capture failed. Check screen sharing permissions.");
      } finally {
        isThinking.value = false;
      }
    }

    // Methods
    function toggleExpanded() {
      // Cycle through bubble states: full -> small -> hidden -> full
      const currentSize = bubbleSize.value;
      let nextSize;
      
      if (currentSize === 'full') {
        nextSize = 'small';
        expanded.value = false; // Close chat if open
      } else if (currentSize === 'small') {
        nextSize = 'hidden';
        expanded.value = false;
      } else { // hidden
        nextSize = 'full';
        expanded.value = true; // Open chat when returning to full
      }
      
      // Update the setting
      store.updateSettings({ fairyBubbleSize: nextSize });
      
      // Initialize chat if expanding to full mode
      if (nextSize === 'full') {
        expanded.value = true;
        initializeChat();
        nextTick(() => {
          try {
            const inputEl = chatInputEl.value || document.querySelector('.fairy-input');
            inputEl?.focus?.();
            autoResizeInput();
          } catch {}
        });
      } else if (nextSize === 'small') {
        // In small mode, show a brief page-aware message without full chat
        expanded.value = false;
        // Could add a small tooltip or brief page context here
      }
    }
    
    // Separate function for opening full chat (used by other parts of the app)
    function openFullChat() {
      store.updateSettings({ fairyBubbleSize: 'full' });
      expanded.value = true;
      initializeChat();
      nextTick(() => {
        try {
          const inputEl = chatInputEl.value || document.querySelector('.fairy-input');
          inputEl?.focus?.();
          autoResizeInput();
        } catch {}
      });
    }
    
    // Helper functions for UI labels
    function getNextSizeLabel() {
      const currentSize = bubbleSize.value;
      if (currentSize === 'full') return 'small';
      if (currentSize === 'small') return 'hidden';
      return 'full';
    }
    
    function getAriaLabel() {
      const currentSize = bubbleSize.value;
      const nextSize = getNextSizeLabel();
      
      if (expanded.value) {
        return `AI assistant chat open. Click to make ${nextSize}.`;
      } else if (currentSize === 'full') {
        return `AI assistant with chat bubble visible. Click to make ${nextSize}.`;
      } else if (currentSize === 'small') {
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
          setTimeout(() => speakMessage(welcomeMessage.content, welcomeMessage.id), 500);
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
              setTimeout(() => speakMessage(tipMessage.content, tipMessage.id), 1500);
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

      // Check for easter eggs
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
          throw new Error('AI services not available');
        }

        // Use AI integration for response with enhanced context
        const response = await aiIntegration?.triggerAIAction("realtime_chat", {
          message: message,
          context: {
            page: currentPath(),
            userProfile: store?.user || {}, // Include user profile data
            chatHistory: chatMessages.value.slice(-5), // Last 5 messages for context
            sessionId: `fairy-${Date.now()}`,
            timestamp: new Date().toISOString()
          },
        });

        if (response && response.content) {
          const aiMessage = {
            id: Date.now(),
            type: "ai",
            content: normalizeContentForDisplay(response.content),
            timestamp: new Date(),
            metadata: response.metadata || {}
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
      } catch (error) {        
        logger.error("Fairy chat error:", error);
        
        // Enhanced error handling with specific error messages
        let errorResponse = "Oops! Something went wrong. Let me try that again! 🔧";
        
        if (error.message.includes('API key')) {
          errorResponse = "I need an API key to work properly. Please check your settings! ⚙️";
        } else if (error.message.includes('network')) {
          errorResponse = "I'm having trouble connecting. Please check your internet connection! 🌐";
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorResponse = "I've reached my usage limit for now. Please try again later! ⏰";
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

    // Helper function for contextual fallback responses
    function getContextualFallbackResponse(message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
        return "I'd love to help with your resume! Try uploading it or ask me specific questions about resume building. ✨";
      } else if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
        return "Let's work on your career goals! I can help you find jobs, analyze matches, or prepare for interviews. 🎯";
      } else if (lowerMessage.includes('interview')) {
        return "Interview prep is one of my specialties! Would you like to practice questions or get tips for a specific role? 🎤";
      } else if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
        return "Skill development is key to career growth! Tell me about your current skills or what you'd like to learn. 📚";
      } else if (lowerMessage.includes('portfolio')) {
        return "A great portfolio showcases your best work! I can help you organize and present your projects effectively. 🎨";
      } else {
        return "I'm here to help with your gaming career! Try asking me about resumes, jobs, interviews, or skill development. ✨";
      }
    }

    // Listen for settings updates (e.g., API key added in settings panel)
    try {
    window.addEventListener('app-settings-updated', async (e) => {
        try {
          const detail = e?.detail || {};
          const newKey = detail.geminiApiKey || await resolveGeminiApiKey();
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
      } catch (error) {
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
          if (el && typeof el.focus === 'function') {
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
      } catch (error) {        logger.error("Camera error:", error);
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
        } catch (error) {          logger.error("Image analysis error:", error);
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

    function onCameraModalKeydown(e) {
      // Trap focus within the camera modal when open
      if (!cameraModalOpen.value) return;
      if (e.key !== 'Tab') return;
      try {
        const root = cameraModalEl.value;
        if (!root) return;
        const focusable = root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
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
      input.onchange = async (e) => {
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
          const result = await aiIntegration?.triggerAIAction(
            action.id,
            {
              context: route.path,
              action: action.id,
            },
          );
          if (result) {
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

      // Remove after 10 seconds
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

        // Auto-hide after 10 seconds
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
          type: 'user'
        });
      } catch (error) {
        logger.error("Quick AI message error:", error);
        toast.error("Failed to send AI message");
      } finally {
        isThinking.value = false;
      }
    }
    
    // TTS Functions
    function toggleTTS() {
      ttsEnabled.value = !ttsEnabled.value;
      
      // Save preference to localStorage
      localStorage.setItem('fairy-tts-enabled', ttsEnabled.value.toString());
      
      // Stop current speech if disabling
      if (!ttsEnabled.value && isSpeaking.value) {
        stopSpeaking();
        isSpeaking.value = false;
        currentSpeakingMessageId.value = null;
      }
      
      toast.info(ttsEnabled.value ? "Text-to-speech enabled" : "Text-to-speech disabled");
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
        const savedSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        const resolvedKey = savedSettings.geminiApiKey || await resolveGeminiApiKey();
        const voiceSettings = {
          rate: ttsSettings.value.rate,
          pitch: ttsSettings.value.pitch,
          volume: ttsSettings.value.volume,
          provider: ttsSettings.value.provider,
          apiKey: resolvedKey, // Prefer resolved key from settings/preferences/env
          // Use 'language' key to align with AudioService API; keep 'lang' for backward compat
          language: savedSettings.language || 'en-US',
          lang: savedSettings.language || 'en-US',
          // Prefer explicit voice when set in settings
          voice: (ttsSettings.value.provider === 'system')
            ? (savedSettings.ttsVoice || null)
            : (savedSettings.geminiVoice || null)
        };
        
        logger.debug('TTS Settings:', voiceSettings);
        logger.debug('Speaking with provider:', voiceSettings.provider);
        logger.debug('API Key available:', !!voiceSettings.apiKey, voiceSettings.apiKey ? `(${voiceSettings.apiKey.slice(0, 8)}...)` : '(none)');
        // Voice routing preferences debug removed due to import issue
        
        await speak(cleanText, voiceSettings);
        
      } catch (error) {
        logger.error('TTS error:', error);
        toast.warning('Failed to speak message');
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
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start speaking this message
      await speakMessage(message.content, message.id);
    }
    
    function cleanTextForSpeech(text) {
      if (!text) return '';
      
      // First normalize the text in case it's an object
      const normalizedText = normalizeContentForDisplay(text);
      
      return normalizedText
        // Remove markdown formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')  // **bold**
        .replace(/\*(.*?)\*/g, '$1')      // *italic*
        .replace(/`(.*?)`/g, '$1')        // `code`
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // [text](url)
        // Remove special tokens and formatting
        .replace(/\[MAGIC\]/g, '')
        .replace(/\[SUCCESS\]/g, '')
        .replace(/\[TROPHY\]/g, '')
        .replace(/\[object Object\]/gi, '')
        .replace(/\{.*?\}/g, '')          // Remove JSON objects
        .replace(/".*?"/g, '')           // Remove quoted strings
        // Replace emoji codes with words
        .replace(/✨/g, 'sparkles')
        .replace(/🎮/g, 'gaming')
        .replace(/📝/g, 'note')
        .replace(/🎯/g, 'target')
        .replace(/🎤/g, 'microphone')
        .replace(/🏆/g, 'trophy')
        .replace(/🛠️/g, 'tools')
        .replace(/🤖/g, 'robot')
        .replace(/💬/g, 'chat')
        .replace(/📸/g, 'camera')
        .replace(/🗣️/g, 'speaking')
        .replace(/🌈/g, 'rainbow')
        .replace(/🔧/g, 'wrench')
        .replace(/🔊/g, 'sound on')
        .replace(/🔇/g, 'sound off')
        // Clean up extra spaces and newlines
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '. ')           // Replace newlines with periods
        .replace(/\.\.+/g, '.')         // Remove multiple periods
        .trim();
    }
    
    function loadTTSPreferences() {
      try {
        // Load fairy-specific TTS enabled state
        const saved = localStorage.getItem('fairy-tts-enabled');
        if (saved !== null) {
          ttsEnabled.value = saved === 'true';
        } else {
          // Default to voiceMode setting if fairy-specific setting doesn't exist
          const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
          ttsEnabled.value = appSettings.voiceMode || false;
        }
        
        // Load TTS settings from main app settings
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        
        // Use proper setting names from schema
        ttsSettings.value.rate = appSettings.speechRate || 0.85;
        ttsSettings.value.pitch = appSettings.speechPitch || 1.0;
        ttsSettings.value.volume = appSettings.speechVolume || 0.8;
        ttsSettings.value.provider = appSettings.ttsProvider || 'system';
        ttsSettings.value.voice = appSettings.ttsVoice || '';
        compactUI.value = Boolean(appSettings.compactUI);
        
        logger.debug('Loaded TTS settings from localStorage:', {
          ttsProvider: appSettings.ttsProvider,
          speechRate: appSettings.speechRate,
          current: ttsSettings.value
        });
        
        logger.debug('Loaded TTS settings:', {
          enabled: ttsEnabled.value,
          provider: ttsSettings.value.provider,
          rate: ttsSettings.value.rate,
          volume: ttsSettings.value.volume
        });
        
        // Update voice routing with loaded settings
        setVoiceRoutingPreferences({
          ttsProvider: ttsSettings.value.provider,
          sttProvider: appSettings.sttProvider || 'system',
          lang: appSettings.voiceLang || appSettings.language || 'en-US',
          speakerDeviceId: appSettings.selectedSpeakerId || '',
          micDeviceId: appSettings.selectedMicId || ''
        });
        
      } catch (error) {
        logger.error('Failed to load TTS preferences:', error);
      }
    }
    
    function saveTTSSettings() {
      try {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        
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
        
        localStorage.setItem('app-settings', JSON.stringify(appSettings));
        
        // Update voice routing preferences with all current settings
        setVoiceRoutingPreferences({
          ttsProvider: ttsSettings.value.provider,
          sttProvider: appSettings.sttProvider || 'system',
          lang: appSettings.voiceLang || appSettings.language || 'en-US',
          speakerDeviceId: appSettings.selectedSpeakerId || '',
          micDeviceId: appSettings.selectedMicId || ''
        });
        
        // Sync compact UI in case it changed externally
        if (typeof appSettings.compactUI === 'boolean') {
          compactUI.value = appSettings.compactUI;
        }

        logger.info('TTS settings saved and routing updated:', {
          provider: ttsSettings.value.provider,
          rate: ttsSettings.value.rate,
          volume: ttsSettings.value.volume,
          voiceMode: appSettings.voiceMode
        });
        
        toast.success(`TTS provider updated to ${ttsSettings.value.provider === 'gemini' ? 'Google AI (Gemini)' : 'System TTS'}`);
      } catch (error) {
        logger.error('Failed to save TTS settings:', error);
        toast.error('Failed to save TTS settings');
      }
    }

    function saveUISettings(compact) {
      try {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        appSettings.compactUI = Boolean(compact);
        localStorage.setItem('app-settings', JSON.stringify(appSettings));
        compactUI.value = Boolean(compact);
        toast.info(`Compact UI ${compactUI.value ? 'enabled' : 'disabled'}`);
      } catch (error) {
        logger.error('Failed to save UI settings:', error);
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
      if (ttsSettings.value.provider === 'gemini') {
        testMessage = hasApiKey 
          ? "Hello! This is Google AI Gemini text-to-speech. How natural do I sound?"
          : "Google AI TTS selected but no API key found. Using system TTS instead.";
      } else {
        testMessage = "Hello! This is your browser's system text-to-speech. Clear and reliable!";
      }
      
      await speakMessage(testMessage); // Don't pass messageId for test messages
    }
    
  // (removed redundant async getProviderInfo definition)

    // Update video streaming state tracking
    watch(() => multimediaState.isVideoStreaming, (newValue) => {
      isVideoStreaming.value = newValue;
    });

    // Update audio streaming state tracking  
    watch(() => multimediaState.isAudioStreaming, (newValue) => {
      isListening.value = newValue;
    });
    
    // Keep latest message and thinking skeleton in view
    watch(() => isThinking.value, async (thinking) => {
      if (thinking) {
        await nextTick();
        scrollToBottomIfNear();
      }
    });
    
    // Watch for app settings changes and sync TTS settings
    const appSettingsWatcher = () => {
      try {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        
        // Only update if settings actually changed
        const newProvider = appSettings.ttsProvider || 'system';
        const newRate = appSettings.speechRate || 0.85;
        const newVolume = appSettings.speechVolume || 0.8;
        const newCompact = Boolean(appSettings.compactUI);
        
        if (newProvider !== ttsSettings.value.provider ||
            newRate !== ttsSettings.value.rate ||
            newVolume !== ttsSettings.value.volume ||
            newCompact !== compactUI.value) {
          
          logger.debug('App settings changed, syncing UI/TTS settings:', {
            oldProvider: ttsSettings.value.provider,
            newProvider,
            oldRate: ttsSettings.value.rate,
            newRate,
            oldVolume: ttsSettings.value.volume,
            newVolume,
            compactUI: { old: compactUI.value, new: newCompact }
          });
          
          ttsSettings.value.provider = newProvider;
          ttsSettings.value.rate = newRate;
          ttsSettings.value.volume = newVolume;
          ttsSettings.value.pitch = appSettings.speechPitch || 1.0;
          ttsSettings.value.voice = appSettings.ttsVoice || '';
          compactUI.value = newCompact;
          
          // Update voice routing
          setVoiceRoutingPreferences({
            ttsProvider: newProvider,
            sttProvider: appSettings.sttProvider || 'system',
            lang: appSettings.voiceLang || appSettings.language || 'en-US'
          });
        }
      } catch (error) {
        logger.debug('App settings watcher error:', error);
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
      if (typeof content === 'string') return content;
      // Common AI response shapes
      if (typeof content === 'object') {
        // Handle Google AI response format
        if (content.candidates && Array.isArray(content.candidates)) {
          const candidate = content.candidates[0];
          if (candidate && candidate.content && candidate.content.parts) {
            return candidate.content.parts.map(part => part.text || '').join('\n');
          }
        }
        // Handle other common formats
        if (typeof content.content === 'string') return content.content;
        if (typeof content.text === 'string') return content.text;
        if (typeof content.message === 'string') return content.message;
        if (typeof content.response === 'string') return content.response;
        // Handle array of messages
        if (Array.isArray(content) && content.length > 0) {
          return content.map(item => normalizeContentForDisplay(item)).join('\n');
        }
        // If it's an object but none of the common properties exist, try to extract meaningful text
        const meaningfulText = extractMeaningfulText(content);
        if (meaningfulText) return meaningfulText;
        
        // Last resort - avoid [object Object]
  try {
          const jsonStr = JSON.stringify(content, null, 2);
          // If it's a simple object, try to format it nicely
          if (jsonStr.length < 200) {
            return jsonStr.replace(/[{}"]/g, '').replace(/,\n/g, ', ').trim();
          }
          return 'AI response received (complex format)';
  } catch {
          return String(content).replace('[object Object]', 'AI response received');
        }
      }
      return String(content);
    }
    
    function extractMeaningfulText(obj) {
      // Try to find any string property that looks like content
      const textProps = ['text', 'content', 'message', 'response', 'answer', 'reply', 'output'];
      for (const prop of textProps) {
        if (obj[prop] && typeof obj[prop] === 'string' && obj[prop].trim()) {
          return obj[prop];
        }
      }
      
      // Look for nested objects
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
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
              emSplit.forEach((e) => {
                if (!e) return;
                if (/^\*[^*]+\*$/.test(e)) {
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
    async function handleKeydown(e) {
      try {
        // Ignore typing in inputs/textarea or with modifiers
        const tag = (e.target && e.target.tagName) ? String(e.target.tagName).toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
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

    async function handleKeyup(e) {
      try {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
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
      if (event.key === 'app-settings' && event.newValue) {
        logger.debug('Settings changed in storage, syncing...');
        try {
          const newSettings = JSON.parse(event.newValue);
          // Trigger settings reload if TTS provider changed
          if (newSettings.ttsProvider !== ttsSettings.value.provider) {
            logger.info('TTS provider changed via storage event:', newSettings.ttsProvider);
            appSettingsWatcher(); // Force immediate update
          }
        } catch (error) {
          logger.debug('Error parsing storage change:', error);
        }
      }
    };

    // Lifecycle
    onMounted(async () => {
      // Load TTS preferences
      loadTTSPreferences();
      
      // Listen for storage changes from other tabs/components (like Settings view)
      window.addEventListener('storage', handleStorageChange);
      
      // Listen for fairy chat open events from other components
      window.addEventListener('open-fairy-chat', () => {
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
      }, 60000); // Every minute, 30% chance

      // Initial sizing for input if present
      nextTick(() => autoResizeInput());

      // Auto-initialize AI services when a Gemini API key is present
      // and real-time features are enabled (or voice mode is on).
      try {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        const haveKey = !!(store.settings?.geminiApiKey || appSettings.geminiApiKey);
        const wantRealtime = !!(store.settings?.enableRealtimeFeatures || appSettings.enableRealtimeFeatures || appSettings.voiceMode);
        if (haveKey && wantRealtime && !isAIInitialized.value) {
          await initializeAIServices();
        }
      } catch {
        // non-critical
      }

      // Install push-to-talk listeners
      try {
        if (store.settings?.pushToTalk) {
          window.addEventListener('keydown', handleKeydown);
          window.addEventListener('keyup', handleKeyup);
        }
      } catch {}
    });

    onUnmounted(() => {
      closeCameraModal();
      
      // Clean up storage event listener
      window.removeEventListener('storage', handleStorageChange);
      
      // Clean up settings watcher
      if (settingsInterval) {
        clearInterval(settingsInterval);
      }

      try {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('keyup', handleKeyup);
      } catch {}
    });

    // React to push-to-talk setting changes
    watch(() => store.settings?.pushToTalk, (enabled) => {
      try {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('keyup', handleKeyup);
        if (enabled) {
          window.addEventListener('keydown', handleKeydown);
          window.addEventListener('keyup', handleKeyup);
        }
      } catch {}
    })

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
/* Clean AI Fairy Container - Gaming Card Style */
.ai-fairy-container {
  /* Positioning - Fixed to viewport bottom-right, not affected by page content */
  position: fixed !important;
  bottom: calc(var(--spacing-6, 1.5rem) + env(safe-area-inset-bottom, 0px)) !important;
  right: calc(var(--spacing-6, 1.5rem) + env(safe-area-inset-right, 0px)) !important;
  z-index: 9999; /* Higher z-index to ensure it stays on top */
  
  /* Prevent any interference from page layout */
  max-width: calc(100vw - 2 * var(--spacing-6, 1.5rem));
  max-height: calc(100vh - 2 * var(--spacing-6, 1.5rem));
  
  /* Default full size */
  width: var(--spacing-18, 4.5rem);
  height: var(--spacing-18, 4.5rem);
  transition: all var(--duration-normal) ease;
  
  /* Ensure it's not affected by parent containers */
  transform: translate3d(0, 0, 0); /* Force hardware acceleration and create new stacking context */
  will-change: transform; /* Optimize for position changes */
  
  /* Isolation from parent layout */
  isolation: isolate; /* Create new stacking context */
  contain: layout style; /* Contain layout calculations */
  pointer-events: auto; /* Ensure interactions work */
  
  /* Override any inherited positioning */
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
  clear: none !important;

  /* Container Dimensions - Design System Scale */
  width: var(--spacing-16, 4rem);
  height: var(--spacing-16, 4rem);
  border-radius: var(--radius-full, 9999px);
  padding: 0;

  /* Unified Design System Variables */
  font-family: var(--font-family-gaming, "Orbitron");
  --fairy-primary: var(--color-primary-500);
  --fairy-secondary: var(--color-secondary-500);
  --fairy-tertiary: var(--color-primary-400);
  --fairy-accent: var(--color-primary-600);

  /* Gaming Card Background - Use Design System */
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);

  /* Clean Shadow System */
  box-shadow:
    var(--glass-shadow-md),
    inset 0 var(--spacing-px) var(--spacing-1, 0.25rem) var(--glass-border);

  /* Optimized Transitions */
  transition: all var(--transition-normal, 0.25s ease-in-out);
  will-change: transform;
  transform: translateZ(0);

  /* Flex Container */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

/* Unified Container Effects */
.ai-fairy-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-surface);
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
  opacity: 0.5;
}

/* Clean Selection Ring */
.selection-ring {
  position: absolute;
  inset: calc(-1 * var(--spacing-1, 0.25rem));
  border-radius: inherit;
  transition: all var(--transition-normal, 0.25s ease);
  pointer-events: none;
}

.selection-ring.active {
  box-shadow: 0 0 var(--spacing-4, 1rem)
    color-mix(in srgb, var(--fairy-primary) 30%, transparent);
  animation: ring-pulse 2s var(--transition-normal, ease-in-out) infinite;
}

@keyframes ring-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Clean Fairy Avatar */
.fairy-avatar {
  width: var(--spacing-14, 3.5rem);
  height: var(--spacing-14, 3.5rem);
  border-radius: var(--border-radius-full, 9999px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  /* Subtle Background - Use Design System */
  background: var(--glass-bg-light);

  /* Clean Border - Use Design System */
  border: var(--spacing-px, 1px) solid var(--glass-border);

  /* Optimized Transition */
  transition: all var(--transition-normal, 0.25s ease);
  animation: fairy-float 6s var(--transition-slow, ease-in-out) infinite;
}

@keyframes fairy-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(calc(-1 * var(--spacing-1)));
  }
}

/* Clean Hover States */
.ai-fairy-container:hover,
.fairy-hovering {
  /* Container stays anchored; visual effects only */
  transform: none;
  box-shadow:
    0 var(--spacing-3) var(--spacing-10)
      color-mix(in srgb, var(--fairy-primary) 15%, transparent),
    var(--shadow-xl),
    inset 0 var(--spacing-px) var(--spacing-1) rgba(255, 255, 255, 0.25);

  border-image: linear-gradient(
      135deg,
      color-mix(in srgb, var(--fairy-primary) 60%, transparent),
      color-mix(in srgb, var(--fairy-secondary) 40%, transparent),
      color-mix(in srgb, var(--fairy-tertiary) 40%, transparent),
      color-mix(in srgb, white 30%, transparent)
    )
    1;
}

.ai-fairy-container:hover .fairy-avatar,
.fairy-hovering .fairy-avatar {
  /* Subtle hover lift restored (no layout shift) */
  transform: translateY(calc(-1 * var(--spacing-0-5))) scale(1.05);
  border-color: var(--glass-border-strong);
  box-shadow: var(--glass-glow-primary);
}

/* Optimized Particle System */
.particle-system {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--spacing-15);
  height: var(--spacing-15);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  width: var(--spacing-0-5, 0.125rem);
  height: var(--spacing-0-5, 0.125rem);
  background: var(--fairy-primary);
  border-radius: var(--radius-full);
  opacity: 0.6;
  animation: particle-orbit 8s var(--easing-linear) infinite;
  animation-delay: var(--delay);
}

@keyframes particle-orbit {
  from {
    transform: rotate(0deg) translateX(var(--spacing-6)) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(var(--spacing-6)) rotate(-360deg);
  }
}

/* Enhanced Character */
.fairy-character {
  position: relative;
  font-size: 1.5rem;
  z-index: 5; /* Above avatar overlays */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Unified Glow System */
.fairy-glow {
  position: absolute;
  inset: calc(-1 * var(--spacing-2));
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--fairy-primary) 30%, transparent) 0%,
    color-mix(in srgb, var(--fairy-secondary) 20%, transparent) 50%,
    transparent 70%
  );
  border-radius: var(--radius-full);
  animation: glow-pulse 4s var(--easing-ease-in-out) infinite;
  opacity: 0;
}

.fairy-aura {
  position: absolute;
  inset: calc(-1 * var(--spacing-3));
  background: conic-gradient(
    from 0deg,
    color-mix(in srgb, var(--fairy-primary) 15%, transparent),
    color-mix(in srgb, var(--fairy-secondary) 15%, transparent),
    color-mix(in srgb, var(--fairy-tertiary) 15%, transparent),
    color-mix(in srgb, var(--fairy-accent) 15%, transparent),
    color-mix(in srgb, var(--fairy-primary) 15%, transparent)
  );
  border-radius: var(--radius-full);
  animation: aura-rotate 12s var(--easing-linear) infinite;
  opacity: 0;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes aura-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Clean Wings */
.fairy-wings {
  position: absolute;
  inset: calc(-1 * var(--spacing-1-5));
  pointer-events: none;
}

.wing {
  position: absolute;
  width: var(--spacing-3-5);
  height: var(--spacing-4-5, 1.125rem);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    color-mix(in srgb, var(--fairy-primary) 20%, transparent) 50%,
    transparent 100%
  );
  border-radius: 60% 20% 60% 20%;
  border: var(--spacing-px) solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(var(--spacing-1));
  animation: wing-flutter 1.2s var(--easing-ease-in-out) infinite alternate;
}

.wing-left {
  top: var(--spacing-1-5);
  left: calc(-1 * var(--spacing-1));
  transform: rotate(-20deg);
}

.wing-right {
  top: var(--spacing-1-5);
  right: calc(-1 * var(--spacing-1));
  transform: rotate(20deg);
  animation-delay: 0.6s;
}

@keyframes wing-flutter {
  from {
    opacity: 0.6;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Enhanced Fairy Body */
.fairy-body {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fairy-core {
  font-size: 1.8rem;
  animation: core-sparkle 2.5s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(0, 255, 122, 0.6));
  position: relative;
  z-index: 1;
}

.fairy-sparkles {
  position: absolute; /* Use .center-absolute class from design system */
}

.sparkle {
  position: absolute;
  font-size: 0.6rem;
  opacity: 0;
  animation: sparkle-dance 3s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
}

.sparkle:nth-child(1) {
  top: -20px;
  left: -15px;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: -10px;
  right: -20px;
  animation-delay: 1s;
}

.sparkle:nth-child(3) {
  bottom: -15px;
  left: -10px;
  animation-delay: 2s;
}

@keyframes core-sparkle {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(0, 255, 122, 0.6)) brightness(1)
      hue-rotate(0deg);
  }
  25% {
    filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.8)) brightness(1.2)
      hue-rotate(60deg);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.8)) brightness(1.4)
      hue-rotate(120deg);
  }
  75% {
    filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.8)) brightness(1.2)
      hue-rotate(240deg);
  }
}

@keyframes sparkle-dance {
  0%,
  100% {
    opacity: 0;
    transform: translate(0, 0) scale(0.5);
  }
  20%,
  80% {
    opacity: 1;
    transform: translate(var(--x, 5px), var(--y, -5px)) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(var(--x, 10px), var(--y, -10px)) scale(1.2);
  }
}

/* Clean Notification System */
.enhanced-pulse {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  z-index: 5;
}

.pulse-core {
  width: 12px;
  height: 12px;
  background: var(--fairy-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  font-weight: bold;
  color: var(--text-inverse);
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: pulse-bounce 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
}

.pulse-ring {
  position: absolute;
  inset: -2px;
  border: 1px solid rgba(236, 72, 153, 0.4);
  border-radius: 50%;
  animation: ring-expand 1.5s ease-in-out infinite;
}

@keyframes pulse-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes ring-expand {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* Clean Indicators */
.enhanced-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  animation: indicator-float 3s ease-in-out infinite;
}

.indicator-icon {
  font-size: 0.9rem;
  z-index: 1;
}

/* Voice Waves Animation */
.voice-waves {
  position: absolute; /* Use .center-absolute class from design system */
  width: 40px;
  height: 40px;
}

.wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: color-mix(in srgb, var(--color-success-500) 80%, transparent);
  border-radius: 50%;
  animation: voice-wave 1s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
}

.wave:nth-child(1) {
  transform: translate(-50%, -50%) translateX(-8px);
}
.wave:nth-child(2) {
  transform: translate(-50%, -50%) translateX(0px);
}
.wave:nth-child(3) {
  transform: translate(-50%, -50%) translateX(8px);
}

@keyframes voice-wave {
  0%,
  100% {
    transform: translate(-50%, -50%) translateX(var(--x, 0)) scaleY(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) translateX(var(--x, 0)) scaleY(2);
    opacity: 1;
  }
}

/* Thinking Dots Animation */
.thinking-dots {
  position: absolute; /* Use .center-absolute class from design system */
  width: 30px;
  height: 8px;
  display: flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 4px;
  height: 4px;
  background: color-mix(in srgb, var(--color-primary-500) 80%, transparent);
  border-radius: 50%;
  animation: thinking-bounce 1.4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
}

@keyframes thinking-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

@keyframes indicator-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Transition Animations */
.notification-appear-enter-active,
.indicator-appear-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-appear-leave-active,
.indicator-appear-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-appear-enter-from,
.indicator-appear-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(10px);
}

.notification-appear-leave-to,
.indicator-appear-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(-10px);
}

/* Clean Bubble Styling - Now handled by design-system.css */
/* Component-specific positioning */
/* Default bubble (inline, auto-sized to content) */
.fairy-bubble {
  position: fixed;
  bottom: calc(var(--spacing-16, 4rem) + env(safe-area-inset-bottom, 0px));
  right: calc(var(--spacing-2, 0.5rem) + env(safe-area-inset-right, 0px));
  display: flex;
  flex-direction: column;
  width: fit-content;
  min-width: 180px;
  max-width: min(80vw, 520px);
  height: auto;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  box-shadow: 
    0 10px 40px color-mix(in srgb, black 8%, transparent),
    0 2px 10px color-mix(in srgb, black 4%, transparent);
  overflow: hidden;
  z-index: 1060;
}

/* Empty bubble state - small and subtle */
.fairy-bubble.bubble-empty {
  min-width: 140px;
  max-width: 200px;
}

/* Persistent (expanded) bubble stays anchored - improved positioning */
.fairy-bubble.bubble-persistent {
  /* Expanded state sits a bit higher, still anchored */
  position: fixed;
  bottom: calc(var(--spacing-18, 4.5rem) + env(safe-area-inset-bottom, 0px));
  right: calc(var(--spacing-2, 0.5rem) + env(safe-area-inset-right, 0px));
  padding: 0;
}

.fairy-expanded .fairy-bubble {
  width: clamp(320px, 90vw, 520px);
  height: auto;             /* dynamic */
  max-height: 85vh;         /* viewport cap */
}

.bubble-content {
  margin-bottom: 1rem;
}

/* Glasmorphic teaser bubble (light/dark via CSS variables) */
.bubble-content--glass {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  border: none;
  border-radius: var(--radius-xl, 20px);
  /* Compact padding to align with glass-panel--compact */
  padding: var(--spacing-2) var(--spacing-3);
}

.bubble-content--glass .message-text {
  background: var(--glass-surface, #fff);
  color: var(--text-primary);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: 18px;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.bubble-content--glass {
  display: block;
}

.bubble-content--glass .message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.bubble-content--glass .glass-btn.ai-powered {
  background: linear-gradient(135deg,
    rgba(var(--color-primary-500-rgb), 0.15) 0%,
    rgba(var(--color-accent-500-rgb, 118,75,162), 0.12) 100%);
  border: 1px solid rgba(var(--color-primary-500-rgb), 0.35);
  color: var(--color-primary-600);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-lg, 14px);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.bubble-content--glass .glass-btn.ai-powered:hover {
  background: linear-gradient(135deg,
    rgba(var(--color-primary-500-rgb), 0.25) 0%,
    rgba(var(--color-accent-500-rgb, 118,75,162), 0.22) 100%);
  border-color: rgba(var(--color-primary-500-rgb), 0.5);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--color-primary-500-rgb), 0.22);
}

/* Dark theme adjustments are covered by variables via unified theme system */

/* Empty bubble state styling */
.bubble-content.bubble-empty-state {
  padding: var(--spacing-2) var(--spacing-3);
  min-height: auto;
}

.message-text--empty {
  padding: var(--spacing-2) var(--spacing-3) !important;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  background: var(--glass-surface-subtle, var(--glass-surface)) !important;
  /* Keep emoji aligned with text baseline in empty state */
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.fairy-emoji {
  opacity: 0.7;
  margin-left: var(--spacing-1);
  /* Prevent baseline drop on pop-in */
  line-height: 1;
  vertical-align: middle;
}

/* Prevent fairy container from squashing */
.ai-fairy-container {
  flex-shrink: 0;
  min-width: fit-content;
}

/* message-text and message-actions now inherit from unified design-system.css */

.fairy-chat-interface {
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: inherit;
}

.compact-ui .fairy-chat-interface {
  height: min(55vh, 440px);
}

/* Chat header inside expanded chat - Use master theme glassmorphic styling */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  /* Apply master theme glass-header class styles */
  background: var(--glass-surface);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
  top: 0;
  z-index: 3;
}

/* Subtle top glint line for header */
.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary-500) 20%, transparent), transparent);
  opacity: 0.28;
  pointer-events: none;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.chat-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.chat-gear-btn {
  width: var(--spacing-8);
  height: var(--spacing-8);
  border-radius: var(--radius-base);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
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
  transform: translateY(-1px);
  box-shadow: var(--glass-glow-primary);
}

.chat-title .mui-icon,
.control-btn .mui-icon,
.message-avatar .mui-icon {
  line-height: 1;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Deprecated: old in-avatar scroll button removed */

.chat-title .title-text {
  font-size: var(--font-size-sm);
}

/* Subtle shimmer on header icon to match fairy style */
.chat-title .mui-icon {
  animation: icon-shimmer 2.2s ease-in-out infinite;
}

@keyframes icon-shimmer {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 0 transparent); }
  50% { opacity: 0.7; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-primary-500) 40%, transparent)); }
}

.chat-status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1-5);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
}

.ptt-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  height: 18px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 40%, transparent);
  font-size: 10px;
  letter-spacing: 0.3px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 20%, transparent);
}

.status-dot.listening {
  background: var(--color-info-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-info-500) 30%, transparent);
}

.status-dot.thinking {
  background: var(--color-warning-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-warning-500) 30%, transparent);
  animation: status-pulse 1.6s ease-in-out infinite;
}

.status-dot.idle {
  background: var(--color-success-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success-500) 25%, transparent);
}

/* Tint the chip slightly by state */
.chat-status[data-state="listening"] {
  background: color-mix(in srgb, var(--color-info-500) 10%, var(--glass-bg));
  border-color: color-mix(in srgb, var(--color-info-500) 30%, var(--glass-border));
}
.chat-status[data-state="thinking"] {
  background: color-mix(in srgb, var(--color-warning-500) 10%, var(--glass-bg));
  border-color: color-mix(in srgb, var(--color-warning-500) 30%, var(--glass-border));
}
.chat-status[data-state="idle"] {
  background: color-mix(in srgb, var(--color-success-500) 8%, var(--glass-bg));
  border-color: color-mix(in srgb, var(--color-success-500) 25%, var(--glass-border));
}

/* Quick replies styling */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-1);
}

.quick-reply-btn {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.quick-reply-btn:hover {
  background: var(--glass-bg-light);
  border-color: var(--glass-border-cyber);
  box-shadow: var(--glass-glow-primary);
  transform: translateY(-1px);
}

@keyframes status-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.8; }
}

/* TTS inline panel styles removed (replaced by settings modal) */

/* Messages area spacing */
.chat-messages {
  padding: var(--spacing-3) var(--spacing-4);
}

/* Compact glass panel adjustments */
.fairy-chat-interface.glass-panel.glass-panel--compact {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* (legacy .tts-settings-header, .settings-title, .toggle-icon removed) */

/* (legacy .toggle-icon.rotated removed) */

.tts-settings-content {
  padding: var(--spacing-3);
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.settings-row:last-child {
  margin-bottom: 0;
  justify-content: center;
}

.settings-row label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  min-width: 80px;
}

.tts-slider {
  flex: 1;
  margin: 0 var(--spacing-2);
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--glass-bg-light);
  outline: none;
  transition: background var(--duration-fast) ease;
}

.tts-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary-500);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) ease;
}

.tts-slider::-webkit-slider-thumb:hover {
  background: var(--color-primary-600);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.tts-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary-500);
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) ease;
}

.tts-slider::-moz-range-thumb:hover {
  background: var(--color-primary-600);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.setting-value {
  font-size: var(--font-size-xs);
  color: var(--color-primary-500);
  font-weight: var(--font-weight-semibold);
  min-width: 40px;
  text-align: right;
}

.test-tts-btn {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--glass-bg-cyber);
  border: 1px solid var(--glass-border-cyber);
  color: var(--color-primary-500);
  transition: all var(--duration-normal) ease;
}

.test-tts-btn:hover:not(:disabled) {
  background: var(--glass-bg-gaming);
  border-color: var(--glass-border-gaming);
  box-shadow: var(--glass-glow-primary);
  transform: translateY(-1px);
}

.test-tts-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--glass-bg-weak);
  color: var(--text-disabled);
}

.panel-collapsed {
  background: var(--glass-bg-weak);
}

.tts-provider-select {
  flex: 1;
  margin: 0 var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--glass-border);
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
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.settings-info {
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--glass-border);
}

.provider-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.3;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2) 0;
  /* keep last message visible above sticky input */
  padding-bottom: var(--chat-input-offset, 88px);
  scroll-padding-bottom: var(--chat-input-offset, 88px);
  margin-bottom: var(--spacing-2);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  position: relative; /* allow overlay controls */
}

.chat-message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.message-user {
  flex-direction: row-reverse;
}

.message-user .message-content {
  background: var(--glass-bg-cyber);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  border: 1px solid var(--glass-border-cyber);
  border-radius: 18px 18px 5px 18px;
  box-shadow: var(--glass-shadow-sm);
}

.message-ai .message-content {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  border: 1px solid var(--glass-border);
  border-radius: 5px 18px 18px 18px;
  box-shadow: var(--glass-shadow-sm);
}

.message-system .message-content {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  border: 1px solid var(--color-warning-400);
  border-radius: 12px;
  box-shadow: var(--glass-shadow-sm);
}

.message-avatar {
  width: var(--spacing-8, 2rem);
  height: var(--spacing-8, 2rem);
  border-radius: var(--border-radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base, 1rem);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  border: var(--spacing-px, 1px) solid var(--glass-border);
  flex-shrink: 0;
  transition: all var(--transition-normal, 0.25s ease);
  box-shadow: var(--glass-shadow-sm);
}

.message-avatar:hover {
  background: var(--glass-bg-light);
  transform: scale(1.05);
  box-shadow: var(--glass-shadow-md);
}

.message-content {
  max-width: 75%;
  padding: var(--spacing-3);
  transition: all var(--duration-fast) var(--easing-ease);
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.message-content .message-text {
  line-height: 1.5;
}

/* Message bubble styling aligned to fairy design */
.message-ai .message-text {
  background: var(--glass-surface, #fff);
  color: var(--text-primary);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: 18px;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-user .message-text {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
  color: var(--text-inverse);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: 18px;
  border-top-right-radius: 4px;
  margin-left: auto;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

/* Rich text formatting inside messages */
.message-content .message-text a {
  color: var(--color-primary-500);
  text-decoration: underline;
}
.message-content .message-text code {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
  background: var(--surface-elevated);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 0 4px;
}
.message-content .message-text pre {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
  background: var(--surface-elevated);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  overflow: auto;
  white-space: pre;
}

/* Avatar styling per message type */
.message-ai .message-avatar {
  background: color-mix(in srgb, var(--color-primary-500) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-primary-500) 35%, transparent);
}
.message-user .message-avatar {
  background: color-mix(in srgb, var(--color-cyber-500, var(--color-secondary-500)) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-cyber-500, var(--color-secondary-500)) 35%, transparent);
}
.message-system .message-avatar {
  background: color-mix(in srgb, var(--color-warning-500) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-warning-500) 35%, transparent);
}

/* Distinct AI message treatment for readability */
.message-ai .message-content {
  border-left: 3px solid color-mix(in srgb, var(--color-primary-500) 60%, transparent);
}

.compact-ui .message-content {
  padding: var(--spacing-2);
}

.message-content:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.message-ai .message-content:hover .tts-replay-btn {
  opacity: 1;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  gap: var(--spacing-2);
}

/* Copy button, minimal ghost style */
.copy-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  font-size: var(--font-size-base);
}

.copy-btn:hover {
  background: var(--glass-bg-light);
  color: var(--color-primary-500);
}

.message-timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary-strong, var(--text-secondary));
  flex: 1;
}

/* TTS Replay Button */
.tts-replay-btn {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  color: var(--color-info-500);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  opacity: 0.6;
  flex-shrink: 0;
}

.tts-replay-btn:focus-visible {
  opacity: 1;
}

.tts-replay-btn:hover {
  opacity: 1;
  background: var(--glass-bg);
  border-color: var(--color-info-400);
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

.tts-replay-btn.playing {
  background: var(--color-success-100);
  border-color: var(--color-success-400);
  color: var(--color-success-600);
  opacity: 1;
  animation: tts-playing-pulse 1.5s ease-in-out infinite;
}

@keyframes tts-playing-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
  }
}

/* Hide replay button on hover for message-user */
.message-user .tts-replay-btn {
  display: none;
}

.chat-input-container {
  /* expose input offset for message list */
  --chat-input-offset: calc(var(--spacing-4) * 2 + 56px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--glass-border);
  padding: var(--spacing-4) var(--spacing-4) calc(var(--spacing-4) + env(safe-area-inset-bottom, 0px));
  position: sticky;
  bottom: 0;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
  z-index: 2;
}
.chat-input-container:focus-within {
  border-top-color: color-mix(in srgb, var(--color-primary-500) 35%, var(--glass-border));
  box-shadow: 0 -6px 20px color-mix(in srgb, var(--color-primary-500) 10%, transparent) inset;
}
.chat-input-container::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -8px;
  height: 8px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08), transparent);
}
@media (prefers-color-scheme: dark) {
  .chat-input-container::before { background: linear-gradient(to bottom, rgba(255,255,255,0.06), transparent); }
}

.multimodal-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.compact-ui .multimodal-controls {
  gap: 0.25rem;
}

.control-btn {
  width: var(--spacing-9);
  height: var(--spacing-9);
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
  min-width: 44px; /* touch target */
  min-height: 44px;
}

/* Accessible focus styles */
.fairy-avatar:focus-visible,
.control-btn:focus-visible,
.tts-replay-btn:focus-visible,
.glass-btn:focus-visible,
.tts-provider-select:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--fairy-primary) 45%, transparent);
  border-color: var(--color-primary-500);
}

.control-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-surface);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.control-btn:hover::before {
  opacity: 1;
}

.control-btn:hover {
  background: var(--control-hover-bg);
  color: var(--control-hover-fg);
  border-color: var(--control-border);
  transform: translateY(-1px);
  filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--color-primary-500) 18%, transparent));
}

.control-btn.active {
  background: var(--control-active-bg);
  color: var(--control-active-fg);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, var(--control-border));
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  animation: active-pulse 2s ease-in-out infinite;
}

@keyframes active-pulse {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(0, 255, 136, 0.3),
      0 4px 16px rgba(0, 255, 136, 0.2);
  }
  50% {
    box-shadow:
      0 0 30px rgba(0, 255, 136, 0.4),
      0 4px 20px rgba(0, 255, 136, 0.3);
  }
}

/* TTS Button Styling */
.control-btn[title*="text-to-speech"] {
  background: color-mix(in srgb, var(--color-info-500) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-info-500) 30%, transparent);
}

.control-btn[title*="text-to-speech"]:hover {
  background: color-mix(in srgb, var(--color-info-500) 20%, transparent);
  border-color: color-mix(in srgb, var(--color-info-500) 50%, transparent);
  box-shadow: 0 0 15px color-mix(in srgb, var(--color-info-500) 30%, transparent);
}

.control-btn[title*="text-to-speech"].active {
  background: color-mix(in srgb, var(--color-success-500) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-success-500) 40%, transparent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-success-500) 30%, transparent);
  animation: tts-active-pulse 2s ease-in-out infinite;
}

@keyframes tts-active-pulse {
  0%, 100% {
    box-shadow: 0 0 20px color-mix(in srgb, var(--color-success-500) 30%, transparent);
  }
  50% {
    box-shadow: 0 0 30px color-mix(in srgb, var(--color-success-500) 45%, transparent);
  }
}

/* AI Quick Message Button Styling */
.control-btn.ai-quick-message {
  background: color-mix(in srgb, var(--color-primary-600) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-primary-600) 30%, transparent);
}

.control-btn.ai-quick-message:hover {
  background: color-mix(in srgb, var(--color-primary-600) 20%, transparent);
  border-color: color-mix(in srgb, var(--color-primary-600) 50%, transparent);
  box-shadow: 0 0 15px color-mix(in srgb, var(--color-primary-600) 30%, transparent);
}

/* Video Streaming Active State */
.control-btn.active[title*="video"] {
  background: color-mix(in srgb, var(--color-warning-500) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-warning-500) 40%, transparent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-warning-500) 30%, transparent);
}

.text-input-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--spacing-2);
  align-items: center;
}

/* New redesigned input layout */
.primary-input-area {
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-end;
  margin-bottom: var(--spacing-3);
}

.input-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-shrink: 0;
}

.secondary-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--glass-border);
}

.control-group {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.media-controls {
  flex: 1;
}

.ai-controls {
  flex-shrink: 0;
}

.text-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--glass-border);
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
  border-color: var(--color-primary-500);
  background: var(--glass-bg-light);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.text-input::placeholder {
  color: var(--text-muted);
  transition: color var(--duration-fast) ease;
}

.fairy-input {
  flex: 1;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-in-out);
  font-family: inherit;
  min-height: 44px; /* touch target */
}

.fairy-textarea { resize: none; }

.fairy-input::placeholder {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.fairy-input:focus {
  outline: none;
  border-color: var(--glass-border-strong);
  background: var(--glass-hover-bg);
  box-shadow: var(--glass-glow-primary);
  transform: translateY(-1px);
}

.fairy-input:focus::placeholder {
  color: var(--text-primary);
}

.send-btn {
  width: var(--spacing-11);
  height: var(--spacing-11);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  transition: all var(--duration-normal) var(--easing-ease-in-out);
  position: relative;
  overflow: hidden;
}

.compact-ui .control-btn {
  width: var(--spacing-8);
  height: var(--spacing-8);
}

.send-btn::before { content: none; }

.send-btn:hover {
  background: var(--glass-hover-bg);
  border-color: var(--glass-border-strong);
  transform: translateY(-1px) scale(1.02);
  box-shadow: var(--glass-glow-primary);
}

.send-btn:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 0.1s;
}

.send-btn:disabled {
  opacity: 0.5;
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
  top: var(--spacing-3);
  right: var(--spacing-3);
  width: 32px;
  height: 32px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal);
  z-index: 10;
  position: relative;
  overflow: hidden;
}

.fairy-close::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-error-500) 8%, transparent),
    color-mix(in srgb, var(--color-error-400) 6%, transparent));
  opacity: 0;
  transition: opacity var(--duration-normal);
  border-radius: inherit;
}

.fairy-close:hover {
  background: var(--glass-bg);
  border-color: var(--glass-border-hover);
  color: var(--color-error-500);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 16px color-mix(in srgb, var(--color-error-500) 15%, transparent),
    inset 0 1px 0 color-mix(in srgb, white 10%, transparent);
}

.fairy-close:hover::before {
  opacity: 1;
}

.fairy-close:active {
  transform: translateY(0) scale(0.98);
  transition-duration: var(--duration-fast);
}

.fairy-close:focus {
  outline: 2px solid var(--color-error-500);
  outline-offset: 2px;
}

/* Dark theme optimizations */
@media (prefers-color-scheme: dark) {
  .fairy-close:hover {
    box-shadow: 
      0 4px 20px color-mix(in srgb, var(--color-error-500) 20%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }
}

/* Accessibility: Reduced motion support */
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

/* ===== NEW CLEAN CHAT INTERFACE STYLES ===== */

/* Clean Minimal Header */
.chat-header {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: var(--spacing-5) var(--spacing-6);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
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
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--color-success-500);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.thinking {
  background: var(--color-warning-500);
}

.status-dot.listening {
  background: var(--color-primary-500);
}

.header-actions {
  display: flex;
  gap: var(--spacing-2);
}

.header-btn {
  width: 32px;
  height: 32px;
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
  transform: translateY(-1px);
}

/* Messages Area */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-6);
  background: color-mix(in srgb, var(--surface-base) 98%, var(--color-primary-500) 2%);
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: var(--glass-border-hover);
}

/* Welcome Card */
.welcome-card {
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent) 0%, 
    color-mix(in srgb, var(--color-gaming-500) 10%, transparent) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.welcome-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.welcome-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Message Bubbles */
.message {
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: var(--font-size-md);
  flex-shrink: 0;
}

.message-user .message-avatar {
  background: var(--color-success-500);
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1-5);
}

.message-bubble {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-xl);
  border-top-left-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--text-primary);
  box-shadow: 0 1px 2px color-mix(in srgb, black 4%, transparent);
  max-width: 85%;
}

.message-bubble--user {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  color: var(--text-inverse);
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-sm);
  margin-left: auto;
  border: 1px solid var(--color-primary-400);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 0 var(--spacing-1);
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.message-action {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--duration-fast);
  opacity: 0;
}

.message:hover .message-action {
  opacity: 1;
}

.message-action:hover {
  background: var(--glass-bg);
  color: var(--text-secondary);
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  animation: fadeIn 0.3s ease;
}

.typing-bubble {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-xl);
  border-top-left-radius: var(--radius-sm);
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Quick Replies */
.quick-replies {
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  display: flex;
  gap: var(--spacing-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.quick-replies::-webkit-scrollbar {
  display: none;
}

.quick-reply {
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.quick-reply:hover {
  background: var(--glass-bg);
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
  transform: translateY(-1px);
}

/* Input Area */
.input-area {
  padding: var(--spacing-4);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
}

.input-container {
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  background: color-mix(in srgb, var(--surface-base) 95%, var(--color-primary-500) 5%);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-1) var(--spacing-1) var(--spacing-1) var(--spacing-3);
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-1);
  border: 2px solid transparent;
  transition: all var(--duration-fast);
}

.input-wrapper:focus-within {
  background: var(--glass-bg);
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-2-5) var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  resize: none;
  outline: none;
  max-height: 120px;
  line-height: 1.4;
  font-family: inherit;
}

.chat-input::placeholder {
  color: var(--text-tertiary);
}

/* Input Actions */
.input-actions {
  display: flex;
  gap: var(--spacing-0-5);
  align-items: center;
}

.input-btn {
  width: 32px;
  height: 32px;
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
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--text-secondary);
}

.send-btn {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  color: var(--text-inverse);
}

.send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4);
  background: color-mix(in srgb, var(--surface-base) 95%, var(--color-primary-500) 5%);
  border-top: 1px solid var(--glass-border);
}

.control-btn {
  flex: 1;
  height: 36px;
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
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-500);
}

/* Mobile Responsive Design */
@media (max-width: 640px) {
  .fairy-expanded .fairy-bubble {
    height: 100vh;
    max-width: 100%;
    border-radius: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .controls-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--glass-bg);
    border-top: 1px solid var(--glass-border);
    box-shadow: 0 -2px 10px color-mix(in srgb, black 5%, transparent);
  }

  .input-area {
    padding-bottom: 60px;
  }
}

/* Camera Modal */
.camera-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlay-fade-in 0.3s ease;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: var(--glass-backdrop-blur-sm);
  }
}

.camera-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: auto;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.camera-content {
  padding: 1rem;
  text-align: center;
}

.camera-content video {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.camera-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Settings modal overlay and container */
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlay-fade-in 0.3s ease;
}

.settings-modal {
  width: min(92vw, 560px);
  max-height: 80vh;
  overflow: auto;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--glass-border);
}

.settings-modal-header h3 {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: 700;
  font-size: 1rem;
}

.settings-modal-content {
  padding: var(--spacing-4);
}

/* Clean Transitions */
.bubble-appear-enter-active,
.bubble-appear-leave-active {
  transition: all 0.3s ease;
}

.bubble-appear-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.bubble-appear-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.chat-message {
  animation: message-slide-in 0.3s ease;
}

@keyframes message-slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth scrolling for chat messages */
.chat-messages {
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--glass-bg-weak);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--glass-bg);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--glass-bg-light);
}

/* Visually hidden but focusable skip link */
.visually-hidden-focusable {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.visually-hidden-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-sm);
}

/* Disabled control visual hint */
.control-btn[disabled],
.control-btn[aria-disabled="true"],
.send-btn[disabled],
.send-btn[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Floating scroll-to-bottom button inside chat */
.scroll-to-bottom-fab {
  position: absolute;
  right: var(--spacing-3);
  bottom: var(--spacing-3);
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-sm);
  color: var(--text-primary);
  cursor: pointer;
  z-index: 5;
}

.scroll-to-bottom-fab:hover {
  background: var(--glass-bg-light);
  box-shadow: var(--glass-shadow-md);
  transform: translateY(-1px);
}

/* Fallback spin animation for loading icon */
.mdi-spin {
  display: inline-flex;
  animation: mdi-spin 1s linear infinite;
}

@keyframes mdi-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Thinking skeleton */
.thinking-skeleton .message-content {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.skeleton-line {
  height: 10px;
  margin: 6px 0;
  border-radius: 6px;
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--glass-bg-light) 90%, transparent) 0%,
    color-mix(in srgb, var(--glass-bg) 90%, transparent) 50%,
    color-mix(in srgb, var(--glass-bg-light) 90%, transparent) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}

/* Tablet positioning adjustments */
@media (max-width: 768px) and (min-width: 481px) {
  .ai-fairy-container {
    bottom: calc(var(--spacing-5, 1.25rem) + env(safe-area-inset-bottom, 0px)) !important;
    right: calc(var(--spacing-5, 1.25rem) + env(safe-area-inset-right, 0px)) !important;
  }
}

/* Small screens: expand chat to viewport with improved positioning */
@media (max-width: 480px) {
  .ai-fairy-container {
    bottom: calc(var(--spacing-4, 1rem) + env(safe-area-inset-bottom, 0px)) !important;
    right: calc(var(--spacing-4, 1rem) + env(safe-area-inset-right, 0px)) !important;
    z-index: 9999 !important; /* Ensure mobile positioning takes precedence */
  }
  
  .fairy-expanded .fairy-bubble {
    width: calc(100vw - 2 * var(--spacing-4));
    right: var(--spacing-2);
    max-height: min(75vh, 620px);
  }
  
  .fairy-bubble.bubble-persistent {
    bottom: calc(var(--spacing-16, 4rem) + env(safe-area-inset-bottom, 0px));
    right: var(--spacing-2);
  }
  
  .fairy-chat-interface {
    height: min(65vh, 520px);
  }
  
  .message-content {
    max-width: 80%;
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *:not(.force-animate) {
    animation: none !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Clean Interactive States */
.fairy-pulsing {
  animation: container-pulse 3s var(--easing-ease-in-out) infinite;
}

.fairy-pulsing .fairy-glow {
  opacity: 0.4;
}

.fairy-pulsing .fairy-aura {
  opacity: 0.3;
}

@keyframes container-pulse {
  0%,
  100% {
    box-shadow:
      var(--shadow-lg),
      inset 0 var(--spacing-px) var(--spacing-1) rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow:
      0 var(--spacing-3) var(--spacing-10)
        color-mix(in srgb, var(--fairy-primary) 15%, transparent),
      var(--shadow-xl),
      inset 0 var(--spacing-px) var(--spacing-1) rgba(255, 255, 255, 0.25);
  }
}

.fairy-active {
  border-image: linear-gradient(
      135deg,
      color-mix(in srgb, var(--fairy-primary) 60%, transparent) 0%,
      color-mix(in srgb, var(--fairy-secondary) 40%, transparent) 25%,
      color-mix(in srgb, var(--fairy-tertiary) 40%, transparent) 75%,
      color-mix(in srgb, white 30%, transparent) 100%
    )
    1;
}

.fairy-active .fairy-glow {
  opacity: 0.6;
}

.fairy-active .fairy-aura {
  opacity: 0.4;
}

.fairy-chatting {
  transform: scale(1.02);
}

.fairy-chatting .fairy-avatar {
  border-color: color-mix(in srgb, var(--fairy-secondary) 40%, transparent);
  box-shadow: 0 0 var(--spacing-4)
    color-mix(in srgb, var(--fairy-secondary) 30%, transparent);
}

.fairy-expanded .fairy-avatar {
  /* Keep avatar perfectly still when chat is open */
  animation: none !important;
  transform: none !important;
}

.fairy-thinking .fairy-avatar {
  border-color: color-mix(in srgb, var(--fairy-tertiary) 40%, transparent);
  box-shadow: 0 0 var(--spacing-4)
    color-mix(in srgb, var(--fairy-tertiary) 30%, transparent);
  animation:
    fairy-float 6s var(--easing-ease-in-out) infinite,
    thinking-pulse 2s var(--easing-ease-in-out) infinite;
}

@keyframes thinking-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Clean Responsive Design */
@media (max-width: 768px) {
  .ai-fairy-container {
    width: var(--spacing-16);
    height: var(--spacing-16);
    bottom: var(--spacing-20);
    right: var(--spacing-4);
  }

  .fairy-avatar {
    width: var(--spacing-13, 3.25rem);
    height: var(--spacing-13, 3.25rem);
  }

  .particle-system {
    width: var(--spacing-12);
    height: var(--spacing-12);
  }

  .particle {
    width: var(--spacing-px);
    height: var(--spacing-px);
  }

  .wing {
    width: var(--spacing-3);
    height: var(--spacing-4);
  }

  .enhanced-indicator {
    width: var(--spacing-5);
    height: var(--spacing-5);
    top: calc(-1 * var(--spacing-1-5));
    right: calc(-1 * var(--spacing-1-5));
  }

  .enhanced-pulse {
    width: var(--spacing-3-5);
    height: var(--spacing-3-5);
    top: calc(-1 * var(--spacing-1));
    right: calc(-1 * var(--spacing-1));
  }

  .pulse-core {
    width: var(--spacing-2-5);
    height: var(--spacing-2-5);
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .ai-fairy-container {
    width: var(--spacing-14);
    height: var(--spacing-14);
  }

  .fairy-avatar {
    width: var(--spacing-11);
    height: var(--spacing-11);
  }

  .fairy-core {
    font-size: var(--font-size-lg);
  }
}

/* Performance Optimizations */
@media (max-width: 768px) {
  .particle-system {
    display: none;
  }

  .fairy-aura {
    animation-duration: var(--duration-extra-slow, 16s);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
  }

  .fairy-avatar:hover {
    transform: scale(1.02);
  }
}

@media (prefers-contrast: high) {
  .ai-fairy-container {
    border-width: 3px;
  }

  .fairy-avatar {
    border-width: 2px;
    border-color: var(--fairy-primary);
  }
}

/* Bubble Size States */
.fairy-small-mode {
  width: var(--spacing-12, 3rem) !important;
  height: var(--spacing-12, 3rem) !important;
  opacity: 0.8;
}

.fairy-small-mode .fairy-character {
  transform: scale(0.75);
}

.fairy-small-mode .fairy-bubble {
  transform: scale(0.85);
  max-width: 280px;
}

.fairy-small-mode:hover {
  opacity: 1;
  transform: scale(1.05);
}

.fairy-full-mode {
  width: var(--spacing-18, 4.5rem) !important;
  height: var(--spacing-18, 4.5rem) !important;
}

.fairy-hidden {
  width: var(--spacing-10, 2.5rem) !important;
  height: var(--spacing-10, 2.5rem) !important;
  opacity: 0.6;
}

.fairy-hidden .fairy-character {
  transform: scale(0.6);
}

.fairy-hidden:hover {
  opacity: 0.9;
  transform: scale(1.1);
}

/* Page-aware small mode tooltip */
.fairy-small-mode::after {
  content: 'Page aware • Click to expand';
  position: absolute;
  bottom: 120%;
  right: 0;
  background: var(--surface-elevated);
  color: var(--text-primary);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) ease;
  border: 1px solid var(--border-base);
  box-shadow: var(--shadow-md);
  z-index: 10000;
}

.fairy-small-mode:hover::after {
  opacity: 1;
}

/* Hidden mode tooltip */
.fairy-hidden::after {
  content: 'Chat hidden • Click to show';
  position: absolute;
  bottom: 120%;
  right: 0;
  background: var(--surface-elevated);
  color: var(--text-primary);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) ease;
  border: 1px solid var(--border-base);
  box-shadow: var(--shadow-md);
  z-index: 10000;
}

.fairy-hidden:hover::after {
  opacity: 1;
}

/* Visual indicator for different states */
.fairy-small-mode .status-ring,
.fairy-small-mode .selection-ring {
  border-color: var(--color-warning-400);
  animation: pulse-warning 2s infinite;
}

.fairy-full-mode .status-ring,
.fairy-full-mode .selection-ring {
  border-color: var(--color-success-400);
  animation: pulse-success 2s infinite;
}

.fairy-hidden .status-ring,
.fairy-hidden .selection-ring {
  border-color: var(--color-gray-400);
  animation: pulse-hidden 3s infinite;
}

@keyframes pulse-warning {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes pulse-success {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes pulse-hidden {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Page indicator for small mode */
.page-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-info-500);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--surface-elevated);
}

.page-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: pulse-page 1.5s infinite;
}

@keyframes pulse-page {
  0%, 100% { opacity: 0.6; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@media (hover: none) {
  .particle-system {
    display: none;
  }
}
</style>
