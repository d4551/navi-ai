<template>
  <div
    class="unified-card dashboard-module-card"
    :class="[`variant--${data.colorClass}`, { featured: data.featured }]"
    role="button"
    :aria-labelledby="`mod-${data.key}-title`"
    :aria-label="`${data.name}: ${data.cta || 'Open'}`"
    tabindex="0"
    @click="navigate"
    @keydown.enter.prevent.stop="navigate"
    @keydown.space.prevent.stop="navigate"
  >
    <!-- Module Header -->
    <div class="module-header">
      <div class="module-icon-container" :class="`color--${data.colorClass}`">
        <AppIcon :name="data.icon" class="module-icon" aria-hidden="true" />
      </div>
      <div v-if="data.statLabel && data.statValue" class="module-stat-badge">
        <span class="stat-value">{{ data.statValue }}</span>
        <span v-if="data.statLabel" class="stat-label">{{
          data.statLabel
        }}</span>
      </div>
    </div>

    <!-- Module Content -->
    <div class="module-content">
      <h3 :id="`mod-${data.key}-title`" class="module-title">
        {{ data.name }}
      </h3>
      <p class="module-description">
        {{ data.description }}
      </p>
    </div>

    <!-- Module Footer -->
    <div class="module-footer">
      <div class="module-cta">
        <AppIcon
          :name="data.ctaIcon || 'mdi-arrow-right'"
          class="cta-icon"
          aria-hidden="true"
        />
        <span class="cta-text">{{ data.cta || 'Open' }}</span>
      </div>
    </div>

    <!-- Interactive Overlay -->
    <div class="module-overlay"></div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
export default {
  name: 'DashboardModuleCard',
  components: { AppIcon },
  props: { data: { type: Object, required: true } },
  emits: ['navigate'],
  setup(props, { emit }) {
    const navigate = () => emit('navigate', { route: props.data.route })
    return { navigate }
  },
}
</script>

<style scoped>
/* Dashboard Module Card - Unified Design System */
.dashboard-module-card {
  position: relative;
  height: 100%;
  min-height: 200px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-elevation-md);
  transition: all var(--transition-smooth);
}

.dashboard-module-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevation-lg);
  border-color: var(--color-primary-400);
}

.dashboard-module-card.featured {
  border: 2px solid var(--color-primary-400);
  background: rgba(var(--color-primary-rgb), 0.03);
  box-shadow: var(--shadow-glow-primary);
}

/* Module Header */
.module-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

/* Module Icon Container */
.module-icon-container {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
  border: 2px solid var(--glass-border);
  transition: all var(--transition-smooth);
  flex-shrink: 0;
}

.module-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-primary-500);
  transition: all var(--transition-smooth);
}

.dashboard-module-card:hover .module-icon-container {
  transform: scale(1.1) rotate(3deg);
  border-color: var(--color-primary-400);
  background: rgba(var(--color-primary-rgb), 0.1);
  box-shadow: var(--shadow-glow-primary);
}

.dashboard-module-card:hover .module-icon {
  color: var(--color-primary-400);
  transform: scale(1.1);
}

/* Module Stat Badge */
.module-stat-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-weight: 700;
  font-size: var(--font-size-base);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

/* Module Content */
.module-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.module-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.module-description {
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Module Footer */
.module-footer {
  margin-top: auto;
}

.module-cta {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary-500);
  opacity: 0;
  transform: translateY(4px);
  transition: all var(--transition-smooth);
}

.cta-icon {
  font-size: var(--font-size-base);
}

.cta-text {
  font-weight: 600;
}

.dashboard-module-card:hover .module-cta {
  opacity: 1;
  transform: translateY(0);
}

/* Interactive Overlay */
.module-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--transition-smooth);
}

.dashboard-module-card:hover .module-overlay {
  opacity: 1;
  background: rgba(var(--color-primary-rgb), 0.02);
}

/* Focus States */
.dashboard-module-card:focus-visible {
  outline: 3px solid var(--color-primary-400);
  outline-offset: 2px;
}

/* Color Variants */
.dashboard-module-card.variant--color-success-soft .module-icon {
  color: var(--color-success-500);
}

.dashboard-module-card.variant--color-success-soft .module-cta {
  color: var(--color-success-500);
}

.dashboard-module-card.variant--color-success-soft:hover
  .module-icon-container {
  border-color: var(--color-success-400);
  background: rgba(var(--color-success-rgb), 0.1);
}

.dashboard-module-card.variant--color-primary-soft .module-icon {
  color: var(--color-primary-500);
}

.dashboard-module-card.variant--color-primary-soft .module-cta {
  color: var(--color-primary-500);
}

.dashboard-module-card.variant--color-purple-soft .module-icon {
  color: var(--color-secondary-500);
}

.dashboard-module-card.variant--color-purple-soft .module-cta {
  color: var(--color-secondary-500);
}

.dashboard-module-card.variant--color-purple-soft:hover .module-icon-container {
  border-color: var(--color-secondary-400);
  background: rgba(var(--color-secondary-rgb), 0.1);
}

.dashboard-module-card.variant--color-warning-soft .module-icon {
  color: var(--color-warning-500);
}

.dashboard-module-card.variant--color-warning-soft .module-cta {
  color: var(--color-warning-500);
}

.dashboard-module-card.variant--color-warning-soft:hover
  .module-icon-container {
  border-color: var(--color-warning-400);
  background: rgba(var(--color-warning-rgb), 0.1);
}

.dashboard-module-card.variant--color-info-soft .module-icon {
  color: var(--color-info-500);
}

.dashboard-module-card.variant--color-info-soft .module-cta {
  color: var(--color-info-500);
}

.dashboard-module-card.variant--color-info-soft:hover .module-icon-container {
  border-color: var(--color-info-400);
  background: rgba(var(--color-info-rgb), 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-module-card {
    min-height: 160px;
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .module-icon-container {
    width: 48px;
    height: 48px;
  }

  .module-icon {
    font-size: var(--font-size-xl);
  }

  .module-title {
    font-size: var(--font-size-base);
  }

  .module-description {
    font-size: var(--font-size-xs);
  }

  .module-stat-badge {
    font-size: var(--font-size-xs);
  }
}
</style>
