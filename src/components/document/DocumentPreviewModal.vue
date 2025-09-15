<template>
  <div v-if="show" class="modal-overlay" class="font-sans" @click="handleOverlayClick">
    <div class="preview-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="flex items-center">
          <AppIcon name="EyeIcon" class="mr-3" />
          <div>
            <h5 class="mb-0">Document Preview</h5>
            <small class="text-secondary">{{ documentTitle }}</small>
          </div>
        </div>
        
        <div class="header-actions flex items-center gap-glass-sm">
          <!-- View Options -->
          <div class="btn-group" role="group">
            <input
              id="view-formatted"
              v-model="viewMode"
              type="radio"
              class="btn-check"
              value="formatted"
            />
            <label for="view-formatted" class="btn btn-outline-primary btn-sm">Formatted</label>

            <input
              id="view-raw"
              v-model="viewMode"
              type="radio"
              class="btn-check"
              value="raw"
            />
            <label for="view-raw" class="btn btn-outline-primary btn-sm">Raw Text</label>
          </div>

          <!-- Export Options -->
          <UnifiedButton
            variant="primary"
            size="sm"
            leading-icon="ArrowDownTrayIcon"
            @click="handleExport('pdf')"
          >
            Export PDF
          </UnifiedButton>

          <!-- Close Button -->
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon="XMarkIcon"
            @click="$emit('close')"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Formatted View -->
        <div v-if="viewMode === 'formatted'" class="preview-container">
          <!-- Resume Preview -->
          <div v-if="documentType === 'resume'" class="document-preview resume-preview">
            <div class="document-page">
              <!-- Header Section -->
              <div class="doc-header">
                <h1 class="doc-name">{{ resumeData.personalInfo?.name || '[Your Name]' }}</h1>
                <div class="contact-info">
                  <span v-if="resumeData.personalInfo?.email">{{ resumeData.personalInfo.email }}</span>
                  <span v-if="resumeData.personalInfo?.phone">{{ resumeData.personalInfo.phone }}</span>
                  <span v-if="resumeData.personalInfo?.location">{{ resumeData.personalInfo.location }}</span>
                  <span v-if="resumeData.personalInfo?.linkedin">{{ resumeData.personalInfo.linkedin }}</span>
                  <span v-if="resumeData.personalInfo?.website">{{ resumeData.personalInfo.website }}</span>
                </div>
              </div>

              <!-- Professional Summary -->
              <div v-if="resumeData.summary" class="doc-section">
                <h3 class="section-title">Professional Summary</h3>
                <p class="summary-text">{{ resumeData.summary }}</p>
              </div>

              <!-- Experience -->
              <div v-if="resumeData.experience && resumeData.experience.length > 0" class="doc-section">
                <h3 class="section-title">Professional Experience</h3>
                <div
                  v-for="(exp, index) in resumeData.experience"
                  :key="index"
                  class="experience-item"
                >
                  <div class="exp-header">
                    <h4 class="exp-title">{{ exp.title || '[Job Title]' }}</h4>
                    <div class="exp-meta">
                      <span class="company">{{ exp.company || '[Company Name]' }}</span>
                      <span class="dates">{{ exp.startDate || 'Start' }} - {{ exp.endDate || 'End' }}</span>
                    </div>
                  </div>
                  <div class="exp-description">
                    <pre>{{ exp.description || '[Job description and achievements]' }}</pre>
                  </div>
                </div>
              </div>

              <!-- Education -->
              <div v-if="resumeData.education && resumeData.education.length > 0" class="doc-section">
                <h3 class="section-title">Education</h3>
                <div
                  v-for="(edu, index) in resumeData.education"
                  :key="index"
                  class="education-item"
                >
                  <div class="edu-header">
                    <h4 class="edu-degree">{{ edu.degree || '[Degree]' }}</h4>
                    <div class="edu-meta">
                      <span class="institution">{{ edu.institution || '[Institution]' }}</span>
                      <span class="year">{{ edu.year || '[Year]' }}</span>
                    </div>
                  </div>
                  <div v-if="edu.gpa" class="edu-gpa">GPA: {{ edu.gpa }}</div>
                </div>
              </div>

              <!-- Skills -->
              <div v-if="resumeData.skills && resumeData.skills.length > 0" class="doc-section">
                <h3 class="section-title">Skills</h3>
                <div class="skills-grid">
                  <span
                    v-for="(skill, index) in resumeData.skills"
                    v-if="skill && (skill.name || skill)"
                    :key="index"
                    class="skill-item"
                  >
                    {{ skill.name || skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cover Letter Preview -->
          <div v-else-if="documentType === 'cover-letter'" class="document-preview cover-letter-preview">
            <div class="document-page">
              <!-- Letter Header -->
              <div class="doc-header">
                <div class="sender-info">
                  <div class="sender-name">{{ resumeData?.personalInfo?.name || '[Your Name]' }}</div>
                  <div class="sender-contact">
                    <div v-if="resumeData?.personalInfo?.email">{{ resumeData.personalInfo.email }}</div>
                    <div v-if="resumeData?.personalInfo?.phone">{{ resumeData.personalInfo.phone }}</div>
                    <div v-if="resumeData?.personalInfo?.location">{{ resumeData.personalInfo.location }}</div>
                  </div>
                </div>
                
                <div class="letter-date">{{ currentDate }}</div>
              </div>

              <!-- Recipient Info -->
              <div class="recipient-info">
                <div v-if="coverLetterData.jobInfo?.hiringManager">{{ coverLetterData.jobInfo.hiringManager }}</div>
                <div v-if="coverLetterData.jobInfo?.department">{{ coverLetterData.jobInfo.department }}</div>
                <div v-if="coverLetterData.jobInfo?.company">{{ coverLetterData.jobInfo.company }}</div>
              </div>

              <!-- Letter Content -->
              <div class="letter-content">
                <!-- Opening -->
                <div v-if="coverLetterData.content?.opening" class="letter-paragraph">
                  <pre>{{ coverLetterData.content.opening }}</pre>
                </div>

                <!-- Body -->
                <div v-if="coverLetterData.content?.body" class="letter-paragraph">
                  <pre>{{ coverLetterData.content.body }}</pre>
                </div>

                <!-- Closing -->
                <div v-if="coverLetterData.content?.closing" class="letter-paragraph">
                  <pre>{{ coverLetterData.content.closing }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Text View -->
        <div v-else class="raw-preview">
          <div class="raw-content">
            <pre>{{ rawText }}</pre>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="preview-loading">
          <div class="loading-spinner"></div>
          <p>Generating preview...</p>
        </div>
      </div>

      <!-- Footer Stats -->
      <div class="modal-footer">
        <div class="preview-stats">
          <div class="stat-item">
            <strong>{{ wordCount }}</strong>
            <span>words</span>
          </div>
          <div class="stat-item">
            <strong>{{ characterCount }}</strong>
            <span>characters</span>
          </div>
          <div v-if="documentType === 'resume'" class="stat-item">
            <strong>{{ sectionCount }}</strong>
            <span>sections</span>
          </div>
        </div>
        
        <div class="footer-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="DocumentDuplicateIcon"
            @click="copyToClipboard"
          >
            Copy Text
          </UnifiedButton>
          
          <UnifiedButton
            variant="ghost"
            size="sm"
            @click="$emit('close')"
          >
            Close
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowDownTrayIcon, DocumentDuplicateIcon, EyeIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import { computed, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Props
const _props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  documentType: {
    type: String,
    required: true,
    validator: (value) => ['resume', 'cover-letter'].includes(value)
  },
  resumeData: {
    type: Object,
    default: () => ({})
  },
  coverLetterData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close', 'export'])

// State
const viewMode = ref('formatted')
const loading = ref(false)
const toast = useToast()

// Computed
const documentTitle = computed(() => {
  return props.documentType === 'resume' ? 'Resume Preview' : 'Cover Letter Preview'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const rawText = computed(() => {
  if (props.documentType === 'resume') {
    return generateResumeRawText()
  } else {
    return generateCoverLetterRawText()
  }
})

const wordCount = computed(() => {
  return rawText.value.trim().split(/\s+/).length
})

const characterCount = computed(() => {
  return rawText.value.length
})

const sectionCount = computed(() => {
  if (props.documentType !== 'resume') return 0
  
  let count = 0
  if (props.resumeData.summary) count++
  if (props.resumeData.experience?.length > 0) count++
  if (props.resumeData.education?.length > 0) count++
  if (props.resumeData.skills?.length > 0) count++
  if (props.resumeData.projects?.length > 0) count++
  
  return count
})

// Methods
const handleOverlayClick = () => {
  emit('close')
}

const handleExport = (format) => {
  emit('export', format)
}

const generateResumeRawText = () => {
  let text = []
  
  // Personal Info
  if (props.resumeData.personalInfo) {
    const info = props.resumeData.personalInfo
    if (info.name) text.push(info.name.toUpperCase())
    
    const contactInfo = [info.email, info.phone, info.location, info.linkedin, info.website]
      .filter(Boolean)
      .join(' | ')
    
    if (contactInfo) text.push(contactInfo)
    text.push('')
  }
  
  // Summary
  if (props.resumeData.summary) {
    text.push('PROFESSIONAL SUMMARY')
    text.push(props.resumeData.summary)
    text.push('')
  }
  
  // Experience
  if (props.resumeData.experience?.length > 0) {
    text.push('PROFESSIONAL EXPERIENCE')
    props.resumeData.experience.forEach(exp => {
      text.push(`${exp.title || '[Job Title]'} | ${exp.company || '[Company]'} | ${exp.startDate || 'Start'} - ${exp.endDate || 'End'}`)
      if (exp.description) text.push(exp.description)
      text.push('')
    })
  }
  
  // Education
  if (props.resumeData.education?.length > 0) {
    text.push('EDUCATION')
    props.resumeData.education.forEach(edu => {
      text.push(`${edu.degree || '[Degree]'} | ${edu.institution || '[Institution]'} | ${edu.year || '[Year]'}`)
      if (edu.gpa) text.push(`GPA: ${edu.gpa}`)
      text.push('')
    })
  }
  
  // Skills
  if (props.resumeData.skills?.length > 0) {
    text.push('SKILLS')
    text.push(props.resumeData.skills
      .filter(skill => skill && (skill.name || skill))
      .map(skill => skill.name || skill)
      .join(', '))
  }
  
  return text.join('\n')
}

const generateCoverLetterRawText = () => {
  let text = []
  
  // Header
  if (props.resumeData?.personalInfo) {
    const info = props.resumeData.personalInfo
    if (info.name) text.push(info.name)
    if (info.email) text.push(info.email)
    if (info.phone) text.push(info.phone)
    if (info.location) text.push(info.location)
    text.push('')
  }
  
  // Date
  text.push(currentDate.value)
  text.push('')
  
  // Recipient
  if (props.coverLetterData.jobInfo) {
    const job = props.coverLetterData.jobInfo
    if (job.hiringManager) text.push(job.hiringManager)
    if (job.department) text.push(job.department)
    if (job.company) text.push(job.company)
    text.push('')
  }
  
  // Content
  if (props.coverLetterData.content?.opening) {
    text.push(props.coverLetterData.content.opening)
    text.push('')
  }
  
  if (props.coverLetterData.content?.body) {
    text.push(props.coverLetterData.content.body)
    text.push('')
  }
  
  if (props.coverLetterData.content?.closing) {
    text.push(props.coverLetterData.content.closing)
  }
  
  return text.join('\n')
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rawText.value)
    toast.success('Text copied to clipboard')
  } catch (error) {
    toast.error('Failed to copy text')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 2rem;
}

.preview-modal {
  background: var(--surface-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass-xl);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-b: 1px solid var(--glass-border);
}

.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.document-preview {
  max-width: 100%;
  margin: 0 auto;
}

.document-page {
  background: white;
  color: var(--text-primary-600);
  padding: 2rem;
  box-shadow: var(--shadow-glass);
  border-radius: var(--radius-md);
  font-family: 'Times New Roman', serif;
  line-height: 1.6;
  min-height: 800px;
}

.doc-header {
  margin-bottom: 2rem;
  text-align: center;
}

.doc-name {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-primary-600);
}

.contact-info {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.contact-info span:not(:last-child)::after {
  content: ' | ';
  margin-left: 1rem;
}

.doc-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-primary-600);
  border-b: 2px solid #3498db;
  padding-bottom: 0.25rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.summary-text {
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: justify;
}

.experience-item,
.education-item {
  margin-bottom: 1.25rem;
}

.exp-header,
.edu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.exp-title,
.edu-degree {
  font-weight: bold;
  font-size: 1rem;
  color: var(--text-primary-600);
}

.exp-meta,
.edu-meta {
  text-align: right;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.company {
  font-style: italic;
}

.dates,
.year {
  display: block;
  font-size: 0.85rem;
}

.exp-description {
  font-size: 0.9rem;
  line-height: 1.5;
}

.exp-description pre {
  font-family: inherit;
  white-space: pre-wrap;
  margin: 0;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-item {
  padding: 0.25rem 0.75rem;
  background: #ecf0f1;
  color: #2c3e50;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Cover Letter Specific Styles */
.cover-letter-preview .doc-header {
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sender-info .sender-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.sender-contact {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.letter-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.recipient-info {
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #666;
}

.letter-content {
  line-height: 1.8;
}

.letter-paragraph {
  margin-bottom: 1.5rem;
}

.letter-paragraph pre {
  font-family: inherit;
  white-space: pre-wrap;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.8;
}

/* Raw View */
.raw-preview {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.raw-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary-600);
}

.raw-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-t: 1px solid var(--glass-border);
  background: var(--glass-surface);
}

.preview-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  font-size: 1.1rem;
  color: var(--color-primary-500);
}

.stat-item span {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
}

/* Loading State */
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--glass-border);
  border-t: 2px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }
  
  .preview-modal {
    max-height: 95vh;
  }
  
  .document-page {
    padding: 1rem;
  }
  
  .modal-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .preview-stats {
    justify-content: space-around;
  }
  
  .exp-header,
  .edu-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .exp-meta,
  .edu-meta {
    text-align: left;
    margin-top: 0.25rem;
  }
  
  .cover-letter-preview .doc-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
