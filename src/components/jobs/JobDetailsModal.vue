<template>
  <v-dialog
    v-model="internalShow"
    max-width="900"
    scrollable
    persistent
    class="job-details-modal font-sans"
  >
    <v-card v-if="job" class="glass-card">
      <!-- Modal Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <div class="job-header-info">
            <div class="company-logo-section">
              <img
                v-if="job.company?.logo"
                :src="job.company.logo"
                :alt="job.company.name"
                class="company-logo-large"
              />
              <div v-else class="company-logo-placeholder">
                <AppIcon name="BuildingOffice2Icon" />
              </div>
            </div>

            <div class="job-title-section">
              <h2 class="job-title-large">
                {{ job.title }}
                <span v-if="job.featured" class="featured-star">StarIcon</span>
                <span v-if="job.isGaming" class="gaming-controller"
                  >DevicePhoneMobileIcon</span
                >
              </h2>
              <div class="company-location-flex flex-wrap">
                <h3 class="company-name-large">
                  {{ job.company?.name || 'Unknown Company' }}
                </h3>
                <div class="location-info">
                  <AppIcon name="MapPinIcon" />
                  <span>{{ job.location || 'Remote' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <UnifiedButton
              variant="ghost"
              size="sm"
              :leading-icon="
                job.saved ? 'BookmarkIcon' : 'BookmarkIcon-outline'
              "
              :class="{ saved: job.saved }"
              @click="handleSave"
            />
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="ShareIcon"
              @click="handleShare"
            />
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="XMarkIcon"
              @click="closeModal"
            />
          </div>
        </div>

        <!-- Quick Stats Bar -->
        <div class="quick-stats-bar">
          <div v-if="job.salary" class="stat-item">
            <AppIcon name="mdi-currency-usd" class="stat-icon" />
            <span class="stat-label">Salary:</span>
            <span class="stat-value salary-value">{{
              formatSalary(job.salary)
            }}</span>
          </div>

          <div v-if="job.level" class="stat-item">
            <AppIcon name="ArrowTrendingUpIcon" class="stat-icon" />
            <span class="stat-label">Level:</span>
            <span class="stat-value">{{ job.level }}</span>
          </div>

          <div v-if="job.jobType" class="stat-item">
            <AppIcon name="BriefcaseIcon" class="stat-icon" />
            <span class="stat-label">Type:</span>
            <span class="stat-value">{{ job.jobType }}</span>
          </div>

          <div class="stat-item">
            <AppIcon name="ClockIcon" class="stat-icon" />
            <span class="stat-label">Posted:</span>
            <span class="stat-value">{{
              formatPostedDate(job.datePosted)
            }}</span>
          </div>

          <!-- AI Match Score for Gaming Jobs -->
          <div
            v-if="job.isGaming && job.aiScore"
            class="stat-item ai-score-stat"
          >
            <AppIcon name="CpuChipIcon" class="stat-icon ai-icon" />
            <span class="stat-label">AI Match:</span>
            <span
              class="stat-value score-value"
              :class="getScoreClass(job.aiScore)"
            >
              {{ job.aiScore }}%
            </span>
          </div>
        </div>
      </v-card-title>

      <!-- Modal Content -->
      <v-card-text class="modal-content">
        <div class="content-grid">
          <!-- Main Content Column -->
          <div class="main-content">
            <!-- Job Description -->
            <section class="content-section">
              <h4 class="section-title">
                <AppIcon name="mdi-text-box-outline" />
                Job Description
              </h4>
              <div
                class="job-description-full"
                v-html="formatDescription(job.description)"
              ></div>
            </section>

            <!-- Requirements -->
            <section v-if="job.requirements?.length" class="content-section">
              <h4 class="section-title">
                <AppIcon name="CheckIconlist" />
                Requirements
              </h4>
              <ul class="requirements-list">
                <li v-for="req in job.requirements" :key="req">{{ req }}</li>
              </ul>
            </section>

            <!-- Responsibilities -->
            <section
              v-if="job.responsibilities?.length"
              class="content-section"
            >
              <h4 class="section-title">
                <AppIcon name="UserIcon-tie" />
                Responsibilities
              </h4>
              <ul class="responsibilities-list">
                <li v-for="resp in job.responsibilities" :key="resp">
                  {{ resp }}
                </li>
              </ul>
            </section>

            <!-- Gaming-Specific Info -->
            <section v-if="job.isGaming" class="content-section gaming-section">
              <h4 class="section-title gaming-title">
                <AppIcon name="PuzzlePieceIcon" />
                Gaming Industry Details
              </h4>

              <div class="gaming-details-grid">
                <div v-if="job.gameGenre" class="gaming-detail">
                  <strong>Game Genre:</strong> {{ job.gameGenre }}
                </div>
                <div v-if="job.platform" class="gaming-detail">
                  <strong>Platform:</strong> {{ job.platform }}
                </div>
                <div v-if="job.engine" class="gaming-detail">
                  <strong>Game Engine:</strong> {{ job.engine }}
                </div>
                <div v-if="job.studioSize" class="gaming-detail">
                  <strong>Studio Size:</strong> {{ job.studioSize }}
                </div>
                <div v-if="job.projectType" class="gaming-detail">
                  <strong>Project Type:</strong> {{ job.projectType }}
                </div>
                <div v-if="job.experience" class="gaming-detail">
                  <strong>Experience:</strong> {{ job.experience }}
                </div>
              </div>

              <!-- Recent Projects -->
              <div v-if="job.recentProjects?.length" class="recent-projects">
                <h5>Recent Studio Projects:</h5>
                <div class="projects-list">
                  <UiChip
                    v-for="project in job.recentProjects"
                    :key="project"
                    classes="project-chip"
                    variant="gaming"
                  >
                    {{ project }}
                  </UiChip>
                </div>
              </div>
            </section>

            <!-- Benefits -->
            <section v-if="job.benefits?.length" class="content-section">
              <h4 class="section-title">
                <AppIcon name="mdi-gift" />
                Benefits & Perks
              </h4>
              <div class="benefits-grid">
                <div
                  v-for="benefit in job.benefits"
                  :key="benefit"
                  class="benefit-item"
                >
                  <AppIcon
                    :name="getBenefitIcon(benefit)"
                    class="benefit-icon"
                  />
                  <span>{{ benefit }}</span>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="sidebar-content">
            <!-- Skills Required -->
            <section class="sidebar-section">
              <h4 class="sidebar-title">
                <AppIcon name="StarIcon" />
                Required Skills
              </h4>
              <div class="skills-cloud">
                <UiChip
                  v-for="skill in job.skills"
                  :key="skill"
                  classes="skill-chip-large"
                  :variant="getSkillVariant(skill)"
                >
                  {{ skill }}
                </UiChip>
              </div>
            </section>

            <!-- Company Info -->
            <section class="sidebar-section">
              <h4 class="sidebar-title">
                <AppIcon name="BuildingOffice2Icon" />
                About {{ job.company?.name }}
              </h4>

              <div v-if="job.company" class="company-stats">
                <div class="company-stat">
                  <span class="stat-label">Size:</span>
                  <span class="stat-value">{{
                    job.company.size || 'Unknown'
                  }}</span>
                </div>
                <div class="company-stat">
                  <span class="stat-label">Industry:</span>
                  <span class="stat-value">{{
                    job.company.industry || 'Gaming'
                  }}</span>
                </div>
                <div class="company-stat">
                  <span class="stat-label">Founded:</span>
                  <span class="stat-value">{{
                    job.company.founded || 'Unknown'
                  }}</span>
                </div>
              </div>

              <p v-if="job.company?.description" class="company-description">
                {{ job.company.description }}
              </p>

              <UnifiedButton
                v-if="job.isGaming"
                variant="gaming"
                size="sm"
                leading-icon="BuildingOffice2Icon"
                class="view-studio-btn"
                @click="viewStudio"
              >
                View Studio Profile
              </UnifiedButton>
            </section>

            <!-- Application Stats -->
            <section class="sidebar-section">
              <h4 class="sidebar-title">
                <AppIcon name="ChartBarIcon" />
                Application Stats
              </h4>

              <div class="app-stats">
                <div class="app-stat">
                  <span class="stat-number">{{ job.applicants || 0 }}</span>
                  <span class="stat-label">Applicants</span>
                </div>
                <div class="app-stat">
                  <span class="stat-number">{{ job.views || 0 }}</span>
                  <span class="stat-label">Views</span>
                </div>
              </div>

              <div v-if="job.urgent" class="urgency-indicator">
                <AppIcon name="FireIcon" class="urgent-icon" />
                <span>Urgent Hiring</span>
              </div>
            </section>

            <!-- Similar Jobs -->
            <section v-if="similarJobs?.length" class="sidebar-section">
              <h4 class="sidebar-title">
                <AppIcon name="mdi-similarity" />
                Similar Gaming Jobs
              </h4>

              <div class="similar-jobs-list">
                <div
                  v-for="similarJob in similarJobs.slice(0, 3)"
                  :key="similarJob.id"
                  class="similar-job-item"
                  @click="$emit('job-selected', similarJob)"
                >
                  <div class="similar-job-title">{{ similarJob.title }}</div>
                  <div class="similar-job-company">
                    {{ similarJob.company?.name }}
                  </div>
                  <div class="similar-job-location">
                    MapPinIcon {{ similarJob.location }}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </v-card-text>

      <!-- Modal Actions -->
      <v-card-actions class="modal-actions">
        <div class="actions-left">
          <UnifiedButton
            variant="outline"
            leading-icon="mdi-scale-balance"
            @click="handleCompare"
          >
            Add to Compare
          </UnifiedButton>

          <UnifiedButton
            variant="glass"
            leading-icon="BellIcon"
            @click="handleAlert"
          >
            Set Alert
          </UnifiedButton>
        </div>

        <div class="actions-right">
          <UnifiedButton variant="secondary" @click="closeModal">
            Close
          </UnifiedButton>

          <UnifiedButton
            variant="primary"
            size="lg"
            leading-icon="PaperAirplaneIcon"
            :loading="applying"
            @click="handleApply"
          >
            {{ applying ? 'Applying...' : 'Quick Apply' }}
          </UnifiedButton>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  ArrowTrendingUpIcon,
  BellIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon,
  PaperAirplaneIcon,
  PuzzlePieceIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { MapPinIcon, StarIcon } from '@heroicons/vue/24/solid'

import { ref, computed, watch } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { toastService } from '@/shared/services/toastService'

// Props
interface Props {
  show: boolean
  job: any | null
  similarJobs?: Array<any>
}

const _props = withDefaults(defineProps<Props>(), {
  show: false,
  job: null,
  similarJobs: () => [],
})

// Emits
const emit = defineEmits([
  'update:show',
  'job-applied',
  'job-saved',
  'job-selected',
  'studio-selected',
])

// State
const applying = ref(false)

// Computed
const internalShow = computed({
  get: () => _props.show,
  set: value => emit('update:show', value),
})

// Methods
const closeModal = () => {
  internalShow.value = false
}

const handleApply = async () => {
  if (!_props.job) return

  applying.value = true
  try {
    // Simulate application process
    await new Promise(resolve => setTimeout(resolve, 2000))

    emit('job-applied', _props.job)
    toastService.success(`Application submitted for ${_props.job.title}!`)
    closeModal()
  } catch (error) {
    toastService.error('Application failed: ' + error.message)
  } finally {
    applying.value = false
  }
}

const handleSave = () => {
  if (!_props.job) return

  emit('job-saved', _props.job)
  const message = _props.job.saved ? 'Job removed from saved' : 'Job saved!'
  toastService.success(message)
}

const handleShare = () => {
  if (!_props.job) return

  if (navigator.share) {
    navigator.share({
      title: _props.job.title,
      text: `Check out this gaming job: ${_props.job.title} at ${_props.job.company?.name}`,
      url: window.location.href,
    })
  } else {
    // Fallback: copy to clipboard
    const text = `${_props.job.title} at ${_props.job.company?.name} - ${window.location.href}`
    navigator.clipboard.writeText(text)
    toastService.success('Job link copied to clipboard!')
  }
}

const handleCompare = () => {
  if (!_props.job) return
  toastService.info('Job added to comparison (feature coming soon)')
}

const handleAlert = () => {
  if (!_props.job) return
  toastService.info('Job alert created (feature coming soon)')
}

const viewStudio = () => {
  if (!_props.job?.company) return
  emit('studio-selected', _props.job.company)
}

// Formatting functions
const formatSalary = salary => {
  if (typeof salary === 'object' && salary.min && salary.max) {
    return `$${formatNumber(salary.min)} - $${formatNumber(salary.max)}`
  }
  if (typeof salary === 'number') {
    return `$${formatNumber(salary)}`
  }
  return salary || 'Not specified'
}

const formatNumber = num => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

const formatPostedDate = date => {
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

const formatDescription = description => {
  if (!description) return '<p>No description available.</p>'

  // Convert line breaks to paragraphs
  return (
    '<p>' +
    description.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') +
    '</p>'
  )
}

const getScoreClass = score => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'low'
}

const getBenefitIcon = benefit => {
  const iconMap = {
    'Health Insurance': 'HeartIcon',
    Dental: 'mdi-tooth',
    Vision: 'EyeIcon',
    '401k': 'mdi-bank',
    'Stock Options': 'ChartBarIcon-line',
    'Remote Work': 'HomeIcon',
    'Flexible Hours': 'ClockIcon',
    'Unlimited PTO': 'CalendarIcon',
    'Game Library': 'DevicePhoneMobileIcon-variant',
    'Free Lunch': 'mdi-food',
    Gym: 'mdi-dumbbell',
    'Conference Budget': 'mdi-school',
  }

  // Find partial matches
  for (const [key, icon] of Object.entries(iconMap)) {
    if (benefit.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }

  return 'CheckIcon-circle'
}

const getSkillVariant = skill => {
  const gamingSkills = [
    'Unity',
    'Unreal',
    'C#',
    'C++',
    'Game Design',
    'Animation',
    '3D Modeling',
  ]
  return gamingSkills.includes(skill) ? 'gaming' : 'outline'
}
</script>

<style scoped>
.job-details-modal :deep(.v-dialog) {
  border-radius: var(--radius-xl) !important;
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  max-height: 90vh;
}

.modal-header {
  padding: var(--spacing-6);
  border-b: 1px solid var(--border-light);
  background: linear-gradient(
    135deg,
    rgba(var(--color-gaming-500-rgb), 0.05) 0%,
    transparent 100%
  );
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: var(--spacing-4);
}

.job-header-info {
  display: flex;
  gap: var(--spacing-4);
  flex: 1;
}

.company-logo-section {
  flex-shrink: 0;
}

.company-logo-large {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.company-logo-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 1.5rem;
}

.job-title-section {
  flex: 1;
}

.job-title-large {
  margin: 0 0 var(--spacing-2) 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.featured-star,
.gaming-controller {
  font-size: 1.25rem;
}

.company-location-flex flex-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.company-name-large {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gaming-400);
}

.location-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-2);
}

.header-actions :deep(.unified-button.saved) {
  color: var(--color-warning-500);
}

.quick-stats-bar {
  display: flex;
  gap: var(--spacing-6);
  flex-wrap: wrap;
  padding: var(--spacing-4);
  background: rgba(var(--surface-rgb), 0.5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
}

.stat-icon {
  color: var(--text-secondary);
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  color: var(--text-primary-600);
  font-weight: 600;
}

.salary-value {
  color: var(--color-success-600);
}

.ai-score-stat .ai-icon {
  color: var(--color-gaming-400);
}

.score-value.excellent {
  color: var(--color-success-600);
}

.score-value.good {
  color: var(--color-primary-600);
}

.score-value.fair {
  color: var(--color-warning-600);
}

.score-value.low {
  color: var(--color-error-600);
}

.modal-content {
  padding: var(--spacing-6);
  max-height: 60vh;
  overflow-y: auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-8);
}

.content-section,
.sidebar-section {
  margin-bottom: var(--spacing-6);
}

.section-title,
.sidebar-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0 0 var(--spacing-4) 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary-600);
}

.gaming-title {
  color: var(--color-gaming-400);
}

.job-description-full {
  color: var(--text-secondary);
  line-height: 1.7;
}

.job-description-full :deep(p) {
  margin-bottom: var(--spacing-3);
}

.requirements-list,
.responsibilities-list {
  padding-left: var(--spacing-4);
  color: var(--text-secondary);
}

.requirements-list li,
.responsibilities-list li {
  margin-bottom: var(--spacing-2);
  line-height: 1.6;
}

.gaming-section {
  background: linear-gradient(
    135deg,
    rgba(var(--color-gaming-500-rgb), 0.03) 0%,
    transparent 100%
  );
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.2);
}

.gaming-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.gaming-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.gaming-detail strong {
  color: var(--text-primary-600);
  font-weight: 600;
}

.recent-projects h5 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-primary-600);
}

.projects-list {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-3);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background: rgba(var(--surface-rgb), 0.5);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.benefit-icon {
  color: var(--color-success-500);
}

.skills-cloud {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.company-stats {
  margin-bottom: var(--spacing-4);
}

.company-stat {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-2) 0;
  border-b: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.company-stat:last-child {
  border-b: none;
}

.company-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-4);
  font-size: 0.875rem;
}

.view-studio-btn {
  width: 100%;
}

.app-stats {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.app-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-3);
  background: rgba(var(--surface-rgb), 0.5);
  border-radius: var(--radius-md);
  flex: 1;
}

.app-stat .stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gaming-400);
}

.app-stat .stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.urgency-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: rgba(var(--color-error-500-rgb), 0.1);
  color: var(--color-error-600);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-error-500-rgb), 0.3);
  font-size: 0.875rem;
  font-weight: 600;
}

.urgent-icon {
  color: var(--color-error-500);
}

.similar-jobs-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.similar-job-item {
  padding: var(--spacing-3);
  background: rgba(var(--surface-rgb), 0.3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.similar-job-item:hover {
  border-color: var(--color-gaming-400);
  background: rgba(var(--color-gaming-500-rgb), 0.05);
}

.similar-job-title {
  font-weight: 600;
  color: var(--text-primary-600);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-1);
}

.similar-job-company,
.similar-job-location {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.modal-actions {
  padding: var(--spacing-6);
  border-t: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-left,
.actions-right {
  display: flex;
  gap: var(--spacing-3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .job-header-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .quick-stats-bar {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .modal-actions {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .actions-left,
  .actions-right {
    width: 100%;
    justify-content: center;
  }
}

/* Theme enhancements */
:deep(.project-chip) {
  background: rgba(var(--color-gaming-500-rgb), 0.15);
  color: var(--color-gaming-400);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.3);
}

:deep(.skill-chip-large) {
  font-weight: 500;
}

:deep(.skill-chip-large.gaming) {
  background: rgba(var(--color-gaming-500-rgb), 0.15);
  color: var(--color-gaming-400);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.3);
}
</style>
