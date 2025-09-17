/**
 * Refactored Job API Service using Provider Registry
 * This replaces the monolithic switch-based approach with a pluggable provider system
 */

import {
  JobProviderRegistry,
  SimpleRateLimiter,
  JobProvider,
} from './providers/JobProviderInterface'
import { COMPANY_BOARDS } from './providers/companyBoards'
import {
  createCompanyBoardProviders,
  CompanyBoardProvider,
} from './providers/CompanyBoardProvider'
import { createAdditionalProviders } from './providers/AdditionalProviders'
import { createOpenSourceJobProviders } from './providers/OpenSourceJobProviders'
import { createLiveAPIProvider } from './providers/LiveAPIProvider'
import { createGamingJobProviders } from './providers/GamingJobProviders'
import {
  CareerOneStopProvider,
  NHSJobsProvider,
  UKApprenticeshipsProvider,
  NYCJobsProvider,
  DOLSeasonalJobsProvider,
  BundesagenturProvider,
  WorkNetProvider,
} from './providers/GovDataProviders'
import type { Job, JobFilters } from '@/shared/types/jobs'
import { gameStudioService } from './GameStudioService'
import type { GameStudio } from '@/shared/types/jobs'
import { logger } from '@/shared/utils/logger'
import { providerHealthDashboard } from './ProviderHealthDashboard'

interface JobAggregationResult {
  jobs: Job[]
  sources: string[]
  totalFound: number
  errors: string[]
  processingTime: number
}

export class RefactoredJobAPIService {
  private registry: JobProviderRegistry
  private readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
  private cache = new Map<
    string,
    { data: JobAggregationResult; expiry: number }
  >()
  private companyProviderNames = new Set<string>()
  private readonly DISABLED_COMPANY_BOARDS_KEY = 'navi-disabled-company-boards'

  constructor() {
    this.registry = new JobProviderRegistry(new SimpleRateLimiter())
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Add government and open data providers (lowest priority - foundational)
    this.registry.register(new CareerOneStopProvider())
    this.registry.register(new NHSJobsProvider())
    this.registry.register(new UKApprenticeshipsProvider())
    this.registry.register(new NYCJobsProvider())
    this.registry.register(new DOLSeasonalJobsProvider())
    this.registry.register(new BundesagenturProvider())
    this.registry.register(new WorkNetProvider())

    // Add open source job board providers (medium priority - broader reach)
    const openSourceProviders = createOpenSourceJobProviders()
    openSourceProviders.forEach(provider => {
      this.registry.register(provider)
    })

    // Add the Live API meta provider (wraps legacy LiveJobAPIService)
    // Registered with an early priority to ensure it participates within the
    // initial concurrency window while leaving room for gaming-specific sources.
    try {
      const liveProvider = createLiveAPIProvider()
      this.registry.register(liveProvider)
    } catch {
      /* non-fatal */
    }

    // Add gaming-specific providers (highest priority - most relevant)
    const gamingProviders = createGamingJobProviders()
    gamingProviders.forEach(provider => {
      this.registry.register(provider)
    })

    // Add additional providers (configurable priority)
    const additionalProviders = createAdditionalProviders()
    additionalProviders.forEach(provider => {
      this.registry.register(provider)
    })

    // Add company board providers (can be configured via env or config)
    const companyConfigs = this.loadCompanyBoardConfigs()
    const companyProviders = createCompanyBoardProviders(companyConfigs)
    companyProviders.forEach(provider => {
      this.registry.register(provider)
      this.companyProviderNames.add(provider.name)
    })

    // Verify company providers in the background and auto-disable 404
    this.verifyCompanyProviders(companyProviders).catch(() => {})

    logger.info(
      `Initialized ${this.registry.getAllProviders().length} job providers`,
      {
        gaming: gamingProviders.length,
        openSource: openSourceProviders.length,
        government: 7,
        additional: additionalProviders.length,
        company: companyProviders.length,
      },
      'RefactoredJobAPIService'
    )
  }

  private loadCompanyBoardConfigs() {
    // Load static company board configs and merge with user-defined overrides from localStorage
    const base = Array.isArray(COMPANY_BOARDS) ? COMPANY_BOARDS : []
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('navi-company-boards')
        if (raw) {
          const userBoards = JSON.parse(raw)
          if (Array.isArray(userBoards)) {
            const merged = [
              ...base,
              ...userBoards.filter(b => b && b.name && b.token && b.type),
            ]
            // Filter out disabled boards
            const disabled = this.getDisabledCompanyBoards()
            if (disabled.length) {
              return merged.filter(
                c =>
                  !disabled.some(d => d.type === c.type && d.token === c.token)
              )
            }
            return merged
          }
        }
      }
    } catch {}
    // Apply disabled filter to base as well
    const disabled = this.getDisabledCompanyBoards()
    if (disabled.length) {
      return base.filter(
        c => !disabled.some(d => d.type === c.type && d.token === c.token)
      )
    }
    return base
  }

  private getDisabledCompanyBoards(): Array<{ type: string; token: string }> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(
          this.DISABLED_COMPANY_BOARDS_KEY
        )
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed))
            return parsed.filter(x => x && x.type && x.token)
        }
      }
    } catch {}
    return []
  }

  private saveDisabledCompanyBoards(
    list: Array<{ type: string; token: string }>
  ) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          this.DISABLED_COMPANY_BOARDS_KEY,
          JSON.stringify(list)
        )
      }
    } catch {}
  }

  private async verifyCompanyProviders(
    providers: CompanyBoardProvider[]
  ): Promise<void> {
    const disabled = this.getDisabledCompanyBoards()
    const set = new Set(disabled.map(d => `${d.type}:${d.token}`))

    const checks = providers.map(async p => {
      const providerKey = `${p.config.type}:${p.config.token}`
      const startTime = Date.now()

      try {
        const ok = await p.verifyAvailability()
        const responseTime = Date.now() - startTime

        // Update health dashboard
        providerHealthDashboard.updateProviderHealth(providerKey, {
          success: ok,
          responseTime,
          error: ok ? undefined : 'Provider verification failed',
        })

        if (!ok) {
          // Track failure
          p.enabled = false
          if (!set.has(providerKey)) {
            set.add(providerKey)
            logger.warn(
              `Provider ${p.name} disabled after verification failure`,
              {
                provider: p.name,
                type: p.config.type,
                responseTime,
              }
            )
          }
        } else {
          // Re-enable if it was disabled due to temporary issues
          if (set.has(providerKey)) {
            set.delete(providerKey)
            p.enabled = true
            logger.info(
              `Provider ${p.name} re-enabled after successful verification`
            )
          }
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        logger.error(`Provider verification failed for ${p.name}:`, error)

        // Update health dashboard with error
        providerHealthDashboard.updateProviderHealth(providerKey, {
          success: false,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        p.enabled = false
        set.add(providerKey)
      }
    })

    await Promise.allSettled(checks)
    const list = Array.from(set).map(s => ({
      type: s.split(':')[0],
      token: s.split(':')[1],
    }))
    this.saveDisabledCompanyBoards(list)
  }

  // Replace registered company board providers at runtime and persist configs
  reloadCompanyProviders(
    configs: Array<{ name: string; token: string; type: string }>
  ): void {
    // Unregister previous company providers
    for (const name of this.companyProviderNames) {
      this.registry.unregister(name)
    }
    this.companyProviderNames.clear()

    // Register new providers
    const providers = createCompanyBoardProviders((configs || []) as any)
    providers.forEach(p => {
      this.registry.register(p)
      this.companyProviderNames.add(p.name)
    })

    // Re-verify newly registered providers and persist disabled list
    this.verifyCompanyProviders(providers).catch(() => {})

    // Persist configs
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          'navi-company-boards',
          JSON.stringify(configs || [])
        )
      }
    } catch {}
  }

  async searchJobs(filters: JobFilters): Promise<JobAggregationResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(filters)

    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Fetch from all enabled providers concurrently
      const { jobs, sources } =
        await this.registry.fetchFromAllProviders(filters)

      // Deduplicate and enhance jobs
      const uniqueJobs = this.deduplicateJobs(jobs)
      const enhancedJobs = await this.enhanceJobData(uniqueJobs)

      const result: JobAggregationResult = {
        jobs: enhancedJobs,
        sources,
        totalFound: enhancedJobs.length,
        errors: [], // Registry handles errors internally
        processingTime: Date.now() - startTime,
      }

      // Cache results
      this.setCache(cacheKey, result)

      return result
    } catch (error) {
      logger.error('Error in job search:', error, 'RefactoredJobAPIService')
      return {
        jobs: [],
        sources: [],
        totalFound: 0,
        errors: [
          `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        processingTime: Date.now() - startTime,
      }
    }
  }

  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>()
    const unique: Job[] = []

    for (const job of jobs) {
      const key = this.generateJobKey(job)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(job)
      }
    }

    return unique
  }

  private async enhanceJobData(jobs: Job[]): Promise<Job[]> {
    const enhanced: Job[] = []
    for (const job of jobs) {
      let studioType: any = this.identifyStudioType(job.company)
      let gameGenres: any = this.identifyGameGenres(job.description || '')
      let platforms: any = this.identifyPlatforms(job.description || '')
      let studioId: string | undefined
      let studioSlug: string | undefined

      try {
        const studio = await gameStudioService.findByCompanyName(job.company)
        if (studio) {
          studioId = studio.id
          studioSlug =
            (studio as any).slug ||
            studio.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          studioType = studio.type || studioType
          // Prefer authoritative data from the studio DB
          if (Array.isArray(studio.genres) && studio.genres.length) {
            gameGenres = studio.genres
          }
          if (Array.isArray(studio.platforms) && studio.platforms.length) {
            platforms = studio.platforms
          }
        }
      } catch {
        /* non-fatal */
      }

      enhanced.push({
        ...job,
        studioId,
        studioSlug,
        studioType,
        gameGenres: gameGenres as any,
        platforms: platforms as any,
        // Match score will be calculated by JobMatchingService when needed
        matchScore: (job as any).matchScore,
      })
    }
    return enhanced
  }

  private identifyStudioType(
    company: string
  ): 'AAA' | 'Mobile' | 'Indie' | 'Unknown' {
    const companyLower = company.toLowerCase()

    const aaaStudios = [
      'epic games',
      'blizzard',
      'valve',
      'riot games',
      'sony',
      'microsoft',
      'nintendo',
      'activision',
    ]
    if (aaaStudios.some(studio => companyLower.includes(studio))) {
      return 'AAA'
    }

    const mobileStudios = ['king', 'supercell', 'rovio', 'zynga']
    if (mobileStudios.some(studio => companyLower.includes(studio))) {
      return 'Mobile'
    }

    if (
      companyLower.includes('indie') ||
      companyLower.includes('independent')
    ) {
      return 'Indie'
    }

    return 'Unknown'
  }

  private identifyGameGenres(description: string): string[] {
    const genres = [
      'RPG',
      'FPS',
      'Strategy',
      'Puzzle',
      'Action',
      'Racing',
      'Sports',
      'Horror',
    ]
    const descriptionLower = description.toLowerCase()
    return genres.filter(genre =>
      descriptionLower.includes(genre.toLowerCase())
    )
  }

  private identifyPlatforms(description: string): string[] {
    const platforms = [
      'PC',
      'Console',
      'Mobile',
      'VR',
      'AR',
      'Web',
      'Switch',
      'PlayStation',
      'Xbox',
    ]
    const descriptionLower = description.toLowerCase()
    return platforms.filter(platform =>
      descriptionLower.includes(platform.toLowerCase())
    )
  }

  private generateCacheKey(filters: JobFilters): string {
    return JSON.stringify(filters)
  }

  private getFromCache(key: string): JobAggregationResult | null {
    const cached = this.cache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: JobAggregationResult): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    })
  }

  // Expose a way to clear cached search results (used by UI refresh controls)
  clearCache(): void {
    this.cache.clear()
  }

  private generateJobKey(job: Job): string {
    return `${job.company.toLowerCase()}-${job.title.toLowerCase()}-${job.location.toLowerCase()}`.replace(
      /[^a-z0-9-]/g,
      ''
    )
  }

  // Provider management methods
  addProvider(provider: JobProvider): void {
    this.registry.register(provider)
  }

  removeProvider(name: string): void {
    this.registry.unregister(name)
  }

  getProvider(name: string): JobProvider | undefined {
    return this.registry.getProvider(name)
  }

  getAllProviders(): JobProvider[] {
    return this.registry.getAllProviders()
  }

  // Report basic provider status for settings/diagnostics UIs
  getProviderStatus(): Array<{
    name: string
    enabled: boolean
    priority: number
  }> {
    return this.registry.getAllProviders().map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
    }))
  }

  // Update provider configuration (enable/disable, priority, apiKey, custom config)
  updateProviderConfig(name: string, config: Partial<JobProvider>): boolean {
    const provider = this.registry.getProvider(name)
    if (!provider) return false

    if (typeof config.enabled === 'boolean') provider.enabled = config.enabled
    if (typeof config.priority === 'number') provider.priority = config.priority
    if (typeof config.apiKey === 'string') provider.apiKey = config.apiKey
    if (config.config && typeof config.config === 'object') {
      provider.config = { ...(provider.config || {}), ...config.config }
    }
    return true
  }

  // Health check for all providers
  async checkProviderHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}
    const providers = this.registry.getAllProviders()

    for (const provider of providers) {
      try {
        // Simple health check - try to fetch with empty filters
        await provider.fetchJobs({})
        health[provider.name] = true
      } catch {
        health[provider.name] = false
      }
    }

    return health
  }
}

// Export singleton instance
export const refactoredJobAPIService = new RefactoredJobAPIService()
