<template>
  <div class="ai-media-workbench">
    <GlassNavTabs
      v-model:active-tab="activeTab"
      :tabs="tabs"
      aria-label="AI Media Tabs"
    />

    <div class="toolbar" role="toolbar" aria-label="Mode and session controls">
      <div class="session-meta">
        <label class="sr-only" for="sessionName">Session Name</label>
        <input
          id="sessionName"
          v-model.trim="sessionName"
          class="session-name glass-input"
          type="text"
          placeholder="Session name"
          @change="persistSessionName"
        />
      </div>
      <div class="modes">
        <button
          v-for="m in modes"
          :key="m.key"
          type="button"
          class="chip"
          :class="{ active: m.key === activeMode }"
          :aria-pressed="(m.key === activeMode).toString()"
          :title="`Mode: ${m.label} (Alt+${m.key === 'describe' ? '1' : m.key === 'ocr' ? '2' : m.key === 'safety' ? '3' : '4'})`"
          @click="activeMode = m.key"
        >
          <AppIcon :name="m.icon" /> {{ m.label }}
        </button>
      </div>
      <div class="meta">
        <span class="badge" :title="'Total AI responses'"
          >{{ responses.length }} responses</span
        >
        <span class="badge" :title="'Average confidence score'"
          >Avg {{ averageConfidence }}%</span
        >
        <span class="badge" :title="'Captured frames'"
          >{{ frames.length }} snapshots</span
        >
        <div class="quick-actions">
          <UnifiedButton
            variant="glass"
            size="sm"
            leading-icon="CameraIcon"
            :aria-label="'Capture snapshot'"
            title="Capture snapshot (Live)"
            @click="captureNow"
            >Capture</UnifiedButton
          >
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="TrashIcon"
            :aria-label="'Clear session'"
            title="Clear session"
            @click="clearSession"
            >Clear</UnifiedButton
          >
          <UnifiedButton
            variant="outline"
            size="sm"
            :aria-pressed="split.toString()"
            :title="split ? 'Disable split view' : 'Enable split view'"
            :leading-icon="
              split ? 'mdi-view-sequential' : 'mdi-view-split-vertical'
            "
            @click="split = !split"
            >{{ split ? 'Single View' : 'Split View' }}</UnifiedButton
          >
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="mdi-draw"
            :aria-pressed="annotationMode.toString()"
            :title="
              annotationMode
                ? 'Disable annotation mode'
                : 'Enable annotation mode'
            "
            @click="annotationMode = !annotationMode"
            >{{
              annotationMode ? 'Annotate On' : 'Annotate Off'
            }}</UnifiedButton
          >
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="mdi-broom"
            title="Reset annotations"
            @click="resetAnnotations"
            >Reset Annotations</UnifiedButton
          >
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="mdi-tray-arrow-down"
            title="Export session (JSON)"
            @click="exportJSON"
            >Export JSON</UnifiedButton
          >
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="TableCellsIcon"
            title="Export responses (CSV)"
            @click="exportCSV"
            >Export CSV</UnifiedButton
          >
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="ListBulletIcon-box"
            title="Export manifest (no images)"
            @click="exportManifest"
            >Export Manifest</UnifiedButton
          >
        </div>
      </div>
    </div>

    <!-- Split view: live + gallery side by side -->
    <div v-if="split" class="split-grid">
      <div class="panel">
        <AIMediaIntegration
          ref="liveRef"
          :mode-prompt="modePrompt"
          @ai-response="recordResponse"
          @integration-error="onError"
        />
      </div>
      <div class="panel glass-surface">
        <div class="gallery">
          <div v-if="!frames.length" class="muted">
            No snapshots yet. Capture from Live or File tabs.
          </div>
          <div v-else class="grid">
            <div v-for="f in frames" :key="f.id" class="thumb">
              <img :src="f.url" alt="snapshot" />
              <div class="thumb-meta">
                <span>{{ formatTime(f.timestamp) }}</span>
                <UnifiedButton
                  size="sm"
                  variant="glass"
                  leading-icon="mdi-tray-arrow-down"
                  @click="download(f)"
                  >Save</UnifiedButton
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Standard tabbed panels -->
    <template v-else>
      <div v-show="activeTab === 'live'" class="panel">
        <AIMediaIntegration
          ref="liveRef"
          :mode-prompt="modePrompt"
          @ai-response="recordResponse"
          @integration-error="onError"
        />
      </div>

      <div v-show="activeTab === 'file'" class="panel">
        <FileAnalyzer
          ref="fileRef"
          :mode-prompt="modePrompt"
          @ai-response="recordResponse"
          @frame-captured="addFrame"
          @error="onError"
        />
      </div>

      <div v-show="activeTab === 'gallery'" class="panel glass-surface">
        <div class="gallery">
          <div v-if="!frames.length" class="muted">
            No snapshots yet. Capture from Live or File tabs.
          </div>
          <div v-else class="grid">
            <div
              v-for="f in frames"
              :key="f.id"
              class="thumb"
              :class="{ annotating: annotationMode }"
            >
              <img :src="f.url" alt="snapshot" />
              <div class="thumb-meta">
                <span>{{ formatTime(f.timestamp) }}</span>
                <div class="thumb-actions">
                  <UnifiedButton
                    size="sm"
                    variant="glass"
                    leading-icon="mdi-tray-arrow-down"
                    @click="download(f)"
                    >Save</UnifiedButton
                  >
                  <UnifiedButton
                    size="sm"
                    variant="outline"
                    leading-icon="PencilIcon"
                    @click="toggleAnno(f.id)"
                    >{{
                      isAnnoOpen(f.id) ? 'Close' : 'Annotate'
                    }}</UnifiedButton
                  >
                </div>
              </div>
              <div v-if="isAnnoOpen(f.id)" class="anno-editor">
                <div class="flex flex-wrap">
                  <label>Labels</label>
                  <input
                    v-model="annoDraft[f.id].labels"
                    type="text"
                    class="form-control glass-input"
                    placeholder="comma,separated,labels"
                  />
                </div>
                <div class="flex flex-wrap">
                  <label>Note</label>
                  <textarea
                    v-model="annoDraft[f.id].note"
                    class="form-control glass-input"
                    rows="2"
                    placeholder="Add a note"
                  ></textarea>
                </div>
                <div class="actions">
                  <UnifiedButton
                    size="sm"
                    variant="primary"
                    leading-icon="mdi-content-save"
                    @click="saveAnno(f.id)"
                    >Save</UnifiedButton
                  >
                  <UnifiedButton
                    size="sm"
                    variant="ghost"
                    leading-icon="XMarkIcon"
                    @click="toggleAnno(f.id)"
                    >Close</UnifiedButton
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'analytics'" class="panel unified-container">
        <div class="glass-card section-card">
          <h4 class="section-title flex items-center gap-sm mb-3">
            <AppIcon
              name="ChartBarSquareIcon"
              color="info"
              aria-hidden="true"
            />
            Analytics Dashboard
          </h4>
          <div class="stats-grid">
            <div class="stat-card glass-surface">
              <div class="stat-value">{{ responses.length }}</div>
              <div class="stat-label">Responses</div>
            </div>
            <div class="stat-card glass-surface">
              <div class="stat-value">{{ averageConfidence }}%</div>
              <div class="stat-label">Avg Confidence</div>
            </div>
            <div class="stat-card glass-surface">
              <div class="stat-value">{{ realtimeCount }}</div>
              <div class="stat-label">Realtime</div>
            </div>
            <div class="stat-card glass-surface">
              <div class="stat-value">{{ chatCount }}</div>
              <div class="stat-label">Chats</div>
            </div>
          </div>

          <div class="timeline-section mt-4">
            <h5 class="section-subtitle">Activity Timeline</h5>
            <div class="timeline-container">
              <div v-for="r in responses" :key="r.id" class="timeline-item">
                <span class="timeline-time">{{ formatTime(r.timestamp) }}</span>
                <span class="timeline-type">{{ r.type }}</span>
                <span class="timeline-content">{{ r.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  CameraIcon,
  ChartBarSquareIcon,
  PencilIcon,
  TableCellsIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePageAssistantContext } from '@/composables/usePageAssistantContext'
import AIMediaIntegration from '@/components/AIMediaIntegration.vue'
import FileAnalyzer from '@/components/ai-media/FileAnalyzer.vue'
import GlassNavTabs from '@/components/GlassNavTabs.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

type ResponseType =
  | 'analysis'
  | 'chat'
  | 'realtime'
  | 'file'
  | 'image'
  | 'video'
interface SessionResponse {
  id: string
  type: ResponseType
  content: string
  timestamp: Date
  confidence?: number
}
interface FrameItem {
  id: string
  url: string
  timestamp: Date
  source?: string
}

const liveRef = ref<InstanceType<typeof AIMediaIntegration> | null>(null)
const fileRef = ref<InstanceType<typeof FileAnalyzer> | null>(null)

const tabs = [
  { key: 'live', label: 'Live', icon: 'mdi-television', shortLabel: 'Live' },
  {
    key: 'file',
    label: 'File',
    icon: 'FolderIcon-multiple-outline',
    shortLabel: 'File',
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: 'PhotoIcon-multiple',
    shortLabel: 'Pix',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'ChartBarIcon-bar',
    shortLabel: 'Stats',
  },
]
const activeTab = ref<'live' | 'file' | 'gallery' | 'analytics'>('live')
const split = ref(false)
const annotationMode = ref(false)
const sessionId = ref(
  `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
)
const ANNO_KEY = computed(() => `navi.aiMedia.annotations.${sessionId.value}`)
const NAME_KEY = computed(() => `navi.aiMedia.sessionName.${sessionId.value}`)
const sessionName = ref('')

const modes = [
  { key: 'describe', label: 'Describe', icon: 'mdi-magnify' },
  { key: 'ocr', label: 'OCR', icon: 'mdi-alphabetical-variant' },
  { key: 'safety', label: 'Safety', icon: 'ShieldCheckIcon-outline' },
  { key: 'uiqa', label: 'UI QA', icon: 'mdi-test-tube' },
]
const activeMode = ref<'describe' | 'ocr' | 'safety' | 'uiqa'>('describe')
const extraPrompt = ref('')

const modePrompt = computed(() => {
  const preset =
    activeMode.value === 'ocr'
      ? 'Extract visible text precisely.'
      : activeMode.value === 'safety'
        ? 'Identify unsafe, sensitive, or hazardous content.'
        : activeMode.value === 'uiqa'
          ? 'Assess UI layout, readability, and UX issues.'
          : 'Provide a concise scene description.'
  return [extraPrompt.value.trim(), preset].filter(Boolean).join(' ')
})

const emit = defineEmits<{
  'session-updated': [
    payload: { responses: number; frames: number; avgConfidence: number },
  ]
}>()
const responses = ref<SessionResponse[]>([])
const frames = ref<FrameItem[]>([])

function announce() {
  emit('session-updated', {
    responses: responses.value.length,
    frames: frames.value.length,
    avgConfidence: averageConfidence.value,
  })
}

function recordResponse(r: SessionResponse) {
  responses.value.push(r)
  announce()
}
function addFrame(url: string) {
  frames.value.push({
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url,
    timestamp: new Date(),
  })
  announce()
}
function onError(msg: string) {
  console.warn('[AI Media Workbench] error:', msg)
}

const averageConfidence = computed(() => {
  const vals = responses.value
    .map(r => r.confidence)
    .filter(v => typeof v === 'number') as number[]
  if (!vals.length) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
})
const realtimeCount = computed(
  () => responses.value.filter(r => r.type === 'realtime').length
)
const chatCount = computed(
  () => responses.value.filter(r => r.type === 'chat').length
)

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function download(f: FrameItem) {
  const a = document.createElement('a')
  a.href = f.url
  a.download = `snapshot-${f.timestamp.toISOString().replace(/[:.]/g, '-')}.png`
  a.click()
}

async function captureNow() {
  try {
    // Attempt to call capture on live integration if available via ref
    const maybe = liveRef.value as any
    if (maybe?.captureSnapshot) {
      const url = await maybe.captureSnapshot()
      if (url) addFrame(url)
    }
  } catch {}
}

function clearSession() {
  responses.value = []
  frames.value = []
}

function downloadBlob(
  data: string | Blob | ArrayBuffer,
  filename: string,
  type = 'application/octet-stream'
) {
  try {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch {}
}

function exportJSON() {
  const bundle = {
    generatedAt: new Date().toISOString(),
    mode: activeMode.value,
    tab: activeTab.value,
    responses: responses.value.map(r => ({
      id: r.id,
      type: r.type,
      content: r.content,
      timestamp: r.timestamp,
      confidence: r.confidence,
    })),
    frames: frames.value.map(f => ({
      id: f.id,
      timestamp: f.timestamp,
      url: f.url,
      source: f.source || '',
      annotation: annotations.value[f.id] || { labels: [], note: '' },
    })),
  }
  downloadBlob(
    JSON.stringify(bundle, null, 2),
    'ai-media-session.json',
    'application/json'
  )
}

function exportCSV() {
  const header = 'id,timestamp,type,confidence,content\n'
  const rows = responses.value.map(r => {
    const ts =
      r.timestamp instanceof Date
        ? r.timestamp.toISOString()
        : String(r.timestamp)
    const c = String(r.content || '').replace(/"/g, '""')
    return `${r.id},${ts},${r.type || ''},${typeof r.confidence === 'number' ? r.confidence : ''},"${c}"`
  })
  const csv = header + rows.join('\n')
  downloadBlob(csv, 'ai-media-responses.csv', 'text/csv')
}

function persistSessionName() {
  try {
    localStorage.setItem(NAME_KEY.value, sessionName.value || '')
  } catch {}
}

function resetAnnotations() {
  try {
    annotations.value = {}
    annoOpen.value = {}
    annoDraft.value = {}
    localStorage.removeItem(ANNO_KEY.value)
  } catch {}
}

function exportManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    sessionId: sessionId.value,
    sessionName: sessionName.value || '',
    frames: frames.value.map(f => ({
      id: f.id,
      timestamp: f.timestamp,
      source: f.source || '',
      annotation: annotations.value[f.id] || { labels: [], note: '' },
    })),
    responses: responses.value.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      type: r.type,
      confidence: r.confidence,
    })),
  }
  downloadBlob(
    JSON.stringify(manifest, null, 2),
    'ai-media-manifest.json',
    'application/json'
  )
}

// Expose actions for parent (page header buttons)
defineExpose({
  startCamera: () => liveRef.value?.startCamera?.(),
  shareScreen: () => liveRef.value?.shareScreen?.(),
  stopAll: () => liveRef.value?.stopAll?.(),
  async captureSnapshot() {
    const dataUrl = await (liveRef.value?.captureSnapshot?.() as Promise<
      string | null
    >)
    if (dataUrl) addFrame(dataUrl)
    return dataUrl
  },
  getSessionData() {
    return {
      responses: responses.value,
      frames: frames.value,
      mode: activeMode.value,
      generatedAt: new Date().toISOString(),
    }
  },
})

// Assistant context wiring
const { setPageContext, clearPageContext } = usePageAssistantContext()
function pushAssistantContext() {
  setPageContext({
    page: 'ai-media',
    activeTab: activeTab.value,
    activeMode: activeMode.value,
    responses: responses.value.length,
    frames: frames.value.length,
    averageConfidence: averageConfidence.value,
  })
}
onMounted(pushAssistantContext)
watch(
  [
    activeTab,
    activeMode,
    () => responses.value.length,
    () => frames.value.length,
  ],
  pushAssistantContext
)
onUnmounted(() => {
  clearPageContext()
})

// Annotation state
const annotations = ref<Record<string, { labels: string[]; note: string }>>({})
const annoOpen = ref<Record<string, boolean>>({})
const annoDraft = ref<Record<string, { labels: string; note: string }>>({})
function isAnnoOpen(id: string) {
  return !!annoOpen.value[id]
}
function toggleAnno(id: string) {
  annoOpen.value[id] = !annoOpen.value[id]
  if (annoOpen.value[id]) {
    const a = annotations.value[id]
    annoDraft.value[id] = {
      labels: (a?.labels || []).join(','),
      note: a?.note || '',
    }
  }
}
function saveAnno(id: string) {
  try {
    const draft = annoDraft.value[id] || { labels: '', note: '' }
    const labels = draft.labels
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    annotations.value[id] = { labels, note: draft.note || '' }
    annoOpen.value[id] = false
    // persist
    try {
      localStorage.setItem(ANNO_KEY.value, JSON.stringify(annotations.value))
    } catch {}
  } catch {}
}

// load persisted annotations on mount
onMounted(() => {
  try {
    const raw = localStorage.getItem(ANNO_KEY.value)
    annotations.value = raw ? JSON.parse(raw) : {}
  } catch {
    annotations.value = {}
  }
  try {
    sessionName.value = localStorage.getItem(NAME_KEY.value) || ''
  } catch {}
})

// Keyboard shortcuts for tabs and modes
function onKeydown(e: KeyboardEvent) {
  const tag =
    (e.target && (e.target as HTMLElement).tagName)?.toLowerCase() || ''
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select'
  if (typing) return
  // Switch tabs Alt+1..4
  if (e.altKey) {
    if (e.key === '1') {
      activeTab.value = 'live'
      e.preventDefault()
    }
    if (e.key === '2') {
      activeTab.value = 'file'
      e.preventDefault()
    }
    if (e.key === '3') {
      activeTab.value = 'gallery'
      e.preventDefault()
    }
    if (e.key === '4') {
      activeTab.value = 'analytics'
      e.preventDefault()
    }
    // Mode shortcuts Alt+Shift+1..4
    if (e.shiftKey) {
      if (e.key === '1') {
        activeMode.value = 'describe'
        e.preventDefault()
      }
      if (e.key === '2') {
        activeMode.value = 'ocr'
        e.preventDefault()
      }
      if (e.key === '3') {
        activeMode.value = 'safety'
        e.preventDefault()
      }
      if (e.key === '4') {
        activeMode.value = 'uiqa'
        e.preventDefault()
      }
    }
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* AI Media Workbench - Unified Glass Design System */
.ai-media-workbench {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

:deep(.glass-nav) {
  position: sticky;
  top: var(--spacing-4);
  z-index: 3;
  margin-bottom: var(--spacing-lg);
}

/* Unified Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--spacing-md) 0 var(--spacing-xl);
  gap: var(--spacing-md);
  flex-wrap: wrap;
  padding: var(--spacing-md);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
}

.session-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.session-name {
  min-width: 200px;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  transition: all var(--transition-smooth);
}

.session-name:focus {
  outline: none;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.modes {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.chip {
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  transition: all var(--transition-smooth);
  font-weight: 500;
}

.chip:hover {
  background: var(--glass-surface);
  transform: translateY(-1px);
}

.chip.active {
  background: var(--color-primary-500);
  color: var(--color-white);
  box-shadow: var(--shadow-glow-primary);
  border-color: var(--color-primary-500);
}

.meta {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-wrap: wrap;
}

.quick-actions {
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
  flex-wrap: wrap;
}

/* Split Layout Enhancement */
.split-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-lg);
}

/* Panel Standardization */
.panel {
  margin-bottom: var(--spacing-xl);
}

.panel.unified-container {
  margin-bottom: 0;
}

/* Gallery Grid */
.gallery {
  padding: var(--spacing-lg);
}

.gallery .grid {
  @apply media-grid;
  gap: var(--spacing-lg);
}

.gallery .muted {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xl);
  font-style: italic;
}

.thumb {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-base);
  transition: all var(--transition-smooth);
}

.thumb:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevation-md);
}

.thumb img {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.thumb-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--glass-surface);
}

.thumb-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

/* Annotation Editor */
.anno-editor {
  padding: var(--spacing-3);
  border-t: 1px solid var(--glass-border);
  background: var(--glass-bg);
  display: grid;
  gap: var(--spacing-2);
}

.anno-editor .flex flex-wrap {
  display: grid;
  gap: var(--spacing-1);
}

.anno-editor .actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Analytics Section */
.stats-grid {
  @apply stats-grid;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-lg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  transition: all var(--transition-smooth);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevation-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary-600);
  line-height: 1;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: var(--spacing-1);
  font-size: 0.875rem;
}

/* Timeline Improvements */
.timeline-section {
  margin-top: var(--spacing-lg);
}

.section-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-md);
}

.timeline-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
}

.timeline-item {
  display: grid;
  grid-template-columns: 110px 90px 1fr;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-b: 1px solid var(--glass-border);
  transition: all var(--transition-smooth);
}

.timeline-item:hover {
  background: var(--glass-bg);
}

.timeline-item:last-child {
  border-b: 0;
}

.timeline-time {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.timeline-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.timeline-content {
  color: var(--text-primary-600);
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .ai-media-workbench {
    padding: var(--spacing-md);
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .session-meta,
  .modes,
  .meta {
    justify-content: center;
  }

  .split-grid {
    grid-template-columns: 1fr;
  }

  .gallery .grid {
    @apply compact-grid;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-1);
  }

  .stats-grid {
    @apply compact-grid;
  }
}
</style>
