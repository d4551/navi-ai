<template>
  <UnifiedButton
    v-bind="buttonProps"
    :class="['ai-button', variantClass, contextClass]"
    :loading="isProcessing"
    :disabled="!canExecute"
    @click="handleClick"
  >
    <template #leading-icon>
      <AppIcon :name="currentIcon" :class="{ spinning: isProcessing }" />
    </template>

    <span>{{ currentText }}</span>

    <template v-if="showStatus" #trailing-icon>
      <div class="ai-status-indicator" :class="statusClass">
        <div class="status-dot"></div>
      </div>
    </template>
  </UnifiedButton>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAIIntegration } from '@/composables/useAIIntegration'
import { useAIContext } from '@/composables/useAIContext'
import { logger } from '@/shared/utils/logger'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

interface Props {
  // Action configuration
  action: string
  context?: Record<string, any>

  // Button appearance
  variant?:
    | 'primary'
    | 'glass'
    | 'gaming'
    | 'cyber'
    | 'secondary'
    | 'ghost'
    | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  text?: string
  tooltip?: string

  // Behavior
  requiresAuth?: boolean
  showProgress?: boolean
  showStatus?: boolean
  autoExecute?: boolean

  // Text variations
  loadingText?: string
  successText?: string
  errorText?: string

  // Context-aware behavior
  contextType?: 'resume' | 'cover-letter' | 'job' | 'interview' | 'portfolio'
  contextId?: string
  targetJob?: any
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  icon: 'mdi-robot-happy',
  text: 'AI Assist',
  requiresAuth: true,
  showProgress: true,
  showStatus: true,
  autoExecute: false,
  loadingText: 'Processing...',
  successText: 'Complete',
  errorText: 'Error',
})

const _emit = defineEmits<{
  success: [result: any]
  error: [error: string]
  start: []
  complete: []
  click: [event: MouseEvent]
}>()

// Composables
const aiIntegration = useAIIntegration()
const aiContext = useAIContext()

// State
const isProcessing = ref(false)
const lastResult = ref<any>(null)
const lastError = ref<string | null>(null)
const processingStage = ref<string>('')

// Computed properties
const canExecute = computed(() => {
  if (props.requiresAuth && !aiIntegration.isAIInitialized.value) {
    return false
  }

  return !isProcessing.value && aiIntegration.hasAIKey.value
})

const currentIcon = computed(() => {
  if (isProcessing.value) {
    return getProcessingIcon()
  }
  if (lastError.value) {
    return 'mdi-alert-circle'
  }
  if (lastResult.value) {
    return 'mdi-check-circle'
  }
  return props.icon
})

const currentText = computed(() => {
  if (isProcessing.value) {
    return processingStage.value || props.loadingText
  }
  if (lastError.value) {
    return props.errorText
  }
  if (lastResult.value && props.showProgress) {
    return props.successText
  }
  return props.text
})

const statusClass = computed(() => {
  if (lastError.value) return 'status-error'
  if (isProcessing.value) return 'status-processing'
  if (lastResult.value) return 'status-success'
  return 'status-ready'
})

const variantClass = computed(() => `variant-${props.variant}`)

const contextClass = computed(() => {
  if (props.contextType) {
    return `context-${props.contextType}`
  }
  return ''
})

const buttonProps = computed(() => {
  const baseProps = {
    variant: props.variant,
    size: props.size,
    tooltip: getTooltipText(),
  }

  // Pass through any additional props
  return baseProps
})

// Methods
const handleClick = async (event: MouseEvent) => {
  emit('click', event)

  if (canExecute.value && !isProcessing.value) {
    await executeAction()
  }
}

const executeAction = async () => {
  try {
    isProcessing.value = true
    lastError.value = null
    lastResult.value = null
    emit('start')

    // Initialize AI context if needed
    if (
      props.contextType &&
      props.contextId &&
      !aiContext.state.currentContext
    ) {
      processingStage.value = 'Initializing context...'
      await aiContext.initializeContext(
        props.contextType,
        props.contextId,
        props.targetJob
      )
    }

    // Execute the specific action
    const result = await executeSpecificAction()

    lastResult.value = result
    emit('success', result)

    // Auto-reset success state after 3 seconds
    setTimeout(() => {
      if (lastResult.value === result) {
        lastResult.value = null
      }
    }, 3000)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    lastError.value = errorMessage
    emit('error', errorMessage)
    logger.error('AI action failed:', error)

    // Auto-reset error state after 5 seconds
    setTimeout(() => {
      if (lastError.value === errorMessage) {
        lastError.value = null
      }
    }, 5000)
  } finally {
    isProcessing.value = false
    processingStage.value = ''
    emit('complete')
  }
}

const executeSpecificAction = async (): Promise<any> => {
  switch (props.action) {
    case 'analyze_resume':
      return await analyzeResume()

    case 'enhance_content':
      return await enhanceContent()

    case 'generate_suggestions':
      return await generateSuggestions()

    case 'optimize_keywords':
      return await optimizeKeywords()

    case 'improve_ats':
      return await improveATS()

    case 'generate_cover_letter':
      return await generateCoverLetter()

    case 'analyze_job_match':
      return await analyzeJobMatch()

    case 'prepare_interview':
      return await prepareInterview()

    case 'optimize_portfolio':
      return await optimizePortfolio()

    default:
      return await genericAIAction()
  }
}

// Specific action implementations
const analyzeResume = async () => {
  processingStage.value = 'Analyzing resume...'

  if (!props.context?.resumeContent) {
    throw new Error('Resume content is required for analysis')
  }

  // Mock implementation - replace with actual AI service call
  await new Promise(resolve => setTimeout(resolve, 2000))

  const analysis = {
    score: Math.floor(Math.random() * 30) + 70,
    strengths: [
      'Strong technical skills presentation',
      'Clear career progression shown',
      'Quantified achievements included',
    ],
    improvements: [
      'Add more gaming industry keywords',
      'Include specific project metrics',
      'Strengthen summary section',
    ],
    keywords: ['Unity', 'C#', 'Game Development', 'Agile', 'Team Leadership'],
    suggestions: [
      {
        id: 'keyword_opt_1',
        type: 'enhancement',
        title: 'Add Gaming Keywords',
        description: 'Include more gaming industry specific terms',
        priority: 'high',
      },
    ],
  }

  // Update AI context with analysis
  if (aiContext.state.currentContext) {
    aiContext.state.lastAnalysis = analysis
  }

  return analysis
}

const enhanceContent = async () => {
  processingStage.value = 'Enhancing content...'

  // Mock enhancement
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    enhanced: true,
    improvements: 3,
    changes: [
      'Strengthened action verbs',
      'Added quantifiable metrics',
      'Improved readability',
    ],
  }
}

const generateSuggestions = async () => {
  processingStage.value = 'Generating suggestions...'

  if (aiContext.state.currentContext) {
    await aiContext.generateContextActions(aiContext.state.currentContext)
    return { suggestions: aiContext.activeSuggestions.value.length }
  }

  return { suggestions: 0 }
}

const optimizeKeywords = async () => {
  processingStage.value = 'Optimizing keywords...'

  await new Promise(resolve => setTimeout(resolve, 1800))

  return {
    keywordsAdded: 5,
    keywordsOptimized: ['Unity', 'Game Design', 'C#', 'Agile', 'Scrum'],
    atsScore: 85,
  }
}

const improveATS = async () => {
  processingStage.value = 'Improving ATS compatibility...'

  await new Promise(resolve => setTimeout(resolve, 2200))

  return {
    atsScore: 92,
    improvements: [
      'Standardized section headers',
      'Removed complex formatting',
      'Added relevant keywords',
    ],
  }
}

const generateCoverLetter = async () => {
  processingStage.value = 'Generating cover letter...'

  if (!props.context?.jobDescription) {
    throw new Error('Job description is required for cover letter generation')
  }

  await new Promise(resolve => setTimeout(resolve, 3000))

  return {
    coverLetter: 'Generated cover letter content...',
    personalizedElements: 4,
    keywordsMatched: 8,
  }
}

const analyzeJobMatch = async () => {
  processingStage.value = 'Analyzing job compatibility...'

  await new Promise(resolve => setTimeout(resolve, 2500))

  return {
    matchScore: 87,
    strengths: ['Technical skills align well', 'Experience level matches'],
    gaps: [
      'Need more Unity experience',
      'Could improve team leadership skills',
    ],
    recommendations: [
      'Highlight relevant projects',
      'Emphasize collaborative work',
    ],
  }
}

const prepareInterview = async () => {
  processingStage.value = 'Preparing interview materials...'

  await new Promise(resolve => setTimeout(resolve, 2000))

  return {
    questions: 15,
    categories: ['Technical', 'Behavioral', 'Cultural fit'],
    preparationTime: '30 minutes recommended',
  }
}

const optimizePortfolio = async () => {
  processingStage.value = 'Optimizing portfolio...'

  await new Promise(resolve => setTimeout(resolve, 2200))

  return {
    projectsOptimized: 3,
    improvementsSuggested: 7,
    overallScore: 88,
  }
}

const genericAIAction = async () => {
  processingStage.value = 'Processing with AI...'

  // Generic AI processing
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    action: props.action,
    success: true,
    timestamp: new Date().toISOString(),
  }
}

// Utility methods
const getProcessingIcon = () => {
  const icons = {
    analyze_resume: 'mdi-chart-line',
    enhance_content: 'mdi-pencil-plus',
    generate_suggestions: 'mdi-lightbulb',
    optimize_keywords: 'mdi-key',
    improve_ats: 'mdi-robot',
    generate_cover_letter: 'mdi-file-document-edit',
    analyze_job_match: 'mdi-compare',
    prepare_interview: 'mdi-microphone',
    optimize_portfolio: 'mdi-briefcase',
  }

  return icons[props.action] || 'mdi-loading'
}

const getTooltipText = () => {
  if (!canExecute.value) {
    if (!aiIntegration.hasAIKey.value) {
      return 'AI key required - configure in Settings'
    }
    if (!aiIntegration.isAIInitialized.value) {
      return 'AI service initializing...'
    }
    return 'AI action not available'
  }

  if (isProcessing.value) {
    return processingStage.value || 'Processing...'
  }

  if (lastError.value) {
    return `Error: ${lastError.value}`
  }

  return props.tooltip || `AI-powered ${props.action.replace('_', ' ')}`
}

// Auto-execute if specified
watch(
  () => props.autoExecute,
  shouldExecute => {
    if (shouldExecute && canExecute.value) {
      executeAction()
    }
  },
  { immediate: true }
)

// Reset state when context changes
watch(
  () => props.context,
  () => {
    lastResult.value = null
    lastError.value = null
  }
)
</script>

<style scoped>
.enhanced-ai-button {
  position: relative;
  transition: all 0.3s ease;
}

.enhanced-ai-button.variant-gaming {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary))
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
}

.enhanced-ai-button.variant-gaming:hover {
  box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

.enhanced-ai-button.context-resume {
  border-left: 3px solid rgb(var(--v-theme-info));
}

.enhanced-ai-button.context-cover-letter {
  border-left: 3px solid rgb(var(--v-theme-success));
}

.enhanced-ai-button.context-interview {
  border-left: 3px solid rgb(var(--v-theme-warning));
}

.enhanced-ai-button.context-portfolio {
  border-left: 3px solid rgb(var(--v-theme-error));
}

.ai-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8px;
  height: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-ready .status-dot {
  background: rgba(var(--v-theme-on-surface), 0.4);
}

.status-processing .status-dot {
  background: rgb(var(--v-theme-warning));
  animation: pulse 1s infinite;
}

.status-success .status-dot {
  background: rgb(var(--v-theme-success));
  animation: success-pulse 0.6s ease-out;
}

.status-error .status-dot {
  background: rgb(var(--v-theme-error));
  animation: error-shake 0.6s ease-out;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@keyframes success-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .enhanced-ai-button {
    min-width: 44px; /* Ensure touch-friendly size */
  }
}
</style>
