import {} from 'vue'
import { useAppStore } from '@/stores/app'

export function useResumeAutosave() {
  const store = useAppStore()
  const saveMeta = ref({ lastSaved: null, status: 'idle' })
  let timer = null

  const triggerSave = _data => {
    saveMeta.value.status = 'saving'
    store.updateResumeData(_data)
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      saveMeta.value = { lastSaved: new Date(), status: 'saved' }
    }, 600)
  }

  return { saveMeta, triggerSave }
}
