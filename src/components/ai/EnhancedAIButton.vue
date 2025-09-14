<template>
  <UnifiedButton
    :variant="variant"
    :size="size"
    :leading-icon="icon"
    :loading="loading"
    :disabled="disabled"
    @click="handleClick"
  >
    {{ text || label || 'Run AI' }}
  </UnifiedButton>
</template>

<script setup lang="ts">
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Props {
  action?: string
  text?: string
  label?: string
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: string
  disabled?: boolean
  loading?: boolean
  context?: Record<string, any>
}

const _props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  variant: 'primary',
  disabled: false,
  loading: false,
})

const _emit = defineEmits<{
  (e: 'click'): void
  (e: 'success', payload: any): void
  (e: 'error', err: any): void
}>()

async function handleClick() {
  emit('click')
  try {
    // Minimal passthrough: immediately emit success with current context
    emit('success', {
      action: props.action || 'generic',
      context: props.context || {},
      at: new Date().toISOString(),
    })
  } catch (_e) {
    emit('error', e)
  }
}
</script>

<style scoped>
</style>

