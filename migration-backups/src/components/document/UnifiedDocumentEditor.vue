<template>
  <div class="unified-document-editor">
    <!-- Template Selection Bar -->
    <div class="template-bar">
      <div class="template-selector">
        <label class="template-label">Template:</label>
        <select v-model="selectedTemplate" class="template-select">
          <option value="modern">Modern Gaming</option>
          <option value="classic">Professional Classic</option>
          <option value="creative">Creative Portfolio</option>
          <option value="technical">Technical Focus</option>
        </select>
      </div>
      
      <div class="ai-tools-inline">
        <UnifiedButton
          variant="outline" 
          size="sm"
          leading-icon="mdi-lightbulb"
          :disabled="!aiReady"
          @click="getAISuggestions"
        >
          AI Suggestions
        </UnifiedButton>
        <UnifiedButton
          variant="gaming" 
          size="sm"
          leading-icon="mdi-auto-fix"
          :disabled="!aiReady || !hasContent"
          @click="aiOptimize"
        >
          AI Optimize
        </UnifiedButton>
      </div>
    </div>

    <!-- Main Editor -->
    <div class="editor-container">
      <!-- Resume Content -->
      <div v-if="documentType === 'resume'" class="document-content">
        <!-- Personal Info Section -->
        <section class="editor-section">
          <div class="section-header">
            <h3>Personal Information</h3>
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-brain"
              :disabled="!aiReady"
              @click="aiEnhanceSection('personal')"
            >
              AI Enhance
            </UnifiedButton>
          </div>
          <div class="form-grid">
            <input 
              :value="props.resumeData.personalInfo?.name || ''"
              placeholder="Full Name"
              class="form-input" 
              @input="updatePersonalInfo('name', $event.target.value)" 
            />
            <input 
              :value="props.resumeData.personalInfo?.email || ''"
              placeholder="Email"
              class="form-input" 
              @input="updatePersonalInfo('email', $event.target.value)" 
            />
            <input 
              :value="props.resumeData.personalInfo?.phone || ''"
              placeholder="Phone"
              class="form-input" 
              @input="updatePersonalInfo('phone', $event.target.value)" 
            />
            <input 
              :value="props.resumeData.personalInfo?.location || ''"
              placeholder="Location"
              class="form-input" 
              @input="updatePersonalInfo('location', $event.target.value)" 
            />
            <input 
              :value="props.resumeData.personalInfo?.website || ''"
              placeholder="Website/Portfolio"
              class="form-input" 
              @input="updatePersonalInfo('website', $event.target.value)" 
            />
            <input 
              :value="props.resumeData.personalInfo?.linkedin || ''"
              placeholder="LinkedIn"
              class="form-input" 
              @input="updatePersonalInfo('linkedin', $event.target.value)" 
            />
          </div>
          <textarea 
            :value="props.resumeData.summary || ''"
            placeholder="Professional summary - AI can help write this based on your profile..."
            class="form-textarea"
            rows="3"
            @input="updateResumeData({summary: $event.target.value})"
          ></textarea>
        </section>

        <!-- Experience Section -->
        <section class="editor-section">
          <div class="section-header">
            <h3>Experience</h3>
            <div class="section-actions">
              <UnifiedButton
                variant="ghost"
                size="sm"
                leading-icon="mdi-brain"
                :disabled="!aiReady"
                @click="aiEnhanceSection('experience')"
              >
                AI Enhance
              </UnifiedButton>
              <UnifiedButton
                variant="outline"
                size="sm"
                leading-icon="mdi-plus"
                @click="addExperience"
              >
                Add
              </UnifiedButton>
            </div>
          </div>
          
          <div v-for="(exp, index) in props.resumeData.experience || []" :key="index" class="experience-item">
            <div class="item-header">
              <input 
                :value="exp.company || ''"
                placeholder="Company"
                class="form-input company-input" 
                @input="updateExperienceField(index, 'company', $event.target.value)" 
              />
              <input 
                :value="exp.title || ''"
                placeholder="Job Title"
                class="form-input title-input" 
                @input="updateExperienceField(index, 'title', $event.target.value)" 
              />
              <UnifiedButton
                variant="ghost"
                size="sm"
                trailing-icon="mdi-delete"
                @click="removeExperience(index)"
              />
            </div>
            <div class="date-range">
              <input 
                :value="exp.startDate || ''"
                placeholder="Start Date"
                class="form-input date-input" 
                @input="updateExperienceField(index, 'startDate', $event.target.value)" 
              />
              <input 
                :value="exp.endDate || ''"
                placeholder="End Date"
                class="form-input date-input" 
                @input="updateExperienceField(index, 'endDate', $event.target.value)" 
              />
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :checked="exp.current || false"
                  @change="updateExperienceField(index, 'current', $event.target.checked)"
                />
                Current
              </label>
            </div>
            <textarea 
              :value="exp.description || ''"
              placeholder="Describe your role, achievements, and gaming industry experience..."
              class="form-textarea"
              rows="3"
              @input="updateExperienceField(index, 'description', $event.target.value)"
            ></textarea>
          </div>
        </section>

        <!-- Skills Section -->
        <section class="editor-section">
          <div class="section-header">
            <h3>Skills</h3>
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-brain"
              :disabled="!aiReady"
              @click="aiEnhanceSection('skills')"
            >
              AI Enhance
            </UnifiedButton>
          </div>
          <div class="skills-section">
            <textarea 
              v-model="skillsText" 
              placeholder="List your skills separated by commas (e.g. JavaScript, Unity, Team Leadership, C++, Game Design, Communication...)"
              class="skills-textarea"
              rows="4"
            ></textarea>
            <div class="skills-help">
              Separate skills with commas. Include technical, gaming, and soft skills.
            </div>
          </div>
        </section>

        <!-- Education Section -->
        <section class="editor-section">
          <div class="section-header">
            <h3>Education</h3>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-plus"
              @click="addEducation"
            >
              Add
            </UnifiedButton>
          </div>
          
          <div v-for="(edu, index) in resumeData.education" :key="index" class="education-item">
            <div class="item-header">
              <input v-model="edu.institution" placeholder="Institution" class="form-input" />
              <input v-model="edu.degree" placeholder="Degree" class="form-input" />
              <UnifiedButton
                variant="ghost"
                size="sm"
                trailing-icon="mdi-delete"
                @click="removeEducation(index)"
              />
            </div>
            <div class="date-range">
              <input v-model="edu.startDate" placeholder="Start Year" class="form-input date-input" />
              <input v-model="edu.endDate" placeholder="End Year" class="form-input date-input" />
            </div>
          </div>
        </section>
      </div>

      <!-- Cover Letter Content -->
      <div v-else class="document-content">
        <!-- Letter Header -->
        <section class="editor-section">
          <div class="section-header">
            <h3>Cover Letter Details</h3>
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-brain"
              :disabled="!aiReady"
              @click="aiEnhanceSection('header')"
            >
              AI Enhance
            </UnifiedButton>
          </div>
          <div class="form-grid">
            <input 
              :value="props.coverLetterData.jobInfo?.company || ''"
              placeholder="Company Name"
              class="form-input" 
              @input="updateJobInfo('company', $event.target.value)" 
            />
            <input 
              :value="props.coverLetterData.jobInfo?.position || ''"
              placeholder="Position Title"
              class="form-input" 
              @input="updateJobInfo('position', $event.target.value)" 
            />
            <input 
              :value="props.coverLetterData.jobInfo?.hiringManager || ''"
              placeholder="Hiring Manager (optional)"
              class="form-input" 
              @input="updateJobInfo('hiringManager', $event.target.value)" 
            />
          </div>
        </section>

        <!-- Letter Content -->
        <section class="editor-section">
          <div class="section-header">
            <h3>Letter Content</h3>
            <div class="section-actions">
              <select v-model="coverLetterData.tone" class="tone-select">
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="confident">Confident</option>
                <option value="creative">Creative</option>
              </select>
              <UnifiedButton
                variant="gaming"
                size="sm"
                leading-icon="mdi-brain"
                :disabled="!aiReady"
                @click="aiGenerateFullLetter"
              >
                AI Write Letter
              </UnifiedButton>
            </div>
          </div>
          
          <div class="letter-sections">
            <div class="letter-section">
              <label>Opening Paragraph</label>
              <textarea 
                :value="props.coverLetterData.content?.opening || ''"
                placeholder="Introduce yourself and express interest in the position..."
                class="form-textarea"
                rows="3"
                @input="updateCoverLetterContent('opening', $event.target.value)"
              ></textarea>
            </div>
            
            <div class="letter-section">
              <label>Body Paragraphs</label>
              <textarea 
                :value="props.coverLetterData.content?.body || ''"
                placeholder="Highlight relevant experience and skills, especially gaming industry background..."
                class="form-textarea"
                rows="6"
                @input="updateCoverLetterContent('body', $event.target.value)"
              ></textarea>
            </div>
            
            <div class="letter-section">
              <label>Closing Paragraph</label>
              <textarea 
                :value="props.coverLetterData.content?.closing || ''"
                placeholder="Thank them and include call to action..."
                class="form-textarea"
                rows="2"
                @input="updateCoverLetterContent('closing', $event.target.value)"
              ></textarea>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- AI Suggestions Panel -->
    <div v-if="aiSuggestions.length > 0" class="suggestions-panel">
      <div class="suggestions-header">
        <h4>AI Suggestions</h4>
        <UnifiedButton
          variant="ghost"
          size="sm"
          trailing-icon="mdi-close"
          @click="aiSuggestions = []"
        />
      </div>
      <div class="suggestions-list">
        <div v-for="(suggestion, index) in aiSuggestions" :key="index" class="suggestion-item">
          <div class="suggestion-text">{{ suggestion.text }}</div>
          <div class="suggestion-actions">
            <UnifiedButton
              variant="outline"
              size="sm"
              @click="applySuggestion(suggestion)"
            >
              Apply
            </UnifiedButton>
            <UnifiedButton
              variant="ghost"
              size="sm"
              @click="dismissSuggestion(index)"
            >
              Dismiss
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, withDefaults } from 'vue'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
interface Props {
  documentType: 'resume' | 'cover-letter'
  resumeData: any
  coverLetterData: any
  aiReady?: boolean
  profileData?: any
}

const props = withDefaults(defineProps<Props>(), {
  aiReady: false
})

// Emits
const emit = defineEmits<{
  'update-resume': [data: any]
  'update-cover-letter': [data: any]
  'template-change': [template: string]
  'ai-request': [request: any]
}>()

const toast = useToast()

// State
const selectedTemplate = ref('modern')
const aiSuggestions = ref<any[]>([])

// Computed for skills text areas (matching actual data structure: Array<{name: string}>)
const skillsText = computed({
  get: () => {
    if (!props.resumeData.skills || !Array.isArray(props.resumeData.skills)) return ''
    return props.resumeData.skills.map(skill => skill.name).join(', ')
  },
  set: (value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }))
    updateResumeData({ skills })
  }
})

const hasContent = computed(() => {
  if (props.documentType === 'resume') {
    return props.resumeData.personalInfo?.name || 
           props.resumeData.experience?.length > 0 ||
           props.resumeData.summary
  }
  return props.coverLetterData.content?.opening ||
         props.coverLetterData.content?.body ||
         props.coverLetterData.jobInfo?.company
})

// Methods
const updateResumeData = (updates: any) => {
  emit('update-resume', { ...props.resumeData, ...updates })
}

const updateCoverLetterData = (updates: any) => {
  emit('update-cover-letter', { ...props.coverLetterData, ...updates })
}

const updatePersonalInfo = (field: string, value: string) => {
  const personalInfo = { ...props.resumeData.personalInfo, [field]: value }
  updateResumeData({ personalInfo })
}

const updateExperienceField = (index: number, field: string, value: any) => {
  const experience = [...(props.resumeData.experience || [])]
  experience[index] = { ...experience[index], [field]: value }
  updateResumeData({ experience })
}

const updateJobInfo = (field: string, value: string) => {
  const jobInfo = { ...props.coverLetterData.jobInfo, [field]: value }
  updateCoverLetterData({ jobInfo })
}

const addExperience = () => {
  const newExp = {
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: ''
  }
  updateResumeData({
    experience: [...(props.resumeData.experience || []), newExp]
  })
}

const removeExperience = (index: number) => {
  const experience = [...props.resumeData.experience]
  experience.splice(index, 1)
  updateResumeData({ experience })
}

const addEducation = () => {
  const newEdu = {
    id: Date.now().toString(),
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    achievements: []
  }
  updateResumeData({
    education: [...(props.resumeData.education || []), newEdu]
  })
}

const removeEducation = (index: number) => {
  const education = [...props.resumeData.education]
  education.splice(index, 1)
  updateResumeData({ education })
}

// AI Enhancement Methods
const aiEnhanceSection = (section: string) => {
  if (!props.aiReady) return
  
  emit('ai-request', {
    type: 'enhance-section',
    section,
    documentType: props.documentType,
    currentData: props.documentType === 'resume' ? props.resumeData : props.coverLetterData,
    profileData: props.profileData
  })
}

const getAISuggestions = async () => {
  if (!props.aiReady) return
  
  try {
    const result = await emit('ai-request', {
      type: 'get-suggestions',
      documentType: props.documentType,
      currentData: props.documentType === 'resume' ? props.resumeData : props.coverLetterData,
      profileData: props.profileData
    })
    
    // Real AI suggestions will be populated via the ai-request emit
    // The parent component handles the actual AI service call
    toast.success('AI suggestions requested successfully')
  } catch (error) {
    console.error('Failed to get AI suggestions:', error)
    toast.error('Failed to get AI suggestions')
  }
}

const aiOptimize = () => {
  if (!props.aiReady || !hasContent.value) return
  
  emit('ai-request', {
    type: 'optimize-full-document',
    documentType: props.documentType,
    currentData: props.documentType === 'resume' ? props.resumeData : props.coverLetterData,
    profileData: props.profileData,
    template: selectedTemplate.value
  })
}

const aiGenerateFullLetter = () => {
  if (!props.aiReady) return
  
  emit('ai-request', {
    type: 'generate-cover-letter',
    jobInfo: props.coverLetterData.jobInfo,
    tone: props.coverLetterData.tone,
    profileData: props.profileData
  })
}

const applySuggestion = (suggestion: any) => {
  if (!suggestion.section || !suggestion.text) return
  
  // Apply the suggestion based on its section
  emit('ai-request', {
    type: 'apply-suggestion',
    suggestion,
    documentType: props.documentType,
    currentData: props.documentType === 'resume' ? props.resumeData : props.coverLetterData
  })
  
  toast.success(`Applied suggestion to ${suggestion.section} section`)
  dismissSuggestion(aiSuggestions.value.indexOf(suggestion))
}

const dismissSuggestion = (index: number) => {
  aiSuggestions.value.splice(index, 1)
}

// Watch template changes
watch(selectedTemplate, (newTemplate) => {
  emit('template-change', newTemplate)
})
</script>

<style scoped>
.unified-document-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.template-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.template-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.template-label {
  font-weight: 500;
  color: var(--text-primary);
}

.template-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.ai-tools-inline {
  display: flex;
  gap: var(--spacing-2);
}

.editor-container {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.document-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--glass-border);
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-3);
}

.form-input {
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color var(--duration-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.form-textarea {
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color var(--duration-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.experience-item,
.education-item {
  padding: var(--spacing-4);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.item-header {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--spacing-3);
  align-items: center;
}

.date-range {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.date-input {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-4);
}

.skill-category {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skill-category label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.skills-textarea {
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.letter-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.letter-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.letter-section label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.tone-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.suggestions-panel {
  background: var(--glass-surface);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
}

.suggestions-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.suggestion-text {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Responsive */
@media (max-width: 768px) {
  .template-bar {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }

  .ai-tools-inline {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .item-header {
    grid-template-columns: 1fr;
  }

  .skills-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }

  .suggestion-actions {
    justify-content: center;
  }
}
</style>