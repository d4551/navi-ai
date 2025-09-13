<template>
  <img :src="logoSrc" :alt="altText" class="app-logo" />
</template>

<script setup>
import { computed, reactive } from 'vue';

import {} from "vue";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";

const _props = defineProps({
  altText: {
    type: String,
    default: "NAVI Logo",
  },
  // Explicit src overrides theme switching when provided
  src: {
    type: String,
    default: null,
  },
  // Customizable light/dark sources with sensible defaults
  lightSrc: {
    type: String,
    default: "/logoLight.svg",
  },
  darkSrc: {
    type: String,
    default: "/logoDark.svg",
  },
});

// Use the reactive color scheme from the unified theme
const { colorScheme } = useUnifiedTheme();

const logoSrc = computed(() => {
  // If a specific src is provided, always use it
  if (props.src) return props.src;
  // Otherwise, switch by theme using provided light/dark sources
  return colorScheme.value === "dark" ? props.darkSrc : props.lightSrc;
});
</script>

<style scoped>
.app-logo {
  height: 24px; /* Adjust as needed for your design */
  width: auto;
  transition: filter 0.3s ease-in-out;
}

[data-theme="dark"] .app-logo {
  filter: brightness(
}
</style>
