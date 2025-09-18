<template>
  <div class="cover-letter-layout font-sans">
    <!-- Header Section -->
    <header class="cover-letter-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="cover-letter-title">Cover Letter Builder</h1>
          <p class="cover-letter-subtitle">
            Create personalized cover letters that stand out
          </p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary" @click="saveDraft">
            <AppIcon name="mdi-content-save" />
            Save Draft
          </button>
          <button class="action-btn secondary" @click="previewLetter">
            <AppIcon name="EyeIcon" />
            Preview
          </button>
          <button class="action-btn primary" @click="exportLetter">
            <AppIcon name="ArrowDownTrayIcon" />
            Export
          </button>
        </div>
      </div>

      <!-- Job Information Strip -->
      <div v-if="jobInfo" class="job-info-strip">
        <div class="job-details">
          <div class="company-info">
            <h3 class="company-name">{{ jobInfo.company }}</h3>
            <p class="job-title">{{ jobInfo.title }}</p>
          </div>
          <div class="job-meta">
            <span class="job-type">{{ jobInfo.type }}</span>
            <span class="job-location">{{ jobInfo.location }}</span>
          </div>
        </div>
        <button class="change-job-btn" @click="changeJob">
          <AppIcon name="PencilIcon" />
          Change Job
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="cover-letter-main">
      <!-- Side Panel -->
      <aside class="cover-letter-sidebar">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3 class="panel-title">Quick Actions</h3>
          <div class="action-grid">
            <button class="quick-action-btn" @click="generateWithAI">
              <AppIcon name="CpuChipIcon" />
              <span>AI Generate</span>
            </button>
            <button class="quick-action-btn" @click="useTemplate">
              <AppIcon name="DocumentIcon" />
              <span>Use Template</span>
            </button>
            <button class="quick-action-btn" @click="improveWithAI">
              <AppIcon name="SparklesIcon" />
              <span>AI Improve</span>
            </button>
            <button class="quick-action-btn" @click="checkTone">
              <AppIcon name="mdi-scale-balance" />
              <span>Check Tone</span>
            </button>
          </div>
        </div>

        <!-- Writing Tips -->
        <div class="writing-tips">
          <h3 class="panel-title">Writing Tips</h3>
          <div class="tips-list">
            <div v-for="tip in writingTips" :key="tip.id" class="tip-item">
              <AppIcon class="tip-icon" :name="tip.icon" />
              <div class="tip-content">
                <h4 class="tip-title">{{ tip.title }}</h4>
                <p class="tip-description">{{ tip.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Tracker -->
        <div class="progress-tracker">
          <h3 class="panel-title">Completion Progress</h3>
          <div class="progress-items">
            <div
              v-for="item in progressItems"
              :key="item.id"
              class="progress-item"
              :class="{ completed: item.completed }"
            >
              <AppIcon
                v-if="item.completed"
                name="CheckCircleIcon"
                class="progress-icon"
              />
              <AppIcon v-else name="mdi-circle-outline" class="progress-icon" />
              <span class="progress-text">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Content Editor -->
      <div class="cover-letter-content">
        <!-- Content Toolbar -->
        <div class="content-toolbar">
          <div class="toolbar-section">
            <button
              class="toolbar-btn"
              :class="{ active: editorMode === 'write' }"
              @click="setEditorMode('write')"
            >
              <AppIcon name="PencilIcon" />
              Write
            </button>
            <button
              class="toolbar-btn"
              :class="{ active: editorMode === 'format' }"
              @click="setEditorMode('format')"
            >
              <AppIcon name="mdi-format-text" />
              Format
            </button>
            <button
              class="toolbar-btn"
              :class="{ active: editorMode === 'review' }"
              @click="setEditorMode('review')"
            >
              <AppIcon name="ClipboardDocumentIcon" />
              Review
            </button>
          </div>

          <div class="toolbar-actions">
            <button
              class="toolbar-btn"
              :disabled="!canUndo"
              @click="undoChange"
            >
              <AppIcon name="mdi-undo" />
            </button>
            <button
              class="toolbar-btn"
              :disabled="!canRedo"
              @click="redoChange"
            >
              <AppIcon name="mdi-redo" />
            </button>
            <div class="word-count">{{ wordCount }} words</div>
          </div>
        </div>

        <!-- Editor Content -->
        <div class="editor-container">
          <div
            class="letter-editor"
            :class="{ 'review-mode': editorMode === 'review' }"
          >
            <slot :mode="editorMode" :letter-data="letterData"></slot>
          </div>
        </div>
      </div>

      <!-- Live Preview Panel (Optional) -->
      <div v-show="showPreview" class="preview-panel">
        <div class="preview-header">
          <h3>Live Preview</h3>
          <div class="preview-actions">
            <button class="icon-btn" @click="togglePreviewMode">
              <AppIcon v-if="previewMode === 'letter'" name="DocumentIcon" />
              <AppIcon v-else name="EnvelopeIcon" />
            </button>
            <button class="icon-btn" @click="closePreview">
              <AppIcon name="XMarkIcon-circle-outline" context="error" />
            </button>
          </div>
        </div>
        <div class="preview-content">
          <div ref="previewContainer" class="letter-preview">
            <!-- Preview content will be rendered here -->
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CpuChipIcon,
  DocumentIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

import { ref, onMounted, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'CoverLetterLayout',
  components: {
    AppIcon,
  },
  props: {
    letterData: {
      type: Object,
      default: () => ({}),
    },
    jobInfo: {
      type: Object,
      default: null,
    },
    showPreview: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'save-draft',
    'preview',
    'export',
    'generate-ai',
    'improve-ai',
    'use-template',
    'change-job',
    'preview-toggle',
    'check-tone',
  ],
  setup(props, { emit }) {
    const editorMode = ref('write')
    const previewMode = ref('letter')
    const canUndo = ref(false)
    const canRedo = ref(false)

    const writingTips = ref([
      {
        id: 1,
        icon: 'CursorArrowRaysIcon',
        title: 'Be Specific',
        description: 'Tailor your letter to the specific job and company',
      },
      {
        id: 2,
        icon: 'mdi-book-open-outline',
        title: 'Tell a Story',
        description: 'Use specific examples to demonstrate your skills',
      },
      {
        id: 3,
        icon: 'ChartBarIcon-line',
        title: 'Show Impact',
        description: 'Quantify your achievements with numbers and results',
      },
      {
        id: 4,
        icon: 'UserIcon-heart',
        title: 'Show Enthusiasm',
        description: 'Express genuine interest in the role and company',
      },
    ])

    const progressItems = ref([
      { id: 1, label: 'Job information added', completed: false },
      { id: 2, label: 'Opening paragraph written', completed: false },
      { id: 3, label: 'Body paragraphs completed', completed: false },
      { id: 4, label: 'Closing paragraph written', completed: false },
      { id: 5, label: 'Proofread and reviewed', completed: false },
    ])

    const wordCount = computed(() => {
      const content = props.letterData.content || ''
      return content.split(/\s+/).filter(word => word.length > 0).length
    })

    const setEditorMode = mode => {
      editorMode.value = mode
    }

    const togglePreviewMode = () => {
      previewMode.value = previewMode.value === 'letter' ? 'email' : 'letter'
    }

    const saveDraft = () => {
      emit('save-draft', props.letterData)
    }

    const previewLetter = () => {
      emit('preview', props.letterData)
    }

    const exportLetter = () => {
      emit('export', props.letterData)
    }

    const generateWithAI = () => {
      emit('generate-ai', {
        jobInfo: props.jobInfo,
        letterData: props.letterData,
      })
    }

    const improveWithAI = () => {
      emit('improve-ai', {
        content: props.letterData.content,
        jobInfo: props.jobInfo,
      })
    }

    const useTemplate = () => {
      emit('use-template')
    }

    const changeJob = () => {
      emit('change-job')
    }

    const checkTone = () => {
      emit('check-tone', props.letterData.content)
    }

    const closePreview = () => {
      emit('preview-toggle')
    }

    const undoChange = () => {
      // Implement undo functionality
    }

    const redoChange = () => {
      // Implement redo functionality
    }

    // Update progress based on content
    const updateProgress = () => {
      // This would be implemented based on actual content analysis
      const content = props.letterData.content || ''
      const hasJobInfo = Boolean(props.jobInfo)

      progressItems.value[0].completed = hasJobInfo
      progressItems.value[1].completed = content.length > 100
      progressItems.value[2].completed = content.length > 300
      progressItems.value[3].completed = content.length > 400
      progressItems.value[4].completed = false // Would be set manually
    }

    onMounted(() => {
      updateProgress()
    })

    return {
      editorMode,
      previewMode,
      canUndo,
      canRedo,
      writingTips,
      progressItems,
      wordCount,
      setEditorMode,
      togglePreviewMode,
      saveDraft,
      previewLetter,
      exportLetter,
      generateWithAI,
      improveWithAI,
      useTemplate,
      changeJob,
      checkTone,
      closePreview,
      undoChange,
      redoChange,
    }
  },
}
</script>

<style scoped>
.cover-letter-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--md-sys-color-surface);
}

.cover-letter-header {
  background-color: var(--md-sys-color-surface-container);
  border-b: 1px solid var(--md-sys-color-outline-variant);
  padding: 16px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-section h1 {
  font: var(--md-sys-typescale-headline-medium-font);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.title-section p {
  font: var(--md-sys-typescale-body-medium-font);
  color: var(--md-sys-color-on-surface-variant);
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 20px;
  border: none;
  font: var(--md-sys-typescale-label-large-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.action-btn.secondary {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.job-info-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--md-sys-color-primary-container);
  border-radius: 12px;
}

.job-details {
  display: flex;
  align-items: center;
  gap: 24px;
}

.company-name {
  font: var(--md-sys-typescale-title-medium-font);
  color: var(--md-sys-color-on-primary-container);
  margin: 0;
}

.job-title {
  font: var(--md-sys-typescale-body-medium-font);
  color: var(--md-sys-color-on-primary-container);
  margin: 4px 0 0;
}

.job-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-type,
.job-location {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.8;
}

.change-job-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 16px;
  font: var(--md-sys-typescale-label-medium-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-job-btn:hover {
  transform: scale(1.02);
}

.cover-letter-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.cover-letter-sidebar {
  width: 300px;
  background-color: var(--md-sys-color-surface-container-low);
  border-r: 1px solid var(--md-sys-color-outline-variant);
  padding: 24px;
  overflow-y: auto;
}

.panel-title {
  font: var(--md-sys-typescale-title-small-font);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px;
}

.quick-actions {
  margin-bottom: 32px;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background-color: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  transform: translateY(-1px);
}

.quick-action-btn i {
  font-size: 24px;
  color: var(--md-sys-color-primary);
}

.quick-action-btn span {
  font: var(--md-sys-typescale-label-small-font);
  text-align: center;
}

.writing-tips {
  margin-bottom: 32px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: var(--md-sys-color-surface);
  border-radius: 12px;
}

.tip-icon {
  font-size: 20px;
  color: var(--md-sys-color-primary);
  margin-top: 2px;
}

.tip-title {
  font: var(--md-sys-typescale-label-large-font);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 4px;
}

.tip-description {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  line-height: 1.4;
}

.progress-tracker {
  background-color: var(--md-sys-color-surface);
  padding: 20px;
  border-radius: 12px;
}

.progress-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-icon {
  font-size: 18px;
  color: var(--md-sys-color-outline);
}

.progress-item.completed .progress-icon {
  color: var(--md-sys-color-primary);
}

.progress-text {
  font: var(--md-sys-typescale-body-medium-font);
  color: var(--md-sys-color-on-surface-variant);
}

.progress-item.completed .progress-text {
  color: var(--md-sys-color-on-surface);
}

.cover-letter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--md-sys-color-surface-container);
  border-b: 1px solid var(--md-sys-color-outline-variant);
}

.toolbar-section {
  display: flex;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  border-radius: 16px;
  font: var(--md-sys-typescale-label-medium-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.toolbar-btn.active {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.toolbar-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-count {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-surface-variant);
  padding: 8px 12px;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

.letter-editor {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
}

.letter-editor.review-mode {
  background-color: var(--md-sys-color-surface-variant);
}

.preview-panel {
  width: 400px;
  background-color: var(--md-sys-color-surface);
  border-l: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-b: 1px solid var(--md-sys-color-outline-variant);
}

.preview-header h3 {
  font: var(--md-sys-typescale-title-medium-font);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 20px;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  transform: scale(1.05);
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.letter-preview {
  background: white;
  min-height: 100%;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .cover-letter-sidebar {
    width: 260px;
  }

  .preview-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .job-details {
    flex-direction: column;
    gap: 8px;
  }

  .cover-letter-main {
    flex-direction: column;
  }

  .cover-letter-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
    padding: 16px;
  }

  .action-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .preview-panel {
    display: none; /* Hide preview on mobile by default */
  }
}
</style>
