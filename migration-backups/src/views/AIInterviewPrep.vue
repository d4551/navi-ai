<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
    title="AI Interview Preparation"
    subtitle="Master gaming industry interviews with AI-powered preparation and real-time feedback"
  >
    <template #header-actions>
      <div class="header-actions d-flex align-center ga-2">
        <AIButton
          action="prepare_interview"
          variant="primary"
          text="AI Interview Coach"
          icon="mdi-robot-happy"
          :context="{ targetRole: selectedRole, experience: userProfile }"
          @success="handleInterviewPreparationComplete"
        />
        <UnifiedButton
          variant="gaming"
          leading-icon="mdi-play-circle"
          @click="startQuickInterview"
        >
          Start Practice
        </UnifiedButton>
      </div>
    </template>

    <div class="interview-prep-container">
      <!-- Preparation Tabs -->
      <v-tabs
        v-model="activeTab"
        class="prep-tabs mb-6"
        centered
        color="primary"
      >
        <v-tab value="setup">
          <AppIcon name="mdi-cog" class="mr-2" />
          Setup
        </v-tab>
        <v-tab value="questions">
          <AppIcon name="mdi-help-circle" class="mr-2" />
          Practice Questions
        </v-tab>
        <v-tab value="mock">
          <AppIcon name="mdi-microphone" class="mr-2" />
          Mock Interview
        </v-tab>
        <v-tab value="feedback">
          <AppIcon name="mdi-chart-line" class="mr-2" />
          Performance
        </v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-window v-model="activeTab" class="prep-content">
        <!-- Setup Tab -->
        <v-window-item value="setup">
          <div class="setup-section">
            <v-row>
              <v-col cols="12" md="6">
                <UnifiedCard variant="glass" class="setup-card">
                  <div class="card-header mb-4">
                    <AppIcon
                      name="mdi-briefcase"
                      color="primary"
                      class="mr-2"
                    />
                    <h3 class="text-h6">Interview Configuration</h3>
                  </div>

                  <v-form @submit.prevent="generateInterviewPlan">
                    <v-select
                      v-model="selectedRole"
                      :items="gameRoles"
                      label="Target Role"
                      variant="outlined"
                      class="mb-4"
                      :rules="[v => !!v || 'Please select a role']"
                    />

                    <v-select
                      v-model="selectedStudio"
                      :items="studioOptions"
                      label="Company Type"
                      variant="outlined"
                      class="mb-4"
                    />

                    <v-select
                      v-model="experienceLevel"
                      :items="experienceLevels"
                      label="Experience Level"
                      variant="outlined"
                      class="mb-4"
                    />

                    <v-select
                      v-model="interviewType"
                      :items="interviewTypes"
                      label="Interview Type"
                      variant="outlined"
                      class="mb-4"
                    />

                    <v-slider
                      v-model="interviewDuration"
                      :min="10"
                      :max="60"
                      step="5"
                      label="Duration (minutes)"
                      show-ticks
                      tick-size="2"
                      class="mb-4"
                    />

                    <div class="d-flex justify-end">
                      <AIButton
                        action="generate_interview_plan"
                        variant="primary"
                        text="Generate AI Interview Plan"
                        :context="getInterviewContext()"
                        @success="handlePlanGenerated"
                      />
                    </div>
                  </v-form>
                </UnifiedCard>
              </v-col>

              <v-col cols="12" md="6">
                <UnifiedCard variant="glass" class="profile-card">
                  <div class="card-header mb-4">
                    <AppIcon name="mdi-account" color="success" class="mr-2" />
                    <h3 class="text-h6">Your Profile Summary</h3>
                  </div>

                  <div class="profile-stats">
                    <div class="stat-item">
                      <span class="stat-label">Interviews Completed:</span>
                      <span class="stat-value">{{
                        userStats.completedInterviews
                      }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Average Score:</span>
                      <span class="stat-value"
                        >{{ userStats.averageScore }}%</span
                      >
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Strong Areas:</span>
                      <div class="skill-chips">
                        <UiChip
                          v-for="skill in userStats.strongSkills"
                          :key="skill"
                          :label="skill"
                          variant="success"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Improvement Areas:</span>
                      <div class="skill-chips">
                        <UiChip
                          v-for="skill in userStats.improvementAreas"
                          :key="skill"
                          :label="skill"
                          variant="warning"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </UnifiedCard>

                <!-- AI Recommendations -->
                <UnifiedCard
                  v-if="aiRecommendations.length > 0"
                  variant="glass"
                  class="recommendations-card mt-4"
                >
                  <div class="card-header mb-4">
                    <AppIcon
                      name="mdi-lightbulb"
                      color="warning"
                      class="mr-2"
                    />
                    <h3 class="text-h6">AI Recommendations</h3>
                  </div>

                  <div class="recommendations-list">
                    <div
                      v-for="recommendation in aiRecommendations"
                      :key="recommendation.id"
                      class="recommendation-item"
                    >
                      <div class="recommendation-header">
                        <AppIcon :name="recommendation.icon" size="small" />
                        <span class="recommendation-title">{{
                          recommendation.title
                        }}</span>
                        <UiChip
                          :label="recommendation.priority"
                          :variant="getPriorityVariant(recommendation.priority)"
                          size="xs"
                        />
                      </div>
                      <p class="recommendation-description">
                        {{ recommendation.description }}
                      </p>
                    </div>
                  </div>
                </UnifiedCard>
              </v-col>
            </v-row>
          </div>
        </v-window-item>

        <!-- Practice Questions Tab -->
        <v-window-item value="questions">
          <div class="questions-section">
            <div
              class="questions-header mb-4 d-flex align-center justify-space-between"
            >
              <div>
                <h3 class="text-h5 mb-2">Practice Questions</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Practice with AI-generated questions tailored to your target
                  role
                </p>
              </div>

              <div class="question-actions d-flex ga-2">
                <AIButton
                  action="generate_questions"
                  variant="outline"
                  text="Generate New Questions"
                  icon="mdi-refresh"
                  :context="getInterviewContext()"
                  @success="handleQuestionsGenerated"
                />
                <v-select
                  v-model="questionFilter"
                  :items="questionCategories"
                  label="Filter by Category"
                  variant="outlined"
                  density="compact"
                  class="filter-select"
                  style="min-width: 200px"
                />
              </div>
            </div>

            <div
              v-if="filteredQuestions.length === 0"
              class="empty-state text-center pa-8"
            >
              <AppIcon name="mdi-help-circle-outline" size="xl" color="muted" />
              <h3 class="text-h6 mt-4 mb-2">No Questions Available</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Generate personalized interview questions based on your target
                role and experience.
              </p>
              <AIButton
                action="generate_questions"
                variant="primary"
                text="Generate Questions"
                :context="getInterviewContext()"
                @success="handleQuestionsGenerated"
              />
            </div>

            <div v-else class="questions-grid">
              <UnifiedCard
                v-for="(question, index) in filteredQuestions"
                :key="question.id"
                variant="glass"
                class="question-card"
              >
                <div
                  class="question-header d-flex align-center justify-space-between mb-3"
                >
                  <div class="d-flex align-center ga-2">
                    <UiChip
                      :label="question.category"
                      variant="primary"
                      size="sm"
                    />
                    <UiChip
                      :label="question.difficulty"
                      :variant="getDifficultyVariant(question.difficulty)"
                      size="sm"
                    />
                    <span class="question-number text-caption"
                      >#{{ index + 1 }}</span
                    >
                  </div>

                  <div class="question-actions">
                    <UnifiedButton
                      variant="ghost"
                      icon-only
                      icon="mdi-play"
                      tooltip="Practice this question"
                      @click="practiceQuestion(question)"
                    />
                    <UnifiedButton
                      variant="ghost"
                      icon-only
                      icon="mdi-bookmark-outline"
                      tooltip="Save for later"
                      @click="bookmarkQuestion(question)"
                    />
                  </div>
                </div>

                <div class="question-content">
                  <h4 class="question-text mb-3">{{ question.question }}</h4>

                  <v-expand-transition>
                    <div
                      v-if="expandedQuestions.includes(question.id)"
                      class="question-details"
                    >
                      <div
                        v-if="question.context"
                        class="question-context mb-3 pa-3 rounded bg-surface-variant"
                      >
                        <strong>Context:</strong> {{ question.context }}
                      </div>

                      <div
                        v-if="question.keyPoints?.length"
                        class="key-points mb-3"
                      >
                        <strong class="d-block mb-2"
                          >Key Points to Address:</strong
                        >
                        <ul class="key-points-list">
                          <li v-for="point in question.keyPoints" :key="point">
                            {{ point }}
                          </li>
                        </ul>
                      </div>

                      <div
                        v-if="question.followUpQuestions?.length"
                        class="follow-ups"
                      >
                        <strong class="d-block mb-2"
                          >Potential Follow-ups:</strong
                        >
                        <ul class="follow-up-list">
                          <li
                            v-for="followUp in question.followUpQuestions"
                            :key="followUp"
                          >
                            {{ followUp }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </v-expand-transition>

                  <div
                    class="question-footer d-flex align-center justify-space-between mt-3"
                  >
                    <UnifiedButton
                      variant="text"
                      :text="
                        expandedQuestions.includes(question.id)
                          ? 'Show Less'
                          : 'Show More'
                      "
                      @click="toggleQuestionExpansion(question.id)"
                    />

                    <div
                      class="question-meta text-caption text-medium-emphasis"
                    >
                      Est. {{ question.estimatedTime || '2-3' }} minutes
                    </div>
                  </div>
                </div>
              </UnifiedCard>
            </div>
          </div>
        </v-window-item>

        <!-- Mock Interview Tab -->
        <v-window-item value="mock">
          <div class="mock-interview-section">
            <div v-if="!activeMockInterview" class="interview-start">
              <div class="text-center mb-6">
                <AppIcon
                  name="mdi-microphone-variant"
                  size="xl"
                  color="primary"
                  class="mb-4"
                />
                <h3 class="text-h4 mb-2">Ready for Your Mock Interview?</h3>
                <p class="text-body-1 text-medium-emphasis">
                  Experience a realistic interview simulation with AI-powered
                  feedback
                </p>
              </div>

              <UnifiedCard
                variant="glass"
                class="interview-setup-card mx-auto"
                style="max-width: 600px"
              >
                <div class="setup-summary mb-4">
                  <h4 class="text-h6 mb-3">Interview Configuration</h4>
                  <div class="config-item">
                    <strong>Role:</strong> {{ selectedRole }}
                  </div>
                  <div class="config-item">
                    <strong>Company:</strong> {{ selectedStudio }}
                  </div>
                  <div class="config-item">
                    <strong>Duration:</strong> {{ interviewDuration }} minutes
                  </div>
                  <div class="config-item">
                    <strong>Questions:</strong>
                    {{ mockInterviewQuestions.length }} generated
                  </div>
                </div>

                <div class="pre-interview-checklist mb-4">
                  <h5 class="text-subtitle-1 mb-3">Pre-Interview Checklist</h5>
                  <div class="checklist-items">
                    <div class="checklist-item d-flex align-center">
                      <v-checkbox
                        v-model="checklist.quietSpace"
                        density="compact"
                      />
                      <span>Quiet, distraction-free space</span>
                    </div>
                    <div class="checklist-item d-flex align-center">
                      <v-checkbox
                        v-model="checklist.goodLighting"
                        density="compact"
                      />
                      <span>Good lighting and camera setup</span>
                    </div>
                    <div class="checklist-item d-flex align-center">
                      <v-checkbox
                        v-model="checklist.notesReady"
                        density="compact"
                      />
                      <span>Notes and resume handy</span>
                    </div>
                    <div class="checklist-item d-flex align-center">
                      <v-checkbox
                        v-model="checklist.mindsetReady"
                        density="compact"
                      />
                      <span>Positive mindset and ready to practice</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-center">
                  <UnifiedButton
                    variant="gaming"
                    size="lg"
                    leading-icon="mdi-play-circle"
                    :disabled="!isReadyToStart"
                    @click="startMockInterview"
                  >
                    Start Mock Interview
                  </UnifiedButton>
                </div>
              </UnifiedCard>
            </div>

            <!-- Active Interview UI -->
            <div v-else class="active-interview">
              <div class="interview-header mb-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="interview-progress">
                    <h4 class="text-h6">
                      Question {{ currentQuestionIndex + 1 }} of
                      {{ mockInterviewQuestions.length }}
                    </h4>
                    <v-progress-linear
                      :model-value="interviewProgress"
                      color="primary"
                      height="6"
                      rounded
                      class="mt-2"
                    />
                  </div>

                  <div class="interview-controls d-flex ga-2">
                    <div class="timer-display">
                      <AppIcon name="mdi-timer" class="mr-1" />
                      {{ formatTime(interviewTimer) }}
                    </div>
                    <UnifiedButton
                      variant="outline"
                      icon="mdi-pause"
                      @click="pauseInterview"
                    />
                    <UnifiedButton
                      variant="error"
                      icon="mdi-stop"
                      @click="endInterview"
                    />
                  </div>
                </div>
              </div>

              <div class="interview-content">
                <UnifiedCard variant="glass" class="current-question-card mb-4">
                  <div class="question-display">
                    <div class="interviewer-info mb-3 d-flex align-center ga-2">
                      <div class="interviewer-avatar">
                        <AppIcon name="mdi-account-tie" />
                      </div>
                      <div>
                        <div class="interviewer-name">
                          {{ currentPersona.name }}
                        </div>
                        <div class="interviewer-role text-caption">
                          {{ currentPersona.role }} at {{ selectedStudio }}
                        </div>
                      </div>
                    </div>

                    <div class="question-text text-h6 mb-4">
                      {{ currentQuestion?.question }}
                    </div>

                    <div
                      v-if="currentQuestion?.context"
                      class="question-context pa-3 rounded bg-surface-variant mb-4"
                    >
                      {{ currentQuestion.context }}
                    </div>
                  </div>
                </UnifiedCard>

                <!-- Response Recording -->
                <UnifiedCard variant="glass" class="response-recording-card">
                  <div class="recording-header mb-3">
                    <h5 class="text-subtitle-1">Your Response</h5>
                    <div
                      class="recording-status"
                      :class="{ recording: isRecording }"
                    >
                      <AppIcon
                        :name="
                          isRecording ? 'mdi-record-circle' : 'mdi-microphone'
                        "
                      />
                      <span>{{
                        isRecording ? 'Recording...' : 'Ready to record'
                      }}</span>
                    </div>
                  </div>

                  <div
                    class="recording-controls d-flex align-center justify-center ga-4 mb-4"
                  >
                    <UnifiedButton
                      v-if="!isRecording"
                      variant="primary"
                      size="lg"
                      leading-icon="mdi-record"
                      @click="startRecording"
                    >
                      Start Recording
                    </UnifiedButton>

                    <UnifiedButton
                      v-else
                      variant="error"
                      size="lg"
                      leading-icon="mdi-stop"
                      @click="stopRecording"
                    >
                      Stop Recording
                    </UnifiedButton>

                    <UnifiedButton
                      variant="outline"
                      leading-icon="mdi-skip-next"
                      @click="skipQuestion"
                    >
                      Skip Question
                    </UnifiedButton>
                  </div>

                  <div v-if="currentResponse" class="current-response">
                    <h6 class="text-subtitle-2 mb-2">Your Response:</h6>
                    <div class="response-text pa-3 rounded bg-surface-variant">
                      {{ currentResponse }}
                    </div>

                    <div class="response-actions mt-3 d-flex justify-end ga-2">
                      <UnifiedButton
                        variant="outline"
                        @click="reRecordResponse"
                      >
                        Re-record
                      </UnifiedButton>
                      <AIButton
                        action="analyze_response"
                        variant="ghost"
                        text="Get AI Feedback"
                        icon="mdi-brain"
                        :context="{
                          question: currentQuestion,
                          response: currentResponse,
                          role: selectedRole,
                        }"
                        @success="handleResponseFeedback"
                      />
                      <UnifiedButton variant="primary" @click="nextQuestion">
                        Next Question
                      </UnifiedButton>
                    </div>
                  </div>
                </UnifiedCard>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- Performance & Feedback Tab -->
        <v-window-item value="feedback">
          <div class="feedback-section">
            <div
              v-if="interviewHistory.length === 0"
              class="empty-feedback text-center pa-8"
            >
              <AppIcon name="mdi-chart-line-variant" size="xl" color="muted" />
              <h3 class="text-h6 mt-4 mb-2">No Interview Data</h3>
              <p class="text-body-2 text-medium-emphasis">
                Complete some practice interviews to see your performance
                analytics and improvement suggestions.
              </p>
            </div>

            <div v-else class="feedback-content">
              <!-- Performance Overview -->
              <UnifiedCard variant="glass" class="performance-overview mb-4">
                <div class="card-header mb-4">
                  <h3 class="text-h6">Performance Overview</h3>
                </div>

                <v-row>
                  <v-col cols="12" md="3">
                    <div class="performance-stat text-center">
                      <div class="stat-value text-h3 text-primary">
                        {{ userStats.averageScore }}
                      </div>
                      <div class="stat-label text-body-2">Average Score</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="3">
                    <div class="performance-stat text-center">
                      <div class="stat-value text-h3 text-success">
                        {{ userStats.completedInterviews }}
                      </div>
                      <div class="stat-label text-body-2">Completed</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="3">
                    <div class="performance-stat text-center">
                      <div class="stat-value text-h3 text-warning">
                        {{ userStats.improvementTrend }}
                      </div>
                      <div class="stat-label text-body-2">Improvement</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="3">
                    <div class="performance-stat text-center">
                      <div class="stat-value text-h3 text-info">
                        {{ userStats.practiceHours }}
                      </div>
                      <div class="stat-label text-body-2">Hours Practiced</div>
                    </div>
                  </v-col>
                </v-row>
              </UnifiedCard>

              <!-- Recent Interviews -->
              <UnifiedCard variant="glass" class="recent-interviews">
                <div
                  class="card-header mb-4 d-flex align-center justify-space-between"
                >
                  <h3 class="text-h6">Recent Interviews</h3>
                  <AIButton
                    action="analyze_performance_trends"
                    variant="outline"
                    text="AI Analysis"
                    :context="{
                      history: interviewHistory,
                      profile: userProfile,
                    }"
                    @success="handlePerformanceAnalysis"
                  />
                </div>

                <div class="interviews-list">
                  <div
                    v-for="interview in interviewHistory.slice(0, 5)"
                    :key="interview.id"
                    class="interview-item d-flex align-center justify-space-between pa-3 mb-2 rounded border"
                  >
                    <div class="interview-info">
                      <div class="interview-title font-weight-medium">
                        {{ interview.role }} - {{ interview.company }}
                      </div>
                      <div
                        class="interview-meta text-caption text-medium-emphasis"
                      >
                        {{ formatDate(interview.date) }} •
                        {{ interview.duration }} minutes •
                        {{ interview.questionsAnswered }} questions
                      </div>
                    </div>

                    <div class="interview-score d-flex align-center ga-2">
                      <div
                        class="score-circle"
                        :class="getScoreClass(interview.score)"
                      >
                        {{ interview.score }}%
                      </div>
                      <UnifiedButton
                        variant="ghost"
                        icon="mdi-eye"
                        @click="viewInterviewDetails(interview)"
                      />
                    </div>
                  </div>
                </div>
              </UnifiedCard>
            </div>
          </div>
        </v-window-item>
      </v-window>
    </div>

    <!-- AI Modal Integration -->
    <AIModalSystem
      context-type="interview"
      context-id="interview-prep"
      :target-job="{ title: selectedRole, company: selectedStudio }"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UnifiedCard from '@/components/ui/StandardCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UiChip from '@/components/ui/UiChip.vue'
import AIButton from '@/components/ai/AIButton.vue'
import AIModalSystem from '@/components/ai/AIModalSystem.vue'
import { MockInterviewService } from '@/utils/mockInterview'
import { logger } from '@/shared/utils/logger'

// Router
const router = useRouter()

// State
const activeTab = ref('setup')
const selectedRole = ref('Game Developer')
const selectedStudio = ref('AAA Studio')
const experienceLevel = ref('Mid-level')
const interviewType = ref('Technical + Behavioral')
const interviewDuration = ref(30)

// Mock interview state
const activeMockInterview = ref(false)
const currentQuestionIndex = ref(0)
const interviewTimer = ref(0)
const isRecording = ref(false)
const currentResponse = ref('')
const mockInterviewQuestions = ref([])
const interviewHistory = ref([])
const currentPersona = ref({})

// Questions state
const questionFilter = ref('All Categories')
const expandedQuestions = ref([])
const generatedQuestions = ref([])

// Checklist state
const checklist = ref({
  quietSpace: false,
  goodLighting: false,
  notesReady: false,
  mindsetReady: false,
})

// AI recommendations
const aiRecommendations = ref([
  {
    id: 'practice_behavioral',
    icon: 'mdi-account-group',
    title: 'Practice Behavioral Questions',
    description: 'Focus on STAR method responses for behavioral scenarios',
    priority: 'high',
  },
  {
    id: 'technical_prep',
    icon: 'mdi-code-tags',
    title: 'Technical Skill Assessment',
    description: 'Review core programming concepts and gaming industry tools',
    priority: 'medium',
  },
])

// User stats (mock data)
const userStats = ref({
  completedInterviews: 5,
  averageScore: 78,
  practiceHours: 12,
  strongSkills: ['Technical Skills', 'Problem Solving'],
  improvementAreas: ['Communication', 'Leadership Questions'],
  improvementTrend: '+15%',
})

// Configuration options
const gameRoles = [
  'Game Developer',
  'Game Designer',
  'QA Engineer',
  'Technical Artist',
  'Producer',
  'UI/UX Designer',
  'Audio Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Community Manager',
]

const studioOptions = [
  'AAA Studio',
  'Indie Studio',
  'Mobile Games Company',
  'Publishing House',
  'Tech Company (Gaming Division)',
]

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid-level (3-5 years)',
  'Senior (6-10 years)',
  'Lead/Principal (10+ years)',
]

const interviewTypes = [
  'Technical Only',
  'Behavioral Only',
  'Technical + Behavioral',
  'Portfolio Review',
  'System Design',
  'Cultural Fit',
]

const questionCategories = [
  'All Categories',
  'Technical',
  'Behavioral',
  'Gaming Industry',
  'Problem Solving',
  'Leadership',
  'Communication',
]

// Computed properties
const isReadyToStart = computed(() => {
  return Object.values(checklist.value).every(checked => checked)
})

const interviewProgress = computed(() => {
  if (mockInterviewQuestions.value.length === 0) return 0
  return (
    (currentQuestionIndex.value / mockInterviewQuestions.value.length) * 100
  )
})

const currentQuestion = computed(() => {
  return mockInterviewQuestions.value[currentQuestionIndex.value] || null
})

const filteredQuestions = computed(() => {
  if (questionFilter.value === 'All Categories') {
    return generatedQuestions.value
  }
  return generatedQuestions.value.filter(
    q => q.category === questionFilter.value
  )
})

const userProfile = computed(() => ({
  role: selectedRole.value,
  experience: experienceLevel.value,
  completedInterviews: userStats.value.completedInterviews,
  strengths: userStats.value.strongSkills,
  improvements: userStats.value.improvementAreas,
}))

// Methods
const getInterviewContext = () => ({
  role: selectedRole.value,
  studio: selectedStudio.value,
  experience: experienceLevel.value,
  type: interviewType.value,
  duration: interviewDuration.value,
  userProfile: userProfile.value,
})

const handleInterviewPreparationComplete = result => {
  logger.info('Interview preparation completed:', result)
  // Update UI with preparation results
}

const handlePlanGenerated = plan => {
  logger.info('AI interview plan generated:', plan)
  if (plan.questions) {
    mockInterviewQuestions.value = plan.questions
  }
}

const handleQuestionsGenerated = _result => {
  if (result.questions) {
    generatedQuestions.value = result.questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question || q,
      category: q.category || 'General',
      difficulty: q.difficulty || 'medium',
      keyPoints: q.keyPoints || [],
      followUpQuestions: q.followUpQuestions || [],
      context: q.context || '',
      estimatedTime: q.estimatedTime || '2-3',
    }))
  }
}

const startQuickInterview = () => {
  activeTab.value = 'mock'
  generateMockInterview()
}

const generateMockInterview = async () => {
  // Generate interview questions if not already done
  if (mockInterviewQuestions.value.length === 0) {
    const mockService = new MockInterviewService()
    const questions = await mockService.generateQuestions(
      selectedRole.value,
      selectedStudio.value
    )
    mockInterviewQuestions.value = questions
  }

  // Set up interview persona
  currentPersona.value = {
    name: 'Alex Chen',
    role: 'Senior Technical Lead',
    company: selectedStudio.value,
  }
}

const startMockInterview = () => {
  activeMockInterview.value = true
  currentQuestionIndex.value = 0
  startInterviewTimer()
}

const startInterviewTimer = () => {
  const interval = setInterval(() => {
    if (activeMockInterview.value) {
      interviewTimer.value++
    } else {
      clearInterval(interval)
    }
  }, 1000)
}

const startRecording = () => {
  isRecording.value = true
  // Implement speech recognition here
  setTimeout(() => {
    // Mock recording completion
    stopRecording()
  }, 5000)
}

const stopRecording = () => {
  isRecording.value = false
  // Mock transcribed response
  currentResponse.value =
    'This is a mock response to the interview question. In a real implementation, this would be the transcribed speech from the user.'
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < mockInterviewQuestions.value.length - 1) {
    currentQuestionIndex.value++
    currentResponse.value = ''
  } else {
    endInterview()
  }
}

const endInterview = () => {
  activeMockInterview.value = false
  // Save interview to history
  const interviewRecord = {
    id: Date.now().toString(),
    role: selectedRole.value,
    company: selectedStudio.value,
    date: new Date(),
    duration: Math.floor(interviewTimer.value / 60),
    questionsAnswered: currentQuestionIndex.value + 1,
    score: Math.floor(Math.random() * 30) + 70, // Mock score
  }

  interviewHistory.value.unshift(interviewRecord)
  interviewTimer.value = 0
  currentQuestionIndex.value = 0
  activeTab.value = 'feedback'
}

const toggleQuestionExpansion = questionId => {
  const index = expandedQuestions.value.indexOf(questionId)
  if (index > -1) {
    expandedQuestions.value.splice(index, 1)
  } else {
    expandedQuestions.value.push(questionId)
  }
}

const getPriorityVariant = priority => {
  const variants = {
    urgent: 'error',
    high: 'warning',
    medium: 'primary',
    low: 'secondary',
  }
  return variants[priority] || 'secondary'
}

const getDifficultyVariant = difficulty => {
  const variants = {
    easy: 'success',
    medium: 'warning',
    hard: 'error',
  }
  return variants[difficulty] || 'primary'
}

const getScoreClass = score => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  return 'score-needs-improvement'
}

const formatTime = seconds => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = date => {
  return new Date(date).toLocaleDateString()
}

// Initialize with some sample questions
onMounted(() => {
  generatedQuestions.value = [
    {
      id: 'q1',
      question:
        'Tell me about a challenging technical problem you solved in a game development project.',
      category: 'Technical',
      difficulty: 'medium',
      keyPoints: [
        'Problem identification',
        'Solution approach',
        'Technical implementation',
        'Results achieved',
      ],
      followUpQuestions: [
        'How did you test your solution?',
        'What would you do differently?',
      ],
      context:
        'This question assesses problem-solving skills and technical depth.',
      estimatedTime: '3-4',
    },
    {
      id: 'q2',
      question:
        'Describe a time when you had to work with a difficult team member.',
      category: 'Behavioral',
      difficulty: 'medium',
      keyPoints: [
        'Situation description',
        'Actions taken',
        'Communication approach',
        'Outcome',
      ],
      followUpQuestions: [
        'What did you learn from this experience?',
        'How do you handle conflict now?',
      ],
      context: 'Evaluates teamwork and conflict resolution skills.',
      estimatedTime: '2-3',
    },
  ]
})
</script>

<style scoped>
.interview-prep-container {
  max-width: 1200px;
  margin: 0 auto;
}

.prep-tabs {
  margin-bottom: 2rem;
}

.setup-card,
.profile-card,
.recommendations-card {
  height: fit-content;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.profile-stats .stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recommendation-item {
  padding: 1rem;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.questions-grid {
  display: grid;
  gap: 1.5rem;
}

.question-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

.question-number {
  opacity: 0.6;
}

.key-points-list,
.follow-up-list {
  margin: 0;
  padding-left: 1.2rem;
}

.key-points-list li,
.follow-up-list li {
  margin-bottom: 0.25rem;
}

.interview-setup-card {
  padding: 2rem;
}

.config-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.checklist-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.checklist-item {
  align-items: center;
}

.active-interview {
  max-width: 800px;
  margin: 0 auto;
}

.interview-header {
  background: rgba(var(--v-theme-surface), 0.8);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.timer-display {
  display: flex;
  align-items: center;
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.interviewer-info {
  background: rgba(var(--v-theme-primary), 0.05);
  padding: 0.75rem;
  border-radius: 8px;
}

.interviewer-avatar {
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recording-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transition: all 0.3s ease;
}

.recording-status.recording {
  background: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
  animation: pulse 1s infinite;
}

.performance-stat {
  padding: 1rem;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.stat-value {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.interview-item {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  transition: background 0.2s ease;
}

.interview-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-weight: 600;
  color: white;
}

.score-excellent {
  background: rgb(var(--v-theme-success));
}

.score-good {
  background: rgb(var(--v-theme-primary));
}

.score-needs-improvement {
  background: rgb(var(--v-theme-warning));
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .checklist-items {
    grid-template-columns: 1fr;
  }

  .interview-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .questions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
