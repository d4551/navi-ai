<template>
  <nav
    class="enhanced-navigation"
    :class="[
      `nav-variant-${variant}`,
      { 'nav-sticky': sticky, 'nav-transparent': transparent },
    ]"
    role="navigation"
    :aria-label="ariaLabel"
  >
    <!-- Primary Navigation Bar -->
    <div class="nav-primary" :class="{ 'glass-layout': glassHeader }">
      <div class="nav-container" :class="{ 'has-glass-header': glassHeader }">
        <!-- Left: Brand (standard) or Glass Header Layout -->
        <div v-if="!glassHeader" class="nav-left">
          <router-link to="/" class="nav-brand" :aria-label="brandLabel">
            <div class="brand-content">
              <AppIcon
                v-if="brandIcon"
                :name="brandIcon"
                size="24"
                class="brand-icon"
              />
              <span v-if="brandText" class="brand-text">{{ brandText }}</span>
            </div>
          </router-link>
          <Tooltip
            v-if="modelDisplay && aiOnline"
            position="bottom"
            :dark="isDarkMode"
          >
            <template #content>
              <div class="rich">
                <span class="tooltip-title">{{ modelDisplay }}</span>
                <div class="badges">
                  <span
                    v-for="cap in modelCapabilityBadges"
                    :key="cap"
                    class="cap-badge"
                    >{{ cap }}</span
                  >
                </div>
                <div class="tooltip-footer">
                  <AppIcon name="mdi-cog-outline" /> Configure AI
                </div>
              </div>
            </template>
            <div
              class="model-chip"
              :aria-label="`AI Model: ${modelDisplay} — Configure AI`"
              role="button"
              tabindex="0"
              @click="navigateToAISettings"
              @keydown.enter.prevent="navigateToAISettings"
              @keydown.space.prevent="navigateToAISettings"
            >
              <AppIcon name="mdi-chip" />
              <span class="chip-text">{{ modelDisplay }}</span>
              <AppIcon
                name="mdi-cog-outline"
                class="model-gear"
                aria-hidden="true"
              />
            </div>
          </Tooltip>
          <div
            v-if="showBreadcrumbs && breadcrumbs.length > 0"
            class="nav-breadcrumbs"
          >
            <AppIcon
              name="mdi-chevron-right"
              size="16"
              class="breadcrumb-separator"
            />
            <ol class="breadcrumb-list" role="list">
              <li
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                class="breadcrumb-item"
                :class="{
                  'breadcrumb-current': index === breadcrumbs.length - 1,
                }"
              >
                <router-link
                  v-if="crumb.to && index !== breadcrumbs.length - 1"
                  :to="crumb.to"
                  class="breadcrumb-link"
                  :aria-current="
                    index === breadcrumbs.length - 1 ? 'page' : undefined
                  "
                >
                  <AppIcon
                    v-if="crumb.icon"
                    :name="crumb.icon"
                    size="14"
                    class="me-1"
                  />
                  {{ crumb.text }}
                </router-link>
                <span
                  v-else
                  class="breadcrumb-current-text"
                  :aria-current="
                    index === breadcrumbs.length - 1 ? 'page' : undefined
                  "
                >
                  <AppIcon
                    v-if="crumb.icon"
                    :name="crumb.icon"
                    size="14"
                    class="me-1"
                  />
                  {{ crumb.text }}
                </span>
                <AppIcon
                  v-if="index < breadcrumbs.length - 1"
                  name="mdi-chevron-right"
                  size="14"
                  class="breadcrumb-separator"
                />
              </li>
            </ol>
          </div>
        </div>

        <!-- Glass Header: 3-row layout inside brand container -->
        <div v-else class="nav-left">
          <div class="nav-brand glass-header">
            <!-- Row 1: Brand and AI status -->
            <div class="brand-row">
              <router-link to="/" class="brand-link" :aria-label="brandLabel">
                <img
                  v-if="brandLogo"
                  :src="brandLogo"
                  alt="NAVI"
                  class="app-logo brand-logo"
                />
                <div v-else class="brand-logo brand-icon-fallback">
                  <AppIcon
                    :name="brandIcon || 'mdi-gamepad-variant'"
                    size="28"
                  />
                </div>
                <div class="brand-text">
                  <span class="brand-name">{{ brandText }}</span>
                  <span v-if="brandSubtitle" class="brand-subtitle">{{
                    brandSubtitle
                  }}</span>
                </div>
              </router-link>
              <div
                class="brand-status"
                :class="aiOnline ? 'status-connected' : 'status-disconnected'"
              >
                <div class="status-dot"></div>
                <span class="status-text">{{ aiStatusText }}</span>
              </div>
              <Tooltip
                v-if="modelDisplay && aiOnline"
                position="bottom"
                :dark="isDarkMode"
              >
                <template #content>
                  <div class="rich">
                    <span class="tooltip-title">{{ modelDisplay }}</span>
                    <div class="badges">
                      <span
                        v-for="cap in modelCapabilityBadges"
                        :key="cap"
                        class="cap-badge"
                        >{{ cap }}</span
                      >
                    </div>
                    <div class="tooltip-footer">
                      <AppIcon name="mdi-cog-outline" /> Configure AI
                    </div>
                  </div>
                </template>
                <div
                  class="model-chip"
                  :aria-label="`AI Model: ${modelDisplay} — Configure AI`"
                  role="button"
                  tabindex="0"
                  @click="navigateToAISettings"
                  @keydown.enter.prevent="navigateToAISettings"
                  @keydown.space.prevent="navigateToAISettings"
                >
                  <AppIcon name="mdi-chip" />
                  <span class="chip-text">{{ modelDisplay }}</span>
                  <AppIcon
                    name="mdi-cog-outline"
                    class="model-gear"
                    aria-hidden="true"
                  />
                </div>
              </Tooltip>
            </div>

            <!-- Row 2: Control Buttons -->
            <div class="nav-control-buttons">
              <button
                class="modern-button"
                type="button"
                aria-label="Toggle search"
                title="Search (Ctrl+K)"
                @click="emit('search', searchQuery)"
              >
                <AppIcon name="mdi-magnify" />
                <div class="ripple-container"></div>
              </button>
              <button
                class="modern-button"
                type="button"
                aria-label="Toggle density"
                title="Density"
                @click="emit('toggleDensity')"
              >
                <AppIcon name="mdi-format-line-spacing" />
                <div class="ripple-container"></div>
              </button>
              <button
                v-if="showThemeToggle"
                class="modern-button"
                type="button"
                aria-label="Switch theme"
                title="Switch theme"
                @click="toggleTheme()"
              >
                <AppIcon name="mdi-weather-night" />
                <div class="ripple-container"></div>
              </button>
              <button
                class="modern-button"
                type="button"
                aria-label="Collapse navigation"
                title="Collapse sidebar (Ctrl+B)"
                @click="emit('collapse')"
              >
                <AppIcon name="mdi-chevron-double-left" />
                <div class="ripple-container"></div>
              </button>
              <!-- Theme mode badge removed per guidelines -->
            </div>

            <!-- Row 3: Quick Filter -->
            <div>
              <div class="quick-filter-field">
                <AppIcon name="mdi-magnify" />
                <input
                  v-model="quickFilter"
                  type="text"
                  placeholder="Filter navigation..."
                  aria-label="Filter navigation"
                  @input="onQuickFilterInput"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Center: Search / Filters (if enabled) -->
        <div v-if="showSearch && !glassHeader" class="nav-center">
          <div class="nav-search-layout">
            <div class="nav-search-wrapper">
              <v-text-field
                v-model="searchQuery"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Search..."
                prepend-inner-icon="mdi-magnify"
                class="nav-search"
                @keydown.enter="handleSearch"
                @input="handleSearchInput"
              >
                <template v-if="searchLoading" #append-inner>
                  <v-progress-circular
                    indeterminate
                    size="16"
                    width="2"
                    color="primary"
                  />
                </template>
              </v-text-field>

              <!-- Search Suggestions Dropdown -->
              <div
                v-if="searchSuggestions.length > 0 && showSuggestions"
                class="search-suggestions"
                role="listbox"
              >
                <div
                  v-for="(suggestion, index) in searchSuggestions"
                  :key="index"
                  class="search-suggestion"
                  role="option"
                  @click="selectSuggestion(suggestion)"
                >
                  <AppIcon
                    :name="suggestion.icon || 'mdi-file'"
                    size="16"
                    class="me-2"
                  />
                  <span class="suggestion-text">{{ suggestion.text }}</span>
                  <span
                    v-if="suggestion.category"
                    class="suggestion-category"
                    >{{ suggestion.category }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Optional filters area provided by parent via slot -->
            <div v-if="$slots.filters" class="nav-filters-wrapper">
              <slot name="filters" />
            </div>
          </div>
        </div>

        <!-- Right: User Actions -->
        <div v-if="!glassHeader" class="nav-right">
          <!-- Quick Actions -->
          <div v-if="quickActions.length > 0" class="nav-quick-actions">
            <UnifiedButton
              v-for="action in quickActions"
              :key="action.id"
              icon-only
              size="sm"
              variant="ghost"
              :icon="action.icon"
              :to="action.to"
              :href="action.href"
              :aria-label="action.label"
              :title="action.label"
              class="nav-action-btn"
              @click="action.onClick ? action.onClick() : undefined"
            />
          </div>

          <!-- Notifications Bell -->
          <div v-if="showNotifications" class="nav-notifications">
            <v-badge
              v-if="notificationCount > 0"
              :content="notificationCount > 99 ? '99+' : notificationCount"
              color="error"
              offset-x="2"
              offset-y="2"
            >
              <UnifiedButton
                icon-only
                variant="ghost"
                size="sm"
                icon="mdi-bell"
                :aria-label="`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ''}`"
                class="nav-notification-btn"
                @click="toggleNotifications"
              />
            </v-badge>
            <UnifiedButton
              v-else
              icon-only
              variant="ghost"
              size="sm"
              icon="mdi-bell"
              :aria-label="`Notifications`"
              class="nav-notification-btn"
              @click="toggleNotifications"
            />
          </div>

          <!-- User Menu -->
          <div v-if="showUserMenu" class="nav-user-menu">
            <v-menu offset-y>
              <template #activator="{ props: activatorProps }">
                <UnifiedButton
                  v-bind="activatorProps"
                  variant="ghost"
                  size="sm"
                  class="nav-user-btn"
                  :aria-label="userMenuLabel"
                >
                  <v-avatar size="28" class="me-2">
                    <v-img
                      v-if="userAvatar"
                      :src="userAvatar"
                      :alt="userName"
                    />
                    <AppIcon v-else name="mdi-account" />
                  </v-avatar>
                  <span class="user-name">{{ userName }}</span>
                  <AppIcon name="mdi-chevron-down" size="16" class="ms-1" />
                </UnifiedButton>
              </template>

              <v-list density="compact" min-width="200">
                <v-list-item
                  v-for="item in userMenuItems"
                  :key="item.id"
                  :to="item.to"
                  :href="item.href"
                  @click="item.onClick ? item.onClick() : undefined"
                >
                  <template #prepend>
                    <AppIcon :name="item.icon" />
                  </template>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                  <template v-if="item.badge" #append>
                    <UiChip classes="chip chip-primary chip-compact">
                      {{ item.badge }}
                    </UiChip>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- Theme Toggle -->
          <div v-if="showThemeToggle" class="nav-theme-toggle">
            <UnifiedButton
              icon-only
              :icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
              variant="ghost"
              size="sm"
              :aria-label="
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              "
              @click="toggleTheme"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Navigation (Tabs/Filters) -->
    <div
      v-if="showSecondaryNav && secondaryNavItems.length > 0"
      class="nav-secondary"
    >
      <div class="nav-container">
        <v-tabs
          v-model="activeSecondaryTab"
          color="primary"
          align-tabs="start"
          class="nav-tabs"
        >
          <v-tab
            v-for="item in secondaryNavItems"
            :key="item.id"
            :value="item.id"
            :to="item.to"
            class="nav-secondary-tab"
          >
            <AppIcon
              v-if="item.icon"
              :name="item.icon"
              size="16"
              class="me-2"
            />
            {{ item.text }}
            <UiChip
              v-if="item.count !== undefined"
              classes="chip chip-info chip-compact ms-2"
            >
              {{ item.count }}
            </UiChip>
          </v-tab>
        </v-tabs>
      </div>
    </div>

    <!-- Progress Indicator for Page Loading -->
    <v-progress-linear
      v-if="showProgress"
      :model-value="progressValue"
      color="primary"
      height="2"
      class="nav-progress"
    />
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import Tooltip from '@/components/Tooltip.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Props
const _props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: v =>
      ['default', 'gaming', 'minimal', 'professional'].includes(v),
  },
  sticky: { type: Boolean, default: true },
  transparent: { type: Boolean, default: false },
  showBreadcrumbs: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true },
  showNotifications: { type: Boolean, default: true },
  showUserMenu: { type: Boolean, default: true },
  // Hide page-level theme toggle by default per new guidelines
  showThemeToggle: { type: Boolean, default: false },
  showSecondaryNav: { type: Boolean, default: false },
  showProgress: { type: Boolean, default: false },

  // Brand/Logo
  brandIcon: { type: String, default: 'mdi-gamepad-variant' },
  brandText: { type: String, default: 'NAVI' },
  brandSubtitle: { type: String, default: 'Career Assistant' },
  brandLogo: { type: String, default: '' },
  glassHeader: { type: Boolean, default: false },
  brandLabel: { type: String, default: 'Go to homepage' },

  // User data
  userName: { type: String, default: 'User' },
  userAvatar: { type: String, default: '' },

  // Configuration
  ariaLabel: { type: String, default: 'Main navigation' },
  userMenuLabel: { type: String, default: 'User menu' },
  notificationCount: { type: Number, default: 0 },
  progressValue: { type: Number, default: 0 },
})

// Emits
const emit = defineEmits([
  'search',
  'searchInput',
  'toggleNotifications',
  'toggleTheme',
  'userMenuClick',
  'toggleDensity',
  'collapse',
])

// Composables
const router = useRouter()
const route = useRoute()
const { isDark, toggleTheme } = useUnifiedTheme()

// Reactive data
const searchQuery = ref('')
const searchLoading = ref(false)
const showSuggestions = ref(false)
const activeSecondaryTab = ref('')

// Computed
const isDarkMode = computed(() => isDark.value)
const _themeDisplayName = computed(() => (isDarkMode.value ? 'Dark' : 'Light'))

// Glass header quick filter
const quickFilter = ref('')
const onQuickFilterInput = () => emit('searchInput', quickFilter.value)

// AI Status + Model (sourced from store)
import { useAppStore } from '@/stores/app'
const store = useAppStore?.()
const aiOnline = computed(
  () => !!(store?.settings?.geminiApiKey && store?.aiStatus?.initialized)
)
const aiStatusText = computed(() =>
  aiOnline.value ? 'AI Ready' : 'AI Offline'
)
const modelDisplay = computed(
  () =>
    store?.selectedModelInfo?.displayName ||
    store?.settings?.selectedModel ||
    ''
)
const modelCapabilityBadges = computed(() => {
  const caps = store?.selectedModelInfo?.capabilities || {}
  const out = []
  if (caps.multiTurn) out.push('Multi‑turn')
  if (caps.imageInput) out.push('Vision')
  if (caps.videoInput) out.push('Video')
  if (caps.audioInput || caps.audioOutput)
    out.push(
      caps.audioInput && caps.audioOutput
        ? 'Audio I/O'
        : caps.audioInput
          ? 'Audio In'
          : 'Audio Out'
    )
  if (caps.realtimeChat) out.push('Real‑time')
  if (caps.liveChat) out.push('Live')
  if (caps.codeGeneration) out.push('Code')
  if (caps.jsonMode) out.push('JSON')
  if (caps.functionCalling) out.push('Functions')
  if (caps.streaming) out.push('Streaming')
  if (caps.multimodal) out.push('Multimodal')
  return out
})

function navigateToAISettings() {
  try {
    if (router && typeof router.push === 'function') {
      router.push('/settings#ai-section')
    }
  } catch {}
}

// Sample data (would come from props or stores in real app)
const breadcrumbs = computed(() => {
  const crumbs = []
  const pathSegments = route.path.split('/').filter(Boolean)

  // Generate breadcrumbs from route
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += '/' + segment

    // Map route segments to readable names
    const segmentNames = {
      resume: 'Resume Builder',
      jobs: 'The Board',
      portfolio: 'Portfolio',
      skills: 'Skill Mapper',
      settings: 'Settings',
      'gaming-jobs': 'Gaming Gigs',
    }

    const segmentIcons = {
      resume: 'mdi-file-document-outline-edit',
      jobs: 'mdi-briefcase-search',
      portfolio: 'mdi-briefcase-variant',
      skills: 'mdi-map',
      settings: 'mdi-cog',
      'gaming-jobs': 'mdi-gamepad-variant',
    }

    crumbs.push({
      text:
        segmentNames[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1),
      to: index === pathSegments.length - 1 ? null : currentPath,
      icon: segmentIcons[segment],
    })
  })

  return crumbs
})

const quickActions = ref([
  {
    id: 'create',
    icon: 'mdi-plus',
    label: 'Create New',
    color: 'primary',
    onClick: () => router.push('/resume'),
  },
  {
    id: 'help',
    icon: 'mdi-help-circle',
    label: 'Help',
    color: 'default',
  },
])

const userMenuItems = ref([
  { id: 'profile', icon: 'mdi-account', text: 'Profile', to: '/settings' },
  { id: 'preferences', icon: 'mdi-cog', text: 'Preferences', to: '/settings' },
  { id: 'billing', icon: 'mdi-credit-card', text: 'Billing', badge: 'Pro' },
  { id: 'divider', divider: true },
  { id: 'logout', icon: 'mdi-logout', text: 'Sign Out', onClick: handleLogout },
])

const secondaryNavItems = ref([
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/',
    count: 5,
  },
  {
    id: 'active',
    text: 'Active Projects',
    icon: 'mdi-briefcase',
    to: '/projects',
  },
  { id: 'archived', text: 'Archived', icon: 'mdi-archive', to: '/archived' },
])

const searchSuggestions = ref([])

// Methods
const handleSearch = () => {
  emit('search', searchQuery.value)
  showSuggestions.value = false
}

const handleSearchInput = event => {
  emit('searchInput', event.target.value)

  // Mock search suggestions
  if (event.target.value.length > 1) {
    searchSuggestions.value = [
      {
        text: 'Resume Templates',
        icon: 'mdi-file-document-outline',
        category: 'Templates',
      },
      {
        text: 'Job Search',
        icon: 'mdi-briefcase-search',
        category: 'Features',
      },
      { text: 'Gaming Jobs', icon: 'mdi-gamepad-variant', category: 'Jobs' },
    ].filter(item =>
      item.text.toLowerCase().includes(event.target.value.toLowerCase())
    )
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

const selectSuggestion = suggestion => {
  searchQuery.value = suggestion.text
  showSuggestions.value = false
  handleSearch()
}

const toggleNotifications = () => {
  emit('toggleNotifications')
}

const handleLogout = () => {
  // Handle logout logic
  console.log('Logging out...')
}

// Watch for route changes to update secondary nav
watch(
  () => route.name,
  newRouteName => {
    if (newRouteName) {
      activeSecondaryTab.value = newRouteName.toLowerCase()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.enhanced-navigation {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--surface-base);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  transition: all var(--duration-normal) var(--easing-ease);
}

.nav-sticky {
  position: sticky;
  top: 0;
}

.nav-transparent {
  background: rgba(var(--surface-base-rgb), 0.85);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

/* Primary Navigation */
.nav-primary {
  height: 64px;
  display: flex;
  align-items: center;
}

.nav-primary .nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Stacked layout when brand has glass-header modifier */
.nav-primary.glass-layout {
  height: auto;
  padding-top: var(--spacing-2);
  padding-bottom: var(--spacing-2);
}
.nav-primary .nav-container.has-glass-header {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: 'brand' 'buttons' 'search';
  row-gap: var(--spacing-2);
  justify-items: center; /* center each row */
}
.nav-primary .nav-container.has-glass-header .nav-left {
  grid-area: brand;
}
.nav-primary .nav-container.has-glass-header .nav-right {
  grid-area: buttons;
  justify-self: center;
}
.nav-primary .nav-container.has-glass-header .nav-center {
  grid-area: search;
  max-width: 100%;
  margin: 0;
}

.nav-brand.glass-header .brand-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-1);
}

/* Navigation Sections */
.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.nav-center {
  flex: 1;
  max-width: 480px;
  margin: 0 var(--spacing-8);
}

.nav-search-layout {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.nav-filters-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

/* Brand */
.nav-brand {
  text-decoration: none;
  color: inherit;
  transition: all var(--duration-fast) var(--easing-ease);
}

.nav-brand:hover {
  transform: scale(1.02);
}

.brand-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-family: var(--font-gaming);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--primary-color);
}

/* Glass header styles (three-row layout) */
.nav-brand.glass-header {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  width: 100%;
  max-width: 720px; /* center block */
  margin: 0 auto;
}

.nav-brand.glass-header .brand-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.nav-brand.glass-header .brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  text-decoration: none;
  color: inherit;
}

.nav-brand.glass-header .brand-logo {
  height: 32px;
  width: auto;
}

.nav-brand.glass-header .brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-brand.glass-header .brand-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.nav-brand.glass-header .brand-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Model chip inline with brand */
.model-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  padding: 2px 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 0.75rem;
}
.model-chip .chip-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.model-chip .model-gear {
  opacity: 0.7;
  font-size: 14px;
}
.model-chip[role='button'] {
  cursor: pointer;
}
.model-chip[role='button']:hover .model-gear {
  opacity: 1;
}

.brand-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
}
.brand-status.status-disconnected {
  background: color-mix(in srgb, var(--color-error-500) 10%, transparent);
}
.brand-status.status-connected {
  background: color-mix(in srgb, var(--color-success-500) 10%, transparent);
}
.brand-status .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-error-500);
}
.brand-status.status-connected .status-dot {
  background: var(--color-success-500);
}
.brand-status .status-text {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-primary);
}

.nav-control-buttons {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  justify-content: center;
}
.modern-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  font-size: 20px;
  color: var(--text-secondary);
  min-width: 36px;
  height: 36px;
  overflow: hidden;
}
.modern-button:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
.modern-button:active {
  transform: scale(0.96);
}
.theme-mode-badge {
  padding: 4px 10px;
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-600);
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-left: auto;
}

.quick-filter-dock {
  width: 100%;
}
.quick-filter-field {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 8px 12px;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
  max-width: 720px;
  margin: 0 auto;
}
.quick-filter-field:focus-within {
  background: color-mix(
    in srgb,
    var(--surface-muted) 110%,
    var(--surface-base)
  );
  box-shadow: 0 0 0 2px
    color-mix(in srgb, var(--color-cyber-500) 20%, transparent);
}
.quick-filter-field input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}
.quick-filter-field input::placeholder {
  color: var(--text-muted);
}
.mui-icon {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}
.ripple-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

/* Breadcrumbs */
.nav-breadcrumbs {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-3);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
}

.breadcrumb-link:hover {
  background: var(--surface-hover);
  color: var(--primary-color);
}

.breadcrumb-current-text {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.breadcrumb-separator {
  color: var(--text-muted);
  opacity: 0.5;
}

/* Search */
.nav-search-wrapper {
  position: relative;
  width: 100%;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.search-suggestion {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing-ease);
}

.search-suggestion:hover {
  background: var(--surface-hover);
}

.suggestion-text {
  flex: 1;
}

.suggestion-category {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--surface-muted);
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-full);
}

/* Action Buttons */
.nav-action-btn,
.nav-notification-btn,
.nav-user-btn {
  transition: all var(--duration-fast) var(--easing-ease);
}

.nav-action-btn:hover,
.nav-notification-btn:hover {
  background: var(--surface-hover);
  transform: scale(1.05);
}

/* User Menu */
.nav-user-btn {
  text-transform: none;
  font-weight: var(--font-weight-regular);
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Secondary Navigation */
.nav-secondary {
  border-top: 1px solid var(--border-color);
  background: var(--surface-base);
}

.nav-secondary-tab {
  text-transform: none;
  font-weight: var(--font-weight-medium);
}

/* Progress Bar */
.nav-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

/* Variants */
.nav-variant-gaming {
  background: linear-gradient(
    135deg,
    var(--gaming-bg-primary),
    var(--gaming-bg-secondary)
  );
  border-bottom-color: var(--gaming-accent);
}

.nav-variant-gaming .brand-content {
  color: var(--gaming-accent);
  text-shadow: 0 0 8px rgba(var(--gaming-accent-rgb), 0.3);
}

.nav-variant-minimal {
  background: transparent;
  border-bottom: none;
}

.nav-variant-professional {
  background: var(--surface-paper);
  box-shadow: var(--shadow-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-center {
    max-width: 100%;
    margin: 0;
  }
  .nav-search-layout {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
  .nav-filters-wrapper {
    justify-content: flex-start;
  }

  .nav-breadcrumbs {
    display: none;
  }

  .user-name {
    display: none;
  }

  .nav-quick-actions {
    gap: var(--spacing-1);
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 var(--spacing-2);
  }

  .brand-text {
    display: none;
  }

  .nav-quick-actions {
    display: none;
  }
}
</style>
