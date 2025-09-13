import { createModal, type ModalButton } from "../utils/modalUtils";
import { getAppVersion } from "@/utils/version";

export interface UserStatistics {
  sessionsToday: number;
  totalSessions: number;
  avgSessionDuration: string;
  streakDays: number;
  lastActive: Date;
  messagesSent: number;
  aiResponses: number;
  apiCallsThisMonth: number;
  portfolioItems: number;
  totalDocuments: number;
  resumesCreated: number;
  favoriteTemplate: string;
  mostUsedFeature: string;
  interviewHours: number;
  interviewSessions: number;
  applicationsSubmitted: number;
  savedJobs: number;
  profileCompletion: number;
  skillsAssessment: number;
  interviewReadiness: number;
  careerReadiness: number;
  resumeSectionsCompleted?: number;
  skillsMapped?: number;
  currentLevel?: number;
  currentXP?: number;
  achievementsUnlocked?: number;
}

export class StatisticsService {
  private readonly storageKey = "navi-user-statistics";

  private getDefaultStatistics(): UserStatistics {
    return {
      sessionsToday: 0,
      totalSessions: 0,
      avgSessionDuration: "0m",
      streakDays: 0,
      lastActive: new Date(),
      messagesSent: 0,
      aiResponses: 0,
      apiCallsThisMonth: 0,
      portfolioItems: 0,
      totalDocuments: 0,
      resumesCreated: 0,
      favoriteTemplate: "",
      mostUsedFeature: "",
      interviewHours: 0,
      interviewSessions: 0,
      applicationsSubmitted: 0,
      savedJobs: 0,
      profileCompletion: 0,
      skillsAssessment: 0,
      interviewReadiness: 0,
      careerReadiness: 0,
      resumeSectionsCompleted: 0,
      skillsMapped: 0,
      currentLevel: 1,
      currentXP: 0,
      achievementsUnlocked: 0,
    };
  }

  getStatistics(): UserStatistics {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastActive) {
          parsed.lastActive = new Date(parsed.lastActive);
        }
        return { ...this.getDefaultStatistics(), ...parsed };
      }
    } catch (_error) {
      console.warn("Failed to load statistics:", error);
    }
    return this.getDefaultStatistics();
  }

  updateStatistics(updates: Partial<UserStatistics>): void {
    const current = this.getStatistics();
    const updated = { ...current, ...updates, lastActive: new Date() };
    this.saveStatistics(updated);
  }

  private saveStatistics(stats: UserStatistics): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stats));
    } catch (_error) {
      console.warn("Failed to save statistics:", error);
    }
  }

  incrementCounter(key: keyof UserStatistics, amount: number = 1): void {
    const current = this.getStatistics();
    if (typeof current[key] === "number") {
      this.updateStatistics({
        [key]: (current[key] as number) + amount,
      } as Partial<UserStatistics>);
    }
  }

  recordSession(): void {
    const stats = this.getStatistics();
    const now = new Date();
    this.updateStatistics({
      lastActive: now,
      totalSessions: stats.totalSessions + 1,
    });
  }

  resetStatistics(): void {
    localStorage.removeItem(this.storageKey);
  }

  calculateProfileCompletion(profileData: any): number {
    if (!profileData) return 0;
    let completed = 0;
    const totalSections = 5;
    if (profileData.name) completed++;
    if (profileData.experience) completed++;
    if (profileData.education) completed++;
    if (profileData.skills) completed++;
    if (profileData.portfolio) completed++;
    return Math.round((completed / totalSections) * 100);
  }
}

export const statisticsService = new StatisticsService();