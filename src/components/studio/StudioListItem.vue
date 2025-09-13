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
            {{ studio.name?.charAt(0) || "?" }}
          </div>
        </div>

        <div class="studio-basic-info">
          <h3 class="studio-name">{{ studio.name }}</h3>
          <div class="studio-location">
            <AppIcon name="mdi-map-marker" />
            {{ studio.headquarters || studio.location || "Location Unknown" }}
          </div>
          <div class="studio-meta">
            <span
              v-if="(studio as any).type || (studio as any).category"
              class="meta-badge"
            >
              {{ (studio as any).type || (studio as any).category }}
            </span>
            <span v-if="studio.founded" class="meta-item">Est. {{ studio.founded }}</span>
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
import { ref } from "vue";
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
}>();

const showQuickInfo = ref(false);

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


.meta-item {
  color: var(--text-secondary);
}

.studio-details {
}

.studio-description {
  color: var(--text-primary);
}

.detail-sections {
  display: flex;
  flex-direction: column;
}

.detail-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
}

.tag {
}

.game-tag {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.tech-tag {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.role-tag {
  border-color: color-mix(
    in srgb,
    var(--glass-border)
  );
}

.more-indicator {
  background: var(--glass-surface);
  color: var(--text-secondary);
  font-style: italic;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ai-score-compact {
  display: flex;
  align-items: center;
}

.score-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
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

.score-label {
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
}

.action-btn {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--glass-surface);
  color: var(--text-primary);
}

.favorite-btn.active {
  color: white;
}

.select-btn.active {
  color: white;
}

.primary-actions {
  display: flex;
}

.quick-info-panel {
}

.info-grid {
  display: grid;
}

.info-section {
  display: flex;
  flex-direction: column;
}

.info-title {
  color: var(--text-primary);
}

.info-text {
  color: var(--text-primary);
}

.values-list {
  display: flex;
  flex-wrap: wrap;
}

.value-tag {
}

  .item-content {
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
  }

  .action-buttons {
  }

  .primary-actions {
  }
}

  .studio-identity {
    flex-direction: column;
    text-align: center;
  }

  .item-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-actions {
    display: grid;
  }
}

[data-theme="dark"] .studio-list-item {
  background: var(--surface-elevated);
}

[data-theme="dark"] .logo-container {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme="dark"] .tag {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}
</style>
