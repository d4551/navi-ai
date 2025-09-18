import { ComputedRef, Ref } from 'vue'

export interface LogoLoadState {
  loaded: boolean
  error: boolean
  path: string
}

export interface Store {
  settings?: {
    theme?: string
  }
}

export interface LogoComposable {
  logoSrc: ComputedRef<string>
  onLogoLoad: (e: Event) => void
  onLogoError: (e: Event) => void
  logoLoadState: Ref<LogoLoadState>
}

export function useLogo(store?: Store): LogoComposable
