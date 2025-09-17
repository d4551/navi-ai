<template>
  <div class="portfolio-filters">
    <!-- Main Filter Bar -->
    <div class="filter-bar">
      <!-- Search - Primary Action -->
      <div class="search-section">
        <div class="search-input-wrapper ui-input ui-size-md">
          <AppIcon name="mdi-magnify" />
          <input
            v-model="searchQuery"
            type="text"
            class="search-input ui-input ui-size-md"
            placeholder="Search portfolio items..."
          />
          <button
            v-if="hasActiveFilters"
            class="clear-filters-btn"
            title="Clear all filters"
            @click="clearAllFilters"
          >
            <AppIcon name="mdi-close-circle-outline" context="error" />
          </button>
        </div>
      </div>

      <!-- Compact Filter Controls -->
      <div class="filter-controls">
        <!-- Quick Filters Dropdown -->
        <div class="filter-dropdown">
          <button
            class="filter-trigger"
            :class="{ active: hasActiveFilters }"
            @click="showFilterMenu = !showFilterMenu"
          >
            <AppIcon name="mdi-filter-variant" />
            <span class="filter-label">Filters</span>
            <span v-if="activeFilterCount > 0" class="filter-count">{{
              activeFilterCount
            }}</span>
            <AppIcon
              name="mdi-chevron-down"
              class="chevron"
              :class="{ rotated: showFilterMenu }"
            />
          </button>

          <!-- Filter Dropdown Menu -->
          <div v-show="showFilterMenu" class="filter-menu">
            <div class="filter-group">
              <label class="filter-group-label">Type</label>
              <div class="filter-options">
                <button
                  v-for="type in typeOptions"
                  :key="type.value"
                  :class="[
                    'filter-option',
                    { active: filterType === type.value },
                  ]"
                  @click="
                    filterType = filterType === type.value ? '' : type.value
                  "
                >
                  <AppIcon :name="type.icon" />
                  <span>{{ type.label }}</span>
                </button>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-group-label">Sort</label>
              <div class="filter-options">
                <button
                  v-for="sort in sortOptions"
                  :key="sort.value"
                  :class="[
                    'filter-option',
                    { active: sortMode === sort.value },
                  ]"
                  @click="sortMode = sort.value"
                >
                  <AppIcon :name="sort.icon" />
                  <span>{{ sort.label }}</span>
                </button>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-group-label">Options</label>
              <div class="filter-options">
                <button
                  :class="['filter-option', { active: showFeaturedOnly }]"
                  @click="showFeaturedOnly = !showFeaturedOnly"
                >
                  <AppIcon name="mdi-star" context="achievement" />
                  <span>Featured Only</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Toggle -->
        <div class="layout-toggle">
          <button
            v-for="layoutOpt in layoutOptions"
            :key="layoutOpt.value"
            :class="['layout-btn', { active: layout === layoutOpt.value }]"
            :title="layoutOpt.title"
            @click="layout = layoutOpt.value"
          >
            <AppIcon :name="layoutOpt.icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Active Skill Filters - Show only when selected -->
    <div v-if="skillFilters.length > 0" class="active-filters">
      <div class="active-filters-label">Skills:</div>
      <div class="active-filter-tags">
        <button
          v-for="skill in skillFilters"
          :key="skill"
          class="filter-tag"
          @click="removeSkillFilter(skill)"
        >
          <span>{{ skill }}</span>
          <AppIcon name="mdi-close-circle-outline" context="error" />
        </button>
      </div>
    </div>

    <!-- Skill Filters - Collapsible -->
    <div v-if="topSkills.length > 0" class="skill-filters-section">
      <button
        class="skill-filters-toggle"
        @click="showSkillFilters = !showSkillFilters"
      >
        <AppIcon name="mdi-tag-multiple-outline" />
        <span>Filter by Skills</span>
        <AppIcon
          name="mdi-chevron-down"
          class="chevron"
          :class="{ rotated: showSkillFilters }"
        />
      </button>

      <div v-show="showSkillFilters" class="skill-filters-grid">
        <button
          v-for="{ skill } in topSkills.slice(0, 12)"
          :key="skill"
          :class="[
            'skill-filter-btn',
            { active: skillFilters.includes(skill) },
          ]"
          @click="toggleSkillFilter(skill)"
        >
          {{ skill }}
        </button>
        <button
          v-if="topSkills.length > 12"
          class="skill-filter-btn show-more"
          @click="showAllSkills = !showAllSkills"
        >
          {{ showAllSkills ? 'Show Less' : `+${topSkills.length - 12} More` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const _props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  filterType: {
    type: String,
    default: '',
  },
  sortMode: {
    type: String,
    default: 'recent',
  },
  layout: {
    type: String,
    default: 'grid',
  },
  showFeaturedOnly: {
    type: Boolean,
    default: false,
  },
  skillFilters: {
    type: Array,
    default: () => [],
  },
  topSkills: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:filterType',
  'update:sortMode',
  'update:layout',
  'update:showFeaturedOnly',
  'update:skillFilters',
])

// Local reactive state
const showFilterMenu = ref(false)
const showSkillFilters = ref(false)
const showAllSkills = ref(false)

// Filter options
const typeOptions = [
  { value: 'achievement', label: 'Achievements', icon: 'mdi-trophy' },
  { value: 'clip', label: 'Video Clips', icon: 'mdi-play-circle' },
  { value: 'tournament', label: 'Tournaments', icon: 'mdi-tournament' },
  { value: 'leadership', label: 'Leadership', icon: 'mdi-account-group' },
  { value: 'content', label: 'Content', icon: 'mdi-video' },
  { value: 'project', label: 'Projects', icon: 'mdi-rocket-launch' },
]

const sortOptions = [
  { value: 'recent', label: 'Most Recent', icon: 'mdi-clock-outline' },
  {
    value: 'alphabetical',
    label: 'A-Z',
    icon: 'mdi-sort-alphabetical-ascending',
  },
  { value: 'type', label: 'By Type', icon: 'mdi-shape' },
  { value: 'featured', label: 'Featured First', icon: 'mdi-star' },
]

// Layout options for the button group
const layoutOptions = [
  { value: 'grid', label: 'Grid', icon: 'mdi-grid', title: 'Grid Layout' },
  {
    value: 'list',
    label: 'List',
    icon: 'mdi-format-list-bulleted',
    title: 'List Layout',
  },
  {
    value: 'timeline',
    label: 'Timeline',
    icon: 'mdi-timeline',
    title: 'Timeline Layout',
  },
]

const searchQuery = computed({
  get: () => props.searchQuery,
  set: value => emit('update:searchQuery', value),
})

const filterType = computed({
  get: () => props.filterType,
  set: value => emit('update:filterType', value),
})

const sortMode = computed({
  get: () => props.sortMode,
  set: value => emit('update:sortMode', value),
})

const layout = computed({
  get: () => props.layout,
  set: value => emit('update:layout', value),
})

const showFeaturedOnly = computed({
  get: () => props.showFeaturedOnly,
  set: value => emit('update:showFeaturedOnly', value),
})

const skillFilters = computed({
  get: () => props.skillFilters,
  set: value => emit('update:skillFilters', value),
})

// Computed properties for filter state
const hasActiveFilters = computed(() => {
  return (
    !!searchQuery.value ||
    !!filterType.value ||
    showFeaturedOnly.value ||
    skillFilters.value.length > 0
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterType.value) count++
  if (showFeaturedOnly.value) count++
  if (sortMode.value !== 'recent') count++
  return count
})

// Methods
function toggleSkillFilter(skill) {
  const newFilters = [...skillFilters.value]
  const index = newFilters.indexOf(skill)

  if (index > -1) {
    newFilters.splice(index, 1)
  } else {
    newFilters.push(skill)
  }

  emit('update:skillFilters', newFilters)
}

function removeSkillFilter(skill) {
  const newFilters = skillFilters.value.filter(s => s !== skill)
  emit('update:skillFilters', newFilters)
}

function clearAllFilters() {
  emit('update:searchQuery', '')
  emit('update:filterType', '')
  emit('update:showFeaturedOnly', false)
  emit('update:skillFilters', [])
  emit('update:sortMode', 'recent')

  // Close dropdown
  showFilterMenu.value = false
}
</script>

<style scoped>
.portfolio-filters {
  background: var(--glass-surface);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  padding: 1rem;
  margin-bottom: 1.5rem;
}

/* Main filter bar layout */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Search section - primary focus */
.search-section {
  flex: 1;
  min-width: 240px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.search-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  z-index: 2;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-filters-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-filters-btn:hover {
  background: var(--color-danger);
  color: white;
}

/* Filter controls */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Filter dropdown */
.filter-dropdown {
  position: relative;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-trigger:hover,
.filter-trigger.active {
  background: var(--glass-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-count {
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 1.25rem;
  text-align: center;
}

.chevron {
  transition: transform var(--transition-fast);
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* Filter dropdown menu */
.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  min-width: 280px;
  z-index: 1000;
  backdrop-filter: blur(var(--glass-backdrop-blur));
  box-shadow: var(--shadow-lg);
  margin-top: 0.5rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.5rem;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-option:hover {
  background: var(--glass-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-option.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Layout toggle */
.layout-toggle {
  display: flex;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.layout-btn {
  background: transparent;
  border: none;
  padding: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-right: 1px solid var(--glass-border);
}

.layout-btn:last-child {
  border-right: none;
}

.layout-btn:hover {
  background: var(--glass-surface);
  color: var(--color-primary);
}

.layout-btn.active {
  background: var(--color-primary);
  color: white;
}

/* Active filters display */
.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.active-filters-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.active-filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tag:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* Collapsible skill filters */
.skill-filters-section {
  margin-top: 1rem;
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
}

.skill-filters-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0.5rem 0;
}

.skill-filters-toggle:hover {
  color: var(--color-primary);
}

.skill-filters-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skill-filter-btn {
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.skill-filter-btn:hover {
  background: var(--glass-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.skill-filter-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.skill-filter-btn.show-more {
  background: var(--color-info);
  border-color: var(--color-info);
  color: white;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-section {
    min-width: unset;
  }

  .filter-controls {
    justify-content: space-between;
  }

  .filter-menu {
    left: 0;
    right: 0;
    min-width: unset;
  }

  .layout-toggle {
    flex: 1;
  }

  .layout-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
