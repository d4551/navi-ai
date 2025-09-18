<template>
  <div
    class="standard-page-layout"
    :class="layoutClasses"
    :data-page-type="finalPageType"
  >
    <!-- Unified Dashboard Header -->
    <UnifiedDashboardHeader
      v-if="!hideHeader"
      :variant="headerVariant"
      :page-title="finalTitle"
      :page-subtitle="finalSubtitle"
      :page-icon="finalTitleIcon"
      :breadcrumbs="breadcrumbs"
      @search="handleSearch"
      @voice-command="handleVoiceCommand"
      @ai-assistant="handleAIAssistant"
      @notifications="handleNotifications"
      @logout="handleLogout"
    >
      <template #pageActions>
        <slot name="header-actions" />
      </template>
    </UnifiedDashboardHeader>

    <!-- Page Content -->
    <main class="page-main-content" :class="contentClasses">
      <div class="page-content-container">
        <slot />
      </div>
    </main>

    <!-- Page Footer Actions -->
    <footer v-if="$slots['footer-actions']" class="page-footer-actions">
      <slot name="footer-actions" />
    </footer>

    <!-- Global page-aware assistant modal moved inside root to ensure single-element root for transitions -->
    <FairyChatModal
      v-model:open="assistantOpen"
      :messages="assistantMessages"
      size="xl"
      @send="handleAssistantSend"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  resolveHeaderFromRoute,
  getPageHeaderByRouteName,
} from '@/components/layout/pageHeaders'
import UnifiedDashboardHeader from '@/components/layout/UnifiedDashboardHeader.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import FairyChatModal from '@/components/FairyChatModal.vue'
import { usePageAssistantContext } from '@/composables/usePageAssistantContext'

interface HeroStat {
  label: string
  icon?: string
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
}

interface StatusBadge {
  text: string
  icon?: string
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
}

interface Breadcrumb {
  label: string
  to?: string
}

interface Props {
  title?: string
  subtitle?: string
  titleIcon?: string
  titleIconColor?: string
  pageType?: 'default' | 'hero' | 'dashboard' | 'form' | 'gaming' | 'noir'
  hideHeader?: boolean
  statusBadge?: StatusBadge
  heroStats?: HeroStat[]
  headerAlignment?: 'left' | 'center' | 'right'
  contentSpacing?: 'none' | 'compact' | 'normal' | 'comfortable'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  breadcrumbs?: Breadcrumb[]
  // Automatic header resolution
  configKey?: string
  autoResolveHeader?: boolean
  headerContext?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  pageType: 'default',
  hideHeader: false,
  headerAlignment: 'left',
  contentSpacing: 'normal',
  maxWidth: 'full',
  titleIconColor: 'primary',
  autoResolveHeader: true,
  configKey: '',
  breadcrumbs: () => [],
})

const route = useRoute()
const router = useRouter()

// Resolve header config either by explicit configKey or by current route
const resolvedHeader = computed(() => {
  if (!props.autoResolveHeader) return undefined
  if (props.configKey) {
    return getPageHeaderByRouteName(props.configKey)
  }
  return resolveHeaderFromRoute(route, props.headerContext)
})

const finalTitle = computed(
  () => props.title || resolvedHeader.value?.title || ''
)
const finalSubtitle = computed(
  () => props.subtitle || resolvedHeader.value?.subtitle || ''
)
const finalTitleIcon = computed(
  () => props.titleIcon || resolvedHeader.value?.titleIcon || ''
)
const finalHeroStats = computed<HeroStat[]>(() => {
  if (props.heroStats && props.heroStats.length) return props.heroStats
  const stats = resolvedHeader.value?.heroStats
    ? resolvedHeader.value.heroStats?.(props.headerContext)
    : []
  return (stats || []) as HeroStat[]
})

const layoutClasses = computed(() => [
  `page-type-${finalPageType.value}`,
  `header-align-${finalHeaderAlignment.value}`,
  `content-spacing-${props.contentSpacing}`,
  `max-width-${props.maxWidth}`,
])

const headerClasses = computed(() => [
  `header-${finalHeaderAlignment.value}`,
  finalPageType.value === 'hero' ? 'hero-header' : '',
  finalPageType.value === 'gaming' ? 'gaming-header' : '',
  finalPageType.value === 'noir' ? 'noir-header' : '',
])

const titleClasses = computed(() => [
  finalPageType.value === 'hero' ? 'hero-title' : '',
  finalPageType.value === 'gaming' ? 'gaming-title' : '',
  finalPageType.value === 'noir' ? 'noir-title' : '',
])

const subtitleClasses = computed(() => [
  finalPageType.value === 'hero' ? 'hero-subtitle' : '',
  finalPageType.value === 'gaming' ? 'gaming-subtitle' : '',
  finalPageType.value === 'noir' ? 'noir-subtitle' : '',
])

const contentClasses = computed(() => [
  `spacing-${props.contentSpacing}`,
  `width-${props.maxWidth}`,
])

// Config-derived variants
const finalPageType = computed(
  () => props.pageType || resolvedHeader.value?.pageType || 'default'
)
const finalHeaderAlignment = computed(
  () => props.headerAlignment || resolvedHeader.value?.headerAlignment || 'left'
)
const headerVariant = computed(() => {
  switch (finalPageType.value) {
    case 'gaming':
      return 'gaming'
    case 'dashboard':
      return 'default'
    case 'form':
      return 'compact'
    default:
      return 'default'
  }
})

// Event handlers for UnifiedDashboardHeader
const handleSearch = (query: string) => {
  // Implement global search
  console.log('Search:', query)
}

const handleVoiceCommand = () => {
  // Implement voice commands
  console.log('Voice command activated')
}

const handleAIAssistant = () => {
  openAssistant()
}

const handleNotifications = () => {
  // Implement notifications
  console.log('Notifications toggled')
}

const handleLogout = () => {
  // Implement logout
  router.push('/login')
}

// ===== Page-aware Assistant Integration =====
const assistantOpen = ref(false)
const assistantMessages = ref<
  Array<{
    id: string
    type: 'ai' | 'user' | 'system'
    content: string
    timestamp: number
  }>
>([])
const { buildContextString } = usePageAssistantContext()

function buildPageContextMessage() {
  return buildContextString({
    title: finalTitle.value,
    subtitle: finalSubtitle.value,
  })
}

function seedAssistantMessages() {
  const now = Date.now()
  assistantMessages.value = [
    {
      id: 'ai-greet-' + now,
      type: 'ai',
      content: "Hi! I'm NAVI. I can help with this page — what do you need?",
      timestamp: now,
    },
    {
      id: 'sys-ctx-' + (now + 1),
      type: 'system',
      content: buildPageContextMessage(),
      timestamp: now + 1,
    },
  ]
}

function openAssistant() {
  if (!assistantMessages.value.length) seedAssistantMessages()
  assistantOpen.value = true
}

function handleAssistantSend(text: string) {
  const now = Date.now()
  assistantMessages.value.push({
    id: 'u-' + now,
    type: 'user',
    content: text,
    timestamp: now,
  })
  // Optional lightweight echo to confirm context
  setTimeout(() => {
    assistantMessages.value.push({
      id: 'a-' + (now + 1),
      type: 'ai',
      content: 'Thanks! I will use the current page context to help.',
      timestamp: now + 1,
    })
  }, 400)
}

// Refresh context message when route changes
watch(
  () => route.fullPath,
  () => {
    if (!assistantOpen.value) {
      // Re-seed so next open reflects the new page
      assistantMessages.value = []
    }
  }
)

// Auto-generate breadcrumbs from route if not provided
const breadcrumbs = computed(() => {
  if (props.breadcrumbs?.length) return props.breadcrumbs

  const pathSegments = route.path.split('/').filter(Boolean)
  if (pathSegments.length <= 1) return []

  return pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    return {
      label,
      to: index < pathSegments.length - 1 ? path : undefined,
    }
  })
})
</script>

<style scoped>
/* ===== STANDARD PAGE LAYOUT ===== */

.standard-page-layout {
  min-height: 100vh;
  background: var(--surface-base);
  display: flex;
  flex-direction: column;
  color: var(--text-primary-600);
}

/* ===== HEADER SECTION ===== */

.page-header-section {
  background: var(--glass-bg);
  border-b: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-2xl);
  margin: var(--spacing-4) var(--spacing-4) var(--spacing-6);
  padding: var(--spacing-8);
  position: relative;
}

.page-header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary-subtle);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
}

.page-header-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Header Alignment Variants */
.header-center .page-header-content {
  text-align: center;
  align-items: center;
}

.header-right .page-header-content {
  text-align: right;
  align-items: flex-end;
}

/* Status Badge */
.status-badge-container {
  display: flex;
  justify-content: flex-start;
}

.header-center .status-badge-container {
  justify-content: center;
}

.header-right .status-badge-container {
  justify-content: flex-end;
}

.status-badge {
  font-family: var(--font-mono);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wider);
}

/* Page Title Section */
.page-title-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.title-icon {
  font-size: var(--font-size-4xl);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.header-center .header-actions {
  justify-content: center;
}

.header-right .header-actions {
  justify-content: flex-end;
}

/* Hero Stats */
.hero-stats {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.header-center .hero-stats {
  justify-content: center;
}

.header-right .hero-stats {
  justify-content: flex-end;
}

.hero-stat-chip {
  font-weight: var(--font-weight-medium);
}

/* ===== PAGE TYPE VARIANTS ===== */

/* Hero Page Type */
.page-type-hero .page-header-section {
  text-align: center;
  background: var(--gradient-primary-subtle);
  border: 2px solid var(--color-primary-200);
}

.page-type-hero .hero-title {
  font-size: var(--font-size-4xl);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-type-hero .hero-subtitle {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
}

/* Gaming Page Type */
.page-type-gaming {
  background: linear-gradient(
    135deg,
    var(--color-dark) 0%,
    var(--color-darker) 100%
  );
}

.page-type-gaming .gaming-header {
  background: var(--surface-gaming);
  border: 1px solid var(--color-primary-500);
  box-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
}

.page-type-gaming .gaming-title {
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  text-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.5);
}

.page-type-gaming .gaming-subtitle {
  font-family: var(--font-mono);
  color: var(--color-primary-300);
}

/* Noir Page Type */
.page-type-noir {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--surface-elevated) 98%, transparent) 0%,
    color-mix(in srgb, var(--surface-elevated) 95%, transparent) 50%,
    color-mix(in srgb, var(--surface-elevated) 98%, transparent) 100%
  );
}

.page-type-noir .noir-header {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--surface-elevated) 96%, transparent) 0%,
    color-mix(in srgb, var(--surface-elevated) 92%, transparent) 100%
  );
  border: 1px solid color-mix(in srgb, var(--color-gaming-500) 20%, transparent);
  box-shadow: 0 25px 50px
    color-mix(in srgb, var(--text-primary-600) 8%, transparent);
}

.page-type-noir .noir-title {
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  text-shadow: 0 0 20px rgba(0, 255, 127, 0.5);
}

/* ===== MAIN CONTENT ===== */

.page-main-content {
  flex: 1;
  padding: 0 var(--spacing-4) var(--spacing-8);
}

.page-content-container {
  margin: 0 auto;
}

/* Content Spacing Variants */
.spacing-none .page-content-container {
  padding: 0;
}

.spacing-compact .page-content-container {
  padding: var(--spacing-4);
}

.spacing-normal .page-content-container {
  padding: var(--spacing-6);
}

.spacing-comfortable .page-content-container {
  padding: var(--spacing-8);
}

/* Max Width Variants - Using Master Design System Values */
.width-sm .page-content-container {
  max-width: var(--page-narrow-width, 720px);
}

.width-md .page-content-container {
  max-width: 768px;
}

.width-lg .page-content-container {
  max-width: var(--page-content-max-width, 1200px);
}

.width-xl .page-content-container {
  max-width: var(--page-container-max-width, 1400px);
}

.width-full .page-content-container {
  max-width: 100%;
}

/* ===== FOOTER ACTIONS ===== */

.page-footer-actions {
  padding: var(--spacing-6) var(--spacing-4);
  background: var(--surface-elevated);
  border-t: 1px solid var(--border-base);
}

/* ===== RESPONSIVE DESIGN ===== */

@media (max-width: 768px) {
  .page-header-section {
    margin: var(--spacing-3);
    padding: var(--spacing-6);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-type-hero .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-stats,
  .header-actions {
    justify-content: center;
  }

  .page-main-content {
    padding: 0 var(--spacing-3) var(--spacing-6);
  }
}

@media (max-width: 480px) {
  .page-header-section {
    margin: var(--spacing-2);
    padding: var(--spacing-4);
  }

  .page-title {
    font-size: var(--font-size-xl);
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .title-icon {
    font-size: var(--font-size-2xl);
  }
}
</style>
