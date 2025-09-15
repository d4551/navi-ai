<template>
  <div class="job-pagination">
    <!-- Results Info -->
    <div class="pagination-info">
      <span class="results-count">
        Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} jobs
      </span>
      <div class="per-page-controls">
        <label for="jobs-per-page" class="per-page-label">Per page:</label>
        <select
          id="jobs-per-page"
          :value="itemsPerPage"
          class="per-page-select"
          @change="$emit('update:itemsPerPage', parseInt($event.target.value))"
        >
          <option v-for="size in perPageOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="pagination-nav">
      <button
        :disabled="currentPage <= 1"
        class="nav-btn prev-btn"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        <AppIcon name="mdi-chevron-left" />
        Previous
      </button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="$emit('update:currentPage', page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        :disabled="currentPage >= totalPages"
        class="nav-btn next-btn"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        Next
        <AppIcon name="mdi-chevron-right" />
      </button>
    </div>

    <!-- Quick Jump for Large Result Sets -->
    <div v-if="totalPages > 10" class="quick-jump">
      <span>Go to page:</span>
      <input
        v-model.number="jumpToPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="jump-input"
        @keyup.enter="jumpToPageAction"
      >
      <button
        class="jump-btn"
        :disabled="!isValidJumpPage"
        @click="jumpToPageAction"
      >
        Go
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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
  }
})

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage'])

const jumpToPage = ref(props.currentPage)

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return Math.min(end, props.totalItems)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const maxVisible = 5

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const half = Math.floor(maxVisible / 2)
  let start = Math.max(current - half, 1)
  let end = Math.min(start + maxVisible - 1, total)

  if (end - start + 1 < maxVisible) {
    start = Math.max(end - maxVisible + 1, 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const isValidJumpPage = computed(() => {
  return jumpToPage.value >= 1 && jumpToPage.value <= totalPages.value
})

const jumpToPageAction = () => {
  if (isValidJumpPage.value) {
    emit('update:currentPage', jumpToPage.value)
  }
}
</script>

<style scoped>
.job-pagination {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) 0;
  border-top: 1px solid var(--border-base);
  margin-top: var(--spacing-lg);
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.results-count {
  font-weight: var(--font-weight-medium);
}

.per-page-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.per-page-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.per-page-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.pagination-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.nav-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-hover);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: var(--spacing-xs);
}

.page-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.page-btn:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
}

.page-btn.active {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: var(--color-primary-contrast);
  font-weight: var(--font-weight-semibold);
}

.quick-jump {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.jump-input {
  width: 60px;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary);
  text-align: center;
  font-size: var(--font-size-sm);
}

.jump-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.jump-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-hover);
}

.jump-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .job-pagination {
    gap: var(--spacing-sm);
  }
  
  .pagination-info {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
  
  .pagination-nav {
    flex-wrap: wrap;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: var(--font-size-xs);
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
  
  .page-btn {
    min-width: 28px;
    height: 28px;
  }
}
</style>
