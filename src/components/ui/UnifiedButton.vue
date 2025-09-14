<template>
  <component
    :is="resolvedTag"
    ref="buttonRef"
    :class="buttonClasses"
    :data-variant="(props.color || props.variant)"
    :data-size="resolvedSize"
    :data-icon-only="props.iconOnly ? 'true' : 'false'"
    :to="props.to || undefined"
    :href="props.href || undefined"
    :disabled="disabled || loading || isProcessing || (requiresAuth && !hasAPIKey)"
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
    <div v-if="loading || isProcessing" class="spinner-gaming me-2" role="status" aria-hidden="true"></div>
    
    <!-- AI Status Icons -->
    <div v-if="showSuccessState" class="ai-success-icon me-2">
      <AppIcon name="mdi-check" />
    </div>
    <div v-if="showErrorState" class="ai-error-icon me-2">
      <AppIcon name="mdi-alert-circle" style="color: var(--color-error-500);" />
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
        <span v-else-if="showSuccessState && successText">{{ successText }}</span>
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
    <span v-if="badge" class="button-badge badge-unified bg-warning">{{ badge }}</span>
    
    <!-- Tooltip -->
    <div v-if="tooltip && showTooltip" class="btn-tooltip" :class="tooltipPosition">
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
import { computed, ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import { aiService } from '@/shared/services/AIService'
import AppIcon from '@/components/ui/AppIcon.vue'

interface Props {
  // Basic Props
  label?: string
  text?: string
  variant?: 'primary' | 'secondary' | 'tertiary' | 'gaming' | 'cyber' | 'glass' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gaming' | 'cyber' | 'glass' | 'ghost' | 'outline'
  appearance?: 'contained' | 'outlined' | 'text' | 'ghost'
  size?: 'chip' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'small' | 'medium' | 'large'

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
  return resolvedTag.value === 'button' ? (props.type || 'button') : undefined
})

// Compute button classes
const buttonClasses = computed(() => {
  const classes = ['btn-unified', 'btn', 'unified-button', 'interactive-element']

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
    toast.warning('AI features require an API key. Please configure in Settings.')
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI action failed:', error)
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
      return await aiService.analyzeResume(context.resumeContent || '', context.jobDescription)
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
        type: context.type || 'chat'
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
  isReady: computed(() => !props.disabled && !props.loading && !isProcessing.value)
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
  -webkit-backdrop-filter: var(--glass-backdrop-filter); /* Use master theme variable */
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
  box-shadow: var(--shadow-md), 0 0 0 3px var(--color-primary-200); /* Enhanced focus shadow */
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
.btn-unified[data-variant="primary"] {
  background: linear-gradient(135deg, 
    var(--color-primary-500), 
    var(--color-primary-600)) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-primary-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 12px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.25) !important;
}

.btn-primary:hover:not(:disabled),
.btn-unified[data-variant="primary"]:hover:not(:disabled) {
  background: linear-gradient(135deg, 
    var(--color-primary-600), 
    var(--color-primary-700)) !important;
  transform: translateY(-1px);
  border-color: var(--color-primary-700) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 20px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.4) !important;
}

.btn-primary:active:not(:disabled),
.btn-unified[data-variant="primary"]:active:not(:disabled) {
  transform: translateY(0);
  background: linear-gradient(135deg, 
    var(--color-primary-700), 
    var(--color-primary-800)) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 8px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.3) !important;
}

.btn-gaming {
  background: var(--glass-bg-gaming); /* Use design system variable */
  color: var(--color-gaming-500); /* Use design system variable */
  border: 1px solid var(--glass-border-gaming); /* Use design system variable */
  box-shadow: var(--shadow-sm);
}

.btn-gaming:hover:not(:disabled) {
  background: var(--glass-hover-bg); /* Use design system variable */
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-gaming); /* Use design system variable */
  border-color: var(--glass-border-gaming);
}

.btn-cyber {
  background: var(--glass-bg-cyber); /* Use design system variable */
  color: var(--color-cyber-500); /* Use design system variable */
  border: 1px solid var(--glass-border-cyber); /* Use design system variable */
  box-shadow: var(--shadow-sm);
}

.btn-cyber:hover:not(:disabled) {
  background: var(--glass-hover-bg); /* Use design system variable */
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-cyber); /* Use design system variable */
  border-color: var(--glass-border-cyber);
}

.btn-glass,
.btn-unified[data-variant="glass"] {
  background: var(--glass-bg) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--glass-border) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: var(--glass-shadow) !important;
}

.btn-glass:hover:not(:disabled),
.btn-unified[data-variant="glass"]:hover:not(:disabled) {
  background: var(--glass-hover-bg) !important;
  transform: translateY(-1px);
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.4) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 12px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15) !important;
}

.btn-glass:active:not(:disabled),
.btn-unified[data-variant="glass"]:active:not(:disabled) {
  transform: translateY(0);
  background: var(--glass-hover-bg) !important;
  box-shadow: var(--glass-shadow) !important;
}

/* Remove inner glass capsule - keep it simple for better integration */
.btn-unified[data-variant="glass"] .button-content { 
  /* No additional styling needed - let the button itself handle glass effect */
}

.btn-success,
.btn-unified[data-variant="success"] {
  background: linear-gradient(135deg, 
    var(--color-success-500), 
    var(--color-success-600)) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-success-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 12px rgba(var(--color-success-500-rgb, 34, 197, 94), 0.25) !important;
}

.btn-warning,
.btn-unified[data-variant="warning"] {
  background: linear-gradient(135deg, 
    var(--color-warning-500), 
    var(--color-warning-600)) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-warning-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 12px rgba(var(--color-warning-500-rgb, 245, 158, 11), 0.25) !important;
}

.btn-danger,
.btn-unified[data-variant="danger"] {
  background: linear-gradient(135deg, 
    var(--color-error-500), 
    var(--color-error-600)) !important;
  color: var(--text-on-primary) !important;
  border: 1px solid var(--color-error-600) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  box-shadow: 
    var(--glass-shadow),
    0 0 12px rgba(var(--color-error-500-rgb, 239, 68, 68), 0.25) !important;
}

.btn-ghost,
.btn-unified[data-variant="ghost"] {
  background: transparent !important;
  color: var(--text-primary) !important;
  border: 1px solid transparent !important;
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
  color: var(--text-primary); /* Use design system variable */
  border-color: var(--border-base); /* Use design system variable */
  box-shadow: none;
}

.btn-outline:hover:not(:disabled) {
  background: var(--glass-bg-light); /* Use design system variable */
  color: var(--text-primary); /* Use design system variable */
  box-shadow: var(--shadow-xs);
  border-color: var(--color-primary-300);
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
}

.btn-unified:focus-visible {
  outline: 3px solid var(--color-primary-400); /* Use design system variable */
  outline-offset: 2px;
  box-shadow: var(--shadow-md), 0 0 0 3px var(--color-primary-200); /* Enhanced focus shadow */
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
}

/* Ripple Container */
.ripple-container {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}

/* Loading States */
.btn-loading .button-content {
  opacity: 0.7;
}

/* Full Width */
.w-full { /* Use w-full from design system */
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
  background: var(--color-success-500) !important; /* Use design system variable */
  color: var(--text-on-primary) !important; /* Use design system variable */
  box-shadow: var(--shadow-glow-success);
}

.btn-error-state {
  background: var(--color-error-500) !important; /* Use design system variable */
  color: var(--text-on-primary) !important; /* Use design system variable */
  box-shadow: var(--shadow-glow-error);
}

.btn-no-api-key {
  background: var(--color-warning-500) !important; /* Use design system variable */
  color: var(--text-on-primary) !important; /* Use design system variable */
  box-shadow: var(--shadow-glow-warning);
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
}

.btn-progress-fill {
  height: 100%;
  background: var(--color-primary-500); /* Use design system variable */
  transition: width var(--duration-normal) var(--easing-ease-out); /* Use design system variables */
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
  backdrop-filter: var(--glass-backdrop-blur-light); /* Use design system variable */
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
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* Processing Animation */
.btn-loading::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(45deg, transparent, rgba(var(--color-primary-500-rgb), 0.3), transparent); /* Use design system variable */
  animation: pulse-border var(--duration-slow) var(--easing-ease-in-out) infinite; /* Use design system variables */
  pointer-events: none;
}

@keyframes pulse-border {
  0%, 100% {
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
[data-theme="dark"] .btn-tooltip {
  background: var(--glass-surface-overlay); /* Use design system variable */
  color: var(--text-primary); /* Use design system variable */
}

[data-theme="dark"] .btn-unified {
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
