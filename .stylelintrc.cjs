module.exports = {
  extends: [
    'stylelint-config-standard',
  ],
  rules: {
    // Disallow raw hex colors in styles; enforce design tokens
    'declaration-property-value-disallowed-list': {
      '/.*/': [/#(?:[0-9a-fA-F]{3,8})\b/],
    },
    // Encourage using variables for colors
    'color-named': 'never',
    // Enforce kebab-case class names (standardized)
    'selector-class-pattern': [
      '^[a-z][a-z0-9\-]*$',
      {
        message: 'Expected class selector to be kebab-case (e.g., .glass-card, .section-header)'
      }
    ],
    // Enforce kebab-case for custom properties (CSS variables)
    'custom-property-pattern': [
      '^--[a-z][a-z0-9\-]*$',
      {
        message: 'Expected custom property to be kebab-case (e.g., --color-primary-500)'
      }
    ],
  },
  ignoreFiles: [
    'dist/**',
    'dist-electron/**',
    'node_modules/**',
    // Allow export HTML/CSS templates to use fixed colors
    'src/modules/api/**',
    'src/utils/export.js',
  ],
}
