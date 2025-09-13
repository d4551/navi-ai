<template>
  <div class="ai-content-optimizer">
    <!-- AI Optimization Panel -->
    <div
      v-if="showPanel"
      class="optimization-panel"
      :class="{ 'is-floating': isFloating }"
    >
      <div class="panel-header">
        <div class="panel-title">
          <AppIcon name="mdi-brain" class="ai-icon" />
          <span>AI Content Optimizer</span>
          <div class="ai-status" :class="aiStatusClass">
            <div class="status-dot"></div>
            {{ aiStatusText }}
          </div>
        </div>
        <div class="panel-actions">
          <UnifiedButton
            variant="ghost"
            size="xs"
            :leading-icon="
              isFloating ? 'mdi-dock-window' : 'mdi-window-open-variant'
            "
            @click="toggleFloating"
          />
          <UnifiedButton
            variant="ghost"
            size="xs"
            leading-icon="mdi-close"
            @click="closePanel"
          />
        </div>
      </div>

      <div class="panel-content">
        <!-- Optimization Tabs -->
        <div class="optimization-tabs">
          <button
            v-for="tab in optimizationTabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeOptimizationTab === tab.id }"
            @click="activeOptimizationTab = tab.id"
          >
            <AppIcon :name="tab.icon" />
            <span>{{ tab.label }}</span>
            <div v-if="tab.count > 0" class="tab-count">{{ tab.count }}</div>
          </button>
        </div>

        <!-- Content Suggestions -->
        <div
          v-if="activeOptimizationTab === 'suggestions'"
          class="optimization-content"
        >
          <div class="suggestions-header">
            <h4>AI Suggestions</h4>
            <UnifiedButton
              variant="primary"
              size="xs"
              leading-icon="mdi-refresh"
              :loading="isGeneratingSuggestions"
              @click="generateSuggestions"
            >
              Refresh
            </UnifiedButton>
          </div>

          <div class="suggestions-list">
            <div
              v-for="suggestion in contentSuggestions"
              :key="suggestion.id"
              class="suggestion-item"
              :class="suggestion.priority"
            >
              <div class="suggestion-header">
                <div class="suggestion-meta">
                  <AppIcon :name="suggestion.icon" />
                  <span class="suggestion-type">{{ suggestion.type }}</span>
                  <div class="priority-badge" :class="suggestion.priority">
                    {{ suggestion.priority }}
                  </div>
                </div>
                <div class="suggestion-actions">
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="mdi-check"
                    @click="applySuggestion(suggestion)"
                  />
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="mdi-close"
                    @click="dismissSuggestion(suggestion.id)"
                  />
                </div>
              </div>
              <div class="suggestion-content">
                <p class="suggestion-text">{{ suggestion.description }}</p>
                <div v-if="suggestion.example" class="suggestion-example">
                  <strong>Example:</strong> {{ suggestion.example }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Keyword Analysis -->
        <div
          v-else-if="activeOptimizationTab === 'keywords'"
          class="optimization-content"
        >
          <div class="keywords-analysis">
            <h4>Keyword Analysis</h4>
            <div class="analysis-grid">
              <div class="analysis-card">
                <div class="card-header">
                  <AppIcon name="mdi-target" />
                  <span>Job Match Score</span>
                </div>
                <div class="score-display">
                  <div
                    class="score-circle"
                    :class="getScoreClass(keywordMatchScore)"
                  >
                    <span class="score-value">{{ keywordMatchScore }}%</span>
                  </div>
                </div>
              </div>

              <div class="analysis-card">
                <div class="card-header">
                  <AppIcon name="mdi-eye" />
                  <span>ATS Compatibility</span>
                </div>
                <div class="score-display">
                  <div class="score-circle" :class="getScoreClass(atsScore)">
                    <span class="score-value">{{ atsScore }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="keywords-section">
              <h5>Missing Keywords</h5>
              <div class="keywords-list">
                <span
                  v-for="keyword in missingKeywords"
                  :key="keyword"
                  class="keyword-tag missing"
                  @click="suggestKeywordPlacement(keyword)"
                >
                  {{ keyword }}
                  <AppIcon name="mdi-plus" />
                </span>
              </div>
            </div>

            <div class="keywords-section">
              <h5>Optimized Keywords</h5>
              <div class="keywords-list">
                <span
                  v-for="keyword in optimizedKeywords"
                  :key="keyword"
                  class="keyword-tag optimized"
                >
                  {{ keyword }}
                  <AppIcon name="mdi-check" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Writing Analysis -->
        <div
          v-else-if="activeOptimizationTab === 'writing'"
          class="optimization-content"
        >
          <div class="writing-analysis">
            <h4>Writing Analysis</h4>

            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Reading Level</div>
                <div class="metric-value">
                  {{ writingMetrics.readingLevel }}
                </div>
                <div
                  class="metric-indicator"
                  :class="getReadingLevelClass()"
                ></div>
              </div>

              <div class="metric-item">
                <div class="metric-label">Sentence Length</div>
                <div class="metric-value">
                  {{ writingMetrics.avgSentenceLength }} words
                </div>
                <div
                  class="metric-indicator"
                  :class="getSentenceLengthClass()"
                ></div>
              </div>

              <div class="metric-item">
                <div class="metric-label">Passive Voice</div>
                <div class="metric-value">
                  {{ writingMetrics.passiveVoicePercent }}%
                </div>
                <div
                  class="metric-indicator"
                  :class="getPassiveVoiceClass()"
                ></div>
              </div>
            </div>

            <div class="writing-suggestions">
              <h5>Writing Improvements</h5>
              <div class="writing-suggestion-list">
                <div
                  v-for="suggestion in writingSuggestions"
                  :key="suggestion.id"
                  class="writing-suggestion-item"
                >
                  <div class="suggestion-icon" :class="suggestion.type">
                    <AppIcon :name="suggestion.icon" />
                  </div>
                  <div class="suggestion-details">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-description">
                      {{ suggestion.description }}
                    </div>
                  </div>
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="mdi-auto-fix"
                    @click="applyWritingSuggestion(suggestion)"
                  >
                    Fix
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Analysis -->
        <div
          v-else-if="activeOptimizationTab === 'performance'"
          class="optimization-content"
        >
          <div class="performance-analysis">
            <h4>Document Performance</h4>

            <!-- Overall Score -->
            <div class="overall-score">
              <div
                class="score-circle large"
                :class="getScoreClass(overallScore)"
              >
                <span class="score-value">{{ overallScore }}</span>
                <span class="score-label">Overall Score</span>
              </div>
              <div class="score-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Content Quality</span>
                  <div class="breakdown-bar">
                    <div
                      class="bar-fill"
                      :style="{ width: contentQualityScore + '%' }"
                    ></div>
                  </div>
                  <span class="breakdown-value">{{ contentQualityScore }}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">ATS Optimization</span>
                  <div class="breakdown-bar">
                    <div
                      class="bar-fill"
                      :style="{ width: atsScore + '%' }"
                    ></div>
                  </div>
                  <span class="breakdown-value">{{ atsScore }}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Keyword Density</span>
                  <div class="breakdown-bar">
                    <div
                      class="bar-fill"
                      :style="{ width: keywordDensityScore + '%' }"
                    ></div>
                  </div>
                  <span class="breakdown-value">{{ keywordDensityScore }}%</span>
                </div>
              </div>
            </div>

            <!-- Performance Tips -->
            <div class="performance-tips">
              <h5>Quick Wins</h5>
              <div class="tips-list">
                <div
                  v-for="tip in performanceTips"
                  :key="tip.id"
                  class="tip-item"
                  :class="tip.impact"
                >
                  <div class="tip-impact">{{ tip.impact }}</div>
                  <div class="tip-content">
                    <div class="tip-title">{{ tip.title }}</div>
                    <div class="tip-description">{{ tip.description }}</div>
                  </div>
                  <UnifiedButton
                    variant="primary"
                    size="xs"
                    @click="applyTip(tip)"
                  >
                    Apply
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <UnifiedButton
      v-if="!showPanel && aiEnabled"
      class="ai-fab"
      variant="primary"
      size="lg"
      leading-icon="mdi-brain"
      @click="openPanel"
    >
      AI Optimize
    </UnifiedButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useToast } from "@/composables/useToast";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

interface ContentSuggestion {
  id: string;
  type: string;
  priority: "high" | "medium" | "low";
  icon: string;
  description: string;
  example?: string;
  target: string;
  action: string;
}

interface WritingSuggestion {
  id: string;
  type: "grammar" | "style" | "clarity";
  icon: string;
  title: string;
  description: string;
  target: string;
  replacement: string;
}

interface PerformanceTip {
  id: string;
  impact: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
}

const props = defineProps<{
  documentContent: any;
  jobDescription?: string;
  aiEnabled?: boolean;
  isFloating?: boolean;
}>();

const emit = defineEmits<{
  "apply-suggestion": [suggestion: ContentSuggestion];
  "apply-writing-fix": [suggestion: WritingSuggestion];
  "apply-tip": [tip: PerformanceTip];
  "toggle-floating": [];
}>();

const toast = useToast();

// State
const showPanel = ref(false);
const activeOptimizationTab = ref("suggestions");
const isGeneratingSuggestions = ref(false);

// Mock data - in real implementation, these would come from AI analysis
const contentSuggestions = ref<ContentSuggestion[]>([
  {
    id: "1",
    type: "Impact Metric",
    priority: "high",
    icon: "mdi-trending-up",
    description:
      "Add quantifiable achievements to make your experience more compelling",
    example: "Increased team productivity by 25%",
    target: "experience",
    action: "add-metrics",
  },
  {
    id: "2",
    type: "Action Verb",
    priority: "medium",
    icon: "mdi-flash",
    description:
      "Use stronger action verbs to make your accomplishments more impactful",
    example: "Spearheaded instead of Worked on",
    target: "experience",
    action: "improve-verbs",
  },
  {
    id: "3",
    type: "Industry Keywords",
    priority: "high",
    icon: "mdi-key",
    description:
      "Include more relevant industry keywords from the job description",
    target: "summary",
    action: "add-keywords",
  },
]);

const writingSuggestions = ref<WritingSuggestion[]>([
  {
    id: "1",
    type: "grammar",
    icon: "mdi-spellcheck",
    title: "Grammar Correction",
    description: "Fix passive voice usage in experience descriptions",
    target: "experience-2",
    replacement: "Led the implementation of...",
  },
  {
    id: "2",
    type: "style",
    icon: "mdi-format-text",
    title: "Style Improvement",
    description: "Use parallel structure in bullet points",
    target: "experience-1",
    replacement: "Developed, Implemented, Managed",
  },
]);

const performanceTips = ref<PerformanceTip[]>([
  {
    id: "1",
    impact: "high",
    title: "Add Skills Section",
    description: "Include a dedicated skills section to improve ATS scanning",
    action: "add-skills-section",
  },
  {
    id: "2",
    impact: "medium",
    title: "Optimize Summary Length",
    description:
      "Expand your professional summary to 3-4 sentences for better impact",
    action: "expand-summary",
  },
]);

// Computed properties
const optimizationTabs = computed(() => [
  {
    id: "suggestions",
    label: "Suggestions",
    icon: "mdi-lightbulb",
    count: contentSuggestions.value.length,
  },
  {
    id: "keywords",
    label: "Keywords",
    icon: "mdi-key",
    count: missingKeywords.value.length,
  },
  {
    id: "writing",
    label: "Writing",
    icon: "mdi-pencil",
    count: writingSuggestions.value.length,
  },
  {
    id: "performance",
    label: "Performance",
    icon: "mdi-chart-line",
    count: performanceTips.value.length,
  },
]);

const aiStatusClass = computed(() => {
  if (isGeneratingSuggestions.value) return "analyzing";
  return props.aiEnabled ? "ready" : "disabled";
});

const aiStatusText = computed(() => {
  if (isGeneratingSuggestions.value) return "Analyzing...";
  return props.aiEnabled ? "Ready" : "Disabled";
});

// Mock analysis data
const keywordMatchScore = ref(72);
const atsScore = ref(85);
const contentQualityScore = ref(78);
const keywordDensityScore = ref(68);
const overallScore = computed(() =>
  Math.round(
    (keywordMatchScore.value + atsScore.value + contentQualityScore.value) / 3,
  ),
);

const missingKeywords = ref([
  "JavaScript",
  "React",
  "TypeScript",
  "Node.js",
  "AWS",
]);
const optimizedKeywords = ref([
  "Vue.js",
  "Frontend",
  "Web Development",
  "UI/UX",
]);

const writingMetrics = ref({
  readingLevel: "Professional",
  avgSentenceLength: 18,
  passiveVoicePercent: 12,
});

// Methods
function openPanel() {
  showPanel.value = true;
  generateSuggestions();
}

function closePanel() {
  showPanel.value = false;
}

function toggleFloating() {
  emit("toggle-floating");
}

async function generateSuggestions() {
  isGeneratingSuggestions.value = true;

  try {
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In real implementation, this would call your AI service
    toast.success("Content analysis complete");
  } catch (error) {
    toast.error("Failed to generate suggestions");
  } finally {
    isGeneratingSuggestions.value = false;
  }
}

function applySuggestion(suggestion: ContentSuggestion) {
  emit("apply-suggestion", suggestion);
  toast.success("Suggestion applied");

  // Remove applied suggestion
  const index = contentSuggestions.value.findIndex(
    (s) => s.id === suggestion.id,
  );
  if (index > -1) {
    contentSuggestions.value.splice(index, 1);
  }
}

function dismissSuggestion(suggestionId: string) {
  const index = contentSuggestions.value.findIndex(
    (s) => s.id === suggestionId,
  );
  if (index > -1) {
    contentSuggestions.value.splice(index, 1);
  }
}

function applyWritingSuggestion(suggestion: WritingSuggestion) {
  emit("apply-writing-fix", suggestion);
  toast.success("Writing improvement applied");
}

function applyTip(tip: PerformanceTip) {
  emit("apply-tip", tip);
  toast.success("Performance tip applied");
}

function suggestKeywordPlacement(keyword: string) {
  toast.info(
    `Consider adding "${keyword}" to your summary or experience sections`,
  );
}

function getScoreClass(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function getReadingLevelClass(): string {
  return "good"; // Mock implementation
}

function getSentenceLengthClass(): string {
  const length = writingMetrics.value.avgSentenceLength;
  if (length <= 20) return "good";
  if (length <= 25) return "fair";
  return "poor";
}

function getPassiveVoiceClass(): string {
  const percent = writingMetrics.value.passiveVoicePercent;
  if (percent <= 10) return "excellent";
  if (percent <= 20) return "good";
  return "poor";
}

// Watch for content changes to trigger re-analysis
watch(
  () => props.documentContent,
  () => {
    if (showPanel.value) {
      generateSuggestions();
    }
  },
  { deep: true },
);
</script>

<style scoped>
.ai-content-optimizer {
  position: relative;
}

.optimization-panel {
  position: fixed;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  overflow: hidden;
}

.optimization-panel.is-floating {
  position: fixed;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(
  );
}

.panel-title {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.ai-icon {
}

.ai-status {
  display: flex;
  align-items: center;
}

.ai-status.ready {
}

.ai-status.analyzing {
}

.ai-status.disabled {
}

.status-dot {
  background: currentColor;
}

.ai-status.analyzing .status-dot {
}

.panel-actions {
  display: flex;
}

.panel-content {
  overflow-y: auto;
}

.optimization-tabs {
  display: flex;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.tab-btn:hover {
}

.tab-btn.active {
}

.tab-count {
  display: flex;
  align-items: center;
  justify-content: center;
}

.optimization-content {
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

  color: var(--text-primary);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
}

.suggestion-item {
}

.suggestion-item.high {
}

.suggestion-item.medium {
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.suggestion-meta {
  display: flex;
  align-items: center;
}

.suggestion-type {
  color: var(--text-primary);
}

.priority-badge {
  text-transform: uppercase;
}

.priority-badge.high {
}

.priority-badge.medium {
}

.priority-badge.low {
}

.suggestion-actions {
  display: flex;
}

.suggestion-content {
  color: var(--text-secondary);
}

.suggestion-example {
  color: var(--text-primary);
}

.analysis-grid {
  display: grid;
}

.analysis-card {
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.score-display {
  display: flex;
  justify-content: center;
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-circle.large {
  flex-direction: column;
}

.score-label {
}

.score-circle.excellent {
  background: linear-gradient(
  );
}
.score-circle.good {
  background: linear-gradient(
  );
}
.score-circle.fair {
  background: linear-gradient(
  );
}
.score-circle.poor {
  background: linear-gradient(
  );
}

.keywords-section {
}

  color: var(--text-primary);
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
}

.keyword-tag {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.keyword-tag.missing {
}

.keyword-tag.missing:hover {
}

.keyword-tag.optimized {
}

.metrics-grid {
  display: grid;
}

.metric-item {
  text-align: center;
}

.metric-label {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.metric-value {
  color: var(--text-primary);
}

.metric-indicator {
}

.metric-indicator.excellent {
}
.metric-indicator.good {
}
.metric-indicator.fair {
}
.metric-indicator.poor {
}

.overall-score {
  display: flex;
  align-items: center;
}

.score-breakdown {
}

.breakdown-item {
  display: flex;
  align-items: center;
}

.breakdown-label {
  color: var(--text-secondary);
}

.breakdown-bar {
  overflow: hidden;
}

.bar-fill {
  background: linear-gradient(
  );
}

.breakdown-value {
  color: var(--text-primary);
  text-align: right;
}

.tips-list {
  display: flex;
  flex-direction: column;
}

.tip-item {
  display: flex;
  align-items: center;
}

.tip-impact {
  text-transform: uppercase;
  white-space: nowrap;
}

.tip-item.high .tip-impact {
}

.tip-item.medium .tip-impact {
}

.tip-item.low .tip-impact {
}

.tip-content {
}

.tip-title {
  color: var(--text-primary);
}

.tip-description {
  color: var(--text-secondary);
}

.ai-fab {
  position: fixed;
}

.ai-fab:hover {
}

@keyframes pulse {
  }
  }
  }
}

  .optimization-panel {
  }

  .analysis-grid {
  }

  .metrics-grid {
  }

  .overall-score {
    flex-direction: column;
  }
}
</style>
