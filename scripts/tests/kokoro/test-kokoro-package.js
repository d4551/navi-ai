/**
 * Simple Kokoro TTS Test (Node.js compatible)
 * Tests Kokoro package directly without Vue dependencies
 */

console.log('🎵 Testing Kokoro TTS Package Directly...');

async function testKokoroPackage() {
  try {
    console.log('📦 Importing kokoro-js package...');
    
    // Import Kokoro package
    const { Kokoro } = await import('kokoro-js');
    console.log('✅ Kokoro package imported successfully!');
    
    // Test basic configuration
    const kokoro = new Kokoro({
      voice: 'af_bella',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      format: 'wav'
    });
    
    console.log('✅ Kokoro instance created successfully!');
    console.log('📝 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(kokoro)));
    
    // Test text-to-speech generation
    console.log('🔊 Generating speech for: "Hello Kokoro"');
    const audioBuffer = await kokoro.generate('Hello Kokoro');
    
    if (audioBuffer) {
      console.log('✅ Audio generated successfully!');
      console.log('📊 Audio buffer size:', audioBuffer.byteLength || audioBuffer.length, 'bytes');
    } else {
      console.log('⚠️ No audio buffer returned');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Kokoro test failed:', error);
    console.log('📝 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    return false;
  }
}

// Check available voices
async function checkKokoroVoices() {
  try {
    console.log('🎭 Checking available Kokoro voices...');
    
    const { Kokoro } = await import('kokoro-js');
    
    // Try to get voice list if available
    if (Kokoro.getVoices) {
      const voices = await Kokoro.getVoices();
      console.log('📋 Available voices:', voices);
    } else {
      console.log('📋 Known Kokoro voices (from documentation):');
      const knownVoices = [
        'af_bella', 'af_sarah', 'af_nicole',
        'am_adam', 'am_michael', 'am_daniel',
        'bf_emma', 'bf_isabella', 'bf_amy',
        'bm_george', 'bm_lewis', 'bm_william'
      ];
      console.log(knownVoices.join(', '));
    }
    
  } catch (error) {
    console.warn('⚠️ Could not check voices:', error.message);
  }
}

// Run the test
console.log('🚀 Starting Kokoro package test...');
testKokoroPackage()
  .then(success => {
    if (success) {
      return checkKokoroVoices();
    } else {
      console.log('❌ Basic test failed, skipping voice check');
    }
  })
  .then(() => {
    console.log('🎉 Kokoro package test completed!');
    console.log('💡 If this test passed, Kokoro should work in the voice system');
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
  });
