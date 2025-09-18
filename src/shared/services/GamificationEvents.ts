import { EventEmitter } from 'eventemitter3'

export type GamificationEventsMap = {
  xp_awarded: {
    amount: number
    reason?: string
    newXP?: number
    oldLevel?: number
    newLevel?: number
  }
  achievement_unlocked: {
    id: string
    name: string
    description?: string
    xp?: number
    icon?: string
  }
  level_up: {
    oldLevel: number
    newLevel: number
    title?: string
  }
  challenge_completed: {
    id: string
    type: 'daily' | 'weekly'
    xp: number
  }
}

class TypedEmitter<T extends Record<string, any>> {
  private emitter = new EventEmitter()

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void) {
    this.emitter.on(event as string, listener as any)
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void) {
    this.emitter.off(event as string, listener as any)
  }

  emit<K extends keyof T>(event: K, payload: T[K]) {
    this.emitter.emit(event as string, payload)
  }
}

export const gamificationEvents = new TypedEmitter<GamificationEventsMap>()

export default gamificationEvents
