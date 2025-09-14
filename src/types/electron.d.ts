
declare global {
  interface Window {
    api?: any; // Main API exposed by preload script
    electronAPI?: {
      // File operations
      saveFile: (options?: any) => Promise<any>;
      openFile: (options?: any) => Promise<any>;
      openExternal: (url: string) => Promise<void>;

      // System info
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;

      // AI operations
      ai: {
        initialize: (config: {
          apiKey: string;
          model?: string;
        }) => Promise<{ success: boolean; data?: any; error?: string }>;
        generateContent: (params: any) => Promise<any>;
        listModels: () => Promise<any>;
      };

      // Interview operations
      interview: {
        start: (
          config: any,
        ) => Promise<{ success: boolean; session?: any; error?: string }>;
        pause: (
          sessionId: string,
        ) => Promise<{ success: boolean; error?: string }>;
        resume: (
          sessionId: string,
        ) => Promise<{ success: boolean; error?: string }>;
        complete: (
          sessionId: string,
        ) => Promise<{ success: boolean; analysis?: any; error?: string }>;
        cancel: (
          sessionId: string,
        ) => Promise<{ success: boolean; error?: string }>;
        nextQuestion: (
          sessionId: string,
        ) => Promise<{
          success: boolean;
          question?: any;
          questionIndex?: number;
          isComplete?: boolean;
          error?: string;
        }>;
        submitResponse: (
          data: any,
        ) => Promise<{ success: boolean; error?: string }>;
        analyzeResponse: (
          data: any,
        ) => Promise<{ success: boolean; analysis?: any; error?: string }>;
        getStats: () => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;
        getHistory: (
          params?: any,
        ) => Promise<{ success: boolean; data?: any; error?: string }>;
        generateQuestions: (
          config: any,
        ) => Promise<{ success: boolean; data?: any; error?: string }>;
      };

      // Media operations
      media: {
        getDevices: () => Promise<{
          success: boolean;
          data?: any;
          error?: string;
        }>;
        requestPermissions: (
          constraints: any,
        ) => Promise<{ success: boolean; error?: string }>;
      };

      // Audio operations
      audio: {
        processSpeech: (data: {
          audioBlob: Blob;
          language?: string;
        }) => Promise<{
          success: boolean;
          transcript?: string;
          confidence?: number;
          error?: string;
        }>;
        generateSpeech: (data: {
          text: string;
          voice?: any;
          rate?: number;
        }) => Promise<{ success: boolean; error?: string }>;
      };

      // Secure storage
      secureStore: {
        set: (
          key: string,
          value: string,
        ) => Promise<{ success: boolean; error?: string }>;
        get: (
          key: string,
        ) => Promise<{ success: boolean; data?: string; error?: string }>;
      };

      // Database utilities
      db: {
        backupNow: (
          defaultPath?: string,
        ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
        getBackupInfo: () => Promise<{
          success: boolean;
          data?: { lastBackup: string; lastBackupPath?: string };
          error?: string;
        }>;
      };
    };
  }
}

export {};
