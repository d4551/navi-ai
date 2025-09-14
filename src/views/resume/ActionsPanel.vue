<template>
  <div
    class="action-panel glass-elevated"
    role="region"
    aria-label="Resume actions"
  >
    <!-- Action Panel Header (Mobile) -->
    <div
      class="d-lg-none action-panel-header border-bottom border-opacity-25 pb-3 mb-3"
    >
      <div class="d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold text-primary">
          <AppIcon name="mdi-wrench" size="default" aria-hidden="true" />
          AI Tools
        </h6>
        <UnifiedButton
          class="d-lg-none"
          variant="ghost"
          size="sm"
          icon-only
          icon="mdi-close-circle-outline"
          type="button"
          aria-label="Close actions panel"
          @click="$emit('close-panel')"
        />
      </div>
    </div>

    <!-- Primary Actions -->
    <div class="responsive-grid mb-4">
      <!-- AI Generate -->
      <UnifiedButton
        class="btn-elevated"
        variant="primary"
        :size="isCompact ? 'md' : 'lg'"
        :disabled="!canUseAI"
        :loading="loading.ai"
        leading-icon="mdi-auto-fix"
        :aria-label="loading.ai ? 'Generating AI content...' : 'Generate AI content'"
        @click="$emit('ai-generate')"
      >
        <span class="action-text">
          <span class="d-block fw-semibold">AI Generate</span>
          <small class="d-none d-sm-block opacity-75">Smart content</small>
        </span>
      </UnifiedButton>

      <!-- Suggest Skills -->
      <UnifiedButton
        class="btn-elevated"
        variant="success"
        :size="isCompact ? 'md' : 'lg'"
        :disabled="!canUseAI"
        :loading="loading.skillSuggestions"
        leading-icon="mdi-lightbulb"
        :aria-label="loading.skillSuggestions ? 'Suggesting skills...' : 'Get AI skill suggestions'"
        @click="$emit('suggest-skills')"
      >
        <span class="action-text">
          <span class="d-block fw-semibold">Skills AI</span>
          <small class="d-none d-sm-block opacity-75">Get suggestions</small>
        </span>
      </UnifiedButton>

      <!-- Score Resume -->
      <UnifiedButton
        class="btn-elevated"
        variant="warning"
        :size="isCompact ? 'md' : 'lg'"
        :disabled="!canUseAI || !hasContent"
        :loading="loading.scoring"
        leading-icon="mdi-chart-bar"
        :aria-label="loading.scoring ? 'Analyzing resume...' : 'Analyze resume score'"
        @click="$emit('score-resume')"
      >
        <span class="action-text">
          <span class="d-block fw-semibold">Score</span>
          <small class="d-none d-sm-block opacity-75">Rate quality</small>
        </span>
      </UnifiedButton>
    </div>

    <!-- Secondary Actions -->
    <div class="btn-group-mobile">
      <!-- Tailor to Job -->
      <UnifiedButton
        variant="outline"
        :disabled="!canUseAI"
        leading-icon="mdi-bullseye-arrow"
        aria-label="Tailor resume to specific job"
        @click="$emit('tailor-job')"
      >
        Tailor for Job
      </UnifiedButton>

      <!-- Summarize Resume -->
      <UnifiedButton
        variant="outline"
        :disabled="!canUseAI || !hasContent"
        :loading="loading.ai"
        leading-icon="mdi-text-short"
        :aria-label="loading.ai ? 'Creating summary...' : 'Create resume summary'"
        @click="$emit('summarize-resume')"
      >
        <span>Summarize</span>
      </UnifiedButton>
    </div>

    <!-- Advanced Actions -->
    <details class="collapsible-panel mt-4" :class="{ expanded: showAdvanced }">
      <summary
        class="collapsible-header"
        role="button"
        aria-expanded="showAdvanced"
        aria-controls="advanced-actions"
        @click="showAdvanced = !showAdvanced"
      >
        <div class="d-flex align-items-center">
          <AppIcon name="mdi-cog" size="default" color="primary" aria-hidden="true" />
          <span class="fw-semibold">Advanced Tools</span>
        </div>
        <AppIcon :name="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="transition-icon" />
      </summary>

      <div id="advanced-actions" class="collapsible-content">
        <div class="btn-group-mobile">
          <!-- Optimize Section Dropdown -->
          <div class="dropdown w-100">
            <UnifiedButton
              class="dropdown-toggle w-100"
              variant="outline"
              :disabled="!canUseAI"
              icon-only="false"
              leading-icon="mdi-tune-vertical"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-haspopup="true"
              aria-label="Optimize resume section"
            >
              Optimize Section
            </UnifiedButton>
            <ul class="dropdown-menu w-100 glass-surface">
              <li>
                <button
                  class="dropdown-item d-flex align-items-center"
                  type="button"
                  @click="$emit('optimize-section', 'summary')"
                >
                  <AppIcon name="mdi-card-text-outline" class="me-2" />
                  Summary
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item d-flex align-items-center"
                  type="button"
                  @click="$emit('optimize-section', 'experience')"
                >
                  <AppIcon name="mdi-briefcase-outline" class="me-2" />
                  Professional Experience
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item d-flex align-items-center"
                  type="button"
                  @click="$emit('optimize-section', 'additionalExperience')"
                >
                  <AppIcon name="mdi-account-plus-outline" class="me-2" />
                  Additional Experience
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item d-flex align-items-center"
                  type="button"
                  @click="$emit('optimize-section', 'skills')"
                >
                  <AppIcon name="mdi-file-tree" class="me-2" />
                  Skills
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item d-flex align-items-center"
                  type="button"
                  @click="$emit('optimize-section', 'portfolio')"
                >
                  <AppIcon name="mdi-folder-multiple-image-outline" class="me-2" />
                  Portfolio
                </button>
              </li>
            </ul>
          </div>

          <!-- Smart Template -->
          <UnifiedButton
            variant="outline"
            color="info"
            :disabled="!canUseAI"
            :loading="loading.templateGeneration"
            leading-icon="mdi-auto-fix"
            :aria-label="loading.templateGeneration ? 'Generating template...' : 'Create AI-powered template'"
            @click="$emit('smart-template')"
          >
            AI Smart Template
          </UnifiedButton>
        </div>
      </div>
    </details>

    <!-- Status/Help Footer -->
    <div class="mt-4 pt-3 border-top border-opacity-25">
      <div v-if="!canUseAI" class="alert alert-warning py-2 mb-0" role="alert">
        <div class="d-flex align-items-center">
          <AppIcon name="mdi-alert-circle-outline" class="me-2" />
          <small>
            <strong>AI Offline:</strong> Configure API key in
            <router-link to="/settings#ai-section" class="alert-link">Settings</router-link>
          </small>
        </div>
      </div>
      <div
        v-else-if="!hasContent"
        class="alert alert-info py-2 mb-0"
        role="alert"
      >
        <div class="d-flex align-items-center">
          <AppIcon name="mdi-information-outline" class="me-2" />
          <small>Add content to your resume to enable AI tools</small>
        </div>
      </div>
      <div
        v-else
        class="d-flex align-items-center justify-content-center text-success"
      >
        <AppIcon name="mdi-check-circle-outline" size="small" aria-hidden="true" context="success" />
        <small class="fw-medium">AI Tools Ready</small>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

export default {
  name: "ActionsPanel",
  components: {
    AppIcon,
    UnifiedButton
  },
  props: {
    canUseAI: { type: Boolean, default: false },
    hasContent: { type: Boolean, default: false },
    loading: { type: Object, default: () => ({}) },
    compact: { type: Boolean, default: false },
  },
  emits: [
    "ai-generate",
    "suggest-skills",
    "score-resume",
    "summarize-resume",
    "tailor-job",
    "optimize-section",
    "smart-template",
    "close-panel",
  ],
  setup(props) {
    const showAdvanced = ref(false);

    const isCompact = computed(() => props.compact);

    return {
      showAdvanced,
      isCompact,
    };
  },
};
</script>

<style scoped>
.action-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.transition-icon {
  transition: transform var(--transition-fast);
}

.collapsible-panel.expanded .transition-icon {
  transform: rotate(180deg);
}

/* Enhanced button styling for action panel */
.btn.btn-elevated {
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  text-align: center;
}

.btn.btn-elevated.btn-lg {
  min-height: 72px;
  padding: 1rem 1.25rem;
}

@media (min-width: 768px) {
  .btn.btn-elevated {
    flex-direction: row;
    text-align: left;
  }

  .action-text {
    align-items: flex-start;
  }
}

@media (max-width: 767.98px) {
  .btn.btn-elevated .icon-md {
    margin-bottom: 0.25rem;
    margin-right: 0 !important;
  }

  .action-text small {
    display: none !important;
  }
}

/* Dropdown menu glass effect */
.dropdown-menu.glass-surface {
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border: 1px solid var(--glass-border-light);
  box-shadow: var(--shadow-lg);
}

[data-theme="dark"] .dropdown-menu.glass-surface,
:root:not([data-theme]) .dropdown-menu.glass-surface {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

.dropdown-item {
  transition: all var(--transition-fast);
}

.dropdown-item:hover,
.dropdown-item:focus {
  background: var(--glass-elevated-light);
  color: var(--color-primary);
}

[data-theme="dark"] .dropdown-item:hover,
[data-theme="dark"] .dropdown-item:focus,
:root:not([data-theme]) .dropdown-item:hover,
:root:not([data-theme]) .dropdown-item:focus {
  background: var(--glass-elevated-dark);
}
</style>
