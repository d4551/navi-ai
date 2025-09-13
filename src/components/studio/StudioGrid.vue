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
            >{{ (studio as any).type || (studio as any).category }}</span>
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
            <AppIcon name="mdi-calendar" /><span>Est. {{ studio.founded }}</span>
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
          >
            View Jobs
          </UnifiedButton>
          <UnifiedButton
            color="glass"
            appearance="outlined"
            leading-icon="mdi-information-outline"
            @click.stop="$emit('open-details', studio)"
          >
            Details
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

defineProps<{
  studios: any[];
  aiScoreMap?: Record<string, number>;
  favoriteIds: string[];
}>();

function onImgErr(e: Event) {
  const el = e.target as HTMLImageElement;
  el.style.display = "none";
}
</script>

<style scoped>

.studios-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
  );
}

.studio-infographic-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  padding: var(--card-padding);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
  display: flex;
  flex-direction: column;
  contain: layout style paint;
}

.studio-infographic-card:hover {
  box-shadow:
    var(--glass-shadow),
  background: var(--glass-hover-bg);
}

.studio-infographic-card:focus-visible {
  outline: none;
  box-shadow:
    var(--glass-shadow),
}

.studio-card-header {
  display: flex;
  flex-direction: column;
}

.studio-logo-container {
  display: flex;
  align-items: center;
}

.logo-wrapper {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}

.studio-logo-image {
  object-fit: cover;
}

.logo-placeholder-enhanced {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
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
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.studio-primary-info {
  display: flex;
  flex-direction: column;
}

.studio-name-enhanced {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-heading);
}

.studio-location-enhanced {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.studio-meta-badges {
  display: flex;
  flex-wrap: wrap;
}

.meta-badge {
  color: var(--text-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.studio-actions-header {
  display: flex;
  align-items: center;
  align-self: flex-start;
}

.favorite-btn-enhanced {
  border-radius: var(--radius-md);
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
}

.favorite-btn-enhanced.active {
  color: white;
}

.rating-indicator {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.ai-score-chip {
}

.studio-kpis-section {
  border-radius: var(--radius-md);
}

.kpi-grid {
  display: grid;
}

.kpi-item {
  display: flex;
  align-items: center;
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-data {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.studio-card-footer {
  display: flex;
  flex-direction: column;
  margin-top: auto;
}

.footer-stats {
  display: flex;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.footer-actions {
  display: flex;
}

  .studios-grid {
  }
}

  .studios-grid {
  }

  .studio-infographic-card {
  }

  .footer-actions {
    flex-direction: column;
  }

  .kpi-grid {
  }
}

  .studio-infographic-card {
  }

  .studio-card-header {
  }

  .kpi-grid {
  }
}

}

@keyframes slideInUp {
  from {
  }
  to {
  }
}

}
}
}
}
}
}

@media (prefers-reduced-motion: reduce) {
  .studio-infographic-card,
    animation: none;
    transition: none;
  }

  .studio-infographic-card:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .studio-infographic-card {
    backdrop-filter: none;
  }

  .logo-wrapper,
  .rating-indicator,
  .favorite-btn-enhanced {
  }
}
</style>
