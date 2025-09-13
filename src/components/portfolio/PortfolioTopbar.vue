<template>
  <nav class="portfolio-topbar" :data-theme="themeName">
    <!-- Header Section with Stats -->
    <div class="topbar-header">
      <!-- Results and Stats Bar -->
      <div class="stats-bar glass-surface">
        <div class="results-info">
          <div class="stat-group">
            <div class="result-count">{{ filteredProjects.length }}</div>
            <div class="result-label">Projects Found</div>
          </div>
          <div v-if="activeFiltersCount > 0" class="filter-status">
            <AppIcon name="mdi-filter" />
            <span>{{ activeFiltersCount }} filter{{
              activeFiltersCount === 1 ? "" : "s"
            }}
              active</span>
          </div>
        </div>
        <div class="results-info">
          <div class="stat-group">
            <div class="result-count match-score">{{ matchScore }}%</div>
            <div class="result-label">Match Score</div>
          </div>
        </div>
      </div>

      <!-- Primary Controls Row -->
      <div class="primary-controls">
        <!-- Enhanced Search Bar -->
        <div class="search-group">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input glass-input"
            :placeholder="searchPlaceholder"
            :aria-label="searchPlaceholder"
            @input="updateSearch"
          />
          <AppIcon name="mdi-magnify" class="search-icon" />
          <AppIcon
            v-if="searchQuery"
            name="mdi-close-circle"
            class="search-clear"
            @click="clearSearch"
          />
        </div>

        <!-- Type Filter -->
        <select
          v-model="selectedType"
          class="filter-select glass-input"
          aria-label="Filter by type"
          @change="updateFilters"
        >
          <option value="">All Types</option>
          <option value="project">Projects</option>
          <option value="game">Games</option>
          <option value="tool">Tools</option>
          <option value="demo">Demos</option>
          <option value="showcase">Showcases</option>
        </select>

        <!-- Sort Options -->
        <select
          v-model="sortBy"
          class="filter-select glass-input"
          aria-label="Sort portfolio"
          @change="updateSort"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="alphabetical">A to Z</option>
          <option value="featured">Featured First</option>
          <option value="updated">Last Updated</option>
        </select>

        <!-- Featured Toggle -->
        <div class="toggle-group glass-surface">
          <label class="toggle-switch">
            <input
              v-model="featuredOnly"
              type="checkbox"
              @change="updateFilters"
            />
            <span class="toggle-slider"></span>
          </label>
          <label class="toggle-label">Featured</label>
        </div>

        <!-- Analytics Toggle -->
        <div class="toggle-group glass-surface">
          <label class="toggle-switch">
            <input
              v-model="showAnalytics"
              type="checkbox"
              @change="toggleAnalytics"
            />
            <span class="toggle-slider"></span>
          </label>
          <label class="toggle-label">Analytics</label>
        </div>

        <!-- View Mode -->
        <div class="view-toggle-group glass-surface">
          <UnifiedButton
            :variant="viewMode === 'grid' ? 'primary' : 'glass'"
            size="sm"
            icon-only
            icon="mdi-view-grid"
            aria-label="Grid view"
            :class="{ active: viewMode === 'grid' }"
            @click="setViewMode('grid')"
          />
          <UnifiedButton
            :variant="viewMode === 'list' ? 'primary' : 'glass'"
            size="sm"
            icon-only
            icon="mdi-view-list"
            aria-label="List view"
            :class="{ active: viewMode === 'list' }"
            @click="setViewMode('list')"
          />
        </div>

        <!-- AI Tools -->
        <UnifiedButton
          variant="primary"
          size="sm"
          leading-icon="mdi-robot"
          class="ai-tools-btn"
          @click="openAITools"
        >
          <span>AI Tools</span>
          <div class="ai-sparkle">
            <AppIcon name="mdi-star" />
          </div>
        </UnifiedButton>
      </div>
    </div>

    <!-- Advanced Skills Section -->
    <div v-if="showSkillsSection" class="skills-section">
      <div class="skills-header">
        <div class="skills-title-group">
          <div class="skills-title">
            <AppIcon name="mdi-tag-multiple" />
            Filter by Skills
          </div>
          <div v-if="activeSkillsCount > 0" class="active-filters-count">
            {{ activeSkillsCount }} Active
          </div>
        </div>
        <div class="skills-actions">
          <div class="skill-search">
            <input
              v-model="skillSearchQuery"
              type="text"
              class="skill-search-input glass-input"
              placeholder="Search skills..."
              @input="filterSkills"
            />
            <AppIcon name="mdi-magnify" class="skill-search-icon" />
          </div>
          <UnifiedButton
            v-if="activeSkillsCount > 0"
            variant="glass"
            size="sm"
            leading-icon="mdi-close"
            @click="clearAllSkills"
          >
            Clear All
          </UnifiedButton>
        </div>
      </div>

      <!-- Skill Categories -->
      <div class="skill-categories">
        <button
          v-for="category in skillCategories"
          :key="category.key"
          class="category-tab glass-surface"
          :class="{ active: activeSkillCategory === category.key }"
          @click="setSkillCategory(category.key)"
        >
          {{ category.label }}
          <span class="tab-count">({{ category.count }})</span>
        </button>
      </div>

      <!-- Enhanced Skill Chips -->
      <div class="skill-chips">
        <button
          v-for="skill in filteredSkills"
          :key="skill.id"
          class="skill-chip glass-surface"
          :class="{ active: selectedSkills.includes(skill.id) }"
          @click="toggleSkill(skill.id)"
        >
          <span class="skill-chip-icon">
            <AppIcon :name="skill.icon || 'mdi-tag'" />
          </span>
          {{ skill.name }}
          <span class="chip-count">{{ skill.projectCount }}</span>
          <AppIcon
            v-if="selectedSkills.includes(skill.id)"
            name="mdi-close"
            class="skill-chip-remove"
            @click.stop="removeSkill(skill.id)"
          />
        </button>
      </div>

      <!-- Skill Progress Visualization -->
      <div
        v-if="showSkillProgress && selectedSkills.length > 0"
        class="skill-progress glass-surface"
      >
        <div
          v-for="skill in selectedSkillsData"
          :key="skill.id"
          class="skill-progress-item"
        >
          <div class="skill-progress-header">
            <span class="skill-progress-name">{{ skill.name }}</span>
            <span class="skill-progress-value">{{ skill.proficiency }}%</span>
          </div>
          <div class="skill-progress-bar">
            <div
              class="skill-progress-fill"
              :style="{ width: skill.proficiency + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Expand Section -->
      <div v-if="hasMoreSkills" class="expand-section">
        <UnifiedButton
          variant="ghost"
          size="sm"
          :leading-icon="showAllSkills ? 'mdi-minus-circle' : 'mdi-plus-circle'"
          class="expand-btn"
          @click="toggleShowAllSkills"
        >
          {{
            showAllSkills
              ? "Show Less"
              : `Show ${remainingSkillsCount} More Skills`
          }}
        </UnifiedButton>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

import { ref, computed, watch} from "vue";
import { useAppStore } from "@/stores/app";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
const _props = defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
  skills: {
    type: Array,
    default: () => [],
  },
  initialViewMode: {
    type: String,
    default: "grid",
  },
  showSkillsSection: {
    type: Boolean,
    default: true,
  },
});

// Emits
const _emit = defineEmits([
  "update:search",
  "update:filters",
  "update:sort",
  "update:view-mode",
  "toggle-analytics",
  "open-ai-tools",
]);

// Store
const store = useAppStore();
const themeName = computed(() => store.theme || "dark");

// Reactive state
const searchQuery = ref("");
const selectedType = ref("");
const sortBy = ref("recent");
const featuredOnly = ref(false);
const showAnalytics = ref(false);
const viewMode = ref(props.initialViewMode);

// Skills state
const skillSearchQuery = ref("");
const activeSkillCategory = ref("all");
const selectedSkills = ref([]);
const showAllSkills = ref(false);
const showSkillProgress = ref(true);

// Search placeholder
const searchPlaceholder = computed(() => {
  const examples = [
    "Search projects, skills, or keywords...",
    "Find your gaming projects...",
    "Search by technology or skill...",
  ];
  return examples[Math.floor(Math.random() * examples.length)];
});

// Filtered projects
const filteredProjects = computed(() => {
  let filtered = [...props.projects];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.skills?.some((skill) => skill.toLowerCase().includes(query)) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter(
      (project) => project.type === selectedType.value,
    );
  }

  if (featuredOnly.value) {
    filtered = filtered.filter((project) => project.featured);
  }

  if (selectedSkills.value.length > 0) {
    filtered = filtered.filter((project) =>
      project.skillIds?.some((id) => selectedSkills.value.includes(id)),
    );
  }

  return filtered;
});

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0;
  if (searchQuery.value) count++;
  if (selectedType.value) count++;
  if (featuredOnly.value) count++;
  if (selectedSkills.value.length > 0) count += selectedSkills.value.length;
  return count;
});

// Match score (simulated)
const matchScore = computed(() => {
  const baseScore = 75;
  const searchBonus = searchQuery.value ? 10 : 0;
  const filterBonus = activeFiltersCount.value * 5;
  return Math.min(100, baseScore + searchBonus + filterBonus);
});

// Skill categories
const skillCategories = computed(() => [
  { key: "all", label: "All Skills", count: props.skills.length },
  {
    key: "technical",
    label: "Technical",
    count: props.skills.filter((s) => s.category === "technical").length,
  },
  {
    key: "gaming",
    label: "Gaming",
    count: props.skills.filter((s) => s.category === "gaming").length,
  },
  {
    key: "creative",
    label: "Creative",
    count: props.skills.filter((s) => s.category === "creative").length,
  },
  {
    key: "soft",
    label: "Soft Skills",
    count: props.skills.filter((s) => s.category === "soft").length,
  },
]);

// Filtered skills
const filteredSkills = computed(() => {
  let filtered = [...props.skills];

  if (activeSkillCategory.value !== "all") {
    filtered = filtered.filter(
      (skill) => skill.category === activeSkillCategory.value,
    );
  }

  if (skillSearchQuery.value) {
    const query = skillSearchQuery.value.toLowerCase();
    filtered = filtered.filter((skill) =>
      skill.name.toLowerCase().includes(query),
    );
  }

  if (!showAllSkills.value) {
    filtered = filtered.slice(0, 10);
  }

  return filtered;
});

// Skills state
const activeSkillsCount = computed(() => selectedSkills.value.length);

const selectedSkillsData = computed(() =>
  props.skills.filter((skill) => selectedSkills.value.includes(skill.id)),
);

const hasMoreSkills = computed(() => {
  const totalSkills =
    activeSkillCategory.value === "all"
      ? props.skills.length
      : props.skills.filter((s) => s.category === activeSkillCategory.value)
          .length;
  return totalSkills > 10;
});

const remainingSkillsCount = computed(() => {
  const totalSkills =
    activeSkillCategory.value === "all"
      ? props.skills.length
      : props.skills.filter((s) => s.category === activeSkillCategory.value)
          .length;
  return Math.max(0, totalSkills - 10);
});

// Methods
const updateSearch = () => {
  emit("update:search", searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = "";
  updateSearch();
};

const updateFilters = () => {
  emit("update:filters", {
    type: selectedType.value,
    featured: featuredOnly.value,
    skills: selectedSkills.value,
  });
};

const updateSort = () => {
  emit("update:sort", sortBy.value);
};

const setViewMode = (mode) => {
  viewMode.value = mode;
  emit("update:view-mode", mode);
};

const toggleAnalytics = () => {
  emit("toggle-analytics", showAnalytics.value);
};

const openAITools = () => {
  emit("open-ai-tools");
};

// Skills methods
const setSkillCategory = (category) => {
  activeSkillCategory.value = category;
};

const toggleSkill = (skillId) => {
  const index = selectedSkills.value.indexOf(skillId);
  if (index === -1) {
    selectedSkills.value.push(skillId);
  } else {
    selectedSkills.value.splice(index, 1);
  }
  updateFilters();
};

const removeSkill = (skillId) => {
  const index = selectedSkills.value.indexOf(skillId);
  if (index !== -1) {
    selectedSkills.value.splice(index, 1);
    updateFilters();
  }
};

const clearAllSkills = () => {
  selectedSkills.value = [];
  updateFilters();
};

const filterSkills = () => {
  // Filtering is handled by computed property
};

const toggleShowAllSkills = () => {
  showAllSkills.value = !showAllSkills.value;
};

// Watchers
watch(
  () => props.initialViewMode,
  (newMode) => {
    viewMode.value = newMode;
  },
);

// Initialize
onMounted(() => {
  updateFilters();
});
</script>

<style scoped>
.portfolio-topbar {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  position: relative;
  transition: all var(--duration-normal);
}

.topbar-header {
  background: linear-gradient(
  );
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal);
}

.results-info {
  display: flex;
  align-items: center;
}

.stat-group {
  text-align: center;
}

.result-count {
  font-weight: var(--font-weight-bold);
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all var(--duration-normal);
}

.result-count.match-score {
  font-size: var(--font-size-lg);
}

.result-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: color var(--duration-normal);
}

.filter-status {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.primary-controls {
  display: grid;
  align-items: center;
}

.search-group {
  position: relative;
}

.search-input {
  border-radius: var(--radius-xl);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal);
  outline: none;
}

.search-input:focus {
  box-shadow:
    var(--glass-shadow),
}

.search-icon {
  position: absolute;
  color: var(--text-tertiary);
  pointer-events: none;
  transition: all var(--duration-normal);
  font-size: var(--font-size-lg);
}

.search-clear {
  position: absolute;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: var(--font-size-lg);
}

.search-clear:hover {
}

.search-input:focus ~ .search-icon {
}

.filter-select {
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
  appearance: none;
  background-repeat: no-repeat;
}

.filter-select:hover {
}

.filter-select:focus {
  outline: none;
}

.toggle-group {
  display: flex;
  align-items: center;
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.toggle-group:hover {
}

.toggle-switch {
  position: relative;
}

.toggle-switch input {
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  background: var(--surface-tertiary);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  background: white;
  box-shadow: var(--shadow-sm);
}

input:checked + .toggle-slider {
  background: linear-gradient(
  );
}

input:checked + .toggle-slider:before {
}

.toggle-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  user-select: none;
  transition: all var(--duration-fast);
  cursor: pointer;
}

input:checked ~ .toggle-label {
  font-weight: var(--font-weight-semibold);
}

.view-toggle-group {
  display: flex;
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.view-toggle-group:hover {
}

.ai-tools-btn {
  position: relative;
  overflow: hidden;
}

.ai-tools-btn::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: all var(--duration-slow);
}

.ai-tools-btn:hover::before {
}

@keyframes shine {
  }
  }
  }
}

.ai-sparkle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
}

@keyframes sparkle {
  }
  }
}

.skills-section {
  background: linear-gradient(
    to bottom,
  );
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skills-title-group {
  display: flex;
  align-items: center;
}

.skills-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  transition: color var(--duration-normal);
}

.active-filters-count {
  background: linear-gradient(
  );
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

@keyframes slideIn {
  from {
  }
  to {
  }
}

.skills-actions {
  display: flex;
  align-items: center;
}

.skill-search {
  position: relative;
}

.skill-search-input {
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  outline: none;
  transition: all var(--duration-normal);
}

.skill-search-input:focus {
}

.skill-search-icon {
  position: absolute;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.skill-categories {
  display: flex;
  overflow-x: auto;
}

.category-tab {
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  position: relative;
  white-space: nowrap;
}

.category-tab:hover {
  background: var(--glass-hover-bg);
}

.category-tab.active {
  background: linear-gradient(
  );
  color: white;
  box-shadow: var(--shadow-glow-primary);
}

.tab-count {
  font-size: var(--font-size-xs);
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
}

.skill-chip {
  color: var(--text-primary);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.skill-chip::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: left var(--duration-slow) ease;
}

.skill-chip:hover::before {
}

.skill-chip:hover {
  box-shadow: var(--shadow-glow-primary);
}

.skill-chip.active {
  background: linear-gradient(
  );
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-glow-primary);
}

@keyframes chipActivate {
  }
  }
  }
}

.skill-chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
}

.skill-chip.active .skill-chip-icon {
  color: white;
}

.chip-count {
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.skill-chip.active .chip-count {
  color: white;
}

.skill-chip-remove {
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.skill-chip.active:hover .skill-chip-remove {
}

.skill-progress {
  display: grid;
  border-radius: var(--radius-lg);
}

.skill-progress-item {
  display: flex;
  flex-direction: column;
}

.skill-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-progress-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.skill-progress-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.skill-progress-bar {
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.skill-progress-fill {
  background: linear-gradient(
  );
  border-radius: var(--radius-sm);
  transition: width var(--duration-slow) ease;
  position: relative;
  overflow: hidden;
}

.skill-progress-fill::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
}

@keyframes shimmer {
  }
  }
}

.expand-section {
  text-align: center;
}

.expand-btn {
  transition: all var(--duration-normal);
}

.expand-btn:hover {
  box-shadow: var(--shadow-glow-primary);
}

  .primary-controls {
  }

  .stats-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}

  .skills-header {
    flex-direction: column;
    align-items: stretch;
  }

  .skills-actions {
    flex-direction: column;
  }

  .skill-search-input,
  .skill-search-input:focus {
  }

  .skill-categories {
    overflow-x: auto;
  }

  .skill-progress {
  }

  .primary-controls {
  }
}

[data-theme="dark"] .portfolio-topbar {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="dark"] .topbar-header {
  background: linear-gradient(
  );
}
</style>
