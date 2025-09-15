<template>
  <div class="live-preview-panel" :class="{ 'is-sticky': isSticky, 'is-floating': isFloating }">
    <div class="preview-header">
      <div class="preview-title">
        <AppIcon name="mdi-eye-outline" />
        <span>Live Preview</span>
        <div class="preview-sync-indicator" :class="{ 'is-syncing': isSyncing }">
          <div class="sync-dot"></div>
        </div>
      </div>
      <div class="preview-controls">
        <UnifiedButton
          variant="ghost"
          size="xs"
          :leading-icon="isFloating ? 'mdi-dock-window' : 'mdi-window-open-variant'"
          @click="toggleFloating"
        />
        <UnifiedButton
          variant="ghost"
          size="xs"
          leading-icon="mdi-refresh"
          @click="refreshPreview"
        />
        <UnifiedButton
          variant="ghost"
          size="xs"
          :leading-icon="showPreview ? 'mdi-eye-off' : 'mdi-eye'"
          @click="togglePreview"
        />
      </div>
    </div>

    <div v-if="showPreview" class="preview-content">
      <!-- Template Switcher -->
      <div class="template-switcher">
        <div class="template-tabs">
          <button
            v-for="template in availableTemplates"
            :key="template.id"
            class="template-tab"
            :class="{ active: selectedTemplate === template.id }"
            @click="switchTemplate(template.id)"
          >
            {{ template.name }}
          </button>
        </div>
      </div>

      <!-- Document Preview -->
      <div class="document-preview" :class="`template-${selectedTemplate}`">
        <!-- Resume Preview -->
        <div v-if="documentType === 'resume'" class="resume-preview">
          <div class="preview-page">
            <!-- Header Section -->
            <div class="preview-header-section">
              <h1 class="preview-name">
                {{ resumeData.name || 'Your Name' }}
              </h1>
              <div v-if="resumeData.title" class="preview-title">
                {{ resumeData.title }}
              </div>
              <div class="preview-contact">
                <span v-if="resumeData.email" class="contact-item">
                  <AppIcon name="mdi-email" />
                  {{ resumeData.email }}
                </span>
                <span v-if="resumeData.phone" class="contact-item">
                  <AppIcon name="mdi-phone" />
                  {{ resumeData.phone }}
                </span>
                <span v-if="resumeData.location" class="contact-item">
                  <AppIcon name="mdi-map-marker" />
                  {{ resumeData.location }}
                </span>
              </div>
              <div v-if="resumeData.linkedin || resumeData.github || resumeData.website" class="preview-links">
                <a v-if="resumeData.linkedin" class="preview-link" target="_blank">
                  <AppIcon name="mdi-linkedin" />
                  LinkedIn
                </a>
                <a v-if="resumeData.github" class="preview-link" target="_blank">
                  <AppIcon name="mdi-github" />
                  GitHub
                </a>
                <a v-if="resumeData.website" class="preview-link" target="_blank">
                  <AppIcon name="mdi-web" />
                  Portfolio
                </a>
              </div>
            </div>

            <!-- Summary Section -->
            <div v-if="resumeData.summary" class="preview-section">
              <h2 class="preview-section-title">Professional Summary</h2>
              <div class="preview-section-content">
                <p class="preview-summary">{{ resumeData.summary }}</p>
              </div>
            </div>

            <!-- Experience Section -->
            <div v-if="resumeData.experience && resumeData.experience.length > 0" class="preview-section">
              <h2 class="preview-section-title">Experience</h2>
              <div class="preview-section-content">
                <div
                  v-for="(exp, index) in resumeData.experience"
                  :key="index"
                  class="preview-experience-item"
                >
                  <div class="experience-header">
                    <div class="experience-title-company">
                      <h3 class="experience-title">{{ exp.title || 'Job Title' }}</h3>
                      <div class="experience-company">{{ exp.company || 'Company Name' }}</div>
                    </div>
                    <div class="experience-dates">
                      {{ formatDateRange(exp.startDate, exp.endDate, exp.current) }}
                    </div>
                  </div>
                  <div v-if="exp.description" class="experience-description">
                    <div v-html="formatDescription(exp.description)"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Skills Section -->
            <div v-if="resumeData.skills && resumeData.skills.length > 0" class="preview-section">
              <h2 class="preview-section-title">Skills</h2>
              <div class="preview-section-content">
                <div class="skills-grid">
                  <span
                    v-for="(skill, index) in resumeData.skills"
                    :key="index"
                    class="skill-tag"
                  >
                    {{ typeof skill === 'string' ? skill : skill.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Education Section -->
            <div v-if="resumeData.education && resumeData.education.length > 0" class="preview-section">
              <h2 class="preview-section-title">Education</h2>
              <div class="preview-section-content">
                <div
                  v-for="(edu, index) in resumeData.education"
                  :key="index"
                  class="preview-education-item"
                >
                  <div class="education-header">
                    <div class="education-degree">{{ edu.degree || 'Degree' }}</div>
                    <div class="education-school">{{ edu.institution || edu.school || 'Institution' }}</div>
                    <div class="education-date">{{ edu.year || edu.endDate || 'Year' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Placeholder sections for empty state -->
            <div v-if="isEmptyState" class="empty-state">
              <AppIcon name="mdi-file-document-outline" />
              <p>Start adding your information to see the live preview</p>
            </div>
          </div>
        </div>

        <!-- Cover Letter Preview -->
        <div v-else-if="documentType === 'cover-letter'" class="cover-letter-preview">
          <div class="preview-page">
            <div class="letter-header">
              <div class="letter-contact">
                <div class="sender-info">
                  <div class="sender-name">{{ resumeData.name || 'Your Name' }}</div>
                  <div class="sender-email">{{ resumeData.email || 'your.email@example.com' }}</div>
                  <div class="sender-phone">{{ resumeData.phone || '(555) 123-4567' }}</div>
                </div>
                <div class="letter-date">{{ currentDate }}</div>
              </div>
              <div v-if="coverLetterData?.jobInfo?.company" class="recipient-info">
                <div class="company-name">{{ coverLetterData.jobInfo.company }}</div>
                <div v-if="coverLetterData.jobInfo.hiringManager" class="hiring-manager">
                  {{ coverLetterData.jobInfo.hiringManager }}
                </div>
              </div>
            </div>

            <div class="letter-content">
              <div v-if="coverLetterData?.content?.opening" class="letter-section">
                {{ coverLetterData.content.opening }}
              </div>
              <div v-if="coverLetterData?.content?.body" class="letter-section">
                {{ coverLetterData.content.body }}
              </div>
              <div v-if="coverLetterData?.content?.closing" class="letter-section">
                {{ coverLetterData.content.closing }}
              </div>
              <div class="letter-signature">
                <div class="signature-line">Sincerely,</div>
                <div class="signature-name">{{ resumeData.name || 'Your Name' }}</div>
              </div>
            </div>

            <div v-if="isCoverLetterEmpty" class="empty-state">
              <AppIcon name="mdi-email-edit-outline" />
              <p>Add job information and content to see your cover letter preview</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Stats -->
      <div class="preview-stats">
        <div class="stat-item">
          <span class="stat-label">Words:</span>
          <span class="stat-value">{{ totalWords }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Sections:</span>
          <span class="stat-value">{{ completedSections }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">ATS Score:</span>
          <span class="stat-value" :class="atsScoreClass">{{ atsScore }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface ResumeData {
  name?: string
  title?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
  summary?: string
  experience?: Array<{
    title?: string
    company?: string
    startDate?: string
    endDate?: string
    current?: boolean
    description?: string
  }>
  skills?: Array<{ name: string } | string>
  education?: Array<{
    degree?: string
    institution?: string
    school?: string
    year?: string
    endDate?: string
  }>
}

interface CoverLetterData {
  jobInfo?: {
    company?: string
    position?: string
    hiringManager?: string
  }
  content?: {
    opening?: string
    body?: string
    closing?: string
  }
}

const props = defineProps<{
  resumeData: ResumeData
  coverLetterData?: CoverLetterData
  documentType: 'resume' | 'cover-letter'
  selectedTemplate: string
  isSticky?: boolean
  jobDescription?: string
}>()

const emit = defineEmits<{
  'template-change': [templateId: string]
  'toggle-floating': []
}>()

// State
const showPreview = ref(true)
const isFloating = ref(false)
const isSyncing = ref(false)

// Templates
const availableTemplates = ref([
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'elegant', name: 'Elegant' },
  { id: 'compact', name: 'Compact' }
])

// Computed properties
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const isEmptyState = computed(() => {
  const data = props.resumeData
  return !data.name && !data.email && !data.summary && 
         (!data.experience || data.experience.length === 0)
})

const isCoverLetterEmpty = computed(() => {
  const data = props.coverLetterData
  return !data?.jobInfo?.company && !data?.content?.opening && 
         !data?.content?.body && !data?.content?.closing
})

const totalWords = computed(() => {
  let count = 0
  const data = props.resumeData
  
  if (data.summary) count += data.summary.split(/\s+/).filter(Boolean).length
  
  if (data.experience) {
    data.experience.forEach(exp => {
      if (exp.description) {
        count += exp.description.split(/\s+/).filter(Boolean).length
      }
    })
  }
  
  if (props.documentType === 'cover-letter' && props.coverLetterData?.content) {
    const content = props.coverLetterData.content
    if (content.opening) count += content.opening.split(/\s+/).filter(Boolean).length
    if (content.body) count += content.body.split(/\s+/).filter(Boolean).length
    if (content.closing) count += content.closing.split(/\s+/).filter(Boolean).length
  }
  
  return count
})

const completedSections = computed(() => {
  let count = 0
  const data = props.resumeData
  
  if (data.name && data.email) count++ // Personal Info
  if (data.summary) count++ // Summary
  if (data.experience && data.experience.length > 0) count++ // Experience
  if (data.skills && data.skills.length > 0) count++ // Skills
  if (data.education && data.education.length > 0) count++ // Education
  
  return count
})

const atsScore = computed(() => {
  // Simple ATS score calculation based on completeness and keywords
  let score = 0
  const data = props.resumeData
  
  // Basic completeness (40 points)
  if (data.name && data.email) score += 10
  if (data.summary) score += 10
  if (data.experience && data.experience.length > 0) score += 10
  if (data.skills && data.skills.length >= 3) score += 10
  
  // Content quality (30 points)
  if (data.summary && data.summary.length > 50) score += 15
  if (data.experience && data.experience.some(exp => exp.description && exp.description.length > 100)) {
    score += 15
  }
  
  // Keyword matching with job description (30 points)
  if (props.jobDescription) {
    const jobKeywords = props.jobDescription.toLowerCase().split(/\W+/).filter(Boolean)
    const resumeText = [
      data.summary || '',
      ...(data.experience?.map(exp => exp.description || '') || []),
      ...(data.skills?.map(skill => typeof skill === 'string' ? skill : skill.name) || [])
    ].join(' ').toLowerCase()
    
    const matches = jobKeywords.filter(keyword => 
      keyword.length > 3 && resumeText.includes(keyword)
    ).length
    
    score += Math.min(30, (matches / Math.max(jobKeywords.length * 0.3, 1)) * 30)
  }
  
  return Math.round(Math.min(100, score))
})

const atsScoreClass = computed(() => {
  if (atsScore.value >= 80) return 'score-excellent'
  if (atsScore.value >= 60) return 'score-good'
  if (atsScore.value >= 40) return 'score-fair'
  return 'score-poor'
})

// Methods
function togglePreview() {
  showPreview.value = !showPreview.value
}

function toggleFloating() {
  isFloating.value = !isFloating.value
  emit('toggle-floating')
}

function refreshPreview() {
  isSyncing.value = true
  setTimeout(() => {
    isSyncing.value = false
  }, 500)
}

function switchTemplate(templateId: string) {
  emit('template-change', templateId)
}

function formatDateRange(startDate?: string, endDate?: string, current?: boolean): string {
  if (current) {
    return `${startDate || 'Start'} - Present`
  }
  return `${startDate || 'Start'} - ${endDate || 'End'}`
}

function formatDescription(description: string): string {
  // Convert line breaks to bullet points for better preview
  return description
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<div class="description-line">• ${line.trim()}</div>`)
    .join('')
}

// Watch for data changes to trigger sync indicator
watch([() => props.resumeData, () => props.coverLetterData], () => {
  isSyncing.value = true
  setTimeout(() => {
    isSyncing.value = false
  }, 300)
}, { deep: true })
</script>

<style scoped>
.live-preview-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: fit-content;
}

.live-preview-panel.is-sticky {
  position: sticky;
  top: 24px;
}

.live-preview-panel.is-floating {
  position: fixed;
  top: 80px;
  right: 24px;
  width: 400px;
  max-height: 80vh;
  z-index: 1000;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(var(--color-primary-500-rgb), 0.05);
  border-bottom: 1px solid var(--glass-border);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-sync-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  position: relative;
}

.preview-sync-indicator.is-syncing {
  background: #f59e0b;
}

.sync-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.preview-controls {
  display: flex;
  gap: 4px;
}

.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.template-switcher {
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
}

.template-tabs {
  display: flex;
  gap: 4px;
}

.template-tab {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-tab:hover {
  background: rgba(var(--color-primary-500-rgb), 0.05);
}

.template-tab.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.document-preview {
  padding: 16px;
  background: white;
  color: #000;
  font-size: 12px;
  line-height: 1.4;
}

.preview-page {
  background: white;
  padding: 20px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  margin: 8px 0;
}

/* Resume Preview Styles */
.preview-header-section {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.preview-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-primary-500);
  margin-bottom: 4px;
}

.preview-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.preview-contact {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.preview-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-primary-500);
  text-decoration: none;
}

.preview-section {
  margin-bottom: 16px;
}

.preview-section-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-primary-500);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e0e0e0;
}

.preview-section-content {
  padding-left: 8px;
}

.preview-summary {
  font-size: 12px;
  line-height: 1.5;
  color: #333;
}

.preview-experience-item {
  margin-bottom: 12px;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.experience-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.experience-company {
  font-size: 12px;
  color: #666;
}

.experience-dates {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
}

.experience-description {
  margin-top: 6px;
  font-size: 11px;
  color: #555;
}

.description-line {
  margin-bottom: 2px;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-tag {
  padding: 2px 6px;
  background: rgba(var(--color-primary-500-rgb), 0.1);
  color: var(--color-primary-500);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.preview-education-item {
  margin-bottom: 8px;
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.education-degree {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.education-school {
  font-size: 11px;
  color: #666;
}

.education-date {
  font-size: 10px;
  color: #888;
}

/* Cover Letter Preview */
.letter-header {
  margin-bottom: 24px;
}

.letter-contact {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sender-info div {
  font-size: 11px;
  margin-bottom: 2px;
}

.sender-name {
  font-weight: 600;
  color: var(--color-primary-500);
}

.letter-date {
  font-size: 11px;
  color: #666;
}

.recipient-info {
  margin-top: 12px;
}

.company-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.hiring-manager {
  font-size: 11px;
  color: #666;
}

.letter-content {
  line-height: 1.6;
}

.letter-section {
  margin-bottom: 16px;
  font-size: 11px;
  color: #333;
}

.letter-signature {
  margin-top: 24px;
}

.signature-line {
  font-size: 11px;
  color: #333;
  margin-bottom: 24px;
}

.signature-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary-500);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}

.empty-state svg {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Preview Stats */
.preview-stats {
  padding: 12px 16px;
  background: rgba(var(--color-primary-500-rgb), 0.02);
  border-top: 1px solid var(--glass-border);
  display: flex;
  gap: 16px;
  font-size: 11px;
}

.stat-item {
  display: flex;
  gap: 4px;
}

.stat-label {
  color: var(--text-tertiary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.score-excellent { color: #10b981; }
.stat-value.score-good { color: #3b82f6; }
.stat-value.score-fair { color: #f59e0b; }
.stat-value.score-poor { color: #ef4444; }

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Template Variations */
.document-preview.template-modern .preview-name {
  color: #6366f1;
}

.document-preview.template-elegant .preview-section-title {
  color: #8b5cf6;
}

.document-preview.template-compact .preview-section {
  margin-bottom: 12px;
}

.document-preview.template-compact .preview-section-title {
  font-size: 13px;
}
</style>