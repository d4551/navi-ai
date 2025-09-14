/**
 * Gaming Industry Job Board Providers
 * Specialized providers for gaming and game development jobs
 */

import { BaseJobProvider, type JobFilters } from './JobProviderInterface'
import type { Job } from '@/shared/types/jobs'

/**
 * Hitmarker Provider - Esports and gaming jobs
 * Gaming industry recruitment platform
 */
export class HitmarkerProvider extends BaseJobProvider {
  name = 'hitmarker'
  displayName = 'Hitmarker'
  description = 'Esports and gaming industry recruitment platform'
  enabled = false
  // Favor gaming sources earlier within the registry window when enabled
  priority = 40
  requiresAuth = false
  baseUrl = 'https://hitmarker.net'
  rateLimit = { requests: 50, period: 3600000 } // 50 per hour

  config = {
    maxResults: 30,
    categories: ['gaming', 'esports', 'streaming', 'content'],
    regions: ['global'],
    icon: 'mdi-bullseye',
    color: '#FF6B35',
    gamingFocus: 1.0
  }

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || 'game developer',
      location: filters.location || '',
      remote: filters.remote || false
    }
  }

  parseResponse(_data: any): Job[] {
    // Since this is a mock provider for demo purposes, return empty array
    // In a real implementation, this would parse the API response
    return []
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    // Generate mock gaming jobs for demonstration
    const esportsJobs = Array.from({ length: 15 }, (_, i) => ({
      id: `hitmarker-${i + 1}`,
      title: `${filters.title || 'Esports'} Manager`,
      company: ['Team Liquid', 'FaZe Clan', 'Cloud9', 'TSM', 'G2 Esports'][i % 5],
      location: ['Los Angeles, CA', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Seoul, KR'][i % 5],
      type: 'full-time' as const,
      remote: Math.random() > 0.4,
      description: 'Join our professional esports team and help shape the future of competitive gaming...',
      url: `https://hitmarker.net/jobs/${i + 1}`,
      salary: '$60,000 - $120,000',
      tags: ['esports', 'gaming', 'tournament', 'streaming'],
      postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      source: 'Hitmarker',
      gamingRelevance: 0.95
    }))

    return esportsJobs
      .filter(job => this.matchesFilters(job, filters))
      .slice(0, 30)
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.company} ${job.description}`.toLowerCase()
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false
      }
    }

    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }

    if (filters.remote !== undefined && job.remote !== filters.remote) {
      return false
    }

    return true
  }
}

/**
 * GameDev.net Jobs Provider - Game development specific jobs
 */
export class GameDevNetProvider extends BaseJobProvider {
  name = 'gamedevnet'
  displayName = 'GameDev.net Jobs'
  description = 'Game development community job board'
  enabled = false
  priority = 42
  requiresAuth = false
  baseUrl = 'https://gamedev.net'
  rateLimit = { requests: 100, period: 3600000 }

  config = {
    maxResults: 25,
    categories: ['game-development', 'programming', 'art', 'design'],
    regions: ['global'],
    icon: 'mdi-controller-classic',
    color: '#4CAF50',
    gamingFocus: 1.0
  }

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || 'game developer',
      location: filters.location || '',
      remote: filters.remote || false
    }
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return []
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const gameDevJobs = [
      {
        id: `gamedev-${Date.now()}-1`,
        title: `${filters.title || 'Unity'} Game Developer`,
        company: 'Pixel Perfect Studios',
        location: 'Remote',
        type: 'full-time' as const,
        remote: true,
        description: 'Join our indie game development team creating innovative mobile games.',
        url: 'https://gamedev.net/jobs/unity-developer',
        salary: '$70,000 - $100,000',
        tags: ['Unity', 'C#', 'Mobile', 'Indie'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.98
      },
      {
        id: `gamedev-${Date.now()}-2`,
        title: 'Technical Artist',
        company: 'NextGen Gaming',
        location: 'San Francisco, CA',
        type: 'full-time' as const,
        remote: true,
        description: 'Bridge the gap between art and technology in our AAA game production.',
        url: 'https://gamedev.net/jobs/technical-artist',
        salary: '$85,000 - $125,000',
        tags: ['Technical Art', 'Maya', 'Scripting', 'AAA'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.95
      }
    ]

    return gameDevJobs.filter(job => this.matchesFilters(job, filters))
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase()
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false
      }
    }
    return true
  }
}

/**
 * Gamasutra Jobs Provider - Game industry news and jobs
 */
export class GamasutraJobsProvider extends BaseJobProvider {
  name = 'gamasutra'
  displayName = 'Game Developer Jobs'
  description = 'Game industry professional job board'
  enabled = false
  priority = 44
  requiresAuth = false
  baseUrl = 'https://gamedeveloper.com'
  rateLimit = { requests: 75, period: 3600000 }

  config = {
    maxResults: 20,
    categories: ['game-industry', 'professional', 'aaa', 'indie'],
    regions: ['global'],
    icon: 'mdi-newspaper-variant',
    color: '#FF9800',
    gamingFocus: 1.0
  }

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || 'game developer',
      location: filters.location || '',
      remote: filters.remote || false
    }
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return []
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const gamasutraJobs = [
      {
        id: `gamasutra-${Date.now()}-1`,
        title: `Senior ${filters.title || 'Game'} Designer`,
        company: 'Epic Games',
        location: 'Cary, NC',
        type: 'full-time' as const,
        remote: false,
        description: 'Design and implement gameplay systems for next-generation games.',
        url: 'https://gamedeveloper.com/jobs/game-designer',
        salary: '$120,000 - $180,000',
        tags: ['Game Design', 'AAA', 'Unreal Engine', 'Systems'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.99
      },
      {
        id: `gamasutra-${Date.now()}-2`,
        title: 'Community Manager',
        company: 'Riot Games',
        location: 'Los Angeles, CA',
        type: 'full-time' as const,
        remote: true,
        description: 'Build and engage our gaming community across social platforms.',
        url: 'https://gamedeveloper.com/jobs/community-manager',
        salary: '$75,000 - $110,000',
        tags: ['Community', 'Social Media', 'Gaming', 'Content'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.92
      }
    ]

    return gamasutraJobs.filter(job => this.matchesFilters(job, filters))
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase()
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false
      }
    }
    return true
  }
}

/**
 * GamesIndustry.biz Jobs Provider - European gaming industry focus
 */
export class GamesIndustryBizProvider extends BaseJobProvider {
  name = 'gamesindustrybiz'
  displayName = 'GamesIndustry.biz Jobs'
  description = 'European gaming industry job board'
  enabled = false
  priority = 85
  requiresAuth = false
  baseUrl = 'https://gamesindustry.biz'
  rateLimit = { requests: 60, period: 3600000 }

  config = {
    maxResults: 20,
    categories: ['gaming', 'europe', 'professional'],
    regions: ['eu', 'uk'],
    icon: 'mdi-gamepad-variant',
    color: '#2196F3',
    gamingFocus: 1.0
  }

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || 'game developer',
      location: filters.location || '',
      remote: filters.remote || false
    }
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return []
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const europeanGamingJobs = [
      {
        id: `gamesindustry-${Date.now()}-1`,
        title: `Lead ${filters.title || 'Gameplay'} Programmer`,
        company: 'Ubisoft',
        location: 'Paris, France',
        type: 'full-time' as const,
        remote: false,
        description: 'Lead gameplay programming team for AAA open-world games.',
        url: 'https://gamesindustry.biz/jobs/lead-programmer',
        salary: '€80,000 - €120,000',
        tags: ['Programming', 'Leadership', 'AAA', 'Open World'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.97
      },
      {
        id: `gamesindustry-${Date.now()}-2`,
        title: 'Mobile Game Producer',
        company: 'King',
        location: 'Stockholm, Sweden',
        type: 'full-time' as const,
        remote: true,
        description: 'Produce casual mobile games for millions of players worldwide.',
        url: 'https://gamesindustry.biz/jobs/mobile-producer',
        salary: '€70,000 - €100,000',
        tags: ['Mobile', 'Producer', 'Casual Games', 'F2P'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.94
      }
    ]

    return europeanGamingJobs.filter(job => this.matchesFilters(job, filters))
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase()
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false
      }
    }
    return true
  }
}

/**
 * Indie Game Jobs Provider - Independent game development focus
 */
export class IndieGameJobsProvider extends BaseJobProvider {
  name = 'indiegamejobs'
  displayName = 'Indie Game Jobs'
  description = 'Independent game development opportunities'
  enabled = false
  priority = 80
  requiresAuth = false
  baseUrl = 'https://indiegamejobs.com'
  rateLimit = { requests: 100, period: 3600000 }

  config = {
    maxResults: 25,
    categories: ['indie', 'game-development', 'creative'],
    regions: ['global'],
    icon: 'mdi-account-group',
    color: '#9C27B0',
    gamingFocus: 1.0
  }

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || 'game developer',
      location: filters.location || '',
      remote: filters.remote || false
    }
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return []
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const indieJobs = [
      {
        id: `indie-${Date.now()}-1`,
        title: `Indie ${filters.title || 'Game'} Developer`,
        company: 'Creative Minds Studio',
        location: 'Remote',
        type: 'contract' as const,
        remote: true,
        description: 'Join our small indie team creating narrative-driven games.',
        url: 'https://indiegamejobs.com/indie-developer',
        salary: '$40,000 - $70,000',
        tags: ['Indie', 'Narrative', 'Creative', 'Small Team'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.96
      },
      {
        id: `indie-${Date.now()}-2`,
        title: 'Pixel Artist',
        company: 'Retro Games Co',
        location: 'Portland, OR',
        type: 'part-time' as const,
        remote: true,
        description: 'Create beautiful pixel art for retro-style indie games.',
        url: 'https://indiegamejobs.com/pixel-artist',
        salary: '$25,000 - $45,000',
        tags: ['Art', 'Pixel Art', 'Retro', 'Visual'],
        postedDate: new Date(),
        source: this.displayName,
        gamingRelevance: 0.93
      }
    ]

    return indieJobs.filter(job => this.matchesFilters(job, filters))
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase()
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false
      }
    }
    return true
  }
}

// Export all gaming providers
export const gamingProviders = [
  new HitmarkerProvider(),
  new GameDevNetProvider(),
  new GamasutraJobsProvider(),
  new GamesIndustryBizProvider(),
  new IndieGameJobsProvider()
]

export function createGamingJobProviders() {
  return gamingProviders
}
