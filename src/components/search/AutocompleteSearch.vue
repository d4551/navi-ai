<!--
  AutocompleteSearch - Gaming Industry Search Component
  Provides intelligent search with autocomplete for studios, roles, and technologies
-->

<template>
  <div class="autocomplete-search" :class="{ 'focused': isFocused, 'has-results': hasResults }">
    <div class="search-input-wrapper ui-input ui-size-md">
      <div class="search-input-container ui-input ui-size-md">
        <AppIcon name="mdi-magnify" aria-hidden="true" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="search-input ui-input ui-size-md"
          :placeholder="placeholder"
          :disabled="disabled"
          :aria-expanded="hasResults"
          :aria-activedescendant="selectedIndex >= 0 ? `option-${selectedIndex}` : undefined"
          role="combobox"
          aria-autocomplete="list"
          :aria-label="ariaLabel"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.arrow-down.prevent="navigateResults(1)"
          @keydown.arrow-up.prevent="navigateResults(-1)"
          @keydown.enter.prevent="selectResult"
          @keydown.escape.prevent="clearResults"
        />
        <button
          v-if="searchQuery"
          class="clear-button"
          type="button"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <AppIcon name="mdi-close-circle-outline" context="error" />
        </button>
        <div v-if="isLoading" class="loading-indicator">
          <AppIcon name="mdi-loading" class="mdi-spin" aria-hidden="true" />
        </div>
      </div>
      
      <div v-if="showFilters" class="quick-filters">
        <button
          v-for="filter in quickFilters"
          :key="filter.id"
          class="quick-filter"
          :class="{ 'active': activeFilters.includes(filter.id) }"
          type="button"
          @click="toggleFilter(filter.id)"
        >
          <AppIcon :name="filter.icon" />
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Search Results Dropdown -->
    <Teleport to="body">
      <div
        v-if="hasResults && isFocused"
        ref="dropdownEl"
        class="search-dropdown"
        :style="dropdownStyles"
        role="listbox"
        :aria-label="`Search results for ${searchQuery}`"
      >
        <div class="results-container">
          <!-- No Results -->
          <div v-if="!results.length && searchQuery.trim()" class="no-results">
            <AppIcon name="mdi-magnify-scan" aria-hidden="true" />
            <p>No results found for "{{ searchQuery }}"</p>
            <small>Try adjusting your search terms or filters</small>
          </div>

          <!-- Results by Category -->
          <div v-else class="results-sections">
            <div
              v-for="(categoryResults, category) in groupedResults"
              :key="category"
              class="result-section"
            >
              <div class="section-header">
                <AppIcon :name="getCategoryIcon(category)" aria-hidden="true" />
                <span class="section-title">{{ formatCategoryName(category) }}</span>
                <span class="section-count">{{ categoryResults.length }}</span>
              </div>
              
              <div class="section-results">
                <div
                  v-for="(_result, index) in categoryResults"
                  :id="`option-${getGlobalIndex(category, index)}`"
                  :key="`${category}-${result.value}`"
                  class="result-item"
                  :class="{ 'selected': selectedIndex === getGlobalIndex(category, index) }"
                  role="option"
                  :aria-selected="selectedIndex === getGlobalIndex(category, index)"
                  @click="selectOption(result)"
                  @mouseenter="selectedIndex = getGlobalIndex(category, index)"
                >
                  <div class="result-content">
                    <div class="result-main">
                      <span class="result-label">{{ result.label }}</span>
                      <span v-if="result.category !== category" class="result-type">
                        {{ result.category }}
                      </span>
                    </div>
                    <div v-if="result.description" class="result-description">
                      {{ result.description }}
                    </div>
                  </div>
                  <div class="result-action">
                    <AppIcon name="mdi-arrow-right" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Tips -->
          <div v-if="!searchQuery.trim()" class="search-tips">
            <div class="tip-section">
              <h4 class="tip-title">
                <AppIcon name="mdi-lightbulb-on" aria-hidden="true" />
                Search Tips
              </h4>
              <ul class="tip-list">
                <li>Search by studio name (e.g., "Riot Games", "Blizzard")</li>
                <li>Find roles (e.g., "Game Designer", "Software Engineer")</li>
                <li>Look for technologies (e.g., "Unity", "Unreal Engine")</li>
                <li>Use filters to narrow down results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { searchService } from '@/shared/services/SearchService';
import type { AutocompleteOption } from '@/shared/types/interview';

interface Props {
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  maxResults?: number;
  showFilters?: boolean;
  debounceMs?: number;
  modelValue?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'select', option: AutocompleteOption): void;
  (e: 'search', query: string, filters: string[]): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search studios, roles, or technologies...',
  ariaLabel: 'Search gaming industry data',
  disabled: false,
  maxResults: 10,
  showFilters: true,
  debounceMs: 300,
  modelValue: ''
});

const _emit = defineEmits<Emits>();

// Reactive state
const searchInput = ref<HTMLInputElement>();
const dropdownEl = ref<HTMLElement>();
const searchQuery = ref(props.modelValue);
const isFocused = ref(false);
const isLoading = ref(false);
const selectedIndex = ref(-1);
const results = ref<AutocompleteOption[]>([]);
const activeFilters = ref<string[]>([]);
const dropdownStyles = ref<Record<string, string>>({});

// Search debounce timer
let searchTimer: NodeJS.Timeout | null = null;

// Quick filters for common searches
const quickFilters = ref([
  { id: 'studios', label: 'Studios', icon: 'mdi-domain' },
  { id: 'roles', label: 'Roles', icon: 'mdi-account-tie' },
  { id: 'technologies', label: 'Tech', icon: 'mdi-code-tags' },
  { id: 'aaa', label: 'AAA', icon: 'mdi-star' },
  { id: 'indie', label: 'Indie', icon: 'mdi-heart' }
]);

// Computed properties
const hasResults = computed(() => results.value.length > 0 || searchQuery.value.trim().length > 0);

const groupedResults = computed(() => {
  const groups: Record<string, AutocompleteOption[]> = {};
  
  results.value.forEach(result => {
    const category = result.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(_result);
  });
  
  return groups;
});

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== searchQuery.value) {
    searchQuery.value = newValue;
  }
});

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  emit('update:modelValue', newQuery);
  debouncedSearch(newQuery);
});

// Methods
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
}

function handleFocus() {
  isFocused.value = true;
  if (searchQuery.value.trim()) {
    performSearch(searchQuery.value);
  }
  updateDropdownPosition();
}

function handleBlur() {
  // Delay hiding to allow click events on results
  setTimeout(() => {
    isFocused.value = false;
    selectedIndex.value = -1;
  }, 200);
}

function debouncedSearch(query: string) {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  
  searchTimer = setTimeout(() => {
    performSearch(query);
  }, props.debounceMs);
}

async function performSearch(query: string) {
  if (!query.trim()) {
    results.value = [];
    return;
  }

  isLoading.value = true;
  
  try {
    // Use the new async method with semantic search capabilities
    const searchResults = await searchService.getAutocompleteOptions(query, props.maxResults);
    
    // Apply active filters
    let filteredResults = searchResults;
    if (activeFilters.value.length > 0) {
      filteredResults = searchResults.filter(result => {
        if (activeFilters.value.includes('studios') && result.category === 'studio') return true;
        if (activeFilters.value.includes('roles') && result.category === 'role') return true;
        if (activeFilters.value.includes('technologies') && result.category === 'technology') return true;
        return false;
      });
    }
    
    results.value = filteredResults;
    selectedIndex.value = -1;
    
    emit('search', query, activeFilters.value);
    
    await nextTick();
    updateDropdownPosition();
  } catch (error) {
    console.error('Search failed:', error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
}

function clearSearch() {
  searchQuery.value = '';
  results.value = [];
  selectedIndex.value = -1;
  searchInput.value?.focus();
  emit('clear');
}

function clearResults() {
  isFocused.value = false;
  selectedIndex.value = -1;
}

function navigateResults(direction: number) {
  if (!hasResults.value) return;
  
  const totalResults = results.value.length;
  if (totalResults === 0) return;
  
  selectedIndex.value = Math.max(-1, Math.min(totalResults - 1, selectedIndex.value + direction));
  
  // Scroll selected item into view
  if (selectedIndex.value >= 0) {
    const selectedElement = document.getElementById(`option-${selectedIndex.value}`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }
}

function selectResult() {
  if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
    selectOption(results.value[selectedIndex.value]);
  }
}

function selectOption(option: AutocompleteOption) {
  searchQuery.value = option.label;
  results.value = [];
  isFocused.value = false;
  selectedIndex.value = -1;
  
  emit('select', option);
  searchInput.value?.blur();
}

function toggleFilter(filterId: string) {
  const index = activeFilters.value.indexOf(filterId);
  if (index >= 0) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(filterId);
  }
  
  // Re-run search with new filters
  if (searchQuery.value.trim()) {
    performSearch(searchQuery.value);
  }
}

function updateDropdownPosition() {
  if (!searchInput.value || !dropdownEl.value) return;
  
  const inputRect = searchInput.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dropdownHeight = Math.min(400, viewportHeight * 0.6);
  
  const spaceBelow = viewportHeight - inputRect.bottom;
  const spaceAbove = inputRect.top;
  
  const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
  
  dropdownStyles.value = {
    position: 'fixed',
    left: `${inputRect.left}px`,
    width: `${inputRect.width}px`,
    maxHeight: `${dropdownHeight}px`,
    zIndex: '1000',
    ...(showAbove 
      ? { bottom: `${viewportHeight - inputRect.top}px` }
      : { top: `${inputRect.bottom}px` }
    )
  };
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    studio: 'mdi mdi-domain',
    role: 'mdi mdi-account-tie', 
    technology: 'mdi mdi-code-tags',
    location: 'mdi mdi-map-marker'
  };
  return icons[category] || 'mdi mdi-circle';
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    studio: 'Studios',
    role: 'Roles',
    technology: 'Technologies', 
    location: 'Locations'
  };
  return names[category] || category;
}

function getGlobalIndex(category: string, localIndex: number): number {
  let globalIndex = 0;
  
  for (const [cat, categoryResults] of Object.entries(groupedResults.value)) {
    if (cat === category) {
      return globalIndex + localIndex;
    }
    globalIndex += categoryResults.length;
  }
  
  return localIndex;
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', updateDropdownPosition);
  window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  window.removeEventListener('scroll', updateDropdownPosition);
  window.removeEventListener('resize', updateDropdownPosition);
});

// Expose public methods
defineExpose({
  focus: () => searchInput.value?.focus(),
  blur: () => searchInput.value?.blur(),
  clear: clearSearch
});
</script>

<style scoped>
.autocomplete-search {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-tertiary);
  font-size: 1.25rem;
  z-index: 2;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-md) calc(var(--spacing-xl) + 1.25rem);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--glass-surface-light);
  backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 0.5));
  font-size: var(--font-size-md);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--glass-elevated-light);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-button, .loading-indicator {
  position: absolute;
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--text-tertiary);
  font-size: 1rem;
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.clear-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.quick-filters {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.quick-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.quick-filter:hover {
  background: var(--glass-elevated-light);
  border-color: var(--color-primary);
}

.quick-filter.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.quick-filter i {
  font-size: 0.875rem;
}

/* Dropdown Styles */
.search-dropdown {
  background: var(--glass-surface-light);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  border: 1px solid var(--glass-border-light);
  border-radius: var(--border-radius-md);
  box-shadow: var(--glass-shadow-elevated);
  overflow: hidden;
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-container {
  max-height: 400px;
  overflow-y: auto;
}

.no-results {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.no-results p {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.no-results small {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.results-sections {
  display: flex;
  flex-direction: column;
}

.result-section {
  border-bottom: 1px solid var(--border-color);
}

.result-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.section-header i {
  color: var(--color-primary);
  width: 16px;
}

.section-title {
  flex: 1;
}

.section-count {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.section-results {
  display: flex;
  flex-direction: column;
}

.result-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-bottom: 1px solid transparent;
}

.result-item:hover,
.result-item.selected {
  background: var(--glass-elevated-light);
  border-bottom-color: var(--border-color);
}

.result-item.selected {
  background: var(--color-primary-bg);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-2xs);
}

.result-label {
  font-weight: 500;
  color: var(--text-primary);
}

.result-type {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.result-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-action {
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.result-item:hover .result-action,
.result-item.selected .result-action {
  opacity: 1;
  color: var(--color-primary);
}

.search-tips {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.tip-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.tip-title i {
  color: var(--color-primary);
}

.tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.tip-list li {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding-left: var(--spacing-md);
  position: relative;
}

.tip-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

/* Dark theme adaptations */
[data-theme="dark"] .search-input,
[data-theme="dark"] .search-dropdown {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .search-input:focus {
  background: var(--glass-elevated-dark);
}

[data-theme="dark"] .section-header,
[data-theme="dark"] .search-tips {
  background: var(--dark-bg-tertiary);
}

[data-theme="dark"] .quick-filter {
  background: var(--dark-bg-tertiary);
}

[data-theme="dark"] .result-item:hover,
[data-theme="dark"] .result-item.selected {
  background: var(--glass-elevated-dark);
}

/* Responsive design */
@media (max-width: 768px) {
  .search-dropdown {
    left: var(--spacing-md) !important;
    right: var(--spacing-md);
    width: auto !important;
  }
  
  .quick-filters {
    justify-content: center;
  }
  
  .result-main {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2xs);
  }
}
</style>
