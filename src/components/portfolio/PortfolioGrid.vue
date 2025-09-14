<template>
  <div class="portfolio-grid" :class="gridClass">
    <!-- Loading State -->
    <div v-if="loading" class="loading-grid portfolio-grid">
      <div 
        v-for="i in loadingCount" 
        :key="`loading-${i}`"
        class="portfolio-skeleton"
      >
        <div class="skeleton-media"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-tags">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="empty-state">
      <div class="empty-icon">
        <Icon :name="emptyIcon" size="64" />
      </div>
      <h3 class="empty-title">{{ emptyTitle }}</h3>
      <p class="empty-description">{{ emptyDescription }}</p>
      <UnifiedButton
        v-if="showCreateButton"
        variant="primary"
        @click="$emit('create')"
      >
        <Icon name="plus" />
        Create Your First Portfolio Item
      </UnifiedButton>
    </div>

    <!-- Grid Content -->
    <div v-else class="grid-container" :style="gridStyles">
      <!-- Selection Header -->
      <div v-if="selectedItems.length > 0" class="selection-header">
        <div class="selection-info">
          <Icon name="check-square" />
          <span>{{ selectedItems.length }} item{{ selectedItems.length !== 1 ? 's' : '' }} selected</span>
        </div>
        <div class="selection-actions">
          <UnifiedButton 
            size="sm" 
            variant="outline"
            @click="$emit('clear-selection')"
          >
            Clear
          </UnifiedButton>
          <UnifiedButton 
            size="sm" 
            variant="outline"
            @click="$emit('bulk-edit', selectedItems)"
          >
            <Icon name="edit" />
            Edit
          </UnifiedButton>
          <UnifiedButton 
            size="sm" 
            variant="outline"
            @click="$emit('bulk-delete', selectedItems)"
          >
            <Icon name="trash" />
            Delete
          </UnifiedButton>
        </div>
      </div>

      <!-- Grid Items -->
      <TransitionGroup
        name="portfolio-grid"
        tag="div"
        class="grid-items"
        :class="{ 'portfolio-grid': viewMode === 'grid' || viewMode === 'masonry' }"
        appear
      >
        <PortfolioItemCard
          v-for="(item, index) in paginatedItems"
          :key="item.id"
          :item="item"
          :view-mode="viewMode"
          :selection-mode="selectionMode"
          :selected="selectedItems.includes(item.id)"
          :style="{ 
            '--animation-delay': `${index * animationDelay}ms`,
            '--grid-column': getGridColumn(index),
            '--grid-row': getGridRow(index)
          }"
          @select="handleItemSelect"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @toggle-featured="$emit('toggle-featured', $event)"
          @export-onepager="$emit('export-onepager', $event)"
          @duplicate="$emit('duplicate', $event)"
          @view="$emit('view', $event)"
        />
      </TransitionGroup>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading" class="load-more-section">
        <UnifiedButton
          variant="outline"
          size="lg"
          :loading="loadingMore"
          @click="loadMore"
        >
          <Icon name="arrow-down" />
          Load More ({{ remainingCount }} remaining)
        </UnifiedButton>
      </div>

      <!-- Infinite Scroll Trigger -->
      <div 
        v-if="infiniteScroll && hasMore"
        ref="infiniteScrollTrigger"
        class="infinite-scroll-trigger"
      ></div>
    </div>

    <!-- Floating Action Button -->
    <Teleport to="body">
      <div 
        v-if="showFab && !loading"
        class="floating-action-button"
        :class="{ 'fab--hidden': selectedItems.length > 0 }"
      >
        <UnifiedButton
          variant="primary"
          size="lg"
          class="fab-button"
          @click="$emit('create')"
        >
          <Icon name="plus" size="24" />
        </UnifiedButton>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import PortfolioItemCard from './PortfolioItemCard.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import Icon from '@/components/ui/Icon.vue'

interface PortfolioItem {
  id: string
  title?: string
  description?: string
  type?: string
  featured?: boolean
  [key: string]: any
}

interface Props {
  items: PortfolioItem[]
  loading?: boolean
  viewMode?: 'grid' | 'list' | 'masonry' | 'timeline'
  selectionMode?: boolean
  selectedItems?: string[]
  itemsPerPage?: number
  infiniteScroll?: boolean
  animationDelay?: number
  showFab?: boolean
  showCreateButton?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  columns?: number
  gap?: number
  loadingMore?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  loading: false,
  viewMode: 'grid',
  selectionMode: false,
  selectedItems: () => [],
  itemsPerPage: 12,
  infiniteScroll: false,
  animationDelay: 50,
  showFab: true,
  showCreateButton: true,
  emptyTitle: 'No Portfolio Items',
  emptyDescription: 'Start building your portfolio by creating your first item.',
  emptyIcon: 'folder',
  columns: 0, // 0 = auto
  gap: 24,
  loadingMore: false
})

const emit = defineEmits<{
  'load-more': []
  select: [id: string]
  'clear-selection': []
  'bulk-edit': [items: string[]]
  'bulk-delete': [items: string[]]
  edit: [item: PortfolioItem]
  delete: [item: PortfolioItem]
  'toggle-featured': [item: PortfolioItem]
  'export-onepager': [item: PortfolioItem]
  duplicate: [item: PortfolioItem]
  view: [item: PortfolioItem]
  create: []
}>()

// Local state
const currentPage = ref(1)
const infiniteScrollTrigger = ref<HTMLElement>()
const intersectionObserver = ref<any>(null)

// Computed properties
const loadingCount = computed(() => {
  switch (props.viewMode) {
    case 'list': return 6
    case 'timeline': return 4
    default: return 8
  }
})

const gridClass = computed(() => [
  `portfolio-grid--${props.viewMode}`,
  {
    'portfolio-grid--loading': props.loading,
    'portfolio-grid--selection': props.selectionMode,
    'portfolio-grid--empty': !props.items.length && !props.loading
  }
])

const gridStyles = computed(() => {
  const styles: Record<string, string> = {
    '--gap': `${props.gap}px`
  }

  if (props.columns > 0 && props.viewMode === 'grid') {
    styles['--columns'] = String(props.columns)
  }

  return styles
})

const paginatedItems = computed(() => {
  if (props.infiniteScroll) {
    return props.items.slice(0, currentPage.value * props.itemsPerPage)
  }
  return props.items
})

const hasMore = computed(() => {
  return props.items.length > currentPage.value * props.itemsPerPage
})

const remainingCount = computed(() => {
  return Math.max(0, props.items.length - currentPage.value * props.itemsPerPage)
})

// Methods
const handleItemSelect = (id: string) => {
  emit('select', id)
}

const loadMore = () => {
  if (props.infiniteScroll) {
    currentPage.value++
  } else {
    emit('load-more')
  }
}

const getGridColumn = (_index: number): string => {
  if (props.viewMode === 'masonry') {
    // Masonry layout will use CSS Grid auto-placement
    return 'auto'
  }
  return 'auto'
}

const getGridRow = (_index: number): string => {
  return 'auto'
}

// Intersection Observer for infinite scroll
const setupInfiniteScroll = () => {
  if (!props.infiniteScroll || !infiniteScrollTrigger.value) return

  intersectionObserver.value = new (window as any).IntersectionObserver(
    (entries: any[]) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting && hasMore.value && !props.loading) {
          loadMore()
        }
      })
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  intersectionObserver.value.observe(infiniteScrollTrigger.value)
}

const cleanupInfiniteScroll = () => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
}

// Watchers
watch(
  () => props.infiniteScroll,
  (enabled) => {
    if (enabled) {
      nextTick(() => setupInfiniteScroll())
    } else {
      cleanupInfiniteScroll()
    }
  }
)

watch(
  () => infiniteScrollTrigger.value,
  () => {
    if (props.infiniteScroll) {
      nextTick(() => setupInfiniteScroll())
    }
  }
)

// Lifecycle
onMounted(() => {
  if (props.infiniteScroll) {
    nextTick(() => setupInfiniteScroll())
  }
})

onUnmounted(() => {
  cleanupInfiniteScroll()
})

// Reset pagination when items change
watch(
  () => props.items.length,
  () => {
    currentPage.value = 1
  }
)
</script>

<style scoped>
.portfolio-grid {
  position: relative;
  width: 100%;
}

/* Enhanced Grid Classes */
.portfolio-grid--grid .grid-items {
  display: grid;
  gap: var(--gap, 24px);
  align-items: start;
}

.portfolio-grid--list .grid-items {
  display: flex;
  flex-direction: column;
  gap: var(--gap, 20px);
}

.portfolio-grid--masonry .grid-items {
  display: grid;
  grid-auto-rows: max-content;
  gap: var(--gap, 24px);
  align-items: start;
}

.portfolio-grid--timeline .grid-items {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap, 24px) * 1.5);
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.portfolio-grid--timeline .grid-items::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #7c3aed, #ec4899);
  opacity: 0.3;
}

/* Custom columns override */
.portfolio-grid--grid .grid-items[style*="--columns"] {
  grid-template-columns: repeat(var(--columns), 1fr);
}

/* Loading Grid */
.loading-grid {
  display: grid;
  gap: var(--gap, 24px);
}

.portfolio-skeleton {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  animation: pulse 2s infinite;
}

.skeleton-media {
  height: 200px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  animation: shimmer 2s infinite;
}

.skeleton-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-title {
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  width: 70%;
}

.skeleton-text {
  height: 4rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
}

.skeleton-tag {
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  width: 4rem;
}

/* Enhanced Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 2rem;
  min-height: 500px;
  background: linear-gradient(135deg, 
    rgba(124, 58, 237, 0.05) 0%, 
    rgba(236, 72, 153, 0.05) 100%);
  border-radius: 2rem;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
}

.empty-icon {
  color: rgba(124, 58, 237, 0.4);
  margin-bottom: 2rem;
  filter: drop-shadow(0 4px 12px rgba(124, 58, 237, 0.2));
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0 0 1rem 0;
  background: linear-gradient(45deg, #ffffff, rgba(124, 58, 237, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;
}

/* Enhanced Selection Header */
.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, 
    rgba(124, 58, 237, 0.15) 0%, 
    rgba(236, 72, 153, 0.1) 100%);
  border: 1px solid rgba(124, 58, 237, 0.4);
  border-radius: 1.25rem;
  padding: 1.25rem 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15);
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary, #ffffff);
  font-weight: 600;
  font-size: 1.1rem;
}

.selection-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Grid Items */
.grid-items {
  position: relative;
}

/* Load More Section */
.load-more-section {
  display: flex;
  justify-content: center;
  padding: 3rem 0 2rem;
}

.infinite-scroll-trigger {
  height: 1px;
  margin-top: 2rem;
}

/* Enhanced Floating Action Button */
.floating-action-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-action-button.fab--hidden {
  transform: translateY(120px) scale(0.8);
  opacity: 0;
}

.fab-button {
  border-radius: 50%;
  width: 4.5rem;
  height: 4.5rem;
  box-shadow: 
    0 8px 32px rgba(124, 58, 237, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, 
    rgba(124, 58, 237, 1) 0%, 
    rgba(236, 72, 153, 1) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.fab-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, 
    rgba(255, 255, 255, 0.3) 0%, 
    transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fab-button:hover {
  transform: scale(1.15);
  box-shadow: 
    0 16px 64px rgba(124, 58, 237, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.3);
}

.fab-button:hover::before {
  opacity: 1;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

/* Portfolio Grid Transitions */
.portfolio-grid-enter-active,
.portfolio-grid-leave-active {
  transition: all 0.3s ease;
  transition-delay: var(--animation-delay, 0ms);
}

.portfolio-grid-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.portfolio-grid-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.portfolio-grid-move {
  transition: transform 0.5s ease;
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .empty-state {
    padding: 4rem 1.5rem;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .portfolio-grid--grid .grid-items,
  .loading-grid {
    gap: 1rem;
  }
  
  .selection-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .selection-actions {
    justify-content: center;
  }
  
  .empty-state {
    padding: 2rem 1rem;
    min-height: 300px;
  }
  
  .floating-action-button {
    bottom: 1rem;
    right: 1rem;
  }
  
  .fab-button {
    width: 3.5rem;
    height: 3.5rem;
  }
}

@media (max-width: 480px) {
  .selection-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .empty-title {
    font-size: 1.25rem;
  }
  
  .empty-description {
    font-size: 0.875rem;
  }
}

/* Print Styles */
@media print {
  .floating-action-button,
  .selection-header,
  .load-more-section {
    display: none;
  }
  
  .portfolio-grid--grid .grid-items {
    gap: 1rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .portfolio-grid-enter-active,
  .portfolio-grid-leave-active,
  .portfolio-grid-move,
  .floating-action-button,
  .fab-button {
    transition: none;
  }
  
  .portfolio-skeleton {
    animation: none;
  }
  
  .skeleton-media {
    animation: none;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: light) {
  .portfolio-skeleton {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  .skeleton-media {
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.05) 100%
    );
  }
  
  .skeleton-title {
    background: rgba(0, 0, 0, 0.1);
  }
  
  .skeleton-text {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .skeleton-tag {
    background: rgba(0, 0, 0, 0.08);
  }
}
</style>
