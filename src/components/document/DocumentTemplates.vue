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
            <select
              v-model="selectedIndustry"
              class="filter-select enhanced-glass-input"
            >
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
            <select
              v-model="selectedLevel"
              class="filter-select enhanced-glass-input"
            >
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
            <select
              v-model="selectedStyle"
              class="filter-select enhanced-glass-input"
            >
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
            <select
              v-model="selectedLayout"
              class="filter-select enhanced-glass-input"
            >
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
                <h5 class="recommendation-title">
                  {{ recommendation.templateName }}
                </h5>
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
          premium: template.isPremium,
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
                  {{ template.isFavorite ? "Favorited" : "Favorite" }}
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
          <div
            v-if="selectedTemplate === template.id"
            class="selection-indicator"
          >
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
        <UnifiedButton variant="outline" size="sm" @click="clearFilters">
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
import { ref, computed, onMounted } from "vue";
import { useToast } from "@/composables/useToast";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import TemplatePreviewModal from "./TemplatePreviewModal.vue";
import TemplateDetailsModal from "./TemplateDetailsModal.vue";

// Props
const props = defineProps<{
  documentType: "resume" | "cover-letter";
  selectedTemplate: string;
}>();

// Emits
const emit = defineEmits<{
  "template-select": [string];
}>();

const toast = useToast();

// State
const viewMode = ref<"grid" | "list">("grid");
const activeCategory = ref("all");
const activeOptionTab = ref("filters");
const selectedIndustry = ref("");
const selectedLevel = ref("");
const selectedStyle = ref("");
const selectedLayout = ref("");
const selectedColorScheme = ref("default");
const selectedFont = ref("modern");
const showPreviewModal = ref(false);
const showDetailsModal = ref(false);
const previewingTemplate = ref(null);
const detailsTemplate = ref(null);
const loading = ref(false);

// Advanced Options
const aiOptimize = ref(true);
const atsFriendly = ref(true);
const gamingFocus = ref(false);

// Option Tabs
const optionTabs = ref([
  { id: "filters", name: "Filters", icon: "mdi-filter-outline" },
  { id: "advanced", name: "Advanced", icon: "mdi-cog-outline" },
  { id: "ai", name: "AI Suggestions", icon: "mdi-brain" },
]);

// Color Schemes
const colorSchemes = ref([
  {
    id: "default",
    name: "Default",
    preview: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "professional",
    name: "Professional",
    preview: "linear-gradient(45deg, #2c3e50 0%, #34495e 100%)",
  },
  {
    id: "gaming",
    name: "Gaming",
    preview: "linear-gradient(45deg, #00ff88 0%, #00d9ff 100%)",
  },
  {
    id: "creative",
    name: "Creative",
    preview: "linear-gradient(45deg, #ff6b6b 0%, #ffa500 100%)",
  },
  {
    id: "minimal",
    name: "Minimal",
    preview: "linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)",
  },
]);

// AI Recommendations (mock data - would come from AI service)
const aiRecommendations = ref([
  {
    id: 1,
    templateId: "gaming-pro",
    templateName: "Gaming Professional",
    score: 92,
    reason:
      "Perfect match for your gaming industry experience and technical skills",
    tags: ["Gaming", "Technical", "Modern"],
  },
  {
    id: 2,
    templateId: "tech-senior",
    templateName: "Senior Tech Leader",
    score: 87,
    reason:
      "Highlights leadership experience and technical expertise effectively",
    tags: ["Leadership", "Technical", "Professional"],
  },
]);

// Template Categories
const categories = ref([
  { id: "all", name: "All Templates", icon: "mdi-folder-multiple", count: 24 },
  { id: "popular", name: "Popular", icon: "mdi-trending-up", count: 8 },
  {
    id: "gaming",
    name: "Gaming Industry",
    icon: "mdi-controller-classic",
    count: 6,
  },
  { id: "creative", name: "Creative", icon: "mdi-palette", count: 5 },
  { id: "minimal", name: "Minimal", icon: "mdi-minus-circle", count: 5 },
]);

// Template Data
const templates = ref([
  {
    id: "gaming-pro",
    name: "Gaming Professional",
    description:
      "Perfect for game developers, designers, and gaming industry professionals.",
    category: "gaming",
    industry: "gaming",
    level: "mid",
    style: "modern",
    rating: 5,
    reviewCount: 127,
    downloads: "2.3k",
    estimatedTime: "15 min",
    isPremium: false,
    isFavorite: false,
    features: ["ATS Optimized", "Gaming Focus", "Portfolio Integration"],
  },
  {
    id: "creative-showcase",
    name: "Creative Showcase",
    description:
      "Showcase your creative work with this visually striking template.",
    category: "creative",
    industry: "creative",
    level: "mid",
    style: "creative",
    rating: 4,
    reviewCount: 89,
    downloads: "1.8k",
    estimatedTime: "20 min",
    isPremium: true,
    isFavorite: false,
    features: ["Portfolio Grid", "Visual Focus", "Creative Layout"],
  },
  {
    id: "tech-minimal",
    name: "Tech Minimal",
    description: "Clean and minimal design perfect for tech professionals.",
    category: "minimal",
    industry: "tech",
    level: "senior",
    style: "minimal",
    rating: 5,
    reviewCount: 203,
    downloads: "3.1k",
    estimatedTime: "10 min",
    isPremium: false,
    isFavorite: true,
    features: ["Clean Layout", "Tech Focused", "Fast Setup"],
  },
  {
    id: "executive-classic",
    name: "Executive Classic",
    description: "Traditional and professional design for executive positions.",
    category: "popular",
    industry: "business",
    level: "executive",
    style: "classic",
    rating: 4,
    reviewCount: 156,
    downloads: "2.7k",
    estimatedTime: "12 min",
    isPremium: false,
    isFavorite: false,
    features: ["Executive Focus", "Classic Design", "Professional"],
  },
  {
    id: "startup-bold",
    name: "Startup Bold",
    description:
      "Bold and energetic template for startup and entrepreneurial roles.",
    category: "creative",
    industry: "tech",
    level: "mid",
    style: "bold",
    rating: 4,
    reviewCount: 94,
    downloads: "1.5k",
    estimatedTime: "18 min",
    isPremium: true,
    isFavorite: false,
    features: ["Bold Colors", "Startup Culture", "Energetic Design"],
  },
  {
    id: "game-designer",
    name: "Game Designer Pro",
    description:
      "Specialized template for game designers with portfolio integration.",
    category: "gaming",
    industry: "gaming",
    level: "senior",
    style: "modern",
    rating: 5,
    reviewCount: 78,
    downloads: "1.2k",
    estimatedTime: "25 min",
    isPremium: true,
    isFavorite: true,
    features: ["Game Portfolio", "Project Showcase", "Visual Examples"],
  },
]);

// Computed Properties
const filteredTemplates = computed(() => {
  let filtered = templates.value;

  // Filter by category
  if (activeCategory.value !== "all") {
    filtered = filtered.filter((t) => t.category === activeCategory.value);
  }

  // Filter by industry
  if (selectedIndustry.value) {
    filtered = filtered.filter((t) => t.industry === selectedIndustry.value);
  }

  // Filter by level
  if (selectedLevel.value) {
    filtered = filtered.filter((t) => t.level === selectedLevel.value);
  }

  // Filter by style
  if (selectedStyle.value) {
    filtered = filtered.filter((t) => t.style === selectedStyle.value);
  }

  // Sort by rating and popularity
  return filtered.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.rating - a.rating || b.reviewCount - a.reviewCount;
  });
});

// Methods
const selectTemplate = (templateId: string) => {
  emit("template-select", templateId);
  toast.success("Template selected successfully");
};

const previewTemplate = (template: any) => {
  previewingTemplate.value = template;
  showPreviewModal.value = true;
};

const showTemplateDetails = (template: any) => {
  detailsTemplate.value = template;
  showDetailsModal.value = true;
};

const toggleFavorite = (template: any) => {
  template.isFavorite = !template.isFavorite;
  toast.success(
    template.isFavorite ? "Added to favorites" : "Removed from favorites",
  );
};

const handleTemplateSelection = (templateId: string) => {
  selectTemplate(templateId);
  showPreviewModal.value = false;
  showDetailsModal.value = false;
};

const clearFilters = () => {
  selectedIndustry.value = "";
  selectedLevel.value = "";
  selectedStyle.value = "";
  activeCategory.value = "all";
};

const createCustomTemplate = () => {
  // Create a basic custom template structure
  const customTemplate = {
    id: `custom-${Date.now()}`,
    name: "My Custom Template",
    description: "A personalized template based on your preferences",
    category: "custom",
    preview: "/placeholder-template.png",
    style: {
      font: "Inter",
      fontSize: "11pt",
      lineHeight: "1.4",
      margins: {
        top: "1in",
        bottom: "1in",
        left: "0.75in",
        right: "0.75in",
      },
      colors: {
        primary: "#2563eb",
        text: "#1f2937",
        accent: "#10b981",
      },
    },
    layout: {
      header: {
        enabled: true,
        style: "minimal",
        includePhoto: false,
      },
      sections: [
        { id: "personal", enabled: true, order: 1 },
        { id: "summary", enabled: true, order: 2 },
        { id: "experience", enabled: true, order: 3 },
        { id: "education", enabled: true, order: 4 },
        { id: "skills", enabled: true, order: 5 },
      ],
    },
    customization: {
      allowReordering: true,
      allowSectionToggle: true,
      allowStyleChanges: true,
    },
  };

  // Add to templates list
  templates.value.push(customTemplate);

  // Select the new template
  selectedTemplate.value = customTemplate;
  emit("template-selected", customTemplate);

  // Show success message
  toast.success(
    "Custom template created! You can further customize it in the template editor.",
  );

  // Optionally, you could open a template customization modal here
  // openTemplateCustomizer(customTemplate)
};

// Update category counts based on current filters
const updateCategoryCounts = () => {
  categories.value.forEach((category) => {
    if (category.id === "all") {
      category.count = templates.value.length;
    } else {
      category.count = templates.value.filter(
        (t) => t.category === category.id,
      ).length;
    }
  });
};

onMounted(() => {
  updateCategoryCounts();
});
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

.template-categories {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  background: transparent;
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
  color: white;
}

.template-count {
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.category-tab.active .template-count {
}

.template-filters {
  display: flex;
  flex-wrap: wrap;
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.filter-select {
  font-size: var(--font-size-sm);
}

.templates-container {
  display: grid;
}

.templates-container.grid {
}

.templates-container.list {
}

.template-card {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal);
  position: relative;
}

.template-card:hover {
  box-shadow: var(--shadow-lg);
}

.template-card.selected {
}

.template-card.premium {
}

.template-card.premium:hover {
}

.template-preview {
  position: relative;
  overflow: hidden;
}

.preview-image {
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-gaming-pro {
}

.preview-creative-showcase {
}

.preview-tech-minimal {
  color: var(--text-primary);
}

.preview-executive-classic {
}

.preview-startup-bold {
}

.preview-game-designer {
}

.template-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--duration-normal);
}

.template-card:hover .template-overlay {
}

.overlay-actions {
  display: flex;
}

.premium-badge {
  position: absolute;
  display: flex;
  align-items: center;
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.selection-indicator {
  position: absolute;
  background: var(--surface-base);
}

.template-info {
}

.template-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.template-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.template-rating {
  display: flex;
  align-items: center;
}

.rating-stars {
  display: flex;
}

.rating-stars .filled {
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
}

.template-features {
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
}

.feature-tag {
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.template-stats {
  display: flex;
  justify-content: space-between;
}

.stat {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.template-actions {
  display: flex;
}

.custom-template-section {
  border-radius: var(--radius-lg);
}

.custom-template-card {
  text-align: center;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.custom-template-card p {
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
}

  color: var(--text-primary);
}

.templates-container.list .template-card {
  display: grid;
}

.templates-container.list .template-preview {
}

.templates-container.list .template-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

  .templates-container.grid {
  }
}

  .templates-header {
    flex-direction: column;
    align-items: stretch;
  }

  .template-filters {
    flex-direction: column;
  }

  .filter-group {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .templates-container.grid {
  }

  .templates-container.list .template-card {
    height: auto;
  }

  .templates-container.list .template-preview {
  }

  .category-tabs {
    justify-content: center;
  }
}


.template-options-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.options-tabs {
  display: flex;
}

.option-tab {
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
}

.option-tab.active {
  color: white;
}

.option-tab:hover:not(.active) {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.option-content {
}

.filter-grid {
  display: grid;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.enhanced-glass-input {
  color: var(--text-primary) !important;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal);
}

.enhanced-glass-input:focus {
  outline: none;
}

.advanced-options-grid {
  display: grid;
}

.option-section {
  border-radius: var(--radius-lg);
}

.option-section-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.option-toggles {
  display: flex;
  flex-direction: column;
}

.toggle-option {
  display: flex;
  align-items: flex-start;
}

.toggle-label {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.toggle-label > span:first-child {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.option-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.visual-options {
  display: flex;
  flex-direction: column;
}

.color-scheme-selector {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.color-options {
  display: grid;
}

.color-option {
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal);
  display: flex;
  align-items: end;
  position: relative;
  overflow: hidden;
}

.color-option.active {
}

.color-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: white;
  border-radius: var(--radius-sm);
}

.ai-suggestions-section {
  display: flex;
  flex-direction: column;
}

.ai-header {
  display: flex;
  align-items: center;
  background: linear-gradient(
  );
  border-radius: var(--radius-lg);
}

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
}

.loading-spinner {
}

@keyframes spin {
  }
  }
}

.ai-recommendations {
  display: flex;
  flex-direction: column;
}

.recommendation-card {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal);
}

.recommendation-card:hover {
  box-shadow:
    var(--glass-shadow),
}

.recommendation-score {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
  );
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.recommendation-content {
  display: flex;
  flex-direction: column;
}

.recommendation-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.recommendation-reason {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.recommendation-tags {
  display: flex;
}

.recommendation-tag {
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

  .advanced-options-grid {
  }

  .filter-grid {
  }

  .color-options {
  }

  .option-content {
  }

  .options-tabs {
    flex-direction: column;
  }

  .option-tab {
    justify-content: flex-start;
  }
}
</style>
