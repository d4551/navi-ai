# TailwindPlus Elements Integration Guide

This document outlines how TailwindPlus Elements are integrated into the NAVI AI application with the existing design system.

## Overview

TailwindPlus Elements has been successfully integrated to provide advanced UI components while maintaining consistency with NAVI's glass design system and theming.

## Installation

The package is installed via npm:

```bash
npm install @tailwindplus/elements
```

And imported in `src/main.js`:

```javascript
import '@tailwindplus/elements'
```

## Design System Integration

### Theme Compatibility

All TailwindPlus components automatically inherit NAVI's design tokens:

- Glass morphism effects (`glass-surface`, `glass-bg-active`)
- Color palette (primary, secondary, text colors)
- Dark mode support
- Gaming theme enhancements

### Component Styling

Components are styled in `src/styles/tailwindplus-integration.css` to match NAVI's aesthetic:

- Consistent border radius and shadows
- Proper focus states with ring colors
- Responsive behavior
- Animation preferences

## Available Components

### 1. Autocomplete (`<el-autocomplete>`)

```vue
<el-autocomplete class="w-full">
  <input name="skill" placeholder="Search skills..." class="form-input w-full glass-interactive" />
  <button type="button" class="glass-interactive p-2">
    <!-- Icon -->
  </button>
  <el-options popover anchor="bottom start" class="w-[--input-width] glass-surface">
    <el-option value="javascript" class="px-4 py-2 hover:glass-bg-active">JavaScript</el-option>
    <el-option value="python" class="px-4 py-2 hover:glass-bg-active">Python</el-option>
  </el-options>
</el-autocomplete>
```

### 2. Dialog (`<el-dialog>`)

```vue
<button command="show-modal" commandfor="my-dialog" class="btn btn-primary">
  Open Dialog
</button>

<el-dialog>
  <dialog id="my-dialog" class="backdrop:bg-transparent">
    <el-dialog-backdrop class="pointer-events-none bg-black/50" />
    <el-dialog-panel class="glass-card max-w-md mx-auto mt-20">
      <div class="p-6">
        <h3 class="text-xl font-bold text-glass-primary mb-4">Dialog Title</h3>
        <p class="text-glass-secondary mb-6">Dialog content...</p>
        <div class="flex gap-3 justify-end">
          <button command="close" commandfor="my-dialog" class="btn btn-secondary">Cancel</button>
          <button command="close" commandfor="my-dialog" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    </el-dialog-panel>
  </dialog>
</el-dialog>
```

### 3. Select (`<el-select>`)

```vue
<el-select name="experience" value="intermediate" class="w-full">
  <button type="button" class="form-input w-full text-left glass-interactive">
    <el-selectedcontent>Intermediate</el-selectedcontent>
    <!-- Chevron icon -->
  </button>
  <el-options popover anchor="bottom start" class="w-[--button-width] glass-surface">
    <el-option value="beginner" class="px-4 py-2 hover:glass-bg-active">Beginner</el-option>
    <el-option value="intermediate" class="px-4 py-2 hover:glass-bg-active">Intermediate</el-option>
  </el-options>
</el-select>
```

### 4. Disclosure (`<el-disclosure>`)

```vue
<button
  command="--toggle"
  commandfor="my-disclosure"
  type="button"
  class="btn btn-secondary"
>
  Toggle Content
</button>

<el-disclosure
  id="my-disclosure"
  hidden
  class="glass-bg-light p-4 rounded-lg transition"
>
  <p>Hidden content that can be toggled...</p>
</el-disclosure>
```

### 5. Dropdown Menu (`<el-dropdown>`)

```vue
<el-dropdown>
  <button type="button" class="btn btn-primary">Actions</button>
  <el-menu anchor="bottom start" popover class="glass-surface">
    <button class="w-full text-left px-4 py-2 hover:glass-bg-active">Edit</button>
    <button class="w-full text-left px-4 py-2 hover:glass-bg-active">Delete</button>
  </el-menu>
</el-dropdown>
```

### 6. Tabs (`<el-tab-group>`)

```vue
<el-tab-group class="w-full">
  <el-tab-list class="flex border-b border-glass-border mb-4">
    <button type="button" class="tab-button">Tab 1</button>
    <button type="button" class="tab-button">Tab 2</button>
  </el-tab-list>
  <el-tab-panels>
    <div class="text-glass-secondary">Content 1</div>
    <div hidden class="text-glass-secondary">Content 2</div>
  </el-tab-panels>
</el-tab-group>
```

### 7. Command Palette (`<el-command-palette>`)

```vue
<el-dialog>
  <dialog id="command-palette">
    <el-dialog-panel class="glass-card max-w-2xl mx-auto">
      <el-command-palette>
        <input autofocus placeholder="Search commands..." class="w-full bg-transparent" />
        <el-command-list class="max-h-80 overflow-y-auto">
          <button class="w-full text-left px-3 py-2 hover:glass-bg-active">Command 1</button>
          <button class="w-full text-left px-3 py-2 hover:glass-bg-active">Command 2</button>
        </el-command-list>
        <el-no-results hidden class="p-8 text-center">No results found.</el-no-results>
      </el-command-palette>
    </el-dialog-panel>
  </dialog>
</el-dialog>
```

## Layout System Integration

TailwindPlus components work seamlessly with NAVI's layout system:

```vue
<LayoutStack gap="md" class="glass-card p-6">
  <h2 class="text-xl font-bold text-glass-primary">Form Example</h2>
  
  <LayoutInline gap="sm" align="center">
    <el-autocomplete class="flex-1">
      <!-- Autocomplete setup -->
    </el-autocomplete>
    <el-select class="w-48">
      <!-- Select setup -->
    </el-select>
  </LayoutInline>
  
  <el-disclosure id="advanced-options" hidden>
    <LayoutGrid cols="2" gap="md">
      <!-- Advanced form fields -->
    </LayoutGrid>
  </el-disclosure>
</LayoutStack>
```

## Accessibility Features

All TailwindPlus components include:

- Full keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes
- High contrast mode support

## Dark Mode Support

Components automatically adapt to NAVI's dark theme:

```css
[data-theme='dark'] el-option:hover {
  @apply glass-bg-active;
}
```

## Custom Styling

Override component styles using CSS layers:

```css
@layer components {
  el-option[aria-selected='true'] {
    @apply bg-primary-100 text-primary-700;
  }
}
```

## Performance Considerations

- Components are tree-shakeable
- Lazy loading supported
- Minimal runtime overhead
- Works with SSR/SSG

## Browser Support

TailwindPlus Elements supports:

- Chrome 111+ (March 2023)
- Safari 16.4+ (March 2023)
- Firefox 128+ (July 2024)

Same as Tailwind CSS v4.0 requirements.

## Migration Notes

When migrating existing components:

1. Replace custom dropdowns with `<el-dropdown>`
2. Upgrade modals to `<el-dialog>`
3. Use `<el-tabs>` for tab interfaces
4. Implement command palette with `<el-command-palette>`

## Examples

See `/src/components/ui/TailwindPlusExamples.vue` and `/src/components/ui/EnhancedLayoutSystem.vue` for comprehensive usage examples.
