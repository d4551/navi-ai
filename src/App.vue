<template>
  <div
    id="app-root"
    class="d-flex flex-col min-h-screen unified-app"
    :class="unifiedUI.unifiedClasses.value"
  >
    <!-- Accessibility: screen reader announcer -->
    <div
      id="sr-announcer"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    ></div>
    <ErrorBoundary>
      <!-- Keep Vuetify theme synced with unified theme -->
      <ThemeBridge />
      <!-- Main Layout Container -->
      <div class="d-flex flex-1 w-full">
        <!-- Sidebar Navigation -->
        <aside
          id="app-sidebar"
          class="app-sidebar"
          :class="{
            'sidebar-visible': sidebarVisible,
            'sidebar-collapsed': sidebarCollapsed || autoCollapsed,
            'sidebar-animating': sidebarAnimating,
            'sidebar-expanded': sidebarExpanded,
            'sidebar-hovered': sidebarHovered,
          }"
          role="navigation"
          aria-label="Main navigation"
          :inert="(!sidebarVisible && isMobile) || null"
          @mouseenter="handleSidebarMouseEnter"
          @mouseleave="handleSidebarMouseLeave"
        >
          <NavigationMenu
            :is-collapsed="sidebarCollapsed || autoCollapsed"
            @toggle-collapse="toggleSidebarCollapse"
            @navigate="closeSidebar"
            @show-help="openAssistantFromNav"
          />
        </aside>

        <!-- Main Content Area -->
        <div class="d-flex flex-col flex-1 w-full">
          <!-- Header -->
          <header class="app-header glass-header">
            <div class="unified-container header-inner">
              <!-- Mobile menu toggle -->
              <button
                v-if="isMobile"
                class="mobile-menu-toggle"
                :class="{ 'menu-open': sidebarVisible }"
                type="button"
                :aria-expanded="sidebarVisible.toString()"
                aria-controls="app-sidebar"
                @click="toggleSidebar"
              >
                <div class="hamburger-icon" :class="{ active: sidebarVisible }">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              <!-- Global AI Status Banner -->
              <div
                v-if="!store.settings?.geminiApiKey"
                class="ai-status-banner p-sm m-sm"
                role="status"
              >
                <div class="banner-content d-flex align-items-center gap-md">
                  <AppIcon name="mdi-key" />
                  <div class="banner-text">
                    <strong>AI Features Inactive</strong>
                    <p class="text-sm m-0">
                      Add your API key in
                      <router-link to="/settings">Settings</router-link> to
                      enable AI features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <!-- Page Content -->
          <main
            id="main"
            class="flex-1 overflow-y-auto p-lg main-content page-glass-container"
            role="main"
          >
            <router-view v-slot="{ Component }">
              <transition name="page-transition" mode="out-in">
                <component :is="Component" v-if="Component" />
              </transition>
            </router-view>
          </main>

          <!-- Footer (env-toggle: VITE_HIDE_FOOTER) -->
          <footer v-if="!hideFooter" class="app-footer glass-footer p-md">
            <div
              class="footer-content unified-container d-flex justify-content-between align-items-center text-sm text-secondary"
            >
              <div class="footer-brand d-flex align-items-center gap-xs">
                <AppLogo alt-text="NAVI - AI Career Assistant" />
              </div>
              <div
                class="footer-version font-mono bg-primary text-on-primary p-xs rounded-sm font-medium"
              >
                v{{ appVersion }}
              </div>
            </div>
          </footer>
        </div>
      </div>

      <!-- Mobile Overlay -->
      <div
        v-if="sidebarVisible && isMobile"
        class="mobile-overlay"
        @click="closeSidebar"
      ></div>

      <!-- AI Fairy Assistant: globally mounted so it's available on every page -->
      <AIFairyAssistant />

      <!-- Voice Feedback Overlay -->
      <VoiceFeedbackOverlay
        :show-voice-hints="store.settings?.voiceHints || false"
        :enable-visual-feedback="store.settings?.voiceVisualFeedback !== false"
        position="top-right"
      />

      <!-- Global Fairy Chat Modal (page-aware) -->
      <FairyChatModal
        v-model:open="assistantOpen"
        :messages="assistantMessages"
        size="xl"
        @send="handleAssistantSend"
      />

      <!-- Global Gamification Effects -->
      <GamificationEffects ref="gfx" />

      <!-- Toast Notifications -->
      <ToastNotification />
    </ErrorBoundary>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import ErrorBoundary from "@/components/ErrorBoundary.vue";
import ToastNotification from "@/components/ToastNotification.vue";
import GamificationEffects from "@/components/GamificationEffects.vue";
import ThemeBridge from "@/components/ThemeBridge.vue";
import gamificationEvents from "@/shared/services/GamificationEvents";
import NavigationMenu from "@/components/navigation/NavigationMenu.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppLogo from "@/components/AppLogo.vue"; // Import the new AppLogo component
import AIFairyAssistant from "@/components/AIFairyAssistant.vue";
import FairyChatModal from "@/components/FairyChatModal.vue";
import VoiceFeedbackOverlay from "@/components/ui/VoiceFeedbackOverlay.vue";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import { useResponsive } from "@/composables/useResponsive";
import AppIcon from "@/components/ui/AppIcon.vue";
import { usePageAssistantContext } from "@/composables/usePageAssistantContext";

export default {
  name: "App",
  components: {
    ErrorBoundary,
    ToastNotification,
    NavigationMenu,
    AppLogo, // Register the new AppLogo component
    AppIcon,
    UnifiedButton,
    GamificationEffects,
    ThemeBridge,
    AIFairyAssistant,
    FairyChatModal,
    VoiceFeedbackOverlay,
  },
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const router = useRouter();
    const appVersion = computed(() => store.meta?.version || "2.0.0");

    // Initialize unified theme system
    const theme = useUnifiedTheme();
    const unifiedUI = useUnifiedUI();
    const responsive = useResponsive();

    // Fairy assistant now handles its own visibility via fairyBubbleSize setting

    // Gamification effects binding
    const gfx = ref(null);

    // Env-based UI toggles
    const hideFooter = computed(() => {
      try {
        const raw = import.meta.env?.VITE_HIDE_FOOTER;
        // Default: hide the footer until explicitly disabled
        if (raw == null) return true;
        const val = String(raw).trim().toLowerCase();
        if (val === "0" || val === "false" || val === "no" || val === "off")
          return false;
        if (val === "1" || val === "true" || val === "yes" || val === "on")
          return true;
        return Boolean(val);
      } catch {
        return true;
      }
    });

    // Initialize responsive system
    onMounted(() => {
      responsive.initializeResponsive();
      try {
        gamificationEvents.on("xp_awarded", (e) => {
          gfx.value?.triggerXPGain?.(
            e.amount,
            e.reason || "Action",
            e.amount >= 100 ? "critical" : e.amount >= 50 ? "bonus" : "normal",
          );
        });
        gamificationEvents.on("achievement_unlocked", (a) => {
          gfx.value?.triggerAchievement?.({
            name: a.name,
            description: a.description || "",
            icon: a.icon || "mdi mdi-trophy-variant",
            color: "#FFD700",
            xpReward: a.xp || 0,
          });
        });
        gamificationEvents.on("level_up", (l) => {
          gfx.value?.triggerLevelUp?.(l.newLevel, []);
        });
      } catch {}
    });

    // Sidebar state management
    const sidebarVisible = ref(false);
    const sidebarCollapsed = ref(false);
    const autoCollapsed = ref(false);
    const sidebarAnimating = ref(false);
    const sidebarHovered = ref(false);

    // Enhanced sidebar behavior
    const sidebarExpanded = computed(() => {
      return (
        sidebarHovered.value && (sidebarCollapsed.value || autoCollapsed.value)
      );
    });

    // Mobile detection
    const isMobile = computed(() => responsive.isMobile.value);

    // Keyboard shortcuts for quick navigation
    const onKeydown = (e) => {
      try {
        // Ctrl+, => Settings
        if ((e.ctrlKey || e.metaKey) && e.key === ",") {
          e.preventDefault();
          router.push("/settings");
          return;
        }
        // Ctrl+Shift+D => Documents
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "D" || e.key === "d")
        ) {
          e.preventDefault();
          router.push("/documents");
          return;
        }
        // Ctrl+Shift+J => Jobs
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "J" || e.key === "j")
        ) {
          e.preventDefault();
          router.push("/jobs");
          return;
        }
        // Ctrl+Shift+P => Portfolio
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "P" || e.key === "p")
        ) {
          e.preventDefault();
          router.push("/portfolio");
        }
        // Ctrl+/ => Open Assistant
        if ((e.ctrlKey || e.metaKey) && (e.key === "/" || e.key === "?")) {
          e.preventDefault();
          openAssistantFromNav();
          return;
        }
        // Ctrl+Shift+F => Cycle Fairy Assistant size
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "F" || e.key === "f")
        ) {
          e.preventDefault();
          cycleFairyBubbleSize();
          return;
        }
      } catch {}
    };

    onMounted(() => {
      window.addEventListener("keydown", onKeydown);
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", onKeydown);
    });

    // ===== Page-aware Assistant Integration =====
    const assistantOpen = ref(false);
    const assistantMessages = ref([]);
    const { buildContextString } = usePageAssistantContext();

    function buildPageContextMessage() {
      return buildContextString();
    }

    function seedAssistantMessages() {
      const now = Date.now();
      assistantMessages.value = [
        {
          id: "ai-greet-" + now,
          type: "ai",
          content:
            "Hi! I'm NAVI. I can help with this page — what do you need?",
          timestamp: now,
        },
        {
          id: "sys-ctx-" + (now + 1),
          type: "system",
          content: buildPageContextMessage(),
          timestamp: now + 1,
        },
      ];
    }

    function openAssistantFromNav() {
      if (!assistantMessages.value.length) seedAssistantMessages();
      assistantOpen.value = true;
    }

    // Cycle fairy assistant bubble size
    function cycleFairyBubbleSize() {
      const currentSize = store.settings?.fairyBubbleSize || "full";
      let nextSize;

      if (currentSize === "full") {
        nextSize = "small";
      } else if (currentSize === "small") {
        nextSize = "hidden";
      } else {
        nextSize = "full";
      }

      store.updateSettings({ fairyBubbleSize: nextSize });
      console.log(`Fairy bubble size changed: ${currentSize} → ${nextSize}`);
    }

    function handleAssistantSend(text) {
      const now = Date.now();
      assistantMessages.value.push({
        id: "u-" + now,
        type: "user",
        content: text,
        timestamp: now,
      });
      setTimeout(() => {
        assistantMessages.value.push({
          id: "a-" + (now + 1),
          type: "ai",
          content: "Thanks! I will use the current page context to help.",
          timestamp: now + 1,
        });
      }, 400);
    }

    // Reset context cache when route changes (reseed on next open)
    watch(
      () => route.fullPath,
      () => {
        assistantMessages.value = [];
      },
    );

    // Sidebar controls
    const toggleSidebar = () => {
      if (isMobile.value) {
        sidebarVisible.value = !sidebarVisible.value;
      }
    };

    const closeSidebar = () => {
      if (isMobile.value) {
        sidebarVisible.value = false;
      }
    };

    const toggleSidebarCollapse = () => {
      sidebarAnimating.value = true;
      sidebarCollapsed.value = !sidebarCollapsed.value;

      // Reset animation flag after transition
      setTimeout(() => {
        sidebarAnimating.value = false;
      }, 300);
    };

    // Enhanced hover handlers for collapsed sidebar
    const handleSidebarMouseEnter = () => {
      if (!isMobile.value && (sidebarCollapsed.value || autoCollapsed.value)) {
        sidebarHovered.value = true;
      }
    };

    const handleSidebarMouseLeave = () => {
      sidebarHovered.value = false;
    };

    // Auto-collapse on resize with better logic
    watch(
      () => responsive.windowWidth.value,
      (width, oldWidth) => {
        if (width < 1200 && oldWidth >= 1200 && !sidebarCollapsed.value) {
          autoCollapsed.value = true;
        } else if (width >= 1200 && oldWidth < 1200) {
          autoCollapsed.value = false;
        }
      },
      { immediate: true },
    );

    // Close sidebar on route change for mobile
    watch(
      () => route.path,
      () => {
        if (isMobile.value) {
          closeSidebar();
        }
      },
    );

    return {
      store,
      appVersion,
      theme,
      unifiedUI,
      responsive,
      router,
      gfx,
      hideFooter,
      sidebarVisible,
      sidebarCollapsed,
      autoCollapsed,
      sidebarAnimating,
      sidebarHovered,
      sidebarExpanded,
      isMobile,
      toggleSidebar,
      closeSidebar,
      toggleSidebarCollapse,
      handleSidebarMouseEnter,
      handleSidebarMouseLeave,
      assistantOpen,
      assistantMessages,
      handleAssistantSend,
      openAssistantFromNav,
      cycleFairyBubbleSize,
    };
  },
};
</script>

<style scoped>
.unified-app {
  font-family: var(--font-primary);
  overflow-y: auto;
  overflow-x: hidden;
  color: var(--text-primary);
}


.app-sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

  .app-sidebar {
    position: sticky;
  }
}

.app-sidebar.sidebar-collapsed {
  width: var(--page-sidebar-collapsed-width);
}

.app-sidebar.sidebar-collapsed.sidebar-hovered,
.app-sidebar.sidebar-expanded {
  z-index: var(
    --z-navigation-hover
}

.app-sidebar.sidebar-animating {
}

.app-sidebar.sidebar-collapsed:not(.sidebar-hovered) .navigation-menu {
}

.app-sidebar.sidebar-collapsed.sidebar-hovered .navigation-menu {
}

@keyframes contentSlideIn {
  from {
    transform: translateX(
  }
  to {
  }
}

  .app-sidebar {
    position: fixed;
  }

  .app-sidebar.sidebar-visible {
  }

  .app-sidebar.sidebar-collapsed.sidebar-hovered {
    width: var(--page-sidebar-collapsed-width);
  }

  .main-content {
  }
}

.app-header {
  position: sticky;
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-toggle:hover {
}

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
}

.hamburger-icon span {
  display: block;
  transform-origin: center;
}

}

}

}

.ai-status-banner {
}

.banner-content i {
}

.banner-text strong {
}

.banner-text p {
}

.banner-text a {
  text-decoration: none;
}

.banner-text a:hover {
  text-decoration: underline;
}

.page-content {
}

.page-transition-enter-active,
.page-transition-leave-active {
}

.page-transition-enter-from {
}

.page-transition-leave-to {
  transform: translateY(
}

.app-footer {
}

.footer-brand {
}

.footer-brand i {
}

.footer-version {
  color: var(--text-on-primary);
}

.mobile-overlay {
  display: none;
}

  .mobile-overlay {
    display: block;
    position: fixed;
    backdrop-filter: var(
      --glass-backdrop-blur-light
  }
}

  .app-sidebar:not(.sidebar-visible) {
    width: var(--page-sidebar-collapsed-width);
  }
}

  .app-header {
    padding: clamp(
      var(--spacing-xs),
      var(--spacing-sm)
  }

  .page-content {
    padding: clamp(
      var(--spacing-sm),
      var(--spacing-md)
  }

  .footer-content {
    flex-direction: column;
    gap: clamp(
      var(--spacing-xs),
      var(--spacing-sm)
    text-align: center;
  }
}

.unified-app[data-theme="dark"],
:root[data-theme="dark"] .unified-app,
html[data-theme="dark"] .unified-app,
body[data-theme="dark"] .unified-app {
}

.unified-app[data-theme="dark"] .app-sidebar,
.unified-app[data-theme="dark"] .app-header,
.unified-app[data-theme="dark"] .app-footer,
:root[data-theme="dark"] .app-sidebar,
:root[data-theme="dark"] .app-header,
:root[data-theme="dark"] .app-footer,
html[data-theme="dark"] .app-sidebar,
html[data-theme="dark"] .app-header,
html[data-theme="dark"] .app-footer,
body[data-theme="dark"] .app-sidebar,
body[data-theme="dark"] .app-header,
body[data-theme="dark"] .app-footer {
}

.unified-app[data-theme="dark"] .page-content,
:root[data-theme="dark"] .page-content,
html[data-theme="dark"] .page-content,
body[data-theme="dark"] .page-content {
}

.unified-app[data-theme="dark"] .hamburger-icon span,
:root[data-theme="dark"] .hamburger-icon span,
html[data-theme="dark"] .hamburger-icon span,
body[data-theme="dark"] .hamburger-icon span {
}

.theme-gaming .app-sidebar {
  background:
  border-right-color: var(
    --glass-border-gaming
}

.theme-gaming .footer-brand i {
}

@media (prefers-reduced-motion: reduce) {
  .app-sidebar,
  .hamburger-icon span,
  .page-transition-enter-active,
  .page-transition-leave-active {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .app-sidebar,
  .app-header,
  .app-footer {
  }
  .skip-link {
  }
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-menu-toggle {
  border-radius: var(--radius-md);
}

.mobile-menu-toggle:focus-visible {
}

  .app-sidebar {
  }

  .page-content {
  }
}

  .page-content {
  }

  .header-inner {
  }

  .footer-content {
  }
}
</style>
