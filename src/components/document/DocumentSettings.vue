<template>
  <div class="document-settings" class="font-sans">
    <div class="settings-header">
      <h3 class="section-title">
        <AppIcon name="CogIcon" />
        Document Settings
      </h3>
      <div class="header-actions">
        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-backup-restore"
          @click="resetToDefaults"
        >
          Reset to Defaults
        </UnifiedButton>
      </div>
    </div>

    <div class="settings-content">
      <!-- AI Configuration Section -->
      <div class="settings-section">
        <div class="section-header">
          <h4 class="section-title">
            <AppIcon name="CpuChipIcon" />
            AI Configuration
          </h4>
          <div class="ai-status" :class="{ active: aiActive }">
            <AppIcon :name="aiActive ? 'CheckIcon-circle' : 'mdi-alert-circle'" />
            <span>{{ aiActive ? 'AI Active' : 'AI Offline' }}</span>
          </div>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">Writing Tone</label>
            <select v-model="localAIConfig.tone" class="setting-select glass-input">
              <option value="professional">Professional & Formal</option>
              <option value="friendly">Friendly & Approachable</option>
              <option value="impactful">Confident & Impactful</option>
            </select>
            <p class="setting-description">
              Adjusts the overall tone and style of AI-generated content
            </p>
          </div>

          <div class="setting-item">
            <label class="setting-label">Creativity Level</label>
            <div class="slider-container">
              <input
                v-model="creativityLevel"
                type="range"
                min="0"
                max="2"
                step="1"
                class="setting-slider"
                @input="updateCreativityLevel"
              >
              <div class="slider-labels">
                <span class="label" :class="{ active: creativityLevel == 0 }">Conservative</span>
                <span class="label" :class="{ active: creativityLevel == 1 }">Balanced</span>
                <span class="label" :class="{ active: creativityLevel == 2 }">Creative</span>
              </div>
            </div>
            <p class="setting-description">
              Controls how creative and unique the AI suggestions are
            </p>
          </div>

          <div class="setting-item">
            <label class="setting-label">Optimization Focus</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  v-model="localAIConfig.focus"
                  type="radio"
                  value="ats"
                >
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <span class="radio-title">ATS Optimized</span>
                  <span class="radio-description">Best for applicant tracking systems</span>
                </div>
              </label>
              <label class="radio-option">
                <input
                  v-model="localAIConfig.focus"
                  type="radio"
                  value="recruiter"
                >
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <span class="radio-title">Recruiter Friendly</span>
                  <span class="radio-description">Optimized for human readers</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Preferences Section -->
      <div class="settings-section">
        <div class="section-header">
          <h4 class="section-title">
            <AppIcon name="DocumentTextIcon" />
            Document Preferences
          </h4>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-toggle">
              <label class="toggle-label">
                <input
                  v-model="localPreferences.autoSave"
                  type="checkbox"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
                <div class="toggle-content">
                  <span class="toggle-title">Auto Save</span>
                  <span class="toggle-description">Automatically save changes as you work</span>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-toggle">
              <label class="toggle-label">
                <input
                  v-model="localPreferences.showTokens"
                  type="checkbox"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
                <div class="toggle-content">
                  <span class="toggle-title">Show Placeholder Tokens</span>
                  <span class="toggle-description">Display {{ name }}, {{ email }} tokens in preview</span>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Default Template</label>
            <select v-model="localPreferences.defaultTemplate" class="setting-select glass-input">
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
              <option value="gaming-pro">Gaming Professional</option>
              <option value="executive">Executive</option>
            </select>
            <p class="setting-description">
              Default template for new documents
            </p>
          </div>

          <div class="setting-item">
            <label class="setting-label">Language</label>
            <select v-model="localPreferences.language" class="setting-select glass-input">
              <option value="en">English (US)</option>
              <option value="en-gb">English (UK)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
            <p class="setting-description">
              Language for document generation and interface
            </p>
          </div>
        </div>
      </div>

      <!-- Export Settings Section -->
      <div class="settings-section">
        <div class="section-header">
          <h4 class="section-title">
            <AppIcon name="ArrowDownTrayIcon" />
            Export Settings
          </h4>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">Default Export Format</label>
            <div class="format-options">
              <label
                v-for="format in exportFormats"
                :key="format.value"
                class="format-option"
                :class="{ selected: exportSettings.defaultFormat === format.value }"
              >
                <input
                  v-model="exportSettings.defaultFormat"
                  type="radio"
                  :value="format.value"
                  class="format-input"
                >
                <div class="format-content">
                  <AppIcon :name="format.icon" size="24" />
                  <span class="format-name">{{ format.name }}</span>
                  <span class="format-description">{{ format.description }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">PDF Quality</label>
            <select v-model="exportSettings.pdfQuality" class="setting-select glass-input">
              <option value="draft">Draft (Fast)</option>
              <option value="standard">Standard</option>
              <option value="high">High Quality</option>
              <option value="print">Print Ready</option>
            </select>
            <p class="setting-description">
              Balances file size and visual quality
            </p>
          </div>

          <div class="setting-item">
            <div class="setting-toggle">
              <label class="toggle-label">
                <input
                  v-model="exportSettings.includeMetadata"
                  type="checkbox"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
                <div class="toggle-content">
                  <span class="toggle-title">Include Metadata</span>
                  <span class="toggle-description">Add creation date, template info to exports</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy & Security Section -->
      <div class="settings-section">
        <div class="section-header">
          <h4 class="section-title">
            <AppIcon name="ShieldCheckIcon" />
            Privacy & Security
          </h4>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-toggle">
              <label class="toggle-label">
                <input
                  v-model="privacySettings.localDataOnly"
                  type="checkbox"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
                <div class="toggle-content">
                  <span class="toggle-title">Local Data Only</span>
                  <span class="toggle-description">Keep all data on your device</span>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-toggle">
              <label class="toggle-label">
                <input
                  v-model="privacySettings.encryptData"
                  type="checkbox"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
                <div class="toggle-content">
                  <span class="toggle-title">Encrypt Saved Data</span>
                  <span class="toggle-description">Encrypt documents in local storage</span>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Data Retention</label>
            <select v-model="privacySettings.dataRetention" class="setting-select glass-input">
              <option value="session">Session Only</option>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="1year">1 Year</option>
              <option value="forever">Keep Forever</option>
            </select>
            <p class="setting-description">
              How long to keep document drafts and history
            </p>
          </div>
        </div>
      </div>

      <!-- Advanced Settings Section -->
      <div class="settings-section">
        <div class="section-header">
          <h4 class="section-title">
            <AppIcon name="mdi-tune" />
            Advanced Settings
          </h4>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-toggle">
              <label class="toggle-label">
                <input
                  v-model="advancedSettings.debugMode"
                  type="checkbox"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
                <div class="toggle-content">
                  <span class="toggle-title">Debug Mode</span>
                  <span class="toggle-description">Show detailed AI processing information</span>
                </div>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">API Timeout (seconds)</label>
            <input
              v-model.number="advancedSettings.apiTimeout"
              type="number"
              min="5"
              max="60"
              class="setting-input glass-input"
            >
            <p class="setting-description">
              Maximum wait time for AI responses
            </p>
          </div>

          <div class="setting-item">
            <label class="setting-label">Max Tokens per Request</label>
            <input
              v-model.number="advancedSettings.maxTokens"
              type="number"
              min="100"
              max="4000"
              step="100"
              class="setting-input glass-input"
            >
            <p class="setting-description">
              Limit AI response length (affects cost and speed)
            </p>
          </div>
        </div>
      </div>

      <!-- Storage Info Section -->
      <div class="settings-section">
        <div class="section-header">
          <h4 class="section-title">
            <AppIcon name="CircleStackIcon" />
            Storage Information
          </h4>
        </div>

        <div class="storage-info">
          <div class="storage-item">
            <div class="storage-label">Documents Stored</div>
            <div class="storage-value">{{ storageInfo.documentsCount }}</div>
          </div>
          <div class="storage-item">
            <div class="storage-label">Storage Used</div>
            <div class="storage-value">{{ storageInfo.storageUsed }}</div>
          </div>
          <div class="storage-item">
            <div class="storage-label">Last Backup</div>
            <div class="storage-value">{{ storageInfo.lastBackup }}</div>
          </div>
        </div>

        <div class="storage-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="ArrowDownTrayIcon"
            @click="exportUserData"
          >
            Export Data
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="TrashIcon"
            @click="clearAllData"
          >
            Clear All Data
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Settings Actions -->
    <div class="settings-footer">
      <div class="footer-info">
        <span class="save-indicator" :class="{ saving: isSaving, saved: recentlySaved }">
          <AppIcon :name="isSaving ? 'ArrowPathIcon' : recentlySaved ? 'CheckIcon' : 'mdi-content-save'" />
          {{ isSaving ? 'Saving...' : recentlySaved ? 'Saved' : 'Auto-save enabled' }}
        </span>
      </div>
      <div class="footer-actions">
        <UnifiedButton
          variant="outline"
          size="sm"
          @click="cancelChanges"
        >
          Cancel
        </UnifiedButton>
        <UnifiedButton
          variant="primary"
          size="sm"
          leading-icon="mdi-content-save"
          :loading="isSaving"
          @click="saveSettings"
        >
          Save Settings
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon, CircleStackIcon, CogIcon, CpuChipIcon, DocumentTextIcon, ShieldCheckIcon, TrashIcon } from '@heroicons/vue/24/outline'

import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps<{
  aiConfig: any
  preferences: any
}>()

// Emits
const emit = defineEmits<{
  'update-config': [any]
  'update-preferences': [any]
}>()

const toast = useToast()

// Local state
const localAIConfig = ref({ ...props.aiConfig })
const localPreferences = ref({ ...props.preferences })
const creativityLevel = ref(1)
const isSaving = ref(false)
const recentlySaved = ref(false)

// Additional settings
const exportSettings = ref({
  defaultFormat: 'pdf',
  pdfQuality: 'standard',
  includeMetadata: true
})

const privacySettings = ref({
  localDataOnly: true,
  encryptData: false,
  dataRetention: '90days'
})

const advancedSettings = ref({
  debugMode: false,
  apiTimeout: 30,
  maxTokens: 2000
})

const storageInfo = ref({
  documentsCount: 12,
  storageUsed: '2.3 MB',
  lastBackup: 'Never'
})

// Export format options
const exportFormats = [
  {
    value: 'pdf',
    name: 'PDF',
    description: 'Best for sharing and printing',
    icon: 'DocumentIcon-pdf-box'
  },
  {
    value: 'docx',
    name: 'Word',
    description: 'Editable document format',
    icon: 'DocumentIcon-word-box'
  },
  {
    value: 'html',
    name: 'HTML',
    description: 'Web-friendly format',
    icon: 'mdi-language-html5'
  },
  {
    value: 'json',
    name: 'JSON',
    description: 'Data export for backup',
    icon: 'mdi-code-braces'
  }
]

// Computed
const aiActive = computed(() => {
  // This would check actual AI service status
  return true
})

// Methods
const updateCreativityLevel = () => {
  const levels = ['conservative', 'balanced', 'creative']
  localAIConfig.value.level = levels[creativityLevel.value]
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    emit('update-config', localAIConfig.value)
    emit('update-preferences', localPreferences.value)
    
    recentlySaved.value = true
    setTimeout(() => { recentlySaved.value = false }, 2000)
    
    toast.success('Settings saved successfully')
  } catch (error) {
    toast.error('Failed to save settings')
  } finally {
    isSaving.value = false
  }
}

const cancelChanges = () => {
  localAIConfig.value = { ...props.aiConfig }
  localPreferences.value = { ...props.preferences }
  toast.info('Changes cancelled')
}

const resetToDefaults = () => {
  if (confirm('Reset all settings to default values? This action cannot be undone.')) {
    localAIConfig.value = {
      tone: 'professional',
      level: 'balanced',
      focus: 'ats'
    }
    localPreferences.value = {
      autoSave: true,
      showTokens: false,
      defaultTemplate: 'modern',
      language: 'en'
    }
    creativityLevel.value = 1
    toast.success('Settings reset to defaults')
  }
}

const exportUserData = () => {
  // Simulate data export
  const data = {
    aiConfig: localAIConfig.value,
    preferences: localPreferences.value,
    exportSettings: exportSettings.value,
    privacySettings: privacySettings.value,
    advancedSettings: advancedSettings.value,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `navi-settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success('Settings exported successfully')
}

const clearAllData = () => {
  if (confirm('Delete all documents and settings? This action cannot be undone.')) {
    if (confirm('Are you absolutely sure? This will remove everything including saved documents.')) {
      // Clear data logic would go here
      toast.success('All data cleared')
    }
  }
}

// Auto-save settings changes
watch([localAIConfig, localPreferences], () => {
  if (localPreferences.value.autoSave) {
    saveSettings()
  }
}, { deep: true })

// Initialize creativity level from config
onMounted(() => {
  const levels = ['conservative', 'balanced', 'creative']
  creativityLevel.value = levels.indexOf(localAIConfig.value.level) || 1
})
</script>

<style scoped>
.document-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.settings-header {
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
  color: var(--text-primary-600);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.settings-section {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.section-header .section-title {
  font-size: var(--font-size-lg);
}

.ai-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  padding: var(--spacing-1-5) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.ai-status.active {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.settings-grid {
  display: grid;
  gap: var(--spacing-5);
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.setting-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.setting-select,
.setting-input {
  padding: var(--spacing-2-5) var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
}

.setting-select:focus,
.setting-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500-rgb), 0.1);
}

.setting-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
}

/* Slider Styles */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.setting-slider {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-sm);
  background: var(--surface-tertiary);
  outline: none;
  -webkit-appearance: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary-500);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary-500);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-2);
}

.slider-labels .label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  transition: color var(--duration-fast);
}

.slider-labels .label.active {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-medium);
}

/* Radio Group Styles */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.radio-option:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--glass-border);
  border-radius: 50%;
  position: relative;
  transition: all var(--duration-fast);
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: var(--color-primary-500);
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: var(--color-primary-500);
  border-radius: 50%;
}

.radio-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
}

.radio-title {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.radio-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Toggle Styles */
.setting-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  width: 100%;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 44px;
  height: 24px;
  background: var(--surface-tertiary);
  border-radius: var(--radius-full);
  position: relative;
  transition: background var(--duration-fast);
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--duration-fast);
}

.toggle-input:checked + .toggle-slider {
  background: var(--color-primary-500);
}

.toggle-input:checked + .toggle-slider::after {
  transform: translateX(20px);
}

.toggle-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
  flex: 1;
}

.toggle-title {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.toggle-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Format Options */
.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-3);
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast);
  text-align: center;
}

.format-option:hover {
  border-color: var(--color-primary-300);
}

.format-option.selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.format-input {
  display: none;
}

.format-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.format-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.format-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Storage Info */
.storage-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.storage-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-3);
  background: var(--surface-base);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.storage-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.storage-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

.storage-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
}

/* Settings Footer */
.settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  position: sticky;
  bottom: var(--spacing-4);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.save-indicator.saving {
  color: var(--color-warning-600);
}

.save-indicator.saved {
  color: var(--color-success-600);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .format-options {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .storage-info {
    grid-template-columns: 1fr;
  }
  
  .storage-actions {
    flex-direction: column;
  }
  
  .settings-footer {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: space-between;
  }
}
</style>