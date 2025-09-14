<template>
  <div class="resume-workflow">
    <!-- Unified Step Navigation -->
    <WorkflowSteps
      :steps="resumeSteps"
      :current-step="currentStep"
      :can-proceed="canProceed"
      :show-progress-bar="true"
      :show-navigation="false"
      :complete-label="'Complete Resume'"
      :validation-message="getValidationMessage()"
      @step-change="(step) => emit('update:currentStep', step)"
    />

    <!-- Enhanced Step Content -->
    <div class="workflow-main">
      <div class="step-header">
        <h2 class="step-main-title">{{ resumeSteps.find(s => s.id === currentStep)?.title }}</h2>
      </div>
      
      <div class="workflow-content">
        <!-- Step 1: Personal Info -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon">
                <AppIcon name="mdi-account-outline" size="24" />
              </div>
              <div>
                <h3 class="section-title">Personal Info</h3>
              </div>
            </div>
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-import"
              @click="importFromProfile"
            >
              Import Profile
            </UnifiedButton>
          </div>

          <div class="form-grid personal-info-grid">
            <FormField
              v-model="personalInfoName"
              label="Full Name"
              icon="mdi-account-outline"
              placeholder="Enter your full name"
              :required="true"
              validation-message="Required field"
            />
            
            <FormField
              v-model="personalInfoEmail"
              type="email"
              label="Email Address"
              icon="mdi-email-outline"
              placeholder="your.email@example.com"
              :required="true"
              validation-message="Required field"
            />
            
            <FormField
              v-model="personalInfoPhone"
              type="tel"
              label="Phone Number"
              icon="mdi-phone-outline"
              placeholder="(555) 123-4567"
            />
            
            <FormField
              v-model="personalInfoLocation"
              label="Location"
              icon="mdi-map-marker-outline"
              placeholder="City, State/Country"
            />
            
            <FormField
              v-model="personalInfoLinkedIn"
              type="url"
              label="LinkedIn Profile"
              icon="mdi-linkedin"
              placeholder="linkedin.com/in/yourprofile"
            />
            
            <FormField
              v-model="personalInfoWebsite"
              type="url"
              label="Website/Portfolio"
              icon="mdi-earth"
              placeholder="yourportfolio.com"
            />
          </div>
        </div>

        <!-- Step 2: Summary -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon">
                <AppIcon name="mdi-text-box-outline" size="24" />
              </div>
              <div>
                <h3 class="section-title">Summary</h3>
              </div>
            </div>
          </div>

          <AIAssistancePanel
            v-if="aiEnabled"
            title="AI Writing Assistant"
            subtitle="Let AI help craft your professional summary"
            :primary-action="{ label: 'Generate Summary', icon: 'mdi-magic-staff' }"
            :loading="aiLoading"
            :suggestions="aiSuggestions"
            :show-tokens="true"
            :tokens="summaryTokens"
            @primary-action="generateAISummary"
            @apply-suggestion="(suggestion) => applySuggestion(suggestion.text, 'summary')"
            @insert-token="insertToken"
          />

          <div class="summary-section">
            <div class="summary-options mb-3">
              <label class="d-flex align-items-center gap-2">
                <input type="checkbox" :checked="useRoleInSummary" @change="$emit('toggle-role-summary')" />
                <span class="text-sm text-muted">Use current role/company in summary</span>
              </label>
            </div>
            
            <FormField
              v-model="resumeSummary"
              type="textarea"
              label="Professional Summary"
              icon="mdi-card-text-outline"
              placeholder="Write a compelling 2-3 sentence summary that showcases your expertise, key achievements, and career goals. Focus on what makes you unique and valuable to potential employers."
              :rows="6"
              :show-counter="true"
              counter-type="words"
              counter-range="50-100"
              helper-text="Include your key skills, years of experience, and main achievements"
              :required="true"
            >
              <template #actions>
                <div class="d-flex align-items-center gap-2">
                  <span class="text-xs text-muted">Tokens:</span>
                  <button
                    v-for="tk in summaryTokens.slice(0, 3)"
                    :key="tk"
                    type="button"
                    class="btn btn-xs btn-outline-secondary"
                    @click="insertToken(tk)"
                  >
                    {{ formatToken(tk) }}
                  </button>
                </div>
              </template>
            </FormField>
          </div>
        </div>

        <!-- Step 3: Experience -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon">
                <AppIcon name="mdi-briefcase-outline" size="24" />
              </div>
              <div>
                <h3 class="section-title">Experience</h3>
              </div>
            </div>
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-plus-circle"
              @click="addExperience"
            >
              Add Experience
            </UnifiedButton>
          </div>

          <div v-if="experienceItems.length === 0" class="empty-state-card">
            <div class="empty-icon">
              <AppIcon name="mdi-briefcase-plus-outline" size="64" />
            </div>
            <h4 class="empty-title">Add Your Work Experience</h4>
            <p class="empty-subtitle">Start building your professional story by adding your work history, achievements, and key responsibilities.</p>
            <UnifiedButton variant="primary" size="lg" leading-icon="mdi-plus-circle" @click="addExperience">
              Add First Experience
            </UnifiedButton>
          </div>

          <div v-else class="experience-list">
            <div
              v-for="(experience, index) in experienceItems"
              :key="index"
              class="experience-card"
            >
              <div class="card-header section-header">
                <div class="card-title-group">
                  <div class="card-index">{{ index + 1 }}</div>
                  <div>
                    <h4 class="card-title">{{ experience.title || 'Position Title' }}</h4>
                    <p class="card-subtitle">{{ experience.company || 'Company Name' }}</p>
                  </div>
                </div>
                <div class="card-actions">
                  <UnifiedButton
                    v-if="aiEnabled"
                    variant="gaming"
                    size="sm"
                    leading-icon="mdi-magic-staff"
                    title="AI Enhance"
                    @click="enhanceExperience(index)"
                  >
                    Enhance
                  </UnifiedButton>
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    icon="mdi-delete-outline"
                    title="Remove Experience"
                    @click="removeExperience(index)"
                  />
                </div>
              </div>

              <div class="card-content">
                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-badge-account-outline" size="16" class="field-icon" />
                      Job Title
                    </label>
                    <input
                      v-model="experience.title"
                      type="text"
                      class="field-input"
                      placeholder="e.g. Senior Software Engineer"
                      :class="{ 'valid': experience.title }"
                    />
                  </div>
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-domain" size="16" class="field-icon" />
                      Company
                    </label>
                    <input
                      v-model="experience.company"
                      type="text"
                      class="field-input"
                      placeholder="e.g. TechCorp Inc."
                      :class="{ 'valid': experience.company }"
                    />
                  </div>
                </div>
              
                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-calendar" size="16" class="field-icon" />
                      Start Date
                    </label>
                    <input
                      v-model="experience.startDate"
                      type="text"
                      class="field-input"
                      placeholder="e.g. January 2022"
                    />
                  </div>
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-calendar" size="16" class="field-icon" />
                      End Date
                    </label>
                    <input
                      v-model="experience.endDate"
                      type="text"
                      class="field-input"
                      placeholder="e.g. Present"
                    />
                  </div>
                </div>
              
                <div class="form-field full-width">
                  <label class="field-label">
                    <AppIcon name="mdi-format-list-bulleted" size="16" class="field-icon" />
                    Key Achievements & Responsibilities
                  </label>
                  <div class="textarea-container">
                    <textarea
                      v-model="experience.description"
                      class="description-textarea"
                      rows="5"
                      placeholder="• Developed and maintained scalable web applications using React and Node.js&#10;• Improved system performance by 30% through code optimization and refactoring&#10;• Led cross-functional team of 5 developers on high-priority projects&#10;• Mentored 2 junior developers and conducted code reviews"
                      :class="{ 'valid': experience.description && experience.description.length > 20 }"
                    ></textarea>
                    <div class="textarea-footer">
                      <div class="writing-tips">
                        <AppIcon name="mdi-lightbulb" size="14" />
                        <span>Use bullet points, action verbs, and quantify achievements when possible</span>
                      </div>
                      <div class="char-count">{{ experience.description?.length || 0 }} characters</div>
                    </div>
                  </div>
                  <div v-if="experience.__proposal" class="ai-proposal-card">
                    <div class="proposal-header">
                      <div class="proposal-title">
                        <AppIcon name="mdi-brain" size="16" />
                        <span>AI Enhancement Ready</span>
                      </div>
                      <div class="proposal-actions">
                        <UnifiedButton size="sm" variant="gaming" @click="applyExpProposal(index)">Apply Changes</UnifiedButton>
                        <UnifiedButton size="sm" variant="ghost" @click="clearExpProposal(index)">Dismiss</UnifiedButton>
                      </div>
                    </div>
                    <div class="proposal-diff" v-html="expDiffHtml(experience.description || '', experience.__proposal)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Education -->
        <div v-if="currentStep === 4" class="step-panel">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon">
                <AppIcon name="mdi-school-outline" size="24" />
              </div>
              <div>
                <h3 class="section-title">Education</h3>
              </div>
            </div>
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-plus-circle"
              @click="addEducation"
            >
              Add Education
            </UnifiedButton>
          </div>

          <div v-if="educationItems.length === 0" class="empty-state-card">
            <div class="empty-icon">
              <AppIcon name="mdi-school-outline" size="64" />
            </div>
            <h4 class="empty-title">Add Your Education</h4>
            <p class="empty-subtitle">Include your degrees, certifications, and relevant coursework to showcase your academic achievements.</p>
            <UnifiedButton variant="primary" size="lg" leading-icon="mdi-plus-circle" @click="addEducation">
              Add Education
            </UnifiedButton>
          </div>

          <div v-else class="education-list">
            <div
              v-for="(education, index) in educationItems"
              :key="index"
              class="education-card"
            >
              <div class="card-header section-header">
                <div class="card-title-group">
                  <div class="card-index">{{ index + 1 }}</div>
                  <div>
                    <h4 class="card-title">{{ education.degree || 'Degree' }}</h4>
                    <p class="card-subtitle">{{ education.institution || 'Institution' }}</p>
                  </div>
                </div>
                <div class="card-actions">
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    icon="mdi-delete-outline"
                    title="Remove Education"
                    @click="removeEducation(index)"
                  />
                </div>
              </div>
            
              <div class="card-content">
                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-certificate-outline" size="16" class="field-icon" />
                      Degree
                    </label>
                    <input
                      v-model="education.degree"
                      type="text"
                      class="field-input"
                      placeholder="e.g. Bachelor of Computer Science"
                      :class="{ 'valid': education.degree }"
                    />
                  </div>
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-school-outline" size="16" class="field-icon" />
                      Institution
                    </label>
                    <input
                      v-model="education.institution"
                      type="text"
                      class="field-input"
                      placeholder="e.g. University of Technology"
                      :class="{ 'valid': education.institution }"
                    />
                  </div>
                </div>
              
                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-calendar-check-outline" size="16" class="field-icon" />
                      Graduation Year
                    </label>
                    <input
                      v-model="education.year"
                      type="text"
                      class="field-input"
                      placeholder="e.g. 2024"
                    />
                  </div>
                  <div class="form-field">
                    <label class="field-label">
                      <AppIcon name="mdi-star-outline" size="16" class="field-icon" />
                      GPA (Optional)
                    </label>
                    <input
                      v-model="education.gpa"
                      type="text"
                      class="field-input"
                      placeholder="e.g. 3.8/4.0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: Skills -->
        <div v-if="currentStep === 5" class="step-panel">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon">
                <AppIcon name="mdi-cog-outline" size="24" />
              </div>
              <div>
                <h3 class="section-title">Skills</h3>
              </div>
            </div>
            <UnifiedButton
              v-if="aiEnabled"
              variant="gaming"
              leading-icon="mdi-magic-staff"
              :loading="aiLoading"
              @click="suggestSkills"
            >
              AI Suggest
            </UnifiedButton>
          </div>

          <div class="skills-input-section">
            <div class="skill-input-container">
              <label class="field-label">
                <AppIcon name="mdi-plus-circle-outline" size="16" class="field-icon" />
                Add New Skill
              </label>
              <div class="skill-input-group">
                <input
                  v-model="newSkill"
                  type="text"
                  class="skill-input"
                  placeholder="e.g. JavaScript, Project Management, Adobe Photoshop"
                  @keyup.enter="addSkill"
                  @input="suggestSkillsFromInput"
                />
                <UnifiedButton
                  variant="primary"
                  :disabled="!newSkill.trim()"
                  icon="mdi-plus"
                  @click="addSkill"
                >
                  Add
                </UnifiedButton>
              </div>
              <div v-if="skillSuggestions.length > 0" class="skill-suggestions">
                <div class="suggestion-label">Quick add:</div>
                <div class="suggestion-pills">
                  <button 
                    v-for="suggestion in skillSuggestions.slice(0, 5)"
                    :key="suggestion"
                    class="suggestion-pill"
                    @click="addSuggestedSkill(suggestion)"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="skillItems.length > 0" class="skills-display">
            <div class="skills-header">
              <h4 class="skills-title">
                <AppIcon name="mdi-format-list-checks" size="18" />
                Your Skills ({{ skillItems.length }})
              </h4>
              <div class="skills-counter">{{ skillItems.length }}/20 recommended</div>
            </div>
            <div class="skills-grid">
              <div
                v-for="(skill, index) in skillItems"
                :key="index"
                class="skill-tag"
              >
                <span class="skill-name">{{ skill.name }}</span>
                <button
                  class="skill-remove-btn"
                  title="Remove skill"
                  @click="removeSkill(index)"
                >
                  <AppIcon name="mdi-close" size="14" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-card">
            <div class="empty-icon">
              <AppIcon name="mdi-cog-outline" size="64" />
            </div>
            <h4 class="empty-title">Showcase Your Skills</h4>
            <p class="empty-subtitle">Add technical skills, soft skills, programming languages, tools, and frameworks that highlight your expertise.</p>
            <div class="popular-skills">
              <div class="popular-label">Popular skills:</div>
              <div class="popular-pills">
                <button v-for="skill in popularSkills" :key="skill" class="popular-pill" @click="addSuggestedSkill(skill)">
                  {{ skill }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 6: Review & Export -->
        <div v-if="currentStep === 6" class="step-panel">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon">
                <AppIcon name="mdi-eye-check" size="24" />
              </div>
              <div>
                <h3 class="section-title">Review & Export</h3>
              </div>
            </div>
          </div>

          <div class="review-summary">
            <p class="text-muted">Quick summary of your resume before export:</p>
            <ul>
              <li><strong>Name:</strong> {{ props.resumeData.personalInfo?.name || '—' }}</li>
              <li><strong>Email:</strong> {{ props.resumeData.personalInfo?.email || '—' }}</li>
              <li><strong>Summary:</strong> {{ (props.resumeData.summary || '').slice(0, 120) || '—' }}{{ (props.resumeData.summary||'').length > 120 ? '…' : '' }}</li>
              <li><strong>Experience:</strong> {{ (props.resumeData.experience || []).length }}</li>
              <li><strong>Education:</strong> {{ (props.resumeData.education || []).length }}</li>
              <li><strong>Skills:</strong> {{ (props.resumeData.skills || []).length }}</li>
            </ul>
          </div>

          <div class="review-actions">
            <UnifiedButton variant="primary" leading-icon="mdi-download" @click="emit('export')">Export Resume</UnifiedButton>
          </div>
        </div>

        <!-- Templates step removed to avoid redundancy with sidebar template selector -->

        <!-- Enhanced Navigation -->
        <div class="workflow-navigation">
          <div class="nav-progress">
            <div class="progress-text">{{ resumeSteps.find(s => s.id === currentStep)?.title }}</div>
            <div class="progress-bar-container">
              <div class="progress-bar-bg">
                <div 
                  class="progress-bar-fill"
                  :style="{ width: (currentStep / resumeSteps.length) * 100 + '%' }"
                ></div>
              </div>
            </div>
          </div>
        
          <div class="nav-buttons">
            <UnifiedButton
              variant="ghost"
              leading-icon="mdi-arrow-left"
              :disabled="currentStep === 1"
              @click="previousStep"
            >
              Previous
            </UnifiedButton>

            <div class="next-button-group">
              <UnifiedButton
                v-if="currentStep < resumeSteps.length"
                variant="primary"
                size="lg"
                trailing-icon="mdi-arrow-right"
                :disabled="!canProceed"
                @click="nextStep"
              >
                Continue to {{ resumeSteps.find(s => s.id === currentStep + 1)?.title }}
              </UnifiedButton>
            
              <UnifiedButton
                v-else
                variant="success"
                size="lg"
                leading-icon="mdi-check-circle-outline"
                @click="completeResume"
              >
                Complete & Preview Resume
              </UnifiedButton>
            </div>
          </div>
        
          <div v-if="!canProceed" class="validation-hint">
            <AppIcon name="mdi-information-outline" size="16" />
            <span>{{ getValidationMessage() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FormField from '@/components/ui/FormField.vue'
import AIAssistancePanel from '@/components/ui/AIAssistancePanel.vue'
import WorkflowSteps from '@/components/ui/WorkflowSteps.vue'
import { useAchievementTracker } from '@/composables/useAchievementTracker'

// Props
const _props = defineProps({
  resumeData: {
    type: Object,
    required: true
  },
  currentStep: {
    type: Number,
    default: 1
  },
  aiEnabled: {
    type: Boolean,
    default: false
  },
  useRoleInSummary: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:resumeData', 'update:currentStep', 'request-ai-assistance', 'export', 'toggle-role-summary'])

// State
const aiLoading = ref(false)
const aiSuggestions = ref([])
const summaryTextareaRef = ref(null)
const summaryTokens = [
  '{{currentRole}}', '{{currentCompany}}', '{{yearsExperience}}',
  '{{name}}', '{{email}}', '{{phone}}', '{{location}}',
  '{{website}}', '{{linkedin}}', '{{github}}', '{{portfolio}}'
]
const newSkill = ref('')
const skillSuggestions = ref([])
const toast = useToast()
const store = useAppStore()
const { trackDocumentAchievement } = useAchievementTracker()

// Helper function to update resume data
const updateResumeData = (path, value) => {
  const newData = JSON.parse(JSON.stringify(props.resumeData))
  
  // Navigate to the nested property and update it
  const keys = path.split('.')
  let current = newData
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  
  current[keys[keys.length - 1]] = value
  emit('update:resumeData', newData)
}

// Computed properties for personal info
const personalInfoName = computed({
  get: () => props.resumeData.personalInfo?.name || '',
  set: (value) => updateResumeData('personalInfo.name', value)
})

const personalInfoEmail = computed({
  get: () => props.resumeData.personalInfo?.email || '',
  set: (value) => updateResumeData('personalInfo.email', value)
})

const personalInfoPhone = computed({
  get: () => props.resumeData.personalInfo?.phone || '',
  set: (value) => updateResumeData('personalInfo.phone', value)
})

const personalInfoLocation = computed({
  get: () => props.resumeData.personalInfo?.location || '',
  set: (value) => updateResumeData('personalInfo.location', value)
})

const personalInfoWebsite = computed({
  get: () => props.resumeData.personalInfo?.website || '',
  set: (value) => updateResumeData('personalInfo.website', value)
})

const personalInfoLinkedIn = computed({
  get: () => props.resumeData.personalInfo?.linkedin || '',
  set: (value) => updateResumeData('personalInfo.linkedin', value)
})

const _personalInfoGitHub = computed({
  get: () => props.resumeData.personalInfo?.gitHub || '',
  set: (value) => updateResumeData('personalInfo.gitHub', value)
})

const _personalInfoPortfolio = computed({
  get: () => props.resumeData.personalInfo?.portfolio || '',
  set: (value) => updateResumeData('personalInfo.portfolio', value)
})

const _personalInfoSummary = computed({
  get: () => props.resumeData.personalInfo?.summary || '',
  set: (value) => updateResumeData('personalInfo.summary', value)
})

const resumeSummary = computed({
  get: () => props.resumeData.summary || '',
  set: (value) => updateResumeData('summary', value)
})

// Create computed properties for arrays to handle v-for properly
const experienceItems = computed(() => props.resumeData.experience || [])
const educationItems = computed(() => props.resumeData.education || [])
const skillItems = computed(() => props.resumeData.skills || [])

// Popular skills for suggestions
const popularSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Project Management', 
  'Communication', 'Leadership', 'Problem Solving', 'Git', 'SQL'
]

// Resume Steps Configuration
const resumeSteps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Summary' },
  { id: 3, title: 'Experience' },
  { id: 4, title: 'Education' },
  { id: 5, title: 'Skills' },
  { id: 6, title: 'Review & Export' }
]

// Computed

const canProceed = computed(() => {
  switch (props.currentStep) {
    case 1:
      return props.resumeData.personalInfo.name && props.resumeData.personalInfo.email
    case 2:
      return props.resumeData.summary && props.resumeData.summary.length > 20
    case 3:
      return props.resumeData.experience.length > 0
    case 4:
      return props.resumeData.education.length > 0
    case 5:
      return props.resumeData.skills.length > 0
  // No step 6 (Templates) here; template selection lives in the sidebar
    default:
      return true
  }
})

// Methods

const nextStep = () => {
  if (canProceed.value && props.currentStep < resumeSteps.length) {
    emit('update:currentStep', props.currentStep + 1)
  }
}

const previousStep = () => {
  if (props.currentStep > 1) {
    emit('update:currentStep', props.currentStep - 1)
  }
}

const _wordCount = (text) => {
  return text ? text.trim().split(/\s+/).length : 0
}

const _resumeIsValidEmail = (email) => {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function formatToken(token) {
  return token.replace('{{', '').replace('}}', '')
}

function insertToken(token) {
  try {
    const el = summaryTextareaRef.value
    if (!el) {
      // Fallback: append
      const sep = props.resumeData.summary && !/\s$/.test(props.resumeData.summary) ? ' ' : ''
      updateResumeData('summary', (props.resumeData.summary || '') + sep + token)
      return
    }
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    const text = props.resumeData.summary || ''
    updateResumeData('summary', text.slice(0, start) + token + text.slice(end))
    // Restore caret after inserted token
    requestAnimationFrame(() => {
      try {
        el.focus()
        el.selectionStart = el.selectionEnd = start + token.length
      } catch {}
    })
  } catch {
    // No-op on failure
  }
}

// Import comprehensive data from profile
const importFromProfile = () => {
  try {
    const profile = store.userProfile || {}
    const personalInfo = profile.personalInfo || {}
    
    // Import personal information
    const updatedPersonalInfo = {
      ...props.resumeData.personalInfo,
      name: personalInfo.name || props.resumeData.personalInfo.name || '',
      email: personalInfo.email || props.resumeData.personalInfo.email || '',
      phone: personalInfo.phone || props.resumeData.personalInfo.phone || '',
      location: personalInfo.location || props.resumeData.personalInfo.location || '',
      website: personalInfo.website || props.resumeData.personalInfo.website || '',
      linkedin: personalInfo.linkedIn || props.resumeData.personalInfo.linkedin || '',
      github: personalInfo.github || props.resumeData.personalInfo.github || ''
    }
    updateResumeData('personalInfo', updatedPersonalInfo)
    
    // Import professional summary
    if (personalInfo.summary && !props.resumeData.summary) {
      updateResumeData('summary', personalInfo.summary)
    }
    
    // Create experience entry from current role if available
    if (personalInfo.currentRole && personalInfo.currentCompany && experienceItems.value.length === 0) {
      const newExperience = [...props.resumeData.experience, {
        title: personalInfo.currentRole,
        company: personalInfo.currentCompany,
        startDate: '',
        endDate: personalInfo.yearsExperience ? `Present (${personalInfo.yearsExperience} years experience)` : 'Present',
        description: 'Added from profile information. Please update with specific achievements and responsibilities.',
        current: true
      }]
      updateResumeData('experience', newExperience)
    }
    
    // Import skills if available in profile
    const profileSkills = profile.skills || []
    if (profileSkills.length > 0 && skillItems.value.length === 0) {
      const newSkills = profileSkills.map(skill => ({ name: skill }))
      updateResumeData('skills', newSkills)
    }
    
    toast.success('Imported comprehensive profile data')
    
    // Track achievement for profile import
    trackDocumentAchievement('profile_import')
    
  } catch (e) {
    console.error('Profile import error:', e)
    toast.error('Failed to import profile details')
  }
}

// Experience Methods
const addExperience = () => {
  const newExp = {
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: ''
  }
  const updatedExperience = [...props.resumeData.experience, newExp]
  updateResumeData('experience', updatedExperience)
  // Track achievement for adding experience
  trackDocumentAchievement('experience_added')
}

const removeExperience = (index) => {
  const updatedExperience = [...props.resumeData.experience]
  updatedExperience.splice(index, 1)
  updateResumeData('experience', updatedExperience)
}

// Inline AI proposal helpers for experience cards
/* eslint-disable no-useless-escape */
function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]) ) }
function tok(s) { return (s||'').split(/(\s+|[.,!?;:()"'\-]+)/).filter(t=>t!=='') }
function expDiffHtml(current, proposed) {
  const a = tok(current), b = tok(proposed)
  const n=a.length, m=b.length
  const dp = Array(n+1).fill(0).map(()=>Array(m+1).fill(0))
  for (let i=1;i<=n;i++) for (let j=1;j<=m;j++) dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1])
  const MB=Array(m).fill(false); const MA=Array(n).fill(false)
  let i=n, j=m; while(i>0&&j>0){ if(a[i-1]===b[j-1]){MA[i-1]=MB[j-1]=true;i--;j--} else if(dp[i-1][j]>=dp[i][j-1]) i--; else j-- }
  let htmlB=''
  for (let k=0;k<m;k++){ const t=b[k]; htmlB+=t.trim()? (MB[k]?escapeHtml(t):`<span class=\"diff-added\">${escapeHtml(t)}</span>`):escapeHtml(t) }
  return htmlB
}

function applyExpProposal(idx){
  const e = props.resumeData.experience[idx]
  if (!e || !e.__proposal) return
  const updatedExperience = [...props.resumeData.experience]
  updatedExperience[idx] = { ...e, description: e.__proposal }
  delete updatedExperience[idx].__proposal
  updateResumeData('experience', updatedExperience)
  toast.success('Experience updated')
}
function clearExpProposal(idx){
  const e = props.resumeData.experience[idx]
  if (!e) return
  const updatedExperience = [...props.resumeData.experience]
  updatedExperience[idx] = { ...e }
  delete updatedExperience[idx].__proposal
  updateResumeData('experience', updatedExperience)
}

const enhanceExperience = async (index) => {
  emit('request-ai-assistance', {
    type: 'enhance-experience',
    data: props.resumeData.experience[index],
    index
  })
}

// Education Methods
const addEducation = () => {
  const newEdu = {
    degree: '',
    institution: '',
    year: '',
    gpa: ''
  }
  const updatedEducation = [...props.resumeData.education, newEdu]
  updateResumeData('education', updatedEducation)
  // Track achievement for adding education
  trackDocumentAchievement('education_added')
}

const removeEducation = (index) => {
  const updatedEducation = [...props.resumeData.education]
  updatedEducation.splice(index, 1)
  updateResumeData('education', updatedEducation)
}

// Skills Methods
const addSkill = () => {
  if (newSkill.value.trim()) {
    const updatedSkills = [...props.resumeData.skills, { name: newSkill.value.trim() }]
    updateResumeData('skills', updatedSkills)
    newSkill.value = ''
    // Track achievement for adding skills
    trackDocumentAchievement('skill_added')
  }
}

const removeSkill = (index) => {
  const updatedSkills = [...props.resumeData.skills]
  updatedSkills.splice(index, 1)
  updateResumeData('skills', updatedSkills)
}

const suggestSkills = async () => {
  aiLoading.value = true
  emit('request-ai-assistance', {
    type: 'suggest-skills',
    data: props.resumeData
  })
  aiLoading.value = false
}

// AI Methods
const generateAISummary = async () => {
  aiLoading.value = true
  emit('request-ai-assistance', {
    type: 'generate-summary',
    data: props.resumeData
  })
  aiLoading.value = false
}

const applySuggestion = (text, field) => {
  if (field === 'summary') {
    updateResumeData('summary', text)
  }
  toast.success('Suggestion applied')
}

const completeResume = () => {
  toast.success('Resume completed!')
  emit('export')
}

// New utility methods
const suggestSkillsFromInput = () => {
  const input = newSkill.value.toLowerCase()
  if (input.length < 2) {
    skillSuggestions.value = []
    return
  }
  
  const suggestions = popularSkills.filter(skill => 
    skill.toLowerCase().includes(input) && 
    !skillItems.value.some(existing => existing.name.toLowerCase() === skill.toLowerCase())
  )
  skillSuggestions.value = suggestions.slice(0, 5)
}

const addSuggestedSkill = (skillName) => {
  if (!skillItems.value.some(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
    const updatedSkills = [...props.resumeData.skills, { name: skillName }]
    updateResumeData('skills', updatedSkills)
    toast.success(`Added ${skillName}`)
  }
}

const getValidationMessage = () => {
  switch (props.currentStep) {
    case 1:
      if (!props.resumeData.personalInfo.name) return 'Please enter your full name'
      if (!props.resumeData.personalInfo.email) return 'Please enter your email address'
      return 'Complete required fields to continue'
    case 2:
      return 'Write a professional summary (minimum 20 characters)'
    case 3:
      return 'Add at least one work experience'
    case 4:
      return 'Add your educational background'
    case 5:
      return 'Add your skills and expertise'
    default:
      return 'Complete this section to continue'
  }
}
</script>

<style scoped>
.resume-workflow {
  max-width: 100%;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

/* Inline diff styling */
.diff-box {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  padding: 0.75rem;
  min-height: 120px;
  max-height: 260px;
  overflow: auto;
  font-size: 0.9rem;
}
.diff-added { background: rgba(16, 185, 129, 0.22); }
.diff-removed { background: rgba(239, 68, 68, 0.25); text-decoration: line-through; }

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
  min-width: 200px;
}

.step-item:hover {
  background: var(--glass-hover-bg);
}

.step-item.active {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
}

.step-item.completed {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glass-surface);
  font-weight: 600;
  font-size: 0.875rem;
}

.step-item.active .step-indicator {
  background: var(--text-on-primary);
  color: var(--color-primary-500);
}

.step-item.completed .step-indicator {
  background: var(--color-success-500);
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.75rem;
  opacity: 0.7;
}

.workflow-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.form-control {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  transition: all var(--duration-fast);
}

.form-control:focus {
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px var(--color-primary-200);
  outline: none;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.skill-remove {
  background: none;
  border: none;
  color: var(--color-primary-500);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: all var(--duration-fast);
}

.skill-remove:hover {
  background: var(--color-primary-200);
}

.empty-state {
  color: var(--text-secondary);
}

.suggestion-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  transition: all var(--duration-fast);
}

.suggestion-card:hover {
  border-color: var(--color-primary-300);
  background: var(--glass-hover-bg);
}

.workflow-navigation {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--glass-border);
}

@media (max-width: 768px) {
  .steps-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .step-item {
    min-width: auto;
  }
  
  .workflow-content {
    padding: 1rem;
  }
}
</style>
