// TTS timeout fix - Copy and paste this into your browser console
console.log('🚨 Fixing TTS timeout issues...');

// Reset TTS provider to system to avoid Gemini API timeouts
const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
console.log('Current TTS provider:', appSettings.ttsProvider);

if (appSettings.ttsProvider === 'gemini') {
  console.log('⚠️  Switching from Gemini to system TTS to avoid timeouts');
  appSettings.ttsProvider = 'system';
  localStorage.setItem('app-settings', JSON.stringify(appSettings));
  console.log('✅ TTS provider reset to system');
  
  // Trigger settings update event
  window.dispatchEvent(new CustomEvent('app-settings-updated', { 
    detail: { ttsProvider: 'system' }
  }));
} else {
  console.log('✅ TTS provider is already:', appSettings.ttsProvider || 'system');
}

// Also check Pinia store if available
try {
  const store = window.__PINIA_STORES__?.app;
  if (store && store.settings?.ttsProvider === 'gemini') {
    console.log('⚠️  Updating Pinia store TTS provider');
    store.updateSettings({ ttsProvider: 'system' });
    console.log('✅ Pinia store updated');
  }
} catch (e) {
  console.log('No Pinia store found or update failed');
}

console.log('🎉 TTS timeout fix applied! System TTS will be used instead.');
alert('✅ TTS Fixed!\n\nSwitched to system TTS to avoid timeouts.\nVoice should work immediately now.');
