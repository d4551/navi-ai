declare module "@/composables/useStepNavigation" {
  interface StepDef {
    key?: string;
    label: string;
    shortLabel?: string;
  }
  interface StepNavigation {
    steps: StepDef[];
    currentStep: import("vue").Ref<number>;
    progress: import("vue").ComputedRef<number>;
    goToStep: (idx: number) => void;
    isStepComplete: (idx: number) => boolean;
  }
  export function useStepNavigation(
    steps: StepDef[],
    isCompleteFn: (index: number) => boolean,
    anchorSelectors?: string[],
  ): StepNavigation;
}
