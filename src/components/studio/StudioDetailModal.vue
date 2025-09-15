<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="studio-detail-modal glass-card section-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="studio-identity">
            <div class="logo-container">
              <img v-if="studio.logo" :src="studio.logo" :alt="studio.name" @error="onLogoError" />
              <div v-else class="logo-placeholder">{{ studio.name?.charAt(0) }}</div>
            </div>
            <div class="studio-title-info">
              <h2 class="studio-name">{{ studio.name }}</h2>
              <div class="studio-location">
                <AppIcon name="mdi-map-marker" />
                {{ studio.headquarters || studio.location }}
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="action-btn favorite-btn"
              :class="{ active: isFavorite }"
              @click="$emit('toggle-favorite', studio.id)"
            >
              <AppIcon name="mdi-heart" />
            </button>
            <button class="action-btn close-btn" @click="$emit('close')">
              <AppIcon name="mdi-close" />
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <div class="content-grid">
          <!-- Studio Overview -->
          <section class="overview-section">
            <h3 class="section-title">Studio Overview</h3>
            <p v-if="studio.description" class="description">{{ studio.description }}</p>
            
            <div class="key-metrics">
              <div v-if="studio.founded" class="metric-item">
                <AppIcon name="mdi-calendar" />
                <span class="metric-label">Founded</span>
                <span class="metric-value">{{ studio.founded }}</span>
              </div>
              <div v-if="studio.size" class="metric-item">
                <AppIcon name="mdi-account-group" />
                <span class="metric-label">Size</span>
                <span class="metric-value">{{ studio.size }}</span>
              </div>
              <div v-if="(studio as any).type || (studio as any).category" class="metric-item">
                <AppIcon name="mdi-office-building" />
                <span class="metric-label">Type</span>
                <span class="metric-value">{{ (studio as any).type || (studio as any).category }}</span>
              </div>
              <div v-if="studio.publiclyTraded" class="metric-item">
                <AppIcon name="mdi-chart-bar" color="info" />
                <span class="metric-label">Public</span>
                <span class="metric-value">Yes</span>
              </div>
            </div>
          </section>

          <!-- Games Portfolio -->
          <section v-if="studio.games?.length" class="games-section">
            <h3 class="section-title">Game Portfolio</h3>
            <div class="games-grid">
              <div v-for="game in studio.games" :key="game" class="game-item">
                {{ game }}
              </div>
            </div>
          </section>

          <!-- Technology Stack -->
          <section v-if="studio.technologies?.length" class="tech-section">
            <h3 class="section-title">Technology Stack</h3>
            <div class="tech-grid">
              <div v-for="tech in studio.technologies" :key="tech" class="tech-item">
                {{ tech }}
              </div>
            </div>
          </section>

          <!-- Company Culture -->
          <section v-if="studio.culture" class="culture-section">
            <h3 class="section-title">Company Culture</h3>
            
            <div v-if="studio.culture.values?.length" class="culture-subsection">
              <h4 class="subsection-title">Core Values</h4>
              <div class="values-list">
                <div v-for="value in studio.culture.values" :key="value" class="value-item">
                  {{ value }}
                </div>
              </div>
            </div>

            <div v-if="studio.culture.workStyle" class="culture-subsection">
              <h4 class="subsection-title">Work Style</h4>
              <p class="culture-text">{{ studio.culture.workStyle }}</p>
            </div>

            <div v-if="studio.culture.environment" class="culture-subsection">
              <h4 class="subsection-title">Work Environment</h4>
              <p class="culture-text">{{ studio.culture.environment }}</p>
            </div>
          </section>

          <!-- Common Roles -->
          <section v-if="studio.commonRoles?.length" class="roles-section">
            <h3 class="section-title">Common Roles</h3>
            <div class="roles-grid">
              <div v-for="role in studio.commonRoles" :key="role" class="role-item">
                {{ role }}
              </div>
            </div>
          </section>

          <!-- Interview Information -->
          <section v-if="studio.interviewStyle" class="interview-section">
            <h3 class="section-title">Interview Process</h3>
            <p class="interview-style">{{ studio.interviewStyle }}</p>
          </section>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <UnifiedButton 
          color="glass" 
          appearance="outlined"
          leading-icon="mdi-briefcase-outline"
          @click="$emit('view-jobs', studio)"
        >
          View Open Positions
        </UnifiedButton>
        
        <UnifiedButton 
          color="gaming"
          leading-icon="mdi-microphone"
          @click="$emit('start-interview', studio)"
        >
          Practice Interview
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

defineProps<{
  studio: any
  isFavorite: boolean
}>()

defineEmits<{
  close: []
  'toggle-favorite': [studioId: string]
  'view-jobs': [studio: any]
  'start-interview': [studio: any]
}>()

function onLogoError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
  backdrop-filter: blur(5px);
}

.studio-detail-modal {
  max-width: 800px;
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
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.studio-identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.logo-container {
  width: 80px;
  height: 80px;
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.studio-title-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.studio-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.studio-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
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

.action-btn:hover {
  background: var(--glass-surface);
  color: var(--text-primary);
}

.favorite-btn.active {
  background: var(--color-error-500);
  color: white;
  border-color: var(--color-error-500);
}

.modal-content {
  padding: var(--spacing-6);
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
  border-bottom: 2px solid var(--color-primary-500);
  padding-bottom: var(--spacing-2);
}

.overview-section .description {
  color: var(--text-primary);
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: var(--spacing-4);
}

.key-metrics {
  @apply grid grid-cols-1 md:grid-cols-3;
  gap: var(--spacing-4);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.metric-value {
  color: var(--text-primary);
  font-weight: 600;
  margin-left: auto;
}

.games-grid {
  @apply grid grid-cols-2 md:grid-cols-4;
  gap: var(--spacing-2);
}

.game-item {
  padding: var(--spacing-2) var(--spacing-3);
  background: color-mix(in srgb, var(--color-gaming-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-gaming-500) 30%, var(--glass-border));
  color: var(--color-gaming-600);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.tech-item {
  padding: var(--spacing-2) var(--spacing-3);
  background: color-mix(in srgb, var(--color-info-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-info-500) 30%, var(--glass-border));
  color: var(--color-info-600);
  border-radius: 999px;
  font-size: 0.875rem;
}

.culture-subsection {
  margin-bottom: var(--spacing-4);
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.values-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.value-item {
  padding: var(--spacing-2) var(--spacing-3);
  background: color-mix(in srgb, var(--color-warning-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-warning-500) 30%, var(--glass-border));
  color: var(--color-warning-600);
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.culture-text {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.roles-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
  gap: var(--spacing-2);
}

.role-item {
  padding: var(--spacing-2) var(--spacing-3);
  background: color-mix(in srgb, var(--color-success-500) 15%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, var(--color-success-500) 30%, var(--glass-border));
  color: var(--color-success-600);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}

.interview-style {
  color: var(--text-primary);
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
  padding: var(--spacing-4);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
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
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-2);
  }
  
  .studio-detail-modal {
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--spacing-4);
  }
  
  .studio-identity {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-3);
  }
  
  .studio-name {
    font-size: 1.5rem;
  }
  
  .key-metrics {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .studio-detail-modal {
  background: var(--surface-elevated);
}

[data-theme="dark"] .modal-header,
[data-theme="dark"] .modal-footer {
  background: var(--surface-base);
}

[data-theme="dark"] .logo-container,
[data-theme="dark"] .metric-item {
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}
</style>
