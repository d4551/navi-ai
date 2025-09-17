<template>
  <div class="job-results-grid">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center py-8">
      <LoadingIndicator size="large" />
      <p class="text-muted mt-4">Searching gaming job sources...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="jobs.length === 0" class="empty-state text-center py-12">
      <AppIcon
        name="mdi-briefcase-search-outline"
        class="text-6xl text-muted mb-6"
      />
      <h3 class="mb-3 text-secondary">No jobs found</h3>
      <p class="text-muted">
        Adjust your search criteria or try different keywords.
      </p>
    </div>

    <!-- Jobs Grid -->
    <div v-else class="jobs-container">
      <div class="jobs-grid job-grid">
        <EnhancedJobCard
          v-for="job in jobs"
          :key="job.id"
          :job="job"
          :show-metrics="showMetrics"
          :max-skills="6"
          :ai-insights="getJobInsights(job)"
          @select="showDetails"
          @apply="handleApply"
          @save="handleJobSave"
          @view-details="showDetails"
          @add-to-compare="handleAddToCompare"
          @share="handleShare"
          @report="handleReport"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'
import EnhancedJobCard from './EnhancedJobCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const _props = defineProps({
  jobs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  filters: { type: Object, default: () => ({}) },
  savedJobs: { type: Array, default: () => [] },
  showMetrics: { type: Boolean, default: true },
  enableAIInsights: { type: Boolean, default: true },
})

const emit = defineEmits([
  'apply',
  'save',
  'filter',
  'view-job',
  'add-to-compare',
  'share-job',
  'report-job',
])

// Generate AI insights for jobs based on match score and other factors
const getJobInsights = job => {
  if (!props.enableAIInsights) return []

  const insights = []

  // Match score insights
  if (job.matchScore >= 90) {
    insights.push({
      icon: '✓',
      color: '#10b981',
      text: 'Excellent match for your skills and experience',
    })
  } else if (job.matchScore >= 80) {
    insights.push({
      icon: '★',
      color: '#667eea',
      text: 'Strong alignment with your game development background',
    })
  }

  // Urgency insights
  if (job.posted) {
    const hoursAgo = Math.floor(
      (new Date() - new Date(job.posted)) / (1000 * 60 * 60)
    )
    if (hoursAgo <= 48) {
      insights.push({
        icon: '!',
        color: '#f59e0b',
        text: 'New posting - apply quickly for best consideration',
      })
    }
  }

  // Company insights
  if (
    job.company?.type === 'AAA Studio' ||
    (typeof job.company === 'string' &&
      ['Epic Games', 'Blizzard', 'Valve', 'Riot Games'].includes(job.company))
  ) {
    insights.push({
      icon: '🏢',
      color: '#8b5cf6',
      text: 'AAA studio with strong return offer rates for this role',
    })
  }

  // Skills insights
  const gamingSkills = ['Unity', 'Unreal', 'C#', 'C++', 'Game Development']
  const jobSkills = job.skills || job.tags || []
  const hasGamingSkills = jobSkills.some(skill =>
    gamingSkills.some(gs => skill.toLowerCase().includes(gs.toLowerCase()))
  )

  if (hasGamingSkills) {
    insights.push({
      icon: '💡',
      color: '#06b6d4',
      text: 'Highlight your Unity/Unreal projects - they value game engine experience',
    })
  }

  return insights.slice(0, 4) // Limit to 4 insights
}

// Event handlers
function showDetails(job) {
  emit('view-job', job)
}

function handleApply(job) {
  emit('apply', job)
}

function handleJobSave(data) {
  emit('save', data.job)
}

function handleAddToCompare(job) {
  emit('add-to-compare', job)
}

function handleShare(job) {
  emit('share-job', job)
}

function handleReport(job) {
  emit('report-job', job)
}
</script>

<style scoped>
.job-results-grid {
  width: 100%;
}

.jobs-container {
  width: 100%;
  max-width: var(--page-content-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.jobs-grid {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.empty-state p {
  font-size: var(--font-size-base);
  max-width: 400px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-5);
  }
}

@media (max-width: 768px) {
  .jobs-container {
    padding: 0 var(--spacing-4);
  }

  .jobs-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .jobs-container {
    padding: 0 var(--spacing-2);
  }

  .jobs-grid {
    gap: var(--spacing-3);
  }
}

/* Animation for job cards appearing */
.jobs-grid > * {
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation delay for multiple cards */
.jobs-grid > *:nth-child(1) {
  animation-delay: 0ms;
}
.jobs-grid > *:nth-child(2) {
  animation-delay: 100ms;
}
.jobs-grid > *:nth-child(3) {
  animation-delay: 200ms;
}
.jobs-grid > *:nth-child(4) {
  animation-delay: 300ms;
}
.jobs-grid > *:nth-child(5) {
  animation-delay: 400ms;
}
.jobs-grid > *:nth-child(n + 6) {
  animation-delay: 500ms;
}
</style>
