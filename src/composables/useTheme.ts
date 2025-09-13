
import { computed } from "vue";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";

export type ThemeMode = "light" | "dark" | "system";
export type ActiveTheme = "light" | "dark";

  // Delegate to the unified theme system
  const unified = useUnifiedTheme();

  // Backward compatibility mapping
  return {
    // Legacy state mappings
    currentTheme: unified.themeMode,
    activeTheme: unified.colorScheme,
    isDark: unified.isDark,
    isLight: unified.isLight,
    isSystemMode: unified.isSystem,

    // Legacy action mappings
    setTheme: unified.setThemeMode,
    toggleTheme: unified.toggleTheme,
    applyTheme: (theme: ActiveTheme) => {
      unified.setThemeMode(theme);
    },

    // Additional legacy methods that may be expected
    initializeTheme: unified.initializeTheme,
  };
}
