<template>
  <div id="app-root" class="d-flex flex-col min-h-screen unified-app bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" :class="unifiedUI.unifiedClasses">
    <!-- Accessibility: Skip to content link and screen reader announcer -->
    <a href="#main" class="skip-link">Skip to main content</a>
    <div id="sr-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    <ErrorBoundary>
      <!-- Keep Vuetify theme synced with unified theme -->
      <ThemeBridge />
      <!-- Main Layout Container -->
      <div class="d-flex flex-1 w-full">
        <!-- Sidebar Navigation -->
        <aside
          id="app-sidebar"
          class="app-sidebar bg-white/90 dark:bg-gray-800/90 border-r border-gray-200 dark:border-gray-700"
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
          <header class="app-header glass-strong bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700">
            <div class="header-inner">
              <!-- Left Section: Mobile toggle + AI Status -->
              <div class="header-left">
                <!-- Mobile menu toggle -->
                <button
                  v-if="isMobile"
                  class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                  :class="{ 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100': sidebarVisible }"
                  type="button"
                  :aria-expanded="sidebarVisible.toString()"
                  aria-controls="app-sidebar"
                  @click="toggleSidebar"
                >
                  <span class="sr-only">Open main menu</span>
                  <!-- Heroicon name: outline/menu -->
                  <svg v-if="!sidebarVisible" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <!-- Heroicon name: outline/x -->
                  <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <!-- Global AI Status Banner -->
                <div
                  v-if="!store.settings?.geminiApiKey"
                  class="ai-status-banner glass p-3 rounded-lg neon-blue bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                  role="status"
                >
                  <div class="banner-content flex items-center gap-3">
                    <!-- Heroicon name: outline/key -->
                    <svg class="w-5 h-5 text-gaming" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <div class="banner-text">
                      <strong class="text-glass-enhanced text-yellow-800 dark:text-yellow-200">AI Features Inactive</strong>
                      <p class="text-sm m-0 text-glass-enhanced text-yellow-700 dark:text-yellow-300">Add your API key in <router-link to="/settings" class="neon-interactive text-blue-600 dark:text-blue-400 hover:underline">Settings</router-link> to enable AI features</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Section: Header Actions -->
              <div class="header-right">
                <div class="nav-brand glass-strong p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                  <div class="header-actions">
                    <!-- Gamification/Achievements Button -->
                    <UnifiedButton
                      variant="ghost"
                      size="sm"
                      :aria-label="'Achievements'"
                      @click="openGamificationModal"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary bg-glass hover:bg-glass-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon transition-colors duration-200"
                    >
                      <!-- Heroicon name: outline/trophy -->
                      <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Achievements
                    </UnifiedButton>

                    <!-- Theme Toggle -->
                    <ThemeToggle :compact="true" />

                    <!-- Settings Button -->
                    <UnifiedButton
                      variant="outline"
                      size="sm"
                      :aria-label="'Settings'"
                      @click="$router.push('/settings')"
                      class="inline-flex items-center px-3 py-2 border border-glass text-sm leading-4 font-medium rounded-md text-primary bg-glass hover:bg-glass-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon transition-colors duration-200"
                    >
                      <!-- Heroicon name: outline/cog-6-tooth -->
                      <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </UnifiedButton>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <!-- Page Content -->
          <main id="main" class="flex-1 overflow-y-auto p-6 main-content bg-gray-50 dark:bg-gray-900" role="main">
            <router-view v-slot="{ Component }">
              <transition name="page-transition" mode="out-in">
                <component :is="Component" v-if="Component" />
              </transition>
            </router-view>
          </main>

          <!-- Footer (env-toggle: VITE_HIDE_FOOTER) -->
          <footer v-if="!hideFooter" class="app-footer glass p-4 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700">
            <div class="footer-content container-xl flex justify-between items-center text-sm text-glass-enhanced text-gray-600 dark:text-gray-400">
              <div class="footer-brand flex items-center gap-2">
                <AppLogo alt-text="NAVI - AI Career Assistant" />
              </div>
              <div class="footer-version font-mono glass-strong px-3 py-1 rounded-md font-medium text-glass-enhanced bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                v{{ appVersion }}
              </div>
            </div>
          </footer>
        </div>
      </div>

      <!-- Mobile Overlay -->
      <div
        v-if="sidebarVisible && isMobile"
        class="mobile-overlay bg-gray-900/50 dark:bg-gray-900/70"
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

      <!-- Gamification Modal -->
      <GamificationModal
        v-if="gamificationModalOpen"
        @close="gamificationModalOpen = false"
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
import { usePageAssistantContext } from '@/composables/usePageAssistantContext'
import ThemeToggle from '@/components/ThemeToggle.vue'
import GamificationModal from '@/components/GamificationModal.vue'

export default {
  name: "App",
  components: {
    ErrorBoundary,
    ToastNotification,
    NavigationMenu,
    AppLogo, // Register the new AppLogo component
    AppIcon,
    UnifiedButton,
    ThemeToggle,
    GamificationEffects,
    GamificationModal,
    ThemeBridge,
    AIFairyAssistant,
    FairyChatModal,
    VoiceFeedbackOverlay,
  },
  setup() {
    const router = useRouter();

    const store = useAppStore();
    const route = useRoute();
    const appVersion = computed(() => store.meta?.version || "2.0.0");
    
    // Initialize unified theme system
    const theme = useUnifiedTheme();
    const unifiedUI = useUnifiedUI();
    const responsive = useResponsive();
    
    // Fairy assistant now handles its own visibility via fairyBubbleSize setting

    // Gamification effects binding
    const gfx = ref(null)
    
    // Env-based UI toggles
    const hideFooter = computed(() => {
      try {
        const raw = import.meta.env?.VITE_HIDE_FOOTER
        // Default: hide the footer until explicitly disabled
        if (raw == null) return true
        const val = String(raw).trim().toLowerCase()
        if (val === '0' || val === 'false' || val === 'no' || val === 'off') return false
        if (val === '1' || val === 'true' || val === 'yes' || val === 'on') return true
        return Boolean(val)
      } catch {
        return true
      }
    })
    
    // Initialize responsive system
    onMounted(() => {
      responsive.initializeResponsive();
      try {
        gamificationEvents.on('xp_awarded', (e) => {
          gfx.value?.triggerXPGain?.(e.amount, e.reason || 'Action', e.amount >= 100 ? 'critical' : e.amount >= 50 ? 'bonus' : 'normal')
        })
        gamificationEvents.on('achievement_unlocked', (a) => {
          gfx.value?.triggerAchievement?.({
            name: a.name,
            description: a.description || '',
            icon: a.icon || 'mdi mdi-trophy-variant',
            color: 'var(--color-warning-400)',
            xpReward: a.xp || 0,
          })
        })
        gamificationEvents.on('level_up', (l) => {
          gfx.value?.triggerLevelUp?.(l.newLevel, [])
        })
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
      return sidebarHovered.value && (sidebarCollapsed.value || autoCollapsed.value);
    });
    
    // Mobile detection
    const isMobile = computed(() => responsive.isMobile.value);
    
    // Keyboard shortcuts for quick navigation
    const onKeydown = (e) => {
      try {
        // Ctrl+, => Settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
          e.preventDefault();
          router.push('/settings');
          return;
        }
        // Ctrl+Shift+D => Documents
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
          e.preventDefault();
          router.push('/documents');
          return;
        }
        // Ctrl+Shift+J => Jobs
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
          e.preventDefault();
          router.push('/jobs');
          return;
        }
        // Ctrl+Shift+P => Portfolio
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
          e.preventDefault();
          router.push('/portfolio');
        }
        // Ctrl+/ => Open Assistant
        if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === '?')) {
          e.preventDefault();
          openAssistantFromNav();
          return;
        }
        // Ctrl+Shift+F => Cycle Fairy Assistant size
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
          e.preventDefault();
          cycleFairyBubbleSize();
          return;
        }
      } catch {}
    };

    onMounted(() => {
      window.addEventListener('keydown', onKeydown);
    });
    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown);
    });

    // ===== Gamification Modal =====
    const gamificationModalOpen = ref(false)

    function openGamificationModal() {
      gamificationModalOpen.value = true
    }

    // ===== Page-aware Assistant Integration =====
    const assistantOpen = ref(false)
    const assistantMessages = ref([])
    const { buildContextString } = usePageAssistantContext()

    function buildPageContextMessage() { return buildContextString() }

    function seedAssistantMessages() {
      const now = Date.now()
      assistantMessages.value = [
        { id: 'ai-greet-' + now, type: 'ai', content: "Hi! I'm NAVI. I can help with this page — what do you need?", timestamp: now },
        { id: 'sys-ctx-' + (now + 1), type: 'system', content: buildPageContextMessage(), timestamp: now + 1 },
      ]
    }

    function openAssistantFromNav() {
      if (!assistantMessages.value.length) seedAssistantMessages()
      assistantOpen.value = true
    }
    
    // Cycle fairy assistant bubble size
    function cycleFairyBubbleSize() {
      const currentSize = store.settings?.fairyBubbleSize || 'full';
      let nextSize;
      
      if (currentSize === 'full') {
        nextSize = 'small';
      } else if (currentSize === 'small') {
        nextSize = 'hidden';
      } else {
        nextSize = 'full';
      }
      
      store.updateSettings({ fairyBubbleSize: nextSize });
      console.log(`Fairy bubble size changed: ${currentSize} → ${nextSize}`);
    }

    function handleAssistantSend(text) {
      const now = Date.now()
      assistantMessages.value.push({ id: 'u-' + now, type: 'user', content: text, timestamp: now })
      setTimeout(() => {
        assistantMessages.value.push({ id: 'a-' + (now + 1), type: 'ai', content: 'Thanks! I will use the current page context to help.', timestamp: now + 1 })
      }, 400)
    }

    // Reset context cache when route changes (reseed on next open)
    watch(() => route.fullPath, () => { assistantMessages.value = [] })

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
    watch(() => responsive.windowWidth.value, (width, oldWidth) => {
      if (width < 1200 && oldWidth >= 1200 && !sidebarCollapsed.value) {
        autoCollapsed.value = true;
      } else if (width >= 1200 && oldWidth < 1200) {
        autoCollapsed.value = false;
      }
    }, { immediate: true });
    
    // Close sidebar on route change for mobile
    watch(() => route.path, () => {
      if (isMobile.value) {
        closeSidebar();
      }
    });
    
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
      gamificationModalOpen,
      openGamificationModal,
    };
  },
};
</script>

<style scoped>
/* ===== UNIFIED APP LAYOUT STYLES ===== */
.unified-app {
  font-family: var(--font-primary);
  height: 100vh;
  /* Allow vertical scrolling for the main content area */
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--surface-base); /* Use design system variable */
  color: var(--text-primary);
}

/* Skip Link for Accessibility - Use design system utility class */
/* .skip-link utility class is already defined in design-system.css */

/* ===== SIDEBAR STYLES ===== */
.app-sidebar {
  width: var(--page-sidebar-width); /* Use design system variable */
  height: 100vh;
  background: var(--glass-surface-elevated); /* Use design system variable */
  border-right: none; /* Remove sidebar border */
  backdrop-filter: var(--glass-backdrop-blur); /* Use design system variable */
  transition: all var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
  z-index: var(--z-navigation); /* Use design system variable */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: none; /* Remove sidebar shadow */
  margin-right: var(--spacing-2); /* Add breathing room since divider is gone */
  /* Use .position-relative utility class from design system */
}

/* Keep sidebar sticky on desktop so the left menubar stays fixed while content scrolls */
@media (min-width: 769px) {
  .app-sidebar {
    position: sticky;
    top: 0;
    align-self: flex-start; /* ensure sticky works inside flex container */
  }
}

  .app-sidebar.sidebar-collapsed {
  width: var(--page-sidebar-collapsed-width);
  }

/* Enhanced hover expansion for collapsed sidebar */
.app-sidebar.sidebar-collapsed.sidebar-hovered,
.app-sidebar.sidebar-expanded {
  width: var(--page-sidebar-width); /* Use design system variable */
  box-shadow: none; /* Remove hover/expanded shadow */
  z-index: var(--z-navigation-hover); /* Define a new z-index for hovered sidebar if needed */
}

/* Smooth animation states */
.app-sidebar.sidebar-animating {
  transition: all var(--duration-fast) var(--easing-ease-out); /* Use design system variables */
}

/* Content reveal during hover expansion */
.app-sidebar.sidebar-collapsed:not(.sidebar-hovered) .navigation-menu {
  opacity: 0.95;
}

.app-sidebar.sidebar-collapsed.sidebar-hovered .navigation-menu {
  opacity: 1;
  animation: contentSlideIn var(--duration-fast) var(--easing-ease-out); /* Use design system variables */
}

@keyframes contentSlideIn {
  from {
    opacity: 0.8;
    transform: translateX(calc(-1 * var(--spacing-1))); /* Use design system variable */
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Enhanced Mobile Sidebar with Fluid Scaling */
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: -280px; /* Keep hardcoded for specific collapsed width */
    top: 0;
    z-index: var(--z-mobile-overlay); /* Use design system variable */
    box-shadow: none; /* Remove mobile shadow */
    margin-right: 0; /* No outer spacing when overlaid */
    width: clamp(260px, 75vw, 320px); /* Fluid sidebar width for mobile */
  }
  
  .app-sidebar.sidebar-visible {
    left: 0;
  }
  
  /* Disable hover expansion on mobile */
  .app-sidebar.sidebar-collapsed.sidebar-hovered {
    width: var(--page-sidebar-collapsed-width);
    box-shadow: none; /* Remove mobile hover shadow */
  }
  
  /* Enhanced mobile content spacing */
  .main-content {
    padding: clamp(var(--spacing-sm), 3vw, var(--spacing-md));
  }
}

/* ===== HEADER STYLES ===== */
.app-header {
  background: var(--glass-surface-elevated); /* Use design system variable */
  border-bottom: 1px solid var(--border-base); /* Use design system variable */
  position: sticky;
  top: 0;
  z-index: var(--z-sticky); /* Use design system variable */
  backdrop-filter: var(--glass-backdrop-blur); /* Use design system variable */
  box-shadow: var(--shadow-sm); /* Default shadow from design system */
}


/* Header Layout */
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: var(--spacing-lg, 1.5rem);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 1rem);
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
}

/* Mobile Header Adjustments */
@media (max-width: 768px) {
  .header-inner {
    padding: var(--spacing-sm, 0.75rem);
    gap: var(--spacing-sm, 0.75rem);
  }

  .nav-brand {
    padding: var(--spacing-xs, 0.5rem) var(--spacing-sm, 0.75rem) !important;
  }

  .header-actions {
    gap: var(--spacing-xs, 0.5rem);
  }

  .ai-status-banner {
    font-size: 0.875rem;
  }

  .ai-status-banner .banner-text {
    min-width: 0;
  }

  .ai-status-banner p {
    display: none;
  }
}

/* AI Status Banner */
.ai-status-banner {
  background: var(--color-warning-50); /* Use design system variable */
  border: 1px solid var(--color-warning-200); /* Use design system variable */
  border-radius: var(--radius-md); /* Use design system variable */
  margin: var(--spacing-sm) 0; /* Use design system variable */
}

.banner-content i {
  color: var(--color-warning-500); /* Use design system variable */
  font-size: var(--font-size-lg); /* Use design system variable */
  flex-shrink: 0;
}

.banner-text strong {
  color: var(--text-primary); /* Use design system variable */
  font-weight: var(--font-weight-semibold); /* Use design system variable */
}

.banner-text p {
  color: var(--text-secondary); /* Use design system variable */
}

.banner-text a {
  color: var(--color-primary-700); /* Stronger contrast for accessibility */
  text-decoration: none;
  font-weight: var(--font-weight-semibold); /* Increase weight for small text */
}

.banner-text a:hover {
  text-decoration: underline;
}

/* ===== PAGE CONTENT ===== */
.page-content {
  background: var(--surface-base); /* Use design system variable */
}

/* Page Transition */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(var(--spacing-2-5)); /* Use design system variable */
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--spacing-2-5))); /* Use design system variable */
}

/* ===== FOOTER STYLES ===== */
.app-footer {
  background: var(--glass-surface-elevated); /* Use design system variable */
  border-top: 1px solid var(--border-base); /* Use design system variable */
  box-shadow: var(--shadow-sm); /* Default shadow from design system */
}

.footer-brand {
  gap: var(--spacing-xs); /* Use design system variable */
}

.footer-brand i {
  color: var(--color-primary-500); /* Use design system variable */
}

.footer-version {
  /* Ensure AAA contrast for small text */
  background: var(--color-primary-600); /* stronger background */
  color: var(--text-on-primary);
}

/* ===== MOBILE OVERLAY ===== */
.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: var(--overlay-backdrop);
    z-index: var(--z-overlay); /* Use design system variable */
    backdrop-filter: var(--glass-backdrop-blur-light); /* Use design system variable */
  }
}

/* ===== ENHANCED RESPONSIVE ADJUSTMENTS ===== */
@media (max-width: 1200px) {
  .app-sidebar:not(.sidebar-visible) {
    width: var(--page-sidebar-collapsed-width);
  }
}

/* Enhanced tablet and mobile responsive design */
@media (max-width: 768px) {
  .app-header {
    padding: clamp(var(--spacing-xs), 2vw, var(--spacing-sm)); /* Fluid header padding */
  }
  
  .page-content {
    padding: clamp(var(--spacing-sm), 3vw, var(--spacing-md)); /* Fluid content padding */
  }
  
  .footer-content {
    flex-direction: column;
    gap: clamp(var(--spacing-xs), 2vw, var(--spacing-sm)); /* Fluid footer gaps */
    text-align: center;
  }
}

/* ===== THEME SUPPORT ===== */
/* Dark theme overrides - support data-theme on this element or on ancestors */
.unified-app[data-theme="dark"],
:root[data-theme="dark"] .unified-app,
html[data-theme="dark"] .unified-app,
body[data-theme="dark"] .unified-app {
  background: var(--surface-base); /* Use design system variable */
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
  background: var(--glass-surface-elevated); /* Use design system variable */
  border-color: var(--border-base); /* Use design system variable */
}

.unified-app[data-theme="dark"] .page-content,
:root[data-theme="dark"] .page-content,
html[data-theme="dark"] .page-content,
body[data-theme="dark"] .page-content {
  background: var(--surface-base); /* Use design system variable */
}

.unified-app[data-theme="dark"] .hamburger-icon span,
:root[data-theme="dark"] .hamburger-icon span,
html[data-theme="dark"] .hamburger-icon span,
body[data-theme="dark"] .hamburger-icon span {
  background: var(--text-primary); /* Use design system variable */
}

/* Gaming theme enhancements */
.theme-gaming .app-sidebar {
  background: linear-gradient(135deg, var(--color-gaming-500-10), transparent),
              var(--glass-surface-elevated); /* Use design system variable */
  border-right-color: var(--glass-border-gaming); /* Use design system variable */
}

.theme-gaming .footer-brand i {
  color: var(--color-gaming-500); /* Use design system variable */
  filter: drop-shadow(0 0 4px var(--color-gaming-500-30));
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .app-sidebar,
  .page-transition-enter-active,
  .page-transition-leave-active {
    transition: none;
  }
}

/* High contrast support */
@media (prefers-contrast: high) {
  .app-sidebar,
  .app-header,
  .app-footer {
    border-width: 2px;
  }
  .skip-link {
    border: 2px solid var(--text-primary);
  }
}

/* Header inner layout */
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(var(--spacing-sm), 2vw, var(--spacing-lg)); /* Fluid gap */
  min-height: clamp(52px, 8vh, 64px); /* Fluid header height */
}


/* Enhanced breakpoints for larger screens */
@media (min-width: 640px) and (max-width: 1023px) {
  .app-sidebar {
    width: clamp(240px, 20vw, 280px); /* Fluid sidebar width for tablets */
  }
  
  .page-content {
    padding: clamp(var(--spacing-md), 4vw, var(--spacing-lg));
  }
}

@media (min-width: 1280px) {
  .page-content {
    padding: clamp(var(--spacing-lg), 3vw, var(--spacing-xl));
  }
  
  .header-inner {
    gap: clamp(var(--spacing-lg), 2vw, var(--spacing-xl));
  }
  
  .footer-content {
    gap: clamp(var(--spacing-lg), 2vw, var(--spacing-xl));
  }
}

/* Header actions styling */
.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .header-actions {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
}
</style>
