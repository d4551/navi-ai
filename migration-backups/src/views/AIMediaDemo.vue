<template>
  <StandardPageLayout 
    page-type="gaming" 
    content-spacing="normal" 
    max-width="xl"
    title="AI Media Studio"
    subtitle="Live + file analysis with smart modes, gallery, and analytics"
    :header-context="{ aiConnected, sdkReady, responses: responses.length }"
  >
    <template #header-actions>
      <UnifiedButton variant="primary" leading-icon="mdi-camera" @click="captureNow">
        Capture
      </UnifiedButton>
      <UnifiedButton variant="glass" leading-icon="mdi-download" @click="exportSession">
        Export
      </UnifiedButton>
    </template>
    
    <!-- Navigation Tabs -->
    <nav class="modern-nav-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="nav-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <AppIcon :name="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Control Toolbar -->
    <div class="modern-toolbar">
      <div class="session-input-group">
        <input 
          v-model="sessionName"
          type="text" 
          class="session-input" 
          placeholder="Session name"
          @change="persistSessionName"
        />
      </div>
        
      <div class="mode-chips">
        <div 
          v-for="mode in modes"
          :key="mode.key"
          class="mode-chip"
          :class="{ active: activeMode === mode.key }"
          @click="activeMode = mode.key"
        >
          <AppIcon :name="mode.icon" />
          <span>{{ mode.label }}</span>
        </div>
      </div>

      <div class="quick-actions">
        <UnifiedButton variant="primary" leading-icon="mdi-camera" @click="captureNow">
          Capture
        </UnifiedButton>
        <UnifiedButton variant="glass" leading-icon="mdi-trash-can" @click="clearSession">
          Clear
        </UnifiedButton>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Webcam Card -->
      <div class="modern-card webcam-card">
        <div class="card-header">
          <div class="card-title">
            <div class="card-icon webcam-icon">
              <AppIcon name="mdi-camera" />
            </div>
            <span>Webcam</span>
          </div>
          <div class="status-badge" :class="{ active: cameraActive }">
            <span>{{ cameraActive ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
          
        <div class="media-preview">
          <video 
            v-if="cameraActive && cameraStream"
            ref="webcamVideo"
            class="preview-video"
            autoplay
            muted
            playsinline
          ></video>
          <div v-else class="preview-placeholder">
            <AppIcon name="mdi-camera-off" />
            <p>Camera feed will appear here</p>
          </div>
        </div>

        <div class="controls-grid">
          <button 
            class="control-btn"
            :class="{ active: cameraActive }"
            @click="toggleCamera"
          >
            <AppIcon name="mdi-camera" class="control-btn-icon" />
            <span class="control-btn-label">{{ cameraActive ? 'Stop Camera' : 'Start Camera' }}</span>
          </button>
          <button 
            class="control-btn"
            :class="{ active: microphoneActive }"
            @click="toggleMicrophone"
          >
            <AppIcon name="mdi-microphone" class="control-btn-icon" />
            <span class="control-btn-label">Microphone</span>
          </button>
          <button 
            class="control-btn"
            :class="{ active: screenShareActive }"
            @click="toggleScreenShare"
          >
            <AppIcon name="mdi-monitor" class="control-btn-icon" />
            <span class="control-btn-label">Share Screen</span>
          </button>
          <button 
            class="control-btn danger"
            @click="stopAll"
          >
            <AppIcon name="mdi-stop" class="control-btn-icon" />
            <span class="control-btn-label">Stop All</span>
          </button>
        </div>
      </div>

      <!-- Screen Share Card -->
      <div class="modern-card screen-card">
        <div class="card-header">
          <div class="card-title">
            <div class="card-icon screen-icon">
              <AppIcon name="mdi-monitor" />
            </div>
            <span>Screen Share</span>
          </div>
          <div class="status-badge" :class="{ active: screenShareActive }">
            <span>{{ screenShareActive ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
          
        <div class="media-preview">
          <video 
            v-if="screenShareActive && screenStream"
            ref="screenVideo"
            class="preview-video"
            autoplay
            muted
            playsinline
          ></video>
          <div v-else class="preview-placeholder">
            <AppIcon name="mdi-monitor-off" />
            <p>Click "Share Screen" to start</p>
          </div>
        </div>

        <!-- Audio Visualizer -->
        <div class="audio-visualizer">
          <div 
            v-for="i in 12"
            :key="i"
            class="visualizer-bar"
            :class="{ active: microphoneActive }"
            :style="{ animationDelay: `${i * 0.1}s` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="modern-card stats-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon stats-icon">
            <AppIcon name="mdi-chart-line" />
          </div>
          <span>Live Stats</span>
        </div>
      </div>
        
      <div class="stats-grid">
        <div 
          v-for="(stat, index) in liveStats"
          :key="stat.label"
          class="stat-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="stat-value" :data-value="stat.value">{{ stat.displayValue }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Guide -->
    <div class="modern-card guide-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon guide-icon">
            <AppIcon name="mdi-lightbulb" />
          </div>
          <span>Quick Guide</span>
        </div>
      </div>
        
      <div class="guide-grid">
        <div 
          v-for="(step, index) in guideSteps"
          :key="step.number"
          class="guide-step-card"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <div class="guide-step-number">{{ step.number }}</div>
          <div class="guide-step-content">
            <div class="guide-step-title">{{ step.title }}</div>
            <div class="guide-step-desc">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden AI Media Integration -->
    <AIMediaIntegration 
      ref="mediaIntegration"
      :mode-prompt="modePrompt"
      style="display: none;"
      @ai-response="recordResponse"
      @integration-error="onError"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from '@/composables/useToast'
import { canonicalAI } from '@/modules/ai/CanonicalAIService'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AIMediaIntegration from '@/components/AIMediaIntegration.vue'

interface Tab {
  id: string
  label: string
  icon: string
}

interface Mode {
  key: string
  label: string
  icon: string
}

interface AIResponse {
  id: string
  mode: string
  content: string
  confidence: number
  timestamp: Date
}

interface StatItem {
  label: string
  value: number
  displayValue: string
}

interface GuideStep {
  number: number
  title: string
  description: string
}

// Core reactive state
const activeTab = ref('live')
const activeMode = ref('describe')
const sessionName = ref('New Session')
const isRecording = ref(false)

// Media streams and states
const cameraStream = ref<MediaStream | null>(null)
const screenStream = ref<MediaStream | null>(null)
const cameraActive = ref(false)
const screenShareActive = ref(false)
const microphoneActive = ref(false)

// AI and SDK states
const aiConnected = ref(false)
const sdkReady = ref(false)

// Data storage
const responses = ref<AIResponse[]>([])
const frames = ref<any[]>([])
const startTime = ref<Date | null>(null)

// Component refs
const webcamVideo = ref<HTMLVideoElement>()
const screenVideo = ref<HTMLVideoElement>()
const mediaIntegration = ref()

// Toast system
const toast = useToast()

// Configuration data
const tabs: Tab[] = [
  { id: 'live', label: 'Live', icon: 'mdi-video' },
  { id: 'file', label: 'File', icon: 'mdi-folder' },
  { id: 'gallery', label: 'Gallery', icon: 'mdi-view-gallery' },
  { id: 'analytics', label: 'Analytics', icon: 'mdi-chart-box' }
]

const modes: Mode[] = [
  { key: 'describe', label: 'Describe', icon: 'mdi-magnify' },
  { key: 'ocr', label: 'OCR', icon: 'mdi-text-recognition' },
  { key: 'safety', label: 'Safety', icon: 'mdi-shield-check' },
  { key: 'ui_qa', label: 'UI QA', icon: 'mdi-test-tube' }
]

const guideSteps: GuideStep[] = [
  {
    number: 1,
    title: 'Start a source',
    description: 'Use Start Camera or Share Screen to stream media.'
  },
  {
    number: 2,
    title: 'Pick a mode',
    description: 'Switch analysis modes for objects, text, or scenes.'
  },
  {
    number: 3,
    title: 'Export results',
    description: 'Save a JSON bundle of your session at any time.'
  }
]

// Computed properties
const modePrompt = computed(() => {
  const prompts = {
    describe: 'Describe what you see in detail',
    ocr: 'Extract and transcribe any text visible',
    safety: 'Analyze for safety concerns or inappropriate content',
    ui_qa: 'Evaluate UI/UX elements and user interface quality'
  }
  return prompts[activeMode.value as keyof typeof prompts] || prompts.describe
})

const liveStats = computed<StatItem[]>(() => [
  {
    label: 'Responses',
    value: responses.value.length,
    displayValue: responses.value.length.toString()
  },
  {
    label: 'Avg Confidence',
    value: averageConfidence.value,
    displayValue: `${averageConfidence.value}%`
  },
  {
    label: 'Avg Latency',
    value: averageLatency.value,
    displayValue: `${averageLatency.value.toFixed(1)}s`
  },
  {
    label: 'Frames',
    value: frames.value.length,
    displayValue: frames.value.length.toString()
  }
])

const averageConfidence = computed(() => {
  if (responses.value.length === 0) return 95
  const total = responses.value.reduce((sum, r) => sum + r.confidence, 0)
  return Math.round(total / responses.value.length)
})

const averageLatency = computed(() => {
  // Mock latency calculation
  return 1.2 + (Math.random() * 0.8)
})

// Media control functions
const toggleCamera = async () => {
  try {
    if (cameraActive.value) {
      await stopCamera()
    } else {
      await startCamera()
    }
  } catch (error) {
    console.error('Camera toggle failed:', error)
    toast.error('Camera operation failed')
  }
}

const startCamera = async () => {
  try {
    cameraStream.value = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: false 
    })
    
    if (webcamVideo.value && cameraStream.value) {
      webcamVideo.value.srcObject = cameraStream.value
      await webcamVideo.value.play()
      cameraActive.value = true
      
      if (!startTime.value) {
        startTime.value = new Date()
      }
      
      toast.success('Camera started')
    }
  } catch (error) {
    console.error('Failed to start camera:', error)
    toast.error('Failed to access camera')
  }
}

const stopCamera = async () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }
  
  if (webcamVideo.value) {
    webcamVideo.value.srcObject = null
  }
  
  cameraActive.value = false
  toast.info('Camera stopped')
}

const toggleScreenShare = async () => {
  try {
    if (screenShareActive.value) {
      await stopScreenShare()
    } else {
      await startScreenShare()
    }
  } catch (error) {
    console.error('Screen share toggle failed:', error)
    toast.error('Screen share operation failed')
  }
}

const startScreenShare = async () => {
  try {
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({ 
      video: true, 
      audio: true 
    })
    
    if (screenVideo.value && screenStream.value) {
      screenVideo.value.srcObject = screenStream.value
      await screenVideo.value.play()
      screenShareActive.value = true
      
      if (!startTime.value) {
        startTime.value = new Date()
      }
      
      toast.success('Screen sharing started')
    }
  } catch (error) {
    console.error('Failed to start screen share:', error)
    toast.error('Failed to start screen sharing')
  }
}

const stopScreenShare = async () => {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach(track => track.stop())
    screenStream.value = null
  }
  
  if (screenVideo.value) {
    screenVideo.value.srcObject = null
  }
  
  screenShareActive.value = false
  toast.info('Screen sharing stopped')
}

const toggleMicrophone = async () => {
  microphoneActive.value = !microphoneActive.value
  toast.info(`Microphone ${microphoneActive.value ? 'enabled' : 'disabled'}`)
}

const stopAll = async () => {
  await stopCamera()
  await stopScreenShare()
  microphoneActive.value = false
  isRecording.value = false
  toast.info('All media sources stopped')
}

// AI and session functions
const captureNow = () => {
  // Mock capture functionality
  frames.value.push({
    id: Date.now(),
    timestamp: new Date(),
    source: cameraActive.value ? 'camera' : 'screen'
  })
  
  // Mock AI response
  setTimeout(() => {
    recordResponse({
      mode: activeMode.value,
      content: `Analysis result for frame ${frames.value.length}`,
      confidence: 85 + Math.random() * 15,
      timestamp: new Date()
    })
  }, 500)
  
  toast.success('Frame captured and analyzing...')
}

const clearSession = () => {
  responses.value = []
  frames.value = []
  startTime.value = null
  sessionName.value = 'New Session'
  toast.info('Session cleared')
}

const exportSession = () => {
  const sessionData = {
    name: sessionName.value,
    startTime: startTime.value,
    responses: responses.value,
    frames: frames.value,
    stats: liveStats.value
  }
  
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], { 
    type: 'application/json' 
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sessionName.value.replace(/\s+/g, '_')}_session.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success('Session exported')
}

const persistSessionName = () => {
  // Session name is already bound to reactive ref
  toast.info(`Session renamed to "${sessionName.value}"`)
}

// AI integration functions
const recordResponse = (response: any) => {
  responses.value.push({
    id: Date.now().toString(),
    mode: response.mode || activeMode.value,
    content: response.content,
    confidence: response.confidence || 95,
    timestamp: new Date()
  })
}

const onError = (error: any) => {
  console.error('AI Integration error:', error)
  toast.error('AI analysis error occurred')
}

// Lifecycle hooks
onMounted(async () => {
  try {
    // Initialize canonical AI
    if (!canonicalAI.isReady) {
      await canonicalAI.initialize({
        primaryProvider: 'google',
        enableMultimodal: true,
        enableRealTime: true
      })
    }
    
    aiConnected.value = canonicalAI.isReady
    sdkReady.value = true
    
    // Animate stats on load
    await nextTick()
    animateStatsOnLoad()
    
    toast.success('AI Media Studio initialized')
    
  } catch (error) {
    console.error('Initialization failed:', error)
    toast.error('Failed to initialize AI services')
  }
})

onUnmounted(async () => {
  await stopAll()
})

// Animation functions
const animateStatsOnLoad = () => {
  const statValues = document.querySelectorAll('.stat-value[data-value]')
  statValues.forEach((stat, index) => {
    setTimeout(() => {
      const finalValue = parseInt((stat as HTMLElement).dataset.value || '0')
      if (finalValue && !isNaN(finalValue)) {
        let currentValue = 0
        const increment = Math.max(1, finalValue / 20)
        
        const counter = setInterval(() => {
          currentValue += increment
          if (currentValue >= finalValue) {
            currentValue = finalValue
            clearInterval(counter)
          }
          stat.textContent = Math.floor(currentValue).toString()
        }, 50)
      }
    }, index * 100)
  })
}
</script>

<style scoped>
/* Modern AI Media Studio Styles - Now integrated with StandardPageLayout */

/* Header removed - now using StandardPageLayout */

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 2rem;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.status-badge.active {
  border-color: var(--color-success-500);
  background: color-mix(in srgb, var(--color-success-500) 10%, transparent);
}

.status-indicator {
  width: 6px;
  height: 6px;
  background: var(--color-success-500);
  border-radius: 50%;
  animation: pulse 2s infinite;
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-success-500) 70%, transparent); }
  50% { box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-success-500) 0%, transparent); }
}

/* Content Layout - now uses StandardPageLayout container */

/* Modern Navigation Tabs - Standardized */
.modern-nav-tabs {
  display: flex;
  gap: var(--spacing-1, 0.25rem);
  padding: var(--spacing-1, 0.25rem);
  background: var(--glass-bg);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--glass-border);
  margin-bottom: var(--spacing-6, 2rem);
  backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
}

.nav-tab {
  flex: 1;
  padding: var(--spacing-3, 1rem);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  font-family: var(--font-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2, 0.5rem);
  position: relative;
}

.nav-tab:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.nav-tab.active {
  background: var(--color-primary-500);
  color: white;
  box-shadow: 0 10px 30px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

/* Modern Toolbar - Standardized */
.modern-toolbar {
  display: flex;
  gap: var(--spacing-6, 2rem);
  align-items: center;
  padding: var(--spacing-4, 1.5rem);
  background: var(--glass-bg);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--glass-border);
  margin-bottom: var(--spacing-6, 2rem);
  backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
  flex-wrap: wrap;
}

.session-input-group {
  flex: 1;
  min-width: 200px;
}

.session-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.session-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.mode-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mode-chip {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 1rem);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full, 9999px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  font-family: var(--font-primary);
  color: var(--text-secondary);
}

.mode-chip:hover {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
  color: var(--text-primary);
}

.mode-chip.active {
  background: var(--color-primary-500);
  border-color: transparent;
  color: white;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Content Grid - Improved responsive layout */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Modern Cards - Standardized Design */
.modern-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--glass-shadow);
  padding: var(--spacing-6, 2rem);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

/* Ensure cards have consistent sizing */
.webcam-card,
.screen-card {
  min-width: 0; /* Prevents flex items from overflowing */
}

.modern-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary-500);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modern-card:hover::before {
  transform: scaleX(1);
}

/* Standardized Card Header Pattern */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4, 1.5rem);
  padding-bottom: var(--spacing-3, 1rem);
  border-bottom: 1px solid var(--glass-border);
}

.card-title {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.75rem);
  color: var(--text-primary);
  letter-spacing: var(--letter-spacing-tight, -0.025em);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-lg, 1.125rem);
  flex-shrink: 0;
}

.webcam-icon {
  background: var(--color-primary-500);
}

.screen-icon {
  background: var(--color-accent-500);
}

.stats-icon {
  background: var(--color-error-500);
}

.guide-icon {
  background: var(--color-warning-500);
}

/* Media Preview - More flexible sizing */
.media-preview {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--glass-bg);
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
  flex: 1;
  min-height: 200px;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  text-align: center;
}

.preview-placeholder svg {
  font-size: 3rem;
  opacity: 0.5;
}

/* Control Buttons Grid */
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.control-btn {
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  color: var(--text-secondary);
}

.control-btn:hover {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
  color: var(--text-primary);
}

.control-btn.active {
  background: var(--color-primary-500);
  border-color: transparent;
  color: white;
}

.control-btn.danger:hover {
  background: color-mix(in srgb, var(--color-error-500) 10%, transparent);
  border-color: var(--color-error-500);
}

.control-btn-icon {
  font-size: 1.5rem;
}

.control-btn-label {
  font-size: 0.875rem;
  font-weight: 600;
}

/* Audio Visualizer */
.audio-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  height: 60px;
  padding: 1rem;
  background: var(--glass-bg);
  border-radius: 0.75rem;
  border: 1px solid var(--glass-border);
}

.visualizer-bar {
  width: 4px;
  height: 10px;
  background: var(--color-primary-500);
  border-radius: 2px;
  transition: height 0.2s ease;
}

.visualizer-bar.active {
  animation: audioWave 1s ease-in-out infinite;
}

.visualizer-bar:nth-child(odd) {
  animation-delay: 0.1s;
}

.visualizer-bar:nth-child(even) {
  animation-delay: 0.2s;
}

@keyframes audioWave {
  0%, 100% { height: 10px; }
  50% { height: 30px; }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-primary-500) 10%, transparent) 0%, transparent 70%);
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stat-card:hover {
  transform: scale(1.05);
  border-color: var(--color-primary-500);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  z-index: 1;
}

/* Guide Section */
.guide-card {
  grid-column: 1 / -1;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.guide-step-card {
  padding: 1.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease forwards;
}

.guide-step-card:hover {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
}

.guide-step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.guide-step-content {
  flex: 1;
}

.guide-step-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.guide-step-desc {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Full-width cards */
.stats-card,
.guide-card {
  grid-column: 1 / -1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .modern-card {
    padding: 1.5rem;
    min-height: auto;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .guide-grid {
    grid-template-columns: 1fr;
  }
  
  .modern-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mode-chips,
  .quick-actions {
    justify-content: center;
  }
  
  .status-badges {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
}

@media (max-width: 480px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modern-card {
    padding: 1rem;
    min-height: auto;
    border-radius: 1rem;
  }
  
  .media-preview {
    min-height: 150px;
    margin-bottom: 1rem;
  }
  
  .controls-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .control-btn {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .mode-chips {
    justify-content: center;
  }
  
  .mode-chip {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .bg-animation::before,
  .bg-animation::after,
  .header-shimmer,
  .status-indicator,
  .visualizer-bar,
  .stat-card::before {
    animation: none !important;
  }
  
  .modern-card:hover,
  .nav-tab:hover,
  .control-btn:hover {
    transform: none !important;
  }
}
</style>