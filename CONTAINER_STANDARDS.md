# Container Width Standards - NAVI Design System

## 📐 **Master Container System**

All pages should use consistent container widths from the master design system located in `/src/styles/master-theme.css`.

## 🎯 **Standard Container Variables**

### **Page-Level Containers**

```css
--page-content-max-width: 1200px; /* Standard content width */
--page-container-max-width: 1400px; /* Extended container width */
--page-full-width: 1920px; /* Ultra-wide displays */
--page-narrow-width: 720px; /* Reading-optimized width */
--page-sidebar-width: 280px; /* Sidebar components */
```

### **Responsive Breakpoints**

```css
--breakpoint-xs: 480px; /* Mobile landscape */
--breakpoint-sm: 640px; /* Small tablet */
--breakpoint-md: 768px; /* Tablet */
--breakpoint-lg: 1024px; /* Desktop */
--breakpoint-xl: 1280px; /* Large desktop */
--breakpoint-2xl: 1536px; /* Ultra-wide */
```

### **Grid Standards**

```css
--grid-card-min-xs: 260px; /* Minimum card width - mobile */
--grid-card-min-sm: 280px; /* Minimum card width - small */
--grid-card-min-md: 320px; /* Minimum card width - medium */
--grid-card-min-lg: 400px; /* Minimum card width - large */
```

## 🏗️ **Recommended Container Classes**

### **Use These Classes Instead of Custom Styles**

```css
/* Main page containers */
.container-page          /* Standard page container */
.unified-container       /* Unified container with consistent padding */
.main-content           /* Main content rail */

/* Specialized containers */
.container-narrow       /* Reading-optimized content */
.container-wide         /* Extended width content */
.container-full         /* Full-width sections */
.ultra-wide-content     /* Ultra-wide with safe margins */
```

## ✅ **Correct Implementation Examples**

### **Dashboard Pattern (Recommended)**

```vue
<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <section class="unified-container mt-4">
      <!-- Content here -->
    </section>
  </StandardPageLayout>
</template>

<style scoped>
.dashboard-content {
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
}
</style>
```

### **Custom Container Pattern**

```vue
<template>
  <div class="custom-page">
    <div class="container">
      <!-- Content here -->
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
}
</style>
```

## ❌ **Avoid These Patterns**

### **DON'T: Hardcode Container Widths**

```css
/* BAD - Hardcoded values */
.container {
  max-width: 1400px; /* ❌ Use var(--page-container-max-width) */
  padding: 2rem; /* ❌ Use var(--spacing-lg) */
}

/* BAD - Hardcoded breakpoints */
@media (max-width: 768px) {
  /* ❌ Use design system breakpoints */
  /* styles */
}
```

### **DON'T: Inconsistent Spacing**

```css
/* BAD - Mixed spacing systems */
.container {
  padding: 32px; /* ❌ Use var(--spacing-xl) */
  margin: 1.5rem; /* ❌ Use design system spacing */
}
```

## 🔧 **Migration Checklist**

### **For Each Page Component:**

- [ ] Replace hardcoded `max-width` values with design system variables
- [ ] Replace hardcoded `padding` with spacing variables
- [ ] Update responsive breakpoints to use system variables
- [ ] Use `StandardPageLayout` when possible
- [ ] Add `.unified-container` for consistent padding

### **Search & Replace Patterns:**

```bash
# Find hardcoded max-widths
grep -r "max-width: [0-9]" src/views/

# Find hardcoded breakpoints
grep -r "@media.*[0-9]px" src/views/

# Find hardcoded padding
grep -r "padding: [0-9]" src/views/
```

## 🎨 **Design System Integration**

### **Theme-Aware Containers**

All containers automatically adapt to:

- **Light/Dark themes** via CSS custom properties
- **Density modes** (compact, normal, comfortable)
- **Responsive breakpoints** with mobile-first approach
- **Gaming/Professional themes** with appropriate styling

### **Accessibility Considerations**

- **Minimum touch targets**: 44px (var(--btn-min-h))
- **Reading width**: 65ch max for text content
- **Safe margins**: Always maintain minimum padding for touch devices
- **Focus indicators**: Consistent across all breakpoints

## 📱 **Mobile-First Responsive Strategy**

### **Progressive Enhancement**

1. **Base (Mobile)**: 320px+
2. **Small**: 480px+ (Large mobile)
3. **Medium**: 640px+ (Tablet)
4. **Large**: 768px+ (Desktop)
5. **Extra Large**: 1024px+ (Large desktop)
6. **Ultra Wide**: 1280px+ (Ultra-wide displays)

### **Container Behavior**

- **Mobile**: Full width with safe padding
- **Tablet**: Centered with responsive padding
- **Desktop**: Max-width container, centered
- **Ultra-wide**: Respects max-width, doesn't stretch infinitely

## 🚀 **Implementation Status**

### **✅ Updated Pages:**

- `Dashboard.vue` - Using design system variables
- `RealTimeDemo.vue` - Standardized container widths
- `GamingInterview.vue` - Consistent responsive system
- `Jobs.vue` - Already using StandardPageLayout

### **🔄 Needs Update:**

Run the following command to find pages that need updating:

```bash
grep -r "max-width: [0-9]" src/views/ --include="*.vue"
```

## 💡 **Best Practices**

1. **Always use `StandardPageLayout`** when possible
2. **Prefer utility classes** over custom container CSS
3. **Use design system variables** for all spacing and widths
4. **Test on mobile devices** to ensure touch-friendly interfaces
5. **Maintain semantic HTML structure** with proper landmarks
6. **Consider content hierarchy** when choosing container widths

This standardization ensures consistent user experience across all pages while maintaining flexibility for specialized layouts.
