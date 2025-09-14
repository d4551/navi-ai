<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :class="cardClasses"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :tabindex="interactive && !disabled ? 0 : -1"
    role="group"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Header Slot -->
    <div v-if="$slots.header || title || headerIcon" :class="headerClasses">
      <div
        v-if="headerIcon || title"
        class="unified-card-header section-header-content"
      >
        <AppIcon
          v-if="headerIcon"
          :name="headerIcon"
          class="unified-card-icon"
        />
        <h3 v-if="title" class="unified-card-title">{{ title }}</h3>
      </div>
      <slot name="header" />
      <div
        v-if="$slots.actions"
        class="unified-card-header section-header-actions"
      >
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
        <AppIcon name="mdi-loading" class="spin" />
      </div>
    </div>

    <!-- Gaming Glow Effect -->
    <div v-if="variant === 'gaming' && !disabled" class="unified-card-glow" />

    <!-- Interactive Ripple Effect -->
    <div v-if="interactive && !disabled" class="unified-card-ripple" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { computed, useSlots } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

export interface CardProps {
  variant?:
    | "default"
    | "gaming"
    | "job"
    | "dashboard"
    | "portfolio"
    | "settings"
    | "studio"
    | "glass"
    | "elevated";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  headerIcon?: string;
  ariaLabel?: string;
  // Removed elevation as it will be handled by design system shadows
}

const _props = withDefaults(defineProps<CardProps>(), {
  variant: "default",
  size: "md",
  interactive: false,
  disabled: false,
  loading: false,
  title: "",
  headerIcon: "",
  ariaLabel: "",
});

const _emit = defineEmits<{
  click: [event: Event];
  focus: [event: Event];
  blur: [event: Event];
}>();

const slots = useSlots();

// Computed classes based on props
const cardClasses = computed(() => [
  "unified-card",
  `unified-card--${props.variant}`,
  `unified-card--${props.size}`,
  {
    "unified-card--interactive": props.interactive,
    "unified-card--disabled": props.disabled,
    "unified-card--loading": props.loading,
  },
]);

const headerClasses = computed(() => [
  "unified-card-header",
  `unified-card-header--${props.variant}`,
  {
    "unified-card-header--with-actions": !!slots.actions,
  },
]);

const contentClasses = computed(() => [
  "unified-card-content",
  `unified-card-content--${props.size}`,
]);

const footerClasses = computed(() => [
  "unified-card-footer",
  `unified-card-footer--${props.variant}`,
]);

// Event handlers
const handleClick = (event: Event) => {
  if (!props.disabled && props.interactive) {
    emit("click", event);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (
    !props.disabled &&
    props.interactive &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    emit("click", event);
  }
};
</script>

<style>
   UNIFIED CARD COMPONENT SYSTEM
   Single source of truth for all card variants

.unified-card {
  position: relative;
  display: flex;
  flex-direction: column;
  -webkit-backdrop-filter: var(
    --glass-backdrop-blur
  overflow: hidden;
}

.unified-card--xs {
}

.unified-card--sm {
}

.unified-card--md {
}

.unified-card--lg {
}

.unified-card--xl {
}

.unified-card--elevation-none {
  box-shadow: none;
}

.unified-card--elevation-low {
}

.unified-card--elevation-medium {
}

.unified-card--elevation-high {
}

.unified-card--interactive {
  cursor: pointer;
  user-select: none;
}

.unified-card--interactive:hover:not(.unified-card--disabled) {
}

.unified-card--interactive:focus-visible {
  box-shadow:
    var(--shadow-md),
}

.unified-card--interactive:active:not(.unified-card--disabled) {
}

.unified-card--disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.unified-card--loading {
  pointer-events: none;
}

.unified-card-loading {
  position: absolute;
  backdrop-filter: var(
    --glass-backdrop-blur-light
  display: flex;
  align-items: center;
  justify-content: center;
}

.unified-card-spinner {
}

   VARIANT STYLES

.unified-card--default {
  background: var(--glass-surface);
}

.unified-card--gaming {
  background: linear-gradient(
    var(--glass-surface),
  position: relative;
}

.unified-card--gaming::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  pointer-events: none;
}

.unified-card-glow {
  position: absolute;
  background: linear-gradient(
  border-radius: inherit;
}

.unified-card--gaming:hover .unified-card-glow {
}

.unified-card--job {
}

.unified-card--job:hover {
}

.unified-card--dashboard {
}

.unified-card--portfolio {
  overflow: hidden;
}

.unified-card--portfolio .unified-card-content {
  position: relative;
}

.unified-card--settings {
}

.unified-card--studio {
  background: linear-gradient(
}

.unified-card--glass {
  backdrop-filter: var(
    --glass-backdrop-blur-strong
  -webkit-backdrop-filter: var(
    --glass-backdrop-blur-strong
}

.unified-card--elevated {
}

   CARD STRUCTURE COMPONENTS

.unified-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.unified-card-header-content {
  display: flex;
  align-items: center;
}

.unified-card-icon {
}

.unified-card-title {
}

.unified-card-header-actions {
  display: flex;
  align-items: center;
}

.unified-card-content {
}

.unified-card-content--xs {
}

.unified-card-content--sm {
}

.unified-card-content--lg {
}

.unified-card-content--xl {
}

.unified-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

   VARIANT-SPECIFIC OVERRIDES

.unified-card-header--gaming {
  background: linear-gradient(
  border-bottom-color: var(
    --glass-border-gaming
}

.unified-card-header--gaming .unified-card-title,
.unified-card-header--gaming .unified-card-icon {
}

.unified-card-header--job {
  background: linear-gradient(
    transparent
}

.unified-card-header--dashboard {
}

.unified-card-header--studio {
  backdrop-filter: var(
    --glass-backdrop-blur-light
  border-bottom-color: var(
    --glass-border-light
}

   RIPPLE EFFECT

.unified-card-ripple {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}

.unified-card--interactive:active .unified-card-ripple::after {
  content: "";
  position: absolute;
}

@keyframes ripple {
  to {
  }
}

   DARK THEME SUPPORT

[data-theme="dark"] .unified-card {
}

[data-theme="dark"]
  .unified-card--interactive:hover:not(.unified-card--disabled) {
}

[data-theme="dark"] .unified-card-header {
}

[data-theme="dark"] .unified-card-footer {
}

   ACCESSIBILITY

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
  }

  .unified-card--glass {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

   RESPONSIVE DESIGN

  .unified-card-header {
  }

  .unified-card-content {
  }

  .unified-card-footer {
  }

  .unified-card-title {
  }
}

  .unified-card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .unified-card-header-actions {
    justify-content: center;
  }

  .unified-card--portfolio {
  }
}
</style>
