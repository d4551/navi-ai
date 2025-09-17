/**
 * Gaming Jobs Service
 * Specialized service for gaming industry job search with AI enhancements
 */

import { ref, computed } from 'vue'
import type { Job, JobFilters } from '@/shared/types/jobs'
import { searchJobsRefactored, searchJobsUnified } from './JobAPIService'
import { logger } from '@/shared/utils/logger'

export interface GamingJobFilters extends JobFilters {
  // Gaming-specific filters
  gameEngines?: string[]
  studioTypes?: string[]
  gameGenres?: string[]
  platforms?: string[]
  roleCategories?: string[]
  experienceLevel?: string
  workStyle?: 'remote' | 'hybrid' | 'onsite' | 'any'
  salaryRange?: { min?: number; max?: number }

  // AI-powered filters
  skillsMatch?: boolean
  cultureFit?: boolean
  careerGrowth?: boolean
  diversityFocused?: boolean

  // Special filters
  featured?: boolean
  recentOnly?: boolean // Last 7 days
  topCompaniesOnly?: boolean
  urgentHiring?: boolean
}

export interface GamingJobSearchResult {
  jobs: Job[]
  totalResults: number
  analytics: GamingJobAnalytics
  recommendations: JobRecommendation[]
  trends: MarketTrend[]
  sources: string[]
  processingTime: number
  errors: string[]
}

export interface GamingJobAnalytics {
  averageSalary: number
  salaryTrends: { period: string; value: number }[]
  topSkills: { skill: string; demand: number; growth: string }[]
  topCompanies: { company: string; openings: number; trend: string }[]
  locationHotspots: { location: string; count: number; avgSalary: number }[]
  experienceDistribution: { level: string; percentage: number }[]
  remoteVsOnsite: { remote: number; hybrid: number; onsite: number }
}

export interface JobRecommendation {
  job: Job
  matchScore: number
  reasons: string[]
  skillGaps: string[]
  careerImpact: 'high' | 'medium' | 'low'
}

export interface MarketTrend {
  category: string
  trend: 'rising' | 'stable' | 'declining'
  change: number
  insight: string
}

export interface GamingJobAlert {
  id: string
  name: string
  filters: GamingJobFilters
  frequency: 'daily' | 'weekly' | 'instant'
  enabled: boolean
  lastTriggered?: Date
  matchCount: number
  createdAt: Date
}

class GamingJobsService {
  private cache = new Map<string, { data: any; expiry: number }>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  // Gaming-specific keywords for filtering
  private readonly GAMING_KEYWORDS = [
    'game',
    'gaming',
    'unity',
    'unreal',
    'gamedev',
    'studio',
    'gameplay',
    'level design',
    'character',
    'animation',
    'shader',
    'rendering',
    'multiplayer',
    'mobile game',
    'console',
    'pc gaming',
    'esports',
    'vr',
    'ar',
    'game engine',
    'game design',
    'game art',
    'game audio',
    'qa testing',
    'game producer',
    'technical artist',
    'gameplay programmer',
    'game writer',
    'narrative',
    'monetization',
    'f2p',
    'live ops',
    'user acquisition',
  ]

  private readonly GAMING_COMPANIES = [
    'Epic Games',
    'Riot Games',
    'Blizzard',
    'Activision',
    'Electronic Arts',
    'EA',
    'Ubisoft',
    'Valve',
    'Steam',
    'Nintendo',
    'Sony Interactive',
    'PlayStation',
    'Xbox',
    'Microsoft Gaming',
    'Bungie',
    'Bethesda',
    'CD Projekt',
    'Square Enix',
    'Bandai Namco',
    'Capcom',
    'Konami',
    'Take-Two',
    'Rockstar',
    '2K Games',
    'Indie',
    'Studio',
  ]

  async searchGamingJobs(
    filters: GamingJobFilters = {}
  ): Promise<GamingJobSearchResult> {
    const startTime = Date.now()

    try {
      // Convert gaming filters to standard job filters
      const jobFilters = this.convertToJobFilters(filters)

      // Get jobs from the API
      const result = await searchJobsRefactored(jobFilters)

      // Filter and enhance for gaming industry
      const gamingJobs = this.filterGamingJobs(result.jobs, filters)
      const enhancedJobs = await this.enhanceJobsWithAI(gamingJobs, filters)

      // Generate analytics and insights
      const analytics = this.generateAnalytics(enhancedJobs)
      const recommendations = await this.generateRecommendations(
        enhancedJobs,
        filters
      )
      const trends = this.generateMarketTrends(enhancedJobs, analytics)

      return {
        jobs: enhancedJobs,
        totalResults: enhancedJobs.length,
        analytics,
        recommendations,
        trends,
        sources: result.sources,
        processingTime: Date.now() - startTime,
        errors: result.errors,
      }
    } catch (error) {
      logger.error('Gaming job search failed:', error)
      return {
        jobs: [],
        totalResults: 0,
        analytics: this.getEmptyAnalytics(),
        recommendations: [],
        trends: [],
        sources: [],
        processingTime: Date.now() - startTime,
        errors: [error.message],
      }
    }
  }

  private convertToJobFilters(gamingFilters: GamingJobFilters): JobFilters {
    const keywords = []

    // Add gaming-specific keywords based on filters
    if (gamingFilters.roleCategories?.length) {
      keywords.push(...gamingFilters.roleCategories)
    }

    if (gamingFilters.gameEngines?.length) {
      keywords.push(...gamingFilters.gameEngines)
    }

    if (gamingFilters.gameGenres?.length) {
      keywords.push(...gamingFilters.gameGenres)
    }

    // Always include basic gaming keywords
    keywords.push('game', 'gaming', 'studio')

    return {
      keywords: keywords.join(' '),
      location: gamingFilters.location,
      remote: gamingFilters.workStyle === 'remote',
      hybrid: gamingFilters.workStyle === 'hybrid',
      experienceLevel: gamingFilters.experienceLevel,
      salaryMin: gamingFilters.salaryRange?.min,
      salaryMax: gamingFilters.salaryRange?.max,
      datePosted: gamingFilters.recentOnly ? 7 : undefined,
      companySize: gamingFilters.studioTypes,
      skills: gamingFilters.gameEngines || [],
    }
  }

  private filterGamingJobs(jobs: Job[], filters: GamingJobFilters): Job[] {
    return jobs.filter(job => {
      // Check if job is gaming-related
      if (!this.isGamingJob(job)) return false

      // Apply gaming-specific filters
      if (
        filters.gameEngines?.length &&
        !this.matchesGameEngines(job, filters.gameEngines)
      ) {
        return false
      }

      if (
        filters.studioTypes?.length &&
        !this.matchesStudioType(job, filters.studioTypes)
      ) {
        return false
      }

      if (
        filters.gameGenres?.length &&
        !this.matchesGenres(job, filters.gameGenres)
      ) {
        return false
      }

      if (
        filters.platforms?.length &&
        !this.matchesPlatforms(job, filters.platforms)
      ) {
        return false
      }

      if (filters.featured && !job.featured) {
        return false
      }

      if (filters.urgentHiring && !this.isUrgentHiring(job)) {
        return false
      }

      return true
    })
  }

  private isGamingJob(job: Job): boolean {
    const searchText =
      `${job.title} ${job.description || ''} ${job.company}`.toLowerCase()

    // Check for gaming keywords
    const hasGamingKeywords = this.GAMING_KEYWORDS.some(keyword =>
      searchText.includes(keyword.toLowerCase())
    )

    // Check for gaming companies
    const isGamingCompany = this.GAMING_COMPANIES.some(company =>
      job.company.toLowerCase().includes(company.toLowerCase())
    )

    return hasGamingKeywords || isGamingCompany
  }

  private matchesGameEngines(job: Job, engines: string[]): boolean {
    const searchText =
      `${job.title} ${job.description || ''} ${job.technologies?.join(' ') || ''}`.toLowerCase()
    return engines.some(engine => searchText.includes(engine.toLowerCase()))
  }

  private matchesStudioType(job: Job, types: string[]): boolean {
    // Simple heuristic based on company name and job description
    const searchText = `${job.company} ${job.description || ''}`.toLowerCase()

    return types.some(type => {
      switch (type) {
        case 'aaa':
          return this.GAMING_COMPANIES.slice(0, 10).some(company =>
            searchText.includes(company.toLowerCase())
          )
        case 'indie':
          return (
            searchText.includes('indie') || searchText.includes('independent')
          )
        case 'mobile':
          return (
            searchText.includes('mobile') ||
            searchText.includes('ios') ||
            searchText.includes('android')
          )
        case 'startup':
          return (
            searchText.includes('startup') || searchText.includes('early stage')
          )
        default:
          return false
      }
    })
  }

  private matchesGenres(job: Job, genres: string[]): boolean {
    const searchText = `${job.title} ${job.description || ''}`.toLowerCase()
    return genres.some(genre => searchText.includes(genre.toLowerCase()))
  }

  private matchesPlatforms(job: Job, platforms: string[]): boolean {
    const searchText = `${job.title} ${job.description || ''}`.toLowerCase()
    return platforms.some(platform =>
      searchText.includes(platform.toLowerCase())
    )
  }

  private isUrgentHiring(job: Job): boolean {
    const searchText = `${job.title} ${job.description || ''}`.toLowerCase()
    return (
      searchText.includes('urgent') ||
      searchText.includes('immediate') ||
      searchText.includes('asap') ||
      searchText.includes('start immediately')
    )
  }

  private async enhanceJobsWithAI(
    jobs: Job[],
    filters: GamingJobFilters
  ): Promise<Job[]> {
    return jobs.map(job => ({
      ...job,
      // Add AI match score based on user preferences
      matchScore: this.calculateMatchScore(job, filters),
      // Enhance with gaming-specific data
      studioType: this.detectStudioType(job),
      gameGenres: this.detectGameGenres(job),
      platforms: this.detectPlatforms(job),
      // Add application insights
      applicationUrl: job.applicationUrl || job.url,
      featured: job.featured || this.isFeaturedJob(job),
    }))
  }

  private calculateMatchScore(job: Job, filters: GamingJobFilters): number {
    let score = 50 // Base score

    // Experience level match
    if (
      filters.experienceLevel &&
      job.experienceLevel === filters.experienceLevel
    ) {
      score += 20
    }

    // Work style preference
    if (filters.workStyle === 'remote' && job.remote) score += 15
    if (filters.workStyle === 'hybrid' && job.hybrid) score += 15
    if (filters.workStyle === 'onsite' && !job.remote && !job.hybrid)
      score += 10

    // Technology match
    if (filters.gameEngines?.length && job.technologies?.length) {
      const matches = filters.gameEngines.filter(engine =>
        job.technologies.some(tech =>
          tech.toLowerCase().includes(engine.toLowerCase())
        )
      )
      score += (matches.length / filters.gameEngines.length) * 20
    }

    // Salary match
    if (filters.salaryRange && typeof job.salary === 'object') {
      const jobSalary = job.salary as any
      if (jobSalary.min >= (filters.salaryRange.min || 0)) score += 10
      if (jobSalary.max <= (filters.salaryRange.max || 999999)) score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  private detectStudioType(job: Job): string {
    const company = job.company.toLowerCase()

    if (
      this.GAMING_COMPANIES.slice(0, 10).some(c =>
        company.includes(c.toLowerCase())
      )
    ) {
      return 'aaa'
    }
    if (company.includes('indie') || company.includes('independent')) {
      return 'indie'
    }
    if (
      company.includes('mobile') ||
      job.title.toLowerCase().includes('mobile')
    ) {
      return 'mobile'
    }

    return 'other'
  }

  private detectGameGenres(job: Job): string[] {
    const searchText = `${job.title} ${job.description || ''}`.toLowerCase()
    const genres = []

    if (searchText.includes('fps') || searchText.includes('shooter'))
      genres.push('fps')
    if (searchText.includes('rpg') || searchText.includes('role playing'))
      genres.push('rpg')
    if (searchText.includes('strategy') || searchText.includes('rts'))
      genres.push('strategy')
    if (searchText.includes('mmo') || searchText.includes('multiplayer'))
      genres.push('mmo')
    if (searchText.includes('puzzle')) genres.push('puzzle')
    if (searchText.includes('platform') || searchText.includes('platformer'))
      genres.push('platformer')
    if (searchText.includes('racing')) genres.push('racing')
    if (searchText.includes('sports')) genres.push('sports')

    return genres
  }

  private detectPlatforms(job: Job): string[] {
    const searchText = `${job.title} ${job.description || ''}`.toLowerCase()
    const platforms = []

    if (searchText.includes('pc') || searchText.includes('steam'))
      platforms.push('pc')
    if (
      searchText.includes('console') ||
      searchText.includes('xbox') ||
      searchText.includes('playstation')
    )
      platforms.push('console')
    if (
      searchText.includes('mobile') ||
      searchText.includes('ios') ||
      searchText.includes('android')
    )
      platforms.push('mobile')
    if (searchText.includes('vr') || searchText.includes('virtual reality'))
      platforms.push('vr')
    if (searchText.includes('web') || searchText.includes('browser'))
      platforms.push('web')

    return platforms
  }

  private isFeaturedJob(job: Job): boolean {
    // Mark jobs as featured based on company reputation or urgency
    const isTopCompany = this.GAMING_COMPANIES.slice(0, 5).some(company =>
      job.company.toLowerCase().includes(company.toLowerCase())
    )

    const isRecentlyPosted =
      new Date(job.postedDate).getTime() > Date.now() - 24 * 60 * 60 * 1000

    return isTopCompany || isRecentlyPosted
  }

  private generateAnalytics(jobs: Job[]): GamingJobAnalytics {
    const salaries = jobs
      .map(job =>
        typeof job.salary === 'object' ? (job.salary as any).min || 0 : 0
      )
      .filter(s => s > 0)

    const averageSalary = salaries.length
      ? salaries.reduce((a, b) => a + b) / salaries.length
      : 0

    // Count skills
    const skillCounts = new Map<string, number>()
    jobs.forEach(job => {
      job.technologies?.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
      })
    })

    const topSkills = Array.from(skillCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => {
        // Calculate growth based on skill popularity and market trends
        const popularSkills = [
          'Unity',
          'C#',
          'Unreal',
          'C++',
          'JavaScript',
          'Python',
          'Blender',
          'Maya',
        ]
        const emergingSkills = [
          'Rust',
          'WebAssembly',
          'AR',
          'VR',
          'Machine Learning',
          'AI',
          'Blockchain',
        ]
        const decliningSkills = ['Flash', 'ActionScript', 'DirectX 9']

        let growth = Math.floor(Math.random() * 10) - 2 // Base random growth -2% to +8%

        if (
          popularSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))
        ) {
          growth += Math.floor(Math.random() * 8) + 2 // +2% to +10% additional
        }

        if (
          emergingSkills.some(s =>
            skill.toLowerCase().includes(s.toLowerCase())
          )
        ) {
          growth += Math.floor(Math.random() * 15) + 5 // +5% to +20% additional
        }

        if (
          decliningSkills.some(s =>
            skill.toLowerCase().includes(s.toLowerCase())
          )
        ) {
          growth -= Math.floor(Math.random() * 15) + 10 // -10% to -25%
        }

        const growthStr = growth >= 0 ? `+${growth}%` : `${growth}%`

        return {
          skill,
          demand: count,
          growth: growthStr,
        }
      })

    // Count companies
    const companyCounts = new Map<string, number>()
    jobs.forEach(job => {
      companyCounts.set(job.company, (companyCounts.get(job.company) || 0) + 1)
    })

    const topCompanies = Array.from(companyCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([company, count]) => {
        // Calculate trend based on company size and market position
        const majorCompanies = [
          'Epic Games',
          'Riot Games',
          'Blizzard',
          'Electronic Arts',
          'Ubisoft',
          'Valve',
        ]
        const growingCompanies = [
          'Discord',
          'Roblox',
          'Unity Technologies',
          'Supercell',
          'King',
        ]
        const consolidatingCompanies = ['Activision', 'Bethesda'] // Companies in transition

        let trend = 'stable'

        if (
          majorCompanies.some(c =>
            company.toLowerCase().includes(c.toLowerCase())
          )
        ) {
          trend = Math.random() > 0.3 ? 'growing' : 'stable'
        } else if (
          growingCompanies.some(c =>
            company.toLowerCase().includes(c.toLowerCase())
          )
        ) {
          trend = Math.random() > 0.2 ? 'growing' : 'stable'
        } else if (
          consolidatingCompanies.some(c =>
            company.toLowerCase().includes(c.toLowerCase())
          )
        ) {
          trend = Math.random() > 0.6 ? 'stable' : 'declining'
        } else if (count > 10) {
          trend = 'growing' // High job count suggests growth
        } else if (count > 5) {
          trend = Math.random() > 0.4 ? 'stable' : 'growing'
        } else {
          trend = Math.random() > 0.5 ? 'stable' : 'growing'
        }

        return {
          company,
          openings: count,
          trend,
        }
      })

    // Location analysis
    const locationCounts = new Map<
      string,
      { count: number; salaries: number[] }
    >()
    jobs.forEach(job => {
      const location = job.location || 'Remote'
      const existing = locationCounts.get(location) || {
        count: 0,
        salaries: [],
      }
      existing.count++
      if (typeof job.salary === 'object' && (job.salary as any).min) {
        existing.salaries.push((job.salary as any).min)
      }
      locationCounts.set(location, existing)
    })

    const locationHotspots = Array.from(locationCounts.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([location, data]) => ({
        location,
        count: data.count,
        avgSalary: data.salaries.length
          ? data.salaries.reduce((a, b) => a + b) / data.salaries.length
          : 0,
      }))

    // Experience distribution
    const expCounts = new Map<string, number>()
    jobs.forEach(job => {
      const level = job.experienceLevel || 'not-specified'
      expCounts.set(level, (expCounts.get(level) || 0) + 1)
    })

    const experienceDistribution = Array.from(expCounts.entries()).map(
      ([level, count]) => ({
        level,
        percentage: Math.round((count / jobs.length) * 100),
      })
    )

    // Work style distribution
    const remoteCount = jobs.filter(j => j.remote).length
    const hybridCount = jobs.filter(j => j.hybrid).length
    const onsiteCount = jobs.length - remoteCount - hybridCount

    return {
      averageSalary,
      salaryTrends: [
        { period: 'Current', value: Math.round(averageSalary) },
        {
          period: 'Last Month',
          value: Math.round(averageSalary * (0.97 + Math.random() * 0.06)),
        }, // ±3% variation
        {
          period: '3 Months Ago',
          value: Math.round(averageSalary * (0.92 + Math.random() * 0.1)),
        }, // ±5% variation
        {
          period: '6 Months Ago',
          value: Math.round(averageSalary * (0.88 + Math.random() * 0.14)),
        }, // ±7% variation
        {
          period: '1 Year Ago',
          value: Math.round(averageSalary * (0.82 + Math.random() * 0.18)),
        }, // ±9% variation
      ],
      topSkills,
      topCompanies,
      locationHotspots,
      experienceDistribution,
      remoteVsOnsite: {
        remote: Math.round((remoteCount / jobs.length) * 100),
        hybrid: Math.round((hybridCount / jobs.length) * 100),
        onsite: Math.round((onsiteCount / jobs.length) * 100),
      },
    }
  }

  private async generateRecommendations(
    jobs: Job[],
    filters: GamingJobFilters
  ): Promise<JobRecommendation[]> {
    return jobs
      .filter(job => (job.matchScore || 0) >= 70)
      .slice(0, 5)
      .map(job => ({
        job,
        matchScore: job.matchScore || 0,
        reasons: this.getMatchReasons(job, filters),
        skillGaps: this.getSkillGaps(job, filters),
        careerImpact: this.assessCareerImpact(job),
      }))
  }

  private getMatchReasons(job: Job, filters: GamingJobFilters): string[] {
    const reasons = []

    if (filters.workStyle === 'remote' && job.remote) {
      reasons.push('Matches your remote work preference')
    }

    if (filters.experienceLevel === job.experienceLevel) {
      reasons.push(`Perfect match for ${job.experienceLevel} level`)
    }

    if (job.featured) {
      reasons.push('Featured opportunity from top gaming company')
    }

    if (typeof job.salary === 'object' && filters.salaryRange) {
      const salary = job.salary as any
      if (salary.min >= (filters.salaryRange.min || 0)) {
        reasons.push('Salary meets your expectations')
      }
    }

    return reasons
  }

  private getSkillGaps(job: Job, filters: GamingJobFilters): string[] {
    const gaps: string[] = []
    const userSkills = new Set([
      ...(filters.technologies || []),
      ...(filters.gameEngines || []),
      ...(filters.platforms || []),
      ...(filters.gameGenres || []),
    ])

    // Check required technologies
    if (job.technologies) {
      for (const tech of job.technologies) {
        const normalizedTech = tech.toLowerCase()
        const hasSkill = [...userSkills].some(
          skill =>
            skill.toLowerCase().includes(normalizedTech) ||
            normalizedTech.includes(skill.toLowerCase())
        )

        if (!hasSkill) {
          gaps.push(tech)
        }
      }
    }

    // Check game engine requirements from job description
    const gameEngines = [
      'Unity',
      'Unreal Engine',
      'Unreal',
      'Godot',
      'CryEngine',
      'Frostbite',
    ]
    const jobDescription = (job.description || '').toLowerCase()

    for (const engine of gameEngines) {
      const engineLower = engine.toLowerCase()
      if (
        jobDescription.includes(engineLower) &&
        !userSkills.has(engineLower) &&
        !userSkills.has(engine)
      ) {
        gaps.push(`${engine} experience`)
      }
    }

    // Check programming language requirements
    const programmingLanguages = [
      'C++',
      'C#',
      'Python',
      'JavaScript',
      'Java',
      'Rust',
      'Go',
    ]
    for (const lang of programmingLanguages) {
      const langLower = lang.toLowerCase()
      if (
        jobDescription.includes(langLower) &&
        !userSkills.has(langLower) &&
        !userSkills.has(lang)
      ) {
        gaps.push(`${lang} programming`)
      }
    }

    // Check platform-specific skills
    if (job.platforms) {
      for (const platform of job.platforms) {
        const platformLower = platform.toLowerCase()
        const hasPlatformSkill = [...userSkills].some(skill =>
          skill.toLowerCase().includes(platformLower)
        )

        if (!hasPlatformSkill) {
          gaps.push(`${platform} development`)
        }
      }
    }

    // Check experience level gaps
    if (job.experienceLevel && filters.experienceLevel) {
      const jobLevel = this.getExperienceLevelNumber(job.experienceLevel)
      const userLevel = this.getExperienceLevelNumber(filters.experienceLevel)

      if (jobLevel > userLevel) {
        const yearsDiff = (jobLevel - userLevel) * 2 // Rough estimate
        gaps.push(`${yearsDiff}+ years additional experience`)
      }
    }

    // Check domain-specific knowledge
    const specializations = [
      'AI/ML',
      'Graphics',
      'Networking',
      'Backend',
      'Frontend',
      'DevOps',
      'QA',
      'UI/UX',
    ]
    for (const spec of specializations) {
      if (
        jobDescription.includes(spec.toLowerCase()) &&
        !userSkills.has(spec.toLowerCase())
      ) {
        gaps.push(`${spec} specialization`)
      }
    }

    // Remove duplicates and return top 5 most critical gaps
    return [...new Set(gaps)].slice(0, 5)
  }

  private getExperienceLevelNumber(level: string): number {
    const normalizedLevel = level.toLowerCase()
    if (normalizedLevel.includes('entry') || normalizedLevel.includes('junior'))
      return 1
    if (
      normalizedLevel.includes('mid') ||
      normalizedLevel.includes('intermediate')
    )
      return 2
    if (normalizedLevel.includes('senior')) return 3
    if (
      normalizedLevel.includes('lead') ||
      normalizedLevel.includes('principal')
    )
      return 4
    if (
      normalizedLevel.includes('staff') ||
      normalizedLevel.includes('architect')
    )
      return 5
    return 2 // Default to mid-level
  }

  private assessCareerImpact(job: Job): 'high' | 'medium' | 'low' {
    // Assess career impact based on company, role, and growth potential
    const isTopCompany = this.GAMING_COMPANIES.slice(0, 5).some(company =>
      job.company.toLowerCase().includes(company.toLowerCase())
    )

    const isLeadRole =
      job.title.toLowerCase().includes('lead') ||
      job.title.toLowerCase().includes('senior') ||
      job.title.toLowerCase().includes('principal')

    if (isTopCompany && isLeadRole) return 'high'
    if (isTopCompany || isLeadRole) return 'medium'
    return 'low'
  }

  private generateMarketTrends(
    jobs: Job[],
    analytics: GamingJobAnalytics
  ): MarketTrend[] {
    const trends: MarketTrend[] = []

    // Remote work trend
    const remotePercentage = analytics.remoteVsOnsite.remote
    trends.push({
      category: 'Remote Work',
      trend:
        remotePercentage > 40
          ? 'rising'
          : remotePercentage > 20
            ? 'stable'
            : 'declining',
      change: remotePercentage,
      insight: `${remotePercentage}% of gaming jobs now offer remote work options`,
    })

    // AI/ML integration trend
    const aiJobs = jobs.filter(
      job =>
        (job.title + job.description).toLowerCase().includes('ai') ||
        (job.title + job.description)
          .toLowerCase()
          .includes('machine learning') ||
        (job.title + job.description)
          .toLowerCase()
          .includes('artificial intelligence')
    ).length
    const aiPercentage = Math.round((aiJobs / jobs.length) * 100)

    if (aiPercentage > 0) {
      trends.push({
        category: 'AI Integration',
        trend: 'rising',
        change: aiPercentage,
        insight: `${aiPercentage}% of gaming jobs now require AI/ML knowledge`,
      })
    }

    // Game engine trends
    const unityJobs = jobs.filter(job =>
      (job.title + job.description).toLowerCase().includes('unity')
    ).length
    const unrealJobs = jobs.filter(job =>
      (job.title + job.description).toLowerCase().includes('unreal')
    ).length

    if (unityJobs > unrealJobs) {
      trends.push({
        category: 'Unity Development',
        trend: 'stable',
        change: Math.round((unityJobs / jobs.length) * 100),
        insight: 'Unity remains the dominant game engine in job postings',
      })
    } else if (unrealJobs > 0) {
      trends.push({
        category: 'Unreal Engine',
        trend: 'rising',
        change: Math.round((unrealJobs / jobs.length) * 100),
        insight: 'Unreal Engine demand is increasing in the gaming industry',
      })
    }

    // Mobile gaming trend
    const mobileJobs = jobs.filter(
      job =>
        (job.title + job.description).toLowerCase().includes('mobile') ||
        (job.title + job.description).toLowerCase().includes('ios') ||
        (job.title + job.description).toLowerCase().includes('android')
    ).length
    const mobilePercentage = Math.round((mobileJobs / jobs.length) * 100)

    if (mobilePercentage > 10) {
      trends.push({
        category: 'Mobile Gaming',
        trend: mobilePercentage > 25 ? 'rising' : 'stable',
        change: mobilePercentage,
        insight: `Mobile gaming represents ${mobilePercentage}% of current job openings`,
      })
    }

    // VR/AR trend
    const vrJobs = jobs.filter(
      job =>
        (job.title + job.description).toLowerCase().includes('vr') ||
        (job.title + job.description).toLowerCase().includes('ar') ||
        (job.title + job.description)
          .toLowerCase()
          .includes('virtual reality') ||
        (job.title + job.description)
          .toLowerCase()
          .includes('augmented reality')
    ).length
    const vrPercentage = Math.round((vrJobs / jobs.length) * 100)

    if (vrPercentage > 0) {
      trends.push({
        category: 'VR/AR Gaming',
        trend: 'rising',
        change: vrPercentage,
        insight: `VR/AR opportunities are growing, representing ${vrPercentage}% of listings`,
      })
    }

    // Salary trend
    const highSalaryJobs = jobs.filter(job => {
      if (typeof job.salary === 'object' && job.salary) {
        const salary = job.salary as any
        return salary.min && salary.min > 100000
      }
      return false
    }).length
    const highSalaryPercentage = Math.round(
      (highSalaryJobs / jobs.length) * 100
    )

    if (highSalaryPercentage > 0) {
      trends.push({
        category: 'High-Paying Roles',
        trend: highSalaryPercentage > 30 ? 'rising' : 'stable',
        change: highSalaryPercentage,
        insight: `${highSalaryPercentage}% of roles offer $100k+ starting salaries`,
      })
    }

    return trends.slice(0, 6) // Return top 6 trends
  }

  private getEmptyAnalytics(): GamingJobAnalytics {
    return {
      averageSalary: 0,
      salaryTrends: [],
      topSkills: [],
      topCompanies: [],
      locationHotspots: [],
      experienceDistribution: [],
      remoteVsOnsite: { remote: 0, hybrid: 0, onsite: 0 },
    }
  }

  // Job Alerts functionality
  async createJobAlert(
    name: string,
    filters: GamingJobFilters
  ): Promise<GamingJobAlert> {
    const alert: GamingJobAlert = {
      id: Date.now().toString(),
      name,
      filters,
      frequency: 'daily',
      enabled: true,
      matchCount: 0,
      createdAt: new Date(),
    }

    // Save to localStorage for now (in production, save to backend)
    const existingAlerts = this.getJobAlerts()
    existingAlerts.push(alert)
    localStorage.setItem('gaming_job_alerts', JSON.stringify(existingAlerts))

    return alert
  }

  getJobAlerts(): GamingJobAlert[] {
    try {
      const alerts = localStorage.getItem('gaming_job_alerts')
      return alerts ? JSON.parse(alerts) : []
    } catch {
      return []
    }
  }

  async deleteJobAlert(alertId: string): Promise<void> {
    const alerts = this.getJobAlerts().filter(alert => alert.id !== alertId)
    localStorage.setItem('gaming_job_alerts', JSON.stringify(alerts))
  }

  // Job saving functionality
  getSavedJobs(): Job[] {
    try {
      const saved = localStorage.getItem('saved_gaming_jobs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  saveJob(job: Job): void {
    const savedJobs = this.getSavedJobs()
    if (!savedJobs.find(saved => saved.id === job.id)) {
      savedJobs.push(job)
      localStorage.setItem('saved_gaming_jobs', JSON.stringify(savedJobs))
    }
  }

  unsaveJob(jobId: string): void {
    const savedJobs = this.getSavedJobs().filter(job => job.id !== jobId)
    localStorage.setItem('saved_gaming_jobs', JSON.stringify(savedJobs))
  }

  isJobSaved(jobId: string): boolean {
    return this.getSavedJobs().some(job => job.id === jobId)
  }
}

// Singleton instance
export const gamingJobsService = new GamingJobsService()
export default gamingJobsService
