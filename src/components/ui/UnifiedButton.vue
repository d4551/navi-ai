<template>
  <component
    :is="resolvedTag"
    ref="buttonRef"
    :class="buttonClasses"
    :data-variant="props.color || props.variant"
    :data-size="resolvedSize"
    :data-icon-only="props.iconOnly ? 'true' : 'false'"
    :to="props.to || undefined"
    :href="props.href || undefined"
    :disabled="
      disabled || loading || isProcessing || (requiresAuth && !hasAPIKey)
    "
    :type="resolvedType"
    :aria-label="ariaLabel || resolvedLabel"
    :aria-describedby="ariaDescribedby || undefined"
    :aria-disabled="disabled || loading"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- Loading Spinner -->
    <div
      v-if="loading || isProcessing"
      class="spinner-gaming me-2"
      role="status"
      aria-hidden="true"
    ></div>

    <!-- AI Status Icons -->
    <div v-if="showSuccessState" class="ai-success-icon me-2">
      <AppIcon name="mdi-check" />
    </div>
    <div v-if="showErrorState" class="ai-error-icon me-2">
      <AppIcon name="mdi-alert-circle" style="color: var(--color-error-500)" />
    </div>

    <!-- Leading Icon -->
    <AppIcon
      v-if="resolvedLeadingIcon && !loading"
      :name="resolvedLeadingIcon"
      class="me-2"
    />

    <!-- Button Content -->
    <span v-if="!iconOnly" class="button-content">
      <slot>
        <span v-if="isProcessing && loadingText">{{ loadingText }}</span>
        <span v-else-if="showSuccessState && successText">{{
          successText
        }}</span>
        <span v-else-if="showErrorState && errorText">{{ errorText }}</span>
        <span v-else>{{ resolvedLabel }}</span>
      </slot>
    </span>

    <!-- Trailing Icon -->
    <AppIcon
      v-if="resolvedTrailingIcon && !iconOnly"
      :name="resolvedTrailingIcon"
      class="ms-2"
    />

    <!-- Icon Only -->
    <AppIcon v-if="iconOnly && icon" :name="icon" />

    <!-- Badge -->
    <span v-if="badge" class="button-badge badge-unified bg-warning">{{
      badge
    }}</span>

    <!-- Tooltip -->
    <div
      v-if="tooltip && showTooltip"
      class="btn-tooltip"
      :class="tooltipPosition"
    >
      {{ tooltip }}
    </div>

    <!-- Progress Bar -->
    <div v-if="showProgress && isProcessing" class="btn-progress-bar">
      <div class="btn-progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Ripple Effect Container -->
    <div v-if="ripple" ref="rippleContainer" class="ripple-container" />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useToast } from "@/composables/useToast";
import { aiService } from "@/shared/services/AIService";
import AppIcon from "@/components/ui/AppIcon.vue";

interface Props {
  // Basic Props
  label?: string;
  text?: string;
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "gaming"
    | "cyber"
    | "glass"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "ghost"
    | "outline";
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "gaming"
    | "cyber"
    | "glass"
    | "ghost"
    | "outline";
  appearance?: "contained" | "outlined" | "text" | "ghost";
  size?:
    | "chip"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "small"
    | "medium"
    | "large";

  // Navigation Props
  to?: string;
  href?: string;

  // State Props
  loading?: boolean;
  disabled?: boolean;

  // AI-specific Props (merged from AIButton/EnhancedAIButton)
  action?: string;
  context?: object;
  requiresAuth?: boolean;
  customHandler?: Function;
  showProgress?: boolean;
  showAIStatus?: boolean;
  autoHideSuccess?: boolean;
  autoHideError?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";

  // Icon Props
  icon?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  startIcon?: string;
  endIcon?: string;
  iconOnly?: boolean;

  // Behavior Props
  type?: "button" | "submit" | "reset";
  ripple?: boolean;
  fullWidth?: boolean;
  responsive?: boolean;

  // Accessibility Props
  ariaLabel?: string;
  ariaDescribedby?: string;

  // Additional Props
  badge?: string | number;
  // Removed elevation as it will be handled by design system shadows
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  appearance: "contained",
  size: "md",
  type: "button",
  ripple: true,
  requiresAuth: false,
  showProgress: false,
  showAIStatus: false,
  autoHideSuccess: true,
  autoHideError: true,
  responsive: true,
  tooltipPosition: "top",
  fullWidth: false,
  label: "",
  text: "",
  color: "primary",
  to: "",
  href: "",
  icon: "",
  leadingIcon: "",
  trailingIcon: "",
  startIcon: "",
  endIcon: "",
  ariaLabel: "",
  ariaDescribedby: "",
  badge: "",
});

const emit = defineEmits<{
  click: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  success: [response: any];
  error: [error: string];
  start: [];
  complete: [];
}>();

const buttonRef = ref<HTMLElement | null>(null); // Changed to HTMLElement
const rippleContainer = ref<HTMLElement | null>(null);

// AI and State management
const store = useAppStore();
const toast = useToast();
const showTooltip = ref(false);
const showSuccessState = ref(false);
const showErrorState = ref(false);
const isProcessing = ref(false);
const progress = ref(0);
const lastError = ref("");
const processingInterval = ref<number | null>(null);

// Authentication status
const isAuthenticated = ref(false);
const hasAPIKey = computed(() => {
  return !!(store.settings?.geminiApiKey || store.settings?.openaiApiKey);
});

// Resolve props from legacy MUI component
const resolvedLabel = computed(() => props.label ?? props.text ?? "");
const resolvedLeadingIcon = computed(
  () => props.leadingIcon || props.startIcon,
);
const resolvedTrailingIcon = computed(
  () => props.trailingIcon || props.endIcon,
);
const resolvedSize = computed(() => {
  switch (props.size) {
    case "chip":
      return "chip";
    case "small":
      return "sm";
    case "medium":
      return "md";
    case "large":
      return "lg";
    default:
      return props.size;
  }
});

// Determine the root HTML tag based on props
const resolvedTag = computed(() => {
  if (props.to) return "router-link";
  if (props.href) return "a";
  return "button";
});

// Only supply a native `type` when rendering a <button>
const resolvedType = computed(() => {
  return resolvedTag.value === "button" ? props.type || "button" : undefined;
});

// Compute button classes
const buttonClasses = computed(() => {
  const classes = [
    "btn-unified",
    "btn",
    "unified-button",
    "interactive-element",
  ];

  // Color/variant classes - now handle all custom variants
  const color = props.color || props.variant;
  switch (color) {
    case "primary":
      classes.push("btn-primary");
      break;
    case "gaming":
      classes.push("btn-gaming", "gaming-button");
      break;
    case "cyber":
      classes.push("btn-cyber");
      break;
    case "glass":
      classes.push("btn-glass");
      break;
    case "success":
      classes.push("btn-success");
      break;
    case "warning":
      classes.push("btn-warning");
      break;
    case "danger":
      classes.push("btn-danger");
      break;
    case "info":
      classes.push("btn-cyber");
      break;
    case "ghost":
      classes.push("btn-ghost");
      break;
    case "outline":
      classes.push("btn-outline");
      break;
    default:
      classes.push("btn-secondary");
  }

  // Appearance classes
  switch (props.appearance) {
    case "outlined":
      classes.push("btn-outline");
      break;
    case "text":
      classes.push("btn-text");
      break;
    case "ghost":
      classes.push("btn-ghost");
      break;
  }

  // Size classes
  classes.push(`btn-${resolvedSize.value}`);

  // State classes
  if (props.loading || isProcessing.value) classes.push("btn-loading");
  if (props.disabled) classes.push("btn-disabled");
  if (props.iconOnly) classes.push("btn-icon-only");
  if (props.fullWidth) classes.push("w-full"); // Use w-full from design system
  if (props.ripple) classes.push("ripple-enabled");
  if (showSuccessState.value) classes.push("btn-success-state");
  if (showErrorState.value) classes.push("btn-error-state");
  if (props.requiresAuth && !hasAPIKey.value) classes.push("btn-no-api-key");
  if (props.responsive) classes.push("btn-responsive");

  return classes;
});

// Enhanced Event Handlers with AI support
const handleClick = async (event: Event) => {
  if (props.disabled || props.loading || isProcessing.value) {
    event.preventDefault();
    return;
  }

  // Create ripple effect
  if (props.ripple && rippleContainer.value) {
    createRipple(event as MouseEvent);
  }

  emit("click", event);

  // Handle AI actions if specified
  if (props.action || props.customHandler) {
    await handleAIAction();
  }
};

// AI Action Handler
const handleAIAction = async () => {
  if (props.requiresAuth && !hasAPIKey.value) {
    toast.warning(
      "AI features require an API key. Please configure in Settings.",
    );
    return;
  }

  try {
    emit("start");
    isProcessing.value = true;
    showErrorState.value = false;
    showSuccessState.value = false;

    if (props.showProgress) {
      startProgressTracking();
    }

    let result;
    if (props.customHandler) {
      result = await props.customHandler(props.context);
    } else if (props.action) {
      // Use AI service for predefined actions
      result = await executeAIAction(props.action, props.context);
    }

    showSuccessState.value = true;
    emit("success", result);

    if (props.autoHideSuccess) {
      setTimeout(() => {
        showSuccessState.value = false;
      }, 2000);
    }
  } catch (error) {
    console.error("AI action failed:", error);
    lastError.value = error.message || "Unknown error";
    showErrorState.value = true;
    emit("error", error);

    if (props.autoHideError) {
      setTimeout(() => {
        showErrorState.value = false;
      }, 3000);
    }
  } finally {
    isProcessing.value = false;
    emit("complete");
    stopProgressTracking();
  }
};

// AI Service Integration
const executeAIAction = async (action: string, context: any) => {
  if (!aiService) {
    throw new Error("AI service not available");
  }

  // Map action to AI service method
  switch (action) {
    case "analyze_resume":
      return await aiService.analyzeResume(
        context.resumeContent || "",
        context.jobDescription,
      );
    case "generate_cover_letter":
      return await aiService.generateCoverLetter(
        context.resumeContent || "",
        context.jobDescription || "",
        context.companyInfo || "",
      );
    case "chat":
    default:
      return await aiService.chat({
        message: context.message || "",
        context: context.context || "",
        type: context.type || "chat",
      });
  }
};

// Progress tracking
const startProgressTracking = () => {
  if (processingInterval.value) return;

  processingInterval.value = window.setInterval(() => {
    if (progress.value < 95) {
      progress.value += 5;
    }
  }, 500);
};

const stopProgressTracking = () => {
  if (processingInterval.value) {
    window.clearInterval(processingInterval.value);
    processingInterval.value = null;
  }
  progress.value = 100;
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

// Ripple Effect
const createRipple = (event: MouseEvent) => {
  if (!rippleContainer.value || !buttonRef.value) return;

  // Correctly access the underlying DOM element from the component ref
  const button = buttonRef.value;
  if (!button || typeof button.getBoundingClientRect !== "function") return;

  // Clear any existing ripples to prevent accumulation
  const existingWaves = rippleContainer.value.querySelectorAll(".ripple-wave");
  existingWaves.forEach((wave) => wave.remove());

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.className = "ripple-wave";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  // Add is-rippling class to button
  button.classList.add("is-rippling");

  rippleContainer.value.appendChild(ripple);

  // Remove ripple after animation completes
  ripple.addEventListener("animationend", () => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
    button.classList.remove("is-rippling");
    // Force layout recalculation to ensure size is properly reset
    button.offsetHeight;
  });

  // Fallback timeout in case animationend doesn't fire
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
    button.classList.remove("is-rippling");
  }, 650);
};



// Lifecycle hooks
onMounted(async () => {
  if (hasAPIKey.value && aiService) {
    isAuthenticated.value = await aiService.isReady();
  }
});

// Cleanup on unmount
const cleanup = () => {
  stopProgressTracking();
  showTooltip.value = false;
  showSuccessState.value = false;
  showErrorState.value = false;
  isProcessing.value = false;
};

// Expose button ref and methods for parent components
defineExpose({
  buttonRef,
  focus: () => buttonRef.value?.focus(),
  blur: () => buttonRef.value?.blur(),
  executeAction: handleAIAction,
  reset: () => {
    showSuccessState.value = false;
    showErrorState.value = false;
    isProcessing.value = false;
    lastError.value = "";
    stopProgressTracking();
  },
  isProcessing: computed(() => isProcessing.value),
  isReady: computed(
    () => !props.disabled && !props.loading && !isProcessing.value,
  ),
});
</script>

<style scoped>
.btn-unified {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  border: 1px solid var(--glass-border); /* Use design system variable */
  cursor: pointer;
  user-select: none;
  transition: all var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
  outline: none;
  white-space: nowrap;
  vertical-align: middle;
  line-height: 1;
  min-height: 44px; /* WCAG 2.2 compliance */
  min-width: 44px; /* WCAG 2.2 compliance */
  backdrop-filter: var(--glass-backdrop-filter); /* Use master theme variable */
  -webkit-backdrop-filter: var(
    --glass-backdrop-filter
  ); /* Use master theme variable */
  background-color: var(--glass-bg); /* Use master theme glass background */
  color: var(--text-primary); /* Use design system variable */
  border-radius: var(--radius-md); /* Use design system variable */
  box-shadow: var(--glass-shadow); /* Use master theme glass shadow */
}

.btn-unified:hover:not(:disabled) {
  box-shadow: var(--glass-shadow); /* Use master theme glass shadow */
  background: var(--glass-hover-bg); /* Use master theme variable */
  transform: translateY(-1px);
}

.btn-unified:active:not(:disabled) {
  box-shadow: var(--glass-shadow); /* Use master theme glass shadow */
  transform: translateY(0);
  background: var(--glass-hover-bg); /* Use master theme variable */
}

.btn-unified:focus-visible {
  outline: 3px solid var(--color-primary-400); /* Use design system variable */
  outline-offset: 2px;
  box-shadow:
    var(--shadow-md),
    0 0 0 3px var(--color-primary-200); /* Enhanced focus shadow */
}

.btn-xs {
}

.btn-sm {
}

.btn-md {
}

.btn-lg {
}

.btn-xl {
}

.btn-chip {
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-only.btn-xs {
}

.btn-icon-only.btn-sm {
}

.btn-icon-only.btn-lg {
}

.btn-icon-only.btn-xl {
}

.btn-primary,
.btn-unified[data-variant="primary"] {
  background: linear-gradient(
  ) !important;
  color: var(--text-on-primary) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-primary:hover:not(:disabled),
.btn-unified[data-variant="primary"]:hover:not(:disabled) {
  background: linear-gradient(
  ) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-primary:active:not(:disabled),
.btn-unified[data-variant="primary"]:active:not(:disabled) {
  background: linear-gradient(
  ) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-gaming {
  box-shadow: var(--shadow-sm);
}

.btn-gaming:hover:not(:disabled) {
  border-color: var(--glass-border-gaming);
}

.btn-cyber {
  box-shadow: var(--shadow-sm);
}

.btn-cyber:hover:not(:disabled) {
  border-color: var(--glass-border-cyber);
}

.btn-glass,
.btn-unified[data-variant="glass"] {
  background: var(--glass-bg) !important;
  color: var(--text-primary) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: var(--glass-shadow) !important;
}

.btn-glass:hover:not(:disabled),
.btn-unified[data-variant="glass"]:hover:not(:disabled) {
  background: var(--glass-hover-bg) !important;
  border-color: rgba(
  ) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-glass:active:not(:disabled),
.btn-unified[data-variant="glass"]:active:not(:disabled) {
  background: var(--glass-hover-bg) !important;
  box-shadow: var(--glass-shadow) !important;
}

.btn-unified[data-variant="glass"] .button-content {
}

.btn-success,
.btn-unified[data-variant="success"] {
  background: linear-gradient(
  ) !important;
  color: var(--text-on-primary) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-warning,
.btn-unified[data-variant="warning"] {
  background: linear-gradient(
  ) !important;
  color: var(--text-on-primary) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-danger,
.btn-unified[data-variant="danger"] {
  background: linear-gradient(
  ) !important;
  color: var(--text-on-primary) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
}

.btn-ghost,
.btn-unified[data-variant="ghost"] {
  background: transparent !important;
  color: var(--text-primary) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.btn-ghost:hover:not(:disabled),
.btn-unified[data-variant="ghost"]:hover:not(:disabled) {
  background: var(--glass-bg) !important;
  border-color: var(--glass-border) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: var(--glass-shadow) !important;
}

.btn-outline {
  background: transparent;
  box-shadow: none;
}

.btn-outline:hover:not(:disabled) {
  box-shadow: var(--shadow-xs);
}

.btn-loading {
  cursor: wait;
}

.btn-disabled,
.btn-unified:disabled {
  cursor: not-allowed;
  transform: none !important;
  border-color: var(--border-base);
  box-shadow: none;
}

.btn-unified:focus-visible {
  box-shadow:
    var(--shadow-md),
}

.button-badge {
  position: absolute;
  text-align: center;
  color: var(--text-on-primary);
}

.ripple-container {
  position: absolute;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}

.btn-loading .button-content {
}

.w-full {
}

.btn-unified:active:not(:disabled) {
}

  .btn-lg,
  .btn-xl {
  }
}

.btn-success-state {
  background: var(
  box-shadow: var(--shadow-glow-success);
}

.btn-error-state {
  background: var(
  box-shadow: var(--shadow-glow-error);
}

.btn-no-api-key {
  background: var(
  box-shadow: var(--shadow-glow-warning);
}

.btn-no-api-key::after {
}

.btn-progress-bar {
  position: absolute;
  overflow: hidden;
}

.btn-progress-fill {
}

.btn-tooltip {
  position: absolute;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: var(
    --glass-backdrop-blur-light
}

.btn-tooltip.top {
}

.btn-tooltip.bottom {
}

.btn-tooltip.left {
}

.btn-tooltip.right {
}

.ai-success-icon,
.ai-error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from {
  }
  to {
  }
}

.btn-loading::after {
  content: "";
  position: absolute;
  border-radius: inherit;
  background: linear-gradient(
    transparent,
    transparent
  animation: pulse-border var(--duration-slow) var(--easing-ease-in-out)
  pointer-events: none;
}

@keyframes pulse-border {
  }
  }
}

.btn-responsive {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
}

  .btn-responsive:not(.btn-icon-only) .button-content {
    display: none;
  }

  .btn-responsive {
  }

  .btn-responsive i {
  }
}

[data-theme="dark"] .btn-tooltip {
}

[data-theme="dark"] .btn-unified {
}

@media (prefers-contrast: high) {
  .btn-unified {
  }

  .btn-glass {
    border-color: currentColor;
  }

  .btn-tooltip {
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-unified,
  .btn-unified:hover,
  .btn-unified:active {
    transition: none;
    transform: none;
  }

  .btn-loading::after {
    animation: none;
  }

  .ai-success-icon,
  .ai-error-icon {
    animation: none;
  }
}
</style>
