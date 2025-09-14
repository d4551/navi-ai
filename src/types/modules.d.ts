declare module "@/composables/useTheme" {
  export function useTheme(): any;
}

declare module "@/shared/composables/useUnifiedTheme" {
  export function useUnifiedTheme(): any;
  export function initializeUnifiedThemeGlobal(): void;
  export function createThemeUtils(): any;
  export function createThemeCSS(colorScheme?: "light" | "dark"): any;
}

declare module "@/utils/aiClient" {
    prompt: string,
    systemInstructions?: string,
    options?: any,
  ): Promise<any>;
    contentType?: string;
    userInput?: string;
    context?: Record<string, any>;
    options?: Record<string, any>;
    systemPrompt?: string;
    userPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any>;
    contentType: string,
    userInput: string,
    context?: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<any>;
    componentType: string,
    currentData?: Record<string, any>,
    userProfile?: Record<string, any>,
    options?: any,
  ): Promise<any>;
}

declare module "@/modules/ai" {
    prompt: string,
    systemInstructions?: string,
    options?: any,
  ): Promise<any>;
    contentType?: string;
    userInput?: string;
    context?: Record<string, any>;
    options?: Record<string, any>;
    systemPrompt?: string;
    userPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any>;
    contentType: string,
    userInput: string,
    context?: Record<string, any>,
    options?: Record<string, any>,
  ): Promise<any>;
    componentType: string,
    currentData?: Record<string, any>,
    userProfile?: Record<string, any>,
    options?: any,
  ): Promise<any>;
  const aiClient: any;
  export default aiClient;
}

declare module "./jobService.js" {
    jobs: any[];
    totalResults?: number;
    sources?: string[];
    errors?: Array<{ source: string; error: string } | string>;
    fetchedAt?: string;
  }>;

    id: string;
    name: string;
    description?: string;
    enabled?: boolean;
    apiKeyRequired?: boolean;
    regions?: string[];
    categories?: string[];
    rateLimit?: string;
    icon?: string;
    color?: string;
    status?: string;
    apiKey?: string | "Not required";
  }>;

    success: boolean;
    jobCount?: number;
    message?: string;
    metadata?: any;
    error?: string;
  }>;

}

declare module "@/services/jobService.js" {
}

declare module "@/services/jobService" {
}
