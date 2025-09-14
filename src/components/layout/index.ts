/**
 * NAVI Layout Components
 * Unified, reusable layout primitives for consistent UI composition
 */

import LayoutContainer from './LayoutContainer.vue'
import LayoutStack from './LayoutStack.vue'
import LayoutGrid from './LayoutGrid.vue'
import LayoutInline from './LayoutInline.vue'

// Export individual components
export {
  LayoutContainer,
  LayoutStack,
  LayoutGrid,
  LayoutInline
}

// Export as a collection for plugin registration
export const LayoutComponents = {
  LayoutContainer,
  LayoutStack,
  LayoutGrid,
  LayoutInline
}

// Type definitions for component props
export interface LayoutContainerProps {
  variant?: 'fluid' | 'page' | 'section' | 'narrow' | 'wide' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  center?: boolean
}

export interface LayoutStackProps {
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  variant?: 'default' | 'card' | 'section'
  responsive?: boolean
  reverse?: boolean
}

export interface LayoutGridProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 'auto' | 'auto-sm' | 'auto-lg'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  variant?: 'default' | 'card-grid' | 'feature-grid'
  minItemWidth?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

export interface LayoutInlineProps {
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  wrap?: boolean
  reverse?: boolean
  responsive?: boolean
  variant?: 'default' | 'toolbar' | 'breadcrumb' | 'tag-list'
  stackOnMobile?: boolean
}

// Utility types for layout composition
export type LayoutGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch'
export type LayoutJustify = 'start' | 'center' | 'end' | 'between' | 'around'

// Plugin for global registration
export default {
  install(app: any) {
    Object.entries(LayoutComponents).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
}