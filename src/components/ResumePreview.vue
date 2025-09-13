<template>
  <v-card class="glass-card section-card resume-preview-card" elevation="0">
    <v-card-title class="d-flex align-center pa-4">
      <span class="me-2" aria-hidden="true"><AppIcon name="mdi-file-document-outline" aria-hidden="true" /></span>
      <span>Resume Preview</span>
      <v-spacer />
      <div class="d-flex ga-2">
        <UnifiedButton
          icon-only
          size="sm"
          variant="outline"
          icon="mdi-download"
          aria-label="Download PDF"
          @click="downloadResume"
        />
        <UnifiedButton
          icon-only
          size="sm"
          variant="outline"
          icon="mdi-printer"
          aria-label="Print"
          @click="printResume"
        />
      </div>
    </v-card-title>

    <v-card-text class="pa-0">
      <div
        ref="previewRef"
        class="resume-preview-content"
        :class="templateClass"
      >
        <!-- Header Section -->
        <div v-if="resumeData.personal" class="resume-header pa-6-unified">
          <div class="text-center mb-4">
            <h1 class="text-h3 font-weight-bold mb-2">
              {{ resumeData.personal.firstName }}
              {{ resumeData.personal.lastName }}
            </h1>
            <div class="contact-info d-flex justify-center flex-wrap ga-4 mb-4">
              <div
                v-if="resumeData.personal.email"
                class="d-flex align-center ga-1"
              >
                <AppIcon name="mdi-email" size="16" />
                <span>{{ resumeData.personal.email }}</span>
              </div>
              <div
                v-if="resumeData.personal.phone"
                class="d-flex align-center ga-1"
              >
                <span aria-hidden="true"><AppIcon name="mdi-phone" aria-hidden="true" /></span>
                <span>{{ resumeData.personal.phone }}</span>
              </div>
              <div
                v-if="resumeData.personal.location"
                class="d-flex align-center ga-1"
              >
                <span aria-hidden="true"><AppIcon name="mdi-map-marker" aria-hidden="true" /></span>
                <span>{{ resumeData.personal.location }}</span>
              </div>
              <div
                v-if="resumeData.personal.website"
                class="d-flex align-center ga-1"
              >
                <AppIcon name="mdi-web" size="16" />
                <span>{{ resumeData.personal.website }}</span>
              </div>
              <div
                v-if="resumeData.personal.linkedin"
                class="d-flex align-center ga-1"
              >
                <AppIcon name="mdi-linkedin" size="16" />
                <span>{{ resumeData.personal.linkedin }}</span>
              </div>
              <div
                v-if="resumeData.personal.github"
                class="d-flex align-center ga-1"
              >
                <AppIcon name="mdi-github" size="16" />
                <span>{{ resumeData.personal.github }}</span>
              </div>
            </div>
            <p
              v-if="resumeData.personal.summary"
              class="text-body-1 text-medium-emphasis"
            >
              {{ resumeData.personal.summary }}
            </p>
          </div>
        </div>

        <v-divider />

        <!-- Experience Section -->
        <div
          v-if="resumeData.experience?.length"
          class="resume-section pa-6-unified"
        >
          <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
            <AppIcon name="mdi-briefcase" class="me-2" aria-hidden="true" />
            Experience
          </h2>
          <div
            v-for="(exp, index) in resumeData.experience"
            :key="index"
            class="mb-4"
          >
            <div class="d-flex justify-space-between align-start mb-2">
              <div>
                <h3 class="text-h6 font-weight-semibold">{{ exp.title }}</h3>
                <p class="text-subtitle-1 text-primary">{{ exp.company }}</p>
              </div>
              <div class="text-right">
                <p class="text-body-2 text-medium-emphasis">
                  {{ formatMonthYear(exp.startDate) }} -
                  {{ exp.current ? "Present" : formatMonthYear(exp.endDate) }}
                </p>
                <p v-if="exp.location" class="text-body-2 text-medium-emphasis">
                  {{ exp.location }}
                </p>
              </div>
            </div>
            <p v-if="exp.description" class="text-body-1 mb-2">
              {{ exp.description }}
            </p>
            <ul v-if="exp.achievements?.length" class="achievements-list">
              <li
                v-for="achievement in exp.achievements"
                :key="achievement"
                class="text-body-2 mb-1"
              >
                {{ achievement }}
              </li>
            </ul>
          </div>
        </div>

        <v-divider
          v-if="resumeData.experience?.length && resumeData.skills?.length"
        />

        <!-- Skills Section -->
        <div
          v-if="resumeData.skills?.length"
          class="resume-section pa-6-unified"
        >
          <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
            <AppIcon name="mdi-code-tags" color="primary" class="me-2" />
            Skills
          </h2>
          <div class="d-flex flex-wrap ga-2">
            <UiChip
              v-for="skill in resumeData.skills"
              :key="skill.name || skill"
              classes="chip chip-primary chip-compact"
            >
              {{ skill.name || skill }}
            </UiChip>
          </div>
        </div>

        <v-divider
          v-if="resumeData.skills?.length && resumeData.education?.length"
        />

        <!-- Education Section -->
        <div
          v-if="resumeData.education?.length"
          class="resume-section pa-6-unified"
        >
          <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
            <AppIcon name="mdi-school" color="primary" class="me-2" />
            Education
          </h2>
          <div
            v-for="(edu, index) in resumeData.education"
            :key="index"
            class="mb-3"
          >
            <div class="d-flex justify-space-between align-start">
              <div>
                <h3 class="text-h6 font-weight-semibold">{{ edu.degree }}</h3>
                <p class="text-subtitle-1 text-primary">{{ edu.school }}</p>
                <p v-if="edu.gpa" class="text-body-2">GPA: {{ edu.gpa }}</p>
              </div>
              <div class="text-right">
                <p class="text-body-2 text-medium-emphasis">
                  {{ formatMonthYear(edu.startDate) }} -
                  {{ edu.current ? "Present" : formatMonthYear(edu.endDate) }}
                </p>
                <p v-if="edu.location" class="text-body-2 text-medium-emphasis">
                  {{ edu.location }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-spacer />
      <UnifiedButton
        variant="primary"
        leading-icon="mdi-download"
        @click="downloadResume"
      >
        Download PDF
      </UnifiedButton>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formatMonthYear } from "@/utils/date";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useToast } from "@/composables/useToast";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import UiChip from "@/components/ui/UiChip.vue";

interface Props {
  resumeData?: {
    personal?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      summary?: string;
    };
    experience?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      location?: string;
      description?: string;
      achievements?: string[];
    }>;
    skills?: Array<{ name: string } | string>;
    education?: Array<{
      degree: string;
      school: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      location?: string;
      gpa?: string;
    }>;
  };
  template?: string;
}

const props = withDefaults(defineProps<Props>(), {
  resumeData: () => ({}),
  template: "classic",
});

const { toast } = useToast();
const previewRef = ref<HTMLElement>();

const templateClass = computed(
  () => `resume-template-${(props.template || "classic").toLowerCase()}`,
);

const downloadResume = async () => {
  try {
    if (!previewRef.value) {
      throw new Error("Resume preview element not found");
    }

    // Show loading state
    toast.info("Generating PDF...");

    // Import the export utilities
    const { exportElementToPDF } = await import("@/utils/export.js");

    // Generate PDF from the resume preview
    const filename =
      `${props.resumeData.personal?.firstName || "resume"}_${props.resumeData.personal?.lastName || ""}_resume`.trim();
    const success = await exportElementToPDF(previewRef.value, filename, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    if (success) {
      toast.success("Resume downloaded successfully!");
    } else {
      throw new Error("PDF generation failed");
    }
  } catch (error) {
    console.error("PDF download error:", error);
    toast.error("Failed to download resume. Please try again.");
  }
};

const printResume = () => {
  try {
    if (previewRef.value) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Resume - ${props.resumeData.personal?.firstName} ${props.resumeData.personal?.lastName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .resume-header { text-align: center; margin-bottom: 30px; }
                .contact-info { margin: 20px 0; }
                .contact-info > div { display: inline-block; margin-right: 20px; }
                .resume-section { margin-bottom: 30px; }
                .achievements-list { list-style-type: disc; margin-left: 20px; }
                h1 { color: #1976d2; }
                h2 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${previewRef.value.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  } catch {
    toast.error("Failed to print resume");
  }
};
</script>

<style scoped>
.resume-preview-card {
  max-height: 80vh;
  overflow-y: auto;
}

.resume-preview-content {
  background: white;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.resume-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.contact-info {
  font-size: 0.9rem;
}

.achievements-list {
  list-style-type: disc;
  margin-left: 1.5rem;
}

.resume-section:last-child {
  border-bottom: none;
}

@media print {
  .resume-preview-card {
    box-shadow: none !important;
    border: none !important;
  }

  .v-card-title,
  .v-card-actions {
    display: none !important;
  }

  .resume-preview-content {
  }
}

.v-theme--dark .resume-preview-content {
  background: var(--surface-elevated);
  color: var(--text-primary);
}

.v-theme--dark .resume-header {
  background: linear-gradient(
  );
}

}
.resume-template-modern .resume-header {
  background: linear-gradient(
  );
}

}
.resume-template-elegant .resume-header {
  background: linear-gradient(
  );
}

.resume-template-compact {
}
.resume-template-compact .resume-header {
}
.resume-template-compact .achievements-list {
}
</style>
