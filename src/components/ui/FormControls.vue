<template>
  <div class="form-control-wrapper">
    <!-- Radio Button -->
    <div
      v-if="type === 'radio'"
      class="form-radio"
      :class="{ 'form-radio-disabled': disabled }"
    >
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
    <div
      v-else-if="type === 'checkbox'"
      class="form-checkbox"
      :class="{ 'form-checkbox-disabled': disabled }"
    >
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
          <AppIcon name="mdi-checkbox-blank-outline" />
          <AppIcon name="mdi-checkbox-marked" />
        </span>
        <span class="form-control-text">{{ label }}</span>
      </label>
    </div>

    <!-- Switch/Toggle -->
    <div
      v-else-if="type === 'switch'"
      class="form-switch"
      :class="{ 'form-switch-disabled': disabled }"
    >
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
    <div
      v-else-if="type === 'button-group'"
      class="form-button-group"
      :class="{
        'form-button-group-disabled': disabled,
        'form-button-group-inline': inline,
      }"
    >
      <div
        class="btn-group"
        :class="sizeClass"
        role="group"
        :aria-label="label"
      >
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
            <i v-if="option.icon" :class="option.icon" class="me-1"></i>
            {{ option.label }}
          </label>
        </template>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="hasError && errorMessage"
      :id="describedBy"
      class="form-control-error-message"
    >
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
import { computed, getCurrentInstance } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

export default {
  name: "FormControls",
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) =>
        ["radio", "checkbox", "switch", "button-group"].includes(value),
    },
    modelValue: {
      type: [String, Number, Boolean, Array],
      default: null,
    },
    value: {
      type: [String, Number, Boolean],
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    helpText: {
      type: String,
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    size: {
      type: String,
      default: "md",
      validator: (value) => ["sm", "md", "lg"].includes(value),
    },
    variant: {
      type: String,
      default: "default",
      validator: (value) =>
        ["default", "primary", "secondary", "outline"].includes(value),
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "change", "focus", "blur"],
  setup(props, { emit }) {
    const instance = getCurrentInstance();

    const inputId = computed(() =>
      props.name
        ? `${props.name}-${instance.uid}`
        : `form-control-${instance.uid}`,
    );

    const describedBy = computed(() =>
      props.hasError && props.errorMessage
        ? `${inputId.value}-error`
        : props.helpText
          ? `${inputId.value}-help`
          : null,
    );

    const isChecked = computed(() => {
      if (props.type === "checkbox" && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value);
      }
      if (props.type === "radio") {
        return props.modelValue === props.value;
      }
      return Boolean(props.modelValue);
    });

    const handleChange = (event) => {
      let newValue = event.target.checked;

      if (props.type === "checkbox" && Array.isArray(props.modelValue)) {
        const currentValue = [...props.modelValue];
        if (newValue) {
          currentValue.push(props.value);
        } else {
          const index = currentValue.indexOf(props.value);
          if (index > -1) {
            currentValue.splice(index, 1);
          }
        }
        newValue = currentValue;
      } else if (props.type === "radio") {
        newValue = props.value;
      }

      emit("update:modelValue", newValue);
      emit("change", newValue, event);
    };

    const handleFocus = (event) => {
      emit("focus", event);
    };

    const handleBlur = (event) => {
      emit("blur", event);
    };

    const handleButtonGroupChange = (event) => {
      const newValue = event.target.value;
      emit("update:modelValue", newValue);
      emit("change", newValue, event);
    };

    const sizeClass = computed(() => {
      const sizeMap = {
        sm: "btn-group-sm",
        md: "",
        lg: "btn-group-lg",
      };
      return sizeMap[props.size] || "";
    });

    const getButtonClass = (option) => {
      const isSelected = props.modelValue === option.value;
      const baseClass = isSelected ? "btn-primary" : "btn-outline-secondary";

      if (props.variant === "primary") {
        return isSelected ? "btn-primary" : "btn-outline-primary";
      } else if (props.variant === "secondary") {
        return isSelected ? "btn-secondary" : "btn-outline-secondary";
      } else if (props.variant === "outline") {
        return isSelected
          ? "btn-outline-primary active"
          : "btn-outline-secondary";
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
      getButtonClass,
    };
  },
};
</script>

<style scoped>
.form-control-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-radio,
.form-checkbox,
.form-switch {
  display: flex;
  align-items: flex-start;
  position: relative;
}

.form-radio-input,
.form-checkbox-input,
.form-switch-input {
  position: absolute;
  pointer-events: none;
}

.form-radio-label,
.form-checkbox-label,
.form-switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.form-control-text {
  user-select: none;
}

.form-radio-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.form-radio-indicator i {
  color: var(--color-primary);
  transition: all var(--transition-normal);
}

.form-radio-input:checked + .form-radio-label .form-radio-indicator {
  border-color: var(--color-primary);
  background: var(--bg-primary);
}

.form-radio-input:focus + .form-radio-label .form-radio-indicator {
}

.form-radio-label:hover .form-radio-indicator {
  border-color: var(--color-primary-light);
  background: var(--bg-secondary);
}

.form-checkbox-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.form-checkbox-indicator i {
  color: var(--color-primary);
  transition: all var(--transition-normal);
}

.form-checkbox-input:checked + .form-checkbox-label .form-checkbox-indicator {
  border-color: var(--color-primary);
  background: var(--bg-primary);
}

.form-checkbox-input:focus + .form-checkbox-label .form-checkbox-indicator {
}

.form-checkbox-label:hover .form-checkbox-indicator {
  border-color: var(--color-primary-light);
  background: var(--bg-secondary);
}

.form-switch-track {
  position: relative;
  background: var(--bg-tertiary);
  transition: all var(--transition-normal);
}

.form-switch-thumb {
  position: absolute;
  background: var(--text-secondary);
  transition: all var(--transition-normal);
}

.form-switch-input:checked + .form-switch-label .form-switch-track {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.form-switch-input:checked + .form-switch-label .form-switch-thumb {
  background: var(--bg-primary);
}

.form-switch-input:focus + .form-switch-label .form-switch-track {
}

.form-switch-label:hover .form-switch-track {
  background: var(--bg-secondary);
}

.form-switch-input:checked + .form-switch-label:hover .form-switch-track {
  background: var(--color-primary-light);
}

.form-radio-disabled,
.form-checkbox-disabled,
.form-switch-disabled {
  pointer-events: none;
}

.form-radio-disabled .form-radio-label,
.form-checkbox-disabled .form-checkbox-label,
.form-switch-disabled .form-switch-label {
  cursor: not-allowed;
  color: var(--text-disabled);
}

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

.form-control-error-message {
  display: flex;
  align-items: center;
  color: var(--color-error);
}

.form-control-error-message i {
}

.form-control-help {
  color: var(--text-secondary);
}

[data-theme="dark"] .form-radio-indicator,
[data-theme="dark"] .form-checkbox-indicator {
  background: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .form-switch-track {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

[data-theme="dark"] .form-switch-thumb {
  background: var(--text-secondary);
}

[data-theme="dark"]
  .form-switch-input:checked
  + .form-switch-label
  .form-switch-thumb {
  background: var(--bg-primary);
}

[data-theme="dark"] .form-radio-label,
[data-theme="dark"] .form-checkbox-label,
[data-theme="dark"] .form-switch-label {
  color: var(--text-primary);
}

.form-radio-indicator,
.form-checkbox-indicator,
.form-switch-track,
.form-switch-thumb {
}

@keyframes form-control-focus {
  }
  }
}

@media (prefers-contrast: high) {
  .form-radio-indicator,
  .form-checkbox-indicator,
  .form-switch-track {
  }
}

.form-button-group {
  display: flex;
  flex-direction: column;
}

.form-button-group-inline {
  flex-direction: row;
  align-items: center;
}

.form-button-group .btn-group {
  overflow: hidden;
}

.form-button-group .btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-button-group .btn:focus {
}

.form-button-group .btn:hover {
}

.form-button-group .btn.btn-primary:hover,
.form-button-group .btn.btn-secondary:hover {
}

.form-button-group-disabled {
  pointer-events: none;
}

.form-button-group-disabled .btn {
  cursor: not-allowed;
}

.form-button-group .btn {
}

@keyframes form-button-focus {
  }
  }
}

.form-button-group .btn i {
}

.form-button-group .btn-check:checked + .btn {
}

@media (prefers-color-scheme: dark) {
  .form-button-group .btn-group {
  }

  .form-button-group .btn {
  }

  .form-button-group .btn:hover {
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-radio-indicator,
  .form-checkbox-indicator,
  .form-switch-track,
  .form-switch-thumb,
  .form-radio-label,
  .form-checkbox-label,
  .form-switch-label,
  .form-button-group .btn {
    transition: none;
  }

  .form-radio-indicator,
  .form-checkbox-indicator,
  .form-switch-track,
  .form-switch-thumb,
  .form-button-group .btn {
    animation: none;
  }

  .form-button-group .btn:hover {
    transform: none;
  }
}
</style>
