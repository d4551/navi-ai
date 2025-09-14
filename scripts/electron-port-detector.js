#!/usr/bin/env node
/**
 * Electron Port Detector
 * Helps Electron find the correct Vite dev server port
 */

const net = require('net');
const { getVitePort } = require('./get-random-port.js');

/**
 * Check if a port is responding to HTTP requests
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is responding
 */
function isPortResponding(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 1000; // 1 second timeout
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, '127.0.0.1');
  });
}

/**
 * Find the Vite dev server port
 * @returns {Promise<number>} - Port number where Vite is running
 */
async function findVitePort() {
  // First check if VITE_PORT is set
  if (process.env.VITE_PORT) {
    const port = Number(process.env.VITE_PORT);
    if (await isPortResponding(port)) {
      return port;
    }
  }
  
  // Check common Vite ports
  const commonPorts = [5173, 5175, 5180, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
  
  for (const port of commonPorts) {
    if (await isPortResponding(port)) {
      return port;
    }
  }
  
  // If no common ports work, try to find any available port
  try {
    return await getVitePort();
  } catch (error) {
    console.error('Could not find available port:', error.message);
    return 5173; // Fallback
  }
}

// CLI usage
if (require.main === module) {
  findVitePort()
    .then(port => {
      console.log(port);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error finding Vite port:', error.message);
      process.exit(1);
    });
}

module.exports = {
  findVitePort,
  isPortResponding
};
