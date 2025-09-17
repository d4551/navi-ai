<template>
  <div class="resume-ai-analysis font-sans">
    <div class="analysis-options mb-4">
      <div class="flex gap-glass-md mb-3" role="group" aria-label="Analysis actions">
        <button
          class="unified-btn btn-primary btn-sm v-btn ui-btn ui-size-md"
          :disabled="!resumeData || loading"
          @click="$emit('request-analysis')"
        >
          <AppIcon name="CpuChipIcon" class="mr-2" />
          {{ loading ? 'Analyzing...' : 'Analyze Resume' }}
        </button>
        <button
          class="unified-btn btn-outline-info btn-sm v-btn variant-outlined ui-btn ui-size-md"
          :disabled="!resumeData || loading"
          @click="runATSCheck"
        >
          <AppIcon name="CheckIcon-circle-outline-outline" class="mr-2" />
          ATS Compatibility Check
        </button>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults" class="analysis-results">
      <div class="unified-grid g-3">
        <!-- Overall Score -->
        <div class="flex-1-md-4">
          <div class="unified-card glass-card section-card text-center">
            <div class="card-body section-body">
              <div class="score-circle" :class="getScoreClass(analysisResults.overallScore)">
                <div class="score-number">{{ analysisResults.overallScore }}</div>
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
        <div class="flex-1-md-4">
          <div class="unified-card glass-card section-card">
            <div class="card-header section-header card-header--dense">
              <h6 class="mb-0">
                <AppIcon name="CheckCircleIcon" color="success" context="success" />
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
                  <AppIcon name="PlusCircleIcon" class="text-success-600 mr-1" />
                  <small>{{ strength }}</small>
                </li>
              </ul>
              <div v-if="!analysisResults.strengths?.length" class="text-secondary small">
                <AppIcon name="InformationCircleIcon" class="mr-1" />
                Analysis will identify key strengths
              </div>
            </div>
          </div>
        </div>

        <!-- Improvements -->
        <div class="flex-1-md-4">
          <div class="unified-card glass-card section-card">
            <div class="card-header section-header card-header--dense">
              <h6 class="mb-0">
                <AppIcon name="LightBulbIcon" color="warning" />
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
                  <AppIcon name="LightBulbIcon" color="warning" />
                  <small>{{ improvement }}</small>
                  <button
                    v-if="canUseAi"
                    class="btn btn-link btn-sm ml-2 p-0 ui-btn ui-size-md"
                    @click="$emit('apply-suggestion', { type: 'improvement', data: improvement, index })"
                  >
                    <AppIcon name="SparklesIcon" class="text-primary-600" />
                  </button>
                </li>
              </ul>
              <div v-if="!analysisResults.improvements?.length" class="text-secondary small">
                <AppIcon name="InformationCircleIcon" class="mr-1" />
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
              <AppIcon name="TagIcon-text-outline" class="mr-2" />
              Keyword Optimization
            </h6>
          </div>
          <div class="card-body section-body card-body--dense">
            <div class="unified-grid g-3">
              <div class="flex-1-md-4">
                <h6 class="text-success-600 mb-2">Missing Keywords</h6>
                <div class="keyword-tags">
                  <span
                    v-for="keyword in analysisResults.keywordOptimization.missing"
                    :key="keyword"
                    class="badge bg-error-500-subtle text-error-600 mr-1 mb-1"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
              <div class="flex-1-md-4">
                <h6 class="text-warning-600 mb-2">Omitted Keywords</h6>
                <div class="keyword-tags">
                  <span
                    v-for="keyword in analysisResults.keywordOptimization.overused"
                    :key="keyword"
                    class="badge bg-warning-500-subtle text-warning-600 mr-1 mb-1"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
              <div class="flex-1-md-4">
                <h6 class="text-blue-600 mb-2">Recommended Density</h6>
                <div class="text-center">
                  <div class="h4 text-blue-600 mb-1">{{ analysisResults.keywordOptimization.recommendedDensity }}</div>
                  <small class="text-secondary">Optimal keyword usage</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Analysis Message -->
    <div v-else-if="!loading" class="text-center text-secondary py-5">
      <AppIcon name="CpuChipIcon" class="mdi-48px mb-3" />
      <h6 class="mb-2">Ready for AI Analysis</h6>
      <p class="mb-3">Click "Analyze Resume" to get AI-powered insights and recommendations</p>
      <button
        class="unified-btn btn-primary v-btn ui-btn ui-size-md"
        :disabled="!resumeData"
        @click="$emit('request-analysis')"
      >
        <AppIcon name="CpuChipIcon" class="mr-2" />
        Start Analysis
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <AppIcon name="CpuChipIcon" class="mdi-48px mb-3 text-primary-600 mdi-spin" />
      <h6 class="mb-2">Analyzing Your Resume</h6>
      <p class="text-secondary">AI is evaluating your content and generating personalized recommendations...</p>
      <div class="progress mt-3" style="max-width: 300px; margin: 0 auto;">
        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 75%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, CpuChipIcon, InformationCircleIcon, LightBulbIcon, PlusCircleIcon, SparklesIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
interface AnalysisResults {
  overallScore: number
  strengths: string[]
  improvements: string[]
  keywordOptimization?: {
    missing: string[]
    overused: string[]
    recommendedDensity: string
  }
}

interface ResumeData {
  // Resume data structure
}

interface Props {
  resumeData?: ResumeData
  canUseAi: boolean
  loading: boolean
  analysisResults: AnalysisResults | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'request-analysis': []
  'apply-suggestion': [suggestion: any]
}>()

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  if (score >= 60) return 'score-fair'
  return 'score-poor'
}

const getScoreDescription = (score: number): string => {
  if (score >= 90) return 'Excellent - Ready for top positions!'
  if (score >= 80) return 'Good - Minor improvements needed'
  if (score >= 70) return 'Average - Significant improvements possible'
  if (score >= 60) return 'Fair - Major revisions recommended'
  return 'Needs extensive improvement'
}

const runATSCheck = async () => {
  if (!props.resumeData) {
    console.warn('No resume data available for ATS check')
    return
  }

  // Emit a custom analysis event for ATS checking
  emit('apply-suggestion', {
    type: 'ats-check',
    data: 'Check ATS compatibility',
    action: 'run-ats-analysis'
  })
}
</script>

<style scoped>
.resume-ai-analysis {
  /* Component styles */
}

.analysis-options {
  border-b: 1px solid var(--glass-border);
  padding-bottom: 1rem;
}

/* Score Circle */
.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  transition: all 0.3s ease;
}

.score-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 2px;
  opacity: 0.8;
}

.score-description {
  font-size: 0.875rem;
  line-height: 1.4;
  margin-top: 0.5rem;
}

/* Score color classes */
.score-excellent {
  background: linear-gradient(135deg, var(--color-success), var(--color-success));
  color: white;
}

.score-good {
  background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
  color: white;
}

.score-average {
  background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600));
  color: white;
}

.score-fair {
  background: linear-gradient(135deg, var(--color-warning-400), var(--color-warning-500));
  color: white;
}

.score-poor {
  background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
  color: white;
}

.keyword-tags {
  min-height: 40px;
}

.keyword-tags .badge {
  margin-bottom: 0.25rem;
}

.keyword-tags .badge:hover {
  transform: translateY(-1px);
}

/* Spin animation for loading icon */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .score-circle {
    width: 70px;
    height: 70px;
  }

  .score-number {
    font-size: 1.5rem;
  }

  .analysis-results .flex-1-md-4 {
    order: -1;
  }
}

@media (max-width: 576px) {
  .score-circle {
    width: 60px;
    height: 60px;
  }

  .score-number {
    font-size: 1.25rem;
  }

  .keyword-tags .badge {
    font-size: 0.75rem;
  }
}

/* Dark theme support */
[data-theme="dark"] .score-circle {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .badge.bg-error-500-subtle,
[data-theme="dark"] .badge.bg-warning-500-subtle {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: none;
}
</style>
