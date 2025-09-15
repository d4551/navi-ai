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
            <span>{{ activeFiltersCount }} filter{{ activeFiltersCount === 1 ? '' : 's' }} active</span>
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
        <select v-model="selectedType" class="filter-select glass-input" aria-label="Filter by type" @change="updateFilters">
          <option value="">All Types</option>
          <option value="project">Projects</option>
          <option value="game">Games</option>
          <option value="tool">Tools</option>
          <option value="demo">Demos</option>
          <option value="showcase">Showcases</option>
        </select>

        <!-- Sort Options -->
        <select v-model="sortBy" class="filter-select glass-input" aria-label="Sort portfolio" @change="updateSort">
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="alphabetical">A to Z</option>
          <option value="featured">Featured First</option>
          <option value="updated">Last Updated</option>
        </select>

        <!-- Featured Toggle -->
        <div class="toggle-group glass-surface">
          <label class="toggle-switch">
            <input v-model="featuredOnly" type="checkbox" @change="updateFilters" />
            <span class="toggle-slider"></span>
          </label>
          <label class="toggle-label">Featured</label>
        </div>

        <!-- Analytics Toggle -->
        <div class="toggle-group glass-surface">
          <label class="toggle-switch">
            <input v-model="showAnalytics" type="checkbox" @change="toggleAnalytics" />
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
      <div v-if="showSkillProgress && selectedSkills.length > 0" class="skill-progress glass-surface">
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
          {{ showAllSkills ? 'Show Less' : `Show ${remainingSkillsCount} More Skills` }}
        </UnifiedButton>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  skills: {
    type: Array,
    default: () => []
  },
  initialViewMode: {
    type: String,
    default: 'grid'
  },
  showSkillsSection: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'update:search',
  'update:filters', 
  'update:sort',
  'update:view-mode',
  'toggle-analytics',
  'open-ai-tools'
])

// Store
const store = useAppStore()
const themeName = computed(() => store.theme || 'dark')

// Reactive state
const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('recent')
const featuredOnly = ref(false)
const showAnalytics = ref(false)
const viewMode = ref(props.initialViewMode)

// Skills state
const skillSearchQuery = ref('')
const activeSkillCategory = ref('all')
const selectedSkills = ref([])
const showAllSkills = ref(false)
const showSkillProgress = ref(true)

// Search placeholder
const searchPlaceholder = computed(() => {
  const examples = [
    'Search projects, skills, or keywords...',
    'Find your gaming projects...',
    'Search by technology or skill...'
  ]
  return examples[Math.floor(Math.random() * examples.length)]
})

// Filtered projects
const filteredProjects = computed(() => {
  let filtered = [...props.projects]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(project => 
      project.title?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      project.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  if (selectedType.value) {
    filtered = filtered.filter(project => project.type === selectedType.value)
  }
  
  if (featuredOnly.value) {
    filtered = filtered.filter(project => project.featured)
  }
  
  if (selectedSkills.value.length > 0) {
    filtered = filtered.filter(project => 
      project.skillIds?.some(id => selectedSkills.value.includes(id))
    )
  }
  
  return filtered
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (selectedType.value) count++
  if (featuredOnly.value) count++
  if (selectedSkills.value.length > 0) count += selectedSkills.value.length
  return count
})

// Match score (simulated)
const matchScore = computed(() => {
  const baseScore = 75
  const searchBonus = searchQuery.value ? 10 : 0
  const filterBonus = activeFiltersCount.value * 5
  return Math.min(100, baseScore + searchBonus + filterBonus)
})

// Skill categories
const skillCategories = computed(() => [
  { key: 'all', label: 'All Skills', count: props.skills.length },
  { key: 'technical', label: 'Technical', count: props.skills.filter(s => s.category === 'technical').length },
  { key: 'gaming', label: 'Gaming', count: props.skills.filter(s => s.category === 'gaming').length },
  { key: 'creative', label: 'Creative', count: props.skills.filter(s => s.category === 'creative').length },
  { key: 'soft', label: 'Soft Skills', count: props.skills.filter(s => s.category === 'soft').length }
])

// Filtered skills
const filteredSkills = computed(() => {
  let filtered = [...props.skills]
  
  if (activeSkillCategory.value !== 'all') {
    filtered = filtered.filter(skill => skill.category === activeSkillCategory.value)
  }
  
  if (skillSearchQuery.value) {
    const query = skillSearchQuery.value.toLowerCase()
    filtered = filtered.filter(skill => skill.name.toLowerCase().includes(query))
  }
  
  if (!showAllSkills.value) {
    filtered = filtered.slice(0, 10)
  }
  
  return filtered
})

// Skills state
const activeSkillsCount = computed(() => selectedSkills.value.length)

const selectedSkillsData = computed(() => 
  props.skills.filter(skill => selectedSkills.value.includes(skill.id))
)

const hasMoreSkills = computed(() => {
  const totalSkills = activeSkillCategory.value === 'all' 
    ? props.skills.length 
    : props.skills.filter(s => s.category === activeSkillCategory.value).length
  return totalSkills > 10
})

const remainingSkillsCount = computed(() => {
  const totalSkills = activeSkillCategory.value === 'all' 
    ? props.skills.length 
    : props.skills.filter(s => s.category === activeSkillCategory.value).length
  return Math.max(0, totalSkills - 10)
})

// Methods
const updateSearch = () => {
  emit('update:search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  updateSearch()
}

const updateFilters = () => {
  emit('update:filters', {
    type: selectedType.value,
    featured: featuredOnly.value,
    skills: selectedSkills.value
  })
}

const updateSort = () => {
  emit('update:sort', sortBy.value)
}

const setViewMode = (mode) => {
  viewMode.value = mode
  emit('update:view-mode', mode)
}

const toggleAnalytics = () => {
  emit('toggle-analytics', showAnalytics.value)
}

const openAITools = () => {
  emit('open-ai-tools')
}

// Skills methods
const setSkillCategory = (category) => {
  activeSkillCategory.value = category
}

const toggleSkill = (skillId) => {
  const index = selectedSkills.value.indexOf(skillId)
  if (index === -1) {
    selectedSkills.value.push(skillId)
  } else {
    selectedSkills.value.splice(index, 1)
  }
  updateFilters()
}

const removeSkill = (skillId) => {
  const index = selectedSkills.value.indexOf(skillId)
  if (index !== -1) {
    selectedSkills.value.splice(index, 1)
    updateFilters()
  }
}

const clearAllSkills = () => {
  selectedSkills.value = []
  updateFilters()
}

const filterSkills = () => {
  // Filtering is handled by computed property
}

const toggleShowAllSkills = () => {
  showAllSkills.value = !showAllSkills.value
}

// Watchers
watch(() => props.initialViewMode, (newMode) => {
  viewMode.value = newMode
})

// Initialize
onMounted(() => {
  updateFilters()
})
</script>

<style scoped>
/* Portfolio Topbar - Glassmorphic Design */
.portfolio-topbar {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  transition: all var(--duration-normal);
}

/* Header Section */
.topbar-header {
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-5);
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.03) 0%, 
    rgba(var(--color-gaming-500-rgb, 168, 85, 247), 0.03) 100%);
  border-bottom: 1px solid var(--glass-border);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal);
}

.results-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.stat-group {
  text-align: center;
}

.result-count {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, 
    var(--color-primary-500) 0%, 
    var(--color-gaming-500) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  transition: all var(--duration-normal);
}

.result-count.match-score {
  font-size: var(--font-size-lg);
}

.result-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
  transition: color var(--duration-normal);
}

.filter-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1-5) var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-primary-500);
  font-weight: var(--font-weight-medium);
}

/* Primary Controls */
.primary-controls {
  display: grid;
  grid-template-columns: 2fr repeat(2, 1fr) auto auto auto auto;
  gap: var(--spacing-3);
  align-items: center;
}

/* Search Group */
.search-group {
  position: relative;
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 var(--spacing-12) 0 var(--spacing-12);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 
    var(--glass-shadow),
    0 0 0 4px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1);
  transform: translateY(-2px);
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  transition: all var(--duration-normal);
  font-size: var(--font-size-lg);
}

.search-clear {
  position: absolute;
  right: var(--spacing-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: var(--font-size-lg);
}

.search-clear:hover {
  color: var(--color-primary-500);
  transform: translateY(-50%) scale(1.2) rotate(90deg);
}

.search-input:focus ~ .search-icon {
  color: var(--color-primary-500);
  transform: translateY(-50%) scale(1.1);
}

/* Filter Select */
.filter-select {
  height: 48px;
  padding: 0 var(--spacing-10) 0 var(--spacing-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%236366f1' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  background-size: 20px;
}

.filter-select:hover {
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.3);
  transform: translateY(-1px);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1);
}

/* Toggle Groups */
.toggle-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2-5);
  padding: var(--spacing-2-5) var(--spacing-3-5);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.toggle-group:hover {
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.2);
  transform: translateY(-1px);
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--surface-tertiary);
  transition: all var(--duration-normal) cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: all var(--duration-normal) cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
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
  color: var(--color-primary-500);
  font-weight: var(--font-weight-semibold);
}

/* View Toggle */
.view-toggle-group {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.view-toggle-group:hover {
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.2);
}

/* AI Tools Button */
.ai-tools-btn {
  position: relative;
  overflow: hidden;
}

.ai-tools-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
  transform: rotate(45deg);
  transition: all var(--duration-slow);
  opacity: 0;
}

.ai-tools-btn:hover::before {
  animation: shine 0.5s ease;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); opacity: 0; }
}

.ai-sparkle {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: var(--color-warning-500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  animation: sparkle 2s infinite;
  box-shadow: 0 2px 8px rgba(var(--color-warning-500-rgb, 245, 158, 11), 0.6);
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

/* Skills Section */
.skills-section {
  padding: var(--spacing-6);
  background: linear-gradient(to bottom, 
    rgba(var(--glass-bg-rgb, 248, 249, 250), 0.5) 0%, 
    rgba(255, 255, 255, 0) 100%);
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
}

.skills-title-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.skills-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  transition: color var(--duration-normal);
}

.active-filters-count {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  color: white;
  padding: var(--spacing-1) var(--spacing-2-5);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.skills-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.skill-search {
  position: relative;
}

.skill-search-input {
  padding: var(--spacing-1-5) var(--spacing-8) var(--spacing-1-5) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  outline: none;
  width: 180px;
  transition: all var(--duration-normal);
}

.skill-search-input:focus {
  width: 220px;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1);
}

.skill-search-icon {
  position: absolute;
  right: var(--spacing-2-5);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* Skill Categories */
.skill-categories {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--glass-border);
  overflow-x: auto;
}

.category-tab {
  padding: var(--spacing-1-5) var(--spacing-3-5);
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
  color: var(--color-primary-500);
}

.category-tab.active {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  color: white;
  box-shadow: var(--shadow-glow-primary);
}

.tab-count {
  margin-left: var(--spacing-1);
  opacity: 0.7;
  font-size: var(--font-size-xs);
}

/* Skill Chips */
.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2-5);
  margin-bottom: var(--spacing-4);
}

.skill-chip {
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: var(--spacing-2-5) var(--spacing-4);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal) cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  position: relative;
  overflow: hidden;
}

.skill-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1), 
    transparent);
  transition: left var(--duration-slow) ease;
}

.skill-chip:hover::before {
  left: 100%;
}

.skill-chip:hover {
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.3);
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-glow-primary);
}

.skill-chip.active {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-glow-primary);
  animation: chipActivate 0.3s ease;
}

@keyframes chipActivate {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.skill-chip-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  color: var(--color-primary-500);
}

.skill-chip.active .skill-chip-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.chip-count {
  background: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1);
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
}

.skill-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.skill-chip-remove {
  margin-left: var(--spacing-1);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.skill-chip.active:hover .skill-chip-remove {
  opacity: 1;
}

/* Skill Progress */
.skill-progress {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-5);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}

.skill-progress-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1-5);
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
  color: var(--color-primary-500);
  font-weight: var(--font-weight-semibold);
}

.skill-progress-bar {
  height: 6px;
  background: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.1);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.skill-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-gaming-500) 100%);
  border-radius: var(--radius-sm);
  transition: width var(--duration-slow) ease;
  position: relative;
  overflow: hidden;
}

.skill-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Expand Section */
.expand-section {
  text-align: center;
  padding: var(--spacing-3);
}

.expand-btn {
  transition: all var(--duration-normal);
}

.expand-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-primary);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .primary-controls {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }

  .stats-bar {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .skills-header {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }

  .skills-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .skill-search-input,
  .skill-search-input:focus {
    width: 100%;
  }

  .skill-categories {
    overflow-x: auto;
    padding-bottom: var(--spacing-2);
  }

  .skill-progress {
    grid-template-columns: 1fr;
  }

  .primary-controls {
    grid-template-columns: 1fr;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .portfolio-topbar {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="dark"] .topbar-header {
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05) 0%, 
    rgba(var(--color-gaming-500-rgb, 168, 85, 247), 0.05) 100%);
}
</style>