#!/usr/bin/env node
/**
 * Test Port Manager
 * Tests the port management system to ensure unique port assignments
 */

const { getAllServicePorts, PortManager } = require('./port-manager.cjs');

async function testPortManager() {
  console.log('🧪 Testing Port Manager System\n');

  try {
    // Test 1: Get all service ports
    console.log('1️⃣ Testing service port assignment...');
    const result = await getAllServicePorts();
    
    console.log('   Assigned ports:');
    Object.entries(result.ports).forEach(([service, port]) => {
      console.log(`   ${service}: ${port}`);
    });
    
    console.log('   Environment variables:');
    Object.entries(result.env).forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);
    });
    
    // Test 2: Verify port uniqueness
    console.log('\n2️⃣ Testing port uniqueness...');
    const ports = Object.values(result.ports);
    const uniquePorts = new Set(ports);
    
    if (ports.length === uniquePorts.size) {
      console.log('   ✅ All ports are unique');
    } else {
      console.log('   ❌ Duplicate ports found');
    }
    
    // Test 3: Test port ranges
    console.log('\n3️⃣ Testing port ranges...');
    const ranges = {
      vite: { min: 3000, max: 3999 },
      electron: { min: 4000, max: 4999 },
      api: { min: 5000, max: 5999 },
      websocket: { min: 6000, max: 6999 }
    };
    
    Object.entries(result.ports).forEach(([service, port]) => {
      const range = ranges[service];
      if (range && port >= range.min && port <= range.max) {
        console.log(`   ✅ ${service} port ${port} is in range ${range.min}-${range.max}`);
      } else {
        console.log(`   ❌ ${service} port ${port} is outside expected range`);
      }
    });
    
    // Test 4: Test multiple instances
    console.log('\n4️⃣ Testing multiple port manager instances...');
    const manager1 = new PortManager();
    const manager2 = new PortManager();
    
    const port1 = await manager1.findAvailablePort('vite');
    const port2 = await manager2.findAvailablePort('vite');
    
    if (port1 !== port2) {
      console.log(`   ✅ Different instances got different ports: ${port1}, ${port2}`);
    } else {
      console.log(`   ⚠️  Different instances got same port: ${port1}`);
    }
    
    console.log('\n🎉 Port Manager test completed successfully!');
    
  } catch (error) {
    console.error('❌ Port Manager test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testPortManager();
}

module.exports = { testPortManager };
