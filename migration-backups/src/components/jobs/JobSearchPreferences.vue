<template>
  <div class="job-search-preferences">
    <div class="row g-4">
      <!-- Role Types Section -->
      <div class="col-lg-6">
        <div class="preference-section glass-card section-card-subtle">
          <div class="section-header mb-3">
            <h6 class="mb-1">
              <AppIcon name="mdi-briefcase-variant" class="me-2 text-primary" />
              Role Types
            </h6>
            <p class="text-muted small mb-0">
              Select your preferred gaming industry roles
            </p>
          </div>

          <div class="role-categories">
            <div
              v-for="category in roleCategories"
              :key="category.name"
              class="role-category mb-3"
            >
              <div class="category-header d-flex align-items-center mb-2">
                <i
                  :class="[category.icon, 'me-2']"
                  :style="{ color: category.color }"
                ></i>
                <span class="fw-medium">{{ category.name }}</span>
              </div>
              <div class="role-options">
                <div
                  v-for="role in category.roles"
                  :key="role"
                  class="form-check form-check-inline role-checkbox"
                >
                  <input
                    :id="`role-${role.replace(/\s+/g, '-').toLowerCase()}`"
                    v-model="localPreferences.roleTypes"
                    class="form-check-input"
                    type="checkbox"
                    :value="role"
                    @change="updatePreferences"
                  />
                  <label
                    :for="`role-${role.replace(/\s+/g, '-').toLowerCase()}`"
                    class="form-check-label small"
                  >
                    {{ role }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Experience & Compensation -->
      <div class="col-lg-6">
        <div class="preference-section glass-card section-card-subtle">
          <div class="section-header mb-3">
            <h6 class="mb-1">
              <AppIcon name="mdi-account-star" class="me-2 text-success" />
              Experience & Compensation
            </h6>
            <p class="text-muted small mb-0">
              Define your experience level and salary expectations
            </p>
          </div>

          <!-- Experience Level -->
          <div class="form-group mb-3">
            <label class="form-label small fw-medium">Experience Level</label>
            <select
              v-model="localPreferences.experienceLevel"
              class="form-select form-select-sm"
              @change="updatePreferences"
            >
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (2-5 years)</option>
              <option value="senior">Senior Level (5-8 years)</option>
              <option value="lead">Lead/Principal (8+ years)</option>
              <option value="executive">Executive/Director</option>
              <option value="all">All Levels</option>
            </select>
          </div>

          <!-- Salary Range -->
          <div class="form-group mb-3">
            <label class="form-label small fw-medium">
              Salary Range
              <span class="text-muted">(USD/year)</span>
            </label>
            <div class="salary-range-inputs row g-2">
              <div class="col-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">$</span>
                  <input
                    v-model.number="localPreferences.salaryRange.min"
                    type="number"
                    class="form-control"
                    placeholder="Min"
                    min="0"
                    step="5000"
                    @input="updatePreferences"
                  />
                </div>
              </div>
              <div class="col-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">$</span>
                  <input
                    v-model.number="localPreferences.salaryRange.max"
                    type="number"
                    class="form-control"
                    placeholder="Max"
                    min="0"
                    step="5000"
                    @input="updatePreferences"
                  />
                </div>
              </div>
            </div>
            <div class="salary-display mt-2">
              <div class="text-center small text-muted">
                {{ formatSalaryRange(localPreferences.salaryRange) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Location & Work Style -->
      <div class="col-lg-6">
        <div class="preference-section glass-card section-card-subtle">
          <div class="section-header mb-3">
            <h6 class="mb-1">
              <AppIcon name="mdi-map-marker" color="info" />
              Location & Work Style
            </h6>
            <p class="text-muted small mb-0">
              Set your location and remote work preferences
            </p>
          </div>

          <!-- Location Preference -->
          <div class="form-group mb-3">
            <label class="form-label small fw-medium"
              >Location Preference</label
            >
            <div class="location-options">
              <div
                v-for="option in locationOptions"
                :key="option.value"
                class="form-check"
              >
                <input
                  :id="`location-${option.value}`"
                  v-model="localPreferences.locationPreference"
                  class="form-check-input"
                  type="radio"
                  :value="option.value"
                  @change="updatePreferences"
                />
                <label
                  :for="`location-${option.value}`"
                  class="form-check-label small"
                >
                  <i :class="[option.icon, 'me-2']"></i>
                  {{ option.label }}
                </label>
              </div>
            </div>
          </div>

          <!-- Work Style -->
          <div class="form-group mb-3">
            <label class="form-label small fw-medium">Work Style</label>
            <select
              v-model="localPreferences.workStyle"
              class="form-select form-select-sm"
              @change="updatePreferences"
            >
              <option value="remote">Fully Remote</option>
              <option value="hybrid">Hybrid (2-3 days remote)</option>
              <option value="onsite">On-site</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <!-- Company Size -->
          <div class="form-group">
            <label class="form-label small fw-medium">Company Size</label>
            <div class="company-size-options">
              <div
                v-for="size in companySizeOptions"
                :key="size.value"
                class="form-check form-check-inline"
              >
                <input
                  :id="`size-${size.value}`"
                  v-model="localPreferences.companySize"
                  class="form-check-input"
                  type="radio"
                  :value="size.value"
                  @change="updatePreferences"
                />
                <label
                  :for="`size-${size.value}`"
                  class="form-check-label small"
                >
                  {{ size.label }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Keywords & Notifications -->
      <div class="col-lg-6">
        <div class="preference-section glass-card section-card-subtle">
          <div class="section-header mb-3">
            <h6 class="mb-1">
              <AppIcon name="mdi-magnify" color="warning" />
              Keywords & Notifications
            </h6>
            <p class="text-muted small mb-0">
              Fine-tune search terms and alert preferences
            </p>
          </div>

          <!-- Keywords -->
          <div class="form-group mb-3">
            <label class="form-label small fw-medium">Include Keywords</label>
            <textarea
              v-model="localPreferences.keywords"
              class="form-control form-control-sm glass-input"
              rows="2"
              placeholder="Unity, Unreal, multiplayer, esports..."
              @input="updatePreferences"
            ></textarea>
            <div class="form-text">Separate multiple keywords with commas</div>
          </div>

          <!-- Exclude Keywords -->
          <div class="form-group mb-3">
            <label class="form-label small fw-medium">Exclude Keywords</label>
            <textarea
              v-model="localPreferences.excludeKeywords"
              class="form-control form-control-sm glass-input"
              rows="2"
              placeholder="gambling, casino, NFT..."
              @input="updatePreferences"
            ></textarea>
            <div class="form-text">
              Jobs containing these terms will be filtered out
            </div>
          </div>

          <!-- Notification Frequency -->
          <div class="form-group">
            <label class="form-label small fw-medium">
              <AppIcon name="mdi-bell" class="me-1" />
              Notification Frequency
            </label>
            <select
              v-model="localPreferences.notificationFrequency"
              class="form-select form-select-sm"
              @change="updatePreferences"
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="none">No Notifications</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences Summary -->
    <div class="preferences-summary mt-4">
      <div class="glass-card section-card-subtle p-3">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h6 class="mb-1">
              <AppIcon
                name="mdi-check-circle-outline"
                color="success"
                context="success"
              />
              Preferences Summary
            </h6>
            <div class="summary-text small text-muted">
              {{ generateSummaryText() }}
            </div>
          </div>
          <div class="summary-actions d-flex gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-refresh"
              @click="resetToDefaults"
              >Reset</UnifiedButton
            >
            <UnifiedButton
              variant="primary"
              size="sm"
              leading-icon="mdi-content-save"
              @click="savePreferences"
              >Save</UnifiedButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

import { ref, watch, defineEmits, defineProps } from 'vue'

const _props = defineProps({
  preferences: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:preferences'])

// Local state
const localPreferences = ref({ ...props.preferences })

// Role categories with gaming focus
const roleCategories = ref([
  {
    name: 'Design & Creative',
    icon: 'mdi-palette',
    color: '#8b5cf6',
    roles: [
      'Game Designer',
      'Level Designer',
      'Narrative Designer',
      'UX/UI Designer',
      'Concept Artist',
    ],
  },
  {
    name: 'Engineering & Technical',
    icon: 'mdi-code-tags',
    color: '#06b6d4',
    roles: [
      'Game Programmer',
      'Engine Developer',
      'Graphics Programmer',
      'Technical Artist',
      'DevOps Engineer',
    ],
  },
  {
    name: 'Community & Marketing',
    icon: 'mdi-account-group',
    color: '#10b981',
    roles: [
      'Community Manager',
      'Content Creator',
      'Marketing Manager',
      'Social Media Manager',
      'Streamer Coordinator',
    ],
  },
  {
    name: 'Esports & Competitive',
    icon: 'mdi-trophy',
    color: '#f59e0b',
    roles: [
      'Esports Manager',
      'Tournament Coordinator',
      'Team Coach',
      'Analyst',
      'Broadcast Producer',
    ],
  },
  {
    name: 'Business & Operations',
    icon: 'mdi-briefcase',
    color: '#ef4444',
    roles: [
      'Product Manager',
      'Producer',
      'Business Development',
      'Operations Manager',
      'QA Lead',
    ],
  },
])

const locationOptions = ref([
  { value: 'remote', label: 'Remote Only', icon: 'mdi-home' },
  { value: 'hybrid', label: 'Hybrid Preferred', icon: 'mdi-home-city' },
  { value: 'onsite', label: 'On-site Only', icon: 'mdi-office-building' },
  { value: 'flexible', label: 'Flexible', icon: 'mdi-map-marker-radius' },
])

const companySizeOptions = ref([
  { value: 'startup', label: 'Startup (1-50)' },
  { value: 'small', label: 'Small (51-200)' },
  { value: 'medium', label: 'Medium (201-1000)' },
  { value: 'large', label: 'Large (1000+)' },
  { value: 'any', label: 'Any Size' },
])

// Watch for external changes
watch(
  () => props.preferences,
  newVal => {
    localPreferences.value = { ...newVal }
  },
  { deep: true }
)

// Methods
const updatePreferences = () => {
  emit('update:preferences', { ...localPreferences.value })
}

const formatSalaryRange = range => {
  if (!range.min && !range.max) {
    return 'No salary preference set'
  }
  if (!range.min) {
    return `Up to $${range.max.toLocaleString()}`
  }
  if (!range.max) {
    return `$${range.min.toLocaleString()}+`
  }
  return `$${range.min.toLocaleString()} - $${range.max.toLocaleString()}`
}

const generateSummaryText = () => {
  const parts = []

  if (localPreferences.value.roleTypes.length > 0) {
    parts.push(
      `${localPreferences.value.roleTypes.length} role type${localPreferences.value.roleTypes.length !== 1 ? 's' : ''} selected`
    )
  }

  if (localPreferences.value.experienceLevel !== 'all') {
    const levels = {
      entry: 'entry-level',
      mid: 'mid-level',
      senior: 'senior-level',
      lead: 'lead/principal',
      executive: 'executive',
    }
    parts.push(`${levels[localPreferences.value.experienceLevel]} positions`)
  }

  if (localPreferences.value.locationPreference) {
    const locations = {
      remote: 'remote work',
      hybrid: 'hybrid work',
      onsite: 'on-site work',
      flexible: 'flexible location',
    }
    parts.push(
      `${locations[localPreferences.value.locationPreference]} preferred`
    )
  }

  return parts.join(', ') || 'Configure your preferences to get started'
}

const resetToDefaults = () => {
  localPreferences.value = {
    roleTypes: [],
    experienceLevel: 'all',
    locationPreference: 'remote',
    salaryRange: { min: 0, max: 200000 },
    companySize: 'any',
    workStyle: 'hybrid',
    keywords: '',
    excludeKeywords: '',
    notificationFrequency: 'daily',
  }
  updatePreferences()
}

const savePreferences = () => {
  // Emit save event with current preferences
  updatePreferences()

  // Optional: Show success message
  // Could emit success event or show toast notification
}
</script>

<style scoped>
.job-search-preferences {
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card-subtle {
  background: var(--glass-surface-light);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1.5rem;
  height: 100%;
}

.preference-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  flex-shrink: 0;
}

.role-category {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  border: 1px solid var(--glass-border-light);
}

.category-header {
  font-weight: 600;
  font-size: 0.9rem;
}

.role-checkbox {
  margin-bottom: 0.5rem;
  margin-right: 1rem;
}

.role-checkbox .form-check-input {
  margin-top: 0.125rem;
}

.role-checkbox .form-check-label {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.role-checkbox .form-check-input:checked + .form-check-label {
  background: var(--color-primary);
  color: var(--text-inverse);
  transform: translateY(-1px);
}

.location-options .form-check,
.company-size-options .form-check-inline {
  margin-bottom: 0.5rem;
}

.salary-range-inputs .input-group-text {
  background: var(--glass-surface-light);
  border: 1px solid var(--glass-border-light);
  color: var(--text-secondary);
}

.salary-display {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  border-radius: var(--border-radius-sm);
  padding: 0.5rem;
  font-weight: 600;
}

.preferences-summary {
  border-top: 2px dashed var(--glass-border-light);
  padding-top: 1rem;
}

.summary-text {
  max-width: 600px;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .glass-card-subtle {
    padding: 1rem;
  }

  .role-checkbox {
    margin-right: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .summary-actions {
    margin-top: 1rem;
  }

  .d-flex.align-items-center.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
}

/* Dark theme support */
[data-theme='dark'] .glass-card-subtle {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .role-category {
  background: rgba(0, 0, 0, 0.2);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .salary-range-inputs .input-group-text {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
  color: var(--text-secondary);
}

/* Animation preferences */
@media (prefers-reduced-motion: reduce) {
  .role-checkbox .form-check-label {
    transition: none;
  }

  .role-checkbox .form-check-input:checked + .form-check-label {
    transform: none;
  }
}
</style>
