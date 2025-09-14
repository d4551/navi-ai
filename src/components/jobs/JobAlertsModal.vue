<template>
  <v-dialog 
    v-model="internalShow" 
    max-width="700" 
    scrollable
    persistent
    class="job-alerts-modal"
  >
    <v-card class="glass-card">
      <!-- Modal Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <AppIcon name="mdi-bell" class="title-icon" />
            <h2>Gaming Job Alerts</h2>
          </div>
          
          <div class="header-stats">
            <UiChip classes="alert-count-chip" variant="gaming">
              {{ alerts.length }} Active Alerts
            </UiChip>
          </div>
          
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="mdi-close"
            @click="closeModal"
          />
        </div>
      </v-card-title>

      <!-- Modal Content -->
      <v-card-text class="modal-content">
        <!-- Create New Alert Section -->
        <section class="create-alert-section glass-surface">
          <div class="section-header">
            <h3>
              <AppIcon name="mdi-plus-circle" />
              Create New Job Alert
            </h3>
            <UnifiedButton
              variant="primary"
              size="sm"
              leading-icon="mdi-plus"
              :loading="creating"
              @click="showCreateForm = !showCreateForm"
            >
              {{ showCreateForm ? 'Cancel' : 'New Alert' }}
            </UnifiedButton>
          </div>

          <!-- Create Form -->
          <div v-if="showCreateForm" class="create-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Alert Name</label>
                <input
                  v-model="newAlert.name"
                  type="text"
                  placeholder="e.g., Senior Game Developer Roles"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Keywords</label>
                <input
                  v-model="newAlert.keywords"
                  type="text"
                  placeholder="e.g., Unity, C#, Game Designer"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Location</label>
                <input
                  v-model="newAlert.location"
                  type="text"
                  placeholder="e.g., San Francisco, Remote"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Experience Level</label>
                <select v-model="newAlert.level" class="form-select">
                  <option value="">Any Level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead/Principal</option>
                </select>
              </div>

              <div class="form-group">
                <label>Salary Range (USD)</label>
                <div class="salary-range-inputs">
                  <input
                    v-model.number="newAlert.salaryMin"
                    type="number"
                    placeholder="Min"
                    class="form-input small"
                  />
                  <span class="range-separator">—</span>
                  <input
                    v-model.number="newAlert.salaryMax"
                    type="number"
                    placeholder="Max"
                    class="form-input small"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Notification Frequency</label>
                <select v-model="newAlert.frequency" class="form-select">
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>
            </div>

            <div class="gaming-filters">
              <h4>Gaming-Specific Filters</h4>
              <div class="gaming-options">
                <label class="checkbox-label">
                  <input
                    v-model="newAlert.gamingOnly"
                    type="checkbox"
                    class="gaming-checkbox"
                  />
                  <span class="checkmark"></span>
                  Gaming Industry Only
                </label>

                <div v-if="newAlert.gamingOnly" class="gaming-sub-filters">
                  <div class="form-group">
                    <label>Game Genre</label>
                    <select v-model="newAlert.gameGenre" class="form-select">
                      <option value="">Any Genre</option>
                      <option value="Action">Action</option>
                      <option value="RPG">RPG</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Simulation">Simulation</option>
                      <option value="Sports">Sports</option>
                      <option value="Racing">Racing</option>
                      <option value="Mobile">Mobile Games</option>
                      <option value="VR">VR/AR</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Studio Size</label>
                    <select v-model="newAlert.studioSize" class="form-select">
                      <option value="">Any Size</option>
                      <option value="Indie">Indie (1-10)</option>
                      <option value="Small">Small (11-50)</option>
                      <option value="Medium">Medium (51-200)</option>
                      <option value="Large">Large (201-500)</option>
                      <option value="AAA">AAA Studio (500+)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Platform</label>
                    <select v-model="newAlert.platform" class="form-select">
                      <option value="">Any Platform</option>
                      <option value="PC">PC</option>
                      <option value="Console">Console</option>
                      <option value="Mobile">Mobile</option>
                      <option value="VR">VR/AR</option>
                      <option value="Web">Web</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <UnifiedButton
                variant="secondary"
                @click="resetCreateForm"
              >
                Reset
              </UnifiedButton>
              
              <UnifiedButton
                variant="primary"
                leading-icon="mdi-bell-plus"
                :loading="creating"
                :disabled="!canCreateAlert"
                @click="createAlert"
              >
                Create Alert
              </UnifiedButton>
            </div>
          </div>
        </section>

        <!-- Existing Alerts -->
        <section class="alerts-list-section">
          <div class="section-header">
            <h3>
              <AppIcon name="mdi-bell-ring" />
              Your Active Alerts
            </h3>
          </div>

          <div v-if="alerts.length === 0" class="empty-alerts glass-surface">
            <div class="empty-content">
              <AppIcon name="mdi-bell-sleep" class="empty-icon" />
              <h4>No Job Alerts Yet</h4>
              <p>Create your first alert to get notified about gaming jobs that match your criteria.</p>
            </div>
          </div>

          <div v-else class="alerts-list">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-item glass-surface"
              :class="{ 'alert-paused': !alert.active }"
            >
              <div class="alert-header">
                <div class="alert-main-info">
                  <h4 class="alert-name">
                    {{ alert.name }}
                    <UiChip
                      v-if="alert.gamingOnly"
                      classes="gaming-chip"
                      variant="gaming"
                      size="sm"
                    >
                      🎮 Gaming
                    </UiChip>
                  </h4>
                  
                  <div class="alert-meta">
                    <div class="alert-criteria">
                      <span v-if="alert.keywords" class="criteria-item">
                        🔍 {{ alert.keywords }}
                      </span>
                      <span v-if="alert.location" class="criteria-item">
                        📍 {{ alert.location }}
                      </span>
                      <span v-if="alert.level" class="criteria-item">
                        📊 {{ alert.level }}
                      </span>
                      <span v-if="alert.salaryMin || alert.salaryMax" class="criteria-item">
                        💰 {{ formatSalaryRange(alert.salaryMin, alert.salaryMax) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="alert-actions">
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    :leading-icon="alert.active ? 'mdi-pause' : 'mdi-play'"
                    @click="toggleAlert(alert)"
                  />
                  
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    leading-icon="mdi-pencil"
                    @click="editAlert(alert)"
                  />
                  
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    leading-icon="mdi-delete"
                    class="delete-btn"
                    @click="deleteAlert(alert.id)"
                  />
                </div>
              </div>

              <div class="alert-stats">
                <div class="stat-item">
                  <span class="stat-label">Frequency:</span>
                  <span class="stat-value">{{ formatFrequency(alert.frequency) }}</span>
                </div>
                
                <div class="stat-item">
                  <span class="stat-label">Matches Found:</span>
                  <span class="stat-value">{{ alert.matchCount || 0 }}</span>
                </div>
                
                <div class="stat-item">
                  <span class="stat-label">Last Triggered:</span>
                  <span class="stat-value">{{ formatLastTriggered(alert.lastTriggered) }}</span>
                </div>
                
                <div class="stat-item">
                  <span class="stat-label">Status:</span>
                  <span class="stat-value" :class="alert.active ? 'status-active' : 'status-paused'">
                    {{ alert.active ? 'Active' : 'Paused' }}
                  </span>
                </div>
              </div>

              <!-- Gaming-Specific Alert Details -->
              <div v-if="alert.gamingOnly" class="gaming-alert-details">
                <div class="gaming-filters-display">
                  <UiChip
                    v-if="alert.gameGenre"
                    classes="filter-chip"
                    size="sm"
                  >
                    Genre: {{ alert.gameGenre }}
                  </UiChip>
                  
                  <UiChip
                    v-if="alert.studioSize"
                    classes="filter-chip"
                    size="sm"
                  >
                    Studio: {{ alert.studioSize }}
                  </UiChip>
                  
                  <UiChip
                    v-if="alert.platform"
                    classes="filter-chip"
                    size="sm"
                  >
                    Platform: {{ alert.platform }}
                  </UiChip>
                </div>
              </div>
            </div>
          </div>
        </section>
      </v-card-text>

      <!-- Modal Actions -->
      <v-card-actions class="modal-actions">
        <div class="actions-left">
          <UnifiedButton
            variant="outline"
            leading-icon="mdi-cog"
            @click="showSettings = true"
          >
            Settings
          </UnifiedButton>
        </div>

        <div class="actions-right">
          <UnifiedButton
            variant="secondary"
            @click="closeModal"
          >
            Done
          </UnifiedButton>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { toastService } from '@/shared/services/toastService'

// Props
interface Props {
  show: boolean
  alerts: Array<any>
}

const _props = withDefaults(defineProps<Props>(), {
  show: false,
  alerts: () => []
})

// Emits
const emit = defineEmits([
  'update:show',
  'alert-created',
  'alert-updated',
  'alert-deleted',
  'alert-toggled'
])

// State
const creating = ref(false)
const showCreateForm = ref(false)
const showSettings = ref(false)

const newAlert = ref({
  name: '',
  keywords: '',
  location: '',
  level: '',
  salaryMin: null,
  salaryMax: null,
  frequency: 'daily',
  gamingOnly: true,
  gameGenre: '',
  studioSize: '',
  platform: '',
  active: true
})

// Computed
const internalShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const canCreateAlert = computed(() => {
  return newAlert.value.name.trim().length > 0 && 
         (newAlert.value.keywords.trim().length > 0 || newAlert.value.location.trim().length > 0)
})

// Methods
const closeModal = () => {
  internalShow.value = false
  resetCreateForm()
}

const resetCreateForm = () => {
  newAlert.value = {
    name: '',
    keywords: '',
    location: '',
    level: '',
    salaryMin: null,
    salaryMax: null,
    frequency: 'daily',
    gamingOnly: true,
    gameGenre: '',
    studioSize: '',
    platform: '',
    active: true
  }
  showCreateForm.value = false
}

const createAlert = async () => {
  if (!canCreateAlert.value) return

  creating.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const alert = {
      id: Date.now().toString(),
      ...newAlert.value,
      createdAt: new Date(),
      matchCount: 0,
      lastTriggered: null
    }

    emit('alert-created', alert)
    toastService.success(`Job alert "${alert.name}" created successfully!`)
    resetCreateForm()
  } catch (error) {
    toastService.error('Failed to create alert: ' + error.message)
  } finally {
    creating.value = false
  }
}

const toggleAlert = (alert) => {
  const updatedAlert = { ...alert, active: !alert.active }
  emit('alert-updated', updatedAlert)
  
  const status = updatedAlert.active ? 'activated' : 'paused'
  toastService.success(`Alert "${alert.name}" ${status}`)
}

const editAlert = (alert) => {
  // Fill form with existing alert data
  newAlert.value = { ...alert }
  showCreateForm.value = true
  toastService.info('Edit mode activated - modify and save changes')
}

const deleteAlert = (alertId) => {
  if (confirm('Are you sure you want to delete this job alert?')) {
    emit('alert-deleted', alertId)
    toastService.success('Job alert deleted')
  }
}

// Formatting functions
const formatSalaryRange = (min, max) => {
  if (min && max) {
    return `$${formatNumber(min)} - $${formatNumber(max)}`
  }
  if (min) {
    return `$${formatNumber(min)}+`
  }
  if (max) {
    return `Up to $${formatNumber(max)}`
  }
  return 'Any salary'
}

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

const formatFrequency = (frequency) => {
  const map = {
    'instant': 'Instant notifications',
    'daily': 'Daily digest',
    'weekly': 'Weekly summary'
  }
  return map[frequency] || frequency
}

const formatLastTriggered = (date) => {
  if (!date) return 'Never'
  
  const now = new Date()
  const triggered = new Date(date)
  const diffTime = Math.abs(now - triggered)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}
</script>

<style scoped>
.job-alerts-modal :deep(.v-dialog) {
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
  border-bottom: 1px solid var(--border-light);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.title-icon {
  font-size: 1.5rem;
  color: var(--color-gaming-400);
}

.title-section h2 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
}

.modal-content {
  padding: var(--spacing-6);
  max-height: 70vh;
  overflow-y: auto;
}

.create-alert-section, .alerts-list-section {
  margin-bottom: var(--spacing-6);
}

.create-alert-section {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.2);
  background: linear-gradient(135deg, 
    rgba(var(--color-gaming-500-rgb), 0.03) 0%,
    transparent 100%);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.create-form {
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-4);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input, .form-select {
  padding: var(--spacing-3);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: rgba(var(--surface-rgb), 0.8);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--color-gaming-400);
  box-shadow: 0 0 0 3px rgba(var(--color-gaming-500-rgb), 0.15);
}

.form-input.small {
  padding: var(--spacing-2) var(--spacing-3);
}

.salary-range-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.range-separator {
  color: var(--text-muted);
  font-weight: 600;
}

.gaming-filters {
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.gaming-filters h4 {
  margin: 0 0 var(--spacing-3) 0;
  color: var(--color-gaming-400);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.gaming-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  font-weight: 500;
  color: var(--text-primary);
}

.gaming-checkbox {
  display: none;
}

.checkmark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--border-base);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.gaming-checkbox:checked + .checkmark {
  background: var(--color-gaming-500);
  border-color: var(--color-gaming-500);
}

.gaming-checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
}

.gaming-sub-filters {
  margin-left: var(--spacing-6);
  padding-left: var(--spacing-4);
  border-left: 2px solid rgba(var(--color-gaming-500-rgb), 0.3);
}

.gaming-sub-filters .form-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-4);
}

.empty-alerts {
  padding: var(--spacing-8);
  text-align: center;
  border-radius: var(--radius-lg);
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-4);
}

.empty-content h4 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-primary);
}

.empty-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.alert-item {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.alert-item:hover {
  border-color: var(--color-gaming-400);
  box-shadow: 0 4px 15px rgba(var(--color-gaming-500-rgb), 0.1);
}

.alert-item.alert-paused {
  opacity: 0.6;
  background: rgba(var(--surface-rgb), 0.3);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
}

.alert-name {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.alert-criteria {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.criteria-item {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: rgba(var(--surface-rgb), 0.5);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
}

.alert-actions {
  display: flex;
  gap: var(--spacing-1);
}

.alert-actions :deep(.delete-btn) {
  color: var(--color-error-500);
}

.alert-actions :deep(.delete-btn:hover) {
  background: rgba(var(--color-error-500-rgb), 0.1);
}

.alert-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(var(--surface-rgb), 0.3);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: 0.75rem;
}

.stat-label {
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
}

.stat-value.status-active {
  color: var(--color-success-600);
}

.stat-value.status-paused {
  color: var(--color-warning-600);
}

.gaming-alert-details {
  margin-top: var(--spacing-3);
}

.gaming-filters-display {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.modal-actions {
  padding: var(--spacing-6);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-left, .actions-right {
  display: flex;
  gap: var(--spacing-3);
}

/* Theme enhancements */
:deep(.alert-count-chip) {
  background: rgba(var(--color-gaming-500-rgb), 0.15);
  color: var(--color-gaming-400);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.3);
}

:deep(.gaming-chip) {
  background: rgba(var(--color-gaming-500-rgb), 0.15);
  color: var(--color-gaming-400);
  border: 1px solid rgba(var(--color-gaming-500-rgb), 0.3);
}

:deep(.filter-chip) {
  background: rgba(var(--surface-rgb), 0.8);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: flex-start;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .gaming-sub-filters .form-grid {
    grid-template-columns: 1fr;
  }
  
  .alert-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .alert-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>