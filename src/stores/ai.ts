import { defineStore } from "pinia";
import { logger } from "@/shared/utils/logger";
import { unifiedStorage } from "@/utils/storage";

export interface AIStatus {
  initialized: boolean;
  lastError: string | null;
  model: string | null;
}

export interface AIState {
  aiStatus: AIStatus;
  availableModels: any[];
}

export const useAIStore = defineStore("ai", {
  state: (): AIState => ({
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
    // Selected model info from cached availableModels
    selectedModelInfo: (state) => {
      // We need to access settings store here, but for now use a basic approach
      const settingsStore = import('@/stores/settings').then(m => m.useSettingsStore()).catch(() => null);
      if (!settingsStore) return null;

      // For now, return null - this will be properly implemented when we integrate stores
      return null;
    },
  },

  actions: {
    updateAiStatus(status: Partial<AIStatus>): void {
      this.aiStatus = { ...this.aiStatus, ...status };
    },

    // Test current Gemini API key connectivity
    async testGeminiApiKey(): Promise<{ success: boolean; message: string; details?: any }> {
      try {
        const { resolveGeminiApiKey, testApiKey } = await import('@/shared/utils/apiKeys');

        // We need to get the API key from settings store
        // For now, try to resolve it directly
        const key = await resolveGeminiApiKey() || '';
        if (!key) return { success: false, message: 'API key is required' };

        const res = await testApiKey(key, 'gemini');
        this.updateAiStatus({ initialized: !!res.success, lastError: res.success ? null : res.message });
        return res;
      } catch (e: any) {
        const msg = e?.message || 'Unknown error';
        this.updateAiStatus({ initialized: false, lastError: msg });
        return { success: false, message: msg };
      }
    },

    // Persist API key and initialize related caches/utilities
    async connectGeminiApi(): Promise<boolean> {
      try {
        const result = await this.testGeminiApiKey();
        if (result.success) {
          this.updateAiStatus({ initialized: true, lastError: null });
          // Optionally warm model cache
          try { await this.loadAvailableModels(); } catch {}
          return true;
        }
        return false;
      } catch (e: any) {
        logger.error('connectGeminiApi failed:', e);
        this.updateAiStatus({ initialized: false, lastError: e?.message || 'Failed to connect API' });
        return false;
      }
    },

    // Fetch available Gemini models and cache them
    async loadAvailableModels(): Promise<void> {
      try {
        // Use cache first
        this.loadAvailableModelsFromCache();

        // We need to get the API key from settings - for now skip the API call
        // This will be properly implemented when stores are integrated
        logger.info("Model loading skipped during store refactoring");
      } catch (e: any) {
        logger.warn('loadAvailableModels failed:', e?.message || e);
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
  },
});