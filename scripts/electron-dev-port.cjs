#!/usr/bin/env node
/**
 * Electron development with random port (strict mode)
 * Starts Vite dev server and Electron on random available ports with strict port checking
 */

const { spawn } = require('child_process')
const { getVitePort, getElectronPort } = require('./port-manager.cjs')

async function startElectronDevPort() {
  try {
    console.log('🔍 Finding available port for Vite...')
    const port = await getVitePort()

    console.log(`🚀 Starting Vite dev server on port ${port} (strict mode)`)
    console.log(`📱 Local: http://localhost:${port}`)
    console.log(`🌐 Network: http://0.0.0.0:${port}`)

    // Set environment variable for Vite
    process.env.VITE_PORT = port.toString()

    // Start concurrently with Vite (strict port) and Electron
    const concurrently = spawn(
      'concurrently',
      [
        `"npx vite --port ${port} --strictPort"`,
        `"wait-on http://127.0.0.1:${port} && electron ."`,
      ],
      {
        stdio: 'inherit',
        shell: true,
      }
    )

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...')
      concurrently.kill('SIGINT')
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development servers...')
      concurrently.kill('SIGTERM')
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Error starting Electron dev:', error.message)
    process.exit(1)
  }
}

startElectronDevPort()
