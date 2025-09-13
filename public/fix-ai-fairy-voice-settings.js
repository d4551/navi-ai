/**
 * AI Fairy TTS/STT Settings Configuration Fix
 * Ensures proper integration of voice settings across the application
 */

// Fix TTS provider setting inconsistencies
function fixTTSSettings() {
  console.log('🔧 Fixing TTS Settings...');
  
  try {
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    
    // Ensure TTS provider is properly set
    if (!appSettings.ttsProvider || !['system', 'gemini', 'kokoro'].includes(appSettings.ttsProvider)) {
      appSettings.ttsProvider = 'system';
      console.log('✅ Reset TTS provider to system (was invalid or missing)');
    }
    
    // Ensure STT provider is set
    if (!appSettings.sttProvider || !['system', 'gemini'].includes(appSettings.sttProvider)) {
      appSettings.sttProvider = 'system';
      console.log('✅ Reset STT provider to system (was invalid or missing)');
    }
    
    // Ensure voice settings have valid defaults
    if (typeof appSettings.speechRate !== 'number' || appSettings.speechRate < 0.5 || appSettings.speechRate > 2) {
      appSettings.speechRate = 0.85;
      console.log('✅ Reset speech rate to default (0.85)');
    }
    
    if (typeof appSettings.speechPitch !== 'number' || appSettings.speechPitch < 0.5 || appSettings.speechPitch > 2) {
      appSettings.speechPitch = 1.0;
      console.log('✅ Reset speech pitch to default (1.0)');
    }
    
    if (typeof appSettings.speechVolume !== 'number' || appSettings.speechVolume < 0 || appSettings.speechVolume > 1) {
      appSettings.speechVolume = 0.9;
      console.log('✅ Reset speech volume to default (0.9)');
    }
    
    // Ensure voice language is set
    if (!appSettings.voiceLang) {
      appSettings.voiceLang = appSettings.language || 'en-US';
      console.log('✅ Set voice language to', appSettings.voiceLang);
    }
    
    // Fix Gemini provider if no API key
    if (appSettings.ttsProvider === 'gemini' && !appSettings.geminiApiKey) {
      console.log('⚠️  Found Gemini TTS without API key - resetting to system TTS');
      appSettings.ttsProvider = 'system';
    }
    
    // Save fixed settings
    localStorage.setItem('app-settings', JSON.stringify(appSettings));
    console.log('✅ TTS settings saved to localStorage');
    
    return appSettings;
  } catch (error) {
    console.error('❌ Failed to fix TTS settings:', error);
    return null;
  }
}

// Initialize Kokoro models if available
async function initializeKokoroModels() {
  console.log('🎵 Initializing Kokoro TTS models...');
  
  try {
    const { KokoroTTS } = await import('kokoro-js');
    
    // Try local models first
    try {
      const localPath = '/local-models/kokoro';
      const kokoro = await KokoroTTS.from_pretrained(localPath, {
        dtype: "q8",
        device: "wasm",
        local_files_only: true,
      });
      
      console.log('✅ Local Kokoro models loaded successfully');
      
      // Get available voices
      const voices = kokoro.voices ? Object.keys(kokoro.voices) : [];
      console.log('📋 Available Kokoro voices:', voices.slice(0, 5));
      
      return { success: true, type: 'local', voices };
      
    } catch (localError) {
      console.log('ℹ️  Local models not available, trying online...');
      
      // Fallback to online models
      const kokoro = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8",
        device: "wasm",
      });
      
      console.log('✅ Online Kokoro models loaded successfully');
      
      const voices = kokoro.voices ? Object.keys(kokoro.voices) : [];
      console.log('📋 Available Kokoro voices:', voices.slice(0, 5));
      
      return { success: true, type: 'online', voices };
    }
    
  } catch (error) {
    console.warn('⚠️  Kokoro TTS initialization failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test voice routing configuration
async function testVoiceRouting() {
  console.log('🎯 Testing voice routing...');
  
  try {
    // Import voice utilities
    const { setVoiceRoutingPreferences, getVoiceRoutingPreferences } = await import('/src/utils/voice.js');
    
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    
    // Set up proper routing
    setVoiceRoutingPreferences({
      ttsProvider: appSettings.ttsProvider || 'system',
      sttProvider: appSettings.sttProvider || 'system',
      lang: appSettings.voiceLang || 'en-US',
      speakerDeviceId: appSettings.selectedSpeakerId || '',
      micDeviceId: appSettings.selectedMicId || ''
    });
    
    const currentPrefs = getVoiceRoutingPreferences();
    console.log('✅ Voice routing configured:', currentPrefs);
    
    return currentPrefs;
    
  } catch (error) {
    console.error('❌ Voice routing test failed:', error);
    return null;
  }
}

// Fix AI Fairy specific settings
function fixAIFairySettings() {
  console.log('🧚‍♀️ Fixing AI Fairy settings...');
  
  try {
    // Check fairy TTS enabled setting
    const fairyTtsEnabled = localStorage.getItem('fairy-tts-enabled');
    if (fairyTtsEnabled === null) {
      // Default to enabled if voice mode is on
      const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      const shouldEnable = appSettings.voiceMode || false;
      localStorage.setItem('fairy-tts-enabled', shouldEnable.toString());
      console.log('✅ Set fairy TTS enabled to', shouldEnable);
    }
    
    // Ensure compact UI setting exists
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    if (typeof appSettings.compactUI !== 'boolean') {
      appSettings.compactUI = false;
      localStorage.setItem('app-settings', JSON.stringify(appSettings));
      console.log('✅ Set compact UI to default (false)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix AI Fairy settings:', error);
    return false;
  }
}

// Validate Google AI integration
async function validateGoogleAIIntegration() {
  console.log('🤖 Validating Google AI integration...');
  
  try {
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    
    if (!appSettings.geminiApiKey) {
      console.log('ℹ️  No Gemini API key configured - Google AI features will be disabled');
      return { available: false, reason: 'No API key' };
    }
    
    // Test API key format
    if (!appSettings.geminiApiKey.startsWith('AIza')) {
      console.warn('⚠️  API key format appears invalid - should start with "AIza"');
      return { available: false, reason: 'Invalid API key format' };
    }
    
    console.log('✅ Gemini API key appears valid');
    
    // Try to import the service
    const { MultimodalLiveService } = await import('/src/shared/services/MultimodalLiveService.js');
    console.log('✅ MultimodalLiveService import successful');
    
    return { available: true, hasApiKey: true };
    
  } catch (error) {
    console.warn('⚠️  Google AI validation failed:', error.message);
    return { available: false, reason: error.message };
  }
}

// Create comprehensive settings test
async function testAllVoiceSettings() {
  console.log('🧪 Testing all voice settings...');
  
  const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
  
  const tests = {
    ttsProvider: {
      value: appSettings.ttsProvider,
      valid: ['system', 'gemini', 'kokoro'].includes(appSettings.ttsProvider),
      test: 'TTS Provider'
    },
    sttProvider: {
      value: appSettings.sttProvider,
      valid: ['system', 'gemini'].includes(appSettings.sttProvider),
      test: 'STT Provider'
    },
    speechRate: {
      value: appSettings.speechRate,
      valid: typeof appSettings.speechRate === 'number' && appSettings.speechRate >= 0.5 && appSettings.speechRate <= 2,
      test: 'Speech Rate'
    },
    speechPitch: {
      value: appSettings.speechPitch,
      valid: typeof appSettings.speechPitch === 'number' && appSettings.speechPitch >= 0.5 && appSettings.speechPitch <= 2,
      test: 'Speech Pitch'
    },
    speechVolume: {
      value: appSettings.speechVolume,
      valid: typeof appSettings.speechVolume === 'number' && appSettings.speechVolume >= 0 && appSettings.speechVolume <= 1,
      test: 'Speech Volume'
    },
    voiceLang: {
      value: appSettings.voiceLang,
      valid: typeof appSettings.voiceLang === 'string' && appSettings.voiceLang.length >= 2,
      test: 'Voice Language'
    }
  };
  
  console.log('Voice settings validation:');
  for (const [key, test] of Object.entries(tests)) {
    const status = test.valid ? '✅' : '❌';
    console.log(`${status} ${test.test}: ${JSON.stringify(test.value)} (${test.valid ? 'Valid' : 'Invalid'})`);
  }
  
  return tests;
}

// Main comprehensive fix function
async function fixAllAIFairyVoiceSettings() {
  console.log('🚀 Starting comprehensive AI Fairy voice settings fix...\n');
  
  const results = {
    ttsSettings: fixTTSSettings(),
    fairySettings: fixAIFairySettings(),
    kokoroInit: await initializeKokoroModels(),
    googleAI: await validateGoogleAIIntegration(),
    voiceRouting: await testVoiceRouting(),
    settingsValidation: await testAllVoiceSettings()
  };
  
  console.log('\n📊 Settings Fix Results:');
  console.log('TTS Settings:', results.ttsSettings ? '✅ Fixed' : '❌ Failed');
  console.log('Fairy Settings:', results.fairySettings ? '✅ Fixed' : '❌ Failed');
  console.log('Kokoro TTS:', results.kokoroInit.success ? `✅ ${results.kokoroInit.type} models` : '⚠️  Not available');
  console.log('Google AI:', results.googleAI.available ? '✅ Available' : `⚠️  ${results.googleAI.reason}`);
  console.log('Voice Routing:', results.voiceRouting ? '✅ Configured' : '❌ Failed');
  
  console.log('\n💡 Usage Instructions:');
  console.log('1. Open Settings > Voice Experience to configure TTS provider');
  console.log('2. Add Gemini API key in Settings > AI & API for Google AI TTS');
  console.log('3. Use the AI Fairy voice settings button for quick adjustments');
  console.log('4. Enable Voice Mode for automatic text-to-speech responses');
  
  console.log('\n🎉 AI Fairy voice settings fix complete!');
  
  return results;
}

// Auto-fix critical issues on page load
function autoFixCriticalIssues() {
  try {
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    let needsSave = false;
    
    // Auto-fix Gemini without API key
    if (appSettings.ttsProvider === 'gemini' && !appSettings.geminiApiKey) {
      appSettings.ttsProvider = 'system';
      needsSave = true;
    }
    
    // Ensure valid TTS provider
    if (!['system', 'gemini', 'kokoro'].includes(appSettings.ttsProvider)) {
      appSettings.ttsProvider = 'system';
      needsSave = true;
    }
    
    if (needsSave) {
      localStorage.setItem('app-settings', JSON.stringify(appSettings));
      console.log('🔧 Auto-fixed critical TTS settings');
    }
  } catch (error) {
    console.debug('Auto-fix failed:', error);
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.naviVoiceFix = {
    fixAllAIFairyVoiceSettings,
    fixTTSSettings,
    initializeKokoroModels,
    testVoiceRouting,
    fixAIFairySettings,
    validateGoogleAIIntegration,
    testAllVoiceSettings,
    autoFixCriticalIssues
  };
  
  // Auto-run critical fixes
  autoFixCriticalIssues();
  
  console.log('🔧 Voice settings fix tools loaded!');
  console.log('Run window.naviVoiceFix.fixAllAIFairyVoiceSettings() to fix all settings');
}

export default fixAllAIFairyVoiceSettings;
