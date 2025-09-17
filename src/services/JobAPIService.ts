/**
 * JobAPIService - Canonical Facade
 *
 * Unifies legacy jobService.js APIs with the newer RefactoredJobAPIService provider-based pipeline.
 * - Keeps existing UI imports stable (e.g., testJobSource, getJobSources)
 * - Exposes a typed, modern interface for provider-based aggregation via refactoredJobAPIService
 *
 * Migration strategy:
 *   1) Short-term: UI continues to call legacy functions (re-exported here) with no breakage.
 *   2) Medium-term: New code should prefer searchJobsRefactored and JobFilters types.
 *   3) Long-term: We can swap legacy internals to call refactored service, preserving contracts.
 */

import type { Job } from '@/shared/types/jobs'
import type { JobFilters } from '@/shared/types/jobs'
import { canonicalJobService as refactoredJobAPIService } from '@/services/jobs'

// Legacy JS module re-exports for backward compatibility
export {
  getJobSources,
  testJobSource,
  getAllRegions,
  getAllCategories,
} from './jobService'

// Legacy search params (as used by jobService.js)
export interface LegacySearchParams {
  query?: string
  location?: string
  remote?: boolean
  experience?: string
  sources?: string[]
  regions?: string[]
  categories?: string[]
  filters?: Record<string, any>
}

// Unified response type
export interface JobSearchResult {
  jobs: Job[]
  totalResults: number
  sources: string[]
  errors: Array<{ source: string; error: string } | string>
  fetchedAt?: string
  processingTime?: number
}

/**
 * searchJobsLegacy
 * Calls the legacy jobService.js search to maintain existing UI paths.
 */
import { searchJobs as legacySearchJobs } from './jobService'

export async function searchJobsLegacy(
  params: LegacySearchParams = {}
): Promise<JobSearchResult> {
  const res = await legacySearchJobs(params)
  // Normalize error shape for consistency
  const errors = Array.isArray(res.errors) ? res.errors : []
  return {
    jobs: res.jobs || [],
    totalResults:
      typeof res.totalResults === 'number'
        ? res.totalResults
        : res.jobs?.length || 0,
    sources: res.sources || [],
    errors,
    fetchedAt: res.fetchedAt,
  }
}

/**
 * searchJobsRefactored
 * Preferred modern API: provider registry + aggregation pipeline with dedupe and enhancements.
 */
export async function searchJobsRefactored(
  filters: JobFilters
): Promise<JobSearchResult> {
  const res = await refactoredJobAPIService.searchJobs(filters)
  return {
    jobs: res.jobs,
    totalResults: res.totalFound,
    sources: res.sources,
    errors: res.errors,
    processingTime: res.processingTime,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * searchJobsUnified
 * Small convenience that chooses the best available pipeline.
 * - If filters include provider-driven fields (like provider flags), use refactored path.
 * - Else fallback to legacy for now to avoid breaking current UIs.
 */
export async function searchJobsUnified(
  args: { filters?: JobFilters; legacy?: LegacySearchParams } = {}
): Promise<JobSearchResult> {
  if (args.filters) {
    try {
      return await searchJobsRefactored(args.filters)
    } catch {
      // Silent fallback to legacy if refactored path fails for edge cases
    }
  }
  return searchJobsLegacy(args.legacy || {})
}

/**
 * queryToJobFilters
 * Convert a route query object into canonical JobFilters.
 * Supports common aliases: q|query|title, type|jobType, exp|experience|experienceLevel, engines, studioTypes, platforms.
 */
export function queryToJobFilters(query: Record<string, any> = {}): JobFilters {
  const getBool = (v: any): boolean | undefined => {
    if (v === undefined) return undefined
    const s = String(v).toLowerCase()
    if (['1', 'true', 'yes', 'y'].includes(s)) return true
    if (['0', 'false', 'no', 'n'].includes(s)) return false
    return undefined
  }

  const getNum = (v: any): number | undefined => {
    if (v === undefined || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const getArr = (v: any): string[] | undefined => {
    if (v === undefined) return undefined
    if (Array.isArray(v)) return v.filter(Boolean).map(String)
    const s = String(v).trim()
    if (!s) return undefined
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {}
    return s
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)
  }

  const title =
    query.q || query.query || query.title
      ? String(query.q || query.query || query.title)
      : undefined
  const location = query.location ? String(query.location) : undefined
  const remote = getBool(query.remote)
  const jobType =
    query.type || query.jobType
      ? (String(query.type || query.jobType) as any)
      : undefined
  const experienceLevel =
    query.exp || query.experience || query.experienceLevel
      ? (String(query.exp || query.experience || query.experienceLevel) as any)
      : undefined
  const salaryMin = getNum(query.salaryMin)
  const salaryMax = getNum(query.salaryMax)
  const technologies = getArr(query.technologies)
  const studioTypes = getArr(query.studioTypes) as any
  const gameGenres = getArr(query.gameGenres) as any
  const platforms = getArr(query.platforms) as any
  const postedWithin = getNum(query.postedWithin)
  const minMatchScore = getNum(query.minMatchScore)
  const limit = getNum(query.limit)

  const filters: JobFilters = {
    title,
    query: title,
    location,
    remote,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    technologies,
    studioTypes,
    gameGenres,
    platforms,
    postedWithin,
    minMatchScore,
    limit,
  }

  // Remove undefined keys for cleanliness
  Object.keys(filters).forEach(
    k => (filters as any)[k] === undefined && delete (filters as any)[k]
  )
  return filters
}

/** Convenience: search directly from a query object (e.g., route.query) */
export async function searchJobsByQuery(
  query: Record<string, any> = {}
): Promise<JobSearchResult> {
  const filters = queryToJobFilters(query)
  return searchJobsUnified({ filters })
}
