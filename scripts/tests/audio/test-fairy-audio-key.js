#!/usr/bin/env node

/**
 * Test script to verify AI Fairy Audio Test key detection
 */

// Test environment variable access
console.log('🔍 Testing AI Fairy Audio Key Detection')
console.log('=====================================')
console.log('')

console.log('📋 Environment Check:')
const envKey = process.env.VITE_GEMINI_API_KEY
console.log('VITE_GEMINI_API_KEY:', envKey ? `✅ SET (${envKey.substring(0,8)}...)` : '❌ NOT SET')
console.log('')

if (envKey) {
  console.log('🎯 Environment variable is correctly set!')
  console.log('🚀 The fairy chat audio test should now detect the API key.')
  console.log('📱 Access the app at: http://localhost:5173/')
  console.log('🧚 Click the AI Fairy floating button (bottom-right)')
  console.log('⚙️  Go to voice settings and click "Test Voice"')
  console.log('🎤 It should now detect the API key and offer Gemini TTS')
} else {
  console.log('❌ No API key detected in environment')
  console.log('💡 To fix: export VITE_GEMINI_API_KEY="your-api-key"')
}

console.log('')
console.log('🔧 Alternative: Set API key in app Settings panel')
console.log('   Settings > AI Configuration > Gemini API Key')
