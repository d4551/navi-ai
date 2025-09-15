<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :class="cardClasses"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :tabindex="interactive && !disabled ? 0 : -1"
    role="group"
    class="font-sans"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Header Slot -->
    <div v-if="$slots.header || title || headerIcon" :class="headerClasses">
      <div v-if="headerIcon || title" class="unified-card-header section-header-content">
        <AppIcon v-if="headerIcon" :name="headerIcon" class="unified-card-icon" />
        <h3 v-if="title" class="unified-card-title">{{ title }}</h3>
      </div>
      <slot name="header" />
      <div v-if="$slots.actions" class="unified-card-header section-header-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Content Area -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="unified-card-loading">
      <div class="unified-card-spinner">
        <AppIcon name="ArrowPathIcon" class="spin" />
      </div>
    </div>

    <!-- Gaming Glow Effect -->
    <div v-if="variant === 'gaming' && !disabled" class="unified-card-glow" />

    <!-- Interactive Ripple Effect -->
    <div v-if="interactive && !disabled" class="unified-card-ripple" />
  </component>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

import { computed, useSlots } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

export interface UnifiedCardProps {
  variant?: 'default' | 'gaming' | 'job' | 'dashboard' | 'portfolio' | 'settings' | 'studio' | 'glass' | 'elevated'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  disabled?: boolean
  loading?: boolean
  title?: string
  headerIcon?: string
  ariaLabel?: string
  // Removed elevation as it will be handled by design system shadows
}

const props = withDefaults(defineProps<UnifiedCardProps>(), {
  variant: 'default',
  size: 'md',
  interactive: false,
  disabled: false,
  loading: false,
  title: '',
  headerIcon: '',
  ariaLabel: ''
})

const emit = defineEmits<{
  click: [event: Event]
  focus: [event: Event]
  blur: [event: Event]
}>()

const slots = useSlots()

// Computed classes based on props
const cardClasses = computed(() => [
  'unified-card',
  `unified-card--${props.variant}`,
  `unified-card--${props.size}`,
  {
    'unified-card--interactive': props.interactive,
    'unified-card--disabled': props.disabled,
    'unified-card--loading': props.loading
  }
])

const headerClasses = computed(() => [
  'unified-card-header',
  `unified-card-header--${props.variant}`,
  {
    'unified-card-header--with-actions': !!slots.actions
  }
])

const contentClasses = computed(() => [
  'unified-card-content',
  `unified-card-content--${props.size}`
])

const footerClasses = computed(() => [
  'unified-card-footer',
  `unified-card-footer--${props.variant}`
])

// Event handlers
const handleClick = (event: Event) => {
  if (!props.disabled && props.interactive) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.disabled && props.interactive && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<style>
/* ============================================
   UNIFIED CARD COMPONENT SYSTEM
   Single source of truth for all card variants
   ============================================ */

/* Base Card Structure */
.unified-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg); /* Use design system variable */
  background: var(--glass-surface); /* Use design system variable */
  border: 1px solid var(--glass-border); /* Use design system variable */
  backdrop-filter: var(--glass-backdrop-blur); /* Use design system variable */
  -webkit-backdrop-filter: var(--glass-backdrop-blur); /* Use design system variable */
  transition: all var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
  overflow: hidden;
  font-family: var(--font-primary); /* Use design system variable */
  box-shadow: var(--shadow-base); /* Default shadow from design system */
}

/* Size Variants */
.unified-card--xs {
  min-height: 80px;
}

.unified-card--sm {
  min-height: 120px;
}

.unified-card--md {
  min-height: 180px;
}

.unified-card--lg {
  min-height: 240px;
}

.unified-card--xl {
  min-height: 320px;
}

/* Elevation Variants - Now mapped to design system shadows */
.unified-card--elevation-none {
  box-shadow: none;
}

.unified-card--elevation-low {
  box-shadow: var(--shadow-sm); /* Map to design system shadow */
}

.unified-card--elevation-medium {
  box-shadow: var(--shadow-glass); /* Map to design system shadow */
}

.unified-card--elevation-high {
  box-shadow: var(--shadow-glass-lg); /* Map to design system shadow */
}

/* Interactive States */
.unified-card--interactive {
  cursor: pointer;
  user-select: none;
}

.unified-card--interactive:hover:not(.unified-card--disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-lg); /* Use design system shadow */
  border-color: var(--glass-border-strong); /* Use design system variable */
}

.unified-card--interactive:focus-visible {
  outline: 3px solid var(--color-primary-400); /* Use design system variable */
  outline-offset: 2px;
  box-shadow: var(--shadow-glass), 0 0 0 3px var(--color-primary-200); /* Enhanced focus shadow */
}

.unified-card--interactive:active:not(.unified-card--disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm); /* Use design system shadow */
}

.unified-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading State */
.unified-card--loading {
  pointer-events: none;
}

.unified-card-loading {
  position: absolute;
  inset: 0;
  background: var(--glass-surface-overlay); /* Use design system variable */
  backdrop-filter: var(--glass-backdrop-blur-light); /* Use design system variable */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-overlay); /* Use design system variable */
}

.unified-card-spinner {
  font-size: var(--font-size-2xl); /* Use design system variable */
  color: var(--color-primary-500); /* Use design system variable */
}

/* ============================================
   VARIANT STYLES
   ============================================ */

/* Default Variant */
.unified-card--default {
  background: var(--glass-surface);
}

/* Gaming Variant */
.unified-card--gaming {
  background: linear-gradient(135deg, var(--glass-surface), rgba(0, 255, 136, 0.02)); /* Use design system variable */
  border: 1px solid var(--glass-border-gaming); /* Use design system variable */
  position: relative;
}

.unified-card--gaming::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-gaming-500), var(--color-cyber-500)); /* Use design system variables */
  opacity: 0.05;
  pointer-events: none;
}

.unified-card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--color-gaming-500), var(--color-cyber-500)); /* Use design system variables */
  border-radius: inherit;
  opacity: 0;
  z-index: var(--z-hide); /* Use design system variable */
  transition: opacity var(--duration-normal); /* Use design system variable */
  filter: blur(8px); /* Add blur for glow effect */
}

.unified-card--gaming:hover .unified-card-glow {
  opacity: 0.6;
}

/* Job Variant */
.unified-card--job {
  border-l: 4px solid var(--color-primary-500); /* Use design system variable */
}

.unified-card--job:hover {
  border-l-color: var(--color-primary-600); /* Use design system variable */
}

/* Dashboard Variant */
.unified-card--dashboard {
  background: var(--glass-surface-elevated); /* Use design system variable */
  border: 1px solid var(--glass-border-strong); /* Use design system variable */
}

/* Portfolio Variant */
.unified-card--portfolio {
  aspect-ratio: 16/10;
  overflow: hidden;
}

.unified-card--portfolio .unified-card-content {
  position: relative;
  height: 100%;
}

/* Settings Variant */
.unified-card--settings {
  background: var(--glass-surface-elevated); /* Use design system variable */
}

/* Studio Variant */
.unified-card--studio {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700)); /* Use design system variables */
  color: var(--text-on-primary); /* Use design system variable */
}

/* Glass Variant */
.unified-card--glass {
  background: var(--glass-surface-elevated); /* Use design system variable */
  backdrop-filter: var(--glass-backdrop-blur-strong); /* Use design system variable */
  -webkit-backdrop-filter: var(--glass-backdrop-blur-strong); /* Use design system variable */
  box-shadow: var(--glass-shadow-glass-lg); /* Use design system variable */
}

/* Elevated Variant */
.unified-card--elevated {
  background: var(--glass-surface-elevated); /* Use design system variable */
  box-shadow: var(--glass-shadow-glass-xl); /* Use design system variable */
}

/* ============================================
   CARD STRUCTURE COMPONENTS
   ============================================ */

/* Header */
.unified-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg); /* Use design system variables */
  border-b: 1px solid var(--glass-border); /* Use design system variable */
  background: var(--glass-surface-elevated); /* Use design system variable */
  min-height: 60px;
}

.unified-card-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm); /* Use design system variable */
}

.unified-card-icon {
  font-size: var(--font-size-lg); /* Use design system variable */
  color: var(--color-primary-500); /* Use design system variable */
}

.unified-card-title {
  margin: 0;
  font-size: var(--font-size-lg); /* Use design system variable */
  font-weight: var(--font-weight-semibold); /* Use design system variable */
  color: var(--text-primary-600); /* Use design system variable */
}

.unified-card-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm); /* Use design system variable */
}

/* Content */
.unified-card-content {
  flex: 1;
  padding: var(--spacing-lg); /* Use design system variable */
  color: var(--text-primary-600); /* Use design system variable */
}

.unified-card-content--xs {
  padding: var(--spacing-sm); /* Use design system variable */
}

.unified-card-content--sm {
  padding: var(--spacing-md); /* Use design system variable */
}

.unified-card-content--lg {
  padding: var(--spacing-xl); /* Use design system variable */
}

.unified-card-content--xl {
  padding: var(--spacing-2xl); /* Use design system variable */
}

/* Footer */
.unified-card-footer {
  padding: var(--spacing-md) var(--spacing-lg); /* Use design system variables */
  border-t: 1px solid var(--glass-border); /* Use design system variable */
  background: var(--glass-surface-elevated); /* Use design system variable */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ============================================
   VARIANT-SPECIFIC OVERRIDES
   ============================================ */

/* Gaming Header */
.unified-card-header--gaming {
  background: linear-gradient(135deg, var(--color-gaming-500), var(--color-cyber-500)); /* Use design system variables */
  border-b-color: var(--glass-border-gaming); /* Use design system variable */
  color: var(--text-on-primary); /* Use design system variable */
}

.unified-card-header--gaming .unified-card-title,
.unified-card-header--gaming .unified-card-icon {
  color: var(--text-on-primary); /* Use design system variable */
}

/* Job Header */
.unified-card-header--job {
  background: linear-gradient(90deg, rgba(var(--color-primary-500-rgb), 0.1), transparent); /* Use design system variable */
}

/* Dashboard Header */
.unified-card-header--dashboard {
  background: var(--glass-surface-elevated); /* Use design system variable */
}

/* Studio Header */
.unified-card-header--studio {
  background: var(--glass-bg-medium); /* Use design system variable */
  backdrop-filter: var(--glass-backdrop-blur-light); /* Use design system variable */
  border-b-color: var(--glass-border-light); /* Use design system variable */
}

/* ============================================
   RIPPLE EFFECT
   ============================================ */

.unified-card-ripple {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.unified-card--interactive:active .unified-card-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--color-primary-300); /* Use design system variable */
  transform: translate(-50%, -50%);
  animation: ripple var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
}

@keyframes ripple {
  to {
    width: 400px;
    height: 400px;
    opacity: 0;
  }
}

/* ============================================
   DARK THEME SUPPORT
   ============================================ */

[data-theme="dark"] .unified-card {
  background: var(--glass-surface); /* Use design system variable */
  border-color: var(--glass-border); /* Use design system variable */
  box-shadow: var(--shadow-glass); /* Use design system variable */
}

[data-theme="dark"] .unified-card--interactive:hover:not(.unified-card--disabled) {
  box-shadow: var(--shadow-glass-lg); /* Use design system variable */
  border-color: var(--glass-border-strong); /* Use design system variable */
}

[data-theme="dark"] .unified-card-header {
  background: var(--glass-surface-elevated); /* Use design system variable */
  border-b-color: var(--glass-border); /* Use design system variable */
}

[data-theme="dark"] .unified-card-footer {
  background: var(--glass-surface-elevated); /* Use design system variable */
  border-t-color: var(--glass-border); /* Use design system variable */
}

/* ============================================
   ACCESSIBILITY
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .unified-card,
  .unified-card--interactive:hover,
  .unified-card--interactive:active {
    transition: none;
    transform: none;
  }
  
  .unified-card-ripple::after {
    animation: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .unified-card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--surface-base); /* Use design system variable */
  }
  
  .unified-card--glass {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */

@media (max-width: 768px) {
  .unified-card-header {
    padding: var(--spacing-sm) var(--spacing-md); /* Use design system variables */
    min-height: 50px;
  }
  
  .unified-card-content {
    padding: var(--spacing-md); /* Use design system variable */
  }
  
  .unified-card-footer {
    padding: var(--spacing-sm) var(--spacing-md); /* Use design system variables */
  }
  
  .unified-card-title {
    font-size: var(--font-size-base); /* Use design system variable */
  }
}

@media (max-width: 576px) {
  .unified-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm); /* Use design system variable */
  }
  
  .unified-card-header-actions {
    justify-content: center;
  }
  
  .unified-card--portfolio {
    aspect-ratio: 4/3;
  }
}
</style>
