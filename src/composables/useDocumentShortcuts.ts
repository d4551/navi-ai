import { onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'

export function useDocumentShortcuts(options: {
  onSave?: () => void
  onExport?: () => void
  onPreview?: () => void
  onNextStep?: () => void
  onPrevStep?: () => void
  onSwitchTab?: (tab: string) => void
  onTogglePreview?: () => void
  onAIGenerate?: () => void
}) {
  const toast = useToast()

  const handleKeydown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    const { ctrlKey, metaKey, altKey, shiftKey, key } = event
    const isModKey = ctrlKey || metaKey

    // Ctrl/Cmd + S: Save
    if (isModKey && key === 's' && options.onSave) {
      event.preventDefault()
      options.onSave()
      toast.success('Document saved')
      return
    }

    // Ctrl/Cmd + E: Export
    if (isModKey && key === 'e' && options.onExport) {
      event.preventDefault()
      options.onExport()
      return
    }

    // Ctrl/Cmd + P: Preview
    if (isModKey && key === 'p' && options.onPreview) {
      event.preventDefault()
      options.onPreview()
      return
    }

    // Alt + Right: Next Step
    if (altKey && key === 'ArrowRight' && options.onNextStep) {
      event.preventDefault()
      options.onNextStep()
      return
    }

    // Alt + Left: Previous Step
    if (altKey && key === 'ArrowLeft' && options.onPrevStep) {
      event.preventDefault()
      options.onPrevStep()
      return
    }

    // Alt + 1,2,3: Switch Tabs
    if (altKey && ['1', '2', '3'].includes(key) && options.onSwitchTab) {
      event.preventDefault()
      const tabMap: Record<string, string> = {
        '1': 'resume',
        '2': 'cover-letter',
        '3': 'ai-tools'
      }
      options.onSwitchTab(tabMap[key])
      return
    }

    // Alt + V: Toggle Preview
    if (altKey && key === 'v' && options.onTogglePreview) {
      event.preventDefault()
      options.onTogglePreview()
      return
    }

    // Ctrl/Cmd + Shift + A: AI Generate
    if (isModKey && shiftKey && key === 'A' && options.onAIGenerate) {
      event.preventDefault()
      options.onAIGenerate()
      return
    }

    // F1: Show Shortcuts Help
    if (key === 'F1') {
      event.preventDefault()
      showShortcutsHelp()
      return
    }
  }

  const showShortcutsHelp = () => {
    const shortcuts = [
      { key: 'Ctrl/⌘ + S', action: 'Save document' },
      { key: 'Ctrl/⌘ + E', action: 'Export document' },
      { key: 'Ctrl/⌘ + P', action: 'Preview document' },
      { key: 'Alt + →', action: 'Next step' },
      { key: 'Alt + ←', action: 'Previous step' },
      { key: 'Alt + 1/2/3', action: 'Switch tabs' },
      { key: 'Alt + V', action: 'Toggle preview' },
      { key: 'Ctrl/⌘ + Shift + A', action: 'AI Generate' },
      { key: 'F1', action: 'Show this help' }
    ]

    const helpText = shortcuts
      .map(s => `${s.key}: ${s.action}`)
      .join('\n')

    toast.info(`Keyboard Shortcuts:\n${helpText}`, { duration: 8000 })
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    showShortcutsHelp
  }
}