<template>
  <section
    class="content-section"
    :class="sectionClasses"
    :data-section-type="type"
  >
    <!-- Section Header -->
    <header v-if="title || $slots['section-header']" class="section-header">
      <div v-if="title" class="section-title-container">
        <h2 class="section-title" :class="titleClasses">
          <AppIcon
            :name="titleIcon"
            :color="titleIconColor"
            class="section-title-icon"
          />
          {{ title }}
        </h2>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots['section-header']" class="section-header-actions">
        <slot name="section-header" />
      </div>
    </header>

    <!-- Section Content -->
    <div class="section-content" :class="contentClasses">
      <slot />
    </div>

    <!-- Section Footer -->
    <footer v-if="$slots['section-footer']" class="section-footer">
      <slot name="section-footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  titleIcon?: string
  titleIconColor?: string
  type?:
    | 'default'
    | 'card'
    | 'hero'
    | 'stats'
    | 'form'
    | 'list'
    | 'gaming'
    | 'noir'
  spacing?: 'none' | 'compact' | 'normal' | 'comfortable' | 'spacious'
  background?: 'none' | 'glass' | 'elevated' | 'primary' | 'secondary'
  border?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  spacing: 'normal',
  background: 'none',
  border: false,
  fullWidth: false,
  titleIconColor: 'primary',
})

const sectionClasses = computed(() => [
  `section-type-${props.type}`,
  `section-spacing-${props.spacing}`,
  `section-bg-${props.background}`,
  {
    'section-border': props.border,
    'section-full-width': props.fullWidth,
  },
])

const titleClasses = computed(() => [`title-${props.type}`])

const contentClasses = computed(() => [
  `content-${props.type}`,
  `content-spacing-${props.spacing}`,
])
</script>

<style scoped>
/* ===== CONTENT SECTION BASE ===== */

.content-section {
  margin-bottom: var(--spacing-6);
}

/* ===== SECTION HEADER ===== */

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
  gap: var(--spacing-4);
}

.section-title-container {
  flex: 1;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.section-title-icon {
  font-size: var(--font-size-2xl);
}

.section-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.section-header-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

/* ===== SECTION CONTENT ===== */

.section-content {
  position: relative;
}

/* ===== SECTION TYPES ===== */

/* Card Section */
.section-type-card {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-base);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-base);
}

.section-type-card .section-header {
  margin-bottom: var(--spacing-6);
}

/* Hero Section */
.section-type-hero {
  background: var(--gradient-primary-subtle);
  border: 2px solid var(--color-primary-200);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  text-align: center;
}

.section-type-hero .title-hero {
  font-size: var(--font-size-2xl);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Stats Section */
.section-type-stats {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  border-left: 4px solid var(--color-primary-500);
}

.section-type-stats .title-stats {
  font-size: var(--font-size-lg);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* Form Section */
.section-type-form {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.section-type-form .section-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* List Section */
.section-type-list .section-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* Gaming Section */
.section-type-gaming {
  background: var(--surface-gaming);
  border: 1px solid var(--color-primary-500);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.2);
}

.section-type-gaming .title-gaming {
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  text-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.3);
}

/* Noir Section */
.section-type-noir {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(10, 10, 10, 0.9) 100%
  );
  border: 1px solid rgba(0, 255, 127, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
}

.section-type-noir .title-noir {
  font-family: var(--font-primary);
  color: var(--text-inverse);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  text-shadow: 0 0 15px rgba(0, 255, 127, 0.4);
}

/* ===== BACKGROUND VARIANTS ===== */

.section-bg-glass {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-base);
  border: 1px solid var(--border-glass);
}

.section-bg-elevated {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  box-shadow: var(--shadow-base);
}

.section-bg-primary {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
}

.section-bg-secondary {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
}

/* ===== SPACING VARIANTS ===== */

.section-spacing-none {
  margin-bottom: 0;
}

.section-spacing-none .section-header {
  margin-bottom: 0;
}

.section-spacing-compact {
  margin-bottom: var(--spacing-3);
}

.section-spacing-compact .section-header {
  margin-bottom: var(--spacing-2);
}

.section-spacing-comfortable {
  margin-bottom: var(--spacing-8);
}

.section-spacing-comfortable .section-header {
  margin-bottom: var(--spacing-6);
}

.section-spacing-spacious {
  margin-bottom: var(--spacing-10);
}

.section-spacing-spacious .section-header {
  margin-bottom: var(--spacing-8);
}

/* Content Spacing */
.content-spacing-none {
  padding: 0;
}

.content-spacing-compact {
  padding: var(--spacing-2);
}

.content-spacing-normal {
  padding: var(--spacing-4);
}

.content-spacing-comfortable {
  padding: var(--spacing-6);
}

.content-spacing-spacious {
  padding: var(--spacing-8);
}

/* ===== SECTION MODIFIERS ===== */

.section-border {
  border: 1px solid var(--border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.section-full-width {
  width: 100%;
  margin-left: calc(-1 * var(--spacing-4));
  margin-right: calc(-1 * var(--spacing-4));
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

/* ===== SECTION FOOTER ===== */

.section-footer {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--border-base);
}

/* ===== RESPONSIVE DESIGN ===== */

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }

  .section-header-actions {
    justify-content: flex-start;
  }

  .section-title {
    font-size: var(--font-size-lg);
  }

  .section-type-hero .title-hero {
    font-size: var(--font-size-xl);
  }

  .section-full-width {
    margin-left: calc(-1 * var(--spacing-2));
    margin-right: calc(-1 * var(--spacing-2));
    padding-left: var(--spacing-2);
    padding-right: var(--spacing-2);
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: var(--font-size-md);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }

  .section-title-icon {
    font-size: var(--font-size-lg);
  }
}
</style>
