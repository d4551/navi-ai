<template>
  <div
    class="loading-state-manager"
    :class="[
      `loading-variant-${variant}`,
      { 'loading-fullscreen': fullscreen }
    ]"
  >
    <!-- Skeleton Loading States -->
    <div v-if="isLoading" class="skeleton-container" role="status" aria-live="polite">
      <span class="sr-only">{{ loadingText }}</span>

      <!-- Dashboard Stats Skeleton -->
      <template v-if="variant === 'dashboard-stats'">
        <div class="grid-stats">
          <div v-for="n in 4" :key="`stat-${n}`" class="skeleton-stat-card">
            <div class="skeleton skeleton-circle"></div>
            <div class="skeleton skeleton-text-lg"></div>
            <div class="skeleton skeleton-text-sm"></div>
          </div>
        </div>
      </template>

      <!-- Dashboard Cards Skeleton -->
      <template v-if="variant === 'dashboard-cards'">
        <div class="grid-actions">
          <div v-for="n in cardCount" :key="`card-${n}`" class="skeleton-action-card">
            <div class="skeleton-card-header">
              <div class="skeleton skeleton-icon"></div>
              <div class="skeleton-card-text">
                <div class="skeleton skeleton-text-md"></div>
                <div class="skeleton skeleton-text-sm"></div>
              </div>
            </div>
            <div class="skeleton skeleton-button"></div>
          </div>
        </div>
      </template>

      <!-- Job List Skeleton -->
      <template v-if="variant === 'job-list'">
        <div class="skeleton-job-list">
          <div v-for="n in itemCount" :key="`job-${n}`" class="skeleton-job-item">
            <div class="skeleton-job-header">
              <div class="skeleton skeleton-text-lg"></div>
              <div class="skeleton skeleton-badge"></div>
            </div>
            <div class="skeleton skeleton-text-sm"></div>
            <div class="skeleton skeleton-text-xs"></div>
          </div>
        </div>
      </template>

      <!-- Table Skeleton -->
      <template v-if="variant === 'table'">
        <div class="skeleton-table">
          <div class="skeleton-table-header">
            <div v-for="n in columnCount" :key="`header-${n}`" class="skeleton skeleton-text-sm"></div>
          </div>
          <div v-for="n in rowCount" :key="`row-${n}`" class="skeleton-table-row">
            <div v-for="c in columnCount" :key="`cell-${n}-${c}`" class="skeleton skeleton-text-xs"></div>
          </div>
        </div>
      </template>

      <!-- Form Skeleton -->
      <template v-if="variant === 'form'">
        <div class="skeleton-form">
          <div v-for="n in fieldCount" :key="`field-${n}`" class="skeleton-form-field">
            <div class="skeleton skeleton-label"></div>
            <div class="skeleton skeleton-input"></div>
          </div>
          <div class="skeleton-form-actions">
            <div class="skeleton skeleton-button"></div>
            <div class="skeleton skeleton-button-outline"></div>
          </div>
        </div>
      </template>

      <!-- Progress Skeleton -->
      <template v-if="variant === 'progress'">
        <div class="skeleton-progress">
          <div class="skeleton skeleton-text-md"></div>
          <div class="skeleton skeleton-progress-bar"></div>
          <div class="skeleton skeleton-text-sm"></div>
        </div>
      </template>

      <!-- Chart Skeleton -->
      <template v-if="variant === 'chart'">
        <div class="skeleton-chart">
          <div class="skeleton-chart-header">
            <div class="skeleton skeleton-text-lg"></div>
            <div class="skeleton skeleton-text-sm"></div>
          </div>
          <div class="skeleton-chart-body">
            <div class="skeleton-chart-bars">
              <div v-for="n in 6" :key="`bar-${n}`" class="skeleton-chart-bar" :style="{ height: `${Math.random() * 60 + 20}%` }"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Generic Content Skeleton -->
      <template v-if="variant === 'content'">
        <div class="skeleton-content">
          <div class="skeleton skeleton-heading"></div>
          <div class="skeleton skeleton-paragraph"></div>
          <div class="skeleton skeleton-paragraph-short"></div>
        </div>
      </template>
    </div>

    <!-- Actual Content -->
    <div v-else class="content-loaded" :class="{ 'fade-in': animate }">
      <slot></slot>
    </div>

    <!-- Error State -->
    <div v-if="hasError && !isLoading" class="error-state" role="alert">
      <div class="error-icon">
        <AppIcon name="mdi-alert-circle" size="large" />
      </div>
      <div class="error-content">
        <h3 class="error-title">{{ errorTitle || 'Something went wrong' }}</h3>
        <p class="error-message">{{ errorMessage || 'Please try again later.' }}</p>
        <div v-if="retryable" class="error-actions">
          <UnifiedButton variant="primary" size="sm" @click="$emit('retry')">
            Try Again
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty && !isLoading && !hasError" class="empty-state">
      <div class="empty-icon">
        <AppIcon :name="emptyIcon || 'mdi-inbox'" size="large" />
      </div>
      <div class="empty-content">
        <h3 class="empty-title">{{ emptyTitle || 'No data available' }}</h3>
        <p class="empty-message">{{ emptyMessage || 'There\'s nothing to show here yet.' }}</p>
        <div v-if="emptyAction" class="empty-actions">
          <UnifiedButton variant="primary" size="sm" @click="$emit('empty-action')">
            {{ emptyActionText || 'Get Started' }}
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Props {
  // Loading state
  isLoading?: boolean
  variant?: 'dashboard-stats' | 'dashboard-cards' | 'job-list' | 'table' | 'form' | 'progress' | 'chart' | 'content'
  loadingText?: string
  animate?: boolean
  fullscreen?: boolean

  // Skeleton configuration
  cardCount?: number
  itemCount?: number
  fieldCount?: number
  rowCount?: number
  columnCount?: number

  // Error state
  hasError?: boolean
  errorTitle?: string
  errorMessage?: string
  retryable?: boolean

  // Empty state
  isEmpty?: boolean
  emptyTitle?: string
  emptyMessage?: string
  emptyIcon?: string
  emptyAction?: boolean
  emptyActionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  variant: 'content',
  loadingText: 'Loading content...',
  animate: true,
  fullscreen: false,
  cardCount: 4,
  itemCount: 5,
  fieldCount: 3,
  rowCount: 5,
  columnCount: 4,
  hasError: false,
  retryable: true,
  isEmpty: false,
  emptyAction: false
})

const emit = defineEmits<{
  retry: []
  'empty-action': []
}>()
</script>

<style scoped>
/* ===== LOADING STATE MANAGER ===== */
.loading-state-manager {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== SKELETON COMPONENTS ===== */
.skeleton-container {
  width: 100%;
  padding: var(--space-4);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--glass-bg) 25%,
    var(--glass-bg-hover) 50%,
    var(--glass-bg) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Skeleton sizes */
.skeleton-text-xs { height: 12px; width: 60%; margin-bottom: var(--space-1); }
.skeleton-text-sm { height: 14px; width: 80%; margin-bottom: var(--space-2); }
.skeleton-text-md { height: 16px; width: 70%; margin-bottom: var(--space-2); }
.skeleton-text-lg { height: 20px; width: 60%; margin-bottom: var(--space-3); }
.skeleton-heading { height: 24px; width: 50%; margin-bottom: var(--space-4); }
.skeleton-paragraph { height: 14px; width: 100%; margin-bottom: var(--space-2); }
.skeleton-paragraph-short { height: 14px; width: 75%; margin-bottom: var(--space-2); }

.skeleton-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: var(--space-2);
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
}

.skeleton-badge {
  height: 20px;
  width: 60px;
  border-radius: var(--radius-full);
}

.skeleton-button {
  height: 36px;
  width: 100px;
  border-radius: var(--radius-md);
}

.skeleton-button-outline {
  height: 36px;
  width: 80px;
  border-radius: var(--radius-md);
  border: 2px solid var(--glass-border);
  background: transparent;
}

.skeleton-input {
  height: 40px;
  width: 100%;
  border-radius: var(--radius-md);
}

.skeleton-label {
  height: 14px;
  width: 120px;
  margin-bottom: var(--space-1);
}

.skeleton-progress-bar {
  height: 8px;
  width: 100%;
  border-radius: var(--radius-full);
}

/* ===== DASHBOARD STATS SKELETON ===== */
.skeleton-stat-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
}

/* ===== DASHBOARD CARDS SKELETON ===== */
.skeleton-action-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.skeleton-card-text {
  flex: 1;
}

/* ===== JOB LIST SKELETON ===== */
.skeleton-job-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-job-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.skeleton-job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

/* ===== TABLE SKELETON ===== */
.skeleton-table {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(var(--column-count, 4), 1fr);
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--glass-bg-hover);
  border-bottom: 1px solid var(--glass-border);
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(var(--column-count, 4), 1fr);
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--glass-border);
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

/* ===== FORM SKELETON ===== */
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.skeleton-form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-4);
}

/* ===== PROGRESS SKELETON ===== */
.skeleton-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  text-align: center;
}

/* ===== CHART SKELETON ===== */
.skeleton-chart {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}

.skeleton-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.skeleton-chart-body {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.skeleton-chart-bars {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  height: 100%;
  width: 100%;
  justify-content: space-around;
}

.skeleton-chart-bar {
  background: var(--glass-bg-hover);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  width: 40px;
  min-height: 20px;
}

/* ===== CONTENT SKELETON ===== */
.skeleton-content {
  display: flex;
  flex-direction: column;
}

/* ===== ERROR STATE ===== */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);
}

.error-icon {
  color: var(--color-error-500);
  margin-bottom: var(--space-4);
}

.error-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-message {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

/* ===== CONTENT LOADED ===== */
.content-loaded {
  width: 100%;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .skeleton-container {
    padding: var(--space-3);
  }

  .skeleton-chart-bars {
    gap: var(--space-1);
  }

  .skeleton-chart-bar {
    width: 24px;
  }

  .skeleton-form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .skeleton-job-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--glass-bg-hover);
  }

  .fade-in {
    animation: none;
  }
}

/* ===== HIGH CONTRAST MODE ===== */
@media (prefers-contrast: high) {
  .skeleton {
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
  }
}
</style>