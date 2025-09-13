<template>
  <div class="modern-portfolio" :data-theme="themeName">
    <StandardPageLayout
      page-type="gaming"
      max-width="xl"
      :header-context="{
        projects: stats.totalProjects,
        clips: stats.totalClips,
        achievements: stats.totalAchievements,
      }"
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
        <UnifiedButton
          variant="glass"
          leading-icon="mdi-share-variant"
          title="Share Portfolio"
          @click="sharePortfolio"
        >
          Share
        </UnifiedButton>
        <UnifiedButton
          variant="outline"
          leading-icon="mdi-export"
          title="Export Portfolio"
          @click="showExportOptions = true"
        >
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
              <div class="val">
                {{ portfolio.topSkills.value[0]?.count || 0 }}
              </div>
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
      <nav
        class="portfolio-topbar unified-container unified-card is-interactive"
      >
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
            <select
              v-model="portfolio.filterType.value"
              class="form-control"
              aria-label="Filter by type"
            >
              <option value="">All</option>
              <option value="project">Project</option>
              <option value="game">Game</option>
              <option value="tool">Tool</option>
              <option value="demo">Demo</option>
            </select>
          </div>
          <div class="topbar-group">
            <AppIcon name="mdi-sort" />
            <select
              v-model="portfolio.sortMode.value"
              class="form-control"
              aria-label="Sort portfolio"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">A–Z</option>
              <option value="type">Type</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          <div class="topbar-group toggle">
            <label class="switch" title="Show only featured">
              <input
                v-model="portfolio.showFeaturedOnly.value"
                type="checkbox"
              />
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
              v-model="portfolio.layout.value"
              :options="[
                { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
                { value: 'list', icon: 'mdi-view-list', label: 'List view' },
              ]"
            />
          </div>
          <div class="topbar-group ai-tools">
            <UnifiedButton
              variant="glass"
              icon-only
              leading-icon="mdi-robot"
              title="AI Tools"
              @click="showAITools = true"
            />
          </div>
        </div>
        <div v-if="portfolio.topSkills.value.length" class="skill-chips">
          <UnifiedButton
            v-for="s in portfolio.topSkills.value.slice(0, 12)"
            :key="s.skill"
            size="sm"
            :variant="
              portfolio.skillFilters.value.includes(s.skill)
                ? 'primary'
                : 'glass'
            "
            :title="`Filter by skill: ${s.skill}`"
            class="skill-chip-btn"
            @click="toggleSkill(s.skill)"
          >
            {{ s.skill }}
            <span class="count">{{ s.count }}</span>
          </UnifiedButton>
          <UnifiedButton
            v-if="portfolio.skillFilters.value.length"
            size="sm"
            variant="ghost"
            leading-icon="mdi-filter-remove"
            title="Clear Skill Filters"
            @click="portfolio.clearFilters()"
          >
            Clear Filters
          </UnifiedButton>
        </div>
      </nav>
      <!-- AI Tools Modal -->
      <div
        v-if="showAITools"
        class="ai-tools-modal-overlay"
        @click.self="showAITools = false"
      >
        <div class="ai-tools-modal unified-card">
          <div class="modal-header">
            <AppIcon name="mdi-robot" class="me-2" />
            <span class="modal-title">AI Portfolio Tools</span>
            <UnifiedButton
              variant="ghost"
              leading-icon="mdi-close"
              size="sm"
              title="Close"
              @click="showAITools = false"
            />
          </div>
          <div class="modal-body">
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-lightbulb-on"
              @click="suggestSkillsForAll()"
            >
              Suggest Skills for Projects
            </UnifiedButton>
            <UnifiedButton
              variant="glass"
              leading-icon="mdi-auto-fix"
              @click="portfolio.autoTagProjects()"
            >
              Auto-Tag Projects
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              leading-icon="mdi-text-box-search"
              @click="portfolio.generateSummaries()"
            >
              Generate Project Summaries
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Portfolio Manager Modal -->
      <div
        v-if="showPortfolioManager"
        class="portfolio-manager-modal-overlay"
        @click.self="showPortfolioManager = false"
      >
        <div class="portfolio-manager-modal unified-card">
          <div class="modal-header">
            <AppIcon name="mdi-tools" class="me-2" />
            <span class="modal-title">Portfolio Studio</span>
            <UnifiedButton
              variant="ghost"
              leading-icon="mdi-close"
              size="sm"
              title="Close"
              @click="showPortfolioManager = false"
            />
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
                  <p class="option-description">
                    Add a new project to your portfolio
                  </p>
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
                  <p class="option-description">
                    Edit, organize, and update your projects
                  </p>
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
                  <p class="option-description">
                    Update multiple projects at once
                  </p>
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
                  <p class="option-description">
                    Import from GitHub, LinkedIn, or files
                  </p>
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
                  <p class="option-description">
                    Configure display options and privacy
                  </p>
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
                  <p class="option-description">
                    View portfolio performance and metrics
                  </p>
                </div>
                <AppIcon name="mdi-chevron-right" class="option-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio Grid/List -->
      <section class="unified-container">
        <div
          :class="[
            portfolio.layout.value === 'grid' ? 'portfolio-grid' : 'items',
            portfolio.layout.value,
          ]"
        >
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
                <AppIcon
                  :name="getItemTypeIcon(item.type)"
                  class="fallback-icon"
                />
              </div>
              <div class="badges">
                <span v-if="item.featured" class="badge featured"><AppIcon name="mdi-star" /> Featured</span>
              </div>
            </div>
            <div class="body">
              <div class="content">
                <h3 class="title">{{ item.title }}</h3>
                <div v-if="item.description" class="desc">
                  {{ (item.description || "").slice(0, 140) }}
                </div>
                <div class="meta">
                  <span v-if="item.type" class="pill">{{ item.type }}</span>
                  <span v-if="displayDate(item.date)" class="pill"><AppIcon name="mdi-calendar" />
                    {{ displayDate(item.date) }}</span>
                </div>
                <div v-if="(item.skills || item.tags)?.length" class="tags">
                  <span
                    v-for="t in (item.skills || item.tags || []).slice(0, 6)"
                    :key="t"
                    class="tag"
                  >{{ t }}</span>
                </div>
              </div>
              <div class="actions">
                <div class="primary-actions">
                  <UnifiedButton
                    size="sm"
                    variant="primary"
                    leading-icon="mdi-eye"
                    @click="viewItem(item)"
                  >
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
                    :leading-icon="
                      item.featured ? 'mdi-star' : 'mdi-star-outline'
                    "
                    :title="
                      item.featured ? 'Remove from featured' : 'Add to featured'
                    "
                    @click="toggleFeatured(item)"
                  >
                    {{ item.featured ? "Featured" : "Feature" }}
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Infinite loader -->
        <div
          ref="loadMoreRef"
          class="load-more-sentinel"
          aria-hidden="true"
        ></div>

        <!-- Empty state -->
        <div
          v-if="!portfolio.filtered.value.length && !portfolio.loading.value"
          class="empty unified-card text-center"
        >
          <p>No portfolio items yet.</p>
          <div class="mt-sm">
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-plus"
              @click="showPortfolioManager = true"
            >
              Add Project
            </UnifiedButton>
          </div>
        </div>
      </section>

      <!-- Analytics -->
      <section
        v-if="portfolio.showAnalytics.value"
        class="analytics unified-container"
      >
        <!-- Additional analytics content can go here in the future -->
      </section>

      <template #footer-actions>
        <div class="footer-actions">
          <UnifiedButton
            variant="outline"
            leading-icon="mdi-cog"
            title="Open Portfolio Studio"
            @click="showPortfolioManager = true"
          >
            Portfolio Studio
          </UnifiedButton>
          <UnifiedButton
            v-if="
              portfolio.skillFilters.value.length || portfolio.searchQuery.value
            "
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
      @close="
        showViewModal = false;
        selectedViewItem = null;
      "
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
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";

// Fix for 'IntersectionObserver is not defined' in some build environments

import { useRouter } from "vue-router";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import ViewToggle from "@/components/ui/ViewToggle.vue";
import PortfolioExportModal from "@/components/portfolio/PortfolioExportModal.vue";
import PortfolioViewModal from "@/components/portfolio/PortfolioViewModal.vue";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import { usePerformantPortfolio } from "@/composables/usePerformantPortfolio";

const router = useRouter();
const portfolio = usePerformantPortfolio();

// Modal states
const showExportOptions = ref(false);
const showAITools = ref(false);
const showViewModal = ref(false);
const showPortfolioManager = ref(false);
const selectedViewItem = ref(null);

const theme = (() => {
  try {
    return useUnifiedTheme();
  } catch {
    return undefined as any;
  }
})();
const themeName = computed(() => {
  try {
    return theme?.colorScheme?.value || "light";
  } catch {
    return "light";
  }
});

// Visible items: prefer virtualized when threshold exceeded; otherwise infinite items
const visibleItems = computed(() => {
  return portfolio.shouldVirtualize()
    ? portfolio.virtualizedItems.value
    : portfolio.infiniteItems.value;
});

  return d ? String(d) : "";
}

  return (
    item.liveUrl ||
    item.url ||
    (item.links || []).find((l: any) => !!l?.url)?.url ||
    ""
  );
}

  try {
    selectedViewItem.value = item;
    showViewModal.value = true;
  } catch {}
}

  try {
    await portfolio.toggleFeatured(item.id);
  } catch {}
}

  // Close the view modal and navigate to edit
  showViewModal.value = false;
  selectedViewItem.value = null;
  // For now, just navigate to manage page
  goManage();
}

  // Close the view modal and handle duplication
  showViewModal.value = false;
  selectedViewItem.value = null;
  console.log("Duplicate item:", item);
}

  router.push("/portfolio/manage");
}

  showPortfolioManager.value = false;
  router.push("/portfolio/manage?action=create");
}

  showPortfolioManager.value = false;
  router.push("/portfolio/manage");
}

  showPortfolioManager.value = false;
  router.push("/portfolio/manage?tab=bulk");
}

  showPortfolioManager.value = false;
  router.push("/portfolio/manage?tab=import");
}

  showPortfolioManager.value = false;
  router.push("/portfolio/manage?tab=settings");
}

  showPortfolioManager.value = false;
  router.push("/portfolio/manage?tab=analytics");
}

// Share/export helpers
  try {
    if (navigator.share) await navigator.share({ title: "My Portfolio", url });
    else await navigator.clipboard.writeText(url);
  } catch {}
}

  try {
    // Close the modal
    showExportOptions.value = false;

    // Import the portfolio export service
    const { portfolioExportRoutes } = await import(
      "@/modules/api/portfolio-export"
    );

    // Get portfolio data
    const portfolioData = portfolio.prepareExportData();

    // Convert to the expected format for the export service
    const projects = (Array.isArray(portfolioData) ? portfolioData : []).map(
      (item: any) => ({
        id: item.id,
        title: item.title || "",
        description: item.description || "",
        image: item.image || item.thumbnail || "",
        liveUrl: item.liveUrl || item.url || "",
        githubUrl:
          item.githubUrl ||
          (item.links || []).find((l: any) => l.type === "github")?.url ||
          "",
        technologies: item.skills || item.tags || [],
        featured: item.featured || false,
        type: item.type || "project",
        date: item.date,
      }),
    );

    // Export with the specified format
    await portfolioExportRoutes.downloadPortfolio(projects, format as any, {
      template: "gaming",
      theme: themeName.value === "dark" ? "dark" : "light",
      includeImages: true,
      metadata: {
        title: "Gaming Portfolio",
        author: "Portfolio Owner",
        description:
          "Professional gaming industry portfolio showcasing projects and skills",
      },
    });
  } catch (error) {
    console.error("Portfolio export failed:", error);
    // Fallback to basic JSON export
    try {
      const data = portfolio.prepareExportData();
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio-export.json";
      a.click();
    } catch {}
  }
}

// Thumbnail system helpers
  // Priority: image > thumbnail > media.url > null
  if (item.image) return item.image;
  if (item.thumbnail) return item.thumbnail;
  if (item.media?.url) return item.media.url;
  return null;
}

  const icons: Record<string, string> = {
    achievement: "mdi-trophy",
    tournament: "mdi-sword-cross",
    project: "mdi-code-braces",
    content: "mdi-video",
    leadership: "mdi-account-group",
    clip: "mdi-play-circle",
    competition: "mdi-target",
    game: "mdi-gamepad-variant",
    web: "mdi-web",
    mobile: "mdi-cellphone",
    tool: "mdi-wrench",
    demo: "mdi-monitor",
    app: "mdi-application",
    website: "mdi-earth",
  };
  return icons[type || ""] || "mdi-folder";
}

  const img = event.target as HTMLImageElement;
  img.style.display = "none";
}

  if (portfolio.skillFilters.value.includes(skill))
    portfolio.removeSkillFilter(skill);
  else portfolio.addSkillFilter(skill);
}

  try {
    // Get all visible portfolio items and suggest skills for each
    const items = visibleItems.value;
    for (const item of items) {
      await portfolio.suggestSkills(item);
    }
  } catch (error) {
    console.error("Error suggesting skills:", error);
  }
}

// IntersectionObserver for infinite scrolling / batch loading
const loadMoreRef = ref<HTMLElement | null>(null);
let observer: any = null;

onMounted(() => {
  try {
    observer = new (window as any).IntersectionObserver(
      async (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // For virtualization, expand range; else load next page
            if (portfolio.shouldVirtualize()) {
              const end = Math.min(
                portfolio.visibleRange.value.end + portfolio.itemsPerPage.value,
                portfolio.filtered.value.length,
              );
              portfolio.updateVisibleRange(
                portfolio.visibleRange.value.start,
                end,
              );
            } else {
              await portfolio.loadMoreItems();
            }
          }
        }
      },
    );
    if (loadMoreRef.value) observer.observe(loadMoreRef.value);
  } catch {}
});

onBeforeUnmount(() => {
  try {
    observer?.disconnect();
  } catch {}
});

// Keep virtualized window aligned to current page size
watch(
  () => portfolio.itemsPerPage.value,
  (n) => {
    if (portfolio.shouldVirtualize()) {
    }
  },
);

const stats = computed(() => portfolio.stats.value);
</script>

<style scoped>
.portfolio-topbar {
  position: sticky;
  z-index: var(--z-sticky);
  background: var(--glass-surface);
  box-shadow: var(--shadow-sm);
  backdrop-filter: var(--glass-backdrop-blur);
}
.topbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.topbar-group {
  display: flex;
  align-items: center;
  min-width: auto;
}

.search-group {
}

.search-group input {
}

.topbar-group select,
.topbar-group input {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  backdrop-filter: var(--glass-backdrop-filter);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.topbar-group select:focus,
.topbar-group input:focus {
  outline: none;
}

.toggle-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.ai-tools {
  margin-left: auto;
}

.ai-tools-modal-overlay {
  position: fixed;
  background: var(--surface-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-tools-modal {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: var(--glass-surface);
  display: flex;
  flex-direction: column;
  backdrop-filter: var(--glass-backdrop-blur);
}
.modal-header {
  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}
.modal-title {
}
.modal-body {
  display: flex;
  flex-direction: column;
}

.switch {
  position: relative;
  display: inline-block;
}
.switch input {
}
.switch .slider {
  position: absolute;
  cursor: pointer;
  background: var(--glass-border);
  transition: var(--duration-fast) var(--easing-ease-out);
  border-radius: var(--radius-full);
}
.switch .slider:before {
  position: absolute;
  content: "";
  background: var(--surface-elevated);
  transition: var(--duration-fast) var(--easing-ease-out);
  box-shadow: var(--shadow-sm);
}
.switch input:checked + .slider {
}
.switch input:checked + .slider:before {
  background: white;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
}
.skill-chip-btn {
  border-radius: var(--radius-full) !important;
  font-weight: var(--font-weight-medium) !important;
  transition: all var(--duration-fast) var(--easing-ease-out) !important;
}
.skill-chip-btn .count {
  font-size: var(--font-size-xs);
}

.items {
  display: grid;
}

.items.list {
}

.portfolio-grid {
  display: grid;
  align-items: start;
}

  .portfolio-grid {
  }
}

  .portfolio-grid {
  }
}
.item {
  display: grid;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.item:hover {
}

.items.list .item {
  grid-template-rows: auto;
  height: auto;
}
.media {
  position: relative;
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backdrop-filter: var(--glass-backdrop-blur);
}

.media-image {
  object-fit: cover;
  transition: transform var(--duration-normal) var(--easing-ease-out);
}

.item:hover .media-image {
}

.media-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
  );
}

.fallback-icon {
  color: var(--text-tertiary);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.item:hover .fallback-icon {
  color: var(--text-secondary);
}
.badges {
  position: absolute;
  display: flex;
}
.body {
  display: flex;
  flex-direction: column;
}

.body .content {
  display: flex;
  flex-direction: column;
}

.body .actions {
  margin-top: auto;
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
  flex-wrap: wrap;
}
.pill {
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}
.tags {
  display: flex;
  flex-wrap: wrap;
}
.tag {
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.primary-actions {
  display: flex;
}

.secondary-actions {
  display: flex;
}

.footer-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
}

.load-more-sentinel {
}

.analytics {
}
.stat-grid {
}
.stat {
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  text-align: center;
  backdrop-filter: var(--glass-backdrop-blur);
}
.val {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}
.lbl {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

  .items.list .item {
  }
}

  .topbar-row {
  }
  .topbar-group {
    min-width: auto;
  }
  .search-group {
  }
}

.portfolio-stats-section {
}

.stats-controls-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  align-self: stretch;
}

.stat {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  text-align: center;
  backdrop-filter: var(--glass-backdrop-filter);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.stat:hover {
  background: var(--glass-hover-bg);
}

.stat .val {
  font-weight: var(--font-weight-bold);
}

.stat .lbl {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.portfolio-controls {
  display: flex;
  align-items: center;
  align-self: center;
}

.portfolio-manager-modal-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portfolio-manager-modal {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  max-width: var(--page-narrow-width);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.close-button:hover {
  color: var(--text-primary);
  background: var(--glass-surface);
}

.modal-body {
}

.manager-options {
  display: grid;
}

.option-card {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.option-card:hover {
  background: var(--glass-bg);
}

.option-icon {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.option-card:hover .option-icon {
}

.option-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.option-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-body);
}

  .topbar-row {
  }

  .search-group {
  }

  .topbar-group {
    min-width: auto;
  }
}

  .stats-controls-layout {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
  }

  .portfolio-controls {
    justify-content: center;
  }

  .topbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group {
    max-width: none;
  }

  .ai-tools {
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
  }

  .manager-options {
  }

  .modal-header {
  }

  .modal-body {
  }
}

  .stats-grid {
  }

  .stat {
  }

  .val {
  }
}

[data-theme="dark"] .chip {
  background: var(--glass-bg);
}
[data-theme="dark"] .tag {
  background: var(--glass-bg);
}
</style>
