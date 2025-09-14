<template>
  <div class="navigation-search" :class="{ 'search-open': isOpen }">
    <!-- Search Toggle Button -->
    <UnifiedButton
      variant="ghost"
      size="sm"
      :leading-icon="isOpen ? 'mdi-close' : 'mdi-magnify'"
      :aria-label="isOpen ? 'Close search' : 'Open search'"
      class="search-toggle"
      @click="toggleSearch"
    />

    <!-- Search Modal/Overlay -->
    <div v-if="isOpen" class="search-overlay" @click.self="closeSearch">
      <div class="search-modal">
        <!-- Search Header -->
        <div class="search-header">
          <div class="search-input-container">
            <div class="search-icon">
              <AppIcon name="mdi-magnify" size="20" />
            </div>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search pages, features, and tools..."
              @keydown.escape="closeSearch"
              @keydown.enter="handleSearchEnter"
              @keydown.arrow-down.prevent="navigateResults('down')"
              @keydown.arrow-up.prevent="navigateResults('up')"
            />
            <div class="search-shortcuts">
              <kbd class="search-kbd">ESC</kbd>
            </div>
          </div>
        </div>

        <!-- Search Content -->
        <div class="search-content">
          <!-- Search Results -->
          <div
            v-if="searchQuery.trim() && !searchLoading"
            class="search-section"
          >
            <div class="search-section-header">
              <h3 class="section-title">
                <AppIcon name="mdi-file-search" size="16" class="me-2" />
                Search Results
                <span v-if="searchResults.length" class="result-count">
                  ({{ searchResults.length }})
                </span>
              </h3>
            </div>

            <div v-if="searchResults.length" class="search-results">
              <div
                v-for="(_result, index) in searchResults"
                :key="result.id"
                class="search-result-item"
                :class="{ 'result-highlighted': index === selectedResultIndex }"
                @click="navigateToResult(_result)"
                @mouseenter="selectedResultIndex = index"
              >
                <div class="result-icon">
                  <AppIcon :name="result.icon" size="20" />
                </div>
                <div class="result-content">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-description">{{ result.description }}</div>
                  <div class="result-path">{{ result.path }}</div>
                </div>
                <div class="result-actions">
                  <button
                    class="favorite-btn"
                    :class="{ 'is-favorite': isFavorite(result.path) }"
                    :aria-label="
                      isFavorite(result.path)
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    "
                    @click.stop="toggleFavorite(result.path)"
                  >
                    <AppIcon
                      :name="
                        isFavorite(result.path)
                          ? 'mdi-heart'
                          : 'mdi-heart-outline'
                      "
                      size="16"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="no-results">
              <AppIcon name="mdi-magnify" size="48" class="no-results-icon" />
              <p class="no-results-text">
                No results found for "{{ searchQuery }}"
              </p>
              <p class="no-results-suggestion">
                Try different keywords or browse categories below
              </p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="searchLoading" class="search-loading">
            <v-progress-circular indeterminate size="32" color="primary" />
            <p>Searching...</p>
          </div>

          <!-- Quick Access Sections -->
          <div v-if="!searchQuery.trim() && !searchLoading">
            <!-- Recent Pages -->
            <div v-if="quickAccessPages.recent.length" class="search-section">
              <div class="search-section-header">
                <h3 class="section-title">
                  <AppIcon name="mdi-history" size="16" class="me-2" />
                  Recently Visited
                </h3>
                <button class="section-action" @click="clearRecentPages">
                  Clear
                </button>
              </div>
              <div class="quick-access-items">
                <div
                  v-for="page in quickAccessPages.recent"
                  :key="'recent-' + page.id"
                  class="quick-access-item"
                  @click="navigateToResult(page)"
                >
                  <div class="item-icon">
                    <AppIcon :name="page.icon" size="18" />
                  </div>
                  <div class="item-content">
                    <div class="item-title">{{ page.title }}</div>
                    <div class="item-description">{{ page.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Favorite Pages -->
            <div
              v-if="quickAccessPages.favorites.length"
              class="search-section"
            >
              <div class="search-section-header">
                <h3 class="section-title">
                  <AppIcon name="mdi-heart" size="16" class="me-2" />
                  Favorites
                </h3>
              </div>
              <div class="quick-access-items">
                <div
                  v-for="page in quickAccessPages.favorites"
                  :key="'fav-' + page.id"
                  class="quick-access-item"
                  @click="navigateToResult(page)"
                >
                  <div class="item-icon">
                    <AppIcon :name="page.icon" size="18" />
                  </div>
                  <div class="item-content">
                    <div class="item-title">{{ page.title }}</div>
                    <div class="item-description">{{ page.description }}</div>
                  </div>
                  <button
                    class="favorite-btn is-favorite"
                    @click.stop="toggleFavorite(page.path)"
                  >
                    <AppIcon name="mdi-heart" size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="search-section">
              <div class="search-section-header">
                <h3 class="section-title">
                  <AppIcon name="mdi-grid" size="16" class="me-2" />
                  Categories
                </h3>
              </div>
              <div class="category-grid">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="category-item"
                  @click="searchQuery = category.searchTerm"
                >
                  <div class="category-icon">
                    <AppIcon :name="category.icon" size="24" />
                  </div>
                  <div class="category-content">
                    <div class="category-title">{{ category.title }}</div>
                    <div class="category-count">{{ category.count }} items</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Keyboard Shortcuts Help -->
            <div class="search-section">
              <div class="search-section-header">
                <h3 class="section-title">
                  <AppIcon name="mdi-keyboard" size="16" class="me-2" />
                  Shortcuts
                </h3>
              </div>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <div class="shortcut-keys">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                  </div>
                  <div class="shortcut-description">Open search</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-keys"><kbd>↑</kbd> <kbd>↓</kbd></div>
                  <div class="shortcut-description">Navigate results</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-keys">
                    <kbd>Enter</kbd>
                  </div>
                  <div class="shortcut-description">Select result</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-keys">
                    <kbd>Esc</kbd>
                  </div>
                  <div class="shortcut-description">Close search</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

import { refonMounted, watch, nextTick } from "vue";
import { useEnhancedNavigation } from "@/composables/useEnhancedNavigation";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Composables
const {
  isSearchOpen,
  searchQuery,
  searchResults,
  searchLoading,
  quickAccessPages,
  navigateToResult,
  toggleSearch,
  closeSearch,
  toggleFavorite,
  isFavorite,
  recentPages,
} = useEnhancedNavigation();

// Component state
const searchInput = ref(null);
const selectedResultIndex = ref(-1);
const isOpen = computed(() => isSearchOpen.value);

// Categories for browsing
const categories = [
  {
    id: "career-tools",
    title: "Career Tools",
    icon: "mdi-briefcase",
    searchTerm: "resume cover letter portfolio",
    count: 4,
  },
  {
    id: "ai-features",
    title: "AI Features",
    icon: "mdi-robot",
    searchTerm: "ai assistant chat tailored",
    count: 3,
  },
  {
    id: "gaming-jobs",
    title: "Gaming Industry",
    icon: "mdi-gamepad-variant",
    searchTerm: "gaming jobs studios gigs",
    count: 4,
  },
  {
    id: "system-tools",
    title: "System & Settings",
    icon: "mdi-cog-outline",
    searchTerm: "settings flow cloud system",
    count: 4,
  },
];

// Methods
const handleSearchEnter = () => {
  if (searchResults.value.length > 0) {
    const targetIndex =
      selectedResultIndex.value >= 0 ? selectedResultIndex.value : 0;
    navigateToResult(searchResults.value[targetIndex]);
  }
};

const navigateResults = (direction) => {
  const maxIndex = searchResults.value.length - 1;

  if (direction === "down") {
    selectedResultIndex.value =
      selectedResultIndex.value >= maxIndex ? 0 : selectedResultIndex.value + 1;
  } else if (direction === "up") {
    selectedResultIndex.value =
      selectedResultIndex.value <= 0 ? maxIndex : selectedResultIndex.value - 1;
  }
};

const clearRecentPages = () => {
  recentPages.value = [];
};

// Watch for search open/close to focus input
watch(isOpen, async (newValue) => {
  if (newValue) {
    await nextTick();
    if (searchInput.value) {
      searchInput.value.focus();
    }
  } else {
    selectedResultIndex.value = -1;
  }
});

// Reset selected index when search query changes
watch(searchQuery, () => {
  selectedResultIndex.value = -1;
});
</script>

<style scoped>
.navigation-search {
  position: relative;
}

.search-toggle {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.search-toggle:hover {
  transform: scale(1.05);
}

.search-overlay {
  position: fixed;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

@keyframes overlayFadeIn {
  from {
  }
  to {
  }
}

.search-modal {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

@keyframes modalSlideIn {
  from {
  }
  to {
  }
}

.search-header {
  background: var(--surface-base);
}

.search-input-container {
  display: flex;
  align-items: center;
  background: var(--surface-base);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--easing-ease);
}

.search-input-container:focus-within {
  border-color: var(--color-primary);
}

.search-icon {
  color: var(--text-secondary);
}

.search-input {
  border: none;
  background: transparent;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  outline: none;
  font-family: var(--font-primary);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-shortcuts {
  display: flex;
  align-items: center;
}

.search-kbd {
  background: var(--surface-muted);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  text-align: center;
}

.search-content {
  overflow-y: auto;
}

.search-content::-webkit-scrollbar {
}

.search-content::-webkit-scrollbar-track {
  background: transparent;
}

.search-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
}

.search-section {
}

.search-section:last-child {
  border-bottom: none;
}

.search-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.result-count {
  color: var(--text-muted);
  font-weight: var(--font-weight-normal);
}

.section-action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
}

.section-action:hover {
  background: var(--color-primary-bg);
}

.search-results {
  display: flex;
  flex-direction: column;
}

.search-result-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  position: relative;
}

.search-result-item:hover,
.result-highlighted {
  background: var(--surface-elevated);
}

.result-icon {
  border-radius: var(--radius-md);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-content {
}

.result-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.result-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.result-path {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.result-actions {
  display: flex;
}

.favorite-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: var(--surface-hover);
  color: var(--color-primary);
}

.favorite-btn.is-favorite {
  color: var(--color-error);
}

.quick-access-items {
  display: flex;
  flex-direction: column;
}

.quick-access-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  position: relative;
}

.quick-access-item:hover {
  background: var(--surface-elevated);
}

.item-icon {
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
}

.item-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.item-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.category-grid {
  @apply compact-grid;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  background: var(--surface-base);
}

.category-item:hover {
  background: var(--surface-elevated);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.category-icon {
  border-radius: var(--radius-lg);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.shortcuts-grid {
  @apply compact-grid;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.shortcut-keys {
  display: flex;
  align-items: center;
}

.shortcut-keys kbd {
  background: var(--surface-muted);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  text-align: center;
}

.shortcut-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.no-results {
  text-align: center;
  color: var(--text-muted);
}

.no-results-icon {
}

.no-results-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.no-results-suggestion {
  font-size: var(--font-size-sm);
}

.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.search-loading p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

  .search-overlay {
  }

  .search-modal {
  }

  .category-grid {
  }

  .shortcuts-grid {
  }
}
</style>
