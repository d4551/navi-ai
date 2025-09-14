
// Electron services from the root electron directory
declare module "../../electron/services/DatabaseStudioService.cjs" {
  interface DatabaseStudioService {
    getStudio(_id: string): Promise<any>;
    getAllStudios?(): Promise<any[]>;
    createStudio?(_data: any): Promise<any>;
    updateStudio?(_id: string, _data: any): Promise<any>;
    deleteStudio?(_id: string): Promise<boolean>;
  }
  
  export const DatabaseStudioService: new () => DatabaseStudioService;
  export = DatabaseStudioService;
}

declare module "../../electron/services/AIService.cjs" {
  interface MainAIService {
    generateText(_prompt: string): Promise<{ text: string }>;
    generateResponse?(_input: string): Promise<any>;
    isAvailable?(): boolean;
  }
  
  export const MainAIService: new () => MainAIService;
export = MainAIService;
}

// Minimal module shims to unblock type-check where full types aren't required
declare module '@/utils/mockInterview' {
  export const MockInterviewService: any
}
declare module 'vite/client' {}
declare module 'vitest/globals' {}

// Alternative relative paths that might be used
declare module "../electron/services/DatabaseStudioService.cjs" {
  interface DatabaseStudioService {
    getStudio(_id: string): Promise<any>;
    getAllStudios?(): Promise<any[]>;
    createStudio?(_data: any): Promise<any>;
    updateStudio?(_id: string, _data: any): Promise<any>;
    deleteStudio?(_id: string): Promise<boolean>;
  }
  
  export const DatabaseStudioService: new () => DatabaseStudioService;
  export = DatabaseStudioService;
}

declare module "../electron/services/AIService.cjs" {
  interface MainAIService {
    generateText(_prompt: string): Promise<{ text: string }>;
    generateResponse?(_input: string): Promise<any>;
    isAvailable?(): boolean;
  }
  
  export const MainAIService: new () => MainAIService;
  export = MainAIService;
}
