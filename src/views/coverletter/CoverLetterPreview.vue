<!--
  CANONICAL Cover Letter Preview Panel
  Matches the design and functionality of Resume PreviewPanel
-->
<template>
  <div class="cover-letter-preview-wrapper font-sans">
    <!-- Preview Controls Header -->
    <div class="preview-controls glass-elevated mb-3">
      <div class="flex items-center justify-between flex-wrap gap-glass-md">
        <div class="flex items-center gap-glass-sm">
          <h2 class="h6 mb-0 text-primary-600">
            <AppIcon name="EyeIcon" size="default" aria-hidden="true" />
            Live Preview
          </h2>
          <div class="live-indicator flex items-center">
            <div class="live-pulse mr-2"></div>
            <small class="text-secondary font-medium">Auto-updating</small>
          </div>
        </div>

        <!-- Template Selector -->
        <div class="template-selector flex items-center gap-glass-sm">
          <label class="form-label mb-0 text-secondary small hidden d-md-inline">Template:</label>
          <select
            class="form-select form-select-sm glass-input"
            :value="selectedTemplate"
            style="min-width: 140px"
            @change="onTemplateChange"
          >
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="creative">Creative</option>
            <option value="executive">Executive</option>
            <option value="minimal">Minimal</option>
            <option v-if="canUseAI" value="ai-smart">AI Smart</option>
          </select>
        </div>

        <!-- AI Template Button -->
        <UnifiedButton
          v-if="canUseAI"
          variant="outline"
          size="sm"
          :loading="loading.templateGeneration"
          leading-icon="CommandLineIcon"
          :aria-label="loading.templateGeneration ? 'Generating smart template...' : 'Generate AI smart template'"
          @click="$emit('generate-smart-template')"
        >
          <span class="hidden d-lg-inline">Smart Template</span>
          <span class="d-lg-none">AI</span>
        </UnifiedButton>
      </div>
    </div>

    <!-- Export Actions Bar -->
    <div class="export-actions glass-elevated mb-3">
      <div class="flex items-center justify-between flex-wrap gap-glass-sm">
        <div class="flex items-center gap-glass-sm">
          <small class="text-secondary font-medium">Export Options:</small>
        </div>

        <div
          class="btn-group btn-group-sm"
          role="group"
          aria-label="Cover letter export and preview options"
        >
          <UnifiedButton
            variant="ghost"
            :disabled="!hasContent"
            leading-icon="LinkIcon-variant"
            aria-label="Open full preview in new window"
            @click="previewWindow"
          >
            <span class="hidden d-sm-inline">Full Preview</span>
            <span class="d-sm-none">Preview</span>
          </UnifiedButton>

          <UnifiedButton
            variant="primary"
            :disabled="!hasContent"
            :loading="loading.export"
            leading-icon="DocumentIcon-pdf-box"
            aria-label="Export cover letter as PDF"
            @click="exportPDF"
          >
            <span class="hidden d-sm-inline">Export PDF</span>
            <span class="d-sm-none">PDF</span>
          </UnifiedButton>

          <!-- Export Dropdown -->
          <div class="btn-group btn-group-sm" role="group">
            <UnifiedButton
              class="dropdown-toggle"
              variant="outline"
              icon-only
              icon="EllipsisVerticalIcon"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              :disabled="!hasContent"
              aria-label="More export options"
            />
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  class="dropdown-item"
                  :disabled="!hasContent"
                  @click="printDocument"
                >
                  <AppIcon name="mdi-printer" class="mr-2" aria-hidden="true" />
                  Print
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  :disabled="!hasContent || loading.export"
                  @click="exportDOCX"
                >
                  <AppIcon name="DocumentIcon-word-box" class="mr-2" aria-hidden="true" />
                  Export as DOCX
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  :disabled="!hasContent || loading.export"
                  @click="exportHTML"
                >
                  <AppIcon name="mdi-language-html5" class="mr-2" aria-hidden="true" />
                  Export as HTML
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button
                  class="dropdown-item"
                  :disabled="!hasContent"
                  @click="copyToClipboard"
                >
                  <AppIcon name="ClipboardDocumentIcon" aria-hidden="true" />
                  Copy to Clipboard
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  :disabled="!hasContent"
                  @click="copyEmailFormat"
                >
                  <AppIcon name="EnvelopeIcon" aria-hidden="true" />
                  Copy for Email
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="preview-content-container">
      <div
        ref="previewElement"
        class="cover-letter-preview glass-elevated"
        :class="[ `template-${selectedTemplate}`,
                  { 'preview-loading': loading.generation }
        ]"
      >
        <!-- Loading State -->
        <div v-if="loading.generation" class="preview-loading-state">
          <div class="text-center py-5">
            <div class="spinner-border text-primary-600 mb-3" role="status">
              <span class="visually-hidden">Generating cover letter...</span>
            </div>
            <h3 class="h5 text-secondary mb-2">Generating Your Cover Letter</h3>
            <p class="text-secondary small">
              AI is creating personalized content based on your job information...
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!hasContent" class="preview-empty-state">
          <div class="text-center py-5">
            <AppIcon name="mdi-text-box-outline" class="display-1 text-secondary mb-3" aria-hidden="true" />
            <h3 class="h5 text-secondary mb-2">No Cover Letter Content</h3>
            <p class="text-secondary small mb-3">
              Fill out the job information and generate content to see your cover letter preview.
            </p>
            <UnifiedButton
              v-if="canUseAI && hasJobInfo"
              variant="outline"
              leading-icon="SparklesIcon"
              @click="$emit('generate-content')"
            >
              Generate Cover Letter
            </UnifiedButton>
            <UnifiedButton
              v-else-if="!hasJobInfo"
              variant="outline"
              leading-icon="BriefcaseIcon"
              @click="$emit('switch-to-job-info')"
            >
              Add Job Information
            </UnifiedButton>
          </div>
        </div>

        <!-- Cover Letter Content -->
        <div v-else class="cover-letter-content" :data-template="selectedTemplate">
          <!-- Header -->
          <div class="letter-header mb-4">
            <div class="applicant-info">
              <h1 class="applicant-name">{{ personalInfo.name || '[Your Name]' }}</h1>
              <div class="contact-info">
                <span v-if="personalInfo.email">{{ personalInfo.email }}</span>
                <span v-if="personalInfo.phone && personalInfo.email"> • </span>
                <span v-if="personalInfo.phone">{{ personalInfo.phone }}</span>
                <span v-if="personalInfo.location && (personalInfo.email || personalInfo.phone)"> • </span>
                <span v-if="personalInfo.location">{{ personalInfo.location }}</span>
              </div>
            </div>
            <div class="letter-date">
              {{ formatDate(new Date()) }}
            </div>
          </div>

          <!-- Recipient Info -->
          <div class="recipient-info mb-4">
            <div v-if="jobInfo.hiringManager" class="hiring-manager">
              {{ jobInfo.hiringManager }}
            </div>
            <div v-if="jobInfo.company" class="company-name">
              {{ jobInfo.company }}
            </div>
            <div v-if="jobInfo.position" class="position-info text-secondary">
              Re: {{ jobInfo.position }}
            </div>
          </div>

          <!-- Salutation -->
          <div class="salutation mb-3">
            <p>
              Dear {{ jobInfo.hiringManager || 'Hiring Manager' }},
            </p>
          </div>

          <!-- Letter Body -->
          <div class="letter-body">
            <div v-if="content.body" class="formatted-content">
              <div
                v-for="(paragraph, index) in formattedParagraphs"
                :key="`paragraph-${index}`"
                class="paragraph mb-3"
              >
                {{ paragraph }}
              </div>
            </div>
            <div v-else class="placeholder-content text-secondary">
              <p class="mb-3">
                [Opening paragraph introducing yourself and stating your interest in the {{ jobInfo.position || 'position' }}]
              </p>
              <p class="mb-3">
                [Body paragraph highlighting your relevant experience and achievements]
              </p>
              <p class="mb-3">
                [Closing paragraph expressing enthusiasm and requesting an interview]
              </p>
            </div>
          </div>

          <!-- Closing -->
          <div class="letter-closing mt-4">
            <p class="mb-3">
              Sincerely,
            </p>
            <p class="signature-line">
              {{ personalInfo.name || '[Your Name]' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Stats -->
    <div v-if="hasContent" class="preview-stats mt-3">
      <div class="small text-secondary flex items-center justify-between">
        <div class="flex items-center gap-glass-md">
          <span>
            <AppIcon name="DocumentTextIcon" class="icon-sm mr-1" aria-hidden="true" />
            {{ stats.wordCount }} words
          </span>
          <span>
            <AppIcon name="ClockIcon" class="icon-sm mr-1" aria-hidden="true" />
            {{ stats.readingTime }} min read
          </span>
          <span>
            <AppIcon name="mdi-format-text" class="icon-sm mr-1" aria-hidden="true" />
            {{ stats.characterCount }} characters
          </span>
        </div>
        <div class="template-indicator">
          Template: <strong>{{ formatTemplateName(selectedTemplate) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BriefcaseIcon, ClipboardDocumentIcon, ClockIcon, CommandLineIcon, DocumentTextIcon, EnvelopeIcon, EyeIcon, SparklesIcon } from '@heroicons/vue/24/outline'

import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
}

interface JobInfo {
  company: string
  position: string
  hiringManager: string
}

interface Content {
  body: string
}

const props = defineProps<{
  personalInfo: PersonalInfo
  jobInfo: JobInfo
  content: Content
  selectedTemplate: string
  canUseAI: boolean
  hasJobInfo: boolean
  loading: {
    generation?: boolean
    export?: boolean
    templateGeneration?: boolean
  }
}>()

// Emits
const emit = defineEmits<{
  'update:selectedTemplate': [template: string]
  'generate-smart-template': []
  'generate-content': []
  'switch-to-job-info': []
  'export-pdf': []
  'export-docx': []
  'export-html': []
  'preview-window': []
  'copy-clipboard': []
  'copy-email': []
  'print': []
}>()

// Refs
const previewElement = ref<HTMLElement>()

// Computed
const hasContent = computed(() => {
  return !!(props.content.body && props.jobInfo.company && props.jobInfo.position)
})

const formattedParagraphs = computed(() => {
  if (!props.content.body) return []
  return props.content.body
    .split('\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
})

const stats = computed(() => {
  const text = props.content.body || ''
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  
  return {
    wordCount: words.length,
    characterCount: text.length,
    readingTime: Math.max(1, Math.round(words.length / 200)) // 200 words per minute
  }
})

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTemplateName = (template: string) => {
  return template.charAt(0).toUpperCase() + template.slice(1).replace('-', ' ')
}

const previewWindow = () => {
  emit('preview-window')
}

const exportPDF = () => {
  emit('export-pdf')
}

const exportDOCX = () => {
  emit('export-docx')
}

const exportHTML = () => {
  emit('export-html')
}

const copyToClipboard = () => {
  emit('copy-clipboard')
}

const copyEmailFormat = () => {
  emit('copy-email')
}

const printDocument = () => {
  emit('print')
}

// Safer template change handler for TS template checking
const onTemplateChange = (e: Event) => {
  const target = e.target as HTMLSelectElement | null
  const val = target?.value || ''
  emit('update:selectedTemplate', val)
}
</script>

<style scoped lang="scss">
.cover-letter-preview-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// Controls styling (matching resume preview)
.preview-controls,
.export-actions {
  background: var(--glass-elevated);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  
  .live-pulse {
    width: 8px;
    height: 8px;
    background: var(--color-success);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

// Preview content container
.preview-content-container {
  flex: 1;
  min-height: 600px;
}

.cover-letter-preview {
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xxl);
  min-height: 600px;
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-smooth);
  position: relative;
  overflow: hidden;
  
  &.preview-loading {
    opacity: 0.7;
  }
}

// Cover letter content styling
.cover-letter-content {
  font-family: var(--font-secondary, 'Inter', 'Georgia', serif);
  line-height: 1.6;
  color: var(--text-primary-600);
  font-size: var(--font-size-base);
  
  &[data-template="modern"] {
    font-family: var(--font-primary);
    
    .letter-header {
      border-b: 2px solid var(--color-primary);
      padding-bottom: var(--spacing-md);
    }
    
    .applicant-name {
      color: var(--color-primary);
    }
  }
  
  &[data-template="creative"] {
    .letter-header {
      background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, transparent 100%);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
    }
  }
  
  &[data-template="executive"] {
    font-size: var(--font-size-md);
    
    .applicant-name {
      font-size: var(--font-size-3xl);
      letter-spacing: 1px;
    }
  }
  
  &[data-template="minimal"] {
    .letter-header,
    .recipient-info {
      padding: 0;
      margin-bottom: var(--spacing-md);
    }
    
    .applicant-name {
      font-size: var(--font-size-2xl);
      font-weight: 300;
    }
  }
}

.letter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .applicant-name {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary-600);
    margin-bottom: var(--spacing-xs);
    background: linear-gradient(90deg, var(--text-primary-600), color-mix(in srgb, var(--color-primary-500) 40%, var(--text-primary-600)));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: shimmer 2.2s ease-in-out infinite;
  }
  
  .contact-info {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .letter-date {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-align: right;
  }
}

@keyframes shimmer {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 0 transparent); }
  50% { opacity: 0.9; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-primary-500) 35%, transparent)); }
}

.recipient-info {
  .hiring-manager {
    font-weight: 600;
    color: var(--text-primary-600);
    margin-bottom: var(--spacing-xs);
  }
  
  .company-name {
    font-weight: 500;
    color: var(--text-primary-600);
    margin-bottom: var(--spacing-xs);
  }
  
  .position-info {
    font-style: italic;
  }
}

.salutation {
  p {
    margin: 0;
    font-weight: 500;
  }
}

.letter-body {
  .paragraph {
    text-align: justify;
    hyphens: auto;
  }
  
  .placeholder-content {
    font-style: italic;
    opacity: 0.7;
  }
}

.letter-closing {
  .signature-line {
    font-weight: 600;
    color: var(--text-primary-600);
    margin-top: var(--spacing-lg);
  }
}

// Empty and loading states
.preview-empty-state,
.preview-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
}

// Stats styling
.preview-stats {
  background: var(--glass-elevated);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
}

// Dark theme support
[data-theme="dark"] {
  .preview-controls,
  .export-actions,
  .cover-letter-preview,
  .preview-stats {
    background: var(--glass-surface-dark);
    border-color: var(--glass-border-dark);
  }
  
  .cover-letter-content {
    color: var(--text-primary-600);
    
    .applicant-name,
    .hiring-manager,
    .company-name,
    .signature-line {
      color: var(--text-primary-600);
    }
    
    .contact-info,
    .letter-date,
    .position-info {
      color: var(--text-secondary);
    }
  }
}

// Print styles
@media print {
  .cover-letter-preview {
    background: white !important;
    border: none !important;
    box-shadow: none !important;
    padding: 1in !important;
    
    .cover-letter-content {
      color: black !important;
      
      * {
        color: black !important;
      }
    }
  }
  
  .preview-controls,
  .export-actions,
  .preview-stats {
    display: none !important;
  }
}

// Responsive design
@media (max-width: 768px) {
  .cover-letter-preview {
    padding: var(--spacing-lg);
    font-size: 0.9rem;
  }
  
  .letter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    
    .applicant-name {
      font-size: var(--font-size-2xl);
    }
    
    .letter-date {
      text-align: left;
    }
  }
  
  .preview-controls,
  .export-actions {
    .flex {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-sm);
    }
  }
  
  .preview-stats .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}

// Export button styling
.btn-ghost {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  
  &:hover {
    background: var(--glass-elevated);
    color: var(--text-primary-600);
  }
}
</style>
