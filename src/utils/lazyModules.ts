/**
 * LAZY MODULE LOADER
 * ==================
 *
 * Dynamic imports for heavy modules to reduce initial bundle size
 * - AI/ML libraries loaded on demand
 * - Audio processing loaded when voice features used
 * - Document processing loaded when export features used
 * - Charts/visualization loaded when analytics viewed
 */

import { logger } from '@/shared/utils/logger'

// Cache for loaded modules to avoid duplicate loads
const moduleCache = new Map<string, Promise<any>>()

/**
 * Generic lazy loader with caching and error handling
 */
async function lazyLoad<T>(
  moduleId: string,
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId)
  }

  const loadPromise = importFn().catch(error => {
    logger.error(`Failed to load module ${moduleId}:`, error)
    moduleCache.delete(moduleId) // Remove from cache so we can retry

    if (fallback) {
      logger.info(`Using fallback for ${moduleId}`)
      return fallback
    }
    throw error
  })

  moduleCache.set(moduleId, loadPromise)
  return loadPromise
}

/**
 * AI/ML Libraries - Heavy dependencies loaded on demand
 */
export const aiModules = {
  async transformers() {
    return lazyLoad(
      'transformers',
      () => import('@huggingface/transformers'),
      null
    )
  },

  async tensorflow() {
    return lazyLoad('tensorflow', () => import('@tensorflow/tfjs'), null)
  },

  async onnx() {
    return lazyLoad('onnx', () => import('onnxruntime-web'), null)
  },
}

/**
 * Audio Processing - Voice features
 */
export const audioModules = {
  async phonemizer() {
    return lazyLoad('phonemizer', () => import('phonemizer'), null)
  },

  async kokoro() {
    return lazyLoad('kokoro', () => import('kokoro-js'), null)
  },
}

/**
 * Document Processing - Export and generation features
 */
export const documentModules = {
  async pdfLib() {
    return lazyLoad('pdf-lib', () => import('pdf-lib'))
  },

  async html2canvas() {
    return lazyLoad('html2canvas', () => import('html2canvas'))
  },

  async fileSaver() {
    return lazyLoad('file-saver', () => import('file-saver'))
  },

  async jszip() {
    return lazyLoad('jszip', () => import('jszip'))
  },
}

/**
 * Charts and Visualization - Analytics features
 */
export const chartModules = {
  async chartjs() {
    return lazyLoad('chart.js', () => import('chart.js'))
  },

  async vueChartjs() {
    return lazyLoad('vue-chartjs', () => import('vue-chartjs'))
  },

  async cytoscape() {
    return lazyLoad('cytoscape', () => import('cytoscape'))
  },
}

/**
 * Text Processing - NLP features
 */
export const textModules = {
  async compromise() {
    return lazyLoad('compromise', () => import('compromise'))
  },

  async natural() {
    return lazyLoad('natural', () => import('natural'))
  },

  async marked() {
    return lazyLoad('marked', () => import('marked'))
  },
}

/**
 * Service Workers - PWA features
 */
export const pwaModules = {
  async workboxWindow() {
    return lazyLoad(
      'workbox-window',
      () => import('workbox-window'),
      null // Graceful degradation if SW not available
    )
  },
}

/**
 * Monitoring - Error tracking and analytics
 */
export const monitoringModules = {
  async sentry() {
    return lazyLoad(
      'sentry',
      () => import('@sentry/browser'),
      null // Optional monitoring
    )
  },
}

/**
 * Preload critical modules based on user behavior
 */
export async function preloadCriticalModules(): Promise<void> {
  // Preload modules that are likely to be needed soon
  const preloadPromises: Promise<any>[] = []

  // Preload document modules if user has projects
  try {
    const hasProjects =
      localStorage.getItem('portfolio') || localStorage.getItem('documents')
    if (hasProjects) {
      preloadPromises.push(documentModules.pdfLib())
    }
  } catch (error) {
    // Ignore localStorage errors
  }

  // Preload chart modules if on analytics pages
  if (
    window.location.pathname.includes('analytics') ||
    window.location.pathname.includes('dashboard')
  ) {
    preloadPromises.push(chartModules.chartjs())
  }

  // Execute preloads in background
  Promise.allSettled(preloadPromises).then(results => {
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    if (successful > 0) {
      logger.info(`Preloaded ${successful} modules`)
    }
    if (failed > 0) {
      logger.warn(`Failed to preload ${failed} modules`)
    }
  })
}

/**
 * Get loading status of all cached modules
 */
export function getModuleLoadingStatus(): Record<
  string,
  'loading' | 'loaded' | 'error'
> {
  const status: Record<string, 'loading' | 'loaded' | 'error'> = {}

  for (const [moduleId, promise] of moduleCache.entries()) {
    // Check if promise is resolved/rejected by inspecting its state
    const promiseWithStatus = promise as Promise<any> & {
      __status?: 'loading' | 'loaded' | 'error'
    }

    if (promiseWithStatus.__status) {
      status[moduleId] = promiseWithStatus.__status
    } else {
      status[moduleId] = 'loading'

      // Tag the promise with its status when it resolves/rejects
      promise
        .then(() => {
          promiseWithStatus.__status = 'loaded'
        })
        .catch(() => {
          promiseWithStatus.__status = 'error'
        })
    }
  }

  return status
}

/**
 * Clear module cache (useful for testing or memory management)
 */
export function clearModuleCache(): void {
  moduleCache.clear()
  logger.info('Module cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalCached: number
  memoryUsage: number // Rough estimate
} {
  return {
    totalCached: moduleCache.size,
    memoryUsage: moduleCache.size * 1000, // Rough estimate in bytes
  }
}
