<template>
  <div :class="['ui-chip', 'glass-badge', mappedClasses]">
    <slot />
    <button
      v-if="closable"
      class="chip-close"
      type="button"
      aria-label="Remove"
      @click.stop="emit('close')"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {} from "vue";
const _props = withDefaults(
  defineProps<{ classes?: string; closable?: boolean }>(),
  { classes: "", closable: false },
);
const closable = props.closable;
const _emit = defineEmits<{ close: [] }>();
const mappedClasses = computed(() => {
  const cls = props.classes || "";
  return cls
    .replace(/\bchip-compact\b/g, "glass-badge-compact")
    .replace(/\bchip-primary\b/g, "glass-badge-primary")
    .replace(/\bchip-success\b/g, "glass-badge-success")
    .replace(/\bchip-info\b/g, "glass-badge-info")
    .replace(/\bchip-warning\b/g, "glass-badge-warning")
    .replace(/\bchip-danger\b/g, "glass-badge-danger")
    .replace(/\bchip\b/g, "")
    .trim();
});
</script>

<style scoped>
.chip-close {
  margin-left: var(--spacing-1-5);
  border: 0;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  line-height: 1;
}
.chip-close:hover {
  opacity: 0.75;
}
</style>
