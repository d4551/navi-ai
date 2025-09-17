<!--
  CANONICAL Cover Letter Content Form
  Matches the design pattern of resume form components
-->
<template>
  <section class="glass p-glass-md gap-glass-md rounded-lg unified-card font-sans">
    <div class="flex items-center justify-between mb-2">
      <h2 class="h6 mb-0 flex items-center gap-glass-sm text-primary-600">
        <AppIcon name="mdi-text-box-outline" class="icon-md" aria-hidden="true" />
        <span>Cover Letter Content</span>
      </h2>
      <div class="header-actions flex items-center gap-glass-sm">
        <UnifiedButton
          v-if="canUseAI && content.body"
          color="glass"
          appearance="outlined"
          :loading="loading.review"
          :disabled="loading.review"
          leading-icon="mdi-spellcheck"
          aria-label="Review cover letter with AI"
          @click="reviewContent"
        >
          Review
        </UnifiedButton>
        <UnifiedButton
          v-if="canUseAI"
          color="gaming"
          :loading="loading.generation"
          :disabled="loading.generation || !hasJobInfo"
          leading-icon="SparklesIcon"
          aria-label="Generate cover letter with AI"
          @click="generateContent"
        >
          Generate
        </UnifiedButton>
      </div>
    </div>

    <!-- Cover Letter Settings -->
    <div class="cover-letter-settings mb-4">
      <div class="flex flex-wrap g-3">
        <!-- Tone Setting -->
        <div class="flex-1-md-4">
          <label for="tone-select" class="form-label">Tone</label>
          <select
            id="tone-select"
            v-model="localContent.tone"
            class="form-select glass-input"
            @change="commitChanges"
          >
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="confident">Confident</option>
            <option value="formal">Formal</option>
            <option value="conversational">Conversational</option>
          </select>
        </div>

        <!-- Length Setting -->
        <div class="flex-1-md-4">
          <label for="length-select" class="form-label">Length</label>
          <select
            id="length-select"
            v-model="localContent.length"
            class="form-select glass-input"
            @change="commitChanges"
          >
            <option value="concise">Concise (~250 words)</option>
            <option value="standard">Standard (~350 words)</option>
            <option value="detailed">Detailed (~500 words)</option>
          </select>
        </div>

        <!-- Experience Template -->
        <div class="flex-1-md-4">
          <label for="experience-template" class="form-label">Experience Level</label>
          <select
            id="experience-template"
            v-model="localContent.experienceTemplate"
            class="form-select glass-input"
            @change="commitChanges"
          >
            <option value="entry-level">Entry Level</option>
            <option value="mid-career">Mid-Career</option>
            <option value="senior-level">Senior Level</option>
            <option value="executive">Executive</option>
            <option value="career-change">Career Change</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Key Points to Highlight -->
    <div class="key-points-section mb-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="h7 text-secondary mb-0">Key Points to Highlight</h3>
        <UnifiedButton
          color="glass"
          appearance="outlined"
          leading-icon="PlusIcon"
          aria-label="Add key point"
          @click="addKeyPoint"
        >
          Add Point
        </UnifiedButton>
      </div>

      <div v-if="localContent.keyPoints.length === 0" class="text-secondary small mb-3">
        Add specific achievements or skills you want to emphasize in your cover letter.
      </div>

      <div class="key-points-list">
        <div
          v-for="(point, index) in localContent.keyPoints"
          :key="`point-${index}`"
          class="key-point-item mb-2"
        >
          <div class="input-group">
            <input
              v-model="point.text"
              type="text"
              class="form-control glass-input"
              :placeholder="`Key point ${index + 1}...`"
              @blur="commitChanges"
              @keydown.enter="addKeyPoint"
            />
            <UnifiedButton
              color="danger"
              appearance="outlined"
              icon-only
              :aria-label="`Remove key point ${index + 1}`"
              icon="TrashIcon"
              @click="removeKeyPoint(index)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Cover Letter Body -->
    <div class="cover-letter-body-section">
      <div class="form-floating">
        <textarea
          id="cover-letter-body"
          v-model="localContent.body"
          class="form-control glass-input cover-letter-textarea"
          placeholder="Write your cover letter content here, or use the Generate button to create it with AI..."
          rows="12"
          aria-describedby="cover-body-help"
          @blur="commitChanges"
          @input="onContentChange"
        ></textarea>
        <label for="cover-letter-body" class="form-label">Cover Letter Body</label>
      </div>

      <div id="cover-body-help" class="form-text flex items-center justify-between" aria-live="polite">
        <div class="flex items-center gap-glass-md">
          <span>
            <AppIcon name="InformationCircleIcon" class="mr-1" />
            Aim for 3-4 paragraphs with specific examples
          </span>
          <span v-if="localContent.body" class="text-secondary">
            {{ wordCount }} words • {{ characterCount }} characters
          </span>
        </div>
        <div v-if="readingTime" class="text-secondary small">
          {{ readingTime }} min read
        </div>
      </div>
    </div>

    <!-- AI Review Results -->
    <div
      v-if="reviewResults"
      class="review-results mt-3"
      role="region"
      aria-labelledby="review-results-title"
    >
      <div class="alert" :class="getReviewAlertClass()">
        <div class="flex items-start gap-glass-md">
          <i :class="getReviewIcon() icon-lg" aria-hidden="true"></i>
          <div class="flex-grow-1">
            <h3 id="review-results-title" class="h6 mb-2">AI Review Results</h3>
            
            <!-- Overall Score -->
            <div v-if="reviewResults.score" class="mb-3">
              <div class="flex items-center gap-glass-sm mb-1">
                <strong>Overall Score:</strong>
                <span class="badge" :class="getScoreBadgeClass(reviewResults.score)">
                  {{ reviewResults.score }}/100
                </span>
              </div>
              <div class="progress" style="height: 6px;">
                <div
                  class="progress-bar"
                  :class="getScoreProgressClass(reviewResults.score)"
                  :class="`w-[${reviewResults.score}%]`"
                ></div>
              </div>
            </div>

            <!-- Issues Found -->
            <div v-if="reviewResults.issues?.length" class="mb-3">
              <h4 class="h7 text-secondary mb-2">Issues to Address</h4>
              <ul class="small mb-0">
                <li
                  v-for="issue in reviewResults.issues"
                  :key="`issue-${issue.message}`"
                  class="mb-1"
                >
                  <span class="badge mr-1" :class="getIssueBadgeClass(issue.type)">
                    {{ formatIssueType(issue.type) }}
                  </span>
                  {{ issue.message }}
                </li>
              </ul>
            </div>

            <!-- Suggestions -->
            <div v-if="reviewResults.suggestions?.length" class="mb-3">
              <h4 class="h7 text-secondary mb-2">Suggestions</h4>
              <ul class="small mb-0">
                <li
                  v-for="suggestion in reviewResults.suggestions"
                  :key="`suggestion-${suggestion}`"
                  class="mb-1"
                >
                  <AppIcon name="LightBulbIcon" color="warning" aria-hidden="true" />
                  {{ suggestion }}
                </li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-glass-sm">
              <button
                v-if="canUseAI"
                class="btn btn-sm btn-primary ui-btn ui-size-md"
                :disabled="loading.improvement"
                @click="improveContent"
              >
                <span
                  v-if="loading.improvement"
                  class="spinner-border spinner-border-sm mr-1"
                  aria-hidden="true"
                ></span>
                <AppIcon name="SparklesIcon" class="mr-1" />
                Auto-Improve
              </button>
              <button
                class="btn btn-sm btn-outline-secondary ui-btn ui-size-md"
                @click="dismissReview"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Suggestions -->
    <div v-if="!localContent.body && !loading.generation" class="template-suggestions mt-3">
      <div class="card glass-elevated">
        <div class="card-body section-body">
          <h3 class="h6 mb-3">
            <AppIcon name="LightBulbIcon" color="primary" aria-hidden="true" />
            Cover Letter Tips
          </h3>
          <div class="flex flex-wrap g-3">
            <div class="flex-1-md-4">
              <h4 class="h7 text-secondary mb-2">Opening Paragraph</h4>
              <p class="small">State the position, how you found it, and a compelling reason why you're interested.</p>
            </div>
            <div class="flex-1-md-4">
              <h4 class="h7 text-secondary mb-2">Body Paragraphs</h4>
              <p class="small">Highlight 2-3 relevant achievements with specific examples and metrics.</p>
            </div>
            <div class="flex-1-md-4">
              <h4 class="h7 text-secondary mb-2">Closing Paragraph</h4>
              <p class="small">Express enthusiasm, request an interview, and provide your contact information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { InformationCircleIcon, LightBulbIcon, PlusIcon, SparklesIcon, TrashIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'

// Props
interface KeyPoint {
  text: string
}

interface CoverLetterContent {
  tone: string
  length: string
  experienceTemplate: string
  keyPoints: KeyPoint[]
  body: string
}

interface ReviewResults {
  score?: number
  issues?: Array<{ type: string; message: string }>
  suggestions?: string[]
}

const props = defineProps<{
  content: CoverLetterContent
  reviewResults?: ReviewResults
  canUseAI: boolean
  hasJobInfo: boolean
  loading: {
    generation?: boolean
    review?: boolean
    improvement?: boolean
  }
}>()

// Emits
const emit = defineEmits<{
  'update:content': [content: CoverLetterContent]
  'generate-content': []
  'review-content': []
  'improve-content': []
  'dismiss-review': []
}>()

// Local state
const localContent = ref<CoverLetterContent>({ ...props.content })

// Computed
const wordCount = computed(() => {
  if (!localContent.value.body) return 0
  return localContent.value.body.trim().split(/\s+/).filter(word => word.length > 0).length
})

const characterCount = computed(() => {
  return localContent.value.body?.length || 0
})

const readingTime = computed(() => {
  const words = wordCount.value
  if (words === 0) return null
  return Math.max(1, Math.round(words / 200)) // 200 words per minute average
})

// Watch for external changes
watch(
  () => props.content,
  (newContent) => {
    localContent.value = { ...newContent }
  },
  { deep: true }
)

// Methods
const commitChanges = () => {
  emit('update:content', { ...localContent.value })
}

const addKeyPoint = () => {
  localContent.value.keyPoints.push({ text: '' })
  commitChanges()
}

const removeKeyPoint = (index: number) => {
  if (localContent.value.keyPoints.length > 0) {
    localContent.value.keyPoints.splice(index, 1)
    commitChanges()
  }
}

const generateContent = () => {
  emit('generate-content')
}

const reviewContent = () => {
  emit('review-content')
}

const improveContent = () => {
  emit('improve-content')
}

const dismissReview = () => {
  emit('dismiss-review')
}

// Review result helpers
const getReviewAlertClass = () => {
  if (!props.reviewResults?.score) return 'alert-info'
  const score = props.reviewResults.score
  
  if (score >= 85) return 'alert-success'
  if (score >= 70) return 'alert-warning'
  return 'alert-danger'
}

const getReviewIcon = () => {
  if (!props.reviewResults?.score) return 'mdi InformationCircleIconrmation text-blue-600'
  const score = props.reviewResults.score
  
  if (score >= 85) return 'mdi CheckIcon-circle-outline text-success-600'
  if (score >= 70) return 'mdi mdi-alert text-warning-600'
  return 'mdi mdi-alert-circle-outline text-error-600'
}

const getScoreBadgeClass = (score: number) => {
  if (score >= 85) return 'bg-success-500'
  if (score >= 70) return 'bg-warning-500'
  return 'bg-error-500'
}

const getScoreProgressClass = (score: number) => {
  if (score >= 85) return 'bg-success-500'
  if (score >= 70) return 'bg-warning-500'
  return 'bg-error-500'
}

const getIssueBadgeClass = (type: string) => {
  switch (type) {
    case 'cliche': return 'bg-warning-500 text-glass-primary'
    case 'redundancy': return 'bg-blue-500'
    case 'misalignment': return 'bg-error-500'
    case 'clarity': return 'bg-secondary-500'
    default: return 'bg-glass-bg dark:bg-glass-bg-hover text-glass-primary'
  }
}

const formatIssueType = (type: string) => {
  switch (type) {
    case 'cliche': return 'Cliché'
    case 'redundancy': return 'Redundant'
    case 'misalignment': return 'Misaligned'
    case 'clarity': return 'Unclear'
    default: return type
  }
}

// Debounced content change handler
const onContentChange = debounce(() => {
  commitChanges()
}, 1000)
</script>

<style scoped lang="scss">
.cover-letter-settings {
  .form-select {
    font-size: var(--font-size-sm);
  }
}

.key-points-section {
  .h7 {
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .key-point-item {
    .input-group {
      .form-control {
        border-r: none;
      }
      
      .btn {
        border-l: none;
        border-color: var(--glass-border);
      }
    }
  }
}

.cover-letter-textarea {
  min-height: 300px !important;
  resize: vertical;
  line-height: 1.6;
  font-family: var(--font-family-primary);
}

.review-results {
  .alert {
    border: 1px solid;
    background: var(--glass-surface);
    backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
    -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
    
    &.alert-success {
      border-color: var(--color-success);
      background: linear-gradient(135deg, rgba(var(--success-rgb), 0.1) 0%, var(--glass-surface) 100%);
    }
    
    &.alert-warning {
      border-color: var(--color-warning);
      background: linear-gradient(135deg, rgba(var(--warning-rgb), 0.1) 0%, var(--glass-surface) 100%);
    }
    
    &.alert-danger {
      border-color: var(--color-danger);
      background: linear-gradient(135deg, rgba(var(--danger-rgb), 0.1) 0%, var(--glass-surface) 100%);
    }
    
    &.alert-info {
      border-color: var(--color-info);
      background: linear-gradient(135deg, rgba(var(--info-rgb), 0.1) 0%, var(--glass-surface) 100%);
    }
  }
  
  .h7 {
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .progress {
    border-radius: var(--border-radius-sm);
    background: var(--glass-border);
  }
  
  .badge { font-size: var(--font-size-xs); padding: var(--spacing-1-5) var(--spacing-2-5); font-weight: 500; }
}

.template-suggestions {
  .card {
    border: 1px solid var(--glass-border);
    background: var(--glass-surface);
    backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
    -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  }
  
  .h7 {
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

// Dark theme support
[data-theme="dark"] {
  .review-results .alert,
  .template-suggestions .card {
    background: var(--glass-surface-dark);
    border-color: var(--glass-border-dark);
    
    &.alert-success {
      background: linear-gradient(135deg, rgba(var(--success-rgb), 0.15) 0%, var(--glass-surface-dark) 100%);
    }
    
    &.alert-warning {
      background: linear-gradient(135deg, rgba(var(--warning-rgb), 0.15) 0%, var(--glass-surface-dark) 100%);
    }
    
    &.alert-danger {
      background: linear-gradient(135deg, rgba(var(--danger-rgb), 0.15) 0%, var(--glass-surface-dark) 100%);
    }
    
    &.alert-info {
      background: linear-gradient(135deg, rgba(var(--info-rgb), 0.15) 0%, var(--glass-surface-dark) 100%);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .cover-letter-settings .flex flex-wrap {
    flex-direction: column;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    
    .btn {
      width: 100%;
    }
  }
  
  .review-results .flex {
    flex-direction: column;
    align-items: flex-start;
    
    .btn {
      width: 100%;
    }
  }
  
  .template-suggestions .flex flex-wrap {
    flex-direction: column;
  }
}
</style>
