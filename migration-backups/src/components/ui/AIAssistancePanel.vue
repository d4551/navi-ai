<template>
  <div class="ai-assistance-panel section-card">
    <div class="ai-panel-header">
      <div class="ai-title-group">
        <div class="ai-icon">
          <AppIcon name="mdi-brain" size="20" />
        </div>
        <div class="ai-content">
          <h4 class="ai-title">{{ title }}</h4>
          <p class="ai-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div class="ai-actions">
        <slot name="actions">
          <UnifiedButton
            variant="gaming"
            size="sm"
            :leading-icon="primaryAction.icon"
            :loading="loading"
            :disabled="disabled"
            @click="$emit('primary-action')"
          >
            {{ primaryAction.label }}
          </UnifiedButton>
        </slot>
      </div>
    </div>

    <!-- Secondary Actions -->
    <div v-if="secondaryActions.length > 0" class="ai-secondary-actions">
      <UnifiedButton
        v-for="action in secondaryActions"
        :key="action.key"
        variant="outline"
        size="sm"
        :leading-icon="action.icon"
        :loading="loading"
        :disabled="disabled"
        @click="$emit('secondary-action', action.key)"
      >
        {{ action.label }}
      </UnifiedButton>
    </div>

    <!-- Suggestions Display -->
    <div v-if="suggestions.length > 0" class="suggestions-container">
      <div class="suggestions-header">
        <h6 class="suggestions-title">
          {{ suggestionsTitle || 'AI Suggestions' }}
        </h6>
        <span class="suggestions-count">{{ suggestions.length }}</span>
      </div>

      <div class="suggestions-list">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="suggestion-card"
        >
          <div class="suggestion-content">
            <p class="suggestion-text">{{ suggestion.text }}</p>
            <div
              v-if="suggestion.category || suggestion.style"
              class="suggestion-meta"
            >
              <span v-if="suggestion.category" class="suggestion-category">
                {{ suggestion.category }}
              </span>
              <span v-if="suggestion.style" class="suggestion-style">
                {{ suggestion.style }} style
              </span>
            </div>
          </div>

          <div class="suggestion-actions">
            <UnifiedButton
              variant="ghost"
              size="xs"
              @click="$emit('apply-suggestion', suggestion)"
            >
              Use This
            </UnifiedButton>
            <UnifiedButton
              v-if="allowCustomization"
              variant="ghost"
              size="xs"
              icon="mdi-pencil-outline"
              @click="$emit('customize-suggestion', suggestion)"
            />
            <UnifiedButton
              variant="ghost"
              size="xs"
              icon="mdi-close"
              @click="$emit('dismiss-suggestion', suggestion)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Token Helper -->
    <div v-if="showTokens && tokens.length > 0" class="token-helper">
      <div class="token-header">
        <span class="token-label">Quick tokens:</span>
      </div>
      <div class="token-pills">
        <button
          v-for="token in tokens"
          :key="token"
          type="button"
          class="token-pill"
          @click="$emit('insert-token', token)"
        >
          {{ token }}
        </button>
      </div>
    </div>

    <!-- Custom Content Slot -->
    <div v-if="$slots.content" class="ai-custom-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import UnifiedButton from './UnifiedButton.vue'
import AppIcon from './AppIcon.vue'

defineProps({
  title: {
    type: String,
    default: 'AI Writing Assistant',
  },
  subtitle: {
    type: String,
    default: 'Let AI help improve your content',
  },
  primaryAction: {
    type: Object,
    default: () => ({ label: 'Generate', icon: 'mdi-magic-staff' }),
  },
  secondaryActions: {
    type: Array,
    default: () => [],
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  suggestionsTitle: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  allowCustomization: {
    type: Boolean,
    default: false,
  },
  showTokens: {
    type: Boolean,
    default: false,
  },
  tokens: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'primary-action',
  'secondary-action',
  'apply-suggestion',
  'customize-suggestion',
  'dismiss-suggestion',
  'insert-token',
])
</script>

<style scoped>
.ai-assistance-panel {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  backdrop-filter: var(--glass-backdrop-filter);
  margin-bottom: var(--spacing-4);
}

.ai-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.ai-title-group {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  flex: 1;
}

.ai-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-100);
  color: var(--color-primary-600);
  flex-shrink: 0;
}

.ai-content {
  flex: 1;
  min-width: 0;
}

.ai-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.ai-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.ai-actions {
  flex-shrink: 0;
}

.ai-secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.suggestions-container {
  margin-top: var(--spacing-4);
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
}

.suggestions-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0;
}

.suggestions-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--surface-container);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--glass-hover-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.suggestion-card:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.suggestion-category {
  background: var(--color-info-100);
  color: var(--color-info-700);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.suggestion-style {
  opacity: 0.8;
}

.suggestion-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  flex-shrink: 0;
}

.token-helper {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--glass-border);
}

.token-header {
  margin-bottom: var(--spacing-2);
}

.token-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
}

.token-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.token-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary-600);
  background: var(--color-primary-100);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.token-pill:hover {
  background: var(--color-primary-200);
  border-color: var(--color-primary-300);
}

.ai-custom-content {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--glass-border);
}

/* Dark theme adjustments */
[data-theme='dark'] .ai-icon {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary-400);
}

[data-theme='dark'] .suggestion-card {
  background: rgba(var(--surface-glass-rgb), 0.05);
  border-color: var(--glass-border);
}

[data-theme='dark'] .suggestion-card:hover {
  border-color: var(--color-primary-400);
  background: rgba(var(--color-primary-rgb), 0.1);
}

[data-theme='dark'] .token-pill {
  background: rgba(var(--color-primary-rgb), 0.2);
  border-color: rgba(var(--color-primary-rgb), 0.3);
  color: var(--color-primary-300);
}

[data-theme='dark'] .token-pill:hover {
  background: rgba(var(--color-primary-rgb), 0.3);
  border-color: rgba(var(--color-primary-rgb), 0.4);
}
</style>
