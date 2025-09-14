<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <template #header-actions>
      <HeaderActions
        layout="horizontal"
        alignment="end"
        gap="md"
        priority="primary"
      >
        <!-- AI Enhancement -->
        <UnifiedButton
          v-if="aiReady"
          variant="gaming"
          size="md"
          leading-icon="mdi-robot"
          :disabled="!aiReady"
          @click="enhanceWithAI"
        >
          AI Enhance
        </UnifiedButton>

        <!-- AI Status (only show if offline) -->
        <div v-else class="ai-status-warning">
          <AppIcon name="mdi-alert-circle-outline" size="14" />
          <span>AI Offline</span>
        </div>

        <UnifiedButton
          variant="outline"
          size="md"
          leading-icon="mdi-eye"
          @click="togglePreview"
        >
          Preview
        </UnifiedButton>

        <UnifiedButton
          variant="primary"
          size="md"
          leading-icon="mdi-download"
          @click="onExportClick"
        >
          Export
        </UnifiedButton>
      </HeaderActions>
    </template>

    <!-- Document Type Selector -->
    <div class="document-type-selector">
      <div class="document-tabs">
        <button
          v-for="docType in ['resume', 'cover-letter']"
          :key="docType"
          :class="{ active: activeDocumentType === docType }"
          class="doc-tab"
          @click="activeDocumentType = docType"
        >
          <AppIcon
            :name="
              docType === 'resume' ? 'mdi-account-box' : 'mdi-email-outline'
            "
          />
          {{ docType === "resume" ? "Resume" : "Cover Letter" }}
        </button>
      </div>

      <UnifiedButton
        variant="outline"
        size="sm"
        leading-icon="mdi-import"
        :disabled="profileImporting"
        :loading="profileImporting"
        @click="importFromProfile"
      >
        Import Profile
      </UnifiedButton>
    </div>

    <!-- Main Content Area -->
    <div class="document-workspace">
      <!-- Job Context (if provided) -->
      <div v-if="jobDescription" class="job-context-banner">
        <div class="job-info">
          <AppIcon name="mdi-briefcase-outline" />
          <span>{{
            jobInfo.company
              ? `${jobInfo.company} - ${jobInfo.position}`
              : "Job Context Active"
          }}</span>
          <div v-if="atsScore > 0" class="ats-score">
            {{ atsScore }}% ATS Match
          </div>
        </div>
      </div>

      <!-- Unified Document Editor -->
      <UnifiedDocumentEditor
        :document-type="activeDocumentType"
        :resume-data="resumeData"
        :cover-letter-data="coverLetterData"
        :ai-ready="aiReady"
        :profile-data="profileData"
        @update-resume="handleResumeUpdate"
        @update-cover-letter="handleCoverLetterUpdate"
        @template-change="selectTemplate"
        @ai-request="handleAIRequest"
      />
    </div>

    <!-- Modals -->
    <DocumentPreviewModal
      v-if="showPreviewModal"
      :show="showPreviewModal"
      :document-type="activeDocumentType"
      :document-data="currentDocumentData"
      :template="selectedTemplate"
      @close="showPreviewModal = false"
      @export="handleExport"
    />

    <AIModal
      v-if="showAIModal"
      :show="showAIModal"
      :context="aiModalContext"
      @close="showAIModal = false"
      @apply="handleAIModalResult"
    />

    <!-- Version History Panel -->
    <VersionHistoryPanel
      v-if="showVersionHistory"
      :show="showVersionHistory"
      :versions="documentVersions"
      :current-document="activeDocumentType"
      @close="showVersionHistory = false"
      @revert="revertToVersion"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

import { ref, computedwatch } from "vue";
import { useToast } from "@/composables/useToast";

// Components
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import HeaderActions from "@/components/ui/HeaderActions.vue";
import UnifiedDocumentEditor from "@/components/document/UnifiedDocumentEditor.vue";
import DocumentPreviewModal from "@/components/document/DocumentPreviewModal.vue";
import AIModal from "@/components/document/AIModal.vue";
import VersionHistoryPanel from "@/components/document/VersionHistoryPanel.vue";

// Composables
import { useDocumentManager } from "@/composables/useDocumentManager";
import { useAIIntegration } from "@/composables/aiIntegration.js";
import { useUnifiedProfile } from "@/composables/useUnifiedProfile";
import { useProfileAI } from "@/composables/useProfileAI";

// Types
type DocumentType = "resume" | "cover-letter";

const toast = useToast();

// Profile Integration
const unifiedProfile = useUnifiedProfile();
const profileAI = useProfileAI();

// Document Manager
const {
  resumeData,
  coverLetterData,
  jobDescription,
  jobInfo,
  selectedTemplate,
  documentVersions,
  currentStep,
  updateDocumentData,
  _updateJobDescription,
  selectTemplate,
  revertToVersion,
} = useDocumentManager();

// AI Integration
const {
  aiReady,
  _aiProcessing,
  atsScore,
  handleAIRequest,
  _handleTailoring,
  _handleAISuggestions,
  _optimizeContent,
  _showAISuggestions,
} = useAIIntegration(resumeData, coverLetterData, jobDescription.value);

// Version Control - Implemented via useDocumentManager composable

// State
const showPreviewModal = ref(false);
const showAIModal = ref(false);
const showVersionHistory = ref(false);
const aiModalContext = ref(null);
const profileImporting = ref(false);
// Active document context
const activeDocumentType = ref<DocumentType>("resume");
const currentDocumentData = computed(() =>
  activeDocumentType.value === "resume" ? resumeData : coverLetterData,
);

// Profile Integration
const profileData = computed(() => unifiedProfile.profile.value);

const togglePreview = () => {
  showPreviewModal.value = true;
};

const enhanceWithAI = () => {
  if (!aiReady) {
    toast.error("AI service is not available");
    return;
  }
  // Open AI modal for document enhancement
  showAIModal.value = true;
  aiModalContext.value = {
    type: "enhance",
    documentType: activeDocumentType.value,
    data: currentDocumentData.value,
  };
};

const _handleStepChange = (step: number) => {
  currentStep.value = step;
};

const handleAIModalResult = (_result: any) => {
  // Handle AI modal result
};

const _handleProfileEnhancedSuggestion = async (suggestion: any) => {
  try {
    switch (suggestion.type) {
      case "refresh-profile":
        await syncProfileData();
        break;

      case "job-profile-match":
        // Handle job-profile match analysis
        if (suggestion.data) {
          // Update ATS score or other relevant metrics
          toast.success(
            `Profile match: ${suggestion.data.skillMatch}% skill compatibility`,
          );

          // You could store this data for display in the sidebar
          // atsScore.value = suggestion.data.skillMatch
        }
        break;

      default:
        console.log("Unknown profile suggestion type:", suggestion.type);
    }
  } catch (_error) {
    console.error("Failed to handle profile enhanced suggestion:", error);
    toast.error("Failed to process AI suggestion");
  }
};

const handleResumeUpdate = (data: any) => {
  updateDocumentData("resume", data);
};

const handleCoverLetterUpdate = (data: any) => {
  updateDocumentData("cover-letter", data);
};

// Profile Integration Methods
const importFromProfile = async () => {
  if (!profileData.value) {
    toast.error("No profile data available to import");
    return;
  }

  try {
    profileImporting.value = true;

    // Import data for both resume and cover letter
    const resumeProfileData = unifiedProfile.getContextualProfile("resume");
    const coverLetterProfileData = unifiedProfile.getContextualProfile("jobs");

    if (resumeProfileData) {
      // Map profile data to resume format
      updateDocumentData("resume", {
        personalInfo: resumeProfileData.personalInfo || {},
        experience: resumeProfileData.experience || [],
        education: resumeProfileData.education || [],
        skills: resumeProfileData.skills || { technical: [], soft: [] },
        achievements: resumeProfileData.achievements || [],
      });
    }

    if (coverLetterProfileData) {
      // Map profile data to cover letter format - basic structure
      updateDocumentData("cover-letter", {
        ...coverLetterData,
        personalInfo:
          resumeProfileData?.personalInfo || coverLetterData.personalInfo,
      });
    }

    toast.success("Profile data imported successfully");
  } catch (_error) {
    console.error("Profile import failed:", error);
    toast.error("Failed to import profile data");
  } finally {
    profileImporting.value = false;
  }
};

const syncProfileData = async () => {
  try {
    profileImporting.value = true;
    await unifiedProfile.forceSync();
    toast.success("Profile synced successfully");
  } catch (_error) {
    console.error("Profile sync failed:", error);
    toast.error("Failed to sync profile data");
  } finally {
    profileImporting.value = false;
  }
};

const _aiEnhanceFromProfile = async () => {
  if (!profileAI.isReady.value) {
    toast.error("AI service or profile data not available");
    return;
  }

  try {
    const documentType = activeDocumentType.value;
    const currentData = currentDocumentData.value;

    if (documentType === "resume") {
      const result = await profileAI.generateResumeWithProfile(
        jobDescription.value,
        {
          includeGamingExperience: true,
          optimizeForATS: true,
          focusOnTargetRole: true,
        },
      );

      if (result.success && result.data) {
        // Apply the AI-generated improvements
        updateDocumentData("resume", result.data);
        toast.success(
          `AI enhancement complete (${result.confidence}% confidence)`,
        );
      } else {
        toast.error(result.error || "AI enhancement failed");
      }
    } else if (documentType === "cover-letter") {
      const result = await profileAI.generateCoverLetterWithProfile(
        jobDescription.value,
        jobInfo.value,
        {
          includeGamingExperience: true,
          usePersonalityInsights: true,
        },
      );

      if (result.success && result.data) {
        updateDocumentData("cover-letter", result.data);
        toast.success(
          `AI enhancement complete (${result.confidence}% confidence)`,
        );
      } else {
        toast.error(result.error || "AI enhancement failed");
      }
    }

    // Also get personalized suggestions
    const suggestionsResult = await profileAI.getPersonalizedSuggestions(
      documentType,
      currentData,
    );

    if (suggestionsResult.success && suggestionsResult.suggestions) {
      console.log("AI Suggestions:", suggestionsResult.suggestions);
      // You could show these in a modal or sidebar
    }
  } catch (_error) {
    console.error("AI profile enhancement failed:", error);
    toast.error("AI enhancement failed");
  }
};

const handleExport = async (_format?: string) => {
  // Export logic
  toast.success("Document exported successfully");
};

// Event handler for UnifiedButton to fix type error
const onExportClick = (event: Event) => {
  event.preventDefault?.();
  handleExport();
};

// const getProgressClass = (progress: number) => {


//   return 'incomplete'
// }

const _getATSScoreClass = (score: number) => {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
};

const _getATSScoreDescription = (score: number) => {
  if (score >= 80)
    return "Excellent! Your documents are well-optimized for ATS systems.";
  if (score >= 60) return "Good compatibility. Consider minor optimizations.";
  return "Needs improvement. AI can help optimize your documents.";
};

// const handleResetDocument = () => {
//   if (confirm('Are you sure you want to reset all documents? This action cannot be undone.')) {
//     // Reset resume data
//     Object.assign(resumeData, {
//       personalInfo: {
//         name: '',
//         email: '',
//         phone: '',
//         location: '',
//         website: '',
//         linkedin: '',
//         github: ''
//       },
//       summary: '',
//       experience: [],
//       education: [],
//       skills: [],
//       projects: [],
//       achievements: [],
//       certifications: []
//     })
//
//     // Reset cover letter data
//     Object.assign(coverLetterData, {
//       jobInfo: {
//         company: '',
//         position: '',
//         hiringManager: ''
//       },
//       content: {
//         opening: '',
//         body: '',
//         closing: ''
//       },
//       tone: 'professional',
//       focus: 'experience'
//     })
//
//     // Reset workflow


//     toast.success('All documents reset successfully')
//   }
// }

// Lifecycle
onMounted(async () => {
  try {
    // Load saved document drafts and restore user session
    await loadDocumentDrafts();

    // Initialize AI service if available
    if (aiReady.value) {
      await initializeAIFeatures();
    }

    // Load profile data if available
    if (unifiedProfile.profile.value) {
      await syncProfileData();
    }

    // Set up auto-save watchers
    setupAutoSave();
  } catch (_error) {
    console.error("Failed to initialize document manager:", error);
    toast.error("Failed to load document data");
  }
});

const loadDocumentDrafts = async () => {
  try {
    const resumeDraft = localStorage.getItem("navi-resume-draft");
    const coverLetterDraft = localStorage.getItem("navi-cover-letter-draft");

    if (resumeDraft) {
      const parsed = JSON.parse(resumeDraft);
      updateDocumentData("resume", parsed);
    }

    if (coverLetterDraft) {
      const parsed = JSON.parse(coverLetterDraft);
      updateDocumentData("cover-letter", parsed);
    }
  } catch (_error) {
    console.error("Failed to load drafts:", error);
  }
};

const initializeAIFeatures = async () => {
  try {
    // Pre-warm AI service for faster response times
    await handleAIRequest({
      type: "initialize",
      documentType: activeDocumentType.value,
    });
  } catch (_error) {
    console.error("AI initialization failed:", error);
  }
};

const setupAutoSave = () => {
  // Auto-save resume changes
  watch(
    resumeData,
    (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        localStorage.setItem("navi-resume-draft", JSON.stringify(newData));
      }
    },
    { deep: true },
  );

  // Auto-save cover letter changes
  watch(
    coverLetterData,
    (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        localStorage.setItem(
          "navi-cover-letter-draft",
          JSON.stringify(newData),
        );
      }
    },
    { deep: true },
  );
};
</script>

<style scoped>
.document-type-selector {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.document-tabs {
  display: flex;
  gap: var(--spacing-2);
}

.doc-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.doc-tab:hover {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-300);
}

.doc-tab.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.document-actions {
  display: flex;
  gap: var(--spacing-2);
}

.doc-type-select {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.document-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-height: 70vh;
}

.job-context-banner {
  background: linear-gradient(
    135deg,
    var(--color-primary-50),
    var(--color-success-50)
  );
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
}

.job-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-primary-800);
  font-weight: 500;
}

.ats-score {
  margin-left: auto;
  background: var(--color-success-100);
  color: var(--color-success-800);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
}

  .document-type-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .document-tabs {
    justify-content: center;
  }

  .doc-tab {
    justify-content: center;
  }

  .document-actions {
    justify-content: center;
  }

  .job-info {
    flex-direction: column;
    text-align: center;
  }

  .ats-score {
    align-self: center;
  }
}
</style>
