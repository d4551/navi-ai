<template>
  <div class="enhanced-job-grid font-sans">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center py-8">
      <LoadingIndicator size="lg" />
      <p class="text-secondary mt-4">Searching gaming job sources...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="jobs.length === 0" class="empty-state text-center py-12">
      <AppIcon
        name="mdi-briefcase-search-outline"
        class="text-6xl text-secondary mb-6"
      />
      <h3 class="mb-3 text-secondary">No jobs found</h3>
      <p class="text-secondary">
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
          :max-skills="maxSkillsPerCard"
          :ai-insights="getJobInsights(job)"
          @select="handleJobSelect"
          @apply="handleJobApply"
          @save="handleJobSave"
          @view-details="handleJobDetails"
          @add-to-compare="handleAddToCompare"
          @share="handleShare"
          @report="handleReport"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { LightBulbIcon } from '@heroicons/vue/24/outline'

import { computed, ref } from 'vue'
import EnhancedJobCard from './EnhancedJobCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'

const _props = defineProps({
  jobs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showMetrics: {
    type: Boolean,
    default: true,
  },
  maxSkillsPerCard: {
    type: Number,
    default: 6,
  },
  enableAIInsights: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'job-selected',
  'job-applied',
  'job-saved',
  'job-details',
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
  if (job.company?.type === 'AAA Studio') {
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
      icon: 'LightBulbIcon',
      color: '#06b6d4',
      text: 'Highlight your Unity/Unreal projects - they value game engine experience',
    })
  }

  return insights.slice(0, 4) // Limit to 4 insights
}

// Event handlers
const handleJobSelect = job => {
  emit('job-selected', job)
}

const handleJobApply = job => {
  emit('job-applied', job)
}

const handleJobSave = data => {
  emit('job-saved', data)
}

const handleJobDetails = job => {
  emit('job-details', job)
}

const handleAddToCompare = job => {
  emit('add-to-compare', job)
}

const handleShare = job => {
  emit('share-job', job)
}

const handleReport = job => {
  emit('report-job', job)
}
</script>

<style scoped>
.enhanced-job-grid {
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 700px), 1fr));
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
  color: var(--text-primary-600);
}

.empty-state p {
  font-size: var(--font-size-base);
  max-width: 400px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .jobs-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 600px), 1fr));
  }
}

@media (max-width: 1024px) {
  .jobs-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 500px), 1fr));
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
