import { createPinia } from 'pinia'

// Create and export the pinia instance
export const pinia = createPinia()

// Export a function to install pinia in a Vue app
export function setupPinia(app) {
  app.use(pinia)
  return app
}
