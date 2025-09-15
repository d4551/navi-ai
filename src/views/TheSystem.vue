<!--
THE SYSTEM - Gaming Ecosystem Command Center
Noir-themed system management and performance monitoring
RGB-enhanced controls with ultra-wide gaming analytics dashboard
-->
<template>
  <StandardPageLayout
    page-type="gaming"
    title="THE SYSTEM"
    subtitle="Every operation needs muscle. Welcome to the machine room."
    :title-icon="'ServerIcon-network'"
    content-spacing="normal"
    max-width="xl"
    class="font-sans "
  >
    <!-- Quick Stats Bar -->
    <section class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon power">
          <AppIcon name="PowerIcon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ systemPower.mainSystem ? 'Active' : 'Inactive' }}</div>
          <div class="stat-label">System Status</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon devices">
          <AppIcon name="DeviceTabletIcon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ connectedDevices.filter(d => d.status === 'active').length }}</div>
          <div class="stat-label">Connected Devices</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon health">
          <AppIcon name="HeartIcon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ systemHealth.score }}%</div>
          <div class="stat-label">System Health</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon network">
          <AppIcon name="WifiIcon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ connections.filter(c => c.status === 'connected').length }}/{{ connections.length }}</div>
          <div class="stat-label">Network Status</div>
        </div>
      </div>
    </section>

    <!-- Quick Controls -->
    <section class="controls-section section-card">
      <div class="section-header">
        <h2>System Controls</h2>
        <div class="section-subtitle">Manage power, lighting, audio, and connectivity</div>
      </div>
      <div class="controls-grid responsive-grid--cards-sm">
        <!-- System Power -->
        <div class="control-card glass p-glass-md gap-glass-md rounded-lg neon-interactive">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="PowerIcon" class="rgb-icon" />
            </div>
            <div class="control-info">
              <h3>System Power</h3>
              <p>Manage device power states</p>
            </div>
          </div>
          <div class="control-actions">
            <UnifiedButton
              size="sm"
              :variant="systemPower.mainSystem ? 'primary' : 'glass'"
              @click="toggleMainSystem"
            >
              Main System
            </UnifiedButton>
            <UnifiedButton
              size="sm"
              :variant="systemPower.peripherals ? 'primary' : 'glass'"
              @click="togglePeripherals"
            >
              Peripherals
            </UnifiedButton>
          </div>
        </div>

        <!-- Lighting Control -->
        <div class="control-card glass p-glass-md gap-glass-md rounded-lg neon-interactive">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="LightBulbIcon-multiple" class="rgb-icon" />
            </div>
            <div class="control-info">
              <h3>RGB Lighting</h3>
              <p>Control system lighting effects</p>
            </div>
          </div>
          <div class="lighting-controls">
            <div class="lighting-preset-grid">
              <button 
                v-for="preset in lightingPresets"
                :key="preset.id"
                class="preset-btn"
                :class="{ active: currentLightingPreset === preset.id }"
                @click="setLightingPreset(preset.id)"
              >
                <div class="preset-color" :style="{ background: preset.gradient }">
                  <div class="preset-shimmer"></div>
                </div>
                <span class="preset-name">{{ preset.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Audio Control -->
        <div class="control-card glass p-glass-md gap-glass-md rounded-lg neon-interactive">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="SpeakerWaveIcon" />
            </div>
            <div class="control-info">
              <h3>Audio System</h3>
              <p>Sound devices and levels</p>
            </div>
          </div>
          <div class="audio-controls">
            <div class="volume-control">
              <label>Master Volume</label>
              <input 
                v-model="audioSettings.masterVolume" 
                type="range"
                min="0" 
                max="100"
                class="volume-slider"
                @input="updateMasterVolume"
              >
              <span class="volume-value">{{ audioSettings.masterVolume }}%</span>
            </div>
            <div class="audio-devices">
              <select v-model="audioSettings.selectedDevice" class="device-select glass-input">
                <option v-for="device in audioDevices" :key="device.id" :value="device.id">
                  {{ device.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="control-card glass p-glass-md gap-glass-md rounded-lg neon-interactive">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="mdi-transit-connection" class="rgb-icon" />
            </div>
            <div class="control-info">
              <h3>Connections</h3>
              <p>Device connectivity status</p>
            </div>
          </div>
          <div class="connection-list">
            <div 
              v-for="connection in connections"
              :key="connection.type"
              class="connection-item"
              :class="{ connected: connection.status === 'connected' }"
            >
              <i :class="connection.icon" class="connection-icon"></i>
              <span class="connection-label">{{ connection.type }}</span>
              <div class="connection-status">
                <div class="status-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Device Management -->
    <section class="devices-section glass p-glass-md gap-glass-md rounded-lg">
      <div class="section-header">
        <h2>Connected Devices</h2>
        <div class="section-subtitle">Monitor and manage system hardware</div>
        <div class="section-controls">
          <UnifiedButton color="glass" appearance="outlined" leading-icon="ArrowPathIcon" :class="{ spinning: scanning }" @click="scanDevices">Scan Devices</UnifiedButton>
          <UnifiedButton color="gaming" leading-icon="AdjustmentsVerticalIcon" @click="startCalibration">Calibrate</UnifiedButton>
        </div>
      </div>
      
      <div class="devices-grid responsive-grid--cards-lg">
        <div 
          v-for="device in connectedDevices"
          :key="device.id"
          class="device-card glass p-glass-md gap-glass-md rounded-lg neon-interactive"
          :class="{ active: device.status === 'active', error: device.status === 'error' }"
        >
          <!-- Device Header -->
          <div class="device-header">
            <div class="device-icon">
              <i :class="getDeviceIcon(device.type)" class="device-type-icon"></i>
            </div>
            
            <div class="device-info">
              <h3 class="device-name">{{ device.name }}</h3>
              <p class="device-type">{{ device.type }}</p>
              <div class="device-status-badge" :class="`status-${device.status}`">
                {{ device.status }}
              </div>
            </div>
            
            <div class="device-controls">
              <UnifiedButton
                size="sm"
                :variant="device.status === 'active' ? 'primary' : 'glass'"
                icon-only
                :leading-icon="device.status === 'active' ? 'PauseIcon' : 'PlayIcon'"
                @click="toggleDevice(device.id)"
              />
            </div>
          </div>
          
          <!-- Device Metrics -->
          <div v-if="device.metrics" class="device-metrics">
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Signal</div>
                <div class="signal-bars">
                  <div 
                    v-for="i in 4"
                    :key="i"
                    class="signal-bar"
                    :class="{ active: i <= device.metrics.signalStrength }"
                  ></div>
                </div>
              </div>
              
              <div v-if="device.metrics.batteryLevel !== undefined" class="metric-item">
                <div class="metric-label">Battery</div>
                <div class="metric-value">{{ device.metrics.batteryLevel }}%</div>
                <div class="battery-bar">
                  <div 
                    class="battery-fill"
                    :class="{
                      low: device.metrics.batteryLevel < 30,
                      medium: device.metrics.batteryLevel >= 30 && device.metrics.batteryLevel < 70
                    }"
                    :style="{ width: device.metrics.batteryLevel + '%' }"
                  ></div>
                </div>
              </div>
              
              <div v-if="device.metrics.temperature" class="metric-item">
                <div class="metric-label">Temp</div>
                <div class="metric-value">{{ device.metrics.temperature }}°C</div>
              </div>
            </div>
          </div>
          
          <!-- Device Actions -->
          <div class="device-actions">
            <UnifiedButton color="glass" appearance="outlined" leading-icon="CogIcon" @click="configureDevice(device)">Config</UnifiedButton>
            <UnifiedButton color="glass" appearance="outlined" leading-icon="PlayIcon" @click="testDevice(device)">Test</UnifiedButton>
            <UnifiedButton color="glass" appearance="outlined" leading-icon="DocumentIcon" @click="viewDeviceLogs(device)">Logs</UnifiedButton>
          </div>
        </div>
      </div>
    </section>

    <!-- System Analytics -->
    <section class="analytics-section glass p-glass-md gap-glass-md rounded-lg">
      <div class="section-header">
        <h2>System Analytics</h2>
        <div class="section-subtitle">Performance metrics and system health monitoring</div>
        <div class="section-controls">
          <div class="time-filter">
            <select v-model="analyticsTimeframe" class="unified-input">
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="analytics-grid responsive-grid--cards-md">
        <!-- Performance Chart -->
        <div class="analytics-card glass p-glass-md gap-glass-md rounded-lg analytics-card--large">
          <div class="card-header section-header">
            <h3>
              <AppIcon name="ChartBarSquareIcon" />
              Performance
            </h3>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color cpu"></div>
                <span>CPU</span>
              </div>
              <div class="legend-item">
                <div class="legend-color memory"></div>
                <span>Memory</span>
              </div>
              <div class="legend-item">
                <div class="legend-color network"></div>
                <span>Network</span>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <!-- Simple chart visualization -->
            <div class="chart-area">
              <div class="chart-line cpu-line"></div>
              <div class="chart-line memory-line"></div>
              <div class="chart-line network-line"></div>
            </div>
            <div class="chart-labels">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <!-- Device Status Overview -->
        <div class="analytics-card glass p-glass-md gap-glass-md rounded-lg">
          <div class="card-header section-header">
            <h3>
              <AppIcon name="DeviceTabletIcon" />
              Device Overview
            </h3>
          </div>
          <div class="device-overview">
            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="UsbIcon" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">USB Devices</div>
                <div class="overview-count">{{ deviceCounts.usb }}</div>
              </div>
            </div>
            
            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="DevicePhoneMobileIcon" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">Bluetooth</div>
                <div class="overview-count">{{ deviceCounts.bluetooth }}</div>
              </div>
            </div>
            
            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="mdi-ethernet" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">Network</div>
                <div class="overview-count">{{ deviceCounts.network }}</div>
              </div>
            </div>
            
            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="mdi-speaker" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">Audio</div>
                <div class="overview-count">{{ deviceCounts.audio }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="analytics-card glass p-glass-md gap-glass-md rounded-lg">
          <div class="card-header section-header">
            <h3>
              <AppIcon name="HeartIcon" />
              System Health
            </h3>
            <div class="health-score" :class="getHealthClass(systemHealth.score)">
              {{ systemHealth.score }}/100
            </div>
          </div>
          <div class="health-breakdown">
            <div class="health-item">
              <div class="health-label">Hardware</div>
              <div class="progress progress--xs">
                <div class="progress-bar" :style="{ width: systemHealth.hardware + '%' }"></div>
              </div>
              <span class="health-value">{{ systemHealth.hardware }}%</span>
            </div>
            
            <div class="health-item">
              <div class="health-label">Connectivity</div>
              <div class="progress progress--xs">
                <div class="progress-bar" :style="{ width: systemHealth.connectivity + '%' }"></div>
              </div>
              <span class="health-value">{{ systemHealth.connectivity }}%</span>
            </div>
            
            <div class="health-item">
              <div class="health-label">Performance</div>
              <div class="progress progress--xs">
                <div class="progress-bar" :style="{ width: systemHealth.performance + '%' }"></div>
              </div>
              <span class="health-value">{{ systemHealth.performance }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Calibration Modal -->
    <Teleport to="body">
      <div v-if="calibrationModal.show" class="calibration-modal-overlay" @click="closeCalibration">
        <div class="calibration-modal unified-modal" @click.stop>
          <div class="modal-header">
            <h2>System Calibration</h2>
            <button class="close-btn" @click="closeCalibration">
              <AppIcon name="XMarkIcon" />
            </button>
          </div>
          
          <div class="modal-content">
            <div class="calibration-steps">
              <div 
                v-for="(step, index) in calibrationSteps"
                :key="index"
                class="calibration-step"
                :class="{ active: calibrationModal.currentStep === index,
                          completed: calibrationModal.currentStep > index
                }"
              >
                <div class="step-indicator">
                  <AppIcon :name="calibrationModal.currentStep > index ? 'CheckIcon' : `mdi-numeric-${index + 1}`" />
                </div>
                <div class="step-content">
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="calibrationModal.currentStep < calibrationSteps.length" class="calibration-progress">
              <div class="progress progress--sm">
                <div 
                  class="progress-bar" 
                  :style="{ width: (calibrationModal.currentStep / calibrationSteps.length) * 100 + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                Step {{ calibrationModal.currentStep + 1 }} of {{ calibrationSteps.length }}
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <UnifiedButton color="glass" appearance="outlined" :disabled="calibrationModal.inProgress" @click="closeCalibration">Cancel</UnifiedButton>
            <UnifiedButton v-if="calibrationModal.currentStep < calibrationSteps.length" color="gaming" :disabled="calibrationModal.inProgress" :loading="calibrationModal.inProgress" leading-icon="ArrowRightIcon" @click="nextCalibrationStep">
              {{ calibrationModal.inProgress ? 'Processing...' : 'Next' }}
            </UnifiedButton>
            <UnifiedButton v-else color="gaming" leading-icon="CheckIcon" @click="completeCalibration">Complete</UnifiedButton>
          </div>
        </div>
      </div>
    </Teleport>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { AdjustmentsVerticalIcon, ArrowPathIcon, ArrowRightIcon, ChartBarSquareIcon, CheckIcon, CogIcon, DeviceTabletIcon, DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { HeartIcon, PlayIcon } from '@heroicons/vue/24/solid'

import AppIcon from '@/components/ui/AppIcon.vue'

import { ref, reactive, onMounted, onUnmounted } from 'vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import { useRouter } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Composables
const __router = useRouter()
// Theme is globally applied; no per-page theme binding needed
const _responsive = useResponsive()

// State
const scanning = ref(false)
const analyticsTimeframe = ref('24h')

// System power states
const systemPower = reactive({
  mainSystem: true,
  peripherals: true
})

// Audio settings
const audioSettings = reactive({
  masterVolume: 75,
  selectedDevice: 'speakers'
})

const audioDevices = [
  { id: 'speakers', name: 'Gaming Speakers' },
  { id: 'headphones', name: 'Wireless Headphones' },
  { id: 'usb-mic', name: 'USB Microphone' }
]

// Lighting presets
const currentLightingPreset = ref('gaming')
const lightingPresets = [
  { id: 'off', name: 'Off', gradient: '#000000' },
  { id: 'gaming', name: 'Gaming', gradient: 'linear-gradient(45deg, #ff0080, #00ff80, #8000ff)' },
  { id: 'work', name: 'Work', gradient: 'linear-gradient(45deg, #4f46e5, #06b6d4)' },
  { id: 'relax', name: 'Relax', gradient: 'linear-gradient(45deg, #8b5cf6, #ec4899)' },
  { id: 'focus', name: 'Focus', gradient: 'linear-gradient(45deg, #10b981, #3b82f6)' }
]

// Connection types
const connections = reactive([
  { type: 'USB', icon: 'UsbIcon', status: 'connected' },
  { type: 'Bluetooth', icon: 'DevicePhoneMobileIcon', status: 'connected' },
  { type: 'WiFi', icon: 'WifiIcon', status: 'connected' },
  { type: 'Ethernet', icon: 'mdi-ethernet', status: 'disconnected' }
])

// Connected devices
const connectedDevices = reactive([
  {
    id: 'mouse-001',
    name: 'Gaming Mouse Pro',
    type: 'Mouse',
    status: 'active',
    metrics: {
      signalStrength: 4,
      batteryLevel: 87,
      temperature: 32
    }
  },
  {
    id: 'keyboard-001',
    name: 'Mechanical Keyboard',
    type: 'Keyboard',
    status: 'active',
    metrics: {
      signalStrength: 3,
      batteryLevel: undefined,
      temperature: 28
    }
  },
  {
    id: 'headset-001',
    name: 'Wireless Gaming Headset',
    type: 'Audio',
    status: 'active',
    metrics: {
      signalStrength: 3,
      batteryLevel: 62,
      temperature: 25
    }
  },
  {
    id: 'webcam-001',
    name: 'HD Webcam',
    type: 'Camera',
    status: 'inactive',
    metrics: {
      signalStrength: 4,
      batteryLevel: undefined,
      temperature: 30
    }
  }
])

// System health
const systemHealth = reactive({
  overall: 'healthy',
  score: 94,
  hardware: 96,
  connectivity: 92,
  performance: 94,
  connectedDevices: 3,
  totalDevices: 4
})

// Device counts
const deviceCounts = reactive({
  usb: 2,
  bluetooth: 3,
  network: 1,
  audio: 2
})

// Calibration modal
const calibrationModal = reactive({
  show: false,
  currentStep: 0,
  inProgress: false
})

const calibrationSteps = [
  {
    title: 'Initialize Hardware',
    description: 'Detecting and initializing all connected devices'
  },
  {
    title: 'Test Connections',
    description: 'Verifying communication with each device'
  },
  {
    title: 'Audio Calibration',
    description: 'Calibrating audio levels and testing microphone'
  },
  {
    title: 'Input Devices',
    description: 'Testing mouse sensitivity and keyboard response'
  },
  {
    title: 'Final Verification',
    description: 'Running comprehensive system check'
  }
]

// Methods
const toggleMainSystem = () => {
  systemPower.mainSystem = !systemPower.mainSystem
  console.log('Main system:', systemPower.mainSystem ? 'ON' : 'OFF')
}

const togglePeripherals = () => {
  systemPower.peripherals = !systemPower.peripherals
  console.log('Peripherals:', systemPower.peripherals ? 'ON' : 'OFF')
}

const setLightingPreset = (presetId: string) => {
  currentLightingPreset.value = presetId
  console.log('Lighting preset changed to:', presetId)
}

const updateMasterVolume = () => {
  console.log('Master volume:', audioSettings.masterVolume)
}

const scanDevices = async () => {
  scanning.value = true
  try {
    // Simulate device scanning
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Device scan completed')
  } finally {
    scanning.value = false
  }
}

const toggleDevice = (deviceId: string) => {
  const device = connectedDevices.find(d => d.id === deviceId)
  if (device) {
    device.status = device.status === 'active' ? 'inactive' : 'active'
    console.log(`Device ${deviceId} is now ${device.status}`)
  }
}

const configureDevice = (device: any) => {
  console.log('Configuring device:', device.name)
  // In real implementation, would open device configuration
}

const testDevice = (device: any) => {
  console.log('Testing device:', device.name)
  // In real implementation, would run device test
}

const viewDeviceLogs = (device: any) => {
  console.log('Viewing logs for:', device.name)
  // In real implementation, would show device logs
}

const startCalibration = () => {
  calibrationModal.show = true
  calibrationModal.currentStep = 0
}

const closeCalibration = () => {
  calibrationModal.show = false
  calibrationModal.currentStep = 0
  calibrationModal.inProgress = false
}

const nextCalibrationStep = async () => {
  calibrationModal.inProgress = true
  
  try {
    // Simulate calibration step
    await new Promise(resolve => setTimeout(resolve, 1500))
    calibrationModal.currentStep++
  } finally {
    calibrationModal.inProgress = false
  }
}

const completeCalibration = () => {
  console.log('Calibration completed')
  closeCalibration()
}

// Utility functions  
const _getHealthIcon = (health: string) => {
  const icons = {
    healthy: 'CheckIcon-circle-outline',
    warning: 'mdi-alert-circle-outline',
    error: 'XMarkIcon-circle-outline'
  }
  return icons[health] || 'QuestionMarkCircleIcon-circle'
}

const getHealthClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

const getDeviceIcon = (type: string) => {
  const icons = {
    Mouse: 'mdi-mouse',
    Keyboard: 'KeyIconboard',
    Audio: 'mdi-headphones',
    Camera: 'CameraIcon',
    Storage: 'mdi-harddisk',
    Network: 'mdi-ethernet'
  }
  return icons[type] || 'mdi-devices'
}

// Initialize system monitoring
let healthCheckInterval: NodeJS.Timeout

onMounted(() => {
  // Start health monitoring
  healthCheckInterval = setInterval(() => {
    // In real implementation, would check actual system health
    console.log('System health check...')
  }, 30000)
})

onUnmounted(() => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }
})
</script>

<style scoped>
/* THE SYSTEM - Enhanced Glassmorphic Styling with Master Design System */

/* Quick Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 6%, transparent) 0%,
    color-mix(in srgb, var(--color-gaming-500) 4%, transparent) 100%);
  opacity: 0;
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border-color: var(--glass-border-hover);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  position: relative;
  z-index: 1;
}

.stat-icon.power {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
  color: white;
}

.stat-icon.devices {
  background: linear-gradient(135deg, var(--color-gaming-500) 0%, var(--color-gaming-700) 100%);
  color: white;
}

.stat-icon.health {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-icon.network {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin-bottom: var(--spacing-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.the-system {
  min-height: 100vh;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Header Styling */
/* Header handled by PageHeader */

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-8);
}

.brand-section h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.rgb-icon {
  background: linear-gradient(45deg, #ff0080, #00ff80, #8000ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rgbPulse 3s ease-in-out infinite alternate;
}

.text-gradient-rgb {
  background: linear-gradient(45deg, var(--text-primary-600), var(--color-primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle-glass {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: var(--spacing-2) 0 0;
}

/* System Status */
.system-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--surface-glass);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-xl);
  position: relative;
  transition: all var(--duration-normal);
}

.system-status.connected {
  border-color: var(--color-gaming-500);
  box-shadow: var(--shadow-glow-gaming);
}

.status-ring {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  color: var(--text-tertiary);
}

.system-status.connected .status-ring {
  color: var(--color-gaming-500);
}

.status-pulse {
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-gaming-500);
  animation: pulse-ring 2s ease-out infinite;
}

.status-label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  font-size: var(--font-size-lg);
}

.status-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Controls Section - Enhanced glassmorphic styling */
.controls-section {
  margin-bottom: var(--spacing-8);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.controls-grid {
  margin-top: var(--spacing-6);
}

/* Control cards with enhanced glassmorphic effects */
.control-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.control-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 8%, transparent) 0%,
    color-mix(in srgb, var(--color-gaming-500) 6%, transparent) 100%);
  opacity: 0;
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  border-color: var(--glass-border-hover);
}

.control-card:hover::before {
  opacity: 1;
}

.control-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.control-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.control-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent),
    color-mix(in srgb, var(--color-gaming-500) 8%, transparent));
  opacity: 0.6;
  transition: opacity var(--duration-normal);
}

.control-card:hover .control-icon::before {
  opacity: 0.8;
}

.control-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1);
}

.control-info p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Control Actions */
.control-actions {
  display: flex;
  gap: var(--spacing-2);
}

.control-btn {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: var(--radius-md);
  color: var(--control-fg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.control-btn:hover {
  background: var(--control-hover-bg);
  color: var(--control-hover-fg);
  border-color: var(--control-border);
  filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--color-primary-500) 18%, transparent));
}

.control-btn.active {
  background: var(--control-active-bg);
  color: var(--control-active-fg);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, var(--control-border));
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

/* Lighting Controls */
.lighting-preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--spacing-3);
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
}

.preset-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 6%, transparent),
    color-mix(in srgb, var(--color-gaming-500) 4%, transparent));
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.preset-btn:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary-500) 12%, transparent);
}

.preset-btn:hover::before {
  opacity: 1;
}

.preset-btn.active {
  border-color: var(--color-primary-500);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary-500) 20%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 10%, transparent);
}

.preset-btn.active::before {
  opacity: 0.8;
}

.preset-color {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-base);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preset-shimmer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all var(--duration-normal);
}

.preset-btn:hover .preset-shimmer {
  width: 100%;
  height: 100%;
}

.preset-name {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
}

/* Audio Controls */
.audio-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.volume-control {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.volume-control label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.volume-slider {
  width: 100%;
  height: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-sm);
  outline: none;
  appearance: none;
  position: relative;
}

.volume-slider::-webkit-slider-track {
  background: transparent;
  height: 6px;
  border-radius: var(--radius-sm);
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-gaming-500));
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 25%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 20%, transparent);
  transition: all var(--duration-fast);
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.volume-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
  text-align: center;
}

.device-select {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast);
  position: relative;
}

.device-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

.device-select:hover {
  border-color: var(--glass-border-hover);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

/* Connection List */
.connection-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.connection-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.connection-item.connected {
  background: rgba(0, 255, 128, 0.05);
}

.connection-icon {
  font-size: var(--font-size-lg);
  color: var(--text-tertiary);
  width: 20px;
}

.connection-item.connected .connection-icon {
  color: #00ff80;
}

.connection-label {
  flex: 1;
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
}

.connection-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--text-tertiary);
  position: relative;
}

.connection-item.connected .status-dot {
  background: #00ff80;
  box-shadow: 0 0 10px rgba(0, 255, 128, 0.5);
  animation: pulse-green 2s infinite;
}

.connection-item.connected .status-dot::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid #00ff80;
  animation: pulse-ring 2s infinite;
  opacity: 0;
}

@keyframes pulse-green {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(0, 255, 128, 0.4), 0 0 10px rgba(0, 255, 128, 0.5); 
  }
  50% { 
    box-shadow: 0 0 0 8px rgba(0, 255, 128, 0), 0 0 10px rgba(0, 255, 128, 0.5); 
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Devices Section - Enhanced glassmorphic styling */
.devices-section {
  margin-bottom: var(--spacing-8);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-b: 1px solid var(--border-base);
  gap: var(--spacing-4);
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-1);
  line-height: 1.5;
}

.section-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
  line-height: 1.2;
}

.section-header > div:first-child {
  flex: 1;
  min-width: 0;
}

.section-controls {
  display: flex;
  gap: var(--spacing-3);
}

.refresh-btn,
.calibrate-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.refresh-btn {
  background: transparent;
  border: 1px solid var(--border-base);
  color: var(--text-primary-600);
}

.refresh-btn:hover {
  background: var(--surface-glass);
  border-color: var(--color-primary-300);
}

.calibrate-btn {
  background: var(--color-primary-500);
  border: 1px solid var(--color-primary-500);
  color: white;
}

.calibrate-btn:hover {
  background: var(--color-primary-600);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Devices Grid - Uses responsive-grid utilities */
.devices-grid {
  margin-top: var(--spacing-6);
}

/* Device cards with enhanced glassmorphic effects */
.device-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  border-color: var(--glass-border-hover);
}

.device-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.device-card.active::before {
  background: linear-gradient(90deg, var(--color-gaming-500), var(--color-primary-700));
  opacity: 1;
}

.device-card.error::before {
  background: var(--color-error-500);
  opacity: 1;
}

.device-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.device-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.device-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-gaming-500) 8%, transparent),
    color-mix(in srgb, var(--color-primary-500) 6%, transparent));
  opacity: 0.4;
  transition: opacity var(--duration-normal);
}

.device-card:hover .device-icon::before {
  opacity: 0.6;
}

.device-type-icon {
  font-size: var(--font-size-xl);
  color: var(--color-primary-500);
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1);
}

.device-type {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--spacing-2);
}

.device-status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-active {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--text-success-600);
}

.status-inactive {
  background: var(--surface-elevated);
  color: var(--text-tertiary);
}

.status-error {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--text-error);
}

:global([data-theme="dark"]) .status-active {
  background: color-mix(in srgb, var(--color-success) 25%, transparent);
  color: var(--text-success-600);
}

:global([data-theme="dark"]) .status-error {
  background: color-mix(in srgb, var(--color-error) 25%, transparent);
  color: var(--text-error);
}

/* Device Metrics */
.device-metrics {
  padding: var(--spacing-4) 0;
  border-t: 1px solid var(--border-base);
  border-b: 1px solid var(--border-base);
  margin: var(--spacing-5) 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

.metric-item {
  text-align: center;
}

.battery-bar {
  width: 100%;
  height: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-top: var(--spacing-1);
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

/* Signal Bars */
.signal-bars {
  display: flex;
  gap: var(--spacing-0-5);
  align-items: flex-end;
}

.signal-bar {
  width: 5px;
  height: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 2px;
  transition: all var(--duration-fast);
  position: relative;
  overflow: hidden;
}

.signal-bar:nth-child(1) { height: 6px; }
.signal-bar:nth-child(2) { height: 8px; }
.signal-bar:nth-child(3) { height: 10px; }
.signal-bar:nth-child(4) { height: 12px; }

.signal-bar.active {
  background: linear-gradient(to top, var(--color-gaming-500), var(--color-gaming-400));
  border-color: var(--color-gaming-500);
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-gaming-500) 30%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 20%, transparent);
}

.signal-bar.active::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, transparent, color-mix(in srgb, var(--color-gaming-500) 40%, transparent));
}

/* Battery Indicator */
.battery-indicator {
  position: relative;
  width: 36px;
  height: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.battery-indicator::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 6px;
  background: var(--glass-border);
  border-radius: 0 1px 1px 0;
}

.battery-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-gaming-500) 0%, var(--color-gaming-400) 100%);
  border-radius: var(--radius-sm);
  transition: width var(--duration-normal);
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-gaming-500) 25%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 15%, transparent);
  position: relative;
}

.battery-fill.low {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 0 6px color-mix(in srgb, #ef4444 25%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 15%, transparent);
}

.battery-fill.medium {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 0 6px color-mix(in srgb, #f59e0b 25%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 15%, transparent);
}

.battery-fill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-gaming-500) 30%, transparent));
  border-radius: inherit;
}

.battery-text {
  position: absolute;
  font-size: 8px;
  color: var(--text-primary-600);
  font-weight: var(--font-weight-bold);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* Device Actions */
.device-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  color: var(--text-primary-600);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.action-btn:hover {
  background: var(--surface-glass);
  border-color: var(--color-primary-300);
}

/* Analytics Section - Enhanced glassmorphic styling */
.analytics-section {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Analytics Grid - Uses responsive-grid utilities */
.analytics-grid {
  margin-top: var(--spacing-6);
}

/* Analytics cards with enhanced glassmorphic effects */
.analytics-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal);
}

.analytics-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 4%, transparent),
    color-mix(in srgb, var(--color-gaming-500) 3%, transparent));
  opacity: 0;
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 12%, transparent);
  border-color: var(--glass-border-hover);
}

.analytics-card:hover::before {
  opacity: 1;
}

.analytics-card--large {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-5);
  gap: var(--spacing-4);
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

/* Chart */
.chart-legend {
  display: flex;
  gap: var(--spacing-3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
}

.legend-color.cpu { background: #ff0080; }
.legend-color.memory { background: #00ff80; }
.legend-color.network { background: #8000ff; }

.chart-container {
  position: relative;
  height: 120px;
  margin-top: var(--spacing-4);
}

.chart-area {
  position: relative;
  height: 100px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.chart-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  opacity: 0.8;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.cpu-line { 
  background: linear-gradient(to top, transparent, #ff0080);
  height: 75%;
}

.memory-line { 
  background: linear-gradient(to top, transparent, #00ff80);
  height: 60%;
  opacity: 0.6;
}

.network-line { 
  background: linear-gradient(to top, transparent, #8000ff);
  height: 45%;
  opacity: 0.4;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* Device Overview */
.device-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.overview-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
  position: relative;
  overflow: hidden;
}

.overview-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 6%, transparent),
    color-mix(in srgb, var(--color-gaming-500) 4%, transparent));
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.overview-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  border-color: var(--glass-border-hover);
}

.overview-item:hover::before {
  opacity: 1;
}

.overview-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.overview-device-icon {
  font-size: var(--font-size-lg);
  color: var(--color-primary-500);
}

.overview-info {
  flex: 1;
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
}

.overview-count {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

/* Health Score */
.health-score {
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.health-score.excellent {
  background: #e8f5e8;
  color: #1b5e20;
}

.health-score.good {
  background: #e0f2fe;
  color: #01579b;
}

.health-score.fair {
  background: #fff3e0;
  color: #e65100;
}

.health-score.poor {
  background: #ffebee;
  color: #c62828;
}

:global([data-theme="dark"]) .health-score.excellent {
  background: #1b5e20;
  color: #e8f5e8;
}

:global([data-theme="dark"]) .health-score.good {
  background: #01579b;
  color: #e0f2fe;
}

:global([data-theme="dark"]) .health-score.fair {
  background: #e65100;
  color: #fff3e0;
}

:global([data-theme="dark"]) .health-score.poor {
  background: #c62828;
  color: #ffebee;
}

/* Health Breakdown */
.health-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.health-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.health-label {
  flex: 0 0 100px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Use global .progress utilities for health bars */

.health-value {
  flex: 0 0 40px;
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

/* Calibration Modal */
.calibration-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.calibration-modal {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: var(--radius-2xl);
  max-width: var(--page-narrow-width);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 24px 48px color-mix(in srgb, var(--color-primary-500) 20%, transparent),
              inset 0 1px 0 color-mix(in srgb, white 10%, transparent);
  position: relative;
}

.calibration-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 5%, transparent),
    color-mix(in srgb, var(--color-gaming-500) 3%, transparent));
  opacity: 0.6;
  pointer-events: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-b: 1px solid var(--border-base);
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.close-btn:hover {
  background: var(--surface-glass);
  color: var(--text-primary-600);
}

.modal-content {
  padding: var(--spacing-6);
  max-height: 60vh;
  overflow-y: auto;
}

/* Calibration Steps */
.calibration-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-8);
}

.calibration-step {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal);
}

.calibration-step.active {
  background: var(--surface-glass);
  border: 1px solid var(--color-primary-300);
}

.calibration-step.completed {
  opacity: 0.7;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.calibration-step.active .step-indicator {
  background: var(--color-primary-500);
  color: white;
}

.calibration-step.completed .step-indicator {
  background: #22c55e;
  color: white;
}

.step-content h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1);
}

.step-content p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Calibration Progress */
.calibration-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);
}

.progress {
  height: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.progress--xs {
  height: 6px;
}

.progress--sm {
  height: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    var(--color-primary-500) 0%,
    var(--color-gaming-500) 50%,
    var(--color-primary-600) 100%);
  border-radius: var(--radius-sm);
  transition: width var(--duration-normal);
  position: relative;
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 15%, transparent);
}

.progress-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%,
    color-mix(in srgb, white 10%, transparent) 50%,
    transparent 100%);
  border-radius: inherit;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent,
    color-mix(in srgb, var(--color-primary-500) 20%, transparent));
  border-radius: inherit;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-t: 1px solid var(--border-base);
}

.modal-actions .glass-button-outline,
.modal-actions .glass-button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
  cursor: pointer;
}

.modal-actions .glass-button-outline {
  background: transparent;
  border: 1px solid var(--border-base);
  color: var(--text-primary-600);
}

.modal-actions .glass-button-primary {
  background: var(--color-primary-500);
  border: 1px solid var(--color-primary-500);
  color: white;
  flex: 1;
}

.modal-actions .glass-button-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
@keyframes rgbPulse {
  0% {
    background: linear-gradient(45deg, #ff0080, #00ff80, #8000ff);
  }
  50% {
    background: linear-gradient(45deg, #8000ff, #ff0080, #00ff80);
  }
  100% {
    background: linear-gradient(45deg, #00ff80, #8000ff, #ff0080);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes mdi-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Enhanced Responsive Design */
@media (max-width: var(--breakpoint-md)) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3);
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-4);
  }
  
  .section-controls {
    justify-content: flex-start;
    gap: var(--spacing-3);
  }
  
  .device-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3);
  }
  
  .device-overview {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
  
  .lighting-preset-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: var(--spacing-2);
  }
  
  .calibration-modal {
    margin: var(--spacing-4);
    max-height: calc(100vh - var(--spacing-8));
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .stats-bar {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
  
  .modal-actions {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .overview-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-2);
  }
  
  .control-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
  
  .lighting-preset-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-2);
  }
}

/* Additional utility classes */
/* Use unified-input class instead */
.unified-input {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  color: var(--text-primary-600);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast);
  position: relative;
}

.unified-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent),
              0 4px 16px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.unified-input:hover {
  border-color: var(--glass-border-hover);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary-500) 8%, transparent);
}

.glass-section {
  /* Base glass section styling - already applied above */
}
</style>
