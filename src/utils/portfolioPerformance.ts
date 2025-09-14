import { ref, computed, nextTick, readonly } from 'vue'

/**
 * Virtual scrolling utility for large lists
 * Optimizes rendering performance by only rendering visible items
 */
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number // Number of items to render outside viewport
  enableSmoothScrolling?: boolean
}

export interface VirtualScrollState {
  startIndex: number
  endIndex: number
  offsetY: number
  totalHeight: number
  visibleItems: any[]
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    enableSmoothScrolling = true
  } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()

  // Calculate visible range
  const visibleRange = computed(() => {
    const visibleStart = Math.floor(scrollTop.value / itemHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    const startIndex = Math.max(0, visibleStart - overscan)
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan)

    return { startIndex, endIndex, visibleStart, visibleEnd }
  })

  // Calculate virtual scroll state
  const virtualState = computed((): VirtualScrollState => {
    const { startIndex, endIndex } = visibleRange.value
    const offsetY = startIndex * itemHeight
    const totalHeight = items.length * itemHeight
    const visibleItems = items.slice(startIndex, endIndex + 1)

    return {
      startIndex,
      endIndex,
      offsetY,
      totalHeight,
      visibleItems
    }
  })

  // Handle scroll events
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop

    if (enableSmoothScrolling) {
      // Smooth scrolling optimization
      requestAnimationFrame(() => {
        // Update scroll position
      })
    }
  }

  // Scroll to specific item
  const scrollToItem = (index: number, behavior: 'auto' | 'smooth' = 'smooth') => {
    if (!containerRef.value) return

    const targetScrollTop = index * itemHeight
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior
    })
  }

  // Scroll to top
  const scrollToTop = () => {
    scrollToItem(0, 'smooth')
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    scrollToItem(items.length - 1, 'smooth')
  }

  return {
    containerRef,
    virtualState,
    handleScroll,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    scrollTop
  }
}

/**
 * Infinite loading utility for paginated data
 */
export interface InfiniteLoadOptions {
  threshold?: number // Distance from bottom to trigger loading
  loadingDelay?: number // Minimum delay between loads
}

export function useInfiniteLoad(
  loadMore: () => Promise<void>,
  options: InfiniteLoadOptions = {}
) {
  const { threshold = 100, loadingDelay = 500 } = options

  const loading = ref(false)
  const lastLoadTime = ref(0)
  const containerRef = ref<HTMLElement>()

  const canLoad = computed(() => {
    const now = Date.now()
    return !loading.value && (now - lastLoadTime.value) >= loadingDelay
  })

  const handleScroll = async (event: Event) => {
    if (!canLoad.value) return

    const target = event.target as HTMLElement
    const { scrollTop, scrollHeight, clientHeight } = target

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom <= threshold) {
      loading.value = true
      lastLoadTime.value = Date.now()

      try {
        await loadMore()
      } finally {
        loading.value = false
      }
    }
  }

  return {
    containerRef,
    loading,
    handleScroll,
    canLoad
  }
}

/**
 * Search and filter optimization utility
 */
export interface SearchOptions {
  debounceMs?: number
  minQueryLength?: number
  searchFields?: string[]
}

export function useOptimizedSearch<T>(
  items: T[],
  options: SearchOptions = {}
) {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    searchFields = ['title', 'description']
  } = options

  const query = ref('')
  const loading = ref(false)
  const debouncedQuery = ref('')

  let debounceTimeout: NodeJS.Timeout | null = null

  // Debounced search query
  const updateDebouncedQuery = () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = setTimeout(() => {
      debouncedQuery.value = query.value
      loading.value = false
    }, debounceMs)
  }

  // Watch query changes
  const setQuery = (newQuery: string) => {
    query.value = newQuery
    loading.value = newQuery.length >= minQueryLength

    updateDebouncedQuery()
  }

  // Filtered results
  const filteredItems = computed(() => {
    const searchQuery = debouncedQuery.value.toLowerCase()

    if (!searchQuery || searchQuery.length < minQueryLength) {
      return items
    }

    return items.filter((item: any) => {
      return searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchQuery)
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(searchQuery)
          )
        }
        return false
      })
    })
  })

  const clearSearch = () => {
    query.value = ''
    debouncedQuery.value = ''
    loading.value = false
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
  }

  return {
    query,
    setQuery,
    clearSearch,
    loading,
    filteredItems
  }
}

/**
 * Memory usage monitoring for performance optimization
 */
export function usePerformanceMonitor() {
  const metrics = ref({
    heapUsed: 0,
    heapTotal: 0,
    renderTime: 0,
    itemsRendered: 0
  })

  const startTime = ref(0)

  const startRenderTracking = () => {
    startTime.value = performance.now()
  }

  const endRenderTracking = (itemCount: number) => {
    const endTime = performance.now()
    metrics.value.renderTime = endTime - startTime.value
    metrics.value.itemsRendered = itemCount
  }

  const updateMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.value.heapUsed = memory.usedJSHeapSize
      metrics.value.heapTotal = memory.totalJSHeapSize
    }
  }

  const logPerformanceWarning = (message: string, threshold: number, actual: number) => {
    if (actual > threshold) {
      console.warn(`Performance Warning: ${message}`, {
        threshold,
        actual,
        recommendation: 'Consider enabling virtualization or reducing item complexity'
      })
    }
  }

  return {
    metrics,
    startRenderTracking,
    endRenderTracking,
    updateMemoryUsage,
    logPerformanceWarning
  }
}

/**
 * Image lazy loading utility for portfolio items
 */
export function useLazyImages() {
  const imageCache = new Map<string, boolean>()
  const loadingImages = new Set<string>()

  const loadImage = async (src: string): Promise<boolean> => {
    if (imageCache.has(src)) {
      return imageCache.get(src)!
    }

    if (loadingImages.has(src)) {
      return false // Still loading
    }

    loadingImages.add(src)

    try {
      if (typeof window !== 'undefined' && window.Image) {
        const img = new window.Image()
        
        return new Promise<boolean>((resolve) => {
          img.onload = () => {
            imageCache.set(src, true)
            loadingImages.delete(src)
            resolve(true)
          }
          
          img.onerror = () => {
            imageCache.set(src, false)
            loadingImages.delete(src)
            resolve(false)
          }
          
          img.src = src
        })
      } else {
        imageCache.set(src, false)
        loadingImages.delete(src)
        return false
      }
    } catch {
      imageCache.set(src, false)
      loadingImages.delete(src)
      return false
    }
  }

  const preloadImages = async (urls: string[]) => {
    const promises = urls.map(url => loadImage(url))
    await Promise.allSettled(promises)
  }

  const isImageLoaded = (src: string): boolean => {
    return imageCache.get(src) === true
  }

  const clearCache = () => {
    imageCache.clear()
    loadingImages.clear()
  }

  return {
    loadImage,
    preloadImages,
    isImageLoaded,
    clearCache
  }
}

/**
 * Batch operations utility for bulk portfolio actions
 */
export function useBatchOperations() {
  const batchSize = ref(10)
  const processing = ref(false)

  const processBatch = async <T, R>(
    items: T[],
    _operation: (_item: T) => Promise<R>,
    _onProgress?: (_processed: number, _total: number) => void
  ): Promise<R[]> => {
    processing.value = true
    const results: R[] = []

    try {
      for (let i = 0; i < items.length; i += batchSize.value) {
        const batch = items.slice(i, i + batchSize.value)
        const batchResults = await Promise.all(
          batch.map(item => _operation(item))
        )
        
        results.push(...batchResults)
        
        if (_onProgress) {
          _onProgress(i + batch.length, items.length)
        }

        // Allow UI to update between batches
        await nextTick()
      }

      return results
    } finally {
      processing.value = false
    }
  }

  return {
    batchSize,
    processing: readonly(processing),
    processBatch
  }
}
