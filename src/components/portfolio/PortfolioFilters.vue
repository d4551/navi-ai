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
          {{ showAllSkills ? "Show Less" : `+${topSkills.length - 12} More` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineEmits, defineProps } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

const props = defineProps({
  searchQuery: {
    type: String,
    default: "",
  },
  filterType: {
    type: String,
    default: "",
  },
  sortMode: {
    type: String,
    default: "recent",
  },
  layout: {
    type: String,
    default: "grid",
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
});

const emit = defineEmits([
  "update:searchQuery",
  "update:filterType",
  "update:sortMode",
  "update:layout",
  "update:showFeaturedOnly",
  "update:skillFilters",
]);

// Local reactive state
const showFilterMenu = ref(false);
const showSkillFilters = ref(false);
const showAllSkills = ref(false);

// Filter options
const typeOptions = [
  { value: "achievement", label: "Achievements", icon: "mdi-trophy" },
  { value: "clip", label: "Video Clips", icon: "mdi-play-circle" },
  { value: "tournament", label: "Tournaments", icon: "mdi-tournament" },
  { value: "leadership", label: "Leadership", icon: "mdi-account-group" },
  { value: "content", label: "Content", icon: "mdi-video" },
  { value: "project", label: "Projects", icon: "mdi-rocket-launch" },
];

const sortOptions = [
  { value: "recent", label: "Most Recent", icon: "mdi-clock-outline" },
  {
    value: "alphabetical",
    label: "A-Z",
    icon: "mdi-sort-alphabetical-ascending",
  },
  { value: "type", label: "By Type", icon: "mdi-shape" },
  { value: "featured", label: "Featured First", icon: "mdi-star" },
];

// Layout options for the button group
const layoutOptions = [
  { value: "grid", label: "Grid", icon: "mdi-grid", title: "Grid Layout" },
  {
    value: "list",
    label: "List",
    icon: "mdi-format-list-bulleted",
    title: "List Layout",
  },
  {
    value: "timeline",
    label: "Timeline",
    icon: "mdi-timeline",
    title: "Timeline Layout",
  },
];

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit("update:searchQuery", value),
});

const filterType = computed({
  get: () => props.filterType,
  set: (value) => emit("update:filterType", value),
});

const sortMode = computed({
  get: () => props.sortMode,
  set: (value) => emit("update:sortMode", value),
});

const layout = computed({
  get: () => props.layout,
  set: (value) => emit("update:layout", value),
});

const showFeaturedOnly = computed({
  get: () => props.showFeaturedOnly,
  set: (value) => emit("update:showFeaturedOnly", value),
});

const skillFilters = computed({
  get: () => props.skillFilters,
  set: (value) => emit("update:skillFilters", value),
});

// Computed properties for filter state
const hasActiveFilters = computed(() => {
  return (
    !!searchQuery.value ||
    !!filterType.value ||
    showFeaturedOnly.value ||
    skillFilters.value.length > 0
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filterType.value) count++;
  if (showFeaturedOnly.value) count++;
  if (sortMode.value !== "recent") count++;
  return count;
});

// Methods
function toggleSkillFilter(skill) {
  const newFilters = [...skillFilters.value];
  const index = newFilters.indexOf(skill);

  if (index > -1) {
    newFilters.splice(index, 1);
  } else {
    newFilters.push(skill);
  }

  emit("update:skillFilters", newFilters);
}

function removeSkillFilter(skill) {
  const newFilters = skillFilters.value.filter((s) => s !== skill);
  emit("update:skillFilters", newFilters);
}

function clearAllFilters() {
  emit("update:searchQuery", "");
  emit("update:filterType", "");
  emit("update:showFeaturedOnly", false);
  emit("update:skillFilters", []);
  emit("update:sortMode", "recent");

  // Close dropdown
  showFilterMenu.value = false;
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

.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.search-section {
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--glass-elevated);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.search-input-wrapper:focus-within {
  border-color: var(--color-primary);
}

.search-icon {
  position: absolute;
  color: var(--text-muted);
}

.search-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-filters-btn {
  position: absolute;
  background: none;
  border: none;
  color: var(--text-muted);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-filters-btn:hover {
  background: var(--color-danger);
  color: white;
}

.filter-controls {
  display: flex;
  align-items: center;
}

.filter-dropdown {
  position: relative;
}

.filter-trigger {
  display: flex;
  align-items: center;
  background: var(--glass-elevated);
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
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
  text-align: center;
}

.chevron {
  transition: transform var(--transition-fast);
}

.chevron.rotated {
}

.filter-menu {
  position: absolute;
  background: var(--glass-surface);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  box-shadow: var(--shadow-lg);
}

.filter-group {
}

.filter-group:last-child {
}

.filter-group-label {
  color: var(--text-muted);
  text-transform: uppercase;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
}

.filter-option {
  display: flex;
  align-items: center;
  background: var(--glass-elevated);
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
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

.layout-toggle {
  display: flex;
  background: var(--glass-elevated);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.layout-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
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

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.active-filters-label {
  color: var(--text-secondary);
}

.active-filter-tags {
  display: flex;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tag:hover {
  background: var(--color-primary-dark);
}

.skill-filters-section {
}

.skill-filters-toggle {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.skill-filters-toggle:hover {
  color: var(--color-primary);
}

.skill-filters-grid {
  display: flex;
  flex-wrap: wrap;
}

@keyframes slideDown {
  from {
  }
  to {
  }
}

.skill-filter-btn {
  background: var(--glass-elevated);
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.skill-filter-btn:hover {
  background: var(--glass-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
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
}

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    min-width: unset;
  }

  .filter-controls {
    justify-content: space-between;
  }

  .filter-menu {
    min-width: unset;
  }

  .layout-toggle {
  }

  .layout-btn {
    justify-content: center;
  }
}
</style>
