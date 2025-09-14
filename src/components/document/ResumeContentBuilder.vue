<template>
  <div class="document-content-builder">
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step-progress">
        <div
          v-for="(step, index) in resumeSteps"
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
      <!-- Personal Info Step -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-account-outline" class="me-2" />
            Personal Information
          </h3>
          <p class="section-description">
            Tell us about yourself to get started
          </p>
        </div>

        <div class="form-grid personal-info-grid">
          <div class="form-field required">
            <label class="field-label">Full Name</label>
            <input
              v-model="localData.personalInfo.name"
              type="text"
              class="field-input"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-field required">
            <label class="field-label">Email Address</label>
            <input
              v-model="localData.personalInfo.email"
              type="email"
              class="field-input"
              placeholder="your.email@example.com"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Phone Number</label>
            <input
              v-model="localData.personalInfo.phone"
              type="tel"
              class="field-input"
              placeholder="(555) 123-4567"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Location</label>
            <input
              v-model="localData.personalInfo.location"
              type="text"
              class="field-input"
              placeholder="City, State/Country"
            />
          </div>

          <div class="form-field">
            <label class="field-label">LinkedIn Profile</label>
            <input
              v-model="localData.personalInfo.linkedin"
              type="url"
              class="field-input"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div class="form-field">
            <label class="field-label">GitHub Profile</label>
            <input
              v-model="localData.personalInfo.github"
              type="url"
              class="field-input"
              placeholder="https://github.com/yourusername"
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
            Next: Professional Summary
          </UnifiedButton>
        </div>
      </div>

      <!-- Summary Step -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-card-text-outline" class="me-2" />
            Professional Summary
          </h3>
          <p class="section-description">
            Write a compelling summary of your professional background
          </p>
        </div>

        <div class="form-field">
          <label class="field-label">Summary</label>
          <textarea
            v-model="localData.summary"
            class="field-textarea"
            rows="6"
            placeholder="Write 2-3 sentences about your professional background, key skills, and career goals..."
          ></textarea>
          <div class="field-help">
            <small class="text-muted">{{ localData.summary.length }}/500 characters</small>
            <UnifiedButton
              v-if="aiEnabled"
              variant="ghost"
              size="sm"
              leading-icon="mdi-auto-fix"
              @click="$emit('ai-request', { type: 'generate-summary' })"
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
            Next: Experience
          </UnifiedButton>
        </div>
      </div>

      <!-- Experience Step -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-briefcase-outline" class="me-2" />
            Professional Experience
          </h3>
          <p class="section-description">
            Add your work experience and achievements
          </p>
        </div>

        <div class="experience-list">
          <div
            v-for="(exp, index) in localData.experience"
            :key="index"
            class="experience-item"
          >
            <div class="experience-header">
              <h4 class="experience-title">
                {{ exp.title }} at {{ exp.company }}
              </h4>
              <div class="experience-actions">
                <UnifiedButton
                  variant="ghost"
                  size="xs"
                  leading-icon="mdi-pencil"
                  @click="editExperience(index)"
                >
                  Edit
                </UnifiedButton>
                <UnifiedButton
                  variant="ghost"
                  size="xs"
                  leading-icon="mdi-delete"
                  @click="removeExperience(index)"
                >
                  Remove
                </UnifiedButton>
              </div>
            </div>
            <p class="experience-description">{{ exp.description }}</p>
          </div>

          <UnifiedButton
            variant="outline"
            leading-icon="mdi-plus"
            @click="addExperience"
          >
            Add Experience
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
            Next: Skills
          </UnifiedButton>
        </div>
      </div>

      <!-- Skills Step -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-tag-outline" class="me-2" />
            Skills & Competencies
          </h3>
          <p class="section-description">List your technical and soft skills</p>
        </div>

        <div class="skills-section">
          <div class="skills-input">
            <input
              v-model="newSkill"
              type="text"
              class="field-input"
              placeholder="Add a skill..."
              @keyup.enter="addSkill"
            />
            <UnifiedButton
              variant="outline"
              :disabled="!newSkill.trim()"
              @click="addSkill"
            >
              Add
            </UnifiedButton>
          </div>

          <div class="skills-list">
            <span
              v-for="(skill, index) in localData.skills"
              :key="index"
              class="skill-tag"
            >
              {{ skill.name }}
              <button class="skill-remove" @click="removeSkill(index)">
                <AppIcon name="mdi-close" size="14" />
              </button>
            </span>
          </div>

          <div v-if="aiEnabled" class="ai-suggestions">
            <UnifiedButton
              variant="ghost"
              leading-icon="mdi-lightbulb"
              @click="$emit('ai-request', { type: 'suggest-skills' })"
            >
              Get AI Skill Suggestions
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
      <div v-if="currentStep === 5" class="step-content">
        <div class="section-header">
          <h3 class="section-title">
            <AppIcon name="mdi-check-circle-outline" class="me-2" />
            Review & Finalize
          </h3>
          <p class="section-description">
            Review your resume and make final adjustments
          </p>
        </div>

        <div class="review-content">
          <div class="review-section">
            <h4>Personal Information</h4>
            <p><strong>Name:</strong> {{ localData.personalInfo.name }}</p>
            <p><strong>Email:</strong> {{ localData.personalInfo.email }}</p>
            <p>
              <strong>Location:</strong> {{ localData.personalInfo.location }}
            </p>
          </div>

          <div class="review-section">
            <h4>Professional Summary</h4>
            <p>{{ localData.summary || "No summary provided" }}</p>
          </div>

          <div class="review-section">
            <h4>Experience ({{ localData.experience.length }} items)</h4>
            <p v-if="localData.experience.length === 0">No experience added</p>
          </div>

          <div class="review-section">
            <h4>Skills ({{ localData.skills.length }} items)</h4>
            <div class="skills-preview">
              <span
                v-for="skill in localData.skills.slice(0, 10)"
                :key="skill.name"
                class="skill-preview-tag"
              >
                {{ skill.name }}
              </span>
            </div>
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
            Complete Resume
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Experience Modal -->
    <div
      v-if="showExperienceModal"
      class="modal-overlay"
      @click="closeExperienceModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            {{
              editingExperienceIndex !== null
                ? "Edit Experience"
                : "Add Experience"
            }}
          </h3>
          <button class="modal-close" @click="closeExperienceModal">
            <AppIcon name="mdi-close" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field required">
              <label class="field-label">Job Title</label>
              <input
                v-model="experienceForm.title"
                type="text"
                class="field-input"
                placeholder="Enter job title"
              />
            </div>

            <div class="form-field required">
              <label class="field-label">Company</label>
              <input
                v-model="experienceForm.company"
                type="text"
                class="field-input"
                placeholder="Enter company name"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Location</label>
              <input
                v-model="experienceForm.location"
                type="text"
                class="field-input"
                placeholder="City, State"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Start Date</label>
              <input
                v-model="experienceForm.startDate"
                type="text"
                class="field-input"
                placeholder="MM/YYYY"
              />
            </div>

            <div class="form-field">
              <label class="field-label">End Date</label>
              <input
                v-model="experienceForm.endDate"
                type="text"
                class="field-input"
                placeholder="MM/YYYY or Present"
              />
            </div>

            <div class="form-field full-width">
              <label class="field-label">Description</label>
              <textarea
                v-model="experienceForm.description"
                class="field-textarea"
                rows="6"
                placeholder="Describe your responsibilities and achievements..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <UnifiedButton variant="outline" @click="closeExperienceModal">
            Cancel
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            :disabled="!experienceForm.title || !experienceForm.company"
            @click="saveExperience"
          >
            {{ editingExperienceIndex !== null ? "Update" : "Add" }} Experience
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { ref, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import type { ResumeData } from "@/composables/useDocumentManager";

// Props
const _props = defineProps<{
  documentData: ResumeData;
  currentStep: number;
  aiEnabled: boolean;
}>();

// Emits
const _emit = defineEmits<{
  "update-data": [data: ResumeData];
  "step-change": [step: number];
  "ai-request": [payload: any];
}>();

// State
const newSkill = ref("");
const showExperienceModal = ref(false);
const editingExperienceIndex = ref<number | null>(null);
const experienceForm = ref({
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

// Local data copy to avoid prop mutation
const localData = ref(JSON.parse(JSON.stringify(props.documentData)));

// Watch for prop changes
watch(
  () => props.documentData,
  (newData: ResumeData) => {
    localData.value = JSON.parse(JSON.stringify(newData));
  },
  { deep: true },
);

// Resume steps
const resumeSteps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Summary" },
  { id: 3, label: "Experience" },
  { id: 4, label: "Skills" },
  { id: 5, label: "Review" },
];

// Methods
const addSkill = () => {
  if (newSkill.value.trim()) {
    localData.value.skills.push({ name: newSkill.value.trim() });
    newSkill.value = "";
    emitDataUpdate();
  }
};

const removeSkill = (index: number) => {
  localData.value.skills.splice(index, 1);
  emitDataUpdate();
};

const addExperience = () => {
  experienceForm.value = {
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
  editingExperienceIndex.value = null;
  showExperienceModal.value = true;
};

const editExperience = (index: number) => {
  const exp = localData.value.experience[index];
  experienceForm.value = { ...exp };
  editingExperienceIndex.value = index;
  showExperienceModal.value = true;
};

const removeExperience = (index: number) => {
  localData.value.experience.splice(index, 1);
  emitDataUpdate();
};

const saveExperience = () => {
  if (editingExperienceIndex.value !== null) {
    localData.value.experience[editingExperienceIndex.value] = {
      ...experienceForm.value,
    };
  } else {
    localData.value.experience.push({ ...experienceForm.value });
  }
  emitDataUpdate();
  closeExperienceModal();
};

const closeExperienceModal = () => {
  showExperienceModal.value = false;
  editingExperienceIndex.value = null;
};

const emitDataUpdate = () => {
  emit("update-data", JSON.parse(JSON.stringify(localData.value)));
};

// Auto-save on data changes
watch(
  localData,
  () => {
    emitDataUpdate();
  },
  { deep: true },
);
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
  content: " *";
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

.experience-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.experience-item {
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2);
}

.experience-title {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.experience-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.skills-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.skills-input {
  display: flex;
  gap: var(--spacing-2);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.skill-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-preview-tag {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--glass-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  margin-right: var(--spacing-1);
  margin-bottom: var(--spacing-1);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: var(--spacing-4);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border-top: 1px solid var(--glass-border);
}

  .step-progress {
    flex-wrap: wrap;
  }

  .step-item {
  }

  .form-grid {
  }

  .step-actions {
    flex-direction: column;
  }

  .experience-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .skills-input {
    flex-direction: column;
  }

  .modal-content {
  }
}
</style>
