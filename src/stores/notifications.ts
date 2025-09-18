import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    handler: () => void
  }
  timestamp: Date
}

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const maxNotifications = ref(5)

  // Getters
  const activeNotifications = computed(() =>
    notifications.value.filter(
      n =>
        !n.persistent ||
        Date.now() - n.timestamp.getTime() < (n.duration || 5000)
    )
  )

  const unreadCount = computed(() => notifications.value.length)

  // Actions
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      duration: notification.duration || 5000,
    }

    notifications.value.unshift(newNotification)

    // Keep only max notifications
    if (notifications.value.length > maxNotifications.value) {
      notifications.value = notifications.value.slice(0, maxNotifications.value)
    }

    // Auto-remove non-persistent notifications
    if (!newNotification.persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, newNotification.duration)
    }

    return newNotification.id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  const success = (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => {
    return addNotification({
      title,
      message,
      type: 'success',
      ...options,
    })
  }

  const error = (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => {
    return addNotification({
      title,
      message,
      type: 'error',
      persistent: true, // Errors should be persistent by default
      ...options,
    })
  }

  const warning = (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => {
    return addNotification({
      title,
      message,
      type: 'warning',
      ...options,
    })
  }

  const info = (
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => {
    return addNotification({
      title,
      message,
      type: 'info',
      ...options,
    })
  }

  return {
    // State
    notifications,
    maxNotifications,

    // Getters
    activeNotifications,
    unreadCount,

    // Actions
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }
})
