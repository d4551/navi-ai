<template>
  <div class="ai-media-integration unified-container">
    <div class="glass-card section-card">
      <div class="integration-header">
        <h3 class="section-title d-flex align-center gap-sm mb-3">
          <AppIcon name="mdi-robot" />
          AI-Powered Media Hub
        </h3>
        <div class="connection-status" :class="{ connected: isAIConnected }">
          <div v-if="isAIConnected" class="pulse-ring"></div>
          <div class="status-dot"></div>
          <span class="status-text">{{
            isAIConnected ? "AI Connected" : "AI Disconnected"
          }}</span>
        </div>
        <div class="status-badges d-flex justify-center gap-2 mt-2">
          <span
            class="badge"
            :class="
              streamStatus.isInitialized ? 'badge-success' : 'badge-warning'
            "
          >
            <AppIcon
              :name="
                streamStatus.isInitialized
                  ? 'mdi-check-circle-outline'
                  : 'mdi-alert-circle-outline'
              "
            />
            SDK {{ streamStatus.isInitialized ? "Ready" : "Not Ready" }}
          </span>
          <span
            class="badge"
            :class="streamStatus.hasApiKey ? 'badge-success' : 'badge-error'"
          >
            <AppIcon
              :name="streamStatus.hasApiKey ? 'mdi-key' : 'mdi-key-remove'"
            />
            {{ streamStatus.hasApiKey ? "Key Loaded" : "Key Missing" }}
          </span>
          <span
            class="badge"
            :class="streamStatus.isStreaming ? 'badge-info' : 'badge-secondary'"
          >
            <AppIcon
              :name="streamStatus.isStreaming ? 'mdi-video' : 'mdi-video-off'"
            />
            {{ streamStatus.isStreaming ? "Streaming" : "Idle" }}
          </span>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Left Column: Media Controls -->
        <div class="media-section glass-surface">
          <div class="section-header">
            <h4 class="section-subtitle d-flex align-center gap-sm">
              <AppIcon name="mdi-video" />
              Media Controls
            </h4>
          </div>
          <MediaControls
            ref="mediaControls"
            @stream-started="handleStreamStarted"
            @stream-stopped="handleStreamStopped"
            @error="handleMediaError"
          />
        </div>

        <!-- Right Column: AI Interaction -->
        <div v-if="mediaStream" class="ai-section glass-surface">
          <div class="ai-controls-header">
            <h4 class="section-subtitle d-flex align-center gap-sm">
              <AppIcon name="mdi-brain" />
              AI Analysis & Chat
            </h4>
            <div
              class="ai-status-badge"
              :class="{ processing: isProcessingAI }"
            >
              <AppIcon
                :name="isProcessingAI ? 'mdi-loading' : 'mdi-check-circle'"
                :class="{ 'mdi-spin': isProcessingAI }"
              />
              {{ isProcessingAI ? "Processing..." : "Ready" }}
            </div>
          </div>

          <!-- Real-time Analysis Toggle -->
          <div class="analysis-controls">
            <div class="form-check form-switch">
              <input
                id="realtime-analysis"
                v-model="realtimeAnalysis"
                class="form-check-input"
                type="checkbox"
                :disabled="!isAIConnected"
                @change="toggleRealtimeAnalysis"
              />
              <label class="form-check-label" for="realtime-analysis">
                Real-time AI Analysis
              </label>
            </div>
            <div v-if="realtimeAnalysis" class="analysis-rate">
              <label for="analysis-fps">Analysis Rate: {{ analysisFPS }} FPS</label>
              <input
                id="analysis-fps"
                v-model.number="analysisFPS"
                type="range"
                min="1"
                max="30"
                step="1"
                class="form-range"
                @change="updateAnalysisRate"
              />
            </div>
            <div class="auto-toggles">
              <div class="form-check form-switch">
                <input
                  id="auto-start-camera"
                  v-model="autoStartCamera"
                  class="form-check-input"
                  type="checkbox"
                  @change="onToggleAutoStart"
                />
                <label class="form-check-label" for="auto-start-camera">Auto Start Camera</label>
              </div>
              <div class="form-check form-switch">
                <input
                  id="auto-realtime"
                  v-model="autoRealtime"
                  class="form-check-input"
                  type="checkbox"
                  @change="onToggleAutoRealtime"
                />
                <label class="form-check-label" for="auto-realtime">Auto Realtime</label>
              </div>
              <div class="form-check form-switch">
                <input
                  id="auto-start-screen"
                  v-model="autoStartScreen"
                  class="form-check-input"
                  type="checkbox"
                  @change="onToggleAutoScreen"
                />
                <label class="form-check-label" for="auto-start-screen">Auto Start Screen Share</label>
              </div>
              <div class="form-check form-switch">
                <input
                  id="realtime-on-screen-toggle"
                  v-model="startRealtimeOnScreenStart"
                  class="form-check-input"
                  type="checkbox"
                  @change="onToggleRealtimeOnScreen"
                />
                <label class="form-check-label" for="realtime-on-screen-toggle">Realtime on Screen Start</label>
              </div>
            </div>
          </div>

          <!-- Quick Prompts -->
          <div class="quick-prompts">
            <span
              v-for="p in quickPrompts"
              :key="p.text"
              class="prompt-chip"
              @click="applyQuickPrompt(p)"
            >
              <AppIcon :name="p.icon" /> {{ p.text }}
            </span>
            <span class="prompt-chip secondary"><AppIcon name="mdi-speedometer" /> {{ analysisFPS }} FPS</span>
          </div>

          <!-- AI Prompt Input -->
          <div class="ai-prompt-section">
            <div class="input-group">
              <input
                v-model="aiPrompt"
                type="text"
                class="form-control glass-input"
                placeholder="Ask AI about what it sees..."
                :disabled="!isAIConnected || isProcessingAI"
                @keypress.enter="sendAIPrompt"
              />
              <UnifiedButton
                variant="primary"
                :disabled="!aiPrompt.trim() || !isAIConnected || isProcessingAI"
                leading-icon="mdi-send"
                @click="sendAIPrompt"
              >
                Send
              </UnifiedButton>
            </div>
          </div>

          <!-- AI Response Area -->
          <div class="ai-responses">
            <div
              v-for="response in aiResponses"
              :key="response.id"
              class="ai-response-item"
            >
              <div class="response-header">
                <AppIcon name="mdi-robot" />
                <span class="response-type">{{ response.type }}</span>
                <span class="response-time">{{
                  formatTime(response.timestamp)
                }}</span>
              </div>
              <div class="response-content">{{ response.content }}</div>
              <div v-if="response.confidence" class="response-confidence">
                Confidence: {{ Math.round(response.confidence * 100) }}%
              </div>
            </div>
            <div v-if="lastFramePreview" class="frame-preview">
              <img :src="lastFramePreview" alt="Last analyzed frame" />
            </div>
          </div>
          <div class="transcript-actions">
            <UnifiedButton
              variant="glass"
              leading-icon="mdi-content-copy"
              @click="copyTranscript"
            >
              Copy Transcript
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-tray-arrow-down"
              @click="exportLocalSession"
            >
              Export JSON
            </UnifiedButton>
            <UnifiedButton
              :variant="isRecording ? 'danger' : 'gaming'"
              :leading-icon="isRecording ? 'mdi-stop' : 'mdi-record-rec'"
              @click="toggleRecording"
            >
              {{ isRecording ? "Stop Recording" : "Start Recording" }}
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              leading-icon="mdi-file-export-outline"
              @click="exportHtmlReport"
            >
              Export HTML
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-section glass-surface border-error">
        <div class="error-header">
          <AppIcon name="mdi-alert-circle-outline" class="icon-error" />
          <span class="error-title">Integration Error</span>
        </div>
        <p class="error-message">{{ _error }}</p>
        <div class="error-actions">
          <UnifiedButton
            variant="glass"
            size="sm"
            leading-icon="mdi-close"
            @click="clearError"
          >
            Dismiss
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';

import { ref, watch, nextTickonUnmounted } from "vue";
import MediaControls from "./MediaControls.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { canonicalAI } from "@/modules/ai/CanonicalAIService";
import { googleAIStreamingService } from "@/shared/services/GoogleAIStreamingService";
import { useAppStore } from "@/stores/app";
import { useToast } from "@/composables/useToast";
// import type { ConversationMessage } from '@/shared/services/GoogleAIStreamingService' // Unused

// Emits & Props
const _emit = defineEmits<{
  "ai-response": [response: AIResponse];
  "integration-error": [message: string];
}>();

const _props = withDefaults(
  defineProps<{
    // Optional mode prompt to steer AI behavior (e.g., OCR, Safety, UI QA)
    modePrompt?: string;
  }>(),
  {
    modePrompt: "",
  },
);

interface AIResponse {
  id: string;
  type: "analysis" | "chat" | "realtime";
  content: string;
  timestamp: Date;
  confidence?: number;
}

// Component state
const mediaControls = ref<InstanceType<typeof MediaControls>>();
const mediaStream = ref<MediaStream | null>(null);
const isAIConnected = ref(false);
const isProcessingAI = ref(false);
const _error = ref<string | null>(null);
const streamStatus = ref({
  isStreaming: false,
  isCameraActive: false,
  isScreenActive: false,
  isInitialized: false,
  hasApiKey: false,
});
const isRecording = ref(false);

// Recording internals
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

// App store and toasts
const store = useAppStore();
const {
  info: toastInfo,
  error: toastError,
  success: toastSuccess,
} = useToast();

// AI interaction state
const aiPrompt = ref("");
const aiResponses = ref<AIResponse[]>([]);
const realtimeAnalysis = ref(false);
const analysisFPS = ref(1);
const analysisInterval = ref<number | null>(null);
const lastFramePreview = ref<string>("");
const autoStartCamera = ref<boolean>(false);
const autoRealtime = ref<boolean>(false);
const autoStartScreen = ref<boolean>(false);
const startRealtimeOnScreenStart = ref<boolean>(false);

const quickPrompts = [
  { text: "Describe scene", icon: "mdi-text-box-search" },
  { text: "Detect UI text", icon: "mdi-text-recognition" },
  { text: "Find hazards", icon: "mdi-alert" },
  { text: "Summarize content", icon: "mdi-text-long" },
];

function applyQuickPrompt(p: { text: string }) {
  aiPrompt.value = p.text;
}

// Check AI connection status
const checkAIConnection = async () => {
  try {
    isAIConnected.value = canonicalAI.isReady;

    if (!isAIConnected.value) {
      // Try to initialize AI
      await canonicalAI.initialize({
        primaryProvider: "google",
        enableMultimodal: true,
        enableRealTime: true,
      });
      isAIConnected.value = true;
    }

    // Ensure Google streaming service is also initialized with Gemini key
    try {
      const status = googleAIStreamingService.getStatus?.();
      const hasInit = status ? status.isInitialized : false;
      if (status) streamStatus.value = status;
      const apiKey =
        store?.settings?.geminiApiKey ||
        (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
      if (!hasInit && apiKey) {
        await googleAIStreamingService.initialize(apiKey);
        const s2 = googleAIStreamingService.getStatus?.();
        if (s2) streamStatus.value = s2;
      }
    } catch (_error) {
      console.warn("GoogleAIStreamingService init skipped:", error);
    }
  } catch (_err) {
    console.error("AI connection failed:", err);
    isAIConnected.value = false;
    error.value =
      "Failed to connect to AI service. Please check your API configuration.";
  }
};

// Handle media stream events
const handleStreamStarted = (
  stream: MediaStream,
  type?: "webcam" | "screen",
) => {
  mediaStream.value = stream;
  if (
    type === "screen" &&
    (store.settings?.streaming as any)?.aiStreaming?.startRealtimeOnScreenStart
  ) {
    if (!realtimeAnalysis.value) {
      realtimeAnalysis.value = true;
      startRealtimeAnalysis();
    }
  }
  console.log("Media stream started:", stream);
};

const handleStreamStopped = () => {
  mediaStream.value = null;
  if (realtimeAnalysis.value) {
    toggleRealtimeAnalysis();
  }
  console.log("Media stream stopped");
};

const handleMediaError = (errorMessage: string) => {
  const msg = `Media Error: ${errorMessage}`;
  error.value = msg;
  try {
    emit("integration-error", msg);
  } catch {}
};

// AI interaction methods
const sendAIPrompt = async () => {
  if (!aiPrompt.value.trim() || !isAIConnected.value) return;

  try {
    isProcessingAI.value = true;
    const prompt = props.modePrompt
      ? `${aiPrompt.value}\n\nContext: ${props.modePrompt}`
      : aiPrompt.value;
    aiPrompt.value = "";

    let response: any;

    if (mediaStream.value) {
      // Send frame data with prompt for visual analysis
      const frameData = await captureCurrentFrame();

      response = await googleAIStreamingService.processVideoFrame(frameData, {
        prompt,
        includeContext: true,
      });
    } else {
      // Text-only interaction
      response = await canonicalAI.generateText(prompt);
    }

    addAIResponse({
      type: "chat",
      content: response.content || response,
      confidence: response.confidence,
    });
  } catch (_err) {
    console.error("AI prompt error:", err);
    error.value = `AI Error: ${err instanceof Error ? err.message : "Unknown error"}`;
  } finally {
    isProcessingAI.value = false;
  }
};

const toggleRealtimeAnalysis = () => {
  if (realtimeAnalysis.value && mediaStream.value) {
    startRealtimeAnalysis();
  } else {
    stopRealtimeAnalysis();
  }
};

function onToggleAutoStart() {
  try {
    store.updateSettings({
      streaming: { video: { autoStart: autoStartCamera.value } } as any,
    });
    if (autoStartCamera.value && !mediaStream.value) {
      mediaControls.value?.startCamera?.();
      toastInfo("Auto-start camera enabled");
    }
  } catch {
    toastError("Failed to update Auto Start");
  }
}

function onToggleAutoRealtime() {
  try {
    store.updateSettings({
      streaming: { aiStreaming: { enabled: autoRealtime.value } } as any,
    });
    if (autoRealtime.value && mediaStream.value && !realtimeAnalysis.value) {
      realtimeAnalysis.value = true;
      startRealtimeAnalysis();
      toastInfo("Auto realtime enabled");
    }
    if (!autoRealtime.value && realtimeAnalysis.value) {
      stopRealtimeAnalysis();
    }
  } catch {
    toastError("Failed to update Auto Realtime");
  }
}

function onToggleAutoScreen() {
  try {
    store.updateSettings({
      streaming: { screen: { autoStart: autoStartScreen.value } } as any,
    });
    if (autoStartScreen.value && !mediaStream.value) {
      mediaControls.value?.shareScreen?.();
      toastInfo("Auto-start screen sharing enabled");
    }
  } catch {
    toastError("Failed to update Auto Start Screen");
  }
}

function onToggleRealtimeOnScreen() {
  try {
    store.updateSettings({
      streaming: {
        aiStreaming: {
          startRealtimeOnScreenStart: startRealtimeOnScreenStart.value,
        },
      } as any,
    });
  } catch {
    toastError("Failed to update setting");
  }
}

const startRealtimeAnalysis = () => {
  if (analysisInterval.value) return;

  const intervalMs = 1000 / analysisFPS.value;

  analysisInterval.value = window.setInterval(async () => {
    if (!mediaStream.value || !isAIConnected.value) return;

    try {
      const frameData = await captureCurrentFrame();
      const basePrompt = "Briefly describe what you see in this frame";
      const prompt = props.modePrompt
        ? `${basePrompt}\n\nContext: ${props.modePrompt}`
        : basePrompt;
      const response = await googleAIStreamingService.processVideoFrame(
        frameData,
        {
          prompt,
          includeContext: false,
        },
      );

      if (response && response.content) {
        addAIResponse({
          type: "realtime",
          content: response.content,
          confidence: response.confidence,
        });
      }
    } catch (_err) {
      console.warn("Realtime analysis error:", err);
    }
  }, intervalMs);
};

const stopRealtimeAnalysis = () => {
  if (analysisInterval.value) {
    window.clearInterval(analysisInterval.value);
    analysisInterval.value = null;
  }
  realtimeAnalysis.value = false;
};

const updateAnalysisRate = () => {
  if (realtimeAnalysis.value) {
    stopRealtimeAnalysis();
    nextTick(() => startRealtimeAnalysis());
  }
  try {
    const val = Math.max(
      1,
      Math.min(30, Math.round(Number(analysisFPS.value))),
    );
    analysisFPS.value = val;
    store.updateSettings({ streaming: { aiStreaming: { fps: val } } as any });
  } catch {}
};

const captureCurrentFrame = async (): Promise<string> => {
  if (!mediaStream.value) throw new Error("No active media stream");

  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  return new Promise((resolve, reject) => {
    video.srcObject = mediaStream.value;
    video.play();

    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg", 0.8);
        lastFramePreview.value = dataURL;
        const frameData = dataURL.split(",")[1];
        resolve(frameData);
      } else {
        reject(new Error("Could not get canvas context"));
      }
    });

    video.addEventListener("error", reject);
  });
};

const addAIResponse = (responseData: Omit<AIResponse, "id" | "timestamp">) => {
  const response: AIResponse = {
    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...responseData,
  };

  aiResponses.value.push(_response);

  // Emit for parent listeners (e.g., analytics/timeline)
  try {
    emit("ai-response", response);
  } catch {}

  // Limit response history
  if (aiResponses.value.length > 10) {
    aiResponses.value = aiResponses.value.slice(-10);
  }
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const clearError = () => {
  error.value = null;
};

// Recording controls
function toggleRecording() {
  if (!mediaStream.value) {
    toastError("No active media stream to record");
    return;
  }
  if (!isRecording.value) {
    try {
      recordedChunks = [];
      const options: any = { mimeType: "video/webm;codecs=vp9" };
      mediaRecorder = new MediaRecorder(mediaStream.value, options as any);
      mediaRecorder.ondataavailable = (e: any) => {
        const data = e?.data as Blob;
        if (data && (data as Blob).size > 0) recordedChunks.push(_data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ai-media-capture.webm";
        a.click();
        URL.revokeObjectURL(url);
        toastSuccess("Recording saved");
      };
      mediaRecorder.start();
      // Optional: start realtime when recording begins
      if (
        !realtimeAnalysis.value &&
        (store.settings?.streaming as any)?.aiStreaming?.startRealtimeOnRecord
      ) {
        realtimeAnalysis.value = true;
        startRealtimeAnalysis();
      }
      isRecording.value = true;
      toastInfo("Recording started");
    } catch {
      toastError("Recording failed to start");
    }
  } else {
    try {
      mediaRecorder?.stop();
    } catch {}
    isRecording.value = false;
  }
}

// Transcript helpers
function getTranscript(): string {
  return aiResponses.value
    .map((r) => `[${formatTime(r.timestamp)}][${r.type}] ${r.content}`)
    .join("\n");
}

async function copyTranscript() {
  try {
    await navigator.clipboard.writeText(getTranscript());
    toastSuccess("Transcript copied");
  } catch (_e) {
    console.warn("Copy failed", e);
    toastError("Copy failed");
  }
}

function getSessionData(): any {
  return {
    responses: aiResponses.value,
    lastFramePreview: lastFramePreview.value,
    realtimeAnalysis: realtimeAnalysis.value,
    analysisFPS: analysisFPS.value,
    exportedAt: new Date().toISOString(),
  };
}

function exportLocalSession() {
  try {
    const data = getSessionData();
    const blob = new Blob([JSON.stringify(_data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-media-session.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (_e) {
    console.error("Export failed", e);
  }
}

function exportHtmlReport() {
  try {
    const responsesHtml = aiResponses.value
      .map(
        (r) => `
      <div class="resp">
        <div class="meta">${formatTime(r.timestamp)} • ${r.type}</div>
        <div class="content">${(r.content || "").replace(/</g, "&lt;")}</div>
      </div>
    `,
      )
      .join("");
    const imgHtml = lastFramePreview.value
      ? `<img src="${lastFramePreview.value}" alt="Frame" class="frame"/>`
      : "";
    const confs = aiResponses.value
      .map((r) => (typeof r.confidence === "number" ? r.confidence : null))
      .filter((v) => v !== null) as number[];
    const avgConf = confs.length
      ? Math.round(
          (confs.reduce((a, b) => a + (b as number), 0) / confs.length) * 100,
        )
      : 0;
    const frames = aiResponses.value.filter(
      (r) => r.type === "realtime",
    ).length;
    const html = `<!DOCTYPE html>
    <html><head><meta charset="utf-8" />
    <title>AI Media Lab Report</title>
    <style>
      body{font-family:system-ui,Segoe UI,Roboto,Inter,Arial;color:#111;background:#fff;margin:24px;}
      h1{margin:0 0 8px 0;font-size:20px}
      .meta{color:#666;font-size:12px;margin-bottom:16px}
      .stats{display:flex;gap:12px;margin-bottom:16px}
      .stat{padding:6px 10px;border:1px solid #eee;border-radius:999px;font-size:12px}
      .grid{display:grid;grid-template-columns:2fr 1fr;gap:16px}
      .card{border:1px solid #eee;border-radius:12px;padding:16px}
      .resp{border-bottom:1px solid #f0f0f0;padding:8px 0}
      .resp:last-child{border-bottom:0}
      .resp .meta{color:#888;margin:0 0 4px 0}
      .frame{max-width:100%;border:1px solid #eee;border-radius:8px}
    </style></head>
    <body>
      <h1>AI Media Lab Report</h1>
      <div class="meta">Generated ${new Date().toLocaleString()}</div>
      <div class="stats">
        <div class="stat">Responses: ${aiResponses.value.length}</div>
        <div class="stat">Realtime: ${realtimeAnalysis.value ? "On" : "Off"}</div>
        <div class="stat">FPS: ${analysisFPS.value}</div>
        <div class="stat">Avg Confidence: ${avgConf}%</div>
        <div class="stat">Frames Analyzed: ${frames}</div>
      </div>
      <div class="grid">
        <div class="card">
          <h2 style="margin-top:0;font-size:16px">Transcript</h2>
          ${responsesHtml}
        </div>
        <div class="card">
          <h2 style="margin-top:0;font-size:16px">Last Frame</h2>
          ${imgHtml || '<div class="meta">No frame available</div>'}
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-media-report.html";
    a.click();
    URL.revokeObjectURL(url);
  } catch (_e) {
    console.error("HTML export failed", e);
  }
}

// Lifecycle
onMounted(async () => {
  await checkAIConnection();
  // Init toggles from settings
  try {
    autoStartCamera.value = !!store.settings?.streaming?.video?.autoStart;
    autoRealtime.value = !!(store.settings?.streaming as any)?.aiStreaming
      ?.enabled;
    autoStartScreen.value = !!store.settings?.streaming?.screen?.autoStart;
    startRealtimeOnScreenStart.value = !!(store.settings?.streaming as any)
      ?.aiStreaming?.startRealtimeOnScreenStart;
    const fps = Number((store.settings?.streaming as any)?.aiStreaming?.fps);
    if (!Number.isNaN(fps) && fps >= 1 && fps <= 30) {
      analysisFPS.value = fps;
    }
  } catch {}
});

onUnmounted(() => {
  stopRealtimeAnalysis();
});

// Watch for AI connection changes
watch(isAIConnected, (connected) => {
  if (!connected && realtimeAnalysis.value) {
    stopRealtimeAnalysis();
  }
});

watch(mediaStream, (s) => {
  if (s && autoRealtime.value && !realtimeAnalysis.value) {
    realtimeAnalysis.value = true;
    startRealtimeAnalysis();
  }
});

// Poll stream status lightly when active
const statusTimer = setInterval(() => {
  try {
    const s = googleAIStreamingService.getStatus?.();
    if (s) streamStatus.value = s;
  } catch {}
}, 1500);
onUnmounted(() => clearInterval(statusTimer));

// Snapshot capture for gallery/exports
async function captureSnapshot(): Promise<string | null> {
  try {
    await captureCurrentFrame();
    return lastFramePreview.value || null;
  } catch {
    return null;
  }
}

// Expose controls for parent page
defineExpose({
  startCamera: () => mediaControls.value?.startCamera?.(),
  shareScreen: () => mediaControls.value?.shareScreen?.(),
  stopAll: () => mediaControls.value?.stopAll?.(),
  getSessionData,
  copyTranscript,
  captureSnapshot,
});
</script>

<style scoped>
.ai-media-integration {
  padding: var(--spacing-md);
}

.integration-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-status.connected .pulse-ring {
}

.status-dot {
}

.connection-status.connected .status-dot {
}

.content-grid {
  display: grid;
  gap: var(--spacing-xl);
  align-items: start;
}

  .content-grid {
    gap: var(--spacing-lg);
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
}

.media-section,
.ai-section,
.error-section {
  padding: var(--spacing-lg);
  border-radius: var(--radius-card);
}

.media-section {
  position: sticky;
  top: var(--spacing-lg);
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ai-controls-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.ai-status-badge {
  display: flex;
  align-items: center;
  background: var(--surface-glass);
  border-radius: var(--radius-md);
}

.ai-status-badge.processing {
  background: var(--gradient-accent-primary);
  color: var(--text-on-primary);
}

.analysis-controls {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
}

.auto-toggles {
  display: grid;
  margin-top: var(--spacing-md);
}

  .auto-toggles {
  }
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.prompt-chip {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  cursor: pointer;
}

.prompt-chip:hover {
  background: var(--surface-elevated);
}

.prompt-chip.secondary {
  cursor: default;
  background: var(--surface-glass);
}

.prompt-chip.secondary:hover {
  transform: none;
}

.transcript-actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
}

  .transcript-actions {
    flex-direction: column;
  }
}

.analysis-rate {
}

.ai-prompt-section {
  margin-bottom: var(--spacing-md);
}

.ai-responses {
  overflow-y: auto;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  background: var(--surface-elevated);
}

.frame-preview {
  margin-top: var(--spacing-md);
  display: flex;
  justify-content: flex-end;
}
.frame-preview img {
  border-radius: var(--radius-sm);
}

.ai-response-item {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-base);
  border-radius: var(--radius-md);
}

.ai-response-item:last-child {
}

.response-header {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.response-content {
}

.response-confidence {
  color: var(--text-tertiary);
}

.error-section {
}

.error-header {
  display: flex;
  align-items: center;
}

.error-title {
}

.error-message {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

@keyframes pulse {
  }
  }
}

[data-theme="dark"] .ai-responses {
  background: var(--surface-glass);
  border-color: var(--border-glass);
}

[data-theme="dark"] .ai-response-item {
  background: var(--surface-elevated);
}

  .ai-media-integration {
    padding: var(--spacing-sm);
  }

  .media-section {
    position: static;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .ai-status-badge {
    align-self: flex-start;
  }
}

.content-grid {
}

.media-section,
.ai-section {
}

.ai-section:hover,
.media-section:hover {
  box-shadow: var(--shadow-elevated);
}
</style>
