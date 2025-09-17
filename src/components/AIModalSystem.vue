<template>
  <div class="ai-modal-system">
    <!-- AI Helper Modal -->
    <Teleport to="body">
      <div v-if="showHelperModal" class="modal fade show" :style="{ display: showHelperModal ? 'block' : 'none' }" @click.self="closeModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content zelda-modal-content">
            <div class="modal-header zelda-modal-header glass-elevated">
              <h5 class="modal-title zelda-title">
                <div class="title-decoration">
                  <AppIcon name="mdi-triforce" class="zelda-triforce-header" />
                  <AppIcon name="CpuChipIcon" class="magical-brain mr-2" />
                </div>
                <span class="title-text">{{ helperTitle || 'AI Assistant' }}</span>
                <div class="title-subtitle">Your magical companion</div>
              </h5>
              <div class="flex items-center gap-glass-sm">
                <UnifiedButton variant="ghost" size="sm" icon-only :icon="'XMarkIcon'" class="zelda-close-btn" aria-label="Close" @click="closeModal" />
              </div>
            </div>
            <div class="modal-body">
              <!-- Context Awareness Tabs -->
              <div class="nav nav-tabs mb-4" role="tablist">
                <button
                  v-for="tab in contextTabs"
                  :key="tab.id"
                  class="nav-link"
                  :class="{ active: activeTab === tab.id }"
                  @click="activeTab = tab.id"
                >
                  <i :class="tab.icon mr-1"></i>
                  {{ tab.label }}
                  <span v-if="tab.count !== undefined" class="badge bg-blue-500 ml-1">{{ tab.count }}</span>
                </button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Suggestions Tab -->
                <div v-if="activeTab === 'suggestions'" class="tab-pane fade show active">
                  <div class="unified-grid g-3 mb-3">
                    <div
                      v-for="suggestion in filteredSuggestions"
                      :key="suggestion.id"
                      class="suggestion-card flex-1-md-6"
                      :class="getPriorityClass(suggestion.priority)"
                    >
                      <div class="card h-100" :class="getPriorityCardClass(suggestion.priority)">
                        <div class="card-body section-body card-body--dense">
                          <div class="flex items-start">
                            <div class="flex-grow-1">
                              <div class="flex items-center mb-2">
                                <span :class="`badge mr-2 ${getBadgeClass(suggestion.type)}`">{{ suggestion.type }}</span>
                                <small class="text-secondary">{{ getPriorityLabel(suggestion.priority) }}</small>
                              </div>
                              <h6 class="mb-2">{{ suggestion.title }}</h6>
                              <p class="text-secondary small mb-3">{{ suggestion.description }}</p>

                              <div v-if="!suggestion.appliedAt" class="flex gap-glass-sm">
                                <button
                                  class="unified-btn btn-sm ui-btn ui-size-md v-btn"
                                  :class="getActionButtonClass(suggestion)"
                                  :disabled="processingSuggestion === suggestion.id || isProcessing"
                                  @click="applySuggestion(suggestion.id)"
                                >
                                  <AppIcon name="SparklesIcon" class="mr-1" />
                                  {{ processingSuggestion === suggestion.id ? 'Applying...' : getActionText(suggestion) }}
                                </button>
                                <button
                                  class="unified-btn btn-outline-secondary btn-sm v-btn variant-outlined ui-btn ui-size-md"
                                  :disabled="processingSuggestion === suggestion.id || isProcessing"
                                  @click="dismissSuggestion(suggestion.id)"
                                >
                                  <AppIcon name="XMarkIcon-circle-outline" />
                                  Dismiss
                                </button>
                              </div>

                              <small v-if="suggestion.appliedAt" class="text-success-600">
                                <AppIcon name="CheckCircleIcon" />
                                Applied {{ formatDate(suggestion.appliedAt) }}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="filteredSuggestions.length === 0" class="text-center text-secondary py-4">
                    <AppIcon name="LightBulbIcon" />
                    <h6>No Suggestions Available</h6>
                    <p>AI assistant will provide suggestions when you make changes to your content.</p>
                  </div>
                </div>

                <!-- Analysis Tab -->
                <div v-if="activeTab === 'analysis'" class="tab-pane fade show active">
                  <div class="analysis-section">
                    <div class="flex gap-glass-md mb-3" role="group" aria-label="Analysis actions">
                      <button
                        class="unified-btn btn-primary btn-sm v-btn ui-btn ui-size-md"
                        :disabled="!currentEntity || isProcessing"
                        @click="requestAnalysis"
                      >
                        <AppIcon name="CpuChipIcon" class="mr-2" />
                        {{ isProcessing ? 'Analyzing...' : 'Analyze Content' }}
                      </button>
                      <button
                        class="unified-btn btn-outline-info btn-sm v-btn variant-outlined ui-btn ui-size-md"
                        :disabled="!currentEntity || isProcessing"
                        @click="runATSCalculations"
                      >
                        <AppIcon name="CheckIcon-circle-outline-outline" class="mr-2" />
                        ATS Compatibility Check
                      </button>
                    </div>

                    <!-- Analysis Results -->
                    <div v-if="analysisResults">
                      <div class="unified-grid g-3">
                        <!-- Overall Score -->
                        <div class="flex-1-md-4">
                          <div class="unified-card glass-card section-card text-center">
                            <div class="card-body section-body">
                              <div class="score-circle" :class="getScoreClass(analysisResults.overallScore)">
                                <div class="score-number">{{ analysisResults.overallScore || 0 }}</div>
                                <div class="score-label">Score</div>
                              </div>
                              <h6 class="mt-3 mb-3">Quality Score</h6>
                              <div class="score-description">
                                {{ getScoreDescription(analysisResults.overallScore || 0) }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Analysis Metrics -->
                        <div v-for="(metric, index) in analysisMetrics" :key="index" class="flex-1-md-4">
                          <div class="unified-card glass-card section-card">
                            <div class="card-header section-header card-header--dense">
                              <h6 class="mb-0">
                                <i :class="metric.icon mr-2"></i>
                                {{ metric.title }}
                              </h6>
                            </div>
                            <div class="card-body section-body card-body--dense">
                              <div class="flex items-center">
                                <div class="flex-grow-1">
                                  <div class="metric-value">{{ metric.value }}</div>
                                  <small class="text-secondary">{{ metric.description }}</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Recommendations -->
                        <div v-if="analysisResults.recommendations?.length" class="flex-1-12">
                          <div class="unified-card glass-card section-card">
                            <div class="card-header section-header">
                              <h6 class="mb-0">
                                <AppIcon name="LightBulbIcon" />
                                Recommendations
                              </h6>
                            </div>
                            <div class="card-body section-body">
                              <ul class="list-unstyled mb-0">
                                <li
                                  v-for="(recommendation, index) in analysisResults.recommendations"
                                  :key="index"
                                  class="mb-2 flex items-start"
                                >
                                  <AppIcon name="CheckCircleIcon" color="success" />
                                  <span class="small">{{ recommendation }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else-if="!isProcessing" class="text-center text-secondary py-4">
                      <AppIcon name="CpuChipIcon" class="mdi-48px mb-3" />
                      <h6 class="mb-2">Ready for Analysis</h6>
                      <p class="mb-3">Click "Analyze Content" to get AI insights about your {{ currentEntityType }}</p>
                      <small class="text-blue-600">
                        <AppIcon name="InformationCircleIcon" class="mr-1" />
                        Analysis includes keyword optimization, ATS compatibility, and improvement suggestions
                      </small>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isProcessing" class="text-center py-4">
                      <AppIcon name="CpuChipIcon" class="spin mdi-48px mb-3 text-primary-600" />
                      <h6 class="mb-2">Analyzing Your Content</h6>
                      <p class="text-secondary">AI is evaluating your {{ currentEntityType }} and generating personalized recommendations...</p>
                      <div class="progress mt-3 w-[300px]">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 75%"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Chat Tab -->
                <div v-if="activeTab === 'chat'" class="tab-pane fade show active">
                  <div class="chat-interface mb-3">
                    <div ref="chatContainer" class="chat-messages">
                      <div
                        v-for="message in chatMessages"
                        :key="message.id"
                        class="message mb-3"
                        :class="{ 'message-own': message.sender === 'user' }"
                      >
                        <div class="flex" :class="{ 'justify-end': message.sender === 'user' }">
                          <!-- Left-side avatar for AI/System -->
                          <div v-if="message.sender !== 'user'" class="message-avatar mr-2">
                            <AppIcon :name="message.sender === 'ai' ? 'mdi-robot' : 'InformationCircleIconrmation'" />
                          </div>

                          <div
                            class="message-bubble"
                            :class="{ 'message-bubble-own': message.sender === 'user', 'message-bubble-ai': message.sender === 'ai' }"
                          >
                            <div class="message-content">
                              <p class="mb-0 message-text">{{ message.content }}</p>
                              <small class="text-secondary message-timestamp">{{ formatTime(message.timestamp) }}</small>
                            </div>
                          </div>

                          <!-- Right-side avatar for User -->
                          <div v-if="message.sender === 'user'" class="message-avatar ml-2">
                            <AppIcon name="UserIcon" />
                          </div>
                        </div>
                      </div>
                      <div v-if="isProcessing" class="message">
                        <div class="flex">
                          <div class="message-bubble">
                            <div class="message-content">
                              <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form class="chat-input-section" @submit.prevent="sendChatMessage">
                      <div class="input-group">
                        <input
                          v-model="chatInput"
                          type="text"
                          class="unified-input ui-input"
                          placeholder="Ask me anything about your application materials..."
                          :disabled="isProcessing"
                          @keydown.enter.prevent="sendChatMessage"
                        >
                        <button
                          type="submit"
                          class="unified-btn btn-primary v-btn ui-btn ui-size-md"
                          :disabled="!chatInput.trim() || isProcessing"
                        >
                          <AppIcon name="PaperAirplaneIcon" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="unified-btn btn-secondary ui-btn ui-size-md v-btn" @click="closeModal">
                <AppIcon name="XMarkIcon-circle-outline" />
                Close
              </button>
              <div v-if="recentActions.length > 0" class="ms-auto">
                <small class="text-secondary">
                  {{ recentActions.length }} actions taken
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Backdrop -->
    <Teleport to="body">
      <div
        v-if="showHelperModal"
        class="modal-backdrop fade show"
        @click="closeModal"
      ></div>
    </Teleport>

    <!-- Floating AI Button - Zelda Style -->
    <div v-if="!showHelperModal && showFloatingButton" class="ai-floating-button zelda-style">
      <button
        class="unified-btn btn-primary btn-lg rounded-circle zelda-assistant-btn v-btn ui-btn ui-size-md"
        :class="{ 'pulse': newSuggestionsAvailable, 'magical-glow': newSuggestionsAvailable }"
        title="Hey! Listen! - AI Assistant"
        @click="openModal"
      >
        <AppIcon name="CpuChipIcon" class="magical-icon" />
        <span v-if="newSuggestionsAvailable" class="notification-badge magical-badge">{{ activeSuggestions.length }}</span>
        <!-- Magical particles -->
        <div class="magical-particles">
          <span v-for="i in 6" :key="i" class="particle"></span>
        </div>
      </button>

      <!-- Enhanced Zelda-style tooltip -->
      <div v-if="activeSuggestions.length > 0" class="ai-tooltip zelda-dialogue">
        <div class="tooltip-arrow zelda-arrow"></div>
        <div class="tooltip-content zelda-content">
          <div class="zelda-header">
            <AppIcon name="mdi-triforce" class="zelda-triforce" />
            <span class="zelda-greeting">Hey! Listen!</span>
          </div>
          <div class="zelda-message">
            I have {{ activeSuggestions.length }} suggestions to help improve your {{ currentEntityType }}!
          </div>
          <ul class="zelda-suggestions mb-0 small">
            <li v-for="suggestion in activeSuggestions.slice(0, 3)" :key="suggestion.id" class="zelda-suggestion-item">
              <AppIcon name="ChevronRightIcon" class="zelda-arrow-icon" />
              {{ suggestion.title }}
            </li>
          </ul>
          <div class="zelda-footer">
            <small class="text-secondary">Click to open the assistant!</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, ChevronRightIcon, CpuChipIcon, InformationCircleIcon, LightBulbIcon, PaperAirplaneIcon, SparklesIcon, UserIcon } from '@heroicons/vue/24/outline'

import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import { useAIContext } from '@/composables/useAIContext'

// Props
interface Props {
  entityType?: 'resume' | 'cover-letter' | 'job' | 'interview' | 'portfolio'
  entityId?: string
  entityData?: Record<string, any>
  targetJob?: any
  show?: boolean
  showFloatingButton?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  entityType: undefined,
  entityId: undefined,
  entityData: () => ({}),
  targetJob: undefined,
  show: false,
  showFloatingButton: true
})

// Emits
const emit = defineEmits<{
  modalToggled: [show: boolean]
  suggestionApplied: [suggestionId: string, success: boolean]
  analysisCompleted: [results: any]
}>()

// Composables
const aiContext = useAIContext()
const isProcessing = ref(false)

// Reactive state
const showHelperModal = ref(false)
const activeTab = ref('suggestions')
const analysisResults = ref<any>(null)
const chatMessages = ref<any[]>([])
const chatInput = ref('')
const processingSuggestion = ref<string | null>(null)
const lastAnalysisTime = ref<Date>(new Date())

// Computed properties
const filteredSuggestions = computed(() =>
  aiContext.activeSuggestions.value.filter(s => !s.appliedAt)
)

const recentActions = computed(() =>
  aiContext.recentActions.value.slice(0, 5)
)

const activeSuggestions = computed(() =>
  aiContext.activeSuggestions.value
)

const contextTabs = computed(() => {
  const tabs = [
    {
      id: 'suggestions',
      label: 'Suggestions',
      icon: 'LightBulbIcon',
      count: filteredSuggestions.value.length
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: 'mdi-magnify-scan'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: 'mdi-chat-question'
    }
  ]

  return tabs
})

const helperTitle = computed(() => {
  const entityPrefix = _props.entityType ? `${_props.entityType.charAt(0).toUpperCase() + _props.entityType.slice(1)} - ` : ''
  return `${entityPrefix}AI Assistant`
})

const newSuggestionsAvailable = computed(() =>
  activeSuggestions.value.length > 0
)

const currentEntity = computed(() =>
  _props.entityData || aiContext.state.currentContext?.entities?.[0]?.data
)

const currentEntityType = computed(() =>
  _props.entityType || aiContext.state.currentContext?.entityType || 'content'
)

const analysisMetrics = computed(() => {
  if (!analysisResults.value) return []

  return [
    {
      title: 'Keywords Matched',
      value: analysisResults.value.keywordScore || '75%',
      icon: 'TagIcon-text',
      description: 'Resume keywords matching job requirements'
    },
    {
      title: 'ATS Score',
      value: analysisResults.value.atsScore || '82%',
      icon: 'CheckIcon-decagram',
      description: 'Applicants Tracking System compatibility'
    },
    {
      title: 'Strength Score',
      value: analysisResults.value.strengthScore || '78%',
      icon: 'mdi-trending-up',
      description: 'Overall content quality assessment'
    }
  ]
})

// Methods
const openModal = async (): Promise<void> => {
  if (_props.entityType && _props.entityId) {
    await aiContext.initializeContext(_props.entityType, _props.entityId, _props.targetJob)
  }

  showHelperModal.value = true
  activeTab.value = 'suggestions'
  emit('modalToggled', true)
}

const closeModal = (): void => {
  showHelperModal.value = false
  emit('modalToggled', false)
}

const applySuggestion = async (suggestionId: string): Promise<void> => {
  try {
    processingSuggestion.value = suggestionId
    await aiContext.applySuggestion(suggestionId)
    emit('suggestionApplied', suggestionId, true)
  } catch (error) {
    console.error('Failed to apply suggestion:', error)
    emit('suggestionApplied', suggestionId, false)
  } finally {
    processingSuggestion.value = null
  }
}

const dismissSuggestion = (suggestionId: string): void => {
  aiContext.dismissSuggestion(suggestionId)
}

const requestAnalysis = async (): Promise<void> => {
  try {
    analysisResults.value = null
    const results = await performAnalysis()
    analysisResults.value = results
    lastAnalysisTime.value = new Date()
    emit('analysisCompleted', results)
  } catch (error) {
    console.error('Analysis failed:', error)
    analysisResults.value = { error: 'Analysis failed. Please try again.' }
  }
}

const runATSCalculations = async (): Promise<void> => {
  try {
    const atsResults = await performATSAnalysis()
    analysisResults.value = {
      ...analysisResults.value,
      atsScore: atsResults.score,
      atsIssues: atsResults.issues,
      atsSuggestions: atsResults.suggestions
    }
  } catch (error) {
    console.error('ATS analysis failed:', error)
  }
}

const performAnalysis = async (): Promise<any> => {
  if (!currentEntity.value) {
    throw new Error('No entity data available for analysis')
  }

  // Mock analysis results - in real implementation, this would call the AI service
  const analysis = {
    overallScore: Math.floor(Math.random() * 30) + 70,
    keywordScore: `${Math.floor(Math.random() * 30) + 70}%`,
    atsScore: `${Math.floor(Math.random() * 30) + 70}%`,
    strengthScore: `${Math.floor(Math.random() * 30) + 70}%`,
    recommendations: [
      'Add more quantifiable achievements to demonstrate impact',
      'Include relevant technical skills matching the job requirements',
      'Strengthen the summary section with specific accomplishments'
    ]
  }

  return analysis
}

const performATSAnalysis = async (): Promise<any> => {
  // Mock ATS analysis
  return {
    score: `${Math.floor(Math.random() * 20) + 75}%`,
    issues: [],
    suggestions: [
      'Use standard section headings (Skills, Experience, Education)',
      'Incorporate keywords from the job description naturally',
      'Use plain text formatting and avoid complex layouts'
    ]
  }
}

const sendChatMessage = async (): Promise<void> => {
  if (!chatInput.value.trim() || isProcessing.value) return

  const userMessage = {
    id: Date.now(),
    content: chatInput.value.trim(),
    sender: 'user',
    timestamp: new Date()
  }

  chatMessages.value.push(userMessage)
  chatInput.value = ''

  try {
    isProcessing.value = true

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing time

    const aiResponse = {
      id: Date.now() + 1,
      content: `Thank you for your question about "${userMessage.content}". Based on your content, I recommend focusing on quantifiable achievements and relevant keywords. Would you like me to help you refine any specific section?`,
      sender: 'ai',
      timestamp: new Date()
    }

    chatMessages.value.push(aiResponse)
    isProcessing.value = false

    // Scroll to bottom
    await nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Chat message failed:', error)
    isProcessing.value = false
  }
}

// Utility methods
const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'high': return 'priority-high'
    case 'urgent': return 'priority-urgent'
    default: return 'priority-normal'
  }
}

const getPriorityCardClass = (priority: string): string => {
  switch (priority) {
    case 'high': return 'border-warning'
    case 'urgent': return 'border-danger bg-glass-bg dark:bg-glass-bg-hover-danger'
    default: return 'border-secondary'
  }
}

const getBadgeClass = (type: string): string => {
  switch (type) {
    case 'enhancement': return 'bg-primary-500'
    case 'correction': return 'bg-error-500'
    case 'analysis': return 'bg-blue-500'
    default: return 'bg-secondary-500'
  }
}

const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'high': return 'High Priority'
    case 'urgent': return 'Urgent'
    case 'low': return 'Low Priority'
    default: return 'Normal'
  }
}

const getActionText = (suggestion: any): string => {
  switch (suggestion.type) {
    case 'enhancement': return 'Apply'
    case 'correction': return 'Fix'
    case 'analysis': return 'Analyze'
    default: return 'Action'
  }
}

const getActionButtonClass = (suggestion: any): string => {
  switch (suggestion.priority) {
    case 'urgent': return 'btn-danger'
    case 'high': return 'btn-warning'
    default: return 'btn-primary'
  }
}

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-poor'
}

const getScoreDescription = (score: number): string => {
  if (score >= 90) return 'Excellent quality'
  if (score >= 80) return 'Good quality with minor improvements'
  if (score >= 70) return 'Average quality - significant improvements recommended'
  return 'Needs substantial improvement'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = (): void => {
  if (document.querySelector('.chat-messages')) {
    document.querySelector('.chat-messages')!.scrollTop = document.querySelector('.chat-messages')!.scrollHeight
  }
}

// Lifecycle
onMounted(async () => {
  if (_props.show) {
    await openModal()
  }

  // Watch for prop changes
  watch(() => _props.show, async (newShow) => {
    if (newShow && !showHelperModal.value) {
      await openModal()
    } else if (!newShow && showHelperModal.value) {
      closeModal()
    }
  })
})

// Handle escape key
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && showHelperModal.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  aiContext.stopContextPolling()
})
</script>

<style scoped>
.ai-modal-system {
  position: relative;
}

/* Modal Enhanced Styles */
.suggestion-card.priority-high .card {
  border-l: 4px solid var(--color-warning);
}

.suggestion-card.priority-urgent .card {
  border-l: 4px solid var(--color-danger);
  animation: pulseWarn 2s infinite;
}

@keyframes pulseWarn {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Floating Button - Enhanced Zelda Style */
.ai-floating-button {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: var(--z-floating);
}

.ai-floating-button.zelda-style .unified-btn {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-glass-lg), var(--glass-shadow);
  transition: all var(--duration-smooth) var(--easing-bounce);
  position: relative;
  background: var(--gradient-primary);
  border: 2px solid var(--glass-border);
  overflow: visible;
}

.zelda-assistant-btn:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: var(--shadow-glass-xl), var(--shadow-glow-primary);
}

.zelda-assistant-btn.magical-glow {
  animation: magicalPulse 2s ease-in-out infinite,
             gentleFloat 3s ease-in-out infinite;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2),
              0 0 25px rgba(26, 115, 232, 0.5),
              0 0 35px rgba(52, 168, 83, 0.3),
              0 0 45px rgba(251, 188, 4, 0.2);
}

.magical-icon {
  font-size: 1.75rem;
  color: white;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: iconGlow 2s ease-in-out infinite alternate;
}

.magical-particles {
  position: absolute; /* Use .center-absolute class from design system */
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(251, 188, 4, 0.6) 100%);
  border-radius: 50%;
  animation: particleOrbit 4s linear infinite;
  opacity: 0.8;
}

.particle:nth-child(1) { animation-delay: 0s; }
.particle:nth-child(2) { animation-delay: 0.7s; }
.particle:nth-child(3) { animation-delay: 1.4s; }
.particle:nth-child(4) { animation-delay: 2.1s; }
.particle:nth-child(5) { animation-delay: 2.8s; }
.particle:nth-child(6) { animation-delay: 3.5s; }

@keyframes magicalPulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.08);
    filter: brightness(1.2) hue-rotate(10deg);
  }
}

@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes iconGlow {
  0% {
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.8),
                 0 0 12px rgba(26, 115, 232, 0.6);
  }
  100% {
    text-shadow: 0 0 12px rgba(255, 255, 255, 1),
                 0 0 18px rgba(26, 115, 232, 0.8),
                 0 0 24px rgba(52, 168, 83, 0.4);
  }
}

@keyframes particleOrbit {
  0% {
    transform: rotate(0deg) translateX(45px) rotate(0deg);
    opacity: 0;
  }
  10%, 90% {
    opacity: 0.8;
  }
  100% {
    transform: rotate(360deg) translateX(45px) rotate(-360deg);
    opacity: 0;
  }
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-danger);
  color: white;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid white;
  animation: badgeBounce 1s ease-in-out infinite;
}

.magical-badge {
  background: linear-gradient(45deg, var(--color-error-500) 0%, var(--color-warning-500) 100%);
  box-shadow: 0 2px 8px rgba(var(--color-error-rgb), 0.4),
              0 0 12px rgba(var(--color-warning-rgb), 0.3);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

@keyframes badgeBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Enhanced Zelda-style AI Tooltip */
.ai-tooltip {
  position: absolute;
  bottom: 95px;
  right: 0;
  min-width: 280px;
  max-width: 360px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(var(--spacing-md)) scale(0.9);
  transition: all var(--duration-smooth) var(--easing-bounce);
}

.ai-floating-button:hover .ai-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.zelda-dialogue {
  animation: dialogueEntrance 0.6s ease-out;
}

.zelda-arrow {
  position: absolute;
  top: 100%;
  right: 25px;
  border: 8px solid transparent;
  border-t-color: rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.zelda-content {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--glass-shadow);
  border: 2px solid var(--glass-border);
  font-size: var(--font-size-sm);
  position: relative;
  backdrop-filter: var(--glass-backdrop-blur);
}

.zelda-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.zelda-triforce {
  color: var(--color-warning-500);
  font-size: 1.2rem;
  margin-right: 8px;
  text-shadow: 0 0 8px rgba(251, 188, 4, 0.6);
  animation: triforceGlow 2s ease-in-out infinite alternate;
}

.zelda-greeting {
  font-weight: 700;
  color: var(--color-info-500);
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.zelda-message {
  margin-bottom: 12px;
  color: var(--text-primary-600);
  line-height: 1.4;
  font-weight: 500;
}

.zelda-suggestions {
  padding-left: 0;
  margin-bottom: 12px;
}

.zelda-suggestion-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: rgba(26, 115, 232, 0.05);
}

.zelda-suggestion-item:hover {
  background: rgba(26, 115, 232, 0.1);
  transform: translateX(4px);
}

.zelda-arrow-icon {
  color: var(--color-success-500);
  margin-right: 6px;
  font-size: 0.9rem;
}

.zelda-footer {
  text-align: center;
  margin-top: 8px;
  padding-top: 8px;
  border-t: 1px solid rgba(26, 115, 232, 0.1);
}

@keyframes dialogueEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8) rotate(-2deg);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02) rotate(1deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

@keyframes triforceGlow {
  0% {
    text-shadow: 0 0 8px rgba(251, 188, 4, 0.6),
                 0 0 12px rgba(251, 188, 4, 0.3);
  }
  100% {
    text-shadow: 0 0 12px rgba(251, 188, 4, 0.9),
                 0 0 18px rgba(251, 188, 4, 0.5),
                 0 0 24px rgba(251, 188, 4, 0.2);
  }
}

/* Score Colors */
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

.score-excellent {
  background: linear-gradient(135deg, var(--color-success), var(--color-success-light));
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

.score-poor {
  background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
  color: white;
}

/* Chat Interface */
.chat-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
  margin-bottom: 15px;
}

.chat-messages .message-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat-messages .message-content a { color: var(--color-primary-500); text-decoration: underline; }
.chat-messages .message-content code {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
  background: var(--surface-elevated);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  padding: 0 4px;
}
.chat-messages .message-content pre {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
  background: var(--surface-elevated);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
  white-space: pre;
}

.message-own {
  flex-direction: flex flex-wrap-reverse;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  background: white;
  border: 1px solid var(--glass-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-bubble-ai {
  border-l: 3px solid color-mix(in srgb, var(--color-primary-500) 55%, transparent);
}

.message-bubble-own {
  background: var(--color-primary);
  color: white;
  margin-left: auto;
}

.message-content p {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-content small {
  opacity: 0.7;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 3px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: typingDot 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
.typing-indicator span:nth-child(3) { animation-delay: 0s; }

@keyframes typingDot {
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

/* Enhanced Modal Header - Zelda Style */
.zelda-modal-header {
  background: linear-gradient(135deg, 
              rgba(26, 115, 232, 0.95) 0%,
              rgba(52, 168, 83, 0.9) 50%,
              rgba(251, 188, 4, 0.85) 100%);
  color: white;
  padding: 20px 24px;
  border-b: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.zelda-modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="triforce" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><polygon points="10,2 18,16 2,16" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23triforce)"/></svg>');
  opacity: 0.3;
  animation: patternFlow 20s linear infinite;
}

.zelda-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;
}

.title-decoration {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.zelda-triforce-header {
  font-size: 1.4rem;
  margin-right: 12px;
  color: var(--color-warning-500);
  text-shadow: 0 0 10px rgba(251, 188, 4, 0.8);
  animation: triforceHeaderGlow 3s ease-in-out infinite alternate;
}

.magical-brain {
  font-size: 1.6rem;
  color: white;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
  animation: brainPulse 2s ease-in-out infinite;
}

.title-text {
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 2px;
}

.title-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 400;
  font-style: italic;
}

.zelda-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.zelda-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.zelda-close-btn i {
  color: white;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes patternFlow {
  0% { transform: translateX(0) translateY(0); }
  100% { transform: translateX(-20px) translateY(-20px); }
}

@keyframes triforceHeaderGlow {
  0% {
    text-shadow: 0 0 10px rgba(251, 188, 4, 0.8),
                 0 0 20px rgba(251, 188, 4, 0.4);
  }
  100% {
    text-shadow: 0 0 15px rgba(251, 188, 4, 1),
                 0 0 25px rgba(251, 188, 4, 0.6),
                 0 0 35px rgba(251, 188, 4, 0.3);
  }
}

@keyframes brainPulse {
  0%, 100% {
    transform: scale(1);
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 0 18px rgba(255, 255, 255, 1),
                 0 0 24px rgba(26, 115, 232, 0.6);
  }
}

/* Dark Theme Support */
[data-theme="dark"] .ai-tooltip .tooltip-content {
  background: var(--glass-surface);
  border-color: var(--glass-border);
  color: var(--text-primary-600);
}

[data-theme="dark"] .message-bubble {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}

[data-theme="dark"] .chat-messages {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}

[data-theme="dark"] .zelda-content {
  background: linear-gradient(135deg, 
              rgba(30, 30, 30, 0.95) 0%,
              rgba(20, 20, 25, 0.98) 100%);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .zelda-message {
  color: var(--text-secondary);
}

/* Enhanced Modal Content */
.zelda-modal-content {
  background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%,
              rgba(248, 250, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(26, 115, 232, 0.2);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15),
              0 0 20px rgba(26, 115, 232, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.zelda-modal-content .modal-body {
  background: transparent;
  padding: 24px;
}

.zelda-modal-content .modal-footer {
  background: rgba(248, 250, 255, 0.8);
  backdrop-filter: blur(8px);
  border-t: 1px solid rgba(26, 115, 232, 0.15);
  padding: 16px 24px;
}

/* Enhanced Tab Navigation */
.zelda-modal-content .nav-tabs {
  border: none;
  background: rgba(26, 115, 232, 0.08);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.zelda-modal-content .nav-link {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.zelda-modal-content .nav-link.active {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-success-500) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
  transform: translateY(-1px);
}

.zelda-modal-content .nav-link:not(.active):hover {
  background: rgba(26, 115, 232, 0.12);
  color: var(--color-info-500);
  transform: translateY(-1px);
}

/* Enhanced Cards */
.zelda-modal-content .unified-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(26, 115, 232, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.zelda-modal-content .unified-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 115, 232, 0.15);
  border-color: rgba(26, 115, 232, 0.25);
}

/* Enhanced Buttons */
.zelda-modal-content .unified-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 18px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.zelda-modal-content .unified-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Dark theme modal adjustments */
[data-theme="dark"] .zelda-modal-content {
  background: linear-gradient(135deg, 
              rgba(20, 20, 25, 0.95) 0%,
              rgba(15, 15, 20, 0.98) 100%);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .zelda-modal-content .modal-footer {
  background: rgba(15, 15, 20, 0.8);
  border-t-color: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .zelda-modal-content .nav-tabs {
  background: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .zelda-modal-content .unified-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .zelda-modal-content .unified-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Spin Animation for Processing */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .ai-floating-button {
    bottom: 1rem;
    right: 1rem;
  }

  .ai-floating-button .unified-btn {
    width: 56px;
    height: 56px;
  }

  .notification-badge {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }

  .score-circle {
    width: 70px;
    height: 70px;
  }

  .score-number {
    font-size: 1.5rem;
  }
}

/* Mobile Modal Adjustments */
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0;
    max-width: 100vw;
    height: 100vh;
  }

  .modal-content {
    border-radius: 0;
    height: 100vh;
  }

  .modal-body {
    overflow-y: auto;
  }

  .chat-messages {
    max-height: 300px;
  }
}
</style>
