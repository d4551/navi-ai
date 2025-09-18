declare module '@modules/*' {
  const mod: any
  export default mod
  export = mod
}

declare module '@/utils/export' {
  export const ExportService: any
}

declare module '@/utils/storage' {
  export const unifiedStorage: any
  export const idbStorage: any
  export const secureStorage: any
  export class UnifiedStorage {}
}

declare module '@/utils/effects' {
  const x: any
  export = x
}
declare module '@/utils/performance' {
  const x: any
  export = x
}
declare module '@/services/jobService' {
  const x: any
  export = x
}
declare module '@/services/backgroundImportService' {
  const x: any
  export = x
}
