/**
 * Additional Job Providers
 * Careerjet, Jooble, Reed, Juju, and other international job boards
 */

import { BaseJobProvider } from './JobProviderInterface'
import type { Job, JobFilters } from '@/shared/types/jobs'

export class CareerjetProvider extends BaseJobProvider {
  name = 'Careerjet'
  baseUrl = 'https://public-api.careerjet.net/search'
  rateLimit = 500
  enabled = !!process.env.VITE_CAREERJET_API_KEY
  priority = 22
  apiKey = process.env.VITE_CAREERJET_API_KEY

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      api_key: this.apiKey,
      keywords: filters.title || '',
      location: filters.location || '',
      pagesize: 50,
      page: 1,
      sort: 'relevance',
    }
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return []

    return data.jobs.map((job: any) => ({
      id: `careerjet-${job.id}`,
      title: job.title,
      company: job.company || 'Not specified',
      location: job.locations || 'Not specified',
      remote: job.description?.toLowerCase().includes('remote') || false,
      salary: job.salary ? { min: 0, max: 0 } : undefined, // Parse from salary string
      description: job.description || '',
      requirements: this.parseRequirements(job.description || ''),
      technologies: this.extractTechnologies(job.description || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.date || new Date().toISOString(),
      featured: false,
      source: 'Careerjet',
    }))
  }
}

export class JoobleProvider extends BaseJobProvider {
  name = 'Jooble'
  baseUrl = 'https://jooble.org/api/v2/search'
  rateLimit = 500
  enabled = !!process.env.VITE_JOOBLE_API_KEY
  priority = 23
  apiKey = process.env.VITE_JOOBLE_API_KEY

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      api_key: this.apiKey,
      keywords: filters.title || '',
      location: filters.location || '',
      page: 1,
      searchMode: 1,
    }
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return []

    return data.jobs.map((job: any) => ({
      id: `jooble-${job.id}`,
      title: job.title,
      company: job.company || 'Not specified',
      location: job.location || 'Not specified',
      remote: job.type?.toLowerCase().includes('remote') || false,
      salary: job.salary ? { min: 0, max: 0 } : undefined,
      description: job.snippet || '',
      requirements: this.parseRequirements(job.snippet || ''),
      technologies: this.extractTechnologies(job.snippet || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.updated || new Date().toISOString(),
      featured: false,
      source: 'Jooble',
    }))
  }
}

export class ReedProvider extends BaseJobProvider {
  name = 'Reed.co.uk'
  baseUrl = 'https://www.reed.co.uk/api/1.0/search'
  rateLimit = 500
  enabled = !!process.env.VITE_REED_API_KEY
  priority = 24
  apiKey = process.env.VITE_REED_API_KEY

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      keywords: filters.title || '',
      location: filters.location || '',
      resultsToTake: 50,
      resultsToSkip: 0,
    }
  }

  protected async makeRequest(params: Record<string, any>): Promise<any> {
    return this.httpClient.get(this.baseUrl, {
      params,
      headers: {
        Authorization: `Basic ${btoa(`${this.apiKey}:`)}`,
      },
    })
  }

  parseResponse(data: any): Job[] {
    if (!data?.results || !Array.isArray(data.results)) return []

    return data.results.map((job: any) => ({
      id: `reed-${job.jobId}`,
      title: job.jobTitle,
      company: job.employerName || 'Not specified',
      location: job.locationName || 'UK',
      remote: job.isWorkFromHome || false,
      salary:
        job.minimumSalary && job.maximumSalary
          ? {
              min: job.minimumSalary,
              max: job.maximumSalary,
            }
          : undefined,
      description: job.jobDescription || '',
      requirements: this.parseRequirements(job.jobDescription || ''),
      technologies: this.extractTechnologies(job.jobDescription || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.date || new Date().toISOString(),
      featured: false,
      source: 'Reed.co.uk',
    }))
  }
}

export class JujuProvider extends BaseJobProvider {
  name = 'Juju Publisher API'
  baseUrl = 'https://api.juju.com/publisher'
  rateLimit = 300
  enabled = !!process.env.VITE_JUJU_PUBLISHER_ID
  priority = 25
  apiKey = process.env.VITE_JUJU_PUBLISHER_ID

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      publisher: this.apiKey,
      k: filters.title || '',
      l: filters.location || '',
      limit: 50,
    }
  }

  parseResponse(data: any): Job[] {
    if (!data?.jobs || !Array.isArray(data.jobs)) return []

    return data.jobs.map((job: any) => ({
      id: `juju-${job.id}`,
      title: job.title,
      company: job.company || 'Not specified',
      location: job.location || 'Not specified',
      remote: job.remote || false,
      salary: job.salary ? { min: 0, max: 0 } : undefined,
      description: job.description || '',
      requirements: this.parseRequirements(job.description || ''),
      technologies: this.extractTechnologies(job.description || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.date || new Date().toISOString(),
      featured: false,
      source: 'Juju',
    }))
  }
}

// Factory function to create all additional providers
export function createAdditionalProviders(): BaseJobProvider[] {
  return [
    new CareerjetProvider(),
    new JoobleProvider(),
    new ReedProvider(),
    new JujuProvider(),
  ]
}
