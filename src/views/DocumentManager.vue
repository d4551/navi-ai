<template>
  <StandardPageLayout page-type="gaming" content-spacing="normal" max-width="xl">
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="md" priority="primary">
        <!-- Document Type Quick Switch -->
        <div class="doc-type-switcher">
          <UnifiedButton
            v-for="docType in documentTypes"
            :key="docType.value"
            :variant="activeDocumentType === docType.value ? 'gaming' : 'ghost'"
            size="sm"
            :leading-icon="docType.icon"
            @click="activeDocumentType = docType.value"
          >
            {{ docType.label }}
          </UnifiedButton>
        </div>

        <!-- Template Selector -->
        <div class="template-selector">
          <select
            v-model="selectedTemplate"
            class="template-select unified-select"
          >
            <option value="">Choose Template</option>
            <option v-for="template in availableTemplates" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
        </div>

        <!-- AI Enhancement -->
        <UnifiedButton
          v-if="aiReady"
          variant="gaming"
          size="md"
          leading-icon="mdi-robot"
          :disabled="!aiReady || aiProcessing"
          :loading="aiProcessing"
          @click="enhanceWithAI"
        >
          AI Enhance
        </UnifiedButton>

        <!-- AI Status (only show if offline) -->
        <div v-else class="ai-status-warning">
          <AppIcon name="mdi-alert-circle-outline" size="14" />
          <span>AI Offline</span>
        </div>

        <!-- Preview & Export -->
        <UnifiedButton
          variant="outline"
          size="md"
          leading-icon="mdi-eye"
          @click="togglePreview"
        >
          Preview
        </UnifiedButton>

        <UnifiedButton
          variant="primary"
          size="md"
          leading-icon="mdi-download"
          @click="showExportModal = true"
        >
          Export
        </UnifiedButton>
      </HeaderActions>
    </template>

    <!-- Enhanced Dashboard Stats -->
    <div class="document-dashboard">
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="mdi-file-document-outline" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ documentCount }}</div>
            <div class="stat-label">Documents</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="mdi-brain" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ atsScore }}%</div>
            <div class="stat-label">ATS Score</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="mdi-clock-outline" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ lastModified }}</div>
            <div class="stat-label">Last Modified</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="mdi-star-outline" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ completionScore }}%</div>
            <div class="stat-label">Completion</div>
          </div>
        </div>
      </div>

      <div class="dashboard-actions">
        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-import"
          :disabled="profileImporting"
          :loading="profileImporting"
          @click="importFromProfile"
        >
          Import Profile
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-history"
          @click="showVersionHistory = true"
        >
          Version History
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-palette"
          @click="showThemeSelector = true"
        >
          Themes
        </UnifiedButton>
      </div>
    </div>

    <!-- Document Type Tabs -->
    <div class="document-type-tabs">
      <div class="tab-list">
        <button
          v-for="docType in documentTypes"
          :key="docType.value"
          :class="{ active: activeDocumentType === docType.value }"
          class="doc-tab"
          @click="activeDocumentType = docType.value"
        >
          <AppIcon :name="docType.icon" />
          <span>{{ docType.label }}</span>
          <div v-if="getDocumentStatus(docType.value)" class="tab-indicator" :class="getDocumentStatus(docType.value)"></div>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="document-workspace" :class="workspaceTheme">
      <!-- Job Context Banner -->
      <div v-if="jobDescription" class="job-context-banner">
        <div class="job-info">
          <AppIcon name="mdi-briefcase-outline" />
          <div class="job-details">
            <div class="job-title">{{ jobInfo.company ? `${jobInfo.company} - ${jobInfo.position}` : 'Job Context Active' }}</div>
            <div class="job-meta">{{ jobInfo.location || 'Remote' }} • {{ jobInfo.type || 'Full-time' }}</div>
          </div>
          <div class="job-metrics">
            <div v-if="atsScore > 0" class="ats-score" :class="getATSScoreClass(atsScore)">
              {{ atsScore }}% ATS Match
            </div>
            <div class="match-score">{{ skillMatch }}% Skills Match</div>
          </div>
        </div>
        <UnifiedButton
          variant="ghost"
          size="sm"
          icon="mdi-close"
          @click="clearJobContext"
        />
      </div>

      <!-- AI Suggestions Panel -->
      <div v-if="aiSuggestions.length > 0" class="ai-suggestions-panel">
        <div class="suggestions-header">
          <AppIcon name="mdi-lightbulb-outline" />
          <span>AI Suggestions</span>
          <UnifiedButton
            variant="ghost"
            size="xs"
            icon="mdi-close"
            @click="dismissSuggestions"
          />
        </div>
        <div class="suggestions-list">
          <div
            v-for="suggestion in aiSuggestions"
            :key="suggestion.id"
            class="suggestion-item"
            @click="applySuggestion(suggestion)"
          >
            <AppIcon :name="suggestion.icon" />
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-description">{{ suggestion.description }}</div>
            </div>
            <div class="suggestion-confidence">{{ suggestion.confidence }}%</div>
          </div>
        </div>
      </div>

      <!-- Document Editor with Split Layout -->
      <div class="editor-container">
        <div class="editor-panel" :class="{ 'split-view': showLivePreview }">
          <div class="editor-header">
            <div class="editor-info">
              <h3>{{ documentTypes.find(t => t.value === activeDocumentType)?.label }}</h3>
              <div class="editor-meta">
                <span>{{ getWordCount() }} words</span>
                <span>•</span>
                <span>Last saved {{ lastSavedTime }}</span>
              </div>
            </div>
            <div class="editor-actions">
              <UnifiedButton
                variant="ghost"
                size="sm"
                :leading-icon="showLivePreview ? 'mdi-view-sequential' : 'mdi-view-split-vertical'"
                @click="toggleLivePreview"
              >
                {{ showLivePreview ? 'Single View' : 'Split View' }}
              </UnifiedButton>
            </div>
          </div>

          <!-- Unified Document Editor -->
          <UnifiedDocumentEditor
            :document-type="activeDocumentType"
            :resume-data="resumeData"
            :cover-letter-data="coverLetterData"
            :ai-ready="aiReady"
            :profile-data="profileData"
            :theme="selectedDocumentTheme"
            :template="selectedTemplate"
            @update-resume="handleResumeUpdate"
            @update-cover-letter="handleCoverLetterUpdate"
            @template-change="selectTemplate"
            @ai-request="handleAIRequest"
            @word-count-change="updateWordCount"
          />
        </div>

        <!-- Live Preview Panel -->
        <div v-if="showLivePreview" class="preview-panel">
          <div class="preview-header">
            <div class="preview-info">
              <h3>Live Preview</h3>
              <div class="preview-meta">
                <select v-model="previewFormat" class="format-select">
                  <option value="formatted">Formatted</option>
                  <option value="pdf">PDF View</option>
                  <option value="ats">ATS View</option>
                </select>
              </div>
            </div>
            <div class="preview-actions">
              <UnifiedButton
                variant="ghost"
                size="sm"
                leading-icon="mdi-refresh"
                @click="refreshPreview"
              >
                Refresh
              </UnifiedButton>
            </div>
          </div>

          <div class="preview-content">
            <DocumentPreview
              :document-type="activeDocumentType"
              :document-data="currentDocumentData"
              :template="selectedTemplate"
              :theme="selectedDocumentTheme"
              :format="previewFormat"
            />
          </div>
        </div>
      </div>
    </div>
    

    <!-- Enhanced Modals -->
    <DocumentPreviewModal
      v-if="showPreviewModal"
      :show="showPreviewModal"
      :document-type="activeDocumentType"
      :document-data="currentDocumentData"
      :template="selectedTemplate"
      :theme="selectedDocumentTheme"
      @close="showPreviewModal = false"
      @export="handleExport"
      @theme-change="updateDocumentTheme"
    />

    <!-- Export Modal -->
    <DocumentExportModal
      v-if="showExportModal"
      :show="showExportModal"
      :document-type="activeDocumentType"
      :document-data="currentDocumentData"
      :template="selectedTemplate"
      :theme="selectedDocumentTheme"
      @close="showExportModal = false"
      @export="handleAdvancedExport"
    />

    <!-- Theme Selector Modal -->
    <DocumentThemeModal
      v-if="showThemeSelector"
      :show="showThemeSelector"
      :current-theme="selectedDocumentTheme"
      :document-type="activeDocumentType"
      @close="showThemeSelector = false"
      @theme-selected="updateDocumentTheme"
    />

    <!-- AI Enhancement Modal -->
    <AIModal
      v-if="showAIModal"
      :show="showAIModal"
      :context="aiModalContext"
      :document-type="activeDocumentType"
      :current-data="currentDocumentData"
      @close="showAIModal = false"
      @apply="handleAIModalResult"
    />

    <!-- Template Gallery Modal -->
    <TemplateGalleryModal
      v-if="showTemplateGallery"
      :show="showTemplateGallery"
      :document-type="activeDocumentType"
      :current-template="selectedTemplate"
      @close="showTemplateGallery = false"
      @template-selected="selectTemplate"
    />

    <!-- Version History Panel -->
    <VersionHistoryPanel
      v-if="showVersionHistory"
      :show="showVersionHistory"
      :versions="documentVersions"
      :current-document="activeDocumentType"
      @close="showVersionHistory = false"
      @revert="revertToVersion"
      @compare="compareVersions"
    />

    <!-- Job Context Setup Modal -->
    <JobContextModal
      v-if="showJobContextModal"
      :show="showJobContextModal"
      @close="showJobContextModal = false"
      @job-selected="setJobContext"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'

// Components
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import HeaderActions from '@/components/ui/HeaderActions.vue'
import UnifiedDocumentEditor from '@/components/document/UnifiedDocumentEditor.vue'
import DocumentPreviewModal from '@/components/document/DocumentPreviewModal.vue'
import DocumentExportModal from '@/components/document/DocumentExportModal.vue'
import DocumentThemeModal from '@/components/document/DocumentThemeModal.vue'
import TemplateGalleryModal from '@/components/document/TemplateGalleryModal.vue'
import JobContextModal from '@/components/document/JobContextModal.vue'
import DocumentPreview from '@/components/document/DocumentPreview.vue'
import AIModal from '@/components/document/AIModal.vue'
import VersionHistoryPanel from '@/components/document/VersionHistoryPanel.vue'

// Composables
import { useDocumentManager } from '@/composables/useDocumentManager'
import { useAIIntegration } from '@/composables/useAIIntegration'
import { useUnifiedProfile } from '@/composables/useUnifiedProfile'
import { useProfileAI } from '@/composables/useProfileAI'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

// Types
type DocumentType = 'resume' | 'cover-letter' | 'portfolio' | 'transcript'

interface DocumentTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    margins: string
    spacing: string
    columns: number
  }
}

const toast = useToast()
const { colorScheme } = useUnifiedTheme()

// Profile Integration
const unifiedProfile = useUnifiedProfile()
const profileAI = useProfileAI()

// Document Manager
const {
  resumeData,
  coverLetterData,
  jobDescription,
  jobInfo,
  selectedTemplate,
  documentVersions,
  currentStep,
  updateDocumentData,
  _updateJobDescription,
  selectTemplate,
  revertToVersion
} = useDocumentManager()

// AI Integration
const {
  aiReady,
  _aiProcessing,
  atsScore,
  handleAIRequest,
  _handleTailoring,
  _handleAISuggestions,
  _optimizeContent,
  _showAISuggestions
} = useAIIntegration(resumeData, coverLetterData, jobDescription.value)

// Enhanced State Management
const showPreviewModal = ref(false)
const showExportModal = ref(false)
const showThemeSelector = ref(false)
const showTemplateGallery = ref(false)
const showJobContextModal = ref(false)
const showAIModal = ref(false)
const showVersionHistory = ref(false)
const showLivePreview = ref(false)

// UI State
const aiModalContext = ref(null)
const profileImporting = ref(false)
const aiProcessing = ref(false)
const previewFormat = ref('formatted')
const wordCount = ref(0)
const lastSavedTime = ref('Never')

// Document Types Configuration
const documentTypes = ref([
  { value: 'resume', label: 'Resume', icon: 'mdi-account-box' },
  { value: 'cover-letter', label: 'Cover Letter', icon: 'mdi-email-outline' },
  { value: 'portfolio', label: 'Portfolio', icon: 'mdi-briefcase-variant' },
  { value: 'transcript', label: 'Transcript', icon: 'mdi-school' }
])

// Active document context
const activeDocumentType = ref<DocumentType>('resume')
const currentDocumentData = computed(() => {
  switch (activeDocumentType.value) {
    case 'resume': return resumeData
    case 'cover-letter': return coverLetterData
    default: return resumeData
  }
})

// Enhanced Document Management
const selectedDocumentTheme = ref<DocumentTheme>({
  id: 'professional',
  name: 'Professional',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#1e293b'
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif'
  },
  layout: {
    margins: '1in',
    spacing: '1.15',
    columns: 1
  }
})

// Available Templates
const availableTemplates = ref([
  { id: 'modern', name: 'Modern Professional', category: 'professional' },
  { id: 'classic', name: 'Classic Business', category: 'traditional' },
  { id: 'creative', name: 'Creative Design', category: 'creative' },
  { id: 'gaming', name: 'Gaming Industry', category: 'industry' },
  { id: 'tech', name: 'Tech Focus', category: 'industry' },
  { id: 'ats-optimized', name: 'ATS Optimized', category: 'optimized' }
])

// AI Suggestions
const aiSuggestions = ref([])
const skillMatch = ref(0)

// Profile Integration
const profileData = computed(() => unifiedProfile.profile.value)

// Computed Properties
const documentCount = computed(() => {
  let count = 0
  if (resumeData.value && Object.keys(resumeData.value).length > 0) count++
  if (coverLetterData.value && Object.keys(coverLetterData.value).length > 0) count++
  return count
})

const completionScore = computed(() => {
  if (activeDocumentType.value === 'resume') {
    const resume = resumeData.value
    if (!resume) return 0
    let score = 0
    if (resume.personalInfo?.name) score += 20
    if (resume.experience?.length > 0) score += 30
    if (resume.education?.length > 0) score += 20
    if (resume.skills?.technical?.length > 0) score += 20
    if (resume.summary) score += 10
    return score
  }
  return 0
})

const lastModified = computed(() => {
  const date = new Date()
  return date.toLocaleDateString()
})

const workspaceTheme = computed(() => {
  return `theme-${colorScheme.value} document-${selectedDocumentTheme.value.id}`
})

// Enhanced Methods
const togglePreview = () => {
  showPreviewModal.value = true
}

const toggleLivePreview = () => {
  showLivePreview.value = !showLivePreview.value
}

const refreshPreview = () => {
  // Force refresh of preview
  toast.info('Preview refreshed')
}

const getWordCount = () => {
  return wordCount.value
}

const updateWordCount = (count: number) => {
  wordCount.value = count
}

const getDocumentStatus = (docType: string) => {
  const data = docType === 'resume' ? resumeData.value : coverLetterData.value
  if (!data || Object.keys(data).length === 0) return 'empty'
  if (completionScore.value >= 80) return 'complete'
  if (completionScore.value >= 50) return 'partial'
  return 'draft'
}

const getATSScoreClass = (score: number) => {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

const updateDocumentTheme = (theme: DocumentTheme) => {
  selectedDocumentTheme.value = theme
  toast.success(`Theme changed to ${theme.name}`)
}

const clearJobContext = () => {
  jobDescription.value = ''
  toast.success('Job context cleared')
}

const setJobContext = (jobData: any) => {
  jobInfo.value = jobData
  jobDescription.value = jobData.description
  showJobContextModal.value = false
  toast.success('Job context updated')
}

const dismissSuggestions = () => {
  aiSuggestions.value = []
}

const applySuggestion = (suggestion: any) => {
  // Apply AI suggestion logic
  toast.success(`Applied suggestion: ${suggestion.title}`)
}

const compareVersions = (version1: string, version2: string) => {
  // Version comparison logic
  toast.info('Opening version comparison...')
}

const handleAdvancedExport = (options: any) => {
  // Enhanced export logic
  toast.success(`Exporting as ${options.format}...`)
  showExportModal.value = false
}

const enhanceWithAI = () => {
  if (!aiReady) {
    toast.error('AI service is not available')
    return
  }
  // Open AI modal for document enhancement
  showAIModal.value = true
  aiModalContext.value = {
    type: 'enhance',
    documentType: activeDocumentType.value,
    data: currentDocumentData.value
  }
}

const _handleStepChange = (step: number) => {
  currentStep.value = step
}

const handleAIModalResult = (_result: any) => {
  // Handle AI modal result
}

const _handleProfileEnhancedSuggestion = async (suggestion: any) => {
  try {
    switch (suggestion.type) {
      case 'refresh-profile':
        await syncProfileData()
        break
        
      case 'job-profile-match':
        // Handle job-profile match analysis
        if (suggestion.data) {
          // Update ATS score or other relevant metrics
          toast.success(`Profile match: ${suggestion.data.skillMatch}% skill compatibility`)
          
          // You could store this data for display in the sidebar
          // atsScore.value = suggestion.data.skillMatch
        }
        break
        
      default:
        console.log('Unknown profile suggestion type:', suggestion.type)
    }
  } catch (error) {
    console.error('Failed to handle profile enhanced suggestion:', error)
    toast.error('Failed to process AI suggestion')
  }
}

const handleResumeUpdate = (data: any) => {
  updateDocumentData('resume', data)
}

const handleCoverLetterUpdate = (data: any) => {
  updateDocumentData('cover-letter', data)
}

// Profile Integration Methods
const importFromProfile = async () => {
  if (!profileData.value) {
    toast.error('No profile data available to import')
    return
  }

  try {
    profileImporting.value = true
    
    // Import data for both resume and cover letter
    const resumeProfileData = unifiedProfile.getContextualProfile('resume')
    const coverLetterProfileData = unifiedProfile.getContextualProfile('jobs')
    
    if (resumeProfileData) {
      // Map profile data to resume format
      updateDocumentData('resume', {
        personalInfo: resumeProfileData.personalInfo || {},
        experience: resumeProfileData.experience || [],
        education: resumeProfileData.education || [],
        skills: resumeProfileData.skills || { technical: [], soft: [] },
        achievements: resumeProfileData.achievements || []
      })
    }
    
    if (coverLetterProfileData) {
      // Map profile data to cover letter format - basic structure
      updateDocumentData('cover-letter', {
        ...coverLetterData,
        personalInfo: resumeProfileData?.personalInfo || coverLetterData.personalInfo
      })
    }
    
    toast.success('Profile data imported successfully')
    
  } catch (error) {
    console.error('Profile import failed:', error)
    toast.error('Failed to import profile data')
  } finally {
    profileImporting.value = false
  }
}

const syncProfileData = async () => {
  try {
    profileImporting.value = true
    await unifiedProfile.forceSync()
    toast.success('Profile synced successfully')
  } catch (error) {
    console.error('Profile sync failed:', error)
    toast.error('Failed to sync profile data')
  } finally {
    profileImporting.value = false
  }
}

const _aiEnhanceFromProfile = async () => {
  if (!profileAI.isReady.value) {
    toast.error('AI service or profile data not available')
    return
  }
  
  try {
    const documentType = activeDocumentType.value
    const currentData = currentDocumentData.value
    
    if (documentType === 'resume') {
      const result = await profileAI.generateResumeWithProfile(
        jobDescription.value,
        {
          includeGamingExperience: true,
          optimizeForATS: true,
          focusOnTargetRole: true
        }
      )
      
      if (result.success && result.data) {
        // Apply the AI-generated improvements
        updateDocumentData('resume', result.data)
        toast.success(`AI enhancement complete (${result.confidence}% confidence)`)
      } else {
        toast.error(result.error || 'AI enhancement failed')
      }
    } else if (documentType === 'cover-letter') {
      const result = await profileAI.generateCoverLetterWithProfile(
        jobDescription.value,
        jobInfo.value,
        {
          includeGamingExperience: true,
          usePersonalityInsights: true
        }
      )
      
      if (result.success && result.data) {
        updateDocumentData('cover-letter', result.data)
        toast.success(`AI enhancement complete (${result.confidence}% confidence)`)
      } else {
        toast.error(result.error || 'AI enhancement failed')
      }
    }
    
    // Also get personalized suggestions
    const suggestionsResult = await profileAI.getPersonalizedSuggestions(
      documentType,
      currentData
    )
    
    if (suggestionsResult.success && suggestionsResult.suggestions) {
      console.log('AI Suggestions:', suggestionsResult.suggestions)
      // You could show these in a modal or sidebar
    }
    
  } catch (error) {
    console.error('AI profile enhancement failed:', error)
    toast.error('AI enhancement failed')
  }
}

const handleExport = async (_format?: string) => {
  // Export logic
  toast.success('Document exported successfully')
}

// Event handler for UnifiedButton to fix type error
const onExportClick = (event: Event) => {
  event.preventDefault?.()
  handleExport()
}

// const getProgressClass = (progress: number) => {
//   if (progress >= 80) return 'complete'
//   if (progress >= 50) return 'partial'
//   return 'incomplete'
// }

const _getATSScoreClass = (score: number) => {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

const _getATSScoreDescription = (score: number) => {
  if (score >= 80) return 'Excellent! Your documents are well-optimized for ATS systems.'
  if (score >= 60) return 'Good compatibility. Consider minor optimizations.'
  return 'Needs improvement. AI can help optimize your documents.'
}

// const handleResetDocument = () => {
//   if (confirm('Are you sure you want to reset all documents? This action cannot be undone.')) {
//     // Reset resume data
//     Object.assign(resumeData, {
//       personalInfo: {
//         name: '',
//         email: '',
//         phone: '',
//         location: '',
//         website: '',
//         linkedin: '',
//         github: ''
//       },
//       summary: '',
//       experience: [],
//       education: [],
//       skills: [],
//       projects: [],
//       achievements: [],
//       certifications: []
//     })
//     
//     // Reset cover letter data
//     Object.assign(coverLetterData, {
//       jobInfo: {
//         company: '',
//         position: '',
//         hiringManager: ''
//       },
//       content: {
//         opening: '',
//         body: '',
//         closing: ''
//       },
//       tone: 'professional',
//       focus: 'experience'
//     })
//     
//     // Reset workflow
//     currentWorkflowStep.value = 0
//     currentStep.value = 1
//     toast.success('All documents reset successfully')
//   }
// }

// Lifecycle
onMounted(async () => {
  try {
    // Load saved document drafts and restore user session
    await loadDocumentDrafts()
    
    // Initialize AI service if available
    if (aiReady.value) {
      await initializeAIFeatures()
    }
    
    // Load profile data if available
    if (unifiedProfile.profile.value) {
      await syncProfileData()
    }
    
    // Set up auto-save watchers
    setupAutoSave()
    
  } catch (error) {
    console.error('Failed to initialize document manager:', error)
    toast.error('Failed to load document data')
  }
})

const loadDocumentDrafts = async () => {
  try {
    const resumeDraft = localStorage.getItem('navi-resume-draft')
    const coverLetterDraft = localStorage.getItem('navi-cover-letter-draft')
    
    if (resumeDraft) {
      const parsed = JSON.parse(resumeDraft)
      updateDocumentData('resume', parsed)
    }
    
    if (coverLetterDraft) {
      const parsed = JSON.parse(coverLetterDraft)
      updateDocumentData('cover-letter', parsed)
    }
  } catch (error) {
    console.error('Failed to load drafts:', error)
  }
}

const initializeAIFeatures = async () => {
  try {
    // Pre-warm AI service for faster response times
    await handleAIRequest({ type: 'initialize', documentType: activeDocumentType.value })
  } catch (error) {
    console.error('AI initialization failed:', error)
  }
}

const setupAutoSave = () => {
  // Auto-save resume changes
  watch(resumeData, (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      localStorage.setItem('navi-resume-draft', JSON.stringify(newData))
    }
  }, { deep: true })
  
  // Auto-save cover letter changes  
  watch(coverLetterData, (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      localStorage.setItem('navi-cover-letter-draft', JSON.stringify(newData))
    }
  }, { deep: true })
}
</script>

<style scoped>
/* ===== ENHANCED DOCUMENT MANAGER STYLES ===== */

/* Header Actions */
.doc-type-switcher {
  display: flex;
  gap: var(--spacing-1);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-1);
}

.template-selector {
  position: relative;
}

.template-select {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 160px;
}

.unified-select {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  transition: all var(--duration-fast);
}

.unified-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* Dashboard Stats */
.document-dashboard {
  background: var(--glass-surface-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  backdrop-filter: var(--glass-backdrop-blur);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.stat-card:hover {
  background: var(--glass-hover-bg);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--radius-lg);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

.dashboard-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
}

/* Document Type Tabs */
.document-type-tabs {
  margin-bottom: var(--spacing-6);
}

.tab-list {
  display: flex;
  gap: var(--spacing-2);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-1);
}

.doc-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.doc-tab:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.doc-tab.active {
  background: var(--color-primary-500);
  color: white;
  box-shadow: var(--shadow-md);
}

.tab-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tab-indicator.complete { background: var(--color-success-500); }
.tab-indicator.partial { background: var(--color-warning-500); }
.tab-indicator.draft { background: var(--color-info-500); }
.tab-indicator.empty { background: var(--color-gray-400); }

.document-actions {
  display: flex;
  gap: var(--spacing-2);
}

.doc-type-select {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* Workspace */
.document-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-height: 80vh;
  transition: all var(--duration-normal);
}

.document-workspace.theme-dark {
  background: var(--glass-surface-dark);
}

/* Job Context Banner */
.job-context-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--color-primary-50), var(--color-success-50));
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4) var(--spacing-5);
  margin-bottom: var(--spacing-4);
}

.job-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
}

.job-details {
  flex: 1;
}

.job-title {
  font-weight: 600;
  color: var(--color-primary-800);
  font-size: 1.1rem;
}

.job-meta {
  font-size: 0.875rem;
  color: var(--color-primary-600);
  margin-top: var(--spacing-1);
}

.job-metrics {
  display: flex;
  gap: var(--spacing-3);
}

.ats-score, .match-score {
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
}

.ats-score.high, .match-score {
  background: var(--color-success-100);
  color: var(--color-success-800);
}

.ats-score.medium {
  background: var(--color-warning-100);
  color: var(--color-warning-800);
}

.ats-score.low {
  background: var(--color-error-100);
  color: var(--color-error-800);
}

/* AI Suggestions Panel */
.ai-suggestions-panel {
  background: var(--glass-surface-elevated);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
  color: var(--color-primary-700);
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.suggestion-item:hover {
  background: var(--glass-hover-bg);
  transform: translateX(4px);
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: 600;
  color: var(--text-primary);
}

.suggestion-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

.suggestion-confidence {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-600);
  background: var(--color-primary-50);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
}

/* Editor Container */
.editor-container {
  display: flex;
  gap: var(--spacing-4);
  background: var(--glass-surface-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  min-height: 600px;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-panel.split-view {
  flex: 0.6;
}

.preview-panel {
  flex: 0.4;
  border-left: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
}

.editor-header, .preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-surface);
}

.editor-info h3, .preview-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.editor-meta, .preview-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

.format-select {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-1) var(--spacing-2);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
}


/* Responsive Design */
@media (max-width: 1200px) {
  .editor-container {
    flex-direction: column;
  }

  .editor-panel.split-view {
    flex: 1;
  }

  .preview-panel {
    border-left: none;
    border-top: 1px solid var(--glass-border);
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .doc-type-switcher {
    display: none; /* Hide from header on mobile, use tabs instead */
  }

  .template-selector {
    order: -1;
  }

  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3);
  }

  .stat-card {
    padding: var(--spacing-3);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .dashboard-actions {
    flex-wrap: wrap;
  }

  .tab-list {
    padding: var(--spacing-0-5);
  }

  .doc-tab {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 0.875rem;
  }

  .job-context-banner {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }

  .job-info {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-2);
  }

  .job-metrics {
    justify-content: center;
  }

  .suggestions-list {
    gap: var(--spacing-3);
  }

  .suggestion-item {
    padding: var(--spacing-3);
  }

  .editor-header, .preview-header {
    padding: var(--spacing-3);
  }

  .showLivePreview {
    display: none; /* Hide split view on mobile */
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }

  .tab-list {
    flex-wrap: wrap;
  }

  .doc-tab {
    flex: 1;
    min-width: 0;
  }

  .doc-tab span {
    display: none; /* Show only icons on very small screens */
  }
}

/* Gaming Theme Enhancements */
.theme-gaming .stat-icon {
  background: linear-gradient(135deg, var(--color-gaming-500), var(--color-gaming-600));
}

.theme-gaming .doc-tab.active {
  background: var(--color-gaming-500);
  box-shadow: 0 0 20px var(--color-gaming-500-30);
}

.theme-gaming .suggestion-item:hover {
  border-color: var(--color-gaming-300);
  box-shadow: 0 0 10px var(--color-gaming-500-20);
}

/* Dark Theme Support */
.theme-dark .stat-card {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

.theme-dark .job-context-banner {
  background: linear-gradient(135deg, var(--color-primary-900), var(--color-success-900));
  border-color: var(--color-primary-700);
}

.theme-dark .ai-suggestions-panel {
  background: var(--glass-surface-elevated-dark);
  border-color: var(--color-primary-700);
}

/* Animation Enhancements */
.stat-card, .suggestion-item, .doc-tab {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* AI Status Warning */
.ai-status-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-warning-100);
  color: var(--color-warning-800);
  border: 1px solid var(--color-warning-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}
</style>
