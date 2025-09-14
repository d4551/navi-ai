/**
 * Statistics Service
 * Manages user statistics, analytics, and progress tracking
 */

import { createModal, type ModalButton } from '../utils/modalUtils';
import { getAppVersion } from '@/utils/version';

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
  categories?: ('usage' | 'communication' | 'content' | 'jobs' | 'progress')[];
}

class StatisticsService {
  private storageKey = 'navi_user_statistics';

  /**
   * Gets current user statistics
   */
  getStatistics(): UserStatistics {
    const stored = localStorage.getItem(this.storageKey);
    const defaultStats: UserStatistics = {
      sessionsToday: 1,
      totalSessions: 1,
      avgSessionDuration: '5 minutes',
      streakDays: 1,
      lastActive: new Date(),
      messagesSent: 0,
      aiResponses: 0,
      apiCallsThisMonth: 0,
      portfolioItems: 0,
      totalDocuments: 0,
      resumesCreated: 0,
      favoriteTemplate: 'Gaming Professional',
      mostUsedFeature: 'Resume Builder',
      interviewHours: 0,
      interviewSessions: 0,
      applicationsSubmitted: 0,
      savedJobs: 0,
      profileCompletion: 65,
      skillsAssessment: 45,
      interviewReadiness: 30,
      careerReadiness: 50,
      // Resume-specific metrics
      resumeSectionsCompleted: 0,
      skillsMapped: 0,
      currentLevel: 1,
      currentXP: 0,
      achievementsUnlocked: 0
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
      console.warn('Failed to parse stored statistics, using defaults');
      return defaultStats;
    }
  }

  /**
   * Updates statistics
   */
  updateStatistics(updates: Partial<UserStatistics>): void {
    const current = this.getStatistics();
    const updated = { ...current, ...updates, lastActive: new Date() };
    this.saveStatistics(updated);
  }

  /**
   * Saves statistics to localStorage
   */
  private saveStatistics(stats: UserStatistics): void {
    localStorage.setItem(this.storageKey, JSON.stringify(stats));
  }

  /**
   * Increments a statistic by a given amount
   */
  incrementStat(key: keyof UserStatistics, amount: number = 1): void {
    const current = this.getStatistics();
    if (typeof current[key] === 'number') {
      this.updateStatistics({ [key]: (current[key] as number) + amount } as Partial<UserStatistics>);
    }
  }

  /**
   * Records a new session
   */
  recordSession(): void {
    const stats = this.getStatistics();
    const now = new Date();
    const today = now.toDateString();
    const lastActiveDate = stats.lastActive?.toDateString();

    const updates: Partial<UserStatistics> = {
      totalSessions: stats.totalSessions + 1,
      lastActive: now
    };

    // Update today's session count and streak
    if (lastActiveDate === today) {
      updates.sessionsToday = stats.sessionsToday + 1;
    } else {
      updates.sessionsToday = 1;
      // Update streak logic
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
      if (lastActiveDate === yesterday) {
        updates.streakDays = stats.streakDays + 1;
      } else {
        updates.streakDays = 1;
      }
    }

    this.updateStatistics(updates);
  }

  /**
   * Records feature usage
   */
  recordFeatureUsage(feature: string): void {
    this.updateStatistics({ mostUsedFeature: feature });
    this.incrementStat('totalSessions', 0); // Just updates lastActive
  }

  /**
   * Records AI feature usage
   */
  recordAIUsage(): void {
    this.incrementStat('apiCallsThisMonth', 1);
    this.incrementStat('aiResponses', 1);
  }

  /**
   * Records resume activity
   */
  recordResumeActivity(): void {
    this.recordFeatureUsage('Resume Builder');
    this.incrementStat('totalDocuments', 0); // Updates lastActive and tracks usage
  }

  /**
   * Records interview session
   */
  recordInterviewSession(): void {
    this.incrementStat('interviewSessions', 1);
    this.incrementStat('interviewHours', 0.25); // Approximate session duration
    this.recordFeatureUsage('Mock Interview');
  }

  /**
   * Shows detailed statistics modal
   */
  showDetailedStatistics(config: StatisticsConfig = {}): void {
    const stats = this.getStatistics();
    const categories = config.categories || ['usage', 'communication', 'content', 'jobs', 'progress'];
    
    const modalContent = this.generateStatisticsHTML(stats, categories);
    
    const buttons: ModalButton[] = [
      {
        text: 'Close',
        type: 'secondary',
        onclick: 'this.closest(\'.modal\').remove()'
      }
    ];

    if (config.showExportButton) {
      buttons.push({
        text: 'Export Stats',
        type: 'primary',
        onclick: () => this.exportStatistics(stats)
      });
    }

    if (config.showResetButton) {
      buttons.push({
        text: 'Reset Stats',
        type: 'danger',
        onclick: () => this.resetStatistics()
      });
    }

    createModal({
      title: '[STATS] Detailed Statistics',
      content: modalContent,
      size: 'lg',
      buttons
    });
  }

  /**
   * Generates statistics HTML content
   */
  private generateStatisticsHTML(stats: UserStatistics, categories: string[]): string {
    let content = '<div class="detailed-stats-modal"><div class="row g-3">';

    if (categories.includes('usage')) {
      content += `
        <div class="col-md-6">
          <div class="stat-card p-3 border rounded">
            <h6 class="text-primary">[TARGET] Usage Statistics</h6>
            <ul class="list-unstyled mb-0">
              <li class="d-flex justify-content-between"><span>Sessions Today:</span> <strong>${stats.sessionsToday}</strong></li>
              <li class="d-flex justify-content-between"><span>Total Sessions:</span> <strong>${stats.totalSessions}</strong></li>
              <li class="d-flex justify-content-between"><span>Avg Duration:</span> <strong>${stats.avgSessionDuration}</strong></li>
              <li class="d-flex justify-content-between"><span>Current Streak:</span> <strong>${stats.streakDays} days</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes('communication')) {
      content += `
        <div class="col-md-6">
          <div class="stat-card p-3 border rounded">
            <h6 class="text-primary">💬 Communication</h6>
            <ul class="list-unstyled mb-0">
              <li class="d-flex justify-content-between"><span>Messages Sent:</span> <strong>${stats.messagesSent}</strong></li>
              <li class="d-flex justify-content-between"><span>AI Responses:</span> <strong>${stats.aiResponses}</strong></li>
              <li class="d-flex justify-content-between"><span>API Calls (Month):</span> <strong>${stats.apiCallsThisMonth}</strong></li>
              <li class="d-flex justify-content-between"><span>Interview Hours:</span> <strong>${stats.interviewHours}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes('content')) {
      content += `
        <div class="col-md-6">
          <div class="stat-card p-3 border rounded">
            <h6 class="text-primary">📄 Content Creation</h6>
            <ul class="list-unstyled mb-0">
              <li class="d-flex justify-content-between"><span>Portfolio Items:</span> <strong>${stats.portfolioItems}</strong></li>
              <li class="d-flex justify-content-between"><span>Total Documents:</span> <strong>${stats.totalDocuments}</strong></li>
              <li class="d-flex justify-content-between"><span>Resumes Created:</span> <strong>${stats.resumesCreated}</strong></li>
              <li class="d-flex justify-content-between"><span>Favorite Template:</span> <strong>${stats.favoriteTemplate}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes('jobs')) {
      content += `
        <div class="col-md-6">
          <div class="stat-card p-3 border rounded">
            <h6 class="text-primary">💼 Job Applications</h6>
            <ul class="list-unstyled mb-0">
              <li class="d-flex justify-content-between"><span>Applications Submitted:</span> <strong>${stats.applicationsSubmitted}</strong></li>
              <li class="d-flex justify-content-between"><span>Jobs Saved:</span> <strong>${stats.savedJobs}</strong></li>
              <li class="d-flex justify-content-between"><span>Success Rate:</span> <strong>${stats.applicationsSubmitted > 0 ? Math.round((stats.applicationsSubmitted * 0.15) * 100) / 100 : 0}%</strong></li>
              <li class="d-flex justify-content-between"><span>Active Applications:</span> <strong>${Math.max(0, stats.applicationsSubmitted - Math.floor(stats.applicationsSubmitted * 0.3))}</strong></li>
            </ul>
          </div>
        </div>
      `;
    }

    if (categories.includes('progress')) {
      content += `
        <div class="col-md-6">
          <div class="stat-card p-3 border rounded">
            <h6 class="text-primary">[GAME] Progress Metrics</h6>
            <ul class="list-unstyled mb-0">
              <li class="d-flex justify-content-between">
                <span>Profile Complete:</span> 
                <span>
                  <strong>${stats.profileCompletion}%</strong>
                  <div class="progress progress--xs mt-1" style="width: 60px;">
                    <div class="progress-bar" style="width: ${stats.profileCompletion}%"></div>
                  </div>
                </span>
              </li>
              <li class="d-flex justify-content-between">
                <span>Skills Assessment:</span> 
                <span>
                  <strong>${stats.skillsAssessment}%</strong>
                  <div class="progress progress--xs mt-1" style="width: 60px;">
                    <div class="progress-bar bg-warning" style="width: ${stats.skillsAssessment}%"></div>
                  </div>
                </span>
              </li>
              <li class="d-flex justify-content-between">
                <span>Interview Readiness:</span> 
                <span>
                  <strong>${stats.interviewReadiness}%</strong>
                  <div class="progress progress--xs mt-1" style="width: 60px;">
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
      <div class="mt-3 text-center">
        <small class="text-muted">Last active: ${stats.lastActive?.toLocaleString() || 'Unknown'}</small>
      </div>
    </div>`;

    return content;
  }

  /**
   * Exports statistics to JSON
   */
  private exportStatistics(stats: UserStatistics): void {
    const exportData = {
      statistics: stats,
      exportedAt: new Date().toISOString(),
      version: getAppVersion()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `navi-statistics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Resets all statistics
   */
  resetStatistics(): void {
    if (confirm('Reset all statistics? This cannot be undone.')) {
      localStorage.removeItem(this.storageKey);
      // Reinitialize with defaults
      this.getStatistics();
      
      // Close modal and show success
      const modal = document.querySelector('.modal.show');
      modal?.remove();
      
      // Show toast if available
      const event = new CustomEvent('show-toast', {
        detail: { message: 'Statistics reset successfully', type: 'success' }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Syncs job application statistics from store data
   */
  syncJobApplicationStats(jobSearchData: any): void {
    const applicationsCount = jobSearchData?.applications?.length || 0;
    const savedJobsCount = jobSearchData?.savedJobs?.length || 0;
    
    this.updateStatistics({
      applicationsSubmitted: applicationsCount,
      savedJobs: savedJobsCount
    });
  }

  /**
   * Syncs resume statistics from store data
   */
  syncResumeStats(resumeData: any, user: any): void {
    const completedSections = this.calculateResumeCompletedSections(resumeData);
    const profileCompletion = this.calculateProfileCompleteness(user);
    const hasResumeContent = this.hasResumeContent(resumeData);

    // Handle both legacy array format and new object format for skills
    let skillsMapped = 0;
    if (user?.skills) {
      if (Array.isArray(user.skills)) {
        // Legacy format: skills is an array
        skillsMapped = user.skills.filter((skill: any) => skill && skill.realWorldMapping)?.length || 0;
      } else if (typeof user.skills === 'object') {
        // New format: skills is an object with categories
        const technical = Array.isArray(user.skills.technical) ? user.skills.technical : [];
        const soft = Array.isArray(user.skills.soft) ? user.skills.soft : [];
        const languages = Array.isArray(user.skills.languages) ? user.skills.languages : [];
        const tools = Array.isArray(user.skills.tools) ? user.skills.tools : [];
        const frameworks = Array.isArray(user.skills.frameworks) ? user.skills.frameworks : [];
        const gaming = Array.isArray(user.skills.gaming) ? user.skills.gaming : [];
        
        const allSkills = [
          ...technical,
          ...soft,
          ...languages,
          ...tools,
          ...frameworks,
          ...gaming
        ];
        skillsMapped = allSkills.filter((skill: any) => skill && skill.realWorldMapping)?.length || 0;
      }
    }

    this.updateStatistics({
      resumesCreated: hasResumeContent ? 1 : 0,
      totalDocuments: hasResumeContent ? 1 : 0,
      profileCompletion: profileCompletion,
      resumeSectionsCompleted: completedSections,
      skillsMapped: skillsMapped,
      currentLevel: user?.level || 1,
      currentXP: user?.xp || 0,
      achievementsUnlocked: user?.achievements?.length || 0
    });
  }

  /**
   * Calculates how many resume sections are completed
   */
  private calculateResumeCompletedSections(resumeData: any): number {
    if (!resumeData) return 0;
    
    let completed = 0;
    
    // Personal info section
    if (resumeData.personalInfo?.name && resumeData.personalInfo?.email) {
      completed++;
    }
    
    // Experience section
    if (resumeData.experience && resumeData.experience.length > 0) {
      completed++;
    }
    
    // Education section
    if (resumeData.education && resumeData.education.length > 0) {
      completed++;
    }
    
    // Skills section
    if (resumeData.skills && (
      (resumeData.skills.technical && resumeData.skills.technical.length > 0) ||
      (resumeData.skills.soft && resumeData.skills.soft.length > 0)
    )) {
      completed++;
    }
    
    // Additional experience section
    if (resumeData.additionalExperience && resumeData.additionalExperience.length > 0) {
      completed++;
    }
    
    return completed;
  }

  /**
   * Calculates profile completeness percentage
   */
  private calculateProfileCompleteness(user: any): number {
    if (!user) return 0;
    
    let score = 0;
    if (user.name) score += 20;
    if (user.email) score += 20;
    if (user.gamingExperience && user.gamingExperience.length > 0) score += 20;
    if (user.skills && user.skills.length > 0) score += 20;
    if (user.portfolio && user.portfolio.length > 0) score += 20;
    
    return score;
  }

  /**
   * Checks if resume has meaningful content
   */
  private hasResumeContent(resumeData: any): boolean {
    if (!resumeData) return false;
    
    return !!(
      (resumeData.personalInfo?.name && resumeData.personalInfo?.email) ||
      (resumeData.experience && resumeData.experience.length > 0) ||
      (resumeData.education && resumeData.education.length > 0) ||
      (resumeData.skills && (
        (resumeData.skills.technical && resumeData.skills.technical.length > 0) ||
        (resumeData.skills.soft && resumeData.skills.soft.length > 0)
      ))
    );
  }

  /**
   * Records portfolio statistics sync
   */
  syncPortfolioStats(portfolioItems: any[]): void {
    const portfolioCount = portfolioItems?.length || 0;
    
    this.updateStatistics({
      portfolioItems: portfolioCount
    });
  }

  /**
   * Records skills mapping statistics sync
   */
  syncSkillsStats(skills: any): void {
    let mappedSkillsCount = 0;

    if (skills) {
      if (Array.isArray(skills)) {
        // Legacy format: skills is an array
        mappedSkillsCount = skills.filter(skill => skill && skill.realWorldMapping)?.length || 0;
      } else if (typeof skills === 'object' && skills !== null) {
        // New format: skills is an object with categories
        const technical = Array.isArray(skills.technical) ? skills.technical : [];
        const soft = Array.isArray(skills.soft) ? skills.soft : [];
        const languages = Array.isArray(skills.languages) ? skills.languages : [];
        const tools = Array.isArray(skills.tools) ? skills.tools : [];
        const frameworks = Array.isArray(skills.frameworks) ? skills.frameworks : [];
        const gaming = Array.isArray(skills.gaming) ? skills.gaming : [];
        
        const allSkills = [
          ...technical,
          ...soft,
          ...languages,
          ...tools,
          ...frameworks,
          ...gaming
        ];
        
        // Ensure allSkills is actually an array before calling filter
        if (Array.isArray(allSkills)) {
          mappedSkillsCount = allSkills.filter(skill => skill && skill.realWorldMapping)?.length || 0;
        } else {
          mappedSkillsCount = 0;
        }
      } else {
        // Handle edge case where skills is neither array nor object (e.g., null, string, number)
        mappedSkillsCount = 0;
      }
    }

    this.updateStatistics({
      skillsAssessment: Math.min((mappedSkillsCount / 10) * 100, 100)
    });
  }

  /**
   * Records a job application submission
   */
  recordJobApplication(_jobTitle?: string): void {
    this.incrementStat('applicationsSubmitted', 1);
    // Could also track specific job details in the future
  }

  /**
   * Records saving a job
   */
  recordSavedJob(): void {
    this.incrementStat('savedJobs', 1);
  }

  /**
   * Gets basic stats for dashboard display
   */
  getDashboardStats(): { label: string; value: string | number; icon?: string }[] {
    const stats = this.getStatistics();
    
    return [
      {
        label: 'Applications Submitted',
        value: stats.applicationsSubmitted,
        icon: 'mdi-briefcase-upload'
      },
      {
        label: 'Current Streak',
        value: `${stats.streakDays} days`,
        icon: 'mdi-fire'
      },
      {
        label: 'Interview Hours',
        value: stats.interviewHours,
        icon: 'mdi-microphone'
      },
      {
        label: 'Portfolio Items',
        value: stats.portfolioItems,
        icon: 'mdi-folder-multiple-outline'
      }
    ];
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService();
export default statisticsService;
