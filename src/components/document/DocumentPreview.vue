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
      <UnifiedButton variant="outline" size="sm" @click="refreshPreview">
        Try Again
      </UnifiedButton>
    </div>

    <div v-else class="preview-container">
      <!-- Resume Preview -->
      <div
        v-if="documentType === 'resume'"
        class="resume-preview"
        :class="`template-${template}`"
      >
        <div class="resume-header">
          <div class="personal-info">
            <h1 class="name">
              {{ resolvedData.personal?.firstName }}
              {{ resolvedData.personal?.lastName }}
            </h1>
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
            <div
              v-for="exp in resolvedData.experience"
              :key="exp.title + exp.company"
              class="experience-item"
            >
              <div class="experience-header">
                <div class="position-info">
                  <h3 class="position-title">{{ exp.title }}</h3>
                  <div class="company-name">{{ exp.company }}</div>
                </div>
                <div class="date-location">
                  <div class="employment-dates">
                    {{ formatMonthYear(exp.startDate) }} -
                    {{ exp.current ? "Present" : formatMonthYear(exp.endDate) }}
                  </div>
                  <div v-if="exp.location" class="location">
                    {{ exp.location }}
                  </div>
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
            <div
              v-for="edu in resolvedData.education"
              :key="edu.degree + edu.school"
              class="education-item"
            >
              <div class="education-header">
                <div class="degree-info">
                  <h3 class="degree-title">{{ edu.degree }}</h3>
                  <div class="school-name">{{ edu.school }}</div>
                </div>
                <div class="date-location">
                  <div class="education-dates">
                    {{ formatMonthYear(edu.startDate) }} -
                    {{ formatMonthYear(edu.endDate) }}
                  </div>
                  <div v-if="edu.location" class="location">
                    {{ edu.location }}
                  </div>
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
              <span
                v-for="skill in resolvedData.skills"
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cover Letter Preview -->
      <div
        v-else-if="documentType === 'cover-letter'"
        class="cover-letter-preview"
        :class="`template-${template}`"
      >
        <div class="letter-header">
          <div class="sender-info">
            <div class="sender-name">
              {{ documentData.personalInfo?.name || "Your Name" }}
            </div>
            <div class="sender-contact">
              {{
                documentData.personalInfo?.email || "your.email@example.com"
              }}
              |
              {{ documentData.personalInfo?.phone || "(555) 123-4567" }}
            </div>
            <div class="sender-location">
              {{ documentData.personalInfo?.location || "City, State" }}
            </div>
          </div>
          <div class="letter-date">
            {{ formatMonthYear(new Date().toISOString()) }}
          </div>
        </div>

        <div v-if="documentData.jobInfo?.company" class="recipient-info">
          <div class="recipient-name">
            {{ documentData.jobInfo.hiringManager || "Hiring Manager" }}
          </div>
          <div class="company-name">{{ documentData.jobInfo.company }}</div>
          <div class="position-title">
            {{ documentData.jobInfo.position }} Position
          </div>
        </div>

        <div class="letter-body">
          <div v-if="documentData.content?.opening" class="letter-section">
            <p>{{ resolveTokens(documentData.content.opening) }}</p>
          </div>

          <div v-if="documentData.content?.body" class="letter-section">
            <div
              v-html="
                formatDescription(resolveTokens(documentData.content.body))
              "
            ></div>
          </div>

          <div v-if="documentData.content?.closing" class="letter-section">
            <p>{{ resolveTokens(documentData.content.closing) }}</p>
          </div>
        </div>

        <div class="letter-signature">
          <p>Sincerely,</p>
          <div class="signature-line">
            {{ documentData.personalInfo?.name || "Your Name" }}
          </div>
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
          {{ isFullscreen ? "Exit" : "Fullscreen" }}
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { formatMonthYear } from "@/utils/date";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
const props = defineProps<{
  documentData: any;
  documentType: "resume" | "cover-letter";
  template: string;
  showTokens: boolean;
}>();

// State
const isLoading = ref(true);
const previewError = ref("");
const zoomLevel = ref(1);
const isFullscreen = ref(false);

// Token mapping
const tokenMap = computed(() => ({
  "{{name}}": props.documentData.personalInfo?.name || "Your Name",
  "{{firstName}}":
    props.documentData.personalInfo?.name?.split(" ")[0] || "Your",
  "{{lastName}}":
    props.documentData.personalInfo?.name?.split(" ").slice(1).join(" ") ||
    "Name",
  "{{email}}":
    props.documentData.personalInfo?.email || "your.email@example.com",
  "{{phone}}": props.documentData.personalInfo?.phone || "(555) 123-4567",
  "{{location}}": props.documentData.personalInfo?.location || "City, State",
  "{{website}}": props.documentData.personalInfo?.website || "",
  "{{linkedin}}": props.documentData.personalInfo?.linkedin || "",
  "{{github}}": props.documentData.personalInfo?.github || "",
  "{{company}}": props.documentData.jobInfo?.company || "Company Name",
  "{{position}}": props.documentData.jobInfo?.position || "Position Title",
}));

// Resolved data for resume
const resolvedData = computed(() => {
  if (props.documentType === "resume") {
    return {
      personal: {
        firstName: tokenMap.value["{{firstName}}"],
        lastName: tokenMap.value["{{lastName}}"],
        email: tokenMap.value["{{email}}"],
        phone: tokenMap.value["{{phone}}"],
        location: tokenMap.value["{{location}}"],
        website: tokenMap.value["{{website}}"],
        linkedin: tokenMap.value["{{linkedin}}"],
        github: tokenMap.value["{{github}}"],
        summary: resolveTokens(props.documentData.summary || ""),
      },
      experience: (props.documentData.experience || []).map((exp: any) => ({
        ...exp,
        description: resolveTokens(exp.description || ""),
      })),
      education: props.documentData.education || [],
      skills: (props.documentData.skills || []).map((skill: any) =>
        typeof skill === "string" ? skill : skill.name,
      ),
    };
  }
  return props.documentData;
});

// Methods
const resolveTokens = (text: string): string => {
  if (!text || !props.showTokens) return text;

  let resolved = text;
  Object.entries(tokenMap.value).forEach(([token, value]) => {
    if (value) {
      resolved = resolved.replace(
        new RegExp(token.replace(/[{}]/g, "\\$&"), "g"),
        value,
      );
    }
  });
  return resolved;
};

const formatDescription = (text: string): string => {
  if (!text) return "";

  // Convert bullet points and line breaks to HTML
  return text
    .replace(/\n/g, "<br>")
    .replace(/• /g, "<li>")
    .replace(/\* /g, "<li>")
    .replace(/<li>/g, "</li><li>")
    .replace("</li><li>", "<ul><li>")
    .replace(/(<li>.*)<br>/g, "$1</li>")
    .replace(/<ul><li><\/li>/, "<ul>")
    .replace(/<li>$/, "</li></ul>");
};

const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.25);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.25);
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const refreshPreview = () => {
  generatePreview();
};

const generatePreview = async () => {
  isLoading.value = true;
  previewError.value = "";

  try {
    // Simulate preview generation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validate data
    if (props.documentType === "resume") {
      if (
        !props.documentData.personalInfo?.name &&
        !props.documentData.summary &&
        !props.documentData.experience?.length
      ) {
        throw new Error(
          "No content to preview. Please add some information first.",
        );
      }
    } else if (props.documentType === "cover-letter") {
      if (
        !props.documentData.content?.opening &&
        !props.documentData.content?.body
      ) {
        throw new Error("No cover letter content to preview.");
      }
    }
  } catch (error: any) {
    previewError.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

// Watch for data changes
watch(
  [() => props.documentData, () => props.template],
  () => {
    generatePreview();
  },
  { deep: true },
);

// Initialize
onMounted(() => {
  generatePreview();
});
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

.resume-preview {
  background: white;
  font-family: "Arial", sans-serif;
}

.resume-header {
}

.personal-info .name {
  font-weight: bold;
  text-transform: uppercase;
}

.contact-details,
.online-presence {
  display: flex;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
}

.resume-section {
}

.section-title {
  font-weight: bold;
  text-transform: uppercase;
}

.section-content {
}

.summary-text {
  text-align: justify;
}

.experience-item,
.education-item {
}

.experience-header,
.education-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.position-title,
.degree-title {
  font-weight: bold;
}

.company-name,
.school-name {
  font-style: italic;
}

.date-location {
  text-align: right;
}

.employment-dates,
.education-dates {
  font-weight: bold;
}

.location {
}

.experience-description {
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
}

.skill-tag {
}

.cover-letter-preview {
  background: white;
  font-family: "Arial", sans-serif;
}

.letter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sender-info {
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-weight: bold;
}

.sender-contact,
.sender-location {
}

.letter-date {
}

.recipient-info {
}

.recipient-name {
  font-weight: bold;
}

.company-name {
  font-weight: bold;
}

.letter-body {
}

.letter-section {
}

.letter-section p {
  text-align: justify;
}

.letter-signature {
}

.letter-signature p {
}

.signature-line {
  font-weight: bold;
  display: inline-block;
}

.template-modern .resume-header {
}

.template-modern .section-title {
}

.template-creative .resume-header {
}

.template-creative .section-title {
}

.template-gaming-pro .resume-header {
  color: white;
  border-bottom: none;
}

.template-gaming-pro .name {
  color: white;
}

.template-gaming-pro .section-title {
}

.preview-controls {
  position: sticky;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-surface);
}

.zoom-controls {
  display: flex;
  align-items: center;
}

.zoom-level {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-align: center;
}

.preview-actions {
  display: flex;
}

.document-preview.fullscreen {
  position: fixed;
  background: var(--surface-base);
}

@keyframes spin {
  from {
  }
  to {
  }
}

  .resume-preview,
  .cover-letter-preview {
  }

  .experience-header,
  .education-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-location {
    text-align: left;
  }

  .letter-header {
    flex-direction: column;
  }
}

@media print {
  .preview-controls {
    display: none;
  }

  .preview-container {
    overflow: visible;
  }

  .resume-preview,
  .cover-letter-preview {
    max-width: none;
  }
}
</style>
