<template>
  <div
    :class="['form-field', containerClass, { required: required }]"
    class="text-glass-primary"
  >
    <label
      v-if="label"
      :for="fieldId"
      class="form-label text-gray-700 dark:text-gray-300"
      :class="labelClass"
      :style="labelStyle"
    >
      <AppIcon v-if="labelIcon" :name="labelIcon" class="label-icon" />
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <!-- Input Wrapper with Status Indicator -->
    <div class="input-wrapper">
      <!-- Text Input -->
      <input
        v-if="
          type === 'text' ||
          type === 'email' ||
          type === 'tel' ||
          type === 'number'
        "
        :id="fieldId"
        :value="modelValue"
        :type="type"
        class="form-control glass-input bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-glass-primary placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400"
        :class="[
          inputClass,
          { 'has-value': hasValue, 'is-invalid': errorText },
        ]"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-describedby="helpId"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="fieldId"
        :value="modelValue"
        class="form-control glass-input enhanced-textarea bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-glass-primary placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400"
        :class="[
          inputClass,
          { 'has-value': hasValue, 'is-invalid': errorText },
        ]"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :rows="rows"
        :aria-describedby="helpId"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      ></textarea>

      <!-- Select -->
      <select
        v-else-if="type === 'select'"
        :id="fieldId"
        :value="modelValue"
        class="form-select glass-input bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-glass-primary focus:border-blue-500 dark:focus:border-blue-400"
        :class="[
          inputClass,
          { 'has-value': hasValue, 'is-invalid': errorText },
        ]"
        :required="required"
        :disabled="disabled"
        :aria-describedby="helpId"
        @change="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>

      <!-- Range Input -->
      <input
        v-else-if="type === 'range'"
        :id="fieldId"
        :value="modelValue"
        type="range"
        class="form-range"
        :class="inputClass"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :aria-describedby="helpId"
        @input="$emit('update:modelValue', Number($event.target.value))"
      />

      <!-- Status Indicator -->
      <div v-if="showStatus" class="input-status">
        <AppIcon
          v-if="hasValue && !errorText"
          name="mdi-check"
          class="success-icon"
        />
        <AppIcon
          v-else-if="errorText"
          name="mdi-alert-circle"
          class="error-icon"
        />
      </div>
    </div>

    <!-- Character Count for Textarea -->
    <div v-if="type === 'textarea' && maxLength" class="character-count">
      {{ (modelValue || '').length }}/{{ maxLength }}
    </div>

    <!-- Help Text -->
    <div v-if="helpText" :id="helpId" class="form-hint" :class="helpClass">
      <AppIcon v-if="helpIcon" :name="helpIcon" class="me-1" />
      {{ helpText }}
    </div>

    <!-- Error Text -->
    <div v-if="errorText" class="form-error">
      <AppIcon name="mdi-alert-circle" class="me-1" />
      {{ errorText }}
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const _props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
    validator: value =>
      [
        'text',
        'email',
        'tel',
        'number',
        'textarea',
        'select',
        'range',
      ].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  helpText: {
    type: String,
    default: '',
  },
  errorText: {
    type: String,
    default: '',
  },
  helpIcon: {
    type: String,
    default: '',
  },
  labelIcon: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
  containerClass: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
  labelClass: {
    type: String,
    default: '',
  },
  helpClass: {
    type: String,
    default: '',
  },
  labelStyle: {
    type: String,
    default: '',
  },
  // Range-specific props
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  // Textarea-specific props
  rows: {
    type: Number,
    default: 3,
  },
  maxLength: {
    type: Number,
    default: 0,
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue', 'focus', 'blur'])

// Generate unique field ID
const fieldId = computed(
  () => `field-${Math.random().toString(36).substr(2, 9)}`
)
const helpId = computed(() => `${fieldId.value}-help`)

// Check if field has value for status indicator
const hasValue = computed(() => {
  const value = _props.modelValue
  return (
    value !== null &&
    value !== undefined &&
    value !== '' &&
    String(value).trim().length > 0
  )
})

// Option handling for select fields
const getOptionValue = option => {
  if (typeof option === 'object' && option !== null) {
    return option.value ?? option.id ?? option.key
  }
  return option
}

const getOptionLabel = option => {
  if (typeof option === 'object' && option !== null) {
    return option.label ?? option.name ?? option.text ?? option.value
  }
  return option
}
</script>

<style scoped>
/* Remove local styles - use global enhanced styles from master-theme.css */
/* Only keep component-specific styles if needed */

.error-icon {
  color: var(--color-error-500);
  font-size: var(--font-size-lg);
  transition: color var(--duration-normal);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-field {
    margin-bottom: var(--spacing-3);
  }

  .input-status {
    right: var(--spacing-2);
  }
}
</style>
