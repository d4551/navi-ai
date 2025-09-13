<template>
  <nav
    class="navigation-menu"
    :class="[
      {
        collapsed: isCollapsed,
        'ai-online': isAIOnline,
        'ai-offline': !isAIOnline,
      },
      densityClass,
    ]"
    aria-label="Sidebar navigation"
  >
    <!-- Enhanced Brand Section with better visual hierarchy -->
    <div class="nav-brand glass-header">
      <router-link to="/" class="brand-link" aria-label="Navigate to NAVI home">
        <!-- Brand logo switches automatically between light/dark -->
        <AppLogo class="brand-logo" alt-text="NAVI" />
        <transition name="brand-text-fade" mode="out-in">
          <div v-if="!isCollapsed" class="brand-text">
            <span class="brand-name">NAVI</span>
            <span class="brand-subtitle">{{
              connectionStatus === "connected"
                ? "AI Career Assistant"
                : "Career Assistant"
            }}</span>
            <div class="brand-status" :class="`status-${connectionStatus}`">
              <div class="status-dot"></div>
              <span class="status-text">{{ connectionText }}</span>
            </div>
            <!-- Hide duplicate AI model badge in brand area to reduce redundancy -->
            <Tooltip
              v-if="
                false &&
                  selectedModelDisplay &&
                  connectionStatus === 'connected'
              "
              text=""
              position="right"
              :dark="isDark"
            >
              <template #content>
                <div class="rich">
                  <span class="tooltip-title">{{ selectedModelDisplay }}</span>
                  <div class="badges">
                    <span
                      v-for="cap in modelCapabilityBadges"
                      :key="cap"
                      class="cap-badge"
                    >{{ cap }}</span>
                  </div>
                </div>
              </template>
              <div
                class="model-badge"
                :aria-label="`AI Model: ${selectedModelDisplay} — Configure AI`"
                role="button"
                tabindex="0"
                @click="navigateToAISettings"
                @keydown.enter.prevent="navigateToAISettings"
                @keydown.space.prevent="navigateToAISettings"
              >
                <AppIcon name="mdi-chip" size="inherit" />
                <span class="model-text">{{ selectedModelDisplay }}</span>
                <AppIcon
                  name="mdi-cog-outline"
                  size="inherit"
                  class="model-gear"
                  aria-hidden="true"
                />
              </div>
            </Tooltip>
          </div>
        </transition>
      </router-link>

      <div class="nav-controls" :class="{ collapsed: isCollapsed }">
        <!-- Navigation control buttons in a unified row -->
        <div class="nav-control-buttons">
          <!-- Search Toggle (opens overlay) -->
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon="mdi-magnify"
            :icon-only="true"
            :bare="true"
            :ripple="false"
            class="nav-control-btn search-toggle-btn"
            :aria-label="isCollapsed ? 'Search' : 'Toggle search'"
            title="Search (Ctrl+K)"
            @click="toggleSearch"
          />
          <!-- Density Toggle -->
          <UnifiedButton
            variant="ghost"
            size="sm"
            :icon="
              density === 'compact'
                ? 'mdi-format-line-weight'
                : 'mdi-format-line-spacing'
            "
            :icon-only="true"
            :bare="true"
            :ripple="false"
            class="nav-control-btn density-toggle-btn"
            :aria-label="`Toggle density (current: ${density})`"
            :title="`Density: ${density}`"
            @click="toggleDensity"
          />

          <!-- Theme Toggle (cycles light → dark → system) -->
          <UnifiedButton
            variant="ghost"
            size="sm"
            :icon="themeIcon"
            :icon-only="true"
            :bare="true"
            :ripple="false"
            class="nav-control-btn theme-toggle-btn"
            :aria-label="`Switch theme (current: ${themeDisplayName})`"
            :title="`Theme: ${themeDisplayName} (Ctrl+T)`"
            @click="cycleTheme"
          />

          <!-- Gamification (Achievements) -->
          <Tooltip :text="''" position="right" :dark="isDark">
            <template #content>
              <div class="rich">
                <span class="tooltip-title">Level {{ userLevel.level }} — {{ userLevel.title }}</span>
                <div class="badges">
                  <span class="cap-badge">{{ userLevel.currentXP }} XP</span>
                  <span class="cap-badge">{{ achievementsCount }} Achievements</span>
                </div>
              </div>
            </template>
            <UnifiedButton
              class="nav-control-btn trophy-toggle-btn"
              variant="ghost"
              size="sm"
              icon="mdi-trophy"
              :icon-only="true"
              :bare="true"
              :ripple="false"
              :badge="achievementsCount > 0 ? String(achievementsCount) : ''"
              aria-label="Open achievements"
              title="Achievements"
              @click="showGamifyModal = true"
            />
          </Tooltip>

          <!-- Collapse Toggle -->
          <UnifiedButton
            variant="ghost"
            size="sm"
            :icon="
              isCollapsed
                ? 'mdi-chevron-double-right'
                : 'mdi-chevron-double-left'
            "
            :icon-only="true"
            :bare="true"
            :ripple="false"
            class="nav-control-btn collapse-toggle"
            :aria-label="
              isCollapsed ? 'Expand navigation' : 'Collapse navigation'
            "
            :title="
              isCollapsed
                ? 'Expand sidebar (Ctrl+B)'
                : 'Collapse sidebar (Ctrl+B)'
            "
            @click="$emit('toggle-collapse')"
          />

          <!-- System mode badge (visible when expanded and following system) -->
        </div>
        <Tooltip
          v-if="!isCollapsed && isSystem"
          text="Following your OS preference"
          position="right"
          :dark="isDark"
        >
          <div class="theme-mode-badge" role="status" aria-live="polite">
            System
          </div>
        </Tooltip>
      </div>
    </div>

    <!-- Main Navigation (compact, no titled sections) -->
    <div
      class="nav-content"
      tabindex="0"
      role="navigation"
      aria-label="Main navigation menu"
      @keydown="handleNavKeydown"
    >
      <div class="nav-items nav-items-flat">
        <NavigationItem
          v-for="item in filteredMain"
          :key="item.id"
          :item="item"
          :is-collapsed="isCollapsed"
          @navigate="onItemNavigate"
        />
        <div class="nav-divider" role="separator" aria-hidden="true"></div>
        <NavigationItem
          v-for="item in filteredPlayground"
          :key="item.id"
          :item="item"
          :is-collapsed="isCollapsed"
          @navigate="onItemNavigate"
        />
        <div class="nav-divider" role="separator" aria-hidden="true"></div>
        <NavigationItem
          v-for="item in filteredSettings"
          :key="item.id"
          :item="item"
          :is-collapsed="isCollapsed"
          @navigate="onItemNavigate"
        />
      </div>
    </div>

    <!-- Redesigned Footer -->
    <div class="nav-footer glass-footer" :class="{ collapsed: isCollapsed }">
      <!-- Expanded footer: rich status + quick actions -->
      <div
        v-if="!isCollapsed"
        class="footer-content redesigned"
        aria-label="Navigation footer"
      >
        <div class="footer-row">
          <!-- Model + version -->
          <div class="footer-model" aria-label="AI model and version">
            <Tooltip text="" position="right" :dark="isDark">
              <template #content>
                <div class="rich">
                  <span class="tooltip-title">{{ selectedModelDisplay }}</span>
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
              <span
                class="d-inline-flex align-center gap-1 model-badge"
                role="button"
                tabindex="0"
                :aria-label="`AI Model: ${selectedModelDisplay} — Configure AI`"
                @click="navigateToAISettings"
                @keydown.enter.prevent="navigateToAISettings"
                @keydown.space.prevent="navigateToAISettings"
              >
                <AppIcon name="mdi-chip" size="inherit" />
                <span class="model-name" :title="selectedModelDisplay">{{
                  selectedModelDisplay
                }}</span>
                <AppIcon
                  name="mdi-cog-outline"
                  size="inherit"
                  class="model-gear"
                  aria-hidden="true"
                />
              </span>
            </Tooltip>
            <span class="version-chip" :title="`Version ${appVersion}`">v{{ appVersion }}</span>
          </div>
        </div>
        <div class="footer-row">
          <!-- Profile completeness -->
          <div
            class="footer-progress"
            role="progressbar"
            :aria-valuenow="profilePct"
            aria-valuemin="0"
            aria-valuemax="100"
            :title="`Profile ${profilePct}% complete`"
          >
            <div class="progress-track">
              <div
                class="progress-bar"
                :style="{ width: profilePct + '%' }"
              ></div>
            </div>
            <span class="progress-label">Profile {{ profilePct }}%</span>
          </div>
        </div>
      </div>

      <!-- Collapsed footer: minimal classes (no icon-pill/pill/glass-pill) -->
      <div
        class="footer-collapsed redesigned"
        aria-label="Navigation footer (collapsed)"
      >
        <!-- Version chip removed; page footer shows version -->
      </div>
    </div>
  </nav>

  <!-- Global Search Overlay -->
  <Teleport to="body">
    <div
      v-if="searchOverlayOpen"
      class="nav-search-overlay"
      @keydown.esc.prevent.stop="closeSearchOverlay"
      @click.self="closeSearchOverlay"
    >
      <div
        class="nav-search-dialog glass-card section-card"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        <div class="nav-search-input">
          <AppIcon name="mdi-magnify" size="inherit" />
          <input
            ref="overlaySearchRef"
            v-model.trim="quickFilter"
            type="text"
            placeholder="Search or filter navigation..."
            aria-label="Search navigation"
            @keydown.enter.prevent="closeSearchOverlay"
          />
          <button
            v-if="quickFilter"
            class="clear-btn"
            aria-label="Clear search"
            @click="quickFilter = ''"
          >
            <AppIcon name="mdi-close" />
          </button>
        </div>
        <div class="nav-search-hint">
          <span><kbd>Enter</kbd> to accept</span>
          <span>•</span>
          <span><kbd>Esc</kbd> to close</span>
        </div>

        <!-- Live Results -->
        <div class="nav-search-results">
          <button
            v-for="res in overlayResults"
            :key="res.id"
            class="nav-search-result"
            @click="navigateFromOverlay(res)"
          >
            <AppIcon
              :name="res.icon?.replace('mdi ', '') || 'mdi-menu-right'"
              size="inherit"
            />
            <div class="res-main">
              <div class="res-title">{{ res.title }}</div>
              <div class="res-desc">{{ res.description }}</div>
            </div>
          </button>
          <div v-if="overlayResults.length === 0" class="nav-search-empty">
            No matches
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  <Teleport to="body">
    <GamificationModal
      v-if="showGamifyModal"
      @close="showGamifyModal = false"
    />
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
// import { useEnhancedNavigation } from '@/composables/useEnhancedNavigation' // Temporarily removed
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import NavigationItem from "./NavigationItem.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import AppLogo from "@/components/AppLogo.vue";
import { getMdiAlias } from "@/utils/iconAliases";
import Tooltip from "@/components/Tooltip.vue";
import GamificationModal from "@/components/GamificationModal.vue";
import GamificationService from "@/utils/gamification";

// Props
defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

// Emits
// Include 'show-help' to allow parent listeners without Vue extraneous-event warnings
const emit = defineEmits(["toggle-collapse", "navigate", "show-help"]);

// Composables
const route = useRoute();
const router = useRouter();
const store = useAppStore();
const theme = useUnifiedTheme();

// Defensive computed wrappers so template never crashes if theme is unavailable
const themeIcon = computed(() => {
  try {
    const mode = theme?.colorScheme?.value || "system";
    // Use MDI icons for consistency
    return mode === "light"
      ? "mdi-weather-sunny"
      : mode === "dark"
        ? "mdi-weather-night"
        : "mdi-monitor";
  } catch {
    return "mdi-monitor";
  }
});
const themeDisplayName = computed(() => {
  try {
    return theme?.getThemeDisplayName?.() || "System";
  } catch {
    return "System";
  }
});
const isSystem = computed(() => {
  try {
    return Boolean(theme?.isSystem?.value);
  } catch {
    return false;
  }
});
const isDark = computed(() => {
  try {
    return Boolean(theme?.isDark?.value);
  } catch {
    return false;
  }
});
const cycleTheme = () => {
  try {
    theme?.cycleTheme?.();
  } catch {}
};

// Gamification state
const showGamifyModal = ref(false);
const g = new GamificationService(store);
const achievementsCount = computed(() => {
  try {
    return Array.isArray(store.user?.achievements)
      ? store.user.achievements.length
      : 0;
  } catch {
    return 0;
  }
});
const userLevel = computed(() => {
  try {
    return g.getLevelInfo(store.user?.xp || 0);
  } catch {
    return { level: 1, title: "Rookie", currentXP: 0, xpForNext: 0 };
  }
});

// Simple keyboard navigation handler
const handleNavKeydown = (event) => {
  // Basic keyboard navigation support
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    // Handle focus navigation
  }
};

// Search state
const searchOverlayOpen = ref(false);
const overlaySearchRef = ref(null);

// (accordion removed)

// Toggle search visibility
const toggleSearch = () => {
  searchOverlayOpen.value = true;
  // Autofocus after mount
  setTimeout(() => {
    try {
      overlaySearchRef.value?.focus?.();
    } catch {}
  }, 0);
};

const closeSearchOverlay = () => {
  searchOverlayOpen.value = false;
};

// (no accordion toggles)

// App version from package.json or store
const appVersion = computed(() => store.meta?.version || "2.0.0");

// Enhanced connection status based on actual app state
const connectionStatus = computed(() => {
  if (!store.isOnline) return "disconnected";
  if (store.settings?.geminiApiKey && store.aiStatus?.initialized)
    return "connected";
  if (store.loading?.ai) return "pending";
  return "disconnected";
});

const connectionText = computed(() => {
  switch (connectionStatus.value) {
    case "connected":
      return "Connected";
    case "disconnected":
      return "Offline";
    case "pending":
      return "Connecting...";
    default:
      return "Unknown";
  }
});

// AI connection flag for styling (animations/highlights)
const isAIOnline = computed(() => connectionStatus.value === "connected");

// Footer enhancements
const selectedModel = computed(
  () => store.settings?.selectedModel || "gemini-2.5-flash",
);
const selectedModelInfo = computed(() => store.selectedModelInfo);
const selectedModelDisplay = computed(
  () => selectedModelInfo.value?.displayName || selectedModel.value,
);

const modelCapabilityBadges = computed(() => {
  const caps = selectedModelInfo.value?.capabilities || {};
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
const profilePct = computed(() => {
  const v = Number(store.profileCompleteness ?? 0);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
});

// Helper methods

// Keyboard shortcuts
const handleKeydown = (event) => {
  // Handle Ctrl+B for toggle collapse
  if (event.ctrlKey && event.key === "b") {
    event.preventDefault();
    emit("toggle-collapse");
  }
  // Handle Ctrl+K for search toggle
  if (event.ctrlKey && event.key === "k") {
    event.preventDefault();
    toggleSearch();
  }
  // Handle Ctrl+T for theme toggle
  if (event.ctrlKey && event.key === "t") {
    event.preventDefault();
    cycleTheme();
  }
  // Delegate other navigation keys
  handleNavKeydown(event);
};

// Setup keyboard listeners
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

// Enhanced navigation items with better organization
// Helper to alias any potentially invalid icon names
const icon = (n) => getMdiAlias(n) || n;

// Main navigation items (consolidating all essential features)
const mainItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    route: "/dashboard",
    icon: icon("mdi-view-dashboard-outline"),
    description: "Your career progress overview",
    isActive: computed(() => route.path === "/" || route.path === "/dashboard"),
  },
  {
    id: "jobs",
    title: "Gaming Jobs",
    route: "/jobs",
    icon: icon("mdi-briefcase-search-outline"),
    description: "Video game industry roles and studios",
    badge: "Live",
    isActive: computed(() => route.path === "/jobs"),
  },
  {
    id: "resume",
    title: "Documents",
    route: "/documents",
    icon: icon("mdi-file-document-multiple-outline"),
    description: "Resume + Cover Letter builder",
    badge: "Docs",
    isActive: computed(
      () => route.path === "/resume" || route.path === "/documents",
    ),
  },
  {
    id: "portfolio",
    title: "Portfolio",
    route: "/portfolio",
    icon: icon("mdi-briefcase-variant-outline"),
    description: "Projects, clips, and achievements",
    isActive: computed(() => route.path.startsWith("/portfolio")),
  },
  {
    id: "studios",
    title: "Studios",
    route: "/studios",
    icon: icon("mdi-account-search"),
    description: "Research culture, games, roles, intel",
    isActive: computed(() => route.path.startsWith("/studios")),
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    route: "/interview-prep",
    icon: icon("mdi-microphone-variant"),
    description: "Practice interviews with AI",
    badge: "AI",
    requiresAI: true,
    isActive: computed(() => route.path.startsWith("/interview")),
  },
  {
    id: "skill-mapper",
    title: "Skill Mapper",
    route: "/skills",
    icon: icon("mdi-map-marker-path"),
    description: "Map your skills to roles",
    badge: "AI",
    requiresAI: true,
    isActive: computed(() => route.path.startsWith("/skills")),
  },
  {
    id: "ai-media",
    title: "AI Media Studio",
    route: "/demo/ai-media",
    icon: icon("mdi-multimedia"),
    description: "Live + file AI analysis",
    badge: "Beta",
    requiresAI: true,
    isActive: computed(() => route.path === "/demo/ai-media"),
  },
];

// Settings items
const settingsItems = [
  {
    id: "settings",
    title: "Settings",
    route: "/settings",
    icon: "mdi-cog",
    description: "Preferences, API keys, and configuration",
    isActive: computed(() => route.path === "/settings"),
  },
];

const playgroundItems = [
  {
    id: "cloud",
    title: "The Cloud",
    route: "/cloud",
    icon: icon("mdi-cloud"),
    description: "Cloud services and storage",
    isActive: computed(() => route.path === "/cloud"),
  },
  {
    id: "system",
    title: "System",
    route: "/system",
    icon: icon("mdi-monitor-dashboard"),
    description: "Performance and diagnostics",
    isActive: computed(() => route.path === "/system"),
  },
  {
    id: "flow",
    title: "The Flow",
    route: "/flow",
    icon: icon("mdi-vector-polyline"),
    description: "Career workflow automation",
    isActive: computed(() => route.path === "/flow"),
  },
  {
    id: "realtime-chat",
    title: "AI Assistant",
    route: "/demo/realtime",
    // Ensure compatibility with current mdi set
    icon: icon("mdi-robot"),
    description: "Real-time AI conversation",
    badge: "Live",
    requiresAI: true,
    isActive: computed(() => route.path === "/demo/realtime"),
  },
];

// (badge counts removed)

// Density state with persistence
const density = ref(localStorage.getItem("nav-density") || "compact");
const densityClass = computed(() => `density-${density.value}`);
function toggleDensity() {
  density.value = density.value === "compact" ? "comfortable" : "compact";
  try {
    localStorage.setItem("nav-density", density.value);
  } catch {}
}

// Quick filter
const quickFilter = ref("");
const filterItems = (items) => {
  const q = (quickFilter.value || "").toLowerCase().trim();
  if (!q) return items;
  return items.filter(
    (it) =>
      (it.title || "").toLowerCase().includes(q) ||
      (it.description || "").toLowerCase().includes(q),
  );
};
const filteredMain = computed(() => filterItems(mainItems));
const filteredSettings = computed(() => filterItems(settingsItems));
const filteredPlayground = computed(() => filterItems(playgroundItems));

function onItemNavigate(item) {
  // Re-emit for parent listeners
  emit("navigate", item);
}

// Overlay results (merge all)
const allItems = computed(() => [
  ...mainItems,
  ...settingsItems,
  ...playgroundItems,
]);
const overlayResults = computed(() => {
  const q = (quickFilter.value || "").toLowerCase().trim();
  if (!q) return allItems.value.slice(0, 8);
  return allItems.value
    .filter(
      (it) =>
        (it.title || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q),
    )
    .slice(0, 8);
});

function navigateFromOverlay(res) {
  try {
    router.push(res.route);
  } catch {}
  closeSearchOverlay();
}

function navigateToAISettings() {
  try {
    router.push("/settings#ai-section");
  } catch {}
}
</script>

<style scoped>
.navigation-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: var(--page-sidebar-width);
  min-width: var(--page-sidebar-width);
  max-width: var(--page-sidebar-width);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  font-family: var(--font-primary);
  transition: all var(--duration-normal) var(--easing-ease-out);
  border-top-right-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  overflow: hidden;
}

.navigation-menu.collapsed {
}

.trophy-toggle-btn {
  position: relative;
}

.density-comfortable .navigation-menu .nav-item-link {
  padding: var(--spacing-lg) var(--spacing-md);
  overflow-x: hidden;
}

.density-comfortable .navigation-menu .nav-brand {
  padding: var(--spacing-xl);
  box-sizing: border-box;
}

.density-comfortable .navigation-menu .nav-footer .footer-content {
  padding: var(--spacing-md) var(--spacing-lg);
  box-sizing: border-box;
}

.density-comfortable .navigation-menu .nav-items {
  overflow-x: hidden;
}

.navigation-menu::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    color-mix(
      in srgb,
      transparent
    )
  );
}

.nav-brand {
  padding: var(--spacing-lg);
  position: relative;
  background:
    radial-gradient(
    ),
    radial-gradient(
    ),
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
    inset;
}

.navigation-menu.collapsed .nav-brand {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.navigation-menu.collapsed .brand-link {
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-brand::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

.nav-brand::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

[data-theme="dark"] .nav-brand,
.dark-theme .nav-brand {
  background:
    radial-gradient(
    ),
    radial-gradient(
    ),
}

.theme-mode-badge {
  align-self: flex-end;
  border-radius: var(--border-radius-full);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  color: var(--text-secondary);
  text-transform: uppercase;
}

[data-theme="dark"] .theme-mode-badge,
.dark-theme .theme-mode-badge {
  color: var(--text-secondary);
}

.nav-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.navigation-menu.collapsed .nav-controls {
  padding: var(--spacing-sm);
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-content {
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md) var(--spacing-sm) var(--spacing-lg);
}

.nav-content::-webkit-scrollbar {
}
.nav-content::-webkit-scrollbar-track {
  background: transparent;
}
.nav-content::-webkit-scrollbar-thumb {
}
.nav-content:hover::-webkit-scrollbar-thumb {
}

.nav-control-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  justify-content: center;
}

.navigation-menu.collapsed .nav-control-buttons {
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-control-btn {
  border-radius: var(--radius-md) !important;
  transition: all var(--duration-fast) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
}

.nav-control-btn:hover {
  box-shadow: var(--shadow-sm);
  background: var(--surface-elevated) !important;
}

.nav-control-btn:active {
}

.nav-control-btn:focus-visible {
  outline: none;
}

.nav-control-btn :deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.nav-control-btn :deep(i) {
  color: var(--text-secondary);
  transition: color var(--duration-fast) var(--easing-ease-out);
}

.nav-control-btn:hover :deep(i) {
  color: var(--text-primary);
}

.search-toggle-btn:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

.search-toggle-btn:hover :deep(i) {
}

.theme-toggle-btn:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

.theme-toggle-btn:hover :deep(i) {
}

.settings-btn:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

.settings-btn:hover :deep(i) {
}

.collapse-toggle:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

.collapse-toggle:hover :deep(i) {
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: inherit;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.brand-link:hover {
}

:deep(.brand-logo) {
  width: var(--nav-brand-logo-size) !important;
  height: var(--nav-brand-logo-size) !important;
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

:deep(.brand-logo)::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
}

.brand-link:hover :deep(.brand-logo)::before {
}

.brand-text {
  display: flex;
  flex-direction: column;
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.brand-text .brand-name {
}

.brand-text .brand-subtitle {
  color: var(--text-secondary);
}

.collapsed .brand-text {
  pointer-events: none;
  transition: all var(--duration-fast) var(--easing-ease-out);
  overflow: hidden;
}

.collapsed .section-title,
.collapsed .nav-item-content,
.collapsed .nav-footer-text {
  pointer-events: none;
  transition: all var(--duration-fast) var(--easing-ease-out);
  overflow: hidden;
}

.nav-controls.collapsed {
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.nav-controls.collapsed .nav-control-buttons {
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-controls {
  display: grid;
  grid-template-rows: auto auto;
  row-gap: var(--spacing-sm);
}

.quick-filter-dock {
  display: flex;
  align-items: center;
}

.nav-control-buttons {
  display: flex;
}

.nav-search-overlay {
  position: fixed;
  background: var(--surface-overlay);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.nav-search-dialog {
  padding: var(--spacing-lg);
}

.nav-search-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.nav-search-input input {
  background: transparent;
  outline: none;
  color: var(--text-primary);
}

.nav-search-input .clear-btn {
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.nav-search-hint {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
}

.nav-search-hint kbd {
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
}

.nav-search-results {
  margin-top: var(--spacing-md);
  display: grid;
  gap: var(--spacing-sm);
}
.nav-search-result {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
}
.nav-search-result:hover {
  background: var(--glass-hover-bg);
}
.nav-search-result .res-title {
  color: var(--text-primary);
}
.nav-search-result .res-desc {
  color: var(--text-secondary);
}
.nav-search-empty {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
}

.nav-section-header.collapsed {
  justify-content: center;
}

.nav-section-header.collapsed .section-title,
.nav-section-header.collapsed .section-indicator,
.nav-section-header.collapsed .section-badge {
  pointer-events: none;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.navigation-menu.collapsed:hover .brand-text,
.navigation-menu.collapsed:hover .section-title,
.navigation-menu.collapsed:hover .nav-item-content,
.navigation-menu.collapsed:hover .nav-footer-text {
  pointer-events: auto;
  width: auto;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.navigation-menu.collapsed:hover .nav-section-header.collapsed .section-title,
.navigation-menu.collapsed:hover
  .nav-section-header.collapsed
  .section-indicator,
.navigation-menu.collapsed:hover .nav-section-header.collapsed .section-badge {
  pointer-events: auto;
  width: auto;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.brand-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  transition: color var(--duration-normal) var(--easing-ease-out);
}

.brand-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  transition: color var(--duration-normal) var(--easing-ease-out);
}

.model-badge {
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
}
.model-badge .model-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.model-badge[role="button"] {
  cursor: pointer;
}
.model-badge[role="button"]:hover {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}
.model-badge[role="button"]:focus-visible {
  outline: none;
}
.model-badge .model-gear {
}
.model-badge[role="button"]:hover .model-gear {
}

.collapse-toggle {
  border-radius: var(--border-radius-md);
}

.nav-content {
  overflow-y: auto;
  overflow-x: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.nav-content::-webkit-scrollbar {
}

.nav-content::-webkit-scrollbar-track {
  background: transparent;
}

.nav-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  transition: background var(--duration-fast);
}

.nav-content::-webkit-scrollbar-thumb:hover {
}

.collapsed .nav-content {
}

.navigation-menu:not(.collapsed) .nav-content {
  animation: contentReveal var(--duration-normal) var(--easing-ease-out);
}

@keyframes contentReveal {
  from {
  }
  to {
  }
}

.nav-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
}

.accordion-section .nav-section-header.clickable {
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
}

.accordion-section .nav-section-header.clickable:hover {
  background: var(--surface-elevated);
}

.accordion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: transform var(--transition-fast);
}

.accordion-toggle i.rotated {
}

.accordion-content {
  overflow: hidden;
  transition: max-height var(--transition-normal) var(--easing-ease-out);
}

.accordion-content.expanded {
}

.accordion-content.collapsed {
  max-height: none;
  overflow: visible;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.section-title {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.nav-section-header {
  background: var(--glass-bg);
  border-radius: var(--border-radius-lg);
}

[data-theme="dark"] .nav-section-header,
.dark-theme .nav-section-header {
  border-color: var(--border-glass);
}


.density-compact .nav-item-link {
}
.density-compact .nav-items {
}
.density-compact .section-title {
}
.density-compact .nav-control-buttons {
}

.section-icon.with-badge {
  position: relative;
}
.section-count-badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform var(--duration-fast) var(--easing-ease-out),
    box-shadow var(--duration-fast);
}

.section-icon.with-badge:hover .section-count-badge {
  box-shadow:
}

.section-count-badge.badge-repop {
}

@keyframes badgePop {
  }
  }
  }
}


.nav-items {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-sm);
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.nav-items.nav-items-flat {
  align-items: stretch;
  text-align: left;
  border: none;
  background: transparent;
}

.collapsed .nav-items {
  align-items: center;
  gap: var(--spacing-sm);
  background: transparent;
  border-color: transparent;
}

.collapsed .nav-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.collapsed .nav-section::before {
  content: "";
  position: absolute;
  pointer-events: none;
}

.nav-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  margin-top: auto;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.nav-footer .footer-content.redesigned {
  display: grid;
  gap: var(--spacing-sm);
  box-sizing: border-box;
}

.nav-footer .footer-row {
  display: grid;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-footer .footer-content.redesigned > .footer-row:last-child {
}

.nav-footer .footer-glass-status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(
    color-mix(
        in srgb,
        transparent
      )
  );
}

.nav-footer .footer-glass-status,
.nav-footer .footer-model,
.nav-footer .footer-progress {
}

.nav-footer .footer-glass-status .fgs-dot {
}
.nav-footer .footer-glass-status .fgs-dot.connected {
}
.nav-footer .footer-glass-status .fgs-dot.disconnected {
}
.nav-footer .footer-glass-status .fgs-dot.pending {
}

.nav-footer .footer-glass-status .fgs-text {
  display: inline-flex;
  align-items: center;
}
.nav-footer .footer-glass-status .fgs-label {
  color: var(--text-primary);
}
.nav-footer .footer-glass-status .fgs-env {
  color: var(--text-secondary);
}

.nav-footer .status-dot {
}

.nav-footer .status-dot.connected {
  background: var(--color-success);
}
.nav-footer .status-dot.disconnected {
  background: var(--color-danger);
}
.nav-footer .status-dot.pending {
  background: var(--color-warning);
}

.nav-footer .status-label {
  color: var(--text-secondary);
}

.nav-footer .env-chip,
.nav-footer .version-chip {
  color: var(--text-primary);
}

.nav-footer .footer-model {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  justify-self: end;
}
.nav-footer .model-name {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-footer .footer-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.nav-footer .progress-track {
  position: relative;
  background: var(--surface-elevated);
  overflow: hidden;
}
.nav-footer .progress-bar {
  position: absolute;
  background: linear-gradient(
  );
  box-shadow: var(--shadow-xs);
}
.nav-footer .progress-label {
  color: var(--text-secondary);
}

.nav-footer .footer-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.nav-footer .footer-actions :deep(button),
.nav-footer .footer-actions :deep(a) {
}
.nav-footer .footer-actions :deep(button:hover),
.nav-footer .footer-actions :deep(a:hover) {
}

.nav-footer.collapsed {
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.nav-footer.collapsed .footer-info,
.nav-footer.collapsed .footer-version,
.nav-footer.collapsed .footer-links {
  overflow: hidden;
  transition: all var(--duration-fast);
}

.nav-footer .footer-collapsed.redesigned {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.nav-footer .footer-collapsed .footer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav-footer .footer-collapsed .footer-btn:hover {
}

.nav-footer .footer-collapsed .footer-status {
  background: var(--surface-elevated);
}
.nav-footer .footer-collapsed .footer-status[data-status="connected"] {
  background: var(--color-success);
}
.nav-footer .footer-collapsed .footer-status[data-status="disconnected"] {
  background: var(--color-danger);
}
.nav-footer .footer-collapsed .footer-status[data-status="pending"] {
  background: var(--color-warning);
}

.nav-footer .footer-collapsed .footer-version {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav-footer .footer-collapsed .version-text {
  color: var(--text-primary);
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-version {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
}

@keyframes pulse {
  }
  }
}

.nav-search-container {
  margin-top: var(--spacing-sm);
  transition: all var(--transition-normal) var(--easing-ease-out);
}

.nav-search-container.hidden {
  pointer-events: none;
}

[data-theme="dark"] .navigation-menu,
.dark-theme .navigation-menu {
  background: var(--glass-elevated);
  border-right-color: var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
}

[data-theme="dark"] .nav-control-btn:hover,
.dark-theme .nav-control-btn:hover {
  background: var(--glass-hover-bg) !important;
  box-shadow: var(--shadow-sm-dark);
}

[data-theme="dark"] .search-toggle-btn:hover,
.dark-theme .search-toggle-btn:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

[data-theme="dark"] .theme-toggle-btn:hover,
.dark-theme .theme-toggle-btn:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

[data-theme="dark"] .settings-btn:hover,
.dark-theme .settings-btn:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

[data-theme="dark"] .collapse-toggle:hover,
.dark-theme .collapse-toggle:hover {
  background: color-mix(
    in srgb,
    transparent
  ) !important;
}

[data-theme="dark"] .nav-brand,
.dark-theme .nav-brand {
}

[data-theme="dark"] .brand-name,
.dark-theme .brand-name {
  color: var(--text-primary);
}

[data-theme="dark"] .section-title,
.dark-theme .section-title {
  color: var(--text-secondary);
}

[data-theme="dark"] .nav-footer,
.dark-theme .nav-footer {
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .navigation-menu {
  }

  :root:not([data-theme="light"]) .brand-name {
    background: linear-gradient(
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.navigation-menu:hover {
  box-shadow: var(--shadow-lg);
  border-right-color: var(--border-emphasis);
}

.navigation-menu::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: opacity var(--transition-normal);
}

.navigation-menu:hover::after {
}

.theme-gaming .navigation-menu {
  background:
    var(--glass-surface-elevated);
}

.theme-gaming .brand-logo .logo-inner {
  background: linear-gradient(
  );
}

.theme-gaming .section-icon {
}

.theme-gaming .ai-glow {
}

.theme-gaming .brand-status.status-connected .status-dot {
}

.navigation-menu:focus-within {
}

.collapse-toggle:focus,
.brand-link:focus {
  border-radius: var(--border-radius-sm);
}

.nav-section[data-loading="true"] .section-icon {
}

@keyframes spin {
  from {
  }
  to {
  }
}

@media (prefers-reduced-motion: reduce) {
  .navigation-menu,
  .brand-logo,
  .nav-controls,
  .nav-section-header,
  .footer-content {
    transition: none;
  }

  .ring,
  .indicator-pulse,
  .status-dot {
    animation: none;
  }
}

@media (prefers-contrast: high) {
  .navigation-menu {
  }

  .nav-section::before {
  }

  .brand-name {
    -webkit-text-fill-color: var(--text-primary);
  }
}

[data-theme="dark"] .navigation-menu:hover,
.dark-theme .navigation-menu:hover {
  box-shadow:
}

:deep(.brand-logo):hover {
  box-shadow: var(--shadow-glow-primary);
}

[data-theme="dark"] :deep(.brand-logo):hover,
.dark-theme :deep(.brand-logo):hover {
}

.nav-items .nav-item:hover {
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
}

[data-theme="dark"] .nav-items .nav-item:hover,
.dark-theme .nav-items .nav-item:hover {
}

  .navigation-menu {
  }

  .navigation-menu.collapsed {
  }

  .navigation-menu.collapsed .nav-control-btn {
  }

  .navigation-menu.collapsed .nav-brand {
    padding: var(--spacing-sm);
  }
}

  .nav-footer .footer-row {
  }
  .nav-footer .footer-model {
    justify-self: start;
  }
  .nav-footer .progress-label {
    white-space: nowrap;
  }
}
</style>
