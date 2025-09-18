<template>
  <div class="navigation-search" :class="{ 'search-open': isOpen }">
    <!-- Search Toggle Button -->
    <UnifiedButton
      variant="ghost"
      size="sm"
      :leading-icon="isOpen ? 'XMarkIcon' : 'mdi-magnify'"
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
              <AppIcon name="MagnifyingGlassIcon" size="20" />
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
                <AppIcon name="DocumentIcon-search" size="16" class="mr-2" />
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
                          ? 'HeartIcon'
                          : 'HeartIcon-outline'
                      "
                      size="16"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="no-results">
              <AppIcon
                name="MagnifyingGlassIcon"
                size="48"
                class="no-results-icon"
              />
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
                  <AppIcon name="mdi-history" size="16" class="mr-2" />
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
                  <AppIcon name="HeartIcon" size="16" class="mr-2" />
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
                    <AppIcon name="HeartIcon" size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="search-section">
              <div class="search-section-header">
                <h3 class="section-title">
                  <AppIcon name="Squares2X2Icon" size="16" class="mr-2" />
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
                  <AppIcon name="KeyIconboard" size="16" class="mr-2" />
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
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'

import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useEnhancedNavigation } from '@/composables/useEnhancedNavigation'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

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
} = useEnhancedNavigation()

// Component state
const searchInput = ref(null)
const selectedResultIndex = ref(-1)
const isOpen = computed(() => isSearchOpen.value)

// Categories for browsing
const categories = [
  {
    id: 'career-tools',
    title: 'Career Tools',
    icon: 'mdi-briefcase',
    searchTerm: 'resume cover letter portfolio',
    count: 4,
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    icon: 'mdi-robot',
    searchTerm: 'ai assistant chat tailored',
    count: 3,
  },
  {
    id: 'gaming-jobs',
    title: 'Gaming Industry',
    icon: 'DevicePhoneMobileIcon-variant',
    searchTerm: 'gaming jobs studios gigs',
    count: 4,
  },
  {
    id: 'system-tools',
    title: 'System & Settings',
    icon: 'mdi-cog-outline',
    searchTerm: 'settings flow cloud system',
    count: 4,
  },
]

// Methods
const handleSearchEnter = () => {
  if (searchResults.value.length > 0) {
    const targetIndex =
      selectedResultIndex.value >= 0 ? selectedResultIndex.value : 0
    navigateToResult(searchResults.value[targetIndex])
  }
}

const navigateResults = direction => {
  const maxIndex = searchResults.value.length - 1

  if (direction === 'down') {
    selectedResultIndex.value =
      selectedResultIndex.value >= maxIndex ? 0 : selectedResultIndex.value + 1
  } else if (direction === 'up') {
    selectedResultIndex.value =
      selectedResultIndex.value <= 0 ? maxIndex : selectedResultIndex.value - 1
  }
}

const clearRecentPages = () => {
  recentPages.value = []
}

// Watch for search open/close to focus input
watch(isOpen, async newValue => {
  if (newValue) {
    await nextTick()
    if (searchInput.value) {
      searchInput.value.focus()
    }
  } else {
    selectedResultIndex.value = -1
  }
})

// Reset selected index when search query changes
watch(searchQuery, () => {
  selectedResultIndex.value = -1
})
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

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10vh var(--spacing-4) var(--spacing-4);
  animation: overlayFadeIn 0.2s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Search Modal */
.search-modal {
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass-xl);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Search Header */
.search-header {
  padding: var(--spacing-4);
  border-b: 1px solid var(--border-subtle);
  background: var(--surface-base);
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  transition: all var(--duration-fast) var(--easing-ease);
}

.search-input-container:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.search-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-lg);
  color: var(--text-primary-600);
  outline: none;
  font-family: var(--font-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-shortcuts {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.search-kbd {
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  min-width: 24px;
  text-align: center;
}

/* Search Content */
.search-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: var(--spacing-2) 0;
}

.search-content::-webkit-scrollbar {
  width: 6px;
}

.search-content::-webkit-scrollbar-track {
  background: transparent;
}

.search-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

/* Search Sections */
.search-section {
  padding: var(--spacing-4);
  border-b: 1px solid var(--border-subtle);
}

.search-section:last-child {
  border-b: none;
}

.search-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-count {
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}

.section-action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
}

.section-action:hover {
  background: var(--color-primary-bg);
}

/* Search Results */
.search-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  position: relative;
}

.search-result-item:hover,
.result-highlighted {
  background: var(--surface-elevated);
  transform: translateX(2px);
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.result-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--spacing-1);
}

.result-path {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.result-actions {
  display: flex;
  gap: var(--spacing-1);
}

.favorite-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.favorite-btn:hover {
  background: var(--surface-hover);
  color: var(--color-primary);
}

.favorite-btn.is-favorite {
  color: var(--color-error);
}

/* Quick Access Items */
.quick-access-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.quick-access-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  position: relative;
}

.quick-access-item:hover {
  background: var(--surface-elevated);
  transform: translateX(2px);
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-0-5);
}

.item-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Category Grid */
.category-grid {
  @apply compact-grid;
  gap: var(--spacing-2);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-4) var(--spacing-2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  border: 1px solid var(--border-subtle);
  background: var(--surface-base);
}

.category-item:hover {
  background: var(--surface-elevated);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-2);
}

.category-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Shortcuts Grid */
.shortcuts-grid {
  @apply compact-grid;
  gap: var(--spacing-2);
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-2);
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-1);
}

.shortcut-keys kbd {
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  min-width: 20px;
  text-align: center;
}

.shortcut-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* No Results */
.no-results {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
  color: var(--text-secondary);
}

.no-results-icon {
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.no-results-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-2);
  color: var(--text-secondary);
}

.no-results-suggestion {
  font-size: var(--font-size-sm);
  margin-bottom: 0;
}

/* Search Loading */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) var(--spacing-4);
  gap: var(--spacing-4);
}

.search-loading p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .search-overlay {
    padding: var(--spacing-4);
  }

  .search-modal {
    max-height: 90vh;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
