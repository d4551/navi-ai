// Simple helpers to read CSS variables and provide theme-aware colors in JS

export function getCssVar(name, fallback = '') {
  try {
    if (typeof window === 'undefined' || !window.getComputedStyle) return fallback
    const css = getComputedStyle(document.documentElement)
    const val = (css.getPropertyValue(name) || '').trim()
    return val || fallback
  } catch {
    return fallback
  }
}

const tokenVarMap = {
  'primary-500': '--color-primary-500',
  'primary-600': '--color-primary-600',
  'info-500': '--color-info-500',
  'success-500': '--color-success-500',
  'success-600': '--color-success-600',
  'warning-500': '--color-warning-500',
  'danger-500': '--color-danger-500',
  'muted-500': '--color-muted-500',
  'text-primary': '--text-primary',
  'text-secondary': '--text-secondary',
  'bg-primary': '--bg-primary',
}

export function colorToken(name, fallback = '') {
  const varName = tokenVarMap[name] || name
  return getCssVar(varName, fallback)
}

export function hexToRgb(hex) {
  try {
    const h = hex.replace('#', '')
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16)
      const g = parseInt(h[1] + h[1], 16)
      const b = parseInt(h[2] + h[2], 16)
      return [r, g, b]
    }
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16)
      const g = parseInt(h.slice(2, 4), 16)
      const b = parseInt(h.slice(4, 6), 16)
      return [r, g, b]
    }
  } catch {}
  return [102, 126, 234]
}

export function toRgba(color, alpha = 1) {
  if (!color) return `rgba(0,0,0,${alpha})`
  if (color.startsWith('#')) {
    const [r, g, b] = hexToRgb(color)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  // Fallback: return color as-is; alpha not applied
  return color
}

