<template>
  <nav class="navigation-menu" :class="[{ collapsed: isCollapsed, 'ai-online': isAIOnline, 'ai-offline': !isAIOnline }, densityClass]" aria-label="Sidebar navigation">
    <!-- Enhanced Brand Section with better visual hierarchy -->
    <div class="nav-brand glass-strong p-4 rounded-lg">
      <router-link to="/" class="brand-link" aria-label="Navigate to NAVI home">
        <!-- Brand logo switches automatically between light/dark -->
        <AppLogo class="brand-logo" alt-text="NAVI" />
        <transition name="brand-text-fade" mode="out-in">
          <div v-if="!isCollapsed" class="brand-text">
            <span class="brand-name">NAVI</span>
            <span class="brand-subtitle">{{ connectionStatus === 'connected' ? 'AI Career Assistant' : 'Career Assistant' }}</span>
            <div class="brand-status" :class="`status-${connectionStatus}`">
              <div class="status-dot"></div>
              <span class="status-text">{{ connectionText }}</span>
            </div>
            <!-- Hide duplicate AI model badge in brand area to reduce redundancy -->
            <Tooltip v-if="false && selectedModelDisplay && connectionStatus === 'connected'" text="" position="right" :dark="isDark">
              <template #content>
                <div class="rich">
                  <span class="tooltip-title">{{ selectedModelDisplay }}</span>
                  <div class="badges">
                    <span v-for="cap in modelCapabilityBadges" :key="cap" class="cap-badge">{{ cap }}</span>
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
                <AppIcon name="mdi-cog-outline" size="inherit" class="model-gear" aria-hidden="true" />
              </div>
            </Tooltip>
          </div>
        </transition>
      </router-link>
      
      <div class="nav-controls flex items-center gap-2 p-2" :class="{ collapsed: isCollapsed }">
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
            :icon="density === 'compact' ? 'mdi-format-line-weight' : 'mdi-format-line-spacing'"
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
            :icon="isCollapsed ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
            :icon-only="true"
            :bare="true"
            :ripple="false"
            class="nav-control-btn collapse-toggle"
            :aria-label="isCollapsed ? 'Expand navigation' : 'Collapse navigation'"
            :title="isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'"
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
          <div class="theme-mode-badge" role="status" aria-live="polite">System</div>
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
      <div v-if="!isCollapsed" class="footer-content redesigned" aria-label="Navigation footer">
        <div class="footer-row">
          <!-- Model + version -->
          <div class="footer-model" aria-label="AI model and version">
            <Tooltip text="" position="right" :dark="isDark">
              <template #content>
                <div class="rich">
                  <span class="tooltip-title">{{ selectedModelDisplay }}</span>
                  <div class="badges">
                    <span v-for="cap in modelCapabilityBadges" :key="cap" class="cap-badge">{{ cap }}</span>
                  </div>
                  <div class="tooltip-footer"><AppIcon name="mdi-cog-outline" /> Configure AI</div>
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
                <span class="model-name" :title="selectedModelDisplay">{{ selectedModelDisplay }}</span>
                <AppIcon name="mdi-cog-outline" size="inherit" class="model-gear" aria-hidden="true" />
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
              <div class="progress-bar" :style="{ width: profilePct + '%' }"></div>
            </div>
            <span class="progress-label">Profile {{ profilePct }}%</span>
          </div>
        </div>
      </div>

      <!-- Collapsed footer: minimal classes (no icon-pill/pill/glass-pill) -->
      <div class="footer-collapsed redesigned" aria-label="Navigation footer (collapsed)">
        <!-- Version chip removed; page footer shows version -->
      </div>
    </div>
  </nav>
  
  <!-- Global Search Overlay -->
  <Teleport to="body">
    <div v-if="searchOverlayOpen" class="nav-search-overlay" @keydown.esc.prevent.stop="closeSearchOverlay" @click.self="closeSearchOverlay">
      <div class="nav-search-dialog glass-card section-card" role="dialog" aria-modal="true" aria-label="Global search">
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
          <button v-if="quickFilter" class="clear-btn" aria-label="Clear search" @click="quickFilter = ''">
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
            <AppIcon :name="res.icon?.replace('mdi ', '') || 'mdi-menu-right'" size="inherit" />
            <div class="res-main">
              <div class="res-title">{{ res.title }}</div>
              <div class="res-desc">{{ res.description }}</div>
            </div>
          </button>
          <div v-if="overlayResults.length === 0" class="nav-search-empty">No matches</div>
        </div>
      </div>
    </div>
  </Teleport>
  <Teleport to="body">
    <GamificationModal v-if="showGamifyModal" @close="showGamifyModal = false" />
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
// import { useEnhancedNavigation } from '@/composables/useEnhancedNavigation' // Temporarily removed
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import NavigationItem from './NavigationItem.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppLogo from '@/components/AppLogo.vue'
import { getMdiAlias } from '@/utils/iconAliases'
import Tooltip from '@/components/Tooltip.vue'
import GamificationModal from '@/components/GamificationModal.vue'
import GamificationService from '@/utils/gamification'

// Props
defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

// Emits
// Include 'show-help' to allow parent listeners without Vue extraneous-event warnings
const emit = defineEmits(['toggle-collapse', 'navigate', 'show-help'])

// Composables
const route = useRoute()
const router = useRouter()
const store = useAppStore()
const theme = useUnifiedTheme()

// Defensive computed wrappers so template never crashes if theme is unavailable
const themeIcon = computed(() => {
  try {
    const mode = theme?.colorScheme?.value || 'system'
    // Use MDI icons for consistency
    return mode === 'light' ? 'mdi-weather-sunny' : mode === 'dark' ? 'mdi-weather-night' : 'mdi-monitor'
  } catch { return 'mdi-monitor' }
})
const themeDisplayName = computed(() => {
  try { return theme?.getThemeDisplayName?.() || 'System' } catch { return 'System' }
})
const isSystem = computed(() => {
  try { return Boolean(theme?.isSystem?.value) } catch { return false }
})
const isDark = computed(() => {
  try { return Boolean(theme?.isDark?.value) } catch { return false }
})
const cycleTheme = () => { try { theme?.cycleTheme?.() } catch {} }

// Gamification state
const showGamifyModal = ref(false)
const g = new GamificationService(store)
const achievementsCount = computed(() => {
  try { return Array.isArray(store.user?.achievements) ? store.user.achievements.length : 0 } catch { return 0 }
})
const userLevel = computed(() => {
  try { return g.getLevelInfo(store.user?.xp || 0) } catch { return { level: 1, title: 'Rookie', currentXP: 0, xpForNext: 0 } }
})

// Simple keyboard navigation handler
const handleNavKeydown = (event) => {
  // Basic keyboard navigation support
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    // Handle focus navigation
  }
}

// Search state
const searchOverlayOpen = ref(false)
const overlaySearchRef = ref(null)

// (accordion removed)

// Toggle search visibility
const toggleSearch = () => {
  searchOverlayOpen.value = true
  // Autofocus after mount
  setTimeout(() => {
    try { overlaySearchRef.value?.focus?.() } catch {}
  }, 0)
}

const closeSearchOverlay = () => {
  searchOverlayOpen.value = false
}

// (no accordion toggles)

// App version from package.json or store
const appVersion = computed(() => store.meta?.version || '2.0.0')

// Enhanced connection status based on actual app state
const connectionStatus = computed(() => {
  if (!store.isOnline) return 'disconnected'
  if (store.settings?.geminiApiKey && store.aiStatus?.initialized) return 'connected'
  if (store.loading?.ai) return 'pending'
  return 'disconnected'
})

const connectionText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return 'Connected'
    case 'disconnected': return 'Offline'
    case 'pending': return 'Connecting...'
    default: return 'Unknown'
  }
})

// AI connection flag for styling (animations/highlights)
const isAIOnline = computed(() => connectionStatus.value === 'connected')

// Footer enhancements
const selectedModel = computed(() => store.settings?.selectedModel || 'gemini-2.5-flash')
const selectedModelInfo = computed(() => store.selectedModelInfo)
const selectedModelDisplay = computed(() => selectedModelInfo.value?.displayName || selectedModel.value)


const modelCapabilityBadges = computed(() => {
  const caps = selectedModelInfo.value?.capabilities || {}
  const out = []
  if (caps.multiTurn) out.push('Multi‑turn')
  if (caps.imageInput) out.push('Vision')
  if (caps.videoInput) out.push('Video')
  if (caps.audioInput || caps.audioOutput) out.push(caps.audioInput && caps.audioOutput ? 'Audio I/O' : (caps.audioInput ? 'Audio In' : 'Audio Out'))
  if (caps.realtimeChat) out.push('Real‑time')
  if (caps.liveChat) out.push('Live')
  if (caps.codeGeneration) out.push('Code')
  if (caps.jsonMode) out.push('JSON')
  if (caps.functionCalling) out.push('Functions')
  if (caps.streaming) out.push('Streaming')
  if (caps.multimodal) out.push('Multimodal')
  return out
})
const profilePct = computed(() => {
  const v = Number(store.profileCompleteness ?? 0)
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
})

// Helper methods

// Keyboard shortcuts
const handleKeydown = (event) => {
  // Handle Ctrl+B for toggle collapse
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    emit('toggle-collapse')
  }
  // Handle Ctrl+K for search toggle
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    toggleSearch()
  }
  // Handle Ctrl+T for theme toggle
  if (event.ctrlKey && event.key === 't') {
    event.preventDefault()
    cycleTheme()
  }
  // Delegate other navigation keys
  handleNavKeydown(event)
}

// Setup keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Enhanced navigation items with better organization
// Helper to alias any potentially invalid icon names
const icon = (n) => getMdiAlias(n) || n

// Main navigation items (consolidating all essential features)
const mainItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    route: '/dashboard',
    icon: icon('mdi-view-dashboard-outline'),
    description: 'Your career progress overview',
    isActive: computed(() => route.path === '/' || route.path === '/dashboard')
  },
  {
    id: 'jobs',
    title: 'Gaming Jobs',
    route: '/jobs',
    icon: icon('mdi-briefcase-search-outline'),
    description: 'Video game industry roles and studios',
    badge: 'Live',
    isActive: computed(() => route.path === '/jobs')
  },
  {
    id: 'resume',
    title: 'Documents',
    route: '/documents',
    icon: icon('mdi-file-document-multiple-outline'),
    description: 'Resume + Cover Letter builder',
    badge: 'Docs',
    isActive: computed(() => route.path === '/resume' || route.path === '/documents')
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    route: '/portfolio',
    icon: icon('mdi-briefcase-variant-outline'),
    description: 'Projects, clips, and achievements',
    isActive: computed(() => route.path.startsWith('/portfolio'))
  },
  {
    id: 'studios',
    title: 'Studios',
    route: '/studios',
    icon: icon('mdi-account-search'),
    description: 'Research culture, games, roles, intel',
    isActive: computed(() => route.path.startsWith('/studios'))
  },
  {
    id: 'interview-prep',
    title: 'Interview Prep',
    route: '/interview-prep',
    icon: icon('mdi-microphone-variant'),
    description: 'Practice interviews with AI',
    badge: 'AI',
    requiresAI: true,
    isActive: computed(() => route.path.startsWith('/interview'))
  },
  {
    id: 'skill-mapper',
    title: 'Skill Mapper',
    route: '/skills',
    icon: icon('mdi-map-marker-path'),
    description: 'Map your skills to roles',
    badge: 'AI',
    requiresAI: true,
    isActive: computed(() => route.path.startsWith('/skills'))
  },
  {
    id: 'ai-media',
    title: 'AI Media Studio',
    route: '/demo/ai-media',
    icon: icon('mdi-multimedia'),
    description: 'Live + file AI analysis',
    badge: 'Beta',
    requiresAI: true,
    isActive: computed(() => route.path === '/demo/ai-media')
  }
]

// Settings items
const settingsItems = [
  {
    id: 'settings',
    title: 'Settings',
    route: '/settings',
    icon: 'mdi-cog',
    description: 'Preferences, API keys, and configuration',
    isActive: computed(() => route.path === '/settings')
  }
]

const playgroundItems = [
  {
    id: 'cloud',
    title: 'The Cloud',
    route: '/cloud',
    icon: icon('mdi-cloud'),
    description: 'Cloud services and storage',
    isActive: computed(() => route.path === '/cloud')
  },
  {
    id: 'system',
    title: 'System',
    route: '/system',
    icon: icon('mdi-monitor-dashboard'),
    description: 'Performance and diagnostics',
    isActive: computed(() => route.path === '/system')
  },
  {
    id: 'flow',
    title: 'The Flow',
    route: '/flow',
    icon: icon('mdi-vector-polyline'),
    description: 'Career workflow automation',
    isActive: computed(() => route.path === '/flow')
  },
  {
    id: 'realtime-chat',
    title: 'AI Assistant',
    route: '/demo/realtime',
    // Ensure compatibility with current mdi set
    icon: icon('mdi-robot'),
    description: 'Real-time AI conversation',
    badge: 'Live',
    requiresAI: true,
    isActive: computed(() => route.path === '/demo/realtime')
  }
]


// (badge counts removed)

// Density state with persistence
const density = ref(localStorage.getItem('nav-density') || 'compact')
const densityClass = computed(() => `density-${density.value}`)
function toggleDensity() {
  density.value = density.value === 'compact' ? 'comfortable' : 'compact'
  try { localStorage.setItem('nav-density', density.value) } catch {}
}

// Quick filter
const quickFilter = ref('')
const filterItems = (items) => {
  const q = (quickFilter.value || '').toLowerCase().trim()
  if (!q) return items
  return items.filter(
    (it) => (it.title || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q),
  )
}
const filteredMain = computed(() => filterItems(mainItems))
const filteredSettings = computed(() => filterItems(settingsItems))
const filteredPlayground = computed(() => filterItems(playgroundItems))

function onItemNavigate(item) {
  // Re-emit for parent listeners
  emit('navigate', item)
}

// Overlay results (merge all)
const allItems = computed(() => [...mainItems, ...settingsItems, ...playgroundItems])
const overlayResults = computed(() => {
  const q = (quickFilter.value || '').toLowerCase().trim()
  if (!q) return allItems.value.slice(0, 8)
  return allItems.value.filter(it => (it.title || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q)).slice(0, 8)
})

function navigateFromOverlay(res) {
  try { router.push(res.route) } catch {}
  closeSearchOverlay()
}

function navigateToAISettings() {
  try { router.push('/settings#ai-section') } catch {}
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
  /* Icon sizing tokens for menu */
  --nav-icon-size: 22px;
  --nav-icon-font: 18px;
  background: var(--glass-surface);
  border-right: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  font-family: var(--font-primary);
  transition: all var(--duration-normal) var(--easing-ease-out);
  box-shadow: 0 0 24px color-mix(in srgb, var(--color-primary-500) 6%, transparent);
  border-top-right-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  overflow: hidden;
}

/* Collapsed state width adjustments */
.navigation-menu.collapsed {
  width: 72px;
  min-width: 72px;
  max-width: 72px;
}

.trophy-toggle-btn { position: relative; }

/* Comfortable density adjustments */
.density-comfortable .navigation-menu .nav-item-link {
  min-height: 56px;
  padding: var(--spacing-lg) var(--spacing-md);
  max-width: 100%;
  overflow-x: hidden;
}

.density-comfortable .navigation-menu .nav-brand {
  padding: var(--spacing-xl);
  max-width: 100%;
  box-sizing: border-box;
}

.density-comfortable .navigation-menu .nav-footer .footer-content {
  padding: var(--spacing-md) var(--spacing-lg);
  max-width: 100%;
  box-sizing: border-box;
}

/* Ensure comfortable density never exceeds rail width */
.density-comfortable .navigation-menu .nav-items {
  max-width: 100%;
  overflow-x: hidden;
}

/* Redesigned rail background */
.navigation-menu::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-primary-500) 35%, transparent),
    color-mix(in srgb, var(--color-secondary-500, var(--color-primary-400)) 20%, transparent)
  );
  opacity: 0.5;
}

/* Brand Section */
.nav-brand {
  display: block; /* Force stacked layout rows */
  padding: var(--spacing-lg);
  /* Increase logo size via CSS var override */
  --nav-brand-logo-size: 56px;
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
  /* Glass header treatment */
  background:
    radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--color-primary-500) 6%, transparent), transparent 40%),
    radial-gradient(120% 60% at 100% 0%, color-mix(in srgb, var(--color-cyber-500) 6%, transparent), transparent 40%),
    rgba(var(--surface-elevated-rgb), 0.92);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--text-secondary) 6%, transparent) inset;
}

/* Collapsed brand adjustments */
.navigation-menu.collapsed .nav-brand {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  --nav-brand-logo-size: 40px;
}

.navigation-menu.collapsed .brand-link {
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-brand::before {
  /* top glint line */
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary-500) 20%, transparent), transparent);
  opacity: 0.4;
  pointer-events: none;
}

.nav-brand::after {
  /* subtle bottom aura */
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-cyber-500) 16%, transparent), transparent);
  opacity: 0.25;
  pointer-events: none;
}

/* Dark theme: slightly stronger tint for glass header */
[data-theme="dark"] .nav-brand,
.dark-theme .nav-brand {
  background:
    radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--color-primary-500) 10%, transparent), transparent 40%),
    radial-gradient(120% 60% at 100% 0%, color-mix(in srgb, var(--color-cyber-500) 8%, transparent), transparent 40%),
    rgba(var(--surface-elevated-rgb), 0.92);
}

/* System mode pill */
.theme-mode-badge {
  align-self: flex-end;
  margin-top: var(--spacing-2);
  padding: 2px 8px;
  border-radius: var(--border-radius-full);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

[data-theme="dark"] .theme-mode-badge,
.dark-theme .theme-mode-badge {
  color: var(--text-secondary);
  border-color: color-mix(in srgb, var(--text-secondary) 14%, transparent);
}

.nav-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

/* Enhanced collapsed nav controls */
.navigation-menu.collapsed .nav-controls {
  padding: var(--spacing-sm);
  align-items: center;
  gap: var(--spacing-xs);
}

/* Main content region now scrolls */
.nav-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md) var(--spacing-sm) var(--spacing-lg);
}

.nav-content::-webkit-scrollbar { width: 8px; }
.nav-content::-webkit-scrollbar-track { background: transparent; }
.nav-content::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--text-secondary) 18%, transparent);
  border-radius: 999px;
}
.nav-content:hover::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--text-secondary) 28%, transparent); }

.nav-control-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  justify-content: center;
  min-width: 0;
}

/* Collapsed control buttons stack vertically */
.navigation-menu.collapsed .nav-control-buttons {
  flex-direction: column;
  width: 100%;
  gap: var(--spacing-xs);
}

.nav-control-btn {
  flex-shrink: 0;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  border-radius: var(--radius-md) !important;
  transition: all var(--duration-fast) var(--easing-ease-out);
  position: relative;
  overflow: hidden;
}

.nav-control-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  background: var(--surface-elevated) !important;
}

.nav-control-btn:active {
  transform: translateY(0);
}

.nav-control-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-500) 40%, transparent);
}

.nav-control-btn :deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
}

.nav-control-btn :deep(i) {
  font-size: 16px !important;
  margin: 0 !important;
  color: var(--text-secondary);
  transition: color var(--duration-fast) var(--easing-ease-out);
}

.nav-control-btn:hover :deep(i) {
  color: var(--text-primary);
}

/* Specific button styling using unified design system */
.search-toggle-btn:hover {
  /* Replace undefined alpha tokens with color-mix using design tokens */
  background: color-mix(in srgb, var(--color-primary-500) 12%, transparent) !important;
}

.search-toggle-btn:hover :deep(i) {
  color: var(--color-primary-500);
}

.theme-toggle-btn:hover {
  background: color-mix(in srgb, var(--color-gaming-500) 12%, transparent) !important;
}

.theme-toggle-btn:hover :deep(i) {
  color: var(--color-gaming-500);
}

.settings-btn:hover {
  background: color-mix(in srgb, var(--color-gray-500) 12%, transparent) !important;
}

.settings-btn:hover :deep(i) {
  color: var(--color-neutral-600);
}

.collapse-toggle:hover {
  background: color-mix(in srgb, var(--color-cyber-500) 12%, transparent) !important;
}

.collapse-toggle:hover :deep(i) {
  color: var(--color-cyber-500);
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
  transform: translateY(-1px);
  color: var(--color-primary-500);
}

:deep(.brand-logo) {
  width: var(--nav-brand-logo-size) !important;
  height: var(--nav-brand-logo-size) !important;
  /* Transparent to let SVG logo render cleanly across themes */
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  position: relative;
  overflow: hidden;
}

:deep(.brand-logo)::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.brand-link:hover :deep(.brand-logo)::before {
  transform: translateX(100%);
}

.brand-text {
  display: flex;
  flex-direction: column;
  opacity: 1;
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.brand-text .brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.brand-text .brand-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.collapsed .brand-text {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-12px);
  transition: all var(--duration-fast) var(--easing-ease-out);
  width: 0;
  overflow: hidden;
}

/* Enhanced collapsed state for all text elements */
.collapsed .section-title,
.collapsed .nav-item-content,
.collapsed .nav-footer-text {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-12px);
  transition: all var(--duration-fast) var(--easing-ease-out);
  width: 0;
  overflow: hidden;
}

/* Enhanced collapsed state for controls */
.nav-controls.collapsed {
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.nav-controls.collapsed .nav-control-buttons {
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: var(--spacing-xs);
}

/* Quick filter and control rows */
.nav-controls {
  display: grid;
  grid-template-rows: auto auto;
  row-gap: var(--spacing-sm);
}

.quick-filter-dock {
  display: flex;
  align-items: center;
}

.nav-control-buttons { display: flex }

/* Search overlay */
.nav-search-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay, 40);
  background: var(--surface-overlay);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.nav-search-dialog {
  width: min(720px, calc(100vw - 2rem));
  padding: var(--spacing-lg);
}

.nav-search-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.nav-search-input input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.nav-search-input .clear-btn {
  background: transparent;
  border: 0;
  color: var(--text-secondary);
  cursor: pointer;
}

.nav-search-hint {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.nav-search-hint kbd {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
}

/* Search overlay results */
.nav-search-results { margin-top: var(--spacing-md); display: grid; gap: var(--spacing-sm) }
.nav-search-result { display: flex; align-items: center; gap: var(--spacing-sm); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--spacing-sm) var(--spacing-md); text-align: left }
.nav-search-result:hover { background: var(--glass-hover-bg) }
.nav-search-result .res-title { font-weight: 600; color: var(--text-primary) }
.nav-search-result .res-desc { font-size: 0.8rem; color: var(--text-secondary) }
.nav-search-empty { text-align: center; color: var(--text-secondary); padding: var(--spacing-sm) }

/* Enhanced section headers for collapsed state */
.nav-section-header.collapsed {
  justify-content: center;
  padding: clamp(6px, 1.2vh, 10px) clamp(4px, 0.8vw, 8px);
  margin: var(--spacing-xs) 0;
}

.nav-section-header.collapsed .section-title,
.nav-section-header.collapsed .section-indicator,
.nav-section-header.collapsed .section-badge {
  opacity: 0;
  pointer-events: none;
  width: 0;
  overflow: hidden;
  transition: all var(--duration-fast);
}

/* Enhanced hover expansion reveal */
.navigation-menu.collapsed:hover .brand-text,
.navigation-menu.collapsed:hover .section-title,
.navigation-menu.collapsed:hover .nav-item-content,
.navigation-menu.collapsed:hover .nav-footer-text {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
  width: auto;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.navigation-menu.collapsed:hover .nav-section-header.collapsed .section-title,
.navigation-menu.collapsed:hover .nav-section-header.collapsed .section-indicator,
.navigation-menu.collapsed:hover .nav-section-header.collapsed .section-badge {
  opacity: 1;
  pointer-events: auto;
  width: auto;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.brand-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
  transition: color var(--duration-normal) var(--easing-ease-out);
}

.brand-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1;
  margin-top: var(--spacing-xs);
  transition: color var(--duration-normal) var(--easing-ease-out);
}

/* Model badge under brand text */
.model-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; color: var(--text-secondary); font-size: 0.8rem; }
.model-badge .model-text { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.model-badge[role="button"] { cursor: pointer; padding: 2px 6px; border-radius: 999px; border: 1px solid transparent; }
.model-badge[role="button"]:hover { background: var(--glass-bg); border-color: var(--glass-border); }
.model-badge[role="button"]:focus-visible { outline: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-500) 40%, transparent); }
.model-badge .model-gear { opacity: 0.7; font-size: 14px; }
.model-badge[role="button"]:hover .model-gear { opacity: 1; }

.collapse-toggle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-md);
}

/* Main Navigation Content */
.nav-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md) 0;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

/* Enhanced scrollbar styling */
.nav-content::-webkit-scrollbar {
  width: 4px;
}

.nav-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 2px;
}

.nav-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
  transition: background var(--duration-fast);
}

.nav-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-400);
}

/* Enhanced collapsed content behavior */
.collapsed .nav-content {
  padding: var(--spacing-sm) 0;
}

/* Smooth reveal animation for expanding sidebar */
.navigation-menu:not(.collapsed) .nav-content {
  animation: contentReveal var(--duration-normal) var(--easing-ease-out);
}

@keyframes contentReveal {
  from {
    opacity: 0.8;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Navigation Sections */
.nav-section {
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-sm);
}

/* Accordion Sections */
.accordion-section .nav-section-header.clickable {
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
  margin: 0 var(--spacing-sm);
}

.accordion-section .nav-section-header.clickable:hover {
  background: var(--surface-elevated);
  transform: translateY(-1px);
}

.accordion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: transform var(--transition-fast);
}

.accordion-toggle i.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-normal) var(--easing-ease-out);
}

.accordion-content.expanded {
  max-height: 300px; /* Adjust based on expected content height */
}

.accordion-content.collapsed {
  max-height: none;
  overflow: visible;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(8px, 1.2vh, 12px) clamp(10px, 1.8vw, 16px);
  margin-bottom: var(--spacing-sm);
}

.section-title {
  font-size: clamp(0.7rem, 1.8vw, 0.85rem);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Improve section header contrast on both themes */
.nav-section-header {
  background: var(--glass-bg);
  border: 1px solid var(--border-glass);
  border-radius: var(--border-radius-lg);
}

[data-theme="dark"] .nav-section-header,
.dark-theme .nav-section-header {
  background: color-mix(in srgb, var(--surface-elevated) 40%, transparent);
  border-color: var(--border-glass);
}

/* Quick filter removed from header per request */

/* Density variants */
.density-compact .nav-item-link { padding: 8px 10px; min-height: 40px; gap: 10px; }
.density-compact .nav-items { gap: 6px; }
.density-compact .section-title { letter-spacing: 0.04em; }
.density-compact .nav-control-buttons { gap: 4px; }

.section-icon.with-badge { position: relative; }
.section-count-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--color-primary-500);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px var(--surface-glass);
  transition: transform var(--duration-fast) var(--easing-ease-out), box-shadow var(--duration-fast);
  animation: badgePop 420ms var(--easing-ease-out) 1;
}

.section-icon.with-badge:hover .section-count-badge {
  transform: scale(1.12);
  box-shadow: 0 0 0 2px var(--surface-elevated), 0 0 12px rgba(var(--color-primary-500-rgb), 0.25);
}

/* Programmatic re-pop trigger */
.section-count-badge.badge-repop {
  animation: badgePop 420ms var(--easing-ease-out) 1;
}

@keyframes badgePop {
  0% { transform: scale(0.8); opacity: 0.6; }
  60% { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Local section-badge replaced by unified alias */

.nav-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-sm);
  background: var(--glass-surface);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

/* Keep class names, adjust layout to fit and center */
.nav-items.nav-items-flat {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  align-items: stretch;
  text-align: left;
  font-size: clamp(12px, 1.6vw, 14px);
  border: none;
  border-radius: 0;
  background: transparent;
}

/* Enhanced collapsed nav items */
.collapsed .nav-items {
  padding: 0;
  align-items: center;
  gap: var(--spacing-sm);
  background: transparent;
  border-color: transparent;
}

/* Enhanced section styling for collapsed state */
.collapsed .nav-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Tooltip positioning helper for collapsed items */
.collapsed .nav-section::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 0;
  width: 1px;
  height: 100%;
  pointer-events: none;
}

/* Footer */
.nav-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-subtle);
  background: rgba(var(--surface-elevated-rgb, 255,255,255), 0.6);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  margin-top: auto;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.nav-footer .footer-content.redesigned {
  /* Responsive grid to align and scale footer content cleanly */
  display: grid;
  grid-template-columns: 1fr; /* stack by default */
  gap: var(--spacing-sm);
  width: 100%;
  box-sizing: border-box;
}

.nav-footer .footer-row {
  /* First row: status (grow) + model/version (auto) */
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Ensure the second row (progress) spans full width */
.nav-footer .footer-content.redesigned > .footer-row:last-child {
  grid-template-columns: 1fr;
}

/* New glasmorphic status chip */
.nav-footer .footer-glass-status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 6px 10px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary-500) 8%, transparent) 0%,
    color-mix(in srgb, var(--color-cyber-500, var(--color-secondary-500)) 6%, transparent) 100%
  );
  border: 1px solid var(--glass-border);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

/* Prevent overflow and allow ellipsis where needed */
.nav-footer .footer-glass-status,
.nav-footer .footer-model,
.nav-footer .footer-progress {
  min-width: 0;
}

.nav-footer .footer-glass-status .fgs-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-gray-300);
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
}
.nav-footer .footer-glass-status .fgs-dot.connected { background: var(--color-success-500, var(--color-success)); }
.nav-footer .footer-glass-status .fgs-dot.disconnected { background: var(--color-danger-500, var(--color-danger)); }
.nav-footer .footer-glass-status .fgs-dot.pending { background: var(--color-warning-500, var(--color-warning)); }

.nav-footer .footer-glass-status .fgs-text { display: inline-flex; align-items: center; gap: 8px; }
.nav-footer .footer-glass-status .fgs-label { font-size: 0.8rem; color: var(--text-primary); }
.nav-footer .footer-glass-status .fgs-env {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.45);
}

.nav-footer .status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-gray-300);
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
}

.nav-footer .status-dot.connected { background: var(--color-success); }
.nav-footer .status-dot.disconnected { background: var(--color-danger); }
.nav-footer .status-dot.pending { background: var(--color-warning); }

.nav-footer .status-label { font-size: 0.8rem; color: var(--text-secondary); }

.nav-footer .env-chip,
.nav-footer .version-chip {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.45);
  backdrop-filter: blur(10px);
}

.nav-footer .footer-model { display: flex; align-items: center; gap: var(--spacing-xs); justify-self: end; }
.nav-footer .model-name { font-size: 0.85rem; color: var(--text-primary); max-width: clamp(120px, 18vw, 220px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nav-footer .footer-progress { display: flex; align-items: center; gap: var(--spacing-sm); min-width: 0; }
.nav-footer .progress-track { position: relative; flex: 1; height: 8px; background: var(--surface-elevated); border-radius: 999px; overflow: hidden; border: 1px solid var(--border-subtle); }
.nav-footer .progress-bar { position: absolute; inset: 0 auto 0 0; height: 100%; background: linear-gradient(90deg, var(--color-primary-400), var(--color-secondary-400)); box-shadow: var(--shadow-xs); }
.nav-footer .progress-label { font-size: 0.75rem; color: var(--text-secondary); }

.nav-footer .footer-actions { display: flex; align-items: center; gap: var(--spacing-xs); }
.nav-footer .footer-actions :deep(button),
.nav-footer .footer-actions :deep(a) {
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.5);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}
.nav-footer .footer-actions :deep(button:hover),
.nav-footer .footer-actions :deep(a:hover) {
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.65);
}

/* Enhanced collapsed footer */
.nav-footer.collapsed {
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--surface-elevated-rgb, 255,255,255), 0.55);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  gap: var(--spacing-xs);
}

.nav-footer.collapsed .footer-info,
.nav-footer.collapsed .footer-version,
.nav-footer.collapsed .footer-links {
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.nav-footer .footer-collapsed.redesigned {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  max-width: 360px;
  width: 100%;
  margin: 0 auto;
}

/* Minimal collapsed footer controls */
.nav-footer .footer-collapsed .footer-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.5);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}
.nav-footer .footer-collapsed .footer-btn:hover { background: rgba(var(--surface-glass-rgb, 255,255,255), 0.65); }

.nav-footer .footer-collapsed .footer-status {
  width: 14px; height: 14px; border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: var(--surface-elevated);
}
.nav-footer .footer-collapsed .footer-status[data-status="connected"] { background: var(--color-success); }
.nav-footer .footer-collapsed .footer-status[data-status="disconnected"] { background: var(--color-danger); }
.nav-footer .footer-collapsed .footer-status[data-status="pending"] { background: var(--color-warning); }

.nav-footer .footer-collapsed .footer-version {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 40px; height: 28px; padding: 0 8px; border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(var(--surface-glass-rgb, 255,255,255), 0.5);
}
.nav-footer .footer-collapsed .version-text { font-size: 0.72rem; color: var(--text-primary); font-weight: 600; letter-spacing: .2px; }

.footer-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-version {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-secondary);
}



@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Search container styling */
.nav-search-container {
  width: 100%;
  margin-top: var(--spacing-sm);
  opacity: 1;
  transform: translateY(0);
  transition: all var(--transition-normal) var(--easing-ease-out);
}

.nav-search-container.hidden {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

/* === ENHANCED THEME SUPPORT === */
/* Dark Theme Styles */
[data-theme="dark"] .navigation-menu,
.dark-theme .navigation-menu {
  background: var(--glass-elevated);
  border-right-color: var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur) var(--glass-backdrop-saturate);
}

/* Dark theme button styling using unified design system */
[data-theme="dark"] .nav-control-btn:hover,
.dark-theme .nav-control-btn:hover {
  /* Use glass hover bg from design system; no separate -dark variable */
  background: var(--glass-hover-bg) !important;
  box-shadow: var(--shadow-sm-dark);
}

[data-theme="dark"] .search-toggle-btn:hover,
.dark-theme .search-toggle-btn:hover {
  background: color-mix(in srgb, var(--color-primary-500) 20%, transparent) !important;
}

[data-theme="dark"] .theme-toggle-btn:hover,
.dark-theme .theme-toggle-btn:hover {
  background: color-mix(in srgb, var(--color-gaming-500) 20%, transparent) !important;
}

[data-theme="dark"] .settings-btn:hover,
.dark-theme .settings-btn:hover {
  background: color-mix(in srgb, var(--color-gray-500) 20%, transparent) !important;
}

[data-theme="dark"] .collapse-toggle:hover,
.dark-theme .collapse-toggle:hover {
  background: color-mix(in srgb, var(--color-cyber-500) 20%, transparent) !important;
}

[data-theme="dark"] .nav-brand,
.dark-theme .nav-brand {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .brand-name,
.dark-theme .brand-name {
  color: var(--text-primary);
}

[data-theme="dark"] .section-title,
.dark-theme .section-title {
  color: var(--text-secondary);
  opacity: 0.9;
}

[data-theme="dark"] .nav-footer,
.dark-theme .nav-footer {
  background: rgba(15, 15, 15, 0.8);
  border-top-color: rgba(255, 255, 255, 0.08);
}

/* System theme preference support */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .navigation-menu {
    background: rgba(15, 15, 15, 0.95);
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  :root:not([data-theme="light"]) .brand-name {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-gaming-500), var(--color-cyber-500));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: brightness(1.1);
  }
}

/* Enhanced hover and interaction states */
.navigation-menu:hover {
  box-shadow: var(--shadow-lg);
  border-right-color: var(--border-emphasis);
}

.navigation-menu::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, 
    transparent,
    var(--color-primary-200),
    var(--color-secondary-200),
    transparent
  );
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.navigation-menu:hover::after {
  opacity: 0.5;
}

/* Gaming theme enhancements for navigation */
.theme-gaming .navigation-menu {
  background: radial-gradient(ellipse at top, rgba(0, 255, 136, 0.02), transparent),
              var(--glass-surface-elevated);
}

.theme-gaming .brand-logo .logo-inner {
  background: linear-gradient(135deg, var(--color-gaming-500), var(--color-cyber-500));
}

.theme-gaming .section-icon {
  color: var(--color-gaming-400);
}

.theme-gaming .ai-glow {
  background: radial-gradient(circle, rgba(0, 255, 136, 0.15), transparent);
}

.theme-gaming .brand-status.status-connected .status-dot {
  background: var(--color-gaming-500);
}

/* Focus states for better accessibility */
.navigation-menu:focus-within {
  outline: 2px solid var(--color-primary-400);
  outline-offset: -2px;
}

.collapse-toggle:focus,
.brand-link:focus {
  outline: 2px solid var(--color-primary-400);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}

/* Loading states */
.nav-section[data-loading="true"] .section-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Accessibility improvements */
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

/* High contrast mode */
@media (prefers-contrast: high) {
  .navigation-menu {
    border-right: 2px solid var(--text-primary);
  }

  .nav-section::before {
    opacity: 1;
    height: 2px;
  }

  .brand-name {
    -webkit-text-fill-color: var(--text-primary);
  }
}

[data-theme="dark"] .navigation-menu:hover,
.dark-theme .navigation-menu:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.05);
}

/* Brand logo enhancements */
:deep(.brand-logo):hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow-primary);
}

[data-theme="dark"] :deep(.brand-logo):hover,
.dark-theme :deep(.brand-logo):hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

/* Navigation item hover effects */
.nav-items .nav-item:hover {
  transform: translateX(4px);
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
}

[data-theme="dark"] .nav-items .nav-item:hover,
.dark-theme .nav-items .nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .navigation-menu {
    width: 100%;
    max-width: 280px;
  }
  
  .navigation-menu.collapsed {
    width: 64px;
    min-width: 64px;
    max-width: 64px;
  }
  
  /* Smaller buttons on mobile */
  .navigation-menu.collapsed .nav-control-btn {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
  }
  
  /* Smaller logo on mobile collapsed */
  .navigation-menu.collapsed .nav-brand {
    --nav-brand-logo-size: 32px;
    padding: var(--spacing-sm);
  }
}

/* Responsive tweaks: stack everything neatly on narrow widths */
@media (max-width: 520px) {
  .nav-footer .footer-row {
    grid-template-columns: 1fr;
  }
  .nav-footer .footer-model { justify-self: start; }
  .nav-footer .progress-label { white-space: nowrap; }
}
</style>
