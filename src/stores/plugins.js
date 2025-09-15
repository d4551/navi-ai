import { markRaw } from 'vue'

/**
 * Pinia plugin to integrate router with stores
 */
export function piniaRouterPlugin(router) {
  return ({ store }) => {
    // Inject router to all stores
    store.router = markRaw(router)
  }
}

/**
 * Pinia plugin for local storage persistence
 */
export function piniaPersistPlugin({ key = 'pinia', paths = [] }) {
  return ({ store }) => {
    // Load persisted state on store initialization
    const persistedState = localStorage.getItem(key)
    if (persistedState) {
      try {
        store.$patch(JSON.parse(persistedState))
      } catch (error) {
        console.error('Failed to restore persisted state:', error)
      }
    }
    
    // Subscribe to state changes and persist them
    store.$subscribe((mutation, state) => {
      // Create a partial state object if paths are specified
      const stateToPersist = paths.length > 0
        ? paths.reduce((obj, path) => {
            const value = state[path]
            if (value !== undefined) obj[path] = value
            return obj
          }, {})
        : state
      
      localStorage.setItem(key, JSON.stringify(stateToPersist))
    })
    
    // Add persist flag to store
    store.persist = true
  }
}
