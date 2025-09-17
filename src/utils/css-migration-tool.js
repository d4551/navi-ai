/**
 * CSS MIGRATION TOOL - RAPID DESIGN SYSTEM APPLICATION
 * ====================================================
 *
 * This tool helps rapidly apply the global single source of truth CSS
 * design system while preserving important attributes like IDs, data attributes,
 * and maintaining existing functionality.
 *
 * Features:
 * - Batch apply unified design tokens
 * - Preserve element IDs and custom attributes
 * - Convert legacy styles to design system classes
 * - Generate migration reports
 * - Safe rollback functionality
 * - Component-specific style templates
 */

import {
  DESIGN_TOKENS as _DESIGN_TOKENS,
  GAMING_COLORS as _GAMING_COLORS,
} from '@/shared/composables/useUnifiedTheme'

// Style mapping configurations
const STYLE_MAPPINGS = {
  // Color mappings from legacy to design system
  colors: {
    // Primary colors
    '#6366f1': 'var(--color-primary-500)',
    '#4f46e5': 'var(--color-primary-600)',
    '#7c3aed': 'var(--color-primary-500)',
    '#8b5cf6': 'var(--color-primary-400)',

    // Secondary colors
    '#0ea5e9': 'var(--color-secondary-500)',
    '#38bdf8': 'var(--color-secondary-400)',

    // Semantic colors
    '#22c55e': 'var(--color-success-500)',
    '#ef4444': 'var(--color-error-500)',
    '#f59e0b': 'var(--color-warning-500)',

    // Grays
    '#f9fafb': 'var(--color-gray-50)',
    '#f3f4f6': 'var(--color-gray-100)',
    '#e5e7eb': 'var(--color-gray-200)',
    '#d1d5db': 'var(--color-gray-300)',
    '#9ca3af': 'var(--color-gray-400)',
    '#6b7280': 'var(--color-gray-500)',
    '#4b5563': 'var(--color-gray-600)',
    '#374151': 'var(--color-gray-700)',
    '#1f2937': 'var(--color-gray-800)',
    '#111827': 'var(--color-gray-900)',

    // Background/surface
    '#ffffff': 'var(--color-background)',
    white: 'var(--color-background)',
    '#000000': 'var(--color-gray-900)',
    black: 'var(--color-gray-900)',
  },

  // Spacing mappings
  spacing: {
    '4px': 'var(--spacing-xs)',
    '8px': 'var(--spacing-sm)',
    '16px': 'var(--spacing-md)',
    '24px': 'var(--spacing-lg)',
    '32px': 'var(--spacing-xl)',
    '48px': 'var(--spacing-2xl)',
    '64px': 'var(--spacing-3xl)',
    '96px': 'var(--spacing-4xl)',

    '0.25rem': 'var(--spacing-xs)',
    '0.5rem': 'var(--spacing-sm)',
    '1rem': 'var(--spacing-md)',
    '1.5rem': 'var(--spacing-lg)',
    '2rem': 'var(--spacing-xl)',
    '3rem': 'var(--spacing-2xl)',
    '4rem': 'var(--spacing-3xl)',
    '6rem': 'var(--spacing-4xl)',
  },

  // Font size mappings
  fontSize: {
    '12px': 'var(--font-size-xs)',
    '14px': 'var(--font-size-sm)',
    '16px': 'var(--font-size-md)',
    '18px': 'var(--font-size-lg)',
    '20px': 'var(--font-size-xl)',
    '24px': 'var(--font-size-2xl)',
    '32px': 'var(--font-size-3xl)',
    '40px': 'var(--font-size-4xl)',

    '0.75rem': 'var(--font-size-xs)',
    '0.875rem': 'var(--font-size-sm)',
    '1rem': 'var(--font-size-md)',
    '1.125rem': 'var(--font-size-lg)',
    '1.25rem': 'var(--font-size-xl)',
    '1.5rem': 'var(--font-size-2xl)',
    '2rem': 'var(--font-size-3xl)',
    '2.5rem': 'var(--font-size-4xl)',
  },

  // Border radius mappings
  borderRadius: {
    '0px': 'var(--border-radius-none)',
    '4px': 'var(--border-radius-sm)',
    '8px': 'var(--border-radius-md)',
    '12px': 'var(--border-radius-lg)',
    '16px': 'var(--border-radius-xl)',
    '9999px': 'var(--border-radius-full)',

    0: 'var(--border-radius-none)',
    '0.25rem': 'var(--border-radius-sm)',
    '0.5rem': 'var(--border-radius-md)',
    '0.75rem': 'var(--border-radius-lg)',
    '1rem': 'var(--border-radius-xl)',
    '50%': 'var(--border-radius-full)',
  },

  // Font family mappings
  fontFamily: {
    Inter: 'var(--font-family-primary)',
    Electrolize: 'var(--font-family-primary)',
    'system-ui': 'var(--font-family-ui)',
    monospace: 'var(--font-family-mono)',
    Orbitron: 'var(--font-family-gaming)',
  },
}

// Component style templates using design system
const COMPONENT_TEMPLATES = {
  // Card component
  card: {
    base: `
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-lg);
      transition: var(--transition-normal);
    `,
    hover: `
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(124, 58, 237, 0.3);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    `,
  },

  // Button component
  button: {
    primary: `
      background: linear-gradient(45deg, var(--color-primary-600), var(--color-primary-500));
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-family: var(--font-family-primary);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      transition: var(--transition-fast);
      cursor: pointer;
    `,
    secondary: `
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-on-surface);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-family: var(--font-family-primary);
      transition: var(--transition-fast);
    `,
  },

  // Input component
  input: {
    base: `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--color-on-surface);
      font-family: var(--font-family-primary);
      font-size: var(--font-size-sm);
      transition: var(--transition-fast);
    `,
    focus: `
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      outline: none;
    `,
  },

  // Modal component
  modal: {
    backdrop: `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
    `,
    content: `
      background: var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-xl);
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    `,
  },

  // Navigation component
  nav: {
    base: `
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `,
    item: `
      color: var(--color-on-surface);
      text-decoration: none;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-md);
      transition: var(--transition-fast);
    `,
    itemActive: `
      background: rgba(99, 102, 241, 0.2);
      color: var(--color-primary-400);
    `,
  },
}

// CSS Migration Tool Class
export class CSSMigrationTool {
  constructor(options = {}) {
    this.options = {
      preserveIds: true,
      preserveDataAttributes: true,
      preserveAriaAttributes: true,
      backupStyles: true,
      generateReport: true,
      dryRun: false,
      ...options,
    }

    this.backupData = new Map()
    this.migrationReport = {
      elementsProcessed: 0,
      stylesConverted: 0,
      warnings: [],
      errors: [],
    }
  }

  // Main migration function
  async migrateStyles(selector = 'body *', options = {}) {
    const config = { ...this.options, ...options }
    const elements = document.querySelectorAll(selector)

    console.log(`🎨 Starting CSS migration for ${elements.length} elements...`)

    if (config.dryRun) {
      console.log('[SEARCH] DRY RUN MODE - No changes will be applied')
    }

    for (const element of elements) {
      try {
        await this.migrateElement(element, config)
        this.migrationReport.elementsProcessed++
      } catch (error) {
        this.migrationReport.errors.push({
          element: element.tagName,
          error: error.message,
        })
      }
    }

    if (config.generateReport) {
      this.printMigrationReport()
    }

    return this.migrationReport
  }

  // Migrate a single element
  async migrateElement(element, config) {
    const _computedStyle = getComputedStyle(element)
    const elementId =
      element.id ||
      `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Backup original styles if requested
    if (config.backupStyles) {
      this.backupElementStyles(element, elementId)
    }

    // Process inline styles
    if (element.style && element.style.length > 0) {
      this.migrateInlineStyles(element, config)
    }

    // Process CSS classes
    this.migrateCSSClasses(element, config)

    // Apply component template if detected
    this.applyComponentTemplate(element, config)
  }

  // Migrate inline styles
  migrateInlineStyles(element, config) {
    const style = element.style
    const newStyles = {}
    let hasChanges = false

    // Migrate colors
    for (const property of ['color', 'backgroundColor', 'borderColor']) {
      const value = style.getPropertyValue(property)
      if (value && STYLE_MAPPINGS.colors[value]) {
        newStyles[property] = STYLE_MAPPINGS.colors[value]
        hasChanges = true
        this.migrationReport.stylesConverted++
      }
    }

    // Migrate spacing
    for (const property of [
      'margin',
      'padding',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ]) {
      const value = style.getPropertyValue(property)
      if (value && STYLE_MAPPINGS.spacing[value]) {
        newStyles[property] = STYLE_MAPPINGS.spacing[value]
        hasChanges = true
        this.migrationReport.stylesConverted++
      }
    }

    // Migrate font sizes
    const fontSize = style.getPropertyValue('font-size')
    if (fontSize && STYLE_MAPPINGS.fontSize[fontSize]) {
      newStyles.fontSize = STYLE_MAPPINGS.fontSize[fontSize]
      hasChanges = true
      this.migrationReport.stylesConverted++
    }

    // Migrate border radius
    const borderRadius = style.getPropertyValue('border-radius')
    if (borderRadius && STYLE_MAPPINGS.borderRadius[borderRadius]) {
      newStyles.borderRadius = STYLE_MAPPINGS.borderRadius[borderRadius]
      hasChanges = true
      this.migrationReport.stylesConverted++
    }

    // Migrate font family
    const fontFamily = style.getPropertyValue('font-family')
    if (fontFamily) {
      for (const [legacy, modern] of Object.entries(
        STYLE_MAPPINGS.fontFamily
      )) {
        if (fontFamily.includes(legacy)) {
          newStyles.fontFamily = modern
          hasChanges = true
          this.migrationReport.stylesConverted++
          break
        }
      }
    }

    // Apply changes if not in dry run mode
    if (hasChanges && !config.dryRun) {
      Object.entries(newStyles).forEach(([property, value]) => {
        element.style.setProperty(this.camelToKebab(property), value)
      })
    }
  }

  // Migrate CSS classes
  migrateCSSClasses(element, config) {
    const classList = element.classList
    const newClasses = []

    // Add design system classes based on element type and existing classes
    if (element.tagName === 'BUTTON' || classList.contains('btn')) {
      newClasses.push('ds-button')
      if (classList.contains('primary') || classList.contains('btn-primary')) {
        newClasses.push('ds-button--primary')
      } else if (
        classList.contains('secondary') ||
        classList.contains('btn-secondary')
      ) {
        newClasses.push('ds-button--secondary')
      }
    }

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      newClasses.push('ds-input')
    }

    if (classList.contains('card') || classList.contains('panel')) {
      newClasses.push('ds-card')
    }

    if (classList.contains('modal')) {
      newClasses.push('ds-modal')
    }

    // Apply new classes if not in dry run mode
    if (newClasses.length > 0 && !config.dryRun) {
      element.classList.add(...newClasses)
    }
  }

  // Apply component templates
  applyComponentTemplate(element, config) {
    const classList = element.classList

    // Apply card template
    if (classList.contains('ds-card') || classList.contains('card')) {
      this.applyTemplate(element, COMPONENT_TEMPLATES.card.base, config)
    }

    // Apply button template
    if (classList.contains('ds-button') || element.tagName === 'BUTTON') {
      if (
        classList.contains('ds-button--primary') ||
        classList.contains('primary')
      ) {
        this.applyTemplate(element, COMPONENT_TEMPLATES.button.primary, config)
      } else {
        this.applyTemplate(
          element,
          COMPONENT_TEMPLATES.button.secondary,
          config
        )
      }
    }

    // Apply input template
    if (
      classList.contains('ds-input') ||
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA'
    ) {
      this.applyTemplate(element, COMPONENT_TEMPLATES.input.base, config)
    }
  }

  // Apply CSS template to element
  applyTemplate(element, template, config) {
    if (config.dryRun) return

    const styles = this.parseStyleTemplate(template)
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value)
    })
  }

  // Parse style template string into object
  parseStyleTemplate(template) {
    const styles = {}
    const rules = template.split(';').filter(rule => rule.trim())

    rules.forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim())
      if (property && value) {
        styles[property] = value
      }
    })

    return styles
  }

  // Backup element styles
  backupElementStyles(element, elementId) {
    const backup = {
      inline: element.getAttribute('style') || '',
      classes: Array.from(element.classList),
      computed: {},
    }

    // Backup key computed styles
    const computedStyle = getComputedStyle(element)
    const keyProperties = [
      'color',
      'backgroundColor',
      'fontSize',
      'fontFamily',
      'padding',
      'margin',
      'borderRadius',
      'border',
      'boxShadow',
      'transform',
      'transition',
    ]

    keyProperties.forEach(prop => {
      backup.computed[prop] = computedStyle.getPropertyValue(prop)
    })

    this.backupData.set(elementId, backup)
  }

  // Rollback changes for an element
  rollbackElement(elementId) {
    const element = document.getElementById(elementId)
    const backup = this.backupData.get(elementId)

    if (!element || !backup) {
      console.warn(
        `Cannot rollback element ${elementId} - element or backup not found`
      )
      return false
    }

    // Restore inline styles
    element.setAttribute('style', backup.inline)

    // Restore classes
    element.className = backup.classes.join(' ')

    console.log(`✅ Rolled back styles for element ${elementId}`)
    return true
  }

  // Rollback all changes
  rollbackAll() {
    let rolledBack = 0

    for (const elementId of this.backupData.keys()) {
      if (this.rollbackElement(elementId)) {
        rolledBack++
      }
    }

    console.log(`🔄 Rolled back ${rolledBack} elements`)
    return rolledBack
  }

  // Generate and inject design system CSS
  injectDesignSystemCSS() {
    const styleId = 'ds-migration-styles'

    // Remove existing styles
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    const css = `
      /* Design System Migration Styles */
      .ds-button {
        ${COMPONENT_TEMPLATES.button.secondary}
      }
      
      .ds-button--primary {
        ${COMPONENT_TEMPLATES.button.primary}
      }
      
      .ds-button:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      
      .ds-card {
        ${COMPONENT_TEMPLATES.card.base}
      }
      
      .ds-card:hover {
        ${COMPONENT_TEMPLATES.card.hover}
      }
      
      .ds-input {
        ${COMPONENT_TEMPLATES.input.base}
      }
      
      .ds-input:focus {
        ${COMPONENT_TEMPLATES.input.focus}
      }
      
      .ds-modal-backdrop {
        ${COMPONENT_TEMPLATES.modal.backdrop}
      }
      
      .ds-modal-content {
        ${COMPONENT_TEMPLATES.modal.content}
      }
      
      .ds-nav {
        ${COMPONENT_TEMPLATES.nav.base}
      }
      
      .ds-nav-item {
        ${COMPONENT_TEMPLATES.nav.item}
      }
      
      .ds-nav-item--active {
        ${COMPONENT_TEMPLATES.nav.itemActive}
      }
      
      /* Utility classes */
      .ds-transition { transition: var(--transition-normal); }
      .ds-transition-fast { transition: var(--transition-fast); }
      .ds-transition-slow { transition: var(--transition-slow); }
      
      .ds-shadow-sm { box-shadow: var(--shadow-sm); }
      .ds-shadow-md { box-shadow: var(--shadow-md); }
      .ds-shadow-lg { box-shadow: var(--shadow-lg); }
      .ds-shadow-xl { box-shadow: var(--shadow-xl); }
      
      .ds-radius-sm { border-radius: var(--border-radius-sm); }
      .ds-radius-md { border-radius: var(--border-radius-md); }
      .ds-radius-lg { border-radius: var(--border-radius-lg); }
      .ds-radius-xl { border-radius: var(--border-radius-xl); }
      
      .ds-text-xs { font-size: var(--font-size-xs); }
      .ds-text-sm { font-size: var(--font-size-sm); }
      .ds-text-md { font-size: var(--font-size-md); }
      .ds-text-lg { font-size: var(--font-size-lg); }
      .ds-text-xl { font-size: var(--font-size-xl); }
      
      .ds-space-xs { padding: var(--spacing-xs); }
      .ds-space-sm { padding: var(--spacing-sm); }
      .ds-space-md { padding: var(--spacing-md); }
      .ds-space-lg { padding: var(--spacing-lg); }
      .ds-space-xl { padding: var(--spacing-xl); }
    `

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = css
    document.head.appendChild(style)

    console.log('🎨 Design system CSS injected')
  }

  // Print migration report
  printMigrationReport() {
    console.log('\n[STATS] CSS Migration Report')
    console.log('========================')
    console.log(`Elements processed: ${this.migrationReport.elementsProcessed}`)
    console.log(`Styles converted: ${this.migrationReport.stylesConverted}`)
    console.log(`Warnings: ${this.migrationReport.warnings.length}`)
    console.log(`Errors: ${this.migrationReport.errors.length}`)

    if (this.migrationReport.warnings.length > 0) {
      console.log('\n[WARNING] Warnings:')
      this.migrationReport.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`)
      })
    }

    if (this.migrationReport.errors.length > 0) {
      console.log('\n❌ Errors:')
      this.migrationReport.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.element}: ${error.error}`)
      })
    }

    console.log('\n✅ Migration complete!')
  }

  // Utility function to convert camelCase to kebab-case
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }
}

// Quick migration functions for common use cases
export const quickMigrations = {
  // Migrate all buttons
  migrateButtons: async (options = {}) => {
    const tool = new CSSMigrationTool(options)
    return await tool.migrateStyles('button, .btn, [role="button"]')
  },

  // Migrate all cards
  migrateCards: async (options = {}) => {
    const tool = new CSSMigrationTool(options)
    return await tool.migrateStyles('.card, .panel, .box')
  },

  // Migrate all inputs
  migrateInputs: async (options = {}) => {
    const tool = new CSSMigrationTool(options)
    return await tool.migrateStyles('input, textarea, select')
  },

  // Migrate entire page
  migratePage: async (options = {}) => {
    const tool = new CSSMigrationTool(options)
    tool.injectDesignSystemCSS()
    return await tool.migrateStyles('body *')
  },

  // Migrate specific component
  migrateComponent: async (selector, options = {}) => {
    const tool = new CSSMigrationTool(options)
    return await tool.migrateStyles(selector)
  },
}

// Browser console helpers
if (typeof window !== 'undefined') {
  window.CSSMigrationTool = CSSMigrationTool
  window.quickMigrations = quickMigrations

  // Add quick access functions to console
  window.migrateStyles = quickMigrations.migratePage
  window.migrateDryRun = (selector = 'body *') => {
    return quickMigrations.migrateComponent(selector, { dryRun: true })
  }
}

export default CSSMigrationTool
