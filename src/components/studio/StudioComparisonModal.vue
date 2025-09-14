<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="studio-comparison-modal glass-card section-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">Studio Comparison</h2>
        <UnifiedButton variant="ghost" size="sm" icon-only :icon="'mdi-close'" aria-label="Close" @click="$emit('close')" />
      </div>

      <!-- Comparison Content -->
      <div class="modal-content">
        <div class="comparison-grid">
          <!-- Header Row -->
          <div class="header-cell">
            <div class="comparison-label">Compare Studios</div>
          </div>
          <div v-for="studio in studios" :key="studio.id" class="studio-header">
            <div class="studio-identity">
              <div class="logo-container">
                <img v-if="studio.logo" :src="studio.logo" :alt="studio.name" @error="onLogoError" />
                <div v-else class="logo-placeholder">{{ studio.name?.charAt(0) }}</div>
              </div>
              <h3 class="studio-name">{{ studio.name }}</h3>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="comparison-category">
            <h4 class="category-title">Basic Information</h4>
          </div>
          <div v-for="studio in studios" :key="`basic-${studio.id}`" class="studio-data">
            <div class="data-item">
              <span class="data-label">Location:</span>
              <span class="data-value">{{ studio.headquarters || studio.location || 'Unknown' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Founded:</span>
              <span class="data-value">{{ studio.founded || 'Unknown' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Size:</span>
              <span class="data-value">{{ studio.size || 'Unknown' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Type:</span>
              <span class="data-value">{{ (studio as any).type || (studio as any).category || 'Unknown' }}</span>
            </div>
          </div>

          <!-- Games Portfolio -->
          <div class="comparison-category">
            <h4 class="category-title">Games Portfolio</h4>
          </div>
          <div v-for="studio in studios" :key="`games-${studio.id}`" class="studio-data">
            <div v-if="studio.games?.length" class="games-list">
              <div v-for="game in studio.games.slice(0, 5)" :key="game" class="game-tag">
                {{ game }}
              </div>
              <div v-if="studio.games.length > 5" class="more-count">
                +{{ studio.games.length - 5 }} more
              </div>
            </div>
            <div v-else class="no-data">
              No games listed
            </div>
          </div>

          <!-- Technology Stack -->
          <div class="comparison-category">
            <h4 class="category-title">Technology Stack</h4>
          </div>
          <div v-for="studio in studios" :key="`tech-${studio.id}`" class="studio-data">
            <div v-if="studio.technologies?.length" class="tech-list">
              <div v-for="tech in studio.technologies.slice(0, 6)" :key="tech" class="tech-tag">
                {{ tech }}
              </div>
              <div v-if="studio.technologies.length > 6" class="more-count">
                +{{ studio.technologies.length - 6 }} more
              </div>
            </div>
            <div v-else class="no-data">
              No tech stack listed
            </div>
          </div>

          <!-- Company Culture -->
          <div class="comparison-category">
            <h4 class="category-title">Company Culture</h4>
          </div>
          <div v-for="studio in studios" :key="`culture-${studio.id}`" class="studio-data">
            <div v-if="studio.culture?.values?.length" class="culture-info">
              <div class="culture-subsection">
                <span class="culture-label">Values:</span>
                <div class="values-list">
                  <span v-for="value in studio.culture.values.slice(0, 3)" :key="value" class="value-tag">
                    {{ value }}
                  </span>
                  <span v-if="studio.culture.values.length > 3" class="more-count">
                    +{{ studio.culture.values.length - 3 }} more
                  </span>
                </div>
              </div>
              <div v-if="studio.culture.workStyle" class="culture-subsection">
                <span class="culture-label">Work Style:</span>
                <p class="culture-text">{{ truncateText(studio.culture.workStyle, 100) }}</p>
              </div>
            </div>
            <div v-else class="no-data">
              No culture info available
            </div>
          </div>

          <!-- Interview Process -->
          <div class="comparison-category">
            <h4 class="category-title">Interview Process</h4>
          </div>
          <div v-for="studio in studios" :key="`interview-${studio.id}`" class="studio-data">
            <div v-if="studio.interviewStyle" class="interview-info">
              <p class="interview-text">{{ studio.interviewStyle }}</p>
            </div>
            <div v-else class="no-data">
              No interview info available
            </div>
          </div>

          <!-- Common Roles -->
          <div class="comparison-category">
            <h4 class="category-title">Common Roles</h4>
          </div>
          <div v-for="studio in studios" :key="`roles-${studio.id}`" class="studio-data">
            <div v-if="studio.commonRoles?.length" class="roles-list">
              <div v-for="role in studio.commonRoles.slice(0, 4)" :key="role" class="role-tag">
                {{ role }}
              </div>
              <div v-if="studio.commonRoles.length > 4" class="more-count">
                +{{ studio.commonRoles.length - 4 }} more
              </div>
            </div>
            <div v-else class="no-data">
              No roles listed
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <UnifiedButton color="glass" appearance="outlined" @click="$emit('close')">
          Close Comparison
        </UnifiedButton>
        <UnifiedButton color="gaming" leading-icon="mdi-download" @click="exportComparison">
          Export Comparison
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  studios: any[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { success: toastSuccess } = useToast()

function onLogoError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function exportComparison() {
  const comparisonData = {
    studios: props.studios,
    exportedAt: new Date().toISOString(),
    type: 'studio-comparison'
  }

  const blob = new Blob([JSON.stringify(comparisonData, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `studio-comparison-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  toastSuccess('Studio comparison exported')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: var(--spacing-4);
  backdrop-filter: blur(5px);
}

.studio-comparison-modal {
  max-width: 1200px;
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
}

.modal-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
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

.close-btn:hover {
  background: var(--glass-surface);
  color: var(--text-primary);
}

.modal-content {
  padding: var(--spacing-6);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 200px repeat(var(--studio-count, 2), 1fr);
  gap: var(--spacing-4);
  align-items: start;
}

.header-cell {
  padding: var(--spacing-4);
}

.comparison-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.studio-header {
  padding: var(--spacing-4);
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.studio-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  text-align: center;
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

.logo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.studio-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.comparison-category {
  padding: var(--spacing-3) var(--spacing-4);
  background: color-mix(in srgb, var(--color-primary-500) 10%, var(--glass-bg));
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 20%, var(--glass-border));
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-600);
  margin: 0;
}

.studio-data {
  padding: var(--spacing-4);
  background: var(--glass-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  min-height: 80px;
}

.data-item {
  margin-bottom: var(--spacing-2);
}

.data-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.data-value {
  color: var(--text-primary);
  margin-left: var(--spacing-2);
}

.games-list,
.tech-list,
.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.game-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: color-mix(in srgb, var(--color-gaming-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-gaming-500) 30%, var(--glass-border));
  color: var(--color-gaming-600);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.tech-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: color-mix(in srgb, var(--color-info-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-info-500) 30%, var(--glass-border));
  color: var(--color-info-600);
  border-radius: 999px;
  font-size: 0.875rem;
}

.role-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: color-mix(in srgb, var(--color-success-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-success-500) 30%, var(--glass-border));
  color: var(--color-success-600);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.more-count {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.no-data {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.875rem;
  text-align: center;
  padding: var(--spacing-2);
}

.culture-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.culture-subsection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.culture-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.culture-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.values-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.value-tag {
  padding: var(--spacing-1) var(--spacing-2);
  background: color-mix(in srgb, var(--color-warning-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-warning-500) 30%, var(--glass-border));
  color: var(--color-warning-600);
  border-radius: 999px;
  font-size: 0.875rem;
}

.interview-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.modal-footer {
  padding: var(--spacing-6);
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .comparison-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
  
  .header-cell {
    display: none;
  }
  
  .comparison-category {
    grid-column: 1 / -1;
    text-align: center;
  }
  
  .studio-data::before {
    content: attr(data-studio-name);
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
    padding-bottom: var(--spacing-2);
    border-bottom: 1px solid var(--glass-border);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-2);
  }
  
  .studio-comparison-modal {
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--spacing-4);
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .studio-comparison-modal {
  background: var(--surface-elevated);
}

[data-theme="dark"] .modal-header,
[data-theme="dark"] .modal-footer {
  background: var(--surface-base);
}

[data-theme="dark"] .studio-header,
[data-theme="dark"] .studio-data {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

[data-theme="dark"] .logo-container {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}
</style>
