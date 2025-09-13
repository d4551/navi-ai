<template>
  <div :class="['skeleton', classes]" :style="styleObject"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {} from "vue";

const _props = withDefaults(
  defineProps<{ width?: string; height?: string; classes?: string }>(),
  { width: "100%", height: "12px", classes: "" },
);

const styleObject = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: "6px",
}));
</script>
