import { defineProps } from 'vue'
<template>
  <div
    v-if="lastSaved || completionPercent > 0"
    class="completion-indicator mb-3"
    role="status"
    aria-live="polite"
  >
    <div class="d-flex align-items-center justify-content-between mb-2">
      <span
        v-if="lastSaved"
        :class="{ 'text-success': saveStatus === 'saved',
                  'text-warning': saveStatus === 'saving',
                  'text-info': saveStatus === 'auto-saved'
        }"
        class="small"
      >
        <AppIcon name="mdi-cloud-upload'" class="saveStatus === 'saving' ? 'mdi : 'mdi mdi-check-circle-outline' me-1" />
        <span class="visually-hidden">{{
          saveStatus === "saving"
            ? "Currently saving your work"
            : "Work saved"
        }}</span>
        {{ saveStatus === "saving" ? "Auto-saving..." : "Auto-saved" }}
        {{ timeSince(lastSaved) }} ago
      </span>
      <span
        class="badge badge-compact"
        :class="{ 'bg-success': completionPercent >= 80,
                  'bg-warning': completionPercent >= 50 && completionPercent < 80,
                  'bg-info': completionPercent < 50
        }"
        :aria-label="`${documentType} completion: ${completionPercent}%`"
      >{{ completionPercent }}% complete</span>
    </div>

    <!-- Enhanced Progress Bar -->
    <div class="progress-container">
      <div
        class="progress progress-modern"
        role="progressbar"
        :aria-valuenow="completionPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`${documentType} completion: ${completionPercent}%`"
      >
        <div
          class="progress-bar progress-bar-animated"
          :class="{ 'bg-success': completionPercent >= 80,
                    'bg-warning': completionPercent >= 50 && completionPercent < 80,
                    'bg-info': completionPercent < 50
          }"
          :style="`width:${completionPercent}%`"
        ></div>
      </div>

      <!-- Smart suggestions based on completion -->
      <div v-if="completionPercent < 100 && showSuggestions && hasApiKey" class="mt-2">
        <small class="text-muted">
          <AppIcon name="mdi-lightbulb" aria-hidden="true" />
          <span v-if="completionPercent < 30">
            {{ suggestions.low || `Add your ${documentType.toLowerCase()} content to get started` }}
          </span>
          <span v-else-if="completionPercent < 60">
            {{ suggestions.medium || "Try the AI Enhance feature to polish your content" }}
          </span>
          <span v-else-if="completionPercent < 80">
            {{ suggestions.high || "Get AI suggestions to improve your content" }}
          </span>
          <span v-else>
            {{ suggestions.complete || `Almost done! Consider refining your ${documentType.toLowerCase()}` }}
          </span>
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
const _props = defineProps({
  completionPercent: {
    type: Number,
    default: 0
  },
  lastSaved: {
    type: [Date, Number, String],
    default: null
  },
  saveStatus: {
    type: String,
    default: 'saved',
    validator: (value) => ['saved', 'saving', 'auto-saved', 'idle'].includes(value)
  },
  documentType: {
    type: String,
    default: 'Document'
  },
  showSuggestions: {
    type: Boolean,
    default: true
  },
  hasApiKey: {
    type: Boolean,
    default: false
  },
  suggestions: {
    type: Object,
    default: () => ({})
  }
})

// Time formatting utility
const timeSince = (date) => {
  if (!date) {return ''}
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) {return ''}

  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) {
    return 'just now'
  }
  if (diffMin < 60) {
    return `${diffMin}m`
  }
  if (diffHour < 24) {
    return `${diffHour}h`
  }
  return `${Math.floor(diffHour / 24)}d`
}
</script>

<style scoped>
.completion-indicator {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg, 12px);
  padding: var(--spacing-md, 1rem);
  backdrop-filter: blur(var(--glass-backdrop-blur, 10px));
}

[data-theme="dark"] .completion-indicator,
:root:not([data-theme]) .completion-indicator {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}

.progress-modern {
  height: 8px;
  border-radius: 4px;
  background-color: var(--bg-tertiary, #e4e4e7);
  overflow: hidden;
}

.progress-container {
  position: relative;
}

/* badge-compact utility used in template; no local override needed */

.text-muted {
  color: var(--text-muted, #6b7280) !important;
}

.small {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Animation preferences support */
@media (prefers-reduced-motion: reduce) {
  .progress-bar-animated {
    animation: none !important;
  }
}
</style>
