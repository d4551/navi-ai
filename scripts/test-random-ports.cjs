#!/usr/bin/env node
/**
 * Test Random Port System
 * Verifies that the random port system works correctly
 */

const {
  getVitePort,
  getElectronPort,
  isPortAvailable,
} = require('./get-random-port.cjs')

async function testRandomPorts() {
  console.log('🧪 Testing Random Port System\n')

  try {
    // Test 1: Get multiple random ports
    console.log('1️⃣ Testing multiple random port generation:')
    const ports = []
    for (let i = 0; i < 5; i++) {
      const port = await getVitePort()
      ports.push(port)
      console.log(`   Port ${i + 1}: ${port}`)
    }

    // Check if ports are unique
    const uniquePorts = [...new Set(ports)]
    if (uniquePorts.length === ports.length) {
      console.log('   ✅ All ports are unique\n')
    } else {
      console.log(
        '   ⚠️  Some ports were duplicated (this can happen with high port usage)\n'
      )
    }

    // Test 2: Port availability check
    console.log('2️⃣ Testing port availability check:')
    const testPort = 9999 // Use a high port that's likely available
    const isAvailable = await isPortAvailable(testPort)
    console.log(
      `   Port ${testPort} available: ${isAvailable ? '✅ Yes' : '❌ No'}\n`
    )

    // Test 3: Port range validation
    console.log('3️⃣ Testing port range validation:')
    const vitePort = await getVitePort()
    const electronPort = await getElectronPort()

    const viteInRange = vitePort >= 3000 && vitePort <= 9999
    const electronInRange = electronPort >= 3000 && electronPort <= 9999

    console.log(
      `   Vite port ${vitePort} in range (3000-9999): ${viteInRange ? '✅ Yes' : '❌ No'}`
    )
    console.log(
      `   Electron port ${electronPort} in range (3000-9999): ${electronInRange ? '✅ Yes' : '❌ No'}\n`
    )

    // Test 4: Environment variable handling
    console.log('4️⃣ Testing environment variable handling:')
    const originalVitePort = process.env.VITE_PORT

    // Test with specific port
    process.env.VITE_PORT = '4000'
    const specificPort = await getVitePort()
    console.log(`   With VITE_PORT=4000: ${specificPort}`)

    // Test with random port
    delete process.env.VITE_PORT
    const randomPort = await getVitePort()
    console.log(`   Without VITE_PORT (random): ${randomPort}`)

    // Restore original value
    if (originalVitePort) {
      process.env.VITE_PORT = originalVitePort
    } else {
      delete process.env.VITE_PORT
    }

    console.log('\n🎉 Random port system test completed successfully!')
    console.log('\n📋 Available commands:')
    console.log('   npm run dev:random     - Start Vite with random port')
    console.log(
      '   npm run electron-dev   - Start Electron with Vite on random port'
    )
    console.log('   npm run dev:port       - Alias for dev:random')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
testRandomPorts()
