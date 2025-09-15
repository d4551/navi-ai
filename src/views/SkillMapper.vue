<template>
  <div class="skill-mapper-container font-sans">
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
        <p class="main-subtitle">Transform your gaming achievements into professional skills that employers understand</p>
        
        <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: analysisProgress + '%' }"></div>
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
            <div class="header-icon">DevicePhoneMobileIcon</div>
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
            leading-icon="SparklesIcon"
            :loading="isAnalyzing"
            :disabled="!analysisInput.description?.trim() || isAnalyzing"
            class="analyze-btn"
            @click="enhancedAnalyzeGamingExperience"
          >
            {{ isAnalyzing ? analysisStage : 'Analyze My Skills' }}
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
                <span class="translation-from">{{ translation.gameSkill }}</span>
                <span class="translation-arrow">→</span>
              </div>
              <div class="translation-to">Translates to Professional Skills:</div>
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
        <section v-show="activeTab === 'overview'" class="overview-section glass-surface">
          <div class="section-header">
            <h2>
              <AppIcon name="ChartBarIcon" size="large" />
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
                  <div class="category-percentage">{{ Math.round((category.count / mappedSkills.length) * 100) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Detailed Skills -->
        <section v-show="activeTab === 'skills'" class="skills-section glass-surface">
          <div class="section-header">
            <h2>
              <AppIcon name="ListBulletIcon" size="large" />
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
              <div v-if="skill.industryApplications?.length" class="skill-applications">
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
        <section v-show="activeTab === 'network'" class="network-section glass-panel">
          <div class="panel-header">
            <div class="header-icon">📊</div>
            <span class="header-title">Interactive Skill Web</span>
          </div>

          <div class="skill-web-container">
            <div v-if="skillWebData && skillWebData.nodes?.length" class="skill-network-visualization">
              <AppIcon name="ChartBarIcon" size="4rem" />
              <p>Interactive skill network visualization</p>
              <p class="network-stats">{{ skillWebData.nodes.length }} skills connected</p>
            </div>

            <div v-else class="skill-web-placeholder">
              <div class="placeholder-icon">🕸️</div>
              <p>Your skill network will appear here after analysis</p>
              <p class="placeholder-subtitle">Connect your gaming achievements to see how they map to professional competencies</p>
            </div>
          </div>
        </section>

        <!-- Career Recommendations -->
        <section v-show="activeTab === 'careers'" class="careers-section glass-panel">
          <div class="panel-header">
            <div class="header-icon">RocketLaunchIcon</div>
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
              <div class="career-match">{{ Math.round(career.match || 85) }}% Match</div>
              <div class="career-skills">
                {{ career.pathway?.description || 'Your gaming experience aligns perfectly with this career path. Your skills in strategy, teamwork, and problem-solving make you an excellent fit.' }}
              </div>
            </div>
          </div>
        </section>

        <!-- Compare snapshots -->
        <section v-show="activeTab === 'compare'" class="compare-section glass-surface">
          <div class="section-header">
            <h2>
              <AppIcon name="ScaleIcon" size="large" />
              Compare Results
            </h2>
            <p>Track changes in your skill analysis over time</p>
          </div>

          <div class="snapshot-controls">
            <div class="snapshot-actions">
              <UnifiedButton variant="primary" leading-icon="CameraIcon" @click="saveSnapshot">Save Current Results</UnifiedButton>
              <UnifiedButton variant="glass" leading-icon="ArrowUpTrayIcon" @click="exportSnapshots">Export All</UnifiedButton>
              <UnifiedButton variant="glass" leading-icon="ArrowDownTrayIcon" @click="triggerImport">Import</UnifiedButton>
              <input ref="snapImport" type="file" accept=".json" style="display: none" @change="onImportSnapshots">
              <label class="form-check-label ml-2">
                <input v-model="replaceSnapshots" type="checkbox" class="form-check-input"> Replace all on import
              </label>
            </div>
          </div>

          <div v-if="snapshots?.length >= 2" class="comparison-grid">
            <div class="snapshot-selector">
              <h4>Left Snapshot</h4>
              <select v-model="leftSnapKey" class="form-select">
                <option value="">Choose snapshot...</option>
                <option v-for="s in snapshots" :key="s.key" :value="s.key">{{ s.name }} ({{ formatWhen(s.at) }})</option>
              </select>
              <div v-if="leftSnap" class="snapshot-info">
                <div>{{ leftSnap.skills.length }} skills</div>
                <UnifiedButton size="xs" variant="glass" leading-icon="PencilIcon" :disabled="!leftSnapKey" @click="renameLeftSnapshot">Rename</UnifiedButton>
                <UnifiedButton size="xs" variant="outline" leading-icon="TrashIcon" :disabled="!leftSnapKey" @click="deleteSnapshot(leftSnapKey)">Delete</UnifiedButton>
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
                <UnifiedButton size="xs" variant="glass" leading-icon="PencilIcon" :disabled="!rightSnapKey" @click="renameRightSnapshot">Rename</UnifiedButton>
                <UnifiedButton size="xs" variant="outline" leading-icon="TrashIcon" :disabled="!rightSnapKey" @click="deleteSnapshot(rightSnapKey)">Delete</UnifiedButton>
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
        <div v-if="selectedRoleDetails" class="modal fade show block" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Career Role Details</h5>
                <UnifiedButton variant="ghost" size="sm" icon-only :icon="'XMarkIcon'" @click="selectedRoleDetails = null" />
              </div>
              <div class="modal-body">
                <p>Career role details would be displayed here.</p>
              </div>
              <div class="modal-footer">
                <UnifiedButton variant="glass" @click="selectedRoleDetails = null">Close</UnifiedButton>
                <UnifiedButton variant="primary" leading-icon="MagnifyingGlassIcon">Find Jobs</UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export modal -->
      <div v-if="showExportModal" class="modal fade show block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Export Your Skills</h5>
              <UnifiedButton variant="ghost" size="sm" icon-only :icon="'XMarkIcon'" @click="showExportModal = false" />
            </div>
            <div class="modal-body">
              <p>Choose how you'd like to export your skill analysis:</p>
              <div class="export-options">
                <UnifiedButton
                  variant="primary"
                  size="lg"
                  leading-icon="DocumentIcon-pdf-box"
                  @click="handleExport('pdf')"
                >
                  Export as PDF
                </UnifiedButton>
                <UnifiedButton
                  variant="gaming"
                  size="lg"
                  leading-icon="PhotoIcon"
                  @click="handleExport('image')"
                >
                  Export as Image
                </UnifiedButton>
                <UnifiedButton
                  variant="cyber"
                  size="lg"
                  leading-icon="ClipboardDocumentIcon"
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
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CameraIcon, ChartBarIcon, ClipboardDocumentIcon, ListBulletIcon, MagnifyingGlassIcon, PencilIcon, PhotoIcon, ScaleIcon, SparklesIcon, TrashIcon } from '@heroicons/vue/24/outline'

import { ref, computed, onMounted } from 'vue'
import GlassNavTabs from '@/components/GlassNavTabs.vue'
import { useEnhancedSkillMapping } from '@/composables/useEnhancedSkillMapping'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import { useUnifiedUI } from '@/composables/useUnifiedUI'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Global prompt declaration
declare const prompt: (_message?: string, _defaultText?: string) => string | null

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
const selectedCareer = ref<any>(null)
const selectedRoleDetails = ref<any>(null)
const _skillWebWidth = ref(800)
const _skillWebHeight = ref(600)

// New reactive data for enhanced UI
const analysisProgress = ref(0)
const gamingProfiles = ref([
  { id: 'twitch', name: 'Twitch', icon: '💜', selected: false },
  { id: 'steam', name: 'Steam', icon: '🎯', selected: false },
  { id: 'discord', name: 'Discord', icon: '💬', selected: true },
  { id: 'youtube', name: 'YouTube', icon: '📺', selected: false },
  { id: 'xbox', name: 'Xbox', icon: 'DevicePhoneMobileIcon', selected: false },
  { id: 'itch', name: 'itch.io', icon: '🎪', selected: false },
])

const achievements = ref([
  { id: 1, name: 'Tournament Winner', icon: 'TrophyIcon' },
  { id: 2, name: 'Guild Leader (500+ members)', icon: 'UsersIcon' },
  { id: 3, name: 'Data Analyst for Pro Team', icon: '📊' },
])

const gameTranslations = ref([
  {
    id: 1,
    gameSkill: 'Raid Leadership',
    professionalSkills: ['Project Management', 'Team Coordination', 'Strategic Planning']
  },
  {
    id: 2,
    gameSkill: 'Speedrunning',
    professionalSkills: ['Process Optimization', 'Problem Solving', 'Performance Analysis']
  },
  {
    id: 3,
    gameSkill: 'Meta Analysis',
    professionalSkills: ['Data Analytics', 'Pattern Recognition', 'Strategic Thinking']
  },
  {
    id: 4,
    gameSkill: 'Content Creation',
    professionalSkills: ['Digital Marketing', 'Community Management', 'Brand Building']
  }
])

// Snapshots
const snapshots = ref<any[]>([])
const leftSnapKey = ref('')
const rightSnapKey = ref('')
const replaceSnapshots = ref(false)

// Tab configuration
const navTabs = computed(() => [
  { id: 'overview', label: 'Overview', icon: 'ChartBarIcon-box' },
  { id: 'skills', label: 'Skills', icon: 'mdi-view-list' },
  { id: 'network', label: 'Network', icon: 'PresentationChartLineIcon' },
  { id: 'careers', label: 'Careers', icon: 'mdi-briefcase' },
  { id: 'compare', label: 'Compare', icon: 'mdi-compare' }
])

// Computed values for snapshot comparison
const leftSnap = computed(() => snapshots.value.find((s: any) => s.key === leftSnapKey.value))
const rightSnap = computed(() => snapshots.value.find((s: any) => s.key === rightSnapKey.value))
const diff = computed(() => {
  if (!leftSnap.value || !rightSnap.value) {
    return { onlyLeft: [], onlyRight: [], changed: [] }
  }
  // Simple diff logic
  return {
    onlyLeft: leftSnap.value.skills?.filter((ls: any) => !rightSnap.value.skills?.find((rs: any) => rs.id === ls.id)) || [],
    onlyRight: rightSnap.value.skills?.filter((rs: any) => !leftSnap.value.skills?.find((ls: any) => ls.id === rs.id)) || [],
    changed: []
  }
})

// Methods
const _selectSkillFromNetwork = (node: any) => {
  selectedSkill.value = mappedSkills.value.find(s => s.id === node.id) || null
}

const handleExport = async (format: string) => {
  try {
    // Simple export logic - would need to match the expected interface
    console.log('Exporting skills in format:', format)
    showExportModal.value = false
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const saveSnapshot = () => {
  const snapshot = {
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

const triggerImport = () => {
  // Create a temporary file input to trigger file selection
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = onImportSnapshots
  input.click()
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
  snapshots.value = snapshots.value.filter((s: any) => s.key !== key)
  if (leftSnapKey.value === key) leftSnapKey.value = ''
  if (rightSnapKey.value === key) rightSnapKey.value = ''
}

const renameSnapshot = (key: string, newName: string) => {
  const snapshot = snapshots.value.find((s: any) => s.key === key)
  if (snapshot) {
    snapshot.name = newName
  }
}

const renameLeftSnapshot = () => {
  const currentName = pickSnap(leftSnapKey.value)?.name || ''
  const newName = prompt('Rename snapshot', currentName)
  if (newName) {
    renameSnapshot(leftSnapKey.value, newName)
  }
}

const renameRightSnapshot = () => {
  const currentName = pickSnap(rightSnapKey.value)?.name || ''
  const newName = prompt('Rename snapshot', currentName)
  if (newName) {
    renameSnapshot(rightSnapKey.value, newName)
  }
}

const pickSnap = (key: string) => snapshots.value.find((s: any) => s.key === key)
const formatWhen = (timestamp: number) => new Date(timestamp).toLocaleDateString()

// New interactive methods
const toggleProfile = (profile: any) => {
  profile.selected = !profile.selected
}

const selectTranslation = (translation: any) => {
  // Add visual feedback for translation card selection
  console.log('Selected translation:', translation)
}

// Enhanced analyze function with progress tracking
const enhancedAnalyzeGamingExperience = async () => {
  analysisProgress.value = 0
  
  // Simulate progress updates
  const progressInterval = setInterval(() => {
    if (analysisProgress.value < 90) {
      analysisProgress.value += Math.random() * 10
    }
  }, 300)
  
  try {
    await analyzeGamingExperience()
    analysisProgress.value = 100
  } finally {
    clearInterval(progressInterval)
  }
}

// Lifecycle
onMounted(() => {
  initialize()
})
</script>

<style scoped>
/* Modern Gaming Skill Mapper - Enhanced Design System */
.skill-mapper-container {
  min-height: 100vh;
  background: var(--background-primary);
  position: relative;
  overflow-x: hidden;
  color: var(--text-primary-600);
}

/*

.skill-mapper-scroll-view {
  position: relative;
  z-index: 1;
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* Header Section */
.mapper-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-500), var(--color-accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.main-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  max-width: var(--page-narrow-width);
  margin: 0 auto var(--spacing-6) auto;
}

/* Progress Bar */
.progress-bar {
  height: 4px;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-6);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  border-radius: var(--radius-sm);
  width: 0%;
  transition: width var(--duration-normal) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
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

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  background: linear-gradient(135deg, var(--glass-bg), color-mix(in srgb, var(--color-primary-500) 10%, transparent));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--color-primary-500), transparent);
  opacity: 0.1;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-lg);
  border-color: var(--color-primary-300);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.stat-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
  position: relative;
  z-index: 1;
}

/* Main Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

/* Glass Panel System */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.glass-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-primary-300), transparent);
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.glass-panel:hover::before {
  opacity: 1;
}

.glass-panel:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-lg);
  border-color: var(--color-primary-300);
}

/* Panel Headers */
.panel-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
}

.header-title {
  color: var(--text-primary-600);
}

/* Form Elements */
.form-group {
  margin-bottom: var(--spacing-5);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.form-textarea {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--surface-container-low);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  color: var(--text-primary-600);
  font-family: inherit;
  transition: all var(--duration-normal) var(--easing-ease-out);
  resize: vertical;
  min-height: 120px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-300);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* Gaming Profiles Grid */
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.profile-chip {
  padding: 0.75rem;
  background: var(--dark-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.profile-chip::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, var(--primary), transparent);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
  border-radius: 50%;
}

.profile-chip:hover::before {
  width: 100px;
  height: 100px;
}

.profile-chip:hover {
  border-color: var(--primary);
  transform: scale(1.05);
}

.profile-chip.active {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-color: transparent;
  color: white;
}

.profile-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  position: relative;
  z-index: 1;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

/* Achievement Badges */
.achievements {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.achievement {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 2rem;
  font-size: 0.875rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

/* Translation Cards Grid */
.translation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.translation-card {
  background: var(--dark-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.translation-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s;
}

.translation-card:hover::after {
  transform: scaleX(1);
}

.translation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
}

.translation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.translation-from {
  font-weight: 600;
  color: var(--primary-light);
}

.translation-arrow {
  color: var(--text-secondary);
}

.translation-to {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.translation-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.skill-tag {
  padding: 0.25rem 0.5rem;
  background: var(--glass);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Analyze Button */
.analyze-btn {
  width: 100%;
  margin-top: 1rem;
}

/* Enhanced Tabs */
.enhanced-tabs {
  margin-bottom: 2rem;
}

/* Skill Network Visualization */
.skill-web-container {
  background: var(--dark-secondary);
  border-radius: 1rem;
  padding: 2rem;
  min-height: 400px;
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
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.placeholder-subtitle {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Enhanced Career Paths */
.career-paths {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.enhanced-career-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.enhanced-career-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent, var(--primary), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s;
  opacity: 0.1;
}

.enhanced-career-card:hover::before {
  transform: translateX(100%);
}

.enhanced-career-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
}

.career-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-light);
}

.career-match {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, var(--success), var(--accent));
  border-radius: 1rem;
  font-size: 0.875rem;
  color: white;
  margin-bottom: 1rem;
}

.career-skills {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .main-title {
    font-size: 2rem;
  }

  .skill-mapper-scroll-view {
    padding: 1rem;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .profiles-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .translation-grid {
    grid-template-columns: 1fr;
  }

  .career-paths {
    grid-template-columns: 1fr;
  }
}
</style>
