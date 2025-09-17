# NAVI Unified Theme System Guide

## 🎨 Pure Black/White Glassmorphic Design with RGB Neon Highlights

This guide demonstrates how to use the unified theme system that provides a single source of truth for styling across the entire NAVI application.

## 🏗️ Core Architecture

### Theme Files Structure

```
src/styles/
├── index.css                      # Main import file
├── navi-unified-theme.css         # Single source of truth theme variables
├── tailwind-utilities.css         # Tailwind bridging utilities
└── font-overrides.css            # Font system overrides
```

### Color System

- **Light Mode**: Pure white (#ffffff) backgrounds
- **Dark Mode**: Pure black (#000000) backgrounds
- **Glass Effects**: Subtle transparency with backdrop blur
- **RGB Neon Highlights**: Interactive states with vibrant RGB colors

## 🎯 Key CSS Variables

### Core Colors

```css
--bg-primary: #ffffff | #000000 /* Pure backgrounds */ --text-primary: #000000 |
  #ffffff /* High contrast text */ --text-secondary: rgba(0, 0, 0, 0.8) |
  rgba(255, 255, 255, 0.9) --text-tertiary: rgba(0, 0, 0, 0.6) |
  rgba(255, 255, 255, 0.7) --text-muted: rgba(0, 0, 0, 0.4) |
  rgba(255, 255, 255, 0.5);
```

### Glassmorphic System

```css
--glass-bg: rgba(255, 255, 255, 0.1) | rgba(255, 255, 255, 0.05)
  --glass-bg-hover: rgba(255, 255, 255, 0.15) | rgba(255, 255, 255, 0.08)
  --glass-border: rgba(255, 255, 255, 0.3) | rgba(255, 255, 255, 0.1)
  --glass-blur: blur(20px) --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) |
  rgba(0, 0, 0, 0.3);
```

### RGB Neon Colors

```css
--neon-red:
  255, 0, 102 --neon-blue: 0, 204, 255 --neon-green: 0, 255,
  153 --neon-purple: 153, 0, 255 --neon-pink: 255, 51, 204 --neon-cyan: 51, 255,
  255 --neon-orange: 255, 165, 0;
```

### Spacing Scale

```css
--space-1: 4px --space-8: 32px --space-2: 8px --space-10: 40px --space-3: 12px
  --space-12: 48px --space-4: 16px --space-16: 64px --space-6: 24px
  --space-20: 80px;
```

## 🧩 Component Classes

### Glass Components

```css
/* Basic glass element */
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

/* Interactive glass with neon highlights */
.glass-interactive {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
}

.glass-interactive:hover {
  background: var(--bg-hover);
  border-color: rgba(var(--neon-blue), 0.3);
  box-shadow: 0 0 20px rgba(var(--neon-blue), 0.1);
}
```

### Neon Highlight System

```css
/* Basic neon effect */
.neon:hover {
  box-shadow:
    0 0 20px rgba(var(--neon-blue), 0.3),
    0 0 40px rgba(var(--neon-blue), 0.1);
  transform: translateY(-1px);
}

/* Color variants */
.neon-red:hover {
  box-shadow: 0 0 20px rgba(var(--neon-red), 0.4);
}
.neon-green:hover {
  box-shadow: 0 0 20px rgba(var(--neon-green), 0.4);
}
.neon-purple:hover {
  box-shadow: 0 0 20px rgba(var(--neon-purple), 0.4);
}
```

### Text Accessibility

```css
/* High contrast text on glass */
.text-glass-primary {
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: var(--font-weight-semibold);
}

/* Enhanced readability */
.text-readable {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}
```

## 🏗️ Layout System

### Dense Multi-Column Layouts

```css
/* Responsive grid */
.dense-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
  align-items: start;
}

/* Masonry layout */
.dense-masonry {
  columns: 3;
  column-gap: var(--space-4);
  column-fill: balance;
}

/* Fixed columns */
.grid-fixed-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
```

### Flexbox Layouts

```css
.flex-layout {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.flex-layout-center {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: center;
}
```

## 🎨 Usage Examples

### Glass Card Component

```vue
<template>
  <div class="glass-card neon-blue">
    <h3 class="heading-glass">Card Title</h3>
    <p class="text-glass-secondary">Card content with optimal readability</p>
    <button class="glass-button neon">Action</button>
  </div>
</template>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
</style>
```

### Interactive Button

```vue
<template>
  <button class="glass-button neon-blue">
    <span class="button-text-glass">Click Me</span>
  </button>
</template>

<style scoped>
.glass-button {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  transition: all var(--transition-normal);
}

.glass-button:hover {
  background: var(--bg-hover);
  border-color: rgba(var(--neon-blue), 0.3);
  box-shadow: 0 0 20px rgba(var(--neon-blue), 0.1);
  transform: translateY(-1px);
}
</style>
```

### Dense Data Grid

```vue
<template>
  <div class="dense-grid">
    <div class="glass-card" v-for="item in items" :key="item.id">
      <h4 class="text-glass-primary">{{ item.title }}</h4>
      <p class="text-glass-secondary">{{ item.description }}</p>
    </div>
  </div>
</template>
```

## 📱 Responsive Design

The system includes built-in responsive breakpoints:

```css
/* Desktop first approach */
@media (max-width: 1400px) {
  /* Large desktop adjustments */
}
@media (max-width: 1200px) {
  /* Desktop adjustments */
}
@media (max-width: 1024px) {
  /* Tablet landscape */
}
@media (max-width: 768px) {
  /* Tablet portrait */
}
@media (max-width: 480px) {
  /* Mobile */
}
```

## ♿ Accessibility Features

### Screen Reader Support

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... hidden but accessible */
}
```

### High Contrast Text

```css
.text-contrast-high {
  font-weight: var(--font-weight-bold);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
}
```

### Focus Management

```css
.focus\:ring-neon:focus-visible {
  box-shadow: 0 0 0 3px rgba(var(--neon-blue), 0.3);
  outline: none;
}
```

## 🎯 Best Practices

### 1. Always Use Theme Variables

```css
/* ✅ Good */
color: var(--text-primary);
padding: var(--space-4);
border-radius: var(--radius-md);

/* ❌ Bad */
color: #000000;
padding: 16px;
border-radius: 8px;
```

### 2. Layer Glass Effects Properly

```css
/* ✅ Proper layering */
.glass-element {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  z-index: var(--z-10);
}
```

### 3. Use Semantic Neon Colors

```css
/* ✅ Semantic usage */
.success-button {
  border-color: rgba(var(--neon-green), 0.3);
}
.warning-button {
  border-color: rgba(var(--neon-orange), 0.3);
}
.error-button {
  border-color: rgba(var(--neon-red), 0.3);
}
```

### 4. Ensure Text Readability

```css
/* ✅ Accessible text on glass */
.glass-text {
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: var(--font-weight-medium);
}
```

## 🔧 Theme Integration

### Vue Component Integration

```vue
<script setup>
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

const { isDark, colorScheme, getColor } = useUnifiedTheme()
</script>
```

### CSS-in-JS Integration

```js
import { createThemeCSS } from '@/shared/composables/useUnifiedTheme'

const theme = createThemeCSS('dark')
const styles = {
  background: theme.colors.background,
  color: theme.colors['on-background'],
}
```

This unified theme system ensures consistency, accessibility, and a premium glassmorphic aesthetic across all NAVI components while maintaining excellent performance and developer experience.
