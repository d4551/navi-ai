<template>
  <div class="css-migration-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon name="palette" />
        </div>
        <div class="header-text">
          <h2>CSS Migration Tool</h2>
          <p>Rapidly apply global design system while preserving IDs and attributes</p>
        </div>
      </div>
      <UnifiedButton
        variant="ghost"
        size="sm"
        @click="togglePanel"
      >
        <Icon :name="isExpanded ? 'chevron-up' : 'chevron-down'" />
      </UnifiedButton>
    </div>

    <!-- Panel Content -->
    <div v-if="isExpanded" class="panel-content">
      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Migrations</h3>
        <div class="action-grid">
          <UnifiedButton
            variant="primary"
            size="sm"
            :disabled="isRunning"
            @click="migrateButtons"
          >
            <Icon name="square" />
            Migrate Buttons
          </UnifiedButton>
          
          <UnifiedButton
            variant="primary"
            size="sm"
            :disabled="isRunning"
            @click="migrateCards"
          >
            <Icon name="credit-card" />
            Migrate Cards
          </UnifiedButton>
          
          <UnifiedButton
            variant="primary"
            size="sm"
            :disabled="isRunning"
            @click="migrateInputs"
          >
            <Icon name="type" />
            Migrate Inputs
          </UnifiedButton>
          
          <UnifiedButton
            variant="warning"
            size="sm"
            :disabled="isRunning"
            @click="migratePage"
          >
            <Icon name="globe" />
            Migrate Entire Page
          </UnifiedButton>
        </div>
      </div>

      <!-- Custom Selector -->
      <div class="custom-selector">
        <h3>Custom Migration</h3>
        <div class="selector-form">
          <div class="form-group">
            <label for="css-selector">CSS Selector</label>
            <input
              id="css-selector"
              v-model="customSelector"
              type="text"
              placeholder="e.g., .my-component, #header, button.primary"
              class="selector-input"
            />
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="options.dryRun" type="checkbox" />
              <span>Dry Run (preview only)</span>
            </label>
            
            <label class="checkbox-label">
              <input v-model="options.preserveIds" type="checkbox" />
              <span>Preserve IDs</span>
            </label>
            
            <label class="checkbox-label">
              <input v-model="options.backupStyles" type="checkbox" />
              <span>Backup Styles</span>
            </label>
          </div>
          
          <UnifiedButton
            variant="secondary"
            :disabled="!customSelector || isRunning"
            @click="migrateCustom"
          >
            <Icon name="play" />
            {{ options.dryRun ? 'Preview Migration' : 'Apply Migration' }}
          </UnifiedButton>
        </div>
      </div>

      <!-- Results -->
      <div v-if="lastReport" class="migration-results">
        <h3>Migration Results</h3>
        <div class="results-grid">
          <div class="result-stat">
            <Icon name="check-circle" class="stat-icon success" />
            <div class="stat-content">
              <span class="stat-number">{{ lastReport.elementsProcessed }}</span>
              <span class="stat-label">Elements Processed</span>
            </div>
          </div>
          
          <div class="result-stat">
            <Icon name="edit" class="stat-icon primary" />
            <div class="stat-content">
              <span class="stat-number">{{ lastReport.stylesConverted }}</span>
              <span class="stat-label">Styles Converted</span>
            </div>
          </div>
          
          <div class="result-stat">
            <Icon name="alert-triangle" class="stat-icon warning" />
            <div class="stat-content">
              <span class="stat-number">{{ lastReport.warnings.length }}</span>
              <span class="stat-label">Warnings</span>
            </div>
          </div>
          
          <div class="result-stat">
            <Icon name="x-circle" class="stat-icon error" />
            <div class="stat-content">
              <span class="stat-number">{{ lastReport.errors.length }}</span>
              <span class="stat-label">Errors</span>
            </div>
          </div>
        </div>
        
        <!-- Warnings and Errors -->
        <div v-if="lastReport.warnings.length > 0" class="warnings-section">
          <h4><AppIcon name="mdi-alert" color="warning" context="warning" aria-hidden="true" /> Warnings</h4>
          <ul class="warning-list">
            <li v-for="(warning, index) in lastReport.warnings" :key="index">
              {{ warning }}
            </li>
          </ul>
        </div>
        
        <div v-if="lastReport.errors.length > 0" class="errors-section">
          <h4><AppIcon name="mdi-close-circle-outline" color="error" context="error" aria-hidden="true" /> Errors</h4>
          <ul class="error-list">
            <li v-for="(_error, index) in lastReport.errors" :key="index">
              <strong>{{ error.element }}:</strong> {{ error.error }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Backup and Rollback -->
      <div v-if="migrationTool && migrationTool.backupData.size > 0" class="backup-section">
        <h3>Backup & Rollback</h3>
        <p>{{ migrationTool.backupData.size }} elements backed up</p>
        <div class="backup-actions">
          <UnifiedButton
            variant="warning"
            size="sm"
            @click="rollbackAll"
          >
            <Icon name="undo" />
            Rollback All Changes
          </UnifiedButton>
          
          <UnifiedButton
            variant="ghost"
            size="sm"
            @click="clearBackups"
          >
            <Icon name="trash" />
            Clear Backups
          </UnifiedButton>
        </div>
      </div>

      <!-- Design System CSS -->
      <div class="design-system-section">
        <h3>Design System</h3>
        <p>Inject global design system CSS classes</p>
        <UnifiedButton
          variant="secondary"
          size="sm"
          @click="injectDesignSystemCSS"
        >
          <Icon name="code" />
          Inject Design System CSS
        </UnifiedButton>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isRunning" class="loading-overlay">
      <div class="loading-content">
        <Icon name="loader" class="loading-icon" />
        <span>{{ loadingMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue';

import { ref, reactive, onMounted, defineExpose } from 'vue'
import { useToast } from '@/composables/useToast'
import CSSMigrationTool, { quickMigrations } from '@/utils/css-migration-tool'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import Icon from '@/components/ui/Icon.vue'

const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

// Reactive state
const isExpanded = ref(false)
const isRunning = ref(false)
const loadingMessage = ref('')
const customSelector = ref('')
const lastReport = ref(null)
const migrationTool = ref(null)

const options = reactive({
  dryRun: false,
  preserveIds: true,
  preserveDataAttributes: true,
  backupStyles: true,
  generateReport: true
})

// Methods
const togglePanel = () => {
  isExpanded.value = !isExpanded.value
}

const runMigration = async (migrationFn, message) => {
  isRunning.value = true
  loadingMessage.value = message
  
  try {
    const report = await migrationFn(options)
    lastReport.value = report
    
    if (options.dryRun) {
      toastInfo(`[SEARCH] Dry run complete: ${report.elementsProcessed} elements would be processed`)
    } else {
      toastSuccess(`Migration complete: ${report.stylesConverted} styles converted`)
    }
  } catch (error) {
    toastError(`Migration failed: ${error.message}`)
    console.error('Migration error:', error)
  } finally {
    isRunning.value = false
    loadingMessage.value = ''
  }
}

const migrateButtons = () => {
  runMigration(quickMigrations.migrateButtons, 'Migrating buttons...')
}

const migrateCards = () => {
  runMigration(quickMigrations.migrateCards, 'Migrating cards...')
}

const migrateInputs = () => {
  runMigration(quickMigrations.migrateInputs, 'Migrating inputs...')
}

const migratePage = () => {
  runMigration(quickMigrations.migratePage, 'Migrating entire page...')
}

const migrateCustom = () => {
  if (!customSelector.value) return
  
  runMigration(
    () => quickMigrations.migrateComponent(customSelector.value),
    `Migrating ${customSelector.value}...`
  )
}

const rollbackAll = () => {
  if (!migrationTool.value) return
  
  const rolledBack = migrationTool.value.rollbackAll()
  toastSuccess(`Rollback complete: ${rolledBack} elements`)
  lastReport.value = null
}

const clearBackups = () => {
  if (!migrationTool.value) return
  
  migrationTool.value.backupData.clear()
  toastInfo('Backup data cleared')
}

const injectDesignSystemCSS = () => {
  if (!migrationTool.value) {
    migrationTool.value = new CSSMigrationTool()
  }
  
  migrationTool.value.injectDesignSystemCSS()
  toastSuccess('Design system CSS injected')
}

// Initialize
onMounted(() => {
  migrationTool.value = new CSSMigrationTool()
})

// Expose to parent component
defineExpose({
  migrationTool,
  togglePanel,
  runMigration
})
</script>

<style scoped>
.css-migration-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-family: var(--font-family-primary, 'Electrolize', sans-serif);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(45deg, #7c3aed, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.header-text h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.header-text p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.panel-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-actions h3,
.custom-selector h3,
.migration-results h3,
.backup-section h3,
.design-system-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.selector-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.selector-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  font-size: 12px;
  font-family: var(--font-family-mono, monospace);
}

.selector-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.form-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #7c3aed;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.result-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-icon {
  font-size: 16px;
}

.stat-icon.success { color: #22c55e; }
.stat-icon.primary { color: #7c3aed; }
.stat-icon.warning { color: #f59e0b; }
.stat-icon.error { color: #ef4444; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.warnings-section,
.errors-section {
  margin-top: 12px;
}

.warnings-section h4,
.errors-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
}

.warning-list,
.error-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.warning-list li {
  color: #f59e0b;
}

.error-list li {
  color: #ef4444;
}

.backup-section p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.backup-actions {
  display: flex;
  gap: 8px;
}

.design-system-section p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 12px;
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
  color: #7c3aed;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Scrollbar styling */
.panel-content::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .css-migration-panel {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
