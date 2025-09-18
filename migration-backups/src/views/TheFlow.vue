<!--
THE FLOW - Gaming Career Automation Pipeline
Noir-themed workflow automation for the gaming industry
RGB accents with ultra-wide layout and AI-powered job automation
-->
<template>
  <StandardPageLayout
    page-type="gaming"
    title="THE FLOW"
    subtitle="Every great heist needs a perfect plan. Welcome to the automation underworld."
    :title-icon="'mdi-chart-timeline'"
    :hero-stats="headerStats"
    content-spacing="normal"
    max-width="xl"
  >
    <!-- Quick Actions -->
    <section class="quick-actions glass-section unified-container">
      <div class="section-title">
        <h2>Quick Actions</h2>
        <p>Start your automation workflow</p>
      </div>
      <div class="actions-grid tool-grid">
        <button
          class="action-card glass p-4 gap-4 rounded-lg neon-interactive"
          @click="createNewFlow"
        >
          <div class="action-icon">
            <AppIcon name="mdi-plus-circle" class="rgb-icon" />
          </div>
          <div class="action-content">
            <h3>Create Flow</h3>
            <p>Build new automation workflow</p>
          </div>
        </button>

        <button
          class="action-card glass p-4 gap-4 rounded-lg neon-interactive"
          @click="openTemplate"
        >
          <div class="action-icon">
            <AppIcon name="mdi-file-outline" class="rgb-icon" />
          </div>
          <div class="action-content">
            <h3>Templates</h3>
            <p>Use pre-built career flows</p>
          </div>
        </button>

        <button
          class="action-card glass p-4 gap-4 rounded-lg neon-interactive"
          @click="openNodeRedUI"
        >
          <div class="action-icon">
            <AppIcon name="mdi-cog" />
          </div>
          <div class="action-content">
            <h3>Node-RED UI</h3>
            <p>Advanced flow editor</p>
          </div>
        </button>

        <button
          class="action-card glass p-4 gap-4 rounded-lg neon-interactive"
          @click="viewLogs"
        >
          <div class="action-icon">
            <AppIcon name="mdi-file-document-outline" />
          </div>
          <div class="action-content">
            <h3>Execution Logs</h3>
            <p>Monitor flow activity</p>
          </div>
        </button>
      </div>
    </section>

    <!-- Flows Grid -->
    <section class="flows-section unified-container">
      <div class="section-header enhanced-header">
        <div class="header-content">
          <h2>Your Automation Flows</h2>
          <p class="section-description">
            Manage and monitor your career automation workflows
          </p>
        </div>
        <div class="section-controls">
          <ViewToggle
            v-model="viewMode"
            :options="[
              { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
              { value: 'list', icon: 'mdi-view-list', label: 'List view' },
            ]"
          />

          <input
            v-model.trim="searchQuery"
            class="search-input glass-input"
            type="search"
            placeholder="Search flows..."
            aria-label="Search flows"
          />

          <select
            v-model="sortBy"
            class="filter-select glass-input"
            aria-label="Sort flows"
          >
            <option value="recent">Recently run</option>
            <option value="status">Status</option>
            <option value="name">Name</option>
          </select>

          <select v-model="filterCategory" class="filter-select glass-input">
            <option value="">All Categories</option>
            <option value="job-search">Job Search</option>
            <option value="application">Applications</option>
            <option value="networking">Networking</option>
            <option value="ai-assistance">AI Assistance</option>
          </select>

          <UnifiedButton
            color="glass"
            appearance="outlined"
            leading-icon="mdi-refresh"
            :class="{ spinning: loading }"
            @click="refreshFlows"
            >Refresh</UnifiedButton
          >
        </div>
      </div>

      <div class="category-section">
        <h3 class="category-title">Filter by Category</h3>
        <div
          class="category-chips enhanced-chips"
          role="toolbar"
          aria-label="Filter by category"
        >
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="chip enhanced-chip"
            :class="{ active: filterCategory === cat.value }"
            :aria-pressed="(filterCategory === cat.value).toString()"
            @click="
              filterCategory = filterCategory === cat.value ? '' : cat.value
            "
          >
            <AppIcon :name="cat.icon" class="chip-icon" />
            <span class="chip-label">{{ cat.label }}</span>
            <span v-if="filterCategory === cat.value" class="chip-badge">{{
              flows.filter(f => f.category === cat.value).length
            }}</span>
          </button>
        </div>
      </div>

      <div
        v-if="sortedFilteredFlows.length"
        class="flows-grid portfolio-grid"
        :class="`mode-${viewMode}`"
        role="list"
        aria-label="Flows list"
      >
        <div
          v-for="flow in sortedFilteredFlows"
          :key="flow.id"
          class="flow-card glass p-4 gap-4 rounded-lg neon-interactive"
          role="listitem"
          :aria-label="`${flow.name} ${flow.status}`"
          @click="openFlowDetails(flow)"
        >
          <!-- Flow Header -->
          <div class="flow-header">
            <div class="flow-icon">
              <i :class="getFlowIcon(flow.category)" class="flow-type-icon"></i>
            </div>

            <div class="flow-info">
              <h3 class="flow-name">{{ flow.name }}</h3>
              <p class="flow-description">{{ flow.description }}</p>
              <div class="flow-meta">
                <span
                  class="category-badge"
                  :class="`category-${flow.category}`"
                >
                  {{ formatCategory(flow.category) }}
                </span>
                <span class="status-badge" :class="`status-${flow.status}`">
                  {{ flow.status }}
                </span>
              </div>
            </div>

            <div class="flow-controls">
              <button
                class="control-btn ui-icon-btn"
                :class="{ active: flow.status === 'running' }"
                :title="flow.status === 'running' ? 'Stop Flow' : 'Start Flow'"
                @click.stop="toggleFlow(flow)"
              >
                <AppIcon
                  :name="flow.status === 'running' ? 'mdi-stop' : 'mdi-play'"
                />
              </button>

              <button
                class="control-btn ui-icon-btn"
                title="Edit Flow"
                @click.stop="editFlow(flow)"
              >
                <AppIcon name="mdi-pencil" />
              </button>
              <button
                class="control-btn ui-icon-btn"
                title="Duplicate Flow"
                aria-label="Duplicate flow"
                @click.stop="duplicateFlow(flow)"
              >
                <AppIcon name="mdi-content-copy" />
              </button>
              <button
                class="control-btn ui-icon-btn danger"
                title="Delete Flow"
                aria-label="Delete flow"
                @click.stop="deleteFlow(flow)"
              >
                <AppIcon name="mdi-delete-outline" />
              </button>
            </div>
          </div>

          <!-- Flow Stats -->
          <div v-if="flow.stats" class="flow-stats">
            <div class="stat-item">
              <span class="stat-label">Executions</span>
              <span class="stat-value">{{ flow.stats.executions || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Success Rate</span>
              <span class="stat-value">{{ flow.stats.successRate || 0 }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Last Run</span>
              <span class="stat-value">{{
                formatLastRun(flow.stats.lastRun)
              }}</span>
            </div>
          </div>

          <!-- Flow Actions -->
          <div class="flow-actions">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-eye"
              >View</UnifiedButton
            >
            <UnifiedButton color="gaming" leading-icon="mdi-play"
              >Run Now</UnifiedButton
            >
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="empty-state glass p-6 gap-4 rounded-lg">
        <AppIcon name="mdi-lan-disconnect" class="empty-icon" />
        <h3>No Automation Flows</h3>
        <p>Create your first workflow to automate your career tasks</p>
        <UnifiedButton
          color="gaming"
          leading-icon="mdi-plus"
          @click="createNewFlow"
          >Create First Flow</UnifiedButton
        >
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-grid portfolio-grid">
        <div
          v-for="i in 4"
          :key="i"
          class="flow-card-skeleton glass p-4 gap-4 rounded-lg"
        >
          <div class="skeleton-header">
            <div class="skeleton-icon"></div>
            <div class="skeleton-info">
              <div class="skeleton-line skeleton-name"></div>
              <div class="skeleton-line skeleton-desc"></div>
            </div>
          </div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Flow Templates Modal -->
    <Teleport to="body">
      <div
        v-if="showTemplates"
        class="templates-modal-overlay"
        @click="closeTemplates"
      >
        <div class="templates-modal glass-modal" @click.stop>
          <div class="modal-header">
            <h2>Flow Templates</h2>
            <UnifiedButton
              color="ghost"
              appearance="text"
              icon-only
              icon="mdi-close"
              aria-label="Close"
              @click="closeTemplates"
            />
          </div>

          <div class="modal-content">
            <div class="templates-grid settings-grid">
              <div
                v-for="template in flowTemplates"
                :key="template.id"
                class="template-card glass p-4 gap-4 rounded-lg neon-interactive"
                @click="createFromTemplate(template)"
              >
                <div class="template-icon">
                  <i :class="template.icon" class="rgb-icon"></i>
                </div>
                <div class="template-info">
                  <h4>{{ template.name }}</h4>
                  <p>{{ template.description }}</p>
                  <div class="template-tags">
                    <span
                      v-for="tag in template.tags"
                      :key="tag"
                      class="template-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Flow Wizard Modal -->
    <Teleport to="body">
      <div
        v-if="showCreate"
        class="templates-modal-overlay"
        @click="closeCreate"
      >
        <div class="templates-modal glass-modal" @click.stop>
          <div class="modal-header">
            <h2>Create Flow</h2>
            <UnifiedButton
              color="ghost"
              appearance="text"
              icon-only
              icon="mdi-close"
              aria-label="Close"
              @click="closeCreate"
            />
          </div>
          <div class="modal-content">
            <form class="create-form" @submit.prevent="submitCreateFlow">
              <div class="form-row">
                <label class="form-label" for="cf-name">Name</label>
                <input
                  id="cf-name"
                  v-model="newFlow.name"
                  class="glass-input"
                  type="text"
                  placeholder="My New Flow"
                  required
                />
              </div>
              <div class="form-row">
                <label class="form-label" for="cf-desc">Description</label>
                <textarea
                  id="cf-desc"
                  v-model="newFlow.description"
                  class="glass-input"
                  rows="3"
                  placeholder="What does this flow do?"
                ></textarea>
              </div>
              <div class="form-row">
                <label class="form-label" for="cf-cat">Category</label>
                <select
                  id="cf-cat"
                  v-model="newFlow.category"
                  class="glass-input"
                >
                  <option
                    v-for="c in categories"
                    :key="c.value"
                    :value="c.value"
                  >
                    {{ c.label }}
                  </option>
                </select>
              </div>
              <div class="form-row">
                <label class="form-label" for="cf-cron"
                  >Schedule (cron, optional)</label
                >
                <input
                  id="cf-cron"
                  v-model="newFlow.scheduleCron"
                  class="glass-input"
                  type="text"
                  placeholder="e.g. 0 9 * * *"
                />
              </div>
            </form>
          </div>
          <div class="modal-actions">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              @click="closeCreate"
              >Cancel</UnifiedButton
            >
            <UnifiedButton
              color="gaming"
              leading-icon="mdi-plus"
              @click="submitCreateFlow"
              >Create Flow</UnifiedButton
            >
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Flow Details Modal -->
    <Teleport to="body">
      <div
        v-if="selectedFlow"
        class="flow-modal-overlay"
        @click="closeFlowDetails"
      >
        <div class="flow-modal glass-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <i
                :class="getFlowIcon(selectedFlow.category)"
                class="modal-icon"
              ></i>
              <h2>{{ selectedFlow.name }}</h2>
            </div>
            <UnifiedButton
              color="ghost"
              appearance="text"
              icon-only
              icon="mdi-close"
              aria-label="Close details"
              @click="closeFlowDetails"
            />
          </div>

          <div class="modal-content">
            <div class="flow-details">
              <div class="detail-section">
                <h3>Description</h3>
                <p>{{ selectedFlow.description }}</p>
              </div>

              <div v-if="selectedFlow.nodes?.length" class="detail-section">
                <h3>Flow Nodes ({{ selectedFlow.nodes.length }})</h3>
                <div class="nodes-list">
                  <div
                    v-for="node in selectedFlow.nodes"
                    :key="node.id"
                    class="node-item"
                  >
                    <i :class="getNodeIcon(node.type)" class="node-icon"></i>
                    <span class="node-label">{{
                      node.label || node.type
                    }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedFlow.schedule" class="detail-section">
                <h3>Schedule</h3>
                <p class="mb-2">{{ formatSchedule(selectedFlow.schedule) }}</p>
                <div class="d-flex align-items-center gap-3">
                  <label class="d-inline-flex align-items-center gap-2">
                    <input
                      v-model="scheduleEnabled"
                      type="checkbox"
                      @change="applyScheduleToggle"
                    />
                    <span>Enable schedule</span>
                  </label>
                  <span v-if="scheduleToggleBusy" class="text-muted small"
                    >Updating…</span
                  >
                </div>

                <div class="d-flex align-items-center gap-2 mt-2">
                  <input
                    v-model.trim="cronInput"
                    type="text"
                    class="glass-input"
                    placeholder="e.g., 0 9 * * *"
                    style="min-width: 220px"
                    :disabled="cronBusy"
                  />
                  <UnifiedButton
                    color="glass"
                    appearance="outlined"
                    :loading="cronBusy"
                    @click="applyCronUpdate"
                    >Update</UnifiedButton
                  >
                  <select
                    v-model="cronPreset"
                    class="glass-input"
                    aria-label="Cron preset"
                    @change="onCronPresetChange"
                  >
                    <option value="">Preset…</option>
                    <option
                      v-for="p in cronPresets"
                      :key="p.value"
                      :value="p.value"
                    >
                      {{ p.label }}
                    </option>
                  </select>
                </div>
                <div v-if="cronError" class="text-danger small mt-1">
                  {{ cronError }}
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              @click="closeFlowDetails"
              >Close</UnifiedButton
            >
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-pencil"
              @click="editFlow(selectedFlow)"
              >Edit Flow</UnifiedButton
            >
            <div class="d-flex align-items-center gap-2">
              <select
                v-if="getInjectNodes(selectedFlow).length > 1"
                v-model="selectedInjectId"
                class="glass-input"
                aria-label="Select inject node"
              >
                <option
                  v-for="n in getInjectNodes(selectedFlow)"
                  :key="n.id"
                  :value="n.id"
                >
                  {{ n.label || n.id }}
                </option>
              </select>
              <UnifiedButton
                color="gaming"
                leading-icon="mdi-play"
                @click="runFlow(selectedFlow)"
                >Run Now</UnifiedButton
              >
            </div>
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-content-copy"
              @click="duplicateFlow(selectedFlow, true)"
              >Duplicate as Draft</UnifiedButton
            >
          </div>
        </div>
      </div>
    </Teleport>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'

// Import the Node-RED service
import { nodeRedService } from '@/modules/integration/NodeRedService'
import AppIcon from '@/components/ui/AppIcon.vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import ViewToggle from '@/components/ui/ViewToggle.vue'

// Composables
const __router = useRouter()
// Theme is globally applied; no per-page theme binding needed
const responsive = useResponsive()
const toast = useToast()

// State
const loading = ref(false)
const nodeRedStatus = ref('disconnected')
const showTemplates = ref(false)
const showCreate = ref(false)
const selectedFlow = ref<any>(null)
// Missing refs used in template and handlers
const selectedInjectId = ref<string>('')
const scheduleEnabled = ref<boolean>(false)
const scheduleToggleBusy = ref(false)
const cronInput = ref<string>('')
const cronBusy = ref(false)
const cronError = ref('')
const cronPreset = ref<string>('')
const cronPresets = [
  { label: 'Hourly', value: '0 * * * *' },
  { label: 'Daily 9:00 AM', value: '0 9 * * *' },
  { label: 'Weekly Mon 10:00 AM', value: '0 10 * * MON' },
]
const filterCategory = ref('')
const searchQuery = ref('')
const debouncedQuery = ref('')
const sortBy = ref<'recent' | 'status' | 'name'>('recent')
const viewMode = ref<'grid' | 'list'>('grid')
const flows = ref<any[]>([])
const newFlow = ref({
  name: '',
  description: '',
  category: 'automation',
  scheduleCron: '',
})

// Flow stats
const flowStats = computed(() => ({
  total: flows.value.length,
  active: flows.value.filter(f => f.status === 'running').length,
  stopped: flows.value.filter(f => f.status === 'stopped').length,
}))

// Categories for chips
const categories = [
  { value: 'job-search', label: 'Job Search', icon: 'mdi-briefcase-search' },
  { value: 'application', label: 'Applications', icon: 'mdi-file-check' },
  { value: 'networking', label: 'Networking', icon: 'mdi-account-network' },
  { value: 'ai-assistance', label: 'AI Assist', icon: 'mdi-robot' },
  { value: 'analysis', label: 'Analysis', icon: 'mdi-chart-line' },
  { value: 'automation', label: 'Automation', icon: 'mdi-cog-sync' },
]

// Header stats for PageHeader
const headerStats = computed(() => [
  {
    icon: 'mdi-lan',
    color: 'var(--color-primary-500)',
    value: flowStats.value.total,
    label: 'Flows',
  },
  {
    icon: 'mdi-play',
    color: 'var(--color-success-500)',
    value: flowStats.value.active,
    label: 'Running',
  },
  {
    icon: 'mdi-stop',
    color: 'var(--color-error-500)',
    value: flowStats.value.stopped,
    label: 'Stopped',
  },
  {
    icon:
      nodeRedStatus.value === 'connected'
        ? 'mdi-power-plug'
        : 'mdi-power-plug-off',
    text:
      nodeRedStatus.value === 'connected'
        ? 'Node-RED Connected'
        : nodeRedStatus.value === 'error'
          ? 'Node-RED Error'
          : 'Node-RED Offline',
    success: nodeRedStatus.value === 'connected',
    warning: nodeRedStatus.value !== 'connected',
  },
])

// Base filtered flows (category + search)
const filteredFlows = computed(() => {
  let items = flows.value
  if (filterCategory.value)
    items = items.filter(f => f.category === filterCategory.value)
  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    items = items.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q)
    )
  }
  return items
})

// Sorted view of filtered flows
const sortedFilteredFlows = computed(() => {
  const items = [...filteredFlows.value]
  switch (sortBy.value) {
    case 'status':
      return items.sort((a, b) => (a.status > b.status ? 1 : -1))
    case 'name':
      return items.sort((a, b) => a.name.localeCompare(b.name))
    case 'recent':
    default:
      return items.sort(
        (a, b) =>
          (b.stats?.lastRun?.getTime?.() || 0) -
          (a.stats?.lastRun?.getTime?.() || 0)
      )
  }
})

// Mock data for flow templates
const flowTemplates = [
  {
    id: 'job-alert',
    name: 'Gaming Job Alerts',
    description: 'Automatically scan job boards for gaming industry positions',
    icon: 'mdi-briefcase-search',
    tags: ['Jobs', 'Automation', 'Alerts'],
    category: 'job-search',
  },
  {
    id: 'application-tracker',
    name: 'Application Tracker',
    description: 'Track job applications and send follow-up reminders',
    icon: 'mdi-file-check',
    tags: ['Applications', 'Tracking', 'Reminders'],
    category: 'application',
  },
  {
    id: 'linkedin-connect',
    name: 'LinkedIn Networking',
    description:
      'Automate LinkedIn connections with gaming industry professionals',
    icon: 'mdi-account-network',
    tags: ['Networking', 'LinkedIn', 'Social'],
    category: 'networking',
  },
  {
    id: 'portfolio-update',
    name: 'Portfolio Sync',
    description: 'Automatically update portfolio with latest projects',
    icon: 'mdi-folder-sync',
    tags: ['Portfolio', 'Sync', 'Updates'],
    category: 'automation',
  },
  {
    id: 'ai-resume',
    name: 'AI Resume Optimization',
    description: 'Use AI to optimize resume for specific job postings',
    icon: 'mdi-robot',
    tags: ['AI', 'Resume', 'Optimization'],
    category: 'ai-assistance',
  },
  {
    id: 'skill-monitor',
    name: 'Skill Gap Monitor',
    description: 'Monitor job market for emerging skills and trends',
    icon: 'mdi-trending-up',
    tags: ['Skills', 'Market', 'Trends'],
    category: 'analysis',
  },
]

// Methods
const initializeNodeRed = async () => {
  try {
    loading.value = true
    await nodeRedService.initialize()
    nodeRedStatus.value = nodeRedService.isHealthy()
      ? 'connected'
      : 'disconnected'
    await loadFlows()
  } catch (error) {
    console.error('Failed to initialize Node-RED:', error)
    nodeRedStatus.value = 'error'
  } finally {
    loading.value = false
  }
}

const loadFlows = async () => {
  try {
    // Try actual Node-RED flows first
    if (nodeRedService.isHealthy()) {
      const nodeRedFlows: any[] = await nodeRedService.getFlows()
      flows.value = (Array.isArray(nodeRedFlows) ? nodeRedFlows : []).map(
        mapNodeRedFlowToUI
      )
      toast.success('Flows loaded from Node-RED')
      return
    }
    // Fallback mock
    flows.value = []
  } catch (error) {
    console.error('Failed to load flows:', error)
    toast.error('Failed to load flows')
  }
}

const refreshFlows = () => {
  loading.value = true
  Promise.resolve(loadFlows()).finally(() => (loading.value = false))
}

const createNewFlow = () => {
  showCreate.value = true
}

const openTemplate = () => {
  showTemplates.value = true
}

const closeTemplates = () => {
  showTemplates.value = false
}

const createFromTemplate = async (template: any) => {
  try {
    const flowDef: any = buildNodeRedFlowForTemplate(template)
    if (nodeRedService.isHealthy()) {
      try {
        const id = await (nodeRedService as any).createFlow(flowDef)
        try {
          await (nodeRedService as any).deployFlows()
        } catch {}
        const uiFlow = mapNodeRedFlowToUI({ ...flowDef, id })
        flows.value = [uiFlow, ...flows.value]
        toast.success(`Created “${uiFlow.name}” from template`)
        showTemplates.value = false
        return
      } catch (e) {
        console.info('Failed to create template in Node-RED, falling back:', e)
      }
    }
    // Local fallback
    const localId = 'local-' + Date.now()
    const uiFlow = mapNodeRedFlowToUI({ ...flowDef, id: localId })
    flows.value = [uiFlow, ...flows.value]
    toast.success(`Created “${uiFlow.name}” (local)`)
    showTemplates.value = false
  } catch (e) {
    console.error('Template creation failed:', e)
    toast.error('Failed to create flow from template')
  }
}

function buildNodeRedFlowForTemplate(t: any) {
  const makeId = () => Math.random().toString(36).slice(2)
  const nodes: any[] = []
  const base = { label: t.name, type: 'tab', disabled: false, nodes }
  const add = (node: any) => {
    nodes.push(node)
    return node
  }

  const addInject = (name: string, cron?: string) =>
    add({
      id: makeId(),
      type: 'inject',
      name,
      x: 100,
      y: 100,
      z: 'z',
      wires: [[]],
      crontab: cron || '',
      properties: { crontab: cron || '' },
    })
  const addFunction = (name: string, func: string) =>
    add({
      id: makeId(),
      type: 'function',
      name,
      x: 300,
      y: 100,
      z: 'z',
      wires: [[]],
      func,
    })
  const addHttpRequest = (name: string, url: string) =>
    add({
      id: makeId(),
      type: 'http request',
      name,
      x: 300,
      y: 100,
      z: 'z',
      wires: [[]],
      url,
    })
  const addDebug = (name = 'Debug') =>
    add({
      id: makeId(),
      type: 'debug',
      name,
      x: 520,
      y: 100,
      z: 'z',
      wires: [],
    })

  switch (t.id) {
    case 'job-alert': {
      const i = addInject('Daily 9am', '0 9 * * *')
      const h = addHttpRequest(
        'Fetch jobs',
        'https://example.com/jobs?q=gaming'
      )
      const f = addFunction(
        'Filter gaming',
        'msg.payload = (msg.payload || []).filter(j => /game|unity|unreal/i.test(j.title || ""));\nreturn msg;'
      )
      const d = addDebug('Alert output')
      i.wires = [[h.id]]
      h.wires = [[f.id]]
      f.wires = [[d.id]]
      break
    }
    case 'application-tracker': {
      const f = addFunction(
        'Track application',
        'node.status({text:"received"});\nreturn msg;'
      )
      const d = addDebug('Tracked')
      f.wires = [[d.id]]
      break
    }
    case 'linkedin-connect': {
      const i = addInject('Weekly Mon 10am', '0 10 * * MON')
      const f = addFunction(
        'Build outreach list',
        'msg.payload = { prospects: [] }; return msg;'
      )
      const d = addDebug('Outreach')
      i.wires = [[f.id]]
      f.wires = [[d.id]]
      break
    }
    case 'portfolio-update': {
      const i = addInject('Nightly 2am', '0 2 * * *')
      const f = addFunction('Sync portfolio', 'return msg;')
      const d = addDebug('Sync result')
      i.wires = [[f.id]]
      f.wires = [[d.id]]
      break
    }
    case 'ai-resume': {
      const i = addInject('Manual trigger')
      const a = add({
        id: makeId(),
        type: 'ai-resume-analyzer',
        name: 'AI Resume',
        x: 300,
        y: 100,
        z: 'z',
        wires: [[], []],
      })
      const d = addDebug('Analysis')
      i.wires = [[a.id]]
      a.wires = [[d.id], []]
      break
    }
    case 'skill-monitor':
    default: {
      const i = addInject('Hourly', '0 * * * *')
      const f = addFunction('Monitor skills', 'return msg;')
      const d = addDebug('Report')
      i.wires = [[f.id]]
      f.wires = [[d.id]]
      break
    }
  }
  return base
}

const openNodeRedUI = () => {
  // Open Node-RED UI in new tab
  const url = import.meta.env?.VITE_NODE_RED_BASE_URL
  if (url) {
    window.open(url, '_blank')
  } else {
    console.info('Node-RED URL not configured (VITE_NODE_RED_BASE_URL).')
  }
}

const viewLogs = () => {
  // Navigate to logs view
  console.log('Opening logs...')
}

const toggleFlow = async (flow: any) => {
  try {
    const stopping = flow.status === 'running'
    if (nodeRedService.isHealthy()) {
      try {
        if (stopping) await (nodeRedService as any).stopFlow(flow.id)
        else await (nodeRedService as any).startFlow(flow.id)
      } catch {
        /* non-fatal */
      }
    }
    flow.status = stopping ? 'stopped' : 'running'
    toast.success(stopping ? 'Flow stopped' : 'Flow started')
  } catch (error) {
    console.error('Failed to toggle flow:', error)
    toast.error('Failed to toggle flow')
  }
}

const editFlow = (flow: any) => {
  console.log('Editing flow:', flow)
  // In real implementation, would navigate to flow editor
}

const runFlow = async (flow: any) => {
  try {
    if (nodeRedService.isHealthy()) {
      let injectId = (selectedInjectId.value || '').trim()
      if (!injectId) {
        const injectNode = (flow.nodes || []).find(
          (n: any) => n.type === 'inject'
        )
        injectId = injectNode?.id || ''
      }
      if (injectId) {
        await (nodeRedService as any).triggerFlow(injectId)
        toast.success('Flow executed')
      } else {
        toast.info('No inject node found on this flow')
      }
    }
  } catch (error) {
    console.error('Failed to run flow:', error)
    toast.error('Failed to run flow')
  }
}

const openFlowDetails = (flow: any) => {
  selectedFlow.value = flow
  scheduleEnabled.value = !!flow?.schedule?.enabled
  cronInput.value = flow?.schedule?.cron || ''
  cronError.value = ''
  try {
    const inject = (flow?.nodes || []).find((n: any) => n.type === 'inject')
    selectedInjectId.value = inject?.id || ''
  } catch {
    selectedInjectId.value = ''
  }
}

const closeFlowDetails = () => {
  selectedFlow.value = null
}

// Local flow utilities
const duplicateFlow = async (flow: any, asDraft = false) => {
  try {
    if (nodeRedService.isHealthy()) {
      // Try to fetch original from cache and clone
      const original = flow
      const cloneLabel = `${flow.name || original.label || 'Flow'} (Copy)`
      const cloned: any = {
        label: cloneLabel,
        type: 'tab',
        nodes: (original.nodes || []).map((n: any) => ({
          ...n,
          id: undefined,
        })),
        disabled: asDraft ? true : original.status === 'stopped',
      }
      try {
        const newId = await (nodeRedService as any).createFlow(cloned)
        flows.value = [
          {
            ...flow,
            id: newId,
            name: cloneLabel,
            status: asDraft ? 'stopped' : flow.status,
          },
          ...flows.value,
        ]
        toast.success('Flow duplicated')
        return
      } catch {
        /* fallthrough */
      }
    }
    // Local fallback
    const now = Date.now()
    const copy = {
      ...flow,
      id: `${flow.id}-copy-${now}`,
      name: `${flow.name} (Copy)`,
      status: asDraft ? 'stopped' : flow.status,
      stats: { ...(flow.stats || {}), lastRun: null },
    }
    flows.value = [copy, ...flows.value]
    toast.success('Flow duplicated (local)')
  } catch (e) {
    console.error('Failed to duplicate flow:', e)
    toast.error('Failed to duplicate flow')
  }
}

const deleteFlow = async (flow: any) => {
  if (!confirm(`Delete flow "${flow.name}"? This cannot be undone.`)) return
  try {
    if (nodeRedService.isHealthy()) {
      try {
        await (nodeRedService as any).deleteFlow(flow.id)
        await (nodeRedService as any).deployFlows()
      } catch {}
    }
  } finally {
    flows.value = flows.value.filter(f => f.id !== flow.id)
  }
}

const closeCreate = () => {
  showCreate.value = false
}

const submitCreateFlow = async () => {
  if (!newFlow.value.name) return
  const baseFlow: any = {
    label: newFlow.value.name,
    type: 'tab',
    disabled: false,
    nodes: [
      {
        id: 'inject-1',
        type: 'inject',
        name: 'Trigger',
        x: 100,
        y: 100,
        z: 'z',
        wires: [['debug-1']],
        properties: { topic: 'start' },
      },
      {
        id: 'debug-1',
        type: 'debug',
        name: 'Log',
        x: 300,
        y: 100,
        z: 'z',
        wires: [],
      },
    ],
  }
  try {
    const id = await (nodeRedService as any).createFlow(baseFlow)
    try {
      await (nodeRedService as any).deployFlows()
    } catch {}
    flows.value = [
      {
        id,
        name: newFlow.value.name,
        description: newFlow.value.description,
        category: newFlow.value.category,
        status: 'stopped',
        stats: { executions: 0, successRate: 100, lastRun: null },
        nodes: baseFlow.nodes,
        schedule: newFlow.value.scheduleCron
          ? { cron: newFlow.value.scheduleCron, enabled: true }
          : null,
      },
      ...flows.value,
    ]
    showCreate.value = false
    newFlow.value = {
      name: '',
      description: '',
      category: 'automation',
      scheduleCron: '',
    }
  } catch (e) {
    console.info('Create in Node-RED failed; adding locally:', e)
    const id = 'local-' + Date.now()
    flows.value = [
      {
        id,
        name: newFlow.value.name,
        description: newFlow.value.description,
        category: newFlow.value.category,
        status: 'stopped',
        stats: { executions: 0, successRate: 100, lastRun: null },
        nodes: baseFlow.nodes,
        schedule: newFlow.value.scheduleCron
          ? { cron: newFlow.value.scheduleCron, enabled: true }
          : null,
      },
      ...flows.value,
    ]
    showCreate.value = false
    newFlow.value = {
      name: '',
      description: '',
      category: 'automation',
      scheduleCron: '',
    }
  }
}

// Utility functions
const getFlowIcon = (category: string) => {
  const icons = {
    'job-search': 'mdi-briefcase-search',
    application: 'mdi-file-check',
    networking: 'mdi-account-network',
    'ai-assistance': 'mdi-robot',
    analysis: 'mdi-chart-line',
    automation: 'mdi-cog-sync',
  }
  return (icons as Record<string, string>)[category] || 'mdi-lan'
}

const getNodeIcon = (type: string) => {
  const icons = {
    'http-request': 'mdi-web',
    function: 'mdi-code-braces',
    email: 'mdi-email',
    database: 'mdi-database',
    schedule: 'mdi-clock',
  }
  return (icons as Record<string, string>)[type] || 'mdi-circle'
}

const formatCategory = (category: string) => {
  return category
    .replace('-', ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase())
}

const formatLastRun = (date: Date | null) => {
  if (!date) return 'Never'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

const formatSchedule = (schedule: any) => {
  if (!schedule) return 'Manual'
  // Convert cron to human readable
  const cronMap = {
    '0 9 * * *': 'Daily at 9:00 AM',
    '0 10 * * MON': 'Every Monday at 10:00 AM',
    '0 2 * * *': 'Daily at 2:00 AM',
  }
  return (cronMap as Record<string, string>)[schedule.cron] || 'Custom schedule'
}

// Initialize
onMounted(() => {
  initializeNodeRed()
})

// UI state persistence and search debounce
const SETTINGS_KEY = 'theflow-ui-settings'
let debounceTimer: any = null

// Restore saved settings
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  if (saved && typeof saved === 'object') {
    if (saved.viewMode) viewMode.value = saved.viewMode
    if (saved.sortBy) sortBy.value = saved.sortBy
    if (typeof saved.filterCategory === 'string')
      filterCategory.value = saved.filterCategory
    if (typeof saved.searchQuery === 'string') {
      searchQuery.value = saved.searchQuery
      debouncedQuery.value = saved.searchQuery
    }
  }
} catch {}

// Persist and debounce
watch([viewMode, sortBy, filterCategory, searchQuery], ([v, s, f, q]) => {
  // Debounce search to avoid recomputing too often
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = q || ''
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          viewMode: v,
          sortBy: s,
          filterCategory: f,
          searchQuery: q,
        })
      )
    } catch {}
  }, 200)
})

// Toggle schedule enabled/disabled on inject nodes
const applyScheduleToggle = async () => {
  if (!selectedFlow.value) return
  scheduleToggleBusy.value = true
  try {
    if (nodeRedService.isHealthy()) {
      try {
        const all: any[] = await (nodeRedService as any).getFlows()
        const raw = (all || []).find((f: any) => f.id === selectedFlow.value.id)
        if (raw) {
          const nodes: any[] = Array.isArray(raw.nodes)
            ? raw.nodes
            : Array.isArray(raw.flow)
              ? raw.flow
              : []
          const idx = nodes.findIndex((n: any) => n?.type === 'inject')
          if (idx >= 0) {
            nodes[idx] = { ...nodes[idx], disabled: !scheduleEnabled.value }
            await (nodeRedService as any).updateFlow(selectedFlow.value.id, {
              nodes,
            })
          }
        }
      } catch {
        /* non-fatal */
      }
    }
    // Update local flag
    selectedFlow.value.schedule = selectedFlow.value.schedule || {}
    selectedFlow.value.schedule.enabled = !!scheduleEnabled.value
    toast.success(`Schedule ${scheduleEnabled.value ? 'enabled' : 'disabled'}`)
  } finally {
    scheduleToggleBusy.value = false
  }
}

// Map Node-RED flow to UI shape
function mapNodeRedFlowToUI(f: any) {
  const nodes: any[] = Array.isArray(f.nodes)
    ? f.nodes
    : Array.isArray(f?.flow)
      ? f.flow
      : []
  const inject = (nodes || []).find(n => n?.type === 'inject') || {}
  const cron = (inject as any).crontab || (inject as any)?.properties?.crontab
  const disabled = !!f.disabled
  return {
    id: f.id,
    name: f.label || f.name || 'Flow',
    description: f.info || '',
    category: 'automation',
    status: disabled ? 'stopped' : 'running',
    stats: { executions: 0, successRate: 100, lastRun: null as Date | null },
    nodes: (nodes || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      label: n.name || n.type,
    })),
    schedule: cron ? { cron, enabled: !(inject as any).disabled } : null,
  }
}

// Update Cron on inject node
const applyCronUpdate = async () => {
  cronError.value = ''
  if (!selectedFlow.value) return
  const cron = (cronInput.value || '').trim()
  if (!cron) {
    cronError.value = 'Cron cannot be empty'
    return
  }
  const parts = cron.split(/\s+/).filter(Boolean)
  if (parts.length < 5) {
    cronError.value = 'Invalid cron pattern (expected 5 fields)'
    return
  }
  cronBusy.value = true
  try {
    if (nodeRedService.isHealthy()) {
      try {
        const all: any[] = await (nodeRedService as any).getFlows()
        const raw = (all || []).find((f: any) => f.id === selectedFlow.value.id)
        if (raw) {
          const nodes: any[] = Array.isArray(raw.nodes)
            ? raw.nodes
            : Array.isArray(raw.flow)
              ? raw.flow
              : []
          const idx = nodes.findIndex((n: any) => n?.type === 'inject')
          if (idx >= 0) {
            nodes[idx] = { ...nodes[idx], crontab: cron }
            await (nodeRedService as any).updateFlow(selectedFlow.value.id, {
              nodes,
            })
            selectedFlow.value.schedule = selectedFlow.value.schedule || {}
            ;(selectedFlow.value.schedule as any).cron = cron
            toast.success('Schedule updated')
            return
          }
        }
        toast.info('No inject node found to update cron')
      } catch {
        cronError.value = 'Failed to update schedule'
        toast.error('Failed to update schedule')
      }
    } else {
      // Local-only update
      selectedFlow.value.schedule = selectedFlow.value.schedule || {}
      ;(selectedFlow.value.schedule as any).cron = cron
      toast.success('Schedule updated (local)')
    }
  } finally {
    cronBusy.value = false
  }
}

// Helper to list inject nodes for a flow
function getInjectNodes(flow: any) {
  try {
    return (flow?.nodes || []).filter((n: any) => n.type === 'inject')
  } catch {
    return []
  }
}

// Preset handler
function onCronPresetChange() {
  if (cronPreset.value) {
    cronInput.value = cronPreset.value
  }
}
</script>

<style scoped>
/* THE FLOW - Black/White Glasmorphic Styling */

.the-flow {
  min-height: 100vh;
  background: var(--surface-base);
}

/* Header Styling */
/* Header handled by PageHeader */

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-8);
}

.brand-section h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.rgb-icon {
  background: linear-gradient(45deg, #ff0080, #00ff80, #8000ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rgbPulse 3s ease-in-out infinite alternate;
}

.text-gradient-rgb {
  background: linear-gradient(
    45deg,
    var(--text-primary),
    var(--color-primary-400)
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle-glass {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: var(--spacing-2) 0 0;
}

.header-stats {
  display: flex;
  gap: var(--spacing-4);
}

.stat-card {
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4) var(--spacing-6);
  text-align: center;
  min-width: 100px;
  transition: all var(--duration-normal);
}

.stat-card.connected {
  border-color: #00ff80;
  box-shadow: 0 0 20px rgba(0, 255, 128, 0.3);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-1);
}

/* Quick Actions */
.quick-actions {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-md);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  position: relative;
  overflow: hidden;
}

.quick-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary-500),
    var(--color-secondary-500),
    var(--color-accent-500)
  );
  opacity: 0.8;
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.section-title h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
}

.section-title p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

@media (min-width: 768px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  cursor: pointer;
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, var(--color-primary-500/5));
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-2xl);
  border-color: var(--color-primary-400);
}

.action-card:hover::before {
  opacity: 1;
}

.action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  transition: transform var(--duration-normal);
  position: relative;
  z-index: 1;
}

.action-content h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1);
}

.action-content p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Flows Section */
.flows-section {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-md);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 2px solid var(--border-base);
  position: relative;
}

.section-header.enhanced-header {
  background: linear-gradient(
    135deg,
    var(--surface-glass),
    var(--surface-elevated)
  );
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-8);
  border-bottom: none;
}

.section-header .header-content h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
  background: linear-gradient(
    135deg,
    var(--text-primary),
    var(--color-primary-500)
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}

/* Removed - replaced by enhanced header styles above */

.section-controls {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-wrap: wrap;
}

/* Category Section */
.category-section {
  margin-bottom: var(--spacing-8);
}

.category-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4);
  text-align: center;
}

.enhanced-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  justify-content: center;
}

.enhanced-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.enhanced-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--color-primary-500/10),
    var(--color-secondary-500/10)
  );
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.enhanced-chip:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-400);
  color: var(--text-primary);
}

.enhanced-chip:hover::before {
  opacity: 1;
}

.enhanced-chip.active {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: var(--color-primary-contrast);
  box-shadow: 0 0 20px var(--color-primary-500/30);
}

.enhanced-chip.active::before {
  opacity: 0;
}

.chip-icon {
  font-size: var(--font-size-lg);
  transition: transform var(--duration-normal);
}

.enhanced-chip:hover .chip-icon {
  transform: scale(1.1);
}

.chip-badge {
  background: var(--color-primary-contrast);
  color: var(--color-primary-500);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  min-width: 20px;
  text-align: center;
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: transparent;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.refresh-btn:hover {
  background: var(--surface-glass);
  border-color: var(--color-primary-300);
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Flows Grid */
.flows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-6);
}

@media (min-width: 1200px) {
  .flows-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1600px) {
  .flows-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.flow-card {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-base);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  cursor: pointer;
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.flow-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-primary-500),
    var(--color-secondary-500),
    var(--color-accent-500)
  );
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.flow-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, var(--color-primary-500/3));
  opacity: 0;
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.flow-card:hover {
  transform: translateY(-6px);
  box-shadow:
    var(--shadow-2xl),
    0 0 30px var(--color-primary-500/20);
  border-color: var(--color-primary-400);
}

.flow-card:hover::before {
  opacity: 1;
}

.flow-card:hover::after {
  opacity: 1;
}

.flow-header {
  display: flex;
  gap: var(--spacing-4);
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.flow-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-type-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-primary-500);
}

.flow-info {
  flex: 1;
}

.flow-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1);
}

.flow-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--spacing-3);
  line-height: var(--line-height-normal);
}

.flow-meta {
  display: flex;
  gap: var(--spacing-2);
}

.category-badge,
.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.category-job-search {
  background: var(--color-info-100);
  color: var(--color-info-900);
}
.category-application {
  background: var(--color-secondary-100);
  color: var(--color-secondary-900);
}
.category-networking {
  background: var(--color-success-100);
  color: var(--color-success-900);
}
.category-ai-assistance {
  background: var(--color-warning-100);
  color: var(--color-warning-900);
}
.category-analysis {
  background: var(--color-accent-100);
  color: var(--color-accent-900);
}
.category-automation {
  background: var(--color-primary-100);
  color: var(--color-primary-900);
}

:global([data-theme='dark']) .category-job-search {
  background: var(--color-info-800);
  color: var(--color-info-100);
}
:global([data-theme='dark']) .category-application {
  background: var(--color-secondary-800);
  color: var(--color-secondary-100);
}
:global([data-theme='dark']) .category-networking {
  background: var(--color-success-800);
  color: var(--color-success-100);
}
:global([data-theme='dark']) .category-ai-assistance {
  background: var(--color-warning-800);
  color: var(--color-warning-100);
}
:global([data-theme='dark']) .category-analysis {
  background: var(--color-accent-800);
  color: var(--color-accent-100);
}
:global([data-theme='dark']) .category-automation {
  background: var(--color-primary-800);
  color: var(--color-primary-100);
}

.status-running {
  background: var(--color-success-100);
  color: var(--color-success-900);
}

.status-stopped {
  background: var(--color-error-100);
  color: var(--color-error-900);
}

:global([data-theme='dark']) .status-running {
  background: var(--color-success-800);
  color: var(--color-success-100);
}

:global([data-theme='dark']) .status-stopped {
  background: var(--color-error-800);
  color: var(--color-error-100);
}

.flow-controls {
  display: flex;
  gap: var(--spacing-2);
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast);
}

.control-btn:hover {
  background: var(--surface-glass);
  border-color: var(--color-primary-300);
  color: var(--text-primary);
}

.control-btn.active {
  background: var(--color-success-500);
  border-color: var(--color-success-500);
  color: var(--color-success-contrast, white);
}

/* Flow Stats */
.flow-stats {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  margin: var(--spacing-4) 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.flow-stats .stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-1);
}

.flow-stats .stat-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* Flow Actions */
.flow-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: auto;
  padding-top: var(--spacing-4);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.glass-button-primary {
  background: var(--color-primary-500);
  border: 1px solid var(--color-primary-500);
  color: white;
}

.glass-button-primary:hover {
  background: var(--color-primary-600);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.glass-button-outline {
  background: transparent;
  border: 1px solid var(--border-base);
  color: var(--text-primary);
}

.glass-button-outline:hover {
  background: var(--surface-glass);
  border-color: var(--color-primary-300);
}

/* Loading States */
.loading-grid {
  display: grid;
  gap: var(--spacing-6);
}

.flow-card-skeleton {
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  animation: shimmer 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.flow-card-skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-primary-500/10),
    transparent
  );
  animation: shimmer-wave 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.skeleton-icon {
  width: 56px;
  height: 56px;
  background: var(--surface-elevated);
  border-radius: var(--radius-xl);
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-line {
  height: 16px;
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
}

.skeleton-name {
  width: 70%;
}

.skeleton-desc {
  width: 85%;
}

.skeleton-content .skeleton-line {
  margin-bottom: var(--spacing-2);
  width: 90%;
}

.skeleton-content .skeleton-line:last-child {
  width: 60%;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-20) var(--spacing-8);
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary-500),
    var(--color-secondary-500)
  );
  opacity: 0.6;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-4);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-6);
}

/* Modal Styling */
.templates-modal-overlay,
.flow-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.templates-modal,
.flow-modal {
  background: var(--surface-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-2xl);
  max-width: var(--page-content-max-width);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-base);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.modal-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-primary-500);
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.close-btn:hover {
  background: var(--surface-glass);
  color: var(--text-primary);
}

.modal-content {
  padding: var(--spacing-6);
  max-height: 60vh;
  overflow-y: auto;
}

/* Templates Grid */
.templates-grid {
  display: grid;
  gap: var(--spacing-4);
}

.template-card {
  display: flex;
  gap: var(--spacing-4);
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-300);
}

.template-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.template-info h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1);
}

.template-info p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-3);
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.template-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Flow Details */
.flow-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.detail-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3);
}

.detail-section p {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.nodes-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.node-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--surface-glass);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.node-icon {
  color: var(--color-primary-500);
}

.node-label {
  color: var(--text-primary);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--border-base);
}

.modal-actions .glass-button-outline,
.modal-actions .glass-button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
  cursor: pointer;
}

.modal-actions .glass-button-outline {
  background: transparent;
  border: 1px solid var(--border-base);
  color: var(--text-primary);
}

.modal-actions .glass-button-primary {
  background: var(--color-primary-500);
  border: 1px solid var(--color-primary-500);
  color: white;
}

/* Animations */
@keyframes rgbPulse {
  0% {
    background: linear-gradient(45deg, #ff0080, #00ff80, #8000ff);
  }
  50% {
    background: linear-gradient(45deg, #8000ff, #ff0080, #00ff80);
  }
  100% {
    background: linear-gradient(45deg, #00ff80, #8000ff, #ff0080);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes shimmer-wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-4);
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }

  .action-card {
    padding: var(--spacing-4);
  }

  .section-header.enhanced-header {
    padding: var(--spacing-4);
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-4);
  }

  .section-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }

  .enhanced-chips {
    gap: var(--spacing-2);
  }

  .enhanced-chip {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-xs);
  }

  .flows-grid,
  .loading-grid,
  .templates-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .flow-card {
    min-height: auto;
    padding: var(--spacing-5);
  }

  .flow-header {
    gap: var(--spacing-3);
  }

  .flow-icon {
    width: 48px;
    height: 48px;
  }

  .flow-stats {
    gap: var(--spacing-3);
    padding: var(--spacing-3);
  }

  .flow-actions,
  .modal-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .quick-actions {
    padding: var(--spacing-6);
  }

  .flows-section {
    padding: var(--spacing-6);
  }

  .empty-state {
    padding: var(--spacing-12) var(--spacing-6);
  }
}

@media (max-width: 480px) {
  .section-title h2 {
    font-size: var(--font-size-xl);
  }

  .section-header .header-content h2 {
    font-size: var(--font-size-2xl);
  }

  .action-icon {
    font-size: 2rem;
  }

  .flow-name {
    font-size: var(--font-size-md);
  }

  .enhanced-chip {
    padding: var(--spacing-1) var(--spacing-2);
  }
}
</style>
