<template>
  <!--
    ModernButton is now a thin wrapper around UnifiedButton to ensure
    one master design system and consistent glasmorphic styling.
    All props are forwarded; `icon` maps to `leadingIcon` when text exists,
    or to `icon` with `iconOnly` when no default slot is provided.
  -->
  <UnifiedButton
    v-bind="forwardedAttrs"
    :variant="variant"
    :color="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :icon-only="iconOnly"
    :icon="iconOnly ? icon : ''"
    :leading-icon="!iconOnly && icon ? icon : ''"
    @click="$emit('click', $event)"
  >
    <slot />
  </UnifiedButton>
</template>

<script setup lang="ts">
import { computed, useSlots, useAttrs } from 'vue'
import UnifiedButton from './UnifiedButton.vue'

interface Props {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'ghost'
    | 'outline'
    | 'gaming'
    | 'cyber'
    | 'glass'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string | undefined
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  icon: undefined,
  loading: false,
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()

const hasText = computed(() => Boolean(slots.default))
const iconOnly = computed(() => Boolean(props.icon) && !hasText.value)

// Forward non-prop attrs (like aria-*, class, style, to/href)
const attrs = useAttrs()
const forwardedAttrs = computed(() => attrs)
</script>

<style scoped>
/* No additional styles – delegates to UnifiedButton’s master styles */
</style>
