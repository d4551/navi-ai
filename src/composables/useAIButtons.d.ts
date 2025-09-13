
export interface AIButtonConfig {
  action: string;
  icon?: string;
  text?: string;
  tooltip?: string;
  variant?: string;
  size?: string;
  position?: string;
  context?: () => Record<string, any>;
}

export interface LoadingStates {
  generate: boolean;
  analyze: boolean;
  enhance: boolean;
  optimize: boolean;
  research: boolean;
  extract: boolean;
  review: boolean;
  interview: boolean;
  custom: boolean;
}

export interface ButtonStates {
  hasAPIKey: boolean;
  aiInitialized: boolean;
  aiInitializing: boolean;
  loadingStates: LoadingStates;
}

export interface QuickActions {
  generateResumeContent: (context?: any) => Promise<any>;
  analyzeCoverLetter: (context?: any) => Promise<any>;
  searchJobs: (context?: any) => Promise<any>;
  mapSkills: (context?: any) => Promise<any>;
  startInterview: (context?: any) => Promise<any>;
}

export interface AIButtonsComposable {
  // State
  loadingStates: ComputedRef<LoadingStates>;
  buttonStates: ComputedRef<ButtonStates>;

  // Page configurations
  getButtonsForPage: (page: string) => AIButtonConfig[];
  getButtonsByPosition: (page: string, position: string) => AIButtonConfig[];

  // Actions
    actionConfig: AIButtonConfig,
    customContext?: any,
  ) => Promise<any>;
  quickActions: QuickActions;
  ensureAIReady: () => Promise<boolean>;

  // Utilities
  createButtonProps: (config: AIButtonConfig, additionalContext?: any) => any;
  addAIButtonToSection: (sectionRef: any, buttonConfig: AIButtonConfig) => any;
}


export { useAIButtons };
export default useAIButtons;
