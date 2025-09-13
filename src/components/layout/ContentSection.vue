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
import { computed } from 'vue';

import { computed } from "vue";

interface Props {
  title?: string;
  subtitle?: string;
  titleIcon?: string;
  titleIconColor?: string;
  type?:
    | "default"
    | "card"
    | "hero"
    | "stats"
    | "form"
    | "list"
    | "gaming"
    | "noir";
  spacing?: "none" | "compact" | "normal" | "comfortable" | "spacious";
  background?: "none" | "glass" | "elevated" | "primary" | "secondary";
  border?: boolean;
  fullWidth?: boolean;
}

const _props = withDefaults(defineProps<Props>(), {
  type: "default",
  spacing: "normal",
  background: "none",
  border: false,
  fullWidth: false,
  titleIconColor: "primary",
});

const sectionClasses = computed(() => [
  `section-type-${props.type}`,
  `section-spacing-${props.spacing}`,
  `section-bg-${props.background}`,
  {
    "section-border": props.border,
    "section-full-width": props.fullWidth,
  },
]);

const titleClasses = computed(() => [`title-${props.type}`]);

const contentClasses = computed(() => [
  `content-${props.type}`,
  `content-spacing-${props.spacing}`,
]);
</script>

<style scoped>

.content-section {
}


.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-title-container {
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.section-title-icon {
}

.section-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.section-header-actions {
  display: flex;
  flex-wrap: wrap;
}


.section-content {
  position: relative;
}


.section-type-card {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-base);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-base);
}

.section-type-card .section-header {
}

.section-type-hero {
  background: var(--gradient-primary-subtle);
  text-align: center;
}

.section-type-hero .title-hero {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-type-stats {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.section-type-stats .title-stats {
  font-size: var(--font-size-lg);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.section-type-form {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.section-type-form .section-content {
  display: flex;
  flex-direction: column;
}

.section-type-list .section-content {
  display: flex;
  flex-direction: column;
}

.section-type-gaming {
  background: var(--surface-gaming);
  border-radius: var(--radius-xl);
}

.section-type-gaming .title-gaming {
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}

.section-type-noir {
  background: linear-gradient(
  );
  border-radius: var(--radius-xl);
}

.section-type-noir .title-noir {
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}


.section-bg-glass {
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur-base);
}

.section-bg-elevated {
  background: var(--surface-elevated);
  box-shadow: var(--shadow-base);
}

.section-bg-primary {
}

.section-bg-secondary {
}


.section-spacing-none {
}

.section-spacing-none .section-header {
}

.section-spacing-compact {
}

.section-spacing-compact .section-header {
}

.section-spacing-comfortable {
}

.section-spacing-comfortable .section-header {
}

.section-spacing-spacious {
}

.section-spacing-spacious .section-header {
}

.content-spacing-none {
}

.content-spacing-compact {
}

.content-spacing-normal {
}

.content-spacing-comfortable {
}

.content-spacing-spacious {
}


.section-border {
  border-radius: var(--radius-lg);
}

.section-full-width {
}


.section-footer {
}


  .section-header {
    flex-direction: column;
    align-items: stretch;
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
  }
}

  .section-title {
    font-size: var(--font-size-md);
    flex-direction: column;
    align-items: flex-start;
  }

  .section-title-icon {
    font-size: var(--font-size-lg);
  }
}
</style>
