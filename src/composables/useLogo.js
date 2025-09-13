import { computed, ref, watch } from "vue";

// Provide computed logo path + simple load/error tracking
// Expects a Pinia store with settings.theme
export function useLogo(store) {
  const fallbackLogoDataUri =
    'data:image/svg+xml;utf8,<svg xmlns="http:
  const logoLoadState = ref({ loaded: false, error: false, path: "" });

  const resolveAssetPath = (filename) => {
    try {
      if (
        typeof window !== "undefined" &&
        window.location.protocol !== "file:"
      ) {
        const base =
          (import.meta && import.meta.env && import.meta.env.BASE_URL) || "/";
        const normalized = base.replace(/\/+$/, "/");
        return `${normalized}${filename}`;
      }
      return `./${filename}`;
    } catch {
      return `./${filename}`;
    }
  };

  const logoSrc = computed(() => {
    const theme = store?.settings?.theme || "auto";
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = theme === "dark" || (theme === "auto" && prefersDark);
    return resolveAssetPath(isDarkMode ? "logoDark.svg" : "logoLight.svg");
  });

  const onLogoLoad = (e) => {
    logoLoadState.value = {
      loaded: true,
      error: false,
      path: e?.target?.src || "",
    };
  };

  const onLogoError = (e) => {
    if (!logoLoadState.value.error) {
      logoLoadState.value = { ...logoLoadState.value, error: true };
      if (e?.target) {
        e.target.src = fallbackLogoDataUri;
      }
    }
  };

  watch(
    logoSrc,
    () => {
      logoLoadState.value = { loaded: false, error: false, path: "" };
    },
    { immediate: true },
  );

  return { logoSrc, onLogoLoad, onLogoError, logoLoadState };
}
