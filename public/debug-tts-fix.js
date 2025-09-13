/**
 * Comprehensive TTS Key Detection Fix
 * This script addresses the issue where the fairy chat audio test can't find the TTS key
 */

console.log('🔍 Diagnosing TTS Key Detection Issue...')

// Test 1: Check if environment variable is properly passed to browser
console.log('\n📋 Environment Variable Check:')
console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? 
  `✅ SET (${import.meta.env.VITE_GEMINI_API_KEY.substring(0,8)}...)` : 
  '❌ NOT SET')

// Test 2: Check localStorage
console.log('\n💾 localStorage Check:')
try {
  const appSettings = localStorage.getItem('app-settings')
  if (appSettings) {
    const settings = JSON.parse(appSettings)
    console.log('app-settings.geminiApiKey:', settings.geminiApiKey ? 
      `✅ SET (${settings.geminiApiKey.substring(0,8)}...)` : 
      '❌ NOT SET')
  } else {
    console.log('app-settings: ❌ NOT FOUND')
    
    // Auto-fix: Set API key from environment
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      console.log('🛠️ Auto-fixing: Setting API key in localStorage...')
      const settings = { geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY }
      localStorage.setItem('app-settings', JSON.stringify(settings))
      console.log('✅ API key stored in localStorage')
    }
  }
} catch (error) {
  console.error('❌ localStorage error:', error.message)
}

// Test 3: Import and test API key resolution
import { resolveGeminiApiKey } from '/src/shared/utils/apiKeys.ts'

console.log('\n🔧 API Key Resolution Test:')
resolveGeminiApiKey()
  .then(key => {
    console.log('resolveGeminiApiKey():', key ? 
      `✅ RESOLVED (${key.substring(0,8)}...)` : 
      '❌ RETURNED NULL')
    
    if (!key) {
      console.log('\n🚨 Issue Found: API key resolution failed')
      console.log('💡 Solutions:')
      console.log('   1. Check environment variable: VITE_GEMINI_API_KEY')
      console.log('   2. Set in Settings panel: AI Configuration > Gemini API Key')
      console.log('   3. Reload page after setting key')
    } else {
      console.log('\n✅ API key resolution working correctly!')
      console.log('🎯 TTS should now detect the key')
    }
  })
  .catch(error => {
    console.error('❌ API key resolution error:', error.message)
  })

// Test 4: Check if Pinia store has the key
console.log('\n🗄️ Checking Pinia store...')
try {
  // This will work if we're in a Vue context
  const { useAppStore } = await import('/src/stores/app.js')
  const store = useAppStore()
  console.log('Pinia store geminiApiKey:', store.settings?.geminiApiKey ? 
    `✅ SET (${store.settings.geminiApiKey.substring(0,8)}...)` : 
    '❌ NOT SET')
} catch (error) {
  console.log('Pinia store: ⚠️ Not available in this context')
}

console.log('\n🎉 TTS Key Detection Diagnosis Complete!')
console.log('📱 Now test the AI Fairy audio features')
