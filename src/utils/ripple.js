/* Gaming Ripple Effect Utility - 2025 Glassmorphism System
 * Lightweight, framework-agnostic initializer.
 * Usage: import { initRipples } from '@/utils/ripple'; initRipples();
 */
let _initialized = false

export function initRipples(options = {}) {
  if (_initialized) return
  _initialized = true
  const selector = options.selector || '.ripple-enabled, .gaming-button, .btn'
  const activeClass = options.activeClass || 'is-rippling'

  function createRipple(e) {
    const target = e.currentTarget
    if (!target) return

    // Clear any existing ripples to prevent accumulation
    const existingWaves = target.querySelectorAll('.ripple-wave')
    existingWaves.forEach(wave => wave.remove())

    const rect = target.getBoundingClientRect()
    const wave = document.createElement('span')
    wave.className = 'ripple-wave'
    const size = Math.max(rect.width, rect.height)
    wave.style.width = wave.style.height = size + 'px'
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    wave.style.left = x + 'px'
    wave.style.top = y + 'px'

    // Add is-rippling class to the target
    target.classList.add(activeClass)

    // Use ripple container if available, otherwise append to target
    const container = target.querySelector('.ripple-container') || target
    container.appendChild(wave)

    // Clean up after animation completes
    wave.addEventListener('animationend', () => {
      wave.remove()
      target.classList.remove(activeClass)

      // Force layout recalculation to ensure size is properly reset
      target.offsetHeight
    })

    // Fallback timeout in case animationend doesn't fire
    setTimeout(() => {
      if (wave.parentNode) {
        wave.remove()
        target.classList.remove(activeClass)
      }
    }, 650)
  }

  function bind(el) {
    if (el.__rippleBound) return
    el.addEventListener('pointerdown', createRipple, { passive: true })
    el.__rippleBound = true
    el.classList.add('ripple-enabled')
  }

  function scan() {
    document.querySelectorAll(selector).forEach(bind)
  }

  // Initial scan
  scan()

  // Observe for dynamically added buttons
  if (
    typeof window !== 'undefined' &&
    typeof window.MutationObserver !== 'undefined'
  ) {
    const mo = new window.MutationObserver(() => scan())
    mo.observe(document.documentElement, { childList: true, subtree: true })
  }
}

// Auto-init after DOMContentLoaded if imported
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initRipples())
  } else {
    initRipples()
  }
}
