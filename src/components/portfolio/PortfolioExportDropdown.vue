<template>
  <div class="dropdown font-sans">
    <UnifiedButton
      variant="primary"
      size="sm"
      :disabled="disabled"
      data-bs-toggle="dropdown"
      leading-icon="ArrowDownTrayIcon"
    >
      Export
    </UnifiedButton>
    <ul class="dropdown-menu">
      <li>
        <a class="dropdown-item" href="#" @click="$emit('export', 'html')">
          <AppIcon name="GlobeAltIcon" class="mr-2" />HTML Portfolio
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('export', 'json')">
          <AppIcon name="mdi-code-json" class="mr-2" />JSON Data
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('export', 'pdf')">
          <AppIcon name="DocumentIcon" />PDF Document
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  GlobeAltIcon,
} from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['export'])
</script>
