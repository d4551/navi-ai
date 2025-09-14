<template>
  <div class="job-tailored-resume-generator">
    <!-- Header -->
    <div class="generator-header mb-6">
      <h2 class="h2 text-gradient-gaming mb-2">
        AI-Powered Resume Tailoring
      </h2>
      <p class="text-secondary mb-4">
        Paste a job posting or URL to generate a tailored resume and cover letter optimized for ATS systems
      </p>
    </div>

    <!-- Step 1: Job Analysis -->
    <div class="surface-elevated border-subtle rounded-xl mb-6">
      <div class="p-4 border-b border-subtle">
        <div class="d-flex align-items-center gap-3">
          <div class="step-badge">1</div>
          <h3 class="heading-lg mb-0">Job Posting Analysis</h3>
          <AppIcon v-if="hasJobAnalysis" name="mdi-check-circle-outline" color="success" size="small" />
        </div>
      </div>
      
      <div class="p-4">
        <v-tabs v-model="jobInputTab" class="mb-4">
          <v-tab value="text">Paste Job Text</v-tab>
          <v-tab value="url">From URL</v-tab>
        </v-tabs>

        <v-tabs-window v-model="jobInputTab">
          <!-- Text Input Tab -->
          <v-tabs-window-item value="text">
            <div class="mb-4">
              <v-textarea
                v-model="jobPostingText"
                label="Paste job posting text here"
                placeholder="Copy and paste the full job posting including requirements, responsibilities, and company information..."
                rows="8"
                :disabled="isAnalyzingJob"
                variant="outlined"
                class="mb-3"
              />
              
              <div class="d-flex gap-3 flex-wrap">
                <UnifiedButton
                  :loading="isAnalyzingJob"
                  :disabled="!jobPostingText?.trim()"
                  variant="primary"
                  size="md"
                  leading-icon="mdi-brain"
                  @click="analyzeJobText"
                >
                  Analyze Job Posting
                </UnifiedButton>
                
                <UnifiedButton
                  v-if="hasJobAnalysis"
                  variant="outline"
                  size="md"
                  leading-icon="mdi-refresh"
                  @click="clearJobAnalysis"
                >
                  Clear Analysis
                </UnifiedButton>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- URL Input Tab -->
          <v-tabs-window-item value="url">
            <div class="mb-4">
              <v-text-field
                v-model="jobPostingUrl"
                label="Job posting URL"
                placeholder="https://..."
                :disabled="isAnalyzingJob"
                variant="outlined"
                class="mb-3"
              />
              
              <UnifiedButton
                :loading="isAnalyzingJob"
                :disabled="!jobPostingUrl?.trim()"
                variant="primary"
                size="md"
                leading-icon="mdi-web"
                @click="analyzeJobUrl"
              >
                Extract & Analyze
              </UnifiedButton>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>

        <!-- Job Analysis Results -->
        <div v-if="hasJobAnalysis" class="job-analysis-results mt-4">
          <div class="surface-success-subtle border-success-subtle rounded-lg p-4 mb-4">
            <AppIcon name="mdi-check-circle-outline" color="success" class="me-2" />
            <span class="text-success-emphasis">Job analysis completed! Ready to tailor your resume.</span>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="surface-elevated border-subtle rounded-lg p-4 h-100">
                <h4 class="heading-md mb-3">Position Details</h4>
                <p><strong>Company:</strong> {{ jobAnalysis.company }}</p>
                <p><strong>Role:</strong> {{ jobAnalysis.jobTitle }}</p>
                <p><strong>Experience Level:</strong> {{ jobAnalysis.experienceLevel }}</p>
                <p v-if="jobAnalysis.location"><strong>Location:</strong> {{ jobAnalysis.location }}</p>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="surface-elevated border-subtle rounded-lg p-4 h-100">
                <h4 class="heading-md mb-3">Key Requirements</h4>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span 
                    v-for="skill in jobAnalysis.keySkills.slice(0, 6)" 
                    :key="skill"
                    class="chip chip-primary"
                  >
                    {{ skill }}
                  </span>
                </div>
                <p class="text-secondary text-sm mt-2">
                  {{ jobAnalysis.atsKeywords.length }} ATS keywords identified
                </p>
              </div>
            </div>
          </div>

          <!-- Requirements Breakdown -->
          <v-expansion-panels class="mt-3">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <AppIcon name="mdi-format-list-bulleted" class="me-2" />
                Detailed Requirements ({{ jobAnalysis.requirements.length }})
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="requirements-list">
                  <div 
                    v-for="req in jobAnalysis.requirements" 
                    :key="req.requirement"
                    class="requirement-item"
                    :class="`priority-${req.priority}`"
                  >
                    <div class="requirement-header">
                      <span class="priority-badge" :class="req.priority">
                        {{ req.priority }}
                      </span>
                      <span class="category-badge">{{ req.category }}</span>
                    </div>
                    <p class="requirement-text">{{ req.requirement }}</p>
                    <div class="keywords-list">
                      <span 
                        v-for="keyword in req.keywords" 
                        :key="keyword"
                        class="keyword-chip"
                      >
                        {{ keyword }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <AppIcon name="mdi-office-building" class="me-2" />
                Company Insights
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="company-insights">
                  <div v-if="jobAnalysis.companyValues.length" class="mb-3">
                    <h5>Values & Culture</h5>
                    <div class="values-list">
                      <span 
                        v-for="value in jobAnalysis.companyValues" 
                        :key="value"
                        class="value-tag"
                      >
                        {{ value }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="jobAnalysis.growthOpportunities.length" class="mb-3">
                    <h5>Growth Opportunities</h5>
                    <ul>
                      <li v-for="opp in jobAnalysis.growthOpportunities" :key="opp">
                        {{ opp }}
                      </li>
                    </ul>
                  </div>
                  
                  <div v-if="jobAnalysis.uniqueSellingPoints.length">
                    <h5>Unique Selling Points</h5>
                    <ul>
                      <li v-for="point in jobAnalysis.uniqueSellingPoints" :key="point">
                        {{ point }}
                      </li>
                    </ul>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </div>

    <!-- Step 2: Resume Tailoring -->
    <div class="surface-elevated border-subtle rounded-xl mb-6" :class="{ 'disabled': !hasJobAnalysis }">
      <div class="p-4 border-b border-subtle">
        <div class="d-flex align-items-center gap-3">
          <div class="step-badge" :class="{ 'active': hasJobAnalysis }">2</div>
          <h3 class="heading-lg mb-0">Resume Tailoring</h3>
          <AppIcon v-if="hasTailoredResume" name="mdi-check-circle-outline" color="success" size="small" />
        </div>
      </div>
      
      <div class="p-4">
        <div v-if="!hasJobAnalysis" class="text-center text-muted py-4">
          <AppIcon name="mdi-arrow-up" size="48" class="mb-3" />
          <p>Complete job analysis first to enable resume tailoring</p>
        </div>

        <div v-else>
          <!-- Tailoring Options -->
          <div class="tailoring-options mb-4">
            <div class="row">
              <div class="col-md-4">
                <v-select
                  v-model="tailoringOptions.aggressiveness"
                  :items="aggressivenessOptions"
                  label="Optimization Level"
                  variant="outlined"
                  density="compact"
                />
              </div>
              <div class="col-md-4">
                <v-select
                  v-model="tailoringOptions.targetScore"
                  :items="targetScoreOptions"
                  label="Target ATS Score"
                  variant="outlined"
                  density="compact"
                />
              </div>
              <div class="col-md-4">
                <v-select
                  v-model="tailoringOptions.focusAreas"
                  :items="focusAreaOptions"
                  label="Focus Areas"
                  multiple
                  variant="outlined"
                  density="compact"
                />
              </div>
            </div>
          </div>

          <div class="d-flex gap-3 flex-wrap">
            <UnifiedButton
              :loading="isTailoringResume"
              :disabled="!currentResume"
              variant="primary"
              size="md"
              leading-icon="mdi-file-document-outline-edit"
              @click="tailorResume"
            >
              Tailor Resume to Job
            </UnifiedButton>

            <UnifiedButton
              v-if="hasTailoredResume"
              variant="secondary"
              size="md"
              leading-icon="mdi-download"
              @click="exportTailoredResume"
            >
              Export Tailored Resume
            </UnifiedButton>
          </div>

          <!-- Tailoring Results -->
          <div v-if="hasTailoredResume" class="tailoring-results mt-4">
            <!-- Score Cards -->
            <div class="row mb-4">
              <div class="col-md-3 mb-2">
                <div class="score-card">
                  <div class="score-value" :class="getScoreColor(matchScore)">
                    {{ matchScore }}%
                  </div>
                  <div class="score-label">Match Score</div>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <div class="score-card">
                  <div class="score-value" :class="getScoreColor(keywordCoverage)">
                    {{ keywordCoverage }}%
                  </div>
                  <div class="score-label">Keyword Coverage</div>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <div class="score-card">
                  <div class="score-value" :class="getScoreColor(atsScore)">
                    {{ atsScore }}%
                  </div>
                  <div class="score-label">ATS Compliance</div>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <div class="score-card">
                  <div class="score-value" :class="getScoreColor(tailoredResume?.tailoredResume?.overallScore || 0)">
                    {{ tailoredResume?.tailoredResume?.overallScore || 0 }}%
                  </div>
                  <div class="score-label">Overall Score</div>
                </div>
              </div>
            </div>

            <!-- Improvements Summary -->
            <div class="improvements-summary mb-4">
              <h4 class="mb-3">Resume Improvements</h4>
              
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="section in tailoredResume?.tailoredResume?.sections || []"
                  :key="section.type"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-items-center justify-content-between w-100">
                      <span class="text-capitalize">{{ section.type }} Section</span>
                      <div class="d-flex align-items-center gap-2">
                        <span class="score-badge" :class="getScoreColor(section.atsScore)">
                          {{ section.atsScore }}%
                        </span>
                        <span class="keyword-count">
                          {{ section.keywordMatches.length }} keywords
                        </span>
                      </div>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="section-details">
                      <div class="changes-list mb-3">
                        <h5>Changes Made:</h5>
                        <ul>
                          <li v-for="change in section.changes" :key="change">
                            {{ change }}
                          </li>
                        </ul>
                      </div>
                      
                      <div class="keywords-matched mb-3">
                        <h5>Matched Keywords:</h5>
                        <div class="keyword-chips">
                          <span 
                            v-for="keyword in section.keywordMatches" 
                            :key="keyword"
                            class="keyword-chip matched"
                          >
                            {{ keyword }}
                          </span>
                        </div>
                      </div>

                      <div class="content-comparison">
                        <div class="row">
                          <div class="col-md-6">
                            <h5>Before:</h5>
                            <div class="content-preview original">
                              <pre>{{ formatContent(section.originalContent) }}</pre>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <h5>After:</h5>
                            <div class="content-preview tailored">
                              <pre>{{ formatContent(section.tailoredContent) }}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <!-- Recommendations -->
            <div v-if="tailoredResume?.recommendations" class="recommendations">
              <h4 class="mb-3">Additional Recommendations</h4>
              
              <div class="row">
                <div v-if="tailoredResume.recommendations.criticalChanges.length" class="col-md-6">
                  <div class="recommendation-card critical">
                    <h5>Critical Changes</h5>
                    <ul>
                      <li v-for="change in tailoredResume.recommendations.criticalChanges" :key="change">
                        {{ change }}
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div v-if="tailoredResume.recommendations.suggestedImprovements.length" class="col-md-6">
                  <div class="recommendation-card suggested">
                    <h5>Suggested Improvements</h5>
                    <ul>
                      <li v-for="improvement in tailoredResume.recommendations.suggestedImprovements" :key="improvement">
                        {{ improvement }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div v-if="tailoredResume.recommendations.missingKeywords.length" class="mt-3">
                <h5>Missing Keywords to Consider:</h5>
                <div class="missing-keywords">
                  <span 
                    v-for="keyword in tailoredResume.recommendations.missingKeywords" 
                    :key="keyword"
                    class="keyword-chip missing"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Cover Letter Generation -->
    <div class="card-unified" :class="{ 'disabled': !hasJobAnalysis }">
      <div class="card-header section-header">
        <div class="d-flex align-items-center gap-3">
          <div class="step-badge" :class="{ 'active': hasJobAnalysis }">3</div>
          <h3 class="card-title mb-0">Tailored Cover Letter</h3>
        </div>
      </div>
      
      <div class="card-body section-body">
        <div v-if="!hasJobAnalysis" class="text-center text-muted py-4">
          <AppIcon name="mdi-arrow-up" size="48" class="mb-3" />
          <p>Complete job analysis first to enable cover letter generation</p>
        </div>

        <div v-else>
          <UnifiedButton
            :loading="coverLetterComposable.isGenerating.value"
            variant="primary"
            size="md"
            icon="mdi-file-document-outline-plus"
            class="me-3"
            @click="generateCoverLetter"
          >
            Generate Tailored Cover Letter
          </UnifiedButton>

          <div v-if="coverLetterComposable.hasGeneratedContent.value" class="mt-4">
            <div class="alert alert-success mb-3">
              <AppIcon name="mdi-check-circle-outline" color="success" class="me-2" />
              Cover letter generated successfully!
            </div>
            
            <div class="cover-letter-preview">
              <v-textarea
                :model-value="coverLetterComposable.generatedContent.value"
                label="Generated Cover Letter"
                rows="12"
                readonly
                variant="outlined"
              />
              
              <div class="cover-letter-actions mt-3">
                <UnifiedButton
                  variant="outline"
                  size="md"
                  icon="mdi-content-copy"
                  class="me-3"
                  @click="copyCoverLetter"
                >
                  Copy to Clipboard
                </UnifiedButton>
                
                <UnifiedButton
                  variant="secondary"
                  size="md"
                  icon="mdi-download"
                  @click="exportCoverLetter"
                >
                  Export Cover Letter
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <v-alert
      v-if="error"
      type="error"
      class="mt-4"
      closable
      @click:close="error = null"
    >
      {{ _error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAppStore } from '@/stores/app'
import { useJobTailoredResume } from '@/composables/useJobTailoredResume'
import { useAICoverLetter } from '@/composables/useAICoverLetter'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Store
const store = useAppStore()

// Composables
const {
  jobAnalysis,
  hasJobAnalysis,
  tailoredResume,
  hasTailoredResume,
  isAnalyzingJob,
  isTailoringResume,
  matchScore,
  keywordCoverage,
  atsScore,
  error,
  analyzeJobFromText,
  analyzeJobFromUrl,
  tailorResumeToJob,
  generateTailoredCoverLetter,
  clearAll
} = useJobTailoredResume()

const coverLetterComposable = useAICoverLetter()
const { toast } = useToast()

// Component state
const jobInputTab = ref('text')
const jobPostingText = ref('')
const jobPostingUrl = ref('')
const currentResume = ref(null) // This should be populated from your resume store

// Tailoring options
import type { ResumeOptimizationOptions } from '@/services/AIResumeTargetingService'

const tailoringOptions = ref<Partial<ResumeOptimizationOptions>>({
  aggressiveness: 'moderate',
  targetScore: 85,
  focusAreas: ['ats_optimization', 'keyword_density', 'skill_highlighting']
})

const aggressivenessOptions = [
  { title: 'Conservative', value: 'conservative' },
  { title: 'Moderate', value: 'moderate' },
  { title: 'Aggressive', value: 'aggressive' }
]

const targetScoreOptions = [
  { title: '75%', value: 75 },
  { title: '80%', value: 80 },
  { title: '85%', value: 85 },
  { title: '90%', value: 90 },
  { title: '95%', value: 95 }
]

const focusAreaOptions = [
  { title: 'ATS Optimization', value: 'ats_optimization' },
  { title: 'Keyword Density', value: 'keyword_density' },
  { title: 'Skill Highlighting', value: 'skill_highlighting' },
  { title: 'Experience Relevance', value: 'experience_relevance' }
]

// Methods
async function analyzeJobText() {
  const result = await analyzeJobFromText(jobPostingText.value)
  if (result.success) {
    // Analysis completed successfully
  }
}

async function analyzeJobUrl() {
  const result = await analyzeJobFromUrl(jobPostingUrl.value)
  if (result.success) {
    // Analysis completed successfully
  }
}

function clearJobAnalysis() {
  jobPostingText.value = ''
  jobPostingUrl.value = ''
  clearAll()
}

async function tailorResume() {
  if (!currentResume.value) {
    toast.error('No resume data available. Please create or load a resume first.')
    return
  }
  
  const result = await tailorResumeToJob(currentResume.value, tailoringOptions.value)
  if (result.success) {
    // Tailoring completed successfully
  }
}

async function generateCoverLetter() {
  const result = await generateTailoredCoverLetter({
    // User profile data
  }, {
    tone: 'professional',
    length: 'medium'
  })
  
  if (result.success) {
    toast.success('Cover letter generated successfully!')
  }
}

async function copyCoverLetter() {
  if (coverLetterComposable.generatedContent.value) {
    try {
      await navigator.clipboard.writeText(coverLetterComposable.generatedContent.value)
      toast.success('Cover letter copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }
}

function exportTailoredResume() {
  // Implementation for exporting tailored resume
  toast.info('Resume export functionality to be implemented')
}

function exportCoverLetter() {
  // Implementation for exporting cover letter
  toast.info('Cover letter export functionality to be implemented')
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  return 'poor'
}

function formatContent(content: any): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.join('\n• ')
  return JSON.stringify(content, null, 2)
}

// Load current resume data on mount
onMounted(async () => {
  // Load resume from store when available
  if (store.user) {
    currentResume.value = store.user
  }
})
</script>

<style scoped>
.job-tailored-resume-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.generator-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-gray-300);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.step-badge.active {
  background: var(--color-primary-500);
  color: white;
}

.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.job-analysis-results {
  padding: var(--spacing-4);
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.info-card {
  padding: var(--spacing-4);
  background: var(--surface-glass);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-base);
  height: 100%;
}

.info-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  color: var(--text-primary);
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.skill-tag {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.requirement-item {
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-3);
  background: var(--surface-base);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-gray-300);
}

.requirement-item.priority-required {
  border-left-color: var(--color-error);
}

.requirement-item.priority-preferred {
  border-left-color: var(--color-warning);
}

.requirement-item.priority-nice_to_have {
  border-left-color: var(--color-info);
}

.requirement-header {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.priority-badge {
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.priority-badge.required {
  background: var(--color-error);
  color: white;
}

.priority-badge.preferred {
  background: var(--color-warning);
  color: white;
}

.priority-badge.nice_to_have {
  background: var(--color-info);
  color: white;
}

.category-badge {
  padding: var(--spacing-0-5) var(--spacing-2);
  background: var(--color-gray-200);
  color: var(--color-gray-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.requirement-text {
  margin: var(--spacing-2) 0;
  color: var(--text-primary);
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.keyword-chip {
  display: inline-block;
  padding: var(--spacing-0-5) var(--spacing-1-5);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.keyword-chip.matched {
  background: var(--color-success);
  color: white;
}

.keyword-chip.missing {
  background: var(--color-warning);
  color: white;
}

.values-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.value-tag {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.score-card {
  text-align: center;
  padding: var(--spacing-4);
  background: var(--surface-glass);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-base);
}

.score-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-1);
}

.score-value.excellent { color: var(--color-success); }
.score-value.good { color: var(--color-primary-500); }
.score-value.fair { color: var(--color-warning); }
.score-value.poor { color: var(--color-error); }

.score-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.score-badge {
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: white;
}

.score-badge.excellent { background: var(--color-success); }
.score-badge.good { background: var(--color-primary-500); }
.score-badge.fair { background: var(--color-warning); }
.score-badge.poor { background: var(--color-error); }

.keyword-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.section-details {
  padding: var(--spacing-3);
}

.content-preview {
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
}

.content-preview.original {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
}

.content-preview.tailored {
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
}

.content-preview pre {
  margin: 0;
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.recommendation-card {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-3);
}

.recommendation-card.critical {
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
}

.recommendation-card.suggested {
  background: var(--color-info-50);
  border: 1px solid var(--color-info-200);
}

.missing-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.cover-letter-preview {
  margin-top: var(--spacing-4);
}

.cover-letter-actions {
  display: flex;
  gap: var(--spacing-3);
}

@media (max-width: 768px) {
  .job-tailored-resume-generator {
    padding: var(--spacing-4);
  }
  
  .skills-tags,
  .keywords-list,
  .missing-keywords {
    gap: var(--spacing-1);
  }
  
  .score-card {
    padding: var(--spacing-3);
  }
  
  .score-value {
    font-size: var(--font-size-xl);
  }
}
</style>
