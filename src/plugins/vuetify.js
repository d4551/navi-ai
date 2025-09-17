import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ALIASES as MDI_ALIASES } from '@/utils/iconAliases'

const materialDesignColors = {
  // Primary colors from our MD system
  // Stronger brand primary (vivid blue) for better contrast and presence
  primary: '#2563eb',
  'primary-darken-1': '#1e40af',
  'primary-darken-2': '#172554',
  'primary-lighten-1': '#3b82f6',
  'primary-lighten-2': '#60a5fa',
  'primary-container': '#dbeafe',
  'on-primary': '#ffffff',
  'on-primary-container': '#0b3a66',

  // Secondary colors
  secondary: '#607d8b',
  'secondary-darken-1': '#455a64',
  'secondary-darken-2': '#37474f',
  'secondary-lighten-1': '#78909c',
  'secondary-lighten-2': '#90a4ae',
  'secondary-container': '#cfd8dc',
  'on-secondary': '#ffffff',
  'on-secondary-container': '#263238',

  // Tertiary/accent colors
  tertiary: '#ff9800',
  'tertiary-darken-1': '#f57c00',
  'tertiary-darken-2': '#e65100',
  'tertiary-lighten-1': '#ffb74d',
  'tertiary-lighten-2': '#ffcc02',
  'tertiary-container': '#fff3e0',
  'on-tertiary': '#ffffff',
  'on-tertiary-container': '#e65100',

  // Semantic colors
  success: '#4caf50',
  'success-darken-1': '#388e3c',
  'success-lighten-1': '#66bb6a',
  'on-success': '#ffffff',

  warning: '#ff9800',
  'warning-darken-1': '#f57c00',
  'warning-lighten-1': '#ffb74d',
  'on-warning': '#ffffff',

  error: '#f44336',
  'error-darken-1': '#d32f2f',
  'error-lighten-1': '#ef5350',
  'on-error': '#ffffff',

  info: '#2196f3',
  'info-darken-1': '#1976d2',
  'info-lighten-1': '#42a5f5',
  'on-info': '#ffffff',

  // Surface colors
  surface: '#ffffff',
  'surface-variant': '#f5f5f5',
  'surface-container': '#fafafa',
  'surface-container-low': '#fcfcfc',
  'surface-container-high': '#f0f0f0',
  'on-surface': '#212121',
  'on-surface-variant': '#757575',

  background: '#ffffff',
  'on-background': '#212121',

  // Outline colors
  outline: '#e0e0e0',
  'outline-variant': '#eeeeee',
}

// Dark theme colors
const darkMaterialDesignColors = {
  ...materialDesignColors,
  // Dark-theme adjustments for the vivid blue primary
  primary: '#60a5fa',
  'primary-container': '#1e3a8a',
  'on-primary': '#000000',
  'on-primary-container': '#dbeafe',

  secondary: '#90a4ae',
  'secondary-container': '#37474f',
  'on-secondary': '#000000',
  'on-secondary-container': '#cfd8dc',

  tertiary: '#ffb74d',
  'tertiary-container': '#f57c00',
  'on-tertiary': '#000000',
  'on-tertiary-container': '#fff3e0',

  surface: '#121212',
  'surface-variant': '#1e1e1e',
  'surface-container': '#1f1f1f',
  'surface-container-low': '#1a1a1a',
  'surface-container-high': '#272727',
  'on-surface': '#ffffff',
  'on-surface-variant': '#bdbdbd',

  background: '#121212',
  'on-background': '#ffffff',

  outline: '#404040',
  'outline-variant': '#2a2a2a',
}

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',

    // Works for <v-icon>, component props like prepend-icon, and any Vuetify icon usage
    aliases: Object.fromEntries(
      Object.entries(MDI_ALIASES).map(([legacy, modern]) => [
        legacy.replace(/^mdi-/, 'mdi-'),
        modern,
      ])
    ),
    // Custom resolver as a final guard: if an alias exists, return it

    // ensures icon name normalization in most usages. We also keep runtime aliasing for raw <i.mdi>.
  },
  defaults: {
    // Apply Material Design defaults to components
    VBtn: {
      style: 'elevated',
      rounded: 'lg',
    },
    VCard: {
      elevation: 1,
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      rounded: 'sm',
    },
    VSelect: {
      variant: 'outlined',
      rounded: 'sm',
    },
    VTextarea: {
      variant: 'outlined',
      rounded: 'sm',
    },
    VCheckbox: {
      color: 'primary',
      rounded: 'sm',
    },
    VRadio: {
      color: 'primary',
    },
    VSwitch: {
      color: 'primary',
      inset: true,
    },
    VChip: {
      rounded: 'pill',
    },
    VDialog: {
      rounded: 'xl',
    },
    VSheet: {
      rounded: 'lg',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: materialDesignColors,
      },
      dark: {
        dark: true,
        colors: darkMaterialDesignColors,
      },
    },
    variations: {
      colors: ['primary', 'secondary', 'tertiary', 'surface'],
      lighten: 4,
      darken: 4,
    },
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

export default vuetify
