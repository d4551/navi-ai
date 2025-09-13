<template>
  <div class="skill-mapper-container">
    <!-- Animated background orbs -->
    <div class="background-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="skill-mapper-scroll-view">
      <!-- Header Section -->
      <header class="mapper-header">
        <h1 class="main-title">Gaming Skill Mapper</h1>
        <p class="main-subtitle">
          Transform your gaming achievements into professional skills that
          employers understand
        </p>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: analysisProgress + '%' }"
          ></div>
        </div>

        <!-- Stats Overview -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-value">{{ mappedSkills.length }}</div>
            <div class="stat-label">Mapped Skills</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ careerMatches.length }}</div>
            <div class="stat-label">Career Matches</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ industryReadinessScore }}%</div>
            <div class="stat-label">Industry Ready</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ topSkillCategories.length }}</div>
            <div class="stat-label">Key Strengths</div>
          </div>
        </div>
      </header>

      <!-- Main Grid Layout -->
      <div class="main-grid">
        <!-- Gaming Experience Input Panel -->
        <section class="input-panel glass-panel">
          <div class="panel-header">
            <div class="header-icon">🎮</div>
            <span class="header-title">Your Gaming Experience</span>
          </div>

          <div class="form-group">
            <label class="form-label">Describe Your Gaming Background</label>
            <textarea
              v-model="analysisInput.description"
              class="form-textarea"
              placeholder="Tell us about your gaming achievements, leadership roles, communities you've built, tournaments won, content created, or any gaming-related accomplishments..."
              rows="6"
              :disabled="isAnalyzing"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Gaming Profiles</label>
            <div class="profiles-grid">
              <div
                v-for="profile in gamingProfiles"
                :key="profile.id"
                class="profile-chip"
                :class="{ active: profile.selected }"
                @click="toggleProfile(profile)"
              >
                <div class="profile-icon">{{ profile.icon }}</div>
                <div class="profile-name">{{ profile.name }}</div>
              </div>
            </div>
          </div>

          <div v-if="achievements.length > 0" class="form-group">
            <label class="form-label">Key Achievements</label>
            <div class="achievements">
              <div
                v-for="achievement in achievements"
                :key="achievement.id"
                class="achievement"
              >
                <span>{{ achievement.icon }}</span>
                <span>{{ achievement.name }}</span>
              </div>
            </div>
          </div>

          <UnifiedButton
            variant="primary"
            size="lg"
            leading-icon="mdi-sparkles"
            :loading="isAnalyzing"
            :disabled="!analysisInput.description?.trim() || isAnalyzing"
            class="analyze-btn"
            @click="enhancedAnalyzeGamingExperience"
          >
            {{ isAnalyzing ? analysisStage : "Analyze My Skills" }}
          </UnifiedButton>
        </section>

        <!-- AI Insights Panel -->
        <section class="insights-panel glass-panel">
          <div class="panel-header">
            <div class="header-icon">🤖</div>
            <span class="header-title">AI-Powered Insights</span>
          </div>

          <div class="translation-grid">
            <div
              v-for="translation in gameTranslations"
              :key="translation.id"
              class="translation-card"
              @click="selectTranslation(translation)"
            >
              <div class="translation-header">
                <span class="translation-from">{{
                  translation.gameSkill
                }}</span>
                <span class="translation-arrow">→</span>
              </div>
              <div class="translation-to">
                Translates to Professional Skills:
              </div>
              <div class="translation-skills">
                <span
                  v-for="skill in translation.professionalSkills"
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Navigation Tabs -->
      <GlassNavTabs
        v-if="mappedSkills.length > 0"
        :active-tab="activeTab"
        :tabs="navTabs"
        class="navigation-tabs enhanced-tabs"
        @update:active-tab="activeTab = $event"
      />

      <!-- Dynamic Tab Content -->
      <div v-if="mappedSkills.length > 0" class="tab-content">
        <!-- Overview -->
        <section
          v-show="activeTab === 'overview'"
          class="overview-section glass-surface"
        >
          <div class="section-header">
            <h2>
              <AppIcon name="mdi-chart-box" size="large" />
              Skills Overview
            </h2>
            <p>Your comprehensive gaming-to-professional skills profile</p>
          </div>

          <!-- Key Metrics -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">{{ mappedSkills.length }}</div>
              <div class="metric-label">Total Skills</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ topSkillCategories.length }}</div>
              <div class="metric-label">Skill Categories</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ industryReadinessScore }}%</div>
              <div class="metric-label">Industry Readiness</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ careerMatches.length }}</div>
              <div class="metric-label">Career Matches</div>
            </div>
          </div>

          <!-- Top Categories -->
          <div class="categories-overview">
            <h3>Top Skill Categories</h3>
            <div class="category-grid">
              <div
                v-for="category in topSkillCategories.slice(0, 6)"
                :key="category.category"
                class="category-card"
              >
                <div class="category-info">
                  <div class="category-header">
                    <span class="category-name">{{ category.category }}</span>
                    <span class="category-count">{{ category.count }} skills</span>
                  </div>
                  <div class="category-percentage">
                    {{
                      Math.round((category.count / mappedSkills.length) * 100)
                    }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Detailed Skills -->
        <section
          v-show="activeTab === 'skills'"
          class="skills-section glass-surface"
        >
          <div class="section-header">
            <h2>
              <AppIcon name="mdi-view-list" size="large" />
              Mapped Skills
            </h2>
            <p>Your complete professional skills profile</p>
          </div>

          <div class="skills-grid">
            <div
              v-for="skill in mappedSkills"
              :key="skill.id || skill.transferableSkill"
              class="skill-card"
            >
              <div class="skill-header">
                <h4>{{ skill.transferableSkill }}</h4>
                <span class="skill-confidence">{{ skill.confidence || 0 }}%</span>
              </div>
              <div class="skill-source">From: {{ skill.gameExpression }}</div>
              <div
                v-if="skill.industryApplications?.length"
                class="skill-applications"
              >
                <span
                  v-for="app in skill.industryApplications.slice(0, 3)"
                  :key="app"
                  class="app-tag"
                >
                  {{ app }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Interactive Network -->
        <section
          v-show="activeTab === 'network'"
          class="network-section glass-panel"
        >
          <div class="panel-header">
            <div class="header-icon">📊</div>
            <span class="header-title">Interactive Skill Web</span>
          </div>

          <div class="skill-web-container">
            <div
              v-if="skillWebData && skillWebData.nodes?.length"
              class="skill-network-visualization"
            >
              <AppIcon name="mdi-graph" size="4rem" />
              <p>Interactive skill network visualization</p>
              <p class="network-stats">
                {{ skillWebData.nodes.length }} skills connected
              </p>
            </div>

            <div v-else class="skill-web-placeholder">
              <div class="placeholder-icon">🕸️</div>
              <p>Your skill network will appear here after analysis</p>
              <p class="placeholder-subtitle">
                Connect your gaming achievements to see how they map to
                professional competencies
              </p>
            </div>
          </div>
        </section>

        <!-- Career Recommendations -->
        <section
          v-show="activeTab === 'careers'"
          class="careers-section glass-panel"
        >
          <div class="panel-header">
            <div class="header-icon">🚀</div>
            <span class="header-title">Recommended Career Paths</span>
          </div>

          <div class="career-paths">
            <div
              v-for="career in careerMatches"
              :key="career.role"
              class="career-card enhanced-career-card"
              @click="selectedCareer = career as any"
            >
              <div class="career-title">{{ career.role }}</div>
              <div class="career-match">
                {{ Math.round(career.match || 85) }}% Match
              </div>
              <div class="career-skills">
                {{
                  career.pathway?.description ||
                    "Your gaming experience aligns perfectly with this career path. Your skills in strategy, teamwork, and problem-solving make you an excellent fit."
                }}
              </div>
            </div>
          </div>
        </section>

        <!-- Compare snapshots -->
        <section
          v-show="activeTab === 'compare'"
          class="compare-section glass-surface"
        >
          <div class="section-header">
            <h2>
              <AppIcon name="mdi-compare" size="large" />
              Compare Results
            </h2>
            <p>Track changes in your skill analysis over time</p>
          </div>

          <div class="snapshot-controls">
            <div class="snapshot-actions">
              <UnifiedButton
                variant="primary"
                leading-icon="mdi-camera"
                @click="saveSnapshot"
              >
                Save Current Results
              </UnifiedButton>
              <UnifiedButton
                variant="glass"
                leading-icon="mdi-export"
                @click="exportSnapshots"
              >
                Export All
              </UnifiedButton>
              <UnifiedButton
                variant="glass"
                leading-icon="mdi-import"
                @click="triggerImport"
              >
                Import
              </UnifiedButton>
              <input
                ref="snapImport"
                type="file"
                accept=".json"
                style="display: none"
                @change="onImportSnapshots"
              />
              <label class="form-check-label ml-2">
                <input
                  v-model="replaceSnapshots"
                  type="checkbox"
                  class="form-check-input"
                />
                Replace all on import
              </label>
            </div>
          </div>

          <div v-if="snapshots?.length >= 2" class="comparison-grid">
            <div class="snapshot-selector">
              <h4>Left Snapshot</h4>
              <select v-model="leftSnapKey" class="form-select">
                <option value="">Choose snapshot...</option>
                <option v-for="s in snapshots" :key="s.key" :value="s.key">
                  {{ s.name }} ({{ formatWhen(s.at) }})
                </option>
              </select>
              <div v-if="leftSnap" class="snapshot-info">
                <div>{{ leftSnap.skills.length }} skills</div>
                <UnifiedButton
                  size="xs"
                  variant="glass"
                  leading-icon="mdi-rename"
                  :disabled="!leftSnapKey"
                  @click="renameLeftSnapshot"
                >
                  Rename
                </UnifiedButton>
                <UnifiedButton
                  size="xs"
                  variant="outline"
                  leading-icon="mdi-delete"
                  :disabled="!leftSnapKey"
                  @click="deleteSnapshot(leftSnapKey)"
                >
                  Delete
                </UnifiedButton>
              </div>
            </div>

            <div class="snapshot-selector">
              <h4>Right Snapshot</h4>
              <select v-model="rightSnapKey" class="form-select">
                <option value="">Choose snapshot...</option>
                <option v-for="s in snapshots" :key="s.key" :value="s.key">
                  {{ s.name }} ({{ formatWhen(s.at) }})
                </option>
              </select>
              <div v-if="rightSnap" class="snapshot-info">
                <div>{{ rightSnap.skills.length }} skills</div>
                <UnifiedButton
                  size="xs"
                  variant="glass"
                  leading-icon="mdi-rename"
                  :disabled="!rightSnapKey"
                  @click="renameRightSnapshot"
                >
                  Rename
                </UnifiedButton>
                <UnifiedButton
                  size="xs"
                  variant="outline"
                  leading-icon="mdi-delete"
                  :disabled="!rightSnapKey"
                  @click="deleteSnapshot(rightSnapKey)"
                >
                  Delete
                </UnifiedButton>
              </div>
            </div>
          </div>

          <div v-if="leftSnap && rightSnap" class="diff-results">
            <div class="diff-summary">
              <div class="diff-stat">
                <span class="stat-value">{{ diff.onlyLeft.length }}</span>
                <span class="stat-label">Only in Left</span>
              </div>
              <div class="diff-stat">
                <span class="stat-value">{{ diff.onlyRight.length }}</span>
                <span class="stat-label">Only in Right</span>
              </div>
              <div class="diff-stat">
                <span class="stat-value">{{ diff.changed.length }}</span>
                <span class="stat-label">Changed</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Career role detail modal -->
        <div
          v-if="selectedRoleDetails"
          class="modal fade show d-block"
          tabindex="-1"
        >
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Career Role Details</h5>
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="'mdi-close'"
                  @click="selectedRoleDetails = null"
                />
              </div>
              <div class="modal-body">
                <p>Career role details would be displayed here.</p>
              </div>
              <div class="modal-footer">
                <UnifiedButton
                  variant="glass"
                  @click="selectedRoleDetails = null"
                >
                  Close
                </UnifiedButton>
                <UnifiedButton
                  variant="primary"
                  leading-icon="mdi-briefcase-search"
                >
                  Find Jobs
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export modal -->
      <div v-if="showExportModal" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Export Your Skills</h5>
              <UnifiedButton
                variant="ghost"
                size="sm"
                icon-only
                :icon="'mdi-close'"
                @click="showExportModal = false"
              />
            </div>
            <div class="modal-body">
              <p>Choose how you'd like to export your skill analysis:</p>
              <div class="export-options">
                <UnifiedButton
                  variant="primary"
                  size="lg"
                  leading-icon="mdi-file-pdf-box"
                  @click="handleExport('pdf')"
                >
                  Export as PDF
                </UnifiedButton>
                <UnifiedButton
                  variant="gaming"
                  size="lg"
                  leading-icon="mdi-image"
                  @click="handleExport('image')"
                >
                  Export as Image
                </UnifiedButton>
                <UnifiedButton
                  variant="cyber"
                  size="lg"
                  leading-icon="mdi-clipboard-text"
                  @click="handleExport('json')"
                >
                  Export as JSON
                </UnifiedButton>
              </div>
            </div>
            <div class="modal-footer">
              <UnifiedButton variant="glass" @click="showExportModal = false">
                Cancel
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';

import { ref, computed} from "vue";
import GlassNavTabs from "@/components/GlassNavTabs.vue";
import { useEnhancedSkillMapping } from "@/composables/useEnhancedSkillMapping";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Global prompt declaration
declare const prompt: (
  _message?: string,
  _defaultText?: string,
) => string | null;

// Composable
const {
  // State
  mappedSkills,
  suggestedSkills: _suggestedSkills,
  trendingSkills: _trendingSkills,
  careerPathways: _careerPathways,
  selectedSkill,
  selectedPathway: _selectedPathway,
  skillWebData,
  analysisInput,
  isAnalyzing,
  isLoadingTrends: _isLoadingTrends,

  // Computed
  skillsByCategory: _skillsByCategory,
  topSkillCategories,
  industryReadinessScore,
  careerMatches,

  // Methods
  analyzeGamingExperience,
  loadTrendingSkills: _loadTrendingSkills,
  acceptSuggestedSkill: _acceptSuggestedSkill,
  dismissSuggestedSkill: _dismissSuggestedSkill,
  loadRoleRequirements: _loadRoleRequirements,
  calculateReadinessAssessment: _calculateReadinessAssessment,
  removeSkill: _removeSkill,
  updateSkill: _updateSkill,
  exportSkills: _exportSkills,
  getGameToIndustryTranslations: _getTranslations,
  initialize,
} = useEnhancedSkillMapping();

// Unified theme and UI systems
const _theme = (() => {
  try {
    return useUnifiedTheme();
  } catch {
    return undefined as any;
  }
})();
const _ui = useUnifiedUI();

// Local state
const _selectedCategory = ref<string>("all");
const showExportModal = ref(false);
const _newGameProfile = ref("");
const _newAchievement = ref("");
const analysisStage = ref("Processing gaming experience...");
const _selectedRoleId = ref<string>("");
const activeTab = ref("overview");
const selectedCareer = ref<any>(null);
const selectedRoleDetails = ref<any>(null);
const _skillWebWidth = ref(800);
const _skillWebHeight = ref(600);

// New reactive data for enhanced UI
const analysisProgress = ref(0);
const gamingProfiles = ref([
  { id: "twitch", name: "Twitch", icon: "💜", selected: false },
  { id: "steam", name: "Steam", icon: "🎯", selected: false },
  { id: "discord", name: "Discord", icon: "💬", selected: true },
  { id: "youtube", name: "YouTube", icon: "📺", selected: false },
  { id: "xbox", name: "Xbox", icon: "🎮", selected: false },
  { id: "itch", name: "itch.io", icon: "🎪", selected: false },
]);

const achievements = ref([
  { id: 1, name: "Tournament Winner", icon: "🏆" },
  { id: 2, name: "Guild Leader (500+ members)", icon: "👥" },
  { id: 3, name: "Data Analyst for Pro Team", icon: "📊" },
]);

const gameTranslations = ref([
  {
    id: 1,
    gameSkill: "Raid Leadership",
    professionalSkills: [
      "Project Management",
      "Team Coordination",
      "Strategic Planning",
    ],
  },
  {
    id: 2,
    gameSkill: "Speedrunning",
    professionalSkills: [
      "Process Optimization",
      "Problem Solving",
      "Performance Analysis",
    ],
  },
  {
    id: 3,
    gameSkill: "Meta Analysis",
    professionalSkills: [
      "Data Analytics",
      "Pattern Recognition",
      "Strategic Thinking",
    ],
  },
  {
    id: 4,
    gameSkill: "Content Creation",
    professionalSkills: [
      "Digital Marketing",
      "Community Management",
      "Brand Building",
    ],
  },
]);

// Snapshots
const snapshots = ref<any[]>([]);
const leftSnapKey = ref("");
const rightSnapKey = ref("");
const replaceSnapshots = ref(false);

// Tab configuration
const navTabs = computed(() => [
  { id: "overview", label: "Overview", icon: "mdi-chart-box" },
  { id: "skills", label: "Skills", icon: "mdi-view-list" },
  { id: "network", label: "Network", icon: "mdi-graph" },
  { id: "careers", label: "Careers", icon: "mdi-briefcase" },
  { id: "compare", label: "Compare", icon: "mdi-compare" },
]);

// Computed values for snapshot comparison
const leftSnap = computed(() =>
  snapshots.value.find((s: any) => s.key === leftSnapKey.value),
);
const rightSnap = computed(() =>
  snapshots.value.find((s: any) => s.key === rightSnapKey.value),
);
const diff = computed(() => {
  if (!leftSnap.value || !rightSnap.value) {
    return { onlyLeft: [], onlyRight: [], changed: [] };
  }
  // Simple diff logic
  return {
    onlyLeft:
      leftSnap.value.skills?.filter(
        (ls: any) =>
          !rightSnap.value.skills?.find((rs: any) => rs.id === ls.id),
      ) || [],
    onlyRight:
      rightSnap.value.skills?.filter(
        (rs: any) => !leftSnap.value.skills?.find((ls: any) => ls.id === rs.id),
      ) || [],
    changed: [],
  };
});

// Methods
const _selectSkillFromNetwork = (node: any) => {
  selectedSkill.value =
    mappedSkills.value.find((s) => s.id === node.id) || null;
};

const handleExport = async (format: string) => {
  try {
    // Simple export logic - would need to match the expected interface
    console.log("Exporting skills in format:", format);
    showExportModal.value = false;
  } catch (_error) {
    console.error("Export failed:", error);
  }
};

const saveSnapshot = () => {
  const snapshot = {
    key: Date.now().toString(),
    name: `Snapshot ${new Date().toLocaleDateString()}`,
    at: Date.now(),
    skills: [...mappedSkills.value],
  };
  snapshots.value.push(snapshot);
};

const exportSnapshots = () => {
  const data = JSON.stringify(snapshots.value, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skill-snapshots.json";
  a.click();
};

const triggerImport = () => {
  // Create a temporary file input to trigger file selection
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = onImportSnapshots;
  input.click();
};

const onImportSnapshots = (event: any) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (_e) => {
    try {
      const importedSnapshots = JSON.parse(e.target?.result as string);
      if (replaceSnapshots.value) {
        snapshots.value = importedSnapshots;
      } else {
        snapshots.value.push(...importedSnapshots);
      }
    } catch (_error) {
      console.error("Import failed:", error);
    }
  };
  reader.readAsText(file);
};

const deleteSnapshot = (key: string) => {
  snapshots.value = snapshots.value.filter((s: any) => s.key !== key);
  if (leftSnapKey.value === key) leftSnapKey.value = "";
  if (rightSnapKey.value === key) rightSnapKey.value = "";
};

const renameSnapshot = (key: string, newName: string) => {
  const snapshot = snapshots.value.find((s: any) => s.key === key);
  if (snapshot) {
    snapshot.name = newName;
  }
};

const renameLeftSnapshot = () => {
  const currentName = pickSnap(leftSnapKey.value)?.name || "";
  const newName = prompt("Rename snapshot", currentName);
  if (newName) {
    renameSnapshot(leftSnapKey.value, newName);
  }
};

const renameRightSnapshot = () => {
  const currentName = pickSnap(rightSnapKey.value)?.name || "";
  const newName = prompt("Rename snapshot", currentName);
  if (newName) {
    renameSnapshot(rightSnapKey.value, newName);
  }
};

const pickSnap = (key: string) =>
  snapshots.value.find((s: any) => s.key === key);
const formatWhen = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString();

// New interactive methods
const toggleProfile = (profile: any) => {
  profile.selected = !profile.selected;
};

const selectTranslation = (translation: any) => {
  // Add visual feedback for translation card selection
  console.log("Selected translation:", translation);
};


const enhancedAnalyzeGamingExperience = async () => {
  analysisProgress.value = 0;

  // Simulate progress updates
  const progressInterval = setInterval(() => {
    if (analysisProgress.value < 90) {
      analysisProgress.value += Math.random() * 10;
    }
  }, 300);

  try {
    await analyzeGamingExperience();
    analysisProgress.value = 100;
  } finally {
    clearInterval(progressInterval);
  }
};

// Lifecycle
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.skill-mapper-container {
  background: var(--background-primary);
  position: relative;
  overflow-x: hidden;
  color: var(--text-primary);
}


.skill-mapper-scroll-view {
  position: relative;
  max-width: var(--page-container-max-width);
  padding: var(--spacing-lg);
}

.mapper-header {
  text-align: center;
  position: relative;
}

.main-title {
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes gradient-shift {
  }
  }
  }
}

.main-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  max-width: var(--page-narrow-width);
}

.progress-bar {
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background: linear-gradient(
  );
  border-radius: var(--radius-sm);
  transition: width var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
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

.stats-overview {
  display: grid;
}

.stat-card {
  background: linear-gradient(
    var(--glass-bg),
  );
  border-radius: var(--radius-lg);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.stat-card::before {
  content: "";
  position: absolute;
}

@keyframes rotate {
  }
  }
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
}

.stat-value {
  font-weight: var(--font-weight-bold);
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.stat-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  position: relative;
}

.main-grid {
  display: grid;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.glass-panel::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: opacity var(--duration-normal);
}

.glass-panel:hover::before {
}

.glass-panel:hover {
  box-shadow: var(--shadow-lg);
}

.panel-header {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.header-icon {
  background: linear-gradient(
  );
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
}

.header-title {
  color: var(--text-primary);
}

.form-group {
}

.form-label {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-textarea {
  background: var(--surface-container-low);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-family: inherit;
  transition: all var(--duration-normal) var(--easing-ease-out);
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
}

.profiles-grid {
  display: grid;
}

.profile-chip {
  background: var(--dark-secondary);
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.profile-chip::before {
  content: "";
  position: absolute;
  background: radial-gradient(circle, var(--primary), transparent);
  transition:
}

.profile-chip:hover::before {
}

.profile-chip:hover {
  border-color: var(--primary);
}

.profile-chip.active {
  border-color: transparent;
  color: white;
}

.profile-icon {
  position: relative;
}

.profile-name {
  position: relative;
}

.achievements {
  display: flex;
  flex-wrap: wrap;
}

.achievement {
  color: white;
  display: flex;
  align-items: center;
}

@keyframes pulse {
  }
  }
}

.translation-grid {
  display: grid;
}

.translation-card {
  background: var(--dark-secondary);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.translation-card::after {
  content: "";
  position: absolute;
  transform-origin: left;
}

.translation-card:hover::after {
}

.translation-card:hover {
}

.translation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.translation-from {
  color: var(--primary-light);
}

.translation-arrow {
  color: var(--text-secondary);
}

.translation-to {
  color: var(--text-secondary);
}

.translation-skills {
  display: flex;
  flex-wrap: wrap;
}

.skill-tag {
  background: var(--glass);
  color: var(--text-secondary);
}

.analyze-btn {
}

.enhanced-tabs {
}

.skill-web-container {
  background: var(--dark-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.skill-web-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

.placeholder-icon {
}

.placeholder-subtitle {
}

.career-paths {
  display: grid;
}

.enhanced-career-card {
  background: var(--glass);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.enhanced-career-card::before {
  content: "";
  position: absolute;
}

.enhanced-career-card:hover::before {
}

.enhanced-career-card:hover {
}

.career-title {
  color: var(--primary-light);
}

.career-match {
  display: inline-block;
  color: white;
}

.career-skills {
  color: var(--text-secondary);
}

  .main-grid {
  }

  .main-title {
  }

  .skill-mapper-scroll-view {
  }

  .stats-overview {
  }

  .profiles-grid {
  }

  .translation-grid {
  }

  .career-paths {
  }
}
</style>
