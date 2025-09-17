import { computed, type ComputedRef } from 'vue'
import { useAppStore } from '@/stores/app'

// Types
interface DocumentAction {
  key: string
  icon: string
  text: string
  variant: string
  requiresApiKey?: boolean
  onClick?: () => void
  disabled?: boolean
}

interface DocumentActionContext {
  save?: () => void
  enhance?: () => void
  export?: () => void
  generate?: () => void
  improve?: () => void
}

interface UseDocumentActionsReturn {
  actions: ComputedRef<DocumentAction[]>
}

// Canonical document actions generator for resume & cover letter
export function useDocumentActions(
  kind: 'resume' | 'coverLetter',
  ctx?: DocumentActionContext
): UseDocumentActionsReturn {
  const store = useAppStore()

  const actions = computed(() => {
    const base: DocumentAction[] = []
    const canAI = !!store.settings?.geminiApiKey

    if (kind === 'resume') {
      base.push({
        key: 'save',
        icon: 'mdi-content-save-outline',
        text: 'Save',
        variant: 'glass',
        onClick: ctx?.save,
      })
      base.push({
        key: 'ai-enhance',
        icon: 'mdi-auto-fix',
        text: 'Enhance',
        variant: 'primary',
        requiresApiKey: true,
        onClick: ctx?.enhance,
        disabled: !canAI,
      })
      base.push({
        key: 'export',
        icon: 'mdi-file-export-outline',
        text: 'Export',
        variant: 'secondary',
        onClick: ctx?.export,
      })
    } else if (kind === 'coverLetter') {
      base.push({
        key: 'save',
        icon: 'mdi-content-save-outline',
        text: 'Save',
        variant: 'glass',
        onClick: ctx?.save,
      })
      base.push({
        key: 'generate',
        icon: 'mdi-robot-outline',
        text: 'Generate',
        variant: 'primary',
        requiresApiKey: true,
        onClick: ctx?.generate,
        disabled: !canAI,
      })
      base.push({
        key: 'improve',
        icon: 'mdi-auto-fix',
        text: 'Improve',
        variant: 'secondary',
        requiresApiKey: true,
        onClick: ctx?.improve,
        disabled: !canAI,
      })
      base.push({
        key: 'export',
        icon: 'mdi-file-export-outline',
        text: 'Export',
        variant: 'secondary',
        onClick: ctx?.export,
      })
    }

    return base
  })

  return { actions }
}

// Export types for external use
export type { DocumentAction, DocumentActionContext, UseDocumentActionsReturn }
