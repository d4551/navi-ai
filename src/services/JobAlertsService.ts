/**
 * CANONICAL Job Alerts and Tracking Service
 * Real-time job notifications and application tracking system
 */

import type { Job, JobFilters } from '@/shared/types/jobs'
import { getValidPushSubscription } from '@/shared/services/PushService'
import { logger } from '@/shared/utils/logger'

export interface JobAlert {
  id: string
  name: string
  filters: JobFilters
  frequency: 'immediate' | 'daily' | 'weekly'
  enabled: boolean
  created: string
  lastRun: string | null
  totalNotifications: number
  channels: AlertChannel[]
}

export interface AlertChannel {
  type: 'email' | 'push' | 'webhook' | 'discord' | 'slack'
  enabled: boolean
  config: Record<string, any>
}

export interface JobApplication {
  id: string
  jobId: string
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  appliedDate: string
  lastUpdate: string
  notes: string
  documents: ApplicationDocument[]
  interviews: Interview[]
  followUps: FollowUp[]
}

export interface ApplicationDocument {
  id: string
  type: 'resume' | 'cover_letter' | 'portfolio' | 'other'
  name: string
  url: string
  uploadDate: string
}

export interface Interview {
  id: string
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'cultural'
  scheduledDate: string
  duration: number
  interviewer: string
  feedback: string
  outcome: 'passed' | 'failed' | 'pending'
}

export interface FollowUp {
  id: string
  type:
    | 'thank_you'
    | 'status_inquiry'
    | 'negotiation'
    | 'acceptance'
    | 'decline'
  date: string
  content: string
  response: string | null
}

export interface AlertNotification {
  id: string
  alertId: string
  job: Job
  timestamp: string
  read: boolean
  channels: string[]
}

export class JobAlertsService {
  private readonly STORAGE_KEYS = {
    ALERTS: 'gaming-job-alerts',
    APPLICATIONS: 'gaming-job-applications',
    NOTIFICATIONS: 'gaming-job-notifications',
    PENDING: 'gaming-job-pending-notifications',
  }

  private alerts: Map<string, JobAlert> = new Map()
  private applications: Map<string, JobApplication> = new Map()
  private notifications: Map<string, AlertNotification> = new Map()
  private alertIntervals: Map<string, NodeJS.Timeout> = new Map()
  private pendingNotifications: Array<{
    notification: AlertNotification
    channels: AlertChannel[]
  }> = []

  constructor() {
    this.loadFromStorage()
    this.startAlertScheduler()

    // Retry queued notifications when connection returns
    try {
      window.addEventListener('online', () => this.flushPending())
    } catch {
      /* noop in non-browser */
    }
  }

  /**
   * Create a new job alert
   */
  async createAlert(
    name: string,
    filters: JobFilters,
    frequency: JobAlert['frequency'] = 'daily',
    channels: AlertChannel[] = []
  ): Promise<JobAlert> {
    const alert: JobAlert = {
      id: this.generateId(),
      name,
      filters,
      frequency,
      enabled: true,
      created: new Date().toISOString(),
      lastRun: null,
      totalNotifications: 0,
      channels:
        channels.length > 0
          ? channels
          : [{ type: 'push', enabled: true, config: {} }],
    }

    this.alerts.set(alert.id, alert)
    this.saveToStorage()
    this.scheduleAlert(alert)

    return alert
  }

  /**
   * Update existing job alert
   */
  async updateAlert(
    alertId: string,
    updates: Partial<JobAlert>
  ): Promise<JobAlert> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      throw new Error('Alert not found')
    }

    const updatedAlert = { ...alert, ...updates }
    this.alerts.set(alertId, updatedAlert)
    this.saveToStorage()

    // Reschedule if enabled status or frequency changed
    if (updates.enabled !== undefined || updates.frequency !== undefined) {
      this.clearAlertSchedule(alertId)
      if (updatedAlert.enabled) {
        this.scheduleAlert(updatedAlert)
      }
    }

    return updatedAlert
  }

  /**
   * Delete job alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    this.alerts.delete(alertId)
    this.clearAlertSchedule(alertId)
    this.saveToStorage()
  }

  /**
   * Get all alerts
   */
  getAlerts(): JobAlert[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    )
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): JobAlert | undefined {
    return this.alerts.get(alertId)
  }

  /**
   * Toggle alert enabled status
   */
  async toggleAlert(alertId: string): Promise<JobAlert> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      throw new Error('Alert not found')
    }

    return this.updateAlert(alertId, { enabled: !alert.enabled })
  }

  /**
   * Test alert (run immediately)
   */
  async testAlert(alertId: string): Promise<AlertNotification[]> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      throw new Error('Alert not found')
    }

    // Create a mock notification and dispatch through configured channels
    const job: Job = {
      id: this.generateId(),
      title: 'Sample Game Designer',
      company: 'NAVI Studios',
      location: 'Remote',
      remote: true,
      hybrid: false,
      salary: { min: 90000, max: 130000 },
      description:
        'Design engaging gameplay mechanics and systems for our next title.',
      requirements: ['3+ years in game design', 'Experience with Unity/Unreal'],
      technologies: ['Unity', 'C#', 'JIRA'],
      experienceLevel: 'mid',
      type: 'full-time',
      postedDate: new Date().toISOString(),
      featured: false,
      matchScore: 85,
    }

    const notification: AlertNotification = {
      id: this.generateId(),
      alertId,
      job,
      timestamp: new Date().toISOString(),
      read: false,
      channels: alert.channels.map(c => c.type),
    }

    // Save + dispatch (queue if offline)
    this.notifications.set(notification.id, notification)
    if (!navigator.onLine) {
      this.enqueuePending(notification, alert.channels)
      this.showInAppToast(
        'Notification queued (offline). It will be sent when online.',
        'info'
      )
    } else {
      const sent = await this.dispatchNotification(notification, alert.channels)
      this.showInAppToast(
        sent
          ? 'Notification sent successfully.'
          : 'Some channels failed. Check settings.',
        sent ? 'success' : 'warning'
      )
    }
    alert.totalNotifications += 1
    alert.lastRun = new Date().toISOString()
    this.alerts.set(alertId, alert)
    this.saveToStorage()
    return [notification]
  }

  /**
   * Track job application
   */
  async trackApplication(
    jobId: string,
    status: JobApplication['status'] = 'applied',
    notes: string = ''
  ): Promise<JobApplication> {
    const application: JobApplication = {
      id: this.generateId(),
      jobId,
      status,
      appliedDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes,
      documents: [],
      interviews: [],
      followUps: [],
    }

    this.applications.set(application.id, application)
    this.saveToStorage()

    return application
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    status: JobApplication['status'],
    notes?: string
  ): Promise<JobApplication> {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    const updatedApplication: JobApplication = {
      ...application,
      status,
      lastUpdate: new Date().toISOString(),
      notes: notes || application.notes,
    }

    this.applications.set(applicationId, updatedApplication)
    this.saveToStorage()

    // Schedule follow-ups based on status
    await this.scheduleFollowUps(updatedApplication)

    return updatedApplication
  }

  /**
   * Add document to application
   */
  async addApplicationDocument(
    applicationId: string,
    type: ApplicationDocument['type'],
    name: string,
    url: string
  ): Promise<ApplicationDocument> {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    const document: ApplicationDocument = {
      id: this.generateId(),
      type,
      name,
      url,
      uploadDate: new Date().toISOString(),
    }

    application.documents.push(document)
    application.lastUpdate = new Date().toISOString()

    this.applications.set(applicationId, application)
    this.saveToStorage()

    return document
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(
    applicationId: string,
    type: Interview['type'],
    scheduledDate: string,
    duration: number,
    interviewer: string
  ): Promise<Interview> {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    const interview: Interview = {
      id: this.generateId(),
      type,
      scheduledDate,
      duration,
      interviewer,
      feedback: '',
      outcome: 'pending',
    }

    application.interviews.push(interview)
    application.status = 'interviewing'
    application.lastUpdate = new Date().toISOString()

    this.applications.set(applicationId, application)
    this.saveToStorage()

    // Create calendar reminder
    await this.createInterviewReminder(interview, application)

    return interview
  }

  /**
   * Update interview feedback
   */
  async updateInterviewFeedback(
    applicationId: string,
    interviewId: string,
    feedback: string,
    outcome: Interview['outcome']
  ): Promise<Interview> {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    const interview = application.interviews.find(i => i.id === interviewId)
    if (!interview) {
      throw new Error('Interview not found')
    }

    interview.feedback = feedback
    interview.outcome = outcome
    application.lastUpdate = new Date().toISOString()

    this.applications.set(applicationId, application)
    this.saveToStorage()

    return interview
  }

  /**
   * Add follow-up action
   */
  async addFollowUp(
    applicationId: string,
    type: FollowUp['type'],
    content: string,
    response?: string
  ): Promise<FollowUp> {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    const followUp: FollowUp = {
      id: this.generateId(),
      type,
      date: new Date().toISOString(),
      content,
      response: response || null,
    }

    application.followUps.push(followUp)
    application.lastUpdate = new Date().toISOString()

    this.applications.set(applicationId, application)
    this.saveToStorage()

    return followUp
  }

  /**
   * Get all applications
   */
  getApplications(): JobApplication[] {
    return Array.from(this.applications.values()).sort(
      (a, b) =>
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
    )
  }

  /**
   * Get applications by status
   */
  getApplicationsByStatus(status: JobApplication['status']): JobApplication[] {
    return this.getApplications().filter(app => app.status === status)
  }

  /**
   * Get application by job ID
   */
  getApplicationByJobId(jobId: string): JobApplication | undefined {
    return Array.from(this.applications.values()).find(
      app => app.jobId === jobId
    )
  }

  /**
   * Get application analytics
   */
  getApplicationAnalytics(): {
    total: number
    byStatus: Record<string, number>
    averageResponseTime: number
    successRate: number
    upcomingInterviews: Interview[]
  } {
    const apps = this.getApplications()
    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000

    const upcomingInterviews: Interview[] = []
    apps.forEach(app => {
      app.interviews.forEach(interview => {
        const interviewDate = new Date(interview.scheduledDate).getTime()
        if (interviewDate > now && interviewDate <= now + oneWeek) {
          upcomingInterviews.push(interview)
        }
      })
    })

    const byStatus = apps.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const responseTimes = apps
      .filter(app => app.status !== 'applied')
      .map(
        app =>
          new Date(app.lastUpdate).getTime() -
          new Date(app.appliedDate).getTime()
      )

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0

    const successRate =
      apps.length > 0 ? ((byStatus.offered || 0) / apps.length) * 100 : 0

    return {
      total: apps.length,
      byStatus,
      averageResponseTime: Math.round(
        averageResponseTime / (1000 * 60 * 60 * 24)
      ), // days
      successRate: Math.round(successRate),
      upcomingInterviews: upcomingInterviews.sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      ),
    }
  }

  /**
   * Get all notifications
   */
  getNotifications(): AlertNotification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId)
    if (notification) {
      notification.read = true
      this.saveToStorage()
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    this.notifications.forEach(notification => {
      notification.read = true
    })
    this.saveToStorage()
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId)
    this.saveToStorage()
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    this.notifications.clear()
    this.saveToStorage()
  }

  /**
   * Private: Schedule alert based on frequency
   */
  private scheduleAlert(alert: JobAlert): void {
    if (!alert.enabled) return

    const intervalMs = this.getIntervalMs(alert.frequency)

    const intervalId = setInterval(async () => {
      try {
        await this.checkForNewJobs(alert)
      } catch (error) {
        logger.error(
          `Error running alert ${alert.name}:`,
          error,
          'JobAlertsService'
        )
      }
    }, intervalMs)

    this.alertIntervals.set(alert.id, intervalId)
  }

  /**
   * Private: Clear alert schedule
   */
  private clearAlertSchedule(alertId: string): void {
    const intervalId = this.alertIntervals.get(alertId)
    if (intervalId) {
      clearInterval(intervalId)
      this.alertIntervals.delete(alertId)
    }
  }

  /**
   * Private: Get interval in milliseconds
   */
  private getIntervalMs(frequency: JobAlert['frequency']): number {
    switch (frequency) {
      case 'immediate':
        return 5 * 60 * 1000 // 5 minutes
      case 'daily':
        return 24 * 60 * 60 * 1000 // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000 // 7 days
      default:
        return 24 * 60 * 60 * 1000
    }
  }

  /**
   * Private: Check for new jobs matching alert criteria
   */
  private async checkForNewJobs(alert: JobAlert): Promise<AlertNotification[]> {
    // In real implementation, this would call the JobAPIService
    // For now, return mock notifications
    const notifications: AlertNotification[] = []

    // Update alert run time
    alert.lastRun = new Date().toISOString()
    this.alerts.set(alert.id, alert)

    return notifications
  }

  // createNotification removed (unused)

  // Removed unused sendNotification helper

  /**
   * Private: Send push notification
   */
  private async dispatchNotification(
    notification: AlertNotification,
    channels: AlertChannel[]
  ): Promise<boolean> {
    let allOk = true
    for (const channel of channels) {
      if (!channel.enabled) continue
      try {
        switch (channel.type) {
          case 'push':
            await this.sendPushNotification(notification)
            break
          case 'email':
            await this.sendEmailNotification(notification, channel.config)
            break
          case 'webhook':
            await this.sendWebhookNotification(notification, channel.config)
            break
          case 'discord':
            await this.sendDiscordNotification(notification, channel.config)
            break
          case 'slack':
            await this.sendSlackNotification(notification, channel.config)
            break
        }
      } catch (error) {
        console.error(`Failed to send ${channel.type} notification:`, error)
        allOk = false
        this.enqueuePending(notification, [channel])
      }
    }
    // Persist pending changes if any
    if (!allOk) this.saveToStorage()
    return allOk
  }

  private async sendPushNotification(
    notification: AlertNotification
  ): Promise<void> {
    const subscription = await getValidPushSubscription()
    if (!subscription) {
      logger.warn(
        'Push notification skipped: no valid subscription',
        notification,
        'JobAlertsService'
      )
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(
        `New Gaming Job: ${notification.job.title}`,
        {
          body: `${notification.job.company} - ${notification.job.location}`,
          icon: '/gaming-icon.png',
          tag: notification.id,
        }
      )
    } catch (err) {
      logger.error(
        'Failed to display push notification',
        err,
        'JobAlertsService'
      )
    }
  }

  /**
   * Private: Send email notification
   */
  private async sendEmailNotification(
    notification: AlertNotification,
    config: any
  ): Promise<void> {
    const apiKey = config?.apiKey || process.env.VITE_SENDGRID_API_KEY
    const to = config?.to
    const from = config?.from || process.env.VITE_SENDGRID_FROM
    if (!apiKey || !to || !from) {
      logger.warn(
        'Email notification skipped: missing configuration',
        { hasApiKey: !!apiKey, to, from },
        'JobAlertsService'
      )
      return
    }

    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject: `New Gaming Job: ${notification.job.title}`,
          content: [
            {
              type: 'text/plain',
              value: `${notification.job.company} - ${notification.job.location}\n\n${notification.job.description}`,
            },
          ],
        }),
      })

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '')
        throw new Error(`SendGrid error ${res.status}: ${errorBody}`)
      }

      logger.info('Email notification sent', notification, 'JobAlertsService')
    } catch (err) {
      logger.error('Failed to send email notification', err, 'JobAlertsService')
      throw err
    }
  }

  /**
   * Private: Send webhook notification
   */
  private async sendWebhookNotification(
    notification: AlertNotification,
    config: any
  ): Promise<void> {
    const url: string | undefined = config?.url || config?.webhookUrl
    if (!url) return

    const payload = {
      type: 'job_alert',
      notification,
      timestamp: new Date().toISOString(),
    }

    const maxRetries = 3
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config?.headers || {}),
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          if (
            (res.status >= 500 || res.status === 429) &&
            attempt < maxRetries
          ) {
            logger.warn(
              `Webhook attempt ${attempt} failed with status ${res.status}, retrying`,
              { status: res.status },
              'JobAlertsService'
            )
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw new Error(`Webhook failed: ${res.status}`)
        }
        return
      } catch (error: any) {
        if (attempt < maxRetries) {
          logger.warn(
            `Webhook attempt ${attempt} error, retrying`,
            error,
            'JobAlertsService'
          )
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        } else {
          logger.error('Webhook notification failed', error, 'JobAlertsService')
          throw error
        }
      }
    }
  }

  /**
   * Private: Send Discord notification
   */
  private async sendDiscordNotification(
    notification: AlertNotification,
    config: any
  ): Promise<void> {
    const embed = {
      title: `[GAME] New Gaming Job: ${notification.job.title}`,
      description:
        String(notification.job.description || '').substring(0, 200) + '...',
      color: 0x5865f2,
      fields: [
        {
          name: 'Company',
          value: String(notification.job.company || 'Unknown'),
          inline: true,
        },
        {
          name: 'Location',
          value: String(notification.job.location || 'N/A'),
          inline: true,
        },
        {
          name: 'Experience',
          value: String(notification.job.experienceLevel || 'N/A'),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    }

    const url: string | undefined = config?.webhookUrl || config?.url
    if (!url) return
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })
    if (!res.ok) throw new Error(`Discord webhook failed: ${res.status}`)
  }

  /**
   * Private: Send Slack notification
   */
  private async sendSlackNotification(
    notification: AlertNotification,
    config: any
  ): Promise<void> {
    const message = {
      text: `[GAME] New Gaming Job Alert`,
      attachments: [
        {
          color: 'good',
          title: notification.job.title,
          title_link: `#/jobs/${notification.job.id}`,
          fields: [
            { title: 'Company', value: notification.job.company, short: true },
            {
              title: 'Location',
              value: notification.job.location,
              short: true,
            },
            {
              title: 'Experience',
              value: notification.job.experienceLevel,
              short: true,
            },
          ],
          footer: 'Gaming Jobs Alert',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }

    const url: string | undefined = config?.webhookUrl || config?.url
    if (!url) return
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`)
  }

  /**
   * Private: Schedule automatic follow-ups
   */
  private async scheduleFollowUps(application: JobApplication): Promise<void> {
    const daysSinceLastUpdate = Math.floor(
      (Date.now() - new Date(application.lastUpdate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // Suggest follow-ups based on status and time elapsed
    switch (application.status) {
      case 'applied':
        if (daysSinceLastUpdate >= 7) {
          // Consider following up on application after 1 week
          // This could trigger a notification system in the future
        }
        break
      case 'interviewing':
        if (daysSinceLastUpdate >= 3) {
          // Consider sending thank you or status inquiry after 3 days
          // This could trigger a notification system in the future
        }
        break
    }
  }

  /**
   * Private: Create interview reminder
   */
  private async createInterviewReminder(
    interview: Interview,
    application: JobApplication
  ): Promise<void> {
    // Create calendar event or reminder
    const reminderDate = new Date(interview.scheduledDate)
    reminderDate.setHours(reminderDate.getHours() - 1) // 1 hour before

    if ('Notification' in window && Notification.permission === 'granted') {
      const timeout = reminderDate.getTime() - Date.now()
      if (timeout > 0) {
        setTimeout(() => {
          new Notification(`Interview Reminder`, {
            body: `${interview.type} interview for ${application.jobId} in 1 hour`,
            icon: '/interview-icon.png',
          })
        }, timeout)
      }
    }
  }

  /**
   * Private: Start alert scheduler
   */
  private startAlertScheduler(): void {
    // Schedule all enabled alerts
    this.alerts.forEach(alert => {
      if (alert.enabled) {
        this.scheduleAlert(alert)
      }
    })
  }

  /**
   * Private: Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Private: Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const alertsData = localStorage.getItem(this.STORAGE_KEYS.ALERTS)
      if (alertsData) {
        const alerts = JSON.parse(alertsData)
        alerts.forEach((alert: JobAlert) => {
          this.alerts.set(alert.id, alert)
        })
      }

      const applicationsData = localStorage.getItem(
        this.STORAGE_KEYS.APPLICATIONS
      )
      if (applicationsData) {
        const applications = JSON.parse(applicationsData)
        applications.forEach((app: JobApplication) => {
          this.applications.set(app.id, app)
        })
      }

      const notificationsData = localStorage.getItem(
        this.STORAGE_KEYS.NOTIFICATIONS
      )
      if (notificationsData) {
        const notifications = JSON.parse(notificationsData)
        notifications.forEach((notification: AlertNotification) => {
          this.notifications.set(notification.id, notification)
        })
      }

      const pendingData = localStorage.getItem(this.STORAGE_KEYS.PENDING)
      if (pendingData) {
        try {
          this.pendingNotifications = JSON.parse(pendingData)
        } catch {
          this.pendingNotifications = []
        }
      }
    } catch (error) {
      logger.error(
        'Error loading alerts data from storage:',
        error,
        'JobAlertsService'
      )
    }
  }

  /**
   * Private: Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.ALERTS,
        JSON.stringify(Array.from(this.alerts.values()))
      )
      localStorage.setItem(
        this.STORAGE_KEYS.APPLICATIONS,
        JSON.stringify(Array.from(this.applications.values()))
      )
      localStorage.setItem(
        this.STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(Array.from(this.notifications.values()))
      )
      localStorage.setItem(
        this.STORAGE_KEYS.PENDING,
        JSON.stringify(this.pendingNotifications)
      )
    } catch (error) {
      logger.error(
        'Error saving alerts data to storage:',
        error,
        'JobAlertsService'
      )
    }
  }

  private enqueuePending(
    notification: AlertNotification,
    channels: AlertChannel[]
  ): void {
    // Ensure unique by notification id + channel type
    channels.forEach(ch => {
      this.pendingNotifications.push({ notification, channels: [ch] })
    })
  }

  async flushPending(): Promise<void> {
    if (!this.pendingNotifications.length) return
    const next = [...this.pendingNotifications]
    this.pendingNotifications = []
    for (const item of next) {
      try {
        await this.dispatchNotification(item.notification, item.channels)
      } catch (e) {
        logger.warn(
          'Retry failed, re-queueing notification',
          e,
          'JobAlertsService'
        )
        this.enqueuePending(item.notification, item.channels)
      }
    }
    this.saveToStorage()
    if (!this.pendingNotifications.length) {
      this.showInAppToast('Queued job alerts have been sent.', 'success')
    }
  }

  private showInAppToast(
    message: string,
    level: 'success' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    try {
      const evt = new CustomEvent('job-alert:toast', {
        detail: { message, level },
      })
      window.dispatchEvent(evt)
    } catch {
      /* no-op */
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  /**
   * Cleanup: Stop all alert schedulers
   */
  destroy(): void {
    this.alertIntervals.forEach(intervalId => {
      clearInterval(intervalId)
    })
    this.alertIntervals.clear()
  }
}

// Singleton instance
export const jobAlertsService = new JobAlertsService()
