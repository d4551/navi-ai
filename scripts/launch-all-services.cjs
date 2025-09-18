#!/usr/bin/env node
/**
 * Launch All Services with Unique Ports
 * Manages port assignments for all development services to prevent conflicts
 */

const { spawn } = require('child_process')
const { getAllServicePorts } = require('./port-manager.cjs')

class ServiceLauncher {
  constructor() {
    this.services = new Map()
    this.ports = null
  }

  async initialize() {
    console.log('🚀 Initializing service launcher...')
    this.ports = await getAllServicePorts()

    console.log('📋 Port assignments:')
    Object.entries(this.ports.ports).forEach(([service, port]) => {
      console.log(`   ${service}: ${port}`)
    })

    // Set environment variables
    Object.entries(this.ports.env).forEach(([key, value]) => {
      process.env[key] = value
    })
  }

  async startVite() {
    const port = this.ports.ports.vite
    console.log(`🌐 Starting Vite dev server on port ${port}...`)

    const vite = spawn('npx', ['vite', '--port', port.toString()], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, VITE_PORT: port.toString() },
    })

    this.services.set('vite', vite)
    return vite
  }

  async startElectron() {
    const port = this.ports.ports.electron
    console.log(`⚡ Starting Electron on port ${port}...`)

    const electron = spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ELECTRON_PORT: port.toString() },
    })

    this.services.set('electron', electron)
    return electron
  }

  async startApiServer() {
    const port = this.ports.ports.api
    console.log(`🔌 Starting API server on port ${port}...`)

    // This would start your API server if you have one
    // const api = spawn('node', ['api-server.js'], {
    //   stdio: 'inherit',
    //   shell: true,
    //   env: { ...process.env, API_PORT: port.toString() }
    // });

    console.log(`   API server would start on port ${port} (not implemented)`)
    return null
  }

  async startWebSocketServer() {
    const port = this.ports.ports.websocket
    console.log(`🔌 Starting WebSocket server on port ${port}...`)

    // This would start your WebSocket server if you have one
    // const ws = spawn('node', ['websocket-server.js'], {
    //   stdio: 'inherit',
    //   shell: true,
    //   env: { ...process.env, WS_PORT: port.toString() }
    // });

    console.log(
      `   WebSocket server would start on port ${port} (not implemented)`
    )
    return null
  }

  async startAll() {
    try {
      await this.initialize()

      // Start services in order
      await this.startVite()

      // Wait a moment for Vite to start
      await new Promise(resolve => setTimeout(resolve, 2000))

      await this.startElectron()
      await this.startApiServer()
      await this.startWebSocketServer()

      console.log('✅ All services started successfully!')
      console.log('📊 Service status:')
      this.services.forEach((service, name) => {
        console.log(`   ${name}: ${service ? 'Running' : 'Not implemented'}`)
      })

      // Handle cleanup
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down services...')
        this.shutdown()
      })
    } catch (error) {
      console.error('❌ Error starting services:', error.message)
      this.shutdown()
      process.exit(1)
    }
  }

  shutdown() {
    console.log('🔄 Stopping all services...')
    this.services.forEach((service, name) => {
      if (service && service.kill) {
        console.log(`   Stopping ${name}...`)
        service.kill('SIGTERM')
      }
    })
    console.log('✅ All services stopped')
  }
}

// CLI usage
if (require.main === module) {
  const launcher = new ServiceLauncher()
  launcher.startAll()
}

module.exports = { ServiceLauncher }
