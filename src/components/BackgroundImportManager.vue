<template>
  <div class="background-import-manager">
    <!-- Import Status Card -->
    <div class="import-status-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title">
          <AppIcon name="mdi-cloud-sync-outline" />
          Background Import Status
        </h6>
        <div class="status-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            :disabled="importStatus.isImporting"
            :leading-icon="
              refreshService.refreshInterval ? 'mdi-pause' : 'mdi-play'
            "
            @click="toggleRefreshService"
          >
            {{
              refreshService.refreshInterval ? "Pause" : "Start"
            }}
            Auto-Refresh
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            size="sm"
            :disabled="importStatus.isImporting || refreshService.isRefreshing"
            leading-icon="mdi-refresh"
            @click="performManualRefresh"
          >
            Refresh Now
          </UnifiedButton>
        </div>
      </div>

      <div class="card-body section-body">
        <!-- Current Operation -->
        <div v-if="importStatus.isImporting" class="current-operation">
          <div class="operation-info">
            <span class="operation-text">{{
              importStatus.currentOperation
            }}</span>
            <span class="operation-progress">{{ importStatus.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${importStatus.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Status Grid -->
        <div class="status-grid">
          <div class="status-item">
            <div class="status-icon success">
              <AppIcon name="mdi-briefcase" />
            </div>
            <div class="status-content">
              <div class="status-label">Jobs Imported</div>
              <div class="status-value">
                {{ stats.jobsCount.toLocaleString() }}
              </div>
              <div class="status-time">
                {{ formatLastUpdate(stats.jobsLastUpdate) }}
              </div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon primary">
              <AppIcon name="mdi-folder-multiple-outline-image" />
            </div>
            <div class="status-content">
              <div class="status-label">Portfolio Projects</div>
              <div class="status-value">{{ stats.portfolioCount }}</div>
              <div class="status-time">
                {{ formatLastUpdate(stats.portfolioLastUpdate) }}
              </div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon warning">
              <AppIcon name="mdi-account-tie" />
            </div>
            <div class="status-content">
              <div class="status-label">Interviews</div>
              <div class="status-value">{{ stats.interviewsCount }}</div>
              <div class="status-time">
                {{ formatLastUpdate(stats.interviewsLastUpdate) }}
              </div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon info">
              <AppIcon name="mdi-domain" />
            </div>
            <div class="status-content">
              <div class="status-label">Studios</div>
              <div class="status-value">{{ stats.studiosCount }}</div>
              <div class="status-time">
                {{ formatLastUpdate(stats.studiosLastUpdate) }}
              </div>
            </div>
          </div>

          <div class="status-item">
            <div
              class="status-icon"
              :class="refreshService.refreshInterval ? 'success' : 'muted'"
            >
              <AppIcon
                :name="
                  refreshService.refreshInterval ? 'mdi-autorenew' : 'mdi-pause'
                "
              />
            </div>
            <div class="status-content">
              <div class="status-label">Auto-Refresh</div>
              <div class="status-value">
                {{ refreshService.refreshInterval ? "Active" : "Paused" }}
              </div>
              <div class="status-time">
                Every
                {{ Math.round(refreshService.refreshFrequency / 60000) }}min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Import Section -->
    <div class="manual-import-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title">
          <AppIcon name="mdi-upload" />
          Manual Data Import
        </h6>
      </div>

      <div class="card-body section-body">
        <div class="import-options">
          <div
            v-for="importType in importTypes"
            :key="importType.type"
            class="import-option"
          >
            <div class="import-option-header">
              <div class="import-option-icon" :class="importType.colorClass">
                <AppIcon :name="importType.icon" />
              </div>
              <div class="import-option-info">
                <h6 class="import-option-title">{{ importType.title }}</h6>
                <p class="import-option-description">
                  {{ importType.description }}
                </p>
              </div>
            </div>
            <div class="import-option-actions">
              <UnifiedButton
                variant="outline"
                size="sm"
                :disabled="importStatus.isImporting"
                leading-icon="mdi-file-plus"
                @click="selectFile(importType.type)"
              >
                Select File
              </UnifiedButton>
              <UnifiedButton
                variant="outline"
                size="sm"
                :disabled="importStatus.isImporting"
                leading-icon="mdi-cog"
                @click="configureImportSource(importType.type)"
              >
                Options
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import History -->
    <div class="import-history-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title">
          <AppIcon name="mdi-history" />
          Recent Imports
        </h6>
        <UnifiedButton
          variant="outline"
          size="sm"
          :disabled="importStatus.importHistory.length === 0"
          @click="clearHistory"
        >
          <AppIcon name="mdi-trash-can-outline" />
          Clear History
        </UnifiedButton>
      </div>

      <div class="card-body section-body">
        <div v-if="importStatus.importHistory.length === 0" class="empty-state">
          <AppIcon name="mdi-history" />
          <p>No import history available</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="entry in importStatus.importHistory.slice(0, 10)"
            :key="entry.id"
            class="history-item"
          >
            <div
              class="history-icon"
              :class="entry.success ? 'success' : 'danger'"
            >
              <AppIcon
                :name="
                  entry.success
                    ? 'mdi-check-circle-outline'
                    : 'mdi-alert-circle-outline'
                "
              />
            </div>
            <div class="history-content">
              <div class="history-title">
                {{ getImportTypeTitle(entry.dataType) }}
                <span class="record-count">{{ entry.recordCount }} records</span>
              </div>
              <div class="history-details">
                <span class="history-source">{{ entry.source }}</span>
                <span class="history-time">{{
                  formatTimestamp(entry.timestamp)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Errors Panel -->
    <div
      v-if="importStatus.errors.length > 0"
      class="errors-card glass-card section-card"
    >
      <div class="card-header section-header">
        <h6 class="card-title text-danger">
          <AppIcon name="mdi-alert-circle-outline" />
          Import Errors ({{ importStatus.errors.length }})
        </h6>
        <UnifiedButton
          variant="danger"
          appearance="outlined"
          size="sm"
          @click="clearErrors"
        >
          <AppIcon name="mdi-close-circle-outline" context="error" />
          Clear Errors
        </UnifiedButton>
      </div>

      <div class="card-body section-body">
        <div class="errors-list">
          <div
            v-for="(error, index) in importStatus.errors.slice(0, 5)"
            :key="index"
            class="error-item"
          >
            <div class="error-icon">
              <AppIcon name="mdi-alert-circle-outline" class="text-danger" />
            </div>
            <div class="error-content">
              <div class="error-message">{{ error.error }}</div>
              <div class="error-details">
                <span class="error-type">{{ error.dataType }}</span>
                <span class="error-time">{{
                  formatTimestamp(error.timestamp)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Input (Hidden) -->
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      accept=".json,.csv,.txt"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import {
  importData,
  importStatus,
  backgroundRefreshService,
  BackgroundRefreshService as _BackgroundRefreshService,
} from "@/services/backgroundImportService";

// Reactive state
const refreshService = reactive(backgroundRefreshService);
const fileInput = ref(null);
const selectedImportType = ref("");

// Statistics
const stats = reactive({
  jobsCount: 0,
  jobsLastUpdate: null,
  portfolioCount: 0,
  portfolioLastUpdate: null,
  interviewsCount: 0,
  interviewsLastUpdate: null,
  studiosCount: 0,
  studiosLastUpdate: null,
});

// Import type configurations
const importTypes = [
  {
    type: "resume",
    title: "Resume Data",
    description: "Import resume information, experience, and skills",
    icon: "mdi-account-box-outline",
    colorClass: "primary",
  },
  {
    type: "jobs",
    title: "Job Listings",
    description: "Import job opportunities and application data",
    icon: "mdi-briefcase-search",
    colorClass: "success",
  },
  {
    type: "portfolio",
    title: "Portfolio Projects",
    description: "Import project data, images, and documentation",
    icon: "mdi-folder-multiple-outline-image",
    colorClass: "info",
  },
  {
    type: "interviews",
    title: "Interview Records",
    description: "Import interview feedback and performance data",
    icon: "mdi-account-tie",
    colorClass: "warning",
  },
  {
    type: "studios",
    title: "Game Studios",
    description: "Import studio data, company info, and specializations",
    icon: "mdi-domain",
    colorClass: "info",
  },
];

// Methods
const toggleRefreshService = () => {
  try {
    if (refreshService.refreshInterval) {
      refreshService.stop();
      console.info("Auto-refresh paused");
    } else {
      refreshService.start();
      console.info("Auto-refresh started");
    }
  } catch (error) {
    console.error("Failed to toggle auto-refresh:", error);
  }
};

const performManualRefresh = async () => {
  try {
    await refreshService.performBackgroundRefresh();
    await updateStats();
    console.info("Manual refresh complete");
  } catch (error) {
    console.error("Manual refresh failed:", error);
  }
};

const selectFile = (importType) => {
  selectedImportType.value = importType;
  console.info(`Selecting file for ${importType} import`);
  fileInput.value?.click();
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file || !selectedImportType.value) {
    return;
  }

  try {
    const result = await importData(
      selectedImportType.value,
      file.path || file.name,
      {
        fileName: file.name,
        fileSize: file.size,
      },
    );

    if (result.success) {
      await updateStats();
      console.info(
        `Import ${selectedImportType.value} successful:`,
        result.message,
      );
    } else {
      console.error(`Import ${selectedImportType.value} failed:`, result.error);
    }
  } catch (error) {
    console.error(`File import error for ${selectedImportType.value}:`, error);
  } finally {
    event.target.value = "";
    selectedImportType.value = "";
  }
};

const configureImportSource = async (importType) => {
  try {
    refreshService.configure({ enabledSources: [importType] });
    console.info(`Configured import source: ${importType}`);
  } catch (error) {
    console.error(`Failed to configure import source ${importType}:`, error);
  }
};

const clearHistory = () => {
  importStatus.importHistory.length = 0;
  console.info("Import history cleared");
};

const clearErrors = () => {
  importStatus.errors.length = 0;
  console.info("Import errors cleared");
};

const updateStats = async () => {
  try {
    // Update statistics from localStorage or IPC
    const jobsData = JSON.parse(localStorage.getItem("gemini-cv-jobs") || "[]");
    const portfolioData = JSON.parse(
      localStorage.getItem("gemini-cv-portfolio") || "[]",
    );
    const interviewsData = JSON.parse(
      localStorage.getItem("gemini-cv-interviews") || "[]",
    );
    const studiosData = JSON.parse(
      localStorage.getItem("gemini-cv-studios") || "[]",
    );

    stats.jobsCount = Array.isArray(jobsData) ? jobsData.length : 0;
    stats.portfolioCount = Array.isArray(portfolioData)
      ? portfolioData.length
      : 0;
    stats.interviewsCount = Array.isArray(interviewsData)
      ? interviewsData.length
      : 0;
    stats.studiosCount = Array.isArray(studiosData) ? studiosData.length : 0;

    // Update timestamps
    const cache = JSON.parse(localStorage.getItem("gemini-cv-cache") || "{}");
    stats.jobsLastUpdate = cache.jobsLastUpdate || null;
    stats.portfolioLastUpdate = cache.portfolioLastUpdate || null;
    stats.interviewsLastUpdate = cache.interviewsLastUpdate || null;
    stats.studiosLastUpdate = cache.studiosLastUpdate || null;
  } catch (error) {
    console.error("Failed to update stats:", error);
  }
};


const formatLastUpdate = (timestamp) => {
  if (!timestamp) {
    return "Never";
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)}h ago`;
  }
  return `${Math.floor(diffMinutes / 1440)}d ago`;
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const getImportTypeTitle = (dataType) => {
  const type = importTypes.find((t) => t.type === dataType);
  return type?.title || dataType;
};

// Lifecycle
onMounted(() => {
  updateStats();

  // Update stats periodically
  const statsInterval = setInterval(updateStats, 30000);

  onBeforeUnmount(() => {
    clearInterval(statsInterval);
  });
});
</script>

<style scoped>
.background-import-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.import-status-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.status-actions {
  display: flex;
}

.current-operation {
  background: var(--glass-elevated);
}

.operation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-text {
  color: var(--text-primary);
}

.operation-progress {
  color: var(--color-primary);
}

.progress-bar {
  background: var(--glass-border);
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(
    var(--color-primary),
    var(--color-success)
  );
}

.status-grid {
  display: grid;
}

.status-item {
  display: flex;
  align-items: center;
  background: var(--glass-surface);
}

.status-item:hover {
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success {
  color: var(--color-success);
}

.status-icon.primary {
  color: var(--color-primary);
}

.status-icon.warning {
  color: var(--color-warning);
}

.status-icon.info {
  color: var(--color-info);
}

.status-icon.muted {
  background: var(--glass-border);
  color: var(--text-muted);
}

.status-content {
}

.status-label {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.status-value {
  color: var(--text-primary);
}

.status-time {
  color: var(--text-muted);
}

.import-options {
  display: flex;
  flex-direction: column;
}

.import-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-surface);
}

.import-option:hover {
  border-color: var(--color-primary);
}

.import-option-header {
  display: flex;
  align-items: center;
}

.import-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.import-option-icon.primary {
  color: var(--color-primary);
}

.import-option-icon.success {
  color: var(--color-success);
}

.import-option-icon.info {
  color: var(--color-info);
}

.import-option-icon.warning {
  color: var(--color-warning);
}

.import-option-title {
  color: var(--text-primary);
}

.import-option-description {
  color: var(--text-secondary);
}

.import-option-actions {
  display: flex;
}

.history-list,
.errors-list {
  display: flex;
  flex-direction: column;
}

.history-item,
.error-item {
  display: flex;
  align-items: flex-start;
  background: var(--glass-elevated);
}

.history-item .history-icon.success {
  border-left-color: var(--color-success);
}

.history-item .history-icon.danger,
.error-item {
  border-left-color: var(--color-danger);
}

.history-icon,
.error-icon {
}

.history-content,
.error-content {
}

.history-title,
.error-message {
  color: var(--text-primary);
}

.record-count {
  color: var(--text-muted);
  font-weight: normal;
}

.history-details,
.error-details {
  display: flex;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

.empty-state i {
}

  .status-grid {
  }

  .import-option {
    flex-direction: column;
    align-items: flex-start;
  }

  .import-option-actions {
    justify-content: flex-end;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

[data-theme="dark"] .status-item,
[data-theme="dark"] .import-option,
[data-theme="dark"] .history-item,
[data-theme="dark"] .error-item {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}
</style>
