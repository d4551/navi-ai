<template>
  <div class="enhanced-portfolio-system font-sans">
    <!-- Header with Stats -->
    <div class="portfolio-header glass-panel mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-primary-600 mb-2">Portfolio System</h1>
          <p class="text-secondary">Create, manage, and share your professional portfolio</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ portfolioStats.totalProjects }}</div>
            <div class="stat-label">Projects</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">Total Views</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeShares.length }}</div>
            <div class="stat-label">Active Shares</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs (master design, multi-flex flex-wrap grid) -->
    <GlassNavTabs
      v-model:active-tab="activeTab"
      :tabs="navTabs"
      :grid-layout="true"
      aria-label="Portfolio Tabs"
    />

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Portfolio Projects Tab -->
      <div v-if="activeTab === 'projects'" class="projects-tab">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Your Projects</h2>
          <div class="flex gap-glass-md">
            <button
              class="btn btn-outline"
              @click="showTemplateModal = true"
            >
              <AppIcon name="mdi-shape-outline" />
              Use Template
            </button>
            <button
              class="btn btn-primary"
              @click="createNewProject"
            >
              <AppIcon name="PlusIcon" />
              New Project
            </button>
          </div>
        </div>

        <!-- Project Filters -->
        <div class="project-filters mb-6">
          <div class="filter-group">
            <label>Category:</label>
            <select v-model="selectedCategory" class="form-select">
              <option value="">All Categories</option>
              <option value="game">Game Development</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="tool">Tools & Utilities</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="selectedStatus" class="form-select">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="planned">Planned</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="filter-group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search projects..."
              class="form-input"
            >
          </div>
        </div>

        <!-- Projects Grid -->
        <div class="projects-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            @click="editProject(project)"
          >
            <div class="project-header">
              <h3 class="project-title">{{ project.title }}</h3>
              <div class="project-status" :class="project.status">
                {{ project.status.replace('-', ' ') }}
              </div>
            </div>
            
            <p class="project-description">{{ project.description }}</p>
            
            <div class="project-meta">
              <div class="project-category">
                <AppIcon :name="getCategoryIcon(project.category)" />
                {{ project.category }}
              </div>
              <div class="project-date">
                {{ formatDate(project.updatedAt) }}
              </div>
            </div>
            
            <div class="project-technologies">
              <span
                v-for="tech in project.technologies.slice(0, 3)"
                :key="tech"
                class="tech-tag"
              >
                {{ tech }}
              </span>
              <span v-if="project.technologies.length > 3" class="tech-more">
                +{{ project.technologies.length - 3 }} more
              </span>
            </div>
            
            <div class="project-actions">
              <button
                class="btn btn-sm btn-outline"
                @click.stop="toggleFeatured(project)"
              >
                <AppIcon :name="project.featured ? 'StarIcon' : 'StarIcon-outline'" />
                {{ project.featured ? 'Featured' : 'Feature' }}
              </button>
              <button
                class="btn btn-sm btn-outline"
                @click.stop="duplicateProject(project)"
              >
                <AppIcon name="DocumentDuplicateIcon" />
                Duplicate
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredProjects.length === 0" class="empty-state">
          <AppIcon name="FolderIcon-open-outline" />
          <h3>No projects found</h3>
          <p>Create your first project or adjust your filters</p>
          <UnifiedButton variant="primary" @click="createNewProject">Create Project</UnifiedButton>
        </div>
      </div>

      <!-- Templates Tab -->
      <div v-if="activeTab === 'templates'" class="templates-tab">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Portfolio Templates</h2>
          <UnifiedButton variant="primary" leading-icon="PlusIcon" @click="showCreateTemplateModal = true">Create Template</UnifiedButton>
        </div>

        <!-- Template Categories -->
        <div class="template-categories mb-6">
          <button
            v-for="category in templateCategories"
            :key="category.id"
            :class="['category-btn', { active: selectedTemplateCategory === category.id }]"
            @click="selectedTemplateCategory = category.id"
          >
            <AppIcon :name="category.icon" />
            {{ category.name }}
            <span class="category-count">{{ category.templates.length }}</span>
          </button>
        </div>

        <!-- Template Grid -->
        <div class="templates-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
          >
            <div class="template-preview">
              <img
                v-if="template.preview.thumbnail"
                :src="template.preview.thumbnail"
                :alt="template.name"
                class="template-thumbnail"
              >
              <div v-else class="template-placeholder">
                <AppIcon name="PhotoIcon-outline" />
              </div>
            </div>
            
            <div class="template-content">
              <h3 class="template-title">{{ template.name }}</h3>
              <p class="template-description">{{ template.description }}</p>
              
              <div class="template-meta">
                <span class="template-difficulty" :class="template.difficulty">
                  {{ template.difficulty }}
                </span>
                <span class="template-time">
                  <AppIcon name="ClockIcon" />
                  {{ template.estimatedTime }}min
                </span>
              </div>
              
              <div class="template-tags">
                <span
                  v-for="tag in template.tags.slice(0, 3)"
                  :key="tag"
                  class="template-tag"
                >
                  {{ tag }}
                </span>
              </div>
              
              <div class="template-actions">
                <button
                  class="btn btn-primary w-full"
                  @click="useTemplate(template)"
                >
                  <AppIcon name="PlusIcon" />
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sharing Tab -->
      <div v-if="activeTab === 'sharing'" class="sharing-tab">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Portfolio Sharing</h2>
          <button
            class="btn btn-primary"
            @click="showCreateShareModal = true"
          >
            <AppIcon name="ShareIcon" />
            Create Share Link
          </button>
        </div>

        <!-- Sharing Stats -->
        <div class="sharing-stats mb-6">
          <div class="stat-card">
            <AppIcon name="EyeIcon" />
            <div>
              <div class="stat-value">{{ totalViews }}</div>
              <div class="stat-label">Total Views</div>
            </div>
          </div>
          <div class="stat-card">
            <AppIcon name="ShareIcon" />
            <div>
              <div class="stat-value">{{ activeShares.length }}</div>
              <div class="stat-label">Active Shares</div>
            </div>
          </div>
          <div class="stat-card">
            <AppIcon name="ArrowDownTrayIcon" />
            <div>
              <div class="stat-value">{{ totalDownloads }}</div>
              <div class="stat-label">Downloads</div>
            </div>
          </div>
        </div>

        <!-- Shared Portfolio Links -->
        <div class="shared-links">
          <div
            v-for="share in sharedPortfolios"
            :key="share.id"
            class="share-card"
          >
            <div class="share-header">
              <h3 class="share-title">{{ share.title }}</h3>
              <div class="share-status" :class="{ active: share.isActive }">
                {{ share.isActive ? 'Active' : 'Inactive' }}
              </div>
            </div>
            
            <p class="share-description">{{ share.description }}</p>
            
            <div class="share-stats">
              <div class="share-stat">
                <AppIcon name="EyeIcon" />
                {{ share.analytics.views.total }} views
              </div>
              <div class="share-stat">
                <AppIcon name="CalendarIcon" />
                Created {{ formatDate(share.createdAt) }}
              </div>
            </div>
            
            <div class="share-url">
              <input
                :value="share.url"
                readonly
                class="form-input"
              >
              <button
                class="btn btn-outline"
                @click="copyToClipboard(share.url)"
              >
                <AppIcon name="DocumentDuplicateIcon" />
                Copy
              </button>
            </div>
            
            <div class="share-actions">
              <button
                class="btn btn-sm btn-outline"
                @click="editShare(share)"
              >
                <AppIcon name="PencilIcon" />
                Edit
              </button>
              <button
                class="btn btn-sm btn-outline"
                @click="viewAnalytics(share)"
              >
                <AppIcon name="ChartBarIcon" />
                Analytics
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="deleteShare(share)"
              >
                <AppIcon name="TrashIcon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="analytics-tab">
        <h2 class="text-2xl font-semibold mb-6">Portfolio Analytics</h2>
        
        <!-- Analytics Overview -->
        <div class="analytics-overview mb-6">
          <div class="analytics-card">
            <h3>Total Portfolio Views</h3>
            <div class="analytics-value">{{ totalViews }}</div>
            <div class="analytics-trend positive">+12% from last month</div>
          </div>
          <div class="analytics-card">
            <h3>Most Viewed Project</h3>
            <div class="analytics-value">{{ mostViewedProject?.title || 'N/A' }}</div>
            <div class="analytics-detail">{{ mostViewedProject?.views || 0 }} views</div>
          </div>
          <div class="analytics-card">
            <h3>Average View Time</h3>
            <div class="analytics-value">2:34</div>
            <div class="analytics-trend positive">+8% from last month</div>
          </div>
          <div class="analytics-card">
            <h3>Conversion Rate</h3>
            <div class="analytics-value">4.2%</div>
            <div class="analytics-detail">Contact clicks / Views</div>
          </div>
        </div>

        <!-- Analytics Charts Placeholder -->
        <div class="analytics-charts">
          <div class="chart-card">
            <h3>Views Over Time</h3>
            <canvas ref="viewsChartEl" height="200"></canvas>
          </div>
          <div class="chart-card">
            <h3>Traffic Sources</h3>
            <canvas ref="sourcesChartEl" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TemplateModal
      v-if="showTemplateModal"
      :templates="templates"
      @close="showTemplateModal = false"
      @use-template="handleUseTemplate"
    />

    <CreateTemplateModal
      v-if="showCreateTemplateModal"
      @close="showCreateTemplateModal = false"
      @create="handleCreateTemplate"
    />

    <PortfolioShareModal
      :show="showCreateShareModal"
      :portfolio="projects"
      @close="showCreateShareModal = false"
    />

    <ProjectModal
      v-if="showProjectModal"
      :project="editingProject"
      :templates="templates"
      @close="showProjectModal = false"
      @save="handleSaveProject"
      @delete="handleDeleteProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, CalendarIcon, ChartBarIcon, ClockIcon, DocumentDuplicateIcon, EyeIcon, PencilIcon, PlusIcon, ShareIcon, TrashIcon } from '@heroicons/vue/24/outline'

import { ref, computed, onMounted, defineAsyncComponent, watch, nextTick } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  PieController,
  Tooltip,
  Legend
} from 'chart.js'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import GlassNavTabs from '@/components/GlassNavTabs.vue'
import { useEnhancedPortfolio } from '@/composables/useEnhancedPortfolio'
import { usePortfolioTemplates } from '@/composables/usePortfolioTemplates'
import { usePortfolioSharing } from '@/composables/usePortfolioSharing'
import { useToast } from '@/composables/useToast'
import type { PortfolioProject } from '@/modules/db/repositories/portfolio'
import type { PortfolioTemplate } from '@/composables/useEnhancedPortfolio'

// Components (would be imported in real implementation)
const TemplateModal = defineAsyncComponent(() => import('@/components/portfolio/TemplateModal.vue'))
const CreateTemplateModal = defineAsyncComponent(() => import('@/components/portfolio/CreateTemplateModal.vue'))
const PortfolioShareModal = defineAsyncComponent(() => import('@/components/portfolio/PortfolioShareModal.vue'))
const ProjectModal = defineAsyncComponent(() => import('@/components/portfolio/ProjectModal.vue'))

// Composables
const portfolio = useEnhancedPortfolio()
const templates = usePortfolioTemplates()
const sharing = usePortfolioSharing()
const toast = useToast()

// State
const activeTab = ref('projects')
const selectedCategory = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')
const selectedTemplateCategory = ref('')

// Modal states
const showTemplateModal = ref(false)
const showCreateTemplateModal = ref(false)
const showCreateShareModal = ref(false)
const showProjectModal = ref(false)
const editingProject = ref<PortfolioProject | null>(null)

// Computed
const portfolioTabs = computed(() => [
  { key: 'projects', label: 'Projects', icon: 'FolderIcon-multiple-outline', badge: portfolio.projects.value.length },
  { key: 'templates', label: 'Templates', icon: 'mdi-shape-outline', badge: templates.templates.value.length },
  { key: 'sharing', label: 'Sharing', icon: 'ShareIcon-variant', badge: sharing.activeShares.value.length },
  { key: 'analytics', label: 'Analytics', icon: 'ChartBarIcon-line' }
])

// Tabs mapped for GlassNavTabs (uses `count` for numeric badges)
const navTabs = computed(() =>
  portfolioTabs.value.map(t => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    count: typeof t.badge === 'number' ? t.badge : undefined,
    badge: typeof t.badge !== 'number' ? t.badge : undefined,
  }))
)

const filteredProjects = computed(() => {
  let filtered = portfolio.projects.value

  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(p => p.status === selectedStatus.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.technologies.some(tech => tech.toLowerCase().includes(query))
    )
  }

  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

const filteredTemplates = computed(() => {
  if (!selectedTemplateCategory.value) {
    return templates.templates.value
  }
  return templates.getTemplatesByCategory(selectedTemplateCategory.value)
})

const templateCategories = computed(() => templates.categories.value)

const totalDownloads = computed(() => {
  return sharing.sharedPortfolios.value.reduce((total, share) => 
    total + share.analytics.engagement.downloadCount, 0
  )
})

const mostViewedProject = computed(() => {
  const projectViews = sharing.sharedPortfolios.value
    .flatMap(share => share.analytics.engagement.mostViewedProjects)
    .reduce((acc, proj) => {
      acc[proj.projectId] = (acc[proj.projectId] || 0) + proj.views
      return acc
    }, {} as Record<string, number>)

  const topProjectId = Object.entries(projectViews)
    .sort(([,a], [,b]) => b - a)[0]?.[0]

  if (topProjectId) {
    const project = portfolio.projects.value.find(p => p.id === topProjectId)
    return {
      title: project?.title,
      views: projectViews[topProjectId]
    }
  }

  return null
})

// Methods
function getCategoryIcon(category: string): string {
  const icons = {
    game: 'mdi DevicePhoneMobileIcon-variant',
    web: 'mdi mdi-web',
    mobile: 'mdi mdi-cellphone',
    tool: 'mdi mdi-tools',
    other: 'mdi FolderIcon'
  }
  return icons[category as keyof typeof icons] || icons.other
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function createNewProject() {
  editingProject.value = null
  showProjectModal.value = true
}

function editProject(project: PortfolioProject) {
  editingProject.value = project
  showProjectModal.value = true
}

async function toggleFeatured(project: PortfolioProject) {
  try {
    await portfolio.updateProject(project.id, { featured: !project.featured })
    toast.success(`Project ${project.featured ? 'unfeatured' : 'featured'} successfully`)
  } catch {
    toast.error('Failed to update project')
  }
}

async function duplicateProject(project: PortfolioProject) {
  try {
    const duplicate = {
      ...project,
      title: `${project.title} (Copy)`,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined
    }
    await portfolio.createProject(duplicate as any)
    toast.success('Project duplicated successfully')
  } catch {
    toast.error('Failed to duplicate project')
  }
}

function useTemplate(template: PortfolioTemplate) {
  templates.trackTemplateUsage(template.id)
  editingProject.value = null
  showProjectModal.value = true
  // Pass template to modal
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('URL copied to clipboard')
  } catch {
    toast.error('Failed to copy URL')
  }
}

function editShare(_share: any) {
  showCreateShareModal.value = true
}

function viewAnalytics(_share: any) {
  activeTab.value = 'analytics'
  // Schedule chart rendering after tab transition
  nextTick(() => {
    renderCharts()
  })
}

async function deleteShare(share: any) {
  if (confirm('Are you sure you want to delete this share?')) {
    try {
      await sharing.deleteShare(share.id)
      toast.success('Share deleted successfully')
    } catch {
      toast.error('Failed to delete share')
    }
  }
}

// Event handlers
function handleUseTemplate(template: PortfolioTemplate) {
  useTemplate(template)
  showTemplateModal.value = false
}

async function handleCreateTemplate(templateData: any) {
  try {
    await templates.createCustomTemplate(templateData)
    showCreateTemplateModal.value = false
    toast.success('Template created successfully')
  } catch {
    toast.error('Failed to create template')
  }
}

async function handleCreateShare(shareData: any) {
  try {
    await sharing.createShare(portfolio.portfolio.value!, shareData.settings, shareData.projectIds)
    showCreateShareModal.value = false
    toast.success('Share link created successfully')
  } catch {
    toast.error('Failed to create share link')
  }
}

async function handleSaveProject(projectData: any) {
  try {
    if (editingProject.value) {
      await portfolio.updateProject(editingProject.value.id, projectData)
      toast.success('Project updated successfully')
    } else {
      await portfolio.createProject(projectData)
      toast.success('Project created successfully')
    }
    showProjectModal.value = false
  } catch {
    toast.error('Failed to save project')
  }
}

async function handleDeleteProject(projectId: string) {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await portfolio.deleteProject(projectId)
      showProjectModal.value = false
      toast.success('Project deleted successfully')
    } catch {
      toast.error('Failed to delete project')
    }
  }
}

// Initialize
onMounted(async () => {
  await portfolio.loadPortfolio()
  templates.initialize()
  // Schedule chart rendering after component is fully mounted
  nextTick(() => {
    renderCharts()
  })
})

watch(() => sharing.sharedPortfolios.value, () => {
  // Schedule chart rendering when shared portfolios change
  nextTick(() => {
    renderCharts()
  })
}, { deep: true })

// Destructure for template access
const {
  portfolioStats,
  projects
} = portfolio

const {
  sharedPortfolios,
  activeShares,
  totalViews
} = sharing
</script>

<style scoped>
.enhanced-portfolio-system {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.portfolio-header {
  padding: 2rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary-600);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.portfolio-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-b: 2px solid var(--border-base);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  border-b: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background: var(--surface-elevated);
}

.tab-button.active {
  border-b-color: var(--color-primary-500);
  color: var(--color-primary-600);
}

/* Local badge replaced by unified .badge; use .bg-primary-500 as needed */

.projects-grid {
  @apply portfolio-grid;
  gap: 1.5rem;
}

.project-card {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin: 0;
}

.project-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.project-status.completed {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.project-status.in-progress {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.project-status.planned {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.project-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.project-category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: capitalize;
}

.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tech-more {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
}

.project-filters {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.templates-grid {
  @apply portfolio-grid;
  gap: 1.5rem;
}

.template-card {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass);
}

.template-preview {
  height: 120px;
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-placeholder {
  color: var(--text-secondary);
  font-size: 2rem;
}

.template-content {
  padding: 1.5rem;
}

.template-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.template-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.template-difficulty {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.template-difficulty.beginner {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.template-difficulty.intermediate {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.template-difficulty.advanced {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.template-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.template-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-base);
  background: var(--surface-base);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: var(--surface-elevated);
}

.category-btn.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.sharing-stats {
  @apply stats-grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.share-card {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.share-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.share-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.share-status.active {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.share-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.share-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.share-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.share-url {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.share-actions {
  display: flex;
  gap: 0.5rem;
}

.analytics-overview {
  @apply stats-grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.analytics-card {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.analytics-card h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.analytics-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary-600);
  margin-bottom: 0.25rem;
}

.analytics-trend {
  font-size: 0.875rem;
  font-weight: 500;
}

.analytics-trend.positive {
  color: var(--color-success-600);
}

.analytics-trend.negative {
  color: var(--color-error-600);
}

.analytics-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.analytics-charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 2px dashed var(--border-base);
  border-radius: 0.5rem;
}

.chart-placeholder i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .enhanced-portfolio-system {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-grid,
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-charts {
    grid-template-columns: 1fr;
  }
  
  .project-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .template-categories {
// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, ArcElement, PieController, Tooltip, Legend)

// Chart refs
const viewsChartEl = ref<HTMLCanvasElement | null>(null)
const sourcesChartEl = ref<HTMLCanvasElement | null>(null)
let viewsChart: Chart | null = null
let sourcesChart: Chart | null = null

function getMonthlyViews(): { labels: string[]; data: number[] } {
  const monthCounts: Record<string, number> = {}
  sharing.sharedPortfolios.value.forEach(share => {
    const monthly = share.analytics.views.monthly || {}
    Object.entries(monthly).forEach(([month, count]) => {
      monthCounts[month] = (monthCounts[month] || 0) + (count as number)
    })
  })
  const months = Object.keys(monthCounts).sort()
  const last6 = months.slice(-6)
  return { labels: last6, data: last6.map(m => monthCounts[m] || 0) }
}

function getReferrerSources(): { labels: string[]; data: number[] } {
  const refCounts: Record<string, number> = {}
  sharing.sharedPortfolios.value.forEach(share => {
    const refs = share.analytics.demographics.referrers || {}
    Object.entries(refs).forEach(([ref, count]) => {
      const key = ref || 'Direct'
      refCounts[key] = (refCounts[key] || 0) + (count as number)
    })
  })
  const entries = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  return { labels: entries.map(e => e[0]), data: entries.map(e => e[1]) }
}

function renderCharts() {
  nextTick(() => {
    const views = getMonthlyViews()
    const sources = getReferrerSources()

    if (viewsChart) viewsChart.destroy()
    if (viewsChartEl.value) {
      viewsChart = new Chart(viewsChartEl.value.getContext('2d')!, {
        type: 'line',
        data: {
          labels: views.labels,
          datasets: [{
            label: 'Views',
            data: views.data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            tension: 0.3
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      })
    }

    if (sourcesChart) sourcesChart.destroy()
    if (sourcesChartEl.value) {
      sourcesChart = new Chart(sourcesChartEl.value.getContext('2d')!, {
        type: 'pie',
        data: {
          labels: sources.labels,
          datasets: [{
            data: sources.data,
            backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      })
    }
  })
}
    flex-direction: column;
  }
}
</style>
