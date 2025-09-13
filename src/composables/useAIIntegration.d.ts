/* eslint-disable @typescript-eslint/no-explicit-any */
// Type declarations for the JS composable at the same path

export type AIIntegration = {
  isAIInitialized: any;
  aiInitializing: any;
  aiError: any;
  aiCapabilities: any;
  aiFeatures: any;
  hasAIKey: any;
  currentPageAIFeatures: any;
  aiStatusMessage: any;
  aiStatusVariant: any;
  initializeAI: (...args: any[]) => Promise<boolean> | boolean;
  updateAIFeatureAvailability: () => void;
  triggerAIAction: (...args: any[]) => Promise<any>;
  navigateToAIFeature: (featureName: string) => void;
  getAIFeatureStatus: (featureName: string) => { enabled: boolean; active: boolean };
  showAISetupModal: () => void;
};

export default function useAIIntegration(...args: any[]): AIIntegration;
export function createAIIntegrationPlugin(...args: any[]): any;

