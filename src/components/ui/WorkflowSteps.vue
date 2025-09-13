<template>
  <div class="workflow-steps section-card">
    <div class="steps-container" :class="{ mobile: isMobile }">
      <div
        v-for="step in steps"
        :key="step.id"
        class="step-item"
        :class="{
          active: currentStep === step.id,
          completed: step.id < currentStep,
          available: step.id <= maxAvailableStep,
          disabled: step.id > maxAvailableStep,
        }"
        @click="handleStepClick(step)"
      >
        <div class="step-indicator">
          <AppIcon v-if="step.id < currentStep" name="mdi-check" size="16" />
          <AppIcon v-else-if="step.icon" :name="step.icon" size="16" />
          <span v-else>{{ step.id }}</span>
        </div>

        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div v-if="step.description" class="step-description">
            {{ step.description }}
          </div>
          <div
            v-if="showProgress && step.progress !== undefined"
            class="step-progress"
          >
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: step.progress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ step.progress }}%</span>
          </div>
        </div>

        <div v-if="step.id === currentStep && allowEdit" class="step-actions">
          <UnifiedButton
            variant="ghost"
            size="xs"
            icon="mdi-pencil-outline"
            @click.stop="$emit('edit-step', step)"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Progress Bar -->
    <div v-if="showProgressBar" class="mobile-progress-bar">
      <div class="progress-track">
        <div
          class="progress-indicator"
          :style="{
            width: ((currentStep - 1) / (steps.length - 1)) * 100 + '%',
          }"
        ></div>
      </div>
      <div class="progress-label">
        Step {{ currentStep }} of {{ steps.length }}: {{ currentStepTitle }}
      </div>
    </div>

    <!-- Navigation Controls -->
    <div v-if="showNavigation" class="workflow-navigation">
      <div class="nav-content">
        <div class="nav-info">
          <div class="current-step">{{ currentStepTitle }}</div>
          <div v-if="showStepCounter" class="step-counter">
            {{ currentStep }} / {{ steps.length }}
          </div>
        </div>

        <div class="nav-actions">
          <UnifiedButton
            variant="ghost"
            leading-icon="mdi-chevron-left"
            :disabled="!canGoBack"
            @click="$emit('previous-step')"
          >
            Previous
          </UnifiedButton>

          <UnifiedButton
            v-if="currentStep < steps.length"
            variant="primary"
            trailing-icon="mdi-chevron-right"
            :disabled="!canProceed"
            @click="$emit('next-step')"
          >
            Next: {{ nextStepTitle }}
          </UnifiedButton>

          <UnifiedButton
            v-else
            variant="success"
            leading-icon="mdi-check-circle-outline"
            :disabled="!canProceed"
            @click="$emit('complete')"
          >
            {{ completeLabel }}
          </UnifiedButton>
        </div>
      </div>

      <!-- Validation Message -->
      <div v-if="!canProceed && validationMessage" class="validation-hint">
        <AppIcon name="mdi-information-outline" size="16" />
        <span>{{ validationMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import { computed } from "vue";
import UnifiedButton from "./UnifiedButton.vue";
import AppIcon from "./AppIcon.vue";

const _props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  canProceed: {
    type: Boolean,
    default: true,
  },
  maxAvailableStep: {
    type: Number,
    default: null,
  },
  showProgress: {
    type: Boolean,
    default: false,
  },
  showProgressBar: {
    type: Boolean,
    default: false,
  },
  showNavigation: {
    type: Boolean,
    default: true,
  },
  showStepCounter: {
    type: Boolean,
    default: false,
  },
  allowEdit: {
    type: Boolean,
    default: false,
  },
  allowStepJump: {
    type: Boolean,
    default: true,
  },
  completeLabel: {
    type: String,
    default: "Complete",
  },
  validationMessage: {
    type: String,
    default: "",
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const _emit = defineEmits([
  "step-change",
  "next-step",
  "previous-step",
  "complete",
  "edit-step",
]);

const maxStep = computed(() => {
  return props.maxAvailableStep !== null
    ? props.maxAvailableStep
    : Math.max(1, props.currentStep);
});

const canGoBack = computed(() => props.currentStep > 1);

const currentStepTitle = computed(() => {
  const step = props.steps.find((s) => s.id === props.currentStep);
  return step?.title || `Step ${props.currentStep}`;
});

const nextStepTitle = computed(() => {
  const nextStep = props.steps.find((s) => s.id === props.currentStep + 1);
  return nextStep?.title || "Next";
});

const handleStepClick = (step) => {
  if (!props.allowStepJump) return;
  if (step.id > maxStep.value) return;
  if (step.id === props.currentStep) return;

  emit("step-change", step.id);
};
</script>

<style scoped>
.workflow-steps {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.steps-container {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-3);
  overflow-x: auto;
  padding: var(--spacing-2) 0;
}

.steps-container.mobile {
  flex-direction: column;
  gap: var(--spacing-2);
}

.step-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
  min-width: 180px;
  flex-shrink: 0;
}

.steps-container.mobile .step-item {
  min-width: auto;
}

.step-item:hover:not(.disabled) {
  background: var(--glass-hover-bg);
}

.step-item.active {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
}

.step-item.completed {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.step-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glass-surface);
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: all var(--duration-fast);
}

.step-item.active .step-indicator {
  background: var(--text-on-primary);
  color: var(--color-primary-500);
}

.step-item.completed .step-indicator {
  background: var(--color-success-500);
  color: white;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.step-description {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.3;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-1);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(var(--text-on-primary, 255, 255, 255), 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.step-item.active .progress-bar {
  background: rgba(var(--color-primary-500), 0.3);
}

.progress-fill {
  height: 100%;
  background: currentColor;
  transition: width var(--duration-normal);
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

.step-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.mobile-progress-bar {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--glass-border);
}

.progress-track {
  height: 8px;
  background: var(--surface-container);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-2);
}

.progress-indicator {
  height: 100%;
  background: var(--color-primary-500);
  transition: width var(--duration-normal);
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.workflow-navigation {
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--glass-border);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.nav-info {
  flex: 1;
  min-width: 0;
}

.current-step {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.step-counter {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.validation-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

  .steps-container:not(.mobile) {
    flex-direction: column;
  }

  .steps-container:not(.mobile) .step-item {
    min-width: auto;
  }

  .nav-content {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-actions {
    justify-content: space-between;
  }
}

[data-theme="dark"] .step-item.completed {
}

[data-theme="dark"] .validation-hint {
}
</style>
