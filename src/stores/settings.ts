import { defineStore } from 'pinia'
import { logger } from '@/shared/utils/logger'
import { setVoiceRoutingPreferences } from '@/utils/voice'
import { unifiedStorage } from '@/utils/storage'
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  Settings,
} from '@/shared/schemas/settingsSchema'

export interface SettingsState {
  settings: Settings
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: { ...DEFAULT_SETTINGS },
  }),

  getters: {
    isConfigured: (state): boolean => {
      return !!state.settings.geminiApiKey
    },

    portfolioPreferences: state => ({
      sort: state.settings.portfolioSort,
      filter: state.settings.portfolioFilter,
    }),
  },

  actions: {
    // Enhanced update settings with safe, permissive validation
    updateSettings(settings: Partial<Settings>): boolean {
      try {
        if (
          settings.geminiApiKey !== undefined &&
          typeof settings.geminiApiKey === 'string'
        ) {
          settings.geminiApiKey = settings.geminiApiKey.trim()
        }

        this.settings = mergeSettings(this.settings, settings)

        // Sync theme changes with unified theme system
        if (settings.theme !== undefined) {
          try {
            // Import and sync with unified theme composable
            import('@/shared/composables/useUnifiedTheme')
              .then(({ default: useUnifiedTheme }) => {
                const theme = useUnifiedTheme()
                theme.syncFromStore(settings.theme as any)
              })
              .catch(() => {
                // Silently ignore if theme composable is not available
              })
          } catch (e) {
            // Silently ignore sync errors
          }
        }

        // Ensure geminiApiKey is also saved to localStorage for easy access by AI services
        if (
          settings.geminiApiKey !== undefined &&
          typeof window !== 'undefined'
        ) {
          try {
            if (settings.geminiApiKey && settings.geminiApiKey.trim()) {
              localStorage.setItem(
                'gemini_api_key',
                settings.geminiApiKey.trim()
              )
            } else {
              localStorage.removeItem('gemini_api_key')
            }
          } catch (e) {
            logger.warn('Failed to save API key to localStorage:', e)
          }
        }

        try {
          setVoiceRoutingPreferences({
            ttsProvider: this.settings.ttsProvider,
            sttProvider: this.settings.sttProvider,
            micDeviceId: this.settings.selectedMicId,
            speakerDeviceId: this.settings.selectedSpeakerId,
            lang: this.settings.voiceLang,
          })
        } catch {}

        return true
      } catch (error: any) {
        logger.error('Failed to update settings:', error)
        return false
      }
    },

    // Wrapper for async Settings.vue calls; ensures Promise-based API
    async saveSettings(settings: Partial<Settings>): Promise<boolean> {
      try {
        const ok = this.updateSettings(settings)
        if (ok && this.settings.autoSave) {
          await this.saveToStorage()
        }
        return ok
      } catch (e: any) {
        logger.error('saveSettings failed:', e)
        return false
      }
    },

    // Reset settings to defaults
    async resetSettings(): Promise<boolean> {
      try {
        logger.info('Resetting all settings to defaults')

        // Reset settings to default values
        this.settings = { ...DEFAULT_SETTINGS }

        // Clear localStorage API key
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('gemini_api_key')
          } catch (e) {
            logger.warn('Failed to clear API key from localStorage:', e)
          }
        }

        logger.info('Settings reset to defaults successfully')
        return true
      } catch (error: any) {
        logger.error('Failed to reset settings:', error)
        return false
      }
    },

    updatePortfolioLayout(layout: 'grid' | 'list' | 'timeline'): boolean {
      return this.updateSettings({ portfolioLayout: layout })
    },

    togglePortfolioAnalytics(): boolean {
      return this.updateSettings({
        portfolioShowAnalytics: !this.settings.portfolioShowAnalytics,
      })
    },

    // Save to storage
    async saveToStorage(): Promise<void> {
      try {
        await unifiedStorage.setPreferences?.(this.settings)
      } catch (error: any) {
        logger.error('Failed to save settings to storage:', error)
      }
    },

    // Load from storage
    loadFromStorage(): void {
      try {
        // Load preferences from DB (canonical)
        unifiedStorage
          .getPreferences?.()
          .then((prefs: any) => {
            if (prefs && typeof prefs === 'object') {
              this.settings = mergeSettings(this.settings, prefs)
            }
          })
          .catch(() => {})

        // Load theme from UnifiedStorage if not already set
        const legacyThemeKey = 'navicv-theme'
        const unifiedThemeKey = 'navi-theme-mode'

        let themeToLoad = null

        // First try to get from unified theme storage (newer format)
        try {
          const unifiedTheme = localStorage.getItem(unifiedThemeKey)
          if (unifiedTheme) {
            const parsed = JSON.parse(unifiedTheme)
            // Convert legacy 'system' to 'auto'
            themeToLoad = parsed === 'system' ? 'auto' : parsed
          }
        } catch {}

        // Fallback to legacy storage
        if (!themeToLoad) {
          const storedTheme = unifiedStorage.get(legacyThemeKey)
          if (storedTheme && storedTheme.value) {
            themeToLoad =
              storedTheme.value === 'system' ? 'auto' : storedTheme.value
          }
        }

        if (themeToLoad) {
          this.settings.theme = themeToLoad

          // Sync with unified theme system after loading
          try {
            import('@/shared/composables/useUnifiedTheme')
              .then(({ default: useUnifiedTheme }) => {
                const theme = useUnifiedTheme()
                theme.syncFromStore(themeToLoad as any)
              })
              .catch(() => {})
          } catch (e) {}
        }

        this.settings = mergeSettings(DEFAULT_SETTINGS, this.settings)
      } catch (error: any) {
        logger.error('Failed to load settings from storage:', error)
      }
    },
  },
})
