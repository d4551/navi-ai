/**
 * Consolidated Audio Service - Single source of truth for all audio operations
 * Replaces scattered getUserMedia and speechSynthesis calls
 * Designed for Electron security with main process delegation
 */

import { logger } from '@/shared/utils/logger'
import type { AudioDevice, VoiceSettings } from '../types/interview'

export interface AudioRecordingOptions {
  deviceId?: string
  sampleRate?: number
  channelCount?: number
  echoCancellation?: boolean
  noiseSuppression?: boolean
}

export interface PushToTalkOptions {
  key?: string // Default: 'Space'
  requireCtrl?: boolean
  requireAlt?: boolean
}

export class AudioService {
  private static instance: AudioService

  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private isRecording = false
  private isPushToTalkMode = false
  private pushToTalkKeys = new Set<string>()

  // Audio level monitoring
  private volumeCallback: ((volume: number) => void) | null = null
  private volumeCheckInterval: number | null = null

  // Speech synthesis (consolidated)
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []

  // Device management
  private availableDevices: AudioDevice[] = []
  private selectedInputDevice: string | null = null
  private selectedOutputDevice: string | null = null

  // Monitor-only resources (no recording)
  private monitorStream: MediaStream | null = null
  private monitorContext: AudioContext | null = null
  private monitorAnalyser: AnalyserNode | null = null
  private monitorInterval: number | null = null

  private constructor() {
    // Provide a safe fallback for non-browser/test environments
    const hasSynthesis =
      typeof window !== 'undefined' && 'speechSynthesis' in window
    this.synthesis = hasSynthesis
      ? window.speechSynthesis
      : ({
          speak: () => undefined,
          cancel: () => undefined,
          getVoices: () => [],
          speaking: false,
          onvoiceschanged: null as any,
        } as unknown as SpeechSynthesis)
    this.initializeVoices()
    this.setupPushToTalkListeners()

    // Attempt to hydrate preferred devices from app settings (non-blocking)
    try {
      const getSettings = (window as any)?.api?.app?.getSettings
      if (typeof getSettings === 'function') {
        getSettings()
          .then((res: any) => {
            const data = res?.data || res // handler may return { success, data }
            const micId = data?.selectedMicId || data?.microphoneId
            const spkId = data?.selectedSpeakerId || data?.speakerId
            if (micId) this.selectedInputDevice = micId
            if (spkId) this.selectedOutputDevice = spkId
          })
          .catch(() => {
            /* ignore */
          })
      }
    } catch {
      /* ignore */
    }
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  // Device enumeration and selection
  async getAvailableDevices(): Promise<AudioDevice[]> {
    try {
      // Non-invasive device enumeration: do not request permission here
      const devices = await navigator.mediaDevices.enumerateDevices()
      this.availableDevices = devices
        .filter(
          device =>
            device.kind === 'audioinput' || device.kind === 'audiooutput'
        )
        .map(device => ({
          deviceId: device.deviceId,
          label:
            device.label ||
            `${device.kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'audioinput' | 'audiooutput',
          groupId: device.groupId,
        }))

      return this.availableDevices
    } catch (error) {
      logger.error('Failed to enumerate audio devices:', error)
      return []
    }
  }

  // Preferred device setters/getters
  setPreferredInputDevice(deviceId?: string): void {
    this.selectedInputDevice = deviceId || null
    try {
      ;(window as any)?.api?.app?.updateSettings?.({
        selectedMicId: deviceId || '',
      })
    } catch {}
  }

  async setPreferredOutputDevice(deviceId?: string): Promise<boolean> {
    this.selectedOutputDevice = deviceId || null
    try {
      ;(window as any)?.api?.app?.updateSettings?.({
        selectedSpeakerId: deviceId || '',
      })
    } catch {}

    // Best-effort capability check using a temporary element
    try {
      if (!deviceId) return true
      const audio = new window.Audio()
      if (typeof (audio as any).setSinkId === 'function') {
        await (audio as any).setSinkId(deviceId)
        return true
      }
    } catch {
      /* ignore */
    }
    return false
  }

  getPreferredDevices(): { input?: string | null; output?: string | null } {
    return {
      input: this.selectedInputDevice,
      output: this.selectedOutputDevice,
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      logger.warn('Microphone permission denied:', error)
      return false
    }
  }

  // Recording functionality with push-to-talk support
  async startRecording(options: AudioRecordingOptions = {}): Promise<boolean> {
    try {
      if (this.isRecording) {
        logger.warn('Already recording')
        return false
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: options.deviceId ? { exact: options.deviceId } : undefined,
          sampleRate: options.sampleRate || 44100,
          channelCount: options.channelCount || 1,
          echoCancellation: options.echoCancellation ?? true,
          noiseSuppression: options.noiseSuppression ?? true,
          autoGainControl: true,
        },
      }

      // fallback to preferred input if not specified
      const preferred =
        this.selectedInputDevice && !options.deviceId
          ? { deviceId: { exact: this.selectedInputDevice } as any }
          : undefined
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { ...(constraints.audio as any), ...(preferred || {}) },
      })

      // Set up audio context for volume monitoring
      this.setupAudioAnalysis()

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      const chunks: Blob[] = []

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        this.onRecordingComplete?.(audioBlob)
      }

      this.mediaRecorder.start()
      this.isRecording = true

      logger.info('Audio recording started')
      return true
    } catch (error) {
      logger.error('Failed to start recording:', error)
      this.cleanup()
      return false
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise(resolve => {
      if (!this.isRecording || !this.mediaRecorder) {
        resolve(null)
        return
      }

      this.onRecordingComplete = (blob: Blob) => {
        resolve(blob)
        this.cleanup()
      }

      this.mediaRecorder.stop()
      this.isRecording = false
    })
  }

  // Push-to-talk functionality
  enablePushToTalk(options: PushToTalkOptions = {}): void {
    this.isPushToTalkMode = true
    this.pushToTalkOptions = {
      key: options.key || 'Space',
      requireCtrl: options.requireCtrl || false,
      requireAlt: options.requireAlt || false,
    }
  }

  disablePushToTalk(): void {
    this.isPushToTalkMode = false
    if (this.isRecording) {
      this.pauseRecording()
    }
  }

  private setupPushToTalkListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isPushToTalkMode) return

    const options = this.pushToTalkOptions || { key: 'Space' }

    if (
      event.code === options.key &&
      (!options.requireCtrl || event.ctrlKey) &&
      (!options.requireAlt || event.altKey)
    ) {
      if (!this.pushToTalkKeys.has(event.code)) {
        this.pushToTalkKeys.add(event.code)
        this.resumeRecording()
      }
      event.preventDefault()
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isPushToTalkMode) return

    if (this.pushToTalkKeys.has(event.code)) {
      this.pushToTalkKeys.delete(event.code)
      if (this.pushToTalkKeys.size === 0) {
        this.pauseRecording()
      }
      event.preventDefault()
    }
  }

  private pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
    }
  }

  private resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
    } else if (!this.isRecording) {
      this.startRecording({ deviceId: this.selectedInputDevice || undefined })
    }
  }

  // Lightweight input monitoring without recording
  async startMonitoring(
    deviceId?: string,
    onLevel?: (level01: number) => void
  ): Promise<void> {
    try {
      this.stopMonitoring()
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      }
      this.monitorStream =
        await navigator.mediaDevices.getUserMedia(constraints)
      this.monitorContext = new AudioContext()
      this.monitorAnalyser = this.monitorContext.createAnalyser()
      this.monitorAnalyser.fftSize = 256
      const source = this.monitorContext.createMediaStreamSource(
        this.monitorStream
      )
      source.connect(this.monitorAnalyser)

      const dataArray = new Uint8Array(this.monitorAnalyser.frequencyBinCount)
      const tick = () => {
        if (!this.monitorAnalyser) {
          return
        }
        this.monitorAnalyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++)
          sum += dataArray[i] * dataArray[i]
        const rms = Math.sqrt(sum / dataArray.length)
        const level = Math.min(1, rms / 128)
        if (onLevel) onLevel(level)
      }
      this.monitorInterval = window.setInterval(tick, 50)
    } catch (error) {
      logger.warn('Failed to start input monitoring:', error)
      this.stopMonitoring()
      throw error
    }
  }

  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }
    if (this.monitorContext && this.monitorContext.state !== 'closed') {
      this.monitorContext.close()
    }
    this.monitorContext = null
    this.monitorAnalyser = null
    if (this.monitorStream) {
      this.monitorStream.getTracks().forEach(t => t.stop())
      this.monitorStream = null
    }
  }

  // Audio level monitoring
  private setupAudioAnalysis(): void {
    if (!this.mediaStream) return

    try {
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.analyser = this.audioContext.createAnalyser()

      this.analyser.fftSize = 256
      source.connect(this.analyser)

      this.startVolumeMonitoring()
    } catch (error) {
      logger.error('Failed to setup audio analysis:', error)
    }
  }

  private startVolumeMonitoring(): void {
    if (!this.analyser) return

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    const checkVolume = () => {
      if (!this.analyser || !this.isRecording) return

      this.analyser.getByteFrequencyData(dataArray)

      // Calculate RMS volume
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sum / dataArray.length)
      const volume = Math.min(1, rms / 128) // Normalize to 0-1

      this.volumeCallback?.(volume)
    }

    this.volumeCheckInterval = window.setInterval(checkVolume, 50) // 20 FPS
  }

  setVolumeCallback(callback: (volume: number) => void): void {
    this.volumeCallback = callback
  }

  // Speech synthesis (consolidated from multiple components)
  private initializeVoices(): void {
    const loadVoices = () => {
      try {
        if (this.synthesis && typeof this.synthesis.getVoices === 'function') {
          this.voices = this.synthesis.getVoices() || []
        } else {
          this.voices = []
        }
      } catch {
        this.voices = []
      }
    }

    loadVoices()
    // Guard assignment when onvoiceschanged is supported
    try {
      if ('onvoiceschanged' in this.synthesis) {
        ;(this.synthesis as any).onvoiceschanged = loadVoices
      }
    } catch {
      /* noop for test env */
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  async speak(
    text: string,
    settings: VoiceSettings = {
      rate: 1,
      pitch: 1,
      volume: 1,
      language: 'en-US',
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop current speech
        this.stopSpeaking()

        const utterance = new SpeechSynthesisUtterance(text)

        // Apply settings
        const rate = (settings as any).rate
        const pitch = (settings as any).pitch
        const volume = (settings as any).volume
        const language =
          (settings as any).language ?? (settings as any).lang ?? 'en-US'
        utterance.rate = Math.max(
          0.1,
          Math.min(10, typeof rate === 'number' ? rate : 1)
        )
        utterance.pitch = Math.max(
          0,
          Math.min(2, typeof pitch === 'number' ? pitch : 1)
        )
        utterance.volume = Math.max(
          0,
          Math.min(1, typeof volume === 'number' ? volume : 1)
        )
        utterance.lang =
          typeof language === 'string' && language ? language : 'en-US'

        // Find and set voice
        if (settings.voiceId) {
          const voice = this.voices.find(v => v.name === settings.voiceId)
          if (voice) {
            utterance.voice = voice
          }
        }

        utterance.onend = () => {
          resolve()
        }

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          const err = (event && (event as any).error) || ''
          // Treat common non-fatal endings as resolved to avoid noisy UX
          if (err === 'interrupted' || err === 'canceled') {
            resolve()
            return
          }
          const error = new Error(
            `Speech synthesis failed: ${err || 'Unknown error'}`
          )
          error.name = 'SpeechSynthesisError'
          reject(error)
        }

        this.synthesis.speak(utterance)
      } catch (error) {
        reject(error)
      }
    })
  }

  stopSpeaking(): void {
    try {
      if (this.synthesis && (this.synthesis as any).speaking) {
        this.synthesis.cancel()
      }
    } catch {
      // ignore in non-browser environments
    }
  }

  isSpeaking(): boolean {
    try {
      return !!(this.synthesis && (this.synthesis as any).speaking)
    } catch {
      return false
    }
  }

  // Cleanup and resource management
  private cleanup(): void {
    // Stop volume monitoring
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval)
      this.volumeCheckInterval = null
    }

    // Clean up audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    // Reset recording state
    this.mediaRecorder = null
    this.analyser = null
    this.isRecording = false

    // Stop monitor state too
    this.stopMonitoring()
  }

  // Apply preferred output device to an HTMLMediaElement if supported
  async applyOutputDevice(el: HTMLMediaElement): Promise<void> {
    try {
      if (!this.selectedOutputDevice) return
      const sinkIdFn = (el as any).setSinkId
      if (typeof sinkIdFn === 'function') {
        await sinkIdFn.call(el, this.selectedOutputDevice)
      }
    } catch {
      /* ignore */
    }
  }

  // Getters
  get isCurrentlyRecording(): boolean {
    return this.isRecording
  }

  get isPushToTalkActive(): boolean {
    return this.isPushToTalkMode
  }

  get supportedFeatures(): {
    recording: boolean
    synthesis: boolean
    deviceSelection: boolean
    pushToTalk: boolean
  } {
    return {
      recording:
        'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      synthesis: 'speechSynthesis' in window,
      deviceSelection:
        'mediaDevices' in navigator &&
        'enumerateDevices' in navigator.mediaDevices,
      pushToTalk: true, // Always available
    }
  }

  // Private properties
  private onRecordingComplete: ((blob: Blob) => void) | null = null
  private pushToTalkOptions: PushToTalkOptions | null = null
}

// Export singleton instance
export const audioService = AudioService.getInstance()

// Convenience exports for backward compatibility
export const getAudioService = () => audioService
export const startRecording = (options?: AudioRecordingOptions) =>
  audioService.startRecording(options)
export const stopRecording = () => audioService.stopRecording()
export const speak = (text: string, settings?: VoiceSettings) =>
  audioService.speak(text, settings)
export const stopSpeaking = () => audioService.stopSpeaking()
export const startMonitoring = (
  deviceId?: string,
  onLevel?: (level01: number) => void
) => audioService.startMonitoring(deviceId, onLevel)
export const stopMonitoring = () => audioService.stopMonitoring()
export const setPreferredInputDevice = (deviceId?: string) =>
  audioService.setPreferredInputDevice(deviceId)
export const setPreferredOutputDevice = (deviceId?: string) =>
  audioService.setPreferredOutputDevice(deviceId)
export const applyOutputDevice = (el: HTMLMediaElement) =>
  audioService.applyOutputDevice(el)
