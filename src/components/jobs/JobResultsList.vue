<template>
  <div class="job-results-list font-sans">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-grid">
        <div v-for="i in 5" :key="i" class="job-skeleton glass-surface">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-company"></div>
          </div>
          <div class="skeleton-meta">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
          <div class="skeleton-description"></div>
        </div>
      </div>
    </div>

    <!-- Job List -->
    <div v-else class="jobs-list-container">
      <div v-if="jobs.length === 0" class="empty-state glass-surface">
        <div class="empty-content">
          <AppIcon name="mdi-briefcase-search-outline" class="empty-icon" />
          <h3>No Gaming Positions Found</h3>
          <p>Try adjusting your search criteria or browse our studio database for more opportunities.</p>
          <UnifiedButton
            variant="primary"
            leading-icon="BuildingOffice2Icon"
            @click="$emit('browse-studios')"
          >
            Explore Studios
          </UnifiedButton>
        </div>
      </div>

      <div v-else class="job-list">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="job-list-item glass-surface"
          :class="{
            'gaming-highlight': gamingFocus && job.isGaming,
            'featured': job.featured,
            'saved': job.saved
          }"
          @click="$emit('job-selected', job)"
        >
          <!-- Job Header -->
          <div class="job-header">
            <div class="job-main-info">
              <div class="job-title-flex flex-wrap">
                <h4 class="job-title">
                  {{ job.title }}
                  <span v-if="job.featured" class="featured-badge">StarIcon</span>
                  <span v-if="job.isGaming" class="gaming-badge">DevicePhoneMobileIcon</span>
                </h4>
                <div class="job-actions">
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    :leading-icon="job.saved ? 'BookmarkIcon' : 'BookmarkIcon-outline'"
                    :class="{ 'saved': job.saved }"
                    @click.stop="$emit('job-saved', job)"
                  />
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    leading-icon="ShareIcon"
                    @click.stop="$emit('job-shared', job)"
                  />
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    leading-icon="EllipsisHorizontalIcon"
                    @click.stop="showJobMenu(job, $event)"
                  />
                </div>
              </div>

              <div class="job-company-flex flex-wrap">
                <div class="company-info">
                  <img
                    v-if="job.company?.logo"
                    :src="job.company.logo"
                    :alt="job.company.name"
                    class="company-logo"
                  />
                  <div class="company-details">
                    <span class="company-name">{{ job.company?.name || 'Unknown Company' }}</span>
                    <span class="job-location">MapPinIcon {{ job.location || 'Remote' }}</span>
                  </div>
                </div>
                
                <div class="job-meta">
                  <div v-if="job.salary" class="salary-info">
                    💰 {{ formatSalary(job.salary) }}
                  </div>
                  <div class="posted-date">
                    🕒 {{ formatPostedDate(job.datePosted) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Job Tags & Skills -->
          <div class="job-tags-section">
            <div class="job-tags">
              <UiChip v-if="job.level" classes="level-chip" :variant="getLevelVariant(job.level)">
                {{ job.level }}
              </UiChip>
              <UiChip v-if="job.jobType" classes="type-chip">
                {{ job.jobType }}
              </UiChip>
              <UiChip v-if="job.remote" classes="remote-chip" variant="success">
                Remote OK
              </UiChip>
              <UiChip v-if="gamingFocus && job.gameGenre" classes="genre-chip" variant="gaming">
                {{ job.gameGenre }}
              </UiChip>
            </div>

            <!-- AI Match Score (Gaming Focus) -->
            <div v-if="gamingFocus && job.aiScore" class="ai-score-container">
              <div class="ai-score" :class="getScoreClass(job.aiScore)">
                <AppIcon name="CpuChipIcon" class="ai-icon" />
                <span class="score-value">{{ job.aiScore }}%</span>
                <span class="score-label">Match</span>
              </div>
            </div>
          </div>

          <!-- Job Description Preview -->
          <div class="job-description">
            <p>{{ truncateDescription(job.description) }}</p>
          </div>

          <!-- Skills Section -->
          <div v-if="job.skills?.length" class="job-skills">
            <div class="skills-label">Required Skills:</div>
            <div class="skills-list">
              <UiChip
                v-for="skill in job.skills.slice(0, 5)"
                :key="skill"
                classes="skill-chip"
                size="sm"
              >
                {{ skill }}
              </UiChip>
              <UiChip
                v-if="job.skills.length > 5"
                classes="more-skills-chip"
                size="sm"
                variant="outline"
              >
                +{{ job.skills.length - 5 }} more
              </UiChip>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="job-actions-flex flex-wrap">
            <div class="primary-actions">
              <UnifiedButton
                variant="primary"
                size="md"
                leading-icon="PaperAirplaneIcon"
                @click.stop="$emit('job-applied', job)"
              >
                Quick Apply
              </UnifiedButton>
              
              <UnifiedButton
                variant="outline"
                size="md"
                leading-icon="EyeIcon"
                @click.stop="$emit('job-details', job)"
              >
                View Details
              </UnifiedButton>
            </div>

            <div class="secondary-actions">
              <UnifiedButton
                v-if="gamingFocus"
                variant="gaming"
                size="sm"
                leading-icon="BuildingOffice2Icon"
                @click.stop="viewStudio(job.company)"
              >
                Studio Info
              </UnifiedButton>

              <UnifiedButton
                variant="glass"
                size="sm"
                leading-icon="mdi-scale-balance"
                @click.stop="$emit('add-to-compare', job)"
              >
                Compare
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BuildingOffice2Icon, CpuChipIcon, EyeIcon, PaperAirplaneIcon, ShareIcon } from '@heroicons/vue/24/outline'

import { ref, computed } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Props
interface Props {
  jobs: Array<any>
  loading?: boolean
  gamingFocus?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  loading: false,
  gamingFocus: true
})

// Emits
const emit = defineEmits([
  'job-selected',
  'job-applied',
  'job-saved',
  'job-details',
  'job-shared',
  'add-to-compare',
  'browse-studios'
])

// Methods
const formatSalary = (salary) => {
  if (typeof salary === 'object' && salary.min && salary.max) {
    return `$${formatNumber(salary.min)} - $${formatNumber(salary.max)}`
  }
  if (typeof salary === 'number') {
    return `$${formatNumber(salary)}`
  }
  return salary || 'Not specified'
}

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

const formatPostedDate = (date) => {
  if (!date) return 'Recently'
  
  const now = new Date()
  const posted = new Date(date)
  const diffTime = Math.abs(now - posted)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const truncateDescription = (description) => {
  if (!description) return 'No description available.'
  return description.length > 200 
    ? description.substring(0, 200) + '...'
    : description
}

const getLevelVariant = (level) => {
  const levelMap = {
    'Entry': 'success',
    'Mid': 'primary',
    'Senior': 'warning',
    'Lead': 'error',
    'Principal': 'gaming'
  }
  return levelMap[level] || 'outline'
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 60) return 'score-fair'
  return 'score-low'
}

const viewStudio = (company) => {
  // Navigate to studio page
  emit('studio-selected', company)
}

const showJobMenu = (job, event) => {
  // Show context menu
  console.log('Show job menu for:', job.title)
}
</script>

<style scoped>
.job-results-list {
  width: 100%;
}

.loading-container {
  padding: var(--spacing-4);
}

.loading-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.job-skeleton {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite alternate;
}

.skeleton-header {
  margin-bottom: var(--spacing-3);
}

.skeleton-title {
  height: 1.5rem;
  background: var(--skeleton-bg);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-2);
  width: 70%;
}

.skeleton-company {
  height: 1rem;
  background: var(--skeleton-bg);
  border-radius: var(--radius-sm);
  width: 40%;
}

.skeleton-meta {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.skeleton-tag {
  height: 1.5rem;
  width: 4rem;
  background: var(--skeleton-bg);
  border-radius: var(--radius-full);
}

.skeleton-description {
  height: 3rem;
  background: var(--skeleton-bg);
  border-radius: var(--radius-sm);
}

@keyframes pulse {
  0% { opacity: 1; }
  100% { opacity: 0.4; }
}

.empty-state {
  padding: var(--spacing-8);
  text-align: center;
  border-radius: var(--radius-lg);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
}

.empty-content h3 {
  margin: 0 0 var(--spacing-3) 0;
  color: var(--text-primary-600);
}

.empty-content p {
  margin: 0 0 var(--spacing-5) 0;
  color: var(--text-secondary);
}

.job-list-item {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.job-list-item:hover {
  transform: translateY(-1px);
  border-color: var(--color-gaming-400);
  box-shadow: 0 4px 20px rgba(var(--color-gaming-500-rgb), 0.15);
}

.job-list-item.gaming-highlight {
  border-color: rgba(var(--color-gaming-500-rgb), 0.3);
  background: linear-gradient(135deg, 
    rgba(var(--color-gaming-500-rgb), 0.03) 0%,
    transparent 100%);
}

.job-list-item.featured {
  border-color: var(--color-warning-400);
  background: linear-gradient(135deg, 
    rgba(var(--color-warning-500-rgb), 0.05) 0%,
    transparent 100%);
}

.job-list-item.saved {
  border-color: var(--color-success-400);
}

.job-header {
  margin-bottom: var(--spacing-4);
}

.job-title-flex flex-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
}

.job-title {
  margin: 0;
  color: var(--text-primary-600);
  font-weight: 700;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.featured-badge, .gaming-badge {
  font-size: 1rem;
}

.job-actions {
  display: flex;
  gap: var(--spacing-1);
}

.job-actions :deep(.unified-button.saved) {
  color: var(--color-warning-500);
}

.job-company-flex flex-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.company-logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--surface-elevated);
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.company-name {
  font-weight: 600;
  color: var(--text-primary-600);
}

.job-location {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.job-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.salary-info {
  font-weight: 600;
  color: var(--color-success-600);
}

.job-tags-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.job-tags {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.ai-score-container {
  margin-left: var(--spacing-4);
}

.ai-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1-5) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.score-excellent {
  background: rgba(var(--color-success-500-rgb), 0.15);
  color: var(--color-success-600);
  border-color: rgba(var(--color-success-500-rgb), 0.3);
}

.score-good {
  background: rgba(var(--color-primary-500-rgb), 0.15);
  color: var(--color-primary-600);
  border-color: rgba(var(--color-primary-500-rgb), 0.3);
}

.score-fair {
  background: rgba(var(--color-warning-500-rgb), 0.15);
  color: var(--color-warning-600);
  border-color: rgba(var(--color-warning-500-rgb), 0.3);
}

.score-low {
  background: rgba(var(--color-error-500-rgb), 0.15);
  color: var(--color-error-600);
  border-color: rgba(var(--color-error-500-rgb), 0.3);
}

.ai-icon {
  font-size: 0.875rem;
}

.score-value {
  font-weight: 700;
}

.score-label {
  opacity: 0.8;
}

.job-description {
  margin-bottom: var(--spacing-4);
}

.job-description p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.job-skills {
  margin-bottom: var(--spacing-4);
}

.skills-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-2);
}

.skills-list {
  display: flex;
  gap: var(--spacing-1-5);
  flex-wrap: wrap;
}

.job-actions-flex flex-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.primary-actions, .secondary-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .job-company-flex flex-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .job-meta {
    align-items: flex-start;
  }

  .job-tags-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .ai-score-container {
    margin-left: 0;
  }

  .job-actions-flex flex-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-actions, .secondary-actions {
    justify-content: center;
  }
}

/* Gaming theme enhancements */
:deep(.level-chip) {
  font-weight: 600;
}

:deep(.remote-chip) {
  background: rgba(var(--color-success-500-rgb), 0.15);
  color: var(--color-success-600);
  border: 1px solid rgba(var(--color-success-500-rgb), 0.3);
}

:deep(.genre-chip) {
  background: rgba(var(--color-gaming-500-rgb), 0.15);
  color: var(--color-gaming-400);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.3);
}

:deep(.skill-chip) {
  background: rgba(var(--surface-rgb), 0.8);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  font-size: 0.75rem;
}

:deep(.more-skills-chip) {
  background: transparent;
  color: var(--text-secondary);
  border: 1px dashed var(--border-base);
}
</style>