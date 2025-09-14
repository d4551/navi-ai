<template>
  <div class="document-templates">
    <div class="templates-header">
      <h3 class="section-title">
        <AppIcon name="mdi-palette-outline" />
        Document Templates
      </h3>
      <div class="header-actions">
        <div class="view-toggle">
          <UnifiedButton
            variant="ghost"
            size="sm"
            :class="{ active: viewMode === 'grid' }"
            leading-icon="mdi-view-grid"
            @click="viewMode = 'grid'"
          >
            Grid
          </UnifiedButton>
          <UnifiedButton
            variant="ghost"
            size="sm"
            :class="{ active: viewMode === 'list' }"
            leading-icon="mdi-view-list"
            @click="viewMode = 'list'"
          >
            List
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Template Categories -->
    <div class="template-categories">
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          <AppIcon :name="category.icon" />
          <span>{{ category.name }}</span>
          <div class="template-count">{{ category.count }}</div>
        </button>
      </div>
    </div>

    <!-- Enhanced Template Options Panel -->
    <div class="template-options-panel glass-card">
      <div class="options-tabs">
        <button 
          v-for="tab in optionTabs"
          :key="tab.id"
          class="option-tab"
          :class="{ active: activeOptionTab === tab.id }"
          @click="activeOptionTab = tab.id"
        >
          <AppIcon :name="tab.icon" />
          {{ tab.name }}
        </button>
      </div>

      <!-- Basic Filters Tab -->
      <div v-if="activeOptionTab === 'filters'" class="option-content">
        <div class="filter-grid">
          <div class="filter-group">
            <label class="filter-label">
              <AppIcon name="mdi-domain" />
              Industry
            </label>
            <select v-model="selectedIndustry" class="filter-select enhanced-glass-input">
              <option value="">All Industries</option>
              <option value="gaming">🎮 Gaming & Entertainment</option>
              <option value="tech">💻 Technology</option>
              <option value="creative">🎨 Creative & Design</option>
              <option value="business">💼 Business & Finance</option>
              <option value="healthcare">🏥 Healthcare</option>
              <option value="education">📚 Education</option>
              <option value="engineering">⚙️ Engineering</option>
              <option value="marketing">📈 Marketing & Sales</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <AppIcon name="mdi-trending-up" />
              Experience Level
            </label>
            <select v-model="selectedLevel" class="filter-select enhanced-glass-input">
              <option value="">All Levels</option>
              <option value="entry">🌱 Entry Level (0-2 years)</option>
              <option value="mid">🌿 Mid Level (3-5 years)</option>
              <option value="senior">🌳 Senior Level (6-10 years)</option>
              <option value="lead">🎯 Lead/Principal (10+ years)</option>
              <option value="executive">👑 Executive/C-Suite</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <AppIcon name="mdi-palette-outline" />
              Visual Style
            </label>
            <select v-model="selectedStyle" class="filter-select enhanced-glass-input">
              <option value="">All Styles</option>
              <option value="modern">✨ Modern & Clean</option>
              <option value="classic">📜 Classic & Professional</option>
              <option value="creative">🎨 Creative & Artistic</option>
              <option value="minimal">⚪ Minimal & Simple</option>
              <option value="bold">⚡ Bold & Dynamic</option>
              <option value="gaming">🎮 Gaming-Focused</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <AppIcon name="mdi-format-columns" />
              Layout Type
            </label>
            <select v-model="selectedLayout" class="filter-select enhanced-glass-input">
              <option value="">All Layouts</option>
              <option value="single-column">📄 Single Column</option>
              <option value="two-column">📰 Two Column</option>
              <option value="sidebar">📋 Sidebar Layout</option>
              <option value="timeline">📅 Timeline Style</option>
              <option value="portfolio">🖼️ Portfolio Grid</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Advanced Options Tab -->
      <div v-if="activeOptionTab === 'advanced'" class="option-content">
        <div class="advanced-options-grid">
          <div class="option-section">
            <h4 class="option-section-title">
              <AppIcon name="mdi-cog-outline" />
              Customization Options
            </h4>
            <div class="option-toggles">
              <div class="toggle-option">
                <input
                  id="ai-optimize"
                  v-model="aiOptimize"
                  type="checkbox"
                  class="glass-toggle"
                />
                <label for="ai-optimize" class="toggle-label">
                  <AppIcon name="mdi-brain" />
                  AI Content Optimization
                  <span class="option-description">Automatically enhance content with AI suggestions</span>
                </label>
              </div>
              
              <div class="toggle-option">
                <input
                  id="ats-friendly"
                  v-model="atsFriendly"
                  type="checkbox"
                  class="glass-toggle"
                />
                <label for="ats-friendly" class="toggle-label">
                  <AppIcon name="mdi-robot-outline" />
                  ATS-Friendly Format
                  <span class="option-description">Optimize for Applicant Tracking Systems</span>
                </label>
              </div>
              
              <div class="toggle-option">
                <input
                  id="gaming-focus"
                  v-model="gamingFocus"
                  type="checkbox"
                  class="glass-toggle"
                />
                <label for="gaming-focus" class="toggle-label">
                  <AppIcon name="mdi-gamepad-variant" />
                  Gaming Industry Focus
                  <span class="option-description">Include gaming-specific sections and terminology</span>
                </label>
              </div>
            </div>
          </div>

          <div class="option-section">
            <h4 class="option-section-title">
              <AppIcon name="mdi-eye-outline" />
              Visual Preferences
            </h4>
            <div class="visual-options">
              <div class="color-scheme-selector">
                <label class="option-label">Color Scheme</label>
                <div class="color-options">
                  <button
                    v-for="color in colorSchemes"
                    :key="color.id"
                    class="color-option"
                    :class="{ active: selectedColorScheme === color.id }"
                    :style="{ background: color.preview }"
                    @click="selectedColorScheme = color.id"
                  >
                    <span class="color-name">{{ color.name }}</span>
                  </button>
                </div>
              </div>
              
              <div class="font-selector">
                <label class="option-label">Typography</label>
                <select v-model="selectedFont" class="enhanced-glass-input">
                  <option value="modern">Modern Sans (Recommended)</option>
                  <option value="classic">Classic Serif</option>
                  <option value="minimal">Minimal Sans</option>
                  <option value="gaming">Gaming Font</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Suggestions Tab -->
      <div v-if="activeOptionTab === 'ai'" class="option-content">
        <div class="ai-suggestions-section">
          <div class="ai-header">
            <AppIcon name="mdi-lightbulb-on" />
            <h4>AI Template Recommendations</h4>
          </div>
          
          <div v-if="loading" class="ai-loading">
            <div class="loading-spinner"></div>
            <span>Analyzing your profile for perfect template matches...</span>
          </div>
          
          <div v-else class="ai-recommendations">
            <div
              v-for="recommendation in aiRecommendations"
              :key="recommendation.id"
              class="recommendation-card"
              @click="selectTemplate(recommendation.templateId)"
            >
              <div class="recommendation-score">
                {{ recommendation.score }}%
              </div>
              <div class="recommendation-content">
                <h5 class="recommendation-title">{{ recommendation.templateName }}</h5>
                <p class="recommendation-reason">{{ recommendation.reason }}</p>
                <div class="recommendation-tags">
                  <span
                    v-for="tag in recommendation.tags"
                    :key="tag"
                    class="recommendation-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <UnifiedButton
                variant="primary"
                size="sm"
                leading-icon="mdi-check"
              >
                Use Template
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Templates Grid/List -->
    <div class="templates-container" :class="viewMode">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        :class="{ 
          selected: selectedTemplate === template.id,
          premium: template.isPremium 
        }"
        @click="selectTemplate(template.id)"
      >
        <!-- Template Preview -->
        <div class="template-preview">
          <div class="preview-image" :class="`preview-${template.id}`">
            <div class="template-overlay">
              <div class="overlay-actions">
                <UnifiedButton
                  variant="ghost"
                  size="xs"
                  leading-icon="mdi-eye"
                  @click.stop="previewTemplate(template)"
                >
                  Preview
                </UnifiedButton>
                <UnifiedButton
                  variant="ghost"
                  size="xs"
                  leading-icon="mdi-heart-outline"
                  @click.stop="toggleFavorite(template)"
                >
                  {{ template.isFavorite ? 'Favorited' : 'Favorite' }}
                </UnifiedButton>
              </div>
            </div>
          </div>
          
          <!-- Premium Badge -->
          <div v-if="template.isPremium" class="premium-badge">
            <AppIcon name="mdi-crown" size="14" />
            <span>Premium</span>
          </div>
          
          <!-- Selection Indicator -->
          <div v-if="selectedTemplate === template.id" class="selection-indicator">
            <AppIcon name="mdi-check-circle" />
          </div>
        </div>

        <!-- Template Info -->
        <div class="template-info">
          <div class="template-header">
            <h4 class="template-name">{{ template.name }}</h4>
            <div class="template-rating">
              <div class="rating-stars">
                <AppIcon
                  v-for="star in 5"
                  :key="star"
                  name="mdi-star"
                  :class="star <= template.rating ? 'filled' : 'empty'"
                />
              </div>
              <span class="rating-text">({{ template.reviewCount }})</span>
            </div>
          </div>
          
          <p class="template-description">{{ template.description }}</p>
          
          <div class="template-features">
            <div class="feature-tags">
              <span class="feature-tag">{{ template.industry }}</span>
              <span class="feature-tag">{{ template.level }}</span>
              <span class="feature-tag">{{ template.style }}</span>
            </div>
          </div>

          <div class="template-stats">
            <div class="stat">
              <AppIcon name="mdi-download" size="14" />
              <span>{{ template.downloads }}</span>
            </div>
            <div class="stat">
              <AppIcon name="mdi-clock-outline" size="14" />
              <span>{{ template.estimatedTime }}</span>
            </div>
          </div>

          <!-- Template Actions -->
          <div class="template-actions">
            <UnifiedButton
              v-if="selectedTemplate !== template.id"
              variant="primary"
              size="sm"
              @click.stop="selectTemplate(template.id)"
            >
              Use Template
            </UnifiedButton>
            <UnifiedButton
              v-else
              variant="outline"
              size="sm"
              leading-icon="mdi-check"
              disabled
            >
              Selected
            </UnifiedButton>
            
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-information-outline"
              @click.stop="showTemplateDetails(template)"
            >
              Details
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!filteredTemplates.length" class="empty-state">
        <AppIcon name="mdi-file-search-outline" size="64" />
        <h4>No templates found</h4>
        <p>Try adjusting your filters to find more templates.</p>
        <UnifiedButton
          variant="outline"
          size="sm"
          @click="clearFilters"
        >
          Clear Filters
        </UnifiedButton>
      </div>
    </div>

    <!-- Custom Template Option -->
    <div class="custom-template-section">
      <div class="custom-template-card">
        <div class="custom-header">
          <AppIcon name="mdi-plus-circle" size="24" />
          <h4>Create Custom Template</h4>
        </div>
        <p>Start with a blank template and create your own unique design.</p>
        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-plus"
          @click="createCustomTemplate"
        >
          Start Custom
        </UnifiedButton>
      </div>
    </div>

    <!-- Template Preview Modal -->
    <TemplatePreviewModal
      v-if="showPreviewModal"
      :show="showPreviewModal"
      :template="previewingTemplate"
      :document-type="documentType"
      @close="showPreviewModal = false"
      @select="handleTemplateSelection"
    />

    <!-- Template Details Modal -->
    <TemplateDetailsModal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :template="detailsTemplate"
      @close="showDetailsModal = false"
      @select="handleTemplateSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import TemplatePreviewModal from './TemplatePreviewModal.vue'
import TemplateDetailsModal from './TemplateDetailsModal.vue'

// Props
const props = defineProps<{
  documentType: 'resume' | 'cover-letter'
  selectedTemplate: string
}>()

// Emits
const emit = defineEmits<{
  'template-select': [string]
}>()

const toast = useToast()

// State
const viewMode = ref<'grid' | 'list'>('grid')
const activeCategory = ref('all')
const activeOptionTab = ref('filters')
const selectedIndustry = ref('')
const selectedLevel = ref('')
const selectedStyle = ref('')
const selectedLayout = ref('')
const selectedColorScheme = ref('default')
const selectedFont = ref('modern')
const showPreviewModal = ref(false)
const showDetailsModal = ref(false)
const previewingTemplate = ref(null)
const detailsTemplate = ref(null)
const loading = ref(false)

// Advanced Options
const aiOptimize = ref(true)
const atsFriendly = ref(true)
const gamingFocus = ref(false)

// Option Tabs
const optionTabs = ref([
  { id: 'filters', name: 'Filters', icon: 'mdi-filter-outline' },
  { id: 'advanced', name: 'Advanced', icon: 'mdi-cog-outline' },
  { id: 'ai', name: 'AI Suggestions', icon: 'mdi-brain' }
])

// Color Schemes
const colorSchemes = ref([
  { id: 'default', name: 'Default', preview: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' },
  { id: 'professional', name: 'Professional', preview: 'linear-gradient(45deg, #2c3e50 0%, #34495e 100%)' },
  { id: 'gaming', name: 'Gaming', preview: 'linear-gradient(45deg, #00ff88 0%, #00d9ff 100%)' },
  { id: 'creative', name: 'Creative', preview: 'linear-gradient(45deg, #ff6b6b 0%, #ffa500 100%)' },
  { id: 'minimal', name: 'Minimal', preview: 'linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)' }
])

// AI Recommendations (mock data - would come from AI service)
const aiRecommendations = ref([
  {
    id: 1,
    templateId: 'gaming-pro',
    templateName: 'Gaming Professional',
    score: 92,
    reason: 'Perfect match for your gaming industry experience and technical skills',
    tags: ['Gaming', 'Technical', 'Modern']
  },
  {
    id: 2,
    templateId: 'tech-senior',
    templateName: 'Senior Tech Leader',
    score: 87,
    reason: 'Highlights leadership experience and technical expertise effectively',
    tags: ['Leadership', 'Technical', 'Professional']
  }
])

// Template Categories
const categories = ref([
  { id: 'all', name: 'All Templates', icon: 'mdi-folder-multiple', count: 24 },
  { id: 'popular', name: 'Popular', icon: 'mdi-trending-up', count: 8 },
  { id: 'gaming', name: 'Gaming Industry', icon: 'mdi-controller-classic', count: 6 },
  { id: 'creative', name: 'Creative', icon: 'mdi-palette', count: 5 },
  { id: 'minimal', name: 'Minimal', icon: 'mdi-minus-circle', count: 5 }
])

// Template Data
const templates = ref([
  {
    id: 'gaming-pro',
    name: 'Gaming Professional',
    description: 'Perfect for game developers, designers, and gaming industry professionals.',
    category: 'gaming',
    industry: 'gaming',
    level: 'mid',
    style: 'modern',
    rating: 5,
    reviewCount: 127,
    downloads: '2.3k',
    estimatedTime: '15 min',
    isPremium: false,
    isFavorite: false,
    features: ['ATS Optimized', 'Gaming Focus', 'Portfolio Integration']
  },
  {
    id: 'creative-showcase',
    name: 'Creative Showcase',
    description: 'Showcase your creative work with this visually striking template.',
    category: 'creative',
    industry: 'creative',
    level: 'mid',
    style: 'creative',
    rating: 4,
    reviewCount: 89,
    downloads: '1.8k',
    estimatedTime: '20 min',
    isPremium: true,
    isFavorite: false,
    features: ['Portfolio Grid', 'Visual Focus', 'Creative Layout']
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    description: 'Clean and minimal design perfect for tech professionals.',
    category: 'minimal',
    industry: 'tech',
    level: 'senior',
    style: 'minimal',
    rating: 5,
    reviewCount: 203,
    downloads: '3.1k',
    estimatedTime: '10 min',
    isPremium: false,
    isFavorite: true,
    features: ['Clean Layout', 'Tech Focused', 'Fast Setup']
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    description: 'Traditional and professional design for executive positions.',
    category: 'popular',
    industry: 'business',
    level: 'executive',
    style: 'classic',
    rating: 4,
    reviewCount: 156,
    downloads: '2.7k',
    estimatedTime: '12 min',
    isPremium: false,
    isFavorite: false,
    features: ['Executive Focus', 'Classic Design', 'Professional']
  },
  {
    id: 'startup-bold',
    name: 'Startup Bold',
    description: 'Bold and energetic template for startup and entrepreneurial roles.',
    category: 'creative',
    industry: 'tech',
    level: 'mid',
    style: 'bold',
    rating: 4,
    reviewCount: 94,
    downloads: '1.5k',
    estimatedTime: '18 min',
    isPremium: true,
    isFavorite: false,
    features: ['Bold Colors', 'Startup Culture', 'Energetic Design']
  },
  {
    id: 'game-designer',
    name: 'Game Designer Pro',
    description: 'Specialized template for game designers with portfolio integration.',
    category: 'gaming',
    industry: 'gaming',
    level: 'senior',
    style: 'modern',
    rating: 5,
    reviewCount: 78,
    downloads: '1.2k',
    estimatedTime: '25 min',
    isPremium: true,
    isFavorite: true,
    features: ['Game Portfolio', 'Project Showcase', 'Visual Examples']
  }
])

// Computed Properties
const filteredTemplates = computed(() => {
  let filtered = templates.value

  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(t => t.category === activeCategory.value)
  }

  // Filter by industry
  if (selectedIndustry.value) {
    filtered = filtered.filter(t => t.industry === selectedIndustry.value)
  }

  // Filter by level
  if (selectedLevel.value) {
    filtered = filtered.filter(t => t.level === selectedLevel.value)
  }

  // Filter by style
  if (selectedStyle.value) {
    filtered = filtered.filter(t => t.style === selectedStyle.value)
  }

  // Sort by rating and popularity
  return filtered.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.rating - a.rating || b.reviewCount - a.reviewCount
  })
})

// Methods
const selectTemplate = (templateId: string) => {
  emit('template-select', templateId)
  toast.success('Template selected successfully')
}

const previewTemplate = (template: any) => {
  previewingTemplate.value = template
  showPreviewModal.value = true
}

const showTemplateDetails = (template: any) => {
  detailsTemplate.value = template
  showDetailsModal.value = true
}

const toggleFavorite = (template: any) => {
  template.isFavorite = !template.isFavorite
  toast.success(template.isFavorite ? 'Added to favorites' : 'Removed from favorites')
}

const handleTemplateSelection = (templateId: string) => {
  selectTemplate(templateId)
  showPreviewModal.value = false
  showDetailsModal.value = false
}

const clearFilters = () => {
  selectedIndustry.value = ''
  selectedLevel.value = ''
  selectedStyle.value = ''
  activeCategory.value = 'all'
}

const createCustomTemplate = () => {
  // Create a basic custom template structure
  const customTemplate = {
    id: `custom-${Date.now()}`,
    name: 'My Custom Template',
    description: 'A personalized template based on your preferences',
    category: 'custom',
    preview: '/placeholder-template.png',
    style: {
      font: 'Inter',
      fontSize: '11pt',
      lineHeight: '1.4',
      margins: {
        top: '1in',
        bottom: '1in',
        left: '0.75in',
        right: '0.75in'
      },
      colors: {
        primary: '#2563eb',
        text: '#1f2937',
        accent: '#10b981'
      }
    },
    layout: {
      header: {
        enabled: true,
        style: 'minimal',
        includePhoto: false
      },
      sections: [
        { id: 'personal', enabled: true, order: 1 },
        { id: 'summary', enabled: true, order: 2 },
        { id: 'experience', enabled: true, order: 3 },
        { id: 'education', enabled: true, order: 4 },
        { id: 'skills', enabled: true, order: 5 }
      ]
    },
    customization: {
      allowReordering: true,
      allowSectionToggle: true,
      allowStyleChanges: true
    }
  }

  // Add to templates list
  templates.value.push(customTemplate)
  
  // Select the new template
  selectedTemplate.value = customTemplate
  emit('template-selected', customTemplate)
  
  // Show success message
  toast.success('Custom template created! You can further customize it in the template editor.')
  
  // Optionally, you could open a template customization modal here
  // openTemplateCustomizer(customTemplate)
}

// Update category counts based on current filters
const updateCategoryCounts = () => {
  categories.value.forEach(category => {
    if (category.id === 'all') {
      category.count = templates.value.length
    } else {
      category.count = templates.value.filter(t => t.category === category.id).length
    }
  })
}

onMounted(() => {
  updateCategoryCounts()
})
</script>

<style scoped>
.document-templates {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.templates-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.view-toggle {
  display: flex;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-1);
}

.view-toggle .active {
  background: var(--color-primary-500);
  color: white;
}

/* Template Categories */
.template-categories {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.category-tabs {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: var(--font-size-sm);
}

.category-tab:hover {
  background: var(--glass-hover-bg);
  border-color: var(--glass-border);
}

.category-tab.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.template-count {
  padding: var(--spacing-0-5) var(--spacing-1-5);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.category-tab.active .template-count {
  background: rgba(255, 255, 255, 0.3);
}

/* Template Filters */
.template-filters {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  padding: var(--spacing-4);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1-5);
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.filter-select {
  min-width: 140px;
  padding: var(--spacing-1-5) var(--spacing-2);
  font-size: var(--font-size-sm);
}

/* Templates Container */
.templates-container {
  display: grid;
  gap: var(--spacing-5);
}

.templates-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.templates-container.list {
  grid-template-columns: 1fr;
}

.template-card {
  background: var(--glass-surface);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal);
  position: relative;
}

.template-card:hover {
  border-color: var(--color-primary-300);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.template-card.selected {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500-rgb), 0.1);
}

.template-card.premium {
  border-color: var(--color-gaming-300);
}

.template-card.premium:hover {
  border-color: var(--color-gaming-500);
}

/* Template Preview */
.template-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface-tertiary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Unique preview styles for each template */
.preview-gaming-pro {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.preview-creative-showcase {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.preview-tech-minimal {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  color: var(--text-primary);
}

.preview-executive-classic {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.preview-startup-bold {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
}

.preview-game-designer {
  background: linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%);
}

.template-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.template-card:hover .template-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: var(--spacing-2);
}

.premium-badge {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-gaming-500);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.selection-indicator {
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-3);
  color: var(--color-success-500);
  background: var(--surface-base);
  border-radius: 50%;
  padding: var(--spacing-1);
}

/* Template Info */
.template-info {
  padding: var(--spacing-4);
}

.template-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.template-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.template-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.rating-stars {
  display: flex;
  gap: var(--spacing-0-5);
}

.rating-stars .filled {
  color: var(--color-warning-500);
}

.rating-stars .empty {
  color: var(--surface-tertiary);
}

.rating-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.template-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-3);
}

.template-features {
  margin-bottom: var(--spacing-3);
}

.feature-tags {
  display: flex;
  gap: var(--spacing-1-5);
  flex-wrap: wrap;
}

.feature-tag {
  padding: var(--spacing-0-5) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.template-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.template-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Custom Template Section */
.custom-template-section {
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.custom-template-card {
  text-align: center;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.custom-header h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.custom-template-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
  color: var(--text-secondary);
}

.empty-state h4 {
  margin: var(--spacing-4) 0 var(--spacing-2);
  color: var(--text-primary);
}

/* List View Specific Styles */
.templates-container.list .template-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  height: 140px;
}

.templates-container.list .template-preview {
  height: 100%;
}

.templates-container.list .template-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .templates-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .templates-header {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
  
  .template-filters {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .filter-group {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .templates-container.grid {
    grid-template-columns: 1fr;
  }
  
  .templates-container.list .template-card {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .templates-container.list .template-preview {
    height: 150px;
  }
  
  .category-tabs {
    justify-content: center;
  }
}

/* === Enhanced Template Options Styling === */

.template-options-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 0;
  overflow: hidden;
}

.options-tabs {
  display: flex;
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
  border-bottom: 1px solid var(--glass-border);
}

.option-tab {
  flex: 1;
  padding: var(--spacing-4) var(--spacing-3);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.option-tab.active {
  background: var(--color-primary-500);
  color: white;
  border-bottom: 2px solid var(--color-primary-600);
}

.option-tab:hover:not(.active) {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.option-content {
  padding: var(--spacing-6);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.enhanced-glass-input {
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent) !important;
  backdrop-filter: blur(8px) !important;
  color: var(--text-primary) !important;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal);
}

.enhanced-glass-input:focus {
  background: color-mix(in srgb, var(--glass-bg) 85%, transparent) !important;
  border-color: var(--color-primary-500) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent) !important;
  outline: none;
}

.advanced-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
}

.option-section {
  background: color-mix(in srgb, var(--glass-bg) 40%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 50%, transparent);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  backdrop-filter: blur(4px);
}

.option-section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
}

.option-toggles {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.toggle-option {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
}

.toggle-label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  cursor: pointer;
  flex: 1;
}

.toggle-label > span:first-child {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.option-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.visual-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.color-scheme-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.option-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.color-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-2);
}

.color-option {
  height: 60px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal);
  display: flex;
  align-items: end;
  padding: var(--spacing-2);
  position: relative;
  overflow: hidden;
}

.color-option.active {
  border-color: var(--color-primary-500);
  transform: scale(1.05);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.color-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.3);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
}

.ai-suggestions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent) 0%,
    color-mix(in srgb, var(--color-primary-500) 5%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(8px);
}

.ai-header h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-8);
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-recommendations {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.recommendation-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal);
  backdrop-filter: blur(8px);
}

.recommendation-card:hover {
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
  transform: translateY(-2px);
  box-shadow: 
    var(--glass-shadow),
    0 8px 20px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

.recommendation-score {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.recommendation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.recommendation-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.recommendation-reason {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.recommendation-tags {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}

.recommendation-tag {
  padding: var(--spacing-0-5) var(--spacing-2);
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-600);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Mobile Responsiveness for Enhanced Options */
@media (max-width: 768px) {
  .advanced-options-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .color-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .option-content {
    padding: var(--spacing-4);
  }
  
  .options-tabs {
    flex-direction: column;
  }
  
  .option-tab {
    padding: var(--spacing-3);
    justify-content: flex-start;
  }
}
</style>