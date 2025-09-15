<template>
  <div :class="['skeleton', classes]" :style="styleObject" class="font-sans"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{width?: string; height?: string; classes?: string}>(), { width: '100%', height: '12px', classes: '' })

const styleObject = computed(() => ({ width: props.width, height: props.height, borderRadius: '6px' }))
</script>
