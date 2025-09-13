<template>
  <div class="cover-letter-workflow">
    <!-- Unified Step Navigation -->
    <WorkflowSteps
      :steps="coverLetterSteps"
      :current-step="currentStep"
      :can-proceed="canProceed"
      :max-available-step="maxAvailableStep"
      :show-progress-bar="true"
      :show-navigation="false"
      :complete-label="'Complete Letter'"
      @step-change="setStep"
    />

    <!-- Step Content -->
    <div class="workflow-content">
      <!-- Step 1: Job Information -->
      <div v-if="currentStep === 1" class="step-panel">
        <div class="panel-header mb-4">
          <h4 class="fw-semibold">Job Information</h4>
          <p class="text-muted">
            Tell us about the position you're applying for
          </p>
        </div>

        <div class="section-header mb-4">
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="mdi-import"
            @click="importFromProfile"
          >
            Import Profile Data
          </UnifiedButton>
        </div>

        <!-- Job Description Parser -->
        <AIAssistancePanel
          v-if="aiEnabled"
          title="AI Job Description Parser"
          subtitle="Extract key information from job postings automatically"
          :primary-action="{ label: 'Parse with AI', icon: 'mdi-brain' }"
          :loading="aiLoading"
          :disabled="!jobDescriptionText.trim()"
          @primary-action="parseJobDescription"
        >
          <template #content>
            <FormField
              v-model="jobDescriptionText"
              type="textarea"
              label="Job Description"
              placeholder="Paste the full job description here..."
              :rows="6"
              helper-text="Paste the complete job posting to extract company, position, and requirements"
            />
          </template>
        </AIAssistancePanel>

        <!-- Job Information Form -->
        <div class="job-info-form">
          <div class="row g-4">
            <div class="col-md-6">
              <FormField
                :model-value="coverLetterData.jobInfo.company"
                label="Company Name"
                icon="mdi-domain"
                placeholder="Tech Corp Inc."
                :required="true"
                @update:model-value="(value) => updateJobInfo('company', value)"
              />
            </div>
            <div class="col-md-6">
              <FormField
                :model-value="coverLetterData.jobInfo.position"
                label="Position Title"
                icon="mdi-badge-account-outline"
                placeholder="Senior Software Engineer"
                :required="true"
                @update:model-value="
                  (value) => updateJobInfo('position', value)
                "
              />
            </div>
            <div class="col-md-6">
              <FormField
                :model-value="coverLetterData.jobInfo.hiringManager"
                label="Hiring Manager"
                icon="mdi-account-tie"
                placeholder="Jane Smith (optional)"
                @update:model-value="
                  (value) => updateJobInfo('hiringManager', value)
                "
              />
            </div>
            <div class="col-md-6">
              <FormField
                :model-value="coverLetterData.jobInfo.department"
                label="Department"
                icon="mdi-office-building-outline"
                placeholder="Engineering (optional)"
                @update:model-value="
                  (value) => updateJobInfo('department', value)
                "
              />
            </div>
          </div>

          <!-- Key Requirements (extracted from job description) -->
          <div
            v-if="extractedRequirements.length > 0"
            class="requirements-section mt-4"
          >
            <h6 class="fw-semibold mb-3">Key Requirements Identified</h6>
            <div class="requirements-grid">
              <div
                v-for="requirement in extractedRequirements"
                :key="requirement"
                class="requirement-chip"
              >
                {{ requirement }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Letter Tone & Focus -->
      <div v-if="currentStep === 2" class="step-panel">
        <div class="panel-header mb-4">
          <h4 class="fw-semibold">Letter Style</h4>
          <p class="text-muted">
            Choose the tone and focus for your cover letter
          </p>
        </div>

        <div class="style-options">
          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label fw-medium">Tone</label>
              <div class="tone-options">
                <div
                  v-for="tone in toneOptions"
                  :key="tone.value"
                  class="tone-option"
                  :class="{ active: coverLetterData.tone === tone.value }"
                  @click="updateTone(tone.value)"
                >
                  <AppIcon :name="tone.icon" class="me-3" />
                  <div>
                    <div class="fw-semibold">{{ tone.label }}</div>
                    <div class="text-sm text-muted">{{ tone.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-medium">Primary Focus</label>
              <div class="focus-options">
                <div
                  v-for="focus in focusOptions"
                  :key="focus.value"
                  class="focus-option"
                  :class="{ active: coverLetterData.focus === focus.value }"
                  @click="updateFocus(focus.value)"
                >
                  <AppIcon :name="focus.icon" class="me-3" />
                  <div>
                    <div class="fw-semibold">{{ focus.label }}</div>
                    <div class="text-sm text-muted">
                      {{ focus.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 6: Review & Export -->
      <div v-if="currentStep === 6" class="step-panel">
        <div class="panel-header mb-3">
          <h4 class="fw-semibold">Review & Export</h4>
          <p class="text-muted">
            Preview your cover letter content before exporting.
          </p>
        </div>
        <div class="cl-review surface-elevated border-subtle rounded-lg p-4">
          <div class="mb-2">
            <strong>Target:</strong>
            {{ coverLetterData.jobInfo.position || "Position" }} at
            {{ coverLetterData.jobInfo.company || "Company" }}
          </div>
          <div class="mb-2">
            <strong>Hiring Manager:</strong>
            {{ coverLetterData.jobInfo.hiringManager || "—" }}
          </div>
          <div class="mt-3">
            <p v-if="coverLetterData.content.opening">
              {{ coverLetterData.content.opening }}
            </p>
            <p v-if="coverLetterData.content.body">
              {{ coverLetterData.content.body }}
            </p>
            <p v-if="coverLetterData.content.closing">
              {{ coverLetterData.content.closing }}
            </p>
          </div>
        </div>
        <div class="d-flex gap-2 mt-3">
          <UnifiedButton
            variant="primary"
            leading-icon="mdi-download"
            @click="emit('export')"
          >
            Export Cover Letter
          </UnifiedButton>
        </div>
      </div>

      <!-- Step 3: Opening Paragraph -->
      <div v-if="currentStep === 3" class="step-panel">
        <div class="panel-header mb-4">
          <h4 class="fw-semibold">Opening Paragraph</h4>
          <p class="text-muted">
            Create a compelling opening that grabs attention
          </p>
        </div>

        <AIAssistancePanel
          v-if="aiEnabled"
          title="AI Writing Assistant"
          subtitle="Create compelling opening paragraphs"
          :primary-action="{ label: 'Tailor to Job', icon: 'mdi-target' }"
          :secondary-actions="[
            {
              key: 'variations',
              label: 'Generate Variations',
              icon: 'mdi-shimmer',
            },
          ]"
          :loading="aiLoading"
          :suggestions="openingSuggestions"
          :show-tokens="true"
          :tokens="clTokens"
          @primary-action="generateTailoredOpening"
          @secondary-action="
            (key) => key === 'variations' && generateOpeningVariations()
          "
          @apply-suggestion="
            (suggestion) => applySuggestion(suggestion.text, 'opening')
          "
          @insert-token="insertOpeningToken"
        />

        <FormField
          :model-value="coverLetterData.content.opening"
          type="textarea"
          label="Opening Paragraph"
          icon="mdi-file-document-edit-outline"
          placeholder="Dear Hiring Manager,&#10;&#10;I am excited to apply for the [Position] role at [Company]. With my [X years] of experience in [relevant field], I am confident that my skills in [key skills] make me an ideal candidate for this position."
          :rows="5"
          :show-counter="true"
          counter-type="words"
          counter-range="80-120"
          helper-text="Create a compelling opening that grabs attention and introduces your interest"
          @update:model-value="(value) => updateContent('opening', value)"
        />
      </div>

      <!-- Step 4: Body Content -->
      <div v-if="currentStep === 4" class="step-panel">
        <div class="panel-header mb-4">
          <h4 class="fw-semibold">Body Paragraphs</h4>
          <p class="text-muted">
            Highlight your relevant experience and achievements
          </p>
        </div>

        <AIAssistancePanel
          v-if="aiEnabled && linkedResume"
          title="Resume Integration"
          subtitle="Pull relevant experience from your resume to create compelling body content"
          :primary-action="{
            label: 'Use Work Experience',
            icon: 'mdi-briefcase',
          }"
          :secondary-actions="[
            { key: 'skills', label: 'Highlight Skills', icon: 'mdi-flash' },
            {
              key: 'projects',
              label: 'Include Projects',
              icon: 'mdi-folder-multiple',
            },
          ]"
          :loading="aiLoading"
          @primary-action="integrateResumeExperience"
          @secondary-action="
            (key) => {
              if (key === 'skills') integrateResumeSkills();
              else if (key === 'projects') integrateResumeProjects();
            }
          "
        />

        <FormField
          v-model="coverLetterData.content.body"
          type="textarea"
          label="Body Content"
          icon="mdi-text-box-multiple-outline"
          placeholder="In my previous role at [Previous Company], I successfully [specific achievement]. This experience has equipped me with [relevant skills] that directly align with your requirements for [specific job requirements].&#10;&#10;I am particularly drawn to [Company] because [specific reason related to company values/mission]. I am excited about the opportunity to contribute to [specific project/initiative] and help [specific goal]."
          :rows="8"
          :show-counter="true"
          counter-type="words"
          counter-range="200-300"
          helper-text="Highlight your relevant experience and achievements that align with the job requirements"
        />
      </div>

      <!-- Step 5: Closing -->
      <div v-if="currentStep === 5" class="step-panel">
        <div class="panel-header mb-4">
          <h4 class="fw-semibold">Closing Paragraph</h4>
          <p class="text-muted">End with a strong call to action</p>
        </div>

        <AIAssistancePanel
          v-if="aiEnabled"
          title="Closing Suggestions"
          subtitle="Generate professional closing paragraphs"
          :primary-action="{ label: 'Generate Options', icon: 'mdi-target' }"
          :loading="aiLoading"
          :suggestions="closingSuggestions"
          :show-tokens="true"
          :tokens="clTokens"
          @primary-action="generateClosingOptions"
          @apply-suggestion="
            (suggestion) => applySuggestion(suggestion.text, 'closing')
          "
          @insert-token="insertClosingToken"
        />

        <FormField
          :model-value="coverLetterData.content.closing"
          type="textarea"
          label="Closing Paragraph"
          icon="mdi-email-seal-outline"
          placeholder="Thank you for considering my application. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to [Company]'s continued success. I look forward to hearing from you.&#10;&#10;Sincerely,&#10;[Your Name]"
          :rows="4"
          :show-counter="true"
          counter-type="words"
          counter-range="60-100"
          helper-text="End with a strong call to action and professional closing"
          @update:model-value="(value) => updateContent('closing', value)"
        />
      </div>

      <!-- Navigation Buttons -->
      <div class="workflow-navigation section-card mt-6">
        <div class="d-flex justify-content-between align-items-center">
          <UnifiedButton
            variant="outline"
            leading-icon="mdi-chevron-left"
            :disabled="currentStep === 1"
            @click="previousStep"
          >
            Previous
          </UnifiedButton>

          <div class="step-info text-center">
            <div class="current-step-title">
              {{ coverLetterSteps.find((s) => s.id === currentStep)?.title }}
            </div>
            <div class="step-counter">
              Step {{ currentStep }} of {{ coverLetterSteps.length }}
            </div>
          </div>

          <div class="d-flex gap-2">
            <UnifiedButton
              v-if="currentStep < coverLetterSteps.length"
              variant="primary"
              trailing-icon="mdi-chevron-right"
              :disabled="!canProceed"
              @click="nextStep"
            >
              Next Step
            </UnifiedButton>

            <UnifiedButton
              v-else
              variant="success"
              leading-icon="mdi-check"
              :disabled="!canProceed"
              @click="completeCoverLetter"
            >
              Complete Letter
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAppStore } from "@/stores/app";
import { useToast } from "@/composables/useToast";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import FormField from "@/components/ui/FormField.vue";
import AIAssistancePanel from "@/components/ui/AIAssistancePanel.vue";
import WorkflowSteps from "@/components/ui/WorkflowSteps.vue";
import { useAchievementTracker } from "@/composables/useAchievementTracker";

// Props
const props = defineProps({
  coverLetterData: {
    type: Object,
    required: true,
  },
  currentStep: {
    type: Number,
    default: 1,
  },
  jobDescription: {
    type: String,
    default: "",
  },
  aiEnabled: {
    type: Boolean,
    default: false,
  },
  linkedResume: {
    type: Object,
    default: null,
  },
});

// Store
const store = useAppStore();

// Emits
const emit = defineEmits([
  "update:coverLetterData",
  "update:currentStep",
  "update:jobDescription",
  "request-ai-assistance",
  "export",
]);

// State
const aiLoading = ref(false);
const jobDescriptionText = ref(props.jobDescription);
const extractedRequirements = ref([]);
const openingSuggestions = ref([]);
const closingSuggestions = ref([]);
const toast = useToast();
const { trackDocumentAchievement } = useAchievementTracker();
const clTokens = [
  "{{currentRole}}",
  "{{currentCompany}}",
  "{{yearsExperience}}",
  "{{name}}",
  "{{email}}",
  "{{phone}}",
  "{{location}}",
  "{{website}}",
  "{{linkedin}}",
  "{{github}}",
  "{{portfolio}}",
];
const openingRef = ref(null);
const closingRef = ref(null);

function insertInto(refEl, getText, setText, token) {
  try {
    const el = refEl?.value;
    const text = getText() || "";
    if (!el) {
      const sep = text && !/\s$/.test(text) ? " " : "";
      setText(text + sep + token);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = text.slice(0, start) + token + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      try {
        el.focus();
        el.selectionStart = el.selectionEnd = start + token.length;
      } catch {}
    });
  } catch {}
}

function insertOpeningToken(token) {
  insertInto(
    openingRef,
    () => props.coverLetterData.content.opening,
    (v) =>
      emit("update:coverLetterData", {
        ...props.coverLetterData,
        content: { ...props.coverLetterData.content, opening: v },
      }),
    token,
  );
}
function insertClosingToken(token) {
  insertInto(
    closingRef,
    () => props.coverLetterData.content.closing,
    (v) =>
      emit("update:coverLetterData", {
        ...props.coverLetterData,
        content: { ...props.coverLetterData.content, closing: v },
      }),
    token,
  );
}

// Cover Letter Steps Configuration
const coverLetterSteps = [
  { id: 1, title: "Job Info", description: "Position details" },
  { id: 2, title: "Style", description: "Tone & focus" },
  { id: 3, title: "Opening", description: "First impression" },
  { id: 4, title: "Body", description: "Main content" },
  { id: 5, title: "Closing", description: "Call to action" },
  {
    id: 6,
    title: "Review & Export",
    description: "Preview and export your letter",
  },
];

// Options
const toneOptions = [
  {
    value: "professional",
    label: "Professional",
    icon: "mdi-briefcase",
    description: "Formal and business-appropriate",
  },
  {
    value: "enthusiastic",
    label: "Enthusiastic",
    icon: "mdi-fire",
    description: "Energetic and passionate",
  },
  {
    value: "confident",
    label: "Confident",
    icon: "mdi-arm-flex",
    description: "Strong and assertive",
  },
  {
    value: "friendly",
    label: "Friendly",
    icon: "mdi-emoticon-happy-outline",
    description: "Warm and personable",
  },
];

const focusOptions = [
  {
    value: "experience",
    label: "Experience",
    icon: "mdi-star",
    description: "Highlight work history",
  },
  {
    value: "skills",
    label: "Skills",
    icon: "mdi-flash",
    description: "Emphasize technical abilities",
  },
  {
    value: "achievements",
    label: "Achievements",
    icon: "mdi-trophy",
    description: "Showcase accomplishments",
  },
  {
    value: "culture-fit",
    label: "Culture Fit",
    icon: "mdi-handshake",
    description: "Alignment with company values",
  },
];

// Computed
const maxAvailableStep = computed(() => {
  return Math.max(1, props.currentStep);
});

const canProceed = computed(() => {
  switch (props.currentStep) {
    case 1:
      return (
        props.coverLetterData.jobInfo.company &&
        props.coverLetterData.jobInfo.position
      );
    case 2:
      return props.coverLetterData.tone && props.coverLetterData.focus;
    case 3:
      return (
        props.coverLetterData.content.opening &&
        props.coverLetterData.content.opening.length > 50
      );
    case 4:
      return (
        props.coverLetterData.content.body &&
        props.coverLetterData.content.body.length > 100
      );
    case 5:
      return (
        props.coverLetterData.content.closing &&
        props.coverLetterData.content.closing.length > 30
      );
    default:
      return true;
  }
});

// Methods
const setStep = (step) => {
  emit("update:currentStep", step);
};

const nextStep = () => {
  if (canProceed.value && props.currentStep < coverLetterSteps.length) {
    emit("update:currentStep", props.currentStep + 1);
  }
};

const previousStep = () => {
  if (props.currentStep > 1) {
    emit("update:currentStep", props.currentStep - 1);
  }
};

const wordCount = (text) => {
  return text ? text.trim().split(/\s+/).length : 0;
};

// Update methods for tone and focus
const updateTone = (tone) => {
  emit("update:coverLetterData", { ...props.coverLetterData, tone });
};

const updateFocus = (focus) => {
  emit("update:coverLetterData", { ...props.coverLetterData, focus });
};

// Update job info fields
const updateJobInfo = (field, value) => {
  const updatedData = {
    ...props.coverLetterData,
    jobInfo: {
      ...props.coverLetterData.jobInfo,
      [field]: value,
    },
  };
  emit("update:coverLetterData", updatedData);
};

// Update content fields
const updateContent = (field, value) => {
  const updatedData = {
    ...props.coverLetterData,
    content: {
      ...props.coverLetterData.content,
      [field]: value,
    },
  };
  emit("update:coverLetterData", updatedData);
};

// Import profile data for cover letter context
const importFromProfile = () => {
  try {
    const profile = store.userProfile || {};
    const personalInfo = profile.personalInfo || {};

    let updatedData = { ...props.coverLetterData };
    let updated = false;

    // Import professional information for cover letter context
    if (personalInfo.currentRole && !props.coverLetterData.jobInfo.position) {
      updatedData = {
        ...updatedData,
        jobInfo: {
          ...updatedData.jobInfo,
          position: personalInfo.currentRole,
        },
      };
      updated = true;
    }

    if (personalInfo.currentCompany && !props.coverLetterData.jobInfo.company) {
      updatedData = {
        ...updatedData,
        jobInfo: {
          ...updatedData.jobInfo,
          company: personalInfo.currentCompany,
        },
      };
      updated = true;
    }

    // Set default tone and focus based on profile if not set
    if (!props.coverLetterData.tone) {
      updatedData = { ...updatedData, tone: "professional" };
      updated = true;
    }

    if (!props.coverLetterData.focus) {
      updatedData = { ...updatedData, focus: "experience" };
      updated = true;
    }

    if (updated) {
      emit("update:coverLetterData", updatedData);
      toast.success("Imported profile context for cover letter");
      // Track achievement for profile import
      trackDocumentAchievement("profile_import_cover_letter");
    } else {
      toast.info("Profile data already imported");
    }
  } catch (e) {
    console.error("Profile import error:", e);
    toast.error("Failed to import profile details");
  }
};

// AI Methods
const parseJobDescription = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "parse-job-description",
    data: jobDescriptionText.value,
  });
  emit("update:jobDescription", jobDescriptionText.value);
  aiLoading.value = false;
};

const generateOpeningVariations = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "generate-opening-variations",
    data: {
      jobInfo: props.coverLetterData.jobInfo,
      tone: props.coverLetterData.tone,
    },
  });
  aiLoading.value = false;
};

const generateTailoredOpening = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "generate-tailored-opening",
    data: {
      jobInfo: props.coverLetterData.jobInfo,
      jobDescription: props.jobDescription,
      resume: props.linkedResume,
    },
  });
  aiLoading.value = false;
};

const generateClosingOptions = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "generate-closing-options",
    data: {
      jobInfo: props.coverLetterData.jobInfo,
      tone: props.coverLetterData.tone,
    },
  });
  aiLoading.value = false;
};

const integrateResumeExperience = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "integrate-resume-experience",
    data: {
      resume: props.linkedResume,
      jobDescription: props.jobDescription,
    },
  });
  aiLoading.value = false;
};

const integrateResumeSkills = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "integrate-resume-skills",
    data: {
      resume: props.linkedResume,
      jobDescription: props.jobDescription,
    },
  });
  aiLoading.value = false;
};

const integrateResumeProjects = async () => {
  aiLoading.value = true;
  emit("request-ai-assistance", {
    type: "integrate-resume-projects",
    data: {
      resume: props.linkedResume,
      jobDescription: props.jobDescription,
    },
  });
  aiLoading.value = false;
};

const applySuggestion = (text, field) => {
  const updatedData = {
    ...props.coverLetterData,
    content: {
      ...props.coverLetterData.content,
      [field]: text,
    },
  };
  emit("update:coverLetterData", updatedData);
  toast.success("Suggestion applied");
};

const completeCoverLetter = () => {
  toast.success("Cover letter completed!");
  // Track achievement for completing cover letter
  trackDocumentAchievement("cover_letter_completed");
  emit("export");
};
</script>

<style scoped>
.cover-letter-workflow {
}

.steps-container {
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
}

.step-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.step-item:hover {
  background: var(--glass-hover-bg);
}

.step-item.active {
  color: var(--text-on-primary);
}

.step-item.completed {
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
}

.step-item.active .step-indicator {
  background: var(--text-on-primary);
}

.step-item.completed .step-indicator {
  color: white;
}

.workflow-content {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
}

.tone-options,
.focus-options {
  display: flex;
  flex-direction: column;
}

.tone-option,
.focus-option {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.tone-option:hover,
.focus-option:hover {
  background: var(--glass-hover-bg);
}

.tone-option.active,
.focus-option.active {
}

.requirements-grid {
  display: flex;
  flex-wrap: wrap;
}

.requirement-chip {
  border-radius: var(--radius-full);
}

.parser-card {
  background: var(--glass-surface);
}

.integration-card {
  background: var(--glass-surface);
}

.suggestion-card {
  background: var(--glass-surface);
  transition: all var(--duration-fast);
}

.suggestion-card:hover {
  background: var(--glass-hover-bg);
}

.workflow-navigation {
}

  .steps-container {
    flex-direction: column;
  }

  .step-item {
    min-width: auto;
  }

  .workflow-content {
  }

  .tone-options,
  .focus-options {
  }
}
</style>
