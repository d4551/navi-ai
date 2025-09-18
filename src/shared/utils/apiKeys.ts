/**
 * Resolve Gemini API key from all available sources.
 * Order of precedence:
 * 1) Local settings (localStorage 'app-settings'.geminiApiKey)
 * 2) Electron secure store (window.api.secureStore.get('geminiApiKey'))
 * 3) Env (import.meta.env.VITE_GEMINI_API_KEY)
 */
import { unifiedStorage } from '@/utils/storage'

export async function resolveGeminiApiKey(): Promise<string | null> {
  // 1) Local storage settings
  try {
    // Common direct key cache
    const direct = localStorage.getItem('gemini_api_key')
    if (typeof direct === 'string' && direct.trim().length > 0) {
      return direct.trim()
    }

    const raw = localStorage.getItem('app-settings')
    if (raw) {
      const settings = JSON.parse(raw)
      if (
        settings &&
        typeof settings.geminiApiKey === 'string' &&
        settings.geminiApiKey.trim().length > 0
      ) {
        return settings.geminiApiKey.trim()
      }
    }
  } catch {}

  // 2) Unified preferences (IndexedDB) saved by the Settings store
  try {
    const prefs = await unifiedStorage.getPreferences?.()
    const key = (prefs && (prefs.geminiApiKey || prefs.data?.geminiApiKey)) as
      | string
      | undefined
    if (typeof key === 'string' && key.trim().length > 0) {
      return key.trim()
    }
  } catch {}

  // 2b) Persisted app state (local secure storage) where Pinia saves full state
  try {
    const saved = await unifiedStorage.get?.('navicv-data')
    const key = saved?.settings?.geminiApiKey
    if (typeof key === 'string' && key.trim().length > 0) {
      return key.trim()
    }
  } catch {}

  // 3) Electron secure store (if available)
  try {
    const secure = (window as any)?.api?.secureStore
    if (secure?.get) {
      const res = await secure.get('geminiApiKey')
      const key = (res && (res.data ?? res.value)) || null
      if (typeof key === 'string' && key.trim().length > 0) {
        return key.trim()
      }
    }
  } catch {}

  // 4) Env variables (Vite)
  try {
    const envKey =
      (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
      (globalThis as any)?.process?.env?.VITE_GEMINI_API_KEY
    if (typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim()
    }
  } catch {}

  return null
}

/**
 * Convenience guard to ensure a key exists. Throws with a friendly message otherwise.
 */
export async function requireGeminiApiKey(): Promise<string> {
  const key = await resolveGeminiApiKey()
  if (!key) throw new Error('API key is required')
  return key
}

/**
 * Resolve Google Cloud API key from available sources.
 * For now, this is the same as Gemini, but could be separated in the future.
 */
export async function resolveGoogleCloudApiKey(): Promise<string | null> {
  // For now, try to get Google Cloud specific key first, then fallback to Gemini key
  try {
    const raw = localStorage.getItem('app-settings')
    if (raw) {
      const settings = JSON.parse(raw)
      if (
        settings &&
        typeof settings.googleCloudApiKey === 'string' &&
        settings.googleCloudApiKey.trim().length > 0
      ) {
        return settings.googleCloudApiKey.trim()
      }
    }
  } catch {}

  // Fallback to Gemini key resolution for backward compatibility
  return resolveGeminiApiKey()
}

/**
 * Validate API key format and basic structure
 */
export function validateApiKeyFormat(
  apiKey: string,
  service: 'gemini' | 'google-cloud'
): { valid: boolean; message: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, message: 'API key is required' }
  }

  const trimmed = apiKey.trim()
  if (trimmed.length === 0) {
    return { valid: false, message: 'API key cannot be empty' }
  }

  // Basic format validation for Google API keys
  if (!trimmed.startsWith('AIzaSy')) {
    return {
      valid: false,
      message: 'Google API keys should start with "AIzaSy"',
    }
  }

  if (trimmed.length < 30 || trimmed.length > 50) {
    return { valid: false, message: 'API key length appears invalid' }
  }

  // Check for common issues
  if (
    trimmed.includes(' ') ||
    trimmed.includes('\n') ||
    trimmed.includes('\t')
  ) {
    return {
      valid: false,
      message: 'API key contains invalid whitespace characters',
    }
  }

  return { valid: true, message: 'API key format appears valid' }
}

/**
 * Test API key connectivity and permissions
 */
export async function testApiKey(
  apiKey: string,
  service: 'gemini' | 'google-cloud'
): Promise<{ success: boolean; message: string; details?: any }> {
  const formatCheck = validateApiKeyFormat(apiKey, service)
  if (!formatCheck.valid) {
    return { success: false, message: formatCheck.message }
  }

  try {
    if (service === 'gemini') {
      return await testGeminiApiKey(apiKey)
    } else if (service === 'google-cloud') {
      return await testGoogleCloudApiKey(apiKey)
    }

    return { success: false, message: 'Unknown service type' }
  } catch (error: any) {
    return {
      success: false,
      message: `API test failed: ${error.message}`,
      details: error,
    }
  }
}

/**
 * Test Gemini API key
 */
async function testGeminiApiKey(
  apiKey: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Gemini API key is valid and working',
        details: { modelsCount: data.models?.length || 0 },
      }
    } else {
      const errorText = await response.text()
      return {
        success: false,
        message: `Gemini API error (${response.status}): ${response.statusText}`,
        details: { status: response.status, error: errorText },
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Network error testing Gemini API: ${error.message}`,
      details: error,
    }
  }
}

/**
 * Test Google Cloud TTS API key
 */
async function testGoogleCloudApiKey(
  apiKey: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Test with a simple voices list request
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Google Cloud TTS API key is valid and working',
        details: { voicesCount: data.voices?.length || 0 },
      }
    } else {
      const errorText = await response.text()
      let message = `Google Cloud TTS API error (${response.status}): ${response.statusText}`

      if (response.status === 403) {
        message +=
          '\nPossible issues:\n• Text-to-Speech API not enabled\n• Insufficient permissions\n• Using wrong API key type'
      }

      return {
        success: false,
        message,
        details: { status: response.status, error: errorText },
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Network error testing Google Cloud TTS API: ${error.message}`,
      details: error,
    }
  }
}
