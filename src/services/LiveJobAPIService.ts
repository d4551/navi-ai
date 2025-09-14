/**
 * Live Job API Service
 * 
 * Integrates with real job board APIs to fetch live job postings
 * Supports multiple job board APIs with fallback strategies
 */

import type { Job, JobFilters } from '@/shared/types/jobs'
import { logger } from '@/shared/utils/logger'

export interface JobAPIConfig {
  name: string
  baseUrl: string
  apiKey?: string
  headers?: Record<string, string>
  rateLimit: {
    requests: number
    period: number // milliseconds
  }
  priority: number
  enabled: boolean
  gamingFocus?: number // 0-1 relevance to gaming industry
}

export interface LiveJobAPIResponse {
  jobs: Job[]
  totalResults: number
  source: string
  fetchTime: Date
  nextPage?: string
  rateLimitRemaining?: number
}

export class LiveJobAPIService {
  private providers: Map<string, JobAPIConfig> = new Map()
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map()
  private cache: Map<string, { data: LiveJobAPIResponse; expiry: number }> = new Map()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Adzuna Jobs API - Free tier with real job data
    this.addProvider({
      name: 'adzuna',
      baseUrl: 'https://api.adzuna.com/v1/api/jobs',
      apiKey: process.env.VITE_ADZUNA_API_KEY,
      headers: {
        // Do not set User-Agent in browser; Adzuna API typically requires app_id/app_key params anyway
      },
      rateLimit: { requests: 100, period: 60 * 60 * 1000 }, // 100 per hour
      priority: 90,
      enabled: !!process.env.VITE_ADZUNA_API_KEY
    })

    // JSearch API (RapidAPI) - Aggregates multiple job boards
    this.addProvider({
      name: 'jsearch',
      baseUrl: 'https://jsearch.p.rapidapi.com',
      apiKey: process.env.VITE_RAPIDAPI_KEY,
      headers: {
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.VITE_RAPIDAPI_KEY || ''
      },
      rateLimit: { requests: 500, period: 60 * 60 * 1000 }, // 500 per hour  
      priority: 95,
      enabled: !!process.env.VITE_RAPIDAPI_KEY
    })

    // Reed.co.uk API - UK Jobs
    this.addProvider({
      name: 'reed',
      baseUrl: 'https://www.reed.co.uk/api/1.0/search',
      apiKey: process.env.VITE_REED_API_KEY,
      headers: {
        'Authorization': `Basic ${btoa((process.env.VITE_REED_API_KEY || '') + ':')}`
      },
      rateLimit: { requests: 1000, period: 60 * 60 * 1000 }, // 1000 per hour
      priority: 80,
      enabled: !!process.env.VITE_REED_API_KEY
    })

    // RemoteOK API - Remote jobs (no auth required)
    this.addProvider({
      name: 'remoteok',
      baseUrl: (import.meta as any).env?.DEV ? '/proxy/remoteok/api' : 'https://remoteok.io/api',
      rateLimit: { requests: 100, period: 60 * 60 * 1000 }, // 100 per hour
      priority: 85,
      enabled: true
    })

    // Arbeitnow API - European tech jobs (no auth)
    this.addProvider({
      name: 'arbeitnow',
      baseUrl: 'https://www.arbeitnow.com/api/job-board-api',
      rateLimit: { requests: 50, period: 60 * 60 * 1000 }, // 50 per hour
      priority: 75,
      enabled: true
    })

    // Remotive API - Remote jobs (no auth)
    this.addProvider({
      name: 'remotive',
      baseUrl: 'https://remotive.com/api/remote-jobs',
      rateLimit: { requests: 200, period: 60 * 60 * 1000 },
      priority: 83,
      enabled: true,
      gamingFocus: 0.4
    })

    logger.info(`Initialized ${this.providers.size} live job API providers`, {
      enabled: Array.from(this.providers.values()).filter(p => p.enabled).length,
      providers: Array.from(this.providers.keys())
    })
  }

  addProvider(config: JobAPIConfig) {
    this.providers.set(config.name, config)
  }

  async searchJobs(filters: JobFilters): Promise<LiveJobAPIResponse> {
    const cacheKey = this.generateCacheKey(filters)
    
    // Check cache first
    const cached = this.getCached(cacheKey)
    if (cached) {
      logger.debug('Returning cached job results', { cacheKey })
      return cached
    }

    const enabledProviders = Array.from(this.providers.values())
      .filter(p => p.enabled && this.canMakeRequest(p.name))
      .sort((a, b) => b.priority - a.priority)

    if (enabledProviders.length === 0) {
      logger.warn('No available job API providers')
      return {
        jobs: [],
        totalResults: 0,
        source: 'none',
        fetchTime: new Date()
      }
    }

    // Try providers in priority order
    for (const provider of enabledProviders) {
      try {
        const result = await this.fetchFromProvider(provider, filters)
        
        if (result.jobs.length > 0) {
          this.setCached(cacheKey, result)
          this.updateRateLimit(provider.name)
          logger.info(`Fetched ${result.jobs.length} jobs from ${provider.name}`)
          return result
        }
      } catch (error) {
        logger.error(`Failed to fetch from ${provider.name}:`, error)
        continue
      }
    }

    // Fallback: return empty results
    return {
      jobs: [],
      totalResults: 0,
      source: 'fallback',
      fetchTime: new Date()
    }
  }

  private async fetchFromProvider(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const startTime = Date.now()
    
    switch (provider.name) {
      case 'jsearch':
        return await this.fetchFromJSearch(provider, filters)
      case 'adzuna':
        return await this.fetchFromAdzuna(provider, filters)
      case 'reed':
        return await this.fetchFromReed(provider, filters)
      case 'remoteok':
        return await this.fetchFromRemoteOK(provider, filters)
      case 'arbeitnow':
        return await this.fetchFromArbeitnow(provider, filters)
      case 'remotive':
        return await this.fetchFromRemotive(provider, filters)
      default:
        throw new Error(`Unknown provider: ${provider.name}`)
    }
  }

  private async fetchFromJSearch(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams({
      query: filters.query || filters.title || 'software developer',
      page: '1',
      num_pages: '1',
      date_posted: 'week'
    })

    if (filters.location && filters.location !== 'remote') {
      params.set('location', filters.location)
    }

    if (filters.remote) {
      params.set('remote_jobs_only', 'true')
    }

    const url = `${provider.baseUrl}/search?${params}`
    
    const response = await fetch(url, {
      headers: provider.headers || {}
    })

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const jobs: Job[] = (data.data || []).map((job: any) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country,
      type: this.normalizeJobType(job.job_employment_type),
      remote: job.job_is_remote === true,
      description: job.job_description,
      url: job.job_apply_link,
      salary: this.formatSalary(job.job_salary_currency, job.job_min_salary, job.job_max_salary),
      postedDate: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
      source: 'JSearch',
      tags: this.extractTags(job.job_title, job.job_description),
      gamingRelevance: this.calculateGamingRelevance(job.job_title, job.job_description)
    }))

    return {
      jobs,
      totalResults: data.num_results || jobs.length,
      source: provider.name,
      fetchTime: new Date(),
      rateLimitRemaining: response.headers.get('x-ratelimit-remaining') ? 
        parseInt(response.headers.get('x-ratelimit-remaining')!) : undefined
    }
  }

  private async fetchFromAdzuna(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    // Adzuna requires app_id and app_key
    const appId = process.env.VITE_ADZUNA_APP_ID
    if (!appId || !provider.apiKey) {
      throw new Error('Adzuna API credentials not configured')
    }

    const country = 'us' // Could be made configurable
    const params = new URLSearchParams({
      app_id: appId,
      app_key: provider.apiKey,
      results_per_page: '50',
      what: filters.query || filters.title || 'software developer',
      content_type: 'application/json'
    })

    if (filters.location && filters.location !== 'remote') {
      params.set('where', filters.location)
    }

    const url = `${provider.baseUrl}/${country}/search/1?${params}`
    
    const response = await fetch(url, {
      headers: provider.headers || {}
    })

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const jobs: Job[] = (data.results || []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Unknown Location', 
      type: this.normalizeJobType(job.contract_type),
      remote: job.location?.display_name?.toLowerCase().includes('remote') || false,
      description: job.description,
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max ? 
        `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}` : undefined,
      postedDate: job.created ? new Date(job.created) : new Date(),
      source: 'Adzuna',
      tags: this.extractTags(job.title, job.description),
      gamingRelevance: this.calculateGamingRelevance(job.title, job.description)
    }))

    return {
      jobs,
      totalResults: data.count || jobs.length,
      source: provider.name,
      fetchTime: new Date()
    }
  }

  private async fetchFromReed(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams({
      keywords: filters.query || filters.title || 'software developer',
      resultsToTake: '50'
    })

    if (filters.location && filters.location !== 'remote') {
      params.set('locationName', filters.location)
    }

    const url = `${provider.baseUrl}?${params}`
    
    const response = await fetch(url, {
      headers: provider.headers || {}
    })

    if (!response.ok) {
      throw new Error(`Reed API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const jobs: Job[] = (data.results || []).map((job: any) => ({
      id: `reed-${job.jobId}`,
      title: job.jobTitle,
      company: job.employerName,
      location: job.locationName,
      type: this.normalizeJobType(job.jobType),
      remote: job.locationName?.toLowerCase().includes('remote') || false,
      description: job.jobDescription,
      url: job.jobUrl,
      salary: job.minimumSalary && job.maximumSalary ? 
        `£${job.minimumSalary} - £${job.maximumSalary}` : undefined,
      postedDate: job.date ? new Date(job.date) : new Date(),
      source: 'Reed.co.uk',
      tags: this.extractTags(job.jobTitle, job.jobDescription),
      gamingRelevance: this.calculateGamingRelevance(job.jobTitle, job.jobDescription)
    }))

    return {
      jobs,
      totalResults: data.totalResults || jobs.length,
      source: provider.name,
      fetchTime: new Date()
    }
  }

  private async fetchFromRemoteOK(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const response = await fetch(provider.baseUrl)

    if (!response.ok) {
      throw new Error(`RemoteOK API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // RemoteOK returns array with first item being metadata
    const jobsData = Array.isArray(data) ? data.slice(1) : []
    
    let filteredJobs = jobsData

    // Apply filters
    if (filters.query || filters.title) {
      const searchTerm = (filters.query || filters.title || '').toLowerCase()
      filteredJobs = filteredJobs.filter((job: any) =>
        job.position?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm) ||
        job.company?.toLowerCase().includes(searchTerm)
      )
    }

    const jobs: Job[] = filteredJobs.slice(0, 50).map((job: any) => ({
      id: `remoteok-${job.id}`,
      title: job.position,
      company: job.company,
      location: 'Remote',
      type: 'full-time' as const,
      remote: true,
      description: job.description,
      url: job.url || `https://remoteok.io/remote-jobs/${job.id}`,
      salary: job.salary_min && job.salary_max ? 
        `$${job.salary_min} - $${job.salary_max}` : undefined,
      postedDate: job.date ? new Date(job.date * 1000) : new Date(), // Unix timestamp
      source: 'RemoteOK',
      tags: job.tags || this.extractTags(job.position, job.description),
      gamingRelevance: this.calculateGamingRelevance(job.position, job.description)
    }))

    return {
      jobs,
      totalResults: filteredJobs.length,
      source: provider.name,
      fetchTime: new Date()
    }
  }

  private async fetchFromRemotive(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams()
    const search = filters.query || filters.title
    if (search) params.set('search', search)
    params.set('category', 'software-dev')

    const url = params.toString() ? `${provider.baseUrl}?${params}` : provider.baseUrl
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Remotive API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    const jobs: Job[] = (data.jobs || []).map((job: any) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      type: this.normalizeJobType(job.job_type),
      remote: true,
      description: job.description,
      url: job.url || job.job_url,
      salary: job.salary,
      postedDate: job.publication_date ? new Date(job.publication_date) : new Date(),
      source: 'Remotive',
      tags: Array.isArray(job.tags) ? job.tags : [],
      gamingRelevance: this.calculateGamingRelevance(job.title, job.description)
    }))

    let resultJobs = jobs
    if (filters.location && filters.location !== 'remote') {
      const q = filters.location.toLowerCase()
      resultJobs = resultJobs.filter(j => (j.location || '').toLowerCase().includes(q))
    }

    return {
      jobs: resultJobs,
      totalResults: resultJobs.length,
      source: provider.name,
      fetchTime: new Date()
    }
  }

  private async fetchFromArbeitnow(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams()
    
    if (filters.query || filters.title) {
      params.set('query', filters.query || filters.title || '')
    }

    const url = `${provider.baseUrl}${params.toString() ? `?${params}` : ''}`
    
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Arbeitnow API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const jobs: Job[] = (data.data || []).map((job: any) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || 'Europe',
      type: this.normalizeJobType(job.job_types?.[0]),
      remote: job.remote === true,
      description: job.description,
      url: job.url,
      postedDate: job.created_at ? new Date(job.created_at) : new Date(),
      source: 'Arbeitnow',
      tags: job.tags || this.extractTags(job.title, job.description),
      gamingRelevance: this.calculateGamingRelevance(job.title, job.description)
    }))

    return {
      jobs,
      totalResults: jobs.length,
      source: provider.name,
      fetchTime: new Date()
    }
  }

  private async fetchFromFindwork(provider: JobAPIConfig, filters: JobFilters): Promise<LiveJobAPIResponse> {
    const params = new URLSearchParams({
      source: 'findwork',
      search: filters.query || filters.title || 'developer'
    })

    if (filters.location && filters.location !== 'remote') {
      params.set('location', filters.location)
    }

    const url = `${provider.baseUrl}?${params}`
    
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`FindWork API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const jobs: Job[] = (data.results || []).map((job: any) => ({
      id: `findwork-${job.id}`,
      title: job.role,
      company: job.company_name,
      location: job.location,
      type: this.normalizeJobType(job.employment_type),
      remote: job.remote === true || job.location?.toLowerCase().includes('remote'),
      description: job.text,
      url: job.url,
      postedDate: job.date_posted ? new Date(job.date_posted) : new Date(),
      source: 'FindWork',
      tags: this.extractTags(job.role, job.text),
      gamingRelevance: this.calculateGamingRelevance(job.role, job.text)
    }))

    return {
      jobs,
      totalResults: jobs.length,
      source: provider.name,
      fetchTime: new Date()
    }
  }

  private normalizeJobType(type: string): 'full-time' | 'part-time' | 'contract' | 'internship' {
    if (!type) return 'full-time'
    
    const t = type.toLowerCase()
    if (t.includes('part')) return 'part-time'
    if (t.includes('contract') || t.includes('freelance') || t.includes('temporary')) return 'contract'
    if (t.includes('intern')) return 'internship'
    return 'full-time'
  }

  private formatSalary(currency?: string, min?: number, max?: number): string | undefined {
    if (!min && !max) return undefined
    
    const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'
    
    if (min && max) {
      return `${symbol}${Math.round(min)} - ${symbol}${Math.round(max)}`
    } else if (min) {
      return `${symbol}${Math.round(min)}+`
    } else if (max) {
      return `Up to ${symbol}${Math.round(max)}`
    }
    
    return undefined
  }

  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase()
    const commonTags = [
      'javascript', 'typescript', 'react', 'vue', 'angular', 'node',
      'python', 'java', 'c#', 'php', 'ruby', 'go', 'rust',
      'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql',
      'unity', 'unreal', 'game', 'gaming', 'esports', 'ai', 'ml'
    ]
    
    return commonTags.filter(tag => text.includes(tag))
  }

  private calculateGamingRelevance(title: string, description: string): number {
    const text = `${title} ${description}`.toLowerCase()
    const gamingKeywords = [
      'game', 'gaming', 'unity', 'unreal', 'esports', 'steam', 'xbox', 'playstation',
      'nintendo', 'mobile game', 'indie game', 'aaa', 'multiplayer', 'mmorpg'
    ]
    
    let relevance = 0
    gamingKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        relevance += 0.2
      }
    })
    
    return Math.min(relevance, 1.0)
  }

  private canMakeRequest(providerName: string): boolean {
    const provider = this.providers.get(providerName)
    if (!provider) return false
    
    const rateLimitData = this.requestCounts.get(providerName)
    if (!rateLimitData) return true
    
    const now = Date.now()
    
    // Reset if period has passed
    if (now >= rateLimitData.resetTime) {
      this.requestCounts.delete(providerName)
      return true
    }
    
    // Check if we're under the limit
    return rateLimitData.count < provider.rateLimit.requests
  }

  private updateRateLimit(providerName: string): void {
    const provider = this.providers.get(providerName)
    if (!provider) return
    
    const now = Date.now()
    const existing = this.requestCounts.get(providerName)
    
    if (!existing || now >= existing.resetTime) {
      this.requestCounts.set(providerName, {
        count: 1,
        resetTime: now + provider.rateLimit.period
      })
    } else {
      existing.count += 1
    }
  }

  private generateCacheKey(filters: JobFilters): string {
    const key = {
      query: filters.query,
      title: filters.title,
      location: filters.location,
      remote: filters.remote,
      limit: filters.limit
    }
    const json = JSON.stringify(key)
    // Browser-safe base64 encoding (handles Unicode)
    try {
      if (typeof btoa === 'function') {
        // Encode as UTF-8 before base64 to avoid Unicode issues
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - unescape is deprecated but fine for this narrow use
        const b64 = btoa(unescape(encodeURIComponent(json)))
        return `jobs-${b64}`
      }
    } catch {
      // Fall through to plain string key
    }
    // Fallback: use plain JSON as key (still deterministic)
    return `jobs-${json}`
  }

  private getCached(key: string): LiveJobAPIResponse | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCached(key: string, data: LiveJobAPIResponse): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION
    })
    
    // Clean up old entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  // Public methods for managing providers
  getProviders(): JobAPIConfig[] {
    return Array.from(this.providers.values())
  }

  enableProvider(name: string): void {
    const provider = this.providers.get(name)
    if (provider) {
      provider.enabled = true
      logger.info(`Enabled job provider: ${name}`)
    }
  }

  disableProvider(name: string): void {
    const provider = this.providers.get(name)
    if (provider) {
      provider.enabled = false
      logger.info(`Disabled job provider: ${name}`)
    }
  }

  getProviderStatus(): Record<string, { enabled: boolean; rateLimitRemaining: number }> {
    const status: Record<string, { enabled: boolean; rateLimitRemaining: number }> = {}
    
    for (const [name, provider] of this.providers) {
      const rateLimitData = this.requestCounts.get(name)
      const remaining = rateLimitData ? 
        Math.max(0, provider.rateLimit.requests - rateLimitData.count) : 
        provider.rateLimit.requests
        
      status[name] = {
        enabled: provider.enabled,
        rateLimitRemaining: remaining
      }
    }
    
    return status
  }

  clearCache(): void {
    this.cache.clear()
    logger.info('Cleared job API cache')
  }
}

// Export singleton instance
export const liveJobAPIService = new LiveJobAPIService()
export default liveJobAPIService
