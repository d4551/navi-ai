
import type { Job, JobFilters } from "@/shared/types/jobs";
import { getValidPushSubscription } from "@/shared/services/PushService";
import { logger } from "@/shared/utils/logger";

export interface JobAlert {
  id: string;
  name: string;
  filters: JobFilters;
  frequency: "immediate" | "daily" | "weekly";
  enabled: boolean;
  created: string;
  lastRun: string | null;
  totalNotifications: number;
  channels: AlertChannel[];
}

export interface AlertChannel {
  type: "email" | "push" | "webhook" | "discord" | "slack";
  enabled: boolean;
  config: Record<string, any>;
}

export interface JobApplication {
  id: string;
  jobId: string;
  status: "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
  appliedDate: string;
  lastUpdate: string;
  notes: string;
  documents: ApplicationDocument[];
  interviews: Interview[];
  followUps: FollowUp[];
}

export interface ApplicationDocument {
  id: string;
  type: "resume" | "cover_letter" | "portfolio" | "other";
  name: string;
  url: string;
  uploadDate: string;
}

export interface Interview {
  id: string;
  type: "phone" | "video" | "onsite" | "technical" | "cultural";
  scheduledDate: string;
  duration: number;
  interviewer: string;
  feedback: string;
  outcome: "passed" | "failed" | "pending";
}

export interface FollowUp {
  id: string;
  type:
    | "thank_you"
    | "status_inquiry"
    | "negotiation"
    | "acceptance"
    | "decline";
  date: string;
  content: string;
  response: string | null;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  job: Job;
  timestamp: string;
  read: boolean;
  channels: string[];
}

export class JobAlertsService {
  private readonly STORAGE_KEYS = {
    ALERTS: "gaming-job-alerts",
    APPLICATIONS: "gaming-job-applications",
    NOTIFICATIONS: "gaming-job-notifications",
    PENDING: "gaming-job-pending-notifications",
  };

  private alerts: Map<string, JobAlert> = new Map();
  private applications: Map<string, JobApplication> = new Map();
  private notifications: Map<string, AlertNotification> = new Map();
  private alertIntervals: Map<string, NodeJS.Timeout> = new Map();
  private pendingNotifications: Array<{
    notification: AlertNotification;
    channels: AlertChannel[];
  }> = [];

  constructor() {
    this.loadFromStorage();
    this.startAlertScheduler();

    // Retry queued notifications when connection returns
    try {
      window.addEventListener("online", () => this.flushPending());
    } catch {
    }
  }

  async createAlert(
    name: string,
    filters: JobFilters,
    frequency: JobAlert["frequency"] = "daily",
    channels: AlertChannel[] = [],
  ): Promise<JobAlert> {
    const alert: JobAlert = {
      id: this.generateId(),
      name,
      filters,
      frequency,
      enabled: true,
      created: new Date().toISOString(),
      lastRun: null,
      channels:
          ? channels
          : [{ type: "push", enabled: true, config: {} }],
    };

    this.alerts.set(alert.id, alert);
    this.saveToStorage();
    this.scheduleAlert(alert);

    return alert;
  }

  async updateAlert(
    alertId: string,
    updates: Partial<JobAlert>,
  ): Promise<JobAlert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(alertId, updatedAlert);
    this.saveToStorage();

    // Reschedule if enabled status or frequency changed
    if (updates.enabled !== undefined || updates.frequency !== undefined) {
      this.clearAlertSchedule(alertId);
      if (updatedAlert.enabled) {
        this.scheduleAlert(updatedAlert);
      }
    }

    return updatedAlert;
  }

  async deleteAlert(alertId: string): Promise<void> {
    this.alerts.delete(alertId);
    this.clearAlertSchedule(alertId);
    this.saveToStorage();
  }

  getAlerts(): JobAlert[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );
  }

  getAlert(alertId: string): JobAlert | undefined {
    return this.alerts.get(alertId);
  }

  async toggleAlert(alertId: string): Promise<JobAlert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    return this.updateAlert(alertId, { enabled: !alert.enabled });
  }

  async testAlert(alertId: string): Promise<AlertNotification[]> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    // Create a mock notification and dispatch through configured channels
    const job: Job = {
      id: this.generateId(),
      title: "Sample Game Designer",
      company: "NAVI Studios",
      location: "Remote",
      remote: true,
      hybrid: false,
      description:
        "Design engaging gameplay mechanics and systems for our next title.",
      experienceLevel: "mid",
      type: "full-time",
      postedDate: new Date().toISOString(),
      featured: false,
    };

    const notification: AlertNotification = {
      id: this.generateId(),
      alertId,
      job,
      timestamp: new Date().toISOString(),
      read: false,
      channels: alert.channels.map((c) => c.type),
    };

    // Save + dispatch (queue if offline)
    this.notifications.set(notification.id, notification);
    if (!navigator.onLine) {
      this.enqueuePending(notification, alert.channels);
      this.showInAppToast(
        "Notification queued (offline). It will be sent when online.",
        "info",
      );
    } else {
      const sent = await this.dispatchNotification(
        notification,
        alert.channels,
      );
      this.showInAppToast(
        sent
          ? "Notification sent successfully."
          : "Some channels failed. Check settings.",
        sent ? "success" : "warning",
      );
    }
    alert.lastRun = new Date().toISOString();
    this.alerts.set(alertId, alert);
    this.saveToStorage();
    return [notification];
  }

  async trackApplication(
    jobId: string,
    status: JobApplication["status"] = "applied",
    notes: string = "",
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
    };

    this.applications.set(application.id, application);
    this.saveToStorage();

    return application;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: JobApplication["status"],
    notes?: string,
  ): Promise<JobApplication> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const updatedApplication: JobApplication = {
      ...application,
      status,
      lastUpdate: new Date().toISOString(),
      notes: notes || application.notes,
    };

    this.applications.set(applicationId, updatedApplication);
    this.saveToStorage();

    // Schedule follow-ups based on status
    await this.scheduleFollowUps(updatedApplication);

    return updatedApplication;
  }

  async addApplicationDocument(
    applicationId: string,
    type: ApplicationDocument["type"],
    name: string,
    url: string,
  ): Promise<ApplicationDocument> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const document: ApplicationDocument = {
      id: this.generateId(),
      type,
      name,
      url,
      uploadDate: new Date().toISOString(),
    };

    application.documents.push(document);
    application.lastUpdate = new Date().toISOString();

    this.applications.set(applicationId, application);
    this.saveToStorage();

    return document;
  }

  async scheduleInterview(
    applicationId: string,
    type: Interview["type"],
    scheduledDate: string,
    duration: number,
    interviewer: string,
  ): Promise<Interview> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const interview: Interview = {
      id: this.generateId(),
      type,
      scheduledDate,
      duration,
      interviewer,
      feedback: "",
      outcome: "pending",
    };

    application.interviews.push(interview);
    application.status = "interviewing";
    application.lastUpdate = new Date().toISOString();

    this.applications.set(applicationId, application);
    this.saveToStorage();

    // Create calendar reminder
    await this.createInterviewReminder(interview, application);

    return interview;
  }

  async updateInterviewFeedback(
    applicationId: string,
    interviewId: string,
    feedback: string,
    outcome: Interview["outcome"],
  ): Promise<Interview> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const interview = application.interviews.find((i) => i.id === interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    interview.feedback = feedback;
    interview.outcome = outcome;
    application.lastUpdate = new Date().toISOString();

    this.applications.set(applicationId, application);
    this.saveToStorage();

    return interview;
  }

  async addFollowUp(
    applicationId: string,
    type: FollowUp["type"],
    content: string,
    response?: string,
  ): Promise<FollowUp> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const followUp: FollowUp = {
      id: this.generateId(),
      type,
      date: new Date().toISOString(),
      content,
      response: response || null,
    };

    application.followUps.push(followUp);
    application.lastUpdate = new Date().toISOString();

    this.applications.set(applicationId, application);
    this.saveToStorage();

    return followUp;
  }

  getApplications(): JobApplication[] {
    return Array.from(this.applications.values()).sort(
      (a, b) =>
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime(),
    );
  }

  getApplicationsByStatus(status: JobApplication["status"]): JobApplication[] {
    return this.getApplications().filter((app) => app.status === status);
  }

  getApplicationByJobId(jobId: string): JobApplication | undefined {
    return Array.from(this.applications.values()).find(
      (app) => app.jobId === jobId,
    );
  }

  getApplicationAnalytics(): {
    total: number;
    byStatus: Record<string, number>;
    averageResponseTime: number;
    successRate: number;
    upcomingInterviews: Interview[];
  } {
    const apps = this.getApplications();
    const now = Date.now();

    const upcomingInterviews: Interview[] = [];
    apps.forEach((app) => {
      app.interviews.forEach((interview) => {
        const interviewDate = new Date(interview.scheduledDate).getTime();
        if (interviewDate > now && interviewDate <= now + oneWeek) {
          upcomingInterviews.push(interview);
        }
      });
    });

    const byStatus = apps.reduce(
      (acc, app) => {
        return acc;
      },
      {} as Record<string, number>,
    );

    const responseTimes = apps
      .filter((app) => app.status !== "applied")
      .map(
        (app) =>
          new Date(app.lastUpdate).getTime() -
          new Date(app.appliedDate).getTime(),
      );

    const averageResponseTime =
          responseTimes.length

    const successRate =

    return {
      total: apps.length,
      byStatus,
      averageResponseTime: Math.round(
      ), // days
      successRate: Math.round(successRate),
      upcomingInterviews: upcomingInterviews.sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime(),
      ),
    };
  }

  getNotifications(): AlertNotification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.saveToStorage();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId);
    this.saveToStorage();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications.clear();
    this.saveToStorage();
  }

  private scheduleAlert(alert: JobAlert): void {
    if (!alert.enabled) return;

    const intervalMs = this.getIntervalMs(alert.frequency);

    const intervalId = setInterval(async () => {
      try {
        await this.checkForNewJobs(alert);
      } catch (_error) {
        logger.error(
          `Error running alert ${alert.name}:`,
          error,
          "JobAlertsService",
        );
      }
    }, intervalMs);

    this.alertIntervals.set(alert.id, intervalId);
  }

  private clearAlertSchedule(alertId: string): void {
    const intervalId = this.alertIntervals.get(alertId);
    if (intervalId) {
      clearInterval(intervalId);
      this.alertIntervals.delete(alertId);
    }
  }

  private getIntervalMs(frequency: JobAlert["frequency"]): number {
    switch (frequency) {
      case "immediate":
      case "daily":
      case "weekly":
      default:
    }
  }

  private async checkForNewJobs(alert: JobAlert): Promise<AlertNotification[]> {
    // In real implementation, this would call the JobAPIService
    // For now, return mock notifications
    const notifications: AlertNotification[] = [];

    // Update alert run time
    alert.lastRun = new Date().toISOString();
    this.alerts.set(alert.id, alert);

    return notifications;
  }

  // createNotification removed (unused)

  // Removed unused sendNotification helper

  private async dispatchNotification(
    notification: AlertNotification,
    channels: AlertChannel[],
  ): Promise<boolean> {
    let allOk = true;
    for (const channel of channels) {
      if (!channel.enabled) continue;
      try {
        switch (channel.type) {
          case "push":
            await this.sendPushNotification(notification);
            break;
          case "email":
            await this.sendEmailNotification(notification, channel.config);
            break;
          case "webhook":
            await this.sendWebhookNotification(notification, channel.config);
            break;
          case "discord":
            await this.sendDiscordNotification(notification, channel.config);
            break;
          case "slack":
            await this.sendSlackNotification(notification, channel.config);
            break;
        }
      } catch (_error) {
        console.error(`Failed to send ${channel.type} notification:`, error);
        allOk = false;
        this.enqueuePending(notification, [channel]);
      }
    }
    // Persist pending changes if any
    if (!allOk) this.saveToStorage();
    return allOk;
  }

  private async sendPushNotification(
    notification: AlertNotification,
  ): Promise<void> {
    const subscription = await getValidPushSubscription();
    if (!subscription) {
      logger.warn(
        "Push notification skipped: no valid subscription",
        notification,
        "JobAlertsService",
      );
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(
        `New Gaming Job: ${notification.job.title}`,
        {
          body: `${notification.job.company} - ${notification.job.location}`,
          icon: "/gaming-icon.png",
          tag: notification.id,
        },
      );
    } catch (_err) {
      logger.error(
        "Failed to display push notification",
        err,
        "JobAlertsService",
      );
    }
  }

  private async sendEmailNotification(
    notification: AlertNotification,
    config: any,
  ): Promise<void> {
    const apiKey = config?.apiKey || process.env.VITE_SENDGRID_API_KEY;
    const to = config?.to;
    const from = config?.from || process.env.VITE_SENDGRID_FROM;
    if (!apiKey || !to || !from) {
      logger.warn(
        "Email notification skipped: missing configuration",
        { hasApiKey: !!apiKey, to, from },
        "JobAlertsService",
      );
      return;
    }

    try {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject: `New Gaming Job: ${notification.job.title}`,
          content: [
            {
              type: "text/plain",
              value: `${notification.job.company} - ${notification.job.location}\n\n${notification.job.description}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`SendGrid error ${res.status}: ${errorBody}`);
      }

      logger.info("Email notification sent", notification, "JobAlertsService");
    } catch (_err) {
      logger.error(
        "Failed to send email notification",
        err,
        "JobAlertsService",
      );
      throw err;
    }
  }

  private async sendWebhookNotification(
    notification: AlertNotification,
    config: any,
  ): Promise<void> {
    const url: string | undefined = config?.url || config?.webhookUrl;
    if (!url) return;

    const payload = {
      type: "job_alert",
      notification,
      timestamp: new Date().toISOString(),
    };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config?.headers || {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (
            attempt < maxRetries
          ) {
            logger.warn(
              `Webhook attempt ${attempt} failed with status ${res.status}, retrying`,
              { status: res.status },
              "JobAlertsService",
            );
            continue;
          }
          throw new Error(`Webhook failed: ${res.status}`);
        }
        return;
      } catch (error: any) {
        if (attempt < maxRetries) {
          logger.warn(
            `Webhook attempt ${attempt} error, retrying`,
            error,
            "JobAlertsService",
          );
        } else {
          logger.error(
            "Webhook notification failed",
            error,
            "JobAlertsService",
          );
          throw error;
        }
      }
    }
  }

  private async sendDiscordNotification(
    notification: AlertNotification,
    config: any,
  ): Promise<void> {
    const embed = {
      title: `[GAME] New Gaming Job: ${notification.job.title}`,
      description:
      fields: [
        {
          name: "Company",
          value: String(notification.job.company || "Unknown"),
          inline: true,
        },
        {
          name: "Location",
          value: String(notification.job.location || "N/A"),
          inline: true,
        },
        {
          name: "Experience",
          value: String(notification.job.experienceLevel || "N/A"),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    const url: string | undefined = config?.webhookUrl || config?.url;
    if (!url) return;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) throw new Error(`Discord webhook failed: ${res.status}`);
  }

  private async sendSlackNotification(
    notification: AlertNotification,
    config: any,
  ): Promise<void> {
    const message = {
      text: `[GAME] New Gaming Job Alert`,
      attachments: [
        {
          color: "good",
          title: notification.job.title,
          fields: [
            { title: "Company", value: notification.job.company, short: true },
            {
              title: "Location",
              value: notification.job.location,
              short: true,
            },
            {
              title: "Experience",
              value: notification.job.experienceLevel,
              short: true,
            },
          ],
          footer: "Gaming Jobs Alert",
        },
      ],
    };

    const url: string | undefined = config?.webhookUrl || config?.url;
    if (!url) return;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
  }

  private async scheduleFollowUps(application: JobApplication): Promise<void> {
    const daysSinceLastUpdate = Math.floor(
      (Date.now() - new Date(application.lastUpdate).getTime()) /
    );

    // Suggest follow-ups based on status and time elapsed
    switch (application.status) {
      case "applied":
          // This could trigger a notification system in the future
        }
        break;
      case "interviewing":
          // This could trigger a notification system in the future
        }
        break;
    }
  }

  private async createInterviewReminder(
    interview: Interview,
    application: JobApplication,
  ): Promise<void> {
    // Create calendar event or reminder
    const reminderDate = new Date(interview.scheduledDate);

    if ("Notification" in window && Notification.permission === "granted") {
      const timeout = reminderDate.getTime() - Date.now();
        setTimeout(() => {
          new Notification(`Interview Reminder`, {
            icon: "/interview-icon.png",
          });
        }, timeout);
      }
    }
  }

  private startAlertScheduler(): void {
    // Schedule all enabled alerts
    this.alerts.forEach((alert) => {
      if (alert.enabled) {
        this.scheduleAlert(alert);
      }
    });
  }

  private generateId(): string {
  }

  private loadFromStorage(): void {
    try {
      const alertsData = localStorage.getItem(this.STORAGE_KEYS.ALERTS);
      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        alerts.forEach((alert: JobAlert) => {
          this.alerts.set(alert.id, alert);
        });
      }

      const applicationsData = localStorage.getItem(
        this.STORAGE_KEYS.APPLICATIONS,
      );
      if (applicationsData) {
        const applications = JSON.parse(applicationsData);
        applications.forEach((app: JobApplication) => {
          this.applications.set(app.id, app);
        });
      }

      const notificationsData = localStorage.getItem(
        this.STORAGE_KEYS.NOTIFICATIONS,
      );
      if (notificationsData) {
        const notifications = JSON.parse(notificationsData);
        notifications.forEach((notification: AlertNotification) => {
          this.notifications.set(notification.id, notification);
        });
      }

      const pendingData = localStorage.getItem(this.STORAGE_KEYS.PENDING);
      if (pendingData) {
        try {
          this.pendingNotifications = JSON.parse(pendingData);
        } catch {
          this.pendingNotifications = [];
        }
      }
    } catch (_error) {
      logger.error(
        "Error loading alerts data from storage:",
        error,
        "JobAlertsService",
      );
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.ALERTS,
        JSON.stringify(Array.from(this.alerts.values())),
      );
      localStorage.setItem(
        this.STORAGE_KEYS.APPLICATIONS,
        JSON.stringify(Array.from(this.applications.values())),
      );
      localStorage.setItem(
        this.STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(Array.from(this.notifications.values())),
      );
      localStorage.setItem(
        this.STORAGE_KEYS.PENDING,
        JSON.stringify(this.pendingNotifications),
      );
    } catch (_error) {
      logger.error(
        "Error saving alerts data to storage:",
        error,
        "JobAlertsService",
      );
    }
  }

  private enqueuePending(
    notification: AlertNotification,
    channels: AlertChannel[],
  ): void {
    // Ensure unique by notification id + channel type
    channels.forEach((ch) => {
      this.pendingNotifications.push({ notification, channels: [ch] });
    });
  }

  async flushPending(): Promise<void> {
    if (!this.pendingNotifications.length) return;
    const next = [...this.pendingNotifications];
    this.pendingNotifications = [];
    for (const item of next) {
      try {
        await this.dispatchNotification(item.notification, item.channels);
      } catch (_e) {
        logger.warn(
          "Retry failed, re-queueing notification",
          e,
          "JobAlertsService",
        );
        this.enqueuePending(item.notification, item.channels);
      }
    }
    this.saveToStorage();
    if (!this.pendingNotifications.length) {
      this.showInAppToast("Queued job alerts have been sent.", "success");
    }
  }

  private showInAppToast(
    message: string,
    level: "success" | "info" | "warning" | "error" = "info",
  ): void {
    try {
      const evt = new CustomEvent("job-alert:toast", {
        detail: { message, level },
      });
      window.dispatchEvent(evt);
    } catch {
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ("Notification" in window) {
      return await Notification.requestPermission();
    }
    return "denied";
  }

  destroy(): void {
    this.alertIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.alertIntervals.clear();
  }
}

// Singleton instance
export const jobAlertsService = new JobAlertsService();
