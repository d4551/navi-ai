<template>
  <div v-if="show" class="version-history-overlay font-sans" @click="handleOverlayClick">
    <div class="version-history-panel">
      <div class="panel-header">
        <div class="header-content">
          <AppIcon name="mdi-history" size="20" />
          <h3 class="panel-title">Version History</h3>
          <div class="document-info">
            <span class="document-type">{{ currentDocument }}</span>
            <span class="version-count">{{ versions.length }} versions</span>
          </div>
        </div>
        <UnifiedButton
          variant="ghost"
          size="sm"
          leading-icon="XMarkIcon"
          @click="$emit('close')"
        />
      </div>

      <div class="panel-content">
        <!-- Version Filters -->
        <div class="version-filters">
          <div class="filter-group">
            <label class="filter-label">Filter by:</label>
            <select v-model="selectedFilter" class="filter-select glass-input">
              <option value="all">All Versions</option>
              <option value="manual">Manual Saves</option>
              <option value="auto">Auto Saves</option>
              <option value="major">Major Changes</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Time Range:</label>
            <select v-model="timeFilter" class="filter-select glass-input">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <!-- Version Timeline -->
        <div v-if="filteredVersions.length" class="version-timeline">
          <div
            v-for="version in filteredVersions"
            :key="version.id"
            class="version-item"
            :class="{ 
              selected: selectedVersion?.id === version.id,
              current: version.id === 'current'
            }"
            @click="selectVersion(version)"
          >
            <div class="version-marker">
              <div class="marker-dot" :class="getVersionType(version)"></div>
              <div v-if="version !== filteredVersions[filteredVersions.length - 1]" class="marker-line"></div>
            </div>

            <div class="version-content">
              <div class="version-header">
                <div class="version-info">
                  <h4 class="version-title">{{ getVersionTitle(version) }}</h4>
                  <div class="version-meta">
                    <span class="version-time">{{ formatTime(version.timestamp) }}</span>
                    <span class="version-type" :class="getVersionType(version)">
                      {{ getVersionTypeLabel(version) }}
                    </span>
                  </div>
                </div>
                <div class="version-actions">
                  <UnifiedButton
                    v-if="version.id !== 'current'"
                    variant="ghost"
                    size="xs"
                    leading-icon="EyeIcon"
                    @click.stop="previewVersion(version)"
                  >
                    Preview
                  </UnifiedButton>
                  <UnifiedButton
                    v-if="version.id !== 'current'"
                    variant="outline"
                    size="xs"
                    leading-icon="mdi-restore"
                    @click.stop="confirmRevert(version)"
                  >
                    Restore
                  </UnifiedButton>
                </div>
              </div>

              <div v-if="version.changes" class="version-changes">
                <div class="changes-summary">
                  <span v-if="version.changes.additions" class="change-stat">
                    <AppIcon name="PlusIcon" size="12" />
                    {{ version.changes.additions }} additions
                  </span>
                  <span v-if="version.changes.modifications" class="change-stat">
                    <AppIcon name="PencilIcon" size="12" />
                    {{ version.changes.modifications }} modifications
                  </span>
                  <span v-if="version.changes.deletions" class="change-stat">
                    <AppIcon name="MinusIcon" size="12" />
                    {{ version.changes.deletions }} deletions
                  </span>
                </div>
                <div v-if="version.changes.description" class="change-description">
                  {{ version.changes.description }}
                </div>
              </div>

              <!-- Version Preview -->
              <div v-if="version.preview && expandedVersion === version.id" class="version-preview">
                <div class="preview-header">
                  <span class="preview-label">Content Preview:</span>
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="ChevronUpIcon"
                    @click="expandedVersion = null"
                  />
                </div>
                <div class="preview-content">
                  <div v-if="version.preview.summary" class="preview-section">
                    <strong>Summary:</strong>
                    <p class="preview-text">{{ truncateText(version.preview.summary, 100) }}</p>
                  </div>
                  <div v-if="version.preview.experience" class="preview-section">
                    <strong>Experience:</strong>
                    <p class="preview-text">{{ version.preview.experience.length }} positions</p>
                  </div>
                  <div v-if="version.preview.skills" class="preview-section">
                    <strong>Skills:</strong>
                    <p class="preview-text">{{ version.preview.skills.length }} skills listed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!filteredVersions.length" class="empty-state">
            <AppIcon name="mdi-history" size="48" />
            <h4>No versions found</h4>
            <p>No versions match your current filter criteria.</p>
            <UnifiedButton
              variant="outline"
              size="sm"
              @click="clearFilters"
            >
              Clear Filters
            </UnifiedButton>
          </div>
        </div>

        <!-- Version Comparison -->
        <div v-if="selectedVersion && compareVersion" class="version-comparison">
          <div class="comparison-header">
            <h4 class="comparison-title">
              <AppIcon name="ScaleIcon" />
              Comparing Versions
            </h4>
            <UnifiedButton
              variant="ghost"
              size="xs"
              leading-icon="XMarkIcon"
              @click="clearComparison"
            >
              Close Comparison
            </UnifiedButton>
          </div>
          
          <div v-if="comparison" class="comparison-content">
            <div class="comparison-side">
              <h5 class="side-title">{{ getVersionTitle(selectedVersion) }}</h5>
              <div class="side-content">
                <div class="preview-section">
                  <strong>Summary:</strong>
                  <p class="preview-text">{{ comparison.summary.after || '(none)' }}</p>
                </div>
                <div class="preview-section">
                  <strong>Experience items:</strong>
                  <p class="preview-text">{{ comparison.experience.after }} positions</p>
                  <span v-if="comparison.experience.delta > 0" class="change-positive">
                    +{{ comparison.experience.delta }}
                  </span>
                  <span v-else-if="comparison.experience.delta < 0" class="change-negative">
                    {{ comparison.experience.delta }}
                  </span>
                </div>
                <div v-if="comparison.skills.added.length" class="preview-section">
                  <strong>Skills added:</strong>
                  <div class="skill-tags">
                    <span v-for="skill in comparison.skills.added" :key="skill" class="skill-tag added">
                      {{ skill }}
                    </span>
                  </div>
                </div>
                <div v-if="comparison.sections.added.length" class="preview-section">
                  <strong>Sections added:</strong>
                  <p class="preview-text">{{ comparison.sections.added.join(', ') }}</p>
                </div>
              </div>
            </div>
            <div class="comparison-divider"></div>
            <div class="comparison-side">
              <h5 class="side-title">{{ getVersionTitle(compareVersion) }}</h5>
              <div class="side-content">
                <div class="preview-section">
                  <strong>Summary:</strong>
                  <p class="preview-text">{{ comparison.summary.before || '(none)' }}</p>
                </div>
                <div class="preview-section">
                  <strong>Experience items:</strong>
                  <p class="preview-text">{{ comparison.experience.before }} positions</p>
                </div>
                <div v-if="comparison.skills.removed.length" class="preview-section">
                  <strong>Skills removed:</strong>
                  <div class="skill-tags">
                    <span v-for="skill in comparison.skills.removed" :key="skill" class="skill-tag removed">
                      {{ skill }}
                    </span>
                  </div>
                </div>
                <div v-if="comparison.sections.removed.length" class="preview-section">
                  <strong>Sections removed:</strong>
                  <p class="preview-text">{{ comparison.sections.removed.join(', ') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <div class="footer-info">
          <span class="storage-info">
            <AppIcon name="CircleStackIcon" size="14" />
            {{ calculateStorageUsed() }} storage used
          </span>
        </div>
        <div class="footer-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="ArrowDownTrayIcon"
            @click="exportVersionHistory"
          >
            Export History
          </UnifiedButton>
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="TrashIcon-sweep"
            @click="confirmCleanup"
          >
            Cleanup Old Versions
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="sm"
            @click="$emit('close')"
          >
            Close
          </UnifiedButton>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showRevertConfirm" class="confirm-overlay" @click="showRevertConfirm = false">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-header">
            <AppIcon name="mdi-restore" size="20" />
            <h4>Confirm Version Restore</h4>
          </div>
          <div class="confirm-content">
            <p>
              Are you sure you want to restore to "{{ getVersionTitle(revertTarget) }}"?
            </p>
            <p class="confirm-warning">
              This will replace your current document with the selected version.
              Your current work will be saved as a new version before restoring.
            </p>
          </div>
          <div class="confirm-actions">
            <UnifiedButton
              variant="ghost"
              size="sm"
              @click="showRevertConfirm = false"
            >
              Cancel
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              size="sm"
              @click="handleRevert"
            >
              Restore Version
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, ChevronUpIcon, CircleStackIcon, EyeIcon, MinusIcon, PencilIcon, PlusIcon, ScaleIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps<{
  show: boolean
  versions: any[]
  currentDocument: string
}>()

// Emits
const emit = defineEmits<{
  'close': []
  'revert': [any]
}>()

const toast = useToast()

// State
const selectedFilter = ref('all')
const timeFilter = ref('all')
const selectedVersion = ref<any>(null)
const compareVersion = ref<any>(null)
const expandedVersion = ref<string | null>(null)
const showRevertConfirm = ref(false)
const revertTarget = ref<any>(null)

// Version data processing and management
const sampleVersions = [
  {
    id: 'current',
    label: 'Current Version',
    timestamp: Date.now(),
    type: 'current',
    changes: null,
    preview: null
  },
  {
    id: 'v1',
    label: 'After AI Enhancement',
    timestamp: Date.now() - 3600000,
    type: 'ai',
    changes: {
      additions: 3,
      modifications: 5,
      deletions: 1,
      description: 'AI enhanced summary and experience descriptions'
    },
    preview: {
      summary: 'Dynamic software engineer with 5+ years of experience in full-stack development...',
      experience: [{ title: 'Senior Developer' }],
      skills: ['JavaScript', 'React', 'Node.js']
    }
  },
  {
    id: 'v2',
    label: 'Manual Save',
    timestamp: Date.now() - 7200000,
    type: 'manual',
    changes: {
      additions: 1,
      modifications: 2,
      deletions: 0,
      description: 'Added new project and updated skills'
    },
    preview: {
      summary: 'Software engineer with experience in web development...',
      experience: [{ title: 'Developer' }],
      skills: ['JavaScript', 'React']
    }
  },
  {
    id: 'v3',
    label: 'Auto Save',
    timestamp: Date.now() - 10800000,
    type: 'auto',
    changes: {
      additions: 2,
      modifications: 1,
      deletions: 0,
      description: 'Auto-saved while editing experience section'
    },
    preview: {
      summary: 'Software engineer with web development experience...',
      experience: [{ title: 'Junior Developer' }],
      skills: ['JavaScript']
    }
  }
]

// Computed
const allVersions = computed(() => {
  // Merge actual versions with current document state and add auto-saved versions from localStorage
  const baseVersions = props.versions.length ? props.versions : sampleVersions
  
  // Add any auto-saved versions from localStorage
  const autoSavedVersions = loadAutoSavedVersions()
  
  return [...baseVersions, ...autoSavedVersions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

const filteredVersions = computed(() => {
  let filtered = allVersions.value

  // Filter by type
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(v => {
      switch (selectedFilter.value) {
        case 'manual':
          return v.type === 'manual'
        case 'auto':
          return v.type === 'auto'
        case 'major':
          return v.changes && (v.changes.additions + v.changes.modifications) >= 5
        default:
          return true
      }
    })
  }

  // Filter by time
  if (timeFilter.value !== 'all') {
    const now = Date.now()
    const timeRanges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }
    const range = timeRanges[timeFilter.value as keyof typeof timeRanges]
    filtered = filtered.filter(v => now - v.timestamp <= range)
  }

  return filtered.sort((a, b) => b.timestamp - a.timestamp)
})

// Methods
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const selectVersion = (version: any) => {
  if (selectedVersion.value?.id === version.id) {
    selectedVersion.value = null
    expandedVersion.value = null
    compareVersion.value = null
  } else {
    selectedVersion.value = version
    expandedVersion.value = version.id
    // Auto-pick compare target as the next (older) version in the filtered list
    const idx = filteredVersions.value.findIndex(v => v.id === version.id)
    compareVersion.value = idx >= 0 ? (filteredVersions.value[idx + 1] || null) : null
  }
}

const previewVersion = (version: any) => {
  try {
    // Show version content in a preview modal or panel
    if (version.data) {
      // Create a preview of the version data
      const previewContent = JSON.stringify(version.data, null, 2)
      
      // Use a simple alert for now, could be enhanced with a modal
      const shortPreview = previewContent.length > 500 
        ? previewContent.substring(0, 500) + '...' 
        : previewContent
        
      alert(`Version Preview: ${getVersionTitle(version)}\n\nContent:\n${shortPreview}`)
    } else {
      toast.warning('No preview data available for this version')
    }
  } catch (error) {
    console.error('Version preview failed:', error)
    toast.error('Failed to preview version')
  }
}

const confirmRevert = (version: any) => {
  revertTarget.value = version
  showRevertConfirm.value = true
}

const handleRevert = () => {
  if (revertTarget.value) {
    emit('revert', revertTarget.value)
    showRevertConfirm.value = false
    revertTarget.value = null
    toast.success(`Restored to version: ${getVersionTitle(revertTarget.value)}`)
  }
}

const getVersionType = (version: any) => {
  return version.type || 'manual'
}

const getVersionTypeLabel = (version: any) => {
  const labels = {
    current: 'Current',
    manual: 'Manual Save',
    auto: 'Auto Save',
    ai: 'AI Enhancement',
    import: 'Import'
  }
  return labels[version.type as keyof typeof labels] || 'Manual'
}

const getVersionTitle = (version: any) => {
  if (version.label) return version.label
  if (version.id === 'current') return 'Current Version'
  return `Version ${version.id}`
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text
  return text.substring(0, limit) + '...'
}

const clearFilters = () => {
  selectedFilter.value = 'all'
  timeFilter.value = 'all'
}

const clearComparison = () => {
  compareVersion.value = null
  selectedVersion.value = null
}

const calculateStorageUsed = () => {
  // Simulate storage calculation
  const totalVersions = allVersions.value.length
  const estimatedSize = totalVersions * 2.5 // KB per version
  return estimatedSize > 1024 ? `${(estimatedSize / 1024).toFixed(1)} MB` : `${estimatedSize.toFixed(0)} KB`
}

const exportVersionHistory = () => {
  const data = {
    document: props.currentDocument,
    exportedAt: new Date().toISOString(),
    versions: allVersions.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.currentDocument}-version-history.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success('Version history exported successfully')
}

const loadAutoSavedVersions = () => {
  try {
    const savedVersionsKey = `navi-versions-${props.currentDocument}`
    const savedVersionsData = localStorage.getItem(savedVersionsKey)
    
    if (savedVersionsData) {
      const parsed = JSON.parse(savedVersionsData)
      return Array.isArray(parsed) ? parsed : []
    }
    
    return []
  } catch (error) {
    console.error('Failed to load auto-saved versions:', error)
    return []
  }
}


const confirmCleanup = () => {
  if (confirm('Remove old auto-save versions older than 30 days? This cannot be undone.')) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30)
      
      const savedVersionsKey = `navi-versions-${props.currentDocument}`
      const existingVersions = loadAutoSavedVersions()
      
      const filteredVersions = existingVersions.filter(version => {
        const versionDate = new Date(version.timestamp)
        return versionDate > cutoffDate
      })
      
      localStorage.setItem(savedVersionsKey, JSON.stringify(filteredVersions))
      
      const removedCount = existingVersions.length - filteredVersions.length
      toast.success(`Cleaned up ${removedCount} old versions`)
      
    } catch (error) {
      console.error('Cleanup failed:', error)
      toast.error('Failed to cleanup old versions')
    }
  }
}

// ---- Minimal comparison helpers ----
function normalizeSkills(input: any): string[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((s: any) => (typeof s === 'string' ? s : (s?.name || ''))).filter(Boolean)
  }
  return []
}

function getPreviewData(v: any): { summary: string; experienceCount: number; skills: string[] } {
  const p = v?.preview || v || {}
  const summary = String(p.summary || v?.summary || '').trim()
  const experience = Array.isArray(p.experience)
    ? p.experience
    : (Array.isArray(v?.experience) ? v.experience : [])
  const skills = normalizeSkills(p.skills ?? v?.skills ?? [])
  return { summary, experienceCount: experience.length || 0, skills }
}

const comparison = computed(() => {
  if (!selectedVersion.value || !compareVersion.value) return null
  const newer = getPreviewData(selectedVersion.value)
  const older = getPreviewData(compareVersion.value)
  const added = newer.skills.filter(s => !older.skills.includes(s))
  const removed = older.skills.filter(s => !newer.skills.includes(s))
  return {
    summary: { before: older.summary || '(none)', after: newer.summary || '(none)' },
    experience: {
      before: older.experienceCount,
      after: newer.experienceCount,
      delta: newer.experienceCount - older.experienceCount
    },
    skills: { added, removed }
  }
})
</script>

<style scoped>
.version-history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.version-history-panel {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-5);
  border-b: 1px solid var(--glass-border);
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--surface-base) 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.panel-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

.document-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.document-type {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.version-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-5);
}

.version-filters {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
  padding: var(--spacing-3);
  background: var(--surface-base);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.filter-select {
  padding: var(--spacing-1-5) var(--spacing-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
}

.version-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.version-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast);
  position: relative;
}

.version-item:hover {
  background: var(--surface-base);
  border-color: var(--glass-border);
}

.version-item.selected {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.version-item.current {
  background: linear-gradient(135deg, var(--color-success-50) 0%, var(--surface-base) 100%);
  border-color: var(--color-success-200);
}

.version-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--surface-base);
  position: relative;
  z-index: 1;
}

.marker-dot.current {
  background: var(--color-success-500);
}

.marker-dot.manual {
  background: var(--color-primary-500);
}

.marker-dot.auto {
  background: var(--color-info-500);
}

.marker-dot.ai {
  background: var(--color-gaming-500);
}

.marker-line {
  width: 2px;
  height: 40px;
  background: var(--glass-border);
  margin-top: var(--spacing-1);
}

.version-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.version-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.version-info {
  flex: 1;
}

.version-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
}

.version-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.version-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.version-type {
  padding: var(--spacing-0-5) var(--spacing-1-5);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.version-type.current {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.version-type.manual {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.version-type.auto {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.version-type.ai {
  background: var(--color-gaming-100);
  color: var(--color-gaming-700);
}

.version-actions {
  display: flex;
  gap: var(--spacing-2);
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.version-item:hover .version-actions {
  opacity: 1;
}

.version-changes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.changes-summary {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.change-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.change-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-style: italic;
}

.version-preview {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.preview-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.preview-section {
  font-size: var(--font-size-xs);
}

.preview-text {
  margin: var(--spacing-1) 0 0;
  color: var(--text-secondary);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
}

.skill-tag {
  padding: var(--spacing-0-5) var(--spacing-1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.skill-tag.added {
  background: var(--color-success-100);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-200);
}

.skill-tag.removed {
  background: var(--color-danger-100);
  color: var(--color-danger-700);
  border: 1px solid var(--color-danger-200);
}

.change-positive {
  color: var(--color-success-600);
  font-weight: var(--font-weight-semibold);
  margin-left: var(--spacing-1);
}

.change-negative {
  color: var(--color-danger-600);
  font-weight: var(--font-weight-semibold);
  margin-left: var(--spacing-1);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--text-secondary);
}

.empty-state h4 {
  margin: var(--spacing-3) 0 var(--spacing-2);
  color: var(--text-primary-600);
}

.version-comparison {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.comparison-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

.comparison-content {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: var(--spacing-4);
}

.comparison-side {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.side-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0;
}

.comparison-divider {
  background: var(--glass-border);
}

.placeholder-text {
  color: var(--text-tertiary);
  font-style: italic;
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-4);
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  border-t: 1px solid var(--glass-border);
  background: var(--surface-base);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.storage-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-2);
}

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-modal {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  max-width: 480px;
  width: 90%;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.confirm-header h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

.confirm-content {
  margin-bottom: var(--spacing-6);
}

.confirm-content p {
  margin-bottom: var(--spacing-3);
  color: var(--text-primary-600);
}

.confirm-warning {
  color: var(--color-warning-600);
  font-size: var(--font-size-sm);
  background: var(--color-warning-50);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-warning-200);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .version-history-overlay {
    padding: var(--spacing-2);
  }
  
  .version-history-panel {
    max-height: 95vh;
  }
  
  .version-filters {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
  
  .version-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .version-actions {
    opacity: 1;
    align-self: flex-end;
  }
  
  .panel-footer {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: space-between;
  }
  
  .comparison-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
  
  .comparison-divider {
    display: none;
  }
}
</style>
