/**
 * Job Provider Interface and Registry System
 * Pluggable architecture for job data sources
 */

import axios, { AxiosResponse } from 'axios'
import { logger } from '@/shared/utils/logger'
import { XMLParser } from 'fast-xml-parser'
import type { Job, JobFilters } from '@/shared/types/jobs'

// Re-export for convenience
export type { JobFilters }

export interface JobProvider {
  name: string
  displayName?: string
  description?: string
  baseUrl: string
  rateLimit: number | { requests: number; period: number }
  enabled: boolean
  requiresAuth?: boolean
  priority: number
  apiKey?: string
  config?: Record<string, any>

  fetchJobs(_filters: JobFilters): Promise<Job[]>
  buildParams(_filters: JobFilters): Record<string, any>
  parseResponse(_data: any): Job[]
}

export interface CompanyBoardConfig {
  name: string
  token: string
  type: 'greenhouse' | 'lever' | 'recruitee' | 'workable' | 'ashby' | 'smartrecruiters' | 'teamtailor' | 'workday'
}

export interface RateLimiter {
  canMakeRequest(_provider: string): boolean
  recordRequest(_provider: string): void
  getRemainingRequests(_provider: string): number
}

export class SimpleRateLimiter implements RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  private readonly windowMs = 60 * 1000 // 1 minute window

  canMakeRequest(provider: string): boolean {
    const now = Date.now()
    const record = this.requests.get(provider)

    if (!record || now > record.resetTime) {
      return true
    }

    return record.count < 15 // Max 15 requests per minute per provider (increased for better performance)
  }

  recordRequest(provider: string): void {
    const now = Date.now()
    const record = this.requests.get(provider)

    if (!record || now > record.resetTime) {
      this.requests.set(provider, { count: 1, resetTime: now + this.windowMs })
    } else {
      record.count++
    }
  }

  getRemainingRequests(provider: string): number {
    const record = this.requests.get(provider)
    if (!record) return 10

    const now = Date.now()
    if (now > record.resetTime) return 10

    return Math.max(0, 10 - record.count)
  }
}

export class JobProviderRegistry {
  private providers = new Map<string, JobProvider>()
  private rateLimiter: RateLimiter
  private concurrencyLimit = 20
  private activeRequests = 0

  constructor(rateLimiter: RateLimiter = new SimpleRateLimiter()) {
    this.rateLimiter = rateLimiter
  }

  register(provider: JobProvider): void {
    this.providers.set(provider.name, provider)
  }

  unregister(name: string): void {
    this.providers.delete(name)
  }

  getProvider(name: string): JobProvider | undefined {
    return this.providers.get(name)
  }

  getAllProviders(): JobProvider[] {
    return Array.from(this.providers.values())
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority)
  }

  async fetchFromProvider(providerName: string, filters: JobFilters): Promise<Job[]> {
    const provider = this.providers.get(providerName)
    if (!provider || !provider.enabled) {
      return []
    }

    if (!this.rateLimiter.canMakeRequest(providerName)) {
      logger.info(`Rate limit exceeded for ${providerName}`, undefined, 'JobProviderRegistry')
      return []
    }

    if (this.activeRequests >= this.concurrencyLimit) {
      logger.info(`Concurrency limit reached (${this.activeRequests}/${this.concurrencyLimit}), skipping ${providerName}`, undefined, 'JobProviderRegistry')
      return []
    }

    this.activeRequests++
    this.rateLimiter.recordRequest(providerName)

    try {
      return await provider.fetchJobs(filters)
    } catch (error: any) {
      // Handle common API issues more gracefully
      const errorMessage = error?.message || ''
      const statusCode = error?.response?.status
      
      if (statusCode === 404 || statusCode === 403 || statusCode === 410) {
        // API endpoints that are no longer available - log as info
        logger.info(`Provider ${providerName} endpoint not accessible (${statusCode})`, undefined, 'JobProviderRegistry')
      } else if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin') || error?.code === 'ERR_FAILED') {
        // CORS errors - common in browser environments
        logger.info(`CORS error for ${providerName} - may require server-side proxy`, undefined, 'JobProviderRegistry')
      } else if (errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
        // Network connectivity issues
        logger.info(`Network timeout for ${providerName} - service may be temporarily unavailable`, undefined, 'JobProviderRegistry')
      } else {
        // Only log unexpected errors as actual errors
        logger.error(`Unexpected error fetching from ${providerName}:`, error, 'JobProviderRegistry')
      }
      
      return []
    } finally {
      this.activeRequests--
    }
  }

  async fetchFromAllProviders(filters: JobFilters): Promise<{ jobs: Job[]; sources: string[] }> {
    const providers = this.getAllProviders()
    const results = await Promise.allSettled(
      providers.map(provider => this.fetchFromProvider(provider.name, filters))
    )

    const jobs: Job[] = []
    const sources: string[] = []

    results.forEach((result, index) => {
      const provider = providers[index]
      if (result.status === 'fulfilled' && result.value.length > 0) {
        jobs.push(...result.value)
        sources.push(provider.name)
      }
    })

    return { jobs, sources }
  }
}

// Base provider class with common functionality
export abstract class BaseJobProvider implements JobProvider {
  abstract name: string
  displayName?: string
  description?: string
  abstract baseUrl: string
  abstract rateLimit: number | { requests: number; period: number }
  abstract enabled: boolean
  requiresAuth?: boolean
  abstract priority: number
  apiKey?: string
  config?: Record<string, any>

  protected httpClient = axios.create({
    timeout: 30000,
    // Do not set forbidden headers like User-Agent in browsers
    // Add server-only headers in a server context if needed.
  })

  protected xmlParser = new XMLParser({ ignoreAttributes: false })

  abstract buildParams(_filters: JobFilters): Record<string, any>
  abstract parseResponse(_data: any): Job[]

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const params = this.buildParams(filters)
      const response = await this.makeRequest(params).catch(() => undefined as any)
      const data = response && typeof response === 'object' ? (response as any).data : undefined
      return this.parseResponse(data)
    } catch {
      // As a defensive fallback, return empty array so the registry can proceed.
      return []
    }
  }

  protected async makeRequest(params: Record<string, any>): Promise<AxiosResponse> {
    return this.httpClient.get(this.baseUrl, { params })
  }

  public parseSalary(salaryText: string | any): { min: number; max: number } | undefined {
    if (!salaryText) return undefined

    if (typeof salaryText === 'object' && salaryText.min && salaryText.max) {
      return { min: salaryText.min, max: salaryText.max }
    }

    const text = String(salaryText).toLowerCase()
    const numbers = text.match(/\d{1,3}(?:,\d{3})*k?/g)

    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0].replace(/[,k]/g, ''))
      const max = parseInt(numbers[1].replace(/[,k]/g, ''))
      return {
        min: numbers[0].includes('k') ? min * 1000 : min,
        max: numbers[1].includes('k') ? max * 1000 : max
      }
    }

    return undefined
  }

  public parseRequirements(description: string): string[] {
    const requirements: string[] = []

    const reqSection = description.match(/requirements?:?\s*(.*?)(?:\n\n|\n[A-Z]|$)/is)
    if (reqSection) {
      const lines = reqSection[1].split(/\n+|\*\s*/)
      requirements.push(...lines
        .map(line => line.trim())
        .filter(line => line.length > 10 && line.length < 100)
        .slice(0, 5))
    }

    return requirements
  }

  public extractTechnologies(description: string): string[] {
    const techKeywords = [
      'Unity', 'Unreal Engine', 'C++', 'C#', 'Python', 'JavaScript',
      'Blender', 'Maya', 'Photoshop', 'Git', 'Perforce', 'JIRA'
    ]

    const descriptionLower = description.toLowerCase()
    return techKeywords.filter(tech =>
      descriptionLower.includes(tech.toLowerCase())
    )
  }

  public mapExperienceLevel(level: string | undefined): string {
    if (!level) return 'mid'

    const levelLower = level.toLowerCase()

    if (levelLower.includes('entry') || levelLower.includes('junior') || levelLower.includes('0-2')) {
      return 'entry'
    }

    if (levelLower.includes('senior') || levelLower.includes('5+')) {
      return 'senior'
    }

    if (levelLower.includes('lead') || levelLower.includes('principal') || levelLower.includes('director')) {
      return 'lead'
    }

    return 'mid'
  }
}
