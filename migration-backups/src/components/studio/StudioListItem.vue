<template>
  <div
    class="studio-list-item glass-card section-card interactive-hover"
    :class="{
      'item-selected': isSelected,
      'item-favorite': isFavorite,
    }"
  >
    <div class="item-content">
      <!-- Studio Logo & Basic Info -->
      <div class="studio-identity">
        <div class="logo-container">
          <img
            v-if="studio.logo"
            :src="studio.logo"
            :alt="studio.name"
            class="studio-logo"
            @error="onLogoError"
          />
          <div v-else class="logo-placeholder">
            {{ studio.name?.charAt(0) || '?' }}
          </div>
        </div>

        <div class="studio-basic-info">
          <h3 class="studio-name">{{ studio.name }}</h3>
          <div class="studio-location">
            <AppIcon name="mdi-map-marker" />
            {{ studio.headquarters || studio.location || 'Location Unknown' }}
          </div>
          <div class="studio-meta">
            <span
              v-if="(studio as any).type || (studio as any).category"
              class="meta-badge"
            >
              {{ (studio as any).type || (studio as any).category }}
            </span>
            <span v-if="studio.founded" class="meta-item"
              >Est. {{ studio.founded }}</span
            >
            <span v-if="studio.size" class="meta-item">{{ studio.size }}</span>
          </div>
        </div>
      </div>

      <!-- Studio Details -->
      <div class="studio-details">
        <p v-if="studio.description" class="studio-description">
          {{ truncateText(studio.description, 150) }}
        </p>

        <div class="detail-sections">
          <!-- Games -->
          <div v-if="studio.games?.length" class="detail-section">
            <h4 class="section-title">
              <AppIcon name="mdi-gamepad-variant" context="gaming" />
              Games ({{ studio.games.length }})
            </h4>
            <div class="tags-list">
              <span
                v-for="game in studio.games.slice(0, 3)"
                :key="game"
                class="tag game-tag"
              >
                {{ game }}
              </span>
              <span v-if="studio.games.length > 3" class="more-indicator">
                +{{ studio.games.length - 3 }} more
              </span>
            </div>
          </div>

          <!-- Technologies -->
          <div v-if="studio.technologies?.length" class="detail-section">
            <h4 class="section-title">
              <AppIcon name="mdi-cog" />
              Tech Stack
            </h4>
            <div class="tags-list">
              <span
                v-for="tech in studio.technologies.slice(0, 4)"
                :key="tech"
                class="tag tech-tag"
              >
                {{ tech }}
              </span>
              <span
                v-if="studio.technologies.length > 4"
                class="more-indicator"
              >
                +{{ studio.technologies.length - 4 }} more
              </span>
            </div>
          </div>

          <!-- Common Roles -->
          <div v-if="studio.commonRoles?.length" class="detail-section">
            <h4 class="section-title">
              <AppIcon name="mdi-account-group" />
              Common Roles
            </h4>
            <div class="tags-list">
              <span
                v-for="role in studio.commonRoles.slice(0, 3)"
                :key="role"
                class="tag role-tag"
              >
                {{ role }}
              </span>
              <span v-if="studio.commonRoles.length > 3" class="more-indicator">
                +{{ studio.commonRoles.length - 3 }} more
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions & Score -->
      <div class="item-actions">
        <!-- AI Score -->
        <div v-if="aiScore !== undefined" class="ai-score-compact">
          <div class="score-indicator" :class="getScoreClass(aiScore)">
            <span class="score-value">{{ Math.round(aiScore) }}</span>
          </div>
          <span class="score-label">AI Match</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            class="action-btn favorite-btn"
            :class="{ active: isFavorite }"
            :title="isFavorite ? 'Remove from watchlist' : 'Add to watchlist'"
            @click.stop="$emit('toggle-favorite', studio.id)"
          >
            <AppIcon name="mdi-heart" />
          </button>

          <button
            class="action-btn select-btn"
            :class="{ active: isSelected }"
            title="Select for comparison"
            @click.stop="$emit('toggle-selection', studio.id)"
          >
            <AppIcon name="mdi-checkbox-marked-circle" />
          </button>
        </div>

        <div class="primary-actions">
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
            Jobs
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Expandable Quick Info Panel -->
    <div v-if="showQuickInfo" class="quick-info-panel">
      <div class="info-grid">
        <div v-if="studio.culture?.values?.length" class="info-section">
          <h5 class="info-title">Culture & Values</h5>
          <div class="values-list">
            <span
              v-for="value in studio.culture.values.slice(0, 4)"
              :key="value"
              class="value-tag"
            >
              {{ value }}
            </span>
          </div>
        </div>

        <div v-if="studio.interviewStyle" class="info-section">
          <h5 class="info-title">Interview Style</h5>
          <p class="info-text">{{ studio.interviewStyle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
}>()

const showQuickInfo = ref(false)

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
</script>

<style scoped>
.studio-list-item {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
}

.studio-list-item:hover {
  border-color: var(--color-primary-300);
  background: color-mix(
    in srgb,
    var(--color-primary-500) 2%,
    var(--glass-surface)
  );
  transform: translateX(4px);
}

.studio-list-item.item-selected {
  border-color: var(--color-primary-500);
  background: color-mix(
    in srgb,
    var(--color-primary-500) 5%,
    var(--glass-surface)
  );
}

.studio-list-item.item-favorite {
  border-left: 4px solid var(--color-error-500);
}

.item-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-4);
  align-items: start;
}

.studio-identity {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  min-width: 280px;
}

.logo-container {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.studio-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.studio-basic-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.studio-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.studio-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.studio-meta {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-wrap: wrap;
}

/* Local meta-badge replaced by unified alias */

.meta-item {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.studio-details {
  flex: 1;
  min-width: 0;
}

.studio-description {
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0 0 var(--spacing-3) 0;
  opacity: 0.9;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.tag {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: 999px;
  font-size: 0.75rem;
  border: 1px solid;
}

.game-tag {
  background: color-mix(in srgb, var(--color-gaming-500) 10%, var(--glass-bg));
  border-color: color-mix(
    in srgb,
    var(--color-gaming-500) 20%,
    var(--glass-border)
  );
  color: var(--color-gaming-600);
}

.tech-tag {
  background: color-mix(in srgb, var(--color-info-500) 10%, var(--glass-bg));
  border-color: color-mix(
    in srgb,
    var(--color-info-500) 20%,
    var(--glass-border)
  );
  color: var(--color-info-600);
}

.role-tag {
  background: color-mix(in srgb, var(--color-success-500) 10%, var(--glass-bg));
  border-color: color-mix(
    in srgb,
    var(--color-success-500) 20%,
    var(--glass-border)
  );
  color: var(--color-success-600);
}

.more-indicator {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  align-items: flex-end;
  min-width: 200px;
}

.ai-score-compact {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.score-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  border: 2px solid;
}

.score-excellent {
  color: var(--color-success-600);
  border-color: var(--color-success-500);
  background: color-mix(
    in srgb,
    var(--color-success-500) 15%,
    var(--glass-surface)
  );
}

.score-good {
  color: var(--color-info-600);
  border-color: var(--color-info-500);
  background: color-mix(
    in srgb,
    var(--color-info-500) 15%,
    var(--glass-surface)
  );
}

.score-fair {
  color: var(--color-warning-600);
  border-color: var(--color-warning-500);
  background: color-mix(
    in srgb,
    var(--color-warning-500) 15%,
    var(--glass-surface)
  );
}

.score-poor {
  color: var(--color-error-600);
  border-color: var(--color-error-500);
  background: color-mix(
    in srgb,
    var(--color-error-500) 15%,
    var(--glass-surface)
  );
}

.score-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
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
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--glass-surface);
  color: var(--text-primary);
  border-color: var(--color-primary-300);
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

.primary-actions {
  display: flex;
  gap: var(--spacing-2);
}

.quick-info-panel {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--glass-border);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.info-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.info-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0;
  opacity: 0.9;
}

.values-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.value-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: color-mix(in srgb, var(--color-warning-500) 10%, var(--glass-bg));
  border: 1px solid
    color-mix(in srgb, var(--color-warning-500) 20%, var(--glass-border));
  color: var(--color-warning-600);
  border-radius: 999px;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .item-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }

  .studio-identity {
    min-width: auto;
  }

  .item-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }

  .ai-score-compact {
    order: 1;
  }

  .action-buttons {
    order: 2;
  }

  .primary-actions {
    order: 3;
  }
}

@media (max-width: 768px) {
  .studio-identity {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-2);
  }

  .item-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }

  .primary-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2);
  }
}

/* Dark theme adjustments */
[data-theme='dark'] .studio-list-item {
  background: var(--surface-elevated);
}

[data-theme='dark'] .logo-container {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme='dark'] .tag {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}
</style>
