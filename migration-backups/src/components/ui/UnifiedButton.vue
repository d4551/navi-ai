<template>
  <component
    :is="resolvedTag"
    ref="buttonRef"
    :class="buttonClasses"
    :data-variant="props?.color || props?.variant || 'primary'"
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
      class="spinner-gaming me-2 animate-spin text-current opacity-70 dark:opacity-80"
      role="status"
      aria-hidden="true"
    ></div>

    <!-- AI Status Icons -->
    <div
      v-if="showSuccessState"
      class="ai-success-icon me-2 text-green-600 dark:text-green-400"
    >
      <AppIcon name="mdi-check" />
    </div>
    <div
      v-if="showErrorState"
      class="ai-error-icon me-2 text-red-600 dark:text-red-400"
    >
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
    <span
      v-if="badge"
      class="button-badge badge-unified bg-warning bg-red-500 dark:bg-red-400 text-white dark:text-gray-900"
      >{{ badge }}</span
    >

    <!-- Tooltip -->
    <div
      v-if="tooltip && showTooltip"
      class="btn-tooltip bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 border border-gray-700/50 dark:border-gray-300/50"
      :class="tooltipPosition"
    >
      {{ tooltip }}
    </div>

    <!-- Progress Bar -->
    <div
      v-if="showProgress && isProcessing"
      class="btn-progress-bar bg-gray-200 dark:bg-gray-700"
    >
      <div
        class="btn-progress-fill bg-blue-500 dark:bg-blue-400"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <!-- Ripple Effect Container -->
    <div
      v-if="ripple"
      ref="rippleContainer"
      class="ripple-container overflow-hidden"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import { aiService } from '@/shared/services/AIService'
import AppIcon from '@/components/ui/AppIcon.vue'
import { logger } from '@/shared/utils/logger'

interface Props {
  // Basic Props
  label?: string
  text?: string
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'gaming'
    | 'cyber'
    | 'glass'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'ghost'
    | 'outline'
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'gaming'
    | 'cyber'
    | 'glass'
    | 'ghost'
    | 'outline'
  appearance?: 'contained' | 'outlined' | 'text' | 'ghost'
  size?:
    | 'chip'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'small'
    | 'medium'
    | 'large'

  // Navigation Props
  to?: string
  href?: string

  // State Props
  loading?: boolean
  disabled?: boolean

  // AI-specific Props (merged from AIButton/EnhancedAIButton)
  action?: string
  context?: object
  requiresAuth?: boolean
  customHandler?: Function
  showProgress?: boolean
  showAIStatus?: boolean
  autoHideSuccess?: boolean
  autoHideError?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'

  // Icon Props
  icon?: string
  leadingIcon?: string
  trailingIcon?: string
  startIcon?: string
  endIcon?: string
  iconOnly?: boolean

  // Behavior Props
  type?: 'button' | 'submit' | 'reset'
  ripple?: boolean
  fullWidth?: boolean
  responsive?: boolean

  // Accessibility Props
  ariaLabel?: string
  ariaDescribedby?: string

  // Additional Props
  badge?: string | number
  // Removed elevation as it will be handled by design system shadows
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  appearance: 'contained',
  size: 'md',
  type: 'button',
  ripple: true,
  requiresAuth: false,
  showProgress: false,
  showAIStatus: false,
  autoHideSuccess: true,
  autoHideError: true,
  responsive: true,
  tooltipPosition: 'top',
  fullWidth: false,
  label: '',
  text: '',
  color: 'primary',
  to: '',
  href: '',
  icon: '',
  leadingIcon: '',
  trailingIcon: '',
  startIcon: '',
  endIcon: '',
  ariaLabel: '',
  ariaDescribedby: '',
  badge: '',
})

const emit = defineEmits<{
  click: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  success: [response: any]
  error: [error: string]
  start: []
  complete: []
}>()

const buttonRef = ref<HTMLElement | null>(null) // Changed to HTMLElement
const rippleContainer = ref<HTMLElement | null>(null)

// AI and State management
const store = useAppStore()
const toast = useToast()
const showTooltip = ref(false)
const showSuccessState = ref(false)
const showErrorState = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const lastError = ref('')
const processingInterval = ref<number | null>(null)

// Authentication status
const isAuthenticated = ref(false)
const hasAPIKey = computed(() => {
  return !!(store.settings?.geminiApiKey || store.settings?.openaiApiKey)
})

// Resolve props from legacy MUI component
const resolvedLabel = computed(() => props.label ?? props.text ?? '')
const resolvedLeadingIcon = computed(() => props.leadingIcon || props.startIcon)
const resolvedTrailingIcon = computed(() => props.trailingIcon || props.endIcon)
const resolvedSize = computed(() => {
  switch (props.size) {
    case 'chip':
      return 'chip'
    case 'small':
      return 'sm'
    case 'medium':
      return 'md'
    case 'large':
      return 'lg'
    default:
      return props.size
  }
})

// Determine the root HTML tag based on props
const resolvedTag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

// Only supply a native `type` when rendering a <button>
const resolvedType = computed(() => {
  return resolvedTag.value === 'button' ? props.type || 'button' : undefined
})

// Compute button classes
const buttonClasses = computed(() => {
  const classes = [
    'btn-unified',
    'btn',
    'unified-button',
    'interactive-element',
  ]

  // Color/variant classes - now handle all custom variants
  const color = props.color || props.variant
  switch (color) {
    case 'primary':
      classes.push('btn-primary')
      break
    case 'gaming':
      classes.push('btn-gaming', 'gaming-button')
      break
    case 'cyber':
      classes.push('btn-cyber')
      break
    case 'glass':
      classes.push('btn-glass')
      break
    case 'success':
      classes.push('btn-success')
      break
    case 'warning':
      classes.push('btn-warning')
      break
    case 'danger':
      classes.push('btn-danger')
      break
    case 'info':
      classes.push('btn-cyber')
      break
    case 'ghost':
      classes.push('btn-ghost')
      break
    case 'outline':
      classes.push('btn-outline')
      break
    default:
      classes.push('btn-secondary')
  }

  // Appearance classes
  switch (props.appearance) {
    case 'outlined':
      classes.push('btn-outline')
      break
    case 'text':
      classes.push('btn-text')
      break
    case 'ghost':
      classes.push('btn-ghost')
      break
  }

  // Size classes
  classes.push(`btn-${resolvedSize.value}`)

  // State classes
  if (props.loading || isProcessing.value) classes.push('btn-loading')
  if (props.disabled) classes.push('btn-disabled')
  if (props.iconOnly) classes.push('btn-icon-only')
  if (props.fullWidth) classes.push('w-full') // Use w-full from design system
  if (props.ripple) classes.push('ripple-enabled')
  if (showSuccessState.value) classes.push('btn-success-state')
  if (showErrorState.value) classes.push('btn-error-state')
  if (props.requiresAuth && !hasAPIKey.value) classes.push('btn-no-api-key')
  if (props.responsive) classes.push('btn-responsive')

  return classes
})

// Enhanced Event Handlers with AI support
const handleClick = async (event: Event) => {
  if (props.disabled || props.loading || isProcessing.value) {
    event.preventDefault()
    return
  }

  // Create ripple effect
  if (props.ripple && rippleContainer.value) {
    createRipple(event as MouseEvent)
  }

  emit('click', event)

  // Handle AI actions if specified
  if (props.action || props.customHandler) {
    await handleAIAction()
  }
}

// AI Action Handler
const handleAIAction = async () => {
  if (props.requiresAuth && !hasAPIKey.value) {
    toast.warning(
      'AI features require an API key. Please configure in Settings.'
    )
    return
  }

  try {
    emit('start')
    isProcessing.value = true
    showErrorState.value = false
    showSuccessState.value = false

    if (props.showProgress) {
      startProgressTracking()
    }

    let result
    if (props.customHandler) {
      result = await props.customHandler(props.context)
    } else if (props.action) {
      // Use AI service for predefined actions
      result = await executeAIAction(props.action, props.context)
    }

    showSuccessState.value = true
    emit('success', result)

    if (props.autoHideSuccess) {
      setTimeout(() => {
        showSuccessState.value = false
      }, 2000)
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error('AI action failed:', error)
    lastError.value = errorMessage
    showErrorState.value = true
    emit('error', errorMessage)

    if (props.autoHideError) {
      setTimeout(() => {
        showErrorState.value = false
      }, 3000)
    }
  } finally {
    isProcessing.value = false
    emit('complete')
    stopProgressTracking()
  }
}

// AI Service Integration
const executeAIAction = async (action: string, context: any) => {
  if (!aiService) {
    throw new Error('AI service not available')
  }

  // Map action to AI service method
  switch (action) {
    case 'analyze_resume':
      return await aiService.analyzeResume(
        context.resumeContent || '',
        context.jobDescription
      )
    case 'generate_cover_letter':
      return await aiService.generateCoverLetter(
        context.resumeContent || '',
        context.jobDescription || '',
        context.companyInfo || ''
      )
    case 'chat':
    default:
      return await aiService.chat({
        message: context.message || '',
        context: context.context || '',
        type: context.type || 'chat',
      })
  }
}

// Progress tracking
const startProgressTracking = () => {
  if (processingInterval.value) return

  processingInterval.value = window.setInterval(() => {
    if (progress.value < 95) {
      progress.value += 5
    }
  }, 500)
}

const stopProgressTracking = () => {
  if (processingInterval.value) {
    window.clearInterval(processingInterval.value)
    processingInterval.value = null
  }
  progress.value = 100
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// Ripple Effect
const createRipple = (event: MouseEvent) => {
  if (!rippleContainer.value || !buttonRef.value) return

  // Correctly access the underlying DOM element from the component ref
  const button = buttonRef.value
  if (!button || typeof button.getBoundingClientRect !== 'function') return

  // Clear any existing ripples to prevent accumulation
  const existingWaves = rippleContainer.value.querySelectorAll('.ripple-wave')
  existingWaves.forEach(wave => wave.remove())

  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  const ripple = document.createElement('span')
  ripple.className = 'ripple-wave'
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'

  // Add is-rippling class to button
  button.classList.add('is-rippling')

  rippleContainer.value.appendChild(ripple)

  // Remove ripple after animation completes
  ripple.addEventListener('animationend', () => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple)
    }
    button.classList.remove('is-rippling')
    // Force layout recalculation to ensure size is properly reset
    button.offsetHeight
  })

  // Fallback timeout in case animationend doesn't fire
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple)
    }
    button.classList.remove('is-rippling')
  }, 650)
}

// Dropped Bootstrap Icons (bi-*) support in this component.

// Lifecycle hooks
onMounted(async () => {
  if (hasAPIKey.value && aiService) {
    isAuthenticated.value = await aiService.isReady()
  }
})

// Cleanup on unmount
const cleanup = () => {
  stopProgressTracking()
  showTooltip.value = false
  showSuccessState.value = false
  showErrorState.value = false
  isProcessing.value = false
}

// Expose button ref and methods for parent components
defineExpose({
  buttonRef,
  focus: () => buttonRef.value?.focus(),
  blur: () => buttonRef.value?.blur(),
  executeAction: handleAIAction,
  reset: () => {
    showSuccessState.value = false
    showErrorState.value = false
    isProcessing.value = false
    lastError.value = ''
    stopProgressTracking()
  },
  isProcessing: computed(() => isProcessing.value),
  isReady: computed(
    () => !props.disabled && !props.loading && !isProcessing.value
  ),
})
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
  border: 1px solid var(--glass-border);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  outline: none;
  white-space: nowrap;
  vertical-align: middle;
  line-height: 1;
  min-height: 44px; /* WCAG 2.2 compliance */
  min-width: 44px; /* WCAG 2.2 compliance */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--glass-bg);
  color: var(--text-primary);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.btn-unified:hover:not(:disabled) {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.btn-unified:active:not(:disabled) {
  background: var(--glass-bg-active);
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-unified:focus-visible {
  outline: 2px solid rgb(var(--neon-blue));
  outline-offset: 2px;
  box-shadow:
    0 0 20px rgba(var(--neon-blue), 0.3),
    0 0 40px rgba(var(--neon-blue), 0.1);
}

/* Size Variants - Improved Touch Targets */
.btn-xs {
  padding: var(--spacing-1) var(--spacing-2); /* Use design system variables */
  font-size: var(--font-size-xs); /* Use design system variable */
  border-radius: var(--radius-sm); /* Use design system variable */
  gap: var(--spacing-1); /* Use design system variable */
  min-height: 32px; /* WCAG 2.2 compliance */
  min-width: 32px; /* WCAG 2.2 compliance */
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4); /* Use design system variables */
  font-size: var(--font-size-sm); /* Use design system variable */
  border-radius: var(--radius-md); /* Use design system variable */
  gap: var(--spacing-2); /* Use design system variable */
  min-height: 36px; /* WCAG 2.2 compliance */
  min-width: 36px; /* WCAG 2.2 compliance */
}

.btn-md {
  padding: var(--spacing-3) var(--spacing-6); /* Use design system variables */
  font-size: var(--font-size-base); /* Use design system variable */
  border-radius: var(--radius-md); /* Use design system variable */
  gap: var(--spacing-3); /* Use design system variable */
  min-height: 44px; /* WCAG 2.2 compliance */
  min-width: 44px; /* WCAG 2.2 compliance */
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8); /* Use design system variables */
  font-size: var(--font-size-md); /* Use design system variable */
  border-radius: var(--radius-lg); /* Use design system variable */
  gap: var(--spacing-4); /* Use design system variable */
  min-height: 52px; /* WCAG 2.2 compliance */
  min-width: 52px; /* WCAG 2.2 compliance */
}

.btn-xl {
  padding: var(--spacing-5) var(--spacing-10); /* Use design system variables */
  font-size: var(--font-size-lg); /* Use design system variable */
  border-radius: var(--radius-xl); /* Use design system variable */
  gap: var(--spacing-5); /* Use design system variable */
  min-height: 60px; /* WCAG 2.2 compliance */
  min-width: 60px; /* WCAG 2.2 compliance */
}

/* Chip size (compact pill) */
.btn-chip {
  padding: var(--spacing-1-5) var(--spacing-3);
  font-size: 0.82rem;
  line-height: 1;
  border-radius: 999px;
  min-height: 28px;
  min-width: 0;
}

/* Icon Only Buttons - Enhanced Touch Targets */
.btn-icon-only {
  padding: var(--spacing-3); /* Default padding for icon only */
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-only.btn-xs {
  padding: var(--spacing-2); /* Use design system variable */
  min-height: 32px;
  min-width: 32px;
}

.btn-icon-only.btn-sm {
  padding: var(--spacing-2-5); /* Use design system variable */
  min-height: 36px;
  min-width: 36px;
}

.btn-icon-only.btn-lg {
  padding: var(--spacing-4); /* Use design system variable */
  min-height: 52px;
  min-width: 52px;
}

.btn-icon-only.btn-xl {
  padding: var(--spacing-5); /* Use design system variable */
  min-height: 60px;
  min-width: 60px;
}

/* Variant Styles */
.btn-primary,
.btn-unified[data-variant='primary'] {
  background: linear-gradient(
    135deg,
    var(--color-primary-500),
    var(--color-primary-600)
  ) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-primary-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 12px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.25) !important;

  /* Tailwind dark mode primary classes */
  @apply bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600;
  @apply text-white dark:text-gray-100;
  @apply border-blue-700 dark:border-blue-500;
  @apply shadow-blue-500/25 dark:shadow-blue-400/20;
}

.btn-primary:hover:not(:disabled),
.btn-unified[data-variant='primary']:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--color-primary-600),
    var(--color-primary-700)
  ) !important;
  transform: translateY(-1px);
  border-color: var(--color-primary-700) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 20px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.4) !important;

  /* Tailwind dark mode primary hover classes */
  @apply bg-gradient-to-br from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500;
  @apply border-blue-800 dark:border-blue-400;
  @apply shadow-blue-500/40 dark:shadow-blue-400/30;
}

.btn-primary:active:not(:disabled),
.btn-unified[data-variant='primary']:active:not(:disabled) {
  transform: translateY(0);
  background: linear-gradient(
    135deg,
    var(--color-primary-700),
    var(--color-primary-800)
  ) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 8px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.3) !important;

  /* Tailwind dark mode primary active classes */
  @apply bg-gradient-to-br from-blue-800 to-blue-900 dark:from-blue-300 dark:to-blue-400;
  @apply shadow-blue-500/30 dark:shadow-blue-400/20;
}

.btn-gaming {
  background: var(--glass-bg-gaming); /* Use design system variable */
  color: var(--color-gaming-500); /* Use design system variable */
  border: 1px solid var(--glass-border-gaming); /* Use design system variable */
  box-shadow: var(--shadow-sm);

  /* Tailwind dark mode gaming classes */
  @apply bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/30 dark:to-pink-400/30;
  @apply text-purple-600 dark:text-purple-300;
  @apply border-purple-500/30 dark:border-purple-400/40;
  @apply shadow-purple-500/20 dark:shadow-purple-400/15;
}

.btn-gaming:hover:not(:disabled) {
  background: var(--glass-hover-bg); /* Use design system variable */
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-gaming); /* Use design system variable */
  border-color: var(--glass-border-gaming);

  /* Tailwind dark mode gaming hover classes */
  @apply bg-gradient-to-r from-purple-500/30 to-pink-500/30 dark:from-purple-400/40 dark:to-pink-400/40;
  @apply border-purple-600/40 dark:border-purple-300/50;
  @apply shadow-lg shadow-purple-500/30 dark:shadow-purple-400/25;
}

.btn-cyber {
  background: var(--glass-bg-cyber); /* Use design system variable */
  color: var(--color-cyber-500); /* Use design system variable */
  border: 1px solid var(--glass-border-cyber); /* Use design system variable */
  box-shadow: var(--shadow-sm);

  /* Tailwind dark mode cyber classes */
  @apply bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/30 dark:to-blue-400/30;
  @apply text-cyan-600 dark:text-cyan-300;
  @apply border-cyan-500/30 dark:border-cyan-400/40;
  @apply shadow-cyan-500/20 dark:shadow-cyan-400/15;
}

.btn-cyber:hover:not(:disabled) {
  background: var(--glass-hover-bg); /* Use design system variable */
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-cyber); /* Use design system variable */
  border-color: var(--glass-border-cyber);

  /* Tailwind dark mode cyber hover classes */
  @apply bg-gradient-to-r from-cyan-500/30 to-blue-500/30 dark:from-cyan-400/40 dark:to-blue-400/40;
  @apply border-cyan-600/40 dark:border-cyan-300/50;
  @apply shadow-lg shadow-cyan-500/30 dark:shadow-cyan-400/25;
}

.btn-glass,
.btn-unified[data-variant='glass'] {
  background: var(--glass-bg) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--glass-border) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: var(--glass-shadow) !important;

  /* Tailwind dark mode glass classes */
  @apply bg-white/10 dark:bg-black/10;
  @apply text-glass-primary;
  @apply border-white/20 dark:border-gray-700/40;
  @apply backdrop-blur-md;
  @apply shadow-lg shadow-black/10 dark:shadow-black/30;
}

.btn-glass:hover:not(:disabled),
.btn-unified[data-variant='glass']:hover:not(:disabled) {
  background: var(--glass-hover-bg) !important;
  transform: translateY(-1px);
  border-color: rgba(
    var(--color-primary-500-rgb, 99, 102, 241),
    0.4
  ) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 12px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15) !important;

  /* Tailwind dark mode glass hover classes */
  @apply bg-white/20 dark:bg-black/20;
  @apply border-blue-500/40 dark:border-blue-400/50;
  @apply shadow-xl shadow-blue-500/15 dark:shadow-blue-400/10;
}

.btn-glass:active:not(:disabled),
.btn-unified[data-variant='glass']:active:not(:disabled) {
  transform: translateY(0);
  background: var(--glass-hover-bg) !important;
  box-shadow: var(--glass-shadow) !important;

  /* Tailwind dark mode glass active classes */
  @apply bg-white/15 dark:bg-black/15;
  @apply shadow-lg shadow-black/10 dark:shadow-black/20;
}

/* Remove inner glass capsule - keep it simple for better integration */
.btn-unified[data-variant='glass'] .button-content {
  /* No additional styling needed - let the button itself handle glass effect */
}

.btn-success,
.btn-unified[data-variant='success'] {
  background: linear-gradient(
    135deg,
    var(--color-success-500),
    var(--color-success-600)
  ) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-success-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 12px rgba(var(--color-success-500-rgb, 34, 197, 94), 0.25) !important;

  /* Tailwind dark mode success classes */
  @apply bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600;
  @apply text-white dark:text-gray-100;
  @apply border-green-700 dark:border-green-500;
  @apply shadow-green-500/25 dark:shadow-green-400/20;
}

.btn-success:hover:not(:disabled),
.btn-unified[data-variant='success']:hover:not(:disabled) {
  /* Tailwind dark mode success hover classes */
  @apply bg-gradient-to-br from-green-700 to-green-800 dark:from-green-400 dark:to-green-500;
  @apply border-green-800 dark:border-green-400;
  @apply shadow-green-500/40 dark:shadow-green-400/30;
}

.btn-warning,
.btn-unified[data-variant='warning'] {
  background: linear-gradient(
    135deg,
    var(--color-warning-500),
    var(--color-warning-600)
  ) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-warning-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 12px rgba(var(--color-warning-500-rgb, 245, 158, 11), 0.25) !important;

  /* Tailwind dark mode warning classes */
  @apply bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500;
  @apply text-white dark:text-gray-900;
  @apply border-yellow-600 dark:border-yellow-400;
  @apply shadow-yellow-500/25 dark:shadow-yellow-400/20;
}

.btn-warning:hover:not(:disabled),
.btn-unified[data-variant='warning']:hover:not(:disabled) {
  /* Tailwind dark mode warning hover classes */
  @apply bg-gradient-to-br from-yellow-600 to-yellow-700 dark:from-yellow-300 dark:to-yellow-400;
  @apply border-yellow-700 dark:border-yellow-300;
  @apply shadow-yellow-500/40 dark:shadow-yellow-400/30;
}

.btn-danger,
.btn-unified[data-variant='danger'] {
  background: linear-gradient(
    135deg,
    var(--color-error-500),
    var(--color-error-600)
  ) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-error-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow:
    var(--glass-shadow),
    0 0 12px rgba(var(--color-error-500-rgb, 239, 68, 68), 0.25) !important;

  /* Tailwind dark mode danger classes */
  @apply bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600;
  @apply text-white dark:text-gray-100;
  @apply border-red-700 dark:border-red-500;
  @apply shadow-red-500/25 dark:shadow-red-400/20;
}

.btn-danger:hover:not(:disabled),
.btn-unified[data-variant='danger']:hover:not(:disabled) {
  /* Tailwind dark mode danger hover classes */
  @apply bg-gradient-to-br from-red-700 to-red-800 dark:from-red-400 dark:to-red-500;
  @apply border-red-800 dark:border-red-400;
  @apply shadow-red-500/40 dark:shadow-red-400/30;
}

.btn-ghost,
.btn-unified[data-variant='ghost'] {
  background: transparent !important;
  color: var(--text-primary) !important;
  border: 1px solid transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;

  /* Tailwind dark mode ghost classes */
  @apply bg-transparent;
  @apply text-gray-700 dark:text-gray-300;
  @apply border-transparent;
  @apply shadow-none;
}

.btn-ghost:hover:not(:disabled),
.btn-unified[data-variant='ghost']:hover:not(:disabled) {
  background: var(--glass-bg) !important;
  border-color: var(--glass-border) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: var(--glass-shadow) !important;

  /* Tailwind dark mode ghost hover classes */
  @apply bg-gray-100 dark:bg-gray-800;
  @apply border-gray-200 dark:border-gray-700;
  @apply text-glass-primary;
  @apply shadow-sm dark:shadow-black/20;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary); /* Use design system variable */
  border-color: var(--border-base); /* Use design system variable */
  box-shadow: none;

  /* Tailwind dark mode outline classes */
  @apply bg-transparent;
  @apply text-gray-700 dark:text-gray-300;
  @apply border-gray-300 dark:border-gray-600;
  @apply shadow-none;
}

.btn-outline:hover:not(:disabled) {
  background: var(--glass-bg-light); /* Use design system variable */
  color: var(--text-primary); /* Use design system variable */
  box-shadow: var(--shadow-xs);
  border-color: var(--color-primary-300);

  /* Tailwind dark mode outline hover classes */
  @apply glass-bg-light;
  @apply text-glass-primary;
  @apply border-blue-400 dark:border-blue-500;
  @apply shadow-sm dark:shadow-black/20;
}

/* State Styles */
.btn-loading {
  cursor: wait;
}

.btn-disabled,
.btn-unified:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  background: var(--glass-disabled-bg); /* Use design system variable */
  border-color: var(--border-base);
  box-shadow: none;

  /* Tailwind dark mode disabled classes */
  @apply opacity-50;
  @apply cursor-not-allowed;
  @apply bg-gray-100 dark:bg-gray-800;
  @apply text-gray-400 dark:text-gray-500;
  @apply border-gray-200 dark:border-gray-700;
  @apply shadow-none;
}

.btn-unified:focus-visible {
  outline: 2px solid rgb(var(--neon-blue));
  outline-offset: 2px;
  box-shadow:
    0 0 20px rgba(var(--neon-blue), 0.3),
    0 0 40px rgba(var(--neon-blue), 0.1);
}

/* Badge */
.button-badge {
  position: absolute;
  top: var(--spacing-0-5); /* Use design system variable */
  right: var(--spacing-0-5); /* Use design system variable */
  font-size: var(--font-size-xs); /* Use design system variable */
  padding: var(--spacing-0-5) var(--spacing-1); /* Use design system variables */
  min-width: 1.2rem;
  text-align: center;
  border-radius: var(--radius-full); /* Use design system variable */
  background: var(--color-warning-500); /* Example: use warning color */
  color: var(--text-on-primary);

  /* Tailwind dark mode badge classes */
  @apply absolute -top-1 -right-1;
  @apply text-xs font-semibold;
  @apply px-1.5 py-0.5;
  @apply rounded-full;
  @apply bg-red-500 dark:bg-red-400;
  @apply text-white dark:text-gray-900;
  @apply shadow-sm dark:shadow-black/20;
}

/* Ripple Container */
.ripple-container {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;

  /* Tailwind dark mode ripple classes */
  @apply absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit];
}

/* Ripple Wave Effect */
.ripple-wave {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: ripple 0.6s linear;
  pointer-events: none;

  /* Tailwind dark mode ripple wave classes */
  @apply absolute rounded-full pointer-events-none;
  @apply bg-white/40 dark:bg-white/30;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Loading States */
.btn-loading .button-content {
  opacity: 0.7;

  /* Tailwind dark mode loading classes */
  @apply opacity-70 dark:opacity-60;
}

/* Full Width */
.w-full {
  /* Use w-full from design system */
  width: 100%;
}

/* Animation Improvements */
.btn-unified:active:not(:disabled) {
  transform: translateY(0) !important;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .btn-lg,
  .btn-xl {
    padding: var(--spacing-3) var(--spacing-6); /* Adjust to md size for mobile */
    font-size: var(--font-size-base); /* Adjust to base font size for mobile */
    min-height: 44px; /* Ensure WCAG compliance */
    min-width: 44px; /* Ensure WCAG compliance */
  }
}

/* AI State Styles */
.btn-success-state {
  background: var(
    --color-success-500
  ) !important; /* Use design system variable */
  color: var(--text-on-primary) !important; /* Use design system variable */
  box-shadow: var(--shadow-glow-success);

  /* Tailwind dark mode success state classes */
  @apply bg-green-500 dark:bg-green-400;
  @apply text-white dark:text-gray-900;
  @apply shadow-lg shadow-green-500/30 dark:shadow-green-400/25;
}

.btn-error-state {
  background: var(
    --color-error-500
  ) !important; /* Use design system variable */
  color: var(--text-on-primary) !important; /* Use design system variable */
  box-shadow: var(--shadow-glow-error);

  /* Tailwind dark mode error state classes */
  @apply bg-red-500 dark:bg-red-400;
  @apply text-white dark:text-gray-900;
  @apply shadow-lg shadow-red-500/30 dark:shadow-red-400/25;
}

.btn-no-api-key {
  background: var(
    --color-warning-500
  ) !important; /* Use design system variable */
  color: var(--text-on-primary) !important; /* Use design system variable */
  box-shadow: var(--shadow-glow-warning);

  /* Tailwind dark mode no-api-key state classes */
  @apply bg-yellow-500 dark:bg-yellow-400;
  @apply text-white dark:text-gray-900;
  @apply shadow-lg shadow-yellow-500/30 dark:shadow-yellow-400/25;
}

.btn-no-api-key::after {
  content: '🔒';
  margin-left: var(--spacing-1); /* Use design system variable */
}

/* Progress Bar */
.btn-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--glass-bg-light); /* Use design system variable */
  overflow: hidden;
  border-radius: 0 0 var(--radius-md) var(--radius-md); /* Use design system variable */

  /* Tailwind dark mode progress bar classes */
  @apply absolute bottom-0 left-0 right-0 h-0.5;
  @apply bg-gray-200 dark:bg-gray-700;
  @apply overflow-hidden;
  @apply rounded-b-md;
}

.btn-progress-fill {
  height: 100%;
  background: var(--color-primary-500); /* Use design system variable */
  transition: width var(--duration-normal) var(--easing-ease-out); /* Use design system variables */

  /* Tailwind dark mode progress fill classes */
  @apply h-full;
  @apply bg-blue-500 dark:bg-blue-400;
  @apply transition-all duration-300 ease-out;
}

/* Tooltip */
.btn-tooltip {
  position: absolute;
  z-index: var(--z-tooltip); /* Use design system variable */
  padding: var(--spacing-2) var(--spacing-3); /* Use design system variables */
  background: var(--glass-surface-overlay); /* Use design system variable */
  color: var(--text-primary); /* Use design system variable */
  border-radius: var(--radius-sm); /* Use design system variable */
  font-size: var(--font-size-sm); /* Use design system variable */
  white-space: nowrap;
  pointer-events: none;
  box-shadow: var(--shadow-lg); /* Use design system variable */
  backdrop-filter: var(
    --glass-backdrop-blur-light
  ); /* Use design system variable */

  /* Tailwind dark mode tooltip classes */
  @apply absolute z-50;
  @apply px-3 py-2;
  @apply bg-gray-900/90 dark:bg-gray-100/90;
  @apply text-white dark:text-gray-900;
  @apply text-sm font-medium;
  @apply rounded-md;
  @apply backdrop-blur-sm;
  @apply shadow-lg dark:shadow-black/30;
  @apply border border-gray-700/50 dark:border-gray-300/50;
}

.btn-tooltip.top {
  bottom: calc(100% + var(--spacing-2)); /* Use design system variable */
  left: 50%;
  transform: translateX(-50%);
}

.btn-tooltip.bottom {
  top: calc(100% + var(--spacing-2)); /* Use design system variable */
  left: 50%;
  transform: translateX(-50%);
}

.btn-tooltip.left {
  right: calc(100% + var(--spacing-2)); /* Use design system variable */
  top: 50%;
  transform: translateY(-50%);
}

.btn-tooltip.right {
  left: calc(100% + var(--spacing-2)); /* Use design system variable */
  top: 50%;
  transform: translateY(-50%);
}

/* AI Status Icons */
.ai-success-icon,
.ai-error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn var(--duration-fast) var(--easing-ease-out); /* Use design system variables */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Processing Animation */
.btn-loading::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(var(--color-primary-500-rgb), 0.3),
    transparent
  ); /* Use design system variable */
  animation: pulse-border var(--duration-slow) var(--easing-ease-in-out)
    infinite; /* Use design system variables */
  pointer-events: none;
}

@keyframes pulse-border {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* Responsive Behavior */
.btn-responsive {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .btn-responsive:not(.btn-icon-only) .button-content {
    display: none;
  }

  .btn-responsive {
    aspect-ratio: 1;
    padding: var(--spacing-3); /* Use design system variable */
  }

  .btn-responsive i {
    margin: 0 !important;
  }
}

/* Dark theme adjustments */
[data-theme='dark'] .btn-tooltip {
  background: var(--glass-surface-overlay); /* Use design system variable */
  color: var(--text-primary); /* Use design system variable */
}

[data-theme='dark'] .btn-unified {
  background: var(--glass-surface); /* Use design system variable */
  border-color: var(--glass-border); /* Use design system variable */
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .btn-unified {
    border-width: 2px;
  }

  .btn-glass {
    background: var(--surface-base); /* Use design system variable */
    border-color: currentColor;
  }

  .btn-tooltip {
    backdrop-filter: none;
    background: var(--surface-base); /* Use design system variable */
    border: 2px solid var(--border-strong); /* Use design system variable */
  }
}

/* Reduced motion support */
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
