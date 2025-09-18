/**
 * GAME JOB SERVICE
 * ================
 *
 * Comprehensive service for managing gaming industry job data
 * Features: Advanced search, AI matching, application tracking
 */

import { logger } from '@/shared/utils/logger'
import type {
  JobPosting,
  JobSearchQuery,
  JobSearchResult,
  JobApplication,
  ApplicationStatus,
  UserProfile,
  AIJobRecommendation,
  CompanyInfo,
} from '@/shared/types/database'

interface GameJobServiceConfig {
  apiBaseUrl: string
  apiKey?: string
  cacheTTL?: number
  enableAnalytics?: boolean
}

export class GameJobService {
  private static instance: GameJobService
  private config: GameJobServiceConfig
  private cache = new Map<string, { data: any; expiry: number }>()

  private constructor(config: GameJobServiceConfig) {
    this.config = {
      cacheTTL: 5 * 60 * 1000, // 5 minutes default
      enableAnalytics: true,
      ...config,
    }
  }

  static getInstance(config?: GameJobServiceConfig): GameJobService {
    if (!GameJobService.instance) {
      if (!config) {
        throw new Error(
          'GameJobService requires configuration on first initialization'
        )
      }
      GameJobService.instance = new GameJobService(config)
    }
    return GameJobService.instance
  }

  /**
   * Search for gaming jobs with advanced filtering
   */
  async searchJobs(query: JobSearchQuery): Promise<JobSearchResult> {
    try {
      const cacheKey = `search-${JSON.stringify(query)}`
      const cached = this.getFromCache<JobSearchResult>(cacheKey)

      if (cached) {
        return cached
      }

      logger.info('[GameJobService] Searching jobs', { query })

      const response = await this.makeRequest('/jobs/search', {
        method: 'POST',
        body: JSON.stringify(query),
      })

      const result: JobSearchResult = await response.json()

      // Cache the results
      this.setCache(cacheKey, result)

      // Track search analytics
      if (this.config.enableAnalytics) {
        this.trackSearchAnalytics(query, result)
      }

      return result
    } catch (error: any) {
      logger.error('[GameJobService] Failed to search jobs:', error)
      throw new Error(`Job search failed: ${error?.message || 'Unknown error'}`)
    }
  }

  /**
   * Get job details by ID
   */
  async getJobById(jobId: string): Promise<JobPosting | null> {
    try {
      const cacheKey = `job-${jobId}`
      const cached = this.getFromCache<JobPosting>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.makeRequest(`/jobs/${jobId}`)

      if (response.status === 404) {
        return null
      }

      const job: JobPosting = await response.json()
      this.setCache(cacheKey, job)

      return job
    } catch (error) {
      logger.error('[GameJobService] Failed to get job:', error)
      return null
    }
  }

  /**
   * Get recommended jobs based on user profile
   */
  async getRecommendedJobs(
    userId: string,
    limit: number = 20
  ): Promise<AIJobRecommendation[]> {
    try {
      const cacheKey = `recommendations-${userId}-${limit}`
      const cached = this.getFromCache<AIJobRecommendation[]>(cacheKey)

      if (cached) {
        return cached
      }

      logger.info('[GameJobService] Getting AI recommendations', {
        userId,
        limit,
      })

      const response = await this.makeRequest(
        `/users/${userId}/recommendations`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const recommendations: AIJobRecommendation[] = await response.json()

      // Cache for shorter time due to personalization
      this.setCache(cacheKey, recommendations, 2 * 60 * 1000) // 2 minutes

      return recommendations
    } catch (error) {
      logger.error('[GameJobService] Failed to get recommendations:', error)
      return []
    }
  }

  /**
   * Apply to a job
   */
  async applyToJob(
    jobId: string,
    userId: string,
    applicationData: Partial<JobApplication>
  ): Promise<JobApplication> {
    try {
      logger.info('[GameJobService] Applying to job', { jobId, userId })

      const response = await this.makeRequest(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          ...applicationData,
        }),
      })

      const application: JobApplication = await response.json()

      // Clear relevant caches
      this.clearCachePattern(`user-applications-${userId}`)
      this.clearCachePattern(`job-${jobId}`)

      return application
    } catch (error: any) {
      logger.error('[GameJobService] Failed to apply to job:', error)
      throw new Error(
        `Job application failed: ${error?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Get user's job applications
   */
  async getUserApplications(
    userId: string,
    status?: ApplicationStatus
  ): Promise<JobApplication[]> {
    try {
      const cacheKey = `user-applications-${userId}${status ? `-${status}` : ''}`
      const cached = this.getFromCache<JobApplication[]>(cacheKey)

      if (cached) {
        return cached
      }

      const queryParams = new URLSearchParams()
      if (status) {
        queryParams.append('status', status)
      }

      const response = await this.makeRequest(
        `/users/${userId}/applications?${queryParams.toString()}`
      )

      const applications: JobApplication[] = await response.json()
      this.setCache(cacheKey, applications)

      return applications
    } catch (error) {
      logger.error('[GameJobService] Failed to get user applications:', error)
      return []
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string
  ): Promise<JobApplication> {
    try {
      logger.info('[GameJobService] Updating application status', {
        applicationId,
        status,
      })

      const response = await this.makeRequest(
        `/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, note }),
        }
      )

      const application: JobApplication = await response.json()

      // Clear relevant caches
      this.clearCachePattern(`user-applications-${application.userId}`)
      this.clearCachePattern(`application-${applicationId}`)

      return application
    } catch (error) {
      logger.error(
        '[GameJobService] Failed to update application status:',
        error
      )
      throw error
    }
  }

  /**
   * Save/bookmark a job
   */
  async toggleJobSave(
    jobId: string,
    userId: string,
    save: boolean
  ): Promise<void> {
    try {
      const method = save ? 'POST' : 'DELETE'
      const response = await this.makeRequest(
        `/users/${userId}/saved-jobs/${jobId}`,
        {
          method,
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to ${save ? 'save' : 'unsave'} job`)
      }

      // Clear saved jobs cache
      this.clearCachePattern(`saved-jobs-${userId}`)
    } catch (error) {
      logger.error('[GameJobService] Failed to toggle job save:', error)
      throw error
    }
  }

  /**
   * Get user's saved jobs
   */
  async getSavedJobs(userId: string): Promise<JobPosting[]> {
    try {
      const cacheKey = `saved-jobs-${userId}`
      const cached = this.getFromCache<JobPosting[]>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.makeRequest(`/users/${userId}/saved-jobs`)
      const savedJobs: JobPosting[] = await response.json()

      this.setCache(cacheKey, savedJobs)
      return savedJobs
    } catch (error) {
      logger.error('[GameJobService] Failed to get saved jobs:', error)
      return []
    }
  }

  /**
   * Get trending skills in gaming industry
   */
  async getTrendingSkills(
    category?: 'programming' | 'art' | 'design' | 'audio' | 'production'
  ): Promise<{ skill: string; demand: number; growth: number }[]> {
    try {
      const cacheKey = `trending-skills${category ? `-${category}` : ''}`
      const cached = this.getFromCache<any[]>(cacheKey)

      if (cached) {
        return cached
      }

      const queryParams = new URLSearchParams()
      if (category) {
        queryParams.append('category', category)
      }

      const response = await this.makeRequest(
        `/analytics/trending-skills?${queryParams.toString()}`
      )

      const trendingSkills = await response.json()

      // Cache for longer time as trends don't change frequently
      this.setCache(cacheKey, trendingSkills, 24 * 60 * 60 * 1000) // 24 hours

      return trendingSkills
    } catch (error) {
      logger.error('[GameJobService] Failed to get trending skills:', error)
      return []
    }
  }

  /**
   * Get company information
   */
  async getCompany(companyId: string): Promise<CompanyInfo | null> {
    try {
      const cacheKey = `company-${companyId}`
      const cached = this.getFromCache<CompanyInfo>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.makeRequest(`/companies/${companyId}`)

      if (response.status === 404) {
        return null
      }

      const company: CompanyInfo = await response.json()

      // Cache company data for longer time
      this.setCache(cacheKey, company, 60 * 60 * 1000) // 1 hour

      return company
    } catch (error) {
      logger.error('[GameJobService] Failed to get company:', error)
      return null
    }
  }

  /**
   * Search companies
   */
  async searchCompanies(query: {
    name?: string
    size?: string[]
    type?: string[]
    location?: string
    platforms?: string[]
    limit?: number
  }): Promise<CompanyInfo[]> {
    try {
      const cacheKey = `company-search-${JSON.stringify(query)}`
      const cached = this.getFromCache<CompanyInfo[]>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.makeRequest('/companies/search', {
        method: 'POST',
        body: JSON.stringify(query),
      })

      const companies: CompanyInfo[] = await response.json()
      this.setCache(cacheKey, companies)

      return companies
    } catch (error) {
      logger.error('[GameJobService] Failed to search companies:', error)
      return []
    }
  }

  /**
   * Get salary insights for a role/location
   */
  async getSalaryInsights(params: {
    role: string
    location?: string
    experienceLevel?: string
    companySize?: string
  }): Promise<{
    median: number
    p25: number
    p75: number
    currency: string
    sampleSize: number
    trends?: { period: string; value: number }[]
  } | null> {
    try {
      const cacheKey = `salary-insights-${JSON.stringify(params)}`
      const cached = this.getFromCache<any>(cacheKey)

      if (cached) {
        return cached
      }

      const queryParams = new URLSearchParams(params as any)
      const response = await this.makeRequest(
        `/analytics/salary-insights?${queryParams.toString()}`
      )

      if (response.status === 404) {
        return null
      }

      const insights = await response.json()

      // Cache salary data for moderate time
      this.setCache(cacheKey, insights, 12 * 60 * 60 * 1000) // 12 hours

      return insights
    } catch (error) {
      logger.error('[GameJobService] Failed to get salary insights:', error)
      return null
    }
  }

  /**
   * Report a job (spam, inappropriate, etc.)
   */
  async reportJob(
    jobId: string,
    reason: 'spam' | 'inappropriate' | 'misleading' | 'duplicate' | 'other',
    details?: string
  ): Promise<void> {
    try {
      await this.makeRequest(`/jobs/${jobId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason, details }),
      })

      logger.info('[GameJobService] Job reported', { jobId, reason })
    } catch (error) {
      logger.error('[GameJobService] Failed to report job:', error)
      throw error
    }
  }

  /**
   * Get job application analytics for user
   */
  async getApplicationAnalytics(userId: string): Promise<{
    totalApplications: number
    responseRate: number
    interviewRate: number
    offerRate: number
    averageResponseTime: number
    topSkillsRequested: string[]
    applicationTrends: { date: string; count: number }[]
  }> {
    try {
      const cacheKey = `app-analytics-${userId}`
      const cached = this.getFromCache<any>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.makeRequest(
        `/users/${userId}/analytics/applications`
      )
      const analytics = await response.json()

      // Cache analytics for moderate time
      this.setCache(cacheKey, analytics, 30 * 60 * 1000) // 30 minutes

      return analytics
    } catch (error) {
      logger.error(
        '[GameJobService] Failed to get application analytics:',
        error
      )
      throw error
    }
  }

  // === PRIVATE HELPER METHODS ===

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.config.apiBaseUrl}${endpoint}`

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(this.config.apiKey && {
        Authorization: `Bearer ${this.config.apiKey}`,
      }),
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return response
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T
    }

    if (cached) {
      this.cache.delete(key)
    }

    return null
  }

  private setCache(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.cacheTTL!)
    this.cache.set(key, { data, expiry })
  }

  private clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  private trackSearchAnalytics(
    query: JobSearchQuery,
    result: JobSearchResult
  ): void {
    // Track search metrics for analytics
    try {
      const analyticsData = {
        query: {
          keywords: query.keywords,
          location: query.location,
          remote: query.remote,
          filters: Object.keys(query).filter(
            key =>
              query[key as keyof JobSearchQuery] !== undefined &&
              key !== 'keywords' &&
              key !== 'location'
          ),
        },
        results: {
          total: result.total,
          returned: result.jobs.length,
        },
        timestamp: new Date().toISOString(),
      }

      // In a real implementation, send to analytics service
      logger.debug('[GameJobService] Search analytics', analyticsData)
    } catch (error) {
      logger.error('[GameJobService] Failed to track search analytics:', error)
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size,
      // Hit rate would require tracking hits/misses
    }
  }
}
