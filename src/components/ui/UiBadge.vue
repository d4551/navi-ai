<template>
  <span :class="['ui-badge', classes]" class="font-sans">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{classes?: string}>(), { classes: '' })
</script>
