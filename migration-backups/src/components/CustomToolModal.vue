<template>
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="custom-tool-title"
    @click.self="emitClose"
    @keydown.esc.prevent.stop="emitClose"
  >
    <div ref="modalEl" class="modal">
      <header class="modal__header">
        <h2 id="custom-tool-title" class="modal__title">Add Custom Tool</h2>
      </header>
      <div class="modal__body unified-container">
        <form @submit.prevent="submit">
          <div class="form-group">
            <label for="custom-tool-name" class="form-label">Name</label>
            <input
              id="custom-tool-name"
              v-model="name"
              type="text"
              class="form-control glass-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="custom-tool-url" class="form-label">URL</label>
            <input
              id="custom-tool-url"
              v-model="url"
              type="url"
              class="form-control glass-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="custom-tool-description" class="form-label"
              >Description</label
            >
            <textarea
              id="custom-tool-description"
              v-model="description"
              class="form-control glass-input"
              rows="3"
            />
          </div>
        </form>
      </div>
      <footer class="modal__footer d-flex justify-content-end gap-2">
        <UnifiedButton variant="ghost" @click="emitClose">Cancel</UnifiedButton>
        <UnifiedButton
          variant="primary"
          leading-icon="mdi-content-save"
          @click="submit"
          >Save</UnifiedButton
        >
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface ToolForm {
  name: string
  url: string
  description: string
}

const emit = defineEmits<{
  (e: 'save', tool: ToolForm): void
  (e: 'close'): void
}>()

const name = ref('')
const url = ref('')
const description = ref('')
const modalEl = ref<HTMLElement | null>(null)

const { error: toastError } = useToast()

const reset = () => {
  name.value = ''
  url.value = ''
  description.value = ''
}

const emitClose = () => {
  reset()
  emit('close')
}

const submit = () => {
  if (!name.value.trim() || !url.value.trim()) {
    toastError('Name and URL are required')
    return
  }
  const urlPattern = /^https?:\/\//i
  if (!urlPattern.test(url.value)) {
    toastError('URL must start with http:// or https://')
    return
  }
  emit('save', {
    name: name.value.trim(),
    url: url.value.trim(),
    description: description.value.trim(),
  })
  reset()
}

onMounted(() => {
  setTimeout(
    () => modalEl.value?.querySelector<HTMLInputElement>('input')?.focus(),
    0
  )
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--backdrop-blur-base);
  z-index: var(--z-modal);
}

.modal {
  background: var(--modal-background);
  color: var(--text-primary);
  border: 1px solid var(--modal-border);
  border-radius: var(--radius-modal);
  width: min(420px, 92%);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4) var(--spacing-5);
}

.modal__title {
  font-size: var(--font-size-lg);
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal__body {
  margin-top: var(--spacing-2);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-1);
  color: var(--text-secondary);
}

/* Inputs adopt global glass-input styling via master-theme */

.modal__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}

.btn {
  cursor: pointer;
}
</style>
