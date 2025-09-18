/**
 * SERVICE WORKER REGISTRATION AND MANAGEMENT
 * ==========================================
 *
 * Handles service worker lifecycle and provides utilities for:
 * - Registration and updates
 * - Cache management
 * - Offline status
 * - Background sync
 * - Push notifications
 */

import { logger } from '@/shared/utils/logger'

export interface ServiceWorkerStatus {
  registered: boolean
  installing: boolean
  waiting: boolean
  active: boolean
  error: string | null
}

export interface CacheStatus {
  caches: Record<string, number>
  total: number
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private status: ServiceWorkerStatus = {
    registered: false,
    installing: false,
    waiting: false,
    active: false,
    error: null,
  }

  /**
   * Register service worker
   */
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported')
      return false
    }

    try {
      logger.info('Registering service worker...')

      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      })

      this.status.registered = true

      // Listen for service worker events
      this.setupEventListeners()

      logger.info('Service worker registered successfully')
      return true
    } catch (error) {
      logger.error('Service worker registration failed:', error)
      this.status.error =
        error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const newRegistration = await this.registration.update()
      return newRegistration.installing !== null
    } catch (error) {
      logger.error('Failed to check for service worker updates:', error)
      return false
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      return
    }

    // Send message to service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Wait for new service worker to become active
    return new Promise(resolve => {
      const onStateChange = () => {
        if (this.registration?.active) {
          this.registration.active.removeEventListener(
            'statechange',
            onStateChange
          )
          resolve()
        }
      }

      this.registration.active?.addEventListener('statechange', onStateChange)
    })
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<CacheStatus> {
    if (!this.registration?.active) {
      return { caches: {}, total: 0 }
    }

    return new Promise(resolve => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = event => {
        resolve(event.data)
      }

      this.registration.active?.postMessage({ type: 'GET_CACHE_STATUS' }, [
        messageChannel.port2,
      ])

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({ caches: {}, total: 0 })
      }, 5000)
    })
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<{ cleared: number }> {
    if (!this.registration?.active) {
      return { cleared: 0 }
    }

    return new Promise(resolve => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = event => {
        resolve(event.data)
      }

      this.registration.active?.postMessage({ type: 'CLEAR_CACHE' }, [
        messageChannel.port2,
      ])

      // Timeout after 10 seconds
      setTimeout(() => {
        resolve({ cleared: 0 })
      }, 10000)
    })
  }

  /**
   * Register for background sync
   */
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await (this.registration as any).sync.register(tag)
      logger.info(`Background sync registered: ${tag}`)
      return true
    } catch (error) {
      logger.error(`Failed to register background sync ${tag}:`, error)
      return false
    }
  }

  /**
   * Request notification permission and register for push
   */
  async enableNotifications(): Promise<boolean> {
    if (!('Notification' in window)) {
      logger.warn('Notifications not supported')
      return false
    }

    if (!this.registration) {
      logger.warn('Service worker not registered')
      return false
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        logger.info('Notification permission denied')
        return false
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'BP3o-6KwVg5pD7w7DWx_z5k4Vq_JKKJJj8QYYQRhQGhQGhQGhQ'
        ),
      })

      logger.info('Push subscription created:', subscription)
      return true
    } catch (error) {
      logger.error('Failed to enable notifications:', error)
      return false
    }
  }

  /**
   * Get current status
   */
  getStatus(): ServiceWorkerStatus {
    return { ...this.status }
  }

  /**
   * Check if app is running offline
   */
  isOffline(): boolean {
    return !navigator.onLine
  }

  /**
   * Setup event listeners for service worker lifecycle
   */
  private setupEventListeners(): void {
    if (!this.registration) return

    // Handle service worker state changes
    if (this.registration.installing) {
      this.status.installing = true
      this.registration.installing.addEventListener('statechange', event => {
        const sw = event.target as ServiceWorker
        logger.info('Service worker state changed:', sw.state)

        if (sw.state === 'installed') {
          this.status.installing = false
          if (navigator.serviceWorker.controller) {
            // New service worker available
            this.status.waiting = true
            this.notifyUpdate()
          } else {
            // First time install
            this.status.active = true
            this.notifyInstall()
          }
        }
      })
    }

    if (this.registration.waiting) {
      this.status.waiting = true
      this.notifyUpdate()
    }

    if (this.registration.active) {
      this.status.active = true
    }

    // Listen for new service workers
    this.registration.addEventListener('updatefound', () => {
      this.status.installing = true
      logger.info('New service worker found')
    })

    // Listen for online/offline events
    window.addEventListener('online', () => {
      logger.info('App back online')
      this.notifyOnline()
    })

    window.addEventListener('offline', () => {
      logger.info('App offline')
      this.notifyOffline()
    })
  }

  /**
   * Notify about service worker installation
   */
  private notifyInstall(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sw-installed'))
  }

  /**
   * Notify about service worker update
   */
  private notifyUpdate(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'))
  }

  /**
   * Notify about online status
   */
  private notifyOnline(): void {
    window.dispatchEvent(new CustomEvent('app-online'))
  }

  /**
   * Notify about offline status
   */
  private notifyOffline(): void {
    window.dispatchEvent(new CustomEvent('app-offline'))
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager()

// Auto-register service worker in production
if (import.meta.env.PROD && typeof window !== 'undefined') {
  // Register after page load
  window.addEventListener('load', () => {
    serviceWorkerManager.register()
  })

  // Check for updates every 60 seconds
  setInterval(() => {
    serviceWorkerManager.checkForUpdates()
  }, 60000)
}
