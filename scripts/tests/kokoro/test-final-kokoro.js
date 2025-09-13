/**
 * Final Complete Kokoro Test
 * Tests the voice selection and audio generation
 */

console.log('🎵 Final Kokoro TTS Integration Test...');

async function testFinalKokoroImplementation() {
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
    const availableVoices = voicesData ? Object.keys(voicesData) : [];
    console.log('📋 Available voice keys:', availableVoices.slice(0, 10));
    
    // Test voice selection logic (like our implementation)
    const testVoices = ['af_heart', 'af_bella', 'invalid_voice'];
    
    for (const testVoice of testVoices) {
      const isValid = availableVoices.includes(testVoice);
      const finalVoice = isValid ? testVoice : 'af_heart';
      console.log(`🎭 Voice '${testVoice}': ${isValid ? '✅ Valid' : '❌ Invalid'} → Using '${finalVoice}'`);
    }
    
    // Test actual audio generation
    const testText = 'Hello! Testing Kokoro TTS integration.';
    const voice = 'af_heart'; // Use the A-grade voice
    
    console.log(`🔊 Generating speech with voice '${voice}' for: "${testText}"`);
    
    const audioBuffer = await kokoro.generate(testText, {
      voice: voice,
      speed: 1.0
    });
    
    if (audioBuffer) {
      console.log('✅ Audio generated successfully!');
      console.log('📊 Audio buffer size:', audioBuffer.byteLength || audioBuffer.length, 'bytes');
      
      // Test blob creation (what our voice.js does)
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      console.log('✅ Audio blob created, size:', blob.size, 'bytes');
      
      // Test URL creation
      const url = URL.createObjectURL(blob);
      console.log('✅ Object URL created successfully');
      URL.revokeObjectURL(url);
      
      console.log('🎉 All tests passed! Kokoro integration should work in voice.js');
      
    } else {
      console.log('❌ No audio buffer returned');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Final Kokoro test failed:', error);
    console.log('📝 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    return false;
  }
}

// Show recommended voices
async function showRecommendedVoices() {
  try {
    console.log('⭐ Showing recommended Kokoro voices...');
    
    const { KokoroTTS } = await import('kokoro-js');
    const kokoro = await KokoroTTS.from_pretrained("Xenova/Kokoro-82M");
    const voicesData = kokoro.voices;
    
    if (voicesData) {
      // Find high-quality voices (A and B grades)
      const highQualityVoices = Object.entries(voicesData)
        .filter(([key, data]) => ['A', 'B'].includes(data.targetQuality))
        .slice(0, 5); // Top 5
      
      console.log('🌟 Recommended high-quality voices:');
      highQualityVoices.forEach(([key, data]) => {
        console.log(`  ${key}: ${data.name} (${data.gender}, Grade: ${data.targetQuality}, ${data.traits || 'Standard'})`);
      });
    }
    
  } catch (error) {
    console.warn('⚠️ Could not show recommended voices:', error.message);
  }
}

// Run final test
console.log('🚀 Starting final comprehensive test...');
testFinalKokoroImplementation()
  .then(success => {
    if (success) {
      return showRecommendedVoices();
    } else {
      console.log('❌ Test failed');
    }
  })
  .then(() => {
    console.log('');
    console.log('🎉 Final Kokoro TTS integration test completed!');
    console.log('💡 You can now use Kokoro TTS in your voice settings!');
    console.log('📋 To use: Select "Kokoro TTS" in the TTS provider dropdown');
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
  });
