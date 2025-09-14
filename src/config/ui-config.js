
export const UI_CONFIG = {
  // Theme settings
  themes: {
    light: {
      name: "Light",
      icon: "weather-sunny",
      colors: {
      },
    },
    dark: {
      name: "Dark",
      icon: "weather-night",
      colors: {
      },
    },
    auto: {
      name: "System",
      icon: "theme-light-dark",
      colors: {}, // Will be determined by system preference
    },
  },

  breakpoints: {
  },

  spacing: {
  },

  // Typography scale
  typography: {
    display: {
    },
    headline: {
    },
    title: {
    },
    body: {
    },
    label: {
    },
  },

  // Component configurations
  components: {
    button: {
      sizes: {
        xs: {
        },
        sm: {
        },
        lg: {
        },
        xl: {
        },
      },
      variants: {
        primary: { bg: "primary", text: "on-primary" },
        secondary: { bg: "secondary", text: "on-secondary" },
        danger: { bg: "error", text: "on-error" },
        success: { bg: "success", text: "on-success" },
      },
    },

    card: {
      elevation: {
        none: "none",
      },
    },

    input: {
    },
  },

  // Animation settings
  animations: {
    duration: {
    },
    easing: {
    },
  },

  // Icon settings
  icons: {
    defaultLibrary: "mui", // 'mui' or 'bootstrap'
    sizes: {
    },
  },

  // Layout settings
  layout: {
    maxWidth: {
    },
    sidebar: {
    },
  },
};

export const getThemeConfig = (theme) =>
  UI_CONFIG.themes[theme] || UI_CONFIG.themes.light;
export const getBreakpoint = (size) =>
  UI_CONFIG.breakpoints[size] || UI_CONFIG.breakpoints.mobile;
export const getSpacing = (size) =>
  UI_CONFIG.spacing[size] || UI_CONFIG.spacing.md;
export const getTypography = (category, size) =>
  UI_CONFIG.typography[category]?.[size] || UI_CONFIG.typography.body.medium;
export const getComponentConfig = (component, variant) =>
  UI_CONFIG.components[component]?.[variant] || {};
export const getAnimation = (type, name) =>
  UI_CONFIG.animations[type]?.[name] || {};
export const getIconSize = (size) =>
  UI_CONFIG.icons.sizes[size] || UI_CONFIG.icons.sizes.sm;
export const getLayoutMaxWidth = (width) =>
  UI_CONFIG.layout.maxWidth[width] || UI_CONFIG.layout.maxWidth.default;

// Export default configuration
export default UI_CONFIG;
