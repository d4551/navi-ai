#!/usr/bin/env node

/**
 * Script to download Kokoro TTS model files locally
 * Downloads from Hugging Face to avoid runtime downloads
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HfInference } from '@huggingface/inference';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = path.join(__dirname, '..', 'local-models', 'kokoro');
const MODEL_ID = "hexgrad/Kokoro-82M";

// List of essential model files to download (based on Hugging Face repo structure)
const ESSENTIAL_FILES = [
  'config.json',
  'kokoro-v1_0.pth'
];

// Voice files to download (select commonly used voices)
const VOICE_FILES = [
  'voices/af_heart.pt',
  'voices/af_bella.pt',
  'voices/af_nicole.pt',
  'voices/am_michael.pt',
  'voices/bf_emma.pt',
  'voices/bm_george.pt'
];

async function ensureDir(dirPath) {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    console.log(`✅ Directory created: ${dirPath}`);
  } catch (error) {
    console.error(`❌ Failed to create directory ${dirPath}:`, error.message);
  }
}

async function downloadFile(hf, filePath, outputPath) {
  try {
    console.log(`⬇️  Downloading ${filePath}...`);
    
    // Use the correct Hugging Face Hub API to download files
    const fileData = await fetch(`https://huggingface.co/${MODEL_ID}/resolve/main/${filePath}`);
    
    if (!fileData.ok) {
      throw new Error(`HTTP error! status: ${fileData.status}`);
    }
    
    const fileBuffer = Buffer.from(await fileData.arrayBuffer());
    
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    await ensureDir(dir);
    
    await fs.promises.writeFile(outputPath, fileBuffer);
    console.log(`✅ Downloaded: ${filePath} → ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to download ${filePath}:`, error.message);
    return false;
  }
}

async function downloadModelFiles() {
  console.log('🚀 Starting Kokoro model download...');
  console.log(`📁 Model will be saved to: ${MODEL_DIR}`);
  
  // Check if Hugging Face token is available (optional for public models)
  const hfToken = process.env.HUGGINGFACE_HUB_TOKEN || null;
  const hf = new HfInference(hfToken);
  
  // Create model directory
  await ensureDir(MODEL_DIR);
  
  let successCount = 0;
  let totalCount = 0;
  
  // Download essential model files
  for (const file of ESSENTIAL_FILES) {
    totalCount++;
    const outputPath = path.join(MODEL_DIR, file);
    const success = await downloadFile(hf, file, outputPath);
    if (success) successCount++;
  }
  
  // Download voice files
  for (const voiceFile of VOICE_FILES) {
    totalCount++;
    const outputPath = path.join(MODEL_DIR, voiceFile);
    const success = await downloadFile(hf, voiceFile, outputPath);
    if (success) successCount++;
  }
  
  console.log('\n📊 Download Summary:');
  console.log(`✅ Successfully downloaded: ${successCount}/${totalCount} files`);
  
  if (successCount === totalCount) {
    console.log('🎉 All files downloaded successfully!');
    console.log('💡 You can now use the local model with kokoro-js');
  } else {
    console.log('⚠️  Some files failed to download. The model may not work correctly.');
  }
}

// Run the download if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadModelFiles().catch(console.error);
}

export { downloadModelFiles, MODEL_DIR, MODEL_ID };
