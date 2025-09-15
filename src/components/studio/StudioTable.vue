<template>
  <div class="studio-table" class="font-sans">
    <table class="table-responsive">
      <thead>
        <tr>
          <th class="flex-1-select">
            <input 
              type="checkbox" 
              :checked="allSelected" 
              @change="toggleAllSelection"
            />
          </th>
          <th class="flex-1-studio" @click="$emit('sort', 'name')">
            Studio
            <AppIcon name="Bars3BottomLeftIcon" class="sort-icon" />
          </th>
          <th class="flex-1-location" @click="$emit('sort', 'location')">
            Location
            <AppIcon name="Bars3BottomLeftIcon" class="sort-icon" />
          </th>
          <th class="flex-1-type" @click="$emit('sort', 'type')">
            Type
          </th>
          <th class="flex-1-size" @click="$emit('sort', 'size')">
            Size
          </th>
          <th class="flex-1-founded" @click="$emit('sort', 'founded')">
            Founded
          </th>
          <th class="flex-1-games">
            Games
          </th>
          <th class="flex-1-ai-score" @click="$emit('sort', 'aiScore')">
            AI Score
          </th>
          <th class="flex-1-actions">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="studio in studios" 
          :key="studio.id"
          class="studio-flex flex-wrap"
          :class="{ 
            'flex flex-wrap-selected': selectedStudios.includes(studio.id),
            'flex flex-wrap-favorite': favoriteStudios.includes(studio.id)
          }"
        >
          <td class="flex-1-select">
            <input 
              type="checkbox" 
              :checked="selectedStudios.includes(studio.id)"
              @change="$emit('toggle-selection', studio.id)"
            />
          </td>
          <td class="flex-1-studio">
            <div class="studio-cell">
              <div class="studio-logo">
                <img v-if="studio.logo" :src="studio.logo" :alt="studio.name" @error="onLogoError" />
                <div v-else class="logo-placeholder">{{ studio.name?.charAt(0) }}</div>
              </div>
              <div class="studio-info">
                <div class="studio-name">{{ studio.name }}</div>
                <div v-if="studio.description" class="studio-desc">
                  {{ truncateText(studio.description, 60) }}
                </div>
              </div>
            </div>
          </td>
          <td class="flex-1-location">
            {{ studio.headquarters || studio.location || 'Unknown' }}
          </td>
          <td class="flex-1-type">
            <span v-if="(studio as any).type || (studio as any).category" class="type-badge">
              {{ (studio as any).type || (studio as any).category }}
            </span>
          </td>
          <td class="flex-1-size">
            {{ studio.size || 'Unknown' }}
          </td>
          <td class="flex-1-founded">
            {{ studio.founded || 'Unknown' }}
          </td>
          <td class="flex-1-games">
            <div v-if="studio.games?.length" class="games-preview">
              {{ studio.games.slice(0, 2).join(', ') }}
              <span v-if="studio.games.length > 2" class="more-count">
                +{{ studio.games.length - 2 }}
              </span>
            </div>
          </td>
          <td class="flex-1-ai-score">
            <div v-if="aiScores && aiScores[studio.id] !== undefined" class="ai-score-cell">
              <div class="score-indicator" :class="getScoreClass(aiScores[studio.id])">
                {{ Math.round(aiScores[studio.id]) }}
              </div>
            </div>
          </td>
          <td class="flex-1-actions">
            <div class="action-buttons">
              <button 
                class="action-btn favorite-btn"
                :class="{ active: favoriteStudios.includes(studio.id) }"
                @click="$emit('toggle-favorite', studio.id)"
              >
                <AppIcon name="HeartIcon" />
              </button>
              <button 
                class="action-btn details-btn"
                @click="$emit('view-details', studio)"
              >
                <AppIcon name="InformationCircleIcon" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Bars3BottomLeftIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'

import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{
  studios: any[]
  favoriteStudios: string[]
  aiScores?: Record<string, number>
  selectedStudios: string[]
}>()

const emit = defineEmits<{
  'toggle-favorite': [studioId: string]
  'toggle-selection': [studioId: string]
  'view-details': [studio: any]
  'sort': [column: string]
}>()

const allSelected = computed(() => {
  return props.studios.length > 0 && props.studios.every(s => props.selectedStudios.includes(s.id))
})

function toggleAllSelection() {
  if (allSelected.value) {
    props.studios.forEach(s => emit('toggle-selection', s.id))
  } else {
    props.studios.forEach(s => {
      if (!props.selectedStudios.includes(s.id)) {
        emit('toggle-selection', s.id)
      }
    })
  }
}

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
.studio-table {
  overflow-x: auto;
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.table-responsive {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th {
  padding: var(--spacing-4);
  background: var(--glass-bg);
  border-b: 2px solid var(--glass-border);
  font-weight: 600;
  color: var(--text-primary-600);
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

th:hover {
  background: var(--glass-surface);
}

.sort-icon {
  margin-left: var(--spacing-1);
  opacity: 0.5;
}

td {
  padding: var(--spacing-3) var(--spacing-4);
  border-b: 1px solid var(--glass-border);
  color: var(--text-primary-600);
}

.studio-flex flex-wrap {
  transition: background-color 0.2s ease;
}

.studio-flex flex-wrap:hover {
  background: color-mix(in srgb, var(--color-primary-500) 3%, var(--glass-surface));
}

.studio-flex flex-wrap.flex flex-wrap-selected {
  background: color-mix(in srgb, var(--color-primary-500) 8%, var(--glass-surface));
}

.studio-flex flex-wrap.flex flex-wrap-favorite {
  border-l: 4px solid var(--color-error-500);
}

.studio-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.studio-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.studio-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  font-weight: 700;
  color: var(--text-secondary);
}

.studio-info {
  min-width: 0;
}

.studio-name {
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.studio-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Local type-badge replaced by unified alias */

.games-preview {
  font-size: 0.875rem;
}

.more-count {
  color: var(--text-secondary);
  font-style: italic;
}

.ai-score-cell {
  display: flex;
  justify-content: center;
}

.score-indicator {
  width: 32px;
  height: 32px;
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
  background: color-mix(in srgb, var(--color-success-500) 15%, transparent);
}

.score-good {
  color: var(--color-info-600);
  border-color: var(--color-info-500);
  background: color-mix(in srgb, var(--color-info-500) 15%, transparent);
}

.score-fair {
  color: var(--color-warning-600);
  border-color: var(--color-warning-500);
  background: color-mix(in srgb, var(--color-warning-500) 15%, transparent);
}

.score-poor {
  color: var(--color-error-600);
  border-color: var(--color-error-500);
  background: color-mix(in srgb, var(--color-error-500) 15%, transparent);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  width: 28px;
  height: 28px;
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
  color: var(--text-primary-600);
}

.favorite-btn.active {
  background: var(--color-error-500);
  color: white;
  border-color: var(--color-error-500);
}

/* Column widths */
.flex-1-select { width: 50px; text-align: center; }
.flex-1-studio { min-width: 250px; }
.flex-1-location { min-width: 150px; }
.flex-1-type { width: 100px; }
.flex-1-size { width: 120px; }
.flex-1-founded { width: 100px; }
.flex-1-games { min-width: 200px; }
.flex-1-ai-score { width: 100px; text-align: center; }
.flex-1-actions { width: 100px; text-align: center; }

/* Dark theme adjustments */
[data-theme="dark"] th {
  background: var(--surface-elevated);
}

[data-theme="dark"] .studio-logo {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}
</style>
