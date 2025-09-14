<script setup lang="ts">
// Keeps Vuetify theme in sync with the unified theme system
import { watch, onMounted } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

const unified = (() => { try { return useUnifiedTheme() } catch { return undefined as any } })()
const vTheme = (() => { try { return useVuetifyTheme() } catch { return undefined as any } })()

function applyTheme() {
  try {
    const scheme = unified?.colorScheme?.value === 'dark' ? 'dark' : 'light'
    // Prefer Vuetify's recommended API to avoid deprecation warnings
    if (vTheme && typeof vTheme.change === 'function') {
      vTheme.change(scheme)
    } else if (vTheme?.global?.name) {
      // Fallback for older Vuetify versions
      vTheme.global.name.value = scheme
    }
    // Also mirror on documentElement to cover any late loads
    try {
      const root = document.documentElement
      root.setAttribute('data-theme', scheme)
      root.setAttribute('data-color-scheme', scheme)
      root.style.setProperty('color-scheme', scheme)
      // Mirror to body for legacy selectors (body[data-theme])
      document.body && document.body.setAttribute('data-theme', scheme)
    } catch {}
  } catch {}
}

// Use a broad type to avoid lint false-positives in SFC TS parsing
let mo: any = null
onMounted(() => {
  applyTheme()
  try {
    // Observe root for data-theme updates from any source and mirror to body
    const MObs = (typeof window !== 'undefined' ? window.MutationObserver : undefined)
    if (!MObs) return
    mo = new MObs(() => {
      try {
        const scheme = document.documentElement.getAttribute('data-theme') || 'light'
        document.body && document.body.setAttribute('data-theme', scheme)
      } catch {}
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  } catch {}
})
watch(() => unified?.colorScheme?.value, () => applyTheme(), { immediate: true })
</script>

<template>
  <span class="theme-bridge" style="display:none" aria-hidden="true"></span>
</template>

<style scoped>
/* No UI; purely a behavior bridge */
</style>
