<template>
  <div class="job-board-source-selector">
    <!-- Overview Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="selection-overview glass-card section-card-subtle p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h6 class="mb-1">Selected Sources: {{ selectedSources.length }}/{{ sources.length }}</h6>
              <p class="text-muted small mb-0">Configure job board APIs to expand your search reach</p>
            </div>
            <div class="source-status-indicators d-flex gap-2">
              <div
                v-for="source in selectedSourceDetails"
                :key="source.id"
                class="status-dot"
                :class="getStatusClass(source.status)"
                :title="`${source.name}: ${source.status}`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Source Grid -->
    <div class="sources-grid job-grid">
      <div
        v-for="source in sources"
        :key="source.id"
        class="source-card glass-card section-card"
        :class="{ 'source-selected': selectedSources.includes(source.id),
                  'source-disabled': !source.enabled,
                  'source-degraded': source.status === 'degraded'
        }"
      >
        <!-- Header with toggle -->
        <div class="source-header d-flex align-items-start justify-content-between">
          <div class="source-info d-flex align-items-center">
            <div class="source-icon-wrapper" :style="{ backgroundColor: source.color + '20', borderColor: source.color }">
              <AppIcon :name="source.icon" class="source-icon" :style="{ color: source.color }" />
            </div>
            <div class="ms-3">
              <h6 class="source-name mb-1">{{ source.name }}</h6>
              <p class="source-description text-muted small mb-0">{{ source.description }}</p>
            </div>
          </div>
          <div class="source-toggle">
            <div class="form-check form-switch">
              <input
                :id="`source-${source.id}`"
                v-model="localSelectedSources"
                class="form-check-input"
                type="checkbox"
                :value="source.id"
                :disabled="!source.enabled"
                @change="updateSelection"
              >
              <label :for="`source-${source.id}`" class="form-check-label visually-hidden">
                Toggle {{ source.name }}
              </label>
            </div>
          </div>
        </div>

        <!-- Status and Rate Limit -->
        <div class="source-meta d-flex align-items-center justify-content-between mb-3">
          <div class="status-badge">
            <span
              class="badge"
              :class="getStatusBadgeClass(source.status)"
            >
              <AppIcon name="mdi-circle-small" class="me-1" />
              {{ source.status }}
            </span>
          </div>
          <div class="rate-limit text-muted small">
            <AppIcon name="mdi-speedometer" class="me-1" />
            {{ source.rateLimit }}
          </div>
        </div>

        <!-- Categories -->
        <div class="source-categories mb-3">
          <div class="category-tags d-flex flex-wrap gap-1">
            <span
              v-for="category in source.categories.slice(0, 3)"
              :key="category"
              class="badge bg-light text-dark category-tag"
            >
              {{ category }}
            </span>
            <span
              v-if="source.categories.length > 3"
              class="badge bg-light text-muted category-tag"
            >
              +{{ source.categories.length - 3 }}
            </span>
          </div>
        </div>

        <!-- Features -->
        <div class="source-features mb-3">
          <div class="feature-list">
            <div
              v-for="feature in source.features.slice(0, 2)"
              :key="feature"
              class="feature-item d-flex align-items-center small text-muted mb-1"
            >
              <AppIcon name="mdi-check-circle-outline" color="success" context="success" />
              {{ feature }}
            </div>
          </div>
        </div>

        <!-- API Configuration (shown when selected) -->
        <div v-if="selectedSources.includes(source.id) && source.enabled" class="api-config">
          <div class="config-divider mb-3"></div>

          <!-- API Key Section (only for APIs that require keys) -->
          <div v-if="source.apiKey !== 'Not required'" class="api-key-field mb-3">
            <label :for="`api-key-${source.id}`" class="form-label small fw-medium">
              <AppIcon name="mdi-key-variant" class="me-1" />
              API Key
            </label>
            <div class="input-group input-group-sm">
              <input
                :id="`api-key-${source.id}`"
                v-model="source.apiKey"
                type="password"
                class="form-control"
                :placeholder="`Enter ${source.name} API key`"
                @input="updateApiKey(source.id, $event.target.value)"
              >
              <IconButton
                variant="outline"
                size="sm"
                icon="mdi-eye"
                type="button"
                @click="togglePasswordVisibility(source.id)"
              />
            </div>
            <div class="form-text">
              <a href="#" class="text-decoration-none" @click.prevent="openApiDocumentation(source.id)">
                <AppIcon name="mdi-help-circle-outline" />
                Get API key
              </a>
            </div>
          </div>

          <!-- Public API Notice -->
          <div v-else class="public-api-notice mb-3 p-2 bg-success-subtle text-success rounded">
            <AppIcon name="mdi-check-circle-outline" context="success" />
            <strong>Public API</strong> - No authentication required
          </div>
        </div>

        <!-- Action buttons for selected sources -->
        <div v-if="selectedSources.includes(source.id) && source.enabled" class="source-actions mt-3">
          <div class="d-flex gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              class="flex-fill"
              :disabled="(source.apiKey !== 'Not required' && !source.apiKey) || testingConnections.includes(source.id)"
              leading-icon="mdi-lightning-bolt"
              @click="testConnection(source.id)"
            >
              <span v-if="testingConnections.includes(source.id)">Testing...</span>
              <span v-else>Test API</span>
            </UnifiedButton>
            <IconButton
              variant="outline"
              size="sm"
              icon="mdi-book-open-variant"
              @click="viewDocumentation(source.id)"
            />
          </div>

          <!-- Test Results -->
          <div
            v-if="testResults[source.id]" class="test-result mt-2 p-2 rounded small"
            :class="testResults[source.id].success ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
          >
            <AppIcon :name="testResults[source.id].success ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" class="me-1" />
            {{ testResults[source.id].message }}
            <span v-if="testResults[source.id].success && testResults[source.id].jobCount !== undefined">
              ({{ testResults[source.id].jobCount }} jobs available)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Summary -->
    <div v-if="selectedSources.length > 0" class="row mt-4">
      <div class="col-12">
        <div class="configuration-summary glass-card section-card-subtle p-3">
          <h6 class="mb-3">
            <AppIcon name="mdi-cog" />
            Configuration Summary
          </h6>
          <div class="summary-stats row g-3">
            <div class="col-md-3">
              <div class="stat-item text-center">
                <div class="stat-value h5 mb-1 text-primary">{{ selectedSources.length }}</div>
                <div class="stat-label small text-muted">Active Sources</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-item text-center">
                <div class="stat-value h5 mb-1 text-success">{{ operationalSources }}</div>
                <div class="stat-label small text-muted">Operational</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-item text-center">
                <div class="stat-value h5 mb-1 text-info">{{ totalRateLimit }}</div>
                <div class="stat-label small text-muted">Total/Hour</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-item text-center">
                <div class="stat-value h5 mb-1 text-warning">{{ configuredSources }}</div>
                <div class="stat-label small text-muted">Configured</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import { jobSourceManager } from '@/services/JobSourceManager'

const props = defineProps({
  sources: {
    type: Array,
    required: true
  },
  selectedSources: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selected'])

// Local state
const localSelectedSources = ref([...props.selectedSources])
const testingConnections = ref([])
const testResults = ref({})

// Computed properties
const selectedSourceDetails = computed(() =>
  props.sources.filter(source => localSelectedSources.value.includes(source.id))
)

const operationalSources = computed(() =>
  selectedSourceDetails.value.filter(source => source.status === 'operational').length
)

const configuredSources = computed(() =>
  selectedSourceDetails.value.filter(source => source.apiKey && source.apiKey.length > 0).length
)

const totalRateLimit = computed(() => {
  return selectedSourceDetails.value
    .map(source => parseInt(source.rateLimit.split('/')[0]) || 0)
    .reduce((sum, limit) => sum + limit, 0)
})

// Watch for prop changes
watch(() => props.selectedSources, (newVal) => {
  localSelectedSources.value = [...newVal]
}, { deep: true })

// Methods
const updateSelection = () => {
  emit('update:selected', [...localSelectedSources.value])
}

const updateApiKey = (sourceId, apiKey) => {
  const source = props.sources.find(s => s.id === sourceId)
  if (source) {
    source.apiKey = apiKey
  }
}

const getStatusClass = (status) => {
  return {
    'status-operational': status === 'operational',
    'status-degraded': status === 'degraded',
    'status-down': status === 'down',
    'status-unknown': status === 'unknown'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'operational': return 'badge-success'
    case 'degraded': return 'badge-warning'
    case 'down': return 'badge-danger'
    default: return 'badge-secondary'
  }
}

const testConnection = async (sourceId) => {
  const source = props.sources.find(s => s.id === sourceId)
  if (!source) {return}

  // Testing connection for source
  testingConnections.value.push(sourceId)

  // Clear previous test results
  if (testResults.value[sourceId]) {
    delete testResults.value[sourceId]
  }

  try {
    const result = await jobSourceManager.testSource(sourceId)
    testResults.value[sourceId] = {
      success: result.success,
      message: result.message,
      jobCount: result.jobCount
    }
  } catch (error) {
    testResults.value[sourceId] = {
      success: false,
      message: `Connection failed: ${error?.message || 'Unknown error'}`
    }
  } finally {
    testingConnections.value = testingConnections.value.filter(id => id !== sourceId)
  }
}

const togglePasswordVisibility = (sourceId) => {
  // Toggle password visibility logic
  const input = document.getElementById(`api-key-${sourceId}`)
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
}

const openApiDocumentation = (sourceId) => {
  // Open API documentation in new tab
  const source = props.sources.find(s => s.id === sourceId)
  // Opening API documentation
}

const viewDocumentation = (sourceId) => {
  // View source documentation
  openApiDocumentation(sourceId)
}
</script>

<style scoped>
.job-board-source-selector {
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card-subtle {
  background: var(--glass-surface-light);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sources-grid {
  display: grid;
  gap: 1.5rem;
}

.source-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.source-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.source-card.source-selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.source-card.source-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.source-card.source-degraded {
  border-left: 4px solid var(--color-warning-500);
}

.source-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.source-icon {
  font-size: 1.5rem;
}

.source-name {
  font-weight: 700;
  color: var(--text-primary);
}

.source-description {
  font-size: 0.875rem;
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-operational { background-color: var(--color-success-500); }
.status-degraded { background-color: var(--color-warning-500); }
.status-down { background-color: var(--color-danger-500); }
.status-unknown { background-color: var(--color-muted-500); }

.badge-success { background-color: var(--color-success-500) !important; }
.badge-warning { background-color: var(--color-warning-500) !important; color: var(--text-on-warning, #000) !important; }
.badge-danger { background-color: var(--color-danger-500) !important; }

.category-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.feature-item {
  font-size: 0.8rem;
}

.config-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
}

.api-config {
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.input-group-sm .form-control {
  font-size: 0.875rem;
}

.configuration-summary {
  border: 2px dashed var(--glass-border);
}

.stat-item {
  padding: 0.75rem;
}

.stat-value {
  font-weight: 700;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sources-grid {
    gap: 1rem;
  }

  .source-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .source-toggle {
    align-self: flex-end;
  }
}

/* Dark theme support */
[data-theme="dark"] .glass-card-subtle,
[data-theme="dark"] .api-config {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .category-tag {
  background-color: var(--glass-surface-dark) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--glass-border-dark);
}

/* Loading animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

.test-result {
  border-left: 3px solid;
  border-left-color: inherit;
}

.public-api-notice {
  font-weight: 500;
}

/* Animation preferences */
@media (prefers-reduced-motion: reduce) {
  .source-card {
    transition: none;
  }

  .source-card:hover {
    transform: none;
  }

  .spin {
    animation: none;
  }
}
</style>
