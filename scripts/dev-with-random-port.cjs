#!/usr/bin/env node
/**
 * Development server with random port
 * Starts Vite dev server on a random available port
 */

const { spawn } = require('child_process');
const { getVitePort } = require('./port-manager.cjs');

async function startDevServer() {
  try {
    console.log('🔍 Finding available port...');
    const port = await getVitePort();
    
    console.log(`🚀 Starting Vite dev server on port ${port}`);
    console.log(`📱 Local: http://localhost:${port}`);
    console.log(`🌐 Network: http://0.0.0.0:${port}`);
    
    // Set environment variable for Vite
    process.env.VITE_PORT = port.toString();
    
    // Start Vite with the random port using npx
    const vite = spawn('npx', ['vite', '--port', port], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down dev server...');
      vite.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down dev server...');
      vite.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting dev server:', error.message);
    process.exit(1);
  }
}

startDevServer();
