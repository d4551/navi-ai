<template>
  <div
    class="studio-card glass-card section-card interactive-hover enhanced-glass-card"
    :class="{
      'card-selected': isSelected,
      'card-favorite': isFavorite,
      'card-ai-scored': aiScore !== undefined,
    }"
  >
    <!-- Card Header -->
    <div class="card-header section-header glass-header">
      <div class="studio-logo-section">
        <div class="logo-container">
          <img
            v-if="studio.logo"
            :src="studio.logo"
            :alt="studio.name"
            class="studio-logo"
            @error="onLogoError"
          />
          <div v-else class="logo-placeholder">
            {{ studio.name?.charAt(0) || "?" }}
          </div>
        </div>

        <div class="studio-badges">
          <span v-if="studio.publiclyTraded" class="badge bg-info-subtle">
            <AppIcon name="mdi-chart-bar" color="info" />
            Public
          </span>
          <span
            v-if="(studio as any).type || (studio as any).category"
            class="badge bg-info"
          >
            {{ (studio as any).type || (studio as any).category }}
          </span>
        </div>
      </div>

      <div class="card-actions">
        <button
          class="action-btn favorite-btn glass-action-btn"
          :class="{ active: isFavorite }"
          :title="isFavorite ? 'Remove from watchlist' : 'Add to watchlist'"
          @click.stop="$emit('toggle-favorite', studio.id)"
        >
          <AppIcon name="mdi-heart" />
        </button>

        <button
          class="action-btn select-btn glass-action-btn"
          :class="{ active: isSelected }"
          title="Select for comparison"
          @click.stop="$emit('toggle-selection', studio.id)"
        >
          <AppIcon name="mdi-checkbox-marked-circle" />
        </button>
      </div>
    </div>

    <!-- AI Score Indicator with Enhanced Visual Hierarchy -->
    <div
      v-if="aiScore !== undefined"
      class="ai-score-indicator enhanced-score-badge"
    >
      <div class="score-circle" :class="getScoreClass(aiScore)">
        <span class="score-value">{{ Math.round(aiScore) }}</span>
        <span class="score-label">AI Match</span>
      </div>
      <div class="score-glow" :class="getScoreClass(aiScore)"></div>
    </div>

    <!-- Studio Info -->
    <div class="studio-info">
      <h3 class="studio-name" :title="studio.name">{{ studio.name }}</h3>
      <div
        v-if="studio.dataSource || studio.confidence !== undefined"
        class="source-row"
      >
        <span
          v-if="studio.dataSource?.length"
          class="source-badge"
          :title="`Sources: ${studio.dataSource.join(', ')}`"
        >
          <AppIcon name="mdi-database" />
          {{ compactSources(studio.dataSource) }}
        </span>
        <span
          v-if="studio.confidence !== undefined"
          class="confidence-badge"
          :class="confidenceClass(studio.confidence)"
          :title="`Confidence ${(studio.confidence * 100).toFixed(1)}%`"
        >
          {{ (studio.confidence * 100).toFixed(0) }}%
        </span>
      </div>

      <div class="studio-location enhanced-location">
        <AppIcon name="mdi-map-marker" class="location-icon" />
        <span class="location-text">{{
          studio.headquarters || studio.location || "Location Unknown"
        }}</span>
      </div>

      <p v-if="studio.description" class="studio-description">
        {{ truncateText(studio.description, 100) }}
      </p>

      <!-- Enhanced Key Metrics with Visual Improvements -->
      <div class="studio-metrics enhanced-metrics">
        <div v-if="studio.founded" class="metric metric-founded">
          <div class="metric-icon-wrapper">
            <AppIcon name="mdi-calendar" class="metric-icon" />
          </div>
          <span class="metric-text">Est. {{ studio.founded }}</span>
        </div>
        <div v-if="studio.size" class="metric metric-size">
          <div class="metric-icon-wrapper">
            <AppIcon name="mdi-account-group" class="metric-icon" />
          </div>
          <span class="metric-text">{{ studio.size }}</span>
        </div>
        <div v-if="studio.games?.length" class="metric metric-games">
          <div class="metric-icon-wrapper">
            <AppIcon
              name="mdi-gamepad-variant"
              context="gaming"
              class="metric-icon"
            />
          </div>
          <span class="metric-text">{{ studio.games.length }} games</span>
        </div>
      </div>

      <!-- Popular Games -->
      <div v-if="studio.games?.length" class="featured-games">
        <h4 class="section-title">Popular Games</h4>
        <div class="games-list">
          <span
            v-for="game in studio.games.slice(0, 3)"
            :key="game"
            class="game-tag"
          >
            {{ game }}
          </span>
          <span v-if="studio.games.length > 3" class="more-count">
            +{{ studio.games.length - 3 }} more
          </span>
        </div>
      </div>

      <!-- Tech Stack Preview -->
      <div v-if="studio.technologies?.length" class="tech-stack">
        <h4 class="section-title">Tech Stack</h4>
        <div class="tech-tags">
          <span
            v-for="tech in studio.technologies.slice(0, 4)"
            :key="tech"
            class="tech-tag"
          >
            {{ tech }}
          </span>
          <span v-if="studio.technologies.length > 4" class="more-count">
            +{{ studio.technologies.length - 4 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- Card Footer Actions -->
    <div class="card-footer">
      <UnifiedButton
        color="glass"
        appearance="outlined"
        size="sm"
        leading-icon="mdi-information-outline"
        @click="$emit('view-details', studio)"
      >
        Details
      </UnifiedButton>

      <UnifiedButton
        color="gaming"
        size="sm"
        leading-icon="mdi-briefcase-outline"
        @click="$emit('view-jobs', studio)"
      >
        View Jobs
      </UnifiedButton>

      <UnifiedButton
        color="cyber"
        appearance="outlined"
        size="sm"
        leading-icon="mdi-microphone"
        title="Practice interview for this studio"
        @click="$emit('quick-apply', studio)"
      >
        Interview
      </UnifiedButton>
    </div>

    <!-- Hover Overlay for Quick Actions -->
    <div class="card-overlay">
      <div class="overlay-actions">
        <UnifiedButton
          color="gaming"
          leading-icon="mdi-target"
          @click="$emit('quick-apply', studio)"
        >
          Quick Interview Prep
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

defineProps<{
  studio: any;
  isFavorite: boolean;
  aiScore?: number;
  isSelected: boolean;
}>();

defineEmits<{
  "toggle-favorite": [studioId: string];
  "toggle-selection": [studioId: string];
  "view-details": [studio: any];
  "view-jobs": [studio: any];
  "quick-apply": [studio: any];
}>();

function onLogoError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function getScoreClass(score: number): string {
  if (score >= 80) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-fair";
  return "score-poor";
}

function compactSources(sources: string[]): string {
  if (!sources) return "";
  const uniq = Array.from(new Set(sources));
  if (uniq.length <= 2) return uniq.join(", ");
  return uniq.slice(0, 2).join(", ") + ` +${uniq.length - 2}`;
}

function confidenceClass(c: number) {
  if (c >= 0.75) return "conf-high";
  if (c >= 0.5) return "conf-mid";
  return "conf-low";
}
</script>

<style scoped>
.studio-card {
  position: relative;
  padding: var(--card-padding);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal) var(--easing-ease-out);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  contain: layout style paint;
}

.studio-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    var(--glass-shadow),
    0 12px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
  background: var(--glass-hover-bg);
}

.studio-card.card-selected {
  border-color: var(--color-primary-500);
  background: color-mix(in srgb, var(--color-primary-500) 5%, var(--glass-bg));
  box-shadow:
    var(--glass-shadow),
    0 0 0 1px var(--color-primary-500);
}

.studio-card.card-favorite::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent #ec4899 transparent transparent;
}

.studio-card.card-ai-scored {
  background: linear-gradient(
    135deg,
    var(--glass-bg) 0%,
    color-mix(in srgb, var(--color-primary-500) 3%, var(--glass-bg)) 100%
  );
  border-left: 3px solid
    color-mix(in srgb, var(--color-primary-500) 60%, transparent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.studio-logo-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.logo-container {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.studio-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.studio-badges {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}


.card-actions {
  display: flex;
}

.action-btn {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
  box-shadow: var(--shadow-sm);
}

.action-btn:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
  box-shadow:
    var(--shadow-md),
}

.favorite-btn.active {
  color: white;
}

.select-btn.active {
  color: white;
}

.ai-score-indicator {
  position: absolute;
}

.enhanced-score-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-glow {
  position: absolute;
}

.score-glow.score-high {
}

.score-glow.score-medium {
}

.score-glow.score-low {
}

@keyframes pulse-glow {
  from {
  }
  to {
  }
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--glass-surface);
}

.score-excellent {
  background: color-mix(
    in srgb,
    var(--glass-surface)
  );
}

.score-good {
  background: color-mix(
    in srgb,
    var(--glass-surface)
  );
}

.score-fair {
  background: color-mix(
    in srgb,
    var(--glass-surface)
  );
}

.score-poor {
  background: color-mix(
    in srgb,
    var(--glass-surface)
  );
}

.score-value {
}

.score-label {
}

.studio-info {
  display: flex;
  flex-direction: column;
}

.studio-name {
  color: var(--text-primary);
}

.source-row {
  display: flex;
  flex-wrap: wrap;
}


.studio-location {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.enhanced-location {
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.enhanced-location:hover {
}

.location-icon {
}

.location-text {
  font-weight: var(--font-weight-medium);
}

.studio-description {
  color: var(--text-primary);
}

.studio-metrics {
  display: flex;
  flex-wrap: wrap;
}

.enhanced-metrics {
}

.enhanced-metrics .metric {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.enhanced-metrics .metric:hover {
  background: var(--glass-hover-bg);
  box-shadow: var(--shadow-sm);
}

.metric-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon {
  font-size: var(--font-size-sm);
}

.metric-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.metric {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.section-title {
  color: var(--text-primary);
}

.featured-games,
.tech-stack {
  display: flex;
  flex-direction: column;
}

.games-list,
.tech-tags {
  display: flex;
  flex-wrap: wrap;
}

.game-tag,
.tech-tag {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.game-tag {
  background: color-mix(
    in srgb,
    var(--glass-bg)
  );
  border-color: color-mix(
    in srgb,
    transparent
  );
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
}

.tech-tag {
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
}

.more-count {
  background: var(--glass-surface);
  color: var(--text-secondary);
  font-style: italic;
}

.card-footer {
  display: flex;
  position: relative;
}

.card-overlay {
  position: absolute;
  background: linear-gradient(
    to bottom,
  );
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

@media (hover: hover) {
  .studio-card:hover .card-overlay {
  }
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
}

  .studio-card {
  }
  .card-overlay {
  }

  .card-footer {
    flex-direction: column;
  }

  .studio-metrics {
    flex-direction: column;
  }

  .ai-score-indicator {
    position: static;
    align-self: flex-end;
  }
}

[data-theme="dark"] .studio-card,
[data-theme="dark"] .enhanced-glass-card {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="dark"] .logo-container {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="dark"] .enhanced-location {
}

[data-theme="dark"] .enhanced-location:hover {
}

[data-theme="dark"] .enhanced-metrics .metric {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="dark"] .enhanced-metrics .metric:hover {
  background: var(--glass-hover-bg);
}

[data-theme="light"] .studio-card,
[data-theme="light"] .enhanced-glass-card {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.studio-card,
.enhanced-glass-card,
.logo-container,
.enhanced-location,
.enhanced-metrics .metric,
.action-btn {
  transition:
    background-color var(--duration-normal),
    border-color var(--duration-normal),
    color var(--duration-normal),
    box-shadow var(--duration-normal),
    transform var(--duration-normal);
}

@media (prefers-reduced-motion: reduce) {
  .studio-card,
  .enhanced-glass-card {
    transition: none;
  }

  .studio-card:hover,
  .enhanced-glass-card:hover {
    transform: none;
  }

  .score-glow {
    animation: none;
  }
}

@media (prefers-contrast: high) {
  .studio-card,
  .enhanced-glass-card {
    backdrop-filter: none;
  }

  .enhanced-metrics .metric {
    backdrop-filter: none;
  }
}

.studio-card:focus-visible {
  outline: none;
  box-shadow:
    var(--glass-shadow),
}

.action-btn:focus-visible {
  outline: none;
  box-shadow:
    var(--shadow-sm),
}

.game-tag:hover,
.tech-tag:hover {
  box-shadow: var(--shadow-xs);
}

.game-tag:hover {
  background: color-mix(
    in srgb,
    var(--glass-bg)
  );
}

.tech-tag:hover {
}
</style>
