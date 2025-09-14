<template>
  <div :class="textFieldClasses">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="mui-input-required">*</span>
    </label>

    <div class="mui-input-container">
      <div v-if="startAdornment" class="mui-input-adornment mui-input-start">
        <slot name="startAdornment">
          <i
            v-if="typeof startAdornment === 'string'"
            :class="normalizeIcon(startAdornment)"
          />
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
          <i
            v-if="typeof endAdornment === 'string'"
            :class="normalizeIcon(endAdornment)"
          />
          <span v-else>{{ endAdornment }}</span>
        </slot>
      </div>
    </div>

    <div
      v-if="helperText || error"
      class="mui-input-helper-text"
      :class="{ 'mui-input-error': error }"
    >
      {{ error || helperText }}
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue';

import { computed, ref, nextTick } from "vue";
import { createId } from "@paralleldrive/cuid2";

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
  setup(_props, { emit }) {
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
        "mui-textfield-has-value":
          props.modelValue !== "" && props.modelValue != null,
      },
    ]);

    const labelClasses = computed(() => [
      "mui-input-label",
      {
        "mui-input-label-shrink":
          isFocused.value ||
          (props.modelValue !== "" && props.modelValue != null),
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
      if (c.startsWith("bi-")) return ["bi", c];
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
  font-family: "Electrolize", "Roboto", sans-serif;
  position: relative;
  margin-bottom: 16px;
  min-width: 0;
}

.mui-textfield-full-width {
  width: 100%;
}

.mui-input-label {
  position: absolute;
  transform-origin: top left;
  transition:
  pointer-events: none;
}

.mui-input-label-shrink {
}

.mui-input-label-error {
}

.mui-input-label-disabled {
}

[data-theme="dark"] .mui-input-label {
}

[data-theme="dark"] .mui-input-label-disabled {
}

.mui-input-required {
}

.mui-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.mui-input {
  font-family: "Electrolize", "Roboto", sans-serif;
  box-sizing: border-box;
  cursor: text;
  display: flex;
  align-items: center;
  position: relative;
  border: none;
  outline: none;
  background: transparent;
  animation-name: mui-auto-fill-cancel;
}

.mui-input::placeholder {
}

[data-theme="dark"] .mui-input {
}

[data-theme="dark"] .mui-input::placeholder {
}

.mui-textfield-outlined .mui-input-container {
  position: relative;
  background-color: transparent;
}

.mui-textfield-outlined .mui-input-container::before {
  content: "";
  position: absolute;
  pointer-events: none;
}

.mui-textfield-outlined.mui-textfield-focused .mui-input-container::before {
}

.mui-textfield-outlined.mui-textfield-error .mui-input-container::before {
}

.mui-textfield-outlined.mui-textfield-disabled .mui-input-container::before {
}

[data-theme="dark"] .mui-textfield-outlined .mui-input-container::before {
}

[data-theme="dark"]
  .mui-textfield-outlined.mui-textfield-disabled
  .mui-input-container::before {
}

.mui-textfield-outlined .mui-input {
}

.mui-textfield-outlined .mui-input-with-start {
}

.mui-textfield-outlined .mui-input-with-end {
}

.mui-textfield-filled .mui-input-container {
  position: relative;
}

.mui-textfield-filled .mui-input-container::after {
  content: "";
  position: absolute;
}

.mui-textfield-filled.mui-textfield-focused .mui-input-container::after {
}

.mui-textfield-filled .mui-input-container::before {
  content: "";
  position: absolute;
}

.mui-textfield-filled .mui-input {
}

.mui-textfield-filled .mui-input-label {
}

.mui-textfield-filled .mui-input-label-shrink {
}

[data-theme="dark"] .mui-textfield-filled .mui-input-container {
}

.mui-textfield-standard .mui-input-container::after {
  content: "";
  position: absolute;
}

.mui-textfield-standard.mui-textfield-focused .mui-input-container::after {
}

.mui-textfield-standard .mui-input-container::before {
  content: "";
  position: absolute;
}

.mui-textfield-standard .mui-input {
}

.mui-textfield-standard .mui-input-label {
}

.mui-textfield-standard .mui-input-label-shrink {
}

.mui-textfield-size-small .mui-input {
}

.mui-textfield-size-small .mui-input-label {
}

.mui-textfield-size-small .mui-input-label-shrink {
}

.mui-textfield-size-large .mui-input {
}

.mui-textfield-size-large .mui-input-label {
}

.mui-textfield-size-large .mui-input-label-shrink {
}

.mui-input-adornment {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.mui-input-start {
}

.mui-input-end {
}

[data-theme="dark"] .mui-input-adornment {
}

.mui-input-helper-text {
}

.mui-input-helper-text.mui-input-error {
}

[data-theme="dark"] .mui-input-helper-text {
}

.mui-textfield-disabled .mui-input {
  cursor: default;
}

[data-theme="dark"] .mui-textfield-disabled .mui-input {
}

@keyframes mui-auto-fill-cancel {
  to {
    background: transparent;
  }
}

.mui-input:-webkit-autofill {
  animation-name: mui-auto-fill;
  animation-fill-mode: both;
}

@keyframes mui-auto-fill {
  to {
    background: transparent;
  }
}

.mui-input:focus-visible {
}

@media (prefers-reduced-motion: reduce) {
  .mui-input-label,
  .mui-input-container::before,
  .mui-input-container::after {
    transition: none;
  }
}
</style>
