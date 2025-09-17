<template>
  <div 
    class="studio-card glass-card section-card interactive-hover enhanced-glass-card font-sans"
    :class="{ 
      'card-selected': isSelected,
      'card-favorite': isFavorite,
      'card-ai-scored': aiScore !== undefined
    }"
  >
    <!-- Card Header -->
    <div class="card-header section-header glass-header">
      <div class="studio-logo-section">
        <div class="logo-container">
          <img v-if="studio.logo" :src="studio.logo" :alt="studio.name" class="studio-logo" @error="onLogoError" />
          <div v-else class="logo-placeholder">
            {{ studio.name?.charAt(0) || '?' }}
          </div>
        </div>
        
        <div class="studio-badges">
          <span v-if="studio.publiclyTraded" class="badge bg-blue-500-subtle">
            <AppIcon name="ChartBarSquareIcon" color="info" />
            Public
          </span>
          <span v-if="(studio as any).type || (studio as any).category" class="badge bg-blue-500">
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
          <AppIcon name="HeartIcon" />
        </button>
        
        <button 
          class="action-btn select-btn glass-action-btn"
          :class="{ active: isSelected }"
          title="Select for comparison"
          @click.stop="$emit('toggle-selection', studio.id)"
        >
          <AppIcon name="CheckIconbox-marked-circle" />
        </button>
      </div>
    </div>

    <!-- AI Score Indicator with Enhanced Visual Hierarchy -->
    <div v-if="aiScore !== undefined" class="ai-score-indicator enhanced-score-badge">
      <div class="score-circle" :class="getScoreClass(aiScore)">
        <span class="score-value">{{ Math.round(aiScore) }}</span>
        <span class="score-label">AI Match</span>
      </div>
      <div class="score-glow" :class="getScoreClass(aiScore)"></div>
    </div>

    <!-- Studio Info -->
    <div class="studio-info">
      <h3 class="studio-name" :title="studio.name">{{ studio.name }}</h3>
      <div v-if="studio.dataSource || studio.confidence !== undefined" class="source-flex flex-wrap">
        <span v-if="studio.dataSource?.length" class="source-badge" :title="`Sources: ${studio.dataSource.join(', ')}`">
          <AppIcon name="CircleStackIcon" />
          {{ compactSources(studio.dataSource) }}
        </span>
        <span v-if="studio.confidence !== undefined" class="confidence-badge" :class="confidenceClass(studio.confidence)" :title="`Confidence ${(studio.confidence*100).toFixed(1)}%`">
          {{ (studio.confidence * 100).toFixed(0) }}%
        </span>
      </div>
      
      <div class="studio-location enhanced-location">
        <AppIcon name="MapPinIcon" class="location-icon" />
        <span class="location-text">{{ studio.headquarters || studio.location || 'Location Unknown' }}</span>
      </div>

      <p v-if="studio.description" class="studio-description">
        {{ truncateText(studio.description, 100) }}
      </p>

      <!-- Enhanced Key Metrics with Visual Improvements -->
      <div class="studio-metrics enhanced-metrics">
        <div v-if="studio.founded" class="metric metric-founded">
          <div class="metric-icon-wrapper">
            <AppIcon name="CalendarIcon" class="metric-icon" />
          </div>
          <span class="metric-text">Est. {{ studio.founded }}</span>
        </div>
        <div v-if="studio.size" class="metric metric-size">
          <div class="metric-icon-wrapper">
            <AppIcon name="UsersIcon" class="metric-icon" />
          </div>
          <span class="metric-text">{{ studio.size }}</span>
        </div>
        <div v-if="studio.games?.length" class="metric metric-games">
          <div class="metric-icon-wrapper">
            <AppIcon name="PuzzlePieceIcon" context="gaming" class="metric-icon" />
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
        leading-icon="InformationCircleIcon"
        @click="$emit('view-details', studio)"
      >
        Details
      </UnifiedButton>
      
      <UnifiedButton 
        color="gaming" 
        size="sm"
        leading-icon="BriefcaseIcon"
        @click="$emit('view-jobs', studio)"
      >
        View Jobs
      </UnifiedButton>
      
      <UnifiedButton 
        color="cyber"
        appearance="outlined"
        size="sm"
        leading-icon="MicrophoneIcon"
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
          leading-icon="EyeIcon"
          @click="$emit('quick-apply', studio)"
        >
          Quick Interview Prep
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BriefcaseIcon, CalendarIcon, ChartBarSquareIcon, CircleStackIcon, EyeIcon, InformationCircleIcon, MicrophoneIcon, PuzzlePieceIcon, UsersIcon } from '@heroicons/vue/24/outline'
import { HeartIcon, MapPinIcon } from '@heroicons/vue/24/solid'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

defineProps<{
  studio: any
  isFavorite: boolean
  aiScore?: number
  isSelected: boolean
}>()

defineEmits<{
  'toggle-favorite': [studioId: string]
  'toggle-selection': [studioId: string]
  'view-details': [studio: any]
  'view-jobs': [studio: any]
  'quick-apply': [studio: any]
}>()

function onLogoError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  if (score >= 40) return 'score-fair'
  return 'score-poor'
}

function compactSources(sources: string[]): string {
  if (!sources) return ''
  const uniq = Array.from(new Set(sources))
  if (uniq.length <= 2) return uniq.join(', ')
  return uniq.slice(0,2).join(', ') + ` +${uniq.length - 2}`
}

function confidenceClass(c: number) {
  if (c >= 0.75) return 'conf-high'
  if (c >= 0.5) return 'conf-mid'
  return 'conf-low'
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
  content: '';
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
  background: linear-gradient(135deg, 
    var(--glass-bg) 0%, 
    color-mix(in srgb, var(--color-primary-500) 3%, var(--glass-bg)) 100%
  );
  border-l: 3px solid color-mix(in srgb, var(--color-primary-500) 60%, transparent);
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

/* Local badge styles removed; using unified .badge variants */

.card-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
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
  color: var(--text-primary-600);
  border-color: color-mix(in srgb, var(--color-primary-500) 50%, transparent);
  box-shadow: 
    var(--shadow-glass),
    0 0 12px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  transform: scale(1.05);
}

.favorite-btn.active {
  background: var(--color-error-500);
  color: white;
  border-color: var(--color-error-500);
}

.select-btn.active {
  background: var(--color-success-500);
  color: white;
  border-color: var(--color-success-500);
}

.ai-score-indicator {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  z-index: 10;
}

.enhanced-score-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  border-radius: 50%;
  opacity: 0.3;
  z-index: -1;
  animation: pulse-glow 3s ease-in-out infinite alternate;
}

.score-glow.score-high {
  background: radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent 70%);
}

.score-glow.score-medium {
  background: radial-gradient(circle, rgba(234, 179, 8, 0.4), transparent 70%);
}

.score-glow.score-low {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.4), transparent 70%);
}

@keyframes pulse-glow {
  from { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0.4; transform: translate(-50%, -50%) scale(1.1); }
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  border: 2px solid;
  background: var(--glass-surface);
  backdrop-filter: blur(10px);
}

.score-excellent {
  color: var(--color-success-600);
  border-color: var(--color-success-500);
  background: color-mix(in srgb, var(--color-success-500) 15%, var(--glass-surface));
}

.score-good {
  color: var(--color-info-600);
  border-color: var(--color-info-500);
  background: color-mix(in srgb, var(--color-info-500) 15%, var(--glass-surface));
}

.score-fair {
  color: var(--color-warning-600);
  border-color: var(--color-warning-500);
  background: color-mix(in srgb, var(--color-warning-500) 15%, var(--glass-surface));
}

.score-poor {
  color: var(--color-error-600);
  border-color: var(--color-error-500);
  background: color-mix(in srgb, var(--color-error-500) 15%, var(--glass-surface));
}

.score-value {
  font-size: 1rem;
  line-height: 1;
}

.score-label {
  font-size: 0.625rem;
  opacity: 0.8;
}

.studio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.studio-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary-600);
  margin: 0;
  line-height: 1.2;
}

.source-flex flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: -4px;
}

/* Local source/confidence badges replaced by unified aliases */

.studio-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.enhanced-location {
  padding: var(--spacing-2);
  background: color-mix(in srgb, var(--text-primary-600) 3%, transparent);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
  border: 1px solid color-mix(in srgb, var(--text-primary-600) 6%, transparent);
}

.enhanced-location:hover {
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  transform: translateX(2px);
  border-color: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.location-icon {
  color: var(--color-primary-500);
}

.location-text {
  font-weight: var(--font-weight-medium);
}

.studio-description {
  color: var(--text-primary-600);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  opacity: 0.9;
}

.studio-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.enhanced-metrics {
  gap: var(--spacing-2);
}

.enhanced-metrics .metric {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
  backdrop-filter: blur(8px);
}

.enhanced-metrics .metric:hover {
  background: var(--glass-hover-bg);
  border-color: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.metric-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.metric-icon {
  color: var(--color-primary-500);
  font-size: var(--font-size-sm);
}

.metric-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.metric {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin: 0;
}

.featured-games,
.tech-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.games-list,
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.game-tag,
.tech-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--text-primary-600);
}

.game-tag {
  background: color-mix(in srgb, var(--color-gaming-500, #ff6b35) 10%, var(--glass-bg));
  border-color: color-mix(in srgb, var(--color-gaming-500, #ff6b35) 20%, transparent);
  color: var(--color-gaming-600, #e55a2b);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
}

.tech-tag {
  background: color-mix(in srgb, var(--color-info-500) 10%, var(--glass-bg));
  border-color: color-mix(in srgb, var(--color-info-500) 20%, transparent);
  color: var(--color-info-600);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
}

.more-count {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.card-footer {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-t: 1px solid var(--glass-border);
  position: relative;
  z-index: 3; /* Ensure footer actions remain above hover overlay */
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* Leave footer area undimmed */
  bottom: var(--overlay-footer-safe, 88px);
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.60) 0%,
    rgba(0,0,0,0.45) 55%,
    rgba(0,0,0,0.00) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
  /* Allow clicks to pass through the overlay so card links remain clickable */
  pointer-events: none;
  z-index: 2;
}

/* Show overlay only on devices that actually support hover */
@media (hover: hover) {
  .studio-card:hover .card-overlay { opacity: 1; }
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  align-items: center;
  /* Re-enable interaction only on the action controls */
  pointer-events: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .studio-card {
    padding: var(--spacing-4);
  }
  /* Slightly larger safe area for stacked footer */
  .card-overlay { bottom: var(--overlay-footer-safe-mobile, 112px); }
  
  .card-footer {
    flex-direction: column;
  }
  
  .studio-metrics {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .ai-score-indicator {
    position: static;
    align-self: flex-end;
    margin-bottom: var(--spacing-2);
  }
}

/* Enhanced Light/Dark Mode Integration */
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
  background: rgba(var(--glass-border-rgb, 255, 255, 255), 0.05);
}

[data-theme="dark"] .enhanced-location:hover {
  background: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15);
}

[data-theme="dark"] .enhanced-metrics .metric {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="dark"] .enhanced-metrics .metric:hover {
  background: var(--glass-hover-bg);
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.3);
}

[data-theme="light"] .studio-card,
[data-theme="light"] .enhanced-glass-card {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* Smooth theme transitions */
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

/* Accessibility improvements */
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
    border-width: 2px;
    backdrop-filter: none;
  }
  
  .enhanced-metrics .metric {
    border-width: 2px;
    backdrop-filter: none;
  }
}

/* Focus states for accessibility */
.studio-card:focus-visible {
  outline: none;
  box-shadow: 
    var(--glass-shadow),
    0 0 0 2px var(--color-primary-500);
  transform: translateY(-1px);
}

.action-btn:focus-visible {
  outline: none;
  box-shadow: 
    var(--shadow-sm),
    0 0 0 2px var(--color-primary-500);
}

/* Interactive states */
.game-tag:hover,
.tech-tag:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xs);
}

.game-tag:hover {
  background: color-mix(in srgb, var(--color-gaming-500, #ff6b35) 15%, var(--glass-bg));
}

.tech-tag:hover {
  background: color-mix(in srgb, var(--color-info-500) 15%, var(--glass-bg));
}
</style>
