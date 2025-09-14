/**
 * Government and Open Data Job Providers
 * Feeds from government agencies and public data sources
 */

import axios from 'axios'
import { BaseJobProvider } from './JobProviderInterface'
import type { Job, JobFilters } from '@/shared/types/jobs'

export class CareerOneStopProvider extends BaseJobProvider {
  name = 'CareerOneStop (US DOL)'
  baseUrl = 'https://api.careeronestop.org/v2/jobsearch'
  rateLimit = 500
  enabled = !!process.env.VITE_CAREERONESTOP_API_KEY
  priority = 15
  apiKey = process.env.VITE_CAREERONESTOP_API_KEY

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      userId: 'your_user_id', // Would need to be configured
      keyword: filters.title || 'developer',
      location: filters.location || '',
      radius: 50,
      sort: 'relevance'
    }
  }

  parseResponse(data: any): Job[] {
    if (!data?.Jobs || !Array.isArray(data.Jobs)) return []

    return data.Jobs.map((job: any) => ({
      id: `careeronestop-${job.JobId}`,
      title: job.JobTitle,
      company: job.CompanyName || 'Not specified',
      location: job.Location || 'Not specified',
      remote: job.IsRemote || false,
      salary: job.Salary ? { min: job.Salary, max: job.Salary } : undefined,
      description: job.Description || '',
      requirements: this.parseRequirements(job.Description || ''),
      technologies: this.extractTechnologies(job.Description || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.PostedDate || new Date().toISOString(),
      featured: false,
      source: 'CareerOneStop'
    }))
  }
}

export class NHSJobsProvider extends BaseJobProvider {
  name = 'NHS Jobs (UK)'
  baseUrl = 'https://www.jobs.nhs.uk/api/v1/search_xml'
  rateLimit = 300
  enabled = false // Disabled due to CORS restrictions
  priority = 16

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      keyword: filters.title || '',
      location: filters.location || '',
      distance: 50
    }
  }

  async makeRequest(params: Record<string, any>): Promise<any> {
    const response = await this.httpClient.get(this.baseUrl, {
      params,
      responseType: 'text'
    })
    return { data: this.xmlParser.parse(response.data) }
  }

  parseResponse(data: any): Job[] {
    const jobs = data?.Jobs?.Job
    if (!jobs) return []
    if (!Array.isArray(jobs)) return [jobs].map(this.parseNHSJob.bind(this))

    return jobs.map(this.parseNHSJob.bind(this))
  }

  private parseNHSJob(job: any): Job {
    return {
      id: `nhs-${job.JobId}`,
      title: job.JobTitle,
      company: 'NHS',
      location: job.Location || 'UK',
      remote: false,
      salary: job.SalaryRange ? { min: 0, max: 0 } : undefined, // Parse from SalaryRange
      description: job.JobDescription || '',
      requirements: this.parseRequirements(job.JobDescription || ''),
      technologies: this.extractTechnologies(job.JobDescription || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.PostedDate || new Date().toISOString(),
      featured: false,
      source: 'NHS Jobs'
    }
  }
}

export class UKApprenticeshipsProvider extends BaseJobProvider {
  name = 'UK Apprenticeships (DfE)'
  baseUrl = 'https://api.apprenticeships.education.gov.uk/vacancies'
  rateLimit = 300
  enabled = false // Disabled due to CORS restrictions
  priority = 17

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      page: 1,
      pageSize: 50,
      searchTerm: filters.title || ''
    }
  }

  parseResponse(data: any): Job[] {
    if (!data?.results || !Array.isArray(data.results)) return []

    return data.results.map((job: any) => ({
      id: `dfe-${job.vacancyReference}`,
      title: job.apprenticeshipTitle,
      company: job.employerName || 'Not specified',
      location: job.town || 'UK',
      remote: false,
      salary: job.wageText ? { min: 0, max: 0 } : undefined,
      description: job.description || '',
      requirements: this.parseRequirements(job.description || ''),
      technologies: this.extractTechnologies(job.description || ''),
      experienceLevel: 'entry',
      type: 'apprenticeship',
      postedDate: job.postedDate || new Date().toISOString(),
      featured: false,
      source: 'UK Apprenticeships'
    }))
  }
}

export class NYCJobsProvider extends BaseJobProvider {
  name = 'NYC Government Jobs'
  baseUrl = 'https://data.cityofnewyork.us/resource/kpav-sd4t.json'
  rateLimit = 500
  enabled = false // Disabled due to CORS restrictions
  priority = 18

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      $limit: 50,
      $where: filters.title ? `business_title like '%${filters.title}%'` : undefined
    }
  }

  parseResponse(data: any): Job[] {
    if (!Array.isArray(data)) return []

    return data.map((job: any) => ({
      id: `nyc-${job.job_id}`,
      title: job.business_title,
      company: 'City of New York',
      location: 'New York, NY',
      remote: job.work_location?.toLowerCase().includes('remote') || false,
      salary: job.salary_range_from && job.salary_range_to ? {
        min: Number(job.salary_range_from),
        max: Number(job.salary_range_to)
      } : undefined,
      description: job.job_description || '',
      requirements: this.parseRequirements(job.job_description || ''),
      technologies: this.extractTechnologies(job.job_description || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.posting_date || new Date().toISOString(),
      featured: false,
      source: 'NYC Government Jobs'
    }))
  }
}

export class DOLSeasonalJobsProvider extends BaseJobProvider {
  name = 'U.S. DOL SeasonalJobs'
  baseUrl = 'https://seasonaljobs.dol.gov/feeds'
  rateLimit = 300
  enabled = false // Disabled due to CORS restrictions
  priority = 19

  buildParams(_filters: JobFilters): Record<string, any> {
    return {}
  }

  async makeRequest(_params: Record<string, any>): Promise<any> {
    // This is a feed endpoint, might need different handling
    const response = await this.httpClient.get(`${this.baseUrl}/h2a_jobs.xml`, {
      responseType: 'text'
    })
    return { data: this.xmlParser.parse(response.data) }
  }

  parseResponse(data: any): Job[] {
    const jobs = data?.Jobs?.Job
    if (!jobs) return []
    if (!Array.isArray(jobs)) return [jobs].map(this.parseDOLJob.bind(this))

    return jobs.map(this.parseDOLJob.bind(this))
  }

  private parseDOLJob(job: any): Job {
    return {
      id: `dol-${job.JobId}`,
      title: job.JobTitle,
      company: job.EmployerName || 'Not specified',
      location: job.WorksiteAddress || 'USA',
      remote: false,
      salary: job.BasicRateFrom && job.BasicRateTo ? {
        min: Number(job.BasicRateFrom),
        max: Number(job.BasicRateTo)
      } : undefined,
      description: job.JobDescription || '',
      requirements: this.parseRequirements(job.JobDescription || ''),
      technologies: this.extractTechnologies(job.JobDescription || ''),
      experienceLevel: 'entry',
      type: 'contract',
      postedDate: job.DatePosted || new Date().toISOString(),
      featured: false,
      source: 'DOL Seasonal Jobs'
    }
  }
}

export class BundesagenturProvider extends BaseJobProvider {
  name = 'Bundesagentur für Arbeit (DE)'
  baseUrl = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs'
  rateLimit = 300
  enabled = false // Disabled due to CORS restrictions
  priority = 20

  protected httpClient = axios.create({
    timeout: 30000,
    headers: {
      'User-Agent': 'NAVI Gaming Jobs Aggregator 1.0',
      'X-API-Key': 'jobboerse-jobsuche'
    }
  })

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      page: 1,
      size: 50,
      was: filters.title || '',
      wo: filters.location || ''
    }
  }

  parseResponse(data: any): Job[] {
    if (!data?.stellenangebote || !Array.isArray(data.stellenangebote)) return []

    return data.stellenangebote.map((job: any) => ({
      id: `bundesagentur-${job.stellenangebotsId}`,
      title: job.stellenangebotsTitel,
      company: job.arbeitgeberName || 'Not specified',
      location: job.arbeitsort?.ort || 'Germany',
      remote: job.homeoffice || false,
      salary: job.gehalt?.von && job.gehalt?.bis ? {
        min: job.gehalt.von,
        max: job.gehalt.bis
      } : undefined,
      description: job.beschreibung || '',
      requirements: this.parseRequirements(job.beschreibung || ''),
      technologies: this.extractTechnologies(job.beschreibung || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.angebotsdatum || new Date().toISOString(),
      featured: false,
      source: 'Bundesagentur für Arbeit'
    }))
  }
}

export class WorkNetProvider extends BaseJobProvider {
  name = 'WorkNet (South Korea)'
  baseUrl = 'http://openapi.work.go.kr/opi/opi/opi.do'
  rateLimit = 300
  enabled = !!process.env.VITE_WORKNET_API_KEY
  priority = 21
  apiKey = process.env.VITE_WORKNET_API_KEY

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      authKey: this.apiKey,
      returnType: 'XML',
      callTp: 'L',
      srchType: 'job',
      keyword: filters.title || '',
      region: filters.location || ''
    }
  }

  async makeRequest(params: Record<string, any>): Promise<any> {
    const response = await this.httpClient.get(this.baseUrl, {
      params,
      responseType: 'text'
    })
    return { data: this.xmlParser.parse(response.data) }
  }

  parseResponse(data: any): Job[] {
    const jobs = data?.WantedList?.Wanted
    if (!jobs) return []
    if (!Array.isArray(jobs)) return [jobs].map(this.parseWorkNetJob.bind(this))

    return jobs.map(this.parseWorkNetJob.bind(this))
  }

  private parseWorkNetJob(job: any): Job {
    return {
      id: `worknet-${job.wantedAuthNo}`,
      title: job.wantedTitle,
      company: job.company || 'Not specified',
      location: job.region || 'South Korea',
      remote: false,
      salary: job.salTpNm ? { min: 0, max: 0 } : undefined,
      description: job.jobCont || '',
      requirements: this.parseRequirements(job.jobCont || ''),
      technologies: this.extractTechnologies(job.jobCont || ''),
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: job.regDt || new Date().toISOString(),
      featured: false,
      source: 'WorkNet'
    }
  }
}
