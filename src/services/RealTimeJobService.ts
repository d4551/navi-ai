
// Lightweight browser-friendly event emitter (replaces Node 'events')
class SimpleEmitter {
  private listeners: Record<string, Array<(..._args: any[]) => void>> = {};
  on(event: string, cb: (..._args: any[]) => void) {
    (this.listeners[event] ||= []).push(cb);
    return this;
  }
  off(event: string, cb: (..._args: any[]) => void) {
    const arr = this.listeners[event];
    if (!arr) return this;
    this.listeners[event] = arr.filter((fn) => fn !== cb);
    return this;
  }
  emit(event: string, ..._args: any[]) {
    const arr = this.listeners[event];
    if (!arr) return false;
    arr.slice().forEach((fn) => {
      try {
        fn(..._args);
      } catch {
      }
    });
  }
  removeAllListeners(event?: string) {
    if (event) delete this.listeners[event];
    else this.listeners = {};
    return this;
  }
}
import { canonicalJobService as refactoredJobAPIService } from "./CanonicalJobService";
import type { Job, JobFilters } from "@/shared/types/jobs";
import { logger } from "@/shared/utils/logger";
import { unifiedStorage } from "@/utils/storage";

export interface JobAlert {
  id: string;
  name: string;
  filters: JobFilters;
  enabled: boolean;
  lastChecked: Date;
  totalMatches: number;
  newMatches: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: Date;
}

export interface JobUpdate {
  type: "new" | "updated" | "removed";
  job: Job;
  alert?: JobAlert;
  timestamp: Date;
}

export interface RealTimeJobStats {
  totalAlerts: number;
  activeAlerts: number;
  newJobsToday: number;
  lastUpdateTime: Date | null;
  isConnected: boolean;
}

export class RealTimeJobService extends SimpleEmitter {
  private static instance: RealTimeJobService;
  private isRunning = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private jobAlerts: Map<string, JobAlert> = new Map();
  private lastSeenJobs: Map<string, Set<string>> = new Map(); // alertId -> Set of job IDs

  static getInstance(): RealTimeJobService {
    if (!RealTimeJobService.instance) {
      RealTimeJobService.instance = new RealTimeJobService();
    }
    return RealTimeJobService.instance;
  }

  constructor() {
    super();
    this.loadAlerts();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    logger.info("Starting real-time job service");
    this.isRunning = true;

    // Load saved alerts
    await this.loadAlerts();

    // Start periodic updates
    this.scheduleUpdates();

    // Initial check for all alerts
    await this.checkAllAlerts();

    this.emit("service-started");
  }

  stop(): void {
    if (!this.isRunning) return;

    logger.info("Stopping real-time job service");
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.emit("service-stopped");
  }

  // Job Alert Management
  async createAlert(
    name: string,
    filters: JobFilters,
    options: Partial<JobAlert> = {},
  ): Promise<JobAlert> {
    if (this.jobAlerts.size >= this.MAX_ALERTS) {
      throw new Error(`Maximum of ${this.MAX_ALERTS} job alerts allowed`);
    }

    const alert: JobAlert = {
      id: this.generateAlertId(),
      name,
      filters,
      enabled: true,
      emailNotifications: options.emailNotifications ?? false,
      pushNotifications: options.pushNotifications ?? true,
      createdAt: new Date(),
      ...options,
    };

    this.jobAlerts.set(alert.id, alert);
    this.lastSeenJobs.set(alert.id, new Set());

    await this.saveAlerts();

    // Check the new alert immediately
    await this.checkAlert(alert.id);

    logger.info(`Created job alert: ${alert.name}`);
    this.emit("alert-created", alert);

    return alert;
  }

  async updateAlert(
    alertId: string,
    updates: Partial<JobAlert>,
  ): Promise<JobAlert> {
    const alert = this.jobAlerts.get(alertId);
    if (!alert) {
      throw new Error("Job alert not found");
    }

    const updatedAlert = { ...alert, ...updates };
    this.jobAlerts.set(alertId, updatedAlert);

    await this.saveAlerts();

    logger.info(`Updated job alert: ${updatedAlert.name}`);
    this.emit("alert-updated", updatedAlert);

    return updatedAlert;
  }

  async deleteAlert(alertId: string): Promise<void> {
    const alert = this.jobAlerts.get(alertId);
    if (!alert) return;

    this.jobAlerts.delete(alertId);
    this.lastSeenJobs.delete(alertId);

    await this.saveAlerts();

    logger.info(`Deleted job alert: ${alert.name}`);
    this.emit("alert-deleted", alert);
  }

  async toggleAlert(alertId: string): Promise<JobAlert> {
    const alert = this.jobAlerts.get(alertId);
    if (!alert) {
      throw new Error("Job alert not found");
    }

    alert.enabled = !alert.enabled;
    this.jobAlerts.set(alertId, alert);

    await this.saveAlerts();

    logger.info(
      `${alert.enabled ? "Enabled" : "Disabled"} job alert: ${alert.name}`,
    );
    this.emit("alert-toggled", alert);

    return alert;
  }

  getAlerts(): JobAlert[] {
    return Array.from(this.jobAlerts.values());
  }

  getAlert(alertId: string): JobAlert | undefined {
    return this.jobAlerts.get(alertId);
  }

  // Real-time checking
  private scheduleUpdates(): void {
    this.updateInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.checkAllAlerts();
      }
    }, this.UPDATE_INTERVAL);
  }

  private async checkAllAlerts(): Promise<void> {
    if (!this.isRunning) return;

    const enabledAlerts = Array.from(this.jobAlerts.values()).filter(
      (alert) => alert.enabled,
    );

    logger.debug(`Checking ${enabledAlerts.length} enabled job alerts`);

    for (const alert of enabledAlerts) {
      try {
        await this.checkAlert(alert.id);

        // Small delay between checks to avoid rate limiting
      } catch (_error) {
        logger.error(`Failed to check alert ${alert.name}:`, error);
      }
    }

    this.emit("alerts-checked", {
      totalChecked: enabledAlerts.length,
      timestamp: new Date(),
    });
  }

  private async checkAlert(alertId: string): Promise<void> {
    const alert = this.jobAlerts.get(alertId);
    if (!alert || !alert.enabled) return;

    try {
      // Search for jobs matching the alert criteria via canonical provider registry
      const response = await refactoredJobAPIService.searchJobs(alert.filters);
      const currentJobs = response.jobs;

      // Get previously seen jobs for this alert
      const seenJobIds = this.lastSeenJobs.get(alertId) || new Set();
      const currentJobIds = new Set(currentJobs.map((job) => job.id));

      // Find new jobs
      const newJobs = currentJobs.filter((job) => !seenJobIds.has(job.id));

      // Update alert stats
      alert.lastChecked = new Date();
      alert.totalMatches = currentJobs.length;
      alert.newMatches = newJobs.length;

      // Update seen jobs
      this.lastSeenJobs.set(alertId, currentJobIds);
      this.jobAlerts.set(alertId, alert);

        logger.info(
          `Found ${newJobs.length} new jobs for alert: ${alert.name}`,
        );

        // Emit new job events
        for (const job of newJobs) {
          const update: JobUpdate = {
            type: "new",
            job,
            alert,
            timestamp: new Date(),
          };

          this.emit("new-job", update);
        }

        // Send notifications if enabled
        if (alert.pushNotifications) {
          await this.sendPushNotification(alert, newJobs);
        }

        if (alert.emailNotifications) {
          await this.sendEmailNotification(alert, newJobs);
        }
      }

      await this.saveAlerts();
    } catch (_error) {
      logger.error(`Error checking alert ${alert.name}:`, error);
    }
  }

  // Notifications
  private async sendPushNotification(
    alert: JobAlert,
    newJobs: Job[],
  ): Promise<void> {
    if (typeof window === "undefined" || !window.Notification) return;

    if (Notification.permission === "granted") {
      const notification = new Notification(`New Jobs Found: ${alert.name}`, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `job-alert-${alert.id}`,
        data: {
          alertId: alert.id,
          jobs: newJobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.company,
          })),
        },
      });

      notification.onclick = () => {
        // Focus the app and navigate to jobs page
        window.focus();
        this.emit("notification-clicked", { alert, jobs: newJobs });
        notification.close();
      };

    }
  }

  private async sendEmailNotification(
    alert: JobAlert,
    newJobs: Job[],
  ): Promise<void> {
    // Email notifications would require a backend service
    // For now, we'll just log the intent
    logger.info(
      `Would send email notification for alert: ${alert.name} with ${newJobs.length} new jobs`,
    );

    // In a real implementation, this would call a backend API to send emails
    // Example:
    // await fetch('/api/notifications/email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     alertId: alert.id,
    //     alertName: alert.name,
    //     newJobs: newJobs.map(job => ({
    //       title: job.title,
    //       company: job.company,
    //       location: job.location,
    //       url: job.url
    //     }))
    //   })
    // })
  }

  // Manual operations
  async forceCheckAlert(alertId: string): Promise<void> {
    await this.checkAlert(alertId);
  }

  async forceCheckAllAlerts(): Promise<void> {
    await this.checkAllAlerts();
  }

  // Utility methods
  private generateAlertId(): string {
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Persistence
  private async saveAlerts(): Promise<void> {
    try {
      const alertsData = Array.from(this.jobAlerts.values());
      const seenJobsData = Object.fromEntries(
        Array.from(this.lastSeenJobs.entries()).map(([alertId, jobIds]) => [
          alertId,
          Array.from(jobIds),
        ]),
      );

      await unifiedStorage.setItem("job-alerts", alertsData);
      await unifiedStorage.setItem("job-alerts-seen", seenJobsData);
    } catch (_error) {
      logger.error("Failed to save job alerts:", error);
    }
  }

  private async loadAlerts(): Promise<void> {
    try {
      const alertsData = await unifiedStorage.getItem("job-alerts");
      const seenJobsData = await unifiedStorage.getItem("job-alerts-seen");

      if (Array.isArray(alertsData)) {
        for (const alert of alertsData) {
          this.jobAlerts.set(alert.id, {
            ...alert,
            lastChecked: new Date(alert.lastChecked),
            createdAt: new Date(alert.createdAt),
          });
        }
      }

      if (seenJobsData && typeof seenJobsData === "object") {
        for (const [alertId, jobIds] of Object.entries(seenJobsData)) {
          if (Array.isArray(jobIds)) {
            this.lastSeenJobs.set(alertId, new Set(jobIds));
          }
        }
      }

      logger.info(`Loaded ${this.jobAlerts.size} job alerts`);
    } catch (_error) {
      logger.error("Failed to load job alerts:", error);
    }
  }

  // Permission management
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !window.Notification) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  getNotificationPermission(): NotificationPermission | null {
    if (typeof window === "undefined" || !window.Notification) {
      return null;
    }
    return Notification.permission;
  }

  // Stats
  getStats(): RealTimeJobStats {
    const alerts = Array.from(this.jobAlerts.values());
    const activeAlerts = alerts.filter((alert) => alert.enabled);

    const newJobsToday = alerts.reduce((total, alert) => {
      const today = new Date();
      const lastChecked = new Date(alert.lastChecked);

      if (
        lastChecked.getDate() === today.getDate() &&
        lastChecked.getMonth() === today.getMonth() &&
        lastChecked.getFullYear() === today.getFullYear()
      ) {
        return total + alert.newMatches;
      }
      return total;

    const lastUpdateTime =
        ? new Date(
            Math.max(
              ...alerts.map((alert) => new Date(alert.lastChecked).getTime()),
            ),
          )
        : null;

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      newJobsToday,
      lastUpdateTime,
      isConnected: this.isRunning,
    };
  }
}

// Export singleton instance
export const realTimeJobService = RealTimeJobService.getInstance();
export default realTimeJobService;
