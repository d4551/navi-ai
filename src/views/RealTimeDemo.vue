<template>
  <StandardPageLayout 
    page-type="gaming" 
    content-spacing="none" 
    max-width="full"
    title="NAVI Live Chat"
    subtitle="Next-generation AI conversation experience"
    :header-context="{ sessionActive: isSessionActive, mode: selectedMode, persona: selectedPersona }"
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
          <p>Enter your Google AI Studio API key to unlock NAVI's full potential</p>
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
            <a href="https://aistudio.google.com/app/apikey" target="_blank" class="help-link">
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
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          <AppIcon :name="sidebarCollapsed ? 'mdi-menu' : 'mdi-close'" />
        </button>
        
        <div class="sidebar-content">
          <h3>Experience Mode</h3>
          <div class="mode-list">
            <button
              v-for="mode in demoModes"
              :key="mode.id"
              class="mode-option"
              :class="{ active: selectedMode === mode.id, disabled: !mode.supported }"
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
            <select v-model="selectedPersona" class="persona-select" :disabled="isSessionActive">
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
            <p>Choose an experience mode from the sidebar to begin your AI conversation</p>
            
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
              <div class="feature" :class="{ supported: isScreenShareSupported }">
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
import AppIcon from '@/components/ui/AppIcon.vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

import { ref, onMounted, computed, watch } from 'vue'
import { useRealTimeSupport } from '@/composables/useRealTimeChat';
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme';
import RealTimeChat from '@/components/RealTimeChat.vue';
// import PageHeader from '@/components/ui/PageHeader.vue' // Removed - not used in new design

// Reactive state
const tempApiKey = ref('');
const apiKey = ref('');
const selectedMode = ref(null);
const selectedPersona = ref('navi');
const error = ref(null);
const sessionStats = ref(null);
const sidebarCollapsed = ref(false);

// Composables
const {
  isAudioSupported,
  isVideoSupported,
  isScreenShareSupported,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  allFeaturesSupported
} = useRealTimeSupport();

// Theme composable
const {
  isDark,
  isLight,
  colorScheme,
  getThemeClasses,
  toggleTheme
} = useUnifiedTheme();

// Computed
const hasApiKey = computed(() => !!apiKey.value);

const demoModes = computed(() => [
  {
    id: 'audio',
    title: 'Voice Chat',
    description: 'Natural voice conversation',
    icon: 'mdi-microphone',
    supported: isAudioSupported.value && isSpeechRecognitionSupported.value
  },
  {
    id: 'video',
    title: 'Video Chat',
    description: 'AI can see and analyze you',
    icon: 'mdi-video',
    supported: isVideoSupported.value && isAudioSupported.value
  },
  {
    id: 'screen',
    title: 'Screen Assistant',
    description: 'Help with your screen content',
    icon: 'mdi-monitor-share',
    supported: isScreenShareSupported.value
  },
  {
    id: 'multimodal',
    title: 'Full Experience',
    description: 'All capabilities combined',
    icon: 'mdi-brain',
    supported: allFeaturesSupported.value
  }
]);

const getStatusClass = () => {
  if (error.value) return 'status-error';
  if (sessionStats.value) return 'status-active';
  if (hasApiKey.value) return 'status-ready';
  return 'status-setup';
};

const getStatusText = () => {
  if (error.value) return 'Error';
  if (sessionStats.value) return 'Live Session';
  if (hasApiKey.value && selectedMode.value) return 'Ready to Chat';
  if (hasApiKey.value) return 'Select Mode';
  return 'Setup Required';
};

// Methods
function setApiKey() {
  if (tempApiKey.value.trim()) {
    apiKey.value = tempApiKey.value.trim();
    tempApiKey.value = '';
    error.value = null;
  }
}

function selectMode(modeId) {
  selectedMode.value = modeId;
  error.value = null;
}

function getModeTitle(modeId) {
  const mode = demoModes.value.find(m => m.id === modeId);
  return mode ? mode.title : modeId;
}

function handleSessionStart(session) {
  sessionStats.value = {
    mode: getModeTitle(session.type),
    messages: 0,
    duration: '00:00'
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
    sessionStats.value.duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  const savedKey = localStorage.getItem('demo-api-key');
  if (savedKey) {
    apiKey.value = savedKey;
  }
});

// Watch for API key changes to save it
watch(apiKey, (newKey) => {
  if (newKey) {
    localStorage.setItem('demo-api-key', newKey);
  }
});
</script>

<style scoped>
/* Modern Real-Time Demo Styles - Now integrated with StandardPageLayout */

/* Header Actions Styling */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-full);
  color: var(--color-primary-500);
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.theme-toggle:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.theme-toggle:active {
  transform: scale(0.95);
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
  border: 1px solid transparent;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: var(--transition-normal);
}

.status-setup {
  background: var(--color-warning-50);
  color: var(--color-warning-600);
  border-color: var(--color-warning-500);
}

.status-setup .status-dot {
  background: var(--color-warning-500);
}

.status-ready {
  background: var(--color-success-50);
  color: var(--color-success-600);
  border-color: var(--color-success-500);
}

.status-ready .status-dot {
  background: var(--color-success-500);
}

.status-active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-md);
}

.status-active .status-dot {
  background: var(--color-primary-500);
  animation: pulse 2s infinite;
}

.status-error {
  background: var(--color-error-50);
  color: var(--color-error-600);
  border-color: var(--color-error-500);
}

.status-error .status-dot {
  background: var(--color-error-500);
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.2); 
  }
}

/* API Setup Modal */
.api-setup-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: var(--surface-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.modal-content {
  position: relative;
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-3xl);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-2xl);
  transition: var(--transition-normal);
  overflow: hidden;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
}

.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.header-icon {
  font-size: var(--font-size-4xl);
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(0 0 20px var(--color-primary-500));
  opacity: 0.9;
}

.modal-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: var(--letter-spacing-wide);
}

.modal-header p {
  color: var(--text-secondary);
  margin: 0;
  font-family: var(--font-family-primary);
  line-height: var(--line-height-relaxed);
}

.api-key-input {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.modern-input {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-family: var(--font-family-primary);
  transition: var(--transition-normal);
}

.modern-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  background: var(--surface-container);
  box-shadow: 0 0 0 3px var(--color-primary-50);
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
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
}

.help-link:hover {
  color: var(--color-primary-400);
  text-decoration: underline;
  transform: translateY(-1px);
}

/* Chat Interface - Updated for StandardPageLayout */
.chat-interface {
  display: flex;
  min-height: calc(100vh - 200px);
  background: var(--surface-base);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

/* Mode Sidebar */
.mode-sidebar {
  width: 320px;
  background: var(--surface-elevated);
  border-right: 1px solid var(--border-base);
  padding: var(--spacing-2xl);
  overflow-y: auto;
  transition: var(--transition-normal);
}

.mode-sidebar.collapsed {
  width: 60px;
  padding: var(--spacing-md);
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: var(--transition-normal);
}

.sidebar-toggle:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-500);
  transform: scale(1.05);
}

.sidebar-content {
  opacity: 1;
  transition: var(--transition-normal);
}

.collapsed .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

.sidebar-content h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xl) 0;
  letter-spacing: var(--letter-spacing-wide);
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.mode-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  text-align: left;
  font-family: var(--font-family-primary);
  position: relative;
  overflow: hidden;
}

.mode-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--color-primary-100), transparent);
  transition: var(--transition-normal);
}

.mode-option:hover:not(.disabled) {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.mode-option:hover:not(.disabled)::before {
  left: 100%;
}

.mode-option.active {
  background: var(--color-primary-100);
  border-color: var(--color-primary-500);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  color: var(--color-primary-700);
  position: relative;
}

.mode-option.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--color-primary-500);
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}

.mode-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  font-size: var(--font-size-xl);
  color: var(--color-primary-500);
  min-width: 32px;
}

.mode-info {
  flex: 1;
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
  color: var(--color-warning-600);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Persona Section */
.persona-section {
  border-top: 1px solid var(--border-base);
  padding-top: var(--spacing-xl);
}

.persona-section h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  letter-spacing: var(--letter-spacing-normal);
}

.persona-select {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  transition: var(--transition-normal);
}

.persona-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

/* Chat Area */
.chat-area {
  flex: 1;
  position: relative;
  background: var(--surface-container);
  transition: var(--transition-normal);
}

.enhanced-chat {
  height: 100%;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-3xl);
  position: relative;
  background: 
    radial-gradient(circle at 30% 30%, var(--color-primary-500) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, var(--color-secondary-500) 0%, transparent 50%);
  background-size: 100% 100%;
  background-attachment: fixed;
}

.welcome-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--surface-container);
  opacity: 0.95;
}

.welcome-content {
  text-align: center;
  max-width: var(--page-narrow-width);
  position: relative;
  z-index: 1;
}

.welcome-icon {
  font-size: var(--font-size-4xl);
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-2xl);
  filter: drop-shadow(0 0 30px var(--color-primary-500));
  opacity: 0.9;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { filter: drop-shadow(0 0 20px var(--color-primary-500)); }
  to { filter: drop-shadow(0 0 40px var(--color-primary-300)); }
}

.welcome-content h2 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-gaming);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: var(--letter-spacing-wide);
}

.welcome-content p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-3xl) 0;
  font-family: var(--font-family-primary);
  line-height: var(--line-height-relaxed);
}

.feature-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-3xl);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.feature::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent, var(--color-primary-100), transparent);
  animation: rotate 8s linear infinite;
  opacity: 0;
  transition: var(--transition-normal);
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.feature:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.feature:hover::before {
  opacity: 0.3;
}

.feature.supported {
  background: var(--color-success-50);
  border-color: var(--color-success-300);
  color: var(--color-success-700);
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-success-500) 10%, transparent);
}

.feature.supported:hover {
  background: var(--color-success-100);
  border-color: var(--color-success-400);
  box-shadow: 0 0 30px color-mix(in srgb, var(--color-success-500) 20%, transparent);
}

.feature:not(.supported) {
  opacity: 0.6;
  color: var(--text-muted);
}

.feature:not(.supported):hover {
  opacity: 0.7;
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

/* Floating Stats */
.floating-stats {
  position: fixed;
  top: 100px;
  right: var(--spacing-2xl);
  z-index: 100;
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-normal);
  min-width: 200px;
}

.floating-stats:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-2xl);
  border-color: var(--color-primary-300);
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
  color: var(--color-primary-500);
  font-size: var(--font-size-md);
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: var(--spacing-2xl);
  right: var(--spacing-2xl);
  z-index: 1000;
  max-width: 400px;
  animation: slideInUp 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: var(--color-error-500);
  color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-error-400);
  position: relative;
  overflow: hidden;
}

.toast-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-error-300);
  animation: shrink 5s linear forwards;
}

@keyframes shrink {
  0% { width: 100%; }
  100% { width: 0%; }
}

.error-icon {
  font-size: var(--font-size-xl);
  color: white;
  margin-top: var(--spacing-xs);
}

.error-message {
  flex: 1;
}

.error-message strong {
  display: block;
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-md);
}

.error-message p {
  margin: 0;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-primary);
  opacity: 0.95;
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
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  border-radius: var(--border-radius-sm);
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .mode-option,
  .feature,
  .modal-content,
  .floating-stats {
    border-width: 2px;
  }
  
  .status-dot {
    border: 2px solid currentColor;
  }
}

/* Accessibility Enhancements */
.mode-option:focus-visible,
.theme-toggle:focus-visible,
.persona-select:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.sidebar-toggle:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .mode-option::before,
  .feature::before,
  .toast-content::before,
  .welcome-icon,
  * {
    animation: none !important;
    transition: none !important;
  }
  
  .mode-option:hover:not(.disabled),
  .feature:hover {
    transform: none !important;
  }
}

/* Enhanced Responsive Design */
@media (max-width: 1024px) {
  .mode-sidebar {
    width: 280px;
  }
  
  .chat-interface {
    border-radius: var(--border-radius-md);
  }
  
  .floating-stats {
    position: static;
    margin: var(--spacing-md) 0;
    border-radius: var(--border-radius-md);
  }
  
  .stats-content {
    flex-direction: row;
    justify-content: space-around;
  }
}

@media (max-width: 768px) {
  .chat-interface {
    flex-direction: column;
    min-height: calc(100vh - 160px);
    border-radius: var(--border-radius-sm);
  }
  
  .mode-sidebar {
    position: relative;
    width: 100%;
    order: -1;
    padding: var(--spacing-md);
    border-right: none;
    border-bottom: 1px solid var(--border-base);
    max-height: 200px;
    overflow-y: auto;
  }
  
  .mode-sidebar.collapsed {
    max-height: 60px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .sidebar-content {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-lg);
    align-items: center;
  }
  
  .collapsed .sidebar-content {
    opacity: 1;
    pointer-events: auto;
  }
  
  .mode-list {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-sm);
    margin: 0;
    flex-wrap: wrap;
  }
  
  .mode-option {
    padding: var(--spacing-sm) var(--spacing-md);
    min-width: auto;
    flex-shrink: 0;
  }
  
  .chat-area {
    flex: 1;
    min-height: 400px;
  }
  
  .modal-content {
    padding: var(--spacing-2xl);
    margin: var(--spacing-md);
    border-radius: var(--border-radius-lg);
  }
  
  .api-key-input {
    flex-direction: column;
  }
  
  .welcome-content h2 {
    font-size: var(--font-size-3xl);
  }
  
  .feature-highlights {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
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
  
  .welcome-content h2 {
    font-size: var(--font-size-2xl);
  }
  
  .feature-highlights {
    grid-template-columns: 1fr;
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
    max-width: calc(100vw - var(--spacing-lg));
  }
}
</style>
