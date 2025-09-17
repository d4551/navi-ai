// Runtime aliasing for legacy MDI class names used directly in markup
// Ensures <i class="mdi mdi-foo"> gets mapped to current icon names
import { getMdiAlias } from '@/utils/iconAliases'

function aliasNodeClasses(node) {
  try {
    if (!(node instanceof HTMLElement)) return
    if (node.classList && node.classList.contains('mdi')) {
      const classes = Array.from(node.classList)
      // find first mdi-* (excluding base 'mdi')
      const mdiClass = classes.find(c => c !== 'mdi' && c.startsWith('mdi-'))
      if (mdiClass) {
        const aliased = getMdiAlias(mdiClass)
        if (aliased && aliased !== mdiClass) {
          node.classList.remove(mdiClass)
          node.classList.add(aliased)
        }
      }
    }
  } catch {}
}

function aliasAllExisting() {
  try {
    document.querySelectorAll('.mdi').forEach(aliasNodeClasses)
  } catch {}
}

export function initMdiAliasRuntime() {
  // Initial pass
  aliasAllExisting()
  // Observe changes
  try {
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            aliasNodeClasses(n)
            // Also check descendants
            if (n.querySelectorAll) {
              n.querySelectorAll('.mdi').forEach(aliasNodeClasses)
            }
          })
        } else if (m.type === 'attributes' && m.target) {
          aliasNodeClasses(m.target)
        }
      }
    })
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  } catch {}
}

export default { initMdiAliasRuntime }
