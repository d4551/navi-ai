/* eslint-env browser */

/**
 * Job Application Tracking API
 * Provides comprehensive CRUD operations for managing job applications
 * Integrates with the existing job search system and user data
 */

import type { Job } from '@/shared/types/jobs'

export interface JobApplication {
  id: string
  jobId?: string
  title: string
  company: string
  location: string
  appliedDate: Date
  status: ApplicationStatus
  source: string
  notes?: string
  resumeVersion?: string
  coverLetterVersion?: string
  followUpDate?: Date
  interviewDates?: InterviewEvent[]
  salary?: SalaryInfo
  jobUrl?: string
  contactPerson?: ContactInfo
  requirements?: string[]
  matchScore?: number
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  archived: boolean
  createdAt: Date
  updatedAt: Date
}

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'screening'
  | 'phone_interview'
  | 'technical_interview'
  | 'onsite_interview'
  | 'final_interview'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'rejected'
  | 'withdrawn'
  | 'on_hold'

export interface InterviewEvent {
  id: string
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral'
  date: Date
  duration?: number
  interviewer?: string
  notes?: string
  outcome?: 'pending' | 'passed' | 'failed' | 'rescheduled'
  preparationNotes?: string
}

export interface SalaryInfo {
  min?: number
  max?: number
  currency: string
  type: 'hourly' | 'annual' | 'contract'
  negotiated?: boolean
  benefits?: string[]
}

export interface ContactInfo {
  name: string
  role?: string
  email?: string
  phone?: string
  linkedIn?: string
}

export interface ApplicationStats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  averageResponseTime: number
  successRate: number
  interviewRate: number
  monthlyApplications: Record<string, number>
  topCompanies: Array<{ company: string; count: number }>
  averageTimeToResponse: number
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  company?: string
  location?: string
  dateRange?: { start: Date; end: Date }
  priority?: ('low' | 'medium' | 'high')[]
  tags?: string[]
  archived?: boolean
  hasInterview?: boolean
  salaryRange?: { min: number; max: number }
}

export interface ApplicationSearchOptions {
  filters?: ApplicationFilters
  sortBy?: 'appliedDate' | 'updatedAt' | 'company' | 'priority' | 'matchScore'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class JobApplicationTrackingService {
  private static instance: JobApplicationTrackingService
  private dbName = 'GameDev_JobApplications'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  static getInstance(): JobApplicationTrackingService {
    if (!JobApplicationTrackingService.instance) {
      JobApplicationTrackingService.instance =
        new JobApplicationTrackingService()
    }
    return JobApplicationTrackingService.instance
  }

  private constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // Applications store
        if (!db.objectStoreNames.contains('applications')) {
          const store = db.createObjectStore('applications', { keyPath: 'id' })
          store.createIndex('status', 'status')
          store.createIndex('company', 'company')
          store.createIndex('appliedDate', 'appliedDate')
          store.createIndex('priority', 'priority')
          store.createIndex('archived', 'archived')
          store.createIndex('tags', 'tags', { multiEntry: true })
        }

        // Templates store for reusable application data
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' })
        }
      }
    })
  }

  async createApplication(
    applicationData: Partial<JobApplication>
  ): Promise<JobApplication> {
    if (!this.db) await this.initializeDatabase()

    const application: JobApplication = {
      id: this.generateId(),
      title: applicationData.title || '',
      company: applicationData.company || '',
      location: applicationData.location || '',
      appliedDate: applicationData.appliedDate || new Date(),
      status: applicationData.status || 'draft',
      source: applicationData.source || '',
      tags: applicationData.tags || [],
      priority: applicationData.priority || 'medium',
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...applicationData,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite')
      const store = transaction.objectStore('applications')
      const request = store.add(application)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(application)
    })
  }

  async createFromJob(
    job: Job,
    additionalData?: Partial<JobApplication>
  ): Promise<JobApplication> {
    const applicationData: Partial<JobApplication> = {
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      source: job.source || '',
      jobUrl: job.url,
      requirements: job.requirements,
      matchScore: job.matchScore,
      salary:
        job.salary && typeof job.salary !== 'string'
          ? {
              min: job.salary.min,
              max: job.salary.max,
              currency: job.salary.currency ?? 'USD',
              type: this.normalizeSalaryType(
                job.salary.type ?? job.salary.frequency,
                job.type
              ),
            }
          : undefined,
      ...additionalData,
    }

    return this.createApplication(applicationData)
  }

  async getApplication(id: string): Promise<JobApplication | null> {
    if (!this.db) await this.initializeDatabase()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readonly')
      const store = transaction.objectStore('applications')
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async updateApplication(
    id: string,
    updates: Partial<JobApplication>
  ): Promise<JobApplication> {
    const existing = await this.getApplication(id)
    if (!existing) {
      throw new Error(`Application with ID ${id} not found`)
    }

    const updated: JobApplication = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite')
      const store = transaction.objectStore('applications')
      const request = store.put(updated)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(updated)
    })
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<JobApplication> {
    const updates: Partial<JobApplication> = { status }
    if (notes) {
      updates.notes = notes
    }

    // Set follow-up dates based on status
    if (status === 'applied') {
      updates.followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    } else if (status.includes('interview')) {
      updates.followUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    }

    return this.updateApplication(id, updates)
  }

  async addInterview(
    applicationId: string,
    interview: Omit<InterviewEvent, 'id'>
  ): Promise<JobApplication> {
    const application = await this.getApplication(applicationId)
    if (!application) {
      throw new Error(`Application with ID ${applicationId} not found`)
    }

    const newInterview: InterviewEvent = {
      ...interview,
      id: this.generateId(),
    }

    const interviews = application.interviewDates || []
    interviews.push(newInterview)

    // Update status if this is the first interview
    let status = application.status
    if (interview.type === 'phone' && status === 'applied') {
      status = 'phone_interview'
    } else if (
      interview.type === 'technical' &&
      !status.includes('interview')
    ) {
      status = 'technical_interview'
    }

    return this.updateApplication(applicationId, {
      interviewDates: interviews,
      status,
    })
  }

  async searchApplications(
    options: ApplicationSearchOptions = {}
  ): Promise<JobApplication[]> {
    if (!this.db) await this.initializeDatabase()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readonly')
      const store = transaction.objectStore('applications')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        let results = request.result as JobApplication[]

        // Apply filters
        if (options.filters) {
          results = this.applyFilters(results, options.filters)
        }

        // Apply sorting
        if (options.sortBy) {
          results.sort(
            this.createSortComparator(options.sortBy, options.sortOrder)
          )
        }

        // Apply pagination
        if (options.offset || options.limit) {
          const start = options.offset || 0
          const end = options.limit ? start + options.limit : undefined
          results = results.slice(start, end)
        }

        resolve(results)
      }
    })
  }

  async deleteApplication(id: string): Promise<void> {
    if (!this.db) await this.initializeDatabase()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite')
      const store = transaction.objectStore('applications')
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async archiveApplication(id: string): Promise<JobApplication> {
    return this.updateApplication(id, { archived: true })
  }

  async unarchiveApplication(id: string): Promise<JobApplication> {
    return this.updateApplication(id, { archived: false })
  }

  async getStatistics(): Promise<ApplicationStats> {
    const applications = await this.searchApplications()

    const stats: ApplicationStats = {
      total: applications.length,
      byStatus: {} as Record<ApplicationStatus, number>,
      averageResponseTime: 0,
      successRate: 0,
      interviewRate: 0,
      monthlyApplications: {},
      topCompanies: [],
      averageTimeToResponse: 0,
    }

    // Initialize status counts
    const statuses: ApplicationStatus[] = [
      'draft',
      'applied',
      'screening',
      'phone_interview',
      'technical_interview',
      'onsite_interview',
      'final_interview',
      'offer_received',
      'offer_accepted',
      'offer_declined',
      'rejected',
      'withdrawn',
      'on_hold',
    ]

    statuses.forEach(status => {
      stats.byStatus[status] = 0
    })

    // Calculate statistics
    const companyCounts: Record<string, number> = {}
    let totalResponseTime = 0
    let responsesReceived = 0
    let interviewCount = 0

    applications.forEach(app => {
      // Status counts
      stats.byStatus[app.status]++

      // Company counts
      companyCounts[app.company] = (companyCounts[app.company] || 0) + 1

      // Monthly applications
      const monthKey = app.appliedDate.toISOString().substring(0, 7)
      stats.monthlyApplications[monthKey] =
        (stats.monthlyApplications[monthKey] || 0) + 1

      // Interview rate
      if (app.interviewDates && app.interviewDates.length > 0) {
        interviewCount++
      }

      // Response time calculation
      if (app.status !== 'draft' && app.status !== 'applied') {
        const responseTime = app.updatedAt.getTime() - app.appliedDate.getTime()
        totalResponseTime += responseTime
        responsesReceived++
      }
    })

    // Calculate rates
    const appliedCount = applications.length - stats.byStatus.draft
    stats.successRate =
      appliedCount > 0
        ? (stats.byStatus.offer_accepted / appliedCount) * 100
        : 0
    stats.interviewRate =
      appliedCount > 0 ? (interviewCount / appliedCount) * 100 : 0

    // Average response time in days
    stats.averageResponseTime =
      responsesReceived > 0
        ? totalResponseTime / responsesReceived / (24 * 60 * 60 * 1000)
        : 0

    // Top companies
    stats.topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }))

    return stats
  }

  async getUpcomingTasks(): Promise<
    Array<{
      type: 'follow_up' | 'interview' | 'deadline'
      application: JobApplication
      date: Date
      description: string
    }>
  > {
    const applications = await this.searchApplications({
      filters: { archived: false },
    })

    const tasks: Array<{
      type: 'follow_up' | 'interview' | 'deadline'
      application: JobApplication
      date: Date
      description: string
    }> = []

    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    applications.forEach(app => {
      // Follow-up tasks
      if (app.followUpDate && app.followUpDate <= nextWeek) {
        tasks.push({
          type: 'follow_up',
          application: app,
          date: app.followUpDate,
          description: `Follow up on application to ${app.company}`,
        })
      }

      // Interview tasks
      if (app.interviewDates) {
        app.interviewDates.forEach(interview => {
          if (interview.date >= now && interview.date <= nextWeek) {
            tasks.push({
              type: 'interview',
              application: app,
              date: interview.date,
              description: `${interview.type} interview with ${app.company}`,
            })
          }
        })
      }
    })

    return tasks.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  private applyFilters(
    applications: JobApplication[],
    filters: ApplicationFilters
  ): JobApplication[] {
    return applications.filter(app => {
      if (filters.status && !filters.status.includes(app.status)) return false
      if (
        filters.company &&
        !app.company.toLowerCase().includes(filters.company.toLowerCase())
      )
        return false
      if (
        filters.location &&
        !app.location.toLowerCase().includes(filters.location.toLowerCase())
      )
        return false
      if (filters.priority && !filters.priority.includes(app.priority))
        return false
      if (filters.archived !== undefined && app.archived !== filters.archived)
        return false
      if (filters.hasInterview !== undefined) {
        const hasInterview = app.interviewDates && app.interviewDates.length > 0
        if (hasInterview !== filters.hasInterview) return false
      }
      if (filters.tags && !filters.tags.some(tag => app.tags.includes(tag)))
        return false
      if (filters.dateRange) {
        if (
          app.appliedDate < filters.dateRange.start ||
          app.appliedDate > filters.dateRange.end
        )
          return false
      }
      if (filters.salaryRange && app.salary) {
        const salary = app.salary.max || app.salary.min || 0
        if (
          salary < filters.salaryRange.min ||
          salary > filters.salaryRange.max
        )
          return false
      }
      return true
    })
  }

  private createSortComparator(
    sortBy: NonNullable<ApplicationSearchOptions['sortBy']>,
    order: ApplicationSearchOptions['sortOrder'] = 'desc'
  ) {
    const multiplier = order === 'asc' ? 1 : -1

    return (a: JobApplication, b: JobApplication) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (aValue < bValue) return -1 * multiplier
      if (aValue > bValue) return 1 * multiplier
      return 0
    }
  }

  private normalizeSalaryType(
    input?: string | null,
    jobType?: string
  ): SalaryInfo['type'] {
    const t = (input || '').toLowerCase()
    if (t === 'yearly' || t === 'annual') return 'annual'
    if (t === 'hourly') return 'hourly'
    if (t === 'monthly')
      return jobType === 'contract' || jobType === 'freelance'
        ? 'contract'
        : 'annual'
    if (t === 'contract') return 'contract'
    return jobType === 'contract' || jobType === 'freelance'
      ? 'contract'
      : 'annual'
  }

  private generateId(): string {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const jobApplicationTrackingService =
  JobApplicationTrackingService.getInstance()
