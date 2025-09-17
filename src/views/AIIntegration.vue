<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
    class="font-sans"
  >
    <!-- AI Integration Header -->
    <div class="glass-card ai-integration-header">
      <div class="header-content">
        <AppIcon name="CpuChipIcon" />
        <h1>AI Integration Center</h1>
      </div>
      <div class="header-description">
        Monitor and manage AI service connectivity, real-time capabilities, and
        integration status across the platform.
      </div>
    </div>

    <!-- AI Service Status Dashboard -->
    <div class="ai-status-section glass-card">
      <h2>AI Service Status</h2>

      <div class="status-grid">
        <div class="status-item">
          <label>AI Initialized:</label>
          <span
            :class="
              aiIntegration.isAIInitialized ? 'status-success' : 'status-error'
            "
          >
            {{ aiIntegration.isAIInitialized ? 'Yes' : 'No' }}
          </span>
        </div>

        <div class="status-item">
          <label>Initializing:</label>
          <span
            :class="
              aiIntegration.aiInitializing ? 'status-warning' : 'status-info'
            "
          >
            {{ aiIntegration.aiInitializing ? 'Yes' : 'No' }}
          </span>
        </div>

        <div class="status-item">
          <label>Error:</label>
          <span
            :class="aiIntegration.aiError ? 'status-error' : 'status-success'"
          >
            {{ aiIntegration.aiError || 'None' }}
          </span>
        </div>

        <div class="status-item">
          <label>Has API Key:</label>
          <span
            :class="aiIntegration.hasAIKey ? 'status-success' : 'status-error'"
          >
            {{ aiIntegration.hasAIKey ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>

      <div class="service-actions">
        <UnifiedButton
          variant="primary"
          icon="PlayIcon"
          :loading="aiIntegration.aiInitializing"
          @click="initializeAI"
        >
          Initialize AI Services
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          icon="ArrowPathIcon"
          :loading="testing"
          @click="testConnection"
        >
          Test Connection
        </UnifiedButton>

        <UnifiedButton variant="ghost" icon="CogIcon" @click="openSettings">
          Configure Services
        </UnifiedButton>
      </div>
    </div>

    <!-- AI Service Capabilities -->
    <div class="ai-capabilities-section glass-card">
      <h2>AI Service Capabilities</h2>

      <div class="capabilities-grid">
        <div
          v-for="(enabled, capability) in aiIntegration.aiCapabilities"
          :key="capability"
          class="capability-item"
          :class="{ 'capability-enabled': enabled }"
        >
          <AppIcon :name="getCapabilityIcon(capability)" />
          <span class="capability-name">{{
            formatCapabilityName(capability)
          }}</span>
          <span :class="enabled ? 'status-success' : 'status-disabled'">
            {{ enabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
      </div>
    </div>

    <!-- AI Action Center -->
    <div class="ai-actions-section glass-card">
      <h2>AI Action Center</h2>

      <div class="actions-grid">
        <UnifiedButton
          v-for="action in testActions"
          :key="action.id"
          :variant="action.variant || 'outline'"
          :icon="action.icon"
          :loading="processingAction === action.id"
          @click="testAction(action)"
        >
          {{ action.label }}
        </UnifiedButton>
      </div>

      <div v-if="lastResult" class="test-result">
        <h3>Last Result:</h3>
        <div class="result-header">
          <span :class="lastResult.success ? 'status-success' : 'status-error'">
            {{ lastResult.success ? 'CheckIcon SUCCESS' : 'XMarkIcon FAILED' }}
          </span>
          <span class="result-timestamp">{{
            formatTime(lastResult.timestamp)
          }}</span>
        </div>
        <pre class="result-content">{{
          JSON.stringify(lastResult, null, 2)
        }}</pre>
      </div>
    </div>

    <!-- Real-time Features Test -->
    <div class="test-section glass-card">
      <h2>Real-time Features</h2>

      <div class="realtime-controls">
        <UnifiedButton
          variant="primary"
          icon="MicrophoneIcon"
          :loading="isRecording"
          @click="toggleAudioRecording"
        >
          {{ isRecording ? 'Stop Recording' : 'Start Audio Test' }}
        </UnifiedButton>

        <UnifiedButton
          variant="secondary"
          icon="VideoCameraIcon"
          :loading="isVideoStreaming"
          @click="toggleVideoStreaming"
        >
          {{ isVideoStreaming ? 'Stop Video' : 'Start Video Test' }}
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          icon="ComputerDesktopIcon"
          :loading="isScreenCapturing"
          @click="captureScreen"
        >
          Capture Screen
        </UnifiedButton>
      </div>

      <div v-if="realTimeStatus" class="realtime-status">
        <h4>Real-time Status:</h4>
        <div class="status-grid">
          <div class="status-item">
            <label>Session Active:</label>
            <span
              :class="
                realTimeStatus.sessionActive
                  ? 'status-success'
                  : 'status-disabled'
              "
            >
              {{ realTimeStatus.sessionActive ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="status-item">
            <label>Audio Streaming:</label>
            <span
              :class="
                realTimeStatus.audioStreaming
                  ? 'status-success'
                  : 'status-disabled'
              "
            >
              {{ realTimeStatus.audioStreaming ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="status-item">
            <label>Video Streaming:</label>
            <span
              :class="
                realTimeStatus.videoStreaming
                  ? 'status-success'
                  : 'status-disabled'
              "
            >
              {{ realTimeStatus.videoStreaming ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Health Check Results -->
    <div class="test-section glass-card">
      <h2>AI Health Check</h2>

      <UnifiedButton
        variant="outline"
        icon="HeartIcon"
        :loading="runningHealthCheck"
        @click="runHealthCheck"
      >
        Run Health Check
      </UnifiedButton>

      <div v-if="healthCheckResult" class="health-result">
        <div class="health-header">
          <span :class="`health-${healthCheckResult.status}`">
            {{ healthCheckResult.status.toUpperCase() }}
          </span>
          <span class="health-timestamp">{{
            formatTime(healthCheckResult.timestamp)
          }}</span>
        </div>

        <div class="health-details">
          <div v-if="healthCheckResult.details.tests" class="health-tests">
            <h4>Test Results:</h4>
            <div class="test-results-grid">
              <div
                v-for="(result, testName) in healthCheckResult.details.tests"
                :key="testName"
                class="test-result-item"
                :class="{
                  'test-passed': result === true,
                  'test-failed': result === false,
                }"
              >
                <AppIcon
                  :name="
                    result === true ? 'CheckIcon-circle' : 'mdi-alert-circle'
                  "
                />
                <span>{{ formatTestName(testName) }}</span>
              </div>
            </div>
          </div>

          <div v-if="healthCheckResult.details.summary" class="health-summary">
            <strong>{{ healthCheckResult.details.summary }}</strong>
          </div>

          <div
            v-if="healthCheckResult.details.tests?.errors?.length"
            class="health-errors"
          >
            <h4>Errors:</h4>
            <ul>
              <li
                v-for="error in healthCheckResult.details.tests.errors"
                :key="error"
              >
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="test-section glass-card">
      <h2>Event Log</h2>

      <div class="log-container">
        <div
          v-for="(event, index) in eventLog"
          :key="index"
          class="log-entry"
          :class="`log-${event.type}`"
        >
          <span class="log-time">{{ formatTime(event.timestamp) }}</span>
          <span class="log-type">{{ event.type.toUpperCase() }}</span>
          <span class="log-message">{{ event.message }}</span>
        </div>
      </div>

      <div class="log-actions">
        <UnifiedButton variant="ghost" icon="TrashIcon" @click="clearLog">
          Clear Log
        </UnifiedButton>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup>
import {
  ArrowPathIcon,
  CogIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  MicrophoneIcon,
  TrashIcon,
  VideoCameraIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon, PlayIcon } from '@heroicons/vue/24/solid'

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import { useAIIntegration } from '@/composables/useAIIntegration'
import { useToast } from '@/composables/useToast'
import { useAppStore } from '@/stores/app'
import { canonicalAI } from '@/modules/ai/CanonicalAIService'
import LiveMultimediaAIService from '@/shared/services/LiveMultimediaAIService'

const router = useRouter()
const aiIntegration = useAIIntegration()
const toast = useToast()
const store = useAppStore()

// State
const testing = ref(false)
const processingAction = ref(null)
const lastResult = ref(null)
const eventLog = ref([])

// Real-time features state
const isRecording = ref(false)
const isVideoStreaming = ref(false)
const isScreenCapturing = ref(false)
const realTimeStatus = ref(null)
const runningHealthCheck = ref(false)
const healthCheckResult = ref(null)

// Test actions
const testActions = [
  {
    id: 'generate_text',
    label: 'Generate Text',
    icon: 'mdi-text',
    variant: 'primary',
  },
  {
    id: 'analyze_resume',
    label: 'Analyze Resume',
    icon: 'DocumentIcon-document-outline',
    variant: 'outline',
  },
  {
    id: 'search_jobs',
    label: 'Search Jobs',
    icon: 'mdi-briefcase-search',
    variant: 'outline',
  },
  {
    id: 'realtime_chat',
    label: 'Realtime Chat',
    icon: 'mdi-chat',
    variant: 'gaming',
  },
  {
    id: 'multimodal_test',
    label: 'Multimodal Test',
    icon: 'PhotoIcon-multiple',
    variant: 'secondary',
  },
  {
    id: 'audio_processing',
    label: 'Audio Processing',
    icon: 'MicrophoneIcon',
    variant: 'outline',
  },
]

// Enhanced Methods
async function initializeAI() {
  try {
    addLog('info', 'Initializing enhanced AI services...')

    // Initialize canonical AI service
    await canonicalAI.initialize({
      geminiApiKey: getAPIKey(),
      primaryProvider: 'google',
      enableMultimodal: true,
      enableRealTime: true,
      enableContextPersistence: true,
    })

    // Initialize multimedia AI service
    const multimediaService = LiveMultimediaAIService.getInstance()
    await multimediaService.initialize({
      apiKey: getAPIKey(),
      enableAudio: true,
      enableVideo: true,
      enableScreenshot: true,
    })

    addLog('success', 'Enhanced AI services initialized successfully')
    toast.success('Enhanced AI initialized successfully!')

    // Update real-time status
    updateRealTimeStatus()
  } catch (error) {
    addLog('error', `Enhanced AI initialization error: ${error.message}`)
    toast.error(`Initialization failed: ${error.message}`)
  }
}

async function testConnection() {
  testing.value = true
  try {
    addLog('info', 'Testing enhanced AI connection...')

    // Test basic functionality
    const result = await canonicalAI.generateText(
      'Hello, this is a connection test.'
    )

    if (result.success) {
      addLog('success', 'AI connection test passed')
      lastResult.value = {
        ...result,
        timestamp: new Date(),
        testType: 'connection',
      }
      toast.success('Connection test passed!')
    } else {
      addLog('error', `Connection test failed: ${result.error}`)
      toast.error('Connection test failed')
    }
  } catch (error) {
    addLog('error', `Connection test error: ${error.message}`)
    toast.error(`Connection test failed: ${error.message}`)
  } finally {
    testing.value = false
  }
}

async function testAction(action) {
  processingAction.value = action.id
  try {
    addLog('info', `Testing ${action.label}...`)

    let result = null
    switch (action.id) {
      case 'generate_text': {
        result = await canonicalAI.generateText(
          'Generate a creative story about AI and gaming.'
        )
        break
      }

      case 'analyze_resume': {
        result = await canonicalAI.generateText(
          'Analyze this resume content for gaming industry positions.',
          {
            systemPrompt:
              'You are an expert resume analyst for the gaming industry.',
          }
        )
        break
      }

      case 'search_jobs': {
        result = await canonicalAI.generateText(
          'Find 5 suitable gaming industry jobs based on my skills in JavaScript and game development.',
          {
            systemPrompt:
              'You are a job search assistant specializing in gaming careers.',
          }
        )
        break
      }

      case 'realtime_chat': {
        const sessionId = `test-session-${Date.now()}`
        result = await canonicalAI.startRealTimeSession(sessionId, {
          onConnect: () => addLog('info', 'Real-time session connected'),
          onError: error =>
            addLog('error', `Real-time error: ${error.message}`),
        })

        if (result.success) {
          const chatResult = await canonicalAI.sendRealTimeMessage(
            sessionId,
            'Hello from real-time chat!'
          )
          result.chatResponse = chatResult
        }
        break
      }

      case 'multimodal_test': {
        result = await canonicalAI.generateMultimodal({
          text: 'This is a multimodal test with text input only.',
        })
        break
      }

      case 'audio_processing': {
        // Create mock audio data for testing
        const mockAudioData = new ArrayBuffer(1024)
        result = await canonicalAI.processAudio(mockAudioData, {
          format: 'wav',
          transcribeOnly: false,
          systemPrompt:
            'Please transcribe this audio and provide feedback on the gaming industry topic.',
        })
        break
      }
    }
    if (result?.success !== false) {
      addLog('success', `${action.label} completed successfully`)
      lastResult.value = {
        ...result,
        timestamp: new Date(),
        testType: action.id,
      }
      toast.success(`${action.label} completed!`)
    } else {
      addLog(
        'error',
        `${action.label} failed: ${result?.error || 'Unknown error'}`
      )
      toast.error(`${action.label} failed`)
    }
  } catch (error) {
    addLog('error', `${action.label} error: ${error.message}`)
    toast.error(`${action.label} failed: ${error.message}`)
  } finally {
    processingAction.value = null
  }
}

// Real-time feature methods
async function toggleAudioRecording() {
  const multimediaService = LiveMultimediaAIService.getInstance()

  if (isRecording.value) {
    multimediaService.stopAudioStreaming()
    isRecording.value = false
    addLog('info', 'Audio recording stopped')
  } else {
    try {
      await multimediaService.startAudioStreaming()
      isRecording.value = true
      addLog('success', 'Audio recording started')
    } catch (error) {
      addLog('error', `Audio recording failed: ${error.message}`)
      toast.error('Audio recording failed')
    }
  }
  updateRealTimeStatus()
}

async function toggleVideoStreaming() {
  const multimediaService = LiveMultimediaAIService.getInstance()

  if (isVideoStreaming.value) {
    multimediaService.stopVideoStreaming()
    isVideoStreaming.value = false
    addLog('info', 'Video streaming stopped')
  } else {
    try {
      await multimediaService.startVideoStreaming()
      isVideoStreaming.value = true
      addLog('success', 'Video streaming started')
    } catch (error) {
      addLog('error', `Video streaming failed: ${error.message}`)
      toast.error('Video streaming failed')
    }
  }
  updateRealTimeStatus()
}

async function captureScreen() {
  isScreenCapturing.value = true
  try {
    const multimediaService = LiveMultimediaAIService.getInstance()
    const result = await multimediaService.captureAndAnalyzeScreen()

    addLog('success', 'Screen captured and analyzed')
    lastResult.value = {
      ...result,
      timestamp: new Date(),
      testType: 'screen_capture',
    }
    toast.success('Screen capture completed!')
  } catch (error) {
    addLog('error', `Screen capture failed: ${error.message}`)
    toast.error('Screen capture failed')
  } finally {
    isScreenCapturing.value = false
  }
}

async function runHealthCheck() {
  runningHealthCheck.value = true
  try {
    addLog('info', 'Running comprehensive health check...')
    const health = await canonicalAI.healthCheck()

    healthCheckResult.value = {
      ...health,
      timestamp: new Date(),
    }

    const statusMsg = `Health check completed: ${health.status.toUpperCase()}`
    addLog(health.status === 'healthy' ? 'success' : 'warning', statusMsg)

    if (health.status === 'healthy') {
      toast.success('All AI services are healthy!')
    } else {
      toast.warning(`AI services status: ${health.status}`)
    }
  } catch (error) {
    addLog('error', `Health check failed: ${error.message}`)
    toast.error('Health check failed')
  } finally {
    runningHealthCheck.value = false
  }
}

function updateRealTimeStatus() {
  const multimediaService = LiveMultimediaAIService.getInstance()
  const streamingState = multimediaService.getStreamingState()

  realTimeStatus.value = {
    sessionActive: canonicalAI.isReady,
    audioStreaming: streamingState?.isAudioStreaming || false,
    videoStreaming: streamingState?.isVideoStreaming || false,
  }
}

// Utility methods
function getAPIKey() {
  // Get API key from store settings
  return (
    store.settings?.geminiApiKey || localStorage.getItem('gemini_api_key') || ''
  )
}

function openSettings() {
  // Navigate to settings page with AI tab active
  router.push('/settings?tab=ai')
  toast.info('Redirecting to AI settings...')
}

function getCapabilityIcon(capability) {
  const iconMap = {
    multimodal: 'PhotoIcon-multiple',
    realTime: 'ClockIcon-fast',
    contextPersistence: 'mdi-memory',
    streaming: 'mdi-stream',
    audio: 'MicrophoneIcon',
    video: 'VideoCameraIcon',
  }
  return iconMap[capability] || 'CheckIcon-circle'
}

function formatCapabilityName(capability) {
  return capability
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

function formatTestName(testName) {
  return testName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

function addLog(type, message) {
  eventLog.value.unshift({
    type,
    message,
    timestamp: new Date(),
  })

  // Keep only last 50 log entries
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

function clearLog() {
  eventLog.value = []
  addLog('info', 'Event log cleared')
}

function formatTime(date) {
  return date ? new Date(date).toLocaleTimeString() : ''
}

// Lifecycle
onMounted(() => {
  addLog('info', 'AI Integration Center loaded')
  updateRealTimeStatus()
})

onUnmounted(() => {
  // Clean up any running services
  if (isRecording.value) {
    const multimediaService = LiveMultimediaAIService.getInstance()
    multimediaService.stopAudioStreaming()
  }
  if (isVideoStreaming.value) {
    const multimediaService = LiveMultimediaAIService.getInstance()
    multimediaService.stopVideoStreaming()
  }
})
</script>

<style scoped lang="scss">
.ai-integration-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    h1 {
      margin: 0;
      color: rgb(var(--v-theme-primary));
    }
  }

  .header-description {
    color: rgba(var(--v-theme-on-surface), 0.7);
    font-size: 1.1rem;
  }
}

.ai-status-section,
.ai-capabilities-section,
.ai-actions-section {
  margin-bottom: 2rem;

  h2 {
    color: rgb(var(--v-theme-primary));
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(var(--v-theme-surface-variant), 0.1);
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-outline), 0.2);

    label {
      font-weight: 500;
      color: rgba(var(--v-theme-on-surface), 0.8);
    }
  }
}

.status-success {
  color: rgb(var(--v-theme-success)) !important;
  font-weight: 600;
}

.status-error {
  color: rgb(var(--v-theme-error)) !important;
  font-weight: 600;
}

.status-warning {
  color: rgb(var(--v-theme-warning)) !important;
  font-weight: 600;
}

.status-info {
  color: rgb(var(--v-theme-info)) !important;
}

.status-disabled {
  color: rgba(var(--v-theme-on-surface), 0.5) !important;
}

.service-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  .capability-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(var(--v-theme-surface-variant), 0.1);
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-outline), 0.2);
    transition: all 0.3s ease;

    &.capability-enabled {
      background: rgba(var(--v-theme-success), 0.1);
      border-color: rgba(var(--v-theme-success), 0.3);
    }

    .capability-name {
      flex: 1;
      font-weight: 500;
    }
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.test-result {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);

  h3 {
    margin: 0 0 1rem 0;
    color: rgb(var(--v-theme-primary));
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;

    .result-timestamp {
      color: rgba(var(--v-theme-on-surface), 0.6);
      font-size: 0.9rem;
    }
  }

  .result-content {
    background: rgba(var(--v-theme-surface), 0.5);
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
}

.realtime-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.realtime-status {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);

  h4 {
    margin: 0 0 0.5rem 0;
    color: rgb(var(--v-theme-primary));
  }
}

.health-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);

  .health-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .health-timestamp {
      color: rgba(var(--v-theme-on-surface), 0.6);
      font-size: 0.9rem;
    }
  }
}

.health-healthy {
  color: rgb(var(--v-theme-success)) !important;
  font-weight: 600;
}

.health-degraded {
  color: rgb(var(--v-theme-warning)) !important;
  font-weight: 600;
}

.health-unhealthy {
  color: rgb(var(--v-theme-error)) !important;
  font-weight: 600;
}

.health-details {
  .health-tests {
    margin-bottom: 1rem;

    h4 {
      margin: 0 0 0.5rem 0;
      color: rgb(var(--v-theme-primary));
    }
  }

  .test-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;

    .test-result-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;

      &.test-passed {
        background: rgba(var(--v-theme-success), 0.1);
        color: rgb(var(--v-theme-success));
      }

      &.test-failed {
        background: rgba(var(--v-theme-error), 0.1);
        color: rgb(var(--v-theme-error));
      }
    }
  }

  .health-summary {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(var(--v-theme-info), 0.1);
    border-radius: 4px;
    color: rgb(var(--v-theme-info));
  }

  .health-errors {
    h4 {
      margin: 0 0 0.5rem 0;
      color: rgb(var(--v-theme-error));
    }

    ul {
      margin: 0;
      padding-left: 1.5rem;
      color: rgb(var(--v-theme-error));

      li {
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
      }
    }
  }
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  margin-bottom: 1rem;

  .log-entry {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-b: 1px solid rgba(var(--v-theme-outline), 0.1);
    font-family:
      'Fira Code', 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata',
      'Roboto Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New',
      monospace;
    font-size: 0.9rem;

    &:last-child {
      border-b: none;
    }

    .log-time {
      color: rgba(var(--v-theme-on-surface), 0.6);
      min-width: 80px;
    }

    .log-type {
      min-width: 80px;
      font-weight: 600;
    }

    .log-message {
      flex: 1;
    }

    &.log-info .log-type {
      color: rgb(var(--v-theme-info));
    }

    &.log-success .log-type {
      color: rgb(var(--v-theme-success));
    }

    &.log-warning .log-type {
      color: rgb(var(--v-theme-warning));
    }

    &.log-error .log-type {
      color: rgb(var(--v-theme-error));
    }
  }
}

.log-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .status-grid,
  .capabilities-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .realtime-controls {
    flex-direction: column;
  }

  .test-results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
