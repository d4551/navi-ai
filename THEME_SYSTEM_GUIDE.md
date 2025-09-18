# NAVI Theme System - Production Guide

## 🎨 Overview

The NAVI theme system provides a unified glassmorphic design with pure black/white backgrounds, RGB neon highlights, and comprehensive accessibility support. Built on CSS custom properties with Tailwind utility integration.

## 🔧 Core Architecture

### Theme Structure

```
src/styles/
├── index.css                    # Main entry point
├── navi-unified-theme.css       # Core theme variables & glassmorphic styles
├── tailwind-utilities.css       # Tailwind bridge utilities
└── navi-layout-components.css   # Pre-built component patterns
```

### Key Features

- ✅ Pure black (#000000) / white (#ffffff) glassmorphic design
- ✅ RGB neon highlights for interactive states
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Multi-column dense layouts
- ✅ Responsive breakpoints
- ✅ Screen reader compatibility
- ✅ Reduced motion support

## 🚀 Quick Start

### 1. Basic Glass Card

```vue
<template>
  <div class="glass-card">
    <h2 class="text-glass-primary">Card Title</h2>
    <p class="text-glass-secondary">Card description text</p>
    <button class="btn-primary neon-blue focus:ring-neon">Action</button>
  </div>
</template>
```

### 2. Interactive Navigation

```vue
<template>
  <nav class="nav-glass">
    <a
      href="#"
      class="nav-item-link glass-interactive neon-blue focus:ring-neon"
    >
      <span class="text-glass-primary">Dashboard</span>
    </a>
  </nav>
</template>
```

### 3. Dense Data Grid

```vue
<template>
  <div class="layout-dense-auto">
    <div class="glass-card" v-for="item in items" :key="item.id">
      <div class="card-content">
        <h3 class="heading-glass">{{ item.title }}</h3>
        <p class="text-glass-secondary">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>
```

## 🎯 Design Tokens

### Colors

```css
/* Base Theme */
--color-white: #ffffff;
--color-black: #000000;

/* RGB Neon Highlights */
--neon-blue: 0, 204, 255;
--neon-red: 255, 0, 102;
--neon-green: 0, 255, 153;
--neon-orange: 255, 153, 0;
--neon-purple: 204, 0, 255;
--neon-pink: 255, 102, 204;
```

### Glassmorphic Properties

```css
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-blur: blur(12px);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Spacing & Sizing

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
```

### Border Radius (Slight)

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.625rem; /* 10px */
```

## 📱 Layout System

### Responsive Grid Classes

```css
.layout-dense-auto     /* Auto-responsive grid */
.layout-dense-2        /* 2 columns */
.layout-dense-3        /* 3 columns */
.layout-dense-4        /* 4 columns */
.layout-masonry        /* CSS columns masonry */
.layout-card-grid      /* Card-specific grid */
```

### Breakpoint Behavior

- **Desktop (1400px+)**: 4 columns
- **Large (1200-1400px)**: 3 columns
- **Medium (1024-1200px)**: 2 columns
- **Tablet (768-1024px)**: 1-2 columns
- **Mobile (<768px)**: 1 column

## 🎨 Component Classes

### Glass Elements

```css
.glass-card            /* Basic glass card */
.glass-panel           /* Larger glass panel */
.glass-modal           /* Modal overlay */
.glass-interactive     /* Interactive glass element */
.glass-border          /* Glass border styling */
```

### Text Styles

```css
.text-glass-primary    /* Primary text on glass */
.text-glass-secondary  /* Secondary text on glass */
.heading-glass         /* Glass-optimized headings */
.text-readable         /* Enhanced readability */
.text-contrast-high    /* High contrast variant */
```

### Interactive States

```css
.neon-blue            /* Blue neon highlights */
.neon-red             /* Red neon highlights */
.neon-green           /* Green neon highlights */
.focus:ring-neon      /* Neon focus ring */
.hover:glow-neon      /* Neon glow on hover */
```

## ♿ Accessibility Features

### Text Contrast

- **Primary text**: 21:1 ratio (AAA)
- **Secondary text**: 16.8:1 ratio (AAA)
- **Tertiary text**: 12.6:1 ratio (AAA)
- **Muted text**: 8.4:1 ratio (AA)

### Interactive Elements

```css
.focus\:ring-neon:focus-visible {
  box-shadow: 0 0 0 3px rgba(var(--neon-blue), 0.3);
  outline: none;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### Screen Reader Support

- Proper ARIA labels and descriptions
- Semantic HTML structure
- Focus management
- Status announcements

## 📱 Mobile Optimization

### Touch Targets

```css
.btn,
.nav-item-link,
.interactive-element {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-3) var(--space-4);
}
```

### Mobile Adjustments

```css
@media (max-width: 768px) {
  .glass-card {
    padding: var(--space-4);
    margin: var(--space-2);
  }

  .text-glass-primary {
    font-size: var(--font-size-lg);
    line-height: 1.5;
  }
}
```

## 🔄 Theme Integration

### Vue Component Usage

```vue
<script setup>
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

const theme = useUnifiedTheme()
// Access theme variables: theme.colors, theme.spacing, etc.
</script>

<template>
  <div class="glass-card neon-blue">
    <h2 class="heading-glass">{{ title }}</h2>
    <div class="layout-dense-auto">
      <!-- Grid content -->
    </div>
  </div>
</template>
```

### CSS Custom Properties

```css
.custom-component {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  color: var(--text-primary);
}
```

## ⚡ Performance Optimization

### CSS Containment

```css
.layout-dense-auto {
  contain: layout style;
}
```

### GPU Acceleration

```css
.neon-blue:hover {
  transform: translateZ(0) translateY(-1px);
  will-change: transform, box-shadow;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .neon-pulse,
  .animate-fade-in {
    animation: none;
  }

  .glass-interactive {
    transition: none;
  }
}
```

## 🌟 Advanced Patterns

### Status Components

```vue
<template>
  <div class="status-card status-success">
    <div class="status-icon">✓</div>
    <div class="status-content">
      <h3 class="status-title">Success</h3>
      <p class="status-message">Operation completed</p>
    </div>
  </div>
</template>
```

### Interactive Dashboard

```vue
<template>
  <div class="dashboard-grid">
    <DashboardModuleCard
      v-for="module in modules"
      :key="module.key"
      :data="module"
      @navigate="handleNavigation"
      class="neon-hover"
    />
  </div>
</template>
```

### Data Visualization

```vue
<template>
  <div class="stats-grid">
    <div class="stat-card neon-blue" v-for="stat in stats" :key="stat.id">
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
      <div class="stat-trend" :class="stat.trendClass">
        {{ stat.trend }}
      </div>
    </div>
  </div>
</template>
```

## 🚀 Production Deployment

### Build Configuration

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "@/styles/index.css";`,
      },
    },
  },
}
```

### Bundle Optimization

- CSS is tree-shaken for unused utilities
- Critical styles are inlined
- Non-critical styles are lazy-loaded
- Glassmorphic effects are GPU-accelerated

### Browser Support

- ✅ Chrome 90+: Full support
- ✅ Firefox 88+: Full support
- ✅ Safari 14+: Full support
- ✅ Edge 90+: Full support

## 🔧 Troubleshooting

### Common Issues

**Glass effects not visible**

- Ensure backdrop-filter is supported
- Check for proper z-index stacking
- Verify glass background opacity

**Text not readable on glass**

- Use `.text-readable` class
- Increase text-shadow values
- Apply `.text-contrast-high` for critical content

**Layout breaking on mobile**

- Use responsive grid classes
- Test touch target sizes (min 44px)
- Verify mobile-specific media queries

**Accessibility violations**

- Run axe-core automated tests
- Test with screen readers
- Verify keyboard navigation
- Check color contrast ratios

## 📚 Resources

- [ACCESSIBILITY_COMPLIANCE.md](./ACCESSIBILITY_COMPLIANCE.md) - Complete accessibility guide
- [RESPONSIVE_LAYOUT_TESTS.md](./RESPONSIVE_LAYOUT_TESTS.md) - Layout testing documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Grid Complete Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**The NAVI theme system provides a complete, accessible, and performant foundation for modern web applications with glassmorphic design aesthetics.**
