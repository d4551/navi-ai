<template>
  <div
    class="unified-page-header"
    :class="[
      `header-${variant}`,
      `header-size-${size}`,
      {
        'header-centered': centered,
        'header-stacked': stacked,
        'header-with-gradient': useGradient,
      },
    ]"
    :style="headerStyles"
  >
    <!-- Modern Background Effects -->
    <div class="header-background-animation"></div>

    <!-- Floating Particles -->
    <div
      v-if="showParticles || enableModernEffects"
      class="header-floating-particles"
    >
      <span class="particle p1"></span>
      <span class="particle p2"></span>
      <span class="particle p3"></span>
      <span class="particle p4"></span>
      <span class="particle p5"></span>
    </div>

    <!-- Animated Gradient Border -->
    <div class="header-gradient-border"></div>

    <!-- Legacy effects for backwards compatibility -->
    <div v-if="showShimmer" class="header-shimmer"></div>
    <div v-if="showSwirls" class="header-swirls" aria-hidden="true">
      <span class="swirl s1"></span>
      <span class="swirl s2"></span>
      <span class="swirl s3"></span>
      <span class="swirl s4"></span>
    </div>

    <!-- Header Content Container -->
    <div class="header-container unified-container">
      <!-- Main Title Section -->
      <div class="header-title-section">
        <div class="title-wrapper">
          <!-- Icon above title when stacked layout is used -->
          <div v-if="icon && stacked" class="header-icon-wrapper stacked">
            <AppIcon :name="icon" class="header-icon-large" />
          </div>

          <div class="title-content">
            <!-- Title with optional inline icon -->
            <component :is="titleTag" :class="titleClasses">
              <!-- Inline icon when not stacked -->
              <AppIcon
                v-if="icon && !stacked"
                :name="icon"
                class="header-icon-inline"
              />
              {{ title }}
            </component>

            <!-- Subtitle -->
            <p v-if="subtitle" class="header-subtitle">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <!-- Enhanced Stats Section -->
        <div v-if="stats && stats.length" class="header-stats modern-stats">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label || stat.key"
            class="modern-stat-card"
            :class="{
              'stat-success': stat.success,
              'stat-warning': stat.warning,
              'animate-in': true,
            }"
            :style="{ '--animation-delay': `${index * 0.1}s` }"
          >
            <div v-if="stat.icon" class="stat-icon-wrapper">
              <AppIcon
                :name="stat.icon"
                class="stat-icon"
                :style="{ color: stat.color || 'var(--color-primary-400)' }"
              />
            </div>
            <div v-if="stat.value && stat.label" class="stat-info">
              <div class="stat-value" :data-value="stat.value">
                {{ stat.value }}
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <span v-else-if="stat.text" class="stat-text">{{ stat.text }}</span>
            <div class="stat-shimmer"></div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div v-if="$slots.actions || actions?.length" class="header-actions">
        <slot name="actions">
          <component
            :is="action.component || 'UnifiedButton'"
            v-for="(action, index) in actions"
            :key="action.key || index"
            v-bind="action.props"
            @click="handleActionClick(action, index)"
          >
            {{ action.text }}
          </component>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

export interface HeaderStat {
  key?: string;
  label?: string;
  value?: string | number;
  text?: string;
  icon?: string;
  color?: string;
  success?: boolean;
  warning?: boolean;
}

export interface HeaderAction {
  key?: string;
  text: string;
  component?: string;
  props?: Record<string, any>;
  handler?: Function;
}

interface Props {
  // Content Props
  title: string;
  subtitle?: string;
  icon?: string;

  // Layout Props
  variant?: "default" | "gaming" | "dashboard" | "settings" | "glass" | "hero";
  size?: "sm" | "md" | "lg" | "xl";
  centered?: boolean;
  stacked?: boolean;

  // Styling Props
  useGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundColor?: string;
  textColor?: string;

  // Title Props
  titleTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  titleSize?: "sm" | "md" | "lg" | "xl";

  // Interactive Props
  stats?: HeaderStat[];
  actions?: HeaderAction[];

  // Effect Props
  showShimmer?: boolean;
  showParticles?: boolean;
  showSwirls?: boolean;

  // Enhanced modern effects
  enableModernEffects?: boolean;
  enableCountUpAnimation?: boolean;
  enableParallax?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  centered: false,
  stacked: false,
  useGradient: true,
  gradientFrom: "var(--color-primary-500)",
  gradientTo: "var(--color-secondary-500)",
  titleTag: "h1",
  titleSize: "lg",
  showShimmer: false,
  showParticles: false,
  showSwirls: true,
  enableModernEffects: true,
  enableCountUpAnimation: true,
  enableParallax: true,
});

const emit = defineEmits<{
  actionClick: [action: HeaderAction, index: number];
}>();

// Computed Styles
const headerStyles = computed(() => {
  const styles: Record<string, string> = {};
  // Prefer CSS variables so theme can control defaults and transitions
  if (props.useGradient) {
    styles["--header-gradient-from"] = props.gradientFrom;
    styles["--header-gradient-to"] = props.gradientTo;
  } else if (props.backgroundColor) {
    styles["--header-bg"] = props.backgroundColor;
  }
  if (props.textColor) {
    styles["--header-text-color"] = props.textColor;
  }
  return styles;
});

const titleClasses = computed(() => [
  "header-title",
  `header-title-${props.titleSize}`,
  `header-title-${props.variant}`,
  {
    "text-center": props.centered,
  },
]);

// Event Handlers
const handleActionClick = (action: HeaderAction, index: number) => {
  if (action.handler) {
    action.handler(action, index);
  }
  emit("actionClick", action, index);
};

// Modern Effects and Animations
onMounted(async () => {
  await nextTick();

  // Animate stat values counting up
  const statValues = document.querySelectorAll(".stat-value[data-value]");
  statValues.forEach((stat, index) => {
    setTimeout(() => {
      const finalValue = parseInt((stat as HTMLElement).dataset.value || "0");
      if (finalValue && !isNaN(finalValue)) {
        let currentValue = 0;
        const increment = Math.max(1, finalValue / 30);

        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(counter);
          }
          stat.textContent = Math.floor(currentValue).toString();
        }, 50);
      }
    }, index * 200);
  });

  // Add click ripple effect to stat cards
  const statCards = document.querySelectorAll(".modern-stat-card");
  statCards.forEach((card) => {
    card.addEventListener("click", function (e: Event) {
      const ripple = document.createElement("span");
      const rect = (this as HTMLElement).getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (e as MouseEvent).clientX - rect.left - size / 2;
      const y = (e as MouseEvent).clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        width: ${size}px;
        height: ${size}px;
        top: ${y}px;
        left: ${x}px;
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
      `;
      (this as HTMLElement).appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add parallax effect to background animation
  if (typeof window !== "undefined" && props.enableParallax) {
    document.addEventListener("mousemove", (e) => {
      const header = document.querySelector(".unified-page-header");
      if (header) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const background = header.querySelector(".header-background-animation");
        if (background) {
          (background as HTMLElement).style.transform =
            `translate(${x * 20 - 10}px, ${y * 20 - 10}px)`;
        }

        // Enhanced parallax for particles
        const particles = header.querySelectorAll(".particle");
        particles.forEach((particle, index) => {
          const speed = (index + 1) * 0.5;
          (particle as HTMLElement).style.transform =
            `translate(${x * speed - speed / 2}px, ${y * speed - speed / 2}px)`;
        });
      }
    });
  }
});
</script>

<style scoped>
   UNIFIED PAGE HEADER COMPONENT SYSTEM

:root {
}

.unified-page-header {
  position: relative;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  background: linear-gradient(
  );
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  color: var(--header-text-color, var(--text-primary));
}

.header-size-sm {
  padding: var(--spacing-md) var(--spacing-md);
}

.header-size-md {
  padding: var(--spacing-lg) var(--spacing-lg);
}

.header-size-lg {
  padding: var(--spacing-xl) var(--spacing-lg);
}

.header-size-xl {
}

.header-centered .header-container {
  text-align: center;
  justify-content: center;
}

.header-stacked .title-wrapper {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.header-background-animation {
  position: absolute;
  pointer-events: none;
}

.header-background-animation::before {
  content: "";
  position: absolute;
  background-image:
}

@keyframes rotateBackground {
  from {
  }
  to {
  }
}

.header-floating-particles {
  position: absolute;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: var(--primary-light);
}

}

}

}

}

}

@keyframes floatParticle {
  from {
  }
  }
  }
  to {
  }
}

.header-gradient-border {
  position: absolute;
  background: linear-gradient(
    transparent,
    var(--primary),
    var(--secondary),
    var(--accent),
    transparent
  );
}

@keyframes borderGlow {
  }
  }
}

.header-shimmer {
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

@keyframes shimmer {
  }
  }
}

.header-swirls {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}
.header-swirls .swirl {
  position: absolute;
  mix-blend-mode: screen;
  background: radial-gradient(
  );
}
}
  background: radial-gradient(
  );
}
  background: radial-gradient(
  );
}
  background: radial-gradient(
  );
}

@keyframes swirl-float {
  }
  }
  }
  }
  }
}

.header-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  max-width: var(--container-max-width);
}

.header-title-section {
}

.title-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.title-content {
}

.header-icon-wrapper.stacked {
  background: var(--glass-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  backdrop-filter: var(--glass-backdrop-blur);
  margin-bottom: var(--spacing-sm);
}

.header-icon-large {
  color: white;
}

.header-icon-inline {
  margin-right: var(--spacing-sm);
}

.header-title {
  display: flex;
  align-items: center;
  background: linear-gradient(
    var(--primary-light),
    var(--secondary),
    var(--accent)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes gradientShift {
  }
  }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.header-actions :deep(.btn-unified) {
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
}

.header-actions :deep(.btn-unified.btn-icon-only) {
}

.header-actions :deep(.ui-chip),
.header-actions :deep(.glass-badge) {
  font-size: var(--font-size-sm);
  border-radius: var(--radius-full);
}

.header-actions :deep(.view-toggle-group) {
  display: inline-flex;
}

.header-title-sm {
  font-size: var(--font-size-xl);
}

.header-title-md {
}

.header-title-lg {
}

.header-title-xl {
}

.header-title-gaming {
  color: var(--text-on-primary);
}

.header-title-default {
  color: var(--text-on-primary);
}

.header-subtitle {
  color: var(--text-secondary);
  text-shadow: none;
  font-size: var(--font-size-lg);
}

.header-stats.modern-stats {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.modern-stat-card {
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.modern-stat-card.animate-in {
  animation-fill-mode: both;
}

@keyframes slideInLeft {
  from {
  }
  to {
  }
}

.modern-stat-card::before {
  content: "";
  position: absolute;
}

@keyframes shimmerStat {
  }
  }
}

.modern-stat-card:hover {
  border-color: var(--primary);
}

.modern-stat-card.stat-success {
  border-color: var(--success);
}

.modern-stat-card.stat-warning {
  border-color: var(--accent);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes iconPulse {
  }
  }
}

.stat-icon {
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  color: var(--text-primary);
  position: relative;
}

.stat-value[data-value] {
  animation-fill-mode: both;
}

@keyframes countUp {
  from {
  }
  to {
  }
}

.stat-label {
  color: var(--text-secondary);
}

.stat-text {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.stat-shimmer {
  position: absolute;
  transition:
  pointer-events: none;
}

.modern-stat-card:hover .stat-shimmer {
}

.stat-chip {
  background: var(--glass-bg-medium);
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--text-on-primary);
}

.stat-chip:hover {
  background: var(--glass-hover-bg);
}

.stat-chip-success {
}

.stat-chip-warning {
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.header-gaming {
  background: linear-gradient(
  );
}

.header-gaming::before {
  content: "";
  position: absolute;
  pointer-events: none;
}

.header-dashboard {
  background: linear-gradient(
  );
}

.header-settings {
  background: linear-gradient(
  );
}

.header-glass {
}

.header-glass .header-subtitle {
  color: var(--text-secondary);
}

.header-glass .stat-chip {
  background: var(--glass-elevated);
  border-color: var(--glass-border);
  color: var(--text-primary);
}

.header-glass .stat-value {
  color: var(--text-primary);
}

.header-glass .stat-label {
  color: var(--text-secondary);
}

.header-hero {
  background: linear-gradient(
  );
}

[data-theme="dark"] .unified-page-header {
}
[data-theme="dark"] .header-swirls .swirl {
}

  .unified-page-header {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .header-stats {
    justify-content: center;
  }

  .header-title-lg {
  }

  .header-title-xl {
  }
}

  .unified-page-header {
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .header-title-md {
    font-size: var(--font-size-xl);
  }

  .stat-chip {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}

@keyframes ripple {
  to {
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-shimmer,
  .header-background-animation::before,
  .particle,
  .header-gradient-border,
  .header-title,
  .modern-stat-card.animate-in,
  .stat-icon-wrapper,
  .stat-value[data-value] {
    animation: none !important;
  }

  .modern-stat-card:hover {
    transform: none;
  }

  .stat-chip:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .unified-page-header {
  }

  .stat-chip {
  }
}
</style>
