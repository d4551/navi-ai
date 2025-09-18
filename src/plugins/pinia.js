import { createPinia } from 'pinia'
import { piniaRouterPlugin, piniaPersistPlugin } from '../stores/plugins'

export function setupPinia(app, router) {
  const pinia = createPinia()

  // Add router to all stores
  if (router) {
    pinia.use(piniaRouterPlugin(router))
  }

  // Add persistence plugin for settings store
  pinia.use(
    piniaPersistPlugin({
      key: 'app-settings',
      paths: ['theme', 'sidebarExpanded', 'layoutSize'],
    })
  )

  app.use(pinia)

  return pinia
}
