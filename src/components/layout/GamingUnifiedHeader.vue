<template>
  <header class="gaming-unified-header glass-gaming" :class="headerClasses">
    <!-- Main Navigation Bar -->
    <nav class="header-nav gaming-nav" role="navigation">
      <div class="nav-container">
        <!-- Left Section: Brand & Context -->
        <div class="nav-left">
          <router-link
            to="/"
            class="brand-link gaming-focus"
            aria-label="Go to Gaming Career Dashboard"
          >
            <div class="brand-content">
              <div class="brand-logo">
                <AppIcon
                  name="mdi-gamepad-variant"
                  size="28"
                  class="brand-icon gaming-pulse"
                />
                <div class="logo-glow"></div>
              </div>
              <div class="brand-text-group">
                <h1 class="brand-text gaming-title">NAVI</h1>
                <span class="brand-subtitle">Gaming Career Hub</span>
              </div>
            </div>
          </router-link>

          <!-- AI Model Status with Gaming Theme -->
          <div
            v-if="aiModelInfo"
            class="ai-status-chip"
            :class="getAIStatusClass()"
          >
            <div class="ai-status-indicator">
              <AppIcon :name="getAIStatusIcon()" size="16" />
              <div v-if="aiReady" class="status-pulse gaming-pulse"></div>
            </div>
            <span class="ai-status-text">{{ aiModelInfo }}</span>
            <div v-if="aiReady" class="ai-ready-glow neon-cyber"></div>
          </div>
        </div>

        <!-- Center Section: Gaming-Specific Navigation -->
        <div class="nav-center">
          <!-- Dynamic Breadcrumbs with Gaming Icons -->
          <div v-if="breadcrumbs.length > 0" class="gaming-breadcrumbs">
            <nav aria-label="Gaming Career Breadcrumb">
              <ol class="breadcrumb-list">
                <li
                  v-for="(crumb, index) in breadcrumbs"
                  :key="index"
                  class="breadcrumb-item"
                >
                  <router-link
                    v-if="crumb.to && index < breadcrumbs.length - 1"
                    :to="crumb.to"
                    class="breadcrumb-link gaming-interactive"
                  >
                    <AppIcon
                      v-if="crumb.icon"
                      :name="crumb.icon"
                      size="16"
                      class="breadcrumb-icon"
                    />
                    {{ crumb.label }}
                  </router-link>
                  <span v-else class="breadcrumb-current gaming-title">
                    <AppIcon
                      v-if="crumb.icon"
                      :name="crumb.icon"
                      size="16"
                      class="breadcrumb-icon"
                    />
                    {{ crumb.label }}
                  </span>
                  <AppIcon
                    v-if="index < breadcrumbs.length - 1"
                    name="mdi-chevron-right"
                    size="16"
                    class="breadcrumb-separator"
                  />
                </li>
              </ol>
            </nav>
          </div>

          <!-- Quick Gaming Context Info -->
          <div v-if="showGamingContext" class="gaming-context">
            <div class="context-stats">
              <div class="stat-item">
                <AppIcon name="mdi-briefcase" size="16" />
                <span>{{ totalJobs }} Gaming Jobs</span>
              </div>
              <div class="stat-item">
                <AppIcon name="mdi-office-building" size="16" />
                <span>{{ totalStudios }}+ Studios</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section: Search & Actions -->
        <div class="nav-right">
          <!-- Enhanced Gaming Search -->
          <div
            class="gaming-search-container"
            :class="{ 'search-active': searchActive }"
          >
            <div class="search-wrapper glass-cyber">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search gaming jobs, studios, skills..."
                class="gaming-search-input cyber-focus"
                :class="{ 'search-expanded': searchActive }"
                @focus="activateSearch"
                @blur="deactivateSearch"
                @input="handleSearch"
                @keydown.enter="performSearch"
                @keydown.escape="clearSearch"
              />
              <AppIcon name="mdi-magnify" size="20" class="search-icon" />
              <div v-if="searchQuery" class="search-clear" @click="clearSearch">
                <AppIcon name="mdi-close" size="16" />
              </div>
            </div>

            <!-- Search Suggestions for Gaming -->
            <div
              v-if="searchActive && searchSuggestions.length > 0"
              class="search-suggestions glass-surface"
            >
              <div
                v-for="suggestion in searchSuggestions"
                :key="suggestion.id"
                class="suggestion-item gaming-interactive"
                @click="selectSuggestion(suggestion)"
              >
                <AppIcon
                  :name="suggestion.icon"
                  size="16"
                  class="suggestion-icon"
                />
                <span class="suggestion-text">{{ suggestion.text }}</span>
                <span class="suggestion-category">{{
                  suggestion.category
                }}</span>
              </div>
            </div>
          </div>

          <!-- Gaming-Specific Quick Actions -->
          <div class="gaming-actions">
            <!-- Voice Commands with Gaming Style -->
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-microphone"
              class="gaming-interactive"
              :tooltip="{ text: 'Voice Commands (Ctrl+M)', position: 'bottom' }"
              :class="{ 'voice-active neon-gaming': voiceActive }"
              @click="toggleVoiceCommands"
            />

            <!-- AI Gaming Assistant -->
            <UnifiedButton
              variant="cyber"
              size="sm"
              leading-icon="mdi-brain"
              class="ai-assistant-btn"
              :tooltip="{
                text: 'Gaming AI Assistant (Ctrl+J)',
                position: 'bottom',
              }"
              :disabled="!aiReady"
              :class="{ 'ai-thinking': aiThinking }"
              @click="openGamingAIAssistant"
            >
              <span v-if="!aiThinking" class="ai-btn-text">AI</span>
              <div v-else class="ai-thinking-dots">
                <span></span><span></span><span></span>
              </div>
            </UnifiedButton>

            <!-- Gaming Notifications -->
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-bell"
              class="notifications-btn gaming-interactive"
              :tooltip="{
                text: 'Gaming Job Alerts & Notifications',
                position: 'bottom',
              }"
              :badge="
                notificationCount > 0 ? notificationCount.toString() : undefined
              "
              :class="{
                'has-notifications neon-gaming': notificationCount > 0,
              }"
              @click="toggleNotifications"
            />

            <!-- Gaming Profile/XP Status -->
            <div v-if="showGamingProfile" class="gaming-profile-status">
              <div class="xp-indicator glass-gaming">
                <AppIcon name="mdi-trophy" size="16" class="xp-icon" />
                <span class="xp-level">{{ userLevel }}</span>
              </div>
            </div>
          </div>

          <!-- Enhanced User Menu -->
          <div ref="userMenuRef" class="gaming-user-menu">
            <button
              class="user-button glass-gaming gaming-interactive"
              :class="{ 'menu-active neon-gaming': userMenuOpen }"
              :aria-expanded="userMenuOpen"
              aria-haspopup="true"
              @click="toggleUserMenu"
            >
              <div class="user-avatar-container">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  :alt="userName || 'User Profile'"
                  class="user-avatar"
                />
                <div v-else class="user-avatar-placeholder">
                  <AppIcon name="mdi-account" size="20" />
                </div>
                <div
                  v-if="userOnlineStatus"
                  class="online-indicator neon-gaming"
                ></div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ userName || "Gaming Dev" }}</span>
                <span class="user-role">{{ userRole || "Job Seeker" }}</span>
              </div>
              <AppIcon name="mdi-chevron-down" size="16" class="menu-arrow" />
            </button>

            <!-- Gaming User Menu Dropdown -->
            <transition name="menu-slide">
              <div v-if="userMenuOpen" class="user-menu-dropdown glass-gaming">
                <div class="menu-header">
                  <div class="user-profile-summary">
                    <h4 class="profile-name gaming-title">
                      {{ userName || "Gaming Developer" }}
                    </h4>
                    <p class="profile-subtitle">
                      Level {{ userLevel }} • {{ userXP }} XP
                    </p>
                  </div>
                </div>

                <div class="menu-section">
                  <h5 class="section-title">Career Tools</h5>
                  <router-link
                    to="/profile"
                    class="menu-item gaming-interactive"
                    @click="closeUserMenu"
                  >
                    <AppIcon name="mdi-account-edit" size="18" />
                    <span>Gaming Profile</span>
                  </router-link>
                  <router-link
                    to="/portfolio"
                    class="menu-item gaming-interactive"
                    @click="closeUserMenu"
                  >
                    <AppIcon name="mdi-briefcase-variant" size="18" />
                    <span>Portfolio</span>
                  </router-link>
                  <router-link
                    to="/skills"
                    class="menu-item gaming-interactive"
                    @click="closeUserMenu"
                  >
                    <AppIcon name="mdi-star" size="18" />
                    <span>Skills Mapper</span>
                  </router-link>
                </div>

                <div class="menu-section">
                  <h5 class="section-title">Gaming Focus</h5>
                  <router-link
                    to="/studios"
                    class="menu-item gaming-interactive"
                    @click="closeUserMenu"
                  >
                    <AppIcon name="mdi-office-building" size="18" />
                    <span>Studio Database</span>
                  </router-link>
                  <router-link
                    to="/gaming-interview"
                    class="menu-item gaming-interactive"
                    @click="closeUserMenu"
                  >
                    <AppIcon name="mdi-gamepad-variant" size="18" />
                    <span>Gaming Interviews</span>
                  </router-link>
                </div>

                <div class="menu-section">
                  <h5 class="section-title">System</h5>
                  <router-link
                    to="/settings"
                    class="menu-item gaming-interactive"
                    @click="closeUserMenu"
                  >
                    <AppIcon name="mdi-cog" size="18" />
                    <span>Settings</span>
                  </router-link>
                  <button
                    class="menu-item gaming-interactive"
                    @click="handleThemeToggle"
                  >
                    <AppIcon
                      :name="
                        isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'
                      "
                      size="18"
                    />
                    <span>{{ isDarkMode ? "Light Mode" : "Dark Mode" }}</span>
                  </button>
                </div>

                <div class="menu-footer">
                  <button class="menu-item sign-out-btn" @click="handleSignOut">
                    <AppIcon name="mdi-logout" size="18" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <!-- Secondary Navigation Bar (Contextual) -->
    <div v-if="showSecondaryNav" class="secondary-nav glass-surface">
      <div class="secondary-nav-container">
        <div class="nav-tabs gaming-nav-tabs">
          <router-link
            v-for="tab in secondaryNavTabs"
            :key="tab.path"
            :to="tab.path"
            class="nav-tab gaming-interactive"
            :class="{ 'tab-active neon-gaming': isActiveTab(tab.path) }"
          >
            <AppIcon :name="tab.icon" size="18" class="tab-icon" />
            <span class="tab-text">{{ tab.label }}</span>
            <div v-if="tab.badge" class="tab-badge">{{ tab.badge }}</div>
          </router-link>
        </div>

        <!-- Context Actions -->
        <div v-if="contextActions.length > 0" class="context-actions">
          <UnifiedButton
            v-for="action in contextActions"
            :key="action.key"
            :variant="action.variant || 'outline'"
            :size="action.size || 'sm'"
            :leading-icon="action.icon"
            :class="action.class"
            @click="action.handler"
          >
            {{ action.label }}
          </UnifiedButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAppStore } from '@/stores/app'
import { toastService } from '@/shared/services/toastService'

// Props
interface Props {
  showGamingContext?: boolean
  showGamingProfile?: boolean
  showSecondaryNav?: boolean
  secondaryNavTabs?: Array<any>
  contextActions?: Array<any>
  totalJobs?: number
  totalStudios?: number
}

const props = withDefaults(defineProps<Props>(), {
  showGamingContext: true,
  showGamingProfile: true,
  showSecondaryNav: false,
  secondaryNavTabs: () => [],
  contextActions: () => [],
  totalJobs: 0,
  totalStudios: 150
})

// Store and router
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

// Reactive state
const searchQuery = ref('')
const searchActive = ref(false)
const searchSuggestions = ref([])
const userMenuOpen = ref(false)
const voiceActive = ref(false)
const aiThinking = ref(false)
const userMenuRef = ref(null)

// Computed properties
const headerClasses = computed(() => ({
  'header-compact': appStore.isDenseMode,
  'header-gaming-focus': route.path.includes('/jobs') || route.path.includes('/studios')
}))

const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const crumbs = []

  // Add home
  crumbs.push({ label: 'Gaming Hub', to: '/', icon: 'mdi-gamepad-variant' })

  // Generate breadcrumbs based on route
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += '/' + segment
    const routeInfo = getRouteInfo(segment, currentPath)
    if (routeInfo) {
      crumbs.push({
        label: routeInfo.label,
        to: index === pathSegments.length - 1 ? null : currentPath,
        icon: routeInfo.icon
      })
    }
  })

  return crumbs
})

const aiModelInfo = computed(() => appStore.aiModelInfo || 'Gemini Pro')
const aiReady = computed(() => appStore.aiReady)
const notificationCount = computed(() => appStore.notifications?.length || 0)
const isDarkMode = computed(() => appStore.isDarkMode)
const userName = computed(() => appStore.profile?.name)
const userRole = computed(() => appStore.profile?.role || 'Gaming Job Seeker')
const userLevel = computed(() => appStore.profile?.level || 1)
const userXP = computed(() => appStore.profile?.xp || 0)
const userAvatar = computed(() => appStore.profile?.avatar)
const userOnlineStatus = computed(() => true) // Always online for now

// Methods
const getRouteInfo = (segment, path) => {
  const routeMap = {
    'jobs': { label: 'Gaming Jobs', icon: 'mdi-briefcase-search' },
    'studios': { label: 'Studios', icon: 'mdi-office-building' },
    'portfolio': { label: 'Portfolio', icon: 'mdi-briefcase-variant' },
    'skills': { label: 'Skills', icon: 'mdi-star' },
    'interview-prep': { label: 'Interview Prep', icon: 'mdi-microphone' },
    'gaming-interview': { label: 'Gaming Interview', icon: 'mdi-gamepad-variant' },
    'documents': { label: 'Documents', icon: 'mdi-text-box-edit-outline' },
    'settings': { label: 'Settings', icon: 'mdi-cog' }
  }

  return routeMap[segment] || { label: segment.charAt(0).toUpperCase() + segment.slice(1), icon: 'mdi-folder' }
}

const getAIStatusClass = () => ({
  'ai-ready neon-cyber': aiReady.value,
  'ai-offline': !aiReady.value,
  'ai-thinking': aiThinking.value
})

const getAIStatusIcon = () => {
  if (aiThinking.value) return 'mdi-loading'
  return aiReady.value ? 'mdi-chip' : 'mdi-alert-circle-outline'
}

const activateSearch = () => {
  searchActive.value = true
  generateSearchSuggestions()
}

const deactivateSearch = () => {
  setTimeout(() => {
    searchActive.value = false
    searchSuggestions.value = []
  }, 150)
}

const generateSearchSuggestions = () => {
  if (!searchQuery.value.trim()) {
    searchSuggestions.value = [
      { id: 1, text: 'Unity Developer Jobs', category: 'Jobs', icon: 'mdi-briefcase' },
      { id: 2, text: 'Unreal Engine Positions', category: 'Jobs', icon: 'mdi-briefcase' },
      { id: 3, text: 'Epic Games Studio', category: 'Studios', icon: 'mdi-office-building' },
      { id: 4, text: 'Game Designer Remote', category: 'Jobs', icon: 'mdi-briefcase' },
      { id: 5, text: 'C# Programming Skills', category: 'Skills', icon: 'mdi-star' }
    ]
  } else {
    // Filter suggestions based on search query
    // This would typically call a search API
    searchSuggestions.value = []
  }
}

const handleSearch = () => {
  generateSearchSuggestions()
  // Debounced search logic would go here
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/jobs?q=${encodeURIComponent(searchQuery.value)}`)
    searchActive.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchSuggestions.value = []
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.text
  performSearch()
}

const toggleVoiceCommands = () => {
  voiceActive.value = !voiceActive.value
  toastService.info(voiceActive.value ? 'Voice commands activated' : 'Voice commands deactivated')
}

const openGamingAIAssistant = () => {
  aiThinking.value = true
  setTimeout(() => {
    aiThinking.value = false
    toastService.success('Gaming AI Assistant opened')
  }, 1000)
}

const toggleNotifications = () => {
  toastService.info('Notifications panel opened')
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const handleThemeToggle = () => {
  appStore.toggleTheme()
  closeUserMenu()
}

const handleSignOut = () => {
  toastService.info('Sign out initiated')
  closeUserMenu()
}

const isActiveTab = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Click outside handler
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userMenuOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault()
      toggleVoiceCommands()
    } else if (e.ctrlKey && e.key === 'j') {
      e.preventDefault()
      openGamingAIAssistant()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.gaming-unified-header {
  position: sticky;
  backdrop-filter: var(--glass-gaming-backdrop);
  transition: var(--transition-gaming);
}

.header-nav {
}

.nav-container {
  max-width: var(--page-container-max-width);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
}

.brand-link {
  text-decoration: none;
  transition: var(--transition-gaming);
}

.brand-content {
  display: flex;
  align-items: center;
}

.brand-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  transition: var(--transition-gaming);
}

.logo-glow {
  position: absolute;
  background: radial-gradient(
    circle,
  );
  transition: var(--transition-gaming);
}

.brand-link:hover .logo-glow {
}

.brand-text-group {
  display: flex;
  flex-direction: column;
}

.brand-text {
}

.brand-subtitle {
  color: var(--text-muted);
  text-transform: uppercase;
}

.ai-status-chip {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full);
  background: var(--glass-cyber-bg);
  transition: var(--transition-cyber);
  position: relative;
  overflow: hidden;
}

.ai-status-indicator {
  position: relative;
  display: flex;
  align-items: center;
}

.status-pulse {
  position: absolute;
}

.ai-ready-glow {
  position: absolute;
  border-radius: inherit;
}

.ai-offline {
}

.nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gaming-breadcrumbs {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  text-decoration: none;
  color: var(--text-secondary);
  transition: var(--transition-gaming);
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
}

.breadcrumb-link:hover {
}

.breadcrumb-current {
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.gaming-context {
  background: var(--glass-gaming-bg);
  border-radius: var(--radius-lg);
}

.context-stats {
  display: flex;
}

.stat-item {
  display: flex;
  align-items: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.gaming-search-container {
  position: relative;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: var(--radius-cyber);
  transition: var(--transition-cyber);
}

.gaming-search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  transition: var(--transition-cyber);
}

.gaming-search-input::placeholder {
  color: var(--text-muted);
}

.search-expanded {
}

.search-icon {
  position: absolute;
  color: var(--text-muted);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  cursor: pointer;
  color: var(--text-muted);
  transition: var(--transition-cyber);
  border-radius: var(--radius-sm);
}

.search-clear:hover {
  color: var(--text-primary);
}

.search-suggestions {
  position: absolute;
  border-radius: var(--radius-lg);
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-gaming);
}

.suggestion-item:hover {
}

.suggestion-text {
  color: var(--text-primary);
}

.suggestion-category {
  color: var(--text-muted);
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
}

.gaming-actions {
  display: flex;
  align-items: center;
}

.voice-active {
}

.ai-assistant-btn {
  position: relative;
}

.ai-thinking {
  pointer-events: none;
}

.ai-thinking-dots {
  display: flex;
}

.ai-thinking-dots span {
  background: currentColor;
}

}
}

.has-notifications {
}

.gaming-profile-status {
  display: flex;
  align-items: center;
}

.xp-indicator {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full);
}

.xp-icon {
}

.gaming-user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-gaming);
  color: var(--text-primary);
}

.user-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  object-fit: cover;
}

.user-avatar-placeholder {
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.online-indicator {
  position: absolute;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
}

.user-role {
  color: var(--text-muted);
}

.menu-arrow {
  transition: var(--transition-gaming);
}

.menu-active .menu-arrow {
}

.user-menu-dropdown {
  position: absolute;
  border-radius: var(--radius-lg);
}

.menu-header {
}

.profile-name {
}

.profile-subtitle {
  color: var(--text-secondary);
}

.menu-section {
}

.section-title {
  color: var(--text-muted);
  text-transform: uppercase;
}

.menu-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: var(--transition-gaming);
}

.menu-item:hover {
}

.menu-footer {
}

.sign-out-btn:hover {
}

.secondary-nav {
}

.secondary-nav-container {
  max-width: var(--page-container-max-width);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gaming-nav-tabs {
  display: flex;
}

.nav-tab {
  display: flex;
  align-items: center;
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-secondary);
  transition: var(--transition-gaming);
  position: relative;
}

.nav-tab:hover {
}

.tab-active {
}

.tab-badge {
  color: white;
  border-radius: var(--radius-full);
  text-align: center;
}

.context-actions {
  display: flex;
}

.menu-slide-enter-active,
.menu-slide-leave-active {
  transform-origin: top right;
}

.menu-slide-enter-from,
.menu-slide-leave-to {
}

@keyframes pulse {
  }
  }
}

  .gaming-search-input {
  }

  .search-expanded {
  }

  .brand-text-group {
    display: none;
  }

  .gaming-context {
    display: none;
  }
}

  .nav-container {
  }

  .gaming-breadcrumbs {
    display: none;
  }

  .gaming-search-input {
  }

  .user-info {
    display: none;
  }

  .gaming-actions {
  }
}

  .ai-status-chip {
    display: none;
  }

  .gaming-profile-status {
    display: none;
  }
}
</style>
