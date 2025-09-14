/**
 * Live API Meta Provider
 *
 * Wraps the existing LiveJobAPIService as a single provider so it can
 * participate in the canonical provider registry without maintaining
 * a separate parallel pipeline.
 */

import type { JobProvider, JobFilters } from './JobProviderInterface'
import type { Job } from '@/shared/types/jobs'
import { liveJobAPIService } from '../LiveJobAPIService'

export class LiveAPIMetaProvider implements JobProvider {
  name = 'live-api'
  displayName = 'Live API Aggregator'
  description = 'Aggregates multiple live job APIs (RemoteOK, Remotive, etc.)'
  enabled = true
  // Keep priority low-numbered so it participates early, but after gaming-specific tweaks if any
  priority = 80
  requiresAuth = false
  apiKey?: string
  baseUrl = 'internal:live-aggregator'
  rateLimit = { requests: 60, period: 60 * 60 * 1000 }

  config = {
    icon: 'mdi-rocket-launch',
    color: '#38BDF8',
    gamingFocus: 0.4,
    maxResults: 50
  }

  buildParams(filters: JobFilters): Record<string, any> {
    // Live service already accepts canonical filters; pass through
    return { ...filters }
  }

  parseResponse(data: any): Job[] {
    // Not directly used; fetchJobs returns normalized jobs already
    return Array.isArray(data) ? (data as Job[]) : []
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const res = await liveJobAPIService.searchJobs(filters)
    // Cap result size for fairness among providers
    const limit = Number(filters.limit || this.config.maxResults) || 50
    return (res.jobs || []).slice(0, limit)
  }
}

export function createLiveAPIProvider() {
  return new LiveAPIMetaProvider()
}

