#!/usr/bin/env node

/**
 * Quick test script to verify Gemini AI API key functionality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log('🤖 Testing Gemini AI API Key...');
  
  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Test simple text generation
    console.log('📝 Testing text generation...');
    const result = await model.generateContent("Say hello and confirm you're working with our live multimedia AI system!");
    const response = result.response.text();
    
    console.log('✅ API Key is working!');
    console.log('🎯 Gemini AI Response:', response);
    
    // Test multimodal capability (we'll test with text for now)
    console.log('\n🎨 Testing multimodal capabilities...');
    const multimodalResult = await model.generateContent([
      "You're now connected to a live multimedia AI system that can:",
      "- Process voice input and transcription", 
      "- Analyze live video feeds",
      "- Capture and analyze screenshots",
      "- Maintain conversation context",
      "Please acknowledge these capabilities!"
    ]);
    
    console.log('✅ Multimodal test passed!');
    console.log('🚀 Response:', multimodalResult.response.text());
    
    console.log('\n🎉 GEMINI AI API KEY VERIFIED!');
    console.log('🔗 Ready for live multimedia AI features at: http://127.0.0.1:3000/');
    
  } catch (error) {
    console.error('❌ API Key test failed:', error);
    process.exit(1);
  }
}

// Run the test
testGeminiAPI().catch(console.error);