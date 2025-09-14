<template>
  <article 
    class="enhanced-job-card glass-card"
    :class="{ 'top-match': isTopMatch, 'has-insights': hasAIInsights }"
    tabindex="0"
    role="article"
    @click="$emit('select', job)"
    @keydown.enter="$emit('select', job)"
    @keydown.space.prevent="$emit('select', job)"
  >
    <!-- Top Match Ribbon -->
    <div v-if="isTopMatch" class="top-match-ribbon">
      TOP MATCH
    </div>

    <!-- Main Content -->
    <div class="job-card-content">
      <!-- Header Section -->
      <header class="job-header">
        <!-- Badge Row -->
        <div class="badge-row">
          <div class="time-badge">
            <AppIcon name="mdi-fire" />
            <span>{{ timeText }} • {{ timeBadgeText }}</span>
          </div>
          <div 
            v-if="job.matchScore !== undefined" 
            class="match-score" 
            :style="{ '--match': job.matchScore }"
            :title="`${Math.round(job.matchScore)}% match`"
          >
            <div class="match-score-inner">
              <span class="match-percentage">{{ Math.round(job.matchScore) }}%</span>
              <span class="match-label">Match</span>
            </div>
          </div>
        </div>

        <!-- Main Header Content -->
        <div class="header-content">
          <div class="company-logo" :style="{ backgroundColor: companyColorHex }">
            <img v-if="job.company?.logo" :src="job.company.logo" :alt="`${companyName} logo`" />
            <span v-else class="logo-text">{{ companyInitial }}</span>
          </div>
        
          <div class="job-info">
            <h3 class="job-title">{{ job.title }}</h3>
            <div class="company-line">
              <span class="company-name">{{ companyName }}</span>
              <div v-if="job.company?.verified" class="verified-badge">
                <AppIcon name="mdi-check-circle" />
                Verified
              </div>
            </div>
            <div class="location-line">
              <AppIcon name="mdi-map-marker" />
              <span>{{ locationText }}</span>
            </div>
          </div>
        </div>
      
        <!-- Action Buttons -->
        <div class="header-actions">
          <UnifiedButton 
            variant="primary" 
            size="sm"
            :disabled="isApplying"
            :loading="isApplying"
            leading-icon="mdi-send"
            @click.stop="handleApply"
          >
            {{ isApplying ? 'Applying...' : 'Apply Now' }}
          </UnifiedButton>
          <button 
            class="btn-icon control-btn" 
            :class="{ saved: isSaved }"
            :title="isSaved ? 'Saved' : 'Save job'"
            @click.stop="handleSave"
          >
            <AppIcon :name="isSaved ? 'mdi-bookmark' : 'mdi-bookmark-outline'" />
          </button>
          <button 
            class="btn-icon control-btn" 
            title="View details"
            @click.stop="$emit('view-details', job)"
          >
            <AppIcon name="mdi-eye" />
          </button>
        </div>
      </header>

      <!-- Metrics Section -->
      <div v-if="showMetrics" class="job-metrics">
        <div class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-briefcase" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Type</span>
            <span class="metric-value">{{ formatJobType(job.type) }}</span>
          </div>
        </div>
        <div v-if="job.salary" class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-currency-usd" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Salary</span>
            <span class="metric-value">{{ formatSalary(job.salary) }}</span>
          </div>
        </div>
        <div v-if="job.duration" class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-calendar-range" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Duration</span>
            <span class="metric-value">{{ job.duration }}</span>
          </div>
        </div>
        <div v-if="job.applicants" class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-account-group" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Applicants</span>
            <span class="metric-value">{{ job.applicants }} applied</span>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="job-description">
        <p 
          class="description-text" 
          :class="{ 'description-expanded': isDescriptionExpanded }"
        >
          {{ job.description || job.summary || 'No description available.' }}
        </p>
        <button 
          v-if="shouldShowReadMore"
          class="read-more"
          @click.stop="toggleDescription"
        >
          {{ isDescriptionExpanded ? 'Show less ←' : 'Read more →' }}
        </button>
      </div>

      <!-- Skills Section -->
      <div v-if="displaySkills.length > 0" class="skills-section">
        <span 
          v-for="skill in displaySkills" 
          :key="skill" 
          class="skill-tag"
          :class="getSkillClass(skill)"
        >
          {{ skill }}
        </span>
      </div>

      <!-- AI Insights Panel -->
      <div 
        v-if="hasAIInsights" 
        class="ai-insights"
        :class="{ 'insights-expanded': isInsightsExpanded }"
      >
        <header class="insights-header" @click.stop="toggleInsights">
          <div class="insights-title">
            <AppIcon name="mdi-brain" />
            AI Career Insights
          </div>
          <div class="insights-controls">
            <span class="insights-badge">{{ aiInsights.length }} insights</span>
            <AppIcon 
              name="mdi-chevron-down" 
              class="expand-icon"
              :class="{ expanded: isInsightsExpanded }"
            />
          </div>
        </header>
        <div class="insights-content">
          <div class="insight-items">
            <div 
              v-for="(insight, index) in aiInsights" 
              :key="index" 
              class="insight-item"
            >
              <div class="insight-icon" :style="{ color: insight.color }">
                {{ insight.icon }}
              </div>
              <span class="insight-text">{{ insight.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="job-footer">
      <div class="source-info">
        <AppIcon name="mdi-source-branch" />
        via {{ job.source || 'Direct' }} 
        <span v-if="job.company?.ats">({{ job.company.ats }})</span>
      </div>
      <div class="footer-actions">
        <button 
          class="footer-btn control-btn" 
          title="Add to compare"
          @click.stop="$emit('add-to-compare', job)"
        >
          <AppIcon name="mdi-compare" />
        </button>
        <button 
          class="footer-btn control-btn" 
          title="Share"
          @click.stop="$emit('share', job)"
        >
          <AppIcon name="mdi-share-variant" />
        </button>
        <button 
          class="footer-btn control-btn" 
          title="Report"
          @click.stop="$emit('report', job)"
        >
          <AppIcon name="mdi-flag-outline" />
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const _props = defineProps({
  job: {
    type: Object,
    required: true
  },
  showMetrics: {
    type: Boolean,
    default: true
  },
  maxSkills: {
    type: Number,
    default: 6
  },
  aiInsights: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'select',
  'apply',
  'save',
  'view-details', 
  'add-to-compare',
  'share',
  'report'
])

// State
const isSaved = ref(false)
const isApplying = ref(false)
const isDescriptionExpanded = ref(false)
const isInsightsExpanded = ref(false)

// Computed
const isTopMatch = computed(() => 
  props.job.matchScore !== undefined && props.job.matchScore >= 85
)

const hasAIInsights = computed(() => 
  props.aiInsights && props.aiInsights.length > 0
)

const companyName = computed(() => 
  typeof props.job.company === 'object' 
    ? props.job.company.name 
    : props.job.company || 'Unknown Company'
)

const companyInitial = computed(() => 
  companyName.value.charAt(0).toUpperCase()
)

const companyColorHex = computed(() => {
  // Generate a consistent color based on company name
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ]
  const hash = companyName.value.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
})

const locationText = computed(() => {
  const parts = []
  if (props.job.location) parts.push(props.job.location)
  if (props.job.remote) parts.push('Remote')
  return parts.join(', ') || 'Location not specified'
})

const timeText = computed(() => {
  if (!props.job.posted) return 'NEW'
  const now = new Date()
  const postDate = new Date(props.job.posted)
  const diffHours = Math.floor((now - postDate) / (1000 * 60 * 60))
  
  if (diffHours < 1) return 'NEW'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
})

const timeBadgeText = computed(() => {
  if (timeText.value === 'NEW') return 'JUST POSTED'
  return timeText.value.includes('h') ? 'TODAY' : 'RECENT'
})

const displaySkills = computed(() => {
  const skills = props.job.skills || props.job.tags || []
  return skills.slice(0, props.maxSkills)
})

const shouldShowReadMore = computed(() => {
  const desc = props.job.description || props.job.summary || ''
  return desc.length > 200
})

// Methods
const handleSave = () => {
  isSaved.value = !isSaved.value
  emit('save', { job: props.job, saved: isSaved.value })
}

const handleApply = async () => {
  isApplying.value = true
  try {
    emit('apply', props.job)
  } finally {
    setTimeout(() => {
      isApplying.value = false
    }, 2000)
  }
}

const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

const toggleInsights = () => {
  isInsightsExpanded.value = !isInsightsExpanded.value
}

const formatJobType = (type) => {
  const typeMap = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
    'freelance': 'Freelance'
  }
  return typeMap[type?.toLowerCase()] || type || 'Not specified'
}

const formatSalary = (salary) => {
  if (typeof salary === 'object') {
    const { min, max, currency = 'USD' } = salary
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency
    if (min && max) {
      return `${symbol}${min.toLocaleString()}-${symbol}${max.toLocaleString()}`
    }
    if (min) return `${symbol}${min.toLocaleString()}+`
  }
  return salary || 'Not specified'
}

const getSkillClass = (skill) => {
  const gamingSkills = ['unity', 'unreal', 'godot', 'gamedev', 'c#', 'c++']
  const webSkills = ['javascript', 'typescript', 'react', 'vue', 'node']
  const dataSkills = ['python', 'sql', 'mongodb', 'postgresql']
  
  const skillLower = skill.toLowerCase()
  if (gamingSkills.some(gs => skillLower.includes(gs))) return 'skill-gaming'
  if (webSkills.some(ws => skillLower.includes(ws))) return 'skill-web'
  if (dataSkills.some(ds => skillLower.includes(ds))) return 'skill-data'
  return 'skill-default'
}

// Watch for job changes
watch(() => props.job?.id, () => {
  isSaved.value = false
  isApplying.value = false
  isDescriptionExpanded.value = false
  isInsightsExpanded.value = false
})
</script>

<style scoped>
.enhanced-job-card {
  width: 100%;
  max-width: 800px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.enhanced-job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
}

.enhanced-job-card:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--color-primary-500),
    var(--glass-shadow);
}

/* Main Content Wrapper */
.job-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Top Match Ribbon */
.top-match-ribbon {
  position: absolute;
  top: 16px;
  right: -24px;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: white;
  padding: var(--spacing-1) var(--spacing-8);
  transform: rotate(45deg);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
  z-index: 10;
}

/* Header Section */
.job-header {
  padding: var(--spacing-6);
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 3%, transparent) 0%, 
    color-mix(in srgb, var(--color-primary-600) 2%, transparent) 100%);
  border-bottom: 1px solid var(--glass-border);
  position: relative;
}

/* Badge Row */
.badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  min-height: 36px;
}

.time-badge {
  background: color-mix(in srgb, var(--color-warning-500) 10%, transparent);
  color: var(--color-warning-600);
  padding: var(--spacing-1-5) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  border: 1px solid color-mix(in srgb, var(--color-warning-500) 20%, transparent);
  height: 32px;
  min-width: fit-content;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Match Score */
.match-score {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--color-primary-500) 0deg,
    var(--color-primary-500) calc(var(--match) * 3.6deg),
    color-mix(in srgb, var(--color-primary-500) 15%, transparent) calc(var(--match) * 3.6deg)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  flex-shrink: 0;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.match-score-inner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.match-percentage {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
  line-height: 1;
}

.match-label {
  font-size: var(--font-size-2xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* Header Content */
.header-content {
  display: flex;
  gap: var(--spacing-4);
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
  width: 100%;
}

.company-logo {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
  box-shadow: 
    0 2px 8px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  transition: all var(--duration-fast) ease;
  overflow: hidden;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo .logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.company-logo:hover {
  transform: rotate(-3deg) scale(1.05);
}

/* Job Info */
.job-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.job-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--line-height-heading);
}

.company-line {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0;
}

.company-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-500);
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  background: color-mix(in srgb, var(--color-success-500) 10%, transparent);
  color: var(--color-success-600);
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  border: 1px solid color-mix(in srgb, var(--color-success-500) 20%, transparent);
}

.location-line {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.btn-icon:hover {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-400);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

.btn-icon.saved {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}


/* Action Buttons */
.header-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  backdrop-filter: blur(8px);
  flex-shrink: 0;
  font-size: var(--font-size-base);
}


/* Metrics Section */
.job-metrics {
  padding: var(--spacing-4) var(--spacing-6);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  background: color-mix(in srgb, var(--surface-container) 50%, transparent);
  border-bottom: 1px solid var(--glass-border);
  align-items: stretch;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2-5);
  flex: 1;
  min-width: 120px;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-500);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.metric-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  font-weight: var(--font-weight-medium);
  line-height: 1.2;
}

.metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* Description */
.job-description {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--glass-border);
}

.description-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.description-text.description-expanded {
  -webkit-line-clamp: unset;
}

.read-more {
  color: var(--color-primary-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  margin-top: var(--spacing-2);
  display: inline-block;
  transition: all var(--duration-fast) ease;
  background: none;
  border: none;
}

.read-more:hover {
  color: var(--color-primary-600);
  transform: translateX(4px);
}

/* Skills */
.skills-section {
  padding: var(--spacing-3) var(--spacing-6) var(--spacing-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: flex-start;
}

.skill-tag {
  background: color-mix(in srgb, var(--color-primary-500) 8%, transparent);
  color: var(--color-primary-600);
  padding: var(--spacing-1-5) var(--spacing-2-5);
  border-radius: var(--radius-full);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  transition: all var(--duration-fast) ease;
  height: 28px;
  display: inline-flex;
  align-items: center;
  min-width: fit-content;
  flex-shrink: 0;
}

.skill-tag:hover {
  background: color-mix(in srgb, var(--color-primary-500) 12%, transparent);
  transform: scale(1.05);
}

.skill-tag.skill-gaming {
  background: color-mix(in srgb, var(--color-gaming-500, #ff6b35) 8%, transparent);
  color: var(--color-gaming-600, #e55a2b);
  border-color: color-mix(in srgb, var(--color-gaming-500, #ff6b35) 15%, transparent);
}

.skill-tag.skill-web {
  background: color-mix(in srgb, var(--color-info-500) 8%, transparent);
  color: var(--color-info-600);
  border-color: color-mix(in srgb, var(--color-info-500) 15%, transparent);
}

.skill-tag.skill-data {
  background: color-mix(in srgb, var(--color-success-500) 8%, transparent);
  color: var(--color-success-600);
  border-color: color-mix(in srgb, var(--color-success-500) 15%, transparent);
}

/* AI Insights */
.ai-insights {
  margin: 0 var(--spacing-6) var(--spacing-5);
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 5%, transparent) 0%, 
    color-mix(in srgb, var(--color-primary-600) 3%, transparent) 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

.insights-header {
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--duration-fast) ease;
}

.insights-header:hover {
  background: color-mix(in srgb, var(--color-primary-500) 5%, transparent);
}

.insights-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.insights-title i {
  color: var(--color-primary-500);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.insights-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.insights-badge {
  background: var(--color-primary-500);
  color: white;
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
}

.expand-icon {
  transition: transform var(--duration-fast) ease;
  color: var(--text-muted);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.insights-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--duration-normal) ease;
}

.ai-insights.insights-expanded .insights-content {
  max-height: 300px;
}

.insight-items {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.insight-item {
  display: flex;
  gap: var(--spacing-2-5);
  align-items: flex-start;
}

.insight-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
}

.insight-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body);
  color: var(--text-secondary);
  flex: 1;
}

/* Footer */
.job-footer {
  padding: var(--spacing-3) var(--spacing-6);
  background: color-mix(in srgb, var(--surface-container) 30%, transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--glass-border);
  min-height: 40px;
  margin-top: auto;
  flex-shrink: 0;
}

.source-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-height: 32px;
}

.footer-actions {
  display: flex;
  gap: var(--spacing-2);
}

.footer-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.footer-btn:hover {
  color: var(--text-primary);
  background: var(--glass-hover-bg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .job-metrics {
    grid-template-columns: 1fr;
  }

  .badge-row {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .time-badge {
    font-size: var(--font-size-2xs);
    padding: var(--spacing-1) var(--spacing-2);
  }

  .match-score {
    width: 44px;
    height: 44px;
  }

  .match-score-inner {
    width: 36px;
    height: 36px;
  }

  .match-percentage {
    font-size: var(--font-size-xs);
  }

  .company-logo {
    width: 50px;
    height: 50px;
  }

  .job-title {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .enhanced-job-card {
    margin: 0 var(--spacing-2);
  }

  .job-header,
  .job-metrics,
  .job-description,
  .skills-section,
  .job-footer {
    padding-left: var(--spacing-4);
    padding-right: var(--spacing-4);
  }

  .header-actions {
    flex-wrap: wrap;
    gap: var(--spacing-1-5);
  }

  .btn-icon {
    width: 34px;
    height: 34px;
  }
}

/* Focus and interaction states */
.enhanced-job-card:focus-within {
  box-shadow: 
    0 0 0 2px var(--color-primary-500),
    var(--glass-shadow);
}

.enhanced-job-card.top-match {
  border-color: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.enhanced-job-card.has-insights .job-footer {
  border-top-color: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}
</style>