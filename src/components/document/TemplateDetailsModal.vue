<template>
  <div v-if="show" class="modal-overlay" class="font-sans" @click="handleOverlayClick">
    <div class="details-modal">
      <div class="modal-header">
        <div class="header-content">
          <AppIcon name="InformationCircleIcon" size="20" />
          <h3 class="modal-title">Template Details</h3>
        </div>
        <UnifiedButton
          variant="ghost"
          size="sm"
          leading-icon="XMarkIcon"
          @click="$emit('close')"
        />
      </div>

      <div class="modal-content">
        <div class="template-overview">
          <div class="template-preview-thumb">
            <div class="thumb-image" :class="`preview-${template?.id}`"></div>
          </div>
          
          <div class="template-info">
            <h2 class="template-title">{{ template?.name }}</h2>
            <p class="template-description">{{ template?.description }}</p>
            
            <div class="template-stats">
              <div class="stat-item">
                <div class="stat-label">Rating</div>
                <div class="stat-value">
                  <div class="rating-display">
                    <AppIcon
                      v-for="star in 5"
                      :key="star"
                      name="StarIcon"
                      :class="star <= (template?.rating || 5) ? 'filled' : 'empty'"
                      size="14"
                    />
                  </div>
                  <span class="rating-text">{{ template?.rating || 5 }}/5 ({{ template?.reviewCount || 0 }} reviews)</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-label">Downloads</div>
                <div class="stat-value">{{ template?.downloads || '1.2k' }}</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-label">Setup Time</div>
                <div class="stat-value">{{ template?.estimatedTime || '15 min' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="template-features">
          <h4 class="features-title">Features & Benefits</h4>
          <div class="features-grid">
            <div v-for="feature in templateFeatures" :key="feature.id" class="feature-item">
              <AppIcon :name="feature.icon" size="20" />
              <div class="feature-content">
                <div class="feature-name">{{ feature.name }}</div>
                <div class="feature-description">{{ feature.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="template-specifications">
          <h4 class="specs-title">Specifications</h4>
          <div class="specs-grid">
            <div class="spec-item">
              <div class="spec-label">Industry Focus</div>
              <div class="spec-value">{{ template?.industry || 'General' }}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Experience Level</div>
              <div class="spec-value">{{ template?.level || 'All levels' }}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Style</div>
              <div class="spec-value">{{ template?.style || 'Modern' }}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">ATS Compatibility</div>
              <div class="spec-value">
                <AppIcon name="CheckCircleIcon" class="ats-check" />
                Optimized
              </div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Export Formats</div>
              <div class="spec-value">PDF, DOCX, HTML</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Customization</div>
              <div class="spec-value">High flexibility</div>
            </div>
          </div>
        </div>

        <div class="template-samples">
          <h4 class="samples-title">Sample Content</h4>
          <div class="samples-tabs">
            <button
              v-for="sample in sampleContent"
              :key="sample.type"
              class="sample-tab"
              :class="{ active: activeSample === sample.type }"
              @click="activeSample = sample.type"
            >
              {{ sample.label }}
            </button>
          </div>
          <div class="sample-content">
            <div v-for="sample in sampleContent" v-show="activeSample === sample.type" :key="sample.type" class="sample-section">
              <h5 class="sample-section-title">{{ sample.label }}</h5>
              <div class="sample-text">{{ sample.content }}</div>
            </div>
          </div>
        </div>

        <div v-if="template?.isPremium" class="premium-info">
          <div class="premium-banner">
            <AppIcon name="mdi-crown" size="20" />
            <div class="premium-content">
              <h5 class="premium-title">Premium Template</h5>
              <p class="premium-description">
                This template includes premium features and enhanced customization options.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-info">
          <div class="template-tags">
            <span class="template-tag">{{ template?.industry }}</span>
            <span class="template-tag">{{ template?.level }}</span>
            <span class="template-tag">{{ template?.style }}</span>
          </div>
        </div>
        <div class="footer-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="EyeIcon"
            @click="previewTemplate"
          >
            Preview
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="sm"
            leading-icon="CheckIcon"
            @click="selectTemplate"
          >
            Use Template
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, EyeIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, StarIcon } from '@heroicons/vue/24/solid'

import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps<{
  show: boolean
  template: any
}>()

// Emits
const emit = defineEmits<{
  'close': []
  'select': [string]
}>()

// State
const activeSample = ref('summary')

// Template features data
const templateFeatures = [
  {
    id: 'ats',
    name: 'ATS Optimized',
    description: 'Designed to pass through applicant tracking systems',
    icon: 'CursorArrowRaysIcon'
  },
  {
    id: 'responsive',
    name: 'Responsive Design',
    description: 'Looks great on all devices and screen sizes',
    icon: 'mdi-responsive'
  },
  {
    id: 'customizable',
    name: 'Highly Customizable',
    description: 'Easy to modify colors, fonts, and layout',
    icon: 'SwatchIcon'
  },
  {
    id: 'professional',
    name: 'Professional Layout',
    description: 'Clean, modern design that impresses recruiters',
    icon: 'TrophyIcon'
  }
]

// Sample content
const sampleContent = [
  {
    type: 'summary',
    label: 'Professional Summary',
    content: 'Dynamic software engineer with 5+ years of experience developing scalable web applications and leading cross-functional teams. Proven track record of delivering high-quality solutions that drive business value and improve user experience.'
  },
  {
    type: 'experience',
    label: 'Work Experience',
    content: 'Senior Software Engineer at Tech Company Inc. (2020 - Present)\n• Led development of microservices architecture serving 1M+ users\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Mentored team of 4 junior developers on best practices'
  },
  {
    type: 'skills',
    label: 'Technical Skills',
    content: 'Programming: JavaScript, TypeScript, Python, Java\nFrameworks: React, Node.js, Express, Django\nDatabases: PostgreSQL, MongoDB, Redis\nCloud: AWS, Docker, Kubernetes\nTools: Git, Jenkins, JIRA, Figma'
  }
]

// Methods
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const selectTemplate = () => {
  emit('select', props.template?.id || 'default')
}

const previewTemplate = () => {
  // This would open the preview modal
  console.log('Preview template:', props.template?.id)
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

.details-modal {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 800px;
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

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.template-overview {
  display: flex;
  gap: var(--spacing-5);
  align-items: flex-start;
}

.template-preview-thumb {
  width: 150px;
  height: 200px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-glass);
  flex-shrink: 0;
}

.thumb-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface-tertiary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

/* Template-specific thumb styles */
.preview-gaming-pro {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.preview-creative-showcase {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.preview-tech-minimal {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

.preview-executive-classic {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.template-info {
  flex: 1;
}

.template-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-3) 0;
}

.template-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-4);
}

.template-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.stat-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.rating-display {
  display: flex;
  gap: var(--spacing-0-5);
}

.rating-display .filled {
  color: var(--color-warning-500);
}

.rating-display .empty {
  color: var(--surface-tertiary);
}

.rating-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.template-features {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.features-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-4) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.feature-item {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-start;
}

.feature-content {
  flex: 1;
}

.feature-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.feature-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.template-specifications {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.specs-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-4) 0;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-3);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.spec-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spec-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.ats-check {
  color: var(--color-success-500);
}

.template-samples {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.samples-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-4) 0;
}

.samples-tabs {
  display: flex;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
}

.sample-tab {
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: var(--font-size-sm);
}

.sample-tab:hover {
  background: var(--glass-hover-bg);
}

.sample-tab.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.sample-content {
  min-height: 120px;
}

.sample-section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-2) 0;
}

.sample-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-line;
  background: var(--glass-surface);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.premium-info {
  background: linear-gradient(135deg, var(--color-gaming-50) 0%, var(--color-primary-50) 100%);
  border: 1px solid var(--color-gaming-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.premium-banner {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-start;
}

.premium-content {
  flex: 1;
}

.premium-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gaming-700);
  margin: 0 0 var(--spacing-2) 0;
}

.premium-description {
  font-size: var(--font-size-sm);
  color: var(--color-gaming-600);
  margin: 0;
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

.template-tags {
  display: flex;
  gap: var(--spacing-2);
}

.template-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
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
  
  .details-modal {
    max-height: 95vh;
  }
  
  .template-overview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .template-preview-thumb {
    width: 120px;
    height: 160px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .specs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .samples-tabs {
    flex-wrap: wrap;
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