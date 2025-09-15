<template>
  <div class="document-preview">
    <div v-if="isLoading" class="preview-loading">
      <div class="loading-spinner">
        <AppIcon name="mdi-loading" size="32" class="spinning" />
      </div>
      <p>Generating preview...</p>
    </div>
    
    <div v-else-if="previewError" class="preview-error">
      <AppIcon name="mdi-alert-circle-outline" size="48" />
      <h4>Preview Error</h4>
      <p>{{ previewError }}</p>
      <UnifiedButton
        variant="outline"
        size="sm"
        @click="refreshPreview"
      >
        Try Again
      </UnifiedButton>
    </div>

    <div v-else class="preview-container">
      <!-- Resume Preview -->
      <div v-if="documentType === 'resume'" class="resume-preview" :class="`template-${template}`">
        <div class="resume-header">
          <div class="personal-info">
            <h1 class="name">{{ resolvedData.personal?.firstName }} {{ resolvedData.personal?.lastName }}</h1>
            <div class="contact-details">
              <div v-if="resolvedData.personal?.email" class="contact-item">
                <AppIcon name="mdi-email" size="14" />
                <span>{{ resolvedData.personal.email }}</span>
              </div>
              <div v-if="resolvedData.personal?.phone" class="contact-item">
                <AppIcon name="mdi-phone" size="14" />
                <span>{{ resolvedData.personal.phone }}</span>
              </div>
              <div v-if="resolvedData.personal?.location" class="contact-item">
                <AppIcon name="mdi-map-marker" size="14" />
                <span>{{ resolvedData.personal.location }}</span>
              </div>
            </div>
            <div class="online-presence">
              <div v-if="resolvedData.personal?.website" class="contact-item">
                <AppIcon name="mdi-web" size="14" />
                <span>{{ resolvedData.personal.website }}</span>
              </div>
              <div v-if="resolvedData.personal?.linkedin" class="contact-item">
                <AppIcon name="mdi-linkedin" size="14" />
                <span>{{ resolvedData.personal.linkedin }}</span>
              </div>
              <div v-if="resolvedData.personal?.github" class="contact-item">
                <AppIcon name="mdi-github" size="14" />
                <span>{{ resolvedData.personal.github }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Summary -->
        <div v-if="resolvedData.personal?.summary" class="resume-section">
          <h2 class="section-title">Professional Summary</h2>
          <div class="section-content">
            <p class="summary-text">{{ resolvedData.personal.summary }}</p>
          </div>
        </div>

        <!-- Experience Section -->
        <div v-if="resolvedData.experience?.length" class="resume-section">
          <h2 class="section-title">Professional Experience</h2>
          <div class="section-content">
            <div v-for="exp in resolvedData.experience" :key="exp.title + exp.company" class="experience-item">
              <div class="experience-header">
                <div class="position-info">
                  <h3 class="position-title">{{ exp.title }}</h3>
                  <div class="company-name">{{ exp.company }}</div>
                </div>
                <div class="date-location">
                  <div class="employment-dates">
                    {{ formatDate(exp.startDate) }} - {{ exp.current ? 'Present' : formatDate(exp.endDate) }}
                  </div>
                  <div v-if="exp.location" class="location">{{ exp.location }}</div>
                </div>
              </div>
              <div v-if="exp.description" class="experience-description">
                <div v-html="formatDescription(exp.description)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Education Section -->
        <div v-if="resolvedData.education?.length" class="resume-section">
          <h2 class="section-title">Education</h2>
          <div class="section-content">
            <div v-for="edu in resolvedData.education" :key="edu.degree + edu.school" class="education-item">
              <div class="education-header">
                <div class="degree-info">
                  <h3 class="degree-title">{{ edu.degree }}</h3>
                  <div class="school-name">{{ edu.school }}</div>
                </div>
                <div class="date-location">
                  <div class="education-dates">
                    {{ formatDate(edu.startDate) }} - {{ formatDate(edu.endDate) }}
                  </div>
                  <div v-if="edu.location" class="location">{{ edu.location }}</div>
                </div>
              </div>
              <div v-if="edu.gpa" class="gpa">GPA: {{ edu.gpa }}</div>
            </div>
          </div>
        </div>

        <!-- Skills Section -->
        <div v-if="resolvedData.skills?.length" class="resume-section">
          <h2 class="section-title">Technical Skills</h2>
          <div class="section-content">
            <div class="skills-grid">
              <span v-for="skill in resolvedData.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cover Letter Preview -->
      <div v-else-if="documentType === 'cover-letter'" class="cover-letter-preview" :class="`template-${template}`">
        <div class="letter-header">
          <div class="sender-info">
            <div class="sender-name">{{ documentData.personalInfo?.name || 'Your Name' }}</div>
            <div class="sender-contact">
              {{ documentData.personalInfo?.email || 'your.email@example.com' }} |
              {{ documentData.personalInfo?.phone || '(555) 123-4567' }}
            </div>
            <div class="sender-location">{{ documentData.personalInfo?.location || 'City, State' }}</div>
          </div>
          <div class="letter-date">{{ formatDate(new Date().toISOString()) }}</div>
        </div>

        <div v-if="documentData.jobInfo?.company" class="recipient-info">
          <div class="recipient-name">{{ documentData.jobInfo.hiringManager || 'Hiring Manager' }}</div>
          <div class="company-name">{{ documentData.jobInfo.company }}</div>
          <div class="position-title">{{ documentData.jobInfo.position }} Position</div>
        </div>

        <div class="letter-body">
          <div v-if="documentData.content?.opening" class="letter-section">
            <p>{{ resolveTokens(documentData.content.opening) }}</p>
          </div>
          
          <div v-if="documentData.content?.body" class="letter-section">
            <div v-html="formatDescription(resolveTokens(documentData.content.body))"></div>
          </div>
          
          <div v-if="documentData.content?.closing" class="letter-section">
            <p>{{ resolveTokens(documentData.content.closing) }}</p>
          </div>
        </div>

        <div class="letter-signature">
          <p>Sincerely,</p>
          <div class="signature-line">{{ documentData.personalInfo?.name || 'Your Name' }}</div>
        </div>
      </div>
    </div>

    <!-- Preview Controls -->
    <div v-if="!isLoading && !previewError" class="preview-controls">
      <div class="zoom-controls">
        <UnifiedButton
          variant="ghost"
          size="xs"
          leading-icon="mdi-minus"
          :disabled="zoomLevel <= 0.5"
          @click="zoomOut"
        />
        <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        <UnifiedButton
          variant="ghost"
          size="xs"
          leading-icon="mdi-plus"
          :disabled="zoomLevel >= 2"
          @click="zoomIn"
        />
      </div>
      
      <div class="preview-actions">
        <UnifiedButton
          variant="ghost"
          size="xs"
          leading-icon="mdi-fullscreen"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? 'Exit' : 'Fullscreen' }}
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps<{
  documentData: any
  documentType: 'resume' | 'cover-letter'
  template: string
  showTokens: boolean
}>()

// State
const isLoading = ref(true)
const previewError = ref('')
const zoomLevel = ref(1)
const isFullscreen = ref(false)

// Token mapping
const tokenMap = computed(() => ({
  '{{name}}': props.documentData.personalInfo?.name || 'Your Name',
  '{{firstName}}': props.documentData.personalInfo?.name?.split(' ')[0] || 'Your',
  '{{lastName}}': props.documentData.personalInfo?.name?.split(' ').slice(1).join(' ') || 'Name',
  '{{email}}': props.documentData.personalInfo?.email || 'your.email@example.com',
  '{{phone}}': props.documentData.personalInfo?.phone || '(555) 123-4567',
  '{{location}}': props.documentData.personalInfo?.location || 'City, State',
  '{{website}}': props.documentData.personalInfo?.website || '',
  '{{linkedin}}': props.documentData.personalInfo?.linkedin || '',
  '{{github}}': props.documentData.personalInfo?.github || '',
  '{{company}}': props.documentData.jobInfo?.company || 'Company Name',
  '{{position}}': props.documentData.jobInfo?.position || 'Position Title'
}))

// Resolved data for resume
const resolvedData = computed(() => {
  if (props.documentType === 'resume') {
    return {
      personal: {
        firstName: tokenMap.value['{{firstName}}'],
        lastName: tokenMap.value['{{lastName}}'],
        email: tokenMap.value['{{email}}'],
        phone: tokenMap.value['{{phone}}'],
        location: tokenMap.value['{{location}}'],
        website: tokenMap.value['{{website}}'],
        linkedin: tokenMap.value['{{linkedin}}'],
        github: tokenMap.value['{{github}}'],
        summary: resolveTokens(props.documentData.summary || '')
      },
      experience: (props.documentData.experience || []).map((exp: any) => ({
        ...exp,
        description: resolveTokens(exp.description || '')
      })),
      education: props.documentData.education || [],
      skills: (props.documentData.skills || []).map((skill: any) => 
        typeof skill === 'string' ? skill : skill.name
      )
    }
  }
  return props.documentData
})

// Methods
const resolveTokens = (text: string): string => {
  if (!text || !props.showTokens) return text
  
  let resolved = text
  Object.entries(tokenMap.value).forEach(([token, value]) => {
    if (value) {
      resolved = resolved.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), value)
    }
  })
  return resolved
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  } catch {
    return dateString
  }
}

const formatDescription = (text: string): string => {
  if (!text) return ''
  
  // Convert bullet points and line breaks to HTML
  return text
    .replace(/\n/g, '<br>')
    .replace(/• /g, '<li>')
    .replace(/\* /g, '<li>')
    .replace(/<li>/g, '</li><li>')
    .replace('</li><li>', '<ul><li>')
    .replace(/(<li>.*)<br>/g, '$1</li>')
    .replace(/<ul><li><\/li>/, '<ul>')
    .replace(/<li>$/, '</li></ul>')
}

const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.25)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.25)
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const refreshPreview = () => {
  generatePreview()
}

const generatePreview = async () => {
  isLoading.value = true
  previewError.value = ''
  
  try {
    // Simulate preview generation delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Validate data
    if (props.documentType === 'resume') {
      if (!props.documentData.personalInfo?.name && !props.documentData.summary && !props.documentData.experience?.length) {
        throw new Error('No content to preview. Please add some information first.')
      }
    } else if (props.documentType === 'cover-letter') {
      if (!props.documentData.content?.opening && !props.documentData.content?.body) {
        throw new Error('No cover letter content to preview.')
      }
    }
    
  } catch (error: any) {
    previewError.value = error.message
  } finally {
    isLoading.value = false
  }
}

// Watch for data changes
watch([() => props.documentData, () => props.template], () => {
  generatePreview()
}, { deep: true })

// Initialize
onMounted(() => {
  generatePreview()
})
</script>

<style scoped>
.document-preview {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-loading,
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-8);
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  margin-bottom: var(--spacing-4);
}

.spinning {
  animation: spin 1s linear infinite;
}

.preview-error {
  color: var(--color-error-600);
}

.preview-error h4 {
  color: var(--text-primary);
  margin: var(--spacing-3) 0 var(--spacing-2);
}

.preview-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
  background: white;
  transform-origin: top left;
  transition: transform var(--duration-normal);
}

/* Resume Preview Styles */
.resume-preview {
  max-width: 8.5in;
  margin: 0 auto;
  background: white;
  color: #333;
  font-family: 'Arial', sans-serif;
  line-height: 1.4;
  font-size: 11px;
}

.resume-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.personal-info .name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.contact-details,
.online-presence {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 5px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.resume-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  text-transform: uppercase;
  margin: 0 0 10px 0;
  border-bottom: 1px solid #ddd;
  padding-bottom: 2px;
}

.section-content {
  margin-left: 10px;
}

.summary-text {
  margin: 0;
  text-align: justify;
}

.experience-item,
.education-item {
  margin-bottom: 15px;
}

.experience-header,
.education-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.position-title,
.degree-title {
  font-size: 12px;
  font-weight: bold;
  margin: 0 0 2px 0;
}

.company-name,
.school-name {
  font-style: italic;
  font-size: 11px;
}

.date-location {
  text-align: right;
  font-size: 10px;
  color: #666;
}

.employment-dates,
.education-dates {
  font-weight: bold;
}

.location {
  margin-top: 2px;
}

.experience-description {
  margin-top: 5px;
  font-size: 10px;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 9px;
  border: 1px solid #ddd;
}

/* Cover Letter Preview Styles */
.cover-letter-preview {
  max-width: 8.5in;
  margin: 0 auto;
  background: white;
  color: #333;
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  font-size: 12px;
}

.letter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.sender-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sender-name {
  font-size: 16px;
  font-weight: bold;
}

.sender-contact,
.sender-location {
  font-size: 11px;
  color: #666;
}

.letter-date {
  font-size: 11px;
  color: #666;
}

.recipient-info {
  margin-bottom: 30px;
}

.recipient-name {
  font-weight: bold;
}

.company-name {
  font-weight: bold;
}

.letter-body {
  margin-bottom: 30px;
}

.letter-section {
  margin-bottom: 15px;
}

.letter-section p {
  margin: 0 0 10px 0;
  text-align: justify;
}

.letter-signature {
  margin-top: 30px;
}

.letter-signature p {
  margin: 0 0 30px 0;
}

.signature-line {
  font-weight: bold;
  border-bottom: 1px solid #333;
  display: inline-block;
  min-width: 200px;
  padding-bottom: 2px;
}

/* Template Variations */
.template-modern .resume-header {
  border-bottom: 3px solid #007acc;
}

.template-modern .section-title {
  color: #007acc;
  border-bottom: 2px solid #007acc;
}

.template-creative .resume-header {
  border-bottom: 3px solid #e91e63;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 15px;
  border-radius: 5px;
}

.template-creative .section-title {
  color: #e91e63;
}

.template-gaming-pro .resume-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  border-bottom: none;
}

.template-gaming-pro .name {
  color: white;
}

.template-gaming-pro .section-title {
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

/* Preview Controls */
.preview-controls {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background: var(--glass-surface);
  border-top: 1px solid var(--glass-border);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.zoom-level {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

.preview-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Fullscreen Mode */
.document-preview.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: var(--surface-base);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .resume-preview,
  .cover-letter-preview {
    font-size: 10px;
    padding: var(--spacing-2);
  }
  
  .experience-header,
  .education-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
  
  .date-location {
    text-align: left;
  }
  
  .letter-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }
}

/* Print Styles */
@media print {
  .preview-controls {
    display: none;
  }
  
  .preview-container {
    overflow: visible;
    padding: 0;
  }
  
  .resume-preview,
  .cover-letter-preview {
    max-width: none;
    margin: 0;
    font-size: 12px;
  }
}
</style>