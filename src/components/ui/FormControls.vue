<template>
  <div class="form-control-wrapper" class="font-sans">
    <!-- Radio Button -->
    <div v-if="type === 'radio'" class="form-radio" :class="{ 'form-radio-disabled': disabled }">
      <input
        :id="inputId"
        type="radio"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :aria-describedby="describedBy"
        class="form-radio-input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <label
        :for="inputId"
        class="form-radio-label"
        :class="{ 'form-control-error': hasError }"
      >
        <span class="form-radio-indicator">
          <AppIcon name="mdi-circle-outline" />
          <AppIcon name="mdi-radiobox-marked" />
        </span>
        <span v-if="label" class="form-control-text">{{ label }}</span>
        <slot v-else name="label"></slot>
      </label>
    </div>

    <!-- Checkbox -->
    <div v-else-if="type === 'checkbox'" class="form-checkbox" :class="{ 'form-checkbox-disabled': disabled }">
      <input
        :id="inputId"
        type="checkbox"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :aria-describedby="describedBy"
        class="form-checkbox-input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <label
        :for="inputId"
        class="form-checkbox-label"
        :class="{ 'form-control-error': hasError }"
      >
        <span class="form-checkbox-indicator">
          <AppIcon name="CheckIconbox-blank-outline" />
          <AppIcon name="CheckIconbox-marked" />
        </span>
        <span class="form-control-text">{{ label }}</span>
      </label>
    </div>

    <!-- Switch/Toggle -->
    <div v-else-if="type === 'switch'" class="form-switch" :class="{ 'form-switch-disabled': disabled }">
      <input
        :id="inputId"
        type="checkbox"
        :name="name"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :aria-describedby="describedBy"
        class="form-switch-input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <label
        :for="inputId"
        class="form-switch-label"
        :class="{ 'form-control-error': hasError }"
      >
        <span class="form-switch-track">
          <span class="form-switch-thumb"></span>
        </span>
        <span v-if="label" class="form-control-text">{{ label }}</span>
      </label>
    </div>

    <!-- Button Group (for radio button styling) -->
    <div v-else-if="type === 'button-group'" class="form-button-group" :class="{ 'form-button-group-disabled': disabled, 'form-button-group-inline': inline }">
      <div class="btn-group" :class="sizeClass" role="group" :aria-label="label">
        <template v-for="option in options" :key="option.value">
          <input
            :id="`${inputId}-${option.value}`"
            :name="name || inputId"
            type="radio"
            :value="option.value"
            :checked="modelValue === option.value"
            :disabled="disabled || option.disabled"
            :required="required"
            :aria-describedby="describedBy"
            class="btn-check"
            @change="handleButtonGroupChange"
            @focus="handleFocus"
            @blur="handleBlur"
          />
          <label
            :for="`${inputId}-${option.value}`"
            class="btn"
            :class="getButtonClass(option)"
            :title="option.title || option.label"
          >
            <i v-if="option.icon" :class="option.icon" class="mr-1"></i>
            {{ option.label }}
          </label>
        </template>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="hasError && errorMessage" :id="describedBy" class="form-control-error-message">
      <AppIcon name="mdi-alert-circle-outline-outline" />
      {{ errorMessage }}
    </div>

    <!-- Help text -->
    <div v-else-if="helpText" :id="describedBy" class="form-control-help">
      {{ helpText }}
    </div>
  </div>
</template>

<script>
import { CheckIcon } from '@heroicons/vue/24/outline'

import { computed, getCurrentInstance } from 'vue';
import AppIcon from '@/components/ui/AppIcon.vue';

export default {
  name: 'FormControls',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['radio', 'checkbox', 'switch', 'button-group'].includes(value)
    },
    modelValue: {
      type: [String, Number, Boolean, Array],
      default: null
    },
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    name: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    hasError: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: null
    },
    helpText: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary', 'outline'].includes(value)
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  setup(props, { emit }) {
    const instance = getCurrentInstance();

    const inputId = computed(() =>
      props.name ? `${props.name}-${instance.uid}` : `form-control-${instance.uid}`
    );

    const describedBy = computed(() =>
      props.hasError && props.errorMessage ? `${inputId.value}-error` :
      props.helpText ? `${inputId.value}-help` : null
    );

    const isChecked = computed(() => {
      if (props.type === 'checkbox' && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value);
      }
      if (props.type === 'radio') {
        return props.modelValue === props.value;
      }
      return Boolean(props.modelValue);
    });

    const handleChange = (event) => {
      let newValue = event.target.checked;

      if (props.type === 'checkbox' && Array.isArray(props.modelValue)) {
        const currentValue = [...props.modelValue];
        if (newValue) {
          currentValue.push(props.value);
        } else {
          const index = currentValue.indexOf(props.value);
          if (index > -1) {currentValue.splice(index, 1);}
        }
        newValue = currentValue;
      } else if (props.type === 'radio') {
        newValue = props.value;
      }

      emit('update:modelValue', newValue);
      emit('change', newValue, event);
    };

    const handleFocus = (event) => {
      emit('focus', event);
    };

    const handleBlur = (event) => {
      emit('blur', event);
    };

    const handleButtonGroupChange = (event) => {
      const newValue = event.target.value;
      emit('update:modelValue', newValue);
      emit('change', newValue, event);
    };

    const sizeClass = computed(() => {
      const sizeMap = {
        sm: 'btn-group-sm',
        md: '',
        lg: 'btn-group-lg'
      };
      return sizeMap[props.size] || '';
    });

    const getButtonClass = (option) => {
      const isSelected = props.modelValue === option.value;
      const baseClass = isSelected ? 'btn-primary' : 'btn-outline-secondary';

      if (props.variant === 'primary') {
        return isSelected ? 'btn-primary' : 'btn-outline-primary';
      } else if (props.variant === 'secondary') {
        return isSelected ? 'btn-secondary' : 'btn-outline-secondary';
      } else if (props.variant === 'outline') {
        return isSelected ? 'btn-outline-primary active' : 'btn-outline-secondary';
      }

      return baseClass;
    };

    return {
      inputId,
      describedBy,
      isChecked,
      sizeClass,
      handleChange,
      handleFocus,
      handleBlur,
      handleButtonGroupChange,
      getButtonClass
    };
  }
};
</script>

<style scoped>
.form-control-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Common styles */
.form-radio, .form-checkbox, .form-switch {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
}

.form-radio-input, .form-checkbox-input, .form-switch-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.form-radio-label, .form-checkbox-label, .form-switch-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary-600);
  transition: all var(--transition-normal);
  min-height: 44px; /* WCAG minimum target size */
  padding: 0.5rem 0;
}

.form-control-text {
  user-select: none;
  flex: 1;
}

/* Radio button specific styles */
.form-radio-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-primary-500);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.form-radio-indicator i {
  font-size: 16px;
  color: var(--color-primary);
  transition: all var(--transition-normal);
}

.form-radio-input:checked + .form-radio-label .form-radio-indicator {
  border-color: var(--color-primary);
  background: var(--bg-primary-500);
}

.form-radio-input:focus + .form-radio-label .form-radio-indicator {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.form-radio-label:hover .form-radio-indicator {
  border-color: var(--color-primary-light);
  background: var(--bg-secondary-500);
}

/* Checkbox specific styles */
.form-checkbox-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary-500);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.form-checkbox-indicator i {
  font-size: 16px;
  color: var(--color-primary);
  transition: all var(--transition-normal);
}

.form-checkbox-input:checked + .form-checkbox-label .form-checkbox-indicator {
  border-color: var(--color-primary);
  background: var(--bg-primary-500);
}

.form-checkbox-input:focus + .form-checkbox-label .form-checkbox-indicator {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.form-checkbox-label:hover .form-checkbox-indicator {
  border-color: var(--color-primary-light);
  background: var(--bg-secondary-500);
}

/* Switch specific styles */
.form-switch-track {
  position: relative;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.form-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--text-secondary);
  transition: all var(--transition-normal);
  transform: translateX(0);
}

.form-switch-input:checked + .form-switch-label .form-switch-track {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.form-switch-input:checked + .form-switch-label .form-switch-thumb {
  background: var(--bg-primary-500);
  transform: translateX(20px);
}

.form-switch-input:focus + .form-switch-label .form-switch-track {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.form-switch-label:hover .form-switch-track {
  background: var(--bg-secondary-500);
}

.form-switch-input:checked + .form-switch-label:hover .form-switch-track {
  background: var(--color-primary-light);
}

/* Disabled states */
.form-radio-disabled, .form-checkbox-disabled, .form-switch-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-radio-disabled .form-radio-label,
.form-checkbox-disabled .form-checkbox-label,
.form-switch-disabled .form-switch-label {
  cursor: not-allowed;
  color: var(--text-disabled);
}

/* Error states */
.form-control-error {
  color: var(--color-error) !important;
}

.form-control-error .form-radio-indicator,
.form-control-error .form-checkbox-indicator {
  border-color: var(--color-error) !important;
}

.form-control-error .form-switch-track {
  border-color: var(--color-error) !important;
}

/* Error message */
.form-control-error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-error);
  margin-top: 0.25rem;
}

.form-control-error-message i {
  font-size: 1rem;
  flex-shrink: 0;
}

/* Help text */
.form-control-help {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Dark mode support using data-theme attribute */
[data-theme="dark"] .form-radio-indicator,
[data-theme="dark"] .form-checkbox-indicator {
  background: var(--bg-primary-500);
  border-color: var(--border-color);
  color: var(--text-primary-600);
}

[data-theme="dark"] .form-switch-track {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

[data-theme="dark"] .form-switch-thumb {
  background: var(--text-secondary);
}

[data-theme="dark"] .form-switch-input:checked + .form-switch-label .form-switch-thumb {
  background: var(--bg-primary-500);
}

[data-theme="dark"] .form-radio-label,
[data-theme="dark"] .form-checkbox-label,
[data-theme="dark"] .form-switch-label {
  color: var(--text-primary-600);
}

/* Animation for state changes */
.form-radio-indicator, .form-checkbox-indicator, .form-switch-track, .form-switch-thumb {
  animation: form-control-focus 0.2s ease-out;
}

@keyframes form-control-focus {
  0% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-radio-indicator, .form-checkbox-indicator, .form-switch-track {
    border-width: 3px;
  }
}

/* Button Group specific styles */
.form-button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-button-group-inline {
  flex-direction: flex flex-wrap;
  align-items: center;
}

.form-button-group .btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius-md, 6px);
  overflow: hidden;
}

.form-button-group .btn {
  border: 1px solid var(--border-color, #dee2e6);
  transition: all var(--transition-normal, 0.15s ease-in-out);
  font-weight: 500;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.form-button-group .btn:focus {
  outline: 2px solid var(--color-focus-ring, #0066ff40);
  outline-offset: 2px;
  z-index: 3;
}

.form-button-group .btn:hover {
  background-color: var(--bg-secondary-500, #f8f9fa);
  border-color: var(--color-primary-light, #4dabf7);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.form-button-group .btn.btn-primary:hover,
.form-button-group .btn.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

/* Button group disabled state */
.form-button-group-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-button-group-disabled .btn {
  cursor: not-allowed;
  color: var(--text-disabled, #6c757d);
}

/* Button group animations */
.form-button-group .btn {
  animation: form-button-focus 0.2s ease-out;
}

@keyframes form-button-focus {
  0% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

/* Improved spacing for icons in button groups */
.form-button-group .btn i {
  font-size: 1rem;
  line-height: 1;
}

/* Enhanced active states */
.form-button-group .btn-check:checked + .btn {
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.25);
}

/* Dark mode support for button groups */
@media (prefers-color-scheme: dark) {
  .form-button-group .btn-group {
    box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
  }

  .form-button-group .btn {
    border-color: var(--border-color-dark, #495057);
  }

  .form-button-group .btn:hover {
    background-color: var(--bg-secondary-500-dark, #343a40);
    border-color: var(--color-primary-light-dark, #74c0fc);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .form-radio-indicator, .form-checkbox-indicator, .form-switch-track, .form-switch-thumb,
  .form-radio-label, .form-checkbox-label, .form-switch-label, .form-button-group .btn {
    transition: none;
  }

  .form-radio-indicator, .form-checkbox-indicator, .form-switch-track, .form-switch-thumb,
  .form-button-group .btn {
    animation: none;
  }

  .form-button-group .btn:hover {
    transform: none;
  }
}
</style>
