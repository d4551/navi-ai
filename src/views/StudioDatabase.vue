<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <template #header-actions>
      <HeaderActions
        layout="horizontal"
        alignment="end"
        gap="md"
        priority="primary"
      >
        <!-- AI Intelligence -->
        <UnifiedButton
          variant="gaming"
          icon-only
          icon="mdi-robot"
          tooltip="AI Studio Intelligence"
          :loading="aiAnalyzing"
          @click="runAIAnalysis"
        />

        <!-- Watchlist -->
        <UnifiedButton
          variant="glass"
          leading-icon="mdi-heart"
          @click="viewFavorites"
        >
          Watchlist ({{ favoriteStudios.length }})
        </UnifiedButton>

        <!-- Data Management Actions -->
        <div class="action-group">
          <UnifiedButton
            variant="outline"
            leading-icon="mdi-database-arrow-up"
            :loading="importing"
            @click="runFullImport"
          >
            Import
          </UnifiedButton>

          <UnifiedButton
            variant="outline"
            leading-icon="mdi-sync"
            :loading="syncingSteam"
            @click="runIncrementalSteamSync"
          >
            Sync Steam
          </UnifiedButton>

          <UnifiedButton
            variant="cyber"
            leading-icon="mdi-database-search"
            :loading="openDataLoading"
            @click="runOpenDataScan"
          >
            Scan Data
          </UnifiedButton>
        </div>

        <!-- Export Actions -->
        <div ref="exportDropdownRef" class="dropdown-container">
          <UnifiedButton
            variant="outline"
            leading-icon="mdi-export"
            trailing-icon="mdi-chevron-down"
            @click="toggleExportDropdown"
          >
            Export
          </UnifiedButton>
          <div v-if="showExportDropdown" class="export-dropdown glass-surface">
            <button class="export-option" @click="exportData">
              <AppIcon name="mdi-file-code" />
              <span>Export JSON</span>
            </button>
            <button class="export-option" @click="exportDedupedCSV">
              <AppIcon name="mdi-file-delimited" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </HeaderActions>
    </template>
    <!-- Enhanced Studio Intelligence Dashboard -->
    <section class="studio-intelligence-dashboard">
      <div class="dashboard-card">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <div class="header-title">
            <div class="header-icon">
              <AppIcon name="mdi-database" />
            </div>
            <div class="header-text">
              <h1>Studio Intelligence Overview</h1>
              <div class="header-subtitle">
                Real-time monitoring and analytics
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button
              class="action-btn"
              title="Refresh data"
              @click="refreshMetrics"
            >
              <AppIcon name="mdi-refresh" />
            </button>
            <button
              class="action-btn"
              title="Settings"
              @click="configureMetrics"
            >
              <AppIcon name="mdi-cog" />
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div
            v-for="metric in enhancedMetrics"
            :key="metric.key"
            :data-metric="metric.key"
            class="metric-card"
            :class="[metric.statusClass, { interactive: metric.clickable }]"
            @click="metric.clickable ? handleMetricClick(metric.key) : null"
          >
            <div v-if="metric.key === 'tracked'" class="live-indicator"></div>

            <div class="metric-header">
              <div class="metric-icon-wrapper">
                <AppIcon :name="metric.icon" />
              </div>
              <div v-if="metric.toggle" class="metric-toggle">
                <input
                  :id="`toggle-${metric.key}`"
                  v-model="metric.enabled"
                  type="checkbox"
                  class="toggle-input"
                  @change="handleToggleChange(metric.key, $event)"
                />
                <label
                  :for="`toggle-${metric.key}`"
                  class="toggle-label"
                ></label>
              </div>
            </div>

            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-change" :class="metric.changeClass">
              <AppIcon :name="metric.changeIcon" />
              <span>{{ metric.changeText }}</span>
            </div>

            <div class="chart-preview"></div>
            <div class="loading-bar"></div>
          </div>
        </div>
      </div>
    </section>



    <!-- Enhanced Search & Filter System -->
    <section
      v-if="activeTab === 'database'"
      class="search-command-center glass-surface unified-container enhanced-glass-panel"
    >
      <div class="command-grid">
        <!-- Primary Search -->
        <div class="search-primary">
          <div class="search-input-container">
            <AppIcon name="mdi-magnify" class="search-input-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input glass-input enhanced-input"
              placeholder="Search studios by name, location, technology, or game titles..."
              @input="
                (e: Event) =>
                  debouncedSearch((e.target as HTMLInputElement).value)
              "
            />
          </div>
          <div class="quick-actions">
            <UnifiedButton
              variant="gaming"
              :loading="aiSearching"
              leading-icon="mdi-robot"
              @click="aiSearchSuggestion"
            >
              AI Suggest
            </UnifiedButton>
            <UnifiedButton
              variant="cyber"
              leading-icon="mdi-filter-remove"
              @click="clearAllFilters"
            >
              Clear All
            </UnifiedButton>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="filter-matrix">
          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">Studio Type</label>
              <select
                v-model="filters.type"
                class="filter-select glass-input"
                @change="applyFilters"
              >
                <option value="">All Types</option>
                <option value="AAA">AAA Studios</option>
                <option value="Indie">Independent</option>
                <option value="Mobile">Mobile-First</option>
                <option value="Publisher">Publishers</option>
                <option value="Platform">Platform Holders</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Location</label>
              <div class="input-wrapper">
                <AppIcon name="mdi-map-marker" class="input-icon" />
                <input
                  v-model="filters.location"
                  type="text"
                  class="filter-input glass-input"
                  placeholder="City, State, Country..."
                  @input="
                    (e: Event) =>
                      debouncedFilter((e.target as HTMLInputElement).value)
                  "
                />
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Studio Size</label>
              <select
                v-model="filters.size"
                class="filter-select glass-input"
                @change="applyFilters"
              >
                <option value="">All Sizes</option>
                <option value="Startup">Startup (1-50)</option>
                <option value="Mid-size">Mid-size (51-500)</option>
                <option value="Large">Large (500+)</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Technologies</label>
              <div class="tech-chips">
                <button
                  v-for="tech in popularTechnologies"
                  :key="tech"
                  class="tech-chip"
                  :class="{ active: selectedTechnologies.includes(tech) }"
                  @click="toggleTechnology(tech)"
                >
                  {{ tech }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Min Confidence</label>
              <select
                v-model.number="confidenceThreshold"
                class="filter-select glass-input"
                @change="applyFilters"
              >
                <option :value="0">Any</option>
                <option :value="30">30+</option>
                <option :value="50">50+</option>
                <option :value="70">70+</option>
                <option :value="85">85+</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Sources</label>
              <div class="tech-chips">
                <button
                  v-for="src in availableSources"
                  :key="src"
                  class="tech-chip"
                  :class="{ active: selectedSources.includes(src) }"
                  @click="toggleSource(src)"
                >
                  {{ src }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-toggles">
            <label class="toggle-filter">
              <input
                v-model="filters.remoteWork"
                type="checkbox"
                @change="applyFilters"
              />
              <span class="toggle-indicator"></span>
              Remote-Friendly
            </label>
            <label class="toggle-filter">
              <input
                v-model="filters.publiclyTraded"
                type="checkbox"
                @change="applyFilters"
              />
              <span class="toggle-indicator"></span>
              Publicly Traded
            </label>
            <label class="toggle-filter">
              <input
                v-model="showOnlyFavorites"
                type="checkbox"
                @change="applyFilters"
              />
              <span class="toggle-indicator"></span>
              Watchlist Only
            </label>
          </div>
        </div>

        <!-- Quick Filters & Sort -->
        <div class="quick-controls">
          <div class="quick-filters">
            <button
              v-for="preset in quickFilters"
              :key="preset.key"
              class="quick-filter-btn"
              :class="{ active: activeQuickFilter === preset.key }"
              @click="applyQuickFilter(preset)"
            >
              <AppIcon :name="preset.icon" />
              {{ preset.label }}
            </button>
          </div>

          <div class="sort-controls">
            <label class="sort-label">Sort by:</label>
            <select
              v-model="sortBy"
              class="sort-select glass-input"
              @change="applySorting"
            >
              <option value="name">Name</option>
              <option value="size">Company Size</option>
              <option value="founded">Founded Year</option>
              <option value="location">Location</option>
              <option value="confidence">Confidence</option>
              <option value="sources">Source Count</option>
              <option
                value="aiScore"
                :disabled="!aiScores || Object.keys(aiScores).length === 0"
              >
                AI Match Score
              </option>
            </select>
            <button class="sort-direction" @click="toggleSortDirection">
              <AppIcon
                :name="
                  sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'
                "
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Header -->
    <section v-if="activeTab === 'database'" class="unified-container">
      <div class="section-card">
        <div class="section-header">
          <div class="results-count">
            <strong>{{ filteredStudios.length }}</strong> studios found
            <span v-if="filteredStudios.length !== totalStudios">of {{ totalStudios }} total</span>
          </div>

          <!-- SR-only live announcer for results updates -->
          <div class="sr-only" role="status" aria-live="polite">
            {{ filteredStudios.length }} studios visible of
            {{ totalStudios }} total
          </div>

          <div class="results-actions header-actions-group">
            <ViewToggle
              v-model="viewMode"
              :options="[
                { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
                { value: 'list', icon: 'mdi-view-list', label: 'List view' },
                { value: 'table', icon: 'mdi-table', label: 'Table view' },
              ]"
            />

            <UnifiedButton
              v-if="selectedStudios.length > 0"
              color="gaming"
              @click="compareStudios"
            >
              Compare Selected ({{ selectedStudios.length }})
            </UnifiedButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Studio Results -->
    <section
      v-if="activeTab === 'database'"
      class="studio-results unified-container"
    >
      <div
        v-if="!paginatedStudios.length && filteredStudios.length === 0"
        class="empty-state section-card"
      >
        <div class="section-header">
          <div>No studios match your filters</div>
        </div>
        <div class="section-body d-flex align-center gap-2">
          <UnifiedButton
            color="glass"
            appearance="outlined"
            leading-icon="mdi-filter-remove"
            @click="clearAllFilters"
          >
            Clear Filters
          </UnifiedButton>
          <UnifiedButton
            color="gaming"
            :loading="aiSearching"
            leading-icon="mdi-robot"
            @click="aiSearchSuggestion"
          >
            AI Suggest
          </UnifiedButton>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="studios-grid">
        <StudioCard
          v-for="studio in paginatedStudios"
          :key="studio.id"
          :studio="studio"
          :is-favorite="favoriteStudios.includes(studio.id)"
          :ai-score="aiScores?.[studio.id]"
          :is-selected="selectedStudios.includes(studio.id)"
          @toggle-favorite="toggleFavorite"
          @toggle-selection="toggleSelection"
          @view-details="viewStudioDetails"
          @view-jobs="viewStudioJobs"
          @quick-apply="quickApplyToStudio"
        />
      </div>

      <!-- List View -->
      <div v-else-if="viewMode === 'list'" class="studios-list">
        <StudioListItem
          v-for="studio in paginatedStudios"
          :key="studio.id"
          :studio="studio"
          :is-favorite="favoriteStudios.includes(studio.id)"
          :ai-score="aiScores?.[studio.id]"
          :is-selected="selectedStudios.includes(studio.id)"
          @toggle-favorite="toggleFavorite"
          @toggle-selection="toggleSelection"
          @view-details="viewStudioDetails"
          @view-jobs="viewStudioJobs"
        />
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table'" class="studios-table-container">
        <StudioTable
          :studios="paginatedStudios"
          :favorite-studios="favoriteStudios"
          :ai-scores="aiScores"
          :selected-studios="selectedStudios"
          @toggle-favorite="toggleFavorite"
          @toggle-selection="toggleSelection"
          @view-details="viewStudioDetails"
          @sort="handleTableSort"
        />
      </div>
    </section>

    <!-- Pagination -->
    <section
      v-if="activeTab === 'database' && totalPages > 1"
      class="pagination-section"
    >
      <div class="pagination-controls">
        <UnifiedButton
          :disabled="currentPage === 1"
          color="glass"
          appearance="outlined"
          leading-icon="mdi-chevron-left"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </UnifiedButton>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <UnifiedButton
          :disabled="currentPage === totalPages"
          color="glass"
          appearance="outlined"
          trailing-icon="mdi-chevron-right"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </UnifiedButton>
      </div>
    </section>

    <!-- Studio Detail Modal -->
    <StudioDetailModal
      v-if="activeTab === 'database' && selectedStudioDetail"
      :studio="selectedStudioDetail"
      :is-favorite="favoriteStudios.includes(selectedStudioDetail.id)"
      @close="selectedStudioDetail = null"
      @toggle-favorite="toggleFavorite"
      @view-jobs="viewStudioJobs"
      @start-interview="startStudioInterview"
    />

    <!-- Studio Comparison Modal -->
    <StudioComparisonModal
      v-if="activeTab === 'database' && showComparison"
      :studios="studiosToCompare"
      @close="showComparison = false"
    />

    <!-- Import / Sync Progress Modal -->
    <div v-if="showProgressModal" class="progress-modal-overlay">
      <div class="progress-modal glass-surface">
        <header class="progress-header">
          <h3>{{ progressTitle }}</h3>
          <button
            class="close-btn"
            :disabled="importing || syncingSteam"
            @click="closeProgressModal"
          >
            ✕
          </button>
        </header>
        <div class="progress-body">
          <div
            v-for="stage in orderedStages"
            :key="stage.key"
            class="stage"
            :class="['stage', stage.status]"
          >
            <div class="stage-main">
              <strong>{{ stage.label }}</strong>
              <span class="status" :data-status="stage.status">
                <template v-if="stage.status === 'pending'">Pending</template>
                <template v-else-if="stage.status === 'running'">Running…</template>
                <template v-else-if="stage.status === 'done'">✔ Done ({{ formatMs(stage.durationMs) }})</template>
                <template v-else-if="stage.status === 'error'">
                  ⚠ Error
                  <UnifiedButton
                    size="xs"
                    variant="outline"
                    leading-icon="mdi-reload"
                    @click="retryStage(stage.key)"
                  >
                    Retry
                  </UnifiedButton>
                </template>
              </span>
            </div>
            <div v-if="stage.countText" class="counts">
              {{ stage.countText }}
            </div>
          </div>
        </div>
        <footer class="progress-footer">
          <div class="elapsed">Elapsed: {{ formatMs(totalElapsedMs) }}</div>
          <UnifiedButton
            variant="outline"
            :disabled="importing || syncingSteam"
            leading-icon="mdi-check"
            @click="closeProgressModal"
          >
            Close
          </UnifiedButton>
        </footer>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
// import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { studioService } from "@/modules/studios/StudioService";
import { aiService } from "@/shared/services/AIService";
import { useToast } from "@/composables/useToast";

// Components
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import StudioCard from "@/components/studio/StudioCard.vue";
import StudioListItem from "@/components/studio/StudioListItem.vue";
import StudioTable from "@/components/studio/StudioTable.vue";
import StudioDetailModal from "@/components/studio/StudioDetailModal.vue";
import StudioComparisonModal from "@/components/studio/StudioComparisonModal.vue";
import ViewToggle from "@/components/ui/ViewToggle.vue";
import StudioSubNav from "@/components/studio/StudioSubNav.vue";
// import { defineAsyncComponent } from 'vue'

// Lazy-load analytics and networking pages into tabs
// Lazy tabs (currently not mounted directly here; kept for future enhancement)
// const TabStudioAnalytics = defineAsyncComponent(() => import('@/views/StudioAnalytics.vue'))
// const TabStudioNetworking = defineAsyncComponent(() => import('@/views/StudioNetworking.vue'))

const router = useRouter();
const store = useAppStore();
// const theme = useUnifiedTheme() // not currently used
const {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
} = useToast();

// const themeName = computed(() => theme?.colorScheme?.value || 'light') // not used yet

// State
const activeTab = ref<"database" | "analytics" | "network">("database");
const searchQuery = ref("");
const allStudios = ref<any[]>([]);
const filteredStudios = ref<any[]>([]);
const selectedStudios = ref<string[]>([]);
const favoriteStudios = ref<string[]>([]);
const aiScores = ref<Record<string, number>>({});
const selectedStudioDetail = ref<any | null>(null);
const showComparison = ref(false);
const showExportDropdown = ref(false);
const exportButton = ref(null);

// View & Pagination
const viewMode = ref<"grid" | "list" | "table">("grid");
const currentPage = ref(1);
const itemsPerPage = ref(24);

// Loading states
const loading = ref(false);
const aiAnalyzing = ref(false);
const aiSearching = ref(false);
const openDataLoading = ref(false);
const importing = ref(false);
const syncingSteam = ref(false);
const showProgressModal = ref(false);
const progressStages = ref<Record<string, any>>({
  static: {
    key: "static",
    label: "Static + Steam Import",
    status: "pending",
    startedAt: 0,
    durationMs: 0,
    countText: "",
  },
  open: {
    key: "open",
    label: "Open Data Enrichment",
    status: "pending",
    startedAt: 0,
    durationMs: 0,
    countText: "",
  },
  dedupe: {
    key: "dedupe",
    label: "Deduplication & Merge",
    status: "pending",
    startedAt: 0,
    durationMs: 0,
    countText: "",
  },
  persist: {
    key: "persist",
    label: "Persistence",
    status: "pending",
    startedAt: 0,
    durationMs: 0,
    countText: "",
  },
});
const progressTitle = ref("Studio Import");
const runStartedAt = ref(0);
const confidenceThreshold = ref(0);
let backgroundSyncTimer: any = null;

const orderedStages = computed(() => [
  progressStages.value.static,
  progressStages.value.open,
  progressStages.value.dedupe,
  progressStages.value.persist,
]);

const totalElapsedMs = computed(() =>
  runStartedAt.value ? Date.now() - runStartedAt.value : 0,
);

// Filters
const filters = ref({
  type: "",
  location: "",
  size: "",
  remoteWork: false,
  publiclyTraded: false,
});

const selectedTechnologies = ref<string[]>([]);
const showOnlyFavorites = ref(false);
const activeQuickFilter = ref<string | null>(null);
const selectedSources = ref<string[]>([]);
const availableSources = [
  "steam",
  "wikidata",
  "wikipedia",
  "dbpedia",
  "static",
];

// Sorting
const sortBy = ref("name");
const sortDirection = ref<"asc" | "desc">("asc");

// Popular technologies for quick filtering
const popularTechnologies = [
  "Unity",
  "Unreal Engine",
  "C++",
  "C#",
  "Python",
  "JavaScript",
  "React",
  "AWS",
  "Docker",
  "Kubernetes",
  "iOS",
  "Android",
];

// Quick filter presets
const quickFilters = [
  {
    key: "aaa",
    label: "AAA Studios",
    icon: "mdi-office-building",
    filters: { type: "AAA" },
  },
  {
    key: "indie",
    label: "Indie Studios",
    icon: "mdi-gamepad-variant",
    filters: { type: "Indie" },
  },
  {
    key: "remote",
    label: "Remote-Friendly",
    icon: "mdi-web",
    filters: { remoteWork: true },
  },
  {
    key: "mobile",
    label: "Mobile Games",
    icon: "mdi-cellphone",
    filters: { type: "Mobile" },
  },
  {
    key: "public",
    label: "Public Companies",
    icon: "mdi-chart-bar",
    filters: { publiclyTraded: true },
  },
  {
    key: "california",
    label: "California",
    icon: "mdi-weather-sunny",
    filters: { location: "California" },
  },
];

// Computed
const totalStudios = computed(() => allStudios.value.length);
const totalPages = computed(() =>
  Math.ceil(filteredStudios.value.length / itemsPerPage.value),
);
const paginatedStudios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredStudios.value.slice(start, end);
});

const studiosToCompare = computed(() =>
  allStudios.value.filter((s) => selectedStudios.value.includes(s.id)),
);

// Enhanced metrics with toggles and interaction
const metricSettings = ref({
  tracked: { enabled: true, visible: true },
  visible: { enabled: true, visible: true },
  watchlist: { enabled: true, visible: true },
  selected: { enabled: true, visible: true },
});

const enhancedMetrics = computed(() => [
  {
    key: "tracked",
    value: totalStudios.value,
    label: "Tracked Studios",
    icon: "mdi-database",
    statusClass: "status-primary",
    clickable: true,
    highlighted: false,
    changeText: "+12 this week",
    changeIcon: "mdi-trending-up",
    changeClass: "positive",
    toggle: true,
    enabled: metricSettings.value.tracked.enabled,
  },
  {
    key: "visible",
    value: filteredStudios.value.length,
    label: "Visible Results",
    icon: "mdi-eye",
    statusClass: "status-info",
    clickable: true,
    highlighted: filteredStudios.value.length !== totalStudios.value,
    changeText: `${Math.round((filteredStudios.value.length / totalStudios.value) * 100)}% of total`,
    changeIcon: "mdi-filter-variant",
    changeClass: "neutral",
    toggle: true,
    enabled: metricSettings.value.visible.enabled,
  },
  {
    key: "watchlist",
    value: favoriteStudios.value.length,
    label: "Watchlist Items",
    icon: "mdi-heart",
    statusClass: "status-success",
    clickable: true,
    highlighted: favoriteStudios.value.length > 0,
    changeText: "+3 recently added",
    changeIcon: "mdi-plus",
    changeClass: "positive",
    toggle: true,
    enabled: metricSettings.value.watchlist.enabled,
  },
  {
    key: "selected",
    value: selectedStudios.value.length,
    label: "Selected for Compare",
    icon: "mdi-checkbox-marked-circle",
    statusClass:
      selectedStudios.value.length > 0 ? "status-warning" : "status-muted",
    clickable: selectedStudios.value.length > 0,
    highlighted: selectedStudios.value.length >= 2,
    changeText:
      selectedStudios.value.length >= 2
        ? "Ready to compare"
        : "Select 2+ to compare",
    changeIcon:
      selectedStudios.value.length >= 2 ? "mdi-check" : "mdi-information",
    changeClass: selectedStudios.value.length >= 2 ? "positive" : "neutral",
    toggle: false,
    enabled: true,
  },
]);

// Enhanced metrics provide all necessary data - legacy headerStats removed

// Tab badge counts
const databaseCount = computed(() => filteredStudios.value.length);
const analyticsCount = computed(() => Object.keys(aiScores.value || {}).length);
const networkCount = computed(() => favoriteStudios.value.length);

const visiblePages = computed(() => {
  const range = 5;
  const start = Math.max(1, currentPage.value - Math.floor(range / 2));
  const end = Math.min(totalPages.value, start + range - 1);
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Methods
async function loadStudios() {
  loading.value = true;
  try {
    await studioService.initialize();
    const result = await studioService.searchStudios({
      type: filters.value.type || undefined,
      location: filters.value.location || undefined,
      size: filters.value.size || undefined,
      // pass search text through if present
      // @ts-ignore allow query passthrough for IPC mapping
      query: searchQuery.value || undefined,
    } as any);
    allStudios.value = result.studios;
    // Apply client-side refinements on top of server filtering
    filteredStudios.value = [...allStudios.value];
    applyFilters();
    await loadFavorites();
  } catch (e) {
    toastError("Failed to load studio database");
    console.error("Studio loading error:", e);
  } finally {
    loading.value = false;
  }
}

async function loadFavorites() {
  try {
    const favorites = await studioService.getFavoriteStudios();
    favoriteStudios.value = favorites.map((f) => f.id);
  } catch (e) {
    console.error("Failed to load favorites:", e);
  }
}

function applyFilters() {
  let filtered = [...allStudios.value];

  // Text search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((studio) => {
      const searchableText = [
        studio.name,
        studio.description,
        studio.headquarters,
        studio.location,
        ...(studio.games || []),
        ...(studio.technologies || []),
        ...(studio.commonRoles || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter((studio) => {
      const studioType = (studio as any).type || (studio as any).category;
      return studioType === filters.value.type;
    });
  }

  // Location filter
  if (filters.value.location) {
    const location = filters.value.location.toLowerCase();
    filtered = filtered.filter((studio) => {
      const studioLocation = (
        studio.headquarters ||
        studio.location ||
        ""
      ).toLowerCase();
      return studioLocation.includes(location);
    });
  }

  // Size filter
  if (filters.value.size) {
    filtered = filtered.filter((studio) => studio.size === filters.value.size);
  }

  // Technology filter
  if (selectedTechnologies.value.length > 0) {
    filtered = filtered.filter((studio) => {
      const studioTech = studio.technologies || [];
      return selectedTechnologies.value.some((tech) =>
        studioTech.some((stTech: string) =>
          stTech.toLowerCase().includes(tech.toLowerCase()),
        ),
      );
    });
  }

  // Remote work filter
  if (filters.value.remoteWork) {
    filtered = filtered.filter(
      (studio) => studio.culture?.remoteFirst === true,
    );
  }

  // Public company filter
  if (filters.value.publiclyTraded) {
    filtered = filtered.filter((studio) => studio.publiclyTraded === true);
  }

  // Favorites only
  if (showOnlyFavorites.value) {
    filtered = filtered.filter((studio) =>
      favoriteStudios.value.includes(studio.id),
    );
  }

  // Confidence threshold
  if (confidenceThreshold.value > 0) {
    filtered = filtered.filter(
      (studio) => (studio.confidence || 0) >= confidenceThreshold.value,
    );
  }

  // Sources filter
  if (selectedSources.value.length > 0) {
    filtered = filtered.filter((studio) => {
      const raw =
        (studio as any).sources ||
        (studio as any).sourceRefs ||
        (studio as any).source ||
        [];
      const srcArr = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(/[,;\s]+/)
          : [];
      return selectedSources.value.some((s) =>
        srcArr.map((r) => String(r).toLowerCase()).includes(s.toLowerCase()),
      );
    });
  }

  filteredStudios.value = filtered;
  applySorting();
  currentPage.value = 1;
}

function applySorting() {
  filteredStudios.value.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy.value) {
      case "name":
        aValue = a.name || "";
        bValue = b.name || "";
        break;
      case "size":
        // Convert size to numeric for sorting
        aValue = getSizeNumeric(a.size);
        bValue = getSizeNumeric(b.size);
        break;
      case "founded":
        aValue = a.founded || 0;
        bValue = b.founded || 0;
        break;
      case "location":
        aValue = a.headquarters || a.location || "";
        bValue = b.headquarters || b.location || "";
        break;
      case "aiScore":
        aValue = aiScores.value[a.id] || 0;
        bValue = aiScores.value[b.id] || 0;
        break;
      case "confidence":
        aValue = a.confidence || 0;
        bValue = b.confidence || 0;
        break;
      case "sources":
        aValue = a.sources?.length || a.sourceRefs?.length || 0;
        bValue = b.sources?.length || b.sourceRefs?.length || 0;
        break;
      default:
        aValue = a.name || "";
        bValue = b.name || "";
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue
        .toLowerCase()
        .localeCompare(bValue.toLowerCase());
      return sortDirection.value === "asc" ? comparison : -comparison;
    }

    const comparison = aValue - bValue;
    return sortDirection.value === "asc" ? comparison : -comparison;
  });
}

function getSizeNumeric(size: string): number {
  if (!size) return 0;
  const sizeStr = size.toLowerCase();
  if (sizeStr.includes("startup") || sizeStr.includes("1-50")) return 1;
  if (sizeStr.includes("mid") || sizeStr.includes("51-500")) return 2;
  if (sizeStr.includes("large") || sizeStr.includes("500+")) return 3;
  return 0;
}

// Debounced search
let searchTimeout: any = null;
function debouncedSearch(value: string) {
  searchQuery.value = value;
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // Refresh from backend with new search text
    loadStudios();
  }, 300);
}

let filterTimeout: any = null;
function debouncedFilter(value: string) {
  filters.value.location = value;
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    // Refresh from backend as location is a core filter
    loadStudios();
  }, 300);
}

// React to type/size changes by reloading from backend
watch(() => [filters.value.type, filters.value.size], () => {
  loadStudios();
});

function applyQuickFilter(preset: any) {
  if (activeQuickFilter.value === preset.key) {
    // Deactivate if already active
    activeQuickFilter.value = null;
    clearAllFilters();
    return;
  }

  activeQuickFilter.value = preset.key;
  Object.assign(filters.value, preset.filters);
  applyFilters();
}

// Enhanced metrics interaction handlers with animations
function handleMetricClick(metricKey: string) {
  // Add visual feedback animation
  const metricCard = document.querySelector(`[data-metric="${metricKey}"]`);
  if (metricCard) {
    metricCard.style.transform = "scale(0.98)";
    setTimeout(() => {
      metricCard.style.transform = "";
    }, 200);
  }

  switch (metricKey) {
    case "tracked":
      // Focus on all tracked studios
      clearAllFilters();
      break;
    case "visible":
      // Show current filter summary
      showFilterSummary();
      break;
    case "watchlist":
      // Filter to show only watchlist items
      showWatchlistOnly();
      break;
    case "selected":
      if (selectedStudios.value.length >= 2) {
        compareStudios();
      }
      break;
  }
}

function handleToggleChange(metricKey: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  metricSettings.value[metricKey].enabled = checked;

  // Animate value change
  const metricCard = event.target.closest(".metric-card");
  const valueElement = metricCard?.querySelector(".metric-value");
  if (valueElement) {
    valueElement.style.transform = "scale(0.9)";
    setTimeout(() => {
      valueElement.style.transform = "scale(1)";
    }, 200);
  }

  // Show loading animation
  const loadingBar = metricCard?.querySelector(".loading-bar");
  if (loadingBar) {
    loadingBar.style.opacity = "1";
    setTimeout(() => {
      loadingBar.style.opacity = "0";
    }, 2000);
  }

  // Save to localStorage
  try {
    localStorage.setItem(
      "studio-metric-settings",
      JSON.stringify(metricSettings.value),
    );
  } catch (e) {
    console.warn("Failed to save metric settings:", e);
  }
}

function refreshMetrics() {
  // Add refresh button animation
  const refreshBtn = document.querySelector('.action-btn [name="mdi-refresh"]');
  if (refreshBtn) {
    refreshBtn.style.animation = "spin 1s linear";
    setTimeout(() => {
      refreshBtn.style.animation = "";
    }, 1000);
  }

  // Update all metric values with animation
  document.querySelectorAll(".metric-value").forEach((value) => {
    value.style.opacity = "0.5";
    setTimeout(() => {
      value.style.opacity = "1";
    }, 500);
  });

  // Trigger refresh of studio data and metrics
  loadStudios();
}

function configureMetrics() {
  // Open metric configuration modal (placeholder)
  console.log("Configure metrics modal would open here");
}

function showFilterSummary() {
  // Show current active filters in a modal/toast
  const activeFilters = [];
  if (filters.value.type) activeFilters.push(`Type: ${filters.value.type}`);
  if (filters.value.location)
    activeFilters.push(`Location: ${filters.value.location}`);
  if (filters.value.technologies?.length)
    activeFilters.push(`Tech: ${filters.value.technologies.join(", ")}`);

  if (activeFilters.length > 0) {
    // You could show a toast or modal here
    console.log("Active filters:", activeFilters.join(", "));
  }
}

function showWatchlistOnly() {
  // Clear other filters and show only watchlist items
  clearAllFilters();
  // Set a watchlist-only filter
  viewMode.value = "grid"; // Ensure good view for favorites
}

function clearAllFilters() {
  searchQuery.value = "";
  filters.value = {
    type: "",
    location: "",
    size: "",
    remoteWork: false,
    publiclyTraded: false,
  };
  selectedTechnologies.value = [];
  showOnlyFavorites.value = false;
  activeQuickFilter.value = null;
  applyFilters();
}

function toggleTechnology(tech: string) {
  const index = selectedTechnologies.value.indexOf(tech);
  if (index > -1) {
    selectedTechnologies.value.splice(index, 1);
  } else {
    selectedTechnologies.value.push(tech);
  }
  applyFilters();
}

function toggleSource(src: string) {
  const idx = selectedSources.value.indexOf(src);
  if (idx > -1) selectedSources.value.splice(idx, 1);
  else selectedSources.value.push(src);
  applyFilters();
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  applySorting();
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function handleTableSort(column: string) {
  if (sortBy.value === column) {
    toggleSortDirection();
  } else {
    sortBy.value = column;
    sortDirection.value = "asc";
    applySorting();
  }
}

// Studio actions
async function toggleFavorite(studioId: string) {
  try {
    const isFavorite = await studioService.toggleFavorite(studioId);
    if (isFavorite) {
      if (!favoriteStudios.value.includes(studioId)) {
        favoriteStudios.value.push(studioId);
      }
    } else {
      const index = favoriteStudios.value.indexOf(studioId);
      if (index > -1) {
        favoriteStudios.value.splice(index, 1);
      }
    }

    if (showOnlyFavorites.value) {
      applyFilters();
    }
  } catch {
    toastError("Failed to update watchlist");
  }
}

function toggleSelection(studioId: string) {
  const index = selectedStudios.value.indexOf(studioId);
  if (index > -1) {
    selectedStudios.value.splice(index, 1);
  } else {
    selectedStudios.value.push(studioId);
  }
}

function viewStudioDetails(studio: any) {
  selectedStudioDetail.value = studio;
}

function viewStudioJobs(studio: any) {
  router.push({
    path: "/jobs",
    query: { studio: studio.name },
  });
}

function viewFavorites() {
  showOnlyFavorites.value = !showOnlyFavorites.value;
  applyFilters();
}

function compareStudios() {
  if (selectedStudios.value.length < 2) {
    toastInfo("Select at least 2 studios to compare");
    return;
  }
  showComparison.value = true;
}

async function quickApplyToStudio(studio: any) {
  router.push({
    path: "/interview-prep",
    query: { studio: studio.id },
  });
}

function startStudioInterview(studio: any) {
  router.push({
    path: "/interview-prep",
    query: { studio: studio.id, mode: "interview" },
  });
}



// AI Features
async function aiSearchSuggestion() {
  if (!searchQuery.value.trim()) {
    toastInfo("Enter some search terms first");
    return;
  }

  aiSearching.value = true;
  try {
    await aiService.initialize({
      primaryProvider: "google",
      enableContextPersistence: false,
    });

    const suggestions = await aiService.chat({
      message: `Given the search query "${searchQuery.value}", suggest related gaming studios, technologies, locations, or roles that might be relevant. Return a JSON array of suggestion strings.`,
      type: "analysis",
      metadata: { feature: "studio-search-suggestions" },
    });

    // Parse AI suggestions and show them
    try {
      const parsed = JSON.parse(suggestions.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const suggestion = parsed[0];
        searchQuery.value = suggestion;
        debouncedSearch(suggestion);
        toastSuccess(`AI suggestion applied: "${suggestion}"`);
      }
    } catch {
      // Fallback to enhancing current search
      toastInfo("AI analyzing your search query...");
    }
  } catch {
    toastError("AI search assistance failed");
  } finally {
    aiSearching.value = false;
  }
}

async function runAIAnalysis() {
  aiAnalyzing.value = true;
  try {
    await aiService.initialize({
      primaryProvider: "google",
      enableContextPersistence: false,
    });

    const userProfile = {
      skills: store.user?.skills || [],
      experience: store.user?.personalInfo?.experience || "mid",
      interests: store.user?.gamingExperience?.interests || [],
    };

    for (const studio of filteredStudios.value.slice(0, 20)) {
      // Limit to avoid rate limits
      try {
        const analysis = await aiService.chat({
          message: `Analyze how well this gaming studio matches the user profile. Studio: ${JSON.stringify(studio)}. User: ${JSON.stringify(userProfile)}. Return a match score 0-100.`,
          type: "analysis",
          metadata: { feature: "studio-ai-scoring" },
        });

        const scoreMatch = analysis.content.match(/(\d+)/);
        if (scoreMatch) {
          aiScores.value[studio.id] = parseInt(scoreMatch[1]);
        }
      } catch (error) {
        console.warn(`AI scoring failed for ${studio.name}:`, error);
      }
    }

    applySorting();
    toastSuccess(
      `AI analysis complete! ${Object.keys(aiScores.value).length} studios scored`,
    );
  } catch {
    toastError("AI analysis failed");
  } finally {
    aiAnalyzing.value = false;
  }
}

function toggleExportDropdown() {
  showExportDropdown.value = !showExportDropdown.value;
}

function exportData() {
  const exportData = {
    studios: filteredStudios.value,
    filters: filters.value,
    favorites: favoriteStudios.value,
    aiScores: aiScores.value,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gaming-studios-intel-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showExportDropdown.value = false;
  toastSuccess("Studio intelligence exported");
}

function exportDedupedCSV() {
  try {
    const rows = allStudios.value;
    const headers = [
      "id",
      "name",
      "location",
      "size",
      "founded",
      "confidence",
      "sources",
      "technologies",
    ];
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = Array.isArray(v) ? v.join("|") : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const lines = [headers.join(",")];
    for (const s of rows) {
      const sources = (s.sources || s.sourceRefs || []).join("|");
      lines.push(
        [
          escape(s.id),
          escape(s.name),
          escape(s.headquarters || s.location || ""),
          escape(s.size || ""),
          escape(s.founded || ""),
          escape(s.confidence || ""),
          escape(sources),
          escape((s.technologies || []).join("|")),
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studios-deduped-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showExportDropdown.value = false;
    toastSuccess("CSV exported");
  } catch (e) {
    console.error(e);
    toastError("CSV export failed");
  }
}

// Open knowledge aggregation (Wikidata/Wikipedia/DBpedia/GitHub)
async function runOpenDataScan() {
  openDataLoading.value = true;
  try {
    const { OpenKnowledgeStudioAggregator } = await import(
      "@/services/ingestion/OpenKnowledgeStudioAggregator"
    );
    const aggregator = new OpenKnowledgeStudioAggregator();
    const result = await aggregator.aggregateAll({
      include: ["wikidata", "wikipedia", "dbpedia"],
    });
    // Persist into our repository via service
    const ingest = await studioService.ingestOpenData(result.studios);
    await loadStudios();
    toastSuccess(
      `Open data merged: ${ingest.created} new • ${ingest.updated} updated`,
    );
  } catch (e: any) {
    console.error(e);
    toastError("Open data scan failed");
  } finally {
    openDataLoading.value = false;
  }
}

// Full import: static + (Steam if available) + open data enrichment + de-dup pass
async function runFullImport() {
  importing.value = true;
  progressTitle.value = "Studio Import";
  showProgressModal.value = true;
  runStartedAt.value = Date.now();
  resetStages();
  try {
    let staticImported: any = null;
    // Attempt to use DatabaseStudioService (Node/electron env)
    try {
      const { databaseStudioService } = await import(
        "@/services/database/DatabaseStudioService"
      );
      markStageRunning("static");
      await databaseStudioService.init();
      staticImported = await databaseStudioService.importAllStudios(true);
      if (staticImported) {
        progressStages.value.static.countText = `${staticImported.imported || 0} imported`;
      }
      markStageDone("static");
    } catch {
      console.warn(
        "[Studios] DatabaseStudioService not available in this environment, skipping static/steam import",
      );
      markStageError("static");
    }

    // Open data enrichment
    let enrichment: any = null;
    try {
      const { OpenKnowledgeStudioAggregator } = await import(
        "@/services/ingestion/OpenKnowledgeStudioAggregator"
      );
      const aggregator = new OpenKnowledgeStudioAggregator();
      markStageRunning("open");
      const result = await aggregator.aggregateAll({
        include: ["wikidata", "wikipedia"],
      });
      enrichment = await studioService.ingestOpenData(result.studios);
      progressStages.value.open.countText = `${enrichment.created} new • ${enrichment.updated} updated`;
      markStageDone("open");
    } catch (e) {
      console.warn("[Studios] Open knowledge enrichment failed", e);
      markStageError("open");
    }

    // Reload data then perform light client-side de-dup (normalized name keep richest record)
    markStageRunning("dedupe");
    await loadStudios();
    await dedupeAndPersist();
    markStageDone("dedupe");
    toastSuccess(
      `Import complete${staticImported?.imported ? ` • ${staticImported.imported} base` : ""}${enrichment ? ` • +${enrichment.created}/${enrichment.updated} enriched` : ""}`,
    );
  } catch (e) {
    console.error(e);
    toastError("Full import failed");
  } finally {
    importing.value = false;
    // If all stages done close automatically after short delay
    markStageDone("persist"); // ensure persist marked if not
    setTimeout(() => {
      if (!importing.value && !syncingSteam.value) {
        showProgressModal.value = false;
      }
    }, 1200);
  }
}

async function dedupeAndPersist() {
  try {
    const { dedupeStudios } = await import("@/utils/studio-dedupe");
    const deduped = dedupeStudios(allStudios.value);
    allStudios.value = deduped;
    applyFilters();
    markStageRunning("persist");
    try {
      const { databaseStudioService } = await import(
        "@/services/database/DatabaseStudioService"
      );
      await databaseStudioService.init();
      const persistResult: any = await databaseStudioService.bulkPersistMerged(
        deduped as any,
      );
      if (persistResult && typeof persistResult === "object") {
        progressStages.value.persist.countText = `${persistResult.created || 0} new • ${persistResult.updated || 0} updated`;
      } else if (typeof persistResult === "number") {
        progressStages.value.persist.countText = `${persistResult} persisted`;
      }
      markStageDone("persist");
    } catch (e) {
      console.warn("[Studios] Persistence skipped/unavailable", e);
      markStageError("persist");
    }
  } catch (e) {
    console.error("Deduplication failed", e);
    markStageError("dedupe");
  }
}

async function runIncrementalSteamSync() {
  syncingSteam.value = true;
  progressTitle.value = "Incremental Steam Sync";
  showProgressModal.value = true;
  runStartedAt.value = Date.now();
  resetStages(["static", "dedupe", "persist"]);
  markStageRunning("static");
  try {
    const { databaseStudioService } = await import(
      "@/services/database/DatabaseStudioService"
    );
    await databaseStudioService.init();
    const res = await databaseStudioService.incrementalSteamSync(120);
    progressStages.value.static.countText =
      `${res?.imported || 0} imported` +
      (res?.totalRaw ? ` / ${res.totalRaw} raw` : "");
    markStageDone("static");
    await loadStudios();
    markStageRunning("dedupe");
    await dedupeAndPersist();
    markStageDone("dedupe");
    toastSuccess("Incremental Steam sync complete");
  } catch (e) {
    console.error("Incremental Steam sync failed", e);
    markStageError("static");
    toastError("Steam sync failed");
  } finally {
    syncingSteam.value = false;
    setTimeout(() => {
      if (!importing.value && !syncingSteam.value)
        showProgressModal.value = false;
    }, 1200);
  }
}

function resetStages(onlyKeys?: string[]) {
  const keys = onlyKeys || Object.keys(progressStages.value);
  for (const k of keys) {
    if (!progressStages.value[k]) continue;
    progressStages.value[k] = {
      ...progressStages.value[k],
      status: "pending",
      startedAt: 0,
      durationMs: 0,
      countText: "",
    };
  }
}
function markStageRunning(key: string) {
  const s = progressStages.value[key];
  if (!s) return;
  s.status = "running";
  s.startedAt = Date.now();
}
function markStageDone(key: string) {
  const s = progressStages.value[key];
  if (!s) return;
  if (s.status === "running") {
    s.durationMs = Date.now() - s.startedAt;
  }
  s.status = "done";
}
function markStageError(key: string) {
  const s = progressStages.value[key];
  if (!s) return;
  if (s.status === "running") {
    s.durationMs = Date.now() - s.startedAt;
  }
  s.status = "error";
}
function retryStage(key: string) {
  if (key === "static") {
    if (progressTitle.value.includes("Incremental")) {
      runIncrementalSteamSync();
    } else {
      runFullImport();
    }
    return;
  }
  if (key === "open") {
    runOpenDataScan();
    return;
  }
  if (key === "dedupe" || key === "persist") {
    dedupeAndPersist();
    return;
  }
}
function closeProgressModal() {
  showProgressModal.value = false;
}
function formatMs(ms: number) {
  if (!ms) return "0ms";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = (s % 60).toFixed(0);
  return `${m}m ${rem}s`;
}

// Click outside handler for export dropdown
function handleClickOutside(event: Event) {
  if (
    exportButton.value &&
    event.target &&
    !exportButton.value.$el.contains(event.target as any)
  ) {
    showExportDropdown.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize active tab from route query or persisted state
  try {
    const queryTab = (router.currentRoute.value.query?.tab as string) || "";
    const saved = localStorage.getItem("navi-studios-active-tab") || "";
    const t = (queryTab || saved || "database") as string;
    if (["database", "analytics", "network"].includes(t)) {
      activeTab.value = t as any;
    }
  } catch {}

  await loadStudios();

  // Add click outside listener for export dropdown
  document.addEventListener("click", handleClickOutside);


  try {
    const { databaseStudioService } = await import(
      "@/services/database/DatabaseStudioService"
    );
    await databaseStudioService.init();
    backgroundSyncTimer = setInterval(
      () => {
        if (!importing.value && !syncingSteam.value) {
          runIncrementalSteamSync();
        }
      },
      30 * 60 * 1000,
    );
  } catch {
    // ignore if not available in this environment
  }
});

onUnmounted(() => {
  if (backgroundSyncTimer) clearInterval(backgroundSyncTimer);
  document.removeEventListener("click", handleClickOutside);
});

// Watchers
watch([sortBy, sortDirection], () => {
  applySorting();
});
watch(confidenceThreshold, () => applyFilters());
</script>

<style scoped>
.progress-modal-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-modal {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
}
.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
}
.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
}
.close-btn:disabled {
  cursor: not-allowed;
}
.progress-body {
  display: flex;
  flex-direction: column;
}
.stage {
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  display: flex;
  flex-direction: column;
}
.stage.running {
}
@keyframes pulse {
  }
  }
}
.stage-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.counts {
}
.status[data-status="error"] {
}
.status[data-status="done"] {
}
.progress-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.elapsed {
}
.studio-database {
  background: var(--surface-base);
}

.detective-workspace {
  position: relative;
}

.detective-workspace::before {
  content: "";
  position: fixed;
  background:
    radial-gradient(
    ),
    radial-gradient(
    );
  pointer-events: none;
}

.search-command-center {
  border-radius: var(--radius-xl);
  background: var(--glass-surface);
}

.command-grid {
  display: flex;
  flex-direction: column;
}

.search-primary {
  display: flex;
  align-items: flex-end;
}

.search-field-enhanced {
}

.quick-actions {
  display: flex;
}

.filter-matrix {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: grid;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  color: var(--text-primary);
}

.filter-select {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
}

.tech-chips {
  display: flex;
  flex-wrap: wrap;
}

.tech-chip {
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
}

.tech-chip:hover {
}

.tech-chip.active {
  color: white;
}

.filter-toggles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.toggle-filter {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-indicator {
  background: var(--glass-bg);
  position: relative;
}

.toggle-filter input:checked + .toggle-indicator {
}

.toggle-filter input:checked + .toggle-indicator::after {
  content: "✓";
  position: absolute;
  color: white;
  font-weight: bold;
}

.toggle-filter input {
  display: none;
}

.quick-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
}

.quick-filter-btn:hover {
}

.quick-filter-btn.active {
  color: white;
}

.sort-controls {
  display: flex;
  align-items: center;
}

.sort-label {
  color: var(--text-secondary);
}

.sort-select {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
}

.sort-direction {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-header {
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
}

.results-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.results-count {
  color: var(--text-primary);
}

.results-actions {
  display: flex;
  align-items: center;
}

.sr-only {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
}

.view-toggles {
  display: flex;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
}

.view-toggle {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.view-toggle:hover {
  background: var(--glass-surface);
  color: var(--text-primary);
}

.view-toggle.active {
  color: white;
}


.studio-results {
}

.studios-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
  );
}

.studios-list {
  display: flex;
  flex-direction: column;
}

.studios-table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
}

.empty-state {
  text-align: left;
}

.pagination-section {
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-numbers {
  display: flex;
}

.page-number {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
}

.page-number:hover {
}

.page-number.active {
  color: white;
}

  .search-primary {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row {
  }

  .quick-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .studios-grid {
    grid-template-columns: repeat(
      auto-fill,
    );
  }
}

  .search-command-center {
  }

  .quick-filters {
    justify-content: center;
  }

  .results-meta {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .studios-grid {
  }

  .pagination-controls {
    flex-wrap: wrap;
  }
}

[data-theme="dark"] .filter-select,
[data-theme="dark"] .sort-select {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme="dark"] .tech-chip {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme="dark"] .toggle-indicator {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

.search-input-container {
  position: relative;
}

.search-input {
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
}

.search-input-icon {
  position: absolute;
  color: var(--text-secondary);
  pointer-events: none;
}

.input-wrapper {
  position: relative;
}

.filter-input {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary);
}

.input-icon {
  position: absolute;
  color: var(--text-secondary);
  pointer-events: none;
}

.studio-intelligence-dashboard {
}

.dashboard-card {
  background: var(--glass-bg);
  box-shadow:
  overflow: hidden;
}

.dashboard-header {
  background: linear-gradient(
  );
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-icon {
  border-radius: var(--radius-lg);
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.header-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
}

.action-btn {
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal);
  color: var(--text-secondary);
  font-size: var(--font-size-xl);
}

.action-btn:hover {
}

.metrics-grid {
  display: grid;
}

.metric-card {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  position: relative;
  transition: all var(--duration-normal);
  overflow: hidden;
}

.metric-card::before {
  content: "";
  position: absolute;
  transition: opacity var(--duration-normal);
}

.metric-card:hover {
  border-color: var(--glass-border-hover);
}

.metric-card:hover::before {
}

.metric-card.primary::before {
  background: linear-gradient(
  );
}

.metric-card.success::before {
  background: linear-gradient(
  );
}

.metric-card.info::before {
  background: linear-gradient(
  );
}

.metric-card.muted::before,
.metric-card.status-muted::before {
  background: linear-gradient(
  );
}

.metric-card.status-primary::before {
  background: linear-gradient(
  );
}

.metric-card.status-info::before {
  background: linear-gradient(
  );
}

.metric-card.status-success::before {
  background: linear-gradient(
  );
}

.metric-card.status-warning::before {
  background: linear-gradient(
  );
}

.metric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.metric-icon-wrapper {
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.metric-card.primary .metric-icon-wrapper,
.metric-card.status-primary .metric-icon-wrapper {
}

.metric-card.success .metric-icon-wrapper,
.metric-card.status-success .metric-icon-wrapper {
  background: linear-gradient(
  );
  position: relative;
  overflow: hidden;
}

.metric-card.status-success .metric-icon-wrapper::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

.metric-card.status-success.interactive:hover .metric-icon-wrapper::before {
}

.metric-card.info .metric-icon-wrapper,
.metric-card.status-info .metric-icon-wrapper {
}

.metric-card.muted .metric-icon-wrapper,
.metric-card.status-muted .metric-icon-wrapper {
  color: var(--text-tertiary);
}

.metric-card.status-warning .metric-icon-wrapper {
}

.metric-toggle {
  position: relative;
}

.toggle-input {
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  background: var(--glass-border);
  transition: all var(--duration-normal);
}

.toggle-label:before {
  position: absolute;
  content: "";
  background: white;
  transition: all var(--duration-normal);
}

.toggle-input:checked + .toggle-label {
  background: linear-gradient(
  );
}

.toggle-input:checked + .toggle-label:before {
}

.metric-value {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  transition: all var(--duration-normal);
}

.metric-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.metric-change {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.metric-change.positive {
}

.metric-change.negative {
}

.metric-change.neutral {
  color: var(--text-secondary);
}

.metric-card.interactive {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.metric-card.interactive::after {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  pointer-events: none;
}

.metric-card.interactive:hover::after {
}

.metric-card.interactive:hover .metric-value {
}

.metric-card.status-success.interactive {
  background: radial-gradient(
    circle at top right,
  );
}

.metric-card.status-success.interactive:hover {
  box-shadow:
}

.metric-card.status-success.interactive:hover .metric-value {
  text-shadow:
}

.metric-card.status-success.interactive:active {
}

@keyframes success-pulse {
    box-shadow:
  }
    box-shadow:
  }
}

.metric-card.status-success.interactive:focus-within {
}

.live-indicator {
  position: absolute;
}

@keyframes pulse {
  }
  }
  }
}

.chart-preview {
  background: linear-gradient(
    to right,
  );
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.chart-preview::after {
  content: "";
  position: absolute;
}

.loading-bar {
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: opacity var(--duration-normal);
  overflow: hidden;
}

.metric-card:hover .loading-bar {
}

.metric-card.status-success .loading-bar {
  background: linear-gradient(
  );
}

.metric-card.status-success.interactive:hover .loading-bar {
  background: linear-gradient(
  );
  box-shadow:
}

@keyframes success-loading {
  }
  }
  }
}

@keyframes loading {
  }
  }
}

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .metrics-grid {
  }

  .metric-value {
  }

    font-size: var(--font-size-xl);
  }
}

  .dashboard-card {
    border-radius: var(--radius-xl);
  }

  .dashboard-header {
  }

  .metrics-grid {
  }

  .metric-card {
  }

  .header-actions {
    justify-content: center;
  }
}

.metric-card {
  contain: layout style paint;
}

.dashboard-card {
  contain: layout style;
}

@keyframes spin {
  from {
  }
  to {
  }
}

@media (prefers-color-scheme: dark) {
  .metric-card {
    box-shadow:
  }

  .dashboard-card {
    box-shadow:
  }
}

.live-indicator.pulsing {
}

.action-btn:focus {
}

.toggle-label:focus-within {
}

.metric-card:focus-within {
}

.header-action-group {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal);
}

.header-action-group:hover {
  border-color: var(--glass-border-hover);
  background: var(--glass-hover-bg);
}

.primary-actions {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.data-actions {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.export-actions {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.dropdown-container {
  position: relative;
}

.export-dropdown {
  position: absolute;
  border-radius: var(--radius-lg);
  box-shadow:
  display: flex;
  flex-direction: column;
}

.export-option {
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  text-align: left;
}

.export-option:hover {
  background: var(--glass-hover-bg);
}

.export-option:active {
}

  .header-action-group {
    flex-wrap: wrap;
  }

  .data-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .data-actions .unified-button {
    justify-content: center;
  }
}

  .header-action-group {
    justify-content: center;
  }

  .primary-actions,
  .data-actions,
  .export-actions {
    justify-content: center;
  }

  .export-dropdown {
    right: auto;
  }
}

.header-action-group {
}

@keyframes slideInFromTop {
  from {
  }
  to {
  }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .action-btn,
  .toggle-label,
  .loading-bar,
  .live-indicator,
  .header-action-group {
    transition: none;
    animation: none;
  }

  .metric-card:hover {
    transform: none;
  }

  .action-btn:hover {
    transform: none;
  }

  .header-action-group:hover {
    transform: none;
  }
}
</style>
