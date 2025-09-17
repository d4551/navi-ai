const net = require('net')

/**
 * Port Manager - Ensures unique port assignments for all services
 * This prevents conflicts between Vite dev server, Electron, and other services
 */

class PortManager {
  constructor() {
    this.assignedPorts = new Set()
    this.servicePorts = new Map()
    this.portRanges = {
      vite: { min: 3000, max: 3999 },
      electron: { min: 4000, max: 4999 },
      api: { min: 5000, max: 5999 },
      websocket: { min: 6000, max: 6999 },
      database: { min: 7000, max: 7999 },
      other: { min: 8000, max: 9999 },
    }
  }

  /**
   * Check if a port is available
   */
  async isPortAvailable(port) {
    return new Promise(resolve => {
      const server = net.createServer()

      server.listen(port, () => {
        server.once('close', () => {
          resolve(true)
        })
        server.close()
      })

      server.on('error', () => {
        resolve(false)
      })
    })
  }

  /**
   * Find an available port in a specific range
   */
  async findAvailablePort(service, preferredPort = null) {
    const range = this.portRanges[service] || this.portRanges.other

    // Try preferred port first if provided and in range
    if (
      preferredPort &&
      preferredPort >= range.min &&
      preferredPort <= range.max &&
      !this.assignedPorts.has(preferredPort)
    ) {
      const isAvailable = await this.isPortAvailable(preferredPort)
      if (isAvailable) {
        this.assignPort(service, preferredPort)
        return preferredPort
      }
    }

    // Find random available port in range
    const maxAttempts = 50
    for (let i = 0; i < maxAttempts; i++) {
      const port =
        Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

      if (!this.assignedPorts.has(port)) {
        const isAvailable = await this.isPortAvailable(port)
        if (isAvailable) {
          this.assignPort(service, port)
          return port
        }
      }
    }

    throw new Error(
      `No available ports found for ${service} in range ${range.min}-${range.max}`
    )
  }

  /**
   * Assign a port to a service
   */
  assignPort(service, port) {
    this.assignedPorts.add(port)
    this.servicePorts.set(service, port)
    console.log(`🔗 Assigned port ${port} to ${service}`)
  }

  /**
   * Get port for a service
   */
  getPort(service) {
    return this.servicePorts.get(service)
  }

  /**
   * Get all assigned ports
   */
  getAllPorts() {
    return Object.fromEntries(this.servicePorts)
  }

  /**
   * Release a port
   */
  releasePort(service) {
    const port = this.servicePorts.get(service)
    if (port) {
      this.assignedPorts.delete(port)
      this.servicePorts.delete(service)
      console.log(`🔓 Released port ${port} from ${service}`)
    }
  }

  /**
   * Get environment variables for all assigned ports
   */
  getEnvironmentVariables() {
    const env = {}
    for (const [service, port] of this.servicePorts) {
      env[`${service.toUpperCase()}_PORT`] = port.toString()
    }
    return env
  }

  /**
   * Generate port configuration for different services
   */
  generateConfig() {
    const config = {
      vite: {
        port: this.getPort('vite'),
        host: '0.0.0.0',
        strictPort: false,
      },
      electron: {
        port: this.getPort('electron'),
        host: '127.0.0.1',
      },
      api: {
        port: this.getPort('api'),
        host: '0.0.0.0',
      },
      websocket: {
        port: this.getPort('websocket'),
        host: '0.0.0.0',
      },
    }

    return config
  }
}

// Export functions for use in other scripts
async function getVitePort() {
  const manager = new PortManager()
  return await manager.findAvailablePort('vite')
}

async function getElectronPort() {
  const manager = new PortManager()
  return await manager.findAvailablePort('electron')
}

async function getApiPort() {
  const manager = new PortManager()
  return await manager.findAvailablePort('api')
}

async function getWebSocketPort() {
  const manager = new PortManager()
  return await manager.findAvailablePort('websocket')
}

async function getAllServicePorts() {
  const manager = new PortManager()

  // Assign ports for all services
  await manager.findAvailablePort('vite')
  await manager.findAvailablePort('electron')
  await manager.findAvailablePort('api')
  await manager.findAvailablePort('websocket')

  return {
    ports: manager.getAllPorts(),
    env: manager.getEnvironmentVariables(),
    config: manager.generateConfig(),
  }
}

module.exports = {
  PortManager,
  getVitePort,
  getElectronPort,
  getApiPort,
  getWebSocketPort,
  getAllServicePorts,
}
