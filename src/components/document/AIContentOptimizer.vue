<template>
  <div class="ai-content-optimizer" class="font-sans">
    <!-- AI Optimization Panel -->
    <div v-if="showPanel" class="optimization-panel" :class="{ 'is-floating': isFloating }">
      <div class="panel-header">
        <div class="panel-title">
          <AppIcon name="CpuChipIcon" class="ai-icon" />
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
            :leading-icon="isFloating ? 'mdi-dock-window' : 'mdi-window-open-variant'"
            @click="toggleFloating"
          />
          <UnifiedButton
            variant="ghost"
            size="xs"
            leading-icon="XMarkIcon"
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
        <div v-if="activeOptimizationTab === 'suggestions'" class="optimization-content">
          <div class="suggestions-header">
            <h4>AI Suggestions</h4>
            <UnifiedButton
              variant="primary"
              size="xs"
              leading-icon="ArrowPathIcon"
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
                    leading-icon="CheckIcon"
                    @click="applySuggestion(suggestion)"
                  />
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="XMarkIcon"
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
        <div v-else-if="activeOptimizationTab === 'keywords'" class="optimization-content">
          <div class="keywords-analysis">
            <h4>Keyword Analysis</h4>
            <div class="analysis-grid">
              <div class="analysis-card">
                <div class="card-header">
                  <AppIcon name="EyeIcon" />
                  <span>Job Match Score</span>
                </div>
                <div class="score-display">
                  <div class="score-circle" :class="getScoreClass(keywordMatchScore)">
                    <span class="score-value">{{ keywordMatchScore }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-card">
                <div class="card-header">
                  <AppIcon name="EyeIcon" />
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
                  <AppIcon name="PlusIcon" />
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
                  <AppIcon name="CheckIcon" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Writing Analysis -->
        <div v-else-if="activeOptimizationTab === 'writing'" class="optimization-content">
          <div class="writing-analysis">
            <h4>Writing Analysis</h4>
            
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Reading Level</div>
                <div class="metric-value">{{ writingMetrics.readingLevel }}</div>
                <div class="metric-indicator" :class="getReadingLevelClass()"></div>
              </div>
              
              <div class="metric-item">
                <div class="metric-label">Sentence Length</div>
                <div class="metric-value">{{ writingMetrics.avgSentenceLength }} words</div>
                <div class="metric-indicator" :class="getSentenceLengthClass()"></div>
              </div>
              
              <div class="metric-item">
                <div class="metric-label">Passive Voice</div>
                <div class="metric-value">{{ writingMetrics.passiveVoicePercent }}%</div>
                <div class="metric-indicator" :class="getPassiveVoiceClass()"></div>
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
                    <div class="suggestion-description">{{ suggestion.description }}</div>
                  </div>
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="SparklesIcon"
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
        <div v-else-if="activeOptimizationTab === 'performance'" class="optimization-content">
          <div class="performance-analysis">
            <h4>Document Performance</h4>
            
            <!-- Overall Score -->
            <div class="overall-score">
              <div class="score-circle large" :class="getScoreClass(overallScore)">
                <span class="score-value">{{ overallScore }}</span>
                <span class="score-label">Overall Score</span>
              </div>
              <div class="score-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Content Quality</span>
                  <div class="breakdown-bar">
                    <div class="bar-fill" :style="{ width: contentQualityScore + '%' }"></div>
                  </div>
                  <span class="breakdown-value">{{ contentQualityScore }}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">ATS Optimization</span>
                  <div class="breakdown-bar">
                    <div class="bar-fill" :style="{ width: atsScore + '%' }"></div>
                  </div>
                  <span class="breakdown-value">{{ atsScore }}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Keyword Density</span>
                  <div class="breakdown-bar">
                    <div class="bar-fill" :style="{ width: keywordDensityScore + '%' }"></div>
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
      leading-icon="CpuChipIcon"
      @click="openPanel"
    >
      AI Optimize
    </UnifiedButton>
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon, CheckIcon, CpuChipIcon, EyeIcon, PlusIcon, SparklesIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import { ref, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface ContentSuggestion {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  icon: string
  description: string
  example?: string
  target: string
  action: string
}

interface WritingSuggestion {
  id: string
  type: 'grammar' | 'style' | 'clarity'
  icon: string
  title: string
  description: string
  target: string
  replacement: string
}

interface PerformanceTip {
  id: string
  impact: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
}

const props = defineProps<{
  documentContent: any
  jobDescription?: string
  aiEnabled?: boolean
  isFloating?: boolean
}>()

const emit = defineEmits<{
  'apply-suggestion': [suggestion: ContentSuggestion]
  'apply-writing-fix': [suggestion: WritingSuggestion]
  'apply-tip': [tip: PerformanceTip]
  'toggle-floating': []
}>()

const toast = useToast()

// State
const showPanel = ref(false)
const activeOptimizationTab = ref('suggestions')
const isGeneratingSuggestions = ref(false)

// Mock data - in real implementation, these would come from AI analysis
const contentSuggestions = ref<ContentSuggestion[]>([
  {
    id: '1',
    type: 'Impact Metric',
    priority: 'high',
    icon: 'mdi-trending-up',
    description: 'Add quantifiable achievements to make your experience more compelling',
    example: 'Increased team productivity by 25%',
    target: 'experience',
    action: 'add-metrics'
  },
  {
    id: '2',
    type: 'Action Verb',
    priority: 'medium',
    icon: 'BoltIcon',
    description: 'Use stronger action verbs to make your accomplishments more impactful',
    example: 'Spearheaded instead of Worked on',
    target: 'experience',
    action: 'improve-verbs'
  },
  {
    id: '3',
    type: 'Industry Keywords',
    priority: 'high',
    icon: 'KeyIcon',
    description: 'Include more relevant industry keywords from the job description',
    target: 'summary',
    action: 'add-keywords'
  }
])

const writingSuggestions = ref<WritingSuggestion[]>([
  {
    id: '1',
    type: 'grammar',
    icon: 'mdi-spellcheck',
    title: 'Grammar Correction',
    description: 'Fix passive voice usage in experience descriptions',
    target: 'experience-2',
    replacement: 'Led the implementation of...'
  },
  {
    id: '2',
    type: 'style',
    icon: 'mdi-format-text',
    title: 'Style Improvement',
    description: 'Use parallel structure in bullet points',
    target: 'experience-1',
    replacement: 'Developed, Implemented, Managed'
  }
])

const performanceTips = ref<PerformanceTip[]>([
  {
    id: '1',
    impact: 'high',
    title: 'Add Skills Section',
    description: 'Include a dedicated skills section to improve ATS scanning',
    action: 'add-skills-section'
  },
  {
    id: '2',
    impact: 'medium',
    title: 'Optimize Summary Length',
    description: 'Expand your professional summary to 3-4 sentences for better impact',
    action: 'expand-summary'
  }
])

// Computed properties
const optimizationTabs = computed(() => [
  {
    id: 'suggestions',
    label: 'Suggestions',
    icon: 'LightBulbIcon',
    count: contentSuggestions.value.length
  },
  {
    id: 'keywords',
    label: 'Keywords',
    icon: 'KeyIcon',
    count: missingKeywords.value.length
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: 'mdi-pencil',
    count: writingSuggestions.value.length
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: 'ChartBarIcon-line',
    count: performanceTips.value.length
  }
])

const aiStatusClass = computed(() => {
  if (isGeneratingSuggestions.value) return 'analyzing'
  return props.aiEnabled ? 'ready' : 'disabled'
})

const aiStatusText = computed(() => {
  if (isGeneratingSuggestions.value) return 'Analyzing...'
  return props.aiEnabled ? 'Ready' : 'Disabled'
})

// Mock analysis data
const keywordMatchScore = ref(72)
const atsScore = ref(85)
const contentQualityScore = ref(78)
const keywordDensityScore = ref(68)
const overallScore = computed(() => 
  Math.round((keywordMatchScore.value + atsScore.value + contentQualityScore.value) / 3)
)

const missingKeywords = ref(['JavaScript', 'React', 'TypeScript', 'Node.js', 'AWS'])
const optimizedKeywords = ref(['Vue.js', 'Frontend', 'Web Development', 'UI/UX'])

const writingMetrics = ref({
  readingLevel: 'Professional',
  avgSentenceLength: 18,
  passiveVoicePercent: 12
})

// Methods
function openPanel() {
  showPanel.value = true
  generateSuggestions()
}

function closePanel() {
  showPanel.value = false
}

function toggleFloating() {
  emit('toggle-floating')
}

async function generateSuggestions() {
  isGeneratingSuggestions.value = true
  
  try {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real implementation, this would call your AI service
    toast.success('Content analysis complete')
  } catch (error) {
    toast.error('Failed to generate suggestions')
  } finally {
    isGeneratingSuggestions.value = false
  }
}

function applySuggestion(suggestion: ContentSuggestion) {
  emit('apply-suggestion', suggestion)
  toast.success('Suggestion applied')
  
  // Remove applied suggestion
  const index = contentSuggestions.value.findIndex(s => s.id === suggestion.id)
  if (index > -1) {
    contentSuggestions.value.splice(index, 1)
  }
}

function dismissSuggestion(suggestionId: string) {
  const index = contentSuggestions.value.findIndex(s => s.id === suggestionId)
  if (index > -1) {
    contentSuggestions.value.splice(index, 1)
  }
}

function applyWritingSuggestion(suggestion: WritingSuggestion) {
  emit('apply-writing-fix', suggestion)
  toast.success('Writing improvement applied')
}

function applyTip(tip: PerformanceTip) {
  emit('apply-tip', tip)
  toast.success('Performance tip applied')
}

function suggestKeywordPlacement(keyword: string) {
  toast.info(`Consider adding "${keyword}" to your summary or experience sections`)
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function getReadingLevelClass(): string {
  return 'good' // Mock implementation
}

function getSentenceLengthClass(): string {
  const length = writingMetrics.value.avgSentenceLength
  if (length <= 20) return 'good'
  if (length <= 25) return 'fair'
  return 'poor'
}

function getPassiveVoiceClass(): string {
  const percent = writingMetrics.value.passiveVoicePercent
  if (percent <= 10) return 'excellent'
  if (percent <= 20) return 'good'
  return 'poor'
}

// Watch for content changes to trigger re-analysis
watch(() => props.documentContent, () => {
  if (showPanel.value) {
    generateSuggestions()
  }
}, { deep: true })
</script>

<style scoped>
.ai-content-optimizer {
  position: relative;
}

/* Optimization Panel */
.optimization-panel {
  position: fixed;
  top: 80px;
  right: 24px;
  width: 400px;
  max-height: 80vh;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.optimization-panel.is-floating {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-500-rgb), 0.1), 
    rgba(var(--color-gaming-500-rgb), 0.1));
  border-b: 1px solid var(--glass-border);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary-600);
}

.ai-icon {
  color: var(--color-primary-500);
  font-size: 20px;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.ai-status.ready {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success-600);
}

.ai-status.analyzing {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning-600);
}

.ai-status.disabled {
  background: rgba(var(--color-neutral-rgb), 0.1);
  color: var(--color-neutral-500);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.ai-status.analyzing .status-dot {
  animation: pulse 1.5s infinite;
}

.panel-actions {
  display: flex;
  gap: 4px;
}

/* Panel Content */
.panel-content {
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.optimization-tabs {
  display: flex;
  border-b: 1px solid var(--glass-border);
  background: rgba(var(--surface-base-rgb), 0.3);
}

.tab-btn {
  flex: 1;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.tab-btn:hover {
  background: rgba(var(--color-primary-500-rgb), 0.05);
  color: var(--color-primary-500);
}

.tab-btn.active {
  color: var(--color-primary-500);
  background: rgba(var(--color-primary-500-rgb), 0.1);
}

.tab-count {
  background: rgba(var(--color-primary-500-rgb), 0.2);
  color: var(--color-primary-500);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Optimization Content */
.optimization-content {
  padding: 20px;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.suggestions-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary-600);
}

/* Suggestions */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  background: rgba(var(--surface-base-rgb), 0.5);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
}

.suggestion-item.high {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.02);
}

.suggestion-item.medium {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.02);
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-type {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary-600);
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.high {
  background: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error-600);
}

.priority-badge.medium {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning-600);
}

.priority-badge.low {
  background: rgba(var(--color-neutral-rgb), 0.1);
  color: var(--color-neutral-500);
}

.suggestion-actions {
  display: flex;
  gap: 4px;
}

.suggestion-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.suggestion-example {
  margin-top: 6px;
  padding: 6px 8px;
  background: rgba(var(--color-primary-500-rgb), 0.05);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-primary-600);
}

/* Keywords Analysis */
.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.analysis-card {
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.score-display {
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.score-circle.large {
  width: 120px;
  height: 120px;
  font-size: 24px;
  flex-direction: column;
  gap: 4px;
}

.score-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
}

.score-circle.excellent { background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600)); }
.score-circle.good { background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600)); }
.score-circle.fair { background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600)); }
.score-circle.poor { background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600)); }

/* Keywords */
.keywords-section {
  margin-bottom: 20px;
}

.keywords-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary-600);
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.keyword-tag {
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.keyword-tag.missing {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.keyword-tag.missing:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: translateY(-1px);
}

.keyword-tag.optimized {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Writing Analysis */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.metric-item {
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary-600);
  margin-bottom: 6px;
}

.metric-indicator {
  width: 100%;
  height: 4px;
  border-radius: 2px;
}

.metric-indicator.excellent { background: #10b981; }
.metric-indicator.good { background: #3b82f6; }
.metric-indicator.fair { background: #f59e0b; }
.metric-indicator.poor { background: #ef4444; }

/* Performance Analysis */
.overall-score {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(var(--surface-base-rgb), 0.3);
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.score-breakdown {
  flex: 1;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.breakdown-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 120px;
}

.breakdown-bar {
  flex: 1;
  height: 6px;
  background: rgba(var(--text-secondary-rgb), 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-gaming-500));
  transition: width 0.5s ease;
}

.breakdown-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary-600);
  min-width: 40px;
  text-align: right;
}

/* Tips and Suggestions */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.tip-impact {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.tip-item.high .tip-impact {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.tip-item.medium .tip-impact {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.tip-item.low .tip-impact {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: 2px;
}

.tip-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Floating Action Button */
.ai-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  box-shadow: 0 8px 32px rgba(var(--color-primary-500-rgb), 0.3);
}

.ai-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(var(--color-primary-500-rgb), 0.4);
}

/* Animations */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .optimization-panel {
    width: calc(100vw - 32px);
    left: 16px;
    right: 16px;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .overall-score {
    flex-direction: column;
    gap: 16px;
  }
}
</style>