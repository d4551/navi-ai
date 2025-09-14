// MUI-inspired Vue Components Registry
// Centralized exports for all MUI-style components with Electrolize font integration

import UnifiedButton from "./UnifiedButton.vue";
// UnifiedCard was re-homed to StandardCard; keep API stable by aliasing
import StandardCard from "./StandardCard.vue";
import PageHeader from "./PageHeader.vue";
import MuiTextField from "./MuiTextField.vue";

export { default as UnifiedButton } from "./UnifiedButton.vue";
export { default as UnifiedCard } from "./StandardCard.vue";
export { default as Card } from "./StandardCard.vue";
export { default as PageHeader } from "./PageHeader.vue";
export { default as MuiTextField } from "./MuiTextField.vue";
export { default as MuiLoadingIndicator } from "./MuiLoadingIndicator.vue";
export { default as AppIcon } from "./AppIcon.vue";
export { default as ModernButton } from "./ModernButton.vue";
export { default as IconButton } from "./IconButton.vue";
export { default as EmptyState } from "./EmptyState.vue";

// Import existing components for unified export
export { default as LoadingIndicator } from "../LoadingIndicator.vue";
export { default as AppTooltip } from "../Tooltip.vue";

// Component composition utilities
export const createMuiComponent = <T extends Record<string, any>>(
  component: any,
  defaultProps: T,
) => {
  return {
    component,
    props: defaultProps,
    with: (overrides: Partial<T>) => ({
      component,
      props: { ...defaultProps, ...overrides },
    }),
  };
};

// Pre-configured component variants
export const MuiComponents = {
  PrimaryButton: createMuiComponent(UnifiedButton, {
    variant: "primary",
    appearance: "contained",
    size: "md",
  }),

  SecondaryButton: createMuiComponent(UnifiedButton, {
    variant: "primary",
    appearance: "outlined",
    size: "md",
  }),

  TextButton: createMuiComponent(UnifiedButton, {
    variant: "primary",
    appearance: "text",
    size: "md",
  }),

  ElevatedCard: createMuiComponent(StandardCard, {
    variant: "elevated",
    elevation: "medium",
    size: "md",
  }),

  OutlinedCard: createMuiComponent(StandardCard, {
    variant: "default",
    elevation: "none",
    size: "md",
  }),

  GlassCard: createMuiComponent(StandardCard, {
    variant: "glass",
    elevation: "low",
    size: "md",
  }),

  // Page Headers
  DashboardHeader: createMuiComponent(PageHeader, {
    variant: "dashboard",
    size: "lg",
    showShimmer: true,
  }),

  GamingHeader: createMuiComponent(PageHeader, {
    variant: "gaming",
    size: "xl",
    showParticles: true,
  }),

  SettingsHeader: createMuiComponent(PageHeader, {
    variant: "settings",
    size: "md",
    stacked: false,
  }),

  StandardTextField: createMuiComponent(MuiTextField, {
    variant: "outlined",
    size: "medium",
  }),
};

// Loading state management for components
export interface LoadingState {
  loading: boolean;
  error: string | null;
  data: any;
}

export const createLoadingState = (initial: any = null): LoadingState => ({
  loading: false,
  error: null,
  data: initial,
});

export const withLoadingState = <T>(
  asyncFn: () => Promise<T>,
  state: LoadingState,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void,
) => {
  state.loading = true;
  state.error = null;

  return asyncFn()
    .then((_data) => {
      state.data = data;
      state.loading = false;
      onSuccess?.(_data);
      return data;
    })
    .catch((_error) => {
      state.error = error.message || "An error occurred";
      state.loading = false;
      onError?.(_error);
      throw error;
    });
};

// Component integration helpers
export const integrateWithServices = (serviceRegistry: any) => ({
  useService: (serviceName: string) => {
    const service = serviceRegistry.getService(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  },

  createServiceBoundComponent: (
    componentName: string,
    serviceName: string,
  ) => ({
    component: componentName,
    service: serviceName,
    integrate: (props: any) => ({
      ...props,
      service: serviceRegistry.getService(serviceName),
    }),
  }),
});

// Export types for TypeScript support
export type MuiComponentVariant = "contained" | "outlined" | "text" | "ghost";
export type MuiComponentSize = "small" | "medium" | "large";
export type MuiComponentColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
