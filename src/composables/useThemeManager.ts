/**
 * UNIFIED THEME MANAGER - WRAPPER FOR SINGLE SOURCE OF TRUTH
 * =========================================================
 *
 * Simple wrapper around useUnifiedTheme to provide backward compatibility
 * while ensuring all theme functionality uses the single source of truth.
 *
 * This file serves as a transition bridge and can be deprecated once all
 * components are updated to use useUnifiedTheme directly.
 */

import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

export function useThemeManager() {
  // Delegate everything to the unified theme system
  const unifiedTheme = useUnifiedTheme()

  // Return the unified theme interface with some backward compatibility methods
  return {
    // Core theme state from unified system
    ...unifiedTheme,

    // Backward compatibility aliases
    activeTheme: unifiedTheme.colorScheme,
    currentTheme: unifiedTheme.colorScheme,

    // Ensure we have all expected methods
    getThemeIcon: unifiedTheme.getThemeIcon || (() => 'mdi-theme-light-dark'),
    getThemeDisplayName: unifiedTheme.getThemeDisplayName || (() => 'System'),
    cycleTheme: unifiedTheme.cycleTheme || unifiedTheme.toggleTheme,
  }
}

// Utility exports for global access
export function getCurrentTheme(): 'light' | 'dark' {
  const { colorScheme } = useUnifiedTheme()
  return colorScheme.value
}

export function isDarkMode(): boolean {
  const { isDark } = useUnifiedTheme()
  return isDark.value
}
