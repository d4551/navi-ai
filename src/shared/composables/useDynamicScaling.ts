/**
 * Dynamic Scaling Composable for Responsive Design
 * Handles viewport-based scaling, font size adjustments, and performance optimization
 */

import { ref, computed, onMounted, onUnmounted, watch, readonly } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { logger } from '@/shared/utils/logger'

export interface ScalingConfig {
  // Base viewport dimensions for scaling calculations
  baseWidth: number
  baseHeight: number
  
  // Scaling constraints
  minScale: number
  maxScale: number
  
  // Responsive breakpoints
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
  }
  
  // Font scaling options
  enableFontScaling: boolean
  fontScaleRatio: number
  
  // Performance options
  throttleMs: number
  enablePerformanceOptimization: boolean
}

const DEFAULT_CONFIG: ScalingConfig = {
  baseWidth: 1920,
  baseHeight: 1080,
  minScale: 0.8,
  maxScale: 1.5,
  breakpoints: {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  enableFontScaling: true,
  fontScaleRatio: 0.1,
  throttleMs: 16, // ~60fps
  enablePerformanceOptimization: true
}

export function useDynamicScaling(config: Partial<ScalingConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Reactive state
  const viewportWidth = ref(0)
  const viewportHeight = ref(0)
  const devicePixelRatio = ref(1)
  const isResizing = ref(false)
  
  // Computed scaling values
  const scaleRatio = computed(() => {
    if (!viewportWidth.value || !viewportHeight.value) return 1
    
    // Calculate scale based on viewport dimensions
    const widthScale = viewportWidth.value / finalConfig.baseWidth
    const heightScale = viewportHeight.value / finalConfig.baseHeight
    
    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(widthScale, heightScale)
    
    // Apply constraints
    return Math.min(Math.max(scale, finalConfig.minScale), finalConfig.maxScale)
  })
  
  const currentBreakpoint = computed(() => {
    const width = viewportWidth.value
    const bp = finalConfig.breakpoints
    
    if (width >= bp['2xl']) return '2xl'
    if (width >= bp.xl) return 'xl'
    if (width >= bp.lg) return 'lg'
    if (width >= bp.md) return 'md'
    if (width >= bp.sm) return 'sm'
    return 'xs'
  })
  
  const isMobile = computed(() => ['xs', 'sm'].includes(currentBreakpoint.value))
  const isTablet = computed(() => currentBreakpoint.value === 'md')
  const isDesktop = computed(() => ['lg', 'xl', '2xl'].includes(currentBreakpoint.value))
  
  const scaledFontSize = computed(() => {
    if (!finalConfig.enableFontScaling) return '1rem'
    
    const baseSize = 16 // 1rem = 16px
    const adjustment = (scaleRatio.value - 1) * finalConfig.fontScaleRatio
    const scaledSize = baseSize + (baseSize * adjustment)
    
    return `${Math.max(scaledSize, 12)}px` // Minimum 12px for accessibility
  })
  
  const cssCustomProperties = computed(() => ({
    '--viewport-width': `${viewportWidth.value}px`,
    '--viewport-height': `${viewportHeight.value}px`,
    '--scale-ratio': scaleRatio.value.toString(),
    '--scaled-font-size': scaledFontSize.value,
    '--current-breakpoint': currentBreakpoint.value,
    '--device-pixel-ratio': devicePixelRatio.value.toString(),
    '--is-mobile': isMobile.value ? '1' : '0',
    '--is-tablet': isTablet.value ? '1' : '0',
    '--is-desktop': isDesktop.value ? '1' : '0'
  }))
  
  // Performance optimization flags
  const shouldOptimizeAnimations = computed(() => {
    return finalConfig.enablePerformanceOptimization && (
      isResizing.value ||
      viewportWidth.value < finalConfig.breakpoints.md ||
      devicePixelRatio.value > 2
    )
  })
  
  const shouldReduceEffects = computed(() => {
    return finalConfig.enablePerformanceOptimization && (
      viewportWidth.value < finalConfig.breakpoints.sm ||
      devicePixelRatio.value > 2.5
    )
  })
  
  // Update viewport dimensions
  const updateDimensions = () => {
    if (typeof window === 'undefined') return

    viewportWidth.value = window.innerWidth
    viewportHeight.value = window.innerHeight
    devicePixelRatio.value = window.devicePixelRatio || 1

    // Log viewport updates less frequently to reduce spam
    const logKey = '__navi_viewport_log_time'
    const now = Date.now()
    const lastLog = (window as any)[logKey] || 0
    
    if (now - lastLog > 1000) { // Only log once per second max
      ;(window as any)[logKey] = now
      logger.debug('Viewport updated:', {
        width: viewportWidth.value,
        height: viewportHeight.value,
        ratio: devicePixelRatio.value,
        breakpoint: currentBreakpoint.value,
        scale: scaleRatio.value
      })
    }
  }  // Throttled resize handler
  const throttledUpdateDimensions = useThrottleFn(() => {
    isResizing.value = true
    updateDimensions()
    
    // Reset resizing flag after a delay
    setTimeout(() => {
      isResizing.value = false
    }, 150)
  }, finalConfig.throttleMs)
  
  // Apply CSS custom properties to document root
  const applyCSSProperties = () => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    const properties = cssCustomProperties.value
    
    Object.entries(properties).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
    
    // Add breakpoint classes for CSS targeting
    root.classList.remove('xs', 'sm', 'md', 'lg', 'xl', '2xl')
    root.classList.add(currentBreakpoint.value)
    
    // Add device type classes
    root.classList.toggle('mobile', isMobile.value)
    root.classList.toggle('tablet', isTablet.value)
    root.classList.toggle('desktop', isDesktop.value)
    
    // Add performance optimization classes
    root.classList.toggle('optimize-animations', shouldOptimizeAnimations.value)
    root.classList.toggle('reduce-effects', shouldReduceEffects.value)
  }
  
  // Utility functions for components
  const getScaledValue = (baseValue: number): number => {
    return baseValue * scaleRatio.value
  }
  
  const getResponsiveValue = <T>(values: Partial<Record<keyof ScalingConfig['breakpoints'], T>>): T | undefined => {
    const bp = currentBreakpoint.value as keyof ScalingConfig['breakpoints']
    
    // Try exact match first
    if (values[bp]) return values[bp]
    
    // Fallback to smaller breakpoints
    const fallbackOrder: (keyof ScalingConfig['breakpoints'])[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    const currentIndex = fallbackOrder.indexOf(bp)
    
    for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
      const fallback = fallbackOrder[i]
      if (values[fallback]) return values[fallback]
    }
    
    return undefined
  }
  
  const isBreakpointUp = (breakpoint: keyof ScalingConfig['breakpoints']): boolean => {
    return viewportWidth.value >= finalConfig.breakpoints[breakpoint]
  }
  
  const isBreakpointDown = (breakpoint: keyof ScalingConfig['breakpoints']): boolean => {
    return viewportWidth.value < finalConfig.breakpoints[breakpoint]
  }
  
  const getOptimalImageSize = (baseWidth: number, baseHeight: number) => {
    const scaledWidth = Math.round(baseWidth * scaleRatio.value * devicePixelRatio.value)
    const scaledHeight = Math.round(baseHeight * scaleRatio.value * devicePixelRatio.value)
    
    return {
      width: scaledWidth,
      height: scaledHeight,
      src: `${baseWidth}x${baseHeight}`,
      srcSet: [
        `${scaledWidth}x${scaledHeight} 1x`,
        `${scaledWidth * 2}x${scaledHeight * 2} 2x`
      ].join(', ')
    }
  }
  
  // Watch for changes and apply CSS properties
  watch(cssCustomProperties, applyCSSProperties, { immediate: false })
  
  // Lifecycle
  onMounted(() => {
    updateDimensions()
    applyCSSProperties()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', throttledUpdateDimensions)
      window.addEventListener('orientationchange', throttledUpdateDimensions)
      
      // Listen for pixel ratio changes (zoom, external monitor)
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(resolution: 1dppx)')
        mediaQuery.addEventListener('change', updateDimensions)
      }
    }
    
    // Log only once per session to prevent spam
    if (!(window as any).__navi_scaling_logged) {
      ;(window as any).__navi_scaling_logged = true
      logger.info('Dynamic scaling initialized', {
        config: finalConfig,
        initial: {
          width: viewportWidth.value,
          height: viewportHeight.value,
          breakpoint: currentBreakpoint.value,
          scale: scaleRatio.value
        }
      })
    }
  })
  
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', throttledUpdateDimensions)
      window.removeEventListener('orientationchange', throttledUpdateDimensions)
    }
  })
  
  return {
    // State
    viewportWidth: readonly(viewportWidth),
    viewportHeight: readonly(viewportHeight),
    devicePixelRatio: readonly(devicePixelRatio),
    isResizing: readonly(isResizing),
    
    // Computed
    scaleRatio: readonly(scaleRatio),
    currentBreakpoint: readonly(currentBreakpoint),
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    scaledFontSize: readonly(scaledFontSize),
    cssCustomProperties: readonly(cssCustomProperties),
    shouldOptimizeAnimations: readonly(shouldOptimizeAnimations),
    shouldReduceEffects: readonly(shouldReduceEffects),
    
    // Methods
    updateDimensions,
    applyCSSProperties,
    getScaledValue,
    getResponsiveValue,
    isBreakpointUp,
    isBreakpointDown,
    getOptimalImageSize,
    
    // Config
    config: finalConfig
  }
}

// Global instance for app-wide scaling
let globalScalingInstance: ReturnType<typeof useDynamicScaling> | null = null

export function useGlobalDynamicScaling(config?: Partial<ScalingConfig>) {
  if (!globalScalingInstance) {
    globalScalingInstance = useDynamicScaling(config)
  }
  return globalScalingInstance
}

export default useDynamicScaling