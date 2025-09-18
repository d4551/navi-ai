import { logger } from '@/shared/utils/logger'
import { useAppStore } from '@/stores/app'

// Normalize any thrown value into an Error-like object
export function normalizeError(err) {
  if (err instanceof Error) {
    return err
  }
  try {
    const message = typeof err === 'string' ? err : JSON.stringify(err)
    return new Error(message)
  } catch {
    return new Error(String(err))
  }
}

// Best-effort access to the store without coupling callers to Pinia setup
// Direct import is fine; store does not import this module

// Report an error with context; optionally update app error state
// opts: { level: 'warn'|'error'|'info'|'debug', storeKey?: 'api'|'network'|'validation', toast?: (msg)=>void }
export async function reportError(_context, err, opts = {}) {
  const { level = 'warn', storeKey } = opts
  const _error = normalizeError(err)
  const msg = `[${context}] ${error.message}`

  if (logger[level]) {
    logger[level](msg, error)
  } else {
    logger.warn(msg, error)
  }

  // Record to global store if available
  try {
    const store = useAppStore?.()
    if (store && storeKey) {
      store.setError(storeKey, error.message)
    }
  } catch (storeError) {
    console.error('Failed to record error to store:', storeError)
  }
}

export default reportError
