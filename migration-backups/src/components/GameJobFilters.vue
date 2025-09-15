<!--
  CANONICAL Game Industry Job Search Filters
  Advanced filtering specifically tailored for gaming industry job seekers
-->
<template>
  <div class="game-job-filters">
    <div class="filters-header d-flex align-items-center justify-content-between mb-3">
      <h5 class="filters-title mb-0">
        <AppIcon name="mdi-filter-variant" class="me-2" />
        Filter Gaming Jobs
      </h5>
      <div class="filter-actions d-flex gap-2">
        <UnifiedButton
          variant="outline"
          size="sm"
          :disabled="!hasActiveFilters"
          leading-icon="mdi-filter-remove"
          @click="resetFilters"
        >
          Clear All
        </UnifiedButton>
        <UnifiedButton
          variant="outline"
          size="sm"
          :leading-icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="toggleExpanded"
        >
          {{ isExpanded ? 'Less' : 'More' }}
        </UnifiedButton>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="active-filters mb-3">
      <div class="active-filters-list d-flex flex-wrap gap-1">
        <span
          v-for="filter in activeFilters"
          :key="filter.key"
          class="active-filter-tag badge bg-primary"
        >
          {{ filter.label }}
          <button
            class="btn-close btn-close-white ms-1 ui-btn ui-size-md"
            :aria-label="`Remove ${filter.label} filter`"
            @click="removeFilter(filter.key, filter.value)"
          ></button>
        </span>
      </div>
    </div>

    <!-- Quick Filters (Always Visible) -->
    <div class="quick-filters row g-2 mb-3">
      <div class="col-md-6">
        <label for="role-category-select" class="form-label">Role Category</label>
        <select
          id="role-category-select"
          v-model="filters.roleCategory"
          class="form-select"
          @change="updateFilters"
        >
          <option value="">All Categories</option>
          <option v-for="category in roleCategories" :key="category" :value="category">
            {{ category }} ({{ getRoleCategoryCount(category) }} roles)
          </option>
        </select>
      </div>

      <div class="col-md-6">
        <label for="experience-level-select" class="form-label">Experience Level</label>
        <select
          id="experience-level-select"
          v-model="filters.experienceLevel"
          class="form-select"
          @change="updateFilters"
        >
          <option value="">Any Level</option>
          <option value="entry">Entry Level (0-2 years)</option>
          <option value="junior">Junior (2-4 years)</option>
          <option value="mid">Mid-Level (4-7 years)</option>
          <option value="senior">Senior (7-12 years)</option>
          <option value="principal">Principal (12+ years)</option>
          <option value="director">Director/Lead</option>
        </select>
      </div>
    </div>

    <!-- Expanded Filters -->
    <div v-if="isExpanded" class="expanded-filters">
      <div class="row g-3 mb-3">
        <!-- Studio Type -->
        <div class="col-md-4">
          <label class="form-label">Studio Type</label>
          <div class="filter-checkboxes">
            <div v-for="type in studioTypes" :key="type.value" class="form-check">
              <input
                :id="`studio-type-${type.value}`"
                v-model="filters.studioTypes"
                class="form-check-input"
                type="checkbox"
                :value="type.value"
                @change="updateFilters"
              />
              <label :for="`studio-type-${type.value}`" class="form-check-label">
                {{ type.label }} <span class="text-muted">({{ type.count }})</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Company Size -->
        <div class="col-md-4">
          <label class="form-label">Company Size</label>
          <div class="filter-checkboxes">
            <div v-for="size in companySizes" :key="size.value" class="form-check">
              <input
                :id="`company-size-${size.value}`"
                v-model="filters.companySizes"
                class="form-check-input"
                type="checkbox"
                :value="size.value"
                @change="updateFilters"
              />
              <label :for="`company-size-${size.value}`" class="form-check-label">
                {{ size.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Remote Work -->
        <div class="col-md-4">
          <label class="form-label">Work Style</label>
          <div class="filter-checkboxes">
            <div class="form-check">
              <input
                id="remote-work"
                v-model="filters.remoteWork"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="remote-work" class="form-check-label">
                Remote Work Available
              </label>
            </div>
            <div class="form-check">
              <input
                id="hybrid-work"
                v-model="filters.hybridWork"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="hybrid-work" class="form-check-label">
                Hybrid Options
              </label>
            </div>
            <div class="form-check">
              <input
                id="on-site-only"
                v-model="filters.onSiteOnly"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="on-site-only" class="form-check-label">
                On-site Only
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Technology & Skills -->
      <div class="row g-3 mb-3">
        <div class="col-12">
          <label class="form-label">Technologies & Skills</label>
          <div class="technology-filter">
            <input
              v-model="technologySearch"
              type="text"
              class="form-control mb-2"
              placeholder="Search technologies (Unity, Unreal, C++, etc.)"
              @input="filterTechnologies"
            />
            <div class="tech-tags-container">
              <div class="tech-categories">
                <div v-for="(techs, category) in filteredTechnologies" :key="category" class="tech-category mb-2">
                  <h6 class="tech-category-title">{{ category }}</h6>
                  <div class="tech-tags d-flex flex-wrap gap-1">
                    <label
                      v-for="tech in techs"
                      :key="tech"
                      class="tech-tag-label"
                      :class="{ active: filters.technologies.includes(tech) }"
                    >
                      <input
                        v-model="filters.technologies"
                        type="checkbox"
                        :value="tech"
                        class="d-none"
                        @change="updateFilters"
                      />
                      <span class="tech-tag">{{ tech }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Salary Range -->
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label for="min-salary" class="form-label">Minimum Salary</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input
              id="min-salary"
              v-model.number="filters.minSalary"
              type="number"
              class="form-control"
              placeholder="80000"
              step="5000"
              min="0"
              @input="updateFilters"
            />
          </div>
        </div>
        <div class="col-md-6">
          <label for="max-salary" class="form-label">Maximum Salary</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input
              id="max-salary"
              v-model.number="filters.maxSalary"
              type="number"
              class="form-control"
              placeholder="200000"
              step="5000"
              min="0"
              @input="updateFilters"
            />
          </div>
        </div>
      </div>

      <!-- Location & Region -->
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Regions</label>
          <div class="filter-checkboxes">
            <div v-for="region in regions" :key="region" class="form-check">
              <input
                :id="`region-${region.toLowerCase().replace(/\s+/g, '-')}`"
                v-model="filters.regions"
                class="form-check-input"
                type="checkbox"
                :value="region"
                @change="updateFilters"
              />
              <label :for="`region-${region.toLowerCase().replace(/\s+/g, '-')}`" class="form-check-label">
                {{ region }}
              </label>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <label for="specific-location" class="form-label">Specific Location</label>
          <input
            id="specific-location"
            v-model="filters.specificLocation"
            type="text"
            class="form-control"
            placeholder="San Francisco, CA"
            @input="updateFilters"
          />
        </div>
      </div>

      <!-- Special Filters -->
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Special Preferences</label>
          <div class="special-filters d-flex flex-wrap gap-3">
            <div class="form-check">
              <input
                id="featured-only"
                v-model="filters.featuredOnly"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="featured-only" class="form-check-label">
                <AppIcon name="mdi-star" color="warning" context="achievement" />
                Featured Jobs Only
              </label>
            </div>

            <div class="form-check">
              <input
                id="new-grad-friendly"
                v-model="filters.newGradFriendly"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="new-grad-friendly" class="form-check-label">
                <AppIcon name="mdi-school" class="text-info me-1" />
                New Grad Friendly
              </label>
            </div>

            <div class="form-check">
              <input
                id="visa-sponsorship"
                v-model="filters.visaSponsorship"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="visa-sponsorship" class="form-check-label">
                <AppIcon name="mdi-airplane" class="text-primary me-1" />
                Visa Sponsorship
              </label>
            </div>

            <div class="form-check">
              <input
                id="diversity-focused"
                v-model="filters.diversityFocused"
                class="form-check-input"
                type="checkbox"
                @change="updateFilters"
              />
              <label for="diversity-focused" class="form-check-label">
                <AppIcon name="mdi-account-group" color="success" />
                Diversity & Inclusion Focus
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="filters-footer mt-3 pt-3 border-top">
      <div class="d-flex align-items-center justify-content-between">
        <div class="results-count">
          <span class="fw-semibold">{{ resultsCount }}</span>
          <span class="text-muted">gaming jobs found</span>
        </div>
        <div class="sort-options">
          <label for="sort-select" class="form-label visually-hidden">Sort by</label>
          <select
            id="sort-select"
            v-model="filters.sortBy"
            class="form-select form-select-sm"
            @change="updateFilters"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="date">Sort: Date Posted</option>
            <option value="salary-high">Sort: Salary High-Low</option>
            <option value="salary-low">Sort: Salary Low-High</option>
            <option value="company-a-z">Sort: Company A-Z</option>
            <option value="match-score">Sort: Match Score</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import {
  ROLE_CATEGORIES,
  STUDIO_CATEGORIES,
  TECHNOLOGY_TAGS,
  COMPANY_SIZES,
  REGIONS
} from '@/shared/constants/gaming-studios';

// Props
const _props = defineProps({
  totalJobs: {
    type: Number,
    default: 0
  },
  resultsCount: {
    type: Number,
    default: 0
  }
});

// Emits
const emit = defineEmits(['filters-changed']);

// State
const isExpanded = ref(false);
const technologySearch = ref('');

const filters = reactive({
  roleCategory: '',
  experienceLevel: '',
  studioTypes: [],
  companySizes: [],
  remoteWork: false,
  hybridWork: false,
  onSiteOnly: false,
  technologies: [],
  minSalary: null,
  maxSalary: null,
  regions: [],
  specificLocation: '',
  featuredOnly: false,
  newGradFriendly: false,
  visaSponsorship: false,
  diversityFocused: false,
  sortBy: 'relevance'
});

// Computed
const roleCategories = computed(() => Object.keys(ROLE_CATEGORIES));

const studioTypes = computed(() => [
  { value: 'AAA', label: 'AAA Studios', count: STUDIO_CATEGORIES.AAA.length },
  { value: 'Indie', label: 'Indie Studios', count: STUDIO_CATEGORIES.Indie.length },
  { value: 'Mobile', label: 'Mobile Games', count: STUDIO_CATEGORIES.Mobile.length },
  { value: 'VR/AR', label: 'VR/AR Studios', count: STUDIO_CATEGORIES['VR/AR'].length },
  { value: 'Platform', label: 'Platform Companies', count: STUDIO_CATEGORIES.Platform.length },
  { value: 'Esports', label: 'Esports Organizations', count: STUDIO_CATEGORIES.Esports.length }
]);

const companySizes = computed(() => COMPANY_SIZES.map(size => ({
  value: size.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  label: size
})));

const regions = computed(() => REGIONS);

const technologyCategories = computed(() => ({
  'Programming Languages': ['C++', 'C#', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Java', 'Swift', 'Kotlin', 'Lua'],
  'Game Engines': ['Unity', 'Unreal Engine', 'Godot', 'Custom Engine', 'Source Engine'],
  'Graphics APIs': ['DirectX', 'Vulkan', 'OpenGL', 'Metal', 'WebGL'],
  'Platforms': ['PC', 'Console', 'Mobile', 'VR', 'AR', 'Web', 'Switch', 'PlayStation', 'Xbox', 'Steam'],
  'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Kubernetes', 'Docker', 'Git'],
  'Specializations': ['Networking', 'Multiplayer', 'Live Services', 'AI', 'Machine Learning', 'Analytics']
}));

const filteredTechnologies = computed(() => {
  if (!technologySearch.value) {return technologyCategories.value;}

  const search = technologySearch.value.toLowerCase();
  const filtered = {};

  for (const [category, techs] of Object.entries(technologyCategories.value)) {
    const matchingTechs = techs.filter(tech =>
      tech.toLowerCase().includes(search)
    );
    if (matchingTechs.length > 0) {
      filtered[category] = matchingTechs;
    }
  }

  return filtered;
});

const hasActiveFilters = computed(() => {
  return (
    filters.roleCategory ||
    filters.experienceLevel ||
    filters.studioTypes.length > 0 ||
    filters.companySizes.length > 0 ||
    filters.remoteWork ||
    filters.hybridWork ||
    filters.onSiteOnly ||
    filters.technologies.length > 0 ||
    filters.minSalary ||
    filters.maxSalary ||
    filters.regions.length > 0 ||
    filters.specificLocation ||
    filters.featuredOnly ||
    filters.newGradFriendly ||
    filters.visaSponsorship ||
    filters.diversityFocused
  );
});

const activeFilters = computed(() => {
  const active = [];

  if (filters.roleCategory) {
    active.push({ key: 'roleCategory', value: filters.roleCategory, label: filters.roleCategory });
  }

  if (filters.experienceLevel) {
    const levelLabels = {
      entry: 'Entry Level',
      junior: 'Junior',
      mid: 'Mid-Level',
      senior: 'Senior',
      principal: 'Principal',
      director: 'Director'
    };
    active.push({
      key: 'experienceLevel',
      value: filters.experienceLevel,
      label: levelLabels[filters.experienceLevel]
    });
  }

  filters.studioTypes.forEach(type => {
    active.push({ key: 'studioTypes', value: type, label: `${type} Studios` });
  });

  filters.technologies.forEach(tech => {
    active.push({ key: 'technologies', value: tech, label: tech });
  });

  filters.regions.forEach(region => {
    active.push({ key: 'regions', value: region, label: region });
  });

  if (filters.remoteWork) {
    active.push({ key: 'remoteWork', value: true, label: 'Remote Work' });
  }

  if (filters.featuredOnly) {
    active.push({ key: 'featuredOnly', value: true, label: 'Featured Jobs' });
  }

  return active;
});

// Methods
function updateFilters() {
  emit('filters-changed', { ...filters });
}

function resetFilters() {
  Object.assign(filters, {
    roleCategory: '',
    experienceLevel: '',
    studioTypes: [],
    companySizes: [],
    remoteWork: false,
    hybridWork: false,
    onSiteOnly: false,
    technologies: [],
    minSalary: null,
    maxSalary: null,
    regions: [],
    specificLocation: '',
    featuredOnly: false,
    newGradFriendly: false,
    visaSponsorship: false,
    diversityFocused: false,
    sortBy: 'relevance'
  });
  updateFilters();
}

function removeFilter(key, value) {
  if (Array.isArray(filters[key])) {
    const index = filters[key].indexOf(value);
    if (index > -1) {
      filters[key].splice(index, 1);
    }
  } else if (typeof filters[key] === 'boolean') {
    filters[key] = false;
  } else {
    filters[key] = '';
  }
  updateFilters();
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function getRoleCategoryCount(category) {
  return ROLE_CATEGORIES[category]?.length || 0;
}

function filterTechnologies() {
  // This method is called when technology search input changes
  // The computed property filteredTechnologies handles the actual filtering
}

// Watch for technology search changes
watch(technologySearch, (newVal) => {
  if (newVal.length === 0) {
    // Reset technology search
  }
});
</script>

<style scoped>
.game-job-filters {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-title {
  color: var(--text-primary);
  font-weight: 600;
}

.active-filters {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 8px;
  padding: 0.75rem;
}

.active-filter-tag {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
  font-size: 0.7rem;
  opacity: 0.8;
}

.btn-close-white:hover {
  opacity: 1;
}

.filter-checkboxes {
  max-height: 150px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.technology-filter {
  background: var(--surface-base);
  border: 1px solid var(--border-base);
  border-radius: 8px;
  padding: 1rem;
}

.tech-categories {
  max-height: 300px;
  overflow-y: auto;
}

.tech-category-title {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tech-tag-label {
  cursor: pointer;
  margin: 0;
}

.tech-tag {
  display: inline-block;
  background: var(--glass-surface);
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.tech-tag-label:hover .tech-tag {
  background: var(--glass-surface);
  transform: translateY(-1px);
}

.tech-tag-label.active .tech-tag {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
  border-color: var(--color-primary-600);
}

.special-filters .form-check-label {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.filters-footer {
  background: rgba(255, 255, 255, 0.8);
  border-top: 1px solid var(--border-base);
  margin: -0.5rem -1.5rem -1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 0 0 12px 12px;
}

.results-count .fw-semibold {
  color: var(--color-primary-500);
  font-size: 1.1rem;
}

/* Scrollbar styling for filter checkboxes */
.filter-checkboxes::-webkit-scrollbar,
.tech-categories::-webkit-scrollbar {
  width: 6px;
}

.filter-checkboxes::-webkit-scrollbar-track,
.tech-categories::-webkit-scrollbar-track {
  background: var(--glass-surface);
  border-radius: 3px;
}

.filter-checkboxes::-webkit-scrollbar-thumb,
.tech-categories::-webkit-scrollbar-thumb {
  background: var(--glass-surface);
  border-radius: 3px;
}

.filter-checkboxes::-webkit-scrollbar-thumb:hover,
.tech-categories::-webkit-scrollbar-thumb:hover {
  background: var(--glass-surface);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-job-filters {
    padding: 1rem;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filter-actions {
    align-self: stretch;
  }

  .special-filters {
    flex-direction: column;
    gap: 1rem !important;
  }

  .filters-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-footer .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .game-job-filters {
    background: var(--surface-elevated);
    border-color: var(--border-base);
    color: var(--text-primary);
  }

  .filters-title {
    color: var(--text-primary);
  }

  .active-filters {
    background: var(--surface-elevated);
    border-color: var(--border-base);
  }

  .technology-filter {
    background: var(--surface-elevated);
    border-color: var(--border-base);
  }

  .tech-category-title {
    color: var(--text-secondary);
  }

  .form-check-label {
    color: var(--text-secondary);
  }

  .tech-tag {
    background: var(--surface-elevated);
    color: var(--text-secondary);
  }

  .tech-tag-label:hover .tech-tag {
    background: #4b5563;
  }

  .filters-footer {
    background: rgba(17, 24, 39, 0.8);
    border-top-color: var(--border-base);
  }
}
</style>
