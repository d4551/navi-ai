<!--
Live Job Board Demo Page

Demonstrates the complete live job board implementation with:
- Real API integration (RemoteOK, Arbeitnow, etc.)
- Mock data when APIs are unavailable
- Profile-based job matching
- Real-time updates and notifications
- Gaming industry focus
-->
<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <template #header-actions>
      <UnifiedButton
        variant="outline"
        size="sm"
        leading-icon="mdi-information"
        @click="showInfo = !showInfo"
      >
        {{ showInfo ? "Hide" : "Show" }} Demo Info
      </UnifiedButton>
    </template>

    <!-- Demo Information Panel -->
    <div
      v-if="showInfo"
      class="demo-info mt-4 p-3 unified-container"
      style="background: rgba(0, 123, 255, 0.1); border-radius: 8px"
    >
      <h6 class="text-primary mb-2">
        <AppIcon name="mdi-information" class="me-2" />
        How This Demo Works
      </h6>

      <div class="row">
        <div class="col-md-6">
          <h6>Live API Sources:</h6>
          <ul class="list-unstyled">
            <li>
              <AppIcon
                name="mdi-check-circle-outline"
                class="text-success me-1"
              />
              RemoteOK - Remote jobs (no auth)
            </li>
            <li>
              <AppIcon
                name="mdi-check-circle-outline"
                class="text-success me-1"
              />
              Arbeitnow - European tech jobs
            </li>
            <li>
              <AppIcon
                name="mdi-alert-circle-outline"
                class="text-warning me-1"
              />
              JSearch API - Requires RapidAPI key
            </li>
            <li>
              <AppIcon
                name="mdi-alert-circle-outline"
                class="text-warning me-1"
              />
              Adzuna API - Requires API key
            </li>
            <li>
              <AppIcon
                name="mdi-alert-circle-outline"
                class="text-warning me-1"
              />
              Reed.co.uk - Requires API key
            </li>
          </ul>
        </div>

        <div class="col-md-6">
          <h6>Features Demonstrated:</h6>
          <ul class="list-unstyled">
            <li>
              <AppIcon name="mdi-star" class="text-primary me-1" />
              Profile-based job matching
            </li>
            <li>
              <AppIcon name="mdi-star" class="text-primary me-1" /> Gaming
              industry relevance scoring
            </li>
            <li>
              <AppIcon name="mdi-star" class="text-primary me-1" /> Real-time
              search & filtering
            </li>
            <li>
              <AppIcon name="mdi-star" class="text-primary me-1" /> API fallback
              strategies
            </li>
            <li>
              <AppIcon name="mdi-star" class="text-primary me-1" /> Caching &
              rate limiting
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-3">
        <strong>Note:</strong> Some APIs require keys in .env.local file.
        Without keys, the system will use mock data and available free APIs.
        Check the browser console for detailed API responses.
      </div>
    </div>

    <!-- API Status Dashboard -->
    <div
      class="api-status-dashboard section-card section-card mb-4 unified-container"
    >
      <h5 class="mb-3">
        <AppIcon name="mdi-api" class="me-2" />
        API Status Dashboard
      </h5>

      <div class="row g-3">
        <div
          v-for="(status, provider) in providerStatus"
          :key="provider"
          class="col-md-2 col-sm-4 col-6"
        >
          <div
            class="api-status-card"
            :class="{ active: status.enabled, disabled: !status.enabled }"
          >
            <div class="status-header">
              <div
                class="status-indicator"
                :class="status.enabled ? 'online' : 'offline'"
              ></div>
              <span class="provider-name">{{
                formatProviderName(provider)
              }}</span>
            </div>
            <div class="status-details">
              <div class="calls-remaining">
                {{ status.rateLimitRemaining }} calls left
              </div>
              <div class="status-text">
                {{ status.enabled ? "Active" : "Inactive" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 d-flex justify-content-between align-items-center">
        <div class="status-summary">
          <span class="text-success">{{ enabledProvidersCount }} active</span>
          <span class="text-muted mx-2">•</span>
          <span class="text-muted">{{ totalProvidersCount }} total providers</span>
        </div>

        <div class="status-actions">
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="mdi-refresh"
            @click="refreshProviderStatus"
          >
            Refresh Status
          </UnifiedButton>

          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="mdi-cache"
            class="ms-2"
            @click="clearApiCache"
          >
            Clear Cache
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Live Job Board Component -->
    <LiveJobBoard />

    <!-- Demo Tools -->
    <div class="demo-tools section-card section-card mt-4">
      <h5 class="mb-3">
        <AppIcon name="mdi-tools" class="me-2" />
        Demo Tools
      </h5>

      <div class="row g-3">
        <div class="col-md-3">
          <UnifiedButton
            variant="primary"
            block
            leading-icon="mdi-magnify"
            @click="testGameDeveloperSearch"
          >
            Test: Game Developer Search
          </UnifiedButton>
        </div>

        <div class="col-md-3">
          <UnifiedButton
            variant="gaming"
            block
            leading-icon="mdi-gamepad-variant"
            @click="testUnityDeveloperSearch"
          >
            Test: Unity Developer Search
          </UnifiedButton>
        </div>

        <div class="col-md-3">
          <UnifiedButton
            variant="cyber"
            block
            leading-icon="mdi-home"
            @click="testRemoteJobsSearch"
          >
            Test: Remote Jobs Search
          </UnifiedButton>
        </div>

        <div class="col-md-3">
          <UnifiedButton
            variant="outline"
            block
            leading-icon="mdi-account"
            @click="testProfileBasedSearch"
          >
            Test: Profile-Based Search
          </UnifiedButton>
        </div>
      </div>

      <!-- Search Results Summary -->
      <div
        v-if="lastTestResults"
        class="test-results mt-4 p-3"
        style="background: rgba(255, 255, 255, 0.05); border-radius: 8px"
      >
        <h6 class="mb-2">
          <AppIcon name="mdi-chart-line" class="me-2" />
          Last Test Results
        </h6>

        <div class="row g-3">
          <div class="col-md-3">
            <div class="result-stat">
              <div class="stat-number">{{ lastTestResults.totalJobs }}</div>
              <div class="stat-label">Total Jobs Found</div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="result-stat">
              <div class="stat-number">{{ lastTestResults.gamingJobs }}</div>
              <div class="stat-label">Gaming-Related</div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="result-stat">
              <div class="stat-number">
                {{ lastTestResults.sources.length }}
              </div>
              <div class="stat-label">API Sources</div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="result-stat">
              <div class="stat-number">
                {{ lastTestResults.responseTime }}ms
              </div>
              <div class="stat-label">Response Time</div>
            </div>
          </div>
        </div>

        <div class="mt-2">
          <strong>Sources:</strong> {{ lastTestResults.sources.join(", ") }}
        </div>
      </div>
    </div>

    <!-- Real-Time Notifications Demo -->
    <div class="notifications-demo section-card section-card mt-4">
      <h5 class="mb-3">
        <AppIcon name="mdi-bell" class="me-2" />
        Real-Time Job Alerts Demo
      </h5>

      <div class="row">
        <div class="col-md-8">
          <p class="text-muted mb-3">
            Set up job alerts to receive notifications when new jobs matching
            your criteria are found. This demo shows how the real-time system
            works.
          </p>

          <div class="alert-controls d-flex gap-2 mb-3">
            <UnifiedButton
              variant="primary"
              size="sm"
              leading-icon="mdi-plus"
              @click="createDemoAlert"
            >
              Create Demo Alert
            </UnifiedButton>

            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-bell"
              :disabled="notificationPermission === 'granted'"
              @click="requestNotificationPermission"
            >
              {{
                notificationPermission === "granted"
                  ? "Notifications Enabled"
                  : "Enable Notifications"
              }}
            </UnifiedButton>

            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-test-tube"
              @click="triggerTestNotification"
            >
              Test Notification
            </UnifiedButton>
          </div>
        </div>

        <div class="col-md-4">
          <div class="notification-status">
            <div class="status-item">
              <span class="label">Permission:</span>
              <span
                class="value"
                :class="getPermissionClass(notificationPermission)"
              >
                {{ formatPermissionStatus(notificationPermission) }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">Active Alerts:</span>
              <span class="value">{{ realTimeStats.activeAlerts }}</span>
            </div>
            <div class="status-item">
              <span class="label">New Jobs Today:</span>
              <span class="value">{{ realTimeStats.newJobsToday }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Console Output -->
    <div class="console-output section-card section-card mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">
          <AppIcon name="mdi-console" class="me-2" />
          API Console Output
        </h5>
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="clearConsoleOutput"
        >
          <AppIcon name="mdi-delete" class="me-1" />
          Clear
        </button>
      </div>

      <div ref="consoleRef" class="console-content">
        <div
          v-for="(entry, index) in consoleOutput"
          :key="index"
          class="console-entry"
          :class="`level-${entry.level}`"
        >
          <span class="timestamp">{{ formatTimestamp(entry.timestamp) }}</span>
          <span class="level-badge">{{ entry.level.toUpperCase() }}</span>
          <span class="message">{{ entry.message }}</span>
          <pre v-if="entry.data" class="data">{{
            JSON.stringify(entry.data, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup>
import AppIcon from "@/components/ui/AppIcon.vue";
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useJobBoard } from "@/composables/useJobBoard";
import { useUnifiedProfile } from "@/composables/useUnifiedProfile";
import { realTimeJobService } from "@/services/RealTimeJobService";
import { canonicalJobService as refactoredJobAPIService } from "@/services/CanonicalJobService";
import LiveJobBoard from "@/components/jobs/LiveJobBoard.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";

// Composables
const jobBoard = useJobBoard();
const unifiedProfile = useUnifiedProfile();

// Component state
const showInfo = ref(true);
const lastTestResults = ref(null);
const consoleOutput = ref([]);
const consoleRef = ref(null);
const notificationPermission = ref(null);
const realTimeStats = ref({
  activeAlerts: 0,
  newJobsToday: 0,
});

// Provider status
const providerStatus = computed(() => jobBoard.getProviderStatus());
const enabledProvidersCount = computed(
  () =>
    Object.values(providerStatus.value).filter((status) => status.enabled)
      .length,
);
const totalProvidersCount = computed(
  () => Object.keys(providerStatus.value).length,
);

// Console logging
const addConsoleEntry = (level, message, data = null) => {
  consoleOutput.value.push({
    level,
    message,
    data,
    timestamp: new Date(),
  });


  if (consoleOutput.value.length > 50) {
    consoleOutput.value = consoleOutput.value.slice(-50);
  }

  // Auto-scroll to bottom
  nextTick(() => {
    if (consoleRef.value) {
      consoleRef.value.scrollTop = consoleRef.value.scrollHeight;
    }
  });
};


const testGameDeveloperSearch = async () => {
  addConsoleEntry("info", "Testing Game Developer search...");

  const startTime = Date.now();

  try {
    await jobBoard.searchJobs({
      query: "game developer",
      limit: 50,
    });

    const responseTime = Date.now() - startTime;
    const totalJobs = jobBoard.filteredJobs.value.length;
    const gamingJobs = jobBoard.filteredJobs.value.filter(
      (job) => (job.gamingRelevance || 0) > 0.3,
    ).length;
    const sources = [...new Set(jobBoard.jobs.value.map((job) => job.source))];

    lastTestResults.value = {
      totalJobs,
      gamingJobs,
      sources,
      responseTime,
    };

    addConsoleEntry(
      "success",
      `Found ${totalJobs} jobs (${gamingJobs} gaming-related) from ${sources.length} sources`,
      {
        totalJobs,
        gamingJobs,
        sources,
        responseTime,
      },
    );
  } catch (error) {
    addConsoleEntry("error", "Game Developer search failed", error);
  }
};

const testUnityDeveloperSearch = async () => {
  addConsoleEntry("info", "Testing Unity Developer search...");

  const startTime = Date.now();

  try {
    await jobBoard.searchJobs({
      query: "unity developer",
      gamingOnly: true,
      limit: 30,
    });

    const responseTime = Date.now() - startTime;
    const totalJobs = jobBoard.filteredJobs.value.length;
    const gamingJobs = jobBoard.filteredJobs.value.filter(
      (job) => (job.gamingRelevance || 0) > 0.3,
    ).length;
    const sources = [...new Set(jobBoard.jobs.value.map((job) => job.source))];

    lastTestResults.value = {
      totalJobs,
      gamingJobs,
      sources,
      responseTime,
    };

    addConsoleEntry(
      "success",
      `Found ${totalJobs} Unity jobs from ${sources.length} sources`,
    );
  } catch (error) {
    addConsoleEntry("error", "Unity Developer search failed", error);
  }
};

const testRemoteJobsSearch = async () => {
  addConsoleEntry("info", "Testing Remote Jobs search...");

  const startTime = Date.now();

  try {
    await jobBoard.searchJobs({
      query: "developer",
      remote: true,
      location: "remote",
      limit: 40,
    });

    const responseTime = Date.now() - startTime;
    const totalJobs = jobBoard.filteredJobs.value.length;
    const gamingJobs = jobBoard.filteredJobs.value.filter(
      (job) => (job.gamingRelevance || 0) > 0.3,
    ).length;
    const sources = [...new Set(jobBoard.jobs.value.map((job) => job.source))];

    lastTestResults.value = {
      totalJobs,
      gamingJobs,
      sources,
      responseTime,
    };

    addConsoleEntry(
      "success",
      `Found ${totalJobs} remote jobs from ${sources.length} sources`,
    );
  } catch (error) {
    addConsoleEntry("error", "Remote Jobs search failed", error);
  }
};

const testProfileBasedSearch = async () => {
  addConsoleEntry("info", "Testing Profile-based search...");

  const startTime = Date.now();

  try {
    await jobBoard.autoSearchFromProfile();

    const responseTime = Date.now() - startTime;
    const totalJobs = jobBoard.filteredJobs.value.length;
    const gamingJobs = jobBoard.filteredJobs.value.filter(
      (job) => (job.gamingRelevance || 0) > 0.3,
    ).length;
    const sources = [...new Set(jobBoard.jobs.value.map((job) => job.source))];
    const topMatches = jobBoard.topMatches.value.length;

    lastTestResults.value = {
      totalJobs,
      gamingJobs,
      sources,
      responseTime,
    };

    addConsoleEntry(
      "success",
      `Profile-based search found ${totalJobs} jobs (${topMatches} top matches)`,
      {
        profile: unifiedProfile.jobSearchProfile.value,
        results: { totalJobs, gamingJobs, topMatches },
      },
    );
  } catch (error) {
    addConsoleEntry("error", "Profile-based search failed", error);
  }
};

// Provider management
const refreshProviderStatus = () => {
  addConsoleEntry("info", "Refreshing provider status...");
  jobBoard.refreshProviders();
  addConsoleEntry("success", "Provider status refreshed");
};

const clearApiCache = () => {
  addConsoleEntry("info", "Clearing API cache...");
  try {
    refactoredJobAPIService.clearCache();
    addConsoleEntry("success", "API cache cleared (canonical)");
  } catch (e) {
    addConsoleEntry(
      "warning",
      "Failed to clear canonical cache; continuing",
      e,
    );
  }
};

// Notifications
const requestNotificationPermission = async () => {
  const granted = await realTimeJobService.requestNotificationPermission();
  notificationPermission.value = realTimeJobService.getNotificationPermission();

  addConsoleEntry(
    granted ? "success" : "warning",
    granted
      ? "Notification permission granted"
      : "Notification permission denied",
  );
};

const createDemoAlert = async () => {
  try {
    const alert = await realTimeJobService.createAlert(
      "Demo Alert - Unity Developer",
      {
        query: "unity developer",
        location: "remote",
      },
      {
        pushNotifications: true,
        emailNotifications: false,
      },
    );

    addConsoleEntry("success", "Demo job alert created", alert);
    updateRealTimeStats();
  } catch (error) {
    addConsoleEntry("error", "Failed to create demo alert", error);
  }
};

const triggerTestNotification = () => {
  if (
    typeof window !== "undefined" &&
    window.Notification &&
    Notification.permission === "granted"
  ) {
    const notification = new Notification("NAVI Job Board Test", {
      body: "This is a test notification from the live job board demo.",
      icon: "/favicon.ico",
      tag: "demo-notification",
    });

    notification.onclick = () => {
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);

    addConsoleEntry("success", "Test notification sent");
  } else {
    addConsoleEntry("warning", "Notifications not available or not permitted");
  }
};

// Console management
const clearConsoleOutput = () => {
  consoleOutput.value = [];
};


const formatProviderName = (provider) => {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const formatTimestamp = (timestamp) => {
  return timestamp.toLocaleTimeString();
};

const formatPermissionStatus = (permission) => {
  if (!permission) return "Not Available";
  return permission.charAt(0).toUpperCase() + permission.slice(1);
};

const getPermissionClass = (permission) => {
  switch (permission) {
    case "granted":
      return "text-success";
    case "denied":
      return "text-danger";
    default:
      return "text-warning";
  }
};

const updateRealTimeStats = () => {
  realTimeStats.value = realTimeJobService.getStats();
};

// Lifecycle
onMounted(() => {
  addConsoleEntry("info", "Live Job Board Demo initialized");

  // Check notification permission
  notificationPermission.value = realTimeJobService.getNotificationPermission();

  // Update real-time stats
  updateRealTimeStats();

  // Listen for job board events
  realTimeJobService.on("new-job", (update) => {
    addConsoleEntry(
      "info",
      `New job found: ${update.job.title} at ${update.job.company}`,
      update,
    );
    updateRealTimeStats();
  });

  realTimeJobService.on("alert-created", () => {
    updateRealTimeStats();
  });

  // Start real-time service
  realTimeJobService.start();
});

onUnmounted(() => {
  // Clean up event listeners
  realTimeJobService.removeAllListeners();
});
</script>

<style scoped>
.page-container {
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.section-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.api-status-card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  text-align: center;
  transition: all var(--transition-fast);
}

.api-status-card.active {
  border-color: var(--color-success-500);
  background: rgba(34, 197, 94, 0.1);
}

.api-status-card.disabled {
  opacity: 0.6;
  border-color: var(--color-neutral-300);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: var(--spacing-xs);
}

.status-indicator.online {
  background-color: var(--color-success-500);
}

.status-indicator.offline {
  background-color: var(--color-neutral-400);
}

.provider-name {
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.calls-remaining {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-text {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-stat {
  text-align: center;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.05);
}

.stat-number {
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notification-status {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.status-item:last-child {
  margin-bottom: 0;
}

.console-content {
  max-height: 400px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  font-family: "Courier New", monospace;
  font-size: var(--font-size-sm);
}

.console-entry {
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid transparent;
}

.console-entry.level-info {
  border-left-color: var(--color-info-500);
  background: rgba(59, 130, 246, 0.1);
}

.console-entry.level-success {
  border-left-color: var(--color-success-500);
  background: rgba(34, 197, 94, 0.1);
}

.console-entry.level-warning {
  border-left-color: var(--color-warning-500);
  background: rgba(245, 158, 11, 0.1);
}

.console-entry.level-error {
  border-left-color: var(--color-danger-500);
  background: rgba(239, 68, 68, 0.1);
}

.timestamp {
  color: var(--color-neutral-400);
  margin-right: var(--spacing-sm);
}


.message {
  color: var(--text-primary);
}

.data {
  margin-top: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

[data-theme="dark"] .section-card {
}
</style>
