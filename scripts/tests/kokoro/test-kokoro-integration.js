/**
 * Test Kokoro TTS Integration
 * This tests our Kokoro implementation in voice.js
 */

import { speak } from './src/utils/voice.js';

console.log('🎵 Testing Kokoro TTS Integration...');

async function testKokoroTTS() {
  try {
    console.log('📢 Testing Kokoro TTS provider...');
    
    // Test with Kokoro provider
    await speak('Hello! This is a test of Kokoro text-to-speech integration.', {
      provider: 'kokoro',
      voice: 'af_bella', // Kokoro voice
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8
    });
    
    console.log('✅ Kokoro TTS test completed successfully!');
    
  } catch (error) {
    console.error('❌ Kokoro TTS test failed:', error);
    console.log('📝 Error details:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
  }
}

// Test different Kokoro voices
async function testKokoroVoices() {
  const voices = [
    'af_bella',
    'af_sarah', 
    'am_adam',
    'am_michael',
    'bf_emma',
    'bf_isabella',
    'bm_george',
    'bm_lewis'
  ];
  
  console.log('🎭 Testing different Kokoro voices...');
  
  for (const voice of voices.slice(0, 3)) { // Test first 3 voices
    try {
      console.log(`🔊 Testing voice: ${voice}`);
      await speak(`Hello, this is voice ${voice}`, {
        provider: 'kokoro',
        voice: voice,
        rate: 1.0,
        volume: 0.6
      });
      
      // Small delay between voices
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.warn(`⚠️ Voice ${voice} failed:`, error.message);
    }
  }
  
  console.log('✅ Voice testing completed!');
}

// Run tests
console.log('🚀 Starting Kokoro TTS tests...');
testKokoroTTS()
  .then(() => testKokoroVoices())
  .then(() => {
    console.log('🎉 All Kokoro TTS tests completed!');
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
  });
