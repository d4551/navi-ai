// 🔧 AI API Key Configuration Helper
// Run this in browser console to configure Gemini API key

console.log('🚀 AI API Key Configuration Helper');
console.log('================================');

// Check current settings
const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
console.log('Current settings:', appSettings);

if (appSettings.geminiApiKey) {
  console.log('✅ API key is already configured');
  console.log('Key preview:', appSettings.geminiApiKey.substring(0, 10) + '...');
} else {
  console.log('⚠️  No API key found. You need to configure one.');
  console.log('');
  console.log('📝 To set your API key, run:');
  console.log('');
  console.log('const apiKey = "YOUR_GEMINI_API_KEY_HERE";');
  console.log('const settings = JSON.parse(localStorage.getItem("app-settings") || "{}");');
  console.log('settings.geminiApiKey = apiKey;');
  console.log('localStorage.setItem("app-settings", JSON.stringify(settings));');
  console.log('console.log("✅ API key configured! Refresh the page.");');
  console.log('');
  console.log('🔑 Get your API key at: https://makersuite.google.com/app/apikey');
}

// Check if AI client is working
async function testAIClient() {
  try {
    console.log('🧪 Testing AI client...');
    
    // Import the AI client
    const { generateContent } = await import('/src/utils/aiClient.js');
    
    // Test simple generation
    const result = await generateContent('Say "Hello from NAVI!" in a friendly way.');
    console.log('✅ AI client working!');
    console.log('Response:', result);
    
    return true;
  } catch (error) {
    console.error('❌ AI client error:', error.message);
    
    if (error.message.includes('not initialized')) {
      console.log('💡 Solution: Configure your Gemini API key in Settings');
    }
    
    return false;
  }
}

// Auto-test if API key exists
if (appSettings.geminiApiKey) {
  console.log('🧪 Running automatic AI test...');
  testAIClient().then(success => {
    if (success) {
      console.log('🎉 Everything is working correctly!');
    }
  });
} else {
  console.log('⏭️  Skipping AI test (no API key configured)');
}

// Expose helper functions globally
window.naviHelpers = {
  testAI: testAIClient,
  setApiKey: (key) => {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    settings.geminiApiKey = key;
    localStorage.setItem('app-settings', JSON.stringify(settings));
    console.log('✅ API key set! Refresh the page to apply changes.');
  },
  checkSettings: () => {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    console.log('Current app settings:', settings);
    return settings;
  }
};

console.log('');
console.log('💡 Helper functions available:');
console.log('- naviHelpers.testAI() - Test AI client');
console.log('- naviHelpers.setApiKey("your_key") - Set API key');
console.log('- naviHelpers.checkSettings() - View all settings');
