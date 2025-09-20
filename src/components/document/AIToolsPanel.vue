<template>
  <div class="ai-tools-panel">
    <div class="tools-header mb-6">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h4 class="fw-semibold mb-1 d-flex align-items-center">
            <AppIcon name="mdi-robot" class="me-3" color="info" />
            AI-Powered Tools
          </h4>
          <p class="text-muted mb-0">Advanced AI features for document enhancement and tailoring</p>
        </div>
        <div class="ai-status-badge" :class="{ active: aiReady }">
          <AppIcon name="mdi-brain" class="me-1" />
          {{ aiReady ? 'AI Ready' : 'AI Unavailable' }}
        </div>
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="tools-grid">
      <!-- Job Description Analyzer -->
      <div class="tool-card surface-elevated border-subtle rounded-lg">
        <div class="tool-header p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="tool-icon">
              <AppIcon name="mdi-magnify" />
            </div>
            <div class="ms-3">
              <h6 class="fw-semibold mb-1">Job Description Analyzer</h6>
              <p class="text-muted text-sm mb-0">Extract key requirements and skills from job postings</p>
            </div>
          </div>
        </div>
        
        <div class="tool-content p-4">
          <textarea
            v-model="jobDescriptionModel"
            class="form-control mb-3"
            rows="4"
            placeholder="Paste the job description here..."
          ></textarea>
          
          <div class="d-flex justify-content-between align-items-center">
            <div v-if="analysisResults.keywords" class="analysis-stats">
              <small class="text-muted">{{ analysisResults.keywords.length }} keywords found</small>
            </div>
            <UnifiedButton
              variant="primary"
              size="sm"
              :loading="analyzing"
              :disabled="!jobDescriptionModel.trim() || !aiReady"
              @click="analyzeJobDescription"
            >
              Analyze
            </UnifiedButton>
          </div>

          <div v-if="analysisResults.keywords" class="analysis-results mt-3">
            <h6 class="fw-semibold mb-2">Key Requirements</h6>
            <div class="keywords-grid mb-3">
              <span
                v-for="keyword in analysisResults.keywords.slice(0, 8)"
                :key="keyword"
                class="keyword-chip"
              >
                {{ keyword }}
              </span>
            </div>
            
            <div v-if="analysisResults.matchScore" class="match-score">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-sm fw-medium">Resume Match Score</span>
                <span class="text-sm fw-bold" :class="getScoreColor(analysisResults.matchScore)">
                  {{ analysisResults.matchScore }}%
                </span>
              </div>
              <div class="progress progress--xs">
                <div 
                  class="progress-bar" 
                  :class="getScoreColor(analysisResults.matchScore)"
                  :style="{ width: analysisResults.matchScore + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resume Parser -->
      <div class="tool-card surface-elevated border-subtle rounded-lg">
        <div class="tool-header p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="tool-icon">
              <AppIcon name="mdi-file-document-outline" />
            </div>
            <div class="ms-3">
              <h6 class="fw-semibold mb-1">Resume Parser</h6>
              <p class="text-muted text-sm mb-0">Upload or paste your resume to extract structured data</p>
            </div>
          </div>
        </div>
        
        <div class="tool-content p-4">
          <div class="upload-area mb-3">
            <div class="d-flex flex-column gap-2 mb-3">
              <input
                id="resume-file-input"
                ref="fileInput"
                type="file"
                class="d-none"
                accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                @change="onFileChange"
              />
              <div class="p-3 border-subtle rounded d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <AppIcon name="mdi-upload" class="text-muted" />
                  <span class="text-sm text-muted">Upload PDF/DOCX/TXT</span>
                </div>
                <UnifiedButton variant="ghost" size="xs" @click="() => fileInput?.click()">Choose File</UnifiedButton>
              </div>
            </div>
            <textarea
              v-model="resumeText"
              class="form-control"
              rows="6"
              placeholder="Paste your existing resume content here..."
            ></textarea>
          </div>
          
          <div class="d-flex justify-content-end">
            <UnifiedButton
              variant="success"
              size="sm"
              leading-icon="mdi-upload"
              :loading="parsing"
              :disabled="!resumeText.trim() || !aiReady"
              @click="parseResume"
            >
              Parse Resume
            </UnifiedButton>
          </div>

          <div v-if="parseResults.extracted" class="parse-results mt-3">
            <h6 class="fw-semibold mb-2">Extracted Information</h6>
            <div class="extracted-data">
              <div v-if="parseResults.name" class="data-item">
                <strong>Name:</strong> {{ parseResults.name }}
              </div>
              <div v-if="parseResults.email" class="data-item">
                <strong>Email:</strong> {{ parseResults.email }}
              </div>
              <div v-if="parseResults.skills.length > 0" class="data-item">
                <strong>Skills:</strong>
                <div class="skills-preview">
                  <span
                    v-for="skill in parseResults.skills.slice(0, 5)"
                    :key="skill"
                    class="skill-tag"
                  >
                    {{ skill }}
                  </span>
                  <span v-if="parseResults.skills.length > 5" class="text-muted">
                    +{{ parseResults.skills.length - 5 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Tailor -->
      <div class="tool-card surface-elevated border-subtle rounded-lg">
        <div class="tool-header p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="tool-icon">
              <AppIcon name="mdi-shimmer" color="primary" />
            </div>
            <div class="ms-3">
              <h6 class="fw-semibold mb-1">Document Tailor</h6>
              <p class="text-muted text-sm mb-0">Customize documents for specific job applications</p>
            </div>
          </div>
        </div>
        
        <div class="tool-content p-4">
          <div class="tailor-options mb-3">
            <div class="form-check mb-2">
              <input
                id="tailor-resume"
                v-model="tailorOptions.resume"
                class="form-check-input"
                type="checkbox"
              />
              <label for="tailor-resume" class="form-check-label fw-medium">
                Tailor Resume
              </label>
            </div>
            <div class="form-check mb-2">
              <input
                id="tailor-cover-letter"
                v-model="tailorOptions.coverLetter"
                class="form-check-input"
                type="checkbox"
              />
              <label for="tailor-cover-letter" class="form-check-label fw-medium">
                Tailor Cover Letter
              </label>
            </div>
            <div class="form-check">
              <input
                id="suggest-improvements"
                v-model="tailorOptions.suggestions"
                class="form-check-input"
                type="checkbox"
              />
              <label for="suggest-improvements" class="form-check-label fw-medium">
                Provide Improvement Suggestions
              </label>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <UnifiedButton
              variant="gaming"
              size="sm"
              leading-icon="mdi-auto-fix"
              :loading="tailoring"
              :disabled="!hasDocumentsToTailor || !jobDescriptionModel.trim() || !aiReady"
              @click="tailorDocuments"
            >
              Tailor Documents
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Skill Enhancement -->
      <div class="tool-card surface-elevated border-subtle rounded-lg">
        <div class="tool-header p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="tool-icon">
              <AppIcon name="mdi-lightning-bolt" color="warning" />
            </div>
            <div class="ms-3">
              <h6 class="fw-semibold mb-1">Skill Enhancement</h6>
              <p class="text-muted text-sm mb-0">Get AI-powered skill recommendations</p>
            </div>
          </div>
        </div>
        
        <div class="tool-content p-4">
          <div class="current-skills mb-3">
            <label class="form-label fw-medium">Current Skills</label>
            <div v-if="resumeData.skills && resumeData.skills.length > 0" class="skills-display">
              <span
                v-for="skill in resumeData.skills"
                :key="skill.name"
                class="current-skill-chip"
              >
                {{ skill.name }}
              </span>
            </div>
            <p v-else class="text-muted text-sm">No skills added to resume yet</p>
          </div>

          <div class="d-flex justify-content-end">
            <UnifiedButton
              variant="info"
              size="sm"
              leading-icon="mdi-lightbulb"
              :loading="suggesting"
              :disabled="!aiReady"
              @click="suggestSkills"
            >
              Suggest Skills
            </UnifiedButton>
          </div>

          <div v-if="skillSuggestions.length > 0" class="skill-suggestions mt-3">
            <h6 class="fw-semibold mb-2">Suggested Skills</h6>
            <div class="suggestions-list">
              <div
                v-for="suggestion in skillSuggestions"
                :key="suggestion.name"
                class="skill-suggestion"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-medium">{{ suggestion.name }}</div>
                    <div class="text-sm text-muted">{{ suggestion.category }}</div>
                  </div>
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    icon="mdi-plus"
                    @click="addSkill(suggestion)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Writing Assistant -->
      <div class="tool-card surface-elevated border-subtle rounded-lg">
        <div class="tool-header p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="tool-icon">
              <AppIcon name="mdi-pencil" />
            </div>
            <div class="ms-3">
              <h6 class="fw-semibold mb-1">Writing Assistant</h6>
              <p class="text-muted text-sm mb-0">Improve clarity and impact of your content</p>
            </div>
          </div>
        </div>
        
        <div class="tool-content p-4">
          <div class="writing-tools">
            <div class="tool-section mb-3">
              <label class="form-label fw-medium">Text to Improve</label>
              <textarea
                v-model="textToImprove"
                class="form-control"
                rows="4"
                placeholder="Paste text you'd like to improve..."
              ></textarea>
            </div>

            <div class="improvement-options mb-3">
              <div class="btn-group" role="group">
                <input
                  id="improve-clarity"
                  v-model="improvementType"
                  type="radio"
                  class="btn-check"
                  value="clarity"
                />
                <label for="improve-clarity" class="btn btn-outline-primary btn-sm">Clarity</label>

                <input
                  id="improve-impact"
                  v-model="improvementType"
                  type="radio"
                  class="btn-check"
                  value="impact"
                />
                <label for="improve-impact" class="btn btn-outline-primary btn-sm">Impact</label>

                <input
                  id="improve-concise"
                  v-model="improvementType"
                  type="radio"
                  class="btn-check"
                  value="concise"
                />
                <label for="improve-concise" class="btn btn-outline-primary btn-sm">Concise</label>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <UnifiedButton
                variant="secondary"
                size="sm"
                leading-icon="mdi-pencil"
                :loading="improving"
                :disabled="!textToImprove.trim() || !improvementType || !aiReady"
                @click="improveText"
              >
                Improve Text
              </UnifiedButton>
            </div>

            <div v-if="improvedText" class="improved-text mt-3">
              <h6 class="fw-semibold mb-2">Improved Version</h6>
              <div class="improved-content p-3 border-subtle rounded">
                {{ improvedText }}
              </div>
              <div class="d-flex justify-content-end mt-2">
                <UnifiedButton
                  variant="ghost"
                  size="xs"
                  @click="copyImprovedText"
                >
                  Copy Text
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions Panel -->
      <div class="tool-card surface-elevated border-subtle rounded-lg">
        <div class="tool-header p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="tool-icon">
              <AppIcon name="mdi-lightbulb" color="warning" />
            </div>
            <div class="ms-3">
              <h6 class="fw-semibold mb-1">Smart Suggestions</h6>
              <p class="text-muted text-sm mb-0">Personalized recommendations for your documents</p>
            </div>
          </div>
        </div>
        
        <div class="tool-content p-4">
          <div v-if="suggestions.length === 0" class="empty-suggestions text-center py-4">
            <AppIcon name="mdi-target" size="48" class="mb-3 text-muted" color="primary" />
            <p class="text-muted mb-3">No suggestions yet</p>
            <UnifiedButton
              variant="outline"
              size="sm"
              :loading="generating"
              :disabled="!aiReady"
              @click="generateSuggestions"
            >
              Generate Suggestions
            </UnifiedButton>
          </div>

          <div v-else class="suggestions-list">
            <div
              v-for="suggestion in suggestions.slice(0, 3)"
              :key="suggestion.id"
              class="suggestion-item p-3 border-subtle rounded mb-2"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="fw-medium mb-1">{{ suggestion.title }}</div>
                  <p class="text-sm text-muted mb-2">{{ suggestion.description }}</p>
                  <div class="suggestion-tags">
                    <span class="tag">{{ suggestion.category }}</span>
                    <span class="tag">{{ suggestion.priority }}</span>
                  </div>
                </div>
                <div class="suggestion-actions">
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    icon="mdi-check"
                    :title="'Apply suggestion'"
                    @click="applySuggestion(suggestion)"
                  />
                </div>
              </div>
            </div>

            <div v-if="suggestions.length > 3" class="text-center mt-3">
              <UnifiedButton
                variant="ghost"
                size="sm"
                @click="showAllSuggestions"
              >
                View All {{ suggestions.length }} Suggestions
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
// Load the PDF.js worker as a URL for use in the main thread
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import { useToast } from '@/composables/useToast'
import { ai } from '@/shared/ai/canonical'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Props
const _props = defineProps({
  resumeData: {
    type: Object,
    required: true
  },
  coverLetterData: {
    type: Object,
    required: true
  },
  jobDescription: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:jobDescription', 'apply-suggestions', 'parse-resume', 'tailor-documents', 'add-skill'])

// State
const analyzing = ref(false)
const parsing = ref(false)
const tailoring = ref(false)
const suggesting = ref(false)
const improving = ref(false)
const generating = ref(false)

const resumeText = ref('')
const fileInput = ref(null)
const textToImprove = ref('')
const improvedText = ref('')
const improvementType = ref('clarity')

const analysisResults = ref({})
const parseResults = ref({})
const skillSuggestions = ref([])
const suggestions = ref([])

const tailorOptions = ref({
  resume: true,
  coverLetter: true,
  suggestions: true
})

// Model proxy for parent-provided jobDescription
const jobDescriptionModel = computed({
  get: () => props.jobDescription,
  set: (val) => emit('update:jobDescription', val)
})

const toast = useToast()

// Computed
const aiReady = computed(() => {
  try {
    // Use the canonical AI service status check
    const status = ai.getStatus()
    const hasApiKey = !!(localStorage.getItem('gemini_api_key') || localStorage.getItem('openai_api_key'))
    return Boolean(status.initialized && hasApiKey)
  } catch (error) {
    console.warn('AI status check failed in AIToolsPanel:', error)
    return false
  }
})

const hasDocumentsToTailor = computed(() => {
  return tailorOptions.value.resume || tailorOptions.value.coverLetter
})

// Methods
const getScoreColor = (score) => {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-danger'
}

const analyzeJobDescription = async () => {
  analyzing.value = true
  try {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    analysisResults.value = {
      keywords: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'API Development', 'Agile', 'Git', 'Testing'],
      matchScore: 78,
      recommendations: ['Add more TypeScript experience', 'Highlight API development skills']
    }
    
    toast.success('Job description analyzed successfully')
  } catch (error) {
    toast.error('Analysis failed: ' + error.message)
  } finally {
    analyzing.value = false
  }
}

const parseResume = async () => {
  parsing.value = true
  try {
    const text = (resumeText.value || '').trim()
    if (!text) throw new Error('No resume content to parse')
    emit('parse-resume', text)

    // Quick local preview of basic fields for immediate feedback
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const nameGuess = lines[0] || ''
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    const skillsGuess = Array.from(new Set((text.match(/\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|SQL|React|Vue|Angular|Node|AWS|Docker|Kubernetes)\b/gi) || [])))

    parseResults.value = {
      extracted: true,
      name: nameGuess,
      email: emailMatch ? emailMatch[0] : '',
      skills: skillsGuess,
      experience: []
    }
    toast.success('Sent resume to AI for parsing')
  } catch (error) {
    toast.error('Parsing failed: ' + error.message)
  } finally {
    parsing.value = false
  }
}

const tailorDocuments = async () => {
  tailoring.value = true
  try {
    // Emit only job description upward; parent will tailor
    emit('tailor-documents', props.jobDescription)
    toast.success('Tailoring requested')
  } catch (error) {
    toast.error('Tailoring failed: ' + error.message)
  } finally {
    tailoring.value = false
  }
}

// File handling and extraction
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

const onFileChange = async (e) => {
  const file = e?.target?.files?.[0]
  if (!file) return
  try {
    const text = await extractTextFromFile(file)
    resumeText.value = text
    toast.success(`Loaded ${file.name}`)
  } catch (err) {
    toast.error('Failed to read file: ' + (err?.message || err))
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function extractTextFromFile(file) {
  const ext = (file.name || '').toLowerCase().split('.').pop()
  if (ext === 'pdf') return await extractTextFromPdf(file)
  if (ext === 'docx') return await extractTextFromDocx(file)
  if (ext === 'txt' || ext === 'md' || ext === 'rtf') return await file.text()
  return await file.text()
}

async function extractTextFromPdf(file) {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  let out = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    out += content.items.map(it => (it && it.str) ? it.str : '').join(' ') + '\n'
  }
  return out
}

async function extractTextFromDocx(file) {
  const data = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(data)
  const entry = zip.file('word/document.xml')
  if (!entry) throw new Error('Invalid DOCX file')
  const xml = await entry.async('string')
  const parser = new XMLParser({ ignoreAttributes: false })
  const json = parser.parse(xml)
  const doc = json?.['w:document']?.['w:body']
  if (!doc) return ''
  const walk = (node) => {
    if (!node || typeof node !== 'object') return ''
    let s = ''
    const t = node['w:t']
    if (typeof t === 'string') s += t + ' '
    if (Array.isArray(t)) s += t.join(' ') + ' '
    const keys = Object.keys(node)
    for (const k of keys) {
      if (k === 'w:t') continue
      const v = node[k]
      if (Array.isArray(v)) s += v.map(walk).join(' ')
      else if (typeof v === 'object') s += walk(v)
    }
    return s
  }
  return walk(doc)
}

const suggestSkills = async () => {
  suggesting.value = true
  try {
    // Simulate skill suggestions
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    skillSuggestions.value = [
      { name: 'TypeScript', category: 'Programming Language' },
      { name: 'Docker', category: 'DevOps' },
      { name: 'AWS', category: 'Cloud Platform' },
      { name: 'GraphQL', category: 'API Technology' }
    ]
    
    toast.success('Skill suggestions generated')
  } catch (error) {
    toast.error('Skill suggestion failed: ' + error.message)
  } finally {
    suggesting.value = false
  }
}

const addSkill = (skill) => {
  // Emit event to parent to add skill instead of mutating prop directly
  emit('add-skill', skill)
  skillSuggestions.value = skillSuggestions.value.filter(s => s.name !== skill.name)
  toast.success(`Added ${skill.name} to skills`)
}

const improveText = async () => {
  improving.value = true
  try {
    // Simulate text improvement
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    improvedText.value = "This is an improved version of your text with better clarity and impact."
    toast.success('Text improved successfully')
  } catch (error) {
    toast.error('Text improvement failed: ' + error.message)
  } finally {
    improving.value = false
  }
}

const copyImprovedText = () => {
  navigator.clipboard.writeText(improvedText.value)
  toast.success('Text copied to clipboard')
}

const generateSuggestions = async () => {
  generating.value = true
  try {
    // Simulate suggestion generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    suggestions.value = [
      {
        id: 1,
        title: 'Add quantifiable achievements',
        description: 'Include specific numbers and metrics in your experience descriptions',
        category: 'Resume',
        priority: 'High'
      },
      {
        id: 2,
        title: 'Tailor your summary',
        description: 'Customize your professional summary for this specific role',
        category: 'Resume',
        priority: 'Medium'
      },
      {
        id: 3,
        title: 'Strengthen your opening',
        description: 'Make your cover letter opening more compelling',
        category: 'Cover Letter',
        priority: 'High'
      }
    ]
    
    toast.success('Suggestions generated')
  } catch (error) {
    toast.error('Failed to generate suggestions: ' + error.message)
  } finally {
    generating.value = false
  }
}

const applySuggestion = (suggestion) => {
  emit('apply-suggestions', [suggestion])
  toast.success('Suggestion applied')
}

const showAllSuggestions = () => {
  // Emit event to show all suggestions in a modal or expanded view
  emit('apply-suggestions', suggestions.value)
}
</script>

<style scoped>
.ai-tools-panel {
  max-width: 100%;
}

.ai-status-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--color-warning-100);
  color: var(--color-warning-700);
  border: 1px solid var(--color-warning-300);
}

.ai-status-badge.active {
  background: var(--color-success-100);
  color: var(--color-success-700);
  border-color: var(--color-success-300);
}

.tools-grid {
  display: grid;
  gap: var(--spacing-5);
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-card-min-lg, 320px), 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  transition: all var(--duration-fast);
}

.tool-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-200);
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-primary-100);
  border-radius: var(--radius-md);
  color: var(--color-primary-600);
}

.keywords-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-chip {
  padding: 0.25rem 0.75rem;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Use global .progress styles */

.skills-display,
.skills-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.current-skill-chip,
.skill-tag {
  padding: 0.25rem 0.5rem;
  background: var(--color-info-100);
  color: var(--color-info-700);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.skill-suggestion {
  padding: 0.75rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  transition: all var(--duration-fast);
}

.skill-suggestion:hover {
  border-color: var(--color-primary-300);
  background: var(--glass-hover-bg);
}

.suggestion-item {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  transition: all var(--duration-fast);
}

.suggestion-item:hover {
  border-color: var(--color-primary-300);
  background: var(--glass-hover-bg);
}

.suggestion-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.125rem 0.5rem;
  background: var(--glass-bg-light);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.improved-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  font-family: inherit;
  line-height: 1.5;
}

.empty-suggestions {
  text-align: center;
  padding: 2rem 1rem;
}

.upload-area {
  position: relative;
}

.analysis-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 1200px) {
  .tools-grid {
    display: grid;
    gap: var(--spacing-5);
    grid-template-columns: repeat(auto-fill, minmax(var(--grid-card-min-lg, 320px), 1fr));
  }
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .tool-card {
    margin-bottom: 1rem;
  }
}
</style>
