<template>
  <div class="skill-mapper-view">
    <main class="container-fluid mt-4">
      <!-- Initial Input Section -->
      <div v-if="mappedSkills.length === 0" class="initial-input-section">
        <div class="input-card">
          <div class="input-header">
            <h2 class="input-title">Map Your Gaming Skills to Real-World Careers</h2>
            <p class="input-subtitle">Translate your in-game talents into professional strengths.</p>
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
              {{ isAnalyzing ? analysisStage : 'Analyze Gaming Skills' }}
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Results Display Section -->
      <div v-else class="results-section">
        <div class="results-header">
          <h1>Your Professional Skill Profile</h1>
          <div class="header-actions">
            <UnifiedButton variant="secondary" leading-icon="mdi-refresh" @click="initialize">Start Over</UnifiedButton>
            <UnifiedButton variant="primary" leading-icon="mdi-export" @click="showExportModal = true">Export Profile</UnifiedButton>
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
                <div class="metric-description">Your alignment with in-demand industry skills.</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Top Skill Category</div>
                <div class="metric-value-text">{{ topSkillCategories[0] }}</div>
                <div class="metric-description">Your most prominent area of expertise.</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Total Skills Mapped</div>
                <div class="metric-value">{{ mappedSkills.length }}</div>
                <div class="metric-description">Unique professional skills identified.</div>
              </div>
            </div>
          </div>

          <!-- Skills Tab -->
          <div v-if="activeTab === 'skills'" class="skills-tab">
            <div class="skill-list">
              <div v-for="skill in mappedSkills" :key="skill.id" class="skill-item" @click="selectedSkill = skill">
                <div class="skill-name">{{ skill.transferableSkill }}</div>
                <div class="skill-confidence" :class="`confidence-${skill.confidence}`">{{ skill.confidence }}</div>
              </div>
            </div>
          </div>

          <!-- Network Tab -->
          <div v-if="activeTab === 'network'" class="network-tab">
            <svg :width="skillWebWidth" :height="skillWebHeight" class="skill-network-graph">
              <!-- Connections -->
              <g class="connections">
                <line
                  v-for="(conn, index) in skillWebData.connections"
                  :key="index"
                  class="connection"
                  :class="`connection-${conn.strength}`"
                  :x1="skillWebData.nodes.find(n => n.id === conn.from)?.x"
                  :y1="skillWebData.nodes.find(n => n.id === conn.from)?.y"
                  :x2="skillWebData.nodes.find(n => n.id === conn.to)?.x"
                  :y2="skillWebData.nodes.find(n => n.id === conn.to)?.y"
                />
              </g>
              <!-- Nodes -->
              <g class="nodes">
                <g v-for="node in skillWebData.nodes" :key="node.id" class="node" :transform="`translate(${node.x}, ${node.y})`" @click="selectSkillFromNetwork(node)">
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
                  <div class="career-match-score">{{ Math.round(career.match) }}%</div>
                </div>
                <div class="career-description">
                  {{ career.pathway.description }}
                </div>
                <div class="career-skills">
                  <div class="career-match-details">
                    <strong>{{ (career.pathway.stages[0]?.requirements || []).length }} matching skills</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Compare Tab -->
          <div v-if="activeTab === 'compare'" class="compare-tab">
            <div class="snapshot-controls">
              <UnifiedButton variant="primary" leading-icon="mdi-camera" @click="saveSnapshot">Save Current Results</UnifiedButton>
              <UnifiedButton variant="glass" leading-icon="mdi-export" @click="exportSnapshots">Export All</UnifiedButton>
              <UnifiedButton variant="glass" leading-icon="mdi-import" @click="() => snapImport?.click()">Import</UnifiedButton>
              <input ref="snapImport" type="file" accept=".json" style="display: none" @change="onImportSnapshots">
              <label class="form-check-label ml-2">
                <input v-model="replaceSnapshots" type="checkbox" class="form-check-input"> Replace all on import
              </label>
            </div>

            <div class="snapshot-comparison">
              <div class="snapshot-selector">
                <h4>Left Snapshot</h4>
                <select v-model="leftSnapKey" class="form-select">
                  <option value="">Choose snapshot...</option>
                  <option v-for="s in snapshots" :key="s.key" :value="s.key">{{ s.name }} ({{ formatWhen(s.at) }})</option>
                </select>
                <div v-if="leftSnap" class="snapshot-info">
                  <div>{{ leftSnap.skills.length }} skills</div>
                  <UnifiedButton size="xs" variant="glass" leading-icon="mdi-rename" :disabled="!leftSnapKey" @click="renameSnapshotPrompt(leftSnapKey)">Rename</UnifiedButton>
                  <UnifiedButton size="xs" variant="outline" leading-icon="mdi-delete" :disabled="!leftSnapKey" @click="deleteSnapshot(leftSnapKey)">Delete</UnifiedButton>
                </div>
              </div>

              <div class="snapshot-selector">
                <h4>Right Snapshot</h4>
                <select v-model="rightSnapKey" class="form-select">
                  <option value="">Choose snapshot...</option>
                  <option v-for="s in snapshots" :key="s.key" :value="s.key">{{ s.name }} ({{ formatWhen(s.at) }})</option>
                </select>
                <div v-if="rightSnap" class="snapshot-info">
                  <div>{{ rightSnap.skills.length }} skills</div>
                  <UnifiedButton size="xs" variant="glass" leading-icon="mdi-rename" :disabled="!rightSnapKey" @click="renameSnapshotPrompt(rightSnapKey)">Rename</UnifiedButton>
                  <UnifiedButton size="xs" variant="outline" leading-icon="mdi-delete" :disabled="!rightSnapKey" @click="deleteSnapshot(rightSnapKey)">Delete</UnifiedButton>
                </div>
              </div>
            </div>

            <div v-if="leftSnap && rightSnap" class="diff-view">
              <h3>Comparison</h3>
              <div class="diff-section">
                <h4>Skills only in {{ leftSnap.name }}</h4>
                <ul><li v-for="skill in diff.onlyLeft" :key="skill.id">{{ skill.transferableSkill }}</li></ul>
              </div>
              <div class="diff-section">
                <h4>Skills only in {{ rightSnap.name }}</h4>
                <ul><li v-for="skill in diff.onlyRight" :key="skill.id">{{ skill.transferableSkill }}</li></ul>
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
                <h5 class="modal-title">{{ selectedSkill.transferableSkill }}</h5>
                <UnifiedButton variant="ghost" size="sm" icon-only :icon="'mdi-close'" @click="selectedSkill = null" />
              </div>
              <div class="modal-body">
                <div class="skill-detail">
                  <div class="detail-row"><label>Confidence:</label><div class="confidence-detail" :class="`confidence-${selectedSkill.confidence}`">{{ selectedSkill.confidence }}</div></div>
                  <div class="detail-row"><label>Source:</label><div>{{ selectedSkill.gameExpression }}</div></div>
                  <div class="detail-row"><label>Category:</label><div>{{ selectedSkill.category }}</div></div>
                  <div class="detail-row"><label>Applications:</label><div class="applications-list"><span v-for="app in selectedSkill.industryApplications" :key="app" class="app-tag">{{ app }}</span></div></div>
                </div>
              </div>
              <div class="modal-footer">
                <UnifiedButton variant="glass" @click="selectedSkill = null">Close</UnifiedButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Career role detail modal -->
        <div v-if="selectedRoleDetails" class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ selectedRoleDetails.role }}</h5>
                <UnifiedButton variant="ghost" size="sm" icon-only :icon="'mdi-close'" @click="selectedRoleDetails = null" />
              </div>
              <div class="modal-body">
                <div class="skill-detail">
                  <div class="detail-row"><label>Match Score:</label><div class="confidence-detail confidence-high">{{ selectedRoleDetails.match }}%</div></div>
                  <div class="detail-row"><label>Description:</label><div>{{ selectedRoleDetails.pathway.description }}</div></div>
                  <div class="detail-row"><label>Core Skills:</label><div class="applications-list"><span v-for="c in selectedRoleDetails.pathway.stages.flatMap((s: any) => s.requirements || [])" :key="c" class="app-tag">{{ c }}</span></div></div>
                  <div class="detail-row"><label>Nice To Have:</label><div class="applications-list"><span v-for="c in selectedRoleDetails.pathway.stages.flatMap((s: any) => s.requirements || [])" :key="c" class="app-tag">{{ c }}</span></div></div>
                  <div class="detail-row"><label>Tools:</label><div class="applications-list"><span v-for="t in []" :key="t" class="app-tag">{{ t }}</span></div></div>
                </div>
              </div>
              <div class="modal-footer">
                <UnifiedButton variant="glass" @click="selectedRoleDetails = null">Close</UnifiedButton>
                <UnifiedButton variant="primary" leading-icon="mdi-briefcase-search">Find Jobs</UnifiedButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Export modal -->
        <div v-if="showExportModal" class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Export Skill Profile</h5>
                <UnifiedButton variant="ghost" size="sm" icon-only :icon="'mdi-close'" @click="showExportModal = false" />
              </div>
              <div class="modal-body">
                <p>Choose your desired export format:</p>
                <div class="export-options">
                  <UnifiedButton @click="handleExport('json')">JSON</UnifiedButton>
                  <UnifiedButton @click="handleExport('csv')">CSV</UnifiedButton>
                  <UnifiedButton @click="handleExport('pdf')">PDF</UnifiedButton>
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
import { ref, computed, onMounted } from 'vue'
import type { SkillExportOptions } from '../shared/types/skillMapping'
import GlassNavTabs from '../components/GlassNavTabs.vue'
import { useEnhancedSkillMapping } from '../composables/useEnhancedSkillMapping'
import { useUnifiedTheme } from '../shared/composables/useUnifiedTheme'
import { useUnifiedUI } from '../composables/useUnifiedUI'
import UnifiedButton from '../components/ui/UnifiedButton.vue'

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
  initialize
} = useEnhancedSkillMapping()

// Unified theme and UI systems
const _theme = (() => { try { return useUnifiedTheme() } catch { return undefined as any } })()
const _ui = useUnifiedUI()

// Local state
const _selectedCategory = ref<string>('all')
const showExportModal = ref(false)
const _newGameProfile = ref('')
const _newAchievement = ref('')
const analysisStage = ref('Processing gaming experience...')
const _selectedRoleId = ref<string>('')
const activeTab = ref('overview')
const _selectedCareer = ref<any>(null)
const selectedRoleDetails = ref<any>(null)
const skillWebWidth = ref(800)
const skillWebHeight = ref(600)

// Snapshots
const snapshots = ref<Snapshot[]>([])
const leftSnapKey = ref('')
const rightSnapKey = ref('')
const replaceSnapshots = ref(false)
const snapImport = ref<HTMLInputElement | null>(null)

// Tab configuration
const navTabs = computed(() => [
  { id: 'overview', label: 'Overview', icon: 'mdi-chart-box' },
  { id: 'skills', label: 'Skills', icon: 'mdi-view-list' },
  { id: 'network', label: 'Network', icon: 'mdi-graph' },
  { id: 'careers', label: 'Careers', icon: 'mdi-briefcase' },
  { id: 'compare', label: 'Compare', icon: 'mdi-compare' }
])

// Computed values for snapshot comparison
const leftSnap = computed(() => snapshots.value.find(s => s.key === leftSnapKey.value))
const rightSnap = computed(() => snapshots.value.find(s => s.key === rightSnapKey.value))
const diff = computed(() => {
  if (!leftSnap.value || !rightSnap.value) {
    return { onlyLeft: [], onlyRight: [], changed: [] }
  }
  // Simple diff logic - would be more sophisticated in real app
  return {
    onlyLeft: leftSnap.value.skills.filter(ls => !rightSnap.value?.skills.find(rs => rs.id === ls.id)),
    onlyRight: rightSnap.value.skills.filter(rs => !leftSnap.value?.skills.find(ls => ls.id === rs.id)),
    changed: []
  }
})

// Methods
const selectSkillFromNetwork = (node: any) => {
  selectedSkill.value = mappedSkills.value.find(s => s.id === node.id) || null
}

const handleExport = async (format: SkillExportOptions['format']) => {
  try {
    await exportSkills({ format, framework: 'discipline', includeAnalysis: false, includeEvidence: false, includeReadiness: false })
    showExportModal.value = false
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const saveSnapshot = () => {
  const snapshot: Snapshot = {
    key: Date.now().toString(),
    name: `Snapshot ${new Date().toLocaleDateString()}`,
    at: Date.now(),
    skills: [...mappedSkills.value]
  }
  snapshots.value.push(snapshot)
}

const exportSnapshots = () => {
  const data = JSON.stringify(snapshots.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'skill-snapshots.json'
  a.click()
}

const onImportSnapshots = (event: any) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedSnapshots = JSON.parse(e.target?.result as string)
      if (replaceSnapshots.value) {
        snapshots.value = importedSnapshots
      } else {
        snapshots.value.push(...importedSnapshots)
      }
    } catch (error) {
      console.error('Import failed:', error)
    }
  }
  reader.readAsText(file)
}

const deleteSnapshot = (key: string) => {
  snapshots.value = snapshots.value.filter(s => s.key !== key)
  if (leftSnapKey.value === key) leftSnapKey.value = ''
  if (rightSnapKey.value === key) rightSnapKey.value = ''
}

const renameSnapshot = (key: string, newName: string) => {
  const snapshot = snapshots.value.find(s => s.key === key)
  if (snapshot) {
    snapshot.name = newName
  }
}

const renameSnapshotPrompt = (key: string) => {
  const snapshot = pickSnap(key)
  if (!snapshot) return
  const newName = window.prompt('Rename snapshot', snapshot.name || '')
  if (newName) {
    renameSnapshot(key, newName)
  }
}

const pickSnap = (key: string) => snapshots.value.find(s => s.key === key)
const formatWhen = (timestamp: number) => new Date(timestamp).toLocaleDateString()

// Lifecycle
onMounted(() => {
  initialize()
})
</script>

<style scoped>
/* Gaming-themed modern design system */
.skill-mapper-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(18, 18, 23, 0.95) 0%,
    rgba(25, 25, 35, 0.9) 50%,
    rgba(30, 30, 45, 0.95) 100%
  );
  position: relative;
  overflow-x: hidden;
}

.skill-mapper-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(600px circle at 20% 30%, rgba(120, 119, 198, 0.15), transparent 50%),
    radial-gradient(800px circle at 80% 70%, rgba(255, 119, 198, 0.15), transparent 50%),
    radial-gradient(600px circle at 40% 80%, rgba(120, 255, 198, 0.1), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.skill-mapper-scroll-view {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Glass morphism surfaces */
.glass-surface {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  padding: 2rem;
  transition: all 0.3s ease;
}

.glass-surface:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Section headers */
.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #7c77c6, #ff77c6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

/* Input section */
.input-controls {
  max-width: 800px;
  margin: 0 auto;
}

.gaming-input-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gaming-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: white;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
}

.gaming-input:focus {
  outline: none;
  border-color: #7c77c6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(124, 119, 198, 0.3);
}

.gaming-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

/* Navigation tabs */
.navigation-tabs {
  margin-bottom: 2rem;
}

/* Metrics grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #7c77c6, #78ffc6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.metric-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Categories */
.categories-overview h3 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-name {
  color: white;
  font-weight: 600;
}

.category-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.category-percentage {
  color: #78ffc6;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Skills section */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.skill-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skill-header h4 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.skill-confidence {
  background: linear-gradient(135deg, #7c77c6, #78ffc6);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.skill-source {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.skill-applications {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.app-tag {
  background: rgba(120, 255, 198, 0.2);
  color: #78ffc6;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  border: 1px solid rgba(120, 255, 198, 0.3);
}

/* Network visualization */
.skill-web-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-network {
  width: 100%;
  height: 400px;
}

.connection {
  stroke: rgba(124, 119, 198, 0.3);
  stroke-width: 1;
}

.connection-strong {
  stroke: rgba(124, 119, 198, 0.6);
  stroke-width: 2;
}

.node-circle {
  fill: rgba(124, 119, 198, 0.7);
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s ease;
}

.node-circle:hover {
  fill: rgba(124, 119, 198, 1);
  stroke: rgba(255, 255, 255, 0.8);
}

.node-label {
  fill: white;
  text-anchor: middle;
  font-size: 12px;
  pointer-events: none;
}

.skill-web-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.skill-web-placeholder p {
  margin-top: 1rem;
}

/* Career section */
.career-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.career-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.career-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.career-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.career-header h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.career-match-score {
  background: linear-gradient(135deg, #ff77c6, #7c77c6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.career-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.career-match-details {
  color: #78ffc6;
  font-size: 0.9rem;
}

/* Comparison section */
.snapshot-controls {
  margin-bottom: 2rem;
}

.snapshot-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.snapshot-selector h4 {
  color: white;
  margin-bottom: 1rem;
}

.snapshot-info {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.snapshot-info > div {
  color: rgba(255, 255, 255, 0.7);
}

.diff-summary {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.diff-stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #78ffc6;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* Form controls */
.form-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  width: 100%;
}

.form-select:focus {
  outline: none;
  border-color: #7c77c6;
  background: rgba(255, 255, 255, 0.08);
}

.form-select option {
  background: #1a1a2e;
  color: white;
}

.form-check-label {
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Modals */
.modal {
  z-index: 1000;
}

.modal-content {
  background: rgba(25, 25, 35, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

.modal-title {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Export options */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

/* Skill detail modal */
.skill-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-row label {
  min-width: 120px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.confidence-detail {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

.confidence-high {
  background: linear-gradient(135deg, #78ffc6, #7c77c6);
  color: white;
}

.applications-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Responsive design */
@media (max-width: 768px) {
  .skill-mapper-scroll-view {
    padding: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .career-grid {
    grid-template-columns: 1fr;
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
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
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
