import { KokoroTTS } from 'kokoro-js';

async function testLocalKokoro() {
  try {
    console.log('Testing Kokoro TTS with local model...');
    
    // Try to load from local path
    const localModelPath = '/local-models/kokoro'; // This should be served by the dev server
    const kokoro = await KokoroTTS.from_pretrained(localModelPath, {
      dtype: "q8",
      device: "wasm",
      local_files_only: true,
    });
    
    console.log('Kokoro TTS instance created successfully');
    
    // Generate audio
    const text = "Hello, this is a test of local Kokoro TTS.";
    const audioBuffer = await kokoro.generate(text, {
      voice: 'af_heart',
      speed: 1.0,
    });
    
    console.log('Audio generated successfully');
    console.log('Audio buffer length:', audioBuffer.data.length);
    
    // Save to file or play (in browser, we would play it)
    // For now, just log success
    return true;
  } catch (error) {
    console.error('Error testing local Kokoro:', error);
    return false;
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLocalKokoro().then(success => {
    if (success) {
      console.log('Local Kokoro test passed!');
    } else {
      console.log('Local Kokoro test failed.');
    }
  });
}

export { testLocalKokoro };
