<template>
  <div class="ai-tools-workspace">
    <!-- Profile Integration Banner -->
    <div v-if="profileData" class="profile-integration-banner">
      <div class="banner-content">
        <AppIcon name="mdi-account-check-outline" class="banner-icon" />
        <div class="banner-text">
          <h4>Profile Integration Active</h4>
          <p>
            AI will use your profile data ({{
              Math.round(profileCompleteness)
            }}% complete) to provide personalized suggestions
          </p>
        </div>
        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-refresh"
          @click="refreshProfileData"
        >
          Refresh
        </UnifiedButton>
      </div>
    </div>

    <!-- Job Description Input -->
    <div class="job-description-section">
      <div class="section-header">
        <h3 class="section-title">
          <AppIcon name="mdi-briefcase-search-outline" />
          Job Description
        </h3>
        <div class="section-actions">
          <UnifiedButton
            v-if="jobDescription.trim()"
            variant="outline"
            size="sm"
            leading-icon="mdi-refresh"
            @click="analyzeJobDescription"
          >
            Re-analyze
          </UnifiedButton>
          <UnifiedButton
            v-if="profileData && jobDescription.trim()"
            variant="gaming"
            size="sm"
            leading-icon="mdi-account-sync"
            @click="aiMatchJobToProfile"
          >
            AI + Profile Match
          </UnifiedButton>
        </div>
      </div>

      <div class="job-input-container">
        <textarea
          v-model="localJobDescription"
          class="job-description-input glass-input"
          placeholder="Paste the job description here to get AI-powered insights and tailoring suggestions..."
          rows="8"
          :disabled="!aiReady"
        />

        <div v-if="jobAnalysis" class="job-analysis">
          <div class="analysis-item">
            <span class="analysis-label">Key Requirements:</span>
            <div class="analysis-tags">
              <span
                v-for="req in jobAnalysis.requirements"
                :key="req"
                class="tag"
              >
                {{ req }}
              </span>
            </div>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">Preferred Skills:</span>
            <div class="analysis-tags">
              <span
                v-for="skill in jobAnalysis.skills"
                :key="skill"
                class="tag skill-tag"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Tools Grid -->
    <div class="ai-tools-grid">
      <!-- Document Analysis Tool -->
      <div class="tool-card">
        <div class="tool-header">
          <AppIcon name="mdi-file-find-outline" />
          <h4>Document Analysis</h4>
        </div>
        <p class="tool-description">
          Analyze your resume and cover letter for ATS compatibility, keyword
          optimization, and overall strength.
        </p>
        <div class="tool-actions">
          <UnifiedButton
            variant="primary"
            size="sm"
            leading-icon="mdi-magnify"
            :disabled="!aiReady || analyzing"
            :loading="analyzing"
            @click="analyzeDocuments"
          >
            Analyze Documents
          </UnifiedButton>
        </div>
        <div v-if="documentAnalysis" class="analysis-results">
          <div class="score-item">
            <span class="score-label">ATS Score:</span>
            <div class="score-bar">
              <div
                class="score-fill"
                :style="{ width: documentAnalysis.atsScore + '%' }"
                :class="getScoreClass(documentAnalysis.atsScore)"
              ></div>
            </div>
            <span class="score-value">{{ documentAnalysis.atsScore }}%</span>
          </div>
          <div class="score-item">
            <span class="score-label">Keyword Match:</span>
            <div class="score-bar">
              <div
                class="score-fill"
                :style="{ width: documentAnalysis.keywordMatch + '%' }"
                :class="getScoreClass(documentAnalysis.keywordMatch)"
              ></div>
            </div>
            <span class="score-value">{{ documentAnalysis.keywordMatch }}%</span>
          </div>
        </div>
      </div>

      <!-- Content Enhancement Tool -->
      <div class="tool-card">
        <div class="tool-header">
          <AppIcon name="mdi-auto-fix" />
          <h4>Content Enhancement</h4>
        </div>
        <p class="tool-description">
          Improve your document content with AI-powered suggestions for better
          impact and clarity.
        </p>
        <div class="tool-actions">
          <UnifiedButton
            variant="gaming"
            size="sm"
            leading-icon="mdi-sparkles"
            :disabled="!aiReady || enhancing"
            :loading="enhancing"
            @click="enhanceContent"
          >
            Enhance Content
          </UnifiedButton>
        </div>
        <div v-if="suggestions.length" class="suggestions-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="suggestion-item"
          >
            <div class="suggestion-content">
              <div class="suggestion-text">{{ suggestion.text }}</div>
              <div class="suggestion-meta">{{ suggestion.category }}</div>
            </div>
            <UnifiedButton
              variant="outline"
              size="xs"
              @click="applySuggestion(suggestion)"
            >
              Apply
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Job Tailoring Tool -->
      <div class="tool-card">
        <div class="tool-header">
          <AppIcon name="mdi-target" />
          <h4>Job Tailoring</h4>
        </div>
        <p class="tool-description">
          Automatically tailor your documents to match the specific job
          requirements and company culture.
        </p>
        <div class="tool-actions">
          <UnifiedButton
            variant="primary"
            size="sm"
            leading-icon="mdi-target"
            :disabled="!aiReady || tailoring || !jobDescription.trim()"
            :loading="tailoring"
            @click="handleTailorDocuments"
          >
            Tailor Documents
          </UnifiedButton>
        </div>
        <div v-if="tailoringResults" class="tailoring-results">
          <div class="result-item">
            <span class="result-label">Resume Changes:</span>
            <span class="result-value">{{
              tailoringResults.resumeChanges
            }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Cover Letter Changes:</span>
            <span class="result-value">{{
              tailoringResults.coverLetterChanges
            }}</span>
          </div>
        </div>
      </div>

      <!-- Skills Optimization Tool -->
      <div class="tool-card">
        <div class="tool-header">
          <AppIcon name="mdi-chart-line-variant" />
          <h4>Skills Optimization</h4>
        </div>
        <p class="tool-description">
          Optimize your skills section based on industry trends and job
          requirements.
        </p>
        <div class="tool-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="mdi-lightbulb"
            :disabled="!aiReady || optimizingSkills"
            :loading="optimizingSkills"
            @click="optimizeSkills"
          >
            Optimize Skills
          </UnifiedButton>
        </div>
        <div v-if="skillSuggestions.length" class="skill-suggestions">
          <div class="suggested-skills">
            <span class="suggestions-label">Suggested skills:</span>
            <div class="skill-tags">
              <span
                v-for="skill in skillSuggestions"
                :key="skill"
                class="skill-tag clickable"
                @click="addSkill(skill)"
              >
                <span>{{ skill }}</span>
                <AppIcon name="mdi-plus-circle" size="14" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Insights Panel -->
    <div v-if="hasInsights" class="ai-insights-panel">
      <div class="insights-header">
        <h3 class="insights-title">
          <AppIcon name="mdi-brain" />
          AI Insights
        </h3>
        <UnifiedButton
          variant="ghost"
          size="sm"
          leading-icon="mdi-refresh"
          @click="refreshInsights"
        >
          Refresh
        </UnifiedButton>
      </div>

      <div class="insights-content">
        <div v-for="insight in insights" :key="insight.id" class="insight-item">
          <div class="insight-header">
            <AppIcon :name="insight.icon" />
            <span class="insight-type">{{ insight.type }}</span>
            <span class="insight-priority" :class="insight.priority">{{
              insight.priority
            }}</span>
          </div>
          <div class="insight-message">{{ insight.message }}</div>
          <div v-if="insight.action" class="insight-action">
            <UnifiedButton
              variant="outline"
              size="xs"
              @click="executeInsightAction(insight)"
            >
              {{ insight.action }}
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { refwatch } from "vue";
import { useToast } from "@/composables/useToast";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
const _props = defineProps<{
  resumeData: any;
  coverLetterData: any;
  jobDescription: string;
  aiReady: boolean;
  profileData?: any;
  profileCompleteness?: number;
}>();

// Emits
const _emit = defineEmits<{
  "update-job-description": [string];
  "apply-suggestions": [any[]];
  "tailor-documents": [];
  "profile-enhanced-suggestion": [any];
}>();

const toast = useToast();

// State
const localJobDescription = ref(props.jobDescription);
const analyzing = ref(false);
const enhancing = ref(false);
const tailoring = ref(false);
const optimizingSkills = ref(false);

const jobAnalysis = ref<{
  requirements: string[];
  skills: string[];
} | null>(null);

const documentAnalysis = ref<{
  atsScore: number;
  keywordMatch: number;
} | null>(null);

const suggestions = ref<
  Array<{
    id: string;
    text: string;
    category: string;
    field?: string;
  }>
>([]);

const tailoringResults = ref<{
  resumeChanges: number;
  coverLetterChanges: number;
} | null>(null);

const skillSuggestions = ref<string[]>([]);

const insights = ref<
  Array<{
    id: string;
    type: string;
    priority: "high" | "medium" | "low";
    icon: string;
    message: string;
    action?: string;
  }>
>([]);

// Computed
const hasInsights = computed(() => insights.value.length > 0);

// Watchers
watch(
  () => localJobDescription.value,
  (value) => {
    emit("update-job-description", value);
  },
);

// Methods
const analyzeJobDescription = async () => {
  if (!props.aiReady || !localJobDescription.value.trim()) return;

  analyzing.value = true;
  try {
    // Simulate AI job analysis
    await new Promise((resolve) => setTimeout(resolve, 1500));

    jobAnalysis.value = {
      requirements: [
        "5+ years experience",
        "Team leadership",
        "Agile methodology",
      ],
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "AWS"],
    };

    toast.success("Job description analyzed successfully");
  } catch (_error) {
    toast.error("Failed to analyze job description");
  } finally {
    analyzing.value = false;
  }
};

const analyzeDocuments = async () => {
  if (!props.aiReady) return;

  analyzing.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    documentAnalysis.value = {
      atsScore: Math.floor(Math.random() * 30) + 70,
      keywordMatch: Math.floor(Math.random() * 25) + 60,
    };

    toast.success("Documents analyzed successfully");
  } catch (_error) {
    toast.error("Failed to analyze documents");
  } finally {
    analyzing.value = false;
  }
};

const enhanceContent = async () => {
  if (!props.aiReady) return;

  enhancing.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1800));

    suggestions.value = [
      {
        id: "1",
        text: "Consider adding quantifiable metrics to your experience descriptions",
        category: "Experience",
        field: "experience",
      },
      {
        id: "2",
        text: "Your summary could be more impactful with specific achievements",
        category: "Summary",
        field: "summary",
      },
      {
        id: "3",
        text: "Include more relevant keywords from the job description",
        category: "Keywords",
        field: "skills",
      },
    ];

    toast.success("Content enhancement suggestions generated");
  } catch (_error) {
    toast.error("Failed to generate suggestions");
  } finally {
    enhancing.value = false;
  }
};

const handleTailorDocuments = async () => {
  if (!props.aiReady || !localJobDescription.value.trim()) return;

  tailoring.value = true;
  try {
    emit("tailor-documents");
    await new Promise((resolve) => setTimeout(resolve, 2500));

    tailoringResults.value = {
      resumeChanges: Math.floor(Math.random() * 8) + 3,
      coverLetterChanges: Math.floor(Math.random() * 5) + 2,
    };

    toast.success("Documents tailored successfully");
  } catch (_error) {
    toast.error("Failed to tailor documents");
  } finally {
    tailoring.value = false;
  }
};

const optimizeSkills = async () => {
  if (!props.aiReady) return;

  optimizingSkills.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    skillSuggestions.value = [
      "Docker",
      "Kubernetes",
      "GraphQL",
      "MongoDB",
      "Jest",
    ];

    toast.success("Skill optimization complete");
  } catch (_error) {
    toast.error("Failed to optimize skills");
  } finally {
    optimizingSkills.value = false;
  }
};

const applySuggestion = (suggestion: any) => {
  emit("apply-suggestions", [suggestion]);
  suggestions.value = suggestions.value.filter((s) => s.id !== suggestion.id);
  toast.success("Suggestion applied");
};

const addSkill = (skill: string) => {
  // This would be handled by the parent component
  toast.success(`Added skill: ${skill}`);
  skillSuggestions.value = skillSuggestions.value.filter((s) => s !== skill);
};

const getScoreClass = (score: number) => {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
};

const refreshInsights = () => {
  // Generate fresh insights
  toast.info("Refreshing AI insights...");
};

const executeInsightAction = (insight: any) => {
  toast.info(`Executing action: ${insight.action}`);
};

// Profile Integration Methods
const refreshProfileData = () => {
  emit("profile-enhanced-suggestion", { type: "refresh-profile" });
  toast.info("Refreshing profile data...");
};

const aiMatchJobToProfile = async () => {
  if (!props.aiReady || !props.profileData || !localJobDescription.value.trim())
    return;

  analyzing.value = true;
  try {
    // Simulate AI-powered job-to-profile matching
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const matchAnalysis = {
      skillMatch: Math.floor(Math.random() * 40 + 60),
      experienceMatch: Math.floor(Math.random() * 30 + 70),
      missingSkills: ["Docker", "Kubernetes", "GraphQL"].slice(
        0,
        Math.floor(Math.random() * 3),
      ),
      strengthAreas: [
        "Gaming Industry Experience",
        "Team Leadership",
        "Technical Skills",
      ],
      recommendations: [
        "Highlight your gaming project experience",
        "Emphasize leadership roles in gaming teams",
        "Add specific technical achievements",
      ],
    };

    emit("profile-enhanced-suggestion", {
      type: "job-profile-match",
      data: matchAnalysis,
    });

    toast.success("AI profile matching complete!");
  } catch (_error) {
    console.error("Profile matching failed:", error);
    toast.error("Profile matching analysis failed");
  } finally {
    analyzing.value = false;
  }
};

// Initialize
if (props.jobDescription.trim()) {
  analyzeJobDescription();
}
</script>

<style scoped>
.ai-tools-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.profile-integration-banner {
  background: linear-gradient(
    135deg,
    var(--color-primary-50),
    var(--color-success-50)
  );
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.banner-icon {
  color: var(--color-primary-600);
  font-size: 1.5rem;
}

.banner-text {
  flex: 1;
}

.banner-text h4 {
  margin: 0 0 var(--spacing-1) 0;
  color: var(--color-primary-800);
  font-weight: 600;
}

.banner-text p {
  margin: 0;
  color: var(--color-primary-700);
  font-size: 0.875rem;
}

.job-description-section {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.job-input-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.job-description-input {
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.job-analysis {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--surface-base);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.analysis-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.analysis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1-5);
}

.tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.skill-tag {
  background: var(--color-gaming-100);
  color: var(--color-gaming-700);
}

.ai-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-5);
}

.tool-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  transition: all var(--duration-normal);
}

.tool-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-md);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.tool-header h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.tool-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin-bottom: var(--spacing-4);
}

.tool-actions {
  margin-bottom: var(--spacing-4);
}

.analysis-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.score-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.score-label {
  min-width: 100px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.score-bar {
  flex: 1;
  height: 8px;
  background: var(--surface-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-normal);
}

.score-fill.high {
  background: var(--color-success-500);
}

.score-fill.medium {
  background: var(--color-warning-500);
}

.score-fill.low {
  background: var(--color-error-500);
}

.score-value {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--surface-base);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.suggestion-content {
  flex: 1;
}

.suggestion-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
}

.suggestion-meta {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.tailoring-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.result-label {
  color: var(--text-secondary);
}

.result-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
}

.skill-suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.suggestions-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.skill-tag.clickable {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.skill-tag.clickable:hover {
  background: var(--color-gaming-200);
  transform: translateY(-1px);
}

.ai-insights-panel {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.insights-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.insight-item {
  padding: var(--spacing-4);
  background: var(--surface-base);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.insight-type {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.insight-priority {
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.insight-priority.high {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.insight-priority.medium {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.insight-priority.low {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.insight-message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-3);
}

.insight-action {
  display: flex;
  justify-content: flex-end;
}

  .ai-tools-grid {
  }

  .score-item {
    flex-direction: column;
    align-items: stretch;
  }

  .score-label {
    min-width: auto;
  }
}
</style>
