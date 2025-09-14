<template>
  <div class="skill-mapper-view">
    <main class="container-fluid mt-4">
      <!-- Initial Input Section -->
      <div v-if="mappedSkills.length === 0" class="initial-input-section">
        <div class="input-card">
          <div class="input-header">
            <h2 class="input-title">
              Map Your Gaming Skills to Real-World Careers
            </h2>
            <p class="input-subtitle">
              Translate your in-game talents into professional strengths.
            </p>
          </div>
          <div class="input-body">
            <textarea
              v-model="analysisInput.description"
              class="gaming-input"
              placeholder="Describe your gaming experience: games played, achievements earned, leadership roles, competitive events, streaming, content creation, etc."
              rows="6"
              :disabled="isAnalyzing"
            />
          </div>

          <div class="input-actions">
            <UnifiedButton
              variant="primary"
              size="lg"
              leading-icon="mdi-brain"
              :loading="isAnalyzing"
              :disabled="!analysisInput.description?.trim() || isAnalyzing"
              @click="analyzeGamingExperience"
            >
              {{ isAnalyzing ? analysisStage : "Analyze Gaming Skills" }}
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Results Display Section -->
      <div v-else class="results-section">
        <div class="results-header">
          <h1>Your Professional Skill Profile</h1>
          <div class="header-actions">
            <UnifiedButton
              variant="secondary"
              leading-icon="mdi-refresh"
              @click="initialize"
            >
              Start Over
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              leading-icon="mdi-export"
              @click="showExportModal = true"
            >
              Export Profile
            </UnifiedButton>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <GlassNavTabs
          v-if="mappedSkills.length > 0"
          v-model:active-tab="activeTab"
          :tabs="navTabs"
          class="navigation-tabs"
        />

        <!-- Tab Content -->
        <div class="tab-content mt-4">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="overview-tab">
            <div class="overview-grid">
              <div class="metric-card">
                <div class="metric-title">Industry Readiness</div>
                <div class="metric-value">{{ industryReadinessScore }}%</div>
                <div class="metric-description">
                  Your alignment with in-demand industry skills.
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Top Skill Category</div>
                <div class="metric-value-text">{{ topSkillCategories[0] }}</div>
                <div class="metric-description">
                  Your most prominent area of expertise.
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Total Skills Mapped</div>
                <div class="metric-value">{{ mappedSkills.length }}</div>
                <div class="metric-description">
                  Unique professional skills identified.
                </div>
              </div>
            </div>
          </div>

          <!-- Skills Tab -->
          <div v-if="activeTab === 'skills'" class="skills-tab">
            <div class="skill-list">
              <div
                v-for="skill in mappedSkills"
                :key="skill.id"
                class="skill-item"
                @click="selectedSkill = skill"
              >
                <div class="skill-name">{{ skill.transferableSkill }}</div>
                <div
                  class="skill-confidence"
                  :class="`confidence-${skill.confidence}`"
                >
                  {{ skill.confidence }}
                </div>
              </div>
            </div>
          </div>

          <!-- Network Tab -->
          <div v-if="activeTab === 'network'" class="network-tab">
            <svg
              :width="skillWebWidth"
              :height="skillWebHeight"
              class="skill-network-graph"
            >
              <!-- Connections -->
              <g class="connections">
                <line
                  v-for="(conn, index) in skillWebData.connections"
                  :key="index"
                  class="connection"
                  :class="`connection-${conn.strength}`"
                  :x1="skillWebData.nodes.find((n) => n.id === conn.from)?.x"
                  :y1="skillWebData.nodes.find((n) => n.id === conn.from)?.y"
                  :x2="skillWebData.nodes.find((n) => n.id === conn.to)?.x"
                  :y2="skillWebData.nodes.find((n) => n.id === conn.to)?.y"
                />
              </g>
              <!-- Nodes -->
              <g class="nodes">
                <g
                  v-for="node in skillWebData.nodes"
                  :key="node.id"
                  class="node"
                  :transform="`translate(${node.x}, ${node.y})`"
                  @click="selectSkillFromNetwork(node)"
                >
                  <circle :r="node.radius" :class="`node-cat-${node.type}`" />
                  <text :dy="node.radius + 12">{{ node.label }}</text>
                </g>
              </g>
            </svg>
          </div>

          <!-- Careers Tab -->
          <div v-if="activeTab === 'careers'" class="careers-tab">
            <div class="career-list">
              <div
                v-for="career in careerMatches"
                :key="career.role"
                class="career-card"
                @click="selectedRoleDetails = career"
              >
                <div class="career-header">
                  <h3>{{ career.role }}</h3>
                  <div class="career-match-score">
                    {{ Math.round(career.match) }}%
                  </div>
                </div>
                <div class="career-description">
                  {{ career.pathway.description }}
                </div>
                <div class="career-skills">
                  <div class="career-match-details">
                    <strong>{{
                      (career.pathway.stages[0]?.requirements || []).length
                    }}
                      matching skills</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Compare Tab -->
          <div v-if="activeTab === 'compare'" class="compare-tab">
            <div class="snapshot-controls">
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
                @click="() => snapImport?.click()"
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

            <div class="snapshot-comparison">
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
                    @click="renameSnapshotPrompt(leftSnapKey)"
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
                    @click="renameSnapshotPrompt(rightSnapKey)"
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

            <div v-if="leftSnap && rightSnap" class="diff-view">
              <h3>Comparison</h3>
              <div class="diff-section">
                <h4>Skills only in {{ leftSnap.name }}</h4>
                <ul>
                  <li v-for="skill in diff.onlyLeft" :key="skill.id">
                    {{ skill.transferableSkill }}
                  </li>
                </ul>
              </div>
              <div class="diff-section">
                <h4>Skills only in {{ rightSnap.name }}</h4>
                <ul>
                  <li v-for="skill in diff.onlyRight" :key="skill.id">
                    {{ skill.transferableSkill }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <!-- Skill detail modal -->
        <div v-if="selectedSkill" class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ selectedSkill.transferableSkill }}
                </h5>
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="'mdi-close'"
                  @click="selectedSkill = null"
                />
              </div>
              <div class="modal-body">
                <div class="skill-detail">
                  <div class="detail-row">
                    <label>Confidence:</label>
                    <div
                      class="confidence-detail"
                      :class="`confidence-${selectedSkill.confidence}`"
                    >
                      {{ selectedSkill.confidence }}
                    </div>
                  </div>
                  <div class="detail-row">
                    <label>Source:</label>
                    <div>{{ selectedSkill.gameExpression }}</div>
                  </div>
                  <div class="detail-row">
                    <label>Category:</label>
                    <div>{{ selectedSkill.category }}</div>
                  </div>
                  <div class="detail-row">
                    <label>Applications:</label>
                    <div class="applications-list">
                      <span
                        v-for="app in selectedSkill.industryApplications"
                        :key="app"
                        class="app-tag"
                      >{{ app }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <UnifiedButton variant="glass" @click="selectedSkill = null">
                  Close
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Career role detail modal -->
        <div
          v-if="selectedRoleDetails"
          class="modal fade show d-block"
          tabindex="-1"
        >
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ selectedRoleDetails.role }}</h5>
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="'mdi-close'"
                  @click="selectedRoleDetails = null"
                />
              </div>
              <div class="modal-body">
                <div class="skill-detail">
                  <div class="detail-row">
                    <label>Match Score:</label>
                    <div class="confidence-detail confidence-high">
                      {{ selectedRoleDetails.match }}%
                    </div>
                  </div>
                  <div class="detail-row">
                    <label>Description:</label>
                    <div>{{ selectedRoleDetails.pathway.description }}</div>
                  </div>
                  <div class="detail-row">
                    <label>Core Skills:</label>
                    <div class="applications-list">
                      <span
                        v-for="c in selectedRoleDetails.pathway.stages.flatMap(
                          (s: any) => s.requirements || [],
                        )"
                        :key="c"
                        class="app-tag"
                      >{{ c }}</span>
                    </div>
                  </div>
                  <div class="detail-row">
                    <label>Nice To Have:</label>
                    <div class="applications-list">
                      <span
                        v-for="c in selectedRoleDetails.pathway.stages.flatMap(
                          (s: any) => s.requirements || [],
                        )"
                        :key="c"
                        class="app-tag"
                      >{{ c }}</span>
                    </div>
                  </div>
                  <div class="detail-row">
                    <label>Tools:</label>
                    <div class="applications-list">
                      <span v-for="t in []" :key="t" class="app-tag">{{
                        t
                      }}</span>
                    </div>
                  </div>
                </div>
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

        <!-- Export modal -->
        <div
          v-if="showExportModal"
          class="modal fade show d-block"
          tabindex="-1"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Export Skill Profile</h5>
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="'mdi-close'"
                  @click="showExportModal = false"
                />
              </div>
              <div class="modal-body">
                <p>Choose your desired export format:</p>
                <div class="export-options">
                  <UnifiedButton @click="handleExport('json')">
                    JSON
                  </UnifiedButton>
                  <UnifiedButton @click="handleExport('csv')">
                    CSV
                  </UnifiedButton>
                  <UnifiedButton @click="handleExport('pdf')">
                    PDF
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import { ref, computed} from "vue";
import type { SkillExportOptions } from "../shared/types/skillMapping";
import GlassNavTabs from "../components/GlassNavTabs.vue";
import { useEnhancedSkillMapping } from "../composables/useEnhancedSkillMapping";
import { useUnifiedTheme } from "../shared/composables/useUnifiedTheme";
import { useUnifiedUI } from "../composables/useUnifiedUI";
import UnifiedButton from "../components/ui/UnifiedButton.vue";

interface Snapshot {
  key: string;
  name: string;
  at: number;
  skills: any[]; // Consider defining a proper type for skills
}

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
  exportSkills,
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
const _selectedCareer = ref<any>(null);
const selectedRoleDetails = ref<any>(null);
const skillWebWidth = ref(800);
const skillWebHeight = ref(600);

// Snapshots
const snapshots = ref<Snapshot[]>([]);
const leftSnapKey = ref("");
const rightSnapKey = ref("");
const replaceSnapshots = ref(false);
const snapImport = ref<HTMLInputElement | null>(null);

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
  snapshots.value.find((s) => s.key === leftSnapKey.value),
);
const rightSnap = computed(() =>
  snapshots.value.find((s) => s.key === rightSnapKey.value),
);
const diff = computed(() => {
  if (!leftSnap.value || !rightSnap.value) {
    return { onlyLeft: [], onlyRight: [], changed: [] };
  }
  // Simple diff logic - would be more sophisticated in real app
  return {
    onlyLeft: leftSnap.value.skills.filter(
      (ls) => !rightSnap.value?.skills.find((rs) => rs.id === ls.id),
    ),
    onlyRight: rightSnap.value.skills.filter(
      (rs) => !leftSnap.value?.skills.find((ls) => ls.id === rs.id),
    ),
    changed: [],
  };
});

// Methods
const selectSkillFromNetwork = (node: any) => {
  selectedSkill.value =
    mappedSkills.value.find((s) => s.id === node.id) || null;
};

const handleExport = async (format: SkillExportOptions["format"]) => {
  try {
    await exportSkills({
      format,
      framework: "discipline",
      includeAnalysis: false,
      includeEvidence: false,
      includeReadiness: false,
    });
    showExportModal.value = false;
  } catch (_error) {
    console.error("Export failed:", error);
  }
};

const saveSnapshot = () => {
  const snapshot: Snapshot = {
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
  snapshots.value = snapshots.value.filter((s) => s.key !== key);
  if (leftSnapKey.value === key) leftSnapKey.value = "";
  if (rightSnapKey.value === key) rightSnapKey.value = "";
};

const renameSnapshot = (key: string, newName: string) => {
  const snapshot = snapshots.value.find((s) => s.key === key);
  if (snapshot) {
    snapshot.name = newName;
  }
};

const renameSnapshotPrompt = (key: string) => {
  const snapshot = pickSnap(key);
  if (!snapshot) return;
  const newName = window.prompt("Rename snapshot", snapshot.name || "");
  if (newName) {
    renameSnapshot(key, newName);
  }
};

const pickSnap = (key: string) => snapshots.value.find((s) => s.key === key);
const formatWhen = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString();

// Lifecycle
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.skill-mapper-container {
  background: linear-gradient(
  );
  position: relative;
  overflow-x: hidden;
}

.skill-mapper-container::before {
  content: "";
  position: fixed;
  background:
    radial-gradient(
    ),
    radial-gradient(
    ),
    radial-gradient(
    );
  pointer-events: none;
}

.skill-mapper-scroll-view {
  position: relative;
}

.glass-surface {
  box-shadow:
}

.glass-surface:hover {
  box-shadow:
}

.section-header {
  text-align: center;
}

  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-header p {
}

.input-controls {
}

.gaming-input-container {
}

.gaming-input {
  color: white;
  resize: vertical;
}

.gaming-input:focus {
  outline: none;
}

.gaming-input::placeholder {
}

.input-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.navigation-tabs {
}

.metrics-grid {
  display: grid;
}

.metric-card {
  text-align: center;
}

.metric-card:hover {
}

.metric-value {
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-label {
  text-transform: uppercase;
}

  color: white;
}

.category-grid {
  display: grid;
}

.category-card {
}

.category-card:hover {
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-header {
  display: flex;
  flex-direction: column;
}

.category-name {
  color: white;
}

.category-count {
}

.category-percentage {
}

.skills-grid {
  display: grid;
}

.skill-card {
}

.skill-card:hover {
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

  color: white;
}

.skill-confidence {
  color: white;
}

.skill-source {
}

.skill-applications {
  display: flex;
  flex-wrap: wrap;
}

.app-tag {
}

.skill-web-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-network {
}

.connection {
}

.connection-strong {
}

.node-circle {
  cursor: pointer;
}

.node-circle:hover {
}

.node-label {
  fill: white;
  text-anchor: middle;
  pointer-events: none;
}

.skill-web-placeholder {
  text-align: center;
}

.skill-web-placeholder p {
}

.career-grid {
  display: grid;
}

.career-card {
  cursor: pointer;
}

.career-card:hover {
}

.career-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

  color: white;
}

.career-match-score {
  color: white;
}

.career-description {
}

.career-match-details {
}

.snapshot-controls {
}

.snapshot-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.comparison-grid {
  display: grid;
}

  color: white;
}

.snapshot-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.snapshot-info > div {
}

.diff-summary {
  display: flex;
  justify-content: center;
}

.diff-stat {
  text-align: center;
}

.stat-value {
  display: block;
}

.stat-label {
}

.form-select {
  color: white;
}

.form-select:focus {
  outline: none;
}

.form-select option {
  color: white;
}

.form-check-label {
  display: flex;
  align-items: center;
}

.form-check-input {
}

.modal {
}

.modal-content {
}

.modal-header {
}

.modal-title {
  color: white;
}

.modal-body {
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.export-options {
  display: flex;
  flex-direction: column;
}

.skill-detail {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
}

.detail-row label {
}

.confidence-detail {
}

.confidence-high {
  color: white;
}

.applications-list {
  display: flex;
  flex-wrap: wrap;
}

  .skill-mapper-scroll-view {
  }

  .metrics-grid {
  }

  .category-grid {
  }

  .skills-grid {
  }

  .career-grid {
  }

  .comparison-grid {
  }

  .input-actions {
    flex-direction: column;
  }

  .snapshot-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .diff-summary {
    flex-direction: column;
  }
}

  .metrics-grid {
  }

    flex-direction: column;
  }
}
</style>
