/**
 * PINIA STORE CONNECTOR
 * ====================
 * Unified store access and reactive state management
 */

import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'

/**
 * Unified store composable
 */
export function useStores() {
  // App store
  const appStore = useAppStore()
  const {
    user,
    settings,
    loading,
    errors,
    aiStatus,
    meta,
    isConfigured,
    hasPortfolio,
    profileCompleteness,
  } = storeToRefs(appStore)

  // Theme store
  const themeStore = useThemeStore()
  const {
    config: themeConfig,
    effectiveTheme,
    currentPalette,
    themeClasses,
  } = storeToRefs(themeStore)

  return {
    // App store
    appStore,
    user,
    settings,
    loading,
    errors,
    aiStatus,
    meta,
    isConfigured,
    hasPortfolio,
    profileCompleteness,

    // Theme store
    themeStore,
    themeConfig,
    effectiveTheme,
    currentPalette,
    themeClasses,

    // Combined utilities
    isLoading: key => loading.value[key] || false,
    hasError: key =>
      key ? errors.value[key] : Object.values(errors.value).some(Boolean),
    isDarkMode: () => effectiveTheme.value === 'dark',
    isLightMode: () => effectiveTheme.value === 'light',
  }
}

/**
 * Reactive loading state management
 */
export function useLoadingState(initialKeys = []) {
  const { appStore, loading } = useStores()

  const setLoading = (key, value = true) => {
    appStore.setLoading(key, value)
  }

  const clearLoading = key => {
    appStore.setLoading(key, false)
  }

  const clearAllLoading = () => {
    Object.keys(loading.value).forEach(key => {
      appStore.setLoading(key, false)
    })
  }

  // Initialize any default loading states
  initialKeys.forEach(key => setLoading(key, false))

  return {
    loading,
    setLoading,
    clearLoading,
    clearAllLoading,
    isAnyLoading: () => Object.values(loading.value).some(Boolean),
  }
}

/**
 * Error state management
 */
export function useErrorState() {
  const { appStore, errors } = useStores()

  const setError = (type, message) => {
    appStore.setError(type, message)
  }

  const clearError = type => {
    appStore.clearError(type)
  }

  const clearAllErrors = () => {
    appStore.clearError()
  }

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasAnyError: () => Object.values(errors.value).some(Boolean),
  }
}

/**
 * Theme management utilities
 */
export function useThemeManager() {
  const { themeStore, effectiveTheme, themeConfig } = useStores()

  const toggleTheme = () => {
    themeStore.toggleDarkMode()
  }

  const setTheme = mode => {
    themeStore.setMode(mode)
  }

  const updateThemeConfig = config => {
    Object.entries(config).forEach(([key, value]) => {
      if (
        typeof themeStore[
          `set${key.charAt(0).toUpperCase() + key.slice(1)}`
        ] === 'function'
      ) {
        themeStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](value)
      }
    })
  }

  return {
    effectiveTheme,
    themeConfig,
    toggleTheme,
    setTheme,
    updateThemeConfig,
    isDark: () => effectiveTheme.value === 'dark',
    isLight: () => effectiveTheme.value === 'light',
  }
}

export default {
  useStores,
  useLoadingState,
  useErrorState,
  useThemeManager,
}
