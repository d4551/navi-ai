import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    sidebarExpanded: true,
    notifications: true,
    layoutSize: 'lg',
  }),

  getters: {
    isDarkTheme: state => state.theme === 'dark',

    currentLayoutSize: state => state.layoutSize,

    // Get current container max width based on layout size
    containerMaxWidth: state => {
      const sizes = {
        sm: 'var(--container-sm)',
        md: 'var(--container-md)',
        lg: 'var(--container-lg)',
        xl: 'var(--container-xl)',
      }
      return sizes[state.layoutSize] || sizes.lg
    },
  },

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'

      // Apply theme class to document
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },

    toggleSidebar() {
      this.sidebarExpanded = !this.sidebarExpanded
    },

    setLayoutSize(size) {
      if (['sm', 'md', 'lg', 'xl'].includes(size)) {
        this.layoutSize = size
      }
    },
  },

  // Enable persistence of settings
  persist: true,
})
