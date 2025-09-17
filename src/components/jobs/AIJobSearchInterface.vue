<template>
  <div class="ai-job-search-interface font-sans">
    <!-- AI Search Form -->
    <div class="search-form-container mb-4">
      <div class="glass-card section-card-subtle">
        <div class="search-header mb-3">
          <div class="flex items-center justify-between">
            <div>
              <h6 class="mb-1">
                <AppIcon name="SparklesIcon" class="text-primary-600 mr-2" />
                AI-Powered Job Discovery
              </h6>
              <p class="text-secondary small mb-0">
                Describe your ideal role, and let AI find the perfect matches
              </p>
            </div>
            <div v-if="!loading" class="ai-status">
              <span class="badge bg-success-500">
                <AppIcon name="mdi-circle-small" />
                AI Ready
              </span>
            </div>
          </div>
        </div>

        <!-- Main Search Input -->
        <div class="search-input-section mb-4 ui-input ui-size-md">
          <label class="form-label font-medium">
            <AppIcon name="ChatBubbleLeftRightIcon" class="mr-1" />
            Describe Your Dream Gaming Job
          </label>
          <div class="ai-search-input ui-input ui-size-md">
            <textarea
              v-model="localSearchForm.query"
              class="form-control ai-textarea glass-input"
              rows="3"
              placeholder="I'm looking for a senior game designer role at a AAA studio working on multiplayer games, with opportunities for creative leadership and competitive salary..."
              :disabled="loading || isSearching"
            ></textarea>
            <div class="input-helpers mt-2">
              <div class="suggestion-chips flex flex-wrap gap-glass-xs">
                <UnifiedButton
                  v-for="suggestion in quickSuggestions"
                  :key="suggestion"
                  variant="outline"
                  size="chip"
                  :disabled="loading || isSearching"
                  @click="addSuggestion(suggestion)"
                >
                  {{ suggestion }}
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Parameters -->
        <div class="advanced-parameters">
          <div class="flex flex-wrap g-3">
            <div class="flex-1-md-6">
              <label class="form-label small font-medium">
                <AppIcon name="MapPinIcon" />
                Location
              </label>
              <input
                v-model="localSearchForm.location"
                type="text"
                class="form-control form-control-sm glass-input"
                placeholder="Remote, Los Angeles, CA, etc."
                :disabled="loading || isSearching"
              />
            </div>
            <div class="flex-1-md-3">
              <label class="form-label small font-medium">
                <AppIcon name="UserIcon-star" class="mr-1" />
                Experience
              </label>
              <select
                v-model="localSearchForm.experience"
                class="form-select form-select-sm"
                :disabled="loading || isSearching"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Principal</option>
              </select>
            </div>
            <div class="flex-1-md-3">
              <label class="form-label small font-medium">
                <AppIcon name="ClockIcon" class="mr-1" />
                Job Type
              </label>
              <select
                v-model="localSearchForm.type"
                class="form-select form-select-sm"
                :disabled="loading || isSearching"
              >
                <option value="full-time">Full-time</option>
                <option value="contract">Contract</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <!-- Salary Range -->
          <div class="flex flex-wrap g-3 mt-2">
            <div class="flex-1-md-6">
              <label class="form-label small font-medium">
                <AppIcon name="CurrencyDollarIcon" />
                Salary Range (USD)
              </label>
              <div class="salary-inputs flex flex-wrap g-2">
                <div class="flex-1-6">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input
                      v-model.number="localSearchForm.salaryMin"
                      type="number"
                      class="form-control"
                      placeholder="Min"
                      min="0"
                      step="5000"
                      :disabled="loading || isSearching"
                    />
                  </div>
                </div>
                <div class="flex-1-6">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input
                      v-model.number="localSearchForm.salaryMax"
                      type="number"
                      class="form-control"
                      placeholder="Max"
                      min="0"
                      step="5000"
                      :disabled="loading || isSearching"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1-md-6">
              <label class="form-label small font-medium">
                <AppIcon name="HomeIcon" />
                Remote Work
              </label>
              <div class="form-check form-switch mt-2">
                <input
                  id="remote-work-toggle"
                  v-model="localSearchForm.remote"
                  class="form-check-input"
                  type="checkbox"
                  :disabled="loading || isSearching"
                />
                <label class="form-check-label" for="remote-work-toggle">
                  Include remote positions
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Insights Panel -->
    <div
      v-if="aiInsights.length > 0 && !loading"
      class="ai-insights-panel mb-4"
    >
      <div class="glass-card section-card-subtle">
        <div class="insights-header mb-3">
          <h6 class="mb-1">
            <AppIcon name="LightBulbIcon" color="warning" />
            AI Insights
          </h6>
          <p class="text-secondary small mb-0">
            Smart recommendations based on your search
          </p>
        </div>
        <div class="insights-grid media-grid">
          <div
            v-for="insight in aiInsights"
            :key="insight.id"
            class="insight-card"
          >
            <div class="insight-icon">
              <i :class="[insight.icon, 'text-primary-600']"></i>
            </div>
            <div class="insight-content">
              <h6 class="insight-title">{{ insight.title }}</h6>
              <p class="insight-description small text-secondary">
                {{ insight.description }}
              </p>
              <UnifiedButton
                v-if="insight.action"
                variant="outline"
                size="sm"
                @click="handleInsightActionLocal(insight)"
              >
                {{ insight.action.label }}
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Actions -->
    <div class="search-actions">
      <div class="flex items-center justify-between">
        <div class="search-info">
          <div class="text-secondary small">
            <AppIcon name="InformationCircleIcon" class="mr-1" />
            AI will search across your configured job board sources
          </div>
        </div>
        <div class="action-buttons flex gap-glass-sm">
          <UnifiedButton
            variant="outline"
            :disabled="loading || isSearching || !hasValidSearch"
            leading-icon="BookmarkIcon"
            @click="saveCurrentSearch"
          >
            Save Search
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="lg"
            :disabled="loading || isSearching || !hasValidSearch"
            :loading="loading || isSearching"
            leading-icon="SparklesIcon"
            @click="initiateAISearch"
          >
            Start AI Search
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Search Progress (when loading) -->
    <div v-if="loading || isSearching" class="search-progress mt-4">
      <div class="glass-card section-card-subtle">
        <div class="progress-content">
          <div class="flex items-center justify-between mb-3">
            <h6 class="mb-0">
              <AppIcon name="SparklesIcon" class="text-primary-600 mr-2" />
              AI Search in Progress
            </h6>
            <div class="search-timer">
              <span class="badge badge-compact bg-primary-500"
                >{{ searchTimer }}s</span
              >
            </div>
          </div>

          <div class="progress mb-3" style="height: 8px">
            <div
              class="progress-bar progress-bar-striped progress-bar-animated bg-primary-500"
              :style="{ width: searchProgress + '%' }"
            ></div>
          </div>

          <div class="search-status">
            <div class="status-steps">
              <div
                v-for="step in searchSteps"
                :key="step.id"
                class="status-step"
                :class="{
                  'step-active': step.id === currentStep,
                  'step-completed': completedSteps.includes(step.id),
                }"
              >
                <div class="step-icon">
                  <AppIcon
                    v-if="completedSteps.includes(step.id)"
                    name="CheckIcon"
                  />
                  <AppIcon
                    v-else-if="step.id === currentStep"
                    name="ArrowPathIcon"
                    class="mdi-spin"
                  />
                  <i v-else :class="step.icon"></i>
                </div>
                <div class="step-label small">{{ step.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// AI Job Search Interface Component
import {
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  HomeIcon,
  InformationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import { MapPinIcon } from '@heroicons/vue/24/solid'

import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch,
  defineEmits,
  defineProps,
} from 'vue'
import { useAIJobSearch } from '@/composables/useAIJobSearch'
import { useToast } from '@/composables/useToast'
import { useUnifiedProfile } from '@/composables/useUnifiedProfile'
import { profileSyncService } from '@/services/ProfileSyncService'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const _props = defineProps({
  searchForm: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  userProfile: {
    type: Object,
    default: () => ({}),
  },
})

// Use unified profile system
const unifiedProfile = useUnifiedProfile()

// Get job search specific profile data
const jobSearchProfile = computed(() => unifiedProfile.jobSearchProfile.value)

// Use profile data for auto-filling search form
const profileBasedSuggestions = computed(() => {
  if (!jobSearchProfile.value) return []

  const suggestions = []

  // Add role-based suggestions
  if (jobSearchProfile.value.preferredRoles?.length) {
    suggestions.push(...jobSearchProfile.value.preferredRoles.slice(0, 3))
  }

  // Add skill-based suggestions
  if (jobSearchProfile.value.skills?.technical?.length) {
    const topSkills = jobSearchProfile.value.skills.technical.slice(0, 2)
    suggestions.push(`roles using ${topSkills.join(' and ')}`)
  }

  // Add experience level suggestions
  if (jobSearchProfile.value.experience?.length) {
    const totalYears = jobSearchProfile.value.experience.reduce((sum, exp) => {
      const years = exp.endDate
        ? (new Date(exp.endDate) - new Date(exp.startDate)) /
          (1000 * 60 * 60 * 24 * 365)
        : (new Date() - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365)
      return sum + years
    }, 0)

    if (totalYears > 5) {
      suggestions.push('senior level positions')
    } else if (totalYears > 2) {
      suggestions.push('mid level opportunities')
    } else {
      suggestions.push('entry level roles')
    }
  }

  return suggestions.filter(Boolean).slice(0, 5)
})

const emit = defineEmits(['search', 'save-search', 'results', 'expand-skills'])

// AI Job Search integration - now uses unified profile
const {
  isSearching,
  searchInsights,
  searchSuggestions,
  quickSuggestions: aiQuickSuggestions,
  performAISearch,
  getSearchSuggestions,
  handleInsightAction,
  saveSearch,
} = useAIJobSearch(jobSearchProfile)

// Toast notifications
const {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
} = useToast()

// Local state - initialize with default structure if _props.searchForm is not provided
const defaultSearchForm = {
  query: '',
  location: '',
  type: 'full-time',
  salaryMin: '',
  salaryMax: '',
  remote: false,
}

const localSearchForm = ref({
  ...defaultSearchForm,
  ...(_props.searchForm || {}),
})
const searchTimer = ref(0)
const searchProgress = ref(0)
const currentStep = ref(1)
const completedSteps = ref([])

// Search timer
let searchInterval = null

// Use AI-powered suggestions and insights, enhanced with profile data
const quickSuggestions = computed(() => {
  const suggestions = []

  // Add AI suggestions
  if (searchSuggestions.value.length > 0) {
    suggestions.push(...searchSuggestions.value)
  } else if (aiQuickSuggestions.value.length > 0) {
    suggestions.push(...aiQuickSuggestions.value)
  }

  // Add profile-based suggestions
  suggestions.push(...profileBasedSuggestions.value)

  // Remove duplicates and limit
  return [...new Set(suggestions)].slice(0, 8)
})

const aiInsights = computed(() => searchInsights.value)

// Search steps
const searchSteps = ref([
  { id: 1, icon: 'mdi-text-search', label: 'Analyzing query' },
  { id: 2, icon: 'mdi-source-repository', label: 'Searching sources' },
  { id: 3, icon: 'mdi-auto-fix', label: 'AI matching' },
  { id: 4, icon: 'mdi-format-list-checks', label: 'Ranking results' },
])

// Computed
const hasValidSearch = computed(
  () => localSearchForm.value.query && localSearchForm.value.query.length > 10
)

// Watch for external form changes
watch(
  () => _props.searchForm,
  newForm => {
    localSearchForm.value = { ...newForm }
  },
  { deep: true }
)

// Auto-fill form fields from unified profile when available
watch(
  jobSearchProfile,
  profile => {
    if (!profile) return

    // Auto-fill location if not already set
    if (!localSearchForm.value.location && profile.location) {
      localSearchForm.value.location = profile.location
    }

    // Auto-fill salary expectations if not set
    if (!localSearchForm.value.salaryMin && profile.salaryExpectations?.min) {
      localSearchForm.value.salaryMin = profile.salaryExpectations.min
    }
    if (!localSearchForm.value.salaryMax && profile.salaryExpectations?.max) {
      localSearchForm.value.salaryMax = profile.salaryExpectations.max
    }

    // Auto-fill remote preference if not set
    if (
      localSearchForm.value.remote === undefined &&
      profile.remotePreference !== undefined
    ) {
      localSearchForm.value.remote = profile.remotePreference
    }

    // Auto-fill experience level based on profile data
    if (!localSearchForm.value.experience && profile.experience?.length) {
      const totalYears = profile.experience.reduce((sum, exp) => {
        const years = exp.endDate
          ? (new Date(exp.endDate) - new Date(exp.startDate)) /
            (1000 * 60 * 60 * 24 * 365)
          : (new Date() - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365)
        return sum + years
      }, 0)

      if (totalYears > 7) {
        localSearchForm.value.experience = 'lead'
      } else if (totalYears > 4) {
        localSearchForm.value.experience = 'senior'
      } else if (totalYears > 1) {
        localSearchForm.value.experience = 'mid'
      } else {
        localSearchForm.value.experience = 'entry'
      }
    }
  },
  { immediate: true }
)

// Watch loading state to manage search progress
watch(
  () => _props.loading || isSearching.value,
  isLoading => {
    if (isLoading) {
      startSearchProgress()
    } else {
      stopSearchProgress()
    }
  }
)

// Methods
const addSuggestion = suggestion => {
  if (localSearchForm.value.query) {
    localSearchForm.value.query += ', ' + suggestion
  } else {
    localSearchForm.value.query = suggestion
  }
}

const initiateAISearch = async () => {
  if (!hasValidSearch.value) return

  // Reset progress
  searchProgress.value = 0
  currentStep.value = 1
  completedSteps.value = []
  searchTimer.value = 0

  try {
    // Use AI-powered search
    const result = await performAISearch(localSearchForm.value)

    if (result && result.success) {
      // Emit results to parent component
      emit('results', {
        jobs: result.results,
        insights: result.insights,
        analysis: result.analysis,
      })

      // Also emit traditional search event for compatibility
      emit('search', { ...localSearchForm.value })
    } else {
      console.error('AI search failed:', result?.error || 'Unknown error')
      toastWarning(
        'AI search encountered an issue. Switching to standard search mode.',
        'AI Search Warning'
      )
      // Fallback to regular search
      emit('search', { ...localSearchForm.value })
    }
  } catch (error) {
    console.error('Error during AI search:', error)
    toastError(
      'AI search is currently unavailable. Using standard search instead.',
      'AI Search Error'
    )
    // Fallback to regular search
    emit('search', { ...localSearchForm.value })
  }
}

const saveCurrentSearch = async () => {
  try {
    // Use AI service to save search
    const savedSearch = await saveSearch(localSearchForm.value)
    emit('save-search', savedSearch)
  } catch (error) {
    console.error('Failed to save search:', error)
    // Fallback to emit original form
    emit('save-search', { ...localSearchForm.value })
  }
}

const handleInsightActionLocal = async insight => {
  try {
    // Use AI service to handle insight actions
    const result = await handleInsightAction(insight)

    switch (result.action) {
      case 'updateSearch':
        // Apply search updates from AI recommendations
        if (result.data) {
          Object.assign(localSearchForm.value, result.data)
        }
        break
      case 'adjustSalary':
        // Adjust salary range based on AI suggestions
        if (result.data?.salaryMax) {
          localSearchForm.value.salaryMax = result.data.salaryMax
        }
        if (result.data?.salaryMin) {
          localSearchForm.value.salaryMin = result.data.salaryMin
        }
        break
      case 'changeLocation':
        // Update location preferences
        if (result.data?.remote !== undefined) {
          localSearchForm.value.remote = result.data.remote
        }
        if (result.data?.location) {
          localSearchForm.value.location = result.data.location
        }
        break
      case 'expandSkills':
        // This would typically update user profile, emit to parent
        emit('expand-skills', result.data)
        break
      default:
      // Default insight action result handled
    }
  } catch (error) {
    console.error('Failed to handle insight action:', error)
  }
}

const startSearchProgress = () => {
  searchInterval = setInterval(() => {
    searchTimer.value += 1

    // Update progress based on steps
    if (searchTimer.value <= 2) {
      currentStep.value = 1
      searchProgress.value = 15
    } else if (searchTimer.value <= 4) {
      completedSteps.value = [1]
      currentStep.value = 2
      searchProgress.value = 40
    } else if (searchTimer.value <= 6) {
      completedSteps.value = [1, 2]
      currentStep.value = 3
      searchProgress.value = 70
    } else if (searchTimer.value <= 8) {
      completedSteps.value = [1, 2, 3]
      currentStep.value = 4
      searchProgress.value = 90
    } else {
      completedSteps.value = [1, 2, 3, 4]
      searchProgress.value = 100
    }
  }, 1000)
}

const stopSearchProgress = () => {
  if (searchInterval) {
    clearInterval(searchInterval)
    searchInterval = null
  }

  // Reset progress after a brief delay
  setTimeout(() => {
    searchProgress.value = 0
    currentStep.value = 1
    completedSteps.value = []
    searchTimer.value = 0
  }, 2000)
}

// Profile sync event handlers
const handleProfileUpdate = eventData => {
  // Update search form with new profile preferences
  const { preferences } = eventData

  if (preferences.location && !localSearchForm.value.location) {
    localSearchForm.value.location = preferences.location
  }

  if (preferences.salaryExpectations) {
    if (
      !localSearchForm.value.salaryMin &&
      preferences.salaryExpectations.min
    ) {
      localSearchForm.value.salaryMin = preferences.salaryExpectations.min
    }
    if (
      !localSearchForm.value.salaryMax &&
      preferences.salaryExpectations.max
    ) {
      localSearchForm.value.salaryMax = preferences.salaryExpectations.max
    }
  }

  if (
    preferences.workPreferences?.remote !== undefined &&
    localSearchForm.value.remote === undefined
  ) {
    localSearchForm.value.remote = preferences.workPreferences.remote
  }

  // Re-generate AI suggestions with updated profile
  if (localSearchForm.value.query) {
    getSearchSuggestions(localSearchForm.value.query)
  }
}

const handleGlobalProfileUpdate = event => {
  const { detail } = event
  if (detail && detail.systems?.includes('jobs')) {
    // Refresh search suggestions and insights
    if (localSearchForm.value.query) {
      getSearchSuggestions(localSearchForm.value.query)
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  // Initialize AI suggestions on mount if form has a query
  if (localSearchForm.value.query) {
    getSearchSuggestions(localSearchForm.value.query)
  }

  // Listen for profile sync events
  profileSyncService.on('jobs-profile-updated', handleProfileUpdate)

  // Listen for global profile updates
  if (typeof window !== 'undefined') {
    window.addEventListener('profile-updated', handleGlobalProfileUpdate)
  }
})

// Cleanup
onUnmounted(() => {
  stopSearchProgress()

  // Clean up profile sync listeners
  profileSyncService.off('jobs-profile-updated', handleProfileUpdate)

  if (typeof window !== 'undefined') {
    window.removeEventListener('profile-updated', handleGlobalProfileUpdate)
  }
})
</script>

<style scoped>
.ai-job-search-interface {
  max-width: 1000px;
  margin: 0 auto;
}

.glass-card-subtle {
  background: var(--glass-surface-light);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1.5rem;
}

.ai-textarea {
  border: 2px solid var(--glass-border-light);
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
  font-size: 0.95rem;
  line-height: 1.5;
}

.ai-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.15);
  background: var(--glass-elevated);
}

.chip-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.insights-grid {
  display: grid;
  gap: 1rem;
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary-600);
}

.insight-description {
  margin-bottom: 0.75rem;
}

.search-actions {
  background: var(--glass-header);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
}

.search-progress .glass-card-subtle {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  border-color: rgba(99, 102, 241, 0.2);
}

.status-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.status-step.step-active {
  opacity: 1;
  color: var(--color-primary);
}

.status-step.step-completed {
  opacity: 1;
  color: var(--color-success);
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glass-surface);
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.step-completed .step-icon {
  background: var(--color-success);
  color: var(--text-inverse);
  border-color: var(--color-success);
}

.step-active .step-icon {
  background: var(--color-primary);
  color: var(--text-inverse);
  border-color: var(--color-primary);
}

.search-timer .badge {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
}

.input-group-text {
  background: var(--glass-surface-light);
  border: 1px solid var(--glass-border-light);
  color: var(--text-secondary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ai-job-search-interface .glass-card-subtle {
    padding: 1rem;
  }

  .search-actions {
    padding: 1rem;
  }

  .flex.items-center.justify-between {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start !important;
  }

  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }

  .action-buttons .btn {
    flex: 1;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .status-steps {
    gap: 0.5rem;
  }

  .step-label {
    font-size: 0.7rem !important;
    text-align: center;
  }
}

/* Dark theme support */
[data-theme='dark'] .glass-card-subtle {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .insight-card {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

[data-theme='dark'] .search-actions {
  background: var(--glass-header-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .input-group-text {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
  color: var(--text-secondary);
}

/* Animation preferences */
@media (prefers-reduced-motion: reduce) {
  .chip-btn:hover {
    transform: none;
  }

  .progress-bar-animated {
    animation: none;
  }
}
</style>
