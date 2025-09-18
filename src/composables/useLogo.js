import { computed, ref, watch } from 'vue'

// Provide computed logo path + simple load/error tracking
// Expects a Pinia store with settings.theme
export function useLogo(store) {
  const fallbackLogoDataUri =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="8" fill="%23667EEA"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="white">N</text></svg>'
  const logoLoadState = ref({ loaded: false, error: false, path: '' })

  const resolveAssetPath = filename => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.location.protocol !== 'file:'
      ) {
        const base =
          (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/'
        const normalized = base.replace(/\/+$/, '/')
        return `${normalized}${filename}`
      }
      return `./${filename}`
    } catch {
      return `./${filename}`
    }
  }

  const logoSrc = computed(() => {
    const _theme = store?.settings?.theme || 'auto'
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDarkMode = theme === 'dark' || (theme === 'auto' && prefersDark)
    return resolveAssetPath(isDarkMode ? 'logoDark.svg' : 'logoLight.svg')
  })

  const onLogoLoad = _e => {
    logoLoadState.value = {
      loaded: true,
      error: false,
      path: e?.target?.src || '',
    }
  }

  const onLogoError = _e => {
    if (!logoLoadState.value.error) {
      logoLoadState.value = { ...logoLoadState.value, error: true }
      if (e?.target) {
        e.target.src = fallbackLogoDataUri
      }
    }
  }

  watch(
    logoSrc,
    () => {
      logoLoadState.value = { loaded: false, error: false, path: '' }
    },
    { immediate: true }
  )

  return { logoSrc, onLogoLoad, onLogoError, logoLoadState }
}
