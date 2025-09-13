<template>
  <header class="unified-dashboard-header" :class="headerClasses">
    <!-- Top Navigation Bar -->
    <nav class="header-nav" role="navigation">
      <div class="nav-container">
        <!-- Left: Brand & Navigation -->
        <div class="nav-left">
          <router-link to="/" class="brand-link" aria-label="Go to Dashboard">
            <div class="brand-content">
              <AppIcon
                name="mdi-gamepad-variant"
                size="24"
                class="brand-icon"
              />
              <span class="brand-text">NAVI</span>
              <span class="brand-subtitle">Career Assistant</span>
            </div>
          </router-link>

          <!-- AI Model Status -->
          <div
            v-if="aiModelInfo"
            class="ai-model-chip"
            :class="{ 'ai-offline': !aiReady }"
          >
            <AppIcon
              :name="aiReady ? 'mdi-chip' : 'mdi-alert-circle-outline'"
              size="16"
            />
            <span class="model-text">{{ aiModelInfo }}</span>
          </div>
        </div>

        <!-- Center: Page Context -->
        <div class="nav-center">
          <!-- Breadcrumbs -->
          <div v-if="breadcrumbs.length > 0" class="breadcrumbs">
            <nav aria-label="Breadcrumb">
              <ol class="breadcrumb-list">
                <li
                  v-for="(crumb, index) in breadcrumbs"
                  :key="index"
                  class="breadcrumb-item"
                >
                  <router-link
                    v-if="crumb.to && index < breadcrumbs.length - 1"
                    :to="crumb.to"
                    class="breadcrumb-link"
                  >
                    {{ crumb.label }}
                  </router-link>
                  <span v-else class="breadcrumb-current">{{
                    crumb.label
                  }}</span>
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
        </div>

        <!-- Right: Global Actions -->
        <div class="nav-right">
          <!-- Search -->
          <div
            class="search-container"
            :class="{ 'search-active': searchActive }"
          >
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search jobs, studios, skills..."
              class="search-input"
              :class="{ 'search-expanded': searchActive }"
              @focus="searchActive = true"
              @blur="searchActive = false"
              @input="handleSearch"
            />
            <AppIcon name="mdi-magnify" size="20" class="search-icon" />
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <!-- Voice Commands -->
            <UnifiedButton
              variant="ghost"
              icon-only
              icon="mdi-microphone"
              tooltip="Voice Commands (Ctrl+M)"
              @click="toggleVoiceCommands"
            />

            <!-- AI Assistant -->
            <UnifiedButton
              variant="ghost"
              icon-only
              icon="mdi-robot"
              tooltip="AI Assistant (Ctrl+J)"
              :disabled="!aiReady"
              @click="openAIAssistant"
            />

            <!-- Notifications -->
            <UnifiedButton
              variant="ghost"
              icon-only
              icon="mdi-bell"
              tooltip="Notifications"
              :badge="
                notificationCount > 0 ? notificationCount.toString() : undefined
              "
              @click="toggleNotifications"
            />
          </div>

          <!-- User Menu -->
          <div ref="userMenuRef" class="user-menu">
            <button
              class="user-button"
              :class="{ 'user-menu-active': userMenuOpen }"
              :aria-expanded="userMenuOpen"
              aria-haspopup="true"
              @click="toggleUserMenu"
            >
              <div class="user-avatar">
                <AppIcon name="mdi-account-circle" size="32" />
              </div>
              <div class="user-info">
                <span class="user-name">{{ userName }}</span>
                <span class="user-level">Level {{ userLevel }}</span>
              </div>
              <AppIcon
                name="mdi-chevron-down"
                size="16"
                class="dropdown-icon"
              />
            </button>

            <!-- User Dropdown -->
            <div v-if="userMenuOpen" class="user-dropdown glass-surface">
              <div class="user-dropdown-header">
                <div class="user-avatar large">
                  <AppIcon name="mdi-account-circle" size="48" />
                </div>
                <div class="user-details">
                  <div class="user-name">{{ userName }}</div>
                  <div class="user-email">{{ userEmail }}</div>
                  <div class="user-stats">
                    Level {{ userLevel }} • {{ currentXP }} XP
                  </div>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <nav class="user-menu-nav">
                <router-link
                  to="/profile"
                  class="menu-item"
                  @click="userMenuOpen = false"
                >
                  <AppIcon name="mdi-account" />
                  <span>Profile</span>
                </router-link>
                <router-link
                  to="/settings"
                  class="menu-item"
                  @click="userMenuOpen = false"
                >
                  <AppIcon name="mdi-cog" />
                  <span>Settings</span>
                </router-link>
                <button class="menu-item" @click="toggleTheme">
                  <AppIcon
                    :name="
                      isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'
                    "
                  />
                  <span>{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
                </button>

                <div class="dropdown-divider"></div>

                <button class="menu-item danger" @click="logout">
                  <AppIcon name="mdi-logout" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Header (if provided) -->
    <div v-if="pageTitle || $slots.pageHeader" class="page-header-section">
      <slot name="pageHeader">
        <div class="page-header-content">
          <div class="page-title-area">
            <div v-if="pageIcon" class="page-icon">
              <AppIcon :name="pageIcon" size="32" />
            </div>
            <div class="page-text">
              <h1 v-if="pageTitle" class="page-title">{{ pageTitle }}</h1>
              <p v-if="pageSubtitle" class="page-subtitle">
                {{ pageSubtitle }}
              </p>
            </div>
          </div>

          <!-- Page Actions -->
          <div v-if="$slots.pageActions" class="page-actions">
            <slot name="pageActions" />
          </div>
        </div>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

interface Breadcrumb {
  label: string;
  to?: string;
}

interface Props {
  variant?: "default" | "gaming" | "compact";
  pageTitle?: string;
  pageSubtitle?: string;
  pageIcon?: string;
  breadcrumbs?: Breadcrumb[];
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  pageTitle: undefined,
  pageSubtitle: undefined,
  pageIcon: undefined,
  breadcrumbs: () => [],
  showSearch: true,
  showNotifications: true,
  showUserMenu: true,
});

// Emits
const emit = defineEmits<{
  search: [query: string];
  voiceCommand: [];
  aiAssistant: [];
  notifications: [];
  logout: [];
}>();

// Composables
const _route = useRoute();
const _router = useRouter();
const store = useAppStore();
const { isDark, toggleTheme } = useUnifiedTheme();

// Reactive state
const searchQuery = ref("");
const searchActive = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement>();

// Computed properties
const headerClasses = computed(() => [
  `header-variant-${props.variant}`,
  { "search-active": searchActive.value },
]);

const aiReady = computed(() => store?.aiStatus?.initialized || false);
const aiModelInfo = computed(
  () =>
    store?.selectedModelInfo?.displayName ||
    store?.settings?.selectedModel ||
    "AI Offline",
);
const notificationCount = computed(() => store?.notifications?.unread || 0);
const userName = computed(() => store?.profile?.name || "User");
const userEmail = computed(() => store?.profile?.email || "");
const userLevel = computed(() => store?.gamification?.level || 1);
const currentXP = computed(() => store?.gamification?.currentXP || 0);

// Methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit("search", searchQuery.value);
  }
};

const toggleVoiceCommands = () => {
  emit("voiceCommand");
};

const openAIAssistant = () => {
  emit("aiAssistant");
};

const toggleNotifications = () => {
  emit("notifications");
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const logout = () => {
  userMenuOpen.value = false;
  emit("logout");
};

// Click outside handler for user menu
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as any)) {
    userMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.unified-dashboard-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(var(--color-background-rgb), 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(var(--color-border-rgb), 0.1);
}

.header-nav {
  padding: 0.75rem 1.5rem;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  color: rgb(var(--color-primary-rgb));
}

.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: rgb(var(--color-on-surface-rgb));
}

.brand-subtitle {
  font-size: 0.75rem;
  color: rgb(var(--color-on-surface-variant-rgb));
  opacity: 0.8;
}

.ai-model-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 12px;
  font-size: 0.75rem;
  color: rgb(var(--color-primary-rgb));
  transition: all 0.2s ease;
}

.ai-model-chip.ai-offline {
  background: rgba(var(--color-error-rgb), 0.1);
  border-color: rgba(var(--color-error-rgb), 0.2);
  color: rgb(var(--color-error-rgb));
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.breadcrumbs {
  max-width: 100%;
  overflow: hidden;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: rgb(var(--color-on-surface-variant-rgb));
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: rgb(var(--color-primary-rgb));
}

.breadcrumb-current {
  color: rgb(var(--color-on-surface-rgb));
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumb-separator {
  color: rgb(var(--color-on-surface-variant-rgb));
  opacity: 0.6;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 200px;
  height: 36px;
  padding: 0 2.5rem 0 1rem;
  background: rgba(var(--color-surface-variant-rgb), 0.5);
  border: 1px solid rgba(var(--color-outline-rgb), 0.2);
  border-radius: 18px;
  font-size: 0.875rem;
  color: rgb(var(--color-on-surface-rgb));
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(var(--color-surface-rgb), 0.9);
  border-color: rgb(var(--color-primary-rgb));
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.search-input.search-expanded {
  width: 300px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  color: rgb(var(--color-on-surface-variant-rgb));
  pointer-events: none;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-button:hover,
.user-button.user-menu-active {
  background: rgba(var(--color-on-surface-rgb), 0.05);
}

.user-avatar {
  color: rgb(var(--color-primary-rgb));
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
}

.user-level {
  font-size: 0.75rem;
  color: rgb(var(--color-on-surface-variant-rgb));
  line-height: 1.2;
}

.dropdown-icon {
  transition: transform 0.2s ease;
}

.user-menu-active .dropdown-icon {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 280px;
  padding: 1rem;
  background: rgba(var(--color-surface-rgb), 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--color-outline-rgb), 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar.large {
  color: rgb(var(--color-primary-rgb));
}

.user-details .user-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: rgb(var(--color-on-surface-variant-rgb));
  margin-bottom: 0.25rem;
}

.user-stats {
  font-size: 0.75rem;
  color: rgb(var(--color-primary-rgb));
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background: rgba(var(--color-outline-rgb), 0.1);
  margin: 0.75rem 0;
}

.user-menu-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: rgb(var(--color-on-surface-rgb));
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: rgba(var(--color-on-surface-rgb), 0.05);
}

.menu-item.danger {
  color: rgb(var(--color-error-rgb));
}

.menu-item.danger:hover {
  background: rgba(var(--color-error-rgb), 0.05);
}

.page-header-section {
  border-top: 1px solid rgba(var(--color-outline-rgb), 0.1);
  padding: 1.5rem;
  background: rgba(var(--color-surface-variant-rgb), 0.3);
}

.page-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-icon {
  color: rgb(var(--color-primary-rgb));
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: rgb(var(--color-on-surface-rgb));
}

.page-subtitle {
  font-size: 1rem;
  color: rgb(var(--color-on-surface-variant-rgb));
  margin: 0.25rem 0 0 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-variant-gaming {
  background: linear-gradient(
  );
}

.header-variant-gaming .brand-text {
  background: linear-gradient(
    rgb(var(--color-primary-rgb)),
    rgb(var(--color-secondary-rgb))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-variant-compact .header-nav {
}

.header-variant-compact .brand-content {
}

.header-variant-compact .brand-text {
}

.header-variant-compact .search-input {
}

  .nav-container {
  }

  .nav-center {
    display: none;
  }

  .search-input {
  }

  .search-input.search-expanded {
  }

  .user-info {
    display: none;
  }

  .page-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions {
    justify-content: flex-end;
  }
}

  .brand-subtitle {
    display: none;
  }

  .quick-actions {
  }

  .search-container {
    display: none;
  }
}
</style>
