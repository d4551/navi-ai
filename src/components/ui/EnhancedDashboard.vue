<template>
  <div class="enhanced-dashboard" :class="[`dashboard-variant-${variant}`]">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="dashboard-title">
            <v-icon :icon="titleIcon" class="me-3" size="32" />
            {{ title }}
          </h1>
          <p v-if="subtitle" class="dashboard-subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="showStats" class="header-stats settings-grid">
          <div
            v-for="stat in headerStats"
            :key="stat.id"
            class="stat-card"
            :class="{ 'stat-clickable': stat.onClick }"
            @click="stat.onClick ? stat.onClick() : undefined"
          >
            <div class="stat-content">
              <div class="stat-icon-wrapper" :style="{ color: stat.color }">
                <v-icon :icon="stat.icon" size="20" />
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div
                  v-if="stat.change"
                  class="stat-change"
                  :class="[`change-${stat.changeType}`]"
                >
                  <v-icon
                    :icon="
                      stat.changeType === 'positive'
                        ? 'mdi-trending-up'
                        : 'mdi-trending-down'
                    "
                    size="14"
                  />
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div v-if="quickActions.length > 0" class="quick-actions-bar">
      <div class="actions-container">
        <h3 class="actions-title">Quick Actions</h3>
        <div class="actions-grid settings-grid">
          <div
            v-for="action in quickActions"
            :key="action.id"
            class="action-card"
            :class="{ 'action-disabled': action.disabled }"
            @click="handleActionClick(action)"
          >
            <div class="action-content">
              <div class="action-icon" :style="{ color: action.color }">
                <v-icon :icon="action.icon" size="24" />
              </div>
              <div class="action-details">
                <h4 class="action-title">{{ action.title }}</h4>
                <p class="action-description">{{ action.description }}</p>
                <div v-if="action.badge" class="action-badge">
                  {{ action.badge }}
                </div>
              </div>
            </div>
            <div v-if="action.progress !== undefined" class="action-progress">
              <v-progress-linear
                :model-value="action.progress"
                :color="action.color || 'primary'"
                height="4"
                rounded
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-content">
      <div class="content-grid split-layout--sidebar">
        <!-- Primary Content Area -->
        <div class="content-primary" :class="[`grid-layout-${layout}`]">
          <slot name="primary" />

          <!-- Default widgets if no content provided -->
          <div v-if="!$slots.primary" class="default-widgets portfolio-grid">
            <!-- Recent Activity Widget -->
            <div class="widget-card">
              <div class="widget-header">
                <h3 class="widget-title">
                  <v-icon icon="mdi-clock-outline" class="me-2" />
                  Recent Activity
                </h3>
                <UnifiedButton
                  icon-only
                  variant="ghost"
                  size="sm"
                  icon="mdi-refresh"
                  aria-label="Refresh"
                  @click="refreshActivity"
                />
              </div>
              <div class="widget-content">
                <div v-if="recentActivity.length === 0" class="empty-state">
                  <v-icon
                    icon="mdi-clipboard-text-outline"
                    size="48"
                    color="grey-lighten-1"
                  />
                  <p class="empty-text">No recent activity</p>
                </div>
                <div v-else class="activity-list">
                  <div
                    v-for="item in recentActivity"
                    :key="item.id"
                    class="activity-item"
                  >
                    <div class="activity-icon">
                      <v-icon :icon="item.icon" :color="item.color" size="16" />
                    </div>
                    <div class="activity-content">
                      <p class="activity-text">{{ item.text }}</p>
                      <p class="activity-time">
                        {{ formatTime(item.timestamp) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Overview Widget -->
            <div class="widget-card">
              <div class="widget-header">
                <h3 class="widget-title">
                  <v-icon icon="mdi-chart-line" class="me-2" />
                  Progress Overview
                </h3>
                <v-menu>
                  <template #activator="{ props }">
                    <UnifiedButton
                      icon-only
                      variant="ghost"
                      size="sm"
                      icon="mdi-dots-vertical"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item @click="exportProgress">
                      <v-list-item-title>Export Data</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="resetProgress">
                      <v-list-item-title>Reset Progress</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
              <div class="widget-content">
                <div class="progress-items">
                  <div
                    v-for="item in progressItems"
                    :key="item.id"
                    class="progress-item"
                  >
                    <div class="progress-header">
                      <span class="progress-label">{{ item.label }}</span>
                      <span class="progress-value">{{ item.value }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="item.value"
                      :color="item.color || 'primary'"
                      height="8"
                      rounded
                      class="progress-bar"
                    />
                    <p v-if="item.description" class="progress-description">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications Widget -->
            <div class="widget-card">
              <div class="widget-header">
                <h3 class="widget-title">
                  <v-icon icon="mdi-bell-outline" class="me-2" />
                  Notifications
                  <UiChip
                    v-if="notifications.length > 0"
                    classes="chip chip-info chip-compact ms-2"
                  >
                    {{ notifications.length }}
                  </UiChip>
                </h3>
                <UnifiedButton
                  v-if="notifications.length > 0"
                  variant="ghost"
                  size="sm"
                  @click="markAllRead"
                >
                  Mark all read
                </UnifiedButton>
              </div>
              <div class="widget-content">
                <div v-if="notifications.length === 0" class="empty-state">
                  <v-icon
                    icon="mdi-bell-off"
                    size="48"
                    color="grey-lighten-1"
                  />
                  <p class="empty-text">No new notifications</p>
                </div>
                <div v-else class="notifications-list">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="{ 'notification-unread': !notification.read }"
                  >
                    <div class="notification-content">
                      <div class="notification-header">
                        <span class="notification-title">{{
                          notification.title
                        }}</span>
                        <span class="notification-time">{{
                          formatTime(notification.timestamp)
                        }}</span>
                      </div>
                      <p class="notification-message">
                        {{ notification.message }}
                      </p>
                      <div
                        v-if="notification.actions"
                        class="notification-actions"
                      >
                        <UnifiedButton
                          v-for="action in notification.actions"
                          :key="action.id"
                          :variant="action.primary ? 'primary' : 'ghost'"
                          size="sm"
                          @click="
                            handleNotificationAction(notification, action)
                          "
                        >
                          {{ action.label }}
                        </UnifiedButton>
                      </div>
                    </div>
                    <UnifiedButton
                      icon-only
                      icon="mdi-close"
                      variant="ghost"
                      size="xs"
                      class="notification-dismiss"
                      aria-label="Dismiss notification"
                      @click="dismissNotification(notification.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Content -->
        <div v-if="showSidebar" class="content-sidebar">
          <slot name="sidebar" />

          <!-- Default sidebar content -->
          <div v-if="!$slots.sidebar" class="default-sidebar">
            <!-- Quick Stats -->
            <div class="sidebar-widget">
              <h4 class="sidebar-title">Quick Stats</h4>
              <div class="sidebar-stats">
                <div
                  v-for="stat in sidebarStats"
                  :key="stat.id"
                  class="sidebar-stat"
                >
                  <div class="stat-icon" :style="{ color: stat.color }">
                    <v-icon :icon="stat.icon" size="16" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Files -->
            <div class="sidebar-widget">
              <h4 class="sidebar-title">Recent Files</h4>
              <div class="recent-files">
                <div
                  v-for="file in recentFiles"
                  :key="file.id"
                  class="recent-file"
                  @click="openFile(file)"
                >
                  <div class="file-icon">
                    <v-icon :icon="file.icon" :color="file.color" size="16" />
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-date">{{ formatTime(file.modified) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div v-if="showFooter" class="dashboard-footer">
      <div class="footer-content">
        <div class="footer-info">
          <span class="footer-text">Last updated: {{ formatTime(lastUpdated) }}</span>
        </div>
        <div class="footer-actions">
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="mdi-refresh"
            @click="refreshDashboard"
          >
            Refresh
          </UnifiedButton>
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="mdi-download"
            @click="exportDashboard"
          >
            Export
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

import { ref, computed} from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import UiChip from "@/components/ui/UiChip.vue";

// Props
const _props = defineProps({
  title: { type: String, default: "Dashboard",
    default: ''
   },
  subtitle: String,
  titleIcon: { type: String, default: "mdi-view-dashboard",
    default: '',
    default: ''
  
   },
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      ["default", "gaming", "minimal", "professional"].includes(v),
  },
  layout: {
    type: String,
    default: "grid",
    validator: (v) => ["grid", "masonry", "list", "compact"].includes(v),
  },
  showStats: { type: Boolean, default: true,
    default: () => ({})
   },
  showSidebar: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
});

// Emits
const _emit = defineEmits([
  "refresh",
  "export",
  "actionClick",
  "notificationAction",
]);

// Reactive data
const lastUpdated = ref(new Date());

// Sample data (would come from props or stores)
const headerStats = ref([
  {
    id: "total-projects",
    icon: "mdi-briefcase",
    value: "24",
    label: "Total Projects",
    color: "var(--primary-color)",
    change: "+12%",
    changeType: "positive",
  },
  {
    id: "completed",
    icon: "mdi-check-circle-outline",
    value: "18",
    label: "Completed",
    color: "var(--success-color)",
    change: "+8%",
    changeType: "positive",
  },
  {
    id: "in-progress",
    icon: "mdi-clock-outline",
    value: "6",
    label: "In Progress",
    color: "var(--warning-color)",
  },
  {
    id: "success-rate",
    icon: "mdi-trending-up",
    value: "94%",
    label: "Success Rate",
    color: "var(--success-color)",
    change: "+2%",
    changeType: "positive",
  },
]);

const quickActions = ref([
  {
    id: "create-resume",
    title: "Create Resume",
    description: "Build a professional resume with AI assistance",
    icon: "mdi-file-document-outline-plus",
    color: "var(--primary-color)",
    progress: 0,
    onClick: () => emit("actionClick", "create-resume"),
  },
  {
    id: "search-jobs",
    title: "Search Jobs",
    description: "Find gaming industry opportunities",
    icon: "mdi-briefcase-search",
    color: "var(--info-color)",
    badge: "New",
    onClick: () => emit("actionClick", "search-jobs"),
  },
  {
    id: "portfolio",
    title: "Update Portfolio",
    description: "Showcase your best work",
    icon: "mdi-briefcase-variant",
    color: "var(--secondary-color)",
    progress: 75,
    onClick: () => emit("actionClick", "portfolio"),
  },
  {
    id: "skills",
    title: "Map Skills",
    description: "Discover transferable skills",
    icon: "mdi-brain",
    color: "var(--purple-color)",
    onClick: () => emit("actionClick", "skills"),
  },
]);

const recentActivity = ref([
  {
    id: 1,
    icon: "mdi-file-document-outline",
    color: "primary",
    text: "Updated resume - Senior Game Designer position",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 2,
    icon: "mdi-briefcase-search",
    color: "info",
    text: "Applied to 3 new gaming positions",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 3,
    icon: "mdi-account-check",
    color: "success",
    text: "Profile optimization completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]);

const progressItems = ref([
  {
    id: "resume",
    label: "Resume Completion",
    value: 85,
    color: "primary",
    description: "Add 2 more work experiences",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    value: 60,
    color: "secondary",
    description: "3 projects remaining",
  },
  {
    id: "applications",
    label: "Job Applications",
    value: 40,
    color: "info",
    description: "Target: 20 applications this month",
  },
]);

const notifications = ref([
  {
    id: 1,
    title: "New Job Match",
    message: "Found 5 new positions matching your profile",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actions: [
      { id: "view", label: "View Jobs", primary: true },
      { id: "dismiss", label: "Dismiss" },
    ],
  },
  {
    id: 2,
    title: "Profile Update",
    message: "Your resume analysis is complete",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
    actions: [{ id: "view-report", label: "View Report", primary: true }],
  },
]);

const sidebarStats = ref([
  {
    id: "views",
    icon: "mdi-eye",
    value: "247",
    label: "Profile Views",
    color: "var(--info-color)",
  },
  {
    id: "applications",
    icon: "mdi-send",
    value: "12",
    label: "Applications",
    color: "var(--success-color)",
  },
  {
    id: "interviews",
    icon: "mdi-account-voice",
    value: "3",
    label: "Interviews",
    color: "var(--warning-color)",
  },
]);

const recentFiles = ref([
  {
    id: 1,
    name: "Senior Designer Resume.pdf",
    icon: "mdi-file-pdf-box",
    color: "red",
    modified: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 2,
    name: "Cover Letter - Riot Games.docx",
    icon: "mdi-file-word-box",
    color: "blue",
    modified: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: 3,
    name: "Portfolio Draft.html",
    icon: "mdi-language-html5",
    color: "orange",
    modified: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]);

// Methods
const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const handleActionClick = (action) => {
  if (!action.disabled && action.onClick) {
    action.onClick();
  }
};

const handleNotificationAction = (notification, action) => {
  emit("notificationAction", notification, action);
  if (action.id === "dismiss") {
    dismissNotification(notification.id);
  }
};

const dismissNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const markAllRead = () => {
  notifications.value.forEach((n) => (n.read = true));
};

const refreshActivity = () => {
  // Refresh activity data
  lastUpdated.value = new Date();
};

const refreshDashboard = () => {
  lastUpdated.value = new Date();
  emit("refresh");
};

const exportDashboard = () => {
  emit("export");
};

const exportProgress = () => {
  console.log("Exporting progress data...");
};

const resetProgress = () => {
  console.log("Resetting progress...");
};

const openFile = (file) => {
  console.log("Opening file:", file.name);
};

onMounted(() => {
  lastUpdated.value = new Date();
});
</script>

<style scoped>
.enhanced-dashboard {
  min-height: 100vh;
  background: var(--surface-background);
  padding: var(--spacing-6);
}

.dashboard-header {
}

.header-content {
}

.header-main {
}

.dashboard-title {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.dashboard-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.header-stats {
}

.stat-card {
  background: var(--surface-paper);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-ease);
}

.stat-clickable {
  cursor: pointer;
}

.stat-clickable:hover {
  box-shadow: var(--shadow-lg);
}

.stat-content {
  display: flex;
  align-items: flex-start;
}

.stat-icon-wrapper {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.stat-details {
}

.stat-value {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-change {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.change-positive {
  color: var(--success-color);
}

.change-negative {
  color: var(--error-color);
}

.quick-actions-bar {
}

.actions-container {
}

.actions-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.actions-grid {
}

.action-card {
  background: var(--surface-paper);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease);
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  box-shadow: var(--shadow-lg);
}

.action-disabled {
  cursor: not-allowed;
}

.action-content {
  display: flex;
  align-items: flex-start;
}

.action-icon {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.action-details {
}

.action-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.action-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.action-badge {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.action-progress {
}

.dashboard-content {
}

.content-grid {
  align-items: start;
}

.content-primary {
}

.grid-layout-grid .default-widgets {
}

.grid-layout-masonry .default-widgets {
}

.grid-layout-list .default-widgets {
  display: flex;
  flex-direction: column;
}

.content-sidebar {
  position: sticky;
}

.widget-card {
  background: var(--surface-paper);
  border-radius: var(--radius-lg);
  break-inside: avoid;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.widget-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.widget-content {
}

.empty-state {
  text-align: center;
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast) var(--easing-ease);
}

.activity-item:hover {
  background: var(--surface-hover);
}

.activity-icon {
}

.activity-content {
}

.activity-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.progress-items {
  display: flex;
  flex-direction: column;
}

.progress-item {
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.progress-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.progress-bar {
}

.progress-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
}

.notification-unread {
  background: var(--surface-elevated);
  border-left-color: var(--primary-color);
}

.notification-content {
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.notification-actions {
  display: flex;
}

.default-sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar-widget {
  background: var(--surface-paper);
  border-radius: var(--radius-lg);
}

.sidebar-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.sidebar-stats {
  display: flex;
  flex-direction: column;
}

.sidebar-stat {
  display: flex;
  align-items: center;
}

.stat-icon {
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
}

.stat-info {
}

.recent-files {
  display: flex;
  flex-direction: column;
}

.recent-file {
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing-ease);
}

.recent-file:hover {
  background: var(--surface-hover);
}

.file-icon {
}

.file-info {
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.file-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.dashboard-footer {
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
}

.dashboard-variant-gaming {
  background: linear-gradient(
    var(--gaming-bg-primary),
    var(--gaming-bg-secondary)
  );
}

.dashboard-variant-gaming .dashboard-title {
  color: var(--gaming-accent);
}

.dashboard-variant-minimal {
  background: var(--surface-background);
}

.dashboard-variant-minimal .stat-card,
.dashboard-variant-minimal .widget-card {
  border: none;
  box-shadow: var(--shadow-sm);
}

.dashboard-variant-professional {
  background: var(--surface-paper);
}

.dashboard-variant-professional .header-stats {
}

  .content-grid {
  }

  .content-sidebar {
    position: static;
  }
}

  .enhanced-dashboard {
  }

  .header-stats {
  }

  .actions-grid {
  }

  .grid-layout-grid .default-widgets,
  .grid-layout-masonry .default-widgets {
  }
}

  .header-stats {
  }

  .dashboard-title {
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
