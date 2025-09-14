
import {
  DESIGN_TOKENS as _DESIGN_TOKENS,
  GAMING_COLORS as _GAMING_COLORS,
} from "@/shared/composables/useUnifiedTheme";

// Style mapping configurations
const STYLE_MAPPINGS = {
  // Color mappings from legacy to design system
  colors: {
    // Primary colors

    // Secondary colors

    // Semantic colors

    // Grays

    // Background/surface
    white: "var(--color-background)",
  },

  // Spacing mappings
  spacing: {

  },

  // Font size mappings
  fontSize: {

  },

  // Border radius mappings
  borderRadius: {

  },

  // Font family mappings
  fontFamily: {
    Inter: "var(--font-family-primary)",
    Electrolize: "var(--font-family-primary)",
    "system-ui": "var(--font-family-ui)",
    monospace: "var(--font-family-mono)",
    Orbitron: "var(--font-family-gaming)",
  },
};

// Component style templates using design system
const COMPONENT_TEMPLATES = {
  // Card component
  card: {
    base: `
      border-radius: var(--border-radius-lg);
      transition: var(--transition-normal);
    `,
    hover: `
      box-shadow: var(--shadow-lg);
    `,
  },

  // Button component
  button: {
    primary: `
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
      color: var(--color-on-surface);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-family: var(--font-family-primary);
      transition: var(--transition-fast);
    `,
  },

  // Input component
  input: {
    base: `
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--color-on-surface);
      font-family: var(--font-family-primary);
      font-size: var(--font-size-sm);
      transition: var(--transition-fast);
    `,
    focus: `
      outline: none;
    `,
  },

  // Modal component
  modal: {
    backdrop: `
      position: fixed;
    `,
    content: `
      background: var(--color-surface);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-xl);
      overflow: auto;
    `,
  },

  // Navigation component
  nav: {
    base: `
    `,
    item: `
      color: var(--color-on-surface);
      text-decoration: none;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-md);
      transition: var(--transition-fast);
    `,
    itemActive: `
    `,
  },
};

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
    };

    this.backupData = new Map();
    this.migrationReport = {
      warnings: [],
      errors: [],
    };
  }

    const config = { ...this.options, ...options };
    const elements = document.querySelectorAll(selector);


    if (config.dryRun) {
      console.log("[SEARCH] DRY RUN MODE - No changes will be applied");
    }

    for (const element of elements) {
      try {
        await this.migrateElement(element, config);
        this.migrationReport.elementsProcessed++;
      } catch (_error) {
        this.migrationReport.errors.push({
          element: element.tagName,
          error: error.message,
        });
      }
    }

    if (config.generateReport) {
      this.printMigrationReport();
    }

    return this.migrationReport;
  }

  // Migrate a single element
  async migrateElement(element, config) {
    const _computedStyle = getComputedStyle(element);
    const elementId =
      element.id ||

    // Backup original styles if requested
    if (config.backupStyles) {
      this.backupElementStyles(element, elementId);
    }

    // Process inline styles
      this.migrateInlineStyles(element, config);
    }

    // Process CSS classes
    this.migrateCSSClasses(element, config);

    // Apply component template if detected
    this.applyComponentTemplate(element, config);
  }

  // Migrate inline styles
  migrateInlineStyles(element, config) {
    const style = element.style;
    const newStyles = {};
    let hasChanges = false;

    // Migrate colors
    for (const property of ["color", "backgroundColor", "borderColor"]) {
      const value = style.getPropertyValue(property);
      if (value && STYLE_MAPPINGS.colors[value]) {
        newStyles[property] = STYLE_MAPPINGS.colors[value];
        hasChanges = true;
        this.migrationReport.stylesConverted++;
      }
    }

    // Migrate spacing
    for (const property of [
      "margin",
      "padding",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
    ]) {
      const value = style.getPropertyValue(property);
      if (value && STYLE_MAPPINGS.spacing[value]) {
        newStyles[property] = STYLE_MAPPINGS.spacing[value];
        hasChanges = true;
        this.migrationReport.stylesConverted++;
      }
    }

    // Migrate font sizes
    const fontSize = style.getPropertyValue("font-size");
    if (fontSize && STYLE_MAPPINGS.fontSize[fontSize]) {
      newStyles.fontSize = STYLE_MAPPINGS.fontSize[fontSize];
      hasChanges = true;
      this.migrationReport.stylesConverted++;
    }

    // Migrate border radius
    const borderRadius = style.getPropertyValue("border-radius");
    if (borderRadius && STYLE_MAPPINGS.borderRadius[borderRadius]) {
      newStyles.borderRadius = STYLE_MAPPINGS.borderRadius[borderRadius];
      hasChanges = true;
      this.migrationReport.stylesConverted++;
    }

    // Migrate font family
    const fontFamily = style.getPropertyValue("font-family");
    if (fontFamily) {
      for (const [legacy, modern] of Object.entries(
        STYLE_MAPPINGS.fontFamily,
      )) {
        if (fontFamily.includes(legacy)) {
          newStyles.fontFamily = modern;
          hasChanges = true;
          this.migrationReport.stylesConverted++;
          break;
        }
      }
    }

    // Apply changes if not in dry run mode
    if (hasChanges && !config.dryRun) {
      Object.entries(newStyles).forEach(([property, value]) => {
        element.style.setProperty(this.camelToKebab(property), value);
      });
    }
  }

  // Migrate CSS classes
  migrateCSSClasses(element, config) {
    const classList = element.classList;
    const newClasses = [];

    // Add design system classes based on element type and existing classes
    if (element.tagName === "BUTTON" || classList.contains("btn")) {
      newClasses.push("ds-button");
      if (classList.contains("primary") || classList.contains("btn-primary")) {
        newClasses.push("ds-button--primary");
      } else if (
        classList.contains("secondary") ||
        classList.contains("btn-secondary")
      ) {
        newClasses.push("ds-button--secondary");
      }
    }

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      newClasses.push("ds-input");
    }

    if (classList.contains("card") || classList.contains("panel")) {
      newClasses.push("ds-card");
    }

    if (classList.contains("modal")) {
      newClasses.push("ds-modal");
    }

    // Apply new classes if not in dry run mode
      element.classList.add(...newClasses);
    }
  }

  // Apply component templates
  applyComponentTemplate(element, config) {
    const classList = element.classList;

    // Apply card template
    if (classList.contains("ds-card") || classList.contains("card")) {
      this.applyTemplate(element, COMPONENT_TEMPLATES.card.base, config);
    }

    // Apply button template
    if (classList.contains("ds-button") || element.tagName === "BUTTON") {
      if (
        classList.contains("ds-button--primary") ||
        classList.contains("primary")
      ) {
        this.applyTemplate(element, COMPONENT_TEMPLATES.button.primary, config);
      } else {
        this.applyTemplate(
          element,
          COMPONENT_TEMPLATES.button.secondary,
          config,
        );
      }
    }

    // Apply input template
    if (
      classList.contains("ds-input") ||
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA"
    ) {
      this.applyTemplate(element, COMPONENT_TEMPLATES.input.base, config);
    }
  }

  // Apply CSS template to element
  applyTemplate(element, template, config) {
    if (config.dryRun) return;

    const styles = this.parseStyleTemplate(template);
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  // Parse style template string into object
  parseStyleTemplate(template) {
    const styles = {};
    const rules = template.split(";").filter((rule) => rule.trim());

    rules.forEach((rule) => {
      const [property, value] = rule.split(":").map((s) => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    });

    return styles;
  }

  // Backup element styles
  backupElementStyles(element, elementId) {
    const backup = {
      inline: element.getAttribute("style") || "",
      classes: Array.from(element.classList),
      computed: {},
    };

    // Backup key computed styles
    const computedStyle = getComputedStyle(element);
    const keyProperties = [
      "color",
      "backgroundColor",
      "fontSize",
      "fontFamily",
      "padding",
      "margin",
      "borderRadius",
      "border",
      "boxShadow",
      "transform",
      "transition",
    ];

    keyProperties.forEach((prop) => {
      backup.computed[prop] = computedStyle.getPropertyValue(prop);
    });

    this.backupData.set(elementId, backup);
  }

  // Rollback changes for an element
  rollbackElement(elementId) {
    const element = document.getElementById(elementId);
    const backup = this.backupData.get(elementId);

    if (!element || !backup) {
      console.warn(
        `Cannot rollback element ${elementId} - element or backup not found`,
      );
      return false;
    }

    // Restore inline styles
    element.setAttribute("style", backup.inline);

    // Restore classes
    element.className = backup.classes.join(" ");

    return true;
  }

  // Rollback all changes
  rollbackAll() {

    for (const elementId of this.backupData.keys()) {
      if (this.rollbackElement(elementId)) {
        rolledBack++;
      }
    }

    return rolledBack;
  }

  // Generate and inject design system CSS
  injectDesignSystemCSS() {
    const styleId = "ds-migration-styles";

    // Remove existing styles
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const css = `
      .ds-button {
        ${COMPONENT_TEMPLATES.button.secondary}
      }
      
      .ds-button--primary {
        ${COMPONENT_TEMPLATES.button.primary}
      }
      
      .ds-button:hover {
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
    `;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);

  }

  // Print migration report
  printMigrationReport() {
    console.log("\n[STATS] CSS Migration Report");
    console.log("========================");
    console.log(
      `Elements processed: ${this.migrationReport.elementsProcessed}`,
    );
    console.log(`Styles converted: ${this.migrationReport.stylesConverted}`);
    console.log(`Warnings: ${this.migrationReport.warnings.length}`);
    console.log(`Errors: ${this.migrationReport.errors.length}`);

      console.log("\n[WARNING] Warnings:");
      this.migrationReport.warnings.forEach((warning, i) => {
      });
    }

      this.migrationReport.errors.forEach((_error, i) => {
      });
    }

  }

  camelToKebab(str) {
  }
}

export const quickMigrations = {
  // Migrate all buttons
  migrateButtons: async (options = {}) => {
    const tool = new CSSMigrationTool(_options);
    return await tool.migrateStyles('button, .btn, [role="button"]');
  },

  // Migrate all cards
  migrateCards: async (options = {}) => {
    const tool = new CSSMigrationTool(_options);
    return await tool.migrateStyles(".card, .panel, .box");
  },

  // Migrate all inputs
  migrateInputs: async (options = {}) => {
    const tool = new CSSMigrationTool(_options);
    return await tool.migrateStyles("input, textarea, select");
  },

  // Migrate entire page
  migratePage: async (options = {}) => {
    const tool = new CSSMigrationTool(_options);
    tool.injectDesignSystemCSS();
  },

  // Migrate specific component
  migrateComponent: async (selector, options = {}) => {
    const tool = new CSSMigrationTool(_options);
    return await tool.migrateStyles(selector);
  },
};

// Browser console helpers
if (typeof window !== "undefined") {
  window.CSSMigrationTool = CSSMigrationTool;
  window.quickMigrations = quickMigrations;

  window.migrateStyles = quickMigrations.migratePage;
    return quickMigrations.migrateComponent(selector, { dryRun: true });
  };
}

export default CSSMigrationTool;
