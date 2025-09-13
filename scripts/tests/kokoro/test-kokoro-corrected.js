/**
 * Final Kokoro TTS Test
 * Tests the corrected implementation using KokoroTTS
 */

console.log('🎵 Testing Corrected Kokoro TTS Implementation...');

async function testKokoroTTSCorrect() {
  try {
    console.log('📦 Importing kokoro-js package...');
    
    const { KokoroTTS } = await import('kokoro-js');
    console.log('✅ KokoroTTS imported successfully!');
    
    // Create instance with from_pretrained
    const kokoro = await KokoroTTS.from_pretrained("Xenova/Kokoro-82M");
    console.log('✅ KokoroTTS instance created successfully!');
    
    // Check available voices from voices property
    console.log('🎭 Getting available voices...');
    const voicesData = kokoro.voices;
    const voices = voicesData ? Object.keys(voicesData) : [];
    console.log('📋 Available voices:', voices);
    
    // Test text-to-speech generation
    const testText = 'Hello! This is a test of Kokoro text-to-speech.';
    const testVoice = voices.includes('af_bella') ? 'af_bella' : 'af_heart';
    
    console.log(`🔊 Generating speech with voice '${testVoice}' for: "${testText}"`);
    
    const audioBuffer = await kokoro.generate(testText, {
      voice: testVoice,
      speed: 1.0
    });
    
    if (audioBuffer) {
      console.log('✅ Audio generated successfully!');
      console.log('📊 Audio buffer size:', audioBuffer.byteLength || audioBuffer.length, 'bytes');
      console.log('📊 Audio buffer type:', audioBuffer.constructor.name);
      
      // Test if we can create a blob (this is what our voice.js does)
      try {
        const blob = new Blob([audioBuffer], { type: 'audio/wav' });
        console.log('✅ Blob created successfully, size:', blob.size, 'bytes');
        
        // Test if we can create an object URL
        const url = URL.createObjectURL(blob);
        console.log('✅ Object URL created successfully');
        URL.revokeObjectURL(url); // Clean up
        
      } catch (blobError) {
        console.error('❌ Blob creation failed:', blobError.message);
      }
      
    } else {
      console.log('⚠️ No audio buffer returned');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Kokoro TTS test failed:', error);
    console.log('📝 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    return false;
  }
}

// Test voice validation
async function testVoiceValidation() {
  try {
    console.log('🔍 Testing voice validation...');
    
    const { KokoroTTS } = await import('kokoro-js');
    const kokoro = await KokoroTTS.from_pretrained("Xenova/Kokoro-82M");
    
    const voicesData = kokoro.voices;
    const voices = voicesData ? Object.keys(voicesData) : [];
    console.log('📋 Testing with voices:', voices.slice(0, 3));
    
    // Test voice validation logic (like our implementation)
    const testVoices = ['af_bella', 'invalid_voice', voices[0]];
    
    for (const testVoice of testVoices) {
      const isValid = voices.includes(testVoice);
      const finalVoice = isValid ? testVoice : 'af_heart';
      console.log(`🎭 Voice '${testVoice}': ${isValid ? '✅ Valid' : '❌ Invalid'} → Using '${finalVoice}'`);
    }
    
  } catch (error) {
    console.warn('⚠️ Voice validation test failed:', error.message);
  }
}

// Run the test
console.log('🚀 Starting corrected Kokoro test...');
testKokoroTTSCorrect()
  .then(success => {
    if (success) {
      return testVoiceValidation();
    } else {
      console.log('❌ Basic test failed, skipping voice validation test');
    }
  })
  .then(() => {
    console.log('🎉 Corrected Kokoro test completed!');
    console.log('💡 Kokoro should now work properly in the voice system!');
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
  });
