<template>
  <span :class="['ui-badge', classes]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{classes?: string}>(), { classes: '' })
</script>
