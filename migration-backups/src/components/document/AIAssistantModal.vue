<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="ai-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="d-flex align-items-center">
          <div class="ai-avatar">
            <AppIcon name="mdi-robot" />
          </div>
          <div class="ms-3">
            <h5 class="mb-0">AI Assistant</h5>
            <small class="text-muted">{{ assistantContext.title || 'AI-powered document enhancement' }}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon="mdi-close"
            @click="$emit('close')"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Context Display -->
        <div v-if="assistantContext.description" class="context-section">
          <div class="context-card">
            <h6 class="fw-semibold mb-2">
              <AppIcon :name="assistantContext.icon || 'mdi-lightbulb'" class="me-2" />
              {{ assistantContext.title }}
            </h6>
            <p class="text-muted mb-0">{{ assistantContext.description }}</p>
          </div>
        </div>

        <!-- AI Conversation -->
        <div class="conversation-section">
          <div class="messages-container">
            <!-- Welcome Message -->
            <div class="message ai-message">
              <div class="message-avatar">
                <AppIcon name="mdi-robot" />
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <p class="mb-0">{{ welcomeMessage }}</p>
                </div>
                <small class="text-muted">AI Assistant</small>
              </div>
            </div>

            <!-- Conversation Messages -->
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="{ 'user-message': message.type === 'user', 'ai-message': message.type === 'ai' }"
            >
              <div class="message-avatar">
                <AppIcon :name="message.type === 'user' ? 'mdi-account' : 'mdi-robot'" />
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div v-if="message.type === 'ai' && message.suggestions" class="suggestions-list">
                    <h6 class="fw-semibold mb-2">AI Suggestions:</h6>
                    <div
                      v-for="(suggestion, i) in message.suggestions"
                      :key="i"
                      class="suggestion-item"
                    >
                      <div class="suggestion-text">{{ suggestion.text }}</div>
                      <div class="suggestion-actions">
                        <UnifiedButton
                          variant="ghost"
                          size="xs"
                          @click="applySuggestion(suggestion)"
                        >
                          Apply
                        </UnifiedButton>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="message.type === 'ai' && message.analysis" class="analysis-result">
                    <h6 class="fw-semibold mb-2">Analysis Results:</h6>
                    <div class="analysis-score">
                      <div class="score-display">
                        <span class="score-value">{{ message.analysis.score }}/100</span>
                        <span class="score-label">Overall Score</span>
                      </div>
                    </div>
                    <div v-if="message.analysis.strengths" class="analysis-section">
                      <h6 class="text-success">Strengths:</h6>
                      <ul>
                        <li v-for="strength in message.analysis.strengths" :key="strength">
                          {{ strength }}
                        </li>
                      </ul>
                    </div>
                    <div v-if="message.analysis.improvements" class="analysis-section">
                      <h6 class="text-warning">Areas for Improvement:</h6>
                      <ul>
                        <li v-for="improvement in message.analysis.improvements" :key="improvement">
                          {{ improvement }}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p v-else class="mb-0">{{ message.text }}</p>
                </div>
                <small class="text-muted">{{ message.type === 'user' ? 'You' : 'AI Assistant' }}</small>
              </div>
            </div>

            <!-- Loading Message -->
            <div v-if="isProcessing" class="message ai-message">
              <div class="message-avatar">
                <AppIcon name="mdi-robot" />
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <small class="text-muted">AI is thinking...</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div v-if="quickActions.length > 0" class="quick-actions">
          <h6 class="fw-semibold mb-3">Quick Actions:</h6>
          <div class="actions-grid">
            <UnifiedButton
              v-for="action in quickActions"
              :key="action.key"
              :variant="action.variant || 'outline'"
              :size="action.size || 'sm'"
              :leading-icon="action.icon"
              :disabled="isProcessing"
              @click="handleQuickAction(action)"
            >
              {{ action.label }}
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="modal-footer">
        <div class="input-container">
          <textarea
            v-model="userInput"
            class="form-control"
            rows="3"
            placeholder="Ask the AI assistant anything about your document..."
            :disabled="isProcessing"
            @keydown.ctrl.enter="sendMessage"
          ></textarea>
          
          <div class="input-actions">
            <div class="input-hint">
              <small class="text-muted">Ctrl + Enter to send</small>
            </div>
            
            <div class="d-flex gap-2">
              <UnifiedButton
                variant="ghost"
                size="sm"
                :disabled="messages.length === 0"
                @click="clearConversation"
              >
                Clear
              </UnifiedButton>
              
              <UnifiedButton
                variant="primary"
                size="sm"
                leading-icon="mdi-send"
                :disabled="!userInput.trim() || isProcessing"
                :loading="isProcessing"
                @click="sendMessage"
              >
                Send
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { aiService } from '@/shared/services/AIService'

// Props
const _props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  context: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close', 'apply'])

// State
const userInput = ref('')
const messages = ref([])
const isProcessing = ref(false)
const toast = useToast()
const sessionId = `resume-ai-${Date.now()}`

// Computed
const assistantContext = computed(() => ({
  title: 'Document Enhancement',
  description: 'Get AI-powered suggestions to improve your resume or cover letter',
  icon: 'mdi-target',
  ...props.context
}))

const welcomeMessage = computed(() => {
  const contextMessages = {
    'resume-analysis': 'Hi! I\'m here to help analyze your resume and provide actionable feedback.',
    'cover-letter-review': 'Hello! I can help you review and improve your cover letter.',
    'job-tailoring': 'Hi there! I can help tailor your documents to match the job requirements.',
    'general': 'Hello! I\'m your AI assistant. How can I help you improve your documents today?'
  }
  
  return contextMessages[props.context.type] || contextMessages.general
})

const quickActions = computed(() => {
  const baseActions = [
    {
      key: 'analyze',
      label: 'Analyze Document',
      icon: 'mdi-brain',
      variant: 'primary',
      action: 'analyze'
    },
    {
      key: 'improve',
      label: 'Suggest Improvements',
      icon: 'mdi-star-outline',
      variant: 'outline',
      action: 'improve'
    },
    {
      key: 'tailor',
      label: 'Tailor to Job',
      icon: 'mdi-target',
      variant: 'outline',
      action: 'tailor'
    },
    {
      key: 'optimize',
      label: 'Optimize Keywords',
      icon: 'mdi-key-variant',
      variant: 'outline',
      action: 'optimize'
    }
  ]

  // Filter actions based on context
  if (props.context.type === 'resume-analysis') {
    return baseActions.filter(a => ['analyze', 'improve', 'optimize'].includes(a.action))
  } else if (props.context.type === 'cover-letter-review') {
    return baseActions.filter(a => ['analyze', 'improve', 'tailor'].includes(a.action))
  }

  return baseActions
})

// Methods
const handleOverlayClick = () => {
  emit('close')
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isProcessing.value) return

  const message = userInput.value.trim()
  userInput.value = ''

  // Add user message
  messages.value.push({
    type: 'user',
    text: message,
    timestamp: new Date()
  })

  // Process AI response
  await processAIResponse(message)
}

const processAIResponse = async (userMessage) => {
  isProcessing.value = true
  try {
    // Initialize AI service - now uses centralized API key resolver
    await aiService.initialize()
    const aiMsg = { type: 'ai', text: '', timestamp: new Date() }
    messages.value.push(aiMsg)
    const idx = messages.value.length - 1
    const sys = buildSystemContext()
    await aiService.chatStream({
      message: userMessage,
      context: sys,
      type: 'chat',
      sessionId,
      onChunk: async (chunk) => {
        messages.value[idx].text += chunk
        await nextTick(); scrollToBottom()
      },
      onComplete: async (full) => {
        messages.value[idx].text = full
        await nextTick(); scrollToBottom()
      },
      onError: (err) => {
        toast.error('AI error: ' + (err?.message || err))
      }
    })
  } catch (error) {
    toast.error('Failed to process AI request: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

function buildSystemContext() {
  const ctx = assistantContext.value
  return [
    ctx?.title ? `Context: ${ctx.title}` : '',
    ctx?.description ? `Description: ${ctx.description}` : '',
    'You are an expert resume/cover letter assistant. Provide concise, ATS-friendly suggestions with strong action verbs and measurable outcomes where possible.'
  ].filter(Boolean).join('\n')
}

const handleQuickAction = async (action) => {
  const actionMessages = {
    analyze: 'Please analyze my document and provide detailed feedback',
    improve: 'What are the main areas I should improve in my document?',
    tailor: 'How can I tailor this document for a specific job?',
    optimize: 'Help me optimize keywords for ATS systems'
  }

  const message = actionMessages[action.action] || action.label
  
  // Add user message
  messages.value.push({
    type: 'user',
    text: message,
    timestamp: new Date()
  })

  // Process AI response
  await processAIResponse(message)
}

const applySuggestion = (suggestion) => {
  emit('apply', suggestion)
  toast.success('Suggestion applied successfully')
}

const clearConversation = () => {
  messages.value = []
  toast.info('Conversation cleared')
}

const scrollToBottom = () => {
  const container = document.querySelector('.messages-container')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Focus on input when modal opens
    nextTick(() => {
      const input = document.querySelector('.modal-footer textarea')
      if (input) input.focus()
    })
  }
})

onMounted(async () => {
  try { 
    // Pre-initialize AI service to check configuration
    await aiService.initialize()
  } catch (error) {
    console.warn('AI service initialization failed on mount:', error.message)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 2rem;
}

.ai-modal {
  background: var(--surface-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.ai-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
  border: 2px solid var(--color-primary-300);
  border-radius: 50%;
  font-size: 1.75rem;
  box-shadow: var(--shadow-md);
}

.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.context-section {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg-light);
}

.context-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.conversation-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  gap: 1rem;
  animation: messageSlideIn 0.3s ease-out;
  margin-bottom: 0.5rem;
}

.message.user-message {
  flex-direction: row-reverse;
}

.message.user-message .message-content {
  align-items: flex-end;
}

.message.user-message .message-bubble {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
}

.message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 1rem;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 80%;
}

.message-bubble {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  line-height: 1.6;
  box-shadow: var(--shadow-xs);
  transition: all var(--duration-fast);
}

.message-bubble:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.suggestions-list,
.analysis-result {
  max-width: none;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  margin-bottom: 0.75rem;
  gap: 1.25rem;
  transition: all var(--duration-fast);
}

.suggestion-item:hover {
  background: var(--glass-surface);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.suggestion-text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.analysis-score {
  text-align: center;
  margin: 1rem 0;
}

.score-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--glass-bg-light);
  border-radius: var(--radius-md);
}

.score-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary-500);
}

.score-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.analysis-section {
  margin-top: 1rem;
}

.analysis-section h6 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.analysis-section ul {
  margin: 0;
  padding-left: 1.5rem;
  font-size: 0.9rem;
}

.analysis-section li {
  margin-bottom: 0.25rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--color-primary-500);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.quick-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg-light);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.modal-footer {
  border-top: 1px solid var(--glass-border);
  padding: 1.5rem 2rem 2rem;
  background: var(--surface-background);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-control {
  background: var(--glass-surface);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  resize: none;
  transition: all var(--duration-fast);
  font-size: 0.95rem;
  line-height: 1.5;
  min-height: 100px;
}

.form-control:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-500-rgb), 0.15);
  outline: none;
  transform: translateY(-1px);
}

/* Animations */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* Scrollbar Styling */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--glass-bg-light);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-300);
}

/* Enhanced Visual Effects */
.ai-modal {
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-primary-300), transparent);
}

/* Improved Animation Timing */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.75rem;
  }
  
  .ai-modal {
    max-height: 97vh;
    border-radius: var(--radius-md);
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem 1rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem 1.25rem;
  }
  
  .messages-container {
    padding: 1rem 1.5rem 1.5rem;
    gap: 1.25rem;
  }
  
  .message-content {
    max-width: 88%;
  }
  
  .message-bubble {
    padding: 1rem 1.25rem;
  }
  
  .suggestion-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .input-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .context-section,
  .quick-actions {
    padding: 1rem 1.5rem;
  }
  
  .ai-avatar {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .message {
    gap: 0.75rem;
  }
  
  .message-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }
  
  .form-control {
    min-height: 80px;
    padding: 0.875rem 1rem;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .message-bubble {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .context-card {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .form-control {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
  color: var(--text-primary);
}
</style>
