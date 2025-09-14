<template>
  <div class="resume-ai-analysis">
    <div class="analysis-options mb-4">
      <div class="d-flex gap-3 mb-3" role="group" aria-label="Analysis actions">
        <button
          class="unified-btn btn-primary btn-sm v-btn ui-btn ui-size-md"
          :disabled="!resumeData || loading"
          @click="$emit('request-analysis')"
        >
          <AppIcon name="mdi-brain" class="me-2" />
          {{ loading ? "Analyzing..." : "Analyze Resume" }}
        </button>
        <button
          class="unified-btn btn-outline-info btn-sm v-btn variant-outlined ui-btn ui-size-md"
          :disabled="!resumeData || loading"
          @click="runATSCheck"
        >
          <AppIcon name="mdi-check-circle-outline-outline" class="me-2" />
          ATS Compatibility Check
        </button>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults" class="analysis-results">
      <div class="unified-grid g-3">
        <!-- Overall Score -->
        <div class="col-md-4">
          <div class="unified-card glass-card section-card text-center">
            <div class="card-body section-body">
              <div
                class="score-circle"
                :class="getScoreClass(analysisResults.overallScore)"
              >
                <div class="score-number">
                  {{ analysisResults.overallScore }}
                </div>
                <div class="score-label">Score</div>
              </div>
              <h6 class="mt-3 mb-3">Resume Quality</h6>
              <div class="score-description">
                {{ getScoreDescription(analysisResults.overallScore) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Strengths -->
        <div class="col-md-4">
          <div class="unified-card glass-card section-card">
            <div class="card-header section-header card-header--dense">
              <h6 class="mb-0">
                <AppIcon
                  name="mdi-check-circle-outline"
                  color="success"
                  context="success"
                />
                Strengths ({{ analysisResults.strengths?.length || 0 }})
              </h6>
            </div>
            <div class="card-body section-body card-body--dense">
              <ul class="list-unstyled mb-0">
                <li
                  v-for="(strength, index) in analysisResults.strengths"
                  :key="index"
                  class="mb-2"
                >
                  <AppIcon name="mdi-plus-circle" class="text-success me-1" />
                  <small>{{ strength }}</small>
                </li>
              </ul>
              <div
                v-if="!analysisResults.strengths?.length"
                class="text-muted small"
              >
                <AppIcon name="mdi-information-outline" class="me-1" />
                Analysis will identify key strengths
              </div>
            </div>
          </div>
        </div>

        <!-- Improvements -->
        <div class="col-md-4">
          <div class="unified-card glass-card section-card">
            <div class="card-header section-header card-header--dense">
              <h6 class="mb-0">
                <AppIcon name="mdi-lightbulb" color="warning" />
                Improvements ({{ analysisResults.improvements?.length || 0 }})
              </h6>
            </div>
            <div class="card-body section-body card-body--dense">
              <ul class="list-unstyled mb-0">
                <li
                  v-for="(improvement, index) in analysisResults.improvements"
                  :key="index"
                  class="mb-2"
                >
                  <AppIcon name="mdi-lightbulb" color="warning" />
                  <small>{{ improvement }}</small>
                  <button
                    v-if="canUseAi"
                    class="btn btn-link btn-sm ms-2 p-0 ui-btn ui-size-md"
                    @click="
                      $emit('apply-suggestion', {
                        type: 'improvement',
                        data: improvement,
                        index,
                      })
                    "
                  >
                    <AppIcon name="mdi-auto-fix" class="text-primary" />
                  </button>
                </li>
              </ul>
              <div
                v-if="!analysisResults.improvements?.length"
                class="text-muted small"
              >
                <AppIcon name="mdi-information-outline" class="me-1" />
                No improvements suggested
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Keyword Optimization (if available) -->
      <div v-if="analysisResults.keywordOptimization" class="mt-4">
        <div class="unified-card glass-card section-card">
          <div class="card-header section-header">
            <h6 class="mb-0">
              <AppIcon name="mdi-tag-text-outline" class="me-2" />
              Keyword Optimization
            </h6>
          </div>
          <div class="card-body section-body card-body--dense">
            <div class="unified-grid g-3">
              <div class="col-md-4">
                <h6 class="text-success mb-2">Missing Keywords</h6>
                <div class="keyword-tags">
                  <span
                    v-for="keyword in analysisResults.keywordOptimization
                      .missing"
                    :key="keyword"
                    class="badge bg-danger-subtle text-danger me-1 mb-1"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <h6 class="text-warning mb-2">Omitted Keywords</h6>
                <div class="keyword-tags">
                  <span
                    v-for="keyword in analysisResults.keywordOptimization
                      .overused"
                    :key="keyword"
                    class="badge bg-warning-subtle text-warning me-1 mb-1"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <h6 class="text-info mb-2">Recommended Density</h6>
                <div class="text-center">
                  <div class="h4 text-info mb-1">
                    {{ analysisResults.keywordOptimization.recommendedDensity }}
                  </div>
                  <small class="text-muted">Optimal keyword usage</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Analysis Message -->
    <div v-else-if="!loading" class="text-center text-muted py-5">
      <AppIcon name="mdi-brain" class="mdi-48px mb-3" />
      <h6 class="mb-2">Ready for AI Analysis</h6>
      <p class="mb-3">
        Click "Analyze Resume" to get AI-powered insights and recommendations
      </p>
      <button
        class="unified-btn btn-primary v-btn ui-btn ui-size-md"
        :disabled="!resumeData"
        @click="$emit('request-analysis')"
      >
        <AppIcon name="mdi-brain" class="me-2" />
        Start Analysis
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <AppIcon name="mdi-brain" class="mdi-48px mb-3 text-primary mdi-spin" />
      <h6 class="mb-2">Analyzing Your Resume</h6>
      <p class="text-muted">
        AI is evaluating your content and generating personalized
        recommendations...
      </p>
      <div class="progress mt-3" style="max-width: 300px; margin: 0 auto">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          style="width: 75%"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
interface AnalysisResults {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  keywordOptimization?: {
    missing: string[];
    overused: string[];
    recommendedDensity: string;
  };
}

interface ResumeData {
  // Resume data structure
}

interface Props {
  resumeData?: ResumeData;
  canUseAi: boolean;
  loading: boolean;
  analysisResults: AnalysisResults | null;
}

const _props = defineProps<Props>();

const _emit = defineEmits<{
  "request-analysis": [];
  "apply-suggestion": [suggestion: any];
}>();

const getScoreClass = (score: number): string => {
  if (score >= 90) return "score-excellent";
  if (score >= 80) return "score-good";
  if (score >= 70) return "score-average";
  if (score >= 60) return "score-fair";
  return "score-poor";
};

const getScoreDescription = (score: number): string => {
  if (score >= 90) return "Excellent - Ready for top positions!";
  if (score >= 80) return "Good - Minor improvements needed";
  if (score >= 70) return "Average - Significant improvements possible";
  if (score >= 60) return "Fair - Major revisions recommended";
  return "Needs extensive improvement";
};

const runATSCheck = async () => {
  if (!props.resumeData) {
    console.warn("No resume data available for ATS check");
    return;
  }

  // Emit a custom analysis event for ATS checking
  emit("apply-suggestion", {
    type: "ats-check",
    data: "Check ATS compatibility",
    action: "run-ats-analysis",
  });
};
</script>

<style scoped>
.resume-ai-analysis {
}

.analysis-options {
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-number {
}

.score-label {
}

.score-description {
}

.score-excellent {
  background: linear-gradient(
    var(--color-success),
    var(--color-success)
  );
  color: white;
}

.score-good {
  background: linear-gradient(
  );
  color: white;
}

.score-average {
  background: linear-gradient(
  );
  color: white;
}

.score-fair {
  background: linear-gradient(
  );
  color: white;
}

.score-poor {
  background: linear-gradient(
  );
  color: white;
}

.keyword-tags {
}

.keyword-tags .badge {
}

.keyword-tags .badge:hover {
}

@keyframes spin {
  from {
  }
  to {
  }
}

.spin {
}

  .score-circle {
  }

  .score-number {
  }

  }
}

  .score-circle {
  }

  .score-number {
  }

  .keyword-tags .badge {
  }
}

[data-theme="dark"] .score-circle {
}

[data-theme="dark"] .badge.bg-danger-subtle,
[data-theme="dark"] .badge.bg-warning-subtle {
}

.sr-only {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  border: none;
}
</style>
