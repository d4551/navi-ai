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
        <span class="cta-text">{{ data.cta || "Open" }}</span>
      </div>
    </div>

    <!-- Interactive Overlay -->
    <div class="module-overlay"></div>
  </div>
</template>

<script>
import AppIcon from "@/components/ui/AppIcon.vue";
export default {
  name: "DashboardModuleCard",
  components: { AppIcon },
  props: { data: { type: Object, required: true } },
  emits: ["navigate"],
  setup(props, { emit }) {
    const navigate = () => emit("navigate", { route: props.data.route });
    return { navigate };
  },
};
</script>

<style scoped>
.dashboard-module-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--glass-surface);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-elevation-md);
  transition: all var(--transition-smooth);
}

.dashboard-module-card:hover {
  box-shadow: var(--shadow-elevation-lg);
}

.dashboard-module-card.featured {
  box-shadow: var(--shadow-glow-primary);
}

.module-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.module-icon-container {
  position: relative;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
  transition: all var(--transition-smooth);
}

.module-icon {
  transition: all var(--transition-smooth);
}

.dashboard-module-card:hover .module-icon-container {
  box-shadow: var(--shadow-glow-primary);
}

.dashboard-module-card:hover .module-icon {
}

.module-stat-badge {
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--glass-bg);
  color: var(--text-primary);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-base);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.module-content {
  display: flex;
  flex-direction: column;
}

.module-title {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.module-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.module-footer {
  margin-top: auto;
}

.module-cta {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  transition: all var(--transition-smooth);
}

.cta-icon {
  font-size: var(--font-size-base);
}

.cta-text {
}

.dashboard-module-card:hover .module-cta {
}

.module-overlay {
  position: absolute;
  background: transparent;
  pointer-events: none;
  border-radius: inherit;
  transition: opacity var(--transition-smooth);
}

.dashboard-module-card:hover .module-overlay {
}

.dashboard-module-card:focus-visible {
}

.dashboard-module-card.variant--color-success-soft .module-icon {
}

.dashboard-module-card.variant--color-success-soft .module-cta {
}

.dashboard-module-card.variant--color-success-soft:hover
  .module-icon-container {
}

.dashboard-module-card.variant--color-primary-soft .module-icon {
}

.dashboard-module-card.variant--color-primary-soft .module-cta {
}

.dashboard-module-card.variant--color-purple-soft .module-icon {
}

.dashboard-module-card.variant--color-purple-soft .module-cta {
}

.dashboard-module-card.variant--color-purple-soft:hover .module-icon-container {
}

.dashboard-module-card.variant--color-warning-soft .module-icon {
}

.dashboard-module-card.variant--color-warning-soft .module-cta {
}

.dashboard-module-card.variant--color-warning-soft:hover
  .module-icon-container {
}

.dashboard-module-card.variant--color-info-soft .module-icon {
}

.dashboard-module-card.variant--color-info-soft .module-cta {
}

.dashboard-module-card.variant--color-info-soft:hover .module-icon-container {
}

  .dashboard-module-card {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .module-icon-container {
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
