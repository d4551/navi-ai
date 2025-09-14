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
          <span>{{ selectedItems.length }} item{{
            selectedItems.length !== 1 ? "s" : ""
          }}
            selected</span>
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
        :class="{
          'portfolio-grid': viewMode === 'grid' || viewMode === 'masonry',
        }"
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
            '--grid-row': getGridRow(index),
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';

import { ref, computed, watchonUnmounted, nextTick } from "vue";
import PortfolioItemCard from "./PortfolioItemCard.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import Icon from "@/components/ui/Icon.vue";

interface PortfolioItem {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  featured?: boolean;
  [key: string]: any;
}

interface Props {
  items: PortfolioItem[];
  loading?: boolean;
  viewMode?: "grid" | "list" | "masonry" | "timeline";
  selectionMode?: boolean;
  selectedItems?: string[];
  itemsPerPage?: number;
  infiniteScroll?: boolean;
  animationDelay?: number;
  showFab?: boolean;
  showCreateButton?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  columns?: number;
  gap?: number;
  loadingMore?: boolean;
}

const _props = withDefaults(defineProps<Props>(), {
  loading: false,
  viewMode: "grid",
  selectionMode: false,
  selectedItems: () => [],
  itemsPerPage: 12,
  infiniteScroll: false,
  animationDelay: 50,
  showFab: true,
  showCreateButton: true,
  emptyTitle: "No Portfolio Items",
  emptyDescription:
    "Start building your portfolio by creating your first item.",
  emptyIcon: "folder",
  columns: 0,
  gap: 24,
  loadingMore: false,
});

const _emit = defineEmits<{
  "load-more": [];
  select: [id: string];
  "clear-selection": [];
  "bulk-edit": [items: string[]];
  "bulk-delete": [items: string[]];
  edit: [item: PortfolioItem];
  delete: [item: PortfolioItem];
  "toggle-featured": [item: PortfolioItem];
  "export-onepager": [item: PortfolioItem];
  duplicate: [item: PortfolioItem];
  view: [item: PortfolioItem];
  create: [];
}>();

// Local state
const currentPage = ref(1);
const infiniteScrollTrigger = ref<HTMLElement>();
const intersectionObserver = ref<any>(null);

// Computed properties
const loadingCount = computed(() => {
  switch (props.viewMode) {
    case "list":
      return 6;
    case "timeline":
      return 4;
    default:
      return 8;
  }
});

const gridClass = computed(() => [
  `portfolio-grid--${props.viewMode}`,
  {
    "portfolio-grid--loading": props.loading,
    "portfolio-grid--selection": props.selectionMode,
    "portfolio-grid--empty": !props.items.length && !props.loading,
  },
]);

const gridStyles = computed(() => {
  const styles: Record<string, string> = {
    "--gap": `${props.gap}px`,
  };

  if (props.columns > 0 && props.viewMode === "grid") {
    styles["--columns"] = String(props.columns);
  }

  return styles;
});

const paginatedItems = computed(() => {
  if (props.infiniteScroll) {
    return props.items.slice(0, currentPage.value * props.itemsPerPage);
  }
  return props.items;
});

const hasMore = computed(() => {
  return props.items.length > currentPage.value * props.itemsPerPage;
});

const remainingCount = computed(() => {
  return Math.max(
    0,
    props.items.length - currentPage.value * props.itemsPerPage,
  );
});

// Methods
const handleItemSelect = (id: string) => {
  emit("select", id);
};

const loadMore = () => {
  if (props.infiniteScroll) {
    currentPage.value++;
  } else {
    emit("load-more");
  }
};

const getGridColumn = (_index: number): string => {
  if (props.viewMode === "masonry") {
    // Masonry layout will use CSS Grid auto-placement
    return "auto";
  }
  return "auto";
};

const getGridRow = (_index: number): string => {
  return "auto";
};

// Intersection Observer for infinite scroll
const setupInfiniteScroll = () => {
  if (!props.infiniteScroll || !infiniteScrollTrigger.value) return;

  intersectionObserver.value = new (window as any).IntersectionObserver(
    (entries: any[]) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting && hasMore.value && !props.loading) {
          loadMore();
        }
      });
    },
    {
      rootMargin: "100px",
      threshold: 0.1,
    },
  );

  intersectionObserver.value.observe(infiniteScrollTrigger.value);
};

const cleanupInfiniteScroll = () => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect();
  }
};

// Watchers
watch(
  () => props.infiniteScroll,
  (enabled) => {
    if (enabled) {
      nextTick(() => setupInfiniteScroll());
    } else {
      cleanupInfiniteScroll();
    }
  },
);

watch(
  () => infiniteScrollTrigger.value,
  () => {
    if (props.infiniteScroll) {
      nextTick(() => setupInfiniteScroll());
    }
  },
);

// Lifecycle
onMounted(() => {
  if (props.infiniteScroll) {
    nextTick(() => setupInfiniteScroll());
  }
});

onUnmounted(() => {
  cleanupInfiniteScroll();
});

// Reset pagination when items change
watch(
  () => props.items.length,
  () => {
    currentPage.value = 1;
  },
);
</script>

<style scoped>
.portfolio-grid {
  position: relative;
  width: 100%;
}

.portfolio-grid--grid .grid-items {
  display: grid;
  align-items: start;
}

.portfolio-grid--list .grid-items {
  display: flex;
  flex-direction: column;
}

.portfolio-grid--masonry .grid-items {
  display: grid;
  grid-auto-rows: max-content;
  align-items: start;
}

.portfolio-grid--timeline .grid-items {
  display: flex;
  flex-direction: column;
  position: relative;
}

.portfolio-grid--timeline .grid-items::before {
  content: "";
  position: absolute;
}

}

.loading-grid {
  display: grid;
}

.portfolio-skeleton {
  overflow: hidden;
}

.skeleton-media {
  background: linear-gradient(
  );
}

.skeleton-content {
  display: flex;
  flex-direction: column;
}

.skeleton-title {
}

.skeleton-text {
}

.skeleton-tags {
  display: flex;
}

.skeleton-tag {
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(
  );
}

.empty-icon {
}

.empty-title {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-description {
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
  );
}

.selection-info {
  display: flex;
  align-items: center;
}

.selection-actions {
  display: flex;
  flex-wrap: wrap;
}

.grid-items {
  position: relative;
}

.load-more-section {
  display: flex;
  justify-content: center;
}

.infinite-scroll-trigger {
}

.floating-action-button {
  position: fixed;
}

.floating-action-button.fab--hidden {
}

.fab-button {
  box-shadow:
  background: linear-gradient(
  );
  position: relative;
  overflow: hidden;
}

.fab-button::before {
  content: "";
  position: absolute;
  background: radial-gradient(
    circle at center,
  );
}

.fab-button:hover {
  box-shadow:
}

.fab-button:hover::before {
}

@keyframes pulse {
  }
  }
}

@keyframes shimmer {
  }
  }
}

.portfolio-grid-enter-active,
.portfolio-grid-leave-active {
}

.portfolio-grid-enter-from {
}

.portfolio-grid-leave-to {
}

.portfolio-grid-move {
}

  .empty-state {
  }
}

  .portfolio-grid--grid .grid-items,
  .loading-grid {
  }

  .selection-header {
    flex-direction: column;
    text-align: center;
  }

  .selection-actions {
    justify-content: center;
  }

  .empty-state {
  }

  .floating-action-button {
  }

  .fab-button {
  }
}

  .selection-actions {
    flex-direction: column;
  }

  .empty-title {
  }

  .empty-description {
  }
}

@media print {
  .floating-action-button,
  .selection-header,
  .load-more-section {
    display: none;
  }

  .portfolio-grid--grid .grid-items {
  }
}

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

@media (prefers-color-scheme: light) {
  .portfolio-skeleton {
  }

  .skeleton-media {
    background: linear-gradient(
    );
  }

  .skeleton-title {
  }

  .skeleton-text {
  }

  .skeleton-tag {
  }
}
</style>
