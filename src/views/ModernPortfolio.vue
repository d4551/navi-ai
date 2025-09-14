<template>
  <div class="modern-portfolio" :data-theme="themeName">
    <StandardPageLayout
      page-type="gaming"
      max-width="xl"
      :header-context="{ projects: stats.totalProjects, clips: stats.totalClips, achievements: stats.totalAchievements }"
    >
      <template #header-actions>
        <UnifiedButton 
          variant="gaming" 
          leading-icon="mdi-cog" 
          title="Open Portfolio Studio"
          @click="showPortfolioManager = true"
        >
          Open Portfolio Studio
        </UnifiedButton>
        <UnifiedButton variant="glass" leading-icon="mdi-share-variant" title="Share Portfolio" @click="sharePortfolio">
          Share
        </UnifiedButton>
        <UnifiedButton variant="outline" leading-icon="mdi-export" title="Export Portfolio" @click="showExportOptions = true">
          Export
        </UnifiedButton>
      </template>

      <!-- Portfolio Stats and Controls -->
      <section class="portfolio-stats-section unified-container">
        <div class="stats-controls-layout">
          <!-- Stats Grid -->
          <div class="stat-grid stats-grid">
            <div class="stat">
              <div class="val">{{ stats.totalProjects }}</div>
              <div class="lbl">Projects</div>
            </div>
            <div class="stat">
              <div class="val">{{ stats.featuredCount }}</div>
              <div class="lbl">Featured</div>
            </div>
            <div class="stat">
              <div class="val">{{ (portfolio.topSkills.value[0]?.count || 0) }}</div>
              <div class="lbl">Top Skill Uses</div>
            </div>
          </div>
          
          <!-- Portfolio Management Controls -->
          <div class="portfolio-controls">
            <UnifiedButton 
              v-if="stats.totalProjects === 0"
              variant="primary" 
              leading-icon="mdi-plus" 
              title="Add Your First Project"
              @click="showPortfolioManager = true"
            >
              Add Project
            </UnifiedButton>
          </div>
        </div>
      </section>

      <!-- Sticky Top Navigation Bar -->
      <nav class="portfolio-topbar unified-container unified-card is-interactive">
        <div class="topbar-row">
          <div class="topbar-group search-group">
            <AppIcon name="mdi-magnify" />
            <input
              v-model="portfolio.searchQuery.value"
              class="form-control glass-input"
              type="text"
              placeholder="Search projects, skills, tags..."
              aria-label="Search portfolio"
            />
          </div>
          <div class="topbar-group">
            <AppIcon name="mdi-filter-variant" />
            <select v-model="portfolio.filterType.value" class="form-control" aria-label="Filter by type">
              <option value="">All</option>
              <option value="project">Project</option>
              <option value="game">Game</option>
              <option value="tool">Tool</option>
              <option value="demo">Demo</option>
            </select>
          </div>
          <div class="topbar-group">
            <AppIcon name="mdi-sort" />
            <select v-model="portfolio.sortMode.value" class="form-control" aria-label="Sort portfolio">
              <option value="recent">Recent</option>
              <option value="alphabetical">A–Z</option>
              <option value="type">Type</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          <div class="topbar-group toggle">
            <label class="switch" title="Show only featured">
              <input v-model="portfolio.showFeaturedOnly.value" type="checkbox" />
              <span class="slider" />
            </label>
            <span class="toggle-label">Featured</span>
          </div>
          <div class="topbar-group toggle">
            <label class="switch" title="Show analytics">
              <input v-model="portfolio.showAnalytics.value" type="checkbox" />
              <span class="slider" />
            </label>
            <span class="toggle-label">Analytics</span>
          </div>
          <div class="topbar-group view-toggle">
            <ViewToggle
              v-model="portfolio.layout.value" :options="[
                { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
                { value: 'list', icon: 'mdi-view-list', label: 'List view' }
              ]"
            />
          </div>
          <div class="topbar-group ai-tools">
            <UnifiedButton variant="glass" icon-only leading-icon="mdi-robot" title="AI Tools" @click="showAITools = true" />
          </div>
        </div>
        <div v-if="portfolio.topSkills.value.length" class="skill-chips">
          <UnifiedButton
            v-for="s in portfolio.topSkills.value.slice(0,12)"
            :key="s.skill"
            size="sm"
            :variant="portfolio.skillFilters.value.includes(s.skill) ? 'primary' : 'glass'"
            :title="`Filter by skill: ${s.skill}`"
            class="skill-chip-btn"
            @click="toggleSkill(s.skill)"
          >
            {{ s.skill }}
            <span class="count">{{ s.count }}</span>
          </UnifiedButton>
          <UnifiedButton v-if="portfolio.skillFilters.value.length" size="sm" variant="ghost" leading-icon="mdi-filter-remove" title="Clear Skill Filters" @click="portfolio.clearFilters()">
            Clear Filters
          </UnifiedButton>
        </div>
      </nav>
      <!-- AI Tools Modal -->
      <div v-if="showAITools" class="ai-tools-modal-overlay" @click.self="showAITools = false">
        <div class="ai-tools-modal unified-card">
          <div class="modal-header">
            <AppIcon name="mdi-robot" class="me-2" />
            <span class="modal-title">AI Portfolio Tools</span>
            <UnifiedButton variant="ghost" leading-icon="mdi-close" size="sm" title="Close" @click="showAITools = false" />
          </div>
          <div class="modal-body">
            <UnifiedButton variant="primary" leading-icon="mdi-lightbulb-on" @click="suggestSkillsForAll()">
              Suggest Skills for Projects
            </UnifiedButton>
            <UnifiedButton variant="glass" leading-icon="mdi-auto-fix" @click="portfolio.autoTagProjects()">
              Auto-Tag Projects
            </UnifiedButton>
            <UnifiedButton variant="outline" leading-icon="mdi-text-box-search" @click="portfolio.generateSummaries()">
              Generate Project Summaries
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Portfolio Manager Modal -->
      <div v-if="showPortfolioManager" class="portfolio-manager-modal-overlay" @click.self="showPortfolioManager = false">
        <div class="portfolio-manager-modal unified-card">
          <div class="modal-header">
            <AppIcon name="mdi-tools" class="me-2" />
            <span class="modal-title">Portfolio Studio</span>
            <UnifiedButton variant="ghost" leading-icon="mdi-close" size="sm" title="Close" @click="showPortfolioManager = false" />
          </div>
          <div class="modal-body">
            <div class="manager-options">
              <!-- Create New Project -->
              <div class="option-card" @click="createNewProject">
                <div class="option-icon">
                  <AppIcon name="mdi-plus-circle" />
                </div>
                <div class="option-content">
                  <h3 class="option-title">Create New Project</h3>
                  <p class="option-description">Add a new project to your portfolio</p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>

              <!-- Manage Existing Projects -->
              <div class="option-card" @click="goToManagePage">
                <div class="option-icon">
                  <AppIcon name="mdi-folder-edit" />
                </div>
                <div class="option-content">
                  <h3 class="option-title">Manage Projects</h3>
                  <p class="option-description">Edit, organize, and update your projects</p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>

              <!-- Bulk Operations -->
              <div class="option-card" @click="showBulkOperations">
                <div class="option-icon">
                  <AppIcon name="mdi-checkbox-multiple-marked" />
                </div>
                <div class="option-content">
                  <h3 class="option-title">Bulk Operations</h3>
                  <p class="option-description">Update multiple projects at once</p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>

              <!-- Import Projects -->
              <div class="option-card" @click="importProjects">
                <div class="option-icon">
                  <AppIcon name="mdi-import" />
                </div>
                <div class="option-content">
                  <h3 class="option-title">Import Projects</h3>
                  <p class="option-description">Import from GitHub, LinkedIn, or files</p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>

              <!-- Portfolio Settings -->
              <div class="option-card" @click="portfolioSettings">
                <div class="option-icon">
                  <AppIcon name="mdi-cog" />
                </div>
                <div class="option-content">
                  <h3 class="option-title">Portfolio Settings</h3>
                  <p class="option-description">Configure display options and privacy</p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>

              <!-- Analytics & Insights -->
              <div class="option-card" @click="viewAnalytics">
                <div class="option-icon">
                  <AppIcon name="mdi-chart-line" />
                </div>
                <div class="option-content">
                  <h3 class="option-title">Analytics & Insights</h3>
                  <p class="option-description">View portfolio performance and metrics</p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio Grid/List -->
      <section class="unified-container">
        <div :class="[portfolio.layout.value === 'grid' ? 'portfolio-grid' : 'items', portfolio.layout.value]">
          <article
            v-for="item in visibleItems"
            :key="item.id"
            class="item unified-card is-interactive neon-hover"
          >
            <div class="media">
              <!-- Normalized thumbnail system -->
              <img 
                v-if="getItemThumbnail(item)"
                :src="getItemThumbnail(item)!"
                :alt="item.title || 'Portfolio item'"
                class="media-image"
                @error="onThumbnailError"
              />
              <div v-else class="media-fallback">
                <AppIcon :name="getItemTypeIcon(item.type)" class="fallback-icon" />
              </div>
              <div class="badges">
                <span v-if="item.featured" class="badge featured"><AppIcon name="mdi-star" /> Featured</span>
              </div>
            </div>
            <div class="body">
              <div class="content">
                <h3 class="title">{{ item.title }}</h3>
                <div v-if="item.description" class="desc">{{ (item.description||'').slice(0,140) }}</div>
                <div class="meta">
                  <span v-if="item.type" class="pill">{{ item.type }}</span>
                  <span v-if="displayDate(item.date)" class="pill"><AppIcon name="mdi-calendar" /> {{ displayDate(item.date) }}</span>
                </div>
                <div v-if="(item.skills||item.tags)?.length" class="tags">
                  <span v-for="t in (item.skills || item.tags || []).slice(0,6)" :key="t" class="tag">{{ t }}</span>
                </div>
              </div>
              <div class="actions">
                <div class="primary-actions">
                  <UnifiedButton size="sm" variant="primary" leading-icon="mdi-eye" @click="viewItem(item)">
                    View
                  </UnifiedButton>
                  <UnifiedButton 
                    v-if="primaryLink(item)" 
                    size="sm" 
                    variant="glass" 
                    leading-icon="mdi-open-in-new" 
                    :href="primaryLink(item)" 
                    target="_blank"
                  >
                    Open
                  </UnifiedButton>
                </div>
                <div class="secondary-actions">
                  <UnifiedButton 
                    size="sm" 
                    variant="ghost" 
                    :leading-icon="item.featured ? 'mdi-star' : 'mdi-star-outline'" 
                    :title="item.featured ? 'Remove from featured' : 'Add to featured'"
                    @click="toggleFeatured(item)"
                  >
                    {{ item.featured ? 'Featured' : 'Feature' }}
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Infinite loader -->
        <div ref="loadMoreRef" class="load-more-sentinel" aria-hidden="true"></div>

        <!-- Empty state -->
        <div v-if="!portfolio.filtered.value.length && !portfolio.loading.value" class="empty unified-card text-center">
          <p>No portfolio items yet.</p>
          <div class="mt-sm">
            <UnifiedButton variant="primary" leading-icon="mdi-plus" @click="showPortfolioManager = true">Add Project</UnifiedButton>
          </div>
        </div>
      </section>

      <!-- Analytics -->
      <section v-if="portfolio.showAnalytics.value" class="analytics unified-container">
        <!-- Additional analytics content can go here in the future -->
      </section>

      <template #footer-actions>
        <div class="footer-actions">
          <UnifiedButton variant="outline" leading-icon="mdi-cog" title="Open Portfolio Studio" @click="showPortfolioManager = true">
            Portfolio Studio
          </UnifiedButton>
          <UnifiedButton 
            v-if="portfolio.skillFilters.value.length || portfolio.searchQuery.value"
            variant="ghost" 
            leading-icon="mdi-filter-remove" 
            title="Clear All Filters"
            @click="portfolio.clearFilters()"
          >
            Clear Filters
          </UnifiedButton>
        </div>
      </template>
    </StandardPageLayout>

    <!-- Portfolio View Modal -->
    <PortfolioViewModal
      :show="showViewModal"
      :item="selectedViewItem"
      @close="showViewModal = false; selectedViewItem = null"
      @edit="handleEditItem"
      @duplicate="handleDuplicateItem"
    />

    <!-- Export Modal -->
    <PortfolioExportModal
      :show="showExportOptions"
      :portfolio="portfolio.filtered.value"
      @export="handleExport"
      @close="showExportOptions = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

// Fix for 'IntersectionObserver is not defined' in some build environments
/* global IntersectionObserver */

import { useRouter } from 'vue-router'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import ViewToggle from '@/components/ui/ViewToggle.vue'
import PortfolioExportModal from '@/components/portfolio/PortfolioExportModal.vue'
import PortfolioViewModal from '@/components/portfolio/PortfolioViewModal.vue'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { usePerformantPortfolio } from '@/composables/usePerformantPortfolio'

const router = useRouter()
const portfolio = usePerformantPortfolio()

// Modal states
const showExportOptions = ref(false)
const showAITools = ref(false)
const showViewModal = ref(false)
const showPortfolioManager = ref(false)
const selectedViewItem = ref(null)

const theme = (() => { try { return useUnifiedTheme() } catch { return undefined as any } })()
const themeName = computed(() => { try { return theme?.colorScheme?.value || 'light' } catch { return 'light' } })

// Visible items: prefer virtualized when threshold exceeded; otherwise infinite items
const visibleItems = computed(() => {
  return portfolio.shouldVirtualize() ? portfolio.virtualizedItems.value : portfolio.infiniteItems.value
})

function displayDate(d?: string) { return d ? String(d) : '' }

function primaryLink(item: any) {
  return item.liveUrl || item.url || (item.links || []).find((l: any) => !!l?.url)?.url || ''
}

function viewItem(item: any) {
  try {
    selectedViewItem.value = item
    showViewModal.value = true
  } catch {}
}

async function toggleFeatured(item: any) { try { await portfolio.toggleFeatured(item.id) } catch {} }

function handleEditItem(item: any) {
  // Close the view modal and navigate to edit
  showViewModal.value = false
  selectedViewItem.value = null
  // You can implement edit functionality here
  // For now, just navigate to manage page
  goManage()
}

function handleDuplicateItem(item: any) {
  // Close the view modal and handle duplication
  showViewModal.value = false
  selectedViewItem.value = null
  // You can implement duplication functionality here
  console.log('Duplicate item:', item)
}

function goManage() { router.push('/portfolio/manage') }

// Portfolio Manager Modal Functions
function createNewProject() {
  showPortfolioManager.value = false
  router.push('/portfolio/manage?action=create')
}

function goToManagePage() {
  showPortfolioManager.value = false
  router.push('/portfolio/manage')
}

function showBulkOperations() {
  showPortfolioManager.value = false
  router.push('/portfolio/manage?tab=bulk')
}

function importProjects() {
  showPortfolioManager.value = false
  router.push('/portfolio/manage?tab=import')
}

function portfolioSettings() {
  showPortfolioManager.value = false
  router.push('/portfolio/manage?tab=settings')
}

function viewAnalytics() {
  showPortfolioManager.value = false
  router.push('/portfolio/manage?tab=analytics')
}

// Share/export helpers
async function sharePortfolio() {
  try {
    const url = `${window.location.origin}${window.location.pathname}#/portfolio`
    if (navigator.share) await navigator.share({ title: 'My Portfolio', url })
    else await navigator.clipboard.writeText(url)
  } catch {}
}

async function handleExport(format: string) {
  try {
    // Close the modal
    showExportOptions.value = false
    
    // Import the portfolio export service
    const { portfolioExportRoutes } = await import('@/modules/api/portfolio-export')
    
    // Get portfolio data
    const portfolioData = portfolio.prepareExportData()
    
    // Convert to the expected format for the export service
    const projects = (Array.isArray(portfolioData) ? portfolioData : []).map((item: any) => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      image: item.image || item.thumbnail || '',
      liveUrl: item.liveUrl || item.url || '',
      githubUrl: item.githubUrl || (item.links || []).find((l: any) => l.type === 'github')?.url || '',
      technologies: item.skills || item.tags || [],
      featured: item.featured || false,
      type: item.type || 'project',
      date: item.date
    }))
    
    // Export with the specified format
    await portfolioExportRoutes.downloadPortfolio(projects, format as any, {
      template: 'gaming',
      theme: themeName.value === 'dark' ? 'dark' : 'light',
      includeImages: true,
      metadata: {
        title: 'Gaming Portfolio',
        author: 'Portfolio Owner',
        description: 'Professional gaming industry portfolio showcasing projects and skills',
        website: `${window.location.origin}${window.location.pathname}#/portfolio`
      }
    })
  } catch (error) {
    console.error('Portfolio export failed:', error)
    // Fallback to basic JSON export
    try {
      const data = portfolio.prepareExportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'portfolio-export.json'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {}
  }
}

// Thumbnail system helpers
function getItemThumbnail(item: any): string | null {
  // Priority: image > thumbnail > media.url > null
  if (item.image) return item.image
  if (item.thumbnail) return item.thumbnail
  if (item.media?.url) return item.media.url
  return null
}

function getItemTypeIcon(type?: string): string {
  const icons: Record<string, string> = {
    achievement: 'mdi-trophy',
    tournament: 'mdi-sword-cross',
    project: 'mdi-code-braces',
    content: 'mdi-video',
    leadership: 'mdi-account-group',
    clip: 'mdi-play-circle',
    competition: 'mdi-target',
    game: 'mdi-gamepad-variant',
    web: 'mdi-web',
    mobile: 'mdi-cellphone',
    tool: 'mdi-wrench',
    demo: 'mdi-monitor',
    app: 'mdi-application',
    website: 'mdi-earth'
  }
  return icons[type || ''] || 'mdi-folder'
}

function onThumbnailError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

function toggleSkill(skill: string) {
  if (portfolio.skillFilters.value.includes(skill)) portfolio.removeSkillFilter(skill)
  else portfolio.addSkillFilter(skill)
}

async function suggestSkillsForAll() {
  try {
    // Get all visible portfolio items and suggest skills for each
    const items = visibleItems.value
    for (const item of items) {
      await portfolio.suggestSkills(item)
    }
  } catch (error) {
    console.error('Error suggesting skills:', error)
  }
}

// IntersectionObserver for infinite scrolling / batch loading
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: any = null

onMounted(() => {
  try {
    observer = new (window as any).IntersectionObserver(async (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          // For virtualization, expand range; else load next page
          if (portfolio.shouldVirtualize()) {
            const end = Math.min(portfolio.visibleRange.value.end + portfolio.itemsPerPage.value, portfolio.filtered.value.length)
            portfolio.updateVisibleRange(portfolio.visibleRange.value.start, end)
          } else {
            await portfolio.loadMoreItems()
          }
        }
      }
    }, { root: null, rootMargin: '200px', threshold: 0 })
    if (loadMoreRef.value) observer.observe(loadMoreRef.value)
  } catch {}
})

onBeforeUnmount(() => { try { observer?.disconnect() } catch {} })

// Keep virtualized window aligned to current page size
watch(() => portfolio.itemsPerPage.value, (n) => {
  if (portfolio.shouldVirtualize()) {
    portfolio.updateVisibleRange(0, n)
  }
})

const stats = computed(() => portfolio.stats.value)
</script>

<style scoped>
/* Sticky Topbar Styles - Enhanced with Master Design System */
.portfolio-topbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--glass-surface);
  border-bottom: 1px solid var(--glass-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-3) var(--spacing-4);
  margin-bottom: var(--spacing-4);
  backdrop-filter: var(--glass-backdrop-blur);
}
.topbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  align-items: center;
  justify-content: space-between;
}

.topbar-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: auto;
  flex-shrink: 0;
}

.search-group {
  flex: 2;
  min-width: 220px;
  max-width: 320px;
}

.search-group input {
  flex: 1;
}

.topbar-group select,
.topbar-group input {
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  backdrop-filter: var(--glass-backdrop-filter);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.topbar-group select:focus,
.topbar-group input:focus {
  outline: none;
  border-color: var(--color-primary-300);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.toggle-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-left: var(--spacing-1);
  white-space: nowrap;
}

.ai-tools {
  margin-left: auto;
  flex-shrink: 0;
}

/* AI Tools Modal Styles */
.ai-tools-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--surface-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-tools-modal {
  min-width: 340px;
  max-width: calc(var(--page-narrow-width) * 0.6);
  padding: var(--spacing-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  backdrop-filter: var(--glass-backdrop-blur);
}
.modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
}
.modal-title {
  flex: 1;
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* Enhanced switch using design system tokens */
.switch { 
  position: relative; 
  display: inline-block; 
  width: 42px; 
  height: 26px; 
}
.switch input { 
  opacity: 0; 
  width: 0; 
  height: 0; 
}
.switch .slider { 
  position: absolute; 
  cursor: pointer; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  background: var(--glass-border); 
  transition: var(--duration-fast) var(--easing-ease-out); 
  border-radius: var(--radius-full); 
  box-shadow: inset 0 0 0 1px var(--glass-border); 
}
.switch .slider:before { 
  position: absolute; 
  content: ""; 
  height: 18px; 
  width: 18px; 
  left: 4px; 
  bottom: 4px; 
  background: var(--surface-elevated); 
  border-radius: 50%; 
  transition: var(--duration-fast) var(--easing-ease-out); 
  box-shadow: var(--shadow-sm); 
}
.switch input:checked + .slider { 
  background: var(--color-primary-500); 
  box-shadow: inset 0 0 0 1px var(--color-primary-500); 
}
.switch input:checked + .slider:before { 
  transform: translateX(16px); 
  background: white; 
}

.skill-chips { 
  display: flex; 
  flex-wrap: wrap; 
  gap: var(--spacing-2); 
  margin-top: var(--spacing-2); 
}
.skill-chip-btn {
  border-radius: var(--radius-full) !important;
  font-weight: var(--font-weight-medium) !important;
  transition: all var(--duration-fast) var(--easing-ease-out) !important;
}
.skill-chip-btn .count { 
  opacity: 0.7; 
  font-size: var(--font-size-xs); 
  margin-left: var(--spacing-1);
}

/* Portfolio Grid/List Layout */
.items { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: var(--spacing-4); 
}

.items.list { 
  grid-template-columns: 1fr; 
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-6);
  align-items: start;
}

@media (max-width: 768px) {
  .portfolio-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .portfolio-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
}
.item { 
  display: grid; 
  grid-template-rows: auto 1fr; 
  height: 100%;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.items.list .item { 
  grid-template-columns: 240px 1fr; 
  grid-template-rows: auto; 
  height: auto;
}
.media { 
  position: relative; 
  border-radius: var(--radius-lg); 
  background: var(--glass-bg); 
  border: 1px solid var(--glass-border); 
  display: flex; 
  align-items: center; 
  justify-content: center;
  aspect-ratio: 16/9;
  overflow: hidden;
  backdrop-filter: var(--glass-backdrop-blur);
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-normal) var(--easing-ease-out);
}

.item:hover .media-image {
  transform: scale(1.05);
}

.media-fallback { 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 5%, transparent), 
    color-mix(in srgb, var(--color-cyber-500) 5%, transparent)
  );
}

.fallback-icon {
  font-size: 2.5rem;
  color: var(--text-tertiary);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.item:hover .fallback-icon {
  color: var(--text-secondary);
  transform: scale(1.1);
}
.badges { 
  position: absolute; 
  top: var(--spacing-2); 
  left: var(--spacing-2); 
  display: flex; 
  gap: var(--spacing-1-5); 
}
.body { 
  padding: var(--spacing-4); 
  display: flex; 
  flex-direction: column; 
  gap: var(--spacing-3);
  height: 100%;
}

.body .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.body .actions {
  margin-top: auto;
  padding-top: var(--spacing-2);
}
.title { 
  font-weight: var(--font-weight-bold); 
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  line-height: var(--line-height-heading);
}
.desc { 
  color: var(--text-secondary); 
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body);
}
.meta { 
  display: flex; 
  gap: var(--spacing-2); 
  flex-wrap: wrap; 
}
.pill { 
  background: var(--glass-bg); 
  border: 1px solid var(--glass-border); 
  border-radius: var(--radius-full); 
  padding: var(--spacing-1) var(--spacing-2); 
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}
.tags { 
  display: flex; 
  gap: var(--spacing-1-5); 
  flex-wrap: wrap; 
}
.tag { 
  border: 1px solid var(--glass-border); 
  background: var(--glass-bg); 
  border-radius: var(--radius-full); 
  padding: var(--spacing-1) var(--spacing-2); 
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Enhanced Actions Layout with Design System */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-2);
  gap: var(--spacing-2);
}

.primary-actions {
  display: flex;
  gap: var(--spacing-2);
  flex: 1;
}

.secondary-actions {
  display: flex;
  gap: var(--spacing-1);
  flex-shrink: 0;
}

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--glass-bg);
  border-top: 1px solid var(--glass-border);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
}

.load-more-sentinel { 
  height: 1px; 
}

.analytics { 
  margin: var(--spacing-6) 0 var(--spacing-8); 
}
.stat-grid { 
  gap: var(--spacing-4); 
}
.stat { 
  padding: var(--spacing-4); 
  border: 1px solid var(--glass-border); 
  border-radius: var(--radius-lg); 
  background: var(--glass-surface); 
  text-align: center;
  backdrop-filter: var(--glass-backdrop-blur);
}
.val { 
  font-weight: var(--font-weight-bold); 
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
}
.lbl { 
  color: var(--text-secondary); 
  font-size: var(--font-size-sm);
}

/* Responsive Design */
@media (max-width: 880px) {
  .items.list .item { 
    grid-template-columns: 1fr; 
  }
}

@media (max-width: 640px) {
  .topbar-row {
    gap: var(--spacing-2);
  }
  .topbar-group {
    min-width: auto;
  }
  .search-group {
    min-width: 100%;
  }
}

/* Portfolio Stats Section */
.portfolio-stats-section {
  margin-bottom: var(--spacing-6);
}

.stats-controls-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-6);
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
  min-width: 0;
  flex: 1;
  align-self: stretch;
}

.stat {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  text-align: center;
  backdrop-filter: var(--glass-backdrop-filter);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.stat:hover {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat .val {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
  line-height: 1;
  margin-bottom: var(--spacing-1);
}

.stat .lbl {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.portfolio-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-shrink: 0;
  align-self: center;
}

/* Portfolio Manager Modal */
.portfolio-manager-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.portfolio-manager-modal {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  width: 100%;
  max-width: var(--page-narrow-width);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-4);
  border-bottom: 1px solid var(--glass-border);
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.close-button:hover {
  color: var(--text-primary);
  background: var(--glass-surface);
}

.modal-body {
  padding: var(--spacing-6);
}

.manager-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.option-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-3);
}

.option-card:hover {
  background: var(--glass-bg);
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.option-icon {
  font-size: 2.5rem;
  color: var(--color-primary-500);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.option-card:hover .option-icon {
  transform: scale(1.1);
  color: var(--color-primary-400);
}

.option-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.option-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-body);
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .topbar-row {
    gap: var(--spacing-2);
  }
  
  .search-group {
    min-width: 180px;
    max-width: 280px;
  }
  
  .topbar-group {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .stats-controls-layout {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-4);
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-3);
  }
  
  .portfolio-controls {
    justify-content: center;
  }

  .topbar-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }

  .search-group {
    order: -1;
    min-width: 100%;
    max-width: none;
  }

  .ai-tools {
    margin-left: 0;
    order: 1;
    justify-content: center;
  }

  .topbar-group {
    justify-content: space-between;
  }

  .topbar-group.toggle {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
  
  .portfolio-manager-modal {
    margin: var(--spacing-4);
    max-height: calc(100vh - 32px);
  }
  
  .manager-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
  
  .modal-header {
    padding: var(--spacing-4);
  }
  
  .modal-body {
    padding: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
  
  .stat {
    padding: var(--spacing-3);
  }
  
  .val {
    font-size: var(--font-size-2xl);
  }
}

/* Theme-aware adjustments */
[data-theme="dark"] .chip { 
  background: var(--glass-bg); 
}
[data-theme="dark"] .tag { 
  background: var(--glass-bg); 
}
</style>
