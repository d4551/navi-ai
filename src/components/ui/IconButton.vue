<template>
  <UnifiedButton
    v-bind="attrs"
    :variant="variant"
    :size="size"
    :icon-only="true"
    :icon="icon"
    :aria-label="ariaLabel || labelFromIcon"
    :disabled="disabled"
    :ripple="ripple"
    class="font-sans"
    @click="$emit('click', $event)"
  >
  </UnifiedButton>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import UnifiedButton from './UnifiedButton.vue'

interface Props {
  icon: string
  variant?:
    | 'glass'
    | 'ghost'
    | 'primary'
    | 'secondary'
    | 'gaming'
    | 'cyber'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ariaLabel?: string
  disabled?: boolean
  ripple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'glass',
  size: 'md',
  ariaLabel: '',
  disabled: false,
  ripple: true,
})

defineEmits<{ click: [event: MouseEvent] }>()

const attrs = useAttrs()
const labelFromIcon = computed(() =>
  (props.icon || '').replace(/^mdi-/, '').replace(/-/g, ' ')
)
</script>

<style scoped>
/* Thin wrapper – styling comes from UnifiedButton */
</style>
