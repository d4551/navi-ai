<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <template #header-actions>
      <UnifiedButton
        variant="ghost"
        size="sm"
        leading-icon="mdi-pause"
        :disabled="isSubmitting"
        @click="togglePause"
      >
        {{ isPaused ? 'Resume' : 'Pause' }}
      </UnifiedButton>
      <UnifiedButton
        variant="danger"
        size="sm"
        leading-icon="mdi-stop"
        @click="confirmEndSession"
      >
        End Session
      </UnifiedButton>
      <CompactGamifyHUD />
    </template>

    <div class="unified-container">
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress progress--sm">
          <div
            class="progress-bar"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ progressPercentage }}% Complete</span>
      </div>

      <div class="session-layout">
        <div class="main-column">
          <!-- Current Question -->
          <UnifiedCard variant="primary" class="question-card">
            <div class="question-header">
              <div
                class="question-type"
                :class="`type-${currentQuestion?.type}`"
              >
                <i :class="getQuestionIcon(currentQuestion?.type)"></i>
                {{ getQuestionTypeLabel(currentQuestion?.type) }}
              </div>
              <div
                v-if="currentQuestion?.difficulty"
                class="question-difficulty"
              >
                <span class="difficulty-label">{{
                  currentQuestion.difficulty.toUpperCase()
                }}</span>
                <div class="difficulty-dots">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="difficulty-dot"
                    :class="{
                      active:
                        getDifficultyLevel(currentQuestion.difficulty) >= i,
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="question-content">
              <h2 class="question-text">{{ currentQuestion?.question }}</h2>

              <div
                v-if="currentQuestion?.followUps?.length"
                class="hints-toggle"
              >
                <label class="toggle-label">
                  <input v-model="showHints" type="checkbox" /> Show interviewer
                  hints
                </label>
              </div>

              <div
                v-if="showHints && currentQuestion?.followUps?.length"
                class="follow-ups"
              >
                <p class="follow-ups-label">Consider these follow-up points:</p>
                <ul class="follow-ups-list">
                  <li
                    v-for="followUp in currentQuestion.followUps"
                    :key="followUp"
                  >
                    {{ followUp }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Timer -->
            <div class="question-timer">
              <div class="timer-info">
                <span class="timer-label">Response Time:</span>
                <span class="timer-value" :class="getTimerClass()">
                  {{ formatTime(responseTime) }}
                </span>
              </div>
              <div class="progress progress--xs">
                <div
                  class="progress-bar"
                  :class="getTimerClass()"
                  :style="{ width: `${getTimerPercentage()}%` }"
                ></div>
              </div>
            </div>
          </UnifiedCard>

          <!-- Response Interface -->
          <div class="response-section">
            <!-- Voice Controls (if enabled) -->
            <UnifiedCard
              v-if="session?.enableVoiceMode"
              variant="glass"
              class="voice-controls"
            >
              <div class="voice-header">
                <h3>
                  <AppIcon name="mdi-microphone" />
                  Voice Response
                </h3>
                <span class="voice-status" :class="{ recording: isRecording }">
                  {{ isRecording ? 'Recording...' : 'Ready' }}
                </span>
              </div>

              <div class="voice-interface">
                <PushToTalkButton
                  :max-recording-time="180"
                  :show-transcript="false"
                  :show-response="false"
                  @transcript="onTranscript"
                  @recording-start="onRecordingStart"
                  @recording-stop="onRecordingStop"
                  @error="onRecordingError"
                />

                <div v-if="isRecording" class="recording-info">
                  <div class="recording-animation">
                    <div class="pulse"></div>
                  </div>
                  <p>Speak clearly and take your time</p>
                </div>
              </div>
            </UnifiedCard>

            <!-- Text Response -->
            <UnifiedCard
              variant="glass"
              class="text-response"
              :aria-busy="isSubmitting ? 'true' : 'false'"
            >
              <div class="response-header">
                <h3>
                  <AppIcon name="mdi-pencil" />
                  Your Response
                </h3>
                <div v-if="responseText.trim()" class="response-stats">
                  <span class="stat">{{ wordCount }} words</span>
                  <span class="stat">{{ estimatedTime }} min read</span>
                </div>
              </div>

              <textarea
                ref="responseTextarea"
                v-model="responseText"
                class="response-textarea"
                placeholder="Type your response here... (⌘/Ctrl+Enter to submit, F to focus)"
                aria-label="Your response"
                rows="10"
                :disabled="isSubmitting"
              ></textarea>

              <!-- Real-time feedback -->
              <div
                v-if="responseText.trim() && session?.enableRealTimeAnalysis"
                class="response-feedback"
              >
                <div class="feedback-item">
                  <AppIcon name="mdi-chart-bar" />
                  <span>Confidence: {{ getConfidenceLevel() }}</span>
                </div>
                <div class="feedback-item">
                  <AppIcon name="mdi-clock-fast" />
                  <span>Pace: {{ getResponsePace() }}</span>
                </div>
              </div>
            </UnifiedCard>
          </div>

          <!-- Action Buttons -->
          <div class="session-actions">
            <UnifiedButton
              variant="secondary"
              :disabled="isSubmitting"
              @click="skipQuestion"
            >
              Skip Question (S)
            </UnifiedButton>

            <UnifiedButton
              variant="primary"
              :disabled="!responseText.trim() || isSubmitting"
              :loading="isSubmitting"
              @click="submitResponse"
            >
              {{
                isSubmitting ? 'Analyzing...' : 'Submit Response (⌘/Ctrl+Enter)'
              }}
            </UnifiedButton>
          </div>

          <!-- AI Feedback (if available) -->
          <UnifiedCard
            v-if="currentFeedback && session?.enableRealTimeAnalysis"
            variant="success"
            class="feedback-card"
          >
            <div class="feedback-header">
              <h3>
                <AppIcon name="mdi-brain" />
                AI Feedback
              </h3>
              <div
                class="feedback-score"
                :class="getScoreClass(currentFeedback.score)"
              >
                {{ currentFeedback.score }}/100
              </div>
            </div>

            <div class="feedback-content">
              <p class="feedback-summary">{{ currentFeedback.feedback }}</p>

              <div class="feedback-details">
                <div
                  v-if="currentFeedback.strengths?.length"
                  class="feedback-section"
                >
                  <h4>
                    <AppIcon name="mdi-thumb-up" />
                    Strengths
                  </h4>
                  <ul>
                    <li
                      v-for="strength in currentFeedback.strengths"
                      :key="strength"
                    >
                      {{ strength }}
                    </li>
                  </ul>
                </div>

                <div
                  v-if="currentFeedback.improvements?.length"
                  class="feedback-section"
                >
                  <h4>
                    <AppIcon name="mdi-lightbulb-on" />
                    Improvements
                  </h4>
                  <ul>
                    <li
                      v-for="improvement in currentFeedback.improvements"
                      :key="improvement"
                    >
                      {{ improvement }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="feedback-actions">
              <UnifiedButton
                variant="ghost"
                size="sm"
                @click="currentFeedback = null"
              >
                <AppIcon name="mdi-close-circle-outline" />
                Dismiss
              </UnifiedButton>
            </div>
          </UnifiedCard>
        </div>

        <!-- Side Column: sticky session info and shortcuts -->
        <aside class="side-column" aria-label="Session information">
          <UnifiedCard
            variant="glass"
            class="side-card sticky glass p-4 gap-4 rounded-lg"
          >
            <div class="side-title">{{ sessionTitle }}</div>
            <div class="side-meta">
              <div class="meta-row">
                <AppIcon name="mdi-timer-outline" />
                <span>Elapsed: {{ formatTime(elapsedTime) }}</span>
              </div>
              <div class="meta-row">
                <AppIcon name="mdi-progress-clock" />
                <span
                  >Question {{ currentQuestionIndex + 1 }} /
                  {{ totalQuestions }}</span
                >
              </div>
              <div
                v-for="item in headerStats"
                :key="item.text"
                class="meta-row"
              >
                <AppIcon
                  :name="
                    item.icon?.startsWith('mdi-') ? item.icon : 'mdi-shape'
                  "
                />
                <span>{{ item.text }}</span>
              </div>
            </div>

            <div class="side-controls">
              <UnifiedButton
                variant="ghost"
                size="sm"
                leading-icon="mdi-pause"
                :disabled="isSubmitting"
                @click="togglePause"
              >
                {{ isPaused ? 'Resume (P)' : 'Pause (P)' }}
              </UnifiedButton>
              <UnifiedButton
                variant="danger"
                size="sm"
                leading-icon="mdi-stop"
                @click="confirmEndSession"
              >
                End Session
              </UnifiedButton>
            </div>

            <div class="shortcuts">
              <div class="shortcuts-title">Shortcuts</div>
              <ul>
                <li><kbd>F</kbd> Focus editor</li>
                <li><kbd>S</kbd> Skip question</li>
                <li><kbd>P</kbd> Pause/Resume</li>
                <li><kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd> Submit</li>
                <li><kbd>H</kbd> Toggle hints</li>
              </ul>
            </div>
          </UnifiedCard>
        </aside>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ModalBase
      v-model="showEndConfirmation"
      title="End Interview Session"
      size="sm"
    >
      <div class="modal-content">
        <p>
          Are you sure you want to end this interview session? Your progress
          will be saved.
        </p>
        <div class="modal-actions">
          <UnifiedButton
            variant="secondary"
            @click="showEndConfirmation = false"
          >
            Continue Session
          </UnifiedButton>
          <UnifiedButton variant="danger" @click="endSession">
            End Session
          </UnifiedButton>
        </div>
      </div>
    </ModalBase>

    <!-- Loading Overlay -->
    <LoadingModal v-model="isSubmitting" :message="loadingMessage" />
  </StandardPageLayout>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { useAppStore } from '@/stores/app'

// Components
import UnifiedCard from '@/components/UnifiedCard.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import PushToTalkButton from '@/components/PushToTalkButton.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import LoadingModal from '@/components/LoadingModal.vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import { usePageAssistantContext } from '@/composables/usePageAssistantContext'
import CompactGamifyHUD from '@/components/CompactGamifyHUD.vue'

// Services
import aiInterviewService from '@/services/AIInterviewService'

const route = useRoute()
const router = useRouter()
const { isDark: _isDark } = useUnifiedTheme()
const store = useAppStore()
const { setPageContext, clearPageContext } = usePageAssistantContext()

// Session state
const session = ref(null)
const currentQuestion = ref(null)
const currentQuestionIndex = ref(0)
const totalQuestions = ref(0)
const elapsedTime = ref(0)
const responseTime = ref(0)
const isPaused = ref(false)
const isSubmitting = ref(false)
const loadingMessage = ref('')

// Response state
const responseText = ref('')
const isRecording = ref(false)
const currentFeedback = ref(null)
const showHints = ref(false)
const responseTextarea = ref(null)

// Modals
const showEndConfirmation = ref(false)

// Timers
let elapsedTimer = null
let responseTimer = null

// Computed properties
const sessionTitle = computed(() => {
  if (session.value?.studioName) {
    return `${session.value.studioName} Interview`
  }
  return 'Interview Practice Session'
})

const headerStats = computed(() => {
  const stats = []
  const personaName =
    session.value?.persona?.name || session.value?.config?.persona?.name
  const studio = session.value?.studioName || session.value?.config?.studioName
  const role = session.value?.roleType || session.value?.config?.roleType
  if (personaName)
    stats.push({ text: `Persona: ${personaName}`, icon: 'mdi-account-tie' })
  if (studio) stats.push({ text: studio, icon: 'mdi-office-building' })
  if (role) stats.push({ text: role, icon: 'mdi-briefcase-outline' })
  return stats
})

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round(
    ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100
  )
})

const wordCount = computed(() => {
  return responseText.value
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
})

const estimatedTime = computed(() => {
  return Math.ceil(wordCount.value / 200) // Assuming 200 words per minute reading speed
})

// Methods
async function loadSession() {
  try {
    const sessionId = route.params.sessionId
    const sessionData = await aiInterviewService.getSession(sessionId)

    if (!sessionData) {
      router.push('/interview-prep')
      return
    }

    session.value = sessionData
    currentQuestion.value = sessionData.currentQuestion
    currentQuestionIndex.value = sessionData.currentQuestionIndex || 0
    totalQuestions.value = sessionData.questions?.length || 0
    elapsedTime.value = sessionData.elapsedTime || 0
    responseTime.value = 0

    // Restore draft for this question if saved
    restoreDraft()
    startTimers()
  } catch (error) {
    console.error('Failed to load session:', error)
    router.push('/interview-prep')
  }
}

function startTimers() {
  if (isPaused.value) return

  elapsedTimer = setInterval(() => {
    elapsedTime.value += 1
  }, 1000)

  responseTimer = setInterval(() => {
    responseTime.value += 1
  }, 1000)
}

// Assistant context wiring for live session
function pushAssistantContext() {
  setPageContext({
    page: 'interview-session',
    sessionId: session.value?.id || route.params.sessionId,
    paused: isPaused.value,
    currentQuestionIndex: currentQuestionIndex.value,
    totalQuestions: totalQuestions.value,
    elapsedTime: elapsedTime.value,
    currentQuestion: currentQuestion.value
      ? { id: currentQuestion.value.id, type: currentQuestion.value.type }
      : null,
    responseLength: (responseText?.value || '').length,
  })
}
onMounted(pushAssistantContext)
watch(
  [isPaused, currentQuestionIndex, totalQuestions, elapsedTime],
  pushAssistantContext
)
onUnmounted(() => {
  clearPageContext()
})

function stopTimers() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
    elapsedTimer = null
  }
  if (responseTimer) {
    clearInterval(responseTimer)
    responseTimer = null
  }
}

function togglePause() {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    stopTimers()
  } else {
    startTimers()
  }
}

function confirmEndSession() {
  showEndConfirmation.value = true
}

async function endSession() {
  try {
    await aiInterviewService.endSession(session.value.id)
    router.push('/interview-prep')
  } catch (error) {
    console.error('Failed to end session:', error)
  }
}

async function submitResponse() {
  if (!responseText.value.trim()) return

  isSubmitting.value = true
  loadingMessage.value = 'Analyzing your response...'

  try {
    const response = {
      questionId: currentQuestion.value.id,
      transcript: responseText.value.trim(),
      duration: responseTime.value,
      timestamp: Date.now(),
    }

    const result = await aiInterviewService.submitResponse(
      session.value.id,
      response
    )

    if (result.feedback && session.value.enableRealTimeAnalysis) {
      currentFeedback.value = result.feedback
    }

    // Move to next question after a delay
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  } catch (error) {
    console.error('Failed to submit response:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Draft autosave per session/question
function draftKey() {
  return `interview-draft-${session.value?.id || 'new'}-${currentQuestionIndex.value}`
}

function restoreDraft() {
  try {
    const saved = localStorage.getItem(draftKey())
    if (saved) responseText.value = saved
  } catch {}
}

let draftTimer = null
watch(responseText, val => {
  try {
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      localStorage.setItem(draftKey(), val || '')
    }, 250)
  } catch {}
})

watch(currentQuestionIndex, () => {
  responseTime.value = 0
  restoreDraft()
})

// Keyboard shortcuts
function onKeydown(e) {
  const tag =
    e.target && e.target.tagName ? String(e.target.tagName).toLowerCase() : ''
  const typing = tag === 'input' || tag === 'textarea'
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    if (responseText.value.trim() && !isSubmitting.value) submitResponse()
    return
  }
  if (typing) return
  const k = e.key?.toLowerCase()
  if (k === 'f') {
    e.preventDefault()
    focusEditor()
  } else if (k === 's') {
    e.preventDefault()
    if (!isSubmitting.value) skipQuestion()
  } else if (k === 'p') {
    e.preventDefault()
    togglePause()
  } else if (k === 'h') {
    e.preventDefault()
    showHints.value = !showHints.value
  }
}

function focusEditor() {
  try {
    responseTextarea.value?.focus?.()
  } catch {}
}

function _clearResponse() {
  responseText.value = ''
}

async function nextQuestion() {
  try {
    const nextQuestionData = await aiInterviewService.nextQuestion(
      session.value.id
    )

    if (nextQuestionData.completed) {
      // Interview completed
      try {
        const g = store._gamify?.()
        const count = (store.user?.interviewsCompleted || 0) + 1
        store.updateUser({ interviewsCompleted: count })
        g?.awardXP?.(60, 'interview_completed')
        g?.processAchievements?.()
        g?.updateStreak?.()
      } catch {}
      router.push(`/interview-results/${session.value.id}`)
      return
    }

    currentQuestion.value = nextQuestionData.question
    currentQuestionIndex.value = nextQuestionData.index
    responseText.value = ''
    responseTime.value = 0
    currentFeedback.value = null
  } catch (error) {
    console.error('Failed to get next question:', error)
  }
}

function skipQuestion() {
  if (confirm('Are you sure you want to skip this question?')) {
    nextQuestion()
  }
}

// Voice methods
function onTranscript(text) {
  responseText.value += (responseText.value ? ' ' : '') + text
}

function onRecordingStart() {
  isRecording.value = true
}

function onRecordingStop() {
  isRecording.value = false
}

function onRecordingError(error) {
  console.error('Recording error:', error)
  isRecording.value = false
}

// Utility methods
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getQuestionIcon(type) {
  const icons = {
    behavioral: 'mdi-account-group',
    technical: 'mdi-code-braces',
    'studio-specific': 'mdi-gamepad-variant',
    intro: 'mdi-hand-wave',
    closing: 'mdi-check-circle-outline',
  }
  return icons[type] || 'mdi-comment-question'
}

function getQuestionTypeLabel(type) {
  const labels = {
    behavioral: 'Behavioral',
    technical: 'Technical',
    'studio-specific': 'Studio Specific',
    intro: 'Introduction',
    closing: 'Closing',
  }
  return labels[type] || 'Question'
}

function getDifficultyLevel(difficulty) {
  const levels = { easy: 1, medium: 2, hard: 3 }
  return levels[difficulty] || 1
}

function getTimerClass() {
  const expectedDuration = currentQuestion.value?.expectedDuration || 120
  const ratio = responseTime.value / expectedDuration

  if (ratio < 0.5) return 'timer-good'
  if (ratio < 1.2) return 'timer-okay'
  return 'timer-warning'
}

function getTimerPercentage() {
  const expectedDuration = currentQuestion.value?.expectedDuration || 120
  return Math.min(100, (responseTime.value / expectedDuration) * 100)
}

function getConfidenceLevel() {
  if (wordCount.value > 50) return 'High'
  if (wordCount.value > 20) return 'Medium'
  return 'Low'
}

function getResponsePace() {
  const wpm = wordCount.value / Math.max(1, responseTime.value / 60)
  if (wpm > 150) return 'Fast'
  if (wpm > 100) return 'Good'
  return 'Slow'
}

function getScoreClass(score) {
  if (score >= 85) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 65) return 'score-average'
  return 'score-needs-work'
}

// Lifecycle
onMounted(() => {
  loadSession()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  stopTimers()
  window.removeEventListener('keydown', onKeydown)
})

// Watchers
watch(
  () => route.params.sessionId,
  () => {
    if (route.params.sessionId) {
      loadSession()
    }
  }
)
</script>

<style scoped>
.interview-session-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

/* Header handled by PageHeader */

.progress-container {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-success)
  );
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.session-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  align-items: start;
  max-width: var(--page-content-max-width);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.side-column {
  position: relative;
}

.sticky {
  position: sticky;
  top: var(--spacing-xl);
}

.side-card {
  padding: var(--spacing-lg);
}

.side-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: var(--spacing-md);
}

.side-meta {
  display: grid;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.side-controls {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.shortcuts {
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--spacing-md);
}

.shortcuts-title {
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.shortcuts ul {
  margin: 0;
  padding-left: var(--spacing-md);
  color: var(--text-secondary);
}

.shortcuts kbd {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-bottom-width: 2px;
  padding: 0 var(--spacing-1-5);
  border-radius: 6px;
  font-size: 0.85em;
}

/* Question Card */
.question-card {
  padding: var(--spacing-xl);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.question-type {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 600;
}

.type-behavioral {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.type-technical {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.type-studio-specific {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.question-difficulty {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.difficulty-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.difficulty-dots {
  display: flex;
  gap: var(--spacing-xs);
}

.difficulty-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-tertiary);
}

.difficulty-dot.active {
  background: var(--color-warning);
}

.question-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
}

.follow-ups {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.hints-toggle {
  margin-bottom: var(--spacing-sm);
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.follow-ups-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.follow-ups-list {
  list-style-type: disc;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
}

.follow-ups-list li {
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
}

.question-timer {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-subtle);
}

.timer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.timer-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.timer-value {
  font-size: 1rem;
  font-weight: 600;
}

.timer-value.timer-good {
  color: var(--color-success);
}

.timer-value.timer-okay {
  color: var(--color-warning);
}

.timer-value.timer-warning {
  color: var(--color-danger);
}

/* Timer color mapping for progress utility */
.progress .timer-good {
  background: var(--color-success);
}
.progress .timer-okay {
  background: var(--color-warning);
}
.progress .timer-warning {
  background: var(--color-danger);
}

/* Response Section */
.response-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Voice Controls */
.voice-controls {
  padding: var(--spacing-lg);
}

.voice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.voice-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.voice-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.voice-status.recording {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.voice-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.recording-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.recording-animation {
  position: relative;
  width: 60px;
  height: 60px;
}

.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid var(--color-danger);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* Text Response */
.text-response {
  padding: var(--spacing-lg);
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.response-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.response-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.response-textarea {
  width: 100%;
  min-height: 200px;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.response-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

.response-textarea::placeholder {
  color: var(--text-secondary);
}

.response-feedback {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-subtle);
}

.feedback-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Session Actions */
.session-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* Feedback Card */
.feedback-card {
  padding: var(--spacing-xl);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.feedback-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feedback-score {
  font-size: 1.25rem;
  font-weight: 700;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
}

.score-excellent {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.score-good {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.score-average {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.score-needs-work {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.feedback-summary {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.feedback-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.feedback-section h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.feedback-section ul {
  list-style-type: disc;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
}

.feedback-section li {
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
  line-height: 1.4;
}

.feedback-actions {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

/* Modal */
.modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .session-layout {
    grid-template-columns: 1fr;
    padding: var(--spacing-md);
  }
  .side-column {
    order: -1;
  }

  .question-card,
  .voice-controls,
  .text-response,
  .feedback-card {
    padding: var(--spacing-md);
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .response-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .response-stats {
    align-self: flex-end;
  }

  .session-actions {
    flex-direction: column;
  }

  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .feedback-details {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
