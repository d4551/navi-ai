<template>
  <div
    class="job-details-view font-sans"
    :class="{ 'sidebar-view': isSidebarView }"
  >
    <div v-if="job" class="job-details-content">
      <!-- Job Header -->
      <div class="job-header glass-card section-card">
        <div class="job-header-main">
          <div class="job-company-info">
            <div v-if="job.company?.logo" class="company-logo">
              <img :src="job.company.logo" :alt="`${job.company.name} logo`" />
            </div>
            <div v-else class="company-logo-placeholder">
              <AppIcon name="BuildingOfficeIcon" />
            </div>
            <div class="job-title-section">
              <h1 class="job-title">
                {{ job.title }}
                <span
                  v-if="job.matchScore !== undefined && job.matchScore !== null"
                  class="match-badge match-badge-sm ml-2 align-middle"
                  :class="getMatchBadgeClass(job.matchScore)"
                  title="Match score"
                  aria-label="Match score"
                >
                  <AppIcon
                    name="CursorArrowRaysIcon-variant"
                    class="mr-1"
                    aria-hidden="true"
                  />
                  <span class="match-pct"
                    >{{ Math.round(job.matchScore) }}%</span
                  >
                </span>
              </h1>
              <div class="company-details">
                <h2 class="company-name">
                  {{ job.company?.name || job.company }}
                </h2>
                <div class="job-meta">
                  <span v-if="job.location" class="job-location">
                    <AppIcon name="MapPinIcon" />
                    {{ job.location }}
                  </span>
                  <span v-if="job.remote" class="job-remote">
                    <AppIcon name="HomeIcon-variant" />
                    Remote
                  </span>
                  <span v-if="job.type" class="job-type">
                    <AppIcon name="ClockIcon" />
                    {{ formatJobType(job.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="job-actions">
            <div class="action-buttons">
              <UnifiedButton
                variant="outline"
                :leading-icon="isSaved ? 'HeartIcon' : 'HeartIcon-outline'"
                :class="{ active: isSaved }"
                @click="toggleSaved"
              >
                {{ isSaved ? 'Saved' : 'Save' }}
              </UnifiedButton>
              <UnifiedButton
                variant="primary"
                :disabled="isApplying"
                :loading="isApplying"
                leading-icon="PaperAirplaneIcon"
                @click="applyToJob"
              >
                {{ isApplying ? 'Applying...' : 'Apply Now' }}
              </UnifiedButton>
            </div>
          </div>
        </div>

        <!-- Job Tags -->
        <div v-if="job.tags && job.tags.length > 0" class="job-tags">
          <span
            v-for="tag in job.tags.slice(0, 8)"
            :key="tag"
            class="job-tag"
            :class="getTagClass(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Job Details Grid -->
      <div class="job-details-grid split-layout--main-sidebar">
        <!-- Main Content -->
        <div class="job-main-content v-main">
          <!-- Description -->
          <section class="job-section">
            <h3 class="section-title">
              <AppIcon name="mdi-text-box-outline" />
              Job Description
            </h3>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              class="job-description"
              v-html="formatDescription(job.description)"
            ></div>
          </section>

          <!-- Requirements -->
          <section
            v-if="job.requirements && job.requirements.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="CheckIcon-circle-outline-outline" />
              Requirements
            </h3>
            <ul class="requirements-list">
              <li v-for="requirement in job.requirements" :key="requirement">
                {{ requirement }}
              </li>
            </ul>
          </section>

          <!-- Skills & Technologies -->
          <section
            v-if="job.skills && job.skills.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="mdi-cog-outline" />
              Required Skills
            </h3>
            <div class="skills-grid compact-grid">
              <span
                v-for="skill in job.skills"
                :key="skill"
                class="skill-badge"
                :class="getSkillLevel(skill)"
              >
                {{ skill }}
              </span>
            </div>
          </section>

          <!-- Game Engines -->
          <section
            v-if="job.engines && job.engines.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="DevicePhoneMobileIcon-variant-outline" />
              Game Engines
            </h3>
            <div class="engines-grid compact-grid">
              <span
                v-for="engine in job.engines"
                :key="engine"
                class="engine-badge"
              >
                <AppIcon :name="getEngineIcon(engine)" />
                {{ engine }}
              </span>
            </div>
          </section>

          <!-- Benefits -->
          <section
            v-if="job.benefits && job.benefits.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="mdi-gift-outline" />
              Benefits & Perks
            </h3>
            <div class="benefits-grid tool-grid">
              <div
                v-for="benefit in job.benefits"
                :key="benefit"
                class="benefit-item"
              >
                <AppIcon name="CheckCircleIcon" context="success" />
                <span>{{ benefit }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="job-sidebar">
          <!-- Quick Info Card -->
          <div class="info-card glass-card section-card">
            <h4 class="card-title">Job Information</h4>
            <div class="info-list">
              <div v-if="job.experience" class="info-item">
                <span class="info-label">Experience Level</span>
                <span class="info-value">{{
                  formatExperience(job.experience)
                }}</span>
              </div>
              <div v-if="job.salary" class="info-item">
                <span class="info-label">Salary Range</span>
                <span class="info-value">{{ formatSalary(job.salary) }}</span>
              </div>
              <div v-if="job.posted" class="info-item">
                <span class="info-label">Posted</span>
                <span class="info-value">{{ formatDate(job.posted) }}</span>
              </div>
              <div v-if="job.applicants" class="info-item">
                <span class="info-label">Applicants</span>
                <span class="info-value">{{ job.applicants }} candidates</span>
              </div>
            </div>
          </div>

          <!-- Company Card -->
          <div
            v-if="job.company && typeof job.company === 'object'"
            class="company-card glass-card section-card"
          >
            <h4 class="card-title">About {{ job.company.name }}</h4>
            <div class="company-info">
              <p v-if="job.company.description" class="company-description">
                {{ job.company.description }}
              </p>
              <div class="company-stats">
                <div v-if="job.company.size" class="stat-item">
                  <AppIcon name="UsersIcon" />
                  <span>{{ job.company.size }}</span>
                </div>
                <div v-if="job.company.founded" class="stat-item">
                  <AppIcon name="CalendarIcon" />
                  <span>Founded {{ job.company.founded }}</span>
                </div>
                <div v-if="job.company.website" class="stat-item">
                  <AppIcon name="GlobeAltIcon" />
                  <a :href="job.company.website" target="_blank" rel="noopener">
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Similar Jobs -->
          <div
            v-if="similarJobs.length > 0"
            class="similar-jobs-card glass-card section-card"
          >
            <h4 class="card-title">Similar Jobs</h4>
            <div class="similar-jobs-list">
              <div
                v-for="similarJob in similarJobs.slice(0, 3)"
                :key="similarJob.id"
                class="similar-job-item"
                @click="$emit('select-job', similarJob)"
              >
                <div class="similar-job-title">{{ similarJob.title }}</div>
                <div class="similar-job-company">
                  {{ similarJob.company?.name || similarJob.company }}
                </div>
                <div class="similar-job-location">
                  {{ similarJob.location }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <AppIcon name="mdi-briefcase-search-outline" />
      <h3>Select a job to view details</h3>
      <p>
        Choose a job from the list to see detailed information, requirements,
        and application options.
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'
import { MapPinIcon } from '@heroicons/vue/24/solid'

import { ref, watch, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const _props = defineProps({
  job: {
    type: Object,
    default: null,
  },
  similarJobs: {
    type: Array,
    default: () => [],
  },
  isSidebarView: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-job', 'save-job', 'apply-job'])

// Reactive state
const isSaved = ref(false)

function getMatchBadgeClass(score) {
  const s = Number(score) || 0
  if (s >= 90) return 'match-excellent'
  if (s >= 80) return 'match-very-good'
  if (s >= 70) return 'match-good'
  if (s >= 60) return 'match-fair'
  return 'match-poor'
}
const isApplying = ref(false)

// Methods
const toggleSaved = () => {
  isSaved.value = !isSaved.value
  emit('save-job', { job: props.job, saved: isSaved.value })
}

const applyToJob = async () => {
  isApplying.value = true
  try {
    emit('apply-job', props.job)
  } finally {
    setTimeout(() => {
      isApplying.value = false
    }, 2000)
  }
}

const formatJobType = type => {
  const typeMap = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  }
  return typeMap[type] || type
}

const formatExperience = experience => {
  const expMap = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level',
    lead: 'Lead',
    principal: 'Principal',
  }
  return expMap[experience] || experience
}

const formatSalary = salary => {
  if (typeof salary === 'object') {
    const { min, max, currency = 'USD' } = salary
    const symbol =
      currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency
    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`
    }
  }
  return salary
}

const formatDate = date => {
  if (!date) {
    return ''
  }
  const now = new Date()
  const postDate = new Date(date)
  const diffDays = Math.floor((now - postDate) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  }
  if (diffDays === 1) {
    return '1 day ago'
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`
  }
  return `${Math.floor(diffDays / 30)} months ago`
}

const formatDescription = description => {
  if (!description) {
    return ''
  }
  // Simple HTML formatting for line breaks
  return description
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

const getTagClass = tag => {
  const gamingTags = ['unity', 'unreal', 'gamedev', 'gaming', 'game']
  const skillTags = ['javascript', 'python', 'c#', 'react', 'vue']

  if (gamingTags.some(t => tag.toLowerCase().includes(t))) {
    return 'tag-gaming'
  }
  if (skillTags.some(t => tag.toLowerCase().includes(t))) {
    return 'tag-skill'
  }
  return 'tag-default'
}

const getSkillLevel = skill => {
  // Simple skill level detection based on common patterns
  const advanced = ['senior', 'expert', 'lead', 'architect']
  const intermediate = ['mid', 'intermediate', 'experienced']

  if (advanced.some(level => skill.toLowerCase().includes(level))) {
    return 'skill-advanced'
  }
  if (intermediate.some(level => skill.toLowerCase().includes(level))) {
    return 'skill-intermediate'
  }
  return 'skill-basic'
}

const getEngineIcon = engine => {
  const iconMap = {
    unity: 'mdi-unity',
    unreal: 'mdi-unity', // Using unity icon as fallback
    godot: 'DevicePhoneMobileIcon-variant',
    construct: 'mdi-puzzle',
  }
  return iconMap[engine.toLowerCase()] || 'mdi-cog'
}

// Watch for job changes to reset state
watch(
  () => props.job,
  newJob => {
    if (newJob) {
      // Check if job is already saved (would normally check against saved jobs list)
      isSaved.value = false
      isApplying.value = false
    }
  }
)
</script>

<style scoped>
.job-details-view {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.job-details-view.sidebar-view {
  padding: 0.5rem;
}

/* Job Header */
.job-header {
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.job-header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.job-company-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.company-logo,
.company-logo-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--glass-surface, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder i {
  font-size: 2rem;
  color: var(--text-secondary);
}

.job-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary-600);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.job-meta i {
  font-size: 1rem;
}

/* Job Actions */
.job-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

/* match score pill used next to title; legacy circle removed for consistency */

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-buttons .btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-buttons .btn.active {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: var(--text-inverse);
}

/* Job Tags */
.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.job-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
}

.job-tag.tag-gaming {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  color: var(--color-primary);
}

.job-tag.tag-skill {
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  color: var(--color-success);
}

/* Job Details Grid */
.job-details-grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

/* Job Sections */
.job-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--glass-surface);
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: 1rem;
}

.section-title i {
  color: var(--color-primary);
}

.job-description {
  line-height: 1.6;
  color: var(--text-secondary);
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: var(--text-secondary);
  line-height: 1.5;
}

.requirements-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: bold;
}

/* Skills & Engines */
.skills-grid,
.engines-grid {
  display: grid;
  gap: 0.75rem;
}

.skill-badge,
.engine-badge {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  color: var(--text-primary-600);
  transition: all 0.2s ease;
}

.skill-badge:hover,
.engine-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skill-badge.skill-advanced {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.skill-badge.skill-intermediate {
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.skill-badge.skill-basic {
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  border-color: var(--color-success);
  color: var(--color-success);
}

.engine-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Benefits */
.benefits-grid {
  display: grid;
  gap: 0.75rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.benefit-icon {
  color: var(--color-success);
  font-size: 1.1rem;
}

/* Sidebar Cards */
.info-card,
.company-card,
.similar-jobs-card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: 1rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-b: 1px solid var(--glass-border);
}

.info-item:last-child {
  border-b: none;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.info-value {
  font-weight: 500;
  color: var(--text-primary-600);
  text-align: right;
}

/* Company Info */
.company-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.company-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-item a {
  color: var(--color-primary);
  text-decoration: none;
}

.stat-item a:hover {
  text-decoration: underline;
}

/* Similar Jobs */
.similar-jobs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.similar-job-item {
  padding: 0.75rem;
  background: var(--glass-elevated);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.similar-job-item:hover {
  border-color: var(--color-primary);
  transform: translateX(2px);
}

.similar-job-title {
  font-weight: 500;
  color: var(--text-primary-600);
  margin-bottom: 0.25rem;
}

.similar-job-company,
.similar-job-location {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  /* Grid utility handles responsive behavior */

  .job-header {
    padding: 1.5rem;
  }

  .job-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .job-header-main {
    flex-direction: column;
    gap: 1.5rem;
  }

  .job-actions {
    width: 100%;
    flex-direction: flex flex-wrap;
    justify-content: space-between;
    align-items: center;
  }

  .action-buttons {
    flex: 1;
    justify-content: flex-end;
  }

  .job-company-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .job-title {
    font-size: 1.5rem;
  }

  /* Grid utilities handle responsive behavior */

  .job-section {
    padding: 1rem;
  }
}

/* Dark theme support */
[data-theme='dark'] .job-description,
[data-theme='dark'] .requirements-list li,
[data-theme='dark'] .company-description {
  color: var(--text-secondary);
}

[data-theme='dark'] .match-score-circle::before {
  background: var(--glass-surface);
}
</style>
