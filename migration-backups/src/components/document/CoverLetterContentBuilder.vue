<template>
  <div class="document-content-builder">
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step-progress">
        <div
          v-for="(step, index) in coverLetterSteps"
          :key="step.id"
          class="step-item"
          :class="{
            active: currentStep === step.id,
            completed: currentStep > step.id,
          }"
          @click="$emit('step-change', step.id)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
    </div>

    <!-- Content Editor -->
    <div class="content-editor">
      <!-- Contact Info Step -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-account-outline" class="me-2" />
            Contact Information
          </h3>
          <p class="section-description">
            Your contact details for the cover letter header
          </p>
        </div>

        <div class="form-grid contact-info-grid">
          <div class="form-field required">
            <label class="field-label">Full Name</label>
            <input
              v-model="localData.contactInfo.name"
              type="text"
              class="field-input"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-field required">
            <label class="field-label">Email Address</label>
            <input
              v-model="localData.contactInfo.email"
              type="email"
              class="field-input"
              placeholder="your.email@example.com"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Phone Number</label>
            <input
              v-model="localData.contactInfo.phone"
              type="tel"
              class="field-input"
              placeholder="(555) 123-4567"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Address</label>
            <input
              v-model="localData.contactInfo.address"
              type="text"
              class="field-input"
              placeholder="Street, City, State, ZIP"
            />
          </div>

          <div class="form-field">
            <label class="field-label">LinkedIn Profile</label>
            <input
              v-model="localData.contactInfo.linkedin"
              type="url"
              class="field-input"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Website/Portfolio</label>
            <input
              v-model="localData.contactInfo.website"
              type="url"
              class="field-input"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div class="step-actions">
          <UnifiedButton
            variant="outline"
            :disabled="currentStep <= 1"
            @click="$emit('step-change', currentStep - 1)"
          >
            Previous
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            @click="$emit('step-change', currentStep + 1)"
          >
            Next: Company Info
          </UnifiedButton>
        </div>
      </div>

      <!-- Company Info Step -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-office-building-outline" class="me-2" />
            Company Information
          </h3>
          <p class="section-description">
            Details about the company and position you're applying for
          </p>
        </div>

        <div class="form-grid company-info-grid">
          <div class="form-field required">
            <label class="field-label">Company Name</label>
            <input
              v-model="localData.companyInfo.companyName"
              type="text"
              class="field-input"
              placeholder="Enter company name"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Hiring Manager</label>
            <input
              v-model="localData.companyInfo.hiringManager"
              type="text"
              class="field-input"
              placeholder="Hiring Manager's name (if known)"
            />
          </div>

          <div class="form-field required">
            <label class="field-label">Job Title</label>
            <input
              v-model="localData.companyInfo.jobTitle"
              type="text"
              class="field-input"
              placeholder="Position you're applying for"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Company Address</label>
            <input
              v-model="localData.companyInfo.companyAddress"
              type="text"
              class="field-input"
              placeholder="Company address"
            />
          </div>

          <div class="form-field">
            <label class="field-label">How did you find this position?</label>
            <select v-model="localData.companyInfo.source" class="field-input">
              <option value="">Select source</option>
              <option value="company-website">Company Website</option>
              <option value="job-board">Job Board</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="recruiter">Recruiter</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div class="step-actions">
          <UnifiedButton
            variant="outline"
            @click="$emit('step-change', currentStep - 1)"
          >
            Previous
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            @click="$emit('step-change', currentStep + 1)"
          >
            Next: Introduction
          </UnifiedButton>
        </div>
      </div>

      <!-- Introduction Step -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-card-text-outline" class="me-2" />
            Introduction Paragraph
          </h3>
          <p class="section-description">
            Hook the reader with a strong opening that explains why you're
            interested
          </p>
        </div>

        <div class="form-field">
          <label class="field-label">Introduction</label>
          <textarea
            v-model="localData.introduction"
            class="field-textarea"
            rows="8"
            placeholder="Start with a compelling hook that shows your enthusiasm for the role and company. Mention how you found the position and briefly state why you're a great fit..."
          ></textarea>
          <div class="field-help">
            <small class="text-muted"
              >{{ localData.introduction.length }}/400 characters</small
            >
            <UnifiedButton
              v-if="aiEnabled"
              variant="ghost"
              size="sm"
              leading-icon="mdi-auto-fix"
              @click="$emit('ai-request', { type: 'generate-introduction' })"
            >
              AI Generate
            </UnifiedButton>
          </div>
        </div>

        <div class="step-actions">
          <UnifiedButton
            variant="outline"
            @click="$emit('step-change', currentStep - 1)"
          >
            Previous
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            @click="$emit('step-change', currentStep + 1)"
          >
            Next: Body
          </UnifiedButton>
        </div>
      </div>

      <!-- Body Step -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-text-box-outline" class="me-2" />
            Body Paragraphs
          </h3>
          <p class="section-description">
            Explain your qualifications and why you're the perfect candidate
          </p>
        </div>

        <div class="body-paragraphs">
          <div class="form-field">
            <label class="field-label"
              >Body Paragraph 1 - Your Experience</label
            >
            <textarea
              v-model="localData.bodyParagraph1"
              class="field-textarea"
              rows="6"
              placeholder="Discuss your relevant experience and achievements that match the job requirements..."
            ></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">Body Paragraph 2 - Your Skills</label>
            <textarea
              v-model="localData.bodyParagraph2"
              class="field-textarea"
              rows="6"
              placeholder="Highlight specific skills and how they apply to this role..."
            ></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">Body Paragraph 3 - Company Fit</label>
            <textarea
              v-model="localData.bodyParagraph3"
              class="field-textarea"
              rows="6"
              placeholder="Explain why you want to work for this company and what you can contribute..."
            ></textarea>
          </div>
        </div>

        <div v-if="aiEnabled" class="ai-suggestions">
          <UnifiedButton
            variant="ghost"
            leading-icon="mdi-lightbulb"
            @click="$emit('ai-request', { type: 'generate-body' })"
          >
            Generate Body Paragraphs with AI
          </UnifiedButton>
        </div>

        <div class="step-actions">
          <UnifiedButton
            variant="outline"
            @click="$emit('step-change', currentStep - 1)"
          >
            Previous
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            @click="$emit('step-change', currentStep + 1)"
          >
            Next: Conclusion
          </UnifiedButton>
        </div>
      </div>

      <!-- Conclusion Step -->
      <div v-if="currentStep === 5" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-check-circle-outline" class="me-2" />
            Conclusion & Call to Action
          </h3>
          <p class="section-description">
            End with a strong closing that reiterates your interest and next
            steps
          </p>
        </div>

        <div class="form-field">
          <label class="field-label">Conclusion</label>
          <textarea
            v-model="localData.conclusion"
            class="field-textarea"
            rows="6"
            placeholder="Reiterate your enthusiasm, mention next steps, and provide a professional closing..."
          ></textarea>
          <div class="field-help">
            <small class="text-muted"
              >{{ localData.conclusion.length }}/300 characters</small
            >
            <UnifiedButton
              v-if="aiEnabled"
              variant="ghost"
              size="sm"
              leading-icon="mdi-auto-fix"
              @click="$emit('ai-request', { type: 'generate-conclusion' })"
            >
              AI Generate
            </UnifiedButton>
          </div>
        </div>

        <div class="step-actions">
          <UnifiedButton
            variant="outline"
            @click="$emit('step-change', currentStep - 1)"
          >
            Previous
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            @click="$emit('step-change', currentStep + 1)"
          >
            Next: Review
          </UnifiedButton>
        </div>
      </div>

      <!-- Review Step -->
      <div v-if="currentStep === 6" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-eye-outline" class="me-2" />
            Review & Finalize
          </h3>
          <p class="section-description">
            Review your cover letter and make final adjustments
          </p>
        </div>

        <div class="review-content">
          <div class="review-section">
            <h4>Contact Information</h4>
            <p><strong>Name:</strong> {{ localData.contactInfo.name }}</p>
            <p><strong>Email:</strong> {{ localData.contactInfo.email }}</p>
            <p><strong>Address:</strong> {{ localData.contactInfo.address }}</p>
          </div>

          <div class="review-section">
            <h4>Company Information</h4>
            <p>
              <strong>Company:</strong> {{ localData.companyInfo.companyName }}
            </p>
            <p>
              <strong>Position:</strong> {{ localData.companyInfo.jobTitle }}
            </p>
            <p>
              <strong>Hiring Manager:</strong>
              {{ localData.companyInfo.hiringManager || 'Not specified' }}
            </p>
          </div>

          <div class="review-section">
            <h4>Introduction</h4>
            <p>{{ localData.introduction || 'No introduction written' }}</p>
          </div>

          <div class="review-section">
            <h4>Body Content</h4>
            <p>
              <strong>Paragraph 1:</strong>
              {{ localData.bodyParagraph1 ? 'Written' : 'Not written' }}
            </p>
            <p>
              <strong>Paragraph 2:</strong>
              {{ localData.bodyParagraph2 ? 'Written' : 'Not written' }}
            </p>
            <p>
              <strong>Paragraph 3:</strong>
              {{ localData.bodyParagraph3 ? 'Written' : 'Not written' }}
            </p>
          </div>

          <div class="review-section">
            <h4>Conclusion</h4>
            <p>{{ localData.conclusion || 'No conclusion written' }}</p>
          </div>
        </div>

        <div class="step-actions">
          <UnifiedButton
            variant="outline"
            @click="$emit('step-change', currentStep - 1)"
          >
            Previous
          </UnifiedButton>
          <UnifiedButton
            variant="success"
            @click="$emit('step-change', currentStep + 1)"
          >
            Complete Cover Letter
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import type { CoverLetterData } from '@/composables/useDocumentManager'

// Props
const props = defineProps<{
  documentData: CoverLetterData
  currentStep: number
  aiEnabled: boolean
}>()

// Emits
const emit = defineEmits<{
  'update-data': [data: CoverLetterData]
  'step-change': [step: number]
  'ai-request': [payload: any]
}>()

// State
const localData = ref(JSON.parse(JSON.stringify(props.documentData)))

// Watch for prop changes
watch(
  () => props.documentData,
  (newData: CoverLetterData) => {
    localData.value = JSON.parse(JSON.stringify(newData))
  },
  { deep: true }
)

// Cover letter steps
const coverLetterSteps = [
  { id: 1, label: 'Contact Info' },
  { id: 2, label: 'Company Info' },
  { id: 3, label: 'Introduction' },
  { id: 4, label: 'Body' },
  { id: 5, label: 'Conclusion' },
  { id: 6, label: 'Review' },
]

// Methods
const emitDataUpdate = () => {
  emit('update-data', JSON.parse(JSON.stringify(localData.value)))
}

// Auto-save on data changes
watch(
  localData,
  () => {
    emitDataUpdate()
  },
  { deep: true }
)
</script>

<style scoped>
.document-content-builder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.step-indicator {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.step-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
  min-width: 80px;
}

.step-item:hover {
  background: var(--glass-hover-bg);
}

.step-item.active {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
}

.step-item.completed {
  background: var(--color-success-500);
  color: var(--text-on-primary);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  font-weight: 600;
  font-size: 0.875rem;
}

.step-item.active .step-number,
.step-item.completed .step-number {
  background: rgba(255, 255, 255, 0.2);
}

.step-label {
  font-size: 0.75rem;
  text-align: center;
  font-weight: 500;
}

.content-editor {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  min-height: 500px;
}

.section-header {
  margin-bottom: var(--spacing-4);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.section-description {
  color: var(--text-secondary);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-field.required .field-label::after {
  content: ' *';
  color: var(--color-error-500);
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.field-input,
.field-textarea {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color var(--duration-fast);
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-500-rgb), 0.1);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-help {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--glass-border);
}

.body-paragraphs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.ai-suggestions {
  margin-bottom: var(--spacing-4);
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.review-section {
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
}

.review-section h4 {
  margin: 0 0 var(--spacing-2) 0;
  font-weight: 600;
  color: var(--text-primary);
}

.review-section p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .step-progress {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }

  .step-item {
    min-width: 60px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }
}
</style>
