import { defineStore } from "pinia";
import { Mutex } from "async-mutex";
import { setVoiceRoutingPreferences } from "@/utils/voice";
import GamificationService from "@/utils/gamification";
import { logger } from "@/shared/utils/logger";
import { validateEmail, validateRequired } from "@/utils/validation";
import { unifiedStorage } from "@/utils/storage";
import { statisticsService } from "@/shared/services/StatisticsService";
import { userProfileService } from "@/services/UserProfileService";
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  Settings,
} from "@/shared/schemas/settingsSchema";
import { getAppVersion } from "@/utils/version";

// Comprehensive type definitions
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  summary: string;
  profilePicture: string | null;
  // Extended fields
  currentRole?: string;
  currentCompany?: string;
  yearsExperience?: number | null;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  gpa?: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  tools: string[];
  frameworks: string[];
  gaming: string[];
}

export interface GamingExperience {
  competitiveGaming: string[];
  teamLeadership: string[];
  communityInvolvement: string[];
  contentCreation: string[];
  tournaments: string[];
  achievements: string[];
  preferredGames: string[];
  platforms: string[];
  guildsTeams: string[];
}

export interface SalaryExpectations {
  min: number | null;
  max: number | null;
  currency: string;
}

export interface WorkPreferences {
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
  relocationWillingness: boolean;
}

export interface CareerGoals {
  targetRoles: string[];
  targetIndustries: string[];
  targetCompanies: string[];
  salaryExpectations: SalaryExpectations;
  workPreferences: WorkPreferences;
  timeframe: string;
}

export interface PrivacySettings {
  publicProfile: boolean;
  shareWithRecruiters: boolean;
  allowAnalytics: boolean;
}

export interface ProfileMeta {
  profileCompleteness: number;
  lastUpdated: string | null;
  createdAt: string | null;
  version: string;
  dataConsent: boolean;
  privacySettings: PrivacySettings;
}

export interface AIData {
  skillMappings: Array<{ gaming: string; professional: string }>;
  resumeOptimizations: Array<{ field: string; suggestion: string }>;
  coverLetterDrafts: Array<{ id: string; company: string; content: string }>;
  interviewPractice: Array<{
    question: string;
    answer: string;
    feedback: string;
  }>;
  careerInsights: Array<{
    insight: string;
    category: string;
    confidence: number;
  }>;
  marketAnalysis: Record<string, any>;
}

export interface User {
  // Legacy fields for compatibility
  name: string;
  email: string;
  portfolio: any[];
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  achievements: (Achievement | string)[];
  certifications: Certification[];
  skills: Skills;
  gamingExperience: GamingExperience;
  careerGoals: CareerGoals;
  aiData: AIData;
  meta: ProfileMeta;
  xp: number;
  previousXP: number;
  dailyChallenges: Record<string, string[]>;
  weeklyQuests?: Record<string, string[]>;
  longestStreak: number;
  resumesGenerated: number;
  level: number;

  // Enhanced gamification tracking
  interviewsCompleted: number;
  skillAssessmentsCompleted: number;
  totalTimeSpent: number;
  featureUsage: Record<string, number>;
}

export interface ResumeData {
  personalInfo: Partial<PersonalInfo>;
  experience: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
  };
  achievements: Achievement[];
}

export interface JobApplication {
  id: string;
  company: string;
  title?: string;
  appliedAt: string;
  status: string;
  [key: string]: any;
}

export interface SavedJob {
  id: string;
  savedAt: string;
  [key: string]: any;
}

export interface JobSearchData {
  preferences: Record<string, any>;
  savedJobs: SavedJob[];
  applications: JobApplication[];
  lastSearchSources: string[];
}

export interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  timestamp?: string;
}

export interface PublicLogo {
  url: string;
  status: string;
  lastFetched: string;
}

export interface CoverLetterDraft {
  id: string;
  company: string;
  position: string;
  role: string;
  preferences: Record<string, any>;
  studioProfile: Record<string, any>;
  content: Record<string, any>;
  meta: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface LoadingStates {
  ai: boolean;
  save: boolean;
  export: boolean;
  validation: boolean;
  skillSuggestions: boolean;
  scoring: boolean;
  optimization: boolean;
  autoFill: boolean;
  templateGeneration: boolean;
  contentEdit: boolean;
  autoCompose: boolean;
  profileAnalysis: boolean;
  skillAnalysis: boolean;
}

export interface Errors {
  api: string | null;
  validation: Record<string, string>;
  network: string | null;
}

export interface AppMeta {
  version: string;
  lastSave: Date | null;
  isOnline: boolean;
}

export interface AIStatus {
  initialized: boolean;
  lastError: string | null;
  model: string | null;
}

export interface AppState {
  user: User;
  settings: Settings;
  resumeData: ResumeData;
  jobSearchData: JobSearchData;
  chatHistory: ChatMessage[];
  publicLogos: Record<string, PublicLogo>;
  normalizedStudios: Record<string, any>;
  coverLetterDrafts: CoverLetterDraft[];
  loading: LoadingStates;
  errors: Errors;
  meta: AppMeta;
  aiStatus: AIStatus;
  availableModels: any[];
}

// Module-level mutex to serialize persistence
const persistMutex = new Mutex();

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    // Comprehensive User Profile Data
    user: {
      // Legacy fields for compatibility
      name: "",
      email: "",
      portfolio: [],

      // New comprehensive profile structure
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedIn: "",
        github: "",
        portfolio: "",
        summary: "",
        profilePicture: null,
        currentRole: "",
        currentCompany: "",
        yearsExperience: null,
      },

      experience: [],
      education: [],
      certifications: [],

      skills: {
        technical: [],
        soft: [],
        languages: [],
        tools: [],
        frameworks: [],
        gaming: [],
      },

      gamingExperience: {
        competitiveGaming: [],
        teamLeadership: [],
        communityInvolvement: [],
        contentCreation: [],
        tournaments: [],
        achievements: [],
        preferredGames: [],
        platforms: [],
        guildsTeams: [],
      },

      careerGoals: {
        targetRoles: [],
        targetIndustries: [],
        targetCompanies: [],
        salaryExpectations: {
          min: null,
          max: null,
          currency: "USD",
        },
        workPreferences: {
          remote: false,
          hybrid: false,
          onsite: false,
          relocationWillingness: false,
        },
        timeframe: "",
      },

      aiData: {
        skillMappings: [],
        resumeOptimizations: [],
        coverLetterDrafts: [],
        interviewPractice: [],
        careerInsights: [],
        marketAnalysis: {},
      },

      meta: {
        profileCompleteness: 0,
        lastUpdated: null,
        createdAt: null,
        version: "1.0",
        dataConsent: false,
        privacySettings: {
          publicProfile: false,
          shareWithRecruiters: false,
          allowAnalytics: true,
        },
      },

      // Gamification data
      xp: 0,
      previousXP: 0,
      achievements: [],
      dailyChallenges: {},
      weeklyQuests: {},
      longestStreak: 0,
      resumesGenerated: 0,
      level: 1,

      // Enhanced gamification tracking
      interviewsCompleted: 0,
      skillAssessmentsCompleted: 0,
      totalTimeSpent: 0,
      featureUsage: {},
    },

    // Settings (from canonical schema defaults)
    settings: { ...DEFAULT_SETTINGS },

    // Current resume data
    resumeData: {
      personalInfo: {},
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
      },
      achievements: [],
    },

    // Job search data
    jobSearchData: {
      preferences: {},
      savedJobs: [],
      applications: [],
      lastSearchSources: [],
    },

    // Chat history
    chatHistory: [],

    // Public logo cache
    publicLogos: {},

    // Normalized studios cache
    normalizedStudios: {},

    // Cover letter drafts
    coverLetterDrafts: [],

    // Loading states
    loading: {
      ai: false,
      save: false,
      export: false,
      validation: false,
      skillSuggestions: false,
      scoring: false,
      optimization: false,
      autoFill: false,
      templateGeneration: false,
      contentEdit: false,
      autoCompose: false,
      profileAnalysis: false,
      skillAnalysis: false,
    },

    // Error handling
    errors: {
      api: null,
      validation: {},
      network: null,
    },

    // App metadata
    meta: {
      version: getAppVersion(),
      lastSave: null,
      isOnline: navigator.onLine,
    },

    // AI Status
    aiStatus: {
      initialized: false,
      lastError: null,
      model: null,
    },

    // Cached list of available AI models (from GeminiModelService)
    availableModels: [] as any[],
  }),

  getters: {
    isConfigured: (state): boolean => {
      return !!(
        state.settings.geminiApiKey &&
        (state.user.personalInfo?.name || state.user.name)
      );
    },

    // Legacy compatibility getters
    mappedSkills: (state) => {
      let legacyMapped: any[] = [];
      if (Array.isArray(state.user.skills)) {
        legacyMapped =
          state.user.skills.filter((skill: any) => skill.realWorldMapping) ||
          [];
      }
      const aiMapped = Array.isArray(state.user.aiData?.skillMappings)
        ? state.user.aiData.skillMappings
        : [];
      return [...legacyMapped, ...aiMapped];
    },

    hasPortfolio: (state): boolean => {
      return state.user.portfolio && state.user.portfolio.length > 0;
    },

    portfolioPreferences: (state) => ({
      sort: state.settings.portfolioSort,
      filter: state.settings.portfolioFilter,
    }),

    hasValidEmail: (state): boolean => {
      const email = state.user.personalInfo?.email || state.user.email;
      return validateEmail(email);
    },

    profileCompleteness: (state): number => {
      const completeness = userProfileService.calculateCompleteness(state.user);
      if (state.user.meta.profileCompleteness !== completeness) {
        state.user.meta.profileCompleteness = completeness;
      }
      return completeness;
    },

    userProfile: (state): User => state.user,

    personalInfo: (state): PersonalInfo => {
      return (
        state.user.personalInfo || {
          name: state.user.name || "",
          email: state.user.email || "",
          phone: "",
          location: "",
          website: "",
          linkedIn: "",
          github: "",
          portfolio: "",
          summary: "",
          profilePicture: null,
          currentRole: "",
          currentCompany: "",
          yearsExperience: null,
        }
      );
    },

    allSkills: (state): Skills => state.user.skills,

    gamingBackground: (state): GamingExperience => state.user.gamingExperience,

    careerObjectives: (state): CareerGoals => {
      return (
        state.user.careerGoals || {
          targetRoles: [],
          targetIndustries: [],
          targetCompanies: [],
          salaryExpectations: { min: null, max: null, currency: "USD" },
          workPreferences: {
            remote: false,
            hybrid: false,
            onsite: false,
            relocationWillingness: false,
          },
          timeframe: "",
        }
      );
    },

    aiEnhancements: (state): AIData => {
      return (
        state.user.aiData || {
          skillMappings: [],
          resumeOptimizations: [],
          coverLetterDrafts: [],
          interviewPractice: [],
          careerInsights: [],
          marketAnalysis: {},
        }
      );
    },

    profileMetadata: (state): ProfileMeta => {
      return (
        state.user.meta || {
          profileCompleteness: 0,
          lastUpdated: null,
          createdAt: null,
          version: "1.0",
          dataConsent: false,
          privacySettings: {
            publicProfile: false,
            shareWithRecruiters: false,
            allowAnalytics: true,
          },
        }
      );
    },

    // Data for AI services
    aiTrainingData: (state) => {
      return userProfileService.extractForContext(state.user, "ai-training");
    },

    resumeContext: (state) => {
      return userProfileService.extractForContext(state.user, "resume");
    },

    coverLetterData: (state) => {
      return userProfileService.extractForContext(state.user, "cover-letter");
    },

    jobSearchContext: (state) => {
      return userProfileService.extractForContext(state.user, "job-search");
    },

    hasErrors: (state): boolean => {
      return !!(
        state.errors.api ||
        state.errors.network ||
        Object.keys(state.errors.validation).length > 0
      );
    },

    isOnline: (state): boolean => state.meta.isOnline,

    // Gamification getters
    userLevel: (state): number => {
      const xp = state.user.xp || 0;
      return Math.floor(xp / 100) + 1;
    },

    xpForNextLevel: (state): number => {
      const currentLevel = Math.floor((state.user.xp || 0) / 100) + 1;
      return currentLevel * 100 - (state.user.xp || 0);
    },

    totalAchievements: (): number => 8,

    earnedAchievements: (state): number =>
      (state.user.achievements || []).length,

    totalAchievementsAvailable: (): number => {
      return 9;
    },

    currentStreak: (state): number => {
      const dailyChallenges = state.user.dailyChallenges || {};
      let streak = 0;
      const currentDate = new Date();

      while (true) {
        const dateString = currentDate.toDateString();
        const challengesForDay = dailyChallenges[dateString] || [];

        if (challengesForDay.length === 0) {
          break;
        }

        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    },

    // Profile data getters for the new structure
    getUserProfile: (state): User => state.user,
    getPersonalInfo: (state): PersonalInfo =>
      state.user.personalInfo || ({} as PersonalInfo),
    getProfessionalExperience: (state): Experience[] =>
      state.user.experience || [],
    getEducation: (state): Education[] => state.user.education || [],
    getSkills: (state): Skills => state.user.skills,
    getGamingExperience: (state): GamingExperience =>
      state.user.gamingExperience,
    getCareerGoals: (state): CareerGoals =>
      state.user.careerGoals || ({} as CareerGoals),
    getPortfolio: (state): any[] => state.user.portfolio || [],
    getAIData: (state): AIData => state.user.aiData || ({} as AIData),
    getProfileCompleteness: (state): number =>
      state.user.meta?.profileCompleteness || 0,
    getProfileMeta: (state): ProfileMeta =>
      state.user.meta || ({} as ProfileMeta),

    // Interview statistics getter
    getInterviewStats: (state) => ({
      totalInterviews: state.user.interviewsCompleted || 0,
      totalSessions: state.user.interviewsCompleted || 0,
      completedInterviews: state.user.interviewsCompleted || 0,
      averageScore: 8.5,
      totalTimeSpent: state.user.totalTimeSpent || 0,
      mockInterviewUsage: state.user.featureUsage?.mockInterview || 0,
    }),

    // Selected model info from cached availableModels
    selectedModelInfo: (state) => {
      const id = state.settings?.selectedModel;
      if (
        !id ||
        !Array.isArray(state.availableModels) ||
        state.availableModels.length === 0
      )
        return null;
      return (
        state.availableModels.find((m: any) => m.id === id || m.name === id) ||
        null
      );
    },
  },

  actions: {
    // Wrapper for async Settings.vue calls; ensures Promise-based API
    async saveSettings(settings: Partial<Settings>): Promise<boolean> {
      try {
        const ok = this.updateSettings(settings)
        if (ok && this.settings.autoSave) {
          await this.saveToStorage()
        }
        return ok
      } catch (e: any) {
        logger.error('saveSettings failed:', e)
        this.setError('api', 'Failed to save settings')
        return false
      }
    },

    // Wrapper to save user profile data (Promise-based for UI flows)
    async saveUserProfile(profile: Partial<User>): Promise<boolean> {
      try {
        const ok = this.updateUser(profile)
        if (ok && this.settings.autoSave) {
          await this.saveToStorage()
        }
        return ok
      } catch (e: any) {
        logger.error('saveUserProfile failed:', e)
        this.setError('api', 'Failed to save profile')
        return false
      }
    },

    // Test current Gemini API key connectivity
    async testGeminiApiKey(): Promise<{ success: boolean; message: string; details?: any }> {
      try {
        const { resolveGeminiApiKey, testApiKey } = await import('@/shared/utils/apiKeys')
        const key = (this.settings?.geminiApiKey && this.settings.geminiApiKey.trim()) || (await resolveGeminiApiKey()) || ''
        if (!key) return { success: false, message: 'API key is required' }
        const res = await testApiKey(key, 'gemini')
        this.updateAiStatus({ initialized: !!res.success, lastError: res.success ? null : res.message })
        return res
      } catch (e: any) {
        const msg = e?.message || 'Unknown error'
        this.updateAiStatus({ initialized: false, lastError: msg })
        return { success: false, message: msg }
      }
    },

    // Persist API key and initialize related caches/utilities
    async connectGeminiApi(): Promise<boolean> {
      try {
        // Ensure key is stored in all expected locations for downstream utilities
        const key = this.settings?.geminiApiKey?.trim()
        if (key) {
          try {
            localStorage.setItem('gemini_api_key', key)
          } catch {}
          try {
            // Some utilities check an aggregated 'app-settings' blob
            const raw = localStorage.getItem('app-settings')
            const parsed = raw ? JSON.parse(raw) : {}
            parsed.geminiApiKey = key
            localStorage.setItem('app-settings', JSON.stringify(parsed))
          } catch {}
        }
        const result = await this.testGeminiApiKey()
        if (result.success) {
          this.updateAiStatus({ initialized: true, lastError: null })
          // Optionally warm model cache
          try { await this.loadAvailableModels() } catch {}
          return true
        }
        return false
      } catch (e: any) {
        logger.error('connectGeminiApi failed:', e)
        this.updateAiStatus({ initialized: false, lastError: e?.message || 'Failed to connect API' })
        return false
      }
    },

    // Fetch available Gemini models and cache them
    async loadAvailableModels(): Promise<void> {
      try {
        // Use cache first
        this.loadAvailableModelsFromCache()
        const key = (this.settings?.geminiApiKey && this.settings.geminiApiKey.trim()) || null
        if (!key) return
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
        const resp = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error(`Models request failed (${resp.status}): ${resp.statusText} ${txt}`)
        }
        const data = await resp.json().catch(() => ({}))
        const models = Array.isArray(data?.models) ? data.models : []
        this.setAvailableModels(models)
      } catch (e: any) {
        logger.warn('loadAvailableModels failed:', e?.message || e)
      }
    },
    // Cache and expose available models globally
    setAvailableModels(models: any[]): void {
      try {
        this.availableModels = Array.isArray(models) ? models : [];
        // Persist a lightweight cache with timestamp for quick startup
        try {
          unifiedStorage.local.set("gemini_models_cache", {
            ts: Date.now(),
            models: this.availableModels,
          });
        } catch {}
      } catch {
        this.availableModels = [];
      }
    },


    loadAvailableModelsFromCache(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
      try {
        const cached = unifiedStorage.local.get("gemini_models_cache") as any;
        if (
          cached &&
          Array.isArray(cached.models) &&
          typeof cached.ts === "number"
        ) {
          if (Date.now() - cached.ts < maxAgeMs) {
            this.availableModels = cached.models;
          }
        }
      } catch {}
    },
    upsertNormalizedStudios(studios: any[]) {
      if (!Array.isArray(studios) || studios.length === 0) return;
      const map = this.normalizedStudios || {};
      for (const s of studios) {
        if (!s?.id) continue;
        map[s.id] = { ...(map[s.id] || {}), ...s };
      }
      this.normalizedStudios = { ...map };
    },
    // Internal helper: get gamification service bound to this store
    _gamify(): any {
      try {
        const G: any = GamificationService as any;
        if (typeof G === "function") {
          try {
            return new G(this);
          } catch {
            return G(this);
          }
        }
      } catch {}
      return null;
    },

    // Persist resume/cover letter data to the store and storage
    async saveDocumentData(payload: {
      resumeData?: any;
      coverLetterData?: any;
    }): Promise<boolean> {
      try {
        const { resumeData, coverLetterData } = payload || {};

        // Attach to user object (kept flexible for JS callers)
        if (resumeData) {
          (this.user as any).resumeData = resumeData;
        }
        if (coverLetterData) {
          (this.user as any).coverLetterData = coverLetterData;
        }

        if (this.settings.autoSave) {
          await this.saveToStorage();
        }

        return true;
      } catch (error: any) {
        logger.error("Failed to save document data:", error);
        this.setError("api", "Failed to save document data");
        return false;
      }
    },

    // Error management
    setError(type: keyof Errors, error: string | null): void {
      if (type === "validation") {
        // For validation, we need to handle it as an object
        return;
      }
      (this.errors as any)[type] = error;
    },

    clearError(type?: keyof Errors): void {
      if (type) {
        if (type === "validation") {
          this.errors.validation = {};
        } else {
          (this.errors as any)[type] = null;
        }
      } else {
        this.errors = { api: null, validation: {}, network: null };
      }
    },

    setValidationError(field: string, message: string): void {
      this.errors.validation[field] = message;
    },

    clearValidationError(field: string): void {
      delete this.errors.validation[field];
    },

    // Enhanced load from storage with error handling
    loadFromStorage(): void {
      try {
        const stored = unifiedStorage.local.get("navicv-data");
        if (stored) {
          let data: any;
          try {
            data = typeof stored === "string" ? JSON.parse(stored) : stored;
          } catch (parseError: any) {
            logger.error(
              "Failed to parse stored data, resetting to defaults:",
              parseError.message,
            );
            unifiedStorage.local.remove("navicv-data");
            return;
          }

          // Validate data structure before patching
          if (data && typeof data === "object" && !Array.isArray(data)) {
            try {
              // Validate and normalize data structure
              if (data.user && typeof data.user === "object") {
                data.user.xp =
                  typeof data.user.xp === "number" ? data.user.xp : 0;
                data.user.level =
                  typeof data.user.level === "number" ? data.user.level : 1;
                data.user.achievements = Array.isArray(data.user.achievements)
                  ? data.user.achievements
                  : [];
                data.user.dailyChallenges =
                  typeof data.user.dailyChallenges === "object" &&
                  data.user.dailyChallenges !== null
                    ? data.user.dailyChallenges
                    : {};
                data.user.weeklyQuests =
                  typeof data.user.weeklyQuests === "object" &&
                  data.user.weeklyQuests !== null
                    ? data.user.weeklyQuests
                    : {};

                data.user.portfolio = Array.isArray(data.user.portfolio)
                  ? data.user.portfolio
                  : [];
                data.user.experience = Array.isArray(data.user.experience)
                  ? data.user.experience
                  : [];
                data.user.education = Array.isArray(data.user.education)
                  ? data.user.education
                  : [];
                data.user.certifications = Array.isArray(
                  data.user.certifications,
                )
                  ? data.user.certifications
                  : [];

                if (!data.user.skills || typeof data.user.skills !== "object") {
                  data.user.skills = {
                    technical: [],
                    soft: [],
                    languages: [],
                    tools: [],
                    frameworks: [],
                    gaming: [],
                  };
                } else {
                  Object.keys(data.user.skills).forEach((key) => {
                    if (!Array.isArray(data.user.skills[key])) {
                      data.user.skills[key] = [];
                    }
                  });
                }
              }

              if (
                data.jobSearchData &&
                typeof data.jobSearchData === "object"
              ) {
                data.jobSearchData.savedJobs = Array.isArray(
                  data.jobSearchData.savedJobs,
                )
                  ? data.jobSearchData.savedJobs
                  : [];
                data.jobSearchData.applications = Array.isArray(
                  data.jobSearchData.applications,
                )
                  ? data.jobSearchData.applications
                  : [];
                data.jobSearchData.lastSearchSources = Array.isArray(
                  data.jobSearchData.lastSearchSources,
                )
                  ? data.jobSearchData.lastSearchSources
                  : [];
              }

              if (!data.resumeData || typeof data.resumeData !== "object") {
                data.resumeData = {
                  personalInfo: {},
                  experience: [],
                  education: [],
                  achievements: [],
                  skills: { technical: [], soft: [] },
                };
              } else {
                data.resumeData.personalInfo =
                  data.resumeData.personalInfo || {};
                data.resumeData.experience = Array.isArray(
                  data.resumeData.experience,
                )
                  ? data.resumeData.experience
                  : [];
                data.resumeData.education = Array.isArray(
                  data.resumeData.education,
                )
                  ? data.resumeData.education
                  : [];
                data.resumeData.achievements = Array.isArray(
                  data.resumeData.achievements,
                )
                  ? data.resumeData.achievements
                  : [];
                data.resumeData.skills = data.resumeData.skills || {
                  technical: [],
                  soft: [],
                };
                if (!Array.isArray(data.resumeData.skills.technical)) {
                  data.resumeData.skills.technical = [];
                }
                if (!Array.isArray(data.resumeData.skills.soft)) {
                  data.resumeData.skills.soft = [];
                }
              }

              data.coverLetterDrafts = Array.isArray(data.coverLetterDrafts)
                ? data.coverLetterDrafts
                : [];
              data.chatHistory = Array.isArray(data.chatHistory)
                ? data.chatHistory
                : [];

              if (data.settings && typeof data.settings === "object") {
                data.settings.theme =
                  typeof data.settings.theme === "string"
                    ? data.settings.theme
                    : "auto";
                data.settings.autoSave =
                  typeof data.settings.autoSave === "boolean"
                    ? data.settings.autoSave
                    : true;
              }

              this.$patch(data);
              this.meta.lastSave = new Date(data.meta?.lastSave || Date.now());
              logger.debug("App state loaded from storage successfully");
              try {
                this.settings = mergeSettings(DEFAULT_SETTINGS, this.settings);
              } catch {}
            } catch (patchError: any) {
              logger.error(
                "Failed to apply stored data, using defaults:",
                patchError.message,
              );
            }
          } else {
            logger.warn("Invalid stored data structure, using defaults");
          }
        }

        // Load preferences from DB (canonical)
        try {
          unifiedStorage
            .getPreferences?.()
            .then((prefs: any) => {
              if (prefs && typeof prefs === "object") {
                this.settings = mergeSettings(this.settings, prefs);
              }
            })
            .catch(() => {});
        } catch {}

        // Load theme from UnifiedStorage if not already set
        try {
          const themeKey = "navicv-theme";
          const storedTheme = unifiedStorage.get(themeKey);
          if (storedTheme && storedTheme.value) {
            this.settings.theme = storedTheme.value;
          }
        } catch {
          // Ignore theme loading errors
        }
      } catch (error: any) {
        console.error("Failed to load data from storage:", error);
        this.setError("network", "Failed to load saved data");
      }
    },

    // Enhanced save to storage with validation
    async saveToStorage(): Promise<void> {
      await persistMutex.runExclusive(async () => {
        try {
          this.meta.lastSave = new Date();
          const dataToSave = {
            ...this.$state,
            meta: { ...this.meta, lastSave: this.meta.lastSave.toISOString() },
          };
          unifiedStorage.local.set("navicv-data", dataToSave);
          try {
            await unifiedStorage.setPreferences?.(this.settings);
          } catch {}
          this.clearError("network");
        } catch (error: any) {
          logger.error("Failed to save data to storage:", error);
          this.setError("network", "Failed to save data");
        }
      });
    },

    // Profile sync notification system
    emitProfileSync(profile: User, changes: any): void {
      if (typeof window !== "undefined") {
        const event = new CustomEvent("profile-sync", {
          detail: { profile, changes },
        });
        window.dispatchEvent(event);
      }
    },

    // Listen for profile sync events
    addProfileSyncListener(
      callback: (_event: CustomEvent) => void,
    ): () => void {
      if (typeof window !== "undefined") {
        const handler = (e: Event) => callback(e as CustomEvent);
        window.addEventListener("profile-sync", handler);
        return () => window.removeEventListener("profile-sync", handler);
      }
      return () => {};
    },

    // Enhanced update user with validation and comprehensive profile management
    updateUser(userData: Partial<User>): boolean {
      try {
        // Handle both legacy and new profile structure
        const isLegacyUpdate =
          userData.name !== undefined || userData.email !== undefined;

        if (isLegacyUpdate) {
          return this.updateLegacyUser(userData);
        }

        // Use profile service for comprehensive updates
        const updatedProfile = userProfileService.mergeProfileData(
          this.user,
          userData,
          "form",
        );

        // Validate the merged profile
        const validation = userProfileService.validateProfile(updatedProfile);
        if (!validation.isValid) {
          validation.errors.forEach((error: any) => {
            this.setValidationError(error.field, error.message);
          });
          return false;
        }

        this.clearError();
        this.user = updatedProfile;

        if (this.settings.autoSave) {
          this.saveToStorage();
        }

        userProfileService.notifyProfileSync(this.user, userData);
        this.emitProfileSync(this.user, userData);
        this.handleProfileUpdateGamification(userData);

        logger.info("User profile updated successfully");
        return true;
      } catch (error: any) {
        logger.error("Failed to update user:", error);
        this.setError("api", "Failed to update user information");
        return false;
      }
    },

    // Legacy user update for backward compatibility
    updateLegacyUser(userData: Partial<User>): boolean {
      try {
        if (userData.email && !validateEmail(userData.email)) {
          this.setValidationError(
            "email",
            "Please enter a valid email address",
          );
          return false;
        }

        if (userData.name !== undefined && !validateRequired(userData.name)) {
          this.setValidationError("name", "Name is required");
          return false;
        }

        this.clearValidationError("email");
        this.clearValidationError("name");

        if (userData.name !== undefined) {
          this.user.name = userData.name;
          this.user.personalInfo.name = userData.name;
        }
        if (userData.email !== undefined) {
          this.user.email = userData.email;
          this.user.personalInfo.email = userData.email;
        }

        if (userData.gamingExperience !== undefined) {
          this.user.gamingExperience = userData.gamingExperience as any;
        }
        if (userData.skills !== undefined) {
          this.user.skills = userData.skills as any;
        }
        if (userData.portfolio !== undefined) {
          this.user.portfolio = userData.portfolio;
        }

        this.user.meta.lastUpdated = new Date().toISOString();

        if (this.settings.autoSave) {
          this.saveToStorage();
        }

        this.handleProfileUpdateGamification(userData);
        return true;
      } catch (error: any) {
        logger.error("Failed to update legacy user:", error);
        return false;
      }
    },

    // Handle gamification for profile updates
    handleProfileUpdateGamification(userData: Partial<User>): void {
      const g = this._gamify();
      if (g) {
        try {
          g.completeDailyChallenge("update_profile");
          if (
            userData.name ||
            userData.email ||
            userData.personalInfo ||
            userData.experience ||
            userData.skills ||
            userData.gamingExperience
          ) {
            g.awardXP(10, "profile_update");
          }
          g.updateStreak();


          // AND we're not currently updating achievements (to prevent loops)
          if (
            userData.portfolio &&
            Array.isArray(userData.portfolio) &&
            !userData.achievements
          ) {
            const newPortfolioCount = userData.portfolio.length;
            const currentPortfolioCount = this.user.portfolio?.length || 0;


            if (
              newPortfolioCount !== currentPortfolioCount &&
              newPortfolioCount >= 5
            ) {
              g.processAchievements();
            }
          } else if (!userData.achievements) {
            // For non-portfolio, non-achievement updates, still process achievements but less frequently
            g.processAchievements();
          }
        } catch (e: any) {
          logger.warn("Gamification profile update failed:", e);
        }
      }
    },

    // New comprehensive profile update methods
    updatePersonalInfo(personalInfo: PersonalInfo): boolean {
      const userData = { personalInfo };
      return this.updateUser(userData);
    },

    updateProfessionalExperience(experience: Experience[]): boolean {
      const userData = { experience };
      return this.updateUser(userData);
    },

    updateEducation(education: Education[]): boolean {
      const userData = { education };
      return this.updateUser(userData);
    },

    updateSkills(skills: Skills): boolean {
      const userData = { skills };
      return this.updateUser(userData);
    },

    updateGamingExperience(gamingExperience: GamingExperience): boolean {
      const userData = { gamingExperience };
      return this.updateUser(userData);
    },

    updateCareerGoals(careerGoals: CareerGoals): boolean {
      const userData = { careerGoals };
      return this.updateUser(userData);
    },

    updatePortfolioItems(portfolio: any[]): boolean {
      const userData = { portfolio };
      return this.updateUser(userData);
    },

    updatePortfolioLayout(layout: "grid" | "list" | "timeline"): boolean {
      return this.updateSettings({ portfolioLayout: layout });
    },

    togglePortfolioAnalytics(): boolean {
      return this.updateSettings({
        portfolioShowAnalytics: !this.settings.portfolioShowAnalytics,
      });
    },

    updateAIData(aiData: AIData): boolean {
      const userData = { aiData };
      return this.updateUser(userData);
    },

    // Initialize complete profile for new users
    initializeUserProfile(basicInfo: any = {}): boolean {
      try {
        const newProfile = userProfileService.initializeProfile(basicInfo);
        this.user = newProfile;

        if (this.settings.autoSave) {
          this.saveToStorage();
        }

        logger.info("User profile initialized");
        return true;
      } catch (error: any) {
        logger.error("Failed to initialize user profile:", error);
        return false;
      }
    },

    // Enhanced update settings with safe, permissive validation
    updateSettings(settings: Partial<Settings>): boolean {
      try {
        if (
          settings.geminiApiKey !== undefined &&
          typeof settings.geminiApiKey === "string"
        ) {
          settings.geminiApiKey = settings.geminiApiKey.trim();
          this.clearValidationError("apiKey");
        }

        this.settings = mergeSettings(this.settings, settings);

        // Ensure geminiApiKey is also saved to localStorage for easy access by AI services
        if (
          settings.geminiApiKey !== undefined &&
          typeof window !== "undefined"
        ) {
          try {
            if (settings.geminiApiKey && settings.geminiApiKey.trim()) {
              localStorage.setItem(
                "gemini_api_key",
                settings.geminiApiKey.trim(),
              );
            } else {
              localStorage.removeItem("gemini_api_key");
            }
          } catch (e) {
            console.warn("Failed to save API key to localStorage:", e);
          }
        }

        try {
          setVoiceRoutingPreferences({
            ttsProvider: this.settings.ttsProvider,
            sttProvider: this.settings.sttProvider,
            micDeviceId: this.settings.selectedMicId,
            speakerDeviceId: this.settings.selectedSpeakerId,
            lang: this.settings.voiceLang,
          });
        } catch {}

        if (this.settings.autoSave) {
          this.saveToStorage();
        }
        return true;
      } catch (error: any) {
        logger.error("Failed to update settings:", error);
        this.setError("api", "Failed to update settings");
        return false;
      }
    },

    // Reset settings to defaults
    async resetSettings(): Promise<boolean> {
      try {
        logger.info("Resetting all settings to defaults");

        // Reset settings to default values
        this.settings = { ...DEFAULT_SETTINGS };

        // Clear localStorage API key
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("gemini_api_key");
          } catch (e) {
            console.warn("Failed to clear API key from localStorage:", e);
          }
        }

        // Clear validation errors
        this.errors.validation = {};
        this.errors.api = null;

        // Save to storage if auto-save is enabled
        if (this.settings.autoSave) {
          this.saveToStorage();
        }

        logger.info("Settings reset to defaults successfully");
        return true;
      } catch (error: any) {
        logger.error("Failed to reset settings:", error);
        this.setError("api", "Failed to reset settings to defaults");
        return false;
      }
    },

    updateAiStatus(status: Partial<AIStatus>): void {
      this.aiStatus = { ...this.aiStatus, ...status };
    },

    // Enhanced add chat message with validation
    addChatMessage(message: ChatMessage): void {
      try {
        if (typeof message.content !== "string" || !message.role) {
          throw new Error(
            "Invalid message format: content must be string and role must be defined",
          );
        }

        const entry: ChatMessage = {
          ...message,
          timestamp: message.timestamp || new Date().toISOString(),
          id: message.id || Date.now().toString(),
        };
        this.chatHistory.push(entry);

        if (this.chatHistory.length > 100) {
          this.chatHistory = this.chatHistory.slice(-50);
        }

        if (this.settings.autoSave) {
          this.saveToStorage();
        }

        if (message.role === "user") {
          const g = this._gamify();
          if (g) {
            try {
              g.completeDailyChallenge("chat_session");
              g.awardXP(5, "chat_message");
              g.updateStreak();
            } catch (e: any) {
              console.warn("Gamification chat hooks failed:", e);
            }
          }
        }
      } catch (error: any) {
        logger.error("Failed to add chat message:", error);
        this.setError("api", "Failed to save chat message");
      }
    },

    // Clear chat history
    clearChatHistory(): void {
      try {
        this.chatHistory = [];
        if (this.settings.autoSave) {
          this.saveToStorage();
        }
      } catch (error: any) {
        logger.error("Failed to clear chat history:", error);
        this.setError("api", "Failed to clear chat history");
      }
    },

    // Enhanced set loading state
    setLoading(type: keyof LoadingStates, value: boolean): void {
      if (Object.prototype.hasOwnProperty.call(this.loading, type)) {
        this.loading[type] = value;
      } else {
        logger.warn(`Unknown loading type: ${type}`);
      }
    },

    // Network status management
    setOnlineStatus(isOnline: boolean): void {
      this.meta.isOnline = isOnline;
      if (!isOnline) {
        this.setError(
          "network",
          "You are currently offline. Some features may not work.",
        );
      } else {
        this.clearError("network");
      }
    },

    // Initialize connection monitoring
    initializeNetworkMonitoring(): void {
      if (!(this as any)._onOnline) {
        (this as any)._onOnline = () => this.setOnlineStatus(true);
      }
      if (!(this as any)._onOffline) {
        (this as any)._onOffline = () => this.setOnlineStatus(false);
      }
      window.addEventListener("online", (this as any)._onOnline);
      window.addEventListener("offline", (this as any)._onOffline);
      this.setOnlineStatus(navigator.onLine);
    },

    // Cleanup method for removing event listeners
    cleanup(): void {
      try {
        if ((this as any)._onOnline) {
          window.removeEventListener("online", (this as any)._onOnline);
        }
      } catch (error: any) {
        logger.error("Error removing online event listener:", error);
      }
      try {
        if ((this as any)._onOffline) {
          window.removeEventListener("offline", (this as any)._onOffline);
        }
      } catch (error: any) {
        logger.error("Error removing offline event listener:", error);
      }
      (this as any)._onOnline = null;
      (this as any)._onOffline = null;
    },

    // Additional methods for job applications, portfolio, etc.
    saveJob(job: any): boolean {
      try {
        if (!job || !job.id) {
          throw new Error("Invalid job");
        }
        const exists = this.jobSearchData.savedJobs.find(
          (j) => j.id === job.id,
        );
        if (exists) {
          return false;
        }

        const saved = { ...job, savedAt: new Date().toISOString() };
        this.jobSearchData.savedJobs.push(saved);
        if (this.settings.autoSave) {
          this.saveToStorage();
        }

        try {
          statisticsService.recordSavedJob();
        } catch (e: any) {
          console.warn("Statistics tracking failed for saved job:", e);
        }

        const g = this._gamify();
        if (g) {
          try {
            g.awardXP(10, "job_saved");
            const today = new Date().toDateString();
            const savedJobs = Array.isArray(this.jobSearchData.savedJobs)
              ? this.jobSearchData.savedJobs
              : [];
            const countToday = savedJobs.filter(
              (j) => new Date(j.savedAt).toDateString() === today,
            ).length;
            if (countToday >= 3) {
              g.completeDailyChallenge("job_search");
              g.updateStreak();
            }
            g.processAchievements();
          } catch (e: any) {
            logger.warn("Gamification saveJob hooks failed:", e);
          }
        }
        return true;
      } catch (error: any) {
        logger.error("Failed to save job:", error);
        this.setError("api", "Failed to save job");
        return false;
      }
    },

    // Cover letter drafts management
    saveCoverLetterDraft(draft: Partial<CoverLetterDraft>): string | null {
      try {
        const now = new Date().toISOString();
        const id = draft.id || Date.now().toString();
        const existingIndex = this.coverLetterDrafts.findIndex(
          (d) => d.id === id,
        );
        const normalized: CoverLetterDraft = {
          id,
          company: draft.company || "",
          position: draft.position || "",
          role: draft.role || "",
          preferences: draft.preferences || {},
          studioProfile: draft.studioProfile || {},
          content: draft.content || {},
          meta: {
            createdAt: draft.meta?.createdAt || now,
            updatedAt: now,
          },
        };
        if (existingIndex >= 0) {
          this.coverLetterDrafts.splice(existingIndex, 1, normalized);
        } else {
          this.coverLetterDrafts.push(normalized);
        }
        if (this.settings.autoSave) {
          this.saveToStorage();
        }
        return normalized.id;
      } catch (error: any) {
        logger.error("Failed to save cover letter draft:", error);
        this.setError("api", "Failed to save cover letter draft");
        return null;
      }
    },

    deleteCoverLetterDraft(id: string): boolean {
      try {
        if (!Array.isArray(this.coverLetterDrafts)) {
          this.coverLetterDrafts = [];
          return false;
        }
        this.coverLetterDrafts = this.coverLetterDrafts.filter(
          (d) => d.id !== id,
        );
        if (this.settings.autoSave) {
          this.saveToStorage();
        }
        return true;
      } catch (error: any) {
        logger.error("Failed to delete cover letter draft:", error);
        this.setError("api", "Failed to delete cover letter draft");
        return false;
      }
    },

    findCoverLetterDraftsByCompany(company: string): CoverLetterDraft[] {
      try {
        if (!Array.isArray(this.coverLetterDrafts)) {
          return [];
        }
        return this.coverLetterDrafts.filter(
          (d) =>
            (d.company || "").toLowerCase() === (company || "").toLowerCase(),
        );
      } catch (error: any) {
        logger.error("Failed to query cover letter drafts:", error);
        return [];
      }
    },
  },
});
