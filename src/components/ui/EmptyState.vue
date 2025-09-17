<template>
  <div class="empty-state-container font-sans" :class="stateClass">
    <div class="empty-state-content glass-card" role="region" :aria-label="title">
      <!-- Icon Section -->
      <div class="empty-state-icon-wrapper">
        <div class="empty-state-icon" :class="iconVariant">
          <AppIcon :name="icon" :size="iconSize" />
        </div>
      </div>

      <!-- Content Section -->
      <div class="empty-state-content-section">
        <h3 v-if="title" class="empty-state-title">{{ title }}</h3>
        <p v-if="description" class="empty-state-description">{{ description }}</p>
        
        <!-- Slot for custom content -->
        <div v-if="$slots.default" class="empty-state-custom">
          <slot></slot>
        </div>
      </div>

      <!-- Actions Section -->
      <div v-if="primaryAction || secondaryAction || $slots.actions" class="empty-state-actions">
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
      <div v-if="variant === 'gaming' && gamingHint" class="empty-state-gaming-hint">
        <div class="gaming-hint-icon">DevicePhoneMobileIcon</div>
        <span class="gaming-hint-text">{{ gamingHint }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DevicePhoneMobileIcon } from '@heroicons/vue/24/outline'

import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import UnifiedButton from './UnifiedButton.vue'

interface Action {
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'gaming' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  to?: string
  href?: string
  action?: () => void
}

interface Props {
  // Visual props
  icon?: string
  iconSize?: string | number
  title?: string
  description?: string
  variant?: 'default' | 'gaming' | 'portfolio' | 'jobs' | 'minimal'
  
  // Actions
  primaryAction?: Action
  secondaryAction?: Action
  
  // Gaming-specific
  gamingHint?: string
  
  // Layout
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-inbox',
  iconSize: '64',
  variant: 'default',
  size: 'md',
  centered: true
})

const stateClass = computed(() => ({
  [`empty-state--${props.variant}`]: true,
  [`empty-state--${props.size}`]: true,
  'empty-state--centered': props.centered
}))

const iconVariant = computed(() => ({
  [`icon--${props.variant}`]: true,
  [`icon--${props.size}`]: true
}))
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

/* Icon Styling */
.empty-state-icon-wrapper {
  margin-bottom: var(--spacing-6);
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.empty-state-icon.icon--gaming {
  background: linear-gradient(135deg, 
    rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.1),
    rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.05));
  border-color: rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.3);
}

.empty-state-icon.icon--portfolio {
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-500-rgb), 0.1),
    rgba(var(--color-primary-500-rgb), 0.05));
  border-color: rgba(var(--color-primary-500-rgb), 0.3);
}

.empty-state-icon.icon--jobs {
  background: linear-gradient(135deg, 
    rgba(var(--color-info-rgb, 6, 182, 212), 0.1),
    rgba(var(--color-info-rgb, 6, 182, 212), 0.05));
  border-color: rgba(var(--color-info-rgb, 6, 182, 212), 0.3);
}

/* Content Styling */
.empty-state-content-section {
  margin-bottom: var(--spacing-6);
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-3) 0;
  line-height: var(--line-height-tight);
}

.empty-state-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.empty-state-custom {
  margin-top: var(--spacing-4);
}

/* Actions Styling */
.empty-state-actions {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: var(--spacing-4);
}

/* Gaming Hint */
.empty-state-gaming-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.1);
  border: 1px solid rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.gaming-hint-icon {
  font-size: var(--font-size-lg);
}

/* Size Variants */
.empty-state--sm .empty-state-content {
  padding: var(--spacing-6);
  max-width: 360px;
}

.empty-state--sm .empty-state-icon {
  width: 60px;
  height: 60px;
}

.empty-state--sm .empty-state-title {
  font-size: var(--font-size-lg);
}

.empty-state--lg .empty-state-content {
  padding: var(--spacing-10);
  max-width: 600px;
}

.empty-state--lg .empty-state-icon {
  width: 100px;
  height: 100px;
}

.empty-state--lg .empty-state-title {
  font-size: var(--font-size-2xl);
}

/* Variant Styling */
.empty-state--gaming .empty-state-content {
  background: linear-gradient(135deg, 
    rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.05),
    rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.02));
  border-color: rgba(var(--color-gaming-500-rgb, 0, 255, 136), 0.2);
}

.empty-state--minimal .empty-state-content {
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
}

.empty-state--minimal .empty-state-icon {
  background: transparent;
  border: 2px dashed var(--border-base);
}

/* Responsive */
@media (max-width: 768px) {
  .empty-state-container {
    padding: var(--spacing-4);
    min-height: 240px;
  }
  
  .empty-state-content {
    padding: var(--spacing-6);
  }
  
  .empty-state-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .empty-state-actions :deep(.btn-unified) {
    width: 100%;
    justify-content: center;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .empty-state-content {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

/* Animation */
.empty-state-content {
  animation: fadeInUp 0.6s var(--easing-ease-out);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.empty-state-content:hover .empty-state-icon {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .empty-state-content {
    border-width: 2px;
    background: var(--surface-base);
  }
  
  .empty-state-icon {
    border-width: 3px;
    background: var(--surface-elevated);
  }
}

/* Reduced motion */
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