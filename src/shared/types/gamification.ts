
export interface GamificationStats {
  // Core stats
  profileComplete: number;
  skillsMapped: number;
  portfolioItems: number;
  jobApplications: number;
  chatSessions: number;
  resumesGenerated: number;
  savedJobs: number;

  // Enhanced metrics
  totalTimeSpent: number;
  featuresUsed: number;
  dailyStreak: number;
  weeklyProgress: number;
  interviewsCompleted: number;
  skillAssessmentsCompleted: number;

  // Social metrics
  networkingContacts: number;
  referralsRequested: number;
  studiosExplored: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconType: "mdi" | "emoji" | "custom";
  category: "progress" | "social" | "skill" | "special" | "milestone";
  xpReward: number;
  requirements: Record<string, number>;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  hidden?: boolean;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconType: "mdi" | "emoji" | "custom";
  xpReward: number;
  category:
    | "profile"
    | "job_search"
    | "skill_building"
    | "social"
    | "engagement";
  completed: boolean;
  requirements?: Record<string, number>;
  validUntil?: string;
}

export interface XPLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  features: string[];
}

export interface XPAction {
  id: string;
  name: string;
  xpReward: number;
  category:
    | "profile"
    | "job_search"
    | "skill_building"
    | "social"
    | "engagement"
    | "milestone";
  description?: string;
}

export interface UserGamificationData {
  xp: number;
  level: number;
  achievements: string[];
  dailyChallenges: Record<string, string[]>; // date -> completed challenge IDs
  longestStreak: number;
  actionHistory: GamificationActionRecord[];
  lastUpdated: string;
  stats: Partial<GamificationStats>;
}

export interface GamificationActionRecord {
  id: string;
  action: string;
  xpGained: number;
  timestamp: string;
  context?: Record<string, any>;
}

export interface LevelUpResult {
  xpGained: number;
  oldLevel: number;
  newLevel: number;
  oldTitle: string;
  newTitle: string;
  unlockedFeatures: string[];
  bonusXP?: number;
}

export interface AchievementUnlockResult {
  achievement: Achievement;
  xpGained: number;
  totalAchievements: number;
}

export interface DailyChallengeResult {
  challenge: DailyChallenge;
  xpGained: number;
  streakBonus?: number;
  newStreak: number;
}

export interface GamificationNotification {
  id: string;
  type:
    | "xp_gain"
    | "level_up"
    | "achievement"
    | "challenge_complete"
    | "streak"
    | "milestone";
  title: string;
  message: string;
  icon: string;
  iconType: "mdi" | "emoji" | "custom";
  data?: Record<string, any>;
  duration: number;
  priority: "low" | "medium" | "high";
  timestamp: string;
}

export interface GamificationConfig {
  xpMultiplier: number;
  levelCurve: "linear" | "exponential" | "logarithmic";
  enableStreaks: boolean;
  enableDailyChallenges: boolean;
  enableNotifications: boolean;
  maxNotificationQueue: number;
  achievementSoundEnabled: boolean;
  levelUpAnimationEnabled: boolean;
}

export interface WeeklyProgress {
  week: string;
  challengesCompleted: number;
  totalChallenges: number;
  xpEarned: number;
  achievementsUnlocked: number;
  streakMaintained: boolean;
}

export interface MonthlyStats {
  month: string;
  totalXP: number;
  levelsGained: number;
  achievementsUnlocked: number;
  challengesCompleted: number;
  longestStreak: number;
  featuresUsed: number;
}

export interface GamificationLeaderboard {
  userId: string;
  username: string;
  level: number;
  xp: number;
  achievements: number;
  rank: number;
  badge?: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  isNewRecord: boolean;
  lastActivity: string;
  multiplier: number;
}

export interface ProgressSummary {
  level: XPLevel;
  nextLevel: XPLevel | null;
  xpToNextLevel: number;
  progressPercentage: number;
  recentAchievements: Achievement[];
  activeChallenges: DailyChallenge[];
  streak: StreakInfo;
  weeklyProgress: WeeklyProgress;
}

export interface GamificationEvent {
  type:
    | "action_completed"
    | "achievement_unlocked"
    | "level_up"
    | "challenge_completed"
    | "streak_updated";
  data: Record<string, any>;
  timestamp: string;
  userId?: string;
}

// Service interfaces
export interface IGamificationService {
  // Core methods
  awardXP(
    action: string,
    amount?: number,
    context?: Record<string, any>,
  ): Promise<LevelUpResult | null>;
  checkAchievements(
    stats?: GamificationStats,
  ): Promise<AchievementUnlockResult[]>;
  completeDailyChallenge(
    challengeId: string,
  ): Promise<DailyChallengeResult | null>;

  // Data access
  getUserStats(): Promise<GamificationStats>;
  getProgressSummary(): Promise<ProgressSummary>;
  getAchievements(
    filter?: "all" | "unlocked" | "locked",
  ): Promise<Achievement[]>;
  getDailyChallenges(): Promise<DailyChallenge[]>;

  // Utility methods
  calculateLevel(xp: number): XPLevel;
  getStreak(): Promise<StreakInfo>;
  resetProgress(): Promise<void>;
  exportStats(): Promise<Record<string, any>>;
}

// Event system
export interface IGamificationEventBus {
  on(event: string, callback: (data: GamificationEvent) => void): void;
  off(event: string, callback: (data: GamificationEvent) => void): void;
  emit(event: string, data: GamificationEvent): void;
}

// Notification system
export interface IGamificationNotificationService {
  show(notification: GamificationNotification): void;
  queue(notifications: GamificationNotification[]): void;
  clear(): void;
  setConfig(config: Partial<GamificationConfig>): void;
}
