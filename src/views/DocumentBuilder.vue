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
        priority="secondary"
      >
        <!-- AI Status (only show if offline) -->
        <div v-if="!aiReady" class="ai-status-warning">
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
import { useAppStore } from "@/stores/app";

// Types
type DocumentType = "resume" | "cover-letter";

const toast = useToast();

// Profile Integration
const unifiedProfile = useUnifiedProfile();
const _store = useAppStore();

// Document Manager
const {
  resumeData,
  coverLetterData,
  jobDescription,
  jobInfo,
  selectedTemplate,
  aiConfig: _aiConfig,
  userPreferences: _userPreferences,
  documentVersions,
  currentStep: _currentStep,
  updateDocumentData,
  selectTemplate,
  updateAIConfig: _updateAIConfig,
  updatePreferences: _updatePreferences,
  revertToVersion,
} = useDocumentManager();

// AI Integration
const { aiReady, atsScore, handleAIRequest } = useAIIntegration(
  resumeData,
  coverLetterData,
  jobDescription,
);

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

const handleAIModalResult = (result: any) => {
  if (!result) return;

  try {
    if (result.type === "content-update") {
      if (activeDocumentType.value === "resume") {
        updateDocumentData("resume", { ...resumeData, ...result.data });
      } else {
        updateDocumentData("cover-letter", {
          ...coverLetterData,
          ...result.data,
        });
      }
      toast.success("AI suggestions applied successfully");
    } else if (result.type === "optimization") {
      if (activeDocumentType.value === "resume") {
        updateDocumentData("resume", result.optimizedData);
      } else {
        updateDocumentData("cover-letter", result.optimizedData);
      }
      toast.success("Document optimized with AI");
    }
    showAIModal.value = false;
  } catch (_error) {
    console.error("Failed to apply AI modal result:", error);
    toast.error("Failed to apply AI changes");
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
        skills: resumeProfileData.skills || [],
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

const handleExport = async (format: string = "pdf") => {
  if (
    !currentDocumentData.value ||
    Object.keys(currentDocumentData.value).length === 0
  ) {
    toast.error("No document data to export");
    return;
  }

  try {
    const documentData = currentDocumentData.value;
    const documentType = activeDocumentType.value;

    if (format === "pdf") {
      // Create a formatted document for PDF export
      const documentContent = formatDocumentForExport(
        documentData,
        documentType,
        selectedTemplate,
      );


      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${documentType === "resume" ? "Resume" : "Cover Letter"} - ${documentData.personalInfo?.name || "Document"}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 10px; }
              .experience-item, .education-item { margin-bottom: 15px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${documentContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    } else if (format === "json") {
      // Export as JSON
      const dataStr = JSON.stringify(documentData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentType}-${documentData.personalInfo?.name?.replace(/\s+/g, "-") || "document"}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }

    toast.success(
      `${documentType} exported successfully as ${format.toUpperCase()}`,
    );
  } catch (_error) {
    console.error("Export failed:", error);
    toast.error("Failed to export document");
  }
};

const formatDocumentForExport = (
  data: any,
  type: "resume" | "cover-letter",
  _template: string,
) => {
  if (type === "resume") {
    return `
      <div class="header">
        <h1>${data.personalInfo?.name || ""}</h1>
        <p>${data.personalInfo?.email || ""} | ${data.personalInfo?.phone || ""}</p>
        <p>${data.personalInfo?.location || ""}</p>
        ${data.personalInfo?.website ? `<p>Website: ${data.personalInfo.website}</p>` : ""}
        ${data.personalInfo?.linkedin ? `<p>LinkedIn: ${data.personalInfo.linkedin}</p>` : ""}
      </div>
      
      ${
        data.summary
          ? `<div class="section">
        <div class="section-title">Professional Summary</div>
        <p>${data.summary}</p>
      </div>`
          : ""
      }
      
      ${
        data.experience?.length
          ? `<div class="section">
        <div class="section-title">Experience</div>
        ${data.experience
          .map(
            (exp) => `
          <div class="experience-item">
            <h3>${exp.title} at ${exp.company}</h3>
            <p><strong>${exp.startDate} - ${exp.endDate || "Present"}</strong> | ${exp.location || ""}</p>
            <p>${exp.description || ""}</p>
          </div>
        `,
          )
          .join("")}
      </div>`
          : ""
      }
      
      ${
        data.education?.length
          ? `<div class="section">
        <div class="section-title">Education</div>
        ${data.education
          .map(
            (edu) => `
          <div class="education-item">
            <h3>${edu.degree} in ${edu.field || ""}</h3>
            <p>${edu.institution} | ${edu.startDate} - ${edu.endDate}</p>
          </div>
        `,
          )
          .join("")}
      </div>`
          : ""
      }
      
      ${
        data.skills?.length
          ? `<div class="section">
        <div class="section-title">Skills</div>
        <p>${data.skills.map((skill) => skill.name).join(", ")}</p>
      </div>`
          : ""
      }
    `;
  } else {
    return `
      <div class="header">
        <h1>Cover Letter</h1>
        <p>${data.personalInfo?.name || ""}</p>
        <p>${data.personalInfo?.email || ""} | ${data.personalInfo?.phone || ""}</p>
        <p>${data.personalInfo?.location || ""}</p>
      </div>
      
      ${
        data.jobInfo?.company
          ? `<div class="section">
        <p><strong>To:</strong> ${data.jobInfo.hiringManager || "Hiring Manager"}<br>
        <strong>Company:</strong> ${data.jobInfo.company}<br>
        <strong>Position:</strong> ${data.jobInfo.position}</p>
      </div>`
          : ""
      }
      
      <div class="section">
        ${data.content?.opening ? `<p>${data.content.opening}</p>` : ""}
        ${data.content?.body ? `<p>${data.content.body}</p>` : ""}
        ${data.content?.closing ? `<p>${data.content.closing}</p>` : ""}
      </div>
      
      <div class="section">
        <p>Sincerely,<br>${data.personalInfo?.name || ""}</p>
      </div>
    `;
  }
};

// Event handler for UnifiedButton to fix type error
const onExportClick = (event: Event) => {
  event.preventDefault?.();
  handleExport();
};

// Lifecycle
onMounted(async () => {
  try {
    // Load any saved document drafts
    if (resumeData && Object.keys(resumeData).length === 0) {
      const savedResumeData = localStorage.getItem("navi-resume-draft");
      if (savedResumeData) {
        const parsed = JSON.parse(savedResumeData);
        updateDocumentData("resume", parsed);
      }
    }

    if (coverLetterData && Object.keys(coverLetterData).length === 0) {
      const savedCoverLetterData = localStorage.getItem(
        "navi-cover-letter-draft",
      );
      if (savedCoverLetterData) {
        const parsed = JSON.parse(savedCoverLetterData);
        updateDocumentData("cover-letter", parsed);
      }
    }

    // Auto-save drafts when data changes
    watch(
      resumeData,
      (newData) => {
        if (newData && Object.keys(newData).length > 0) {
          localStorage.setItem("navi-resume-draft", JSON.stringify(newData));
        }
      },
      { deep: true },
    );

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
  } catch (_error) {
    console.error("Failed to load document versions:", error);
  }
});
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

.ai-status-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-error-600);
  font-size: 0.875rem;
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

  .job-info {
    flex-direction: column;
    text-align: center;
  }

  .ats-score {
    align-self: center;
  }
}
</style>
