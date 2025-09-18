declare module '@/stores/app' {
  export const useAppStore: any
  const _default: any
  export default _default
}

declare module '@/composables/useToast' {
  export function useToast(): any
  const _default: any
  export default _default
}

// Global window properties
declare global {
  interface Window {
    __samMaxEggEnabled?: boolean
    __navi_compat_logged?: boolean
  }
}
