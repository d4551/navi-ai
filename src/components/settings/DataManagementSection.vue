<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    class="settings-card mb-4"
    role="region"
    aria-labelledby="data-mgmt-title"
  >
    <div
      class="card-header section-header card-header--dense accordion-header"
      role="button"
      tabindex="0"
      @click="toggleAccordion"
      @keydown.enter="toggleAccordion"
      @keydown.space="toggleAccordion"
    >
      <div class="d-flex align-items-center justify-content-between w-100">
        <div>
          <h5 id="data-mgmt-title" class="mb-0">
            <DatabaseIconComponent class="me-2 icon-sm" />Data Management
          </h5>
        </div>
        <div class="accordion-toggle">
          <AppIcon
            name="mdi-chevron-down"
            class="accordion-icon"
            :class="{ rotated: isExpanded }"
          />
        </div>
      </div>
    </div>
    <div
      v-show="isExpanded"
      class="card-body section-body card-body--dense accordion-content"
    >
      <!-- Data Export -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Export Data</label>
        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-file-document-outline"
              @click="$emit('export-resume')"
            >
              Export Resume
            </UnifiedButton>
            <div class="form-text">
              Download your resume as PDF or Word document.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-briefcase"
              @click="$emit('export-portfolio')"
            >
              Export Portfolio
            </UnifiedButton>
            <div class="form-text">
              Download your portfolio data and projects.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-message-text"
              @click="$emit('export-chat-history')"
            >
              Export Chat History
            </UnifiedButton>
            <div class="form-text">
              Download all your conversations and interview sessions.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-cog"
              @click="$emit('export-settings')"
            >
              Export Settings
            </UnifiedButton>
            <div class="form-text">
              Download your application settings and preferences.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-database"
              @click="$emit('backup-database')"
            >
              Backup Database
            </UnifiedButton>
            <div class="form-text">
              Save a backup of the local SQLite database.
            </div>
          </div>
        </div>
      </div>

      <!-- Data Import -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Import Data</label>
        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-upload"
              @click="$emit('import-resume')"
            >
              Import Resume
            </UnifiedButton>
            <div class="form-text">
              Upload and import resume data from external sources.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-upload"
              @click="$emit('import-portfolio')"
            >
              Import Portfolio
            </UnifiedButton>
            <div class="form-text">
              Import portfolio data and project information.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-upload"
              @click="$emit('import-settings')"
            >
              Import Settings
            </UnifiedButton>
            <div class="form-text">Restore settings from a backup file.</div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-linkedin"
              @click="$emit('import-linkedin')"
            >
              Import from LinkedIn
            </UnifiedButton>
            <div class="form-text">
              Import profile data from your LinkedIn account.
            </div>
          </div>
        </div>
      </div>

      <!-- Data Clearing -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Clear Data</label>
        <div class="alert alert-warning" role="alert">
          <strong>Warning:</strong> These actions cannot be undone. Make sure to
          export important data first.
        </div>

        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <UnifiedButton
              variant="danger"
              appearance="outlined"
              size="md"
              class="w-100"
              leading-icon="mdi-trash-can-outline"
              @click="$emit('clear-chat-history')"
            >
              Clear Chat History
            </UnifiedButton>
            <div class="form-text">
              Delete all conversations and interview sessions.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="danger"
              appearance="outlined"
              size="md"
              class="w-100"
              leading-icon="mdi-trash-can-outline"
              @click="$emit('clear-cache')"
            >
              Clear Cache
            </UnifiedButton>
            <div class="form-text">
              Clear cached responses and temporary data.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="danger"
              appearance="outlined"
              size="md"
              class="w-100"
              leading-icon="mdi-trash-can-outline"
              @click="$emit('clear-portfolio')"
            >
              Clear Portfolio
            </UnifiedButton>
            <div class="form-text">Remove all portfolio data and projects.</div>
          </div>

          <div>
            <UnifiedButton
              variant="danger"
              appearance="outlined"
              size="md"
              class="w-100"
              leading-icon="mdi-rotate-ccw"
              @click="$emit('reset-settings')"
            >
              Reset Settings
            </UnifiedButton>
            <div class="form-text">Reset all settings to default values.</div>
          </div>
        </div>
      </div>

      <!-- Data Privacy -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Privacy & Security</label>
        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <div class="form-check form-switch">
              <input
                id="data-encryption"
                v-model="dataEncryption"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="data-encryption">
                Encrypt stored data
              </label>
            </div>
            <div class="form-text">Encrypt sensitive data stored locally.</div>
          </div>

          <div>
            <div class="form-check form-switch">
              <input
                id="sync-disabled"
                v-model="syncDisabled"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="sync-disabled">
                Disable cloud sync
              </label>
            </div>
            <div class="form-text">Keep all data stored locally only.</div>
          </div>

          <div style="grid-column: span 2">
            <div class="form-check form-switch">
              <input
                id="anonymize-data"
                v-model="anonymizeData"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="anonymize-data">
                Anonymize usage data
              </label>
            </div>
            <div class="form-text">
              Remove personal information from analytics and error reports.
            </div>
          </div>
        </div>
      </div>

      <!-- Storage Information -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Storage Information</label>
        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <div class="storage-info">
              <div class="storage-label">Chat History</div>
              <div class="storage-value">
                {{ formatBytes(storageStats.chatHistorySize) }}
              </div>
              <div class="progress progress--thin">
                <div
                  class="progress-bar progress-bar--var"
                  role="progressbar"
                  :style="{ '--progress-width': chatHistoryPercent + '%' }"
                  :aria-valuenow="chatHistoryPercent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <div>
            <div class="storage-info">
              <div class="storage-label">Portfolio Data</div>
              <div class="storage-value">
                {{ formatBytes(storageStats.portfolioSize) }}
              </div>
              <div class="progress progress--thin">
                <div
                  class="progress-bar progress-bar--var"
                  role="progressbar"
                  :style="{ '--progress-width': portfolioPercent + '%' }"
                  :aria-valuenow="portfolioPercent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <div>
            <div class="storage-info">
              <div class="storage-label">Cache</div>
              <div class="storage-value">
                {{ formatBytes(storageStats.cacheSize) }}
              </div>
              <div class="progress progress--thin">
                <div
                  class="progress-bar progress-bar--var"
                  role="progressbar"
                  :style="{ '--progress-width': cachePercent + '%' }"
                  :aria-valuenow="cachePercent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <div>
            <div class="storage-info">
              <div class="storage-label">Settings</div>
              <div class="storage-value">
                {{ formatBytes(storageStats.settingsSize) }}
              </div>
              <div class="progress progress--thin">
                <div
                  class="progress-bar bg-info progress-bar--var"
                  role="progressbar"
                  :style="{ '--progress-width': settingsPercent + '%' }"
                  :aria-valuenow="settingsPercent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs API Documentation -->
      <div class="p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Jobs API</label>
        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-code-tags"
              @click="$emit('view-api-docs')"
            >
              View API Documentation
            </UnifiedButton>
            <div class="form-text">
              Access complete jobs API documentation and endpoints.
            </div>
          </div>

          <div>
            <UnifiedButton
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="mdi-pulse"
              @click="$emit('test-api')"
            >
              Test API Status
            </UnifiedButton>
            <div class="form-text">
              Check connectivity and status of job search APIs.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import {computed, defineEmits, defineProps } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import {
  DatabaseIconComponent,
  FileTextIconComponent,
  BriefcaseIconComponent,
  MessageSquareIconComponent,
  SettingsIconComponent,
  UploadIconComponent,
  LinkedinIconComponent,
  TrashIconComponent,
  RotateCcwIconComponent,
  CodeTagsIconComponent,
  PulseIconComponent,
} from "./SettingsIcons.js";

const _props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  storageStats: {
    type: Object,
    default: () => ({
      chatHistorySize: 0,
      portfolioSize: 0,
      cacheSize: 0,
      settingsSize: 0,
      totalSize: 0,,
    default: () => ({})
  
    }),
  },
});

const _emit = defineEmits([
  "export-resume",
  "export-portfolio",
  "export-chat-history",
  "export-settings",
  "backup-database",
  "import-resume",
  "import-portfolio",
  "import-settings",
  "import-linkedin",
  "clear-chat-history",
  "clear-cache",
  "clear-portfolio",
  "reset-settings",
  "view-api-docs",
  "test-api",
  "update:settings",
]);

// Accordion state (default open)
const isExpanded = ref(true);

// Methods
function toggleAccordion() {
  isExpanded.value = !isExpanded.value;
}

// Computed proxies (avoid mutating props)
const dataEncryption = computed({
  get: () => props.settings?.dataEncryption,
  set: (val) =>
    emit("update:settings", { ...props.settings, dataEncryption: val }),
});
const syncDisabled = computed({
  get: () => props.settings?.syncDisabled,
  set: (val) =>
    emit("update:settings", { ...props.settings, syncDisabled: val }),
});
const anonymizeData = computed({
  get: () => props.settings?.anonymizeData,
  set: (val) =>
    emit("update:settings", { ...props.settings, anonymizeData: val }),
});

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Computed properties
const chatHistoryPercent = computed(() =>
  Math.min(
    (props.storageStats.chatHistorySize / props.storageStats.totalSize) * 100,
    100,
  ),
);

const portfolioPercent = computed(() =>
  Math.min(
    (props.storageStats.portfolioSize / props.storageStats.totalSize) * 100,
    100,
  ),
);

const cachePercent = computed(() =>
  Math.min(
    (props.storageStats.cacheSize / props.storageStats.totalSize) * 100,
    100,
  ),
);

const settingsPercent = computed(() =>
  Math.min(
    (props.storageStats.settingsSize / props.storageStats.totalSize) * 100,
    100,
  ),
);
</script>

<style scoped>
.progress--thin {
  height: 6px;
}
.progress-bar--var {
  width: var(--progress-width);
}
.accordion-header {
  cursor: pointer;
  user-select: none;
}

.accordion-header:hover {
  background: var(--glass-elevated);
}

.accordion-header:focus-visible {
}

.accordion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
}

.accordion-icon {
  color: var(--text-secondary);
}

.accordion-icon.rotated {
}

.accordion-content {
}

.storage-info {
  text-align: center;
}

.storage-label {
  color: var(--text-secondary);
}

.storage-value {
  color: var(--text-primary);
}
</style>
