import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { logger } from '@/shared/utils/logger'

// Canonical document actions generator for resume & cover letter
// Supports both resume and cover letter workflows
export function useDocumentActions(kind, ctx) {
  const store = useAppStore()

  const actions = computed(() => {
    const base = []
    // Check for API key in multiple places
    const canAI = !!(
      store.settings?.geminiApiKey ||
      store.settings?.apiKey ||
      store.settings?.ai?.apiKey
    )

    try {
      if (kind === 'resume') {
        base.push({
          key: 'save',
          icon: 'mdi-content-save-outline',
          text: 'Save Resume',
          variant: 'glass',
          onClick: ctx?.save || (() => logger.warn('Save action not provided')),
          disabled: false,
          requiresApiKey: false,
        })

        base.push({
          key: 'ai-enhance',
          icon: 'mdi-auto-fix',
          text: 'AI Enhance',
          variant: 'primary',
          onClick:
            ctx?.enhance || (() => logger.warn('Enhance action not provided')),
          disabled: !canAI,
          requiresApiKey: true,
          tooltip: !canAI
            ? 'Configure API key in Settings to use AI features'
            : 'Enhance resume with AI',
        })

        base.push({
          key: 'export',
          icon: 'mdi-file-export-outline',
          text: 'Export PDF',
          variant: 'secondary',
          onClick:
            ctx?.export || (() => logger.warn('Export action not provided')),
          disabled: false,
          requiresApiKey: false,
        })

        // Add preview action if supported
        if (ctx?.preview) {
          base.push({
            key: 'preview',
            icon: 'mdi-eye-outline',
            text: 'Preview',
            variant: 'outline-secondary',
            onClick: ctx.preview,
            disabled: false,
            requiresApiKey: false,
          })
        }
      } else if (kind === 'coverLetter') {
        base.push({
          key: 'save',
          icon: 'mdi-content-save-outline',
          text: 'Save Letter',
          variant: 'glass',
          onClick: ctx?.save || (() => logger.warn('Save action not provided')),
          disabled: false,
          requiresApiKey: false,
        })

        base.push({
          key: 'generate',
          icon: 'mdi-robot-outline',
          text: 'Generate',
          variant: 'primary',
          onClick:
            ctx?.generate ||
            (() => logger.warn('Generate action not provided')),
          disabled: !canAI,
          requiresApiKey: true,
          tooltip: !canAI
            ? 'Configure API key in Settings to use AI features'
            : 'Generate cover letter with AI',
        })

        base.push({
          key: 'improve',
          icon: 'mdi-auto-fix',
          text: 'AI Improve',
          variant: 'secondary',
          onClick:
            ctx?.improve || (() => logger.warn('Improve action not provided')),
          disabled: !canAI,
          requiresApiKey: true,
          tooltip: !canAI
            ? 'Configure API key in Settings to use AI features'
            : 'Improve letter with AI suggestions',
        })

        base.push({
          key: 'export',
          icon: 'mdi-file-export-outline',
          text: 'Export',
          variant: 'outline-secondary',
          onClick:
            ctx?.export || (() => logger.warn('Export action not provided')),
          disabled: false,
          requiresApiKey: false,
        })

        // Add customize action if supported
        if (ctx?.customize) {
          base.push({
            key: 'customize',
            icon: 'mdi-tune-vertical-variant',
            text: 'Customize',
            variant: 'outline-primary',
            onClick: ctx.customize,
            disabled: false,
            requiresApiKey: false,
          })
        }
      } else if (kind === 'portfolio') {
        base.push({
          key: 'save',
          icon: 'mdi-content-save-outline',
          text: 'Save Portfolio',
          variant: 'glass',
          onClick: ctx?.save || (() => logger.warn('Save action not provided')),
          disabled: false,
          requiresApiKey: false,
        })

        base.push({
          key: 'export',
          icon: 'mdi-file-export-outline',
          text: 'Export Portfolio',
          variant: 'secondary',
          onClick:
            ctx?.export || (() => logger.warn('Export action not provided')),
          disabled: false,
          requiresApiKey: false,
        })

        // Add publish action if supported
        if (ctx?.publish) {
          base.push({
            key: 'publish',
            icon: 'mdi-web',
            text: 'Publish',
            variant: 'primary',
            onClick: ctx.publish,
            disabled: false,
            requiresApiKey: false,
          })
        }
      }
    } catch (error) {
      logger.error('Error generating document actions:', error)
      // Return minimal fallback actions
      return [
        {
          key: 'error',
          icon: 'mdi-alert-circle-outline-outline',
          text: 'Error',
          variant: 'danger',
          disabled: true,
          requiresApiKey: false,
        },
      ]
    }

    return base
  })

  // Provide reactive state for external components
  const hasAIKey = computed(
    () =>
      !!(
        store.settings?.geminiApiKey ||
        store.settings?.apiKey ||
        store.settings?.ai?.apiKey
      )
  )

  const aiActionCount = computed(() => {
    return actions.value.filter(action => action.requiresApiKey).length
  })

  return {
    actions,
    hasAIKey,
    aiActionCount,
    // Helper functions for components
    isAIAction: key =>
      actions.value.find(a => a.key === key)?.requiresApiKey || false,
    getActionByKey: key => actions.value.find(a => a.key === key) || null,
    getDisabledActions: () => actions.value.filter(a => a.disabled),
    getEnabledActions: () => actions.value.filter(a => !a.disabled),
  }
}

// Export constants for usage in other modules
export const DOCUMENT_TYPES = {
  RESUME: 'resume',
  COVER_LETTER: 'coverLetter',
  PORTFOLIO: 'portfolio',
}
