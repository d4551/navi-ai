<template>
  <v-dialog v-model="visible" :max-width="maxWidth">
    <v-card>
      <v-card-title class="d-flex align-center gap-2">
        <AppIcon v-if="icon" :name="icon" />
        <span>{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <StepFlow
          v-model="idx"
          :steps="steps"
          :busy="busy"
          :max-reachable="maxReachable"
          :orientation="orientation"
          :primary-variant="primaryVariant"
          class="mb-2"
          @finish="$emit('finish')"
        >
          <template #default="slotProps">
            <slot name="content" v-bind="slotProps" />
          </template>
          <template #left-actions>
            <slot name="left-actions" />
          </template>
        </StepFlow>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <UnifiedButton variant="ghost" @click="close">Close</UnifiedButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StepFlow, { type StepFlowStep } from '@/components/ui/StepFlow.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Props {
  show: boolean
  title: string
  icon?: string
  steps: StepFlowStep[]
  modelValue?: number
  maxReachable?: number
  busy?: boolean
  maxWidth?: number | string
  orientation?: 'horizontal' | 'vertical'
  primaryVariant?: 'primary' | 'gaming' | 'outline'
}

const _props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  maxReachable: 0,
  busy: false,
  maxWidth: 820,
  orientation: 'horizontal',
  primaryVariant: 'primary',
})

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
  (e: 'update:modelValue', v: number): void
  (e: 'finish'): void
}>()

const visible = computed({
  get: () => props.show,
  set: v => emit('update:show', v),
})
const idx = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

function close() {
  visible.value = false
}
</script>

<style scoped>
/* Minimal wrapper styles (uses Vuetify card/dialog) */
</style>
