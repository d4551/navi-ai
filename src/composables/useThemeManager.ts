
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";

  // Delegate everything to the unified theme system
  const unifiedTheme = useUnifiedTheme();

  // Return the unified theme interface with some backward compatibility methods
  return {
    // Core theme state from unified system
    ...unifiedTheme,

    // Backward compatibility aliases
    activeTheme: unifiedTheme.colorScheme,
    currentTheme: unifiedTheme.colorScheme,

    // Ensure we have all expected methods
    getThemeIcon: unifiedTheme.getThemeIcon || (() => "mdi-theme-light-dark"),
    getThemeDisplayName: unifiedTheme.getThemeDisplayName || (() => "System"),
    cycleTheme: unifiedTheme.cycleTheme || unifiedTheme.toggleTheme,
  };
}

// Utility exports for global access
  const { colorScheme } = useUnifiedTheme();
  return colorScheme.value;
}

  const { isDark } = useUnifiedTheme();
  return isDark.value;
}
