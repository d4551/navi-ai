<!--
  Advanced Search Component
  Comprehensive search interface with semantic capabilities, filters, and recommendations
-->

<template>
  <div class="advanced-search">
    <!-- Search Header -->
    <div class="search-header">
      <div class="container">
        <h2 class="search-title">
          <AppIcon name="mdi-magnify-plus-outline" aria-hidden="true" />
          Discover Gaming Opportunities
        </h2>
        <p class="search-description">
          Find your perfect role in the gaming industry with intelligent search
          and personalized recommendations
        </p>
      </div>
    </div>

    <div class="search-container">
      <!-- Main Search Bar -->
      <div class="search-main">
        <AutocompleteSearch
          v-model="searchQuery"
          placeholder="Search roles, studios, technologies, or describe what you're looking for..."
          aria-label="Advanced gaming job search"
          :show-filters="true"
          :max-results="15"
          class="main-search-input ui-input ui-size-md"
          @select="handleSearchSelect"
          @search="handleSearch"
          @clear="handleSearchClear"
        />

        <!-- Search Mode Toggle -->
        <div class="search-mode-toggle">
          <div class="toggle-group">
            <button
              :class="['toggle-btn', { active: searchMode === 'keyword' }]"
              type="button"
              @click="searchMode = 'keyword'"
            >
              <AppIcon name="mdi-text-search" aria-hidden="true" />
              Keyword
            </button>
            <button
              :class="['toggle-btn', { active: searchMode === 'semantic' }]"
              type="button"
              @click="searchMode = 'semantic'"
            >
              <AppIcon name="mdi-brain" aria-hidden="true" />
              Semantic
            </button>
          </div>
          <small class="toggle-help">
            {{
              searchMode === "semantic"
                ? "AI-powered contextual search"
                : "Traditional keyword matching"
            }}
          </small>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="filters-section" :class="{ expanded: showFilters }">
        <div class="filters-header">
          <button
            class="filters-toggle"
            type="button"
            :aria-expanded="showFilters"
            @click="toggleFilters"
          >
            <AppIcon name="mdi-tune-vertical" aria-hidden="true" />
            Advanced Filters
            <AppIcon
              :name="showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              aria-hidden="true"
            />
          </button>

          <div v-if="activeFilterCount > 0" class="active-filters-count">
            {{ activeFilterCount }} active
          </div>
        </div>

        <div v-if="showFilters" class="filters-content">
          <div class="filters-grid settings-grid">
            <!-- Role Categories -->
            <div class="filter-group">
              <h4 class="filter-title">Role Categories</h4>
              <div class="filter-chips">
                <label
                  v-for="category in roleCategories"
                  :key="category"
                  class="filter-chip"
                  :class="{
                    active: selectedFilters.roleCategories?.includes(category),
                  }"
                >
                  <input
                    v-model="selectedFilters.roleCategories"
                    type="checkbox"
                    :value="category"
                    class="filter-checkbox"
                  />
                  <span class="filter-label">{{ category }}</span>
                  <span class="filter-count">({{ getRoleCategoryCount(category) }})</span>
                </label>
              </div>
            </div>

            <!-- Studio Categories -->
            <div class="filter-group">
              <h4 class="filter-title">Studio Types</h4>
              <div class="filter-chips">
                <label
                  v-for="category in studioCategories"
                  :key="category"
                  class="filter-chip"
                  :class="{
                    active:
                      selectedFilters.studioCategories?.includes(category),
                  }"
                >
                  <input
                    v-model="selectedFilters.studioCategories"
                    type="checkbox"
                    :value="category"
                    class="filter-checkbox"
                  />
                  <span class="filter-label">{{ category }}</span>
                  <span class="filter-count">({{ getStudioCategoryCount(category) }})</span>
                </label>
              </div>
            </div>

            <!-- Company Size -->
            <div class="filter-group">
              <h4 class="filter-title">Company Size</h4>
              <div class="filter-chips">
                <label
                  v-for="size in companySizes"
                  :key="size"
                  class="filter-chip"
                  :class="{
                    active: selectedFilters.companySizes?.includes(size),
                  }"
                >
                  <input
                    v-model="selectedFilters.companySizes"
                    type="checkbox"
                    :value="size"
                    class="filter-checkbox"
                  />
                  <span class="filter-label">{{ size }}</span>
                </label>
              </div>
            </div>

            <!-- Remote Work -->
            <div class="filter-group">
              <h4 class="filter-title">Work Style</h4>
              <div class="filter-chips">
                <label
                  class="filter-chip"
                  :class="{ active: selectedFilters.remoteWork === true }"
                >
                  <input
                    v-model="selectedFilters.remoteWork"
                    type="radio"
                    :value="true"
                    class="filter-checkbox"
                  />
                  <span class="filter-label">Remote</span>
                </label>
                <label
                  class="filter-chip"
                  :class="{ active: selectedFilters.remoteWork === false }"
                >
                  <input
                    v-model="selectedFilters.remoteWork"
                    type="radio"
                    :value="false"
                    class="filter-checkbox"
                  />
                  <span class="filter-label">On-site</span>
                </label>
              </div>
            </div>
          </div>

          <div class="filters-actions">
            <button
              class="btn btn-secondary btn-sm ui-btn ui-size-md"
              type="button"
              :disabled="activeFilterCount === 0"
              @click="clearFilters"
            >
              Clear All Filters
            </button>
            <button
              class="btn btn-primary btn-sm v-btn ui-btn ui-size-md"
              type="button"
              @click="applyFilters"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="hasSearched" class="search-results">
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <span class="results-count">{{ searchResults.length }} results</span>
            <span v-if="searchQuery" class="results-query">for "{{ searchQuery }}"</span>
            <span v-if="searchMode === 'semantic'" class="results-mode">
              <AppIcon name="mdi-brain" aria-hidden="true" />
              Semantic Search
            </span>
          </div>

          <div class="results-sort">
            <select v-model="sortBy" class="sort-select" @change="sortResults">
              <option value="relevance">Best Match</option>
              <option value="name">Name (A-Z)</option>
              <option value="founded">Founded Year</option>
              <option value="size">Company Size</option>
            </select>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="searchResults.length === 0" class="no-results">
          <div class="no-results-content">
            <AppIcon name="mdi-magnify-close" aria-hidden="true" />
            <h3>No results found</h3>
            <p>Try adjusting your search terms or filters</p>
            <div class="no-results-suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Check spelling of search terms</li>
                <li>Try broader keywords</li>
                <li>Remove some filters</li>
                <li v-if="searchMode === 'keyword'">
                  Switch to semantic search for better matching
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Results Grid -->
        <div v-else class="results-grid portfolio-grid">
          <!-- Studio Results -->
          <div
            v-for="result in searchResults"
            :key="`${result.type}-${result.id}`"
            class="result-card"
            :class="`result-${result.type}`"
            @click="selectResult(result)"
          >
            <div class="result-header">
              <div class="result-icon">
                <AppIcon
                  :name="getResultIcon(result.type)"
                  aria-hidden="true"
                />
              </div>
              <div class="result-meta">
                <span class="result-type">{{
                  formatResultType(result.type)
                }}</span>
                <div v-if="result.similarity" class="result-score">
                  <span class="score-label">Match:</span>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      :style="{ width: `${result.similarity * 100}%` }"
                    ></div>
                  </div>
                  <span class="score-value">{{ Math.round(result.similarity * 100) }}%</span>
                </div>
              </div>
            </div>

            <div class="result-content">
              <h3 class="result-title">{{ getResultTitle(result) }}</h3>
              <p class="result-description">
                {{ getResultDescription(result) }}
              </p>

              <!-- Studio-specific info -->
              <div v-if="result.type === 'studio'" class="result-details">
                <div class="detail-tags">
                  <span class="detail-tag">{{ result.size }}</span>
                  <span class="detail-tag">{{ result.headquarters }}</span>
                  <span v-if="result.category" class="detail-tag category">{{
                    result.category
                  }}</span>
                </div>
                <div v-if="result.games" class="result-games">
                  <strong>Games:</strong>
                  {{ result.games.slice(0, 3).join(", ") }}
                  <span v-if="result.games.length > 3">...</span>
                </div>
              </div>

              <!-- Role-specific info -->
              <div v-if="result.type === 'role'" class="result-details">
                <div class="detail-tags">
                  <span class="detail-tag category">{{ result.category }}</span>
                  <span
                    v-if="result.demandLevel"
                    class="detail-tag"
                    :class="`demand-${result.demandLevel}`"
                  >
                    {{ result.demandLevel }} demand
                  </span>
                </div>
              </div>

              <!-- Matched terms for semantic search -->
              <div v-if="result.matchedTerms?.length" class="matched-terms">
                <span class="matched-label">Matched:</span>
                <span
                  v-for="term in result.matchedTerms.slice(0, 5)"
                  :key="term"
                  class="matched-term"
                >
                  {{ term }}
                </span>
              </div>
            </div>

            <div class="result-actions">
              <button
                class="btn btn-sm btn-outline-primary ui-btn ui-size-md"
                type="button"
                @click.stop="viewDetails(result)"
              >
                View Details
              </button>
              <button
                v-if="result.type === 'studio'"
                class="btn btn-sm btn-primary ui-btn ui-size-md"
                type="button"
                @click.stop="startInterview(result)"
              >
                Practice Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div
        v-if="!hasSearched && recommendations.length > 0"
        class="recommendations"
      >
        <h3 class="recommendations-title">
          <AppIcon name="mdi-star" />
          Recommended for You
        </h3>
        <div class="recommendations-grid tool-grid">
          <div
            v-for="rec in recommendations"
            :key="rec.value"
            class="recommendation-card"
            @click="selectRecommendation(rec)"
          >
            <AppIcon
              :name="getResultIcon(rec.category)"
              class="recommendation-icon"
              aria-hidden="true"
            />
            <h4 class="recommendation-title">{{ rec.label }}</h4>
            <p class="recommendation-description">{{ rec.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import AutocompleteSearch from "./AutocompleteSearch.vue";
import { searchService } from "@/shared/services/SearchService";
import {
  ROLE_CATEGORIES,
  STUDIO_CATEGORIES,
  COMPANY_SIZES,
} from "@/shared/constants/gaming-studios";
import type { AutocompleteOption } from "@/shared/types/interview";

const router = useRouter();
const store = useAppStore();

// Search state
const searchQuery = ref("");
const searchMode = ref<"keyword" | "semantic">("semantic");
const searchResults = ref<any[]>([]);
const hasSearched = ref(false);
const isSearching = ref(false);

// Filters
const showFilters = ref(false);
const selectedFilters = ref<any>({
  roleCategories: [],
  studioCategories: [],
  companySizes: [],
  remoteWork: null,
});
const sortBy = ref("relevance");

// Recommendations
const recommendations = ref<AutocompleteOption[]>([]);

// Computed properties
const roleCategories = computed(() => Object.keys(ROLE_CATEGORIES));
const studioCategories = computed(() => Object.keys(STUDIO_CATEGORIES));
const companySizes = computed(() => COMPANY_SIZES);

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedFilters.value.roleCategories?.length)
    count += selectedFilters.value.roleCategories.length;
  if (selectedFilters.value.studioCategories?.length)
    count += selectedFilters.value.studioCategories.length;
  if (selectedFilters.value.companySizes?.length)
    count += selectedFilters.value.companySizes.length;
  if (selectedFilters.value.remoteWork !== null) count += 1;
  return count;
});

// Methods
function toggleFilters() {
  showFilters.value = !showFilters.value;
}

function clearFilters() {
  selectedFilters.value = {
    roleCategories: [],
    studioCategories: [],
    companySizes: [],
    remoteWork: null,
  };
  if (hasSearched.value) {
    applyFilters();
  }
}

async function handleSearch(query: string, filters: string[]) {
  if (!query.trim()) return;

  isSearching.value = true;
  hasSearched.value = true;

  try {
    if (searchMode.value === "semantic") {
      searchResults.value = await searchService.semanticSearch(query, {
        threshold: 0.05,
        maxResults: 50,
        filters: {
          types: filters.length ? (filters as any) : undefined,
          ...selectedFilters.value,
        },
      });
    } else {
      // Traditional search
      const result = searchService.search({
        query,
        filters: selectedFilters.value,
        sortBy: sortBy.value as any,
        sortOrder: "desc",
      });

      searchResults.value = [
        ...result.studios.map((studio) => ({ ...studio, type: "studio" })),
        ...result.roles.map((role) => ({
          name: role,
          type: "role",
          category: searchService.getRoleCategory?.(role) || "Other",
        })),
      ];
    }
  } catch (error) {
    console.error("Search failed:", error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

async function handleSearchSelect(option: AutocompleteOption) {
  searchQuery.value = option.label;
  await handleSearch(option.label, []);
}

function handleSearchClear() {
  searchQuery.value = "";
  searchResults.value = [];
  hasSearched.value = false;
}

async function applyFilters() {
  if (searchQuery.value.trim()) {
    await handleSearch(searchQuery.value, []);
  }
}

function sortResults() {
  // Implement sorting logic based on sortBy
  const results = [...searchResults.value];

  switch (sortBy.value) {
    case "name":
      results.sort((a, b) =>
        getResultTitle(a).localeCompare(getResultTitle(b)),
      );
      break;
    case "founded":
      results.sort((a, b) => (b.founded || 0) - (a.founded || 0));
      break;
    case "size":
      results.sort((a, b) => {
        const sizeA = extractNumberFromSize(a.size || "");
        const sizeB = extractNumberFromSize(b.size || "");
        return sizeB - sizeA;
      });
      break;
    default: // relevance
      if (searchMode.value === "semantic") {
        results.sort(
          (a, b) =>
            b.similarity * (b.relevanceBoost || 1) -
            a.similarity * (a.relevanceBoost || 1),
        );
      }
      break;
  }

  searchResults.value = results;
}

// Helper methods
function getResultIcon(type: string): string {
  const icons: Record<string, string> = {
    studio: "mdi mdi-domain",
    role: "mdi mdi-account-tie",
    technology: "mdi mdi-code-tags",
  };
  return icons[type] || "mdi mdi-circle";
}

function formatResultType(type: string): string {
  const types: Record<string, string> = {
    studio: "Studio",
    role: "Role",
    technology: "Technology",
  };
  return types[type] || type;
}

function getResultTitle(result: any): string {
  return result.name || result.title || result.label || "Untitled";
}

function getResultDescription(result: any): string {
  if (result.description) return result.description;
  if (result.type === "role")
    return `${result.category || "Professional"} role in gaming industry`;
  return "No description available";
}

function getRoleCategoryCount(category: string): number {
  return ROLE_CATEGORIES[category as keyof typeof ROLE_CATEGORIES]?.length || 0;
}

function getStudioCategoryCount(category: string): number {
  return (
    STUDIO_CATEGORIES[category as keyof typeof STUDIO_CATEGORIES]?.length || 0
  );
}

function extractNumberFromSize(size: string): number {
  const match = size.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function selectResult(_result: any) {
  // Handle result selection
  // Result selection logic could be implemented here
}

function selectRecommendation(rec: AutocompleteOption) {
  searchQuery.value = rec.label;
  handleSearch(rec.label, []);
}

function viewDetails(result: any) {
  // Navigate to details view
  if (result.type === "studio") {
    // router.push(`/studios/${result.id}`);
    // Navigate to studio details when routing is implemented
  } else if (result.type === "role") {
    // router.push(`/roles/${result.name}`);
    // Navigate to role details when routing is implemented
  }
}

function startInterview(studio: any) {
  router.push({
    name: "GamingInterview",
    query: { studioId: studio.id },
  });
}

// Lifecycle
onMounted(async () => {
  // Load personalized recommendations
  try {
    const userContext = {
      userRole: store.user?.profile?.desiredRole,
      userSkills: store.user?.profile?.skills || [],
      userLocation: store.user?.profile?.location,
      preferredStudioTypes: store.user?.preferences?.studioTypes || [],
    };

    recommendations.value =
      await searchService.getIntelligentSuggestions(userContext);
  } catch (error) {
    console.warn("Failed to load recommendations:", error);
  }
});

// Watch for search mode changes
watch(searchMode, async () => {
  if (searchQuery.value.trim() && hasSearched.value) {
    await handleSearch(searchQuery.value, []);
  }
});
</script>

<style scoped>
.advanced-search {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--glass-bg-start) 0%,
    var(--glass-bg-end) 100%
  );
}

.search-header {
  background: var(--glass-surface-light);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  border-bottom: 1px solid var(--glass-border-light);
  padding: var(--spacing-xl) 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.search-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.search-title i {
  color: var(--color-primary);
}

.search-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.search-main {
  margin-bottom: var(--spacing-xl);
}

.main-search-input {
  margin-bottom: var(--spacing-lg);
}

.search-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.toggle-group {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  padding: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: none;
  border: none;
  border-radius: var(--border-radius-full);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.toggle-btn:hover {
  color: var(--text-primary);
  background: var(--glass-elevated-light);
}

.toggle-btn.active {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.toggle-help {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.filters-section {
  background: var(--glass-surface-light);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
}

.filters-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.filters-toggle:hover {
  color: var(--color-primary);
}

.active-filters-count {
  background: var(--color-primary);
  color: var(--text-on-primary);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
}

.filters-content {
  padding: var(--spacing-lg);
}

.filters-grid {
  display: grid;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

  color: var(--text-primary);
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-chip {
  position: relative;
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.filter-chip:hover {
  background: var(--glass-elevated-light);
  border-color: var(--color-primary);
}

.filter-chip.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-checkbox {
  position: absolute;
  pointer-events: none;
}

.filter-count {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.filters-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
}

.results-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.results-count {
  color: var(--text-primary);
}

.results-query {
  color: var(--text-secondary);
}

.results-mode {
  display: flex;
  align-items: center;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}

.sort-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.no-results {
  text-align: center;
  padding: var(--spacing-xxl);
}

.no-results-content {
}

.no-results i {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.no-results-suggestions {
  margin-top: var(--spacing-lg);
  text-align: left;
}

.results-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.result-card {
  background: var(--glass-surface-light);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.result-card:hover {
  background: var(--glass-elevated-light);
  border-color: var(--color-primary);
  box-shadow: var(--glass-shadow-elevated);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.result-icon {
  color: var(--color-primary);
}

.result-meta {
  margin-left: var(--spacing-sm);
}

.result-type {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
}

.result-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.score-bar {
  background: var(--bg-tertiary);
  overflow: hidden;
}

.score-fill {
  background: linear-gradient(
    var(--color-success),
    var(--color-primary)
  );
  transition: width var(--transition-normal);
}

.score-value {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}

.result-title {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.result-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.result-details {
  margin-bottom: var(--spacing-md);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.detail-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.detail-tag.category {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.detail-tag.demand-high {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.detail-tag.demand-medium {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.result-games {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.matched-terms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.matched-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.matched-term {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
}

.recommendations {
  margin-top: var(--spacing-xxl);
}

.recommendations-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.recommendations-title i {
  color: var(--color-primary);
}

.recommendations-grid {
  display: grid;
  gap: var(--spacing-md);
}

.recommendation-card {
  background: var(--glass-surface-light);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.recommendation-card:hover {
  background: var(--glass-elevated-light);
  box-shadow: var(--glass-shadow-elevated);
}

.recommendation-icon {
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.recommendation-title {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.recommendation-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

  .search-container {
    padding: var(--spacing-md);
  }

  .filters-grid {
  }

  .results-grid {
  }

  .results-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .recommendations-grid {
  }
}

[data-theme="dark"] .search-header {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .filters-section,
[data-theme="dark"] .result-card,
[data-theme="dark"] .recommendation-card {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .result-card:hover,
[data-theme="dark"] .recommendation-card:hover {
  background: var(--glass-elevated-dark);
}
</style>
