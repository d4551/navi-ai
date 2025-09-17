# NAVI Unified Glassmorphic Theme System

## 🎨 Overview

The NAVI unified theme system provides a centralized, consistent design language with:

- **Pure black/white base** with glassmorphic effects
- **RGB neon highlights** for interactive states
- **Consistent spacing, sizing, and layouts**
- **Accessible text on glass backgrounds**
- **Multi-column dense layouts** for efficient data display
- **Single source of truth** for all styling

## 📁 File Structure

```
src/styles/
├── index.css                     # Main entry point
├── navi-unified-theme.css         # Core theme (Single source of truth)
├── navi-layout-components.css     # Pre-built layout patterns
├── navi-button-system.css         # Comprehensive button system
└── legacy-bridge.css             # Compatibility layer (being phased out)
```

## 🎯 Design Tokens

### Colors

```css
/* Base Colors */
--navi-pure-white: #ffffff;
--navi-pure-black: #000000;

/* RGB Neon System (use with rgba()) */
--neon-red: 255, 0, 102;
--neon-blue: 0, 204, 255;
--neon-green: 0, 255, 153;
--neon-purple: 153, 0, 255;
--neon-pink: 255, 51, 204;
--neon-cyan: 51, 255, 255;
```

### Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### Border Radius

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-3xl: 32px;
--radius-full: 9999px;
```

## 🔮 Glassmorphic Components

### Glass Base Classes

```html
<!-- Basic glass effect -->
<div class="glass">Content with glassmorphic background</div>

<!-- Glass variants -->
<div class="glass-sm">Subtle glass</div>
<div class="glass-lg">Strong glass</div>
<div class="glass-xl">Intense glass</div>
```

### Neon Highlights

```html
<!-- Auto neon highlight (blue) -->
<button class="neon">Hover for neon glow</button>

<!-- Specific neon colors -->
<button class="neon-red">Red neon glow</button>
<button class="neon-green">Green neon glow</button>
<button class="neon-purple">Purple neon glow</button>

<!-- Neon borders and text -->
<div class="neon-border-blue">Blue neon border</div>
<span class="neon-text-cyan">Cyan neon text</span>
```

## 🏗️ Layout System

### Containers

```html
<!-- Responsive containers -->
<div class="container-md">Medium width container (448px)</div>
<div class="container-xl">Extra large container (576px)</div>
<div class="container-5xl">Max width container (1024px)</div>
```

### Flexbox Utilities

```html
<!-- Flex layouts -->
<div class="flex items-center justify-between gap-4">
  <div class="flex-1">Flexible content</div>
  <div class="flex-none">Fixed content</div>
</div>
```

### Grid System

```html
<!-- Responsive grid -->
<div class="grid grid-cols-3 gap-6">
  <div class="col-span-2">Two columns</div>
  <div class="col-span-1">One column</div>
</div>

<!-- Dense multi-column layouts -->
<div class="dense-grid">
  <div class="glass-card">Card 1</div>
  <div class="glass-card">Card 2</div>
  <div class="glass-card">Card 3</div>
</div>
```

## 🎴 Pre-built Layout Components

### Cards

```html
<!-- Standard card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Optional subtitle</p>
  </div>
  <div class="card-content">Main content here</div>
  <div class="card-footer">
    <button class="btn-primary">Action</button>
  </div>
</div>

<!-- Card variants -->
<div class="card-compact">Compact spacing</div>
<div class="card-spacious">Generous spacing</div>
```

### Navigation

```html
<!-- Header navigation -->
<nav class="nav-header">
  <div class="nav-header-content">
    <a href="#" class="nav-logo">NAVI</a>
    <div class="nav-menu">
      <a href="#" class="nav-item active">Dashboard</a>
      <a href="#" class="nav-item">Settings</a>
    </div>
  </div>
</nav>

<!-- Sidebar navigation -->
<nav class="nav-sidebar">
  <a href="#" class="nav-sidebar-item active">
    <i class="icon">🏠</i>
    Dashboard
  </a>
  <a href="#" class="nav-sidebar-item">
    <i class="icon">⚙️</i>
    Settings
  </a>
</nav>
```

### Dashboard Layouts

```html
<!-- Two-column dashboard -->
<div class="dashboard-two-col">
  <main>
    <div class="dashboard-widget">
      <h3>Main Content</h3>
    </div>
  </main>
  <aside>
    <div class="dashboard-widget-stat">
      <div class="dashboard-stat-value">1,234</div>
      <div class="dashboard-stat-label">Active Users</div>
    </div>
  </aside>
</div>
```

### Forms

```html
<div class="form-container">
  <div class="form-group">
    <label class="form-label">Email Address</label>
    <input type="email" class="form-input" placeholder="Enter email" />
    <div class="form-help">We'll never share your email</div>
  </div>

  <div class="form-actions">
    <button class="btn-secondary">Cancel</button>
    <button class="btn-primary">Submit</button>
  </div>
</div>
```

## 🔘 Button System

### Basic Buttons

```html
<!-- Primary button with neon blue highlight -->
<button class="btn-primary">Primary Action</button>

<!-- Secondary button -->
<button class="btn-secondary">Secondary Action</button>

<!-- Ghost button (transparent) -->
<button class="btn-ghost">Ghost Button</button>
```

### Button Sizes

```html
<button class="btn-primary btn-xs">Extra Small</button>
<button class="btn-primary btn-sm">Small</button>
<button class="btn-primary btn-md">Medium (default)</button>
<button class="btn-primary btn-lg">Large</button>
<button class="btn-primary btn-xl">Extra Large</button>
```

### Neon Button Variants

```html
<button class="btn-neon-red">Red Neon</button>
<button class="btn-neon-green">Green Neon</button>
<button class="btn-neon-purple">Purple Neon</button>
<button class="btn-neon-pink">Pink Neon</button>
<button class="btn-neon-cyan">Cyan Neon</button>
```

### Icon Buttons

```html
<!-- Round icon button -->
<button class="btn-icon btn-primary">
  <i class="icon">⚙️</i>
</button>

<!-- Floating action button -->
<button class="btn-fab">
  <i class="icon">➕</i>
</button>
```

### Button States

```html
<!-- Loading state -->
<button class="btn-primary btn-loading">Loading...</button>

<!-- Disabled state -->
<button class="btn-primary" disabled>Disabled</button>

<!-- Pressed state -->
<button class="btn-primary" aria-pressed="true">Active</button>
```

## 📱 Responsive Design

### Breakpoints

- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`
- Desktop: `max-width: 1024px`

### Responsive Classes

```html
<!-- Hide on mobile -->
<div class="md:hidden">Hidden on tablet and below</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive columns
</div>

<!-- Responsive spacing -->
<div class="p-4 md:p-6 lg:p-8">Responsive padding</div>
```

## ♿ Accessibility Features

### Text Accessibility on Glass

```html
<!-- High contrast text for glass backgrounds -->
<div class="glass">
  <h2 class="text-glass-primary">Primary heading</h2>
  <p class="text-glass-secondary">Secondary text</p>
  <small class="text-glass-muted">Muted text</small>
</div>

<!-- Text with backdrop for better readability -->
<div class="glass">
  <span class="text-backdrop">Important text with backdrop</span>
</div>
```

### Focus Management

```html
<!-- Neon focus ring -->
<button class="btn-primary focus:ring-neon">Accessible button</button>

<!-- Custom focus outline -->
<input class="form-input focus:outline-neon" />
```

## 🎬 Animations

### Built-in Animations

```html
<!-- Fade in animation -->
<div class="animate-fade-in">Fades in on load</div>

<!-- Slide up animation -->
<div class="animate-slide-up">Slides up on load</div>

<!-- Scale in animation -->
<div class="animate-scale-in">Scales in on load</div>

<!-- Pulsing neon effect -->
<button class="btn-primary animate-pulse-neon">Pulsing neon</button>
```

## 🎯 Best Practices

### 1. Use Semantic Classes

```html
<!-- Good: Semantic naming -->
<button class="btn-primary">Submit Form</button>

<!-- Avoid: Utility-heavy -->
<button class="glass neon-blue px-4 py-2 rounded-md">Submit</button>
```

### 2. Layer Glass Effects

```html
<!-- Good: Layered glass effects -->
<div class="glass">
  <div class="glass-card">Nested glass for depth</div>
</div>
```

### 3. Consistent Spacing

```html
<!-- Good: Use design tokens -->
<div class="p-6 mb-4 gap-3">Consistent spacing</div>

<!-- Avoid: Arbitrary values -->
<div style="padding: 23px; margin-bottom: 17px;">Inconsistent</div>
```

### 4. Accessible Text Contrast

```html
<!-- Good: High contrast on glass -->
<div class="glass">
  <h3 class="text-glass-primary">Readable heading</h3>
</div>

<!-- Avoid: Poor contrast -->
<div class="glass">
  <h3 style="color: rgba(255,255,255,0.3);">Hard to read</h3>
</div>
```

## 🌙 Theme Switching

The theme automatically responds to the `data-theme` attribute on the root element:

```javascript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark')

// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light')

// Use system preference
document.documentElement.removeAttribute('data-theme')
```

## 📊 Multi-Column Dense Layouts

For efficient data display:

```html
<!-- Auto-fit grid with minimum 300px columns -->
<div class="dense-grid">
  <div class="glass-card">Item 1</div>
  <div class="glass-card">Item 2</div>
  <div class="glass-card">Item 3</div>
  <!-- Automatically wraps and fits columns -->
</div>

<!-- Masonry-style layout -->
<div class="dense-masonry">
  <div class="glass-card">Variable height content</div>
  <div class="glass-card">Fits nicely in columns</div>
</div>
```

## 🔧 Customization

### Overriding Design Tokens

```css
:root {
  /* Override specific tokens */
  --radius-md: 16px; /* More rounded */
  --space-4: 20px; /* More spacing */

  /* Custom neon color */
  --neon-custom: 255, 128, 0; /* Orange */
}

.btn-neon-custom {
  border-color: rgb(var(--neon-custom));
}

.btn-neon-custom:hover {
  box-shadow: 0 0 20px rgba(var(--neon-custom), 0.4);
}
```

### Creating Custom Components

```css
.my-custom-component {
  /* Use existing tokens */
  @apply glass p-6 neon-blue;

  /* Add custom styles */
  min-height: var(--h-md);
  border-left: 3px solid rgb(var(--neon-blue));
}
```

This unified theme system provides everything needed to create consistent, beautiful, and accessible interfaces with a distinctive glassmorphic aesthetic and neon highlights.
