// Fix TTS provider setting
console.log('�� Checking current TTS settings...');

// Check localStorage app-settings
const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
console.log('Current TTS provider in app-settings:', appSettings.ttsProvider);

if (appSettings.ttsProvider === 'gemini') {
  console.log('⚠️  Found Gemini TTS without API key - resetting to system TTS');
  appSettings.ttsProvider = 'system';
  localStorage.setItem('app-settings', JSON.stringify(appSettings));
  console.log('✅ Reset TTS provider to system');
} else {
  console.log('✅ TTS provider is already set to:', appSettings.ttsProvider || 'system');
}

// Also check for any stored preferences
try {
  const navicvData = JSON.parse(localStorage.getItem('navicv-data') || '{}');
  if (navicvData.settings?.ttsProvider === 'gemini') {
    console.log('⚠️  Found Gemini TTS in navicv-data - resetting to system TTS');
    navicvData.settings.ttsProvider = 'system';
    localStorage.setItem('navicv-data', JSON.stringify(navicvData));
    console.log('✅ Reset TTS provider in navicv-data to system');
  }
} catch (e) {
  console.log('No navicv-data found');
}

console.log('🎉 TTS settings have been fixed!');
