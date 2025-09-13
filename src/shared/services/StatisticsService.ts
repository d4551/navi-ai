
import { createModal, type ModalButton } from "../utils/modalUtils";
import { getAppVersion } from "@/utils/version";

export interface UserStatistics {
  // Usage Statistics
  sessionsToday: number;
  totalSessions: number;
  avgSessionDuration: string;
  streakDays: number;
  lastActive: Date;

  // Communication
  messagesSent: number;
  aiResponses: number;
  apiCallsThisMonth: number;

  // Content Creation
  portfolioItems: number;
  totalDocuments: number;
  resumesCreated: number;
  favoriteTemplate: string;

  // Features Used
  mostUsedFeature: string;
  interviewHours: number;
  interviewSessions: number;

  // Job Applications
  applicationsSubmitted: number;
  savedJobs: number;

  // Progress Metrics
  profileCompletion: number;
  skillsAssessment: number;
  interviewReadiness: number;
  careerReadiness: number;

  // Resume-specific metrics
  resumeSectionsCompleted?: number;
  skillsMapped?: number;
  currentLevel?: number;
  currentXP?: number;
  achievementsUnlocked?: number;
}

export interface StatisticsConfig {
  showExportButton?: boolean;
  showResetButton?: boolean;
  categories?: ("usage" | "communication" | "content" | "jobs" | "progress")[];
}

class StatisticsService {
  private storageKey = "navi_user_statistics";

  getStatistics(): UserStatistics {
    const stored = localStorage.getItem(this.storageKey);
    const defaultStats: UserStatistics = {
      lastActive: new Date(),
      favoriteTemplate: "Gaming Professional",
      mostUsedFeature: "Resume Builder",
      // Resume-specific metrics
    };

    if (!stored) {
      this.saveStatistics(defaultStats);
      return defaultStats;
    }

    try {
      const parsed = JSON.parse(stored);
      // Ensure lastActive is a Date object
      if (parsed.lastActive) {
        parsed.lastActive = new Date(parsed.lastActive);
      }
      return { ...defaultStats, ...parsed };
    } catch (error) {
      console.warn("Failed to parse stored statistics, using defaults");
      return defaultStats;
    }
  }

  updateStatistics(updates: Partial<UserStatistics>): void {
    const current = this.getStatistics();
    const updated = { ...current, ...updates, lastActive: new Date() };
    this.saveStatistics(updated);
  }

  private saveStatistics(stats: UserStatistics): void {
    localStorage.setItem(this.storageKey, JSON.stringify(stats));
  }

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
    const today = now.toDateString();
    const lastActiveDate = stats.lastActive?.toDateString();

    const updates: Partial<UserStatistics> = {
      lastActive: now,
    };

    // Update today's session count and streak
    if (lastActiveDate === today) {
    } else {
      // Update streak logic
      const yesterday = new Date(
      ).toDateString();
      if (lastActiveDate === yesterday) {
      } else {
      }
    }

    this.updateStatistics(updates);
  }

  recordFeatureUsage(feature: string): void {
    this.updateStatistics({ mostUsedFeature: feature });
  }

  recordAIUsage(): void {
  }

  recordResumeActivity(): void {
    this.recordFeatureUsage("Resume Builder");
  }

  recordInterviewSession(): void {
    this.recordFeatureUsage("Mock Interview");
  }

  showDetailedStatistics(config: StatisticsConfig = {}): void {
    const stats = this.getStatistics();
    const categories = config.categories || [
      "usage",
      "communication",
      "content",
      "jobs",
      "progress",
    ];

    const modalContent = this.generateStatisticsHTML(stats, categories);

    const buttons: ModalButton[] = [
      {
        text: "Close",
        type: "secondary",
        onclick: "this.closest('.modal').remove()",
      },
    ];

    if (config.showExportButton) {
      buttons.push({
        text: "Export Stats",
        type: "primary",
        onclick: () => this.exportStatistics(stats),
      });
    }

    if (config.showResetButton) {
      buttons.push({
        text: "Reset Stats",
        type: "danger",
        onclick: () => this.resetStatistics(),
      });
    }

    createModal({
      title: "[STATS] Detailed Statistics",
      content: modalContent,
      size: "lg",
      buttons,
    });
  }

  private generateStatisticsHTML(
    stats: UserStatistics,
    categories: string[],
  ): string {

    if (categories.includes("usage")) {
      content += `
              <li class="d-flex justify-content-between"><span>Sessions Today:</span> <strong>${stats.sessionsToday}</strong></li>
              <li class="d-flex justify-content-between"><span>Total Sessions:</span> <strong>${stats.totalSessions}</strong></li>
              <li class="d-flex justify-content-between"><span>Avg Duration:</span> <strong>${stats.avgSessionDuration}</strong></li>
              <li class="d-flex justify-content-between"><span>Current Streak:</span> <strong>${stats.streakDays} days</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes("communication")) {
      content += `
              <li class="d-flex justify-content-between"><span>Messages Sent:</span> <strong>${stats.messagesSent}</strong></li>
              <li class="d-flex justify-content-between"><span>AI Responses:</span> <strong>${stats.aiResponses}</strong></li>
              <li class="d-flex justify-content-between"><span>API Calls (Month):</span> <strong>${stats.apiCallsThisMonth}</strong></li>
              <li class="d-flex justify-content-between"><span>Interview Hours:</span> <strong>${stats.interviewHours}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes("content")) {
      content += `
              <li class="d-flex justify-content-between"><span>Portfolio Items:</span> <strong>${stats.portfolioItems}</strong></li>
              <li class="d-flex justify-content-between"><span>Total Documents:</span> <strong>${stats.totalDocuments}</strong></li>
              <li class="d-flex justify-content-between"><span>Resumes Created:</span> <strong>${stats.resumesCreated}</strong></li>
              <li class="d-flex justify-content-between"><span>Favorite Template:</span> <strong>${stats.favoriteTemplate}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes("jobs")) {
      content += `
              <li class="d-flex justify-content-between"><span>Applications Submitted:</span> <strong>${stats.applicationsSubmitted}</strong></li>
              <li class="d-flex justify-content-between"><span>Jobs Saved:</span> <strong>${stats.savedJobs}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes("progress")) {
      content += `
              <li class="d-flex justify-content-between">
                <span>Profile Complete:</span> 
                <span>
                  <strong>${stats.profileCompletion}%</strong>
                    <div class="progress-bar" style="width: ${stats.profileCompletion}%"></div>
                  </div>
                </span>
              </li>
              <li class="d-flex justify-content-between">
                <span>Skills Assessment:</span> 
                <span>
                  <strong>${stats.skillsAssessment}%</strong>
                    <div class="progress-bar bg-warning" style="width: ${stats.skillsAssessment}%"></div>
                  </div>
                </span>
              </li>
              <li class="d-flex justify-content-between">
                <span>Interview Readiness:</span> 
                <span>
                  <strong>${stats.interviewReadiness}%</strong>
                    <div class="progress-bar bg-success" style="width: ${stats.interviewReadiness}%"></div>
                  </div>
                </span>
              </li>
              <li class="d-flex justify-content-between"><span>Most Used:</span> <strong>${stats.mostUsedFeature}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    content += `
      </div>
        <small class="text-muted">Last active: ${stats.lastActive?.toLocaleString() || "Unknown"}</small>
      </div>
    </div>`;

    return content;
  }

  private exportStatistics(stats: UserStatistics): void {
    const exportData = {
      statistics: stats,
      exportedAt: new Date().toISOString(),
      version: getAppVersion(),
    };

      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }

  resetStatistics(): void {
    if (confirm("Reset all statistics? This cannot be undone.")) {
      localStorage.removeItem(this.storageKey);
      // Reinitialize with defaults
      this.getStatistics();

      // Close modal and show success
      const modal = document.querySelector(".modal.show");
      modal?.remove();

      // Show toast if available
      const event = new CustomEvent("show-toast", {
        detail: { message: "Statistics reset successfully", type: "success" },
      });
      window.dispatchEvent(event);
    }
  }

  syncJobApplicationStats(jobSearchData: any): void {

    this.updateStatistics({
      applicationsSubmitted: applicationsCount,
      savedJobs: savedJobsCount,
    });
  }

  syncResumeStats(resumeData: any, user: any): void {
    const completedSections = this.calculateResumeCompletedSections(resumeData);
    const profileCompletion = this.calculateProfileCompleteness(user);
    const hasResumeContent = this.hasResumeContent(resumeData);

    // Handle both legacy array format and new object format for skills
    if (user?.skills) {
      if (Array.isArray(user.skills)) {
        // Legacy format: skills is an array
        skillsMapped =
          user.skills.filter((skill: any) => skill && skill.realWorldMapping)
      } else if (typeof user.skills === "object") {
        // New format: skills is an object with categories
        const technical = Array.isArray(user.skills.technical)
          ? user.skills.technical
          : [];
        const soft = Array.isArray(user.skills.soft) ? user.skills.soft : [];
        const languages = Array.isArray(user.skills.languages)
          ? user.skills.languages
          : [];
        const tools = Array.isArray(user.skills.tools) ? user.skills.tools : [];
        const frameworks = Array.isArray(user.skills.frameworks)
          ? user.skills.frameworks
          : [];
        const gaming = Array.isArray(user.skills.gaming)
          ? user.skills.gaming
          : [];

        const allSkills = [
          ...technical,
          ...soft,
          ...languages,
          ...tools,
          ...frameworks,
          ...gaming,
        ];
        skillsMapped =
          allSkills.filter((skill: any) => skill && skill.realWorldMapping)
      }
    }

    this.updateStatistics({
      profileCompletion: profileCompletion,
      resumeSectionsCompleted: completedSections,
      skillsMapped: skillsMapped,
    });
  }

  private calculateResumeCompletedSections(resumeData: any): number {


    // Personal info section
    if (resumeData.personalInfo?.name && resumeData.personalInfo?.email) {
      completed++;
    }

    // Experience section
      completed++;
    }

    // Education section
      completed++;
    }

    // Skills section
    if (
      resumeData.skills &&
      ((resumeData.skills.technical &&
    ) {
      completed++;
    }

    // Additional experience section
    if (
      resumeData.additionalExperience &&
    ) {
      completed++;
    }

    return completed;
  }

  private calculateProfileCompleteness(user: any): number {


    return score;
  }

  private hasResumeContent(resumeData: any): boolean {
    if (!resumeData) return false;

    return !!(
      (resumeData.personalInfo?.name && resumeData.personalInfo?.email) ||
      (resumeData.skills &&
        ((resumeData.skills.technical &&
    );
  }

  syncPortfolioStats(portfolioItems: any[]): void {

    this.updateStatistics({
      portfolioItems: portfolioCount,
    });
  }

  syncSkillsStats(skills: any): void {

    if (skills) {
      if (Array.isArray(skills)) {
        // Legacy format: skills is an array
        mappedSkillsCount =
          skills.filter((skill) => skill && skill.realWorldMapping)?.length ||
      } else if (typeof skills === "object" && skills !== null) {
        // New format: skills is an object with categories
        const technical = Array.isArray(skills.technical)
          ? skills.technical
          : [];
        const soft = Array.isArray(skills.soft) ? skills.soft : [];
        const languages = Array.isArray(skills.languages)
          ? skills.languages
          : [];
        const tools = Array.isArray(skills.tools) ? skills.tools : [];
        const frameworks = Array.isArray(skills.frameworks)
          ? skills.frameworks
          : [];
        const gaming = Array.isArray(skills.gaming) ? skills.gaming : [];

        const allSkills = [
          ...technical,
          ...soft,
          ...languages,
          ...tools,
          ...frameworks,
          ...gaming,
        ];

        // Ensure allSkills is actually an array before calling filter
        if (Array.isArray(allSkills)) {
          mappedSkillsCount =
            allSkills.filter((skill) => skill && skill.realWorldMapping)
        } else {
        }
      } else {
        // Handle edge case where skills is neither array nor object (e.g., null, string, number)
      }
    }

    this.updateStatistics({
    });
  }

  recordJobApplication(_jobTitle?: string): void {
    // Could also track specific job details in the future
  }

  recordSavedJob(): void {
  }

  getDashboardStats(): {
    label: string;
    value: string | number;
    icon?: string;
  }[] {
    const stats = this.getStatistics();

    return [
      {
        label: "Applications Submitted",
        value: stats.applicationsSubmitted,
        icon: "mdi-briefcase-upload",
      },
      {
        label: "Current Streak",
        value: `${stats.streakDays} days`,
        icon: "mdi-fire",
      },
      {
        label: "Interview Hours",
        value: stats.interviewHours,
        icon: "mdi-microphone",
      },
      {
        label: "Portfolio Items",
        value: stats.portfolioItems,
        icon: "mdi-folder-multiple-outline",
      },
    ];
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService();
export default statisticsService;
