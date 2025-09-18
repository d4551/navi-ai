/**
 * Crypto utilities for cross-environment ID generation
 * Provides fallback for environments without crypto.randomUUID
 */

// Generate UUID using crypto.randomUUID with fallback
export function generateUUID(): string {
  try {
    // Try crypto.randomUUID (Node.js 14.17+, modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    // Try window.crypto.randomUUID (browsers)
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID()
    }

    // Fallback to manual UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  } catch {
    // Final fallback to timestamp-based ID
    return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
}

// Generate crypto-strong random bytes if available
export function getRandomBytes(length: number): Uint8Array {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return crypto.getRandomValues(new Uint8Array(length))
    }

    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      return window.crypto.getRandomValues(new Uint8Array(length))
    }

    // Fallback to Math.random()
    const bytes = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
    return bytes
  } catch {
    // Final fallback
    const bytes = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
    return bytes
  }
}

// Generate short random ID (for non-UUID cases)
export function generateShortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const bytes = getRandomBytes(length)

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }

  return result
}

export default { generateUUID, getRandomBytes, generateShortId }
