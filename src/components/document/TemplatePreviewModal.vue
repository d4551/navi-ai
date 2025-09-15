<template>
  <div v-if="show" class="modal-overlay" class="font-sans" @click="handleOverlayClick">
    <div class="preview-modal">
      <div class="modal-header">
        <div class="header-content">
          <AppIcon name="EyeIcon" size="20" />
          <h3 class="modal-title">Template Preview</h3>
          <div class="template-info">
            <span class="template-name">{{ template?.name }}</span>
          </div>
        </div>
        <UnifiedButton
          variant="ghost"
          size="sm"
          leading-icon="XMarkIcon"
          @click="$emit('close')"
        />
      </div>

      <div class="modal-content">
        <div class="preview-container">
          <div class="preview-document" :class="`template-${template?.id}`">
            <div class="document-preview">
              <div class="preview-header">
                <h1 class="preview-name">John Doe</h1>
                <div class="preview-contact">
                  john.doe@email.com | (555) 123-4567 | City, State
                </div>
              </div>
              
              <div class="preview-section">
                <h2 class="section-title">Professional Summary</h2>
                <p class="preview-text">
                  Dynamic software engineer with 5+ years of experience developing scalable web applications.
                  Proven track record of delivering high-quality solutions using modern technologies.
                </p>
              </div>
              
              <div class="preview-section">
                <h2 class="section-title">Experience</h2>
                <div class="preview-experience">
                  <div class="experience-header">
                    <strong>Senior Software Engineer</strong>
                    <span class="experience-dates">2020 - Present</span>
                  </div>
                  <div class="experience-company">Tech Company Inc.</div>
                  <ul class="experience-bullets">
                    <li>Developed and maintained web applications using React and Node.js</li>
                    <li>Led team of 3 developers on critical product features</li>
                  </ul>
                </div>
              </div>
              
              <div class="preview-section">
                <h2 class="section-title">Skills</h2>
                <div class="preview-skills">
                  <span class="skill-tag">JavaScript</span>
                  <span class="skill-tag">React</span>
                  <span class="skill-tag">Node.js</span>
                  <span class="skill-tag">TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-info">
          <div class="template-meta">
            <span class="meta-item">
              <AppIcon name="StarIcon" size="14" />
              {{ template?.rating || 5 }}/5
            </span>
            <span class="meta-item">
              <AppIcon name="ArrowDownTrayIcon" size="14" />
              {{ template?.downloads || '1.2k' }} downloads
            </span>
          </div>
        </div>
        <div class="footer-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            @click="$emit('close')"
          >
            Cancel
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="sm"
            @click="selectTemplate"
          >
            Use This Template
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, EyeIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps<{
  show: boolean
  template: any
  documentType: 'resume' | 'cover-letter'
}>()

// Emits
const emit = defineEmits<{
  'close': []
  'select': [string]
}>()

// Methods
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const selectTemplate = () => {
  emit('select', props.template?.id || 'default')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.preview-modal {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-5);
  border-b: 1px solid var(--glass-border);
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--surface-base) 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

.template-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.template-name {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-6);
  display: flex;
  justify-content: center;
}

.preview-container {
  max-width: 600px;
  width: 100%;
}

.preview-document {
  background: white;
  box-shadow: var(--shadow-glass-lg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.document-preview {
  padding: var(--spacing-8);
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
}

.preview-header {
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-b: 2px solid #333;
}

.preview-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 var(--spacing-2) 0;
  color: #333;
}

.preview-contact {
  font-size: 11px;
  color: #666;
}

.preview-section {
  margin-bottom: var(--spacing-5);
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 var(--spacing-3) 0;
  text-transform: uppercase;
  border-b: 1px solid #ddd;
  padding-bottom: var(--spacing-1);
}

.preview-text {
  margin: 0;
  font-size: 11px;
  text-align: justify;
}

.preview-experience {
  margin-bottom: var(--spacing-4);
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-1);
}

.experience-dates {
  font-size: 10px;
  color: #666;
}

.experience-company {
  font-style: italic;
  font-size: 11px;
  margin-bottom: var(--spacing-2);
}

.experience-bullets {
  margin: 0;
  padding-left: 16px;
  font-size: 10px;
}

.experience-bullets li {
  margin-bottom: 2px;
}

.preview-skills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1-5);
}

.skill-tag {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 9px;
  border: 1px solid #ddd;
}

/* Template-specific styles */
.template-gaming-pro .preview-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  border-b: none;
  margin-bottom: var(--spacing-6);
}

.template-gaming-pro .preview-name {
  color: white;
}

.template-gaming-pro .preview-contact {
  color: rgba(255, 255, 255, 0.9);
}

.template-gaming-pro .section-title {
  color: #667eea;
  border-b: 2px solid #667eea;
}

.template-creative-showcase .preview-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  color: white;
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  border-b: none;
}

.template-creative-showcase .preview-name {
  color: white;
}

.template-creative-showcase .section-title {
  color: #ff6b6b;
}

.template-tech-minimal .section-title {
  color: #2d3748;
  font-weight: 600;
}

.template-executive-classic .section-title {
  color: #2d3748;
  letter-spacing: 1px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  border-t: 1px solid var(--glass-border);
  background: var(--surface-base);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.template-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-2);
  }
  
  .preview-modal {
    max-height: 95vh;
  }
  
  .document-preview {
    padding: var(--spacing-4);
  }
  
  .modal-footer {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: space-between;
  }
}
</style>