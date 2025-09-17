/**
 * AI Fairy TTS/STT Diagnostic & Verification Script
 * Tests all voice providers and configurations
 */

console.log('🧚‍♀️ AI Fairy Voice System Diagnostic Starting...')

// Test configuration and settings
async function testSettingsIntegrity() {
  console.log('\n📋 Testing Settings Configuration...')

  try {
    // Check localStorage settings
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    console.log('Current app settings:', {
      ttsProvider: appSettings.ttsProvider,
      sttProvider: appSettings.sttProvider,
      voiceMode: appSettings.voiceMode,
      speechRate: appSettings.speechRate,
      speechPitch: appSettings.speechPitch,
      speechVolume: appSettings.speechVolume,
      voiceLang: appSettings.voiceLang,
      geminiApiKey: appSettings.geminiApiKey ? '***SET***' : 'NOT SET',
    })

    // Check fairy-specific settings
    const fairyTtsEnabled = localStorage.getItem('fairy-tts-enabled')
    console.log('Fairy TTS enabled:', fairyTtsEnabled)

    return true
  } catch (error) {
    console.error('❌ Settings test failed:', error)
    return false
  }
}

// Test voice providers
async function testVoiceProviders() {
  console.log('\n🎤 Testing Voice Providers...')

  const testText = 'Hello! This is a test of the voice system.'
  const providers = ['system', 'gemini', 'kokoro']

  for (const provider of providers) {
    console.log(`\n🔊 Testing ${provider} TTS provider...`)

    try {
      // Dynamic import to avoid dependency issues
      const { speak } = await import('/src/utils/voice.js')

      const options = {
        provider: provider,
        rate: 1.0,
        volume: 0.8,
        pitch: 1.0,
      }

      // Add API key for Gemini if available
      if (provider === 'gemini') {
        const appSettings = JSON.parse(
          localStorage.getItem('app-settings') || '{}'
        )
        if (appSettings.geminiApiKey) {
          options.apiKey = appSettings.geminiApiKey
        } else {
          console.warn(
            '⚠️  Gemini API key not found, will fall back to system TTS'
          )
        }
      }

      // Test voice generation
      await speak(testText, options)
      console.log(`✅ ${provider} TTS test completed successfully`)
    } catch (error) {
      console.error(`❌ ${provider} TTS test failed:`, error.message)
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Test speech recognition
async function testSpeechRecognition() {
  console.log('\n🎙️ Testing Speech Recognition...')

  if (
    !('webkitSpeechRecognition' in window) &&
    !('SpeechRecognition' in window)
  ) {
    console.warn('⚠️  Speech Recognition not supported in this browser')
    return false
  }

  try {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    console.log('✅ Speech Recognition API available')

    // Test basic setup
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript
      console.log('🎯 Speech recognized:', transcript)
    }

    recognition.onerror = event => {
      console.warn('⚠️  Speech recognition error:', event.error)
    }

    console.log('🎤 Speech Recognition configured successfully')
    return true
  } catch (error) {
    console.error('❌ Speech Recognition test failed:', error)
    return false
  }
}

// Test Kokoro TTS specifically
async function testKokoroTTS() {
  console.log('\n🎵 Testing Kokoro TTS Integration...')

  try {
    // Try to import Kokoro
    const { KokoroTTS } = await import('kokoro-js')
    console.log('✅ Kokoro package imported successfully')

    // Check for local models
    try {
      const modelPath = '/local-models/kokoro'
      console.log('🔍 Checking for local Kokoro models at:', modelPath)

      // This will fail if models aren't available, which is expected
      const kokoro = await KokoroTTS.from_pretrained(modelPath, {
        dtype: 'q8',
        device: 'wasm',
        local_files_only: true,
      })

      console.log('✅ Local Kokoro models loaded successfully')

      // Test voice generation
      const testAudio = await kokoro.generate('Testing Kokoro TTS', {
        voice: 'af_heart',
        speed: 1.0,
      })

      console.log(
        '✅ Kokoro audio generation successful, buffer size:',
        testAudio?.length || 0
      )
    } catch (localError) {
      console.warn(
        '⚠️  Local Kokoro models not available, testing online fallback...'
      )

      try {
        const kokoro = await KokoroTTS.from_pretrained(
          'onnx-community/Kokoro-82M-v1.0-ONNX',
          {
            dtype: 'q8',
            device: 'wasm',
          }
        )

        console.log('✅ Online Kokoro model loaded successfully')

        const testAudio = await kokoro.generate('Testing online Kokoro', {
          voice: 'af_heart',
          speed: 1.0,
        })

        console.log('✅ Online Kokoro audio generation successful')
      } catch (onlineError) {
        console.error(
          '❌ Both local and online Kokoro failed:',
          onlineError.message
        )
      }
    }
  } catch (error) {
    console.error('❌ Kokoro TTS test failed:', error.message)
  }
}

// Test Google AI integration
async function testGoogleAIIntegration() {
  console.log('\n🤖 Testing Google AI Integration...')

  const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')

  if (!appSettings.geminiApiKey) {
    console.warn('⚠️  Gemini API key not configured')
    return false
  }

  try {
    console.log('🔑 API key found, testing Gemini Live API...')

    // Import the MultimodalLiveService
    const { MultimodalLiveService } = await import(
      '/src/shared/services/MultimodalLiveService.js'
    )
    const liveService = MultimodalLiveService.getInstance()

    console.log('✅ MultimodalLiveService imported successfully')

    // Test initialization
    await liveService.initialize({
      apiKey: appSettings.geminiApiKey,
    })

    console.log('✅ Gemini Live API initialized successfully')

    // Test basic connectivity
    const config = {
      model: 'models/gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['AUDIO'],
        temperature: 0.3,
        maxOutputTokens: 100,
      },
      systemInstruction: {
        parts: [
          {
            text: "You are a test assistant. Respond with: 'Voice test successful.'",
          },
        ],
      },
    }

    await liveService.connect(config)
    console.log('✅ Gemini Live API connection test completed')

    return true
  } catch (error) {
    console.error('❌ Google AI integration test failed:', error.message)
    return false
  }
}

// Test fairy chat integration
async function testFairyChatIntegration() {
  console.log('\n🧚‍♀️ Testing Fairy Chat Integration...')

  try {
    // Check if fairy is available in the DOM
    const fairyButton =
      document.querySelector('[class*="fairy"]') ||
      document.querySelector('[id*="fairy"]') ||
      document.querySelector('[data-testid*="fairy"]')

    if (fairyButton) {
      console.log('✅ Fairy button found in DOM')
    } else {
      console.log(
        'ℹ️  Fairy button not currently visible (may need to navigate to appropriate page)'
      )
    }

    // Test TTS settings persistence
    const fairyTtsEnabled = localStorage.getItem('fairy-tts-enabled')
    console.log('Fairy TTS setting:', fairyTtsEnabled)

    // Test voice routing preferences
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    console.log('Voice routing settings:', {
      ttsProvider: appSettings.ttsProvider,
      sttProvider: appSettings.sttProvider,
      voiceLang: appSettings.voiceLang,
      voiceMode: appSettings.voiceMode,
    })

    return true
  } catch (error) {
    console.error('❌ Fairy chat integration test failed:', error)
    return false
  }
}

// Test browser compatibility
async function testBrowserCompatibility() {
  console.log('\n🌐 Testing Browser Compatibility...')

  const features = {
    'Speech Synthesis': 'speechSynthesis' in window,
    'Speech Recognition':
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    'Web Audio API': 'AudioContext' in window || 'webkitAudioContext' in window,
    'Media Devices': 'mediaDevices' in navigator,
    getUserMedia: 'getUserMedia' in navigator.mediaDevices,
    WebAssembly: 'WebAssembly' in window,
    'ES Modules': 'noModule' in HTMLScriptElement.prototype === false,
    LocalStorage: 'localStorage' in window,
    'Fetch API': 'fetch' in window,
    Promise: 'Promise' in window,
  }

  console.log('Browser feature support:')
  for (const [feature, supported] of Object.entries(features)) {
    console.log(
      `${supported ? '✅' : '❌'} ${feature}: ${supported ? 'Supported' : 'Not Supported'}`
    )
  }

  // Test audio context creation
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    console.log('✅ Audio context created successfully')
    audioContext.close()
  } catch (error) {
    console.error('❌ Audio context creation failed:', error)
  }

  return Object.values(features).every(Boolean)
}

// Generate recommendations
function generateRecommendations() {
  console.log('\n💡 Recommendations:')

  const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')

  if (!appSettings.geminiApiKey) {
    console.log(
      '📝 1. Add Gemini API key in Settings > AI & API to enable Google AI TTS'
    )
  }

  if (!appSettings.ttsProvider || appSettings.ttsProvider === 'system') {
    console.log(
      '📝 2. Consider upgrading to Google AI or Kokoro TTS for better voice quality'
    )
  }

  if (!appSettings.voiceMode) {
    console.log(
      '📝 3. Enable Voice Mode in Settings > Voice Experience for hands-free interaction'
    )
  }

  console.log(
    '📝 4. Test different TTS providers in Settings > Voice Experience to find your preference'
  )
  console.log(
    '📝 5. Use the AI Fairy voice settings button to quickly adjust TTS options'
  )
  console.log(
    '📝 6. Check console for any errors if voice features are not working as expected'
  )
}

// Main diagnostic function
async function runFullDiagnostic() {
  console.log('🚀 Starting comprehensive AI Fairy voice system diagnostic...\n')

  const results = {
    settings: await testSettingsIntegrity(),
    browser: await testBrowserCompatibility(),
    speechRecognition: await testSpeechRecognition(),
    kokoro: await testKokoroTTS(),
    googleAI: await testGoogleAIIntegration(),
    fairyChat: await testFairyChatIntegration(),
  }

  console.log('\n📊 Diagnostic Results Summary:')
  for (const [test, result] of Object.entries(results)) {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`)
  }

  // Test voice providers (this might play audio)
  const testAudio = confirm('🔊 Test TTS providers now? (This will play audio)')
  if (testAudio) {
    await testVoiceProviders()
  }

  generateRecommendations()

  console.log('\n🎉 AI Fairy Voice System Diagnostic Complete!')
  console.log(
    'Check the console output above for detailed results and recommendations.'
  )

  return results
}

// Export for use in browser console
window.naviVoiceDiagnostic = {
  runFullDiagnostic,
  testSettingsIntegrity,
  testVoiceProviders,
  testSpeechRecognition,
  testKokoroTTS,
  testGoogleAIIntegration,
  testFairyChatIntegration,
  testBrowserCompatibility,
  generateRecommendations,
}

// Auto-run if script is executed directly
if (typeof window !== 'undefined') {
  console.log('🧚‍♀️ Voice diagnostic tools loaded!')
  console.log(
    'Run window.naviVoiceDiagnostic.runFullDiagnostic() to start testing'
  )
}

export default runFullDiagnostic
