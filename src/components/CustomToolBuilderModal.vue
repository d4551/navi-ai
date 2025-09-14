<template>
  <ModalBase
    v-model="internalOpen"
    title="Build Custom Tool"
    icon="mdi-hammer-wrench"
    :confirmable="true"
    :cancelable="true"
    @cancel="close"
    @confirm="handleSave"
  >
    <form class="custom-tool-form" @submit.prevent="handleSave">
      <div class="form-group">
        <label for="tool-name">Tool Name</label>
        <input
          id="tool-name"
          ref="firstInput"
          v-model="toolName"
          type="text"
          required
        />
      </div>
    </form>
  </ModalBase>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue'
import ModalBase from '@/components/ui/ModalBase.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'save'])

const internalOpen = ref(props.modelValue)
const toolName = ref('')
const firstInput = ref(null)

watch(() => props.modelValue, (val) => {
  internalOpen.value = val
})

watch(
  internalOpen,
  (val) => {
    emit('update:modelValue', val)
    if (val) {
      requestAnimationFrame(() => {
        firstInput.value?.focus()
      })
    }
  },
  { immediate: true }
)

function close() {
  internalOpen.value = false
}

function handleSave() {
  emit('save', { name: toolName.value })
  close()
}
</script>

<style scoped>
.custom-tool-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
</style>

