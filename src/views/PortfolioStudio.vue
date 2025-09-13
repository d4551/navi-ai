<template>
  <StandardPageLayout
    title="Portfolio Studio"
    subtitle="Showcase your gaming projects, achievements, and creative works"
    title-icon="mdi-folder-multiple-image"
    page-type="gaming"
    :hero-stats="headerStats"
    :header-context="{
      projects: projectsCount,
      clips: clipsCount,
      achievements: achievementsCount,
    }"
    max-width="xl"
    :data-theme="themeName"
  >
    <template #header-actions>
      <HeaderActions
        layout="horizontal"
        alignment="end"
        gap="md"
        priority="primary"
      >
        <UnifiedButton
          variant="gaming"
          size="md"
          leading-icon="mdi-plus"
          @click="addProject"
        >
          Add Project
        </UnifiedButton>
        <UnifiedButton
          variant="glass"
          size="md"
          leading-icon="mdi-github"
          @click="importGithub"
        >
          Import from GitHub
        </UnifiedButton>
        <UnifiedButton
          variant="outline"
          size="md"
          leading-icon="mdi-robot"
          @click="generateShowcase"
        >
          AI Showcase
        </UnifiedButton>
        <UnifiedButton
          variant="ghost"
          size="md"
          icon-only
          icon="mdi-share-variant"
          aria-label="Share portfolio"
          @click="sharePortfolio"
        />
        <UnifiedButton
          variant="ghost"
          size="md"
          icon-only
          icon="mdi-cog"
          aria-label="Portfolio settings"
          @click="openSettings"
        />
        <CompactGamifyHUD />
      </HeaderActions>
    </template>

    <!-- Enhanced Navigation with Breadcrumbs and Quick Actions -->
    <div class="enhanced-navigation-section unified-container">
      <div class="navigation-header">
        <div class="breadcrumb-section">
          <NavigationBreadcrumbs
            :compact="false"
            :show-actions="true"
            home-icon="mdi-gamepad-variant"
            home-text="Gaming Hub"
            :show-share="true"
            :show-copy-url="true"
          />
          <div class="page-meta">
            <div class="page-status">
              <AppIcon name="mdi-check-circle" class="status-icon success" />
              <span class="status-text">Portfolio Active</span>
            </div>
            <div class="last-updated">
              <AppIcon name="mdi-clock-outline" />
              <span>Last updated {{ lastUpdated }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Navigation Actions -->
        <div class="quick-nav-actions">
          <UnifiedButton
            variant="glass"
            size="sm"
            leading-icon="mdi-refresh"
            @click="refreshPortfolio"
          >
            Refresh
          </UnifiedButton>
          <UnifiedButton
            v-if="isMobile"
            class="mobile-nav-toggle"
            variant="glass"
            size="sm"
            icon-only
            icon="mdi-filter-variant"
            aria-label="Open filters"
            @click="toggleMobileFilters"
          />
        </div>
      </div>

      <!-- Enhanced Tab Navigation -->
      <div class="enhanced-tabs-section">
        <GlassNavTabs
          v-model:active-tab="activeTab"
          :tabs="enhancedTabsComputed"
          aria-label="Portfolio sections"
          :grid-layout="true"
        />

        <!-- Tab Content Summary -->
        <div class="tab-summary">
          <div class="summary-item">
            <AppIcon name="mdi-view-grid" />
            <span>{{ getTabSummary() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Portfolio Topbar -->
    <div class="enhanced-portfolio-topbar-section unified-container">
      <PortfolioTopbar
        :projects="filteredProjects"
        :skills="availableSkills"
        :initial-view-mode="viewMode"
        :show-skills-section="true"
        @update:search="handleSearchUpdate"
        @update:filters="handleFiltersUpdate"
        @update:sort="handleSortUpdate"
        @update:view-mode="handleViewModeUpdate"
        @toggle-analytics="handleToggleAnalytics"
        @open-ai-tools="handleOpenAITools"
      />
    </div>

    <!-- Improved Layout Structure -->
    <section
      class="portfolio-layout unified-container"
      :class="{ 'filters-open': filtersOpen }"
    >
      <!-- Enhanced Filter Sidebar -->
      <aside
        id="portfolio-filters"
        class="enhanced-filter-sidebar section-card"
        role="region"
        aria-label="Portfolio Filters"
      >
        <div class="sidebar-header">
          <h3 class="sidebar-main-title">
            <AppIcon name="mdi-tune" />
            Portfolio Filters
          </h3>
          <div class="filter-summary">
            <span v-if="hasActiveFilters" class="active-count">{{ activeFiltersCount }} active</span>
            <UnifiedButton
              v-if="hasActiveFilters"
              variant="ghost"
              size="xs"
              icon-only
              icon="mdi-close"
              aria-label="Clear all filters"
              @click="clearAllFilters"
            />
          </div>
        </div>

        <!-- Enhanced Search Section -->
        <div class="sidebar-section search-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-magnify" />
            <span>Search Projects</span>
            <span v-if="query" class="search-count">({{ searchResultsCount }})</span>
          </div>
          <div class="enhanced-search-wrapper">
            <div class="search-section">
              <div class="search-input-container">
                <AppIcon name="mdi-magnify" class="search-icon" />
                <input
                  v-model="query"
                  type="search"
                  class="enhanced-search-input glass-input"
                  placeholder="Search projects, skills, tags..."
                  :aria-describedby="query ? 'search-results' : undefined"
                  @keydown.escape="query = ''"
                  @focus="searchFocused = true"
                  @blur="searchFocused = false"
                />
                <UnifiedButton
                  v-if="query"
                  class="search-clear-btn"
                  variant="ghost"
                  icon-only
                  icon="mdi-close"
                  size="xs"
                  aria-label="Clear search"
                  @click="clearSearch"
                />
              </div>

              <!-- Quick Filter Tabs -->
              <div class="quick-filter-tabs">
                <button
                  class="filter-tab"
                  :class="{ active: !activeQuickFilter }"
                  @click="activeQuickFilter = null"
                >
                  <AppIcon name="mdi-view-grid" />
                  <span>All</span>
                  <span class="tab-count">{{ projects.length }}</span>
                </button>
                <button
                  class="filter-tab"
                  :class="{ active: activeQuickFilter === 'recent' }"
                  @click="activeQuickFilter = 'recent'"
                >
                  <AppIcon name="mdi-clock-outline" />
                  <span>Recent</span>
                  <span class="tab-count">{{ recentProjects.length }}</span>
                </button>
                <button
                  class="filter-tab"
                  :class="{ active: activeQuickFilter === 'featured' }"
                  @click="activeQuickFilter = 'featured'"
                >
                  <AppIcon name="mdi-star" />
                  <span>Featured</span>
                  <span class="tab-count">{{ featuredProjects.length }}</span>
                </button>
              </div>
            </div>

            <!-- Search Suggestions -->
            <div
              v-if="searchSuggestions.length > 0 && searchFocused"
              class="search-suggestions"
            >
              <div class="suggestions-header">Quick Searches:</div>
              <div class="suggestions-list">
                <button
                  v-for="suggestion in searchSuggestions"
                  :key="suggestion"
                  class="suggestion-item"
                  @click="applySearchSuggestion(suggestion)"
                >
                  <AppIcon name="mdi-history" />
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>

          <!-- Search Results Summary -->
          <div v-if="query" class="search-results-summary">
            <div v-if="filteredProjects.length === 0" class="search-no-results">
              <AppIcon name="mdi-magnify-close" />
              <span>No projects found for "{{ query }}"</span>
              <UnifiedButton variant="ghost" size="sm" @click="clearSearch">
                Clear search
              </UnifiedButton>
            </div>
            <div v-else class="search-success">
              <AppIcon name="mdi-check-circle" />
              <span>Found {{ filteredProjects.length }}
                {{
                  filteredProjects.length === 1 ? "project" : "projects"
                }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-engine" />
            <span>Engine</span>
            <span v-if="engine.values().length" class="filter-count">({{ engine.values().length }})</span>
          </div>
          <div class="chips">
            <button
              v-for="eng in engines"
              :key="eng"
              class="chip filter-chip"
              :class="{ active: engine.has(eng) }"
              :aria-pressed="engine.has(eng)"
              @click="toggle(engine, eng)"
            >
              {{ eng }}
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-monitor" />
            <span>Platform</span>
            <span v-if="platform.values().length" class="filter-count">({{ platform.values().length }})</span>
          </div>
          <div class="chips">
            <button
              v-for="p in platforms"
              :key="p"
              class="chip filter-chip"
              :class="{ active: platform.has(p) }"
              :aria-pressed="platform.has(p)"
              @click="toggle(platform, p)"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-account" />
            <span>Role</span>
            <span v-if="role.values().length" class="filter-count">({{ role.values().length }})</span>
          </div>
          <div class="chips">
            <button
              v-for="r in roles"
              :key="r"
              class="chip filter-chip"
              :class="{ active: role.has(r) }"
              :aria-pressed="role.has(r)"
              @click="toggle(role, r)"
            >
              {{ r }}
            </button>
          </div>
        </div>

        <div class="sidebar-section skills-tags-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-tag-multiple" />
            <span>Skills & Tags</span>
            <span v-if="tags.values().length" class="filter-count">({{ tags.values().length }})</span>
          </div>
          <div class="tags-search-wrapper">
            <input
              v-model="tagSearch"
              type="search"
              class="form-control glass-input tag-search"
              placeholder="Search skills, tags..."
              @keydown.escape="tagSearch = ''"
            />
          </div>

          <!-- Skill Categories -->
          <div class="skill-categories">
            <div class="skill-category">
              <h4 class="category-title">
                <AppIcon name="mdi-gamepad-variant" />
                <span>Analytics</span>
                <span class="category-count">4</span>
              </h4>
              <div class="skill-chips">
                <button
                  v-for="skill in [
                    'Game Sense',
                    'Strategic Thinking',
                    'Performance Analysis',
                    'Data Analysis',
                  ]"
                  :key="skill"
                  class="chip skill-chip"
                  :class="{ active: tags.has(skill) }"
                  @click="toggle(tags, skill)"
                >
                  {{ skill }}
                  <span class="skill-level">{{ getSkillLevel(skill) }}</span>
                </button>
              </div>
            </div>

            <div class="skill-category">
              <h4 class="category-title">
                <AppIcon name="mdi-account-group" />
                <span>Soft Skills</span>
                <span class="category-count">5</span>
              </h4>
              <div class="skill-chips">
                <button
                  v-for="skill in [
                    'Consistency',
                    'Teamwork',
                    'Pressure Management',
                    'Communication',
                    'Adaptability',
                  ]"
                  :key="skill"
                  class="chip skill-chip"
                  :class="{ active: tags.has(skill) }"
                  @click="toggle(tags, skill)"
                >
                  {{ skill }}
                  <span class="skill-level">{{ getSkillLevel(skill) }}</span>
                </button>
              </div>
            </div>

            <div class="skill-category">
              <h4 class="category-title">
                <AppIcon name="mdi-camera" />
                <span>Content</span>
                <span class="category-count">4</span>
              </h4>
              <div class="skill-chips">
                <button
                  v-for="skill in [
                    'Content Creation',
                    'Video Editing',
                    'Community Management',
                    'Social Media',
                  ]"
                  :key="skill"
                  class="chip skill-chip"
                  :class="{ active: tags.has(skill) }"
                  @click="toggle(tags, skill)"
                >
                  {{ skill }}
                  <span class="skill-level">{{ getSkillLevel(skill) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- All Tags Section -->
          <div class="all-tags-section">
            <h4 class="category-title">
              <AppIcon name="mdi-tag-outline" />
              <span>All Tags</span>
              <span class="category-count">{{ filteredTags.length }}</span>
            </h4>
            <div class="chips chips-scrollable">
              <button
                v-for="t in filteredTags"
                :key="t"
                class="chip filter-chip"
                :class="{ active: tags.has(t) }"
                :aria-pressed="tags.has(t)"
                @click="toggle(tags, t)"
              >
                {{ t }}
              </button>
            </div>
            <div
              v-if="tagSearch && filteredTags.length === 0"
              class="no-tags-found"
            >
              No matching tags
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-calendar-range" /> Year Range
          </div>
          <div class="year-slider">
            <div class="slider-values">
              <span>{{ yearFromRange }}</span>
              <span>–</span>
              <span>{{ yearToRange }}</span>
            </div>
            <div class="slider-wrapper">
              <input
                v-model.number="yearFromRange"
                type="range"
                :min="yearMin"
                :max="yearMax"
                @input="syncYearRange"
              />
              <input
                v-model.number="yearToRange"
                type="range"
                :min="yearMin"
                :max="yearMax"
                @input="syncYearRange"
              />
            </div>
          </div>
        </div>

        <!-- Smart Filters Section -->
        <div v-if="smartFilters.length > 0" class="sidebar-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-lightbulb-outline" />
            <span>Smart Filters</span>
          </div>
          <div class="smart-filters">
            <UnifiedButton
              v-for="filter in smartFilters"
              :key="filter.name"
              size="sm"
              variant="glass"
              class="smart-filter-btn"
              @click="filter.action"
            >
              {{ filter.name }}
              <span class="filter-count">({{ filter.count }})</span>
            </UnifiedButton>
          </div>
        </div>

        <!-- Saved Presets Section -->
        <div v-if="filterPresets.length > 0" class="sidebar-section">
          <div class="sidebar-title">
            <AppIcon name="mdi-bookmark-multiple" />
            <span>Saved Presets</span>
          </div>
          <div class="saved-presets">
            <div
              v-for="preset in filterPresets"
              :key="preset.id"
              class="preset-item"
            >
              <UnifiedButton
                size="sm"
                variant="ghost"
                class="preset-load-btn"
                @click="loadFilterPreset(preset)"
              >
                <AppIcon name="mdi-bookmark" class="me-1" />
                {{ preset.name }}
              </UnifiedButton>
              <UnifiedButton
                size="sm"
                variant="ghost"
                icon-only
                icon="mdi-delete"
                class="preset-delete-btn"
                @click="deleteFilterPreset(preset.id)"
              />
            </div>
          </div>
        </div>

        <div class="sidebar-section filter-actions">
          <UnifiedButton
            size="sm"
            variant="outline"
            leading-icon="mdi-filter-remove"
            :disabled="!hasActiveFilters"
            @click="clearAllFilters"
          >
            Clear All Filters
          </UnifiedButton>
          <UnifiedButton
            v-if="hasActiveFilters"
            size="sm"
            variant="ghost"
            leading-icon="mdi-bookmark-outline"
            @click="saveFilterPreset"
          >
            Save Preset
          </UnifiedButton>
        </div>
      </aside>

      <div class="content-area">
        <!-- Mobile quick filter (tags) -->
        <div class="quick-filter-bar d-md-none">
          <div class="chips-scroll">
            <button
              v-for="t in allTags.slice(0, 12)"
              :key="`qt-${t}`"
              class="chip"
              :class="{ active: tags.has(t) }"
              @click="toggle(tags, t)"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Enhanced Content Toolbar -->
        <div class="enhanced-content-toolbar section-card">
          <div class="toolbar-main">
            <div class="left-section">
              <!-- Mobile Filter Toggle -->
              <UnifiedButton
                class="d-md-none mobile-filter-btn"
                size="sm"
                variant="glass"
                leading-icon="mdi-filter-variant"
                :trailing-icon="
                  filtersOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'
                "
                :aria-pressed="filtersOpen ? 'true' : 'false'"
                aria-controls="portfolio-filters"
                aria-label="Toggle filters"
                @click="filtersOpen = !filtersOpen"
              >
                Filters
                <span v-if="activeFiltersCount > 0" class="filter-badge">{{
                  activeFiltersCount
                }}</span>
              </UnifiedButton>

              <!-- Results Summary -->
              <div class="enhanced-result-summary">
                <div class="result-count">
                  <strong>{{ filteredProjects.length }}</strong>
                  <span class="of-total">of {{ projects.length }}</span>
                  <span class="item-type">{{
                    filteredProjects.length === 1 ? "project" : "projects"
                  }}</span>
                </div>
                <div v-if="hasActiveFilters" class="active-filters-summary">
                  <AppIcon name="mdi-filter-check" />
                  <span>{{ activeFiltersCount }} filters applied</span>
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    icon-only
                    icon="mdi-close"
                    aria-label="Clear filters"
                    class="clear-filters-btn"
                    @click="clearAllFilters"
                  />
                </div>
              </div>
            </div>

            <div class="right-section">
              <!-- Enhanced Sort Controls -->
              <div class="sort-controls-enhanced">
                <label class="sort-label">Sort:</label>
                <div class="sort-group d-none d-md-inline-flex">
                  <UnifiedButton
                    size="sm"
                    :variant="sortBy === 'recent' ? 'primary' : 'glass'"
                    :class="{ active: sortBy === 'recent' }"
                    leading-icon="mdi-clock-outline"
                    @click="sortBy = 'recent'"
                  >
                    Recent
                  </UnifiedButton>
                  <UnifiedButton
                    size="sm"
                    :variant="sortBy === 'title' ? 'primary' : 'glass'"
                    :class="{ active: sortBy === 'title' }"
                    leading-icon="mdi-sort-alphabetical-ascending"
                    @click="sortBy = 'title'"
                  >
                    Name
                  </UnifiedButton>
                  <UnifiedButton
                    size="sm"
                    :variant="sortBy === 'engine' ? 'primary' : 'glass'"
                    :class="{ active: sortBy === 'engine' }"
                    leading-icon="mdi-engine"
                    @click="sortBy = 'engine'"
                  >
                    Engine
                  </UnifiedButton>
                  <UnifiedButton
                    size="sm"
                    :variant="sortBy === 'featured' ? 'primary' : 'glass'"
                    :class="{ active: sortBy === 'featured' }"
                    leading-icon="mdi-star"
                    @click="sortBy = 'featured'"
                  >
                    Featured
                  </UnifiedButton>
                </div>

                <!-- Mobile Sort Dropdown -->
                <select
                  v-model="sortBy"
                  class="enhanced-sort-select d-inline d-md-none"
                  aria-label="Sort projects"
                >
                  <option value="recent">📅 Recent</option>
                  <option value="title">🔤 Name</option>
                  <option value="engine">🎮 Engine</option>
                  <option value="featured">⭐ Featured</option>
                </select>
              </div>

              <!-- View Controls -->
              <div class="view-controls-enhanced">
                <div class="view-toggle-wrapper">
                  <ViewToggle
                    v-model="viewMode"
                    :options="[
                      {
                        value: 'grid',
                        icon: 'mdi-view-grid',
                        label: 'Grid view',
                      },
                      {
                        value: 'list',
                        icon: 'mdi-view-list',
                        label: 'List view',
                      },
                      {
                        value: 'masonry',
                        icon: 'mdi-view-masonry',
                        label: 'Masonry view',
                      },
                    ]"
                    size="sm"
                    active-variant="primary"
                    inactive-variant="glass"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Toolbar Secondary (Advanced Controls) -->
          <div class="toolbar-secondary">
            <div class="advanced-options">
              <label class="feature-toggle">
                <input
                  v-model="autoFeature"
                  type="checkbox"
                  @change="autoFeatureUpdate"
                />
                <span class="checkmark"></span>
                <span class="toggle-text">
                  <AppIcon name="mdi-star-outline" />
                  Auto-feature top projects
                </span>
              </label>

              <UnifiedButton
                variant="ghost"
                size="sm"
                leading-icon="mdi-download"
                @click="exportPortfolio"
              >
                Export
              </UnifiedButton>

              <UnifiedButton
                variant="ghost"
                size="sm"
                leading-icon="mdi-cog"
                @click="openPortfolioSettings"
              >
                Settings
              </UnifiedButton>
            </div>
          </div>
        </div>

        <!-- Enhanced Showcase Section -->
        <section
          v-show="activeTab === 'showcase'"
          class="panel unified-container"
        >
          <!-- Showcase Header -->
          <div class="section-header section-card mb-4 p-4">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h2 class="section-title">
                  <AppIcon name="mdi-star-circle" class="text-warning me-2" />
                  Featured Showcase
                </h2>
                <p class="section-description mb-0">
                  Your best work, prominently displayed for maximum impact
                </p>
              </div>
              <div class="showcase-actions d-flex gap-2">
                <UnifiedButton
                  variant="glass"
                  size="sm"
                  leading-icon="mdi-auto-fix"
                  :loading="generatingShowcase"
                  @click="generateShowcase"
                >
                  AI Curate
                </UnifiedButton>
                <UnifiedButton
                  variant="outline"
                  size="sm"
                  leading-icon="mdi-eye-outline"
                  @click="previewShowcase"
                >
                  Preview
                </UnifiedButton>
              </div>
            </div>
          </div>

          <div
            v-if="showcaseProjects.length === 0"
            class="empty-state enhanced-empty"
          >
            <div class="empty-state-content">
              <div class="empty-icon-stack">
                <AppIcon
                  name="mdi-star-circle-outline"
                  class="empty-icon primary"
                />
                <AppIcon name="mdi-plus" class="empty-icon-overlay" />
              </div>
              <h3>No Featured Projects Yet</h3>
              <p>
                Create an impressive showcase by featuring your best projects,
                or let our AI automatically curate your top work based on
                engagement and quality metrics.
              </p>
              <div class="empty-actions-enhanced">
                <UnifiedButton
                  variant="gaming"
                  leading-icon="mdi-auto-fix"
                  @click="generateShowcase"
                >
                  Auto-Generate Showcase
                </UnifiedButton>
                <UnifiedButton
                  variant="glass"
                  leading-icon="mdi-star-outline"
                  @click="manuallyFeature"
                >
                  Feature Projects Manually
                </UnifiedButton>
              </div>
            </div>
          </div>
          <div
            v-else
            class="responsive-grid responsive-grid--cards-sm showcase-grid"
          >
            <div
              v-for="p in showcaseProjects"
              :key="p.id || p.title"
              class="showcase-card section-card unified-card is-interactive neon-hover ripple-soft"
            >
              <div
                class="thumb"
                :style="{ backgroundImage: p.cover ? `url(${p.cover})` : '' }"
              >
                <div v-if="!p.cover" class="thumb-fallback">
                  {{ (p.title || "Project").slice(0, 1) }}
                </div>
                <div class="badges">
                  <span v-if="p.featured" class="badge featured"><AppIcon name="mdi-star" /> Featured</span>
                  <span v-if="p.engine" class="badge"><AppIcon name="mdi-engine" /> {{ p.engine }}</span>
                  <span v-if="p.platform" class="badge"><AppIcon name="mdi-monitor" /> {{ p.platform }}</span>
                </div>
              </div>
              <div class="body">
                <div class="title">{{ p.title || "Untitled Project" }}</div>
                <div class="meta">
                  {{ p.role || "Contributor" }} • {{ displayYear(p.year) }}
                </div>
                <div v-if="(p.tags || []).length" class="tags">
                  <span
                    v-for="t in (p.tags || []).slice(0, 4)"
                    :key="t"
                    class="tag"
                  >{{ t }}</span>
                </div>
                <div class="actions">
                  <UnifiedButton
                    size="sm"
                    variant="glass"
                    leading-icon="mdi-eye"
                    @click="viewProject(p)"
                  >
                    View
                  </UnifiedButton>
                  <UnifiedButton
                    size="sm"
                    variant="outline"
                    leading-icon="mdi-share-variant"
                    @click="shareProject(p)"
                  >
                    Share
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Enhanced Projects Section -->
        <section
          v-show="activeTab === 'projects'"
          class="panel unified-container"
        >
          <div v-if="filteredProjects.length === 0" class="empty-state">
            <div class="empty-state-content">
              <AppIcon name="mdi-briefcase-outline" class="empty-icon" />
              <h3>
                {{
                  projects.length === 0
                    ? "No Projects Yet"
                    : "No Matching Projects"
                }}
              </h3>
              <p v-if="projects.length === 0">
                Start building your portfolio by adding your first project.
              </p>
              <p v-else>
                Try adjusting your filters or search terms to find projects.
              </p>
              <div class="empty-actions">
                <UnifiedButton
                  v-if="projects.length === 0"
                  variant="primary"
                  leading-icon="mdi-plus"
                  @click="addProject"
                >
                  Add Your First Project
                </UnifiedButton>
                <UnifiedButton
                  v-else
                  variant="outline"
                  leading-icon="mdi-filter-remove"
                  @click="clearAllFilters"
                >
                  Clear All Filters
                </UnifiedButton>
              </div>
            </div>
          </div>
          <div v-else :class="['responsive-grid', 'projects-grid', viewMode]">
            <div
              v-for="p in filteredProjects"
              :key="p.id || p.title"
              class="project-card section-card unified-card is-interactive neon-hover ripple-soft"
            >
              <div class="row">
                <div
                  class="cover"
                  :style="{ backgroundImage: p.cover ? `url(${p.cover})` : '' }"
                ></div>
                <div class="info">
                  <div class="title">
                    <AppIcon name="mdi-gamepad-variant" />
                    {{ p.title || "Untitled Project" }}
                  </div>
                  <div class="sub">
                    {{ p.role || "Contributor" }} • {{ p.engine || "Engine" }} •
                    {{ p.platform || "Platform" }}
                  </div>
                  <div class="desc">
                    {{ (p.description || "").slice(0, 160) }}
                  </div>
                  <div class="tags">
                    <span
                      v-for="t in (p.tags || []).slice(0, 6)"
                      :key="t"
                      class="tag"
                    >{{ t }}</span>
                  </div>
                  <div class="actions">
                    <UnifiedButton
                      v-if="p.demoUrl"
                      size="sm"
                      variant="glass"
                      leading-icon="mdi-play"
                      :href="p.demoUrl"
                      target="_blank"
                    >
                      Play
                    </UnifiedButton>
                    <UnifiedButton
                      v-if="p.link"
                      size="sm"
                      variant="glass"
                      leading-icon="mdi-open-in-new"
                      :href="p.link"
                      target="_blank"
                    >
                      Open
                    </UnifiedButton>
                    <UnifiedButton
                      size="sm"
                      variant="outline"
                      leading-icon="mdi-pencil"
                      @click="editProject(p)"
                    >
                      Edit
                    </UnifiedButton>
                    <UnifiedButton
                      size="sm"
                      :variant="p.featured ? 'primary' : 'ghost'"
                      :leading-icon="
                        p.featured ? 'mdi-star' : 'mdi-star-outline'
                      "
                      @click="toggleFeatured(p)"
                    >
                      {{ p.featured ? "Featured" : "Pin" }}
                    </UnifiedButton>
                  </div>

                  <!-- Inline tag editor toggle -->
                  <div class="tag-editor">
                    <button class="chip" @click="toggleTagEditor(p)">
                      <AppIcon name="mdi-tag-plus" /> Edit Tags
                    </button>
                  </div>
                  <div
                    v-if="editingTagsFor === (p.id || p.title)"
                    class="tag-editor-panel"
                  >
                    <div class="chips">
                      <button
                        v-for="t in allTags"
                        :key="t"
                        class="chip"
                        :class="{ active: (p.tags || []).includes(t) }"
                        @click="toggleProjectTag(p, t)"
                      >
                        {{ t }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>

    <!-- Clips -->
    <section v-show="activeTab === 'clips'" class="panel unified-container">
      <div class="responsive-grid responsive-grid--cards-sm clips-grid">
        <div
          v-for="c in clips"
          :key="c.id || c.url"
          class="clip section-card unified-card is-interactive neon-hover ripple-soft"
        >
          <div class="embed">
            <iframe
              v-if="c.url"
              :src="toEmbedUrl(c.url)"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <div class="caption">
            <div class="title">{{ c.title || "Gameplay Clip" }}</div>
            <div class="meta">
              {{ c.game || "Game" }} • {{ c.platform || "Platform" }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievements -->
    <section
      v-show="activeTab === 'achievements'"
      class="panel unified-container"
    >
      <div class="responsive-grid responsive-grid--cards-sm achievements-grid">
        <div
          v-for="a in achievements"
          :key="a.id || a.title"
          class="ach-card section-card unified-card is-interactive neon-hover ripple-soft"
        >
          <div class="title"><AppIcon name="mdi-trophy" /> {{ a.title }}</div>
          <div class="meta">
            {{ a.date || a.year }} • {{ a.category || "Achievement" }}
          </div>
          <div class="desc">{{ a.description }}</div>
        </div>
      </div>
    </section>

    <!-- Analytics -->
    <section v-show="activeTab === 'analytics'" class="panel glass-surface">
      <div class="responsive-grid responsive-grid--compact-fill stat-grid">
        <div class="stat">
          <div class="val">{{ projectsCount }}</div>
          <div class="lbl">Projects</div>
        </div>
        <div class="stat">
          <div class="val">{{ uniqueTags }}</div>
          <div class="lbl">Unique Tags</div>
        </div>
        <div class="stat">
          <div class="val">{{ clipsCount }}</div>
          <div class="lbl">Clips</div>
        </div>
        <div class="stat">
          <div class="val">{{ achievementsCount }}</div>
          <div class="lbl">Achievements</div>
        </div>
      </div>
    </section>
  </StandardPageLayout>

  <!-- Portfolio View Modal -->
  <PortfolioViewModal
    :show="showViewModal"
    :item="selectedViewItem"
    @close="
      showViewModal = false;
      selectedViewItem = null;
    "
    @edit="handleEditProject"
    @duplicate="handleDuplicateProject"
  />

  <!-- Portfolio Export Modal -->
  <PortfolioExportModal
    :show="showExportModal"
    :portfolio="projects"
    @close="showExportModal = false"
    @export="handlePortfolioExport"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { ref, computed, watch, onUnmounted, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import GlassNavTabs from "@/components/GlassNavTabs.vue";
import NavigationBreadcrumbs from "@/components/navigation/NavigationBreadcrumbs.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import HeaderActions from "@/components/ui/HeaderActions.vue";
import ViewToggle from "@/components/ui/ViewToggle.vue";
import PortfolioTopbar from "@/components/portfolio/PortfolioTopbar.vue";
import CompactGamifyHUD from "@/components/CompactGamifyHUD.vue";
import PortfolioViewModal from "@/components/portfolio/PortfolioViewModal.vue";
import PortfolioExportModal from "@/components/portfolio/PortfolioExportModal.vue";
import { portfolioExportRoutes } from "@/modules/api/portfolio-export";
import { useToast } from "@/composables/useToast";
import usePortfolio from "@/composables/usePortfolio";
import { PortfolioService } from "@/shared/services/PortfolioService";

const store = useAppStore();
const _router = useRouter();
const _theme = (() => {
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
const { addItem } = usePortfolio();
const {
  success: toastSuccess,
  info: toastInfo,
  error: toastError,
} = useToast();

// Modal states
const showViewModal = ref(false);
const selectedViewItem = ref(null);
const showExportModal = ref(false);

// Tab definitions
const portfolioTabs = computed(() => [
  {
    key: "showcase",
    label: "Featured Showcase",
    icon: "mdi-star-circle-outline",
    shortLabel: "Featured",
    count: showcaseProjects.value.length,
    description: "Your best work, prominently displayed",
  },
  {
    key: "projects",
    label: "All Projects",
    icon: "mdi-briefcase-outline",
    shortLabel: "Projects",
    count: filteredProjects.value.length,
    description: "Complete portfolio collection",
  },
  {
    key: "clips",
    label: "Media Gallery",
    icon: "mdi-play-circle-outline",
    shortLabel: "Media",
    count: clips.value.length,
    description: "Gameplay clips and videos",
  },
  {
    key: "achievements",
    label: "Achievements",
    icon: "mdi-trophy-outline",
    shortLabel: "Awards",
    count: achievements.value.length,
    description: "Recognition and accomplishments",
  },
  {
    key: "analytics",
    label: "Portfolio Analytics",
    icon: "mdi-chart-line-variant",
    shortLabel: "Analytics",
    description: "Portfolio performance insights",
  },
]);
const activeTab = ref<
  "showcase" | "projects" | "clips" | "achievements" | "analytics"
>("showcase");

// New search and filter state
const activeQuickFilter = ref<string | null>(null);

// Source data (tolerant of missing fields)
const projects = computed<any[]>(() =>
  (store.user?.portfolio || []).map((p: any) => ({
    title: p.title || p.name,
    id: p.id,
    cover: p.cover || p.image || "",
    description: p.description || p.summary || "",
    tags: p.tags || p.stack || [],
    engine: p.engine || inferEngine(p),
    platform: p.platform || inferPlatform(p),
    role: p.role || p.position || "",
    year: p.year || p.date || "",
    demoUrl: p.demoUrl || p.playUrl || "",
    link: p.link || p.url || "",
  })),
);

function inferEngine(p: any) {
  const t = JSON.stringify(p).toLowerCase();
  if (
    t.includes("unity") ||
    (p.stack || []).some((s: string) => /unity/i.test(s))
  )
    return "Unity";
  if (
    t.includes("unreal") ||
    (p.stack || []).some((s: string) => /unreal/i.test(s))
  )
    return "Unreal";
  if (t.includes("godot")) return "Godot";
  return "";
}
function inferPlatform(p: any) {
  const t = JSON.stringify(p).toLowerCase();
  if (t.includes("xbox")) return "Xbox";
  if (t.includes("playstation") || t.includes("ps5")) return "PlayStation";
  if (t.includes("switch")) return "Switch";
  if (t.includes("mobile") || t.includes("android") || t.includes("ios"))
    return "Mobile";
  if (t.includes("pc") || t.includes("steam")) return "PC";
  return "";
}

const clips = computed<any[]>(() =>
  (store.user?.gamingExperience?.contentCreation || []).map((c: any) => ({
    id: c.id,
    url: c.url || c.link,
    title: c.title || c.description || "",
    platform: c.platform || "",
    game: c.game || "",
  })),
);

const achievements = computed<any[]>(() =>
  (
    store.user?.gamingExperience?.achievements ||
    store.user?.achievements ||
    []
  ).map((a: any) => ({
    id: a.id,
    title: a.title || a.name,
    date: a.date,
    year: a.year,
    category: a.category || "Achievement",
    description: a.description || "",
  })),
);

const engines = ["Unity", "Unreal", "Godot"];
const platforms = ["PC", "Console", "Mobile"];
const roles = ["Programmer", "Designer", "Artist", "Producer"];

const query = ref("");
const sortBy = ref<"recent" | "title" | "engine" | "featured">("recent");
const viewMode = ref<"grid" | "list" | "masonry">("grid");
const filtersOpen = ref(false);

// Enhanced Portfolio Topbar state
const selectedType = ref("");
const featuredOnly = ref(false);
const isMobile = ref(false);

// Enhanced search and navigation state
const searchFocused = ref(false);
const lastUpdated = ref("2 hours ago");
const searchSuggestions = ref([
  "Unity Projects",
  "Mobile Games",
  "2023 Projects",
  "Featured Work",
]);
const engine = reactiveSet();
const platform = reactiveSet();
const role = reactiveSet();
const tags = reactiveSet();
// (removed duplicate declarations)
const yearFromRange = ref<number>(2000);
const yearToRange = ref<number>(new Date().getFullYear());
// Effective year filter bounds used in computed filtering
const yearFrom = ref<number | null>(2000);
const yearTo = ref<number | null>(new Date().getFullYear());
const yearMin = computed(() => {
  const ys = projects.value
    .map((p) => extractYear(p.year))
    .filter((y: any) => y !== null) as number[];
  return ys.length ? Math.min(...ys) : 2000;
});
const yearMax = computed(() => {
  const ys = projects.value
    .map((p) => extractYear(p.year))
    .filter((y: any) => y !== null) as number[];
  return ys.length ? Math.max(...ys) : new Date().getFullYear();
});
watch([yearMin, yearMax], () => {
  // Initialize slider bounds from data
  yearFromRange.value = yearMin.value;
  yearToRange.value = yearMax.value;
  yearFrom.value = yearFromRange.value;
  yearTo.value = yearToRange.value;
});
function syncYearRange() {
  if (yearFromRange.value > yearToRange.value) {
    const t = yearFromRange.value;
    yearFromRange.value = yearToRange.value;
    yearToRange.value = t;
  }
  yearFrom.value = yearFromRange.value;
  yearTo.value = yearToRange.value;
}

function reactiveSet() {
  const s = ref<Set<string>>(new Set());
  return {
    has: (v: string) => s.value.has(v),
    add: (v: string) => s.value.add(v),
    delete: (v: string) => s.value.delete(v),
    toggle: (v: string) =>
      s.value.has(v) ? s.value.delete(v) : s.value.add(v),
    values: () => Array.from(s.value),
    _raw: s,
  };
}

function toggle(set: any, v: string) {
  set.toggle(v);
}

// Tag universe (sorted by frequency desc)
const allTags = computed(() => {
  const counts: Record<string, number> = {};
  for (const p of projects.value) {
    for (const t of p.tags || []) {
      const k = String(t);
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 50);
});

// Filtered tags based on search
const filteredTags = computed(() => {
  if (!tagSearch.value.trim()) return allTags.value;
  const searchTerm = tagSearch.value.toLowerCase().trim();
  return allTags.value.filter((tag) => tag.toLowerCase().includes(searchTerm));
});

// New computed properties for quick filters
const recentProjects = computed(() => {
  const now = new Date();
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 6,
    now.getDate(),
  );
  return projects.value
    .filter((p) => {
      const projectDate = new Date(p.year || p.date || now);
      return projectDate >= sixMonthsAgo;
    })
    .sort(
      (a, b) =>
        new Date(b.year || b.date || 0).getTime() -
        new Date(a.year || a.date || 0).getTime(),
    );
});

const featuredProjects = computed(() => {
  return projects.value.filter((p) => p.featured || p.showcase || p.pinned);
});

// Skill level mapping
const skillLevels: Record<string, number> = {
  "Game Sense": 1,
  "Strategic Thinking": 1,
  "Performance Analysis": 1,
  "Data Analysis": 1,
  Consistency: 1,
  Teamwork: 1,
  "Pressure Management": 1,
  Communication: 1,
  Adaptability: 1,
  "Content Creation": 1,
  "Video Editing": 1,
  "Community Management": 1,
  "Social Media": 1,
};


const getSkillLevel = (skill: string): string => {
  const level = skillLevels[skill] || 1;
  return level.toString();
};

function extractYear(input: any): number | null {
  if (!input) return null;
  try {
    const str = String(input);
    const m = str.match(/(19|20)\d{2}/);
    if (m) return parseInt(m[0]);
    const d = Date.parse(str);
    if (!Number.isNaN(d)) return new Date(d).getFullYear();
    return null;
  } catch {
    return null;
  }
}

const filteredProjects = computed(() => {
  const q = query.value.trim().toLowerCase();
  const e = engine.values();
  const p = platform.values();
  const r = role.values();
  const t = tags.values();
  const yFrom = yearFrom.value || null;
  const yTo = yearTo.value || null;
  let list = projects.value.filter((pr) => {
    const qOk = !q || JSON.stringify(pr).toLowerCase().includes(q);
    const eOk = !e.length || (pr.engine && e.includes(pr.engine));
    const pOk = !p.length || (pr.platform && p.includes(pr.platform));
    const rOk = !r.length || (pr.role && r.includes(pr.role));
    const tOk =
      !t.length || (pr.tags || []).some((tg: string) => t.includes(String(tg)));
    let yOk = true;
    if (yFrom || yTo) {
      const y = extractYear(pr.year);
      if (yFrom && y !== null) yOk = yOk && y >= yFrom;
      if (yTo && y !== null) yOk = yOk && y <= yTo;
      if (y === null) yOk = false;
    }
    return qOk && eOk && pOk && rOk && tOk && yOk;
  });
  if (sortBy.value === "title")
    list = list
      .slice()
      .sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || "")),
      );
  else if (sortBy.value === "engine")
    list = list
      .slice()
      .sort((a, b) =>
        String(a.engine || "").localeCompare(String(b.engine || "")),
      );
  else if (sortBy.value === "featured")
    list = list
      .slice()
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  else
    list = list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.year || 0).getTime() - new Date(a.year || 0).getTime(),
      );
  return list;
});

// Enhanced computed properties for navigation
const enhancedTabsComputed = computed(() =>
  portfolioTabs.value.map((tab) => ({
    ...tab,
    count: getTabCount(tab.value),
  })),
);

const searchResultsCount = computed(() =>
  query.value ? filteredProjects.value.length : 0,
);

const hasActiveFilters = computed(
  () =>
    query.value.trim() !== "" ||
    engine.values().length > 0 ||
    platform.values().length > 0 ||
    role.values().length > 0 ||
    tags.values().length > 0 ||
    (yearFrom.value !== null && yearFrom.value !== yearMin.value) ||
    (yearTo.value !== null && yearTo.value !== yearMax.value),
);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (query.value.trim()) count++;
  count += engine.values().length;
  count += platform.values().length;
  count += role.values().length;
  count += tags.values().length;
  if (yearFrom.value !== null && yearFrom.value !== yearMin.value) count++;
  if (yearTo.value !== null && yearTo.value !== yearMax.value) count++;
  return count;
});

function clearAllFilters() {
  query.value = "";
  tagSearch.value = "";
  [engine, platform, role, tags].forEach((s) => (s._raw.value = new Set()));
  yearFromRange.value = yearMin.value;
  yearToRange.value = yearMax.value;
  yearFrom.value = null;
  yearTo.value = null;

  // Focus the search input after clearing
  setTimeout(() => {
    const searchInput = document.querySelector(
      ".enhanced-search-input",
    ) as HTMLInputElement;
    if (searchInput) searchInput.focus();
  }, 100);
}

// Enhanced navigation methods
function clearSearch() {
  query.value = "";
  searchFocused.value = false;
}

function applySearchSuggestion(suggestion: string) {
  query.value = suggestion.toLowerCase();
  searchFocused.value = false;
}

function getTabCount(tabValue: string): number {
  switch (tabValue) {
    case "showcase":
    case "projects":
      return filteredProjects.value.length;
    case "clips":
      return clips.value.length;
    case "achievements":
      return achievements.value.length;
    case "analytics":
      return 0;
    default:
      return 0;
  }
}

function getTabSummary(): string {
  switch (activeTab.value) {
    case "showcase":
    case "projects":
      return `${filteredProjects.value.length} ${filteredProjects.value.length === 1 ? "project" : "projects"} ${hasActiveFilters.value ? "filtered" : "total"}`;
    case "clips":
      return `${clips.value.length} ${clips.value.length === 1 ? "clip" : "clips"}`;
    case "achievements":
      return `${achievements.value.length} ${achievements.value.length === 1 ? "achievement" : "achievements"}`;
    case "analytics":
      return "Portfolio insights and metrics";
    default:
      return "";
  }
}

function refreshPortfolio() {
  // Add refresh logic here
  console.log("Refreshing portfolio...");
  // You could emit an event or call a store action
}

function exportPortfolio() {
  showExportModal.value = true;
}

// Portfolio export handler
async function handlePortfolioExport(
  format: "html" | "pdf" | "json" | "website" | "zip",
) {
  showExportModal.value = false;

  try {
    toastInfo(`Preparing ${format.toUpperCase()} export...`);

    // Get user metadata for export
    const userProfile = store.profile || {};
    const exportOptions = {
      template: "gaming",
      theme: themeName.value === "dark" ? "dark" : "gaming",
      includeImages: true,
      includeSource: true,
      includeReadme: true,
      metadata: {
        author: userProfile.name || "Gaming Developer",
        title: `${userProfile.name || "Gaming"} Portfolio`,
        description: `Professional gaming industry portfolio showcasing ${projects.value.length} projects`,
        website: userProfile.website,
        social: {
          github: userProfile.github,
          linkedin: userProfile.linkedin,
          twitter: userProfile.twitter,
          ...(userProfile.social || {}),
        },
      },
    };

    // Convert projects to the expected format
    const portfolioProjects = projects.value.map((project) => ({
      title: project.title || "Untitled Project",
      description: project.description || "No description provided",
      image: project.cover || project.image,
      technologies: project.tags || [],
      liveUrl: project.demoUrl || project.link,
      githubUrl: project.githubUrl || project.sourceUrl,
      role: project.role,
      platform: project.platform,
      engine: project.engine,
    }));

    await portfolioExportRoutes.downloadPortfolio(
      portfolioProjects,
      format,
      exportOptions,
    );

    toastSuccess(`${format.toUpperCase()} export completed successfully!`);
  } catch (_error) {
    console.error("Export failed:", error);
    toastError(`Export failed: ${error.message || "Unknown error"}`);
  }
}

function openPortfolioSettings() {
  console.log("Opening portfolio settings...");
  // Add settings logic
}

function toggleMobileFilters() {
  filtersOpen.value = !filtersOpen.value;
}

// Advanced Filtering Features
const filterPresets = ref<
  Array<{
    id: string;
    name: string;
    filters: any;
    createdAt: Date;
  }>
>([]);

// Persistent last-session filter snapshot + quick restore
interface PortfolioFilterState {
  query: string;
  engine: string[];
  platform: string[];
  role: string[];
  tags: string[];
  yearFrom: number | null;
  yearTo: number | null;
}

const savedFilters = ref<PortfolioFilterState | null>(null);
const lastFiltersKey = "portfolio-last-filters";

function snapshotCurrentFilters(): PortfolioFilterState {
  return {
    query: query.value,
    engine: engine.values(),
    platform: platform.values(),
    role: role.values(),
    tags: tags.values(),
    yearFrom: yearFromRange.value ?? null,
    yearTo: yearToRange.value ?? null,
  };
}

function applyFilterState(state: PortfolioFilterState) {
  query.value = state.query || "";
  engine._raw.value = new Set(state.engine || []);
  platform._raw.value = new Set(state.platform || []);
  role._raw.value = new Set(state.role || []);
  tags._raw.value = new Set(state.tags || []);
  if (state.yearFrom !== null) yearFromRange.value = state.yearFrom;
  if (state.yearTo !== null) yearToRange.value = state.yearTo;
  yearFrom.value = state.yearFrom;
  yearTo.value = state.yearTo;
}

function saveTemporaryFilters() {
  savedFilters.value = snapshotCurrentFilters();
  toastInfo("Current filters saved (temporary)");
}

function restoreTemporaryFilters() {
  if (!savedFilters.value) {
    toastInfo("No saved filter state");
    return;
  }
  applyFilterState(savedFilters.value);
  toastSuccess("Filters restored");
}

function loadLastSessionFilters() {
  try {
    const raw = localStorage.getItem(lastFiltersKey);
    if (!raw) return;
    const parsed: PortfolioFilterState = JSON.parse(raw);
    if (!parsed) return;
    applyFilterState(parsed);
  } catch (_e) {
    console.warn("Failed to load last session filters", e);
  }
}

// Auto-persist filters (debounced)
let _persistTimer: any = null;
watch(
  [
    query,
    engine._raw,
    platform._raw,
    role._raw,
    tags._raw,
    yearFromRange,
    yearToRange,
  ],
  () => {
    clearTimeout(_persistTimer);
    _persistTimer = setTimeout(() => {
      try {
        const data = snapshotCurrentFilters();
        localStorage.setItem(lastFiltersKey, JSON.stringify(_data));
      } catch {}
    }, 250);
  },
  { deep: true },
);

// Load last session immediately (before onMounted to feel instant)
if (typeof window !== "undefined") {
  loadLastSessionFilters();
}

// Expose helpers if needed elsewhere
// Exposed for potential external debugging; underscore prefix marks intentional unused
const _filterStateAPI = {
  snapshotCurrentFilters,
  saveTemporaryFilters,
  restoreTemporaryFilters,
  loadLastSessionFilters,
};

function saveFilterPreset() {
  const presetName = window.prompt("Enter preset name:")?.trim();
  if (!presetName) return;

  const preset = {
    id: Date.now().toString(),
    name: presetName,
    filters: {
      query: query.value,
      engine: Array.from(engine.values()),
      platform: Array.from(platform.values()),
      role: Array.from(role.values()),
      tags: Array.from(tags.values()),
      yearFrom: yearFromRange.value,
      yearTo: yearToRange.value,
    },
    createdAt: new Date(),
  };

  filterPresets.value.push(preset);
  // Save to localStorage for persistence
  localStorage.setItem(
    "portfolio-filter-presets",
    JSON.stringify(filterPresets.value),
  );
  toastSuccess(`Filter preset "${presetName}" saved`);
}

function loadFilterPreset(preset: any) {
  query.value = preset.filters.query || "";

  // Clear existing filters
  engine._raw.value = new Set(preset.filters.engine || []);
  platform._raw.value = new Set(preset.filters.platform || []);
  role._raw.value = new Set(preset.filters.role || []);
  tags._raw.value = new Set(preset.filters.tags || []);

  yearFromRange.value = preset.filters.yearFrom || yearMin.value;
  yearToRange.value = preset.filters.yearTo || yearMax.value;

  toastInfo(`Applied preset "${preset.name}"`);
}

function deleteFilterPreset(presetId: string) {
  filterPresets.value = filterPresets.value.filter((p) => p.id !== presetId);
  localStorage.setItem(
    "portfolio-filter-presets",
    JSON.stringify(filterPresets.value),
  );
  toastInfo("Filter preset deleted");
}

// Smart filter suggestions
const smartFilters = computed(() => {
  const list = store.user?.portfolio || [];
  if (!list.length) return [];

  const suggestions = [];


  const recentCount = list.filter((p: any) => {
    const year = new Date(p.createdAt || Date.now()).getFullYear();
    return year >= new Date().getFullYear() - 2;
  }).length;

  if (recentCount > 0) {
    suggestions.push({
      name: "Recent Projects",
      count: recentCount,
      action: () => {
        clearAllFilters();
        const currentYear = new Date().getFullYear();
        yearFromRange.value = currentYear - 2;
        yearToRange.value = currentYear;
      },
    });
  }

  // Projects with demo/live links
  const withDemoCount = list.filter((p: any) => p.demoUrl || p.url).length;
  if (withDemoCount > 0) {
    suggestions.push({
      name: "With Live Demo",
      count: withDemoCount,
      action: () => {
        clearAllFilters();
        query.value = "demo OR live OR url";
      },
    });
  }

  // GitHub projects
  const githubCount = list.filter((p: any) => p.githubUrl).length;
  if (githubCount > 0) {
    suggestions.push({
      name: "Open Source",
      count: githubCount,
      action: () => {
        clearAllFilters();
        tags._raw.value = new Set(["GitHub", "Open Source"]);
      },
    });
  }

  return suggestions;
});

// Load saved presets on mount
function loadSavedPresets() {
  try {
    const saved = localStorage.getItem("portfolio-filter-presets");
    if (saved) {
      filterPresets.value = JSON.parse(saved).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    }
  } catch (_error) {
    console.warn("Failed to load filter presets:", error);
  }
}

const headerStats = computed(() => [
  {
    label: `${projects.value.length} projects`,
    icon: "mdi-briefcase",
    color: "primary",
  },
  {
    label: `${clips.value.length} clips`,
    icon: "mdi-movie-open-outline",
    color: "info",
  },
  {
    label: `${achievements.value.length} achievements`,
    icon: "mdi-trophy",
    color: "success",
  },
  {
    label: `${uniqueTags.value} tags`,
    icon: "mdi-tag-multiple",
    color: "warning",
  },
]);


const showcaseProjects = computed(() => {
  const featured = filteredProjects.value.filter((p) => p.featured);
  const nonFeatured = filteredProjects.value.filter((p) => !p.featured);
  const list = [...featured, ...nonFeatured];
  return list.slice(0, 6);
});

// Enhanced filter state management (duplicates removed)

const uniqueTags = computed(() => {
  const s = new Set<string>();
  projects.value.forEach((p) =>
    (p.tags || []).forEach((t: string) => s.add(t)),
  );
  return s.size;
});

function toEmbedUrl(url: string) {
  try {
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

function displayYear(y: any) {
  try {
    return String(y).slice(0, 4);
  } catch {
    return "";
  }
}

// Actions (stubs: integrate with existing flows as needed)
async function addProject() {
  try {
    const title = window.prompt("Project title")?.trim();
    if (!title) return;
    const link =
      window.prompt("Optional link (Steam/itch/YouTube/GitHub)")?.trim() || "";
    const meta = link ? await PortfolioService.fetchLinkMetadata(link) : {};
    await addItem({
      title,
      description: meta.description || "",
      image: meta.image || "",
      url: link,
      githubUrl:
        PortfolioService.detectPlatform(link) === "github" ? link : undefined,
      tags: [],
      engines: [],
      platforms: [],
    } as any);
    toastSuccess("Project added");
    // navigate to edit in legacy if desired
  } catch {
    toastError("Failed to add project");
  }
}

async function importGithub() {
  try {
    const url = window
      .prompt("GitHub repository URL (https://github.com/owner/repo)")
      ?.trim();
    if (!url) return;
    const meta = await PortfolioService.fetchLinkMetadata(url);
    const title = meta.title || url.split("/").slice(-1)[0];
    await addItem({
      title,
      description: meta.description || "GitHub repository import",
      githubUrl: url,
      url,
      image: meta.image || "",
      tags: ["GitHub", "Source"],
    } as any);
    toastSuccess("GitHub project imported");
  } catch {
    toastError("GitHub import failed");
  }
}

async function generateShowcase() {
  try {

    const list = store.user.portfolio || [];
    if (!list.length) {
      toastInfo("No projects to showcase");
      return;
    }
    // clone
    const items = list.map((x: any) => ({ ...x }));
    const score = (p: any) => {
      let s = 0;
      if (
        p.demoUrl ||
        p.liveUrl ||
        (p.links || []).some((l: any) =>
          /play|live|demo/i.test(l?.label || l?.type || ""),
        )
      )
        s += 5;
      if (
        p.image ||
        p.thumbnail ||
        (p.media || []).some((m: any) => /image|video/.test(m?.type || ""))
      )
        s += 3;
      if (
        (p.engines || p.tags || []).some((t: string) =>
          /unity|unreal|godot/i.test(String(t)),
        )
      )
        s += 2;
      const d = Date.parse(p.updatedAt || p.createdAt || p.date || "");
      if (!isNaN(d))
        s += Math.max(
          0,
          Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24 * 365)) * -1,
        ); // newer is better
      return s;
    };
    items.sort((a: any, b: any) => score(b) - score(a));
    const top = new Set(items.slice(0, 6).map((i: any) => i.id));
    const updated = list.map((p: any) => ({ ...p, featured: top.has(p.id) }));
    store.user.portfolio = updated;
    await store.saveToStorage();
    toastSuccess("Showcase generated: marked featured projects");
  } catch {
    toastError("Failed to generate showcase");
  }
}

function viewProject(p: any) {
  try {
    selectedViewItem.value = p;
    showViewModal.value = true;
  } catch {}
}

function handleEditProject(item: any) {
  showViewModal.value = false;
  selectedViewItem.value = null;

  console.log("Edit project:", item);
}

function handleDuplicateProject(item: any) {
  showViewModal.value = false;
  selectedViewItem.value = null;

  console.log("Duplicate project:", item);
}

async function shareProject(p: any) {
  try {
    const slug = String(p?.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const url = `${window.location.origin}${window.location.pathname}#/portfolio/project/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: p?.title || "Project", url });
      toastSuccess("Share dialog opened");
    } else {
      await navigator.clipboard.writeText(url);
      toastSuccess("Link copied to clipboard");
    }
  } catch {
    toastError("Share failed");
  }
}


async function sharePortfolio() {
  try {
    const url = `${window.location.origin}/portfolio/${store.user?.id || "anonymous"}`;
    if (navigator.share) {
      await navigator.share({
        title: "My Gaming Portfolio",
        text: "Check out my gaming portfolio and projects",
        url,
      });
      toastSuccess("Portfolio shared");
    } else {
      await navigator.clipboard.writeText(url);
      toastSuccess("Portfolio link copied to clipboard");
    }
  } catch {
    toastError("Failed to share portfolio");
  }
}

function openSettings() {
  router.push("/settings");
}


const generatingShowcase = ref(false);

async function previewShowcase() {
  try {
    const mockUrl = `${window.location.origin}/portfolio/preview/${store.user?.id || "demo"}`;
    window.open(mockUrl, "_blank");
    toastInfo("Opening showcase preview...");
  } catch {
    toastError("Failed to preview showcase");
  }
}

function manuallyFeature() {
  activeTab.value = "projects";
  toastInfo("Switch to projects tab to manually feature items");
}



function checkMobileScreen() {
  isMobile.value = window.innerWidth <= 768;
}

function handleResize() {
  checkMobileScreen();
  // Auto-close filters on desktop
  if (!isMobile.value) {
    filtersOpen.value = false;
  }
}

function editProject(p: any) {
  try {
    const id = p?.id;
    router.push({
      path: "/portfolio-legacy",
      query: { edit: id || "", focus: (p?.title || "").slice(0, 60) },
    });
  } catch {}
}

// Featured toggle and tag editing
function updateProject(p: any, updater: (_copy: any) => void) {
  try {
    const list = (store.user.portfolio || []).map((x: any) => ({ ...x }));
    const idx = list.findIndex(
      (x: any) => (x.id && x.id === p.id) || x.title === p.title,
    );
    if (idx !== -1) {
      const copy = { ...list[idx] };
      updater(copy);
      list[idx] = copy;
      store.user.portfolio = list;
      store.saveToStorage?.();
    }
  } catch {}
}

function toggleFeatured(p: any) {
  updateProject(p, (c: any) => {
    c.featured = !c.featured;
  });
}

const editingTagsFor = ref<any>(null);
const autoFeature = ref(false);
const tagSearch = ref("");

function toggleTagEditor(p: any) {
  const key = p.id || p.title;
  editingTagsFor.value = editingTagsFor.value === key ? null : key;
}

function autoFeatureUpdate() {
  // Auto-feature logic can be implemented here
  if (autoFeature.value) {
    // Automatically feature projects based on some criteria
    generateShowcase();
  }
}

// Enhanced filter management
// Duplicate saveFilterPreset and unused _loadFilterPreset removed; original implementation earlier manages presets.
function toggleProjectTag(p: any, tag: string) {
  updateProject(p, (c: any) => {
    const arr = Array.isArray(c.tags) ? [...c.tags] : [];
    const i = arr.findIndex((t: string) => String(t) === String(tag));
    if (i >= 0) {
      arr.splice(i, 1);
    } else {
      arr.push(tag);
    }
    c.tags = arr;
  });
}

// Safe counts to avoid undefined length access during early renders
const projectsCount = computed(() =>
  Array.isArray(projects.value) ? projects.value.length : 0,
);
const clipsCount = computed(() =>
  Array.isArray(clips.value) ? clips.value.length : 0,
);
const achievementsCount = computed(() =>
  Array.isArray(achievements.value) ? achievements.value.length : 0,
);

// Available skills computed from projects
const availableSkills = computed(() => {
  const skillsMap = new Map();

  // Extract skills from all projects
  projects.value.forEach((project) => {
    const projectSkills = project.skills || project.tech || project.tags || [];
    projectSkills.forEach((skill) => {
      const skillName = typeof skill === "string" ? skill : skill.name;
      const skillId = skillName.toLowerCase().replace(/[^a-z0-9]/g, "-");

      if (skillsMap.has(skillId)) {
        skillsMap.get(skillId).projectCount++;
      } else {
        skillsMap.set(skillId, {
          id: skillId,
          name: skillName,
          category: categorizeSkill(skillName),
          icon: getSkillIcon(skillName),
          projectCount: 1,
          proficiency: Math.floor(Math.random() * 40) + 60, // Mock proficiency
        });
      }
    });
  });

  return Array.from(skillsMap.values()).sort(
    (a, b) => b.projectCount - a.projectCount,
  );
});

// Enhanced Portfolio Topbar Handlers
function handleSearchUpdate(searchTerm) {
  query.value = searchTerm;
}

function handleFiltersUpdate(filters) {
  if (filters.type !== undefined) {
    selectedType.value = filters.type;
  }
  if (filters.featured !== undefined) {
    featuredOnly.value = filters.featured;
  }
  if (filters.skills !== undefined) {
    // Handle skill filtering if needed
    console.log("Skills filter update:", filters.skills);
  }
}

function handleSortUpdate(sortOption) {
  sortBy.value = sortOption;
}

function handleViewModeUpdate(mode) {
  viewMode.value = mode;
}

function handleToggleAnalytics(enabled) {
  console.log("Analytics toggled:", enabled);
  // Add analytics toggle logic here
}

function handleOpenAITools() {
  console.log("Opening AI Tools");
  // Add AI tools modal opening logic here
}


function categorizeSkill(skillName) {
  const skill = skillName.toLowerCase();
  if (
    skill.includes("game") ||
    skill.includes("unity") ||
    skill.includes("unreal")
  )
    return "gaming";
  if (
    skill.includes("design") ||
    skill.includes("art") ||
    skill.includes("creative")
  )
    return "creative";
  if (
    skill.includes("lead") ||
    skill.includes("manage") ||
    skill.includes("team")
  )
    return "soft";
  return "technical";
}

function getSkillIcon(skillName) {
  const skill = skillName.toLowerCase();
  if (skill.includes("game")) return "mdi-gamepad-variant";
  if (skill.includes("code") || skill.includes("program"))
    return "mdi-code-tags";
  if (skill.includes("design")) return "mdi-palette";
  if (skill.includes("team") || skill.includes("lead"))
    return "mdi-account-group";
  if (skill.includes("analysis")) return "mdi-chart-line";
  return "mdi-tag";
}

// Enhanced keyboard navigation
function handleKeyboardNavigation(event: KeyboardEvent) {
  if (event.key === "Escape" && filtersOpen.value) {
    filtersOpen.value = false;
    event.preventDefault();
  }
}

// Focus management for accessibility
function _focusMainContent() {
  const mainContent = document.querySelector(".content-area");
  if (mainContent) {
    (mainContent as HTMLElement).focus();
  }
}

// Auto-close filters on desktop when clicking outside
function handleOutsideClick(event: Event) {
  if (!filtersOpen.value) return;
  const target = event.target as HTMLElement;
  const sidebar = document.getElementById("portfolio-filters");
  const toggleButton = document.querySelector(
    '[aria-controls="portfolio-filters"]',
  );

  if (sidebar && !sidebar.contains(target) && !toggleButton?.contains(target)) {
    filtersOpen.value = false;
  }
}

// Watch for escape key and outside clicks
watch(filtersOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener("keydown", handleKeyboardNavigation);
    document.addEventListener("click", handleOutsideClick);
    // Prevent body scroll on mobile when filters are open
    if (window.innerWidth < 880) {
      document.body.style.overflow = "hidden";
    }
  } else {
    document.removeEventListener("keydown", handleKeyboardNavigation);
    document.removeEventListener("click", handleOutsideClick);
    document.body.style.overflow = "";
  }
});

// Mobile responsive setup
onMounted(() => {
  checkMobileScreen();
  loadSavedPresets();
  window.addEventListener("resize", handleResize);
  document.addEventListener("keydown", handleKeyboardNavigation);
  document.addEventListener("click", handleOutsideClick);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("keydown", handleKeyboardNavigation);
  document.removeEventListener("click", handleOutsideClick);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.portfolio-studio {
  background: var(--surface-base);
}

.enhanced-navigation-section {
}

.navigation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.breadcrumb-section {
}

.page-meta {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.page-status {
  display: flex;
  align-items: center;
}

.status-icon.success {
}

.last-updated {
  display: flex;
  align-items: center;
}

.quick-nav-actions {
  display: flex;
  align-items: center;
}

.enhanced-tabs-section {
}

.tab-summary {
  text-align: center;
}

.summary-item {
  display: inline-flex;
  align-items: center;
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.enhanced-filter-sidebar {
  background: var(--glass-surface);
  overflow-y: auto;
  position: sticky;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-main-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.filter-summary {
  display: flex;
  align-items: center;
}

.active-count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.search-section {
}

.search-count {
  font-weight: var(--font-weight-medium);
}

.enhanced-search-wrapper {
  position: relative;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  color: var(--text-secondary);
  pointer-events: none;
}

.enhanced-search-input {
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal);
}

.enhanced-search-input:focus {
  outline: none;
}

.search-clear-btn {
  position: absolute;
}

.search-suggestions {
  position: absolute;
  background: var(--surface-elevated);
  border-top: none;
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

.suggestions-header {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.suggestions-list {
}

.suggestion-item {
  display: flex;
  align-items: center;
  border: none;
  background: none;
  color: var(--text-primary);
  text-align: left;
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast);
}

.suggestion-item:hover {
  background: var(--surface-hover);
}

.search-results-summary {
}

.search-no-results,
.search-success {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.search-no-results {
}

.search-success {
}

.enhanced-content-toolbar {
  background: var(--glass-surface);
  border-radius: var(--radius-xl);
}

.toolbar-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section,
.right-section {
  display: flex;
  align-items: center;
}

.mobile-filter-btn {
  position: relative;
}

.filter-badge {
  position: absolute;
  color: var(--color-primary-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.enhanced-result-summary {
  display: flex;
  flex-direction: column;
}

.result-count {
  display: flex;
  align-items: center;
  font-size: var(--font-size-base);
}

.result-count strong {
  font-weight: var(--font-weight-bold);
}

.of-total,
.item-type {
  color: var(--text-secondary);
}

.active-filters-summary {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.clear-filters-btn {
  margin-left: auto;
}

.sort-controls-enhanced {
  display: flex;
  align-items: center;
}

.sort-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.sort-group {
  display: flex;
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.enhanced-sort-select {
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.view-controls-enhanced {
  display: flex;
  align-items: center;
}

.view-toggle-wrapper {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.toolbar-secondary {
}

.advanced-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.feature-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.feature-toggle input[type="checkbox"] {
  display: none;
}

.checkmark {
  border-radius: var(--radius-sm);
  position: relative;
  transition: all var(--duration-fast);
}

.feature-toggle input[type="checkbox"]:checked + .checkmark {
}

.feature-toggle input[type="checkbox"]:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  color: var(--color-primary-contrast);
  font-weight: bold;
}

.toggle-text {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

  .navigation-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-main {
    flex-direction: column;
    align-items: stretch;
  }

  .left-section,
  .right-section {
    justify-content: space-between;
  }

  .sort-group {
    display: none;
  }

  .toolbar-secondary {
  }

  .advanced-options {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<style scoped>
.navigation-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-nav-toggle {
  display: none;
  min-width: var(--btn-min-h);
  height: var(--btn-min-h);
}

.header-actions-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.primary-actions,
.secondary-actions {
  display: flex;
  align-items: center;
}

.primary-actions {
}

.secondary-actions {
}

  .navigation-section {
  }

  .mobile-nav-toggle {
    display: flex;
    position: fixed;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop-blur);
    box-shadow: var(--shadow-lg);
    transition: all var(--duration-fast) var(--easing-ease);
  }

  .mobile-nav-toggle:hover {
    background: var(--glass-bg-hover);
  }

  .header-actions-group {
  }

  .primary-actions,
  .secondary-actions {
  }

  .secondary-actions {
    border-left: none;
  }
}

  .navigation-section {
  }

  .mobile-nav-toggle {
  }

  .header-actions-group {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-actions,
  .secondary-actions {
    justify-content: center;
  }
}

@media (max-width: var(--breakpoint-xl)) {
  .portfolio-layout {
  }

  .filter-sidebar {
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .portfolio-layout {
  }

  .filter-sidebar {
  }

  .content-toolbar {
  }
}

  .chip.filter-chip,
  .smart-filter-btn,
  .preset-load-btn {
    min-height: var(--btn-min-h);
  }

  .mobile-nav-toggle {
  }

  .sidebar-section {
  }

  .smart-filters {
  }

  .saved-presets {
  }

  .search-input {
  }

  .search-clear-btn {
  }
}

  .filter-sidebar {
  }

  .sidebar-section {
  }

  .sidebar-title {
    font-size: var(--font-size-sm);
  }

  .chips {
  }

  .chip.filter-chip {
    font-size: var(--font-size-xs);
  }
}

@media (prefers-reduced-motion: reduce) {
  .smart-filter-btn,
  .preset-item,
  .mobile-nav-toggle {
    transition: none;
  }

  .smart-filter-btn:hover,
  .mobile-nav-toggle:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .smart-filter-btn,
  .preset-item {
  }

  .smart-filter-btn:hover,
  .preset-item:hover {
  }

  .mobile-nav-toggle {
  }
}

[data-theme="dark"] .smart-filter-btn,
[data-theme="dark"] .preset-item {
}

[data-theme="dark"] .smart-filter-btn:hover,
[data-theme="dark"] .preset-item:hover {
}

[data-theme="dark"] .mobile-nav-toggle {
}

.theme-gaming .smart-filter-btn:hover {
  background: linear-gradient(
  );
}

.theme-gaming .preset-item:hover {
  background: linear-gradient(
  );
}

.theme-gaming .mobile-nav-toggle:hover {
  background: linear-gradient(
  );
}

.portfolio-studio {
  background: var(--surface-base);
  color: var(--text-primary);
}

.portfolio-layout {
  display: grid;
  max-width: var(--page-container-max-width);
  margin-left: auto;
  margin-right: auto;
}

.filter-sidebar {
  position: sticky;
  align-self: start;
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-lg);
  height: fit-content;
  overflow-y: auto;
}

.smart-filters {
  display: flex;
  flex-direction: column;
}

.smart-filter-btn {
  justify-content: space-between;
  background: var(--glass-bg-light);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.smart-filter-btn:hover {
  background: var(--glass-bg-hover);
  box-shadow: var(--shadow-md);
}

.smart-filter-btn .filter-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.saved-presets {
  display: flex;
  flex-direction: column;
}

.preset-item {
  display: flex;
  align-items: center;
  background: var(--glass-bg-light);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.preset-item:hover {
  background: var(--glass-bg-hover);
}

.preset-load-btn {
  justify-content: flex-start;
}

.preset-delete-btn {
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.preset-delete-btn:hover {
  color: var(--color-error);
}

.preset-item:hover .preset-delete-btn {
}

.sidebar-section {
}

.sidebar-section:last-child {
  border-bottom: none;
}

.sidebar-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.filter-count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  margin-left: auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  border-radius: var(--radius-md);
  background: var(--glass-bg-light);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.search-input:focus {
  outline: none;
}

.search-clear-btn {
  position: absolute;
}

.search-no-results {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.search-section {
  display: flex;
  flex-direction: column;
}

.quick-filter-tabs {
  display: flex;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
}

.filter-tab {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  position: relative;
  overflow: hidden;
}

.filter-tab::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.filter-tab:hover::before,
.filter-tab.active::before {
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab.active {
  color: var(--color-primary-contrast);
}

.filter-tab.active::before {
}

.tab-count {
  background: var(--color-primary-contrast);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.filter-tab.active .tab-count {
  color: var(--color-primary-contrast);
}

.skills-tags-section {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
}

.skill-categories {
  display: flex;
  flex-direction: column;
}

.skill-category {
  background: var(--glass-bg-light);
  border-radius: var(--radius-lg);
}

.category-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.category-count {
  color: var(--color-primary-contrast);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  text-align: center;
  margin-left: auto;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
}

.skill-chip {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  position: relative;
}

.skill-chip::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  border-radius: var(--radius-full);
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.skill-chip:hover::before {
}

.skill-chip:hover {
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
}

.skill-chip.active {
  color: var(--color-primary-contrast);
}

.skill-chip.active::before {
}

.skill-level {
  background: var(--color-primary-contrast);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.skill-chip.active .skill-level {
  color: var(--color-primary-contrast);
}

.all-tags-section {
}

.tags-search-wrapper {
}

.tag-search {
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  background: var(--glass-bg-light);
}

.tag-search:focus {
  outline: none;
}

.chips {
  display: flex;
  flex-wrap: wrap;
}

.chips-scrollable {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--glass-border) transparent;
}

.chips-scrollable::-webkit-scrollbar {
}

.chips-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.chips-scrollable::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: var(--radius-full);
}

.filter-chip {
  border-radius: var(--radius-full);
  background: var(--glass-bg-light);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease-out);
  user-select: none;
}

.filter-chip:hover {
  background: var(--glass-bg);
}

.filter-chip.active {
  color: var(--text-on-primary);
  box-shadow: var(--shadow-sm);
}

.filter-chip.active:hover {
}

.no-tags-found {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
}

.filter-actions {
  display: flex;
  flex-direction: column;
}
.content-area {
  display: flex;
  flex-direction: column;
}
.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
}

.result-summary {
  display: flex;
  flex-direction: column;
}

.result-count {
  font-size: var(--font-size-sm);
}

.active-filters-indicator {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
}
.sort-view-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.sort-controls {
  display: flex;
  align-items: center;
}

.sort-group {
  display: flex;
  background: var(--glass-bg-light);
  border-radius: var(--radius-full);
}

.sort-group :deep(.btn-unified) {
  border-radius: var(--radius-full);
  border: none;
}

.sort-group :deep(.btn-unified.active) {
  color: var(--text-on-primary);
  box-shadow: var(--shadow-md);
}

.advanced-controls {
  display: flex;
  align-items: center;
}

.auto-feature-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.auto-feature-toggle:hover {
  background: var(--glass-bg-light);
}

.toggle-label {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  user-select: none;
}

.view-toggle {
  display: flex;
}

.view-toggle :deep(.view-toggle-group) {
  background: var(--glass-bg-light);
  border-radius: var(--radius-full);
}

.year-slider {
  display: flex;
  flex-direction: column;
}
.year-slider .slider-values {
  display: flex;
  align-items: center;
}
.slider-wrapper {
  position: relative;
}
.slider-wrapper input[type="range"] {
  position: absolute;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  background: none;
}
.slider-wrapper input[type="range"]::-webkit-slider-thumb {
  pointer-events: auto;
  -webkit-appearance: none;
}
.slider-wrapper input[type="range"]::-webkit-slider-runnable-track {
  background: var(--glass-border);
}

.quick-filter-bar {
  background: var(--glass-bg-light);
  border-radius: var(--radius-lg);
}

.chips-scroll {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.chips-scroll::-webkit-scrollbar {
  display: none;
}

.chips-scroll .chip {
  white-space: nowrap;
  font-size: var(--font-size-xs);
}

.panel {
}

.projects-grid,
.showcase-grid,
.clips-grid,
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
  );
}

  .projects-grid,
  .showcase-grid {
  }
}

  .projects-grid,
  .showcase-grid {
  }
}

  .projects-grid,
  .showcase-grid {
  }
}

  .projects-grid,
  .showcase-grid,
  .clips-grid,
  .achievements-grid {
  }
}

.projects-grid.grid {
  grid-template-columns: repeat(
    auto-fill,
  );
}

.projects-grid.list {
}

.projects-grid.masonry {
}

  .projects-grid.masonry {
  }
}

  .projects-grid.masonry {
  }
}

.showcase-grid {
}

.showcase-card {
  transition: all var(--duration-normal) var(--easing-ease-out);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}

.showcase-card:hover {
  box-shadow: var(--shadow-xl);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: var(--page-narrow-width);
}

.empty-icon {
  color: var(--text-secondary);
}

  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.empty-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.card .thumb {
  position: relative;
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-fallback {
  color: var(--text-secondary);
}
.badges {
  position: absolute;
  display: flex;
}
.card .body {
}
.title {
  display: flex;
  align-items: center;
}
.meta {
  color: var(--text-secondary);
}
.tags {
  display: flex;
  flex-wrap: wrap;
}
.tag {
  background: var(--glass-bg);
}
.actions {
  display: flex;
}

.projects-grid {
}

.projects-grid.grid {
  grid-template-columns: repeat(
    auto-fill,
  );
}

.projects-grid.list {
}

.project-card {
  transition: all var(--duration-normal) var(--easing-ease-out);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.project-card:hover {
  box-shadow: var(--shadow-lg);
}

.projects-grid.grid .project-card .row {
  display: flex;
  flex-direction: column;
}

.projects-grid.list .project-card .row {
  display: grid;
  align-items: start;
}
.cover {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  background-size: cover;
  background-position: center;
}
.projects-grid.list .cover {
}
.info .sub {
  color: var(--text-secondary);
}
.info .desc {
  color: var(--text-primary);
}

.clips-grid {
}
.clip .embed {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--glass-bg);
}
.clip iframe {
  position: absolute;
}
.clip .caption {
}

.achievements-grid {
}
.ach-card {
}
.ach-card .title {
  display: flex;
  align-items: center;
}
.ach-card .meta {
  color: var(--text-secondary);
}

.stat-grid {
}
.stat {
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  text-align: center;
}
.val {
}
.lbl {
  color: var(--text-secondary);
}

@media (max-width: var(--breakpoint-lg)) {
  .portfolio-layout {
  }

  .filter-sidebar {
    position: fixed;
    transition: transform var(--duration-normal) var(--easing-ease-out);
    border-left: none;
  }

  .portfolio-layout.filters-open .filter-sidebar {
  }

  .portfolio-layout::after {
    content: "";
    position: fixed;
    pointer-events: none;
    transition: opacity var(--duration-normal) var(--easing-ease-out);
  }

  .portfolio-layout.filters-open::after {
    pointer-events: auto;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .showcase-grid {
  }

  .projects-grid.grid {
  }

  .projects-grid.list .project-card .row {
  }

  .content-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-view-group {
    justify-content: center;
  }

  .advanced-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
}

  .portfolio-layout {
  }

  .filter-sidebar {
  }

  .content-toolbar {
  }

  .sort-group {
    flex-direction: column;
  }
}

[data-theme="dark"] .chip {
  background: var(--surface-glass);
}

[data-theme="dark"] .tag {
  background: var(--surface-glass);
}

[data-theme="dark"] .filter-sidebar {
}

[data-theme="dark"] .content-toolbar {
}

[data-theme="dark"] .empty-state {
  color: var(--text-primary);
}

[data-theme="dark"] .result-summary {
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  .showcase-card,
  .project-card,
  .filter-sidebar,
  .portfolio-layout::after {
    transition: none;
  }

  .showcase-card:hover,
  .project-card:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .filter-sidebar,
  .content-toolbar {
  }

  .chip.active,
  .sort-group :deep(.btn-unified.active) {
  }
}

.filter-sidebar:focus-within {
}

.content-area:focus {
  outline: none;
}

.header-actions-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.primary-actions {
  display: flex;
}

.secondary-actions {
  display: flex;
  align-items: center;
}

  .header-actions-group {
    flex-direction: column;
  }

  .primary-actions {
    justify-content: center;
  }

  .secondary-actions {
    justify-content: center;
  }
}

.portfolio-layout {
  contain: layout style;
}

.projects-grid,
.showcase-grid {
  contain: layout;
}

.project-card,
.showcase-card {
  contain: layout style;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .showcase-card {
    will-change: auto;
  }
}

.virtual-scroll-container {
  overflow-y: auto;
  scrollbar-width: thin;
}

.portfolio-layout.loading {
  pointer-events: none;
}

.portfolio-layout.loading::before {
  content: "";
  position: fixed;
}

@keyframes spin {
  }
  }
}

.skeleton-loader {
  background: linear-gradient(
  );
}

@keyframes skeleton-shimmer {
  }
  }
}

.lazy-image {
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.lazy-image.loaded {
}

.filter-sidebar:focus-within {
}

.portfolio-layout:focus-within .content-area {
  outline: none;
}

.section-header {
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--radius-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.section-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.showcase-actions {
  display: flex;
  align-items: center;
}

.enhanced-empty {
  background: linear-gradient(
  );
  border-radius: var(--radius-xl);
}

.empty-icon-stack {
  position: relative;
  display: inline-block;
}

.empty-icon.primary {
}

.empty-icon-overlay {
  position: absolute;
  background: var(--surface-elevated);
}

.empty-actions-enhanced {
  display: flex;
  flex-direction: column;
  align-items: center;
}

  .empty-actions-enhanced {
    flex-direction: row;
    justify-content: center;
  }
}

.showcase-rank {
  position: absolute;
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-gold {
}

.rank-silver {
}

.rank-bronze {
}

.thumb-container {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.thumb {
  background: var(--glass-bg);
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform var(--duration-normal) var(--easing-ease-out);
}

.showcase-card:hover .thumb {
}

.thumb-fallback.enhanced {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.overlay-gradient {
  position: absolute;
  background: linear-gradient(
  );
  pointer-events: none;
}

.badges-overlay {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
}

.featured-badge {
  color: var(--text-on-primary);
  border: none;
}

.tech-badge {
  color: var(--text-on-primary);
  border: none;
}

.platform-badge {
  color: var(--text-on-primary);
  border: none;
}

.quick-actions {
  position: absolute;
}

.play-btn {
}

.card-content {
}

.content-header {
}

.project-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.project-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.role-tag,
.year-tag {
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
  background: var(--glass-bg-light);
  color: var(--text-secondary);
}

.project-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.tags-section {
}

.tags-scroll {
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.tags-scroll::-webkit-scrollbar {
  display: none;
}

.modern-tag {
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  color: var(--text-primary);
  white-space: nowrap;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.modern-tag:hover {
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.primary-actions {
  display: flex;
}

.secondary-actions {
  display: flex;
}

.portfolio-layout ::-webkit-scrollbar {
}

.portfolio-layout ::-webkit-scrollbar-track {
  background: var(--glass-bg-light);
  border-radius: var(--radius-full);
}

.portfolio-layout ::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: var(--radius-full);
}

.portfolio-layout ::-webkit-scrollbar-thumb:hover {
}
</style>
