// Canonical UI module entrypoint
// Centralizes global styles and re-exports shared UI components

// Master unified theme - replaced all conflicting style imports
// Individual utility CSS files are now consolidated into master-theme.css
// This prevents CSS variable conflicts and improves performance

// Core UI Components - Single source of truth
export { default as FormField } from "@/components/FormField.vue";
export { default as LoadingIndicator } from "@/components/LoadingIndicator.vue";
export { default as LoadingSkeletons } from "@/components/LoadingSkeletons.vue";
export { default as ToastNotification } from "@/components/ToastNotification.vue";
export { default as AppTooltip } from "@/components/Tooltip.vue";
export { default as ErrorBoundary } from "@/components/ErrorBoundary.vue";

// Layout Components
export { default as Header } from "@/components/Header.vue";
export { default as AppHeader } from "@/components/Header.vue"; // Alias for consistency
export { default as SystemHeader } from "@/components/SystemHeader.vue";
export { default as GlassNavTabs } from "@/components/GlassNavTabs.vue";
export { default as StepNav } from "@/components/StepNav.vue";
export { default as StepTabs } from "@/components/StepTabs.vue";

// Interactive Components
export { default as SearchInput } from "@/components/SearchInput.vue";
export { default as ModelSelector } from "@/components/ModelSelector.vue";
export { default as CompletionProgressBar } from "@/components/CompletionProgressBar.vue";
export { default as DashboardModuleCard } from "@/components/DashboardModuleCard.vue";

// Audio/Video Components
export { default as AudioControls } from "@/components/AudioControls.vue";
export { default as AudioDeviceSelector } from "@/components/AudioDeviceSelector.vue";
export { default as VideoControls } from "@/components/VideoControls.vue";
export { default as PushToTalkButton } from "@/components/PushToTalkButton.vue";

// Chat Components
export { default as AIFairyAssistant } from "@/components/AIFairyAssistant.vue";
export { default as RealTimeChat } from "@/components/RealTimeChat.vue";
export { default as AIActionButton } from "@/components/AIActionButton.vue";
export { default as ActionButtonGroup } from "@/components/ActionButtonGroup.vue";

// Modal Components
export { default as SystemSetupModal } from "@/components/SystemSetupModal.vue";

// Feature-specific Components
export { default as GamificationDashboard } from "@/components/GamificationDashboard.vue";
export { default as AttributionFooter } from "@/components/AttributionFooter.vue";
export { default as BackgroundImportManager } from "@/components/BackgroundImportManager.vue";

// Sub-module exports (only export what exists)
export * from "./components.js";
