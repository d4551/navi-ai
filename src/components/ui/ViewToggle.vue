<template>
  <div class="view-toggle-group" role="group" :aria-label="ariaLabel">
    <UnifiedButton
      v-for="opt in resolvedOptions"
      :key="opt.value"
      icon-only
      :size="size"
      :variant="modelValue === opt.value ? activeVariant : inactiveVariant"
      :icon="opt.icon"
      :aria-label="opt.label || opt.value"
      @click="onSelect(opt.value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface ToggleOption {
  value: string
  icon: string
  label?: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options?: ToggleOption[]
  size?: 'xs' | 'sm' | 'md'
  activeVariant?: 'primary' | 'secondary' | 'gaming' | 'cyber' | 'glass' | 'success' | 'warning' | 'danger' | 'info'
  inactiveVariant?: 'outline' | 'ghost'
  ariaLabel?: string
}>(), {
  options: () => ([
    { value: 'table', icon: 'mdi-table', label: 'Table view' },
    { value: 'cards', icon: 'mdi-view-grid', label: 'Cards view' },
  ]),
  size: 'sm',
  activeVariant: 'primary',
  inactiveVariant: 'outline',
  ariaLabel: 'View mode'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelValue = computed(() => props.modelValue)
const activeVariant = computed(() => props.activeVariant)
const inactiveVariant = computed(() => props.inactiveVariant)
const size = computed(() => props.size)
const resolvedOptions = computed(() => props.options || [])

function onSelect(val: string) {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.view-toggle-group {
  display: inline-flex;
  gap: var(--spacing-1);
}
</style>

