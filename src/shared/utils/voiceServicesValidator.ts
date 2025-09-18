/**
 * Voice Services Validator
 *
 * Utility to check if all voice service dependencies are available
 * and properly configured in the browser environment.
 */

import { logger } from '@/shared/utils/logger'

export interface VoiceServicesCapabilities {
  webSocket: boolean
  audioContext: boolean
  getUserMedia: boolean
  getDisplayMedia: boolean
  webRTC: boolean
  mediaRecorder: boolean
  fullSupport: boolean
}

export interface VoiceServicesErrors {
  missing: string[]
  warnings: string[]
}

/**
 * Check all voice service capabilities
 */
export function checkVoiceServicesCapabilities(): VoiceServicesCapabilities {
  const capabilities = {
    webSocket: typeof WebSocket !== 'undefined',
    audioContext:
      typeof AudioContext !== 'undefined' ||
      typeof (window as any).webkitAudioContext !== 'undefined',
    getUserMedia: !!(
      navigator.mediaDevices?.getUserMedia || (navigator as any).getUserMedia
    ),
    getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
    webRTC: !!(
      window.RTCPeerConnection || (window as any).webkitRTCPeerConnection
    ),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    fullSupport: false,
  }

  capabilities.fullSupport =
    capabilities.webSocket &&
    capabilities.audioContext &&
    capabilities.getUserMedia

  return capabilities
}

/**
 * Get detailed error information about missing capabilities
 */
export function getVoiceServicesErrors(): VoiceServicesErrors {
  const capabilities = checkVoiceServicesCapabilities()
  const errors: VoiceServicesErrors = {
    missing: [],
    warnings: [],
  }

  if (!capabilities.webSocket) {
    errors.missing.push('WebSocket API not available')
  }

  if (!capabilities.audioContext) {
    errors.missing.push('AudioContext API not available')
  }

  if (!capabilities.getUserMedia) {
    errors.missing.push(
      'getUserMedia API not available - microphone access not supported'
    )
  }

  if (!capabilities.getDisplayMedia) {
    errors.warnings.push(
      'getDisplayMedia API not available - screen capture not supported'
    )
  }

  if (!capabilities.webRTC) {
    errors.warnings.push('WebRTC not available - some features may be limited')
  }

  if (!capabilities.mediaRecorder) {
    errors.warnings.push(
      'MediaRecorder API not available - recording features limited'
    )
  }

  return errors
}

/**
 * Test audio context creation
 */
export async function testAudioContext(): Promise<{
  success: boolean
  error?: string
  requiresUserGesture?: boolean
}> {
  try {
    let audioContext: AudioContext

    if (typeof AudioContext !== 'undefined') {
      audioContext = new AudioContext()
    } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
      audioContext = new (window as any).webkitAudioContext()
    } else {
      return { success: false, error: 'AudioContext not supported' }
    }

    // Check if AudioContext is available (don't try to resume without user gesture)
    if (audioContext.state === 'suspended') {
      // This is expected behavior - AudioContext requires user interaction
      // We'll consider this as supported but requiring user gesture
      await audioContext.close()
      return { success: true, requiresUserGesture: true }
    }

    // Clean up
    if (audioContext.state !== 'closed') {
      await audioContext.close()
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown audio context error',
    }
  }
}

/**
 * Test microphone access
 */
export async function testMicrophoneAccess(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    // Clean up immediately
    stream.getTracks().forEach(track => track.stop())

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Microphone access denied',
    }
  }
}

/**
 * Test camera access
 */
export async function testCameraAccess(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    })

    // Clean up immediately
    stream.getTracks().forEach(track => track.stop())

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Camera access denied',
    }
  }
}

/**
 * Test screen sharing access
 */
export async function testScreenShareAccess(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    })

    // Clean up immediately
    stream.getTracks().forEach(track => track.stop())

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Screen sharing access denied',
    }
  }
}

/**
 * Run comprehensive voice services diagnostics
 */
export async function runVoiceServicesDiagnostics(
  options: { invasive?: boolean } = {}
): Promise<{
  capabilities: VoiceServicesCapabilities
  errors: VoiceServicesErrors
  tests: {
    audioContext: { success: boolean; error?: string }
    microphone: { success: boolean; error?: string }
    camera: { success: boolean; error?: string }
    screenShare: { success: boolean; error?: string }
  }
}> {
  logger.info('[SEARCH] Running voice services diagnostics...')

  const capabilities = checkVoiceServicesCapabilities()
  const errors = getVoiceServicesErrors()

  const audioContextTest = await testAudioContext()
  // Only perform permission-requesting tests when explicitly asked
  const invasive = options?.invasive === true
  const microphoneTest = invasive
    ? await testMicrophoneAccess()
    : { success: false, error: 'skipped (non-invasive)' }
  const cameraTest = invasive
    ? await testCameraAccess()
    : { success: false, error: 'skipped (non-invasive)' }
  const screenShareTest = invasive
    ? await testScreenShareAccess()
    : { success: false, error: 'skipped (non-invasive)' }

  const results = {
    capabilities,
    errors,
    tests: {
      audioContext: audioContextTest,
      microphone: microphoneTest,
      camera: cameraTest,
      screenShare: screenShareTest,
    },
  }

  // Log results
  logger.info('Voice Services Diagnostics Results:', {
    fullSupport: capabilities.fullSupport,
    missingFeatures: errors.missing.length,
    warnings: errors.warnings.length,
  })

  if (errors.missing.length > 0) {
    logger.error('Missing required features:', errors.missing)
  }

  if (errors.warnings.length > 0) {
    logger.warn('Optional features not available:', errors.warnings)
  }

  return results
}

/**
 * Get user-friendly voice services status message
 */
export function getVoiceServicesStatusMessage(
  capabilities: VoiceServicesCapabilities
): string {
  if (capabilities.fullSupport) {
    return '✅ Voice services fully supported'
  }

  const missing = []
  if (!capabilities.webSocket) missing.push('WebSocket')
  if (!capabilities.audioContext) missing.push('AudioContext')
  if (!capabilities.getUserMedia) missing.push('Microphone')

  if (missing.length === 0) {
    return '[WARNING] Voice services supported with some limitations'
  }

  return `❌ Voice services not supported. Missing: ${missing.join(', ')}`
}
