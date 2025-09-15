<template>
  <div class="standard-form-field" :class="fieldClass" class="font-sans">
    <!-- Label -->
    <label
      v-if="label || $slots.label"
      :for="fieldId"
      class="standard-form-field__label"
      :class="labelClass"
    >
      <slot name="label">
        {{ label }}
        <span v-if="required" class="standard-form-field__required" aria-label="required">*</span>
      </slot>
    </label>

    <!-- Description -->
    <p
      v-if="description || $slots.description"
      :id="`${fieldId}-description`"
      class="standard-form-field__description"
    >
      <slot name="description">{{ description }}</slot>
    </p>

    <!-- Field Container -->
    <div class="standard-form-field__container" :class="containerClass">
      <!-- Prefix Icon/Content -->
      <div v-if="prefixIcon || $slots.prefix" class="standard-form-field__prefix">
        <slot name="prefix">
          <AppIcon v-if="prefixIcon" :name="prefixIcon" />
        </slot>
      </div>

      <!-- Input Element -->
      <component
        :is="fieldComponent"
        :id="fieldId"
        ref="inputRef"
        v-model="internalValue"
        class="standard-form-field__input"
        :class="inputClass"
        v-bind="inputAttrs"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="hasError"
        :aria-required="required"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
        @change="handleChange"
      >
        <!-- Options for select -->
        <template v-if="type === 'select'">
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option
            v-for="option in options"
            :key="getOptionValue(option)"
            :value="getOptionValue(option)"
            :disabled="getOptionDisabled(option)"
          >
            {{ getOptionLabel(option) }}
          </option>
        </template>

        <!-- Content for textarea -->
        <template v-if="type === 'textarea'">{{ internalValue }}</template>
      </component>

      <!-- Suffix Icon/Content -->
      <div v-if="suffixIcon || $slots.suffix || showPasswordToggle" class="standard-form-field__suffix">
        <slot name="suffix">
          <!-- Password toggle -->
          <button
            v-if="showPasswordToggle"
            type="button"
            class="standard-form-field__password-toggle"
            @click="togglePasswordVisibility"
          >
            <AppIcon :name="passwordVisible ? 'EyeIcon-off' : 'EyeIcon'" />
          </button>

          <!-- Suffix icon -->
          <AppIcon v-else-if="suffixIcon" :name="suffixIcon" />
        </slot>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="standard-form-field__loading">
        <AppIcon name="ArrowPathIcon" class="animate-spin" />
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="hasError"
      :id="`${fieldId}-error`"
      class="standard-form-field__error"
      role="alert"
    >
      <AppIcon name="ExclamationCircleIcon" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Help Text -->
    <p
      v-if="helpText || $slots.help"
      :id="`${fieldId}-help`"
      class="standard-form-field__help"
    >
      <slot name="help">{{ helpText }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'

import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useId } from '@vueuse/core';
import AppIcon from './AppIcon.vue';

interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

interface Props {
  // Value
  modelValue?: any;

  // Field config
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select';
  label?: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  autofocus?: boolean;

  // Validation
  error?: string | boolean;
  rules?: Array<(value: any) => string | boolean>;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;

  // Styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';

  // Icons
  prefixIcon?: string;
  suffixIcon?: string;

  // Select specific
  options?: Array<SelectOption | string | number>;

  // Input attributes
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxlength?: number;
  rows?: number;
  cols?: number;
  autocomplete?: string;
  spellcheck?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'default',
  validateOnBlur: true,
  validateOnInput: false,
  spellcheck: true,
  rows: 3,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
  blur: [event: Event];
  focus: [event: Event];
  input: [event: Event];
  change: [event: Event];
}>();

// Refs
const inputRef = ref<HTMLElement>();
const fieldId = useId();
const isFocused = ref(false);
const passwordVisible = ref(false);
const internalError = ref<string>('');

// Internal value handling
const internalValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value)
});

// Computed properties
const fieldComponent = computed(() => {
  switch (props.type) {
    case 'textarea': return 'textarea';
    case 'select': return 'select';
    default: return 'input';
  }
});

const inputAttrs = computed(() => {
  const attrs: Record<string, any> = {
    disabled: props.disabled,
    readonly: props.readonly,
    placeholder: props.placeholder,
    required: props.required,
    autocomplete: props.autocomplete,
    spellcheck: props.spellcheck,
  };

  if (props.type !== 'textarea' && props.type !== 'select') {
    attrs.type = props.type === 'password' && passwordVisible.value ? 'text' : props.type;
  }

  if (props.type === 'number') {
    if (props.min !== undefined) attrs.min = props.min;
    if (props.max !== undefined) attrs.max = props.max;
    if (props.step !== undefined) attrs.step = props.step;
  }

  if (props.maxlength) attrs.maxlength = props.maxlength;

  if (props.type === 'textarea') {
    attrs.rows = props.rows;
    if (props.cols) attrs.cols = props.cols;
  }

  return attrs;
});

const hasError = computed(() => Boolean(props.error || internalError.value));
const errorMessage = computed(() => props.error || internalError.value);

const showPasswordToggle = computed(() =>
  props.type === 'password' && !props.readonly && !props.disabled
);

const ariaDescribedby = computed(() => {
  const ids = [];
  if (props.description) ids.push(`${fieldId}-description`);
  if (hasError.value) ids.push(`${fieldId}-error`);
  if (props.helpText) ids.push(`${fieldId}-help`);
  return ids.length > 0 ? ids.join(' ') : undefined;
});

// CSS classes
const fieldClass = computed(() => [
  `standard-form-field--${props.size}`,
  `standard-form-field--${props.variant}`,
  {
    'standard-form-field--focused': isFocused.value,
    'standard-form-field--error': hasError.value,
    'standard-form-field--disabled': props.disabled,
    'standard-form-field--readonly': props.readonly,
    'standard-form-field--loading': props.loading,
    'standard-form-field--required': props.required,
  }
]);

const labelClass = computed(() => [
  {
    'standard-form-field__label--floating': props.variant === 'filled' && (isFocused.value || internalValue.value),
  }
]);

const containerClass = computed(() => [
  {
    'standard-form-field__container--prefix': props.prefixIcon || Boolean(document.querySelector('[slot="prefix"]')),
    'standard-form-field__container--suffix': props.suffixIcon || showPasswordToggle.value || Boolean(document.querySelector('[slot="suffix"]')),
  }
]);

const inputClass = computed(() => [
  {
    'standard-form-field__input--no-border': props.variant === 'minimal',
  }
]);

// Select option helpers
const getOptionValue = (option: SelectOption | string | number): any => {
  return typeof option === 'object' ? option.value : option;
};

const getOptionLabel = (option: SelectOption | string | number): string => {
  return typeof option === 'object' ? option.label : String(option);
};

const getOptionDisabled = (option: SelectOption | string | number): boolean => {
  return typeof option === 'object' ? Boolean(option.disabled) : false;
};

// Validation
const validate = () => {
  if (!props.rules) {
    internalError.value = '';
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(internalValue.value);
    if (typeof result === 'string') {
      internalError.value = result;
      return false;
    }
  }

  internalError.value = '';
  return true;
};

// Event handlers
const handleFocus = (event: Event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: Event) => {
  isFocused.value = false;
  if (props.validateOnBlur) {
    validate();
  }
  emit('blur', event);
};

const handleInput = (event: Event) => {
  if (props.validateOnInput) {
    validate();
  }
  emit('input', event);
};

const handleChange = (event: Event) => {
  emit('change', event);
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

// Public methods
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const validateField = () => {
  return validate();
};

// Watch for external error changes
watch(() => props.error, () => {
  internalError.value = '';
});

// Autofocus
onMounted(() => {
  if (props.autofocus) {
    nextTick(() => {
      focus();
    });
  }
});

// Expose public methods
defineExpose({
  focus,
  blur,
  validate: validateField,
  inputRef,
});
</script>

<style scoped>
.standard-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.standard-form-field__label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
}

.standard-form-field__required {
  color: #dc2626;
  font-weight: bold;
}

.standard-form-field__description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.standard-form-field__container {
  position: relative;
  display: flex;
  align-items: center;
}

.standard-form-field__prefix,
.standard-form-field__suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  pointer-events: none;
}

.standard-form-field__input {
  flex: 1;
  min-width: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.standard-form-field__input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.standard-form-field__input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.standard-form-field__input:readonly {
  background: #f9fafb;
}

.standard-form-field__password-toggle {
  padding: 0.25rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  pointer-events: auto;
  transition: all 0.15s ease;
}

.standard-form-field__password-toggle:hover {
  color: #374151;
  background: #f3f4f6;
}

.standard-form-field__loading {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  color: #3b82f6;
  pointer-events: none;
}

.standard-form-field__error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.standard-form-field__help {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Size variants */
.standard-form-field--sm .standard-form-field__input {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.standard-form-field--md .standard-form-field__input {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
}

.standard-form-field--lg .standard-form-field__input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

/* Style variants */
.standard-form-field--filled .standard-form-field__input {
  border: none;
  background: #f3f4f6;
  border-radius: 8px 8px 0 0;
  border-b: 2px solid #d1d5db;
}

.standard-form-field--filled.standard-form-field--focused .standard-form-field__input {
  background: #f9fafb;
  border-b-color: #3b82f6;
}

.standard-form-field--outlined .standard-form-field__input {
  border: 2px solid #d1d5db;
}

.standard-form-field--outlined.standard-form-field--focused .standard-form-field__input {
  border-color: #3b82f6;
  box-shadow: none;
}

.standard-form-field--minimal .standard-form-field__input {
  border: none;
  border-b: 1px solid #d1d5db;
  border-radius: 0;
  background: transparent;
}

.standard-form-field--minimal.standard-form-field--focused .standard-form-field__input {
  border-b-color: #3b82f6;
  box-shadow: 0 1px 0 0 #3b82f6;
}

/* Container with prefix/suffix */
.standard-form-field__container--prefix .standard-form-field__prefix {
  position: absolute;
  left: 0.75rem;
  z-index: 1;
}

.standard-form-field__container--prefix .standard-form-field__input {
  padding-left: 2.5rem;
}

.standard-form-field__container--suffix .standard-form-field__suffix {
  position: absolute;
  right: 0.75rem;
  z-index: 1;
}

.standard-form-field__container--suffix .standard-form-field__input {
  padding-right: 2.5rem;
}

/* Error state */
.standard-form-field--error .standard-form-field__input {
  border-color: #dc2626;
}

.standard-form-field--error .standard-form-field__input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.standard-form-field--error .standard-form-field__label {
  color: #dc2626;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .standard-form-field__label {
    color: #d1d5db;
  }

  .standard-form-field__description,
  .standard-form-field__help {
    color: #9ca3af;
  }

  .standard-form-field__input {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .standard-form-field__input:focus {
    border-color: #3b82f6;
  }

  .standard-form-field__input:disabled {
    background: #111827;
    color: #6b7280;
  }

  .standard-form-field--filled .standard-form-field__input {
    background: #374151;
    border-b-color: #4b5563;
  }

  .standard-form-field--filled.standard-form-field--focused .standard-form-field__input {
    background: #1f2937;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .standard-form-field__input {
    border-width: 2px;
  }

  .standard-form-field__input:focus {
    outline: 2px solid;
    outline-offset: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .standard-form-field__input,
  .standard-form-field__label,
  .standard-form-field__password-toggle {
    transition: none;
  }
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>