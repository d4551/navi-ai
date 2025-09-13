<template>
  <div class="file-analyzer unified-container">
    <div class="glass-card section-card">
      <div class="analyzer-header">
        <h3 class="section-title d-flex align-center gap-sm">
          <AppIcon name="mdi-file-video" />
          File Analyzer
        </h3>
        <div class="mode-chips">
          <span
            v-for="m in modes"
            :key="m.key"
            class="chip"
            :class="{ active: m.key === activeMode }"
            @click="setMode(m.key)"
          >
            <AppIcon :name="m.icon" /> {{ m.label }}
          </span>
        </div>
      </div>

      <div class="uploader glass-surface">
        <label class="form-label">Upload image or video</label>
        <input
          class="form-control glass-input"
          type="file"
          accept="image/*,video/*"
          @change="onFileChange"
        />
        <div v-if="error" class="error">{{ _error }}</div>
      </div>

      <div v-if="previewUrl" class="preview glass-surface">
        <div class="preview-media">
          <img
            v-if="!isVideo"
            ref="imgEl"
            :src="previewUrl"
            class="media"
            alt="Preview"
          />
          <video
            v-else
            ref="videoEl"
            :src="previewUrl"
            class="media"
            controls
            @loadedmetadata="onVideoReady"
          ></video>
        </div>

        <div class="actions">
          <div class="left">
            <UnifiedButton
              variant="gaming"
              leading-icon="mdi-image-search"
              :disabled="busy"
              @click="analyzeOnce"
            >
              {{ isVideo ? "Analyze Current Frame" : "Analyze Image" }}
            </UnifiedButton>
            <UnifiedButton
              variant="glass"
              leading-icon="mdi-camera"
              :disabled="busy"
              @click="snapshot"
            >
              Snapshot to Gallery
            </UnifiedButton>
          </div>
          <div v-if="isVideo" class="right auto">
            <div class="form-check form-switch me-3">
              <input
                id="auto-analyze"
                v-model="autoAnalyze"
                class="form-check-input"
                type="checkbox"
                @change="toggleAuto"
              />
              <label class="form-check-label" for="auto-analyze">Auto Analyze</label>
            </div>
            <label class="me-2">Every {{ intervalSec }}s</label>
            <input
              v-model.number="intervalSec"
              type="range"
              min="1"
              max="10"
              step="1"
              @input="onIntervalChange"
            />
          </div>
        </div>
      </div>

      <div v-if="responses.length" class="responses glass-surface">
        <h4 class="mb-2">
          <AppIcon name="mdi-chat-processing" /> File Insights
        </h4>
        <div class="list">
          <div v-for="r in responses" :key="r.id" class="item">
            <div class="meta">
              <span class="type">{{ r.type }}</span>
              <span class="time">{{ formatTime(r.timestamp) }}</span>
              <span v-if="r.confidence !== undefined" class="conf">{{ Math.round(r.confidence * 100) }}%</span>
            </div>
            <div class="content">{{ r.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { ref, onUnmounted } from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { googleAIStreamingService } from "@/shared/services/GoogleAIStreamingService";

interface AIResponseItem {
  id: string;
  type: "file" | "image" | "video";
  content: string;
  timestamp: Date;
  confidence?: number;
}

const _emit = defineEmits<{
  "ai-response": [response: AIResponseItem];
  "frame-captured": [dataUrl: string];
  error: [message: string];
}>();

const _props = withDefaults(
  defineProps<{
    modePrompt?: string;
  }>(),
  { modePrompt: "" },
);

const file = ref<File | null>(null);
const previewUrl = ref<string>("");
const isVideo = ref(false);
const videoEl = ref<HTMLVideoElement | null>(null);
const imgEl = ref<HTMLImageElement | null>(null);
const busy = ref(false);
const _error = ref("");
const responses = ref<AIResponseItem[]>([]);
const autoAnalyze = ref(false);
const intervalSec = ref(3);
let timer: number | null = null;

const modes = [
  { key: "describe", label: "Describe", icon: "mdi-text-box-search" },
  { key: "ocr", label: "OCR", icon: "mdi-text-recognition" },
  { key: "safety", label: "Safety", icon: "mdi-shield-check" },
  { key: "uiqa", label: "UI QA", icon: "mdi-application-cog" },
];
const activeMode = ref<"describe" | "ocr" | "safety" | "uiqa">("describe");

function modeSuffix(): string {
  const base = props.modePrompt?.trim() || "";
  const preset =
    activeMode.value === "ocr"
      ? "Extract visible text precisely."
      : activeMode.value === "safety"
        ? "Identify any unsafe, sensitive, or hazardous content."
        : activeMode.value === "uiqa"
          ? "Assess UI layout, readability, and potential UX issues."
          : "Provide a concise scene description.";
  return [base, preset].filter(Boolean).join(" ");
}

function setMode(key: "describe" | "ocr" | "safety" | "uiqa") {
  activeMode.value = key;
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (!f) return;
  error.value = "";
  file.value = f;
  cleanupPreview();
  const url = URL.createObjectURL(f);
  previewUrl.value = url;
  isVideo.value = f.type.startsWith("video");
}

function cleanupPreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  stopAuto();
}

function onVideoReady() {
  try {
    videoEl.value?.pause?.();
  } catch {}
}

async function analyzeOnce() {
  if (!previewUrl.value) return;
  busy.value = true;
  try {
    const base64 = await captureCurrent();
    const prompt = `Analyze this frame. ${modeSuffix()}`.trim();
    const res = await googleAIStreamingService.processVideoFrame(base64, {
      prompt,
      includeContext: false,
    });
    const item: AIResponseItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: isVideo.value ? "video" : "image",
      content: res.content,
      timestamp: new Date(),
      confidence: res.confidence,
    };
    responses.value.push(item);
    try {
      emit("ai-response", item);
    } catch {}
  } catch (e: any) {
    const msg = e?.message || "File analysis failed";
    error.value = msg;
    emit("error", msg);
  } finally {
    busy.value = false;
  }
}

async function snapshot() {
  try {
    const dataURL = await captureDataUrl();
    if (dataURL) emit("frame-captured", dataURL);
  } catch {}
}

async function captureCurrent(): Promise<string> {

  const dataUrl = await captureDataUrl("image/jpeg");
  return dataUrl.split(",")[1];
}

async function captureDataUrl(
  mime: string = "image/jpeg",
  quality = 0.9,
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  if (isVideo.value) {
    const vid = videoEl.value;
    if (!vid) throw new Error("Video not ready");
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
  } else {
    const img = imgEl.value;
    if (!img) throw new Error("Image not ready");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }
  return canvas.toDataURL(mime, quality);
}

function toggleAuto() {
  if (autoAnalyze.value) startAuto();
  else stopAuto();
}

function startAuto() {
  stopAuto();
  const ms = Math.max(1, intervalSec.value) * 1000;
  timer = window.setInterval(() => {
    analyzeOnce();
  }, ms);
}

function stopAuto() {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
}

function onIntervalChange() {
  if (autoAnalyze.value) startAuto();
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

onUnmounted(() => {
  stopAuto();
  cleanupPreview();
});
</script>

<style scoped>
.file-analyzer {
}

.analyzer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.mode-chips {
  display: flex;
  flex-wrap: wrap;
}

.chip {
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all var(--transition-smooth);
}

.chip:hover {
  background: var(--glass-surface);
}

.chip.active {
  color: var(--color-white);
  box-shadow: var(--shadow-glow-primary);
}

.uploader {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}
.error {
  color: var(--rgb-red);
}

.preview {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}
.preview-media {
  display: flex;
  justify-content: center;
}
.media {
  border-radius: var(--radius-md);
  background: var(--surface-base);
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  flex-wrap: wrap;
}
.actions .left {
  display: flex;
  align-items: center;
}
.actions .right {
  display: flex;
  align-items: center;
}

.responses {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}
.list {
  overflow-y: auto;
}
.item {
  padding: var(--spacing-md);
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}
.item .meta {
  display: flex;
  color: var(--text-secondary);
}
.item .content {
}

  .file-analyzer {
    padding: var(--spacing-lg);
  }
}
</style>
