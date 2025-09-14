import type { Ref } from 'vue'

export interface AutosaveMeta {
  lastSaved: Date | null
  status: 'idle' | 'saving' | 'saved' | 'error'
  error?: string
}

export interface UseResumeAutosaveReturn {
  saveMeta: Ref<AutosaveMeta>
  triggerSave: (_data?: any) => void
}

export function useResumeAutosave(_store: any): UseResumeAutosaveReturn
