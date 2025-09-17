<template>
  <div class="studios-grid enhanced-grid">
    <div
      v-for="studio in studios"
      :key="studio.id"
      class="studio-infographic-card glass-card section-card-enhanced interactive-hover"
      tabindex="0"
      role="button"
      :aria-label="`Open details for ${studio.name}`"
      @click="$emit('open-details', studio)"
      @keydown.enter.prevent="$emit('open-details', studio)"
      @keydown.space.prevent="$emit('open-details', studio)"
    >
      <div class="studio-card-header section-header">
        <div class="studio-logo-container">
          <div class="logo-wrapper">
            <img
              v-if="studio.logo"
              :src="studio.logo"
              :alt="studio.name"
              class="studio-logo-image"
              @error="onImgErr"
            />
            <div v-else class="logo-placeholder-enhanced">
              <span class="logo-initial">{{ studio.name?.charAt(0) }}</span>
            </div>
          </div>
          <div v-if="studio.publiclyTraded" class="logo-badge">
            <AppIcon name="mdi-chart-bar" color="info" />
            <span class="badge-text">PUBLIC</span>
          </div>
        </div>

        <div class="studio-primary-info">
          <h3 class="studio-name-enhanced">{{ studio.name }}</h3>
          <p class="studio-location-enhanced">
            <AppIcon name="mdi-map-marker" />
            {{ studio.headquarters || studio.location }}
          </p>
          <div class="studio-meta-badges">
            <span
              v-if="(studio as any).type || (studio as any).category"
              class="meta-badge"
              >{{ (studio as any).type || (studio as any).category }}</span
            >
            <span v-if="studio.size" class="meta-badge">{{ studio.size }}</span>
            <span v-if="studio.founded" class="meta-badge">{{
              studio.founded
            }}</span>
          </div>
        </div>

        <div class="studio-actions-header">
          <button
            class="favorite-btn-enhanced"
            :class="{ active: favoriteIds.includes(studio.id) }"
            @click.stop="$emit('toggle-favorite', studio.id)"
          >
            <AppIcon name="mdi-heart" />
          </button>
          <div
            v-if="aiScoreMap && aiScoreMap[studio.id] !== undefined"
            class="rating-indicator ai-score-chip"
            :title="'AI suitability score'"
          >
            <AppIcon name="mdi-target" />
            <span>{{ Math.round(aiScoreMap[studio.id]) }}%</span>
          </div>
          <div v-if="studio.rating" class="rating-indicator">
            <AppIcon name="mdi-star" context="achievement" />
            <span>{{ studio.rating }}/5</span>
          </div>
        </div>
      </div>

      <div class="studio-kpis-section">
        <div class="kpi-grid">
          <div v-if="studio.employeeCount" class="kpi-item">
            <div class="kpi-icon"><AppIcon name="mdi-account-group" /></div>
            <div class="kpi-data">
              <div class="kpi-value">{{ studio.employeeCount }}</div>
              <div class="kpi-label">Employees</div>
            </div>
          </div>
          <div v-if="studio.games?.length" class="kpi-item">
            <div class="kpi-icon"><AppIcon name="mdi-gamepad-variant" /></div>
            <div class="kpi-data">
              <div class="kpi-value">{{ studio.games.length }}</div>
              <div class="kpi-label">Games</div>
            </div>
          </div>
          <div v-if="studio.technologies?.length" class="kpi-item">
            <div class="kpi-icon"><AppIcon name="mdi-code-tags" /></div>
            <div class="kpi-data">
              <div class="kpi-value">{{ studio.technologies.length }}</div>
              <div class="kpi-label">Tech Stack</div>
            </div>
          </div>
        </div>
      </div>

      <div class="studio-card-footer">
        <div class="footer-stats">
          <div class="stat-item">
            <AppIcon name="mdi-calendar" /><span
              >Est. {{ studio.founded }}</span
            >
          </div>
          <div v-if="studio.website" class="stat-item">
            <AppIcon name="mdi-web" /><span>Website</span>
          </div>
        </div>
        <div class="footer-actions">
          <UnifiedButton
            color="gaming"
            leading-icon="mdi-briefcase-outline"
            @click.stop="$emit('view-jobs', studio)"
            >View Jobs</UnifiedButton
          >
          <UnifiedButton
            color="glass"
            appearance="outlined"
            leading-icon="mdi-information-outline"
            @click.stop="$emit('open-details', studio)"
            >Details</UnifiedButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

defineProps<{
  studios: any[]
  aiScoreMap?: Record<string, number>
  favoriteIds: string[]
}>()

function onImgErr(e: Event) {
  const el = e.target as HTMLImageElement
  el.style.display = 'none'
}
</script>

<style scoped>
/* Enhanced Studio Grid with Master Design System Integration */

.studios-grid {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, var(--grid-card-min-md)), 1fr)
  );
  width: 100%;
}

.studio-infographic-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  padding: var(--card-padding);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-height: 320px;
  contain: layout style paint;
}

.studio-infographic-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    var(--glass-shadow),
    0 12px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
  background: var(--glass-hover-bg);
}

.studio-infographic-card:focus-visible {
  outline: none;
  box-shadow:
    var(--glass-shadow),
    0 0 0 2px var(--color-primary-500);
  transform: translateY(-1px);
}

/* Header Section */
.studio-card-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.studio-logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.logo-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-elevated);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.studio-logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder-enhanced {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--color-primary-500),
    var(--color-primary-600)
  );
  color: white;
}

.logo-initial {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.logo-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  background: color-mix(in srgb, var(--color-info-500) 10%, transparent);
  color: var(--color-info-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  border: 1px solid color-mix(in srgb, var(--color-info-500) 20%, transparent);
}

.studio-primary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.studio-name-enhanced {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--line-height-heading);
}

.studio-location-enhanced {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.studio-meta-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1-5);
}

.meta-badge {
  background: color-mix(in srgb, var(--text-primary) 8%, transparent);
  color: var(--text-primary);
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
}

.studio-actions-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  align-self: flex-start;
}

.favorite-btn-enhanced {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.favorite-btn-enhanced:hover {
  background: var(--glass-hover-bg);
  color: var(--color-error-500);
  border-color: color-mix(in srgb, var(--color-error-500) 30%, transparent);
  transform: scale(1.05);
}

.favorite-btn-enhanced.active {
  background: var(--color-error-500);
  color: white;
  border-color: var(--color-error-500);
}

.rating-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.ai-score-chip {
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-600);
  border-color: color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

/* KPI Section */
.studio-kpis-section {
  padding: var(--spacing-3);
  background: color-mix(in srgb, var(--glass-bg) 50%, transparent);
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-3);
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.kpi-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-data {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kpi-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: 1;
}

.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* Footer Section */
.studio-card-footer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-top: auto;
  padding-top: var(--spacing-3);
  border-top: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
}

.footer-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .studios-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: var(--spacing-5);
  }
}

@media (max-width: 768px) {
  .studios-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .studio-infographic-card {
    padding: var(--spacing-4);
    min-height: 280px;
  }

  .footer-actions {
    flex-direction: column;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .studio-infographic-card {
    padding: var(--spacing-3);
  }

  .studio-card-header {
    gap: var(--spacing-2);
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

/* Animation for cards appearing */
.studios-grid > * {
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation delay */
.studios-grid > *:nth-child(1) {
  animation-delay: 0ms;
}
.studios-grid > *:nth-child(2) {
  animation-delay: 100ms;
}
.studios-grid > *:nth-child(3) {
  animation-delay: 200ms;
}
.studios-grid > *:nth-child(4) {
  animation-delay: 300ms;
}
.studios-grid > *:nth-child(5) {
  animation-delay: 400ms;
}
.studios-grid > *:nth-child(n + 6) {
  animation-delay: 500ms;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .studio-infographic-card,
  .studios-grid > * {
    animation: none;
    transition: none;
  }

  .studio-infographic-card:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .studio-infographic-card {
    border-width: 2px;
    backdrop-filter: none;
  }

  .logo-wrapper,
  .rating-indicator,
  .favorite-btn-enhanced {
    border-width: 2px;
  }
}
</style>
