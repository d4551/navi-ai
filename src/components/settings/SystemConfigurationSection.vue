<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    class="system-configuration"
    role="region"
    aria-labelledby="system-config-title"
  >
    <!-- Header Section -->
    <div class="system-header glass-card section-card mb-6">
      <div class="system-header-content">
        <div class="system-header-info">
          <h2 id="system-config-title" class="system-title">
            <CogIconComponent class="system-icon" />
            System Configuration
          </h2>
          <p class="system-description">
            Configure cloud services, performance settings, and data management
            preferences
          </p>
        </div>
        <div class="system-status">
          <div class="status-indicator" :class="systemStatus.class">
            <div class="status-dot"></div>
            <span class="status-text">{{ systemStatus.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Configuration Grid -->
    <div class="config-grid">
      <!-- Cloud Services Section -->
      <div class="config-section glass-card section-card">
        <div class="section-header">
          <div class="section-title">
            <AzureIconComponent class="section-icon" />
            <h3>Cloud Services</h3>
          </div>
          <div class="section-toggle">
            <div class="form-check form-switch">
              <input
                id="azure-enabled"
                v-model="settings.azureEnabled"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="azure-enabled">
                Enable Azure Integration
              </label>
            </div>
          </div>
        </div>

        <div v-show="settings.azureEnabled" class="section-content">
          <div class="config-fields">
            <div class="field-group">
              <label for="azure-endpoint" class="field-label">Azure Endpoint</label>
              <input
                id="azure-endpoint"
                v-model="settings.azureEndpoint"
                type="url"
                class="field-input glass-input"
                placeholder="https://your-resource.openai.azure.com/"
                aria-describedby="azure-endpoint-help"
              />
              <div id="azure-endpoint-help" class="field-help">
                Your Azure OpenAI resource endpoint URL
              </div>
            </div>

            <div class="field-group">
              <label for="azure-key" class="field-label">API Key</label>
              <div class="field-input-group">
                <input
                  id="azure-key"
                  v-model="settings.azureApiKey"
                  :type="showAzureKey ? 'text' : 'password'"
                  class="field-input glass-input"
                  placeholder="Enter your Azure API key"
                  aria-describedby="azure-key-help"
                />
                <button
                  type="button"
                  class="field-action-btn"
                  :aria-label="showAzureKey ? 'Hide API key' : 'Show API key'"
                  @click="showAzureKey = !showAzureKey"
                >
                  <EyeIconComponent v-if="!showAzureKey" />
                  <EyeSlashIconComponent v-else />
                </button>
              </div>
              <div id="azure-key-help" class="field-help">
                Authentication key for Azure OpenAI services
              </div>
            </div>

            <div class="field-row">
              <div class="field-group">
                <label for="azure-deployment" class="field-label">Deployment</label>
                <input
                  id="azure-deployment"
                  v-model="settings.azureDeployment"
                  type="text"
                  class="field-input glass-input"
                  placeholder="gpt-4"
                  aria-describedby="azure-deployment-help"
                />
                <div id="azure-deployment-help" class="field-help">
                  Model deployment name
                </div>
              </div>

              <div class="field-group">
                <label for="azure-api-version" class="field-label">API Version</label>
                <select
                  id="azure-api-version"
                  v-model="settings.azureApiVersion"
                  class="field-input glass-input"
                  aria-describedby="azure-api-version-help"
                >
                  <option value="2023-12-01-preview">2023-12-01-preview</option>
                  <option value="2023-05-15">2023-05-15</option>
                  <option value="2023-03-15-preview">2023-03-15-preview</option>
                </select>
                <div id="azure-api-version-help" class="field-help">
                  API version for requests
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance & System Section -->
      <div class="config-section glass-card section-card">
        <div class="section-header">
          <div class="section-title">
            <PerformanceIconComponent class="section-icon" />
            <h3>Performance & System</h3>
          </div>
        </div>

        <div class="section-content">
          <div class="toggle-grid">
            <div class="toggle-item fairy-toggle">
              <div class="toggle-control">
                <label class="field-label" for="fairy-bubble-size">
                  <span class="toggle-icon">🧚‍♀️</span>
                  AI Fairy Assistant Size
                </label>
                <select
                  id="fairy-bubble-size"
                  v-model="settings.fairyBubbleSize"
                  class="field-input glass-input"
                  @change="
                    $emit('update-fairy-setting', settings.fairyBubbleSize)
                  "
                >
                  <option value="full">Full (with chat)</option>
                  <option value="small">Small (page aware)</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div class="toggle-description">
                Choose the AI assistant bubble size and behavior
                <div class="toggle-hint">
                  <em>Tip: Click the fairy or press Ctrl+Shift+F to cycle through
                    sizes</em>
                </div>
              </div>
            </div>

            <div class="toggle-item">
              <div class="toggle-control">
                <div class="form-check form-switch">
                  <input
                    id="system-tray"
                    v-model="settings.systemTray"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label
                    class="form-check-label toggle-label"
                    for="system-tray"
                  >
                    System Tray
                  </label>
                </div>
              </div>
              <div class="toggle-description">
                Keep NAVI running in the background when minimized
              </div>
            </div>

            <div class="toggle-item">
              <div class="toggle-control">
                <div class="form-check form-switch">
                  <input
                    id="auto-startup"
                    v-model="settings.autoStartup"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label
                    class="form-check-label toggle-label"
                    for="auto-startup"
                  >
                    Auto-start
                  </label>
                </div>
              </div>
              <div class="toggle-description">
                Launch automatically when your computer starts
              </div>
            </div>

            <div class="toggle-item">
              <div class="toggle-control">
                <div class="form-check form-switch">
                  <input
                    id="hardware-acceleration"
                    v-model="settings.hardwareAcceleration"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label
                    class="form-check-label toggle-label"
                    for="hardware-acceleration"
                  >
                    Hardware Acceleration
                  </label>
                </div>
              </div>
              <div class="toggle-description">
                Use GPU acceleration for better performance
              </div>
            </div>

            <div class="toggle-item">
              <div class="toggle-control">
                <div class="form-check form-switch">
                  <input
                    id="debug-mode"
                    v-model="settings.debugMode"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label toggle-label" for="debug-mode">
                    Debug Mode
                  </label>
                </div>
              </div>
              <div class="toggle-description">
                Enable detailed logging for troubleshooting
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Storage & Cache Section -->
      <div class="config-section glass-card section-card">
        <div class="section-header">
          <div class="section-title">
            <StorageIconComponent class="section-icon" />
            <h3>Storage & Cache</h3>
          </div>
          <div class="storage-stats">
            <span class="cache-size">{{
              formatCacheSize(currentCacheSize)
            }}</span>
            <span class="cache-label">used</span>
          </div>
        </div>

        <div class="section-content">
          <div class="field-row">
            <div class="field-group">
              <label for="cache-size" class="field-label">Max Cache Size</label>
              <div class="field-input-with-unit">
                <input
                  id="cache-size"
                  v-model.number="settings.maxCacheSize"
                  type="number"
                  class="field-input glass-input"
                  min="50"
                  max="1000"
                  step="50"
                  aria-describedby="cache-size-help"
                />
                <span class="field-unit">MB</span>
              </div>
              <div id="cache-size-help" class="field-help">
                Maximum size for cached data and responses
              </div>
            </div>

            <div class="field-group">
              <label for="log-retention" class="field-label">Log Retention</label>
              <div class="field-input-with-unit">
                <input
                  id="log-retention"
                  v-model.number="settings.logRetention"
                  type="number"
                  class="field-input glass-input"
                  min="1"
                  max="90"
                  aria-describedby="log-retention-help"
                />
                <span class="field-unit">days</span>
              </div>
              <div id="log-retention-help" class="field-help">
                How long to keep application logs
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <UnifiedButton
              variant="outline-warning"
              size="sm"
              leading-icon="mdi-delete-sweep"
              @click="$emit('clear-cache')"
            >
              Clear Cache
            </UnifiedButton>
            <UnifiedButton
              variant="outline-danger"
              size="sm"
              leading-icon="mdi-delete-outline"
              @click="$emit('clear-logs')"
            >
              Clear Logs
            </UnifiedButton>
          </div>
        </div>
      </div>

      <!-- Backup & Export Section -->
      <div class="config-section glass-card section-card">
        <div class="section-header">
          <div class="section-title">
            <BackupIconComponent class="section-icon" />
            <h3>Backup & Export</h3>
          </div>
          <div v-if="settings.autoBackup" class="backup-status">
            <span class="backup-indicator">
              <CheckIconComponent class="backup-icon" />
              Auto-backup enabled
            </span>
          </div>
        </div>

        <div class="section-content">
          <div class="backup-settings">
            <div class="backup-toggle">
              <div class="form-check form-switch">
                <input
                  id="auto-backup"
                  v-model="settings.autoBackup"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label toggle-label" for="auto-backup">
                  Automatic Backups
                </label>
              </div>
              <div class="toggle-description">
                Automatically backup your settings and data
              </div>
            </div>

            <div v-show="settings.autoBackup" class="backup-frequency">
              <label for="backup-frequency" class="field-label">Frequency</label>
              <select
                id="backup-frequency"
                v-model="settings.backupFrequency"
                class="field-input glass-input"
                aria-describedby="backup-frequency-help"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div id="backup-frequency-help" class="field-help">
                How often to create automatic backups
              </div>
            </div>
          </div>

          <div class="export-actions">
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-export"
              @click="$emit('export-settings')"
            >
              Export Settings
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-import"
              @click="$emit('import-settings')"
            >
              Import Settings
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  CogIconComponent,
  AzureIconComponent,
  EyeIconComponent,
  EyeSlashIconComponent,
  CheckIconComponent,
} from "./SettingsIcons.js";

// Create missing icon components
const PerformanceIconComponent = {
  name: "PerformanceIconComponent",
  template:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/></svg>',
};

const StorageIconComponent = {
  name: "StorageIconComponent",
  template:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12,4A6,6 0 0,0 6,10C6,13.31 8.69,16 12.1,16L11.22,18.15C11.22,18.29 11.34,18.4 11.5,18.4H12.5C12.66,18.4 12.78,18.29 12.78,18.15L11.9,16C15.31,16 18,13.31 18,10A6,6 0 0,0 12,4M12,6A4,4 0 0,1 16,10A4,4 0 0,1 12,14A4,4 0 0,1 8,10A4,4 0 0,1 12,6Z"/></svg>',
};

const BackupIconComponent = {
  name: "BackupIconComponent",
  template:
    '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12M12,8L8,12H11V16H13V12H16L12,8Z"/></svg>',
};

export default {
  name: "SystemConfigurationSection",
  components: {
    CogIconComponent,
    AzureIconComponent,
    EyeIconComponent,
    EyeSlashIconComponent,
    CheckIconComponent,
    PerformanceIconComponent,
    StorageIconComponent,
    BackupIconComponent,
    UnifiedButton: () => import("@/components/ui/UnifiedButton.vue"),
  },
  props: {
    settings: {
      type: Object,
      required: true,
    },
  },
  emits: ["clear-cache", "clear-logs", "export-settings", "import-settings"],
  data() {
    return {
      showAzureKey: false,
      currentCacheSize: 0, // This would be calculated from actual cache
    };
  },
  computed: {
    systemStatus() {
      const hasAzure = this.settings.azureEnabled && this.settings.azureApiKey;
      const hasOptimalSettings =
        this.settings.hardwareAcceleration && !this.settings.debugMode;

      if (hasAzure && hasOptimalSettings) {
        return { class: "status-good", text: "Optimal" };
      } else if (hasAzure || hasOptimalSettings) {
        return { class: "status-warning", text: "Good" };
      } else {
        return { class: "status-error", text: "Basic" };
      }
    },
  },
  mounted() {
    this.calculateCacheSize();
  },
  methods: {
    formatCacheSize(bytes) {
      if (bytes === 0) return "0 MB";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },
    calculateCacheSize() {
      // This would calculate actual cache size
      // For now, simulate a cache size
      this.currentCacheSize = Math.floor(Math.random() * 100) * 1024 * 1024; // Random MB in bytes
    },
  },
};
</script>

<style scoped>
.system-configuration {
}

.system-header {
  border-radius: var(--radius-lg);
  background: linear-gradient(
  );
  backdrop-filter: var(--glass-backdrop-blur);
}

.system-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.system-header-info {
}

.system-title {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.system-icon {
  color: var(--color-primary);
}

.system-description {
  color: var(--text-secondary);
}

.system-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
}

.status-good {
}

.status-warning {
}

.status-error {
}

.status-dot {
  background: currentColor;
}

.config-grid {
  display: grid;
}

  .config-grid {
  }
}

.config-section {
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.config-section:hover {
  border-color: var(--glass-border-hover);
  background: var(--glass-surface-elevated);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
  );
}

.section-title {
  display: flex;
  align-items: center;
}

  color: var(--text-primary);
}

.section-icon {
  color: var(--color-primary);
}

.section-toggle {
  display: flex;
  align-items: center;
}

.section-content {
}

.storage-stats {
  display: flex;
  align-items: baseline;
}

.cache-size {
  color: var(--text-primary);
}

.cache-label {
  color: var(--text-secondary);
}

.backup-status {
  display: flex;
  align-items: center;
}

.backup-indicator {
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
}

.backup-icon {
}

.config-fields {
  display: flex;
  flex-direction: column;
}

.field-row {
  display: grid;
}

  .field-row {
  }
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  color: var(--text-primary);
}

.field-input {
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field-input-group {
  display: flex;
  align-items: stretch;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--glass-surface);
  transition: border-color var(--duration-fast) var(--easing-ease-out);
}

.field-input-group:focus-within {
  border-color: var(--color-primary);
}

.field-input-group .field-input {
  border: none;
  background: transparent;
}

.field-input-group .field-input:focus {
  border: none;
  box-shadow: none;
}

.field-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface-elevated);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.field-action-btn:hover {
  background: var(--glass-border);
  color: var(--text-primary);
}

.field-input-with-unit {
  display: flex;
  align-items: stretch;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--glass-surface);
  transition: border-color var(--duration-fast) var(--easing-ease-out);
}

.field-input-with-unit:focus-within {
  border-color: var(--color-primary);
}

.field-input-with-unit .field-input {
  border: none;
  background: transparent;
}

.field-input-with-unit .field-input:focus {
  border: none;
  box-shadow: none;
}

.field-unit {
  display: flex;
  align-items: center;
  background: var(--glass-surface-elevated);
  color: var(--text-secondary);
}

.field-help {
  color: var(--text-secondary);
}

.toggle-grid {
  display: grid;
}

  .toggle-grid {
  }
}

.toggle-item {
  display: flex;
  flex-direction: column;
}

.toggle-control {
  display: flex;
  align-items: center;
}

.toggle-label {
  color: var(--text-primary);
  cursor: pointer;
}

.toggle-description {
  color: var(--text-secondary);
}

.backup-settings {
  display: flex;
  flex-direction: column;
}

.backup-toggle {
  display: flex;
  flex-direction: column;
}

.backup-frequency {
  display: flex;
  flex-direction: column;
}

.action-buttons,
.export-actions {
  display: flex;
  flex-wrap: wrap;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  background-color: var(--glass-border);
  position: relative;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.form-check-input:focus {
}

.form-check-input::before {
  content: "";
  position: absolute;
  background: white;
  transition: transform var(--duration-fast) var(--easing-ease-out);
}

.form-check-input:checked::before {
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}

  .system-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .config-grid {
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toggle-grid {
  }

  .field-row {
  }
}

.icon {
  display: inline-block;
  fill: currentColor;
}

.fairy-toggle {
  border-radius: var(--radius-md);
  background: linear-gradient(
  );
  transition: all var(--duration-normal) ease;
}

.fairy-toggle:hover {
  background: linear-gradient(
  );
}

.fairy-toggle .toggle-icon {
}

.fairy-toggle .toggle-hint {
  border-radius: var(--radius-sm);
}

.fairy-toggle .toggle-hint em {
  font-style: normal;
}
</style>
