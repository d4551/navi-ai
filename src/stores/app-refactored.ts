import { defineStore } from "pinia";
import { Mutex } from "async-mutex";
import GamificationService from "@/utils/gamification";
import { logger } from "@/shared/utils/logger";
import { unifiedStorage } from "@/utils/storage";
import { getAppVersion } from "@/utils/version";

// Import domain-specific stores
import { useUserStore } from "./user";
import { useSettingsStore } from "./settings";
import { useAIStore } from "./ai";
import { useJobsStore } from "./jobs";

export interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  timestamp?: string;
}

export interface ResumeData {
  personalInfo: any;
  experience: any[];
  education: any[];
  skills: {
    technical: string[];
    soft: string[];
  };
  achievements: any[];
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

export interface AppState {
  // Current resume data (separate from user profile)
  resumeData: ResumeData;

  // Chat history
  chatHistory: ChatMessage[];

  // Loading states
  loading: LoadingStates;

  // Error handling
  errors: Errors;

  // App metadata
  meta: AppMeta;
}

// Module-level mutex to serialize persistence
const persistMutex = new Mutex();

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
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

    // Chat history
    chatHistory: [],

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
  }),

  getters: {
    // Convenience getters that delegate to domain stores
    isConfigured(): boolean {
      const userStore = useUserStore();
      const settingsStore = useSettingsStore();
      return !!(
        settingsStore.settings.geminiApiKey &&
        (userStore.user.personalInfo?.name || userStore.user.name)
      );
    },

    hasPortfolio(): boolean {
      const userStore = useUserStore();
      return userStore.user.portfolio && userStore.user.portfolio.length > 0;
    },

    hasValidEmail(): boolean {
      const userStore = useUserStore();
      return userStore.hasValidEmail;
    },

    profileCompleteness(): number {
      const userStore = useUserStore();
      return userStore.profileCompleteness;
    },

    userProfile() {
      const userStore = useUserStore();
      return userStore.user;
    },

    hasErrors: (state): boolean => {
      return !!(
        state.errors.api ||
        state.errors.network ||
        Object.keys(state.errors.validation).length > 0
      );
    },

    isOnline: (state): boolean => state.meta.isOnline,

    // Legacy compatibility getters
    mappedSkills() {
      const userStore = useUserStore();
      const aiMapped = Array.isArray(userStore.user.aiData?.skillMappings)
        ? userStore.user.aiData.skillMappings
        : [];
      return aiMapped;
    },

    // Data for AI services
    aiTrainingData() {
      const userStore = useUserStore();
      // This would use userProfileService.extractForContext when available
      return userStore.user;
    },

    resumeContext() {
      const userStore = useUserStore();
      return userStore.user;
    },

    coverLetterData() {
      const userStore = useUserStore();
      return userStore.user;
    },

    jobSearchContext() {
      const userStore = useUserStore();
      return userStore.user;
    },
  },

  actions: {
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

        // Update resume data in this store
        if (resumeData) {
          this.resumeData = resumeData;
        }

        // Cover letter data goes to jobs store
        if (coverLetterData) {
          const jobsStore = useJobsStore();
          // Add logic to save cover letter data
        }

        const settingsStore = useSettingsStore();
        if (settingsStore.settings.autoSave) {
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
        // Load app-specific data
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
              // Load app-specific data
              if (data.resumeData && typeof data.resumeData === "object") {
                this.resumeData = data.resumeData;
              }

              if (Array.isArray(data.chatHistory)) {
                this.chatHistory = data.chatHistory;
              }

              this.meta.lastSave = new Date(data.meta?.lastSave || Date.now());
              logger.debug("App state loaded from storage successfully");

              // Load domain store data
              const userStore = useUserStore();
              const settingsStore = useSettingsStore();
              const aiStore = useAIStore();
              const jobsStore = useJobsStore();

              // This would be more sophisticated in reality
              if (data.user) {
                userStore.$patch({ user: data.user });
              }
              if (data.settings) {
                settingsStore.$patch({ settings: data.settings });
              }
              if (data.aiStatus) {
                aiStore.$patch({ aiStatus: data.aiStatus });
              }
              if (data.jobSearchData) {
                jobsStore.$patch({ jobSearchData: data.jobSearchData });
              }
              if (data.coverLetterDrafts) {
                jobsStore.$patch({ coverLetterDrafts: data.coverLetterDrafts });
              }

              // Load settings and other stores from their own methods
              settingsStore.loadFromStorage();

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
      } catch (error: any) {
        logger.error("Failed to load data from storage:", error);
        this.setError("network", "Failed to load saved data");
      }
    },

    // Enhanced save to storage with validation
    async saveToStorage(): Promise<void> {
      await persistMutex.runExclusive(async () => {
        try {
          this.meta.lastSave = new Date();

          // Collect data from all stores
          const userStore = useUserStore();
          const settingsStore = useSettingsStore();
          const aiStore = useAIStore();
          const jobsStore = useJobsStore();

          const dataToSave = {
            // App store data
            resumeData: this.resumeData,
            chatHistory: this.chatHistory,
            meta: { ...this.meta, lastSave: this.meta.lastSave.toISOString() },

            // Domain store data
            user: userStore.user,
            settings: settingsStore.settings,
            aiStatus: aiStore.aiStatus,
            availableModels: aiStore.availableModels,
            jobSearchData: jobsStore.jobSearchData,
            coverLetterDrafts: jobsStore.coverLetterDrafts,
            publicLogos: jobsStore.publicLogos,
            normalizedStudios: jobsStore.normalizedStudios,
          };

          unifiedStorage.local.set("navicv-data", dataToSave);

          // Save settings separately
          await settingsStore.saveToStorage();

          this.clearError("network");
        } catch (error: any) {
          logger.error("Failed to save data to storage:", error);
          this.setError("network", "Failed to save data");
        }
      });
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

        const settingsStore = useSettingsStore();
        if (settingsStore.settings.autoSave) {
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
              logger.warn("Gamification chat hooks failed:", e);
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
        const settingsStore = useSettingsStore();
        if (settingsStore.settings.autoSave) {
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

    // Profile sync notification system
    emitProfileSync(profile: any, changes: any): void {
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

    // Delegation methods to domain stores
    async saveUserProfile(profile: any): Promise<boolean> {
      const userStore = useUserStore();
      const ok = userStore.updateUser(profile);
      if (ok) {
        const settingsStore = useSettingsStore();
        if (settingsStore.settings.autoSave) {
          await this.saveToStorage();
        }
      }
      return ok;
    },

    async saveSettings(settings: any): Promise<boolean> {
      const settingsStore = useSettingsStore();
      return await settingsStore.saveSettings(settings);
    },

    async testGeminiApiKey() {
      const aiStore = useAIStore();
      return await aiStore.testGeminiApiKey();
    },

    async connectGeminiApi(): Promise<boolean> {
      const aiStore = useAIStore();
      return await aiStore.connectGeminiApi();
    },

    saveJob(job: any): boolean {
      const jobsStore = useJobsStore();
      const ok = jobsStore.saveJob(job);
      if (ok) {
        // Handle gamification here since it was in the original store
        const g = this._gamify();
        if (g) {
          try {
            g.awardXP(10, "job_saved");
            // Additional gamification logic...
          } catch (e: any) {
            logger.warn("Gamification saveJob hooks failed:", e);
          }
        }
      }
      return ok;
    },
  },
});