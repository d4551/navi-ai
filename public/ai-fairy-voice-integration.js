/**
 * AI Fairy Voice Integration
 * Complete integration script for TTS/STT functionality in AI Fairy Chat
 */

// Global namespace for AI Fairy voice integration
window.AIFairyVoice = {
  // Voice configuration state
  config: {
    ttsProvider: 'system',
    sttProvider: 'system',
    speechRate: 0.85,
    speechPitch: 1.0,
    speechVolume: 0.9,
    voiceMode: false,
    voiceLang: 'en-US',
    geminiApiKey: '',
    ttsVoice: '',
    kokoroModel: 'default',
    autoSpeak: false,
    continuousListening: false,
  },

  // Voice services
  services: {
    tts: null,
    stt: null,
    audio: null,
  },

  // State management
  state: {
    isInitialized: false,
    isSpeaking: false,
    isListening: false,
    lastError: null,
    supportedVoices: [],
    currentSession: null,
  },

  // Event listeners
  listeners: new Map(),

  /**
   * Initialize the AI Fairy voice system
   */
  async init() {
    console.log('🧚‍♀️ Initializing AI Fairy Voice System...')

    try {
      // Load settings from localStorage
      await this.loadSettings()

      // Initialize voice services
      await this.initializeServices()

      // Set up event listeners
      this.setupEventListeners()

      // Initialize fairy-specific features
      await this.initializeFairyFeatures()

      this.state.isInitialized = true
      console.log('✅ AI Fairy Voice System initialized successfully')

      // Emit initialization event
      this.emit('initialized', { config: this.config, state: this.state })

      return true
    } catch (error) {
      console.error('❌ Failed to initialize AI Fairy Voice System:', error)
      this.state.lastError = error
      return false
    }
  },

  /**
   * Load settings from localStorage and apply defaults
   */
  async loadSettings() {
    try {
      const appSettings = JSON.parse(
        localStorage.getItem('app-settings') || '{}'
      )
      const fairySettings = JSON.parse(
        localStorage.getItem('ai-fairy-voice-settings') || '{}'
      )

      // Merge settings with priorities: fairy-specific > app-wide > defaults
      this.config = {
        ...this.config,
        ...appSettings,
        ...fairySettings,
      }

      // Validate and sanitize settings
      this.validateSettings()

      console.log('Settings loaded:', this.config)
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error)
    }
  },

  /**
   * Validate and sanitize settings
   */
  validateSettings() {
    // Validate TTS provider
    const validTTSProviders = ['system', 'gemini', 'kokoro']
    if (!validTTSProviders.includes(this.config.ttsProvider)) {
      this.config.ttsProvider = 'system'
    }

    // Validate STT provider
    const validSTTProviders = ['system', 'gemini']
    if (!validSTTProviders.includes(this.config.sttProvider)) {
      this.config.sttProvider = 'system'
    }

    // Validate numeric ranges
    this.config.speechRate = Math.max(
      0.1,
      Math.min(3.0, this.config.speechRate || 0.85)
    )
    this.config.speechPitch = Math.max(
      0.0,
      Math.min(2.0, this.config.speechPitch || 1.0)
    )
    this.config.speechVolume = Math.max(
      0.0,
      Math.min(1.0, this.config.speechVolume || 0.9)
    )

    // Validate language
    if (!this.config.voiceLang || typeof this.config.voiceLang !== 'string') {
      this.config.voiceLang = 'en-US'
    }
  },

  /**
   * Initialize voice services based on configuration
   */
  async initializeServices() {
    // Initialize TTS service
    switch (this.config.ttsProvider) {
      case 'system':
        await this.initializeSystemTTS()
        break
      case 'gemini':
        await this.initializeGeminiTTS()
        break
      case 'kokoro':
        await this.initializeKokoroTTS()
        break
    }

    // Initialize STT service
    switch (this.config.sttProvider) {
      case 'system':
        await this.initializeSystemSTT()
        break
      case 'gemini':
        await this.initializeGeminiSTT()
        break
    }

    // Initialize audio context for advanced features
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.services.audio = new AudioContext()
    }
  },

  /**
   * Initialize System TTS
   */
  async initializeSystemTTS() {
    if (!('speechSynthesis' in window)) {
      throw new Error('System TTS not supported')
    }

    const synthesis = window.speechSynthesis

    // Load available voices
    const loadVoices = () => {
      this.state.supportedVoices = synthesis.getVoices()
      console.log(`Loaded ${this.state.supportedVoices.length} system voices`)
    }

    loadVoices()
    synthesis.onvoiceschanged = loadVoices

    this.services.tts = {
      type: 'system',
      speak: this.systemSpeak.bind(this),
      stop: () => synthesis.cancel(),
      pause: () => synthesis.pause(),
      resume: () => synthesis.resume(),
    }
  },

  /**
   * Initialize Gemini TTS
   */
  async initializeGeminiTTS() {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    try {
      // Try to import Gemini Live API
      const { MultimodalLiveService } = await import(
        '/src/services/MultimodalLiveService.js'
      )

      this.services.tts = {
        type: 'gemini',
        speak: this.geminiSpeak.bind(this),
        stop: this.geminiStop.bind(this),
        service: new MultimodalLiveService(this.config.geminiApiKey),
      }

      console.log('✅ Gemini TTS service initialized')
    } catch (error) {
      console.warn('Failed to initialize Gemini TTS:', error)
      // Fallback to system TTS
      await this.initializeSystemTTS()
    }
  },

  /**
   * Initialize Kokoro TTS
   */
  async initializeKokoroTTS() {
    try {
      // Try to import Kokoro
      const KokoroModule = await import('kokoro-js')

      this.services.tts = {
        type: 'kokoro',
        speak: this.kokoroSpeak.bind(this),
        stop: this.kokoroStop.bind(this),
        kokoro: KokoroModule,
      }

      console.log('✅ Kokoro TTS service initialized')
    } catch (error) {
      console.warn('Failed to initialize Kokoro TTS:', error)
      // Fallback to system TTS
      await this.initializeSystemTTS()
    }
  },

  /**
   * Initialize System STT
   */
  async initializeSystemSTT() {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition

    if (!SpeechRecognition) {
      throw new Error('System STT not supported')
    }

    this.services.stt = {
      type: 'system',
      listen: this.systemListen.bind(this),
      stop: this.systemStopListening.bind(this),
      SpeechRecognition,
    }
  },

  /**
   * Initialize Gemini STT
   */
  async initializeGeminiSTT() {
    // For now, fallback to system STT as Gemini STT is more complex
    await this.initializeSystemSTT()
  },

  /**
   * Setup event listeners for fairy integration
   */
  setupEventListeners() {
    // Listen for fairy chat messages
    this.on('fairy-message', this.handleFairyMessage.bind(this))

    // Listen for user interactions
    this.on('user-input', this.handleUserInput.bind(this))

    // Listen for voice mode changes
    this.on('voice-mode-change', this.handleVoiceModeChange.bind(this))

    // Listen for settings changes
    this.on('settings-change', this.handleSettingsChange.bind(this))
  },

  /**
   * Initialize fairy-specific features
   */
  async initializeFairyFeatures() {
    // Set up fairy voice personality
    if (this.config.ttsProvider === 'system') {
      // Try to find a suitable fairy voice
      const fairyVoice = this.findFairyVoice()
      if (fairyVoice) {
        this.config.ttsVoice = fairyVoice.name
        console.log('🧚‍♀️ Selected fairy voice:', fairyVoice.name)
      }
    }

    // Set up fairy speech patterns
    this.fairyPatterns = {
      greetings: ['Hello there!', 'Hi sweetie!', 'Greetings, dear!'],
      encouragements: ['You can do it!', 'Great job!', 'Excellent work!'],
      farewells: ['See you later!', 'Goodbye for now!', 'Take care!'],
    }

    // Initialize fairy sound effects
    this.fairySounds = {
      chime: '/public/sounds/fairy-chime.mp3',
      sparkle: '/public/sounds/fairy-sparkle.mp3',
      magic: '/public/sounds/fairy-magic.mp3',
    }
  },

  /**
   * Find a suitable voice for the fairy
   */
  findFairyVoice() {
    const voices = this.state.supportedVoices

    // Prefer female voices with higher pitch
    const femaleVoices = voices.filter(
      voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('samantha')
    )

    if (femaleVoices.length > 0) {
      return femaleVoices[0]
    }

    // Fallback to any voice with suitable language
    const langVoices = voices.filter(voice =>
      voice.lang.startsWith(this.config.voiceLang.split('-')[0])
    )

    return langVoices.length > 0 ? langVoices[0] : voices[0]
  },

  /**
   * Speak text using current TTS provider
   */
  async speak(text, options = {}) {
    if (!this.state.isInitialized || !this.services.tts) {
      throw new Error('Voice system not initialized')
    }

    if (this.state.isSpeaking) {
      await this.stop()
    }

    const finalOptions = {
      ...this.config,
      ...options,
    }

    this.state.isSpeaking = true
    this.emit('speech-start', { text, options: finalOptions })

    try {
      await this.services.tts.speak(text, finalOptions)
      this.emit('speech-end', { text })
    } catch (error) {
      this.emit('speech-error', { text, error })
      throw error
    } finally {
      this.state.isSpeaking = false
    }
  },

  /**
   * Stop current speech
   */
  async stop() {
    if (this.services.tts && this.services.tts.stop) {
      this.services.tts.stop()
    }
    this.state.isSpeaking = false
    this.emit('speech-stop')
  },

  /**
   * Listen for speech input
   */
  async listen(options = {}) {
    if (!this.state.isInitialized || !this.services.stt) {
      throw new Error('Speech recognition not initialized')
    }

    if (this.state.isListening) {
      await this.stopListening()
    }

    const finalOptions = {
      ...this.config,
      ...options,
    }

    this.state.isListening = true
    this.emit('listen-start', { options: finalOptions })

    try {
      const result = await this.services.stt.listen(finalOptions)
      this.emit('listen-result', { result })
      return result
    } catch (error) {
      this.emit('listen-error', { error })
      throw error
    } finally {
      this.state.isListening = false
    }
  },

  /**
   * Stop listening
   */
  async stopListening() {
    if (this.services.stt && this.services.stt.stop) {
      this.services.stt.stop()
    }
    this.state.isListening = false
    this.emit('listen-stop')
  },

  /**
   * System TTS implementation
   */
  async systemSpeak(text, options) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      const synthesis = window.speechSynthesis

      // Apply settings
      utterance.rate = options.speechRate || this.config.speechRate
      utterance.pitch = options.speechPitch || this.config.speechPitch
      utterance.volume = options.speechVolume || this.config.speechVolume
      utterance.lang = options.voiceLang || this.config.voiceLang

      // Select voice
      if (options.ttsVoice || this.config.ttsVoice) {
        const voice = this.state.supportedVoices.find(
          v => v.name === (options.ttsVoice || this.config.ttsVoice)
        )
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onend = () => resolve()
      utterance.onerror = event => reject(new Error(event.error))

      synthesis.speak(utterance)
    })
  },

  /**
   * Gemini TTS implementation
   */
  async geminiSpeak(text, options) {
    if (!this.services.tts.gemini) {
      throw new Error('Gemini service not available')
    }

    // Since Gemini doesn't have direct TTS API, we'll use the system TTS with enhanced parameters
    try {
      // Get API key for potential future Gemini TTS integration
      const apiKey = localStorage.getItem('gemini_api_key')
      if (!apiKey) {
        console.warn('No Gemini API key found, using system TTS')
        return this.systemSpeak(text, options)
      }

      // For now, use enhanced system TTS with better voice parameters
      // In the future, this could integrate with Google Cloud TTS API using the Gemini key
      const enhancedOptions = {
        ...options,
        voice: this.findBestSystemVoice(options?.voice || 'default'),
        rate: Math.max(0.5, Math.min(2.0, options?.rate || 1.0)),
        pitch: Math.max(0.0, Math.min(2.0, options?.pitch || 1.0)),
      }

      return this.systemSpeak(text, enhancedOptions)
    } catch (error) {
      console.warn('Enhanced TTS failed, falling back to basic system:', error)
      return this.systemSpeak(text, options)
    }
  },

  /**
   * Kokoro TTS implementation
   */
  async kokoroSpeak(text, options) {
    if (!this.services.tts.kokoro) {
      throw new Error('Kokoro module not available')
    }

    try {
      // Use the actual Kokoro TTS implementation
      const voice = options?.voice || 'af_bella'
      const audio = await this.services.tts.kokoro.generate(text, { voice })

      if (audio) {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext
        const audioContext = new AudioContextClass()
        const audioBuffer = await audioContext.decodeAudioData(audio.buffer)
        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContext.destination)
        source.start()

        return new Promise(resolve => {
          source.onended = resolve
        })
      } else {
        return this.systemSpeak(text, options)
      }
    } catch (error) {
      console.warn('Kokoro TTS failed, falling back to system:', error)
      return this.systemSpeak(text, options)
    }
  },

  /**
   * Find the best system voice for the given preference
   */
  findBestSystemVoice(preferredVoice) {
    if (typeof speechSynthesis === 'undefined') {
      return null
    }

    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) {
      return null
    }

    // Try to find exact match first
    let voice = voices.find(v =>
      v.name.toLowerCase().includes(preferredVoice.toLowerCase())
    )

    // Fallback to language preferences
    if (!voice) {
      voice =
        voices.find(
          v =>
            v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
        ) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0]
    }

    return voice
  },

  /**
   * System STT implementation
   */
  async systemListen(options) {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = this.services.stt.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous =
        options.continuousListening || this.config.continuousListening
      recognition.interimResults = true
      recognition.lang = options.voiceLang || this.config.voiceLang

      let finalTranscript = ''

      recognition.onresult = event => {
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        this.emit('listen-interim', {
          interim: interimTranscript,
          final: finalTranscript,
        })
      }

      recognition.onend = () => {
        resolve({
          transcript: finalTranscript,
          confidence: 1.0,
          isFinal: true,
        })
      }

      recognition.onerror = event => {
        reject(new Error(event.error))
      }

      recognition.start()

      // Store recognition instance for stopping
      this.state.currentSession = recognition
    })
  },

  /**
   * Stop system listening
   */
  systemStopListening() {
    if (this.state.currentSession) {
      this.state.currentSession.stop()
      this.state.currentSession = null
    }
  },

  /**
   * Handle fairy messages for auto-speak
   */
  handleFairyMessage(data) {
    if (this.config.autoSpeak && data.message) {
      const fairyText = this.addFairyPersonality(data.message)
      this.speak(fairyText).catch(error => {
        console.warn('Failed to speak fairy message:', error)
      })
    }
  },

  /**
   * Add fairy personality to text
   */
  addFairyPersonality(text) {
    // Add sparkle emojis and fairy expressions
    const sparkles = ['✨', '🌟', '💫', '⭐']
    const randomSparkle = sparkles[Math.floor(Math.random() * sparkles.length)]

    // Add some fairy magic to the text
    if (Math.random() < 0.3) {
      return `${randomSparkle} ${text} ${randomSparkle}`
    }

    return text
  },

  /**
   * Handle user input for voice commands
   */
  handleUserInput(data) {
    if (this.config.voiceMode && data.type === 'voice') {
      // Process voice commands
      this.processVoiceCommand(data.input)
    }
  },

  /**
   * Process voice commands
   */
  processVoiceCommand(command) {
    const lowerCommand = command.toLowerCase()

    // Fairy-specific commands
    if (lowerCommand.includes('fairy') || lowerCommand.includes('help')) {
      this.speak(
        "Hello! I'm your AI fairy assistant. How can I help you today?"
      )
    } else if (
      lowerCommand.includes('stop') ||
      lowerCommand.includes('quiet')
    ) {
      this.stop()
    } else if (lowerCommand.includes('listen')) {
      this.listen()
    } else {
      // Forward to main application
      this.emit('voice-command', { command })
    }
  },

  /**
   * Handle voice mode changes
   */
  handleVoiceModeChange(data) {
    this.config.voiceMode = data.enabled
    this.saveSettings()

    if (data.enabled) {
      this.speak("Voice mode enabled! I'm listening for your commands.")
    }
  },

  /**
   * Handle settings changes
   */
  handleSettingsChange(data) {
    Object.assign(this.config, data.settings)
    this.validateSettings()
    this.saveSettings()

    // Reinitialize if provider changed
    if (data.providerChanged) {
      this.initializeServices().catch(error => {
        console.error('Failed to reinitialize services:', error)
      })
    }
  },

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      // Save to both app settings and fairy-specific settings
      const appSettings = JSON.parse(
        localStorage.getItem('app-settings') || '{}'
      )
      Object.assign(appSettings, this.config)
      localStorage.setItem('app-settings', JSON.stringify(appSettings))

      localStorage.setItem(
        'ai-fairy-voice-settings',
        JSON.stringify(this.config)
      )

      console.log('Voice settings saved')
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  /**
   * Event system implementation
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  },

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  },

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  },

  /**
   * Get current status
   */
  getStatus() {
    return {
      isInitialized: this.state.isInitialized,
      isSpeaking: this.state.isSpeaking,
      isListening: this.state.isListening,
      config: { ...this.config },
      supportedVoices: this.state.supportedVoices.length,
      services: Object.keys(this.services).filter(
        key => this.services[key] !== null
      ),
      lastError: this.state.lastError,
    }
  },

  /**
   * Test voice functionality
   */
  async test() {
    console.log('🧪 Testing AI Fairy Voice System...')

    const testText = 'Hello! This is a test of the AI Fairy voice system. ✨'

    try {
      await this.speak(testText)
      console.log('✅ Voice test successful')
      return { success: true }
    } catch (error) {
      console.error('❌ Voice test failed:', error)
      return { success: false, error: error.message }
    }
  },
}

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AIFairyVoice.init()
  })
} else {
  window.AIFairyVoice.init()
}

// Export for module usage
if (
  typeof window !== 'undefined' &&
  typeof window.module !== 'undefined' &&
  window.module.exports
) {
  window.module.exports = window.AIFairyVoice
}

console.log('🧚‍♀️ AI Fairy Voice Integration loaded')
