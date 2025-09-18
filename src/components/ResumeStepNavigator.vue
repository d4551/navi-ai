<template>
  <div class="resume-step-navigator font-sans">
    <div class="unified-grid g-2">
      <div v-for="section in sections" :key="section.key" class="flex-1">
        <button
          :class="[
            'step-nav-item',
            'unified-btn btn-sm w-100',
            {
              'btn-primary': activeSection === section.key,
              'btn-outline-secondary': activeSection !== section.key,
              completed:
                completionStatus[section.key as keyof typeof completionStatus],
            },
          ]"
          :aria-label="`Navigate to ${section.label}`"
          @click="handleClick(section.key)"
        >
          <div class="flex items-center gap-glass-sm">
            <AppIcon :name="section.icon" class="mdi-18px" />
            <div class="step-content">
              <div class="step-title">
                {{ section.shortLabel || section.label }}
              </div>
              <div
                v-if="
                  completionStatus[section.key as keyof typeof completionStatus]
                "
                class="step-status"
              >
                <AppIcon name="CheckCircleIcon" color="success" />
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
interface Section {
  key: string
  label: string
  icon: string
  shortLabel?: string
  description?: string
}

interface Props {
  activeSection: string
  sections: Section[]
  completionStatus: Record<string, boolean>
  canUseAi?: boolean
  showAiIndicator?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'updateActiveSection', value: string): void
  (e: 'update:active-section', value: string): void
}>()

const handleClick = (value: string) => {
  emit('updateActiveSection', value)
  emit('update:active-section', value)
}
</script>

<style scoped>
.step-nav-item {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.step-nav-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.step-nav-item.active {
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.completed {
  border-color: var(--color-success);
}

.step-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.step-title {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-status {
  font-size: 0.75rem;
}

@media (max-width: 576px) {
  .step-nav-item {
    padding: 0.5rem 0.75rem;
    min-height: 44px;
  }

  .step-content .step-title {
    font-size: 0.8rem;
  }
}

/* Theme support */
[data-theme='dark'] .step-nav-item.completed {
  border-color: var(--color-success);
}

.scoping-fix {
  font-size: 0.75rem;
  width: 0.75rem;
  height: 0.75rem;
}
</style>
