#!/usr/bin/env node
/**
 * Random Port Utility
 * Gets a random available port for development servers
 */

const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Get a random available port in a specified range
 * @param {number} min - Minimum port number (default: 3000)
 * @param {number} max - Maximum port number (default: 65535)
 * @returns {Promise<number>} - Available port number
 */
async function getRandomPort(min = 3000, max = 65535) {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const port = Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (await isPortAvailable(port)) {
      return port;
    }
    
    attempts++;
  }
  
  // Fallback to a sequential search if random fails
  for (let port = min; port <= max; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  throw new Error(`No available ports found in range ${min}-${max}`);
}

/**
 * Get a random port for Vite dev server
 * @returns {Promise<number>} - Available port for Vite
 */
async function getVitePort() {
  // Vite typically uses ports 3000-9999, but we'll use a wider range
  return await getRandomPort(3000, 9999);
}

/**
 * Get a random port for Electron dev server
 * @returns {Promise<number>} - Available port for Electron
 */
async function getElectronPort() {
  // Electron can use any available port
  return await getRandomPort(3000, 9999);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const service = args[0] || 'vite';
  
  (async () => {
    try {
      let port;
      
      switch (service) {
        case 'vite':
          port = await getVitePort();
          break;
        case 'electron':
          port = await getElectronPort();
          break;
        default:
          port = await getRandomPort();
      }
      
      console.log(port);
      process.exit(0);
    } catch (error) {
      console.error('Error getting random port:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  getRandomPort,
  getVitePort,
  getElectronPort,
  isPortAvailable
};
