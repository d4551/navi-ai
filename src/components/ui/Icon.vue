<template>
  <i 
    :class="iconClasses"
    :style="iconStyles"
    :aria-label="ariaLabel"
  ></i>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: string | number
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '16',
  color: 'currentColor',
  className: ''
})

const iconClasses = computed(() => [
  'mdi',
  `mdi-${props.name}`,
  props.className
])

const iconStyles = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size
}))

const ariaLabel = computed(() => `${props.name} icon`)
</script>

<style scoped>
.mdi {
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}
</style>
