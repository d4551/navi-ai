<template>
  <div
    class="enhanced-dashboard font-sans"
    :class="[`dashboard-variant-${variant}`]"
  >
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="dashboard-title">
            <v-icon :icon="titleIcon" class="mr-3" size="32" />
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
                  <v-icon icon="ClockIcon" class="mr-2" />
                  Recent Activity
                </h3>
                <UnifiedButton
                  icon-only
                  variant="ghost"
                  size="sm"
                  icon="ArrowPathIcon"
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
                  <v-icon icon="ChartBarIcon" class="mr-2" />
                  Progress Overview
                </h3>
                <v-menu>
                  <template #activator="{ props }">
                    <UnifiedButton
                      icon-only
                      variant="ghost"
                      size="sm"
                      icon="EllipsisVerticalIcon"
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
                  <v-icon icon="BellIcon" class="mr-2" />
                  Notifications
                  <UiChip
                    v-if="notifications.length > 0"
                    classes="chip chip-info chip-compact ml-2"
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
                      icon="XMarkIcon"
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
          <span class="footer-text"
            >Last updated: {{ formatTime(lastUpdated) }}</span
          >
        </div>
        <div class="footer-actions">
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="ArrowPathIcon"
            @click="refreshDashboard"
            >Refresh</UnifiedButton
          >
          <UnifiedButton
            variant="ghost"
            size="sm"
            leading-icon="ArrowDownTrayIcon"
            @click="exportDashboard"
            >Export</UnifiedButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BellIcon,
  ChartBarIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

import { ref, computed, onMounted } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'

// Props
const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  subtitle: String,
  titleIcon: { type: String, default: 'mdi-view-dashboard' },
  variant: {
    type: String,
    default: 'default',
    validator: v =>
      ['default', 'gaming', 'minimal', 'professional'].includes(v),
  },
  layout: {
    type: String,
    default: 'grid',
    validator: v => ['grid', 'masonry', 'list', 'compact'].includes(v),
  },
  showStats: { type: Boolean, default: true, default: () => ({}) },
  showSidebar: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
})

// Emits
const emit = defineEmits([
  'refresh',
  'export',
  'actionClick',
  'notificationAction',
])

// Reactive data
const lastUpdated = ref(new Date())

// Sample data (would come from props or stores)
const headerStats = ref([
  {
    id: 'total-projects',
    icon: 'mdi-briefcase',
    value: '24',
    label: 'Total Projects',
    color: 'var(--primary-color)',
    change: '+12%',
    changeType: 'positive',
  },
  {
    id: 'completed',
    icon: 'CheckIcon-circle-outline',
    value: '18',
    label: 'Completed',
    color: 'var(--success-color)',
    change: '+8%',
    changeType: 'positive',
  },
  {
    id: 'in-progress',
    icon: 'ClockIcon-outline',
    value: '6',
    label: 'In Progress',
    color: 'var(--warning-color)',
  },
  {
    id: 'success-rate',
    icon: 'mdi-trending-up',
    value: '94%',
    label: 'Success Rate',
    color: 'var(--success-color)',
    change: '+2%',
    changeType: 'positive',
  },
])

const quickActions = ref([
  {
    id: 'create-resume',
    title: 'Create Resume',
    description: 'Build a professional resume with AI assistance',
    icon: 'DocumentIcon-document-outline-plus',
    color: 'var(--primary-color)',
    progress: 0,
    onClick: () => emit('actionClick', 'create-resume'),
  },
  {
    id: 'search-jobs',
    title: 'Search Jobs',
    description: 'Find gaming industry opportunities',
    icon: 'mdi-briefcase-search',
    color: 'var(--info-color)',
    badge: 'New',
    onClick: () => emit('actionClick', 'search-jobs'),
  },
  {
    id: 'portfolio',
    title: 'Update Portfolio',
    description: 'Showcase your best work',
    icon: 'mdi-briefcase-variant',
    color: 'var(--secondary-color)',
    progress: 75,
    onClick: () => emit('actionClick', 'portfolio'),
  },
  {
    id: 'skills',
    title: 'Map Skills',
    description: 'Discover transferable skills',
    icon: 'mdi-brain',
    color: 'var(--purple-color)',
    onClick: () => emit('actionClick', 'skills'),
  },
])

const recentActivity = ref([
  {
    id: 1,
    icon: 'DocumentIcon-document-outline',
    color: 'primary',
    text: 'Updated resume - Senior Game Designer position',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 2,
    icon: 'mdi-briefcase-search',
    color: 'info',
    text: 'Applied to 3 new gaming positions',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 3,
    icon: 'UserIcon-check',
    color: 'success',
    text: 'Profile optimization completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
])

const progressItems = ref([
  {
    id: 'resume',
    label: 'Resume Completion',
    value: 85,
    color: 'primary',
    description: 'Add 2 more work experiences',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    value: 60,
    color: 'secondary',
    description: '3 projects remaining',
  },
  {
    id: 'applications',
    label: 'Job Applications',
    value: 40,
    color: 'info',
    description: 'Target: 20 applications this month',
  },
])

const notifications = ref([
  {
    id: 1,
    title: 'New Job Match',
    message: 'Found 5 new positions matching your profile',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actions: [
      { id: 'view', label: 'View Jobs', primary: true },
      { id: 'dismiss', label: 'Dismiss' },
    ],
  },
  {
    id: 2,
    title: 'Profile Update',
    message: 'Your resume analysis is complete',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
    actions: [{ id: 'view-report', label: 'View Report', primary: true }],
  },
])

const sidebarStats = ref([
  {
    id: 'views',
    icon: 'EyeIcon',
    value: '247',
    label: 'Profile Views',
    color: 'var(--info-color)',
  },
  {
    id: 'applications',
    icon: 'mdi-send',
    value: '12',
    label: 'Applications',
    color: 'var(--success-color)',
  },
  {
    id: 'interviews',
    icon: 'UserIcon-voice',
    value: '3',
    label: 'Interviews',
    color: 'var(--warning-color)',
  },
])

const recentFiles = ref([
  {
    id: 1,
    name: 'Senior Designer Resume.pdf',
    icon: 'DocumentIcon-pdf-box',
    color: 'red',
    modified: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 2,
    name: 'Cover Letter - Riot Games.docx',
    icon: 'DocumentIcon-word-box',
    color: 'blue',
    modified: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: 3,
    name: 'Portfolio Draft.html',
    icon: 'mdi-language-html5',
    color: 'orange',
    modified: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
])

// Methods
const formatTime = date => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const handleActionClick = action => {
  if (!action.disabled && action.onClick) {
    action.onClick()
  }
}

const handleNotificationAction = (notification, action) => {
  emit('notificationAction', notification, action)
  if (action.id === 'dismiss') {
    dismissNotification(notification.id)
  }
}

const dismissNotification = id => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const markAllRead = () => {
  notifications.value.forEach(n => (n.read = true))
}

const refreshActivity = () => {
  // Refresh activity data
  lastUpdated.value = new Date()
}

const refreshDashboard = () => {
  lastUpdated.value = new Date()
  emit('refresh')
}

const exportDashboard = () => {
  emit('export')
}

const exportProgress = () => {
  console.log('Exporting progress data...')
}

const resetProgress = () => {
  console.log('Resetting progress...')
}

const openFile = file => {
  console.log('Opening file:', file.name)
}

onMounted(() => {
  lastUpdated.value = new Date()
})
</script>

<style scoped>
.enhanced-dashboard {
  min-height: 100vh;
  background: var(--surface-background);
  padding: var(--spacing-6);
}

/* Header */
.dashboard-header {
  margin-bottom: var(--spacing-8);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-main {
  margin-bottom: var(--spacing-6);
}

.dashboard-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-2);
}

.dashboard-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

.header-stats {
  gap: var(--spacing-4);
}

.stat-card {
  background: var(--surface-paper);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  transition: all var(--duration-normal) var(--easing-ease);
}

.stat-clickable {
  cursor: pointer;
}

.stat-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-lg);
}

.stat-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
}

.stat-icon-wrapper {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

.stat-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-2);
}

.change-positive {
  color: var(--success-color);
}

.change-negative {
  color: var(--error-color);
}

/* Quick Actions */
.quick-actions-bar {
  margin-bottom: var(--spacing-8);
}

.actions-container {
  max-width: 1400px;
  margin: 0 auto;
}

.actions-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-4);
}

.actions-grid {
  gap: var(--spacing-4);
}

.action-card {
  background: var(--surface-paper);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease);
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-lg);
}

.action-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
}

.action-icon {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
}

.action-details {
  flex: 1;
}

.action-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
}

.action-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.action-badge {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-2);
}

.action-progress {
  margin-top: var(--spacing-4);
}

/* Content Grid */
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  gap: var(--spacing-8);
  align-items: start;
}

.content-primary {
  min-width: 0;
}

.grid-layout-grid .default-widgets {
  gap: var(--spacing-6);
}

.grid-layout-masonry .default-widgets {
  columns: 2;
  column-gap: var(--spacing-6);
}

.grid-layout-list .default-widgets {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.content-sidebar {
  width: 320px;
  position: sticky;
  top: var(--spacing-6);
}

/* Widgets */
.widget-card {
  background: var(--surface-paper);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
  break-inside: avoid;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-5) var(--spacing-5) var(--spacing-3);
}

.widget-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

.widget-content {
  padding: 0 var(--spacing-5) var(--spacing-5);
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-3);
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast) var(--easing-ease);
}

.activity-item:hover {
  background: var(--surface-hover);
}

.activity-icon {
  margin-top: var(--spacing-1);
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
}

/* Progress Items */
.progress-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.progress-item {
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.progress-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.progress-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.progress-bar {
  margin-bottom: var(--spacing-2);
}

.progress-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
}

/* Notifications */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-sm);
  border-l: 4px solid transparent;
  transition: all var(--duration-fast) var(--easing-ease);
}

.notification-unread {
  background: var(--surface-elevated);
  border-l-color: var(--primary-color);
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-1);
}

.notification-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-3) 0;
}

.notification-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Sidebar */
.default-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.sidebar-widget {
  background: var(--surface-paper);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.sidebar-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-4) 0;
}

.sidebar-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.sidebar-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.stat-icon {
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
  padding: var(--spacing-2);
}

.stat-info {
  flex: 1;
}

.recent-files {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.recent-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
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
  flex: 1;
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.file-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Footer */
.dashboard-footer {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-6);
  border-t: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Variants */
.dashboard-variant-gaming {
  background: linear-gradient(
    135deg,
    var(--gaming-bg-primary-500),
    var(--gaming-bg-secondary-500)
  );
}

.dashboard-variant-gaming .dashboard-title {
  color: var(--gaming-accent);
  text-shadow: 0 0 10px rgba(var(--gaming-accent-rgb), 0.3);
}

.dashboard-variant-minimal {
  background: var(--surface-background);
  padding: var(--spacing-4);
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
  grid-template-columns: repeat(4, 1fr);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }

  .content-sidebar {
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .enhanced-dashboard {
    padding: var(--spacing-4);
  }

  .header-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .grid-layout-grid .default-widgets,
  .grid-layout-masonry .default-widgets {
    grid-template-columns: 1fr;
    columns: 1;
  }
}

@media (max-width: 480px) {
  .header-stats {
    grid-template-columns: 1fr;
  }

  .dashboard-title {
    font-size: var(--font-size-2xl);
  }

  .footer-content {
    flex-direction: column;
    gap: var(--spacing-4);
    text-align: center;
  }
}
</style>
