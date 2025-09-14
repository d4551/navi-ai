<template>
  <div class="unified-form-field" :class="{ required, valid: isValid, error: hasError }">
    <label v-if="label" class="field-label">
      <AppIcon v-if="icon" :name="icon" size="16" class="field-icon" />
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <div class="field-container">
      <!-- Input Field -->
      <input
        v-if="type !== 'textarea' && type !== 'select'"
        :id="fieldId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="fieldClasses"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <!-- Textarea Field -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="fieldId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows || 4"
        :class="fieldClasses"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      ></textarea>
      
      <!-- Select Field -->
      <select
        v-else-if="type === 'select'"
        :id="fieldId"
        :value="modelValue"
        :disabled="disabled"
        :class="fieldClasses"
        v-bind="$attrs"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Field Actions (optional) -->
      <div v-if="$slots.actions" class="field-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- Helper Text / Validation -->
    <div v-if="helperText || validationMessage || hasError" class="field-feedback">
      <div v-if="hasError" class="field-error">
        <AppIcon name="mdi-alert-circle-outline" size="14" />
        <span>{{ validationMessage || 'This field has an error' }}</span>
      </div>
      <div v-else-if="validationMessage && isValid" class="field-success">
        <AppIcon name="mdi-check-circle-outline" size="14" />
        <span>{{ validationMessage }}</span>
      </div>
      <div v-else-if="helperText" class="field-helper">
        {{ helperText }}
      </div>
    </div>
    
    <!-- Word/Character Counter -->
    <div v-if="showCounter && type === 'textarea'" class="field-counter">
      <span :class="{ 'counter-ideal': isCounterIdeal }">
        {{ wordCount }} {{ counterType === 'words' ? 'words' : 'characters' }}
      </span>
      <span v-if="counterRange" class="counter-range">
        • {{ counterRange }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  validationMessage: {
    type: String,
    default: ''
  },
  hasError: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 4
  },
  options: {
    type: Array,
    default: () => []
  },
  showCounter: {
    type: Boolean,
    default: false
  },
  counterType: {
    type: String,
    default: 'words',
    validator: value => ['words', 'characters'].includes(value)
  },
  counterRange: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  }
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const fieldId = useId()

const isValid = computed(() => {
  if (!props.required) return true
  return props.modelValue && String(props.modelValue).trim().length > 0
})

const wordCount = computed(() => {
  const text = String(props.modelValue || '')
  if (props.counterType === 'words') {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }
  return text.length
})

const isCounterIdeal = computed(() => {
  if (!props.counterRange) return false
  const range = props.counterRange.match(/(\d+)-(\d+)/)
  if (range) {
    const min = parseInt(range[1])
    const max = parseInt(range[2])
    return wordCount.value >= min && wordCount.value <= max
  }
  return false
})

const fieldClasses = computed(() => [
  'field-input',
  `field-input--${props.size}`,
  {
    'field-input--valid': isValid.value && props.modelValue,
    'field-input--error': props.hasError,
    'field-input--disabled': props.disabled
  }
])
</script>

<style scoped>
.unified-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.field-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.field-icon {
  color: var(--text-secondary);
}

.required-indicator {
  color: var(--color-error-500);
  margin-left: 2px;
}

.field-container {
  position: relative;
  display: flex;
  align-items: stretch;
}

.field-input {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.5;
  transition: all var(--duration-fast);
  backdrop-filter: var(--glass-backdrop-filter);
  resize: vertical;
}

.field-input--sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.field-input--lg {
  padding: 0.875rem 1rem;
  font-size: 1rem;
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 59, 130, 246), 0.1);
}

.field-input:hover:not(:focus):not(:disabled) {
  border-color: var(--color-primary-300);
}

.field-input--valid {
  border-color: var(--color-success-400);
}

.field-input--error {
  border-color: var(--color-error-400);
}

.field-input--disabled {
  background: var(--surface-container);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.field-actions {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.field-feedback {
  font-size: 0.8125rem;
  line-height: 1.4;
}

.field-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-error-600);
}

.field-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-success-600);
}

.field-helper {
  color: var(--text-muted);
}

.field-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 0.75rem;
  color: var(--text-muted);
  justify-content: flex-end;
}

.counter-ideal {
  color: var(--color-success-600);
  font-weight: 500;
}

.counter-range {
  opacity: 0.8;
}

/* Form field validation states */
.unified-form-field.required .field-label::after {
  content: '';
}

.unified-form-field.valid .field-input {
  border-color: var(--color-success-400);
}

.unified-form-field.error .field-input {
  border-color: var(--color-error-400);
}

/* Dark theme adjustments */
[data-theme='dark'] .field-input {
  background: rgba(var(--surface-glass-rgb), 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .field-input:focus {
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 59, 130, 246), 0.2);
}

[data-theme='dark'] .field-input:hover:not(:focus):not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>