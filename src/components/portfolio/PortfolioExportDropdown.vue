<template>
  <div class="dropdown">
    <UnifiedButton
      variant="primary"
      size="sm"
      :disabled="disabled"
      data-bs-toggle="dropdown"
      leading-icon="mdi-download"
    >
      Export
    </UnifiedButton>
    <ul class="dropdown-menu">
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('export', 'html')"
        >
          <AppIcon name="mdi-web" class="me-2" />HTML Portfolio
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('export', 'json')"
        >
          <AppIcon name="mdi-code-json" class="me-2" />JSON Data
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('export', 'pdf')"
        >
          <AppIcon name="mdi-file-document-outline" />PDF Document
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['export'])
</script>
