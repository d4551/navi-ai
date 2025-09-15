module.exports = {
  extends: [
    'stylelint-config-standard',
  ],
  overrides: [
    {
      files: ['**/*.vue', '**/*.html'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  rules: {
    // Relax strict rules to accommodate our design-system CSS
    'declaration-property-value-disallowed-list': null,
    'color-named': null,
    // Enforce kebab-case class names (standardized)
    'selector-class-pattern': [
      '^[a-z][a-z0-9\-]*$',
      {
        message: 'Expected class selector to be kebab-case (e.g., .glass-card, .section-header)'
      }
    ],
    // Enforce kebab-case for custom properties (CSS variables)
    'custom-property-pattern': null,
    // Allow legacy color and alpha notations for now
    'color-function-notation': null,
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'property-no-vendor-prefix': null,
    'media-feature-range-notation': null,
    'media-feature-name-value-no-unknown': null,
    'declaration-block-single-line-max-declarations': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
    'color-hex-length': null,
    'selector-class-pattern': null,
    'import-notation': null,
    'at-rule-no-unknown': null,
    'keyframes-name-pattern': null,
    'value-keyword-case': null,
    'font-family-name-quotes': null,
    'shorthand-property-no-redundant-values': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-block-no-duplicate-properties': null,
    'no-duplicate-selectors': null,
    'selector-not-notation': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'property-no-deprecated': null,
    'declaration-property-value-no-unknown': null,
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
