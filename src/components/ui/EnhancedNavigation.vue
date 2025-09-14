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
                  >{{ cap }}</span>
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
                      >{{ cap }}</span>
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
                  >{{ suggestion.category }}</span>
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
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import Tooltip from "@/components/Tooltip.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import UiChip from "@/components/ui/UiChip.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Props
const _props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      ["default", "gaming", "minimal", "professional"].includes(v),
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
  brandIcon: { type: String, default: "mdi-gamepad-variant",
    default: ''
   },
  brandText: { type: String, default: "NAVI" },
  brandSubtitle: { type: String, default: "Career Assistant",
    default: '',
    default: ''
  
   },
  brandLogo: { type: String, default: "" },
  glassHeader: { type: Boolean, default: false },
  brandLabel: { type: String, default: "Go to homepage" },

  // User data
  userName: { type: String, default: "User" },
  userAvatar: { type: String, default: "",
    default: ''
   },

  // Configuration
  ariaLabel: { type: String, default: "Main navigation" },
  userMenuLabel: { type: String, default: "User menu" },
  notificationCount: { type: Number, default: 0 },
  progressValue: { type: Number, default: 0 },
});

// Emits
const _emit = defineEmits([
  "search",
  "searchInput",
  "toggleNotifications",
  "toggleTheme",
  "userMenuClick",
  "toggleDensity",
  "collapse",
]);

// Composables
const _router = useRouter();
const route = useRoute();
const { isDark, toggleTheme } = useUnifiedTheme();

// Reactive data
const searchQuery = ref("");
const searchLoading = ref(false);
const showSuggestions = ref(false);
const activeSecondaryTab = ref("");

// Computed
const isDarkMode = computed(() => isDark.value);
const _themeDisplayName = computed(() => (isDarkMode.value ? "Dark" : "Light"));

// Glass header quick filter
const quickFilter = ref("");
const onQuickFilterInput = () => emit("searchInput", quickFilter.value);

// AI Status + Model (sourced from store)
import { useAppStore } from "@/stores/app";
const store = useAppStore?.();
const aiOnline = computed(
  () => !!(store?.settings?.geminiApiKey && store?.aiStatus?.initialized),
);
const aiStatusText = computed(() =>
  aiOnline.value ? "AI Ready" : "AI Offline",
);
const modelDisplay = computed(
  () =>
    store?.selectedModelInfo?.displayName ||
    store?.settings?.selectedModel ||
    "",
);
const modelCapabilityBadges = computed(() => {
  const caps = store?.selectedModelInfo?.capabilities || {};
  const out = [];
  if (caps.multiTurn) out.push("Multi‑turn");
  if (caps.imageInput) out.push("Vision");
  if (caps.videoInput) out.push("Video");
  if (caps.audioInput || caps.audioOutput)
    out.push(
      caps.audioInput && caps.audioOutput
        ? "Audio I/O"
        : caps.audioInput
          ? "Audio In"
          : "Audio Out",
    );
  if (caps.realtimeChat) out.push("Real‑time");
  if (caps.liveChat) out.push("Live");
  if (caps.codeGeneration) out.push("Code");
  if (caps.jsonMode) out.push("JSON");
  if (caps.functionCalling) out.push("Functions");
  if (caps.streaming) out.push("Streaming");
  if (caps.multimodal) out.push("Multimodal");
  return out;
});

function navigateToAISettings() {
  try {
    if (router && typeof router.push === "function") {
      router.push("/settings#ai-section");
    }
  } catch {}
}

// Sample data (would come from props or stores in real app)
const breadcrumbs = computed(() => {
  const crumbs = [];
  const pathSegments = route.path.split("/").filter(Boolean);

  // Generate breadcrumbs from route
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += "/" + segment;

    // Map route segments to readable names
    const segmentNames = {
      resume: "Resume Builder",
      jobs: "The Board",
      portfolio: "Portfolio",
      skills: "Skill Mapper",
      settings: "Settings",
      "gaming-jobs": "Gaming Gigs",
    };

    const segmentIcons = {
      resume: "mdi-file-document-outline-edit",
      jobs: "mdi-briefcase-search",
      portfolio: "mdi-briefcase-variant",
      skills: "mdi-map",
      settings: "mdi-cog",
      "gaming-jobs": "mdi-gamepad-variant",
    };

    crumbs.push({
      text:
        segmentNames[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1),
      to: index === pathSegments.length - 1 ? null : currentPath,
      icon: segmentIcons[segment],
    });
  });

  return crumbs;
});

const quickActions = ref([
  {
    id: "create",
    icon: "mdi-plus",
    label: "Create New",
    color: "primary",
    onClick: () => router.push("/resume"),
  },
  {
    id: "help",
    icon: "mdi-help-circle",
    label: "Help",
    color: "default",
  },
]);

const userMenuItems = ref([
  { id: "profile", icon: "mdi-account", text: "Profile", to: "/settings" },
  { id: "preferences", icon: "mdi-cog", text: "Preferences", to: "/settings" },
  { id: "billing", icon: "mdi-credit-card", text: "Billing", badge: "Pro" },
  { id: "divider", divider: true },
  { id: "logout", icon: "mdi-logout", text: "Sign Out", onClick: handleLogout },
]);

const secondaryNavItems = ref([
  {
    id: "dashboard",
    text: "Dashboard",
    icon: "mdi-view-dashboard",
    to: "/",
    count: 5,
  },
  {
    id: "active",
    text: "Active Projects",
    icon: "mdi-briefcase",
    to: "/projects",
  },
  { id: "archived", text: "Archived", icon: "mdi-archive", to: "/archived" },
]);

const searchSuggestions = ref([]);

// Methods
const handleSearch = () => {
  emit("search", searchQuery.value);
  showSuggestions.value = false;
};

const handleSearchInput = (event) => {
  emit("searchInput", event.target.value);

  // Mock search suggestions
  if (event.target.value.length > 1) {
    searchSuggestions.value = [
      {
        text: "Resume Templates",
        icon: "mdi-file-document-outline",
        category: "Templates",
      },
      {
        text: "Job Search",
        icon: "mdi-briefcase-search",
        category: "Features",
      },
      { text: "Gaming Jobs", icon: "mdi-gamepad-variant", category: "Jobs" },
    ].filter((item) =>
      item.text.toLowerCase().includes(event.target.value.toLowerCase()),
    );
    showSuggestions.value = true;
  } else {
    showSuggestions.value = false;
  }
};

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.text;
  showSuggestions.value = false;
  handleSearch();
};

const toggleNotifications = () => {
  emit("toggleNotifications");
};

const handleLogout = () => {
  // Handle logout logic
  console.log("Logging out...");
};

// Watch for route changes to update secondary nav
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName) {
      activeSecondaryTab.value = newRouteName.toLowerCase();
    }
  },
  { immediate: true },
);
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

.nav-primary {
  display: flex;
  align-items: center;
}

.nav-primary .nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-primary.glass-layout {
  height: auto;
}
.nav-primary .nav-container.has-glass-header {
  display: grid;
  grid-template-areas: "brand" "buttons" "search";
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
}

.nav-brand.glass-header .brand-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
}

.nav-center {
}

.nav-search-layout {
  display: flex;
  align-items: center;
}

.nav-filters-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.nav-brand {
  text-decoration: none;
  color: inherit;
  transition: all var(--duration-fast) var(--easing-ease);
}

.nav-brand:hover {
}

.brand-content {
  display: flex;
  align-items: center;
  font-family: var(--font-gaming);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--primary-color);
}

.nav-brand.glass-header {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
}

.nav-brand.glass-header .brand-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-brand.glass-header .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.nav-brand.glass-header .brand-logo {
  width: auto;
}

.nav-brand.glass-header .brand-text {
  display: flex;
  flex-direction: column;
}
.nav-brand.glass-header .brand-name {
  font-size: var(--font-size-lg);
}
.nav-brand.glass-header .brand-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.model-chip {
  display: inline-flex;
  align-items: center;
  background: var(--glass-bg);
  color: var(--text-secondary);
}
.model-chip .chip-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.model-chip .model-gear {
}
.model-chip[role="button"] {
  cursor: pointer;
}
.model-chip[role="button"]:hover .model-gear {
}

.brand-status {
  display: flex;
  align-items: center;
}
.brand-status.status-disconnected {
}
.brand-status.status-connected {
}
.brand-status .status-dot {
}
.brand-status.status-connected .status-dot {
}
.brand-status .status-text {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
}

.nav-control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
}
.modern-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  color: var(--text-secondary);
  overflow: hidden;
}
.modern-button:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
.modern-button:active {
}
.theme-mode-badge {
  font-size: var(--font-size-xs);
  margin-left: auto;
}

.quick-filter-dock {
}
.quick-filter-field {
  display: flex;
  align-items: center;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}
.quick-filter-field:focus-within {
  background: color-mix(
    in srgb,
    var(--surface-base)
  );
}
.quick-filter-field input {
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
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.nav-breadcrumbs {
  display: flex;
  align-items: center;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
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
}

.nav-search-wrapper {
  position: relative;
}

.search-suggestions {
  position: absolute;
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

.search-suggestion {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing-ease);
}

.search-suggestion:hover {
  background: var(--surface-hover);
}

.suggestion-text {
}

.suggestion-category {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--surface-muted);
  border-radius: var(--radius-full);
}

.nav-action-btn,
.nav-notification-btn,
.nav-user-btn {
  transition: all var(--duration-fast) var(--easing-ease);
}

.nav-action-btn:hover,
.nav-notification-btn:hover {
  background: var(--surface-hover);
}

.nav-user-btn {
  text-transform: none;
  font-weight: var(--font-weight-regular);
}

.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-secondary {
  background: var(--surface-base);
}

.nav-secondary-tab {
  text-transform: none;
  font-weight: var(--font-weight-medium);
}

.nav-progress {
  position: absolute;
}

.nav-variant-gaming {
  background: linear-gradient(
    var(--gaming-bg-primary),
    var(--gaming-bg-secondary)
  );
  border-bottom-color: var(--gaming-accent);
}

.nav-variant-gaming .brand-content {
  color: var(--gaming-accent);
}

.nav-variant-minimal {
  background: transparent;
  border-bottom: none;
}

.nav-variant-professional {
  background: var(--surface-paper);
  box-shadow: var(--shadow-sm);
}

  .nav-center {
  }
  .nav-search-layout {
    flex-direction: column;
    align-items: stretch;
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
  }
}

  .nav-container {
  }

  .brand-text {
    display: none;
  }

  .nav-quick-actions {
    display: none;
  }
}
</style>
