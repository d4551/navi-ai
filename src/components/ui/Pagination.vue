<template>
  <nav class="pagination-wrapper" role="navigation" aria-label="Pagination" class="font-sans">
    <!-- Results Info -->
    <div class="pagination-info">
      <span class="results-text">
        Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} jobs
      </span>
      <div class="per-page-selector">
        <label for="per-page-select" class="sr-only">Items per page</label>
        <select
          id="per-page-select"
          :value="itemsPerPage"
          class="form-select per-page-select"
          @change="updateItemsPerPage($event.target.value)"
        >
          <option v-for="size in perPageOptions" :key="size" :value="size">
            {{ size }} per page
          </option>
        </select>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="pagination-controls">
      <!-- Previous Button -->
      <button
        :disabled="currentPage <= 1"
        class="pagination-btn pagination-prev"
        :class="{ disabled: currentPage <= 1 }"
        aria-label="Go to previous page"
        @click="goToPage(currentPage - 1)"
      >
        <AppIcon name="ChevronLeftIcon" />
        <span class="btn-text">Previous</span>
      </button>

      <!-- Page Numbers -->
      <div class="page-numbers">
        <!-- First page -->
        <button
          v-if="showFirstPage"
          class="pagination-btn page-number"
          :class="{ active: currentPage === 1 }"
          :aria-label="`Go to page 1`"
          @click="goToPage(1)"
        >
          1
        </button>

        <!-- First ellipsis -->
        <span v-if="showFirstEllipsis" class="pagination-ellipsis">
          <AppIcon name="EllipsisHorizontalIcon" />
        </span>

        <!-- Visible page range -->
        <button
          v-for="page in visiblePages"
          :key="page"
          class="pagination-btn page-number"
          :class="{ active: currentPage === page }"
          :aria-label="`Go to page ${page}`"
          :aria-current="currentPage === page ? 'page' : undefined"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- Last ellipsis -->
        <span v-if="showLastEllipsis" class="pagination-ellipsis">
          <AppIcon name="EllipsisHorizontalIcon" />
        </span>

        <!-- Last page -->
        <button
          v-if="showLastPage"
          class="pagination-btn page-number"
          :class="{ active: currentPage === totalPages }"
          :aria-label="`Go to page ${totalPages}`"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next Button -->
      <button
        :disabled="currentPage >= totalPages"
        class="pagination-btn pagination-next"
        :class="{ disabled: currentPage >= totalPages }"
        aria-label="Go to next page"
        @click="goToPage(currentPage + 1)"
      >
        <span class="btn-text">Next</span>
        <AppIcon name="ChevronRightIcon" />
      </button>
    </div>

    <!-- Quick Jump (for large datasets) -->
    <div v-if="showQuickJump && totalPages > 10" class="quick-jump">
      <label for="page-jump" class="quick-jump-label">Go to page:</label>
      <input
        id="page-jump"
        v-model.number="jumpPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="form-control quick-jump-input"
        @keyup.enter="goToPage(jumpPage)"
      >
      <button
        class="btn btn-sm btn-outline-primary quick-jump-btn"
        :disabled="!isValidJumpPage"
        @click="goToPage(jumpPage)"
      >
        Go
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const _props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    default: 0
  },
  itemsPerPage: {
    type: Number,
    default: 25
  },
  perPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  showQuickJump: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage'])

// Jump page input
const jumpPage = ref(props.currentPage)

// Watch current page changes to update jump input
watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage
})

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return Math.min(end, props.totalItems)
})

const isValidJumpPage = computed(() => {
  return jumpPage.value >= 1 && jumpPage.value <= totalPages.value
})

// Calculate visible page numbers
const visiblePages = computed(() => {
  const max = props.maxVisiblePages
  const total = totalPages.value
  const current = props.currentPage
  
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  const half = Math.floor(max / 2)
  let start = Math.max(current - half, 1)
  let end = Math.min(start + max - 1, total)
  
  // Adjust start if we're near the end
  if (end - start + 1 < max) {
    start = Math.max(end - max + 1, 1)
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const showFirstPage = computed(() => {
  return !visiblePages.value.includes(1)
})

const showLastPage = computed(() => {
  return !visiblePages.value.includes(totalPages.value)
})

const showFirstEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2
})

const showLastEllipsis = computed(() => {
  return showLastPage.value && visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
})

// Methods
const goToPage = (page) => {
  const validPage = Math.max(1, Math.min(page, totalPages.value))
  if (validPage !== props.currentPage) {
    emit('update:currentPage', validPage)
    // Scroll to top of results
    setTimeout(() => {
      const jobsContainer = document.querySelector('.job-results, .jobs-container')
      if (jobsContainer) {
        jobsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

const updateItemsPerPage = (newSize) => {
  const size = parseInt(newSize, 10)
  if (size !== props.itemsPerPage) {
    emit('update:itemsPerPage', size)
    // Reset to first page when changing page size
    if (props.currentPage > 1) {
      emit('update:currentPage', 1)
    }
  }
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-lg) 0;
  border-t: 1px solid var(--border-base);
  margin-top: var(--spacing-lg);
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.results-text {
  font-weight: var(--font-weight-medium);
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.per-page-select {
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary-600);
  min-width: 120px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  user-select: none;
}

.pagination-btn:hover:not(.disabled) {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.pagination-btn:active:not(.disabled) {
  transform: translateY(0);
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--surface-disabled);
  color: var(--text-disabled);
}

.pagination-btn.active {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: var(--color-primary-contrast);
  font-weight: var(--font-weight-semibold);
}

.pagination-prev,
.pagination-next {
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
}

.btn-text {
  font-size: var(--font-size-sm);
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-number {
  min-width: 40px;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.quick-jump {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.quick-jump-label {
  font-weight: var(--font-weight-medium);
}

.quick-jump-input {
  width: 80px;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary-600);
  text-align: center;
  font-size: var(--font-size-sm);
}

.quick-jump-btn {
  font-size: var(--font-size-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination-wrapper {
    gap: var(--spacing-sm);
  }
  
  .pagination-info {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: center;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn {
    min-width: 36px;
    height: 36px;
    font-size: var(--font-size-xs);
  }
  
  .btn-text {
    display: none;
  }
  
  .quick-jump {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-numbers {
    gap: 2px;
  }
  
  .pagination-btn {
    min-width: 32px;
    height: 32px;
    padding: var(--spacing-xs);
  }
  
  .per-page-select {
    min-width: 100px;
    font-size: var(--font-size-xs);
  }
}

/* Loading state */
.pagination-wrapper.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .pagination-btn {
    border-color: var(--border-base-dark, #374151);
    background: var(--surface-base-dark, #1f2937);
    color: var(--text-primary-600-dark, #f9fafb);
  }
  
  .pagination-btn:hover:not(.disabled) {
    background: var(--surface-hover-dark, #374151);
    border-color: var(--border-hover-dark, #4b5563);
  }
  
  .per-page-select,
  .quick-jump-input {
    border-color: var(--border-base-dark, #374151);
    background: var(--surface-base-dark, #1f2937);
    color: var(--text-primary-600-dark, #f9fafb);
  }
}

/* Focus styles for accessibility */
.pagination-btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.per-page-select:focus-visible,
.quick-jump-input:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Animation for page transitions */
.pagination-btn {
  position: relative;
  overflow: hidden;
}

.pagination-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(var(--color-primary-500-rgb, 59, 130, 246), 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.pagination-btn:active::after {
  width: 120%;
  height: 120%;
}
</style>
