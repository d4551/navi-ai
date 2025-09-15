<template>
  <div :class="textFieldClasses">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="mui-input-required">*</span>
    </label>
    
    <div class="mui-input-container">
      <div v-if="startAdornment" class="mui-input-adornment mui-input-start">
        <slot name="startAdornment">
          <i v-if="typeof startAdornment === 'string'" :class="normalizeIcon(startAdornment)" />
          <span v-else>{{ startAdornment }}</span>
        </slot>
      </div>
      
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="error ? 'true' : 'false'"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
      
      <div v-if="endAdornment" class="mui-input-adornment mui-input-end">
        <slot name="endAdornment">
          <i v-if="typeof endAdornment === 'string'" :class="normalizeIcon(endAdornment)" />
          <span v-else>{{ endAdornment }}</span>
        </slot>
      </div>
    </div>
    
    <div v-if="helperText || error" class="mui-input-helper-text" :class="{ 'mui-input-error': error }">
      {{ error || helperText }}
    </div>
  </div>
</template>

<script>
import { computed, ref, nextTick } from 'vue'
import { createId } from '@paralleldrive/cuid2';

export default {
  name: "MuiTextField",
  props: {
    modelValue: { type: [String, Number], default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    type: { type: String, default: "text" },
    variant: {
      type: String,
      default: "outlined",
      validator: (value) => ["outlined", "filled", "standard"].includes(value),
    },
    size: {
      type: String,
      default: "medium",
      validator: (value) => ["small", "medium", "large"].includes(value),
    },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: "" },
    helperText: { type: String, default: "" },
    autocomplete: { type: String, default: "" },
    startAdornment: { type: [String, Number], default: null },
    endAdornment: { type: [String, Number], default: null },
    fullWidth: { type: Boolean, default: false },
    ariaDescribedby: { type: String, default: "" },
  },
  emits: ["update:modelValue", "blur", "focus", "keydown"],
  setup(props, { emit }) {
  const inputRef = ref(null);
  const isFocused = ref(false);
  const inputId = `mui-input-${createId()}`;

    const textFieldClasses = computed(() => [
      "mui-textfield",
      `mui-textfield-${props.variant}`,
      `mui-textfield-size-${props.size}`,
      {
        "mui-textfield-disabled": props.disabled,
        "mui-textfield-error": props.error,
        "mui-textfield-focused": isFocused.value,
        "mui-textfield-full-width": props.fullWidth,
        "mui-textfield-has-value": props.modelValue !== "" && props.modelValue != null,
      },
    ]);

    const labelClasses = computed(() => [
      "mui-input-label",
      {
        "mui-input-label-shrink": isFocused.value || props.modelValue !== "" && props.modelValue != null,
        "mui-input-label-error": props.error,
        "mui-input-label-disabled": props.disabled,
      },
    ]);

    const inputClasses = computed(() => [
      "mui-input",
      {
        "mui-input-with-start": props.startAdornment,
        "mui-input-with-end": props.endAdornment,
      },
    ]);

    const normalizeIcon = (cls) => {
      if (!cls) return null;
      const c = String(cls).trim();
      if (c.startsWith("mdi-")) return ["mdi", c];
      if (c === "mdi" || c.startsWith("mdi ")) return c;
      // Bootstrap icons (bi-) are no longer supported - use Heroicons instead
      return c;
    };

    const handleInput = (event) => {
      emit("update:modelValue", event.target.value);
    };

    const handleFocus = (event) => {
      isFocused.value = true;
      emit("focus", event);
    };

    const handleBlur = (event) => {
      isFocused.value = false;
      emit("blur", event);
    };

    const handleKeydown = (event) => {
      emit("keydown", event);
    };

    const focus = () => {
      nextTick(() => {
        inputRef.value?.focus();
      });
    };

    return {
      inputRef,
      inputId,
      textFieldClasses,
      labelClasses,
      inputClasses,
      normalizeIcon,
      handleInput,
      handleFocus,
      handleBlur,
      handleKeydown,
      focus,
    };
  },
};
</script>

<style scoped>
.mui-textfield {
  font-family: 'Electrolize', 'Roboto', sans-serif;
  position: relative;
  margin-bottom: 16px;
  min-width: 0;
}

.mui-textfield-full-width {
  width: 100%;
}

/* Label */
.mui-input-label {
  color: var(--text-muted, rgba(0, 0, 0, 0.6));
  font-size: 1rem;
  line-height: 1.4375em;
  letter-spacing: 0.00938em;
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(14px, 16px) scale(1);
  transform-origin: top left;
  transition: color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,
              transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,
              max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
  pointer-events: none;
  z-index: 1;
  max-width: calc(100% - 24px);
}

.mui-input-label-shrink {
  transform: translate(14px, -9px) scale(0.75);
  max-width: calc(133% - 24px);
}

.mui-input-label-error {
  color: var(--color-danger, #d32f2f);
}

.mui-input-label-disabled {
  color: rgba(0, 0, 0, 0.38);
}

[data-theme="dark"] .mui-input-label {
  color: var(--text-muted, rgba(255, 255, 255, 0.7));
}

[data-theme="dark"] .mui-input-label-disabled {
  color: rgba(255, 255, 255, 0.5);
}

.mui-input-required {
  color: var(--color-danger, #d32f2f);
  margin-left: 2px;
}

/* Input Container */
.mui-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

/* Input */
.mui-input {
  font-family: 'Electrolize', 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.4375em;
  letter-spacing: 0.00938em;
  color: var(--text-primary, rgba(0, 0, 0, 0.87));
  box-sizing: border-box;
  cursor: text;
  display: flex;
  align-items: center;
  position: relative;
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  min-width: 0;
  width: 100%;
  animation-name: mui-auto-fill-cancel;
  animation-duration: 10ms;
}

.mui-input::placeholder {
  color: var(--text-muted, rgba(0, 0, 0, 0.42));
  opacity: 1;
}

[data-theme="dark"] .mui-input {
  color: var(--text-primary, rgba(255, 255, 255, 0.87));
}

[data-theme="dark"] .mui-input::placeholder {
  color: var(--text-muted, rgba(255, 255, 255, 0.5));
}

/* Outlined variant */
.mui-textfield-outlined .mui-input-container {
  border-radius: 4px;
  position: relative;
  background-color: transparent;
}

.mui-textfield-outlined .mui-input-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid var(--glass-border, rgba(0, 0, 0, 0.23));
  border-radius: 4px;
  pointer-events: none;
  transition: border-color 200ms cubic-bezier(0.0, 0, 0.2, 1);
}

.mui-textfield-outlined.mui-textfield-focused .mui-input-container::before {
  border-color: var(--color-primary, #1976d2);
  border-width: 2px;
}

.mui-textfield-outlined.mui-textfield-error .mui-input-container::before {
  border-color: var(--color-danger, #d32f2f);
}

.mui-textfield-outlined.mui-textfield-disabled .mui-input-container::before {
  border-color: rgba(0, 0, 0, 0.26);
}

[data-theme="dark"] .mui-textfield-outlined .mui-input-container::before {
  border-color: var(--glass-border, rgba(255, 255, 255, 0.23));
}

[data-theme="dark"] .mui-textfield-outlined.mui-textfield-disabled .mui-input-container::before {
  border-color: rgba(255, 255, 255, 0.3);
}

.mui-textfield-outlined .mui-input {
  padding: 16px 14px;
}

.mui-textfield-outlined .mui-input-with-start {
  padding-left: 0;
}

.mui-textfield-outlined .mui-input-with-end {
  padding-right: 0;
}

/* Filled variant */
.mui-textfield-filled .mui-input-container {
  background-color: var(--bg-secondary, rgba(0, 0, 0, 0.06));
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: background-color 200ms cubic-bezier(0.0, 0, 0.2, 1);
}

.mui-textfield-filled .mui-input-container::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary, #1976d2);
  transform: scaleX(0);
  transition: transform 200ms cubic-bezier(0.0, 0, 0.2, 1);
}

.mui-textfield-filled.mui-textfield-focused .mui-input-container::after {
  transform: scaleX(1);
}

.mui-textfield-filled .mui-input-container::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  background-color: var(--glass-border, rgba(0, 0, 0, 0.42));
  transition: border-bottom-color 200ms cubic-bezier(0.0, 0, 0.2, 1);
}

.mui-textfield-filled .mui-input {
  padding: 25px 12px 8px;
}

.mui-textfield-filled .mui-input-label {
  transform: translate(12px, 20px) scale(1);
}

.mui-textfield-filled .mui-input-label-shrink {
  transform: translate(12px, 7px) scale(0.75);
}

[data-theme="dark"] .mui-textfield-filled .mui-input-container {
  background-color: var(--bg-secondary, rgba(255, 255, 255, 0.09));
}

/* Standard variant */
.mui-textfield-standard .mui-input-container::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary, #1976d2);
  transform: scaleX(0);
  transition: transform 200ms cubic-bezier(0.0, 0, 0.2, 1);
}

.mui-textfield-standard.mui-textfield-focused .mui-input-container::after {
  transform: scaleX(1);
}

.mui-textfield-standard .mui-input-container::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  background-color: var(--glass-border, rgba(0, 0, 0, 0.42));
}

.mui-textfield-standard .mui-input {
  padding: 4px 0 5px;
}

.mui-textfield-standard .mui-input-label {
  transform: translate(0, 20px) scale(1);
}

.mui-textfield-standard .mui-input-label-shrink {
  transform: translate(0, -1.5px) scale(0.75);
}

/* Size variants */
.mui-textfield-size-small .mui-input {
  padding: 8px 14px;
  font-size: 0.875rem;
}

.mui-textfield-size-small .mui-input-label {
  font-size: 0.875rem;
  transform: translate(14px, 12px) scale(1);
}

.mui-textfield-size-small .mui-input-label-shrink {
  transform: translate(14px, -6px) scale(0.75);
}

.mui-textfield-size-large .mui-input {
  padding: 20px 14px;
  font-size: 1.125rem;
}

.mui-textfield-size-large .mui-input-label {
  font-size: 1.125rem;
  transform: translate(14px, 20px) scale(1);
}

.mui-textfield-size-large .mui-input-label-shrink {
  transform: translate(14px, -9px) scale(0.75);
}

/* Adornments */
.mui-input-adornment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, rgba(0, 0, 0, 0.54));
  white-space: nowrap;
  flex-shrink: 0;
}

.mui-input-start {
  margin-right: 8px;
  padding-left: 14px;
}

.mui-input-end {
  margin-left: 8px;
  padding-right: 14px;
}

[data-theme="dark"] .mui-input-adornment {
  color: var(--text-muted, rgba(255, 255, 255, 0.7));
}

/* Helper text */
.mui-input-helper-text {
  color: var(--text-muted, rgba(0, 0, 0, 0.6));
  font-size: 0.75rem;
  line-height: 1.66;
  letter-spacing: 0.03333em;
  margin: 3px 14px 0;
}

.mui-input-helper-text.mui-input-error {
  color: var(--color-danger, #d32f2f);
}

[data-theme="dark"] .mui-input-helper-text {
  color: var(--text-muted, rgba(255, 255, 255, 0.7));
}

/* Disabled state */
.mui-textfield-disabled .mui-input {
  color: rgba(0, 0, 0, 0.38);
  cursor: default;
}

[data-theme="dark"] .mui-textfield-disabled .mui-input {
  color: rgba(255, 255, 255, 0.5);
}

/* Auto-fill styles */
@keyframes mui-auto-fill-cancel {
  to {
    color: var(--text-primary, rgba(0, 0, 0, 0.87));
    background: transparent;
  }
}

.mui-input:-webkit-autofill {
  animation-name: mui-auto-fill;
  animation-fill-mode: both;
}

@keyframes mui-auto-fill {
  to {
    color: var(--text-primary, rgba(0, 0, 0, 0.87));
    background: transparent;
  }
}

/* Focus visible */
.mui-input:focus-visible {
  outline: 2px solid var(--color-primary, #1976d2);
  outline-offset: 2px;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .mui-input-label,
  .mui-input-container::before,
  .mui-input-container::after {
    transition: none;
  }
}
</style>