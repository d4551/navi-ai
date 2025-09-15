<!--
  CANONICAL Cover Letter Job Information Form
  Matches PersonalInfoForm structure and design patterns
-->
<template>
  <section class="glass p-4 gap-4 rounded-lg unified-card">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h2 class="h6 mb-0 d-flex align-items-center gap-2 text-primary">
        <AppIcon name="mdi-briefcase-outline" class="icon-md" aria-hidden="true" />
        <span>Job Information</span>
      </h2>
      <div class="d-flex gap-2">
        <UnifiedButton
          v-if="canUseAI"
          color="glass"
          appearance="outlined"
          :loading="loading.jobAnalysis"
          :disabled="loading.jobAnalysis"
          leading-icon="mdi-brain"
          aria-label="Analyze job posting from text or URL"
          @click="showJobAnalysisModal = true"
        >
          Smart Fill
        </UnifiedButton>
        <UnifiedButton
          v-if="canUseAI && jobInfo.company"
          color="gaming"
          :loading="loading.companyResearch"
          :disabled="loading.companyResearch"
          leading-icon="mdi-magnify"
          aria-label="Get AI company research"
          @click="researchCompany"
        >
          Research Company
        </UnifiedButton>
      </div>
    </div>

    <div class="responsive-grid">
      <!-- Company Name -->
      <div class="form-floating">
        <input
          id="company-name"
          v-model="localJobInfo.company"
          type="text"
          class="form-control glass-input"
          placeholder="Company Name"
          required
          autocomplete="organization"
          @blur="commitChanges"
          @input="onCompanyChange"
        />
        <label for="company-name" class="form-label required">Company Name</label>
      </div>

      <!-- Position Title -->
      <div class="form-floating">
        <input
          id="position-title"
          v-model="localJobInfo.position"
          type="text"
          class="form-control glass-input"
          placeholder="Position Title"
          required
          autocomplete="organization-title"
          @blur="commitChanges"
        />
        <label for="position-title" class="form-label required">Position Title</label>
      </div>

      <!-- Hiring Manager -->
      <div class="form-floating">
        <input
          id="hiring-manager"
          v-model="localJobInfo.hiringManager"
          type="text"
          class="form-control glass-input"
          placeholder="Hiring Manager Name (Optional)"
          autocomplete="name"
          @blur="commitChanges"
        />
        <label for="hiring-manager" class="form-label">Hiring Manager</label>
      </div>

      <!-- Job Source -->
      <div class="form-floating">
        <select
          id="job-source"
          v-model="localJobInfo.source"
          class="form-select glass-input"
          @change="commitChanges"
        >
          <option value="">How did you find this job?</option>
          <option value="company-website">Company Website</option>
          <option value="linkedin">LinkedIn</option>
          <option value="indeed">Indeed</option>
          <option value="glassdoor">Glassdoor</option>
          <option value="referral">Employee Referral</option>
          <option value="recruiter">Recruiter Contact</option>
          <option value="job-fair">Job Fair</option>
          <option value="networking">Professional Networking</option>
          <option value="other">Other</option>
        </select>
        <label for="job-source" class="form-label">Job Source</label>
      </div>
    </div>

    <!-- Job Description -->
    <div class="mt-3">
      <div class="form-floating">
        <textarea
          id="job-description"
          v-model="localJobInfo.description"
          class="form-control glass-input"
          placeholder="Paste the job description here to get better AI suggestions..."
          rows="6"
          style="min-height: 120px; resize: vertical;"
          @blur="commitChanges"
          @input="onDescriptionChange"
        ></textarea>
        <label for="job-description" class="form-label">Job Description</label>
      </div>
      <div class="form-text d-flex align-items-center justify-content-between">
        <span>
          <AppIcon name="mdi-information-outline" class="me-1" aria-hidden="true" />
          Adding the job description helps AI generate better cover letters
        </span>
        <small v-if="localJobInfo.description" class="text-muted">
          {{ localJobInfo.description.length }} characters
        </small>
      </div>
    </div>

    <!-- Company Research Results -->
    <div
      v-if="companyResearch && Object.keys(companyResearch).length"
      class="company-research-card mt-3"
      role="region"
      aria-labelledby="company-research-title"
    >
      <div class="card glass-elevated">
        <div class="card-header section-header">
          <h3 id="company-research-title" class="h6 mb-0 d-flex align-items-center gap-2">
            <AppIcon name="mdi-domain" class="text-primary" aria-hidden="true" />
            Company Research: {{ localJobInfo.company }}
          </h3>
        </div>
        <div class="card-body section-body">
          <div v-if="companyResearch.summary" class="mb-3">
            <h4 class="h7 text-muted mb-2">Company Overview</h4>
            <p class="small">{{ companyResearch.summary }}</p>
          </div>

          <div class="row g-3">
            <div v-if="companyResearch.values?.length" class="col-md-4">
              <h4 class="h7 text-muted mb-2">Core Values</h4>
              <div class="d-flex flex-wrap gap-1">
                <span
                  v-for="value in companyResearch.values"
                  :key="`value-${value}`"
                  class="badge bg-primary-subtle text-primary"
                >
                  {{ value }}
                </span>
              </div>
            </div>

            <div v-if="companyResearch.culture?.length" class="col-md-4">
              <h4 class="h7 text-muted mb-2">Culture</h4>
              <div class="d-flex flex-wrap gap-1">
                <span
                  v-for="trait in companyResearch.culture"
                  :key="`culture-${trait}`"
                  class="badge bg-info-subtle text-info"
                >
                  {{ trait }}
                </span>
              </div>
            </div>

            <div v-if="companyResearch.projects?.length" class="col-md-4">
              <h4 class="h7 text-muted mb-2">Recent Projects</h4>
              <div class="d-flex flex-wrap gap-1">
                <span
                  v-for="project in companyResearch.projects"
                  :key="`project-${project}`"
                  class="badge bg-success-subtle text-success"
                >
                  {{ project }}
                </span>
              </div>
            </div>
          </div>

          <!-- Key Talking Points -->
          <div v-if="companyResearch.talkingPoints?.length" class="mt-3">
            <h4 class="h7 text-muted mb-2">
              <AppIcon name="mdi-lightbulb" aria-hidden="true" />
              Key Points to Mention
            </h4>
            <ul class="small mb-0">
              <li
                v-for="point in companyResearch.talkingPoints"
                :key="`point-${point}`"
              >
                {{ point }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Job Info Summary -->
    <div
      v-if="hasRequiredInfo"
      class="job-summary-card mt-3"
      role="region"
      aria-labelledby="job-summary-title"
    >
      <div class="alert alert-light border">
        <div class="d-flex align-items-start gap-3">
          <AppIcon name="mdi-check-circle-outline" size="large" color="success" aria-hidden="true" />
          <div>
            <h3 id="job-summary-title" class="h6 mb-1">Ready to Generate Cover Letter</h3>
            <p class="mb-2 small">
              <strong>{{ localJobInfo.position }}</strong> at <strong>{{ localJobInfo.company }}</strong>
              <span v-if="localJobInfo.hiringManager"> • {{ localJobInfo.hiringManager }}</span>
            </p>
            <div class="d-flex gap-2">
              <UnifiedButton
                v-if="canUseAI"
                color="gaming"
                :loading="loading.generation"
                :disabled="loading.generation"
                leading-icon="mdi-auto-fix"
                @click="generateCoverLetter"
              >
                Generate Cover Letter
              </UnifiedButton>
              <UnifiedButton
                color="glass"
                appearance="outlined"
                trailing-icon="mdi-arrow-right"
                @click="nextTab"
              >
                Continue Manually
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Analysis Modal -->
    <div 
      v-if="showJobAnalysisModal" 
      class="modal fade show d-block" 
      style="background-color: rgba(0,0,0,0.5);"
      @click.self="showJobAnalysisModal = false"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Smart Fill from Job Posting</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showJobAnalysisModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ active: jobAnalysisTab === 'text' }"
                    @click="jobAnalysisTab = 'text'"
                  >
                    Paste Job Text
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ active: jobAnalysisTab === 'url' }"
                    @click="jobAnalysisTab = 'url'"
                  >
                    From URL
                  </button>
                </li>
              </ul>
            </div>

            <div v-if="jobAnalysisTab === 'text'" class="tab-pane active">
              <div class="form-floating mb-3">
                <textarea
                  v-model="jobPostingText"
                  class="form-control"
                  style="height: 200px"
                  placeholder="Paste the full job posting here..."
                ></textarea>
                <label>Job Posting Text</label>
              </div>
              <button 
                class="btn btn-primary"
                :disabled="!jobPostingText.trim() || loading.jobAnalysis"
                @click="analyzeJobText"
              >
                <span
                  v-if="loading.jobAnalysis"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <AppIcon v-else name="mdi-brain" class="me-1" />
                Analyze Job Posting
              </button>
            </div>

            <div v-else-if="jobAnalysisTab === 'url'" class="tab-pane active">
              <div class="form-floating mb-3">
                <input
                  v-model="jobPostingUrl"
                  type="url"
                  class="form-control"
                  placeholder="https://..."
                />
                <label>Job Posting URL</label>
              </div>
              <button 
                class="btn btn-primary"
                :disabled="!jobPostingUrl.trim() || loading.jobAnalysis"
                @click="analyzeJobUrl"
              >
                <span
                  v-if="loading.jobAnalysis"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <AppIcon v-else name="mdi-web" class="me-1" />
                Extract & Analyze
              </button>
            </div>

            <!-- Analysis Results -->
            <div v-if="jobAnalysisResults" class="mt-4">
              <div class="alert alert-success">
                <AppIcon name="mdi-check-circle-outline" />
                Job analysis completed! The form will be auto-filled with extracted information.
              </div>
              
              <div class="analysis-preview">
                <h6>Extracted Information:</h6>
                <ul class="list-unstyled">
                  <li><strong>Company:</strong> {{ jobAnalysisResults.company }}</li>
                  <li><strong>Position:</strong> {{ jobAnalysisResults.jobTitle }}</li>
                  <li v-if="jobAnalysisResults.location"><strong>Location:</strong> {{ jobAnalysisResults.location }}</li>
                  <li><strong>Key Skills:</strong> {{ jobAnalysisResults.keySkills.slice(0, 5).join(', ') }}</li>
                </ul>
              </div>
            </div>

            <div v-if="jobAnalysisError" class="mt-4">
              <div class="alert alert-danger">
                <AppIcon name="mdi-alert-circle-outline" class="me-2" />
                {{ jobAnalysisError }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showJobAnalysisModal = false"
            >
              Cancel
            </button>
            <button 
              v-if="jobAnalysisResults"
              type="button" 
              class="btn btn-primary" 
              @click="applyJobAnalysis"
            >
              Apply Information
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import { debounce } from 'lodash-es'
import { useJobTailoredResume } from '@/composables/useJobTailoredResume'

// Props
interface JobInfo {
  company: string
  position: string
  hiringManager: string
  source: string
  description: string
}

interface CompanyResearch {
  summary?: string
  values?: string[]
  culture?: string[]
  projects?: string[]
  talkingPoints?: string[]
}

const props = defineProps<{
  jobInfo: JobInfo
  companyResearch?: CompanyResearch
  canUseAI: boolean
  loading: {
    companyResearch?: boolean
    generation?: boolean
    jobAnalysis?: boolean
  }
}>()

// Emits
const emit = defineEmits<{
  'update:jobInfo': [jobInfo: JobInfo]
  'research-company': []
  'generate-cover-letter': []
  'next-tab': []
}>()

// Job Analysis Composable
const { analyzeJobFromText, analyzeJobFromUrl, jobAnalysis } = useJobTailoredResume()

// Local state
const localJobInfo = ref<JobInfo>({ ...props.jobInfo })
const showJobAnalysisModal = ref(false)
const jobAnalysisTab = ref('text')
const jobPostingText = ref('')
const jobPostingUrl = ref('')
const jobAnalysisResults = ref(null)
const jobAnalysisError = ref('')

// Computed
const hasRequiredInfo = computed(() => {
  const company = localJobInfo.value?.company || ''
  const position = localJobInfo.value?.position || ''
  return company.trim().length > 0 && position.trim().length > 0
})

// Watch for external changes
watch(
  () => props.jobInfo,
  (newJobInfo) => {
    localJobInfo.value = { ...newJobInfo }
  },
  { deep: true }
)

// Methods
const commitChanges = () => {
  emit('update:jobInfo', { ...localJobInfo.value })
}

const researchCompany = () => {
  emit('research-company')
}

const generateCoverLetter = () => {
  emit('generate-cover-letter')
}

const nextTab = () => {
  emit('next-tab')
}

// Job Analysis Methods
const analyzeJobText = async () => {
  try {
    jobAnalysisError.value = ''
    const result = await analyzeJobFromText(jobPostingText.value)
    
    if (result.success && result.analysis) {
      jobAnalysisResults.value = result.analysis
    } else {
      jobAnalysisError.value = result.error || 'Failed to analyze job posting'
    }
  } catch (error) {
    jobAnalysisError.value = error.message || 'Analysis failed'
  }
}

const analyzeJobUrl = async () => {
  try {
    jobAnalysisError.value = ''
    const result = await analyzeJobFromUrl(jobPostingUrl.value)
    
    if (result.success && result.analysis) {
      jobAnalysisResults.value = result.analysis
    } else {
      jobAnalysisError.value = result.error || 'Failed to extract and analyze job posting'
    }
  } catch (error) {
    jobAnalysisError.value = error.message || 'Analysis failed'
  }
}

const applyJobAnalysis = () => {
  if (jobAnalysisResults.value) {
    localJobInfo.value.company = jobAnalysisResults.value.company || localJobInfo.value.company
    localJobInfo.value.position = jobAnalysisResults.value.jobTitle || localJobInfo.value.position
    
    // Add key skills or other extracted information to description
    if (jobAnalysisResults.value.keySkills?.length) {
      const skillsText = `Key Skills: ${jobAnalysisResults.value.keySkills.slice(0, 10).join(', ')}`
      localJobInfo.value.description = skillsText + (localJobInfo.value.description ? '\n\n' + localJobInfo.value.description : '')
    }
    
    commitChanges()
    showJobAnalysisModal.value = false
    
    // Reset modal state
    jobPostingText.value = ''
    jobPostingUrl.value = ''
    jobAnalysisResults.value = null
    jobAnalysisError.value = ''
    jobAnalysisTab.value = 'text'
  }
}

// Debounced handlers for real-time updates
const onCompanyChange = debounce(() => {
  commitChanges()
}, 500)

const onDescriptionChange = debounce(() => {
  commitChanges()
}, 1000)
</script>

<style scoped lang="scss">
.company-research-card,
.job-summary-card {
  .card {
    border: 1px solid var(--glass-border);
    background: var(--glass-surface);
    backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
    -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  }
  
  .card-header {
    background: var(--glass-elevated);
    border-bottom: 1px solid var(--glass-border);
  }
  
  .badge { font-size: 0.7rem; padding: 0.3rem 0.6rem; font-weight: 500; border-radius: var(--border-radius-sm); }
}

.job-summary-card {
  .alert {
    background: linear-gradient(135deg, rgba(var(--success-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.05) 100%);
    border-color: rgba(var(--success-rgb), 0.2);
  }
}

.h7 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// Dark theme support
[data-theme="dark"] {
  .company-research-card,
  .job-summary-card {
    .card {
      background: var(--glass-surface-dark);
      border-color: var(--glass-border-dark);
    }
    
    .card-header {
      background: var(--glass-elevated-dark);
      border-bottom-color: var(--glass-border-dark);
    }
  }
  
  .job-summary-card .alert {
    background: linear-gradient(135deg, rgba(var(--success-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0.1) 100%);
    border-color: rgba(var(--success-rgb), 0.3);
  }
}

// Responsive design
@media (max-width: 768px) {
  .responsive-grid {
    --card-min-width: 100%;
  }
  
  .company-research-card .row {
    flex-direction: column;
  }
  
  .job-summary-card .d-flex {
    flex-direction: column;
    align-items: flex-start;
    
    .btn {
      width: 100%;
    }
  }
}
</style>
