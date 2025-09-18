declare module './jobService' {
  export function searchJobs(params?: any): Promise<{
    jobs: any[]
    totalResults?: number
    sources?: string[]
    errors?: Array<{ source: string; error: string } | string>
    fetchedAt?: string
  }>

  export function getJobSources(): Array<{
    id: string
    name: string
    description?: string
    enabled?: boolean
  }>

  export function testJobSource(sourceId: string): Promise<{
    success: boolean
    jobCount?: number
    message?: string
    metadata?: any
    error?: string
  }>

  export function getAllRegions(): string[]
  export function getAllCategories(): string[]
}

declare module './jobService.js' {
  export * from './jobService'
}
