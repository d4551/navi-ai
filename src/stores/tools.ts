import { defineStore } from 'pinia'

export interface CustomTool {
  id: string
  name: string
  url: string
  description: string
}

const STORAGE_KEY = 'navi-custom-tools'

export const useToolStore = defineStore('tools', {
  state: () => ({
    customTools: [] as CustomTool[],
  }),
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.customTools = JSON.parse(raw)
        }
      } catch (e) {
        console.warn('Failed to load custom tools', e)
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customTools))
      } catch (e) {
        console.warn('Failed to save custom tools', e)
      }
    },
    addTool(tool: Omit<CustomTool, 'id'>) {
      const id = Date.now().toString()
      this.customTools.push({ id, ...tool })
      this.save()
      return id
    },
  },
})

export default useToolStore
