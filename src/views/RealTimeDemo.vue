<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="none"
    max-width="full"
    title="NAVI Live Chat"
    subtitle="Next-generation AI conversation experience"
    :header-context="{
      sessionActive: isSessionActive,
      mode: selectedMode,
      persona: selectedPersona,
    }"
  >
    <template #header-actions>
      <button
        class="theme-toggle"
        :title="`Switch to ${isDark ? 'light' : 'dark'} theme`"
        aria-label="Toggle theme"
        @click="toggleTheme"
      >
        <AppIcon :name="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
      </button>
      <div class="status-indicator" :class="getStatusClass()">
        <div class="status-dot"></div>
        <span>{{ getStatusText() }}</span>
      </div>
    </template>
    <!-- API Key Setup Modal -->
    <div v-if="!hasApiKey" class="api-setup-modal">
      <div class="modal-content glass-surface">
        <div class="modal-header">
          <AppIcon name="mdi-key" class="header-icon" />
          <h2>Connect Your AI</h2>
          <p>
            Enter your Google AI Studio API key to unlock NAVI's full potential
          </p>
        </div>
        <div class="modal-body">
          <div class="api-key-input">
            <input
              v-model="tempApiKey"
              type="password"
              placeholder="Paste your Google AI API key here..."
              class="modern-input"
              @keypress.enter="setApiKey"
            />
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-connection"
              :disabled="!tempApiKey.trim()"
              @click="setApiKey"
            >
              Connect
            </UnifiedButton>
          </div>
          <div class="api-help">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              class="help-link"
            >
              <AppIcon name="mdi-open-in-new" />
              Get your free API key
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Interface -->
    <div v-if="hasApiKey" class="chat-interface">
      <!-- Mode Selection Sidebar -->
      <div class="mode-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <button
          class="sidebar-toggle"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <AppIcon :name="sidebarCollapsed ? 'mdi-menu' : 'mdi-close'" />
        </button>

        <div class="sidebar-content">
          <h3>Experience Mode</h3>
          <div class="mode-list">
            <button
              v-for="mode in demoModes"
              :key="mode.id"
              class="mode-option"
              :class="{
                active: selectedMode === mode.id,
                disabled: !mode.supported,
              }"
              :disabled="!mode.supported || isSessionActive"
              @click="selectMode(mode.id)"
            >
              <div class="mode-icon">
                <AppIcon :name="mode.icon" />
              </div>
              <div class="mode-info">
                <div class="mode-title">{{ mode.title }}</div>
                <div class="mode-desc">{{ mode.description }}</div>
                <div v-if="!mode.supported" class="mode-warning">
                  <AppIcon name="mdi-alert" size="small" />
                  Not supported
                </div>
              </div>
            </button>
          </div>

          <!-- AI Persona Selection -->
          <div class="persona-section">
            <h4>AI Persona</h4>
            <select
              v-model="selectedPersona"
              class="persona-select"
              :disabled="isSessionActive"
            >
              <option value="navi">NAVI - Gaming Career Expert</option>
              <option value="coach">Career Coach - Professional Guide</option>
              <option value="mentor">Tech Mentor - Industry Insider</option>
              <option value="friend">Casual Friend - Relaxed Chat</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <RealTimeChat
          v-if="selectedMode"
          :api-key="apiKey"
          :initial-session-type="selectedMode"
          :persona="selectedPersona"
          class="enhanced-chat"
          @session-start="handleSessionStart"
          @session-end="handleSessionEnd"
          @message="handleMessage"
          @error="handleError"
        />

        <!-- Welcome Screen -->
        <div v-else class="welcome-screen">
          <div class="welcome-content">
            <div class="welcome-icon">
              <AppIcon name="mdi-robot" />
            </div>
            <h2>Welcome to NAVI Live</h2>
            <p>
              Choose an experience mode from the sidebar to begin your AI
              conversation
            </p>

            <!-- Feature Highlights -->
            <div class="feature-highlights">
              <div class="feature" :class="{ supported: isAudioSupported }">
                <AppIcon name="mdi-microphone" />
                <span>Voice Chat</span>
              </div>
              <div class="feature" :class="{ supported: isVideoSupported }">
                <AppIcon name="mdi-video" />
                <span>Video Analysis</span>
              </div>
              <div
                class="feature"
                :class="{ supported: isScreenShareSupported }"
              >
                <AppIcon name="mdi-monitor-share" />
                <span>Screen Sharing</span>
              </div>
              <div class="feature" :class="{ supported: allFeaturesSupported }">
                <AppIcon name="mdi-brain" />
                <span>Multimodal AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Session Stats -->
    <div v-if="sessionStats" class="floating-stats">
      <div class="stats-content">
        <div class="stat">
          <AppIcon name="mdi-clock" />
          <span>{{ sessionStats.duration }}</span>
        </div>
        <div class="stat">
          <AppIcon name="mdi-message" />
          <span>{{ sessionStats.messages }} msgs</span>
        </div>
        <div class="stat">
          <AppIcon name="mdi-brain" />
          <span>{{ sessionStats.mode }}</span>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="error" class="error-toast">
      <div class="toast-content">
        <AppIcon name="mdi-alert-circle" class="error-icon" />
        <div class="error-message">
          <strong>Error</strong>
          <p>{{ _error }}</p>
        </div>
        <button class="close-btn" @click="error = null">
          <AppIcon name="mdi-close" />
        </button>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

import AppIcon from "@/components/ui/AppIcon.vue";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

import { refcomputed, watch } from "vue";
import { useRealTimeSupport } from "@/composables/useRealTimeChat";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import RealTimeChat from "@/components/RealTimeChat.vue";
// import PageHeader from '@/components/ui/PageHeader.vue' // Removed - not used in new design

// Reactive state
const tempApiKey = ref("");
const apiKey = ref("");
const selectedMode = ref(null);
const selectedPersona = ref("navi");
const _error = ref(null);
const sessionStats = ref(null);
const sidebarCollapsed = ref(false);

// Composables
const {
  isAudioSupported,
  isVideoSupported,
  isScreenShareSupported,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  allFeaturesSupported,
} = useRealTimeSupport();

// Theme composable
const { isDark, isLight, colorScheme, getThemeClasses, toggleTheme } =
  useUnifiedTheme();

// Computed
const hasApiKey = computed(() => !!apiKey.value);

const demoModes = computed(() => [
  {
    id: "audio",
    title: "Voice Chat",
    description: "Natural voice conversation",
    icon: "mdi-microphone",
    supported: isAudioSupported.value && isSpeechRecognitionSupported.value,
  },
  {
    id: "video",
    title: "Video Chat",
    description: "AI can see and analyze you",
    icon: "mdi-video",
    supported: isVideoSupported.value && isAudioSupported.value,
  },
  {
    id: "screen",
    title: "Screen Assistant",
    description: "Help with your screen content",
    icon: "mdi-monitor-share",
    supported: isScreenShareSupported.value,
  },
  {
    id: "multimodal",
    title: "Full Experience",
    description: "All capabilities combined",
    icon: "mdi-brain",
    supported: allFeaturesSupported.value,
  },
]);

const getStatusClass = () => {
  if (error.value) return "status-error";
  if (sessionStats.value) return "status-active";
  if (hasApiKey.value) return "status-ready";
  return "status-setup";
};

const getStatusText = () => {
  if (error.value) return "Error";
  if (sessionStats.value) return "Live Session";
  if (hasApiKey.value && selectedMode.value) return "Ready to Chat";
  if (hasApiKey.value) return "Select Mode";
  return "Setup Required";
};

// Methods
function setApiKey() {
  if (tempApiKey.value.trim()) {
    apiKey.value = tempApiKey.value.trim();
    tempApiKey.value = "";
    error.value = null;
  }
}

function selectMode(modeId) {
  selectedMode.value = modeId;
  error.value = null;
}

function getModeTitle(modeId) {
  const mode = demoModes.value.find((m) => m.id === modeId);
  return mode ? mode.title : modeId;
}

function handleSessionStart(session) {
  sessionStats.value = {
    mode: getModeTitle(session.type),
    messages: 0,
    duration: "00:00",
  };

  // Start duration timer
  const startTime = Date.now();
  const timer = setInterval(() => {
    if (!sessionStats.value) {
      clearInterval(timer);
      return;
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    sessionStats.value.duration = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);

  // Store timer reference to clear it later
  sessionStats.value.timer = timer;

  // Auto-collapse sidebar on mobile after session starts
  if (window.innerWidth <= 768) {
    sidebarCollapsed.value = true;
  }
}

function handleSessionEnd() {
  if (sessionStats.value?.timer) {
    clearInterval(sessionStats.value.timer);
  }
  // Keep stats visible for a while, then clear
  setTimeout(() => {
    sessionStats.value = null;
  }, 5000);
}

function handleMessage(_message) {
  if (sessionStats.value) {
    sessionStats.value.messages++;
  }
}

function handleError(err) {
  error.value = err instanceof Error ? err.message : err.toString();
}

// Lifecycle
onMounted(() => {
  // Check for saved API key (in a real app, this would be more secure)
  const savedKey = localStorage.getItem("demo-api-key");
  if (savedKey) {
    apiKey.value = savedKey;
  }
});

// Watch for API key changes to save it
watch(apiKey, (newKey) => {
  if (newKey) {
    localStorage.setItem("demo-api-key", newKey);
  }
});
</script>

<style scoped>

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-elevated);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.theme-toggle:hover {
  box-shadow: var(--shadow-md);
}

.theme-toggle:active {
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-primary);
  transition: var(--transition-normal);
  backdrop-filter: var(--glass-backdrop-blur);
}

.status-dot {
  transition: var(--transition-normal);
}

.status-setup {
}

.status-setup .status-dot {
}

.status-ready {
}

.status-ready .status-dot {
}

.status-active {
  box-shadow: var(--shadow-md);
}

.status-active .status-dot {
}

.status-error {
}

.status-error .status-dot {
}

@keyframes pulse {
  }
  }
}

.api-setup-modal {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-overlay);
}

.modal-content {
  position: relative;
  background: var(--surface-elevated);
  border-radius: var(--border-radius-xl);
  transition: var(--transition-normal);
  overflow: hidden;
}

.modal-content::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

.modal-header {
  text-align: center;
}

.header-icon {
  margin-bottom: var(--spacing-md);
}

  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  letter-spacing: var(--letter-spacing-wide);
}

.modal-header p {
  color: var(--text-secondary);
  font-family: var(--font-family-primary);
  line-height: var(--line-height-relaxed);
}

.api-key-input {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.modern-input {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--surface-elevated);
  border-radius: var(--border-radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-family: var(--font-family-primary);
  transition: var(--transition-normal);
}

.modern-input:focus {
  outline: none;
  background: var(--surface-container);
}

.modern-input::placeholder {
  color: var(--text-muted);
}

.api-help {
  text-align: center;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
}

.help-link:hover {
  text-decoration: underline;
}

.chat-interface {
  display: flex;
  background: var(--surface-base);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.mode-sidebar {
  background: var(--surface-elevated);
  overflow-y: auto;
  transition: var(--transition-normal);
}

.mode-sidebar.collapsed {
  padding: var(--spacing-md);
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: var(--transition-normal);
}

.sidebar-toggle:hover {
}

.sidebar-content {
  transition: var(--transition-normal);
}

.collapsed .sidebar-content {
  pointer-events: none;
}

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  letter-spacing: var(--letter-spacing-wide);
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.mode-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--surface-elevated);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  text-align: left;
  font-family: var(--font-family-primary);
  position: relative;
  overflow: hidden;
}

.mode-option::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: var(--transition-normal);
}

.mode-option:hover:not(.disabled) {
  box-shadow: var(--shadow-md);
}

.mode-option:hover:not(.disabled)::before {
}

.mode-option.active {
  position: relative;
}

.mode-option.active::after {
  content: "";
  position: absolute;
}

.mode-option.disabled {
  cursor: not-allowed;
}

.mode-icon {
  font-size: var(--font-size-xl);
}

.mode-info {
}

.mode-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-md);
}

.mode-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-normal);
}

.mode-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.persona-section {
  padding-top: var(--spacing-xl);
}

  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  letter-spacing: var(--letter-spacing-normal);
}

.persona-select {
  padding: var(--spacing-md);
  background: var(--surface-elevated);
  border-radius: var(--border-radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  transition: var(--transition-normal);
}

.persona-select:focus {
  outline: none;
}

.chat-area {
  position: relative;
  background: var(--surface-container);
  transition: var(--transition-normal);
}

.enhanced-chat {
}

.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background:
    radial-gradient(
    ),
    radial-gradient(
    );
  background-attachment: fixed;
}

.welcome-screen::before {
  content: "";
  position: absolute;
  background: var(--surface-container);
}

.welcome-content {
  text-align: center;
  max-width: var(--page-narrow-width);
  position: relative;
}

.welcome-icon {
}

@keyframes glow {
  from {
  }
  to {
  }
}

  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: var(--letter-spacing-wide);
}

.welcome-content p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-family: var(--font-family-primary);
  line-height: var(--line-height-relaxed);
}

.feature-highlights {
  display: grid;
  gap: var(--spacing-xl);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  background: var(--surface-elevated);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.feature::before {
  content: "";
  position: absolute;
  background: conic-gradient(
    transparent,
    transparent
  );
  transition: var(--transition-normal);
}

@keyframes rotate {
  }
  }
}

.feature:hover {
  box-shadow: var(--shadow-xl);
}

.feature:hover::before {
}

.feature.supported {
}

.feature.supported:hover {
}

.feature:not(.supported) {
  color: var(--text-muted);
}

.feature:not(.supported):hover {
}

.feature i {
  font-size: var(--font-size-xl);
}

.feature span {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-primary);
  text-align: center;
}

.floating-stats {
  position: fixed;
  background: var(--surface-elevated);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-normal);
}

.floating-stats:hover {
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.stat i {
  font-size: var(--font-size-md);
}

.error-toast {
  position: fixed;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
}

.toast-content::before {
  content: "";
  position: absolute;
}

@keyframes shrink {
  }
  }
}

.error-icon {
  font-size: var(--font-size-xl);
  color: white;
  margin-top: var(--spacing-xs);
}

.error-message {
}

.error-message strong {
  display: block;
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-md);
}

.error-message p {
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  line-height: var(--line-height-normal);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}

.close-btn:hover {
  border-radius: var(--border-radius-sm);
}

@keyframes slideInUp {
  from {
  }
  to {
  }
}

@media (prefers-contrast: high) {
  .mode-option,
  .feature,
  .modal-content,
  .floating-stats {
  }

  .status-dot {
  }
}

.mode-option:focus-visible,
.theme-toggle:focus-visible,
.persona-select:focus-visible {
}

.sidebar-toggle:focus-visible {
  border-radius: var(--border-radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  .mode-option::before,
  .feature::before,
  .toast-content::before,
  .welcome-icon,
    animation: none !important;
    transition: none !important;
  }

  .mode-option:hover:not(.disabled),
  .feature:hover {
    transform: none !important;
  }
}

  .mode-sidebar {
  }

  .chat-interface {
    border-radius: var(--border-radius-md);
  }

  .floating-stats {
    position: static;
    border-radius: var(--border-radius-md);
  }

  .stats-content {
    flex-direction: row;
    justify-content: space-around;
  }
}

  .chat-interface {
    flex-direction: column;
    border-radius: var(--border-radius-sm);
  }

  .mode-sidebar {
    position: relative;
    padding: var(--spacing-md);
    border-right: none;
    overflow-y: auto;
  }

  .mode-sidebar.collapsed {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .sidebar-content {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-lg);
    align-items: center;
  }

  .collapsed .sidebar-content {
    pointer-events: auto;
  }

  .mode-list {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .mode-option {
    padding: var(--spacing-sm) var(--spacing-md);
    min-width: auto;
  }

  .chat-area {
  }

  .modal-content {
    margin: var(--spacing-md);
    border-radius: var(--border-radius-lg);
  }

  .api-key-input {
    flex-direction: column;
  }

  }

  .feature-highlights {
    gap: var(--spacing-md);
  }
}

  .mode-sidebar {
    padding: var(--spacing-sm);
  }

  .sidebar-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .mode-list {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .mode-option {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .welcome-content {
    padding: var(--spacing-md);
  }

  }

  .feature-highlights {
    gap: var(--spacing-sm);
  }

  .floating-stats {
    right: var(--spacing-sm);
    bottom: var(--spacing-sm);
    position: fixed;
    padding: var(--spacing-sm);
  }

  .error-toast {
    right: var(--spacing-sm);
    bottom: var(--spacing-sm);
  }
}
</style>
