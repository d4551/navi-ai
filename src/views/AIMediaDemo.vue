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
      <UnifiedButton
        variant="primary"
        leading-icon="mdi-camera"
        @click="captureNow"
      >
        Capture
      </UnifiedButton>
      <UnifiedButton
        variant="glass"
        leading-icon="mdi-download"
        @click="exportSession"
      >
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
        <UnifiedButton
          variant="primary"
          leading-icon="mdi-camera"
          @click="captureNow"
        >
          Capture
        </UnifiedButton>
        <UnifiedButton
          variant="glass"
          leading-icon="mdi-trash-can"
          @click="clearSession"
        >
          Clear
        </UnifiedButton>
        <UnifiedButton
          variant="glass"
          leading-icon="mdi-download"
          @click="exportSession"
        >
          Export
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
            <span>{{ cameraActive ? "Active" : "Inactive" }}</span>
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
            <span class="control-btn-label">{{
              cameraActive ? "Stop Camera" : "Start Camera"
            }}</span>
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
          <button class="control-btn danger" @click="stopAll">
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
            <span>{{ screenShareActive ? "Active" : "Inactive" }}</span>
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
          <div class="stat-value" :data-value="stat.value">
            {{ stat.displayValue }}
          </div>
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
      style="display: none"
      @ai-response="recordResponse"
      @integration-error="onError"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive } from 'vue';

import { ref, computedonUnmounted, nextTick } from "vue";
import { useToast } from "@/composables/useToast";
import { canonicalAI } from "@/modules/ai/CanonicalAIService";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import AIMediaIntegration from "@/components/AIMediaIntegration.vue";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface Mode {
  key: string;
  label: string;
  icon: string;
}

interface AIResponse {
  id: string;
  mode: string;
  content: string;
  confidence: number;
  timestamp: Date;
}

interface StatItem {
  label: string;
  value: number;
  displayValue: string;
}

interface GuideStep {
  number: number;
  title: string;
  description: string;
}

// Core reactive state
const activeTab = ref("live");
const activeMode = ref("describe");
const sessionName = ref("New Session");
const isRecording = ref(false);

// Media streams and states
const cameraStream = ref<MediaStream | null>(null);
const screenStream = ref<MediaStream | null>(null);
const cameraActive = ref(false);
const screenShareActive = ref(false);
const microphoneActive = ref(false);

// AI and SDK states
const aiConnected = ref(false);
const sdkReady = ref(false);

// Data storage
const responses = ref<AIResponse[]>([]);
const frames = ref<any[]>([]);
const startTime = ref<Date | null>(null);

// Component refs
const webcamVideo = ref<HTMLVideoElement>();
const screenVideo = ref<HTMLVideoElement>();
const mediaIntegration = ref();

// Toast system
const toast = useToast();

// Configuration data
const tabs: Tab[] = [
  { id: "live", label: "Live", icon: "mdi-video" },
  { id: "file", label: "File", icon: "mdi-folder" },
  { id: "gallery", label: "Gallery", icon: "mdi-view-gallery" },
  { id: "analytics", label: "Analytics", icon: "mdi-chart-box" },
];

const modes: Mode[] = [
  { key: "describe", label: "Describe", icon: "mdi-magnify" },
  { key: "ocr", label: "OCR", icon: "mdi-text-recognition" },
  { key: "safety", label: "Safety", icon: "mdi-shield-check" },
  { key: "ui_qa", label: "UI QA", icon: "mdi-test-tube" },
];

const guideSteps: GuideStep[] = [
  {
    number: 1,
    title: "Start a source",
    description: "Use Start Camera or Share Screen to stream media.",
  },
  {
    number: 2,
    title: "Pick a mode",
    description: "Switch analysis modes for objects, text, or scenes.",
  },
  {
    number: 3,
    title: "Export results",
    description: "Save a JSON bundle of your session at any time.",
  },
];

// Computed properties
const modePrompt = computed(() => {
  const prompts = {
    describe: "Describe what you see in detail",
    ocr: "Extract and transcribe any text visible",
    safety: "Analyze for safety concerns or inappropriate content",
    ui_qa: "Evaluate UI/UX elements and user interface quality",
  };
  return prompts[activeMode.value as keyof typeof prompts] || prompts.describe;
});

const liveStats = computed<StatItem[]>(() => [
  {
    label: "Responses",
    value: responses.value.length,
    displayValue: responses.value.length.toString(),
  },
  {
    label: "Avg Confidence",
    value: averageConfidence.value,
    displayValue: `${averageConfidence.value}%`,
  },
  {
    label: "Avg Latency",
    value: averageLatency.value,
    displayValue: `${averageLatency.value.toFixed(1)}s`,
  },
  {
    label: "Frames",
    value: frames.value.length,
    displayValue: frames.value.length.toString(),
  },
]);

const averageConfidence = computed(() => {
  if (responses.value.length === 0) return 95;
  const total = responses.value.reduce((sum, r) => sum + r.confidence, 0);
  return Math.round(total / responses.value.length);
});

const averageLatency = computed(() => {
  // Mock latency calculation
  return 1.2 + Math.random() * 0.8;
});


const toggleCamera = async () => {
  try {
    if (cameraActive.value) {
      await stopCamera();
    } else {
      await startCamera();
    }
  } catch (_error) {
    console.error("Camera toggle failed:", error);
    toast.error("Camera operation failed");
  }
};

const startCamera = async () => {
  try {
    cameraStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (webcamVideo.value && cameraStream.value) {
      webcamVideo.value.srcObject = cameraStream.value;
      await webcamVideo.value.play();
      cameraActive.value = true;

      if (!startTime.value) {
        startTime.value = new Date();
      }

      toast.success("Camera started");
    }
  } catch (_error) {
    console.error("Failed to start camera:", error);
    toast.error("Failed to access camera");
  }
};

const stopCamera = async () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }

  if (webcamVideo.value) {
    webcamVideo.value.srcObject = null;
  }

  cameraActive.value = false;
  toast.info("Camera stopped");
};

const toggleScreenShare = async () => {
  try {
    if (screenShareActive.value) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  } catch (_error) {
    console.error("Screen share toggle failed:", error);
    toast.error("Screen share operation failed");
  }
};

const startScreenShare = async () => {
  try {
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    if (screenVideo.value && screenStream.value) {
      screenVideo.value.srcObject = screenStream.value;
      await screenVideo.value.play();
      screenShareActive.value = true;

      if (!startTime.value) {
        startTime.value = new Date();
      }

      toast.success("Screen sharing started");
    }
  } catch (_error) {
    console.error("Failed to start screen share:", error);
    toast.error("Failed to start screen sharing");
  }
};

const stopScreenShare = async () => {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach((track) => track.stop());
    screenStream.value = null;
  }

  if (screenVideo.value) {
    screenVideo.value.srcObject = null;
  }

  screenShareActive.value = false;
  toast.info("Screen sharing stopped");
};

const toggleMicrophone = async () => {
  microphoneActive.value = !microphoneActive.value;
  toast.info(`Microphone ${microphoneActive.value ? "enabled" : "disabled"}`);
};

const stopAll = async () => {
  await stopCamera();
  await stopScreenShare();
  microphoneActive.value = false;
  isRecording.value = false;
  toast.info("All media sources stopped");
};


const captureNow = () => {

  frames.value.push({
    id: Date.now(),
    timestamp: new Date(),
    source: cameraActive.value ? "camera" : "screen",
  });

  // Mock AI response
  setTimeout(() => {
    recordResponse({
      mode: activeMode.value,
      content: `Analysis result for frame ${frames.value.length}`,
      confidence: 85 + Math.random() * 15,
      timestamp: new Date(),
    });
  }, 500);

  toast.success("Frame captured and analyzing...");
};

const clearSession = () => {
  responses.value = [];
  frames.value = [];
  startTime.value = null;
  sessionName.value = "New Session";
  toast.info("Session cleared");
};

const exportSession = () => {
  const sessionData = {
    name: sessionName.value,
    startTime: startTime.value,
    responses: responses.value,
    frames: frames.value,
    stats: liveStats.value,
  };

  const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sessionName.value.replace(/\s+/g, "_")}_session.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Session exported");
};

const persistSessionName = () => {
  // Session name is already bound to reactive ref
  toast.info(`Session renamed to "${sessionName.value}"`);
};


const recordResponse = (response: any) => {
  responses.value.push({
    id: Date.now().toString(),
    mode: response.mode || activeMode.value,
    content: response.content,
    confidence: response.confidence || 95,
    timestamp: new Date(),
  });
};

const onError = (error: any) => {
  console.error("AI Integration error:", error);
  toast.error("AI analysis error occurred");
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Initialize canonical AI
    if (!canonicalAI.isReady) {
      await canonicalAI.initialize({
        primaryProvider: "google",
        enableMultimodal: true,
        enableRealTime: true,
      });
    }

    aiConnected.value = canonicalAI.isReady;
    sdkReady.value = true;

    // Animate stats on load
    await nextTick();
    animateStatsOnLoad();

    toast.success("AI Media Studio initialized");
  } catch (_error) {
    console.error("Initialization failed:", error);
    toast.error("Failed to initialize AI services");
  }
});

onUnmounted(async () => {
  await stopAll();
});


const animateStatsOnLoad = () => {
  const statValues = document.querySelectorAll(".stat-value[data-value]");
  statValues.forEach((stat, index) => {
    setTimeout(() => {
      const finalValue = parseInt((stat as HTMLElement).dataset.value || "0");
      if (finalValue && !isNaN(finalValue)) {
        let currentValue = 0;
        const increment = Math.max(1, finalValue / 20);

        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(counter);
          }
          stat.textContent = Math.floor(currentValue).toString();
        }, 50);
      }
    }, index * 100);
  });
};
</script>

<style scoped>


.status-badge {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  position: relative;
  overflow: hidden;
}

.status-badge.active {
}

.status-indicator {
  position: absolute;
}

@keyframes pulse {
  }
  }
}


.modern-nav-tabs {
  display: flex;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
}

.nav-tab {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-tab:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.nav-tab.active {
  color: white;
}

.modern-toolbar {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
  flex-wrap: wrap;
}

.session-input-group {
}

.session-input {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.session-input:focus {
  outline: none;
}

.mode-chips {
  display: flex;
  flex-wrap: wrap;
}

.mode-chip {
  background: var(--glass-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: var(--font-primary);
  color: var(--text-secondary);
}

.mode-chip:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.mode-chip.active {
  border-color: transparent;
  color: white;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
}

.content-grid {
  display: grid;
}

.modern-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.webcam-card,
.screen-card {
}

.modern-card::before {
  content: "";
  position: absolute;
}

.modern-card:hover {
}

.modern-card:hover::before {
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-family: var(--font-primary);
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.webcam-icon {
}

.screen-icon {
}

.stats-icon {
}

.guide-icon {
}

.media-preview {
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-video {
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  text-align: center;
}

.preview-placeholder svg {
}

.controls-grid {
  display: grid;
}

.control-btn {
  background: var(--glass-bg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--text-secondary);
}

.control-btn:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.control-btn.active {
  border-color: transparent;
  color: white;
}

.control-btn.danger:hover {
}

.control-btn-icon {
}

.control-btn-label {
}

.audio-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
}

.visualizer-bar {
}

.visualizer-bar.active {
}

.visualizer-bar:nth-child(odd) {
}

.visualizer-bar:nth-child(even) {
}

@keyframes audioWave {
  }
  }
}

.stats-grid {
  display: grid;
}

.stat-card {
  background: var(--glass-bg);
  text-align: center;
  position: relative;
  overflow: hidden;
}

@keyframes slideInUp {
  from {
  }
  to {
  }
}

.stat-card::before {
  content: "";
  position: absolute;
  background: radial-gradient(
    circle,
  );
}

@keyframes rotate {
  }
  }
}

.stat-card:hover {
}

.stat-value {
  color: var(--text-primary);
  position: relative;
}

.stat-label {
  color: var(--text-secondary);
  text-transform: uppercase;
  position: relative;
}

.guide-card {
}

.guide-grid {
  display: grid;
}

.guide-step-card {
  background: var(--glass-bg);
  display: flex;
}

.guide-step-card:hover {
  background: var(--glass-hover-bg);
}

.guide-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.guide-step-content {
}

.guide-step-title {
  color: var(--text-primary);
}

.guide-step-desc {
  color: var(--text-secondary);
}

.stats-card,
.guide-card {
}

  .content-grid {
  }

  .modern-card {
    min-height: auto;
  }

  .stats-grid {
  }

  .guide-grid {
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
  }

  .header-content {
    flex-direction: column;
    align-items: center;
  }
}

  .content-grid {
  }

  .modern-card {
    min-height: auto;
  }

  .media-preview {
  }

  .controls-grid {
  }

  .control-btn {
  }

  .stats-grid {
  }

  .stat-card {
  }

  .stat-value {
  }

  .mode-chips {
    justify-content: center;
  }

  .mode-chip {
  }
}

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
