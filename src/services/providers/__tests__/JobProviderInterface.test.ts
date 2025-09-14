/**
 * Unit tests for Job Provider Interface and Registry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JobProviderRegistry, SimpleRateLimiter, BaseJobProvider } from '../JobProviderInterface'
import type { JobFilters } from '@/shared/types/jobs'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

// Mock XMLParser
vi.mock('fast-xml-parser', () => ({
  XMLParser: vi.fn().mockImplementation(() => ({
    parse: vi.fn()
  }))
}))

describe('SimpleRateLimiter', () => {
  let limiter: SimpleRateLimiter

  beforeEach(() => {
    limiter = new SimpleRateLimiter()
  })

  it('should allow requests within limit', () => {
    expect(limiter.canMakeRequest('test')).toBe(true)
    limiter.recordRequest('test')
    expect(limiter.getRemainingRequests('test')).toBe(9)
  })

  it('should block requests over limit', () => {
    // Record 10 requests
    for (let i = 0; i < 10; i++) {
      limiter.recordRequest('test')
    }
    expect(limiter.canMakeRequest('test')).toBe(false)
    expect(limiter.getRemainingRequests('test')).toBe(0)
  })
})

describe('JobProviderRegistry', () => {
  let registry: JobProviderRegistry
  let mockProvider: any

  beforeEach(() => {
    registry = new JobProviderRegistry()
    mockProvider = {
      name: 'TestProvider',
      baseUrl: 'https://test.com',
      rateLimit: 100,
      enabled: true,
      priority: 1,
      fetchJobs: vi.fn().mockResolvedValue([
        {
          id: '1',
          title: 'Test Job',
          company: 'Test Co',
          location: 'Remote',
          remote: true,
          description: 'Test description',
          requirements: ['Skill 1'],
          technologies: ['Tech 1'],
          experienceLevel: 'mid',
          type: 'full-time',
          postedDate: new Date().toISOString(),
          source: 'TestProvider'
        }
      ])
    }
  })

  it('should register and retrieve providers', () => {
    registry.register(mockProvider)
    expect(registry.getProvider('TestProvider')).toBe(mockProvider)
  })

  it('should fetch from provider successfully', async () => {
    registry.register(mockProvider)
    const jobs = await registry.fetchFromProvider('TestProvider', {} as JobFilters)
    expect(jobs).toHaveLength(1)
    expect(jobs[0].title).toBe('Test Job')
  })

  it('should return empty array for disabled provider', async () => {
    mockProvider.enabled = false
    registry.register(mockProvider)
    const jobs = await registry.fetchFromProvider('TestProvider', {} as JobFilters)
    expect(jobs).toHaveLength(0)
  })

  it('should fetch from all providers', async () => {
    registry.register(mockProvider)
    const result = await registry.fetchFromAllProviders({} as JobFilters)
    expect(result.jobs).toHaveLength(1)
    expect(result.sources).toContain('TestProvider')
  })
})

describe('BaseJobProvider', () => {
  class TestProvider extends BaseJobProvider {
    name = 'TestProvider'
    baseUrl = 'https://test.com'
    rateLimit = 100
    enabled = true
    priority = 1

    buildParams(filters: JobFilters): Record<string, any> {
      return { q: filters.title || '' }
    }

    parseResponse(data: any): any[] {
      return data.jobs || []
    }
  }

  let provider: TestProvider

  beforeEach(() => {
    provider = new TestProvider()
  })

  it('should parse salary correctly', () => {
    const salary1 = provider.parseSalary('50k-70k')
    expect(salary1).toEqual({ min: 50000, max: 70000 })

    const salary2 = provider.parseSalary({ min: 60000, max: 80000 })
    expect(salary2).toEqual({ min: 60000, max: 80000 })

    const salary3 = provider.parseSalary('Not specified')
    expect(salary3).toBeUndefined()
  })

  it('should extract requirements from description', () => {
    const desc = 'Requirements: 3 years experience, React, Node.js. Must have...'
    const reqs = provider.parseRequirements(desc)
    expect(reqs).toContain('3 years experience')
    expect(reqs).toContain('React')
  })

  it('should extract technologies from description', () => {
    const desc = 'Looking for developers with Unity, C#, Python experience'
    const techs = provider.extractTechnologies(desc)
    expect(techs).toContain('Unity')
    expect(techs).toContain('C#')
    expect(techs).toContain('Python')
  })

  it('should map experience levels correctly', () => {
    expect(provider.mapExperienceLevel('Senior Developer')).toBe('senior')
    expect(provider.mapExperienceLevel('Entry Level')).toBe('entry')
    expect(provider.mapExperienceLevel('Mid Level')).toBe('mid')
    expect(provider.mapExperienceLevel('')).toBe('mid')
  })
})
