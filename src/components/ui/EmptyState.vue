<template>
  <div class="empty-state-container" :class="stateClass">
    <div
      class="empty-state-content glass-card"
      role="region"
      :aria-label="title"
    >
      <!-- Icon Section -->
      <div class="empty-state-icon-wrapper">
        <div class="empty-state-icon" :class="iconVariant">
          <AppIcon :name="icon" :size="iconSize" />
        </div>
      </div>

      <!-- Content Section -->
      <div class="empty-state-content-section">
        <h3 v-if="title" class="empty-state-title">{{ title }}</h3>
        <p v-if="description" class="empty-state-description">
          {{ description }}
        </p>

        <!-- Slot for custom content -->
        <div v-if="$slots.default" class="empty-state-custom">
          <slot></slot>
        </div>
      </div>

      <!-- Actions Section -->
      <div
        v-if="primaryAction || secondaryAction || $slots.actions"
        class="empty-state-actions"
      >
        <slot name="actions">
          <UnifiedButton
            v-if="primaryAction"
            :variant="primaryAction.variant || 'primary'"
            :size="primaryAction.size || 'md'"
            :leading-icon="primaryAction.icon"
            :to="primaryAction.to"
            :href="primaryAction.href"
            @click="primaryAction.action"
          >
            {{ primaryAction.label }}
          </UnifiedButton>

          <UnifiedButton
            v-if="secondaryAction"
            :variant="secondaryAction.variant || 'ghost'"
            :size="secondaryAction.size || 'md'"
            :leading-icon="secondaryAction.icon"
            :to="secondaryAction.to"
            :href="secondaryAction.href"
            @click="secondaryAction.action"
          >
            {{ secondaryAction.label }}
          </UnifiedButton>
        </slot>
      </div>

      <!-- Gaming-specific features -->
      <div
        v-if="variant === 'gaming' && gamingHint"
        class="empty-state-gaming-hint"
      >
        <div class="gaming-hint-icon">🎮</div>
        <span class="gaming-hint-text">{{ gamingHint }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";
import UnifiedButton from "./UnifiedButton.vue";

interface Action {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "gaming" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: string;
  to?: string;
  href?: string;
  action?: () => void;
}

interface Props {
  // Visual props
  icon?: string;
  iconSize?: string | number;
  title?: string;
  description?: string;
  variant?: "default" | "gaming" | "portfolio" | "jobs" | "minimal";

  // Actions
  primaryAction?: Action;
  secondaryAction?: Action;

  // Gaming-specific
  gamingHint?: string;

  // Layout
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "mdi-inbox",
  iconSize: "64",
  variant: "default",
  size: "md",
  centered: true,
});

const stateClass = computed(() => ({
  [`empty-state--${props.variant}`]: true,
  [`empty-state--${props.size}`]: true,
  "empty-state--centered": props.centered,
}));

const iconVariant = computed(() => ({
  [`icon--${props.variant}`]: true,
  [`icon--${props.size}`]: true,
}));
</script>

<style scoped>
.empty-state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: var(--spacing-8);
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  padding: var(--spacing-8);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
}

.empty-state-icon-wrapper {
}

.empty-state-icon {
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.empty-state-icon.icon--gaming {
  background: linear-gradient(
  );
}

.empty-state-icon.icon--portfolio {
  background: linear-gradient(
  );
}

.empty-state-icon.icon--jobs {
  background: linear-gradient(
  );
}

.empty-state-content-section {
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.empty-state-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.empty-state-custom {
}

.empty-state-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.empty-state-gaming-hint {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.gaming-hint-icon {
  font-size: var(--font-size-lg);
}

.empty-state--sm .empty-state-content {
}

.empty-state--sm .empty-state-icon {
}

.empty-state--sm .empty-state-title {
  font-size: var(--font-size-lg);
}

.empty-state--lg .empty-state-content {
}

.empty-state--lg .empty-state-icon {
}

.empty-state--lg .empty-state-title {
}

.empty-state--gaming .empty-state-content {
  background: linear-gradient(
  );
}

.empty-state--minimal .empty-state-content {
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
}

.empty-state--minimal .empty-state-icon {
  background: transparent;
}

  .empty-state-container {
  }

  .empty-state-content {
  }

  .empty-state-actions {
    flex-direction: column;
  }

  .empty-state-actions :deep(.btn-unified) {
    justify-content: center;
  }
}

[data-theme="dark"] .empty-state-content {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

.empty-state-content {
}

@keyframes fadeInUp {
  from {
  }
  to {
  }
}

.empty-state-content:hover .empty-state-icon {
  box-shadow: var(--shadow-md);
}

@media (prefers-contrast: high) {
  .empty-state-content {
    background: var(--surface-base);
  }

  .empty-state-icon {
    background: var(--surface-elevated);
  }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state-content,
  .empty-state-icon {
    animation: none;
    transition: none;
  }

  .empty-state-content:hover .empty-state-icon {
    transform: none;
  }
}
</style>
